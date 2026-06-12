"use client";

import React, { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Pagination, Tooltip, Button, Select, Input, Modal, Tag, Row, Col } from "antd";
import { SearchOutlined, InfoCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { BsBookmark, BsBookmarkFill, BsCheckCircleFill, BsCodeSlash, BsBarChartFill, BsCpuFill, BsBook, BsClock, BsJournalBookmark, BsBriefcase } from "react-icons/bs";
import { HiOutlineBuildingOffice2, HiOutlineBookOpen } from "react-icons/hi2";
import { useSearchParams, usePathname } from "next/navigation";
import { useAppRouter } from "@/helpers/useAppRouter";
import CourseCardSkeleton from "@/universalUtils/CourseCardSkeleton/CourseCardSkeleton";
import useResponsive from "@/hooks/useResponsive";
import MobileLibraryPage from "@/mobile_views/library/MobileLibraryPage";

// --- Helpers ---
const stripHtml = (html) =>
  typeof html === "string" ? html.replace(/<[^>]*>/g, "") : "";

const getCardTheme = (category, index) => {
  const themes = [
    { bg: "linear-gradient(135deg, #0e1e3e, #1a3673)", icon: <BsCodeSlash size={32} color="white" /> }, // blue
    { bg: "linear-gradient(135deg, #2a0a4a, #4a158a)", icon: <BsBarChartFill size={32} color="white" /> }, // purple
    { bg: "linear-gradient(135deg, #0a3a2a, #156a4a)", icon: <BsCpuFill size={32} color="white" /> }, // green
    { bg: "linear-gradient(135deg, #4a2a0a, #8a4a15)", icon: <BsBook size={32} color="white" /> }, // brown
  ];
  return themes[index % themes.length];
};

const formatUpdatedDate = (dateInput) => {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  return isNaN(d.getTime())
    ? ""
    : d.toLocaleString("en-IN", { month: "short", year: "numeric" });
};

const DIFFICULTY_OPTIONS = ["Beginner", "Intermediate", "Advanced", "Expert"];

// --- Info Popover content ---
const InfoContent = ({ item }) => {
  const description = stripHtml(item?.description) || "";
  const ci = item?.courseIncludes || {};
  const difficultyColorMap = {
    Beginner: "green",
    Intermediate: "blue",
    Advanced: "orange",
    Expert: "red",
  };

  const boxStyle = {
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "20px",
    marginBottom: "8px",
    backgroundColor: "#ffffff",
    boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, overflowX: "hidden" }}>
      {/* Top Tags row */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, paddingBottom: 16, borderBottom: "1px solid #f0f0f0" }}>
        {item?.category && <Tag color="geekblue" style={{ fontSize: 14, padding: "2px 8px" }}>{item.category}</Tag>}
        {item?.difficulty && <Tag color={difficultyColorMap[item.difficulty] || "default"} style={{ fontSize: 14, padding: "2px 8px" }}>{item.difficulty}</Tag>}
        {item?.language && <Tag color="default" style={{ fontSize: 14, padding: "2px 8px" }}>🌐 {item.language}</Tag>}
        {item?.duration && <Tag color="cyan" style={{ fontSize: 14, padding: "2px 8px" }}>⏱ {item.duration}</Tag>}
        {item?.sections?.length ? <Tag color="purple" style={{ fontSize: 14, padding: "2px 8px" }}>📚 {item.sections.length} Modules</Tag> : null}
        {ci.videoDuration && <Tag color="cyan" style={{ fontSize: 14, padding: "2px 8px" }}>🎥 {ci.videoDuration}</Tag>}
        {item?.featured && <Tag color="gold" style={{ fontSize: 14, padding: "2px 8px" }}>⭐ Featured</Tag>}
        {item?.trending && <Tag color="red" style={{ fontSize: 14, padding: "2px 8px" }}>🔥 Trending</Tag>}
      </div>

      <Row gutter={[24, 12]} style={{ margin: 0 }}>
        {/* Left Column: What you'll learn & Includes */}
        <Col xs={24} md={14} style={{ paddingLeft: 0 }}>
          {item?.learningPoints?.length > 0 && (
            <div style={boxStyle}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#1f2937", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                What you'll learn
              </div>
              <Row gutter={[16, 16]}>
                {item.learningPoints.slice(0, 8).map((point, i) => (
                  <Col span={12} key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <CheckCircleOutlined style={{ color: "#24A058", marginTop: 5, fontSize: 16 }} />
                    <span style={{ fontSize: 15, color: "#4b5563", lineHeight: 1.6 }}>{point}</span>
                  </Col>
                ))}
              </Row>
            </div>
          )}

          {(ci.certificateOfCompletion || ci.lifetimeAccess || ci.articles || ci.codingExercises || ci.quizzes || ci.downloadableResources) && (
            <div style={boxStyle}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#1f2937", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                This Course Includes
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {ci.certificateOfCompletion && <Tag color="green" style={{ fontSize: 14, padding: "2px 8px" }}>🏅 Certificate</Tag>}
                {ci.lifetimeAccess && <Tag color="green" style={{ fontSize: 14, padding: "2px 8px" }}>♾ Lifetime Access</Tag>}
                {ci.jobAssistance && <Tag color="green" style={{ fontSize: 14, padding: "2px 8px" }}>💼 Job Assistance</Tag>}
                {ci.articles && <Tag style={{ fontSize: 14, padding: "2px 8px" }}>{ci.articles} Articles</Tag>}
                {ci.quizzes && <Tag style={{ fontSize: 14, padding: "2px 8px" }}>{ci.quizzes} Quizzes</Tag>}
                {ci.codingExercises && <Tag style={{ fontSize: 14, padding: "2px 8px" }}>{ci.codingExercises} Exercises</Tag>}
                {ci.downloadableResources && <Tag style={{ fontSize: 14, padding: "2px 8px" }}>{ci.downloadableResources} Resources</Tag>}
              </div>
            </div>
          )}
        </Col>

        {/* Right Column: Tools, Prerequisites, Audience */}
        <Col xs={24} md={10} style={{ paddingRight: 0 }}>
          {item?.toolsWithIcons?.length > 0 && (
            <div style={boxStyle}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#1f2937", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Tools & Technologies
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
                {item.toolsWithIcons.slice(0, 8).map((tool, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, backgroundColor: "#f3f4f6", padding: "6px 12px", borderRadius: "6px" }}>
                    {tool.icon && (
                      <img src={tool.icon} alt={tool.name} style={{ width: 18, height: 18, objectFit: "contain" }} />
                    )}
                    <span style={{ color: "#374151", fontWeight: 500 }}>{tool.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {item?.preRequisites?.length > 0 && (
            <div style={boxStyle}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#1f2937", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Prerequisites
              </div>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 15, color: "#4b5563", lineHeight: 1.6 }}>
                {item.preRequisites.map((req, i) => <li key={i} style={{ marginBottom: 6 }}>{req}</li>)}
              </ul>
            </div>
          )}

          {item?.targetAudience?.length > 0 && (
            <div style={boxStyle}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#1f2937", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Who is this for
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {item.targetAudience.map((a, i) => (
                  <Tag key={i} style={{ fontSize: 14, color: "#4b5563", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "2px 8px" }}>
                    {a}
                  </Tag>
                ))}
              </div>
            </div>
          )}
        </Col>
      </Row>

      {/* Footer Meta */}
      {item?.updatedAt && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #f0f0f0", fontSize: 13, color: "#9ca3af" }}>
          Last updated: {formatUpdatedDate(item.updatedAt)}
        </div>
      )}
    </div>
  );
};

