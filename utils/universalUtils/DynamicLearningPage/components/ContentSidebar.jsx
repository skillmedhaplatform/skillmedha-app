"use client";
import React, { memo } from "react";
import { Tabs, Space, Collapse, List, Button, Tooltip, Tag } from "antd";
import { FolderOpenOutlined, BulbOutlined, ClockCircleOutlined, LeftOutlined } from "@ant-design/icons";
import { FiChevronRight } from "react-icons/fi";
import ChatBot from "@/universalUtils/chatBot/chatbot";
import interPageStyles from "../page.module.scss";

import { getSectionSummary, getTopicTypeDurationIcon, getTopicDurationLabel, isTopicCompleted } from "../utils/topicUtils";

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
              <Collapse
                expandIconPosition="end"
                expandIcon={({ isActive }) => (
                  <FiChevronRight
                    size={20}
                    color="#000000"
                    style={{
                      transform: isActive ? "rotate(90deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease-in-out",
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
                        <div className={interPageStyles.sectionHeaderTop}>
                          <Tooltip title={section?.title}>
                            <span className={interPageStyles.sectionTitle}>{section?.title}</span>
                          </Tooltip>
                        </div>
                        <div className={interPageStyles.sectionMeta}>
                          <span>
                            <FolderOpenOutlined /> {sectionSummary.progressText}
                          </span>
                          {sectionSummary.durationText ? (
                            <span>
                              <ClockCircleOutlined /> {sectionSummary.durationText}
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
                                  <span className={interPageStyles.topicDuration}>
                                    {getTopicTypeDurationIcon(topic)} {getTopicDurationLabel(topic, topicDurationOverrides)}
                                  </span>

                                  {topic?.resources?.length ? (
                                    <Tag className={interPageStyles.resourceTag}>Resources</Tag>
                                  ) : null}
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
