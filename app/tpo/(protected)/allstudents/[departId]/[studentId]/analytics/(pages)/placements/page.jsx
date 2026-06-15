"use client";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Table, Tag, Typography } from "antd";
import placementStyles from "./page.module.scss";
import { useParams } from "next/navigation";
import { getAllDetails } from "@/redux/slices/tpo/getAllDetailsSlice";
import AnalyticsPage from "../../page";
const { Text } = Typography;
const Page = () => {
  const dispatch = useDispatch();
  const params = useParams();
  const studentDetails = useSelector(
    (state) => state.singleStudentDetails.singleStudent.value?.data
  );
  const appliedJobs = studentDetails?.appliedJobs || [];
  const studentId = studentDetails?._id;

  useEffect(() => {
    if (params.studentId && !studentDetails) {
      dispatch(getAllDetails(params.studentId));
    }
  }, [params.studentId, dispatch, studentDetails]);

  // const columns = [
  //   {
  //     title: "S.No",
  //     dataIndex: "serial",
  //     key: "serial",
  //     render: (_, __, index) => index + 1,
  //   },
  //   {
  //     title: "Company Name",
  //     dataIndex: "companyName",
  //     key: "companyName",
  //   },
  //   {
  //     title: "Job Title",
  //     dataIndex: "profileName",
  //     key: "profileName",
  //   },
  //   {
  //     title: "Round Name",
  //     dataIndex: "round",
  //     render: (_, record) => {
  //       const statusEntry = record.interviewStatusByApplicant?.find(
  //         (entry) => entry.studentId === studentId
  //       );

  //       if (!statusEntry || !statusEntry.interviewStatus?.length) {
  //         return <div>N/A</div>;
  //       }

  //       const lastStatusObj =
  //         statusEntry.interviewStatus[statusEntry.interviewStatus.length - 1];

  //       return <div>{lastStatusObj?.roundName || "N/A"}</div>;
  //     },
  //   },
  //   {
  //     title: "Status",
  //     key: "status",
  //     render: (_, record) => {
  //       const statusEntry = record.interviewStatusByApplicant?.find(
  //         (entry) => entry.studentId === studentId
  //       );

  //       if (!statusEntry || !statusEntry.interviewStatus?.length) {
  //         return <Tag>Applied</Tag>;
  //       }

  //       const lastStatusObj =
  //         statusEntry.interviewStatus[statusEntry.interviewStatus.length - 1];

  //       if (lastStatusObj.status === "success") {
  //         return <Tag color="green">Selected</Tag>;
  //       } else if (lastStatusObj.status === "rejected") {
  //         return <Tag color="red">Rejected</Tag>;
  //       } else {
  //         return <Tag>{lastStatusObj.status}</Tag>;
  //       }
  //     },
  //   },
  // ];

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
