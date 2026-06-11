import React from "react";
import styles from "./Analytics.module.scss";

const JobAnalytics = ({ jobData, placementData, loading }) => {
  if (loading) return <div className={styles.loading}>Loading Job Data...</div>;
  
  const { applications = 0, averageApplicationsPerStudent = 0 } = jobData || {};
  const { studentsPlaced = 0, placementRate = "0%" } = placementData || {};

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Job & Placement Activity</h3>
      
      <div className={styles.gridStats}>
        <div className={styles.statBox}>
          <span className={styles.label}>Total Applications</span>
          <span className={styles.value}>{applications}</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.label}>Avg Apps/Student</span>
          <span className={styles.value}>{averageApplicationsPerStudent}</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.label}>Students Placed</span>
          <span className={styles.value}>{studentsPlaced}</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.label}>Placement Rate</span>
          <span className={styles.value}>{placementData?.placementRate || "0%"}</span>
        </div>
      </div>
    </div>
  );
};

export default JobAnalytics;
