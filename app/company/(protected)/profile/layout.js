"use client";
export const dynamic = "force-dynamic";
import React from "react";
import styles from "./layout.module.scss";
import { useSelector } from "react-redux";
import NavButton from "./components/navigatebtn";

const basePath = "/profile";
export const profileSidebarItems = [
  { name: "Details", path: `${basePath}/details` },
];

export default function ProfileLayout({ children }) {
  const USER_DETAILS = useSelector((state) => state?.user?.singleUser || null);

  return (
    <div className={styles?.container || ""}>
        <div className={styles?.sidebar || ""}>
          <div className={styles?.logoCont || ""}>
            <div className={styles?.logo || ""}>
              {USER_DETAILS?.companyLogo ? (
                <img
                  src={USER_DETAILS?.companyLogo || ""}
                  alt="Company Logo"
                  style={{ width: "100%", objectFit: "contain" }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "60px",
                    backgroundColor: "#f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "4px",
                    color: "#999",
                  }}
                >
                  No Logo
                </div>
              )}
            </div>
            <p className={styles?.tpoName || ""}>
              {USER_DETAILS?.companyName || "Company Name"}
            </p>
            {/* <p className={styles?.employeeId || ""}>
              {USER_DETAILS?._id || "Employee ID"}
            </p> */}
          </div>
          <div className={styles?.sideNavBtnCont || ""}>
            {(profileSidebarItems || []).map((item, Index) => {
              return (
                <NavButton
                  key={item?.path || Index}
                  obj={item || {}}
                  path={item?.path || ""}
                />
              );
            })}
          </div>
        </div>
        <div className={styles?.content || ""}>{children}</div>
      </div>
  );
}
