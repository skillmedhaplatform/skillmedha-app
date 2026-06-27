"use client";
import React, { useEffect, useOptimistic, useState, useTransition, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, ConfigProvider, message, Result, Segmented, Select, Input, Tabs, Tooltip } from "antd";
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
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ApplyJob, GetAllJobs } from "@/redux/slices/jobopenings";
import { checkIfJobApplied } from "@/app/student/(protected)/jobopenings/utils/jobUtils";
import { getEligibilityStatus } from "@/app/student/(protected)/jobopenings/components/eligibilityCheck";
import { JobListSkeleton, JobDetailsSkeleton } from "@/app/student/(protected)/jobopenings/components/skeletons";
import timeAgo from "@/helpers/timeAgo";
import CountdownTimer from "@/app/student/(protected)/jobopenings/components/countdowntimer";
import styles from "./mobileJobOpenings.module.scss";

const { Search } = Input;
const PRIMARY = "#24A058";

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
  const [viewMode, setViewMode] = useState("list"); // "list" or "details"
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

  // ── Auto-select first job on load ──
  useEffect(() => {
    if (!filteredJobs?.length) return;
    const stillExists = filteredJobs.some((j) => j?._id === selectedId);
    if (!selectedId || !stillExists) setSelectedId(filteredJobs[0]?._id || "");
  }, [filteredJobs]);

  // ── Reset active tab when selected ID changes ─────────────
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

  return (
    <div className={styles.container}>
      {viewMode === "list" ? (
        <>
          {/* 1. Compact Filters */}
          <div className={styles.filtersRow}>
            <div className={styles.filtersSelects}>
              <Select
                id="mobile-job-selector"
                style={{ flex: 1, minWidth: 100 }}
                value={filters.profileName}
                options={jobOptions}
                placeholder="Job Profile"
                loading={isFetching}
                onChange={(value) => {
                  setFilters((prev) => ({ ...prev, profileName: value }));
                  router.push(pathname + "?" + createQueryString("profileName", value));
                  handleDispatchFilter("profileName", value);
                }}
              />
              <Select
                id="mobile-sort-selector"
                style={{ flex: 1, minWidth: 100 }}
                value={filters.sort}
                options={sortOptions}
                suffixIcon={<SortAscendingOutlined />}
                onChange={(value) => {
                  setFilters((prev) => ({ ...prev, sort: value }));
                  router.push(pathname + "?" + createQueryString("sort", value));
                  handleDispatchFilter("sort", value);
                }}
              />
            </div>
            <div className={styles.filtersSearch}>
              <Search
                id="mobile-job-search"
                placeholder="Search jobs..."
                allowClear
                enterButton={<SearchOutlined />}
                style={{ width: "100%" }}
                value={filters.search}
                loading={isFetching}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilters((prev) => ({ ...prev, search: value }));
                  if (!value) handleClearFilter();
                }}
                onSearch={(value) => {
                  if (value) {
                    router.push(pathname + "?" + createQueryString("search", value));
                    handleDispatchFilter("search", value);
                  } else {
                    handleClearFilter();
                  }
                }}
              />
              <Button
                type="link"
                danger
                icon={<CloseCircleOutlined />}
                className="whitespace-nowrap text-[#24A058] font-extrabold underline cursor-pointer"
                onClick={handleClearFilter}
                style={{ padding: "0 4px" }}
              >
                Clear
              </Button>
            </div>
          </div>

          {/* 2. List Tabs */}
          <div className={styles.segmentedTabCon}>
            <ConfigProvider
              theme={{
                components: {
                  Segmented: {
                    itemSelectedBg: "#24A058",
                    itemSelectedColor: "#ffffff",
                    itemActiveBg: "#24A058",
                    trackBg: "rgba(39,174,96,0.1)",
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
              filteredJobs.map((job) => {
                const applied = isJobApplied(job?._id);
                return (
                  <div
                    key={job?._id}
                    className={`${styles.jobTile} ${selectedId === job?._id ? styles.selected : ""}`}
                    onClick={() => {
                      setSelectedId(job?._id);
                      setViewMode("details");
                    }}
                  >
                    <h3 className={styles.tileCompany}>{job?.companyName}</h3>
                    <div className={styles.tileRole}>{job?.jobTitle || job?.profileName}</div>
                    <div className={styles.tileLocation}>{job?.city || "Not Mentioned"}</div>
                    <div className={styles.tileFooter}>
                      <span>{timeAgo(job.createdAt)}</span>
                      <span className={`${styles.tileBadge} ${applied ? styles.applied : styles.notApplied}`}>
                        {applied ? "Applied" : "Not Applied"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}

            {listFilter === "all" && pagination && (
              <div className="flex flex-col gap-3 pt-3 border-t border-[#e2e8f0] bg-white mt-4 pb-2">
                {/* Top row: items per page and showing info */}
                <div className="flex items-center justify-between text-xs text-gray-500 font-medium px-2">
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
                <div className="flex items-center justify-center gap-1 flex-wrap px-2">
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
                            ? "!bg-[#24A058] !border-[#24A058] !text-white"
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
          </div>
        </>
      ) : (
        /* ════════ DETAILS MODE ════════ */
        <div className={styles.jobDetailsCon}>
          {/* Back button */}
          <div className={styles.backButtonRow}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => setViewMode("list")}
              className={styles.backBtn}
            >
              Back to jobs
            </Button>
          </div>

          {isFetching && !selectedJob ? (
            <div style={{ padding: 16 }}><JobDetailsSkeleton /></div>
          ) : (
            <div className={styles.detailsContentScroll}>
              {/* Header section */}
              <div className={styles.companyHeader}>
                <div className={styles.logoWrapper}>
                  <img
                    src={selectedJob?.companyLogo}
                    alt="Company logo"
                    className={styles.logoImg}
                  />
                </div>
                <div className={styles.headerInfoCon}>
                  <h2 className={styles.headerTitle}>{selectedJob?.companyName} - {selectedJob?.jobTitle || selectedJob?.profileName}</h2>
                  <div className={styles.headerSubtitle}>
                    {selectedJob?.companyName} {selectedJob?.city && `· ${selectedJob.city}`}
                  </div>
                  <div className={styles.applyBtnRow}>
                    {renderApplyButton()}
                    <div className={styles.countdownWrapper}>
                      <CountdownTimer jobEndDate={selectedJob?.endDate} onDeadlineOver={setIsDeadlineOver} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Stacked meta cards */}
              <div className={styles.metaGrid}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Location</span>
                  <span className={styles.metaValue}>{selectedJob?.city || "Not Specified"}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>CTC</span>
                  <span className={styles.metaValue}>{selectedJob?.ctc || "As per standards"}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Category</span>
                  <span className={styles.metaValue}>{selectedJob?.sector || "Job"}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Function</span>
                  <span className={styles.metaValue}>{selectedJob?.jobTitle || "Engineering"}</span>
                </div>
              </div>

              {/* Tabs */}
              <div className={styles.detailsTabsCon}>
                <Tabs
                  activeKey={activeTab}
                  onChange={setActiveTab}
                  items={[
                    {
                      key: "overview",
                      label: "Overview",
                      children: (
                        <div
                          className={styles.detailsSectionText}
                          style={{ whiteSpace: "pre-wrap" }}
                        >
                          {selectedJob?.jobDescription || "No description provided."}
                        </div>
                      )
                    },
                    {
                      key: "hiring",
                      label: "Hiring Process",
                      children: (
                        <div
                          className={styles.detailsSectionText}
                          style={{ display: "flex", flexDirection: "column", gap: "10px" }}
                        >
                          {selectedJob?.interviewRounds?.length ? (
                            selectedJob.interviewRounds.map((round, index) => (
                              <div key={index} style={{ padding: "12px", border: "1px solid #e5e7eb", borderRadius: "8px", background: "#ffffff" }}>
                                <p style={{ margin: 0, fontWeight: "600" }}>
                                  {index + 1}. {round?.roundName}:{" "}
                                  <span style={{ fontWeight: "normal" }}>{round?.description}</span>
                                </p>
                              </div>
                            ))
                          ) : (
                            <p style={{ margin: 0, color: "#64748b" }}>No interview rounds specified.</p>
                          )}
                        </div>
                      )
                    },
                    {
                      key: "eligibility",
                      label: "Eligibility",
                      children: (
                        <div
                          className={styles.detailsSectionText}
                          style={{ display: "flex", flexDirection: "column", gap: "10px" }}
                        >
                          {selectedJob?.eligibilityCriteria?.length ? (
                            selectedJob.eligibilityCriteria.map((item, index) => (
                              <div key={index} style={{ padding: "12px", border: "1px solid #e5e7eb", borderRadius: "8px", background: "#ffffff" }}>
                                <p style={{ margin: "0 0 8px 0" }}>
                                  <strong>Education Level:</strong> {item?.educationLevel || "N/A"}
                                </p>
                                <p style={{ margin: 0 }}>
                                  <strong>Minimum Marks Percentage:</strong>{" "}
                                  {item?.minMarksPercentage || "N/A"}%
                                </p>
                              </div>
                            ))
                          ) : (
                            <p style={{ margin: 0, color: "#64748b" }}>No eligibility criteria specified.</p>
                          )}
                        </div>
                      )
                    }
                  ]}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
