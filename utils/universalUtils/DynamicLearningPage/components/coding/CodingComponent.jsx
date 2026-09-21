"use client";
import React, { useState, memo } from "react";
import { Button, Divider, Empty } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import CodingPage from "@/universalUtils/codeEditor/page";

/**
 * CodingComponent
 * Extracted into a stable module-scope component.
 */
const CodingComponent = memo(({ questions, onRunCode }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!questions?.length) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", width: "100%", padding: "2rem" }}>
        <Empty description="No coding questions available for this topic" />
      </div>
    );
  }

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex((prev) => prev + 1);
  };

  return (
    <div
      onClickCapture={(e) => {
        const targetButton = e.target?.closest?.("button");
        if (!targetButton) return;
        const btnText = String(targetButton.textContent || "").toLowerCase();
        if (btnText.includes("run code") && typeof onRunCode === "function") {
          onRunCode();
        }
      }}
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      <CodingPage questionData={questions[currentIndex]} />
    </div>
  );
});

CodingComponent.displayName = "CodingComponent";
export default CodingComponent;
