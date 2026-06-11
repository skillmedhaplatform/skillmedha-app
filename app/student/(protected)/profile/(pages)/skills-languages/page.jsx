"use client";
import React, { useState, useEffect } from "react";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";
import { useDispatch, useSelector } from "react-redux";
import { updateStudent } from "@/redux/slices/student";
import { Select } from "antd";

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
]


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

  const titles = { technical: "Technical", languages: "Languages", subjects: "Subjects" };

  return (
    <div className="w-full h-full p-4">
      <StudentPageHeader section="Profile" title="Skills & Languages" />
      <div className="text-[1.4rem] font-[800] mb-4">Skills, Subjects &amp; Languages</div>
      <div className="flex flex-col gap-4">
        {Object.entries(tags).map(([key, list]) => {
          const status = studentDetails?.[verificationFieldMap[key]];
          let statusLabel = '';
          let statusClass = '';

          if (status === 'approved') {
            statusLabel = 'Verified';
            statusClass = "text-base text-green-500";
          } else if (status === 'resubmission') {
            statusLabel = 'Re-Submit';
            statusClass = "text-base text-red-500";
          } else {
            statusLabel = 'Not Verified';
            statusClass = "text-base text-[#ffc400]";
          }

          return (
        <div key={key} className="flex flex-col border border-solid border-[#24A058] rounded-lg py-3 px-4">
   <div className="flex justify-between items-center mb-3 [&>div:first-child]:font-semibold [&>div:first-child]:text-base [&>div:first-child]:text-[#24A058]">
                <div className="flex gap-2 items-center">
                  {titles[key]}
                  <span>-</span>
                  <div className={statusClass}>{statusLabel}</div>
                </div>
             {  key !== "languages" && <button className="bg-transparent border border-solid border-[#24A058] text-[#24A058] py-1 px-3 rounded cursor-pointer text-sm" onClick={() => openModal(key)}>
                  + Add new
                </button>}
              </div>
  {key === "languages" ? (
    <Select
      mode="multiple"

      allowClear
      style={{ width: "100%" }}
      placeholder="Select languages"
      value={tags.languages}
      onChange={(selected) => {
        const newTags = { ...tags, languages: selected };
        setTags(newTags);
        saveTags(newTags);
      }}
      options={allLangsArr.map((lang) => ({ label: lang, value: lang }))}
    />
  ) : (
    <>
   
      <div className="flex flex-wrap gap-2">
        {list.map((tag) => (
          <span key={tag} className="bg-[#24A058] text-white py-1 px-3 rounded flex items-center text-sm">
            {tag}
            <button
              className="bg-transparent border-none text-white ml-2 cursor-pointer"
              onClick={() => removeTag(key, tag)}
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </>
  )}
</div>

          );
        })}
      </div>

      {modal.open && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-[300px]">
            <input
              className="w-full p-2 mb-4 text-base border border-solid border-gray-300 rounded outline-none focus:border-[#24A058]"
              value={modal.value}
              onChange={(e) => setModal((m) => ({ ...m, value: e.target.value }))}
              placeholder="Enter new item"
            />
            <div className="flex justify-end gap-2">
              <button className="bg-[#1E69DA] border-none text-white py-2 px-3 rounded cursor-pointer" onClick={addTag}>
                Create
              </button>
              <button className="bg-transparent border-none text-[#555] py-2 px-3 cursor-pointer" onClick={closeModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
