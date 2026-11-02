"use client";

import React, { forwardRef, useState } from "react";
import { Tooltip } from "antd";
import { StarFilled } from "@ant-design/icons";
import { BsStack, BsCheckCircleFill, BsArrowRight } from "react-icons/bs";
import { FiBookOpen, FiClock } from "react-icons/fi";
import { courseBundleDetailsUrl, formatPrice } from "./access";

export function StudentBundleCard({ bundle, highlighted, onOpen, className = "" }) {
  const [imgError, setImgError] = useState(false);

  const owned = bundle.entitlement?.unlocked;
  const mrp = Number(bundle.mrp) || 0;
  const price = Number(bundle.price) || 0;
  const courses = bundle.courses || [];
  const courseCount = bundle.courseIds?.length || courses.length || 0;

  const shownCourses = courses.slice(0, 2);
  const remainingCourses = courses.slice(2);
  const hiddenCount = remainingCourses.length;

  const hasThumbnail = bundle.thumbnail && !imgError;
  const targetUrl = courseBundleDetailsUrl(bundle._id);

  const handleOpen = () => {
    if (onOpen) onOpen(targetUrl);
  };

  return (
    <div
      onClick={handleOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleOpen();
        }
      }}
      className={`group flex cursor-pointer flex-col overflow-hidden rounded-[24px] border bg-white text-left transition-all duration-300 hover:-translate-y-1 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] relative ${
        highlighted
          ? "border-blue-400 ring-4 ring-blue-100 shadow-[0_16px_40px_rgba(37,99,235,0.18)]"
          : "border-slate-100 hover:border-blue-300"
      } ${className || "w-[330px] sm:w-[350px] md:w-[360px] shrink-0"}`}
    >
      {/* Header Banner / Artwork - Matches course card 180px height & rounded shape */}
      <div className="relative w-full h-[180px] p-3 pb-0 z-10 shrink-0">
        <div className="relative w-full h-full rounded-[18px] overflow-hidden bg-slate-900 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
          {hasThumbnail ? (
            <>
              {/* Ambient blurred backdrop for seamless fill */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={bundle.thumbnail}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover blur-md opacity-40 scale-110 pointer-events-none"
              />
              {/* Main uploaded image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={bundle.thumbnail}
                alt={bundle.title}
                onError={() => setImgError(true)}
                className="relative z-[1] h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Overlay gradient */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-slate-950/35 z-[2]" />
            </>
          ) : (
            <div className="relative h-full w-full bg-gradient-to-br from-slate-900 via-[#132238] to-[#0d1829] flex items-center justify-center">
              {/* Decorative subtle mesh */}
              <div
                className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage: "radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)",
                  backgroundSize: "16px 16px",
                }}
              />
              {/* Soft glowing ambient lights */}
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-blue-500/20 blur-2xl pointer-events-none" />
              <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />
              {/* Decorative watermark */}
              <BsStack className="absolute -bottom-3 -right-3 text-[92px] text-white/[0.04] pointer-events-none rotate-12" />

              {/* Center icon badge */}
              <div className="relative z-[1] flex flex-col items-center gap-1.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-md border border-white/15 shadow-inner transition-transform duration-500 group-hover:scale-110">
                  <BsStack className="text-xl text-blue-300" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">Course Bundle</span>
              </div>
            </div>
          )}

          {/* Top Badges */}
          <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5">
            {owned ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-2.5 py-0.5 text-[10.5px] font-bold text-white shadow-sm backdrop-blur-md">
                <BsCheckCircleFill className="text-[11px]" />
                Purchased
              </span>
            ) : bundle.featured ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/95 px-2.5 py-0.5 text-[10.5px] font-extrabold text-amber-950 shadow-sm backdrop-blur-md">
                <StarFilled className="text-[10px]" /> Popular
              </span>
            ) : null}
          </div>

          {/* Bottom Bar Badges on Banner */}
          <div className="absolute bottom-2.5 left-3 right-3 z-10 flex items-center justify-between text-white text-[11px] font-semibold">
            <span className="inline-flex items-center gap-1 rounded-md bg-black/60 px-2 py-0.5 backdrop-blur-md border border-white/10">
              <FiBookOpen className="text-blue-400 text-xs" />
              {courseCount} {courseCount === 1 ? "Course" : "Courses"}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-black/60 px-2 py-0.5 backdrop-blur-md border border-white/10">
              <FiClock className="text-amber-400 text-xs" />
              {bundle.validityDays > 0 ? `${bundle.validityDays} Days` : "Lifetime"}
            </span>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-5 z-10">
        {/* Title & Description */}
        <div className="mb-2.5">
          <h3
            className="text-left w-full border-none bg-transparent p-0 text-[17px] font-[800] text-slate-800 transition-colors group-hover:text-blue-600 line-clamp-2 min-h-[44px] leading-[22px] m-0"
            title={bundle.title}
          >
            {bundle.title}
          </h3>
          {bundle.description ? (
            <p className="mt-1 line-clamp-2 text-[12px] font-medium leading-relaxed text-slate-500 min-h-[36px] m-0">
              {bundle.description}
            </p>
          ) : (
            <p className="mt-1 text-[12px] italic text-slate-400 min-h-[36px] m-0">
              Comprehensive bundle package of courses
            </p>
          )}
        </div>

        {/* Included Courses Section - No individual prices */}
        <div className="mb-4 rounded-xl bg-slate-50 p-2.5 border border-slate-100 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
            <span>Included Courses</span>
            <span>{courseCount} Total</span>
          </div>
          <ul className="m-0 p-0 list-none flex flex-col gap-1">
            {shownCourses.map((c) => {
              const courseOwned = (bundle.ownedIds || []).includes(c.courseId);
              return (
                <li key={c.courseId} className="flex items-center justify-between gap-2 text-[12px] text-slate-700">
                  <span className="flex items-center gap-1.5 min-w-0">
                    <BsCheckCircleFill className={`text-[10px] shrink-0 ${courseOwned ? "text-emerald-500" : "text-blue-500"}`} />
                    <span className="truncate font-medium">{c.title || "Course"}</span>
                  </span>
                  {courseOwned && (
                    <span className="shrink-0 text-[11px] font-bold text-emerald-600">Owned</span>
                  )}
                </li>
              );
            })}
          </ul>
          {hiddenCount > 0 && (
            <Tooltip
              title={
                <div className="flex flex-col gap-0.5 text-xs py-1">
                  {remainingCourses.map((c) => (
                    <div key={c.courseId}>• {c.title || "Course"}</div>
                  ))}
                </div>
              }
            >
              <span className="inline-block pt-0.5 text-[11px] font-semibold text-blue-600 hover:text-blue-700 cursor-pointer">
                +{hiddenCount} more courses
              </span>
            </Tooltip>
          )}
        </div>

        {/* Card Footer: Pricing & Action */}
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
          <div>
            {owned ? (
              <span className="inline-flex items-center gap-1.5 text-[14px] font-extrabold text-emerald-600">
                <BsCheckCircleFill /> Unlocked
              </span>
            ) : (
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[19px] font-extrabold text-slate-900 tracking-tight">
                    {formatPrice(price)}
                  </span>
                  {mrp > price && (
                    <span className="text-[12px] text-slate-400 line-through">
                      {formatPrice(mrp)}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400">
                  {bundle.validityDays > 0 ? `${bundle.validityDays} days access` : "Lifetime access"}
                </div>
              </div>
            )}
          </div>

          <div>
            {owned ? (
              <span className="inline-flex items-center gap-1 rounded-xl bg-slate-100 group-hover:bg-slate-200 px-3.5 py-2 text-[12px] font-bold text-slate-700 transition-colors">
                View Details <BsArrowRight />
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-xl bg-blue-600 group-hover:bg-blue-700 px-3.5 py-2 text-[12px] font-bold text-white shadow-sm transition-all group-hover:shadow group-hover:translate-x-0.5">
                View Details <BsArrowRight />
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Admin-created course bundles, shown above the course grid. Clicking a
// bundle opens its checkout, which lists every course it includes.
const CourseBundlesStrip = forwardRef(function CourseBundlesStrip({ bundles, highlightId, onOpen }, ref) {
  if (!bundles?.length) return null;

  return (
    <section ref={ref} className="mx-auto mb-8 w-full px-4 lg:px-6">
      <div className="mb-3.5 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shadow-sm">
          <BsStack className="text-base" />
        </div>
        <div>
          <h2 className="m-0 text-[17px] font-[800] text-slate-800">Course Bundles</h2>
          <span className="text-[12.5px] font-medium text-slate-400">Save more by learning complementary courses together</span>
        </div>
      </div>
      <div className="no-scrollbar flex gap-6 overflow-x-auto pb-4 pt-1">
        {bundles.map((bundle) => (
          <StudentBundleCard
            key={bundle._id}
            bundle={bundle}
            highlighted={highlightId && String(highlightId) === String(bundle._id)}
            onOpen={onOpen}
          />
        ))}
      </div>
    </section>
  );
});

export default CourseBundlesStrip;

