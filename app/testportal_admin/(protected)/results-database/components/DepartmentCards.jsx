"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Skeleton, Empty, Input, Tooltip, Divider } from "antd";
import { TeamOutlined, SearchOutlined } from "@ant-design/icons";
import { getAllProgress } from "@/redux/slices/testportal_admin/slice/resultsDatabase";
import { getDepartments } from "@/redux/slices/testportal_admin/slice/studentSlice";
import styles from "../styles/departmentCards.module.scss";

const DepartmentCards = () => {
    const dispatch = useDispatch();
    const router = useRouter();

    const progressData =
        useSelector((state) => state.resultsDatabase.progress) || [];
    const progressStatus = useSelector((state) => state.resultsDatabase.status);
    const departmentsList =
        useSelector((state) => state.Student.departments.value) || [];
    const deptStatus = useSelector((state) => state.Student.departments.status);

    useEffect(() => {
        dispatch(getAllProgress({ limit: 500 }));
        dispatch(getDepartments());
    }, []);

    const departmentStats = useMemo(() => {
        if (!departmentsList?.length) return [];
        const statsMap = {};

        departmentsList.forEach((dept) => {
            if (dept?._id) {
                statsMap[dept._id] = {
                    id: dept._id,
                    title: dept.title || dept._id,
                    branchLogo: dept.branchLogo || null,
                    totalResults: 0,
                    totalScore: 0,
                    testNames: new Set(),
                    latestDate: null,
                };
            }
        });

        progressData.forEach((record) => {
            const deptId = record?.studentDetails?.department;
            if (deptId && statsMap[deptId]) {
                statsMap[deptId].totalResults += 1;
                statsMap[deptId].totalScore += record?.scoreData?.finalScore || 0;
                const testTitle = record?.testDetails?.title;
                if (testTitle) statsMap[deptId].testNames.add(testTitle);
                const dateStr = record?.createdAt?.split(",")[0]?.trim();
                if (dateStr) {
                    const parts = dateStr.split("/");
                    if (parts.length === 3) {
                        const d = new Date(parts[2], parts[1] - 1, parts[0]);
                        if (!statsMap[deptId].latestDate || d > statsMap[deptId].latestDate) {
                            statsMap[deptId].latestDate = d;
                        }
                    }
                }
            }
        });

        return Object.values(statsMap)
            .map((dept) => ({
                ...dept,
                avgScore:
                    dept.totalResults > 0
                        ? (dept.totalScore / dept.totalResults).toFixed(1)
                        : "0",
                totalTests: dept.testNames.size,
                latestDateFormatted: dept.latestDate
                    ? dept.latestDate.toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                    })
                    : "—",
            }))
            .sort((a, b) => b.totalResults - a.totalResults);
    }, [departmentsList, progressData]);

    const [searchTerm, setSearchTerm] = useState("");

    const handleCardClick = (deptId) => {
        router.push(`/testportal_admin/results-database/department/${deptId}`);
    };

    const isLoading = progressStatus === "pending" || deptStatus === "pending";

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2>Results Database</h2>
                </div>
                <Divider style={{ margin: "0 0 1rem 0" }} />
                <div className={styles.grid}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div className={styles.card} key={i}>
                            <Skeleton active paragraph={{ rows: 4 }} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!departmentStats.length) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2>Results Database</h2>
                </div>
                <Divider style={{ margin: "0 0 1rem 0" }} />
                <Empty description="No departments found" />
            </div>
        );
    }

    const filteredDepts = departmentStats.filter((dept) =>
        dept.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Results Database</h2>
                <div className={styles.searchBar}>
                    <Input
                        placeholder="Search departments..."
                        prefix={<SearchOutlined />}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        allowClear
                    />
                </div>
            </div>

            <Divider style={{ margin: "0 0 1rem 0" }} />

            <div className={styles.grid}>
                {filteredDepts.map((dept) => (
                    <Tooltip
                        key={dept.id}
                        title="Click to view results"
                        placement="top"
                        mouseEnterDelay={0.4}
                    >
                        <div
                            className={styles.card}
                            onClick={() => handleCardClick(dept.id)}
                        >
                            <div className={styles.imgCont}>
                                {dept.branchLogo ? (
                                    <img
                                        src={dept.branchLogo}
                                        alt={dept.title}
                                        className={styles.branchImage}
                                    />
                                ) : (
                                    <div className={styles.logoPlaceholder}>
                                        <TeamOutlined />
                                    </div>
                                )}
                            </div>

                            <div className={styles.titleCont}>
                                <p className={styles.title}>{dept.title}</p>
                            </div>

                            <div className={styles.infoSection}>
                                <div className={styles.detailsSection}>
                                    <p>
                                        <strong>Total Results:</strong> {dept.totalResults}
                                    </p>
                                    <p>
                                        <strong>Avg Score:</strong> {dept.avgScore}
                                    </p>
                                    <p>
                                        <strong>Tests:</strong> {dept.totalTests}
                                    </p>
                                    <p>
                                        <strong>Latest:</strong> {dept.latestDateFormatted}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Tooltip>
                ))}
            </div>
        </div>
    );
};

export default DepartmentCards;
