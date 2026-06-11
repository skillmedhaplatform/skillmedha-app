"use client";
import {
  Users,
  Building2,
  GraduationCap,
  Briefcase,
  FolderTree,
  BookOpen,
  UserCog,
  Brain,
  Zap,
} from "lucide-react";
import styles from "./KPICards.module.scss";

export default function KPICards({ stats, loading }) {
  // ADD THIS FUNCTION
  const formatNumber = (num) => {
    if (!num) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(2) + "M";
    if (num >= 1000) return (num / 1000).toFixed(2) + "K";
    return num.toString();
  };

  const cards = [
    {
      title: "Colleges",
      value: stats.totalColleges,
      icon: GraduationCap,
      color: "purple",
    },
    {
      title: "Companies",
      value: stats.totalCompanies,
      icon: Building2,
      color: "indigo",
    },
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: Users,
      color: "green",
    },
    {
      title: "TPOs",
      value: stats.totalTPOs,
      icon: Users,
      color: "orange",
    },
    {
      title: "Company HRs",
      value: stats.totalHRs,
      icon: UserCog,
      color: "red",
    },
    {
      title: "Departments",
      value: stats.totalDepartments,
      icon: FolderTree,
      color: "cyan",
    },
    {
      title: "Total Jobs",
      value: stats.totalJobs,
      icon: Briefcase,
      color: "pink",
      subtitle: `${stats.totalAssignedJobs} assigned`,
    },
    {
      title: "Courses",
      value: stats.totalCourses,
      icon: BookOpen,
      color: "teal",
    },
    {
      title: "Internships",
      value: stats.totalInternships,
      icon: Briefcase,
      color: "violet",
    },
    // AI Usage Cards
    {
      title: "AI Tokens Used",
      value: formatNumber(stats.aiUsage?.totalTokens || 0),
      icon: Brain,
      color: "purple",
      subtitle: `${(stats.aiUsage?.totalTokens || 0).toLocaleString()} tokens`,
      isFormatted: true, // Flag to prevent double formatting
    },
    {
      title: "AI Requests",
      value: formatNumber(stats.aiUsage?.totalRequests || 0),
      icon: Zap,
      color: "blue",
      subtitle: `${(
        stats.aiUsage?.totalRequests || 0
      ).toLocaleString()} requests`,
      isFormatted: true, // Flag to prevent double formatting
    },
  ];

  if (loading) {
    return (
      <div className={styles.kpiGrid}>
        {[...Array(11)].map((_, i) => (
          <div key={i} className={`${styles.kpiCard} ${styles.loading}`}>
            <div className={styles.skeleton}></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.kpiGrid}>
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className={`${styles.kpiCard} ${styles[card.color]}`}
          >
            <div className={styles.iconWrapper}>
              <Icon size={24} />
            </div>
            <div className={styles.content}>
              <h3 className={styles.title}>{card.title}</h3>
              <p className={styles.value}>
                {card.isFormatted
                  ? card.value
                  : typeof card.value === "number"
                  ? card.value.toLocaleString()
                  : card.value}
              </p>
              {card.subtitle && (
                <p className={styles.subtitle}>{card.subtitle}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
