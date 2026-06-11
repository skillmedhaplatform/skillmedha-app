"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { decrypt } from "@/utils/windowMW";
import BreadcrumbComponent from "@/modules/admin/components/breadcrumbs/breadcrumbs";
import {
  CreateOrgUser,
  getUsersByOrg,
  resetUsers,
} from "@/redux/slices/admin/adminOrgSlice";
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
  Card,
  Avatar,
  Tooltip,
  Modal,
  Form,
  App,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  PlusOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import styles from "./users.module.scss";
import { usePermissions, PERMISSION_VALUES } from "@/hooks/usepermission";

const { Option } = Select;

function Page() {
  const { message, notification } = App.useApp();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { canAccess, getPermissionMessage, PERMISSION_VALUES } =
    usePermissions();

  // Permission check
  const canCreate = canAccess(PERMISSION_VALUES.CREATE);

  const encryptedOrgId = searchParams.get("orgId");
  const encryptedOrgName = searchParams.get("orgName");
  const ORG_ID = encryptedOrgId ? decrypt(encryptedOrgId) : null;
  const ORG_NAME = encryptedOrgName ? decrypt(encryptedOrgName) : "";

  const {
    value: users,
    loading,
    pagination,
  } = useSelector((state) => state.adminOrg.users);

  // Filter states - sync with URL
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Sync states with URL params
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlType = searchParams.get("type") || "all";
    const urlSort = searchParams.get("sort") || "date-desc";
    const urlPage = parseInt(searchParams.get("page") || "1", 10);
    const urlLimit = parseInt(searchParams.get("limit") || "10", 10);

    setSearchQuery(urlSearch);
    setTypeFilter(urlType);
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

  // Fetch users ONLY for pagination (server-side)
  useEffect(() => {
    if (ORG_ID) {
      dispatch(
        getUsersByOrg({
          orgId: ORG_ID,
          page: currentPage,
          limit: itemsPerPage,
        })
      );
    }
  }, [ORG_ID, currentPage, itemsPerPage, dispatch]);

  // Get unique user types for filter
  const userTypes = useMemo(() => {
    if (!users || users.length === 0) return [];
    const types = [...new Set(users.map((user) => user.type).filter(Boolean))];
    return types.sort();
  }, [users]);

  // CLIENT-SIDE Filter and Sort (only current page)
  const filteredAndSortedUsers = useMemo(() => {
    if (!users || users.length === 0) return [];

    let result = [...users];

    // Search filter (client-side)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((user) => {
        return (
          user.email?.toLowerCase().includes(query) ||
          user.userName?.toLowerCase().includes(query) ||
          user.name?.toLowerCase().includes(query) ||
          user.phone?.toLowerCase().includes(query)
        );
      });
    }

    // Type filter (client-side)
    if (typeFilter !== "all") {
      result = result.filter((user) => user.type === typeFilter);
    }

    // Sorting (client-side)
    switch (sortBy) {
      case "date-desc":
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "date-asc":
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "name-asc":
        result.sort((a, b) =>
          (a.userName || a.name || "").localeCompare(b.userName || b.name || "")
        );
        break;
      case "name-desc":
        result.sort((a, b) =>
          (b.userName || b.name || "").localeCompare(a.userName || a.name || "")
        );
        break;
      case "email-asc":
        result.sort((a, b) => (a.email || "").localeCompare(b.email || ""));
        break;
      case "email-desc":
        result.sort((a, b) => (b.email || "").localeCompare(a.email || ""));
        break;
      default:
        break;
    }

    return result;
  }, [users, searchQuery, typeFilter, sortBy]);

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const handleSearch = useCallback(
    (value) => {
      const trimmedValue = value.trim();
      setSearchQuery(trimmedValue);
      updateURL({ search: trimmedValue || undefined, page: "1" });
    },
    [updateURL]
  );

  const handleTypeChange = useCallback(
    (value) => {
      setTypeFilter(value);
      updateURL({ type: value, page: "1" });
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
    (typeFilter !== "all" ? 1 : 0) +
    (sortBy !== "date-desc" ? 1 : 0);

  // Clear handlers
  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    updateURL({ search: undefined, page: "1" });
  }, [updateURL]);

  const handleClearType = useCallback(() => {
    setTypeFilter("all");
    updateURL({ type: undefined, page: "1" });
  }, [updateURL]);

  const handleClearSort = useCallback(() => {
    setSortBy("date-desc");
    updateURL({ sort: undefined, page: "1" });
  }, [updateURL]);

  const handleClearAll = useCallback(() => {
    setSearchQuery("");
    setTypeFilter("all");
    setSortBy("date-desc");
    setCurrentPage(1);
    setItemsPerPage(10);
    updateURL({
      search: undefined,
      type: undefined,
      sort: undefined,
      page: "1",
      limit: "10",
    });
  }, [updateURL]);

  // Modal handlers
  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const payload = {
        email: values.email,
        userName: values.userName,
        password: values.password,
        orgId: ORG_ID,
        type: "company",
      };
      await dispatch(CreateOrgUser(payload)).unwrap();
      message.success("HR user added successfully!");
      form.resetFields();
      setIsModalVisible(false);

      // Refresh users list
      dispatch(
        getUsersByOrg({
          orgId: ORG_ID,
          page: currentPage,
          limit: itemsPerPage,
        })
      );
    } catch (error) {
      if (error.errorFields) {
        message.error("Please fill all required fields correctly");
      } else {
        message.error(error.message || "Failed to add HR user");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleModalCancel = () => {
    if (!submitting) {
      form.resetFields();
      setIsModalVisible(false);
    }
  };

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "admin":
        return "red";
      case "hr":
        return "blue";
      case "manager":
        return "green";
      case "employee":
        return "default";
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

  const handleUserClick = (userId) => {
    router.push(`${pathname}/${userId}?${searchParams.toString()}`);
  };

  return (
    <div className={styles.pageContainer}>
      <BreadcrumbComponent />

      <div className={styles.headerSection}>
        <h1 className={styles.pageTitle}>HR Users at {ORG_NAME}</h1>
        <div className={styles.headerContent}>
          <p className={styles.usersCount}>
            {pagination?.totalUsers ?? 0} user
            {(pagination?.totalUsers ?? 0) !== 1 ? "s" : ""} registered
          </p>
          <div className={styles.filterSection}>
            <Input
              placeholder="Search users by name, email, phone..."
              allowClear
              prefix={<SearchOutlined />}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 280 }}
              className={styles.searchBar}
            />

            <Space size="small" className={styles.filterControls} wrap>
              <Select
                value={typeFilter}
                onChange={handleTypeChange}
                size="middle"
                className={styles.filterSelect}
              >
                <Option value="all">All Types</Option>
                {userTypes.map((type) => (
                  <Option key={type} value={type}>
                    {type}
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
                <Option value="name-asc">Name (A-Z)</Option>
                <Option value="name-desc">Name (Z-A)</Option>
                <Option value="email-asc">Email (A-Z)</Option>
                <Option value="email-desc">Email (Z-A)</Option>
              </Select>

              <Tooltip
                title={
                  !canCreate
                    ? getPermissionMessage(PERMISSION_VALUES.CREATE)
                    : ""
                }
              >
                <span>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsModalVisible(true)}
                    disabled={!canCreate}
                  >
                    Add HR User
                  </Button>
                </span>
              </Tooltip>
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
            {typeFilter !== "all" && (
              <Tag
                closable
                icon={<CloseCircleOutlined />}
                onClose={handleClearType}
                color="green"
              >
                Type: {typeFilter}
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
          <Spin size="large" tip="Loading users..." />
        </div>
      ) : filteredAndSortedUsers.length === 0 ? (
        <Empty
          description={
            activeFilterCount > 0
              ? "No users found matching your filters"
              : "No users available"
          }
        />
      ) : (
        <>
          <div className={styles.usersGrid}>
            {filteredAndSortedUsers.map((user) => (
              <Card
                key={user._id}
                className={styles.userCard}
                hoverable
                // onClick={() => handleUserClick(user._id)}
              >
                <div className={styles.cardHeader}>
                  <Avatar
                    size={64}
                    icon={<UserOutlined />}
                    src={user?.profilePicture}
                    className={styles.avatar}
                  />
                  <div className={styles.userInfo}>
                    <Tooltip
                      title={user?.userName || user?.name || "Unknown User"}
                      placement="top"
                    >
                      <h3 className={styles.userName}>
                        {user?.userName || user?.name || "Unknown User"}
                      </h3>
                    </Tooltip>
                    <Tag color={getTypeColor(user?.type)}>
                      {user?.type?.toUpperCase() ?? "N/A"}
                    </Tag>
                  </div>
                </div>

                <Divider style={{ margin: "12px 0" }} />

                <div className={styles.userDetails}>
                  <div className={styles.detailItem}>
                    <MailOutlined />
                    <span>{user?.email ?? "N/A"}</span>
                  </div>

                  <div className={styles.detailItem}>
                    <PhoneOutlined />
                    <span>{user?.phone ?? "N/A"}</span>
                  </div>

                  <div className={styles.detailItem}>
                    <CalendarOutlined />
                    <span>Joined: {formatDate(user?.createdAt)}</span>
                  </div>
                </div>

                <div className={styles.roleInfo}>
                  <strong>Role:</strong> {user?.role ?? "N/A"}
                </div>
              </Card>
            ))}
          </div>

          <div className={styles.paginationContainer}>
            <Pagination
              current={currentPage}
              total={pagination?.totalUsers ?? 0}
              pageSize={itemsPerPage}
              onChange={handlePageChange}
              onShowSizeChange={handlePageChange}
              showSizeChanger
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} of ${total} users`
              }
              pageSizeOptions={["10", "20", "30", "50"]}
              disabled={loading}
            />
          </div>
        </>
      )}

      {/* Add HR User Modal */}
      <Modal
        title="Add New HR User"
        open={isModalVisible}
        onOk={handleModalSubmit}
        onCancel={handleModalCancel}
        confirmLoading={submitting}
        mask={{ closable: false }}
        keyboard={!submitting}
        closable={!submitting}
        okText="Add User"
        cancelText="Cancel"
        width={500}
      >
        <Form form={form} layout="vertical" name="addHRUser" autoComplete="off">
          <Form.Item
            label="Username"
            name="userName"
            rules={[
              { required: true, message: "Please enter username" },
              { min: 4, message: "Username must be at least 4 characters" },
              { max: 30, message: "Username must not exceed 30 characters" },
              {
                pattern: /^[a-zA-Z0-9_]+$/,
                message: "Only letters, numbers and underscores allowed",
              },
            ]}
          >
            <Input
              placeholder="Enter username"
              disabled={submitting}
              prefix={<UserOutlined />}
            />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please enter email address" },
              { type: "email", message: "Please enter a valid email address" },
            ]}
          >
            <Input
              placeholder="Enter email address"
              disabled={submitting}
              prefix={<MailOutlined />}
            />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: "Please enter password" },
              { min: 8, message: "Password must be at least 8 characters" },
              {
                pattern:
                  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                message:
                  "Password must contain uppercase, lowercase, number and special character",
              },
            ]}
          >
            <Input.Password
              placeholder="Enter password"
              disabled={submitting}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Page;
