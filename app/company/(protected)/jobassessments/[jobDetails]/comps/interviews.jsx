"use client";
import { getScheduledInterviewsForJob, updateStudentAndJobStatus } from "@/redux/slices/company/skillMedhaData";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Dropdown, Drawer } from "antd";
// import { ChevronRight } from "lucide-react";
import styles from "./styles/int.module.scss";
import JobStyles from "../../../myjobs/components/myJobsStyles.module.scss";
import { GetOneJob } from "@/redux/slices/company/placementsSlice";
import { EllipsisOutlined } from "@ant-design/icons";

const Interviews = () => {
  const params = useParams();
  const jobId = params?.jobDetails;
  const dispatch = useDispatch();

  // Mobile view drawer states
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const scheduledInterviewsForJob = useSelector(
    (state) => state.skillmedha.scheduledInterviewsForJob
  );

  useEffect(() => {
    if (jobId) {
      dispatch(getScheduledInterviewsForJob({ jobId }));
    }
  }, [jobId, dispatch]);

const students =
  scheduledInterviewsForJob?.filter((e) => {
    // Find the applied job for this jobId
    const appliedJob = e?.studentDetails?.appliedJobs?.find(
      (applied) => applied?.id === jobId
    );

    // Keep only if the appliedJob exists and status is not approved/rejected/shortlisted
    return (
      appliedJob &&
      !["approved", "rejected", "shortlisted"].includes(
        appliedJob?.status?.toLowerCase()
      )
    );
  }) || [];


  // Map API data into AntD table format
  const dataSource = students.map((s, index) => {
    const d = s.interviewDetails;    
    return {
      key: d?.interviewId || index,
      candidate: {
        ...d?.candidateDetails,
        profile: s.studentDetails?.profile || d?.candidateDetails?.profile
      },
       date :{val :  d?.date , time : d?.time},
       interviewer : d?.interviewer,
      join: "Join",
    };
  });


    const menuItems = [
    { key: "1", label: "ShortList" },
    { key: "2", label: "Reject" },
  ];
const handleMenuClick = (e, studentId) => {
  let newStatus = null;

  if (e.key === "1") {
    newStatus = "approved";
  } else if (e.key === "2") {
    newStatus = "rejected";
  }

  if (!newStatus) return;

  // 🔥 Optimistic update
  const updated = students?.map((s) => {
    if (s.studentId === studentId) {
      return {
        ...s,
        interviewDetails: {
          ...s.interviewDetails,
          status: newStatus,
        },
      };
    }
    return s;
  });

  dispatch({
    type: "skillmedha/setScheduledInterviewsForJob",
    payload: {
      ...students,
      students: updated,
    },
  });

  // API call to persist
  dispatch(
    updateStudentAndJobStatus({
      jobId: jobId,
      studentId,
      status: newStatus,
    })
  )?.then((resp) => {
    if (resp) {
      // Refresh latest from backend
      dispatch(
        getScheduledInterviewsForJob({
          jobId: jobId,
        })
      );
    }
  });
};


  const [viewMode, setViewMode] = useState("list");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(4);

  const onPageChange = (page, newPageSize) => {
    setCurrentPage(page);
    setPageSize(newPageSize);
  };

  const getInitials = (name = "") => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return (name[0] || "U").toUpperCase();
  };

  const currentDataSource = dataSource;

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <div className={styles.viewToggle}>
          <button
            className={`${styles.toggleBtn} ${viewMode === "list" ? styles.toggleBtnActive : ""}`}
            onClick={() => setViewMode("list")}
            title="List view"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4H14M2 8H14M2 12H14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </button>
          <button
            className={`${styles.toggleBtn} ${viewMode === "cards" ? styles.toggleBtnActive : ""}`}
            onClick={() => setViewMode("cards")}
            title="Tile view"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" />
              <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" />
              <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" />
              <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" />
            </svg>
          </button>
        </div>
      </div>

      {dataSource?.length > 0 ? (
        <>
          {/* Desktop View container */}
          <div className={`${viewMode === "cards" ? styles.gridContainer : styles.listContainer} ${styles.desktopOnly}`}>
            {currentDataSource.map((item) => (
              <div key={item.key} className={viewMode === "cards" ? styles.gridCard : styles.listCard}>
                
                {/* Left Side: Candidate Info with Avatar */}
                <div className={styles.candidateInfo}>
                  
                  {/* Avatar */}
                  <div className={styles.avatarCont}>
                    {item.candidate?.profile ? (
                      <img
                        src={item.candidate.profile}
                        alt="avatar"
                        style={{ width: "100%", height: "100%", borderRadius: "10px", objectFit: "cover" }}
                      />
                    ) : (
                      getInitials(item.candidate?.name)
                    )}
                  </div>

                  <div className={styles.nameCont}>
                    <span className={styles.nameText}>
                      {item.candidate?.name || "Unknown Candidate"}
                    </span>
                    <div className={styles.subInfoRow}>
                      <span>{item.candidate?.email || "No Email"}</span>
                      {item.candidate?.phone && (
                        <>
                          <span style={{ color: "#cbd5e1" }}>•</span>
                          <span>{item.candidate?.phone}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Middle Section: Meta information */}
                {viewMode === "cards" ? (
                  <div className={JobStyles.cardMeta} style={{ justifyContent: "space-between", marginTop: "0.5rem", borderTop: "1px dashed #e2e8f0", paddingTop: "1.25rem" }}>
                    
                    {/* Score */}
                    <div className={JobStyles.metaItem} style={{ alignItems: "flex-start" }}>
                      <span className={JobStyles.metaLabel}>Score</span>
                      <span className={JobStyles.metaValue} style={{ fontSize: "1.15rem", color: "#6BA8ED" }}>
                        {item.candidate?.gainedScore || 0} <span style={{ color: "#94a3b8", fontSize: "0.85rem", fontWeight: "500" }}>/ {item.candidate?.totalScore || 0}</span>
                      </span>
                    </div>

                    {/* Interview Date */}
                    <div className={JobStyles.metaItem} style={{ alignItems: "flex-start" }}>
                      <span className={JobStyles.metaLabel}>Scheduled For</span>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem", alignItems: "flex-start" }}>
                        <span className={JobStyles.metaValue} style={{ fontSize: "0.95rem" }}>{item.date?.val || "N/A"}</span>
                        <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "500" }}>{item.date?.time}</span>
                      </div>
                    </div>

                    {/* Interview By */}
                    <div className={JobStyles.metaItem} style={{ alignItems: "flex-start" }}>
                      <span className={JobStyles.metaLabel}>Interviewer</span>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem", alignItems: "flex-start" }}>
                        <span className={JobStyles.metaValue} style={{ fontSize: "0.95rem" }}>{item.interviewer?.name || "N/A"}</span>
                        <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "500" }}>{item.interviewer?.designation || "Not specified"}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={styles.metaRowList}>
                    
                    {/* Interview Date (List View) */}
                    <div className={styles.metaItemColumn}>
                      <span className={styles.metaLabelText}>Scheduled For</span>
                      <div className={styles.metaValueRow}>
                        <span className={styles.dateValText}>{item.date?.val || "N/A"}</span>
                        <span className={styles.bulletDot}>•</span>
                        <span className={styles.dateTimeText}>{item.date?.time}</span>
                      </div>
                    </div>

                    {/* Interviewer (List View) */}
                    <div className={styles.metaItemColumn} style={{ minWidth: "160px" }}>
                      <span className={styles.metaLabelText}>Interviewer</span>
                      <span className={styles.interviewerName}>{item.interviewer?.name || "N/A"}</span>
                      <span className={styles.interviewerDesig}>{item.interviewer?.designation || "Not specified"}</span>
                    </div>

                    {/* Score (List View) */}
                    <div className={styles.metaItemColumn} style={{ alignItems: "flex-end" }}>
                      <span className={styles.metaLabelText}>Score</span>
                      <span className={styles.scoreValueText}>
                        {item.candidate?.gainedScore || 0}<span style={{ fontSize: "0.85rem", color: "#94a3b8", fontWeight: "500" }}>/{item.candidate?.totalScore || 0}</span>
                      </span>
                    </div>

                  </div>
                )}

                {/* Action Dropdown */}
                <div className={JobStyles.cardActions}>
                  <Dropdown 
                    menu={{ items: menuItems, onClick: (e) => handleMenuClick(e, item?.candidate?._id) }}  
                    placement="bottomRight" 
                    arrow
                  >
                    <EllipsisOutlined className={styles.moreIcon} style={{ cursor: "pointer", fontSize: "1.5rem", color: "#64748b" }} />
                  </Dropdown>
                </div>

              </div>
            ))}
          </div>

          {/* Mobile View container (Compact tiles) */}
          <div className={`${styles.mobileOnly} ${styles.mobileTileList}`}>
            {currentDataSource.map((item) => {
              const sName = item.candidate?.name || "Unknown Candidate";
              return (
                <div
                  key={item.key}
                  className={styles.studentMobileTile}
                  onClick={() => {
                    setSelectedInterview(item);
                    setIsDrawerOpen(true);
                  }}
                >
                  <div className={styles.avatarCont}>
                    {item.candidate?.profile ? (
                      <img
                        src={item.candidate.profile}
                        alt="avatar"
                        style={{ width: "100%", height: "100%", borderRadius: "10px", objectFit: "cover" }}
                      />
                    ) : (
                      getInitials(sName)
                    )}
                  </div>
                  <div className={styles.tileInfo}>
                    <span className={styles.tileName}>{sName}</span>
                    <span className={styles.tileEmail}>{item.candidate?.email || "No Email"}</span>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <Dropdown
                      menu={{ items: menuItems, onClick: (e) => handleMenuClick(e, item?.candidate?._id) }}
                      placement="bottomRight"
                      arrow
                    >
                      <EllipsisOutlined className={styles.moreIcon} style={{ cursor: "pointer", fontSize: "1.5rem", color: "#64748b" }} />
                    </Dropdown>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>No scheduled interviews found</div>
      )}

      {/* Bottom Drawer for Mobile View */}
      <Drawer
        title="Interview Details"
        placement="bottom"
        closable={true}
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
        height="90vh"
        bodyStyle={{ padding: "1.25rem" }}
        headerStyle={{ borderBottom: "1px solid #f1f5f9" }}
        style={{ borderTopLeftRadius: "16px", borderTopRightRadius: "16px", overflow: "hidden" }}
      >
        {selectedInterview && (
          <div className={styles.drawerContent}>
            {/* Drawer Header */}
            <div className={styles.drawerHeader}>
              {selectedInterview.candidate?.profile ? (
                <img
                  src={selectedInterview.candidate.profile}
                  alt="Avatar"
                  style={{ width: "60px", height: "60px", borderRadius: "50%", objectFit: "cover" }}
                />
              ) : (
                <div className={styles.drawerAvatar}>
                  {getInitials(selectedInterview.candidate?.name)}
                </div>
              )}
              <div className={styles.drawerMainInfo}>
                <span className={styles.drawerName}>
                  {selectedInterview.candidate?.name || "Unknown Candidate"}
                </span>
                <span className={styles.drawerEmail}>
                  {selectedInterview.candidate?.email || "No Email"}
                </span>
              </div>
            </div>

            {/* Rest of information */}
            <div className={styles.drawerDetailGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Scheduled For</span>
                <span className={styles.detailValue}>
                  {selectedInterview.date?.val || "N/A"}
                </span>
                <span className={styles.detailSubText}>
                  {selectedInterview.date?.time}
                </span>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Interviewer</span>
                <span className={styles.detailValue}>
                  {selectedInterview.interviewer?.name || "N/A"}
                </span>
                <span className={styles.detailSubText}>
                  {selectedInterview.interviewer?.designation || "Not specified"}
                </span>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Gained Score / Total Score</span>
                <span className={styles.detailValue} style={{ color: "#6BA8ED", fontWeight: "700" }}>
                  {selectedInterview.candidate?.gainedScore || 0} / {selectedInterview.candidate?.totalScore || 0}
                </span>
              </div>
            </div>

            {/* Action Row */}
            <div className={styles.actionRow}>
              <Button
                type="default"
                onClick={() => {
                  handleMenuClick({ key: "2" }, selectedInterview?.candidate?._id);
                  setIsDrawerOpen(false);
                }}
                style={{ borderColor: "#ef4444", color: "#ef4444" }}
              >
                Reject
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  handleMenuClick({ key: "1" }, selectedInterview?.candidate?._id);
                  setIsDrawerOpen(false);
                }}
                style={{ backgroundColor: "#22c55e", borderColor: "#22c55e" }}
              >
                Shortlist
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Interviews;
