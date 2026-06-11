"use client";
import React, { useState, useEffect } from "react";
import { Progress, Popover, Button, Modal, Drawer, Tabs, Collapse, List, Tooltip, Tag, Space, App } from "antd";
import { 
  TrophyOutlined, 
  DownOutlined, 
  LogoutOutlined, 
  FolderOpenOutlined, 
  BulbOutlined, 
  ClockCircleOutlined, 
  LeftOutlined,
  RightOutlined
} from "@ant-design/icons";
import { FiChevronRight } from "react-icons/fi";
import { useRouter } from "next/navigation";
import styles from "./mobileClassroom.module.scss";

import TopicContentRouter from "@/universalUtils/DynamicLearningPage/components/players/TopicContentRouter";
import NoteEditor from "@/universalUtils/DynamicLearningPage/components/NoteEditor";
import ResourceList from "@/universalUtils/DynamicLearningPage/components/ResourceList";
import ChatBot from "@/universalUtils/chatBot/chatbot";

import { getTopicType } from "@/universalUtils/DynamicLearningPage/utils/topicUtils";
import { getSectionSummary, getTopicTypeDurationIcon, getTopicDurationLabel, isTopicCompleted } from "@/universalUtils/DynamicLearningPage/utils/topicUtils";

export default function MobileClassroomPlayer({
  selectedInternshipData,
  studentCreds,
  topicDetails,
  orgId,
  selectedTitle,
  getOneTopic,
  topicDurationOverrides,
  setTopicDurationOverrides,
  activeKey,
  setActiveKey,
  openSectionKeys,
  setOpenSectionKeys,
  selectedTopicIndex,
  setSelectedTopicIndex,
  isNavigating,
  handleNext,
  handlePrev,
  handleSectionChange,
  completedTopics,
  manualTopicChecks,
  toggleTopicCheck,
  markTopicCompleted,
  displayProgress,
  displayCompletedCount,
  displayTotalCount,
  activeContentTab,
  setActiveContentTab,
  notesList,
  newNoteContent,
  setNewNoteContent,
  isCreatingNote,
  setIsCreatingNote,
  editingNoteId,
  setEditingNoteId,
  editingNoteContent,
  setEditingNoteContent,
  isSavingNote,
  isLoadingNote,
  handleSaveNewNote,
  handleUpdateNote,
  handleDeleteNote,
}) {
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerActiveTab, setDrawerActiveTab] = useState("course-content");

  useEffect(() => {
    // Prevent swipe-to-go-back gesture
    const originalOverscroll = document.body.style.overscrollBehaviorX;
    document.body.style.overscrollBehaviorX = "none";
    return () => {
      document.body.style.overscrollBehaviorX = originalOverscroll;
    };
  }, []);

  const { modal } = App.useApp();

  const handleExit = () => {
    modal.confirm({
      title: "Exit Learning Page?",
      content: "Are you sure you want to leave this page? Your progress has been saved.",
      okText: "Exit",
      okType: "danger",
      cancelText: "Stay",
      onOk: () => {
        router.back();
      },
    });
  };

  const courseHeading = selectedInternshipData?.title || selectedTitle;
  const currentSection = selectedInternshipData?.sections?.[activeKey];
  const currentTopic = currentSection?.topics?.[selectedTopicIndex];

  const currentTopicType = getTopicType(currentTopic);
  const shouldUseWhiteBg = currentTopicType === "topic";
  const shouldUseMediaStyle = currentTopicType === "video" || currentTopicType === "pdf";

  // Build tabs items for the bottom section
  const tabsItems = [
    {
      key: "overview",
      label: "Overview",
      children: (
        <div className={styles.tabPaneMobileContent}>
          <h3 className={styles.tabTitle}>About this topic</h3>
          <div
            className={styles.aboutContent}
            dangerouslySetInnerHTML={{
              __html: currentTopic?.about || "No description available.",
            }}
          />
        </div>
      ),
    },
    {
      key: "notes",
      label: "Notes",
      children: (
        <div className={styles.tabPaneMobileContent}>
          <NoteEditor
            currentSection={currentSection}
            currentTopic={currentTopic}
            notesList={notesList}
            newNoteContent={newNoteContent}
            setNewNoteContent={setNewNoteContent}
            isCreatingNote={isCreatingNote}
            setIsCreatingNote={setIsCreatingNote}
            editingNoteId={editingNoteId}
            setEditingNoteId={setEditingNoteId}
            editingNoteContent={editingNoteContent}
            setEditingNoteContent={setEditingNoteContent}
            isSavingNote={isSavingNote}
            isLoadingNote={isLoadingNote}
            handleSaveNewNote={handleSaveNewNote}
            handleUpdateNote={handleUpdateNote}
            handleDeleteNote={handleDeleteNote}
          />
        </div>
      ),
    },
    {
      key: "resources",
      label: "Resources",
      children: (
        <div className={styles.tabPaneMobileContent}>
          <h3 className={styles.tabTitle}>Resources</h3>
          <ResourceList items={currentTopic?.resources} title="Resource" iconType="pdf" />
        </div>
      ),
    },
  ];

  if (currentTopic?.sourceCode?.length > 0) {
    tabsItems.push({
      key: "sourceCode",
      label: "Source Code",
      children: (
        <div className={styles.tabPaneMobileContent}>
          <h3 className={styles.tabTitle}>Source Code</h3>
          <ResourceList items={currentTopic?.sourceCode} title="Source Code" iconType="code" />
        </div>
      ),
    });
  }

  const openDrawerTab = (tabKey) => {
    setDrawerActiveTab(tabKey);
    setIsDrawerOpen(true);
  };

  return (
    <App>
      <div className={styles.container}>
        {/* 1. Header Section */}
        <div className={styles.headerBar}>
          <div className={styles.headerLeft}>
            <Progress
              type="circle"
              percent={displayProgress}
              size={36}
              strokeColor={isNavigating ? "#faad14" : undefined}
            />
            <span className={styles.courseHeadingCompact} title={courseHeading}>
              {courseHeading}
            </span>
          </div>

          <div className={styles.headerRight}>
            <Popover
              trigger="click"
              placement="bottomRight"
              content={
                <div style={{ minWidth: "16rem", padding: "0.25rem" }}>
                  <div style={{ color: "#2c3043", fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                    {displayCompletedCount} of {displayTotalCount} complete
                  </div>
                  <div style={{ color: "#6f7288", fontSize: "0.85rem" }}>
                    Finish course to get your certificate
                  </div>
                </div>
              }
            >
              <button type="button" className={styles.progressButtonCompact}>
                <TrophyOutlined style={{ fontSize: "14px" }} />
                <span>Progress</span>
                <DownOutlined style={{ fontSize: "10px" }} />
              </button>
            </Popover>

            <Button
              type="default"
              danger
              icon={<LogoutOutlined />}
              onClick={handleExit}
              className={styles.exitBtnCompact}
            >
              Exit
            </Button>
          </div>
        </div>

        {/* 2. Main Content & Player */}
        <div className={styles.mainContent}>
          <div className={styles.playerWrapper}>
            <div className={`${styles.playerInner} ${shouldUseWhiteBg ? styles.whiteBg : ""}`}>
              <TopicContentRouter
                currentTopic={currentTopic}
                topicDetails={topicDetails}
                orgId={orgId}
                studentCreds={studentCreds}
                isExpandedView={true}
                toggleExpandedView={() => {}}
                markTopicCompleted={markTopicCompleted}
                setTopicDurationOverrides={setTopicDurationOverrides}
                handleNextTopic={handleNext}
              />
            </div>
          </div>

          {/* 3. Navigation Controls Row */}
          <div className={styles.navigationRow}>
            <Button onClick={handlePrev} className={styles.navBtn} icon={<LeftOutlined />}>
              Previous
            </Button>
            <Button onClick={handleNext} className={styles.navBtn}>
              Next <RightOutlined />
            </Button>
          </div>

          {/* 4. Drawer Toggle Bar */}
          <div className={styles.toggleBar}>
            <Button 
              className={`${styles.toggleBarBtn} ${drawerActiveTab === "course-content" && isDrawerOpen ? styles.active : ""}`}
              onClick={() => openDrawerTab("course-content")}
              icon={<FolderOpenOutlined />}
            >
              Course Content
            </Button>
            <Button 
              className={`${styles.toggleBarBtn} ${drawerActiveTab === "ai-assistant" && isDrawerOpen ? styles.active : ""}`}
              onClick={() => openDrawerTab("ai-assistant")}
              icon={<BulbOutlined />}
            >
              AI Assistant
            </Button>
          </div>

          {/* 5. Bottom Tabs (Overview, Notes, Resources) */}
          <div className={styles.bottomTabsWrapper}>
            <Tabs
              activeKey={activeContentTab}
              onChange={setActiveContentTab}
              items={tabsItems}
            />
          </div>
        </div>

        {/* Course Content / AI Assistant Drawer */}
        <Drawer
          title={drawerActiveTab === "course-content" ? "Course Content" : "AI Assistant"}
          placement="bottom"
          size="large"
          onClose={() => setIsDrawerOpen(false)}
          open={isDrawerOpen}
          styles={{ body: { padding: 0 } }}
        >
          {drawerActiveTab === "course-content" ? (
            <div style={{ padding: "12px", height: "100%", overflowY: "auto" }}>
              <Collapse
                expandIconPosition="end"
                expandIcon={({ isActive }) => (
                  <FiChevronRight
                    size={18}
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
                      <div id={`section-container-${i}`} className={styles.sectionHeaderLabel}>
                        <div className={styles.sectionHeaderTop}>
                          <span className={styles.sectionTitle}>{section?.title}</span>
                        </div>
                        <div className={styles.sectionMeta}>
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
                                  setIsDrawerOpen(false); // Auto close drawer on lesson selection
                                }}
                                className={isActiveTopic ? styles.topicButtonActive : styles.topicButton}
                              >
                                <div className={styles.topicMain}>
                                  <div
                                    className={styles.checkboxWrapper46}
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
                                      className={styles.inpCbx}
                                      id={`mobile-cbx-${topic?._id}`}
                                      type="checkbox"
                                      checked={isCompleted}
                                      readOnly
                                    />
                                    <label className={styles.cbx} htmlFor={`mobile-cbx-${topic?._id}`}>
                                      <span>
                                        <svg width="10px" height="8px" viewBox="0 0 12 10">
                                          <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
                                        </svg>
                                      </span>
                                    </label>
                                  </div>
                                  <span className={styles.topicName}>
                                    {ti + 1}. {topic?.title}
                                  </span>
                                </div>

                                <div className={styles.topicSubRow}>
                                  <span className={styles.topicDuration}>
                                    {getTopicTypeDurationIcon(topic)} {getTopicDurationLabel(topic, topicDurationOverrides)}
                                  </span>

                                  {topic?.resources?.length ? (
                                    <Tag className={styles.resourceTag}>Resources</Tag>
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
            </div>
          ) : (
            <div className={styles.aiAssistantTabPane}>
              <ChatBot />
            </div>
          )}
        </Drawer>
      </div>
    </App>
  );
}
