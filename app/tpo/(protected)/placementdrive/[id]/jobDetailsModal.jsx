"use client";
import React, { useRef } from "react";
import { Button, Modal, Spin } from "antd";
import { useSelector } from "react-redux";
import styles from "./allstudents.module.scss";

export default function JobDetailsModal({ open, loading, onClose }) {
  const { value } = useSelector((state) => state.placement.OneJob);
  const jobDetails = value?.data;

  const contentRef = useRef();

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString();
  };

  const downloadPdf = async () => {
    const element = contentRef.current;
    if (!element) return;

    const html2pdf = (await import("html2pdf.js")).default;

    const opt = {
      margin: 0.5,
      filename: `${jobDetails?.companyName || jobDetails?.jobTitle || "job-details"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <Modal
      title="Job Details Report"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
        <Button
          key="download"
          type="primary"
          onClick={downloadPdf}
          disabled={loading || !jobDetails}
        >
          Download PDF
        </Button>,
      ]}
      width={850}
      styles={{ body: { maxHeight: "75vh", overflowY: "auto", padding: "1.5rem" } }}
    >
      {loading || !jobDetails ? (
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <Spin tip="Loading Job Details..." />
        </div>
      ) : (
        <div
          ref={contentRef}
          style={{ background: "#ffffff", padding: "1.5rem", color: "#0f172a" }}
        >
          <article className={styles.article} style={{ width: "100%" }}>
            <header
              className={styles.header}
              style={{
                borderBottom: "2px solid #e2e8f0",
                paddingBottom: "0.75rem",
                marginBottom: "1rem",
              }}
            >
              <h1
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  color: "#0f172a",
                  margin: 0,
                }}
              >
                {jobDetails?.companyName || "Company Details"}
              </h1>
              <h3
                style={{
                  fontSize: "1.1rem",
                  color: "#6BA8ED",
                  margin: "0.25rem 0 0 0",
                }}
              >
                {jobDetails?.jobTitle || jobDetails?.profileName || "Job Report"}
              </h3>
            </header>

            <section
              className={styles.section}
              style={{ marginBottom: "1.25rem" }}
            >
              <h3
                className={styles.sectionTitle}
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "700",
                  borderBottom: "1px solid #cbd5e1",
                  paddingBottom: "0.25rem",
                  marginBottom: "0.75rem",
                }}
              >
                Job Profile
              </h3>
              <div className={styles.row}>
                <strong className={styles.label}>Profile:</strong>
                <p className={styles.value}>
                  {jobDetails?.jobTitle || jobDetails?.profileName || "N/A"}
                </p>
              </div>
              <div className={styles.row}>
                <strong className={styles.label}>Sector:</strong>
                <p className={styles.value}>{jobDetails?.sector || "N/A"}</p>
              </div>
              <div className={styles.row}>
                <strong className={styles.label}>CTC:</strong>
                <p className={styles.value}>
                  {jobDetails?.ctc ? `${jobDetails.ctc} LPA` : "N/A"}
                </p>
              </div>
              <div className={styles.row}>
                <strong className={styles.label}>Remote Work:</strong>
                <p className={styles.value}>
                  {jobDetails?.remoteWorkAllowed ? "Yes" : "No"}
                </p>
              </div>
              <div className={styles.row}>
                <strong className={styles.label}>Application Start:</strong>
                <p className={styles.value}>
                  {formatDate(jobDetails?.startDate)}
                </p>
              </div>
              <div className={styles.row}>
                <strong className={styles.label}>Application Deadline:</strong>
                <p className={styles.value}>
                  {formatDate(jobDetails?.endDate)}
                </p>
              </div>
            </section>

            <section
              className={styles.section}
              style={{ marginBottom: "1.25rem" }}
            >
              <h3
                className={styles.sectionTitle}
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "700",
                  borderBottom: "1px solid #cbd5e1",
                  paddingBottom: "0.25rem",
                  marginBottom: "0.75rem",
                }}
              >
                Company Address
              </h3>
              <p className={styles.addressText} style={{ fontSize: "0.95rem" }}>
                {[
                  jobDetails?.street,
                  jobDetails?.area,
                  jobDetails?.city,
                  jobDetails?.zip,
                  jobDetails?.country,
                ]
                  .filter(Boolean)
                  .join(", ") || "N/A"}
              </p>
            </section>

            <section
              className={styles.section}
              style={{ marginBottom: "1.25rem" }}
            >
              <h3
                className={styles.sectionTitle}
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "700",
                  borderBottom: "1px solid #cbd5e1",
                  paddingBottom: "0.25rem",
                  marginBottom: "0.75rem",
                }}
              >
                Coordinator Information
              </h3>
              <div className={styles.row}>
                <strong className={styles.label}>Name:</strong>
                <p className={styles.value}>
                  {jobDetails?.coordinatorName || "N/A"}
                </p>
              </div>
              <div className={styles.row}>
                <strong className={styles.label}>Email:</strong>
                <p className={styles.value}>
                  {jobDetails?.coordinatorEmail || "N/A"}
                </p>
              </div>
              <div className={styles.row}>
                <strong className={styles.label}>Phone:</strong>
                <p className={styles.value}>
                  {jobDetails?.coordinatorPhone || "N/A"}
                </p>
              </div>
            </section>

            <section
              className={styles.section}
              style={{ marginBottom: "1.25rem" }}
            >
              <h3
                className={styles.sectionTitle}
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "700",
                  borderBottom: "1px solid #cbd5e1",
                  paddingBottom: "0.25rem",
                  marginBottom: "0.75rem",
                }}
              >
                Applicable Courses
              </h3>
              {jobDetails?.applicableCourses?.length > 0 ? (
                <ul className={styles.ulList} style={{ fontSize: "0.95rem" }}>
                  {jobDetails.applicableCourses.map((course, idx) => (
                    <li key={idx}>
                      {course.degree || course.course} -{" "}
                      {course.department || course.branch || "All"}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: "0.95rem", color: "#64748b" }}>
                  None specified
                </p>
              )}
            </section>

            <section
              className={styles.section}
              style={{ marginBottom: "1.25rem" }}
            >
              <h3
                className={styles.sectionTitle}
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "700",
                  borderBottom: "1px solid #cbd5e1",
                  paddingBottom: "0.25rem",
                  marginBottom: "0.75rem",
                }}
              >
                Eligibility Criteria
              </h3>
              {jobDetails?.eligibilityCriteria?.length > 0 ? (
                <ul className={styles.ulList} style={{ fontSize: "0.95rem" }}>
                  {jobDetails.eligibilityCriteria.map((criteria, idx) => (
                    <li key={idx}>
                      {criteria.educationLevel || criteria.level} - Minimum{" "}
                      {criteria.minMarksPercentage || criteria.percentage}%
                      marks
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: "0.95rem", color: "#64748b" }}>
                  None specified
                </p>
              )}
            </section>

            <section
              className={styles.section}
              style={{ marginBottom: "1.25rem" }}
            >
              <h3
                className={styles.sectionTitle}
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "700",
                  borderBottom: "1px solid #cbd5e1",
                  paddingBottom: "0.25rem",
                  marginBottom: "0.75rem",
                }}
              >
                Supplemental Pay
              </h3>
              {jobDetails?.supplementalPay?.length > 0 ? (
                <ul className={styles.ulList} style={{ fontSize: "0.95rem" }}>
                  {jobDetails.supplementalPay.map((benefit, idx) => (
                    <li key={idx}>{benefit}</li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: "0.95rem", color: "#64748b" }}>None</p>
              )}
            </section>

            <section
              className={styles.section}
              style={{ marginBottom: "1.25rem" }}
            >
              <h3
                className={styles.sectionTitle}
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "700",
                  borderBottom: "1px solid #cbd5e1",
                  paddingBottom: "0.25rem",
                  marginBottom: "0.75rem",
                }}
              >
                Applicants ({jobDetails?.applicants?.length || 0})
              </h3>
              <table
                className={styles.table}
                border="1"
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.9rem",
                }}
              >
                <thead
                  className={styles.tableHead}
                  style={{ backgroundColor: "#f1f5f9" }}
                >
                  <tr>
                    <th
                      className={styles.tableCell}
                      style={{ padding: "8px", textAlign: "center" }}
                    >
                      #
                    </th>
                    <th className={styles.tableCell} style={{ padding: "8px" }}>
                      Skillmedha ID
                    </th>
                    <th className={styles.tableCell} style={{ padding: "8px" }}>
                      Name
                    </th>
                    <th className={styles.tableCell} style={{ padding: "8px" }}>
                      Email
                    </th>
                    <th className={styles.tableCell} style={{ padding: "8px" }}>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {jobDetails?.applicants?.length > 0 ? (
                    jobDetails.applicants.map((app, idx) => {
                      const name =
                        app.userName ||
                        `${app.firstName || ""} ${app.middleName || ""} ${
                          app.lastName || ""
                        }`.trim() ||
                        "N/A";
                      const rollNo =
                        app.enrollementId || app.enrollmentId || app._id || "N/A";
                      return (
                        <tr key={idx}>
                          <td
                            className={styles.tableCenter}
                            style={{ padding: "8px", textAlign: "center" }}
                          >
                            {idx + 1}
                          </td>
                          <td
                            className={styles.tableCell}
                            style={{ padding: "8px" }}
                          >
                            {rollNo}
                          </td>
                          <td
                            className={styles.tableCell}
                            style={{ padding: "8px" }}
                          >
                            {name}
                          </td>
                          <td
                            className={styles.tableCell}
                            style={{ padding: "8px" }}
                          >
                            {app.email || "N/A"}
                          </td>
                          <td
                            className={styles.tableCell}
                            style={{ padding: "8px" }}
                          >
                            Applied
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className={styles.tableCenter}
                        style={{
                          padding: "12px",
                          textAlign: "center",
                          color: "#64748b",
                        }}
                      >
                        No applicants found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>

            <footer
              className={styles.footer}
              style={{
                paddingTop: "1rem",
                borderTop: "1px dashed #cbd5e1",
                textAlign: "center",
                color: "#64748b",
                fontSize: "0.85rem",
              }}
            >
              <p>Generated on: {new Date().toLocaleDateString()}</p>
            </footer>
          </article>
        </div>
      )}
    </Modal>
  );
}
