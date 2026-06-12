"use client";
import React from "react";
import { useSelector } from "react-redux";
import testStyles from "./page.module.scss";
import AnalyticsPage from "../../page";
const page = () => {
  const studentDetails = useSelector((state) => state.student.student?.data);
  return <AnalyticsPage>Test</AnalyticsPage>;
};

export default page;
