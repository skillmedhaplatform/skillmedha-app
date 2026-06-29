"use client";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import TextEditor from "@/universalUtils/editor";

const BasicDetails = ({ data, updateField }) => {
  const resumeData = useSelector((state) => state);

  // useEffect(() => {
  //   updateField("profile", resumeData?.personalDetailsResumeBuilder?.value?.profile)
  // }, [resumeData?.personalDetailsResumeBuilder?.value?.profile])
  return (
    <div className="p-4 border border-solid border-[#ccc] bg-white flex flex-col justify-center items-center">
      <div className="w-full text-center my-3 text-2xl font-bold">Basic Details</div>
      <div className="grid grid-cols-2 gap-4 w-full p-2 [&_input]:p-2 [&_input]:rounded-[0.3rem] [&_input]:outline-none [&_input]:border [&_input]:border-solid [&_input]:border-[#ccc]">
        {data.profile && (
          <img
            src={
              resumeData?.personalDetailsResumeBuilder?.value?.profile ||
              data?.profile
            }
            className="w-[30%] ml-[20%] col-span-2 mb-2"
            alt="Profile"
          />
        )}

        <div className="flex flex-col">
          <label className="text-sm font-semibold mb-1 text-gray-700">First Name</label>
          <input
            name="firstName"
            placeholder="First Name"
            onChange={(e) => updateField("firstName", e.target.value)}
            value={data.firstName || ""}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-semibold mb-1 text-gray-700">Middle Name</label>
          <input
            name="middleName"
            placeholder="Middle Name"
            onChange={(e) => updateField("middleName", e.target.value)}
            value={data.middleName || ""}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-semibold mb-1 text-gray-700">Last Name</label>
          <input
            name="lastName"
            placeholder="Last Name"
            onChange={(e) => updateField("lastName", e.target.value)}
            value={data.lastName || ""}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-semibold mb-1 text-gray-700">Email</label>
          <input
            name="email"
            placeholder="Email"
            disabled
            onChange={(e) => updateField("email", e.target.value)}
            value={data.email || ""}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-semibold mb-1 text-gray-700">Phone Number</label>
          <input
            name="phone"
            type="text"
            placeholder="Phone Number"
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              if (val.length <= 10) {
                updateField("phone", val);
              }
            }}
            value={data.phone || ""}
          />
        </div>
      </div>
      {/* <textarea
        name="professionalSummary"
        placeholder="Professional Summary"
        onChange={(e) => updateField("professionalSummary", e.target.value)}
        value={data.professionalSummary || ""}
      /> */}

      <TextEditor
        initialContent={{ professionalSummary: data.professionalSummary } || ""}
        editorFun={(e) => updateField("professionalSummary", e)}
        name="professionalSummary"
      />
    </div>
  );
};

export default BasicDetails;
