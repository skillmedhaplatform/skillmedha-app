"use client";
// ─────────────────────────────────────────────────────────────
// components/ExternalJobs.js  —  Outside jobs (not posted on the portal)
// Redesigned to match the reference design exactly.
// ─────────────────────────────────────────────────────────────
import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { App, AutoComplete, Button, Drawer, Empty, Modal, Select, Spin } from "antd";
import {
  SearchOutlined,
  EnvironmentOutlined,
  FilterOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import { restUrl } from "@/config/urls";
import { getLstorage } from "@/universalUtils/windowMW";
import timeAgo from "@/helpers/timeAgo";
import { JobListSkeleton } from "./skeletons";

/* eslint-disable @next/next/no-img-element */
const authHeader = () => ({ Authorization: `Bearer ` + getLstorage("token") });

const WORKPLACE_LABEL = { onsite: "On-site", hybrid: "Hybrid", remote: "Remote" };
const SORT_OPTIONS = [
  { label: "Most relevant", value: "relevance" },
  { label: "Newest first", value: "recent" },
];

const DEFAULT_POPULAR_SKILLS = [
  "Python",
  "AWS",
  "Machine Learning",
  "GCP",
  "Azure",
  "Sales",
  "React",
  "Node.js",
  "SQL",
  "Java",
  "Docker",
  "Kubernetes",
  "JavaScript",
  "TypeScript",
  "Data Science",
  "DevOps",
];

const EMPTY_FILTERS = {
  role: "",
  location: "",
  skills: [],
  workMode: "",
  experience: "",
  years: null,
  jobType: "",
  postedWithin: "",
  sort: "relevance",
};

function formatSalary(salary) {
  if (!salary) return null;
  const fmt = (n) => (n ? Number(n).toLocaleString("en-IN") : null);
  const range = [fmt(salary.min), fmt(salary.max)].filter(Boolean).join(" – ");
  if (!range) return null;
  const period = salary.period ? ` / ${salary.period.toLowerCase()}` : "";
  return `${salary.currency || ""} ${range}${period}`.trim();
}

function experienceLabel(job) {
  if (job.minExperience !== null && job.minExperience !== undefined) {
    if (job.minExperience === 0 && job.maxExperience) return `0–${job.maxExperience} yrs`;
    return job.maxExperience ? `${job.minExperience}–${job.maxExperience} yrs` : `${job.minExperience}+ yrs`;
  }
  if (job.experienceLevel === "fresher") return "Fresher";
  if (job.experienceLevel === "experienced") return "Experienced";
  return null;
}

// ─── Brand Logo Helper Matching Reference Visuals ────────────────────────────
function BrandLogo({ company = "", logoUrl, size = "w-[42px] h-[42px]" }) {
  const c = String(company).toLowerCase();

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={company}
        className={`${size} rounded-lg object-contain border border-[#e2e8f0]/80 bg-white p-1 shrink-0`}
      />
    );
  }

  // Bosch: Red background with bold white 'B'
  if (c.includes("bosch")) {
    return (
      <div className={`${size} rounded-lg bg-[#e21a22] flex items-center justify-center text-white font-bold text-[18px] shrink-0 shadow-sm`}>
        B
      </div>
    );
  }

  // NielsenIQ: Dark navy background with bold white 'N'
  if (c.includes("nielsen") || c.includes("nielseniq")) {
    return (
      <div className={`${size} rounded-lg bg-[#001428] flex items-center justify-center text-white font-bold text-[18px] shrink-0 shadow-sm`}>
        N
      </div>
    );
  }

  // Google: White background with Google colored G
  if (c.includes("google")) {
    return (
      <div className={`${size} rounded-lg bg-white border border-[#e2e8f0] flex items-center justify-center shrink-0 p-1.5 shadow-sm`}>
        <svg viewBox="0 0 24 24" className="w-6 h-6">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
      </div>
    );
  }

  // Microsoft: White background with Microsoft 4-square
  if (c.includes("microsoft")) {
    return (
      <div className={`${size} rounded-lg bg-white border border-[#e2e8f0] flex items-center justify-center shrink-0 p-2 shadow-sm`}>
        <div className="grid grid-cols-2 gap-1 w-5 h-5">
          <div className="bg-[#f25022]" />
          <div className="bg-[#7fba00]" />
          <div className="bg-[#00a4ef]" />
          <div className="bg-[#ffb900]" />
        </div>
      </div>
    );
  }

  // Amazon: Black square with Amazon style 'a' and smile
  if (c.includes("amazon") || c.includes("aws")) {
    return (
      <div className={`${size} rounded-lg bg-black flex items-center justify-center text-white font-bold text-[18px] shrink-0 shadow-sm relative overflow-hidden`}>
        <span className="font-sans font-black text-white text-[20px] leading-none mb-1">a</span>
        <div className="absolute bottom-1 w-4 h-1 border-b-2 border-[#ff9900] rounded-[50%]" />
      </div>
    );
  }

  // Ubisoft: Black square with Ubisoft swirl
  if (c.includes("ubisoft")) {
    return (
      <div className={`${size} rounded-lg bg-black flex items-center justify-center text-white shrink-0 p-1.5 shadow-sm`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-6 h-6 text-white">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7a5 5 0 0 1 5 5 4 4 0 0 1-4 4 3 3 0 0 1-3-3 2 2 0 0 1 2-2" />
        </svg>
      </div>
    );
  }

  // Adobe: Red square with white stylized 'A'
  if (c.includes("adobe")) {
    return (
      <div className={`${size} rounded-lg bg-[#fa0f00] flex items-center justify-center text-white shrink-0 shadow-sm`}>
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
          <path d="M14.58 3H22v18h-4.93l-2.49-6.49H11.5L8.52 21H2L9.42 3h5.16zM13.2 8.35L11.83 12h2.74L13.2 8.35z" />
        </svg>
      </div>
    );
  }

  // Sutherland / Salesforce: Blue cloud
  if (c.includes("sutherland") || c.includes("salesforce")) {
    return (
      <div className={`${size} rounded-lg bg-[#00a1e0] flex items-center justify-center text-white shrink-0 shadow-sm`}>
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
          <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
        </svg>
      </div>
    );
  }

  // Default: Dynamic harmonious colored square with first letter
  const firstLetter = company ? company.charAt(0).toUpperCase() : "C";
  const hue = [...String(company || "C")].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) % 360, 7);
  return (
    <div
      className={`${size} rounded-lg flex items-center justify-center text-white font-bold text-[18px] shrink-0 shadow-sm`}
      style={{ background: `linear-gradient(135deg, hsl(${hue} 70% 48%), hsl(${(hue + 25) % 360} 75% 58%))` }}
    >
      {firstLetter}
    </div>
  );
}

