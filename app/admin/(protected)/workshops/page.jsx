"use client";
import React, { useEffect, useState } from "react";
import internshipLibStyles from "./page.module.scss";
import { EllipsisOutlined } from "@ant-design/icons";
import {
  Dropdown,
  Menu,
  Modal,
  Select,
  Button,
  Tabs,
  Tooltip,
  App,
  Pagination,
  Input,
  Tag,
  Space,
  message,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteInternship,
  getAllCourses,
  getAllWorkshops,
} from "@/redux/slices/admin/cms/internship";
import { assignCourseToOrgs, getAllOrgs } from "@/redux/slices/admin/cms/user";
import { getLstorage, parseIfJson } from "@/utils/windowMW";
import { restUrl, internshipUrl } from "@/config/urls";
import { usePermissions, PERMISSION_VALUES } from "@/hooks/usepermission";

const { TabPane } = Tabs;

const Page = () => {
  const { message } = App.useApp();
  const data = useSelector(
    (state) => state.adminInternship?.allWorkshops?.data
  ) || [];
  const companies = useSelector((state) => state.user?.orgs) || [];
  const cursor = useSelector((state) => state.adminInternship.allWorkshops?.cursor);
  const hasNext = useSelector((state) => state.adminInternship.allWorkshops?.hasNext);

  const nav = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { canAccess, accessAll, getPermissionMessage } = usePermissions();

  // Pagination state from URL query params
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page")) || 1
  );
  const [pageSize, setPageSize] = useState(
    parseInt(searchParams.get("limit")) || 20
  );
  const [totalItems, setTotalItems] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  // Assignment modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [currentCardForAssignment, setCurrentCardForAssignment] =
    useState(null);

  // New states for departments and students
  const [departments, setDepartments] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingAssignedData, setLoadingAssignedData] = useState(false);

  // Search and Filter states
  const [searchText, setSearchText] = useState(
    searchParams.get("search") || ""
  );
  const [filterDifficulty, setFilterDifficulty] = useState(undefined);
  const [filterModules, setFilterModules] = useState(undefined);
  const [sortParam, setSortParam] = useState(
    searchParams.get("sort") || "recent"
  );
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  const showModal = (cardData) => {
    setSelectedCard(cardData);
    setIsModalOpen(true);
  };

  useEffect(() => {
    // Get page and limit from URL on mount
    const pageFromUrl = parseInt(searchParams.get("page")) || 1;
    const limitFromUrl = parseInt(searchParams.get("limit")) || 20;
    const searchFromUrl = searchParams.get("search") || "";
    const sortFromUrl = searchParams.get("sort") || "recent";

    setCurrentPage(pageFromUrl);
    setPageSize(limitFromUrl);
    setSearchText(searchFromUrl);
    setSortParam(sortFromUrl);

    fetchWorkshops(pageFromUrl, limitFromUrl);
    dispatch(getAllOrgs());
  }, []);

  // Search debounce effect
  useEffect(() => {
    const delayTimer = setTimeout(() => {
      if (searchText.length >= 3 || searchText.length === 0) {
        updateURLParams({ search: searchText, page: 1 });
      }
    }, 500);
    return () => clearTimeout(delayTimer);
  }, [searchText]);

  // Function to update URL params
  const updateURLParams = (updates) => {
    const params = new URLSearchParams(window.location.search);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value.toString());
      } else {
        params.delete(key);
      }
    });
    nav.push(`?${params.toString()}`, { scroll: false });
  };

  // Function to fetch workshops with pagination
  const fetchWorkshops = (page, limit) => {
    dispatch(
      getAllWorkshops({
        limit: limit,
        cursor: null, // Adjust based on your API
      })
    );
  };

  // Handle pagination change
  const handlePaginationChange = (page, limit) => {
    setCurrentPage(page);
    setPageSize(limit);
    updateURLParams({ page, limit });
    fetchWorkshops(page, limit);
  };

  // Sort courses
  const sortCourses = (courses, sortType) => {
    const sorted = [...courses];
    switch (sortType) {
      case "nameAsc":
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case "nameDesc":
        return sorted.sort((a, b) => b.title.localeCompare(a.title));
      case "recent":
        return sorted.sort(
          (a, b) =>
            new Date(b.updatedAt || 0).getTime() -
            new Date(a.updatedAt || 0).getTime()
        );
      case "oldest":
        return sorted.sort(
          (a, b) =>
            new Date(a.updatedAt || 0).getTime() -
            new Date(b.updatedAt || 0).getTime()
        );
      case "modulesAsc":
        return sorted.sort(
          (a, b) => (a.sections?.length || 0) - (b.sections?.length || 0)
        );
      case "modulesDesc":
        return sorted.sort(
          (a, b) => (b.sections?.length || 0) - (a.sections?.length || 0)
        );
      default:
        return sorted;
    }
  };

  // Apply filters and search
  const getFilteredAndSortedData = () => {
    let filtered = [...data];

    // Search filter
    if (searchText.length >= 3) {
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(searchText.toLowerCase()) ||
          stripHtml(course.description)
            .toLowerCase()
            .includes(searchText.toLowerCase())
      );
    }

    // Difficulty filter
    if (filterDifficulty) {
      filtered = filtered.filter(
        (course) =>
          course.difficulty?.toLowerCase() === filterDifficulty.toLowerCase()
      );
    }

    // Modules filter
    if (filterModules) {
      filtered = filtered.filter((course) => {
        const moduleCount = course.sections?.length || 0;
        switch (filterModules) {
          case "1-5":
            return moduleCount >= 1 && moduleCount <= 5;
          case "6-10":
            return moduleCount >= 6 && moduleCount <= 10;
          case "11+":
            return moduleCount >= 11;
          default:
            return true;
        }
      });
    }

    // Sort
    return sortCourses(filtered, sortParam);
  };

  const filteredAndSortedData = getFilteredAndSortedData();

  // Handle sort change
  const handleSortChange = (key) => {
    setSortParam(key);
    updateURLParams({ sort: key });
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilterDifficulty(undefined);
    setFilterModules(undefined);
    setSearchText("");
    updateURLParams({ search: "", page: 1 });
  };

  // Get active filter count
  const activeFilterCount = [filterDifficulty, filterModules].filter(
    Boolean
  ).length;

  // Get unique difficulties from data
  const uniqueDifficulties = Array.from(
    new Set(data.map((course) => course.difficulty).filter(Boolean))
  );

  // Function to fetch departments when companies are selected
  const fetchDepartments = async (orgIds, returnData = false) => {
    if (!orgIds.length) {
      if (!returnData) setDepartments([]);
      return [];
    }

    if (!returnData) setLoadingDepartments(true);

    try {
      const response = await fetch(restUrl + "/getAllDepartmentsFromOrgs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getLstorage("jwtToken")}`,
        },
        body: JSON.stringify({ orgIds }),
      });

      const result = await response.json();
      if (response.ok) {
        if (!returnData) setDepartments(result.data);
        return result.data;
      } else {
        if (!returnData) {
          message.error(result.err || "Failed to fetch departments");
          setDepartments([]);
        }
        return [];
      }
    } catch (error) {
      if (!returnData) {
        message.error("Error fetching departments");
        setDepartments([]);
      }
      return [];
    } finally {
      if (!returnData) setLoadingDepartments(false);
    }
  };

  // Function to fetch students when companies and departments are selected
  const fetchStudents = async (
    orgIds,
    departmentSelections,
    departmentsData = null,
    returnData = false
  ) => {
    if (!orgIds.length || !departmentSelections.length) {
      if (!returnData) setStudents([]);
      return [];
    }

    if (!returnData) setLoadingStudents(true);

    try {
      const deptData = departmentsData || departments;

      const filters = orgIds
        .map((orgId) => {
          const orgDepartments = departmentSelections.filter((dept) =>
            deptData
              .find((d) => d.orgId === orgId)
              ?.departments.some((dep) => dep._id === dept)
          );

          return {
            orgId,
            departmentIds: orgDepartments,
          };
        })
        .filter((filter) => filter.departmentIds.length > 0);

      const response = await fetch(restUrl + "/getStudentsFromOrgsDepartments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getLstorage("jwtToken")}`,
        },
        body: JSON.stringify({ filters }),
      });

      const result = await response.json();
      if (response.ok) {
        const allStudents = result.data.flatMap((org) =>
          org.students.map((student) => ({
            ...student,
            sourceOrgId: org.orgId,
            orgName: companies.find((c) => c.orgId === org.orgId)?.orgName,
          }))
        );

        if (!returnData) setStudents(allStudents);
        return allStudents;
      } else {
        if (!returnData) {
          message.error(result.err || "Failed to fetch students");
          setStudents([]);
        }
        return [];
      }
    } catch (error) {
      if (!returnData) {
        message.error("Error fetching students");
        setStudents([]);
      }
      return [];
    } finally {
      if (!returnData) setLoadingStudents(false);
    }
  };

  // Function to fetch previously assigned data
  const fetchAssignedData = async (courseId) => {
    setLoadingAssignedData(true);
    try {
      const response = await fetch(internshipUrl + "/getAssignedCourseData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getLstorage("jwtToken")}`,
        },
        body: JSON.stringify({ courseId }),
      });

      const result = await response.json();
      if (response.ok) {
        const { orgIds, departmentIds, studentIds } = result.data;

        setSelectedCompanies(orgIds);
        setSelectedDepartments(departmentIds);
        setSelectedStudents(studentIds);

        if (orgIds.length > 0) {
          const departmentsData = await fetchDepartments(orgIds, true);
          setDepartments(departmentsData);

          if (departmentIds.length > 0) {
            const studentsData = await fetchStudents(
              orgIds,
              departmentIds,
              departmentsData,
              true
            );
            setStudents(studentsData);
          }
        }
      } else {
        message.error(result.err || "Failed to fetch assigned data");
      }
    } catch (error) {
      console.error("Error fetching assigned data:", error);
      message.error("Error fetching assigned data");
    }
    setLoadingAssignedData(false);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleCardClick = (eachData) => {
    nav.push(`/admin/workshops/${eachData?._id}`);
  };

  const handleAssignToOrg = async (cardData) => {
    setCurrentCardForAssignment(cardData);
    setIsModalVisible(true);

    setSelectedCompanies([]);
    setSelectedDepartments([]);
    setSelectedStudents([]);
    setDepartments([]);
    setStudents([]);

    await fetchAssignedData(cardData._id);
  };

  const handleCompanyChange = async (newSelectedCompanies) => {
    const previousCompanies = selectedCompanies;
    setSelectedCompanies(newSelectedCompanies);

    const addedOrgs = newSelectedCompanies.filter(
      (org) => !previousCompanies.includes(org)
    );
    const removedOrgs = previousCompanies.filter(
      (org) => !newSelectedCompanies.includes(org)
    );

    if (newSelectedCompanies.length === 0) {
      setDepartments([]);
      setSelectedDepartments([]);
      setStudents([]);
      setSelectedStudents([]);
      return;
    }

    const allDepartmentsData = await fetchDepartments(
      newSelectedCompanies,
      true
    );
    setDepartments(allDepartmentsData);

    if (removedOrgs.length > 0) {
      const validDepartments = selectedDepartments.filter((deptId) => {
        return allDepartmentsData.some((org) =>
          org.departments.some((dept) => dept._id === deptId)
        );
      });
      setSelectedDepartments(validDepartments);

      const validStudents = selectedStudents.filter((studentId) => {
        const student = students.find((s) => s._id === studentId);
        if (!student) return false;
        return validDepartments.includes(student.department);
      });
      setSelectedStudents(validStudents);

      if (validDepartments.length > 0) {
        const refreshedStudentsData = await fetchStudents(
          newSelectedCompanies,
          validDepartments,
          allDepartmentsData,
          true
        );
        setStudents(refreshedStudentsData);
      } else {
        setStudents([]);
      }
    }
  };

  function stripHtml(html) {
    return typeof html === "string" ? html.replace(/<[^>]*>/g, "") : "";
  }

  function formatINR(value) {
    if (value === undefined || value === null) return "";
    const num = typeof value === "string" ? Number(value) : value;
    return Number.isNaN(num)
      ? String(value)
      : `₹${num.toLocaleString("en-IN")}`;
  }

  function formatUpdatedDate(dateInput) {
    if (!dateInput) return "";
    const d = new Date(dateInput);
    return isNaN(d.getTime())
      ? ""
      : d.toLocaleString("en-IN", { month: "short", year: "numeric" });
  }

  const handleDepartmentChange = async (newSelectedDepartments) => {
    const previousDepartments = selectedDepartments;
    setSelectedDepartments(newSelectedDepartments);

    if (newSelectedDepartments.length === 0) {
      setStudents([]);
      setSelectedStudents([]);
      return;
    }

    if (selectedCompanies.length > 0) {
      const allStudentsData = await fetchStudents(
        selectedCompanies,
        newSelectedDepartments,
        departments,
        true
      );
      setStudents(allStudentsData);

      if (previousDepartments.length > newSelectedDepartments.length) {
        const validStudents = selectedStudents.filter((studentId) => {
          const student = students.find((s) => s._id === studentId);
          if (!student) return false;
          return newSelectedDepartments.includes(student.department);
        });
        setSelectedStudents(validStudents);
      }
    }
  };

  const handleModalOk = () => {
    const payload = {
      courseId: currentCardForAssignment?._id,
      orgIds: selectedCompanies,
      departmentIds: selectedDepartments,
      studentIds: selectedStudents,
    };

    dispatch(assignCourseToOrgs(payload))?.then(() => {
      message.success("Course assignment updated successfully!");
      setIsModalVisible(false);
      setSelectedCompanies([]);
      setSelectedDepartments([]);
      setSelectedStudents([]);
      setCurrentCardForAssignment(null);
      setDepartments([]);
      setStudents([]);
    });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setSelectedCompanies([]);
    setSelectedDepartments([]);
    setSelectedStudents([]);
    setCurrentCardForAssignment(null);
    setDepartments([]);
    setStudents([]);
  };

  const getMenuItems = (cardData) => [
    {
      key: "assign",
      label: "Assign to Organization",
      onClick: () => {
        if (!accessAll(PERMISSION_VALUES.MANAGE_USERS)) {
          message.info(getPermissionMessage(PERMISSION_VALUES.MANAGE_USERS));
          return;
        }
        handleAssignToOrg(cardData);
      },
    },
    {
      key: "edit",
      label: "Edit Workshop",
      onClick: () => {
        if (!canAccess(PERMISSION_VALUES.EDIT)) {
          message.info(getPermissionMessage(PERMISSION_VALUES.EDIT));
          return;
        }
        handleCardClick(cardData);
      },
    },
    {
      key: "delete",
      label: "Delete Workshop",
      onClick: () => {
        if (!canAccess(PERMISSION_VALUES.EDIT)) {
          message.info(getPermissionMessage(PERMISSION_VALUES.EDIT));
          return;
        }
        // handleCardClick(cardData);
        dispatch(deleteInternship({ id: cardData?._id, type: "workshop" }));
      },
    },
  ];

  const sortLabels = {
    nameAsc: "Name (A-Z)",
    nameDesc: "Name (Z-A)",
    recent: "Recently Updated",
    oldest: "Oldest First",
    modulesAsc: "Modules (Low to High)",
    modulesDesc: "Modules (High to Low)",
  };

  const sortItems = [
    {
      key: "nameAsc",
      label: "Name (A-Z)",
      onClick: () => handleSortChange("nameAsc"),
    },
    {
      key: "nameDesc",
      label: "Name (Z-A)",
      onClick: () => handleSortChange("nameDesc"),
    },
    {
      key: "recent",
      label: "Recently Updated",
      onClick: () => handleSortChange("recent"),
    },
    {
      key: "oldest",
      label: "Oldest First",
      onClick: () => handleSortChange("oldest"),
    },
    {
      key: "modulesAsc",
      label: "Modules (Low to High)",
      onClick: () => handleSortChange("modulesAsc"),
    },
    {
      key: "modulesDesc",
      label: "Modules (High to Low)",
      onClick: () => handleSortChange("modulesDesc"),
    },
  ];

  // Filter dropdown content
  const filterDropdownContent = (
    <div style={{ padding: "16px", width: "320px", backgroundColor: "#fff" }}>
      <Space orientation="vertical" style={{ width: "100%" }} size="middle">
        <div>
          <label
            style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}
          >
            Difficulty Level
          </label>
          <Select
            placeholder="Select difficulty"
            style={{ width: "100%" }}
            value={filterDifficulty}
            onChange={setFilterDifficulty}
            allowClear
          >
            {uniqueDifficulties.map((difficulty) => (
              <Select.Option key={difficulty} value={difficulty}>
                {difficulty}
              </Select.Option>
            ))}
          </Select>
        </div>

        <div>
          <label
            style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}
          >
            Number of Modules
          </label>
          <Select
            placeholder="Select module range"
            style={{ width: "100%" }}
            value={filterModules}
            onChange={setFilterModules}
            allowClear
          >
            <Select.Option value="1-5">1-5 Modules</Select.Option>
            <Select.Option value="6-10">6-10 Modules</Select.Option>
            <Select.Option value="11+">11+ Modules</Select.Option>
          </Select>
        </div>

        {activeFilterCount > 0 && (
          <Button block icon={<ClearOutlined />} onClick={handleClearFilters}>
            Clear All Filters
          </Button>
        )}
      </Space>
    </div>
  );

  return (
    <div className={internshipLibStyles.container}>
      <div className={internshipLibStyles.titleContainer}>
        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
            flexWrap: "wrap",
            marginBottom: "20px",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div className={internshipLibStyles.title}>Workshop Library</div>
          <Tooltip
            title={
              !canAccess(PERMISSION_VALUES.CREATE)
                ? getPermissionMessage(PERMISSION_VALUES.CREATE)
                : ""
            }
          >
            <>
              <Button
                type="primary"
                onClick={() => nav.push("/admin/workshops/newWorkshops")}
                disabled={!canAccess(PERMISSION_VALUES.CREATE)}
              >
                + Create Workshop
              </Button>
            </>
          </Tooltip>
          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
              flexWrap: "wrap",
              width: "100%",
            }}
          >
            <Input
              placeholder="Search workshops... (min 3 characters)"
              prefix={<SearchOutlined />}
              style={{ maxWidth: "400px", flex: 1 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
            <Dropdown
              popupRender={() => filterDropdownContent}
              trigger={["click"]}
              open={isFilterDropdownOpen}
              onOpenChange={setIsFilterDropdownOpen}
            >
              <Button icon={<FilterOutlined />}>
                Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </Button>
            </Dropdown>
            <Dropdown
              menu={{ items: sortItems, selectedKeys: [sortParam] }}
              trigger={["click"]}
            >
              <Button icon={<SortAscendingOutlined />}>
                {sortLabels[sortParam]}
              </Button>
            </Dropdown>
          </div>
        </div>

        {/* Search and Filter Controls */}
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px 16px",
            background: "#f5f5f5",
            borderRadius: "8px",
          }}
        >
          <Space size="small" wrap>
            <span style={{ fontWeight: 500 }}>Active Filters:</span>
            {filterDifficulty && (
              <Tag
                closable
                onClose={() => setFilterDifficulty(undefined)}
                color="blue"
              >
                Difficulty: {filterDifficulty}
              </Tag>
            )}
            {filterModules && (
              <Tag
                closable
                onClose={() => setFilterModules(undefined)}
                color="cyan"
              >
                Modules: {filterModules}
              </Tag>
            )}
            <Button
              type="link"
              size="small"
              onClick={handleClearFilters}
              style={{ padding: 0 }}
            >
              Clear All
            </Button>
          </Space>
        </div>
      )}

      {/* Results Count */}
      {searchText.length >= 3 && (
        <div style={{ marginBottom: "16px", color: "#666" }}>
          Found {filteredAndSortedData.length} result
          {filteredAndSortedData.length !== 1 ? "s" : ""} for "{searchText}"
        </div>
      )}

      <div className={internshipLibStyles.con}>
        <div className={internshipLibStyles.cardsContainer}>
          {filteredAndSortedData?.map((eachData) => {
            return (
              <div
                key={eachData?._id}
                className={internshipLibStyles.card}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    handleCardClick(eachData);
                }}
              >
                <div className={internshipLibStyles.thumbWrapper}>
                  <img
                    className={internshipLibStyles.thumb}
                    src={
                      eachData?.media?.coverImage || eachData?.coverImage || ""
                    }
                    alt={eachData?.title || "Workshop cover"}
                    loading="lazy"
                  />
                  {eachData?.difficulty ? (
                    <span className={internshipLibStyles.badge}>
                      {eachData?.difficulty}
                    </span>
                  ) : null}
                </div>

                <div className={internshipLibStyles.content}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div className={internshipLibStyles.title}>
                      {eachData?.title}
                    </div>
                    <div
                      className={internshipLibStyles.menu}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <Dropdown
                        menu={{ items: getMenuItems?.(eachData) || [] }}
                        trigger={["click"]}
                      >
                        <Button
                          type="text"
                          size="small"
                          aria-label="More options"
                        >
                          <EllipsisOutlined />
                        </Button>
                      </Dropdown>
                    </div>
                  </div>

                  <div className={internshipLibStyles.metaRow}>
                    {eachData?.type && (
                      <span
                        className={internshipLibStyles.chip}
                        style={{
                          backgroundColor: "#e6f7ff",
                          color: "#1890ff",
                          borderColor: "#91d5ff",
                          textTransform: "capitalize",
                        }}
                      >
                        {eachData.type}
                      </span>
                    )}
                    {eachData?.duration && (
                      <span className={internshipLibStyles.chip}>
                        ⏱ {eachData.duration}
                      </span>
                    )}
                    {eachData?.sections?.length ? (
                      <span className={internshipLibStyles.chip}>
                        {eachData?.sections?.length} Modules
                      </span>
                    ) : null}
                  </div>

                  <div style={{ marginBottom: "8px" }}>
                    {eachData?.pricing?.currentPrice || eachData?.price ? (
                      <Space size="small">
                        <span style={{ fontSize: "16px", fontWeight: "600", color: "#24A058" }}>
                          {formatINR(eachData?.pricing?.currentPrice || eachData?.price)}
                        </span>
                        {eachData?.pricing?.originalPrice && (
                          <span style={{ textDecoration: "line-through", color: "#999", fontSize: "12px" }}>
                            {formatINR(eachData?.pricing?.originalPrice)}
                          </span>
                        )}
                        {eachData?.pricing?.couponDiscount > 0 && (
                          <Tag color="green" style={{ margin: 0 }}>
                            -{formatINR(eachData?.pricing?.couponDiscount)} Off
                          </Tag>
                        )}
                      </Space>
                    ) : (
                      <span style={{ color: "#999", fontSize: "14px" }}>Free / No Price</span>
                    )}
                  </div>

                  <p
                    className={internshipLibStyles.description}
                    title={stripHtml?.(eachData?.description) || ""}
                  >
                    {(() => {
                      const t = stripHtml?.(eachData?.description) || "";
                      return t.slice(0, 120) + (t.length > 120 ? "…" : "");
                    })()}
                  </p>

                  <div className={internshipLibStyles.footer}>
                    {eachData?.lastAssignmentUpdate || eachData?.updatedAt ? (
                      <div
                        className={internshipLibStyles.updated}
                        aria-label="Last updated"
                      >
                        Updated{" "}
                        {formatUpdatedDate?.(
                          eachData?.lastAssignmentUpdate || eachData?.updatedAt
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredAndSortedData.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              color: "#666",
            }}
          >
            <p>
              {searchText.length > 0 && searchText.length < 3
                ? "Type at least 3 characters to search"
                : activeFilterCount > 0
                  ? "No courses found matching your filters."
                  : "No courses found."}
            </p>
          </div>
        )}

        <div className={internshipLibStyles.pagination}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={
              hasNext
                ? currentPage * pageSize + pageSize
                : filteredAndSortedData.length
            }
            onChange={handlePaginationChange}
            onShowSizeChange={handlePaginationChange}
            showSizeChanger
            showQuickJumper
            pageSizeOptions={["10", "20", "50", "100"]}
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} of ${total} items`
            }
          />
        </div>
      </div>

      {/* Enhanced Assignment Modal */}
      <Modal
        title={
          <div
            style={{
              fontSize: "1.2rem",
              fontWeight: "600",
              color: "#24A058",
              marginBottom: "1rem",
            }}
          >
            Assign "{currentCardForAssignment?.title}" to:
            {loadingAssignedData && (
              <span
                style={{
                  fontSize: "0.8rem",
                  color: "#666",
                  marginLeft: "10px",
                }}
              >
                (Loading previous assignments...)
              </span>
            )}
          </div>
        }
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={800}
        okText="Update Assignment"
        cancelText="Cancel"
        destroyOnHidden={true}
        mask={{ closable: false }}
        okButtonProps={{
          disabled: selectedCompanies.length === 0 || loadingAssignedData,
        }}
      >
        <div style={{ marginTop: "1rem" }}>
          {/* Organization Selection */}
          <div style={{ marginBottom: 16 }}>
            <label
              style={{ fontWeight: 500, marginBottom: 8, display: "block" }}
            >
              Select Organizations:
            </label>
            <Select
              mode="multiple"
              style={{ width: "100%" }}
              placeholder="Search and select organizations"
              value={selectedCompanies}
              onChange={handleCompanyChange}
              showSearch
              loading={loadingAssignedData}
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
              maxTagCount="responsive"
            >
              {companies?.map((company) => (
                <Select.Option key={company.orgId} value={company.orgId}>
                  {company?.orgName}
                </Select.Option>
              ))}
            </Select>
          </div>

          {/* Department Selection */}
          {selectedCompanies.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <label
                style={{ fontWeight: 500, marginBottom: 8, display: "block" }}
              >
                Select Departments{" "}
                <span style={{ opacity: "0.6" }}>( optional )</span>:
              </label>
              <Select
                mode="multiple"
                style={{ width: "100%" }}
                placeholder="Select departments"
                value={selectedDepartments}
                onChange={handleDepartmentChange}
                loading={loadingDepartments}
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
                maxTagCount="responsive"
              >
                {departments?.map((org) =>
                  org.departments?.map((dept) => (
                    <Select.Option key={dept._id} value={dept._id}>
                      {dept.title} - (
                      {companies.find((c) => c.orgId === org.orgId)?.orgName})
                    </Select.Option>
                  ))
                )}
              </Select>
            </div>
          )}

          {/* Student Selection */}
          {selectedDepartments.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  fontWeight: 500,
                  marginBottom: 8,
                  display: "block",
                }}
              >
                Select Students{" "}
                <span style={{ opacity: "0.6" }}>( optional )</span>:
              </label>
              <Select
                mode="multiple"
                style={{ width: "100%" }}
                placeholder="Select students"
                value={selectedStudents}
                onChange={setSelectedStudents}
                loading={loadingStudents}
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
                maxTagCount="responsive"
              >
                {students?.map((student) => (
                  <Select.Option key={student._id} value={student._id}>
                    {student.userName} (
                    {
                      departments
                        ?.find((e) =>
                          e.departments?.some(
                            (dept) => dept?._id === student?.department
                          )
                        )
                        ?.departments?.find(
                          (dept) => dept?._id === student?.department
                        )?.title
                    }{" "}
                    -{" "}
                    {
                      companies.find(
                        (c) =>
                          c.orgId ===
                          departments?.find((f) =>
                            f.departments?.some(
                              (dept) => dept?._id === student?.department
                            )
                          )?.orgId
                      )?.orgName
                    }
                    )
                  </Select.Option>
                ))}
              </Select>
            </div>
          )}

          {/* Selection Summary */}
          {(selectedCompanies.length > 0 ||
            selectedDepartments.length > 0 ||
            selectedStudents.length > 0) && (
              <div
                style={{
                  marginTop: 16,
                  padding: 12,
                  backgroundColor: "#f6f6f6",
                  borderRadius: 6,
                }}
              >
                <strong>Selection Summary:</strong>
                <div style={{ marginTop: 8, fontSize: "14px" }}>
                  <div>Organizations: {selectedCompanies.length}</div>
                  <div>Departments: {selectedDepartments.length}</div>
                  <div>Students: {selectedStudents.length}</div>
                </div>
              </div>
            )}
        </div>
      </Modal>
    </div>
  );
};

export default Page;
