"use client";
import React, { useState, useEffect } from "react";
import styles from "./sidebar.module.scss";
import { usePathname, useRouter } from "next/navigation";
import { Button, Menu, App, Tooltip, Skeleton, Modal, Dropdown } from "antd";
import {
  LogoutOutlined,
  ExclamationCircleOutlined,
  LockOutlined,
  LoadingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import {
  clearLstorageVals,
  clearSstorageVals,
  sideBarTitles,
} from "@/utils/windowMW";
import { logoutUser } from "@/redux/slices/admin/adminAuthSlice";
import { useDispatch, useSelector } from "react-redux";
import { FaShieldAlt, FaStar, FaEye } from "react-icons/fa";
import { FaCrown } from "react-icons/fa6";
import Image from "next/image";
import lockicon from "@/public/assets/lockicon.png";
import { changeCollapse } from "@/redux/slices/sidebar"; 

const SideBar = ({ activeView, setView }) => {
  const pathName = usePathname();
  const nav = useRouter();
  const dispatch = useDispatch();
  const { message } = App.useApp();
  
  const isCollapsed = useSelector((s) => s.sideBar?.collapse);
  
  const [openKeys, setOpenKeys] = useState([]);
  const [loadingPath, setLoadingPath] = useState(null);
  
  const { value, loading } = useSelector((s) => s.adminAuth?.user || {});
  const userDetails = value?.user;
  const userPermissions = userDetails?.permissions || {};

  const roleConfig = {
    admin: {
      icon: <FaCrown style={{ fontSize: "1.2rem" }} color="gold" />,
      color: "gold",
    },
    moderator: {
      icon: <FaShieldAlt style={{ fontSize: "1.2rem", color: "green" }} />,
      color: "green",
    },
    viewer: {
      icon: <FaEye style={{ fontSize: "1.2rem" }} color="gray" />,
      color: "gray",
    },
  };

  const pathToPermissionMap = {
    "/admin/course": "course",
    "/admin/internship": "internship",
    "/admin/practice": "practice",
    "/admin/questionManager": "skill",
    "/admin/workshops": "workshops",
  };

  const hasPermission = (path) => {
    const permissionKey = pathToPermissionMap[path];
    if (!permissionKey) return true;
    return userPermissions[permissionKey] === true;
  };

  const handleMenuClick = ({ key }) => {
    const item =
      sideBarTitles.find((i) => i.path === key) ||
      sideBarTitles.flatMap((i) => i.children || []).find((c) => c.path === key);

    if (item && !hasPermission(item.path)) {
      message.warning("You don't have permission to access this section");
      return;
    }

    if (typeof setView === "function") {
      setView(key);
      return;
    }
    
    nav.push(key);
  };

  const handleOpenChange = (keys) => {
    setOpenKeys(keys);
  };

  const getSelectedKey = () => {
    const pathToCheck = activeView || pathName;
    for (const item of sideBarTitles) {
      if (item.children) {
        for (const child of item.children) {
          if (pathToCheck.startsWith(child.path)) return child.path;
        }
      }
      if (pathToCheck.startsWith(item.path)) return item.path;
    }
    return "";
  };

  const showLogoutConfirm = () => {
    Modal.confirm({
      title: "Are you sure you want to logout?",
      icon: <ExclamationCircleOutlined />,
      content: "You will be redirected to the login page.",
      okText: "Yes, Logout",
      okType: "danger",
      cancelText: "Cancel",
      centered: true,
      onOk: async () => {
        clearLstorageVals();
        clearSstorageVals();
        const result = await dispatch(logoutUser());
        if (result.type === "auth/logoutStudent/fulfilled") {
          dispatch({ type: "RESET_ALL" });
          window.location.href = "/admin/login";
        }
      },
      onCancel() {},
    });
  };

  const userMenuItems = [
    {
      key: "user-info",
      disabled: true,
      style: { cursor: "default", backgroundColor: "transparent" },
      label: (
        <div style={{ padding: "4px 0", color: "#333" }}>
          <strong style={{ display: "block", fontSize: "14px", lineHeight: "1.2" }}>
            {userDetails?.fullname || userDetails?.username || "Admin"}
          </strong>
          <span style={{ fontSize: "12px", color: "#8c8c8c" }}>
            {userDetails?.role || "ADMIN"} • {userDetails?.email || ""}
          </span>
        </div>
      )
    },
    { type: "divider" },
    {
      key: "logout",
      label: <span style={{ color: "#ff4d4f" }}>Logout</span>,
      icon: <LogoutOutlined style={{ color: "#ff4d4f" }} />,
      onClick: showLogoutConfirm
    }
  ];

  const menuItems = sideBarTitles.map((item) => {
    const isDisabled = !hasPermission(item.path);
    
    const menuItem = {
      key: item.path,
      icon: item.icon,
      label: (
        <Tooltip title={isDisabled ? "No permission to access" : item.name} placement="right">
          <span>
            {item.name}
            {isDisabled && <LockOutlined style={{ marginLeft: 8, fontSize: 14 }} />}
          </span>
        </Tooltip>
      ),
      disabled: isDisabled,
    };
    
    if (item.children) {
      menuItem.children = item.children.map((child) => {
        const childDisabled = !hasPermission(child.path);
        return {
          key: child.path,
          icon: child.icon,
          label: (
            <Tooltip title={childDisabled ? "No permission to access" : child.name} placement="right">
              <span>
                {child.name}
                {childDisabled && <LockOutlined style={{ marginLeft: 8, fontSize: 12 }} />}
              </span>
            </Tooltip>
          ),
          disabled: childDisabled,
        };
      });
    }

    return menuItem;
  });

  return (
    <section className={`${styles.sideBarContainer} ${isCollapsed ? styles.collapsedSidebar : styles.expandedSidebar}`}>
      <div className={styles.logoContainer}>
        <img
          src="https://res.cloudinary.com/dug3awue8/image/upload/v1744626297/icon_dtclq9.svg"
          alt="Synsper Logo"
          onClick={() => nav.replace("/admin/dashboard")}
        />
        {!isCollapsed && (
          <div
            className={styles.logoText}
            onClick={() => nav.replace("/admin/dashboard")}
            style={{ flex: 1, paddingRight: '8px' }}
          >
            S K I L L <span> M E D H A</span>
          </div>
        )}
        <div
          onClick={() => dispatch(changeCollapse(!isCollapsed))}
          style={{ cursor: 'pointer', padding: '0 8px', display: 'flex', alignItems: 'center', flexShrink: 0, marginRight: isCollapsed ? '0' : '24px', marginLeft: isCollapsed ? '0' : 'auto' }}
        >
          {isCollapsed ? <MenuUnfoldOutlined style={{ fontSize: '30px', color: '#08334C' }} /> : <MenuFoldOutlined style={{ fontSize: '24px', color: '#08334C' }} />}
        </div>
      </div>

      <div className={styles.scrolltabs}>
        <Menu
          mode="inline"
          theme="light"
          inlineCollapsed={isCollapsed}
          className={styles.styledAntMenu}
          openKeys={openKeys}
          onOpenChange={handleOpenChange}
          selectedKeys={[getSelectedKey()]}
          onClick={handleMenuClick}
          items={menuItems}
        />
      </div>

      <div className={styles.bottom}>
        <div style={{ padding: isCollapsed ? "0" : "0 1rem", display: "flex", justifyContent: "center" }}>
          {loading ? (
            <div className={styles.profilePillSkeleton}>
              <Skeleton.Avatar active size="large" shape="circle" />
              {!isCollapsed && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <Skeleton.Button active size="small" style={{ width: 100, height: 14 }} />
                  <Skeleton.Button active size="small" style={{ width: 140, height: 10 }} />
                </div>
              )}
            </div>
          ) : (
            <Dropdown menu={{ items: userMenuItems }} trigger={["click"]} placement="topLeft">
              <div className={`${styles.profilePill} ${isCollapsed ? styles.collapsedPill : ''}`}>
                <div className={styles.avatar}>
                  {roleConfig?.[userDetails?.role?.toLowerCase()]?.icon || "A"}
                </div>
                {!isCollapsed && (
                  <div className={styles.profileInfo}>
                    <span className={styles.name}>
                      {userDetails?.fullname || userDetails?.username || "Admin"}
                    </span>
                    <span className={styles.email}>
                      {userDetails?.role || "ADMIN"}
                    </span>
                  </div>
                )}
              </div>
            </Dropdown>
          )}
        </div>
      </div>
    </section>
  );
};

export default SideBar;
