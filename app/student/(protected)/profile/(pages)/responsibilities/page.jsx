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

// Only customDocs now; removed joiningFiles and relievingFiles
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
    if (Array.isArray(studentDetails?.responsibilities)) {
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
    setResponsibilities((prev) => {
      const arr = [...prev];
      arr[idx].editing = false;
      arr[idx].status = "pending";
      return arr;
    });
    dispatch(
      updateStudent({
        dispatch,
        aboutDetails: { responsibilities },
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
      <StudentPageHeader section="Profile" title="Responsibilities" />
      {responsibilities.map((item, idx) => (
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
                {item.responsibility}
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

                {/* Responsibility */}
                <Col span={24}>
                  <div className="flex items-center mb-4">
                    <label className="flex-none w-[200px] m-0 text-[#555] font-medium">Responsibilities</label>
                    <Input
                      className="flex-auto bg-[#eafaf1] border-none outline-none"
                      value={item.responsibility}
                      placeholder="Describe your responsibilities"
                      onChange={(e) =>
                        updateField(idx, "responsibility", e.target.value)
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
                      disabledDate={(current) =>
                        disabledEndDate(current, item.start)
                      }
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
                      placeholder={`* Describe about Responsibilities`}
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
                      {/* Header row with title and delete button */}
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

                      {/* Upload control */}
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
                        >
                          Select File
                        </Button>
                      </Upload>

                      {/* Render uploaded files as tags */}
                      <div className="my-4">
                        {(doc.files || []).map((f) => (
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
                <Button type="primary" onClick={() => saveResponsibility(idx)}>
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
        onClick={addResponsibility}
        className="w-full text-center"
      >
        Add More Responsibilities
      </Button>
    </div>
  );
}
