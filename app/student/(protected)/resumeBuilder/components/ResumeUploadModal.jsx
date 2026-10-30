"use client";

import React, { useState, useRef, useCallback } from "react";
import { Modal, Spin, message } from "antd";
import {
  CloudUploadOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { restUrl } from "@/config/urls";
import { getLstorage } from "@/universalUtils/windowMW";

const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".doc"];
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const formatFileSize = (bytes) => {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const ResumeUploadModal = ({ isOpen, onClose, onParsedSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parsingStep, setParsingStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef(null);

  const resetState = () => {
    setSelectedFile(null);
    setDragOver(false);
    setIsParsing(false);
    setParsingStep(1);
    setErrorMsg("");
  };

  const handleClose = () => {
    if (isParsing) return;
    resetState();
    onClose();
  };

  const validateFile = (file) => {
    if (!file) return "No file selected.";
    const ext = "." + file.name.split(".").pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return "Unsupported file type. Please upload a PDF or DOCX file.";
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `File size exceeds ${MAX_FILE_SIZE_MB}MB limit.`;
    }
    return null;
  };

  const handleFileSelect = useCallback((file) => {
    setErrorMsg("");
    const error = validateFile(file);
    if (error) {
      setErrorMsg(error);
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
  }, []);

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    e.target.value = "";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isParsing) setDragOver(true);
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
    if (isParsing) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleUploadAndParse = async () => {
    if (!selectedFile || isParsing) return;
    setErrorMsg("");
    setIsParsing(true);
    setParsingStep(1);

    const stepInterval = setInterval(() => {
      setParsingStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 2800);

    try {
      const formData = new FormData();
      formData.append("resume", selectedFile);

      const token = getLstorage("token") || "";

      const response = await axios.post(`${restUrl}/parse-resume`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      clearInterval(stepInterval);

      if (response.data && response.data.success && response.data.data) {
        message.success("Resume parsed and mapped successfully!");
        onParsedSuccess(response.data.data);
        handleClose();
      } else {
        throw new Error(response.data?.message || "Failed to parse resume.");
      }
    } catch (err) {
      clearInterval(stepInterval);
      console.error("[ResumeUploadModal] Parsing failed:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "An unexpected error occurred while analyzing the resume. Please check your document and try again.";
      setErrorMsg(msg);
      setIsParsing(false);
    }
  };

  const getFileIcon = (file) => {
    const ext = file?.name?.split(".").pop().toLowerCase();
    if (ext === "pdf") {
      return <FilePdfOutlined className="text-red-500 text-2xl" />;
    }
    return <FileWordOutlined className="text-blue-500 text-2xl" />;
  };

  return (
    <Modal
      open={isOpen}
      onCancel={handleClose}
      footer={null}
      centered
      width={560}
      destroyOnClose
      maskClosable={!isParsing}
      closable={!isParsing}
      className="resume-upload-modal"
    >
      <div className="py-2 px-1">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl mx-auto mb-3 shadow-lg shadow-indigo-500/25">
            <CloudUploadOutlined />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 m-0">
            Upload & Scan Resume
          </h3>
          <p className="text-slate-500 text-sm mt-1 mb-0">
            Upload your existing resume to automatically extract your skills, experience, and education into our professional templates.
          </p>
        </div>

        {/* Content */}
        {isParsing ? (
          <div className="py-10 flex flex-col items-center justify-center text-center">
            <Spin size="large" />
            <h4 className="text-lg font-bold text-slate-800 mt-5 mb-2">
              {parsingStep === 1 && "Extracting text and structure..."}
              {parsingStep === 2 && "Analyzing work history & education..."}
              {parsingStep >= 3 && "Mapping data to resume templates..."}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm">
              Our AI engine is reading your resume sections and organizing them cleanly. This takes just a few seconds.
            </p>
            <div className="w-full max-w-xs bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${parsingStep * 33}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Drop Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-7 text-center cursor-pointer transition-all ${
                dragOver
                  ? "border-indigo-500 bg-indigo-50/60 shadow-md scale-[1.01]"
                  : "border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.docx,.doc"
                onChange={handleInputChange}
              />
              <div className="text-4xl text-indigo-500 mb-2">
                <CloudUploadOutlined />
              </div>
              <div className="text-base font-bold text-slate-800 mb-1">
                {dragOver ? "Drop your resume file here" : "Choose a resume to upload"}
              </div>
              <div className="text-xs text-slate-500 mb-3">
                Drag and drop your file here, or click to browse
              </div>
              <span className="inline-block px-3 py-1 bg-white border border-slate-200 text-slate-500 text-[11px] font-medium rounded-full shadow-sm">
                Supported formats: PDF, DOCX • Max {MAX_FILE_SIZE_MB}MB
              </span>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-600 flex items-start gap-2.5">
                <ExclamationCircleOutlined className="text-sm mt-0.5 shrink-0" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {/* Selected File Card */}
            {selectedFile && (
              <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-3 min-w-0">
                  {getFileIcon(selectedFile)}
                  <div className="truncate">
                    <p className="text-sm font-semibold text-slate-800 truncate m-0">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-slate-500 m-0">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <CheckCircleOutlined className="text-emerald-500 text-base" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      setErrorMsg("");
                    }}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1 bg-transparent border-none cursor-pointer"
                    title="Remove file"
                  >
                    <DeleteOutlined className="text-sm" />
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUploadAndParse}
                disabled={!selectedFile || isParsing}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer border-none"
              >
                <ThunderboltOutlined /> Scan & Auto-Fill Resume
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ResumeUploadModal;
