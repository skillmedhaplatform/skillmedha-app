"use client";
import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { useDispatch } from "react-redux";
import { Button } from "antd";
import { PauseCircleOutlined } from "@ant-design/icons";
import _ from "lodash";
import { updateVideoProgress } from "@/redux/slices/internship";
import interPageStyles from "../../page.module.scss";

/**
 * NormalVideoPlayer
 * Rendered at module scope to prevent unmount on parent render.
 */
const NormalVideoPlayer = memo(({
  src,
  topicId,
  orgId,
  studentCreds,
  initialProgress,
  onComplete,
  onDurationResolved,
  onToggleExpand,
  isExpandedView,
}) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const dispatch = useDispatch();

  const hasMarkedCompleted = useRef(false);
  const hasAppliedInitialProgress = useRef(false);
  const wasPlayingBeforeHidden = useRef(false);
  const hasStartedPlayback = useRef(false);
  const [showPauseOverlay, setShowPauseOverlay] = useState(false);

  const progressStorageKey = React.useMemo(() => {
    if (!topicId || !studentCreds?._id) return null;
    return `dynamic-learning-video-progress:${orgId}:${studentCreds._id}:${topicId}`;
  }, [orgId, studentCreds, topicId]);

  const persistCurrentProgress = useCallback(() => {
    if (!progressStorageKey || !videoRef.current) return;
    try {
      window.localStorage.setItem(progressStorageKey, String(videoRef.current.currentTime || 0));
    } catch (error) {
      // Ignore storage failures
    }
  }, [progressStorageKey]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateProgressDebounced = useCallback(
    _.debounce((currentTime) => {
      if (topicId && studentCreds?._id && videoRef.current) {
        dispatch(
          updateVideoProgress({
            userId: studentCreds._id,
            meetingId: topicId,
            topicId: topicId,
            progress: currentTime,
            totalDuration: videoRef.current.duration,
            orgId,
          })
        );
      }
    }, 5000),
    [topicId, studentCreds, orgId, dispatch]
  );

  useEffect(() => {
    return () => updateProgressDebounced.cancel();
  }, [updateProgressDebounced]);

  useEffect(() => {
    hasAppliedInitialProgress.current = false;
    hasMarkedCompleted.current = false;
    wasPlayingBeforeHidden.current = false;
    hasStartedPlayback.current = false;
    setShowPauseOverlay(false);
  }, [topicId, src]);

  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    video.controls = false;

    const handleEnter = () => { if (videoRef.current) videoRef.current.controls = true; };
    const handleLeave = () => { if (videoRef.current) videoRef.current.controls = false; };

    container.addEventListener("mouseenter", handleEnter);
    container.addEventListener("mouseleave", handleLeave);

    return () => {
      container.removeEventListener("mouseenter", handleEnter);
      container.removeEventListener("mouseleave", handleLeave);
    };
  }, [topicId, src]);

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video || hasAppliedInitialProgress.current) return;

    const durationMins = Math.max(1, Math.round(Number(video.duration || 0) / 60));
    if (durationMins > 0 && typeof onDurationResolved === "function" && topicId) {
      onDurationResolved(topicId, durationMins);
    }

    const progressSeconds = Number(initialProgress || 0);
    if (progressSeconds > 0 && Number.isFinite(progressSeconds)) {
      video.currentTime = Math.min(progressSeconds, Math.max(0, (video.duration || progressSeconds) - 1));
      video.play().catch(() => { });
    }
    hasAppliedInitialProgress.current = true;
  };

  const handleVideoTimeUpdate = (e) => {
    const currentTime = e.target.currentTime;
    const duration = e.target.duration || 0;
    persistCurrentProgress();
    updateProgressDebounced(currentTime);

    if (!hasMarkedCompleted.current && duration > 0 && currentTime / duration >= 0.9) {
      hasMarkedCompleted.current = true;
      if (typeof onComplete === "function") {
        onComplete({ progress: 100, totalDuration: duration });
      }
    }
  };

  const handlePlay = () => {
    hasStartedPlayback.current = true;
    setShowPauseOverlay(false);
  };

  const handlePause = () => {
    const video = videoRef.current;
    if (!video || video.ended) {
      setShowPauseOverlay(false);
      return;
    }
    if (hasStartedPlayback.current && Number(video.currentTime || 0) > 0) {
      setShowPauseOverlay(true);
    }
  };

  const handleEnded = () => {
    setShowPauseOverlay(false);
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      const video = videoRef.current;
      if (!video) return;

      if (document.visibilityState === "hidden") {
        wasPlayingBeforeHidden.current = !video.paused && !video.ended;
        persistCurrentProgress();
        return;
      }

      if (document.visibilityState === "visible") {
        const savedProgress = progressStorageKey
          ? Number(window.localStorage.getItem(progressStorageKey) || 0)
          : 0;

        if (Number.isFinite(savedProgress) && savedProgress > 0 && Math.abs(video.currentTime - savedProgress) > 1) {
          video.currentTime = savedProgress;
        }

        if (wasPlayingBeforeHidden.current) {
          video.play().catch(() => { });
        }
      }
    };

    const handlePageHide = () => {
      persistCurrentProgress();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [persistCurrentProgress, progressStorageKey]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fff",
        paddingLeft: "2rem",
        paddingRight: "2rem",
        paddingTop: 0,
        paddingBottom: 0,
        boxSizing: "border-box",
      }}
    >
      <video
        ref={videoRef}
        className={interPageStyles.courseDisplayVideo}
        src={src}
        controls={false}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleVideoTimeUpdate}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          borderRadius: "0",
          background: "#fff",
        }}
      />
      {showPauseOverlay ? (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <PauseCircleOutlined
            style={{
              fontSize: "68px",
              color: "rgba(255,255,255,0.92)",
              textShadow: "0 6px 18px rgba(0,0,0,0.45)",
            }}
          />
        </div>
      ) : null}

      <Button
        className={interPageStyles.videoInlineExpandButton}
        type="text"
        onClick={onToggleExpand}
        aria-label={isExpandedView ? "Exit expanded view" : "Expand view"}
      >
        <span>{isExpandedView ? "⤡" : "⤢"}</span>
      </Button>
    </div>
  );
});

NormalVideoPlayer.displayName = "NormalVideoPlayer";
export default NormalVideoPlayer;
