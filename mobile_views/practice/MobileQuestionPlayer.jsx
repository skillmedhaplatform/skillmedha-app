"use client";
import React, { useState } from "react";
import { Button, Collapse, Spin, Divider, Input } from "antd";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { LoadingOutlined } from "@ant-design/icons";
import { parseIfJson } from "@/app/student/(protected)/jobAssessments/reusable_comp/jsonparse";
import styles from "./mobilePracticePlayer.module.scss";

const { TextArea } = Input;

export default function MobileQuestionPlayer({
  testTitle,
  currentQuestionIndex,
  questions = [],
  currentQuestion,
  currentQuestionOptions = [],
  isFirstQuestion,
  isLastQuestion,
  showExplanation,
  showSubmitBtn,
  loading,
  aiSuggestions,
  userSelectedAns,
  tempSelectedAnswers,
  textAnswers,
  userResponse,
  handlePrevious,
  handleNext,
  handleOptionClick,
  handleTrueFalseClick,
  handleTextAnswerChange,
  handleSubmitAnswer,
  getOptionClass,
  getTrueFalseClass,
  renderHtml,
}) {
  const [activeAccordionKey, setActiveAccordionKey] = useState([]);

  if (!currentQuestion) return null;

  const renderMobileQuestionContent = () => {
    const questionId = currentQuestion._id;

    if (currentQuestion.questionType === "True/False") {
      return (
        <div className={styles.questionContent}>
          <div
            className={styles.questionText}
            dangerouslySetInnerHTML={{
              __html: parseIfJson(currentQuestion.questionContent.question),
            }}
          />
          <div className={styles.trueFalseContainer}>
            <button
              className={`${styles.trueFalseButton} ${
                getTrueFalseClass(true) ? styles.selectedTrueFalse : ""
              } ${
                getTrueFalseClass(true)?.includes("correctAns") ? styles.correctTrueFalse : ""
              } ${
                getTrueFalseClass(true)?.includes("wrongAns") ? styles.wrongTrueFalse : ""
              }`}
              onClick={() => handleTrueFalseClick(true)}
              disabled={showExplanation}
            >
              <span>True</span>
            </button>
            <button
              className={`${styles.trueFalseButton} ${
                getTrueFalseClass(false) ? styles.selectedTrueFalse : ""
              } ${
                getTrueFalseClass(false)?.includes("correctAns") ? styles.correctTrueFalse : ""
              } ${
                getTrueFalseClass(false)?.includes("wrongAns") ? styles.wrongTrueFalse : ""
              }`}
              onClick={() => handleTrueFalseClick(false)}
              disabled={showExplanation}
            >
              <span>False</span>
            </button>
          </div>
          {showSubmitBtn && !showExplanation && (
            <div className={styles.submitContainer}>
              <Button type="primary" size="large" block onClick={handleSubmitAnswer} disabled={loading}>
                Submit Answer
              </Button>
            </div>
          )}
        </div>
      );
    }

    if (currentQuestion.questionType === "Video" || currentQuestion.questionType === "Audio") {
      const resourceUrl = currentQuestion.resources?.url;
      const hasSubmitted = selectedAnswers?.[questionId] !== undefined;

      return (
        <div className={styles.questionContent}>
          <div
            className={styles.questionText}
            dangerouslySetInnerHTML={{
              __html: parseIfJson(currentQuestion.questionContent.question),
            }}
          />
          {resourceUrl && (
            <div className={styles.mediaContainer}>
              {currentQuestion.questionType === "Video" ? (
                <video controls className={styles.videoPlayer} preload="metadata">
                  <source src={resourceUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <audio controls className={styles.audioPlayer} preload="metadata">
                  <source src={resourceUrl} type="audio/mpeg" />
                  Your browser does not support the audio tag.
                </audio>
              )}
            </div>
          )}
          <div className={styles.textAnswerContainer}>
            <TextArea
              rows={4}
              placeholder={`Write your answer about the ${currentQuestion.questionType.toLowerCase()}...`}
              value={textAnswers[questionId] || ""}
              onChange={handleTextAnswerChange}
              disabled={showExplanation}
              className={styles.textAnswerArea}
            />
            {showSubmitBtn && !showExplanation && (
              <Button type="primary" size="large" block onClick={handleSubmitAnswer} disabled={loading}>
                Submit Answer
              </Button>
            )}
            {hasSubmitted && (
              <div className={styles.submittedAnswer}>
                <strong>Your Answer:</strong>
                <p>{textAnswers[questionId]}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Default: Single Choice or Multiple Choice
    return (
      <div className={styles.questionContent}>
        <div
          className={styles.questionText}
          dangerouslySetInnerHTML={{
            __html: parseIfJson(currentQuestion.questionContent?.question),
          }}
        />
        <div className={styles.optionsList}>
          {currentQuestionOptions.map((opt, optInd) => {
            const optClass = getOptionClass(opt);
            let stateClass = "";
            if (optClass.includes("correctAns")) stateClass = styles.correctOption;
            else if (optClass.includes("wrongAns")) stateClass = styles.wrongOption;
            else if (optClass.includes("selectedOption")) stateClass = styles.selectedOption;

            return (
              <label
                key={optInd}
                className={`${styles.optionLabel} ${stateClass}`}
                onClick={() => handleOptionClick(opt)}
                style={{
                  cursor: showExplanation ? "not-allowed" : "pointer",
                }}
              >
                <span className={styles.optionChar}>
                  {String.fromCharCode(65 + optInd)}.
                </span>
                <span
                  dangerouslySetInnerHTML={{
                    __html: parseIfJson(opt.text),
                  }}
                  className={styles.optionValue}
                />
              </label>
            );
          })}
        </div>
        {showSubmitBtn && !showExplanation && (
          <div className={styles.submitContainer}>
            <Button type="primary" size="large" block onClick={handleSubmitAnswer} disabled={loading}>
              Submit Answer
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.playerContainer}>
      {/* Quiz Title Header */}
      <div className={styles.playerHeader}>
        {testTitle || "Practice Quiz"}
      </div>

      <div className={styles.scrollContent}>
        {/* Question Panel */}
        <div className={styles.questionCard}>
          <div className={styles.questionBadge}>
            {currentQuestion.questionType}
          </div>
          {renderMobileQuestionContent()}
        </div>

        {/* Collapsible AI & Solution Panels */}
        <div className={styles.accordionsSection}>
          <Collapse
            activeKey={activeAccordionKey}
            onChange={setActiveAccordionKey}
            className={styles.playerCollapse}
          >
            <Collapse.Panel header="💡 AI Suggestion" key="ai-suggestion">
              {loading ? (
                <div className={styles.panelLoading}>
                  <Spin indicator={<LoadingOutlined style={{ fontSize: 20 }} spin />} />
                  <p>Generating AI suggestions...</p>
                </div>
              ) : showExplanation ? (
                <div className={styles.panelBody}>
                  {renderHtml(aiSuggestions)}
                </div>
              ) : (
                <p className={styles.lockedPanelText}>
                  Submit your answer to see AI suggestions.
                </p>
              )}
            </Collapse.Panel>

            <Collapse.Panel header="📝 Solution Explanation" key="solution-explanation">
              {showExplanation ? (
                <div
                  className={styles.explanationText}
                  dangerouslySetInnerHTML={{
                    __html: parseIfJson(currentQuestion.answer?.explanation),
                  }}
                />
              ) : (
                <p className={styles.lockedPanelText}>
                  Answer the question to view the explanation.
                </p>
              )}
            </Collapse.Panel>
          </Collapse>
        </div>
      </div>

      {/* Sticky Bottom Navigation Bar */}
      <div className={styles.footerNav}>
        <Button
          onClick={handlePrevious}
          disabled={isFirstQuestion || loading}
          className={styles.navBtn}
        >
          <FaAngleLeft /> Prev
        </Button>
        <span className={styles.progressText}>
          {currentQuestionIndex + 1} / {questions.length}
        </span>
        <Button
          type="primary"
          onClick={handleNext}
          disabled={!showExplanation || loading}
          className={styles.navBtn}
        >
          {isLastQuestion ? "Finish" : "Next"} <FaAngleRight />
        </Button>
      </div>
    </div>
  );
}
