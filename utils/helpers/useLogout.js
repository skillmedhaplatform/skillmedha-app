"use client";
import { useDispatch } from "react-redux";
import { useAppRouter } from "@/helpers/useAppRouter";
import { resetStudent } from "@/redux/slices/student";
import Cookies from "js-cookie";
import { App } from "antd";

export const useLogout = () => {
  const dispatch = useDispatch();
  const nav = useAppRouter();
  const { modal } = App.useApp();

  const handleLogout = () => {
    modal.confirm({
      title: "Are you sure you want to logout?",
      content: "You will need to login again to access your account.",
      okText: "Yes, Logout",
      okType: "danger",
      cancelText: "No",
      async onOk() {
        // 1. Clear storage first — token gone, ProtectedShell won't re-fetch
        localStorage.clear();
        sessionStorage.clear();
        // 2. Clear Redux student state
        dispatch(resetStudent());
        // 3. AWAIT cookie deletion (HTTP-only token is removed server-side)
        try {
          await fetch("/api/auth/session", { method: "DELETE" });
        } catch (e) {
          console.error(e);
        }
        // 4. Remove client-side cookies
        const isProd = typeof window !== "undefined" && window.location.hostname.includes("skillmedha.com");
        const domainOpts = isProd ? { domain: ".skillmedha.com", path: "/" } : { path: "/" };
        Cookies.remove("token", domainOpts);
        Cookies.remove("sm_student_session", domainOpts);
        Cookies.remove("token", { path: "/" });
        Cookies.remove("sm_student_session", { path: "/" });

        // 5. Automatically redirect to the public website instead of the login page
        const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:8080";
        window.location.href = `${websiteUrl}/`;
      },
    });
  };

  return handleLogout;
};

export default useLogout;
