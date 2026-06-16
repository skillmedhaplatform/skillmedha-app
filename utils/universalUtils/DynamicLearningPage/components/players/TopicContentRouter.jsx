"use client";
import React, { memo } from "react";
import { Empty } from "antd";
import ZoomClient from "@/app/student/(protected)/zoom/client/page";

import NormalVideoPlayer from "./NormalVideoPlayer";
import PdfReader from "./PdfReader";
import QuizComponent from "../quiz/QuizComponent";
import CodingComponent from "../coding/CodingComponent";

import { getTopicType } from "../../utils/topicUtils";
import { getFirstVideoSource, getFirstPdfSource, getSavedVideoProgress } from "../../utils/videoUtils";

/**
 * TopicContentRouter
 * Routes to the correct content type player/viewer for the given topic.
 */
const TopicContentRouter = memo(({
  currentTopic,
  topicDetails,
  orgId,
  studentCreds,
  isExpandedView,
  toggleExpandedView,
  markTopicCompleted,
  setTopicDurationOverrides,
  handleNextTopic,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _currentSection,
}) => {
  if (!currentTopic) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", width: "100%" }}>
        <Empty description="No Content Available" />
      </div>
    );
  }

  // Priority 1: Live Meeting or Recorded Lecture (handled by ZoomClient)
  const meetingId = currentTopic?.meetingId || currentTopic?.meetings?._id;
  if (meetingId) {
    return <ZoomClient meetingId={meetingId} orgId={orgId} currentTopic={currentTopic} />;
  }

  // Priority 2: PDF Resource
  if (currentTopic?.type === "pdf" || (Array.isArray(currentTopic?.pdf) && currentTopic?.pdf?.length > 0)) {
    return (
      <PdfReader
        pdfUrl={getFirstPdfSource(currentTopic)}
        topic={currentTopic}
        onComplete={markTopicCompleted}
      />
    );
  }

  // Priority 3: Other Types
  const currType = getTopicType(currentTopic);

  switch (currType) {
    case "video":
      return (
        <NormalVideoPlayer
          src={getFirstVideoSource(currentTopic)}
          topicId={currentTopic?._id}
          orgId={orgId}
          studentCreds={studentCreds}
          onToggleExpand={toggleExpandedView}
          isExpandedView={isExpandedView}
          initialProgress={
            Math.max(
              getSavedVideoProgress(currentTopic?._id, orgId, studentCreds?._id),
              Number(
                topicDetails?._id === currentTopic?._id
                  ? topicDetails?.progress
                  : currentTopic?.progress
              ) || 0
            )
          }
          onComplete={(meta) => markTopicCompleted(currentTopic, meta)}
          onDurationResolved={(resolvedTopicId, mins) => {
            setTopicDurationOverrides((prev) => {
              if (prev[resolvedTopicId]) return prev;
              return { ...prev, [resolvedTopicId]: mins };
            });
          }}
        />
      );

    case "quiz":
      return (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <QuizComponent
            questions={currentTopic?.quiz}
            handleNextTopic={handleNextTopic}
            onComplete={() => markTopicCompleted(currentTopic, { progress: 100, totalDuration: 100 })}
          />
        </div>
      );

    case "coding":
      return (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CodingComponent
            questions={currentTopic?.coding}
            onRunCode={() => markTopicCompleted(currentTopic, { progress: 100, totalDuration: 100 })}
          />
        </div>
      );

    default:
      return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", width: "100%" }}>
          <Empty description="No Content Available" />
        </div>
      );
  }
});

TopicContentRouter.displayName = "TopicContentRouter";
export default TopicContentRouter;
