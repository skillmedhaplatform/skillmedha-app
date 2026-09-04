import { useState, useEffect, useRef, useCallback } from "react";
import io from "socket.io-client";
import AgoraRTC from "agora-rtc-sdk-ng";
import axios from "axios";

const useProctoringProctor = ({
  token,
  socketServerUrl = "http://localhost:2222",
  proctoringServerUrl = "http://localhost:4334",
  companyOrg,
}) => {
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [activeSessions, setActiveSessions] = useState([]);
  const [joinedSessions, setJoinedSessions] = useState([]);
  const [violations, setViolations] = useState([]);
  const [sessionSummary, setSessionSummary] = useState(null);

  const socket = useRef(null);
  const agoraClients = useRef(new Map());
  const joinedSessionsRef = useRef(new Map());

  // ✅ Socket connection setup
  useEffect(() => {
    if (token) {
      socket.current = io(socketServerUrl, {
        auth: { token },
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      });

      socket.current.on("connect", () => {
        setConnectionStatus("connected");
      });

      socket.current.on("disconnect", (reason) => {
        setConnectionStatus("disconnected");
      });

      socket.current.on("violationAlert", (data) => {
        setViolations((prev) => [data, ...prev.slice(0, 49)]);
      });

      socket.current.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        setConnectionStatus("error");
      });

      return () => {
        if (socket.current) {
          socket.current.disconnect();
        }
      };
    }
  }, [token, socketServerUrl]);

  // ✅ Helper function to update joined sessions safely
  const updateJoinedSessions = useCallback(() => {
    const sessionsArray = Array.from(joinedSessionsRef.current.values());
    setJoinedSessions(sessionsArray);
  }, []);

  // ✅ Fetch active sessions (doesn't touch joined sessions)
  const fetchActiveSessions = useCallback(
    async (filters = {}) => {
      try {
        const params = new URLSearchParams();

        if (filters.userType) params.append("userType", filters.userType);
        if (filters.sortBy) params.append("sortBy", filters.sortBy);
        if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);
        if (filters.limit) params.append("limit", filters.limit);
        if (filters.offset) params.append("offset", filters.offset);
        if (filters.jobId) params.append("jobId", filters.jobId);
        if (companyOrg) params.append("companyOrg", companyOrg);

        const response = await axios.get(
          `${proctoringServerUrl}/agora/active-sessions?${params.toString()}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000,
          }
        );

        if (response.data.success) {
          setActiveSessions(response.data.data || []);
          setSessionSummary(response.data.summary || null);
          return response.data;
        } else {
          throw new Error(response.data.error || "Failed to fetch sessions");
        }
      } catch (error) {
        console.error("❌ Failed to fetch active sessions:", error);
        throw error;
      }
    },
    [proctoringServerUrl, token, companyOrg]
  );

  // ✅ COMPLETELY REWRITTEN: Enhanced joinSession with proper video handling
  const joinSession = useCallback(
    async (sessionId, sessionCompanyOrg = companyOrg) => {
      try {
        // Prevent duplicate joins
        if (agoraClients.current.has(sessionId)) {
          return;
        }

        const requestBody = {
          sessionId,
          userType: "proctor",
        };

        if (sessionCompanyOrg) {
          requestBody.companyOrg = sessionCompanyOrg;
        }

        const response = await axios.post(
          `${proctoringServerUrl}/agora/join-session`,
          requestBody,
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 15000,
          }
        );

        if (!response.data.success) {
          throw new Error(response.data.error);
        }

        const sessionData = response.data;

        // ✅ CRITICAL: Add to joined sessions IMMEDIATELY
        const sessionObj = {
          ...sessionData,
          sessionId,
          remoteUsers: [],
          joinedAt: new Date(),
        };

        joinedSessionsRef.current.set(sessionId, sessionObj);
        updateJoinedSessions();

        // Create Agora client with enhanced settings
        const agoraClient = AgoraRTC.createClient({
          mode: "rtc",
          codec: "vp8",
        });

        // ✅ ENHANCED: User published event with comprehensive debugging
        agoraClient.on("user-published", async (user, mediaType) => {
          try {
            // ✅ CRITICAL: Subscribe with error handling
            await agoraClient.subscribe(user, mediaType);

            if (mediaType === "video") {
              if (!user.videoTrack) {
                console.error("❌ No video track received after subscription!");
                return;
              }

              // Update session state with video user
              const session = joinedSessionsRef.current.get(sessionId);
              if (session) {
                const existingIndex = session.remoteUsers.findIndex(
                  (u) => u.uid === user.uid
                );
                if (existingIndex >= 0) {
                  session.remoteUsers[existingIndex] = { ...user };
                } else {
                  session.remoteUsers.push({ ...user });
                }

                joinedSessionsRef.current.set(sessionId, { ...session });
                updateJoinedSessions();
              }

              // ✅ CRITICAL: Enhanced video playing with comprehensive retry logic
              const playVideoWithRetries = async (attempt = 1) => {
                const containerId = `video-${sessionId}-${user.uid}`;
                const container = document.getElementById(containerId);

                if (container && user.videoTrack) {
                  try {
                    // ✅ CRITICAL: Clear container first to avoid conflicts
                    container.innerHTML = "";

                    // Play video track
                    await user.videoTrack.play(containerId);

                    // ✅ NEW: Verify video element is created and functional
                    setTimeout(() => {
                      const videoElement = container.querySelector("video");
                      if (videoElement) {
                        // ✅ Force play if needed
                        if (videoElement.paused && !videoElement.ended) {
                          videoElement
                            .play()
                            .catch(e => 
                            );
                        }
                      } else {
                        console.error(
                          "❌ No video element created after play() call"
                        );
                        if (attempt < 3) {
                          setTimeout(
                            () => playVideoWithRetries(attempt + 1),
                            2000
                          );
                        }
                      }
                    }, 2000);
                  } catch (playError) {
                    console.error(`❌ Video play error (attempt ${attempt}):`, {
                      error: playError.message,
                      code: playError.code,
                      name: playError.name,
                    });

                    // Retry up to 5 times with increasing delays
                    if (attempt < 5) {
                      const delay = attempt * 1000;
                      setTimeout(
                        () => playVideoWithRetries(attempt + 1),
                        delay
                      );
                    } else {
                      console.error(
                        `💥 Failed to play video after ${attempt} attempts`
                      );
                    }
                  }
                } else if (attempt < 15) {
                  // Container or track might not be ready yet
                  const delay = Math.min(attempt * 500, 3000);
                  setTimeout(() => playVideoWithRetries(attempt + 1), delay);
                } else {
                  console.error(
                    `❌ Failed to play video after ${attempt} attempts - giving up`
                  );
                  console.error("Final state:", {
                    containerExists: !!container,
                    videoTrackExists: !!user.videoTrack,
                  });
                }
              };

              // Start video playing with initial delay
              setTimeout(() => playVideoWithRetries(), 1000);
            }

            if (mediaType === "audio" && user.audioTrack) {
              try {
                user.audioTrack.play();
              } catch (audioError) {
                console.error("❌ Audio play error:", audioError);
              }
            }
          } catch (subscribeError) {
            console.error("❌ Subscribe error:", subscribeError);
          }
        });

        // ✅ Enhanced user unpublished handler
        agoraClient.on("user-unpublished", (user, mediaType) => {
          if (mediaType === "video") {
            const session = joinedSessionsRef.current.get(sessionId);
            if (session) {
              session.remoteUsers = session.remoteUsers.map((u) =>
                u.uid === user.uid ? { ...u, videoTrack: null } : u
              );
              joinedSessionsRef.current.set(sessionId, { ...session });
              updateJoinedSessions();
            }
          }
        });

        // ✅ Enhanced user left handler
        agoraClient.on("user-left", (user) => {
          const session = joinedSessionsRef.current.get(sessionId);
          if (session) {
            session.remoteUsers = session.remoteUsers.filter(
              (u) => u.uid !== user.uid
            );
            joinedSessionsRef.current.set(sessionId, { ...session });
            updateJoinedSessions();
          }
        });

        // ✅ Enhanced connection state monitoring
        agoraClient.on(
          "connection-state-changed",
          (curState, revState, reason) => {}
        );

        // ✅ NEW: Network quality monitoring
        agoraClient.on("network-quality", (stats) => {});

        // ✅ NEW: Exception handling
        agoraClient.on("exception", (evt) => {
          console.error("🚨 Agora exception:", evt);
        });

        await agoraClient.join(
          sessionData.appId,
          sessionData.channelName,
          sessionData.token,
          sessionData.uid
        );

        // Store client reference
        agoraClients.current.set(sessionId, agoraClient);

        // Join socket room for notifications
        if (socket.current?.connected) {
          socket.current.emit("joinProctoringSession", {
            sessionId,
            userType: "proctor",
            companyOrg: sessionCompanyOrg,
          });
        }

        return sessionData;
      } catch (error) {
        console.error("❌ Failed to join session:", error);
        // Remove from joined sessions if join failed
        joinedSessionsRef.current.delete(sessionId);
        updateJoinedSessions();
        throw error;
      }
    },
    [proctoringServerUrl, token, companyOrg, updateJoinedSessions]
  );

  // ✅ Enhanced leaveSession with proper cleanup
  const leaveSession = useCallback(
    async (sessionId) => {
      try {
        const agoraClient = agoraClients.current.get(sessionId);
        if (agoraClient) {
          // Clean up video/audio tracks
          const session = joinedSessionsRef.current.get(sessionId);
          if (session?.remoteUsers) {
            session.remoteUsers.forEach((user) => {
              if (user.videoTrack) {
                user.videoTrack.stop();
              }
              if (user.audioTrack) {
                user.audioTrack.stop();
              }
            });
          }

          await agoraClient.leave();
          agoraClients.current.delete(sessionId);
        }

        if (socket.current?.connected) {
          socket.current.emit("leaveProctoringSession", {
            sessionId,
            userType: "proctor",
          });
        }

        // Remove from state
        joinedSessionsRef.current.delete(sessionId);
        updateJoinedSessions();
      } catch (error) {
        console.error("❌ Failed to leave session:", error);
        throw error;
      }
    },
    [updateJoinedSessions]
  );

  // ✅ Send message to student
  const sendMessageToStudent = useCallback(
    async (sessionId, studentId, message) => {
      try {
        if (!socket.current?.connected) {
          throw new Error("Socket not connected");
        }

        socket.current.emit("sendProctorMessage", {
          sessionId,
          targetStudentId: studentId,
          message,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("❌ Failed to send message:", error);
        throw error;
      }
    },
    []
  );

  // ✅ Enhanced cleanup on unmount
  useEffect(() => {
    return () => {
      Array.from(agoraClients.current.keys()).forEach((sessionId) => {
        leaveSession(sessionId).catch(console.error);
      });
      agoraClients.current.clear();
      joinedSessionsRef.current.clear();
    };
  }, [leaveSession]);

  return {
    connectionStatus,
    activeSessions,
    joinedSessions,
    violations,
    sessionSummary,
    fetchActiveSessions,
    joinSession,
    leaveSession,
    sendMessageToStudent,
  };
};

export default useProctoringProctor;
