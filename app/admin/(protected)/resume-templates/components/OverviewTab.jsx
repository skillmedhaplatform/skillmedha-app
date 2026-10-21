"use client";
import React from "react";
import { Skeleton } from "antd";
import { formatPrice } from "@/components/resumeTemplates/access";

function Stat({ label, value, hint, tone = "slate", onClick }) {
  const tones = {
    slate: "text-slate-900",
    green: "text-emerald-600",
    blue: "text-blue-600",
    amber: "text-amber-600",
    violet: "text-violet-600",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className="flex flex-col items-start rounded-xl border border-slate-100 bg-slate-50/60 p-4 text-left transition-colors enabled:hover:border-blue-200 enabled:hover:bg-blue-50/40"
    >
      <span className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <span className={`mt-1 text-[26px] font-extrabold leading-tight ${tones[tone]}`}>{value}</span>
      {hint && <span className="mt-0.5 text-[12px] text-slate-400">{hint}</span>}
    </button>
  );
}

export default function OverviewTab({ templates, stats, loading, onNavigate }) {
  if (loading && !stats) return <Skeleton active paragraph={{ rows: 6 }} />;

  const count = (pred) => templates.filter(pred).length;
  const sales = stats?.sales || {};
  const bundles = stats?.bundles || {};
  const notConfigured = count((t) => !t.configured);

  return (
    <div className="flex flex-col gap-6">
      <section>
        <div className="mb-3 text-sm font-semibold text-slate-700">Templates</div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <Stat label="Total" value={templates.length} onClick={() => onNavigate("templates")} />
          <Stat label="Free" value={count((t) => t.access === "free")} tone="green" />
          <Stat label="Premium" value={count((t) => t.access === "premium")} tone="blue" />
          <Stat label="Bundle only" value={count((t) => t.access === "bundle")} tone="amber" />
          <Stat label="Published" value={count((t) => t.visibility === "published")} tone="green" />
          <Stat label="Hidden" value={count((t) => t.visibility === "hidden")} />
        </div>
        {notConfigured > 0 && (
          <div className="mt-2 text-[12px] text-slate-500">
            {notConfigured} template{notConfigured === 1 ? " is" : "s are"} not configured yet and show to students as
            free.
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 text-sm font-semibold text-slate-700">Bundles</div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Total" value={bundles.total ?? 0} onClick={() => onNavigate("bundles")} />
          <Stat label="Active" value={bundles.active ?? 0} tone="green" hint="Published" />
          <Stat label="Inactive" value={bundles.inactive ?? 0} hint="Draft" />
          <Stat label="Deleted" value={bundles.archived ?? 0} hint="Kept for purchase history" />
        </div>
      </section>

      <section>
        <div className="mb-3 text-sm font-semibold text-slate-700">Sales</div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Template orders" value={sales.templates?.orders ?? 0} tone="blue" onClick={() => onNavigate("purchases")} />
          <Stat label="Template revenue" value={formatPrice(sales.templates?.revenue ?? 0)} tone="blue" />
          <Stat label="Bundle orders" value={sales.bundles?.orders ?? 0} tone="amber" onClick={() => onNavigate("purchases")} />
          <Stat label="Bundle revenue" value={formatPrice(sales.bundles?.revenue ?? 0)} tone="amber" />
        </div>
      </section>
    </div>
  );
}
