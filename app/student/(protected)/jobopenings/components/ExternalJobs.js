"use client";
// ─────────────────────────────────────────────────────────────
// components/ExternalJobs.js  —  Outside jobs (not posted on the portal)
// City jobs come from company careers pages synced by the backend;
// remote jobs come from Jobicy (synced) and Himalayas (live).
// Data: GET /external-jobs. Opens with the newest jobs.
// Role box suggests real roles/skills as you type and fixes typos.
// Students can save jobs and keep a list of jobs they applied to.
// ─────────────────────────────────────────────────────────────
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { AutoComplete, Button, Drawer, Empty, Input, InputNumber, Modal, Segmented, Select, Spin, message } from "antd";
import {
  SearchOutlined,
  EnvironmentOutlined,
  ExportOutlined,
  StarOutlined,
  StarFilled,
  CheckCircleFilled,
  CloseOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { restUrl } from "@/config/urls";
import { getLstorage } from "@/universalUtils/windowMW";
import timeAgo from "@/helpers/timeAgo";
import { JobListSkeleton } from "./skeletons";

const authHeader = () => ({ Authorization: `Bearer ` + getLstorage("token") });

const WORKPLACE_LABEL = { onsite: "On-site", hybrid: "Hybrid", remote: "Remote" };
const POSTED_OPTIONS = [
  { label: "Any time", value: "" },
  { label: "Last 24 hours", value: 1 },
  { label: "Last 3 days", value: 3 },
  { label: "Last 7 days", value: 7 },
  { label: "Last 30 days", value: 30 },
];
const SORT_OPTIONS = [
  { label: "Most relevant", value: "relevance" },
  { label: "Newest first", value: "recent" },
];
const WORK_MODE_OPTIONS = [
  { label: "Any", value: "" },
  { label: "On-site", value: "onsite" },
  { label: "Hybrid", value: "hybrid" },
  { label: "Remote", value: "remote" },
];
const EXPERIENCE_OPTIONS = [
  { label: "Any", value: "" },
  { label: "Fresher", value: "fresher" },
  { label: "Experienced", value: "experienced" },
];
const JOB_TYPE_OPTIONS = [
  { label: "Any", value: "" },
  { label: "Full-time", value: "fulltime" },
  { label: "Internship", value: "internship" },
  { label: "Contract", value: "contract" },
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

function Tag({ className, children }) {
  return <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${className}`}>{children}</span>;
}

function JobTags({ job }) {
  const salary = formatSalary(job.salary);
  const exp = experienceLabel(job);
  return (
    <div className="flex flex-wrap gap-1.5">
      {job.workplace && (
        <Tag className={job.workplace === "remote" ? "bg-green-50 text-green-600" : "bg-[#f0f6ff] text-[#0ea5e9]"}>
          {WORKPLACE_LABEL[job.workplace]}
        </Tag>
      )}
      {job.jobType && <Tag className="bg-purple-50 text-purple-600">{job.jobType}</Tag>}
      {exp && <Tag className="bg-amber-50 text-amber-700">{exp}</Tag>}
      {salary && <Tag className="bg-orange-50 text-[#f97316]">{salary}</Tag>}
    </div>
  );
}

// Skills named in the job; the ones the student picked are highlighted first.
function SkillChips({ skills = [], picked = [], max = 5 }) {
  if (!skills.length) return null;
  const sorted = [...skills].sort((a, b) => Number(picked.includes(b)) - Number(picked.includes(a)));
  const shown = sorted.slice(0, max);
  return (
    <div className="flex flex-wrap gap-1">
      {shown.map((s) => (
        <span
          key={s}
          className={`px-1.5 py-0.5 rounded text-[11px] border ${
            picked.includes(s)
              ? "bg-[#1E69DA] text-white border-[#1E69DA]"
              : "bg-[#f8fafc] text-[#475569] border-[#e2e8f0]"
          }`}
        >
          {s}
        </span>
      ))}
      {skills.length > max && <span className="text-[11px] text-[#94a3b8] self-center">+{skills.length - max}</span>}
    </div>
  );
}

function CompanyLogo({ job, size = "w-12 h-12" }) {
  const firstLetter = job?.company ? job.company.charAt(0).toUpperCase() : "C";
  // Each company gets its own steady colour, so the list is easier to scan.
  const hue = [...String(job?.company || "C")].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) % 360, 7);
  return job.companyLogo ? (
    <img
      src={job.companyLogo}
      alt=""
      className={`${size} rounded-xl object-contain border border-[#e2e8f0] bg-white flex-shrink-0`}
    />
  ) : (
    <div
      className={`${size} rounded-xl flex items-center justify-center text-white font-bold text-[20px] flex-shrink-0`}
      style={{ background: `linear-gradient(135deg, hsl(${hue} 65% 48%), hsl(${(hue + 30) % 360} 70% 60%))` }}
    >
      {firstLetter}
    </div>
  );
}

const isNew = (job) => job.postedAt && Date.now() - new Date(job.postedAt).getTime() < 24 * 60 * 60 * 1000;

// Renders the job post's text: "• " lines as bullets, short lines as headings.
function Description({ text }) {
  const blocks = String(text).split(/\n{2,}/);
  return (
    <div className="flex flex-col gap-3 text-[14px] text-[#334155] leading-relaxed">
      {blocks.map((block, i) => {
        const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
        const bullets = lines.filter((l) => l.startsWith("•"));
        const isHeading = lines.length === 1 && lines[0].length <= 60 && !/[.!?]$/.test(lines[0]);
        if (isHeading) {
          return (
            <p key={i} className="text-[15px] font-semibold text-[#0f172a] m-0 mt-1">
              {lines[0].replace(/:$/, "")}
            </p>
          );
        }
        if (bullets.length && bullets.length >= lines.length - 1) {
          const head = lines[0].startsWith("•") ? null : lines[0];
          return (
            <div key={i} className="flex flex-col gap-1">
              {head && <p className="text-[15px] font-semibold text-[#0f172a] m-0">{head.replace(/:$/, "")}</p>}
              <ul className="m-0 pl-5 list-disc flex flex-col gap-1">
                {bullets.map((b, j) => (
                  <li key={j}>{b.replace(/^•\s*/, "")}</li>
                ))}
              </ul>
            </div>
          );
        }
        return (
          <p key={i} className="m-0 whitespace-pre-line">
            {lines.join("\n")}
          </p>
        );
      })}
    </div>
  );
}

function JobActions({ job, tracking, size = "small" }) {
  const applied = tracking.appliedIds.has(job.id);
  const saved = tracking.savedIds.has(job.id);
  return (
    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      <Button
        size={size}
        type="text"
        aria-label={saved ? "Remove from saved" : "Save job"}
        title={saved ? "Remove from saved" : "Save job"}
        icon={saved ? <StarFilled className="text-[#f59e0b]" /> : <StarOutlined />}
        onClick={() => tracking.toggleSave(job)}
      />
      {applied ? (
        <>
          <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-green-700">
            <CheckCircleFilled /> Applied
          </span>
          <Button size={size} type="link" className="px-1" onClick={() => tracking.unapply(job)}>
            Remove
          </Button>
        </>
      ) : job.applyLink ? (
        <Button type="primary" size={size} icon={<ExportOutlined />} onClick={() => tracking.apply(job)}>
          Apply
        </Button>
      ) : null}
    </div>
  );
}

function ExternalJobCard({ job, onOpen, tracking, pickedSkills }) {
  return (
    <div
      className="group p-4 rounded-xl border border-[#e2e8f0] bg-white shadow-sm flex flex-col gap-3 cursor-pointer hover:border-[#1E69DA] hover:shadow-md transition-all"
      onClick={() => onOpen(job)}
    >
      <div className="flex items-start gap-3">
        <CompanyLogo job={job} />
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p
              className="text-[15px] font-bold text-[#0f172a] m-0 leading-tight group-hover:text-[#1E69DA] transition-colors"
              title={job.title}
            >
              {job.title}
            </p>
            {isNew(job) && (
              <span className="shrink-0 px-1.5 py-0.5 rounded bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wide">
                New
              </span>
            )}
          </div>
          <p className="text-[13px] text-[#1E69DA] font-semibold m-0 truncate" title={job.company}>
            {job.company}
          </p>
          {job.location && (
            <p className="text-[12px] text-[#64748b] m-0 mt-0.5 truncate" title={job.location}>
              <EnvironmentOutlined /> {job.location}
            </p>
          )}
        </div>
      </div>

      <JobTags job={job} />
      <SkillChips skills={job.skills} picked={[...pickedSkills, ...(job.matchedSkills || [])]} />
      {job.matchedSkills?.length > 0 && (
        <p className="text-[12px] text-green-700 font-medium m-0 -mt-1">
          <CheckCircleFilled /> Matches your skills: {job.matchedSkills.slice(0, 4).join(", ")}
          {job.matchedSkills.length > 4 ? ` +${job.matchedSkills.length - 4}` : ""}
        </p>
      )}

      <div className="flex items-center justify-between gap-2 mt-auto">
        <p className="text-[12px] text-[#94a3b8] font-medium m-0 truncate">
          {job.postedAt ? timeAgo(job.postedAt) : ""}
          {job.source ? ` · via ${job.source}` : ""}
        </p>
        <JobActions job={job} tracking={tracking} />
      </div>
    </div>
  );
}

function JobDetails({ job, open, onClose, tracking, pickedSkills }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !job) return;
    setDetail(null);
    setError("");
    // Himalayas jobs are searched live, so there is nothing stored to fetch.
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
              Apply opens {view.company}&apos;s own job page
            </p>
            <JobActions job={view} tracking={tracking} size="large" />
          </div>
        ) : null
      }
    >
      {view && (
        <div className="flex flex-col gap-5">
          <div className="flex items-start gap-4">
            <CompanyLogo job={view} size="w-16 h-16" />
            <div className="flex flex-col min-w-0 gap-0.5">
              <p className="text-[20px] font-bold text-[#0f172a] m-0 leading-tight">{view.title}</p>
              <p className="text-[15px] text-[#1E69DA] font-semibold m-0">{view.company}</p>
              {view.location && (
                <p className="text-[13px] text-[#64748b] m-0">
                  <EnvironmentOutlined /> {view.location}
                </p>
              )}
              {(view.department || view.source) && (
                <p className="text-[12px] text-[#94a3b8] m-0">
                  {[view.department, view.source && `via ${view.source}`].filter(Boolean).join(" · ")}
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
              <SkillChips skills={view.skills} picked={pickedSkills} max={30} />
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
              <>
                <Description text={view.description} />
                {view.description.length >= 6000 && (
                  <p className="text-[13px] text-[#64748b] m-0">Read the rest on the company page — use Apply.</p>
                )}
              </>
            ) : (
              <p className="text-[13px] text-[#94a3b8] m-0">
                The full description is on the company page — use Apply to read it.
              </p>
            )}
          </div>
        </div>
      )}
    </Drawer>
  );
}

