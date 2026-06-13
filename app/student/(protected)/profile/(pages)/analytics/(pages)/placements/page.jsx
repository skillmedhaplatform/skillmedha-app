"use client";
import React from "react";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";
import { useSelector } from "react-redux";
import { Table, Tag, Empty, Typography } from "antd";
import formStyles from "../../../../form.module.scss";

const { Text } = Typography;

const Page = () => {
  const studentDetails = useSelector((state) => state.student.student?.data);
  const appliedJobs = studentDetails?.appliedJobs || [];
  const studentId = studentDetails?._id;

  const columns = [
    {
      title: "S.No",
      key: "serial",
      render: (_, __, index) => index + 1,
      width: 10,
    },
    {
      title: "Company Name",
      key: "companyName",
      render: (_, record) => {
        // Extract company name from jobDetails
        const companyName = record?.jobDetails?.companyName || "N/A";
        return <Text>{companyName}</Text>;
      },
      width: 130,
    },
    {
      title: "Job Title",
      key: "jobTitle",
      render: (_, record) => {
        const jobTitle = record?.jobDetails?.jobTitle || "N/A";
        return <Text>{jobTitle}</Text>;
      },
      width: 130,
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => {
        const status = record?.status || "applied";

        const statusConfig = {
          applied: { color: "blue", text: "Applied" },
          interview_scheduled: { color: "orange", text: "Interview Scheduled" },
          interview_completed: { color: "purple", text: "Interview Completed" },
          selected: { color: "green", text: "Selected" },
          rejected: { color: "red", text: "Rejected" },
          shortlisted: { color: "cyan", text: "Shortlisted" },
          pending: { color: "gold", text: "Pending" },
          withdrawn: { color: "gray", text: "Withdrawn" },
          expired: { color: "volcano", text: "Expired" },
          assessment_pending: { color: "geekblue", text: "Assessment Pending" },
          assessment_completed: { color: "lime", text: "Assessment Completed" },
        };

        const config = statusConfig[status] || {
          color: "blue",
          text: "Applied",
        };

        return <Tag color={config.color}>{config.text}</Tag>;
      },
      width: 100,
    },
    {
      title: "Interview Date & Time",
      key: "interviewDateTime",
      render: (_, record) => {
        if (record?.interviewDetails) {
          const { date, time } = record.interviewDetails;
          return (
            <div>
              <Text strong>{date}</Text>
              <br />
              <Text type="secondary">{time}</Text>
            </div>
          );
        }
        return <Text type="secondary">N/A</Text>;
      },
      width: 100,
    },
  ];

  // Clean data source - pass the original record structure
  const dataSource = appliedJobs.map((job, index) => ({
    ...job, // Keep all original data
    key: job.id || index,
  }));

  // Loading state
  if (!studentDetails) {
    return (
      <div className={formStyles.formContainer} style={{ padding: "3rem", display: "flex", alignItems: "center", justifyItems: "center" }}>
        <Empty description="Loading student data..." />
      </div>
    );
  }

  // No applied jobs state
  if (appliedJobs.length === 0) {
    return (
      <div className={formStyles.formContainer} style={{ padding: "3rem", display: "flex", alignItems: "center", justifyItems: "center" }}>
        <Empty
          description={
            <span>
              No job applications found
              <br />
              <Text type="secondary">
                {"This student hasn't applied to any jobs yet."}
              </Text>
            </span>
          }
        />
      </div>
    );
  }

  return (
    <div className={formStyles.formContainer}>
      <div style={{ marginBottom: "1.5rem", borderBottom: "1px solid #eef5fb", width: "100%", paddingBottom: "1rem" }}>
        <h3 className={formStyles.formTitle} style={{ fontSize: "1.125rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>
          Job Applications ({appliedJobs.length})
        </h3>
        <p className={formStyles.formSubtitle} style={{ fontSize: "0.8rem", color: "#64748b", margin: 0, marginTop: "0.25rem" }}>
          Complete overview of all job applications and their current status
        </p>
      </div>

      <div style={{ width: "100%" }}>
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} applications`,
          }}
          size="middle"
          bordered
          rowKey="key"
        />
      </div>
    </div>
  );
};

export default Page;

