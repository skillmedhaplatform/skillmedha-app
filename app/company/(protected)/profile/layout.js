"use client";
export const dynamic = "force-dynamic";
import React, { useEffect, useState } from "react";
import styles from "./layout.module.scss";
import { useSelector } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import {
  FaUser,
  FaCheckCircle,
} from "react-icons/fa";
import { BsPlus, BsX, BsStar } from "react-icons/bs";
import axios from "axios";
import { getLstorage } from "@/utils/universalUtils/windowMW";
import { restUrl } from "@/utils/universalUtils/urls";

const basePath = "/company/profile";
export const profileSidebarItems = [
  { name: "Basic Details", path: `${basePath}/details` },
];

export default function ProfileLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const USER_DETAILS = useSelector((state) => state?.user?.singleUser || null);

  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplicants: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = getLstorage("token");
        const response = await axios.get(
          `${restUrl}/getAllJobs?limit=1000`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const allJobs = response.data?.data || [];
        
        let applicantsCount = 0;
        let activeJobsCount = 0;

        allJobs.forEach((job) => {
          if (job.status === "active") {
            activeJobsCount++;
          }
          if (
            job.status === "active" &&
            job.applicants &&
            Array.isArray(job.applicants)
          ) {
            applicantsCount += job.applicants.length;
          }
        });

        setStats({
          totalJobs: activeJobsCount,
          totalApplicants: applicantsCount,
        });
      } catch (err) {
        console.error("Failed to fetch jobs stats:", err);
      }
    };
    fetchStats();
  }, []);

  const name = USER_DETAILS?.companyName || "Company Name";
  const email = USER_DETAILS?.email || "company@email.com";
  const phone = USER_DETAILS?.phone || USER_DETAILS?.contactNumber || "+91 987877xxxxx";
  const isVerified = USER_DETAILS?.verified || false;

  const getInitials = (nameStr) => {
    const parts = nameStr.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return nameStr.slice(0, 2).toUpperCase();
  };
  const initials = getInitials(name);

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
          {/* Identity Area */}
          <div className={styles.identityArea}>
            <div className={styles.avatarWrapper}>
              {USER_DETAILS?.companyLogo ? (
                <img
                  src={USER_DETAILS.companyLogo}
                  alt="Profile Logo"
                  className={styles.avatarImage}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <div className={styles.avatarInitials}>{initials}</div>
              )}
              {isVerified && (
                <div className={styles.avatarCheckmark}>
                  <FaCheckCircle />
                </div>
              )}
            </div>
            
            <div className={styles.identityDetails}>
              <div className={styles.nameRow}>
                <h1 className={styles.coordName}>{name}</h1>
                {isVerified && (
                  <span className={styles.designationBadge}>
                    <FaCheckCircle style={{ marginRight: '4px', fontSize: '0.85em' }} />
                    Verified
                  </span>
                )}
              </div>
              <div className={styles.metaRow}>
                <span>{email}</span>
                <span className={styles.divider}>•</span>
                <span>{phone}</span>
              </div>
            </div>
          </div>

          {/* Quick Statistics Area */}
          <div className={styles.statsArea}>
            <div className={styles.statBox}>
              <span className={styles.statVal}>{stats.totalJobs}</span>
              <span className={styles.statLabel}>JOBS</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statBox}>
              <span className={styles.statVal}>{stats.totalApplicants}</span>
              <span className={styles.statLabel}>APPLICANTS</span>
            </div>
          </div>
        </div>

      </div>

      {/* Profile Navigation Tabs */}
      <div className={styles.tabsWrapper}>
        <div className={styles.tabsRow}>
          {profileSidebarItems.map((item) => {
            const currentPathEnd = pathname.split("/").pop();
            const itemPathEnd = item.path.split("/").pop();
            const isActive = currentPathEnd === itemPathEnd;
            return (
              <div
                key={item.path}
                className={`${styles.tabItem} ${isActive ? styles.activeTab : ""}`}
                onClick={() => handleTabClick(item.path)}
              >
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
