"use client";
import React from "react";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";

const page = () => {
  return (
    <>
      <StudentPageHeader section="Help" title="Help & Support" />
      <iframe
        src="https://skillmedha-profiles.s3.ap-south-1.amazonaws.com/Document+from+Vivek+Mahato.pdf"
        style={{ width: "100%", height: "100vh", border: "none" }}
        title="PDF Viewer"
      />
    </>
  );
};

export default page;
