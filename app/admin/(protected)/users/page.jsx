"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  Button,
  Tag,
  Avatar,
  Input,
  Space,
  Switch,
  Popconfirm,
  Modal,
  Tabs,
  Form,
  Select,
  Checkbox,
  Row,
  Col,
  App,
  Skeleton,
  Tooltip,
} from "antd";
import {
  EditOutlined,
  SearchOutlined,
  UserOutlined,
  SyncOutlined,
  PlusOutlined,
  DeleteOutlined,
  LockOutlined,
  MailOutlined,
  SafetyOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CrownOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { FaShieldAlt, FaStar, FaEye } from "react-icons/fa";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import styles from "./users.module.scss";
import { usersdata } from "@/utils/windowMW";
import { getAllOrgs } from "@/redux/slices/admin/adminOrgSlice";
import {
  getAllAdminUsers,
  createUser,
  updateAdminUser,
  deleteAdminUser,
} from "@/redux/slices/admin/adminAuthSlice";
import { useDispatch, useSelector } from "react-redux";
import { FaCrown } from "react-icons/fa6";
import { BsShield } from "react-icons/bs";
import { usePermissions, PERMISSION_VALUES } from "@/hooks/usepermission";

export const roleConfig = {
  admin: {
    icon: <FaCrown style={{ fontSize: "2rem" }} color="gold" />,
    color: "gold",
  },
  moderator: {
    icon: <FaShieldAlt style={{ fontSize: "2rem", color: "green" }} />,
    color: "green",
  },
  viewer: {
    icon: <FaEye style={{ fontSize: "2rem" }} color="gray" />,
    color: "gray",
  },
};

const SECTION_PERMISSIONS = {
  course: "/admin/course",
  internship: "/admin/internship",
  practice: "/admin/practice",
  skill: "/admin/questionManager",
  workshops: "/admin/workshops",
};

export default function User() {
  const { message } = App.useApp();
  const router = useRouter();
  const dispatch = useDispatch();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [form] = Form.useForm();
  const { canAccess, getPermissionMessage, accessAll, isAdmin } =
    usePermissions();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("basicInfo");
  const [isActive, setIsActive] = useState(true);
  const [editingUserKey, setEditingUserKey] = useState(null);

  // Redux selectors
  const { list: USERS, loading } = useSelector((s) => s.adminAuth?.adminUsers || {});
  const { value: Orgs } = useSelector((s) => s.adminOrg.orgs);

  // local filter/sort state
  const [tableParams, setTableParams] = useState({
    filters: {},
    sorter: {},
  });

  const permissionList = [
    PERMISSION_VALUES.CREATE,
    PERMISSION_VALUES.EDIT,
    PERMISSION_VALUES.DELETE,
    PERMISSION_VALUES.PUBLISH,
    PERMISSION_VALUES.MANAGE_USERS,
  ];

  const colorMap = {
    [PERMISSION_VALUES.CREATE]: "green",
    [PERMISSION_VALUES.EDIT]: "blue",
    [PERMISSION_VALUES.DELETE]: "red",
    [PERMISSION_VALUES.PUBLISH]: "purple",
    [PERMISSION_VALUES.MANAGE_USERS]: "orange",
  };

  const colleges = useMemo(
    () => (Orgs || []).filter((o) => o.type === "college"),
    [Orgs]
  );
  const companies = useMemo(
    () => (Orgs || []).filter((o) => o.type === "company"),
    [Orgs]
  );

  const [collegeSearch, setCollegeSearch] = useState("");
  const [companySearch, setCompanySearch] = useState("");

  // derive table data from USERS
  const userData = useMemo(
    () =>
      (USERS || []).map((u) => ({
        key: u._id || u.userId || u.email,
        id: u._id || u.userId,
        name: u.fullname || u.username || u.name,
        username: u.username,
        email: u.email,
        role: u.role,
        isActive: typeof u.isActive === "boolean" ? u.isActive : true,
        created: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "",
        permissions: u.permissions || {},
        colleges: u.colleges || [],
        companies: u.companies || [],
      })),
    [USERS]
  );

  const parseParamsToTable = (sp) => {
    const filters = {};
    const sorter = {};

    const role = sp.get("role");
    const status = sp.get("status");
    const email = sp.get("email");
    const sortField = sp.get("sortField");
    const sortOrder = sp.get("sortOrder");

    if (role) filters.role = role.split(",");
    if (status) filters.status = status.split(",");
    if (email) filters.email = [email];
    if (sortField && sortOrder) {
      sorter.field = sortField;
      sorter.order = sortOrder;
    }

    return { filters, sorter };
  };

  const updateUrlFromTable = (filters, sorter) => {
    const params = new URLSearchParams(searchParams.toString());

    if (filters.role && filters.role.length) {
      params.set("role", filters.role.join(","));
    } else {
      params.delete("role");
    }

    if (filters.status && filters.status.length) {
      params.set("status", filters.status.join(","));
    } else {
      params.delete("status");
    }

    if (filters.email && filters.email[0]) {
      params.set("email", String(filters.email[0]));
    } else {
      params.delete("email");
    }

    if (sorter && sorter.field && sorter.order) {
      params.set("sortField", sorter.field);
      params.set("sortOrder", sorter.order);
    } else {
      params.delete("sortField");
      params.delete("sortOrder");
    }

    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  };

  useEffect(() => {
    const parsed = parseParamsToTable(searchParams);
    setTableParams(parsed);
  }, [searchParams]);

  useEffect(() => {
    dispatch(getAllAdminUsers());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getAllOrgs());
  }, [dispatch]);

  const permissionsArrayToObject = (selected = [], sectionsSelected = {}) => {
    const obj = {};
    permissionList.forEach((perm) => {
      obj[perm] = selected.includes(perm);
    });
    Object.keys(SECTION_PERMISSIONS).forEach((sec) => {
      obj[sec] = !!sectionsSelected[sec];
    });
    return obj;
  };

  const permissionsObjectToArray = (obj = {}) => {
    if (!obj) return { general: [], sections: {} };
    const general = permissionList.filter((perm) => obj[perm]);
    const sections = {};
    Object.keys(SECTION_PERMISSIONS).forEach((sec) => {
      sections[sec] = obj[sec] || false;
    });
    return { general, sections };
  };

  const showModal = () => {
    setIsModalOpen(true);
    form.resetFields();
    setActiveTab("basicInfo");
    setIsActive(true);
    setEditingUserKey(null);
    setCollegeSearch("");
    setCompanySearch("");
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setEditingUserKey(null);
    setCollegeSearch("");
    setCompanySearch("");
  };

  const handleCreateOrUpdateUser = () => {
    form
      .validateFields()
      .then((values) => {
        const basicInfo = values.basicInfo;

        // Get the previous user data if editing
        const prevUser = editingUserKey
          ? userData.find((u) => u.key === editingUserKey)
          : null;

        // Handle permissions - merge with previous values if not explicitly set
        const selectedPermissions = values.permissions?.general || [];
        const sectionPermissions = values.permissions?.sections || {};

        // If editing, preserve previous section permissions that weren't changed
        let finalSectionPermissions = { ...sectionPermissions };
        if (editingUserKey && prevUser) {
          const prevPerms = permissionsObjectToArray(prevUser.permissions);
          // Merge: only override sections that are explicitly set in the form
          Object.keys(SECTION_PERMISSIONS).forEach((sec) => {
            // If the section field exists in form values, use it; otherwise use previous value
            if (
              values.permissions?.sections &&
              sec in values.permissions.sections
            ) {
              finalSectionPermissions[sec] = values.permissions.sections[sec];
            } else if (prevPerms.sections && sec in prevPerms.sections) {
              finalSectionPermissions[sec] = prevPerms.sections[sec];
            }
          });
        }

        const permissionsObj = permissionsArrayToObject(
          selectedPermissions,
          finalSectionPermissions
        );

        // Handle colleges
        const formCollegeIds = values.colleges?.selected;
        let finalCollegeIds = [];
        if (Array.isArray(formCollegeIds)) {
          finalCollegeIds = formCollegeIds;
        } else if (editingUserKey && prevUser) {
          finalCollegeIds = prevUser.colleges || [];
        }

        // Handle companies
        const formCompanyIds = values.companies?.selected;
        let finalCompanyIds = [];
        if (Array.isArray(formCompanyIds)) {
          finalCompanyIds = formCompanyIds;
        } else if (editingUserKey && prevUser) {
          finalCompanyIds = prevUser.companies || [];
        }

        const userDetails = {
          fullname: basicInfo.fullName,
          username: basicInfo.username,
          email: basicInfo.email,
          role: basicInfo.role,
          isActive: basicInfo.isActive ?? true,
          permissions: permissionsObj,
          colleges: finalCollegeIds,
          companies: finalCompanyIds,
          password: basicInfo.password || undefined,
        };

        if (editingUserKey) {
          const userId = prevUser?.id;

          if (!userId) {
            message.error("Invalid user id for update");
            return;
          }

          dispatch(
            updateAdminUser({
              userId,
              updateData: userDetails,
            })
          )
            .unwrap()
            .then(() => {
              dispatch(getAllAdminUsers());
              message.success("User updated successfully");
            })
            .catch((err) => {
              message.error(err || "Failed to update user");
            });
        } else {
          dispatch(createUser(userDetails))
            .unwrap()
            .then(() => {
              dispatch(getAllAdminUsers());
              message.success("User created successfully");
            })
            .catch((err) => {
              message.error(err || "Failed to create user");
            });
        }

        setIsModalOpen(false);
        form.resetFields();
        setEditingUserKey(null);
        setCollegeSearch("");
        setCompanySearch("");
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  const handleEditUser = (user) => {
    setEditingUserKey(user.key);
    const perms = permissionsObjectToArray(user.permissions);

    form.setFieldsValue({
      basicInfo: {
        fullName: user.name,
        username:
          user.username || user.name?.toLowerCase().replace(/\s/g, "") || "",
        email: user.email,
        password: "",
        role: user.role,
        isActive: user.isActive ?? true,
      },
      permissions: {
        general: perms.general,
        sections: perms.sections,
      },
      colleges: {
        selected: user.colleges || [],
      },
      companies: {
        selected: user.companies || [],
      },
    });

    setIsActive(user.isActive ?? true);
    setActiveTab("basicInfo");
    setIsModalOpen(true);
    setCollegeSearch("");
    setCompanySearch("");
  };

  const handleStatusToggle = (key, checked) => {
    const user = userData.find((u) => u.key === key);
    if (!user || !user.id) {
      message.error("Invalid user id");
      return;
    }

    dispatch(
      updateAdminUser({
        userId: user.id,
        updateData: { isActive: checked },
      })
    )
      .unwrap()
      .then(() => {
        message.success(
          `User ${checked ? "activated" : "deactivated"} successfully`
        );
        dispatch(getAllAdminUsers());
      })
      .catch((err) => {
        message.error(err || "Failed to update status");
      });
  };

  const handleDeleteUser = (record) => {
    const userId = record?._id || record?.id;
    if (!userId) return;

    dispatch(deleteAdminUser(userId))
      .then(() => {
        message.success("User Deleted Successfully");
        dispatch(getAllAdminUsers());
      })
      .catch((err) => {
        console.error("Failed to delete user:", err);
      });
  };

  const handleTableChange = (pagination, filters, sorter) => {
    const normalizedSorter = {
      field: sorter.field,
      order: sorter.order,
    };

    const nextParams = {
      filters: {
        ...filters,
      },
      sorter: normalizedSorter,
    };

    setTableParams(nextParams);
    updateUrlFromTable(nextParams.filters, nextParams.sorter);
  };

  const clearAllFilters = () => {
    const empty = { filters: {}, sorter: {} };
    setTableParams(empty);
    updateUrlFromTable(empty.filters, empty.sorter);
  };

  const hasActiveFilters =
    (tableParams.filters &&
      Object.values(tableParams.filters).some(
        (val) => Array.isArray(val) && val.length > 0
      )) ||
    !!tableParams.sorter?.order;

  const getProcessedData = () => {
    let data = [...userData];
    const { filters, sorter } = tableParams;

    if (filters.role && filters.role.length > 0) {
      data = data.filter((item) => filters.role.includes(item.role));
    }

    if (filters.status && filters.status.length > 0) {
      const wantActive = filters.status.includes("Active");
      const wantInactive = filters.status.includes("Inactive");

      data = data.filter((item) => {
        if (wantActive && item.isActive) return true;
        if (wantInactive && !item.isActive) return true;
        return false;
      });
    }

    if (filters.email && filters.email[0]) {
      const val = String(filters.email[0]).toLowerCase();
      data = data.filter((item) => item.email.toLowerCase().includes(val));
    }

    if (sorter && sorter.field && sorter.order) {
      data.sort((a, b) => {
        const valA = a[sorter.field];
        const valB = b[sorter.field];
        if (valA === undefined || valB === undefined) return 0;

        if (typeof valA === "boolean" && typeof valB === "boolean") {
          const numA = valA ? 1 : 0;
          const numB = valB ? 1 : 0;
          if (sorter.order === "ascend") return numA - numB;
          if (sorter.order === "descend") return numB - numA;
          return 0;
        }

        if (sorter.order === "ascend") return valA > valB ? 1 : -1;
        if (sorter.order === "descend") return valA < valB ? 1 : -1;
        return 0;
      });
    }

    return data;
  };

  const processedData = useMemo(
    () => getProcessedData(),
    [userData, tableParams]
  );

  const stats = [
    {
      label: "Total",
      value: processedData.length,
      icon: <UserOutlined />,
    },
    {
      label: "Active",
      value: processedData.filter((u) => u.isActive).length,
      icon: <CheckCircleOutlined />,
    },
    {
      label: "Admins",
      value: processedData.filter((u) => u.role === "ADMIN").length,
      icon: <CrownOutlined />,
    },
    {
      label: "Moderators",
      value: processedData.filter((u) => u.role === "MODERATOR").length,
      icon: <BsShield />,
    },
    {
      label: "Viewers",
      value: processedData.filter((u) => u.role === "VIEWER").length,
      icon: <EyeOutlined />,
    },
  ];

  const activeFilterChips = useMemo(() => {
    const chips = [];
    const { filters } = tableParams;

    if (filters.role && filters.role.length) {
      filters.role.forEach((roleVal) => {
        chips.push({
          key: `role-${roleVal}`,
          label: `Role: ${roleVal}`,
          type: "role",
          value: roleVal,
        });
      });
    }

    if (filters.status && filters.status.length) {
      filters.status.forEach((statusVal) => {
        chips.push({
          key: `status-${statusVal}`,
          label: `Status: ${statusVal}`,
          type: "status",
          value: statusVal,
        });
      });
    }

    if (filters.email && filters.email[0]) {
      chips.push({
        key: `email-${filters.email[0]}`,
        label: `Email: ${filters.email[0]}`,
        type: "email",
        value: filters.email[0],
      });
    }

    return chips;
  }, [tableParams]);

  const handleRemoveSingleFilter = (chip) => {
    const nextFilters = { ...tableParams.filters };

    if (chip.type === "email") {
      delete nextFilters.email;
    } else {
      const arr = nextFilters[chip.type] || [];
      nextFilters[chip.type] = arr.filter((v) => v !== chip.value);
      if (!nextFilters[chip.type].length) delete nextFilters[chip.type];
    }

    const nextParams = {
      filters: nextFilters,
      sorter: tableParams.sorter,
    };
    setTableParams(nextParams);
    updateUrlFromTable(nextParams.filters, nextParams.sorter);
  };

  const PermissionSummary = () => (
    <Form.Item noStyle shouldUpdate>
      {() => {
        const role = form.getFieldValue(["basicInfo", "role"]);
        const permissions =
          form.getFieldValue(["permissions", "general"]) || [];
        const sections = form.getFieldValue(["permissions", "sections"]) || {};
        const selectedColleges =
          form.getFieldValue(["colleges", "selected"]) || [];
        const selectedCompanies =
          form.getFieldValue(["companies", "selected"]) || [];

        const sectionNames = {
          course: "Course Library",
          internship: "Internship Library",
          practice: "Practice Questions",
          skill: "Skill Library",
        };
        const activeSections = Object.keys(sections).filter((k) => sections[k]);

        return (
          <div className={styles.permissionSummary}>
            <h3>Permission Summary</h3>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Role:</span>
                <span className={styles.summaryValue}>{role || "—"}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>
                  General Permissions:
                </span>
                <span className={styles.summaryValue}>
                  {permissions.length} granted
                </span>
              </div>
              {permissions.length > 0 && (
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Selected:</span>
                  <span className={styles.summaryValue}>
                    {permissions.map((perm) => (
                      <Tag
                        key={perm}
                        color={colorMap[perm] || "default"}
                        className={styles.permissionTag}
                      >
                        {perm}
                      </Tag>
                    ))}
                  </span>
                </div>
              )}
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Section Access:</span>
                <span className={styles.summaryValue}>
                  {activeSections.length} enabled
                </span>
              </div>
              {activeSections.length > 0 && (
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Sections:</span>
                  <span className={styles.summaryValue}>
                    {activeSections.map((section) => (
                      <Tag
                        key={section}
                        color="cyan"
                        className={styles.permissionTag}
                      >
                        {sectionNames[section] || section}
                      </Tag>
                    ))}
                  </span>
                </div>
              )}
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Colleges:</span>
                <span className={styles.summaryValue}>
                  {selectedColleges.length} selected
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Companies:</span>
                <span className={styles.summaryValue}>
                  {selectedCompanies.length} selected
                </span>
              </div>
            </div>
          </div>
        );
      }}
    </Form.Item>
  );

  const tabItems = [
    {
      key: "basicInfo",
      label: (
        <span>
          <UserOutlined /> Basic Info
        </span>
      ),
      children: (
        <div className={styles.tabContent}>
          <Form.Item
            label="Full Name"
            name={["basicInfo", "fullName"]}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            rules={[{ required: true, message: "Please enter full name" }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Enter full name"
              size="middle"
            />
          </Form.Item>

          <Form.Item
            label="Username"
            name={["basicInfo", "username"]}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            rules={[{ required: true, message: "Please enter username" }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Enter username"
              size="middle"
            />
          </Form.Item>

          <Form.Item
            label="Email Address"
            name={["basicInfo", "email"]}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            rules={[
              { required: true, message: "Please enter email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Enter email address"
              size="middle"
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name={["basicInfo", "password"]}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            rules={[
              {
                required: !editingUserKey,
                message: "Please enter password",
              },
              { min: 6, message: "Password must be at least 6 characters" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={
                editingUserKey
                  ? "Enter new password (optional)"
                  : "Enter password"
              }
              size="middle"
              iconRender={(visible) =>
                visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          <Form.Item
            label="User Role"
            name={["basicInfo", "role"]}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            rules={[{ required: true, message: "Please select a role" }]}
          >
            <Select placeholder="Select user role" size="middle">
              <Select.Option value="ADMIN">Admin</Select.Option>
              <Select.Option value="MODERATOR">Moderator</Select.Option>
              <Select.Option value="VIEWER">Viewer</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Active"
            name={["basicInfo", "isActive"]}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            valuePropName="checked"
          >
            <Switch
              checked={isActive}
              onChange={(checked) => {
                setIsActive(checked);
                form.setFieldsValue({
                  basicInfo: {
                    ...form.getFieldValue("basicInfo"),
                    isActive: checked,
                  },
                });
              }}
              checkedChildren="Active"
              unCheckedChildren="Inactive"
            />
          </Form.Item>
        </div>
      ),
    },
    {
      key: "permissions",
      label: (
        <span>
          <SafetyOutlined /> Permissions
        </span>
      ),
      children: (
        <div className={styles.tabContent}>
          <Tabs
            defaultActiveKey="general"
            type="card"
            items={[
              {
                key: "general",
                label: "General Permissions",
                children: (
                  <div className={styles.permissionSection}>
                    <div className={styles.orgHeaderRow}>
                      <h3 className={styles.orgTitle}>
                        Select General Permissions
                      </h3>
                    </div>

                    <Form.Item name={["permissions", "general"]} noStyle>
                      <Checkbox.Group className={styles.orgCheckboxGroup}>
                        <div className={styles.orgGrid}>
                          <div className={styles.orgCard}>
                            <Checkbox value={PERMISSION_VALUES.CREATE}>
                              <strong>Create Content</strong>
                              <div className={styles.permissionDesc}>
                                Allow user to create new content
                              </div>
                            </Checkbox>
                          </div>

                          <div className={styles.orgCard}>
                            <Checkbox value={PERMISSION_VALUES.EDIT}>
                              <strong>Edit Content</strong>
                              <div className={styles.permissionDesc}>
                                Allow user to edit existing content
                              </div>
                            </Checkbox>
                          </div>

                          <div className={styles.orgCard}>
                            <Checkbox value={PERMISSION_VALUES.DELETE}>
                              <strong>Delete Content</strong>
                              <div className={styles.permissionDesc}>
                                Allow user to delete content
                              </div>
                            </Checkbox>
                          </div>

                          <div className={styles.orgCard}>
                            <Checkbox value={PERMISSION_VALUES.PUBLISH}>
                              <strong>Publish Content</strong>
                              <div className={styles.permissionDesc}>
                                Allow user to publish/unpublish
                              </div>
                            </Checkbox>
                          </div>

                          <div className={styles.orgCard}>
                            <Checkbox value={PERMISSION_VALUES.MANAGE_USERS}>
                              <strong>Manage Users</strong>
                              <div className={styles.permissionDesc}>
                                Allow user to manage other users
                              </div>
                            </Checkbox>
                          </div>
                        </div>
                      </Checkbox.Group>
                    </Form.Item>
                  </div>
                ),
              },
              {
                key: "sections",
                label: "Section Permissions",
                children: (
                  <div className={styles.permissionSection}>
                    <div className={styles.orgHeaderRow}>
                      <h3 className={styles.orgTitle}>Select Section Access</h3>
                    </div>

                    <div className={styles.orgGrid}>
                      <div className={styles.orgCard}>
                        <Form.Item
                          name={["permissions", "sections", "course"]}
                          valuePropName="checked"
                          noStyle
                        >
                          <Checkbox>
                            <strong>Course Library</strong>
                            <div className={styles.permissionDesc}>
                              Access to course management
                            </div>
                          </Checkbox>
                        </Form.Item>
                      </div>

                      <div className={styles.orgCard}>
                        <Form.Item
                          name={["permissions", "sections", "internship"]}
                          valuePropName="checked"
                          noStyle
                        >
                          <Checkbox>
                            <strong>Internship Library</strong>
                            <div className={styles.permissionDesc}>
                              Access to internship management
                            </div>
                          </Checkbox>
                        </Form.Item>
                      </div>

                      <div className={styles.orgCard}>
                        <Form.Item
                          name={["permissions", "sections", "practice"]}
                          valuePropName="checked"
                          noStyle
                        >
                          <Checkbox>
                            <strong>Practice Questions</strong>
                            <div className={styles.permissionDesc}>
                              Access to question practice portal
                            </div>
                          </Checkbox>
                        </Form.Item>
                      </div>

                      <div className={styles.orgCard}>
                        <Form.Item
                          name={["permissions", "sections", "skill"]}
                          valuePropName="checked"
                          noStyle
                        >
                          <Checkbox>
                            <strong>Skill Library</strong>
                            <div className={styles.permissionDesc}>
                              Access to skill/question manager
                            </div>
                          </Checkbox>
                        </Form.Item>
                      </div>
                      <div className={styles.orgCard}>
                        <Form.Item
                          name={["permissions", "sections", "workshops"]}
                          valuePropName="checked"
                          noStyle
                        >
                          <Checkbox>
                            <strong>Workshops Library</strong>
                            <div className={styles.permissionDesc}>
                              Access to workshops management
                            </div>
                          </Checkbox>
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </div>
      ),
    },

    // For COLLEGES tab:
    {
      key: "colleges",
      label: "Colleges",
      children: (
        <div className={styles.tabContent}>
          <div className={styles.orgHeaderRow}>
            <h3 className={styles.orgTitle}>Select Colleges</h3>

            <Input
              allowClear
              size="middle"
              placeholder="Search colleges"
              className={styles.orgSearch}
              value={collegeSearch}
              prefix={<SearchOutlined />}
              onChange={(e) => setCollegeSearch(e.target.value)}
            />
          </div>

          <Form.Item noStyle shouldUpdate>
            {() => {
              const selectedColleges =
                form.getFieldValue(["colleges", "selected"]) || [];

              // Get selected college objects
              const selectedCollegeObjs = colleges.filter((org) =>
                selectedColleges.includes(org.orgId)
              );

              // Get filtered search results (excluding already selected)
              const searchResults = colleges.filter((org) => {
                const matchesSearch = org.orgName
                  .toLowerCase()
                  .includes(collegeSearch.toLowerCase());
                const notAlreadySelected = !selectedColleges.includes(
                  org.orgId
                );
                return matchesSearch && notAlreadySelected;
              });

              // Combine: selected first, then search results, limit to 9 total
              const displayedColleges = [
                ...selectedCollegeObjs,
                ...searchResults,
              ].slice(0, 9);

              return (
                <Form.Item name={["colleges", "selected"]} noStyle>
                  <Checkbox.Group className={styles.orgCheckboxGroup}>
                    <div className={styles.orgGrid}>
                      {displayedColleges.map((org) => {
                        const isSelected = selectedColleges.includes(org.orgId);
                        return (
                          <div
                            key={org._id}
                            className={`${styles.orgCard} ${
                              isSelected ? styles.orgCardSelected : ""
                            }`}
                          >
                            <Checkbox value={org.orgId}>{org.orgName}</Checkbox>
                          </div>
                        );
                      })}
                    </div>
                  </Checkbox.Group>
                </Form.Item>
              );
            }}
          </Form.Item>
        </div>
      ),
    },
    // For COMPANIES tab:
    {
      key: "companies",
      label: "Companies",
      children: (
        <div className={styles.tabContent}>
          <div className={styles.orgHeaderRow}>
            <h3 className={styles.orgTitle}>Select Companies</h3>

            <Input
              allowClear
              size="middle"
              placeholder="Search companies"
              value={companySearch}
              prefix={<SearchOutlined />}
              onChange={(e) => setCompanySearch(e.target.value)}
            />
          </div>

          <Form.Item noStyle shouldUpdate>
            {() => {
              const selectedCompanies =
                form.getFieldValue(["companies", "selected"]) || [];

              // Get selected company objects
              const selectedCompanyObjs = companies.filter((org) =>
                selectedCompanies.includes(org.orgId)
              );

              // Get filtered search results (excluding already selected)
              const searchResults = companies.filter((org) => {
                const matchesSearch = org.orgName
                  .toLowerCase()
                  .includes(companySearch.toLowerCase());
                const notAlreadySelected = !selectedCompanies.includes(
                  org.orgId
                );
                return matchesSearch && notAlreadySelected;
              });

              // Combine: selected first, then search results, limit to 9 total
              const displayedCompanies = [
                ...selectedCompanyObjs,
                ...searchResults,
              ].slice(0, 9);

              return (
                <Form.Item name={["companies", "selected"]} noStyle>
                  <Checkbox.Group className={styles.orgCheckboxGroup}>
                    <div className={styles.orgGrid}>
                      {displayedCompanies.map((org) => {
                        const isSelected = selectedCompanies.includes(
                          org.orgId
                        );
                        return (
                          <div
                            key={org._id}
                            className={`${styles.orgCard} ${
                              isSelected ? styles.orgCardSelected : ""
                            }`}
                          >
                            <Checkbox value={org.orgId}>{org.orgName}</Checkbox>
                          </div>
                        );
                      })}
                    </div>
                  </Checkbox.Group>
                </Form.Item>
              );
            }}
          </Form.Item>
        </div>
      ),
    },
  ];

  const columns = [
    {
      title: "User",
      dataIndex: "name",
      key: "user",
      render: (name, record) => {
        const role = record?.role?.toLowerCase();

        return (
          <div className={styles.userCell}>
            <div className={styles.roleIcon}>{roleConfig[role]?.icon}</div>

            <div className={styles.userInfo}>
              <div className={styles.userName}>{name}</div>
              <div className={styles.userEmail}>{record.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      filteredValue: tableParams.filters.email || null,
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 8 }} className={styles.filterDropdown}>
          <Input
            placeholder="Search email"
            value={selectedKeys[0]}
            onChange={(e) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: "block" }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
            >
              Search
            </Button>
            <Button
              onClick={() => {
                clearFilters?.();
                confirm();
              }}
              size="small"
            >
              Reset
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? "#24A058" : undefined }} />
      ),
      onFilter: (value, record) =>
        record.email.toLowerCase().includes(String(value).toLowerCase()),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => {
        const colors = {
          ADMIN: "red",
          MODERATOR: "orange",
          VIEWER: "green",
        };
        return <Tag color={colors[role]}>{role}</Tag>;
      },
      filters: [
        { text: "Admin", value: "ADMIN" },
        { text: "Moderator", value: "MODERATOR" },
        { text: "Viewer", value: "VIEWER" },
      ],
      filteredValue: tableParams.filters.role || null,
      onFilter: (value, record) => record.role === value,
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      filters: [
        { text: "Active", value: "Active" },
        { text: "Inactive", value: "Inactive" },
      ],
      filteredValue: tableParams.filters.status || null,
      render: (isActiveVal, record) =>
        canAccess(PERMISSION_VALUES.MANAGE_USERS) ? (
          <Switch
            checked={!!isActiveVal}
            onChange={(checked) => handleStatusToggle(record.key, checked)}
            checkedChildren="Active"
            unCheckedChildren="Inactive"
          />
        ) : (
          <span>{isActiveVal ? "Active" : "Inactive"}</span>
        ),
      onFilter: (value, record) =>
        value === "Active" ? !!record.isActive : !record.isActive,
    },
    {
      title: "Created",
      dataIndex: "created",
      key: "created",
      sorter: (a, b) => new Date(a.created) - new Date(b.created),
      sortOrder:
        tableParams.sorter.field === "created"
          ? tableParams.sorter.order
          : null,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Tooltip
            title={
              !canAccess(PERMISSION_VALUES.EDIT)
                ? getPermissionMessage(PERMISSION_VALUES.EDIT)
                : ""
            }
          >
            <>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={(e) => {
                  if (!canAccess(PERMISSION_VALUES.EDIT)) {
                    e?.preventDefault();
                    message.info(getPermissionMessage(PERMISSION_VALUES.EDIT));
                    return;
                  }
                  handleEditUser(record);
                }}
                className={styles.editBtn}
                size="small"
                disabled={!canAccess(PERMISSION_VALUES.EDIT)}
              >
                Edit
              </Button>
            </>
          </Tooltip>
          <Tooltip
            title={
              !canAccess(PERMISSION_VALUES.DELETE)
                ? getPermissionMessage(PERMISSION_VALUES.DELETE)
                : ""
            }
          >
            <>
              <Popconfirm
                title="Delete User"
                description="Are you sure you want to delete this user?"
                onConfirm={() => handleDeleteUser(record)}
                okText="Yes"
                cancelText="No"
                okButtonProps={{ danger: true }}
                disabled={!canAccess(PERMISSION_VALUES.DELETE)}
              >
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  size="small"
                  disabled={!canAccess(PERMISSION_VALUES.DELETE)}
                >
                  Delete
                </Button>
              </Popconfirm>
            </>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.userManagement}>
      <div className={styles.header}>
        <h1 className={styles.title}>User Management</h1>
        <div className={styles.headerActions}>
          {activeFilterChips.length > 0 && (
            <div className={styles.activeFilters}>
              {activeFilterChips.map((chip) => (
                <Tag
                  key={chip.key}
                  closable
                  color="blue"
                  onClose={(e) => {
                    e.preventDefault();
                    handleRemoveSingleFilter(chip);
                  }}
                  className={styles.filterTag}
                >
                  {chip.label}
                </Tag>
              ))}
            </div>
          )}
          <Button
            icon={<SyncOutlined />}
            className={styles.refreshBtn}
            onClick={clearAllFilters}
            disabled={!hasActiveFilters}
          >
            Clear Filters
          </Button>
          <Tooltip
            title={
              !accessAll(
                PERMISSION_VALUES.CREATE,
                PERMISSION_VALUES.MANAGE_USERS
              )
                ? getPermissionMessage(PERMISSION_VALUES.CREATE)
                : ""
            }
          >
            <>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                className={styles.addBtn}
                onClick={() => {
                  if (
                    !accessAll(
                      PERMISSION_VALUES.CREATE,
                      PERMISSION_VALUES.MANAGE_USERS
                    )
                  ) {
                    message.info(
                      getPermissionMessage(PERMISSION_VALUES.CREATE)
                    );
                    return;
                  }
                  showModal();
                }}
                disabled={
                  !accessAll(
                    PERMISSION_VALUES.CREATE,
                    PERMISSION_VALUES.MANAGE_USERS
                  )
                }
              >
                Add User
              </Button>
            </>
          </Tooltip>
        </div>
      </div>

      <div className={styles.statsGrid}>
        {stats.map((stat, index) => (
          <div key={index} className={styles.statCard}>
            <div className={styles.statLabel}>{stat.label}</div>
            <div className={styles.statValue}>
              {stat.icon && (
                <span className={styles.statIcon}>{stat.icon}</span>
              )}
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.tableWrapper}>
        <Table
          columns={columns}
          dataSource={processedData}
          onChange={handleTableChange}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total ${total} users`,
            responsive: true,
          }}
          className={styles.userTable}
        />
      </div>

      <Modal
        title={
          <div className={styles.modalHeader}>
            <UserOutlined className={styles.modalIcon} />
            {editingUserKey ? "Edit User" : "Create New User"}
          </div>
        }
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleCreateOrUpdateUser}
          >
            {editingUserKey ? "Update User" : "Create User"}
          </Button>,
        ]}
        width={1000}
        className={styles.userModal}
        destroyOnHidden
        centered
        mask={{ closable: false }}
      >
        <Form
          form={form}
          layout="horizontal"
          labelAlign="left"
          className={styles.userForm}
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            className={styles.modalTabs}
          />
          <PermissionSummary />
        </Form>
      </Modal>
    </div>
  );
}
