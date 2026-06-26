// "use client";
// import React, { useEffect, useState } from "react";
// import {
//   Card,
//   Button,
//   Badge,
//   List,
//   Input,
//   Modal,
//   notification,
//   Spin,
//   Select,
//   Row,
//   Col,
//   Statistic,
// } from "antd";
// import {
//   EyeOutlined,
//   MessageOutlined,
//   WarningOutlined,
//   ReloadOutlined,
//   UserOutlined,
//   ClockCircleOutlined,
// } from "@ant-design/icons";
// import useProctoringProctor from "@/utils/universalUtils/liveProctoring/useProctoringProctor";
// import { useParams } from "next/navigation";
// import { useSelector } from "react-redux";

// const { Option } = Select;

// const ProctorDashboard = ({ token, companyOrg }) => {
//   const [messageModal, setMessageModal] = useState({
//     visible: false,
//     sessionId: null,
//     studentId: null,
//   });
//   const [message, setMessage] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [sessionFilter, setSessionFilter] = useState("all");
//   const [sortBy, setSortBy] = useState("createdAt");
//   const [sortOrder, setSortOrder] = useState("desc");
//   const [joiningSessions, setJoiningSessions] = useState(new Set());
//   const [leavingSessions, setLeavingSessions] = useState(new Set());
//   const { jobDetails } = useParams();
//   const {
//     value: jobData,
//     status: jobStatus,
//     error: jobErr,
//   } = useSelector((s) => s.placement.OneJob);
//   const appliedStudents = useSelector((s) => s.skillmedha.appliedStudents);
//   const {
//     connectionStatus,
//     activeSessions,
//     joinedSessions,
//     violations,
//     sessionSummary,
//     fetchActiveSessions,
//     joinSession,
//     leaveSession,
//     sendMessageToStudent,
//   } = useProctoringProctor({
//     token,
//     socketServerUrl: "http://localhost:2222",
//     proctoringServerUrl: "http://localhost:4334",
//     companyOrg,
//   });

//   // Manual refresh only
//   const loadActiveSessions = async () => {
//     setLoading(true);
//     try {
//       await fetchActiveSessions({
//         userType: sessionFilter,
//         sortBy,
//         sortOrder,
//         companyOrg,
//         limit: 50,
//         offset: 0,
//         jobId: jobDetails,
//       });
//     } catch (error) {
//       notification.error({
//         message: "Error",
//         description: "Failed to fetch active sessions",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Load on mount and filter changes only
//   useEffect(() => {
//     loadActiveSessions();
//   }, [sessionFilter, sortBy, sortOrder, companyOrg]);

//   // Show violation notifications
//   useEffect(() => {
//     if (violations.length > 0) {
//       const latestViolation = violations[0];
//       notification.warning({
//         message: "Violation Detected",
//         description: `Session ${latestViolation.sessionId
//           ?.toString()
//           .slice(-8)}: ${
//           latestViolation.analysis?.overallViolations?.[0]?.message ||
//           "Violation detected"
//         }`,
//         placement: "topRight",
//         duration: 5,
//       });
//     }
//   }, [violations]);

//   // ✅ ENHANCED: Video playing with comprehensive debugging
//   useEffect(() => {
//     console.log("🎬 Video effect triggered - processing joined sessions:", {
//       sessionCount: joinedSessions.length,
//       sessions: joinedSessions.map((s) => ({
//         id: s.sessionId?.toString().slice(-8),
//         remoteUsers: s.remoteUsers?.length || 0,
//       })),
//     });

//     joinedSessions.forEach((session) => {
//       if (session.remoteUsers && session.remoteUsers.length > 0) {
//         console.log(
//           `📋 Processing session ${session.sessionId} with ${session.remoteUsers.length} users`
//         );

//         session.remoteUsers.forEach((user) => {
//           const containerId = `video-${session.sessionId}-${user.uid}`;
//           const container = document.getElementById(containerId);

