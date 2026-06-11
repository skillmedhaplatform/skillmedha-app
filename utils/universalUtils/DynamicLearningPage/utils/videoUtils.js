/**
 * videoUtils.js
 * Pure helpers for resolving video/PDF source URLs and saved progress.
 * No React state — all required values are passed as params.
 */

// ─── Video / PDF Source Resolution ───────────────────────────────────────────

const fromRecord = (record) => {
  if (!record) return "";
  if (typeof record === "string") return record;
  return record?.url || record?.videoUrl || record?.pdfUrl || record?.src || record?.link || record?.file || record?.path || "";
};

/**
 * Returns the best available video URL from a topic object.
 */
export const getFirstVideoSource = (topic) => {
  const videosCollection = Array.isArray(topic?.videos)
    ? topic.videos
    : Array.isArray(topic?.video)
      ? topic.video
      : [];

  const firstVideo = videosCollection.length ? videosCollection[0] : topic?.videos || topic?.video;

  return (
    fromRecord(firstVideo) ||
    fromRecord(topic?.video) ||
    topic?.videoUrl ||
    topic?.url ||
    ""
  );
};

/**
 * Returns the best available PDF URL from a topic object.
 */
export const getFirstPdfSource = (topic) => {
  const firstPdf = Array.isArray(topic?.pdf) ? topic.pdf[0] : topic?.pdf;
  return fromRecord(firstPdf) || topic?.pdfUrl || topic?.url || "";
};

// ─── localStorage Progress ────────────────────────────────────────────────────

/**
 * Returns saved video progress (in seconds) from localStorage.
 * @param {string} topicId
 * @param {string} orgId
 * @param {string} userId
 */
export const getSavedVideoProgress = (topicId, orgId, userId) => {
  if (!topicId || typeof window === "undefined") return 0;
  try {
    const key = `dynamic-learning-video-progress:${orgId}:${userId}:${topicId}`;
    const raw = window.localStorage.getItem(key);
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  } catch {
    return 0;
  }
};
