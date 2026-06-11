"use client";
import Header from "@/modules/testportal_admin/components/reusable-comps/header";
import SideBar from "@/modules/testportal_admin/components/reusable-comps/sideBar";
import React, { useEffect, useState } from "react";
import PageStyles from "../page.css";
import { getLstorage } from "@/utils/windowMW";
import { useDispatch } from "react-redux";
import { GetOneUser } from "@/redux/slices/testportal_admin/slice/test";
import { useRouter } from "@bprogress/next/app";
import { usePathname, useSearchParams } from "next/navigation";

const GroupLayout = ({ children }) => {
  const dispatch = useDispatch();
  const nav = useRouter();
  const currPath = usePathname();
  const searchParams = useSearchParams();

  const token = getLstorage("token") || searchParams.get("token");
  const businessId = getLstorage("businessId") || searchParams.get("businessId");

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!token) nav.replace("/testportal_admin/login");
    // Ensure we don't fall into the root of testportal_admin (since it used to be /myTests in old codebase)
    if (currPath === "/testportal_admin" || currPath === "/testportal_admin/") {
      nav.replace("/testportal_admin/myTests");
    }
  }, [token, currPath]);

  useEffect(() => {
    if (token) {
      dispatch(GetOneUser());
    }
  }, [token, dispatch]);

  if (!mounted || !token) return null;

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header />
      <div className="body" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <SideBar />
        <div className="content" style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f5f5f5' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default GroupLayout;
