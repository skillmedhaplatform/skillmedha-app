"use client";
import React from 'react';
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";
import DynamicLearningPage from "@/universalUtils/DynamicLearningPage/page";

export default function CoursePage() {
  return (
    <>
      <StudentPageHeader section="Learning" title="Course" />
      <DynamicLearningPage moduleType="course" />
    </>
  );
}
