"use client";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAppRouter } from "@/helpers/useAppRouter";
import styles from "./mobileSidebar.module.scss";
import { RxHamburgerMenu } from "react-icons/rx";
import MobileSidebarDrawer from "./MobileSidebarDrawer";
import useSpecialOrg from "@/helpers/useSpecialOrg";

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
      </header>

      {/* Slide-out Drawer */}
      <MobileSidebarDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
