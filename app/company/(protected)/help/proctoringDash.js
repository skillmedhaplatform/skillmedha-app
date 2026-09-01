"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  Button,
  Badge,
  Input,
  Modal,
  notification,
  Typography,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  UserOutlined,
  UsergroupAddOutlined,
  CameraOutlined,
  FlagOutlined,
  StopOutlined,
} from "@ant-design/icons";
import useProctoringProctor from "@/utils/universalUtils/liveProctoring/useProctoringProctor";
import { useParams } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import styles from "./ProctorDashboard.module.scss";
import { getAllAppliedStudents } from "@/redux/slices/company/skillMedhaData";
import { GetOneJob } from "@/redux/slices/company/placementsSlice";
import { proctoringServerUrl, socketServerUrl } from "@/utils/universalUtils/urls";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const ProctorDashboard = ({ token, companyOrg }) => {
  const [messageModal, setMessageModal] = useState({
    visible: false,
    sessionId: null,
    studentId: null,
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [joiningSessions, setJoiningSessions] = useState(new Set());
  const [leavingSessions, setLeavingSessions] = useState(new Set());
  const [violationFrames, setViolationFrames] = useState(new Set());

  const { jobDetails } = useParams();

  const {
    value: jobData,
  } = useSelector((s) => s.placement.OneJob);
  const appliedStudents = useSelector((s) => s.skillmedha.appliedStudents);
  const dispatch = useDispatch();
  const {
    connectionStatus,
    activeSessions,
    joinedSessions,
    violations,
    fetchActiveSessions,
    joinSession,
    leaveSession,
    sendMessageToStudent,
  } = useProctoringProctor({
    token,
    socketServerUrl: socketServerUrl || "http://localhost:2222",
    proctoringServerUrl: proctoringServerUrl || "http://localhost:4334",
    companyOrg,
  });

  const getApprovedStudentsWithSessions = () => {
    const approvedStudents = appliedStudents?.filter((s) =>
      jobData?.data?.approvedStudents?.includes(s._id)
    );
    return approvedStudents?.map((student) => {
      const session = activeSessions.find(
        (sess) => sess.createdBy === student.globalId
      );

      const isJoined = joinedSessions.some(
        (js) => js.sessionId === session?.sessionId
      );

      return {
        ...student,
        session,
        isActive: !!session,
        isJoined,
        status: session ? "active" : "inactive",
      };
    });
  };

  const studentsWithSessions = getApprovedStudentsWithSessions() || [];

  const loadActiveSessions = async () => {
    setLoading(true);
    try {
      await fetchActiveSessions({
        userType: "all",
        sortBy: "createdAt",
        sortOrder: "desc",
        companyOrg,
        limit: 50,
        offset: 0,
        jobId: jobDetails,
      });
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to fetch active sessions",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActiveSessions();
  }, [companyOrg]);

  useEffect(() => {
    if (violations.length > 0) {
      const latestViolation = violations[0];
      if (!latestViolation?.violation?.some((v) => v?.severity !== "LOW"))
        return; 
      setViolationFrames((prev) =>
        new Set(prev).add(latestViolation?.analysis?.frameUrl)
      );

      notification.warning({
        message: "Violation Detected",
        description: `Session ${latestViolation.sessionId
          ?.toString()
          .slice(-8)}: ${
          latestViolation.analysis?.overallViolations?.[0]?.message ||
          "Violation detected"
        }`,
        placement: "topRight",
        duration: 5,
      });
    }
  }, [violations]);

  const playVideo = useCallback((session, user) => {
    const containerId = `video-${session.sessionId}-${user.uid}`;
    const container = document.getElementById(containerId);

    if (!container || !user.videoTrack) {
      return;
    }

    try {
      container.innerHTML = "";
      user.videoTrack.play(containerId);

      setTimeout(() => {
        const videoElement = container.querySelector("video");
        if (videoElement) {
          videoElement.muted = true;
          videoElement.playsInline = true;

          const playPromise = videoElement.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {})
              .catch(() => {
                videoElement.click();
              });
          }
        }
      }, 500);
    } catch (error) {}
  }, []);

  useEffect(() => {
    joinedSessions.forEach((session) => {
      if (session.remoteUsers && session.remoteUsers.length > 0) {
        session.remoteUsers.forEach((user) => {
          const containerId = `video-${session.sessionId}-${user.uid}`;
          const container = document.getElementById(containerId);

          if (container && user.videoTrack) {
            const existingVideo = container.querySelector("video");
            if (!existingVideo) {
              requestAnimationFrame(() => {
                playVideo(session, user);
              });
            }
          }
        });
      }
    });
  }, [joinedSessions, playVideo]);

  useEffect(() => {
    dispatch(
      getAllAppliedStudents({
        studentIds: jobData?.data?.applicants?.map((e) => e?._id),
        jobId: jobDetails,
        assessmentId: jobData?.data?.AssessmentId,
      })
    );
  }, [jobDetails, jobData]);

  useEffect(() => {
    dispatch(GetOneJob({ jobid: jobDetails }));
  }, [jobDetails]);

  const handleJoinSession = async (sessionId) => {
    if (joiningSessions.has(sessionId)) return;

    try {
      setJoiningSessions((prev) => new Set([...prev, sessionId]));
      await joinSession(sessionId, companyOrg);

      notification.success({
        message: "Joined Session",
        description: `Successfully joined monitoring session`,
        duration: 2,
      });
    } catch (error) {
      notification.error({
        message: "Failed to Join",
        description: error.message || "Could not join the session.",
      });
    } finally {
      setJoiningSessions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(sessionId);
        return newSet;
      });
    }
  };

  const handleLeaveSession = async (sessionId) => {
    if (leavingSessions.has(sessionId)) return;

    try {
      setLeavingSessions((prev) => new Set([...prev, sessionId]));
      await leaveSession(sessionId);
      setSelectedCandidate(null);

      notification.info({
        message: "Left Session",
        description: "Stopped monitoring session",
      });
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to leave session properly",
      });
    } finally {
      setLeavingSessions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(sessionId);
        return newSet;
      });
    }
  };

  const handleSendMessage = async () => {
    if (message.trim() && messageModal.sessionId && messageModal.studentId) {
      try {
        await sendMessageToStudent(
          messageModal.sessionId,
          messageModal.studentId,
          message
        );
        setMessage("");
        setMessageModal({ visible: false, sessionId: null, studentId: null });
        notification.success({
          message: "Message Sent",
          description: "Your message has been sent to the student.",
        });
      } catch (error) {
        notification.error({
          message: "Failed to Send",
          description: "Could not send message.",
        });
      }
    }
  };

  // Get recent activity thumbnails
  const getRecentActivityThumbnails = () => {
    return Array.from({ length: 6 }, (_, index) => ({
      id: index,
      timestamp: new Date(Date.now() - index * 300000),
    }));
  };

  const recentThumbnails = getRecentActivityThumbnails();

  const formatDuration = (minutes) => {
    if (!minutes) return "00:00";
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className={styles.proctoringContainer}>
      <div className={styles.mainContent}>
        {/* Left Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeaderNew}>
            <div className={styles.headerTopRow}>
              <div className={styles.titleSection}>
                <span className={styles.candidatesTitle}>
                  <UsergroupAddOutlined style={{ fontSize: 20 }} /> Candidates
                </span>
                <div className={styles.livePill}>LIVE</div>
              </div>
            </div>
            
            <div className={styles.headerSearchRow}>
              <Input
                placeholder="Value"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
                className={styles.searchInput}
              />
              <div className={styles.totalActive}>
                Total: <br/>{studentsWithSessions.length} active
              </div>
              <Button
                icon={<ReloadOutlined />}
                onClick={loadActiveSessions}
                loading={loading}
                type="text"
                style={{ padding: '4px' }}
              />
            </div>
          </div>

          <div className={styles.candidatesList}>
            {/* STATIC RS */}
            <div className={`${styles.candidateCard} ${styles.selected}`}>
              <div className={styles.candidateInitials} style={{ background: '#3b82f6' }}>RS</div>
              <div className={styles.candidateInfo}>
                <div className={styles.candidateName}>Rahul Sharma</div>
                <div className={styles.candidateTest}>Developer Assessment</div>
              </div>
              <div className={styles.statusDot} style={{ background: '#22c55e' }} />
            </div>

            {/* STATIC PN */}
            <div className={styles.candidateCard}>
              <div className={styles.candidateInitials} style={{ background: '#22c55e' }}>PN</div>
              <div className={styles.candidateInfo}>
                <div className={styles.candidateName}>Priya Nair</div>
                <div className={styles.candidateTest}>DevOps Assessment</div>
              </div>
              <div className={styles.statusDot} style={{ background: '#22c55e' }} />
            </div>

            {/* STATIC AM */}
            <div className={styles.candidateCard}>
              <div className={styles.candidateInitials} style={{ background: '#9333ea' }}>AM</div>
              <div className={styles.candidateInfo}>
                <div className={styles.candidateName}>Arjun Mehta</div>
                <div className={styles.candidateTest}>Wipro Assessment</div>
              </div>
              <div className={styles.statusDot} style={{ background: '#f97316' }} />
            </div>

            {/* STATIC SR */}
            <div className={styles.candidateCard}>
              <div className={styles.candidateInitials} style={{ background: '#f97316' }}>SR</div>
              <div className={styles.candidateInfo}>
                <div className={styles.candidateName}>Sneha Reddy</div>
                <div className={styles.candidateTest}>Data Analyst Assessment</div>
              </div>
              <div className={styles.statusDot} style={{ background: '#22c55e' }} />
            </div>
          </div>
        </div>

        <div className={styles.videoSection}>
          <>
            <div className={styles.topHeader}>
              <div className={styles.headerTitle}>
                <span className={styles.shieldIcon}>🛡️</span>
                Monitoring: Rahul Sharma
              </div>
              <div className={styles.headerControls}>
                <Button className={styles.controlBtn} icon={<CameraOutlined />}>Snapshot</Button>
                <Button className={styles.controlBtn} style={{ color: "#ef4444", borderColor: "#fee2e2", background: "#fef2f2" }} icon={<FlagOutlined />}>Flag</Button>
                <Button className={`${styles.controlBtn} ${styles.endSessionBtn}`} icon={<StopOutlined />}>End Session</Button>
              </div>
            </div>

            <div className={styles.statsRow}>
              <div className={styles.statCard}>
                <UserOutlined className={styles.statIcon} style={{ color: '#3b82f6' }} />
                <div className={styles.statInfo}>
                  <div className={styles.statLabel}>CANDIDATE</div>
                  <div className={styles.statValue}>Rahul Sharma</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <Badge className={styles.statIcon} status="processing" color="#22c55e" />
                <div className={styles.statInfo}>
                  <div className={styles.statLabel}>TEST</div>
                  <div className={styles.statValue}>Developer Assessment...</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statIcon} style={{ fontSize: 18, color: '#f97316' }}>⏱️</span>
                <div className={styles.statInfo}>
                  <div className={styles.statLabel}>DURATION</div>
                  <div className={styles.statValue}>06:58</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <WarningOutlined className={styles.statIcon} style={{ color: "#ef4444" }} />
                <div className={styles.statInfo}>
                  <div className={styles.statLabel}>ALERTS</div>
                  <div className={styles.statValue} style={{ color: '#1e3a8a' }}>1</div>
                </div>
              </div>
            </div>

            <div className={styles.primaryVideoContainer}>
              <div className={styles.videoLabel}>🖥️ SCREEN SHARE</div>
              <div className={styles.recBadge}>REC</div>
              
              <div className={styles.placeholderContent}>
                <div className={styles.icon}>🖥️</div>
                <div className={styles.text}>Screen share feed</div>
                <div className={styles.subText}>Waiting for stream...</div>
              </div>
            </div>

            <div className={styles.bottomRow}>
              <div className={styles.secondaryVideoContainer}>
                <div className={styles.videoLabel}>👤 WEBCAM</div>
                <div className={styles.placeholderContent}>
                  <div className={styles.icon}>👤</div>
                  <div className={styles.text}>Webcam feed</div>
                  <div className={styles.subText}>Camera active</div>
                </div>
              </div>

              <div className={styles.activityLogContainer}>
                <div className={styles.logHeader}>⚡ ACTIVITY LOG</div>
                <div className={styles.logList}>
                  <div className={`${styles.logItem} ${styles["status-normal"]}`}>
                    <span className={styles.logTime}>[12:30:01]</span>
                    <span className={styles.logText}>Session started</span>
                  </div>
                  <div className={`${styles.logItem} ${styles["status-normal"]}`}>
                    <span className={styles.logTime}>[12:30:15]</span>
                    <span className={styles.logText}>Question 1 opened</span>
                  </div>
                  <div className={`${styles.logItem} ${styles["status-normal"]}`}>
                    <span className={styles.logTime}>[12:31:02]</span>
                    <span className={styles.logText}>Question 2 opened</span>
                  </div>
                  <div className={`${styles.logItem} ${styles["status-warning"]}`}>
                    <span className={styles.logTime}>[12:31:44]</span>
                    <span className={styles.logText}>🔺 Tab switch detected</span>
                  </div>
                  <div className={`${styles.logItem} ${styles["status-normal"]}`}>
                    <span className={styles.logTime}>[12:32:10]</span>
                    <span className={styles.logText}>Returned to test tab</span>
                  </div>
                  <div className={`${styles.logItem} ${styles["status-normal"]}`}>
                    <span className={styles.logTime}>[12:33:20]</span>
                    <span className={styles.logText}>Question 3 opened</span>
                  </div>
                  <div className={`${styles.logItem} ${styles["status-normal"]}`} style={{ color: "#9ca3af" }}>
                    <span className={styles.logTime}>[12:34:05]</span>
                    <span className={styles.logText}>Idle — no input detected</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        </div>
      </div>

      {/* Message Modal */}
      <Modal
        title="Send Message to Student"
        open={messageModal.visible}
        onOk={handleSendMessage}
        onCancel={() =>
          setMessageModal({ visible: false, sessionId: null, studentId: null })
        }
        okText="Send"
      >
        <Input.TextArea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message to the student..."
          rows={4}
          maxLength={500}
        />
      </Modal>
    </div>
  );
};

export default ProctorDashboard;
