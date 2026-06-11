"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import btn from "@/public/tpo/btn.svg";
import right from "@/public/tpo/markdone.svg";
import wrong from "@/public/tpo/marknot.svg";
import education from "./skills.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "next/navigation";
import { getAllDetails } from "@/redux/slices/tpo/getAllDetailsSlice";
import { updateStudent } from "@/redux/slices/tpo/getAllStudentsSlice";
import {
  setResubmissionFlag,
  setApprovalFlag,
} from "@/redux/slices/tpo/resubmissionSlice";
import { Button } from "antd";
import { FaRegCheckCircle } from "react-icons/fa";
import { IoMdCloseCircleOutline } from "react-icons/io";
import PageHeader from "@/modules/tpo/components/PageHeader";

const Skills = () => {
  const dispatch = useDispatch();
  const { studentId } = useParams();

  // 2️⃣ Grab student and arrays
  const { value: selectedStudent } = useSelector(
    (state) => state.singleStudentDetails.singleStudent
  );

  // 1️⃣ Load student once we have an ID
  useEffect(() => {
    if (studentId && !selectedStudent?.data) {
      dispatch(getAllDetails(studentId));
    }
  }, [studentId, dispatch, selectedStudent?.data]);

  const _id = selectedStudent?.data?._id;

  const technical = Array.isArray(selectedStudent?.data?.technical)
    ? selectedStudent.data.technical
    : [];
  const languages = Array.isArray(selectedStudent?.data?.languages)
    ? selectedStudent.data.languages
    : [];
  const subjects = Array.isArray(selectedStudent?.data?.subjects)
    ? selectedStudent.data.subjects
    : [];

  // 3️⃣ Map card title → student property name
  const verifKeyMap = {
    "Technical Skills": "technicalSkillsVerificationType",
    Languages: "languagesVerificationType",
    Subjects: "subjectsVerificationType",
  };

  // 4️⃣ Shared updater
  const updateVerification = (title, status) => {
    const key = verifKeyMap[title];
    if (!studentId || !key) return;

    // Persist to backend
    dispatch(
      updateStudent({
        aboutDetails: { _id: studentId, [key]: status },
      })
    );

    // Update review flags in UI
    const section = title.toLowerCase().replace(/\s+/g, "-");
    if (status === "approved") {
      dispatch(
        setApprovalFlag({
          type: "skillsSubsLanguages",
          section,
          value: true,
        })
      );
      dispatch(
        setResubmissionFlag({
          type: "skillsSubsLanguages",
          section,
          value: false,
        })
      );
    } else {
      dispatch(
        setResubmissionFlag({
          type: "skillsSubsLanguages",
          section,
          value: true,
        })
      );
      dispatch(
        setApprovalFlag({
          type: "skillsSubsLanguages",
          section,
          value: false,
        })
      );
    }
  };

  // 5️⃣ Handlers
  const handleApprove = (title) => updateVerification(title, "approved");
  const handleResubmit = (title) => updateVerification(title, "resubmission");

  // 6️⃣ Card renderer
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
        <div className={education.about}>
          <div
            style={{
              display: "flex",
              justifyContent: "start",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <p className={education.head}>{title || "N/A"}</p>

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

          {hasItems && (
            <div className={education.mark}>
              <Button
                type="text"
                style={{ color: "#24A058" }}
                onClick={() => handleApprove(title)}
                icon={<FaRegCheckCircle />}
              >
                Mark as Verified
              </Button>
              <Button
                type="text"
                style={{ color: "red" }}
                onClick={() => handleResubmit(title)}
                icon={<IoMdCloseCircleOutline />}
              >
                Ask for Re-Submission
              </Button>
            </div>
          )}
        </div>

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
            <p className={education.buttons} style={{ color: "red" }}>
              No data found
            </p>
          )}
        </div>
      </div>
    );
  };

  // 7️⃣ Final render
  return (
    <>
      <PageHeader title="Skills & Languages" />

      <div className={education.container}>
        {(technical.length > 0 ||
          languages.length > 0 ||
          subjects.length > 0) && (
            <div className={education.btn}>
              <Image src={btn} />
            </div>
          )}

        {renderCard("Technical Skills", technical)}
        {renderCard("Languages", languages)}
        {renderCard("Subjects", subjects)}
      </div>
    </>

  );
};

export default Skills;
