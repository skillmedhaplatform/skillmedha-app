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
} from "antd";
import {
  SearchOutlined,
  InfoCircleOutlined,
  FilterOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import styles from "./mobileLibrary.module.scss";

// ---- Helpers (mirrors LibraryPage) ----
const stripHtml = (html) =>
  typeof html === "string" ? html.replace(/<[^>]*>/g, "") : "";

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
  categoryOptions,
  difficultyOptions,
  activeFilters,
  hasActiveFilters,
  // Filter handlers
  handleCategoryChange,
  handleDifficultyChange,
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
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className={styles.container}>
      {/* ---- Sticky Header ---- */}
      <div className={styles.header}>
        <h1 className={styles.headerTitle}>{title}</h1>
        <div className={styles.headerActions}>
          <button
            className={`${styles.filterBtn} ${hasActiveFilters ? styles.filterBtnActive : ""}`}
            onClick={() => setDrawerOpen(true)}
            aria-label="Open filters"
          >
            <span className={styles.filterIcon}><FilterOutlined /></span>
            Filters
            {hasActiveFilters && (
              <span className={styles.filterBadge}>{activeFilters.length}</span>
            )}
          </button>
        </div>
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
          items.map((item) => (
            <div key={item?._id} className={styles.tile}>
              {/* Thumbnail */}
              <div className={styles.tileThumbnail}>
                <img
                  src={item?.coverImage || item?.media?.coverImage || ""}
                  alt={item?.title || title}
                  loading="lazy"
                />
              </div>

              {/* Content */}
              <div className={styles.tileContent}>
                <Tooltip title={item?.title} placement="topLeft" mouseEnterDelay={0.5}>
                  <h3 className={styles.tileTitle}>{item?.title}</h3>
                </Tooltip>

                <div className={styles.tileChips}>
                  {item?.category && (
                    <span className={styles.tileChip}>{item.category}</span>
                  )}
                  {renderMetaChips?.(item)}
                  {item?.sections?.length ? (
                    <span className={styles.tileChip}>{item.sections.length} Modules</span>
                  ) : null}
                </div>

                <p className={styles.tileDescription}>
                  {(() => {
                    const text = stripHtml(item?.description) || "";
                    return text.slice(0, 100) + (text.length > 100 ? "…" : "");
                  })()}
                </p>

                <div className={styles.tileMeta}>
                  <span className={styles.tileDate}>
                    {item?.updatedAt && `Updated ${formatUpdatedDate(item.updatedAt)}`}
                  </span>
                </div>
              </div>

              {/* Action */}
              <div className={styles.tileAction}>
                <button
                  className={styles.infoBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedItem(item);
                  }}
                  aria-label="View details"
                >
                  <InfoCircleOutlined />
                </button>
                <Button
                  type="primary"
                  className={styles.viewBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    nav.push(getItemUrl(item));
                  }}
                >
                  {viewLabel}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ---- Pagination ---- */}
      {paginationData && paginationData.totalLength > 0 && !loading && (
        <div className={styles.paginationWrapper}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={paginationData.totalLength}
            onChange={handlePageChange}
            size="small"
            showSizeChanger={false}
          />
        </div>
      )}

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
            <label>Search</label>
            <Input
              id={`${idPrefix}-mobile-search`}
              prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
              placeholder={searchPlaceholder}
              value={searchInput}
              onChange={handleSearchChange}
              allowClear
              onClear={() => pushParams({ search: "" })}
              style={{ borderRadius: 8 }}
            />
          </div>

          <div className={styles.drawerField}>
            <label>Category</label>
            <Select
              id={`${idPrefix}-mobile-category`}
              placeholder="All Categories"
              value={urlCategory || undefined}
              onChange={handleCategoryChange}
              allowClear
              options={categoryOptions}
              style={{ width: "100%" }}
              popupMatchSelectWidth={false}
            />
          </div>

          <div className={styles.drawerField}>
            <label>Level</label>
            <Select
              id={`${idPrefix}-mobile-difficulty`}
              placeholder="All Levels"
              value={urlDifficulty || undefined}
              onChange={handleDifficultyChange}
              allowClear
              options={difficultyOptions}
              style={{ width: "100%" }}
              popupMatchSelectWidth={false}
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
    </div>
  );
}
