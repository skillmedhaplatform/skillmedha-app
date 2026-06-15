"use client";
import React from "react";
import styles from "@/app/tpo/(protected)/placementdrive/[id]/[jobid]/jobDetails.module.scss";
import { useParams } from "next/navigation";
import {
  HiOutlineUser,
  HiOutlineBriefcase,
  HiOutlineAcademicCap,
  HiOutlineClipboardDocumentCheck,
  HiOutlineMapPin,
  HiOutlineCurrencyRupee,
  HiOutlineCalendarDays,
  HiOutlineInformationCircle,
  HiOutlineCheckCircle
} from "react-icons/hi2";

export default function JobDetails({ JOBPROFILE, ALLPLACEMENTS, activeTab = "basic" }) {
  const { id } = useParams();

  const isDriveActive = () => {
    if (!JOBPROFILE?.endDate) return true;
    try {
      const deadline = new Date(JOBPROFILE.endDate);
      return deadline >= new Date();
    } catch {
      return true;
    }
  };

  if (!JOBPROFILE) {
    return (
      <div className={styles.card}>
        <p style={{ textAlign: "center", color: "#64748b" }}>Loading job details...</p>
      </div>
    );
  }

  if (activeTab === "basic") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {/* Horizontal Company Summary Card Row */}
        <div className={styles.card} style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "1.5rem", flexWrap: "wrap", padding: "1.25rem 1.75rem" }}>
          <div className={styles.logoContainer} style={{ width: "60px", height: "60px", flexShrink: 0 }}>
            {JOBPROFILE?.companyLogo ? (
              <img
                src={JOBPROFILE.companyLogo}
                style={{ objectFit: "contain", width: "100%", height: "100%" }}
                alt="Company Logo"
              />
            ) : (
              <span style={{ fontSize: "1.5rem", color: "#cbd5e1" }}>💼</span>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <h3 className={styles.companyName} style={{ textAlign: "left", fontSize: "1.2rem" }}>{JOBPROFILE?.companyName || "Company Name"}</h3>
            <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 500 }}>Placement Drive Profile</span>
          </div>

          <div style={{ marginLeft: "auto", display: "flex", gap: "2.5rem", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Applicants</span>
              <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "#334155" }}>{JOBPROFILE?.applicants?.length || 0}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Status</span>
              <span className={`${styles.statusBadge} ${!isDriveActive() ? styles.inactive : ""}`} style={{ alignSelf: "flex-start", marginTop: "2px" }}>
                {isDriveActive() ? "Active" : "Closed"}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Deadline</span>
              <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "#334155" }}>{JOBPROFILE?.endDate || "N/A"}</span>
            </div>
          </div>
        </div>
        {/* Company Coordinator Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIcon}><HiOutlineUser /></span>
            <span>Company Coordinator</span>
          </div>
          <div className={styles.infoGrid}>
            <div className={styles.gridItem}>
              <span className={styles.gridLabel}>Name</span>
              <span className={styles.gridValue}>{JOBPROFILE?.coordinatorName || "N/A"}</span>
            </div>
            <div className={styles.gridItem}>
              <span className={styles.gridLabel}>Phone</span>
              <span className={styles.gridValue}>{JOBPROFILE?.coordinatorPhone || "N/A"}</span>
            </div>
            <div className={styles.gridItem}>
              <span className={styles.gridLabel}>Email</span>
              <span className={styles.gridValue}>{JOBPROFILE?.coordinatorEmail || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIcon}><HiOutlineInformationCircle /></span>
            <span>Summary</span>
          </div>
          <div className={styles.infoGrid}>
            <div className={styles.gridItem}>
              <span className={styles.gridLabel}>Company</span>
              <span className={styles.gridValue}>{JOBPROFILE?.companyName || "N/A"}</span>
            </div>
            <div className={styles.gridItem}>
              <span className={styles.gridLabel}>Drive</span>
              <span className={styles.gridValue}>
                {ALLPLACEMENTS?.data?.find((p) => p._id === id)?.driveName || "N/A"}
              </span>
            </div>
            <div className={styles.gridItem}>
              <span className={styles.gridLabel}>Application Start Date</span>
              <span className={styles.gridValue}>{JOBPROFILE?.startDate || "N/A"}</span>
            </div>
            <div className={styles.gridItem}>
              <span className={styles.gridLabel}>Application End Date</span>
              <span className={styles.gridValue}>{JOBPROFILE?.endDate || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Applicable Courses Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIcon}><HiOutlineAcademicCap /></span>
            <span>Applicable Courses</span>
          </div>
          <div className={styles.badgeGrid}>
            {JOBPROFILE?.applicableCourses?.length > 0 ? (
              JOBPROFILE.applicableCourses.map((course, i) => (
                <span key={i} className={styles.pillBadge}>
                  {course?.degree} - {course?.department}
                </span>
              ))
            ) : (
              <p style={{ color: "#64748b", margin: 0 }}>No course restrictions specified</p>
            )}
          </div>
        </div>

        {/* Eligibility Criteria Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIcon}><HiOutlineClipboardDocumentCheck /></span>
            <span>Eligibility Criteria</span>
          </div>
          <div className={styles.checkList}>
            {(JOBPROFILE?.eligibilityCriteria?.length > 0) ? (
              JOBPROFILE.eligibilityCriteria.map((criteria, i) => (
                <div key={i} className={styles.checkItem}>
                  <span className={styles.checkIcon}><HiOutlineCheckCircle /></span>
                  <span>
                    Minimum <strong>{criteria?.minMarksPercentage}% marks</strong> in {criteria?.educationLevel}
                  </span>
                </div>
              ))
            ) : (
              <div className={styles.checkItem}>
                <span className={styles.checkIcon}><HiOutlineCheckCircle /></span>
                <span>Open for all students (No specific eligibility criteria)</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === "jobProfile") {
    // Skills formatting helper: split by comma if string, or map if array
    let skillsArray = [];
    if (Array.isArray(JOBPROFILE?.skills)) {
      skillsArray = JOBPROFILE.skills;
    } else if (typeof JOBPROFILE?.skills === "string") {
      skillsArray = JOBPROFILE.skills.split(",").map(s => s.trim()).filter(Boolean);
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {/* Job Details Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIcon}><HiOutlineBriefcase /></span>
            <span>Job Description & Overview</span>
          </div>
          <div className={styles.infoGrid}>
            <div className={styles.gridItem}>
              <span className={styles.gridLabel}>Job Title</span>
              <span className={styles.gridValue}>{JOBPROFILE?.jobTitle || "N/A"}</span>
            </div>
            <div className={styles.gridItem}>
              <span className={styles.gridLabel}>Job Type</span>
              <span className={styles.gridValue}>{JOBPROFILE?.jobType || "N/A"}</span>
            </div>
            <div className={styles.gridItem}>
              <span className={styles.gridLabel}>Sector</span>
              <span className={styles.gridValue}>{JOBPROFILE?.sector || "N/A"}</span>
            </div>
            <div className={styles.gridItem}>
              <span className={styles.gridLabel}>Salary Package (CTC)</span>
              <span className={styles.gridValue}>
                {JOBPROFILE?.ctc ? `₹ ${JOBPROFILE.ctc.toLocaleString("en-IN")} per annum` : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Location Details Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIcon}><HiOutlineMapPin /></span>
            <span>Location Details</span>
          </div>
          <div className={styles.infoGrid}>
            <div className={styles.gridItem} style={{ gridColumn: "span 2" }}>
              <span className={styles.gridLabel}>Address</span>
              <span className={styles.gridValue}>
                {[JOBPROFILE?.street, JOBPROFILE?.area, JOBPROFILE?.city, JOBPROFILE?.zip, JOBPROFILE?.country]
                  .filter(Boolean)
                  .join(", ") || "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Description Text */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIcon}><HiOutlineInformationCircle /></span>
            <span>Full Job Description</span>
          </div>
          <div className={styles.descriptionBox}>
            {JOBPROFILE?.description || "No job description provided."}
          </div>
        </div>

        {/* Skills Tags */}
        {skillsArray.length > 0 && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}><HiOutlineCheckCircle /></span>
              <span>Skills Required</span>
            </div>
            <div className={styles.badgeGrid}>
              {skillsArray.map((skill, index) => (
                <span key={index} className={styles.pillBadge}>{skill}</span>
              ))}
            </div>
          </div>
        )}

        {/* Supplemental Pay */}
        {JOBPROFILE?.supplementalPay?.length > 0 && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}><HiOutlineCurrencyRupee /></span>
              <span>Supplemental Pay</span>
            </div>
            <div className={styles.badgeGrid}>
              {JOBPROFILE.supplementalPay.map((pay, index) => (
                <span key={index} className={styles.pillBadge}>{pay}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (activeTab === "interview") {
    return (
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardIcon}><HiOutlineCalendarDays /></span>
          <span>Interview Process Timeline</span>
        </div>
        {JOBPROFILE?.interviewRounds?.length > 0 ? (
          <div className={styles.timeline}>
            {JOBPROFILE.interviewRounds.map((round, idx) => (
              <div key={idx} className={styles.timelineNode}>
                <div className={styles.timelineDot}></div>
                <div className={styles.timelineCard}>
                  <div className={styles.timelineHeader}>
                    <h4>Round {idx + 1}: {round?.roundName || "N/A"}</h4>
                    <span className={styles.roundTypeBadge}>{round?.type || "N/A"}</span>
                  </div>
                  <div className={styles.timelineInfoGrid}>
                    <div className={styles.gridItem}>
                      <span className={styles.gridLabel}>Mode</span>
                      <span className={styles.gridValue}>{round?.mode || "N/A"}</span>
                    </div>
                    <div className={styles.gridItem}>
                      <span className={styles.gridLabel}>Venue</span>
                      <span className={styles.gridValue}>{round?.venue || "N/A"}</span>
                    </div>
                    <div className={styles.gridItem} style={{ gridColumn: "span 2" }}>
                      <span className={styles.gridLabel}>Schedule</span>
                      <span className={styles.gridValue}>
                        {round?.schedule?.startDate} ➖ {round?.schedule?.endDate}
                      </span>
                    </div>
                  </div>
                  {round?.description && (
                    <div className={styles.descriptionBox} style={{ marginTop: "0.5rem" }}>
                      {round.description}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "#64748b", textAlign: "center", margin: "1rem 0" }}>
            No interview rounds or timeline process specified for this drive.
          </p>
        )}
      </div>
    );
  }

  return null;
}
