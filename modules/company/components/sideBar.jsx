"use client";
import React, { useEffect, useState } from "react";
import sideBarStyles from "./styles/sidebar.module.scss";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { changeCollapse } from "@/redux/slices/company/sidebar";
import {
  clearLstorageVals,
  clearSstorageVals,
  setSstorage,
} from "@/utils/universalUtils/windowMW";
import { Button } from "antd";

const sideBarTitles = [
  {
    name: "My Jobs",
    slug: "myjobs",
    path: "/myjobs",
  },
  {
    name: "Job Assessments",
    slug: "jobassessments",
    path: "jobassessments",
  },
  {
    name: "Profile",
    slug: "profile",
    path: "profile",
  },
  {
    name: "Help",
    slug: "help",
    path: "help",
  },
];


const SideBar = ({ activeView, setView }) => {
  const isCollapsed = useSelector((state) => state.sideBar.collapse);
  const orgDetails = useSelector((s) => s.user?.singleUser?.orgDetails);
  const dispatch = useDispatch();

  const pathName = usePathname();
  const nav = useRouter();

  const handleClick = (item) => {
    if (typeof setView === "function") {
      setView(item.path);
      return;
    }
    nav.replace(item?.path);
    setSstorage("userIdInProgress", "");
  };

  useEffect(() => {
    if (!orgDetails) return;
    if (!orgDetails?.features) return;

    const pathToCheck = activeView || pathName;
    const currentPath = pathToCheck?.slice(1).toLowerCase();
    console.log(pathToCheck, orgDetails);

    // Check if user is trying to access job assessments
    if (currentPath === "jobassessments") {
      // Block if jobassessments feature is disabled
      if (orgDetails.features.jobassessments === false) {
        if (typeof setView === "function") {
          setView("/myjobs");
        } else {
          nav.replace("/myjobs");
        }
      }
    }
  }, [orgDetails, pathName, activeView]);
  return (
    <div className={sideBarStyles.sidebarContainer}>
      <div className={sideBarStyles.topLinksCont}>
        {sideBarTitles.map((titles, index) => {
          const isActive = (activeView || pathName).startsWith(titles.path);

          if (
            titles.slug === "jobassessments" &&
            orgDetails?.features?.jobassessments === false
          ) {
            return null;
          }
          return (
            <p
              key={index}
              className={`${sideBarStyles.name} ${
                isActive ? sideBarStyles.active : ""
              }`}
              onClick={() => handleClick(titles)}
            >
              {titles.name}
            </p>
          );
        })}
      </div>

      <div className={sideBarStyles.bottom}>
        <Button
          className={sideBarStyles.logoutBtn}
          style={{ alignSelf: "center", width: "100%" }}
          onClick={() => {
            clearLstorageVals();
            clearSstorageVals();
            const loginUrl = process.env.NEXT_PUBLIC_LOGIN_APP_URL || "http://localhost:2025";
            window.location.href = `${loginUrl}?portal=company`;
          }}
          icon={
            <img
              src="https://res.cloudinary.com/cliqtick/image/upload/v1718348893/sysnper/afde031a298696667c78ee702cce0a6b_o6upns.png"
              width="20px"
              style={{ marginRight: ".5rem" }}
            />
          }
        >
          {!isCollapsed && "Logout"}
        </Button>
      </div>
    </div>
  );
};

export default SideBar;