//           console.log(`🔍 Video check for user ${user.uid}:`, {
//             containerId,
//             containerExists: !!container,
//             hasVideoTrack: !!user.videoTrack,
//             hasExistingVideo: !!container?.firstChild,
//             containerHTML: container?.innerHTML?.length || 0,
//           });

//           if (container && user.videoTrack && !container.firstChild) {
//             console.log(`🎥 Attempting to play video for user ${user.uid}`);
//             try {
//               // Clear container first
//               container.innerHTML = "";

//               // Play video
//               user.videoTrack.play(containerId);
//               console.log(`✅ Video play initiated for user ${user.uid}`);

//               // Verify after delay
//               setTimeout(() => {
//                 const videoElement = container.querySelector("video");
//                 console.log(`📺 Video verification for user ${user.uid}:`, {
//                   elementExists: !!videoElement,
//                   dimensions: videoElement
//                     ? `${videoElement.videoWidth}x${videoElement.videoHeight}`
//                     : "N/A",
//                   playing: videoElement
//                     ? !videoElement.paused && !videoElement.ended
//                     : false,
//                 });
//               }, 3000);
//             } catch (error) {
//               console.error(
//                 `❌ Failed to play video for user ${user.uid}:`,
//                 error
//               );

//               // Single retry after 3 seconds
//               setTimeout(() => {
//                 try {
//                   if (user.videoTrack && document.getElementById(containerId)) {
//                     console.log(`🔄 Retrying video play for user ${user.uid}`);
//                     user.videoTrack.play(containerId);
//                   }
//                 } catch (retryError) {
//                   console.error(
//                     `❌ Video retry failed for user ${user.uid}:`,
//                     retryError
//                   );
//                 }
//               }, 3000);
//             }
//           }
//         });
//       }
//     });
//   }, [joinedSessions]);

//   // Enhanced join session
//   const handleJoinSession = async (sessionId) => {
//     if (joiningSessions.has(sessionId)) {
//       console.log("⏭️ Already joining session:", sessionId);
//       return;
//     }

//     try {
//       setJoiningSessions((prev) => new Set([...prev, sessionId]));

//       console.log("🎥 Starting join process for session:", sessionId);
//       await joinSession(sessionId, companyOrg);

//       notification.success({
//         message: "Joined Session",
//         description: `Successfully joined session ${sessionId
//           .toString()
//           .slice(-8)}`,
//       });
//     } catch (error) {
//       console.error("❌ Join session error:", error);
//       notification.error({
//         message: "Failed to Join",
//         description:
//           error.message || "Could not join the session. Please try again.",
//       });
//     } finally {
//       setJoiningSessions((prev) => {
//         const newSet = new Set(prev);
//         newSet.delete(sessionId);
//         return newSet;
//       });
//     }
//   };

//   // Enhanced leave session
//   const handleLeaveSession = async (sessionId) => {
//     if (leavingSessions.has(sessionId)) {
//       console.log("⏭️ Already leaving session:", sessionId);
//       return;
//     }

//     try {
//       setLeavingSessions((prev) => new Set([...prev, sessionId]));

//       await leaveSession(sessionId);

//       notification.info({
//         message: "Left Session",
//         description: `Left session ${sessionId.toString().slice(-8)}`,
//       });
//     } catch (error) {
//       console.error("❌ Leave session error:", error);
//       notification.error({
//         message: "Error",
//         description: "Failed to leave session properly",
//       });
//     } finally {
//       setLeavingSessions((prev) => {
//         const newSet = new Set(prev);
//         newSet.delete(sessionId);
//         return newSet;
//       });
//     }
//   };

//   const handleSendMessage = async () => {
//     if (message.trim() && messageModal.sessionId && messageModal.studentId) {
//       try {
//         await sendMessageToStudent(
//           messageModal.sessionId,
//           messageModal.studentId,
//           message
//         );
//         setMessage("");
//         setMessageModal({
//           visible: false,
//           sessionId: null,
//           studentId: null,
//         });
//         notification.success({
//           message: "Message Sent",
//           description: "Your message has been sent to the student.",
//         });
//       } catch (error) {
//         notification.error({
//           message: "Failed to Send",
//           description: "Could not send message. Please try again.",
//         });
//       }
//     }
//   };

