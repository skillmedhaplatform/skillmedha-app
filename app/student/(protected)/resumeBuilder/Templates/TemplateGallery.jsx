"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Input, Segmented, Select } from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  EyeOutlined,
  FileTextOutlined,
  LockOutlined,
  SearchOutlined,
  StarFilled,
  SafetyCertificateOutlined,
  AppstoreOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import { templateComponents } from "./registry";
import { PreviewContext } from "./components/resumeTemplateData";
import {
  BADGE_CLASSES,
  accessValidity,
  formatPrice,
  templateBadge,
} from "@/components/resumeTemplates/access";

const A4_WIDTH = 794; // px — the width templates are designed for

// Renders a template at full A4 width and scales it down to fit its box, so
// every card shows the real layout at any screen size.
function ScaledPage({ templateKey, previewImage, ratio = 1.32 }) {
  const boxRef = useRef(null);
  const [width, setWidth] = useState(0);
  const Tmp = templateComponents[templateKey];

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scale = width ? width / A4_WIDTH : 0;
  return (
    <div ref={boxRef} className="relative w-full overflow-hidden bg-white" style={{ paddingTop: `${ratio * 100}%` }}>
      {previewImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewImage} alt="" className="absolute inset-0 h-full w-full object-cover object-top" />
      ) : (
        Tmp &&
        scale > 0 && (
          <div
            className="pointer-events-none absolute left-0 top-0 origin-top-left"
            style={{ width: A4_WIDTH, transform: `scale(${scale})` }}
          >
            <div className="bg-white p-8">
              <PreviewContext.Provider value={true}>
                <Tmp />
              </PreviewContext.Provider>
            </div>
          </div>
        )
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
    </div>
  );
}

// Layout facts (photo, columns) are measured per template and stored in the
// registry, so the Photo / Columns filters match what students actually see.
const hasPhoto = (t) => t.photo === true;
const isSingleColumn = (t) => t.columns === 1;
const isAts = (t) => (t.meta?.category || t.category) === "ATS-Friendly" || (t.features || []).some((f) => /ats/i.test(f));

const QUICK_FILTERS = [
  { key: "all", label: "All templates" },
  { key: "top", label: "Top picks", icon: <StarFilled className="text-amber-400" /> },
  { key: "ats", label: "ATS-friendly", icon: <SafetyCertificateOutlined className="text-emerald-600" /> },
  { key: "free", label: "Free" },
  { key: "premium", label: "Premium", icon: <LockOutlined /> },
  { key: "mine", label: "My templates", icon: <CheckCircleFilled className="text-emerald-500" /> },
  { key: "bundles", label: "Bundles", icon: <AppstoreOutlined className="text-amber-500" /> },
];

