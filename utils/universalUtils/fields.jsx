"use client";
import React from "react";

export const allFields = [
  "userName",
  "email",
  "phone",
  "firstName",
  "lastName",
  "department",
  "yearOfPassing",
  "collegeName",
  "professionalSummary",
  "educationDetails",
  "gender",
  "DOB",
  "alternatePhone",
  "profile",
  "addresses",
];

export const fieldDisplayNames = {
  userName: "User Name",
  email: "Email Address",
  phone: "Phone Number",
  firstName: "First Name",
  lastName: "Last Name",
  department: "Department",
  yearOfPassing: "Year of Passing",
  collegeName: "College Name",
  professionalSummary: "Professional Summary",
  educationDetails: "Education Details",
  gender: "Gender",
  DOB: "Date of Birth",
  alternatePhone: "Alternate Phone",
  profile: "Profile",
};

const RenderValue = ({ value }) => {
  if (value === null) return <span style={{ color: "gray" }}>[null]</span>;
  if (value === undefined)
    return <span style={{ color: "gray" }}>[undefined]</span>;

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return <span>{String(value)}</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return <span>[]</span>;
    return (
      <ul style={{ marginLeft: 20 }}>
        {value.map((item, idx) => (
          <li key={idx}>
            <RenderValue value={item} />
          </li>
        ))}
      </ul>
    );
  }

  if (typeof value === "object") {
    const keys = Object.keys(value);
    if (keys.length === 0) return <span>{}</span>;
    return (
      <div style={{ marginLeft: 16 }}>
        {keys.map((key) => (
          <div key={key} style={{ marginBottom: 6 }}>
            <strong>{key}:</strong> <RenderValue value={value[key]} />
          </div>
        ))}
      </div>
    );
  }

  // fallback for other types (function, symbol, etc.)
  return <span>{String(value)}</span>;
};

export const PreviewRenderer = ({ data }) => {
  if (!data || Object.keys(data).length === 0) return <p>No data to preview</p>;

  return (
    <div
      style={{
        maxHeight: 500,
        overflowY: "auto",
        padding: "16px",
        border: "1px solid #dee2e6",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
      }}
    >
      {Object.entries(data).map(([key, value]) => (
        <div
          key={key}
          style={{
            marginBottom: "16px",
            display: "flex",
            padding: "12px",
            backgroundColor: "white",
            borderRadius: "6px",
            border: "1px solid #e1e5e9",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.05)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <strong
            style={{
              color: "#495057",
              fontSize: "14px",
              minWidth: "120px",
              display: "flex",
              alignItems: "flex-start",
              paddingTop: "2px",
              fontWeight: "600",
            }}
          >
            {key}:
          </strong>
          <div
            style={{
              marginLeft: "16px",
              flex: 1,
              fontSize: "13px",
              lineHeight: "1.4",
              color: "#6c757d",
            }}
          >
            <RenderValue value={value} />
          </div>
        </div>
      ))}
    </div>
  );
};
