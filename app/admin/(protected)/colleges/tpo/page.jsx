"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { decrypt } from "@/utils/windowMW";
import BreadcrumbComponent from "@/modules/admin/components/breadcrumbs/breadcrumbs";
import {
  CreateOrgUser,
  DeleteTPO,
  getAllTposInOrg,
  toggleTpoStatus,
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
  Tooltip,
  message,
  Switch,
  Popconfirm,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  SearchOutlined,
  PlusOutlined,
  DeleteOutlined,
  IdcardOutlined,
  MobileOutlined,
  ReadOutlined,
  TagOutlined,
} from "@ant-design/icons";
import styles from "./tpo.module.scss";
import { usePermissions, PERMISSION_VALUES } from "@/hooks/usepermission";

const { Search } = Input;
const { Option } = Select;

function Page() {
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
  const encryptedOrgName = searchParams.get("orgName");
  const ORG_NAME = encryptedOrgName ? decrypt(encryptedOrgName) : null;
  const from = searchParams.get("from");

  const breadcrumbItems = from === "college" ? [
    { title: <Link href="/admin/colleges">Colleges & Students</Link> },
    { title: "Training & Placement Officers" }
  ] : [
    { title: <Link href="/admin/colleges">Colleges & Students</Link> },
    ...(ORG_NAME ? [{ title: <Link href={`/admin/organisationDetails/${ORG_ID}`}>{ORG_NAME}</Link> }] : []),
    { title: "Training & Placement Officers" }
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteModalData, setDeleteModalData] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
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

  const handleToggleStatus = (tpoId, currentStatus) => {
    dispatch(toggleTpoStatus({ tpoId, active: !currentStatus }))
      .unwrap()
      .then((res) => {
        message.success(res.msg || "Status updated successfully");
      })
      .catch((error) => {
        message.error(error || "Failed to update status");
      });
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
      await dispatch(getAllTposInOrg({ orgId: ORG_ID }));
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
            <span className={styles.label}>
              <span className={styles.iconWrapper} style={{ color: "#1890ff" }}><IdcardOutlined /></span>
              Designation
            </span>
            <span className={styles.value}>
              {displayValue(tpo.designation)}
            </span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.label}>
              <span className={styles.iconWrapper} style={{ color: "#389e0d" }}><PhoneOutlined /></span>
              Phone
            </span>
            <span className={styles.value}>{displayValue(tpo.phone)}</span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.label}>
              <span className={styles.iconWrapper} style={{ color: "#722ed1" }}><MobileOutlined /></span>
              Alt Phone
            </span>
            <span className={styles.value}>
              {displayValue(tpo.alternatePhone)}
            </span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.label}>
              <span className={styles.iconWrapper} style={{ color: "#1890ff" }}><ReadOutlined /></span>
              Qualification
            </span>
            <span className={styles.value}>
              {displayValue(tpo.qualification)}
            </span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.label}>
              <span className={styles.iconWrapper} style={{ color: "#389e0d" }}><UserOutlined /></span>
              Gender
            </span>
            <span className={styles.value}>{displayValue(tpo.gender)}</span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.label}>
              <span className={styles.iconWrapper} style={{ color: "#722ed1" }}><TagOutlined /></span>
              Type
            </span>
            <span className={styles.badge}>{displayValue(tpo.type)}</span>
          </div>
        </div>
        <Divider style={{ margin: "16px 0 12px 0" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px", fontWeight: 500, color: "#595959" }}>Active</span>
            <Tooltip title={tpo.active === false ? "Deactivated" : "Active"}>
              <Popconfirm
                title={tpo.active === false ? "Reactivate TPO" : "Deactivate TPO"}
                description={tpo.active === false ? "Are you sure you want to reactivate this TPO? They will be able to log in." : "Are you sure you want to deactivate this TPO? They will be unable to log in."}
                onConfirm={() => handleToggleStatus(tpo.globalId || tpo._id, tpo.active !== false)}
                okText="Yes"
                cancelText="No"
              >
                <Switch
                  checked={tpo.active !== false}
                  size="small"
                />
              </Popconfirm>
            </Tooltip>
          </div>
          <Button
            danger
            icon={<DeleteOutlined />}
            style={{ borderRadius: "6px", display: "flex", alignItems: "center" }}
            onClick={() => {
              setDeleteModalData(tpo);
              setDeleteModal(true);
            }}
          >
            Delete TPO
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerWrapper}>
        <div className={styles.tpoHeader}>
          <div className={styles.headerInfo}>
            <BreadcrumbComponent customItems={breadcrumbItems} />
            <div className={styles.controls}>
              <Input
                placeholder="Search TPOs..."
                onChange={handleSearchChange}
                value={searchQuery}
                prefix={<SearchOutlined style={{ color: "#94a3b8", marginRight: "4px" }} />}
                allowClear
                className={styles.searchInput}
              />
              <Select
                value={sortBy}
                onChange={handleSortChange}
                className={styles.sortSelect}
                style={{ borderRadius: "8px" }}
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
              <Tooltip title={!canCreate ? getPermissionMessage(PERMISSION_VALUES.CREATE) : ""}>
                <span>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsModalVisible(true)}
                    disabled={!canCreate}
                    style={{ borderRadius: "8px" }}
                  >
                    Add TPO
                  </Button>
                </span>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.contentScrollContainer}>

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
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <UserOutlined />
          </div>
          <p>No Training & Placement Officers found</p>
        </div>
      )}

      {!loading && !error && tpos && tpos.length > 0 && (
        <>
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

      </div>

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
          {/* Hidden inputs to trick Chrome's aggressive autofill */}
          <input type="text" name="hidden_username" autoComplete="username" style={{ display: 'none' }} />
          <input type="password" name="hidden_password" autoComplete="current-password" style={{ display: 'none' }} />
          
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
            <Input placeholder="Enter username" disabled={submitting} autoComplete="off" />
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
              autoComplete="off"
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
              autoComplete="new-password"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Delete TPO"
        open={deleteModal}
        onOk={async () => {
          setDeleteLoading(true);
          try {
            await dispatch(
              DeleteTPO({
                tpoId: deleteModalData?.globalId,
                orgId: deleteModalData?.orgId,
              })
            ).unwrap();
            setDeleteModal(false);
            setDeleteModalData(null);
            dispatch(getAllTposInOrg({ orgId: ORG_ID }));
          } catch (e) {
            // handle error if needed
          } finally {
            setDeleteLoading(false);
          }
        }}
        onCancel={() => {
          setDeleteModal(false);
          setDeleteModalData(null);
        }}
        confirmLoading={deleteLoading}
        mask={{ closable: false }}
      >
        <p style={{ fontSize: "16px", fontWeight: 500 }}>
          Are you sure you want to delete{" "}
          {deleteModalData ? getFullName(deleteModalData) || deleteModalData.userName : ""}
          ?
        </p>
        <p style={{ color: "#ff4d4f", marginTop: "10px" }}>
          <strong>Warning:</strong> If you delete this TPO, their account will be removed entirely. To recover a deleted TPO, you must contact the development team.
        </p>
      </Modal>
    </div>
  );
}

export default Page;
