"use client";

import { getAllJobs, setJobStatus } from "@/redux/slices/company/jobs";
import { Button, Table, message, Pagination, Empty } from "antd";
import { useRouter } from "next/navigation";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  HiOutlineBriefcase,
  HiOutlineAcademicCap,
  HiOutlineCalendar,
  HiOutlineEye,
  HiStop,
  HiOutlinePlayCircle,
  HiOutlineCommandLine,
  HiOutlineChartBar,
} from "react-icons/hi2";

import "./antd.css";
import JobStyles from "./myJobsStyles.module.scss";

const getJobIconAndBg = (jobTitle = "") => {
  const titleLower = jobTitle.toLowerCase();
  if (
    titleLower.includes("developer") ||
    titleLower.includes("code") ||
    titleLower.includes("software") ||
    titleLower.includes("programmer") ||
    titleLower.includes("tech")
  ) {
    return {
      icon: <HiOutlineCommandLine size={20} />,
      bgColor: "#EFF6FF",
      color: "#6BA8ED",
    };
  } else if (
    titleLower.includes("analyst") ||
    titleLower.includes("data") ||
    titleLower.includes("finance") ||
    titleLower.includes("business") ||
    titleLower.includes("market")
  ) {
    return {
      icon: <HiOutlineChartBar size={20} />,
      bgColor: "#F5F3FF",
      color: "#8B5CF6",
    };
  } else if (
    titleLower.includes("design") ||
    titleLower.includes("ui") ||
    titleLower.includes("ux") ||
    titleLower.includes("creative")
  ) {
    return {
      icon: <HiOutlineBriefcase size={20} />,
      bgColor: "#FDF2F8",
      color: "#EC4899",
    };
  }
  return {
    icon: <HiOutlineBriefcase size={20} />,
    bgColor: "#ECFDF5",
    color: "#10B981",
  };
};

