"use client";
import React, { useEffect } from "react";
import sideBarStyles from "./sidebar.module.scss";
import { usePathname } from "next/navigation";
import { useRouter } from "@bprogress/next/app";
import { useDispatch, useSelector } from "react-redux";
import { sideBarTitles } from "../sideBarTitles";
import { changeCollapse } from "@/redux/slices/testportal_admin/slice/sideBar";
import { Dropdown, Skeleton } from "antd";

const SideBar = ({ activeView, setView }) => {
  const isCollapsed = useSelector((state) => state.sideBar.collapse);
  const dispatch = useDispatch();

  const currPath = usePathname() || "/";
  const nav = useRouter();

  const basePath = "/testportal_admin";

  const userDetailsVal = useSelector((state) => state.tests?.UserDetails?.value);
  const USER_DETAILS = userDetailsVal?.data || userDetailsVal;
  const isLoadingUser = useSelector((state) => state.tests?.UserDetails?.status === "pending");

  const name = USER_DETAILS?.name || USER_DETAILS?.userName || "TPO User";
  const email = USER_DETAILS?.email || "";
  const firstLetter = name ? name.charAt(0).toUpperCase() : "U";

  const handleLogout = () => {
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("businessId");
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    window.location.href = "/login?portal=tpo";
  };

  const userMenuItems = [
    {
      key: "user-info",
      disabled: true,
      style: { cursor: "default", backgroundColor: "transparent" },
      label: (
        <div style={{ padding: "4px 0", color: "#333" }}>
          <strong style={{ display: "block", fontSize: "14px", lineHeight: "1.2" }}>
            {name}
          </strong>
          <span style={{ fontSize: "12px", color: "#8c8c8c" }}>
            {email}
          </span>
        </div>
      )
    },
    { type: "divider" },
    {
      key: "profile",
      label: "View More Info",
      onClick: () => window.location.href = "/tpo/myprofile/personal"
    },
    {
      key: "logout",
      label: <span style={{ color: "red" }}>Logout</span>,
      onClick: handleLogout
    }
  ];

  useEffect(() => {
    if (currPath === `${basePath}/website-and-branding`) {
      dispatch(changeCollapse(true));
    }
  }, [currPath, dispatch, nav]);

  const isActivePath = (p) => {
    if (typeof setView === "function") {
      return activeView === p;
    }
    return currPath === `${basePath}/${p}` || currPath.startsWith(`${basePath}/${p}/`);
  };

  const handleClick = (titles) => {
    if (typeof setView === "function") {
      setView(titles.path);
      return;
    }
    nav.replace(`${basePath}/` + titles.path);
  };

  return (
    <div
      className={sideBarStyles.container}
      style={
        isCollapsed
          ? { width: "3%", transition: "1s" }
          : { width: "15%", transition: "1s" }
      }
    >
      <div className={sideBarStyles.topLinks}>
        {sideBarTitles.map((titles, index) => {
          const active = isActivePath(titles.path);
          return (
            <div
              key={index}
              className={`${sideBarStyles.currTitle} ${sideBarStyles.name} ${active ? sideBarStyles.active : ""
                } ${isCollapsed ? sideBarStyles.jcCenter : sideBarStyles.jcStart
                }`}
              onClick={() => handleClick(titles)}
              title={titles.name}
            >
              <div
                style={
                  isCollapsed
                    ? { margin: "0rem 2rem", color: "#fff" }
                    : { marginRight: ".5rem", color: "#fff" }
                }
              >
                {titles.icon}
              </div>
              {/* <span
                style={
                  !isCollapsed
                    ? { width: "100%", transition: "1s" }
                    : { width: "0%", overflow: "hidden", transition: "1s" }
                }
              > */}
              {titles.name}
              {/* </span> */}
            </div>
          );
        })}
      </div>

      <div className={sideBarStyles.bottomLogout}>
        <div style={{ padding: isCollapsed ? "0" : "0 1rem", display: "flex", justifyContent: "center", width: "100%" }}>
          {isLoadingUser ? (
            <div className={sideBarStyles.profilePillSkeleton}>
              <Skeleton.Avatar active size="large" shape="circle" />
              {!isCollapsed && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <Skeleton.Button active size="small" style={{ width: 100, height: 14 }} />
                  <Skeleton.Button active size="small" style={{ width: 140, height: 10 }} />
                </div>
              )}
            </div>
          ) : (
            <Dropdown menu={{ items: userMenuItems }} trigger={["click"]} placement="topLeft">
              <div className={`${sideBarStyles.profilePill} ${isCollapsed ? sideBarStyles.collapsedPill : ''}`}>
                <div className={sideBarStyles.avatar}>
                  {USER_DETAILS?.tpoLogo ? (
                    <img src={USER_DETAILS.tpoLogo} style={{ objectFit: "cover", width: "100%", height: "100%" }} alt="TPO Logo" />
                  ) : (
                    <span>{firstLetter}</span>
                  )}
                </div>
                {!isCollapsed && (
                  <div className={sideBarStyles.profileInfo}>
                    <span className={sideBarStyles.profileName}>
                      {name.length > 15 ? name.substring(0, 15) + "..." : name}
                    </span>
                    <span className={sideBarStyles.profileEmail}>
                      {email}
                    </span>
                  </div>
                )}
              </div>
            </Dropdown>
          )}
        </div>
      </div>
    </div>
  );
};

export default SideBar;
