"use client";
import React, { createRef, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";
import { TbTriangleInvertedFilled } from "react-icons/tb";
import resultStyles from "./results.module.scss";

import { Collapse, Input, Select, Tag, message, Skeleton, Card, Row, Col, Statistic } from "antd";
import { SearchOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, ThunderboltOutlined, PercentageOutlined, TrophyOutlined, CaretRightOutlined } from "@ant-design/icons";
import QuesComp from "./questComp";
import DonutChart from "../../utils/donutChart";
import { fetchTestData } from "@/redux/slices/assessmentsSlice/testSlice";
import { saveTestResults } from "@/redux/slices/student";
import ResultSkeleton from "../../reusable_comp/resultsskeleton";
import { parseIfJson } from "../../reusable_comp/jsonparse";
import { getLstorage, getSstorage, setSstorage } from "@/universalUtils/windowMW";

export default function Page() {
  const testRes = useSelector((state) => state.student.testResults);
  const testData = useSelector((state) => state?.tests?.finishedTestData);
  const studentData = useSelector((state) => state?.student?.student?.data);
  const StudentData_New = useSelector(
    (state) => state?.student?.testResults?.studentVals
  );
  const finishedTestData = useSelector(
    (state) => state?.tests?.finishedTestData?.value?.test
  );

  const testStatus = useSelector((state) => state?.tests?.testStatus);

  const [totalMarks, setTotalMarks] = useState(0);
  const [testBlocked, setTestBlocked] = useState("");

  useEffect(() => {
    const isBlocked = testData?.value?.test?.blockedStudents?.find(
      (e) => e?._id == studentData?._id
    );
    setTestBlocked(isBlocked);
  }, [testData?.value?.test?._id, testData]);

  const [ques, setQues] = useState([]);

  useEffect(() => {
    if (finishedTestData?.questions?.length) {
      const updatedQues = finishedTestData.questions.reduce((acc, question) => {
        if (question?.questionType?.includes("Comprehension")) {
          const updatedContentArr = question?.questionContentArr?.map(
            (content) => ({
              ...content,
              qType: question?.questionType,
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
  }, [finishedTestData?._id, finishedTestData?.questions?.length]);

  const PassScore = finishedTestData?.grading?.gradingCriteria?.passScore;

  const [score, setScore] = useState({});
  const params = useParams();
  const nav = useRouter();
  const [chartData, setChartData] = useState({
    series: [],
    labels: [],
    colors: [],
  });

  const searchQuery = useSearchParams();
  const sstestId = getSstorage("selectedTest");
  const sqTestId = searchQuery.get("testId");
  let testId = sqTestId || sstestId;
  const currentTestRes = testRes?.value?.[testId]?.response;

  const totalScore = parseInt(score?.totalScore);

  let testValues;

  if (totalScore < 0) {
    testValues =
      finishedTestData?.grading?.scoreRange?.[
      finishedTestData?.grading?.scoreRange?.length - 1
      ];
  } else {
    testValues = (finishedTestData?.grading?.scoreRange || []).find((obj) => {
      const totalScore = parseInt(score?.totalScore);
      const scoreFrom = parseInt(obj?.scoreFrom);
      const scoreTo = parseInt(obj?.scoreTo);

      return totalScore >= scoreTo && totalScore <= scoreFrom;
    });
  }

  useEffect(() => {
    if (!testData || !testRes) return;
    if (testRes?.value) {
      const keys = Object.keys(testRes?.value);
      if (!keys?.length) return;
      if (!testRes?.value?.[testId]?.scoreData) return;
    } else {
      return;
    }
    if (testData?.value && testRes?.value && testRes?.value?.[testId]) {
      const {
        correctQues = "",
        unattemptedQues,
        incorrectQues,
        finalScore: totalScore,
        totalTimeTaken,
        averageTimeTaken,
        notAnswered,
      } = testRes?.value?.[testId]?.scoreData || {};
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
  }, [testData?.value, testRes?.value]);

  const shortAns = useRef({});
  const dispatch = useDispatch();

  // Persist results to sessionStorage when available
  useEffect(() => {
    if (testId && testRes?.value?.[testId]) {
      setSstorage(`testResult_${testId}`, JSON.stringify(testRes.value[testId]));
    }
  }, [testRes?.value, testId]);

  // Restore results from sessionStorage on mount/refresh
  useEffect(() => {
    const studentId = getLstorage("sId");
    if (testId && !testRes?.value?.[testId] && studentData?._id) {
      // First try to restore from sessionStorage
      const savedResult = getSstorage(`testResult_${testId}`);
      if (savedResult) {
        try {
          const parsed = JSON.parse(savedResult);
          dispatch(saveTestResults(parsed));
        } catch (e) {
          console.error("Failed to parse saved result:", e);
        }
      }

      // Also try to get from student progress
      const completedResult = StudentData_New?.progress?.filter(
        (e) => e?.testId == testId
      );
      if (completedResult?.length > 0) {
        const lastResult = completedResult.slice(-1)[0];
        if (lastResult) {
          dispatch(
            saveTestResults({
              userId: lastResult?.userId,
              testId: lastResult?.testId,
              response: lastResult?.response,
              studentData: lastResult?.studentData,
              flagged: lastResult?.flagged,
              scoreData: lastResult?.scoreData,
            })
          );
        }
      }

      dispatch(fetchTestData({ testId }));
    }
  }, [studentData?._id, testId]);

  // Determine loading state based on actual data readiness
  const isDataReady = useMemo(() => {
    return (
      finishedTestData?.questions?.length > 0 &&
      ques?.length > 0 &&
      chartData?.series?.length > 0 &&
      score?.totalScore !== undefined &&
      totalMarks >= 0
    );
  }, [finishedTestData, ques, chartData, score, totalMarks]);

  const loading = testStatus === "evaluatingTest" || !isDataReady;

  let questionNo = 1;

  const quesContainerRef = useRef([]);
  quesContainerRef.current = ques?.map(
    (_, ind) => quesContainerRef.current[ind] ?? createRef()
  );

  // Search and filter state
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [questionSearchQuery, setQuestionSearchQuery] = useState("");

  // Group questions by category with search filter
  const groupedQuestions = useMemo(() => {
    if (!finishedTestData?.questions?.length) return {};
    const groups = {};
    const query = questionSearchQuery?.toLowerCase() || "";

    finishedTestData.questions.forEach((q) => {
      // Search filter
      let matchesSearch = true;
      if (query.trim() !== "") {
        const questionText = q?.questionContent?.question?.toLowerCase() || "";
        const optionsText = Object.keys(q?.questionContent || {})
          .filter((k) => k?.includes("option"))
          .map((k) => q?.questionContent?.[k]?.toLowerCase() || "")
          .join(" ");
        matchesSearch =
          questionText?.includes(query) || optionsText?.includes(query);
      }
      if (!matchesSearch) return;

      // Category filter
      let cat = "Uncategorized";
      if (q?.questionCategory && q?.questionCategory?.length > 0) {
        cat = q?.questionCategory?.[0]?.name || "Uncategorized";
      }

      if (selectedCategory !== "All" && cat !== selectedCategory) return;

      if (!groups[cat]) {
        groups[cat] = {
          questions: [],
          totalExpectedScore: 0,
          totalEarnedScore: 0,
        };
      }
      groups[cat].questions.push(q);

      // Calculate expected score
      let maxQScore = 0;
      if (q?.scoreSettings?.scoreType === "fullScore") {
        maxQScore =
          Number(q?.scoreSettings?.pointsForCorrectAns) ||
          Number(q?.questionScore) ||
          0;
      } else if (q?.scoreSettings?.scoreType === "partialScore") {
        const correctOptionsCount = q?.answer?.multipleChoice
          ? Object.values(q.answer.multipleChoice).filter(Boolean).length
          : 1;
        maxQScore =
          correctOptionsCount *
          Number(q?.scoreSettings?.PointsForEachCorrectAnswer || 0) +
          Number(q?.scoreSettings?.bonusPointsForAllCorrect || 0);
      }
      groups[cat].totalExpectedScore += maxQScore;

      // Calculate earned score
      const singleQuestion = currentTestRes?.[q?._id];
      if (singleQuestion && singleQuestion?.status !== "notanswered") {
        if (singleQuestion?.status === "correct") {
          groups[cat].totalEarnedScore +=
            Number(singleQuestion?.correctScore || 0) +
            Number(singleQuestion?.bonusScore || 0);
        } else if (singleQuestion?.status === "incorrect") {
          groups[cat].totalEarnedScore +=
            Number(singleQuestion?.correctScore || 0) +
            Number(singleQuestion?.negativeScore || 0);
        }
      }
    });
    return groups;
  }, [finishedTestData?.questions, currentTestRes, questionSearchQuery, selectedCategory]);

  // Get all unique categories for filter dropdown
  const allCategories = useMemo(() => {
    if (!finishedTestData?.questions?.length) return [];
    const cats = new Set();
    finishedTestData.questions.forEach((q) => {
      if (q?.questionCategory?.length > 0) {
        cats.add(q?.questionCategory?.[0]?.name || "Uncategorized");
      } else {
        cats.add("Uncategorized");
      }
    });
    return Array.from(cats);
  }, [finishedTestData?.questions]);

  if (testStatus === "evaluatingTest") {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <ResultSkeleton />
        <p style={{ marginTop: "1rem", fontSize: "1.1rem", color: "#666" }}>
          Results are being evaluated, please wait...
        </p>
      </div>
    );
  }

  return (
    <>
      <StudentPageHeader section="Assessment" title="Test Result" />
      <div className={resultStyles.main}>
        <div className={resultStyles.content}>
          
          {testBlocked && (
            <h3 className="text-[#e74c3c] my-2 bg-[rgba(228,62,95,0.08)] py-2 px-6 rounded-lg border border-[rgba(228,62,95,0.2)]">
              Your Test has been Blocked
            </h3>
          )}

          {!isDataReady ? (
            <ResultSkeleton />
          ) : (
            <>
              {/* Result Banner */}
              <div className={`${resultStyles.resultBanner} ${score?.totalScore < PassScore ? resultStyles.fail : resultStyles.pass}`}>
                <div className={resultStyles.resultBannerIcon}>
                  {score?.totalScore < PassScore ? (
                    <i className="ti ti-x" />
                  ) : (
                    <i className="ti ti-check" />
                  )}
                </div>
                <div>
                  <div className={resultStyles.resultBannerTitle}>
                    {score?.totalScore < PassScore ? "Test Failed" : "Test Passed Successfully!"}
                  </div>
                  <div className={resultStyles.resultBannerSub}>
                    {testValues?.message ? (
                      <span dangerouslySetInnerHTML={{ __html: parseIfJson(testValues?.message) }}></span>
                    ) : finishedTestData?.grading?.failIntervals?.TestFailMessage ? (
                      <span dangerouslySetInnerHTML={{ __html: parseIfJson(finishedTestData?.grading?.failIntervals?.TestFailMessage) }}></span>
                    ) : (
                      <span>Thank you for attempting {testData?.value?.test?.title}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Score Overview */}
              <div className={resultStyles.overviewCard}>
                <div className={resultStyles.ocHeader}>
                  <i className="ti ti-chart-bar" /> Score Overview
                </div>
                <div className={resultStyles.ocBody}>
                  <div className={resultStyles.ocStats}>
                    <div className={resultStyles.statBox}>
                      <div className={resultStyles.statBoxLbl}><i className="ti ti-percentage" /> Percentage</div>
                      <div className={`${resultStyles.statBoxVal} ${score?.totalScore < PassScore ? resultStyles.red : resultStyles.green}`}>
                        {parseFloat(((parseInt(score?.totalScore || 0)) / (parseInt(totalMarks) || 1)) * 100).toFixed(0)}%
                      </div>
                      <div className={resultStyles.statBoxSub}>Overall Accuracy</div>
                    </div>
                    <div className={resultStyles.statBox}>
                      <div className={resultStyles.statBoxLbl}><i className="ti ti-target-arrow" /> Score</div>
                      <div className={`${resultStyles.statBoxVal} ${resultStyles.blue}`}>
                        {score?.totalScore || 0}
                      </div>
                      <div className={resultStyles.statBoxSub}>Out of {totalMarks || 0}</div>
                    </div>
                    <div className={resultStyles.statBox}>
                      <div className={resultStyles.statBoxLbl}><i className="ti ti-clock-hour-4" /> Time Taken</div>
                      <div className={resultStyles.statBoxVal}>
                        {parseFloat((score?.totalTimeTaken || 0) / 60).toFixed(2)}m
                      </div>
                      <div className={resultStyles.statBoxSub}>Total Duration</div>
                    </div>
                    <div className={resultStyles.statBox}>
                      <div className={resultStyles.statBoxLbl}><i className="ti ti-bolt" /> Speed</div>
                      <div className={resultStyles.statBoxVal}>
                        {parseInt(score?.averageTimeTaken || 0) > 60 ? parseFloat((score?.averageTimeTaken || 0) / 60).toFixed(1) : parseInt(score?.averageTimeTaken || 0)}
                      </div>
                      <div className={resultStyles.statBoxSub}>
                        {parseInt(score?.averageTimeTaken || 0) > 60 ? "mins/Q" : "secs/Q"} Average
                      </div>
                    </div>
                  </div>

                  {/* Donut Chart */}
                  <div className={resultStyles.donutWrap}>
                    <div className={resultStyles.donutSvg}>
                      {chartData?.series?.length > 0 && (
                        <DonutChart
                          id={"testResult"}
                          series={chartData?.series}
                          labels={chartData?.labels}
                          colors={chartData?.colors}
                        />
                      )}
                    </div>
                    <div className={resultStyles.donutLegend}>
                      <div className={resultStyles.donutLegendItem}>
                        <div className={resultStyles.donutDot} style={{ background: '#87CC85' }}></div> Correct: {chartData?.series?.[0] || 0}
                      </div>
                      <div className={resultStyles.donutLegendItem}>
                        <div className={resultStyles.donutDot} style={{ background: '#E43E5F' }}></div> Incorrect: {chartData?.series?.[1] || 0}
                      </div>
                      <div className={resultStyles.donutLegendItem}>
                        <div className={resultStyles.donutDot} style={{ background: '#869DF0' }}></div> Unattempted: {chartData?.series?.[2] || 0}
                      </div>
                      <div className={resultStyles.donutLegendItem}>
                        <div className={resultStyles.donutDot} style={{ background: '#4e4eff' }}></div> Not Answered: {chartData?.series?.[3] || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category-wise Results */}
              {Object.keys(groupedQuestions)?.length > 0 && (
                <div className={resultStyles.categoryCard}>
                  <div className={resultStyles.catHeader}>
                    <div className={resultStyles.catTitle}><i className="ti ti-category" /> Category-wise Progress</div>
                  </div>
                  {Object.keys(groupedQuestions).map((catName) => {
                    const catData = groupedQuestions[catName];
                    const earned = catData?.totalEarnedScore || 0;
                    const expected = catData?.totalExpectedScore || 1;
                    const pct = Math.round((earned / expected) * 100);
                    return (
                      <div className={resultStyles.catRow} key={catName}>
                        <div className={resultStyles.catName}>{catName}</div>
                        <div className={resultStyles.catBarBg}>
                          <div 
                            className={resultStyles.catBarFill} 
                            style={{ 
                              width: `${Math.min(pct, 100)}%`, 
                              background: pct >= 70 ? 'var(--green)' : pct >= 40 ? '#faad14' : 'var(--red)' 
                            }} 
                          />
                        </div>
                        <div className={resultStyles.catScoreText}>{earned} / {expected}</div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Answer Key */}
              <div className={resultStyles.answerKeyCard}>
                <div className={resultStyles.akHeader}>
                  <div className={resultStyles.akTitle}><i className="ti ti-list-check" /> Answer Key</div>
                  <div className={resultStyles.akFilters}>
                    <div className={resultStyles.akSearch}>
                      <i className="ti ti-search" />
                      <input 
                        type="text" 
                        placeholder="Search questions..." 
                        value={questionSearchQuery}
                        onChange={(e) => setQuestionSearchQuery(e.target.value)}
                      />
                    </div>
                    <select 
                      className={resultStyles.akSelect}
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <option value="All">All Categories</option>
                      {allCategories?.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {Object.keys(groupedQuestions)?.length === 0 && (questionSearchQuery || selectedCategory !== "All") ? (
                  <div style={{ textAlign: "center", padding: "2rem", color: "#999" }}>
                    <p>No questions found matching your filters.</p>
                  </div>
                ) : (
                  <>
                    {Object.keys(groupedQuestions)?.map((catName) => {
                      const groupData = groupedQuestions[catName];
                      return (
                        <div key={catName}>
                          <div className={resultStyles.catSectionHeader}>
                            <div className={resultStyles.catSectionName}>{catName}</div>
                            <div className={resultStyles.catSectionScore}>
                              Score: {groupData?.totalEarnedScore || 0} / {groupData?.totalExpectedScore || 0}
                            </div>
                          </div>
                          
                          {groupData?.questions?.map((e, i) => {
                            let flaggedQues = testRes?.value?.[testId]?.flagged?.find((que) => que?.id == e?._id);

                            if (e?.questionType?.includes("Comprehension")) {
                              return (
                                <div className={resultStyles.qBlock} key={`comp-${i}`}>
                                  <div className={resultStyles.qBlockHeader}>
                                    <div className={resultStyles.qBlockNum}>
                                      <i className="ti ti-blockquote" /> {e?.questionType}
                                    </div>
                                  </div>
                                  <div className={resultStyles.qBlockText}>
                                    {e?.questionType?.includes("Reading") ? (
                                      <div dangerouslySetInnerHTML={{ __html: parseIfJson(e?.comprehensionText) }}></div>
                                    ) : (
                                      e?.resources != undefined && e?.resources != "" && (
                                        e?.questionType !== "Reading Comprehension" && e?.questionType === "Video Comprehension"
                                          ? e?.resources?.url !== "" && <video src={e?.resources?.url} controls style={{maxWidth: '100%'}} />
                                          : e?.resources?.url !== "" && <audio src={e?.resources?.url} controls />
                                      )
                                    )}
                                  </div>
                                  
                                  {e?.questionContentArr?.map((subQues, index) => {
                                    flaggedQues = testRes?.value?.[testId]?.flagged?.find((que) => que?.id == subQues?._id);
                                    const absIndex = ques?.findIndex((q) => q?._id === subQues?._id);
                                    const qNo = absIndex !== -1 ? absIndex + 1 : questionNo++;
                                    return (
                                      <div ref={quesContainerRef?.current?.[qNo]} key={`sub-${index}`}>
                                        <QuesComp
                                          quesContainerRef={quesContainerRef}
                                          e={subQues}
                                          i={index}
                                          currentTestRes={currentTestRes}
                                          testRes={testRes}
                                          questionNo={qNo}
                                          flagged={flaggedQues}
                                        />
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            } else {
                              const absIndex = ques?.findIndex((q) => q?._id === e?._id);
                              const qNo = absIndex !== -1 ? absIndex + 1 : questionNo++;
                              return (
                                <div ref={quesContainerRef?.current?.[qNo]} key={`q-${i}`}>
                                  <QuesComp
                                    quesContainerRef={quesContainerRef}
                                    e={e}
                                    i={i}
                                    currentTestRes={currentTestRes}
                                    testRes={testRes}
                                    questionNo={qNo}
                                    flagged={flaggedQues}
                                  />
                                </div>
                              );
                            }
                          })}
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
