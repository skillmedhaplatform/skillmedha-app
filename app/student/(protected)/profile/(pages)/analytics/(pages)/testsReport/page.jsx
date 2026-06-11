"use client";
import React from "react";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";
import { useSelector } from "react-redux";
const Page = () => {
  const studentDetails = useSelector((state) => state.student.student?.data);
  return (
    <>
      <StudentPageHeader section="Profile · Analytics" title="Tests Report" />
      <div className="p-5 text-center text-gray-500">
        No tests report available.
      </div>
    </>
  );
};

export default Page;
