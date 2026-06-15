"use client";
import React, { memo } from "react";
import { Tabs, Space, Collapse, List, Button, Tooltip } from "antd";
import { FolderOpenOutlined, BulbOutlined } from "@ant-design/icons";
import { FiChevronRight } from "react-icons/fi";
import ChatBot from "@/universalUtils/chatBot/chatbot";
import interPageStyles from "../page.module.scss";

import { getSectionSummary, getTopicDurationLabel, isTopicCompleted, getTopicType, isLiveMeetingTopic } from "../utils/topicUtils";

const getTopicBadges = (topic) => {
  const type = getTopicType(topic);
  const isLive = isLiveMeetingTopic(topic);
  
  const badges = [];
  if (isLive) {
    badges.push(<span key="live" className={interPageStyles.liveBadge}>Live</span>);
  } else if (type === "video") {
    badges.push(<span key="video" className={interPageStyles.videoBadge}>Video</span>);
  } else if (type === "pdf") {
    badges.push(<span key="pdf" className={interPageStyles.pdfBadge}>PDF</span>);
  } else {
    badges.push(<span key="reading" className={interPageStyles.readingBadge}>Reading</span>);
  }
  
  if (topic?.resources?.length) {
    badges.push(<span key="resources" className={interPageStyles.resourcesBadge}>Resources</span>);
  }
  
  return badges;
};

const getSectionTitle = (section, index) => {
  const title = section?.title || "";
  if (/^unit\s*\d+/i.test(title)) return title;
  return `Unit ${index + 1} — ${title}`;
};

/**
 * ContentSidebar
 * Displays the course content (sections/topics) and the AI Assistant tab.
 */
const ContentSidebar = memo(({
  isExpandedView,
  openSectionKeys,
  handleSectionChange,
  selectedInternshipData,
  activeKey,
  selectedTopicIndex,
  getOneTopic,
  setActiveKey,
  setOpenSectionKeys,
  setSelectedTopicIndex,
  toggleTopicCheck,
  topicDurationOverrides,
  completedTopics,
  manualTopicChecks,
  displayProgress,
  displayCompletedCount,
  displayTotalCount,
}) => {
  return (
    <div className={`${interPageStyles.bodyStylesLeft} ${isExpandedView ? interPageStyles.bodyStylesLeftHidden : ""}`}>
      <Tabs
        defaultActiveKey="course-content"
        items={[
          {
            key: "course-content",
            label: (
              <Space size={6}>
                <FolderOpenOutlined />
                <span>Course content</span>
              </Space>
            ),
            children: (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", height: "100%" }}>
                {/* Overall Progress Card */}
                <div className={interPageStyles.progressCard}>
                  <div className={interPageStyles.progressCardHeader}>
                    <span className={interPageStyles.progressCardTitle}>Overall Progress</span>
                    <span className={interPageStyles.progressCardCount}>
                      {displayCompletedCount} / {displayTotalCount} lessons
                    </span>
                  </div>
                  <div className={interPageStyles.progressBarContainer}>
                    <div
                      className={interPageStyles.progressBarFill}
                      style={{ width: `${displayProgress}%` }}
                    />
                  </div>
                </div>

                <Collapse
                  expandIconPosition="end"
                  expandIcon={({ isActive }) => (
                    <FiChevronRight
                      size={16}
                      color="#64748b"
                      style={{
                        transform: isActive ? "rotate(90deg)" : "rotate(0deg)",
                        transition: "transform(0.2s)",
                      }}
                    />
                  )}
                  activeKey={openSectionKeys}
                  onChange={handleSectionChange}
                  items={selectedInternshipData?.sections?.map((section, i) => {
                    const sectionSummary = getSectionSummary(section, completedTopics, manualTopicChecks, topicDurationOverrides);

                    return {
                      key: String(i),
                      label: (
                        <div id={`section-container-${i}`} className={interPageStyles.sectionHeaderLabel}>
                          <div className={interPageStyles.sectionHeaderLeft}>
                            <Tooltip title={section?.title}>
                              <span className={interPageStyles.sectionTitle}>
                                {getSectionTitle(section, i)}
                              </span>
                            </Tooltip>
                          </div>
                          <div className={interPageStyles.sectionHeaderRight}>
                            <span className={interPageStyles.sectionBadge}>
                              {sectionSummary.progressText}
                            </span>
                            {sectionSummary.durationText ? (
                              <span className={interPageStyles.sectionBadge}>
                                {sectionSummary.durationText}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      ),
                      children: (
                        <List
                          dataSource={section?.topics || []}
                          split={false}
                          renderItem={(topic, ti) => {
                            const isActiveTopic = activeKey === i && selectedTopicIndex === ti;
                            const isCompleted = isTopicCompleted(topic, completedTopics, manualTopicChecks);

                            return (
                              <List.Item style={{ padding: 0, border: 0 }}>
                                <Button
                                  type="text"
                                  block
                                  onClick={() => {
                                    getOneTopic({ id: topic?._id });
                                    setActiveKey(i);
                                    setOpenSectionKeys((prev) => {
                                      const key = String(i);
                                      return prev.includes(key) ? prev : [...prev, key];
                                    });
                                    setSelectedTopicIndex(ti);
                                  }}
                                  className={isActiveTopic ? interPageStyles.topicButtonActive : interPageStyles.topicButton}
                                >
                                  <div className={interPageStyles.topicMain}>
                                    <div
                                      className={interPageStyles.checkboxWrapper46}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        toggleTopicCheck(topic);
                                      }}
                                      role="button"
                                      tabIndex={0}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          toggleTopicCheck(topic);
                                        }
                                      }}
                                    >
                                      <input
                                        className={interPageStyles.inpCbx}
                                        id={`cbx-${topic?._id}`}
                                        type="checkbox"
                                        checked={isCompleted}
                                        readOnly
                                      />
                                      <label className={interPageStyles.cbx} htmlFor={`cbx-${topic?._id}`}>
                                        <span>
                                          <svg width="12px" height="10px" viewBox="0 0 12 10">
                                            <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
                                          </svg>
                                        </span>
                                      </label>
                                    </div>
                                    <Tooltip title={`${ti + 1}. ${topic?.title}`}>
                                      <span className={interPageStyles.topicName}>
                                        {ti + 1}. {topic?.title}
                                      </span>
                                    </Tooltip>
                                  </div>

                                  <div className={interPageStyles.topicSubRow}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
                                      {getTopicBadges(topic)}
                                      {getTopicDurationLabel(topic, topicDurationOverrides) && (
                                        <span className={interPageStyles.topicDurationLabel}>
                                          • {getTopicDurationLabel(topic, topicDurationOverrides)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </Button>
                              </List.Item>
                            );
                          }}
                        />
                      ),
                    };
                  })}
                />
              </div>
            ),
          },
          {
            key: "ai-assistant",
            label: (
              <Space size={6}>
                <BulbOutlined />
                <span>AI Assistant</span>
              </Space>
            ),
            children: (
              <div className={interPageStyles.aiAssistantTabPane}>
                <ChatBot />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
});

ContentSidebar.displayName = "ContentSidebar";
export default ContentSidebar;
