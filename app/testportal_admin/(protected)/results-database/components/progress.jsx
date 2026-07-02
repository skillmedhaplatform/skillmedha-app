"use client";
import React, { useEffect, useState } from "react";
import progressStyles from "../styles/progress.module.scss";
import * as XLSX from "xlsx";
import {
  ArrowLeftOutlined,
  CloseOutlined,
  SearchOutlined,
  UserOutlined,
  DatabaseOutlined,
  TrophyOutlined,
  FileTextOutlined,
  ReloadOutlined,
  DownloadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CalendarOutlined,
  FieldTimeOutlined,
  TagOutlined,
} from "@ant-design/icons";
import {
  Button,
  Input,
  Modal,
  Table,
  DatePicker,
  InputNumber,
  Space,
  Avatar,
  Image,
  Tag,
  Divider,
  Select,
  Card,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllProgress,
  PAGE_SIZE,
} from "@/redux/slices/testportal_admin/slice/resultsDatabase";
import { getDepartments } from "@/redux/slices/testportal_admin/slice/studentSlice";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(customParseFormat);
dayjs.extend(isBetween);

const { Column } = Table;
const { Option } = Select;

const avatarColors = [
  "#1e69da", // TPO Blue
  "#24a058", // Green
  "#a855f7", // Purple
  "#f59e0b", // Orange
  "#06b6d4", // Cyan
  "#ec4899", // Pink
  "#ef4444", // Red
];

