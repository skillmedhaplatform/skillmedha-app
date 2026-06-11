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
  Select,
  Modal,
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

// Month format for storage and parsing (reference style)
const monthFormat = "MM/YYYY";

import { restUrl } from "@/config/urls";
import { updateStudent } from "@/redux/slices/student";
import { useDispatch, useSelector } from "react-redux";
import { getLstorage } from "@/universalUtils/windowMW";
import { parseIfJson } from "@/app/student/(protected)/jobAssessments/reusable_comp/jsonparse";


const initialExperience = {
  company: "",
  type: "",
  role: "",
  start: null, // store as "MM/YYYY" or null
  end: null, // store as "MM/YYYY" or null
  city: "",
  description: "",
  joiningFiles: [],
  relievingFiles: [],
  certificate: [],
  customDocs: [],
  status: "warning",
};

export default function WorkAndInternshipPage() {
  const dispatch = useDispatch();
  const studentDetails = useSelector((state) => state.student.student?.data);
  const [experiences, setExperiences] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const { Option } = Select;

  // Initialize experiences from student details or default
  useEffect(() => {
    if (studentDetails?.experiences?.length) {
      setExperiences(
        studentDetails.experiences.map((exp) => ({
          ...initialExperience,
          ...exp,
          status: "success",
        }))
      );
    } else {
      setExperiences([{ ...initialExperience }]);
    }
  }, [studentDetails]);

  // Disable months after the current month (reference style)
  const disabledFutureMonth = (current) =>
    current && current.isAfter(dayjs(), "month");

  const updateField = (idx, field, value) => {
    if (idx !== editingIndex) return;
    setExperiences((prev) => {
      const arr = [...prev];
      arr[idx] = { ...arr[idx], [field]: value };
      return arr;
    });
  };

  const token = getLstorage("token");

  const handleFileUpload = async (idx, category, file, docIndex) => {
    if (idx !== editingIndex) return;

    const formData = new FormData();
    formData.append("file", file, file.name);

    try {
      setLoading(true);
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
      setExperiences((prev) => {
        const arr = [...prev];
        if (category === "joining") {
          const list = arr[idx].joiningFiles.filter(
            (f) => f.name !== file.name
          );
          arr[idx].joiningFiles = [
            ...list,
            { uid: file.uid, name: file.name, url: fileUrl },
          ];
        } else if (category === "relieving") {
          const list = arr[idx].relievingFiles.filter(
            (f) => f.name !== file.name
          );
          arr[idx].relievingFiles = [
            ...list,
            { uid: file.uid, name: file.name, url: fileUrl },
          ];
        } else if (category === "certificate") {
          const list = arr[idx].certificate.filter((f) => f.name !== file.name);
          arr[idx].certificate = [
            ...list,
            { uid: file.uid, name: file.name, url: fileUrl },
          ];
        } else {
          const docs = [...arr[idx].customDocs];
          const list = docs[docIndex].files.filter((f) => f.name !== file.name);
          if (docs?.length) {
            docs[docIndex].files = [
              ...list,
              { uid: file.uid, name: file.name, url: fileUrl },
            ];
            arr[idx].customDocs = docs;
          }
        }
        return arr;
      });
    } catch (error) {
      console.error(error);
      message.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const removeFile = (idx, category, file, docIndex) => {
    if (idx !== editingIndex) return;

    setExperiences((prev) => {
      const arr = [...prev];
      const current = { ...arr[idx] };

      if (category === "joining") {
        current.joiningFiles = current.joiningFiles.filter(
          (f) => f.uid !== file.uid
        );
      } else if (category === "relieving") {
        current.relievingFiles = current.relievingFiles.filter(
          (f) => f.uid !== file.uid
        );
      } else if (category === "certificate") {
        current.certificate = current.certificate.filter(
          (f) => f.uid !== file.uid
        );
      } else {
        const docs = [...current.customDocs];
        docs[docIndex] = {
          ...docs[docIndex],
          files: docs[docIndex].files.filter((f) => f.uid !== file.uid),
        };
        current.customDocs = docs;
      }

      arr[idx] = current;
      return arr;
    });
  };

  const addExperience = () => {
    if (editingIndex !== null) {
      message.warning(
        "Please save or cancel the current editing experience first"
      );
      return;
    }

    setExperiences((prev) => [...prev, { ...initialExperience }]);
    setEditingIndex(experiences.length);
  };

  const addCustomDoc = (idx) => {
    if (idx !== editingIndex) return;

    const title = prompt("Enter document title");
    if (!title?.trim()) return;

    setExperiences((prev) => {
      return prev.map((exp, expIdx) => {
        if (expIdx !== idx) return exp;

        if (exp.customDocs.some((doc) => doc.title === title)) {
          message.warning("A document with this title already exists");
          return exp;
        }

        return {
          ...exp,
          customDocs: [...exp.customDocs, { title, files: [] }],
        };
      });
    });
  };

  const isExperienceValid = (exp) => {
    const basicFieldsValid =
      exp.company && exp.type && exp.role && exp.start && exp.end && exp.city;

    if (!basicFieldsValid) return false;
    if (exp.end && exp.end <= exp.start) {
      return false;
    }
    if (exp.type === "Work") {
      return exp.joiningFiles.length > 0 && exp.relievingFiles.length > 0;
    } else if (exp.type === "Internship") {
      return exp.certificate.length > 0;
    }

    return true;
  };

  const saveExperience = (idx) => {
    if (idx !== editingIndex) return;

    const exp = experiences[idx];
    if (!isExperienceValid(exp)) {
      message.error(
        "Please fill all required fields (Employer, Type, Role, Start Date, End Date, and City) before saving"
      );
      return;
    }

    const updatedExperiences = [...experiences];
    updatedExperiences[idx] = { ...exp, status: "pending" };

    setExperiences(updatedExperiences);
    dispatch(
      updateStudent({
        dispatch,
        aboutDetails: { experiences: updatedExperiences },
      })
    );
    setEditingIndex(null);
  };

  const deleteExperience = async (idx) => {
    Modal.confirm({
      title: "Confirm Deletion",
      content: "Are you sure you want to delete this experience?",
      onOk: async () => {
        try {
          const newExperiences = experiences.filter((_, i) => i !== idx);
          setExperiences(newExperiences);

          if (editingIndex === idx) {
            setEditingIndex(null);
          } else if (editingIndex > idx) {
            setEditingIndex(editingIndex - 1);
          }

          await dispatch(
            updateStudent({
              dispatch,
              aboutDetails: { experiences: newExperiences },
            })
          );
        } catch (error) {
          console.error(error);
          message.error("Failed to delete experience");
        }
      },
    });
  };

  const startEditing = (idx) => {
    if (editingIndex !== null) {
      message.warning("Only one experience can be edited at a time");
      return;
    }
    setEditingIndex(idx);
  };

  const removeCustomDoc = (idx, docIndex) => {
    if (idx !== editingIndex) return;

    setExperiences((prev) => {
      return prev.map((exp, expIdx) => {
        if (expIdx !== idx) return exp;

        return {
          ...exp,
          customDocs: exp.customDocs.filter((_, i) => i !== docIndex),
        };
      });
    });
  };

  const getSafeDescription = (desc = "", maxLength = 400) => {
    const parsed = parseIfJson(desc);
    const content =
      typeof parsed === "object" ? JSON.stringify(parsed, null, 2) : parsed;

    if (!content) return "";
    return content.length >= maxLength
      ? content.substring(0, maxLength) + "..."
      : content;
  };

  return (
    <div className="max-w-full mx-auto">
      <StudentPageHeader section="Profile" title="Work & Internships" />
      {experiences?.map((exp, idx) => (
        <div key={idx} className="border border-solid border-[#24A058] rounded-lg p-6 mb-6 relative bg-white">
          {/* Header */}
          <div className="flex justify-between items-center text-[#24A058]">
            <div className="flex gap-2 justify-start items-center">
              {exp.status === "success" ? (
                <CheckCircleOutlined />
              ) : (
                <ExclamationCircleOutlined />
              )}
              <div className="text-[1.2rem] font-bold flex gap-2 items-center">
                {exp?.role}
                <span> - </span>
                {exp?.type}
                <span>-</span>
                {exp?.verificationType == "approved" ? (
                  <div className="text-base text-green-500">Verified</div>
                ) : exp?.verificationType == "resubmission" ? (
                  <div className="text-base text-red-500">Re-Submit</div>
                ) : (
                  <div className="text-base text-[#ffc400]">Not Verified.</div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {idx !== editingIndex && (
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => startEditing(idx)}
                />
              )}
              {experiences.length > 1 && (
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => deleteExperience(idx)}
                />
              )}
            </div>
          </div>

          {/* Form View */}
          {idx === editingIndex ? (
            <div className="mt-4">
              <Row gutter={[16, 16]}>
                {/* Employer */}
                <Col span={24}>
                  <div className="flex items-center mb-4">
                    <label className="flex-none w-[200px] m-0 text-[#555] font-medium">Employer*</label>
                    <Input
                      className="flex-auto bg-[#eafaf1] border-none outline-none"
                      value={exp?.company}
                      placeholder="Company / organisation name"
                      onChange={(e) =>
                        updateField(idx, "company", e.target.value)
                      }
                    />
                  </div>
                </Col>

                {/* Role */}
                <Col span={12}>
                  <div className="flex items-center mb-4">
                    <label className="flex-none w-[200px] m-0 text-[#555] font-medium">Role*</label>
                    <Input
                      className="flex-auto bg-[#eafaf1] border-none outline-none"
                      value={exp.role}
                      placeholder="Role"
                      onChange={(e) => updateField(idx, "role", e.target.value)}
                    />
                  </div>
                </Col>

                {/* Type */}
                <Col span={12}>
                  <div className="flex items-center mb-4">
                    <label className="flex-none w-[200px] m-0 text-[#555] font-medium">Type*</label>
                    <Select
                      className="flex-auto [&>.ant-select-selector]:bg-[#eafaf1] [&>.ant-select-selector]:border-none [&>.ant-select-selector]:outline-none"
                      value={exp.type || undefined}
                      placeholder="--Work Type--"
                      onChange={(value) => updateField(idx, "type", value)}
                    >
                      <Option value="Internship">Internship</Option>
                      <Option value="Work">Work</Option>
                    </Select>
                  </div>
                </Col>

                {/* Dates (dayjs, month format, disable future months) */}
                <Col span={12}>
                  <div className="flex items-center mb-4">
                    <label className="flex-none w-[200px] m-0 text-[#555] font-medium">Start Date*</label>
                    <DatePicker
                      className="flex-auto bg-[#eafaf1] border-none outline-none"
                      picker="month"
                      format={monthFormat}
                      value={exp?.start ? dayjs(exp.start, monthFormat) : null}
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
                    <label className="flex-none w-[200px] m-0 text-[#555] font-medium">End Date*</label>
                    <DatePicker
                      className="flex-auto bg-[#eafaf1] border-none outline-none"
                      picker="month"
                      format={monthFormat}
                      value={exp?.end ? dayjs(exp.end, monthFormat) : null}
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
                    <label className="flex-none w-[200px] m-0 text-[#555] font-medium">City*</label>
                    <Input
                      className="flex-auto bg-[#eafaf1] border-none outline-none"
                      value={exp?.city}
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
                      value={exp.description}
                      placeholder={`* Relevant Coursework: [Course 1], [Course 2]\n* GPA: [Your GPA]`}
                      onChange={(e) =>
                        updateField(idx, "description", e.target.value)
                      }
                    />
                  </div>
                </Col>

                {/* Work: Joining + Relieving */}
                {exp.type === "Work" && (
                  <>
                    <Col span={24}>
                      <div className="flex items-center mb-4">
                        <label className="flex-none w-[200px] m-0 text-[#555] font-medium">
                          Upload Joining Letter*
                        </label>
                        <Upload
                          multiple
                          fileList={exp.joiningFiles}
                          beforeUpload={(file) => {
                            handleFileUpload(idx, "joining", file);
                            return Upload.LIST_IGNORE;
                          }}
                          onRemove={(file) => removeFile(idx, "joining", file)}
                          showUploadList={false}
                        >
                          <Button
                            icon={<UploadOutlined />}
                            loading={loading}
                            disabled={exp.joiningFiles.length >= 1}
                          >
                            Select File
                          </Button>
                        </Upload>
                        <div className="my-4">
                          {exp.joiningFiles.map((f) => (
                            <Tag
                              key={f.uid}
                              closable
                              onClose={() => removeFile(idx, "joining", f)}
                            >
                              {f.name}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    </Col>

                    <Col span={24}>
                      <div className="flex items-center mb-4">
                        <label className="flex-none w-[200px] m-0 text-[#555] font-medium">
                          Upload Relieving Letter*
                        </label>
                        <Upload
                          multiple
                          fileList={exp.relievingFiles}
                          beforeUpload={(file) => {
                            handleFileUpload(idx, "relieving", file);
                            return Upload.LIST_IGNORE;
                          }}
                          onRemove={(file) =>
                            removeFile(idx, "relieving", file)
                          }
                          showUploadList={false}
                        >
                          <Button
                            icon={<UploadOutlined />}
                            loading={loading}
                            disabled={exp.relievingFiles.length >= 1}
                          >
                            Select File
                          </Button>
                        </Upload>
                        <div className="my-4">
                          {exp.relievingFiles.map((f) => (
                            <Tag
                              key={f.uid}
                              closable
                              onClose={() => removeFile(idx, "relieving", f)}
                            >
                              {f.name}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    </Col>
                  </>
                )}

                {/* Internship: Certificate */}
                {exp.type === "Internship" && (
                  <Col span={24}>
                    <div className="flex items-center mb-4">
                      <label className="flex-none w-[200px] m-0 text-[#555] font-medium">
                        Upload Certificate*
                      </label>
                      <Upload
                        multiple
                        fileList={exp.certificate}
                        beforeUpload={(file) => {
                          handleFileUpload(idx, "certificate", file);
                          return Upload.LIST_IGNORE;
                        }}
                        onRemove={(file) =>
                          removeFile(idx, "certificate", file)
                        }
                        showUploadList={false}
                      >
                        <Button
                          icon={<UploadOutlined />}
                          loading={loading}
                          disabled={exp?.certificate?.length >= 1}
                        >
                          Select File
                        </Button>
                      </Upload>
                      <div className="my-4">
                        {exp.certificate.map((f) => (
                          <Tag
                            key={f.uid}
                            closable
                            onClose={() => removeFile(idx, "certificate", f)}
                          >
                            {f.name}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  </Col>
                )}

                {/* Custom Documents */}
                {exp?.customDocs?.map((doc, didx) => (
                  <Col span={24} key={didx}>
                    <div className="flex items-center mb-4">
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <label className="flex-none w-[200px] m-0 text-[#555] font-medium">{doc?.title}</label>
                        <Button
                          type="text"
                          icon={<DeleteOutlined />}
                          onClick={() => removeCustomDoc(idx, didx)}
                          danger
                        />
                      </div>
                      <Upload
                        multiple
                        fileList={doc?.files}
                        beforeUpload={(file) => {
                          handleFileUpload(idx, "custom", file, didx);
                          return Upload.LIST_IGNORE;
                        }}
                        onRemove={(file) =>
                          removeFile(idx, "custom", file, didx)
                        }
                        showUploadList={false}
                      >
                        <Button
                          icon={<UploadOutlined />}
                          loading={loading}
                          disabled={doc.files.length >= 1}
                        >
                          Select File
                        </Button>
                      </Upload>
                      <div className="my-4">
                        {doc.files.map((f) => (
                          <Tag
                            key={f.uid}
                            closable
                            onClose={() => removeFile(idx, "custom", f, didx)}
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
                  style={{ marginRight: 8 }}
                >
                  Add Document
                </Button>
                <Button
                  type="primary"
                  onClick={() => saveExperience(idx)}
                  disabled={!isExperienceValid(exp)}
                >
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full">
              <div className="w-full flex items-center justify-start gap-2">
                <span>{exp?.company}</span>
                <span>
                  {" "}
                  | {exp?.start} to {exp?.end}
                </span>
                <span> | {exp?.city}</span>
              </div>
              <hr />
              <div
                className="w-full"
                dangerouslySetInnerHTML={{
                  __html: getSafeDescription(exp?.description),
                }}
              />
            </div>
          )}
        </div>
      ))}

      <Button
        type="dashed"
        icon={<PlusOutlined />}
        onClick={addExperience}
        className="w-full text-center"
        disabled={editingIndex !== null}
      >
        Add More Experience
      </Button>
    </div>
  );
}
