// Shared wording for Free / Premium / Pro plans. The server decides who can
// open what; this only drives labels and links.

export const PLANS_PATH = "/student/plans";

export const formatPrice = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

export const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

// 90 -> "3 months", 365 -> "1 year", 45 -> "45 days"
export const durationLabel = (days) => {
  const d = Number(days) || 0;
  if (d % 365 === 0) return d === 365 ? "1 year" : `${d / 365} years`;
  if (d % 30 === 0) return d === 30 ? "1 month" : `${d / 30} months`;
  return d === 1 ? "1 day" : `${d} days`;
};

// "Get it with Pro from ₹1,999" on locked items.
export const planOfferText = (plan) =>
  plan.fromPrice ? `Get it with ${plan.name} from ${formatPrice(plan.fromPrice)}` : `Get it with ${plan.name}`;

export const PLAN_TAG_COLOR = { free: "green", premium: "gold", pro: "purple" };
