"use client";
import React, { useState, useEffect } from "react";
import {
  Button,
  Dropdown,
  Pagination,
  Input,
  Modal,
  Form,
  Tooltip,
  App,
  Select,
  Tag,
  Space,
  Badge,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  PlusOutlined,
  MailOutlined,
  CalendarOutlined,
  EditOutlined,
  EnvironmentOutlined,
  ClearOutlined,
  TeamOutlined,
  BankOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import styles from "./College.module.scss";
import {
  fetchStatesWithDistricts,
  getAllOrgs,
  registerOrg,
  updateOrganization,
  deleteOrginasition,
} from "@/redux/slices/admin/adminOrgSlice";
import { useDispatch, useSelector } from "react-redux";
import SkeletonCard from "@/modules/admin/components/SkeletonCard";
import { encrypt } from "@/utils/windowMW";
import { usePermissions, PERMISSION_VALUES } from "@/hooks/usepermission";

const { Option } = Select;

export default function College() {
  const { message } = App.useApp();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { replace, push } = useRouter();
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteModalData, setDeleteModalData] = useState(null);
  const { status, data } = useSelector((s) => s.adminOrg.deleteOrg);
  const { value: Orgs, loading } = useSelector((s) => s.adminOrg.orgs);
  const { value: states } = useSelector((s) => s.adminOrg.states);
  const { canAccess, getPermissionMessage, PERMISSION_VALUES } =
    usePermissions();

  // Permission checks
  const canCreate = canAccess(PERMISSION_VALUES.CREATE);
  const canEdit = canAccess(PERMISSION_VALUES.EDIT);

  const searchQuery = searchParams.get("search") || "";
  const currentPage = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 8;
  const sortParam = searchParams.get("sort") || "nameAsc";

  const [searchText, setSearchText] = useState(searchQuery);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedState, setSelectedState] = useState(undefined);
  const [selectedDistrict, setSelectedDistrict] = useState(undefined);
  const [editingCollege, setEditingCollege] = useState(null);

  // Filter states
  const [filterState, setFilterState] = useState(undefined);
  const [filterDistrict, setFilterDistrict] = useState(undefined);
  const [filterCity, setFilterCity] = useState(undefined);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  const [form] = Form.useForm();

  useEffect(() => {
    setSearchText(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    dispatch(getAllOrgs({ type: "college" }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchStatesWithDistricts());
  }, [dispatch]);

  useEffect(() => {
    const delayTimer = setTimeout(() => {
      if (searchText.length >= 3 || searchText.length === 0) {
        const params = new URLSearchParams(searchParams);
        if (searchText.trim()) {
          params.set("search", searchText.trim());
        } else {
          params.delete("search");
        }
        params.set("page", "1");
        replace(`${pathname}?${params.toString()}`);
      }
    }, 500);
    return () => clearTimeout(delayTimer);
  }, [searchText]);

  const sortColleges = (colleges, sortType) => {
    const sorted = [...colleges];
    switch (sortType) {
      case "nameAsc":
        return sorted.sort((a, b) => a.orgName.localeCompare(b.orgName));
      case "nameDesc":
        return sorted.sort((a, b) => b.orgName.localeCompare(a.orgName));
      case "recent":
        return sorted.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      case "oldest":
        return sorted.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      default:
        return sorted;
    }
  };

  // Apply filters
  const filteredColleges = Array.isArray(Orgs)
    ? Orgs.filter((college) => {
        // Search filter
        const matchesSearch = college.orgName
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

        // State filter
        const matchesState = filterState ? college.state === filterState : true;

        // District filter
        const matchesDistrict = filterDistrict
          ? college.district === filterDistrict
          : true;

        // City filter
        const matchesCity = filterCity
          ? college.city?.toLowerCase().includes(filterCity.toLowerCase())
          : true;

        return matchesSearch && matchesState && matchesDistrict && matchesCity;
      })
    : [];

  const sortedColleges = sortColleges(filteredColleges, sortParam);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedColleges = sortedColleges.slice(startIndex, endIndex);

  const handlePageChange = (page, newPageSize) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    if (newPageSize !== pageSize) {
      params.set("pageSize", newPageSize.toString());
      params.set("page", "1");
    }
    replace(`${pathname}?${params.toString()}`);
  };

  const handlePageSizeChange = (current, size) => {
    const params = new URLSearchParams(searchParams);
    params.set("pageSize", size.toString());
    params.set("page", "1");
    replace(`${pathname}?${params.toString()}`);
  };

  const handleSortChange = (key) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort", key);
    params.set("page", "1");
    replace(`${pathname}?${params.toString()}`);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilterState(undefined);
    setFilterDistrict(undefined);
    setFilterCity(undefined);
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    replace(`${pathname}?${params.toString()}`);
  };

  // Get active filter count
  const activeFilterCount = [filterState, filterDistrict, filterCity].filter(
    Boolean
  ).length;

  // Get unique cities from colleges
  const allCities = Array.from(
    new Set(
      Orgs?.filter((c) => c.city)
        .map((c) => c.city)
        .sort()
    )
  );

  // Get districts based on selected state
  const allStates = Array.isArray(states) ? states : [];
  const districtsOfSelectedState =
    allStates.find((s) => s.state === selectedState)?.districts || [];

  const filterDistrictsOfSelectedState = filterState
    ? allStates.find((s) => s.state === filterState)?.districts || []
    : [];

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const payload = {
        email: values.email,
        orgName: values.orgName,
        state: values.state,
        district: values.district,
        city: values.city,
        type: "college",
      };

      if (editingCollege) {
        await dispatch(
          updateOrganization({
            orgId: editingCollege.orgId,
            updateData: payload,
            type: "college",
          })
        ).unwrap();
        message.success("College updated successfully!");
      } else {
        await dispatch(registerOrg(payload)).unwrap();
        message.success("College added successfully!");
      }

      form.resetFields();
      setIsModalVisible(false);
      setEditingCollege(null);
      setSelectedState(undefined);
      setSelectedDistrict(undefined);
      dispatch(getAllOrgs({ type: "college" }));
    } catch (error) {
      if (error.errorFields) {
        message.error("Please fill all required fields correctly");
      } else {
        message.error(error.message || "Failed to add/update college");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleModalCancel = () => {
    if (!submitting) {
      form.resetFields();
      setIsModalVisible(false);
      setEditingCollege(null);
      setSelectedState(undefined);
      setSelectedDistrict(undefined);
    }
  };

  const sortLabels = {
    nameAsc: "Name (A-Z)",
    nameDesc: "Name (Z-A)",
    recent: "Recently Added",
    oldest: "Oldest First",
  };

  // Filter dropdown content
  const filterDropdownContent = (
    <div style={{ padding: "16px", width: "320px", backgroundColor: "#fff" }}>
      <Space orientation="vertical" style={{ width: "100%" }} size="middle">
        <div>
          <label
            style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}
          >
            State
          </label>
          <Select
            showSearch
            placeholder="Select state"
            style={{ width: "100%" }}
            value={filterState}
            onChange={(value) => {
              setFilterState(value);
              setFilterDistrict(undefined);
              const params = new URLSearchParams(searchParams);
              params.set("page", "1");
              replace(`${pathname}?${params.toString()}`);
            }}
            allowClear
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.children ?? "")
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {allStates.map((s) => (
              <Option key={s.state} value={s.state}>
                {s.state}
              </Option>
            ))}
          </Select>
        </div>

        <div>
          <label
            style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}
          >
            District
          </label>
          <Select
            showSearch
            placeholder="Select district"
            style={{ width: "100%" }}
            value={filterDistrict}
            onChange={(value) => {
              setFilterDistrict(value);
              const params = new URLSearchParams(searchParams);
              params.set("page", "1");
              replace(`${pathname}?${params.toString()}`);
            }}
            allowClear
            disabled={!filterState}
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.children ?? "")
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {filterDistrictsOfSelectedState.map((d) => (
              <Option key={d} value={d}>
                {d}
              </Option>
            ))}
          </Select>
        </div>

        <div>
          <label
            style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}
          >
            City
          </label>
          <Select
            showSearch
            placeholder="Search or type city"
            style={{ width: "100%" }}
            value={filterCity}
            onChange={(value) => {
              setFilterCity(value);
              const params = new URLSearchParams(searchParams);
              params.set("page", "1");
              replace(`${pathname}?${params.toString()}`);
            }}
            allowClear
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.children ?? "")
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {allCities.map((city) => (
              <Option key={city} value={city}>
                {city}
              </Option>
            ))}
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
      label: "Recently Added",
      onClick: () => handleSortChange("recent"),
    },
    {
      key: "oldest",
      label: "Oldest First",
      onClick: () => handleSortChange("oldest"),
    },
  ];

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className={styles.collegePage}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>All Colleges</h1>
          <Tooltip
            title={
              !canCreate ? getPermissionMessage(PERMISSION_VALUES.CREATE) : ""
            }
          >
            <span>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="middle"
                onClick={() => {
                  setEditingCollege(null);
                  form.resetFields();
                  setSelectedState(undefined);
                  setSelectedDistrict(undefined);
                  setIsModalVisible(true);
                }}
                disabled={!canCreate}
              >
                Add Colleges
              </Button>
            </span>
          </Tooltip>
        </div>
        <div className={styles.controls}>
          <Input
            placeholder="Search colleges... (min 3 characters)"
            prefix={<SearchOutlined />}
            size="middle"
            className={styles.searchInput}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
          <div className={styles.controlButtons}>
            <Dropdown
              popupRender={() => filterDropdownContent}
              trigger={["click"]}
              open={isFilterDropdownOpen}
              onOpenChange={setIsFilterDropdownOpen}
            >
              <Button icon={<FilterOutlined />} size="middle">
                Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </Button>
            </Dropdown>
            <Dropdown
              menu={{ items: sortItems, selectedKeys: [sortParam] }}
              trigger={["click"]}
            >
              <Button icon={<SortAscendingOutlined />} size="middle">
                {sortLabels[sortParam]}
              </Button>
            </Dropdown>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className={styles.activeFilters}>
          <Space size="small" wrap>
            <span style={{ fontWeight: 500 }}>Active Filters:</span>
            {filterState && (
              <Tag
                closable
                onClose={() => {
                  setFilterState(undefined);
                  setFilterDistrict(undefined);
                }}
                color="blue"
              >
                State: {filterState}
              </Tag>
            )}
            {filterDistrict && (
              <Tag
                closable
                onClose={() => setFilterDistrict(undefined)}
                color="cyan"
              >
                District: {filterDistrict}
              </Tag>
            )}
            {filterCity && (
              <Tag
                closable
                onClose={() => setFilterCity(undefined)}
                color="green"
              >
                City: {filterCity}
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

      {searchQuery && (
        <div className={styles.resultsCount}>
          Found {filteredColleges.length} result
          {filteredColleges.length !== 1 ? "s" : ""} for "{searchQuery}"
        </div>
      )}

      <div className={styles.collegeGrid}>
        {loading ? (
          Array.from({ length: pageSize }).map((_, index) => (
            <SkeletonCard key={index} />
          ))
        ) : paginatedColleges.length > 0 ? (
          paginatedColleges.map((college) => (
            <div key={college._id} className={styles.collegeCard}>
              <div className={styles.cardHeader}>
                <div className={styles.collegeInitial}>
                  {college.orgName.charAt(0).toUpperCase()}
                </div>
                <div style={{ display: "flex" }}>
                  <Tooltip
                    title={
                      !canEdit
                        ? getPermissionMessage(PERMISSION_VALUES.EDIT)
                        : ""
                    }
                  >
                    <Button
                      type="text"
                      size="large"
                      icon={<EditOutlined />}
                      className={styles.cardOptions}
                      onClick={() => {
                        if (!canEdit) {
                          message.info(
                            getPermissionMessage(PERMISSION_VALUES.EDIT)
                          );
                          return;
                        }
                        setEditingCollege(college);
                        form.setFieldsValue({
                          orgName: college.orgName,
                          email: college.email,
                          state: college.state || undefined,
                          district: college.district || undefined,
                          city: college.city || "",
                        });
                        setSelectedState(college.state || undefined);
                        setSelectedDistrict(college.district || undefined);
                        setIsModalVisible(true);
                      }}
                      disabled={!canEdit}
                    />
                  </Tooltip>

                  <Tooltip
                    title={
                      !canEdit
                        ? getPermissionMessage(PERMISSION_VALUES.DELETE)
                        : ""
                    }
                  >
                    <Button
                      type="text"
                      size="large"
                      icon={<DeleteOutlined />}
                      className={styles.cardOptions}
                      onClick={() => {
                        if (!canEdit) {
                          message.info(
                            getPermissionMessage(PERMISSION_VALUES.DELETE)
                          );
                          return;
                        }
                        setDeleteModalData(college);
                        setDeleteModal(true);
                      }}
                      disabled={!canEdit}
                    />
                  </Tooltip>
                </div>
              </div>
              <div className={styles.cardContent}>
                <Tooltip
                  title={college.orgName}
                  trigger="hover"
                  placement="bottomRight"
                  color="#24A058"
                >
                  <h3
                    className={styles.collegeName}
                    onClick={() => {
                      push(`/admin/organisationDetails/${college?.orgId}`);
                    }}
                  >
                    {college.orgName}
                  </h3>
                </Tooltip>
                <div className={styles.collegeId}>ID: {college.orgId}</div>

                {/* Stats Badges */}
                <div className={styles.statsContainer}>
                  <Tooltip title="Total TPOs">
                    <div className={styles.statBadge}>
                      <TeamOutlined className={styles.statIcon} />
                      <span className={styles.statCount}>
                        {college.tpoCount || 0}
                      </span>
                      <span className={styles.statLabel}>TPOs</span>
                    </div>
                  </Tooltip>
                  <Tooltip title="Total Departments">
                    <div className={styles.statBadge}>
                      <BankOutlined className={styles.statIcon} />
                      <span className={styles.statCount}>
                        {college.departmentCount || 0}
                      </span>
                      <span className={styles.statLabel}>Depts</span>
                    </div>
                  </Tooltip>
                </div>

                <div className={styles.locationInfo}>
                  <EnvironmentOutlined className={styles.locationIcon} />
                  <span className={styles.locationText}>
                    {[college.city, college.district, college.state]
                      .filter(Boolean)
                      .join(", ") || "N/A"}
                  </span>
                </div>

                <div className={styles.contactInfo}>
                  <div className={styles.infoItem}>
                    <MailOutlined />
                    <span>{college.email || "N/A"}</span>
                  </div>

                  <div className={styles.infoItem}>
                    <CalendarOutlined />
                    <span>{formatDate(college.createdAt) || ""}</span>
                  </div>
                </div>
              </div>
              <div className={styles.buttonCont}>
                <Button
                  type="default"
                  onClick={() =>
                    push(
                      `/admin/colleges/tpo?orgId=${encrypt(
                        college?.orgId
                      )}&orgName=${encrypt(college?.orgName)}`
                    )
                  }
                >
                  TPO ({college.tpoCount || 0})
                </Button>
                <Button
                  type="default"
                  onClick={() =>
                    push(
                      `/admin/colleges/departments?orgId=${encrypt(
                        college?.orgId
                      )}&orgName=${encrypt(college?.orgName)}`
                    )
                  }
                >
                  Departments ({college.departmentCount || 0})
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.noResults}>
            <p>
              {searchText.length > 0 && searchText.length < 3
                ? "Type at least 3 characters to search"
                : activeFilterCount > 0
                ? "No colleges found matching your filters."
                : "No colleges found matching your search."}
            </p>
          </div>
        )}
      </div>

      {!loading && filteredColleges.length > 0 && (
        <div className={styles.pagination}>
          <Pagination
            current={currentPage}
            total={sortedColleges.length}
            pageSize={pageSize}
            onChange={handlePageChange}
            showSizeChanger={true}
            onShowSizeChange={handlePageSizeChange}
            pageSizeOptions={[8, 16, 24, 32, 48]}
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} of ${total} colleges`
            }
          />
        </div>
      )}

      <Modal
        title={editingCollege ? "Edit College" : "Add New College"}
        open={isModalVisible}
        onOk={handleModalSubmit}
        onCancel={handleModalCancel}
        confirmLoading={submitting}
        mask={{ closable: false }}
        keyboard={!submitting}
        closable={!submitting}
        okText={editingCollege ? "Update College" : "Add College"}
        cancelText="Cancel"
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          name="addCollege"
          autoComplete="off"
        >
          <Form.Item
            label="College Name"
            name="orgName"
            rules={[
              { required: true, message: "Please enter College name" },
              { min: 6, message: "Name must be at least 6 characters" },
              { max: 100, message: "Name must not exceed 100 characters" },
              {
                pattern: /^[a-zA-Z0-9\s]+$/,
                message: "Only letters, numbers and spaces allowed",
              },
            ]}
          >
            <Input placeholder="Enter College name" disabled={submitting} />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please enter email address" },
              { type: "email", message: "Please enter a valid email address" },
            ]}
          >
            <Input placeholder="Enter email address" disabled={submitting} />
          </Form.Item>

          <Form.Item
            label="State"
            name="state"
            rules={[{ required: true, message: "Please select a state" }]}
          >
            <Select
              showSearch
              placeholder="Select state"
              optionFilterProp="children"
              disabled={submitting}
              filterOption={(input, option) =>
                (option?.children ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              onChange={(value) => {
                setSelectedState(value);
                form.setFieldsValue({ district: undefined });
                setSelectedDistrict(undefined);
              }}
              value={selectedState}
            >
              {allStates.map((s) => (
                <Option key={s.state} value={s.state}>
                  {s.state}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="District"
            name="district"
            rules={[{ required: true, message: "Please select a district" }]}
          >
            <Select
              showSearch
              placeholder="Select district"
              optionFilterProp="children"
              disabled={submitting || !selectedState}
              filterOption={(input, option) =>
                (option?.children ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              onChange={(value) => setSelectedDistrict(value)}
              value={selectedDistrict}
            >
              {districtsOfSelectedState.map((d) => (
                <Option key={d} value={d}>
                  {d}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="City"
            name="city"
            rules={[{ required: true, message: "Please enter city name" }]}
          >
            <Input placeholder="Enter city name" disabled={submitting} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={"Delete College"}
        open={deleteModal}
        onOk={() => {
          dispatch(
            deleteOrginasition({
              orgId: deleteModalData?.orgId,
              type: "college",
            })
          ).then((r) => {
            setDeleteModal(false);
          });
        }}
        onCancel={() => setDeleteModal(false)}
        confirmLoading={status == "pending"}
        mask={{ closable: false }}
        // keyboard={!submitting}
        // closable={!submitting}
        okText={"Delete College"}
        cancelText="Cancel"
        width={500}
      >
        <h4>Are you sure you want to delete this college</h4>
      </Modal>
    </div>
  );
}
