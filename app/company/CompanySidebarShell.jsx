"use client";
import { Suspense } from "react";
import Header from "@/modules/company/components/header";
import SideBar from "@/modules/company/components/sideBar";
import PageStyles from "./page.module.scss";

export default function CompanySidebarShell({ children }) {
  return (
    <div className={PageStyles.pageContainer}>
      <div className={PageStyles.pageBody}>
        <SideBar />

        <div className={PageStyles.mainContentWrapper}>
          <Suspense fallback={null}>
            <Header />
          </Suspense>
          <div className={PageStyles.content}>{children}</div>
        </div>
      </div>
    </div>
  );
}
