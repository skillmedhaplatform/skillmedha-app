"use client";
import React, { useState, useEffect, useRef, memo } from "react";

/**
 * PdfReader
 * Extracted into a stable component to prevent iframe remounts.
 */
const PdfReader = memo(({ pdfUrl, topic, onComplete }) => {
  const containerRef = useRef(null);
  const [frameLoaded, setFrameLoaded] = useState(false);
  const [isMarked, setIsMarked] = useState(false);
  const [viewerUrl, setViewerUrl] = useState("");

  useEffect(() => {
    setFrameLoaded(false);
    if (!pdfUrl) {
      setViewerUrl("");
      return;
    }
    setViewerUrl(`https://docs.google.com/gview?url=${encodeURIComponent(pdfUrl)}&embedded=true`);
  }, [pdfUrl]);

  const handleScroll = () => {
    if (!containerRef.current || isMarked) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    if (scrollHeight - (scrollTop + clientHeight) <= 8) {
      setIsMarked(true);
      if (typeof onComplete === "function") {
        onComplete(topic, { progress: 100, totalDuration: 100 });
      }
    }
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: "#fff",
        paddingLeft: "1rem",
        paddingRight: "1rem",
        paddingTop: 0,
        paddingBottom: 0,
        boxSizing: "border-box",
      }}
    >
      {!frameLoaded ? (
        <div style={{ padding: "0.75rem", color: "#5f6a87" }}>Loading PDF...</div>
      ) : null}
      {viewerUrl ? (
        <iframe
          src={viewerUrl}
          style={{
            width: "100%",
            height: "100%",
            flex: 1,
            border: "none",
          }}
          title="PDF Viewer"
          onLoad={() => setFrameLoaded(true)}
          onError={() => setViewerUrl("")}
        />
      ) : (
        <div style={{ padding: "0.75rem", color: "#5f6a87" }}>PDF unavailable</div>
      )}
    </div>
  );
});

PdfReader.displayName = "PdfReader";
export default PdfReader;
