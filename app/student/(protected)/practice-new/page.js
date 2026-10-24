"use client";

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { App, Badge, Button, Empty, Input, Popover, Result, Select, Skeleton } from "antd";
import { FiSearch, FiSliders, FiX, FiLayers } from "react-icons/fi";
import {
  HiOutlineAcademicCap,
  HiOutlineBuildingOffice2,
  HiOutlineSparkles,
  HiOutlineSquares2X2,
} from "react-icons/hi2";
import { FaCrown } from "react-icons/fa6";
import useResponsive from "@/hooks/useResponsive";
import { fetchPracticeCatalog } from "@/redux/slices/practiceSlice";
import { restUrl } from "@/config/urls";
import { PracticeSetCard, PracticeSetDetails } from "@/components/practiceSets/PracticeSetCard";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";
import CompanyAssessmentModal from "@/modules/student/components/CompanyAssessmentModal";
import {
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

const CATEGORY_TILES = [
  { value: "all", label: "All" },
  { value: "technical", label: "Technical" },
  { value: "nontechnical", label: "Non-Technical" },
  { value: "coding", label: "Coding" },
  { value: "company-wise", label: "Company-wise" },
  { value: "my-purchases", label: "My Purchases" },
];

const getCategoryHeading = (cat, focusBundle) => {
  if (focusBundle) return `Practice Sets in ${focusBundle.title}`;
  switch (cat) {
    case "all":
      return "All Practice Sets";
    case "technical":
      return "Technical Practice Sets";
    case "nontechnical":
      return "Non-Technical Practice Sets";
    case "coding":
      return "Coding Practice Sets";
    case "company-wise":
      return "Company-wise Practice Sets";
    case "my-purchases":
      return "My Purchased Practice Sets";
    default:
      return "All Practice Sets";
  }
};

const PLAN_BUTTONS = [
  {
    value: "all",
    label: "All",
    icon: HiOutlineSquares2X2,
    activeClasses:
      "bg-gradient-to-r from-[#1D6AE5] to-[#2563EB] text-white shadow-sm border-[#1D6AE5]",
    inactiveIconClass: "text-[#1D6AE5]",
  },
  {
    value: "free",
    label: "Free",
    icon: HiOutlineSparkles,
    activeClasses:
      "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm border-emerald-600",
    inactiveIconClass: "text-emerald-600",
  },
  {
    value: "premium",
    label: "Premium",
    icon: FaCrown,
    activeClasses:
      "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm border-amber-500",
    inactiveIconClass: "text-amber-500",
  },
  {
    value: "bundle",
    label: "Bundle",
    icon: FiLayers,
    activeClasses:
      "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm border-indigo-600",
    inactiveIconClass: "text-indigo-600",
  },
];

const EMPTY_FILTERS = { plan: undefined, level: undefined, difficulty: undefined };

const matchesText = (text, query) => String(text || "").toLowerCase().includes(query);

const setMatches = (set, { query, category, filters, focusIds }) => {
  if (focusIds && !focusIds.has(set._id)) return false;
  if (category === "my-purchases" && !isOwned(set.access)) return false;
  const targetCategory = category === "company-wise" ? "company" : category;
  if (category !== "all" && category !== "my-purchases" && set.category !== targetCategory) return false;
  if (filters.plan && filters.plan !== "all") {
    if (filters.plan === "bundle") return false;
    if (filters.plan !== set.plan) return false;
  }
  if (filters.level && set.level !== filters.level) return false;
  if (filters.difficulty && (set.difficulty || "mixed") !== filters.difficulty) return false;
  if (query) {
    const topicHit = (set.topics || []).some((t) => matchesText(t.topicTitle, query));
    if (!matchesText(set.title, query) && !topicHit) return false;
  }
  return true;
};

const bundleMatches = (bundle, { query, category, filters }) => {
  if (category === "my-purchases" && !bundle.access?.unlocked) return false;
  const targetCategory = category === "company-wise" ? "company" : category;
  if (category !== "all" && category !== "my-purchases" && !(bundle.summary?.categories || []).includes(targetCategory)) return false;
  if (filters.plan && filters.plan !== "all") {
    if (filters.plan !== "bundle") return false;
  }
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

function CatalogCard({ item, isBundle, isMobile, onAction, onViewResults }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [hasCompletedTest, setHasCompletedTest] = useState(Boolean(item.hasCompletedTest));
  const access = item.access || {};
  const owned = isBundle ? !!access.unlocked : isOwned(access);
  const tag = isBundle ? (access.unlocked ? "Purchased" : null) : accessTag(access);
  const note = isBundle ? (access.unlocked ? accessNote({ ...access, reason: "purchased" }) : null) : accessNote(access);
  const label = isBundle ? bundleActionLabel(item) : setActionLabel(item);

  const isCompany = !isBundle && (item.category === "company" || item.category === "company-wise");

  useEffect(() => {
    if (item.hasCompletedTest !== undefined) {
      setHasCompletedTest(Boolean(item.hasCompletedTest));
      return;
    }
    const testId = item._id || item.id;
    if (isCompany && testId && open) {
      const token = typeof window !== "undefined" ? (localStorage.getItem("token") || sessionStorage.getItem("token") || "") : "";
      if (token) {
        fetch(`${restUrl}/practice/top-scores/${testId}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` }
        })
          .then((res) => res.json())
          .then((data) => {
            if (data && data.data && data.data.length > 0) {
              setHasCompletedTest(true);
            }
          })
          .catch(() => {});
      }
    }
  }, [item.hasCompletedTest, isCompany, item._id, item.id, open]);

  const handleViewResults = () => {
    if (onViewResults) {
      onViewResults(item);
    } else {
      const testId = item._id || item.id;
      router.push(`/student/practice-new/company-wise/${testId}?viewResult=true`);
    }
  };

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
            hasCompletedTest={hasCompletedTest}
            onViewResults={handleViewResults}
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
          onClick={isMobile ? () => {} : () => onAction(item, isBundle)}
        />
      </div>
    </Popover>
  );
}

