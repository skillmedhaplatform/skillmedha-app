// components/StudentDownloader/StudentDownloader.jsx
"use client";
import React, { useState, useEffect } from "react";
import { Modal, Button, Checkbox, message } from "antd";
import * as XLSX from "xlsx";
import { PreviewRenderer } from "@/utils/universalUtils/fields";
import { getSstorage } from "@/utils/universalUtils/windowMW";

const StudentDownloader = ({
  isOpen,
  onClose,
  studentData = [],
  allFields = [],
  fieldDisplayNames = {},
  title = "Download Students",
  filename = "students",
}) => {
  const [selectedFields, setSelectedFields] = useState([]);

  // Reset selected fields when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedFields([]);
    }
  }, [isOpen]);

  // Enhanced Excel download function with clean formatting
  const downloadExcel = (data, filename) => {
    const wb = XLSX.utils.book_new();

    // Create worksheet with clean data
    const ws = XLSX.utils.json_to_sheet(data);

    // Auto-size columns
    const cols = [];
    Object.keys(data[0] || {}).forEach((key) => {
      const maxLength = Math.max(
        key.length, // Header length
        ...data.map((row) => String(row[key] || "").length) // Data length
      );
      cols.push({ width: Math.min(maxLength + 2, 50) }); // Cap at 50 characters
    });
    ws["!cols"] = cols;

    // Add the worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Students");

    // Write the file
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  // Helper function to format complex data for Excel
  const formatValueForExcel = (value, field) => {
    if (value === null || value === undefined) return "";

    // Handle arrays (excluding educationDetails which is handled separately)
    if (Array.isArray(value) && field !== "educationDetails") {
      if (value.length === 0) return "";

      // For other arrays, join with commas
      return value
        .map((item) => {
          if (typeof item === "object") {
            return Object.values(item).filter(Boolean).join(" - ");
          }
          return String(item);
        })
        .join(", ");
    }

    // Handle objects
    if (typeof value === "object" && !Array.isArray(value)) {
      // For addresses
      if (field === "addresses" && value.currentAddress) {
        const addr = value.currentAddress;
        return [
          addr.doorNo,
          addr.streetName,
          addr.cityName,
          addr.stateName,
          addr.pincode,
        ]
          .filter(Boolean)
          .join(", ");
      }

      // For other objects, extract key values
      const keyValues = Object.entries(value)
        .filter(([key, val]) => val !== null && val !== undefined && val !== "")
        .map(([key, val]) => `${key}: ${val}`)
        .join("; ");

      return keyValues || "";
    }

    // Handle dates
    if (field === "DOB" && value) {
      return new Date(value).toLocaleDateString();
    }

    // Return as string for other types
    return String(value);
  };

  const onFieldSelectionChange = (checkedValues) =>
    setSelectedFields(checkedValues);

  // Updated download function to handle education details as separate rows
  const handleDownload = () => {
    if (selectedFields.length === 0) {
      message.warning("Please select at least one field to download.");
      return;
    }

    const dataToDownload = [];

    studentData.forEach((student, studentIndex) => {
      // Check if educationDetails is selected and has data
      const hasEducationDetails =
        selectedFields.includes("educationDetails") &&
        student.educationDetails &&
        Array.isArray(student.educationDetails) &&
        student.educationDetails.length > 0;

      if (hasEducationDetails) {
        // Create separate rows for each education detail
        student.educationDetails.forEach((edu, eduIndex) => {
          const rowObj = {};

          // Add serial number
          rowObj["S.No"] = `${studentIndex + 1}.${eduIndex + 1}`;

          // Add student data for non-education fields ONLY for the first education record
          if (eduIndex === 0) {
            selectedFields.forEach((field) => {
              if (field !== "educationDetails") {
                const value = student[field];
                const displayName = fieldDisplayNames[field] || field;
                rowObj[displayName] = formatValueForExcel(value, field);
              }
            });
          } else {
            // For subsequent education records, add empty values for other fields
            selectedFields.forEach((field) => {
              if (field !== "educationDetails") {
                const displayName = fieldDisplayNames[field] || field;
                rowObj[displayName] = ""; // Empty string for subsequent rows
              }
            });
          }

          // Add education details as individual columns for all rows
          rowObj["Education_Type"] = edu.type || "";
          rowObj["Board / University"] = edu.board || "";
          rowObj["School / College"] = edu.school || "";
          rowObj["Stream / Branch"] =
            edu.stream || edu.degreeName || edu.department || "";
          rowObj["Grade / Percentage"] = edu.grade || "";
          rowObj["Year_of_Passing"] = edu.yearofPass || "";
          rowObj["Hall_Ticket"] = edu.hallticket || "";
          rowObj["Start_Date"] = edu.startDate || "";
          rowObj["End_Date"] = edu.endDate || "";
          rowObj["City"] = edu.city || "";

          dataToDownload.push(rowObj);
        });
      } else {
        // Create single row for student without education details breakdown
        const rowObj = {};

        // Add serial number
        rowObj["S.No"] = studentIndex + 1;

        selectedFields.forEach((field) => {
          const value = student[field];
          const displayName = fieldDisplayNames[field] || field;

          if (field === "educationDetails") {
            // If educationDetails is selected but no data, show empty education columns
            rowObj["Education_Type"] = "";
            rowObj["Board / University"] = "";
            rowObj["School / College"] = "";
            rowObj["Stream_Branch"] = "";
            rowObj["Grade / Percentage"] = "";
            rowObj["Year_of_Passing"] = "";
            rowObj["Hall_Ticket"] = "";
            rowObj["Start_Date"] = "";
            rowObj["End_Date"] = "";
            rowObj["City"] = "";
          } else {
            rowObj[displayName] = formatValueForExcel(value, field);
          }
        });

        dataToDownload.push(rowObj);
      }
    });

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    const finalFilename = `${filename}_${timestamp}`;

    // Download as Excel
    downloadExcel(dataToDownload, finalFilename);

    message.success(
      `Downloaded ${dataToDownload.length} records successfully!`
    );
    onClose();
  };

  // Updated preview data logic
  const getPreviewData = () => {
    if (!studentData || studentData.length === 0) return {};

    const student = studentData[1];
    const previewObj = {};

    selectedFields.forEach((field) => {
      if (field === "educationDetails") {
        // Show preview of education structure
        if (student.educationDetails && student.educationDetails.length > 0) {
          const edu = student.educationDetails[0]; // Show first education detail
          previewObj["Education_Type"] = edu.type || "[No Data]";
          previewObj["Board / University"] = edu.board || "[No Data]";
          previewObj["School / College"] = edu.school || "[No Data]";
          previewObj["Stream_Branch"] =
            edu.stream || edu.degreeName || edu.department || "[No Data]";
          previewObj["Grade / Percentage"] = edu.grade || "[No Data]";
          previewObj["Year_of_Passing"] = edu.yearofPass || "[No Data]";

          if (student.educationDetails.length > 1) {
            previewObj["Additional_Education_Records"] = `+${
              student.educationDetails.length - 1
            } more education records (subsequent rows will have empty student details)`;
          }
        } else {
          previewObj["Education_Type"] = "[No Data]";
          previewObj["Board / University"] = "[No Data]";
          previewObj["School / College"] = "[No Data]";
        }
      }
      if (field === "department") {
        const department = getSstorage("departmentTitle");
        previewObj[fieldDisplayNames[field] || field] =
          department || "[No Data]";
      } else {
        const value = student[field];
        previewObj[fieldDisplayNames[field] || field] =
          formatValueForExcel(value, field) || "[No Data]";
      }
    });

    return previewObj;
  };

  const previewData = getPreviewData();

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      okText="Download"
      cancelText="Close"
      centered
      maskClosable={false}
      okButtonProps={{
        disabled: selectedFields.length === 0,
        loading: false,
      }}
      cancelButtonProps={{ disabled: false }}
      width={"75%"}
      footer={
        <div>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="primary"
            onClick={handleDownload}
            disabled={selectedFields.length === 0}
            style={{ marginLeft: "1rem" }}
          >
            Download Excel
          </Button>
        </div>
      }
      title={title}
    >
      <Checkbox.Group value={selectedFields} onChange={onFieldSelectionChange}>
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          {allFields?.map((field) => (
            <Checkbox
              key={field}
              value={field}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "6px 10px",
                borderRadius: 8,
                border: "1px solid #d9d9d9",
                backgroundColor: selectedFields.includes(field)
                  ? "#e6f7ff"
                  : "white",
                fontWeight: selectedFields.includes(field) ? "600" : "400",
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              {fieldDisplayNames[field] || field}
              {field === "educationDetails" && (
                <span
                  style={{
                    fontSize: "0.8em",
                    color: "#666",
                    marginLeft: "4px",
                  }}
                >
                  (Creates multiple rows)
                </span>
              )}
            </Checkbox>
          ))}
        </div>
      </Checkbox.Group>

      <h4 style={{ marginTop: "1rem" }}>Preview (First Student):</h4>
      <PreviewRenderer data={previewData} />

      {studentData.length === 0 && (
        <p style={{ marginTop: 10, color: "red" }}>
          No student data available to preview.
        </p>
      )}

      <div
        style={{
          marginTop: "1rem",
          padding: "10px",
          backgroundColor: "#f6f8fa",
          borderRadius: "4px",
        }}
      >
        <h5>Note about Education Details:</h5>
        <p style={{ margin: 0, fontSize: "0.9em", color: "#666" }}>
          When "educationDetails" is selected, each student's education records
          (10th, 12th, Degree, etc.) will be displayed as separate rows. Only
          the first education row (e.g., 1.1) will contain the student's
          personal details. Subsequent education rows (e.g., 1.2, 1.3) will only
          show education information.
        </p>
      </div>
    </Modal>
  );
};

export default StudentDownloader;
