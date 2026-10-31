/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Modal } from "antd";
import {
  CameraOutlined,
  CloudUploadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  PictureOutlined,
  SwapOutlined,
} from "@ant-design/icons";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE_MB = 2;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const RECOMMENDED_RESOLUTION = "300 × 300 px";

const formatBytes = (bytes) => {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const ResumePhotoUploadModal = ({
  isOpen,
  onClose,
  onSavePhoto,
  templateName = "the chosen template",
  initialPhoto = null,
}) => {
  const [photoDataUrl, setPhotoDataUrl] = useState(initialPhoto || null);
  const [fileMeta, setFileMeta] = useState(null);
  const [dimensions, setDimensions] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setPhotoDataUrl(initialPhoto || null);
      setFileMeta(null);
      setDimensions(null);
      setErrorMsg("");
      setDragOver(false);
    }
  }, [isOpen, initialPhoto]);

  const validateAndProcessFile = (file) => {
    setErrorMsg("");

    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrorMsg("Unsupported file format. Please upload a JPG, PNG, or WEBP image.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setErrorMsg(
        `File size (${formatBytes(file.size)}) exceeds the maximum limit of ${MAX_IMAGE_SIZE_MB}MB. Please choose a smaller photo.`
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;

      // Check dimensions
      const img = new Image();
      img.onload = () => {
        setDimensions({ width: img.width, height: img.height });
        setPhotoDataUrl(dataUrl);
        setFileMeta({
          name: file.name,
          size: file.size,
          type: file.type,
        });
      };
      img.onerror = () => {
        setErrorMsg("Failed to decode image file. Please try another image.");
      };
      img.src = dataUrl;
    };

    reader.onerror = () => {
      setErrorMsg("Failed to read image file.");
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
    // reset input so the same file can be re-selected if removed
    if (e.target) e.target.value = "";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
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
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoDataUrl(null);
    setFileMeta(null);
    setDimensions(null);
    setErrorMsg("");
  };

  const handleSave = () => {
    if (!photoDataUrl) {
      setErrorMsg("Please upload a photo or click 'Do it later' to continue.");
      return;
    }
    onSavePhoto(photoDataUrl);
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      centered
      width={540}
      destroyOnClose
      maskClosable={true}
      className="resume-photo-upload-modal"
    >
      <div className="py-2 px-1">
        {/* Header */}
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1E69DA] to-indigo-600 flex items-center justify-center text-white text-2xl mx-auto mb-3 shadow-lg shadow-blue-500/25">
            <CameraOutlined />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 m-0">
            Upload Profile Photo
          </h3>
          <p className="text-slate-500 text-sm mt-1 mb-0 max-w-md mx-auto leading-relaxed">
            Your template <strong className="text-slate-700 font-semibold">{templateName}</strong> includes a photo slot. Add your professional portrait to complete your resume.
          </p>
        </div>

        {/* Specifications & Limits Banner */}
        <div className="bg-[#EFF5FB] border border-blue-100 rounded-2xl p-3.5 mb-5">
          <div className="text-[11px] font-bold text-[#1E69DA] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <InfoCircleOutlined className="text-sm" /> Resolution & Size Requirements
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white rounded-xl p-2.5 border border-blue-100/70 shadow-xs flex flex-col justify-center">
              <span className="text-[11px] text-slate-500 font-medium leading-none">Recommended</span>
              <span className="text-[13px] font-bold text-slate-800 mt-1 leading-tight">{RECOMMENDED_RESOLUTION}</span>
              <span className="text-[10px] text-slate-400 mt-0.5">1:1 Square</span>
            </div>
            <div className="bg-white rounded-xl p-2.5 border border-blue-100/70 shadow-xs flex flex-col justify-center">
              <span className="text-[11px] text-slate-500 font-medium leading-none">Maximum Size</span>
              <span className="text-[13px] font-bold text-slate-800 mt-1 leading-tight">Up to {MAX_IMAGE_SIZE_MB} MB</span>
              <span className="text-[10px] text-slate-400 mt-0.5">File size limit</span>
            </div>
            <div className="bg-white rounded-xl p-2.5 border border-blue-100/70 shadow-xs flex flex-col justify-center">
              <span className="text-[11px] text-slate-500 font-medium leading-none">Formats</span>
              <span className="text-[13px] font-bold text-slate-800 mt-1 leading-tight">JPG, PNG, WEBP</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Clear headshot</span>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 mb-4 text-xs text-red-600 flex items-start gap-2.5">
            <ExclamationCircleOutlined className="text-sm mt-0.5 shrink-0" />
            <span className="leading-relaxed font-medium">{errorMsg}</span>
          </div>
        )}

        {/* Upload Drop Zone / Preview Area */}
        {!photoDataUrl ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-7 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
              dragOver
                ? "border-[#1E69DA] bg-blue-50/70 shadow-md scale-[1.01]"
                : "border-slate-300 hover:border-[#1E69DA] bg-slate-50/60 hover:bg-slate-50"
            }`}
          >
            <div className="w-16 h-16 rounded-full bg-blue-50 text-[#1E69DA] flex items-center justify-center text-3xl mb-3 shadow-xs">
              <CloudUploadOutlined />
            </div>
            <div className="text-base font-bold text-slate-800 mb-1">
              {dragOver ? "Drop your photo here" : "Choose a photo to upload"}
            </div>
            <p className="text-xs text-slate-500 m-0 mb-3">
              Drag & drop your file here, or click to browse from device
            </p>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 text-slate-600 text-[11px] font-medium rounded-full shadow-xs">
              <PictureOutlined className="text-[#1E69DA]" /> Square aspect ratio (1:1) recommended
            </span>
          </div>
        ) : (
          <div className="border border-slate-200 rounded-2xl p-5 bg-[#fafafa]">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* Circular Avatar Preview */}
              <div className="relative shrink-0">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-white flex items-center justify-center">
                  <img
                    src={photoDataUrl}
                    alt="Resume profile preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 shadow-sm flex items-center justify-center text-xs">
                  <CheckCircleOutlined />
                </div>
              </div>

              {/* Photo Metadata Details */}
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <span className="text-[14px] font-bold text-slate-800 truncate max-w-[200px]">
                    {fileMeta?.name || "Profile Photo"}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                    Ready
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-xs text-slate-500 mb-3">
                  {dimensions && (
                    <span>
                      Dimensions: <strong className="text-slate-700">{dimensions.width} × {dimensions.height} px</strong>
                    </span>
                  )}
                  {fileMeta?.size && (
                    <span>
                      Size: <strong className="text-slate-700">{formatBytes(fileMeta.size)}</strong>
                    </span>
                  )}
                </div>

                {dimensions && (dimensions.width < 150 || dimensions.height < 150) && (
                  <p className="text-[11px] text-amber-600 m-0 mb-2 leading-tight">
                    Tip: Image is smaller than 150px and may appear slightly blurry on print.
                  </p>
                )}

                {/* Change or remove action */}
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#1E69DA] bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer border-none flex items-center gap-1.5"
                  >
                    <SwapOutlined /> Change Photo
                  </button>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer border-none flex items-center gap-1.5"
                  >
                    <DeleteOutlined /> Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
        />

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-5 mt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors border border-slate-200 bg-white cursor-pointer"
          >
            Do it later
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={!photoDataUrl}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#1E69DA] hover:bg-[#1554b3] transition-all shadow-md shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer border-none"
          >
            <CheckCircleOutlined /> Save & Continue
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ResumePhotoUploadModal;
