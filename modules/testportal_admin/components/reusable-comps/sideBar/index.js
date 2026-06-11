"use client";
import React, { useEffect } from "react";
import sideBarStyles from "./sidebar.module.scss";
import { usePathname } from "next/navigation";
import { useRouter } from "@bprogress/next/app";
import { useDispatch, useSelector } from "react-redux";
import { sideBarTitles } from "../sideBarTitles";
import { changeCollapse } from "@/redux/slices/testportal_admin/slice/sideBar";

const SideBar = ({ activeView, setView }) => {
  const isCollapsed = useSelector((state) => state.sideBar.collapse);
  const dispatch = useDispatch();

  const currPath = usePathname() || "/";
  const nav = useRouter();

  const basePath = "/testportal_admin";

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
        <div
          className={`${sideBarStyles.currTitle} ${sideBarStyles.name}`}
          onClick={() => {
            window.localStorage.removeItem("token");
            window.localStorage.removeItem("businessId");
            document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            window.location.href = "/testportal_admin/login?logout=true";
          }}
          title="Logout"
          style={{ color: "red" }}
        >
          {!isCollapsed && "Logout"}
        </div>
        {/* <div
          className={`${sideBarStyles.currTitle} ${sideBarStyles.name}`}
          onClick={() => dispatch(changeCollapse(!isCollapsed))}
          title="Collapse"
        >
          <img
            src="https://res.cloudinary.com/cliqtick/image/upload/v1720507451/sysnper/9a43b4f5abaf49fb32fbf6f21a69c5f7_nik5yp.png"
            width="20"
            height="20"
            style={
              !isCollapsed
                ? { transform: "rotate(90deg)" }
                : { transform: "rotate(-90deg)" }
            }
            alt="Toggle"
          />
          {!isCollapsed && "Collapse"}
        </div> */}
      </div>
    </div>
  );
};

export default SideBar;
