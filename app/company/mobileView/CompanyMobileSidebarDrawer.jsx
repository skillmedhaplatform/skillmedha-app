"use client";
import React, { useEffect } from "react";
import styles from "./companyMobileSidebar.module.scss";
import SideBar from "@/modules/company/components/sideBar";

export default function CompanyMobileSidebarDrawer({ isOpen, onClose }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Dimmed Overlay */}
      <div
        className={`${styles.overlay} ${isOpen ? styles.open : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in Drawer Container */}
      <div
        className={`${styles.drawer} ${isOpen ? styles.open : ""}`}
        role="dialog"
        aria-modal="true"
      >
        <div className={styles.drawerContent}>
          <SideBar isMobile={false} />
        </div>
      </div>
    </>
  );
}
