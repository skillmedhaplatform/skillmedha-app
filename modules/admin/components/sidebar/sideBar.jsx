"use client";
import React, { useState, useEffect, useRef } from "react";
import styles from "./sidebar.module.scss";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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

const SideBar = ({ activeView, setView, isMobile }) => {
  const pathName = usePathname();
  const nav = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { message } = App.useApp();
  
  const isCollapsed = useSelector((s) => s.sideBar?.collapse);
  
  const [openKeys, setOpenKeys] = useState([]);
  const [loadingPath, setLoadingPath] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // The sidebar only ever toggles between 270px (expanded) and 75px
  // (collapsed) — there's no automatic breakpoint, so on tablet/mobile
  // widths the expanded sidebar eats most of the viewport and squeezes
  // every admin page's content into an unusably narrow strip. Follow the
  // viewport automatically (collapse below 992px, expand back above it)
  // UNLESS the user has explicitly clicked the toggle button, in which case
  // their manual choice wins regardless of viewport width.
  const userToggledRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 992px)");
    const followViewport = (matches) => {
      if (userToggledRef.current) return;
      dispatch(changeCollapse(matches));
    };
    followViewport(mq.matches);
    const handler = (e) => followViewport(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [dispatch]);

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
    
    // Explicit override for organization details
    if (pathToCheck.includes("/admin/organisationDetails")) {
      const type = searchParams.get("type");
      if (type === "company") return "/admin/companies";
      return "/admin/colleges";
    }
    
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

  const effectiveCollapsed = isMobile ? false : isCollapsed;

  return (
    <section className={`${styles.sideBarContainer} ${effectiveCollapsed ? styles.collapsedSidebar : styles.expandedSidebar}`} style={isMobile ? { width: '100%', minWidth: '100%' } : {}}>
      {!isMobile && (
        <div className={styles.logoContainer}>
          <img
            src="https://res.cloudinary.com/dug3awue8/image/upload/v1744626297/icon_dtclq9.svg"
            alt="Synsper Logo"
            onClick={() => nav.replace("/admin/dashboard")}
          />
          {!effectiveCollapsed && (
            <div
              className={styles.logoText}
              onClick={() => nav.replace("/admin/dashboard")}
              style={{ flex: 1, paddingRight: '8px' }}
            >
              S K I L L <span> M E D H A</span>
            </div>
          )}
          <div
            onClick={() => {
              userToggledRef.current = true;
              dispatch(changeCollapse(!isCollapsed));
            }}
            style={{ cursor: 'pointer', padding: '0 8px', display: 'flex', alignItems: 'center', flexShrink: 0, marginRight: effectiveCollapsed ? '0' : '24px', marginLeft: effectiveCollapsed ? '0' : 'auto' }}
          >
            {effectiveCollapsed ? <MenuUnfoldOutlined style={{ fontSize: '30px', color: '#08334C' }} /> : <MenuFoldOutlined style={{ fontSize: '24px', color: '#08334C' }} />}
          </div>
        </div>
      )}

      <div className={styles.scrolltabs}>
        <Menu
          mode="inline"
          theme="light"
          inlineCollapsed={effectiveCollapsed}
          className={styles.styledAntMenu}
          openKeys={openKeys}
          onOpenChange={handleOpenChange}
          selectedKeys={[getSelectedKey()]}
          onClick={handleMenuClick}
          items={menuItems}
        />
      </div>

      <div className={styles.bottom}>
        <div style={{ padding: effectiveCollapsed ? "0" : "0 1rem", display: "flex", justifyContent: "center" }}>
          {!mounted || loading ? (
            <div className={styles.profilePillSkeleton}>
              <Skeleton.Avatar active size="large" shape="circle" />
              {!effectiveCollapsed && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <Skeleton.Button active size="small" style={{ width: 100, height: 14 }} />
                  <Skeleton.Button active size="small" style={{ width: 140, height: 10 }} />
                </div>
              )}
            </div>
          ) : (
            <Dropdown menu={{ items: userMenuItems }} trigger={["click"]} placement="topLeft">
              <div className={`${styles.profilePill} ${effectiveCollapsed ? styles.collapsedPill : ''}`}>
                <div className={styles.avatar}>
                  {roleConfig?.[userDetails?.role?.toLowerCase()]?.icon || "A"}
                </div>
                {!effectiveCollapsed && (
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
