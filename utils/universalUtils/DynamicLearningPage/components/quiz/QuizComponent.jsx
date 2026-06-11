"use client";
import React, { useState, memo } from "react";
import { Result, Button } from "antd";
import { ReloadOutlined, HomeOutlined } from "@ant-design/icons";

/**
 * QuizComponent
 * Made stable outside parent render so it retains state when parent rerenders.
 */
const QuizComponent = memo(({ questions, onComplete, handleNextTopic }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [textAnswers, setTextAnswers] = useState({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);

  if (!questions || !questions.length) return null;

  const currentQuestion = questions[currentQuestionIndex];
  const questionOptions = Object.keys(currentQuestion.questionContent || {}).filter(
    (key) => key.startsWith("option")
  );
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleOptionSelect = (optionKey, optionValue) => {
    const questionId = currentQuestion.id;
    if (currentQuestion.questionType === "Multiple Choice") {
      setSelectedAnswers((prev) => ({
        ...prev,
        [questionId]: {
          ...prev[questionId],
          [optionKey]: !prev[questionId]?.[optionKey],
        },
      }));
    } else {
      setSelectedAnswers((prev) => ({
        ...prev,
        [questionId]: { [optionKey]: true },
      }));
    }
  };

  const handleTrueFalse = (value) => {
    const questionId = currentQuestion.id;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: { answer: value },
    }));
  };

  const handleTextAnswerChange = (value) => {
    const questionId = currentQuestion.id;
    setTextAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowExplanation(false);
      setIsSubmitted(false);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowExplanation(false);
      setIsSubmitted(false);
    }
  };

  const submitAnswer = () => {
    setIsSubmitted(true);
    setShowExplanation(true);
  };

  const submitQuiz = () => {
    setIsQuizCompleted(true);
    if (typeof onComplete === "function") {
      onComplete();
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setTextAnswers({});
    setShowExplanation(false);
    setIsSubmitted(false);
    setIsQuizCompleted(false);
  };

  const isCorrectAnswer = (optionKey) => {
    if (currentQuestion.questionType === "Single Choice") {
      return currentQuestion.answer?.singleChoice?.[optionKey];
    } else if (currentQuestion.questionType === "Multiple Choice") {
      return currentQuestion.answer?.multipleChoice?.[optionKey];
    }
    return false;
  };

  const getOptionStyle = (optionKey) => {
    if (!isSubmitted) {
      return selectedAnswers[currentQuestion.id]?.[optionKey]
        ? { backgroundColor: "#e3f2fd", border: "2px solid #2196f3" }
        : { backgroundColor: "#f5f5f5", border: "1px solid #ddd" };
    }

    const isSelected = selectedAnswers[currentQuestion.id]?.[optionKey];
    const isCorrect = isCorrectAnswer(optionKey);

    if (isCorrect) {
      return { backgroundColor: "#e8f5e8", border: "2px solid #4caf50" };
    } else if (isSelected && !isCorrect) {
      return { backgroundColor: "#ffebee", border: "2px solid #f44336" };
    }
    return { backgroundColor: "#f5f5f5", border: "1px solid #ddd" };
  };

  const hasAnswer = () => {
    const questionId = currentQuestion.id;
    if (["Video", "Audio", "Text"].includes(currentQuestion.questionType)) {
      return textAnswers[questionId] && textAnswers[questionId].trim().length > 0;
    }
    return selectedAnswers[questionId] && Object.keys(selectedAnswers[questionId]).length > 0;
  };

  if (isQuizCompleted) {
    return (
      <div
        style={{
          width: "90%", height: "90%", maxWidth: "800px", padding: "24px",
          backgroundColor: "#fff", borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <Result
          status="success"
          title="Quiz Submitted Successfully!"
          subTitle="Thank you for completing the quiz. Your responses have been recorded and will be reviewed shortly."
          extra={[
            <Button key="restart" type="primary" icon={<ReloadOutlined />} onClick={restartQuiz} size="large">
              Take Quiz Again
            </Button>,
            <Button key="home" icon={<HomeOutlined />} onClick={handleNextTopic} size="large">
              Go to Next Topic
            </Button>,
          ]}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        width: "90%", height: "90%", maxWidth: "800px", padding: "24px",
        backgroundColor: "#fff", borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)", overflowY: "scroll",
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "14px", color: "#666", marginBottom: "8px", fontWeight: "500" }}>
          Question {currentQuestionIndex + 1} of {questions.length} • {currentQuestion.questionType}
        </div>
        <div
          style={{ fontSize: "18px", fontWeight: "600", color: "#333", lineHeight: "1.5" }}
          dangerouslySetInnerHTML={{ __html: currentQuestion.questionContent?.question?.replace(/"/g, "") }}
        />
      </div>

      {currentQuestion.questionType === "True/False" ? (
        <div style={{ marginBottom: "24px" }}>
          {["True", "False"].map((option) => (
            <div
              key={option}
              onClick={() => !isSubmitted && handleTrueFalse(option.toLowerCase() === "true")}
              style={{
                padding: "16px", margin: "8px 0",
                border: selectedAnswers[currentQuestion.id]?.answer === (option.toLowerCase() === "true") ? "2px solid #2196f3" : "1px solid #ddd",
                backgroundColor: selectedAnswers[currentQuestion.id]?.answer === (option.toLowerCase() === "true") ? "#e3f2fd" : "#f9f9f9",
                borderRadius: "8px", cursor: isSubmitted ? "default" : "pointer", transition: "all 0.2s ease",
              }}
            >
              <label style={{ cursor: isSubmitted ? "default" : "pointer", fontSize: "16px" }}>
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  checked={selectedAnswers[currentQuestion.id]?.answer === (option.toLowerCase() === "true")}
                  onChange={() => { }}
                  style={{ marginRight: "12px" }}
                />
                {option}
              </label>
            </div>
          ))}
        </div>
      ) : currentQuestion.questionType === "Video" ? (
        <div style={{ marginBottom: "24px" }}>
          <video controls style={{ width: "100%", maxHeight: "400px", borderRadius: "8px", marginBottom: "16px" }} src={currentQuestion.resources?.url}>
            Your browser does not support the video tag.
          </video>
          <div style={{ marginTop: "16px" }}>
            <label style={{ display: "block", fontWeight: "600", marginBottom: "8px", color: "#333" }}>Your Answer:</label>
            <textarea
              value={textAnswers[currentQuestion.id] || ""}
              onChange={(e) => handleTextAnswerChange(e.target.value)}
              placeholder="Type your answer here..."
              style={{ width: "100%", minHeight: "100px", padding: "12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px", fontFamily: "inherit", resize: "vertical" }}
              disabled={isSubmitted}
            />
          </div>
        </div>
      ) : currentQuestion.questionType === "Audio" ? (
        <div style={{ marginBottom: "24px" }}>
          <audio controls style={{ width: "100%", marginBottom: "16px" }} src={currentQuestion.resources?.url}>
            Your browser does not support the audio element.
          </audio>
          <div style={{ marginTop: "16px" }}>
            <label style={{ display: "block", fontWeight: "600", marginBottom: "8px", color: "#333" }}>Your Answer:</label>
            <textarea
              value={textAnswers[currentQuestion.id] || ""}
              onChange={(e) => handleTextAnswerChange(e.target.value)}
              placeholder="Type your answer here..."
              style={{ width: "100%", minHeight: "100px", padding: "12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px", fontFamily: "inherit", resize: "vertical" }}
              disabled={isSubmitted}
            />
          </div>
        </div>
      ) : currentQuestion.questionType === "Text" ? (
        <div style={{ marginBottom: "24px" }}>
          <div style={{ marginTop: "16px" }}>
            <label style={{ display: "block", fontWeight: "600", marginBottom: "8px", color: "#333" }}>Your Answer:</label>
            <textarea
              value={textAnswers[currentQuestion.id] || ""}
              onChange={(e) => handleTextAnswerChange(e.target.value)}
              placeholder="Type your detailed answer here..."
              style={{ width: "100%", minHeight: "150px", padding: "12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px", fontFamily: "inherit", resize: "vertical" }}
              disabled={isSubmitted}
            />
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: "24px" }}>
          {questionOptions.map((optionKey) => (
            <div
              key={optionKey}
              onClick={() => !isSubmitted && handleOptionSelect(optionKey, currentQuestion.questionContent[optionKey])}
              style={{
                ...getOptionStyle(optionKey),
                padding: "16px", margin: "8px 0", borderRadius: "8px",
                cursor: isSubmitted ? "default" : "pointer", transition: "all 0.2s ease",
              }}
            >
              <label style={{ cursor: isSubmitted ? "default" : "pointer", fontSize: "16px", display: "flex", alignItems: "flex-start" }}>
                <input
                  type={currentQuestion.questionType === "Multiple Choice" ? "checkbox" : "radio"}
                  name={currentQuestion.questionType === "Single Choice" ? `question-${currentQuestion.id}` : undefined}
                  checked={!!selectedAnswers[currentQuestion.id]?.[optionKey]}
                  onChange={() => { }}
                  style={{ marginRight: "12px", marginTop: "2px" }}
                />
                <div dangerouslySetInnerHTML={{ __html: currentQuestion.questionContent[optionKey]?.replace(/"/g, "") }} />
              </label>
            </div>
          ))}
        </div>
      )}

      {showExplanation && currentQuestion.answer?.explanation && (
        <div style={{ backgroundColor: "#f0f7ff", padding: "16px", borderRadius: "8px", marginBottom: "20px", border: "1px solid #b3d9ff" }}>
          <div style={{ fontWeight: "600", marginBottom: "8px", color: "#1976d2" }}>Explanation:</div>
          <div style={{ color: "#333", lineHeight: "1.5" }} dangerouslySetInnerHTML={{ __html: currentQuestion.answer.explanation?.replace(/"/g, "") }} />
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #eee", paddingTop: "20px" }}>
        <button
          onClick={previousQuestion}
          disabled={currentQuestionIndex === 0}
          style={{
            padding: "10px 20px",
            backgroundColor: currentQuestionIndex === 0 ? "#f5f5f5" : "#fff",
            color: currentQuestionIndex === 0 ? "#ccc" : "#333",
            border: "1px solid #ddd", borderRadius: "6px",
            cursor: currentQuestionIndex === 0 ? "not-allowed" : "pointer",
          }}
        >
          Previous
        </button>

        <div style={{ display: "flex", gap: "12px" }}>
          {!isSubmitted && !isLastQuestion && (
            <button
              onClick={submitAnswer}
              disabled={!hasAnswer()}
              style={{
                padding: "10px 24px",
                backgroundColor: hasAnswer() ? "#2196f3" : "#f5f5f5",
                color: hasAnswer() ? "#fff" : "#ccc",
                border: "none", borderRadius: "6px",
                cursor: hasAnswer() ? "pointer" : "not-allowed",
              }}
            >
              Submit Answer
            </button>
          )}
          {isLastQuestion ? (
            <button
              onClick={submitQuiz}
              disabled={!hasAnswer()}
              style={{
                padding: "10px 24px",
                backgroundColor: hasAnswer() ? "#4caf50" : "#f5f5f5",
                color: hasAnswer() ? "#fff" : "#ccc",
                border: "none", borderRadius: "6px",
                cursor: hasAnswer() ? "pointer" : "not-allowed",
                fontWeight: "600",
              }}
            >
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={nextQuestion}
              disabled={currentQuestionIndex === questions.length - 1}
              style={{
                padding: "10px 20px",
                backgroundColor: currentQuestionIndex === questions.length - 1 ? "#f5f5f5" : "#4caf50",
                color: currentQuestionIndex === questions.length - 1 ? "#ccc" : "#fff",
                border: "none", borderRadius: "6px",
                cursor: currentQuestionIndex === questions.length - 1 ? "not-allowed" : "pointer",
              }}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

QuizComponent.displayName = "QuizComponent";
export default QuizComponent;
