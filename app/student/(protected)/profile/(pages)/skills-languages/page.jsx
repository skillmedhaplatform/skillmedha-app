"use client";
import React, { useState, useEffect } from "react";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";
import { useDispatch, useSelector } from "react-redux";
import { updateStudent } from "@/redux/slices/student";
import formStyles from "../../form.module.scss";
import { Select, Button } from "antd";

const allLangsArr = [
  "Assamese",
  "Bengali",
  "Bodo",
  "Dogri",
  "English",
  "French",
  "Gujarati",
  "Hindi",
  "Kannada",
  "Kashmiri",
  "Konkani",
  "Maithili",
  "Malayalam",
  "Manipuri",
  "Marathi",
  "Nepali",
  "Odia",
  "Punjabi",
  "Sanskrit",
  "Santali",
  "Sindhi",
  "Tamil",
  "Telugu",
  "Urdu"
];

export default function TagPanels() {
  const dispatch = useDispatch();
  const studentDetails = useSelector((state) => state.student.student?.data);

  const defaultSections = { technical: [], languages: [], subjects: [] };
  const [tags, setTags] = useState(defaultSections);
  const [modal, setModal] = useState({ open: false, section: "", value: "" });

  const verificationFieldMap = {
    technical: 'technicalSkillsVerificationType',
    languages: 'languagesVerificationType',
    subjects: 'subjectsVerificationType',
  };

  // Sync tags from store once when data arrives
  useEffect(() => {
    if (studentDetails) {
      setTags({
        technical: Array.isArray(studentDetails.technical)
          ? Array.from(new Set(studentDetails.technical))
          : [],
        languages: Array.isArray(studentDetails.languages)
          ? Array.from(new Set(studentDetails.languages))
          : [],
        subjects: Array.isArray(studentDetails.subjects)
          ? Array.from(new Set(studentDetails.subjects))
          : [],
      });
    }
  }, [studentDetails]);

  const saveTags = (newTags) => {
    // Dispatch only once per user action
    dispatch(
      updateStudent({
        dispatch,
        aboutDetails: {
          technical: newTags.technical,
          languages: newTags.languages,
          subjects: newTags.subjects,
        },
      })
    );
  };

  const openModal = (section) => setModal({ open: true, section, value: "" });
  const closeModal = () => setModal((m) => ({ ...m, open: false }));

  const addTag = () => {
    const value = modal.value.trim();
    if (!value) return closeModal();

    if (tags[modal.section].includes(value)) {
      return closeModal();
    }

    const newTags = {
      ...tags,
      [modal.section]: [...tags[modal.section], value],
    };
    setTags(newTags);
    saveTags(newTags);
    closeModal();
  };

  const removeTag = (section, tag) => {
    const newTags = {
      ...tags,
      [section]: tags[section].filter((t) => t !== tag),
    };
    setTags(newTags);
    saveTags(newTags);
  };

  const titles = { technical: "Technical Skills", languages: "Languages", subjects: "Subjects" };

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header Card matching TPO */}
      <div className={formStyles.formContainer} style={{ padding: "1.5rem 2rem", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <div className={formStyles.headerLeft}>
          <h1 className={formStyles.formTitle}>Skills & Languages</h1>
          <p className={formStyles.formSubtitle}>Update your technical skills, subjects, and languages below</p>
        </div>
      </div>

      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {Object.entries(tags).map(([key, list]) => {
          const status = studentDetails?.[verificationFieldMap[key]];
          let statusLabel = '';
          let statusClass = '';

          if (status === 'approved') {
            statusLabel = 'Verified';
            statusClass = "text-sm font-semibold text-green-500";
          } else if (status === 'resubmission') {
            statusLabel = 'Re-Submit';
            statusClass = "text-sm font-semibold text-red-500";
          } else {
            statusLabel = 'Not Verified';
            statusClass = "text-sm font-semibold text-[#ffc400]";
          }

          return (
            <div key={key} className={formStyles.formContainer}>
              <div className={formStyles.headertitleCont} style={{ borderBottom: "none", marginBottom: "1rem" }}>
                <div className={formStyles.headerLeft}>
                  <h3 className={formStyles.formTitle} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span>{titles[key]}</span>
                    <span className="text-xs font-normal text-slate-400">•</span>
                    <span className={statusClass}>{statusLabel}</span>
                  </h3>
                </div>
                {key !== "languages" && (
                  <Button
                    onClick={() => openModal(key)}
                    className={formStyles.addNewBtn}
                    style={{ fontWeight: "600", borderRadius: "8px", padding: "4px 16px" }}
                  >
                    + Add New
                  </Button>
                )}
              </div>

              <div className={formStyles.dynamicFormContainer} style={{ padding: 0, gridTemplateColumns: "1fr" }}>
                {key === "languages" ? (
                  <div className={formStyles.formField}>
                    <Select
                      mode="multiple"
                      allowClear
                      style={{ width: "100%" }}
                      className={formStyles.selectField}
                      placeholder="Select languages"
                      value={tags.languages}
                      onChange={(selected) => {
                        const newTags = { ...tags, languages: selected };
                        setTags(newTags);
                        saveTags(newTags);
                      }}
                      options={allLangsArr.map((lang) => ({ label: lang, value: lang }))}
                    />
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", width: "100%" }}>
                    {list.length === 0 ? (
                      <span className="text-slate-400 text-sm">No items added yet.</span>
                    ) : (
                      list.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            background: "#eef5fb",
                            border: "1px solid #dbeafe",
                            color: "#2563eb",
                            padding: "6px 12px",
                            borderRadius: "8px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            fontWeight: "600",
                            fontSize: "0.875rem"
                          }}
                        >
                          {tag}
                          <button
                            className="bg-transparent border-none text-[#2563eb] hover:text-red-500 font-extrabold cursor-pointer text-sm"
                            onClick={() => removeTag(key, tag)}
                            style={{ padding: 0, lineHeight: 1 }}
                          >
                            ×
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {modal.open && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl w-[320px] shadow-xl border border-slate-100 flex flex-col gap-4">
            <h3 className="text-base font-extrabold text-slate-800 m-0">
              Add {modal.section === "technical" ? "Technical Skill" : "Subject"}
            </h3>
            <input
              className={formStyles.inputField}
              value={modal.value}
              onChange={(e) => setModal((m) => ({ ...m, value: e.target.value }))}
              placeholder="Enter name"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") addTag();
              }}
            />
            <div className="flex justify-end gap-2">
              <Button
                onClick={closeModal}
                style={{ borderRadius: "8px", fontWeight: "600" }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                onClick={addTag}
                className="!bg-gradient-to-br !from-[#1E69DA] !to-[#5694F0] !border-none !text-white hover:opacity-90"
                style={{ borderRadius: "8px", fontWeight: "600" }}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
