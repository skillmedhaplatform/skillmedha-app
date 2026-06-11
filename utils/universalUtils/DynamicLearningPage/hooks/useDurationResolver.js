"use client";
import { useState, useEffect } from "react";
import { getTopicType } from "../utils/topicUtils";
import { getFirstVideoSource, getFirstPdfSource } from "../utils/videoUtils";

/**
 * useDurationResolver
 * Probes video metadata and PDF page-counts for topics that lack duration data.
 * Populates `topicDurationOverrides` which is passed to getTopicDurationMinutes.
 */
export const useDurationResolver = ({ selectedInternshipData }) => {
  const [topicDurationOverrides, setTopicDurationOverrides] = useState({});

  useEffect(() => {
    if (!selectedInternshipData?.sections?.length) return;

    let isCancelled = false;

    const getVideoMinsFromMetadata = (videoUrl) =>
      new Promise((resolve) => {
        if (!videoUrl) return resolve(0);
        const video  = document.createElement("video");
        video.preload = "metadata";
        video.src     = videoUrl;
        const cleanup = () => { video.removeAttribute("src"); video.load(); };
        video.onloadedmetadata = () => {
          const secs = Number(video.duration || 0);
          cleanup();
          resolve(Number.isFinite(secs) && secs > 0 ? Math.max(1, Math.round(secs / 60)) : 0);
        };
        video.onerror = () => { cleanup(); resolve(0); };
      });

    const getPdfPagesFromFile = async (pdfUrl) => {
      try {
        if (!pdfUrl) return 0;
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf");
        if (pdfjs?.GlobalWorkerOptions && !pdfjs.GlobalWorkerOptions.workerSrc) {
          pdfjs.GlobalWorkerOptions.workerSrc = "/zoom/lib/pdf.worker.js";
        }
        const pdf = await pdfjs.getDocument({ url: pdfUrl }).promise;
        return Number(pdf?.numPages || 0);
      } catch {
        return 0;
      }
    };

    const run = async () => {
      const topics = (selectedInternshipData.sections || []).flatMap((s) => s?.topics || []);
      const pending = topics.filter((t) => {
        if (!t?._id) return false;
        if (topicDurationOverrides[t._id]) return false;
        // Only probe if no duration is resolvable from metadata
        const topicType = getTopicType(t);
        return (topicType === "video" || topicType === "pdf");
      });

      if (!pending.length) return;

      const updates = {};
      for (const topic of pending) {
        const type = getTopicType(topic);
        let mins = 0;
        if (type === "video") mins = await getVideoMinsFromMetadata(getFirstVideoSource(topic));
        if (type === "pdf") {
          const pages = await getPdfPagesFromFile(getFirstPdfSource(topic));
          if (pages > 0) mins = pages;
        }
        if (mins > 0 && topic._id) updates[topic._id] = mins;
      }

      if (!isCancelled && Object.keys(updates).length > 0) {
        setTopicDurationOverrides((prev) => ({ ...prev, ...updates }));
      }
    };

    run();
    return () => { isCancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedInternshipData]);

  return { topicDurationOverrides, setTopicDurationOverrides };
};
