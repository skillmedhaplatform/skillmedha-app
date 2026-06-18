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

// Use dayjs instead of moment for month-based dates
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

const initialResponsibility = {
  company: "",
  responsibility: "",
  start: null, // store as "MM/YYYY" or null
  end: null, // store as "MM/YYYY" or null
  city: "",
  description: "",
  customDocs: [],
  status: "warning",
  editing: true,
};

export default function WorkAndResponsibilitiesPage() {
  const dispatch = useDispatch();
  const studentDetails = useSelector((state) => state.student.student?.data);
  const [responsibilities, setResponsibilities] = useState([]);

  // Initialize from studentDetails.responsibilities or default
  useEffect(() => {
    if (Array.isArray(studentDetails?.responsibilities) && studentDetails.responsibilities.length > 0) {
      setResponsibilities(
        studentDetails.responsibilities.map((item) => ({
          ...initialResponsibility,
          ...item,
          editing: false,
          status: "success",
        }))
      );
    } else {
      setResponsibilities([{ ...initialResponsibility }]);
    }
  }, [studentDetails]);

  // Disable end months before start month
  const disabledEndDate = (current, start) => {
    if (!start || !current) return false;
    const startMonth = dayjs(start, monthFormat);
    return current.isBefore(startMonth, "month");
  };

  const updateField = (idx, field, value) =>
    setResponsibilities((prev) => {
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

      setResponsibilities((prev) => {
        const arr = [...prev];
        const docs = [...arr[idx].customDocs];
        const docCopy = { ...docs[docIndex] };
        const existing = [...(docCopy.files || [])];

        docCopy.files = [
          ...existing.filter((f) => f.name !== file.name),
          { uid: file.uid, name: file.name, url: fileUrl },
        ];

        docs[docIndex] = docCopy;
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
    setResponsibilities((prev) => {
      const arr = [...prev];
      const docs = [...arr[idx].customDocs];
      const docCopy = { ...docs[docIndex] };
      docCopy.files = (docCopy.files || []).filter((f) => f.uid !== file.uid);
      docs[docIndex] = docCopy;
      arr[idx].customDocs = docs;
      return arr;
    });

  const addResponsibility = () =>
    setResponsibilities((prev) => [...prev, { ...initialResponsibility }]);

  const addCustomDoc = (idx) => {
    const title = prompt("Enter document title");
    if (!title) return;
    setResponsibilities((prev) => {
      const arr = [...prev];
      if (!arr[idx].customDocs.some((d) => d.title === title)) {
        arr[idx].editing = true;
        arr[idx].customDocs = [...arr[idx].customDocs, { title, files: [] }];
      }
      return arr;
    });
  };

  const deleteCustomDoc = (rIdx, docIndex) => {
    setResponsibilities((prev) => {
      const updated = [...prev];
      const docs = [...updated[rIdx].customDocs];
      docs.splice(docIndex, 1); // remove one doc at docIndex
      updated[rIdx].customDocs = docs;
      return updated;
    });
  };

  const saveResponsibility = (idx) => {
    const item = responsibilities[idx];
    if (!item.company || !item.responsibility || !item.start || !item.end) {
      message.error(
        "Please fill Company, Responsibilities, Start Date, and End Date before saving"
      );
      return;
    }

    const start = dayjs(item.start, monthFormat);
    const end = dayjs(item.end, monthFormat);

    if (end.isBefore(start, "month")) {
      message.error("End Date cannot be before Start Date");
      return;
    }

    const updatedResponsibilities = responsibilities.map((r, i) => {
      if (i === idx) {
        return { ...r, editing: false, status: "pending" };
      }
      return r;
    });

    setResponsibilities(updatedResponsibilities);
    dispatch(
      updateStudent({
        dispatch,
        aboutDetails: { responsibilities: updatedResponsibilities },
      })
    );
  };

  const deleteResponsibilites = (idx) => {
    setResponsibilities((prev) => {
      const updated = prev.filter((_, i) => i !== idx);

      dispatch(
        updateStudent({
          dispatch,
          aboutDetails: { responsibilities: updated },
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
          <h1 className={formStyles.formTitle}>Responsibilities</h1>
          <p className={formStyles.formSubtitle}>Update your positions of responsibility and leadership roles below</p>
        </div>
      </div>

      {responsibilities.map((item, idx) => (
        <div key={idx} className={formStyles.formContainer} style={{ marginBottom: "1.5rem" }}>
          {/* Header */}
          <div className={formStyles.headertitleCont} style={{ borderBottom: "none", marginBottom: "1rem" }}>
            <div className={formStyles.headerLeft}>
              <h3 className={formStyles.formTitle} style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <span>{item.responsibility || "New Position"}</span>
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
              {responsibilities.length > 1 && (
                <Popconfirm
                  title="Delete this Responsibility?"
                  description="This action cannot be undone."
                  okText="Delete"
                  cancelText="Cancel"
                  okButtonProps={{ danger: true }}
                  placement="left"
                  onConfirm={() => deleteResponsibilites(idx)}
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

              {/* Responsibility */}
              <div className={formStyles.formField}>
                <label>Position / Title*</label>
                <input
                  type="text"
                  className={formStyles.inputField}
                  value={item.responsibility}
                  placeholder="e.g. Student Coordinator, Club President"
                  onChange={(e) => updateField(idx, "responsibility", e.target.value)}
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
                  disabledDate={(current) => disabledEndDate(current, item.start)}
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
                    placeholder="Describe your responsibilities and achievements in detail"
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
                        accept=".pdf, image/*, .doc, .docx"
                      >
                        <Button
                          icon={<UploadOutlined />}
                          disabled={(doc.files?.length || 0) >= 1}
                          className={formStyles.addNewBtn}
                          style={{ borderRadius: "8px", fontWeight: "600" }}
                        >
                          Select File
                        </Button>
                      </Upload>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {(doc.files || []).map((f) => (
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
                  onClick={() => saveResponsibility(idx)}
                  className="!bg-gradient-to-br !from-[#1E69DA] !to-[#5694F0] !border-none !text-white hover:opacity-90"
                  style={{ fontWeight: "600", borderRadius: "8px", padding: "6px 20px" }}
                >
                  Save Position
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
                <label>Position / Title</label>
                <div className={formStyles.inputField} style={{ background: "#eef5fb", color: "#334155", fontWeight: 500, minHeight: "42px", display: "flex", alignItems: "center", border: "none", opacity: 0.8 }}>
                  {item.responsibility || "—"}
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
          onClick={addResponsibility}
          className={formStyles.addNewBtn}
          style={{ fontWeight: "600", borderRadius: "8px", padding: "10px 24px", height: "auto", width: "100%", marginBottom: "2rem" }}
        >
          + Add Position
        </Button>
      </div>
    </div>
  );
}

