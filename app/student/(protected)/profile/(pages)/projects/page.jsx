"use client";
import React, { useState, useEffect } from "react";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";
import axios from "axios";
import {
  Upload,
  Button,
  Input,
  DatePicker,
  Row,
  Col,
  Tag,
  message,
  Popconfirm,
} from "antd";
import {
  UploadOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

// REPLACED moment with dayjs
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

import { restUrl } from "@/config/urls";
import { updateStudent } from "@/redux/slices/student";
import { useDispatch, useSelector } from "react-redux";
import { getLstorage } from "@/universalUtils/windowMW";
import { parseIfJson } from "@/app/student/(protected)/jobAssessments/reusable_comp/jsonparse";

// Month format for storage and parsing
const monthFormat = "MM/YYYY";

// Only customDocs now; removed joiningFiles and relievingFiles
const initialProject = {
  company: "",
  project: "",
  start: null, // store as "MM/YYYY" or null
  end: null, // store as "MM/YYYY" or null
  city: "",
  description: "",
  customDocs: [],
  status: "warning",
  editing: true,
};

export default function WorkAndProjectsPage() {
  const dispatch = useDispatch();
  const studentDetails = useSelector((state) => state.student.student?.data);
  const [projects, setProjects] = useState([]);

  // Initialize from studentDetails.projects or default
  useEffect(() => {
    if (Array.isArray(studentDetails?.projects)) {
      setProjects(
        studentDetails.projects.map((item) => ({
          ...initialProject,
          ...item,
          editing: false,
          status: "success",
        }))
      );
    } else {
      setProjects([{ ...initialProject }]);
    }
  }, [studentDetails]);

  // Disable months after the current month
  const disabledFutureMonth = (current) =>
    current && current.isAfter(dayjs(), "month");

  const updateField = (idx, field, value) =>
    setProjects((prev) => {
      const arr = [...prev];
      arr[idx] = { ...arr[idx], [field]: value };
      return arr;
    });

  const token = getLstorage("token");

  // Handles customDocs upload
  const handleFileUpload = async (idx, file, docIndex) => {
    const formData = new FormData();
    formData.append("file", file, file.name);
    try {
      const { data } = await axios.post(
        `${restUrl}/uploadtos3?bucketName=skillmedha-student-docs`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ` + token,
          },
        }
      );
      const fileUrl = data.file;
      setProjects((prev) => {
        const arr = [...prev];
        const docs = [...arr[idx].customDocs];
        const existing = docs[docIndex].files || [];
        docs[docIndex].files = [
          ...existing.filter((f) => f.name !== file.name),
          { uid: file.uid, name: file.name, url: fileUrl },
        ];
        arr[idx].customDocs = docs;
        return arr;
      });
      message.success(`${file.name} uploaded`);
    } catch (error) {
      console.error(error);
      message.error("File upload failed");
    }
  };

  const removeFile = (idx, file, docIndex) =>
    setProjects((prev) => {
      const arr = [...prev];
      const docs = [...arr[idx].customDocs];
      docs[docIndex].files = docs[docIndex].files.filter(
        (f) => f.uid !== file.uid
      );
      arr[idx].customDocs = docs;
      return arr;
    });

  const addProject = () =>
    setProjects((prev) => [...prev, { ...initialProject }]);

  const addCustomDoc = (idx) => {
    const title = prompt("Enter document title");
    if (!title) return;
    setProjects((prev) => {
      const arr = [...prev];
      if (!arr[idx].customDocs.some((d) => d.title === title)) {
        arr[idx].editing = true;
        arr[idx].customDocs = [...arr[idx].customDocs, { title, files: [] }];
      }
      return arr;
    });
  };

  const saveProject = (idx) => {
    const item = projects[idx];
    if (!item.company || !item.project || !item.start || !item.end) {
      message.error(
        "Please fill Company, Project, Start Date, and End Date before saving"
      );
      return;
    }
    if (item.end && item.end <= item.start) {
      message.error(
        "Please fill Company, Project, Start Date, and End Date before saving"
      );
      return false;
    }
    setProjects((prev) => {
      const arr = [...prev];
      arr[idx].editing = false;
      arr[idx].status = "pending";
      return arr;
    });
    dispatch(
      updateStudent({
        dispatch,
        aboutDetails: { projects },
      })
    );
  };

  const deleteCustomDoc = (pIdx, docIndex) => {
    setProjects((prev) => {
      const updated = [...prev];
      const docs = [...updated[pIdx].customDocs];
      docs.splice(docIndex, 1); // remove doc at given index
      updated[pIdx].customDocs = docs;
      return updated;
    });
  };

  const deleteProject = (idx) => {
    setProjects((prev) => {
      const updated = prev.filter((_, i) => i !== idx);

      dispatch(
        updateStudent({
          dispatch,
          aboutDetails: { projects: updated },
        })
      );

      return updated;
    });
  };
  const getSafeContent = (value = "", maxLength = 300) => {
    const parsed = parseIfJson(value);

    // If it's an object/array after parsing → stringify
    const content =
      typeof parsed === "object" ? JSON.stringify(parsed, null, 2) : parsed;

    if (!content) return "";
    return content.length > maxLength
      ? content.substring(0, maxLength) + "..."
      : content;
  };

  return (
    <div className="max-w-full mx-auto">
      <StudentPageHeader section="Profile" title="Projects" />
      {projects.map((item, idx) => (
        <div key={idx} className="border border-solid border-[#24A058] rounded-lg p-6 mb-6 relative bg-white">
          {/* Header */}
          <div className="flex justify-between items-center text-[#24A058]">
            <div className="flex gap-2 justify-start items-center">
              {item.status === "success" ? (
                <CheckCircleOutlined />
              ) : (
                <ExclamationCircleOutlined />
              )}
              <div className="text-[1.2rem] font-bold flex gap-2 items-center">
                {item.project}
                <span>-</span>
                {item?.verificationType == "approved" ? (
                  <div className="text-base text-green-500">Verified</div>
                ) : item?.verificationType == "resubmission" ? (
                  <div className="text-base text-red-500">Re-Submit</div>
                ) : (
                  <div className="text-base text-[#ffc400]">Not Verified.</div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {!item.editing && (
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => updateField(idx, "editing", true)}
                />
              )}
              {projects.length > 1 && (
                <Popconfirm
                  title="Delete this project?"
                  description="This action cannot be undone."
                  okText="Delete"
                  cancelText="Cancel"
                  okButtonProps={{ danger: true }}
                  placement="left"
                  onConfirm={() => deleteProject(idx)}
                >
                  <Button type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              )}
            </div>
          </div>

          {/* Form View */}
          {item.editing ? (
            <div className="mt-4">
              <Row gutter={[16, 16]}>
                {/* Company */}
                <Col span={24}>
                  <div className="flex items-center mb-4">
                    <label className="flex-none w-[200px] m-0 text-[#555] font-medium">Company</label>
                    <Input
                      className="flex-auto bg-[#eafaf1] border-none outline-none"
                      value={item.company}
                      placeholder="Company / organisation name"
                      onChange={(e) =>
                        updateField(idx, "company", e.target.value)
                      }
                    />
                  </div>
                </Col>

                {/* Project */}
                <Col span={24}>
                  <div className="flex items-center mb-4">
                    <label className="flex-none w-[200px] m-0 text-[#555] font-medium">Project</label>
                    <Input
                      className="flex-auto bg-[#eafaf1] border-none outline-none"
                      value={item.project}
                      placeholder="Project title"
                      onChange={(e) =>
                        updateField(idx, "project", e.target.value)
                      }
                    />
                  </div>
                </Col>

                {/* Dates */}
                <Col span={12}>
                  <div className="flex items-center mb-4">
                    <label className="flex-none w-[200px] m-0 text-[#555] font-medium">Start Date</label>
                    <DatePicker
                      className="flex-auto bg-[#eafaf1] border-none outline-none"
                      picker="month"
                      format={monthFormat}
                      value={item.start ? dayjs(item.start, monthFormat) : null}
                      onChange={(date) =>
                        updateField(
                          idx,
                          "start",
                          date ? date.format(monthFormat) : null
                        )
                      }
                      disabledDate={disabledFutureMonth}
                      style={{ width: "100%" }}
                    />
                  </div>
                </Col>
                <Col span={12}>
                  <div className="flex items-center mb-4">
                    <label className="flex-none w-[200px] m-0 text-[#555] font-medium">End Date</label>
                    <DatePicker
                      className="flex-auto bg-[#eafaf1] border-none outline-none"
                      picker="month"
                      format={monthFormat}
                      value={item.end ? dayjs(item.end, monthFormat) : null}
                      onChange={(date) =>
                        updateField(
                          idx,
                          "end",
                          date ? date.format(monthFormat) : null
                        )
                      }
                      disabledDate={disabledFutureMonth}
                      style={{ width: "100%" }}
                    />
                  </div>
                </Col>

                {/* City */}
                <Col span={24}>
                  <div className="flex items-center mb-4">
                    <label className="flex-none w-[200px] m-0 text-[#555] font-medium">City</label>
                    <Input
                      className="flex-auto bg-[#eafaf1] border-none outline-none"
                      value={item.city}
                      placeholder="City"
                      onChange={(e) => updateField(idx, "city", e.target.value)}
                    />
                  </div>
                </Col>

                {/* Description */}
                <Col span={24}>
                  <div className="flex items-center mb-4">
                    <label className="flex-none w-[200px] m-0 text-[#555] font-medium">Description</label>
                    <textarea
                      className="max-w-full w-full overflow-y-auto resize-none min-h-[8rem] h-auto rounded-[5px] p-4 text-[16px] bg-[#eafaf1] border-none outline-none"
                      value={item.description}
                      placeholder="Describe the project in detail"
                      onChange={(e) =>
                        updateField(idx, "description", e.target.value)
                      }
                    />
                  </div>
                </Col>

                {/* Custom Docs */}
                {item.customDocs.map((doc, didx) => (
                  <Col span={24} key={didx}>
                    <div className="flex items-center mb-4">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <label className="flex-none w-[200px] m-0 text-[#555] font-medium">{doc.title}</label>
                        <Button
                          type="text"
                          icon={<DeleteOutlined />}
                          onClick={() => deleteCustomDoc(idx, didx)}
                          danger
                        />
                      </div>

                      <Upload
                        multiple={false}
                        beforeUpload={(file) => {
                          handleFileUpload(idx, file, didx);
                          return Upload.LIST_IGNORE;
                        }}
                        onRemove={(file) => removeFile(idx, file, didx)}
                        showUploadList={false}
                      >
                        <Button
                          icon={<UploadOutlined />}
                          disabled={doc.files?.length >= 1}
                        >
                          Select File
                        </Button>
                      </Upload>

                      <div className="my-4">
                        {doc.files?.map((f) => (
                          <Tag
                            key={f.uid}
                            closable
                            onClose={() => removeFile(idx, f, didx)}
                          >
                            {f.name}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>

              <div className="flex justify-between mt-6">
                <Button
                  onClick={() => addCustomDoc(idx)}
                  icon={<PlusOutlined />}
                >
                  Add Document
                </Button>
                <Button type="primary" onClick={() => saveProject(idx)}>
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full">
              <div className="w-full flex items-center justify-start gap-2">
                <span>{item.company}</span>
                <span>
                  {" "}
                  | {item.start} to {item.end}
                </span>
                <span> | {item.city}</span>
              </div>
              <hr />
              <div
                className="w-full"
                dangerouslySetInnerHTML={{
                  __html: getSafeContent(item.description, 300),
                }}
              />
            </div>
          )}
        </div>
      ))}

      <Button
        type="dashed"
        icon={<PlusOutlined />}
        onClick={addProject}
        className="w-full text-center"
      >
        Add More Projects
      </Button>
    </div>
  );
}
