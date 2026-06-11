"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { decrypt } from "@/utils/windowMW";
import { debounce } from "lodash";
import BreadcrumbComponent from "@/modules/admin/components/breadcrumbs/breadcrumbs";
import { getStudentsInDepartment } from "@/redux/slices/admin/adminOrgSlice";
import { Table, Input, Button, Space, Tag, Spin, Divider, Tooltip } from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import styles from "./students.module.scss";

const Students = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  // Decrypt org and dept from URL params
  const encryptedOrgId = searchParams.get("orgId");
  const encryptedOrgName = searchParams.get("orgName");
  const encrypteddepartMentId = searchParams.get("deptId");
  const encrypteddepartMentName = searchParams.get("deptName");

  const ORG_ID = encryptedOrgId ? decrypt(encryptedOrgId) : null;
  const ORG_Name = encryptedOrgName ? decrypt(encryptedOrgName) : null;
  const Dep_Id = encrypteddepartMentId ? decrypt(encrypteddepartMentId) : null;
  const Dep_Name = encrypteddepartMentName
    ? decrypt(encrypteddepartMentName)
    : null;

  // Filter states - initialize from URL params
  const [globalSearch, setGlobalSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Pagination state
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  // URL sync flag to prevent infinite loops
  const [isUrlSyncing, setIsUrlSyncing] = useState(false);

  // Select students data object from Redux
  const {
    value: studentsData,
    loading,
    error,
  } = useSelector((state) => state.adminOrg.students);

  const students = studentsData?.students || [];
  const totalCount = studentsData?.totalCount || 0;
  const organizationAiUsage = studentsData?.organizationAiUsage || {};

  // Sync states with URL params on mount and URL changes
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlYear = searchParams.get("year") || "";
    const urlPage = parseInt(searchParams.get("page")) || 1;
    const urlLimit = parseInt(searchParams.get("limit")) || 10;

    setGlobalSearch(urlSearch);
    setYearFilter(urlYear);
    setDebouncedSearch(urlSearch);
    setPagination({ current: urlPage, pageSize: urlLimit });
  }, [searchParams]);

  // Update URL with filters - FIXED VERSION
  const updateUrl = useCallback(
    (newParams) => {
      if (isUrlSyncing) return; // Prevent infinite loop

      setIsUrlSyncing(true);

      const params = new URLSearchParams({
        orgId: encryptedOrgId || "",
        orgName: encryptedOrgName || "",
        deptId: encrypteddepartMentId || "",
        deptName: encrypteddepartMentName || "",
      });

      // Handle search param
      if (newParams.search !== undefined) {
        if (newParams.search && newParams.search.trim() !== "") {
          params.set("search", newParams.search);
        } else {
          params.delete("search");
        }
      }

      // Handle year param
      if (newParams.year !== undefined) {
        if (newParams.year && newParams.year.trim() !== "") {
          params.set("year", newParams.year);
        } else {
          params.delete("year");
        }
      }

      // Handle pagination
      if (newParams.page !== undefined) {
        params.set("page", newParams.page.toString());
      }

      if (newParams.limit !== undefined) {
        params.set("limit", newParams.limit.toString());
      }

      // Build clean URL
      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

      router.push(newUrl, { scroll: false });

      // Reset flag after short delay
      setTimeout(() => setIsUrlSyncing(false), 100);
    },
    [
      isUrlSyncing,
      pathname,
      router,
      encryptedOrgId,
      encryptedOrgName,
      encrypteddepartMentId,
      encrypteddepartMentName,
    ]
  );

  // Debounced search handler
  const debouncedSearchHandler = useCallback(
    debounce((searchValue) => {
      setDebouncedSearch(searchValue);
    }, 500),
    []
  );

  // Global search handler
  const handleGlobalSearch = useCallback(
    (value) => {
      const trimmedValue = value.trim();
      setGlobalSearch(trimmedValue);

      // Only update URL and debounce if 3+ characters or empty
      if (trimmedValue.length >= 3 || trimmedValue === "") {
        updateUrl({ search: trimmedValue, page: 1 });
        debouncedSearchHandler(trimmedValue);
      }
    },
    [updateUrl, debouncedSearchHandler]
  );

  // Fetch students when filters change
  useEffect(() => {
    if (ORG_ID && Dep_Id) {
      dispatch(
        getStudentsInDepartment({
          orgId: ORG_ID,
          departmentId: Dep_Id,
          page: pagination.current,
          limit: pagination.pageSize,
          search: debouncedSearch,
        })
      );
    }
  }, [
    ORG_ID,
    Dep_Id,
    pagination.current,
    pagination.pageSize,
    debouncedSearch,
    dispatch,
  ]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearchHandler.cancel();
    };
  }, [debouncedSearchHandler]);

  // Active filter count
  const activeFilterCount =
    (globalSearch && globalSearch.trim() ? 1 : 0) +
    (yearFilter && yearFilter.trim() ? 1 : 0);

  // Clear handlers - FIXED
  const handleClearSearch = useCallback(() => {
    setGlobalSearch("");
    setDebouncedSearch("");
    updateUrl({ search: "" });
  }, [updateUrl]);

  const handleClearYear = useCallback(() => {
    setYearFilter("");
    updateUrl({ year: "" });
  }, [updateUrl]);

  const handleClearAll = useCallback(() => {
    setGlobalSearch("");
    setDebouncedSearch("");
    setYearFilter("");
    setPagination({ current: 1, pageSize: 10 });
    updateUrl({
      search: "",
      year: "",
      page: 1,
      limit: 10,
    });
  }, [updateUrl]);

  // Table change handler
  const onTableChange = (page, pageSize) => {
    setPagination({ current: page, pageSize: pageSize || pagination.pageSize });
    updateUrl({ page, limit: pageSize });
  };

  // Extract unique years for filter
  const uniqueYears = [...new Set(students.map((s) => s.yearOfPassing))].sort();

  // Table columns
  const columns = [
    {
      title: "S.No",
      key: "sno",
      width: 70,
      fixed: "left",
      align: "center",
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Enrollment ID",
      dataIndex: "enrollementId",
      key: "enrollementId",
      width: 120,
      fixed: "left",
      sorter: (a, b) => a.enrollementId?.localeCompare(b.enrollementId),
    },
    {
      title: "Name",
      dataIndex: "userName",
      key: "userName",
      width: 240,
      sorter: (a, b) => {
        // Sort by userName first, then fallback to firstName + lastName
        const aName =
          a?.userName || `${a.firstName || ""} ${a.lastName || ""}`.trim();
        const bName =
          b?.userName || `${b.firstName || ""} ${b.lastName || ""}`.trim();
        return aName.localeCompare(bName);
      },
      render: (userName, record) => {
        // Priority: userName → firstName + lastName
        if (userName) {
          return <strong>{userName}</strong>;
        }

        const { firstName, lastName } = record;
        const fullName = `${firstName || ""} ${lastName || ""}`.trim();

        return fullName ? <strong>{fullName}</strong> : <strong>N/A</strong>;
      },
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 250,
      ellipsis: true,
      render: (email) => (
        <a href={`mailto:${email}`} style={{ color: "#1890ff" }}>
          {email}
        </a>
      ),
    },
    {
      title: (
        <Tooltip title="Total AI tokens used by this student">
          <Space>
            <ThunderboltOutlined />
            AI Tokens
          </Space>
        </Tooltip>
      ),
      dataIndex: ["aiUsage", "totalTokens"],
      key: "aiTokens",
      width: 150,
      align: "right",
      sorter: (a, b) => {
        const aTokens = a?.aiUsage?.totalTokens || 0;
        const bTokens = b?.aiUsage?.totalTokens || 0;
        return aTokens - bTokens;
      },
      render: (tokens, record) => {
        const totalTokens = record?.aiUsage?.totalTokens || 0;
        const completionTokens = record?.aiUsage?.totalCompletionTokens || 0;
        const promptTokens = record?.aiUsage?.totalPromptTokens || 0;

        return (
          <Tooltip
            title={
              <div>
                <div>Completion: {completionTokens.toLocaleString()}</div>
                <div>Prompt: {promptTokens.toLocaleString()}</div>
                <div>Total: {totalTokens.toLocaleString()}</div>
              </div>
            }
          >
            <Tag color={totalTokens > 0 ? "purple" : "default"}>
              {totalTokens.toLocaleString()}
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: (
        <Tooltip title="Number of AI requests made by this student">
          <Space>
            <RobotOutlined />
            AI Requests
          </Space>
        </Tooltip>
      ),
      dataIndex: ["aiUsage", "totalRequests"],
      key: "aiRequests",
      width: 150,
      align: "right",
      sorter: (a, b) => {
        const aRequests = a?.aiUsage?.totalRequests || 0;
        const bRequests = b?.aiUsage?.totalRequests || 0;
        return aRequests - bRequests;
      },
      render: (requests, record) => {
        const totalRequests = record?.aiUsage?.totalRequests || 0;
        return (
          <Tag color={totalRequests > 0 ? "cyan" : "default"}>
            {totalRequests.toLocaleString()}
          </Tag>
        );
      },
    },
    {
      title: "Year of Passing",
      dataIndex: "yearOfPassing",
      key: "yearOfPassing",
      width: 130,
      align: "center",
      sorter: (a, b) => a.yearOfPassing - b.yearOfPassing,
      filters: uniqueYears.map((year) => ({ text: year, value: year })),
      onFilter: (value, record) => {
        return record.yearOfPassing === value;
      },
      render: (year) => <Tag color="blue">{year}</Tag>,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      render: (date) => new Date(date).toLocaleDateString("en-IN"),
    },
  ];

  // Refresh handler
  const handleRefresh = () => {
    if (ORG_ID && Dep_Id) {
      dispatch(
        getStudentsInDepartment({
          orgId: ORG_ID,
          departmentId: Dep_Id,
          page: pagination.current,
          limit: pagination.pageSize,
          search: debouncedSearch,
        })
      );
    }
  };

  return (
    <div className={styles.studentsContainer}>
      <BreadcrumbComponent />

      <div className={styles.header}>
        <div>
          <h2>
            {ORG_Name} - {Dep_Name}
          </h2>
          <p className={styles.subtitle}>
            Total Students: <strong>{totalCount}</strong>
          </p>
        </div>
        <Space>
          <Input
            placeholder="Search by name or email... (3+ chars)"
            value={globalSearch}
            onChange={(e) => handleGlobalSearch(e.target.value)}
            prefix={<SearchOutlined />}
            style={{ width: 280 }}
            allowClear
            onClear={handleClearSearch}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
            type="default"
          >
            Refresh
          </Button>
        </Space>
      </div>

      {/* Active Filters Section */}
      {activeFilterCount > 0 && (
        <div className={styles.activeFilters}>
          <Space size="small" wrap>
            <span style={{ fontWeight: 500 }}>Active Filters:</span>
            {globalSearch && globalSearch.trim() && (
              <Tag closable onClose={handleClearSearch} color="blue">
                Search: {globalSearch}
              </Tag>
            )}
            {yearFilter && yearFilter.trim() && (
              <Tag closable onClose={handleClearYear} color="green">
                Year: {yearFilter}
              </Tag>
            )}
            <Button
              type="link"
              size="small"
              onClick={handleClearAll}
              style={{ padding: 0 }}
            >
              Clear All
            </Button>
          </Space>
        </div>
      )}

      <Divider style={{ margin: "16px 0" }} />

      {loading ? (
        <div className={styles.loadingContainer}>
          <Spin size="large" tip="Loading students..." />
        </div>
      ) : error ? (
        <div className={styles.errorContainer}>
          <p>Error: {error}</p>
          <Button type="primary" onClick={handleRefresh}>
            Retry
          </Button>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <Table
            columns={columns}
            dataSource={students}
            rowKey="_id"
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: totalCount,
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} students`,
              pageSizeOptions: ["10", "20", "50", "100"],
              placement: ["bottomCenter"],
              showQuickJumper: true,
              onChange: onTableChange,
              onShowSizeChange: onTableChange,
            }}
            sticky={{ offsetHeader: 0 }}
            bordered
            size="middle"
            className={styles.studentsTable}
            rowClassName={(record, index) =>
              index % 2 === 0 ? styles.evenRow : styles.oddRow
            }
          />
        </div>
      )}
    </div>
  );
};

export default Students;
