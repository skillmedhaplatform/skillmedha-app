// ─────────────────────────────────────────────────────────────
// utils/jobUtils.js  —  Pure helper functions (no React/JSX)
// ─────────────────────────────────────────────────────────────

/** Returns true if the student has already applied to this job */
export const checkIfJobApplied = (jobId, appliedJobs = []) =>
  appliedJobs.some((job) => job?.jobDetails?._id === jobId);

/** Tab config — drives tab bar & content rendering (data-driven) */
export const JOB_DETAIL_TABS = [
  { key: "overview",    label: "Overview"    },
  { key: "hiring",     label: "Hiring"      },
  { key: "eligibility",label: "Eligibility" },
];

/** Overview fields config — drives the key-value rows (data-driven) */
export const OVERVIEW_FIELDS = [
  { label: "Category", dataKey: "sector"         },
  { label: "Function", dataKey: "jobTitle"        },
  { label: "CTC",      dataKey: "ctc"             },
  { label: "Location", dataKey: "city"            },
  { label: "Overview", dataKey: "jobDescription"  },
];

/** Skeleton width hints for overview rows */
export const OVERVIEW_SKELETON_WIDTHS = ["45%", "55%", "25%", "40%", "80%"];

/** List-panel tab config */
export const JOB_LIST_TABS = [
  { key: "all",     label: "All Jobs"     },
  { key: "applied", label: "Applied Jobs" },
];
