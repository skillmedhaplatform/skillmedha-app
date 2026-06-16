import React from "react";
import PageHeader from "@/modules/tpo/components/PageHeader";

const Page = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#ffffff" }}>
      <PageHeader
        breadcrumb="My Tests"
        title="My Tests"
        subtitle="Manage student tests and evaluations"
      />
      <div style={{ padding: "2.5rem", fontSize: "1rem", color: "#4a5568", fontWeight: 500 }}>
        Welcome to My Tests. Use this section to manage student mock tests and practice assessments.
      </div>
    </div>
  );
};

export default Page;
