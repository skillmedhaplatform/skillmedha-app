"use client";
import React, { useState } from "react";
import { Button, DatePicker, Input, Checkbox, Switch, Select } from "antd";
import { 
  DeleteOutlined, EditOutlined, PlusOutlined,
  ArrowLeftOutlined, SaveOutlined, UserOutlined,
  CalendarOutlined, BankOutlined, EnvironmentOutlined,
  BulbOutlined, LinkOutlined, CodeOutlined, TeamOutlined,
  AppstoreOutlined, FileTextOutlined, InfoCircleOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import TextEditor from "@/universalUtils/editor";

const ProjectDetails = ({
  projects,
  updateProject,
  addProject,
  removeProject,
  onNext,
}) => {
  const [editingIndex, setEditingIndex] = useState(null);

  const handleAdd = () => {
    addProject();
    setEditingIndex(projects.length);
  };

  const handleRemove = (index) => {
    removeProject(index);
    if (editingIndex === index) {
      setEditingIndex(null);
    } else if (editingIndex !== null && editingIndex > index) {
      setEditingIndex(editingIndex - 1);
    }
  };

  const activeItem = editingIndex !== null ? projects[editingIndex] : null;

  const renderAddedItems = () => (
    <div className="flex flex-col gap-3">
      <h4 className="font-bold text-[#0f172a] text-[16px] m-0">Added Projects</h4>
      <div className="grid grid-cols-1 gap-3">
        {projects.map((item, index) => (
          <div
            key={item.id || index}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
              editingIndex === index ? "border-[#3b82f6] bg-[#eff6ff] shadow-sm" : "border-[#e2e8f0] bg-white hover:border-[#cbd5e1]"
            }`}
          >
            <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => setEditingIndex(index)}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[14px] ${editingIndex === index ? 'bg-[#3b82f6] text-white' : 'bg-[#f1f5f9] text-[#64748b]'}`}>
                {index + 1}
              </div>
              <div className="flex flex-col flex-1">
                <h5 className="font-bold text-[#0f172a] m-0 text-[15px]">{item.project || "(Project not specified)"}</h5>
                <p className="text-[#64748b] m-0 text-[13px] mt-1">
                  {item.company || "Company"} • {item.startDate ? dayjs(item.startDate).format("MMM YYYY") : "Start"} - {item.current ? "Present" : (item.endDate ? dayjs(item.endDate).format("MMM YYYY") : "Present")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 pl-4 border-l border-[#e2e8f0]">
              <Button type="text" className="text-[#64748b] hover:text-[#3b82f6]" icon={<EditOutlined />} onClick={() => setEditingIndex(index)} />
              <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleRemove(index)} disabled={projects.length === 1} />
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
        Add Another Project
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

  return (
    <div className="w-full">
      {editingIndex !== null && activeItem ? (
        /* Form View */
        <div className="w-full">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 pb-6 border-b border-[#f1f5f9]">
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-1">
                  <ArrowLeftOutlined 
                    className="text-[#64748b] hover:text-[#0f172a] text-[20px] cursor-pointer transition-colors" 
                    onClick={() => setEditingIndex(null)} 
                  />
                  <h3 className="text-[22px] font-bold text-[#0f172a] m-0">
                    Edit Project
                  </h3>
                </div>
                <p className="text-[#64748b] text-[14px] m-0 ml-[32px]">
                  Add accurate details about your project.
                </p>
              </div>
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
                  Save Project
                </Button>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 mt-4">
              {/* Left Column: Form Fields */}
              <div className="flex-1 flex flex-col gap-6">
                
                {/* Group 1: Basic Information */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 mb-1">
                    <InfoCircleOutlined className="text-[#3b82f6] text-[18px]"/>
                    <h4 className="font-bold text-[#0f172a] text-[16px] m-0">Basic Information</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[13px] font-semibold text-[#475569]">Project Title <span className="text-[#ef4444]">*</span></label>
                      <Input
                        prefix={<AppstoreOutlined className="text-[#94a3b8] mr-1" />}
                        placeholder="e.g. E-Commerce Platform"
                        value={activeItem.project || ""}
                        onChange={(e) => updateProject(editingIndex, "project", e.target.value)}
                        className="h-11 rounded-lg border-[#e2e8f0]"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[13px] font-semibold text-[#475569]">Project Link (Optional)</label>
                      <Input
                        prefix={<LinkOutlined className="text-[#94a3b8] mr-1" />}
                        placeholder="https://github.com/..."
                        value={activeItem.projectLink || ""}
                        onChange={(e) => updateProject(editingIndex, "projectLink", e.target.value)}
                        className="h-11 rounded-lg border-[#e2e8f0]"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <label className="text-[13px] font-semibold text-[#475569]">Company / Institution</label>
                      <Input
                        prefix={<BankOutlined className="text-[#94a3b8] mr-1" />}
                        placeholder="e.g. Google"
                        value={activeItem.company || ""}
                        onChange={(e) => updateProject(editingIndex, "company", e.target.value)}
                        className="h-11 rounded-lg border-[#e2e8f0]"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <label className="text-[13px] font-semibold text-[#475569]">City / Location</label>
                      <Input
                        prefix={<EnvironmentOutlined className="text-[#94a3b8] mr-1" />}
                        placeholder="e.g. New York, NY, USA"
                        value={activeItem.city || ""}
                        onChange={(e) => updateProject(editingIndex, "city", e.target.value)}
                        className="h-11 rounded-lg border-[#e2e8f0]"
                      />
                    </div>

                    <div className="flex flex-col gap-1 xl:col-span-2">
                      <label className="text-[13px] font-semibold text-[#475569]">Technologies Used (Optional)</label>
                      <Select
                        mode="tags"
                        style={{ width: '100%' }}
                        placeholder="Select or enter technologies"
                        value={activeItem.technologies || []}
                        onChange={(val) => updateProject(editingIndex, "technologies", val)}
                        className="rounded-lg"
                        size="large"
                      />
                    </div>
                  </div>
                </div>

                {/* Group 2: Duration */}
                <div className="flex flex-col gap-3 border-t border-[#f1f5f9] pt-4">
                  <div className="flex items-center gap-2 mb-1">
                    <CalendarOutlined className="text-[#3b82f6] text-[18px]"/>
                    <h4 className="font-bold text-[#0f172a] text-[16px] m-0">Duration</h4>
                  </div>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[13px] font-semibold text-[#475569]">Start Date <span className="text-[#ef4444]">*</span></label>
                      <DatePicker
                        onChange={(_, date) => updateProject(editingIndex, "startDate", date)}
                        value={activeItem?.startDate ? dayjs(activeItem?.startDate) : null}
                        className="h-11 rounded-lg w-full border-[#e2e8f0]"
                        picker="month"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[13px] font-semibold text-[#475569]">End Date <span className="text-[#ef4444]">*</span></label>
                      <div className="flex items-center gap-3">
                        <DatePicker
                          onChange={(_, date) => updateProject(editingIndex, "endDate", date)}
                          value={activeItem?.endDate ? dayjs(activeItem?.endDate) : null}
                          className="h-11 rounded-lg flex-1 border-[#e2e8f0]"
                          picker="month"
                          disabled={activeItem?.current}
                          disabledDate={(current) => {
                            if (!activeItem?.startDate) return false;
                            return current && current < dayjs(activeItem.startDate).startOf("month");
                          }}
                        />
                        <Checkbox 
                          checked={activeItem?.current} 
                          onChange={(e) => {
                            updateProject(editingIndex, "current", e.target.checked);
                            if(e.target.checked) updateProject(editingIndex, "endDate", null);
                          }}
                          className="text-[14px] text-[#475569]"
                        >
                          Ongoing project
                        </Checkbox>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[13px] font-semibold text-[#475569]">Project Type (Optional)</label>
                      <Select
                        style={{ width: '100%' }}
                        placeholder="Personal Project"
                        value={activeItem.projectType || undefined}
                        onChange={(val) => updateProject(editingIndex, "projectType", val)}
                        className="rounded-lg"
                        size="large"
                        options={[
                          { label: "Personal Project", value: "Personal Project" },
                          { label: "Academic Project", value: "Academic Project" },
                          { label: "Open Source", value: "Open Source" },
                          { label: "Freelance", value: "Freelance" }
                        ]}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[13px] font-semibold text-[#475569]">Team Size (Optional)</label>
                      <Input
                        prefix={<TeamOutlined className="text-[#94a3b8] mr-1" />}
                        placeholder="e.g. 3"
                        type="number"
                        value={activeItem.teamSize || ""}
                        onChange={(e) => updateProject(editingIndex, "teamSize", e.target.value)}
                        className="h-11 rounded-lg border-[#e2e8f0]"
                      />
                    </div>
                  </div>
                </div>

                {/* Group 3: Description */}
                <div className="flex flex-col gap-3 border-t border-[#f1f5f9] pt-4">
                  <div className="flex items-center gap-2 mb-1">
                    <FileTextOutlined className="text-[#3b82f6] text-[18px]"/>
                    <h4 className="font-bold text-[#0f172a] text-[16px] m-0">Description / Summary <span className="text-[#ef4444]">*</span></h4>
                  </div>
                  <div className="flex flex-col gap-1 w-full bg-white rounded-lg border border-[#e2e8f0] overflow-hidden focus-within:border-[#3b82f6] transition-colors">
                    <TextEditor
                      initialContent={{ description: activeItem?.description || "" }}
                      editorFun={(val) => updateProject(editingIndex, "description", val)}
                      name="description"
                    />
                  </div>
                </div>



                <div className="flex items-center justify-between mt-6 pt-6 border-t border-[#f1f5f9]">
                  <Button danger type="text" icon={<DeleteOutlined />} onClick={() => handleRemove(editingIndex)} className="font-semibold text-[#ef4444] hover:bg-[#fef2f2]">
                    Delete Project
                  </Button>
                  <div className="flex items-center gap-3">
                    <span className="text-[13px] font-semibold text-[#64748b]">Show in Resume</span>
                    <Switch defaultChecked className="bg-[#3b82f6]" />
                  </div>
                </div>
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

export default ProjectDetails;
