"use client";
import React, { useEffect, useOptimistic, useState, useTransition, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, ConfigProvider, message, Result, Segmented, Select, Input, Tabs, Tooltip, Drawer, Popover } from "antd";
import {
  CloseCircleOutlined,
  SearchOutlined,
  SortAscendingOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SendOutlined
} from "@ant-design/icons";
import _ from "lodash";
import { HiOutlineBriefcase } from "react-icons/hi";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ApplyJob, GetAllJobs } from "@/redux/slices/jobopenings";
import { checkIfJobApplied } from "@/app/student/(protected)/jobopenings/utils/jobUtils";
import { getEligibilityStatus } from "@/app/student/(protected)/jobopenings/components/eligibilityCheck";
import { JobListSkeleton, JobDetailsSkeleton } from "@/app/student/(protected)/jobopenings/components/skeletons";
import timeAgo from "@/helpers/timeAgo";
import JobCard from "@/app/student/(protected)/jobopenings/components/JobCard";
import JobDetailsHeader from "@/app/student/(protected)/jobopenings/components/JobDetailsHeader";
import JobDetailsTabs from "@/app/student/(protected)/jobopenings/components/JobDetailsTabs";
import styles from "./mobileJobOpenings.module.scss";

const { Search } = Input;
const PRIMARY = "#1E69DA";

