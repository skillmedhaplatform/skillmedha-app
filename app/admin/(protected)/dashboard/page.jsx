// src/app/dashboard/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const dispatch = useDispatch();
  const { user: userState, isAuthenticated } = useSelector((state) => state.adminAuth || {});
  const user = userState?.value?.user;
  const authLoading = userState?.loading;
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

  // Redirect to admin login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/admin/login");
    }
  }, [authLoading, isAuthenticated, router]);

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
    return null;
  }

  return (
    <div className={styles.dashboardContainer}>
      {/* <DashboardHeader user={user} /> */}

      <main className={styles.mainContent}>
        <div className={styles.contentWrapper}>

          {/* KPI Cards */}
          <section className={styles.kpiSection}>
            <KPICards stats={stats} loading={loading.stats} />
          </section>
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
      </main>
    </div>
  );
}
