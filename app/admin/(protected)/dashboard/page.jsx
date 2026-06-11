// src/app/dashboard/page.js
"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAiUsageGrowth,
  fetchCourseAnalytics,
  fetchJobActivity,
  fetchPlacementAnalytics,
  fetchRevenueAnalytics,
  fetchDashboardStats,
  fetchGrowthStats,
  fetchOrganizations,
} from "@/redux/slices/admin/adminDashboardSlice";
import DashboardHeader from "@/modules/admin/components/dashboard/DashboardHeader";
import KPICards from "@/modules/admin/components/dashboard/KPICards";
import OrganizationsTable from "@/modules/admin/components/dashboard/OrganizationsTable";
import OrganizationModal from "@/modules/admin/components/dashboard/OrganizationModal";
import GrowthCharts from "@/modules/admin/components/dashboard/GrowthCharts";
import CourseAnalytics from "@/modules/admin/components/dashboard/CourseAnalytics";
import JobAnalytics from "@/modules/admin/components/dashboard/JobAnalytics";
import RevenueAnalytics from "@/modules/admin/components/dashboard/RevenueAnalytics";
import styles from "./dashboard.module.scss";
import AIUsageChart from "@/modules/admin/components/dashboard/AIUsageChart"; // NEW

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { user: userState, isAuthenticated } = useSelector((state) => state.adminAuth || {});
  const user = userState?.value?.user;
  const {
    stats,
    organizations,
    growthData,
    loading,
    selectedOrg,
    aiUsageGrowth,
    analytics // destructure analytics from state
  } = useSelector((state) => state.adminDashboard || {});

  const [selectedOrgId, setSelectedOrgId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState("all"); // all, college, company

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchDashboardStats());
      dispatch(fetchOrganizations());
      dispatch(fetchGrowthStats("6months"));
      dispatch(fetchAiUsageGrowth("6months"));
      
      // Dispatch new analytics actions
      dispatch(fetchCourseAnalytics());
      dispatch(fetchJobActivity());
      dispatch(fetchPlacementAnalytics());
      dispatch(fetchRevenueAnalytics());
    }
  }, [dispatch, isAuthenticated]);
  const handlePeriodChange = (period) => {
    dispatch(fetchGrowthStats(period));
  };

  const handleAiPeriodChange = (period) => {
    dispatch(fetchAiUsageGrowth(period));
  };
  if (!isAuthenticated) {
    return (
      <div className={styles.unauthorized}>
        <div className={styles.unauthorizedContent}>
          <div className={styles.unauthorizedIcon}>🔒</div>
          <h1>Unauthorized Access</h1>
          <p>Please login to continue</p>
          <button className={styles.loginButton}>Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      {/* <DashboardHeader user={user} /> */}

      <main className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          {/* Header Section */}
          <div className={styles.pageHeader}>
            <div className={styles.headerLeft}>
              <h2 className={styles.pageTitle}>Dashboard Overview</h2>
              <p className={styles.pageSubtitle}>
                Welcome back, <span>{user?.email || "Admin"}</span>
              </p>
            </div>
            <div className={styles.headerRight}>
              <button
                className={styles.refreshButton}
                onClick={() => {
                  dispatch(fetchDashboardStats());
                  dispatch(fetchOrganizations());
                  dispatch(fetchCourseAnalytics());
                  dispatch(fetchJobActivity());
                  dispatch(fetchPlacementAnalytics());
                  dispatch(fetchRevenueAnalytics());
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M13.65 2.35C12.2 0.9 10.21 0 8 0 3.58 0 0.01 3.58 0.01 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L9 7h7V0l-2.35 2.35z"
                    fill="currentColor"
                  />
                </svg>
                Refresh
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <section className={styles.kpiSection}>
            <KPICards stats={stats} loading={loading.stats} />
          </section>
        </div>
      </main>
      <section className={styles.section}>
        <AIUsageChart
          data={aiUsageGrowth}
          loading={loading.aiUsage}
          onPeriodChange={handleAiPeriodChange}
        />
        <GrowthCharts
          data={growthData}
          loading={loading.growth}
          onPeriodChange={handlePeriodChange}
        />
      </section>

      {/* New Analytics Section */}
      <section className={`${styles.section} ${styles.analyticsGrid}`}>
         <div className={styles.analyticsColumn}>
            <CourseAnalytics 
              data={analytics?.courses} 
              loading={loading.analytics} 
            />
         </div>
         <div className={styles.analyticsColumn}>
            <JobAnalytics 
              jobData={analytics?.jobs} 
              placementData={analytics?.placements}
              loading={loading.analytics} 
            />
         </div>
         <div className={styles.analyticsColumn}>
            <RevenueAnalytics 
              data={analytics?.revenue} 
              loading={loading.analytics} 
            />
         </div>
      </section>
    </div>
  );
}
