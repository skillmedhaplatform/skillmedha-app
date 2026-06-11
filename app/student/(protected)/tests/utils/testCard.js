"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Button, message, Popover } from "antd";
import { fetchTestData } from "@/redux/slices/assessmentsSlice/testSlice";
import { getLstorage } from "@/universalUtils/windowMW";
import { parseIfJson } from "../reusable_comp/jsonparse";
import ResponsiveAssessmentCard from "@/mobile_views/assessments/ResponsiveAssessmentCard";
import useResponsive from "@/hooks/useResponsive";

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

  switch (true) {
    case attemptsExceeded:
      mainButtonText = "Attempts exceeded";
      mainButtonColor = "#FACE53";
      mainButtonTextColor = "#000000";
      break;
    case hasAttempted:
      mainButtonText = "ReAttempt";
      mainButtonColor = "#56d2d4";
      mainButtonTextColor = "#000000";
      break;
    case testData?.access?.type === "private":
      mainButtonText = "Enter Code";
      break;
    default:
      mainButtonColor = "#1da469"; // For "Start test"
      mainButtonTextColor = "#ffffff";
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
            style={mainButtonColor ? { backgroundColor: mainButtonColor, color: mainButtonTextColor } : {}}
          >
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

  return (
    <section className="bg-[#fdfdfd] flex items-center justify-center p-[0.5rem_1rem_1rem_1rem] cursor-pointer rounded-[10px] shadow-[rgba(0,0,0,0.05)_0px_0px_0px_1px,rgb(209,213,219)_0px_0px_0px_1px_inset]">
      <div className="flex items-start justify-start flex-col w-full gap-[0.2rem]">
        {!isAssessment && (
          <div className="w-full flex items-center justify-end gap-16 text-[0.7rem]">
            {countdowns[index] === "Expired" ? (
              <button className="bg-[#e74c3c] text-white border-0 py-[0.3rem] px-[0.5rem] font-semibold text-[0.7rem] rounded-[5px] cursor-pointer flex gap-[0.3rem]">Expired</button>
            ) : (
              <>
                {testData?.time?.expiryDates?.expiry ? (
                  <div
                    style={{
                      display: "flex",
                      width: "100%",
                      justifyContent: "space-between",
                    }}
                  >
                    <button className="border-0 py-[0.3rem] px-[0.5rem] font-semibold text-[0.7rem] rounded-[5px] cursor-pointer flex gap-[0.3rem]">{countdowns[index]}</button>
                    {!isTestActivated && activationCountdown && (
                      <div
                        style={{
                          padding: "2px 5px",
                          backgroundColor: "#fff3cd",
                          borderRadius: "4px",
                          textAlign: "center",
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: "12px",
                            color: "#856404",
                            fontWeight: 600,
                          }}
                        >
                          🕒 {activationCountdown}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    className={`bg-[#f0f0f0] py-[0.15rem] px-[0.5rem] flex items-center justify-center rounded-[1rem] cursor-pointer mb-[0.2rem] text-[0.6rem] font-bold text-center border-0 gap-[0.3rem] ${testData?.status?.toLowerCase() === "active"
                      ? "!bg-[#24A058] !text-white"
                      : "!bg-[#f39c12] !text-white"
                      }`}
                  >
                    {testData?.status?.charAt(0).toUpperCase() +
                      testData?.status?.slice(1)}
                  </button>
                )}
              </>
            )}
          </div>
        )}

        <div className="w-full text-start h-[3.2rem]">
          <p className="text-[18px] font-bold w-full">
            {isAssessment
              ? testData?.jobTitle
              : testData?.title?.length > 40
                ? testData?.title?.substring(0, 42) + "..."
                : testData?.title}
          </p>
        </div>
        <div className="w-full flex items-start justify-between">
          {testData?.category && testData.category.length > 0 && (
            <div className="bg-[#f0f0f0] py-[0.15rem] px-[0.5rem] flex items-center justify-center rounded-[1rem] cursor-pointer mb-[0.2rem] [&_p]:font-bold [&_p]:text-[0.6rem] [&_p]:text-center">
              <p>
                {testData.category.length === 1
                  ? `${testData?.category[0]?.name}`
                  : `${testData?.category[0]?.name} +${testData?.category?.length - 1
                  }`}
              </p>
            </div>
          )}

          {testData?.access && (
            <div
              className={`bg-[#f0f0f0] py-[0.15rem] px-[0.5rem] flex items-center justify-center rounded-[1rem] cursor-pointer mb-[0.2rem] [&_p]:font-bold [&_p]:text-[0.6rem] [&_p]:text-center ${testData?.access?.type === "private"
                ? "!bg-[#e74c3c] !text-white"
                : testData?.access?.type === "public"
                  ? "!bg-[#24A05859] !text-black"
                  : "!bg-[#e8f0fe] !text-black"
                }`}
            >
              <p>
                {testData?.access?.type?.charAt(0).toUpperCase() +
                  testData?.access?.type?.slice(1)}
              </p>
            </div>
          )}
        </div>
        <div className="w-full flex items-center justify-between flex-row mb-2 [&_div]:flex [&_div]:items-center [&_div]:justify-start [&_div]:flex-row [&_p]:text-[0.7rem] [&_strong]:text-[0.7rem]">
          <div>
            <p>Questions : </p>
            &nbsp;<strong>{testData?.questions?.length || 0}</strong>
          </div>
          <div>
            <p>Duration : </p>
            &nbsp;
            {isAssessment ? (
              <strong>
                {" "}
                {testData?.testDurationDisplay?.hours &&
                  testData?.testDurationDisplay?.minutes
                  ? `${testData?.testDurationDisplay?.hours}H : ${testData?.testDurationDisplay?.minutes}M`
                  : "NA"}
              </strong>
            ) : (
              <strong>
                {testDuration?.val1 && testDuration?.val2
                  ? `${testDuration?.val1}H : ${testDuration?.val2}M`
                  : "NA"}
              </strong>
            )}
          </div>
          {!isAssessment && (
            <>
              <div>
                <p>Marks : </p>
                &nbsp;<strong>{totalMarks}</strong>
              </div>
            </>
          )}
        </div>
        {!isAssessment && testData?.thumbnail && (
          <div className="w-full flex items-center justify-center overflow-hidden [&_img]:w-full [&_img]:aspect-video [&_img]:object-contain">
            <img src={testData.thumbnail} alt="thumbnail" />
          </div>
        )}

        <div className="w-full h-[8.5rem] text-[0.7rem] font-medium text-justify mt-[0.7rem] overflow-hidden [&_span]:leading-[18px]">
          <span
            className="line-clamp-6"
            dangerouslySetInnerHTML={{
              __html:
                parseIfJson(testData?.shortDescription)?.substring(0, 260) +
                (parseIfJson(testData?.shortDescription)?.length > 260 ? "..." : ""),
            }}
          ></span>
        </div>
        <div className="w-full flex items-center justify-between mt-2">
          {renderMainButton()}

          {/* <Button
            onClick={navigateToResults}
            type="default"
          >
            Results
          </Button> */}
        </div>
      </div>
    </section>
  );
}