function PracticeCatalogInner() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { message } = App.useApp();
  const isMobile = useResponsive();

  const { catalog, catalogStatus, catalogError } = useSelector((state) => state.practice);
  const studentCreds = useSelector((state) => state.student?.student?.data);

  const initialCat = searchParams?.get("category") || "all";
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initialCat);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [focusBundle, setFocusBundle] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedCompanyTest, setSelectedCompanyTest] = useState(null);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    const cat = searchParams?.get("category");
    if (cat) {
      setCategory(cat);
    }
  }, [searchParams]);

  // Close search suggestions on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    dispatch(fetchPracticeCatalog());
  }, [dispatch]);

  const sets = useMemo(() => catalog?.sets || [], [catalog]);
  const bundles = useMemo(() => catalog?.bundles || [], [catalog]);

  // Dynamic search suggestions while the user types
  const searchSuggestions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];

    const list = [];
    const seen = new Set();

    // 1. Practice sets (including company-wise sets created in admin)
    sets.forEach((s) => {
      const inTitle = matchesText(s.title, q);
      const matchedTopic = (s.topics || []).find((t) => matchesText(t.topicTitle, q));
      if (inTitle || matchedTopic) {
        const titleKey = s.title.toLowerCase();
        if (!seen.has(titleKey)) {
          seen.add(titleKey);
          list.push({
            id: `set-${s._id}`,
            type: s.category === "company" ? "company" : "practice",
            title: s.title,
            category: s.category === "company" ? "Company-wise" : s.category || "Technical",
            subtitle: `${s.questionCount || 30} Qs • ${s.timeMinutes ? `${s.timeMinutes} mins` : "30 mins"} • ${s.level || "Intermediate"}`,
            matchedTopic: matchedTopic?.topicTitle,
            targetCategory: s.category === "company" ? "company-wise" : s.category || "all",
          });
        }
      }
    });

    // 2. Bundles
    bundles.forEach((b) => {
      if (matchesText(b.title, q)) {
        const titleKey = b.title.toLowerCase();
        if (!seen.has(titleKey)) {
          seen.add(titleKey);
          list.push({
            id: `bundle-${b._id}`,
            type: "bundle",
            title: b.title,
            category: b.category || "Bundle",
            subtitle: `${(b.setIds || []).length} sets included • ${b.level || "All levels"}`,
            targetCategory: b.category || "all",
          });
        }
      }
    });

    return list.slice(0, 7);
  }, [search, sets, bundles]);

  // Popular search topics for initial focus / empty query
  const popularTopics = useMemo(() => {
    const topicSet = new Set();
    sets.forEach((s) => {
      (s.topics || []).forEach((t) => {
        if (t.topicTitle) topicSet.add(t.topicTitle.trim());
      });
    });
    const defaultPopular = [
      "DBMS",
      "Python",
      "Data Structures",
      "Java",
      "SQL",
      "Quantitative Aptitude",
      "TCS",
      "Infosys",
    ];
    return Array.from(new Set([...Array.from(topicSet), ...defaultPopular])).slice(0, 8);
  }, [sets]);

  const handleSelectSuggestion = (item) => {
    setSearch(item.title);
    if (item.targetCategory && item.targetCategory !== "all") {
      setCategory(item.targetCategory);
    }
    setFocusBundle(null);
    setIsSearchOpen(false);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Escape") {
      setIsSearchOpen(false);
    } else if (e.key === "Enter") {
      if (searchSuggestions.length > 0) {
        handleSelectSuggestion(searchSuggestions[0]);
      } else {
        setIsSearchOpen(false);
      }
    }
  };

  const items = useMemo(() => {
    const ctx = {
      query: search.trim().toLowerCase(),
      category,
      filters,
      focusIds: focusBundle ? new Set((focusBundle.setIds || []).map(String)) : null,
    };
    const shownBundles = focusBundle ? [] : bundles.filter((b) => bundleMatches(b, ctx));
    const shownSets = sets.filter((s) => setMatches(s, ctx));
    return [
      ...shownBundles.map((item) => ({ item, isBundle: true })),
      ...shownSets.map((item) => ({ item, isBundle: false })),
    ];
  }, [sets, bundles, search, category, filters, focusBundle]);

  const planCounts = useMemo(() => {
    const baseCtx = {
      query: search.trim().toLowerCase(),
      category,
      filters: { ...filters, plan: undefined },
      focusIds: focusBundle ? new Set((focusBundle.setIds || []).map(String)) : null,
    };

    const matchingSets = sets.filter((s) => setMatches(s, baseCtx));
    const matchingBundles = focusBundle ? [] : bundles.filter((b) => bundleMatches(b, baseCtx));

    const freeCount = matchingSets.filter((s) => s.plan === "free").length;
    const premiumCount = matchingSets.filter((s) => s.plan === "premium").length;
    const bundleCount = matchingBundles.length;
    const allCount = matchingSets.length + matchingBundles.length;

    return {
      all: allCount,
      free: freeCount,
      premium: premiumCount,
      bundle: bundleCount,
    };
  }, [category, search, sets, bundles, filters, focusBundle]);

  const activePlan = filters.plan || "all";

  const handlePlanClick = (planValue) => {
    setFilters((prev) => ({
      ...prev,
      plan: planValue === "all" ? undefined : planValue,
    }));
  };

  const cardsScrollRef = useRef(null);

  const handleTopWheel = (e) => {
    if (cardsScrollRef.current) {
      cardsScrollRef.current.scrollTop += e.deltaY;
    }
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const hasAnyFilter = activeFilterCount > 0 || !!search.trim() || category !== "all";

  const clearAll = () => {
    setSearch("");
    setCategory("all");
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
    const isLoading = catalogStatus === "loading" && !sets.length && !bundles.length;

    if (isLoading) {
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

    if (catalogStatus === "failed" && !sets.length) {
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
          <Button onClick={clearAll}>Refresh</Button>
        </Empty>
      );
    }

    if (!items.length) {
      const planLabel = filters.plan && filters.plan !== "all" ? filters.plan : "";
      return (
        <Empty
          className="py-16"
          description={
            category === "my-purchases"
              ? "You haven't purchased any practice sets yet"
              : planLabel
              ? `No ${planLabel} practice cards match your current selection`
              : "No practice sets match your search"
          }
        >
          <Button onClick={clearAll}>
            {category === "my-purchases" ? "Browse all practice sets" : "Reset all filters"}
          </Button>
        </Empty>
      );
    }

    return (
      <motion.div
        layout="position"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {items.map(({ item, isBundle }, index) => (
            <motion.div
              layout
              key={`${isBundle ? "b" : "s"}-${item._id || item.id}`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{
                duration: 0.24,
                ease: "easeOut",
                delay: Math.min(index * 0.02, 0.12),
              }}
              className="h-full"
            >
              <CatalogCard
                item={item}
                isBundle={isBundle}
                isMobile={isMobile}
                onAction={handleAction}
                onViewResults={(testItem) => {
                  setSelectedCompanyTest(testItem);
                  setIsCompanyModalOpen(true);
                }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-[#F6F8FB]">
      {/* Pinned Top Container: Banner + White Bar (remains fixed on scroll) */}
      <div className="shrink-0 z-20 shadow-[0_4px_16px_-4px_rgba(15,23,42,0.04)]" onWheel={handleTopWheel}>
        {/* Banner */}
        <StudentPageHeader
          title="Explore Practice Sets"
          subtitle="Prepare for top companies with real-time exam patterns and level-wise practice"
        />

        {/* Filter & Search Bar */}
        <div className="border-b border-slate-200/80 bg-white/95 backdrop-blur">
          <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-3 px-4 py-2.5 lg:px-8">
            {/* Category Group on Left */}
            <div className="flex items-center gap-2 shrink-0 overflow-x-auto [&::-webkit-scrollbar]:hidden">
              <span className="mr-1 text-[10.5px] font-extrabold uppercase tracking-[0.12em] text-slate-500 shrink-0">
                Category
              </span>
              <div className="flex items-center gap-1.5 flex-nowrap">
                {CATEGORY_TILES.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => {
                      setCategory(c.value);
                      setFocusBundle(null);
                    }}
                    className={`rounded-full border px-3.5 py-[5px] text-[12px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      category === c.value
                        ? "border-[#1D6AE5] bg-[#1D6AE5] text-white shadow-[0_4px_12px_-2px_rgba(29,106,229,0.5)]"
                        : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Bar with Dynamic Suggestions & Filter Button on Right */}
            <div className="flex items-center gap-2.5 shrink-0" ref={searchContainerRef}>
              <div className="relative w-[200px] sm:w-[240px] md:w-[280px] lg:w-[320px]">
                <Input
                  allowClear
                  prefix={<FiSearch className="mr-1 text-slate-400" />}
                  placeholder={
                    category === "company-wise"
                      ? "Search companies or test patterns…"
                      : "Search practice topics…"
                  }
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    if (!isSearchOpen) setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  onKeyDown={handleSearchKeyDown}
                  className="!h-9 w-full !rounded-lg"
                />

                {/* Suggestions Dropdown */}
                {isSearchOpen && (
                  <div className="absolute right-0 top-full mt-2 w-[340px] sm:w-[380px] md:w-[420px] max-h-[440px] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-200/90 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                    {search.trim() === "" ? (
                      <div className="p-3.5">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                          <HiOutlineSparkles className="text-[14px] text-amber-500" />
                          Popular Searches
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {popularTopics.map((topic) => (
                            <button
                              key={topic}
                              type="button"
                              onClick={() => handleSelectSuggestion({ title: topic })}
                              className="rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 px-2.5 py-1 text-xs text-slate-700 font-medium transition-colors cursor-pointer"
                            >
                              {topic}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : searchSuggestions.length > 0 ? (
                      <>
                        <div className="px-3.5 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Suggestions ({searchSuggestions.length})
                        </div>
                        <div className="overflow-y-auto max-h-[320px] p-2 space-y-1 divide-y divide-slate-100">
                          {searchSuggestions.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => handleSelectSuggestion(item)}
                              className="flex items-center justify-between gap-3 p-2.5 rounded-xl hover:bg-blue-50/80 cursor-pointer transition-colors group"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-blue-100/70 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                  {item.type === "company" ? (
                                    <HiOutlineBuildingOffice2 className="text-[17px]" />
                                  ) : (
                                    <HiOutlineAcademicCap className="text-[17px]" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                                    {item.title}
                                  </div>
                                  <div className="text-xs text-slate-400 truncate">
                                    {item.subtitle}
                                  </div>
                                </div>
                              </div>
                              <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700 shrink-0 capitalize">
                                {item.category}
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="p-6 text-center text-sm text-slate-500">
                        No suggestions matching &ldquo;<span className="font-semibold text-slate-800">{search}</span>&rdquo;
                      </div>
                    )}

                    <div className="border-t border-slate-100 bg-slate-50/80 px-3.5 py-2 text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Press <b>Enter</b> to select</span>
                      <span><b>Esc</b> to close</span>
                    </div>
                  </div>
                )}
              </div>

              {category !== "company-wise" && (
                <Popover trigger="click" placement="bottomRight" content={filterPanel}>
                  <Badge count={activeFilterCount} size="small" color="#1E69DA">
                    <Button
                      icon={<FiSliders className="text-[16px]" />}
                      className={`!h-9 !w-9 !p-0 flex items-center justify-center !rounded-lg shrink-0 transition-colors ${
                        activeFilterCount > 0
                          ? "!border-[#1D6AE5] !text-[#1D6AE5] !bg-blue-50/50"
                          : "!border-slate-200 text-slate-600 hover:!border-[#1D6AE5] hover:!text-[#1D6AE5] bg-white"
                      }`}
                      aria-label="Filters"
                      title="Filters"
                    />
                  </Badge>
                </Popover>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Cards & Content Area */}
      <div ref={cardsScrollRef} className="flex-1 overflow-y-auto min-h-0">
        <div className="mx-auto w-full max-w-[1400px] px-4 pb-16 pt-6 lg:px-8">
          {focusBundle && category !== "company-wise" && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <span className="flex items-center gap-2">
                <FiLayers /> Practice sets in <b>{focusBundle.title}</b>
              </span>
              <Button size="small" icon={<FiX />} onClick={() => setFocusBundle(null)}>
                Show all
              </Button>
            </div>
          )}

          {/* Dynamic Heading & Practice Set Filter Buttons */}
          <div className="mb-7 flex flex-col gap-4">
            {/* Heading and Count Row */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <h2
                  className="text-2xl sm:text-[26px] font-black tracking-tight text-slate-900 leading-none !m-0 !p-0 !border-none !border-b-0"
                  style={{ margin: 0, marginTop: 0, marginBottom: 0, padding: 0, border: "none", borderBottom: "none" }}
                >
                  {getCategoryHeading(category, focusBundle)}
                </h2>
                <span className="inline-flex items-center justify-center text-xs sm:text-sm font-bold text-slate-600 bg-slate-200/70 border border-slate-300/60 px-2.5 py-1 rounded-full leading-tight">
                  {items.length} Practice Set{items.length === 1 ? "" : "s"}
                </span>
                {filters.plan && filters.plan !== "all" && (
                  <span className="inline-flex items-center gap-1 font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md text-xs leading-tight">
                    • {filters.plan.charAt(0).toUpperCase() + filters.plan.slice(1)} only
                  </span>
                )}
              </div>

              {hasAnyFilter && (
                <Button
                  size="small"
                  onClick={clearAll}
                  className="!text-xs !font-semibold text-slate-500 hover:!text-blue-600 hover:!border-blue-300 !rounded-lg !h-8"
                >
                  Clear all filters
                </Button>
              )}
            </div>

            {/* Modern Practice Set Filter Buttons: All, Free, Premium, Bundle */}
            <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto py-1.5 [&::-webkit-scrollbar]:hidden">
              {PLAN_BUTTONS.map((btn) => {
                const isActive = activePlan === btn.value;
                const count = planCounts[btn.value] ?? 0;
                const Icon = btn.icon;

                return (
                  <button
                    key={btn.value}
                    type="button"
                    onClick={() => handlePlanClick(btn.value)}
                    className={`group relative flex items-center gap-2 sm:gap-2.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer select-none active:scale-95 shrink-0 border ${
                      isActive
                        ? btn.activeClasses
                        : "bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border-slate-200 hover:border-slate-400/80 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.04)]"
                    }`}
                  >
                    <Icon
                      className={`text-[15px] sm:text-[16px] transition-transform duration-200 group-hover:scale-110 ${
                        isActive ? "text-white" : btn.inactiveIconClass
                      }`}
                    />
                    <span>{btn.label}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10.5px] sm:text-[11px] font-bold transition-colors ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-600 group-hover:bg-slate-200/80"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {renderBody()}
        </div>
      </div>

      <CompanyAssessmentModal
        open={isCompanyModalOpen}
        test={selectedCompanyTest}
        onClose={() => {
          setIsCompanyModalOpen(false);
          setSelectedCompanyTest(null);
        }}
        studentCreds={studentCreds}
        router={router}
        initialState="RESULTS"
      />
    </div>
  );
}

export default function PracticeNewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center bg-[#F6F8FB] p-8 text-slate-400">
          Loading practice...
        </div>
      }
    >
      <PracticeCatalogInner />
    </Suspense>
  );
}
