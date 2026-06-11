"use client";
import React, { memo, useRef, useEffect } from "react";
import { Button } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import TextEditor from "@/universalUtils/editor";
import interPageStyles from "../page.module.scss";

/**
 * Helper: format seconds → M:SS or H:MM:SS
 */
const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return h > 0
    ? `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
    : `${m}:${s.toString().padStart(2, "0")}`;
};

/**
 * NoteEditor
 * Displays a list of timestamped notes and allows creating/editing them.
 */
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
  // DOM ref — updates timestamp text without triggering React re-renders
  const timestampRef = useRef(null);
  // Capture the exact video time when user opens the editor
  const capturedTimeRef = useRef("0:00");
  const editorTimeLabelRef = useRef(null);

  useEffect(() => {
    if (isCreatingNote) return;
    const interval = setInterval(() => {
      if (!timestampRef.current) return;
      const video = typeof document !== "undefined" ? document.querySelector("video") : null;
      const time = video ? formatTime(video.currentTime || 0) : "0:00";
      timestampRef.current.textContent = `Edit your note at ${time}`;
    }, 1000);
    return () => clearInterval(interval);
  }, [isCreatingNote]);

  const sectionName = currentSection?.sectionName || currentSection?.title || "";
  const topicName = currentTopic?.topicName || currentTopic?.title || "";

  return (
    <div className={interPageStyles.notesWrapper}>

      {/* Top Input Bar — triggers note creation */}
      {!isCreatingNote ? (
        <div
          onClick={() => {
            const video = typeof document !== "undefined" ? document.querySelector("video") : null;
            capturedTimeRef.current = video ? formatTime(video.currentTime || 0) : "0:00";
            if (editorTimeLabelRef.current) {
              editorTimeLabelRef.current.textContent = `Create New Note at ${capturedTimeRef.current}`;
            }
            setIsCreatingNote(true);
          }}
          className={interPageStyles.notesTriggerBar}
        >
          <span ref={timestampRef}>Edit your note at 0:00</span>
          <EditOutlined />
        </div>
      ) : (
        <div className={`${interPageStyles.notesEditWrapper} ${interPageStyles.notesEditWrapperSpaced}`}>
          <div className={interPageStyles.notesCreateHeader}>
            <span ref={editorTimeLabelRef}>Create New Note at 0:00</span>
          </div>
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
          <div className={interPageStyles.notesActions}>
            <Button
              type="text"
              onClick={() => { setIsCreatingNote(false); setNewNoteContent(""); }}
              disabled={isSavingNote || isLoadingNote}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={() => handleSaveNewNote(currentTopic, currentSection)}
              loading={isSavingNote}
            >
              Save note
            </Button>
          </div>
        </div>
      )}

      {/* Notes List */}
      <div className={interPageStyles.notesList}>
        {notesList?.map((note) => (
          <div key={note._id}>
            <div className={interPageStyles.notesHeader}>
              <div className={interPageStyles.notesHeaderTitle}>
                <span className={interPageStyles.noteTimestampPill}>
                  {note.videoTimestamp || "0:00"}
                </span>
                <strong>{note.sectionTitle || sectionName}</strong>
                <span className={interPageStyles.notesHeaderTopicName}>
                  {note.topicTitle || topicName}
                </span>
              </div>
              <div className={interPageStyles.notesHeaderIcons}>
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setEditingNoteId(note._id);
                    setEditingNoteContent(note.notesdescription);
                    setIsCreatingNote(false);
                  }}
                />
                <Button
                  type="text"
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
                  <Button
                    type="text"
                    onClick={() => setEditingNoteId(null)}
                    disabled={isSavingNote}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => handleUpdateNote(currentTopic)}
                    loading={isSavingNote}
                  >
                    Save note
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
        ))}

        {notesList?.length === 0 && !isLoadingNote && (
          <div className={interPageStyles.notesEmpty}>
            No notes yet for this topic. Click above to capture an idea!
          </div>
        )}
      </div>

    </div>
  );
});

NoteEditor.displayName = "NoteEditor";
export default NoteEditor;
