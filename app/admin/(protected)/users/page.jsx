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
  message,
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
  BankOutlined,
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
  const router = useRouter();
  const dispatch = useDispatch();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [form] = Form.useForm();
  const { canAccess, getPermissionMessage, accessAll, isAdmin } =
    usePermissions();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("basicInfo");
  const [completedSteps, setCompletedSteps] = useState(["basicInfo"]);
  const [permissionsSubTab, setPermissionsSubTab] = useState("general");
  const [isActive, setIsActive] = useState(true);
  const [editingUserKey, setEditingUserKey] = useState(null);

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteModalData, setDeleteModalData] = useState(null);

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
  const [globalSearch, setGlobalSearch] = useState("");

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
    form.resetFields();
    setIsActive(true);
    setEditingUserKey(null);
    setActiveTab("basicInfo");
    setCompletedSteps(["basicInfo"]);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setActiveTab("basicInfo");
    setCompletedSteps(["basicInfo"]);
    setEditingUserKey(null);
  };

  const handleCreateOrUpdateUser = () => {
    form
      .validateFields()
      .then(() => {
        const values = form.getFieldsValue(true);
        const basicInfo = values.basicInfo || {};

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
        if (info.errorFields && info.errorFields.length > 0) {
          message.error("Please fill in all required fields in the Basic Info tab.");
          setActiveTab("basicInfo");
        }
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
      return Promise.reject("Invalid user id");
    }

    return dispatch(
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
        throw err;
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

    if (globalSearch) {
      const val = globalSearch.toLowerCase();
      data = data.filter((item) => 
        item.name?.toLowerCase().includes(val) ||
        item.username?.toLowerCase().includes(val) ||
        item.email?.toLowerCase().includes(val)
      );
    }

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
    [userData, tableParams, globalSearch]
  );

  const handleStatClick = (type, value) => {
    const newFilters = { ...tableParams.filters };
    if (type === "status") {
      newFilters.status = [value];
      newFilters.role = []; // Clear role when selecting status from top cards
    } else if (type === "role") {
      newFilters.role = [value];
      newFilters.status = []; // Clear status when selecting role
    }
    
    // Maintain email search if it exists
    const finalFilters = {
      status: newFilters.status || [],
      role: newFilters.role || [],
      email: newFilters.email || []
    };

    setTableParams({ ...tableParams, filters: finalFilters });
    updateUrlFromTable(finalFilters, tableParams.sorter);
  };

  const stats = [
    {
      label: "Total Users",
      subtitle: "All registered users",
      value: userData.length,
      icon: <TeamOutlined />,
      iconClass: styles.iconBlue,
      onClick: () => {
        setTableParams({ ...tableParams, filters: {} });
        updateUrlFromTable({}, tableParams.sorter);
      },
    },
    {
      label: "Active Users",
      subtitle: "Currently active",
      value: userData.filter((u) => u.isActive).length,
      icon: <CheckCircleOutlined />,
      iconClass: styles.iconGreen,
      onClick: () => handleStatClick("status", "Active"),
    },
    {
      label: "Admins",
      subtitle: "Full access users",
      value: userData.filter((u) => u.role === "ADMIN").length,
      icon: <CrownOutlined />,
      iconClass: styles.iconPurple,
      onClick: () => handleStatClick("role", "ADMIN"),
    },
    {
      label: "Moderators",
      subtitle: "Content moderators",
      value: userData.filter((u) => u.role === "MODERATOR").length,
      icon: <BsShield />,
      iconClass: styles.iconOrange,
      onClick: () => handleStatClick("role", "MODERATOR"),
    },
    {
      label: "Viewers",
      subtitle: "Content viewers",
      value: userData.filter((u) => u.role === "VIEWER").length,
      icon: <EyeOutlined />,
      iconClass: styles.iconBlue,
      onClick: () => handleStatClick("role", "VIEWER"),
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
          workshops: "Workshops Library",
        };
        const activeSections = Object.keys(sections).filter((k) => sections[k]);

        const renderTags = (items, colorClass, labelMap = null) => {
          if (!items || items.length === 0) return <div className={styles.summaryTagsCustom}></div>;
          const max = 2;
          const visible = items.slice(0, max);
          const hidden = items.slice(max);
          
          return (
            <div className={styles.summaryTagsCustom}>
              {visible.map((item) => (
                <Tag key={item} className={colorClass}>
                  {labelMap ? labelMap[item] || item : item}
                </Tag>
              ))}
              {hidden.length > 0 && (
                <Tooltip title={hidden.map(h => labelMap ? labelMap[h] || h : h).join(", ")}>
                  <Tag className={colorClass} style={{ cursor: 'pointer' }}>+{hidden.length}</Tag>
                </Tooltip>
              )}
            </div>
          );
        };

        return (
          <div className={styles.permissionSummaryCustom}>
            <div className={styles.summaryHeaderCustom}>
              <SafetyOutlined className={styles.summaryIconCustom} />
              <h3>Permissions Summary</h3>
            </div>
            <div className={styles.summaryGridCustom}>
              <div className={styles.summaryItemCustom}>
                <span className={styles.summaryLabelCustom}>General Permissions</span>
                <span className={styles.summaryValueCustom}>{permissions.length} granted</span>
                {renderTags(permissions, styles.customTagBlue)}
              </div>
              <div className={styles.summaryItemCustom}>
                <span className={styles.summaryLabelCustom}>Section Access</span>
                <span className={styles.summaryValueCustom}>{activeSections.length} enabled</span>
                {renderTags(activeSections, styles.customTagGreen, sectionNames)}
              </div>
              <div className={styles.summaryItemCustom}>
                <span className={styles.summaryLabelCustom}>Colleges</span>
                <span className={styles.summaryValueCustom}>{selectedColleges.length} selected</span>
              </div>
              <div className={styles.summaryItemCustom}>
                <span className={styles.summaryLabelCustom}>Companies</span>
                <span className={styles.summaryValueCustom}>{selectedCompanies.length} selected</span>
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
        <div className={styles.tabContentCustom}>
          <Form.Item
            label={<span className={styles.customLabel}>Full Name</span>}
            name={["basicInfo", "fullName"]}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            rules={[{ required: true, message: "Please enter full name" }]}
            className={styles.customFormItem}
          >
            <Input
              prefix={<UserOutlined style={{ color: "#94a3b8" }} />}
              placeholder="Enter full name"
              size="large"
              className={styles.customInput}
            />
          </Form.Item>

          <Form.Item
            label={<span className={styles.customLabel}>Username</span>}
            name={["basicInfo", "username"]}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            rules={[{ required: true, message: "Please enter username" }]}
            className={styles.customFormItem}
          >
            <Input
              prefix={<UserOutlined style={{ color: "#94a3b8" }} />}
              placeholder="Enter username"
              size="large"
              className={styles.customInput}
            />
          </Form.Item>

          <Form.Item
            label={<span className={styles.customLabel}>Email Address</span>}
            name={["basicInfo", "email"]}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            rules={[
              { required: true, message: "Please enter email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
            className={styles.customFormItem}
          >
            <Input
              prefix={<MailOutlined style={{ color: "#94a3b8" }} />}
              placeholder="Enter email address"
              size="large"
              className={styles.customInput}
            />
          </Form.Item>

          <Form.Item
            label={<span className={styles.customLabel}>Password</span>}
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
            className={styles.customFormItem}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#94a3b8" }} />}
              placeholder={
                editingUserKey
                  ? "Enter new password (optional)"
                  : "Enter password"
              }
              size="large"
              className={styles.customInput}
              iconRender={(visible) =>
                visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          <Form.Item
            label={<span className={styles.customLabel}>User Role</span>}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            className={styles.customFormItem}
            required
          >
            <div className={styles.selectWithPrefix}>
              <SafetyOutlined className={styles.selectPrefixIcon} />
              <Form.Item
                name={["basicInfo", "role"]}
                rules={[{ required: true, message: "Please select a role" }]}
                style={{ margin: 0 }}
              >
                <Select placeholder="Select user role" size="large" className={styles.customSelect}>
                  <Select.Option value="ADMIN">Admin</Select.Option>
                  <Select.Option value="MODERATOR">Moderator</Select.Option>
                  <Select.Option value="VIEWER">Viewer</Select.Option>
                </Select>
              </Form.Item>
            </div>
          </Form.Item>

          <Form.Item
            label={<span className={styles.customLabel}>Status</span>}
            name={["basicInfo", "isActive"]}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            valuePropName="checked"
            className={styles.customFormItem}
          >
            <div className={styles.switchWrapper}>
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
              />
              <span className={styles.switchLabel}>{isActive ? "Active" : "Inactive"}</span>
            </div>
          </Form.Item>
        </div>
      ),
    },
    {
      key: "permissions",
      label: "Permissions",
      children: (
        <div className={styles.tabContentCustom}>
          <div className={styles.pillTabsContainer}>
            <div 
              className={`${styles.pillTab} ${permissionsSubTab === "general" ? styles.pillTabActive : ""}`}
              onClick={() => setPermissionsSubTab("general")}
            >
              <SafetyOutlined className={styles.pillIcon} /> General Permissions
            </div>
            <div 
              className={`${styles.pillTab} ${permissionsSubTab === "sections" ? styles.pillTabActive : ""}`}
              onClick={() => setPermissionsSubTab("sections")}
            >
              <span className={styles.pillIcon}>🗂</span> Section Permissions
            </div>
          </div>

          <div className={styles.permissionSectionCustom}>
            {permissionsSubTab === "general" && (
              <>
                <div className={styles.sectionHeaderCustom}>
                  <h3>Select General Permissions</h3>
                  <p>Choose what this user will be able to access and manage.</p>
                </div>
                
                <Form.Item name={["permissions", "general"]} noStyle>
                  <Checkbox.Group className={styles.customCardGroup}>
                    <div className={styles.cardGrid}>
                      {[
                        { value: PERMISSION_VALUES.CREATE, icon: <span className={styles.cIcon}>📝</span>, title: "Create Content", desc: "Allow user to create new content" },
                        { value: PERMISSION_VALUES.EDIT, icon: <EditOutlined className={styles.cIcon} />, title: "Edit Content", desc: "Allow user to edit existing content" },
                        { value: PERMISSION_VALUES.DELETE, icon: <DeleteOutlined className={styles.cIcon} style={{color: '#3b82f6'}} />, title: "Delete Content", desc: "Allow user to delete content" },
                        { value: PERMISSION_VALUES.PUBLISH, icon: <span className={styles.cIcon}>📤</span>, title: "Publish Content", desc: "Allow user to publish/unpublish content" },
                        { value: PERMISSION_VALUES.MANAGE_USERS, icon: <TeamOutlined className={styles.cIcon} />, title: "Manage Users", desc: "Allow user to manage other users" },
                      ].map(item => (
                        <label key={item.value} className={styles.customSelectCard}>
                          <div className={styles.cardIconWrapper}>
                            {item.icon}
                          </div>
                          <div className={styles.cardTextContent}>
                            <h4 className={styles.cardTitle}>{item.title}</h4>
                            <p className={styles.cardDesc}>{item.desc}</p>
                          </div>
                          <Checkbox value={item.value} className={styles.cardCheckbox} />
                        </label>
                      ))}
                    </div>
                  </Checkbox.Group>
                </Form.Item>
              </>
            )}

            {permissionsSubTab === "sections" && (
              <>
                <div className={styles.sectionHeaderCustom}>
                  <h3>Select Section Access</h3>
                  <p>Choose which sections of the platform this user can access.</p>
                </div>
                
                <div className={styles.cardGrid}>
                  {[
                    { name: ["permissions", "sections", "course"], icon: <span className={styles.cIcon}>📚</span>, title: "Course Library", desc: "Access to course management" },
                    { name: ["permissions", "sections", "internship"], icon: <span className={styles.cIcon}>💼</span>, title: "Internship Library", desc: "Access to internship management" },
                    { name: ["permissions", "sections", "practice"], icon: <span className={styles.cIcon}>🎯</span>, title: "Practice Questions", desc: "Access to question practice portal" },
                    { name: ["permissions", "sections", "skill"], icon: <span className={styles.cIcon}>⚡</span>, title: "Skill Library", desc: "Access to skill/question manager" },
                    { name: ["permissions", "sections", "workshops"], icon: <span className={styles.cIcon}>🎪</span>, title: "Workshops Library", desc: "Access to workshops management" },
                  ].map(item => (
                    <Form.Item key={item.title} name={item.name} valuePropName="checked" noStyle>
                      <Checkbox style={{ display: 'none' }} />
                      {/* Fake label block to trigger the hidden checkbox... Wait, noStyle means we can render the Checkbox directly. */}
                      <label className={styles.customSelectCard}>
                          <div className={styles.cardIconWrapper}>
                            {item.icon}
                          </div>
                          <div className={styles.cardTextContent}>
                            <h4 className={styles.cardTitle}>{item.title}</h4>
                            <p className={styles.cardDesc}>{item.desc}</p>
                          </div>
                          <Form.Item name={item.name} valuePropName="checked" noStyle>
                            <Checkbox className={styles.cardCheckbox} />
                          </Form.Item>
                      </label>
                    </Form.Item>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      ),
    },

    // For COLLEGES tab:
    {
      key: "colleges",
      label: "Colleges",
      children: (
        <div className={styles.tabContentCustom}>
          <div className={styles.orgHeaderRowCustom}>
            <div className={styles.sectionHeaderCustom} style={{ marginBottom: 0 }}>
              <h3>Select Colleges</h3>
              <p>Choose which colleges this user can access.</p>
            </div>

            <Input
              allowClear
              size="large"
              placeholder="Search colleges"
              className={styles.orgSearchCustom}
              value={collegeSearch}
              prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
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

              // Combine: selected first, then search results
              const displayedColleges = [
                ...selectedCollegeObjs,
                ...searchResults,
              ];

              return (
                <Form.Item name={["colleges", "selected"]} noStyle>
                  <Checkbox.Group className={styles.customCardGroup}>
                    <div className={styles.cardGrid}>
                      {displayedColleges.map((org) => {
                        const isSelected = selectedColleges.includes(org.orgId);
                        return (
                          <label
                            key={org._id}
                            className={styles.customSelectCard}
                          >
                            <div className={styles.cardIconWrapper} style={{ backgroundColor: "#f1f5f9" }}>
                              <BankOutlined className={styles.cIcon} style={{ color: "#64748b" }} />
                            </div>
                            <div className={styles.cardTextContent}>
                              <h4 className={styles.cardTitle}>{org.orgName}</h4>
                              <p className={styles.cardDesc}>College Institution</p>
                            </div>
                            <Checkbox value={org.orgId} className={styles.cardCheckbox} />
                          </label>
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
        <div className={styles.tabContentCustom}>
          <div className={styles.orgHeaderRowCustom}>
            <div className={styles.sectionHeaderCustom} style={{ marginBottom: 0 }}>
              <h3>Select Companies</h3>
              <p>Choose which companies this user can access.</p>
            </div>

            <Input
              allowClear
              size="large"
              placeholder="Search companies"
              className={styles.orgSearchCustom}
              value={companySearch}
              prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
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

              // Combine: selected first, then search results
              const displayedCompanies = [
                ...selectedCompanyObjs,
                ...searchResults,
              ];

              return (
                <Form.Item name={["companies", "selected"]} noStyle>
                  <Checkbox.Group className={styles.customCardGroup}>
                    <div className={styles.cardGrid}>
                      {displayedCompanies.map((org) => {
                        const isSelected = selectedCompanies.includes(
                          org.orgId
                        );
                        return (
                          <label
                            key={org._id}
                            className={styles.customSelectCard}
                          >
                            <div className={styles.cardIconWrapper} style={{ backgroundColor: "#f1f5f9" }}>
                              <TeamOutlined className={styles.cIcon} style={{ color: "#64748b" }} />
                            </div>
                            <div className={styles.cardTextContent}>
                              <h4 className={styles.cardTitle}>{org.orgName}</h4>
                              <p className={styles.cardDesc}>Corporate Partner</p>
                            </div>
                            <Checkbox value={org.orgId} className={styles.cardCheckbox} />
                          </label>
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
        <SearchOutlined style={{ color: filtered ? "#1E69DA" : undefined }} />
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
          <Tooltip title={isActiveVal ? "Active" : "Deactivated"}>
            <Popconfirm
              title={isActiveVal ? "Deactivate User" : "Activate User"}
              description={`Are you sure you want to ${
                isActiveVal ? "deactivate" : "activate"
              } this user?`}
              onConfirm={() => handleStatusToggle(record.key, !isActiveVal)}
              okText="Yes"
              cancelText="No"
              okButtonProps={{ danger: isActiveVal }}
            >
              <div style={{ display: "inline-block", cursor: "pointer" }} onClick={(e) => e.stopPropagation()}>
                <Switch
                  checked={!!isActiveVal}
                  checkedChildren="Active"
                  unCheckedChildren="Inactive"
                  style={{ pointerEvents: "none" }}
                />
              </div>
            </Popconfirm>
          </Tooltip>
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
              <Button
                danger
                icon={<DeleteOutlined />}
                size="small"
                disabled={!canAccess(PERMISSION_VALUES.DELETE)}
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteModalData(record);
                  setDeleteModal(true);
                }}
              >
                Delete
              </Button>
            </>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.userManagement}>
      <div className={styles.header}>
        <Input
          placeholder="Search by name, username, or email..."
          prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
          className={styles.mainSearchInput}
          allowClear
        />
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
          <div key={index} className={styles.statCard} onClick={stat.onClick}>
            <div className={`${styles.statIconWrapper} ${stat.iconClass}`}>
              {stat.icon}
            </div>
            <div className={styles.statContent}>
              <div className={styles.statLabel}>{stat.label}</div>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statSubtitle}>{stat.subtitle}</div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.tableWrapper}>
        <Table
          columns={columns}
          dataSource={processedData}
          onChange={handleTableChange}
          pagination={false}
          className={styles.userTable}
          sticky={true}
        />
      </div>

      <Modal
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={1150}
        className={styles.userModal}
        destroyOnHidden
        centered
        mask={{ closable: false }}
        closeIcon={<span className={styles.closeIcon}>✕</span>}
      >
        <div className={styles.modalHeaderCustom}>
          <div className={styles.headerTitleRow}>
            <div className={styles.headerIconWrapper}>
              <UserOutlined />
            </div>
            <div>
              <h2 className={styles.headerTitle}>
                {editingUserKey ? "Edit User" : "Create New User"}
              </h2>
              <p className={styles.headerSubtitle}>
                {editingUserKey ? "Update user details and permissions" : "Add a new user to your platform"}
              </p>
            </div>
          </div>
          
          <div className={styles.stepperContainer}>
            {(() => {
              const allSteps = [
                { key: "basicInfo", label: "Basic Info", icon: <UserOutlined /> },
                { key: "permissions", label: "Permissions", icon: <SafetyOutlined /> },
                { key: "colleges", label: "Colleges", icon: <BankOutlined /> },
                { key: "companies", label: "Companies", icon: <TeamOutlined /> },
              ];
              if (activeTab === "review" || completedSteps.includes("review")) {
                allSteps.push({ key: "review", label: "Review & Create", icon: <CheckCircleOutlined /> });
              }

              return allSteps.map((step, idx) => {
                const isActiveStep = activeTab === step.key;
                const isCompleted = completedSteps.includes(step.key) && !isActiveStep;
                
                return (
                  <div key={step.key} className={styles.stepItemWrapper}>
                    <div 
                      className={`${styles.stepItem} ${isActiveStep ? styles.stepActive : ""} ${isCompleted ? styles.stepCompleted : ""}`}
                      onClick={() => {
                        // Allow navigating back to completed steps
                        if (completedSteps.includes(step.key)) {
                          setActiveTab(step.key);
                        }
                      }}
                    >
                      <span className={styles.stepIcon}>
                        {isCompleted ? <CheckCircleOutlined /> : step.icon}
                      </span>
                      <span className={styles.stepLabel}>{step.label}</span>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        <Form
          form={form}
          layout="horizontal"
          labelAlign="left"
          className={styles.userForm}
        >
          <div className={styles.formContentWrapper}>
            {tabItems.find((t) => t.key === activeTab)?.children}
            {activeTab === "review" && (
              <div className={styles.reviewTabContent}>
                <div className={styles.reviewHeader}>
                  <div className={styles.successIconWrapper}>
                    <CheckCircleOutlined />
                  </div>
                  <h3>Review & Create</h3>
                  <p>Please review the information below and click "Create User" to finish.</p>
                </div>
                
                <div className={styles.reviewGrid}>
                  <div className={styles.reviewCol}>
                    <div className={styles.reviewItem}>
                      <UserOutlined className={styles.rIcon} />
                      <span className={styles.rLabel}>Full Name</span>
                      <span className={styles.rValue}>{form.getFieldValue(["basicInfo", "fullName"])}</span>
                    </div>
                    <div className={styles.reviewItem}>
                      <UserOutlined className={styles.rIcon} />
                      <span className={styles.rLabel}>Username</span>
                      <span className={styles.rValue}>{form.getFieldValue(["basicInfo", "username"])}</span>
                    </div>
                    <div className={styles.reviewItem}>
                      <MailOutlined className={styles.rIcon} />
                      <span className={styles.rLabel}>Email Address</span>
                      <span className={styles.rValue}>{form.getFieldValue(["basicInfo", "email"])}</span>
                    </div>
                    <div className={styles.reviewItem}>
                      <SafetyOutlined className={styles.rIcon} />
                      <span className={styles.rLabel}>User Role</span>
                      <span className={styles.rRoleBadge}>{form.getFieldValue(["basicInfo", "role"])}</span>
                    </div>
                    <div className={styles.reviewItem}>
                      <Switch size="small" checked={form.getFieldValue(["basicInfo", "isActive"])} />
                      <span className={styles.rLabel}>Status</span>
                      <span className={styles.rStatusBadge}>{form.getFieldValue(["basicInfo", "isActive"]) ? "Active" : "Inactive"}</span>
                    </div>
                  </div>
                  
                  <div className={styles.reviewCol}>
                    <div className={styles.reviewItem}>
                      <SafetyOutlined className={styles.rIcon} />
                      <span className={styles.rLabel}>General Permissions</span>
                      <span className={styles.rValueBlack}>{form.getFieldValue(["permissions", "general"])?.length || 0} granted</span>
                    </div>
                    <div className={styles.reviewItem}>
                      <span className={styles.rIcon}>🗂</span>
                      <span className={styles.rLabel}>Section Access</span>
                      <span className={styles.rValueBlack}>{
                        ["course", "internship", "practice", "skill", "workshops"].filter(
                          (sec) => form.getFieldValue(["permissions", "sections", sec])
                        ).length
                      } enabled</span>
                    </div>
                    <div className={styles.reviewItem}>
                      <BankOutlined className={styles.rIcon} />
                      <span className={styles.rLabel}>Colleges</span>
                      <span className={styles.rValueBlack}>{form.getFieldValue(["colleges", "selected"])?.length || 0} selected</span>
                    </div>
                    <div className={styles.reviewItem}>
                      <TeamOutlined className={styles.rIcon} />
                      <span className={styles.rLabel}>Companies</span>
                      <span className={styles.rValueBlack}>{form.getFieldValue(["companies", "selected"])?.length || 0} selected</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Permission Summary sticky box only for non-review steps */}
          {activeTab !== "review" && (
            <div className={styles.stickySummaryWrapper}>
               <PermissionSummary />
            </div>
          )}

          <div className={styles.modalFooterCustom}>
             <div className={styles.footerLeft}>
               {activeTab !== "basicInfo" && (
                 <Button 
                   onClick={() => {
                     const steps = ["basicInfo", "permissions", "colleges", "companies", "review"];
                     const prevStep = steps[steps.indexOf(activeTab) - 1];
                     if (prevStep) setActiveTab(prevStep);
                   }}
                   icon={<span style={{ marginRight: 8 }}>&larr;</span>}
                 >
                   Back
                 </Button>
               )}
             </div>
             
             <div className={styles.footerRight}>
               <Button onClick={handleCancel} className={styles.cancelBtn}>Cancel</Button>
               
               {activeTab === "basicInfo" && (
                 <Button type="primary" onClick={async () => {
                   try {
                     await form.validateFields([
                       ["basicInfo", "fullName"],
                       ["basicInfo", "username"],
                       ["basicInfo", "email"],
                       ["basicInfo", "password"],
                       ["basicInfo", "role"]
                     ]);
                     setCompletedSteps(prev => [...new Set([...prev, "permissions"])]);
                     setActiveTab("permissions");
                   } catch(e) { /* validation failed */ }
                 }}>Next: Permissions &rarr;</Button>
               )}

               {activeTab === "permissions" && (
                 <Button type="primary" onClick={() => {
                   setCompletedSteps(prev => [...new Set([...prev, "colleges"])]);
                   setActiveTab("colleges");
                 }}>Next: Colleges &rarr;</Button>
               )}

               {activeTab === "colleges" && (
                 <Button type="primary" onClick={() => {
                   setCompletedSteps(prev => [...new Set([...prev, "companies"])]);
                   setActiveTab("companies");
                 }}>Next: Companies &rarr;</Button>
               )}

               {activeTab === "companies" && (
                 <Button type="primary" onClick={() => {
                   setCompletedSteps(prev => [...new Set([...prev, "review"])]);
                   setActiveTab("review");
                 }}>Review & Create &rarr;</Button>
               )}

               {activeTab === "review" && (
                 <Button type="primary" onClick={handleCreateOrUpdateUser} icon={<CheckCircleOutlined />}>
                   {editingUserKey ? "Update User" : "Create User"}
                 </Button>
               )}
             </div>
          </div>
        </Form>
      </Modal>

      <Modal
        title={"Delete User"}
        open={deleteModal}
        onOk={() => {
          const userId = deleteModalData?._id || deleteModalData?.id;
          if (!userId) return;
          
          dispatch(deleteAdminUser(userId))
            .then(() => {
              message.success("User Deleted Successfully");
              dispatch(getAllAdminUsers());
              setDeleteModal(false);
            })
            .catch((err) => {
              console.error("Failed to delete user:", err);
            });
        }}
        onCancel={() => setDeleteModal(false)}
        mask={{ closable: false }}
        okText={"Delete"}
        okButtonProps={{ danger: true }}
        cancelText="Cancel"
        width={500}
      >
        <h4>Are you sure you want to delete this user?</h4>
        <p style={{ color: "#ff4d4f", marginTop: "10px" }}>
          <strong>Warning:</strong> If you delete this user, it will be removed entirely and cannot be recovered.
        </p>
      </Modal>
    </div>
  );
}
