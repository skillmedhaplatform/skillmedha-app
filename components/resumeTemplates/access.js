// Labels and links for resume templates on the student side, driven by the
// catalogue's `entitlement` ({ unlocked, reason, expiresAt, bundleTitle })
// and the template's configured `access` (free | premium | bundle).

import { formatPrice } from "@/components/practiceSets/constants";

export const RESUME_BUILDER_PATH = "/student/resumeBuilder";

export const ACCESS_OPTIONS = [
  { value: "free", label: "Free" },
  { value: "premium", label: "Premium" },
  { value: "bundle", label: "Bundle only" },
];

export const VISIBILITY_OPTIONS = [
  { value: "published", label: "Published" },
  { value: "hidden", label: "Hidden" },
];

// Same list as TEMPLATE_CATEGORIES in the template registry.
export const CATEGORY_SUGGESTIONS = ["Simple", "Professional", "Modern", "Creative", "ATS-Friendly"];

export const accessLabel = (value) => ACCESS_OPTIONS.find((o) => o.value === value)?.label || "Free";

export { formatPrice };

export const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

/**
 * Badge shown on a template card: { text, tone } where tone is one of
 * free | owned | premium | bundle.
 */
export const templateBadge = (meta) => {
  const ent = meta?.entitlement;
  if (!meta || ent?.reason === "free") return { text: "Free", tone: "free" };
  if (ent?.unlocked) return { text: ent.reason === "bundle" ? "In your bundle" : "Purchased", tone: "owned" };
  if (meta.access === "premium") return { text: formatPrice(meta.price), tone: "premium" };
  return { text: "Bundle", tone: "bundle" };
};

export const BADGE_CLASSES = {
  free: "bg-[#dcfce7] text-[#15803d]",
  owned: "bg-[#d1fae5] text-[#047857]",
  premium: "bg-[#dbeafe] text-[#1d4ed8]",
  bundle: "bg-[#fef3c7] text-[#b45309]",
};

export const accessValidity = (expiresAt) => (expiresAt ? `Access till ${formatDate(expiresAt)}` : "Lifetime access");

export const resumeCheckoutUrl = (type, id) =>
  `${RESUME_BUILDER_PATH}/checkout?${new URLSearchParams({ type, id }).toString()}`;
