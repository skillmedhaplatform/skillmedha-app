"use client";
import React, { useEffect } from "react";
import { Spin } from "antd";

export default function UnifiedPortal() {
  useEffect(() => {
    const storedRole = localStorage.getItem("portalRole") || "student";
    const defaultViews = {
      student: "/student/dashboard",
      tpo: "/tpo/dashboard",
      company: "/company/profile",
      admin: "/admin/dashboard",
      testportal_admin: "/testportal_admin/myTests",
    };

    const targetUrl = defaultViews[storedRole] || "/student/dashboard";
    window.location.href = targetUrl;
  }, []);

  return (
    <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Spin size="large" description="Redirecting to your dashboard..." />
    </div>
  );
}
