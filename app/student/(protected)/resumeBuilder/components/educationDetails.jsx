"use client";
import React, { useState } from "react";
import { Button, DatePicker, Select, Input, Switch, AutoComplete } from "antd";
import { 
  DeleteOutlined, EditOutlined, PlusOutlined,
  ArrowLeftOutlined, SaveOutlined, UserOutlined,
  CalendarOutlined, BarChartOutlined, BankOutlined,
  ReadOutlined, SafetyCertificateOutlined, EnvironmentOutlined,
  IdcardOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import TextEditor from "@/universalUtils/editor";

const { Option } = Select;
const degreeOptions = [{value: 'B.Tech'}, {value: 'B.Sc'}, {value: 'B.Com'}, {value: 'B.A.'}, {value: 'M.Tech'}, {value: 'MBA'}, {value: '10th / SSC'}, {value: '12th / Intermediate'}, {value: 'Diploma'}];
const boardOptions = [{value: 'State Board'}, {value: 'CBSE'}, {value: 'ICSE'}, {value: 'JNTUH'}, {value: 'JNTUK'}, {value: 'JNTUA'}, {value: 'Osmania University'}, {value: 'Anna University'}];
const fieldOptions = [{value: 'Computer Science and Engineering (CSE)'}, {value: 'Electronics and Communication Engineering (ECE)'}, {value: 'Mechanical Engineering'}, {value: 'Electrical and Electronics Engineering (EEE)'}, {value: 'Civil Engineering'}, {value: 'Information Technology (IT)'}];
const EduTitles = ["10th / Secondary Education", "12th / Diploma", "Degree / B.Tech"];


const collegeUniversityMap = {
  "GITAM": "GITAM Deemed to be University",
  "CBIT": "Osmania University",
  "SRM": "SRM Institute of Science and Technology",
  "VIT": "Vellore Institute of Technology",
  "BITS Pilani": "Birla Institute of Technology and Science",
  "IIT Bombay": "Indian Institute of Technology Bombay",
  "IIT Delhi": "Indian Institute of Technology Delhi",
  "IIT Madras": "Indian Institute of Technology Madras",
  "NIT Trichy": "National Institute of Technology Tiruchirappalli",
  "NIT Warangal": "National Institute of Technology Warangal",
  "JNTUH": "Jawaharlal Nehru Technological University Hyderabad",
  "JNTUK": "Jawaharlal Nehru Technological University Kakinada",
  "JNTUA": "Jawaharlal Nehru Technological University Anantapur",
  "Andhra University": "Andhra University",
  "Osmania University": "Osmania University"
};

const collegeOptions = Object.keys(collegeUniversityMap).map(key => ({ value: key }));

const EducationDetails = ({
  educationDetails,
  updateEducationDetail,
  addEducation,
  removeEducation,
  onNext,
}) => {
  const [editingIndex, setEditingIndex] = useState(null);

  const handleAdd = () => {
    addEducation();
    setEditingIndex(educationDetails.length);
  };

  const handleRemove = (index) => {
    removeEducation(index);
    if (editingIndex === index) {
      setEditingIndex(null);
    } else if (editingIndex !== null && editingIndex > index) {
      setEditingIndex(editingIndex - 1);
    }
  };

  const getEducationTitle = (index) => EduTitles[index] || `Education Level ${index + 1}`;

  const validateGrade = (value, type) => {
    if (!value) return { valid: false, message: "Grade is required" };
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return { valid: false, message: "Please enter a valid number" };
    if (type === "cgpa" && (numValue < 0 || numValue > 10)) {
      return { valid: false, message: "CGPA must be between 0 and 10" };
    } else if (type === "percentage" && (numValue < 0 || numValue > 100)) {
      return { valid: false, message: "Percentage must be between 0 and 100" };
    }
    return { valid: true, message: "" };
  };

  const activeItem = editingIndex !== null ? educationDetails[editingIndex] : null;

  const renderAddedItems = () => (
    <div className="flex flex-col gap-3">
      <h4 className="font-bold text-[#0f172a] text-[16px] m-0">Added Education</h4>
      <div className="grid grid-cols-1 gap-3">
        {educationDetails.map((item, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
              editingIndex === index ? "border-[#3b82f6] bg-[#eff6ff] shadow-sm" : "border-[#e2e8f0] bg-white hover:border-[#cbd5e1]"
            }`}
          >
            <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => setEditingIndex(index)}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[14px] ${editingIndex === index ? 'bg-[#3b82f6] text-white' : 'bg-[#f1f5f9] text-[#64748b]'}`}>
                {index + 1}
              </div>
              <div className="flex flex-col flex-1">
                <h5 className="font-bold text-[#0f172a] m-0 text-[15px]">{item.school || "(Institution not specified)"}</h5>
                <p className="text-[#64748b] m-0 text-[13px] mt-1">
                  {item.type || getEducationTitle(index)} • {item.startDate ? dayjs(item.startDate).format("MMM YYYY") : "Start"} - {item.endDate ? dayjs(item.endDate).format("MMM YYYY") : "Present"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 pl-4 border-l border-[#e2e8f0]">
              <Button type="text" className="text-[#64748b] hover:text-[#3b82f6]" icon={<EditOutlined />} onClick={() => setEditingIndex(index)} />
              <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleRemove(index)} disabled={educationDetails.length === 1} />
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
        Add Another Education
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


  const getFieldLabels = (type) => {
    const t = (type || "").toLowerCase();
    let instLabel = "Institution / School";
    let boardLabel = "Board / University";
    let streamLabel = "Field of Study (Optional)";
    let streamPlaceholder = "e.g. Computer Science";
    let showStream = true;

    if (t.includes("10th") || t.includes("ssc") || t.includes("secondary")) {
      instLabel = "School Name";
      boardLabel = "Board of Education";
      showStream = false;
    } else if (t.includes("12th") || t.includes("inter") || t.includes("intermediate")) {
      instLabel = "College Name";
      boardLabel = "Board of Education";
      streamLabel = "Stream / Group";
      streamPlaceholder = "e.g. MPC, BiPC";
    } else if (t.includes("diploma")) {
      instLabel = "College Name";
      boardLabel = "Board / University";
      streamLabel = "Branch";
      streamPlaceholder = "e.g. Mechanical Engineering";
    } else if (t.includes("b.tech") || t.includes("btech") || t.includes("b.e") || t.includes("degree")) {
      instLabel = "College / Institution";
      boardLabel = "University";
      streamLabel = "Branch / Specialization";
      streamPlaceholder = "e.g. Computer Science";
    }

    return { instLabel, boardLabel, streamLabel, streamPlaceholder, showStream };
  };

  const labels = activeItem ? getFieldLabels(activeItem.type) : getFieldLabels("");

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
                    Edit {getEducationTitle(editingIndex)}
                  </h3>
                </div>
                <p className="text-[#64748b] text-[14px] m-0 ml-[32px]">
                  Add accurate details about your education.
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
                  Save Education
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
                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-semibold text-[#475569]">{labels.instLabel} <span className="text-[#ef4444]">*</span></label>
                  <AutoComplete
                    options={activeItem.type === "B.Tech" ? collegeOptions : []}
                    value={activeItem.school || ""}
                    onChange={(val) => {
                      updateEducationDetail(editingIndex, "school", val);
                      if (collegeUniversityMap[val]) {
                        updateEducationDetail(editingIndex, "board", collegeUniversityMap[val]);
                      }
                    }}
                    className="w-full"
                    filterOption={(inputValue, option) => option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1}
                  >
                    <Input
                      prefix={<BankOutlined className="text-[#94a3b8] mr-1" />}
                      placeholder="e.g. Stanford University"
                      className="h-11 rounded-lg border-[#e2e8f0]"
                    />
                  </AutoComplete>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-semibold text-[#475569]">Degree / Type <span className="text-[#ef4444]">*</span></label>
                  <AutoComplete
                    options={degreeOptions}
                    value={activeItem.type || ""}
                    onChange={(val) => updateEducationDetail(editingIndex, "type", val)}
                    className="w-full"
                    filterOption={(inputValue, option) => option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1}
                  >
                    <Input
                      prefix={<SafetyCertificateOutlined className="text-[#94a3b8] mr-1" />}
                      placeholder="e.g. B.Tech"
                      className="h-11 rounded-lg border-[#e2e8f0]"
                    />
                  </AutoComplete>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-semibold text-[#475569]">{labels.boardLabel} <span className="text-[#ef4444]">*</span></label>
                  <AutoComplete
                    options={boardOptions}
                    value={activeItem.board || ""}
                    onChange={(val) => updateEducationDetail(editingIndex, "board", val)}
                    className="w-full"
                    filterOption={(inputValue, option) => option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1}
                  >
                    <Input
                      prefix={<SafetyCertificateOutlined className="text-[#94a3b8] mr-1" />}
                      placeholder="e.g. State Board"
                      className="h-11 rounded-lg border-[#e2e8f0]"
                    />
                  </AutoComplete>
                </div>
                {labels.showStream && (
                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-semibold text-[#475569]">{labels.streamLabel}</label>
                  <AutoComplete
                    options={fieldOptions}
                    value={activeItem.stream || ""}
                    onChange={(val) => updateEducationDetail(editingIndex, "stream", val)}
                    className="w-full"
                    filterOption={(inputValue, option) => option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1}
                  >
                    <Input
                      prefix={<ReadOutlined className="text-[#94a3b8] mr-1" />}
                      placeholder={labels.streamPlaceholder}
                      className="h-11 rounded-lg border-[#e2e8f0]"
                    />
                  </AutoComplete>
                </div>
                )}
                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-semibold text-[#475569]">Hall Ticket No.</label>
                  <Input
                    prefix={<IdcardOutlined className="text-[#94a3b8] mr-1" />}
                    placeholder="Roll number"
                    value={activeItem.hallTicket || ""}
                    onChange={(e) => updateEducationDetail(editingIndex, "hallTicket", e.target.value)}
                    className="h-11 rounded-lg border-[#e2e8f0]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-semibold text-[#475569]">City / Location</label>
                  <Input
                    prefix={<EnvironmentOutlined className="text-[#94a3b8] mr-1" />}
                    placeholder="e.g. San Francisco, CA"
                    value={activeItem.city || ""}
                    onChange={(e) => updateEducationDetail(editingIndex, "city", e.target.value)}
                    className="h-11 rounded-lg border-[#e2e8f0]"
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
                    onChange={(_, date) => updateEducationDetail(editingIndex, "startDate", date)}
                    value={activeItem?.startDate ? dayjs(activeItem?.startDate) : null}
                    className="h-11 rounded-lg w-full border-[#e2e8f0]"
                    picker="month"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-semibold text-[#475569]">End Date / Expected <span className="text-[#ef4444]">*</span></label>
                  <DatePicker
                    onChange={(_, date) => updateEducationDetail(editingIndex, "endDate", date)}
                    value={activeItem?.endDate ? dayjs(activeItem?.endDate) : null}
                    className="h-11 rounded-lg w-full border-[#e2e8f0]"
                    picker="month"
                    disabledDate={(current) => {
                      if (!activeItem?.startDate) return false;
                      return current && current < dayjs(activeItem.startDate).startOf("month");
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Group 3: Grade / Score */}
            <div className="flex flex-col gap-3 mt-1">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-full bg-[#eff6ff] border border-[#bfdbfe] flex items-center justify-center text-[#3b82f6]">
                  <BarChartOutlined />
                </div>
                <h4 className="font-bold text-[#0f172a] text-[16px] m-0">Grade / Score</h4>
                <div className="flex-1 h-[1px] bg-[#e2e8f0] ml-2"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-semibold text-[#475569]">Grade Type</label>
                  <Select
                    value={activeItem.gradeType || "percentage"}
                    onChange={(value) => {
                      updateEducationDetail(editingIndex, "gradeType", value);
                      updateEducationDetail(editingIndex, "grade", "");
                    }}
                    className="h-11 [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-[#e2e8f0] [&_.ant-select-selector]:!flex [&_.ant-select-selector]:!items-center"
                  >
                    <Option value="percentage">Percentage</Option>
                    <Option value="cgpa">CGPA</Option>
                  </Select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-semibold text-[#475569]">
                    {activeItem.gradeType === "cgpa" ? "CGPA" : "Percentage"} <span className="text-[#ef4444]">*</span>
                  </label>
                  <div className="flex-1 flex flex-col">
                    <Input
                      placeholder={activeItem.gradeType === "cgpa" ? "Enter CGPA (0-10)" : "Enter Percentage (0-100)"}
                      value={activeItem.grade || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        const validation = validateGrade(value, activeItem.gradeType || "percentage");
                        updateEducationDetail(editingIndex, "grade", value);
                        updateEducationDetail(editingIndex, "gradeError", !validation.valid && value ? validation.message : "");
                      }}
                      suffix={
                        <span className="text-[#94a3b8] font-medium px-2 border-l border-[#e2e8f0]">
                          {activeItem.gradeType === "cgpa" ? "CGPA" : "%"}
                        </span>
                      }
                      status={activeItem.gradeError ? "error" : ""}
                      className="h-11 rounded-lg w-full border-[#e2e8f0] px-0 [&>input]:px-3"
                    />
                    {activeItem.gradeError && (
                      <span className="text-[#ff4d4f] text-[12px] mt-1">{activeItem.gradeError}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Group 4: Description */}
            <div className="flex flex-col gap-3 mt-1">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-full bg-[#eff6ff] border border-[#bfdbfe] flex items-center justify-center text-[#3b82f6]">
                  <EditOutlined />
                </div>
                <h4 className="font-bold text-[#0f172a] text-[16px] m-0">Description / Achievements <span className="text-[#64748b] font-normal">(Optional)</span></h4>
                <div className="flex-1 h-[1px] bg-[#e2e8f0] ml-2"></div>
              </div>
              <div className="border border-[#e2e8f0] rounded-lg overflow-hidden">
                <TextEditor
                  initialContent={{ description: activeItem.description } || ""}
                  editorFun={(e) => updateEducationDetail(editingIndex, "description", e)}
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
                onClick={() => handleRemove(editingIndex)}
              >
                Delete Education
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

export default EducationDetails;
