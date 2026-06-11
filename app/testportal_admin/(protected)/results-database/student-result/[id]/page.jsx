"use client";
import React, { createRef, useEffect, useRef, useState } from "react";
import progressStyles from "../../styles/progress.module.scss";
import resultStyles from "../../styles/results.module.scss";
import { Button, Collapse, Input, Table, Modal, Result, Skeleton, Card, Row, Col, Statistic, Typography, Badge } from "antd";
import { CopyOutlined, ClockCircleOutlined, ThunderboltOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { TbTriangleInvertedFilled } from "react-icons/tb";
const { Title, Text } = Typography;
import { useDispatch, useSelector } from "react-redux";
import { getOneProgress } from "@/redux/slices/testportal_admin/slice/resultsDatabase";
import DonutChart from "@/app/testportal_admin/(protected)/results-database/utils/donutChart";
import { useRouter } from "next/navigation";
import QuesComp from "../../components/quesComp";
import { parseIfJson } from "@/utils/windowMW";
import { Select, Tag } from "antd";
import { useSearchParams } from "next/navigation";
const { Column } = Table;

export default function StudentResult({ params }) {
    const { id } = React.use(params);
    const dispatch = useDispatch();
    const nav = useRouter();

    const singleProgress = useSelector((state) => state.resultsDatabase?.singleProgress);
    const singleProgressStatus = useSelector((state) => state.resultsDatabase?.singleProgressStatus);

    useEffect(() => {
        if (id) {
            dispatch(getOneProgress({ id }));
        }
    }, [id, dispatch]);

    const testRes = singleProgress;
    const blockedmsgVal = singleProgress?.studentData?.blockMessage;
    const testData = singleProgress?.testDetails;
    const finishedTestData = singleProgress?.testDetails;

    const [totalMarks, setTotalMarks] = useState(0);
    const [ques, setQues] = useState([]);

    const searchParams = useSearchParams();

    // Read initials from URL params, defaulting to "All" and "" respectively
    const initialCategory = searchParams.get("category") || "All";
    const initialSearch = searchParams.get("search") || "";

    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [questionSearchQuery, setQuestionSearchQuery] = useState(initialSearch);

    // Sync state changes back to URL
    useEffect(() => {
        const currentSearch = searchParams.toString();
        const params = new URLSearchParams(currentSearch);

        if (selectedCategory && selectedCategory !== "All") {
            params.set("category", selectedCategory);
        } else {
            params.delete("category");
        }

        if (questionSearchQuery) {
            params.set("search", questionSearchQuery);
        } else {
            params.delete("search");
        }

        const newSearch = params.toString();
        
        if (currentSearch !== newSearch) {
            const newPath = newSearch ? `/testportal_admin/results-database/student-result/${id}?${newSearch}` : `/testportal_admin/results-database/student-result/${id}`;
            // Use replace to avoid filling up browser history with filter typing
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
                let score =
                    Number(question?.scoreSettings?.pointsForCorrectAns) ||
                    Number(question?.scoreSettings?.PointsForEachCorrectAnswer) ||
                    0;

                if (
                    question?.scoreSettings?.PointsForEachCorrectAnswer &&
                    question?.answer?.multipleChoice
                ) {
                    const correctOptionsCount = Object.values(question.answer.multipleChoice).filter((isCorrect) => isCorrect === true).length;
                    score = correctOptionsCount * question.scoreSettings.PointsForEachCorrectAnswer;
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
        testValues = finishedTestData?.grading?.scoreRange?.[finishedTestData?.grading?.scoreRange?.length - 1];
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
        const {
            correctQues, unattemptedQues, incorrectQues, finalScore: totalScore,
            totalTimeTaken, averageTimeTaken, notAnswered,
        } = testRes?.scoreData;
        setScore({ totalScore, totalTimeTaken, averageTimeTaken });

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
                    .filter(k => k.includes("option"))
                    .map(k => q.questionContent[k]?.toLowerCase() || "")
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
    }, [testData?.questions, currentTestRes, questionSearchQuery]);

    const isLoading = singleProgressStatus === "pending" || singleProgressStatus === "idle";

    if (isLoading) {
        return (
            <div style={{ padding: "2rem" }}>
                <Skeleton active paragraph={{ rows: 2 }} />
                <Skeleton active paragraph={{ rows: 6 }} style={{ marginTop: '2rem' }} />
                <Skeleton active paragraph={{ rows: 8 }} style={{ marginTop: '2rem' }} />
            </div>
        );
    }

    if (singleProgressStatus === "rejected" || !singleProgress?.testDetails || !singleProgress?.response) {
        return (
            <div style={{ padding: "4rem", display: 'flex', justifyContent: 'center' }}>
                <Result
                    status="warning"
                    title="No Result Data Found"
                    subTitle="The test results for this student could not be fetched, are incomplete, or do not exist."
                    extra={<Button type="primary" onClick={() => nav.push('/testportal_admin/results-database')}>Back to Results</Button>}
                />
            </div>
        );
    }

    return (
        <div className={resultStyles.container} style={{ height: "auto", overflow: "visible", padding: ".3rem 2rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <Button onClick={() => nav.push('/testportal_admin/results-database')}>&larr; Back to Results Database</Button>
                <Button type="primary" onClick={() => nav.replace(`/testportal_admin/results-database/${singleProgress?._id}`)}>
                    Download Results
                </Button>
            </div>

            <div className={resultStyles.headerContainer} style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
                {blockedmsgVal === "blocked" && (
                    <Result
                        status="error"
                        title="Test Blocked"
                        subTitle="This student's test has been blocked."
                        style={{ background: '#fff', borderRadius: '8px', marginBottom: '1rem', padding: '1rem', width: '100%' }}
                    />
                )}

                <Card
                    title={<Title level={3} style={{ margin: 0 }}>Student Results</Title>}
                    variant="borderless"
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
                                        <Card size="small" variant="borderless" style={{ background: 'rgba(255,255,255,0.7)', height: '100%', border: "1px solid #d9d9d9" }}>
                                            <Statistic
                                                title="Status"
                                                value={(score?.totalScore < PassScore) ? "Fail" : "Pass"}
                                                styles={{ content: { color: (score?.totalScore < PassScore) ? '#cf1322' : '#3f8600', fontWeight: 'bold' } }}
                                                prefix={(score?.totalScore < PassScore) ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
                                            />
                                        </Card>
                                    </Col>
                                )}
                                {testValues?.grade && (
                                    <Col xs={12} sm={8}>
                                        <Card size="small" variant="borderless" style={{ background: 'rgba(255,255,255,0.7)', height: '100%', border: "1px solid #d9d9d9" }}>
                                            <Statistic title="Grade" value={testValues?.grade} styles={{ content: { fontWeight: 'bold' } }} />
                                        </Card>
                                    </Col>
                                )}
                                <Col xs={12} sm={8}>
                                    <Card size="small" variant="borderless" style={{ background: 'rgba(255,255,255,0.7)', height: '100%', border: "1px solid #d9d9d9" }}>
                                        <Statistic
                                            title="Percentage"
                                            value={parseFloat(((parseInt(score?.totalScore || 0)) / (parseInt(totalMarks) || 1)) * 100).toFixed(0)}
                                            suffix="%"
                                            styles={{ content: { fontWeight: 'bold' } }}
                                        />
                                    </Card>
                                </Col>

                                {/* Stats Grid */}
                                <Col xs={12} sm={8}>
                                    <Card size="small" variant="borderless" style={{ background: 'rgba(255,255,255,0.7)', height: '100%', border: "1px solid #d9d9d9" }}>
                                        <Statistic title="Score" value={`${score?.totalScore || 0} / ${totalMarks || 0}`} prefix={<CheckCircleOutlined style={{ color: '#1890ff' }} />} />
                                    </Card>
                                </Col>
                                <Col xs={12} sm={8}>
                                    <Card size="small" variant="borderless" style={{ background: 'rgba(255,255,255,0.7)', height: '100%', border: "1px solid #d9d9d9" }}>
                                        <Statistic title="Time Taken" value={parseFloat((score?.totalTimeTaken || 0) / 60).toFixed(2)} suffix="mins" prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />} />
                                    </Card>
                                </Col>
                                <Col xs={12} sm={8}>
                                    <Card size="small" variant="borderless" style={{ background: 'rgba(255,255,255,0.7)', height: '100%', border: "1px solid #d9d9d9" }}>
                                        <Statistic
                                            title="Speed"
                                            value={parseInt(score?.averageTimeTaken || 0) > 60 ? parseFloat((score?.averageTimeTaken || 0) / 60).toFixed(1) : parseInt(score?.averageTimeTaken || 0)}
                                            suffix={parseInt(score?.averageTimeTaken || 0) > 60 ? "mins/Q" : "secs/Q"}
                                            prefix={<ThunderboltOutlined style={{ color: '#eb2f96' }} />}
                                            styles={{ content: { fontSize: '1.2rem' } }}
                                        />
                                    </Card>
                                </Col>
                            </Row>
                        </Col>

                        <Col xs={24} lg={12}>
                            <Card variant="borderless" style={{ background: 'rgba(255,255,255,0.7)', height: '100%', border: "1px solid #d9d9d9" }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: '1rem' }}>
                                    <div style={{ width: '180px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {chartData?.series?.length > 0 ? (
                                            <DonutChart id={"testResult"} series={chartData?.series} labels={chartData?.labels} colors={chartData?.colors} />
                                        ) : (
                                            <Skeleton.Avatar active shape="circle" size={150} />
                                        )}
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
            <div className={resultStyles.anwers_div} style={{ marginTop: "2rem" }}>
                <div className={resultStyles.flagged_div}>
                    {singleProgress?.flagged?.length > 0 && (
                        <>
                            <h2>Flagged Question Numbers : </h2>
                            <div>
                                {singleProgress?.flagged.map((que, ind) => {
                                    const questionResult = ques?.map((question, index) => ({ question, index })).find(({ question }) => question?._id === que?.id);
                                    if (!questionResult) return null;
                                    const { question, index } = questionResult;
                                    return (
                                        <p key={ind} onClick={() => {
                                            if (quesContainerRef.current[index + 1])
                                                quesContainerRef.current[index + 1].current.scrollIntoView({ behavior: "smooth", block: "center", inline: "start" });
                                        }} style={{ cursor: "pointer", color: "blue", margin: "5px" }}>
                                            Question No: <strong>{index + 1}</strong><br />
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
                {testData?.questions?.length > 0 && (
                    <div style={{ position: "sticky", top: 0, zIndex: 10, background: "#fff", margin: "0 -2rem", padding: "1rem 2rem 10px 2rem", borderBottom: (selectedCategory !== "All" || questionSearchQuery !== "") ? "1px solid #f0f0f0" : "none" }}>
                        <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap", padding: "10px", background: "#f5f5f5", borderRadius: "8px" }}>
                            <div>
                                <strong>Filter by Category: </strong>
                                <Select value={selectedCategory} style={{ width: 200, marginLeft: 10 }} onChange={(val) => setSelectedCategory(val)}>
                                    <Select.Option value="All">All Categories</Select.Option>
                                    {[...new Set(testData?.questions?.map(q => q?.questionCategory?.[0]?.name || "Uncategorized") || [])].map(catName => (<Select.Option key={catName} value={catName}>{catName}</Select.Option>))}
                                </Select>
                            </div>
                            <div>
                                <strong>Search Questions: </strong>
                                <Input placeholder="Search questions or options..." value={questionSearchQuery} onChange={(e) => setQuestionSearchQuery(e.target.value)} style={{ width: 300, marginLeft: 10 }} allowClear />
                            </div>
                        </div>

                        {/* Active Filters Display */}
                        {(selectedCategory !== "All" || questionSearchQuery !== "") && (
                            <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                <span style={{ fontSize: "14px", color: "#666" }}>Active Filters:</span>

                                {selectedCategory !== "All" && (
                                    <Tag color="geekblue" closable onClose={handleClearCategory}>
                                        Category: {selectedCategory}
                                    </Tag>
                                )}

                                {questionSearchQuery !== "" && (
                                    <Tag color="purple" closable onClose={handleClearSearch}>
                                        Search: "{questionSearchQuery}"
                                    </Tag>
                                )}

                                <Button type="link" size="small" onClick={handleClearAll} style={{ padding: 0 }}>
                                    Clear All
                                </Button>
                            </div>
                        )}
                    </div>
                )}
                <div className={resultStyles.answers_scroll_cont} style={{ paddingBottom: "3rem", marginTop: "10px" }}>
                    {testData?.questions?.length > 0 && Object.keys(groupedQuestions).filter(catName => selectedCategory === "All" || selectedCategory === catName).length === 0 ? (
                        <Result
                            title="there is no question founds"
                        />
                    ) : testData?.questions?.length > 0 && (
                        <Collapse
                            defaultActiveKey={Object.keys(groupedQuestions)}
                            expandIconPlacement="end"
                            size="large"
                            items={Object.keys(groupedQuestions)
                                .filter(catName => selectedCategory === "All" || selectedCategory === catName)
                                .map((catName) => {
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
                                            let flaggedQues = singleProgress?.flagged?.find((que) => que?.id == e?._id);
                                            if (e?.questionType?.includes("Comprehension")) {
                                                return (
                                                    <Collapse
                                                        key={i}
                                                        collapsible="header"
                                                        defaultActiveKey={["1"]}
                                                        expandIconPlacement="end"
                                                        expandIcon={({ isActive }) => (<TbTriangleInvertedFilled className={`${progressStyles.icon} ${isActive ? progressStyles.iconActive : progressStyles.iconInactive}`} />)}
                                                        size="large"
                                                        items={[{
                                                            key: "1",
                                                            label: (
                                                                <div>
                                                                    <div className={progressStyles.header}><div><span>{e?.questionType}</span></div></div>
                                                                    {e?.questionType?.includes("Reading") ? (
                                                                        <div dangerouslySetInnerHTML={{ __html: parseIfJson(e?.comprehensionText) }} className={progressStyles.comprehension_text}></div>
                                                                    ) : (
                                                                        e?.resources != undefined && e?.resources != "" &&
                                                                        (e?.questionType !== "Reading Comprehension" && e?.questionType === "Video Comprehension"
                                                                            ? e?.resources?.url !== "" && (<video src={e?.resources?.url} controls />)
                                                                            : e?.resources?.url !== "" && (<audio src={e?.resources?.url} controls />))
                                                                    )}
                                                                </div>
                                                            ),
                                                            children: e?.questionContentArr?.map((subQues, index) => {
                                                                let flaggedSub = singleProgress?.flagged?.find((que) => que?.id == subQues?._id);
                                                                const absIndex = ques.findIndex(q => q._id === subQues._id);
                                                                const qNo = absIndex !== -1 ? absIndex + 1 : 1;
                                                                return (
                                                                    <div key={index} ref={quesContainerRef.current[qNo]}>
                                                                        <QuesComp quesContainerRef={quesContainerRef} e={subQues} i={index} questionNo={qNo} currentTestRes={currentTestRes} testRes={testRes} flagged={flaggedSub} />
                                                                    </div>
                                                                );
                                                            }),
                                                        }]}
                                                    ></Collapse>
                                                );
                                            } else {
                                                const absIndex = ques.findIndex(q => q._id === e._id);
                                                const qNo = absIndex !== -1 ? absIndex + 1 : 1;
                                                return (
                                                    <div key={i} ref={quesContainerRef.current[qNo]}>
                                                        <QuesComp quesContainerRef={quesContainerRef} e={e} i={i} questionNo={qNo} currentTestRes={currentTestRes} testRes={testRes} flagged={flaggedQues} />
                                                    </div>
                                                );
                                            }
                                        })
                                    };
                                })
                            }
                        />
                    )}
                    <div className={resultStyles.empty_div} />
                </div>
            </div>
        </div>
    );
}
