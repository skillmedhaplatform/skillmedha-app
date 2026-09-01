"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";
import SideBar from "@/modules/company/components/sideBar";
import { getLstorage } from "@/utils/universalUtils/windowMW";
import PageStyles from "@/app/student/page.module.scss";
import useResponsive from "@/hooks/useResponsive";

export default function Home({ children }) {
  const nav = useRouter();
  const currPath = usePathname();
  const token = getLstorage("token");
  const isMobile = useResponsive();


  // useEffect(() => {
  //   if (token == undefined || token == null || token == "" || !token)
  //     nav.replace("/login");
  //   if (!currPath.split("/")[1]) nav.replace("/tests");
  // }, [token]);

  // useEffect(() => {
  //   const studentId = getLstorage("sId");
  //   if (studentId && !studentCreds?._id) {
  //     dispatch(getStudent({ id: studentId }));
  //   }
  // }, [token, studentCreds?._id]);

  useEffect(() => {
    if (currPath == "/") {
      nav.replace("/company/profile");
    }
  }, []);

  return (
    <div className={PageStyles.pageContainer} style={{ flexDirection: isMobile ? "column" : "row" }}>
      {/* TODO: Add MobileSidebar later if needed, use SideBar for now */}
      <SideBar isMobile={isMobile} />
      <div className={PageStyles.rightColumn} style={{ height: isMobile ? "calc(100vh - 64px)" : "100%" }}>
        <div className={PageStyles.content} style={{ padding: 0, backgroundColor: "#eef5fb" }}>
          <Suspense fallback={null}>
            {children}
          </Suspense>
        </div>
      </div>
    </div>
  );
}

