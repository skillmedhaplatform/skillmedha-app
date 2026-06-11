import React from "react";
import styles from "./Analytics.module.scss";

const RevenueAnalytics = ({ data, loading }) => {
  if (loading) return <div className={styles.loading}>Loading Revenue Data...</div>;
  if (!data) return null;

  const { totalRevenue = 0, revenueByCourse = [] } = data;

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Revenue Analytics</h3>
      
      <div className={styles.totalRevenue}>
        <span className={styles.label}>Total Revenue</span>
        <span className={styles.value}>₹{totalRevenue.toLocaleString()}</span>
      </div>

      <div className={styles.courseRevenueList}>
        <h4>Revenue by Course</h4>
        <div className={styles.scrollableList}>
          {revenueByCourse.map((course) => (
            <div key={course._id} className={styles.revenueItem}>
              <span className={styles.courseName}>{course.courseName}</span>
              <span className={styles.amount}>₹{course.revenue.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RevenueAnalytics;
