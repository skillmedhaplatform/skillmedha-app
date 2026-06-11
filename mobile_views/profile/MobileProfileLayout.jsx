"use client";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAppRouter } from "@/helpers/useAppRouter";
import ProfilePicUploader from "@/app/student/(protected)/profile/(pages)/_utils/profilePicUploader";
import { useSelector } from "react-redux";
import { 
  User, 
  GraduationCap, 
  Briefcase, 
  Sliders, 
  ClipboardList, 
  Code, 
  Heart, 
  Award, 
  BarChart3 
} from "lucide-react";
import styles from "./mobileProfileLayout.module.scss";

const MAIN_TABS = [
  { name: "Basic Details", path: "/student/profile/basic-details", icon: User, key: "basic-details" },
  { name: "Education", path: "/student/profile/education", icon: GraduationCap, key: "education" },
  { name: "Work & Internships", path: "/student/profile/work-internships", icon: Briefcase, key: "work-internships" },
  { name: "Skills", path: "/student/profile/skills-languages", icon: Sliders, key: "skills-languages" },
  { name: "Responsibilities", path: "/student/profile/responsibilities", icon: ClipboardList, key: "responsibilities" },
  { name: "Projects", path: "/student/profile/projects", icon: Code, key: "projects" },
  { name: "Volunteering", path: "/student/profile/volunteering", icon: Heart, key: "volunteering" },
  { name: "Certifications", path: "/student/profile/certifications", icon: Award, key: "certifications" },
  { name: "Analytical Report", path: "/student/profile/analytics", icon: BarChart3, key: "analytics" },
];

export default function MobileProfileLayout({ children }) {
  const studentCreds = useSelector((state) => state.student.student?.data);
  const pathname = usePathname();
  const route = useAppRouter();
  const [activeSubTab, setActiveSubTab] = useState("about");

  const currentPath = pathname?.split("/").pop();

  useEffect(() => {
    if (currentPath !== "basic-details") {
      setActiveSubTab("about");
    }
  }, [currentPath]);

  const handleNavigate = (path) => {
    if (pathname !== path) {
      route.push(path);
    }
  };

  const getIcon = (iconName) => {
    switch (iconName) {
      case "User": return <User size={20} />;
      case "GraduationCap": return <GraduationCap size={20} />;
      case "Briefcase": return <Briefcase size={20} />;
      case "Sliders": return <Sliders size={20} />;
      case "ClipboardList": return <ClipboardList size={20} />;
      case "Code": return <Code size={20} />;
      case "Heart": return <Heart size={20} />;
      case "Award": return <Award size={20} />;
      case "BarChart3": return <BarChart3 size={20} />;
      default: return <User size={20} />;
    }
  };

  return (
    <div className={styles.mobileProfileContainer}>
      {/* 1. Header Area */}
      <header className={styles.profileHeader}>
        <div className={styles.avatarWrapper}>
          <ProfilePicUploader />
        </div>
        <div className={styles.profileInfo}>
          <h2>{studentCreds?.userName || "Student"}</h2>
          <p className={styles.enrollId}>ID: {studentCreds?.enrollementId || "N/A"}</p>
        </div>
      </header>

      {/* 2. Main Work Area: Side Rail + Content */}
      <div className={styles.mainLayout}>
        <nav className={styles.sideRail}>
          {MAIN_TABS.map((item) => {
            const isTabActive = currentPath === item.key || 
              (item.key === "analytics" && pathname.startsWith("/student/profile/analytics"));
            const IconComponent = item.icon;

            return (
              <button
                key={item.key}
                onClick={() => handleNavigate(item.path)}
                className={`${styles.railItem} ${isTabActive ? styles.activeRailItem : ""}`}
              >
                <div className={styles.iconContainer}>
                  {IconComponent && typeof IconComponent === "function" ? <IconComponent size={20} /> : getIcon(item.name)}
                </div>
                <span className={styles.railLabel}>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <main 
          className={styles.contentArea} 
          data-active-subtab={currentPath === "basic-details" ? activeSubTab : undefined}
        >
          {/* Sub-tabs for Basic Details page */}
          {currentPath === "basic-details" && (
            <div className={styles.subTabsWrapper}>
              <button 
                className={`${styles.subTabBtn} ${activeSubTab === "about" ? styles.activeSubTabBtn : ""}`}
                onClick={() => setActiveSubTab("about")}
              >
                About
              </button>
              <button 
                className={`${styles.subTabBtn} ${activeSubTab === "address" ? styles.activeSubTabBtn : ""}`}
                onClick={() => setActiveSubTab("address")}
              >
                Address
              </button>
              <button 
                className={`${styles.subTabBtn} ${activeSubTab === "summary" ? styles.activeSubTabBtn : ""}`}
                onClick={() => setActiveSubTab("summary")}
              >
                Summary
              </button>
              <button 
                className={`${styles.subTabBtn} ${activeSubTab === "social-media" ? styles.activeSubTabBtn : ""}`}
                onClick={() => setActiveSubTab("social-media")}
              >
                Social
              </button>
            </div>
          )}

          <div className={styles.scrollWrapper}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
