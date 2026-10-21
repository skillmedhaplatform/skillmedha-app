"use client";

import React from "react";
import {
  FiBookOpen,
  FiClock,
  FiTag,
  FiLayers,
  FiCheck,
  FiCode,
  FiCpu,
  FiPieChart,
  FiBriefcase,
} from "react-icons/fi";
import {
  categoryLabel,
  formatDuration,
  difficultyLabel,
  formatPrice,
  levelLabel,
  planLabel,
} from "./constants";

// Shared by the admin preview and the student catalog, so both always look
// identical. `item` is a practice set or (with `isBundle`) a bundle exactly
// as the API returns it.

const PLAN_BADGE = {
  free: "bg-[#22D3A6] text-white",
  premium: "bg-[#2563EB] text-white",
  bundle: "bg-[#F59E0B] text-white",
};

// Artwork used when the admin hasn't uploaded an image: a themed gradient per
// category with soft shapes, a dotted texture and a large category icon.
const FALLBACK_ART = {
  nontechnical: { bg: "from-[#1E3A8A] via-[#2563EB] to-[#60A5FA]", Icon: FiPieChart },
  technical: { bg: "from-[#065F46] via-[#0D9488] to-[#34D399]", Icon: FiCpu },
  coding: { bg: "from-[#0F172A] via-[#312E81] to-[#6366F1]", Icon: FiCode },
  bundle: { bg: "from-[#9A3412] via-[#EA580C] to-[#FBBF24]", Icon: FiLayers },
  company: { bg: "from-[#3B0764] via-[#6D28D9] to-[#A78BFA]", Icon: FiBriefcase },
};

// Company sets use the company's own colour and initials (set under
// Practice → Company-wise) so each company is recognisable at a glance.
function companyBrandOf(item) {
  if (item.companyBrand) return item.companyBrand;
  const title = (item.topics || []).find((t) => t.subjectTitle)?.subjectTitle;
  return title ? { title, initials: title.slice(0, 2).toUpperCase(), color: "" } : null;
}

function CardArt({ item, isBundle }) {
  const key = isBundle ? "bundle" : item.category;
  const { bg, Icon } = FALLBACK_ART[key] || FALLBACK_ART.nontechnical;
  const brand = !isBundle && item.category === "company" ? companyBrandOf(item) : null;
  return (
    <div
      className={`relative h-full w-full overflow-hidden bg-gradient-to-br ${bg}`}
      style={
        brand?.color
          ? { backgroundImage: `linear-gradient(135deg, ${brand.color}, ${brand.color}cc 55%, #0f172a)` }
          : undefined
      }
    >
      {brand?.initials && (
        <div className="absolute right-4 top-1/2 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-2xl bg-white/95 text-[20px] font-black tracking-tight shadow-lg transition-transform duration-500 group-hover:scale-110"
          style={{ color: brand.color || "#6D28D9" }}
        >
          {brand.initials}
        </div>
      )}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.55) 1px, transparent 1px)",
          backgroundSize: "14px 14px",
        }}
      />
      <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/15 blur-[2px]" />
      <div className="absolute -bottom-12 -left-6 h-32 w-32 rounded-full bg-black/15" />
      {!brand?.initials && (
        <Icon className="absolute bottom-3 right-4 text-[64px] text-white/25 transition-transform duration-500 group-hover:scale-110" />
      )}
      <div className="absolute bottom-3 left-4 right-20 line-clamp-2 text-[13px] font-extrabold leading-tight text-white/90 drop-shadow">
        {item.title}
      </div>
    </div>
  );
}

