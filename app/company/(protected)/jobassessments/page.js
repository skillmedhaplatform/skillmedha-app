"use client";
export const dynamic = "force-dynamic";
import React, { useEffect, useState } from "react";
import JaStyles from "./page.module.scss";
import {
  Input,
  Pagination,
  Spin,
  Empty,
  Button,
  Tag,
  Popover,
  Divider,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import {
  getAllAssessments,
  resetAllAppliedStudents,
} from "@/redux/slices/company/skillMedhaData";
import { useRouter } from "next/navigation";
import { Tooltip } from "@mui/material";

// Constants
const ASSESSMENT_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  DEFAULT_PAGE_NO: 1,
};

const LOADING_STYLES = {
  gridColumn: "1 / -1",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: 32,
};

const EMPTY_STYLES = {
  gridColumn: "1 / -1",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: 24,
};

const AssessmentCard = ({ job, onInsightClick, countdown }) => {
  const title = job?.jobTitle || "Untitled";

  const testDuration =
    job?.time?.testDuration?.testDuration?.duration?.val1 &&
    job?.time?.testDuration?.testDuration?.duration?.val2
      ? `${job.time.testDuration.testDuration.duration.val1}H : ${job.time.testDuration.testDuration.duration.val2}M`
      : "NA";

  const handleInsightClick = () => {
    if (job?.jobId) {
      onInsightClick(job.jobId);
    }
  };

  return (
    <div className={JaStyles.card}>
      <div className={JaStyles.cardHeader}>
        <p style={{ fontSize: "18px", fontWeight: "700" }}>{title}</p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {countdown === "Expired" ? (
            <Button type="default" danger>
              Expired
            </Button>
          ) : countdown === "No expiry set" ? (
            <Button type="text" style={{ color: "#25a3a6" }}>
              Active
            </Button>
          ) : countdown ? (
            <Button type="text" danger>
              {countdown}
            </Button>
          ) : null}
        </div>
      </div>
      <Divider style={{ margin: "4px 0" }} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          padding: ".5rem 0",
        }}
      >
        <div>
          <label>Test Duration : </label>
          <strong>{testDuration}</strong>
        </div>
        <div>
          <label>No of Questions : </label>
          <strong>{job?.questionIds?.length || 0}</strong>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div>
            <label>Live Proctoring:</label>{" "}
            <Tag color={job?.liveProctoring === "Enable" ? "green" : "red"}>
              {job?.liveProctoring || "Not Set"}
            </Tag>
          </div>

          <div>
            <label>Snapshot Technology:</label>{" "}
            <Tag
              color={job?.snapShotTechnology === "Enable" ? "blue" : "volcano"}
            >
              {job?.snapShotTechnology || "Not Set"}
            </Tag>
          </div>

          {job?.honestRespondent && (
            <div>
              <label>Honest Respondent:</label>{" "}
              <Tag>{job?.honestRespondent?.type}</Tag>
              <Tag>Max Attempts: {job?.honestRespondent?.maxAttempts}</Tag>
            </div>
          )}
        </div>
      </div>
      <Divider style={{ margin: "4px 0" }} />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          height: "25%",
        }}
      >
        <Button
          onClick={handleInsightClick}
          type="primary"
          style={{ width: "8rem" }}
          disabled={countdown === "Expired"}
        >
          Insights
        </Button>
      </div>
    </div>
  );
};

