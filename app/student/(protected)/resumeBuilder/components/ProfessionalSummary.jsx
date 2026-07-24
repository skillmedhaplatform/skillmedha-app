"use client";
import React from "react";
import TextEditor from "@/universalUtils/editor";

const ProfessionalSummary = ({ data, updateField }) => {
  return (
    <div className="w-full flex flex-col gap-4 mt-2">
      <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
        <TextEditor
          initialContent={{ professionalSummary: data.professionalSummary }}
          editorFun={(e) => updateField("professionalSummary", e)}
          name="professionalSummary"
        />
      </div>
    </div>
  );
};

export default ProfessionalSummary;
