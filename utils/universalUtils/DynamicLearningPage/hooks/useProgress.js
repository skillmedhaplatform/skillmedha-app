"use client";
import { useState, useEffect, useCallback, useRef, useOptimistic } from "react";
import { useDispatch } from "react-redux";
import { updateVideoProgress, updateTotalProgress } from "@/redux/slices/internship";
import { isTopicAutoCompleted } from "../utils/topicUtils";

/**
 * useProgress
 * Manages topic completion state, optimistic progress circle, and backend sync.
 */
export const useProgress = ({
  serverCompletedTopicIds,
  serverTotalProgress,
  serverCompletedCount,
  serverTotalCount,
  selectedInternshipData,
  studentCreds,
  internshipId,
  orgId,
  moduleType,
}) => {
  const dispatch = useDispatch();

  const [completedTopics,    setCompletedTopics]    = useState({});
  const [manualTopicChecks,  setManualTopicChecks]  = useState({});

  const progressSyncedTopics = useRef({});

  // ── Optimistic progress ────────────────────────────────────────────────────
  const [optimisticProgress, addOptimisticProgress] = useOptimistic(
    serverTotalProgress,
    (_current, newPct) => newPct
  );
  const [optimisticCompletedCount, addOptimisticCompletedCount] = useOptimistic(
    serverCompletedCount,
    (_current, newCount) => newCount
  );

  // ── Seed from server on load ───────────────────────────────────────────────
  useEffect(() => {
    if (!serverCompletedTopicIds?.length) return;
    const map = {};
    serverCompletedTopicIds.forEach((id) => { map[id] = true; });
    setCompletedTopics((prev) => ({ ...map, ...prev }));
  }, [serverCompletedTopicIds]);

  // ── Derived counts ─────────────────────────────────────────────────────────
  const allTopicsFlat = (selectedInternshipData?.sections || []).flatMap(
    (sec) => sec?.topics || []
  );
  const totalTopics = allTopicsFlat.length;

  const completedTopicsCount = (selectedInternshipData?.sections || []).reduce(
    (count, section) =>
      count +
      (section?.topics || []).reduce((sc, topic) => {
        const tid = topic?._id;
        if (!tid) return sc;
        const manual = Object.prototype.hasOwnProperty.call(manualTopicChecks, tid);
        const done = manual
          ? manualTopicChecks[tid]
          : (completedTopics[tid] || isTopicAutoCompleted(topic, completedTopics));
        return sc + (done ? 1 : 0);
      }, 0),
    0
  );

  const localProgressPercentage =
    totalTopics > 0 ? Math.round((completedTopicsCount / totalTopics) * 100) : serverTotalProgress;

  const displayProgress       = Math.max(optimisticProgress, localProgressPercentage);
  const displayCompletedCount = Math.max(optimisticCompletedCount, completedTopicsCount);
  const displayTotalCount     = serverTotalCount || totalTopics || 0;

  // ── markTopicCompleted ─────────────────────────────────────────────────────
  const markTopicCompleted = useCallback(
    (topic, completionMeta = {}) => {
      const topicId = topic?._id;
      if (!topicId) return;

      setManualTopicChecks((prev) => {
        if (!Object.prototype.hasOwnProperty.call(prev, topicId)) return prev;
        const next = { ...prev };
        delete next[topicId];
        return next;
      });

      setCompletedTopics((prev) => {
        if (prev[topicId]) return prev;
        const next = { ...prev, [topicId]: true };

        if (studentCreds?._id && internshipId && !progressSyncedTopics.current[topicId]) {
          progressSyncedTopics.current[topicId] = true;

          const total = allTopicsFlat.length;
          const completedCount = allTopicsFlat.filter(
            (t) => t?._id && (next[t._id] || isTopicAutoCompleted(t, next))
          ).length;
          const newPct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

          import("react").then(({ startTransition }) => {
            startTransition(() => {
              addOptimisticProgress(newPct);
              addOptimisticCompletedCount(completedCount);
            });
          });

          dispatch(updateTotalProgress({ userId: studentCreds._id, itemId: internshipId, itemType: moduleType, completedCount, totalCount: total }));
        }

        return next;
      });

      if (!studentCreds?._id) return;
      dispatch(updateVideoProgress({
        userId: studentCreds._id, meetingId: topicId, topicId,
        progress: completionMeta.progress ?? 100,
        totalDuration: completionMeta.totalDuration ?? 100,
        orgId,
      }));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch, orgId, studentCreds?._id, internshipId, moduleType, selectedInternshipData]
  );

  // ── toggleTopicCheck ───────────────────────────────────────────────────────
  const toggleTopicCheck = useCallback(
    (topic) => {
      const topicId = topic?._id;
      if (!topicId) return;

      const currentValue = (() => {
        if (Object.prototype.hasOwnProperty.call(manualTopicChecks, topicId)) {
          return Boolean(manualTopicChecks[topicId]);
        }
        return isTopicAutoCompleted(topic, completedTopics);
      })();

      const newValue = !currentValue;

      setManualTopicChecks((prev) => ({ ...prev, [topicId]: newValue }));
      setCompletedTopics((prev) => {
        const next = { ...prev };
        if (newValue) next[topicId] = true;
        else delete next[topicId];
        return next;
      });

      if (!studentCreds?._id || !internshipId) return;

      const total = allTopicsFlat.length;
      const completedCount = allTopicsFlat.filter((t) => {
        if (t?._id === topicId) return newValue;
        if (Object.prototype.hasOwnProperty.call(manualTopicChecks, t._id)) return manualTopicChecks[t._id];
        if (completedTopics[t._id]) return true;
        return isTopicAutoCompleted(t, completedTopics);
      }).length;

      const newPct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

      import("react").then(({ startTransition }) => {
        startTransition(() => {
          addOptimisticProgress(newPct);
          addOptimisticCompletedCount(completedCount);
        });
      });

      dispatch(updateTotalProgress({ userId: studentCreds._id, itemId: internshipId, itemType: moduleType, completedCount, totalCount: total }));
      dispatch(updateVideoProgress({
        userId: studentCreds._id, meetingId: topicId, topicId,
        progress: newValue ? 100 : 0, totalDuration: 100, orgId,
      }));
    },
    [dispatch, orgId, studentCreds?._id, internshipId, moduleType, allTopicsFlat, completedTopics, manualTopicChecks, addOptimisticProgress, addOptimisticCompletedCount]
  );

  return {
    completedTopics,
    manualTopicChecks,
    completedTopicsCount,
    markTopicCompleted,
    toggleTopicCheck,
    displayProgress,
    displayCompletedCount,
    displayTotalCount,
  };
};
