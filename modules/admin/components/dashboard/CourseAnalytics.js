import React from "react";
import styles from "./Analytics.module.scss";

const CourseAnalytics = ({ data, loading }) => {
  if (loading) return <div className={styles.loading}>Loading Course Data...</div>;
  if (!data) return null;

  const { totalEnrollments = 0, mostPopular = [], leastPopular = [] } = data;

  const formatCourseName = (name) => {
    if (!name) return "";
    // Remove anything after a hyphen or en-dash
    const parts = name.split(/[-–]/);
    return parts[0].trim();
  };

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Course Analytics</h3>
      <div className={styles.statRow}>
        <div className={styles.statItem}>
          <span className={styles.label}>Total Enrollments</span>
          <span className={styles.value}>{totalEnrollments}</span>
        </div>
      </div>

      <div className={styles.listsContainer}>
        <div className={styles.listGroup}>
          <h4>Most Popular</h4>
          <ul>
            {mostPopular.map((course) => (
              <li key={course._id} title={course.courseName}>
                <span>{formatCourseName(course.courseName)}</span>
                <span className={styles.count}>{course.enrollmentCount}</span>
              </li>
            )) || <p className={styles.empty}>No data</p>}
          </ul>
        </div>
        
        <div className={styles.listGroup}>
          <h4>Least Popular</h4>
          <ul>
            {leastPopular.map((course) => (
              <li key={course._id} title={course.courseName}>
                <span>{formatCourseName(course.courseName)}</span>
                <span className={styles.count}>{course.enrollmentCount}</span>
              </li>
            )) || <p className={styles.empty}>No data</p>}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CourseAnalytics;
