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
import { saveTestResults, getStudent } from "@/redux/slices/student";
import ResultSkeleton from "../../reusable_comp/resultsskeleton";
import { parseIfJson } from "../../reusable_comp/jsonparse";
import { getLstorage, getSstorage, setSstorage } from "@/universalUtils/windowMW";
import { deriveResultSummary } from "@/app/testportal/utils/resultPersistence";

export default function Page() {
  const testRes = useSelector((state) => state.student.testResults);
  const testData = useSelector((state) => state?.tests?.finishedTestData);
  const studentData = useSelector((state) => state?.student?.student?.data);
  const StudentData_New = useSelector(
    (state) => state?.student?.studentVals
  );
  const finishedTestData = useSelector(
    (state) => state?.tests?.finishedTestData?.value?.test
  );

  const testStatus = useSelector((state) => state?.tests?.testStatus);

  const [totalMarks, setTotalMarks] = useState(0);
  const [testBlocked, setTestBlocked] = useState("");
  const [resultConfig, setResultConfig] = useState(null);
  const [apiError, setApiError] = useState("");

  const searchQuery = useSearchParams();
  const progressId = searchQuery.get("progressId");

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
      const derivedScoreData = deriveResultSummary({
        response: testRes?.value?.[testId]?.response || {},
        questions: finishedTestData?.questions || [],
        scoreData: testRes?.value?.[testId]?.scoreData || {},
      });
      const {
        correctQues = "",
        unattemptedQues,
        incorrectQues,
        finalScore: totalScore,
        totalTimeTaken,
        averageTimeTaken,
        notAnswered,
      } = derivedScoreData;
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
  }, [testData?.value, testRes?.value, testId, finishedTestData?.questions]);

  const extraStats = useMemo(() => {
    if (!ques?.length) return { flagged: 0, marked: 0, answeredMarked: 0 };
    
    let flagged = 0;
    let marked = 0;
    let answeredMarked = 0;
    
    ques.forEach((q) => {
      let isFlagged = testRes?.value?.[testId]?.flagged?.some((que) => que?.id == q?._id);
      let isMarked = testRes?.value?.[testId]?.marked?.includes(q?._id);
      let studentAnswers = currentTestRes?.[q?._id]?.answers;
      let isAnswered = Array.isArray(studentAnswers) && studentAnswers.length > 0;
      
      if (isFlagged) flagged++;
      if (isMarked && !isAnswered) marked++;
      if (isMarked && isAnswered) answeredMarked++;
    });
    
    return { flagged, marked, answeredMarked };
  }, [ques, testRes, testId, currentTestRes]);

  const shortAns = useRef({});
  const dispatch = useDispatch();

  const allCompletedResults = useMemo(() => {
    if (!StudentData_New?.progress) return [];
    return StudentData_New.progress.filter(
      (entry) => entry?.testId == testId && (entry?.response || entry?.scoreData)
    ).sort((a, b) => {
       const dateA = new Date(a.createdAt || 0).getTime();
       const dateB = new Date(b.createdAt || 0).getTime();
       return dateA - dateB;
    });
  }, [StudentData_New?.progress, testId]);

  const bestCompletedResultId = useMemo(() => {
    const completedResults = [...allCompletedResults];
    if (completedResults.length === 0) return null;
    const best = completedResults.sort((a, b) => {
      const aHasScoreData = Boolean(a?.scoreData && Object.keys(a.scoreData).length);
      const bHasScoreData = Boolean(b?.scoreData && Object.keys(b.scoreData).length);
      if (aHasScoreData !== bHasScoreData) return aHasScoreData ? -1 : 1;

      const aResponseCount = Object.keys(a?.response || {}).length;
      const bResponseCount = Object.keys(b?.response || {}).length;
      if (aResponseCount !== bResponseCount) return bResponseCount - aResponseCount;

      const aScore = Number(a?.scoreData?.finalScore || 0);
      const bScore = Number(b?.scoreData?.finalScore || 0);
      if (aScore !== bScore) return bScore - aScore;

      return 0;
    })[0];
    return best?._id;
  }, [allCompletedResults]);

  // Persist results to sessionStorage when available
  useEffect(() => {
    if (testId && testRes?.value?.[testId]) {
      setSstorage(`testResult_${testId}`, JSON.stringify(testRes.value[testId]));
    }
  }, [testRes?.value, testId]);

  // Fetch required data on mount
  useEffect(() => {
    const studentIdStr = studentData?._id || getLstorage("sId");
    if (studentIdStr && testId) {
      dispatch(getStudent({ id: studentIdStr }));
      dispatch(fetchTestData({ testId }));
    }
  }, [studentData?._id, testId, dispatch]);

  // Restore results from StudentData_New or sessionStorage
  useEffect(() => {
    if (testId && !testRes?.value?.[testId]) {
      // First try to restore from sessionStorage
      const savedResult = getSstorage(`testResult_${testId}`);
      if (savedResult) {
        try {
          const parsed = JSON.parse(savedResult);
          dispatch(saveTestResults(parsed));
          return;
        } catch (e) {
          console.error("Failed to parse saved result:", e);
        }
      }

      // Also try to get from student progress
      const completedResults = (StudentData_New?.progress || [])
        .filter((entry) => entry?.testId === testId)
        .filter((entry) => entry?.response || entry?.scoreData);

      const bestCompletedResult = completedResults.sort((a, b) => {
        const aHasScoreData = Boolean(a?.scoreData && Object.keys(a.scoreData).length);
        const bHasScoreData = Boolean(b?.scoreData && Object.keys(b.scoreData).length);
        if (aHasScoreData !== bHasScoreData) return aHasScoreData ? -1 : 1;

        const aResponseCount = Object.keys(a?.response || {}).length;
        const bResponseCount = Object.keys(b?.response || {}).length;
        if (aResponseCount !== bResponseCount) return bResponseCount - aResponseCount;

        const aScore = Number(a?.scoreData?.finalScore || 0);
        const bScore = Number(b?.scoreData?.finalScore || 0);
        if (aScore !== bScore) return bScore - aScore;

        return 0;
      })[0];

      if (bestCompletedResult) {
        const derivedScoreData = deriveResultSummary({
          response: bestCompletedResult?.response || {},
          questions: finishedTestData?.questions || [],
          scoreData: bestCompletedResult?.scoreData || {},
        });

        dispatch(
          saveTestResults({
            userId: bestCompletedResult?.userId || studentData?._id,
            testId: bestCompletedResult?.testId || testId,
            response: bestCompletedResult?.response,
            studentData: bestCompletedResult?.studentData || studentData,
            flagged: bestCompletedResult?.flagged,
            marked: bestCompletedResult?.marked,
            scoreData: derivedScoreData,
          })
        );
      }
    }
  }, [StudentData_New, testId, testRes?.value, dispatch, finishedTestData?.questions, studentData?._id, progressId]);

  // Fetch from getResultsData API
  useEffect(() => {
    if (progressId && finishedTestData?.questions?.length > 0) {
      const fetchApi = async () => {
        try {
            const token = getLstorage("token");
            const res = await axios.post(`${testUrl}/getResultsData/${progressId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = res.data;
            setResultConfig({
               type: data.type,
               permissions: data.permissions || {},
               downloadAllowed: data.downloadAllowed,
               previewAllowed: data.previewAllowed
            });
            
            const derivedScoreData = deriveResultSummary({
              response: data.data.response || {},
              questions: finishedTestData.questions || [],
              scoreData: data.data.scoreData || {},
            });

            dispatch(saveTestResults({
              userId: studentData?._id,
              testId: testId,
              response: data.data.response,
              studentData: data.data.studentData || studentData,
              flagged: data.data.flagged,
              marked: data.data.marked,
              scoreData: derivedScoreData,
            }));
        } catch (e) {
            setApiError(e.response?.data?.err || "Failed to load result");
        }
      }
      fetchApi();
    }
  }, [progressId, finishedTestData?.questions]);

  // Handle one-time unmount
  useEffect(() => {
    return () => {
      if (resultConfig?.type === 'ONE_TIME' && progressId) {
         const token = getLstorage("token");
         axios.post(`${testUrl}/markOneTimeResultViewed/${progressId}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
         }).catch(err => console.error(err));
      }
    };
  }, [resultConfig?.type, progressId]);


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

  const loading = (testStatus === "evaluatingTest" || !isDataReady) && !apiError;

  const fromParam = searchQuery.get("from");
  const handleBack = () => {
    if (resultConfig?.type === 'ONE_TIME' && progressId) {
       const token = getLstorage("token");
       axios.post(`${testUrl}/markOneTimeResultViewed/${progressId}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
       }).catch(err => console.error(err));
    }
    if (fromParam === "job") {
      nav.push("/student/jobAssessments");
    } else {
      nav.push("/student/tests");
    }
  };

  const isDownload = searchQuery.get("download") === "true";
  useEffect(() => {
    if (isDataReady && !loading && isDownload && (!resultConfig || resultConfig.downloadAllowed !== false)) {
      setTimeout(() => {
        window.print();
      }, 1000);
    }
  }, [isDataReady, loading, isDownload, resultConfig]);

  let questionNo = 1;

  const quesContainerRef = useRef([]);
  quesContainerRef.current = ques?.map(
    (_, ind) => quesContainerRef.current[ind] ?? createRef()
  );

  // Search and filter state
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [questionSearchQuery, setQuestionSearchQuery] = useState("");

  // Calculate total scores per category (unfiltered)
  const categoryScores = useMemo(() => {
    if (!finishedTestData?.questions?.length) return {};
    const groups = {};

    finishedTestData.questions.forEach((q) => {
      let cat = "Uncategorized";
      if (q?.questionCategory && q?.questionCategory?.length > 0) {
        cat = q?.questionCategory?.[0]?.name || "Uncategorized";
      }

      if (!groups[cat]) {
        groups[cat] = {
          totalExpectedScore: 0,
          totalEarnedScore: 0,
        };
      }

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
      if (singleQuestion && singleQuestion?.status !== "notanswered" && singleQuestion?.status !== "unattempted") {
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
  }, [finishedTestData?.questions, currentTestRes]);

  // Filter questions based on search, category, and status (retaining original order)
  const filteredQuestions = useMemo(() => {
    if (!ques?.length) return [];
    const query = questionSearchQuery?.toLowerCase() || "";

    return ques.filter((q) => {
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
      if (!matchesSearch) return false;

      // Category filter
      let cat = "Uncategorized";
      if (q?.questionCategory && q?.questionCategory?.length > 0) {
        cat = q?.questionCategory?.[0]?.name || "Uncategorized";
      } else if (q?.qType?.includes("Comprehension")) {
        // Find parent category for comprehension questions
        const parentQ = finishedTestData?.questions?.find(pq => 
          pq?.questionContentArr?.some(sq => sq?._id === q?._id)
        );
        if (parentQ?.questionCategory?.length > 0) {
          cat = parentQ?.questionCategory?.[0]?.name || "Uncategorized";
        }
      }
      if (selectedCategory !== "All" && cat !== selectedCategory) return false;

      // Status filter
      if (selectedStatus !== "All") {
        let isFlagged = testRes?.value?.[testId]?.flagged?.some((que) => que?.id == q?._id);
        let isMarked = testRes?.value?.[testId]?.marked?.includes(q?._id);
        let studentAnswers = currentTestRes?.[q?._id]?.answers;
        let isAnswered = Array.isArray(studentAnswers) && studentAnswers.length > 0;

        if (selectedStatus === "Flagged" && !isFlagged) return false;
        if (selectedStatus === "Marked" && !(isMarked && !isAnswered)) return false;
        if (selectedStatus === "AnsweredMarked" && !(isMarked && isAnswered)) return false;
      }

      // Skipped question filter based on config
      if (resultConfig && resultConfig.permissions?.showSkippedQuestions === false) {
        let studentAnswers = currentTestRes?.[q?._id]?.answers;
        let isAnswered = Array.isArray(studentAnswers) && studentAnswers.length > 0;
        if (!isAnswered) {
          return false;
        }
      }

      return true;
    });
  }, [ques, questionSearchQuery, selectedCategory, selectedStatus, testRes, testId, currentTestRes, finishedTestData, resultConfig]);

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

  if (apiError) {
    return (
      <div style={{ padding: "4rem", textAlign: "center" }}>
        <i className="ti ti-lock" style={{ fontSize: "4rem", color: "#ef4444" }}></i>
        <h2 style={{ marginTop: "1rem", color: "#1e293b" }}>Access Denied</h2>
        <p style={{ marginTop: "0.5rem", fontSize: "1.1rem", color: "#64748b" }}>
          {apiError}
        </p>
        <button
          onClick={() => nav.push("/student/testResults")}
          className="px-6 py-2 mt-6 bg-blue-600 text-white rounded-md font-medium shadow-sm hover:bg-blue-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const rawPassScore = finishedTestData?.grading?.passScore !== undefined ? finishedTestData?.grading?.passScore : finishedTestData?.grading?.gradingCriteria?.passScore;
  const hasPassMark = rawPassScore !== undefined && rawPassScore !== null && rawPassScore !== "";
  const PassScoreNum = hasPassMark ? Number(rawPassScore) : 0;
  const isFailGrade = testValues?.grade && testValues.grade.toLowerCase().includes("fail");
  
  let isPassed = null;
  if (hasPassMark) {
    isPassed = Number(score?.totalScore || 0) >= PassScoreNum;
  } else if (isFailGrade) {
    isPassed = false;
  }

  const canShow = (field) => {
    if (!resultConfig) return true; // Default allow for legacy/unconfigured
    return resultConfig.permissions?.[field] !== false;
  };

  return (
    <div style={{ height: "calc(100vh - 72px)", display: "flex", flexDirection: "column", overflow: "hidden", margin: "0", padding: "0" }}>
      <div className="z-50 shrink-0">
        <StudentPageHeader title="Test Result" />
      </div>
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
              {canShow('showPassFail') && (
              <div className={`${resultStyles.resultBanner} ${isPassed === false ? resultStyles.fail : resultStyles.pass}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                  <div className={resultStyles.resultBannerIcon}>
                    {isPassed === false ? (
                      <i className="ti ti-x" />
                    ) : (
                      <i className="ti ti-check" />
                    )}
                  </div>
                  <div>
                    <div className={resultStyles.resultBannerTitle}>
                      {isPassed === false ? "Test Failed" : isPassed === true ? "Test Passed Successfully!" : "Test Completed!"}
                    </div>
                    <div className={resultStyles.resultBannerSub}>
                      {isPassed === false ? (
                        <span>Try again to get a good score! <br/> {testValues?.message ? <span dangerouslySetInnerHTML={{ __html: parseIfJson(testValues?.message) }}></span> : ''}</span>
                      ) : isPassed === true ? (
                        <span>{testValues?.message ? <span dangerouslySetInnerHTML={{ __html: parseIfJson(testValues?.message) }}></span> : ''}</span>
                      ) : testValues?.message ? (
                        <span dangerouslySetInnerHTML={{ __html: parseIfJson(testValues?.message) }}></span>
                      ) : finishedTestData?.grading?.TestEndMessage ? (
                        <span dangerouslySetInnerHTML={{ __html: parseIfJson(finishedTestData?.grading?.TestEndMessage) }}></span>
                      ) : (
                        <span>Thank you for attempting {testData?.value?.test?.title}</span>
                      )}
                    </div>
                  </div>
                </div>
              {canShow('showPassFail') && (
                <div style={{ marginLeft: 'auto', flexShrink: 0, display: 'flex', gap: '10px' }}>
                  {(!resultConfig || resultConfig.downloadAllowed !== false) && (
                    <button
                      onClick={() => window.print()}
                      className="px-4 py-2 bg-blue-50 text-blue-700 rounded-md font-medium shadow-sm hover:bg-blue-100 border border-blue-200 transition-colors flex items-center gap-2 cursor-pointer"
                      style={{ outline: 'none' }}
                    >
                      <i className="ti ti-download" /> Download PDF
                    </button>
                  )}
                  <button
                    onClick={handleBack}
                    className="px-4 py-2 bg-white text-gray-800 rounded-md font-medium shadow-sm hover:bg-gray-50 border border-gray-200 transition-colors flex items-center gap-2 cursor-pointer"
                    style={{ outline: 'none' }}
                  >
                    <i className="ti ti-arrow-left" /> Back to Tests
                  </button>
                </div>
              )}
              </div>
              )}
              
              {/* We need the back button even if banner is hidden, so if banner is hidden we just render the back button alone */}
              {!canShow('showPassFail') && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px', gap: '10px' }}>
                  {(!resultConfig || resultConfig.downloadAllowed !== false) && (
                    <button
                      onClick={() => window.print()}
                      className="px-4 py-2 bg-blue-50 text-blue-700 rounded-md font-medium shadow-sm hover:bg-blue-100 border border-blue-200 transition-colors flex items-center gap-2 cursor-pointer"
                      style={{ outline: 'none' }}
                    >
                      <i className="ti ti-download" /> Download PDF
                    </button>
                  )}
                  <button
                    onClick={handleBack}
                    className="px-4 py-2 bg-white text-gray-800 rounded-md font-medium shadow-sm hover:bg-gray-50 border border-gray-200 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <i className="ti ti-arrow-left" /> Back to Tests
                  </button>
                </div>
              )}

              {/* Attempts History */}
              {allCompletedResults?.length > 1 && (
                <div className={resultStyles.overviewCard} style={{ marginBottom: "20px" }}>
                  <div className={resultStyles.ocHeader}>
                    <i className="ti ti-history" /> Attempts History
                  </div>
                  <div className={resultStyles.ocBody} style={{ flexDirection: "column", gap: "10px", alignItems: "stretch" }}>
                    {allCompletedResults.map((attempt, index) => {
                      const isCurrent = attempt._id === (progressId || bestCompletedResultId);
                      const attemptScore = attempt?.scoreData?.finalScore !== undefined ? attempt.scoreData.finalScore : attempt?.score || 0;
                      const attemptPercent = totalMarks > 0 ? Math.round((Number(attemptScore) / totalMarks) * 100) : 0;
                      const attemptDate = attempt.createdAt ? new Date(attempt.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "N/A";
                      
                      return (
                        <div key={attempt._id || index} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: isCurrent ? "#f0f7ff" : "#fff", border: isCurrent ? "1px solid #1E69DA" : "1px solid #e2e8f0", borderRadius: "8px", flexWrap: "wrap", gap: "10px" }}>
                           <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                             <span style={{ fontWeight: "bold", color: isCurrent ? "#1E69DA" : "#1e293b", fontSize: "15px" }}>Attempt {index + 1} {isCurrent && "(Currently Viewing)"}</span>
                             <span style={{ fontSize: "12px", color: "#64748b" }}><i className="ti ti-calendar-event" /> {attemptDate}</span>
                           </div>
                           <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                             <div style={{ textAlign: "right" }}>
                                <div style={{ fontWeight: "bold", color: "#1e293b", fontSize: "14px" }}>Score: {attemptScore}</div>
                                <div style={{ fontSize: "12px", color: "#64748b" }}>Accuracy: {attemptPercent}%</div>
                             </div>
                             {!isCurrent && (
                               <button 
                                 onClick={() => {
                                    dispatch(fetchTestData({ testId: attempt.testId }));
                                    nav.push(`/student/tests/${testData?.value?.test?.title?.split(" ").join("-")}/result?testId=${testId}&progressId=${attempt._id}`);
                                 }}
                                 className="px-4 py-2 bg-white text-gray-800 rounded-md font-medium shadow-sm hover:bg-gray-50 border border-gray-200 transition-colors flex items-center gap-2 cursor-pointer text-[13px]"
                                 style={{ outline: 'none' }}
                               >
                                 View Result
                               </button>
                             )}
                           </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Score Overview */}
              {(canShow('showPercentage') || canShow('showMarks') || canShow('showTimeTaken')) && (
              <div className={resultStyles.overviewCard}>
                <div className={resultStyles.ocHeader}>
                  <i className="ti ti-chart-bar" /> Score Overview
                </div>
                <div className={resultStyles.ocBody}>
                  <div className={resultStyles.ocStats}>
                    {canShow('showPercentage') && (
                    <div className={resultStyles.statBox}>
                      <div className={resultStyles.statBoxLbl}><i className="ti ti-percentage" /> Percentage</div>
                      <div className={`${resultStyles.statBoxVal} ${score?.totalScore < PassScore ? resultStyles.red : resultStyles.green}`}>
                        {parseFloat(((parseInt(score?.totalScore || 0)) / (parseInt(totalMarks) || 1)) * 100).toFixed(0)}%
                      </div>
                      <div className={resultStyles.statBoxSub}>Overall Accuracy</div>
                    </div>
                    )}
                    {canShow('showMarks') && (
                    <div className={resultStyles.statBox}>
                      <div className={resultStyles.statBoxLbl}><i className="ti ti-target-arrow" /> Score</div>
                      <div className={`${resultStyles.statBoxVal} ${resultStyles.blue}`}>
                        {score?.totalScore || 0}
                      </div>
                      <div className={resultStyles.statBoxSub}>Out of {totalMarks || 0}</div>
                    </div>
                    )}
                    {canShow('showTimeTaken') && (
                      <>
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
                      </>
                    )}
                  </div>

                  {/* Extra Status Stats */}
                  <div className={resultStyles.extraStatsWrap}>
                    <div className={resultStyles.extraStatItem}>
                      <div className={`${resultStyles.extraStatIcon} ${resultStyles.flagged}`}>
                        {extraStats.flagged}
                      </div>
                      <div className={resultStyles.extraStatInfo}>
                        <div className={resultStyles.extraStatLbl}>Flagged</div>
                      </div>
                    </div>
                    <div className={resultStyles.extraStatItem}>
                      <div className={`${resultStyles.extraStatIcon} ${resultStyles.marked}`}>
                        {extraStats.marked}
                      </div>
                      <div className={resultStyles.extraStatInfo}>
                        <div className={resultStyles.extraStatLbl}>Marked for Review</div>
                      </div>
                    </div>
                    <div className={resultStyles.extraStatItem}>
                      <div className={`${resultStyles.extraStatIcon} ${resultStyles.markedAnswered}`}>
                        {extraStats.answeredMarked}
                      </div>
                      <div className={resultStyles.extraStatInfo}>
                        <div className={resultStyles.extraStatLbl}>Answered & Marked</div>
                      </div>
                    </div>
                  </div>

                  {/* Donut Chart */}
                  {canShow('showDonutGraph') && (
                  <div className={resultStyles.donutWrap}>
                    <div className={resultStyles.donutSvg}>
                      {chartData?.series?.length > 0 && (
                        <DonutChart
                          id={"testResult"}
                          series={chartData?.series}
                          labels={chartData?.labels}
                          colors={chartData?.colors}
                          width={"100%"}
                          height={"100%"}
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
                  )}
                </div>
              </div>
              )}

              {/* Category-wise Results */}
              {Object.keys(categoryScores)?.length > 0 && canShow('showTopicWise') && (
                <div className={resultStyles.categoryCard}>
                  <div className={resultStyles.catHeader}>
                    <div className={resultStyles.catTitle}><i className="ti ti-category" /> Category-wise Progress</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', padding: '1.5rem' }}>
                    {Object.keys(categoryScores).map((catName) => {
                      const catData = categoryScores[catName];
                      const earned = catData?.totalEarnedScore || 0;
                      const expected = catData?.totalExpectedScore || 1;
                      return (
                        <div key={catName} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.75rem', textAlign: 'center' }}>{catName}</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '100%', padding: '0 0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                              <span style={{ color: '#64748b', fontWeight: '500' }}>Obtained Marks:</span>
                              <span style={{ fontWeight: '700', color: earned < 0 ? '#ef4444' : '#3b82f6' }}>{earned}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                              <span style={{ color: '#64748b', fontWeight: '500' }}>Total Marks:</span>
                              <span style={{ fontWeight: '700', color: '#1e293b' }}>{expected}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Answer Key */}
              {canShow('showQuestions') && (
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
                    <select 
                      className={resultStyles.akSelect}
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                      <option value="All">All Statuses</option>
                      <option value="Flagged">Flagged Questions</option>
                      <option value="Marked">Marked for Review</option>
                      <option value="AnsweredMarked">Answered & Marked</option>
                    </select>
                  </div>
                </div>

                {filteredQuestions?.length === 0 && (questionSearchQuery || selectedCategory !== "All" || selectedStatus !== "All") ? (
                  <div style={{ textAlign: "center", padding: "2rem", color: "#999" }}>
                    <p>No questions found matching your filters.</p>
                  </div>
                ) : (
                  <>
                    {filteredQuestions?.map((e, i) => {
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
                                    resultConfig={resultConfig}
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
                              resultConfig={resultConfig}
                            />
                          </div>
                        );
                      }
                    })}
                  </>
                )}
              </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
