"use client";
import React, { useState } from "react";
import { Button, DatePicker, Input, Checkbox, Switch, Select } from "antd";
import { 
  DeleteOutlined, EditOutlined, PlusOutlined,
  ArrowLeftOutlined, SaveOutlined, UserOutlined,
  CalendarOutlined, BankOutlined, EnvironmentOutlined,
  TagsOutlined, TrophyOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import TextEditor from "@/universalUtils/editor";

const InternshipsDetails = ({
  experiences,
  updateExperience,
  addExperience,
  removeExperience,
  onNext,
}) => {
  const [editingId, setEditingId] = useState(null);

  const internshipExperiences = experiences?.filter((e) => e?.type?.toLowerCase() !== "work") || [];

  // No auto-setting of editingId so List View shows by default

  const handleAdd = () => {
    addExperience();
  };

  const activeItem = internshipExperiences.find((item) => item.id === editingId) || internshipExperiences[0];
  const activeIndex = experiences.findIndex((item) => item.id === activeItem?.id);

  const renderAddedItems = () => (
    <div className="flex flex-col gap-3">
      <h4 className="font-bold text-[#0f172a] text-[16px] m-0">Added Internships</h4>
      <div className="grid grid-cols-1 gap-3">
        {internshipExperiences.map((item, idx) => (
          <div
            key={item.id}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
              editingId === item.id ? "border-[#3b82f6] bg-[#eff6ff] shadow-sm" : "border-[#e2e8f0] bg-white hover:border-[#cbd5e1]"
            }`}
          >
            <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => setEditingId(item.id)}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[14px] ${editingId === item.id ? 'bg-[#3b82f6] text-white' : 'bg-[#f1f5f9] text-[#64748b]'}`}>
                {idx + 1}
              </div>
              <div className="flex flex-col flex-1">
                <h5 className="font-bold text-[#0f172a] m-0 text-[15px]">{item.role || "(Role not specified)"}</h5>
                <p className="text-[#64748b] m-0 text-[13px] mt-1">
                  {item.company || "Company"} • {item.startDate ? dayjs(item.startDate).format("MMM YYYY") : "Start"} - {item.current ? "Present" : (item.endDate ? dayjs(item.endDate).format("MMM YYYY") : "Present")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 pl-4 border-l border-[#e2e8f0]">
              <Button type="text" className="text-[#64748b] hover:text-[#3b82f6]" icon={<EditOutlined />} onClick={() => setEditingId(item.id)} />
              <Button type="text" danger icon={<DeleteOutlined />} onClick={() => {
                removeExperience(item.id);
                if (editingId === item.id) setEditingId(null);
              }} disabled={internshipExperiences.length === 1} />
            </div>
          </div>
        ))}
      </div>
      <Button
        type="dashed"
        icon={<PlusOutlined />}
        onClick={() => {
           addExperience();
           setEditingId(null);
        }}
        className="h-12 w-full mt-1 text-[#3b82f6] border-[#3b82f6] bg-[#eff6ff] hover:!bg-[#dbeafe] transition-all font-semibold rounded-xl"
      >
        Add Another Internship
      </Button>
      {onNext && (
        <div className="flex justify-end mt-4">
          <Button type="primary" size="large" className="bg-[#1E69DA] px-8 font-semibold rounded-lg" onClick={onNext}>
            Next Section
          </Button>
        </div>
      )}
    </div>
  );

  if (internshipExperiences.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 w-full p-0 lg:p-4">
      {editingId !== null && activeItem ? (
        /* Form View */
        <div className="w-full max-w-3xl mx-auto">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between pb-6 border-b border-[#f1f5f9]">
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-1">
                  <ArrowLeftOutlined 
                    className="text-[#64748b] hover:text-[#0f172a] text-[20px] cursor-pointer transition-colors" 
                    onClick={() => setEditingId(null)} 
                  />
                  <h3 className="text-[22px] font-bold text-[#0f172a] m-0">
                    Edit Internship
                  </h3>
                </div>
                <p className="text-[#64748b] text-[14px] m-0 ml-[32px]">
                  Add accurate details about your internship.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  className="border-[#e2e8f0] text-[#475569] font-semibold rounded-lg h-10 px-5 hover:!border-[#cbd5e1] hover:!text-[#0f172a]" 
                  onClick={() => setEditingId(null)}
                >
                  Cancel
                </Button>
                <Button 
                  type="primary" 
                  className="bg-[#1E69DA] font-semibold rounded-lg h-10 px-5 shadow-sm" 
                  icon={<SaveOutlined />} 
                  onClick={() => setEditingId(null)}
                >
                  Save Internship
                </Button>
              </div>
            </div>

            {/* Group 1: Basic Information */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-full bg-[#eff6ff] border border-[#bfdbfe] flex items-center justify-center text-[#3b82f6]">
                  <UserOutlined />
                </div>
                <h4 className="font-bold text-[#0f172a] text-[16px] m-0">Basic Information</h4>
                <div className="flex-1 h-[1px] bg-[#e2e8f0] ml-2"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="text-[13px] font-semibold text-[#475569]">Role / Title <span className="text-[#ef4444]">*</span></label>
                  <Input
                    prefix={<UserOutlined className="text-[#94a3b8] mr-1" />}
                    placeholder="e.g. Frontend Developer Intern"
                    value={activeItem?.role || ""}
                    onChange={(e) => updateExperience(activeIndex, "role", e.target.value)}
                    className="h-11 rounded-lg border-[#e2e8f0]"
                  />
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-semibold text-[#475569]">Company Name <span className="text-[#ef4444]">*</span></label>
                  <Input
                    prefix={<BankOutlined className="text-[#94a3b8] mr-1" />}
                    placeholder="e.g. Google"
                    value={activeItem?.company || ""}
                    onChange={(e) => updateExperience(activeIndex, "company", e.target.value)}
                    className="h-11 rounded-lg border-[#e2e8f0]"
                  />
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-semibold text-[#475569]">Employment Type</label>
                  <Select
                    value={activeItem?.employmentType || undefined}
                    placeholder="e.g. Internship"
                    onChange={(val) => updateExperience(activeIndex, "employmentType", val)}
                    className="h-11 rounded-lg [&>.ant-select-selector]:!rounded-lg [&>.ant-select-selector]:!border-[#e2e8f0]"
                    options={[
                      { value: 'Full-time', label: 'Full-time' },
                      { value: 'Part-time', label: 'Part-time' },
                      { value: 'Contract', label: 'Contract' },
                      { value: 'Internship', label: 'Internship' },
                      { value: 'Freelance', label: 'Freelance' }
                    ]}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-semibold text-[#475569]">City / Location <span className="text-[#ef4444]">*</span></label>
                  <Input
                    prefix={<EnvironmentOutlined className="text-[#94a3b8] mr-1" />}
                    placeholder="e.g. New York, USA"
                    value={activeItem?.city || ""}
                    onChange={(e) => updateExperience(activeIndex, "city", e.target.value)}
                    className="h-11 rounded-lg border-[#e2e8f0]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-semibold text-[#475569]">Industry (Optional)</label>
                  <Select
                    value={activeItem?.industry || undefined}
                    placeholder="e.g. Information Technology"
                    onChange={(val) => updateExperience(activeIndex, "industry", val)}
                    className="h-11 rounded-lg [&>.ant-select-selector]:!rounded-lg [&>.ant-select-selector]:!border-[#e2e8f0]"
                    options={[
                      { value: 'Information Technology', label: 'Information Technology' },
                      { value: 'Finance', label: 'Finance' },
                      { value: 'Healthcare', label: 'Healthcare' },
                      { value: 'Education', label: 'Education' },
                      { value: 'Manufacturing', label: 'Manufacturing' },
                      { value: 'Retail', label: 'Retail' }
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* Group 2: Duration */}
            <div className="flex flex-col gap-3 mt-1">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-full bg-[#eff6ff] border border-[#bfdbfe] flex items-center justify-center text-[#3b82f6]">
                  <CalendarOutlined />
                </div>
                <h4 className="font-bold text-[#0f172a] text-[16px] m-0">Duration</h4>
                <div className="flex-1 h-[1px] bg-[#e2e8f0] ml-2"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-semibold text-[#475569]">Start Date <span className="text-[#ef4444]">*</span></label>
                  <DatePicker
                    onChange={(_, date) => updateExperience(activeIndex, "startDate", date)}
                    value={activeItem?.startDate ? dayjs(activeItem?.startDate) : null}
                    className="h-11 rounded-lg w-full border-[#e2e8f0]"
                    picker="month"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-semibold text-[#475569]">End Date <span className="text-[#ef4444]">*</span></label>
                  <DatePicker
                    onChange={(_, date) => updateExperience(activeIndex, "endDate", date)}
                    value={activeItem?.endDate ? dayjs(activeItem?.endDate) : null}
                    className="h-11 rounded-lg w-full border-[#e2e8f0]"
                    picker="month"
                    disabled={activeItem?.current}
                    disabledDate={(current) => {
                      if (!activeItem?.startDate) return false;
                      return current && current < dayjs(activeItem.startDate).startOf("month");
                    }}
                  />
                  <div className="mt-1">
                    <Checkbox 
                      checked={activeItem?.current} 
                      onChange={(e) => {
                        updateExperience(activeIndex, "current", e.target.checked);
                        if (e.target.checked) updateExperience(activeIndex, "endDate", "");
                      }}
                      className="text-[13px] text-[#64748b]"
                    >
                      I currently intern here
                    </Checkbox>
                  </div>
                </div>
              </div>
            </div>


            {/* Group 4: Technologies Used */}
            <div className="flex flex-col gap-3 mt-1">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-full bg-[#eff6ff] border border-[#bfdbfe] flex items-center justify-center text-[#3b82f6]">
                  <TagsOutlined />
                </div>
                <h4 className="font-bold text-[#0f172a] text-[16px] m-0">Technologies Used <span className="text-[#64748b] font-normal">(Optional)</span></h4>
                <div className="flex-1 h-[1px] bg-[#e2e8f0] ml-2"></div>
              </div>
              <Select
                mode="tags"
                placeholder="e.g. React.js, Node.js"
                value={activeItem?.technologies || []}
                onChange={(val) => updateExperience(activeIndex, "technologies", val)}
                className="w-full min-h-[44px] rounded-lg [&>.ant-select-selector]:!rounded-lg [&>.ant-select-selector]:!border-[#e2e8f0]"
                tokenSeparators={[',']}
              />
            </div>

            {/* Group 5: Description */}
            <div className="flex flex-col gap-3 mt-1">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-full bg-[#eff6ff] border border-[#bfdbfe] flex items-center justify-center text-[#3b82f6]">
                  <TrophyOutlined />
                </div>
                <h4 className="font-bold text-[#0f172a] text-[16px] m-0">Description <span className="text-[#64748b] font-normal">(Optional)</span></h4>
                <div className="flex-1 h-[1px] bg-[#e2e8f0] ml-2"></div>
              </div>
              <div className="border border-[#e2e8f0] rounded-lg overflow-hidden">
                <TextEditor
                  initialContent={{ description: activeItem?.description } || ""}
                  editorFun={(e) => updateExperience(activeIndex, "description", e)}
                  name="description"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t border-[#f1f5f9]">
              <Button 
                danger 
                icon={<DeleteOutlined />} 
                className="rounded-lg h-11 px-5 font-semibold hover:!bg-red-50"
                onClick={() => {
                  removeExperience(activeItem.id);
                  setEditingId(null);
                }}
              >
                Delete Internship
              </Button>
              <div className="flex items-center gap-3">
                <span className="text-[14px] font-semibold text-[#475569]">Show in Resume</span>
                <Switch defaultChecked className="bg-[#1E69DA]" />
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

export default InternshipsDetails;
