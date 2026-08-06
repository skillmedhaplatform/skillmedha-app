"use client";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAppRouter } from "@/helpers/useAppRouter";
import styles from "./mobileSidebar.module.scss";
import { RxHamburgerMenu } from "react-icons/rx";
import MobileSidebarDrawer from "./MobileSidebarDrawer";
import useSpecialOrg from "@/helpers/useSpecialOrg";
import { FiBell, FiAward } from "react-icons/fi";

export default function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const nav = useAppRouter();
  const { isSpecialOrg } = useSpecialOrg();

  // Close sidebar drawer automatically when navigating to another route
  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(false), 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  const handleLogoClick = () => {
    nav.replace(isSpecialOrg ? "/student/tests" : "/student/dashboard");
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

        {(pathname === "/student/dashboard" || pathname === "/student/talktoai" || pathname === "/student/resumeBuilder") && (
          <div className={styles.headerActions}>
            <button 
              className={styles.actionBtn} 
              onClick={() => {
                if (pathname === "/student/dashboard") {
                  window.dispatchEvent(new CustomEvent('open-achievements'));
                } else {
                  nav.push('/student/dashboard#openBadges_Technical');
                }
              }}
            >
              <FiAward />
            </button>
            <button 
              className={styles.actionBtn} 
              onClick={() => {
                if (pathname === "/student/dashboard") {
                  window.dispatchEvent(new CustomEvent('open-notices'));
                } else {
                  nav.push('/student/dashboard#openNotices');
                }
              }}
            >
              <FiBell />
            </button>
          </div>
        )}
      </header>

      {/* Slide-out Drawer */}
      <MobileSidebarDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
