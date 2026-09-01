"use client";
import React from "react";
import styles from "./layout.module.scss";
import Header from "@/modules/admin/components/header/header";
import SideBar from "@/modules/admin/components/sidebar/sideBar";
import AdminBanner from "@/modules/admin/components/banner/AdminBanner";
import useResponsive from "@/hooks/useResponsive";
import AdminMobileSidebar from "./mobileView/AdminMobileSidebar";

export default function AdminSidebarShell({ children }) {
  const isMobile = useResponsive();

  return (
    <div className={styles.pageContainer} style={{ flexDirection: isMobile ? "column" : "row" }}>
      {isMobile ? (
        <AdminMobileSidebar />
      ) : (
        <SideBar />
      )}
      <div className={styles.rightColumn} style={{ height: isMobile ? "calc(100vh - 64px)" : "100%" }}>
        <Header />
        <AdminBanner />
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
}
