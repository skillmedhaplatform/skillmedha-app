"use client";
import { useDispatch } from "react-redux";
import { useAppRouter } from "@/helpers/useAppRouter";
import { resetStudent } from "@/redux/slices/student";
import Cookies from "js-cookie";
import { Modal } from "antd";

export const useLogout = () => {
  const dispatch = useDispatch();
  const nav = useAppRouter();

  const handleLogout = () => {
    Modal.confirm({
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
        // 4. Remove client-side cookie (non-HTTP-only fallback)
        Cookies.remove("token");
        // 5. router.refresh() forces Next.js to re-run middleware with the
        //    now-deleted cookie, then replace to /login. Without this, the soft
        //    navigation can race against the cookie deletion and middleware
        //    bounces the user back to /dashboard or /tests.
        nav.refresh();
        const loginUrl = process.env.NEXT_PUBLIC_LOGIN_APP_URL || "http://localhost:2025";
        window.location.href = `${loginUrl}?portal=student`;
      },
    });
  };

  return handleLogout;
};

export default useLogout;
