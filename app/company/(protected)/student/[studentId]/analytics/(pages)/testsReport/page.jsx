"use client";
import React from "react";
import AnalyticsPage from "../../page";
import { useSelector } from "react-redux";
import testStyles from "./page.module.scss";
const page = () => {
  const studentDetails = useSelector((state) => state.student?.student?.data);
  return <AnalyticsPage>Te</AnalyticsPage>;
};

export default page;
