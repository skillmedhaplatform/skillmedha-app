"use client";

import { getAllJobs, setJobStatus } from "@/redux/slices/company/jobs";
import { Button, Table, message } from "antd";
import { useRouter } from "next/navigation";
import React from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";

import "./antd.css";
import JobStyles from "./myJobsStyles.module.scss";

export default function JobsTable({
  jobs = [],
  actionText = "Stop",
  currTab = {},
  loading = false,
}) {
  const router = useRouter();
  const { value: partentColleges } = useSelector(
    (s) => s.skillmedha.partnerColleges
  );

  const dispatch = useDispatch();

  const checkJobEndDate = (job) => {
    if (!job.endDate) return { valid: false, message: "Job has no end date" };

    const endDate = new Date(job.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to compare only dates

    if (endDate < today) {
      return {
        valid: false,
        message:
          "Job end date has already passed. Please update the job dates before publishing.",
      };
    }

    return { valid: true };
  };

  const changeStatusOfJob = (jobId) => {
    const status = {
      Stop: "expired",
      RePublish: "active",
      Publish: "active",
    };

    // Check if action is RePublish or Publish
    if (actionText === "RePublish" || actionText === "Publish") {
      const job = jobs.find((e) => e._id === jobId);

      if (!job) {
        message.error("Job not found");
        return;
      }

      // Validate end date
      const dateValidation = checkJobEndDate(job);

      if (!dateValidation.valid) {
        message.warning(dateValidation.message);
        // Redirect to edit page
        router.push(`myjobs/${jobId}/createjob`);
        return;
      }
    }

    // Proceed with status change if date is valid or action is Stop
    dispatch(
      setJobStatus({
        status: status[actionText],
        jobId: jobId,
      })
    )?.then((res) => {
      if (res.payload) {
        message.success(
          `Job ${actionText.toLowerCase()}${
            actionText === "Stop" ? "ped" : "ed"
          } successfully`
        );
        dispatch(
          getAllJobs({
            page: 1,
            limit: 20,
            status: currTab?.fetchType,
          })
        );
      }
    });
  };

  const columns = [
    { title: "Job Title", dataIndex: "jobTitle" },
    { title: "colleges", dataIndex: "colleges" },
    { title: "Posted On", dataIndex: "createdAt" },
    { title: "Applicants", dataIndex: "applicants" },
    { title: "Action", dataIndex: "action" },
  ];

  const data = jobs.map((e, i) => {
    const collegesList =
      e.collegesDetails?.map((clgj, index) => {
        return (
          <span key={clgj?.orgId}>
            {clgj?.name}
            {index < e.collegesDetails.length - 1 ? ", " : ""}
          </span>
        );
      }) || [];

    // Check if end date has passed
    const endDate = new Date(e.endDate);
    const today = new Date();
    const isExpired = endDate < today;

    return {
      key: e._id,
      jobTitle: (
        <div>
          {e.jobTitle}
          {(actionText === "RePublish" || actionText === "Publish") &&
            isExpired && (
              <span
                style={{ color: "#ff4d4f", fontSize: "12px", display: "block" }}
              >
                (Expired: {endDate.toLocaleDateString()})
              </span>
            )}
        </div>
      ),
      colleges:
        collegesList?.length > 3 ? (
          <div>
            {collegesList.slice(0, 2)}
            <a
              onClick={(ev) => {
                ev.stopPropagation();
              }}
            >
              +{collegesList.length - 2} more
            </a>
          </div>
        ) : (
          collegesList
        ),
      createdAt:
        new Date(e?.createdAt)?.toDateString() || new Date().toDateString(),
      applicants: (
        <Button
          className={JobStyles.link}
          onClick={(ev) => {
            ev.stopPropagation();
            router.push(`myjobs/${e?._id}/applicants`);
          }}
        >
          View Applicants
        </Button>
      ),
      action: (
        <Button
          onClick={(f) => {
            f.stopPropagation();
            changeStatusOfJob(e?._id);
          }}
          type={actionText == "Stop" ? "dashed" : "primary"}
          danger={actionText == "Stop" && true}
        >
          {actionText}
        </Button>
      ),
    };
  });

  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      style={{ cursor: "pointer" }}
      pagination={{
        pageSize: 4,
      }}
      onRow={(record, index) => ({
        onClick: (event) => {
          router.push(`myjobs/${record.key}/createjob`);
        },
      })}
    />
  );
}
