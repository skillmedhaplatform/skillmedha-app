"use client";
import React, { createRef, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";
import { TbTriangleInvertedFilled } from "react-icons/tb";

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
  const testRes = useSelector((state) => state?.student?.testResults);
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
    testValues = finishedTestData?.grading?.scoreRange?.find((obj) => {
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
  }, [testData?.value?.length, testRes?.value]);

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
      totalMarks > 0
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
      <div className="p-6 h-[90vh] overflow-y-auto overflow-x-hidden scroll-smooth [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#f5f5f5] [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-[20px] [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-[#f5f5f5]">
        <div className="w-full flex flex-col items-center justify-center">
          <h2 className="font-bold text-[1.3rem] text-center mb-2 [&_span]:text-[#24A058]">
            {testValues?.message ? (
              <span
                dangerouslySetInnerHTML={{
                  __html: parseIfJson(testValues?.message),
                }}
              ></span>
            ) : finishedTestData?.grading?.failIntervals?.TestFailMessage ? (
              <span
                dangerouslySetInnerHTML={{
                  __html: parseIfJson(
                    finishedTestData?.grading?.failIntervals?.TestFailMessage
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
            <h3 className="text-[#e74c3c] my-2 bg-[rgba(228,62,95,0.08)] py-2 px-6 rounded-lg border border-[rgba(228,62,95,0.2)]">
              Your Test has been Blocked
            </h3>
          )}
          {!isDataReady ? (
            <ResultSkeleton />
          ) : (
            <div
              className="mt-4 flex flex-col items-center justify-center py-6 px-8 gap-6 rounded-2xl w-full border border-[rgba(0,0,0,0.06)] shadow-[0_4px_24px_rgba(0,0,0,0.06)] [&_h2]:text-[1.2rem] [&_h2]:font-bold [&_h2]:text-[#333] [&_h2]:tracking-[0.02em]"
              style={{
                backgroundColor:
                  score?.totalScore < PassScore
                    ? "rgba(255, 0, 0, 0.1)"
                    : "rgba(4, 255, 0, 0.1)",
              }}
            >
              <h2>Your Results</h2>
              <div className="gap-8 w-full flex flex-row justify-between items-stretch">
                <div className="flex flex-col justify-between items-stretch gap-4 flex-1">
                  <Row gutter={[12, 12]}>
                    {PassScore && (
                      <Col xs={12} sm={8}>
                        <Card size="small" bordered={false} style={{ background: 'rgba(255,255,255,0.7)', height: '100%', border: '1px solid #e8e8e8', borderRadius: '10px' }}>
                          <Statistic
                            title="Status"
                            value={(score?.totalScore < PassScore) ? "Fail" : "Pass"}
                            valueStyle={{ color: (score?.totalScore < PassScore) ? '#cf1322' : '#3f8600', fontWeight: 'bold', fontSize: '1.1rem' }}
                            prefix={(score?.totalScore < PassScore) ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
                          />
                        </Card>
                      </Col>
                    )}
                    {testValues?.grade && (
                      <Col xs={12} sm={8}>
                        <Card size="small" bordered={false} style={{ background: 'rgba(255,255,255,0.7)', height: '100%', border: '1px solid #e8e8e8', borderRadius: '10px' }}>
                          <Statistic
                            title="Grade"
                            value={testValues?.grade}
                            valueStyle={{ fontWeight: 'bold', fontSize: '1.1rem' }}
                            prefix={<TrophyOutlined style={{ color: '#faad14' }} />}
                          />
                        </Card>
                      </Col>
                    )}
                    <Col xs={12} sm={8}>
                      <Card size="small" bordered={false} style={{ background: 'rgba(255,255,255,0.7)', height: '100%', border: '1px solid #e8e8e8', borderRadius: '10px' }}>
                        <Statistic
                          title="Percentage"
                          value={parseFloat(
                            ((parseInt(score?.totalScore || 0)) /
                              (parseInt(totalMarks) || 1)) *
                            100
                          ).toFixed(0)}
                          suffix="%"
                          valueStyle={{ fontWeight: 'bold', fontSize: '1.1rem' }}
                          prefix={<PercentageOutlined style={{ color: '#1da469' }} />}
                        />
                      </Card>
                    </Col>
                    <Col xs={12} sm={8}>
                      <Card size="small" bordered={false} style={{ background: 'rgba(255,255,255,0.7)', height: '100%', border: '1px solid #e8e8e8', borderRadius: '10px' }}>
                        <Statistic
                          title="Score"
                          value={`${score?.totalScore || 0} / ${totalMarks || 0}`}
                          prefix={<CheckCircleOutlined style={{ color: '#1890ff' }} />}
                        />
                      </Card>
                    </Col>
                    <Col xs={12} sm={8}>
                      <Card size="small" bordered={false} style={{ background: 'rgba(255,255,255,0.7)', height: '100%', border: '1px solid #e8e8e8', borderRadius: '10px' }}>
                        <Statistic
                          title="Time Taken"
                          value={parseFloat((score?.totalTimeTaken || 0) / 60).toFixed(2)}
                          suffix="mins"
                          prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                        />
                      </Card>
                    </Col>
                    <Col xs={12} sm={8}>
                      <Card size="small" bordered={false} style={{ background: 'rgba(255,255,255,0.7)', height: '100%', border: '1px solid #e8e8e8', borderRadius: '10px' }}>
                        <Statistic
                          title="Speed"
                          value={parseInt(score?.averageTimeTaken || 0) > 60 ? parseFloat((score?.averageTimeTaken || 0) / 60).toFixed(1) : parseInt(score?.averageTimeTaken || 0)}
                          suffix={parseInt(score?.averageTimeTaken || 0) > 60 ? "mins/Q" : "secs/Q"}
                          prefix={<ThunderboltOutlined style={{ color: '#eb2f96' }} />}
                        />
                      </Card>
                    </Col>
                  </Row>
                </div>
                <div className="bg-[linear-gradient(135deg,rgba(29,164,105,0.05)_0%,rgba(86,210,212,0.08)_100%)] border border-[rgba(29,164,105,0.12)] rounded-xl py-4 px-6 max-w-full flex flex-row items-center justify-center gap-6">
                  <div className="h-full min-w-[140px]">
                    {chartData?.series?.length > 0 && (
                      <DonutChart
                        id={"testResult"}
                        series={chartData?.series}
                        labels={chartData?.labels}
                        colors={chartData?.colors}
                      />
                    )}
                  </div>
                  <div className="flex flex-col items-center justify-start gap-[0.8rem]">
                    <div className="flex flex-row items-center justify-start w-[15rem] max-w-[15rem] gap-[0.6rem] m-0 [&_span]:w-[14px] [&_span]:h-[14px] [&_span]:rounded-[4px] [&_span]:shrink-0 [&_p]:text-[0.9rem] [&_p]:font-semibold [&_p]:text-[#444]">
                      <span style={{ backgroundColor: "#87CC85" }} />
                      <p>
                        Correct
                        <span className="!font-normal !text-[0.8rem] !text-[#888]">
                          [
                          {parseFloat(
                            ((chartData?.series?.[0] || 0) /
                              Math.max(parseInt(ques?.length || 1), 1)) *
                            100
                          ).toFixed(1)}
                          % ]
                        </span>
                      </p>
                    </div>
                    <div className="flex flex-row items-center justify-start w-[15rem] max-w-[15rem] gap-[0.6rem] m-0 [&_span]:w-[14px] [&_span]:h-[14px] [&_span]:rounded-[4px] [&_span]:shrink-0 [&_p]:text-[0.9rem] [&_p]:font-semibold [&_p]:text-[#444]">
                      <span style={{ backgroundColor: "#E43E5F" }} />
                      <p>
                        Incorrect
                        <span className="!font-normal !text-[0.8rem] !text-[#888]">
                          [
                          {parseFloat(
                            ((chartData?.series?.[1] || 0) /
                              Math.max(parseInt(ques?.length || 1), 1)) *
                            100
                          ).toFixed(1)}
                          % ]
                        </span>
                      </p>
                    </div>
                    <div className="flex flex-row items-center justify-start w-[15rem] max-w-[15rem] gap-[0.6rem] m-0 [&_span]:w-[14px] [&_span]:h-[14px] [&_span]:rounded-[4px] [&_span]:shrink-0 [&_p]:text-[0.9rem] [&_p]:font-semibold [&_p]:text-[#444]">
                      <span style={{ backgroundColor: "#869DF0" }} />
                      <p>
                        Unattempted
                        <span className="!font-normal !text-[0.8rem] !text-[#888]">
                          [
                          {parseFloat(
                            ((chartData?.series?.[2] || 0) /
                              Math.max(parseInt(ques?.length || 1), 1)) *
                            100
                          ).toFixed(1)}
                          % ]
                        </span>
                      </p>
                    </div>
                    <div className="flex flex-row items-center justify-start w-[15rem] max-w-[15rem] gap-[0.6rem] m-0 [&_span]:w-[14px] [&_span]:h-[14px] [&_span]:rounded-[4px] [&_span]:shrink-0 [&_p]:text-[0.9rem] [&_p]:font-semibold [&_p]:text-[#444]">
                      <span style={{ backgroundColor: "#4e4eff" }} />
                      <p>
                        Not Answered
                        <span className="!font-normal !text-[0.8rem] !text-[#888]">
                          [
                          {parseFloat(
                            ((chartData?.series?.[3] || 0) /
                              Math.max(parseInt(ques?.length || 1), 1)) *
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

          {/* Category-wise Results */}
          {isDataReady && Object.keys(groupedQuestions)?.length > 0 && (
            <div style={{
              marginTop: '0.5rem',
              padding: '1rem 1.5rem',
              background: '#fff',
              borderRadius: '12px',
              border: '1px solid #f0f0f0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              width: '100%',
            }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 700, color: '#333' }}>Category-wise Results</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Object.keys(groupedQuestions).map((catName) => {
                  const catData = groupedQuestions[catName];
                  const earned = catData?.totalEarnedScore || 0;
                  const expected = catData?.totalExpectedScore || 1;
                  const pct = Math.round((earned / expected) * 100);
                  return (
                    <div key={catName} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '8px 12px',
                      background: 'rgba(29,164,105,0.04)',
                      borderRadius: '8px',
                      border: '1px solid #f0f0f0',
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#333' }}>{catName}</span>
                          <span style={{ fontSize: '0.8rem', color: '#888' }}>
                            {earned} / {expected} ({pct}%)
                          </span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: '#f0f0f0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${Math.min(pct, 100)}%`,
                            height: '100%',
                            background: pct >= 70 ? '#52c41a' : pct >= 40 ? '#faad14' : '#ff4d4f',
                            borderRadius: '3px',
                            transition: 'width 0.5s ease',
                          }} />
                        </div>
                      </div>
                      <span style={{
                        fontSize: '0.75rem',
                        color: '#999',
                        whiteSpace: 'nowrap',
                      }}>{catData?.questions?.length || 0} Q</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <div className="w-full mt-4">
          <div className="flex gap-6 items-center justify-start mt-4 flex-wrap [&_h2]:text-[1rem] [&_h2]:font-semibold [&_h2]:text-[#555] [&_div]:flex [&_div]:gap-[0.4rem] [&_div]:flex-wrap [&_p]:border [&_p]:border-[rgba(29,164,105,0.3)] [&_p]:rounded-lg [&_p]:bg-[rgba(29,164,105,0.06)] [&_p]:py-[0.3rem] [&_p]:px-[0.9rem] [&_p]:cursor-pointer [&_p]:text-[0.85rem] [&_p]:font-semibold [&_p]:text-[#333] [&_p]:transition-all [&_p]:duration-200 hover:[&_p]:bg-[rgba(29,164,105,0.15)] hover:[&_p]:border-[rgba(29,164,105,0.5)]">
            {testRes?.value?.[testId]?.flagged?.length > 0 && (
              <>
                <h2>Flagged Question Numbers</h2>
                <div>
                  {testRes?.value?.[testId]?.flagged?.map((que, ind) => {
                    const questionResult = ques
                      ?.map((question, index) => ({ question, index }))
                      .find(({ question }) => question?._id === que?.id);

                    if (!questionResult) return null;

                    const { question, index } = questionResult;

                    return (
                      <p
                        key={ind}
                        onClick={() => {
                          if (quesContainerRef?.current?.[index + 1])
                            quesContainerRef?.current?.[
                              index + 1
                            ]?.current?.scrollIntoView({
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
          <h2 style={{ color: "black" }}>Answer Key</h2>

          {/* Search and Filter UI */}
          <div className="sticky top-0 z-20 bg-[rgba(255,255,255,0.95)] backdrop-blur-md py-3 px-0 flex gap-3 items-center flex-wrap border-b border-[#f0f0f0]">
            <Input
              placeholder="Search questions..."
              prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
              value={questionSearchQuery}
              onChange={(e) => setQuestionSearchQuery(e.target.value)}
              allowClear
              style={{ width: "280px" }}
            />
            <Select
              value={selectedCategory}
              onChange={(val) => setSelectedCategory(val)}
              style={{ width: "220px" }}
            >
              <Select.Option value="All">All Categories</Select.Option>
              {allCategories?.map((cat) => (
                <Select.Option key={cat} value={cat}>
                  {cat}
                </Select.Option>
              ))}
            </Select>
            {(selectedCategory !== "All" || questionSearchQuery) && (
              <Tag
                closable
                onClose={() => {
                  setSelectedCategory("All");
                  setQuestionSearchQuery("");
                }}
                color="blue"
                style={{ cursor: "pointer" }}
              >
                Clear Filters
              </Tag>
            )}
          </div>

          {!isDataReady ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : (
            <div className="[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#f9f9f9] [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-[20px] [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-[#f5f5f5]">
              {finishedTestData?.questions?.length > 0 &&
                Object.keys(groupedQuestions)?.length > 0 && (
                  <Collapse
                    defaultActiveKey={Object.keys(groupedQuestions)}
                    expandIconPosition="end"
                    expandIcon={({ isActive }) => (
                      <CaretRightOutlined
                        style={{
                          transform: isActive
                            ? "rotate(90deg)"
                            : "rotate(0deg)",
                          transition: "transform 0.3s ease",
                          fontSize: "14px",
                          color: "#666",
                        }}
                      />
                    )}
                    size="large"
                    items={Object.keys(groupedQuestions)?.map((catName) => {
                      const groupData = groupedQuestions[catName];
                      const numQuestions = groupData?.questions?.length || 0;
                      return {
                        key: catName,
                        label: (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              width: "100%",
                              paddingRight: "20px",
                            }}
                          >
                            <strong>{catName}</strong>
                            <span
                              style={{ fontSize: "0.9rem", color: "#555" }}
                            >
                              {numQuestions} Questions | Score:{" "}
                              {groupData?.totalEarnedScore || 0} /{" "}
                              {groupData?.totalExpectedScore || 0}
                            </span>
                          </div>
                        ),
                        children: groupData?.questions?.map((e, i) => {
                          let flaggedQues = testRes?.value?.[
                            testId
                          ]?.flagged?.find((que) => que?.id == e?._id);

                          if (e?.questionType?.includes("Comprehension"))
                            return (
                              <div
                                className="mt-4"
                                key={i}
                              >
                                <Collapse
                                  collapsible="header"
                                  defaultActiveKey={["1"]}
                                  expandIconPosition="end"
                                  expandIcon={({ isActive }) => (
                                    <TbTriangleInvertedFilled
                                      style={{
                                        transform: isActive
                                          ? "rotate(120deg)"
                                          : "rotate(30deg)",
                                        transition: "transform 0.3s",
                                        fontSize: "1rem",
                                      }}
                                    />
                                  )}
                                  size="large"
                                  items={[
                                    {
                                      key: "1",
                                      label: (
                                        <div
                                          className="font-semibold"
                                        >
                                          <div className="flex w-[60%] justify-between [&_div]:my-2 [&_span]:font-bold">
                                            <div>
                                              <span>
                                                {e?.questionType}
                                              </span>
                                            </div>
                                          </div>
                                          {e?.questionType?.includes(
                                            "Reading"
                                          ) ? (
                                            <div
                                              dangerouslySetInnerHTML={{
                                                __html: parseIfJson(
                                                  e?.comprehensionText
                                                ),
                                              }}
                                              className="my-2"
                                            ></div>
                                          ) : (
                                            e?.resources != undefined &&
                                            e?.resources != "" &&
                                            (e?.questionType !==
                                              "Reading Comprehension" &&
                                              e?.questionType ===
                                              "Video Comprehension"
                                              ? e?.resources?.url !== "" && (
                                                <video
                                                  src={e?.resources?.url}
                                                  controls
                                                />
                                              )
                                              : e?.resources?.url !== "" && (
                                                <audio
                                                  src={e?.resources?.url}
                                                  controls
                                                />
                                              ))
                                          )}
                                        </div>
                                      ),
                                      children:
                                        e?.questionContentArr?.map(
                                          (subQues, index) => {
                                            flaggedQues = testRes?.value?.[
                                              testId
                                            ]?.flagged?.find(
                                              (que) =>
                                                que?.id == subQues?._id
                                            );
                                            const absIndex = ques?.findIndex(
                                              (q) => q?._id === subQues?._id
                                            );
                                            const qNo =
                                              absIndex !== -1
                                                ? absIndex + 1
                                                : questionNo++;
                                            return (
                                              <div
                                                className={
                                                  resultStyles.comp_div
                                                }
                                                ref={
                                                  quesContainerRef?.current?.[
                                                  qNo
                                                  ]
                                                }
                                                key={index}
                                              >
                                                <QuesComp
                                                  quesContainerRef={
                                                    quesContainerRef
                                                  }
                                                  e={subQues}
                                                  i={index}
                                                  currentTestRes={
                                                    currentTestRes
                                                  }
                                                  testRes={testRes}
                                                  questionNo={qNo}
                                                  flagged={flaggedQues}
                                                />
                                              </div>
                                            );
                                          }
                                        ),
                                    },
                                  ]}
                                ></Collapse>
                              </div>
                            );
                          else {
                            const absIndex = ques?.findIndex(
                              (q) => q?._id === e?._id
                            );
                            const qNo =
                              absIndex !== -1
                                ? absIndex + 1
                                : questionNo++;
                            return (
                              <div
                                ref={quesContainerRef?.current?.[qNo]}
                                key={i}
                              >
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
                        }),
                      };
                    })}
                  />
                )}
              {Object.keys(groupedQuestions)?.length === 0 &&
                (questionSearchQuery || selectedCategory !== "All") && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "2rem",
                      color: "#999",
                    }}
                  >
                    <p>No questions found matching your filters.</p>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
