"use client";
import React, { useEffect } from "react";
import sideBarStyles from "@/mainLayout/styles/sidebar.module.scss";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Menu, Dropdown, Skeleton } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { changeCollapse } from "@/redux/slices/company/sidebar";
import {
  clearLstorageVals,
  clearSstorageVals,
  setSstorage,
} from "@/utils/universalUtils/windowMW";
import { getOneUser } from "@/redux/slices/company/user";
import Cookies from "js-cookie";

import {
  HiOutlineSquares2X2,
  HiOutlineBriefcase,
  HiOutlineClipboardDocumentCheck,
  HiOutlineUser,
  HiOutlineQuestionMarkCircle,
  HiOutlineVideoCamera
} from "react-icons/hi2";

const sideBarTitles = [
  {
    name: "Dashboard",
    slug: "profile",
    path: "/company/profile",
    icon: <HiOutlineSquares2X2 size={22} />,
  },
  {
    name: "My Jobs",
    slug: "myjobs",
    path: "/company/myjobs",
    icon: <HiOutlineBriefcase size={22} />,
  },
  {
    name: "Job Assessments",
    slug: "jobassessments",
    path: "/company/jobassessments",
    icon: <HiOutlineClipboardDocumentCheck size={22} />,
  },
  {
    name: "Live Monitoring",
    slug: "help",
    path: "/company/help",
    icon: <HiOutlineVideoCamera size={22} />,
  },
];

const SideBar = ({ activeView, setView, isMobile }) => {
  const isCollapsed = useSelector((state) => state.sideBar?.collapse);
  const orgDetails = useSelector((s) => s.user?.singleUser?.orgDetails);
  const userCreds = useSelector((state) => state.user?.singleUser);
  const isLoadingUser = !userCreds;

  const dispatch = useDispatch();
  const pathName = usePathname();
  const nav = useRouter();

  useEffect(() => {
    dispatch(getOneUser());
  }, [dispatch]);

  const name = userCreds?.companyName || userCreds?.userName || "Company User";
  const email = userCreds?.email || "";
  const firstLetter = name.split("")[0]?.[0]?.toUpperCase() || "";

  useEffect(() => {
    if (!orgDetails) return;
    if (!orgDetails?.features) return;

    const pathToCheck = activeView || pathName;
    const currentPath = pathToCheck?.slice(1).toLowerCase();

    if (currentPath === "jobassessments") {
      if (orgDetails.features.jobassessments === false) {
        if (typeof setView === "function") {
          setView("/company/myjobs");
        } else {
          nav.replace("/company/myjobs");
        }
      }
    }
  }, [orgDetails, pathName, activeView]);

  const handleLogout = () => {
    clearLstorageVals();
    clearSstorageVals();
    Cookies.remove("token");
    window.location.href = "/login?portal=company";
  };

  const menuItems = [
    {
      type: 'group',
      label: isCollapsed ? '' : <span style={{ fontWeight: '800', color: '#1e293b' }}>COMPANY</span>,
      children: sideBarTitles
        .filter((item) => {
          if (item.slug === "jobassessments" && orgDetails?.features?.jobassessments === false) {
            return false;
          }
          return true;
        })
        .map((item) => ({
          key: item.path,
          icon: item.icon,
          label: item.name,
        }))
    }
  ];

  const getSelectedKeys = () => {
    const pathToCheck = activeView || pathName;
    const match = sideBarTitles.find((t) => t.path && pathToCheck.startsWith(t.path));
    if (match) return [match.path];
    return [];
  };

  const handleMenuClick = ({ key }) => {
    if (typeof setView === "function") {
      setView(key);
      return;
    }
    const clickedItem = sideBarTitles.find((item) => item.path === key);
    if (clickedItem) {
      nav.replace(clickedItem.path);
      setSstorage("userIdInProgress", "");
    }
  };

  const userMenuItems = [
    {
      key: "user-info",
      disabled: true,
      style: { cursor: "default", backgroundColor: "transparent" },
      label: (
        <div style={{ padding: "4px 0", color: "#333" }}>
          <strong style={{ display: "block", fontSize: "14px", lineHeight: "1.2" }}>
            {name}
          </strong>
          <span style={{ fontSize: "12px", color: "#8c8c8c" }}>
            {email}
          </span>
        </div>
      )
    },
    { type: "divider" },
    {
      key: "profile",
      label: "View Profile",
      onClick: () => nav.replace("/company/profile")
    },
    {
      key: "logout",
      label: <span style={{ color: "#ff4d4f" }}>Logout</span>,
      onClick: handleLogout
    }
  ];

  return (
    <section
      className={`${sideBarStyles.sideBarContainer} ${isCollapsed ? sideBarStyles.collapsedSidebar : sideBarStyles.expandedSidebar}`}
      style={{ display: isMobile && isCollapsed ? "none" : "flex", height: "100%", zIndex: 10 }}
    >
      <div className={sideBarStyles.logoContainer}>
        <img
          src="https://res.cloudinary.com/dug3awue8/image/upload/v1744626297/icon_dtclq9.svg"
          alt="Synsper Logo"
          onClick={() => nav.replace("/company/profile")}
          style={{ cursor: "pointer" }}
        />
        {!isCollapsed && (
          <div
            className={sideBarStyles.logoText}
            onClick={() => nav.replace("/company/profile")}
            style={{ flex: 1, paddingRight: '8px', cursor: "pointer" }}
          >
            S K I L L <span> M E D H A</span>
          </div>
        )}
        <div
          onClick={() => dispatch(changeCollapse(!isCollapsed))}
          style={{ cursor: 'pointer', padding: '0 8px', display: 'flex', alignItems: 'center', flexShrink: 0, marginRight: isCollapsed ? '0' : '24px', marginLeft: isCollapsed ? '0' : 'auto' }}
        >
          {isCollapsed ? <MenuUnfoldOutlined style={{ fontSize: '30px' }} /> : <MenuFoldOutlined style={{ fontSize: '24px' }} />}
        </div>
      </div>

      <div className={sideBarStyles.scrolltabs}>
        <Menu
          mode="inline"
          theme="light"
          inlineCollapsed={isCollapsed}
          className={sideBarStyles.styledAntMenu}
          selectedKeys={getSelectedKeys()}
          onClick={handleMenuClick}
          items={menuItems}
        />
      </div>

      <div className={sideBarStyles.bottom}>
        <div style={{ padding: isCollapsed ? "0" : "0 1rem", display: "flex", justifyContent: "center" }}>
          {isLoadingUser ? (
            <div className={sideBarStyles.profilePillSkeleton}>
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
              <div className={`${sideBarStyles.profilePill} ${isCollapsed ? sideBarStyles.collapsedPill : ''}`}>
                <div className={sideBarStyles.avatar}>
                  {userCreds?.companyLogo ? (
                    <img src={userCreds.companyLogo} style={{ objectFit: "cover", width: "100%", height: "100%" }} alt="Company Logo" />
                  ) : (
                    <span>{firstLetter}</span>
                  )}
                </div>
                {!isCollapsed && (
                  <>
                    <div className={sideBarStyles.profileInfo}>
                      <span className={sideBarStyles.name}>
                        {name.length > 15
                          ? name.substring(0, 15) + "..."
                          : name}
                      </span>
                      <span className={sideBarStyles.email}>
                        {email}
                      </span>
                    </div>
                  </>
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
