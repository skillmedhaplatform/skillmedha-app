"use client";
import React from "react";
import { useSelector } from "react-redux";
import testStyles from "./page.module.scss";
import AnalyticsPage from "../../page";
import PageHeader from "@/modules/tpo/components/PageHeader";
const page = () => {
  const studentDetails = useSelector((state) => state.student.student?.data);
  return <><PageHeader title="Tests Report" /><AnalyticsPage>Test</AnalyticsPage></>;
};

export default page;
