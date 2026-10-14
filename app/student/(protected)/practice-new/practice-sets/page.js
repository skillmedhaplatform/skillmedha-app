"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { App, Badge, Button, Empty, Input, Popover, Result, Segmented, Select, Skeleton } from "antd";
import { FiSearch, FiSliders, FiArrowLeft, FiX, FiLayers } from "react-icons/fi";
import useResponsive from "@/hooks/useResponsive";
import { fetchPracticeCatalog } from "@/redux/slices/practiceSlice";
import { PracticeSetCard, PracticeSetDetails } from "@/components/practiceSets/PracticeSetCard";
import {
  CATEGORY_OPTIONS,
  DIFFICULTY_OPTIONS,
  LEVEL_OPTIONS,
} from "@/components/practiceSets/constants";
import {
  accessNote,
  accessTag,
  bundleActionLabel,
  checkoutUrl,
  isOwned,
  setActionLabel,
  testUrl,
} from "@/components/practiceSets/studentAccess";

const PLAN_FILTERS = [
  { value: "free", label: "Free" },
  { value: "premium", label: "Premium" },
  { value: "bundle", label: "Bundles" },
];

const EMPTY_FILTERS = { plan: undefined, level: undefined, difficulty: undefined };

const matchesText = (text, query) => String(text || "").toLowerCase().includes(query);

// Returns true when a practice set passes every active filter.
const setMatches = (set, { query, category, filters, view, focusIds }) => {
  if (focusIds && !focusIds.has(set._id)) return false;
  if (view === "mine" && !isOwned(set.access)) return false;
  if (category !== "all" && set.category !== category) return false;
  if (filters.plan && filters.plan !== set.plan) return false;
  if (filters.level && set.level !== filters.level) return false;
  if (filters.difficulty && (set.difficulty || "mixed") !== filters.difficulty) return false;
  if (query) {
    const topicHit = (set.topics || []).some((t) => matchesText(t.topicTitle, query));
    if (!matchesText(set.title, query) && !topicHit) return false;
  }
  return true;
};

const bundleMatches = (bundle, { query, category, filters, view }) => {
  if (view === "mine" && !bundle.access?.unlocked) return false;
  if (category !== "all" && !(bundle.summary?.categories || []).includes(category)) return false;
  if (filters.plan && filters.plan !== "bundle") return false;
  if (filters.level && !(bundle.summary?.levels || []).includes(filters.level)) return false;
  if (filters.difficulty && !(bundle.sets || []).some((s) => (s.difficulty || "mixed") === filters.difficulty)) {
    return false;
  }
  if (query) {
    const topicHit = (bundle.summary?.topicTitles || []).some((t) => matchesText(t, query));
    if (!matchesText(bundle.title, query) && !topicHit) return false;
  }
  return true;
};

function CatalogCard({ item, isBundle, isMobile, onAction }) {
  const [open, setOpen] = useState(false);
  const access = item.access || {};
  const owned = isBundle ? !!access.unlocked : isOwned(access);
  const tag = isBundle ? (access.unlocked ? "Purchased" : null) : accessTag(access);
  const note = isBundle ? (access.unlocked ? accessNote({ ...access, reason: "purchased" }) : null) : accessNote(access);
  const label = isBundle ? bundleActionLabel(item) : setActionLabel(item);

  return (
    <Popover
      trigger={isMobile ? "click" : "hover"}
      placement={isMobile ? "bottom" : "rightTop"}
      mouseEnterDelay={0.12}
      mouseLeaveDelay={0.15}
      arrow={false}
      destroyOnHidden
      open={open}
      onOpenChange={setOpen}
      styles={{
        container: {
          padding: 0,
          borderRadius: 14,
          overflow: "hidden",
          boxShadow: "0 22px 50px -12px rgba(15, 23, 42, 0.35)",
        },
      }}
      content={
        <div className="w-[268px] max-w-[85vw]">
          <PracticeSetDetails
            item={item}
            isBundle={isBundle}
            plain
            note={note}
            actionLabel={label}
            onAction={() => onAction(item, isBundle)}
          />
        </div>
      }
    >
      <div className="h-full">
        <PracticeSetCard
          item={item}
          isBundle={isBundle}
          owned={owned}
          accessTag={tag}
          active={open}
          // On desktop the card itself is the primary action; on touch screens
          // a tap opens the details first so nobody lands in checkout by accident.
          onClick={isMobile ? () => {} : () => onAction(item, isBundle)}
        />
      </div>
    </Popover>
  );
}