//   const formatDuration = (minutes) => {
//     if (minutes < 60) return `${minutes}m`;
//     const hours = Math.floor(minutes / 60);
//     const mins = minutes % 60;
//     return `${hours}h ${mins}m`;
//   };

//   const isSessionProcessing = (sessionId) => {
//     return joiningSessions.has(sessionId) || leavingSessions.has(sessionId);
//   };

//   const getSessionProcessingStatus = (sessionId) => {
//     if (joiningSessions.has(sessionId)) return "Joining...";
//     if (leavingSessions.has(sessionId)) return "Leaving...";
//     return null;
//   };

//   return (
//     <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
//       {/* Header */}
//       <div style={{ marginBottom: "24px" }}>
//         <h1>Proctor Dashboard</h1>
//         <Row gutter={16}>
//           <Col span={6}>
//             <Statistic
//               title="Connection Status"
//               value={connectionStatus}
//               valueStyle={{
//                 color: connectionStatus === "connected" ? "#3f8600" : "#cf1322",
//               }}
//               prefix={
//                 connectionStatus === "connected" ? (
//                   <Badge status="success" />
//                 ) : (
//                   <Badge status="error" />
//                 )
//               }
//             />
//           </Col>
//           <Col span={6}>
//             <Statistic
//               title="Active Sessions"
//               value={activeSessions.length}
//               prefix={<UserOutlined />}
//             />
//           </Col>
//           <Col span={6}>
//             <Statistic
//               title="Joined Sessions"
//               value={joinedSessions.length}
//               prefix={<EyeOutlined />}
//             />
//           </Col>
//           <Col span={6}>
//             <Statistic
//               title="Total Violations"
//               value={violations.length}
//               prefix={<WarningOutlined />}
//               valueStyle={{
//                 color: violations.length > 0 ? "#cf1322" : "#3f8600",
//               }}
//             />
//           </Col>
//         </Row>
//       </div>

//       {/* Filters */}
//       <Card style={{ marginBottom: "24px" }}>
//         <Row gutter={16} align="middle">
//           <Col span={4}>
//             <Select
//               value={sessionFilter}
//               onChange={setSessionFilter}
//               style={{ width: "100%" }}
//             >
//               <Option value="all">All Sessions</Option>
//               <Option value="student">With Students</Option>
//               <Option value="proctor">With Proctors</Option>
//             </Select>
//           </Col>
//           <Col span={4}>
//             <Select
//               value={sortBy}
//               onChange={setSortBy}
//               style={{ width: "100%" }}
//             >
//               <Option value="createdAt">Created Time</Option>
//               <Option value="sessionDuration">Duration</Option>
//               <Option value="violationCount">Violations</Option>
//             </Select>
//           </Col>
//           <Col span={4}>
//             <Select
//               value={sortOrder}
//               onChange={setSortOrder}
//               style={{ width: "100%" }}
//             >
//               <Option value="desc">Descending</Option>
//               <Option value="asc">Ascending</Option>
//             </Select>
//           </Col>
//           <Col span={4}>
//             <Button
//               icon={<ReloadOutlined />}
//               onClick={loadActiveSessions}
//               loading={loading}
//               disabled={joiningSessions.size > 0 || leavingSessions.size > 0}
//             >
//               Refresh
//             </Button>
//           </Col>
//           {/* <Col span={8}>
//             <div style={{ textAlign: "right" }}>
//               <Badge
//                 status="default"
//                 // text="Manual refresh only (auto-refresh disabled)"
//               />
//             </div>
//           </Col> */}
//         </Row>
//       </Card>

