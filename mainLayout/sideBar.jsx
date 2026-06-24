"use client";
import React, { useEffect, useState } from "react";
import sideBarStyles from "./styles/sidebar.module.scss";
import { usePathname } from "next/navigation";
import { useAppRouter } from "@/helpers/useAppRouter";
import { useDispatch, useSelector } from "react-redux";
import { sideBarTitles } from "@/universalUtils/sideBarTitles";
import { getSstorage, setSstorage } from "@/universalUtils/windowMW";
import { message, Menu, Modal, Button, Dropdown, Skeleton } from "antd";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import Cookies from "js-cookie";
import { imgUrls } from "@/universalUtils/images";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { changeCollapse } from "@/redux/slices/sidebar";
import { resetStudent } from "@/redux/slices/student";
import useLogout from "@/helpers/useLogout";

export const isProfileComplete = (student) => {
  if (!student) return false;
  const requiredFields = ["phone", "email"];
  return requiredFields.every(
    (key) =>
      student[key] !== undefined &&
      student[key] !== null &&
      student[key].toString().trim() !== ""
  );
};

import useSpecialOrg from "@/helpers/useSpecialOrg";

const SideBar = ({ activeView, setView }) => {
  const isCollapsed = useSelector((s) => s.sideBar.collapse);
  const { isSpecialOrg, student, orgDetails } = useSpecialOrg();

  const currPath = usePathname();
  const nav = useAppRouter();
  const dispatch = useDispatch();
  const handleLogout = useLogout();
  const [messageApi, contextHolder] = message.useMessage();

  const [openMenuKeys, setOpenMenuKeys] = useState([]);

  const isTestsAccount = student?.testSt === true;
  const isVerified = student?.verified === true;
  const profileFilled = isProfileComplete(student);

  const isLoadingUser = !student || Object.keys(student).length === 0;

  const userMenuItems = [
    {
      key: "user-info",
      disabled: true,
      style: { cursor: "default", backgroundColor: "transparent" },
      label: (
        <div style={{ padding: "4px 0", color: "#333" }}>
          <strong style={{ display: "block", fontSize: "14px", lineHeight: "1.2" }}>
            {student?.userName || "User"}
          </strong>
          <span style={{ fontSize: "12px", color: "#8c8c8c" }}>
            {student?.email || student?.phone || "Student Account"}
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

  const practiceSubs = [
    { name: "Non - Technical", path: "nontechnical", active: true },
    { name: "Coding", path: "coding", active: true },
    { name: "Technical", path: "technical", active: true },
  ];

  useEffect(() => {
    if (!student?._id || isSpecialOrg) return;
    if (!profileFilled) {
      messageApi.error("Please complete your profile first.");
    } else if (student.verified === false) {
      messageApi.open({
        type: "error",
        content: "Please verify your email before proceeding.",
        duration: 0,
      });
    }
  }, [student?._id]);

  const router = useAppRouter();
  useEffect(() => {
    if (orgDetails && orgDetails?.features) {
      const currentPath = window.location.pathname;
      const currentSlug = currentPath.slice(1).toLowerCase();

      // Find matching sidebar item
      const matchingItem = sideBarTitles.find(
        (title) => title.path.slice(1).toLowerCase() === currentSlug
      );

      if (matchingItem) {
        // Check if feature is disabled
        const keys = Object.keys(orgDetails.features);
        const featureKey = keys.find(
          (key) => key.toLowerCase() === currentSlug
        );

        // Block access if feature is disabled and not in allowed list
        const allowedSlugs = ["/", "myprofile", "dashboard", "help"];

        if (
          featureKey &&
          !orgDetails.features[featureKey] &&
          !allowedSlugs.includes(matchingItem.slug)
        ) {
          router.push("/dashboard");
        }
      }
    }
  }, [orgDetails]);

  const getMenuItems = () => {
    const mainItems = [];
    const learnItems = [];
    const careerItems = [];
    const supportItems = [];

    sideBarTitles.forEach((title) => {
      let isVisible = true;
      if (orgDetails?.features) {
        const keys = Object.keys(orgDetails.features);
        const tab = keys.find(
          (e) => e?.toLocaleLowerCase() === title.slug.toLocaleLowerCase()
        );
        if (
          tab &&
          !orgDetails.features[tab] &&
          !["myprofile", "dashboard", "help"].includes(title.slug)
        ) {
          isVisible = false;
        }
      }

      if (isSpecialOrg && title.slug !== "myassessments" && title.slug !== "testresults") {
        isVisible = false;
      }

      if (!isSpecialOrg && title.slug === "testresults") {
        isVisible = false;
      }

      if (!isVisible) return;

      const currentItem =
        isSpecialOrg && title.slug === "myassessments"
          ? { ...title, name: "My Tests" }
          : title;

      const isPractice = currentItem.name === "Practice";
      const isMyAssessments = currentItem.name === "My Assessments";

      // ALL items locked when unverified (middleware + sidebar enforce this together)
      const locked = !isSpecialOrg && !isTestsAccount && !isVerified;

      const itemStyle = {
        opacity: locked ? 0.4 : 1,
        cursor: locked ? "not-allowed" : "pointer",
        pointerEvents: locked ? "none" : "auto",
      };

      let menuItem = null;

      if (isMyAssessments) {
        menuItem = {
          key: "assessments",
          icon: currentItem.icon,
          label: currentItem.name,
          style: itemStyle,
          children: [
            { key: "/student/jobAssessments", label: "Job Assessments", style: itemStyle },
            { key: "/student/tests", label: "My Tests", style: itemStyle },
          ],
        };
      } else {
        menuItem = {
          key: currentItem.path,
          icon: currentItem.icon,
          label: currentItem.name,
          style: itemStyle,
        };
      }
      
      if (title.slug === 'dashboard') {
        menuItem.className = sideBarStyles.dashboardActiveItem;
      }

      if (['dashboard', 'talktoai'].includes(title.slug)) {
        mainItems.push(menuItem);
      } else if (['practice', 'internshiplibrary', 'courseslibrary'].includes(title.slug)) {
        learnItems.push(menuItem);
      } else if (['resumebuilder', 'jobopenings', 'myassessments', 'testresults'].includes(title.slug)) {
        careerItems.push(menuItem);
      } else if (title.slug === 'help') {
        supportItems.push(menuItem);
      } else {
        mainItems.push(menuItem);
      }
    });

    const groupedMenu = [];
    if (mainItems.length > 0) groupedMenu.push({ type: 'group', label: isCollapsed ? '' : <span style={{ fontWeight: '800', color: '#1e293b' }}>MAIN</span>, children: mainItems });
    if (learnItems.length > 0) groupedMenu.push({ type: 'group', label: isCollapsed ? '' : <span style={{ fontWeight: '800', color: '#1e293b' }}>LEARN</span>, children: learnItems });
    if (careerItems.length > 0) groupedMenu.push({ type: 'group', label: isCollapsed ? '' : <span style={{ fontWeight: '800', color: '#1e293b' }}>CAREER</span>, children: careerItems });
    if (supportItems.length > 0) groupedMenu.push({ type: 'group', label: isCollapsed ? '' : <span style={{ fontWeight: '800', color: '#1e293b' }}>SUPPORT</span>, children: supportItems });

    return groupedMenu;
  };

  const menuItems = getMenuItems();

  const handleMenuClick = ({ key }) => {
    if (typeof setView === "function") {
      let view = key;
      if (key.startsWith("practice|")) {
        const parts = key.split("|");
        view = `practice-${parts[2]}`;
        setSstorage("subPath", parts[1]);
      }
      setView(view);
      return;
    }

    let clickedTitle = null;

    if (key === "/student/jobAssessments" || key === "/student/tests") {
      clickedTitle = { name: "My Assessments" };
    } else if (key.startsWith("practice|")) {
      clickedTitle = { name: "Practice" };
    } else {
      clickedTitle = sideBarTitles.find((t) => t.path === key);
    }

    // All items are locked for unverified users — redirect to blocked page
    const locked = !isSpecialOrg && !isTestsAccount && !isVerified;
    if (locked) {
      nav.push("/student/blocked?reason=email-not-verified");
      return;
    }

    if (key.startsWith("practice|")) {
      const parts = key.split("|");
      const subName = parts[1];
      const subActive = practiceSubs.find((s) => s.name === subName)?.active;
      if (!subActive) return;
    }

    if (key === "/student/jobAssessments" || key === "/student/tests") {
      nav.push(key);
    } else if (key.startsWith("practice|")) {
      const parts = key.split("|");
      const subName = parts[1];
      const subPath = parts[2];
      setSstorage("currPathTitle", "practice");
      setSstorage("subPath", subName);
      nav.push(`/student/practice-new/${subPath}`);
    } else if (clickedTitle) {
      setSstorage("currPathTitle", "others");
      setSstorage("subPath", "");
      nav.replace(clickedTitle.path);
    }
  };

  const getSelectedKeys = () => {
    const pathToCheck = activeView || currPath;
    if (pathToCheck.includes("/student/jobAssessments") || pathToCheck.includes("jobAssessments")) return ["/student/jobAssessments"];
    if (pathToCheck.includes("/student/tests") || pathToCheck.includes("tests")) return ["/student/tests"];
    if (pathToCheck.includes("/student/testResults") || pathToCheck.includes("testResults")) return ["/student/testResults"];
    if (pathToCheck.includes("practice-") || pathToCheck.includes("/student/practice-new")) {
      let subPathStr = getSstorage("subPath");
      if (pathToCheck.includes("practice-")) {
        const parts = pathToCheck.split("-");
        const sub = parts[1];
        const matchSub = practiceSubs.find(s => s.path === sub);
        if (matchSub) subPathStr = matchSub.name;
      }
      const activeSub = practiceSubs.find((sub) => subPathStr === sub.name);
      if (activeSub) return [`practice|${activeSub.name}|${activeSub.path}`];
    }
    const match = sideBarTitles.find(
      (t) => t.path && pathToCheck.includes(t.path.split("?")[0])
    );
    if (match) return [match.path];
    return [];
  };

  useEffect(() => {
    if (!isCollapsed) {
      if (currPath.includes("/student/jobAssessments") || currPath.includes("/student/tests")) {
        setOpenMenuKeys((prev) => Array.from(new Set([...prev, "assessments"])));
      }
      if (currPath.includes("/student/practice-new")) {
        setOpenMenuKeys((prev) => Array.from(new Set([...prev, "practice"])));
      }
    } else {
      setOpenMenuKeys([]);
    }
  }, [currPath, isCollapsed]);

  return (
    <>
      {contextHolder}
      <section
        className={`${sideBarStyles.sideBarContainer} ${isCollapsed ? sideBarStyles.collapsedSidebar : sideBarStyles.expandedSidebar}`}
      >
      <div className={sideBarStyles.logoContainer}>
        <img
          src="https://res.cloudinary.com/dug3awue8/image/upload/v1744626297/icon_dtclq9.svg"
          alt="Synsper Logo"
          onClick={() => nav.replace(isSpecialOrg ? "/student/tests" : "/student/dashboard")}
        />
        {!isCollapsed && (
          <div
            className={sideBarStyles.logoText}
            onClick={() => nav.replace(isSpecialOrg ? "/student/tests" : "/student/dashboard")}
            style={{ flex: 1, paddingRight: '8px' }}
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
          openKeys={openMenuKeys}
          onOpenChange={(keys) => setOpenMenuKeys(keys)}
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
                  {!student?.profile ? (
                    student?.userName?.trim().split(" ").map((w, i) => (i < 2 ? w[0].toUpperCase() : "")).join("") || "U"
                  ) : (
                    <img src={student?.profile} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                  )}
                </div>
                {!isCollapsed && (
                  <>
                    <div className={sideBarStyles.profileInfo}>
                      <span className={sideBarStyles.name}>
                        {student?.userName?.length > 15
                          ? student.userName.substring(0, 15) + "..."
                          : student?.userName}
                      </span>
                      <span className={sideBarStyles.email}>
                        {student?.email || student?.phone || "Student Account"}
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
    </>
  );
};

export default SideBar;
