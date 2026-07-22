"use client";

import { useState, useEffect } from "react";
import styles from "./JobDetailsDisplay.module.scss";
import { getLstorage, decrypt, encrypt } from "@/utils/windowMW";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { IoCaretForwardOutline } from "react-icons/io5";

// Custom Breadcrumb Item Component
const BreadcrumbItem = ({ title, onClick, isLast }) => {
  const truncatedTitle =
    title && title.length > 25 ? `${title.substring(0, 25)}...` : title;

  return (
    <>
      {isLast ? (
        <span
          className={styles.breadcrumbCurrent}
          style={{ maxWidth: "200px" }}
        >
          {truncatedTitle}
        </span>
      ) : (
        <span
          onClick={onClick}
          className={styles.breadcrumbLink}
          style={{ maxWidth: "200px" }}
        >
          {truncatedTitle}
        </span>
      )}
      {!isLast && (
        <IoCaretForwardOutline
          style={{
            fontSize: "14px",
            margin: "0 8px",
            color: "#64748b",
            flexShrink: 0,
          }}
        />
      )}
    </>
  );
};

export default function JobDetailsDisplay() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [jobData, setJobData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadJobData();
  }, []);

  const loadJobData = () => {
    try {
      // Try to get from localStorage first
      const cachedData = getLstorage("jobDetails");

      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        setJobData(Array.isArray(parsedData) ? parsedData : [parsedData]);
        setLoading(false);
      } else {
        // If no cached data, you can fetch from API here
        // For now, just set empty array
        setJobData([]);
        setLoading(false);
      }
    } catch (err) {
      console.error("Error loading job data:", err);
      setError("Failed to load job data");
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <div className={styles.loading}>Loading job details...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!jobData || jobData.length === 0) {
    return <div className={styles.noData}>No job data available</div>;
  }

  const orgNameParam = searchParams.get("orgName");
  const orgName = orgNameParam ? decrypt(orgNameParam) : (jobData[0]?.companyName || "Company");

  const breadcrumbItems = [
    {
      title: "Companies",
      onClick: () => router.push("/admin/companies"),
    },
    {
      title: orgName,
      onClick: () =>
        router.push(
          `/admin/companies/jobs?orgId=${encrypt(params.org_id)}&orgName=${encrypt(orgName)}`
        ),
    },
    {
      title: "Jobs",
      onClick: () =>
        router.push(
          `/admin/companies/jobs?orgId=${encrypt(params.org_id)}&orgName=${encrypt(orgName)}`
        ),
    },
    {
      title: jobData[0]?.jobTitle || "Job Details",
      isLast: true,
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: "15px",
            marginBottom: "0",
          }}
        >
          {breadcrumbItems.map((item, index) => (
            <BreadcrumbItem
              key={index}
              title={item.title}
              onClick={item.onClick}
              isLast={index === breadcrumbItems.length - 1}
            />
          ))}
        </div>
        <h2 className={styles.pageTitle}>Job Details</h2>
      </div>

      {jobData.map((job, index) => (
        <div key={job._id || index} className={styles.jobCard}>
          {/* Header Section */}
          <div className={styles.header}>
            <h3 className={styles.jobTitle}>
              {job.jobTitle || "Untitled Job"}
            </h3>
            <span className={styles.badge}>{job.type || "N/A"}</span>
          </div>

          {/* Date Information */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Duration</h4>
            <div className={styles.dateInfo}>
              <div className={styles.dateItem}>
                <span className={styles.label}>Start Date:</span>
                <span className={styles.value}>
                  {formatDate(job.startDate)}
                </span>
              </div>
              <div className={styles.dateItem}>
                <span className={styles.label}>End Date:</span>
                <span className={styles.value}>{formatDate(job.endDate)}</span>
              </div>
            </div>
          </div>

          {/* Work Arrangement */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Work Arrangement</h4>
            <div className={styles.infoItem}>
              <span className={styles.label}>Remote Work Allowed:</span>
              <span className={`${styles.value} ${styles.capitalize}`}>
                {job.remoteWorkAllowed || "N/A"}
              </span>
            </div>
          </div>

          {/* Coordinator Information */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Coordinator Details</h4>
            <div className={styles.coordinatorInfo}>
              <div className={styles.infoItem}>
                <span className={styles.label}>Name:</span>
                <span className={styles.value}>
                  {job.coordinatorName || "N/A"}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Phone:</span>
                <span className={styles.value}>
                  {job.coordinatorPhone || "N/A"}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Email:</span>
                <span className={styles.value}>
                  {job.coordinatorEmail || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Colleges */}
          {job.colleges && job.colleges.length > 0 && (
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Associated Colleges</h4>
              <div className={styles.list}>
                {job.colleges.map((collegeId, idx) => (
                  <div key={idx} className={styles.listItem}>
                    <span className={styles.bulletPoint}>•</span>
                    <span className={styles.collegeId}>{collegeId}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Applicable Courses */}
          {job.applicableCourses && job.applicableCourses.length > 0 && (
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Applicable Courses</h4>
              <div className={styles.courseList}>
                {job.applicableCourses.map((course, idx) => (
                  <div key={idx} className={styles.courseCard}>
                    <div className={styles.courseItem}>
                      <span className={styles.label}>Degree:</span>
                      <span className={styles.value}>
                        {course.degree || "N/A"}
                      </span>
                    </div>
                    <div className={styles.courseItem}>
                      <span className={styles.label}>Department:</span>
                      <span className={styles.value}>
                        {course.department || "N/A"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Eligibility Criteria */}
          {job.eligibilityCriteria && job.eligibilityCriteria.length > 0 && (
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Eligibility Criteria</h4>
              <div className={styles.eligibilityList}>
                {job.eligibilityCriteria.map((criteria, idx) => (
                  <div key={idx} className={styles.eligibilityCard}>
                    <div className={styles.eligibilityItem}>
                      <span className={styles.label}>Education Level:</span>
                      <span className={styles.value}>
                        {criteria.educationLevel || "N/A"}
                      </span>
                    </div>
                    <div className={styles.eligibilityItem}>
                      <span className={styles.label}>Minimum Marks:</span>
                      <span className={styles.value}>
                        {criteria.minMarksPercentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Additional Information</h4>
            <div className={styles.metadata}>
              <div className={styles.infoItem}>
                <span className={styles.label}>Profile ID:</span>
                <span className={styles.value}>{job.profileId || "N/A"}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Created At:</span>
                <span className={styles.value}>
                  {formatDateTime(job.createdAt)}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Job ID:</span>
                <span className={styles.value}>{job._id}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
