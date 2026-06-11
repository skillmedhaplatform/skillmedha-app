"use client";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "@bprogress/next/app";
import styles from "@/mobile_views/sidebar/mobileSidebar.module.scss";
import { RxHamburgerMenu } from "react-icons/rx";
import SideNav from "./SideNav";

export default function TpoMobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Close sidebar drawer automatically when navigating to another route
  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(false), 0);
    return () => clearTimeout(timer);
  }, [pathname]);

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

  const handleLogoClick = () => {
    router.replace("/tpo/dashboard");
  };

  return (
    <>
      <header className={styles.mobileHeader}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={styles.hamburger}
          aria-label="Open navigation menu"
          aria-expanded={isOpen}
        >
          <RxHamburgerMenu />
        </button>
        
        <div className={styles.logo} onClick={handleLogoClick}>
          <img
            src="https://res.cloudinary.com/dug3awue8/image/upload/v1744626297/icon_dtclq9.svg"
            alt="SkillMedha Logo"
          />
          <div className={styles.logoText}>
            SKILL<span>MEDHA</span>
          </div>
        </div>
      </header>

      {/* Dimmed Overlay */}
      <div
        className={`${styles.overlay} ${isOpen ? styles.open : ""}`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Slide-in Drawer Container */}
      <div className={`${styles.drawer} ${isOpen ? styles.open : ""}`} role="dialog" aria-modal="true">
        <div className={styles.drawerContent}>
          <SideNav />
        </div>
      </div>
    </>
  );
}
