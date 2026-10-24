// Student-side wording and links for a practice set / bundle, driven by the
// `access` object the practice catalog API returns with every item:
//   { unlocked, reason: "free" | "purchased" | "bundle" | "locked", expiresAt, bundleTitle? }

import { categoryLabel } from "./constants";

export const PRACTICE_SETS_PATH = "/student/practice-new/practice-sets";

export const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const validityText = (expiresAt) => (expiresAt ? `Access till ${formatDate(expiresAt)}` : "Lifetime access");

export const setActionLabel = (set) => {
  if (set.access?.reason === "free") return "Start Practicing Free";
  return set.access?.unlocked ? "Start Practice" : "Buy Practice Set";
};

export const bundleActionLabel = (bundle) =>
  bundle.access?.unlocked ? "View Sets in Bundle" : "Unlock Bundle";

// Small pill on the card image.
export const accessTag = (access) => {
  if (access?.reason === "purchased") return "Purchased";
  if (access?.reason === "bundle") return "In your bundle";
  return null;
};

// Line shown above the action button in the detail panel.
export const accessNote = (access) => {
  if (access?.reason === "purchased") return validityText(access.expiresAt);
  if (access?.reason === "bundle") {
    return `Included in ${access.bundleTitle || "your bundle"} · ${validityText(access.expiresAt)}`;
  }
  return null;
};

export const isOwned = (access) => access?.reason === "purchased" || access?.reason === "bundle";

// Coding sets open in the code editor workspace (its `title` param picks the
// default language, so pass the subject name, e.g. "Python"); every other set
// runs in the multiple-choice / company test player.
export const testUrl = (set) => {
  const durationMin = Number(set.timeMinutes || set.timeLimit || 30);

  // Company-wise sets run in the dedicated Company-wise Test page with Monaco editor & sections
  if (set.category === "company" || set.category === "company-wise") {
    return `/student/practice-new/company-wise/${set._id || set.id}?duration=${durationMin}`;
  }

  const isCodingOnly = set.category === "coding";

  if (isCodingOnly) {
    const subjectTitle = (set.topics || []).find((t) => t.subjectTitle)?.subjectTitle;
    return `/student/practice-new/coding/workspace?${new URLSearchParams({
      ps: set._id,
      title: subjectTitle || set.title,
      duration: String(durationMin),
    }).toString()}`;
  }
  return `/student/practice-new/test?${new URLSearchParams({
    ps: set._id,
    title: set.title,
    type: categoryLabel(set.category) || "Practice",
    duration: String(durationMin),
  }).toString()}`;
};

export const checkoutUrl = (type, id) =>
  `${PRACTICE_SETS_PATH}/checkout?${new URLSearchParams({ type, id }).toString()}`;
