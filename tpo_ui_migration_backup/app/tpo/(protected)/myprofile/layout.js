"use client";
import React from "react";
import styles from "./myprofile.module.scss";
import { useSelector } from "react-redux";
import { profileSidebarItems } from "./(components)/sidebarData";
import { usePathname } from "next/navigation";
import { useRouter } from "@bprogress/next/app";
import {
  FaUser,
  FaBuilding,
  FaAward,
  FaUserFriends,
  FaFileContract,
  FaCheckCircle,
} from "react-icons/fa";

export default function ProfileLayout({ children, activeView, setView }) {
  const router = useRouter();
  const pathname = usePathname();

  // Dynamic statistics
  const { stats } = useSelector((state) => state.dashboardStats);
  const departmentsCount = stats.departmentsCount;
  const studentsCount = stats.studentsCount;
  const drivesCount = stats.totalPlacements;

  // Coordinator info
  const USER_DETAILS = useSelector(
    (state) => state.user.UserDetails?.value?.data
  );

  const name = USER_DETAILS?.userName || "Sure Yalla";
  const email = USER_DETAILS?.email || "cstpo1@gmail.com";
  const phone = USER_DETAILS?.phone || USER_DETAILS?.mobile || "+91 987877xxxxx";
  const employeeId = USER_DETAILS?.employeeId || "cstpo1";
  const designation = USER_DETAILS?.designation || "Placement Officer";

  const getInitials = (nameStr) => {
    const parts = nameStr.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return nameStr.slice(0, 2).toUpperCase();
  };
  const initials = getInitials(name);

  // Profile completion calculation
  const calculateCompletion = () => {
    if (!USER_DETAILS) return 68;
    const fields = [
      USER_DETAILS.firstName,
      USER_DETAILS.lastName,
      USER_DETAILS.gender,
      USER_DETAILS.phone,
      USER_DETAILS.email,
      USER_DETAILS.designation,
      USER_DETAILS.qualification,
      USER_DETAILS.tpoLogo,
      USER_DETAILS.institutionName,
      USER_DETAILS.establishedYear,
      USER_DETAILS.institutionType,
      USER_DETAILS.address,
      USER_DETAILS.contactNumber,
      USER_DETAILS.principalName,
      USER_DETAILS.principalContact,
      USER_DETAILS.principalEmail,
      USER_DETAILS.institutionLogo
    ];
    const filled = fields.filter(f => f && f.toString().trim() !== "");
    const calculated = Math.round((filled.length / fields.length) * 100);
    return calculated > 0 ? calculated : 68; // fallback to 68% as default/mockup value
  };
  const completionPercent = calculateCompletion();

  // Icon mapping for tabs
  const getTabIcon = (name) => {
    switch (name.toLowerCase()) {
      case "personal details":
        return <FaUser />;
      case "institution details":
        return <FaBuilding />;
      case "accreditations and ranking":
        return <FaAward />;
      case "tpo support team details":
        return <FaUserFriends />;
      case "placement cell mous":
        return <FaFileContract />;
      default:
        return <FaUser />;
    }
  };

  const handleTabClick = (path) => {
    if (typeof setView === "function") {
      setView(path);
    } else {
      router.push(path);
    }
  };

  return (
    <div className={styles.mainWrapper}>
      {/* Dark Blue Profile Hero Header */}
      <div className={styles.heroSection}>
        <div className={styles.heroTop}>
          {/* Coordinator Identity Area */}
          <div className={styles.identityArea}>
            <div className={styles.avatarWrapper}>
              {USER_DETAILS?.tpoLogo ? (
                <img
                  src={USER_DETAILS.tpoLogo}
                  alt="Profile Logo"
                  className={styles.avatarImage}
                />
              ) : (
                <div className={styles.avatarInitials}>{initials}</div>
              )}
              <div className={styles.avatarCheckmark}>
                <FaCheckCircle />
              </div>
            </div>
            
            <div className={styles.identityDetails}>
              <div className={styles.nameRow}>
                <h1 className={styles.coordName}>{name}</h1>
                <span className={styles.designationBadge}>{designation}</span>
              </div>
              <div className={styles.metaRow}>
                <span>Employee ID: {employeeId}</span>
                <span className={styles.divider}>•</span>
                <span>{email}</span>
                <span className={styles.divider}>•</span>
                <span>{phone}</span>
              </div>
              
              {/* Profile Completion Indicator */}
              <div className={styles.completionWrapper}>
                <span className={styles.completionLabel}>Profile completion</span>
                <div className={styles.progressContainer}>
                  <div
                    className={styles.progressBar}
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
                <span className={styles.completionPercent}>{completionPercent}%</span>
              </div>
            </div>
          </div>

          {/* Quick Statistics Area */}
          <div className={styles.statsArea}>
            <div className={styles.statBox}>
              <span className={styles.statVal}>{departmentsCount}</span>
              <span className={styles.statLabel}>DEPARTMENTS</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statBox}>
              <span className={styles.statVal}>{studentsCount}</span>
              <span className={styles.statLabel}>STUDENTS</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statBox}>
              <span className={styles.statVal}>{drivesCount}</span>
              <span className={styles.statLabel}>DRIVES</span>
            </div>
          </div>
        </div>

        {/* Profile Navigation Tabs */}
        <div className={styles.tabsRow}>
          {profileSidebarItems.map((item) => {
            const currentPathEnd = (activeView || pathname).split("/").pop();
            const itemPathEnd = item.path.split("/").pop();
            const isActive = currentPathEnd === itemPathEnd;
            return (
              <div
                key={item.path}
                className={`${styles.tabItem} ${isActive ? styles.activeTab : ""}`}
                onClick={() => handleTabClick(item.path)}
              >
                {getTabIcon(item.name)}
                <span>{item.name}</span>
                {isActive && <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#24a058] rounded-t-md" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Profile Form Content */}
      <div className={styles.contentScrollWrapper}>
        <div className={styles.centeredContent}>{children}</div>
      </div>
    </div>
  );
}
