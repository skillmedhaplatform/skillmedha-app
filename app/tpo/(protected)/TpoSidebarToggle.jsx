"use client";
import useResponsive from "@/hooks/useResponsive";
import SideNav from "@/modules/tpo/components/SideNav";
import TpoMobileSidebar from "@/modules/tpo/components/TpoMobileSidebar";
import PageStyles from "@/app/student/page.module.scss";

export default function TpoSidebarToggle({ children }) {
  const isMobile = useResponsive();

  return (
    <div
      className={PageStyles.pageContainer}
      style={{
        flexDirection: isMobile ? "column" : "row",
      }}
    >
      {isMobile ? <TpoMobileSidebar /> : <SideNav />}
      <div
        className={PageStyles.rightColumn}
        style={{
          height: isMobile ? "calc(100vh - 64px)" : "100%",
        }}
      >
        <div
          className={PageStyles.content}
          style={{
            padding: 0,
            backgroundColor: isMobile ? "#f8fafc" : "#ffffff",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
