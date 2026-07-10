"use client";
import { useSearchParams } from "next/navigation";
import React, { createRef, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSingleTest } from "../redux/slices/testSlice";
import {
  getPublicStudent,
  saveTestResults,
} from "../redux/slices/studentSlice";
import resultStyles from "./results.module.scss";
import { Collapse, Skeleton } from "antd";
import DonutChart from "../utils/donutChart";
import ResultSkeleton from "./resultsskeleton";
import QuesComp from "./quesComp";
import { TbTriangleInvertedFilled } from "react-icons/tb";
import { parseIfJson } from "../utils/testUI/jsonparse";

export default function ResultsComp() {
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const testId = searchParams.get("t_Id");
  const studentId = searchParams.get("s_Id");

  const testData = useSelector((state) => state.Test.testData.value);
  const studentData = useSelector((state) => state.Student.studentVals);
  const testRes = useSelector((state) => state.Student.testResults);
  const [chartData, setChartData] = useState({
    series: [],
    labels: [],
    colors: [],
  });
  const currentTestRes = testRes[testId]?.response || {};

  const PassScore = testData?.grading?.gradingCriteria?.passScore;
  const [testBlocked, setTestBlocked] = useState("");
  const [ques, setQues] = useState([]);
  const [totalMarks, setTotalMarks] = useState(0);
  const [score, setScore] = useState({});
  const totalScore = parseInt(score?.totalScore);

  let testValues;

  if (totalScore < 0) {
    testValues =
      testData?.grading?.scoreRange?.[
        testData?.grading?.scoreRange?.length - 1
      ];
  } else {
    testValues = testData?.grading?.scoreRange?.find((obj) => {
      const totalScore = parseInt(score?.totalScore);
      const scoreFrom = parseInt(obj?.scoreFrom);
      const scoreTo = parseInt(obj?.scoreTo);

      return totalScore >= scoreTo && totalScore <= scoreFrom;
    });
  }

  useEffect(() => {
    dispatch(getSingleTest({ _id: testId }));
  }, [testId]);

  useEffect(() => {
    const isBlocked = testData?.blockedStudents?.find(
      (e) => e?._id == studentData?._id
    );
    setTestBlocked(isBlocked);
  }, [testData?._id, testData]);

  const shuffledTestData = React.useMemo(() => {
    if (!testData?.questions) return testData;
    return JSON.parse(JSON.stringify(testData));
  }, [testData]);

  useEffect(() => {
    if (shuffledTestData?.questions?.length) {
      const updatedQues = shuffledTestData?.questions?.reduce((acc, question) => {
        if (question?.questionType?.includes("Comprehension")) {
          const updatedContentArr = question?.questionContentArr?.map(
            (content) => ({
              ...content,
              qType: question?.questionType,
              compText: question?.comprehensionText,
              resource: question?.resources,
            })
          );
          return [...acc, ...(updatedContentArr || [])];
        } else {
          return [...acc, { ...question, qType: question?.questionType }];
        }
      }, []);
      setQues(updatedQues);
      const totalMarksEachTests = updatedQues.map((question) => {
        const {
          pointsForCorrectAns,
          PointsForEachCorrectAnswer,
          bonusPointsForAllCorrect,
        } = question?.scoreSettings || {};

        let score =
          Number(pointsForCorrectAns) ||
          Number(PointsForEachCorrectAnswer) ||
          0;

        if (PointsForEachCorrectAnswer && question?.answer?.multipleChoice) {
          const correctOptionsCount = Object.values(
            question.answer.multipleChoice
          ).filter(Boolean).length;
          score = correctOptionsCount * PointsForEachCorrectAnswer;
        }

        const bonusPoints = Number(bonusPointsForAllCorrect) || 0;

        return score + bonusPoints;
      });
      const total = totalMarksEachTests.reduce((acc, curr) => acc + curr, 0);
      setTotalMarks(total);
    }
  }, [testData?._id, testData?.questions?.length, shuffledTestData]);

  useEffect(() => {
    dispatch(getPublicStudent({ id: studentId }));
    if (!testRes[testId] && studentData?.data?._id) {
      const completedResult = studentData?.data?.progress?.filter(
        (e) => e?.testId == testId
      );

      if (!studentData) return;
      dispatch(
        saveTestResults({
          userId: completedResult.slice(-1)[0]?.userId,
          testId: completedResult.slice(-1)[0]?.testId,
          response: completedResult.slice(-1)[0]?.response,
          studentData: completedResult.slice(-1)[0]?.studentData,
          flagged: completedResult.slice(-1)[0]?.flagged,
          marked: completedResult.slice(-1)[0]?.marked,
          scoreData: completedResult.slice(-1)[0]?.scoreData,
        })
      );
    }
  }, [studentData?.data?._id]);

  useEffect(() => {
    if (!testData || !testRes) return;
    if (testData?._id && testRes && testRes[testId]) {
      const {
        correctQues,
        unattemptedQues,
        incorrectQues,
        finalScore: totalScore,
        totalTimeTaken,
        averageTimeTaken,
        notAnswered,
      } = testRes[testId]?.scoreData;
      setScore({ totalScore, totalTimeTaken, averageTimeTaken });

      setChartData({
        series: [correctQues, incorrectQues, unattemptedQues, notAnswered],
        labels: [
          "Correct Answers",
          "Incorrect Answers",
          "Unattempted Questions",
          "Not Answered",
        ],
        colors: ["#87CC85", "#E43E5F", "#869DF0", "#4e4eff"],
      });
    }
  }, [testData, testRes]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  let questionNo = 1;

  const quesContainerRef = useRef([]);
  quesContainerRef.current = ques?.map(
    (_, ind) => quesContainerRef.current[ind] ?? createRef()
  );

  return (
    <>
      {" "}
      <div className={resultStyles.container}>
        <div 
          className={resultStyles.headerContainer}
          style={PassScore && totalScore >= PassScore ? { backgroundColor: '#d4edda', padding: '1rem', borderRadius: '8px' } : {}}
        >
          <h2 className={resultStyles.title}>
            {testValues?.message ? (
              <span
                dangerouslySetInnerHTML={{
                  __html: parseIfJson(testValues?.message),
                }}
              ></span>
            ) : testData?.grading?.failIntervals?.TestFailMessage ? (
              <span
                dangerouslySetInnerHTML={{
                  __html: parseIfJson(
                    testData?.grading?.failIntervals?.TestFailMessage
                  ),
                }}
              ></span>
            ) : (
              <span>
                Thank you for attempting {testData?.value?.test?.title}
              </span>
            )}
          </h2>
          {testBlocked && (
            <h3 className={resultStyles.blocked_msg}>
              Your Test has been Blocked
            </h3>
          )}
          {loading ? (
            <ResultSkeleton />
          ) : (
            <div
              className={resultStyles.dataContainer}
              style={{
                backgroundColor:
                  score?.totalScore < PassScore
                    ? "rgba(255, 0, 0, 0.1)"
                    : "rgba(4, 255, 0, 0.1)",
              }}
            >
              <h2>Your Results</h2>
              <div className={resultStyles.datachart_cont}>
                <div className={resultStyles.dataLeftContiner}>
                  <div className={resultStyles.rankingContainer}>
                    {PassScore && (
                      <div className={resultStyles.dataVal}>
                        <p
                          className={`${resultStyles.dataValTitle}`}
                          style={{
                            color:
                              score?.totalScore < PassScore ? "red" : "green",
                            fontWeight: "600",
                            fontSize: "1rem",
                          }}
                        >
                          {(score?.totalScore < PassScore ? "Fail" : "Pass") ||
                            "Test Result"}
                        </p>
                        {PassScore && (
                          <img
                            src={
                              score?.totalScore < PassScore
                                ? "https://res.cloudinary.com/cliqtick/image/upload/v1723022583/download_xhfalm.png"
                                : "https://res.cloudinary.com/cliqtick/image/upload/v1723022565/download_mxpisn.png"
                            }
                            alt={
                              score?.totalScore < PassScore
                                ? "fail logo"
                                : "pass logo"
                            }
                          />
                        )}
                      </div>
                    )}

                    {testValues?.grade && (
                      <div className={resultStyles.dataVal}>
                        <p className={resultStyles.dataValTitle}>Grade</p>
                        <p className={resultStyles.dataResults}>
                          {testValues?.grade}
                        </p>
                      </div>
                    )}
                    {
                      <div className={resultStyles.dataVal}>
                        <p className={resultStyles.dataValTitle}>%</p>
                        <p className={resultStyles.dataResults}>
                          {parseFloat(
                            (parseInt(score?.totalScore) /
                              parseInt(totalMarks)) *
                              100
                          ).toFixed(0)}
                          %
                        </p>
                      </div>
                    }
                  </div>
                  <div className={resultStyles.statsContainer}>
                    <div className={resultStyles.dataVal}>
                      <p className={resultStyles.dataValTitle}>Score</p>
                      <p>
                        {score?.totalScore}/{totalMarks}
                      </p>
                    </div>
                    <div className={resultStyles.dataVal}>
                      <p className={resultStyles.dataValTitle}>
                        Time taken to finish
                      </p>
                      <p>
                        {parseFloat(score?.totalTimeTaken / 60).toFixed(2)} mins
                      </p>
                    </div>
                    <div className={resultStyles.dataVal}>
                      <p className={resultStyles.dataValTitle}>Speed</p>
                      <p>
                        1Q/
                        {parseInt(score?.averageTimeTaken) > 60
                          ? `${parseInt(score?.averageTimeTaken / 60)} mins`
                          : `${parseInt(score?.averageTimeTaken)} secs`}
                      </p>
                    </div>
                  </div>
                </div>
                <div className={resultStyles.chartContainer}>
                  <div className={resultStyles.donutParent}>
                    <DonutChart
                      id={"testResult"}
                      series={chartData.series}
                      labels={chartData.labels}
                      colors={chartData.colors}
                    />
                  </div>
                  <div className={resultStyles.responseStats}>
                    <div className={resultStyles.chartInfoContainer}>
                      <span style={{ backgroundColor: "#87CC85" }} />
                      <p>
                        Correct
                        <span className={resultStyles.chartInfoContainerVal}>
                          [
                          {parseFloat(
                            (chartData?.series[0] / parseInt(ques?.length)) *
                              100
                          ).toFixed(1)}
                          % ]
                        </span>
                      </p>
                    </div>
                    <div className={resultStyles.chartInfoContainer}>
                      <span style={{ backgroundColor: "#E43E5F" }} />
                      <p>
                        Incorrect
                        <span className={resultStyles.chartInfoContainerVal}>
                          [
                          {parseFloat(
                            (chartData.series[1] / parseInt(ques?.length)) * 100
                          ).toFixed(1)}
                          % ]
                        </span>
                      </p>
                    </div>
                    <div className={resultStyles.chartInfoContainer}>
                      <span style={{ backgroundColor: "#869DF0" }} />
                      <p>
                        Unattempted
                        <span className={resultStyles.chartInfoContainerVal}>
                          [
                          {parseFloat(
                            (chartData?.series[2] / parseInt(ques?.length)) *
                              100
                          ).toFixed(1)}
                          % ]
                        </span>
                      </p>
                    </div>
                    <div className={resultStyles.chartInfoContainer}>
                      <span style={{ backgroundColor: "#4e4eff" }} />
                      <p>
                        Not Answered
                        <span className={resultStyles.chartInfoContainerVal}>
                          [
                          {parseFloat(
                            (chartData?.series[3] / parseInt(ques?.length)) *
                              100
                          ).toFixed(1)}
                          % ]
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className={resultStyles.anwers_div}>
          <div className={resultStyles.flagged_div}>
            {testRes[testId]?.flagged?.length > 0 && (
              <>
                <h2>Flagged Question Numbers</h2>
                <div>
                  {testRes[testId]?.flagged.map((que, ind) => {
                    const questionResult = ques
                      ?.map((question, index) => ({ question, index }))
                      .find(({ question }) => question?._id === que?.id);

                    if (!questionResult) return null;

                    const { question, index } = questionResult;

                    return (
                      <p
                        key={ind}
                        onClick={() => {
                          if (quesContainerRef.current[index + 1])
                            quesContainerRef.current[
                              index + 1
                            ].current.scrollIntoView({
                              behavior: "smooth",
                              block: "center",
                              inline: "start",
                            });
                        }}
                      >
                        Question No: <strong>{index + 1}</strong>
                        <br />
                      </p>
                    );
                  })}
                </div>
              </>
            )}
          </div>
          <br />
          <h2>Answer Key</h2>
          <br />
          {loading ? (
            <Skeleton />
          ) : (
            <div className={resultStyles.answers_scroll_cont}>
              {ques?.length > 0 &&
                ques?.map((e, i) => {
                  const flaggedQues = testRes[testId]?.flagged?.find((que) => que?.id == e?._id);
                  const markedQues = testRes[testId]?.marked?.includes(e?._id);
                  return (
                    <div ref={quesContainerRef.current[questionNo]} key={i}>
                      <QuesComp
                        quesContainerRef={quesContainerRef}
                        e={e}
                        i={i}
                        currentTestRes={currentTestRes}
                        testRes={testRes}
                        questionNo={questionNo++}
                        flagged={flaggedQues}
                        marked={markedQues}
                      />
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
