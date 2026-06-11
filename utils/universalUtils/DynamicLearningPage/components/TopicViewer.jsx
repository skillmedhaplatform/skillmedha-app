"use client";
import React, { memo, useRef } from "react";
import { Button } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import interPageStyles from "../page.module.scss";

import TopicContentRouter from "./players/TopicContentRouter";
import ContentTabs from "./ContentTabs";

import { getTopicType } from "../utils/topicUtils";

/**
 * TopicViewer
 * The right side of the split view. Holds the player, bottom tabs, and next/prev footer.
 */
const TopicViewer = memo(({
  isExpandedView,
  toggleExpandedView,
  currentTopic,
  topicDetails,
  orgId,
  studentCreds,
  markTopicCompleted,
  setTopicDurationOverrides,
  handleNext,
  handlePrev,
  activeContentTab,
  setActiveContentTab,
  currentSection,
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
}) => {
  const rightBodyRef = useRef(null);

  const handleDisplayFullscreen = () => {
    if (typeof document === "undefined") return;
    const target = rightBodyRef.current;
    if (!target) return;

    if (document.fullscreenElement) {
      document.exitFullscreen?.();
      return;
    }
    target.requestFullscreen?.();
  };

  const currentTopicType = getTopicType(currentTopic);
  const shouldUseWhiteDisplayBg = currentTopicType === "topic";
  const shouldUseMediaDisplayStyle = currentTopicType === "video" || currentTopicType === "pdf";
  const shouldShowSideNavButtons = Boolean(currentTopic);

  return (
    <div className={`${interPageStyles.bodyStylesRight} ${isExpandedView ? interPageStyles.bodyStylesRightExpanded : ""}`}
         style={{ padding: shouldUseMediaDisplayStyle ? "0" : undefined }}>
      
      {isExpandedView ? (
        <Button
          className={interPageStyles.expandRestoreEdgeButton}
          onClick={toggleExpandedView}
          type="text"
          aria-label="Exit expanded view"
        >
          <span className={interPageStyles.expandRestoreContent}>
            <span className={interPageStyles.expandRestoreArrow}>
              <LeftOutlined />
            </span>
            <span className={interPageStyles.expandRestoreLabel}>Course content & AI Assistant</span>
          </span>
        </Button>
      ) : null}

      <div
        ref={rightBodyRef}
        className={interPageStyles.rightBody}
        style={{
          backgroundColor: shouldUseWhiteDisplayBg || shouldUseMediaDisplayStyle ? "#ffffff" : undefined,
          borderRadius: shouldUseMediaDisplayStyle ? 0 : undefined,
          padding: shouldUseMediaDisplayStyle ? "0" : undefined,
          paddingTop: shouldUseMediaDisplayStyle ? "1.5rem" : undefined,
          paddingLeft: shouldUseMediaDisplayStyle ? "1rem" : undefined,
          paddingRight: shouldUseMediaDisplayStyle ? "1rem" : undefined,
          overflow: shouldUseMediaDisplayStyle ? "hidden" : undefined,
        }}
      >
        {shouldShowSideNavButtons && (
          <Button
            className={`${interPageStyles.sideNavButton} ${interPageStyles.sideNavButtonLeft}`}
            onClick={handlePrev}
            type="text"
            icon={<LeftOutlined />}
            aria-label="Previous Topic"
          />
        )}

        <div
          className={interPageStyles.text}
          style={{
            width: "100%",
            height: "100%",
            padding: shouldUseMediaDisplayStyle ? "0" : undefined,
            overflow: shouldUseMediaDisplayStyle ? "visible" : "hidden",
          }}
        >
          <TopicContentRouter
            currentTopic={currentTopic}
            topicDetails={topicDetails}
            orgId={orgId}
            studentCreds={studentCreds}
            isExpandedView={isExpandedView}
            toggleExpandedView={toggleExpandedView}
            markTopicCompleted={markTopicCompleted}
            setTopicDurationOverrides={setTopicDurationOverrides}
            handleNextTopic={handleNext}
          />
        </div>

        {shouldShowSideNavButtons && (
          <Button
            className={`${interPageStyles.sideNavButton} ${interPageStyles.sideNavButtonRight}`}
            onClick={handleNext}
            type="text"
            icon={<RightOutlined />}
            aria-label="Next Topic"
          />
        )}

        {currentTopicType === "pdf" ? (
          <div className={interPageStyles.mediaActionButtons}>
            <Button className={interPageStyles.mediaActionButton} type="text" onClick={handleDisplayFullscreen}>
              <span>⛶</span>
            </Button>
            <Button className={interPageStyles.mediaActionButton} type="text" onClick={toggleExpandedView}>
              <span>{isExpandedView ? "⤡" : "⤢"}</span>
            </Button>
          </div>
        ) : null}
      </div>

      <div className={interPageStyles.rightBodyBotom}>
        <Button onClick={handlePrev} type="text" size="large" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <img src="https://res.cloudinary.com/dug3awue8/image/upload/v1746777649/order_icon_zlry2a.svg" width={"18px"} height={"18px"} alt="Prev" />
          <strong style={{ fontSize: "19px" }}>Previous</strong>
        </Button>
        <Button onClick={handleNext} type="text" size="large" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <strong style={{ fontSize: "19px" }}>Next</strong>
          <img src="https://res.cloudinary.com/dug3awue8/image/upload/v1746777649/order_icon_1_sxg14p.svg" width={"18px"} height={"18px"} alt="Next" />
        </Button>
      </div>

      <ContentTabs
        activeContentTab={activeContentTab}
        setActiveContentTab={setActiveContentTab}
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
  );
});

TopicViewer.displayName = "TopicViewer";
export default TopicViewer;
