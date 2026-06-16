"use client";
import React, { useEffect } from "react";
import sideBarStyles from "./styles/sidebar.module.scss";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { changeCollapse } from "@/redux/slices/company/sidebar";
import {
  clearLstorageVals,
  clearSstorageVals,
  setSstorage,
} from "@/utils/universalUtils/windowMW";

const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="9" rx="1" ry="1"></rect>
    <rect x="14" y="3" width="7" height="5" rx="1" ry="1"></rect>
    <rect x="14" y="12" width="7" height="9" rx="1" ry="1"></rect>
    <rect x="3" y="16" width="7" height="5" rx="1" ry="1"></rect>
  </svg>
);

const TalkAIIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a2 2 0 0 1 2 2c0 1.1-.9 2-2 2s-2-.9-2-2 1.1-2 2-2z"></path>
    <path d="M19 8H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2z"></path>
    <path d="M12 16v4"></path>
    <path d="M8 16v4"></path>
    <path d="M16 16v4"></path>
    <path d="M2 10v4"></path>
    <path d="M22 10v4"></path>
  </svg>
);

const BriefcaseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
  </svg>
);

const ClipboardCheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
    <path d="M9 14l2 2 4-4"></path>
  </svg>
);

const BuildingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
    <path d="M9 22v-4h6v4"></path>
    <path d="M8 6h.01"></path>
    <path d="M16 6h.01"></path>
    <path d="M12 6h.01"></path>
    <path d="M12 10h.01"></path>
    <path d="M12 14h.01"></path>
    <path d="M16 10h.01"></path>
    <path d="M16 14h.01"></path>
    <path d="M8 10h.01"></path>
    <path d="M8 14h.01"></path>
  </svg>
);

const HelpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

const ChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const menuSections = [
  {
    items: [
      { name: "Dashboard", slug: "profile", path: "/company/profile", icon: <DashboardIcon /> },
      { name: "My Jobs", slug: "myjobs", path: "/company/myjobs", icon: <BriefcaseIcon /> },
      { name: "Job Assessments", slug: "jobassessments", path: "/company/jobassessments", icon: <ClipboardCheckIcon /> },
      { name: "Help", slug: "help", path: "/company/help", icon: <HelpIcon /> },
    ],
  }
];

const SideBar = ({ activeView, setView }) => {
  const isCollapsed = useSelector((state) => state.sideBar.collapse);
  const orgDetails = useSelector((s) => s.user?.singleUser?.orgDetails);
  const userCreds = useSelector((state) => state.user.singleUser);
  const dispatch = useDispatch();

  const pathName = usePathname();
  const nav = useRouter();

  const handleClick = (item) => {
    if (typeof setView === "function") {
      setView(item.path);
      return;
    }
    nav.replace(item?.path);
    setSstorage("userIdInProgress", "");
  };

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

  return (
    <div className={sideBarStyles.sidebarContainer}>
      <div className={sideBarStyles.logoContainer} onClick={() => nav.replace("/")}>
        <img
          src="https://res.cloudinary.com/dug3awue8/image/upload/v1744626297/icon_dtclq9.svg"
          alt="SkillMedha Logo"
        />
        <div className={sideBarStyles.logoText}>
          SKILL<span>MEDHA</span>
        </div>
      </div>

      <div className={sideBarStyles.scrollableNav}>
        {menuSections.map((section, secIndex) => (
          <div key={secIndex} className={sideBarStyles.menuSection}>
            {section.title && <div className={sideBarStyles.sectionTitle}>{section.title}</div>}
            <div className={sideBarStyles.sectionItems}>
              {section.items.map((item, itemIndex) => {
                const isActive = (activeView || pathName).startsWith(item.path);

                if (
                  item.slug === "jobassessments" &&
                  orgDetails?.features?.jobassessments === false
                ) {
                  return null;
                }

                return (
                  <div
                    key={itemIndex}
                    className={`${sideBarStyles.navItem} ${isActive ? sideBarStyles.active : ""}`}
                    onClick={() => handleClick(item)}
                  >
                    <div className={sideBarStyles.navItemLeft}>
                      <span className={sideBarStyles.iconWrapper}>{item.icon}</span>
                      <span className={sideBarStyles.navText}>{item.name}</span>
                    </div>
                    {item.hasDropdown && (
                      <span className={sideBarStyles.dropdownIcon}><ChevronDown /></span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className={sideBarStyles.bottomSection}>
        <div
          className={sideBarStyles.logoutBtn}
          onClick={() => {
            clearLstorageVals();
            clearSstorageVals();
            const loginUrl = process.env.NEXT_PUBLIC_LOGIN_APP_URL || "http://localhost:2025";
            window.location.href = `${loginUrl}?portal=company`;
          }}
        >
          <span className={sideBarStyles.iconWrapperLogout}><LogoutIcon /></span>
          {!isCollapsed && <span className={sideBarStyles.navTextLogout}>Logout</span>}
        </div>

        <div className={sideBarStyles.avatarBlock}>
          <div className={sideBarStyles.avatarCircle}>
            {(userCreds?.companyName || userCreds?.userName || "A").charAt(0).toUpperCase()}
          </div>
          <div className={sideBarStyles.avatarText}>
            <div className={sideBarStyles.avatarName}>{userCreds?.companyName || userCreds?.userName || "Alphabet Inc."}</div>
            <div className={sideBarStyles.avatarEmail}>{userCreds?.email || "hr@alphabet.com"}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
