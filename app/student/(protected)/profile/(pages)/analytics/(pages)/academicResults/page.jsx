"use client";
import React from "react";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";
import { useSelector } from "react-redux";
import formStyles from "../../../../form.module.scss";

const Page = () => {
  const studentDetails = useSelector((state) => state.student.student?.data);

  // Filter out any entries that don't have at least a school, board, or degree name
  const validEducations = (studentDetails?.educationDetails || []).filter(
    edu => edu?.school || edu?.board || edu?.degreeName
  );

  const latestEduObj = validEducations.length
    ? validEducations[validEducations.length - 1]
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

      {Object.keys(latestEduObj).length > 0 ? (
        <div className={formStyles.dynamicFormContainer} style={{ padding: 0 }}>
          <div className={formStyles.formField}>
            <label>Degree / Qualification</label>
            <div className={formStyles.inputField} style={{ background: "#eef5fb", color: "#334155", fontWeight: 500, minHeight: "42px", display: "flex", alignItems: "center", border: "none", opacity: 0.8 }}>
              {latestEduObj?.degreeName || latestEduObj?.type || "—"}
            </div>
          </div>
          <div className={formStyles.formField}>
            <label>Institution / Board</label>
            <div className={formStyles.inputField} style={{ background: "#eef5fb", color: "#334155", fontWeight: 500, minHeight: "42px", display: "flex", alignItems: "center", border: "none", opacity: 0.8 }}>
              {latestEduObj?.school || latestEduObj?.board || "—"}
            </div>
          </div>
          <div className={formStyles.formField}>
            <label>Department / Stream</label>
            <div className={formStyles.inputField} style={{ background: "#eef5fb", color: "#334155", fontWeight: 500, minHeight: "42px", display: "flex", alignItems: "center", border: "none", opacity: 0.8 }}>
              {latestEduObj?.department || latestEduObj?.stream || latestEduObj?.board || "—"}
            </div>
          </div>
          <div className={formStyles.formField}>
            <label>Grade / CGPA</label>
            <div className={formStyles.inputField} style={{ background: "#eef5fb", color: "#2563eb", fontWeight: "700", minHeight: "42px", display: "flex", alignItems: "center", border: "none", opacity: 0.8 }}>
              {latestEduObj?.grade || 0} {latestEduObj?.gradingSystem === 'percentage' ? '%' : 'CGPA'} 
              {latestEduObj?.gradingSystem !== 'percentage' && ` (${(parseFloat(latestEduObj?.grade || 0) * 9.5).toFixed(2)}%)`}
            </div>
          </div>
          <div className={formStyles.formField}>
            <label>Duration & City</label>
            <div className={formStyles.inputField} style={{ background: "#eef5fb", color: "#334155", fontWeight: 500, minHeight: "42px", display: "flex", alignItems: "center", border: "none", opacity: 0.8 }}>
              {latestEduObj?.startDate || "—"} - {latestEduObj?.endDate || "—"} | {latestEduObj?.city || "—"}
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
