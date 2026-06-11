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
  const { jobs: JOBS, next, nextCursor } = useSelector(
    (state) => state.jonOpenings.allJobOpenings?.value || { jobs: [], next: false, nextCursor: null }
  );
  const jobsStatus = useSelector((state) => state.jonOpenings.allJobOpenings?.status);
  const student = useSelector((state) => state.student.student?.data);
  const isFetching = jobsStatus === "pending";

  // ── Baseline applied IDs from Redux (real server state) ───
  const realAppliedIds = (student?.appliedJobs ?? [])
    .map((j) => j?.jobDetails?._id)
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
  const [selectedJob, setSelectedJob] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [listFilter, setListFilter] = useState("all");
  const [loadingMore, setLoadingMore] = useState(false);
  const [isDeadlineOver, setIsDeadlineOver] = useState(false);

  // local filters matching desktop
  const [filters, setFilters] = useState({
    profileName: "all",
    sort: "createdAt",
    search: "",
  });

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

  // ── Auto-select first job on load (but don't force details view) ──
  useEffect(() => {
    if (!JOBS?.length) return;
    const stillExists = JOBS.some((j) => j._id === selectedId);
    if (!selectedId || !stillExists) setSelectedId(JOBS[0]?._id || "");
  }, [JOBS]);

  // ── Sync selectedJob ───────────────────────────────────────
  useEffect(() => {
    const job = JOBS?.find((j) => j._id === selectedId) || null;
    setSelectedJob(job);
  }, [selectedId, JOBS]);

  // ── Filter helpers ─────────────────────────────────────────
  const createQueryString = useCallback(
    (name, value) => {
      const params = new URLSearchParams(searchParams);
      params.set(name, value);
      return params.toString().replace(/\+/g, "%20");
    },
    [searchParams]
  );

  const handleClearFilter = () => {
    const hasQueryParams = Array.from(searchParams.entries()).length > 0;
    if (hasQueryParams) {
      dispatch(GetAllJobs({ fetchType: "initial" }));
    }
    router.push(pathname);
    setFilters({ profileName: "all", sort: "createdAt", search: "" });
  };

  const handleDispatchFilter = (key, value) => {
    if (key === "profileName" && value === "all") {
      handleClearFilter();
      return;
    }
    const queryObj = {};
    for (const [k, v] of searchParams.entries()) {
      queryObj[k] = v;
    }
    queryObj[key] = value;
    dispatch(GetAllJobs({ fetchType: "initial", queryObj }));
  };

  const filteredJobs = (
    listFilter === "applied"
      ? JOBS.filter((j) => isJobApplied(j._id))
      : JOBS
  ).filter((j) => j?.status !== "pending");

  const handleLoadMore = async () => {
    setLoadingMore(true);
    await dispatch(GetAllJobs({ limit: 10, cursor: nextCursor }));
    setLoadingMore(false);
  };

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
                const applied = isJobApplied(job._id);
                return (
                  <div
                    key={job._id}
                    className={`${styles.jobTile} ${selectedId === job._id ? styles.selected : ""}`}
                    onClick={() => {
                      setSelectedId(job._id);
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

            {next && listFilter === "all" && (
              <div className="flex items-center justify-center my-4">
                <Button
                  className="bg-[#1E69DA] py-2 px-6 text-white h-auto border-none hover:opacity-90"
                  onClick={handleLoadMore}
                  loading={loadingMore}
                >
                  Load more
                </Button>
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
                  <span className={styles.metaValue}>{selectedJob?.category || "Job"}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Function</span>
                  <span className={styles.metaValue}>{selectedJob?.profileName || "Engineering"}</span>
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
                          dangerouslySetInnerHTML={{ __html: selectedJob?.description || "No description available." }}
                        />
                      )
                    },
                    {
                      key: "hiring",
                      label: "Hiring Process",
                      children: (
                        <div 
                          className={styles.detailsSectionText}
                          dangerouslySetInnerHTML={{ __html: selectedJob?.hiringProcess || "Hiring process details are not provided." }}
                        />
                      )
                    },
                    {
                      key: "eligibility",
                      label: "Eligibility",
                      children: (
                        <div className={styles.detailsSectionText}>
                          <p><strong>Required Education:</strong> {selectedJob?.educationRequirement || "Open to all graduates"}</p>
                          <p><strong>Minimum Percentage:</strong> {selectedJob?.percentageRequirement ? `${selectedJob.percentageRequirement}%` : "No minimum cut-off"}</p>
                          <p><strong>Eligible Branches:</strong> {selectedJob?.branchRequirement || "All branches eligible"}</p>
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
