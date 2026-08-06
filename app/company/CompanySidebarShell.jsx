"use client";
import React from "react";
import SideBar from "@/modules/company/components/sideBar";
import PageStyles from "@/app/student/page.module.scss";
import useResponsive from "@/hooks/useResponsive";
import { Suspense } from "react";

export default function CompanySidebarShell({ children }) {
  const isMobile = useResponsive();

  return (
    <div className={PageStyles.pageContainer} style={{ flexDirection: isMobile ? "column" : "row" }}>
      {/* TODO: Add MobileSidebar later if needed, use SideBar for now */}
      <SideBar isMobile={isMobile} />
      <div className={PageStyles.rightColumn} style={{ height: isMobile ? "calc(100vh - 64px)" : "100%" }}>
        <div className={PageStyles.content} style={{ padding: 0, backgroundColor: "#eef5fb" }}>
          <Suspense fallback={null}>
            {children}
          </Suspense>
        </div>
      </div>
    </div>
  );
}