//       <Row gutter={24}>
//         {/* Active Sessions */}
//         <Col span={12}>
//           <Card
//             title="Active Sessions"
//             extra={
//               <Badge
//                 count={activeSessions.length}
//                 style={{ backgroundColor: "#52c41a" }}
//               />
//             }
//           >
//             <Spin spinning={loading}>
//               <List
//                 dataSource={activeSessions}
//                 renderItem={(session) => {
//                   const isProcessing = isSessionProcessing(session.sessionId);
//                   const processingStatus = getSessionProcessingStatus(
//                     session.sessionId
//                   );
//                   const isJoined = joinedSessions.some(
//                     (js) => js.sessionId === session.sessionId
//                   );

//                   return (
//                     <List.Item
//                       actions={[
//                         !isJoined ? (
//                           <Button
//                             type="primary"
//                             icon={<EyeOutlined />}
//                             onClick={() => handleJoinSession(session.sessionId)}
//                             loading={isProcessing}
//                             size="small"
//                           >
//                             {processingStatus || "Join"}
//                           </Button>
//                         ) : (
//                           <Button
//                             type="default"
//                             danger
//                             onClick={() =>
//                               handleLeaveSession(session.sessionId)
//                             }
//                             loading={isProcessing}
//                             size="small"
//                           >
//                             {processingStatus || "Leave"}
//                           </Button>
//                         ),
//                         <Button
//                           icon={<MessageOutlined />}
//                           onClick={() => {
//                             const firstStudent = session.students?.[0];
//                             if (firstStudent) {
//                               setMessageModal({
//                                 visible: true,
//                                 sessionId: session.sessionId,
//                                 studentId: firstStudent.globalId,
//                               });
//                             }
//                           }}
//                           size="small"
//                           disabled={!session.students?.length}
//                         >
//                           Message
//                         </Button>,
//                       ]}
//                     >
//                       <List.Item.Meta
//                         title={
//                           <div>
//                             <span>
//                               Session {session.sessionId.toString().slice(-8)}
//                             </span>
//                             {session.violationCount > 0 && (
//                               <Badge
//                                 count={session.violationCount}
//                                 style={{
//                                   marginLeft: 8,
//                                   backgroundColor: "#ff4d4f",
//                                 }}
//                               />
//                             )}
//                             {isJoined && (
//                               <Badge
//                                 status="success"
//                                 text="Joined"
//                                 style={{ marginLeft: 8 }}
//                               />
//                             )}
//                           </div>
//                         }
//                         description={
//                           <div>
//                             <div>
//                               <strong>Test:</strong>{" "}
//                               {session.testId?.toString().slice(-8) ||
//                                 "Unknown"}
//                             </div>
//                             <div>
//                               <strong>Students:</strong>{" "}
//                               {session.activeStudentCount}/
//                               {session.totalStudentCount}
//                             </div>
//                             <div>
//                               <strong>Duration:</strong>{" "}
//                               {formatDuration(session.sessionDuration)}
//                             </div>
//                             <div>
//                               <strong>Created:</strong>{" "}
//                               {new Date(session.createdAt).toLocaleTimeString()}
//                             </div>
//                           </div>
//                         }
//                       />
//                     </List.Item>
//                   );
//                 }}
//               />
//             </Spin>
//           </Card>
//         </Col>

//         {/* Joined Sessions with Video Feeds */}
//         <Col span={12}>
//           <Card
//             title="Monitoring Sessions"
//             extra={
//               <Badge
//                 count={joinedSessions.length}
//                 style={{ backgroundColor: "#1890ff" }}
//               />
//             }
//           >
//             {joinedSessions.length === 0 ? (
//               <div
//                 style={{ textAlign: "center", padding: "40px", color: "#999" }}
//               >
//                 No sessions joined yet. Join a session to start monitoring.
//               </div>
//             ) : (
//               joinedSessions.map((session) => (
//                 <Card
//                   key={session.sessionId}
//                   size="small"
//                   title={`Session ${session.sessionId.toString().slice(-8)}`}
//                   style={{ marginBottom: "16px" }}
//                   extra={
//                     <Button
//                       type="link"
//                       danger
//                       onClick={() => handleLeaveSession(session.sessionId)}
//                       loading={leavingSessions.has(session.sessionId)}
//                     >
//                       Leave
//                     </Button>
//                   }
//                 >
//                   <div>
//                     <strong>Channel:</strong> {session.channelName}
//                   </div>
//                   <div>
//                     <strong>Remote Users:</strong>{" "}
//                     {session.remoteUsers?.length || 0}
//                   </div>

