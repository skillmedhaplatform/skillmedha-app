"use client";
import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { message, Modal } from "antd";
import { 
  saveStudentNotes, 
  getStudentNotes, 
  updateStudentNote, 
  deleteStudentNote 
} from "@/redux/slices/student";

/**
 * Helper to get current video timestamp formatted as MM:SS or HH:MM:SS
 */
const getCurrentVideoTimestamp = () => {
  if (typeof document !== "undefined") {
    const video = document.querySelector("video");
    if (video) {
      const seconds = video.currentTime || 0;
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);
      return h > 0 
        ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` 
        : `${m}:${s.toString().padStart(2, '0')}`;
    }
  }
  return "0:00";
};

/**
 * useNotes
 * Manages per-topic or course-level timestamped notes.
 */
export const useNotes = ({ internshipId }) => {
  const dispatch = useDispatch();

  const [notesList, setNotesList] = useState([]);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteContent, setEditingNoteContent] = useState("");
  
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isLoadingNote, setIsLoadingNote] = useState(false);

  const fetchNote = useCallback(
  async (topicId) => {
    if (!topicId || !internshipId) return;
    setIsLoadingNote(true);
    try {
      const res = await dispatch(
        getStudentNotes({ courseid: internshipId, topicid: topicId })
      ).unwrap();
      if (res?.success && Array.isArray(res.data)) {
        setNotesList(res.data);
      } else {
        setNotesList([]);
      }
    } catch {
      setNotesList([]);
    } finally {
      setIsLoadingNote(false);
    }
  },
  [dispatch, internshipId]
);

  const handleSaveNewNote = useCallback(
    async (currentTopic, currentSection) => {
      const cleaned = newNoteContent.replace(/<[^>]*>?/gm, "").trim();
      if (!newNoteContent || cleaned === "") {
        message.warning("Note description is required.");
        return;
      }
      setIsSavingNote(true);
      try {
        const videoTimestamp = getCurrentVideoTimestamp();

        await dispatch(
          saveStudentNotes({ 
            courseid: internshipId, 
            topicid: currentTopic?._id, 
            topicTitle: currentTopic?.topicName || currentTopic?.title || "Unknown Topic",
            sectionid: currentSection?._id || currentSection?.sectionId || "",
            sectionTitle: currentSection?.sectionName || currentSection?.title || "",
            videoTimestamp,
            notesdescription: newNoteContent 
          })
        ).unwrap();
        
        message.success("Note saved successfully!");
        setNewNoteContent("");
        setIsCreatingNote(false);
        // Refresh notes after saving
        if (currentTopic?._id) {
          await fetchNote(currentTopic._id);
        }
      } catch {
        message.error("Failed to save note");
      } finally {
        setIsSavingNote(false);
      }
    },
    [dispatch, internshipId, newNoteContent, fetchNote]
  );

  const handleUpdateNote = useCallback(
    async (currentTopic) => {
      const cleaned = editingNoteContent.replace(/<[^>]*>?/gm, "").trim();
      if (!editingNoteContent || cleaned === "") {
        message.warning("Note description is required.");
        return;
      }
      setIsSavingNote(true);
      try {
        await dispatch(
          updateStudentNote({ 
            noteId: editingNoteId, 
            notesdescription: editingNoteContent 
          })
        ).unwrap();
        
        message.success("Note updated successfully!");
        setEditingNoteId(null);
        setEditingNoteContent("");
        // Refresh notes after updating
        if (currentTopic?._id) {
          await fetchNote(currentTopic._id);
        }
      } catch {
        message.error("Failed to update note");
      } finally {
        setIsSavingNote(false);
      }
    },
    [dispatch, editingNoteId, editingNoteContent, fetchNote]
  );

  const handleDeleteNote = useCallback(
    (noteId, currentTopic) => {
      Modal.confirm({
        title:      "Delete Note",
        content:    "Are you sure you want to delete this note?",
        okText:     "Delete",
        okType:     "danger",
        cancelText: "Cancel",
        onOk: async () => {
          setIsSavingNote(true);
          try {
            await dispatch(deleteStudentNote(noteId)).unwrap();
            message.success("Note deleted successfully!");
            // Refresh notes after deleting
            if (currentTopic?._id) {
              await fetchNote(currentTopic._id);
            }
          } catch {
            message.error("Failed to delete note");
          } finally {
            setIsSavingNote(false);
          }
        },
      });
    },
    [dispatch, fetchNote]
  );

  return {
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
  };
};
