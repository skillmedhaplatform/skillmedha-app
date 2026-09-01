"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Button, message, Popover } from "antd";
import { fetchTestData } from "@/redux/slices/assessmentsSlice/testSlice";
import { getLstorage } from "@/universalUtils/windowMW";
import { parseIfJson } from "../reusable_comp/jsonparse";
import useResponsive from "@/hooks/useResponsive";
import { HelpCircle, Clock, Star, Play } from 'lucide-react';

const formatTimeDiff = (timeDifference) => {
  const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor(
    (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
  );
  const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
};

const pad = (num) => String(num).padStart(2, "0");

export default function TestCard({
  isAssessment = false,
  testData,
  navigateToTest,
  index,
  isResultTab = false,
}) {
  const testDuration = testData?.time?.testDuration?.testDuration?.duration;

  const studentCreds = useSelector((state) => state.student.student?.data);

  const dispatch = useDispatch();
  const nav = useRouter();

  const [totalMarks, setTotalMarks] = useState(0);
  const [countdowns, setCountdowns] = useState({});

  const [isTestActivated, setIsTestActivated] = useState(true);
  const [activationCountdown, setActivationCountdown] = useState("");
  const [ques, setQues] = useState([]);

  const studentId = getLstorage("sId");

  // Expiry countdown useEffect
  useEffect(() => {
    const expiryDate =
      testData?.time?.expiryDates?.accessClosingDate ||
      testData?.time?.expiryDates?.testExpirationData;
    const hasExpiry = testData?.time?.expiryDates?.expiry && expiryDate;

    if (!hasExpiry) {
      setCountdowns((prev) => ({ ...prev, [index]: "No expiry set" }));
      return;
    }

    const targetDate = new Date(expiryDate).getTime();

    const updateCountdown = () => {
      const timeDifference = targetDate - new Date().getTime();

      if (timeDifference > 0) {
        let { days, hours, minutes, seconds } = formatTimeDiff(timeDifference);

        const formattedTime =
          days > 0
            ? `${pad(days)}:${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
            : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

        setCountdowns((prev) => ({ ...prev, [index]: formattedTime }));
      } else {
        setCountdowns((prev) => ({ ...prev, [index]: "Expired" }));
      }
    };

    updateCountdown();
    const intervalId = setInterval(updateCountdown, 1000);

    return () => clearInterval(intervalId);
  }, [testData?._id, testData?.time?.expiryDates, index]);

  // Activation time checking useEffect
  useEffect(() => {
    const testActivationDate =
      testData?.time?.testActivationOption?.testActivationMethod
        ?.testActivationDate;

    if (!testActivationDate) {
      setIsTestActivated(true);
      setActivationCountdown("");
      return;
    }

    const activationTime = new Date(testActivationDate).getTime();

    const checkActivation = () => {
      const timeDifference = activationTime - new Date().getTime();

      if (timeDifference > 0) {
        setIsTestActivated(false);
        const { days, hours, minutes, seconds } = formatTimeDiff(timeDifference);

        switch (true) {
          case days > 0:
            setActivationCountdown(`Activates in ${days}d ${hours}h ${minutes}m`);
            break;
          case hours > 0:
            setActivationCountdown(`Activates in ${hours}h ${minutes}m ${seconds}s`);
            break;
          case minutes > 0:
            setActivationCountdown(`Activates in ${minutes}m ${seconds}s`);
            break;
          default:
            setActivationCountdown(`Activates in ${seconds}s`);
            break;
        }
      } else {
        setIsTestActivated(true);
        setActivationCountdown("");
      }
    };

    checkActivation();
    const interval = setInterval(checkActivation, 1000);

    return () => clearInterval(interval);
  }, [testData?._id, testData?.time?.testActivationOption]);

  useEffect(() => {
    const updatedQues = testData?.questions?.reduce((acc, Currques) => {
      if (Currques?.questionType?.includes("Comprehension")) {
        return [...acc, ...(Currques?.questionContentArr || [])];
      }
      return [...acc, Currques];
    }, []) || [];

    setQues(updatedQues);

    const totalMarksArray = updatedQues.map((question) => {
      const {
        pointsForCorrectAns,
        PointsForEachCorrectAnswer,
        bonusPointsForAllCorrect,
      } = question?.scoreSettings || {};

      let score = Number(pointsForCorrectAns) || Number(PointsForEachCorrectAnswer) || 0;

      if (PointsForEachCorrectAnswer && question?.answer?.multipleChoice) {
        const correctOptionsCount = Object.values(
          question?.answer?.multipleChoice
        ).filter(Boolean).length;
        score = correctOptionsCount * PointsForEachCorrectAnswer;
      }

      const bonusPoints = Number(bonusPointsForAllCorrect) || 0;
      return score + bonusPoints;
    });

    const total = totalMarksArray.reduce((acc, curr) => acc + curr, 0);
    setTotalMarks(total);
  }, [testData?._id, testData?.questions]);

  const navigateToResults = () => {
    const showResults = testData?.grading?.showResults;
    if (showResults === "Disable" || !showResults) {
      message.destroy();
      message.info(
        <strong>
          Results are no longer visible as the instructor has stopped sharing
          them.
        </strong>
      );
      return;
    }

    const completedResult = studentCreds?.progress?.filter(
      (e) => e?.testId == testData?._id
    );

    if (completedResult?.length > 0) {
      dispatch(
        fetchTestData({
          testId: completedResult[completedResult.length - 1]?.testId,
        })
      );
    }

    nav.replace(
      "/student/tests/" +
      testData?.title?.split(" ").join("-") +
      "/result?testId=" +
      testData?._id
    );
  };

  const currentGen = testData?.attemptGeneration || 0;
  const progressForTest = studentCreds?.progress?.filter((e) => e?.testId == testData?._id && (e?.attemptGeneration || 0) === currentGen) || [];
  const backendAttemptsDone = progressForTest.length;
  const attemptsDone = backendAttemptsDone;
  
  const latestAttempt = progressForTest[backendAttemptsDone - 1];
  const score = latestAttempt?.scoreData?.finalScore !== undefined ? latestAttempt.scoreData.finalScore : latestAttempt?.score;
  const percentage = totalMarks > 0 && score !== undefined ? Math.round((Number(score) / totalMarks) * 100) : undefined;
  const hasAttempted = attemptsDone > 0;
  const isBlocked = testData?.blockedStudents?.some((student) => studentId == student?._id);
  const noQuestions = !testData?.questions?.length && !testData?.questionIds?.length;

  const attemptsPerRespondentValue = testData?.access?.attemptsPerRespondent;
  const maxAttemptsNum = Number(attemptsPerRespondentValue);
  const isUnlimited =
    attemptsPerRespondentValue === undefined ||
    attemptsPerRespondentValue === null ||
    attemptsPerRespondentValue === "" ||
    maxAttemptsNum === -1 ||
    attemptsPerRespondentValue === "unlimited";

  const attemptsExceeded =
    !isUnlimited && (maxAttemptsNum - attemptsDone <= 0);

  const isExpiredStatus = countdowns[index] === "Expired" || testData?.status?.toLowerCase() === "expired" || testData?.status?.toLowerCase() === "completed";

  let mainButtonText = "Start test";
  let mainButtonColor = undefined;
  let mainButtonTextColor = undefined;
  let isGradient = false;

  switch (true) {
    case attemptsExceeded:
      mainButtonText = "Attempts exceeded";
      mainButtonColor = "#FACE53";
      mainButtonTextColor = "#000000";
      break;
    case hasAttempted:
      mainButtonText = "Continue";
      isGradient = true;
      break;
    case testData?.access?.type === "private":
      mainButtonText = "Enter Code";
      mainButtonColor = "#e74c3c";
      mainButtonTextColor = "#ffffff";
      break;
    default:
      isGradient = true; // For "Start test"
      break;
  }

  const handleStartTestClick = () => {
    switch (true) {
      case attemptsExceeded:
        message.error(<strong>Maximum attempts reached for this test.</strong>);
        break;
      case isExpiredStatus:
        message.error(<strong>The test you are trying to access has expired.</strong>);
        break;
      case !isTestActivated:
        message.warning(
          <strong>
            This test has not been activated yet. Please wait until the activation time.
          </strong>
        );
        break;
      default:
        navigateToTest(testData);
        break;
    }
  };

  const renderMainButton = () => {
    switch (true) {
      case isBlocked:
        return (
          <Button
            onClick={() => message.error(<strong>Your Test has been Blocked</strong>)}
            danger
            type="dashed"
          >
            Blocked
          </Button>
        );
      case noQuestions:
        return (
          <Popover content="This test has no questions." trigger="hover">
            <Button type="primary" disabled>
              No Questions
            </Button>
          </Popover>
        );
      case !isTestActivated:
        return (
          <Popover
            content={`Test will activate on ${new Date(
              testData?.time?.testActivationOption?.testActivationMethod?.testActivationDate
            ).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`}
            trigger="hover"
          >
            <Button type="primary" disabled>
              Not Activated
            </Button>
          </Popover>
        );
      case attemptsExceeded:
        return (
          <Button
            type="primary"
            disabled
            style={{ backgroundColor: "#FACE53", color: "#000000", border: "none" }}
          >
            Attempts exceeded
          </Button>
        );
      default:
        if (isResultTab) {
          return (
            <Button
              type="primary"
              onClick={(e) => {
                e.stopPropagation();
                
                const completedResult = studentCreds?.progress?.filter(
                  (entry) => entry?.testId == testData?._id
                );
                
                if (completedResult?.length > 0) {
                  dispatch(
                    fetchTestData({
                      testId: completedResult[completedResult.length - 1]?.testId,
                    })
                  );
                }
                
                nav.push(
                  "/student/tests/" +
                  testData?.title?.split(" ").join("-") +
                  "/result?testId=" +
                  testData?._id
                );
              }}
              className="font-semibold !bg-white !text-[#1E69DA] !border-[#1E69DA] hover:!bg-[#1E69DA] hover:!text-white transition-all"
            >
              View result
            </Button>
          );
        }
        return (
          <Button
            type="primary"
            onClick={handleStartTestClick}
            disabled={!isTestActivated || isExpiredStatus}
            style={!isGradient && mainButtonColor ? { backgroundColor: mainButtonColor, color: mainButtonTextColor } : {}}
            className={isGradient ? "!bg-gradient-to-br !from-[#1E69DA] !to-[#5694F0] !border-none !text-white flex items-center gap-1 font-semibold rounded-lg px-4" : "font-semibold"}
          >
            {isGradient && <Play className="w-4 h-4" />}
            {mainButtonText}
          </Button>
        );
    }
  };
  const isResponsive = useResponsive(); // < 1024px → mobile layout

  let rawDesc = parseIfJson(parseIfJson(testData?.shortDescription || "")) || "";
  let cleanDesc = String(rawDesc)
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#34;/gi, '"')
    .replace(/<\/(p|div|h[1-6]|li|section|article)>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/^["'\s]+|["'\s]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  let firstSentence = cleanDesc;
  if (firstSentence.includes('.')) {
    firstSentence = firstSentence.split('.')[0] + '.';
  }

  return (
    <section className="group bg-white hover:bg-slate-50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer rounded-2xl border border-slate-200 h-full relative overflow-hidden transform hover:-translate-y-1">
      
      {/* Padded Thumbnail */}
      <div className="w-full h-[160px] relative bg-transparent flex items-center justify-center shrink-0 p-3">
        <div className="w-full h-full relative rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          {testData?.thumbnail ? (
            <img src={testData.thumbnail} alt="thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1E69DA] to-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
              <span className="text-5xl font-extrabold text-white/30 tracking-wider">
                {testData?.title?.substring(0, 2)?.toUpperCase() || "JS"}
              </span>
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>

          {/* Status Badge Overlaid (Top Right) */}
          {!isAssessment && (
            <div className="absolute top-2 right-2 z-10 shadow-sm">
              {isExpiredStatus ? (
                <span className="bg-red-500/90 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-white/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                  Expired
                </span>
              ) : testData?.time?.expiryDates?.expiry ? (
                <span className="bg-black/50 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full border border-white/20 shadow-sm">
                  {countdowns[index]}
                </span>
              ) : (
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-sm border border-white/20 shadow-sm ${
                  testData?.status?.toLowerCase() === "active" ? "bg-emerald-500/90 text-white" : "bg-amber-500/90 text-white"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full bg-white ${testData?.status?.toLowerCase() === "active" ? "animate-pulse" : ""}`}></span>
                  {testData?.status?.charAt(0).toUpperCase() + testData?.status?.slice(1)}
                </span>
              )}
            </div>
          )}

          {/* Tags Overlaid (Bottom Left) */}
          <div className="absolute bottom-2 left-2 flex flex-wrap items-center gap-1.5 z-10">
            {testData?.category?.slice(0, 2).map((cat, i) => (
              <span key={i} className="bg-white/20 backdrop-blur-md text-white border border-white/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                {cat.name}
              </span>
            ))}
            <span className="bg-[#1E69DA]/80 backdrop-blur-md text-white border border-white/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
              All Levels
            </span>
          </div>
        </div>
      </div>

      {/* Body Section */}
      <div className="flex flex-col px-5 pb-5 pt-1 flex-1 w-full relative">
        
        {/* Title & Description */}
        <div className="flex-1 mb-4">
          <h3 className="text-[17px] font-bold text-slate-800 leading-snug line-clamp-2 mb-1.5 group-hover:text-[#1E69DA] transition-colors">
            {isAssessment ? testData?.jobTitle : testData?.title}
          </h3>
          <div className="text-[13px] text-slate-500 leading-relaxed line-clamp-2">
            {firstSentence}
          </div>
        </div>

        {/* Compact Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 bg-slate-100/80 rounded-xl p-2.5 mb-4 border border-slate-200/50">
          <div className="flex flex-col items-center justify-center border-r border-slate-200/80">
            <span className="text-slate-400 text-[9px] uppercase font-bold flex items-center gap-1 mb-0.5">
              <HelpCircle className="w-2.5 h-2.5" /> Qs
            </span>
            <strong className="text-slate-700 text-[13px] font-bold">{testData?.questions?.length || 0}</strong>
          </div>
          <div className={`flex flex-col items-center justify-center ${!isAssessment ? 'border-r border-slate-200/80' : ''}`}>
            <span className="text-slate-400 text-[9px] uppercase font-bold flex items-center gap-1 mb-0.5">
              <Clock className="w-2.5 h-2.5" /> Time
            </span>
            <strong className="text-slate-700 text-[12px] font-bold whitespace-nowrap tracking-tight">
              {isAssessment 
                ? (testData?.testDurationDisplay?.hours || testData?.testDurationDisplay?.minutes ? `${String(testData?.testDurationDisplay?.hours || 0).padStart(2, '0')}H ${String(testData?.testDurationDisplay?.minutes || 0).padStart(2, '0')}M` : "NA")
                : (testDuration && (testDuration.val1 !== undefined || testDuration.val2 !== undefined) ? `${String(testDuration.val1 ?? 0).padStart(2, '0')}H ${String(testDuration.val2 ?? 0).padStart(2, '0')}M` : "NA")}
            </strong>
          </div>
          {!isAssessment && (
            <div className="flex flex-col items-center justify-center">
              <span className="text-slate-400 text-[9px] uppercase font-bold flex items-center gap-1 mb-0.5">
                <Star className="w-2.5 h-2.5" /> Marks
              </span>
              <strong className="text-slate-700 text-[13px] font-bold">{totalMarks}</strong>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between w-full pt-1">
          <div className="flex flex-col">
            <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">
              Attempts
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-800 text-[14px] font-bold">
                {attemptsDone || 0} / {isUnlimited ? '∞' : attemptsPerRespondentValue}
              </span>
              <span className="bg-blue-50 text-[#1E69DA] text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                {isUnlimited ? '∞ Left' : `${Math.max(0, maxAttemptsNum - (attemptsDone || 0))} Left`}
              </span>
            </div>
          </div>
          <div className="ml-auto shrink-0">
            {renderMainButton()}
          </div>
        </div>

      </div>
    </section>
  );
}