export default function MobileJobOpenings() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ── Redux selectors ──────────────────────────────────────────
  const { jobs: JOBS, pagination = { totalDocs: 0, totalPages: 1, currentPage: 1, limit: 10 } } = useSelector(
    (state) => state.jonOpenings.allJobOpenings?.value || { jobs: [], pagination: { totalDocs: 0, totalPages: 1, currentPage: 1, limit: 10 } }
  );
  const jobsStatus = useSelector((state) => state.jonOpenings.allJobOpenings?.status);
  const student = useSelector((state) => state.student.student?.data);
  const isFetching = jobsStatus === "pending";

  // ── Baseline applied IDs from Redux (real server state) ───
  const realAppliedIds = (student?.appliedJobs ?? [])
    .map((j) => j?.jobDetails?._id || j?.id || j?.jobId || j?._id || (typeof j === "string" ? j : null))
    .filter(Boolean);

  // ── useOptimistic & useTransition ─────────────────────────
  const [optimisticAppliedIds, addOptimisticApply] = useOptimistic(
    realAppliedIds,
    (current, newJobId) => [...current, newJobId]
  );
  const [isPending, startTransition] = useTransition();

  // ── UI state ───────────────────────────────────────────────
  // "viewMode" state removed; details render in a Drawer
  const [selectedId, setSelectedId] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [listFilter, setListFilter] = useState("all");
  const [isDeadlineOver, setIsDeadlineOver] = useState(false);

  // local filters matching desktop
  const profileNameParam = searchParams.get("profileName") || "all";
  const sortParam = searchParams.get("sort") || "createdAt";
  const searchParam = searchParams.get("search") || "";

  const [filters, setFilters] = useState({
    profileName: profileNameParam,
    sort: sortParam,
    search: searchParam,
  });

  // Sync filters state with URL changes
  React.useEffect(() => {
    setFilters({
      profileName: searchParams.get("profileName") || "all",
      sort: searchParams.get("sort") || "createdAt",
      search: searchParams.get("search") || "",
    });
  }, [searchParams]);

  const jobOptions = [
    { value: "all", label: "All Jobs" },
    ..._.uniqBy(
      (JOBS ?? []).map((e) => ({
        value: e?.profileName,
        label: e?.profileName,
      })),
      "value"
    ).filter((e) => e.value),
  ];

  const sortOptions = [
    { value: "createdAt", label: "Sort By Date" },
    { value: "relevance", label: "Sort By Relevance" },
  ];

  // Helper check applied state
  const isJobApplied = (jobId) =>
    optimisticAppliedIds.includes(jobId) ||
    checkIfJobApplied(jobId, student?.appliedJobs);



  // ── Filter helpers ─────────────────────────────────────────
  const createQueryString = useCallback(
    (name, value) => {
      const params = new URLSearchParams(searchParams);
      params.set(name, value);
      params.set("page", "1"); // Reset to page 1 on search or filter change
      return params.toString().replace(/\+/g, "%20");
    },
    [searchParams]
  );

  const handleClearFilter = () => {
    router.push(pathname);
    setFilters({ profileName: "all", sort: "createdAt", search: "" });
  };

  const handleDispatchFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    params.set(key, value);
    params.set("page", "1");
    router.push(pathname + "?" + params.toString().replace(/\+/g, "%20"));
  };

  const appliedJobsList = (student?.appliedJobs || [])
    .map((aj) => {
      const jobId = aj?.jobDetails?._id || aj?.id || aj?.jobId || aj?._id || (typeof aj === "string" ? aj : null);
      if (!jobId) return null;
      const localDetails = JOBS.find((job) => String(job?._id) === String(jobId));
      const details = localDetails || aj?.jobDetails;
      if (!details) return null;
      return {
        ...details,
        applicationStatus: aj.status || "applied",
      };
    })
    .filter((j) => {
      if (!j || !j._id) return false;
      if (j.status === "pending") return false;

      // Filter by search locally
      if (searchParam) {
        const query = searchParam.toLowerCase();
        const matchesSearch =
          (j.jobTitle || "").toLowerCase().includes(query) ||
          (j.companyName || "").toLowerCase().includes(query) ||
          (j.city || "").toLowerCase().includes(query) ||
          (j.sector || "").toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Filter by job profile locally
      if (profileNameParam && profileNameParam !== "all") {
        if (j.profileName !== profileNameParam) return false;
      }

      return true;
    });

  // Sort locally
  appliedJobsList.sort((a, b) => {
    if (sortParam === "createdAt") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const filteredJobs = listFilter === "applied" ? appliedJobsList : JOBS.filter((j) => j?.status !== "pending");

  const selectedJob = filteredJobs?.find((j) => j?._id === selectedId) || null;

  // Removed auto-select so the drawer doesn't open immediately  // ── Reset active tab when selected ID changes ─────────────
  useEffect(() => {
    setActiveTab("overview");
  }, [selectedId]);

  const handleApply = () => {
    if (!selectedJob || !student) return;
    startTransition(async () => {
      addOptimisticApply(selectedJob._id);
      const result = await dispatch(
        ApplyJob({ jobid: selectedJob._id, studentId: student._id, dispatch })
      );
      if (result?.error) {
        message.error("Failed to apply. Please try again.");
      }
    });
  };

  // ── Eligibility Check ──────────────────────────────────────
  const { eligible, reason } = selectedJob ? getEligibilityStatus(student, selectedJob) : { eligible: false, reason: "" };

  const renderApplyButton = () => {
    if (isJobApplied(selectedJob?._id)) {
      return (
        <ConfigProvider theme={{ token: { colorPrimary: PRIMARY } }}>
          <Button type="primary" icon={<CheckCircleOutlined />} disabled size="large">
            Already Applied
          </Button>
        </ConfigProvider>
      );
    }
    if (isDeadlineOver) {
      return (
        <Button type="default" icon={<ClockCircleOutlined />} disabled size="large" danger>
          Deadline Closed
        </Button>
      );
    }
    return (
      <Tooltip title={!eligible ? reason : ""}>
        <ConfigProvider theme={{ token: { colorPrimary: PRIMARY } }}>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleApply}
            disabled={!eligible}
            loading={isPending}
            size="large"
          >
            Apply Now
          </Button>
        </ConfigProvider>
      </Tooltip>
    );
  };

  const totalJobs = pagination?.totalDocs || JOBS.length;
  const todayCount = JOBS.filter(
    (job) => new Date(job.createdAt).toDateString() === new Date().toDateString()
  ).length;
  const totalApplied = optimisticAppliedIds.length;

  return (
    <div className={styles.container}>
      {/* ── Banner Section ── */}
      <div className="w-[calc(100%+28px)] -ml-[14px] h-[120px] min-h-[120px] flex flex-col justify-center p-4 shadow-sm bg-gradient-to-br from-[#071631] to-[#10254c] text-white shrink-0 relative overflow-hidden z-[50] mt-[-14px] sticky top-0 mb-4">
        {/* Decorative Icons */}
        <div className="absolute inset-0 pointer-events-none z-[1]">
          <div className="absolute top-[20%] right-[10%] text-[#1E69DA] opacity-60 text-[1.2rem]">✕</div>
          <div className="absolute bottom-[20%] right-[30%] text-[#1E69DA] opacity-50 text-[1.5rem]">+</div>
          <div className="absolute top-[40%] right-[50%] text-[#1E69DA] opacity-50 text-[1.1rem]">★</div>
          <div className="absolute bottom-[30%] right-[5%] text-[#1E69DA] opacity-60 text-[1.3rem]">✕</div>
        </div>

        <div className="flex items-center justify-between w-full relative z-[2]">
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-[48px] h-[48px] bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10 shrink-0">
              <HiOutlineBriefcase className="text-white text-2xl" />
            </div>
            <div className="flex flex-col justify-center">
              <div className="text-[20px] font-bold text-white m-0 leading-tight">
                Job Openings
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 relative z-10">
            <div className="flex flex-col items-center min-w-[40px]">
              <span className="text-[18px] font-bold text-white leading-none">{totalJobs}</span>
              <span className="text-[9px] text-[#94a3b8] font-bold uppercase mt-1 text-center">Jobs</span>
            </div>
            <div className="w-[1px] h-[24px] bg-white/20"></div>
            <div className="flex flex-col items-center min-w-[40px]">
              <span className="text-[18px] font-bold text-white leading-none">{todayCount}</span>
              <span className="text-[9px] text-[#94a3b8] font-bold uppercase mt-1 text-center">New</span>
            </div>
            <div className="w-[1px] h-[24px] bg-white/20"></div>
            <div className="flex flex-col items-center min-w-[40px]">
              <span className="text-[18px] font-bold text-white leading-none">{totalApplied}</span>
              <span className="text-[9px] text-[#94a3b8] font-bold uppercase mt-1 text-center">Applied</span>
            </div>
          </div>
        </div>
      </div>

          {/* Filter & Search Bar Section */}
          <div className="bg-white p-3 border-b border-[#e2e8f0] flex flex-col gap-3">
            <div className="flex gap-2 w-full">
              <Search
                id="mobile-job-search"
                placeholder="Search jobs..."
                allowClear
                enterButton={<SearchOutlined />}
                style={{ flex: 1 }}
                value={filters.search}
                loading={isFetching}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilters((prev) => ({ ...prev, search: value }));
                  if (!value) handleClearFilter();
                }}
                onSearch={(value) => {
                  router.push(pathname + "?" + createQueryString("search", value));
                  handleDispatchFilter("search", value);
                }}
              />
              <Popover
                placement="bottomRight"
                trigger="click"
                content={
                  <div className="flex flex-col gap-3 p-2 w-[200px]">
                    <div className="font-bold text-sm text-gray-700">Filters & Sort</div>
                    <Select
                      value={filters.profileName}
                      options={jobOptions}
                      placeholder="Job Profile"
                      onChange={(value) => {
                        setFilters((prev) => ({ ...prev, profileName: value }));
                        router.push(pathname + "?" + createQueryString("profileName", value));
                        handleDispatchFilter("profileName", value);
                      }}
                      style={{ width: "100%" }}
                    />
                    <Select
                      value={filters.sort}
                      options={sortOptions}
                      suffixIcon={<SortAscendingOutlined />}
                      onChange={(value) => {
                        setFilters((prev) => ({ ...prev, sort: value }));
                        router.push(pathname + "?" + createQueryString("sort", value));
                        handleDispatchFilter("sort", value);
                      }}
                      style={{ width: "100%" }}
                    />
                  </div>
                }
              >
                <Button icon={<span style={{ fontSize: '18px' }}>⚙️</span>} style={{ height: '32px' }} />
              </Popover>
            </div>

            <ConfigProvider
              theme={{
                components: {
                  Segmented: {
                    itemSelectedBg: "#1E69DA",
                    itemSelectedColor: "#ffffff",
                    itemActiveBg: "#1E69DA",
                    trackBg: "rgba(30,105,218,0.1)",
                    fontSize: 14,
                  },
                },
              }}
            >
              <Segmented
                block
                value={listFilter}
                onChange={setListFilter}
                options={[
                  { label: "All Jobs", value: "all" },
                  { label: "Applied Jobs", value: "applied" },
                ]}
                style={{ fontWeight: 600 }}
              />
            </ConfigProvider>
          </div>

          {/* 3. Job list cards */}
          <div className={styles.jobListCon}>
            {isFetching && !JOBS.length ? (
              Array.from({ length: 4 }).map((_, i) => <JobListSkeleton key={i} />)
            ) : filteredJobs.length === 0 ? (
              <Result
                status="404"
                title="No Jobs Found"
                subTitle="New openings are added regularly!"
              />
            ) : (
              <div className="flex flex-col gap-3 pt-3 px-3">
                {filteredJobs.map((job) => (
                  <JobCard
                    key={job?._id}
                    job={job}
                    isSelected={selectedId === job?._id}
                    onSelect={setSelectedId}
                    isApplied={isJobApplied(job?._id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sticky Pagination at Bottom */}
          {listFilter === "all" && pagination && (
            <div className="flex flex-col gap-3 pt-3 px-3 pb-3 border-t border-[#e2e8f0] bg-white shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] relative z-10">
              {/* Top row: items per page and showing info */}
              <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <span>Show:</span>
                  <Select
                    size="small"
                    value={pagination.limit}
                    onChange={(val) => {
                      const params = new URLSearchParams(searchParams);
                      params.set("limit", String(val));
                      params.set("page", "1");
                      router.push(pathname + "?" + params.toString().replace(/\+/g, "%20"));
                    }}
                    options={[
                      { value: 10, label: "10" },
                      { value: 25, label: "25" },
                      { value: 50, label: "50" },
                      { value: 100, label: "100" },
                    ]}
                    style={{ width: 65 }}
                  />
                </div>
                <span>
                  Showing {Math.min(pagination.totalDocs, (pagination.currentPage - 1) * pagination.limit + 1)}–
                  {Math.min(pagination.totalDocs, pagination.currentPage * pagination.limit)} of {pagination.totalDocs}
                </span>
              </div>

              {/* Bottom row: Page buttons */}
              <div className="flex items-center justify-center gap-1 flex-wrap">
                <Button
                  size="small"
                  disabled={pagination.currentPage === 1}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.set("page", String(pagination.currentPage - 1));
                    router.push(pathname + "?" + params.toString().replace(/\+/g, "%20"));
                  }}
                >
                  ‹
                </Button>

                {Array.from({ length: pagination.totalPages }, (_, i) => {
                  const pageNum = i + 1;
                  // Limit showing max 4 pages around current page for mobile
                  if (
                    pagination.totalPages > 4 &&
                    Math.abs(pagination.currentPage - pageNum) > 1 &&
                    pageNum !== 1 &&
                    pageNum !== pagination.totalPages
                  ) {
                    if (
                      (pageNum === 2 && pagination.currentPage > 3) ||
                      (pageNum === pagination.totalPages - 1 && pagination.currentPage < pagination.totalPages - 2)
                    ) {
                      return <span key={pageNum} className="text-gray-400 px-0.5">...</span>;
                    }
                    return null;
                  }

                  return (
                    <Button
                      key={pageNum}
                      size="small"
                      type={pagination.currentPage === pageNum ? "primary" : "default"}
                      className={
                        pagination.currentPage === pageNum
                          ? "!bg-[#1E69DA] !border-[#1E69DA] !text-white"
                          : ""
                      }
                      onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        params.set("page", String(pageNum));
                        router.push(pathname + "?" + params.toString().replace(/\+/g, "%20"));
                      }}
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                <Button
                  size="small"
                  disabled={pagination.currentPage === pagination.totalPages || pagination.totalPages === 0}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.set("page", String(pagination.currentPage + 1));
                    router.push(pathname + "?" + params.toString().replace(/\+/g, "%20"));
                  }}
                >
                  ›
                </Button>
              </div>
            </div>
          )}

      {/* ── Job Details Drawer (Bottom Sheet) ── */}
      <Drawer
        placement="bottom"
        open={!!selectedId && !!selectedJob}
        onClose={() => setSelectedId("")}
        closable={false}
        height="90vh"
        styles={{ body: { padding: 0, backgroundColor: "#ffffff" } }}
      >
        <div className="relative pt-4 pb-4 h-full flex flex-col bg-[#ffffff]">
          {/* Drag Handle */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[36px] h-[4px] rounded-full bg-[#cbd5e1] z-10"></div>
          
          <div className={styles.jobDetailsCon} style={{ paddingTop: '10px' }}>

          {isFetching && !selectedJob ? (
            <div style={{ padding: 16 }}><JobDetailsSkeleton /></div>
          ) : (
          <>
            <div className="flex flex-col h-full bg-[#eff5fb] overflow-hidden">
              <div className="px-4 pt-4 shrink-0">
                <JobDetailsHeader
                  job={selectedJob}
                  student={student}
                  isApplied={isJobApplied(selectedJob?._id)}
                  onApply={handleApply}
                  applyPending={isPending}
                />
              </div>
              <div className="flex-1 overflow-hidden px-4 pb-4 mt-4">
                <JobDetailsTabs
                  job={selectedJob}
                  selectedTab={activeTab}
                  onTabChange={setActiveTab}
                />
              </div>
            </div>
          </>
          )}
        </div>
        </div>
      </Drawer>
    </div>
  );
}