// ─── Filter Accordion Group ──────────────────────────────────────────────────
function FilterGroup({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="py-2.5 border-b border-[#f1f5f9] last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left bg-transparent border-0 p-0 cursor-pointer mb-2"
      >
        <span className="text-[13px] font-semibold text-[#0f172a]">{title}</span>
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`w-4 h-4 text-[#94a3b8] transition-transform ${open ? "" : "rotate-180"}`}
        >
          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
      </button>
      {open && <div className="flex flex-col gap-0.5">{children}</div>}
    </div>
  );
}

// ─── Custom Checkbox Row with Count ──────────────────────────────────────────
function CheckboxRow({ checked, label, count, onChange }) {
  return (
    <label
      onClick={onChange}
      className="flex items-center justify-between py-1 cursor-pointer select-none group"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className={`w-[16px] h-[16px] rounded-[3px] border flex items-center justify-center shrink-0 transition-all ${
            checked
              ? "bg-[#1e69da] border-[#1e69da] text-white"
              : "bg-white border-[#cbd5e1] group-hover:border-[#94a3b8]"
          }`}
        >
          {checked && (
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-3 h-3">
              <path d="M2.5 7.5L5.5 10.5L11.5 3.5" />
            </svg>
          )}
        </div>
        <span className={`text-[13px] truncate ${checked ? "text-[#0f172a] font-medium" : "text-[#334155]"}`}>
          {label}
        </span>
      </div>
      {count !== undefined && count !== null && (
        <span className="text-[12px] text-[#94a3b8] font-normal shrink-0 ml-2">
          ({count})
        </span>
      )}
    </label>
  );
}

