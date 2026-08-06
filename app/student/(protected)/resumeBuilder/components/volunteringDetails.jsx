"use client";
import React, { useState } from "react";
import { Button, Input, DatePicker, Checkbox } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined, ArrowLeftOutlined, SaveOutlined, HeartOutlined, TeamOutlined, EnvironmentOutlined, IdcardOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import TextEditor from "@/universalUtils/editor";

const VolunteeringDetails = ({
  volunteerings,
  updateVolunteering,
  addVolunteering,
  removeVolunteering,
  onNext,
}) => {
  const [editingIndex, setEditingIndex] = useState(null);

  const handleAdd = () => {
    addVolunteering();
    setEditingIndex(volunteerings.length);
  };

  const handleRemove = (index) => {
    removeVolunteering(index);
    if (editingIndex === index) {
      setEditingIndex(null);
    } else if (editingIndex !== null && editingIndex > index) {
      setEditingIndex(editingIndex - 1);
    }
  };

  const activeItem = editingIndex !== null ? volunteerings[editingIndex] : null;

  const disabledFutureMonth = (current) => current && current > dayjs().endOf("month");

  const renderAddedItems = () => (
    <div className="flex flex-col gap-3">
      <h4 className="font-bold text-[#0f172a] text-[16px] m-0">Added Volunteering</h4>
      <div className="grid grid-cols-1 gap-3">
        {volunteerings?.map((item, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
              editingIndex === index ? "border-[#3b82f6] bg-[#eff6ff] shadow-sm" : "border-[#e2e8f0] bg-white hover:border-[#cbd5e1]"
            }`}
          >
            <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => setEditingIndex(index)}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${editingIndex === index ? 'bg-[#3b82f6] text-white' : 'bg-[#f1f5f9] text-[#3b82f6]'}`}>
                 <TeamOutlined className="text-[24px]" />
              </div>
              <div className="flex flex-col flex-1">
                <h5 className="font-bold text-[#0f172a] m-0 text-[15px]">{item.organization || "Organization Name"}</h5>
                <p className="text-[#64748b] m-0 text-[13px] mt-1">
                  {item.volunteering || "Role / Title"}
                </p>
                <div className="flex items-center gap-4 mt-2 text-[12px] text-[#64748b] font-medium">
                  <div className="flex items-center gap-1">
                    <HeartOutlined className="text-[#94a3b8]" />
                    {item.start ? dayjs(item.start, "MM/YYYY").format("MMM YYYY") : "Start"} - {item.end ? dayjs(item.end, "MM/YYYY").format("MMM YYYY") : (item.current ? "Present" : "End")}
                  </div>
                  {item.city && (
                    <div className="flex items-center gap-1">
                      <EnvironmentOutlined className="text-[#94a3b8]" />
                      {item.city}
                    </div>
                  )}
                </div>
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
        Add Volunteering
      </Button>
      
      <div className="bg-[#eff6ff] rounded-xl border border-[#bfdbfe] p-4 flex items-center gap-3 mt-4">
        <HeartOutlined className="text-[#3b82f6] text-[20px]" />
        <p className="text-[#475569] text-[14px] m-0">
          <span className="font-bold text-[#1e3a8a]">Tip:</span> Include roles where you contributed your time and skills for a cause or organization.
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
            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 pb-6 border-b border-[#f1f5f9]">
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-1">
                  <ArrowLeftOutlined 
                    className="text-[#64748b] hover:text-[#0f172a] text-[20px] cursor-pointer transition-colors" 
                    onClick={() => setEditingIndex(null)} 
                  />
                  <h3 className="text-[22px] font-bold text-[#0f172a] m-0">
                    Edit Volunteering
                  </h3>
                </div>
                <p className="text-[#64748b] text-[14px] m-0 ml-[32px]">
                  Add details of your volunteering experience.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col gap-6 mt-4">
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[13px] font-semibold text-[#475569]">Organization / Group <span className="text-[#ef4444]">*</span></label>
                    <Input
                      prefix={<TeamOutlined className="text-[#94a3b8] mr-1" />}
                      placeholder="e.g. Teach For India"
                      value={activeItem.organization || ""}
                      onChange={(e) => updateVolunteering(editingIndex, "organization", e.target.value)}
                      className="h-11 rounded-lg border-[#e2e8f0]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[13px] font-semibold text-[#475569]">Role / Position <span className="text-[#ef4444]">*</span></label>
                    <Input
                      prefix={<IdcardOutlined className="text-[#94a3b8] mr-1" />}
                      placeholder="e.g. Volunteer Teacher"
                      value={activeItem.volunteering || ""}
                      onChange={(e) => updateVolunteering(editingIndex, "volunteering", e.target.value)}
                      className="h-11 rounded-lg border-[#e2e8f0]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[13px] font-semibold text-[#475569]">Start Date <span className="text-[#ef4444]">*</span></label>
                    <DatePicker
                      picker="month"
                      format="MM/YYYY"
                      className="h-11 rounded-lg border-[#e2e8f0] w-full"
                      placeholder="Select month and year"
                      value={activeItem?.start ? dayjs(activeItem.start, "MM/YYYY") : null}
                      onChange={(_, dateString) => updateVolunteering(editingIndex, "start", dateString)}
                      disabledDate={disabledFutureMonth}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[13px] font-semibold text-[#475569]">End Date</label>
                    <DatePicker
                      picker="month"
                      format="MM/YYYY"
                      className="h-11 rounded-lg border-[#e2e8f0] w-full"
                      placeholder="Select month and year"
                      value={activeItem?.end ? dayjs(activeItem.end, "MM/YYYY") : null}
                      onChange={(_, dateString) => updateVolunteering(editingIndex, "end", dateString)}
                      disabled={!activeItem?.end && activeItem?.current}
                      disabledDate={(current) => {
                        if (!activeItem?.start) return disabledFutureMonth(current);
                        const afterStart = current && current < dayjs(activeItem.start, "MM/YYYY").startOf("month");
                        return disabledFutureMonth(current) || afterStart;
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[13px] font-semibold text-[#475569]">City / Location</label>
                    <Input
                      prefix={<EnvironmentOutlined className="text-[#94a3b8] mr-1" />}
                      placeholder="e.g. Bengaluru, India"
                      value={activeItem.city || ""}
                      onChange={(e) => updateVolunteering(editingIndex, "city", e.target.value)}
                      className="h-11 rounded-lg border-[#e2e8f0]"
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-[-10px] pr-2">
                   <Checkbox 
                     checked={activeItem?.current || (!activeItem?.end && activeItem?.start)}
                     onChange={(e) => {
                       updateVolunteering(editingIndex, "current", e.target.checked);
                       if (e.target.checked) {
                         updateVolunteering(editingIndex, "end", null);
                       }
                     }}
                     className="text-[13px] text-[#475569]"
                   >
                     I currently volunteer here
                   </Checkbox>
                </div>

                <div className="flex flex-col gap-1 mt-2">
                  <label className="text-[13px] font-semibold text-[#475569]">Description / Responsibilities</label>
                  <div className="border border-[#e2e8f0] rounded-xl overflow-hidden mt-1">
                    <TextEditor
                      initialContent={{ description: activeItem?.description || "" }}
                      editorFun={(val) => updateVolunteering(editingIndex, "description", val)}
                      name="description"
                    />
                  </div>
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
                  Save Volunteering
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

export default VolunteeringDetails;
