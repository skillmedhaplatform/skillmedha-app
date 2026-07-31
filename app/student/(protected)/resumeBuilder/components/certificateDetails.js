"use client";
import React, { useState } from "react";
import { Button, Input, DatePicker } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined, ArrowLeftOutlined, SaveOutlined, SafetyCertificateOutlined, LinkOutlined, IdcardOutlined, InfoCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const CertificateDetails = ({
  certificates,
  updateCertificate,
  addCertificate,
  removeCertificate,
  onNext,
}) => {
  const [editingIndex, setEditingIndex] = useState(null);

  const handleAdd = () => {
    addCertificate();
    setEditingIndex(certificates.length);
  };

  const handleRemove = (index) => {
    removeCertificate(index);
    if (editingIndex === index) {
      setEditingIndex(null);
    } else if (editingIndex !== null && editingIndex > index) {
      setEditingIndex(editingIndex - 1);
    }
  };

  const activeItem = editingIndex !== null ? certificates[editingIndex] : null;

  const renderAddedItems = () => (
    <div className="flex flex-col gap-3">
      <h4 className="font-bold text-[#0f172a] text-[16px] m-0">Added Certifications</h4>
      <div className="grid grid-cols-1 gap-3">
        {certificates.map((item, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
              editingIndex === index ? "border-[#3b82f6] bg-[#eff6ff] shadow-sm" : "border-[#e2e8f0] bg-white hover:border-[#cbd5e1]"
            }`}
          >
            <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => setEditingIndex(index)}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${editingIndex === index ? 'bg-[#3b82f6] text-white' : 'bg-[#f1f5f9] text-[#3b82f6]'}`}>
                 <SafetyCertificateOutlined className="text-[24px]" />
              </div>
              <div className="flex flex-col flex-1">
                <h5 className="font-bold text-[#0f172a] m-0 text-[15px]">{item.name || "Unnamed Certification"}</h5>
                <p className="text-[#64748b] m-0 text-[13px] mt-1">
                  {item.organization || "Issuing Organization"}
                </p>
              </div>
              <div className="flex items-center gap-2 text-[#64748b] text-[13px] font-medium mr-4">
                 <IdcardOutlined className="text-[16px] text-[#94a3b8]"/>
                 {item.issueDate ? dayjs(item.issueDate).format("MMM YYYY") : "No Date"}
              </div>
            </div>
            <div className="flex items-center gap-2 pl-4 border-l border-[#e2e8f0]">
              <Button type="text" className="text-[#64748b] hover:text-[#3b82f6]" icon={<EditOutlined />} onClick={() => setEditingIndex(index)} />
              <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleRemove(index)} />
            </div>
          </div>
        ))}
      </div>
      <Button
        type="dashed"
        icon={<PlusOutlined />}
        onClick={handleAdd}
        className="h-12 w-full mt-1 text-[#3b82f6] border-[#3b82f6] bg-[#eff6ff] hover:!bg-[#dbeafe] transition-all font-semibold rounded-xl"
      >
        Add Certification
      </Button>
      
      <div className="bg-[#eff6ff] rounded-xl border border-[#bfdbfe] p-4 flex items-center gap-3 mt-4">
        <InfoCircleOutlined className="text-[#3b82f6] text-[20px]" />
        <p className="text-[#475569] text-[14px] m-0">
          Add relevant certifications that strengthen your profile.
        </p>
      </div>

      {onNext && (
        <div className="flex justify-end mt-4">
          <Button type="primary" size="large" className="bg-[#1E69DA] px-8 font-semibold rounded-lg" onClick={onNext}>
            Next Section
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full">
      {editingIndex !== null && activeItem ? (
        /* Form View */
        <div className="w-full max-w-3xl mx-auto">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between pb-6 border-b border-[#f1f5f9]">
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-1">
                  <ArrowLeftOutlined 
                    className="text-[#64748b] hover:text-[#0f172a] text-[20px] cursor-pointer transition-colors" 
                    onClick={() => setEditingIndex(null)} 
                  />
                  <h3 className="text-[22px] font-bold text-[#0f172a] m-0">
                    Edit Certification
                  </h3>
                </div>
                <p className="text-[#64748b] text-[14px] m-0 ml-[32px]">
                  Add details of your certification or credential.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col gap-6 mt-4">
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[13px] font-semibold text-[#475569]">Certificate Name <span className="text-[#ef4444]">*</span></label>
                    <Input
                      placeholder="e.g. Google Data Analytics Professional Certificate"
                      value={activeItem.name || ""}
                      onChange={(e) => updateCertificate(editingIndex, "name", e.target.value)}
                      className="h-11 rounded-lg border-[#e2e8f0]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[13px] font-semibold text-[#475569]">Issuing Organization <span className="text-[#ef4444]">*</span></label>
                    <Input
                      placeholder="e.g. Google"
                      value={activeItem.organization || ""}
                      onChange={(e) => updateCertificate(editingIndex, "organization", e.target.value)}
                      className="h-11 rounded-lg border-[#e2e8f0]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[13px] font-semibold text-[#475569]">Issue Date <span className="text-[#ef4444]">*</span></label>
                    <DatePicker
                      className="h-11 rounded-lg border-[#e2e8f0] w-full"
                      placeholder="Select date"
                      value={activeItem?.issueDate ? dayjs(activeItem.issueDate) : null}
                      onChange={(_, date) => updateCertificate(editingIndex, "issueDate", date)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[13px] font-semibold text-[#475569]">Expiry Date</label>
                    <DatePicker
                      className="h-11 rounded-lg border-[#e2e8f0] w-full"
                      placeholder="Select date"
                      value={activeItem?.expiryDate ? dayjs(activeItem.expiryDate) : null}
                      onChange={(_, date) => updateCertificate(editingIndex, "expiryDate", date)}
                      disabledDate={(current) => {
                        if (!activeItem?.issueDate) return false;
                        return current && current < dayjs(activeItem.issueDate).startOf("day");
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[13px] font-semibold text-[#475569]">Credential ID</label>
                    <Input
                      placeholder="e.g. 123456789"
                      value={activeItem.credentialId || ""}
                      onChange={(e) => updateCertificate(editingIndex, "credentialId", e.target.value)}
                      className="h-11 rounded-lg border-[#e2e8f0]"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-semibold text-[#475569]">Credential URL</label>
                  <Input
                    prefix={<LinkOutlined className="text-[#94a3b8] mr-1" />}
                    placeholder="e.g. https://www.credential.net/abcdef"
                    value={activeItem.credentialUrl || ""}
                    onChange={(e) => updateCertificate(editingIndex, "credentialUrl", e.target.value)}
                    className="h-11 rounded-lg border-[#e2e8f0]"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-[#f1f5f9]">
              <Button danger type="text" icon={<DeleteOutlined />} onClick={() => handleRemove(editingIndex)} className="font-semibold text-[#ef4444] hover:bg-[#fef2f2]">
                Delete
              </Button>
              <div className="flex items-center gap-3">
                <Button 
                  className="border-[#e2e8f0] text-[#475569] font-semibold rounded-lg h-10 px-5 hover:!border-[#cbd5e1] hover:!text-[#0f172a]" 
                  onClick={() => setEditingIndex(null)}
                >
                  Cancel
                </Button>
                <Button 
                  type="primary" 
                  className="bg-[#1E69DA] font-semibold rounded-lg h-10 px-5 shadow-sm" 
                  icon={<SaveOutlined />} 
                  onClick={() => setEditingIndex(null)}
                >
                  Save Certification
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* List View */
        renderAddedItems()
      )}
    </div>
  );
};

export default CertificateDetails;
