// "use client";
// import React from "react";
// import StudentData from "../page";
// import Link from "next/link";
// import styles from "./intern.module.scss";
// import { useParams } from "next/navigation";
// import { useSelector } from "react-redux";
// import { Button } from "antd";
// import { FaRegCheckCircle } from "react-icons/fa";
// import { IoMdCloseCircleOutline } from "react-icons/io";

// const PositionsAndResponsibilities = () => {
//   const params = useParams();
//   const { studentId } = params;

//   const selectedStudent = useSelector(
//     (state) => state.user.singleStudent?.value?.data?.student
//   );

//   const mapSectionKey = (title = "") =>
//     title
//       .toLowerCase()
//       .trim()
//       .replace(/[^\w\s-]/g, "")
//       .replace(/\s+/g, "-");

//   return (
//     <StudentData>
//       <div className={styles.container}>
//         {selectedStudent?.responsibilities?.length > 0 ? (
//           selectedStudent.responsibilities.map((item, idx) => {
//             const section = mapSectionKey(item.responsibility);
//             return (
//               <div
//                 key={idx}
//                 style={{
//                   border: "1px solid #ccc",
//                   borderRadius: "10px",
//                   padding: "1.7rem",
//                   marginTop: "1rem",
//                   boxShadow: "1px 4px 8px rgba(0,0,0,0.1)",
//                 }}
//               >
//                 <div className={styles.about}>
//                   <div
//                     style={{
//                       display: "flex",
//                       justifyContent: "start",
//                       alignItems: "center",
//                       gap: "1rem",
//                     }}
//                   >
//                     <p style={{ fontWeight: "800", fontSize: "18px" }}>
//                       {item.responsibility || "N/A"}
//                     </p>
//                     <p
//                       style={{
//                         color:
//                           item?.verificationType === "approved"
//                             ? "green"
//                             : item?.verificationType === "resubmission"
//                             ? "orange"
//                             : "gray",
//                         fontWeight: "bold",
//                       }}
//                     >
//                       {item?.verificationType === "approved"
//                         ? "Verified"
//                         : item?.verificationType === "resubmission"
//                         ? "Asked for Resubmission"
//                         : "Pending"}
//                     </p>
//                   </div>
//                 </div>

//                 <p className={styles.head} style={{ marginBottom: "0.5rem" }}>
//                   {item.company || "N/A"} <strong>|</strong>{" "}
//                   {item.start || "N/A"} to {item.end || "N/A"}{" "}
//                   <strong>|</strong> Location: {item.city || "N/A"}
//                 </p>
//                 <hr />

//                 <div className={styles.aboutsidedata}>
//                   <p>{item.description || "N/A"}</p>
//                 </div>

//                 <Link
//                   href={
//                     item.joiningFiles?.length || item.relievingFiles?.length
//                       ? "#"
//                       : "#"
//                   }
//                 >
//                   <p style={{ textAlign: "center", fontSize: "14px" }}>
//                     {item.joiningFiles?.length || item.relievingFiles?.length
//                       ? "View Documents"
//                       : "No Documents Available"}
//                   </p>
//                 </Link>
//               </div>
//             );
//           })
//         ) : (
//           <div
//             style={{
//               border: "1px solid #ccc",
//               borderRadius: "10px",
//               padding: "1.7rem",
//               marginTop: "1rem",
//               boxShadow: "1px 4px 8px rgba(0,0,0,0.1)",
//             }}
//           >
//             <div className={styles.about}>
//               <p
//                 className={styles.head}
//                 style={{ color: "red", fontSize: "24px" }}
//               >
//                 No Data Available!
//               </p>
//             </div>
//           </div>
//         )}
//       </div>
//     </StudentData>
//   );
// };

// export default PositionsAndResponsibilities;


"use client";
import React, { useState } from "react";
import StudentData from "../page";
import Link from "next/link";
import styles from "./intern.module.scss";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { Button, Modal } from "antd";
import { FaRegCheckCircle } from "react-icons/fa";
import { IoMdCloseCircleOutline } from "react-icons/io";

