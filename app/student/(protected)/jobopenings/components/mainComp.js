"use client";
// ─────────────────────────────────────────────────────────────
// mainComp.js — Orchestrator with useOptimistic apply updates
// ─────────────────────────────────────────────────────────────
import React, { useEffect, useOptimistic, useState, useTransition } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, ConfigProvider, message, Result, Segmented } from "antd";
import { ApplyJob, GetAllJobs } from "@/redux/slices/jobopenings";

import { checkIfJobApplied } from "../utils/jobUtils";
import { JobListSkeleton, JobDetailsSkeleton } from "./skeletons";
import JobCard from "./JobCard";
import JobDetailsHeader from "./JobDetailsHeader";
import JobDetailsTabs from "./JobDetailsTabs";

export default function MainComp() {
  // ── Redux ──────────────────────────────────────────────────
  const { jobs: JOBS, next, nextCursor } = useSelector(
    (state) => state.jonOpenings.allJobOpenings?.value || { jobs: [], next: false, nextCursor: null }
  );
  const jobsStatus = useSelector((state) => state.jonOpenings.allJobOpenings?.status);
  const student    = useSelector((state) => state.student.student?.data);
  const dispatch   = useDispatch();

  const isFetching = jobsStatus === "pending";

  // ── Baseline applied IDs from Redux (real server state) ───
  const realAppliedIds = (student?.appliedJobs ?? [])
    .map((j) => j?.jobDetails?._id)
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
  const [selectedJob,    setSelectedJob]     = useState(null);
  const [activeTab,      setActiveTab]       = useState("overview");
  const [listFilter,     setListFilter]      = useState("all");
  const [loadingMore,    setLoadingMore]     = useState(false);
  const [isDeadlineOver, setIsDeadlineOver]  = useState(false);

  // ── Helper: check both real + optimistic applied state ────
  const isJobApplied = (jobId) =>
    optimisticAppliedIds.includes(jobId) ||
    checkIfJobApplied(jobId, student?.appliedJobs);

  // ── Derived list ───────────────────────────────────────────
  const filteredJobs = (
    listFilter === "applied"
      ? JOBS.filter((j) => isJobApplied(j._id))
      : JOBS
  ).filter((j) => j?.status !== "pending");

  // ── Auto-select first job on load ─────────────────────────
  useEffect(() => {
    if (!JOBS?.length) return;
    const stillExists = JOBS.some((j) => j._id === selectedId);
    if (!selectedId || !stillExists) setSelectedId(JOBS[0]?._id || "");
  }, [JOBS]);

  // ── Sync selectedJob when selection or list changes ───────
  useEffect(() => {
    const job = JOBS?.find((j) => j._id === selectedId) || null;
    setSelectedJob(job);
    setActiveTab("overview");
  }, [selectedId, JOBS]);

  // ── Load more ─────────────────────────────────────────────
  const handleLoadMore = async () => {
    setLoadingMore(true);
    await dispatch(GetAllJobs({ limit: 10, cursor: nextCursor }));
    setLoadingMore(false);
  };

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
          {isFetching && !JOBS.length ? (
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

          {next && listFilter === "all" && (
            <div className="flex items-center justify-center my-4">
              <Button
                className="bg-[#1E69DA] text-[18px] py-3 px-8 text-white h-auto border-none hover:opacity-90"
                onClick={handleLoadMore}
                loading={loadingMore}
              >
                Load more
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ════════ RIGHT: Job Details panel ════════ */}
      <div className="w-[70%] p-6 h-full overflow-hidden bg-white border border-[#e2e8f0] rounded-xl shadow-sm flex flex-col">
        {isFetching && !selectedJob ? (
          <JobDetailsSkeleton />
        ) : (
          <>
            <JobDetailsHeader
              job={selectedJob}
              student={student}
              isApplied={isJobApplied(selectedJob?._id)}  // ← optimistic-aware
              isDeadlineOver={isDeadlineOver}
              onDeadlineOver={setIsDeadlineOver}
              onApply={handleApply}
              applyPending={isPending}                     // ← transition pending
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
