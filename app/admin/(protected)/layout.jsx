import React from "react";
import styles from "./layout.module.scss";
import Header from "@/modules/admin/components/header/header";
import SideBar from "@/modules/admin/components/sidebar/sideBar";
import UserDataLayer from "@/modules/admin/components/dal/UserDataLayer";
import AdminBanner from "@/modules/admin/components/banner/AdminBanner";
import AdminProgressProvider from "./AdminProgressProvider";

export const metadata = {
  title: "Admin Portal | SkillMedha",
  description: "SkillMedha Admin Dashboard",
};

export default function layout({ children }) {
  return (
    <UserDataLayer>
      <AdminProgressProvider>
        <div className={styles.pageContainer}>
          <SideBar />
          <div className={styles.rightColumn}>
            <Header />
            <AdminBanner />
            <div className={styles.content}>
              {children}
            </div>
          </div>
        </div>
      </AdminProgressProvider>
    </UserDataLayer>
  );
}
