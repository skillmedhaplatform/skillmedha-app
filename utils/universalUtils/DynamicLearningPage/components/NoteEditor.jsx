"use client";
import React, { memo, useRef, useEffect, useState, useCallback } from "react";
import { Button, Modal } from "antd";
import { EditOutlined, DeleteOutlined, ClockCircleOutlined, PlusOutlined, FileTextOutlined } from "@ant-design/icons";
import TextEditor from "@/universalUtils/editor";
import interPageStyles from "../page.module.scss";

const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return h > 0
    ? `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
    : `${m}:${s.toString().padStart(2, "0")}`;
};

const getVideoTime = () => {
  const video = typeof document !== "undefined" ? document.querySelector("video") : null;
  return video ? formatTime(video.currentTime || 0) : "0:00";
};

const NoteEditor = memo(({
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
  const [liveTime, setLiveTime] = useState("0:00");
  const [composerTime, setComposerTime] = useState("0:00");

  useEffect(() => {
    if (isCreatingNote) return;
    const interval = setInterval(() => setLiveTime(getVideoTime()), 1000);
    return () => clearInterval(interval);
  }, [isCreatingNote]);

  const sectionName = currentSection?.sectionName || currentSection?.title || "";
  const topicName = currentTopic?.topicName || currentTopic?.title || "";

  const openComposer = useCallback(() => {
    setComposerTime(getVideoTime());
    setIsCreatingNote(true);
  }, [setIsCreatingNote]);

  const closeComposer = useCallback(() => {
    setIsCreatingNote(false);
    setNewNoteContent("");
  }, [setIsCreatingNote, setNewNoteContent]);

  const startEditing = useCallback((note) => {
    setEditingNoteId(note._id);
    setEditingNoteContent(note.notesdescription);
    setIsCreatingNote(false);
  }, [setEditingNoteId, setEditingNoteContent, setIsCreatingNote]);

  return (
    <div className={interPageStyles.notesWrapper}>

      {/* Trigger bar */}
      <div onClick={openComposer} className={interPageStyles.noteComposerTrigger}>
        <span className={interPageStyles.noteComposerTriggerLabel}>
          <ClockCircleOutlined />
          Add a note at <strong>{liveTime}</strong>
        </span>
        <Button type="primary" size="small" icon={<PlusOutlined />}>
          New note
        </Button>
      </div>

      {/* Create Note Modal */}
      <Modal
        open={isCreatingNote}
        onCancel={closeComposer}
        title={
          <span className={interPageStyles.noteModalTitle}>
            <ClockCircleOutlined /> New note at {composerTime}
          </span>
        }
        footer={[
          <Button key="cancel" onClick={closeComposer} disabled={isSavingNote}>
            Cancel
          </Button>,
          <Button
            key="save"
            type="primary"
            onClick={() => handleSaveNewNote(currentTopic, currentSection)}
            loading={isSavingNote}
          >
            Add note
          </Button>,
        ]}
        destroyOnClose
        width={560}
        centered
      >
        <div className={interPageStyles.notesEditorContainer}>
          <TextEditor
            name="newNotesdescription"
            initialContent={{ newNotesdescription: newNoteContent }}
            editorFun={(e) => {
              try {
                const parsed = JSON.parse(e);
                if (typeof parsed === "string") setNewNoteContent(parsed);
              } catch {
                setNewNoteContent(e);
              }
            }}
          />
        </div>
      </Modal>

      {/* Notes List */}
      <div className={interPageStyles.notesList}>
        {isLoadingNote ? (
          <div className={interPageStyles.notesEmptyState}>Loading notes…</div>
        ) : notesList?.length === 0 ? (
          <div className={interPageStyles.notesEmptyState}>
            <FileTextOutlined style={{ fontSize: 22 }} />
            <span>No notes yet for this topic. Click above to capture an idea!</span>
          </div>
        ) : (
          notesList?.map((note) => (
            <div key={note._id} className={interPageStyles.noteCard}>
              <div className={interPageStyles.notesHeader}>
                <div className={interPageStyles.notesHeaderTitle}>
                  <span className={interPageStyles.noteTimestampPill}>
                    <ClockCircleOutlined style={{ fontSize: 12 }} /> {note.videoTimestamp || "0:00"}
                  </span>
                  <strong>{note.sectionTitle || sectionName}</strong>
                  <span className={interPageStyles.notesHeaderTopicName}>
                    {note.topicTitle || topicName}
                  </span>
                </div>
                <div className={interPageStyles.notesHeaderIcons}>
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => startEditing(note)}
                  />
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteNote(note._id, currentTopic)}
                  />
                </div>
              </div>

              {editingNoteId === note._id ? (
                <div className={interPageStyles.notesEditWrapper}>
                  <div className={interPageStyles.notesEditorContainer}>
                    <TextEditor
                      name={`editNote_${note._id}`}
                      initialContent={{ [`editNote_${note._id}`]: editingNoteContent }}
                      editorFun={(e) => {
                        try {
                          const parsed = JSON.parse(e);
                          if (typeof parsed === "string") setEditingNoteContent(parsed);
                        } catch {
                          setEditingNoteContent(e);
                        }
                      }}
                    />
                  </div>
                  <div className={interPageStyles.notesActions}>
                    <Button type="text" onClick={() => setEditingNoteId(null)} disabled={isSavingNote}>
                      Cancel
                    </Button>
                    <Button
                      type="primary"
                      onClick={() => handleUpdateNote(currentTopic)}
                      loading={isSavingNote}
                    >
                      Update note
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className={interPageStyles.notesDisplayMode}
                  dangerouslySetInnerHTML={{ __html: note.notesdescription }}
                />
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
});

NoteEditor.displayName = "NoteEditor";
export default NoteEditor;