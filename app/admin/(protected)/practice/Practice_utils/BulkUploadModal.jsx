"use client";
import React, { useState } from "react";
import { Modal, Button, Upload, message, Table, Alert, Tabs, Tag, Progress, Space, Steps, Result } from "antd";
import { InboxOutlined, FileExcelOutlined, CloudUploadOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import { useDispatch } from "react-redux";
import { bulkUploadPracQuestions, fetchQuestions } from "@/redux/slices/admin/cms/practiceSlice";
import styles from "./bulkupload.module.scss";

const { Dragger } = Upload;

const QUESTION_TYPES = {
  TEXT: "Text",
  SINGLE_CHOICE: "Single Choice",
  MULTIPLE_CHOICE: "Multiple Choice",
  TRUE_FALSE: "True/False",
  CODING: "Coding Question"
};

const TEMPLATES = [
  // { name: "All Types (Combined)", file: "all_questions_template.xlsx", desc: "Contains examples of all question types" },
  // { name: "Text Questions", file: "text_questions_template.xlsx", desc: "For open-ended questions" },
  { name: "Single Choice", file: "single_choice_template.xlsx", desc: "For radio button questions" },
  { name: "Multiple Choice", file: "multiple_choice_template.xlsx", desc: "For checkbox questions" },
  { name: "True/False", file: "true_false_template.xlsx", desc: "For boolean questions" },
  { name: "Coding Questions", file: "coding_questions_template.xlsx", desc: "For programming challenges with test cases" },
];

export default function BulkUploadModal({ open, onCancel, subjectId, topicId, subTopicId, allowedType, excludedTypes = [] }) {
  const dispatch = useDispatch();

  const [currentStep, setCurrentStep] = useState(0);
  const [fileList, setFileList] = useState([]);
  const [parsedData, setParsedData] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const resetState = () => {
    setCurrentStep(0);
    setFileList([]);
    setParsedData([]);
    setValidationErrors([]);
    setUploadResult(null);
    setUploading(false);
  };

  const handleCancel = () => {
    resetState();
    onCancel();
  };

  const downloadTemplate = (fileName) => {
    const link = document.createElement("a");
    link.href = `/templates/${fileName}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const validateRow = (row, index) => {
    const errors = [];
    const rowNum = index + 1;

    if (!row["Question Type"]) errors.push(`Row ${rowNum}: Missing 'Question Type'`);
    if (!row["Question Text"]) errors.push(`Row ${rowNum}: Missing 'Question Text'`);
    if (!row["Explanation"]) errors.push(`Row ${rowNum}: Missing 'Explanation'`);
    if (!row["Score Points"] || isNaN(row["Score Points"]) || row["Score Points"] <= 0) {
      errors.push(`Row ${rowNum}: Invalid 'Score Points'`);
    }

    const type = row["Question Type"];

    if (allowedType && type !== allowedType) {
      errors.push(`Row ${rowNum}: Invalid Question Type. Expected '${allowedType}', found '${type}'`);
    }

    if (excludedTypes.length > 0 && excludedTypes.includes(type)) {
      errors.push(`Row ${rowNum}: Question Type '${type}' is not allowed in this section.`);
    }
    
    if (type === QUESTION_TYPES.SINGLE_CHOICE || type === QUESTION_TYPES.MULTIPLE_CHOICE) {
      const options = [row["Option 1"], row["Option 2"], row["Option 3"], row["Option 4"]].filter(o => o);
      if (options.length < 2) errors.push(`Row ${rowNum}: At least 2 options required for ${type}`);
      
      if (type === QUESTION_TYPES.SINGLE_CHOICE) {
        if (!row["Correct Answer"]) errors.push(`Row ${rowNum}: Missing Correct Answer`);
      } else {
        if (!row["Correct Answer/Answers"] && !row["Correct Answers"]) errors.push(`Row ${rowNum}: Missing Correct Answers`);
      }
    }

    if (type === QUESTION_TYPES.CODING) {
      if (!row["Test Cases JSON"]) {
        errors.push(`Row ${rowNum}: Missing Test Cases JSON`);
      } else {
        try {
          const tc = JSON.parse(row["Test Cases JSON"]);
          if (!Array.isArray(tc) || tc.length === 0) {
            errors.push(`Row ${rowNum}: Test cases must be a non-empty array`);
          }
        } catch (e) {
          errors.push(`Row ${rowNum}: Invalid JSON in Test Cases`);
        }
      }
    }

    return errors;
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          message.error("File is empty");
          return;
        }

        const allErrors = [];
        jsonData.forEach((row, index) => {
          const rowErrors = validateRow(row, index);
          if (rowErrors.length > 0) allErrors.push(...rowErrors);
        });

        setParsedData(jsonData);
        setValidationErrors(allErrors);
        setCurrentStep(1);
      } catch (error) {
        console.error(error);
        message.error("Failed to parse file. Please ensure it's a valid Excel/CSV file.");
      }
    };
    reader.readAsArrayBuffer(file);
    return false; // Prevent auto upload
  };

  const handleUpload = async () => {
    if (validationErrors.length > 0) {
      message.error("Please fix validation errors before uploading");
      return;
    }

    setUploading(true);
    
    // Convert parsed data to payload format expected by backend
    // Or send the raw file if backend handles parsing (based on your request, backend handles it?)
    // Actually, in the redux slice we implemented bulkUploadPracQuestions which takes FormData content
    // But since we parsed it client-side to validate, we can either send the file or the JSON.
    // The previous prompt implementation suggests the backend endpoint accepts a file.
    // So let's send the original file.
    
    const formData = new FormData();
    formData.append("file", fileList[0]);
    // Note: IDs are now sent via query params, not body data
    
    const params = {
      subjectId,
      isTest:true
    };
    if (topicId) params.topicId = topicId;
    if (subTopicId) params.subTopicId = subTopicId;

    try {
      const result = await dispatch(bulkUploadPracQuestions({ formData, params })).unwrap();
      setUploadResult(result);
      setCurrentStep(2);
      dispatch(fetchQuestions({ subjectId }));
      message.success("Bulk upload completed!");
    } catch (error) {
      message.error(error.message || "Upload failed");
      setUploadResult({ success: false, error: error.message });
      setCurrentStep(2);
    } finally {
      setUploading(false);
    }
  };

  const getFilteredTemplates = () => {
    // If specific type is restricted, only show relevant templates
    if (allowedType === QUESTION_TYPES.CODING) {
      return TEMPLATES.filter(t => t.name.includes("Coding"));
    }

    let filtered = TEMPLATES;
    
    // Filter by allowedType if it's generic filtering
    if (allowedType) {
       filtered = filtered.filter(t => t.name.toLowerCase().includes(allowedType.toLowerCase().split(' ')[0]));
    }

    // Filter by excludedTypes
    if (excludedTypes.length > 0) {
      if (excludedTypes.includes(QUESTION_TYPES.CODING)) {
        filtered = filtered.filter(t => !t.name.includes("Coding"));
      }
      // Add other exclusions if needed
    }

    return filtered;
  };

  const renderStep0 = () => (
    <div>
      <div className={styles.templateSection}>
        <h4 style={{ marginBottom: 12 }}>1. Download Template</h4>
        <p style={{ marginBottom: 16, color: "#666" }}>
          Choose a template based on the questions you want to add.
          {allowedType && <strong> Only '{allowedType}' questions are allowed here.</strong>}
        </p>
        <Space wrap>
          {getFilteredTemplates().map((t) => (
            <Button 
              key={t.file} 
              icon={<FileExcelOutlined />} 
              onClick={() => downloadTemplate(t.file)}
              size="small"
            >
              {t.name}
            </Button>
          ))}
        </Space>
      </div>

      <h4 style={{ marginBottom: 12 }}>2. Upload Filled File</h4>
      <Dragger
        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        beforeUpload={(file) => {
          setFileList([file]);
          handleFileUpload(file);
          return false;
        }}
        showUploadList={false}
        className={styles.uploadArea}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag file to this area to upload</p>
        <p className="ant-upload-hint">
          Support for .xlsx and .csv files. Please use the templates provided above.
          {allowedType && <div>Note: Ensure all questions in the file are of type <strong>{allowedType}</strong>.</div>}
          {excludedTypes.length > 0 && <div>Note: <strong>{excludedTypes.join(", ")}</strong> types are not allowed here.</div>}
        </p>
      </Dragger>
    </div>
  );

  const renderStep1 = () => (
    <div>
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>Found <strong>{parsedData.length}</strong> questions</span>
        <Space>
          <Button onClick={() => setCurrentStep(0)}>Back</Button>
          <Button 
            type="primary" 
            onClick={handleUpload} 
            disabled={validationErrors.length > 0}
            loading={uploading}
            icon={<CloudUploadOutlined />}
          >
            Upload {parsedData.length} Questions
          </Button>
        </Space>
      </div>

      {validationErrors.length > 0 ? (
        <Alert
          message={`Found ${validationErrors.length} Validation Errors`}
          description={
            <ul style={{ paddingLeft: 20, maxHeight: 100, overflowY: "auto" }}>
              {validationErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          }
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      ) : (
        <Alert
          message="Validation Successful"
          description="All questions look good! Ready to upload."
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <div className={styles.bulkUploadPreview}>
        <Table 
          dataSource={parsedData.slice(0, 100)} 
          rowKey={(r, i) => i}
          pagination={false}
          size="small"
          scroll={{ x: 1000 }}
          columns={[
            { title: "#", render: (t, r, i) => i + 1, width: 50 },
            { title: "Type", dataIndex: "Question Type", width: 120 },
            { title: "Question", dataIndex: "Question Text", width: 300, ellipsis: true },
            { title: "Points", dataIndex: "Score Points", width: 80 },
            { title: "Explanation", dataIndex: "Explanation", ellipsis: true },
          ]}
        />
        {parsedData.length > 100 && (
          <div style={{ textAlign: "center", padding: 8, color: "#999" }}>
            And {parsedData.length - 100} more...
          </div>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => {
    // This depends on what your backend returns. 
    // Assuming backend returns { success: true, count: N, errors: [] } or similar
    const successCount = uploadResult?.insertedCount || uploadResult?.data?.insertedCount || 0;
    const hasError = !!uploadResult?.error || (uploadResult?.success === false);
    
    // Since we don't know exact backend response structure from user prompt "createQuestion existing reference",
    // We'll create a generic success/result view
    
    return (
      <Result
        status={hasError ? "error" : "success"}
        title={hasError ? "Upload Failed" : "Batch Upload Successful!"}
        subTitle={
          hasError 
            ? (uploadResult?.error || "Something went wrong")
            : `Successfully processed file. ${successCount > 0 ? `Created ${successCount} questions.` : "Check logs for details."}`
        }
        extra={[
          <Button type="primary" key="console" onClick={handleCancel}>
            Close
          </Button>,
          <Button key="buy" onClick={resetState}>
            Upload Another File
          </Button>,
        ]}
      />
    );
  };

  return (
    <Modal
      title="Bulk Upload Questions"
      open={open}
      onCancel={handleCancel}
      width={900}
      footer={null}
      destroyOnHidden
    >
      <Steps
        current={currentStep}
        items={[
          { title: 'Select File' },
          { title: 'Preview & Validate' },
          { title: 'Upload Result' },
        ]}
        style={{ marginBottom: 24 }}
      />
      
      {currentStep === 0 && renderStep0()}
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
    </Modal>
  );
}