function PlanBadge({ plan, className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-[3px] text-[10px] font-extrabold uppercase tracking-wider ${PLAN_BADGE[plan]} ${className}`}
    >
      {planLabel(plan)}
    </span>
  );
}

function Price({ isFree, owned, mrp, price }) {
  if (isFree) return <span className="text-[14px] font-extrabold text-blue-600">FREE</span>;
  if (owned) {
    return (
      <span className="flex items-center gap-1 text-[13px] font-extrabold text-emerald-600">
        <FiCheck strokeWidth={3} /> Unlocked
      </span>
    );
  }
  return (
    <span className="flex items-baseline gap-1.5">
      {mrp > price && (
        <span className="text-[11px] font-medium text-slate-400 line-through">{formatPrice(mrp)}</span>
      )}
      <span className="text-[14px] font-extrabold text-blue-600">{formatPrice(price)}</span>
    </span>
  );
}

const cardStats = (item, isBundle) => ({
  plan: isBundle ? "bundle" : item.plan || "free",
  questions: (isBundle ? item.summary?.totalQuestions : item.questionCount) || 0,
  minutes: isBundle ? item.summary?.totalMinutes : item.timeMinutes,
});

/**
 * The catalog card. `owned` swaps the price for "Unlocked", `accessTag`
 * shows a small pill on the image, `active` keeps the hover look while its
 * detail popover is open.
 */
export function PracticeSetCard({ item, isBundle = false, owned = false, accessTag, onClick, active = false }) {
  const { plan, questions, minutes } = cardStats(item, isBundle);
  const categories = isBundle ? item.summary?.categories || [] : [item.category];
  const categoryTag =
    categories.length === 1 ? categoryLabel(categories[0]) : categories.length ? "Mixed" : "";

  return (
    <div
      onClick={onClick}
      className={`group flex h-full w-full flex-col overflow-hidden rounded-[14px] bg-white ring-1 transition-all duration-300 ${
        active
          ? "-translate-y-1 shadow-[0_20px_40px_-14px_rgba(15,23,42,0.35)] ring-blue-200"
          : "shadow-[0_2px_8px_rgba(15,23,42,0.06)] ring-slate-200/70 hover:-translate-y-1 hover:shadow-[0_20px_40px_-14px_rgba(15,23,42,0.35)] hover:ring-blue-200"
      } ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className="relative aspect-[2/1] w-full shrink-0 overflow-hidden">
        {item.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.thumbnail}
            alt={item.title || "Practice set"}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <CardArt item={item} isBundle={isBundle} />
        )}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/25 to-transparent" />
        <PlanBadge plan={plan} className="absolute left-3 top-3 shadow-md" />
        {categoryTag && (
          <span className="absolute right-3 top-3 rounded-md bg-[#0B1220]/85 px-2 py-[3px] text-[10.5px] font-semibold text-white backdrop-blur-sm">
            {categoryTag}
          </span>
        )}
        {accessTag && (
          <span className="absolute bottom-2.5 left-3 flex max-w-[85%] items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-[3px] text-[10px] font-bold text-white shadow-md">
            <FiCheck className="shrink-0" strokeWidth={3} /> <span className="truncate">{accessTag}</span>
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-4 pb-3.5 pt-3.5">
        <span
          className={`w-fit rounded-md px-2 py-[3px] text-[9.5px] font-extrabold uppercase tracking-[0.08em] ${
            isBundle ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-500"
          }`}
        >
          {isBundle ? "Bundle" : levelLabel(item.level) || "Level"}
        </span>
        <div
          className={`mt-2 line-clamp-2 text-[15px] font-extrabold leading-snug transition-colors ${
            active ? "text-blue-600" : "text-slate-900 group-hover:text-blue-600"
          }`}
        >
          {item.title || (isBundle ? "Untitled bundle" : "Untitled practice set")}
        </div>
        <div className="mb-4 mt-2 flex items-center gap-3.5 text-[12px] text-slate-500">
          <span className="flex items-center gap-1">
            <FiBookOpen className="text-blue-500" /> {questions} Qs
          </span>
          <span className="flex items-center gap-1">
            <FiClock className="text-blue-500" /> {formatDuration(minutes)}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="flex items-center gap-1.5 text-[12px] font-bold text-slate-800">
            {isBundle ? (
              <>
                <FiLayers className="text-amber-500" /> Full Package
              </>
            ) : (
              <>
                <FiTag className="text-blue-600" /> Practice Set
              </>
            )}
          </span>
          <Price isFree={plan === "free"} owned={owned} mrp={item.mrp} price={item.price} />
        </div>
      </div>
    </div>
  );
}

const ACTION_LABEL = {
  free: "Start Practicing Free",
  premium: "Buy Practice Set",
  bundle: "Unlock Bundle",
};

const MAX_TOPICS = 6;

/**
 * The hover / detail panel shown next to a card. `actionLabel` overrides the
 * default button text (e.g. "Start Practice" once the student owns it),
 * `note` adds a line above the button (e.g. "Access till 12 Mar 2027") and
 * `plain` drops the panel chrome for use inside a popover.
 */
