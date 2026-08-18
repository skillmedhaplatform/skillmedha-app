"use client";
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import styles from "./adminMobileSidebar.module.scss";
import { RxHamburgerMenu } from "react-icons/rx";
import AdminMobileSidebarDrawer from "./AdminMobileSidebarDrawer";

export default function AdminMobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const nav = useRouter();

  // Close sidebar drawer automatically when navigating to another route
  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(false), 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  const handleLogoClick = () => {
    nav.replace("/admin/dashboard");
  };

  return (
    <>
      <header className={styles.mobileHeader}>
        {/* Toggle Button on Left Side */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={styles.hamburger}
          aria-label="Open navigation menu"
          aria-expanded={isOpen}
        >
          <RxHamburgerMenu />
        </button>

        {/* Small Column with Skillmedha Logo in the Middle */}
        <div className={styles.logo} onClick={handleLogoClick}>
          <img
            src="https://res.cloudinary.com/dug3awue8/image/upload/v1744626297/icon_dtclq9.svg"
            alt="SkillMedha Logo"
          />
          <div className={styles.logoText}>
            S K I L L <span> M E D H A</span>
          </div>
        </div>
      </header>

      {/* Slide-out Drawer */}
      <AdminMobileSidebarDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
