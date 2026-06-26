"use client";
import { getScheduledInterviewsForJob, updateStudentAndJobStatus } from "@/redux/slices/company/skillMedhaData";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Dropdown, Pagination } from "antd";
// import { ChevronRight } from "lucide-react";
import styles from "./styles/int.module.scss";
import JobStyles from "../../../myjobs/components/myJobsStyles.module.scss";
import { GetOneJob } from "@/redux/slices/company/placementsSlice";
import { EllipsisOutlined } from "@ant-design/icons";

const Interviews = () => {
  const params = useParams();
  const jobId = params?.jobDetails;
  const dispatch = useDispatch();

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
      candidate: d?.candidateDetails,
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

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentDataSource = dataSource.slice(startIndex, endIndex);

  return (
    <div className={styles.wrapper} style={{ marginTop: "1rem" }}>
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
        <div className={viewMode === "cards" ? styles.gridContainer : styles.listContainer}>
          {currentDataSource.map((item) => (
            <div key={item.key} className={viewMode === "cards" ? styles.gridCard : styles.listCard}>
              
              {/* Left Side: Candidate Info with Avatar */}
              <div style={{ flex: viewMode === "cards" ? "none" : 1, minWidth: "250px", display: "flex", gap: "1rem", alignItems: "center" }}>
                
                {/* Avatar */}
                <div style={{
                  width: "48px", height: "48px", borderRadius: "10px", 
                  background: "linear-gradient(135deg, rgba(107, 168, 237, 0.15) 0%, rgba(163, 204, 250, 0.25) 100%)",
                  color: "#6BA8ED", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.2rem", fontWeight: "700", flexShrink: 0
                }}>
                  {getInitials(item.candidate?.name)}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <span style={{ fontWeight: "700", color: "#1e293b", fontSize: "1.1rem" }}>
                    {item.candidate?.name || "Unknown Candidate"}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#64748b", fontSize: "0.85rem", flexWrap: "wrap" }}>
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
                <div style={{ flex: 2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1.5rem", paddingLeft: "1rem", borderLeft: "1px dashed #e2e8f0" }}>
                  
                  {/* Interview Date (List View) */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    <span style={{ fontSize: "0.7rem", color: "#a0aec0", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.5px" }}>Scheduled For</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontSize: "0.95rem", color: "#1e293b", fontWeight: "600" }}>{item.date?.val || "N/A"}</span>
                      <span style={{ color: "#cbd5e1" }}>•</span>
                      <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: "500" }}>{item.date?.time}</span>
                    </div>
                  </div>

                  {/* Interviewer (List View) */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", minWidth: "160px" }}>
                    <span style={{ fontSize: "0.7rem", color: "#a0aec0", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.5px" }}>Interviewer</span>
                    <span style={{ fontSize: "0.95rem", color: "#1e293b", fontWeight: "600" }}>{item.interviewer?.name || "N/A"}</span>
                    <span style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: "500" }}>{item.interviewer?.designation || "Not specified"}</span>
                  </div>

                  {/* Score (List View) */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", alignItems: "flex-end", minWidth: "80px" }}>
                    <span style={{ fontSize: "0.7rem", color: "#a0aec0", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.5px" }}>Score</span>
                    <span style={{ fontSize: "1.2rem", color: "#6BA8ED", fontWeight: "700", lineHeight: 1 }}>
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
      ) : (
        <div style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>No scheduled interviews found</div>
      )}

      {dataSource?.length > 0 && (
        <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={dataSource.length}
            onChange={onPageChange}
            showSizeChanger
            pageSizeOptions={['4', '10', '20', '50']}
          />
        </div>
      )}
    </div>
  );
};

export default Interviews;
