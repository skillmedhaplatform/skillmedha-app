"use client";
import React, { useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Spin } from "antd";
import {
  CloudUploadOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  FileSearchOutlined,
} from "@ant-design/icons";
import { analyzeResume, setJobDescription, uploadResumeToS3, deleteResumeFromS3, setSelectedFile, resetUpload } from "@/redux/slices/atsSlice";
import styles from "./ats-checker.module.scss";

// Allowed file types for resume upload
const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];
const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".doc"];
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// Format bytes to human-readable size
const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const ResumeUpload = () => {
  const dispatch = useDispatch();
  const {
    uploadStatus,
    analysisStatus,
    deleteStatus,
    jobDescription,
    selectedFile,
    uploadedFileKey,
    uploadedFileUrl,
    error,
  } = useSelector((s) => s.ats);

  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState("");

  const isLoading = uploadStatus === "uploading" || analysisStatus === "analyzing" || deleteStatus === "deleting";

  // ── Validate file type & size ────────────────────────────────────────────
  const validateFile = (file) => {
    if (!file) return "No file selected.";
    const ext = "." + file.name.split(".").pop().toLowerCase();
    if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(ext)) {
      return `Unsupported file type. Please upload a PDF, DOCX, or DOC file.`;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `File size exceeds ${MAX_FILE_SIZE_MB}MB limit. Please compress your resume.`;
    }
    return null;
  };

  // ── Handle file selection (from input or drop) ───────────────────────────
  const handleFileSelect = useCallback((file) => {
    setFileError("");
    const error = validateFile(file);
    if (error) {
      setFileError(error);
      dispatch(setSelectedFile(null));
      return;
    }
    dispatch(setSelectedFile(file));
  }, [dispatch]);

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    // Reset input value so same file can be re-selected after removal
    e.target.value = "";
  };

  // ── Drag & Drop handlers ────────────────────────────────────────────────
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading) setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (isLoading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  // ── Get file icon by extension ───────────────────────────────────────────
  const getFileIcon = (file) => {
    const ext = file.name.split(".").pop().toLowerCase();
    if (ext === "pdf")
      return <FilePdfOutlined style={{ color: "#e74c3c", fontSize: 20 }} />;
    return <FileWordOutlined style={{ color: "#2980b9", fontSize: 20 }} />;
  };

  // ── Trigger analysis ─────────────────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!selectedFile || isLoading) return;

    try {
      // First upload to S3
      const uploadResult = await dispatch(uploadResumeToS3({
        file: selectedFile,
        studentId: 'user123' // TODO: Get from user context/auth
      })).unwrap();

      // Then analyze with the file key
      dispatch(analyzeResume({
        fileKey: uploadResult.fileKey,
        jobDescription,
        studentId: 'user123' // TODO: Get from user context/auth
      }));
    } catch (error) {
      setFileError(error);
    }
  };

  return (
    <div className={styles.uploadSection}>
      {isLoading ? (
        // ── Analyzing state ────────────────────────────────────────────────
        <div className={styles.analyzingState}>
          <Spin size="large" />
          <div className={styles.analyzingTitle}>
            {uploadStatus === "uploading"
              ? "Uploading your resume..."
              : analysisStatus === "analyzing"
              ? "AI is analyzing your resume..."
              : "Processing..."}
          </div>
          <div className={styles.analyzingSubtitle}>
            {uploadStatus === "uploading"
              ? "Securely uploading to cloud storage."
              : analysisStatus === "analyzing"
              ? "Checking keywords, formatting, sections, action verbs, and more. This may take up to 60 seconds."
              : "Please wait..."}
          </div>
        </div>
      ) : (
        <>
          {/* ── Drop Zone ─────────────────────────────────────────────── */}
          <div
            className={`${styles.uploadDropzone} ${dragOver ? styles.dragOver : ""}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            role="button"
            tabIndex={0}
            aria-label="Upload resume file"
            onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              className={styles.hiddenInput}
              accept=".pdf,.docx,.doc"
              onChange={handleInputChange}
              aria-hidden="true"
            />
            <div className={styles.uploadIcon}>
              <CloudUploadOutlined />
            </div>
            <div className={styles.uploadTitle}>
              {dragOver ? "Drop your resume here" : "Drag & Drop your resume"}
            </div>
            <div className={styles.uploadSubtitle}>
              or click to browse your files
            </div>
            <span className={styles.uploadFormats}>
              Supported: PDF, DOCX, DOC &nbsp;|&nbsp; Max {MAX_FILE_SIZE_MB}MB
            </span>
          </div>

          {/* ── File Error ──────────────────────────────────────────────── */}
          {fileError && (
            <div className={styles.errorState}>
              ⚠️ {fileError}
            </div>
          )}

          {/* ── Selected File Preview ────────────────────────────────────── */}
          {selectedFile && (
            <div className={styles.selectedFile}>
              {getFileIcon(selectedFile)}
              <span className={styles.fileName}>{selectedFile.name}</span>
              <span className={styles.fileSize}>
                {formatFileSize(selectedFile.size)}
              </span>
              <CheckCircleOutlined style={{ color: "#27ae60" }} />
              <button
                className={styles.removeFile}
                onClick={async (e) => {
                  e.stopPropagation();

                  // If file was uploaded to S3, delete it
                  if (uploadedFileKey) {
                    try {
                      await dispatch(deleteResumeFromS3(uploadedFileKey)).unwrap();
                    } catch (error) {
                      console.error('Failed to delete file from S3:', error);
                      // Continue with local cleanup even if S3 delete fails
                    }
                  }

                  // Reset local state
                  dispatch(setSelectedFile(null));
                  dispatch(resetUpload());
                  setFileError("");
                }}
                title="Remove file"
                aria-label="Remove selected file"
                disabled={deleteStatus === 'deleting'}
              >
                <DeleteOutlined />
              </button>
            </div>
          )}

          {/* ── Job Description (optional) ──────────────────────────────── */}
          <div className={styles.jobDescSection}>
            <label htmlFor="jobDesc">
              Job Description{" "}
              <span style={{ fontWeight: 400, color: "#7f8c8d" }}>
                (optional — improves keyword matching accuracy)
              </span>
            </label>
            <textarea
              id="jobDesc"
              placeholder="Paste the job description here for targeted ATS analysis. This helps us match your resume to specific role requirements..."
              value={jobDescription}
              onChange={(e) => dispatch(setJobDescription(e.target.value))}
              maxLength={5000}
            />
            <span className={styles.jobDescHint}>
              {jobDescription.length}/5000 characters
            </span>
          </div>

          {/* ── Analyze Button ───────────────────────────────────────────── */}
          <button
            className={styles.analyzeBtn}
            onClick={handleAnalyze}
            disabled={!selectedFile || isLoading}
            aria-disabled={!selectedFile}
          >
            <FileSearchOutlined />
            {selectedFile
              ? "Analyze My Resume with AI"
              : "Select a resume to analyze"}
          </button>
        </>
      )}

      {/* ── Upload Tips ────────────────────────────────────────────────── */}
      <div className={styles.uploadTips}>
        <h4>Tips for best ATS results:</h4>
        <ul>
          <li>
            <span className="tipIcon">✓</span>
            Use a clean, single-column layout without tables or text boxes
          </li>
          <li>
            <span className="tipIcon">✓</span>
            Include standard sections: Summary, Experience, Education, Skills
          </li>
          <li>
            <span className="tipIcon">✓</span>
            Use common fonts (Arial, Calibri, Times New Roman)
          </li>
          <li>
            <span className="tipIcon">✓</span>
            Paste the job description above to get targeted keyword suggestions
          </li>
          <li>
            <span className="tipIcon">✓</span>
            Save as PDF or DOCX — avoid scanned images of resumes
          </li>
          <li>
            <span className="tipIcon">✓</span>
            Quantify achievements: "Increased sales by 30%" vs "Increased sales"
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ResumeUpload;
