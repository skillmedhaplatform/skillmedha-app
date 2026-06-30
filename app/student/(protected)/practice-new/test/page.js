"use client";

import React, { useState, useEffect } from "react";
import pageStyles from "./testui.module.scss";
import { Button, Divider, Spin, Input, Result, message, Modal } from "antd";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { 
  TbClock, TbDoorExit, TbArrowLeft, TbArrowRight, TbListCheck, 
  TbPlayerSkipForward, TbSend, TbTrophy, TbSparkles, TbRefresh, 
  TbRobot, TbBulb, TbCircleCheck, TbCircleX, TbAlertTriangle 
} from "react-icons/tb";
import {
  postQuesToAi,
  resetAisugg,
  saveUserResponse,
  resetUserResponse,
} from "@/redux/slices/testportal";
import { useDispatch, useSelector } from "react-redux";
import { parseIfJson } from "@/app/student/(protected)/jobAssessments/reusable_comp/jsonparse";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchPracQuestions, savePracResults } from "@/redux/slices/practiceSlice";
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
  const testTitle = searchParams.get("title") || searchParams.get("t");
  const subjectTitle = searchParams.get("subjectTitle") || "";
  const subjectType = searchParams.get("type") || "Technical";
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [userSelectedAns, setUserSelectedAns] = useState("");
  const [showExplanation, setShowExplanation] = useState(false);
  const [isLastQuestion, setIsLastQuestion] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showSubmitBtn, setShowSubmitBtn] = useState(false);
  const [tempSelectedAnswers, setTempSelectedAnswers] = useState({});
  const [textAnswers, setTextAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(30 * 60);

  const testportalState = useSelector((state) => state.portal || {});
  const { userResponse = [], aiSuggestions = "" } = testportalState;
  const pracQuestionsData = useSelector(
    (s) => s.practice.pracQuestions || {}
  );
  const pracId = pracQuestionsData?.data?.insertedId;

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestionIndex = currentQuestionIndex === questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  const calculatedScore = userResponse?.reduce((acc, r) => {
    if (r.isCorrect) {
      const q = questions.find(q => q._id === r.questionId);
      return acc + (q?.scoreSettings?.pointsForCorrectAns || 1);
    }
    return acc;
  }, 0) || 0;

  const handleTestCompletion = (isQuit = false) => {
    const attemptedAll = userResponse.length === questions.length;
    
    if (!isQuit && !attemptedAll) {
      Modal.warning({
        title: 'Incomplete Test',
        content: 'You must attempt all questions to submit this test and calculate progress. Please complete the remaining questions.',
      });
      return;
    }

    setTestCompleted(true);
    
    // Only save if not quitting prematurely, or if you want to save partial tests, 
    // the user requested to NOT count progress if they left without attempting all given questions.
    if (!isQuit && attemptedAll && pracId) {
      const correctQuestionIds = userResponse
        .filter(r => r.isCorrect)
        .map(r => r.questionId);
        
      dispatch(savePracResults({
        pracId,
        payload: {
          score: calculatedScore,
          totalQuestions: questions.length,
          correctQuestionIds,
          attemptedAll,
          completedAt: new Date().getTime()
        }
      }));
    }
  };

  useEffect(() => {
    const refId = subTopicId || subjectId;
    const fetchType = subTopicId ? "subTopicId" : "subjectId";
    
    if (refId) {
      dispatch(resetUserResponse()); // clear old answers
      dispatch(
        fetchPracQuestions({
          refId: refId,
          type: fetchType,
          userId: studentCreds?._id,
        })
      );
    }
  }, [subTopicId, subjectId, dispatch, studentCreds?._id]);

  useEffect(() => {
    if (testCompleted) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowEndModal(true);
          return 0;
        }
        
        if (prev === 601) {
          message.warning("10 minutes remaining!");
        } else if (prev === 301) {
          message.warning("5 minutes remaining!");
        }
        
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [testCompleted]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

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
    if (!text) return null;
    const newText = String(text).split("```html").join("");
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
    if (isLastQuestionIndex) {
      setShowFinishModal(true);
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
              className={`${pageStyles.trueFalseButton} ${getTrueFalseClass(true)}`}
              onClick={() => handleTrueFalseClick(true)}
              disabled={showExplanation}
            >
              <span className={pageStyles.trueFalseLabel}>True</span>
            </button>
            <button
              className={`${pageStyles.trueFalseButton} ${getTrueFalseClass(false)}`}
              onClick={() => handleTrueFalseClick(false)}
              disabled={showExplanation}
            >
              <span className={pageStyles.trueFalseLabel}>False</span>
            </button>
          </div>
        </div>
      );
    } else if (currentQuestion?.questionType === "Video" || currentQuestion?.questionType === "Audio") {
      return (
        <div className={pageStyles.questionCont}>
          <div className={pageStyles.questionText} dangerouslySetInnerHTML={{ __html: parseIfJson(currentQuestion?.questionContent.question) }}></div>
          <div className={pageStyles.subjectiveContainer}>
            <TextArea
              rows={4}
              value={textAnswers[questionId] || ""}
              onChange={handleTextAnswerChange}
              disabled={showExplanation}
              placeholder="Type your answer here..."
              className={pageStyles.textArea}
            />
          </div>
        </div>
      );
    }
    
    // Multiple Choice & Single Choice
    return (
      <div className={pageStyles.questionCont}>
        <div className={pageStyles.qText} dangerouslySetInnerHTML={{ __html: parseIfJson(currentQuestion?.questionContent.question) }}></div>
        <div className={pageStyles.options}>
          {currentQuestionOptions.map((opt, optInd) => {
            const optClass = getOptionClass(opt);
            const isCorrect = optClass.includes(pageStyles.correctAns);
            const isWrong = optClass.includes(pageStyles.wrongAns);
            const isSelected = optClass.includes(pageStyles.selectedOption);
            
            let finalClass = pageStyles.option;
            if (isSelected) finalClass += ` ${pageStyles.selectedOption}`;
            if (isCorrect) finalClass += ` ${pageStyles.correctAns}`;
            if (isWrong) finalClass += ` ${pageStyles.wrongAns}`;
            if (showExplanation) finalClass += ` ${pageStyles.locked}`;
            
            return (
              <div
                key={optInd}
                className={finalClass}
                onClick={() => handleOptionClick(opt)}
                style={{ cursor: showExplanation ? "default" : "pointer" }}
              >
                <div className={pageStyles.optLetter}>
                  {String.fromCharCode(65 + optInd)}
                </div>
                <div
                  dangerouslySetInnerHTML={{ __html: parseIfJson(opt.text) }}
                  className={pageStyles.optText}
                ></div>
                {(isCorrect || isWrong) && (
                  <span className={pageStyles.optIcon}>
                    {isCorrect ? <TbCircleCheck className={pageStyles.optIconC} /> : <TbCircleX className={pageStyles.optIconW} />}
                  </span>
                )}
              </div>
            );
          })}
        </div>
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
        isLastQuestion={isLastQuestionIndex}
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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100%', backgroundColor: '#fff' }}>
        <Result
          status="success"
          title="Quiz Completed!"
          subTitle={`Your Final Score: ${calculatedScore} / ${questions.reduce((acc, q) => acc + (q.scoreSettings?.pointsForCorrectAns || 1), 0)}`}
          extra={[
            <Button
              type="primary"
              onClick={() => router.replace("/student/practice-new/nontechnical")}
              key="restart"
            >
              Practice
            </Button>,
            <Button
              type="default"
              onClick={() => window.location.reload()}
              key="reattempt"
            >
              Re-attempt
            </Button>,
          ]}
        />
      </div>
    );
  }
  return (

    <div className={pageStyles.main}>
      <div className={pageStyles.topbar}>
        <div className={pageStyles.topbarLeft}>
          <div className={pageStyles.topicTitle}>{testTitle || "Practice Test"}</div>
          <span className={pageStyles.topicBadge}>{subjectType} {subjectTitle ? `· ${subjectTitle}` : ""}</span>
        </div>
        <div className={pageStyles.topbarRight}>
          <div className={`${pageStyles.timerPill} ${timeLeft <= 300 ? pageStyles.danger : ""}`}>
            <TbClock /> <span>{formatTime(timeLeft)}</span>
          </div>
          <button className={pageStyles.quitBtn} onClick={() => setShowEndModal(true)}>
            <TbDoorExit /> Quit Test
          </button>
        </div>
      </div>

      <div className={pageStyles.body}>
        <div className={pageStyles.quizCol}>
          <div className={pageStyles.progressCard}>
            <div className={pageStyles.progNav}>
              <div className={`${pageStyles.navArrow} ${isFirstQuestion ? pageStyles.disabled : ""}`} onClick={handlePrevious}>
                <TbArrowLeft />
              </div>
            </div>
            <div className={pageStyles.progCenter}>
              <div className={pageStyles.progLabel}>Question {currentQuestionIndex + 1} of {questions.length}</div>
              <div className={pageStyles.progBarBg}>
                <div className={pageStyles.progBar} style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}></div>
              </div>
            </div>
            <div className={pageStyles.progNav}>
              <div className={`${pageStyles.navArrow} ${isLastQuestion ? pageStyles.disabled : ""}`} onClick={() => isLastQuestion ? null : handleNext()}>
                <TbArrowRight />
              </div>
            </div>
            <div className={pageStyles.typeBadge}>
              <TbListCheck /> {currentQuestion?.questionType}
            </div>
          </div>

          <div className={pageStyles.questionCard}>
            <div className={pageStyles.qNum}>Question {String(currentQuestionIndex + 1).padStart(2, '0')}</div>
            {renderQuestionContent()}
            
            <div className={pageStyles.actionRow}>
              <button className={pageStyles.skipBtn} onClick={handleNext} disabled={loading || showExplanation}>
                <TbPlayerSkipForward /> Skip
              </button>
              
              {!showExplanation ? (
                <button 
                  className={pageStyles.submitBtn} 
                  disabled={!showSubmitBtn || loading} 
                  onClick={handleSubmitAnswer}
                >
                  <TbSend /> Submit Answer
                </button>
              ) : (
                <button 
                  className={pageStyles.submitBtn} 
                  onClick={handleNext}
                >
                  <TbArrowRight /> {isLastQuestion ? "Finish Test" : "Next Question"}
                </button>
              )}
            </div>
          </div>

          <div className={pageStyles.panelCard} style={{ marginTop: '16px', flex: 'none' }}>
            <div className={pageStyles.panelHeader}>
              <div className={pageStyles.panelTitle}>
                <TbBulb style={{ color: "#ffa726" }} /> Solution Explanation
              </div>
            </div>
            <div className={pageStyles.panelBody}>
              {showExplanation ? (
                <>
                  <div className={pageStyles.expContent} dangerouslySetInnerHTML={{ __html: parseIfJson(currentQuestion.answer.explanation) }}></div>
                  
                  {currentQuestion.answer?.quickTip && (
                    <div className={pageStyles.quickTipBox}>
                      <div className={pageStyles.qtIcon}><TbBulb /></div>
                      <div className={pageStyles.qtText}>
                        <strong>Quick Tip</strong>
                        <div>{currentQuestion.answer.quickTip}</div>
                      </div>
                    </div>
                  )}
                  
                  {currentQuestion.answer?.whyIncorrect && (
                    <div className={pageStyles.whyIncorrectBox}>
                      <div className={pageStyles.wiIcon}><TbAlertTriangle /></div>
                      <div className={pageStyles.wiText}>
                        <strong>Why other options are incorrect?</strong>
                        <div>{currentQuestion.answer.whyIncorrect}</div>
                      </div>
                    </div>
                  )}

                  <div className={`${pageStyles.resultBanner} ${checkAnswer(currentQuestion._id, selectedAnswers[currentQuestion._id]) ? pageStyles.correct : pageStyles.wrong}`}>
                    {checkAnswer(currentQuestion._id, selectedAnswers[currentQuestion._id]) ? <TbCircleCheck /> : <TbCircleX />}
                    {checkAnswer(currentQuestion._id, selectedAnswers[currentQuestion._id]) ? 'Correct! Well done.' : 'Incorrect — review the explanation above.'}
                  </div>
                </>
              ) : (
                <div className={pageStyles.emptyState}>
                  <div className={`${pageStyles.emptyIcon} ${pageStyles.yellow}`}><TbBulb /></div>
                  <div className={pageStyles.emptyText}>Answer the question to see the explanation</div>
                </div>
              )}
            </div>
          </div>

        </div>

        <div className={pageStyles.rightCol}>
          <div className={pageStyles.scoreRow}>
            <div className={pageStyles.scoreIcon}><TbTrophy /></div>
            <div className={pageStyles.scoreMain}>
              <div className={pageStyles.scoreLbl}>Score</div>
              <div className={pageStyles.scoreNum}>{calculatedScore} / {questions.reduce((acc, q) => acc + (q.scoreSettings?.pointsForCorrectAns || 1), 0)}</div>
            </div>
            <div className={pageStyles.scoreStat}>
              <div className={pageStyles.scoreLbl}>Correct</div>
              <div className={pageStyles.statNumG}>{userResponse?.filter(r => r.isCorrect).length || 0}</div>
            </div>
            <div className={pageStyles.scoreStat} style={{ marginLeft: "12px" }}>
              <div className={pageStyles.scoreLbl}>Wrong</div>
              <div className={pageStyles.statNumR}>{userResponse?.filter(r => r.isCorrect === false).length || 0}</div>
            </div>
          </div>

          <div className={pageStyles.panelCard}>
            <div className={pageStyles.panelHeader}>
              <div className={pageStyles.panelTitle}>
                <TbSparkles style={{ color: "#42a5f5" }} /> AI Suggestion
              </div>
              <button className={pageStyles.panelIconBtn} onClick={() => dispatch(postQuesToAi({
                explanation: currentQuestion?.answer.explanation,
                question: currentQuestion?.questionContent.question,
                answer: currentQuestion?.questionType === "True/False" ? currentQuestion?.answer.trueFalse.toString() : "Answer"
              }))} disabled={loading || !showExplanation}>
                <TbRefresh />
              </button>
            </div>
            <div className={pageStyles.panelBody}>
              {loading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "20px 0" }}>
                  <Spin spinning tip="Generating..." />
                </div>
              ) : showExplanation ? (
                <div className={pageStyles.aiContent}>
                  <TbSparkles style={{ color: "#42a5f5", marginRight: "5px" }} />
                  {renderHtml(aiSuggestions)}
                </div>
              ) : (
                <div className={pageStyles.emptyState}>
                  <div className={`${pageStyles.emptyIcon} ${pageStyles.blue}`}><TbRobot /></div>
                  <div className={pageStyles.emptyText}>Select and submit your answer to see AI suggestions</div>
                </div>
              )}
            </div>
          </div>



          <div className={pageStyles.panelCard}>
            <div className={pageStyles.panelHeader}>
              <div className={pageStyles.panelTitle}>
                <TbListCheck style={{ color: "#8e24aa" }} /> Question Navigator
              </div>
            </div>
            <div className={pageStyles.panelBody} style={{ display: 'flex', flexDirection: 'column' }}>
              <div className={pageStyles.dotsRow}>
                {questions.map((_, idx) => {
                  let cls = pageStyles.dot;
                  if (idx === currentQuestionIndex) cls += ` ${pageStyles.current}`;
                  
                  const responseData = userResponse?.find(r => r.questionId === questions[idx]._id);
                  if (responseData) {
                    if (responseData.isCorrect) cls += ` ${pageStyles.answeredCorrect}`;
                    else cls += ` ${pageStyles.answeredWrong}`;
                  }
                  
                  return (
                    <div key={idx} className={cls} onClick={() => {
                      setCurrentQuestionIndex(idx);
                    }}>
                      {idx + 1}
                    </div>
                  );
                })}
              </div>
              <div className={pageStyles.navLegend}>
                <div className={pageStyles.legendItem}>
                  <div className={`${pageStyles.legendDot} ${pageStyles.dotCurrent}`}></div>
                  <span>Current</span>
                </div>
                <div className={pageStyles.legendItem}>
                  <div className={`${pageStyles.legendDot} ${pageStyles.dotAnswered}`}></div>
                  <span>Answered</span>
                </div>
                <div className={pageStyles.legendItem}>
                  <div className={`${pageStyles.legendDot} ${pageStyles.dotIncorrect}`}></div>
                  <span>Incorrect</span>
                </div>
                <div className={pageStyles.legendItem}>
                  <div className={`${pageStyles.legendDot} ${pageStyles.dotUnanswered}`}></div>
                  <span>Unanswered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={showEndModal}
        footer={null}
        closable={false}
        centered
        width={400}
        wrapClassName={pageStyles.endTestModal}
      >
        <div className={pageStyles.modalIconWrap}>
          <TbAlertTriangle />
        </div>
        <div className={pageStyles.modalTitle}>
          Are you sure you want to quit this test?
        </div>
        <div className={pageStyles.modalDesc}>
          You still have <strong>{questions.length - (userResponse?.length || 0)}</strong> unanswered question(s). 
          Your progress for this test will not be saved if you have not attempted all questions.
        </div>
        <div className={pageStyles.modalStats}>
          <div className={`${pageStyles.statBox} ${pageStyles.answered}`}>
            <div className={pageStyles.statNum}>{userResponse?.length || 0}</div>
            <div className={pageStyles.statLabel}>Answered</div>
          </div>
          <div className={`${pageStyles.statBox} ${pageStyles.unanswered}`}>
            <div className={pageStyles.statNum}>{questions.length - (userResponse?.length || 0)}</div>
            <div className={pageStyles.statLabel}>Unanswered</div>
          </div>
          <div className={`${pageStyles.statBox} ${pageStyles.marked}`}>
            <div className={pageStyles.statNum}>{calculatedScore}</div>
            <div className={pageStyles.statLabel}>Score</div>
          </div>
        </div>
        <div className={pageStyles.modalActions}>
          <button className={pageStyles.cancelBtn} onClick={() => setShowEndModal(false)}>
            <TbCircleX /> No, Go Back
          </button>
          <button className={pageStyles.confirmBtn} onClick={() => {
            handleTestCompletion(true);
            router.replace("/student/practice-new/nontechnical");
          }}>
            <TbCircleCheck /> Yes, Quit Test
          </button>
        </div>
      </Modal>

      <Modal
        open={showFinishModal}
        footer={null}
        closable={false}
        centered
        width={400}
        wrapClassName={pageStyles.endTestModal}
      >
        <div className={pageStyles.modalIconWrap} style={{ backgroundColor: '#e8f5e9', color: '#24A058' }}>
          <TbCircleCheck />
        </div>
        <div className={pageStyles.modalTitle}>
          Are you sure you want to submit this test?
        </div>
        <div className={pageStyles.modalDesc}>
          You have answered <strong>{userResponse?.length || 0}</strong> out of <strong>{questions.length}</strong> questions. Once submitted, you cannot change your answers.
        </div>
        <div className={pageStyles.modalStats}>
          <div className={`${pageStyles.statBox} ${pageStyles.answered}`}>
            <div className={pageStyles.statNum}>{userResponse?.length || 0}</div>
            <div className={pageStyles.statLabel}>Answered</div>
          </div>
          <div className={`${pageStyles.statBox} ${pageStyles.unanswered}`}>
            <div className={pageStyles.statNum}>{questions.length - (userResponse?.length || 0)}</div>
            <div className={pageStyles.statLabel}>Unanswered</div>
          </div>
          <div className={`${pageStyles.statBox} ${pageStyles.marked}`}>
            <div className={pageStyles.statNum}>{calculatedScore}</div>
            <div className={pageStyles.statLabel}>Score</div>
          </div>
        </div>
        <div className={pageStyles.modalActions}>
          <button className={pageStyles.cancelBtn} onClick={() => setShowFinishModal(false)}>
            <TbCircleX /> No, Go Back
          </button>
          <button className={pageStyles.confirmBtn} style={{ backgroundColor: '#24A058', borderColor: '#24A058' }} onClick={() => {
            setShowFinishModal(false);
            handleTestCompletion(false);
          }}>
            <TbCircleCheck /> Yes, Submit Test
          </button>
        </div>
      </Modal>

    </div>

  );
}
