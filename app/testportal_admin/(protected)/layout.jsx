"use client";
import React, { useEffect, useState } from "react";
import SideBar from "@/modules/testportal_admin/components/reusable-comps/sideBar";
import Header from "@/mainLayout/header";
import PageHeader from "@/modules/tpo/components/PageHeader";
import PageStyles from "@/app/student/page.module.scss";
import { getLstorage } from "@/utils/windowMW";
import { useDispatch, useSelector } from "react-redux";
import { GetOneUser } from "@/redux/slices/testportal_admin/slice/test";
import { useRouter } from "next/navigation";
import { usePathname, useSearchParams } from "next/navigation";
import useResponsive from "@/hooks/useResponsive";
import { 
  InfoCircleOutlined, 
  QuestionCircleOutlined, 
  LockOutlined, 
  PlayCircleOutlined, 
  HistoryOutlined, 
  ClockCircleOutlined 
} from "@ant-design/icons";

const GroupLayout = ({ children }) => {
  const dispatch = useDispatch();
  const nav = useRouter();
  const currPath = usePathname();
  const searchParams = useSearchParams();
  const isMobile = useResponsive();

  const token = getLstorage("token") || searchParams.get("token");

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!token) nav.replace("/testportal_admin/login");
    if (currPath === "/testportal_admin" || currPath === "/testportal_admin/") {
      nav.replace("/testportal_admin/myTests");
    }
  }, [token, currPath]);

  useEffect(() => {
    if (token) {
      dispatch(GetOneUser());
    }
  }, [token, dispatch]);

  const SingleTest = useSelector((state) => state.tests.test);

  const isTestEditPage = currPath.includes("/testportal_admin/myTests/") && currPath.split("/").length >= 5;

  if (!mounted || !token) return null;

  const getPageInfo = (path) => {
    if (path.includes("myTests")) return { title: "My Tests", subtitle: "Manage and track all your tests" };
    if (path.includes("question-bank")) return { title: "Question Bank", subtitle: "Manage your questions and categories" };
    if (path.includes("results-database")) return { title: "Results Database", subtitle: "View and analyze test results" };
    if (path.includes("users")) return { title: "Students", subtitle: "Manage student profiles and access" };
    return { title: "Test Portal", subtitle: "Welcome to Test Portal Admin" };
  };

  const pageInfo = getPageInfo(currPath);

  return (
    <div className={PageStyles.pageContainer} style={{ flexDirection: isMobile ? "column" : "row" }}>
      <SideBar />
      <div className={PageStyles.rightColumn} style={{ height: isMobile ? "calc(100vh - 64px)" : "100%" }}>
        <Header isHeaderVisible={true} />
        <PageHeader 
          title={isTestEditPage ? (SingleTest?.title || "Test Details") : pageInfo.title} 
          subtitle={isTestEditPage ? "Edit and configure test details" : pageInfo.subtitle} 
          showGreeting={false} 
        />
        <div className={PageStyles.content} style={{ padding: 0, backgroundColor: "#eef5fb" }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default GroupLayout;
