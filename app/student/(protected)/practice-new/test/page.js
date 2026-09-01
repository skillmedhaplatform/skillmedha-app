"use client";

import React, { useState, useEffect, useMemo } from "react";
import pageStyles from "./testui.module.scss";
import { Button, Divider, Spin, Input, Result, message, Modal } from "antd";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { 
  TbClock, TbDoorExit, TbArrowLeft, TbArrowRight, TbListCheck, 
  TbPlayerSkipForward, TbSend, TbTrophy, TbSparkles, TbRefresh, 
  TbRobot, TbBulb, TbCircleCheck, TbCircleX, TbAlertTriangle, TbFileText, TbTarget, TbCheck
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
import { getStudentPracResults, fetchPracQuestions, savePracResults } from "@/redux/slices/practiceSlice";
import useResponsive from "@/hooks/useResponsive";
import MobileQuestionPlayer from "@/mobile_views/practice/MobileQuestionPlayer";
import DeviceBlocker from "@/modules/student/components/DeviceBlocker";
import { changeCollapse } from "@/redux/slices/sidebar";

const getTrueFalseAnswer = (question) => {
  if (!question || !question.answer) return null;
  if (question.answer.trueFalse !== undefined) {
    return String(question.answer.trueFalse).toLowerCase();
  } else if (question.answer.truefalse !== undefined) {
    return String(question.answer.truefalse).toLowerCase();
  }
  if (question.answer.singleChoice) {
    const correctKey = Object.keys(question.answer.singleChoice).find(k => question.answer.singleChoice[k] === true);
    if (correctKey && question.questionContent && question.questionContent[correctKey]) {
      return String(question.questionContent[correctKey]).toLowerCase();
    }
  }
  return null;
};

const { TextArea } = Input;

export default function TestPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentCreds = useSelector((state) => state.student.student?.data);
  const subjectId = searchParams.get("sub");
  const topicIdRaw = searchParams.get("top") || searchParams.get("t");
  const topicId = topicIdRaw === "null" || topicIdRaw === "undefined" ? null : topicIdRaw;
  const subTopicIdRaw = searchParams.get("subT");
  const subTopicId = subTopicIdRaw === "null" || subTopicIdRaw === "undefined" ? null : subTopicIdRaw;

  const pracQuestions = useSelector(
    (s) => s.practice.pracQuestions?.questionsData || []
  );

  const questions = useMemo(() => {
    if (pracQuestions.length === 0) return [];
    
    // Attempt to restore question order from a previous session
    let finalQuestions = [...pracQuestions];
    try {
      if (typeof window !== 'undefined') {
        const refId = subTopicId || subjectId;
        if (refId) {
          const savedState = localStorage.getItem(`practice_resume_${refId}`);
          if (savedState) {
            const parsed = JSON.parse(savedState);
            if (parsed.questionOrder && parsed.questionOrder.length > 0) {
              const orderedList = [];
              const questionMap = {};
              finalQuestions.forEach(q => questionMap[q._id] = q);
              
              parsed.questionOrder.forEach(id => {
                if (questionMap[id]) {
                  orderedList.push(questionMap[id]);
                  delete questionMap[id];
                }
              });
              
              Object.values(questionMap).forEach(q => orderedList.push(q));
              finalQuestions = orderedList;
            }
          }
        }
      }
    } catch (e) {}
    
    return finalQuestions;
  }, [pracQuestions, subTopicId, subjectId]);

  const testTitle = searchParams.get("title") || searchParams.get("t");
  const subjectTitle = searchParams.get("subjectTitle") || "";
  const subjectType = searchParams.get("type") || "Technical";
  const difficulty = searchParams.get("diff");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [userSelectedAns, setUserSelectedAns] = useState("");
  const [showExplanation, setShowExplanation] = useState(false);
  const [isLastQuestion, setIsLastQuestion] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);
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
           dispatch(changeCollapse(false));
           if (studentCreds?._id) {
             dispatch(getStudentPracResults(studentCreds._id));
           }
           localStorage.removeItem(`practice_test_${pracId}`);
           const refId = subTopicId || topicId || subjectId;
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
           dispatch(changeCollapse(false));
           if (studentCreds?._id) {
             dispatch(getStudentPracResults(studentCreds._id));
           }
           localStorage.removeItem(`practice_test_${pracId}`);
           const refId = subTopicId || topicId || subjectId;
           localStorage.removeItem(`practice_resume_${refId}`);
        });
      }
    }
  };

  useEffect(() => {
    dispatch(changeCollapse(true));
    const refId = subTopicId || topicId || subjectId;
    const fetchType = subTopicId ? "subTopicId" : topicId ? "topicId" : "subjectId";
    
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
          difficulty: difficulty,
        })
      ).then(() => {
        setActiveRefId(refId);
      });
    }
  }, [subTopicId, topicId, subjectId, difficulty, dispatch, studentCreds?._id]);

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
          setIsTimeUp(true);
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
    if (!questionContent) return options;
    Object.keys(questionContent).forEach((key) => {
      if (key.startsWith("option ")) {
        options.push({
          id: key,
          text: String(questionContent[key]).replace(/^"|"$/g, ""),
        });
      }
    });
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
        (key) => 
          question.answer.multipleChoice[key] === true || 
          question.answer.multipleChoice[key] === "true"
      );
      const userAnswerArray = Array.isArray(userAnswer) ? userAnswer : [];
      return (
        correctAnswers.length === userAnswerArray.length &&
        correctAnswers.every((answer) => userAnswerArray.includes(answer))
      );
    } else if (question.questionType === "True/False") {
      const correctAns = getTrueFalseAnswer(question);
      return correctAns !== null && String(userAnswer).toLowerCase() === correctAns;
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
      correctAnswer = getTrueFalseAnswer(currentQuestion) === "true";
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
      const correctAnswer = getTrueFalseAnswer(currentQuestion);
      const currentUserSelection = selectedAnswers[questionId];
      if (String(currentUserSelection).toLowerCase() === String(value).toLowerCase() && isCorrect) {
        return `${pageStyles.selectedOption} ${pageStyles.correctAns}`;
      } else if (String(currentUserSelection).toLowerCase() === String(value).toLowerCase() && !isCorrect) {
        return `${pageStyles.selectedOption} ${pageStyles.wrongAns}`;
      }
      if (String(correctAnswer).toLowerCase() === String(value).toLowerCase()) {
        return `${pageStyles.correctAns}`;
      }
    } else {
      return String(userSelectedAns).toLowerCase() === String(value).toLowerCase() ? pageStyles.selectedOption : "";
    }
    return "";
  };

  const renderQuestionContent = () => {
    const questionId = currentQuestion?._id;
    if (currentQuestion?.questionType === "True/False") {
      return (
        <div className={pageStyles.questionCont}>
          <div
            className={pageStyles.qText}
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
          <div className={pageStyles.qText} dangerouslySetInnerHTML={{ __html: parseIfJson(currentQuestion?.questionContent.question) }}></div>
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
              onClick={() => router.replace(`/student/practice-new/${subjectType?.toLowerCase() === "technical" ? "technical" : "nontechnical"}`)}
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

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100%', backgroundColor: '#f8fafc', padding: '20px', position: 'relative', overflow: 'hidden' }}>
        
        {/* Decorative elements */}
        <div style={{ position: 'absolute', top: '10%', left: '20%', width: '6px', height: '6px', background: '#3b82f6', borderRadius: '50%', transform: 'rotate(45deg)' }}></div>
        <div style={{ position: 'absolute', top: '25%', right: '20%', width: '8px', height: '8px', background: '#ef4444', borderRadius: '2px', transform: 'rotate(15deg)' }}></div>
        <div style={{ position: 'absolute', top: '40%', left: '15%', width: '8px', height: '8px', background: '#eab308', borderRadius: '2px', transform: 'rotate(-20deg)' }}></div>
        <div style={{ position: 'absolute', top: '15%', left: '60%', width: '6px', height: '6px', background: '#22c55e', borderRadius: '2px', transform: 'rotate(45deg)' }}></div>
        <div style={{ position: 'absolute', bottom: '30%', right: '15%', width: '8px', height: '8px', background: '#a855f7', borderRadius: '2px', transform: 'rotate(30deg)' }}></div>
        
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '600px', width: '100%' }}>
          {/* Checkmark Circle */}
          <div style={{ margin: '0 auto 32px', width: '80px', height: '80px', borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 12px rgba(220, 252, 231, 0.6), 0 0 0 24px rgba(240, 253, 244, 0.4)' }}>
            <TbCheck size={40} color="#fff" strokeWidth={3.5} />
          </div>

          <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#0f172a', marginBottom: '8px', border: 'none', paddingBottom: 0 }}>{testTitle || subjectTitle || "Quiz"} Completed!</h1>
          <p style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', marginBottom: '32px' }}>
            Your Final Score: <span style={{ color: '#22c55e' }}>{calculatedScore} / {totalPossibleScore}</span>
          </p>

          {/* Stats Card */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px 16px', display: 'flex', justifyContent: 'space-between', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)', width: '100%', marginBottom: '32px', border: '1px solid #f1f5f9' }}>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#3b82f6', lineHeight: 1.2 }}>{totalQ}</div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Total</div>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                <TbFileText size={20} />
              </div>
            </div>
            <div style={{ width: '1px', background: '#f1f5f9', margin: '0 8px' }}></div>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#22c55e', lineHeight: 1.2 }}>{attempted}</div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Answered</div>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f0fdf4', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                <TbCircleCheck size={20} />
              </div>
            </div>
            <div style={{ width: '1px', background: '#f1f5f9', margin: '0 8px' }}></div>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#ef4444', lineHeight: 1.2 }}>{unattempted}</div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Skipped</div>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                <TbPlayerSkipForward size={20} />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button 
              type="primary" 
              onClick={() => router.replace(`/student/practice-new/${subjectType?.toLowerCase() === "technical" ? "technical" : "nontechnical"}`)}
              style={{ background: 'linear-gradient(to right, #22c55e, #16a34a)', border: 'none', height: '52px', borderRadius: '12px', padding: '0 24px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', fontWeight: 600, minWidth: '180px', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TbTarget size={22} /> Practice
              </div>
              <TbArrowRight size={20} opacity={0.8} />
            </Button>
            <Button 
              onClick={() => window.location.reload()}
              style={{ background: '#fff', border: '1px solid #22c55e', color: '#16a34a', height: '52px', borderRadius: '12px', padding: '0 24px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', fontWeight: 600, minWidth: '180px', justifyContent: 'space-between', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TbRefresh size={22} /> Re-attempt
              </div>
              <TbArrowRight size={20} opacity={0.6} />
            </Button>
          </div>

          {/* Footer Text */}
          <div style={{ marginTop: '48px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f0fdf4', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <TbSparkles size={18} />
            </div>
            Keep practicing! <span style={{ color: '#16a34a', fontWeight: 600 }}>You're getting better every day.</span>
          </div>
        </div>
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

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
            <div className={pageStyles.questionCard} style={{ flex: '1 0 auto', overflow: 'visible' }}>
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
            </div>
            
            <div className={pageStyles.panelCard} style={{ flex: '1 0 auto', border: '2px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
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

          <div className={pageStyles.panelCard} style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div className={pageStyles.panelHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className={pageStyles.panelTitle}>
                Asked in
              </div>
              <span className="text-xs text-slate-400 font-medium">{currentQuestion?.companyTags?.length || 0} times</span>
            </div>
            <div className={pageStyles.panelBody} style={{ padding: '12px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
              {!currentQuestion?.companyTags || currentQuestion.companyTags.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs text-center py-4">
                  <TbAlertTriangle size={24} className="mb-2 opacity-30" />
                  Not asked in any exams yet
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {currentQuestion.companyTags.map((tag, idx) => {
                    const colors = [
                      { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
                      { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' },
                      { bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-100' },
                      { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
                      { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' },
                    ];
                    const color = colors[idx % colors.length];
                    return (
                      <div key={idx} className="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200 shadow-sm transition-all hover:shadow-md hover:border-slate-300">
                        <div className="flex justify-between items-start">
                          <div className="font-bold text-slate-800 text-[13px]">{tag.companyName || 'Unknown Company'}</div>
                          {tag.year && <div className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full whitespace-nowrap">{tag.year}</div>}
                        </div>
                        {tag.examName && <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5"><TbFileText size={12}/> <span className="truncate">{tag.examName}</span></div>}
                        {tag.sectionName && <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5"><TbListCheck size={12}/> <span className="truncate">{tag.sectionName}</span></div>}
                      </div>
                    );
                  })}
                  {currentQuestion.companyTags.length > 3 && (
                    <button className="mt-2 w-full py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 hover:border-slate-300 rounded-lg transition-all shadow-sm">
                      View all {currentQuestion.companyTags.length} appearances
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>



          <div className={pageStyles.panelCard} style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div className={pageStyles.panelHeader}>
              <div className={pageStyles.panelTitle}>
                <TbListCheck style={{ color: "#8e24aa" }} /> Question Navigator
              </div>
            </div>
            <div className={pageStyles.panelBody} style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', flex: 1 }}>
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
        closable={!isTimeUp}
        maskClosable={!isTimeUp}
        centered
        width={400}
        wrapClassName={pageStyles.endTestModal}
      >
        <div className={pageStyles.modalIconWrap} style={isTimeUp ? { backgroundColor: '#fee2e2', color: '#ef4444' } : {}}>
          <TbAlertTriangle />
        </div>
        <div className={pageStyles.modalTitle}>
          {isTimeUp ? "Time is up!" : "Are you sure you want to quit this test?"}
        </div>
        <div className={pageStyles.modalDesc}>
          {isTimeUp ? (
            <>Your time has expired. Please submit your test to save your progress.</>
          ) : (
            <>
              You still have <strong>{questions.length - (userResponse?.length || 0)}</strong> unanswered question(s). 
              Your progress for this test will not be saved if you have not attempted all questions.
            </>
          )}
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
          {!isTimeUp && (
            <button className={pageStyles.cancelBtn} onClick={() => setShowEndModal(false)}>
              <TbCircleX /> No, Go Back
            </button>
          )}
          <button className={pageStyles.confirmBtn} style={isTimeUp ? { width: '100%' } : {}} onClick={() => {
            handleTestCompletion(true);
          }}>
            <TbCircleCheck /> {isTimeUp ? "Submit Test" : "Yes, End Test"}
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
