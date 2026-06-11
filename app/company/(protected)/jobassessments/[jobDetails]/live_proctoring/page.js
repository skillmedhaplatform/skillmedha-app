"use client";

import React from "react";
import { getLstorage } from "@/utils/universalUtils/windowMW";
import Home from "@/app/page";
import ProctorDashboard from "@/app/company/(protected)/help/proctoringDash";

export default function LiveProc() {
  const token = getLstorage("token");
  if (!token) {
    return <div>Please login as a proctor</div>;
  }

  return (
    <Home>
      <ProctorDashboard token={token} />
    </Home>
  );
}