//                   {/* ✅ ENHANCED: Video container with comprehensive debugging display */}
//                   <div style={{ marginTop: "12px" }}>
//                     {session.remoteUsers && session.remoteUsers.length > 0 ? (
//                       session.remoteUsers.map((user) => (
//                         <div key={user.uid} style={{ marginBottom: "8px" }}>
//                           <div
//                             style={{
//                               display: "flex",
//                               justifyContent: "space-between",
//                               alignItems: "center",
//                               marginBottom: "4px",
//                             }}
//                           >
//                             <span>
//                               <strong>Student UID:</strong> {user.uid}
//                             </span>
//                             <span style={{ fontSize: "12px" }}>
//                               {user.videoTrack ? (
//                                 <Badge status="success" text="📹 Video Ready" />
//                               ) : (
//                                 <Badge
//                                   status="processing"
//                                   text="⏳ Waiting for video..."
//                                 />
//                               )}
//                             </span>
//                           </div>

//                           {/* Video Container */}
//                           <div
//                             id={`video-${session.sessionId}-${user.uid}`}
//                             style={{
//                               width: "100%",
//                               height: "200px",
//                               background: "#000",
//                               border: user.videoTrack
//                                 ? "2px solid #52c41a"
//                                 : "1px solid #d9d9d9",
//                               borderRadius: "4px",
//                               display: "flex",
//                               alignItems: "center",
//                               justifyContent: "center",
//                               color: "#fff",
//                               position: "relative",
//                               overflow: "hidden",
//                             }}
//                           >
//                             {!user.videoTrack && (
//                               <div style={{ textAlign: "center", zIndex: 10 }}>
//                                 <div
//                                   style={{
//                                     fontSize: "16px",
//                                     marginBottom: "8px",
//                                   }}
//                                 >
//                                   ⏳ Waiting for video...
//                                 </div>
//                                 <div style={{ fontSize: "12px", opacity: 0.8 }}>
//                                   UID: {user.uid}
//                                 </div>
//                                 <div
//                                   style={{
//                                     fontSize: "10px",
//                                     opacity: 0.6,
//                                     marginTop: "4px",
//                                   }}
//                                 >
//                                   Container: video-{session.sessionId}-
//                                   {user.uid}
//                                 </div>
//                               </div>
//                             )}

//                             {/* Debug overlay when video track exists */}
//                             {user.videoTrack && (
//                               <div
//                                 style={{
//                                   position: "absolute",
//                                   top: 5,
//                                   left: 5,
//                                   background: "rgba(0,0,0,0.8)",
//                                   color: "white",
//                                   padding: "4px 8px",
//                                   borderRadius: "4px",
//                                   fontSize: "10px",
//                                   zIndex: 20,
//                                 }}
//                               >
//                                 📹 Track:{" "}
//                                 {user.videoTrack.enabled
//                                   ? "Enabled"
//                                   : "Disabled"}{" "}
//                                 | Muted: {user.videoTrack.muted ? "Yes" : "No"}
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       ))
//                     ) : (
//                       <div
//                         style={{
//                           textAlign: "center",
//                           padding: "20px",
//                           color: "#999",
//                         }}
//                       >
//                         No students connected to this session
//                       </div>
//                     )}
//                   </div>
//                 </Card>
//               ))
//             )}
//           </Card>
//         </Col>
//       </Row>

