"use client";
import React from "react";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";
import { useSelector } from "react-redux";
import formStyles from "../../../../form.module.scss";

const Page = () => {
  const studentDetails = useSelector((state) => state.student.student?.data);

  const latestEduObj = studentDetails?.educationDetails?.length
    ? studentDetails.educationDetails[
        studentDetails.educationDetails.length - 1
      ]
    : {};

  return (
    <div className={formStyles.formContainer}>
      <div style={{ marginBottom: "1.5rem", borderBottom: "1px solid #eef5fb", width: "100%", paddingBottom: "1rem" }}>
        <h3 className={formStyles.formTitle} style={{ fontSize: "1.125rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>
          Academic Details
        </h3>
        <p className={formStyles.formSubtitle} style={{ fontSize: "0.8rem", color: "#64748b", margin: 0, marginTop: "0.25rem" }}>
          Summary of your latest academic performance and qualification details
        </p>
      </div>

      {latestEduObj?.degreeName ? (
        <div className={formStyles.dynamicFormContainer} style={{ padding: 0 }}>
          <div className={formStyles.formField}>
            <label>Degree / Qualification</label>
            <div className={formStyles.inputField} style={{ background: "#eef5fb", color: "#334155", fontWeight: 500, minHeight: "42px", display: "flex", alignItems: "center", border: "none", opacity: 0.8 }}>
              {latestEduObj?.degreeName || "—"}
            </div>
          </div>
          <div className={formStyles.formField}>
            <label>Department / Stream</label>
            <div className={formStyles.inputField} style={{ background: "#eef5fb", color: "#334155", fontWeight: 500, minHeight: "42px", display: "flex", alignItems: "center", border: "none", opacity: 0.8 }}>
              {latestEduObj?.department || "—"}
            </div>
          </div>
          <div className={formStyles.formField}>
            <label>Grade / CGPA</label>
            <div className={formStyles.inputField} style={{ background: "#eef5fb", color: "#2563eb", fontWeight: "700", minHeight: "42px", display: "flex", alignItems: "center", border: "none", opacity: 0.8 }}>
              {latestEduObj?.grade || 0} CGPA ({(latestEduObj?.grade * 9.5 || 0).toFixed(2)}%)
            </div>
          </div>
          <div className={formStyles.formField}>
            <label>Duration & City</label>
            <div className={formStyles.inputField} style={{ background: "#eef5fb", color: "#334155", fontWeight: 500, minHeight: "42px", display: "flex", alignItems: "center", border: "none", opacity: 0.8 }}>
              {latestEduObj?.startDate} - {latestEduObj?.endDate} | {latestEduObj?.city}
            </div>
          </div>

          {latestEduObj?.description && (
            <div className={formStyles.fullWidthField}>
              <div className={formStyles.formField}>
                <label>Description</label>
                <div className={formStyles.inputField} style={{ background: "#eef5fb", color: "#334155", fontWeight: 500, minHeight: "42px", display: "flex", alignItems: "center", border: "none", opacity: 0.8, height: "auto", padding: "10px 12px" }}>
                  {latestEduObj?.description}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ width: "100%", padding: "2rem 0", textAlign: "center", color: "#64748b" }}>
          No academic details found. Please add them in the Education section.
        </div>
      )}
    </div>
  );
};

export default Page;
