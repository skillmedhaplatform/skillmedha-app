"use client";

import React, { useEffect, useState, useMemo } from "react";
import JobsTable from "./jobsTable";
import { useParams, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { fetchPartnerColleges } from "@/redux/slices/company/skillMedhaData";
import { Button, Input, Tabs } from "antd"; // ADD: Tabs
import "./antd.css";
import JobStyles from "./myJobsStyles.module.scss";
import { SearchOutlined } from "@ant-design/icons";
import { getAllJobs } from "@/redux/slices/company/jobs";

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

  const [currTab, setCurrTab] = useState(JobOpts);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

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

  const onTabSwitch = (eachopt) => {
    setCurrTab(eachopt);
    setCurrentPage(1);
  };

  // ADD: Tabs items from JobOpts
  const tabItems = useMemo(
    () =>
      JobOpts.map((opt) => ({
        key: opt.fetchType, // Tabs use string keys
        label: opt.label,
      })),
    []
  );

  // ADD: Tabs onChange handler maps key back to JobOpts and reuses onTabSwitch
  const handleTabChange = (key) => {
    const next = JobOpts.find((o) => o.fetchType === key);
    if (next) onTabSwitch(next);
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
    <div className={JobStyles.container}>
      {/* ... create job button ... */}
      <div className={JobStyles.createBtn}>
        <div>{null}</div>
        <Button
          type="primary"
          onClick={() => {
            navigation.push(
              `/myjobs/${params?.jobId || "Newjob"}/createjob/basicdetails`
            );
          }}
        >
          Create Job
        </Button>
      </div>
      <br />

      <div className={JobStyles.headerFlex}>
        {/* ADD: AntD Tabs (keeps existing buttons below; both stay in sync) */}
        <Tabs
          activeKey={currTab.fetchType}
          onChange={handleTabChange}
          items={tabItems}
          // type="card"
        />

        {/* Existing search input retained */}
        <Input
          placeholder="Search Job With Title"
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: "50%", height: "3rem" }}
        />
      </div>

      <div className={JobStyles.bodyCon}>
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
  );
}
