"use client";
import React from "react";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";
import { useSelector } from "react-redux";

const page = () => {
  const studentDetails = useSelector((state) => state.student.student?.data);

  const latestEduObj = studentDetails?.educationDetails?.length
    ? studentDetails.educationDetails[
        studentDetails.educationDetails.length - 1
      ]
    : {};
  return (
    <>
      <StudentPageHeader section="Profile · Analytics" title="Academic Results" />
      <div className="bg-white border border-solid border-[#e0e0e0] rounded-xl p-5 my-4 shadow-[0_4px_10px_rgba(0,0,0,0.05)] transition-shadow duration-300 ease-in-out hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)]">
        <h2 className="m-0 mb-2 text-[1.2rem] text-[#333]">{latestEduObj?.degreeName}</h2>
        <div className="mb-2 text-[#555] text-base leading-relaxed">{latestEduObj?.department}</div>
        <div className="font-medium text-[#0070f3] mb-2 text-base leading-relaxed">
          <strong className="text-[#111]">{latestEduObj?.grade || 0}</strong> CGPA -{" "}
          <strong className="text-[#111]">{(latestEduObj?.grade * 9.5 || 0).toFixed(2)}</strong>%
        </div>

        <div className="text-[#666] text-base italic mb-2 leading-relaxed">
          {latestEduObj?.startDate} - {latestEduObj?.endDate} |{" "}
          {latestEduObj?.city}
        </div>

        <div className="text-[#444] text-base mt-2.5 mb-2 leading-relaxed">{latestEduObj?.description}</div>
      </div>
    </>
  );
};

export default page;
