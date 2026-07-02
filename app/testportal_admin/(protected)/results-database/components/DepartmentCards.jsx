"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Skeleton, Empty, Input, Tooltip, Select, Pagination } from "antd";
import { 
    SearchOutlined, 
    AppstoreOutlined, 
    UnorderedListOutlined,
    TeamOutlined,
    FileDoneOutlined,
    LineChartOutlined,
    BookOutlined,
    RiseOutlined,
    FallOutlined,
    DatabaseOutlined,
    FileTextOutlined
} from "@ant-design/icons";
import { getAllProgress } from "@/redux/slices/testportal_admin/slice/resultsDatabase";
import { getDepartments } from "@/redux/slices/testportal_admin/slice/studentSlice";
import styles from "../styles/departmentCards.module.scss";

const DepartmentCards = () => {
    const dispatch = useDispatch();
    const router = useRouter();

    const progressData = useSelector((state) => state.resultsDatabase.progress) || [];
    const progressStatus = useSelector((state) => state.resultsDatabase.status);
    const departmentsList = useSelector((state) => state.Student.departments.value) || [];
    const deptStatus = useSelector((state) => state.Student.departments.status);

    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("results-desc");
    const [viewMode, setViewMode] = useState("grid"); // grid or list
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(4);

    // Reset to page 1 on search or sort change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, sortBy, pageSize]);

    useEffect(() => {
        dispatch(getAllProgress({ limit: 500 }));
        dispatch(getDepartments());
    }, [dispatch]);

    // Calculate global stats for the 4 overview cards
    const globalStats = useMemo(() => {
        const totalDepts = departmentsList?.length || 0;
        const totalResults = progressData?.length || 0;
        
        let totalScore = 0;
        const uniqueTests = new Set();
        
        progressData.forEach((record) => {
            totalScore += record?.scoreData?.finalScore || 0;
            const testTitle = record?.testDetails?.title;
            if (testTitle) uniqueTests.add(testTitle);
        });

        const avgScoreAll = totalResults > 0 ? (totalScore / totalResults).toFixed(2) : "0.00";
        const activeTests = uniqueTests.size;

        return {
            totalDepts,
            totalResults,
            avgScoreAll,
            activeTests
        };
    }, [departmentsList, progressData]);

    // Calculate details map for each department
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

        return Object.values(statsMap).map((dept) => ({
            ...dept,
            avgScore:
                dept.totalResults > 0
                    ? (dept.totalScore / dept.totalResults).toFixed(1)
                    : "0.0",
            totalTests: dept.testNames.size,
            latestDateFormatted: dept.latestDate
                ? dept.latestDate.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                })
                : "—",
        }));
    }, [departmentsList, progressData]);

    // Filter and Sort departments
    const processedDepts = useMemo(() => {
        let result = departmentStats.filter((dept) =>
            dept.title.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (sortBy === "name-asc") {
            result.sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortBy === "name-desc") {
            result.sort((a, b) => b.title.localeCompare(a.title));
        } else if (sortBy === "results-desc") {
            result.sort((a, b) => b.totalResults - a.totalResults);
        } else if (sortBy === "score-desc") {
            result.sort((a, b) => parseFloat(b.avgScore) - parseFloat(a.avgScore));
        }

        return result;
    }, [departmentStats, searchTerm, sortBy]);

    // Paginate results
    const paginatedDepts = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return processedDepts.slice(startIndex, startIndex + pageSize);
    }, [processedDepts, currentPage, pageSize]);

    const handleCardClick = (deptId) => {
        router.push(`/testportal_admin/results-database/department/${deptId}`);
    };

    // Helper to generate elegant gradient style for department fallback logo
    const getGradientStyle = (title = "") => {
        const hash = Array.from(title).reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const gradients = [
            "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)", // Blue
            "linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)", // Teal
            "linear-gradient(135deg, #1e1b4b 0%, #4f46e5 100%)", // Indigo
            "linear-gradient(135deg, #312e81 0%, #6366f1 100%)", // Royal Blue
            "linear-gradient(135deg, #1f2937 0%, #4b5563 100%)", // Charcoal
        ];
        return gradients[hash % gradients.length];
    };

    const isLoading = progressStatus === "pending" || deptStatus === "pending";

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.titleGroup}>
                        <div className={styles.titleIcon}><DatabaseOutlined /></div>
                        <h2>Results Database</h2>
                    </div>
                </div>
                <div className={styles.statsRow}>
                    {[1, 2, 3, 4].map((i) => (
                        <div className={styles.statCard} key={i}>
                            <Skeleton.Avatar active size="large" shape="square" />
                            <div style={{ flex: 1, marginLeft: 8 }}>
                                <Skeleton.Button active style={{ width: 80, height: 20 }} />
                            </div>
                        </div>
                    ))}
                </div>
                <div className={styles.grid}>
                    {[1, 2, 3].map((i) => (
                        <div className={styles.card} key={i}>
                            <Skeleton active paragraph={{ rows: 5 }} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Top Header Section */}
            <div className={styles.header}>
                <div className={styles.titleGroup}>
                    <div className={styles.titleIcon}><DatabaseOutlined /></div>
                    <h2>Results Database</h2>
                    <span className={styles.deptBadge}>
                        {globalStats.totalDepts} {globalStats.totalDepts === 1 ? "department" : "departments"}
                    </span>
                </div>
                
                <div className={styles.controls}>
                    <div className={styles.filterWrapper}>
                        <Input
                            placeholder="Search departments..."
                            prefix={<SearchOutlined />}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            allowClear
                        />
                        
                        <Select
                            value={sortBy}
                            onChange={(value) => setSortBy(value)}
                            options={[
                                { value: "results-desc", label: "Sort: Total Results" },
                                { value: "score-desc", label: "Sort: Avg Score" },
                                { value: "name-asc", label: "Sort: Name A-Z" },
                                { value: "name-desc", label: "Sort: Name Z-A" },
                            ]}
                        />
                    </div>

                    <div className={styles.viewToggle}>
                        <button 
                            className={viewMode === "grid" ? styles.active : ""} 
                            onClick={() => setViewMode("grid")}
                            title="Grid View"
                        >
                            <AppstoreOutlined />
                        </button>
                        <button 
                            className={viewMode === "list" ? styles.active : ""} 
                            onClick={() => setViewMode("list")}
                            title="List View"
                        >
                            <UnorderedListOutlined />
                        </button>
                    </div>
                </div>
            </div>

            {/* Global Stats Overview Row */}
            <div className={styles.statsRow}>
                <div className={styles.statCard}>
                    <div className={`${styles.statIconCont} ${styles.blue}`}>
                        <TeamOutlined />
                    </div>
                    <div className={styles.statValueGroup}>
                        <span className={styles.statValue}>{globalStats.totalDepts}</span>
                        <span className={styles.statLabel}>Departments</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIconCont} ${styles.green}`}>
                        <FileDoneOutlined />
                    </div>
                    <div className={styles.statValueGroup}>
                        <span className={styles.statValue}>{globalStats.totalResults}</span>
                        <span className={styles.statLabel}>Total Results</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIconCont} ${styles.orange}`}>
                        <LineChartOutlined />
                    </div>
                    <div className={styles.statValueGroup}>
                        <span className={styles.statValue}>{globalStats.avgScoreAll}</span>
                        <span className={styles.statLabel}>Avg Score (all)</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIconCont} ${styles.red}`}>
                        <BookOutlined />
                    </div>
                    <div className={styles.statValueGroup}>
                        <span className={styles.statValue}>{globalStats.activeTests}</span>
                        <span className={styles.statLabel}>Active Tests</span>
                    </div>
                </div>
            </div>

            {/* Department Grid/List */}
            {!processedDepts.length ? (
                <div className={styles.emptyState}>
                    <Empty description="No departments matching search found" />
                </div>
            ) : (
                <div className={viewMode === "grid" ? styles.grid : styles.list}>
                    {paginatedDepts.map((dept) => {
                        const isAvgPositive = parseFloat(dept.avgScore) >= 0;
                        // Score calculation for indicator bar width
                        const scoreNum = parseFloat(dept.avgScore);
                        const progressPercent = Math.min(Math.max((scoreNum + 10) * 5, 0), 100); // offset & scale visually

                        return (
                            <Tooltip
                                key={dept.id}
                                title="Click to view department results"
                                placement="top"
                                mouseEnterDelay={0.4}
                            >
                                <div
                                    className={styles.card}
                                    onClick={() => handleCardClick(dept.id)}
                                >
                                    {/* Card Header Image / Cover */}
                                    <div 
                                        className={styles.imgCont}
                                        style={!dept.branchLogo ? { background: getGradientStyle(dept.title) } : {}}
                                    >
                                        {dept.totalResults > 0 && (
                                            <span className={styles.activeBadge}>Active</span>
                                        )}
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
                                        <h3 className={styles.titleOverlay}>{dept.title}</h3>
                                    </div>

                                    {/* Card Body */}
                                    <div className={styles.cardBody}>
                                        {/* Horizontal Capsule Badges */}
                                        <div className={styles.capsuleRow}>
                                            <span className={`${styles.capsule} ${styles.results}`}>
                                                <FileTextOutlined /> {dept.totalResults} Results
                                            </span>
                                            <span className={`${styles.capsule} ${isAvgPositive ? styles.avgPositive : styles.avgNegative}`}>
                                                {isAvgPositive ? <RiseOutlined /> : <FallOutlined />} Avg: {dept.avgScore}
                                            </span>
                                            <span className={`${styles.capsule} ${styles.tests}`}>
                                                <BookOutlined /> {dept.totalTests} Tests
                                            </span>
                                        </div>

                                        {/* 2x2 Details Grid */}
                                        <div className={styles.detailsGrid}>
                                            <div className={styles.detailBox}>
                                                <span className={styles.detailLabel}>Total Results</span>
                                                <span className={styles.detailValue}>{dept.totalResults}</span>
                                            </div>
                                            <div className={styles.detailBox}>
                                                <span className={styles.detailLabel}>Avg Score</span>
                                                <span className={`${styles.detailValue} ${isAvgPositive ? styles.positive : styles.negative}`}>
                                                    {dept.avgScore}
                                                </span>
                                            </div>
                                            <div className={styles.detailBox}>
                                                <span className={styles.detailLabel}>Tests</span>
                                                <span className={styles.detailValue}>{dept.totalTests}</span>
                                            </div>
                                            <div className={styles.detailBox}>
                                                <span className={styles.detailLabel}>Latest</span>
                                                <span className={styles.detailValue}>{dept.latestDateFormatted}</span>
                                            </div>
                                        </div>

                                        {/* Horizontal Score Progress Bar Indicator */}
                                        <div className={styles.progressBarRow}>
                                            <div className={styles.progressBarBg}>
                                                <div 
                                                    className={`${styles.progressBarFill} ${isAvgPositive ? styles.positive : styles.negative}`}
                                                    style={{ width: `${progressPercent}%` }}
                                                />
                                            </div>
                                            <span className={`${styles.progressBarText} ${isAvgPositive ? styles.positive : styles.negative}`}>
                                                {dept.avgScore} pts
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Tooltip>
                        );
                    })}
                </div>
            )}

            {/* Pagination Controls */}
            {processedDepts.length > 0 && (
                <div className={styles.paginationRow}>
                    <Pagination
                        current={currentPage}
                        pageSize={pageSize}
                        total={processedDepts.length}
                        onChange={(page, size) => {
                            setCurrentPage(page);
                            setPageSize(size);
                        }}
                        pageSizeOptions={["4", "8", "12", "20", "50"]}
                        showSizeChanger
                        showQuickJumper
                        showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} departments`}
                    />
                </div>
            )}
        </div>
    );
};

export default DepartmentCards;
