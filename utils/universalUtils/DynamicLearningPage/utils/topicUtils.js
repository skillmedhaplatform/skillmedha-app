/**
 * topicUtils.js
 * Pure helper functions for topic/section calculations.
 * No React state — all state-dependent values are passed as params.
 */

import {
  FilePdfOutlined,
  PlayCircleOutlined,
  CodeOutlined,
  QuestionCircleOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";

// ─── Duration Parsing ────────────────────────────────────────────────────────

/**
 * Converts a human-readable duration string to minutes.
 * Handles: "45min", "1h 30m", "1:30:00", bare numbers (assumed minutes).
 */
export const parseDurationToMinutes = (value) => {
  if (!value) return 0;
  const str = String(value).toLowerCase().trim();

  if (/^\d+(\.\d+)?$/.test(str)) return Math.round(Number(str));

  if (/^\d{1,2}:\d{1,2}(:\d{1,2})?$/.test(str)) {
    const parts = str.split(":").map(Number);
    const totalSeconds =
      parts.length === 3
        ? parts[0] * 3600 + parts[1] * 60 + parts[2]
        : parts[0] * 60 + parts[1];
    return Math.max(1, Math.round(totalSeconds / 60));
  }

  const hrMatch  = str.match(/(\d+(?:\.\d+)?)\s*(h|hr|hrs|hour|hours)/);
  const minMatch = str.match(/(\d+(?:\.\d+)?)\s*(m|min|mins|minute|minutes)/);
  const secMatch = str.match(/(\d+(?:\.\d+)?)\s*(s|sec|secs|second|seconds)/);

  const hours = hrMatch  ? Number(hrMatch[1])  : 0;
  const mins  = minMatch ? Number(minMatch[1]) : 0;
  const secs  = secMatch ? Number(secMatch[1]) : 0;
  const parsed = Math.round(hours * 60 + mins + secs / 60);
  if (parsed > 0) return parsed;

  const genericNum = str.match(/(\d+(?:\.\d+)?)/);
  if (genericNum) return Math.round(Number(genericNum[1]));

  return 0;
};

// ─── Topic Type ──────────────────────────────────────────────────────────────

/**
 * Returns the canonical type string for a topic object.
 * Priority: explicit `type` field → array content → title heuristics.
 */
export const getTopicType = (topic) => {
  const explicitType = String(topic?.type || "").toLowerCase().trim();
  if (explicitType) return explicitType;

  if (Array.isArray(topic?.pdf)    && topic.pdf.length    > 0) return "pdf";
  if (Array.isArray(topic?.videos) && topic.videos.length > 0) return "video";
  if (Array.isArray(topic?.quiz)   && topic.quiz.length   > 0) return "quiz";
  if (Array.isArray(topic?.coding) && topic.coding.length > 0) return "coding";

  const title = String(topic?.title || "").toLowerCase();
  if (title.includes("pdf"))                         return "pdf";
  if (title.includes("video"))                       return "video";
  if (title.includes("coding") || title.includes("code")) return "coding";
  if (title.includes("quiz"))                        return "quiz";
  if (title.includes("topic"))                       return "topic";

  return "";
};

// ─── PDF Page Count ──────────────────────────────────────────────────────────

export const getPdfPageCount = (topic) => {
  const firstPdf     = Array.isArray(topic?.pdf) ? topic.pdf[0] : null;
  const pdfListCount = Array.isArray(topic?.pdf) ? topic.pdf.length : 0;

  const candidates = [
    topic?.pageCount,          topic?.pages,              topic?.page,
    topic?.totalPage,          topic?.totalPages,         topic?.pdfPages,
    topic?.pdfPageCount,       topic?.numPages,           topic?.numberOfPage,
    topic?.numberOfPages,      topic?.noOfPage,           topic?.noOfPages,
    topic?.pdfMeta?.pages,     topic?.pdfInfo?.pages,     topic?.metadata?.pages,
    topic?.meta?.pages,
    firstPdf?.pageCount,       firstPdf?.pages,           firstPdf?.page,
    firstPdf?.totalPage,       firstPdf?.totalPages,      firstPdf?.pdfPages,
    firstPdf?.numPages,        firstPdf?.numberOfPage,    firstPdf?.numberOfPages,
    firstPdf?.noOfPage,        firstPdf?.noOfPages,
    firstPdf?.pdfMeta?.pages,  firstPdf?.pdfInfo?.pages,  firstPdf?.metadata?.pages,
  ];

  for (const candidate of candidates) {
    let parsed = Number(candidate);
    if (!Number.isFinite(parsed) && typeof candidate === "string") {
      const numericPart = candidate.match(/(\d+(?:\.\d+)?)/);
      parsed = numericPart ? Number(numericPart[1]) : NaN;
    }
    if (Number.isFinite(parsed) && parsed > 0) return Math.round(parsed);
  }

  // Deep scan for any page-keyed numeric value.
  const deepScan = (input, depth = 0) => {
    if (!input || depth > 4) return 0;
    if (Array.isArray(input)) {
      for (const item of input) {
        const found = deepScan(item, depth + 1);
        if (found > 0) return found;
      }
      return 0;
    }
    if (typeof input !== "object") return 0;
    for (const [key, val] of Object.entries(input)) {
      if (/page/i.test(key)) {
        let parsed = Number(val);
        if (!Number.isFinite(parsed) && typeof val === "string") {
          const numericPart = val.match(/(\d+(?:\.\d+)?)/);
          parsed = numericPart ? Number(numericPart[1]) : NaN;
        }
        if (Number.isFinite(parsed) && parsed > 0) return Math.round(parsed);
      }
    }
    for (const nestedVal of Object.values(input)) {
      const found = deepScan(nestedVal, depth + 1);
      if (found > 0) return found;
    }
    return 0;
  };

  const deepFound = deepScan(topic);
  if (deepFound > 0) return deepFound;
  if (pdfListCount > 1) return pdfListCount;
  return 0;
};

// ─── Topic Duration ──────────────────────────────────────────────────────────

/**
 * Returns the estimated duration for a topic in minutes.
 * @param {object} topic
 * @param {object} topicDurationOverrides - map of topicId → resolved minutes
 */
export const getTopicDurationMinutes = (topic, topicDurationOverrides = {}) => {
  const topicId = topic?._id;
  const overrideMins = topicId ? (topicDurationOverrides[topicId] ?? 0) : 0;
  if (overrideMins > 0) return overrideMins;

  const topicType = getTopicType(topic);
  if (topicType !== "video") return 0;

  const firstVideo = Array.isArray(topic?.videos) ? topic.videos[0] : null;

  const durationCandidates = [
    topic?.videoDuration, firstVideo?.videoDuration, firstVideo?.duration,
    topic?.duration, topic?.estimatedDuration,
  ];
  
  for (const raw of durationCandidates) {
    if (raw == null || raw === "") continue;
    const m = parseDurationToMinutes(raw);
    if (m > 0) return m;
  }
  
  const secondsCandidates = [
    topic?.videoDurationInSeconds, firstVideo?.videoDurationInSeconds,
    firstVideo?.durationInSeconds, firstVideo?.lengthInSeconds,
    topic?.durationInSeconds, topic?.recordedDurationInSeconds,
  ];
  
  for (const rawSec of secondsCandidates) {
    const s = Number(rawSec);
    if (Number.isFinite(s) && s > 0) return Math.max(1, Math.round(s / 60));
  }
  
  return 0;
};

/**
 * Returns a formatted duration label like "45min".
 */
export const getTopicDurationLabel = (topic, topicDurationOverrides = {}) => {
  const mins = getTopicDurationMinutes(topic, topicDurationOverrides);
  return mins ? `${mins}min` : "";
};

// ─── Live Meeting ─────────────────────────────────────────────────────────────

export const isLiveMeetingTopic = (topic) =>
  Boolean(topic?.meetings?._id && !topic?.meetings?.recordedUrl);

// ─── Completion Checks ────────────────────────────────────────────────────────

/**
 * Returns whether a video topic is completed.
 * @param {object} topic
 * @param {object} completedTopics - map of topicId → true
 */
export const isVideoTopicCompleted = (topic, completedTopics = {}) => {
  const topicId = topic?._id;
  if (topicId && completedTopics[topicId]) return true;

  const progress      = Number(topic?.progress || 0);
  const totalDuration = Number(topic?.totalDuration || topic?.durationInSeconds || 0);
  if (totalDuration > 0 && progress > 0) return progress / totalDuration >= 0.9;
  if (progress >= 90 && totalDuration === 0) return true;
  return false;
};

/**
 * Returns whether a topic is auto-completed (server progress or local state).
 */
export const isTopicAutoCompleted = (topic, completedTopics = {}) => {
  const topicId = topic?._id;
  if (!topicId)                         return false;
  if (isLiveMeetingTopic(topic))        return false;
  if (completedTopics[topicId])         return true;

  const topicType = topic?.type;
  if (topicType === "video") return isVideoTopicCompleted(topic, completedTopics);
  if (topicType === "pdf" || topicType === "quiz") {
    return Number(topic?.progress) >= 100 || Boolean(topic?.isCompleted || topic?.completed);
  }
  return Number(topic?.progress) >= 100 || Boolean(topic?.isCompleted || topic?.completed);
};

/**
 * Returns the effective completion status, respecting manual overrides.
 */
export const isTopicCompleted = (topic, completedTopics = {}, manualTopicChecks = {}) => {
  const topicId = topic?._id;
  if (!topicId) return false;
  if (Object.prototype.hasOwnProperty.call(manualTopicChecks, topicId)) {
    return Boolean(manualTopicChecks[topicId]);
  }
  return isTopicAutoCompleted(topic, completedTopics);
};

// ─── Section Summary ──────────────────────────────────────────────────────────

/**
 * Returns { progressText, durationText } for a sidebar section header.
 */
export const getSectionSummary = (section, completedTopics = {}, manualTopicChecks = {}, topicDurationOverrides = {}) => {
  const topics = section?.topics || [];
  const total  = topics.length;
  const completed = topics.reduce(
    (count, topic) => count + (isTopicCompleted(topic, completedTopics, manualTopicChecks) ? 1 : 0),
    0
  );
  const totalMins = topics.reduce(
    (sum, topic) => sum + getTopicDurationMinutes(topic, topicDurationOverrides),
    0
  );
  return {
    progressText: `${completed} / ${total}`,
    durationText: totalMins > 0 ? `${totalMins}min` : "",
  };
};

// ─── Type Icons ───────────────────────────────────────────────────────────────

/**
 * Returns the Ant Design icon element for a topic type.
 */
export const getTopicTypeDurationIcon = (topic) => {
  if (isLiveMeetingTopic(topic)) return <VideoCameraOutlined />;
  switch (getTopicType(topic)) {
    case "pdf":    return <FilePdfOutlined />;
    case "video":  return <PlayCircleOutlined />;
    case "coding": return <CodeOutlined />;
    case "quiz":   return <QuestionCircleOutlined />;
    default:       return <VideoCameraOutlined />;
  }
};
