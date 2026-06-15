"use client";
import React, { useState, useEffect } from "react";
import interPageStyles from "./page.module.scss";
import "./page.css";

// Hooks
import { useLearningData } from "./hooks/useLearningData";
import { useNavigation } from "./hooks/useNavigation";
import { useProgress } from "./hooks/useProgress";
import { useNotes } from "./hooks/useNotes";
import { useDurationResolver } from "./hooks/useDurationResolver";

// Components
import TitleBar from "./components/TitleBar";
import ContentSidebar from "./components/ContentSidebar";
import TopicViewer from "./components/TopicViewer";

import useResponsive from "@/hooks/useResponsive";
import MobileClassroomPlayer from "@/mobile_views/classroom/MobileClassroomPlayer";

export default function DynamicLearningPage({ moduleType }) {
  const isMobile = useResponsive();
  const [mounted, setMounted] = useState(false);
  const [activeContentTab, setActiveContentTab] = useState("overview");
  const [topicDetails, setTopicDetails] = useState({});
  const [isExpandedView, setIsExpandedView] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // 1. Data layer
  const {
    selectedInternshipData,
    studentCreds,
    lastAccessedSection,
    lastAccessedTopic,
    serverCompletedTopicIds,
    serverTotalProgress,
    serverCompletedCount,
    serverTotalCount,
    internshipId,
    orgId,
    selectedTitle,
    getOneTopic,
  } = useLearningData(setTopicDetails);

  // 2. Duration overrides
  const { topicDurationOverrides, setTopicDurationOverrides } = useDurationResolver({
    selectedInternshipData,
  });

  // 3. Navigation
  const {
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
  } = useNavigation({
    mounted,
    selectedInternshipData,
    lastAccessedSection,
    lastAccessedTopic,
    studentCreds,
    internshipId,
    orgId,
    moduleType,
    getOneTopic,
  });

  // 4. Progress Tracking
  const {
    completedTopics,
    manualTopicChecks,
    markTopicCompleted,
    toggleTopicCheck,
    displayProgress,
    displayCompletedCount,
    displayTotalCount,
  } = useProgress({
    serverCompletedTopicIds,
    serverTotalProgress,
    serverCompletedCount,
    serverTotalCount,
    selectedInternshipData,
    studentCreds,
    internshipId,
    orgId,
    moduleType,
  });

  // 5. Notes
  const {
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
    fetchNote,
    handleSaveNewNote,
    handleUpdateNote,
    handleDeleteNote,
  } = useNotes({ internshipId });

  // Fetch note when tab/topic changes
  const currentSection = selectedInternshipData?.sections?.[activeKey];
  const currentTopic = currentSection?.topics?.[selectedTopicIndex];

  useEffect(() => {
    if (activeContentTab === "notes" && currentTopic?._id) {
      fetchNote(currentTopic._id);
    }
  }, [currentTopic?._id, activeContentTab, fetchNote]);

  if (!mounted || !selectedInternshipData) return null;

  const toggleExpandedView = () => setIsExpandedView((prev) => !prev);
  const courseHeading = selectedInternshipData?.title || selectedTitle;

  if (isMobile) {
    return (
      <MobileClassroomPlayer
        selectedInternshipData={selectedInternshipData}
        studentCreds={studentCreds}
        topicDetails={topicDetails}
        orgId={orgId}
        selectedTitle={selectedTitle}
        getOneTopic={getOneTopic}
        topicDurationOverrides={topicDurationOverrides}
        setTopicDurationOverrides={setTopicDurationOverrides}
        activeKey={activeKey}
        setActiveKey={setActiveKey}
        openSectionKeys={openSectionKeys}
        setOpenSectionKeys={setOpenSectionKeys}
        selectedTopicIndex={selectedTopicIndex}
        setSelectedTopicIndex={setSelectedTopicIndex}
        isNavigating={isNavigating}
        handleNext={handleNext}
        handlePrev={handlePrev}
        handleSectionChange={handleSectionChange}
        completedTopics={completedTopics}
        manualTopicChecks={manualTopicChecks}
        toggleTopicCheck={toggleTopicCheck}
        markTopicCompleted={markTopicCompleted}
        displayProgress={displayProgress}
        displayCompletedCount={displayCompletedCount}
        displayTotalCount={displayTotalCount}
        activeContentTab={activeContentTab}
        setActiveContentTab={setActiveContentTab}
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
    );
  }

  return (
    <div className={interPageStyles.container}>
      <TitleBar
        displayProgress={displayProgress}
        isNavigating={isNavigating}
        courseHeading={courseHeading}
        displayCompletedCount={displayCompletedCount}
        displayTotalCount={displayTotalCount}
      />

      <div className={`${interPageStyles.bodyStyles} ${isExpandedView ? interPageStyles.bodyStylesExpanded : ""}`}>
        <TopicViewer
          isExpandedView={isExpandedView}
          toggleExpandedView={toggleExpandedView}
          currentTopic={currentTopic}
          topicDetails={topicDetails}
          orgId={orgId}
          studentCreds={studentCreds}
          markTopicCompleted={markTopicCompleted}
          setTopicDurationOverrides={setTopicDurationOverrides}
          handleNext={handleNext}
          handlePrev={handlePrev}
          activeContentTab={activeContentTab}
          setActiveContentTab={setActiveContentTab}
          currentSection={currentSection}
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
          completedTopics={completedTopics}
          manualTopicChecks={manualTopicChecks}
          toggleTopicCheck={toggleTopicCheck}
        />

        <ContentSidebar
          isExpandedView={isExpandedView}
          openSectionKeys={openSectionKeys}
          handleSectionChange={handleSectionChange}
          selectedInternshipData={selectedInternshipData}
          activeKey={activeKey}
          selectedTopicIndex={selectedTopicIndex}
          getOneTopic={getOneTopic}
          setActiveKey={setActiveKey}
          setOpenSectionKeys={setOpenSectionKeys}
          setSelectedTopicIndex={setSelectedTopicIndex}
          toggleTopicCheck={toggleTopicCheck}
          topicDurationOverrides={topicDurationOverrides}
          completedTopics={completedTopics}
          manualTopicChecks={manualTopicChecks}
          displayProgress={displayProgress}
          displayCompletedCount={displayCompletedCount}
          displayTotalCount={displayTotalCount}
        />
      </div>
    </div>
  );
}
