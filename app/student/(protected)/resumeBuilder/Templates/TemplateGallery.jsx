"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Checkbox, Input, Popover } from "antd";
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
  FilterOutlined,
  DownOutlined,
  UserOutlined,
  ArrowRightOutlined,
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
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [photo, setPhoto] = useState([]); // [] means all, ['photo'] or ['none']
  const [columns, setColumns] = useState([]); // [] means all, ['single'] or ['double']
  const [search, setSearch] = useState("");

  const [filterOpen, setFilterOpen] = useState(false);
  const [tempStyles, setTempStyles] = useState([]);
  const [tempPhoto, setTempPhoto] = useState([]);
  const [tempColumns, setTempColumns] = useState([]);

  // Search suggestions state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchCategory, setSearchCategory] = useState("all");
  const searchContainerRef = useRef(null);

  // Close search suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync staged filters whenever popover opens
  useEffect(() => {
    if (filterOpen) {
      setTempStyles(selectedStyles);
      setTempPhoto(photo);
      setTempColumns(columns);
    }
  }, [filterOpen, selectedStyles, photo, columns]);

  const templatesByKey = useMemo(() => new Map(templates.map((t) => [t.id, t])), [templates]);
  const styles = useMemo(
    () => [...new Set(templates.map((t) => t.meta?.category || t.category).filter(Boolean))],
    [templates]
  );

  // Search index derived strictly from Resume Builder data
  const searchIndex = useMemo(() => {
    const list = [];

    // 1. Templates
    templates.forEach((t) => {
      list.push({
        id: `tpl-${t.id}`,
        type: "template",
        title: t.label,
        category: t.meta?.category || t.category || "Template",
        subtitle: `${t.columns === 1 ? "Single column" : "Two columns"} • ${t.photo ? "Photo" : "No photo"} • ${(t.bestFor || []).slice(0, 2).join(", ")}`,
        tag: "Template",
        templateId: t.id,
        searchable: [
          t.label,
          t.meta?.category,
          t.category,
          ...(t.features || []),
          ...(t.bestFor || []),
          t.description || "",
          t.summary || "",
        ].join(" ").toLowerCase(),
      });
    });

    // 2. Roles ("bestFor") from templates
    const roleMap = new Map();
    templates.forEach((t) => {
      (t.bestFor || []).forEach((role) => {
        if (!role) return;
        const count = (roleMap.get(role) || 0) + 1;
        roleMap.set(role, count);
      });
    });

    roleMap.forEach((count, role) => {
      list.push({
        id: `role-${role}`,
        type: "role",
        title: role,
        category: "Role",
        subtitle: `${count} template${count === 1 ? "" : "s"} recommended for this role`,
        tag: "Role",
        searchable: role.toLowerCase(),
      });
    });

    // 3. Styles / Categories
    styles.forEach((st) => {
      const count = templates.filter((t) => (t.meta?.category || t.category) === st).length;
      list.push({
        id: `style-${st}`,
        type: "style",
        title: st,
        category: "Style",
        subtitle: `${count} template${count === 1 ? "" : "s"} in this design style`,
        tag: "Style",
        searchable: st.toLowerCase(),
      });
    });

    // 4. Key layout features
    const featureSet = new Set();
    templates.forEach((t) => {
      (t.features || []).forEach((f) => {
        if (f) featureSet.add(f.trim());
      });
    });
    featureSet.forEach((feat) => {
      if (!list.some((item) => item.title.toLowerCase() === feat.toLowerCase())) {
        const count = templates.filter((t) => (t.features || []).some((f) => f.toLowerCase() === feat.toLowerCase())).length;
        list.push({
          id: `feat-${feat}`,
          type: "feature",
          title: feat,
          category: "Feature",
          subtitle: `${count} template${count === 1 ? "" : "s"} with this feature`,
          tag: "Feature",
          searchable: feat.toLowerCase(),
        });
      }
    });

    // 5. Bundles
    (access?.bundles || []).forEach((b) => {
      list.push({
        id: `bundle-${b._id}`,
        type: "bundle",
        title: b.title,
        category: "Bundle",
        subtitle: `${(b.templateKeys || []).length} templates included • Best value`,
        tag: "Bundle",
        searchable: [b.title, b.description || ""].join(" ").toLowerCase(),
      });
    });

    return list;
  }, [templates, styles, access?.bundles]);

  // Filtered search suggestions
  const searchSuggestions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];

    return searchIndex
      .filter((item) => {
        const matchesCat = searchCategory === "all" || item.type === searchCategory;
        if (!matchesCat) return false;
        return item.searchable.includes(q);
      })
      .slice(0, 7);
  }, [searchIndex, search, searchCategory]);

  // Popular searches for empty query derived from Resume Builder data
  const popularSearches = useMemo(() => {
    return [
      "ATS-Friendly",
      "Software Engineers",
      "Modern",
      "Freshers",
      "Professional",
      "Creative",
      "Developers",
      "Single column",
    ];
  }, []);

  const handleSelectSuggestion = (item) => {
    const val = typeof item === "string" ? item : item.title;
    setSearch(val);
    setIsSearchOpen(false);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Escape") {
      setIsSearchOpen(false);
    } else if (e.key === "Enter" && search.trim()) {
      if (searchSuggestions.length > 0) {
        handleSelectSuggestion(searchSuggestions[0]);
      } else {
        setIsSearchOpen(false);
      }
    }
  };

  const getSuggestionIcon = (type) => {
    switch (type) {
      case "template":
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#1E69DA] group-hover:bg-[#1E69DA] group-hover:text-white transition-colors">
            <FileTextOutlined className="text-[15px]" />
          </div>
        );
      case "role":
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <UserOutlined className="text-[15px]" />
          </div>
        );
      case "style":
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
            <AppstoreOutlined className="text-[15px]" />
          </div>
        );
      case "bundle":
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 group-hover:bg-rose-500 group-hover:text-white transition-colors">
            <AppstoreOutlined className="text-[15px]" />
          </div>
        );
      default:
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <SafetyCertificateOutlined className="text-[15px]" />
          </div>
        );
    }
  };

  const getSuggestionBadgeClass = (type) => {
    switch (type) {
      case "template":
        return "bg-blue-50 text-blue-700 border-blue-200/60";
      case "role":
        return "bg-purple-50 text-purple-700 border-purple-200/60";
      case "style":
        return "bg-amber-50 text-amber-700 border-amber-200/60";
      case "bundle":
        return "bg-rose-50 text-rose-700 border-rose-200/60";
      default:
        return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
    }
  };

  const shown = templates.filter((t) => {
    const reason = access.accessOf(t.id).reason;
    if (quick === "top" && !t.meta?.featured) return false;
    if (quick === "ats" && !isAts(t)) return false;
    if (quick === "free" && reason !== "free") return false;
    if (quick === "premium" && reason === "free") return false;
    if (quick === "mine" && !["purchased", "bundle"].includes(reason)) return false;

    // Style filter (checkboxes)
    if (selectedStyles.length > 0 && !selectedStyles.includes(t.meta?.category || t.category)) return false;

    // Photo filter
    const hasP = hasPhoto(t);
    if (photo.length === 1) {
      if (photo[0] === "photo" && !hasP) return false;
      if (photo[0] === "none" && hasP) return false;
    }

    // Columns filter
    const isSingle = isSingleColumn(t);
    if (columns.length === 1) {
      if (columns[0] === "single" && !isSingle) return false;
      if (columns[0] === "double" && isSingle) return false;
    }

    const q = search.trim().toLowerCase();
    if (q) {
      const text = [t.label, t.meta?.category, t.category, ...(t.features || []), ...(t.bestFor || [])].join(" ").toLowerCase();
      if (!text.includes(q)) return false;
    }
    return true;
  });

  const showingBundles = quick === "bundles";
  const activeFilterCount =
    (selectedStyles.length > 0 ? selectedStyles.length : 0) +
    (photo.length === 1 ? 1 : 0) +
    (columns.length === 1 ? 1 : 0);

  const filtersActive = activeFilterCount > 0 || search.trim();

  const resetFilters = () => {
    setSelectedStyles([]);
    setPhoto([]);
    setColumns([]);
    setSearch("");
    setTempStyles([]);
    setTempPhoto([]);
    setTempColumns([]);
    setIsSearchOpen(false);
  };

  const handleApplyFilters = () => {
    setSelectedStyles(tempStyles);
    setPhoto(tempPhoto);
    setColumns(tempColumns);
    setFilterOpen(false);
  };

  const handleResetTemp = () => {
    setTempStyles([]);
    setTempPhoto([]);
    setTempColumns([]);
  };

  const filterDropdownContent = (
    <div className="w-[520px] max-w-[92vw] bg-white">
      {/* Dropdown Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
        <div className="flex items-center gap-2">
          <FilterOutlined className="text-[#1E69DA]" />
          <span className="text-[14px] font-bold text-slate-800">Filter Templates</span>
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-[#1E69DA]">
              {activeFilterCount} active
            </span>
          )}
        </div>
        {(tempStyles.length > 0 || tempPhoto.length === 1 || tempColumns.length === 1) && (
          <button
            type="button"
            onClick={handleResetTemp}
            className="text-[12px] font-medium text-slate-500 hover:text-[#1E69DA] cursor-pointer transition-colors"
          >
            Reset all
          </button>
        )}
      </div>

      {/* Dropdown 3-Column Body */}
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 p-4 gap-4 sm:gap-0">
        {/* Style Column */}
        <div className="sm:pr-4">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Style</div>
          <div className="flex flex-col gap-1 max-h-[190px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-200">
            <label className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-slate-50 cursor-pointer select-none transition-colors text-[13px] text-slate-700">
              <Checkbox
                checked={tempStyles.length === 0}
                onChange={() => setTempStyles([])}
              />
              <span className={tempStyles.length === 0 ? "font-semibold text-slate-900" : ""}>All styles</span>
            </label>
            {styles.map((s) => {
              const isChecked = tempStyles.includes(s);
              return (
                <label
                  key={s}
                  className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-slate-50 cursor-pointer select-none transition-colors text-[13px] text-slate-700"
                >
                  <Checkbox
                    checked={isChecked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setTempStyles((prev) => [...prev, s]);
                      } else {
                        setTempStyles((prev) => prev.filter((x) => x !== s));
                      }
                    }}
                  />
                  <span className={isChecked ? "font-semibold text-slate-900" : ""}>{s}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Photo Column */}
        <div className="sm:px-4">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Photo</div>
          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-slate-50 cursor-pointer select-none transition-colors text-[13px] text-slate-700">
              <Checkbox
                checked={tempPhoto.length === 0 || tempPhoto.length === 2}
                onChange={() => setTempPhoto([])}
              />
              <span className={tempPhoto.length === 0 || tempPhoto.length === 2 ? "font-semibold text-slate-900" : ""}>
                All
              </span>
            </label>
            <label className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-slate-50 cursor-pointer select-none transition-colors text-[13px] text-slate-700">
              <Checkbox
                checked={tempPhoto.includes("photo") && tempPhoto.length !== 2}
                onChange={(e) => {
                  if (e.target.checked) {
                    setTempPhoto(["photo"]);
                  } else {
                    setTempPhoto([]);
                  }
                }}
              />
              <span className={tempPhoto.includes("photo") && tempPhoto.length !== 2 ? "font-semibold text-slate-900" : ""}>
                Photo
              </span>
            </label>
            <label className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-slate-50 cursor-pointer select-none transition-colors text-[13px] text-slate-700">
              <Checkbox
                checked={tempPhoto.includes("none") && tempPhoto.length !== 2}
                onChange={(e) => {
                  if (e.target.checked) {
                    setTempPhoto(["none"]);
                  } else {
                    setTempPhoto([]);
                  }
                }}
              />
              <span className={tempPhoto.includes("none") && tempPhoto.length !== 2 ? "font-semibold text-slate-900" : ""}>
                No photo
              </span>
            </label>
          </div>
        </div>

        {/* Columns Column */}
        <div className="sm:pl-4">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Columns</div>
          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-slate-50 cursor-pointer select-none transition-colors text-[13px] text-slate-700">
              <Checkbox
                checked={tempColumns.length === 0 || tempColumns.length === 2}
                onChange={() => setTempColumns([])}
              />
              <span className={tempColumns.length === 0 || tempColumns.length === 2 ? "font-semibold text-slate-900" : ""}>
                All
              </span>
            </label>
            <label className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-slate-50 cursor-pointer select-none transition-colors text-[13px] text-slate-700">
              <Checkbox
                checked={tempColumns.includes("single") && tempColumns.length !== 2}
                onChange={(e) => {
                  if (e.target.checked) {
                    setTempColumns(["single"]);
                  } else {
                    setTempColumns([]);
                  }
                }}
              />
              <span className={tempColumns.includes("single") && tempColumns.length !== 2 ? "font-semibold text-slate-900" : ""}>
                Single
              </span>
            </label>
            <label className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-slate-50 cursor-pointer select-none transition-colors text-[13px] text-slate-700">
              <Checkbox
                checked={tempColumns.includes("double") && tempColumns.length !== 2}
                onChange={(e) => {
                  if (e.target.checked) {
                    setTempColumns(["double"]);
                  } else {
                    setTempColumns([]);
                  }
                }}
              />
              <span className={tempColumns.includes("double") && tempColumns.length !== 2 ? "font-semibold text-slate-900" : ""}>
                Double
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Dropdown Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-5 py-3">
        <button
          type="button"
          onClick={() => setFilterOpen(false)}
          className="text-[13px] font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <Button
          type="primary"
          onClick={handleApplyFilters}
          className="!h-9 !rounded-xl !bg-[#1E69DA] hover:!bg-blue-700 !font-semibold !px-5 !shadow-sm"
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <div className="z-10 shrink-0 border-b border-[#e2e8f0] bg-white shadow-sm">
        {/* Single Row: Back, Quick Filters, Dynamic Search Bar, Continue Editing, and Filter Button */}
        <div className="flex items-center gap-4 px-4 py-3 md:px-8">
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

          <div className="flex shrink-0 items-center gap-3">
            {/* Dynamic Search Bar with live suggestions */}
            <div ref={searchContainerRef} className="relative">
              <Input
                allowClear
                prefix={<SearchOutlined className="text-slate-400" />}
                placeholder="Search by name, style or role…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  if (!isSearchOpen) setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                onKeyDown={handleSearchKeyDown}
                className="!h-9 w-[180px] sm:w-[220px] md:w-[260px] !rounded-xl"
              />

              {/* Suggestions Dropdown */}
              {isSearchOpen && (
                <div className="absolute right-0 top-full mt-2 w-[340px] sm:w-[420px] max-h-[460px] flex flex-col rounded-2xl bg-white border border-slate-200/90 shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                  {/* Category Tabs */}
                  <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-100 bg-slate-50/70 overflow-x-auto text-xs shrink-0">
                    {[
                      { id: "all", label: "All" },
                      { id: "template", label: "Templates" },
                      { id: "role", label: "Roles" },
                      { id: "style", label: "Styles" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setSearchCategory(tab.id)}
                        className={`px-2.5 py-1 rounded-full font-semibold transition-colors shrink-0 cursor-pointer border-none ${
                          searchCategory === tab.id
                            ? "bg-[#1E69DA] text-white shadow-xs"
                            : "bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Suggestions List / Popular Searches */}
                  <div className="overflow-y-auto max-h-[340px] p-2 space-y-1 divide-y divide-slate-100">
                    {search.trim() === "" ? (
                      // Empty query: Show Popular Searches
                      <div className="p-3">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                          <StarFilled className="text-amber-400 text-[13px]" />
                          Popular Searches
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {popularSearches.map((item) => (
                            <button
                              key={item}
                              type="button"
                              onClick={() => handleSelectSuggestion(item)}
                              className="rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-[#1E69DA] px-2.5 py-1 text-xs text-slate-700 font-medium transition-colors cursor-pointer border-none"
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : searchSuggestions.length > 0 ? (
                      // Results found
                      <div>
                        <div className="px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          {searchSuggestions.length} Match{searchSuggestions.length === 1 ? "" : "es"} Found
                        </div>
                        <div className="space-y-0.5">
                          {searchSuggestions.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleSelectSuggestion(item)}
                              className="group flex w-full items-center justify-between gap-3 p-2 rounded-xl hover:bg-blue-50/70 transition-colors text-left cursor-pointer border-none bg-transparent"
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                {getSuggestionIcon(item.type)}
                                <div className="min-w-0 flex-1">
                                  <p className="text-[13px] font-semibold text-slate-800 truncate group-hover:text-[#1E69DA] transition-colors mb-0.5">
                                    {item.title}
                                  </p>
                                  <p className="text-[11px] text-slate-400 truncate mb-0">
                                    {item.subtitle}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getSuggestionBadgeClass(item.type)} capitalize`}>
                                  {item.tag}
                                </span>
                                <ArrowRightOutlined className="text-[11px] text-slate-400 opacity-0 group-hover:opacity-100 group-hover:text-[#1E69DA] transition-all -translate-x-1 group-hover:translate-x-0" />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      // No results
                      <div className="p-6 text-center">
                        <SearchOutlined className="text-3xl text-slate-300 mx-auto mb-2" />
                        <p className="text-[13px] font-semibold text-slate-800 mb-1">
                          No matches for &ldquo;{search}&rdquo;
                        </p>
                        <p className="text-[12px] text-slate-400 mb-0">
                          Try searching by role (e.g. Software Engineer), style (e.g. Modern), or template name.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="border-t border-slate-100 bg-slate-50/80 px-3.5 py-2 text-[11px] text-slate-400 flex items-center justify-between shrink-0">
                    <span>Press <kbd className="font-sans font-semibold px-1 py-0.5 rounded bg-slate-200 text-slate-700">Enter ↵</kbd> to select</span>
                    <span><kbd className="font-sans font-semibold px-1 py-0.5 rounded bg-slate-200 text-slate-700">Esc</kbd> to close</span>
                  </div>
                </div>
              )}
            </div>

            {/* Continue Editing */}
            <button
              type="button"
              onClick={onContinueEditing}
              className="flex shrink-0 items-center gap-2 rounded-md border border-[#e9d5ff] bg-[#faf5ff] px-4 py-1.5 text-[14px] font-semibold text-[#a855f7] transition-colors hover:bg-[#f3e8ff]"
            >
              <EditOutlined /> Continue Editing
            </button>

            {/* Filter Button (Far right, after Continue Editing) */}
            {!showingBundles && (
              <Popover
                open={filterOpen}
                onOpenChange={setFilterOpen}
                trigger={["hover", "click"]}
                placement="bottomRight"
                arrow={false}
                mouseEnterDelay={0.12}
                mouseLeaveDelay={0.25}
                overlayInnerStyle={{
                  padding: 0,
                  borderRadius: 16,
                  overflow: "hidden",
                  boxShadow: "0 20px 40px -15px rgba(15, 23, 42, 0.2), 0 0 0 1px rgba(15, 23, 42, 0.08)",
                }}
                content={filterDropdownContent}
              >
                <button
                  type="button"
                  className={`flex items-center gap-2 rounded-xl border px-3.5 py-1.5 text-[13px] font-semibold transition-all cursor-pointer shadow-sm ${
                    activeFilterCount > 0
                      ? "border-[#1E69DA] bg-blue-50/60 text-[#1E69DA]"
                      : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-[#1E69DA]"
                  }`}
                >
                  <FilterOutlined className={activeFilterCount > 0 ? "text-[#1E69DA]" : "text-slate-500"} />
                  <span>Filter</span>
                  {activeFilterCount > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#1E69DA] px-1.5 text-[11px] font-bold text-white">
                      {activeFilterCount}
                    </span>
                  )}
                  <DownOutlined
                    className={`text-[10px] transition-transform duration-200 ${
                      filterOpen ? "rotate-180" : ""
                    } ${activeFilterCount > 0 ? "text-[#1E69DA]" : "text-slate-400"}`}
                  />
                </button>
              </Popover>
            )}

            {!showingBundles && activeFilterCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-[13px] font-semibold text-[#1E69DA] hover:underline cursor-pointer"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
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
