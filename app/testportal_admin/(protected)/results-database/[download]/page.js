"use client";
import React, { createRef, useEffect, useRef, useState } from "react";
import progressStyles from "../styles/progress.module.scss";
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, ThunderboltOutlined, DownloadOutlined, ArrowLeftOutlined, ScissorOutlined } from "@ant-design/icons";
import { Button, Collapse, Card, Row, Col, Statistic, Typography, Badge, message, Spin } from "antd";
import { useDispatch } from "react-redux";
import { TbTriangleInvertedFilled } from "react-icons/tb";
import {
  getAllProgress,
  getOneProgress,
} from "@/redux/slices/testportal_admin/slice/resultsDatabase";
import { useSelector } from "react-redux";

import DonutChart from "@/app/testportal_admin/(protected)/results-database/utils/donutChart";
import _ from "lodash";
import resultStyles from "../styles/results.module.scss";
import { useParams, usePathname, useRouter } from "next/navigation";
import { parseIfJson } from "@/utils/windowMW";
import QuesComp from "../components/quesComp";

const { Title, Text } = Typography;

export default function Page() {
  const dispatch = useDispatch();
  const currPath = usePathname();
  const nav = useRouter();
  const singleProgress = useSelector(
    (state) => state.resultsDatabase?.singleProgress
  );
  const params = useParams();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const contentRef = useRef(null);
  const [pageBreaks, setPageBreaks] = useState({}); // { "catName-i": true/false }

  const togglePageBreak = (key) => {
    setPageBreaks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Inline PageBreakToggle component
  const PageBreakToggle = ({ breakKey }) => {
    const isActive = pageBreaks[breakKey];
    return (
      <>
        <div
          className="hide-on-pdf"
          onClick={() => togglePageBreak(breakKey)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '4px 0',
            margin: '4px 0',
            cursor: 'pointer',
            borderTop: isActive ? '2px dashed #52c41a' : '1px dashed transparent',
            borderBottom: isActive ? '2px dashed #52c41a' : '1px dashed transparent',
            background: isActive ? 'rgba(82, 196, 26, 0.05)' : 'transparent',
            borderRadius: '4px',
            transition: 'all 0.2s',
            userSelect: 'none',
          }}
          onMouseEnter={(ev) => {
            if (!isActive) {
              ev.currentTarget.style.borderTop = '1px dashed #aaa';
              ev.currentTarget.style.borderBottom = '1px dashed #aaa';
              ev.currentTarget.style.background = 'rgba(0,0,0,0.02)';
            }
          }}
          onMouseLeave={(ev) => {
            if (!isActive) {
              ev.currentTarget.style.borderTop = '1px dashed transparent';
              ev.currentTarget.style.borderBottom = '1px dashed transparent';
              ev.currentTarget.style.background = 'transparent';
            }
          }}
        >
          {isActive ? (
            <>
              <ScissorOutlined style={{ color: '#52c41a', fontSize: '14px' }} />
              <span style={{ fontSize: '12px', color: '#52c41a', fontWeight: 500 }}>Page break inserted (click to remove)</span>
              <ScissorOutlined style={{ color: '#52c41a', fontSize: '14px' }} />
            </>
          ) : (
            <span style={{ fontSize: '11px', color: '#bbb' }}>+ Insert page break</span>
          )}
        </div>
        {isActive && (
          <div className="page-break-before" style={{ pageBreakBefore: 'always', breakBefore: 'page' }}></div>
        )}
      </>
    );
  };

  useEffect(() => {
    dispatch(getAllProgress({ cursor: null, limit: 200 }));
    dispatch(getOneProgress({ id: params?.download }));
  }, []);

  const testRes = singleProgress;
  const blockedmsgVal = singleProgress?.studentData?.blockMessage;

  const testData = singleProgress?.testDetails;
  const finishedTestData = singleProgress?.testDetails;
  const [totalMarks, setTotalMarks] = useState(0);
  const [ques, setQues] = useState([]);

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
      const totalMarksEachTests = ques?.map((question, index) => {
        let score =
          Number(question?.scoreSettings?.pointsForCorrectAns) ||
          Number(question?.scoreSettings?.PointsForEachCorrectAnswer) ||
          0;

        if (
          question?.scoreSettings?.PointsForEachCorrectAnswer &&
          question?.answer?.multipleChoice
        ) {
          const correctOptionsCount = Object.values(
            question.answer.multipleChoice
          ).filter((isCorrect) => isCorrect === true).length;

          score =
            correctOptionsCount *
            question.scoreSettings.PointsForEachCorrectAnswer;
        }

        const bonusPoints = question?.scoreSettings?.bonusPointsForAllCorrect
          ? Number(question?.scoreSettings?.bonusPointsForAllCorrect)
          : 0;

        return score + +bonusPoints;
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

    if (testData && testRes && testRes) {
      const {
        correctQues,
        unattemptedQues,
        incorrectQues,
        finalScore: totalScore,
        totalTimeTaken,
        averageTimeTaken,
        notAnswered,
      } = testRes?.scoreData;
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
  }, [testRes?._id]);

  let questionNo = 1;

  const quesContainerRef = useRef([]);
  quesContainerRef.current = ques?.map(
    (_, i) => quesContainerRef.current[i] ?? createRef()
  );

  // Group questions by category (same as student-result but no search filter)
  const groupedQuestions = React.useMemo(() => {
    if (!testData?.questions?.length) return {};
    const groups = {};

    testData.questions.forEach((q) => {
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
        const correctOptionsCount = (q?.answer?.multipleChoice) ? Object.values(q.answer.multipleChoice).filter(Boolean).length : 1;
        maxQScore = (correctOptionsCount * Number(q?.scoreSettings?.PointsForEachCorrectAnswer || 0)) + Number(q?.scoreSettings?.bonusPointsForAllCorrect || 0);
      }
      groups[cat].totalExpectedScore += maxQScore;

      const singleQuestion = currentTestRes?.[q?._id];
      if (singleQuestion && singleQuestion.status !== "notanswered") {
        if (singleQuestion.status === "correct") {
          groups[cat].totalEarnedScore += (Number(singleQuestion.correctScore || 0) + Number(singleQuestion.bonusScore || 0));
        } else if (singleQuestion.status === "incorrect") {
          groups[cat].totalEarnedScore += (Number(singleQuestion.correctScore || 0) + Number(singleQuestion.negativeScore || 0));
        }
      }
    });
    return groups;
  }, [testData?.questions, currentTestRes]);

  // Check if all data is loaded
  useEffect(() => {
    if (
      testData?.questions?.length > 0 &&
      ques?.length > 0 &&
      chartData?.series?.length > 0 &&
      score?.totalScore !== undefined &&
      totalMarks > 0
    ) {
      setIsDataLoaded(true);
    }
  }, [testData, ques, chartData, score, totalMarks]);

  // Download PDF function using html2pdf.js (direct download, no print dialog)
  const handleDownload = async () => {
    if (isDownloading) return;

    setIsDownloading(true);
    message.loading({
      content: "Preparing PDF download...",
      key: "pdf-download",
    });

    try {
      const html2pdf = (await import("html2pdf.js")).default;

      const studentName =
        singleProgress?.studentData?.["Full Name"] || "student";
      const date = new Date().toISOString().split("T")[0];
      const customFilename = `${studentName.replace(
        /\s+/g,
        "_"
      )}_results_${date}`;

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
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
        pagebreak: {
          mode: ["avoid-all", "css", "legacy"],
          before: ".page-break-before",
          after: ".page-break-after",
          avoid: ".no-page-break",
        },
      };

      // Hide toggle controls before capturing
      const hideElements = contentRef.current.querySelectorAll('.hide-on-pdf');
      hideElements.forEach(el => el.style.display = 'none');

      await html2pdf().set(opt).from(element).save();

      // Restore toggle controls
      hideElements.forEach(el => el.style.display = '');

      message.success({
        content: "PDF downloaded successfully!",
        key: "pdf-download",
        duration: 2,
      });

      // Navigate to results database after download
      setTimeout(() => {
        nav.replace('/testportal_admin/results-database');
      }, 1000);
    } catch (error) {
      console.error("Error generating PDF:", error);
      message.error({
        content: "Failed to generate PDF. Please try again.",
        key: "pdf-download",
        duration: 2,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className={resultStyles.container}>
      {/* Sticky Toolbar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "#fff",
          padding: "12px 24px",
          borderBottom: "1px solid #e8e8e8",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          margin: "0 -1rem",
          marginTop: "-1rem",
          marginBottom: "1rem",
        }}
      >
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => nav.back()}
        >
          Back
        </Button>
        <Text strong style={{ fontSize: '16px' }}>
          📄 Download Preview {singleProgress?.studentData?.["Full Name"] ? `— ${singleProgress.studentData["Full Name"]}` : ""}
        </Text>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleDownload}
          loading={isDownloading}
          disabled={!isDataLoaded}
          size="large"
        >
          {isDownloading ? "Generating PDF..." : "Download PDF"}
        </Button>
      </div>

      {/* Loading state */}
      {!isDataLoaded && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <Spin size="large" />
          <div style={{ marginTop: '1rem', color: '#888' }}>Loading results data...</div>
        </div>
      )}

      {/* PDF Content Preview */}
      <div ref={contentRef} id="print-content" style={{ background: '#fff', padding: '1rem' }}>
        <div className={resultStyles.headerContainer} style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          {blockedmsgVal == "blocked" && (
            <div style={{ background: '#fff1f0', border: '1px solid #ffa39e', borderRadius: '8px', padding: '12px 16px', marginBottom: '1rem', textAlign: 'center' }}>
              <Text type="danger" strong style={{ fontSize: '16px' }}>This student's test has been blocked.</Text>
            </div>
          )}

          <Card
            title={<Title level={3} style={{ margin: 0 }}>Student Results</Title>}
            bordered={false}
            className="no-page-break"
            style={{
              width: '100%',
              borderRadius: '12px',
              background: '#fff',
              marginBottom: '2rem',
              border: "1px solid #d9d9d9"
            }}
          >
            <Row gutter={[24, 24]} align="middle">
              <Col xs={24} lg={12}>
                <Row gutter={[16, 16]}>
                  {/* Pass/Fail & Grade Grid */}
                  {PassScore > 0 && (
                    <Col xs={12} sm={8}>
                      <Card size="small" bordered={false} style={{ background: 'rgba(255,255,255,0.7)', height: '100%', border: "1px solid #d9d9d9" }}>
                        <Statistic
                          title="Status"
                          value={(score?.totalScore < PassScore) ? "Fail" : "Pass"}
                          valueStyle={{ color: (score?.totalScore < PassScore) ? '#cf1322' : '#3f8600', fontWeight: 'bold' }}
                          prefix={(score?.totalScore < PassScore) ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
                        />
                      </Card>
                    </Col>
                  )}
                  {testValues?.grade && (
                    <Col xs={12} sm={8}>
                      <Card size="small" bordered={false} style={{ background: 'rgba(255,255,255,0.7)', height: '100%', border: "1px solid #d9d9d9" }}>
                        <Statistic title="Grade" value={testValues?.grade} valueStyle={{ fontWeight: 'bold' }} />
                      </Card>
                    </Col>
                  )}
                  <Col xs={12} sm={8}>
                    <Card size="small" bordered={false} style={{ background: 'rgba(255,255,255,0.7)', height: '100%', border: "1px solid #d9d9d9" }}>
                      <Statistic
                        title="Percentage"
                        value={parseFloat(((parseInt(score?.totalScore || 0)) / (parseInt(totalMarks) || 1)) * 100).toFixed(0)}
                        suffix="%"
                        valueStyle={{ fontWeight: 'bold' }}
                      />
                    </Card>
                  </Col>

                  {/* Stats Grid */}
                  <Col xs={12} sm={8}>
                    <Card size="small" bordered={false} style={{ background: 'rgba(255,255,255,0.7)', height: '100%', border: "1px solid #d9d9d9" }}>
                      <Statistic title="Score" value={`${score?.totalScore || 0} / ${totalMarks || 0}`} prefix={<CheckCircleOutlined style={{ color: '#1890ff' }} />} />
                    </Card>
                  </Col>
                  <Col xs={12} sm={8}>
                    <Card size="small" bordered={false} style={{ background: 'rgba(255,255,255,0.7)', height: '100%', border: "1px solid #d9d9d9" }}>
                      <Statistic title="Time Taken" value={parseFloat((score?.totalTimeTaken || 0) / 60).toFixed(2)} suffix="mins" prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />} />
                    </Card>
                  </Col>
                  <Col xs={12} sm={8}>
                    <Card size="small" bordered={false} style={{ background: 'rgba(255,255,255,0.7)', height: '100%', border: "1px solid #d9d9d9" }}>
                      <Statistic
                        title="Speed"
                        value={parseInt(score?.averageTimeTaken || 0) > 60 ? parseFloat((score?.averageTimeTaken || 0) / 60).toFixed(1) : parseInt(score?.averageTimeTaken || 0)}
                        suffix={parseInt(score?.averageTimeTaken || 0) > 60 ? "mins/Q" : "secs/Q"}
                        prefix={<ThunderboltOutlined style={{ color: '#eb2f96' }} />}
                        valueStyle={{ fontSize: '1.2rem' }}
                      />
                    </Card>
                  </Col>
                </Row>
              </Col>

              <Col xs={24} lg={12}>
                <Card bordered={false} style={{ background: 'rgba(255,255,255,0.7)', height: '100%', border: "1px solid #d9d9d9" }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ width: '180px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {chartData?.series?.length > 0 ? (
                        <DonutChart id={"testResult"} series={chartData?.series} labels={chartData?.labels} colors={chartData?.colors} />
                      ) : null}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '160px' }}>
                      <Text><Badge color="#87CC85" /> Correct: <strong>{parseFloat(((chartData?.series?.[0] || 0) / Math.max(parseInt(ques?.length || 1), 1)) * 100).toFixed(1)}%</strong></Text>
                      <Text><Badge color="#E43E5F" /> Incorrect: <strong>{parseFloat(((chartData?.series?.[1] || 0) / Math.max(parseInt(ques?.length || 1), 1)) * 100).toFixed(1)}%</strong></Text>
                      <Text><Badge color="#869DF0" /> Unattempted: <strong>{parseFloat(((chartData?.series?.[2] || 0) / Math.max(parseInt(ques?.length || 1), 1)) * 100).toFixed(1)}%</strong></Text>
                      <Text><Badge color="#4e4eff" /> Not Answered: <strong>{parseFloat(((chartData?.series?.[3] || 0) / Math.max(parseInt(ques?.length || 1), 1)) * 100).toFixed(1)}%</strong></Text>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          </Card>
        </div>
        <div className="page-break-after" style={{ pageBreakAfter: 'always', breakAfter: 'page' }}></div>
        <div className={resultStyles.anwers_div}>
          <div className={resultStyles.flagged_div}>
            {singleProgress?.flagged?.length > 0 && (
              <>
                <h2>Flagged Question Numbers : </h2>
                <div>
                  {singleProgress?.flagged.map((que, ind) => {
                    const questionResult = ques
                      ?.map((question, index) => ({ question, index }))
                      .find(({ question }) => question?._id === que?.id);

                    if (!questionResult) return null;

                    const { question, index } = questionResult;

                    return (
                      <p key={ind}>
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
          <div className={resultStyles.answers_scroll_cont}>
            {testData?.questions?.length > 0 && Object.keys(groupedQuestions).length > 0 && (
              <Collapse
                activeKey={Object.keys(groupedQuestions)}
                expandIconPosition="end"
                size="large"
                collapsible="disabled"
                items={Object.keys(groupedQuestions).map((catName) => {
                  const groupData = groupedQuestions[catName];
                  const numQuestions = groupData.questions.length;
                  return {
                    key: catName,
                    label: (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingRight: '20px' }}>
                        <strong>{catName}</strong>
                        <span style={{ fontSize: '0.9rem', color: '#555' }}>{numQuestions} Questions | Score: {groupData.totalEarnedScore} / {groupData.totalExpectedScore}</span>
                      </div>
                    ),
                    children: groupData.questions.map((e, i) => {
                      let flaggedQues = singleProgress?.flagged?.find(
                        (que) => que?.id == e?._id
                      );
                      const breakKey = `${catName}-${i}`;
                      if (e?.questionType?.includes("Comprehension")) {
                        return (
                          <React.Fragment key={i}>
                            {i > 0 && <PageBreakToggle breakKey={breakKey} />}
                            <div className="no-page-break" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                              <Collapse
                                collapsible="header"
                                defaultActiveKey={["1"]}
                                expandIconPosition="end"
                                expandIcon={({ isActive }) => (
                                  <TbTriangleInvertedFilled
                                    className={`${progressStyles.icon} ${isActive
                                      ? progressStyles.iconActive
                                      : progressStyles.iconInactive
                                      }`}
                                  />
                                )}
                                size="large"
                                items={[{
                                  key: "1",
                                  label: (
                                    <div>
                                      <div className={progressStyles.header}>
                                        <div><span>{e?.questionType}</span></div>
                                      </div>
                                      {e?.questionType?.includes("Reading") ? (
                                        <div
                                          dangerouslySetInnerHTML={{ __html: parseIfJson(e?.comprehensionText) }}
                                          className={progressStyles.comprehension_text}
                                        ></div>
                                      ) : (
                                        e?.resources != undefined &&
                                        e?.resources != "" &&
                                        (e?.questionType !== "Reading Comprehension" &&
                                          e?.questionType === "Video Comprehension"
                                          ? e?.resources?.url !== "" && (
                                            <video src={e?.resources?.url} controls crossOrigin="anonymous" />
                                          )
                                          : e?.resources?.url !== "" && (
                                            <audio src={e?.resources?.url} controls crossOrigin="anonymous" />
                                          ))
                                      )}
                                    </div>
                                  ),
                                  children: e?.questionContentArr?.map((subQues, index) => {
                                    let flaggedSub = singleProgress?.flagged?.find(
                                      (que) => que?.id == subQues?._id
                                    );
                                    const absIndex = ques.findIndex(q => q._id === subQues._id);
                                    const qNo = absIndex !== -1 ? absIndex + 1 : questionNo++;
                                    return (
                                      <div key={index} ref={quesContainerRef.current[qNo]} className="no-page-break" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
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
                                }]}
                              ></Collapse>
                            </div>
                          </React.Fragment>
                        );
                      } else {
                        const absIndex = ques.findIndex(q => q._id === e._id);
                        const qNo = absIndex !== -1 ? absIndex + 1 : questionNo++;
                        return (
                          <React.Fragment key={i}>
                            {i > 0 && <PageBreakToggle breakKey={breakKey} />}
                            <div ref={quesContainerRef.current[qNo]} className="no-page-break" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                              <QuesComp
                                quesContainerRef={quesContainerRef}
                                e={e}
                                i={i}
                                questionNo={qNo}
                                currentTestRes={currentTestRes}
                                testRes={testRes}
                                flagged={flaggedQues}
                              />
                            </div>
                          </React.Fragment>
                        );
                      }
                    })
                  };
                })}
              />
            )}
            <div className={resultStyles.empty_div} />
          </div>
        </div>
      </div>
    </div>
  );
}
