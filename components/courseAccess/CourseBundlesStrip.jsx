"use client";

import { forwardRef } from "react";
import { BsStack, BsCheckCircleFill, BsArrowRight } from "react-icons/bs";
import { courseBundleCheckoutUrl, formatPrice } from "./access";

// Admin-created course bundles, shown above the course grid. Clicking a
// bundle opens its checkout, which lists every course it includes.
const CourseBundlesStrip = forwardRef(function CourseBundlesStrip({ bundles, highlightId, onOpen }, ref) {
  if (!bundles?.length) return null;

  return (
    <section ref={ref} className="mx-auto mb-8 w-full px-4 lg:px-8">
      <div className="mb-3 flex items-center gap-2">
        <BsStack className="text-violet-600" />
        <h2 className="m-0 text-[17px] font-[800] text-slate-800">Course bundles</h2>
        <span className="text-[13px] font-medium text-slate-400">Save more by learning together</span>
      </div>
      <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
        {bundles.map((bundle) => {
          const owned = bundle.entitlement?.unlocked;
          const mrp = Number(bundle.mrp) || 0;
          const price = Number(bundle.price) || 0;
          const off = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
          const highlighted = highlightId && String(highlightId) === String(bundle._id);
          return (
            <button
              key={bundle._id}
              type="button"
              onClick={() => onOpen(courseBundleCheckoutUrl(bundle._id))}
              className={`group flex w-[300px] shrink-0 cursor-pointer flex-col rounded-[20px] border bg-white p-4 text-left shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] ${
                highlighted ? "border-violet-400 ring-2 ring-violet-200" : "border-slate-100"
              }`}
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="line-clamp-2 text-[15px] font-[800] leading-[20px] text-slate-800 group-hover:text-violet-700">
                  {bundle.title}
                </div>
                {bundle.featured && !owned && (
                  <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700">
                    Popular
                  </span>
                )}
              </div>
              {bundle.description && (
                <p className="mb-3 line-clamp-2 text-[12px] font-medium leading-relaxed text-slate-500">
                  {bundle.description}
                </p>
              )}
              <ul className="mb-3 flex flex-col gap-1">
                {(bundle.courses || []).slice(0, 3).map((c) => (
                  <li key={c.courseId} className="flex items-center gap-1.5 text-[12px] text-slate-600">
                    <BsCheckCircleFill
                      className={`shrink-0 text-[10px] ${(bundle.ownedIds || []).includes(c.courseId) ? "text-emerald-500" : "text-violet-400"}`}
                    />
                    <span className="truncate">{c.title || "Course"}</span>
                  </li>
                ))}
                {(bundle.courses || []).length > 3 && (
                  <li className="text-[12px] font-semibold text-violet-600">+{bundle.courses.length - 3} more</li>
                )}
              </ul>
              <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
                {owned ? (
                  <span className="flex items-center gap-1.5 text-[13px] font-bold text-emerald-600">
                    <BsCheckCircleFill /> Purchased
                  </span>
                ) : (
                  <span className="flex items-baseline gap-2">
                    <span className="text-[18px] font-[800] text-slate-900">{formatPrice(price)}</span>
                    {mrp > price && <span className="text-[12px] text-slate-400 line-through">{formatPrice(mrp)}</span>}
                    {off > 0 && <span className="text-[11px] font-bold text-emerald-600">{off}% off</span>}
                  </span>
                )}
                <span className="flex items-center gap-1 text-[12px] font-bold text-violet-700">
                  {bundle.courses?.length || 0} courses <BsArrowRight />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
});

export default CourseBundlesStrip;
