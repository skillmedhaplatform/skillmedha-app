// Shared by the admin practice-set screens and the student practice catalog,
// so the labels a student sees are always the ones the admin picked from.

export const PLAN_OPTIONS = [
  { value: "free", label: "Free" },
  { value: "premium", label: "Premium" },
];

export const LEVEL_OPTIONS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "pro", label: "Pro" },
];

export const CATEGORY_OPTIONS = [
  { value: "nontechnical", label: "Non-Technical" },
  { value: "technical", label: "Technical" },
  { value: "coding", label: "Coding" },
  { value: "company", label: "Company-wise" },
];

// Matches the difficulty stored on each question in the question editor.
export const DIFFICULTY_OPTIONS = [
  { value: "mixed", label: "Mixed (all difficulties)" },
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

export const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
];

const labelFrom = (options, value) => options.find((o) => o.value === value)?.label || "";

export const planLabel = (value) => (value === "bundle" ? "Bundle" : labelFrom(PLAN_OPTIONS, value));
export const levelLabel = (value) => labelFrom(LEVEL_OPTIONS, value);
export const categoryLabel = (value) => labelFrom(CATEGORY_OPTIONS, value);
export const difficultyLabel = (value) =>
  value === "mixed" || !value ? "Mixed" : labelFrom(DIFFICULTY_OPTIONS, value);

// 45 -> "45 mins", 60 -> "1 hour", 150 -> "2.5 hours"
export const formatDuration = (minutes) => {
  const mins = Number(minutes) || 0;
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"}`;
  const hours = Math.round((mins / 60) * 10) / 10;
  return `${hours} hour${hours === 1 ? "" : "s"}`;
};

export const formatPrice = (amount) => `₹${Number(amount || 0).toLocaleString("en-IN")}`;
