"use client";
import React, { useEffect, useState } from "react";
import headerStyles from "./styles/header.module.scss";
import { useParams, usePathname } from "next/navigation";
import { useRouter } from "@bprogress/next/app";
import { useSelector } from "react-redux";
import { Badge, Button, Dropdown, Menu, message, Alert, Tooltip, Skeleton, Modal } from "antd";
import Image from "next/image";
import { clearLstorageVals, getLstorage } from "@/universalUtils/windowMW";
import { imgUrls } from "@/universalUtils/images";
import { useDispatch } from "react-redux";
import { getStudentCreds, resetStudent, resendVerifyEmail } from "@/redux/slices/student";
import axios from "axios";
import { studentUrl } from "@/universalUtils/urls";
import { IoIosNotificationsOutline } from "react-icons/io";
import { FaChevronDown } from "react-icons/fa";
import { ExclamationCircleFilled, MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import Cookies from "js-cookie";
import useSpecialOrg from "@/helpers/useSpecialOrg";
import { changeCollapse } from "@/redux/slices/sidebar";
import useLogout from "@/helpers/useLogout";

const Header = ({ isHeaderVisible }) => {
  const { isSpecialOrg, student: studentCreds } = useSpecialOrg();
  const [isVerifyExpanded, setIsVerifyExpanded] = useState(true);
  const isCollapsed = useSelector((s) => s?.sideBar?.collapse);

  const path = usePathname();
  const params = useParams();

  const isLoadingUser = !studentCreds || Object.keys(studentCreds).length === 0;

  const dispatch = useDispatch();
  const nav = useRouter();
  const handleLogout = useLogout();

  const token = getLstorage("token");
  useEffect(() => {
    if (!token || ["null", "undefined", ""].includes(token)) {
      clearLstorageVals();
      nav.replace("/login");
      return;
    }
  }, [token, studentCreds]);
  const notifications = [
    { id: 1, message: "New message received", time: "2 minutes ago" },
    { id: 2, message: "Task completed successfully", time: "1 hour ago" },
    { id: 3, message: "Meeting reminder", time: "3 hours ago" },
  ];

  const notificationMenu = (
    <Menu style={{ width: 300, maxHeight: 400, overflowY: "auto" }}>
      <Menu.ItemGroup title="Notifications">
        {notifications.map((notification) => (
          <Menu.Item key={notification.id}>
            <div style={{ padding: "8px 0" }}>
              <div style={{ fontSize: "14px", marginBottom: "4px" }}>
                {notification.message}
              </div>
              <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                {notification.time}
              </div>
            </div>
          </Menu.Item>
        ))}
      </Menu.ItemGroup>
      <Menu.Divider />
      <Menu.Item key="view-all">
        <div style={{ textAlign: "center", color: "#1890ff" }}>
          View All Notifications
        </div>
      </Menu.Item>
    </Menu>
  );

  const userMenuItems = [
    {
      key: "user-info",
      disabled: true,
      style: { cursor: "default", backgroundColor: "transparent" },
      label: (
        <div style={{ padding: "4px 0", color: "#333" }}>
          <strong style={{ display: "block", fontSize: "14px", lineHeight: "1.2" }}>
            {studentCreds?.userName || "User"}
          </strong>
          <span style={{ fontSize: "12px", color: "#8c8c8c" }}>
            {studentCreds?.email || studentCreds?.phone || "Student Account"}
          </span>
        </div>
      )
    },
    { type: "divider" },
    ...(!isSpecialOrg ? [{
      key: "profile",
      label: "View More Info",
      onClick: () => nav.push("/student/profile/basic-details")
    }] : []),
    {
      key: "logout",
      label: <span style={{ color: "#ff4d4f" }}>Logout</span>,
      onClick: handleLogout
    }
  ];

  const showVerifyAlert = !isLoadingUser && !studentCreds?.verified && !isSpecialOrg;

  if (!showVerifyAlert) {
    return null;
  }

  return (
    <div className={`${headerStyles.headerContainer} ${isHeaderVisible ? headerStyles.headerVisible : headerStyles.headerHidden}`}>

      {/* Banner */}
      {isVerifyExpanded && (
        <div
          style={{
            transition: "all 0.3s ease",
            overflow: "hidden",
          }}
        >
          <Alert
            type="warning"
            showIcon
            banner
            message={
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: ".3rem 1rem",
                }}
              >
                <span style={{ fontSize: "0.85rem" }}>
                  Please verify your email to access the application.
                </span>
                <Button
                  type="primary"
                  size="small"
                  onClick={async (e) => {
                    e.stopPropagation();
                    try {
                      await dispatch(resendVerifyEmail()).unwrap();
                      message.success("Verification email sent successfully!");
                    } catch (err) {
                      message.error("Failed to send verification email.");
                    }
                  }}
                >
                  Resend Link
                </Button>
                <Button
                  type="text"
                  size="small"
                  style={{ fontSize: "0.75rem", color: "#8c8c8c" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsVerifyExpanded(false);
                  }}
                >
                  Minimize
                </Button>
              </div>
            }
            style={{ borderRadius: "6px", padding: "4px 12px" }}
          />
        </div>
      )}
      <div></div>

      <div className={headerStyles.credsCon}>
        {/* Collapsed verify icon - shown at the end near name/avatar */}
        {!isVerifyExpanded && (
          <Tooltip title="Email not verified – click to expand">
            <div
              onClick={() => setIsVerifyExpanded(true)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#fffbe6",
                border: "1px solid #ffe58f",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <ExclamationCircleFilled
                style={{ color: "#faad14", fontSize: "1.1rem" }}
              />
            </div>
          </Tooltip>
        )}

        {/* Profile Pill moved to SideBar */}
      </div>
    </div>
  );
};

export default Header;
