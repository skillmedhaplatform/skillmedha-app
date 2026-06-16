"use client";
import React, { useEffect, useState } from "react";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";
import { useSelector, useDispatch } from "react-redux";
import formStyles from "../../form.module.scss";
import { DeleteOutline } from "@mui/icons-material";
import { Button, DatePicker, message, Select, Upload } from "antd";
import { getStudentCreds, updateStudent } from "@/redux/slices/student";
import {
  fetchAllColleges,
  fetchAllUniversities,
} from "@/redux/slices/myprofile/educationDetailsSlice";
import {
  _10thSSC,
  _12th_Boards,
  _12th_Course,
  Degree_Courses,
} from "@/universalUtils/arr";
import { restUrl } from "@/config/urls";
import axios from "axios";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import { getLstorage } from "@/universalUtils/windowMW";
import dayjs from "dayjs";

export default function EducationPage() {
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header Card matching TPO */}
      <div className={formStyles.formContainer} style={{ padding: "1.5rem 2rem", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <div className={formStyles.headerLeft}>
          <h1 className={formStyles.formTitle}>Education Details</h1>
          <p className={formStyles.formSubtitle}>Update your education qualifications below</p>
        </div>
      </div>
      <div style={{ width: "100%" }}>
        <EducationForm />
      </div>
    </div>
  );
}