//       {/* Message Modal */}
//       <Modal
//         title="Send Message to Student"
//         open={messageModal.visible}
//         onOk={handleSendMessage}
//         onCancel={() =>
//           setMessageModal({ visible: false, sessionId: null, studentId: null })
//         }
//         okText="Send"
//         disabled={!message.trim()}
//       >
//         <Input.TextArea
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//           placeholder="Type your message to the student..."
//           rows={4}
//           maxLength={500}
//         />
//         <div style={{ marginTop: "8px", color: "#999", fontSize: "12px" }}>
//           {message.length}/500 characters
//         </div>
//       </Modal>
//       <div>
//         <div>
//           <h2>Live Proctoring</h2>
//           <div>Total Candidates: {jobData?.data?.approvedStudents?.length}</div>
//           <div>
//             Appeared Candidates:{" "}
//             {appliedStudents
//               .filter((s) => jobData?.data?.approvedStudents?.includes(s._id))
//               .map((stu) => {
//                 const session = activeSessions.find((sess) =>
//                   sess.students?.some((s) => s.globalId === stu.globalId)
//                 );
//                 return (
//                   <div
//                     key={stu?._id}
//                     onClick={() =>
//                       session && handleJoinSession(session.sessionId)
//                     }
//                   >
//                     <div
//                       style={{
//                         display: "flex",
//                         alignItems: "center",
//                         gap: "10px",
//                       }}
//                     >
//                       <div>
//                         <img
//                           style={{
//                             width: "100px",
//                             height: "100px",
//                             borderRadius: "50%",
//                           }}
//                           src={stu?.profile}
//                           alt="profile pic"
//                         />
//                       </div>
//                       <span>
//                         {activeSessions.some(
//                           (sess) => sess.createdBy == stu?.globalId
//                         )
//                           ? "active"
//                           : "inactive"}
//                       </span>
//                       <p>
//                         {stu?.firstName} {stu?.lastName}
//                       </p>
//                     </div>
//                   </div>
//                 );
//               })}
//           </div>
//         </div>
//         <div></div>
//       </div>
//     </div>
//   );
// };

// export default ProctorDashboard;

