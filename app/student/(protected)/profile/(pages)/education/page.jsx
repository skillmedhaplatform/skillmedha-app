"use client";
import React, { useEffect, useState } from "react";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";
import { useSelector, useDispatch } from "react-redux";
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
    <div className="flex flex-col items-start justify-start w-[99.5%] relative bg-[#f5f5f5]">
      <StudentPageHeader section="Profile" title="Education" />
      <div className="w-[98%] py-2 px-4 text-2xl font-[800] sticky top-0 bg-[#f5f5f5] z-[3] flex flex-row items-start justify-between">
        <p className="text-2xl font-[800] m-0">Education Details</p>
      </div>
      <div className="w-full py-2 px-4 flex flex-col items-start justify-start gap-4">
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
    <div className="bg-[#f5f5f5] w-full">
      {entries.map((entry, i) => {
        return (
          <div key={i} className="bg-[#f5f5f5] rounded-lg mb-8">
            {entry.isEditing ? (
              <>
                <div className="border border-solid border-[#24A058] rounded-lg py-2 px-4 shadow-sm mb-8">
                  <div className="flex flex-row items-center justify-between">
                    <h3 className="mb-4 text-xl font-semibold text-[#222] m-0">{entry.type.label}</h3>
                    {i === entries.length - 1 && (
                      <button
                        type="button"
                        className="border-0 outline-none bg-transparent cursor-pointer"
                        onClick={() => deleteEntry(i)}
                      >
                        <DeleteOutline />
                      </button>
                    )}
                  </div>

                  <div className="w-full grid grid-cols-[repeat(auto-fit,minmax(550px,1fr))] gap-4">
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
                          <div key={field} className="flex flex-row items-center justify-start gap-4 w-full [&>label]:w-[20%] [&>label]:overflow-hidden [&>label]:text-ellipsis [&>label]:whitespace-nowrap">
                            <label>{label}</label>
                            <Select
                              style={{ width: "63%" }}
                              value={entry.data[field]}
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
                          <div key={field} className="flex flex-row items-center justify-start gap-4 w-full [&>label]:w-[20%] [&>label]:overflow-hidden [&>label]:text-ellipsis [&>label]:whitespace-nowrap">
                            <label>{label}</label>
                            <Select
                              style={{ width: "63%" }}
                              value={entry.data[field]}
                              onChange={(val) => updateField(i, field, val)}
                              options={yearOptions}
                              placeholder="Select year"
                            />
                          </div>
                        );
                      }

                      if (type === "select") {
                        return (
                          <div key={field} className="flex flex-row items-center justify-start gap-4 w-full [&>label]:w-[20%] [&>label]:overflow-hidden [&>label]:text-ellipsis [&>label]:whitespace-nowrap">
                            <label>{label}</label>
                            <Select
                              style={{ width: "63%" }}
                              value={entry.data[field]}
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
                          <div key={field} className="flex flex-row items-center justify-start gap-4 w-full [&>label]:w-[20%] [&>label]:overflow-hidden [&>label]:text-ellipsis [&>label]:whitespace-nowrap">
                            <label>{label}</label>
                            <DatePicker
                              picker="year"
                              value={
                                entry.data[field]
                                  ? dayjs(entry.data[field])
                                  : null
                              }
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
                              style={{
                                width: "63%",
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
                          <div key={field} className="flex flex-row items-center justify-start gap-4 w-full [&>label]:w-[20%] [&>label]:overflow-hidden [&>label]:text-ellipsis [&>label]:whitespace-nowrap">
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
                                console.log(num);
                                if (
                                  val === "" ||
                                  (!isNaN(num) &&
                                    num >= 0 &&
                                    num <= (isPercentage ? 101 : 10.1))
                                ) {
                                  updateField(i, field, val);
                                }
                              }}
                              className="bg-gray-100 border-0 rounded-[5px] outline-none p-[0.6rem] text-[16px] w-[63%] max-w-full"
                              placeholder={isPercentage ? "0–100" : "0.0–10.0"}
                            />
                          </div>
                        );
                      }

                      return (
                        <div key={field} className="flex flex-row items-center justify-start gap-4 w-full [&>label]:w-[20%] [&>label]:overflow-hidden [&>label]:text-ellipsis [&>label]:whitespace-nowrap">
                          <label>{label}</label>
                          <input
                            type={type}
                            value={entry.data[field] || ""}
                            onChange={(e) =>
                              updateField(i, field, e.target.value)
                            }
                            className="w-[63%] border border-gray-300 bg-white outline-none p-2 rounded-[5px] text-[16px]"
                          />
                        </div>
                      );
                    })}

                    <div className="flex flex-row items-center justify-start gap-4 w-full [&>label]:w-[20%] [&>label]:overflow-hidden [&>label]:text-ellipsis [&>label]:whitespace-nowrap">
                      <label>Description</label>
                      <textarea
                        className="bg-gray-100 border-0 rounded-[5px] outline-none p-[0.6rem] text-[16px] w-[63%] max-w-full resize-none overflow-y-auto"
                        rows={3}
                        value={entry.data.description || ""}
                        onChange={(e) =>
                          updateField(i, "description", e.target.value)
                        }
                      />
                    </div>

                    <div className="flex flex-row items-center justify-start gap-4 w-full [&>label]:w-[20%] [&>label]:overflow-hidden [&>label]:text-ellipsis [&>label]:whitespace-nowrap">
                      <label>Upload Marksheet</label>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "16px",
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
                              background: "#f5f5f5",
                              padding: "6px 10px",
                              borderRadius: "6px",
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

                    {entry.type.label === "Degree" && (
                      <div className="flex flex-row items-center justify-start gap-4 w-full [&>label]:w-[20%] [&>label]:overflow-hidden [&>label]:text-ellipsis [&>label]:whitespace-nowrap">
                        <label>Semester Marksheets</label>

                        {/* Existing semesters list */}
                        {entry.semesters?.length > 0 && (
                          <div
                            style={{
                              marginBottom: "20px",
                              border: "1px solid #f0f0f0",
                              borderRadius: "6px",
                              padding: "10px",
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
                                  padding: "8px",
                                  backgroundColor: "#fafafa",
                                  borderRadius: "4px",
                                }}
                              >
                                <Select
                                  value={sem.name}
                                  options={SEMESTERS}
                                  style={{ width: 180 }}
                                  disabled
                                />
                                <a
                                  href={sem.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {sem.fileName}
                                </a>
                                <DeleteOutlined
                                  style={{ color: "red", cursor: "pointer" }}
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
                              border: "1px dashed #d9d9d9",
                              borderRadius: "6px",
                              padding: "15px",
                              backgroundColor: "#f9f9f9",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                gap: "12px",
                                alignItems: "center",
                                marginBottom: "10px",
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
                                <Button icon={<UploadOutlined />}>
                                  Upload Marksheet
                                </Button>
                              </Upload>
                            </div>
                            <Button
                              onClick={() => setShowSemesterUpload(false)}
                              danger
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
                            style={{ marginRight: "10px" }}
                          >
                            Add Semester Marksheet
                          </Button>
                          {SEMESTERS.length === entry.semesters?.length && (
                            <span style={{ color: "#888" }}>
                              All semesters have been added
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-row items-center justify-end gap-4 col-span-full mt-4">
                      <button
                        type="button"
                        className="py-[0.4rem] px-6 bg-[#1E69DA] text-white text-base font-semibold border-0 rounded cursor-pointer place-self-end"
                        onClick={() => saveEntry(i)}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>

                {i === entries.length - 1 &&
                  entries.length < EDUCATION_TYPES.length && (
                    <button
                      type="button"
                      className="border-0 py-[0.4rem] px-4 bg-[#1E69DA] text-white text-base font-semibold rounded cursor-pointer block min-w-[10%] w-[20%]"
                      onClick={addEntry}
                    >
                      Add More
                    </button>
                  )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-between gap-4 w-full">
                <div className="border border-solid border-gray-400 w-full flex flex-col items-center justify-between p-4 rounded-[10px]">
                  <div className="flex justify-between w-full mb-4">
                    <p className="text-[18px] font-[800] text-black w-full mt-[-2rem] flex gap-2 items-center m-0">
                      {entry.type.label}
                      <span>-</span>
                      {entry?.data?.verificationType == "approved" ? (
                        <div className="text-green-500">Verified</div>
                      ) : entry?.data?.verificationType == "resubmission" ? (
                        <div className="text-red-500">Re-Submit</div>
                      ) : (
                        <div className="text-[#ffc400]">Not Verified.</div>
                      )}
                    </p>
                    <div className="flex flex-row items-center justify-end w-full">
                      <button
                        type="button"
                        className="py-[0.4rem] px-6 bg-[#1E69DA] text-white text-base font-semibold border-0 rounded cursor-pointer self-start"
                        onClick={() => editEntry(i)}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                  <div className="w-full grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-4 [&>p:first-child]:col-span-full [&>p:last-child]:col-span-full">
                    {entry.type.fields.map(([label, key]) => (
                      <div key={key} className="w-full border border-solid border-transparent flex flex-row items-center justify-start gap-2">
                        <strong className="w-[40%] overflow-hidden text-ellipsis whitespace-nowrap text-[17px] font-medium">
                          {label}:
                        </strong>
                        <p className="text-[18px] font-bold w-full overflow-hidden text-ellipsis whitespace-nowrap m-0">
                          {entry.data[key]}
                        </p>
                      </div>
                    ))}
                    {entry.data.description && (
                      <p>
                        <strong>Description:</strong> {entry.data.description}
                      </p>
                    )}
                    {entry.data.fileName && (
                      <p
                        style={{
                          display: "flex",
                          gap: "2rem",
                          alignItems: "center",
                        }}
                      >
                        <strong>Marksheet:</strong>
                        <span>
                          {entry.data.fileUrl.replace(
                            "https://skillmedha-student-docs.s3.ap-south-1.amazonaws.com/",
                            ""
                          )}
                        </span>
                      </p>
                    )}
                    {entry.semesters && entry.semesters.length > 0 && (
                      <div style={{ marginTop: "1rem" }}>
                        <strong>Semester Marksheets:</strong>
                        <ul
                          style={{ paddingLeft: "1.5rem", marginTop: "0.5rem" }}
                        >
                          {entry.semesters.map((sem, idx) => (
                            <li key={idx} style={{ marginBottom: "0.5rem" }}>
                              <strong>{sem.name}:</strong>{" "}
                              <p
                                href={sem.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {sem.fileName}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-full">
                  {i === entries.length - 1 &&
                    entries.length < EDUCATION_TYPES.length && (
                      <button
                        type="button"
                        className="border-0 py-[0.4rem] px-4 bg-[#1E69DA] text-white text-base font-semibold rounded cursor-pointer block min-w-[10%] w-[20%]"
                        onClick={addEntry}
                      >
                        Add More
                      </button>
                    )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
