"use client";
import QuestionEditorUI from "@/app/admin/(protected)/practice/Practice_utils/questionform";
import { fetchQuestions } from "@/redux/slices/admin/cms/practiceSlice";
import { useParams } from "next/navigation";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { usePermissions, PERMISSION_VALUES } from "@/hooks/usepermission";
import styles from "@/app/admin/(protected)/practice/practiceStyles.module.scss";

export default function QuestionPage() {
  const dispatch = useDispatch();
  const params = useParams();
  const {
    subject_slug = "",
    topic_slug = "",
    subtopic_slug = "",
  } = params || {};
  const { canAccess, getPermissionMessage } = usePermissions();

  const canEditOrCreate =
    canAccess(PERMISSION_VALUES.EDIT) || canAccess(PERMISSION_VALUES.CREATE);
  useEffect(() => {
    if (!topic_slug || !subject_slug || !subtopic_slug) {
      console.warn("Missing required URL parameters");
      return;
    }

    let isCancelled = false;

    const fetchData = async () => {
      try {
        const promises = [
          // dispatch(fetchSubtopicsByTopic(topic_slug)).unwrap(),
          // dispatch(fetchTopicsBySubject(subject_slug)).unwrap(),
          // dispatch(fetchSubjectsByType("technical")).unwrap(),
          dispatch(fetchQuestions({ subtopicId: subtopic_slug })).unwrap(),
        ];

        await Promise.all(promises);
      } catch (error) {
        if (!isCancelled) {
          console.error("Failed to fetch data:", error);
        }
      }
    };

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [dispatch, topic_slug, subject_slug, subtopic_slug]);
  if (!canEditOrCreate) {
    return (
      <div className={styles.container} style={{ padding: 24 }}>
        <h3>{getPermissionMessage(PERMISSION_VALUES.EDIT)}</h3>
      </div>
    );
  }

  return <QuestionEditorUI />;
}
