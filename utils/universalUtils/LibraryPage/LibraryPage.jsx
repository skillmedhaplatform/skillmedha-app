"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Pagination, Tooltip, Button, Select, Input, Modal, Tag, Row, Col } from "antd";
import { SearchOutlined, InfoCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useSearchParams, usePathname } from "next/navigation";
import { useAppRouter } from "@/helpers/useAppRouter";
import CourseCardSkeleton from "@/universalUtils/CourseCardSkeleton/CourseCardSkeleton";
import useResponsive from "@/hooks/useResponsive";
import MobileLibraryPage from "@/mobile_views/library/MobileLibraryPage";

// --- Helpers ---
const stripHtml = (html) =>
  typeof html === "string" ? html.replace(/<[^>]*>/g, "") : "";

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

  // --- URL-driven filter state ---
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("limit") || "20", 10);
  const urlSearch = searchParams.get("search") || "";
  const urlCategory = searchParams.get("category") || "";
  const urlDifficulty = searchParams.get("difficulty") || "";

  const [searchInput, setSearchInput] = useState(urlSearch);
  const debounceRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  // Sync local input if URL changes (back/forward navigation)
  useEffect(() => {
    setSearchInput(urlSearch);
  }, [urlSearch]);

  // Fetch whenever any filter param changes
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

  // --- URL mutation helper ---
  const pushParams = useCallback(
    (updates) => {
      const params = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([k, v]) => {
        if (v) params.set(k, v);
        else params.delete(k);
      });
      // Reset page when a filter changes (not when changing page itself)
      if (Object.keys(updates).some((k) => k !== "page" && k !== "limit")) {
        params.set("page", "1");
      }
      nav.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, nav]
  );

  // --- Handlers ---
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => pushParams({ search: val }), 500);
  };

  const handleCategoryChange = (val) => pushParams({ category: val || "" });
  const handleDifficultyChange = (val) => pushParams({ difficulty: val || "" });
  const handleClearAll = () => {
    setSearchInput("");
    pushParams({ search: "", category: "", difficulty: "", page: "1" });
  };
  const removeFilter = (key) => {
    if (key === "search") setSearchInput("");
    pushParams({ [key]: "" });
  };
  const handlePageChange = (page, size) =>
    pushParams({ page: page.toString(), limit: size.toString() });

  // --- Derived ---
  const categoryOptions = [
    ...new Set((items || []).map((item) => item.category).filter(Boolean)),
  ].map((cat) => ({ label: cat, value: cat }));

  const difficultyOptions = DIFFICULTY_OPTIONS.map((d) => ({
    label: d,
    value: d,
  }));

  const activeFilters = [
    urlSearch && { key: "search", label: `Search: "${urlSearch}"` },
    urlCategory && { key: "category", label: `Category: ${urlCategory}` },
    urlDifficulty && { key: "difficulty", label: `Difficulty: ${urlDifficulty}` },
  ].filter(Boolean);

  const hasActiveFilters = activeFilters.length > 0;

  const isMobile = useResponsive(); // < 1024px → mobile layout

  if (isMobile) {
    return (
      <MobileLibraryPage
        title={title}
        viewLabel={viewLabel}
        searchPlaceholder={searchPlaceholder}
        idPrefix={idPrefix}
        renderMetaChips={renderMetaChips}
        getItemUrl={getItemUrl}
        items={items}
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
    <div className="flex flex-col gap-2 relative">
      {/* Sticky Header Row: Title left | Filters right */}
      <div className="flex items-center justify-between flex-wrap gap-2.5 sticky top-0 left-0 w-full bg-white z-10 py-2">
        <div className="text-[clamp(1.3rem,2vw,1.5rem)] font-bold text-[#24A058] whitespace-nowrap shrink-0">{title}</div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 flex-1 justify-end">
          <Input
            id={`${idPrefix}-search`}
            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            placeholder={searchPlaceholder}
            value={searchInput}
            onChange={handleSearchChange}
            allowClear
            onClear={() => pushParams({ search: "" })}
            style={{ maxWidth: 240, borderRadius: 8 }}
          />

          <Select
            id={`${idPrefix}-category`}
            placeholder="All Categories"
            value={urlCategory || undefined}
            onChange={handleCategoryChange}
            allowClear
            options={categoryOptions}
            style={{ minWidth: 150 }}
            popupMatchSelectWidth={false}
          />

          <Select
            id={`${idPrefix}-difficulty`}
            placeholder="All Levels"
            value={urlDifficulty || undefined}
            onChange={handleDifficultyChange}
            allowClear
            options={difficultyOptions}
            style={{ minWidth: 130 }}
            popupMatchSelectWidth={false}
          />

          {hasActiveFilters && (
            <Button danger size="middle" onClick={handleClearAll} style={{ borderRadius: 8 }}>
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pb-1">
          {activeFilters.map(({ key, label }) => (
            <span key={key} className="inline-flex items-center gap-[6px] bg-[#e8f0fe] text-[#1a56db] border border-[#a4c2f4] rounded-full py-[3px] pr-[10px] pl-[12px] text-[12px] font-medium">
              {label}
              <button
                className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#a4c2f4] border-none cursor-pointer text-[10px] text-[#1a56db] leading-none p-0 hover:bg-[#1a56db] hover:text-white"
                onClick={() => removeFilter(key)}
                aria-label={`Remove ${key} filter`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Cards */}
      <div className="w-full overflow-hidden">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(18rem,1fr))] self-start gap-4 p-2">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <CourseCardSkeleton key={i} />)
          ) : !items?.length ? (
            <div className="col-span-full flex flex-col items-center justify-center gap-2 py-20 px-4 text-[#8ea2b5] text-base text-center w-full">
              <span style={{ fontSize: "2.5rem" }}>🔍</span>
              <span>
                No {title.toLowerCase()} found
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
            items.map((item) => (
              <div
                key={item?._id}
                className="group grid grid-rows-[auto_1fr] gap-2.5 bg-white text-black border-[0.2px] border-[rgba(207,207,207,0.851)] rounded-[14px] overflow-hidden cursor-pointer transition-all duration-180 hover:-translate-y-1 hover:shadow-[rgba(60,64,67,0.3)_0px_2px_4px_0px,rgba(60,64,67,0.15)_0px_2px_6px_2px] p-2 shadow-[rgba(60,64,67,0.3)_0px_1px_2px_0px,rgba(60,64,67,0.15)_0px_1px_3px_1px]"
                role="button"
                tabIndex={0}
              >
                <div className="relative w-full aspect-video bg-[#f5f5f5] overflow-hidden rounded-xl">
                  <img
                    className="w-full h-full object-cover block scale-[1.001] transition-transform duration-220 group-hover:scale-[1.03]"
                    src={item?.coverImage || item?.media?.coverImage || ""}
                    alt={item?.title || title}
                    loading="lazy"
                  />
                </div>

                <div className="grid auto-rows-max gap-2 p-1.5">
                  <div style={{ display: "flex", alignItems: "center", width: "100%", overflow: "hidden", gap: 6 }}>
                    <Tooltip title={item?.title} placement="topLeft" mouseEnterDelay={0.5}>
                      <div className="text-base font-bold leading-[1.2] w-[90%] whitespace-nowrap overflow-hidden text-ellipsis underline">{item?.title}</div>
                    </Tooltip>
                    <InfoCircleOutlined
                      onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }}
                      style={{
                        fontSize: 15,
                        color: "#8ea2b5",
                        flexShrink: 0,
                        cursor: "pointer",
                        transition: "color 160ms",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#1677ff")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#8ea2b5")}
                    />
                  </div>

                  <div className="flex flex-wrap content-start h-[65px] overflow-hidden gap-[6px]">
                    {item?.category && (
                      <span className="text-[12px] text-black bg-white border border-[rgba(159,176,195,0.22)] py-1 px-2 rounded-full">{item.category}</span>
                    )}
                    {/* Extra chips from parent (e.g. duration for courses, difficulty for internships) */}
                    {renderMetaChips?.(item)}
                    {item?.sections?.length ? (
                      <span className="text-[12px] text-black bg-white border border-[rgba(159,176,195,0.22)] py-1 px-2 rounded-full">{item.sections.length} Modules</span>
                    ) : null}
                  </div>

                  <p
                    className="text-[#b9c7d6] text-[13px] leading-[1.45] my-0.5 mb-1.5 line-clamp-3 overflow-hidden h-[60px]"
                    title={stripHtml(item?.description) || ""}
                  >
                    {(() => {
                      const text = stripHtml(item?.description) || "";
                      return text.slice(0, 120) + (text.length > 120 ? "…" : "");
                    })()}
                  </p>

                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[#8ea2b5] text-xs">
                      {item?.updatedAt && `Updated ${formatUpdatedDate(item.updatedAt)}`}
                    </div>
                    <Button
                      type="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        nav.push(getItemUrl(item));
                      }}
                    >
                      {viewLabel}
                    </Button>
                  </div>
                </div>
              </div>
            ))
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
