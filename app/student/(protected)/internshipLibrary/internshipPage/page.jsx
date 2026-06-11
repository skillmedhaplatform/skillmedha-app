"use client";
import React from 'react';
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";
import DynamicLearningPage from "@/universalUtils/DynamicLearningPage/page";

export default function InternshipPage() {
  return (
    <>
      <StudentPageHeader section="Learning" title="Internship" />
      <DynamicLearningPage moduleType="internship" />
    </>
  );
}
