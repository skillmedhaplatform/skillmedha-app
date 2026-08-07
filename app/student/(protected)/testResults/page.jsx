"use client";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { useRouter } from "next/navigation";
import { testUrl } from "@/config/urls";
import { Card, Spin, Row, Col, Typography, Statistic, Tag, Result, Button, message } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, TrophyOutlined, EyeOutlined, DownloadOutlined, ClockCircleOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { getLstorage } from "@/utils/universalUtils/windowMW";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";
import _ from "lodash";

const { Title, Text } = Typography;

export default function TestResults() {
    const studentCreds = useSelector((state) => state.student.student?.data);
    const [loading, setLoading] = useState(true);
    const [groupedResults, setGroupedResults] = useState([]);
    const router = useRouter();

    useEffect(() => {
        if (studentCreds?._id) {
            const fetchResults = async () => {
                setLoading(true);
                try {
                    const token = getLstorage("token");
                    const res = await axios.get(`${testUrl}/getRecentTestResults/${studentCreds._id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    const data = res.data.data || [];

                    // Group by testId and attemptGeneration
                    const grouped = _.groupBy(data, (d) => `${d.testId}_${d.attemptGeneration || 0}`);
                    const resultsArray = Object.keys(grouped).map(key => {
                        const attempts = grouped[key];
                        attempts.sort((a, b) => parseInt(b._id.substring(0, 8), 16) - parseInt(a._id.substring(0, 8), 16));
                        const actualLatest = attempts[0];

                        let bestScore = "N/A";
                        let latestScore = actualLatest.scoreData?.totalScore !== undefined ? actualLatest.scoreData.totalScore : "N/A";

                        const scores = attempts.map(a => a.scoreData?.totalScore).filter(s => s !== undefined && !isNaN(s));
                        if (scores.length > 0) {
                            bestScore = Math.max(...scores);
                        }

                        const testDetails = actualLatest.testDetails || {};
                        const category = testDetails.category?.[0]?.name || "General";
                        const passScore = testDetails.grading?.gradingCriteria?.passScore;
                        const maxAttempts = Number(testDetails.access?.attemptsPerRespondent) || 1;

                        let isPass = null;
                        if (passScore !== undefined && latestScore !== "N/A") {
                            isPass = Number(latestScore) >= Number(passScore);
                        }
                        
                        const generation = actualLatest.attemptGeneration || 0;
                        const currentTestGen = testDetails.attemptGeneration || 0;
                        
                        let testTitle = testDetails.title || "Unknown Test";
                        if (generation < currentTestGen) {
                            testTitle += ` (Gen ${generation + 1})`;
                        }

                        return {
                            testId: actualLatest.testId,
                            testTitle,
                            category,
                            isPass,
                            latestScore,
                            bestScore,
                            attemptsUsed: attempts.length,
                            maxAttempts,
                            latestAttemptId: actualLatest._id,
                            thumbnail: testDetails.thumbnail || null
                        };
                    });

                    setGroupedResults(resultsArray);
                } catch (err) {
                    console.error("Failed to fetch test results:", err);
                    message.error("Failed to load results.");
                } finally {
                    setLoading(false);
                }
            };
            fetchResults();
        }
    }, [studentCreds?._id]);

    const handlePreview = (testId) => {
        router.push(`/student/testResults/${testId}`);
    };

    return (
        <div className="w-full">
            <StudentPageHeader section="Assessment" title="Test Results" />
            <Title level={2} className="mb-8 text-[#24A058]">
                <TrophyOutlined className="mr-[10px] text-[#f1c40f]" />
                My Results
            </Title>

            {loading ? (
                <div className="text-center p-12">
                    <Spin size="large" />
                </div>
            ) : groupedResults.length === 0 ? (
                <Result
                    status="info"
                    title="No Test Results Found"
                    subTitle="You haven't completed any tests yet."
                />
            ) : (
                <Row gutter={[24, 24]}>
                    {groupedResults.map((result) => (
                        <Col xs={24} sm={24} md={12} lg={8} key={result.testId}>
                            <Card
                                hoverable
                                className="rounded-xl border border-[#e8e8e8] overflow-hidden [&_.ant-card-body]:p-0"
                                bodyStyle={{ padding: 0 }}
                            >
                                {result.thumbnail && (
                                    <div
                                        style={{ backgroundImage: `url(${result.thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center', height: 120 }}
                                        className="w-full"
                                    />
                                )}
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-3">
                                        <Tag color="blue" className="rounded m-0">{result.category}</Tag>
                                        {result.isPass !== null && (
                                            <Tag
                                                icon={result.isPass ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                                                color={result.isPass ? "success" : "error"}
                                                className="rounded m-0"
                                            >
                                                {result.isPass ? "PASS" : "FAIL"}
                                            </Tag>
                                        )}
                                    </div>

                                    <Title level={4} className="!mt-0 !mb-1 min-h-[40px] leading-tight">
                                        {result.testTitle.length > 50 ? result.testTitle.substring(0, 50) + "..." : result.testTitle}
                                    </Title>

                                    <Text type="secondary" className="block mb-4 flex items-center gap-1">
                                        <ClockCircleOutlined /> Status: Completed
                                    </Text>

                                    <div className="bg-[#f8f9fa] rounded-lg p-3 mb-4">
                                        <Row gutter={8}>
                                            <Col span={8} className="text-center border-r border-gray-200">
                                                <Text type="secondary" className="text-xs">Latest Score</Text>
                                                <div className="font-bold text-lg text-gray-800">{result.latestScore}</div>
                                            </Col>
                                            <Col span={8} className="text-center border-r border-gray-200">
                                                <Text type="secondary" className="text-xs">Best Score</Text>
                                                <div className="font-bold text-lg text-gray-800">{result.bestScore}</div>
                                            </Col>
                                            <Col span={8} className="text-center">
                                                <Text type="secondary" className="text-xs">Attempts</Text>
                                                <div className="font-bold text-lg text-gray-800">{result.attemptsUsed} / {result.maxAttempts === -1 ? '∞' : result.maxAttempts}</div>
                                            </Col>
                                        </Row>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            type="primary"
                                            icon={<EyeOutlined />}
                                            className="flex-1"
                                            onClick={() => handlePreview(result.testId)}
                                        >
                                            Preview
                                        </Button>
                                        <Button
                                            icon={<DownloadOutlined />}
                                            className="flex-1"
                                            onClick={() => handlePreview(result.testId)}
                                        >
                                            Download
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </div>
    );
}
