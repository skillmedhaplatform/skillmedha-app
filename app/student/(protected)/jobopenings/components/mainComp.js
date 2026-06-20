"use client";
// ─────────────────────────────────────────────────────────────
// mainComp.js — Orchestrator with useOptimistic apply updates
// ─────────────────────────────────────────────────────────────
import React, { useEffect, useOptimistic, useState, useTransition } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, ConfigProvider, message, Result, Segmented, Select } from "antd";
import { ApplyJob, GetAllJobs } from "@/redux/slices/jobopenings";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

import { checkIfJobApplied } from "../utils/jobUtils";
import { JobListSkeleton, JobDetailsSkeleton } from "./skeletons";
import JobCard from "./JobCard";
import JobDetailsHeader from "./JobDetailsHeader";
import JobDetailsTabs from "./JobDetailsTabs";

export default function MainComp() {
  // ── Redux ──────────────────────────────────────────────────
  const { jobs: JOBS, pagination = { totalDocs: 0, totalPages: 1, currentPage: 1, limit: 10 } } = useSelector(
    (state) => state.jonOpenings.allJobOpenings?.value || { jobs: [], pagination: { totalDocs: 0, totalPages: 1, currentPage: 1, limit: 10 } }
  );
  const jobsStatus = useSelector((state) => state.jonOpenings.allJobOpenings?.status);
  const student    = useSelector((state) => state.student.student?.data);
  const dispatch   = useDispatch();

  const isFetching = jobsStatus === "pending";

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // ── Baseline applied IDs from Redux (real server state) ───
  const realAppliedIds = (student?.appliedJobs ?? [])
    .map((j) => j?.jobDetails?._id || j?.id || j?.jobId || j?._id || (typeof j === "string" ? j : null))
    .filter(Boolean);

  // ── useOptimistic: instant UI update, rolls back on failure ──
  // Reducer: adds a job ID to the optimistic list immediately
  const [optimisticAppliedIds, addOptimisticApply] = useOptimistic(
    realAppliedIds,
    (current, newJobId) => [...current, newJobId]
  );

  // useTransition: non-blocking apply — keeps UI responsive during API call
  const [isPending, startTransition] = useTransition();

  // ── UI state ───────────────────────────────────────────────
  const [selectedId,     setSelectedId]     = useState("");
  const [activeTab,      setActiveTab]       = useState("overview");
  const [listFilter,     setListFilter]      = useState("all");
  const [appliedPage,    setAppliedPage]     = useState(1);
  const [appliedLimit,   setAppliedLimit]    = useState(10);

  // ── Derived applied jobs list with local filters ───────────
  const searchParam = searchParams.get("search") || "";
  const profileNameParam = searchParams.get("profileName") || "all";
  const sortParam = searchParams.get("sort") || "createdAt";

  useEffect(() => {
    setAppliedPage(1);
  }, [searchParam, profileNameParam, listFilter]);

  // ── Helper: check both real + optimistic applied state ────
  const isJobApplied = (jobId) =>
    optimisticAppliedIds.includes(jobId) ||
    checkIfJobApplied(jobId, student?.appliedJobs);

  const appliedJobsList = (student?.appliedJobs || [])
    .map((aj) => {
      const jobId = aj?.jobDetails?._id || aj?.id || aj?.jobId || aj?._id || (typeof aj === "string" ? aj : null);
      if (!jobId) return null;
      const localDetails = JOBS.find((job) => String(job._id) === String(jobId));
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

  const appliedTotalDocs = appliedJobsList.length;
  const appliedTotalPages = Math.ceil(appliedTotalDocs / appliedLimit) || 1;
  const paginatedAppliedJobs = appliedJobsList.slice(
    (appliedPage - 1) * appliedLimit,
    appliedPage * appliedLimit
  );

  const filteredJobs = listFilter === "applied" ? paginatedAppliedJobs : JOBS.filter((j) => j?.status !== "pending");

  const selectedJob = filteredJobs?.find((j) => j._id === selectedId) || null;

  // ── Auto-select first job on load ─────────────────────────
  useEffect(() => {
    if (!filteredJobs?.length) return;
    const stillExists = filteredJobs.some((j) => j._id === selectedId);
    if (!selectedId || !stillExists) setSelectedId(filteredJobs[0]?._id || "");
  }, [filteredJobs]);

  // ── Reset active tab when selected ID changes ─────────────
  useEffect(() => {
    setActiveTab("overview");
  }, [selectedId]);

  // ── Apply with optimistic update ──────────────────────────
  const handleApply = () => {
    if (!selectedJob || !student) return;

    startTransition(async () => {
      // 1. Immediately show "Already Applied" — no wait
      addOptimisticApply(selectedJob._id);

      // 2. Fire real API in background
      const result = await dispatch(
        ApplyJob({ jobid: selectedJob._id, studentId: student._id, dispatch })
      );

      // 3. If API failed, useOptimistic auto-rolls back to realAppliedIds
      if (result?.error) {
        message.error("Failed to apply. Please try again.");
      }
    });
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="flex items-start h-full gap-4">

      {/* ════════ LEFT: Job List panel ════════ */}
      <div className="w-[30%] min-w-[300px] h-full flex flex-col gap-4 overflow-hidden bg-white border border-[#e2e8f0] rounded-xl shadow-sm p-4">

        {/* List filter — antd Segmented (themed) */}
        <div className="mb-0">
          <ConfigProvider
            theme={{
              components: {
                Segmented: {
                  itemSelectedBg:    "linear-gradient(to bottom right, #1E69DA, #5694F0)",
                  itemSelectedColor: "#ffffff",
                  itemActiveBg:      "linear-gradient(to bottom right, #1E69DA, #5694F0)",
                  trackBg:           "rgba(30,105,218,0.1)",
                  fontSize:          15,
                },
              },
            }}
          >
            <Segmented
              block
              value={listFilter}
              onChange={setListFilter}
              options={[
                { label: "All Jobs",     value: "all"     },
                { label: "Applied Jobs", value: "applied" },
              ]}
              style={{ fontWeight: 600, padding: "3px" }}
            />
          </ConfigProvider>
        </div>

        <div className="overflow-y-auto flex-1 flex flex-col gap-3 pb-4 cursor-pointer [&::-webkit-scrollbar]:w-[4px]">
          {isFetching && !filteredJobs.length ? (
            Array.from({ length: 6 }).map((_, i) => <JobListSkeleton key={i} />)
          ) : filteredJobs.length === 0 ? (
            <Result
              status="404"
              title="No Jobs Found"
              subTitle="Try adjusting your filters or search term. New openings are added regularly!"
            />
          ) : (
            filteredJobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                isSelected={selectedId === job._id}
                onSelect={setSelectedId}
                isApplied={isJobApplied(job._id)}   // ← optimistic-aware
              />
            ))
          )}
        </div>

        {/* ── Pagination ── */}
        {((listFilter === "all" && pagination) || listFilter === "applied") && (
          <div className="flex flex-col gap-3 pt-3 border-t border-[#e2e8f0] bg-white">
            {/* Top row: items per page and showing info */}
            <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
              <div className="flex items-center gap-1.5">
                <span>Show:</span>
                <Select
                  size="small"
                  value={listFilter === "all" ? pagination.limit : appliedLimit}
                  onChange={(val) => {
                    if (listFilter === "all") {
                      const params = new URLSearchParams(searchParams);
                      params.set("limit", String(val));
                      params.set("page", "1");
                      router.push(pathname + "?" + params.toString().replace(/\+/g, "%20"));
                    } else {
                      setAppliedLimit(val);
                      setAppliedPage(1);
                    }
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
                Showing {listFilter === "all"
                  ? (pagination.totalDocs === 0 ? 0 : Math.min(pagination.totalDocs, (pagination.currentPage - 1) * pagination.limit + 1))
                  : (appliedTotalDocs === 0 ? 0 : Math.min(appliedTotalDocs, (appliedPage - 1) * appliedLimit + 1))}–
                {listFilter === "all"
                  ? Math.min(pagination.totalDocs, pagination.currentPage * pagination.limit)
                  : Math.min(appliedTotalDocs, appliedPage * appliedLimit)} of {listFilter === "all" ? pagination.totalDocs : appliedTotalDocs}
              </span>
            </div>

            {/* Bottom row: Page buttons */}
            <div className="flex items-center justify-center gap-1">
              <Button
                size="small"
                disabled={listFilter === "all" ? pagination.currentPage === 1 : appliedPage === 1}
                onClick={() => {
                  if (listFilter === "all") {
                    const params = new URLSearchParams(searchParams);
                    params.set("page", String(pagination.currentPage - 1));
                    router.push(pathname + "?" + params.toString().replace(/\+/g, "%20"));
                  } else {
                    setAppliedPage(p => Math.max(1, p - 1));
                  }
                }}
              >
                ‹
              </Button>

              {Array.from({ length: listFilter === "all" ? pagination.totalPages : appliedTotalPages }, (_, i) => {
                const pageNum = i + 1;
                const totalPgs = listFilter === "all" ? pagination.totalPages : appliedTotalPages;
                const currPage = listFilter === "all" ? pagination.currentPage : appliedPage;

                // Limit showing max 5 pages around current page
                if (
                  totalPgs > 5 &&
                  Math.abs(currPage - pageNum) > 2 &&
                  pageNum !== 1 &&
                  pageNum !== totalPgs
                ) {
                  if (
                    (pageNum === 2 && currPage > 4) ||
                    (pageNum === totalPgs - 1 && currPage < totalPgs - 3)
                  ) {
                    return <span key={pageNum} className="text-gray-400 px-0.5">...</span>;
                  }
                  return null;
                }

                return (
                  <Button
                    key={pageNum}
                    size="small"
                    type={currPage === pageNum ? "primary" : "default"}
                    className={
                      currPage === pageNum
                        ? "!bg-gradient-to-br !from-[#1E69DA] !to-[#5694F0] !border-none !text-white"
                        : ""
                    }
                    onClick={() => {
                      if (listFilter === "all") {
                        const params = new URLSearchParams(searchParams);
                        params.set("page", String(pageNum));
                        router.push(pathname + "?" + params.toString().replace(/\+/g, "%20"));
                      } else {
                        setAppliedPage(pageNum);
                      }
                    }}
                  >
                    {pageNum}
                  </Button>
                );
              })}

              <Button
                size="small"
                disabled={listFilter === "all" 
                  ? pagination.currentPage === pagination.totalPages || pagination.totalPages === 0
                  : appliedPage === appliedTotalPages || appliedTotalPages === 0}
                onClick={() => {
                  if (listFilter === "all") {
                    const params = new URLSearchParams(searchParams);
                    params.set("page", String(pagination.currentPage + 1));
                    router.push(pathname + "?" + params.toString().replace(/\+/g, "%20"));
                  } else {
                    setAppliedPage(p => Math.min(appliedTotalPages, p + 1));
                  }
                }}
              >
                ›
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ════════ RIGHT: Job Details panel ════════ */}
      <div className="w-[70%] p-6 h-full overflow-hidden bg-white border border-[#e2e8f0] rounded-xl shadow-sm flex flex-col">
        {isFetching && !selectedJob ? (
          <JobDetailsSkeleton />
        ) : (
          <>
            <JobDetailsHeader
              key={selectedJob?._id}
              job={selectedJob}
              student={student}
              isApplied={isJobApplied(selectedJob?._id)}
              onApply={handleApply}
              applyPending={isPending}
            />
            <JobDetailsTabs
              job={selectedJob}
              selectedTab={activeTab}
              onTabChange={setActiveTab}
            />
          </>
        )}
      </div>

    </div>
  );
}