// Saved / applied jobs, kept on the student's account.
function useJobTracking() {
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

  // The job the student just opened, waiting for "Did you apply?".
  const [pendingApply, setPendingApply] = useState(null);

  const apply = (job) => {
    // Open first so the browser doesn't block the new tab.
    if (job.applyLink) window.open(job.applyLink, "_blank", "noopener,noreferrer");
    // Opening the page isn't applying — ask when they come back.
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

// Role box: real roles and skills as you type, plus "Did you mean".
function useSuggestions(text) {
  const [result, setResult] = useState({ roles: [], skills: [], didYouMean: null });
  const timer = useRef(null);

  useEffect(() => {
    clearTimeout(timer.current);
    const q = text.trim();
    if (q.length < 2) {
      setResult({ roles: [], skills: [], didYouMean: null });
      return undefined;
    }
    timer.current = setTimeout(() => {
      axios
        .get(`${restUrl}/external-jobs/suggest`, { params: { q }, headers: authHeader() })
        .then(({ data }) => setResult(data?.data || { roles: [], skills: [], didYouMean: null }))
        .catch(() => {});
    }, 250);
    return () => clearTimeout(timer.current);
  }, [text]);

  return result;
}

// Tappable pill options — easier than tiny radio buttons, on phones too.
function ChipGroup({ value, onChange, options }) {
  return (
    <div className="flex flex-wrap gap-1.5" role="radiogroup">
      {options.map((o) => {
        const on = value === o.value;
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={`px-3 py-1 rounded-full text-[13px] border cursor-pointer transition-colors ${
              on
                ? "bg-[#1E69DA] text-white border-[#1E69DA] font-semibold"
                : "bg-white text-[#334155] border-[#dbe3ee] hover:border-[#1E69DA] hover:text-[#1E69DA]"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function FilterSection({ title, children }) {
  return (
    <div className="flex flex-col gap-2 py-3 border-b border-[#eef2f7] last:border-b-0">
      <p className="text-[13px] font-semibold text-[#0f172a] m-0">{title}</p>
      {children}
    </div>
  );
}

// Left-side filter panel (also used inside the mobile "Filters" drawer).
function FilterPanel({ filters, setFilter, applyFilter, fetchJobs, skillOptions, onClear, hasAnyFilter }) {
  const topSkills = skillOptions.slice(0, 14).map((o) => o.value);
  const toggleSkill = (s) =>
    applyFilter("skills", filters.skills.includes(s) ? filters.skills.filter((x) => x !== s) : [...filters.skills, s]);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between pb-2 border-b border-[#eef2f7]">
        <p className="text-[15px] font-bold text-[#0f172a] m-0">Filters</p>
        {hasAnyFilter && (
          <button
            type="button"
            onClick={onClear}
            className="text-[13px] font-semibold text-[#1E69DA] bg-transparent border-0 p-0 cursor-pointer hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <FilterSection title="Work mode">
        <ChipGroup value={filters.workMode} onChange={(v) => applyFilter("workMode", v)} options={WORK_MODE_OPTIONS} />
      </FilterSection>

      <FilterSection title="Experience">
        <ChipGroup value={filters.experience} onChange={(v) => applyFilter("experience", v)} options={EXPERIENCE_OPTIONS} />
        {filters.experience === "experienced" && (
          <div className="flex flex-col gap-1 pl-6">
            <span className="text-[12px] text-[#64748b]">Your experience</span>
            <InputNumber
              size="small"
              min={0}
              max={40}
              placeholder="e.g. 3"
              suffix="years"
              className="w-[130px]"
              value={filters.years}
              onChange={(v) => setFilter("years", v)}
              onBlur={() => fetchJobs()}
              onPressEnter={() => fetchJobs()}
            />
          </div>
        )}
      </FilterSection>

      <FilterSection title="Job type">
        <ChipGroup value={filters.jobType} onChange={(v) => applyFilter("jobType", v)} options={JOB_TYPE_OPTIONS} />
      </FilterSection>

      <FilterSection title="Posted">
        <ChipGroup value={filters.postedWithin} onChange={(v) => applyFilter("postedWithin", v)} options={POSTED_OPTIONS} />
      </FilterSection>

      <FilterSection title="Skills">
        <Select
          mode="multiple"
          allowClear
          showSearch
          placeholder="Search skills"
          options={skillOptions}
          value={filters.skills}
          onChange={(v) => applyFilter("skills", v)}
          maxCount={10}
          className="w-full"
        />
        {topSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {topSkills.map((s) => {
              const on = filters.skills.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSkill(s)}
                  className={`px-2 py-0.5 rounded-full text-[12px] border cursor-pointer transition-colors ${
                    on
                      ? "bg-[#1E69DA] text-white border-[#1E69DA]"
                      : "bg-white text-[#475569] border-[#e2e8f0] hover:border-[#1E69DA]"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        )}
      </FilterSection>
    </div>
  );
}

// Removable chips for the filters in use, shown above the results.
function ActiveFilterChips({ filters, applyFilter }) {
  const label = (options, value) => options.find((o) => o.value === value)?.label;
  const chips = [
    filters.location && filters.workMode !== "remote" && { key: "location", text: filters.location, clear: "" },
    filters.workMode && { key: "workMode", text: label(WORK_MODE_OPTIONS, filters.workMode), clear: "" },
    filters.experience && {
      key: "experience",
      text: `${label(EXPERIENCE_OPTIONS, filters.experience)}${filters.years !== null ? ` · ${filters.years} yrs` : ""}`,
      clear: "",
    },
    filters.jobType && { key: "jobType", text: label(JOB_TYPE_OPTIONS, filters.jobType), clear: "" },
    filters.postedWithin && { key: "postedWithin", text: label(POSTED_OPTIONS, filters.postedWithin), clear: "" },
    ...filters.skills.map((s) => ({
      key: "skills",
      text: s,
      clear: filters.skills.filter((x) => x !== s),
    })),
  ].filter(Boolean);

  if (!chips.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {chips.map((c) => (
        <span
          key={`${c.key}-${c.text}`}
          className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 rounded-full bg-[#eaf2fe] text-[#1E69DA] text-[12px] font-medium"
        >
          {c.text}
          <button
            type="button"
            aria-label={`Remove ${c.text}`}
            className="bg-transparent border-0 p-0 cursor-pointer text-[#1E69DA] leading-none"
            onClick={() => applyFilter(c.key, c.clear)}
          >
            <CloseOutlined className="text-[10px]" />
          </button>
        </span>
      ))}
    </div>
  );
}

export default function ExternalJobs() {
  const [view, setView] = useState("all"); // all | saved | applied
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [meta, setMeta] = useState(null);
  const [isSearch, setIsSearch] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [totals, setTotals] = useState({ company: 0, remote: 0 });
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState({ correctedRole: null, locationNote: null });
  const [openJob, setOpenJob] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [mySkills, setMySkills] = useState(null); // null = not loaded yet
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
          years: q.experience === "experienced" && q.years !== null ? q.years : undefined,
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
        // The job count is shown only for an actual search, not the default list.
        setIsSearch(JSON.stringify({ ...q, sort: EMPTY_FILTERS.sort }) !== JSON.stringify(EMPTY_FILTERS));
        setTotals({
          company: data?.pagination?.companyJobsTotal || 0,
          remote: data?.pagination?.remoteJobsTotal || 0,
        });
        setNotes({ correctedRole: data?.correctedRole || null, locationNote: data?.locationNote || null });
        setMySkills(data?.mySkills || []);
      }
    } catch (err) {
      setError(err?.response?.data?.error || "Could not load outside jobs. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Fresh start on every visit: newest jobs first, nothing pre-filled.
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

  // Changing a filter re-runs the search straight away.
  const applyFilter = (key, value) => {
    const next = { ...filters, [key]: value };
    if (key === "experience" && value !== "experienced") next.years = null;
    runSearch(next);
  };

  const clearAll = () => runSearch(EMPTY_FILTERS);

  // Picking a suggested skill adds it to the skill filter; a role fills the box.
  const onPickSuggestion = (value) => {
    if (value.startsWith("skill:")) {
      const skill = value.slice(6);
      const skills = filters.skills.includes(skill) ? filters.skills : [...filters.skills, skill];
      runSearch({ ...filters, role: "", skills });
    } else {
      runSearch({ ...filters, role: value });
    }
  };

  const roleOptions = [
    ...(suggestions.roles.length
      ? [{ label: "Roles", options: suggestions.roles.map((r) => ({ value: r, label: r })) }]
      : []),
    ...(suggestions.skills.length
      ? [
          {
            label: "Skills",
            options: suggestions.skills.map((s) => ({ value: `skill:${s}`, label: `${s} (skill)` })),
          },
        ]
      : []),
  ];

  const cityOptions = (meta?.cities || []).map((c) => ({ value: c.label }));
  const skillOptions = (meta?.skills || []).map((s) => ({ value: s, label: s }));

  const hasAnyFilter = JSON.stringify(filters) !== JSON.stringify(EMPTY_FILTERS);
  const resultCount = totals.company + totals.remote;
  const activeFilterCount =
    [filters.workMode, filters.experience, filters.jobType, filters.postedWithin].filter(Boolean).length +
    filters.skills.length;

  const listJobs =
    view === "all"
      ? jobs
      : (view === "saved" ? tracking.mine.saved : tracking.mine.applied).map((j) => ({ ...j, fromList: true }));

  const filterPanel = (
    <FilterPanel
      filters={filters}
      setFilter={setFilter}
      applyFilter={applyFilter}
      fetchJobs={fetchJobs}
      skillOptions={skillOptions}
      onClear={clearAll}
      hasAnyFilter={hasAnyFilter}
    />
  );

  return (
    <div className="flex flex-col gap-3 h-full overflow-hidden">
      {/* ── Search bar ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 bg-white p-3 rounded-xl border border-[#e2e8f0] shadow-sm shrink-0">
        <form
          className="flex flex-col md:flex-row gap-2 md:items-center"
          onSubmit={(e) => {
            e.preventDefault();
            runSearch(filters);
          }}
        >
          <AutoComplete
            className="w-full md:flex-[3]"
            options={roleOptions}
            value={filters.role}
            onChange={(v) => setFilter("role", v.startsWith("skill:") ? "" : v)}
            onSelect={onPickSuggestion}
          >
            <Input
              size="large"
              prefix={<SearchOutlined className="text-[#94a3b8]" />}
              placeholder="Role or skill, e.g. Data Engineer, React"
              maxLength={100}
              allowClear
            />
          </AutoComplete>
          <AutoComplete
            className="w-full md:flex-[2]"
            options={cityOptions}
            value={filters.location}
            onChange={(v) => setFilter("location", v)}
            onSelect={(v) => applyFilter("location", v)}
            filterOption={(input, option) => option.value.toLowerCase().includes(input.toLowerCase())}
            disabled={filters.workMode === "remote"}
          >
            <Input
              size="large"
              prefix={<EnvironmentOutlined className="text-[#94a3b8]" />}
              placeholder={filters.workMode === "remote" ? "Remote jobs — any location" : "City, e.g. Hyderabad"}
              maxLength={100}
              allowClear
            />
          </AutoComplete>
          <Button type="primary" size="large" htmlType="submit" loading={loading} icon={<SearchOutlined />}>
            Search
          </Button>
        </form>

        {suggestions.didYouMean && filters.role && (
          <p className="text-[13px] text-[#475569] m-0">
            Did you mean{" "}
            <button
              type="button"
              className="text-[#1E69DA] font-semibold underline bg-transparent border-0 p-0 cursor-pointer"
              onClick={() => runSearch({ ...filters, role: suggestions.didYouMean })}
            >
              {suggestions.didYouMean}
            </button>
            ?
          </p>
        )}
      </div>

      {/* ── Filters (left) + results (right) ──────────────────── */}
      <div className="flex gap-4 flex-1 overflow-hidden">
        {view === "all" && (
          <aside className="hidden lg:block w-[260px] shrink-0 overflow-y-auto bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-4">
            {filterPanel}
          </aside>
        )}

        <section className="flex-1 min-w-0 flex flex-col gap-2 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <Segmented
                value={view}
                onChange={setView}
                options={[
                  { label: "All jobs", value: "all" },
                  { label: "Saved", value: "saved" },
                  { label: "Applied", value: "applied" },
                ]}
              />
              {view === "all" && (
                <div className="lg:hidden">
                  <Button icon={<FilterOutlined />} onClick={() => setFiltersOpen(true)}>
                    Filters{activeFilterCount ? ` · ${activeFilterCount}` : ""}
                  </Button>
                </div>
              )}
            </div>
            {view === "all" && (
              <div className="flex items-center gap-2">
                {isSearch && !loading && !error && (
                  <span className="text-[13px] font-semibold text-[#0f172a]">
                    {resultCount.toLocaleString("en-IN")} jobs found
                  </span>
                )}
                <span className="text-[13px] text-[#64748b]">Sort by</span>
                <Select
                  size="small"
                  className="min-w-[160px]"
                  options={
                    mySkills?.length
                      ? [{ label: "Best match for me", value: "match" }, ...SORT_OPTIONS]
                      : SORT_OPTIONS
                  }
                  value={filters.sort}
                  onChange={(v) => applyFilter("sort", v)}
                />
              </div>
            )}
          </div>

          {view === "all" && <ActiveFilterChips filters={filters} applyFilter={applyFilter} />}
          {view === "all" && mySkills && mySkills.length === 0 && (
            <div className="flex items-center justify-between gap-2 rounded-lg bg-[#eaf2fe] px-3 py-2">
              <p className="text-[13px] text-[#1e3a8a] m-0">
                Add your skills to your profile to see which jobs match you best.
              </p>
              <a
                href="/student/profile/skills-languages"
                className="text-[13px] font-semibold text-[#1E69DA] whitespace-nowrap hover:underline"
              >
                Add skills
              </a>
            </div>
          )}
          {view === "all" && mySkills?.length > 0 && filters.sort !== "match" && (
            <p className="text-[12px] text-[#64748b] m-0">
              Tip: sort by <b>Best match for me</b> to see jobs that need your skills (
              {mySkills.slice(0, 5).join(", ")}
              {mySkills.length > 5 ? "…" : ""}) first.
            </p>
          )}
          {view === "all" && error && <p className="text-[13px] text-[#ef4444] m-0">{error}</p>}
          {view === "all" && !error && notes.correctedRole && (
            <p className="text-[13px] text-[#475569] m-0">
              Showing results for <b>{notes.correctedRole}</b>
            </p>
          )}
          {view === "all" && !error && notes.locationNote && (
            <p className="text-[13px] text-[#f97316] m-0">{notes.locationNote}</p>
          )}

          <div className="flex-1 overflow-y-auto pb-4 pr-1">
            {view === "all" && loading ? (
              <JobListSkeleton />
            ) : listJobs.length > 0 ? (
              <>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                  {listJobs.map((job) => (
                    <ExternalJobCard
                      key={job.id}
                      job={job}
                      onOpen={setOpenJob}
                      tracking={tracking}
                      pickedSkills={filters.skills}
                    />
                  ))}
                </div>
                {view === "all" && hasNextPage && (
                  <div ref={loadMoreRef} className="flex justify-center mt-4 min-h-[40px]">
                    {loadingMore ? (
                      <Spin />
                    ) : (
                      <Button onClick={() => fetchJobs({ nextPage: page + 1 })}>Load more jobs</Button>
                    )}
                  </div>
                )}
                {view === "all" && (
                  <p className="text-center text-[12px] text-[#94a3b8] mt-4 mb-0">
                    Jobs from company careers pages ·{" "}
                    <a href="https://jobicy.com" target="_blank" rel="noopener noreferrer">
                      Remote jobs by Jobicy
                    </a>{" "}
                    ·{" "}
                    <a href="https://himalayas.app" target="_blank" rel="noopener noreferrer">
                      Himalayas
                    </a>
                  </p>
                )}
              </>
            ) : (
              <Empty
                className="mt-10"
                description={
                  view === "saved"
                    ? "No saved jobs yet. Tap the star on a job to save it."
                    : view === "applied"
                      ? "No applied jobs yet. After you apply on a company page, choose \"Yes, I applied\" to track it here."
                      : "No outside jobs match these filters. Try a different role, skill, city or filter."
                }
              />
            )}
          </div>
        </section>
      </div>

      {/* Mobile / tablet: the same filters in a drawer */}
      <Drawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        placement="left"
        size={320}
        closable={false}
        footer={
          <Button type="primary" block onClick={() => setFiltersOpen(false)}>
            Show jobs
          </Button>
        }
      >
        {filterPanel}
      </Drawer>

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

      <JobDetails
        job={openJob}
        open={Boolean(openJob)}
        onClose={() => setOpenJob(null)}
        tracking={tracking}
        pickedSkills={filters.skills}
      />
    </div>
  );
}
