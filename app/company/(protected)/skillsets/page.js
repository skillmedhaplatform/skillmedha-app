"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
const AllCandidates = dynamic(
  () => import("./components/allCandidates"),
  { ssr: false }
);
import { useDispatch } from "react-redux";
import {
  fetchAllStudents,
  fetchPartnerColleges,
} from "@/redux/slices/company/skillMedhaData";

export default function Page() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchPartnerColleges());
    dispatch(fetchAllStudents());
  }, []);

  return <AllCandidates />;
}
