"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
const MyjobsHome = dynamic(
  () => import("./components/myjobsHome"),
  { ssr: false }
);
import { useDispatch } from "react-redux";
import { getAllJobs } from "@/redux/slices/company/placementsSlice";

export default function Page() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(
      getAllJobs({
        page: 1,
        limit: 20,
        status: "active",
      })
    );
  }, []);
  return <MyjobsHome />;
}
