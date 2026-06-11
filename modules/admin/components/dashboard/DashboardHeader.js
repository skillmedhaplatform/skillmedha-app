"use client";

import { useDispatch } from "react-redux";
import { logout } from "@/redux/slices/admin/adminAuthSlice";
import { LogOut, User } from "lucide-react";
import styles from "./DashboardHeader.module.scss";

export default function DashboardHeader({ user }) {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    // Redirect to login if needed
    window.location.href = '/login';
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <h1>Skillmedha Admin</h1>
        </div>

        <div className={styles.userSection}>
          <div className={styles.userInfo}>
            <User size={20} />
            <span>{user?.email || "Admin"}</span>
          </div>

          <button className={styles.logoutButton} onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