"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Button,
  Badge,
  Input,
  Modal,
  notification,
  Avatar,
  Typography,
  Space,
  Spin,
} from "antd";
import {
  SearchOutlined,
  MessageOutlined,
  StopOutlined,
  EyeOutlined,
  ReloadOutlined,
  UserOutlined,
  UsergroupAddOutlined,
  CameraOutlined,
  FlagOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import useProctoringProctor from "@/utils/universalUtils/liveProctoring/useProctoringProctor";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import styles from "./ProctorDashboard.module.scss";
import { useDispatch } from "react-redux";
import { getAllAppliedStudents } from "@/redux/slices/company/skillMedhaData";

const { Text } = Typography;
const { Search } = Input;

import Slider from "react-slick";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { GetOneJob } from "@/redux/slices/company/placementsSlice";
import { proctoringServerUrl, socketServerUrl } from "@/utils/universalUtils/urls";

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
    status: jobStatus,
    error: jobErr,
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
  const settings = {
    dots: true,
    infinite: true,
    autoPlay: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
  };
  // Get approved students with session data
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

  // Filter candidates based on search
  const filteredCandidates = studentsWithSessions?.filter(
    (candidate) =>
      `${candidate.firstName} ${candidate.lastName}`
        .toLowerCase()
        .includes(searchValue.toLowerCase()) || []
  );

  // Manual refresh
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

  // Load on mount
  useEffect(() => {
    loadActiveSessions();
  }, [companyOrg]);

  // Show violation notifications
  useEffect(() => {
    if (violations.length > 0) {
      const latestViolation = violations[0];
      if (!latestViolation?.violation?.some((v) => v?.severity !== "LOW"))
        return; // Ignore low severity only violations
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

  // ✅ FIXED: Enhanced video playing with immediate playback
  const playVideo = useCallback((session, user) => {
    const containerId = `video-${session.sessionId}-${user.uid}`;
    const container = document.getElementById(containerId);

    console.log(`🎥 Playing video for user ${user.uid}:`, {
      containerId,
      containerExists: !!container,
      hasVideoTrack: !!user.videoTrack,
      trackEnabled: user.videoTrack?.enabled,
    });

    if (!container || !user.videoTrack) {
      console.warn(`❌ Missing requirements for user ${user.uid}`);
      return;
    }

    try {
      // Clear container first
      container.innerHTML = "";

      // ✅ Play immediately without waiting
      user.videoTrack.play(containerId);
      console.log(`✅ Video initiated for user ${user.uid}`);

      // ✅ Add verification with shorter delay
      setTimeout(() => {
        const videoElement = container.querySelector("video");
        if (videoElement) {
          // Ensure video is playing and unmuted for debugging
          videoElement.muted = true; // Required for autoplay
          videoElement.playsInline = true;

          const playPromise = videoElement.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log(
                  `🎬 Video playing successfully for user ${user.uid}`
                );
              })
              .catch((error) => {
                console.warn(
                  `⚠️ Video play issue for user ${user.uid}:`,
                  error
                );
                // Try manual trigger
                videoElement.click();
              });
          }
        }
      }, 500); // Reduced delay
    } catch (error) {
      console.error(`❌ Video play error for user ${user.uid}:`, error);
    }
  }, []);

  // ✅ FIXED: Immediate video effect with better timing
  useEffect(() => {
    console.log("🎬 Processing joined sessions:", {
      sessionCount: joinedSessions.length,
      sessions: joinedSessions.map((s) => ({
        id: s.sessionId?.toString().slice(-8),
        users: s.remoteUsers?.length || 0,
      })),
    });

    // ✅ Process videos immediately
    joinedSessions.forEach((session) => {
      if (session.remoteUsers && session.remoteUsers.length > 0) {
        session.remoteUsers.forEach((user) => {
          const containerId = `video-${session.sessionId}-${user.uid}`;
          const container = document.getElementById(containerId);

          if (container && user.videoTrack) {
            // ✅ Check if video already exists to avoid duplicate calls
            const existingVideo = container.querySelector("video");
            if (!existingVideo) {
              console.log(`🚀 Starting video for user ${user.uid}`);
              // ✅ Use requestAnimationFrame for better timing
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

  // ✅ FIXED: Enhanced join session with immediate callback
  const handleJoinSession = async (sessionId) => {
    if (joiningSessions.has(sessionId)) return;

    try {
      setJoiningSessions((prev) => new Set([...prev, sessionId]));

      console.log("🎥 Joining session:", sessionId);
      await joinSession(sessionId, companyOrg);

      // ✅ Immediate success feedback
      notification.success({
        message: "Joined Session",
        description: `Successfully joined monitoring session`,
        duration: 2,
      });
    } catch (error) {
      console.error("❌ Join session error:", error);
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

  // ✅ FIXED: Enhanced candidate click with immediate video setup
  const handleCandidateClick = useCallback(
    (candidate) => {
      console.log(
        "🖱️ Candidate clicked:",
        candidate.firstName,
        candidate.lastName
      );

      // ✅ Set selected candidate immediately
      setSelectedCandidate(candidate);

      if (candidate.session) {
        if (!candidate.isJoined) {
          console.log("📞 Joining session for candidate");
          handleJoinSession(candidate.session.sessionId);
        } else {
          console.log("✅ Already joined, video should be available");
          // ✅ If already joined, trigger video refresh
          const session = joinedSessions.find(
            (js) => js.sessionId === candidate.session.sessionId
          );
          if (session && session.remoteUsers) {
            session.remoteUsers.forEach((user) => {
              // Small delay to ensure DOM is ready
              setTimeout(() => playVideo(session, user), 100);
            });
          }
        }
      }
    },
    [handleJoinSession, joinedSessions, playVideo]
  );

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
