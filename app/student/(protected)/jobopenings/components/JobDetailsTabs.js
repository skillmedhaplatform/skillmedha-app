"use client";
// ─────────────────────────────────────────────────────────────
// components/JobDetailsTabs.js  —  Single scrollable view (Redesigned)
// ─────────────────────────────────────────────────────────────
import React from "react";
import {
  TagOutlined,
  SolutionOutlined,
  EnvironmentOutlined,
  UserOutlined,
  LaptopOutlined,
  FileTextFilled,
  DollarCircleFilled,
  ProfileFilled,
  ApartmentOutlined,
  ReadOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";

// ── Section components ────────────────────────────────────

function OverviewSection({ job }) {
  const isClosed = job?.status === "closed" || false;

  return (
    <>
      {/* 6 Stats Row Card */}
      <div className="w-full bg-white border border-[#e2e8f0] rounded-[16px] p-4 lg:p-6 mb-4 lg:mb-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
        <div className="grid grid-cols-2 xl:grid-cols-6 gap-y-4 xl:gap-y-0">
          
          <div className="flex flex-col items-center text-center xl:border-r border-[#e2e8f0]">
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-[#eff6ff] flex items-center justify-center text-[#3b82f6] text-[16px] lg:text-[18px] mb-1.5 lg:mb-3">
              <TagOutlined />
            </div>
            <p className="text-[10px] lg:text-[11px] font-extrabold text-[#64748b] uppercase tracking-wider mb-1 m-0">Category</p>
            <p className="text-[13px] lg:text-[14px] font-bold text-[#0f172a] m-0">{job?.sector || "Not specified"}</p>
          </div>

          <div className="flex flex-col items-center text-center xl:border-r border-[#e2e8f0]">
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-[#f0fdf4] flex items-center justify-center text-[#22c55e] text-[16px] lg:text-[18px] mb-1.5 lg:mb-3">
              <SolutionOutlined />
            </div>
            <p className="text-[10px] lg:text-[11px] font-extrabold text-[#64748b] uppercase tracking-wider mb-1 m-0">Function</p>
            <p className="text-[13px] lg:text-[14px] font-bold text-[#0f172a] m-0">{job?.jobTitle || "Not specified"}</p>
          </div>

          <div className="flex flex-col items-center text-center xl:border-r border-[#e2e8f0]">
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-[#f3e8ff] flex items-center justify-center text-[#a855f7] text-[16px] lg:text-[18px] mb-1.5 lg:mb-3 font-serif">
              ₹
            </div>
            <p className="text-[10px] lg:text-[11px] font-extrabold text-[#64748b] uppercase tracking-wider mb-1 m-0">CTC</p>
            <p className="text-[13px] lg:text-[14px] font-bold text-[#0f172a] m-0">{job?.ctc ? `${job.ctc} LPA` : "Not Disclosed"}</p>
          </div>

          <div className="flex flex-col items-center text-center xl:border-r border-[#e2e8f0]">
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-[#fff7ed] flex items-center justify-center text-[#f97316] text-[16px] lg:text-[18px] mb-1.5 lg:mb-3">
              <EnvironmentOutlined />
            </div>
            <p className="text-[10px] lg:text-[11px] font-extrabold text-[#64748b] uppercase tracking-wider mb-1 m-0">Location</p>
            <p className="text-[13px] lg:text-[14px] font-bold text-[#0f172a] m-0">{job?.city || "Not specified"}</p>
          </div>

          <div className="flex flex-col items-center text-center xl:border-r border-[#e2e8f0]">
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-[#f8fafc] flex items-center justify-center text-[#64748b] text-[16px] lg:text-[18px] mb-1.5 lg:mb-3">
              <UserOutlined />
            </div>
            <p className="text-[10px] lg:text-[11px] font-extrabold text-[#64748b] uppercase tracking-wider mb-1 m-0">Job Type</p>
            <p className="text-[13px] lg:text-[14px] font-bold text-[#0f172a] m-0">{job?.jobType || "Not specified"}</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-[#ecfeff] flex items-center justify-center text-[#06b6d4] text-[16px] lg:text-[18px] mb-1.5 lg:mb-3">
              <LaptopOutlined />
            </div>
            <p className="text-[10px] lg:text-[11px] font-extrabold text-[#64748b] uppercase tracking-wider mb-1 m-0">Remote Work</p>
            <p className="text-[13px] lg:text-[14px] font-bold text-[#0f172a] m-0">{job?.remoteWorkAllowed !== undefined ? (job.remoteWorkAllowed ? "Yes" : "No") : "Not specified"}</p>
          </div>

        </div>
      </div>

      {/* Overview Card */}
      <div className="w-full bg-white border border-[#e2e8f0] rounded-[16px] p-6 mb-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#eff6ff] flex items-center justify-center text-[#1E69DA] text-[16px]">
            <FileTextFilled />
          </div>
          <h4 className="text-[18px] font-bold text-[#0f172a] m-0">Overview</h4>
        </div>
        
        {job?.streetAddress && (
          <div className="ml-11 mb-4 p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
            <p className="text-[12px] font-extrabold text-[#64748b] uppercase tracking-wider mb-1 m-0">Street Address</p>
            <p className="text-[14px] font-semibold text-[#0f172a] m-0">{job.streetAddress}</p>
          </div>
        )}

        <div className="ml-11">
          <p className="text-[15px] text-[#334155] leading-relaxed m-0 whitespace-pre-wrap">
            {job?.jobDescription || "No description provided."}
          </p>
        </div>
      </div>

      {/* Supplemental Pay Card */}
      {job?.supplementalPay && job.supplementalPay.length > 0 && (
        <div className="w-full bg-white border border-[#e2e8f0] rounded-[16px] p-6 mb-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-[#eff6ff] flex items-center justify-center text-[#1E69DA] text-[16px]">
              <DollarCircleFilled />
            </div>
            <h4 className="text-[18px] font-bold text-[#0f172a] m-0">Supplemental Pay</h4>
          </div>
          
          <div className="flex flex-wrap gap-2 lg:gap-4 ml-0 lg:ml-11 mt-4 lg:mt-0">
            {job.supplementalPay.map((pay, idx) => (
              <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-[#f8fafc] text-[#0f172a] rounded-full text-[13px] font-semibold border border-dashed border-[#cbd5e1]">
                <CheckCircleOutlined className="text-[#1E69DA]" />
                {typeof pay === "object" ? pay.value || pay.name || pay.label : pay}
              </div>
            ))}
          </div>
        </div>
      )}

      {isClosed && (
        <div className="w-full bg-[#fef2f2] rounded-[16px] p-4 border border-[#fca5a5] flex items-center justify-center text-center mb-6">
          <p className="text-[15px] font-bold text-[#ef4444] m-0">
            Application Closed
          </p>
        </div>
      )}
    </>
  );
}

function EligibilitySection({ job }) {
  return (
    <div className="w-full bg-white border border-[#e2e8f0] rounded-[16px] p-6 mb-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#f1f5f9]">
        <div className="w-8 h-8 rounded-lg bg-[#eff6ff] flex items-center justify-center text-[#1E69DA] text-[16px]">
          <ProfileFilled />
        </div>
        <h4 className="text-[18px] font-bold text-[#0f172a] m-0">Requirements & Eligibility</h4>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-8 ml-0 lg:ml-11 mt-4 lg:mt-0">
        {/* Applicable Courses Column */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <ReadOutlined className="text-[#1E69DA] text-[16px]" />
            <h4 className="font-bold text-[15px] text-[#1E69DA] m-0">Applicable Courses</h4>
          </div>
          
          {job?.applicableCourses && job.applicableCourses.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {job.applicableCourses.map((course, index) => (
                <span key={index} className="px-3 py-1 bg-[#f8fafc] text-[#334155] rounded-full text-[13px] font-medium border border-[#e2e8f0]">
                  {typeof course === "object" ? course.label || course.name : course}
                </span>
              ))}
            </div>
          ) : (
            <div className="p-4 border border-dashed border-[#cbd5e1] rounded-xl text-center">
              <p className="m-0 text-[#64748b] text-[14px]">No specific courses mentioned</p>
            </div>
          )}
        </div>

        {/* Eligibility Criteria Column */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <UserOutlined className="text-[#1E69DA] text-[16px]" />
            <h4 className="font-bold text-[15px] text-[#1E69DA] m-0">Eligibility Criteria</h4>
          </div>

          {job?.eligibilityCriteria?.length ? (
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-2">
              {job.eligibilityCriteria.map((item, index) => (
                <div key={index} className="flex flex-col gap-0">
                  <div className="flex items-center gap-4 p-3 border-b border-[#e2e8f0] last:border-b-0">
                    <div className="w-8 h-8 rounded-full bg-white border border-[#e2e8f0] flex items-center justify-center text-[#1E69DA]">
                      <ReadOutlined />
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-[14px] font-bold text-[#0f172a]">Education Level</span>
                      <span className="text-[14px] text-[#334155]">{item?.educationLevel || "N/A"}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-3 border-b border-[#e2e8f0] last:border-b-0">
                    <div className="w-8 h-8 rounded-full bg-white border border-[#e2e8f0] flex items-center justify-center text-[#1E69DA]">
                      <SafetyCertificateOutlined />
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-[14px] font-bold text-[#0f172a]">Minimum Marks Percentage</span>
                      <span className="text-[14px] text-[#334155]">{item?.minMarksPercentage || "N/A"}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 border border-dashed border-[#cbd5e1] rounded-xl text-center">
              <p className="m-0 text-[#64748b] text-[14px]">No eligibility criteria specified.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HiringSection({ job }) {
  return (
    <div className="w-full bg-white border border-[#e2e8f0] rounded-[16px] p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#f1f5f9]">
        <div className="w-8 h-8 rounded-lg bg-[#eff6ff] flex items-center justify-center text-[#1E69DA] text-[16px]">
          <ApartmentOutlined />
        </div>
        <h4 className="text-[18px] font-bold text-[#0f172a] m-0">Hiring Workflow</h4>
      </div>

      <div className="ml-0 lg:ml-11 mt-4 lg:mt-0">
        {job?.interviewRounds?.length ? (
          <div className="flex flex-col gap-3">
            {job.interviewRounds.map((round, index) => (
              <div key={index} className="w-full flex p-3 lg:p-4 border border-solid border-[#e2e8f0] rounded-xl shadow-sm bg-[#f8fafc]">
                <p className="font-semibold m-0 text-[#0f172a]">
                  Round {index + 1}: {round?.roundName}
                  <span className="block font-normal text-[#334155] mt-1 text-[14px]">{round?.description}</span>
                  {round?.mode && <span className="block font-normal text-[#64748b] mt-2 text-[13px] bg-white px-2 py-1 rounded border border-[#e2e8f0] inline-block">Mode: {round.mode} {round?.venue ? ` | Venue: ${round.venue}` : ''}</span>}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 lg:p-6 border border-dashed border-[#cbd5e1] rounded-xl flex items-center gap-4 bg-[#f8fafc]">
            <div className="flex-1">
              <h4 className="text-[16px] font-bold text-[#0f172a] m-0 mb-1">No interview rounds specified.</h4>
              <p className="m-0 text-[#64748b] text-[14px]">Details about the hiring workflow will be updated soon.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────
export default function JobDetailsTabs({ job }) {
  return (
    <div className="h-full w-full flex flex-col overflow-y-auto pr-2 pb-10 [&::-webkit-scrollbar]:w-[5px]">
      <OverviewSection job={job} />
      <EligibilitySection job={job} />
      <HiringSection job={job} />
    </div>
  );
}
