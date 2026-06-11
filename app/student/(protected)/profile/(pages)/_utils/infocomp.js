"use client";
import React from "react";
import { useSelector } from "react-redux";
import ProfilePicUploader from "./profilePicUploader";
export default function InfoComp() {
  const studentCreds = useSelector((state) => state.student.student?.data);

  return (
    <div className="flex flex-col items-center justify-start gap-2 w-full">
      <div className="w-16 h-16 rounded-full cursor-pointer flex flex-col items-center justify-center gap-2 overflow-hidden object-fill">
        <ProfilePicUploader />
      </div>
      <p className="text-[18px] font-[800] m-0">{studentCreds?.userName}</p>
      <p className="text-[15px] font-[800] m-0" style={{ fontWeight: "500" }}>
        Skill Medha Id
      </p>
      <p className="text-[15px] font-[800] m-0">{studentCreds?.enrollementId}</p>
    </div>
  );
}
