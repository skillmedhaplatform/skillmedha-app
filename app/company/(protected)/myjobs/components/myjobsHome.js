"use client";

import React, { useEffect, useState, useMemo } from "react";
import JobsTable from "./jobsTable";
import { useParams, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { Button, Input, Tabs } from "antd";
import "./antd.css";
import JobStyles from "./myJobsStyles.module.scss";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { getAllJobs } from "@/redux/slices/company/jobs";

const JobOpts = [
  { label: "Active Jobs", value: "Stop", fetchType: "active", count: 6 },
  { label: "Expired Jobs", value: "RePublish", fetchType: "expired", count: 3 },
  { label: "Saved Drafts", value: "Publish", fetchType: "pending", count: 2 },
];

const PAGE_SIZE = 20;

const BriefcaseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
  </svg>
);

const UsersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const ClockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const FileIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
    <polyline points="13 2 13 9 20 9"></polyline>
  </svg>
);

export default function MyjobsHome() {
  const params = useParams();
  const navigation = useRouter();
  const jobsState = useSelector((s) => s.placement?.jobs || s.companyPlacements?.jobs);
  const {
    data: jobsData,
    loading: jobsLoading,
    pagination,
    error: jobsError,
  } = jobsState || {};

  const totalCount = pagination?.totalDocs || 0;

  const [currTab, setCurrTab] = useState(JobOpts[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const dispatch = useDispatch();

  const [dashboardStats, setDashboardStats] = useState({
    active: 0,
    expired: 0,
    pending: 0,
    totalApplicants: 0
  });

  useEffect(() => {
    dispatch(
      getAllJobs({
        page: currentPage,
        limit: PAGE_SIZE,
        status: currTab.fetchType,
      })
    );
  }, [dispatch, currentPage, currTab.fetchType]);

  useEffect(() => {
    // Fetch global dashboard counts
    const fetchStats = async () => {
      try {
        const { GetToken } = await import("@/utils/universalUtils/token");
        const { restUrl } = await import("@/utils/universalUtils/urls");
        const axios = (await import("axios")).default;
        
        const response = await axios.get(restUrl + '/getJobDashboardStats', {
          headers: { Authorization: "Bearer " + GetToken() }
        });
        
        setDashboardStats({
          active: response.data.active || 0,
          expired: response.data.expired || 0,
          pending: response.data.pending || 0,
          totalApplicants: response.data.totalApplicants || 0
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      }
    };
    fetchStats();
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleTabChange = (key) => {
    const selectedOpt = JobOpts.find((opt) => opt.fetchType === key);
    if (selectedOpt) {
      setCurrTab(selectedOpt);
      setCurrentPage(1);
      setSearchTerm("");
    }
  };

  const filteredJobs = useMemo(() => {
    if (!jobsData) return [];
    if (!searchTerm) return jobsData;
    return jobsData.filter(
      (job) =>
        job?.jobTitle?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
        job?.companyName?.toLowerCase()?.includes(searchTerm.toLowerCase())
    );
  }, [jobsData, searchTerm]);

  // Use dynamic global counts for all tabs
  const getTabLabel = (opt) => (
    <span className={JobStyles.tabLabel}>
      {opt.label} <span className={JobStyles.tabBadge}>{dashboardStats[opt.fetchType] || 0}</span>
    </span>
  );

  const tabItems = useMemo(
    () =>
      JobOpts.map((opt) => ({
        key: opt.fetchType,
        label: getTabLabel(opt),
      })),
    [currTab, dashboardStats]
  );

  return (
    <div className={JobStyles.container}>
      <div className={JobStyles.pageHeader}>
        <div className={JobStyles.pageHeaderLeft}>
          <h1 className={JobStyles.pageTitle}>My Jobs</h1>
          <p className={JobStyles.pageSubtitle}>Manage your job postings and track applicants</p>
        </div>
        <Button
          type="primary"
          className={JobStyles.createJobButton}
          icon={<PlusOutlined />}
          onClick={() => {
            navigation.push(
              `/company/myjobs/${params?.jobId || "Newjob"}/createjob/basicdetails`
            );
          }}
        >
          Create Job
        </Button>
      </div>

      <div className={JobStyles.statsCardsContainer}>
        <div className={JobStyles.statsCard}>
          <div className={JobStyles.statsIconWrapper} style={{ backgroundColor: '#e6f0fa', color: '#3182ce' }}>
             <BriefcaseIcon />
          </div>
          <div className={JobStyles.statsInfo}>
             <h3>{dashboardStats.active}</h3>
             <p>Active Jobs</p>
          </div>
        </div>
        <div className={JobStyles.statsCard}>
          <div className={JobStyles.statsIconWrapper} style={{ backgroundColor: '#e6fbd9', color: '#38a169' }}>
             <UsersIcon />
          </div>
          <div className={JobStyles.statsInfo}>
             <h3>{dashboardStats.totalApplicants}</h3>
             <p>Total Applicants</p>
          </div>
        </div>
        <div className={JobStyles.statsCard}>
          <div className={JobStyles.statsIconWrapper} style={{ backgroundColor: '#feebc8', color: '#dd6b20' }}>
             <ClockIcon />
          </div>
          <div className={JobStyles.statsInfo}>
             <h3>{dashboardStats.expired}</h3>
             <p>Expired Jobs</p>
          </div>
        </div>
        <div className={JobStyles.statsCard}>
          <div className={JobStyles.statsIconWrapper} style={{ backgroundColor: '#fed7d7', color: '#e53e3e' }}>
             <FileIcon />
          </div>
          <div className={JobStyles.statsInfo}>
             <h3>{dashboardStats.pending}</h3>
             <p>Saved Drafts</p>
          </div>
        </div>
      </div>

      <div className={JobStyles.bodyCon}>
        <div className={JobStyles.tableControls}>
          <div className={JobStyles.tabsContainer}>
            <Tabs
              activeKey={currTab.fetchType}
              onChange={handleTabChange}
              items={tabItems}
              className={JobStyles.customTabs}
            />
          </div>

          <Input
            placeholder="Search job with title..."
            prefix={<SearchOutlined style={{ color: '#a0aec0' }} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={JobStyles.searchInput}
          />
        </div>

        <div className={JobStyles.tableWrapper}>
          <JobsTable
            jobs={filteredJobs}
            actionText={currTab?.value}
            currTab={currTab}
            loading={jobsLoading}
            paginationConfig={{
              pageSize: PAGE_SIZE,
              current: currentPage,
              total: totalCount,
              onChange: handlePageChange,
            }}
          />
        </div>
      </div>
    </div>
  );
}
