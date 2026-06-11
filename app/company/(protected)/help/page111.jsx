// pages/proctor/dashboard.js
"use client";

import { getLstorage } from "@/utils/universalUtils/windowMW";
import ProctorDashboard from "./proctoringDash";
import Home from "@/app/company/CompanyShell";

export default function ProctorDashboardPage() {
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
