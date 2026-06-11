"use client";
import React from "react";
import StudentData from "../page";
import education from "./skills.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "next/navigation";
import { Empty } from "antd";

const Skills = () => {
  const dispatch = useDispatch();
  const { studentId } = useParams();

  const selectedStudent = useSelector(
    (state) => state.user.singleStudent?.value?.data?.student
  );

  const technical = Array.isArray(selectedStudent?.technical)
    ? selectedStudent.technical
    : [];
  const languages = Array.isArray(selectedStudent?.languages)
    ? selectedStudent.languages
    : [];
  const subjects = Array.isArray(selectedStudent?.subjects)
    ? selectedStudent.subjects
    : [];

  // Map card title → student property name
  const verifKeyMap = {
    "Technical Skills": "technicalSkillsVerificationType",
    Languages: "languagesVerificationType",
    Subjects: "subjectsVerificationType",
  };

  // Card renderer
  const renderCard = (title, items) => {
    const hasItems = items.length > 0;

    return (
      <div
        key={title}
        style={{
          border: "1px solid #ccc",
          borderRadius: "10px",
          padding: "1.7rem",
          marginTop: "1rem",
          boxShadow: "1px 4px 8px rgba(0,0,0,0.1)",
        }}
      >
        {/* Header */}
        <div className={education.about}>
          <div
            style={{
              display: "flex",
              justifyContent: "start",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <p style={{ fontWeight: "800", fontSize: "18px" }}>
              {title || "N/A"}
            </p>

            {hasItems && (
              <p
                style={{
                  color:
                    selectedStudent?.data?.[verifKeyMap[title]] === "approved"
                      ? "green"
                      : selectedStudent?.data?.[verifKeyMap[title]] ===
                        "resubmission"
                      ? "orange"
                      : "gray",
                  fontWeight: "bold",
                }}
              >
                {selectedStudent?.data?.[verifKeyMap[title]] === "approved"
                  ? "Verified"
                  : selectedStudent?.data?.[verifKeyMap[title]] ===
                    "resubmission"
                  ? "Asked for Resubmission"
                  : "Pending"}
              </p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className={education.aboutsidedata}>
          {hasItems ? (
            items.map((item, i) => (
              <div key={i}>
                <p className={education.buttons}>
                  {typeof item === "string"
                    ? item
                    : item?.name || item?.title || JSON.stringify(item)}
                </p>
              </div>
            ))
          ) : (
            <Empty description="No data found" />
          )}
        </div>
      </div>
    );
  };

  // Final render
  return (
    <StudentData>
      <div className={education.container}>
        {renderCard("Technical Skills", technical)}
        {renderCard("Languages", languages)}
        {renderCard("Subjects", subjects)}
      </div>
    </StudentData>
  );
};

export default Skills;
