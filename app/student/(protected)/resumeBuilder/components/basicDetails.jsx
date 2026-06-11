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
      <div className="grid grid-cols-2 gap-2 w-full [&_input]:p-2 [&_input]:m-2 [&_input]:rounded-[0.3rem] [&_input]:outline-none [&_input]:border [&_input]:border-solid [&_input]:border-[#ccc]">
        <div style={{ width: "100%" }}>
          {/* <ProfilePicUploader updateField={updateField} /> */}
        </div>
        {data.profile && (
          <img
            src={
              resumeData?.personalDetailsResumeBuilder?.value?.profile ||
              data?.profile
            }
            width="30%"
            style={{ marginLeft: "20%" }}
            alt="Profile"
          />
        )}

        <input
          name="firstName"
          placeholder="First Name"
          onChange={(e) => updateField("firstName", e.target.value)}
          value={data.firstName || ""}
        />
        <input
          name="lastName"
          placeholder="Last Name"
          onChange={(e) => updateField("lastName", e.target.value)}
          value={data.lastName || ""}
        />
        <input
          name="email"
          placeholder="Email"
          disabled
          onChange={(e) => updateField("email", e.target.value)}
          value={data.email || ""}
        />
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
        {/* <input
          name="dob"
          placeholder="DD/MM/YY"
          onChange={(e) => updateField("dob", e.target.value)}
          value={data.dob || ""}
        /> */}
        {/* <DatePicker
          onChange={(_, date) => updateField("dob", date)}
          style={{
            border: "none",
          }}
          value={data.dob ? dayjs(data.dob) : null}
          placeholder="Date Of Birth"
        /> */}
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