export default function PracticeSetsCatalogPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { message } = App.useApp();
  const isMobile = useResponsive();
  const { catalog, catalogStatus, catalogError } = useSelector((state) => state.practice);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [view, setView] = useState("all");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [focusBundle, setFocusBundle] = useState(null);

  useEffect(() => {
    dispatch(fetchPracticeCatalog());
  }, [dispatch]);

  const sets = useMemo(() => catalog?.sets || [], [catalog]);
  const bundles = useMemo(() => catalog?.bundles || [], [catalog]);

  const items = useMemo(() => {
    const ctx = {
      query: search.trim().toLowerCase(),
      category,
      filters,
      view,
      focusIds: focusBundle ? new Set((focusBundle.setIds || []).map(String)) : null,
    };
    // While a bundle is opened, show only the sets inside it.
    const shownBundles = focusBundle ? [] : bundles.filter((b) => bundleMatches(b, ctx));
    const shownSets = sets.filter((s) => setMatches(s, ctx));
    return [
      ...shownBundles.map((item) => ({ item, isBundle: true })),
      ...shownSets.map((item) => ({ item, isBundle: false })),
    ];
  }, [sets, bundles, search, category, filters, view, focusBundle]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const hasAnyFilter = activeFilterCount > 0 || search.trim() || category !== "all" || view !== "all";

  const clearAll = () => {
    setSearch("");
    setCategory("all");
    setView("all");
    setFilters(EMPTY_FILTERS);
    setFocusBundle(null);
  };

  const handleAction = (item, isBundle) => {
    if (isBundle) {
      if (item.access?.unlocked) {
        setFocusBundle(item);
        setFilters(EMPTY_FILTERS);
        setCategory("all");
        setSearch("");
        message.info(`Showing the practice sets in ${item.title}`);
        return;
      }
      router.push(checkoutUrl("bundle", item._id));
      return;
    }
    if (item.access?.unlocked) {
      router.push(testUrl(item));
    } else {
      router.push(checkoutUrl("set", item._id));
    }
  };

  const filterPanel = (
    <div className="flex w-[260px] flex-col gap-3">
      <div>
        <div className="mb-1 text-xs font-semibold text-slate-600">Plan</div>
        <Select
          allowClear
          placeholder="Any plan"
          options={PLAN_FILTERS}
          value={filters.plan}
          onChange={(plan) => setFilters((f) => ({ ...f, plan }))}
          className="w-full"
        />
      </div>
      <div>
        <div className="mb-1 text-xs font-semibold text-slate-600">Level</div>
        <Select
          allowClear
          placeholder="Any level"
          options={LEVEL_OPTIONS}
          value={filters.level}
          onChange={(level) => setFilters((f) => ({ ...f, level }))}
          className="w-full"
        />
      </div>
      <div>
        <div className="mb-1 text-xs font-semibold text-slate-600">Difficulty</div>
        <Select
          allowClear
          placeholder="Any difficulty"
          options={DIFFICULTY_OPTIONS}
          value={filters.difficulty}
          onChange={(difficulty) => setFilters((f) => ({ ...f, difficulty }))}
          className="w-full"
        />
      </div>
      <Button size="small" type="link" className="self-end" onClick={() => setFilters(EMPTY_FILTERS)}>
        Clear filters
      </Button>
    </div>
  );

  const renderBody = () => {
    if (catalogStatus === "loading" && !sets.length && !bundles.length) {
      return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl bg-white">
              <Skeleton.Node active style={{ width: "100%", height: 150 }} />
              <div className="p-4">
                <Skeleton active paragraph={{ rows: 2 }} />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (catalogStatus === "failed") {
      return (
        <Result
          status="warning"
          title="Couldn't load practice sets"
          subTitle={catalogError}
          extra={
            <Button type="primary" onClick={() => dispatch(fetchPracticeCatalog())}>
              Try again
            </Button>
          }
        />
      );
    }

    if (!sets.length && !bundles.length) {
      return (
        <Empty
          className="py-16"
          description="Practice sets are coming soon. Check back shortly!"
        >
          <Button onClick={() => router.push("/student/practice-new")}>Back to Practice</Button>
        </Empty>
      );
    }

    if (!items.length) {
      return (
        <Empty
          className="py-16"
          description={
            view === "mine" ? "You haven't purchased any practice sets yet" : "No practice sets match your search"
          }
        >
          <Button onClick={clearAll}>{view === "mine" ? "Browse all practice sets" : "Clear filters"}</Button>
        </Empty>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map(({ item, isBundle }) => (
          <CatalogCard
            key={`${isBundle ? "b" : "s"}-${item._id}`}
            item={item}
            isBundle={isBundle}
            isMobile={isMobile}
            onAction={handleAction}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-[#F6F8FB]">
      <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-[#060F24] via-[#0B1A3A] to-[#13295A]">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#1E69DA]/25 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-120px] left-1/3 h-64 w-64 rounded-full bg-[#6366F1]/20 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="relative mx-auto w-full max-w-[1240px] px-4 pb-9 pt-6 lg:px-8">
          <button
            type="button"
            onClick={() => router.push("/student/practice-new")}
            className="mb-4 flex items-center gap-1.5 text-[13px] font-medium text-white/70 transition-colors hover:text-white"
          >
            <FiArrowLeft /> Practice
          </button>
          <div className="text-[28px] font-extrabold leading-tight tracking-tight text-white lg:text-[34px]">
            Explore Practice Sets
          </div>
          <p className="mt-1.5 text-[14px] text-white/70">Prepare for top companies with real-time exam patterns</p>
        </div>
      </div>

      <div className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-3 px-4 py-3.5 lg:px-8">
          <div className="flex gap-3">
            <Input
              allowClear
              prefix={<FiSearch className="mr-1 text-slate-400" />}
              placeholder="Search practice topics…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="!h-10 flex-1 !rounded-lg"
            />
            <Popover trigger="click" placement="bottomRight" content={filterPanel}>
              <Badge count={activeFilterCount} size="small" color="#1E69DA">
                <Button icon={<FiSliders />} className="!h-10 !rounded-lg !font-semibold">
                  {isMobile ? "" : "Filters"}
                </Button>
              </Badge>
            </Popover>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-[10.5px] font-extrabold uppercase tracking-[0.12em] text-slate-500">
                Category
              </span>
              {[{ value: "all", label: "All" }, ...CATEGORY_OPTIONS].map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCategory(c.value)}
                  className={`rounded-full border px-4 py-[5px] text-[12px] font-semibold transition-all ${
                    category === c.value
                      ? "border-[#1D6AE5] bg-[#1D6AE5] text-white shadow-[0_4px_12px_-2px_rgba(29,106,229,0.5)]"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <Segmented
              value={view}
              onChange={setView}
              options={[
                { value: "all", label: "All Sets" },
                { value: "mine", label: "My Purchases" },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1240px] flex-1 px-4 pb-12 pt-7 lg:px-8">
        {focusBundle && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <span className="flex items-center gap-2">
              <FiLayers /> Practice sets in <b>{focusBundle.title}</b>
            </span>
            <Button size="small" icon={<FiX />} onClick={() => setFocusBundle(null)}>
              Show all
            </Button>
          </div>
        )}

        {(sets.length > 0 || bundles.length > 0) && catalogStatus !== "failed" && (
          <div className="mb-5 flex items-center justify-between text-[14px] text-slate-500">
            <span>
              <b className="font-extrabold text-slate-900">{items.length}</b> practice set
              {items.length === 1 ? "" : "s"} found
            </span>
            {hasAnyFilter && (
              <Button size="small" type="link" onClick={clearAll}>
                Clear all
              </Button>
            )}
          </div>
        )}

        {renderBody()}
      </div>
    </div>
  );
}
