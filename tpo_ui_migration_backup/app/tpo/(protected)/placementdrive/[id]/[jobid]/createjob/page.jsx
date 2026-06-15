"use client";
import { redirect } from "next/navigation";
import React from "react";
import PageHeader from "@/modules/tpo/components/PageHeader";

export default function FormPage() {
  redirect("createjob/basicdetails");
  return <><PageHeader title="Create Job" /><div>Loading ...</div></>;
}
