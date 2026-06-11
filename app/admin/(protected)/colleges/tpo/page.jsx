"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { decrypt } from "@/utils/windowMW";
import BreadcrumbComponent from "@/modules/admin/components/breadcrumbs/breadcrumbs";
import {
  CreateOrgUser,
  DeleteTPO,
  getAllTposInOrg,
} from "@/redux/slices/admin/adminOrgSlice";
import {
  Divider,
  Spin,
  Input,
  Select,
  Space,
  Button,
  Modal,
  Form,
  App,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  SearchOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import styles from "./tpo.module.scss";
import { usePermissions, PERMISSION_VALUES } from "@/hooks/usepermission";

const { Search } = Input;
const { Option } = Select;

function Page() {
  const { message, notification } = App.useApp();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { replace, push } = useRouter();
  const { canAccess, getPermissionMessage, PERMISSION_VALUES } =
    usePermissions();

  // Permission check
  const canCreate = canAccess(PERMISSION_VALUES.CREATE);

  const encryptedOrgId = searchParams.get("orgId");
  const ORG_ID = encryptedOrgId ? decrypt(encryptedOrgId) : null;

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const {
    value: tpos,
    loading,
    error,
  } = useSelector((state) => state.adminOrg.tpos);

  useEffect(() => {
    if (ORG_ID) {
      dispatch(getAllTposInOrg({ orgId: ORG_ID }));
    }
  }, [ORG_ID, dispatch]);

  // Helper function to display value or N/A
  const displayValue = (value) => {
    return value && value.toString().trim() !== "" ? value : "N/A";
  };

  const getInitials = (name) => {
    if (!name) return "T";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`;
    }
    return name[0];
  };

  const getFullName = (tpo) => {
    return (
      [tpo.firstName, tpo.middleName, tpo.lastName].filter(Boolean).join(" ") ||
      tpo.userName ||
      ""
    );
  };

  const filteredAndSortedTpos = useMemo(() => {
    let result = [...(tpos || [])];

    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      result = result.filter((tpo) => {
        const fullName = getFullName(tpo).toLowerCase();
        const email = (tpo.email || "").toLowerCase();
        const phone = (tpo.phone || "").toLowerCase();
        const designation = (tpo.designation || "").toLowerCase();

        return (
          fullName.includes(searchLower) ||
          email.includes(searchLower) ||
          phone.includes(searchLower) ||
          designation.includes(searchLower)
        );
      });
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return getFullName(a).localeCompare(getFullName(b));
        case "name-desc":
          return getFullName(b).localeCompare(getFullName(a));
        case "email-asc":
          return (a.email || "").localeCompare(b.email || "");
        case "email-desc":
          return (b.email || "").localeCompare(a.email || "");
        case "designation-asc":
          return (a.designation || "").localeCompare(b.designation || "");
        case "designation-desc":
          return (b.designation || "").localeCompare(a.designation || "");
        case "type-asc":
          return (a.type || "").localeCompare(b.type || "");
        case "type-desc":
          return (b.type || "").localeCompare(a.type || "");
        default:
          return 0;
      }
    });

    return result;
  }, [tpos, searchQuery, sortBy]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const payload = {
        email: values.email,
        userName: values.userName,
        password: values.password,
        orgId: ORG_ID,
        type: "college",
      };

      await dispatch(CreateOrgUser(payload)).unwrap();

      message.success("TPO added successfully!");
      form.resetFields();
      setIsModalVisible(false);
      dispatch(getAllTposInOrg({ orgId: ORG_ID }));
    } catch (error) {
      if (error.errorFields) {
        message.error("Please fill all required fields correctly");
      } else {
        message.error(error.message || "Failed to add TPO");
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

  const renderTpoCard = (tpo) => {
    const fullName = getFullName(tpo);

    return (
      <div key={tpo._id} className={styles.tpoCard}>
        <div className={styles.cardHeader}>
          <div className={styles.avatarWrapper}>
            {tpo.tpoLogo ? (
              <img src={tpo.tpoLogo} alt={tpo.userName} />
            ) : (
              <div className={styles.placeholderAvatar}>
                {getInitials(fullName || tpo.userName)}
              </div>
            )}
          </div>
          <h3 className={styles.userName}>
            {displayValue(fullName || tpo.userName)}
          </h3>
          <p className={styles.email}>{displayValue(tpo.email)}</p>
        </div>

        <div className={styles.cardBody}>
          <div className={styles.infoRow}>
            <span className={styles.label}>Designation:</span>
            <span className={styles.value}>
              {displayValue(tpo.designation)}
            </span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.label}>
              <PhoneOutlined /> Phone:
            </span>
            <span className={styles.value}>{displayValue(tpo.phone)}</span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.label}>Alt Phone:</span>
            <span className={styles.value}>
              {displayValue(tpo.alternatePhone)}
            </span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.label}>Qualification:</span>
            <span className={styles.value}>
              {displayValue(tpo.qualification)}
            </span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.label}>Gender:</span>
            <span className={styles.value}>{displayValue(tpo.gender)}</span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.label}>Type:</span>
            <span className={styles.badge}>{displayValue(tpo.type)}</span>
          </div>
        </div>
        <Button
          style={{ width: "100%", marginTop: "16px" }}
          onClick={() => {
            console.log(11111);

            dispatch(DeleteTPO({ tpoId: tpo?.globalId, orgId: tpo?.orgId }));
          }}
        >
          Delete TPO
        </Button>
      </div>
    );
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

      {!loading && !error && (!tpos || tpos.length === 0) && (
        <>
          <div className={styles.tpoHeader}>
            <div className={styles.headerInfo}>
              <h3>Training & Placement Officers</h3>
              <Space className={styles.controls} size="middle">
                <Search
                  placeholder="Search TPOs..."
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
                    minWidth: "200px",
                  }}
                >
                  <Option value="name-asc">Name (A-Z)</Option>
                  <Option value="name-desc">Name (Z-A)</Option>
                  <Option value="email-asc">Email (A-Z)</Option>
                  <Option value="email-desc">Email (Z-A)</Option>
                  <Option value="designation-asc">Designation (A-Z)</Option>
                  <Option value="designation-desc">Designation (Z-A)</Option>
                  <Option value="type-asc">Type (A-Z)</Option>
                  <Option value="type-desc">Type (Z-A)</Option>
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
                      Add TPO
                    </Button>
                  </span>
                </Tooltip>
              </Space>
            </div>
          </div>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <UserOutlined />
            </div>
            <p>No Training & Placement Officers found</p>
          </div>
        </>
      )}

      {!loading && !error && tpos && tpos.length > 0 && (
        <>
          <div className={styles.tpoHeader}>
            <div className={styles.headerInfo}>
              <h3>Training & Placement Officers</h3>
              <Space className={styles.controls} size="middle">
                <Search
                  placeholder="Search TPOs..."
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
                    minWidth: "200px",
                  }}
                >
                  <Option value="name-asc">Name (A-Z)</Option>
                  <Option value="name-desc">Name (Z-A)</Option>
                  <Option value="email-asc">Email (A-Z)</Option>
                  <Option value="email-desc">Email (Z-A)</Option>
                  <Option value="designation-asc">Designation (A-Z)</Option>
                  <Option value="designation-desc">Designation (Z-A)</Option>
                  <Option value="type-asc">Type (A-Z)</Option>
                  <Option value="type-desc">Type (Z-A)</Option>
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
                      Add TPO
                    </Button>
                  </span>
                </Tooltip>
              </Space>
            </div>
          </div>
          <Divider style={{ margin: ".3rem 0", width: "100%" }} />

          {filteredAndSortedTpos.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <SearchOutlined />
              </div>
              <p>No TPOs match your search</p>
            </div>
          ) : (
            <div className={styles.tpoGrid}>
              {filteredAndSortedTpos.map((tpo) => renderTpoCard(tpo))}
            </div>
          )}
        </>
      )}

      <Modal
        title="Add New TPO"
        open={isModalVisible}
        onOk={handleModalSubmit}
        onCancel={handleModalCancel}
        confirmLoading={submitting}
        mask={{ closable: false }}
        keyboard={!submitting}
        closable={!submitting}
        okText="Add TPO"
        cancelText="Cancel"
        width={500}
      >
        <Form form={form} layout="vertical" name="addTpo" autoComplete="off">
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
            <Input placeholder="Enter username" disabled={submitting} />
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
