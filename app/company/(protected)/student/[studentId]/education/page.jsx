"use client";
import React, { useEffect, useState } from "react";
import StudentData from "../page";
import Link from "next/link";
import educationStyles from "./education.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import { Modal } from "antd";

const Educational = () => {
  const dispatch = useDispatch();
  const params = useParams();
  const { studentId } = params;

  const selectedStudent = useSelector(
    (state) => state.user.singleStudent?.value?.data?.student
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDocUrl, setCurrentDocUrl] = useState("");
  const [fileType, setFileType] = useState(""); // Add state to track file type
  const router = useRouter();

  // Function to detect file type from URL
  const getFileType = (url) => {
    if (!url) return "unknown";
    
    const extension = url.split('.').pop().toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    const pdfExtensions = ['pdf'];
    const docExtensions = ['doc', 'docx', 'txt', 'rtf', 'odt'];
    
    if (imageExtensions.includes(extension)) return "image";
    if (pdfExtensions.includes(extension)) return "pdf";
    if (docExtensions.includes(extension)) return "document";
    
    return "unknown";
  };

  const showModal = (docUrl) => {
    const detectedFileType = getFileType(docUrl);
    setCurrentDocUrl(docUrl);
    setFileType(detectedFileType);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setCurrentDocUrl("");
    setFileType("");
  };

  // Updated renderItem to handle different file types
  const renderItem = () => {
    if (!currentDocUrl) return null;

    const renderContent = () => {
      switch (fileType) {
        case "image":
          return (
            <div
              style={{
                height: "100%",
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#f5f5f5",
              }}
            >
              <img
                src={currentDocUrl}
                alt="Document"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
              />
            </div>
          );

        case "pdf":
        case "document":
          // Use Google Docs Viewer for PDFs and documents
          const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(currentDocUrl)}&embedded=true`;
          return (
            <div
              style={{
                height: "100%",
                width: "100%",
              }}
            >
              <iframe
                src={googleViewerUrl}
                width="100%"
                height="100%"
                style={{
                  border: "none",
                  minHeight: "75vh",
                }}
                title="Document Viewer"
              />
            </div>
          );

        default:
          return (
            <div
              style={{
                height: "100%",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#f5f5f5",
                gap: "1rem",
              }}
            >
              <p>Cannot preview this file type</p>
              <a
                href={currentDocUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#56D2D4",
                  textDecoration: "underline",
                }}
              >
                Download File
              </a>
            </div>
          );
      }
    };

    return (
      <Modal
      centered
        title={`${fileType.charAt(0).toUpperCase() + fileType.slice(1)} Viewer`}
        open={isModalOpen}
        onCancel={handleClose}
        footer={null}
        width="80%"
        style={{
          height: "90vh",
          maxWidth: "90vw",
          marginTop: "2rem",
        }}
        bodyStyle={{
          height: "80vh",
          padding: 0,
          overflow: "hidden",
        }}
        modalRender={(modal) => <div style={{ height: "90vh" }}>{modal}</div>}
      >
        {renderContent()}
      </Modal>
    );
  };

  return (
    <StudentData>
      <div className={educationStyles.container}>
        {(!selectedStudent?.educationDetails ||
          selectedStudent?.educationDetails?.length === 0) && (
          <div
            style={{
              border: "1px solid grey",
              borderRadius: "10px",
              padding: "1.7rem",
              marginTop: "1rem",
              boxShadow: "1px 4px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div className={educationStyles.about}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <p
                  className={educationStyles.head}
                  style={{ color: "red", fontSize: "24px" }}
                >
                  No Data Available!
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedStudent?.educationDetails?.map((item, idx) => {
          return (
            <div
              key={idx}
              style={{
                border: "1px solid grey",
                borderRadius: "10px",
                padding: "1.7rem",
                marginTop: "1rem",
                boxShadow: "1px 4px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div className={educationStyles.about}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "start",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                >
                  <p className={educationStyles.head}>{item?.type || "N/A"}</p>
                  <p
                    style={{
                      color:
                        item?.verificationType === "approved"
                          ? "green"
                          : item?.verificationType === "resubmission"
                          ? "orange"
                          : "gray",
                      fontWeight: "bold",
                    }}
                  >
                    {item?.verificationType === "approved"
                      ? "Verified"
                      : item?.verificationType === "resubmission"
                      ? "Asked for Resubmission"
                      : "Pending"}
                  </p>
                </div>
              </div>

              <div className={educationStyles.aboutsidedata}>
                <div className={educationStyles.leftSection}>
                  <div className={educationStyles.detailRow}>
                    <p className={educationStyles.label}>
                      Board of Education :
                    </p>
                    <p className={educationStyles.value}>
                      {item?.board || "N/A"}
                    </p>
                  </div>
                  <div className={educationStyles.detailRow}>
                    <p className={educationStyles.label}>School :</p>
                    <p className={educationStyles.value}>
                      {item?.school || "N/A"}
                    </p>
                  </div>
                  <div className={educationStyles.detailRow}>
                    <p className={educationStyles.label}>Start Year :</p>
                    <p className={educationStyles.value}>
                      {item?.startDate || "N/A"}
                    </p>
                  </div>
                  <div className={educationStyles.detailRow}>
                    <p className={educationStyles.label}>End Year :</p>
                    <p className={educationStyles.value}>
                      {item?.endDate || "N/A"}
                    </p>
                  </div>
                </div>
                <div className={educationStyles.rightSection}>
                  <div className={educationStyles.detailRow}>
                    <p className={educationStyles.label}>Grading Type :</p>
                    <p className={educationStyles.value}>
                      {item?.gradingSystem || "N/A"}
                    </p>
                  </div>
                  <div className={educationStyles.detailRow}>
                    <p className={educationStyles.label}>Grade Obtained :</p>
                    <p className={educationStyles.value}>
                      {item?.grade || "N/A"}
                    </p>
                  </div>
                  <div className={educationStyles.detailRow}>
                    <p className={educationStyles.label}>Location :</p>
                    <p className={educationStyles.value}>
                      {item?.city || "N/A"}
                    </p>
                  </div>
                  <div className={educationStyles.detailRow}>
                    <p className={educationStyles.label}>Marksheet :</p>
                    <p
                      className={educationStyles.value}
                      style={{ color: "#56D2D4" }}
                    >
                      {item?.documentUrl ? `Document.${getFileType(item.documentUrl).toUpperCase()}` : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className={educationStyles.collegeRow}>
                <p className={educationStyles.collegeLabel}>
                  Remarks (if any) :
                </p>
                <p className={educationStyles.collegeLabelData}>
                  {item?.remarks || "N/A"}
                </p>
              </div>
              <div className={educationStyles.collegeRow}>
                <p className={educationStyles.collegeLabel}>Description :</p>
                <p className={educationStyles.collegeLabelData}>
                  {item?.description || "N/A"}
                </p>
              </div>

              {/* Updated View Documents section */}
              {item?.fileUrl ? (
                <div
                  onClick={() => showModal(item.fileUrl)}
                  style={{
                    cursor: "pointer",
                    textAlign: "center",
                    fontSize: "14px",
                    marginTop: "1rem",
                    color: "#56D2D4",
                    textDecoration: "underline",
                  }}
                >
                  View Documents ({getFileType(item.documentUrl).toUpperCase()})
                </div>
              ) : (
                <p
                  style={{
                    textAlign: "center",
                    fontSize: "14px",
                    marginTop: "1rem",
                    color: "gray",
                  }}
                >
                  No Documents Available
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Render modal */}
      {renderItem()}
    </StudentData>
  );
};

export default Educational;