const ProgressComp = ({ deptId }) => {
  const progressDataAll = useSelector((state) => state.resultsDatabase.progress) || [];
  const progressDataStatus = useSelector((state) => state.resultsDatabase.status);
  const progressTotal = useSelector((state) => state.resultsDatabase.total);
  const departmentsList = useSelector((state) => state.Student.departments.value);

  const deptMap = React.useMemo(() => {
    const map = {};
    (departmentsList || []).forEach((d) => {
      if (d?._id) map[d._id] = d.title || d._id;
    });
    return map;
  }, [departmentsList]);

  // Filter data by the department from the route param
  const progressData = React.useMemo(() => {
    if (!deptId) return progressDataAll;
    return progressDataAll.filter(
      (record) => record?.studentDetails?.department === deptId
    );
  }, [progressDataAll, deptId]);

  const currentDeptName = deptId ? (deptMap[deptId] || deptId) : null;

  const dispatch = useDispatch();
  const currPath = usePathname();
  const nav = useRouter();
  const searchParams = useSearchParams();

  // Local Toolbar state variables (Screenshot 1 filters)
  const [globalSearchText, setGlobalSearchText] = useState("");
  const [testFilter, setTestFilter] = useState("all");
  const [scoreFilter, setScoreFilter] = useState("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Re-fetch whenever user navigates to this page
  useEffect(() => {
    dispatch(getAllProgress({ limit: 500 }));
    dispatch(getDepartments());
  }, [currPath]);

  const handleRefresh = () => {
    dispatch(getAllProgress({ limit: 500 }));
  };

  const [isModalOpen, setIsModalOpen] = useState(0);

  // Extract unique tests for dropdown
  const uniqueTestTitles = React.useMemo(() => {
    return Array.from(
      new Set(progressData?.map((item) => item?.testDetails?.title).filter(Boolean))
    );
  }, [progressData]);

  // Filter list locally based on globalSearchText, testFilter, and scoreFilter
  const filteredResultsList = React.useMemo(() => {
    return (progressData || []).filter((record) => {
      // 1. Global search (userName, email, phone, testTitle)
      const name = (record?.studentData?.["Full Name"] || "").toLowerCase();
      const email = (record?.studentData?.Email || "").toLowerCase();
      const phone = (record?.studentData?.["Phone Number"] || "").toLowerCase();
      const testTitle = (record?.testDetails?.title || "").toLowerCase();
      const query = globalSearchText.toLowerCase();
      const matchesSearch = globalSearchText
        ? name.includes(query) || email.includes(query) || phone.includes(query) || testTitle.includes(query)
        : true;

      // 2. Test title filter
      const matchesTest = testFilter === "all"
        ? true
        : record?.testDetails?.title === testFilter;

      // 3. Score filter
      const score = record?.scoreData?.finalScore || 0;
      const matchesScore = scoreFilter === "all"
        ? true
        : scoreFilter === "positive"
        ? score >= 0
        : score < 0;

      return matchesSearch && matchesTest && matchesScore;
    });
  }, [progressData, globalSearchText, testFilter, scoreFilter]);

  // Download Reports Handler
  const handleDownloadReports = () => {
    const excelData = filteredResultsList?.map((record, index) => ({
      "S.No": index + 1,
      "Test Name": record?.testDetails?.title || "N/A",
      "Department": deptMap[record?.studentDetails?.department] || record?.studentDetails?.department || "N/A",
      "Student Name": record?.studentData?.["Full Name"] || "N/A",
      Email: record?.studentData?.Email || "N/A",
      "Phone Number": record?.studentData?.["Phone Number"] || "N/A",
      "Test End Date": record?.createdAt ? record?.createdAt?.split(",")[0] : "N/A",
      "Time Taken (Minutes)": parseFloat(record?.scoreData?.totalTimeTaken / 60).toFixed(1),
      Score: `${record?.scoreData?.finalScore || 0}`,
      "Correct Answers": record?.scoreData?.correctQues || 0,
      "Incorrect Answers": record?.scoreData?.incorrectQues || 0,
      Unattempted: record?.scoreData?.unattemptedQues || 0,
      "Average Time per Question (Seconds)": parseInt(record?.scoreData?.averageTimeTaken) || 0,
      "Tab Switch Count": record?.studentData?.tabswitchCount || 0,
      Blocked: record?.studentData?.blockMessage === "blocked" ? "Yes" : "No",
      "Flagged Questions Count": record?.flagged?.length || 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const columnWidths = [
      { wch: 8 }, { wch: 30 }, { wch: 20 }, { wch: 15 }, { wch: 25 },
      { wch: 30 }, { wch: 15 }, { wch: 20 }, { wch: 10 }, { wch: 15 },
      { wch: 15 }, { wch: 12 }, { wch: 25 }, { wch: 15 }, { wch: 10 }, { wch: 20 },
    ];
    worksheet["!cols"] = columnWidths;
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Results Database");
    XLSX.writeFile(workbook, `Results_Database_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const viewResults = (data) =>
    nav.push(`/testportal_admin/results-database/student-result/${data._id}`);

  // Dynamic calculations for Metric Badges (Top Row)
  const resultsCount = filteredResultsList.length;
  const avgScore = resultsCount > 0
    ? (filteredResultsList.reduce((sum, r) => sum + (r?.scoreData?.finalScore || 0), 0) / resultsCount).toFixed(1)
    : "0";
  const testsCount = new Set(filteredResultsList.map((r) => r?.testDetails?.title).filter(Boolean)).size;

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current || 1);
    setPageSize(pagination.pageSize || 10);
  };

  return (
    <div className={progressStyles.container}>
      {/* Top Header Section (Screenshot 1 breadcrumbs + action buttons) */}
      <div className={progressStyles.headerSection}>
        <div className={progressStyles.headerContent}>
          <div className={progressStyles.titleRow}>
            <div className={progressStyles.titleLeft}>
              <Button
                type="link"
                icon={<ArrowLeftOutlined />}
                onClick={() => nav.push("/testportal_admin/results-database")}
                style={{ padding: 0, fontSize: "0.9rem", color: "#24a058", fontWeight: 600 }}
              >
                Departments
              </Button>
              <span className={progressStyles.breadcrumbSeparator}>/</span>
              <h2>{currentDeptName ? `${currentDeptName} — Results` : "Results Database"}</h2>
            </div>

            {/* Info Badges */}
            <div className={progressStyles.infoBar}>
              <div className={`${progressStyles.infoItem} ${progressStyles.results}`}>
                <DatabaseOutlined />
                <span>Results: <strong>{resultsCount}</strong></span>
              </div>
              <div className={`${progressStyles.infoItem} ${progressStyles.avgScore}`}>
                <TrophyOutlined />
                <span>Avg Score: <strong>{avgScore}</strong></span>
              </div>
              <div className={`${progressStyles.infoItem} ${progressStyles.tests}`}>
                <FileTextOutlined />
                <span>Tests: <strong>{testsCount}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions (Download Reports blue gradient) */}
        <div className={progressStyles.headerActions}>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={progressDataStatus === "pending"}
            className={progressStyles.refreshBtn}
          >
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDownloadReports}
            className={progressStyles.downloadReportsBtn}
          >
            Download Reports
          </Button>
        </div>
      </div>

      {/* Main Results Table Card */}
      <div className={progressStyles.progressBody}>
        <Card styles={{ body: { padding: "20px" } }}>
          {/* Custom Card Toolbar (Screenshot 1) */}
          <div className={progressStyles.tableHeaderRow}>
            <div className={progressStyles.tableHeaderLeft}>
              <span><FileTextOutlined /></span>
              All Results
            </div>

            <div className={progressStyles.tableHeaderRight}>
              {/* Search input pill */}
              <div className={progressStyles.searchCon}>
                <SearchOutlined className={progressStyles.searchIcon} />
                <input
                  placeholder="Search users..."
                  value={globalSearchText}
                  onChange={(e) => setGlobalSearchText(e.target.value)}
                />
              </div>

              {/* All Tests Dropdown */}
              <div className={progressStyles.filterSelect}>
                <Select
                  value={testFilter}
                  onChange={(val) => setTestFilter(val)}
                >
                  <Option value="all">All Tests</Option>
                  {uniqueTestTitles.map((title) => (
                    <Option key={title} value={title}>
                      {title}
                    </Option>
                  ))}
                </Select>
              </div>

              {/* All Scores Dropdown */}
              <div className={progressStyles.filterSelect}>
                <Select
                  value={scoreFilter}
                  onChange={(val) => setScoreFilter(val)}
                >
                  <Option value="all">All Scores</Option>
                  <Option value="positive">Positive Scores (&gt;=0)</Option>
                  <Option value="negative">Negative Scores (&lt;0)</Option>
                </Select>
              </div>
            </div>
          </div>

          <Table
            loading={progressDataStatus === "pending"}
            dataSource={filteredResultsList}
            rowKey="_id"
            onChange={handleTableChange}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: filteredResultsList.length,
              showSizeChanger: true,
              pageSizeOptions: ["10", "25", "50", "100"],
              showTotal: (filteredTotal, range) =>
                `Showing ${range[0]}-${range[1]} of ${filteredTotal} loaded (${progressTotal} total in DB)`,
              placement: ["bottomRight"],
            }}
            locale={{ emptyText: "No Results Added" }}
            scroll={{ x: 1200 }}
          >
            {/* Test Details */}
            <Column
              title="Test Details"
              key="testDetails"
              width={200}
              render={(_, record) => (
                <span className={progressStyles.testDetailsCell}>
                  {record?.testDetails?.title || "N/A"}
                </span>
              )}
            />

            {/* Department Tag */}
            <Column
              title="Department"
              key="department"
              width={160}
              render={(_, record) => {
                const deptId = record?.studentDetails?.department;
                const deptName = deptMap[deptId] || deptId || "N/A";
                return (
                  <span className={progressStyles.deptTag}>
                    <TagOutlined style={{ fontSize: "11px" }} /> {deptName}
                  </span>
                );
              }}
            />

            {/* User Details Stack */}
            <Column
              title="User Details"
              key="userDetails"
              width={280}
              render={(_, record) => {
                const fullName = record?.studentData?.["Full Name"] || "N/A";
                const initial = fullName !== "N/A" ? fullName.charAt(0).toUpperCase() : "?";
                const colorIdx = fullName !== "N/A" ? fullName.charCodeAt(0) % avatarColors.length : 0;
                const avatarColor = avatarColors[colorIdx];

                return (
                  <div className={progressStyles.userCell}>
                    <div className={progressStyles.avatar} style={{ backgroundColor: avatarColor }}>
                      {initial}
                    </div>
                    <div className={progressStyles.userTextStack}>
                      <span className={progressStyles.nameText}>{fullName}</span>
                      <span className={progressStyles.emailText}>{record?.studentData?.Email || "N/A"}</span>
                      <span className={progressStyles.phoneText}>{record?.studentData?.["Phone Number"] || "N/A"}</span>
                    </div>
                  </div>
                );
              }}
            />

            {/* End Details */}
            <Column
              title="End Details"
              key="testEndDetails"
              width={180}
              render={(_, record) => (
                <div className={progressStyles.endCell}>
                  <span className={progressStyles.dateText}>
                    {record?.createdAt ? record?.createdAt?.split(",")[0] : "N/A"}
                  </span>
                  <span className={progressStyles.timeDetailText}>
                    Time: {parseFloat(record?.scoreData?.totalTimeTaken / 60).toFixed(1)} min
                  </span>
                </div>
              )}
            />

            {/* Score */}
            <Column
              title="Score"
              key="score"
              width={100}
              align="center"
              sorter={(a, b) => (a?.scoreData?.finalScore || 0) - (b?.scoreData?.finalScore || 0)}
              render={(_, record) => {
                const score = record?.scoreData?.finalScore || 0;
                return (
                  <span className={`${progressStyles.scoreText} ${score >= 0 ? progressStyles.positive : progressStyles.negative}`}>
                    {score}
                  </span>
                );
              }}
            />

            {/* Time Taken */}
            <Column
              title="Time Taken"
              key="timeTaken"
              width={120}
              align="center"
              sorter={(a, b) => (a?.scoreData?.totalTimeTaken || 0) - (b?.scoreData?.totalTimeTaken || 0)}
              render={(_, record) => (
                <span className={progressStyles.timeTakenText}>
                  {parseFloat(record?.scoreData?.totalTimeTaken / 60).toFixed(1)} min
                </span>
              )}
            />

            {/* Image Circle Avatar */}
            <Column
              title="Image"
              key="image"
              width={110}
              align="center"
              render={(_, record) => {
                const imageUrl = record?.studentData?.capturedImage;
                return (
                  <div className={progressStyles.imageCell}>
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt="student avatar"
                        fallback="https://res.cloudinary.com/cliqtick/image/upload/v1718345892/sysnper/db47284929e120d0bdcc1955a52c1288_rulzfj.png"
                      />
                    ) : (
                      <Avatar size={32} icon={<UserOutlined />} />
                    )}
                  </div>
                );
              }}
            />

            {/* HRT Results pills */}
            <Column
              title="HRT"
              key="hrt"
              width={260}
              render={(_, record, index) => {
                const isBlocked = record?.studentData?.blockMessage === "blocked";
                const isFlagged = (record?.flagged?.length || 0) > 0;
                const isSwitched = (record?.studentData?.tabswitchCount || 0) > 0;

                // Pick correct status label and pill class matching mockup
                let statusLabel = "Average";
                let pillClass = progressStyles.average;
                if (isBlocked) {
                  statusLabel = "Blocked";
                  pillClass = progressStyles.blocked;
                } else if (isFlagged) {
                  statusLabel = "Flagged";
                  pillClass = progressStyles.flagged;
                } else if (isSwitched) {
                  statusLabel = "Switched";
                  pillClass = progressStyles.switched;
                }

                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span className={`${progressStyles.hrtPill} ${pillClass}`}>
                        {statusLabel}
                      </span>
                      {record?.studentActivity?.length ? (
                        <Button
                          className={progressStyles.studentActivity_btn}
                          type="primary"
                          onClick={() => setIsModalOpen(index + 1)}
                        >
                          Activity
                        </Button>
                      ) : null}
                    </div>

                    {/* Keep original details as metadata tooltips/labels under the pill */}
                    <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                      Avg time/q: {parseInt(record?.scoreData?.averageTimeTaken) > 60
                        ? `${parseInt(record?.scoreData?.averageTimeTaken / 60)} mins`
                        : `${parseInt(record?.scoreData?.averageTimeTaken)}s`}
                    </div>

                    {/* Student Activity Modal */}
                    {record?.studentActivity?.length ? (
                      <Modal
                        title="Student Activity Log"
                        open={isModalOpen === index + 1}
                        onOk={() => setIsModalOpen(0)}
                        onCancel={() => setIsModalOpen(0)}
                        width={800}
                        centered={true}
                        destroyOnHidden
                      >
                        <Table dataSource={record?.studentActivity} rowKey="time" pagination={{ pageSize: 5 }}>
                          <Column
                            title="Time"
                            key="time"
                            render={(_, rec) => <div>{new Date(rec?.time).toLocaleString()}</div>}
                          />
                          <Column
                            title="Event Name"
                            render={(_, rec) => <div>{rec?.event?.name}</div>}
                          />
                          <Column
                            title="Value / Verification Status"
                            render={(_, rec) => {
                              let val;
                              if (rec?.event?.value?.verified) val = "Verified";
                              else if (rec?.event?.value?.verified === false) val = "Unverified";
                              else if (rec?.event?.value?.status === "error") {
                                if (rec?.event?.value?.description?.includes("Face could not be detected")) val = "Face could not be detected";
                                else if (rec?.event?.value?.description?.includes("Please ensure")) val = "Multiple Person Detected";
                                else if (rec?.event?.value?.description?.includes("Do not use spoofed images")) val = "Spoofed image detected";
                              } else val = rec?.event?.value;
                              return <div>{val}</div>;
                            }}
                          />
                        </Table>
                      </Modal>
                    ) : null}
                  </div>
                );
              }}
            />

            {/* Actions: View (blue) + download (flat square icon button next to it) */}
            <Column
              title="Actions"
              key="resultsActions"
              width={130}
              align="center"
              render={(_, record) => (
                <div className={progressStyles.actionCell}>
                  <Button
                    type="primary"
                    className={progressStyles.viewBtn}
                    icon={<EyeOutlined />}
                    onClick={() => viewResults(record)}
                  >
                    View
                  </Button>
                  <Button
                    className={progressStyles.downloadIconBtn}
                    icon={<DownloadOutlined />}
                    onClick={() => nav.push(`/testportal_admin/results-database/student-result/${record._id}`)}
                  />
                </div>
              )}
            />
          </Table>
        </Card>
      </div>
    </div>
  );
};

export default ProgressComp;
