"use client";
export const dynamic = "force-dynamic";
import React, { useEffect, useState, useMemo } from "react";
import JaStyles from "./page.module.scss";
import {
  Input,
  Pagination,
  Spin,
  Empty,
  Button,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  QuestionCircleOutlined,
  BankOutlined,
  CodeOutlined,
  LineChartOutlined,
  BarChartOutlined,
  VideoCameraOutlined,
  CameraOutlined,
  SafetyCertificateOutlined
} from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import {
  getAllAssessments,
  resetAllAppliedStudents,
} from "@/redux/slices/company/skillMedhaData";
import { useRouter } from "next/navigation";

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

const getJobIcon = (title) => {
  const titleLower = (title || "").toLowerCase();

  let icon = <BankOutlined />;
  let bgColor = "linear-gradient(135deg, #68d391 0%, #38a169 100%)"; // Green

  if (titleLower.includes("developer") && !titleLower.includes("python")) {
    icon = <CodeOutlined />;
    bgColor = "linear-gradient(135deg, #63b3ed 0%, #3182ce 100%)"; // Blue
  } else if (titleLower.includes("data") || titleLower.includes("analyst")) {
    icon = <LineChartOutlined />;
    bgColor = "linear-gradient(135deg, #b794f4 0%, #805ad5 100%)"; // Purple
  } else if (titleLower.includes("python")) {
    icon = (
      <svg width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
      </svg>
    );
    bgColor = "linear-gradient(135deg, #f6ad55 0%, #dd6b20 100%)"; // Orange
  } else if (titleLower.includes("abc")) {
    // Based on the screenshot for 'abc'
    icon = <FileTextOutlined />;
    bgColor = "linear-gradient(135deg, #63b3ed 0%, #3182ce 100%)"; // Blue fallback
  }

  return (
    <div style={{
      width: '40px', height: '40px', borderRadius: '10px',
      background: bgColor,
      color: 'white',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '1.4rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    }}>
      {icon}
    </div>
  );
};

const AssessmentCard = ({ job, onInsightClick, countdown }) => {
  const title = job?.jobTitle || "Untitled";

  const testDuration =
    job?.time?.testDuration?.testDuration?.duration?.val1 &&
      job?.time?.testDuration?.testDuration?.duration?.val2
      ? `${String(job.time.testDuration.testDuration.duration.val1).padStart(2, '0')}H : ${String(job.time.testDuration.testDuration.duration.val2).padStart(2, '0')}M`
      : "NA";

  const handleInsightClick = () => {
    if (job?.jobId) {
      onInsightClick(job.jobId);
    }
  };

  const isExpired = countdown === "Expired";

  return (
    <div className={JaStyles.card}>
      <div className={JaStyles.cardHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {getJobIcon(title)}
          <div style={{ fontSize: "1rem", fontWeight: "700", color: "#1a365d" }}>{title}</div>
        </div>
        <div>
          {isExpired ? (
            <div className={JaStyles.statusBadgeExpired}>
              <ClockCircleOutlined style={{ marginRight: '4px' }} /> Expired
            </div>
          ) : (
            <div className={JaStyles.statusBadgeActive}>
              <span className={JaStyles.greenDot}></span> Active
            </div>
          )}
        </div>
      </div>

      <div className={JaStyles.statsRow}>
        <div className={JaStyles.statBox}>
          <span className={JaStyles.statLabel}>TEST DURATION</span>
          <span className={JaStyles.statValue}>{testDuration}</span>
        </div>
        <div className={JaStyles.statBox}>
          <span className={JaStyles.statLabel}>NO. OF QUESTIONS</span>
          <span className={JaStyles.statValue}>{job?.questionIds?.length || 0}</span>
        </div>
      </div>

      <div className={JaStyles.featureList}>
        <div className={JaStyles.featureItem}>
          <span className={JaStyles.featureLabel}>
            <VideoCameraOutlined style={{ marginRight: '6px' }} /> Live Proctoring
          </span>
          <span className={job?.liveProctoring === "Enable" ? JaStyles.featureBadgeEnabled : JaStyles.featureBadgeDisabled}>
            {job?.liveProctoring === "Enable" ? "Enabled" : "Disabled"}
          </span>
        </div>

        <div className={JaStyles.featureItem}>
          <span className={JaStyles.featureLabel}>
            <CameraOutlined style={{ marginRight: '6px' }} /> Snapshot Technology
          </span>
          <span className={job?.snapShotTechnology === "Enable" ? JaStyles.featureBadgeEnabled : JaStyles.featureBadgeDisabled}>
            {job?.snapShotTechnology === "Enable" ? "Enabled" : "Disabled"}
          </span>
        </div>

        <div className={JaStyles.featureItem}>
          <span className={JaStyles.featureLabel}>
            <SafetyCertificateOutlined style={{ marginRight: '6px' }} /> Honest Respondent
          </span>
          <span className={job?.honestRespondent?.type ? JaStyles.featureBadgeBlue : JaStyles.featureBadgeDisabled}>
            {job?.honestRespondent?.type ? "Warnings + Block" : "Disabled"}
          </span>
        </div>
      </div>

      <div className={JaStyles.attemptsRow}>
        <span className={JaStyles.attemptsLabel}>MAX ATTEMPTS</span>
        <span className={JaStyles.attemptsValue}>{job?.honestRespondent?.maxAttempts || 1}</span>
      </div>

      <div className={JaStyles.actionRow}>
        <Button
          onClick={handleInsightClick}
          type="primary"
          className={JaStyles.insightButton}
          disabled={isExpired}
          icon={<BarChartOutlined />}
        >
          Insights
        </Button>
        <Button className={JaStyles.iconButton} icon={<EditOutlined />} />
        <Button className={JaStyles.iconButton} icon={<DeleteOutlined />} />
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
  const [activeTab, setActiveTab] = useState("all");

  // ===== REDUX & ROUTING =====
  const dispatch = useDispatch();
  const router = useRouter();

  // ===== SELECTORS =====
  const allAssessments = useSelector((s) => s.companySkillMedhaData?.allAssessments) || {};
  const jobData = allAssessments?.value || [];
  const total = allAssessments?.totalCount || 0;
  const apiPageSize = allAssessments?.limit || null;

  // ===== DERIVED DATA =====
  const { activeCount, expiredCount, totalQuestions } = useMemo(() => {
    let active = 0;
    let expired = 0;
    let questions = 0;

    jobData.forEach((job, index) => {
      questions += (job?.questionIds?.length || 0);

      const isExp = countdowns[index] === "Expired";
      if (isExp) {
        expired += 1;
      } else {
        active += 1;
      }
    });

    return { activeCount: active, expiredCount: expired, totalQuestions: questions };
  }, [jobData, countdowns]);

  const filteredJobs = useMemo(() => {
    if (activeTab === "active") {
      return jobData.filter((_, idx) => countdowns[idx] !== "Expired");
    } else if (activeTab === "expired") {
      return jobData.filter((_, idx) => countdowns[idx] === "Expired");
    }
    return jobData;
  }, [jobData, countdowns, activeTab]);

  // ===== COUNTDOWN EFFECT =====
  useEffect(() => {
    const intervalId = setInterval(() => {
      const updatedCountdowns = {};

      jobData.forEach((job, index) => {
        const expiryDate =
          job?.time?.expiryDates?.accessClosingDate ||
          job?.time?.expiryDates?.testExpirationData ||
          job?.expiryDate ||
          job?.endDate;

        const hasExpiry =
          job?.time?.expiryDates?.expiry || job?.hasExpiry || expiryDate;

        if (hasExpiry && expiryDate) {
          const targetDate = new Date(expiryDate);
          const today = new Date();
          const timeDifference = targetDate - today;

          if (timeDifference > 0) {
            updatedCountdowns[index] = "Active";
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
  useEffect(() => {
    if (apiPageSize && apiPageSize !== pageSize) {
      setPageSize(apiPageSize);
    }
  }, [apiPageSize, pageSize]);

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
    console.log("Search:", e.target.value);
  };

  const handleInsightClick = (jobId) => {
    dispatch(resetAllAppliedStudents([]));
    router.push(`/company/jobassessments/${jobId}`);
  };

  const handlePageChange = (page) => {
    setPageNo(page);
  };

  // ===== RENDER FUNCTIONS =====
  const renderHeader = () => (
    <div className={JaStyles.headerSection}>
      <div className={JaStyles.titleSection}>
        <h1>Created Assessments</h1>
        <p>Manage and monitor your candidate assessments</p>
      </div>
      <div className={JaStyles.actionSection}>
        <Input
          className={JaStyles.searchInput}
          prefix={<SearchOutlined style={{ color: '#a0aec0' }} />}
          placeholder="Search assessment..."
          onChange={handleSearch}
        />
        <Button type="primary" icon={<PlusOutlined />} className={JaStyles.createButton}>
          Create Assessment
        </Button>
      </div>
    </div>
  );

  const renderStatsCards = () => (
    <div className={JaStyles.statsCardsContainer}>
      <div className={JaStyles.statsCard}>
        <div className={JaStyles.iconWrapper} style={{ backgroundColor: '#eef2ff', color: '#3182ce' }}>
          <FileTextOutlined />
        </div>
        <div className={JaStyles.statsInfo}>
          <span className={JaStyles.statsCount} style={{ color: '#1a365d' }}>{jobData.length}</span>
          <span className={JaStyles.statsLabel}>Total Assessments</span>
        </div>
      </div>

      <div className={JaStyles.statsCard}>
        <div className={JaStyles.iconWrapper} style={{ backgroundColor: '#f0fff4', color: '#38a169' }}>
          <CheckCircleOutlined />
        </div>
        <div className={JaStyles.statsInfo}>
          <span className={JaStyles.statsCount} style={{ color: '#1a365d' }}>{activeCount}</span>
          <span className={JaStyles.statsLabel}>Active</span>
        </div>
      </div>

      <div className={JaStyles.statsCard}>
        <div className={JaStyles.iconWrapper} style={{ backgroundColor: '#fff5f5', color: '#e53e3e' }}>
          <ClockCircleOutlined />
        </div>
        <div className={JaStyles.statsInfo}>
          <span className={JaStyles.statsCount} style={{ color: '#1a365d' }}>{expiredCount}</span>
          <span className={JaStyles.statsLabel}>Expired</span>
        </div>
      </div>

      <div className={JaStyles.statsCard}>
        <div className={JaStyles.iconWrapper} style={{ backgroundColor: '#faf5ff', color: '#805ad5' }}>
          <QuestionCircleOutlined />
        </div>
        <div className={JaStyles.statsInfo}>
          <span className={JaStyles.statsCount} style={{ color: '#1a365d' }}>{totalQuestions}</span>
          <span className={JaStyles.statsLabel}>Total Questions</span>
        </div>
      </div>
    </div>
  );

  const renderTabs = () => (
    <div className={JaStyles.tabsWrapper}>
      <div
        className={`${JaStyles.tabItem} ${activeTab === 'all' ? JaStyles.activeTab : ''}`}
        onClick={() => setActiveTab('all')}
      >
        <span>All</span>
        <span className={JaStyles.tabBadge}>{jobData.length}</span>
      </div>
      <div
        className={`${JaStyles.tabItem} ${activeTab === 'active' ? JaStyles.activeTab : ''}`}
        onClick={() => setActiveTab('active')}
      >
        <CheckCircleOutlined />
        <span>Active</span>
        <span className={JaStyles.tabBadge}>{activeCount}</span>
      </div>
      <div
        className={`${JaStyles.tabItem} ${activeTab === 'expired' ? JaStyles.activeTab : ''}`}
        onClick={() => setActiveTab('expired')}
      >
        <ClockCircleOutlined />
        <span>Expired</span>
        <span className={JaStyles.tabBadge}>{expiredCount}</span>
      </div>
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
    filteredJobs.map((job, idx) => (
      <AssessmentCard
        key={job?._id || idx}
        job={job}
        onInsightClick={handleInsightClick}
        countdown={countdowns[idx] || "Active"} // Fallback to Active if not expired
      />
    ));

  const renderBodyContent = () => {
    if (loading) {
      return renderLoadingState();
    }

    if (filteredJobs.length === 0) {
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
      {renderStatsCards()}
      {renderTabs()}

      <div className={JaStyles.bodyStyles}>
        {renderBodyContent()}
      </div>

      {renderPagination()}
    </div>
  );
}
