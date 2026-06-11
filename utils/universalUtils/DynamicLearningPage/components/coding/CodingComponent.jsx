"use client";
import React, { useState, memo } from "react";
import { Button, Divider } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import CodingPage from "@/universalUtils/codeEditor/page";

/**
 * CodingComponent
 * Extracted into a stable module-scope component.
 */
const CodingComponent = memo(({ questions, onRunCode }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!questions?.length) return null;

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
        flex: 1,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        width: "100%",
      }}
    >
      <div style={{ flex: 1, height: "100%" }}>
        <CodingPage questionData={questions[currentIndex]} />
      </div>
      <Divider style={{ margin: ".5rem 0" }} />
      <div
        style={{
          textAlign: "center",
          width: "100%",
          padding: ".5rem 1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: "1rem",
          alignSelf: "flex-end",
        }}
      >
        <Button
          type="default"
          icon={<LeftOutlined />}
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          Previous Question
        </Button>
        <Button
          type="primary"
          icon={<RightOutlined />}
          onClick={handleNext}
          disabled={currentIndex === questions.length - 1}
        >
          Next Question
        </Button>
      </div>
    </div>
  );
});

CodingComponent.displayName = "CodingComponent";
export default CodingComponent;
