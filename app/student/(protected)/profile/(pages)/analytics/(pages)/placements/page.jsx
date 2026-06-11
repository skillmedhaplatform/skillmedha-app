"use client";
import React from "react";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";
import { useSelector } from "react-redux";
import { Table, Tag, Empty, Typography } from "antd";

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
    // {
    //   title: "Interviewer",
    //   key: "interviewer",
    //   render: (_, record) => {
    //     if (record?.interviewDetails?.interviewer) {
    //       const interviewer = record.interviewDetails.interviewer;
    //       return (
    //         <div>
    //           <Text strong>{interviewer.name}</Text>
    //           <br />
    //           <Text type="secondary">{interviewer.designation}</Text>
    //         </div>
    //       );
    //     }
    //     return <Text type="secondary">N/A</Text>;
    //   },
    //   width: 120,
    // },
  ];

  // Clean data source - pass the original record structure
  const dataSource = appliedJobs.map((job, index) => ({
    ...job, // Keep all original data
    key: job.id || index,
  }));

  // Loading state
  if (!studentDetails) {
    return (
      
        <div className="">
          <Empty description="Loading student data..." />
        </div>
      
    );
  }

  // No applied jobs state
  if (appliedJobs.length === 0) {
    return (
      
        <div className="">
          <Empty
            description={
              <span>
                No job applications found
                <br />
                <Text type="secondary">
                  This student hasn't applied to any jobs yet.
                </Text>
              </span>
            }
          />
        </div>
      
    );
  }

  return (
    
      <div className="">
        <StudentPageHeader section="Profile · Analytics" title="Placements" />
        <div style={{ marginBottom: "1rem" }}>
          <Text strong style={{ fontSize: "18px" }}>
            Job Applications ({appliedJobs.length})
          </Text>
          <br />
          <Text type="secondary">
            Complete overview of all job applications and their current status
          </Text>
        </div>

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
          // scroll={{ x: 1200 }} // Horizontal scroll for many columns
          size="middle"
          bordered
          rowKey="key"
        />
      </div>
    
  );
};

export default Page;
