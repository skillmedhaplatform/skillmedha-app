"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

// ── Icon set ─────────────────────────────────────────────────────────────────
const icons = {
  warning: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  lock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  ),
  mail: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
};

// ── Preset reasons ────────────────────────────────────────────────────────────
const PRESETS = {
  "email-not-verified": {
    icon: "mail",
    iconVariant: "warning",
    title: "Verify Your Email",
    message:
      "Your email address hasn't been verified yet. Please check your inbox (and spam folder) and click the verification link to unlock full access.",
    primaryLabel: "Go to Dashboard",
    primaryHref: "/dashboard",
    secondaryLabel: "Contact Support",
    secondaryHref: "/student/help",
  },
  "access-denied": {
    icon: "lock",
    iconVariant: "lock",
    title: "Access Denied",
    message:
      "You don't have the required permissions to view this page. If you believe this is a mistake, please contact your administrator.",
    primaryLabel: "Go Back",
    primaryHref: null, // will use router.back()
    secondaryLabel: "Go to Dashboard",
    secondaryHref: "/dashboard",
  },
  "feature-disabled": {
    icon: "lock",
    iconVariant: "info",
    title: "Feature Not Available",
    message:
      "This feature has been disabled for your organization. Please reach out to your administrator for more information.",
    primaryLabel: "Go to Dashboard",
    primaryHref: "/dashboard",
    secondaryLabel: null,
    secondaryHref: null,
  },
  "maintenance": {
    icon: "warning",
    iconVariant: "warning",
    title: "Under Maintenance",
    message:
      "This section is currently undergoing maintenance. Please try again shortly.",
    primaryLabel: "Go to Dashboard",
    primaryHref: "/dashboard",
    secondaryLabel: null,
    secondaryHref: null,
  },
  "restricted-org": {
    icon: "lock",
    iconVariant: "error",
    title: "Restricted Access",
    message:
      "Your organization layout prevents access to the core platform. You may only view the scheduled tests portal.",
    primaryLabel: "Back to Tests",
    primaryHref: "/student/tests",
    secondaryLabel: null,
    secondaryHref: null,
  },
};

// ── Inner component (uses search params) ──────────────────────────────────────
function BlockedContent() {
  const params = useSearchParams();
  const router = useRouter();

  // Query params a caller can pass:
  //   ?reason=email-not-verified        → loads a preset
  //   ?title=Custom+Title               → override title
  //   ?message=Custom+message+text      → override message
  //   ?icon=warning|error|info|lock|mail
  //   ?iconVariant=warning|error|info|lock
  //   ?primaryLabel=Btn+Text&primaryHref=/some-path
  //   ?secondaryLabel=Btn+Text&secondaryHref=/other-path

  const reason = params.get("reason") || "";
  const preset = PRESETS[reason] || {};

  const icon        = params.get("icon")          || preset.icon          || "lock";
  const iconVariant = params.get("iconVariant")   || preset.iconVariant   || "info";
  const title       = params.get("title")         || preset.title         || "Access Restricted";
  const messageText = params.get("message")       || preset.message       || "You are not allowed to view this page.";

  const primaryLabel  = params.get("primaryLabel")  || preset.primaryLabel  || "Go to Dashboard";
  const primaryHref   = params.get("primaryHref")   || preset.primaryHref   || "/dashboard";
  const secondaryLabel = params.get("secondaryLabel") || preset.secondaryLabel || null;
  const secondaryHref  = params.get("secondaryHref")  || preset.secondaryHref  || null;

  const handlePrimary = () => {
    if (primaryHref === "back") router.back();
    else router.push(primaryHref);
  };

  const handleSecondary = () => {
    if (!secondaryHref) return;
    if (secondaryHref === "back") router.back();
    else router.push(secondaryHref);
  };

  const iconVariantClasses = {
    warning: "bg-[#fff8e1] border-2 border-solid border-[#ffe082] [&_svg]:text-[#f59e0b]",
    error: "bg-[#fff1f0] border-2 border-solid border-[#ffa39e] [&_svg]:text-[#ef4444]",
    info: "bg-[#e8f5e9] border-2 border-solid border-[#a5d6a7] [&_svg]:text-[#24A058]",
    lock: "bg-[#f3f0ff] border-2 border-solid border-[#c4b5fd] [&_svg]:text-[#7c3aed]"
  };

  return (
    <div className="flex items-center justify-center min-h-full w-full p-8">
      <div className="bg-white rounded-[1.25rem] border-[0.8px] border-solid border-[#0000001f] shadow-[0_8px_40px_rgba(0,0,0,0.06)] p-12 max-w-[540px] w-full text-center flex flex-col items-center gap-5">
        {/* Icon */}
        <div className={`w-[80px] h-[80px] rounded-full flex items-center justify-center mb-2 shrink-0 [&_svg]:w-[38px] [&_svg]:h-[38px] ${iconVariantClasses[iconVariant] || iconVariantClasses.info}`}>
          {icons[icon] || icons.lock}
        </div>

        {/* Reason badge */}
        {reason && (
          <span className="inline-block bg-[#f1f5f9] text-[#64748b] rounded-full py-1 px-[0.85rem] text-[0.78rem] font-semibold tracking-[0.04em] uppercase -mt-1">{reason.replace(/-/g, " ")}</span>
        )}

        {/* Heading */}
        <h1 className="text-[1.55rem] font-extrabold text-[#0f172a] leading-[1.25] m-0">{title}</h1>

        {/* Accent divider */}
        <div className="w-[48px] h-[3px] rounded-full bg-[#24A058] my-1" />

        {/* Body message */}
        <p className="text-[0.95rem] text-[#64748b] leading-[1.65] m-0 max-w-[400px]">{messageText}</p>

        {/* Action buttons */}
        <div className="flex gap-3 flex-wrap justify-center mt-2">
          <button id="blocked-primary-btn" onClick={handlePrimary} className="inline-flex items-center gap-[0.4rem] bg-[#1E69DA] text-white border-none rounded-lg py-[0.6rem] px-[1.5rem] text-[0.9rem] font-semibold cursor-pointer no-underline transition-all duration-200 hover:bg-[#219653] hover:-translate-y-[1px] active:translate-y-0">
            {primaryLabel}
          </button>

          {secondaryLabel && (
            <button id="blocked-secondary-btn" onClick={handleSecondary} className="inline-flex items-center gap-[0.4rem] bg-transparent text-[#64748b] border border-solid border-[#cbd5e1] rounded-lg py-[0.6rem] px-[1.5rem] text-[0.9rem] font-semibold cursor-pointer no-underline transition-all duration-200 hover:border-[#24A058] hover:text-[#24A058] hover:-translate-y-[1px] active:translate-y-0">
              {secondaryLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page export ───────────────────────────────────────────────────────────────
export default function BlockedPage() {
  return (
    <Suspense fallback={null}>
      <BlockedContent />
    </Suspense>
  );
}
