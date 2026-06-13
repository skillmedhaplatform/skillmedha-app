"use client";

import React, { useState, useEffect } from "react";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";
import axios from "axios";
import formStyles from "../../form.module.scss";
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
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header Card matching TPO */}
      <div className={formStyles.formContainer} style={{ padding: "1.5rem 2rem", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <div className={formStyles.headerLeft}>
          <h1 className={formStyles.formTitle}>Work & Internships</h1>
          <p className={formStyles.formSubtitle}>Update your work experience and internship history below</p>
        </div>
      </div>

      {experiences?.map((exp, idx) => (
        <div key={idx} className={formStyles.formContainer} style={{ marginBottom: "1.5rem" }}>
          {/* Header */}
          <div className={formStyles.headertitleCont} style={{ borderBottom: "none", marginBottom: "1rem" }}>
            <div className={formStyles.headerLeft}>
              <h3 className={formStyles.formTitle} style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <span>{exp?.role || "New Experience"}</span>
                {exp?.type && <span className="text-sm font-normal text-slate-400">({exp.type})</span>}
                {exp?.verificationType == "approved" ? (
                  <span className="text-sm font-semibold text-green-500">Verified</span>
                ) : exp?.verificationType == "resubmission" ? (
                  <span className="text-sm font-semibold text-red-500">Re-Submit</span>
                ) : (
                  <span className="text-sm font-semibold text-[#ffc400]">Not Verified</span>
                )}
              </h3>
            </div>
            <div className={formStyles.editButtonContainer} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {idx !== editingIndex && (
                <Button
                  onClick={() => startEditing(idx)}
                  className="!bg-gradient-to-br !from-[#1E69DA] !to-[#5694F0] !border-none !text-white hover:opacity-90"
                  style={{ fontWeight: "600", borderRadius: "8px" }}
                >
                  Edit
                </Button>
              )}
              <Button
                danger
                onClick={() => deleteExperience(idx)}
                style={{ borderRadius: "8px", fontWeight: "600" }}
              >
                Delete
              </Button>
            </div>
          </div>

          {/* Form View */}
          {idx === editingIndex ? (
            <div className={formStyles.dynamicFormContainer} style={{ paddingTop: 0 }}>
              {/* Employer */}
              <div className={formStyles.formField}>
                <label>Employer*</label>
                <input
                  type="text"
                  className={formStyles.inputField}
                  value={exp?.company || ""}
                  placeholder="Company / organisation name"
                  onChange={(e) =>
                    updateField(idx, "company", e.target.value)
                  }
                />
              </div>

              {/* Role */}
              <div className={formStyles.formField}>
                <label>Role*</label>
                <input
                  type="text"
                  className={formStyles.inputField}
                  value={exp.role || ""}
                  placeholder="Role"
                  onChange={(e) => updateField(idx, "role", e.target.value)}
                />
              </div>

              {/* Type */}
              <div className={formStyles.formField}>
                <label>Type*</label>
                <Select
                  className={formStyles.selectField}
                  value={exp.type || undefined}
                  placeholder="--Work Type--"
                  onChange={(value) => updateField(idx, "type", value)}
                >
                  <Option value="Internship">Internship</Option>
                  <Option value="Work">Work</Option>
                </Select>
              </div>

              {/* City */}
              <div className={formStyles.formField}>
                <label>City*</label>
                <input
                  type="text"
                  className={formStyles.inputField}
                  value={exp?.city || ""}
                  placeholder="City"
                  onChange={(e) => updateField(idx, "city", e.target.value)}
                />
              </div>

              {/* Dates */}
              <div className={formStyles.formField}>
                <label>Start Date*</label>
                <DatePicker
                  className={formStyles.selectField}
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
                />
              </div>

              <div className={formStyles.formField}>
                <label>End Date*</label>
                <DatePicker
                  className={formStyles.selectField}
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
                />
              </div>

              {/* Description */}
              <div className={formStyles.fullWidthField}>
                <div className={formStyles.formField}>
                  <label>Description</label>
                  <textarea
                    className={formStyles.inputField}
                    style={{ minHeight: "100px", resize: "vertical" }}
                    value={exp.description || ""}
                    placeholder={`* Relevant Coursework: [Course 1], [Course 2]\n* GPA: [Your GPA]`}
                    onChange={(e) =>
                      updateField(idx, "description", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Work: Joining + Relieving */}
              {exp.type === "Work" && (
                <>
                  <div className={formStyles.fullWidthField}>
                    <div className={formStyles.formField}>
                      <label>Upload Joining Letter*</label>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "4px" }}>
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
                            className={formStyles.addNewBtn}
                            style={{ borderRadius: "8px", fontWeight: "600" }}
                          >
                            Select File
                          </Button>
                        </Upload>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          {exp.joiningFiles.map((f) => (
                            <Tag
                              key={f.uid}
                              closable
                              onClose={() => removeFile(idx, "joining", f)}
                              style={{ background: "#eef5fb", border: "none", padding: "4px 8px", borderRadius: "4px" }}
                            >
                              {f.name}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={formStyles.fullWidthField}>
                    <div className={formStyles.formField}>
                      <label>Upload Relieving Letter*</label>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "4px" }}>
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
                            className={formStyles.addNewBtn}
                            style={{ borderRadius: "8px", fontWeight: "600" }}
                          >
                            Select File
                          </Button>
                        </Upload>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          {exp.relievingFiles.map((f) => (
                            <Tag
                              key={f.uid}
                              closable
                              onClose={() => removeFile(idx, "relieving", f)}
                              style={{ background: "#eef5fb", border: "none", padding: "4px 8px", borderRadius: "4px" }}
                            >
                              {f.name}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Internship: Certificate */}
              {exp.type === "Internship" && (
                <div className={formStyles.fullWidthField}>
                  <div className={formStyles.formField}>
                    <label>Upload Certificate*</label>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "4px" }}>
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
                          className={formStyles.addNewBtn}
                          style={{ borderRadius: "8px", fontWeight: "600" }}
                        >
                          Select File
                        </Button>
                      </Upload>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {exp.certificate.map((f) => (
                          <Tag
                            key={f.uid}
                            closable
                            onClose={() => removeFile(idx, "certificate", f)}
                            style={{ background: "#eef5fb", border: "none", padding: "4px 8px", borderRadius: "4px" }}
                          >
                            {f.name}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Custom Documents */}
              {exp?.customDocs?.map((doc, didx) => (
                <div className={formStyles.fullWidthField} key={didx}>
                  <div className={formStyles.formField}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <label style={{ marginBottom: 0 }}>{doc?.title}</label>
                      <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        onClick={() => removeCustomDoc(idx, didx)}
                        danger
                      />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "4px" }}>
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
                          className={formStyles.addNewBtn}
                          style={{ borderRadius: "8px", fontWeight: "600" }}
                        >
                          Select File
                        </Button>
                      </Upload>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {doc.files.map((f) => (
                          <Tag
                            key={f.uid}
                            closable
                            onClose={() => removeFile(idx, "custom", f, didx)}
                            style={{ background: "#eef5fb", border: "none", padding: "4px 8px", borderRadius: "4px" }}
                          >
                            {f.name}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className={formStyles.fullWidthField} style={{ display: "flex", justifyContent: "space-between", marginTop: "1.5rem", borderTop: "1px solid #e2e8f0", paddingTop: "1rem" }}>
                <Button
                  onClick={() => addCustomDoc(idx)}
                  className={formStyles.addNewBtn}
                  style={{ borderRadius: "8px", fontWeight: "600", padding: "6px 16px" }}
                >
                  + Add Document
                </Button>
                <Button
                  type="primary"
                  onClick={() => saveExperience(idx)}
                  disabled={!isExperienceValid(exp)}
                  className="!bg-gradient-to-br !from-[#1E69DA] !to-[#5694F0] !border-none !text-white hover:opacity-90"
                  style={{ fontWeight: "600", borderRadius: "8px", padding: "6px 20px" }}
                >
                  Save Experience
                </Button>
              </div>
            </div>
          ) : (
            <div className={formStyles.dynamicFormContainer} style={{ padding: 0 }}>
              <div className={formStyles.formField}>
                <label>Employer</label>
                <div className={formStyles.inputField} style={{ background: "#eef5fb", color: "#334155", fontWeight: 500, minHeight: "42px", display: "flex", alignItems: "center", border: "none", opacity: 0.8 }}>
                  {exp?.company || "—"}
                </div>
              </div>
              <div className={formStyles.formField}>
                <label>Role</label>
                <div className={formStyles.inputField} style={{ background: "#eef5fb", color: "#334155", fontWeight: 500, minHeight: "42px", display: "flex", alignItems: "center", border: "none", opacity: 0.8 }}>
                  {exp?.role || "—"}
                </div>
              </div>
              <div className={formStyles.formField}>
                <label>Type</label>
                <div className={formStyles.inputField} style={{ background: "#eef5fb", color: "#334155", fontWeight: 500, minHeight: "42px", display: "flex", alignItems: "center", border: "none", opacity: 0.8 }}>
                  {exp?.type || "—"}
                </div>
              </div>
              <div className={formStyles.formField}>
                <label>Duration</label>
                <div className={formStyles.inputField} style={{ background: "#eef5fb", color: "#334155", fontWeight: 500, minHeight: "42px", display: "flex", alignItems: "center", border: "none", opacity: 0.8 }}>
                  {exp?.start || "—"} to {exp?.end || "—"}
                </div>
              </div>
              <div className={formStyles.formField}>
                <label>City</label>
                <div className={formStyles.inputField} style={{ background: "#eef5fb", color: "#334155", fontWeight: 500, minHeight: "42px", display: "flex", alignItems: "center", border: "none", opacity: 0.8 }}>
                  {exp?.city || "—"}
                </div>
              </div>

              {exp?.description && (
                <div className={formStyles.fullWidthField}>
                  <div className={formStyles.formField}>
                    <label>Description</label>
                    <div className={formStyles.inputField} style={{ background: "#eef5fb", color: "#334155", fontWeight: 500, minHeight: "42px", display: "flex", alignItems: "center", border: "none", opacity: 0.8, height: "auto", padding: "10px 12px" }}>
                      <div dangerouslySetInnerHTML={{ __html: getSafeDescription(exp.description) }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Document Lists in Read-only */}
              {((exp.joiningFiles && exp.joiningFiles.length > 0) || 
                (exp.relievingFiles && exp.relievingFiles.length > 0) || 
                (exp.certificate && exp.certificate.length > 0) || 
                (exp.customDocs && exp.customDocs.length > 0)) && (
                <div className={formStyles.fullWidthField}>
                  <div className={formStyles.formField}>
                    <label>Attached Documents</label>
                    <div
                      style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        padding: "15px",
                        width: "100%",
                        backgroundColor: "#f8fafc",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px"
                      }}
                    >
                      {exp.joiningFiles?.map((f, i) => (
                        <div key={`j-${i}`} style={{ display: "flex", gap: "10px", alignItems: "center", backgroundColor: "white", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                          <strong style={{ color: "#475569" }}>Joining Letter:</strong>
                          <a href={f.url} target="_blank" rel="noreferrer" style={{ color: "#6BA8ED", fontWeight: "600" }}>{f.name}</a>
                        </div>
                      ))}
                      {exp.relievingFiles?.map((f, i) => (
                        <div key={`r-${i}`} style={{ display: "flex", gap: "10px", alignItems: "center", backgroundColor: "white", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                          <strong style={{ color: "#475569" }}>Relieving Letter:</strong>
                          <a href={f.url} target="_blank" rel="noreferrer" style={{ color: "#6BA8ED", fontWeight: "600" }}>{f.name}</a>
                        </div>
                      ))}
                      {exp.certificate?.map((f, i) => (
                        <div key={`c-${i}`} style={{ display: "flex", gap: "10px", alignItems: "center", backgroundColor: "white", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                          <strong style={{ color: "#475569" }}>Certificate:</strong>
                          <a href={f.url} target="_blank" rel="noreferrer" style={{ color: "#6BA8ED", fontWeight: "600" }}>{f.name}</a>
                        </div>
                      ))}
                      {exp.customDocs?.map((doc, i) => (
                        doc.files?.map((f, fi) => (
                          <div key={`cust-${i}-${fi}`} style={{ display: "flex", gap: "10px", alignItems: "center", backgroundColor: "white", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                            <strong style={{ color: "#475569" }}>{doc.title}:</strong>
                            <a href={f.url} target="_blank" rel="noreferrer" style={{ color: "#6BA8ED", fontWeight: "600" }}>{f.name}</a>
                          </div>
                        ))
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      <div style={{ width: "100%" }}>
        <Button
          onClick={addExperience}
          className={formStyles.addNewBtn}
          style={{ fontWeight: "600", borderRadius: "8px", padding: "10px 24px", height: "auto", width: "100%", marginBottom: "2rem" }}
          disabled={editingIndex !== null}
        >
          + Add Experience
        </Button>
      </div>
    </div>
  );
}
