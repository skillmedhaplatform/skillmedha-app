// pages/proctor/dashboard.js
"use client";

import { getLstorage } from "@/utils/universalUtils/windowMW";
import dynamic from "next/dynamic";
import PageHeader from "@/modules/tpo/components/PageHeader";

const ProctorDashboard = dynamic(() => import("./proctoringDash"), {
  ssr: false,
});

export default function ProctorDashboardPage() {
  const token = getLstorage("token");

  if (!token) {
    return <div>Please login as a proctor</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <PageHeader 
        title="Live Monitoring" 
        subtitle="Monitor active assessments and remote sessions" 
      />
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <ProctorDashboard token={token} />
      </div>
    </div>
  );
}