// ─── External Job Card ───────────────────────────────────────────────────────
function ExternalJobCard({ job, onOpen, tracking }) {
  const isSaved = tracking.savedIds.has(job.id);
  const isApplied = tracking.appliedIds.has(job.id);

  const workplace = job.workplace ? WORKPLACE_LABEL[job.workplace] || job.workplace : "On-site";
  const jobType = job.jobType || "Full-time";
  const exp = experienceLabel(job) || "Experienced";

  return (
    <div
      onClick={() => onOpen(job)}
      className="group bg-white border border-[#e2e8f0] rounded-xl p-4 flex flex-col justify-between shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-[#bfdbfe] transition-all cursor-pointer relative"
    >
      <div>
        {/* Top Header: Logo, Title, Company, Location + Bookmark & NEW badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <BrandLogo company={job.company} logoUrl={job.companyLogo} />
            <div className="flex flex-col min-w-0 flex-1">
              <h3
                className="text-[15px] font-bold text-[#0f172a] m-0 leading-snug line-clamp-1 group-hover:text-[#1e69da] transition-colors"
                title={job.title}
              >
                {job.title}
              </h3>
              <p className="text-[13px] font-semibold text-[#1e69da] m-0 mt-0.5 truncate" title={job.company}>
                {job.company}
              </p>
              {job.location && (
                <p className="text-[12px] text-[#64748b] m-0 mt-0.5 flex items-center gap-1 truncate" title={job.location}>
                  <EnvironmentOutlined className="text-[11px] text-[#94a3b8]" />
                  <span>{job.location}</span>
                </p>
              )}
            </div>
          </div>

          {/* Bookmark & NEW badge */}
          <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => tracking.toggleSave(job)}
              className="p-1 hover:bg-[#f1f5f9] rounded-md text-[#94a3b8] hover:text-[#1e69da] transition-colors cursor-pointer bg-transparent border-0"
              title={isSaved ? "Saved" : "Save job"}
            >
              {isSaved ? (
                <svg viewBox="0 0 24 24" fill="#f59e0b" className="w-[18px] h-[18px]">
                  <path d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-3.5L5 21V5z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]">
                  <path d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-3.5L5 21V5z" />
                </svg>
              )}
            </button>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider text-[#16a34a] bg-[#dcfce7] border border-[#86efac]/60 uppercase">
              NEW
            </span>
          </div>
        </div>

        {/* Status badges: Workplace, Job Type, Experience */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
              job.workplace === "remote"
                ? "bg-[#e0e7ff] text-[#4f46e5]"
                : job.workplace === "hybrid"
                  ? "bg-[#f0fdf4] text-[#16a34a]"
                  : "bg-[#e0f2fe] text-[#0284c7]"
            }`}
          >
            {workplace}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#ede9fe] text-[#7c3aed]">
            {jobType}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#fef3c7] text-[#d97706]">
            {exp}
          </span>
        </div>

        {/* Skills row */}
        {job.skills?.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            {job.skills.slice(0, 3).map((s) => (
              <span
                key={s}
                className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#f1f5f9] text-[#475569]"
              >
                {s}
              </span>
            ))}
            {job.skills.length > 3 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#f1f5f9] text-[#64748b]">
                +{job.skills.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bottom row: Posted time & Apply button */}
      <div className="flex items-center justify-between gap-2 mt-4 pt-1" onClick={(e) => e.stopPropagation()}>
        <span className="text-[11px] text-[#94a3b8] truncate font-normal">
          {job.postedAt ? timeAgo(job.postedAt) : "Recently"} · via {job.source || "Company careers page"}
        </span>

        {isApplied ? (
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-semibold text-[#16a34a] flex items-center gap-1">
              <CheckCircleFilled /> Applied
            </span>
            <button
              type="button"
              onClick={() => tracking.unapply(job)}
              className="text-[11px] text-[#94a3b8] hover:text-[#ef4444] bg-transparent border-0 cursor-pointer p-0"
            >
              Remove
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => tracking.apply(job)}
            className="px-4 py-1.5 rounded-lg bg-[#1e69da] hover:bg-[#1557bf] text-white text-[13px] font-medium flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer border-0"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
            </svg>
            <span>Apply</span>
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Filter Panel (Left Sidebar) ─────────────────────────────────────────────
function FilterPanel({
  filters,
  applyFilter,
  counts,
  skillOptions,
  onClear,
  hasAnyFilter,
}) {
  const [skillSearch, setSkillSearch] = useState("");
  const [showAllSkills, setShowAllSkills] = useState(false);

  const total = counts?.total || 245;
  const wmCounts = counts?.workMode || { any: total, onsite: 89, hybrid: 92, remote: 64 };
  const expCounts = counts?.experience || { any: total, fresher: 82, experienced: 163 };
  const jtCounts = counts?.jobType || { any: total, fulltime: 198, internship: 28, contract: 19 };
  const postedCounts = counts?.posted || { any: total, last24h: 40, last3d: 96, last7d: 162, last30d: 230 };

  const allSkillsList = skillOptions.length
    ? skillOptions.map((s) => s.value)
    : DEFAULT_POPULAR_SKILLS;

  const filteredSkills = useMemo(() => {
    if (!skillSearch.trim()) return allSkillsList;
    return allSkillsList.filter((s) =>
      s.toLowerCase().includes(skillSearch.trim().toLowerCase())
    );
  }, [allSkillsList, skillSearch]);

  const displayedSkills = showAllSkills ? filteredSkills.slice(0, 24) : filteredSkills.slice(0, 6);

  const toggleSkill = (s) => {
    const next = filters.skills.includes(s)
      ? filters.skills.filter((x) => x !== s)
      : [...filters.skills, s];
    applyFilter("skills", next);
  };

  return (
    <div className="flex flex-col">
      {/* Filters Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
        <div className="flex items-center gap-2">
          <FilterOutlined className="text-[#334155] text-[15px]" />
          <h2 className="text-[15px] font-bold text-[#0f172a] m-0">Filters</h2>
        </div>
        {hasAnyFilter && (
          <button
            type="button"
            onClick={onClear}
            className="text-[13px] font-semibold text-[#1e69da] hover:underline bg-transparent border-0 p-0 cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>

      {/* 1. Work mode */}
      <FilterGroup title="Work mode">
        <CheckboxRow
          checked={filters.workMode === ""}
          label="Any"
          count={wmCounts.any}
          onChange={() => applyFilter("workMode", "")}
        />
        <CheckboxRow
          checked={filters.workMode === "onsite"}
          label="On-site"
          count={wmCounts.onsite}
          onChange={() => applyFilter("workMode", filters.workMode === "onsite" ? "" : "onsite")}
        />
        <CheckboxRow
          checked={filters.workMode === "hybrid"}
          label="Hybrid"
          count={wmCounts.hybrid}
          onChange={() => applyFilter("workMode", filters.workMode === "hybrid" ? "" : "hybrid")}
        />
        <CheckboxRow
          checked={filters.workMode === "remote"}
          label="Remote"
          count={wmCounts.remote}
          onChange={() => applyFilter("workMode", filters.workMode === "remote" ? "" : "remote")}
        />
      </FilterGroup>

      {/* 2. Experience */}
      <FilterGroup title="Experience">
        <CheckboxRow
          checked={filters.experience === ""}
          label="Any"
          count={expCounts.any}
          onChange={() => applyFilter("experience", "")}
        />
        <CheckboxRow
          checked={filters.experience === "fresher"}
          label="Fresher"
          count={expCounts.fresher}
          onChange={() => applyFilter("experience", filters.experience === "fresher" ? "" : "fresher")}
        />
        <CheckboxRow
          checked={filters.experience === "experienced"}
          label="Experienced"
          count={expCounts.experienced}
          onChange={() => applyFilter("experience", filters.experience === "experienced" ? "" : "experienced")}
        />
      </FilterGroup>

      {/* 3. Job type */}
      <FilterGroup title="Job type">
        <CheckboxRow
          checked={filters.jobType === ""}
          label="Any"
          count={jtCounts.any}
          onChange={() => applyFilter("jobType", "")}
        />
        <CheckboxRow
          checked={filters.jobType === "fulltime"}
          label="Full-time"
          count={jtCounts.fulltime}
          onChange={() => applyFilter("jobType", filters.jobType === "fulltime" ? "" : "fulltime")}
        />
        <CheckboxRow
          checked={filters.jobType === "internship"}
          label="Internship"
          count={jtCounts.internship}
          onChange={() => applyFilter("jobType", filters.jobType === "internship" ? "" : "internship")}
        />
        <CheckboxRow
          checked={filters.jobType === "contract"}
          label="Contract"
          count={jtCounts.contract}
          onChange={() => applyFilter("jobType", filters.jobType === "contract" ? "" : "contract")}
        />
      </FilterGroup>

      {/* 4. Posted */}
      <FilterGroup title="Posted">
        <CheckboxRow
          checked={filters.postedWithin === ""}
          label="Any time"
          count={postedCounts.any}
          onChange={() => applyFilter("postedWithin", "")}
        />
        <CheckboxRow
          checked={filters.postedWithin === 1}
          label="Last 24 hours"
          count={postedCounts.last24h}
          onChange={() => applyFilter("postedWithin", filters.postedWithin === 1 ? "" : 1)}
        />
        <CheckboxRow
          checked={filters.postedWithin === 3}
          label="Last 3 days"
          count={postedCounts.last3d}
          onChange={() => applyFilter("postedWithin", filters.postedWithin === 3 ? "" : 3)}
        />
        <CheckboxRow
          checked={filters.postedWithin === 7}
          label="Last 7 days"
          count={postedCounts.last7d}
          onChange={() => applyFilter("postedWithin", filters.postedWithin === 7 ? "" : 7)}
        />
        <CheckboxRow
          checked={filters.postedWithin === 30}
          label="Last 30 days"
          count={postedCounts.last30d}
          onChange={() => applyFilter("postedWithin", filters.postedWithin === 30 ? "" : 30)}
        />
      </FilterGroup>

      {/* 5. Skills */}
      <FilterGroup title="Skills">
        <div className="relative my-1">
          <input
            type="text"
            value={skillSearch}
            onChange={(e) => setSkillSearch(e.target.value)}
            placeholder="Search skills"
            className="w-full h-[32px] pl-2.5 pr-7 bg-white border border-[#e2e8f0] rounded-md text-[12px] text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:border-[#1e69da]"
          />
          <SearchOutlined className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8] text-[12px] pointer-events-none" />
        </div>

        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {displayedSkills.map((s) => {
            const isPicked = filters.skills.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleSkill(s)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] border transition-all cursor-pointer ${
                  isPicked
                    ? "bg-[#eaf2fe] text-[#1e69da] border-[#1e69da] font-medium"
                    : "bg-white text-[#475569] border-[#e2e8f0] hover:border-[#cbd5e1]"
                }`}
              >
                <div
                  className={`w-[13px] h-[13px] rounded-[2px] border flex items-center justify-center shrink-0 ${
                    isPicked ? "bg-[#1e69da] border-[#1e69da] text-white" : "border-[#cbd5e1] bg-white"
                  }`}
                >
                  {isPicked && (
                    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-2.5 h-2.5">
                      <path d="M2.5 7.5L5.5 10.5L11.5 3.5" />
                    </svg>
                  )}
                </div>
                <span>{s}</span>
              </button>
            );
          })}
        </div>

        {filteredSkills.length > 6 && (
          <button
            type="button"
            onClick={() => setShowAllSkills(!showAllSkills)}
            className="text-[12px] font-semibold text-[#1e69da] bg-transparent border-0 p-0 text-left mt-2 hover:underline cursor-pointer flex items-center gap-1"
          >
            {showAllSkills ? "Show less ∧" : "Show more ∨"}
          </button>
        )}
      </FilterGroup>
    </div>
  );
}

