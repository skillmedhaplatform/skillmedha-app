"use client";

import React, { useState } from "react";
import {
  Pagination,
  Tooltip,
  Button,
  Select,
  Input,
  Modal,
  Drawer,
  Tag,
  Row,
  Col,
  Badge,
} from "antd";
import {
  SearchOutlined,
  InfoCircleOutlined,
  FilterOutlined,
  CheckCircleOutlined,
  HeartOutlined,
  ShoppingCartOutlined,
  LockOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { BsX, BsPlus, BsStar, BsCheckCircleFill, BsBookmarkFill, BsBookmark, BsCodeSlash, BsClock, BsJournalBookmark } from "react-icons/bs";
import { HiOutlineBuildingOffice2, HiOutlineBookOpen } from "react-icons/hi2";
import BuyNowPopoverContent from "@/universalUtils/LibraryPage/BuyNowPopoverContent";
import styles from "./mobileLibrary.module.scss";

// ---- Helpers (mirrors LibraryPage) ----
const stripHtml = (html) => {
  if (typeof html !== 'string') return '';
  let text = html
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#34;/g, '"');
  return text.replace(/<[^>]*>/g, '');
};

const formatUpdatedDate = (dateInput) => {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  return isNaN(d.getTime())
    ? ""
    : d.toLocaleString("en-IN", { month: "short", year: "numeric" });
};

// ---- Info Modal Content (mirrors desktop InfoContent) ----
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
    padding: "16px",
    marginBottom: "8px",
    backgroundColor: "#ffffff",
    boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, overflowX: "hidden" }}>
      {/* Top Tags row */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, paddingBottom: 12, borderBottom: "1px solid #f0f0f0" }}>
        {item?.category && <Tag color="geekblue" style={{ fontSize: 12, padding: "2px 6px" }}>{item.category}</Tag>}
        {item?.difficulty && <Tag color={difficultyColorMap[item.difficulty] || "default"} style={{ fontSize: 12, padding: "2px 6px" }}>{item.difficulty}</Tag>}
        {item?.language && <Tag color="default" style={{ fontSize: 12, padding: "2px 6px" }}>🌐 {item.language}</Tag>}
        {item?.duration && <Tag color="cyan" style={{ fontSize: 12, padding: "2px 6px" }}>⏱ {item.duration}</Tag>}
        {item?.sections?.length ? <Tag color="purple" style={{ fontSize: 12, padding: "2px 6px" }}>📚 {item.sections.length} Modules</Tag> : null}
        {ci.videoDuration && <Tag color="cyan" style={{ fontSize: 12, padding: "2px 6px" }}>🎥 {ci.videoDuration}</Tag>}
        {item?.featured && <Tag color="gold" style={{ fontSize: 12, padding: "2px 6px" }}>⭐ Featured</Tag>}
        {item?.trending && <Tag color="red" style={{ fontSize: 12, padding: "2px 6px" }}>🔥 Trending</Tag>}
      </div>

      <Row gutter={[16, 12]} style={{ margin: 0 }}>
        {/* Left Column: What you'll learn & Includes */}
        <Col xs={24} md={14} style={{ paddingLeft: 0 }}>
          {item?.learningPoints?.length > 0 && (
            <div style={boxStyle}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1f2937", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                What you'll learn
              </div>
              <Row gutter={[12, 12]}>
                {item.learningPoints.slice(0, 8).map((point, i) => (
                  <Col xs={24} sm={12} key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <CheckCircleOutlined style={{ color: "#24A058", marginTop: 4, fontSize: 14 }} />
                    <span style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.5 }}>{point}</span>
                  </Col>
                ))}
              </Row>
            </div>
          )}

          {(ci.certificateOfCompletion || ci.lifetimeAccess || ci.articles || ci.codingExercises || ci.quizzes || ci.downloadableResources) && (
            <div style={boxStyle}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1f2937", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                This Course Includes
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {ci.certificateOfCompletion && <Tag color="green" style={{ fontSize: 12, padding: "2px 6px" }}>🏅 Certificate</Tag>}
                {ci.lifetimeAccess && <Tag color="green" style={{ fontSize: 12, padding: "2px 6px" }}>♾ Lifetime Access</Tag>}
                {ci.jobAssistance && <Tag color="green" style={{ fontSize: 12, padding: "2px 6px" }}>💼 Job Assistance</Tag>}
                {ci.articles && <Tag style={{ fontSize: 12, padding: "2px 6px" }}>{ci.articles} Articles</Tag>}
                {ci.quizzes && <Tag style={{ fontSize: 12, padding: "2px 6px" }}>{ci.quizzes} Quizzes</Tag>}
                {ci.codingExercises && <Tag style={{ fontSize: 12, padding: "2px 6px" }}>{ci.codingExercises} Exercises</Tag>}
                {ci.downloadableResources && <Tag style={{ fontSize: 12, padding: "2px 6px" }}>{ci.downloadableResources} Resources</Tag>}
              </div>
            </div>
          )}
        </Col>

        {/* Right Column: Tools, Prerequisites, Audience */}
        <Col xs={24} md={10} style={{ paddingRight: 0 }}>
          {item?.toolsWithIcons?.length > 0 && (
            <div style={boxStyle}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1f2937", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Tools & Technologies
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                {item.toolsWithIcons.slice(0, 8).map((tool, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, backgroundColor: "#f3f4f6", padding: "4px 10px", borderRadius: "6px" }}>
                    {tool.icon && (
                      <img src={tool.icon} alt={tool.name} style={{ width: 16, height: 16, objectFit: "contain" }} />
                    )}
                    <span style={{ color: "#374151", fontWeight: 500 }}>{tool.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {item?.preRequisites?.length > 0 && (
            <div style={boxStyle}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1f2937", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Prerequisites
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "#4b5563", lineHeight: 1.5 }}>
                {item.preRequisites.map((req, i) => <li key={i} style={{ marginBottom: 4 }}>{req}</li>)}
              </ul>
            </div>
          )}

          {item?.targetAudience?.length > 0 && (
            <div style={boxStyle}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1f2937", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Who is this for
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {item.targetAudience.map((a, i) => (
                  <Tag key={i} style={{ fontSize: 12, color: "#4b5563", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "2px 6px" }}>
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
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #f0f0f0", fontSize: 12, color: "#9ca3af" }}>
          Last updated: {formatUpdatedDate(item.updatedAt)}
        </div>
      )}
    </div>
  );
};

// ---- Skeleton Tile ----
const SkeletonTile = () => (
  <div className={styles.skeletonTile}>
    <div className={styles.skeletonThumb} />
    <div className={styles.skeletonBody}>
      <div className={`${styles.skeletonLine} ${styles.w70}`} />
      <div className={`${styles.skeletonLine} ${styles.w50}`} />
      <div className={`${styles.skeletonLine} ${styles.w90}`} />
      <div className={`${styles.skeletonLine} ${styles.w40}`} />
    </div>
  </div>
);

/**
 * Mobile-optimized library page for Courses and Internships.
 *
 * Receives all state & handlers from the parent LibraryPage component
 * so that filtering, pagination, and navigation logic stay unchanged.
 */
export default function MobileLibraryPage({
  // Config props (from page-level)
  title,
  viewLabel,
  searchPlaceholder,
  idPrefix,
  renderMetaChips,
  getItemUrl,
  // Data
  items,
  loading,
  paginationData,
  // Filter state
  searchInput,
  handleSearchChange,
  urlCategory,
  urlDifficulty,
  urlSort,
  categoryOptions,
  difficultyOptions,
  sortOptions,
  activeFilters,
  hasActiveFilters,
  // Filter handlers
  handleCategoryChange,
  handleDifficultyChange,
  handleSortChange,
  handleClearAll,
  removeFilter,
  pushParams,
  // Pagination
  currentPage,
  pageSize,
  handlePageChange,
  // Info modal
  selectedItem,
  setSelectedItem,
  // Navigation
  nav,
  // Added for new mobile banner & tabs
  totalAvailable,
  wishlistCount,
  cartCount,
  setWishlistOpen,
  setCartOpen,
  activeTab,
  setActiveTab,
  // Added for card interactions
  wishlistIdSet,
  wishlistPendingIds,
  onWishlistToggle,
  showWishlist,
  showBuyNow,
  cartIdSet,
  cartPendingIds,
  onAddToCart,
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [buyDrawerItem, setBuyDrawerItem] = useState(null);

  return (
    <div className={styles.container}>
      {/* Banner Section */}
      <div className="w-[calc(100%+28px)] -ml-[14px] h-[120px] min-h-[120px] flex flex-col justify-center p-4 shadow-sm bg-gradient-to-br from-[#071631] to-[#10254c] text-white shrink-0 relative overflow-hidden z-[50] mt-[-12px] sticky top-0">
        <div className="absolute inset-0 pointer-events-none z-[1]">
          <BsX className="absolute top-[20%] right-[10%] text-[#1E69DA] opacity-60 text-[1.2rem]" />
          <BsPlus className="absolute bottom-[20%] right-[30%] text-[#1E69DA] opacity-50 text-[1.5rem]" />
          <BsStar className="absolute top-[40%] right-[50%] text-[#1E69DA] opacity-50 text-[1.1rem]" />
          <BsX className="absolute bottom-[30%] right-[5%] text-[#1E69DA] opacity-60 text-[1.3rem]" />
        </div>

        <div className="flex items-center justify-between w-full relative z-[2]">
          <div className="flex items-center gap-3 relative z-10 flex-1">
            <div className="w-[48px] h-[48px] bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10 shrink-0">
              {title.toLowerCase().includes("internship") ? (
                <HiOutlineBuildingOffice2 className="text-white text-2xl" />
              ) : (
                <HiOutlineBookOpen className="text-white text-2xl" />
              )}
            </div>
            <div className="flex items-center overflow-hidden">
              <h1 className="text-[20px] font-bold text-white m-0 tracking-tight leading-none truncate border-none pb-0" style={{ border: 'none', borderBottom: 'none', outline: 'none' }}>
                {title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="flex flex-col items-center justify-center w-[36px]">
              <span className="text-[18px] font-bold text-white leading-none">{totalAvailable || 0}</span>
              <span className="text-[9px] text-[#94a3b8] font-bold tracking-wider uppercase mt-1 text-center truncate w-full">Courses</span>
            </div>
            {setCartOpen && (
              <Badge count={cartCount || 0} size="small" offset={[-2, 2]}>
                <button
                  onClick={() => setCartOpen(true)}
                  className="flex flex-col items-center justify-center bg-transparent border-none cursor-pointer p-0 m-0 w-[36px]"
                >
                  <ShoppingCartOutlined className="text-white text-[20px] leading-none" style={{ color: '#ffffff' }} />
                  <span className="text-[9px] text-[#94a3b8] font-bold tracking-wider uppercase mt-1 text-center truncate w-full">Cart</span>
                </button>
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* ---- White Background Tabs Section ---- */}
      <div className="w-[calc(100%+28px)] -ml-[14px] px-4 bg-white flex items-center justify-between border-b border-[#e2e8f0] shadow-sm mb-4 sticky top-[120px] z-[49] mt-[-12px]">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar flex-1 mr-2 pr-4">
          {/* All Internships/Courses */}
          <button
            onClick={() => {
              setActiveTab?.("all");
              handleClearAll?.();
            }}
            className={`py-3 px-1 text-[14px] font-bold transition-all relative border-none bg-transparent cursor-pointer whitespace-nowrap flex-shrink-0 min-w-max ${
              activeTab === "all" ? "text-[#1E69DA]" : "text-[#64748b] hover:text-[#334155]"
            }`}
          >
            All {title.toLowerCase().includes("internship") ? "Internships" : "Courses"}
            {activeTab === "all" && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1E69DA] rounded-t-md"></div>
            )}
          </button>
          
          {/* Wishlist Button */}
          {showWishlist && (
            <button 
              onClick={() => {
                setActiveTab?.("wishlist");
                handleClearAll?.();
              }}
              className={`py-3 px-1 text-[14px] font-bold transition-all relative border-none bg-transparent cursor-pointer whitespace-nowrap flex-shrink-0 min-w-max ${
                activeTab === "wishlist" ? "text-[#1E69DA]" : "text-[#64748b] hover:text-[#334155]"
              }`}
            >
              Wishlist {wishlistCount > 0 ? `(${wishlistCount})` : ""}
              {activeTab === "wishlist" && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1E69DA] rounded-t-md"></div>
              )}
            </button>
          )}

          {/* My Internships/Courses */}
          <button
            onClick={() => {
              setActiveTab?.("my");
              handleClearAll?.();
            }}
            className={`py-3 px-1 text-[14px] font-bold transition-all relative border-none bg-transparent cursor-pointer whitespace-nowrap flex-shrink-0 min-w-max ${
              activeTab === "my" ? "text-[#1E69DA]" : "text-[#64748b] hover:text-[#334155]"
            }`}
          >
            My {title.toLowerCase().includes("internship") ? "Internships" : "Courses"}
            {activeTab === "my" && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1E69DA] rounded-t-md"></div>
            )}
          </button>
          
          {/* Spacer for horizontal scroll cutoff fix */}
          <div className="w-4 min-w-[16px] shrink-0" aria-hidden="true" />
        </div>
        
        <button
          className="w-[36px] h-[36px] rounded-full flex items-center justify-center bg-[#F1F5F9] text-[#64748B] shrink-0 border-none relative cursor-pointer active:bg-gray-200 transition-colors"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open filters"
        >
          <FilterOutlined style={{ fontSize: 16 }} />
          {hasActiveFilters && (
            <div className="absolute -top-1 -right-1 w-[14px] h-[14px] bg-red-500 rounded-full border-2 border-white" />
          )}
        </button>
      </div>

      {/* ---- Search Input Row ---- */}
      <div className="w-full mb-3">
        <Input
          placeholder={searchPlaceholder || `Search ${title.toLowerCase()}...`}
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          prefix={<SearchOutlined className="text-[#94a3b8]" />}
          allowClear
          className="w-full rounded-xl h-[42px] bg-white border border-[#e2e8f0] shadow-sm hover:border-[#1E69DA] focus-within:border-[#1E69DA] focus-within:shadow-[0_0_0_2px_rgba(30,105,218,0.1)] transition-all [&>input]:text-[#0f172a] [&>input::placeholder]:text-[#94a3b8]"
        />
      </div>

      {/* ---- Active Filter Chips ---- */}
      {hasActiveFilters && (
        <div className={styles.filterChips}>
          {activeFilters.map(({ key, label }) => (
            <span key={key} className={styles.filterChip}>
              {label}
              <button
                className={styles.chipRemove}
                onClick={() => removeFilter(key)}
                aria-label={`Remove ${key} filter`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* ---- Results Count ---- */}
      {!loading && items?.length > 0 && paginationData?.totalLength > 0 && (
        <div className={styles.resultsCount}>
          Showing {items.length} of {paginationData.totalLength} results
        </div>
      )}

      {/* ---- Tile Grid ---- */}
      <div className={styles.tileGrid}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonTile key={i} />)
        ) : !items?.length ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>🔍</span>
            <p className={styles.emptyText}>
              No {title.toLowerCase()} found
              {hasActiveFilters ? " matching your filters" : ""}.
            </p>
            {hasActiveFilters && (
              <button className={styles.clearLink} onClick={handleClearAll}>
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          items.map((item) => {
            const isEnrolled = item?._uiState?.isEnrolled || false;
            const progressVal = item?._uiState?.progressVal || 0;
            const isProgressLoading = item?._uiState?.isProgressLoading || false;
            
            const duration = item?.duration || item?.courseIncludes?.videoDuration;
            const modulesCount = item?.sections?.length || 0;
            const createdAtDate = item?.createdAt ? formatUpdatedDate(item.createdAt) : "";

            const inWishlist = wishlistIdSet?.has(item?._id);
            const isWishlistLoading = wishlistPendingIds?.includes(item?._id);
            const inCart = cartIdSet?.has(item?._id);
            const isCartLoading = cartPendingIds?.includes(item?._id);

            let statusText = "Not started";
            let buttonText = "Start";
            let statusColor = "text-[#94a3b8]";

            if (isProgressLoading) {
              statusText = "Loading…";
            } else if (isEnrolled) {
              if (progressVal > 0) {
                statusText = `${progressVal}% complete`;
                buttonText = "Continue";
                statusColor = "text-[#10b981]";
              }
            } else {
              buttonText = "Buy";
            }

            const imageUrl =
              item?.media?.thumbnailImage ||
              item?.media?.coverImage ||
              item?.thumbnail ||
              item?.image ||
              item?.bannerImage ||
              item?.coverImage ||
              item?.companyLogo ||
              "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80";

            return (
              <div
                key={item?._id}
                className="group flex flex-col bg-white text-black border-[1px] border-[#cbd5e1] rounded-2xl overflow-hidden transition-all duration-300 shadow-sm"
              >
                {/* Card Image */}
                <div className="relative w-full h-[170px] p-2 pb-0 bg-white">
                  <div className="relative w-full h-full rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center">
                    <img src={imageUrl} alt={item.title || "Thumbnail"} className="w-full h-full object-cover" />

                    {isEnrolled && (
                      <div className="absolute top-2 left-2 bg-[#022c22] backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1.5 border-[0.5px] border-[#047857]">
                        <BsCheckCircleFill className="text-[#10b981] text-[10px]" />
                        <span className="text-[#10b981] text-[11px] font-medium tracking-wide">Enrolled</span>
                      </div>
                    )}
                    {onWishlistToggle && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onWishlistToggle(item, e); }}
                        disabled={isWishlistLoading}
                        aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                        className="absolute top-2 right-2 bg-black/30 backdrop-blur-sm p-1.5 rounded-lg border-[0.5px] border-white/10 cursor-pointer transition-colors disabled:opacity-60 z-10"
                      >
                        {inWishlist ? (
                          <BsBookmarkFill className="text-[#facc15] text-[14px]" />
                        ) : (
                          <BsBookmark className="text-white text-[14px]" />
                        )}
                      </button>
                    )}
                    <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-0.5 bg-black/20 backdrop-blur-sm rounded-lg">
                      <BsCodeSlash className="text-white/80 text-[12px]" />
                      <span className="text-white/90 text-[11px] font-medium">{item.category || "General"}</span>
                    </div>
                    {item.difficulty && (
                      <div className={`absolute bottom-2 right-2 px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm ${
                        item.difficulty?.toLowerCase() === "beginner" ? "bg-[#047857]/90 text-white" :
                        item.difficulty?.toLowerCase() === "intermediate" ? "bg-[#d97706]/90 text-white" :
                        "bg-[#dc2626]/90 text-white"
                      }`}>
                        {item.difficulty}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Content */}
                <div className="flex flex-col p-3 flex-1">
                  <Tooltip title={item?.title} placement="topLeft" mouseEnterDelay={0.5}>
                    <h3 className="text-[15px] font-bold text-[#1e293b] leading-tight mb-2 line-clamp-2 min-h-[36px]">
                      {item?.title}
                    </h3>
                  </Tooltip>

                  <p className="text-[#64748b] text-[12px] font-medium leading-snug mb-3 line-clamp-2 min-h-[34px]">
                    {stripHtml(item?.description)}
                  </p>

                  {/* Progress Bar */}
                  <div className="w-full flex items-center gap-3 mb-4">
                    <div className="flex-1 h-[8px] bg-[#f1f5f9] rounded-full overflow-hidden">
                      {isEnrolled && (
                        <div
                          className="h-full bg-gradient-to-br from-[#1E69DA] to-[#5694F0] rounded-full transition-all duration-500"
                          style={{ width: `${progressVal}%` }}
                        />
                      )}
                    </div>
                    <span className="text-[13px] font-bold text-[#64748b] min-w-[32px] text-right">
                      {isEnrolled ? `${progressVal}%` : "0%"}
                    </span>
                  </div>

                  {/* Meta Row */}
                  <div className="flex items-center gap-2 text-[11px] text-[#94a3b8] font-bold mb-4">
                    {duration && <span className="flex items-center gap-1"><BsClock /> {duration}</span>}
                    {duration && modulesCount > 0 && <span>•</span>}
                    {modulesCount > 0 && <span className="flex items-center gap-1"><BsJournalBookmark /> {modulesCount} modules</span>}
                    {createdAtDate && (duration || modulesCount > 0) && <span>•</span>}
                    {createdAtDate && <span>{createdAtDate}</span>}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#f1f5f9]">
                    <span className={`text-[12px] font-bold flex items-center gap-1 ${statusColor}`}>
                      {statusText}
                    </span>
                    <button
                      className="bg-gradient-to-br from-[#1E69DA] to-[#5694F0] active:opacity-90 text-white text-[13px] font-medium py-1.5 px-5 rounded-[20px] border-none cursor-pointer transition-opacity flex items-center gap-1.5 shadow-sm"
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        if (isEnrolled) {
                          nav.push(getItemUrl(item)); 
                        } else {
                          setBuyDrawerItem(item);
                        }
                      }}
                    >
                      {buttonText === "Buy" ? (
                        <><LockOutlined /> Buy</>
                      ) : buttonText === "Start" ? (
                        "+ Start"
                      ) : (
                        `▷ ${buttonText}`
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ---- Pagination Removed ---- */}

      {/* ---- Info Modal ---- */}
      <Modal
        open={!!selectedItem}
        onCancel={() => setSelectedItem(null)}
        className={styles.infoModal}
        title={
          <div style={{ paddingRight: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.3 }}>
              {selectedItem?.title}
            </div>
            {selectedItem?.subtitle && (
              <div style={{ fontWeight: 400, fontSize: 11, color: "#888", marginTop: 3, fontStyle: "italic" }}>
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
            onClick={() => {
              nav.push(getItemUrl(selectedItem));
              setSelectedItem(null);
            }}
          >
            {viewLabel}
          </Button>,
        ]}
        width="100%"
        centered
        styles={{ body: { padding: 0 } }}
      >
        <div
          style={{ maxHeight: "65vh", overflowY: "auto", overflowX: "hidden", padding: "16px" }}
        >
          {selectedItem && <InfoContent item={selectedItem} />}
        </div>
      </Modal>

      {/* ---- Filter Drawer (Bottom Sheet) ---- */}
      <Drawer
        title="Filters"
        placement="bottom"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        styles={{ body: { height: "auto" } }}
        className={styles.filterDrawer}
      >
        <div className={styles.drawerContent}>
          <div className={styles.drawerField}>
            <label>Category</label>
            <Select
              placeholder="All Categories"
              value={urlCategory || undefined}
              onChange={handleCategoryChange}
              allowClear
              options={categoryOptions}
              className="w-full"
            />
          </div>
          <div className={styles.drawerField}>
            <label>Difficulty</label>
            <Select
              placeholder="All Levels"
              value={urlDifficulty || undefined}
              onChange={handleDifficultyChange}
              allowClear
              options={difficultyOptions}
              className="w-full"
            />
          </div>
          <div className={styles.drawerField}>
            <label>Sort By</label>
            <Select
              placeholder="Sort By"
              value={urlSort === "default" ? undefined : urlSort}
              onChange={handleSortChange}
              allowClear
              options={sortOptions}
              className="w-full"
            />
          </div>
          <div className={styles.drawerActions}>
            {hasActiveFilters && (
              <Button
                danger
                onClick={() => {
                  handleClearAll();
                  setDrawerOpen(false);
                }}
                style={{ flex: 1, borderRadius: 8 }}
              >
                Clear All
              </Button>
            )}
            <Button
              type="primary"
              onClick={() => setDrawerOpen(false)}
              style={{ flex: 1, borderRadius: 8 }}
            >
              Done
            </Button>
          </div>
        </div>
      </Drawer>

      {/* ---- Buy Now Drawer (Bottom Sheet) ---- */}
      <Drawer
        placement="bottom"
        open={!!buyDrawerItem}
        onClose={() => setBuyDrawerItem(null)}
        closable={false}
        className={styles.filterDrawer}
        height="auto"
        styles={{ body: { padding: 0 } }}
      >
        <div className="relative pt-3 pb-4">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[36px] h-[4px] rounded-full bg-[#cbd5e1] z-10"></div>
          {buyDrawerItem && (
            <BuyNowPopoverContent
              item={buyDrawerItem}
              onAddToWishlist={(it) => onWishlistToggle?.(it)}
              onAddToCart={(it) => {
                if (!cartIdSet?.has(it._id)) {
                  onAddToCart?.(it);
                } else {
                  setCartOpen?.(true);
                }
              }}
              isInCart={cartIdSet?.has(buyDrawerItem?._id)}
              isInWishlist={wishlistIdSet?.has(buyDrawerItem?._id)}
              cartLoading={cartPendingIds?.includes(buyDrawerItem?._id)}
              wishlistLoading={wishlistPendingIds?.includes(buyDrawerItem?._id)}
              isEnrolled={buyDrawerItem?._uiState?.isEnrolled}
            />
          )}
        </div>
      </Drawer>
    </div>
  );
}
