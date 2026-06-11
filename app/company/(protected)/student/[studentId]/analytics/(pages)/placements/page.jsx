"use client";
import React from "react";
import AnalyticsPage from "../../page";
import { useSelector } from "react-redux";
import { Table, Tag } from "antd";
import placementStyles from "./page.module.scss";

const Page = () => {
  const studentDetails = useSelector(
    (state) => state.user.singleStudent?.value?.data?.student
  );
  const appliedJobs = studentDetails?.appliedJobs || [];
  const studentId = studentDetails?._id;

  const columns = [
    {
      title: "S.No",
      dataIndex: "serial",
      key: "serial",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Company Name",
      dataIndex: "companyName",
      key: "companyName",
    },
    {
      title: "Job Title",
      dataIndex: "jobTitle",
      key: "jobTitle",
    },
    {
      title: "Round Name",
      dataIndex: "round",
      render: (_, record) => {
        const statusEntry = record.interviewStatusByApplicant?.find(
          (entry) => entry.studentId === studentId
        );

        if (!statusEntry || !statusEntry.interviewStatus?.length) {
          return <div>N/A</div>;
        }

        const lastStatusObj =
          statusEntry.interviewStatus[statusEntry.interviewStatus.length - 1];

        return <div>{lastStatusObj?.roundName || "N/A"}</div>;
      },
    },
    {
      title: "Status",
      key: "applicationStatus",
      render: (_, record) => {
        const status = record?.applicationStatus || "applied";

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
    },
  ];

  const dataSource = appliedJobs.map((job, index) => ({
    ...job,
    key: index,
  }));

  return (
    <AnalyticsPage>
      <div className={placementStyles.tableWrapper}>
        <Table columns={columns} dataSource={dataSource} pagination={false} />
      </div>
    </AnalyticsPage>
  );
};

export default Page;
