"use client";
import React, { useEffect } from "react";

import JobHeader from "./components/filters";
import MainComp from "./components/mainComp";
import { useDispatch } from "react-redux";
import { GetAllJobs } from "@/redux/slices/jobopenings";
import { useRouter, useSearchParams } from "next/navigation";
import useResponsive from "@/hooks/useResponsive";
import MobileJobOpenings from "@/mobile_views/jobopenings/MobileJobOpenings";

export default function JobOpenings() {
  const router = useRouter();
  const dispatch = useDispatch();
  const isMobile = useResponsive();

  useEffect(() => {
    dispatch(GetAllJobs({ limit: 10, fetchType: "initial" }));
  }, []);

  if (isMobile) {
    return <MobileJobOpenings />;
  }

  return (
    <div className="flex flex-col p-4 h-[calc(100vh-80px)] overflow-hidden">
      <JobHeader />
      <div className="flex-1 overflow-hidden h-full">
        <MainComp />
      </div>
    </div>
  );
}
