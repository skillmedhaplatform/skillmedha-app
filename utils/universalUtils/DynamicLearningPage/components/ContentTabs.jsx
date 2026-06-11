"use client";
import React, { memo } from "react";
import { Tabs } from "antd";
import NoteEditor from "./NoteEditor";
import ResourceList from "./ResourceList";
import interPageStyles from "../page.module.scss";

/**
 * ContentTabs
 * Displays the Overview, Notes, Resources, and Source Code tabs underneath the viewer.
 */
const ContentTabs = memo(({
  activeContentTab,
  setActiveContentTab,
  currentSection,
  currentTopic,
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
  const tabsItems = [
    {
      key: "overview",
      label: "Overview",
      children: (
        <div className={interPageStyles.tabPaneContent}>
          <h2 className={interPageStyles.tabTitle}>About this topic</h2>
          <div
            className={interPageStyles.aboutContent}
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
        <div className={interPageStyles.tabPaneContent}>
          <div className={interPageStyles.notesContainer}>
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
        </div>
      ),
    },
    {
      key: "resources",
      label: "Resources",
      children: (
        <div className={interPageStyles.tabPaneContent}>
          <h2 className={interPageStyles.tabTitle}>Resources</h2>
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
        <div className={interPageStyles.tabPaneContent}>
          <h2 className={interPageStyles.tabTitle}>Source Code</h2>
          <ResourceList items={currentTopic?.sourceCode} title="Source Code" iconType="code" />
        </div>
      ),
    });
  }

  return (
    <div className={interPageStyles.mainTabsContainer}>
      <Tabs
        activeKey={activeContentTab}
        onChange={setActiveContentTab}
        className={interPageStyles.learningTabs}
        items={tabsItems}
      />
    </div>
  );
});

ContentTabs.displayName = "ContentTabs";
export default ContentTabs;
