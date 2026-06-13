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
    if (Array.isArray(studentDetails?.projects) && studentDetails.projects.length > 0) {
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
    const updatedProjects = projects.map((p, i) => {
      if (i === idx) {
        return { ...p, editing: false, status: "pending" };
      }
      return p;
    });

    setProjects(updatedProjects);
    dispatch(
      updateStudent({
        dispatch,
        aboutDetails: { projects: updatedProjects },
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

  const getSafeContent = (value = "", maxLength = 400) => {
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
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header Card matching TPO */}
      <div className={formStyles.formContainer} style={{ padding: "1.5rem 2rem", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <div className={formStyles.headerLeft}>
          <h1 className={formStyles.formTitle}>Projects</h1>
          <p className={formStyles.formSubtitle}>Update your project details and relevant reports below</p>
        </div>
      </div>

      {projects.map((item, idx) => (
        <div key={idx} className={formStyles.formContainer} style={{ marginBottom: "1.5rem" }}>
          {/* Header */}
          <div className={formStyles.headertitleCont} style={{ borderBottom: "none", marginBottom: "1rem" }}>
            <div className={formStyles.headerLeft}>
              <h3 className={formStyles.formTitle} style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <span>{item.project || "New Project"}</span>
                {item?.verificationType === "approved" ? (
                  <span className="text-sm font-semibold text-green-500">Verified</span>
                ) : item?.verificationType === "resubmission" ? (
                  <span className="text-sm font-semibold text-red-500">Re-Submit</span>
                ) : (
                  <span className="text-sm font-semibold text-[#ffc400]">Not Verified</span>
                )}
              </h3>
            </div>
            <div className={formStyles.editButtonContainer} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {!item.editing && (
                <Button
                  onClick={() => updateField(idx, "editing", true)}
                  className="!bg-gradient-to-br !from-[#1E69DA] !to-[#5694F0] !border-none !text-white hover:opacity-90"
                  style={{ fontWeight: "600", borderRadius: "8px" }}
                >
                  Edit
                </Button>
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
                  <Button danger style={{ borderRadius: "8px", fontWeight: "600" }}>
                    Delete
                  </Button>
                </Popconfirm>
              )}
            </div>
          </div>

          {/* Form View */}
          {item.editing ? (
            <div className={formStyles.dynamicFormContainer} style={{ paddingTop: 0 }}>
              {/* Company */}
              <div className={formStyles.formField}>
                <label>Company / Organisation Name*</label>
                <input
                  type="text"
                  className={formStyles.inputField}
                  value={item.company}
                  placeholder="Company / organisation name"
                  onChange={(e) => updateField(idx, "company", e.target.value)}
                />
              </div>

              {/* Project Title */}
              <div className={formStyles.formField}>
                <label>Project Title*</label>
                <input
                  type="text"
                  className={formStyles.inputField}
                  value={item.project}
                  placeholder="Project title"
                  onChange={(e) => updateField(idx, "project", e.target.value)}
                />
              </div>

              {/* Start Date */}
              <div className={formStyles.formField}>
                <label>Start Date*</label>
                <DatePicker
                  className={formStyles.selectField}
                  picker="month"
                  format={monthFormat}
                  value={item.start ? dayjs(item.start, monthFormat) : null}
                  onChange={(date) =>
                    updateField(idx, "start", date ? date.format(monthFormat) : null)
                  }
                  disabledDate={disabledFutureMonth}
                  style={{ width: "100%" }}
                />
              </div>

              {/* End Date */}
              <div className={formStyles.formField}>
                <label>End Date*</label>
                <DatePicker
                  className={formStyles.selectField}
                  picker="month"
                  format={monthFormat}
                  value={item.end ? dayjs(item.end, monthFormat) : null}
                  onChange={(date) =>
                    updateField(idx, "end", date ? date.format(monthFormat) : null)
                  }
                  disabledDate={disabledFutureMonth}
                  style={{ width: "100%" }}
                />
              </div>

              {/* City */}
              <div className={formStyles.formField}>
                <label>City</label>
                <input
                  type="text"
                  className={formStyles.inputField}
                  value={item.city}
                  placeholder="City"
                  onChange={(e) => updateField(idx, "city", e.target.value)}
                />
              </div>

              {/* Description */}
              <div className={formStyles.fullWidthField}>
                <div className={formStyles.formField}>
                  <label>Description</label>
                  <textarea
                    className={formStyles.inputField}
                    style={{ minHeight: "100px", resize: "vertical" }}
                    value={item.description}
                    placeholder="Describe the project in detail"
                    onChange={(e) => updateField(idx, "description", e.target.value)}
                  />
                </div>
              </div>

              {/* Custom Docs */}
              {item.customDocs.map((doc, didx) => (
                <div className={formStyles.fullWidthField} key={didx}>
                  <div className={formStyles.formField}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <label style={{ marginBottom: 0 }}>{doc.title}</label>
                      <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        onClick={() => deleteCustomDoc(idx, didx)}
                        danger
                      />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "4px" }}>
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
                          className={formStyles.addNewBtn}
                          style={{ borderRadius: "8px", fontWeight: "600" }}
                        >
                          Select File
                        </Button>
                      </Upload>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {doc.files?.map((f) => (
                          <Tag
                            key={f.uid}
                            closable
                            onClose={() => removeFile(idx, f, didx)}
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
                  onClick={() => saveProject(idx)}
                  className="!bg-gradient-to-br !from-[#1E69DA] !to-[#5694F0] !border-none !text-white hover:opacity-90"
                  style={{ fontWeight: "600", borderRadius: "8px", padding: "6px 20px" }}
                >
                  Save Project
                </Button>
              </div>
            </div>
          ) : (
            <div className={formStyles.dynamicFormContainer} style={{ padding: 0 }}>
              <div className={formStyles.formField}>
                <label>Company / Organisation</label>
                <div className={formStyles.inputField} style={{ background: "#eef5fb", color: "#334155", fontWeight: 500, minHeight: "42px", display: "flex", alignItems: "center", border: "none", opacity: 0.8 }}>
                  {item.company || "—"}
                </div>
              </div>
              <div className={formStyles.formField}>
                <label>Project Title</label>
                <div className={formStyles.inputField} style={{ background: "#eef5fb", color: "#334155", fontWeight: 500, minHeight: "42px", display: "flex", alignItems: "center", border: "none", opacity: 0.8 }}>
                  {item.project || "—"}
                </div>
              </div>
              <div className={formStyles.formField}>
                <label>Duration</label>
                <div className={formStyles.inputField} style={{ background: "#eef5fb", color: "#334155", fontWeight: 500, minHeight: "42px", display: "flex", alignItems: "center", border: "none", opacity: 0.8 }}>
                  {item.start || "—"} to {item.end || "—"}
                </div>
              </div>
              <div className={formStyles.formField}>
                <label>City</label>
                <div className={formStyles.inputField} style={{ background: "#eef5fb", color: "#334155", fontWeight: 500, minHeight: "42px", display: "flex", alignItems: "center", border: "none", opacity: 0.8 }}>
                  {item.city || "—"}
                </div>
              </div>

              {item.description && (
                <div className={formStyles.fullWidthField}>
                  <div className={formStyles.formField}>
                    <label>Description</label>
                    <div className={formStyles.inputField} style={{ background: "#eef5fb", color: "#334155", fontWeight: 500, minHeight: "42px", display: "flex", alignItems: "center", border: "none", opacity: 0.8, height: "auto", padding: "10px 12px" }}>
                      <div dangerouslySetInnerHTML={{ __html: getSafeContent(item.description) }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Custom Documents attached list */}
              {item.customDocs?.some(doc => doc.files?.length > 0) && (
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
                      {item.customDocs.map((doc, i) => (
                        doc.files?.map((f, fi) => (
                          <div key={`doc-${i}-${fi}`} style={{ display: "flex", gap: "10px", alignItems: "center", backgroundColor: "white", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
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
          onClick={addProject}
          className={formStyles.addNewBtn}
          style={{ fontWeight: "600", borderRadius: "8px", padding: "10px 24px", height: "auto", width: "100%", marginBottom: "2rem" }}
        >
          + Add Project
        </Button>
      </div>
    </div>
  );
}

