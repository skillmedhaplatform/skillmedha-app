"use client";
import React, { useRef, useState } from "react";
import { useSelector } from "react-redux";
import TextEditor from "@/universalUtils/editor";
import { UserOutlined, MailOutlined, PhoneOutlined, EditOutlined, CloudUploadOutlined } from "@ant-design/icons";
import { message } from "antd";

const IMAGE_SUPPORTED_TEMPLATES = [
  "template2", "template3", "template4", "template6", "template10", "template13",
  "template14", "template15", "template16", "template17", "template18", "template19",
  "template20", "template21", "template23", "template26", "template27", "template28",
  "template29", "template30", "template31", "template32", "template33", "template34",
  "template35", "template37", "template39", "template40"
];

const BasicDetails = ({ data, updateField, activeTemplate }) => {
  const resumeData = useSelector((state) => state);
  const fileInputRef = useRef(null);

  const supportsImage = IMAGE_SUPPORTED_TEMPLATES.includes(activeTemplate) || true; // Enabling for all as per user observation

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        message.error("Image size must be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateField("profile", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full flex flex-col gap-8">
      <div className={`grid gap-6 ${supportsImage ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1'}`}>
        
        {/* Left Column: Personal Details */}
        <div className={`flex flex-col gap-4 ${supportsImage ? 'md:col-span-2' : ''}`}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-5 bg-[#1E69DA] rounded-full"></div>
            <h3 className="text-[15px] font-semibold text-[#0f172a] m-0">Personal Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-[13px] font-semibold mb-1.5 text-[#334155]">First Name <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserOutlined className="text-[#94a3b8]" />
                </div>
                <input
                  name="firstName"
                  placeholder="First Name"
                  className="w-full pl-9 p-2.5 rounded-lg border border-[#e2e8f0] text-[14px] outline-none focus:border-[#1E69DA] focus:ring-1 focus:ring-[#1E69DA] transition-all bg-[#f8fafc] focus:bg-white"
                  onChange={(e) => updateField("firstName", e.target.value)}
                  value={data.firstName || ""}
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-[13px] font-semibold mb-1.5 text-[#334155]">Middle Name <span className="text-[#94a3b8] text-[12px] font-normal">(Optional)</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserOutlined className="text-[#94a3b8]" />
                </div>
                <input
                  name="middleName"
                  placeholder="Middle Name"
                  className="w-full pl-9 p-2.5 rounded-lg border border-[#e2e8f0] text-[14px] outline-none focus:border-[#1E69DA] focus:ring-1 focus:ring-[#1E69DA] transition-all bg-[#f8fafc] focus:bg-white"
                  onChange={(e) => updateField("middleName", e.target.value)}
                  value={data.middleName || ""}
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-[13px] font-semibold mb-1.5 text-[#334155]">Last Name <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserOutlined className="text-[#94a3b8]" />
                </div>
                <input
                  name="lastName"
                  placeholder="Last Name"
                  className="w-full pl-9 p-2.5 rounded-lg border border-[#e2e8f0] text-[14px] outline-none focus:border-[#1E69DA] focus:ring-1 focus:ring-[#1E69DA] transition-all bg-[#f8fafc] focus:bg-white"
                  onChange={(e) => updateField("lastName", e.target.value)}
                  value={data.lastName || ""}
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-[13px] font-semibold mb-1.5 text-[#334155]">Phone Number <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PhoneOutlined className="text-[#94a3b8]" />
                </div>
                <input
                  name="phone"
                  type="text"
                  placeholder="Phone Number"
                  className="w-full pl-9 p-2.5 rounded-lg border border-[#e2e8f0] text-[14px] outline-none focus:border-[#1E69DA] focus:ring-1 focus:ring-[#1E69DA] transition-all bg-[#f8fafc] focus:bg-white"
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    if (val.length <= 10) {
                      updateField("phone", val);
                    }
                  }}
                  value={(() => {
                    let p = data.phone || "";
                    if (p.startsWith("91") && p.length === 12) p = p.substring(2);
                    else if (p.startsWith("+91")) p = p.substring(3);
                    return p;
                  })()}
                />
              </div>
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="text-[13px] font-semibold mb-1.5 text-[#334155]">Email <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MailOutlined className="text-[#94a3b8]" />
                </div>
                <input
                  name="email"
                  placeholder="Email"
                  className="w-full pl-9 p-2.5 rounded-lg border border-[#e2e8f0] text-[14px] outline-none focus:border-[#1E69DA] focus:ring-1 focus:ring-[#1E69DA] transition-all bg-[#f8fafc] focus:bg-white"
                  onChange={(e) => updateField("email", e.target.value)}
                  value={data.email || ""}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Profile Photo */}
        {supportsImage && (
          <div className="flex flex-col gap-2 md:border-l border-[#e2e8f0] md:pl-6">
            <h3 className="text-[15px] font-semibold text-[#0f172a] m-0 mb-4">Profile Photo</h3>
            
            <div className="flex flex-col items-center justify-center bg-[#f8fafc] rounded-xl border border-dashed border-[#cbd5e1] p-6 relative">
              <div className="w-[100px] h-[100px] rounded-full overflow-hidden bg-[#e2e8f0] mb-4 border-4 border-white shadow-sm flex items-center justify-center relative">
                {(data.profile || resumeData?.personalDetailsResumeBuilder?.value?.profile) ? (
                  <img src={data.profile || resumeData?.personalDetailsResumeBuilder?.value?.profile} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserOutlined className="text-[#94a3b8] text-4xl" />
                )}
              </div>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-[#1E69DA] text-[#1E69DA] rounded-lg text-[13px] font-medium hover:bg-[#EFF5FB] transition-colors w-full"
              >
                <CloudUploadOutlined className="text-lg" />
                Upload Photo
              </button>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload}
                accept="image/png, image/jpeg, image/webp" 
                className="hidden" 
              />
              
              <p className="text-[11px] text-[#64748b] mt-3 mb-0 text-center leading-tight">
                JPG, PNG or WEBP.<br/>Max size 2MB.
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default BasicDetails;
