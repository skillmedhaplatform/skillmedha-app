"use client";

import React, { useEffect, useState, useMemo } from "react";
import JobsTable from "./jobsTable";
import { useParams, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { fetchPartnerColleges } from "@/redux/slices/company/skillMedhaData";
import { Button, Input } from "antd";
import "./antd.css";
import JobStyles from "./myJobsStyles.module.scss";
import { SearchOutlined } from "@ant-design/icons";
import { getAllJobs } from "@/redux/slices/company/jobs";
import PageHeader from "@/modules/tpo/components/PageHeader";
import axios from "axios";
import { getLstorage } from "@/utils/universalUtils/windowMW";
import { restUrl } from "@/utils/universalUtils/urls";
import {
  HiOutlineBriefcase,
  HiOutlineUser,
  HiOutlineCalendar,
  HiOutlineQuestionMarkCircle
} from "react-icons/hi2";
import { BsPlus } from "react-icons/bs";

const JobOpts = [
  { label: "Active Jobs", value: "Stop", fetchType: "active" },
  { label: "Expired Jobs", value: "RePublish", fetchType: "expired" },
  { label: "Saved Drafts", value: "Publish", fetchType: "pending" },
];

const PAGE_SIZE = 20;

export default function MyjobsHome() {
  const params = useParams();
  const navigation = useRouter();
  const {
    data: jobsData,
    loading: jobsLoading,
    totalCount = 0,
    error: jobsError,
  } = useSelector((s) => s.placement?.jobs ?? {});

  const [currTab, setCurrTab] = useState(JobOpts[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplicants: 0,
    expiredJobs: 0,
    savedDrafts: 0,
  });

  const dispatch = useDispatch();

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
    const fetchStats = async () => {
      try {
        const token = getLstorage("token");
        const response = await axios.get(
          `${restUrl}/getAllJobs?limit=1000`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const allJobs = response.data?.data || [];
        
        let active = 0;
        let expired = 0;
        let drafts = 0;
        let applicantsCount = 0;

        allJobs.forEach((job) => {
          if (job.status === "active") active++;
          else if (job.status === "expired") expired++;
          else if (job.status === "pending") drafts++;
          
          if (
            (job.status === "active" || job.status === "expired") &&
            job.applicants &&
            Array.isArray(job.applicants)
          ) {
            applicantsCount += job.applicants.length;
          }
        });

        setStats({
          activeJobs: active,
          totalApplicants: applicantsCount,
          expiredJobs: expired,
          savedDrafts: drafts,
        });
      } catch (err) {
        console.error("Failed to fetch jobs stats:", err);
      }
    };
    fetchStats();
  }, [jobsData]);

  const onTabSwitch = (eachopt) => {
    setCurrTab(eachopt);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const filteredJobs = useMemo(() => {
    if (!searchTerm.trim()) {
      return jobsData;
    }
    return (jobsData ?? []).filter((job) =>
      job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [jobsData, searchTerm]);

  return (
    <div style={{ minHeight: "100vh" }}>
      <PageHeader 
        title="My Jobs" 
        subtitle="Manage your company's active and expired job postings"
      />
      <div style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        
        {/* Controls Row (Search & Create Job Button) */}
        <div className={JobStyles.headerRowFlex}>
          <div className={JobStyles.actionsGroup}>
            <Input
              placeholder="Search job with title..."
              prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={JobStyles.searchBoxTop}
            />
            <Button
              type="primary"
              icon={<BsPlus size={18} />}
              className={JobStyles.createJobBtn}
              onClick={() => {
                navigation.push(`/company/myjobs/${params?.jobId || "Newjob"}/createjob/basicdetails`);
              }}
            >
              Create Job
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className={JobStyles.statsGrid}>
          <div 
            className={`${JobStyles.statCard} ${JobStyles.interactiveCard} ${currTab.fetchType === "active" ? JobStyles.activeCard : ""}`}
            onClick={() => onTabSwitch(JobOpts[0])}
          >
            <div className={JobStyles.statIcon} style={{ backgroundColor: "rgba(107, 168, 237, 0.1)", color: "#6BA8ED" }}>
              <HiOutlineBriefcase size={22} />
            </div>
            <div className={JobStyles.statTextCont}>
              <span className={JobStyles.statValue}>{stats.activeJobs}</span>
              <span className={JobStyles.statLabel}>Active Jobs</span>
            </div>
          </div>

          <div 
            className={`${JobStyles.statCard} ${JobStyles.interactiveCard} ${currTab.fetchType === "expired" ? JobStyles.activeCard : ""}`}
            onClick={() => onTabSwitch(JobOpts[1])}
          >
            <div className={JobStyles.statIcon} style={{ backgroundColor: "rgba(249, 115, 22, 0.1)", color: "#f97316" }}>
              <HiOutlineCalendar size={22} />
            </div>
            <div className={JobStyles.statTextCont}>
              <span className={JobStyles.statValue}>{stats.expiredJobs}</span>
              <span className={JobStyles.statLabel}>Expired Jobs</span>
            </div>
          </div>

          <div 
            className={`${JobStyles.statCard} ${JobStyles.interactiveCard} ${currTab.fetchType === "pending" ? JobStyles.activeCard : ""}`}
            onClick={() => onTabSwitch(JobOpts[2])}
          >
            <div className={JobStyles.statIcon} style={{ backgroundColor: "rgba(236, 72, 153, 0.1)", color: "#ec4899" }}>
              <HiOutlineQuestionMarkCircle size={22} />
            </div>
            <div className={JobStyles.statTextCont}>
              <span className={JobStyles.statValue}>{stats.savedDrafts}</span>
              <span className={JobStyles.statLabel}>Saved Drafts</span>
            </div>
          </div>

          <div className={JobStyles.statCard}>
            <div className={JobStyles.statIcon} style={{ backgroundColor: "rgba(34, 197, 94, 0.1)", color: "#22c55e" }}>
              <HiOutlineUser size={22} />
            </div>
            <div className={JobStyles.statTextCont}>
              <span className={JobStyles.statValue}>{stats.totalApplicants}</span>
              <span className={JobStyles.statLabel}>Total Applicants</span>
            </div>
          </div>
        </div>

        <div className={JobStyles.bodyCon} style={{ height: "auto", overflow: "visible", backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1rem" }}>
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
