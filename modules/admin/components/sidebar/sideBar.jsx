"use client";
import React, { useState, useEffect, useMemo } from "react";
import styles from "./sidebar.module.scss";
import { usePathname, useRouter } from "next/navigation";
import { Button, Menu, App, Tooltip, Spin, Modal } from "antd";
import {
  LogoutOutlined,
  ExclamationCircleOutlined,
  LockOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import {
  clearLstorageVals,
  clearSstorageVals,
  sideBarTitles,
} from "@/utils/windowMW";
import Cookies from "js-cookie";
import { logoutUser } from "@/redux/slices/admin/adminAuthSlice";
import { useDispatch, useSelector } from "react-redux";
import { FaShieldAlt, FaStar, FaEye } from "react-icons/fa";
import { FaCrown } from "react-icons/fa6";
import Image from "next/image";
import lockicon from "@/public/assets/lockicon.png";

const SideBar = ({ activeView, setView }) => {
  const pathName = usePathname();
  const nav = useRouter();
  const dispatch = useDispatch();
  const { modal, message } = App.useApp();
  const [openKeys, setOpenKeys] = useState([]);
  const [loadingPath, setLoadingPath] = useState(null); // Track which button is loading
  const { value, loading } = useSelector((s) => s.adminAuth?.user || {});
  const userDetails = value?.user;
  const userPermissions = userDetails?.permissions || {};

  const roleConfig = {
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

  // Map sidebar paths to permission keys
  const pathToPermissionMap = {
    "/admin/course": "course",
    "/admin/internship": "internship",
    "/admin/practice": "practice",
    "/admin/questionManager": "skill",
    "/admin/workshops": "workshops",
  };

  // Check if user has permission for a path
  const hasPermission = (path) => {
    const permissionKey = pathToPermissionMap[path];
    if (!permissionKey) {
      return true;
    }
    return userPermissions[permissionKey] === true;
  };

  // useEffect(() => {
  //   const parentPath = sideBarTitles.find((item) =>
  //     item.children?.some((child) => pathName.startsWith(child.path))
  //   );
  //   if (parentPath) {
  //     setOpenKeys([parentPath.path]);
  //   } else {
  //     const onParentRoute = sideBarTitles.find(
  //       (item) => item.children && pathName.startsWith(item.path)
  //     );
  //     if (onParentRoute) {
  //       setOpenKeys([onParentRoute.path]);
  //     } else {
  //       setOpenKeys([]);
  //     }
  //   }

  //   // Clear loading when path changes
  //   setLoadingPath(null);
  // }, [pathName]);

  const handleClick = (item) => {
    // Check permission before navigation
    if (!hasPermission(item.path)) {
      message.warning("You don't have permission to access this section");
      return;
    }

    if (typeof setView === "function") {
      setView(item.path);
      return;
    }

    // Set loading state for this specific button
    setLoadingPath(item.path);

    // Navigate
    nav.replace(item?.path);
  };

  const handleMenuClick = ({ key }) => {
    // Find the item to check permission
    const item =
      sideBarTitles.find((i) => i.path === key) ||
      sideBarTitles
        .flatMap((i) => i.children || [])
        .find((c) => c.path === key);

    if (item && !hasPermission(item.path)) {
      message.warning("You don't have permission to access this section");
      return;
    }

    if (typeof setView === "function") {
      setView(key);
      return;
    }

    // Set loading state
    // setLoadingPath(key);

    nav.replace(key);
  };

  const handleOpenChange = (keys) => {
    setOpenKeys(keys);
  };

  const handleTitleClick = ({ key }) => {
    if (!hasPermission(key)) {
      message.warning("You don't have permission to access this section");
      return;
    }

    if (typeof setView === "function") {
      setView(key);
      setOpenKeys([key]);
      return;
    }

    setLoadingPath(key);
    nav.replace(key);
    setOpenKeys([key]);
  };

  const getSelectedKey = () => {
    const pathToCheck = activeView || pathName;
    for (const item of sideBarTitles) {
      if (item.children) {
        for (const child of item.children) {
          if (pathToCheck.startsWith(child.path)) {
            return child.path;
          }
        }
      }
      if (pathToCheck.startsWith(item.path)) {
        return item.path;
      }
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
        setLoadingPath("logout");
        clearLstorageVals();
        clearSstorageVals();
        const result = await dispatch(logoutUser());
        if (result.type === "auth/logoutStudent/fulfilled") {
          dispatch({ type: "RESET_ALL" });
          window.location.href = "/admin/login";
        }
        // setLoadingPath(null);
      },
      onCancel() {
        console.log("Logout cancelled");
      },
    });
  };

  return (
    <div className={styles.sidebarContainer}>
      {/* Fixed Header - User Card */}
      <div className={styles.header}>
        <div className={styles.userCard}>
          {roleConfig?.[userDetails?.role?.toLowerCase()]?.icon}
          <div className={styles.userInfoBlock}>
            <h1 className={styles.role}>{userDetails?.role}</h1>
            <h4 className={styles.fullname}>{userDetails?.fullname}</h4>
          </div>
        </div>
      </div>

      {/* Scrollable Middle - Navigation Links */}
      <div className={styles.topLinksCont}>
        {sideBarTitles.map((item, index) => {
          const isDisabled = !hasPermission(item.path);
          const isLoading = loadingPath === item.path;

          if (item.children) {
            const menuItems = [
              {
                key: item.path,
                label: (
                  <Tooltip
                    title={isDisabled ? "No permission to access" : item.name}
                    placement="right"
                  >
                    <span>
                      {isLoading && (
                        <LoadingOutlined style={{ marginRight: 8 }} />
                      )}
                      {item.name}
                      {isDisabled && (
                        <LockOutlined style={{ marginLeft: 8, fontSize: 18 }} />
                      )}
                    </span>
                  </Tooltip>
                ),
                disabled: isDisabled || isLoading,
                onTitleClick: handleTitleClick,
                children: item.children.map((child) => {
                  const childDisabled = !hasPermission(child.path);
                  const childLoading = loadingPath === child.path;
                  return {
                    key: child.path,
                    label: (
                      <Tooltip
                        title={
                          childDisabled ? "No permission to access" : child.name
                        }
                        placement="right"
                      >
                        <span>
                          {childLoading && (
                            <LoadingOutlined style={{ marginRight: 8 }} />
                          )}
                          {child.name}
                          {childDisabled && (
                            <LockOutlined
                              style={{ marginLeft: 8, fontSize: 12 }}
                            />
                          )}
                        </span>
                      </Tooltip>
                    ),
                    disabled: childDisabled || childLoading,
                  };
                }),
              },
            ];

            return (
              <div key={index} style={{ width: "100%" }}>
                <Menu
                  mode="inline"
                  selectedKeys={[getSelectedKey()]}
                  openKeys={openKeys}
                  onOpenChange={handleOpenChange}
                  onClick={handleMenuClick}
                  items={menuItems}
                  className={styles.menuContainer}
                  style={{ border: "none", background: "transparent" }}
                />
              </div>
            );
          }

          const isActive = (activeView || pathName).startsWith(item.path);
          return (
            <Tooltip
              key={index}
              title={
                isDisabled
                  ? "You don't have permission to access this section"
                  : item.name
              }
              placement="right"
            >
              <Button
                className={`${styles.sidebarButton}`}
                type={isActive ? "primary" : "default"}
                style={{
                  width: "100%",
                  textAlign: "left",
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  border: isActive ? "none" : "1px solid #d9d9d9",
                  padding: "20px 16px",
                }}
                size="middle"
                onClick={() => handleClick(item)}
                disabled={isDisabled}
                onMouseEnter={() => { }}
                // loading={isLoading}
                icon={
                  !isLoading &&
                  isDisabled && (
                    <Image
                      src={lockicon}
                      alt="locked icon"
                      width={26}
                      height={26}
                    />
                  )
                }
              >
                {item.name}
              </Button>
            </Tooltip>
          );
        })}
      </div>

      {/* Fixed Footer - Logout Button */}
      <div className={styles.footer}>
        <Button
          className={styles.logoutBtn}
          type="dashed"
          danger
          icon={<LogoutOutlined />}
          onClick={showLogoutConfirm}
          loading={loadingPath === "logout"}
        >
          Logout
        </Button>
      </div>
    </div>
  );
};

export default SideBar;
