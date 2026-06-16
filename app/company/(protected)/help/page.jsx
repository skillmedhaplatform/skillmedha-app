// pages/proctor/dashboard.js
"use client";

import { getLstorage } from "@/utils/universalUtils/windowMW";
import ProctorDashboard from "./proctoringDash";

export default function ProctorDashboardPage() {
  const token = getLstorage("token");

  if (!token) {
    return <div>Please login as a proctor</div>;
  }

  return (
    <ProctorDashboard token={token} />
  );
}
