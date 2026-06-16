"use client";
import React, { useRef, useState, useEffect } from "react";
import { Button, Modal, Spin } from "antd";
import { useSelector } from "react-redux";
import html2pdf from "html2pdf.js";
import styles from "./allstudents.module.scss";

export default function JobDetailsModal({ open, loading, onClose }) {
  const { value } = useSelector((state) => state.companyPlacements?.OneJob ?? {});
  const jobDetails = value?.data;

  const contentRef = useRef();
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfError, setPdfError] = useState(false);

  const generatePdfPreview = async () => {
    const element = contentRef.current;
    if (!element) return;

    const opt = {
      margin: 0.5,
      filename: "preview.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    try {
      const blob = await html2pdf().set(opt).from(element).outputPdf("blob");
      const blobUrl = URL.createObjectURL(blob);
      setPdfUrl(blobUrl);
      setPdfError(false);
    } catch (err) {
      console.error("❌ Error generating PDF:", err);
      setPdfError(true);
    }
  };

  useEffect(() => {
    let timeout;
    if (open && jobDetails) {
      timeout = setTimeout(() => {
        generatePdfPreview();
      }, 300);
    } else {
      setPdfUrl(null);
      setPdfError(false);
    }

    return () => clearTimeout(timeout);
  }, [open, jobDetails]);

  const downloadPdf = () => {
    const element = contentRef.current;
    const opt = {
      margin: 0.5,
      filename: `${jobDetails?.companyName || "job-details"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    html2pdf().set(opt).from(element).save();
    onClose();
  };

  const renderPdfContent = () => (
    <div ref={contentRef} className={styles.container1}>
      <article className={styles.article}>
        <header className={styles.header}>
          <h1>Placement Report</h1>
          <h3>{jobDetails?.companyName || "Company Name"}</h3>
        </header>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Job Profile</h3>
          <div className={styles.row}>
            <strong className={styles.label}>Profile:</strong>
            <p className={styles.value}>{jobDetails?.profileName}</p>
          </div>
          <div className={styles.row}>
            <strong className={styles.label}>Sector:</strong>
            <p className={styles.value}>{jobDetails?.sector}</p>
          </div>
          <div className={styles.row}>
            <strong className={styles.label}>CTC:</strong>
            <p className={styles.value}>{jobDetails?.ctc} LPA</p>
          </div>
          <div className={styles.row}>
            <strong className={styles.label}>Remote Work:</strong>
            <p className={styles.value}>{jobDetails?.remoteWorkAllowed}</p>
          </div>
          <div className={styles.row}>
            <strong className={styles.label}>Start Date:</strong>
            <p className={styles.value}>
              {new Date(jobDetails?.startDate).toLocaleDateString()}
            </p>
          </div>
          <div className={styles.row}>
            <strong className={styles.label}>End Date:</strong>
            <p className={styles.value}>
              {new Date(jobDetails?.endDate).toLocaleDateString()}
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Company Address</h3>
          <p className={styles.addressText}>
            {[
              jobDetails?.street,
              jobDetails?.area,
              jobDetails?.city,
              jobDetails?.zip,
              jobDetails?.country,
            ]
              .filter(Boolean)
              .join(", ")}
          </p>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Coordinator Information</h3>
          <div className={styles.row}>
            <strong className={styles.label}>Name:</strong>
            <p className={styles.value}>{jobDetails?.coordinatorName}</p>
          </div>
          <div className={styles.row}>
            <strong className={styles.label}>Email:</strong>
            <p className={styles.value}>{jobDetails?.coordinatorEmail}</p>
          </div>
          <div className={styles.row}>
            <strong className={styles.label}>Phone:</strong>
            <p className={styles.value}>{jobDetails?.coordinatorPhone}</p>
          </div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Applicable Courses</h3>
          <ul className={styles.ulList}>
            {jobDetails?.applicableCourses?.map((course, idx) => (
              <li key={idx}>
                {course.degree} - {course.department}
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Eligibility Criteria</h3>
          <ul className={styles.ulList}>
            {jobDetails?.eligibilityCriteria?.map((criteria, idx) => (
              <li key={idx}>
                {criteria.educationLevel} - Minimum{" "}
                {criteria.minMarksPercentage}% marks
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Supplemental Pay</h3>
          <ul className={styles.ulList}>
            {jobDetails?.supplementalPay?.map((benefit, idx) => (
              <li key={idx}>{benefit}</li>
            ))}
          </ul>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Applicants</h3>
          <table className={styles.table} border="1">
            <thead className={styles.tableHead}>
              <tr>
                <th className={styles.tableCell}>#</th>
                <th className={styles.tableCell}>Skillmedha ID</th>
                <th className={styles.tableCell}>Name</th>
                <th className={styles.tableCell}>Email</th>
                <th className={styles.tableCell}>Status</th>
              </tr>
            </thead>
            <tbody>
              {jobDetails?.applicants?.map((app, idx) => (
                <tr key={idx}>
                  <td className={styles.tableCenter}>{idx + 1}</td>
                  <td className={styles.tableCell}>{app.enrollementId}</td>
                  <td className={styles.tableCell}>
                    {`${app.firstName} ${app.middleName || ""} ${
                      app.lastName
                    }`.trim()}
                  </td>
                  <td className={styles.tableCell}>{app.email}</td>
                  <td className={styles.tableCell}>Applied</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <footer className={styles.footer}>
          <p>Generated on: {new Date().toLocaleDateString()}</p>
        </footer>
      </article>
    </div>
  );

  return (
    <>
      {renderPdfContent()}
      <Modal
        title="Job Details"
        open={open}
        onCancel={() => {
          setPdfUrl(null);
          setPdfError(false);
          onClose();
        }}
        footer={null}
        width={800}
      >
        {/* Visible content inside modal */}
        {loading || (!pdfUrl && !pdfError) ? (
          <div style={{ textAlign: "center" }}>
            <Spin tip="Generating PDF Preview..." />
          </div>
        ) : pdfError ? (
          <div
            style={{ color: "red", textAlign: "center", marginBottom: "1rem" }}
          >
            ⚠️ Failed to generate PDF preview.
          </div>
        ) : (
          <>
            <iframe
              src={pdfUrl}
              width="100%"
              height="600px"
              style={{ border: "1px solid #ccc", marginBottom: "1rem" }}
              title="PDF Preview"
            />
            <Button onClick={downloadPdf} type="primary">
              Download PDF
            </Button>
          </>
        )}
      </Modal>
    </>
  );
}
