"use client";
import React, { useEffect, useRef, useState } from "react";
import progressStyles from "../styles/progress.module.scss";
import * as XLSX from "xlsx";
import { ArrowLeftOutlined, CloseOutlined, SearchOutlined, UserOutlined, DatabaseOutlined, TrophyOutlined, FileTextOutlined, ReloadOutlined, DownloadOutlined } from "@ant-design/icons";
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
} from "antd";
import { useDispatch } from "react-redux";
import {
  getAllProgress,
  PAGE_SIZE,
} from "@/redux/slices/testportal_admin/slice/resultsDatabase";
import { getDepartments } from "@/redux/slices/testportal_admin/slice/studentSlice";
import { useSelector } from "react-redux";
import resultStyles from "../styles/results.module.scss";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import QuesComp from "./quesComp";
import { parseIfJson } from "@/utils/windowMW";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(customParseFormat);
dayjs.extend(isBetween);

const { Column } = Table;
const { RangePicker } = DatePicker;

// ── URL param helpers ─────────────────────────────────────────────────────────
const parseList = (v) => (v ? v.split(",").filter(Boolean) : null);
const parseRange = (v) => { if (!v) return null; const p = v.split(","); return p.length === 2 ? p : null; };
const parseNumRange = (v) => {
  if (!v) return null;
  const p = v.split(",");
  if (p.length !== 2) return null;
  return [p[0] === "" ? null : Number(p[0]), p[1] === "" ? null : Number(p[1])];
};

const HRT_LABELS = {
  blocked: "Blocked",
  not_blocked: "Not Blocked",
  tab_switch: "Has Tab Switches",
  flagged: "Has Flagged Questions",
};

