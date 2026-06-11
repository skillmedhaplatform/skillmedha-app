import React from "react";
import styles from "./layout.module.scss";
import Header from "@/modules/admin/components/header/header";
import SideBar from "@/modules/admin/components/sidebar/sideBar";
import UserDataLayer from "@/modules/admin/components/dal/UserDataLayer";

export default function layout({ children }) {
  return (
    <UserDataLayer>
      <div className={styles.mainCont}>
        <div className={styles.header}>
          <Header />
        </div>
        <div className={styles.bottom}>
          <div className={styles.sidebar}>
            <SideBar />
          </div>
          <div className={styles.content}>{children}</div>
        </div>
      </div>
    </UserDataLayer>
  );
}
