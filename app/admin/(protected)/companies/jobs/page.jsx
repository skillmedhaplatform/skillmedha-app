"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { decrypt, encrypt, setLstorage } from "@/utils/windowMW";
import BreadcrumbComponent from "@/modules/admin/components/breadcrumbs/breadcrumbs";
import { getJobsByOrg, resetJobs } from "@/redux/slices/admin/adminOrgSlice";
import {
  Divider,
  Spin,
  Input,
  Select,
  Space,
  Empty,
  Tag,
  Button,
  Pagination,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

import styles from "./jobs.module.scss";

const { Option } = Select;

function Page() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { replace, push } = useRouter();
  const encryptedOrgId = searchParams.get("orgId");
  const encryptedOrgName = searchParams.get("orgName");
  const ORG_ID = encryptedOrgId ? decrypt(encryptedOrgId) : null;
  const ORG_NAME = encryptedOrgName ? decrypt(encryptedOrgName) : "";

  const {
    value: jobs,
    loading,
    pagination,
  } = useSelector((state) => state.adminOrg.jobs);

  // Filter states - sync with URL
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Sync states with URL params
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlStatus = searchParams.get("status") || "all";
    const urlCity = searchParams.get("city") || "all";
    const urlSort = searchParams.get("sort") || "date-desc";
    const urlPage = parseInt(searchParams.get("page") || "1", 10);
    const urlLimit = parseInt(searchParams.get("limit") || "10", 10);

    setSearchQuery(urlSearch);
    setStatusFilter(urlStatus);
    setCityFilter(urlCity);
    setSortBy(urlSort);
    setCurrentPage(urlPage);
    setItemsPerPage(urlLimit);
  }, [searchParams]);

  // Update URL with filters (client-side only)
  const updateURL = useCallback(
    (updates) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value && value !== "all" && value !== "") {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      // Clean up empty params
      if (params.get("search") === "") params.delete("search");

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  // Fetch jobs ONLY for pagination (server-side)
  useEffect(() => {
    if (ORG_ID) {
      dispatch(
        getJobsByOrg({
          orgId: ORG_ID,
          page: currentPage,
          limit: itemsPerPage,
        })
      );
    }
  }, [ORG_ID, currentPage, itemsPerPage, dispatch]);

  // Cities from current page data
  const cities = useMemo(() => {
    if (!jobs || jobs.length === 0) return [];
    const uniqueCities = [
      ...new Set(jobs.map((job) => job.city).filter(Boolean)),
    ];
    return uniqueCities.sort();
  }, [jobs]);

  // CLIENT-SIDE Filter and Sort (only current page)
  const filteredAndSortedJobs = useMemo(() => {
    if (!jobs || jobs.length === 0) return [];

    let result = [...jobs];

    // Search filter (client-side)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((job) => {
        return (
          job.jobTitle?.toLowerCase().includes(query) ||
          job.companyName?.toLowerCase().includes(query) ||
          job.city?.toLowerCase().includes(query)
        );
      });
    }

    // Status filter (client-side)
    if (statusFilter !== "all") {
      result = result.filter((job) => job.status === statusFilter);
    }

    // City filter (client-side)
    if (cityFilter !== "all") {
      result = result.filter((job) => job.city === cityFilter);
    }

    // Sorting (client-side)
    switch (sortBy) {
      case "date-desc":
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "date-asc":
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "title-asc":
        result.sort((a, b) =>
          (a.jobTitle || "").localeCompare(b.jobTitle || "")
        );
        break;
      case "title-desc":
        result.sort((a, b) =>
          (b.jobTitle || "").localeCompare(a.jobTitle || "")
        );
        break;
      case "ctc-desc":
        result.sort(
          (a, b) => (parseFloat(b.ctc) || 0) - (parseFloat(a.ctc) || 0)
        );
        break;
      case "ctc-asc":
        result.sort(
          (a, b) => (parseFloat(a.ctc) || 0) - (parseFloat(b.ctc) || 0)
        );
        break;
      case "applicants-desc":
        result.sort(
          (a, b) => (b.applicants?.length || 0) - (a.applicants?.length || 0)
        );
        break;
      case "applicants-asc":
        result.sort(
          (a, b) => (a.applicants?.length || 0) - (b.applicants?.length || 0)
        );
        break;
      default:
        break;
    }

    return result;
  }, [jobs, searchQuery, statusFilter, cityFilter, sortBy]);

  // Handlers
  const handleSearch = useCallback(
    (value) => {
      const trimmedValue = value.trim();
      setSearchQuery(trimmedValue);
      updateURL({ search: trimmedValue || undefined, page: "1" });
    },
    [updateURL]
  );

  const handleStatusChange = useCallback(
    (value) => {
      setStatusFilter(value);
      updateURL({ status: value, page: "1" });
    },
    [updateURL]
  );

  const handleCityChange = useCallback(
    (value) => {
      setCityFilter(value);
      updateURL({ city: value, page: "1" });
    },
    [updateURL]
  );

  const handleSortChange = useCallback(
    (value) => {
      setSortBy(value);
      updateURL({ sort: value, page: "1" });
    },
    [updateURL]
  );

  const handlePageChange = useCallback(
    (page, pageSize) => {
      setCurrentPage(page);
      setItemsPerPage(pageSize || itemsPerPage);
      updateURL({
        page: page.toString(),
        limit: pageSize?.toString() || itemsPerPage.toString(),
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [updateURL, itemsPerPage]
  );

  // Active filter count
  const activeFilterCount =
    (searchQuery.trim() ? 1 : 0) +
    (statusFilter !== "all" ? 1 : 0) +
    (cityFilter !== "all" ? 1 : 0) +
    (sortBy !== "date-desc" ? 1 : 0);

  // Clear handlers
  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    updateURL({ search: undefined, page: "1" });
  }, [updateURL]);

  const handleClearStatus = useCallback(() => {
    setStatusFilter("all");
    updateURL({ status: undefined, page: "1" });
  }, [updateURL]);

  const handleClearCity = useCallback(() => {
    setCityFilter("all");
    updateURL({ city: undefined, page: "1" });
  }, [updateURL]);

  const handleClearSort = useCallback(() => {
    setSortBy("date-desc");
    updateURL({ sort: undefined, page: "1" });
  }, [updateURL]);

  const handleClearAll = useCallback(() => {
    setSearchQuery("");
    setStatusFilter("all");
    setCityFilter("all");
    setSortBy("date-desc");
    setCurrentPage(1);
    setItemsPerPage(10);
    updateURL({
      search: undefined,
      status: undefined,
      city: undefined,
      sort: undefined,
      page: "1",
      limit: "10",
    });
  }, [updateURL]);

  const getStatusColor = (status) => {
    switch (status) {
      case "expired":
        return "default";
      case "pending":
        return "processing";
      case "active":
        return "success";
      default:
        return "default";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleJobClick = (jobId) => {
    router.push(`${pathname}/${jobId}?${searchParams.toString()}`);
  };

  return (
    <div className={styles.pageContainer}>
      <BreadcrumbComponent />

      <div className={styles.headerSection}>
        <h1 className={styles.pageTitle}>Job Opportunities at {ORG_NAME}</h1>
        <div className={styles.headerContent}>
          <p className={styles.positionsCount}>
            {pagination?.totalJobs ?? 0} position
            {pagination?.totalJobs !== 1 ? "s" : ""} available
          </p>
          <div className={styles.filterSection}>
            <Input
              placeholder="Search jobs..."
              allowClear
              prefix={<SearchOutlined />}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 280 }}
              className={styles.searchBar}
            />

            <Space size="small" className={styles.filterControls} wrap>
              <Select
                value={statusFilter}
                onChange={handleStatusChange}
                size="middle"
                className={styles.filterSelect}
              >
                <Option value="all">All Status</Option>
                <Option value="active">Active</Option>
                <Option value="pending">Pending</Option>
                <Option value="expired">Expired</Option>
              </Select>

              <Select
                value={cityFilter}
                onChange={handleCityChange}
                size="middle"
                className={styles.filterSelect}
              >
                <Option value="all">All Cities</Option>
                {cities.map((city) => (
                  <Option key={city} value={city}>
                    {city}
                  </Option>
                ))}
              </Select>

              <Select
                value={sortBy}
                onChange={handleSortChange}
                size="middle"
                className={styles.filterSelect}
              >
                <Option value="date-desc">Newest First</Option>
                <Option value="date-asc">Oldest First</Option>
                <Option value="title-asc">Title (A-Z)</Option>
                <Option value="title-desc">Title (Z-A)</Option>
                <Option value="ctc-desc">Highest CTC</Option>
                <Option value="ctc-asc">Lowest CTC</Option>
                <Option value="applicants-desc">Most Applicants</Option>
                <Option value="applicants-asc">Least Applicants</Option>
              </Select>
            </Space>
          </div>
        </div>
      </div>

      {/* Active Filters Section */}
      {activeFilterCount > 0 && (
        <div
          className={styles.activeFilters}
          style={{
            padding: "12px",
            background: "#f5f5f5",
            borderRadius: "8px",
            marginBottom: "16px",
          }}
        >
          <Space size="small" wrap>
            <span style={{ fontWeight: 500 }}>Active Filters:</span>
            {searchQuery.trim() && (
              <Tag
                closable
                icon={<CloseCircleOutlined />}
                onClose={handleClearSearch}
                color="blue"
              >
                Search: {searchQuery}
              </Tag>
            )}
            {statusFilter !== "all" && (
              <Tag
                closable
                icon={<CloseCircleOutlined />}
                onClose={handleClearStatus}
                color="green"
              >
                Status: {statusFilter}
              </Tag>
            )}
            {cityFilter !== "all" && (
              <Tag
                closable
                icon={<CloseCircleOutlined />}
                onClose={handleClearCity}
                color="purple"
              >
                City: {cityFilter}
              </Tag>
            )}
            {sortBy !== "date-desc" && (
              <Tag
                closable
                icon={<CloseCircleOutlined />}
                onClose={handleClearSort}
                color="orange"
              >
                Sort: {sortBy.replace("-", " ")}
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
          <Spin size="large" tip="Loading jobs..." />
        </div>
      ) : filteredAndSortedJobs.length === 0 ? (
        <Empty
          description={
            activeFilterCount > 0
              ? "No jobs found matching your filters"
              : "No jobs available"
          }
        />
      ) : (
        <>
          <div className={styles.jobsGrid}>
            {filteredAndSortedJobs.map((job) => (
              <div
                key={job._id}
                className={styles.jobCard}
                onClick={() => {
                  setLstorage("jobDetails", JSON.stringify(job));
                  setTimeout(() => {}, 10);
                  push(
                    `/admin/organisationDetails/${ORG_ID}/${job?._id}?type=company`
                  );
                }}
              >
                <div className={styles.cardHeader}>
                  <Tooltip title={job?.jobTitle ?? "N/A"} placement="top">
                    <h3 className={styles.jobTitle}>
                      {job?.jobTitle ?? "N/A"}
                    </h3>
                  </Tooltip>
                  <Tag color={getStatusColor(job?.status)}>
                    {job?.status?.toUpperCase() ?? "N/A"}
                  </Tag>
                </div>

                <p className={styles.companyName}>
                  {job?.companyName ?? "N/A"}
                </p>

                <div className={styles.jobDetails}>
                  <div className={styles.detailItem}>
                    <EnvironmentOutlined />
                    <span>{job?.city ?? "N/A"}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <DollarOutlined />
                    <span>₹{job?.ctc ?? "N/A"} LPA</span>
                  </div>
                  <div className={styles.detailItem}>
                    <CalendarOutlined />
                    <span>
                      {formatDate(job?.startDate)} - {formatDate(job?.endDate)}
                    </span>
                  </div>
                </div>

                {job?.eligibilityCriteria?.length > 0 && (
                  <div className={styles.eligibility}>
                    <strong>Min. Marks:</strong>
                    {job.eligibilityCriteria.map(
                      (criteria, idx) =>
                        criteria?.minMarksPercentage && (
                          <Tag key={idx}>{criteria.minMarksPercentage}%</Tag>
                        )
                    )}
                  </div>
                )}

                <div className={styles.applicantInfo}>
                  {job?.applicants?.length ?? 0} applicant
                  {(job?.applicants?.length ?? 0) !== 1 ? "s" : ""}
                </div>

                <div className={styles.cardFooter}>
                  <span className={styles.backlogsInfo}>
                    Backlogs:{" "}
                    {job?.backlogsAllowed === "yes" ? "Allowed" : "Not Allowed"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.paginationContainer}>
            <Pagination
              current={currentPage}
              total={pagination?.totalJobs ?? 0}
              pageSize={itemsPerPage}
              onChange={handlePageChange}
              onShowSizeChange={handlePageChange}
              showSizeChanger
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} of ${total} jobs`
              }
              pageSizeOptions={["10", "20", "30", "50"]}
              disabled={loading}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default Page;