// ── Component ─────────────────────────────────────────────────────────────────
const ProgressComp = ({ deptId }) => {
  const progressDataAll = useSelector((state) => state.resultsDatabase.progress) || [];
  const progressDataStatus = useSelector((state) => state.resultsDatabase.status);
  const progressTotal = useSelector((state) => state.resultsDatabase.total);
  const departmentsList = useSelector((state) => state.Student.departments.value);

  const deptMap = React.useMemo(() => {
    const map = {};
    (departmentsList || []).forEach((d) => { if (d?._id) map[d._id] = d.title || d._id; });
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

  // ── Read URL state ──────────────────────────────────────────────────────────
  const urlPage = parseInt(searchParams.get("page") || "1", 10);
  const urlPageSize = parseInt(searchParams.get("ps") || String(PAGE_SIZE), 10);
  const urlTest = parseList(searchParams.get("test"));
  const urlDept = parseList(searchParams.get("dept"));
  const urlEmail = searchParams.get("email") || null;
  const urlDate = parseRange(searchParams.get("date"));
  const urlScore = parseNumRange(searchParams.get("score"));
  const urlTime = parseNumRange(searchParams.get("time"));
  const urlHrt = parseList(searchParams.get("hrt"));

  // ── Push new params to URL ──────────────────────────────────────────────────
  const setParams = (updates) => {
    const p = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v === null || v === undefined || v === "" || (Array.isArray(v) && v.length === 0)) {
        p.delete(k);
      } else {
        p.set(k, Array.isArray(v) ? v.join(",") : String(v));
      }
    });
    nav.replace(`${currPath}?${p.toString()}`, { scroll: false });
  };

  // ── Table onChange – fires on filter or sort change ─────────────────────────
  const handleTableChange = (pagination, filters) => {
    const page = pagination.current || 1;
    const test = filters.testDetails?.length ? filters.testDetails : null;
    const dept = filters.department?.length ? filters.department : null;
    const email = filters.userDetails?.length ? filters.userDetails[0] : null;
    const date = filters.testEndDetails?.length ? filters.testEndDetails[0] : null;  // [[start,end]]
    const score = filters.score?.length ? filters.score[0] : null;   // [min,max]
    const time = filters.timeTaken?.length ? filters.timeTaken[0] : null;
    const hrt = filters.hrt?.length ? filters.hrt : null;

    setParams({
      page: page !== 1 ? page : null,
      ps: pagination.pageSize !== PAGE_SIZE ? pagination.pageSize : null,
      test: test,
      dept: dept,
      email: email,
      date: date ? date.join(",") : null,
      score: score ? `${score[0] ?? ""},${score[1] ?? ""}` : null,
      time: time ? `${time[0] ?? ""},${time[1] ?? ""}` : null,
      hrt: hrt,
    });
  };

  // Re-fetch whenever user navigates to this page, so new results are always shown
  useEffect(() => {
    dispatch(getAllProgress({ limit: 500 }));
    dispatch(getDepartments());
  }, [currPath]);

  const handleRefresh = () => {
    dispatch(getAllProgress({ limit: 500 }));
  };

  const [isModalOpen, setIsModalOpen] = useState(0);

  // ── Active filter tags ──────────────────────────────────────────────────────
  const activeTags = [];

  if (urlTest?.length) {
    urlTest.forEach((t) =>
      activeTags.push({ key: "test", label: `Test: ${t}`, remove: () => setParams({ test: null, page: null }) })
    );
  }
  if (urlDept?.length) {
    urlDept.forEach((id) =>
      activeTags.push({
        key: `dept-${id}`,
        label: `Dept: ${deptMap[id] || id}`,
        remove: () => {
          const remaining = urlDept.filter((d) => d !== id);
          setParams({ dept: remaining.length ? remaining : null, page: null });
        },
      })
    );
  }
  if (urlEmail) {
    activeTags.push({ key: "email", label: `Email: ${urlEmail}`, remove: () => setParams({ email: null, page: null }) });
  }
  if (urlDate) {
    activeTags.push({ key: "date", label: `Date: ${urlDate[0]} – ${urlDate[1]}`, remove: () => setParams({ date: null, page: null }) });
  }
  if (urlScore) {
    const [mn, mx] = urlScore;
    activeTags.push({ key: "score", label: `Score: ${mn ?? ""}–${mx ?? ""}`, remove: () => setParams({ score: null, page: null }) });
  }
  if (urlTime) {
    const [mn, mx] = urlTime;
    activeTags.push({ key: "time", label: `Time: ${mn ?? ""}–${mx ?? ""} min`, remove: () => setParams({ time: null, page: null }) });
  }
  if (urlHrt?.length) {
    urlHrt.forEach((h) =>
      activeTags.push({
        key: `hrt-${h}`,
        label: `HRT: ${HRT_LABELS[h] || h}`,
        remove: () => {
          const remaining = urlHrt.filter((x) => x !== h);
          setParams({ hrt: remaining.length ? remaining : null, page: null });
        },
      })
    );
  }

  // ── Download ────────────────────────────────────────────────────────────────
  const handleDownloadReports = () => {
    const excelData = progressData?.map((record, index) => ({
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

  // ── Date range filter props (controlled) ────────────────────────────────────
  const getDateRangeFilter = () => ({
    filteredValue: urlDate ? [urlDate] : null,
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <RangePicker
          style={{ marginBottom: 8, display: "block" }}
          value={selectedKeys[0] ? [dayjs(selectedKeys[0][0], "DD/MM/YYYY"), dayjs(selectedKeys[0][1], "DD/MM/YYYY")] : null}
          onChange={(dates, dateStrings) => {
            if (dates && dates[0] && dates[1]) setSelectedKeys([dateStrings]);
            else setSelectedKeys([]);
          }}
          format="DD/MM/YYYY"
        />
        <Space>
          <Button type="primary" onClick={() => confirm()} icon={<SearchOutlined />} size="small" style={{ width: 90 }}>Filter</Button>
          <Button onClick={() => { clearFilters(); setSelectedKeys([]); confirm(); }} size="small" style={{ width: 90 }}>Reset</Button>
        </Space>
      </div>
    ),
    onFilter: (value, record) => {
      try {
        if (!value || !value[0]) return true;
        const [startDateStr, endDateStr] = value[0];
        if (!record?.createdAt) return false;
        const recordDate = dayjs(record.createdAt.split(",")[0].trim(), "DD/MM/YYYY", true);
        const startDate = dayjs(startDateStr, "DD/MM/YYYY", true);
        const endDate = dayjs(endDateStr, "DD/MM/YYYY", true);
        if (!recordDate.isValid() || !startDate.isValid() || !endDate.isValid()) return false;
        return recordDate.isBetween(startDate, endDate, "day", "[]");
      } catch { return false; }
    },
  });

  // ── Score range filter props ────────────────────────────────────────────────
  const getScoreRangeFilter = () => ({
    filteredValue: urlScore ? [urlScore] : null,
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
      const [minScore, maxScore] = selectedKeys[0] || [null, null];
      return (
        <div style={{ padding: 8, width: 250 }}>
          <div style={{ marginBottom: 8 }}>
            <label>Min Score: </label>
            <InputNumber placeholder="Min" value={minScore} onChange={(val) => setSelectedKeys([[val, maxScore]])} style={{ width: "100%", marginTop: 4 }} />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label>Max Score: </label>
            <InputNumber placeholder="Max" value={maxScore} onChange={(val) => setSelectedKeys([[minScore, val]])} style={{ width: "100%", marginTop: 4 }} />
          </div>
          <Space>
            <Button type="primary" onClick={() => confirm()} icon={<SearchOutlined />} size="small" style={{ width: 90 }}>Filter</Button>
            <Button onClick={() => { clearFilters(); setSelectedKeys([]); confirm(); }} size="small" style={{ width: 90 }}>Reset</Button>
          </Space>
        </div>
      );
    },
    onFilter: (value, record) => {
      if (!value || !value.length) return true;
      const [min, max] = value;
      const score = record?.scoreData?.finalScore || 0;
      if (min !== null && max !== null) return score >= min && score <= max;
      if (min !== null) return score >= min;
      if (max !== null) return score <= max;
      return true;
    },
  });

  // ── Time taken filter props ─────────────────────────────────────────────────
  const getTimeTakenFilter = () => ({
    filteredValue: urlTime ? [urlTime] : null,
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
      const [minTime, maxTime] = selectedKeys[0] || [null, null];
      return (
        <div style={{ padding: 8, width: 250 }}>
          <div style={{ marginBottom: 8 }}>
            <label>Min Time (minutes): </label>
            <InputNumber placeholder="Min" value={minTime} onChange={(val) => setSelectedKeys([[val, maxTime]])} style={{ width: "100%", marginTop: 4 }} />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label>Max Time (minutes): </label>
            <InputNumber placeholder="Max" value={maxTime} onChange={(val) => setSelectedKeys([[minTime, val]])} style={{ width: "100%", marginTop: 4 }} />
          </div>
          <Space>
            <Button type="primary" onClick={() => confirm()} icon={<SearchOutlined />} size="small" style={{ width: 90 }}>Filter</Button>
            <Button onClick={() => { clearFilters(); setSelectedKeys([]); confirm(); }} size="small" style={{ width: 90 }}>Reset</Button>
          </Space>
        </div>
      );
    },
    onFilter: (value, record) => {
      if (!value || !value.length) return true;
      const [min, max] = value;
      const timeTaken = parseFloat(record?.scoreData?.totalTimeTaken / 60) || 0;
      if (min !== null && max !== null) return timeTaken >= min && timeTaken <= max;
      if (min !== null) return timeTaken >= min;
      if (max !== null) return timeTaken <= max;
      return true;
    },
  });

  const viewResults = (data) => nav.push(`/testportal_admin/results-database/student-result/${data._id}`);

  // ── JSX ─────────────────────────────────────────────────────────────────────
  return (
    <div className={progressStyles.container}>
      <div className={progressStyles.headerSection}>
        {/* Left Side: Title, Info, Filters */}
        <div className={progressStyles.headerContent}>
          <div className={progressStyles.titleRow}>
            <div className={progressStyles.titleLeft}>
              <Button
                type="link"
                icon={<ArrowLeftOutlined />}
                onClick={() => nav.push("/testportal_admin/results-database")}
                style={{ padding: 0, fontSize: "0.9rem", color: "#27ae60" }}
              >
                Departments
              </Button>
              <h2>{currentDeptName ? `${currentDeptName} — Results` : "Results Database"}</h2>
            </div>

            {/* Info Bar (Inline) */}
            <div className={progressStyles.infoBar}>
              <div className={progressStyles.infoItem}>
                <DatabaseOutlined style={{ color: "#27ae60" }} />
                <span>Results: <strong>{progressData.length}</strong></span>
              </div>
              <div className={progressStyles.infoItem}>
                <TrophyOutlined style={{ color: "#faad14" }} />
                <span>Avg Score: <strong>
                  {progressData.length > 0
                    ? (progressData.reduce((sum, r) => sum + (r?.scoreData?.finalScore || 0), 0) / progressData.length).toFixed(1)
                    : "0"}
                </strong></span>
              </div>
              <div className={progressStyles.infoItem}>
                <FileTextOutlined style={{ color: "#1890ff" }} />
                <span>Tests: <strong>
                  {new Set(progressData.map((r) => r?.testDetails?.title).filter(Boolean)).size}
                </strong></span>
              </div>
            </div>
          </div>

          {/* Active filter tags (Inline below title) */}
          {activeTags.length > 0 && (
            <div className={progressStyles.filterTags}>
              {activeTags.map((tag) => (
                <Tag
                  key={tag.key}
                  closable
                  onClose={tag.remove}
                  closeIcon={<CloseOutlined style={{ fontSize: 10 }} />}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "2px 8px",
                    borderRadius: 12,
                    fontSize: 12,
                    background: "#e6f4ff",
                    borderColor: "#91caff",
                    color: "#0958d9",
                  }}
                >
                  {tag.label}
                </Tag>
              ))}
              <Button
                size="small"
                type="link"
                onClick={() => nav.replace(currPath, { scroll: false })}
                style={{ padding: 0, fontSize: 12 }}
              >
                Clear all
              </Button>
            </div>
          )}
        </div>

        {/* Right Side: Action Buttons */}
        <div className={progressStyles.headerActions}>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={progressDataStatus === "pending"}
          >
            Refresh
          </Button>
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownloadReports}>
            Download Reports
          </Button>
        </div>
      </div>

      <Divider style={{ margin: "0 0 0.5rem 0" }} />

      <div className={progressStyles.progressBody} id="progressBody">
        <Table
          loading={progressDataStatus === "pending"}
          dataSource={progressData}
          rowKey="_id"
          onChange={handleTableChange}
          pagination={{
            current: urlPage,
            pageSize: urlPageSize,
            total: progressData.length,
            showSizeChanger: true,
            pageSizeOptions: ["10", "25", "50", "100"],
            showTotal: (filteredTotal, range) =>
              `${range[0]}-${range[1]} of ${filteredTotal} loaded (${progressTotal} total in DB)`,
            placement: ["bottomRight"],
          }}
          locale={{ emptyText: "No Results Added" }}
          sticky={{ offsetHeader: 0, offsetScroll: 0 }}
          scroll={{ x: "max-content" }}
        >
          {/* Test Details */}
          <Column
            title="Test Details"
            key="testDetails"
            width={230}
            minWidth={230}
            filteredValue={urlTest || null}
            filters={Array.from(
              new Set(progressData?.map((item) => item?.testDetails?.title).filter(Boolean))
            ).map((t) => ({ text: t, value: t }))}
            onFilter={(value, record) => record?.testDetails?.title === value}
            filterSearch={true}
            render={(_, record) => (
              <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                <div style={{ marginBottom: 4 }}>
                  <span>Test Name: </span>
                  <strong>{record?.testDetails?.title}</strong>
                </div>
              </div>
            )}
          />

          {/* Department */}
          <Column
            title="Department"
            key="department"
            width={160}
            minWidth={160}
            filteredValue={urlDept || null}
            filters={Array.from(
              new Set(progressData?.map((item) => item?.studentDetails?.department).filter(Boolean))
            ).map((deptId) => ({ text: deptMap[deptId] || deptId, value: deptId }))}
            onFilter={(value, record) => (record?.studentDetails?.department || "") === value}
            filterSearch={true}
            render={(_, record) => {
              const deptId = record?.studentDetails?.department;
              const deptName = deptMap[deptId] || deptId;
              return (
                <div style={{ fontWeight: 500 }}>
                  {deptName || <span style={{ color: "#bbb" }}>N/A</span>}
                </div>
              );
            }}
          />

          {/* User Details */}
          <Column
            title="User Details"
            key="userDetails"
            width={280}
            minWidth={280}
            filteredValue={urlEmail ? [urlEmail] : null}
            filterDropdown={({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
              <div style={{ padding: 8, width: "20rem" }}>
                <Input
                  placeholder="Search by Email"
                  value={selectedKeys[0]}
                  onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                  onPressEnter={() => confirm()}
                  style={{ marginBottom: 8 }}
                  allowClear
                />
                <Button type="primary" onClick={() => confirm()} icon={<SearchOutlined />} size="small" style={{ width: 90, marginRight: 8 }}>Search</Button>
                <Button onClick={() => { clearFilters(); setSelectedKeys([]); }} size="small" style={{ width: 90 }}>Reset</Button>
              </div>
            )}
            filterIcon={(filtered) => <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />}
            onFilter={(value, record) => {
              const needle = value.toLowerCase();
              const email1 = (record?.studentData?.Email || "").toLowerCase();
              const email2 = (record?.studentDetails?.email || "").toLowerCase();
              const name = (record?.studentData?.["Full Name"] || "").toLowerCase();
              return email1.includes(needle) || email2.includes(needle) || name.includes(needle);
            }}
            render={(_, record) => (
              <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                <div style={{ marginBottom: 4 }}><span>Name: </span><strong>{record?.studentData?.["Full Name"]}</strong></div>
                <div style={{ marginBottom: 4 }}><span>Email: </span><strong>{record?.studentData?.Email}</strong></div>
                <div><span>Phone: </span><strong>{record?.studentData?.["Phone Number"]}</strong></div>
              </div>
            )}
          />

          {/* End Details (date range) */}
          <Column
            title="End Details"
            key="testEndDetails"
            width={200}
            minWidth={200}
            {...getDateRangeFilter()}
            render={(_, record) => (
              <div style={{ whiteSpace: "normal" }}>
                <div style={{ marginBottom: 4 }}>
                  <span>Test End Date: </span>
                  <strong>{record?.createdAt ? record?.createdAt?.split(",")[0] : "N/A"}</strong>
                </div>
                <div>
                  <span>Time taken: </span>
                  <strong>{parseFloat(record?.scoreData?.totalTimeTaken / 60).toFixed(1)} Minutes</strong>
                </div>
              </div>
            )}
          />

          {/* Score */}
          <Column
            title="Score"
            key="score"
            width={100}
            minWidth={100}
            {...getScoreRangeFilter()}
            sorter={(a, b) => (a?.scoreData?.finalScore || 0) - (b?.scoreData?.finalScore || 0)}
            render={(_, record) => (
              <div style={{ textAlign: "center" }}>
                <strong>{record?.scoreData?.finalScore || 0}</strong>
              </div>
            )}
          />

          {/* Time Taken */}
          <Column
            title="Time Taken"
            key="timeTaken"
            width={130}
            minWidth={130}
            {...getTimeTakenFilter()}
            sorter={(a, b) => (a?.scoreData?.totalTimeTaken || 0) - (b?.scoreData?.totalTimeTaken || 0)}
            render={(_, record) => (
              <div style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                <strong>{parseFloat(record?.scoreData?.totalTimeTaken / 60).toFixed(1)} min</strong>
              </div>
            )}
          />

          {/* Image */}
          <Column
            title="Image"
            key="image"
            width={120}
            minWidth={120}
            render={(_, record) => {
              const imageUrl = record?.studentData?.capturedImage;
              return (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt="student"
                      width={80}
                      height={80}
                      style={{ objectFit: "cover", borderRadius: "4px" }}
                      fallback="https://res.cloudinary.com/cliqtick/image/upload/v1718345892/sysnper/db47284929e120d0bdcc1955a52c1288_rulzfj.png"
                    />
                  ) : (
                    <Avatar size={30} icon={<UserOutlined />} />
                  )}
                </div>
              );
            }}
          />

          {/* Results */}
          <Column
            title="Results"
            key="results"
            width={180}
            minWidth={180}
            render={(_, record) => (
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <Button type="primary" size="small" onClick={() => viewResults(record)}>View</Button>
                <Button size="small" onClick={() => nav.push(`/testportal_admin/results-database/${record._id}`)}>Download</Button>
              </div>
            )}
          />

          {/* HRT Results */}
          <Column
            title="HRT Results"
            key="hrt"
            width={280}
            minWidth={280}
            filteredValue={urlHrt || null}
            filters={[
              { text: "Blocked", value: "blocked" },
              { text: "Not Blocked", value: "not_blocked" },
              { text: "Has Tab Switches", value: "tab_switch" },
              { text: "Has Flagged Questions", value: "flagged" },
            ]}
            onFilter={(value, record) => {
              if (value === "blocked") return record?.studentData?.blockMessage === "blocked";
              if (value === "not_blocked") return record?.studentData?.blockMessage !== "blocked";
              if (value === "tab_switch") return (record?.studentData?.tabswitchCount || 0) > 0;
              if (value === "flagged") return (record?.flagged?.length || 0) > 0;
              return true;
            }}
            render={(_, record, index) => (
              <section style={{ whiteSpace: "normal" }}>
                <div style={{ marginBottom: 4 }}>
                  Average time per question:{" "}
                  <strong>
                    {parseInt(record?.scoreData?.averageTimeTaken) > 60
                      ? `${parseInt(record?.scoreData?.averageTimeTaken / 60)} mins`
                      : `${parseInt(record?.scoreData?.averageTimeTaken)}s`}
                  </strong>
                </div>
                {record?.studentData?.tabswitchCount ? (
                  <div style={{ marginBottom: 4 }}>
                    Switched Test window:{" "}
                    <strong>{record?.studentData?.tabswitchCount} {`time${record?.studentData?.tabswitchCount > 1 ? "s" : ""}`}</strong>
                  </div>
                ) : null}
                {record?.studentData?.blockMessage === "blocked" && (
                  <div style={{ marginBottom: 4 }}>
                    <strong className={progressStyles.student_test_block}>Student test has been Blocked</strong>
                  </div>
                )}
                {record?.flagged?.length > 0 ? (
                  <div style={{ marginBottom: 4 }}>
                    Flagged Questions: <strong>{record?.flagged?.length}</strong>
                  </div>
                ) : null}
                {record?.studentActivity?.length ? (
                  <div>
                    <Button
                      className={progressStyles.studentActivity_btn}
                      type="primary"
                      onClick={() => setIsModalOpen(index + 1)}
                    >
                      Student Activity
                    </Button>
                    <Modal
                      title="Student Activity"
                      open={isModalOpen !== 0}
                      onOk={() => setIsModalOpen(0)}
                      onCancel={() => setIsModalOpen(0)}
                      width={800}
                      centered={true}
                    >
                      <Table dataSource={progressData[isModalOpen - 1]?.studentActivity}>
                        <Column title="Time" key="time" render={(_, rec) => <div>{new Date(rec?.time).toLocaleString()}</div>} />
                        <Column title="Name" render={(_, rec) => <div>{rec?.event?.name}</div>} />
                        <Column title="Value" render={(_, rec) => {
                          let val;
                          if (rec?.event?.value?.verified) val = "Verified";
                          else if (rec?.event?.value?.verified === false) val = "Unverified";
                          else if (rec?.event?.value?.status === "error") {
                            if (rec?.event?.value?.description?.includes("Face could not be detected")) val = "Face could not be detected";
                            else if (rec?.event?.value?.description?.includes("Please ensure")) val = "Multiple Person Detected";
                            else if (rec?.event?.value?.description?.includes("Do not use spoofed images")) val = "Spoofed image detected";
                          } else val = rec?.event?.value;
                          return <div>{val}</div>;
                        }} />
                      </Table>
                    </Modal>
                  </div>
                ) : null}
              </section>
            )}
          />
        </Table>
      </div>
    </div>
  );
};

export default ProgressComp;