export default function AssessmentsPage() {
  // ===== STATE MANAGEMENT =====
  const [pageNo, setPageNo] = useState(ASSESSMENT_CONFIG.DEFAULT_PAGE_NO);
  const [pageSize, setPageSize] = useState(ASSESSMENT_CONFIG.DEFAULT_PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const [countdowns, setCountdowns] = useState({});

  // ===== REDUX & ROUTING =====
  const dispatch = useDispatch();
  const router = useRouter();

  // ===== SELECTORS =====
  const allAssessments = useSelector((s) => s.skillmedha?.allAssessments) || {};
  const jobData = allAssessments?.value || [];
  const total = allAssessments?.totalCount || 0;
  const apiPageSize = allAssessments?.limit || null;

  // ===== COUNTDOWN EFFECT =====
  useEffect(() => {
    const intervalId = setInterval(() => {
      const updatedCountdowns = {};

      jobData.forEach((job, index) => {
        // Adjust these field names based on your job/assessment data structure
        const expiryDate =
          job?.time?.expiryDates?.accessClosingDate ||
          job?.time?.expiryDates?.testExpirationData ||
          job?.expiryDate ||
          job?.endDate;

        // Adjust this condition based on your data structure
        const hasExpiry =
          job?.time?.expiryDates?.expiry || job?.hasExpiry || expiryDate;

        if (hasExpiry && expiryDate) {
          const targetDate = new Date(expiryDate);
          const today = new Date();
          const timeDifference = targetDate - today;

          if (timeDifference > 0) {
            let days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
            let hours = Math.floor(
              (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            );
            let minutes = Math.floor(
              (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
            );
            let seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

            hours = String(hours).padStart(2, "0");
            minutes = String(minutes).padStart(2, "0");
            seconds = String(seconds).padStart(2, "0");

            if (days > 0) {
              days = String(days).padStart(2, "0");
              updatedCountdowns[
                index
              ] = `${days}:${hours}:${minutes}:${seconds}`;
            } else {
              updatedCountdowns[index] = `${hours}:${minutes}:${seconds}`;
            }
          } else {
            updatedCountdowns[index] = "Expired";
          }
        } else {
          updatedCountdowns[index] = "No expiry set";
        }
      });

      setCountdowns(updatedCountdowns);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [jobData]);

  // ===== EFFECTS =====
  // Update page size when API returns different size
  useEffect(() => {
    if (apiPageSize && apiPageSize !== pageSize) {
      setPageSize(apiPageSize);
    }
  }, [apiPageSize, pageSize]);

  // Fetch assessments data
  useEffect(() => {
    let isMounted = true;

    const fetchAssessments = async () => {
      try {
        if (!isMounted) return;
        setLoading(true);
        await dispatch(
          getAllAssessments({
            page: pageNo,
            limit: pageSize,
          })
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAssessments();

    return () => {
      isMounted = false;
    };
  }, [dispatch, pageNo, pageSize]);

  // ===== EVENT HANDLERS =====
  const handleSearch = (e) => {
    // TODO: Implement search functionality
    console.log("Search:", e.target.value);
  };

  const handleInsightClick = (jobId) => {
    dispatch(resetAllAppliedStudents([]));
    router.push(`/jobassessments/${jobId}`);
  };

  const handlePageChange = (page) => {
    setPageNo(page);
  };

  // ===== RENDER FUNCTIONS =====
  const renderHeader = () => (
    <div className={JaStyles.headStyles}>
      <div>Created Assessments</div>
      <Input
        prefix={<SearchOutlined />}
        placeholder="Search A Job here"
        onChange={handleSearch}
      />
    </div>
  );

  const renderLoadingState = () => (
    <div style={LOADING_STYLES}>
      <Spin size="large" />
    </div>
  );

  const renderEmptyState = () => (
    <div style={EMPTY_STYLES}>
      <Empty description="No assessments found" />
    </div>
  );

  const renderAssessmentCards = () =>
    jobData.map((job, idx) => (
      <AssessmentCard
        key={job?._id || idx}
        job={job}
        onInsightClick={handleInsightClick}
        countdown={countdowns[idx]}
      />
    ));

  const renderBodyContent = () => {
    if (loading) {
      return renderLoadingState();
    }

    if (jobData.length === 0) {
      return renderEmptyState();
    }

    return renderAssessmentCards();
  };

  const renderPagination = () => (
    <div className={JaStyles.paginationContainer}>
      <Pagination
        current={pageNo}
        total={total}
        pageSize={pageSize}
        showSizeChanger={false}
        onChange={handlePageChange}
      />
    </div>
  );

  // ===== MAIN RENDER =====
  return (
    <div className={JaStyles.container}>
        {renderHeader()}

        <div className={JaStyles.bodyStyles}>{renderBodyContent()}</div>

        {renderPagination()}
      </div>
  );
}