function EducationForm() {
  const dispatch = useDispatch();
  const allUnivercities = useSelector(
    (state) => state.educationDetails.allUnivercities
  );
  const allColleges = useSelector(
    (state) => state.educationDetails.allColleges
  );
  const studentDetails = useSelector((state) => state.student.student?.data);
  const educationList = studentDetails?.educationDetails || [];

  const EDUCATION_TYPES = [
    {
      label: "10th / Secondary Education",
      fields: [
        ["Board", "board", "text"],
        ["School", "school", "text"],
        ["Hall Ticket No", "hallticket", "text"],
        ["Start Date", "startDate", "date"],
        ["End Date", "endDate", "date"],
        ["Year Of Pass", "yearofPass", "text"],
        ["Grading System", "gradingSystem", "select"],
        ["Grade Obtained", "grade", "text"],
        ["City", "city", "text"],
      ],
      gradingData: [
        { label: "CGPA", value: "cgpa" },
        { label: "Percentage", value: "percentage" },
      ],
    },
    {
      label: "Senior Secondary / Diploma / ITI",
      fields: [
        ["Board", "board", "text"],
        ["College", "school", "text"],
        ["Stream", "stream", "text"],
        ["Hall Ticket No", "hallticket", "text"],
        ["Start Date", "startDate", "date"],
        ["End Date", "endDate", "date"],
        ["Year Of Pass", "yearofPass", "text"],
        ["Grading System", "gradingSystem", "select"],
        ["Percentage / Grade", "grade", "text"],
        ["City", "city", "text"],
      ],
      gradingData: [
        { label: "CGPA", value: "cgpa" },
        { label: "Percentage", value: "percentage" },
      ],
    },
    {
      label: "Degree",
      fields: [
        ["University", "board", "select"],
        ["College", "school", "select"],
        ["Degree", "degreeName", "text"],
        ["Department", "department", "text"],
        ["Hall Ticket No", "hallticket", "text"],
        ["Start Date", "startDate", "date"],
        ["End Date", "endDate", "date"],
        ["Year Of Pass", "yearofPass", "text"],
        ["Grading System", "gradingSystem", "select"],
        ["CGPA", "grade", "text"],
        ["City", "city", "text"],
      ],
      gradingData: [
        { label: "CGPA", value: "cgpa" },
        { label: "Percentage", value: "percentage" },
      ],
      universityData: Array.isArray(allUnivercities)
        ? allUnivercities.slice(0, 20)
        : [],
    },
    {
      label: "Masters / M.Tech",
      fields: [
        ["University", "board", "select"],
        ["Institute", "school", "select"],
        ["Program", "degreeName", "text"],
        ["Department", "department", "text"],
        ["Start Date", "startDate", "date"],
        ["End Date", "endDate", "date"],
        ["Year Of Pass", "yearofPass", "text"],
        ["Grading System", "gradingSystem", "select"],
        ["CGPA", "grade", "text"],
        ["City", "city", "text"],
      ],
      gradingData: [
        { label: "CGPA", value: "cgpa" },
        { label: "Percentage", value: "percentage" },
      ],
    },
    {
      label: "PhD",
      fields: [
        ["University", "board", "text"],
        ["Institute", "school", "text"],
        ["Research Area", "researchArea", "text"],
        ["Thesis Title", "thesisTitle", "text"],
        ["Start Date", "startDate", "date"],
        ["End Date", "endDate", "date"],
        ["Supervisor", "supervisor", "text"],
        ["Grading System", "gradingSystem", "select"],
        ["CGPA", "grade", "text"],
        ["City", "city", "text"],
      ],
      gradingData: [
        { label: "CGPA", value: "cgpa" },
        { label: "Percentage", value: "percentage" },
      ],
    },
  ];

  const SEMESTERS = Array.from({ length: 8 }, (_, i) => ({
    label: `Semester ${i + 1}`,
    value: `Semester ${i + 1}`,
  }));

  const [entries, setEntries] = useState([]);
  const [showSemesterUpload, setShowSemesterUpload] = useState(false);



  useEffect(() => {
    if (educationList.length) {
      setEntries(
        educationList.map((data) => {
          const typeObj = EDUCATION_TYPES.find((et) => et.label === data.type);
          return {
            type: typeObj || EDUCATION_TYPES[0],
            data: { ...data },
            isEditing: false,
            semesters: data.semesters || [],
            newSemester: null,
          };
        })
      );
    } else {
      setEntries([
        {
          type: EDUCATION_TYPES[0],
          data: {},
          isEditing: true,
          semesters: [],
          newSemester: null,
        },
      ]);
    }
  }, [educationList?.length]);

  const persist = (updatedEntries) => {
    setEntries(updatedEntries);
    dispatch(
      updateStudent({
        dispatch,
        aboutDetails: {
          educationDetails: updatedEntries.map((ent) => ({
            ...ent.data,
            type: ent.type.label,
            semesters: ent.semesters || [],
          })),
        },
      })
    );
  };

  const isEntryValid = (entry) =>
    entry.type.fields.every(([, field]) => {
      const val = entry.data[field];
      return val !== undefined && val !== null && val !== "";
    });

  const saveEntry = (idx) => {
    const entry = entries[idx];
    if (!isEntryValid(entry)) {
      message.error("Please fill all details before saving");
      return;
    }
    const { data } = entry;
    if (data?.yearofPass && data?.yearofPass <= data?.startDate) {
      message.error("Please fill all details accuretly before saving");
      return;
    }

    const updatedEntries = entries.map((ent, i) =>
      i === idx ? { ...ent, isEditing: false } : ent
    );

    persist(updatedEntries);
    setShowSemesterUpload(false);
  };

  const addEntry = () => {
    if (entries.length < EDUCATION_TYPES.length) {
      setEntries([
        ...entries,
        {
          type: EDUCATION_TYPES[entries.length],
          data: {},
          isEditing: true,
          semesters: [],
          newSemester: null,
        },
      ]);
    }
  };

  const updateField = (idx, key, value) => {
    setEntries((prev) =>
      prev.map((e, i) => {
        if (i === idx) {
          const updatedData = { ...e.data, [key]: value };
          // Additional validation for Degree type
          if (e.type.label === "Degree") {
            // If startDate is changed, clear endDate and yearofPass if they're invalid
            if (key === "startDate" && value) {
              const startYear = parseInt(value, 10);
              if (!isNaN(startYear)) {
                // Clear endDate if it's before the new startDate
                if (
                  updatedData.endDate &&
                  parseInt(updatedData.endDate, 10) < startYear
                ) {
                  updatedData.endDate = "";
                }
                // Clear yearofPass if it's before the new startDate
                if (
                  updatedData.yearofPass &&
                  parseInt(updatedData.yearofPass, 10) < startYear
                ) {
                  updatedData.yearofPass = "";
                }
              }
            }
          }

          return { ...e, data: updatedData };
        }
        return e;
      })
    );
  };

  const token = getLstorage("token");

  const handleFileUpload = async (idx, e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file, file.name);
      const uploadUrl = `${restUrl}/uploadtos3?bucketName=skillmedha-student-docs`;
      const res = await axios.post(uploadUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ` + token,
        },
      });

      const { file: fileUrl } = res.data;
      updateField(idx, "fileUrl", fileUrl);
      updateField(idx, "fileName", file.name);

      message.success("File uploaded successfully");
    } catch (err) {
      console.error("Upload failed", err);
      message.error("File upload failed. Please try again.");
    }
  };

  const editEntry = (idx) => {
    setEntries((prev) =>
      prev.map((ent, i) => (i === idx ? { ...ent, isEditing: true } : ent))
    );
  };

  const deleteEntry = (idx) => {
    const updated = entries.filter((_, i) => i !== idx);
    if (updated.length === 0) {
      setEntries([
        {
          type: EDUCATION_TYPES[0],
          data: {},
          isEditing: true,
          semesters: [],
          newSemester: null,
        },
      ]);
    } else {
      persist(updated);
    }
  };

  const getSelectOptions = (field, entry) => {
    if (
      entry.type.label === "10th / Secondary Education" &&
      field === "board"
    ) {
      return _10thSSC.map((item) => ({ label: item, value: item }));
    }
    if (
      entry.type.label === "Senior Secondary / Diploma / ITI" &&
      field === "board"
    ) {
      return _12th_Boards.map((item) => ({ label: item, value: item }));
    }
    if (
      entry.type.label === "Senior Secondary / Diploma / ITI" &&
      field === "stream"
    ) {
      return _12th_Course.map((item) => ({ label: item, value: item }));
    }
    if (entry.type.label === "Degree" && field === "degreeName") {
      return Degree_Courses.map((item) => ({ label: item, value: item }));
    }
    if (field === "gradingSystem") {
      return entry.type.gradingData || [];
    }
    if (field === "board") {
      return Array.isArray(allUnivercities)
        ? allUnivercities.map((u) => ({
            label: u.label,
            value: u.value,
            code: u.code,
          }))
        : [];
    }
    if (field === "school") {
      return Array.isArray(allColleges)
        ? allColleges.map((c) => ({
            label: c.college_name,
            value: c.college_name,
          }))
        : [];
    }
    return [];
  };

  const handleSelectChange = (value, option, idx, field) => {
    updateField(idx, field, value);
    if (entries[idx].type.label === "Degree" && field === "board") {
      dispatch(fetchAllColleges(option?.code));
    }
  };

  const handleDropdownVisibleChange = (open, field, entry) => {
    if (open && field === "board" && entry.type.label === "Degree") {
      dispatch(fetchAllUniversities());
    }
  };

  const removeFile = (idx) => {
    setEntries((prev) => {
      const updated = [...prev];
      updated[idx].data = {
        ...updated[idx].data,
        fileUrl: null,
        fileName: null,
      };
      return updated;
    });
  };

  const handleSemesterUpload = (idx, file) => {
    if (!entries[idx].newSemester) {
      message.warning("Please select a semester first.");
      return false;
    }

    const formData = new FormData();
    formData.append("file", file, file.name);

    return axios
      .post(
        `${restUrl}/uploadtos3?bucketName=skillmedha-student-docs`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ` + token,
          },
        }
      )
      .then((res) => {
        const fileUrl = res.data.file;
        const newSem = {
          name: entries[idx].newSemester,
          fileName: file.name,
          fileUrl,
        };
        const updatedSemesters = [...entries[idx].semesters, newSem];

        setEntries((prev) =>
          prev.map((e, i) =>
            i === idx
              ? { ...e, semesters: updatedSemesters, newSemester: null }
              : e
          )
        );
        setShowSemesterUpload(false);
        message.success("Semester uploaded!");
        return false;
      })
      .catch((err) => {
        console.error("Semester upload failed", err);
        message.error("Semester upload failed.");
        return false;
      });
  };

  const removeSemester = (idx, semIdx) => {
    const newSemesters = entries[idx].semesters.filter(
      (_, index) => index !== semIdx
    );
    setEntries((prev) =>
      prev.map((e, i) => (i === idx ? { ...e, semesters: newSemesters } : e))
    );
  };

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {entries.map((entry, i) => {
        return (
          <div key={i} style={{ width: "100%" }}>
            {entry.isEditing ? (
              <div className={formStyles.formContainer} style={{ marginBottom: "1.5rem" }}>
                <div className={formStyles.headertitleCont} style={{ borderBottom: "none", paddingBottom: "1.5rem" }}>
                  <div className={formStyles.headerLeft}>
                    <h3 className={formStyles.formTitle}>{entry.type.label}</h3>
                  </div>
                  {i === entries.length - 1 && (
                    <button
                      type="button"
                      className="border-0 outline-none bg-transparent cursor-pointer text-slate-400 hover:text-red-500 transition-colors"
                      onClick={() => deleteEntry(i)}
                    >
                      <DeleteOutline />
                    </button>
                  )}
                </div>

                <div className={formStyles.dynamicFormContainer} style={{ paddingTop: 0 }}>
                  {entry.type.fields.map(([label, field, type]) => {
                    if (
                      (entry.type.label === "10th / Secondary Education" &&
                        field === "board") ||
                      (entry.type.label ===
                        "Senior Secondary / Diploma / ITI" &&
                        (field === "board" || field === "stream")) ||
                      (entry.type.label === "Degree" &&
                        field === "degreeName")
                    ) {
                      return (
                        <div key={field} className={formStyles.formField}>
                          <label>{label}</label>
                          <Select
                            className={formStyles.selectField}
                            value={entry.data[field] || undefined}
                            onChange={(val) => updateField(i, field, val)}
                            options={getSelectOptions(field, entry)}
                            placeholder={`Select ${label.toLowerCase()}`}
                          />
                        </div>
                      );
                    }

                    if (field === "yearofPass") {
                      const currentYear = new Date().getFullYear();
                      let startYear = 1950;

                      // For Degree type, use startDate as the minimum year
                      if (
                        entry.type.label === "Degree" &&
                        entry.data.startDate
                      ) {
                        const startVal = parseInt(entry.data.startDate, 10);
                        if (!isNaN(startVal)) {
                          startYear = startVal;
                        }
                      }

                      const yearOptions = Array.from(
                        { length: currentYear - startYear + 1 },
                        (_, idx) => {
                          const y = currentYear - idx;
                          return { label: String(y), value: y };
                        }
                      );

                      return (
                        <div key={field} className={formStyles.formField}>
                          <label>{label}</label>
                          <Select
                            className={formStyles.selectField}
                            value={entry.data[field] || undefined}
                            onChange={(val) => updateField(i, field, val)}
                            options={yearOptions}
                            placeholder="Select year"
                          />
                        </div>
                      );
                    }

                    if (type === "select") {
                      return (
                        <div key={field} className={formStyles.formField}>
                          <label>{label}</label>
                          <Select
                            className={formStyles.selectField}
                            value={entry.data[field] || undefined}
                            onChange={(val, opt) =>
                              handleSelectChange(val, opt, i, field)
                            }
                            options={getSelectOptions(field, entry)}
                            onDropdownVisibleChange={(open) => {
                              getSelectOptions(field, entry);
                              handleDropdownVisibleChange(open, field, entry);
                            }}
                          />
                        </div>
                      );
                    }

                    if (type === "date") {
                      const startYear = entry?.data?.startDate
                        ? dayjs(entry?.data?.startDate)
                        : null;
                      const isEndDate = field === "endDate";

                      return (
                        <div key={field} className={formStyles.formField}>
                          <label>{label}</label>
                          <DatePicker
                            picker="year"
                            value={
                              entry.data[field]
                                ? dayjs(entry.data[field])
                                : null
                            }
                            className={formStyles.selectField}
                            onChange={(date) => {
                              const yearValue = date
                                ? date.year().toString()
                                : "";
                              updateField(i, field, yearValue);

                              // If changing startDate, clear endDate if it's less than new startDate
                              if (!isEndDate && entry.data.endDate && date) {
                                const endYear = parseInt(
                                  entry.data.endDate,
                                  10
                                );
                                if (endYear < date.year()) {
                                  updateField(i, "endDate", "");
                                }
                              }
                            }}
                            disabledDate={(current) => {
                              // For endDate, disable years before startDate
                              if (isEndDate && startYear) {
                                  return (
                                    current && current.year() < startYear.year()
                                  );
                              }
                              return false;
                            }}
                            placeholder="Select Year"
                          />
                        </div>
                      );
                    }

                    if (field === "grade") {
                      const isPercentage =
                        entry.data.gradingSystem === "percentage";
                      return (
                        <div key={field} className={formStyles.formField}>
                          <label>{label}</label>
                          <input
                            type="text"
                            maxLength={isPercentage ? 3 : 4}
                            value={entry.data[field] || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (
                                !/^(?:100(?:\.0?)?|\d{0,2}(?:\.\d?)?)$/.test(
                                  val
                                )
                              )
                                return;
                              const num = parseFloat(val);
                              if (
                                val === "" ||
                                (!isNaN(num) &&
                                  num >= 0 &&
                                  num <= (isPercentage ? 101 : 10.1))
                              ) {
                                updateField(i, field, val);
                              }
                            }}
                            className={formStyles.inputField}
                            placeholder={isPercentage ? "0–100" : "0.0–10.0"}
                          />
                        </div>
                      );
                    }

                    return (
                      <div key={field} className={formStyles.formField}>
                        <label>{label}</label>
                        <input
                          type={type}
                          value={entry.data[field] || ""}
                          onChange={(e) =>
                            updateField(i, field, e.target.value)
                          }
                          className={formStyles.inputField}
                        />
                      </div>
                    );
                  })}

                  <div className={formStyles.fullWidthField}>
                    <div className={formStyles.formField}>
                      <label>Description</label>
                      <textarea
                        className={formStyles.inputField}
                        style={{ minHeight: "80px", resize: "vertical" }}
                        rows={3}
                        value={entry.data.description || ""}
                        onChange={(e) =>
                          updateField(i, "description", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className={formStyles.fullWidthField}>
                    <div className={formStyles.formField}>
                      <label>Upload Marksheet</label>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "16px",
                          marginTop: "0.5rem"
                        }}
                      >
                        <Upload
                          multiple={false}
                          fileList={[]}
                          beforeUpload={(file) => {
                            const event = { target: { files: [file] } };
                            handleFileUpload(i, event);
                            return false;
                          }}
                          showUploadList={false}
                          accept=".pdf, image/*, .doc, .docx"
                        >
                          <Button
                            icon={<UploadOutlined />}
                            disabled={entry?.data?.fileName?.length >= 1}
                            className={formStyles.addNewBtn}
                            style={{ borderRadius: "8px", fontWeight: "600" }}
                          >
                            Select File
                          </Button>
                        </Upload>

                        {entry.data.fileName && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              background: "#eef5fb",
                              padding: "6px 12px",
                              borderRadius: "6px",
                              color: "#1e293b",
                              fontWeight: 500,
                              maxWidth: "auto",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <span style={{ flex: 1 }}>
                              {entry.data.fileName}
                            </span>
                            <DeleteOutlined
                              onClick={() => removeFile(i)}
                              style={{ color: "red", cursor: "pointer" }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {entry.type.label === "Degree" && (
                    <div className={formStyles.fullWidthField}>
                      <div className={formStyles.formField} style={{ marginTop: "1rem" }}>
                        <label>Semester Marksheets</label>

                        {/* Existing semesters list */}
                        {entry.semesters?.length > 0 && (
                          <div
                            style={{
                              marginBottom: "20px",
                              border: "1px solid #e2e8f0",
                              borderRadius: "12px",
                              padding: "15px",
                              width: "100%",
                              backgroundColor: "#f8fafc"
                            }}
                          >
                            {entry.semesters.map((sem, sIdx) => (
                              <div
                                key={sIdx}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "10px",
                                  marginBottom: "10px",
                                  padding: "8px 12px",
                                  backgroundColor: "white",
                                  border: "1px solid #e2e8f0",
                                  borderRadius: "8px",
                                }}
                              >
                                <Select
                                  value={sem.name}
                                  options={SEMESTERS}
                                  style={{ width: 180 }}
                                  disabled
                                  className={formStyles.selectField}
                                />
                                <a
                                  href={sem.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{ color: "#6BA8ED", fontWeight: "600" }}
                                >
                                  {sem.fileName}
                                </a>
                                <DeleteOutlined
                                  style={{ color: "red", cursor: "pointer", marginLeft: "auto" }}
                                  onClick={() => removeSemester(i, sIdx)}
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Semester upload fields (shown when button clicked) */}
                        {showSemesterUpload && (
                          <div
                            style={{
                              marginBottom: "20px",
                              border: "1.5px dashed #cbd5e1",
                              borderRadius: "12px",
                              padding: "20px",
                              width: "100%",
                              backgroundColor: "#f8fafc",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                gap: "12px",
                                alignItems: "center",
                                marginBottom: "15px",
                              }}
                            >
                              <Select
                                placeholder="Select Semester"
                                options={SEMESTERS.filter(
                                  (sem) =>
                                    !entry.semesters?.some(
                                      (s) => s.name === sem.value
                                    )
                                )}
                                style={{ width: 180 }}
                                value={entry.newSemester}
                                className={formStyles.selectField}
                                onChange={(val) =>
                                  setEntries((prev) =>
                                    prev.map((e, idx) =>
                                      idx === i ? { ...e, newSemester: val } : e
                                    )
                                  )
                                }
                              />
                              <Upload
                                fileList={[]}
                                showUploadList={false}
                                beforeUpload={(file) =>
                                  handleSemesterUpload(i, file)
                                }
                                accept=".pdf, image/*"
                              >
                                <Button icon={<UploadOutlined />} className={formStyles.addNewBtn} style={{ borderRadius: "8px", fontWeight: "600" }}>
                                  Upload Marksheet
                                </Button>
                              </Upload>
                            </div>
                            <Button
                              onClick={() => setShowSemesterUpload(false)}
                              danger
                              style={{ borderRadius: "8px", fontWeight: "600" }}
                            >
                              Cancel
                            </Button>
                          </div>
                        )}

                        {/* Add Semester button at the bottom */}
                        <div style={{ marginTop: "10px" }}>
                          <Button
                            type="primary"
                            onClick={() => setShowSemesterUpload(true)}
                            disabled={
                              showSemesterUpload ||
                              SEMESTERS.length === entry.semesters?.length
                            }
                            className="!bg-gradient-to-br !from-[#1E69DA] !to-[#5694F0] !border-none !text-white hover:opacity-90"
                            style={{ marginRight: "10px", fontWeight: "600", borderRadius: "8px" }}
                          >
                            Add Semester Marksheet
                          </Button>
                          {SEMESTERS.length === entry.semesters?.length && (
                            <span style={{ color: "#64748b", fontWeight: "500" }}>
                              All semesters have been added
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className={formStyles.fullWidthField} style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem", borderTop: "1px solid #e2e8f0", paddingTop: "1rem" }}>
                    <Button
                      type="primary"
                      onClick={() => saveEntry(i)}
                      className="!bg-gradient-to-br !from-[#1E69DA] !to-[#5694F0] !border-none !text-white hover:opacity-90"
                      style={{ fontWeight: "600", borderRadius: "8px", padding: "8px 24px", height: "auto" }}
                    >
                      Save Qualification
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className={formStyles.formContainer} style={{ marginBottom: "1.5rem" }}>
                <div className={formStyles.headertitleCont} style={{ borderBottom: "none", marginBottom: "1rem" }}>
                  <div className={formStyles.headerLeft}>
                    <h3 className={formStyles.formTitle} style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                      <span>{entry.type.label}</span>
                      {entry?.data?.verificationType == "approved" ? (
                        <span className="text-sm font-semibold text-green-500">Verified</span>
                      ) : entry?.data?.verificationType == "resubmission" ? (
                        <span className="text-sm font-semibold text-red-500">Re-Submit</span>
                      ) : (
                        <span className="text-sm font-semibold text-[#ffc400]">Not Verified</span>
                      )}
                    </h3>
                  </div>
                  <div className={formStyles.editButtonContainer} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <Button
                      onClick={() => editEntry(i)}
                      className="!bg-gradient-to-br !from-[#1E69DA] !to-[#5694F0] !border-none !text-white hover:opacity-90"
                      style={{ fontWeight: "600", borderRadius: "8px" }}
                    >
                      Edit
                    </Button>
                    <Button
                      danger
                      onClick={() => deleteEntry(i)}
                      style={{ borderRadius: "8px", fontWeight: "600" }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                <div className={formStyles.dynamicFormContainer} style={{ padding: 0 }}>
                  {entry.type.fields.map(([label, key]) => (
                    <div key={key} className={formStyles.formField}>
                      <label>{label}</label>
                      <div className={formStyles.inputField} style={{ background: "#eef5fb", color: "#334155", fontWeight: 500, minHeight: "42px", display: "flex", alignItems: "center", border: "none", opacity: 0.8 }}>
                        {entry.data[key] || "—"}
                      </div>
                    </div>
                  ))}

                  {entry.data.description && (
                    <div className={formStyles.fullWidthField}>
                      <div className={formStyles.formField}>
                        <label>Description</label>
                        <div className={formStyles.inputField} style={{ background: "#eef5fb", color: "#334155", fontWeight: 500, minHeight: "42px", display: "flex", alignItems: "center", border: "none", opacity: 0.8, height: "auto", padding: "10px 12px" }}>
                          {entry.data.description}
                        </div>
                      </div>
                    </div>
                  )}

                  {entry.data.fileName && (
                    <div className={formStyles.fullWidthField}>
                      <div className={formStyles.formField}>
                        <label>Marksheet</label>
                        <div className={formStyles.inputField} style={{ background: "#eef5fb", color: "#334155", fontWeight: 500, minHeight: "42px", display: "flex", alignItems: "center", border: "none", opacity: 0.8 }}>
                          <a
                            href={entry.data.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: "#6BA8ED", fontWeight: "600" }}
                          >
                            {entry.data.fileName}
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {entry.semesters && entry.semesters.length > 0 && (
                    <div className={formStyles.fullWidthField}>
                      <div className={formStyles.formField}>
                        <label>Semester Marksheets</label>
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
                          {entry.semesters.map((sem, idx) => (
                            <div key={idx} style={{ display: "flex", gap: "10px", alignItems: "center", backgroundColor: "white", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                              <strong style={{ color: "#475569" }}>{sem.name}:</strong>
                              <a
                                href={sem.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: "#6BA8ED", fontWeight: "600" }}
                              >
                                {sem.fileName}
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {entries.length < EDUCATION_TYPES.length && (
        <div style={{ width: "100%" }}>
          <Button
            onClick={addEntry}
            className={formStyles.addNewBtn}
            style={{ fontWeight: "600", borderRadius: "8px", padding: "10px 24px", height: "auto", width: "100%", marginBottom: "2rem" }}
          >
            + Add Qualification
          </Button>
        </div>
      )}
    </div>
  );
}
