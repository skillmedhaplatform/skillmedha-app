"use client";
import React, { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import useSpecialOrg from "@/helpers/useSpecialOrg";

export default function StudentPortalBackGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isSpecialOrg } = useSpecialOrg();
  const homeRoute = isSpecialOrg ? "/student/tests" : "/student/dashboard";

  const [showWebsitePopup, setShowWebsitePopup] = useState(false);
  const backPressCountRef = useRef(0);
  const backPressTimerRef = useRef(null);

  useEffect(() => {
    const guardKey = "sm_portal_guard";

    // Push initial guard state to history
    try {
      window.history.pushState({ [guardKey]: true, t: Date.now() }, "", window.location.href);
    } catch (e) {}

    // On user interaction (click/touch/key), ensure a user-gesture backed entry is in history
    const onUserInteraction = () => {
      try {
        window.history.pushState({ [guardKey]: true, t: Date.now() }, "", window.location.href);
      } catch (e) {}
    };
    window.addEventListener("click", onUserInteraction, { once: true, passive: true });
    window.addEventListener("keydown", onUserInteraction, { once: true, passive: true });

    const handlePopState = () => {
      backPressCountRef.current += 1;
      clearTimeout(backPressTimerRef.current);
      backPressTimerRef.current = setTimeout(() => {
        backPressCountRef.current = 0;
      }, 3500);

      // Always push guard state back immediately so the user cannot exit the portal via Back button
      try {
        window.history.pushState({ [guardKey]: true, t: Date.now() }, "", window.location.href);
      } catch (e) {}

      const currentPath = window.location.pathname;
      const isAtHome =
        currentPath === homeRoute ||
        currentPath === "/student/dashboard" ||
        currentPath === "/student/dashboard/" ||
        currentPath === "/student/tests" ||
        currentPath === "/student/tests/";

      if (!isAtHome) {
        // If student is on ANY page other than dashboard/home, redirect directly to Student Dashboard
        try {
          router.replace(homeRoute);
        } catch (e) {
          window.location.replace(homeRoute);
        }
      }

      // If clicked Back multiple times (>= 2 times)
      if (backPressCountRef.current >= 2) {
        setShowWebsitePopup(true);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("click", onUserInteraction);
      window.removeEventListener("keydown", onUserInteraction);
      clearTimeout(backPressTimerRef.current);
    };
  }, [pathname, homeRoute, router]);

  useEffect(() => {
    if (showWebsitePopup) {
      const timer = setTimeout(() => setShowWebsitePopup(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [showWebsitePopup]);

  const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:8080";

  return (
    <>
      {children}

      {showWebsitePopup && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 999999,
            maxWidth: "480px",
            width: "92vw",
            animation: "fadeIn 0.3s ease",
          }}
        >
          <div
            style={{
              backgroundColor: "#0f172a",
              color: "#ffffff",
              padding: "14px 18px",
              borderRadius: "16px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(37, 99, 235, 0.2)",
                  color: "#60a5fa",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.25rem",
                  flexShrink: 0,
                }}
              >
                🌐
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "0.88rem", fontWeight: "600", color: "#ffffff" }}>
                  Looking to return to the website?
                </p>
                <p style={{ margin: "2px 0 0 0", fontSize: "0.78rem", color: "#94a3b8" }}>
                  Click <strong>&apos;Visit Website&apos;</strong> in the sidebar to return to the website.
                </p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
              <a
                href={`${websiteUrl}/`}
                style={{
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  padding: "7px 14px",
                  borderRadius: "20px",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  transition: "background-color 0.2s",
                  display: "inline-block",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1d4ed8")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2563eb")}
              >
                Visit Website
              </a>
              <button
                onClick={() => setShowWebsitePopup(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  fontSize: "1rem",
                  padding: "4px",
                  lineHeight: 1,
                }}
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
