"use client";
import React, { createRef, useEffect, useRef, useState } from "react";
import progressStyles from "../../styles/progress.module.scss";
import resultStyles from "../../styles/results.module.scss";
import {
  Button,
  Collapse,
  Input,
  Table,
  Modal,
  Result,
  Skeleton,
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Badge,
  Select,
  Tag,
  message,
} from "antd";
import {
  CopyOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ArrowLeftOutlined,
  DownloadOutlined,
  UserOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
  WarningOutlined,
  KeyOutlined,
  StarOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { TbTriangleInvertedFilled } from "react-icons/tb";
import { useDispatch, useSelector } from "react-redux";
import { getOneProgress } from "@/redux/slices/testportal_admin/slice/resultsDatabase";
import { getDepartments } from "@/redux/slices/testportal_admin/slice/studentSlice";
import DonutChart from "@/app/testportal_admin/(protected)/results-database/utils/donutChart";
import { useRouter, useSearchParams } from "next/navigation";
import QuesComp from "../../components/quesComp";
import { parseIfJson } from "@/utils/windowMW";

const { Title, Text } = Typography;
const { Column } = Table;

const avatarColors = [
  "#1e69da", // TPO Blue
  "#24a058", // Green
  "#a855f7", // Purple
  "#f59e0b", // Orange
  "#06b6d4", // Cyan
  "#ec4899", // Pink
  "#ef4444", // Red
];

export default function StudentResult({ params }) {
  const { id } = React.use(params);
  const dispatch = useDispatch();
  const nav = useRouter();
  const searchParams = useSearchParams();

  const singleProgress = useSelector((state) => state.resultsDatabase?.singleProgress);
  const singleProgressStatus = useSelector((state) => state.resultsDatabase?.singleProgressStatus);
  const departmentsList = useSelector((state) => state.Student.departments.value) || [];

  const deptMap = React.useMemo(() => {
    const map = {};
    departmentsList.forEach((d) => {
      if (d?._id) map[d._id] = d.title || d._id;
    });
    return map;
  }, [departmentsList]);

  const studentDeptId = singleProgress?.studentDetails?.department;
  const currentDeptName = studentDeptId ? (deptMap[studentDeptId] || studentDeptId) : "N/A";

  useEffect(() => {
    if (id) {
      dispatch(getOneProgress({ id }));
      dispatch(getDepartments());
    }
  }, [id, dispatch]);

  const testRes = singleProgress;
  const blockedmsgVal = singleProgress?.studentData?.blockMessage;
  const testData = singleProgress?.testDetails;
  const finishedTestData = singleProgress?.testDetails;

  const [totalMarks, setTotalMarks] = useState(0);
  const [ques, setQues] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const contentRef = useRef(null);

  // Read initials from URL params, defaulting to "All" and "" respectively
  const initialCategory = searchParams.get("category") || "All";
  const initialSearch = searchParams.get("search") || "";

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [questionSearchQuery, setQuestionSearchQuery] = useState(initialSearch);

  // Sync state changes back to URL
  useEffect(() => {
    const currentSearch = searchParams.toString();
    const urlParams = new URLSearchParams(currentSearch);

    if (selectedCategory && selectedCategory !== "All") {
      urlParams.set("category", selectedCategory);
    } else {
      urlParams.delete("category");
    }

    if (questionSearchQuery) {
      urlParams.set("search", questionSearchQuery);
    } else {
      urlParams.delete("search");
    }

    const newSearch = urlParams.toString();

    if (currentSearch !== newSearch) {
      const newPath = newSearch
        ? `/testportal_admin/results-database/student-result/${id}?${newSearch}`
        : `/testportal_admin/results-database/student-result/${id}`;
      nav.replace(newPath, { scroll: false });
    }
  }, [selectedCategory, questionSearchQuery, id, nav, searchParams]);

  const handleClearCategory = () => setSelectedCategory("All");
  const handleClearSearch = () => setQuestionSearchQuery("");
  const handleClearAll = () => {
    setSelectedCategory("All");
    setQuestionSearchQuery("");
  };

  useEffect(() => {
    if (testData?.questions?.length) {
      const updatedQues = [];
      for (let i = 0; i < testData?.questions.length; i++) {
        const question = testData?.questions[i];
        if (question?.questionType?.includes("Comprehension")) {
          updatedQues.push(...(question?.questionContentArr || []));
        } else {
          updatedQues.push(question);
        }
      }
      setQues(updatedQues);
    }
  }, [finishedTestData?._id, finishedTestData?.questions?.length]);

  useEffect(() => {
    if (finishedTestData?.questions) {
      const totalMarksEachTests = ques?.map((question) => {
        let scoreVal =
          Number(question?.scoreSettings?.pointsForCorrectAns) ||
          Number(question?.scoreSettings?.PointsForEachCorrectAnswer) ||
          0;

        if (
          question?.scoreSettings?.PointsForEachCorrectAnswer &&
          question?.answer?.multipleChoice
        ) {
          const correctOptionsCount = Object.values(question.answer.multipleChoice).filter(
            (isCorrect) => isCorrect === true
          ).length;
          scoreVal = correctOptionsCount * question.scoreSettings.PointsForEachCorrectAnswer;
        }

        const bonusPoints = question?.scoreSettings?.bonusPointsForAllCorrect
          ? Number(question?.scoreSettings?.bonusPointsForAllCorrect)
          : 0;

        return scoreVal + +bonusPoints;
      });

      const total = totalMarksEachTests.reduce((acc, curr) => +acc + +curr, 0);
      setTotalMarks(total);
    }
  }, [ques?.length]);

  const PassScore = finishedTestData?.grading?.gradingCriteria?.passScore;
  const [score, setScore] = useState({});
  const [chartData, setChartData] = useState({
    series: [],
    labels: [],
    colors: [],
  });

  const sqTestId = testData?._id;
  let testId = sqTestId;
  const currentTestRes = testRes && testId && testRes?.response;
  const totalScore = parseInt(score?.totalScore);

  let testValues;
  if (totalScore < 0) {
    testValues = finishedTestData?.grading?.scoreRange?.[
      finishedTestData?.grading?.scoreRange?.length - 1
    ];
  } else {
    testValues = finishedTestData?.grading?.scoreRange?.find((obj) => {
      const totalScoreVal = parseInt(score?.totalScore);
      const scoreFrom = parseInt(obj?.scoreFrom);
      const scoreTo = parseInt(obj?.scoreTo);
      return totalScoreVal >= scoreTo && totalScoreVal <= scoreFrom;
    });
  }

  useEffect(() => {
    if (!testData || !testRes) return;
    const {
      correctQues,
      unattemptedQues,
      incorrectQues,
      finalScore: totalScoreVal,
      totalTimeTaken,
      averageTimeTaken,
      notAnswered,
    } = testRes?.scoreData;
    setScore({ totalScore: totalScoreVal, totalTimeTaken, averageTimeTaken });

    setChartData({
      series: [correctQues, incorrectQues, unattemptedQues, notAnswered],
      labels: ["Correct Answers", "Incorrect Answers", "Unattempted Questions", "Not Answered"],
      colors: ["#87CC85", "#E43E5F", "#869DF0", "#4e4eff"],
    });
  }, [testRes?._id]);

  const quesContainerRef = useRef([]);
  if (ques?.length) {
    for (let i = 0; i <= ques.length; i++) {
      if (!quesContainerRef.current[i]) quesContainerRef.current[i] = createRef();
    }
  }

  const groupedQuestions = React.useMemo(() => {
    if (!testData?.questions?.length) return {};
    const groups = {};
    const query = questionSearchQuery.toLowerCase();

    testData.questions.forEach((q) => {
      let matchesSearch = true;
      if (query.trim() !== "") {
        const questionText = q?.questionContent?.question?.toLowerCase() || "";
        const optionsText = Object.keys(q?.questionContent || {})
          .filter((k) => k.includes("option"))
          .map((k) => q.questionContent[k]?.toLowerCase() || "")
          .join(" ");

        matchesSearch = questionText.includes(query) || optionsText.includes(query);
      }
      if (!matchesSearch) return;

      let cat = "Uncategorized";
      if (q?.questionCategory && q?.questionCategory?.length > 0) {
        cat = q.questionCategory[0]?.name || "Uncategorized";
      }
      if (!groups[cat]) {
        groups[cat] = { questions: [], totalExpectedScore: 0, totalEarnedScore: 0 };
      }
      groups[cat].questions.push(q);

      let maxQScore = 0;
      if (q?.scoreSettings?.scoreType === "fullScore") {
        maxQScore = Number(q?.scoreSettings?.pointsForCorrectAns) || Number(q?.questionScore) || 0;
      } else if (q?.scoreSettings?.scoreType === "partialScore") {
        const correctOptionsCount = q?.answer?.multipleChoice
          ? Object.values(q.answer.multipleChoice).filter(Boolean).length
          : 1;
        maxQScore =
          correctOptionsCount * Number(q?.scoreSettings?.PointsForEachCorrectAnswer || 0) +
          Number(q?.scoreSettings?.bonusPointsForAllCorrect || 0);
      }
      groups[cat].totalExpectedScore += maxQScore;

      const singleQuestion = currentTestRes?.[q?._id];
      if (singleQuestion && singleQuestion.status !== "notanswered") {
        if (singleQuestion.status === "correct") {
          groups[cat].totalEarnedScore +=
            Number(singleQuestion.correctScore || 0) + Number(singleQuestion.bonusScore || 0);
        } else if (singleQuestion.status === "incorrect") {
          groups[cat].totalEarnedScore +=
            Number(singleQuestion.correctScore || 0) + Number(singleQuestion.negativeScore || 0);
        }
      }
    });
    return groups;
  }, [testData?.questions, currentTestRes, questionSearchQuery]);

  const handleBack = () => {
    const departmentId = singleProgress?.studentDetails?.department;
    if (departmentId) {
      nav.push(`/testportal_admin/results-database/department/${departmentId}`);
    } else {
      nav.push(`/testportal_admin/results-database`);
    }
  };


  const isLoading = singleProgressStatus === "pending" || singleProgressStatus === "idle";

  if (isLoading) {
    return (
      <div style={{ padding: "2rem" }}>
        <Skeleton active paragraph={{ rows: 2 }} />
        <Skeleton active paragraph={{ rows: 6 }} style={{ marginTop: "2rem" }} />
        <Skeleton active paragraph={{ rows: 8 }} style={{ marginTop: "2rem" }} />
      </div>
    );
  }

  if (
    singleProgressStatus === "rejected" ||
    !singleProgress?.testDetails ||
    !singleProgress?.response
  ) {
    return (
      <div style={{ padding: "4rem", display: "flex", justifyContent: "center" }}>
        <Result
          status="warning"
          title="No Result Data Found"
          subTitle="The test results for this student could not be fetched, are incomplete, or do not exist."
          extra={
            <Button type="primary" onClick={handleBack}>
              Back to Results
            </Button>
          }
        />
      </div>
    );
  }

  // Parse studentData if it is a JSON string
  const studentDataParsed = typeof singleProgress?.studentData === "string" 
    ? parseIfJson(singleProgress?.studentData) 
    : singleProgress?.studentData;

  const fullName = studentDataParsed?.["Full Name"] 
    || (singleProgress?.studentDetails?.firstName 
        ? `${singleProgress.studentDetails.firstName} ${singleProgress.studentDetails.lastName || ""}`.trim()
        : null)
    || "N/A";

  const email = studentDataParsed?.Email 
    || singleProgress?.studentDetails?.email 
    || "N/A";

  const phone = studentDataParsed?.["Phone Number"] 
    || singleProgress?.studentDetails?.phone 
    || "N/A";

  const percentageValue = parseFloat(
    ((parseInt(score?.totalScore || 0)) / (parseInt(totalMarks) || 1)) * 100
  ).toFixed(0);

  // Extract flagged question indices
  const flaggedIndices = singleProgress?.flagged
    ?.map((f) => {
      const idx = ques.findIndex((q) => q._id === f.id);
      return idx !== -1 ? idx + 1 : null;
    })
    .filter(Boolean) || [];

  const tabSwitchCount = studentDataParsed?.tabswitchCount || 0;
  const isSuspicious = singleProgress?.flagged?.length > 0 || tabSwitchCount > 0;
  const hrtStatus = studentDataParsed?.blockMessage === "blocked" 
    ? "Blocked" 
    : isSuspicious 
    ? "Suspicious" 
    : "Normal";

  // Download PDF directly from this page — no navigation needed
  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    message.loading({ content: "Preparing PDF download...", key: "pdf-download" });

    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const studentName = fullName !== "N/A" ? fullName : "student";
      const date = new Date().toISOString().split("T")[0];
      const customFilename = `${studentName.replace(/\s+/g, "_")}_results_${date}`;
      const element = contentRef.current;

      const opt = {
        margin: [10, 10, 10, 10],
        filename: `${customFilename}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          scrollY: 0,
          windowWidth: element.scrollWidth,
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: {
          mode: ["avoid-all", "css", "legacy"],
          before: ".page-break-before",
          after: ".page-break-after",
          avoid: ".no-page-break",
        },
      };

      await html2pdf().set(opt).from(element).save();

      message.success({ content: "PDF downloaded successfully!", key: "pdf-download", duration: 2 });
    } catch (error) {
      console.error("Error generating PDF:", error);
      message.error({ content: "Failed to generate PDF. Please try again.", key: "pdf-download", duration: 2 });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      className={resultStyles.container}
      style={{
        height: "auto",
        overflow: "visible",
        padding: "1.5rem 2rem",
        backgroundColor: "#eff5fb",
      }}
    >
      {/* Top Header Row (Back 1 step and Download report TPO blue) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.5rem",
        }}
      >
        <Button
          onClick={handleBack}
          icon={<ArrowLeftOutlined />}
          style={{
            borderRadius: "10px",
            height: "40px",
            fontWeight: 600,
            borderColor: "#cbd5e1",
            color: "#475569",
          }}
        >
          Back to Results Database
        </Button>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          style={{
            background: "linear-gradient(135deg, #1e69da 0%, #3b82f6 100%)",
            borderColor: "#1e69da",
            fontWeight: 600,
            borderRadius: "10px",
            height: "40px",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            boxShadow: "0 2px 4px rgba(30, 105, 218, 0.15)",
          }}
          onClick={handleDownload}
          loading={isDownloading}
        >
          Download Results
        </Button>
      </div>

      <div ref={contentRef} style={{ width: "100%", margin: "0 auto" }}>
        {blockedmsgVal === "blocked" && (
          <Result
            status="error"
            title="Test Blocked"
            subTitle="This student's test has been blocked."
            style={{
              background: "#fff",
              borderRadius: "12px",
              marginBottom: "1.5rem",
              padding: "1rem",
              width: "100%",
              border: "1px solid #ffa39e",
            }}
          />
        )}

        {/* Responsive Grid Layout (70% Left Column, 30% Right Sidebar) */}
        <Row gutter={[24, 24]}>
          {/* LEFT COLUMN: Main statistics, donut chart, answer key */}
          <Col xs={24} xl={17}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Student Results Card */}
              <Card
                title={
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#1e69da" }}>
                    <FileTextOutlined />
                    <span style={{ fontWeight: 800 }}>Student Results — {fullName}</span>
                  </div>
                }
                variant="borderless"
                style={{
                  width: "100%",
                  borderRadius: "14px",
                  background: "#fff",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)",
                  border: "1px solid #e2e8f0",
                }}
              >
                <Row gutter={[24, 24]} align="middle">
                  <Col xs={24} md={12}>
                    <Row gutter={[16, 16]}>
                      {/* Pass/Fail & Grade Grid */}
                      {PassScore > 0 && (
                        <Col xs={12}>
                          <Card
                            size="small"
                            variant="borderless"
                            style={{
                              background: "#f8fafc",
                              border: "1px solid #e2e8f0",
                              borderRadius: "10px",
                            }}
                          >
                            <Statistic
                              title={<span style={{ fontWeight: 600, color: "#64748b" }}>Percentage</span>}
                              value={`${percentageValue}%`}
                              valueStyle={{
                                color: score?.totalScore < PassScore ? "#ef4444" : "#22c55e",
                                fontWeight: "800",
                              }}
                              suffix={
                                <span style={{ fontSize: "11px", display: "block", color: "#94a3b8", fontWeight: 550 }}>
                                  {score?.totalScore < PassScore ? "Below threshold" : "Passed"}
                                </span>
                              }
                            />
                          </Card>
                        </Col>
                      )}
                      <Col xs={12}>
                        <Card
                          size="small"
                          variant="borderless"
                          style={{
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            borderRadius: "10px",
                          }}
                        >
                          <Statistic
                            title={<span style={{ fontWeight: 600, color: "#64748b" }}>Score</span>}
                            value={`${score?.totalScore || 0} / ${totalMarks || 0}`}
                            valueStyle={{ fontWeight: "800", color: "#1e69da" }}
                            prefix={<StarOutlined />}
                            suffix={
                              <span style={{ fontSize: "11px", display: "block", color: "#94a3b8", fontWeight: 550 }}>
                                Max: {totalMarks} pts
                              </span>
                            }
                          />
                        </Card>
                      </Col>
                      <Col xs={12}>
                        <Card
                          size="small"
                          variant="borderless"
                          style={{
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            borderRadius: "10px",
                          }}
                        >
                          <Statistic
                            title={<span style={{ fontWeight: 600, color: "#64748b" }}>Time Taken</span>}
                            value={parseFloat((score?.totalTimeTaken || 0) / 60).toFixed(2)}
                            suffix="min"
                            valueStyle={{ fontWeight: "800", color: "#1e69da" }}
                            prefix={<ClockCircleOutlined />}
                            extra={
                              <span style={{ fontSize: "11px", display: "block", color: "#94a3b8", fontWeight: 550, marginTop: "4px" }}>
                                Allowed: {finishedTestData?.duration || "1 hour"}
                              </span>
                            }
                          />
                        </Card>
                      </Col>
                      <Col xs={12}>
                        <Card
                          size="small"
                          variant="borderless"
                          style={{
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            borderRadius: "10px",
                          }}
                        >
                          <Statistic
                            title={<span style={{ fontWeight: 600, color: "#64748b" }}>Speed</span>}
                            value={
                              parseInt(score?.averageTimeTaken || 0) > 60
                                ? parseFloat((score?.averageTimeTaken || 0) / 60).toFixed(1)
                                : parseInt(score?.averageTimeTaken || 0)
                            }
                            suffix={parseInt(score?.averageTimeTaken || 0) > 60 ? "mins/Q" : "secs/Q"}
                            prefix={<ThunderboltOutlined />}
                            valueStyle={{ fontWeight: "800", color: "#1e69da" }}
                            extra={
                              <span style={{ fontSize: "11px", display: "block", color: "#94a3b8", fontWeight: 550, marginTop: "4px" }}>
                                Per question
                              </span>
                            }
                          />
                        </Card>
                      </Col>
                    </Row>
                  </Col>

                  {/* Donut Chart Block */}
                  <Col xs={24} md={12}>
                    <Card
                      variant="borderless"
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-around",
                          flexWrap: "wrap",
                          gap: "1rem",
                        }}
                      >
                        <div
                          style={{
                            width: "140px",
                            height: "140px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            position: "relative",
                          }}
                        >
                          {chartData?.series?.length > 0 ? (
                            <DonutChart
                              id={"testResult"}
                              series={chartData?.series}
                              labels={chartData?.labels}
                              colors={chartData?.colors}
                            />
                          ) : (
                            <Skeleton.Avatar active shape="circle" size={120} />
                          )}
                          <div style={{ position: "absolute", textAlign: "center", zIndex: 5 }}>
                            <div style={{ fontSize: "15px", fontWeight: "800", color: "#0f172a" }}>{percentageValue}%</div>
                            <div style={{ fontSize: "9px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Score</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: "140px" }}>
                          <Text style={{ fontSize: "12px", fontWeight: 600 }}>
                            <Badge color="#87CC85" /> Correct:{" "}
                            <strong>
                              {parseFloat(
                                ((chartData?.series?.[0] || 0) /
                                  Math.max(parseInt(ques?.length || 1), 1)) *
                                  100
                              ).toFixed(1)}
                              %
                            </strong>
                          </Text>
                          <Text style={{ fontSize: "12px", fontWeight: 600 }}>
                            <Badge color="#E43E5F" /> Incorrect:{" "}
                            <strong>
                              {parseFloat(
                                ((chartData?.series?.[1] || 0) /
                                  Math.max(parseInt(ques?.length || 1), 1)) *
                                  100
                              ).toFixed(1)}
                              %
                            </strong>
                          </Text>
                          <Text style={{ fontSize: "12px", fontWeight: 600 }}>
                            <Badge color="#869DF0" /> Unattempted:{" "}
                            <strong>
                              {parseFloat(
                                ((chartData?.series?.[2] || 0) /
                                  Math.max(parseInt(ques?.length || 1), 1)) *
                                  100
                              ).toFixed(1)}
                              %
                            </strong>
                          </Text>
                          <Text style={{ fontSize: "12px", fontWeight: 600 }}>
                            <Badge color="#4e4eff" /> Not Answered:{" "}
                            <strong>
                              {parseFloat(
                                ((chartData?.series?.[3] || 0) /
                                  Math.max(parseInt(ques?.length || 1), 1)) *
                                  100
                              ).toFixed(1)}
                              %
                            </strong>
                          </Text>
                        </div>
                      </div>
                    </Card>
                  </Col>
                </Row>
              </Card>

              {/* Flagged Questions alert row (Screenshot 2) */}
              {flaggedIndices.length > 0 && (
                <div
                  style={{
                    background: "#fef2f2",
                    border: "1px solid #fca5a5",
                    borderRadius: "10px",
                    padding: "10px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ color: "#dc2626", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <WarningOutlined /> Flagged Questions:
                  </span>
                  {flaggedIndices.map((num) => (
                    <span
                      key={num}
                      onClick={() => {
                        if (quesContainerRef.current[num])
                          quesContainerRef.current[num].current.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                          });
                      }}
                      style={{
                        background: "#dc2626",
                        color: "white",
                        padding: "2px 10px",
                        borderRadius: "9999px",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Question No. {num}
                    </span>
                  ))}
                </div>
              )}

              {/* Answer Key block */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "14px",
                  border: "1px solid #e2e8f0",
                  padding: "1.5rem",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "1rem",
                    marginBottom: "1.25rem",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontWeight: 800,
                      color: "#1e69da",
                      fontSize: "16px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <KeyOutlined /> Answer Key
                  </h3>

                  {/* Toolbar filters inside Answer Key card */}
                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                    <Select
                      value={selectedCategory}
                      style={{ width: 160 }}
                      onChange={(val) => setSelectedCategory(val)}
                      variant="outlined"
                    >
                      <Select.Option value="All">All Categories</Select.Option>
                      {[
                        ...new Set(
                          testData?.questions?.map((q) => q?.questionCategory?.[0]?.name || "Uncategorized") || []
                        ),
                      ].map((catName) => (
                        <Select.Option key={catName} value={catName}>
                          {catName}
                        </Select.Option>
                      ))}
                    </Select>

                    <div className={progressStyles.searchCon} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", height: "36px", width: "200px" }}>
                      <SearchOutlined className={progressStyles.searchIcon} style={{ fontSize: "13px" }} />
                      <input
                        placeholder="Search questions..."
                        value={questionSearchQuery}
                        onChange={(e) => setQuestionSearchQuery(e.target.value)}
                        style={{ fontSize: "13px", fontWeight: "600" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Active tags info */}
                {(selectedCategory !== "All" || questionSearchQuery !== "") && (
                  <div
                    style={{
                      margin: "0 0 1rem 0",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span style={{ fontSize: "13px", color: "#64748b", fontWeight: 550 }}>Active Filters:</span>
                    {selectedCategory !== "All" && (
                      <Tag color="blue" closable onClose={handleClearCategory} style={{ borderRadius: "6px" }}>
                        Category: {selectedCategory}
                      </Tag>
                    )}
                    {questionSearchQuery !== "" && (
                      <Tag color="purple" closable onClose={handleClearSearch} style={{ borderRadius: "6px" }}>
                        Search: "{questionSearchQuery}"
                      </Tag>
                    )}
                    <Button type="link" size="small" onClick={handleClearAll} style={{ padding: 0, fontSize: "13px" }}>
                      Clear All
                    </Button>
                  </div>
                )}

                {/* Categories Collapse Panel */}
                <div className={resultStyles.answers_scroll_cont} style={{ marginTop: "10px" }}>
                  {testData?.questions?.length > 0 &&
                  Object.keys(groupedQuestions).filter(
                    (catName) => selectedCategory === "All" || selectedCategory === catName
                  ).length === 0 ? (
                    <Result title="No questions match the active filters" />
                  ) : (
                    testData?.questions?.length > 0 && (
                      <Collapse
                        defaultActiveKey={Object.keys(groupedQuestions)}
                        expandIconPlacement="end"
                        style={{ background: "transparent", border: "none" }}
                        items={Object.keys(groupedQuestions)
                          .filter((catName) => selectedCategory === "All" || selectedCategory === catName)
                          .map((catName) => {
                            const groupData = groupedQuestions[catName];
                            const numQuestions = groupData.questions.length;
                            const isNegScore = groupData.totalEarnedScore < 0;

                            return {
                              key: catName,
                              style: {
                                background: "#f8fafc",
                                border: "1px solid #e2e8f0",
                                borderRadius: "10px",
                                marginBottom: "10px",
                                overflow: "hidden",
                              },
                              label: (
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    width: "100%",
                                    paddingRight: "10px",
                                  }}
                                >
                                  <strong style={{ fontSize: "14px", color: "#0f172a" }}>{catName}</strong>
                                  <span
                                    style={{
                                      fontSize: "12px",
                                      fontWeight: "600",
                                      color: "#64748b",
                                      background: "#ffffff",
                                      padding: "3px 10px",
                                      borderRadius: "6px",
                                      border: "1px solid #cbd5e1",
                                    }}
                                  >
                                    {numQuestions} Questions • Score:{" "}
                                    <span style={{ color: isNegScore ? "#ef4444" : "#1e69da", fontWeight: "750" }}>
                                      {groupData.totalEarnedScore}
                                    </span>{" "}
                                    / {groupData.totalExpectedScore}
                                  </span>
                                </div>
                              ),
                              children: (
                                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                  {groupData.questions.map((e, idx) => {
                                    let flaggedQues = singleProgress?.flagged?.find((que) => que?.id == e?._id);
                                    if (e?.questionType?.includes("Comprehension")) {
                                      return (
                                        <Collapse
                                          key={idx}
                                          collapsible="header"
                                          defaultActiveKey={["1"]}
                                          expandIconPlacement="end"
                                          expandIcon={({ isActive }) => (
                                            <TbTriangleInvertedFilled
                                              className={`${progressStyles.icon} ${
                                                isActive ? progressStyles.iconActive : progressStyles.iconInactive
                                              }`}
                                            />
                                          )}
                                          size="middle"
                                          style={{ border: "1px solid #e2e8f0", background: "#ffffff", borderRadius: "8px" }}
                                          items={[
                                            {
                                              key: "1",
                                              label: (
                                                <div>
                                                  <div className={progressStyles.header}>
                                                    <div>
                                                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#1e69da" }}>
                                                        {e?.questionType}
                                                      </span>
                                                    </div>
                                                  </div>
                                                  {e?.questionType?.includes("Reading") ? (
                                                    <div
                                                      dangerouslySetInnerHTML={{ __html: parseIfJson(e?.comprehensionText) }}
                                                      className={progressStyles.comprehension_text}
                                                      style={{ fontSize: "13px" }}
                                                    ></div>
                                                  ) : (
                                                    e?.resources != undefined &&
                                                    e?.resources != "" &&
                                                    (e?.questionType !== "Reading Comprehension" &&
                                                    e?.questionType === "Video Comprehension"
                                                      ? e?.resources?.url !== "" && <video src={e?.resources?.url} controls />
                                                      : e?.resources?.url !== "" && <audio src={e?.resources?.url} controls />)
                                                  )}
                                                </div>
                                              ),
                                              children: e?.questionContentArr?.map((subQues, index) => {
                                                let flaggedSub = singleProgress?.flagged?.find(
                                                  (que) => que?.id == subQues?._id
                                                );
                                                const absIndex = ques.findIndex((q) => q._id === subQues._id);
                                                const qNo = absIndex !== -1 ? absIndex + 1 : 1;
                                                return (
                                                  <div key={index} ref={quesContainerRef.current[qNo]}>
                                                    <QuesComp
                                                      quesContainerRef={quesContainerRef}
                                                      e={subQues}
                                                      i={index}
                                                      questionNo={qNo}
                                                      currentTestRes={currentTestRes}
                                                      testRes={testRes}
                                                      flagged={flaggedSub}
                                                    />
                                                  </div>
                                                );
                                              }),
                                            },
                                          ]}
                                        />
                                      );
                                    } else {
                                      const absIndex = ques.findIndex((q) => q._id === e._id);
                                      const qNo = absIndex !== -1 ? absIndex + 1 : 1;
                                      return (
                                        <div key={idx} ref={quesContainerRef.current[qNo]}>
                                          <QuesComp
                                            quesContainerRef={quesContainerRef}
                                            e={e}
                                            i={idx}
                                            questionNo={qNo}
                                            currentTestRes={currentTestRes}
                                            testRes={testRes}
                                            flagged={flaggedQues}
                                          />
                                        </div>
                                      );
                                    }
                                  })}
                                </div>
                              ),
                            };
                          })}
                      />
                    )
                  )}
                </div>
              </div>
            </div>
          </Col>

          {/* RIGHT SIDEBAR COLUMN: Candidate info, Test info, HRT Report (Screenshot 2) */}
          <Col xs={24} xl={7}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Candidate Info Card */}
              <Card
                title={
                  <span style={{ fontWeight: 800, fontSize: "14px", color: "#475569", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <UserOutlined /> CANDIDATE INFO
                  </span>
                }
                variant="borderless"
                style={{
                  borderRadius: "14px",
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
                }}
                styles={{ body: { padding: "16px" } }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                    <span style={{ color: "#64748b", fontWeight: 550, fontSize: "13px" }}>Name</span>
                    <span style={{ color: "#1e69da", fontWeight: 700, fontSize: "13px" }}>{fullName}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                    <span style={{ color: "#64748b", fontWeight: 550, fontSize: "13px" }}>Email</span>
                    <span style={{ color: "#1e69da", fontWeight: 700, fontSize: "13px" }}>{email}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                    <span style={{ color: "#64748b", fontWeight: 550, fontSize: "13px" }}>Phone</span>
                    <span style={{ color: "#1e69da", fontWeight: 700, fontSize: "13px" }}>{phone}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                    <span style={{ color: "#64748b", fontWeight: 550, fontSize: "13px" }}>Department</span>
                    <span style={{ color: "#1e69da", fontWeight: 700, fontSize: "13px" }}>{currentDeptName || "N/A"}</span>
                  </div>
                </div>
              </Card>

              {/* Test Info Card */}
              <Card
                title={
                  <span style={{ fontWeight: 800, fontSize: "14px", color: "#475569", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <FileTextOutlined /> TEST INFO
                  </span>
                }
                variant="borderless"
                style={{
                  borderRadius: "14px",
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
                }}
                styles={{ body: { padding: "16px" } }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                    <span style={{ color: "#64748b", fontWeight: 550, fontSize: "13px" }}>Test Name</span>
                    <span style={{ color: "#1e69da", fontWeight: 700, fontSize: "13px" }}>{testData?.title || "N/A"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                    <span style={{ color: "#64748b", fontWeight: 550, fontSize: "13px" }}>Submitted</span>
                    <span style={{ color: "#1e69da", fontWeight: 700, fontSize: "13px" }}>
                      {singleProgress?.createdAt ? singleProgress.createdAt.split(",")[0] : "N/A"}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                    <span style={{ color: "#64748b", fontWeight: 550, fontSize: "13px" }}>Duration</span>
                    <span style={{ color: "#1e69da", fontWeight: 700, fontSize: "13px" }}>
                      {parseFloat((score?.totalTimeTaken || 0) / 60).toFixed(2)} mins
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                    <span style={{ color: "#64748b", fontWeight: 550, fontSize: "13px" }}>Questions</span>
                    <span style={{ color: "#1e69da", fontWeight: 700, fontSize: "13px" }}>{ques?.length || 0} total</span>
                  </div>
                </div>
              </Card>

              {/* HRT Report Card */}
              <Card
                title={
                  <span style={{ fontWeight: 800, fontSize: "14px", color: "#475569", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <SafetyCertificateOutlined /> HRT REPORT
                  </span>
                }
                variant="borderless"
                style={{
                  borderRadius: "14px",
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
                }}
                styles={{ body: { padding: "16px" } }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                    <span style={{ color: "#64748b", fontWeight: 550, fontSize: "13px" }}>Tab Switches</span>
                    <span style={{ color: tabSwitchCount > 0 ? "#ef4444" : "#1e69da", fontWeight: 700, fontSize: "13px" }}>
                      {tabSwitchCount > 0 ? `Flagged (${tabSwitchCount})` : "Normal"}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                    <span style={{ color: "#64748b", fontWeight: 550, fontSize: "13px" }}>Flagged Q</span>
                    <span style={{ color: flaggedIndices.length > 0 ? "#ef4444" : "#1e69da", fontWeight: 700, fontSize: "13px" }}>
                      {flaggedIndices.length > 0 ? flaggedIndices.map(n => `Q${n}`).join(", ") : "None"}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                    <span style={{ color: "#64748b", fontWeight: 550, fontSize: "13px" }}>HRT Status</span>
                    <span
                      style={{
                        color: hrtStatus === "Normal" ? "#22c55e" : "#ef4444",
                        fontWeight: 700,
                        fontSize: "13px",
                      }}
                    >
                      {hrtStatus}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}