const PositionsAndResponsibilities = () => {
  const params = useParams();
  const { studentId } = params;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDocUrl, setCurrentDocUrl] = useState("");
  const [fileType, setFileType] = useState("");
  const [currentDocTitle, setCurrentDocTitle] = useState("");

  const selectedStudent = useSelector(
    (state) => state.user.singleStudent?.value?.data?.student
  );

  const mapSectionKey = (title = "") =>
    title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

  // Function to detect file type from URL
  const getFileType = (url) => {
    if (!url || typeof url !== 'string') return "unknown";
    
    try {
      const cleanUrl = url.split('?')[0];
      const urlParts = cleanUrl.split('.');
      
      if (urlParts.length < 2) return "unknown";
      
      const extension = urlParts[urlParts.length - 1].toLowerCase();
      
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
      const pdfExtensions = ['pdf'];
      const docExtensions = ['doc', 'docx', 'txt', 'rtf', 'odt'];
      
      if (imageExtensions.includes(extension)) return "image";
      if (pdfExtensions.includes(extension)) return "pdf";
      if (docExtensions.includes(extension)) return "document";
      
      return "unknown";
    } catch (error) {
      console.error("Error detecting file type:", error);
      return "unknown";
    }
  };

  const showModal = (docUrl, title = "Document") => {
    if (!docUrl || typeof docUrl !== 'string') {
      console.error("Invalid document URL:", docUrl);
      return;
    }
    
    const detectedFileType = getFileType(docUrl);
    setCurrentDocUrl(docUrl);
    setFileType(detectedFileType);
    setCurrentDocTitle(title);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setCurrentDocUrl("");
    setFileType("");
    setCurrentDocTitle("");
  };

  // Function to extract all files from customDocs
  const extractCustomDocFiles = (customDocs) => {
    if (!Array.isArray(customDocs)) return [];
    
    const allFiles = [];
    
    customDocs.forEach(docGroup => {
      if (docGroup.files && Array.isArray(docGroup.files)) {
        docGroup.files.forEach(file => {
          if (file.url) {
            allFiles.push({
              url: file.url,
              title: `${docGroup.title} - ${file.name || 'Document'}`,
              groupTitle: docGroup.title,
              fileName: file.name
            });
          }
        });
      }
    });
    
    return allFiles;
  };

  // Function to show documents selection modal
  const showDocumentsModal = (item) => {
    const customDocFiles = extractCustomDocFiles(item.customDocs);
    
    if (customDocFiles.length === 0) {
      console.warn("No valid document URLs found");
      return;
    }
    
    // If only one document, show it directly
    if (customDocFiles.length === 1) {
      showModal(customDocFiles[0].url, customDocFiles[0].title);
      return;
    }
    
    // If multiple documents, show selection modal
    showDocumentSelectionModal(customDocFiles);
  };

  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [availableDocuments, setAvailableDocuments] = useState([]);

  const showDocumentSelectionModal = (documents) => {
    setAvailableDocuments(documents);
    setIsSelectionModalOpen(true);
  };

  // Document viewer modal
  const renderDocumentViewer = () => {
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
        title={`${currentDocTitle} - ${fileType.charAt(0).toUpperCase() + fileType.slice(1)} Viewer`}
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

  // Document selection modal
  const renderDocumentSelectionModal = () => {
    return (
      <Modal
      centered
        title="Select Document to View"
        open={isSelectionModalOpen}
        onCancel={() => setIsSelectionModalOpen(false)}
        footer={null}
        width="500px"
      >
        <div style={{ padding: "1rem 0" }}>
          {availableDocuments.map((doc, index) => (
            <div
              key={index}
              onClick={() => {
                setIsSelectionModalOpen(false);
                showModal(doc.url, doc.title);
              }}
              style={{
                padding: "12px 16px",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                marginBottom: "8px",
                cursor: "pointer",
                transition: "all 0.2s",
                backgroundColor: "#fff",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#f5f5f5";
                e.target.style.borderColor = "#56D2D4";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#fff";
                e.target.style.borderColor = "#e0e0e0";
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontWeight: "600", fontSize: "14px" }}>{doc.fileName}</span>
                  <span style={{ fontSize: "12px", color: "#666" }}>{doc.groupTitle}</span>
                </div>
                <span style={{ 
                  fontSize: "10px", 
                  color: "#666",
                  backgroundColor: "#f0f0f0",
                  padding: "2px 6px",
                  borderRadius: "3px"
                }}>
                  {getFileType(doc.url).toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    );
  };

  // Helper function to count total documents in customDocs
  const getTotalCustomDocCount = (item) => {
    if (!Array.isArray(item.customDocs)) return 0;
    
    let totalCount = 0;
    item.customDocs.forEach(docGroup => {
      if (docGroup.files && Array.isArray(docGroup.files)) {
        totalCount += docGroup.files.length;
      }
    });
    
    return totalCount;
  };

  return (
    <StudentData>
      <div className={styles.container}>
        {selectedStudent?.responsibilities?.length > 0 ? (
          selectedStudent.responsibilities.map((item, idx) => {
            const section = mapSectionKey(item.responsibility);
            return (
              <div
                key={idx}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "10px",
                  padding: "1.7rem",
                  marginTop: "1rem",
                  boxShadow: "1px 4px 8px rgba(0,0,0,0.1)",
                }}
              >
                <div className={styles.about}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "start",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    <p style={{ fontWeight: "800", fontSize: "18px" }}>
                      {item.responsibility || "N/A"}
                    </p>
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

                <p className={styles.head} style={{ marginBottom: "0.5rem" }}>
                  {item.company || "N/A"} <strong>|</strong>{" "}
                  {item.start || "N/A"} to {item.end || "N/A"}{" "}
                  <strong>|</strong> Location: {item.city || "N/A"}
                </p>
                <hr />

                <div className={styles.aboutsidedata}>
                  {item?.description ? (
                    <div dangerouslySetInnerHTML={{ __html: item.description }} />
                  ) : (
                    <p>No Description Provided</p>
                  )}
                </div>

                {/* Updated View Documents section */}
                {getTotalCustomDocCount(item) > 0 ? (
                  <div
                    onClick={() => showDocumentsModal(item)}
                    style={{
                      cursor: "pointer",
                      textAlign: "center",
                      fontSize: "14px",
                      marginTop: "1rem",
                      color: "#56D2D4",
                      textDecoration: "underline",
                    }}
                  >
                    View Documents ({getTotalCustomDocCount(item)} file{getTotalCustomDocCount(item) > 1 ? 's' : ''})
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
          })
        ) : (
          <div
            style={{
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "1.7rem",
              marginTop: "1rem",
              boxShadow: "1px 4px 8px rgba(0,0,0,0.1)",
            }}
          >
            <div className={styles.about}>
              <p
                className={styles.head}
                style={{ color: "red", fontSize: "24px" }}
              >
                No Data Available!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Render modals */}
      {renderDocumentViewer()}
      {renderDocumentSelectionModal()}
    </StudentData>
  );
};

export default PositionsAndResponsibilities;