function TemplateCard({ template, access, onUse, onPreview }) {
  const ent = access.accessOf(template.id);
  const locked = !ent.unlocked;
  const badge = templateBadge(template.meta);
  const featured = template.meta?.featured;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_10px_rgba(15,23,42,0.06)] ring-1 ring-slate-200/70 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-16px_rgba(15,23,42,0.3)] hover:ring-blue-200">
      <div className="relative cursor-pointer" onClick={() => onPreview(template.id)}>
        <ScaledPage templateKey={template.id} previewImage={template.meta?.previewImage} />

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {featured && (
            <span className="flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-bold text-white shadow">
              <StarFilled /> Top pick
            </span>
          )}
          {isAts(template) && (
            <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-white shadow">ATS-friendly</span>
          )}
        </div>
        <span
          className={`absolute right-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold shadow ${BADGE_CLASSES[badge.tone]}`}
        >
          {locked && <LockOutlined />}
          {badge.text}
        </span>

        {/* Hover actions */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900/45 opacity-0 backdrop-blur-[1px] transition-opacity duration-200 group-hover:opacity-100">
          <Button
            type="primary"
            size="large"
            icon={locked ? <LockOutlined /> : <FileTextOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onUse(template.id);
            }}
            className={`!h-11 !rounded-xl !px-6 !font-semibold !shadow-lg ${locked ? "!bg-amber-500 hover:!bg-amber-600" : ""}`}
          >
            {locked
              ? template.meta?.access === "premium"
                ? `Unlock · ${formatPrice(template.meta.price)}`
                : "Unlock with a bundle"
              : "Use this template"}
          </Button>
          <Button
            size="large"
            icon={<EyeOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onPreview(template.id);
            }}
            className="!h-10 !rounded-xl !border-white/70 !bg-white/90 !font-semibold"
          >
            Preview
          </Button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 border-t border-slate-100 px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate text-[15px] font-bold text-slate-900">{template.label}</div>
            <div className="text-[12px] text-slate-500">{template.meta?.category || template.category}</div>
          </div>
          {ent.reason === "purchased" || ent.reason === "bundle" ? (
            <span className="shrink-0 text-[11px] font-medium text-emerald-600">{accessValidity(ent.expiresAt)}</span>
          ) : null}
        </div>
        {(template.features || []).length > 0 && (
          <div className="flex flex-wrap gap-1">
            {template.features.slice(0, 3).map((f) => (
              <span key={f} className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                {f}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BundleCard({ bundle, templatesByKey, onBuy, onShowTemplates }) {
  const owned = bundle.entitlement?.unlocked;
  const keys = bundle.templateKeys || [];
  const savings = Math.max(0, (bundle.mrp || 0) - (bundle.price || 0));

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_10px_rgba(15,23,42,0.06)] ring-1 ring-slate-200/70">
      {/* Fanned previews of the first three templates */}
      <div className="relative h-[260px] overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        {keys.slice(0, 3).map((key, i) => (
          <div
            key={key}
            className="absolute top-6 w-[42%] overflow-hidden rounded-lg shadow-xl ring-1 ring-slate-200"
            style={{
              left: `${8 + i * 25}%`,
              transform: `rotate(${(i - 1) * 6}deg) translateY(${i === 1 ? -6 : 8}px)`,
              zIndex: i === 1 ? 3 : 2,
            }}
          >
            <ScaledPage templateKey={key} />
          </div>
        ))}
        <span className="absolute left-3 top-3 z-10 rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-bold text-white shadow">
          {keys.length} templates
        </span>
        {bundle.featured && (
          <span className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-amber-600 shadow">
            <StarFilled /> Best value
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="text-[17px] font-bold text-slate-900">{bundle.title}</div>
          {owned ? (
            <span className="shrink-0 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700">Purchased</span>
          ) : (
            <div className="shrink-0 text-right">
              {bundle.mrp > bundle.price && (
                <div className="text-[12px] text-slate-400 line-through">{formatPrice(bundle.mrp)}</div>
              )}
              <div className="text-[20px] font-extrabold text-blue-600">{formatPrice(bundle.price)}</div>
            </div>
          )}
        </div>
        {bundle.description && <p className="text-[13px] text-slate-500">{bundle.description}</p>}
        <div className="flex flex-wrap gap-1.5">
          {(bundle.templates || []).map((t) => (
            <span key={t.templateKey} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
              {t.name || templatesByKey.get(t.templateKey)?.label || t.templateKey}
            </span>
          ))}
        </div>
        {!owned && bundle.ownedKeys?.length > 0 && (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[12px] text-amber-800">
            You already own {bundle.ownedKeys.length} of these templates.
          </div>
        )}
        {!owned && savings > 0 && <div className="text-[12px] font-semibold text-emerald-600">You save {formatPrice(savings)}</div>}
        <div className="mt-auto pt-2">
          {owned ? (
            <Button block onClick={onShowTemplates} className="!h-10 !rounded-xl !font-semibold">
              Show my templates
            </Button>
          ) : (
            <Button
              block
              type="primary"
              onClick={() => onBuy(bundle._id)}
              className="!h-11 !rounded-xl !border-none !bg-amber-500 !font-semibold hover:!bg-amber-600"
            >
              Get bundle · {formatPrice(bundle.price)}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * The student's template gallery: quick filters (Top picks, ATS, Free,
 * Premium, Mine, Bundles), layout filters (style, photo, columns), search,
 * and large real-layout previews with hover actions.
 */
export default function TemplateGallery({ templates, access, onBack, onContinueEditing, onPreview, onUse, onBuyBundle }) {
  const [quick, setQuick] = useState("all");
  const [style, setStyle] = useState();
  const [photo, setPhoto] = useState("all");
  const [columns, setColumns] = useState("all");
  const [search, setSearch] = useState("");

  const templatesByKey = useMemo(() => new Map(templates.map((t) => [t.id, t])), [templates]);
  const styles = useMemo(
    () => [...new Set(templates.map((t) => t.meta?.category || t.category).filter(Boolean))],
    [templates]
  );

  const shown = templates.filter((t) => {
    const reason = access.accessOf(t.id).reason;
    if (quick === "top" && !t.meta?.featured) return false;
    if (quick === "ats" && !isAts(t)) return false;
    if (quick === "free" && reason !== "free") return false;
    if (quick === "premium" && reason === "free") return false;
    if (quick === "mine" && !["purchased", "bundle"].includes(reason)) return false;
    if (style && (t.meta?.category || t.category) !== style) return false;
    if (photo === "photo" && !hasPhoto(t)) return false;
    if (photo === "none" && hasPhoto(t)) return false;
    if (columns === "single" && !isSingleColumn(t)) return false;
    if (columns === "double" && isSingleColumn(t)) return false;
    const q = search.trim().toLowerCase();
    if (q) {
      const text = [t.label, t.meta?.category, t.category, ...(t.features || []), ...(t.bestFor || [])].join(" ").toLowerCase();
      if (!text.includes(q)) return false;
    }
    return true;
  });

  const showingBundles = quick === "bundles";
  const filtersActive = style || photo !== "all" || columns !== "all" || search.trim();
  const resetFilters = () => {
    setStyle(undefined);
    setPhoto("all");
    setColumns("all");
    setSearch("");
  };

  return (
    <>
      <div className="z-10 shrink-0 border-b border-[#e2e8f0] bg-white shadow-sm">
        <div className="flex items-center gap-4 px-4 pt-3 md:px-8">
          <button
            type="button"
            onClick={onBack}
            className="flex shrink-0 cursor-pointer items-center gap-2 border-none bg-transparent p-0 text-[14px] font-medium text-[#475569] transition-colors hover:text-[#1E69DA]"
          >
            <ArrowLeftOutlined /> Back
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:h-1">
            {QUICK_FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setQuick(f.key)}
                className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-1.5 text-[13px] font-semibold transition-all ${
                  quick === f.key
                    ? "border-[#1E69DA] bg-[#1E69DA] text-white shadow-[0_4px_12px_-2px_rgba(30,105,218,0.45)]"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-[#1E69DA]"
                }`}
              >
                {quick !== f.key && f.icon}
                {f.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onContinueEditing}
            className="flex shrink-0 items-center gap-2 rounded-md border border-[#e9d5ff] bg-[#faf5ff] px-4 py-1.5 text-[14px] font-semibold text-[#a855f7] transition-colors hover:bg-[#f3e8ff]"
          >
            <EditOutlined /> Continue Editing
          </button>
        </div>

        {!showingBundles && (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 md:px-8">
            <Select
              allowClear
              placeholder="Style"
              value={style}
              onChange={setStyle}
              options={styles.map((s) => ({ value: s, label: s }))}
              style={{ width: 160 }}
            />
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold uppercase tracking-wide text-slate-400">Photo</span>
              <Segmented
                size="small"
                value={photo}
                onChange={setPhoto}
                options={[
                  { value: "all", label: "All" },
                  { value: "photo", label: "Photo" },
                  { value: "none", label: "No photo" },
                ]}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold uppercase tracking-wide text-slate-400">Columns</span>
              <Segmented
                size="small"
                value={columns}
                onChange={setColumns}
                options={[
                  { value: "all", label: "All" },
                  { value: "single", label: "Single" },
                  { value: "double", label: "Double" },
                ]}
              />
            </div>
            <Input
              allowClear
              prefix={<SearchOutlined className="text-slate-400" />}
              placeholder="Search by name, style or role…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 260 }}
            />
            <div className="ml-auto flex items-center gap-3 text-[13px] text-slate-500">
              <span>
                <b className="text-slate-900">{shown.length}</b> template{shown.length === 1 ? "" : "s"}
              </span>
              {filtersActive && (
                <button type="button" onClick={resetFilters} className="font-semibold text-[#1E69DA] hover:underline">
                  Clear filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div
        className="flex-1 overflow-y-auto px-4 py-8 md:px-8 [&::-webkit-scrollbar-thumb]:bg-[#cbd5e1] [&::-webkit-scrollbar]:w-[6px]"
        style={{
          backgroundColor: "#f4f6fb",
          backgroundImage: "radial-gradient(#d5dbea 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      >
        <div className="mx-auto w-full max-w-[1500px]">
          {showingBundles ? (
            access.bundles.length ? (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                {access.bundles.map((b) => (
                  <BundleCard
                    key={b._id}
                    bundle={b}
                    templatesByKey={templatesByKey}
                    onBuy={onBuyBundle}
                    onShowTemplates={() => setQuick("mine")}
                  />
                ))}
              </div>
            ) : (
              <div className="py-24 text-center text-slate-500">No template bundles are available right now.</div>
            )
          ) : shown.length ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3 min-[1700px]:grid-cols-4">
              {shown.map((t) => (
                <TemplateCard key={t.id} template={t} access={access} onUse={onUse} onPreview={onPreview} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-24 text-center text-slate-500">
              {quick === "mine" ? "You haven't purchased any templates yet." : "No templates match these filters."}
              {(filtersActive || quick !== "all") && (
                <Button
                  onClick={() => {
                    resetFilters();
                    setQuick("all");
                  }}
                >
                  Show all templates
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
