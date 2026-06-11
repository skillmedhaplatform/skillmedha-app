"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { decrypt, encrypt } from "@/utils/windowMW";
import BreadcrumbComponent from "@/modules/admin/components/breadcrumbs/breadcrumbs";
import { getAllDepartmentsFromOrgs } from "@/redux/slices/admin/adminOrgSlice";
import {
  Divider,
  Spin,
  Input,
  Select,
  Space,
  Pagination,
  Tag,
  Button,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import DepartmentCard from "@/modules/admin/components/departmentCard/departmentCard";
import styles from "./department.module.scss";

const { Search } = Input;
const { Option } = Select;

function Page() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const encryptedOrgId = searchParams.get("orgId");
  const encryptedOrgName = searchParams.get("orgName");
  const ORG_ID = encryptedOrgId ? decrypt(encryptedOrgId) : null;

  // Filter states from query params
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "name-asc");
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1")
  );
  const [pageSize, setPageSize] = useState(
    parseInt(searchParams.get("pageSize") || "12")
  );

  const {
    value: departments,
    loading,
    error,
  } = useSelector((state) => state.adminOrg.departments);

  const departmentsList = departments?.[0]?.departments || [];
  const organizationName = decrypt(encryptedOrgName);

  // Update URL with filters
  const updateUrl = useCallback(
    (newParams) => {
      const params = new URLSearchParams(searchParams.toString());

      if (newParams.search !== undefined) {
        if (newParams.search) {
          params.set("search", newParams.search);
        } else {
          params.delete("search");
        }
      }

      if (newParams.sort !== undefined) {
        params.set("sort", newParams.sort);
      }

      if (newParams.page !== undefined) {
        params.set("page", newParams.page.toString());
      }

      if (newParams.pageSize !== undefined) {
        params.set("pageSize", newParams.pageSize.toString());
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router]
  );

  useEffect(() => {
    if (ORG_ID) {
      dispatch(getAllDepartmentsFromOrgs([ORG_ID]));
    }
  }, [ORG_ID, dispatch]);

  // Filter and sort departments
  const filteredAndSortedDepartments = useMemo(() => {
    let result = [...departmentsList];

    // Search filter
    if (searchQuery) {
      result = result.filter((dept) => {
        const searchLower = searchQuery.toLowerCase();
        return (
          dept.title?.toLowerCase().includes(searchLower) ||
          dept.hodName?.toLowerCase().includes(searchLower) ||
          dept.email?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return (a.title || "").localeCompare(b.title || "");
        case "name-desc":
          return (b.title || "").localeCompare(a.title || "");
        case "students-asc":
          return (a.students?.length || 0) - (b.students?.length || 0);
        case "students-desc":
          return (b.students?.length || 0) - (a.students?.length || 0);
        case "hod-asc":
          return (a.hodName || "").localeCompare(b.hodName || "");
        case "hod-desc":
          return (b.hodName || "").localeCompare(a.hodName || "");
        default:
          return 0;
      }
    });

    return result;
  }, [departmentsList, searchQuery, sortBy]);

  // Pagination calculations
  const totalItems = filteredAndSortedDepartments.length;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedDepartments = filteredAndSortedDepartments.slice(
    startIndex,
    endIndex
  );
  const totalPages = Math.ceil(totalItems / pageSize);

  // Active filters count
  const activeFilterCount =
    (searchQuery ? 1 : 0) + (sortBy !== "name-asc" ? 1 : 0);

  const handleDepartmentClick = (department) => {
    console.log(department);
    router.push(
      `/admin/colleges/departments/students?orgId=${encryptedOrgId}&orgName=${encryptedOrgName}&deptId=${encrypt(
        department?._id
      )}&deptName=${encrypt(department?.title)}`
    );
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setCurrentPage(1);
    updateUrl({ search: value || undefined, page: 1 });
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setCurrentPage(1);
    updateUrl({ sort: value, page: 1 });
  };

  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
    updateUrl({ page, pageSize });
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
    updateUrl({ search: undefined, page: 1 });
  };

  const handleClearSort = () => {
    setSortBy("name-asc");
    setCurrentPage(1);
    updateUrl({ sort: "name-asc", page: 1 });
  };

  const handleClearAll = () => {
    setSearchQuery("");
    setSortBy("name-asc");
    setCurrentPage(1);
    setPageSize(12);
    updateUrl({ search: undefined, sort: "name-asc", page: 1, pageSize: 12 });
  };

  return (
    <div className={styles.pageContainer}>
      <BreadcrumbComponent />

      {loading && (
        <div className={styles.loadingContainer}>
          <Spin size="large" />
        </div>
      )}

      {error && (
        <div className={styles.errorContainer}>
          <p>Error: {error}</p>
        </div>
      )}

      {!loading && !error && departmentsList.length === 0 && (
        <div className={styles.emptyState}>
          <p>No departments found</p>
        </div>
      )}

      {!loading && !error && departmentsList.length > 0 && (
        <>
          <div className={styles.departmentHeader}>
            <div className={styles.headerInfo}>
              <h3>{organizationName}</h3>
              <Space className={styles.controls} size="middle">
                <Search
                  placeholder="Search departments..."
                  onChange={handleSearchChange}
                  value={searchQuery}
                  prefix={<SearchOutlined />}
                  allowClear
                  className={styles.searchInput}
                  styles={{
                    input: {
                      borderRadius: "8px",
                    },
                  }}
                  style={{
                    borderRadius: "8px",
                  }}
                />
                <Select
                  value={sortBy}
                  onChange={handleSortChange}
                  className={styles.sortSelect}
                  style={{
                    borderRadius: "8px",
                  }}
                >
                  <Option value="name-asc">Name (A-Z)</Option>
                  <Option value="name-desc">Name (Z-A)</Option>
                  <Option value="students-desc">Most Students</Option>
                  <Option value="students-asc">Least Students</Option>
                  <Option value="hod-asc">HOD (A-Z)</Option>
                  <Option value="hod-desc">HOD (Z-A)</Option>
                </Select>
              </Space>
            </div>
          </div>
          {/* Active Filters Section */}
          {activeFilterCount > 0 && (
            <div className={styles.activeFilters}>
              <Space size="small" wrap>
                <span style={{ fontWeight: 500 }}>Active Filters:</span>
                {searchQuery && (
                  <Tag closable onClose={handleClearSearch} color="blue">
                    Search: {searchQuery}
                  </Tag>
                )}
                {sortBy !== "name-asc" && (
                  <Tag closable onClose={handleClearSort} color="cyan">
                    Sort:{" "}
                    {sortBy
                      .replace("-", " ")
                      .replace(/^\w/, (c) => c.toUpperCase())}
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
          {paginatedDepartments.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No departments match your search</p>
            </div>
          ) : (
            <>
              <div className={styles.gridContainer}>
                {paginatedDepartments.map((department) => (
                  <div
                    key={department._id}
                    onClick={() => handleDepartmentClick(department)}
                  >
                    <DepartmentCard item={department} />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className={styles.paginationContainer}>
                <Pagination
                  current={currentPage}
                  total={totalItems}
                  pageSize={pageSize}
                  onChange={handlePageChange}
                  showSizeChanger
                  showQuickJumper
                  showTotal={(total, range) =>
                    `${range[0]}-${range[1]} of ${total} departments`
                  }
                  pageSizeOptions={["12", "24", "48", "96"]}
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default Page;
