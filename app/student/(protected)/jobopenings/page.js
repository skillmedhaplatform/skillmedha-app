"use client";
import React, { useEffect } from "react";
import { HiOutlineBriefcase } from "react-icons/hi2";

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
  const searchParams = useSearchParams();

  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "10";
  const search = searchParams.get("search") || "";
  const profileName = searchParams.get("profileName") || "all";
  const sort = searchParams.get("sort") || "createdAt";

  useEffect(() => {
    const queryObj = {};
    if (search) queryObj.search = search;
    if (profileName && profileName !== "all") queryObj.profileName = profileName;
    if (sort) queryObj.sort = sort;

    dispatch(
      GetAllJobs({
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        queryObj,
      })
    );
  }, [page, limit, search, profileName, sort, dispatch]);

  if (isMobile) {
    return <MobileJobOpenings />;
  }

  return (
    <div className="flex flex-col gap-0 relative bg-white h-screen overflow-hidden">
      <div className="w-full h-[140px] min-h-[140px] flex flex-col justify-center p-4 lg:px-8 shadow-sm bg-gradient-to-br from-[#071631] to-[#10254c] text-white shrink-0 relative overflow-hidden z-[2]">
        {/* Decorative Icons */}
        <div className="absolute inset-0 pointer-events-none z-[1]">
          <div className="absolute top-[20%] right-[10%] text-[#1E69DA] opacity-60 text-[1.2rem]">✕</div>
          <div className="absolute bottom-[20%] right-[30%] text-[#1E69DA] opacity-50 text-[1.5rem]">+</div>
          <div className="absolute top-[40%] right-[50%] text-[#1E69DA] opacity-50 text-[1.1rem]">★</div>
          <div className="absolute bottom-[30%] right-[5%] text-[#1E69DA] opacity-60 text-[1.3rem]">✕</div>
        </div>

        {/* Top half: Title & Stats */}
        <div className="flex items-center justify-between w-full relative z-[2]">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-[56px] h-[56px] bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10 shrink-0">
              <HiOutlineBriefcase className="text-white text-3xl" />
            </div>
            <div className="flex flex-col justify-center gap-1">
              <h1
                className="text-[24px] lg:text-[28px] font-bold text-white m-0 tracking-tight leading-none flex items-center gap-3 pb-0"
                style={{ border: 'none', marginBottom: 0 }}
              >
                Job Openings
              </h1>
              <p className="text-white/90 text-[14px] lg:text-[15px] m-0 leading-tight" style={{ marginTop: 0 }}>
                Find your next big opportunity and start your career journey.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col p-4 flex-1 overflow-hidden h-full">
        <JobHeader />
        <div className="flex-1 overflow-hidden h-full">
          <MainComp />
        </div>
      </div>
    </div>
  );
}
