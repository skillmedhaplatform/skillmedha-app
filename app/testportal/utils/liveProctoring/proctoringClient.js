import { useState, useEffect, useRef, useCallback } from "react";
// import AgoraRTC from "agora-rtc-sdk-ng";
import axios from "axios";
import { awsUrl } from "../urls";
// let AgoraRTC = null;
// if (typeof window !== "undefined") {
//   AgoraRTC = require("agora-rtc-sdk-ng").default;
// }
const useStudentProctoring = ({
  testId,
  token,
  socketInstance,
  proctoringServerUrl = awsUrl || "http://localhost:4334",
  onViolation,
  onProctorMessage,
  companyOrg,
}) => {
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [sessionData, setSessionData] = useState(null);
  const [proctoringActive, setProctoringActive] = useState(false);
  const [tracksPublished, setTracksPublished] = useState(false);
  const [proctorMessages, setProctoringMessages] = useState([]);
  const [latestMessage, setLatestMessage] = useState(null);

  const initialized = useRef(false);
  const starting = useRef(false);
  const socket = socketInstance;
  const agoraClient = useRef(null);
  const localVideoTrack = useRef(null);
  const localAudioTrack = useRef(null);
  const processingIntervalRef = useRef(null);
  const listenersRegistered = useRef(false);

  const audioRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const isRecordingRef = useRef(false);

  const [agoraLoaded, setAgoraLoaded] = useState(false);

  useEffect(() => {
    // Load Agora SDK asynchronously
    const loadAgora = async () => {
      if (typeof window !== "undefined" && !window.AgoraRTC) {
        try {
          const AgoraModule = await import("agora-rtc-sdk-ng");
          window.AgoraRTC = AgoraModule.default;
          setAgoraLoaded(true);
          console.log("✅ Agora SDK loaded successfully");
        } catch (error) {
          console.error("❌ Failed to load Agora SDK:", error);
        }
      } else if (window.AgoraRTC) {
        setAgoraLoaded(true);
      }
    };

    loadAgora();
  }, []);
  // Function to clear latest message
  const clearLatestMessage = useCallback(() => {
    setLatestMessage(null);
  }, []);

  // const handleFrameCapture = async (data) => {
  //   try {
  //     console.log("🔔 FRAME CAPTURE REQUEST RECEIVED:", data);

  //     const { sessionId, requestId, timestamp } = data;

  //     if (!requestId) {
  //       console.error("❌ No requestId in frame capture request");
  //       return;
  //     }

  //     // Capture video frame (existing code)
  //     const videoElement = document.querySelector(
  //       "#local-video-container video"
  //     );

  //     console.log("🎥 Video element check:", {
  //       exists: !!videoElement,
  //       readyState: videoElement?.readyState,
  //       videoWidth: videoElement?.videoWidth,
  //       videoHeight: videoElement?.videoHeight,
  //       paused: videoElement?.paused,
  //     });

  //     if (!videoElement) {
  //       console.error("❌ No video element found");
  //       socket.emit("frameData", {
  //         sessionId,
  //         requestId,
  //         error: "No video element found",
  //         timestamp: timestamp || Date.now(),
  //       });
  //       return;
  //     }

  //     if (videoElement.readyState < 2) {
  //       console.error(
  //         "❌ Video not ready, readyState:",
  //         videoElement.readyState
  //       );
  //       socket.emit("frameData", {
  //         sessionId,
  //         requestId,
  //         error: "Video not ready",
  //         timestamp: timestamp || Date.now(),
  //       });
  //       return;
  //     }

  //     // Capture video frame
  //     console.log("🎨 Creating canvas for frame capture...");
  //     const canvas = document.createElement("canvas");
  //     canvas.width = videoElement.videoWidth;
  //     canvas.height = videoElement.videoHeight;
  //     const ctx = canvas.getContext("2d");

  //     ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

  //     const dataURL = canvas.toDataURL("image/jpeg", 0.8);
  //     const videoFrameBase64 = dataURL.split(",")[1];

  //     console.log("📸 Frame captured successfully:", {
  //       width: canvas.width,
  //       height: canvas.height,
  //       dataSize: videoFrameBase64.length,
  //     });

  //     // Capture last 5 seconds of audio
  //     let audioBuffer = null;
  //     try {
  //       if (audioChunksRef.current.length > 0) {
  //         console.log(
  //           "🎤 Processing audio chunks:",
  //           audioChunksRef.current.length
  //         );

  //         // Create blob from last 5 seconds of audio chunks
  //         const audioBlob = new Blob(audioChunksRef.current, {
  //           type: "audio/webm;codecs=opus",
  //         });

  //         // Convert to base64
  //         const arrayBuffer = await audioBlob.arrayBuffer();
  //         audioBuffer = Buffer.from(arrayBuffer).toString("base64");

  //         console.log("🔊 Audio captured:", {
  //           chunks: audioChunksRef.current.length,
  //           size: audioBlob.size,
  //           base64Size: audioBuffer.length,
  //         });
  //       } else {
  //         console.log("⚠️ No audio chunks available");
  //       }
  //     } catch (audioError) {
  //       console.error("❌ Audio capture failed:", audioError);
  //     }

  //     // Send response with both video and audio
  //     socket.emit("frameData", {
  //       sessionId,
  //       requestId,
  //       frameBuffer: videoFrameBase64,
  //       audioBuffer: audioBuffer, // Add audio buffer
  //       timestamp: timestamp || Date.now(),
  //       hasAudio: !!audioBuffer,
  //     });

  //     console.log("✅ Frame and audio data sent with requestId:", requestId);
  //   } catch (error) {
  //     console.error("❌ Frame capture failed:", error);

  //     socket.emit("frameData", {
  //       sessionId: data.sessionId,
  //       requestId: data.requestId,
  //       error: error.message,
  //       timestamp: data.timestamp || Date.now(),
  //     });
  //   }
  // };

  const handleFrameCapture = useCallback(
    async (data) => {
      try {
        console.log("📸 FRAME CAPTURE REQUEST RECEIVED:", data);
        console.log("🔍 Socket state:", {
          connected: socket?.connected,
          id: socket?.id,
        });

        const { sessionId, requestId, timestamp } = data;

        if (!requestId) {
          console.error("❌ No requestId in frame capture request");
          return;
        }

        // Send immediate acknowledgment
        console.log("📤 Sending acknowledgment...");
        socket.emit("frameRequestReceived", {
          requestId,
          received: true,
          timestamp: Date.now(),
        });

        // Your existing video capture logic...
        const videoElement = document.querySelector(
          "#local-video-container video",
        );

        if (!videoElement || videoElement.readyState < 2) {
          console.error("❌ Video not ready, sending error response");
          socket.emit("frameData", {
            sessionId,
            requestId,
            error: "Video not ready",
            timestamp: timestamp || Date.now(),
          });
          return;
        }

        console.log("🎨 Creating canvas for frame capture...");
        const canvas = document.createElement("canvas");
        canvas.width = videoElement.videoWidth * 0.5; // Reduce size
        canvas.height = videoElement.videoHeight * 0.5;
        const ctx = canvas.getContext("2d");

        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        const dataURL = canvas.toDataURL("image/jpeg", 0.6);
        const videoFrameBase64 = dataURL.split(",")[1];

        console.log("📸 Frame captured, size:", videoFrameBase64.length);

        // Capture audio (simplified)
        let audioBuffer = null;
        if (audioChunksRef.current.length > 0) {
          try {
            const recentChunks = audioChunksRef.current.slice(-2); // Only 2 seconds
            const audioBlob = new Blob(recentChunks, {
              type: "audio/webm;codecs=opus",
            });

            if (audioBlob.size < 500000) {
              // Only if < 500KB
              const arrayBuffer = await audioBlob.arrayBuffer();
              audioBuffer = Buffer.from(arrayBuffer).toString("base64");
              console.log("🎤 Audio captured, size:", audioBuffer.length);
            }
          } catch (audioError) {
            console.warn("⚠️ Audio capture failed:", audioError);
          }
        }

        console.log("📤 Sending frameData response...");
        console.log("📤 Response data:", {
          sessionId,
          requestId,
          frameSize: videoFrameBase64.length,
          audioSize: audioBuffer?.length || 0,
          hasAudio: !!audioBuffer,
        });

        // Send the response
        socket.emit("frameData", {
          sessionId,
          requestId,
          frameBuffer: videoFrameBase64,
          audioBuffer,
          timestamp: timestamp || Date.now(),
          hasAudio: !!audioBuffer,
        });

        console.log("✅ frameData emitted successfully");
      } catch (error) {
        console.error("❌ Frame capture failed:", error);

        // Send error response
        socket.emit("frameData", {
          sessionId: data.sessionId,
          requestId: data.requestId,
          error: error.message,
          timestamp: data.timestamp || Date.now(),
        });

        console.log("📤 Error response sent");
      }
    },
    [socket],
  );

  const startContinuousAudioRecording = useCallback(async () => {
    try {
      if (!localAudioTrack.current) {
        console.log("No audio track available for recording");
        return;
      }

      // Get the audio stream from Agora's audio track
      const audioStream = new MediaStream([
        localAudioTrack.current.getMediaStreamTrack(),
      ]);

      audioRecorderRef.current = new MediaRecorder(audioStream, {
        mimeType: "audio/webm;codecs=opus", // or 'audio/mp4' if supported
      });

      audioRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);

          // Keep only last 5 seconds of audio chunks
          // Assuming each chunk represents ~1 second, keep last 5 chunks
          if (audioChunksRef.current.length > 5) {
            audioChunksRef.current = audioChunksRef.current.slice(-5);
          }
        }
      };

      // Record in 1-second intervals to maintain 5-second buffer
      audioRecorderRef.current.start(1000);
      isRecordingRef.current = true;

      console.log("✅ Continuous audio recording started");
    } catch (error) {
      console.error("❌ Failed to start audio recording:", error);
    }
  }, []);

  // Setup socket listeners
  // useEffect(() => {
  //   if (!socket || listenersRegistered.current) return;

  //   console.log("🔌 Setting up proctoring socket listeners...");

  //   const handleConnect = () => {
  //     console.log("✅ Socket connected for proctoring");
  //     setConnectionStatus("socket-connected");
  //   };

  //   const handleDisconnect = () => {
  //     console.log("❌ Socket disconnected for proctoring");
  //     setConnectionStatus("disconnected");
  //     setProctoringActive(false);
  //   };

  //   const handleViolation = (data) => {
  //     console.log("🚨 Violation notification:", data);
  //     onViolation && onViolation(data);
  //   };

  //   const handleProctorMessage = (data) => {
  //     console.log("=== PROCTOR MESSAGE RECEIVED ===");
  //     console.log("Message:", data.message);

  //     const messageObj = {
  //       id: Date.now(),
  //       message: data.message || data,
  //       sessionId: data.sessionId,
  //       timestamp: new Date(data.timestamp || Date.now()),
  //       from: data.from,
  //     };

  //     setProctoringMessages((prev) => [messageObj, ...prev.slice(0, 9)]);
  //     setLatestMessage(messageObj);
  //     onProctorMessage && onProctorMessage(data);
  //   };

  //   const handleRoomJoined = (data) => {
  //     console.log("🏠 Joined proctoring room:", data);
  //     setProctoringActive(true);
  //   };

  //   // const handleFrameCapture = async (data) => {
  //   //   console.log("📸 Frame capture requested");
  //   //   await handleFrameCapture(data);
  //   // };

  //   // Add listeners
  //   socket.on("connect", handleConnect);
  //   socket.on("disconnect", handleDisconnect);
  //   socket.on("violationNotification", handleViolation);
  //   socket.on("proctorMessage", handleProctorMessage);
  //   socket.on("proctoringRoomJoined", handleRoomJoined);
  //   socket.on("requestFrameCapture", handleFrameCapture);

  //   if (socket.connected) {
  //     setConnectionStatus("socket-connected");
  //   }

  //   listenersRegistered.current = true;

  //   return () => {
  //     if (socket && listenersRegistered.current) {
  //       console.log("🧹 Cleaning up proctoring socket listeners");
  //       socket.off("connect", handleConnect);
  //       socket.off("disconnect", handleDisconnect);
  //       socket.off("violationNotification", handleViolation);
  //       socket.off("proctorMessage", handleProctorMessage);
  //       socket.off("proctoringRoomJoined", handleRoomJoined);
  //       socket.off("requestFrameCapture", handleFrameCapture);
  //       listenersRegistered.current = false;
  //     }
  //   };
  // }, [onProctorMessage]);

  useEffect(() => {
    if (!socket || listenersRegistered.current) return;

    console.log("🔌 Setting up proctoring socket listeners...");

    const handleConnect = () => {
      console.log("✅ Socket connected for proctoring");
      setConnectionStatus("socket-connected");
    };

    const handleDisconnect = () => {
      console.log("❌ Socket disconnected for proctoring");
      setConnectionStatus("disconnected");
      setProctoringActive(false);
    };

    const handleViolation = (data) => {
      console.log("🚨 Violation notification:", data);
      onViolation && onViolation(data);
    };

    const handleProctorMessage = (data) => {
      console.log("=== PROCTOR MESSAGE RECEIVED ===");
      console.log("Message:", data.message);

      const messageObj = {
        id: Date.now(),
        message: data.message || data,
        sessionId: data.sessionId,
        timestamp: new Date(data.timestamp || Date.now()),
        from: data.from,
      };

      setProctoringMessages((prev) => [messageObj, ...prev.slice(0, 9)]);
      setLatestMessage(messageObj);
      onProctorMessage && onProctorMessage(data);
    };

    const handleRoomJoined = (data) => {
      console.log("🏠 Joined proctoring room:", data);
      setProctoringActive(true);
    };

    // Add listeners
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("violationNotification", handleViolation);
    socket.on("proctorMessage", handleProctorMessage);
    socket.on("proctoringRoomJoined", handleRoomJoined);
    socket.on("requestFrameCapture", handleFrameCapture); // Use the stable version

    // Add immediate test to verify listener registration
    console.log("📋 Event listeners registered. Testing...");

    if (socket.connected) {
      setConnectionStatus("socket-connected");
      console.log("🔗 Socket already connected");
    }

    listenersRegistered.current = true;

    return () => {
      if (socket && listenersRegistered.current) {
        console.log("🧹 Cleaning up proctoring socket listeners");
        socket.off("connect", handleConnect);
        socket.off("disconnect", handleDisconnect);
        socket.off("violationNotification", handleViolation);
        socket.off("proctorMessage", handleProctorMessage);
        socket.off("proctoringRoomJoined", handleRoomJoined);
        socket.off("requestFrameCapture", handleFrameCapture);
        listenersRegistered.current = false;
      }
    };
  }, [socket, handleFrameCapture]);

  // ✅ ENHANCED: Start proctoring with better error handling
  const startProctoring = useCallback(async () => {
    if (typeof window === "undefined" || !window.AgoraRTC) {
      console.log("⏭️ Not in browser environment or Agora not loaded");
      return;
    }
    if (!testId || !token) {
      console.log("⏭️ Missing testId or token");
      return;
    }

    if (starting.current) {
      console.log("⏭️ Already starting proctoring, skipping...");
      return;
    }

    if (sessionData || proctoringActive || connectionStatus === "connected") {
      console.log("⏭️ Proctoring already active, skipping...");
      return;
    }

    if (initialized.current) {
      console.log("⏭️ Already initialized, skipping...");
      return;
    }

    try {
      starting.current = true;
      setConnectionStatus("connecting");
      if (!companyOrg) return;
      console.log("📝 Creating exam session for test:", testId);
      const sessionResponse = await axios.post(
        `${proctoringServerUrl}/agora/create-exam-session/${testId}`,
        { companyOrg },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!sessionResponse.data.success) {
        throw new Error(
          sessionResponse.data.message || "Failed to create session",
        );
      }

      console.log("✅ Session created:", sessionResponse.data);
      setSessionData(sessionResponse.data);

      const joinResponse = await axios.post(
        `${proctoringServerUrl}/agora/join-session`,
        {
          sessionId: sessionResponse.data.sessionId,
          userType: "student",
          companyOrg,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!joinResponse.data.success) {
        throw new Error(joinResponse.data.error || "Failed to join Agora");
      }

      console.log("✅ Joined Agora:", joinResponse.data);

      // Initialize Agora with publishing
      await initializeAgoraWithPublishing(joinResponse.data);

      if (socket && socket.connected) {
        socket.emit("joinProctoringSession", {
          sessionId: sessionResponse.data.sessionId,
          userType: "student",
        });
      }

      setConnectionStatus("connected");
      initialized.current = true;
    } catch (error) {
      console.error("❌ Failed to start proctoring:", error);
      setConnectionStatus("error");
    } finally {
      starting.current = false;
    }
  }, [
    testId,
    token,
    proctoringServerUrl,
    socket,
    sessionData,
    proctoringActive,
    connectionStatus,
  ]);

  // ✅ COMPLETELY REWRITTEN: Enhanced Agora initialization with proper video handling
  const initializeAgoraWithPublishing = async (agoraData) => {
    console.log("🚀 initializeAgoraWithPublishing STARTED");
    console.log("Agora data received:", agoraData);

    try {
      // Clean up existing client if any
      if (agoraClient.current) {
        console.log("⚠️ Cleaning up existing Agora client");
        await agoraClient.current.leave();
        agoraClient.current = null;
      }

      // Create Agora client with optimal settings
      console.log("🏗️ Creating Agora client...");
      agoraClient.current = window.AgoraRTC.createClient({
        mode: "rtc",
        codec: "vp8",
      });

      // Join channel first
      console.log("🔗 Joining Agora channel...");
      await agoraClient.current.join(
        agoraData.appId,
        agoraData.channelName,
        agoraData.token,
        agoraData.uid,
      );
      console.log("✅ Joined Agora channel successfully");

      // ✅ CRITICAL: Create video track with proper configuration
      console.log("🎥 Creating camera video track...");
      localVideoTrack.current = await window.AgoraRTC.createCameraVideoTrack({
        encoderConfig: "480p_1", // Use predefined encoder config
        optimizationMode: "motion", // Better for general video
        facingMode: "user", // Front camera
      });

      console.log("🎤 Creating microphone audio track...");
      localAudioTrack.current =
        await window.AgoraRTC.createMicrophoneAudioTrack({
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        });

      // ✅ CRITICAL: Verify tracks before publishing
      console.log("🔍 Track verification before publishing:", {
        videoExists: !!localVideoTrack.current,
        videoEnabled: localVideoTrack.current?.enabled,
        videoMuted: localVideoTrack.current?.muted,
        audioExists: !!localAudioTrack.current,
        audioEnabled: localAudioTrack.current?.enabled,
        audioMuted: localAudioTrack.current?.muted,
      });

      if (!localVideoTrack.current || !localAudioTrack.current) {
        throw new Error("Failed to create video or audio tracks");
      }

      // ✅ CRITICAL: Play video locally first to ensure it works
      console.log("🎬 Playing video locally first...");
      await localVideoTrack.current.play("local-video-container");
      console.log("✅ Local video playing successfully");

      // Wait for local video to stabilize
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // ✅ CRITICAL: Publish tracks with verification
      console.log("📡 Publishing tracks to Agora...");
      await agoraClient.current.publish([
        localVideoTrack.current,
        localAudioTrack.current,
      ]);

      // ✅ NEW: Verify tracks are actually published
      const publishedTracks = agoraClient.current.localTracks;
      console.log("✅ Published tracks verification:", {
        totalTracks: publishedTracks.length,
        trackTypes: publishedTracks.map((track) => track.trackMediaType),
        videoTrackId: localVideoTrack.current.getTrackId(),
        audioTrackId: localAudioTrack.current.getTrackId(),
      });

      if (publishedTracks.length === 0) {
        throw new Error("No tracks were published");
      }

      // ✅ NEW: Check for remote users (proctors)
      const remoteUsers = agoraClient.current.remoteUsers;
      console.log("👥 Remote users in channel:", {
        count: remoteUsers.length,
        users: remoteUsers.map((u) => ({
          uid: u.uid,
          hasVideo: !!u.videoTrack,
          hasAudio: !!u.audioTrack,
        })),
      });

      setTracksPublished(true);
      await startContinuousAudioRecording();

      // Start real-time processing
      const interval = startRealtimeAWSProcessing();
      processingIntervalRef.current = interval;

      console.log("🎉 Video publishing completed successfully");
    } catch (error) {
      console.error("❌ ERROR in initializeAgoraWithPublishing:", error);
      console.error("Error stack:", error.stack);
      throw error;
    }
  };

  // ✅ ENHANCED: Real-time AWS processing with better error handling
  const startRealtimeAWSProcessing = () => {
    console.log("🎬 Starting real-time AWS processing");

    const processingInterval = setInterval(async () => {
      try {
        if (localVideoTrack.current && sessionData?.sessionId) {
          const video = document.querySelector("#local-video-container video");
          if (video && video.videoWidth > 0 && video.videoHeight > 0) {
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0);

            canvas.toBlob(
              async (blob) => {
                if (blob) {
                  const arrayBuffer = await blob.arrayBuffer();
                  const frameBuffer =
                    Buffer.from(arrayBuffer).toString("base64");

                  console.log("📸 Sending frame to server for processing");
                  await axios
                    .post(
                      `${proctoringServerUrl}/agora/process-frame`,
                      {
                        sessionId: sessionData.sessionId,
                        frameBuffer: frameBuffer,
                        timestamp: Date.now(),
                      },
                      {
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      },
                    )
                    .catch((err) => console.error("Frame send error:", err));
                }
              },
              "image/jpeg",
              0.8,
            );
          }
        }
      } catch (error) {
        console.error("Real-time processing error:", error);
      }
    }, 5000);

    return processingInterval;
  };

  // ✅ ENHANCED: Stop proctoring with proper cleanup
  const stopProctoring = useCallback(async () => {
    if (!sessionData && !proctoringActive) return;

    try {
      console.log("🛑 Stopping proctoring...");

      if (socket && socket.connected) {
        socket.emit("leaveProctoringSession", {
          sessionId: sessionData?.sessionId,
          userType: "student",
        });
      }
      if (audioRecorderRef.current && isRecordingRef.current) {
        audioRecorderRef.current.stop();
        audioRecorderRef.current = null;
        isRecordingRef.current = false;
        audioChunksRef.current = [];
        console.log("🛑 Stopped audio recording");
      }
      // Stop processing interval
      if (processingIntervalRef.current) {
        clearInterval(processingIntervalRef.current);
        processingIntervalRef.current = null;
        console.log("🛑 Stopped real-time frame processing");
      }

      // Stop and close tracks
      if (localVideoTrack.current) {
        localVideoTrack.current.stop();
        localVideoTrack.current.close();
        localVideoTrack.current = null;
      }

      if (localAudioTrack.current) {
        localAudioTrack.current.stop();
        localAudioTrack.current.close();
        localAudioTrack.current = null;
      }

      // Leave Agora channel
      if (agoraClient.current) {
        await agoraClient.current.leave();
        agoraClient.current = null;
      }

      // Reset all state
      setSessionData(null);
      setConnectionStatus("disconnected");
      setProctoringActive(false);
      setTracksPublished(false);
      initialized.current = false;
      starting.current = false;

      console.log("✅ Proctoring stopped");
    } catch (error) {
      console.error("❌ Failed to stop proctoring:", error);
    }
  }, [sessionData, socket]);

  return {
    connectionStatus,
    proctoringActive,
    sessionData,
    tracksPublished,
    startProctoring,
    stopProctoring,
    proctorMessages,
    latestMessage,
    clearLatestMessage,
    setProctoringMessages,
    setLatestMessage,
  };
};

export default useStudentProctoring;
