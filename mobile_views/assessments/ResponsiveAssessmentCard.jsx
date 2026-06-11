"use client";

import React from "react";
import { Tag } from "antd";
import {
  FileTextOutlined,
  ClockCircleOutlined,
  QuestionCircleOutlined,
  LockOutlined,
  UnlockOutlined,
  EyeOutlined,
  CameraOutlined
} from "@ant-design/icons";
import styles from "./responsiveAssessmentCard.module.scss";

// Utility to format date to "26 May" or similar
const formatDate = (dateString) => {
  if (!dateString) return null;
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  } catch {
    return null;
  }
};

export default function ResponsiveAssessmentCard({
  title,
  thumbnail,
  category,
  accessType,
  questionCount,
  duration,
  shortDescription,
  countdown,
  isExpired,
  isTestActivated,
  activationCountdown,
  totalMarks,
  isAssessment,
  renderButton,
  status,
  liveProctoring,
  snapShotTechnology,
  honestRespondent,
  createdAt,
  attemptsDone,
  maxAttempts,
  percentage
}) {
  // Determine clean display status and color
  const getStatusBadge = () => {
    if (isExpired) return { text: "Expired", class: styles.statusExpired };
    if (!isTestActivated) return { text: "Upcoming", class: styles.statusUpcoming };
    if (status) {
      const lower = status.toLowerCase();
      if (lower === "active") return { text: "Active", class: styles.statusActive };
      if (lower === "completed") return { text: "Completed", class: styles.statusCompleted };
      if (lower === "inprogress" || lower === "in progress") return { text: "In Progress", class: styles.statusProgress };
      return { text: status, class: styles.statusActive };
    }
    return { text: "Active", class: styles.statusActive };
  };

  const statusBadge = getStatusBadge();

  return (
    <div className={styles.cardContainer}>
      {/* 1. Left Section - Image/Thumbnail */}
      <div className={styles.leftSection}>
        <div className={styles.imageWrapper}>
          {thumbnail ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={thumbnail} alt={title} className={styles.image} />
          ) : (
            <div className={styles.placeholderLogo}>
              <FileTextOutlined className={styles.placeholderIcon} />
            </div>
          )}
        </div>
      </div>

      {/* 2. Center Section - Details */}
      <div className={styles.centerSection}>
        <h3 className={styles.title} title={title}>
          {title}
        </h3>

        {/* Metadata Row */}
        <div className={styles.metaRow}>
          {category && (
            <Tag color="blue" className={styles.tag}>
              {category}
            </Tag>
          )}

          {accessType && (
            <Tag color={accessType === "private" ? "red" : "green"} className={styles.tag}>
              {accessType === "private" ? <LockOutlined /> : <UnlockOutlined />}
              <span className="ml-1 uppercase">{accessType}</span>
            </Tag>
          )}

          {/* Status text inline */}
          {status && (
            <span className={`${styles.metaText} ${styles.statusText}`}>
              Status: <span className={styles.boldStatus}>{statusBadge.text}</span>
            </span>
          )}

          {/* Date Added */}
          {createdAt && (
            <span className={styles.metaText}>
              📅 Added {formatDate(createdAt)}
            </span>
          )}

          {/* Time Left */}
          {countdown && countdown !== "No expiry set" && (
            <span className={`${styles.metaText} ${isExpired ? styles.textExpired : styles.textCountdown}`}>
              ⏳ {isExpired ? "Expired" : countdown}
            </span>
          )}

          {/* Test stats */}
          <span className={styles.metaText}>
            <ClockCircleOutlined /> {duration || "NA"}
          </span>
          <span className={styles.metaText}>
            <QuestionCircleOutlined /> {questionCount || 0} Questions
          </span>

          {totalMarks !== undefined && totalMarks > 0 && !isAssessment && (
            <span className={styles.metaText}>💯 {totalMarks} Marks</span>
          )}
        </div>

        {/* Proctoring & Snapshot Tags for Job Assessments */}
        {isAssessment && (liveProctoring || snapShotTechnology || honestRespondent) && (
          <div className={styles.proctoringRow}>
            {liveProctoring && (
              <Tag color={liveProctoring === "Enable" ? "green" : "red"} className={styles.miniTag}>
                <EyeOutlined /> Proctoring: {liveProctoring}
              </Tag>
            )}
            {snapShotTechnology && (
              <Tag color={snapShotTechnology === "Enable" ? "cyan" : "orange"} className={styles.miniTag}>
                <CameraOutlined /> Snapshots: {snapShotTechnology}
              </Tag>
            )}
            {honestRespondent && (
              <Tag color="purple" className={styles.miniTag}>
                👤 {honestRespondent.type} (Max: {honestRespondent.maxAttempts})
              </Tag>
            )}
          </div>
        )}

        {/* Expiry / Activation Alert Row */}
        {(countdown || (!isTestActivated && activationCountdown)) && (
          <div className={styles.alertRow}>
            {isExpired ? (
              <span className={`${styles.alertText} ${styles.alertExpired}`}>
                ⏳ Test Expired
              </span>
            ) : countdown && countdown !== "No expiry set" ? (
              <span className={`${styles.alertText} ${styles.alertCountdown}`}>
                ⏳ Ends in: {countdown}
              </span>
            ) : null}

            {!isTestActivated && activationCountdown && (
              <span className={`${styles.alertText} ${styles.alertActivation}`}>
                🕒 {activationCountdown}
              </span>
            )}
          </div>
        )}

        {/* Short Description */}
        {shortDescription && (
          <div 
            className={styles.description}
            dangerouslySetInnerHTML={{ __html: shortDescription }}
          />
        )}
      </div>

      {/* 3. Right Section - Badge and Action */}
      <div className={styles.rightSection}>
        <div className={styles.statusAndProgress}>
          <span className={`${styles.statusBadge} ${statusBadge.class}`}>
            {statusBadge.text}
          </span>
          {percentage !== undefined && (
            <span className={styles.percentageText}>
              Score: {percentage}%
            </span>
          )}
          {attemptsDone !== undefined && attemptsDone > 0 && (
            <span className={styles.attemptsText}>
              Attempts: {attemptsDone}{maxAttempts ? `/${maxAttempts}` : ""}
            </span>
          )}
        </div>
        <div className={styles.buttonWrapper}>
          {renderButton()}
        </div>
      </div>
    </div>
  );
}
