"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Button, message, Popover } from "antd";
import { fetchTestData } from "@/redux/slices/assessmentsSlice/testSlice";
import { getLstorage } from "@/universalUtils/windowMW";
import { parseIfJson } from "../reusable_comp/jsonparse";
import useResponsive from "@/hooks/useResponsive";
import ResponsiveAssessmentCard from "@/mobile_views/assessments/ResponsiveAssessmentCard";
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
      if (Currques.questionType?.includes("Comprehension")) {
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

  const progressForTest = studentCreds?.progress?.filter((e) => e?.testId == testData?._id) || [];
  const attemptsDone = progressForTest.length;
  const latestAttempt = progressForTest[attemptsDone - 1];
  const score = latestAttempt?.scoreData?.finalScore !== undefined ? latestAttempt.scoreData.finalScore : latestAttempt?.score;
  const percentage = totalMarks > 0 && score !== undefined ? Math.round((Number(score) / totalMarks) * 100) : undefined;
  const hasAttempted = attemptsDone > 0;
  const isBlocked = testData?.blockedStudents?.some((student) => studentId == student?._id);
  const noQuestions = !testData?.questions?.length && !testData?.questionIds?.length;

  const attemptsPerRespondentValue = testData?.access?.attemptsPerRespondent;
  const attemptsExceeded =
    attemptsPerRespondentValue !== undefined &&
    attemptsPerRespondentValue !== "" &&
    attemptsPerRespondentValue !== null &&
    (Number(attemptsPerRespondentValue) - attemptsDone <= 0);

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
      case countdowns[index] === "Expired":
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
      default:
        return (
          <Button
            type="primary"
            onClick={handleStartTestClick}
            disabled={!isTestActivated || countdowns[index] === "Expired"}
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

  if (isResponsive) {
    return (
      <ResponsiveAssessmentCard
        title={isAssessment ? testData?.jobTitle : testData?.title}
        thumbnail={testData?.thumbnail}
        category={testData?.category?.[0]?.name}
        accessType={testData?.access?.type}
        questionCount={ques?.length || 0}
        duration={isAssessment ? (testData?.testDurationDisplay?.hours ? `${testData.testDurationDisplay.hours}H : ${testData.testDurationDisplay.minutes}M` : "NA") : (testDuration?.val1 ? `${testDuration.val1}H : ${testDuration.val2}M` : "NA")}
        shortDescription={testData?.shortDescription}
        countdown={countdowns[index]}
        isExpired={countdowns[index] === "Expired"}
        isTestActivated={isTestActivated}
        activationCountdown={activationCountdown}
        totalMarks={totalMarks}
        isAssessment={isAssessment}
        renderButton={renderMainButton}
        status={attemptsDone > 0 ? "Completed" : testData?.status}
        createdAt={testData?.createdAt}
        attemptsDone={attemptsDone}
        maxAttempts={attemptsPerRespondentValue}
        percentage={percentage}
        score={score}
      />
    );
  }

  let rawDesc = parseIfJson(testData?.shortDescription) || "";
  let cleanDesc = rawDesc.replace(/<[^>]+>/g, '').trim();
  let firstSentence = cleanDesc;
  if (firstSentence.includes('.')) {
    firstSentence = firstSentence.split('.')[0] + '.';
  }

  return (
    <section className="bg-white shadow-md hover:shadow-lg transition-shadow flex flex-col cursor-pointer rounded-2xl border border-gray-200 h-full relative overflow-hidden">
      
      {/* Thumbnail */}
      <div className="w-full aspect-[16/9] bg-white flex items-center justify-center shrink-0 px-3 pt-3">
        <div className="w-full h-full rounded-xl overflow-hidden">
          {testData?.thumbnail ? (
            <img src={testData.thumbnail} alt="thumbnail" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-yellow-300 to-yellow-500 flex items-center justify-center">
              <span className="text-4xl font-extrabold text-black/50">
                {testData?.title?.substring(0, 2)?.toUpperCase() || "JS"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Top Section: Title & Active Tag */}
      <div className="flex items-center justify-between w-full px-5 pt-1 pb-2">
        <h3 className="text-[18px] font-extrabold text-[#1a3b8b] leading-tight line-clamp-2 pr-2">
          {isAssessment ? testData?.jobTitle : testData?.title}
        </h3>
        {!isAssessment && (
          <div className="shrink-0">
            {countdowns[index] === "Expired" ? (
              <span className="bg-red-50 text-red-600 text-[11px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                Expired
              </span>
            ) : testData?.time?.expiryDates?.expiry ? (
              <span className="text-gray-500 text-[11px] font-bold">{countdowns[index]}</span>
            ) : (
              <span className={`text-[11px] font-bold px-2 py-1 rounded-full flex items-center gap-1 ${
                testData?.status?.toLowerCase() === "active" ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  testData?.status?.toLowerCase() === "active" ? "bg-green-600" : "bg-yellow-600"
                }`}></span>
                {testData?.status?.charAt(0).toUpperCase() + testData?.status?.slice(1)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Tags Row */}
      <div className="flex flex-wrap items-center gap-2 px-5 mb-4">
        {testData?.category?.slice(0, 2).map((cat, i) => (
          <span key={i} className="bg-[#eff4ff] text-[#1E69DA] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            {cat.name}
          </span>
        ))}
        <span className="bg-green-50 text-green-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
          All Levels
        </span>
      </div>

      {/* Metrics Row */}
      <div className="flex items-center w-full px-5 pb-4">
        <div className="flex flex-col w-1/3 border-r border-gray-100 shrink-0 pr-2">
          <span className="text-[#8c94a3] text-[11px] uppercase font-bold flex items-center gap-1.5 whitespace-nowrap mb-1">
            <HelpCircle className="w-3.5 h-3.5" /> QUESTIONS
          </span>
          <strong className="text-[#1a3b8b] text-[16px] font-bold leading-tight truncate">{testData?.questions?.length || 0}</strong>
        </div>
        <div className="flex flex-col w-1/3 px-3 border-r border-gray-100 shrink-0">
          <span className="text-[#8c94a3] text-[11px] uppercase font-bold flex items-center gap-1.5 whitespace-nowrap mb-1">
            <Clock className="w-3.5 h-3.5" /> DURATION
          </span>
          <strong className="text-[#1a3b8b] text-[16px] font-bold leading-tight uppercase whitespace-nowrap">
            {isAssessment 
              ? (testData?.testDurationDisplay?.hours || testData?.testDurationDisplay?.minutes ? `${testData?.testDurationDisplay?.hours || 0}H : ${testData?.testDurationDisplay?.minutes || 0}M` : "NA")
              : (testDuration?.val1 || testDuration?.val2 ? `${testDuration?.val1 || 0}H : ${testDuration?.val2 || 0}M` : "NA")}
          </strong>
        </div>
        {!isAssessment && (
          <div className="flex flex-col w-1/3 px-3 shrink-0">
            <span className="text-[#8c94a3] text-[11px] uppercase font-bold flex items-center gap-1.5 whitespace-nowrap mb-1">
              <Star className="w-3.5 h-3.5" /> MARKS
            </span>
            <strong className="text-[#1a3b8b] text-[16px] font-bold leading-tight truncate">{totalMarks}</strong>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="px-5 pt-1 pb-7 text-[14.5px] text-[#475467] leading-relaxed line-clamp-2">
        {firstSentence}
      </div>

      {/* Footer / Actions */}
      <div className="mt-auto flex items-center justify-between px-5 py-4 w-full border-t border-gray-100">
        <div className="flex flex-col w-[120px]">
          <div className="text-[#8c94a3] text-[11px] font-bold uppercase mb-1.5 tracking-wider">
            COMPLETION • {percentage !== undefined ? percentage : 0}%
          </div>
          <div className="w-full bg-[#f1f5f9] rounded-full h-1.5">
            <div 
              className="h-1.5 rounded-full bg-[#1E69DA]" 
              style={{ width: `${Math.min(100, Math.max(0, percentage || 0))}%` }}
            ></div>
          </div>
        </div>
        {renderMainButton()}
      </div>

    </section>
  );
}
