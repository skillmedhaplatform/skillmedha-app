"use client";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { testUrl } from "@/config/urls";
import { Card, Spin, Row, Col, Typography, Button, message, Divider } from "antd";
import { EyeOutlined, DownloadOutlined, LeftOutlined } from "@ant-design/icons";
import { getLstorage } from "@/utils/universalUtils/windowMW";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";

const { Title, Text } = Typography;

export default function AttemptsList() {
    const studentCreds = useSelector((state) => state.student.student?.data);
    const [loading, setLoading] = useState(true);
    const [attempts, setAttempts] = useState([]);
    const [testTitle, setTestTitle] = useState("");
    const params = useParams();
    const router = useRouter();
    const testId = params["test-slug"];

    useEffect(() => {
        if (studentCreds?._id && testId) {
            const fetchResults = async () => {
                setLoading(true);
                try {
                    const token = getLstorage("token");
                    const res = await axios.get(`${testUrl}/getRecentTestResults/${studentCreds._id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    const data = res.data.data || [];
                    const testAttempts = data.filter(d => d.testId === testId);

                    testAttempts.sort((a, b) => parseInt(a._id.substring(0, 8), 16) - parseInt(b._id.substring(0, 8), 16));

                    setAttempts(testAttempts);
                    if (testAttempts.length > 0) {
                        setTestTitle(testAttempts[0].testDetails?.title || "Test Results");
                    }
                } catch (err) {
                    console.error("Failed to fetch test results:", err);
                    message.error("Failed to load results.");
                } finally {
                    setLoading(false);
                }
            };
            fetchResults();
        }
    }, [studentCreds?._id, testId]);

    const handlePreview = async (progressId) => {
        router.push(`/student/tests/${testId}/result?testId=${testId}&progressId=${progressId}`);
    };

    const handleDownload = async (progressId) => {
        router.push(`/student/tests/${testId}/result?testId=${testId}&progressId=${progressId}&download=true`);
    };

    return (
        <div className="w-full">
            <StudentPageHeader section="Assessment" title="Test Results" />
            <div className="mb-6 flex items-center gap-4">
                <Button icon={<LeftOutlined />} onClick={() => router.push('/student/testResults')} type="text">Back</Button>
                <Title level={3} className="!mb-0">{testTitle}</Title>
            </div>

            {loading ? (
                <div className="text-center p-12">
                    <Spin size="large" />
                </div>
            ) : attempts.length === 0 ? (
                <div className="text-center p-12">
                    <Text type="secondary">No attempts found for this test.</Text>
                </div>
            ) : (
                <div className="flex flex-col gap-4 max-w-3xl">
                    {attempts.map((attempt, index) => {
                        const score = attempt.scoreData?.totalScore !== undefined ? attempt.scoreData.totalScore : "N/A";
                        const dateStr = new Date(parseInt(attempt._id.substring(0, 8), 16) * 1000).toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'long', year: 'numeric'
                        });

                        return (
                            <React.Fragment key={attempt._id}>
                                <Card className="rounded-xl border border-[#e8e8e8] shadow-sm">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <Title level={4} className="!mb-1 !mt-0 text-blue-600">Attempt {index + 1}</Title>
                                            <div className="flex flex-col text-gray-500">
                                                <Text type="secondary">{dateStr}</Text>
                                                <Text type="secondary">Status: Completed</Text>
                                            </div>
                                        </div>

                                        <div className="text-center px-8 border-x border-gray-200">
                                            <Title level={2} className="!m-0 text-[#24A058]">{score}</Title>
                                            <Text type="secondary" className="text-xs uppercase tracking-wider">Score</Text>
                                        </div>

                                        <div className="flex flex-col gap-2 min-w-[120px]">
                                            <Button type="primary" icon={<EyeOutlined />} onClick={() => handlePreview(attempt._id)}>
                                                Preview
                                            </Button>
                                            <Button icon={<DownloadOutlined />} onClick={() => handleDownload(attempt._id)}>
                                                Download
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                                {index < attempts.length - 1 && <Divider className="my-2 bg-transparent" />}
                            </React.Fragment>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
