"use client";
import { usePathname, useRouter } from "next/navigation";
// removed duplicate
import { useEffect, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import { message } from "antd";
import { ConfigProvider } from "antd";
import SideBar from "@/modules/company/components/sideBar";
import { getLstorage } from "@/utils/universalUtils/windowMW";
import Image from "next/image";
import { imgUrls } from "@/utils/universalUtils/images";
import { setSearchTerm } from "@/redux/slices/searchFunctions";
import PageStyles from "@/app/student/page.module.scss";
import useResponsive from "@/hooks/useResponsive";

export default function Home({ children }) {
  const nav = useRouter();
  const currPath = usePathname();
  const token = getLstorage("token");
  const isMobile = useResponsive();

  const dispatch = useDispatch();

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
  const handleInputChange = (e) => {
    dispatch(setSearchTerm(e.target.value));
  };

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
