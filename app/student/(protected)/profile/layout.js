"use client";
import React from "react";
import styles from "./myprofile.module.scss";
import { useSelector } from "react-redux";
import { profileSideNav } from "./(pages)/_utils/myprofileUtils";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import ProfilePicUploader from "./(pages)/_utils/profilePicUploader";
import useResponsive from "@/hooks/useResponsive";
import MobileProfileLayout from "@/mobile_views/profile/MobileProfileLayout";
import {
  FaUser,
  FaGraduationCap,
  FaBriefcase,
  FaCode,
  FaTasks,
  FaProjectDiagram,
  FaHandHoldingHeart,
  FaCertificate,
  FaChartBar,
  FaCheckCircle,
} from "react-icons/fa";
import { BsPlus, BsX, BsStar } from "react-icons/bs";

export default function ProfileLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useResponsive();

  const studentCreds = useSelector((state) => state.student.student?.data);

  if (isMobile) {
    return <MobileProfileLayout>{children}</MobileProfileLayout>;
  }

  const name = studentCreds?.userName || "Student Name";
  const email = studentCreds?.email || "student@example.com";
  const phone = studentCreds?.phone || studentCreds?.mobile || "+91 xxxxxxxxxx";
  const enrollementId = studentCreds?.enrollementId || "Enrollment ID";
  const course = studentCreds?.courseName || studentCreds?.departmentName || "Student";

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
    if (!studentCreds) return 65;
    const fields = [
      studentCreds.firstName,
      studentCreds.lastName,
      studentCreds.gender,
      studentCreds.phone,
      studentCreds.email,
      studentCreds.collegeName,
      studentCreds.professionalSummary
    ];
    const filled = fields.filter(f => f && f.toString().trim() !== "");
    const calculated = Math.round((filled.length / fields.length) * 100);
    return calculated > 0 ? calculated : 65;
  };
  const completionPercent = calculateCompletion();

  // Stats calculation
  const projectsCount = studentCreds?.projects?.length || 0;
  const internshipsCount = studentCreds?.workInternships?.length || studentCreds?.experience?.length || 0;
  const certificationsCount = studentCreds?.certifications?.length || 0;

  // Icon mapping for tabs
  const getTabIcon = (tabName) => {
    const lowerName = tabName.toLowerCase();
    if (lowerName.includes("basic")) return <FaUser />;
    if (lowerName.includes("education")) return <FaGraduationCap />;
    if (lowerName.includes("work") || lowerName.includes("internship")) return <FaBriefcase />;
    if (lowerName.includes("skills") || lowerName.includes("subject") || lowerName.includes("language")) return <FaCode />;
    if (lowerName.includes("responsibilit")) return <FaTasks />;
    if (lowerName.includes("project")) return <FaProjectDiagram />;
    if (lowerName.includes("volunteer")) return <FaHandHoldingHeart />;
    if (lowerName.includes("certificat")) return <FaCertificate />;
    if (lowerName.includes("analyt") || lowerName.includes("report")) return <FaChartBar />;
    return <FaUser />;
  };

  const handleTabClick = (path) => {
    router.push(path);
  };

  return (
    <div className={styles.mainWrapper}>
      {/* Dark Blue Profile Hero Header */}
      <div className={styles.heroSection}>
        {/* Background Icons */}
        <div className={styles.bgIcons}>
          <BsX className={styles.icon1} />
          <BsPlus className={styles.icon2} />
          <BsStar className={styles.icon3} />
          <BsX className={styles.icon4} />
        </div>

        <div className={styles.heroTop}>
          {/* Student Identity Area */}
          <div className={styles.identityArea}>
            <div className={styles.avatarWrapper}>
              <div className={styles.avatarImage} style={{ overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#0a1c30" }}>
                <ProfilePicUploader />
              </div>
              <div className={styles.avatarCheckmark}>
                <FaCheckCircle />
              </div>
            </div>
            
            <div className={styles.identityDetails}>
              <div className={styles.nameRow}>
                <h1 className={styles.coordName}>{name}</h1>
                <span className={styles.designationBadge}>{course}</span>
              </div>
              <div className={styles.metaRow}>
                <span>Skill Medha ID: {enrollementId}</span>
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
              <span className={styles.statVal}>{projectsCount}</span>
              <span className={styles.statLabel}>PROJECTS</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statBox}>
              <span className={styles.statVal}>{internshipsCount}</span>
              <span className={styles.statLabel}>INTERNSHIPS</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statBox}>
              <span className={styles.statVal}>{certificationsCount}</span>
              <span className={styles.statLabel}>CERTIFICATIONS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Navigation Tabs (Outside Hero Section to have white background) */}
      <div className={styles.tabsWrapper}>
        <div className={styles.tabsRow}>
          {profileSideNav.map((item) => {
            const currentPathEnd = pathname.split("/").pop();
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
                {isActive && <span className={styles.activeIndicator} />}
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
