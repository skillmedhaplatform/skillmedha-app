"use client";

import React, { useState, useEffect } from "react";
import pageStyles from "./testui.module.scss";
import { Button, Divider, Spin, Input, Result, message } from "antd";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import {
  postQuesToAi,
  resetAisugg,
  saveUserResponse,
} from "@/redux/slices/testportal";
import { useDispatch, useSelector } from "react-redux";
import { parseIfJson } from "@/app/student/(protected)/jobAssessments/reusable_comp/jsonparse";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchPracQuestions } from "@/redux/slices/practiceSlice";
import useResponsive from "@/hooks/useResponsive";
import MobileQuestionPlayer from "@/mobile_views/practice/MobileQuestionPlayer";

const { TextArea } = Input;

export default function TestPage() {
  const studentCreds = useSelector((state) => state.student.student?.data);
  const pracQuestions = useSelector(
    (s) => s.practice.pracQuestions?.questionsData || []
  );
  const questions = pracQuestions;
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectId = searchParams.get("sub");
  const topicId = searchParams.get("top");
  const subTopicId = searchParams.get("subT");
  const testTitle = searchParams.get("t");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [userSelectedAns, setUserSelectedAns] = useState("");
  const [showExplanation, setShowExplanation] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showSubmitBtn, setShowSubmitBtn] = useState(false);
  const [tempSelectedAnswers, setTempSelectedAnswers] = useState({});
  const [textAnswers, setTextAnswers] = useState({});

  const testportalState = useSelector((state) => state.portal || {});
  const { userResponse = [], aiSuggestions = "" } = testportalState;

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  useEffect(() => {
    dispatch(
      fetchPracQuestions({
        refId: subTopicId,
        type: "subTopicId",
        userId: studentCreds?._id,
      })
    );
  }, []);

  // useEffect(() => {
  //   if (pracQuestions.length === 0) {
  //     router.back();
  //     message.info("no Questions in this subtopic");
  //   }
  // }, [pracQuestions, router]);

  const getQuestionOptions = (questionContent) => {
    const options = [];
    for (let i = 1; i <= 4; i++) {
      const optionKey = `option ${i}`;
      if (questionContent?.[optionKey]) {
        options.push({
          id: optionKey,
          text: questionContent[optionKey].replace(/^"|"$/g, ""),
        });
      }
    }
    return options;
  };

  const currentQuestionOptions = getQuestionOptions(
    currentQuestion?.questionContent
  );

  const renderHtml = (text) => {
    const newText = text.split("```html").join("");
    return (
      <div
        dangerouslySetInnerHTML={{ __html: newText }}
        style={{
          display: "flex",
          flexWrap: "wrap",
          textAlign: "justify",
          alignItems: "flex-start",
        }}
      ></div>
    );
  };

  // Reset user selection when question changes
  useEffect(() => {
    const existingAnswer = selectedAnswers[currentQuestion?._id];
    setUserSelectedAns(existingAnswer !== undefined ? existingAnswer : "");
    setShowExplanation(existingAnswer !== undefined);
    setShowSubmitBtn(false);
    setTempSelectedAnswers({});
    if (existingAnswer === undefined && currentQuestion) {
      setTextAnswers((prev) => ({
        ...prev,
        [currentQuestion._id]: "",
      }));
    }
    dispatch(resetAisugg());
  }, [currentQuestionIndex, selectedAnswers, currentQuestion?._id]);

  useEffect(() => {
    if (testportalState.loading !== undefined) {
      setLoading(testportalState.loading);
    }
  }, [testportalState.loading]);

  const checkAnswer = (questionId, userAnswer) => {
    const question = questions.find((q) => q._id === questionId);
    if (!question) return false;

    if (question.questionType === "Single Choice") {
      const correctAnswer = Object.keys(question.answer.singleChoice).find(
        (key) => question.answer.singleChoice[key] === true
      );
      return userAnswer === correctAnswer;
    } else if (question.questionType === "Multiple Choice") {
      const correctAnswers = Object.keys(question.answer.multipleChoice).filter(
        (key) => question.answer.multipleChoice[key] === true
      );
      const userAnswerArray = Array.isArray(userAnswer) ? userAnswer : [];
      return (
        correctAnswers.length === userAnswerArray.length &&
        correctAnswers.every((answer) => userAnswerArray.includes(answer))
      );
    } else if (question.questionType === "True/False") {
      return userAnswer === question.answer.trueFalse;
    } else if (
      question.questionType === "Video" ||
      question.questionType === "Audio"
    ) {
      return userAnswer && userAnswer.trim().length > 0;
    }
    return false;
  };

  const handleNext = () => {
    if (isLastQuestion) {
      let finalScore = 0;
      Object.keys(selectedAnswers).forEach((questionId) => {
        if (checkAnswer(questionId, selectedAnswers[questionId])) {
          const question = questions.find((q) => q._id === questionId);
          finalScore += question.scoreSettings.pointsForCorrectAns;
        }
      });
      setScore(finalScore);
      setTestCompleted(true);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstQuestion) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleOptionClick = (option) => {
    if (showExplanation) return;
    const questionId = currentQuestion?._id;
    if (currentQuestion?.questionType === "Single Choice") {
      setUserSelectedAns(option.id);
      setShowSubmitBtn(true);
    } else if (currentQuestion?.questionType === "Multiple Choice") {
      const currentSelections = tempSelectedAnswers[questionId] || [];
      let newSelections;
      if (currentSelections.includes(option.id)) {
        newSelections = currentSelections.filter((id) => id !== option.id);
      } else {
        newSelections = [...currentSelections, option.id];
      }
      setTempSelectedAnswers((prev) => ({
        ...prev,
        [questionId]: newSelections,
      }));
      setUserSelectedAns(newSelections);
      setShowSubmitBtn(newSelections.length > 0);
    }
  };

  const handleTrueFalseClick = (value) => {
    if (showExplanation) return;
    setUserSelectedAns(value);
    setShowSubmitBtn(true);
  };

  const handleTextAnswerChange = (e) => {
    const questionId = currentQuestion?._id;
    const value = e.target.value;
    setTextAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
    setUserSelectedAns(value);
    setShowSubmitBtn(value.trim().length > 0);
  };

  // FIXED: Universal submit handler for all question types
  const handleSubmitAnswer = () => {
    const questionId = currentQuestion?._id;
    let finalAnswer;

    if (currentQuestion?.questionType === "Single Choice") {
      finalAnswer = userSelectedAns;
    } else if (currentQuestion?.questionType === "Multiple Choice") {
      finalAnswer = tempSelectedAnswers[questionId] || [];
    } else if (currentQuestion?.questionType === "True/False") {
      finalAnswer = userSelectedAns;
    } else if (
      currentQuestion?.questionType === "Video" ||
      currentQuestion?.questionType === "Audio"
    ) {
      finalAnswer = textAnswers[questionId] || "";
    }

    // FIXED: Check for valid answer - handle boolean false specifically
    if (
      finalAnswer === null ||
      finalAnswer === undefined ||
      finalAnswer === "" ||
      (Array.isArray(finalAnswer) && finalAnswer.length === 0)
    ) {
      return;
    }

    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: finalAnswer,
    }));
    setShowSubmitBtn(false);
    processAnswer(questionId, finalAnswer);
  };

  const processAnswer = (questionId, selectedAnswer) => {
    const isCorrect = checkAnswer(questionId, selectedAnswer);
    let correctAnswer;
    if (currentQuestion?.questionType === "Single Choice") {
      correctAnswer = Object.keys(currentQuestion?.answer.singleChoice).find(
        (key) => currentQuestion?.answer.singleChoice[key] === true
      );
    } else if (currentQuestion?.questionType === "Multiple Choice") {
      correctAnswer = Object.keys(
        currentQuestion?.answer.multipleChoice
      ).filter((key) => currentQuestion?.answer.multipleChoice[key] === true);
    } else if (currentQuestion?.questionType === "True/False") {
      correctAnswer = currentQuestion?.answer.trueFalse;
    } else {
      correctAnswer = "Subjective answer";
    }
    dispatch(
      saveUserResponse({
        questionId: questionId,
        userSelectedOption: selectedAnswer,
        isCorrect: isCorrect,
        correctAnswer: correctAnswer,
      })
    );
    let correctOptionText = "";
    if (currentQuestion?.questionType === "Single Choice") {
      correctOptionText =
        currentQuestionOptions.find((opt) => opt.id === correctAnswer)?.text ||
        "";
    } else if (currentQuestion?.questionType === "Multiple Choice") {
      correctOptionText = currentQuestionOptions
        .filter((opt) => correctAnswer.includes(opt.id))
        .map((opt) => opt.text)
        .join(", ");
    } else if (currentQuestion?.questionType === "True/False") {
      correctOptionText = correctAnswer ? "True" : "False";
    } else {
      correctOptionText = selectedAnswer;
    }
    setLoading(true);
    dispatch(
      postQuesToAi({
        explanation: currentQuestion?.answer.explanation,
        question: currentQuestion?.questionContent.question,
        answer: correctOptionText,
      })
    ).finally(() => {
      setLoading(false);
    });
    setShowExplanation(true);
  };

  const getOptionClass = (option) => {
    const questionId = currentQuestion?._id;
    if (showExplanation) {
      const userResponseData = userResponse?.find(
        (que) => que?.questionId === questionId
      );
      const isCorrect = userResponseData?.isCorrect;
      let correctOptions = [];
      if (currentQuestion?.questionType === "Single Choice") {
        correctOptions = [
          Object.keys(currentQuestion?.answer.singleChoice).find(
            (key) => currentQuestion?.answer.singleChoice[key] === true
          ),
        ];
      } else {
        correctOptions = Object.keys(
          currentQuestion?.answer.multipleChoice
        ).filter((key) => currentQuestion?.answer.multipleChoice[key] === true);
      }
      const isCorrectOption = correctOptions.includes(option.id);
      const currentUserSelection = selectedAnswers[questionId];
      const isUserSelected =
        currentQuestion?.questionType === "Single Choice"
          ? currentUserSelection === option.id
          : Array.isArray(currentUserSelection) &&
          currentUserSelection.includes(option.id);
      if (isUserSelected && isCorrect) {
        return `${pageStyles.selectedOption} ${pageStyles.correctAns}`;
      } else if (isUserSelected && !isCorrect) {
        return `${pageStyles.selectedOption} ${pageStyles.wrongAns}`;
      }
      if (isCorrectOption) {
        return `${pageStyles.correctAns}`;
      }
    } else {
      if (currentQuestion.questionType === "Multiple Choice") {
        const tempSelections = tempSelectedAnswers[questionId] || [];
        return tempSelections.includes(option.id)
          ? pageStyles.selectedOption
          : "";
      } else {
        return userSelectedAns === option.id ? pageStyles.selectedOption : "";
      }
    }
    return "";
  };

  const getTrueFalseClass = (value) => {
    const questionId = currentQuestion._id;
    if (showExplanation) {
      const userResponseData = userResponse?.find(
        (que) => que?.questionId === questionId
      );
      const isCorrect = userResponseData?.isCorrect;
      const correctAnswer = currentQuestion.answer.trueFalse;
      const currentUserSelection = selectedAnswers[questionId];
      if (currentUserSelection === value && isCorrect) {
        return `${pageStyles.selectedOption} ${pageStyles.correctAns}`;
      } else if (currentUserSelection === value && !isCorrect) {
        return `${pageStyles.selectedOption} ${pageStyles.wrongAns}`;
      }
      if (correctAnswer === value) {
        return `${pageStyles.correctAns}`;
      }
    } else {
      return userSelectedAns === value ? pageStyles.selectedOption : "";
    }
    return "";
  };

  const renderQuestionContent = () => {
    const questionId = currentQuestion?._id;
    if (currentQuestion?.questionType === "True/False") {
      return (
        <div className={pageStyles.questionCont}>
          <div
            className={pageStyles.questionText}
            dangerouslySetInnerHTML={{
              __html: parseIfJson(currentQuestion?.questionContent.question),
            }}
          ></div>
          <div className={pageStyles.trueFalseContainer}>
            <button
              className={`${pageStyles.trueFalseButton} ${getTrueFalseClass(
                true
              )}`}
              onClick={() => handleTrueFalseClick(true)}
              disabled={showExplanation}
            >
              <span className={pageStyles.trueFalseLabel}>True</span>
            </button>
            <button
              className={`${pageStyles.trueFalseButton} ${getTrueFalseClass(
                false
              )}`}
              onClick={() => handleTrueFalseClick(false)}
              disabled={showExplanation}
            >
              <span className={pageStyles.trueFalseLabel}>False</span>
            </button>
          </div>
          {showSubmitBtn && !showExplanation && (
            <div className={pageStyles.submitButtonContainer}>
              <Button
                type="primary"
                size="large"
                onClick={handleSubmitAnswer}
                disabled={loading}
              >
                Submit Answer
              </Button>
            </div>
          )}
        </div>
      );
    }
    if (
      currentQuestion?.questionType === "Video" ||
      currentQuestion?.questionType === "Audio"
    ) {
      const resourceUrl = currentQuestion?.resources?.url;
      const hasSubmitted = selectedAnswers[questionId] !== undefined;
      return (
        <div className={pageStyles.questionCont}>
          <div
            className={pageStyles.questionText}
            dangerouslySetInnerHTML={{
              __html: parseIfJson(currentQuestion?.questionContent.question),
            }}
          ></div>
          {resourceUrl && (
            <div className={pageStyles.mediaContainer}>
              {currentQuestion?.questionType === "Video" ? (
                <video
                  controls
                  className={pageStyles.videoPlayer}
                  preload="metadata"
                >
                  <source src={resourceUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <audio
                  controls
                  className={pageStyles.audioPlayer}
                  preload="metadata"
                >
                  <source src={resourceUrl} type="audio/mpeg" />
                  <source src={resourceUrl} type="audio/wav" />
                  Your browser does not support the audio tag.
                </audio>
              )}
            </div>
          )}
          <div className={pageStyles.textAnswerContainer}>
            <TextArea
              rows={4}
              placeholder={`Write your answer about the ${currentQuestion?.questionType.toLowerCase()}...`}
              value={textAnswers[questionId] || ""}
              onChange={handleTextAnswerChange}
              disabled={showExplanation}
              className={pageStyles.textAnswerArea}
            />
            {showSubmitBtn && !showExplanation && (
              <Button
                type="primary"
                size="large"
                onClick={handleSubmitAnswer}
                disabled={loading}
                className={pageStyles.submitTextButton}
              >
                Submit Answer
              </Button>
            )}
            {hasSubmitted && (
              <div className={pageStyles.submittedAnswer}>
                <strong>Your Answer:</strong>
                <p>{selectedAnswers[questionId]}</p>
              </div>
            )}
          </div>
        </div>
      );
    }
    return (
      <div className={pageStyles.questionCont}>
        <div
          className={pageStyles.questionText}
          dangerouslySetInnerHTML={{
            __html: parseIfJson(currentQuestion?.questionContent?.question),
          }}
        ></div>
        {currentQuestionOptions.map((opt, optInd) => {
          return (
            <label
              key={optInd}
              className={`${pageStyles.optionLable} ${getOptionClass(opt)}`}
              onClick={() => handleOptionClick(opt)}
              style={{
                cursor: showExplanation ? "not-allowed" : "pointer",
                opacity: showExplanation ? 0.8 : 1,
              }}
            >
              <span className={pageStyles.optionsOrderChar}>
                {String.fromCharCode(65 + optInd)}.
              </span>
              <span
                dangerouslySetInnerHTML={{
                  __html: parseIfJson(opt.text),
                }}
                className={pageStyles.optionValue}
              ></span>
            </label>
          );
        })}
        {showSubmitBtn && !showExplanation && (
          <div className={pageStyles.submitButtonContainer}>
            <Button
              type="primary"
              size="large"
              onClick={handleSubmitAnswer}
              disabled={loading}
            >
              Submit Answer
            </Button>
          </div>
        )}
      </div>
    );
  };

  const isMobile = useResponsive();

  if (isMobile && currentQuestion && !testCompleted) {
    return (
      <MobileQuestionPlayer
        testTitle={testTitle}
        currentQuestionIndex={currentQuestionIndex}
        questions={questions}
        currentQuestion={currentQuestion}
        currentQuestionOptions={currentQuestionOptions}
        isFirstQuestion={isFirstQuestion}
        isLastQuestion={isLastQuestion}
        showExplanation={showExplanation}
        showSubmitBtn={showSubmitBtn}
        loading={loading}
        aiSuggestions={aiSuggestions}
        userSelectedAns={userSelectedAns}
        tempSelectedAnswers={tempSelectedAnswers}
        textAnswers={textAnswers}
        userResponse={userResponse}
        handlePrevious={handlePrevious}
        handleNext={handleNext}
        handleOptionClick={handleOptionClick}
        handleTrueFalseClick={handleTrueFalseClick}
        handleTextAnswerChange={handleTextAnswerChange}
        handleSubmitAnswer={handleSubmitAnswer}
        getOptionClass={getOptionClass}
        getTrueFalseClass={getTrueFalseClass}
        renderHtml={renderHtml}
      />
    );
  }

  if (testCompleted) {
    return (

      <Result
        status="success"
        title="Quiz Completed!"
        subTitle={`Your Final Score: ${score} / ${questions.length}`}
        extra={[
          <Button
            type="primary"
            onClick={() => router.replace("/student/practice-new/nontechnical")}
            key="restart"
          >
            Practice
          </Button>,
        ]}
      />

    );
  }
  return (

    <div className={pageStyles.mainCont}>
      <StudentPageHeader section="Practice" title="Practice Test" />
      <div className={pageStyles.headerCont}>{testTitle || ""}</div>
      <Divider style={{ margin: ".5rem 0" }} />
      <div className={pageStyles.contentCont}>
        <div className={pageStyles.testCont}>
          <div className={pageStyles.questionCard}>
            <div className={pageStyles.headerContbtn}>
              <Button
                type="default"
                onClick={handlePrevious}
                disabled={isFirstQuestion || loading}
              >
                <FaAngleLeft />
                <FaAngleLeft />
                &nbsp;&nbsp;Prev
              </Button>
              <p className={pageStyles.quesText}>
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
              <Button
                type="default"
                onClick={handleNext}
                disabled={!showExplanation || loading}
              >
                {isLastQuestion ? "Finish" : "Next"}&nbsp;&nbsp;
                <FaAngleRight />
                <FaAngleRight />
              </Button>
            </div>
            <div className={pageStyles.questionTypeBadge}>
              <span className={pageStyles.questionTypeLabel}>
                {currentQuestion?.questionType}
              </span>
            </div>
            {renderQuestionContent()}
          </div>
        </div>
        <div className={pageStyles.SuggestionsCont}>
          <div className={pageStyles.aiSuggCont}>
            <div className={pageStyles.suggestionContainer}>
              <div className={pageStyles.PageHeader}>
                <p>AI Suggestion</p>
                <img
                  src="https://res.cloudinary.com/queezyv1/image/upload/v1746096977/chatbot_jd5xln.svg"
                  alt="AI Suggestion"
                />
              </div>
              <div className={pageStyles.PageContent}>
                {loading ? (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Spin
                      spinning
                      tip={<span>Generating AI Suggestion...</span>}
                    />
                  </div>
                ) : (
                  <div className={pageStyles.PageContent}>
                    {showExplanation ? (
                      renderHtml(aiSuggestions)
                    ) : (
                      <p>
                        Select and submit your answer to see AI suggestions
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className={pageStyles.explCont}>
            <div className={pageStyles.suggestionContainer}>
              <div className={pageStyles.PageHeader}>
                <p>Solution Explanation</p>
                <img
                  src="https://res.cloudinary.com/queezyv1/image/upload/v1746097013/lamp_1_lsxtlj.svg"
                  alt="solution icon"
                />
              </div>
              <div className={pageStyles.PageContent}>
                {showExplanation ? (
                  <div
                    className={pageStyles.explanation}
                    dangerouslySetInnerHTML={{
                      __html: parseIfJson(currentQuestion.answer.explanation),
                    }}
                  ></div>
                ) : (
                  <p>Answer the question to see the explanation</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
}