export default function JobsTable({
  jobs = [],
  actionText = "Stop",
  currTab = {},
  loading = false,
}) {
  const router = useRouter();
  const dispatch = useDispatch();

  const checkJobEndDate = (job) => {
    if (!job.endDate) return { valid: false, message: "Job has no end date" };

    const endDate = new Date(job.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

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

    if (actionText === "RePublish" || actionText === "Publish") {
      const job = jobs.find((e) => e._id === jobId);

      if (!job) {
        message.error("Job not found");
        return;
      }

      const dateValidation = checkJobEndDate(job);

      if (!dateValidation.valid) {
        message.warning(dateValidation.message);
        router.push(`/company/myjobs/${jobId}/createjob`);
        return;
      }
    }

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
    { title: "JOB TITLE", dataIndex: "jobTitle", width: "30%" },
    { title: "COLLEGES", dataIndex: "colleges", width: "25%" },
    { title: "POSTED ON", dataIndex: "createdAt", width: "20%" },
    { title: "APPLICANTS", dataIndex: "applicants", width: "15%" },
    { title: "ACTION", dataIndex: "action", width: "10%" },
  ];

  const data = jobs.map((e, i) => {
    const collegesList =
      e.collegesDetails?.map((clgj, index) => {
        return (
          <span
            key={clgj?.orgId}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.25rem 0.6rem",
              borderRadius: "20px",
              backgroundColor: "#eef5fb",
              border: "1px solid #cbd5e1",
              fontSize: "0.75rem",
              color: "#475569",
              fontWeight: "500",
              marginRight: "0.4rem",
              marginBottom: "0.25rem"
            }}
          >
            <HiOutlineAcademicCap style={{ color: "#6BA8ED", fontSize: "0.9rem" }} />
            {clgj?.name}
          </span>
        );
      }) || [];

    const endDate = new Date(e.endDate);
    const today = new Date();
    const isExpired = endDate < today;
    
    const theme = getJobIconAndBg(e.jobTitle);

    return {
      key: e._id,
      jobTitle: (
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              backgroundColor: theme.bgColor,
              color: theme.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {theme.icon}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontWeight: "600", color: "#1e293b", fontSize: "0.95rem" }}>{e.jobTitle}</span>
            <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
              JOB-{e._id ? e._id.substring(e._id.length - 4).toUpperCase() : "NEW"}
            </span>
            {(actionText === "RePublish" || actionText === "Publish") && isExpired && (
              <span style={{ color: "#ff4d4f", fontSize: "11px", marginTop: "2px" }}>
                (Expired: {endDate.toLocaleDateString()})
              </span>
            )}
          </div>
        </div>
      ),
      colleges:
        collegesList?.length > 2 ? (
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center" }}>
            {collegesList.slice(0, 1)}
            <a
              onClick={(ev) => {
                ev.stopPropagation();
              }}
              style={{ fontSize: "0.75rem", fontWeight: "600", color: "#6BA8ED", marginLeft: "0.25rem" }}
            >
              +{collegesList.length - 1} more
            </a>
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap" }}>{collegesList}</div>
        ),
      createdAt: (
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "#64748b", fontSize: "0.85rem" }}>
          <HiOutlineCalendar style={{ fontSize: "0.95rem", color: "#94a3b8" }} />
          {new Date(e?.createdAt)?.toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
          }) || "—"}
        </span>
      ),
      applicants: (
        <Button
          style={{
            borderRadius: "20px",
            backgroundColor: "#eef5fb",
            borderColor: "#eef5fb",
            color: "#6BA8ED",
            fontWeight: "600",
            fontSize: "0.8rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            height: "auto",
            padding: "0.35rem 0.8rem",
          }}
          onClick={(ev) => {
            ev.stopPropagation();
            router.push(`/company/myjobs/${e?._id}/applicants`);
          }}
        >
          <HiOutlineEye style={{ fontSize: "1rem" }} />
          <span>View Applicants</span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#6BA8ED",
              color: "white",
              borderRadius: "10px",
              padding: "0 6px",
              height: "18px",
              minWidth: "18px",
              fontSize: "0.7rem",
              fontWeight: "bold",
              marginLeft: "0.25rem",
            }}
          >
            {e.applicants?.length || 0}
          </span>
        </Button>
      ),
      action: (
        <Button
          onClick={(f) => {
            f.stopPropagation();
            changeStatusOfJob(e?._id);
          }}
          style={{
            borderRadius: "8px",
            fontWeight: "600",
            fontSize: "0.8rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.3rem",
            padding: "0.35rem 0.8rem",
            height: "auto",
          }}
          type={actionText === "Stop" ? "default" : "primary"}
          danger={actionText === "Stop"}
          ghost={actionText === "Stop"}
        >
          {actionText === "Stop" ? (
            <HiStop size={15} />
          ) : (
            <HiOutlinePlayCircle size={15} />
          )}
          <span>{actionText}</span>
        </Button>
      ),
    };
  });

  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 5;
  const paginatedData = data.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (loading) {
    return <Table loading={true} columns={columns} dataSource={[]} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {paginatedData.length > 0 ? (
        <div className={JobStyles.cardsList}>
          {paginatedData.map((item) => (
            <div
              key={item.key}
              className={JobStyles.jobCard}
              onClick={() => router.push(`/company/myjobs/${item.key}/createjob`)}
            >
              {/* Job Title / Logo takes up left space automatically since it's already a flex container */}
              <div style={{ flex: 1, minWidth: "220px" }}>
                {item.jobTitle}
              </div>

              {/* Meta information */}
              <div className={JobStyles.cardMeta}>
                <div className={JobStyles.metaItem}>
                  <span className={JobStyles.metaLabel}>Colleges</span>
                  <span className={JobStyles.metaValue}>{item.colleges}</span>
                </div>
                <div className={JobStyles.metaItem}>
                  <span className={JobStyles.metaLabel}>Posted On</span>
                  <span className={JobStyles.metaValue}>{item.createdAt}</span>
                </div>
                <div className={JobStyles.metaItem}>
                  <span className={JobStyles.metaLabel}>Applicants</span>
                  <span className={JobStyles.metaValue}>{item.applicants}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className={JobStyles.cardActions}>
                {item.action}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Empty description={`No ${currTab?.label?.toLowerCase() || 'jobs'} found`} style={{ margin: "3rem 0" }} />
      )}
      
      {data.length > 0 && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={data.length}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
          />
        </div>
      )}
    </div>
  );
}
