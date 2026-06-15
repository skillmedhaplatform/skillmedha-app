"use client";
import SideNav from "@/modules/tpo/components/SideNav";
import TpoMobileSidebar from "@/modules/tpo/components/TpoMobileSidebar";
import React, { useEffect } from "react";
import main from "../main.module.scss";
import { getLstorage } from "@/utils/universalUtils/windowMW";
import { useDispatch, useSelector } from "react-redux";
import { GetOneUser } from "@/redux/slices/tpo/userSlice";
import { useRouter } from "@bprogress/next/app";
import { usePathname, useSearchParams } from "next/navigation";
import useResponsive from "@/hooks/useResponsive";
import PageStyles from "@/app/student/page.module.scss";

const GroupLayout = ({ children }) => {
  const dispatch = useDispatch();
  const nav = useRouter();
  const currPath = usePathname();
  const isMobile = useResponsive();

  const searchParams = useSearchParams();
  const token = getLstorage("token") || searchParams.get("token");
  const userId = getLstorage("userId") || searchParams.get("userId");

  useEffect(() => {
    if (!token || !userId) nav.replace("/tpo/login");
    if (!currPath.split("/")[2]) nav.replace("/tpo/myprofile/personal");
  }, [token]);

  const { status } = useSelector((state) => state.user.UserDetails);
  useEffect(() => {
    if (status === "idle") {
      dispatch(GetOneUser());
    }
  }, [status, dispatch]);

  return (
    <div className={PageStyles.pageContainer} style={{ flexDirection: isMobile ? "column" : "row" }}>
      {isMobile ? <TpoMobileSidebar /> : <SideNav />}
      <div className={PageStyles.rightColumn} style={{ height: isMobile ? "calc(100vh - 64px)" : "100%" }}>
        <div className={PageStyles.content} style={{ padding: 0, backgroundColor: "#eef5fb" }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default GroupLayout;
