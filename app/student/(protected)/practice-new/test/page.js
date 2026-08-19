"use client";

import React, { useState, useEffect, useMemo } from "react";
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
import DeviceBlocker from "@/modules/student/components/DeviceBlocker";

const { TextArea } = Input;

export default function TestPage() {
  const studentCreds = useSelector((state) => state.student.student?.data);
  const pracQuestions = useSelector(
    (s) => s.practice.pracQuestions?.questionsData || []
  );
  const questions = useMemo(() => {
    if (pracQuestions.length === 0) return [];
    
    // Attempt to restore question order from a previous session
    let finalQuestions = [...pracQuestions];
    try {
      if (typeof window !== 'undefined') {
        const refId = new URLSearchParams(window.location.search).get('subT') || new URLSearchParams(window.location.search).get('sub');
        if (refId) {
          const savedState = localStorage.getItem(`practice_resume_${refId}`);
          if (savedState) {
            const parsed = JSON.parse(savedState);
            if (parsed.questionOrder && parsed.questionOrder.length === finalQuestions.length) {
              const orderMap = {};
              parsed.questionOrder.forEach((id, idx) => orderMap[id] = idx);
              finalQuestions.sort((a, b) => orderMap[a._id] - orderMap[b._id]);
            }
          }
        }
      }
    } catch (e) {}
    
    return finalQuestions;
  }, [pracQuestions]);
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
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showSubmitBtn, setShowSubmitBtn] = useState(false);
  const [activeRefId, setActiveRefId] = useState(null);
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
    
    // Always show result page, even if quit or unfinished
    setTestCompleted(true);
    setShowEndModal(false);
    setShowFinishModal(false);
    
    // Only save if not quitting prematurely, or if you want to save partial tests, 
    // the user requested to NOT count progress if they left without attempting all given questions.
    if (pracId) {
      if (!isQuit && attemptedAll) {
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
        })).then(() => {
           localStorage.removeItem(`practice_test_${pracId}`);
           const refId = subTopicId || subjectId;
           localStorage.removeItem(`practice_resume_${refId}`);
           if (correctQuestionIds.length === questions.length && questions.length > 0) {
             localStorage.setItem("showLevelUpPopup", "true");
           }
        });
      } else {
        // Discard the unfinished session from DB since they explicitly submitted or quit early
        dispatch(savePracResults({
          pracId,
          payload: { discard: true }
        })).then(() => {
           localStorage.removeItem(`practice_test_${pracId}`);
           const refId = subTopicId || subjectId;
           localStorage.removeItem(`practice_resume_${refId}`);
        });
      }
    }
  };

  useEffect(() => {
    const refId = subTopicId || subjectId;
    const fetchType = subTopicId ? "subTopicId" : "subjectId";
    
    if (refId) {
      setActiveRefId(null);
      dispatch(resetUserResponse()); // clear old answers
      
      // We don't restore here because questions aren't loaded yet.
      
      dispatch(
        fetchPracQuestions({
          refId: refId,
          type: fetchType,
          subjectId: subjectId,
          userId: studentCreds?._id,
        })
      ).then(() => {
        setActiveRefId(refId);
      });
    }
  }, [subTopicId, subjectId, dispatch, studentCreds?._id]);

  // RESTORE STATE
  useEffect(() => {
    if (activeRefId && questions.length > 0) {
      const storageKey = `practice_resume_${activeRefId}`;
      const savedState = localStorage.getItem(storageKey);
      
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          if (parsed && parsed.userResponse && parsed.userResponse.length > 0) {
            // Restore Redux state
            parsed.userResponse.forEach(ur => {
              // Only dispatch if not already in state to avoid infinite loops
              dispatch(saveUserResponse(ur));
            });
            
            // Restore local component states
            if (parsed.currentQuestionIndex !== undefined) setCurrentQuestionIndex(parsed.currentQuestionIndex);
            if (parsed.selectedAnswers) setSelectedAnswers(parsed.selectedAnswers);
            if (parsed.tempSelectedAnswers) setTempSelectedAnswers(parsed.tempSelectedAnswers);
            if (parsed.textAnswers) setTextAnswers(parsed.textAnswers);
            if (parsed.timeLeft) setTimeLeft(parsed.timeLeft);
          }
        } catch (e) {
          console.error("Failed to parse resume state", e);
        }
      }
    }
  }, [questions.length, activeRefId, dispatch]);

  // SAVE STATE
  useEffect(() => {
    if (activeRefId && questions.length > 0 && userResponse.length > 0 && !testCompleted) {
      const storageKey = `practice_resume_${activeRefId}`;
      localStorage.setItem(storageKey, JSON.stringify({
        userResponse,
        currentQuestionIndex,
        selectedAnswers,
        tempSelectedAnswers,
        textAnswers,
        timeLeft,
        questionOrder: questions.map(q => q._id)
      }));
    }
  }, [userResponse, currentQuestionIndex, selectedAnswers, tempSelectedAnswers, textAnswers, timeLeft, questions.length, testCompleted, activeRefId]);

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

  const currentQuestionOptions = useMemo(() => {
    const options = getQuestionOptions(currentQuestion?.questionContent);
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    return options;
  }, [currentQuestion?._id, currentQuestion?.questionContent]);

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
    // AI Suggestions temporarily disabled per request
    // dispatch(
    //   postQuesToAi({
    //     explanation: currentQuestion?.answer.explanation,
    //     question: currentQuestion?.questionContent.question,
    //     answer: correctOptionText,
    //   })
    // ).finally(() => {
    //   setLoading(false);
    // });
    setTimeout(() => setLoading(false), 300);
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
                <div className={`${pageStyles.optLetter} ${currentQuestion?.questionType === "Single Choice" ? pageStyles.circleBtn : pageStyles.squareBtn}`}>
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

  if (activeRefId && !loading && questions.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100%', backgroundColor: '#f1f5f9', padding: '20px' }}>
        <Result
          status="404"
          title={<span style={{ fontSize: '24px', fontWeight: 600, color: '#1f2937' }}>No Questions Available</span>}
          subTitle="Sorry, there are currently no questions available for this practice topic."
          extra={[
            <Button
              type="primary"
              onClick={() => router.replace(`/student/practice-new/${subjectType === "Technical" ? "technical" : "nontechnical"}`)}
              key="back"
              size="large"
              style={{ backgroundColor: '#1E69DA', borderColor: '#1E69DA' }}
            >
              Back to Practice
            </Button>
          ]}
        />
      </div>
    );
  }

  if (isMobile && currentQuestion && !testCompleted) {
    return (
      <DeviceBlocker returnPath="back" returnText="Return to Practice">
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
      </DeviceBlocker>
    );
  }

  if (testCompleted) {
    const totalQ = questions.length;
    const attempted = userResponse.length;
    const unattempted = totalQ - attempted;
    const totalPossibleScore = questions.reduce((acc, q) => acc + (q.scoreSettings?.pointsForCorrectAns || 1), 0);
    const scorePercentage = totalPossibleScore > 0 ? (calculatedScore / totalPossibleScore) * 100 : 0;
    const isPerfect = scorePercentage === 100;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100%', backgroundColor: '#f1f5f9', padding: '20px' }}>
        <Result
          status="success"
          title={<span style={{ fontSize: '28px', fontWeight: 600, color: '#1f2937' }}>Quiz Completed!</span>}
          subTitle={
            <div style={{ marginTop: '12px', width: '100%', maxWidth: '400px', margin: '0 auto' }}>
              <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#24A058', margin: 0 }}>
                Your Final Score: {calculatedScore} / {totalPossibleScore}
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '24px 0', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '16px 0' }}>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#3b82f6' }}>{totalQ}</div>
                  <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total</div>
                </div>
                <div style={{ width: '1px', background: '#e2e8f0' }}></div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#24A058' }}>{attempted}</div>
                  <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Answered</div>
                </div>
                <div style={{ width: '1px', background: '#e2e8f0' }}></div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#d9363e' }}>{unattempted}</div>
                  <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Skipped</div>
                </div>
              </div>
            </div>
          }
          extra={[
            <Button
              type="primary"
              onClick={() => router.replace(`/student/practice-new/${subjectType === "Technical" ? "technical" : "nontechnical"}`)}
              key="restart"
              size="large"
              style={{ backgroundColor: '#24A058', borderColor: '#24A058', minWidth: '120px' }}
            >
              Practice
            </Button>,
            <Button
              type="default"
              onClick={() => window.location.reload()}
              key="reattempt"
              size="large"
              style={{ minWidth: '120px' }}
            >
              Re-attempt
            </Button>,
            isPerfect && (
              <Button
                type="primary"
                onClick={() => setShowBadgeModal(true)}
                key="collect"
                size="large"
                style={{ backgroundColor: '#eab308', borderColor: '#eab308', color: '#fff', minWidth: '120px' }}
              >
                <TbSparkles style={{ marginRight: '6px' }} /> Collect Badge
              </Button>
            )
          ]}
        >
          {!isPerfect && (
            <div style={{ marginTop: '40px', maxWidth: '500px', margin: '40px auto 0', textAlign: 'left' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '14px', color: '#475569' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ color: '#2563eb', padding: '6px 0' }}>
                    <TbTrophy size={26} />
                  </div>
                  <div>
                    <strong style={{ display: 'block', color: '#1e293b', marginBottom: '4px', fontSize: '16px' }}>Flawless Badge</strong>
                    <span style={{ lineHeight: 1.5, display: 'block' }}>Get every single question right in one attempt to earn this badge.</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ color: '#db2777', padding: '6px 0' }}>
                    <TbClock size={26} />
                  </div>
                  <div>
                    <strong style={{ display: 'block', color: '#1e293b', marginBottom: '4px', fontSize: '16px' }}>Recall Badge</strong>
                    <span style={{ lineHeight: 1.5, display: 'block' }}>Retake this topic after 24 hours and score 100% again to prove your memory.</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Result>

        <Modal
          open={showBadgeModal}
          onCancel={() => setShowBadgeModal(false)}
          footer={null}
          closeIcon={<TbCircleX size={24} color="#9ca3af" />}
          width={400}
          centered
          bodyStyle={{ padding: 0, borderRadius: '16px', overflow: 'hidden' }}
        >
          <div style={{ background: 'linear-gradient(180deg, #f0f9ff 0%, #ffffff 100%)', padding: '40px 24px 24px', textAlign: 'center' }}>
            <div style={{ display: 'inline-block', position: 'relative', marginBottom: '24px' }}>
              <div style={{ background: '#3b82f6', borderRadius: '50%', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5)' }}>
                <TbTrophy size={64} color="#fef08a" />
              </div>
              <div style={{ position: 'absolute', bottom: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#2563eb', color: 'white', padding: '4px 16px', borderRadius: '20px', fontWeight: 'bold', fontSize: '12px', letterSpacing: '1px', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.4)' }}>
                FLAWLESS
              </div>
            </div>
            
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', margin: '0 0 12px 0' }}>Congratulations! 🎉</h2>
            <p style={{ color: '#475569', fontSize: '14px', lineHeight: 1.6, margin: '0 0 24px 0' }}>
              You've achieved a perfect score! Your dedication and focus have earned you the <strong>Flawless Badge</strong>.
            </p>
            
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', textAlign: 'left', marginBottom: '24px' }}>
              <div style={{ flex: 1 }}>
                <strong style={{ display: 'block', color: '#1e293b', fontSize: '14px', marginBottom: '4px' }}>Flawless Badge Unlocked</strong>
                <span style={{ color: '#64748b', fontSize: '12px', lineHeight: 1.4, display: 'block' }}>Awarded for getting every question right in one attempt.</span>
              </div>
              <div style={{ background: '#dbeafe', color: '#2563eb', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <TbTrophy size={24} />
              </div>
            </div>
            
            <Button 
              type="primary" 
              size="large" 
              block 
              style={{ height: '48px', fontSize: '16px', fontWeight: 600, backgroundColor: '#22c55e', borderColor: '#22c55e' }}
              onClick={() => {
                localStorage.setItem('autoOpenBadgeModal', subjectType === 'Technical' ? 'Technical' : 'Non-Technical');
                
                // Add a notice for the Notice Board
                const notices = JSON.parse(localStorage.getItem('pendingPracticeNotices') || '[]');
                notices.push({
                  id: `badge_notice_${Date.now()}`,
                  type: 'badge',
                  title: `🏆 Flawless Badge: ${subjectTitle || "General"} - ${testTitle || "Test"}`,
                  message: `You earned this badge by scoring 100% on ${testTitle || "Test"}.`,
                  actionUrl: `#openBadges_${subjectType === 'Technical' ? 'Technical' : 'Non-Technical'}`,
                  actionText: 'Checkout'
                });
                localStorage.setItem('pendingPracticeNotices', JSON.stringify(notices));
                // ACTUALLY AWARD THE BADGE
                const userId = studentCreds?._id || "";
                const claimedKey = `claimedAchievements_${userId}`;
                const unseenKey = `unseenPracticeBadges_${userId}`;
                
                const badgeId = `practice_badge|${subjectType}|${subjectTitle || "General"}|${testTitle || "Test"}|Flawless|1`;
                const claimed = JSON.parse(localStorage.getItem(claimedKey) || "[]");
                if (!claimed.includes(badgeId)) {
                  claimed.push(badgeId);
                  localStorage.setItem(claimedKey, JSON.stringify(claimed));
                  
                  // Mark as NEW
                  const unseen = JSON.parse(localStorage.getItem(unseenKey) || "[]");
                  if (!unseen.includes(badgeId)) {
                    unseen.push(badgeId);
                    localStorage.setItem(unseenKey, JSON.stringify(unseen));
                  }
                }

                router.push("/student/dashboard");
              }}
            >
              View in Achievements
            </Button>
          </div>
        </Modal>
      </div>
    );
  }
  return (
    <DeviceBlocker returnPath="back" returnText="Return to Practice">
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
          <button className={pageStyles.quitBtn} onClick={() => userResponse.length === questions.length ? setShowFinishModal(true) : setShowEndModal(true)}>
            <TbDoorExit /> {userResponse.length === questions.length ? "Submit Test" : "Quit Test"}
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
              <div className={`${pageStyles.navArrow} ${isLastQuestionIndex ? pageStyles.disabled : ""}`} onClick={() => isLastQuestionIndex ? null : handleNext()}>
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
                  <TbArrowRight /> {isLastQuestionIndex ? "Finish Test" : "Next Question"}
                </button>
              )}
            </div>
            <div className={pageStyles.panelCard} style={{ marginTop: '32px', flex: 'none', border: '2px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
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
              <button className={pageStyles.panelIconBtn} onClick={() => {}} disabled={true}>
                <TbRefresh />
              </button>
            </div>
            <div className={pageStyles.panelBody}>
              {loading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "20px 0" }}>
                  <Spin spinning tip="Loading..." />
                </div>
              ) : (
                <div className={pageStyles.emptyState} style={{ height: '100%', justifyContent: 'center' }}>
                  <div className={`${pageStyles.emptyIcon} ${pageStyles.blue}`}><TbRobot /></div>
                  <div className={pageStyles.emptyText} style={{ margin: '0 auto', fontSize: '14px', fontWeight: '500' }}>✨ This feature is available soon!</div>
                </div>
              )}
            </div>
          </div>



          <div className={pageStyles.panelCard} style={{ flex: 'none' }}>
            <div className={pageStyles.panelHeader}>
              <div className={pageStyles.panelTitle}>
                <TbListCheck style={{ color: "#8e24aa" }} /> Question Navigator
              </div>
            </div>
            <div className={pageStyles.panelBody} style={{ display: 'flex', flexDirection: 'column', overflowY: 'visible' }}>
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
          }}>
            <TbCircleCheck /> Yes, End Test
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
    </DeviceBlocker>
  );
}