/**
 * Unified library page for Courses and Internships.
 *
 * Props:
 *  - title          {string}   Page heading, e.g. "Course Library"
 *  - fetchAction    {thunk}    Redux async thunk to call (getAllCourses / getAllInternships)
 *  - dataSelector   {fn}       State selector for the data array
 *  - paginationSelector {fn}   State selector for pagination object
 *  - getItemUrl     {fn}       (item) => URL string to navigate to on click
 *  - viewLabel      {string}   Button label, e.g. "View Course"
 *  - searchPlaceholder {string} Input placeholder
 *  - idPrefix       {string}   Used for unique element IDs ("course" | "internship")
 *  - renderMetaChips {fn}      Optional: (item) => extra <span> chips beyond category
 */

const MobileLibraryPageWrapper = ({ title, items, ...props }) => {
  return <MobileLibraryPage title={title} items={items} {...props} />;
};

const LibraryPage = ({
  title,
  fetchAction,
  dataSelector,
  paginationSelector,
  getItemUrl,
  viewLabel = "View",
  searchPlaceholder = "Search…",
  idPrefix = "lib",
  renderMetaChips,
}) => {
  const nav = useAppRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const dispatch = useDispatch();

  const items = useSelector(dataSelector);
  const paginationData = useSelector(paginationSelector);

  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("limit") || "20", 10);
  const urlSearch = searchParams.get("search") || "";
  const urlCategory = searchParams.get("category") || "";
  const urlDifficulty = searchParams.get("difficulty") || "";

  const [searchInput, setSearchInput] = useState(urlSearch);
  const debounceRef = useRef(null);
  const [loading, setLoading] = useState(true);

  // Sync local input if URL changes (back/forward navigation)
  useEffect(() => {
    setSearchInput(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    setLoading(true);
    dispatch(
      fetchAction({
        page: currentPage,
        limit: pageSize,
        searchTerm: urlSearch,
        category: urlCategory,
        difficulty: urlDifficulty,
      })
    ).finally(() => setLoading(false));
  }, [dispatch, fetchAction, currentPage, pageSize, urlSearch, urlCategory, urlDifficulty]);

  const pushParams = useCallback(
    (updates) => {
      const params = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([k, v]) => {
        if (v) params.set(k, v);
        else params.delete(k);
      });
      if (Object.keys(updates).some((k) => k !== "page" && k !== "limit")) {
        params.set("page", "1");
      }
      nav.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, nav]
  );

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      pushParams({ search: val });
    }, 400);
  };

  const handleDifficultyChange = (val) => {
    pushParams({ difficulty: val });
  };

  const handleClearAll = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("search");
    params.delete("category");
    params.delete("difficulty");
    params.set("page", "1");
    setSearchInput("");
    nav.push(`${pathname}?${params.toString()}`);
  };

  const safeItems = Array.isArray(items) ? items : [];

  const categories = useMemo(() => {
    if (!safeItems.length) return [];
    const catMap = new Map();
    safeItems.forEach((item) => {
      if (item.category) {
        catMap.set(item.category, (catMap.get(item.category) || 0) + 1);
      }
    });
    return Array.from(catMap.entries()).map(([value, count]) => ({ value, count }));
  }, [items]);

  const categoryOptions = [
    ...new Set(safeItems.map((item) => item.category).filter(Boolean)),
  ].map((cat) => ({ label: cat, value: cat }));

  const difficultyOptions = [
    { label: "Beginner", value: "Beginner" },
    { label: "Intermediate", value: "Intermediate" },
    { label: "Advanced", value: "Advanced" },
  ];

  const activeFilters = [
    urlSearch && { key: "search", label: `Search: "${urlSearch}"` },
    urlCategory && { key: "category", label: `Category: ${urlCategory}` },
    urlDifficulty && { key: "difficulty", label: `Difficulty: ${urlDifficulty}` },
  ].filter(Boolean);

  const hasActiveFilters = activeFilters.length > 0;

  const handleCategoryChange = (val) => pushParams({ category: val || "" });

  const removeFilter = (key) => {
    if (key === "search") setSearchInput("");
    pushParams({ [key]: "" });
  };

  const handlePageChange = (page, size) => {
    pushParams({ page: page.toString(), limit: size.toString() });
  };

  const [selectedItem, setSelectedItem] = useState(null);

  const [activeTab, setActiveTab] = useState("all"); 

  const filteredTabItems = safeItems.filter((item) => {
    if (activeTab === "my") {
      return item.progress !== undefined || item.lastAccessedSection !== undefined || item.enrolled;
    }
    if (activeTab === "recent") {
      if (!item.createdAt) return false;
      const createdAtDate = new Date(item.createdAt);
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      return createdAtDate >= sixMonthsAgo;
    }
    return true; 
  });

  const totalAvailable = paginationData?.totalLength || safeItems.length || 0;
  const enrolledItems = safeItems.filter(item => item.progress !== undefined || item.lastAccessedSection !== undefined || item.enrolled);
  const totalEnrolled = enrolledItems.length;
  const avgProgress = totalEnrolled > 0 
    ? Math.round(enrolledItems.reduce((acc, curr) => acc + (curr.progress || 0), 0) / totalEnrolled) 
    : 0;

  const isCourse = title ? title.toLowerCase().includes("course") : false;
  const moduleName = isCourse ? "courses" : "internships";

  const isMobile = useResponsive(); 

  if (isMobile) {
    return (
      <MobileLibraryPageWrapper
        title={title}
        viewLabel={viewLabel}
        searchPlaceholder={searchPlaceholder}
        idPrefix={idPrefix}
        renderMetaChips={renderMetaChips}
        getItemUrl={getItemUrl}
        items={filteredTabItems} // pass filtered items to mobile as well
        loading={loading}
        paginationData={paginationData}
        searchInput={searchInput}
        handleSearchChange={handleSearchChange}
        urlCategory={urlCategory}
        urlDifficulty={urlDifficulty}
        categoryOptions={categoryOptions}
        difficultyOptions={difficultyOptions}
        activeFilters={activeFilters}
        hasActiveFilters={hasActiveFilters}
        handleCategoryChange={handleCategoryChange}
        handleDifficultyChange={handleDifficultyChange}
        handleClearAll={handleClearAll}
        removeFilter={removeFilter}
        pushParams={pushParams}
        currentPage={currentPage}
        pageSize={pageSize}
        handlePageChange={handlePageChange}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        nav={nav}
      />
    );
  }

  return (
    <div className="flex flex-col gap-0 relative bg-white min-h-screen">
      {/* Banner Section - Matching TPO Portal & Dashboard */}
      <div className="w-full h-[140px] min-h-[140px] flex flex-col justify-between p-4 lg:px-8 pt-6 shadow-sm rounded-2xl lg:rounded-none bg-gradient-to-br from-[#071631] to-[#10254c] text-white shrink-0 relative overflow-hidden z-[2]">
        
        {/* Decorative Icons */}
        <div className="absolute inset-0 pointer-events-none z-[1]">
          <div className="absolute top-[20%] right-[10%] text-[#1E69DA] opacity-60 text-[1.2rem]">✕</div>
          <div className="absolute bottom-[20%] right-[30%] text-[#1E69DA] opacity-50 text-[1.5rem]">+</div>
          <div className="absolute top-[40%] right-[50%] text-[#1E69DA] opacity-50 text-[1.1rem]">★</div>
          <div className="absolute bottom-[30%] right-[5%] text-[#1E69DA] opacity-60 text-[1.3rem]">✕</div>
        </div>

        {/* Top half: Title & Stats */}
        <div className="flex items-center justify-between w-full relative z-[2]">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10 shrink-0">
              {moduleName.toLowerCase().includes('internship') ? <HiOutlineBuildingOffice2 className="text-white text-2xl" /> : <HiOutlineBookOpen className="text-white text-2xl" />}
            </div>
            <div className="flex flex-col gap-1.5">
              <h1 
                className="text-[24px] lg:text-[28px] font-bold text-white m-0 tracking-tight leading-none flex items-center gap-3 pb-0"
                style={{ border: 'none' }}
              >
                {title}
              </h1>
              <p className="text-white text-[15px] lg:text-[16px] m-0">
                Explore all available {moduleName.toLowerCase()}s and {moduleName.toLowerCase().includes('internship') ? 'kickstart your career' : 'start learning'} today.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 lg:gap-10">
            <div className="flex flex-col items-center justify-center">
              <span className="text-[24px] lg:text-[28px] font-bold text-white leading-none">{totalEnrolled}</span>
              <span className="text-[10px] text-[#94a3b8] font-bold tracking-wider uppercase mt-1.5">Enrolled</span>
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-[24px] lg:text-[28px] font-bold text-white leading-none">{totalAvailable}</span>
              <span className="text-[10px] text-[#94a3b8] font-bold tracking-wider uppercase mt-1.5">Available</span>
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-[24px] lg:text-[28px] font-bold leading-none bg-gradient-to-br from-[#1E69DA] to-[#5694F0] bg-clip-text text-transparent">{avgProgress}%</span>
              <span className="text-[10px] text-[#94a3b8] font-bold tracking-wider uppercase mt-1.5">Avg. Done</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Row (Attached directly below banner) */}
      <div className="w-full bg-[#f1f5f9] border-b border-[#e2e8f0] px-4 lg:px-8 flex items-center gap-8 shadow-sm">
        {[
          { id: "all", label: `All ${moduleName.toLowerCase().includes('internship') ? 'internships' : 'courses'}` },
          { id: "my", label: `My ${moduleName.toLowerCase().includes('internship') ? 'internships' : 'courses'}` },
          { id: "recent", label: "Recently added" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-3 px-1 text-[15px] font-bold transition-all relative border-none bg-transparent cursor-pointer
              ${activeTab === tab.id ? "text-[#1E69DA]" : "text-[#64748b] hover:text-[#334155]"}`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1E69DA] rounded-t-md"></div>
            )}
          </button>
        ))}
      </div>

      {/* Categories Pill Bar */}
      <div className="w-full px-4 lg:px-8 py-3 bg-white border-b border-[#e2e8f0] flex items-center gap-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => pushParams({ category: "" })}
          className={`shrink-0 flex items-center gap-2 px-4 py-1.5 rounded-md text-[14px] font-medium transition-all duration-300 cursor-pointer
            ${!urlCategory 
              ? "bg-[#3b82f6] border border-transparent text-white shadow-sm hover:bg-[#2563eb]" 
              : "bg-white border border-[#3b82f6] text-[#3b82f6] hover:bg-[#eff6ff]"}`}
        >
          <span className={!urlCategory ? "text-white" : "text-[#3b82f6]"}>☷</span> All categories
        </button>
        {categoryOptions.map(cat => {
          const isActive = urlCategory === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => pushParams({ category: cat.value })}
              className={`shrink-0 flex items-center gap-2 px-4 py-1.5 rounded-md text-[14px] font-medium transition-all duration-300 cursor-pointer
                ${isActive 
                  ? "bg-[#3b82f6] border border-transparent text-white shadow-sm hover:bg-[#2563eb]" 
                  : "bg-white border border-[#3b82f6] text-[#3b82f6] hover:bg-[#eff6ff]"}`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2.5 w-full bg-transparent px-4 lg:px-8 py-2 mt-2">
        <div className="flex flex-wrap items-center gap-4 flex-1">
          <Input
            id={`${idPrefix}-search`}
            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            placeholder={searchPlaceholder}
            value={searchInput}
            onChange={handleSearchChange}
            allowClear
            onClear={() => pushParams({ search: "" })}
            className="w-[280px] rounded-[20px] shadow-sm border-[#e2e8f0]"
          />

          <Select
            id={`${idPrefix}-difficulty`}
            placeholder="All Levels"
            value={urlDifficulty || undefined}
            onChange={handleDifficultyChange}
            allowClear
            options={difficultyOptions}
            className="min-w-[130px] shadow-sm rounded-lg"
            popupMatchSelectWidth={false}
          />

          {hasActiveFilters && (
            <Button type="text" danger size="middle" onClick={handleClearAll} className="font-medium hover:bg-red-50 rounded-lg">
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Cards */}
      <div className="w-full overflow-hidden">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(18rem,1fr))] self-start gap-4 p-2 px-4 lg:px-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <CourseCardSkeleton key={i} />)
          ) : !filteredTabItems?.length ? (
            <div className="col-span-full flex flex-col items-center justify-center gap-2 py-20 px-4 text-[#8ea2b5] text-base text-center w-full">
              <span style={{ fontSize: "2.5rem" }}>🔍</span>
              <span>
                No {title ? title.toLowerCase() : ""} found
                {hasActiveFilters ? " matching your filters" : ""}.
              </span>
              {hasActiveFilters && (
                <button
                  style={{
                    marginTop: "0.5rem",
                    background: "none",
                    border: "none",
                    color: "#1a56db",
                    cursor: "pointer",
                    textDecoration: "underline",
                    fontSize: "0.95rem",
                  }}
                  onClick={handleClearAll}
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            filteredTabItems.map((item, index) => {
              const isEnrolled = item.progress !== undefined || item.lastAccessedSection !== undefined || item.enrolled;
              const progressVal = item.progress || 0;
              const duration = item?.duration || item?.courseIncludes?.videoDuration;
              const modulesCount = item?.sections?.length || 0;
              const createdAtDate = item?.createdAt ? formatUpdatedDate(item.createdAt) : '';

              let statusText = "Not enrolled";
              let buttonText = "Enroll";
              let statusColor = "text-[#94a3b8]";
              
              if (isEnrolled) {
                if (progressVal === 0) {
                  statusText = "Not started";
                  buttonText = "Start";
                  statusColor = "text-[#94a3b8]";
                } else {
                  statusText = `${progressVal}% complete`;
                  buttonText = "Continue";
                  statusColor = "text-[#10b981]"; // Green for in-progress
                }
              }

              return (
                <div
                  key={item?._id}
                  onClick={(e) => {
                    e.stopPropagation();
                    nav.push(getItemUrl(item));
                  }}
                  className="group flex flex-col bg-white text-black border-[1px] border-[#e2e8f0] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg shadow-sm"
                  role="button"
                  tabIndex={0}
                >
                  {/* Top Image Section */}
                  <div className="relative w-full h-[160px] bg-[#f8fafc] flex items-center justify-center overflow-hidden">
                    <img
                      className="w-full h-full object-cover block scale-[1.001] transition-transform duration-300 group-hover:scale-[1.05]"
                      src={item?.coverImage || item?.media?.coverImage || ""}
                      alt={item?.title || title}
                      loading="lazy"
                    />
                    
                    {/* Absolute Overlays */}
                    {isEnrolled && (
                      <div className="absolute top-3 left-3 bg-[#00000080] backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1.5 border-[0.5px] border-white/20">
                        <BsCheckCircleFill className="text-[#22c55e] text-[10px]" />
                        <span className="text-white text-[11px] font-medium tracking-wide">Enrolled</span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-[#00000080] backdrop-blur-sm p-1.5 rounded-lg border-[0.5px] border-white/20">
                      <BsBookmark className="text-white text-[14px]" />
                    </div>

                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 opacity-100 bg-[#00000080] px-2 py-0.5 rounded backdrop-blur-sm">
                      <BsCodeSlash className="text-white text-[12px]" />
                      <span className="text-white text-[11px] font-medium">{item.category || "General"}</span>
                    </div>

                    {item.difficulty && (
                      <div className="absolute bottom-3 right-3 bg-[#f59e0b] px-2 py-0.5 rounded text-white text-[10px] font-bold tracking-wider uppercase shadow-sm">
                        {item.difficulty}
                      </div>
                    )}
                  </div>

                  {/* Bottom Content Section */}
                  <div className="flex flex-col p-4 flex-1">
                    <Tooltip title={item?.title} placement="topLeft" mouseEnterDelay={0.5}>
                      <h3 className="text-[15px] font-bold text-[#1e293b] leading-tight mb-2 line-clamp-2 min-h-[36px]">
                        {item?.title}
                      </h3>
                    </Tooltip>
                    
                    <p className="text-[#64748b] text-[12px] leading-snug mb-4 line-clamp-2 min-h-[34px]">
                      {stripHtml(item?.description)}
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full flex items-center gap-3 mb-4">
                      <div className="flex-1 h-[6px] bg-[#f1f5f9] rounded-full overflow-hidden">
                        {isEnrolled && (
                          <div 
                            className="h-full bg-gradient-to-br from-[#1E69DA] to-[#5694F0] rounded-full transition-all duration-500" 
                            style={{ width: `${progressVal}%` }}
                          />
                        )}
                      </div>
                      <span className="text-[13px] font-bold text-[#64748b] min-w-[32px] text-right">
                        {isEnrolled ? `${progressVal}%` : '0%'}
                      </span>
                    </div>

                    {/* Meta Info Row */}
                    <div className="flex items-center gap-2 text-[11px] text-[#94a3b8] font-medium mb-4">
                      {duration && <span className="flex items-center gap-1"><BsClock /> {duration}</span>}
                      {duration && modulesCount > 0 && <span>•</span>}
                      {modulesCount > 0 && <span className="flex items-center gap-1"><BsJournalBookmark /> {modulesCount} modules</span>}
                      {createdAtDate && (duration || modulesCount > 0) && <span>•</span>}
                      {createdAtDate && <span>{createdAtDate}</span>}
                    </div>

                    {/* Footer Row */}
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#f1f5f9]">
                      <span className={`text-[12px] font-bold flex items-center gap-1 ${statusColor}`}>
                        {statusText}
                      </span>
                      
                      <button
                        className="bg-gradient-to-br from-[#1E69DA] to-[#5694F0] text-white text-[13px] font-bold py-1.5 px-5 rounded-full border-none cursor-pointer shadow-sm hover:shadow-md transition-shadow flex items-center gap-1.5"
                        onClick={(e) => {
                          e.stopPropagation();
                          nav.push(getItemUrl(item));
                        }}
                      >
                        {buttonText}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Info Modal — one instance shared across all cards */}
      <Modal
        open={!!selectedItem}
        onCancel={() => setSelectedItem(null)}
        title={
          <div style={{ paddingRight: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.3 }}>
              {selectedItem?.title}
            </div>
            {selectedItem?.subtitle && (
              <div style={{ fontWeight: 400, fontSize: 12, color: "#888", marginTop: 4, fontStyle: "italic" }}>
                {selectedItem.subtitle}
              </div>
            )}
          </div>
        }
        footer={[
          <Button key="close" onClick={() => setSelectedItem(null)}>Close</Button>,
          <Button
            key="view"
            type="primary"
            onClick={() => { nav.push(getItemUrl(selectedItem)); setSelectedItem(null); }}
          >
            {viewLabel}
          </Button>,
        ]}
        width={1100}
        centered={true}
        styles={{ body: { padding: 0 } }}
      >
        <div 
          className="[&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#d0d0d0] hover:[&::-webkit-scrollbar-thumb]:bg-[#aaa] [&::-webkit-scrollbar-thumb]:rounded-full" 
          style={{ maxHeight: "75vh", overflowY: "auto", overflowX: "hidden", padding: "24px" }}
        >
          {selectedItem && <InfoContent item={selectedItem} />}
        </div>
      </Modal>

      {/* Pagination */}
      {paginationData && paginationData.totalLength > 0 && !loading && (
        <div className="sticky bottom-0 left-0 w-full bg-white z-10 py-2 flex justify-end">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={paginationData.totalLength}
            onChange={handlePageChange}
            showSizeChanger
            pageSizeOptions={["10", "20", "50", "100"]}
          />
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
