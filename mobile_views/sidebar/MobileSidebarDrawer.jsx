"use client";
import React, { useEffect } from "react";
import styles from "./mobileSidebar.module.scss";
import SideBar from "@/mainLayout/sideBar";

export default function MobileSidebarDrawer({ isOpen, onClose }) {
  // Prevent body scroll when drawer is open
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
      <div className={`${styles.drawer} ${isOpen ? styles.open : ""}`} role="dialog" aria-modal="true">
        {/* Drawer Content - rendering the exact same Desktop SideBar */}
        <div className={styles.drawerContent}>
          <SideBar />
        </div>
      </div>
    </>
  );
}
