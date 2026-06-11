"use client";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { testUrl } from "@/config/urls";
import { Card, Spin, Row, Col, Typography, Statistic, Tag, Result } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, TrophyOutlined } from "@ant-design/icons";
import { getLstorage } from "@/utils/universalUtils/windowMW";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";

const { Title, Text } = Typography;

export default function TestResults() {
    const studentCreds = useSelector((state) => state.student.student?.data);
    const [loading, setLoading] = useState(true);
    const [recentResults, setRecentResults] = useState([]);

    useEffect(() => {
        if (studentCreds?._id) {
            const fetchResults = async () => {
                setLoading(true);
                try {
                    const token = getLstorage("token");
                    const res = await axios.get(`${testUrl}/getRecentTestResults/${studentCreds._id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setRecentResults(res.data.data || []);
                } catch (err) {
                    console.error("Failed to fetch test results:", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchResults();
        }
    }, [studentCreds?._id]);

    return (
        <div className="w-full">
            <StudentPageHeader section="Assessment" title="Test Results" />
            <Title level={2} className="mb-8 text-[#24A058]">
                <TrophyOutlined className="mr-[10px] text-[#f1c40f]" />
                Recent Test Results
            </Title>

            {loading ? (
                <div className="text-center p-12">
                    <Spin size="large" />
                </div>
            ) : recentResults.length === 0 ? (
                <Result
                    status="info"
                    title="No Test Results Found"
                    subTitle="You haven't completed any tests recently."
                />
            ) : (
                <Row gutter={[24, 24]}>
                    {recentResults.map((result) => {
                        const testTitle = result.testDetails?.title || "Unknown Test";
                        const category = result.testDetails?.category?.[0]?.name || "General";
                        const score = result.scoreData?.totalScore !== undefined ? result.scoreData.totalScore : "N/A";

                        const passScore = result.testDetails?.grading?.passScore;
                        let isPass = null;
                        if (passScore !== undefined && score !== "N/A") {
                            isPass = Number(score) >= Number(passScore);
                        }

                        return (
                            <Col xs={24} sm={24} md={12} lg={8} key={result._id}>
                                <Card
                                    hoverable
                                    className="rounded-xl border border-[#e8e8e8] overflow-hidden [&_.ant-card-body]:p-6"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <Tag color="blue" className="rounded">{category}</Tag>
                                        {isPass !== null && (
                                            <Tag
                                                icon={isPass ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                                                color={isPass ? "success" : "error"}
                                                className="rounded"
                                            >
                                                {isPass ? "PASS" : "FAIL"}
                                            </Tag>
                                        )}
                                    </div>

                                    <Title level={4} className="mt-0 mb-2 min-h-[40px]">
                                        {testTitle.length > 50 ? testTitle.substring(0, 50) + "..." : testTitle}
                                    </Title>

                                    <Text type="secondary" className="block mb-6">
                                        Attempted on: {new Date(parseInt(result._id.substring(0, 8), 16) * 1000).toLocaleDateString()}
                                    </Text>

                                    <div className="bg-[#f8f9fa] p-4 rounded-lg text-center">
                                        <Statistic
                                            title="Score Achieved"
                                            value={score}
                                            valueStyle={{ color: isPass === false ? '#cf1322' : '#3f8600', fontWeight: 'bold' }}
                                        />
                                    </div>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            )}
        </div>
    );
}
