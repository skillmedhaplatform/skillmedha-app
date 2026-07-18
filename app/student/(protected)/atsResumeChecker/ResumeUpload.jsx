"use client";
import React, { useRef, useState, useCallback, useEffect } from "react";
import { getSstorage } from "@/universalUtils/windowMW";
import { useDispatch, useSelector } from "react-redux";
import { Spin } from "antd";
import {
  CloudUploadOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  FileSearchOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import {
  analyzeResume,
  setJobDescription,
  uploadResumeToS3,
  deleteResumeFromS3,
  setSelectedFile,
  resetUpload,
  fetchCurrentResume,
} from "@/redux/atsSlice";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];
const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".doc"];
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (isoString) => {
  if (!isoString) return "";
  try {
    return new Date(isoString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
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
    currentResume,
    currentResumeStatus,
    error,
  } = useSelector((s) => s.ats);

  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState("");

  const studentId = getSstorage("studentId") || "anonymous";

  useEffect(() => {
    if (getSstorage("studentId")) {
      dispatch(fetchCurrentResume(getSstorage("studentId")));
    }
  }, [dispatch]);

  const isUploading = uploadStatus === "uploading";
  const isAnalyzing = analysisStatus === "analyzing";
  const isDeleting = deleteStatus === "deleting";
  const isLoading = isUploading || isAnalyzing || isDeleting;
  const analysisFailed = analysisStatus === "failed";
  const hasExistingResume = !!currentResume;
  const isCheckingResume = currentResumeStatus === "loading" && !currentResume;

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

  const handleFileSelect = useCallback((file) => {
    setFileError("");
    const validationError = validateFile(file);
    if (validationError) {
      setFileError(validationError);
      dispatch(setSelectedFile(null));
      return;
    }
    dispatch(setSelectedFile(file));
  }, [dispatch]);

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    e.target.value = "";
  };

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

  const getFileIcon = (file) => {
    const ext = file.name.split(".").pop().toLowerCase();
    if (ext === "pdf")
      return <FilePdfOutlined style={{ color: "#e74c3c", fontSize: 20 }} />;
    return <FileWordOutlined style={{ color: "#2980b9", fontSize: 20 }} />;
  };

  const handleAnalyze = async () => {
    if (!selectedFile || isLoading) return;
    setFileError("");

    try {
      const uploadResult = await dispatch(
        uploadResumeToS3({
          file: selectedFile,
          studentId,
          orgId: "jntua_68ad5fd98bd05951fc9126de",
        })
      ).unwrap();

      await dispatch(
        analyzeResume({
          blobName: uploadResult.blobName,
          jobDescription,
          studentId,
          resumeId: uploadResult.resumeId,
          fileUrl: uploadResult.sasUrl,
          orgId: "jntua_68ad5fd98bd05951fc9126de",
        })
      ).unwrap();

      dispatch(fetchCurrentResume(studentId));
    } catch (err) {
      setFileError(
        typeof err === "string"
          ? err
          : err?.message || "Something went wrong while analyzing your resume. Please try again."
      );
    }
  };

  const handleAnalyzeExisting = async () => {
    if (!currentResume || isLoading) return;
    setFileError("");

    try {
      await dispatch(
        analyzeResume({
          blobName: currentResume.blobName,
          jobDescription,
          studentId,
          resumeId: currentResume.resumeId,
          fileUrl: currentResume.fileUrl,
        })
      ).unwrap();
    } catch (err) {
      setFileError(
        typeof err === "string"
          ? err
          : err?.message || "Something went wrong while analyzing your resume. Please try again."
      );
    }
  };

  const handleDeleteCurrentResume = async () => {
    if (!currentResume || isLoading) return;
    setFileError("");

    try {
      await dispatch(deleteResumeFromS3(currentResume.blobName)).unwrap();
    } catch (err) {
      setFileError(
        typeof err === "string"
          ? err
          : err?.message || "Failed to delete resume. Please try again."
      );
    }
  };

  return (
    <div className="max-w-[720px] mx-auto flex flex-col gap-6">
      {isLoading ? (
        <div className="text-center py-12 flex flex-col items-center gap-2">
          <Spin size="large" />
          <div className="text-[16px] font-bold text-[#071631] mt-2">
            {isUploading
              ? "Uploading your resume..."
              : isAnalyzing
              ? "AI is analyzing your resume..."
              : isDeleting
              ? "Deleting your resume..."
              : "Processing..."}
          </div>
          <div className="text-[13px] text-[#64748b]">
            {isUploading
              ? "Securely uploading to cloud storage."
              : isAnalyzing
              ? "Checking keywords, formatting, sections, action verbs, and more. This may take up to 60 seconds."
              : isDeleting
              ? "Removing your resume from storage."
              : "Please wait..."}
          </div>
        </div>
      ) : (
        <>
          {isCheckingResume ? (
            <div className="text-center py-8 text-[#94a3b8] text-[13px] flex items-center justify-center gap-2">
              <Spin size="small" /> Checking for an existing resume...
            </div>
          ) : hasExistingResume ? (
            <div className="bg-white border-[1.5px] border-[#bfdbfe] rounded-xl px-5 py-4 flex items-center gap-3 flex-wrap">
              <FilePdfOutlined style={{ color: "#e74c3c", fontSize: 22 }} />
              <div className="flex-1 min-w-[160px]">
                <div className="text-[14px] font-semibold text-[#071631] truncate">
                  {currentResume.fileName}
                </div>
                <div className="text-[12px] text-[#64748b]">
                  Resume on file
                  {currentResume.updatedAt || currentResume.createdAt
                    ? ` · uploaded ${formatDate(currentResume.updatedAt || currentResume.createdAt)}`
                    : ""}
                </div>
              </div>
              <button
                className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white bg-gradient-to-br from-[#1E69DA] to-[#5694F0] hover:brightness-110 transition-all flex items-center gap-1.5"
                onClick={handleAnalyzeExisting}
              >
                <FileSearchOutlined /> {analysisFailed ? "Retry Analysis" : "Analyze This Resume"}
              </button>
              <button
                className="px-3.5 py-2 rounded-lg text-[13px] font-semibold border-[1.5px] border-[#e8447a] text-[#e8447a] hover:bg-[#fce7f3] transition-colors flex items-center gap-1.5"
                onClick={handleDeleteCurrentResume}
                title="Delete this resume so you can upload a new one"
              >
                <DeleteOutlined /> Delete
              </button>
            </div>
          ) : (
            <div
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                dragOver
                  ? "border-[#1358b0] bg-[#dbeafe] shadow-md"
                  : "border-[#1E69DA] bg-[#eff6ff] hover:bg-[#dbeafe]"
              }`}
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
                className="hidden"
                accept=".pdf,.docx,.doc"
                onChange={handleInputChange}
                aria-hidden="true"
              />
              <div className="text-[2.5rem] text-[#1E69DA] mb-2">
                <CloudUploadOutlined />
              </div>
              <div className="text-[16px] font-bold text-[#071631] mb-1">
                {dragOver ? "Drop your resume here" : "Drag & Drop your resume"}
              </div>
              <div className="text-[13px] text-[#64748b] mb-3">
                or click to browse your files
              </div>
              <span className="text-[11px] text-[#64748b] bg-white inline-block px-3 py-1 rounded-full border border-[#e2e8f0]">
                Supported: PDF, DOCX, DOC &nbsp;|&nbsp; Max {MAX_FILE_SIZE_MB}MB
              </span>
            </div>
          )}

          {(fileError || (analysisFailed && error)) && (
            <div className="bg-[#fdecea] border border-[#f5c6cb] rounded-lg px-4 py-3 text-[13px] text-[#c0392b] flex items-center gap-2">
              <ExclamationCircleOutlined className="shrink-0" />
              <span>{fileError || error}</span>
            </div>
          )}

          {!hasExistingResume && selectedFile && (
            <div className="bg-white border border-[#e2e8f0] rounded-lg px-4 py-3 flex items-center gap-3">
              {getFileIcon(selectedFile)}
              <span className="flex-1 text-[14px] font-semibold text-[#071631] truncate">
                {selectedFile.name}
              </span>
              <span className="text-[12px] text-[#64748b]">
                {formatFileSize(selectedFile.size)}
              </span>
              <CheckCircleOutlined style={{ color: "#27ae60" }} />
              <button
                className="bg-transparent border-none text-[#e74c3c] cursor-pointer text-[16px] p-1 rounded hover:bg-[#fdecea] transition-colors"
                onClick={async (e) => {
                  e.stopPropagation();
                  if (uploadedFileKey) {
                    try {
                      await dispatch(deleteResumeFromS3(uploadedFileKey)).unwrap();
                    } catch (deleteErr) {
                      console.error("Failed to delete file from S3:", deleteErr);
                    }
                  }
                  dispatch(setSelectedFile(null));
                  dispatch(resetUpload());
                  setFileError("");
                }}
                title="Remove file"
                aria-label="Remove selected file"
                disabled={isDeleting}
              >
                <DeleteOutlined />
              </button>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="jobDesc" className="text-[13px] font-semibold text-[#071631]">
              Job Description{" "}
              <span className="font-normal text-[#94a3b8]">
                (optional — improves keyword matching accuracy)
              </span>
            </label>
            <textarea
              id="jobDesc"
              placeholder="Paste the job description here for targeted ATS analysis. This helps us match your resume to specific role requirements..."
              value={jobDescription}
              onChange={(e) => dispatch(setJobDescription(e.target.value))}
              maxLength={5000}
              className="border border-[#e2e8f0] rounded-lg px-4 py-3 text-[13px] min-h-[100px] resize-y text-[#071631] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#1E69DA] transition-colors"
            />
            <span className="text-[11px] text-[#94a3b8]">
              {jobDescription.length}/5000 characters
            </span>
          </div>

          {!hasExistingResume && (
            <button
              className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-[15px] font-bold text-white bg-gradient-to-br from-[#1E69DA] to-[#5694F0] hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              onClick={handleAnalyze}
              disabled={!selectedFile || isLoading}
              aria-disabled={!selectedFile}
            >
              <FileSearchOutlined />
              {selectedFile
                ? analysisFailed
                  ? "Retry Analysis"
                  : "Analyze My Resume with AI"
                : "Select a resume to analyze"}
            </button>
          )}
        </>
      )}

      <div className="bg-white border border-[#e2e8f0] rounded-xl p-5">
        <h4 className="text-[14px] font-bold text-[#071631] m-0 mb-3">
          Tips for best ATS results:
        </h4>
        <ul className="list-none p-0 m-0 flex flex-col gap-2">
          {[
            "Use a clean, single-column layout without tables or text boxes",
            "Include standard sections: Summary, Experience, Education, Skills",
            "Use common fonts (Arial, Calibri, Times New Roman)",
            "Paste the job description above to get targeted keyword suggestions",
            "Save as PDF or DOCX — avoid scanned images of resumes",
            'Quantify achievements: "Increased sales by 30%" vs "Increased sales"',
          ].map((tip) => (
            <li key={tip} className="text-[13px] text-[#64748b] flex items-start gap-2">
              <span className="text-[#1E69DA] shrink-0 mt-0.5">✓</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ResumeUpload;
