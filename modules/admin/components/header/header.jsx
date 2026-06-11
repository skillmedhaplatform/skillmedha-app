"use client";
import React from "react";
import styles from "./header.module.scss";
import bannerBase from "@/components/shared/styles/bannerBase.module.scss";
import { usePathname, useParams, useRouter } from "next/navigation";
import { App, Button, Skeleton, Tooltip, Dropdown, Modal } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { roleConfig } from "@/app/admin/(protected)/users/page";
import { MdLogout } from "react-icons/md";
import { LogoutOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { clearLstorageVals, clearSstorageVals } from "@/utils/windowMW";
import { logoutUser } from "@/redux/slices/admin/adminAuthSlice";

const Header = () => {
  const { message, notification, modal } = App.useApp();
  const path = usePathname();
  const params = useParams();
  const nav = useRouter();
  const dispatch = useDispatch();

  const { value, loading } = useSelector((s) => s.adminAuth?.user || {});
  const userDetails = value?.user;

  const displayName = userDetails?.fullname || userDetails?.username || "User";

  const initials = displayName
    ?.split(" ")
    ?.map((word, i) => (i < 2 ? word[0]?.toUpperCase() : ""))
    ?.join("");

  const roleLabel = userDetails?.role || "USER";
  const emailLabel = userDetails?.email || "";
  const role = userDetails?.role?.toLowerCase();
  const goHome = () => nav.replace("/");

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
          window.location.href = "/admin/login";
        }
      },
      onCancel() {
        console.log("Logout cancelled");
      },
    });
  };

  const menuItems = [
    {
      key: "logout",
      label: "Logout",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: showLogoutConfirm,
    },
  ];

  return (
    <div className={`${bannerBase.bannerBase} ${styles.headerContainer}`}>
      {/* LEFT: Logo */}
      <div className={styles.icon} onClick={goHome}>
        <img
          src="https://res.cloudinary.com/dug3awue8/image/upload/v1744626297/icon_dtclq9.svg"
          alt="Synsper Logo"
          className={styles.logoImg}
        />
        <div className={styles.logoText}>
          S K I L L <span>M E D H A</span>
        </div>
      </div>

      {/* RIGHT: User section with loading state */}
      <div className={styles.credsCon}>
        {loading ? (
          <div className={styles.userSkeleton}>
            <div className={styles.userInfo}>
              <Skeleton.Input
                active
                size="small"
                style={{ width: 140, marginBottom: 4 }}
              />
              <Skeleton.Input active size="small" style={{ width: 200 }} />
            </div>
            <Skeleton.Avatar active size="large" shape="circle" />
          </div>
        ) : (
          <Dropdown
            menu={{ items: menuItems }}
            placement="bottomRight"
            trigger={["click"]}
          >
            <div className={styles.userBlock} style={{ cursor: "pointer" }}>
              <div className={styles.userInfo}>
                <p className={styles.userName}>{displayName?.toUpperCase()}</p>
                <p className={styles.userMeta}>
                  {roleLabel}
                  {emailLabel ? ` • ${emailLabel}` : ""}
                </p>
              </div>
              <span className={styles.avatar}>{roleConfig[role]?.icon}</span>
            </div>
          </Dropdown>
        )}
      </div>
    </div>
  );
};

export default Header;
