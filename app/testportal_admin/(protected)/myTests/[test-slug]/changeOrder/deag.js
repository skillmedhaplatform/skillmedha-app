"use client";
import React, { useState } from "react";
import draggableStyles from "./DraggableQuestion.module.scss";
import { AlignLeftOutlined } from "@ant-design/icons";
import QuestionCard from "../questionManager/comps/allQuestions";

const DraggableQuestion = ({ question, index, moveQuestion, draggable }) => {
  const [dragging, setDragging] = useState(false);

  const handleDragStart = (e) => {
    e.dataTransfer.setData("text/plain", index);
    setDragging(true);
  };

  const handleDragEnd = () => {
    setDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dragIndex = e.dataTransfer.getData("text/plain");
    const hoverIndex = index;
    moveQuestion(dragIndex, hoverIndex);
    setDragging(false);
  };

  return (
    <div
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{ opacity: dragging ? 0.5 : 1 }}
      className={`${draggableStyles.draggableQuestion} ${
        dragging ? draggableStyles.dragging : ""
      }`}
    >
      {/* {draggable && <span className={draggableStyles.questionHandle}>::</span>} */}
      <QuestionCard question={question} index={index} style={draggable} />
    </div>
  );
};

export default DraggableQuestion;