export function PracticeSetDetails({
  item,
  isBundle = false,
  actionLabel,
  onAction,
  note,
  actionLoading = false,
  plain = false,
}) {
  const { plan, questions, minutes } = cardStats(item, isBundle);
  const topicTitles = isBundle
    ? item.summary?.topicTitles || []
    : (item.topics || []).map((t) => t.topicTitle).filter(Boolean);
  const shownTopics = topicTitles.slice(0, MAX_TOPICS);
  const hiddenTopics = topicTitles.length - shownTopics.length;

  return (
    <div
      className={
        plain
          ? "w-full bg-white p-4"
          : "w-full rounded-[14px] bg-white p-4 shadow-[0_18px_44px_-12px_rgba(15,23,42,0.3)] ring-1 ring-slate-200/70"
      }
    >
      <div className="text-[16px] font-extrabold leading-snug text-slate-900">
        {item.title || (isBundle ? "Untitled bundle" : "Untitled practice set")}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <PlanBadge plan={plan} className="!rounded-md !px-2" />
        <span className="rounded-md bg-slate-100 px-2 py-[3px] text-[10px] font-extrabold uppercase tracking-wider text-slate-700">
          {isBundle ? "Bundle" : levelLabel(item.level) || "Level"}
        </span>
        {!isBundle && (
          <span className="rounded-md bg-violet-50 px-2 py-[3px] text-[10px] font-extrabold uppercase tracking-wider text-violet-600">
            {difficultyLabel(item.difficulty)}
          </span>
        )}
      </div>
      <div className="mt-2.5 text-[12px] text-slate-500">
        {questions} Questions <span className="mx-1.5 text-slate-300">•</span> {formatDuration(minutes)}
      </div>

      {isBundle && (item.summary?.levels || []).length > 0 && (
        <div className="mt-3.5">
          <div className="text-[12px] font-bold text-slate-800">Levels Included:</div>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {item.summary.levels.map((l) => (
              <span
                key={l}
                className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
              >
                {levelLabel(l)}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3.5">
        <div className="text-[12px] font-bold text-slate-800">
          {isBundle ? "Topics Covered:" : `Topics Covered in ${levelLabel(item.level) || "this set"}:`}
        </div>
        {isBundle ? (
          <div className="mt-1 text-[13px] text-slate-600">
            {item.topicsText || (topicTitles.length ? `${topicTitles.length} topics` : "No topics yet")}
          </div>
        ) : shownTopics.length ? (
          <ul className="mt-1.5 space-y-1.5">
            {shownTopics.map((title) => (
              <li key={title} className="flex items-start gap-1.5 text-[12px] leading-snug text-slate-600">
                <FiCheck className="mt-[2px] shrink-0 text-blue-600" strokeWidth={3} /> {title}
              </li>
            ))}
            {hiddenTopics > 0 && (
              <li className="pl-5 text-[11px] font-semibold text-blue-600">+{hiddenTopics} more topics</li>
            )}
          </ul>
        ) : (
          <div className="mt-1 text-[12px] text-slate-400">No topics selected yet</div>
        )}
      </div>

      {item.description && (
        <div className="mt-3 line-clamp-3 text-[12px] leading-relaxed text-slate-500">{item.description}</div>
      )}

      {isBundle && item.summary?.savings > 0 && (
        <div className="mt-3.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-[11.5px] font-bold leading-snug text-emerald-700">
          Save {formatPrice(item.summary.savings)} compared to individual purchases
        </div>
      )}

      {note && <div className="mt-3.5 text-center text-[11.5px] font-semibold text-emerald-600">{note}</div>}

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onAction?.();
        }}
        disabled={actionLoading}
        className={`${note ? "mt-2" : "mt-4"} h-10 w-full rounded-lg text-[13px] font-bold text-white shadow-md transition-all hover:-translate-y-px disabled:cursor-wait disabled:opacity-70 ${
          isBundle
            ? "bg-[#F59E0B] shadow-amber-200 hover:bg-[#EA8C06]"
            : "bg-[#1D6AE5] shadow-blue-200 hover:bg-[#1558C7]"
        }`}
      >
        {actionLoading ? "Please wait…" : actionLabel || ACTION_LABEL[plan]}
      </button>
    </div>
  );
}