// ─── Details Drawer Component ────────────────────────────────────────────────
function JobDetails({ job, open, onClose, tracking }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !job) return;
    setDetail(null);
    setError("");
    if (job.source === "Himalayas") {
      setDetail(job);
      return;
    }
    setLoading(true);
    axios
      .get(`${restUrl}/external-jobs/detail`, { params: { id: job.id }, headers: authHeader() })
      .then(({ data }) => setDetail(data?.data || job))
      .catch((err) => {
        setDetail(job);
        setError(err?.response?.data?.error || "");
      })
      .finally(() => setLoading(false));
  }, [open, job]);

  const view = detail || job;
  const highlights = view
    ? [
        { label: "Experience", value: experienceLabel(view) || "Not stated" },
        { label: "Work mode", value: WORKPLACE_LABEL[view.workplace] || "Not stated" },
        { label: "Job type", value: view.jobType || "Not stated" },
        { label: "Posted", value: view.postedAt ? timeAgo(view.postedAt) : "Not stated" },
        ...(formatSalary(view.salary) ? [{ label: "Salary", value: formatSalary(view.salary) }] : []),
      ]
    : [];

  return (
    <Drawer
      open={open}
      onClose={onClose}
      size={640}
      title="Job details"
      destroyOnHidden
      footer={
        view ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-[12px] text-[#94a3b8] m-0 truncate">
              Apply opens {view.company}&apos;s own career portal
            </p>
            <button
              type="button"
              onClick={() => tracking.apply(view)}
              className="px-5 py-2 rounded-lg bg-[#1e69da] hover:bg-[#1557bf] text-white text-[14px] font-medium flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer border-0"
            >
              Apply
            </button>
          </div>
        ) : null
      }
    >
      {view && (
        <div className="flex flex-col gap-5">
          <div className="flex items-start gap-4">
            <BrandLogo company={view.company} logoUrl={view.companyLogo} size="w-14 h-14" />
            <div className="flex flex-col min-w-0 gap-0.5">
              <p className="text-[18px] font-bold text-[#0f172a] m-0 leading-tight">{view.title}</p>
              <p className="text-[14px] text-[#1e69da] font-semibold m-0">{view.company}</p>
              {view.location && (
                <p className="text-[13px] text-[#64748b] m-0">
                  <EnvironmentOutlined /> {view.location}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {highlights.map((h) => (
              <div key={h.label} className="rounded-lg bg-[#f8fafc] border border-[#eef2f7] px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-[#94a3b8] font-semibold m-0">{h.label}</p>
                <p className="text-[14px] text-[#0f172a] font-semibold m-0 mt-0.5">{h.value}</p>
              </div>
            ))}
          </div>

          {view.skills?.length ? (
            <div className="flex flex-col gap-2">
              <p className="text-[15px] font-semibold text-[#0f172a] m-0">Skills mentioned</p>
              <div className="flex flex-wrap gap-1.5">
                {view.skills.map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-full text-[12px] bg-[#f1f5f9] text-[#475569] font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            <p className="text-[15px] font-semibold text-[#0f172a] m-0">About the job</p>
            {error && <p className="text-[13px] text-[#ef4444] m-0">{error}</p>}
            {loading ? (
              <div className="flex justify-center py-8">
                <Spin />
              </div>
            ) : view.description ? (
              <div className="text-[14px] text-[#334155] leading-relaxed whitespace-pre-line">
                {view.description}
              </div>
            ) : (
              <p className="text-[13px] text-[#94a3b8] m-0">
                The full description is on the company page — click Apply to view and submit your application.
              </p>
            )}
          </div>
        </div>
      )}
    </Drawer>
  );
}

// ─── Tracking Hook ───────────────────────────────────────────────────────────
function useJobTracking() {
  const { message } = App.useApp();
  const [mine, setMine] = useState({ applied: [], saved: [] });

  const load = () =>
    axios
      .get(`${restUrl}/external-jobs/mine`, { headers: authHeader() })
      .then(({ data }) => setMine(data?.data || { applied: [], saved: [] }))
      .catch(() => {});

  useEffect(() => {
    load();
  }, []);

  const copyOf = (job) => ({
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    workplace: job.workplace,
    applyLink: job.applyLink,
    source: job.source,
  });

  const send = (action, job) =>
    axios.post(`${restUrl}/external-jobs/track`, { action, job: copyOf(job) }, { headers: authHeader() });

  const [pendingApply, setPendingApply] = useState(null);

  const apply = (job) => {
    if (job.applyLink) window.open(job.applyLink, "_blank", "noopener,noreferrer");
    setPendingApply(job);
  };

  const markApplied = (job) => {
    setPendingApply(null);
    if (mine.applied.some((j) => j.id === job.id)) return;
    setMine((m) => ({ ...m, applied: [{ ...copyOf(job), at: new Date().toISOString() }, ...m.applied] }));
    send("apply", job)
      .then(() => message.success("Added to your applied jobs"))
      .catch(() => {
        message.error("Could not save. Please try again.");
        load();
      });
  };

  const unapply = (job) => {
    setMine((m) => ({ ...m, applied: m.applied.filter((j) => j.id !== job.id) }));
    send("unapply", job)
      .then(() => message.success("Removed from applied jobs"))
      .catch(() => {
        message.error("Could not update. Please try again.");
        load();
      });
  };

  const toggleSave = (job) => {
    const isSaved = mine.saved.some((j) => j.id === job.id);
    setMine((m) => ({
      ...m,
      saved: isSaved
        ? m.saved.filter((j) => j.id !== job.id)
        : [{ ...copyOf(job), at: new Date().toISOString() }, ...m.saved],
    }));
    send(isSaved ? "unsave" : "save", job)
      .then(() => message.success(isSaved ? "Removed from saved jobs" : "Job saved"))
      .catch(() => {
        message.error("Could not save. Please try again.");
        load();
      });
  };

  return {
    mine,
    appliedIds: new Set(mine.applied.map((j) => j.id)),
    savedIds: new Set(mine.saved.map((j) => j.id)),
    apply,
    markApplied,
    unapply,
    toggleSave,
    pendingApply,
    dismissPending: () => setPendingApply(null),
  };
}

// ─── Suggestions Hook ────────────────────────────────────────────────────────
function useSuggestions(text) {
  const [result, setResult] = useState({ roles: [], skills: [] });
  const timer = useRef(null);

  useEffect(() => {
    clearTimeout(timer.current);
    const q = text.trim();
    if (q.length < 2) {
      setResult({ roles: [], skills: [] });
      return undefined;
    }
    timer.current = setTimeout(() => {
      axios
        .get(`${restUrl}/external-jobs/suggest`, { params: { q }, headers: authHeader() })
        .then(({ data }) => setResult(data?.data || { roles: [], skills: [] }))
        .catch(() => {});
    }, 250);
    return () => clearTimeout(timer.current);
  }, [text]);

  return result;
}

// ─── Main Outside Jobs Component ─────────────────────────────────────────────
export default function ExternalJobs() {
  const [view, setView] = useState("all"); // all | saved | applied
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [meta, setMeta] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [totals, setTotals] = useState({ company: 0, remote: 0 });
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [openJob, setOpenJob] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const loadMoreRef = useRef(null);

  const tracking = useJobTracking();
  const suggestions = useSuggestions(filters.role);

  const setFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  const fetchJobs = async ({ nextPage = 1, override } = {}) => {
    const q = override || filters;
    setError("");
    if (nextPage === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const { data } = await axios.get(`${restUrl}/external-jobs`, {
        params: {
          role: q.role?.trim() || undefined,
          location: q.location?.trim() || undefined,
          skills: q.skills?.length ? q.skills.join(",") : undefined,
          workMode: q.workMode || undefined,
          experience: q.experience || undefined,
          jobType: q.jobType || undefined,
          postedWithin: q.postedWithin || undefined,
          sort: q.sort,
          page: nextPage,
        },
        headers: authHeader(),
      });

      const list = data?.data || [];
      setJobs((prev) => (nextPage === 1 ? list : [...prev, ...list]));
      setPage(nextPage);
      setHasNextPage(Boolean(data?.pagination?.hasNextPage));
      if (nextPage === 1) {
        setTotals({
          company: data?.pagination?.companyJobsTotal || 0,
          remote: data?.pagination?.remoteJobsTotal || 0,
        });
      }
    } catch (err) {
      setError(err?.response?.data?.error || "Could not load outside jobs. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchJobs({ override: EMPTY_FILTERS });
    axios
      .get(`${restUrl}/external-jobs/filters`, { headers: authHeader() })
      .then(({ data }) => setMeta(data?.data || null))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || view !== "all" || !hasNextPage || loading || loadingMore) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) fetchJobs({ nextPage: page + 1 });
      },
      { rootMargin: "300px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, hasNextPage, loading, loadingMore, page, jobs.length]);

  const runSearch = (next) => {
    setView("all");
    setFilters(next);
    fetchJobs({ override: next });
  };

  const applyFilter = (key, value) => {
    const next = { ...filters, [key]: value };
    runSearch(next);
  };

  const clearAll = () => runSearch(EMPTY_FILTERS);

  const roleOptions = [
    ...(suggestions.roles.length
      ? [{ label: "Roles", options: suggestions.roles.map((r) => ({ value: r, label: r })) }]
      : []),
    ...(suggestions.skills.length
      ? [
          {
            label: "Skills",
            options: suggestions.skills.map((s) => ({ value: s, label: `${s} (skill)` })),
          },
        ]
      : []),
  ];

  const cityOptions = (meta?.cities || []).map((c) => ({ value: c.label }));
  const skillOptions = (meta?.skills || []).map((s) => ({ value: s, label: s }));

  const hasAnyFilter = JSON.stringify(filters) !== JSON.stringify(EMPTY_FILTERS);
  const totalCount = meta?.counts?.total || totals.company + totals.remote || 245;

  const listJobs =
    view === "all"
      ? jobs
      : (view === "saved" ? tracking.mine.saved : tracking.mine.applied).map((j) => ({ ...j, fromList: true }));

  const filterPanel = (
    <FilterPanel
      filters={filters}
      applyFilter={applyFilter}
      counts={meta?.counts}
      skillOptions={skillOptions}
      onClear={clearAll}
      hasAnyFilter={hasAnyFilter}
    />
  );

  return (
    <div className="flex flex-col gap-3 h-full overflow-hidden">
      {/* ── 1. Top Search Bar ─────────────────────────────────────────── */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          runSearch(filters);
        }}
        className="w-full flex flex-col md:flex-row items-center gap-3 shrink-0"
      >
        {/* Role or skill input */}
        <div className="relative flex-1 w-full">
          <SearchOutlined className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] text-[15px] pointer-events-none z-10" />
          <AutoComplete
            className="w-full"
            options={roleOptions}
            value={filters.role}
            onChange={(v) => setFilter("role", v)}
            onSelect={(v) => runSearch({ ...filters, role: v })}
          >
            <input
              type="text"
              placeholder="Role or skill, e.g. Data Engineer, React"
              value={filters.role}
              onChange={(e) => setFilter("role", e.target.value)}
              className="w-full h-[44px] pl-10 pr-4 bg-white border border-[#e2e8f0] rounded-lg text-[14px] text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:border-[#1e69da] shadow-sm transition-all"
            />
          </AutoComplete>
        </div>

        {/* City input */}
        <div className="relative w-full md:w-[360px]">
          <EnvironmentOutlined className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] text-[15px] pointer-events-none z-10" />
          <AutoComplete
            className="w-full"
            options={cityOptions}
            value={filters.location}
            onChange={(v) => setFilter("location", v)}
            onSelect={(v) => applyFilter("location", v)}
            filterOption={(input, option) => option.value.toLowerCase().includes(input.toLowerCase())}
          >
            <input
              type="text"
              placeholder="City, e.g. Hyderabad"
              value={filters.location}
              onChange={(e) => setFilter("location", e.target.value)}
              className="w-full h-[44px] pl-10 pr-4 bg-white border border-[#e2e8f0] rounded-lg text-[14px] text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:border-[#1e69da] shadow-sm transition-all"
            />
          </AutoComplete>
        </div>

        {/* Search button */}
        <button
          type="submit"
          disabled={loading}
          className="h-[44px] px-8 bg-[#1e69da] hover:bg-[#1557bf] text-white font-medium text-[14px] rounded-lg transition-colors shadow-sm shrink-0 flex items-center justify-center cursor-pointer border-0"
        >
          Search
        </button>
      </form>

      {/* ── 2. Filters Sidebar (Left) + Job Content Area (Right) ────────── */}
      <div className="flex gap-4 flex-1 overflow-hidden">
        {/* Left Filters Panel */}
        <aside className="hidden lg:block w-[260px] shrink-0 overflow-y-auto bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-4 max-h-full">
          {filterPanel}
        </aside>

        {/* Right Content Area */}
        <section className="flex-1 min-w-0 flex flex-col gap-2.5 overflow-hidden">
          {/* Header row: Tabs & Sort By */}
          <div className="flex items-center justify-between border-b border-[#e2e8f0] shrink-0">
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => setView("all")}
                className={`pb-2 text-[14px] transition-colors relative cursor-pointer bg-transparent border-0 ${
                  view === "all"
                    ? "text-[#1e69da] font-semibold"
                    : "text-[#64748b] hover:text-[#0f172a] font-medium"
                }`}
              >
                All jobs ({totalCount})
                {view === "all" && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1e69da] rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setView("saved")}
                className={`pb-2 text-[14px] transition-colors relative cursor-pointer bg-transparent border-0 ${
                  view === "saved"
                    ? "text-[#1e69da] font-semibold"
                    : "text-[#64748b] hover:text-[#0f172a] font-medium"
                }`}
              >
                Saved ({tracking.mine.saved.length})
                {view === "saved" && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1e69da] rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setView("applied")}
                className={`pb-2 text-[14px] transition-colors relative cursor-pointer bg-transparent border-0 ${
                  view === "applied"
                    ? "text-[#1e69da] font-semibold"
                    : "text-[#64748b] hover:text-[#0f172a] font-medium"
                }`}
              >
                Applied ({tracking.mine.applied.length})
                {view === "applied" && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1e69da] rounded-full" />
                )}
              </button>
            </div>

            <div className="flex items-center gap-2 pb-1">
              {/* Mobile Filter toggle button */}
              <div className="lg:hidden">
                <Button size="small" icon={<FilterOutlined />} onClick={() => setFiltersOpen(true)}>
                  Filters
                </Button>
              </div>

              <span className="text-[13px] text-[#64748b]">Sort by</span>
              <Select
                size="small"
                className="min-w-[140px]"
                options={SORT_OPTIONS}
                value={filters.sort}
                onChange={(v) => applyFilter("sort", v)}
              />
            </div>
          </div>

          {/* Profile Skills Callout Banner */}
          <div className="bg-[#eef4ff] border border-[#dbeafe] rounded-lg px-4 py-2.5 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5 text-[13px] text-[#1e3a8a] font-medium">
              <div className="w-4 h-4 rounded-full bg-[#1e69da] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                i
              </div>
              <span>Add your skills to your profile to see which jobs match you best.</span>
            </div>
            <a
              href="/student/profile/skills-languages"
              className="text-[13px] font-semibold text-[#1e69da] hover:underline flex items-center gap-1 whitespace-nowrap shrink-0"
            >
              Add skills →
            </a>
          </div>

          {/* Error notice */}
          {error && <p className="text-[13px] text-[#ef4444] m-0 shrink-0">{error}</p>}

          {/* 2-Column Job Cards Grid */}
          <div className="flex-1 overflow-y-auto pb-4 pr-1">
            {view === "all" && loading ? (
              <JobListSkeleton />
            ) : listJobs.length > 0 ? (
              <>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3.5">
                  {listJobs.map((job, idx) => (
                    <ExternalJobCard
                      key={`${job.id || "job"}-${idx}`}
                      job={job}
                      onOpen={setOpenJob}
                      tracking={tracking}
                    />
                  ))}
                </div>
                {view === "all" && hasNextPage && (
                  <div ref={loadMoreRef} className="flex justify-center mt-5 min-h-[40px]">
                    {loadingMore ? (
                      <Spin />
                    ) : (
                      <button
                        type="button"
                        onClick={() => fetchJobs({ nextPage: page + 1 })}
                        className="px-5 py-2 bg-white border border-[#e2e8f0] hover:border-[#1e69da] text-[#1e69da] text-[13px] font-medium rounded-lg shadow-sm transition-colors cursor-pointer"
                      >
                        Load more jobs
                      </button>
                    )}
                  </div>
                )}
                {view === "all" && (
                  <p className="text-center text-[12px] text-[#94a3b8] mt-4 mb-0">
                    Jobs from company careers pages ·{" "}
                    <a href="https://jobicy.com" target="_blank" rel="noopener noreferrer" className="text-[#94a3b8] hover:underline">
                      Remote jobs by Jobicy
                    </a>{" "}
                    ·{" "}
                    <a href="https://himalayas.app" target="_blank" rel="noopener noreferrer" className="text-[#94a3b8] hover:underline">
                      Himalayas
                    </a>
                  </p>
                )}
              </>
            ) : (
              <Empty
                className="mt-12"
                description={
                  view === "saved"
                    ? "No saved jobs yet. Tap the bookmark icon on any job to save it."
                    : view === "applied"
                      ? "No applied jobs yet. After you apply on a company page, choose 'Yes, I applied' to track it here."
                      : "No outside jobs match these filters. Try searching for a different role, skill, or city."
                }
              />
            )}
          </div>
        </section>
      </div>

      {/* Mobile drawer */}
      <Drawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        placement="left"
        size={300}
        closable={false}
        footer={
          <Button type="primary" block onClick={() => setFiltersOpen(false)}>
            Show jobs
          </Button>
        }
      >
        {filterPanel}
      </Drawer>

      {/* Modal: Did you apply? */}
      <Modal
        open={Boolean(tracking.pendingApply)}
        title="Did you apply?"
        onCancel={tracking.dismissPending}
        centered
        footer={[
          <Button key="no" onClick={tracking.dismissPending}>
            Not yet
          </Button>,
          <Button key="yes" type="primary" onClick={() => tracking.markApplied(tracking.pendingApply)}>
            Yes, I applied
          </Button>,
        ]}
      >
        {tracking.pendingApply && (
          <p className="m-0 text-[14px] text-[#334155]">
            Did you finish applying for <b>{tracking.pendingApply.title}</b> at{" "}
            <b>{tracking.pendingApply.company}</b>? We&apos;ll keep it in your Applied list so you can track it.
          </p>
        )}
      </Modal>

      {/* Job details drawer */}
      <JobDetails
        job={openJob}
        open={Boolean(openJob)}
        onClose={() => setOpenJob(null)}
        tracking={tracking}
      />
    </div>
  );
}
