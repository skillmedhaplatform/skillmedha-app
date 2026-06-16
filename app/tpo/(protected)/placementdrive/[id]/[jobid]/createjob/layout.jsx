"use client";
import React, { useEffect, useState } from "react";
import styles from "./styles/layout.module.scss";
import PageHeader from "@/modules/tpo/components/PageHeader";
import drives from "@/modules/tpo/Data/placementsDrive";
import { useDispatch, useSelector } from "react-redux";
import { GetAllPlacements, GetOneJob } from "@/redux/slices/tpo/placementsSlice";
import { FaCaretRight } from "react-icons/fa";
import { usePathname, useRouter, useParams } from "next/navigation";

export default function FormLayout({ children }) {
  const { id, jobid } = useParams();
  const path = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const pathSegments = path?.split("/").filter((e) => e) || [];

  const { value: ONEJOB, status } = useSelector(
    (state) => state.placement.OneJob
  );
  const { value: ALLPLACEMENTS, status: placementsStatus } = useSelector(
    (state) => state.placement.AllPlacements
  );

  useEffect(() => {
    dispatch(GetOneJob({ jobid }));
  }, [dispatch, jobid]);

  useEffect(() => {
    if (placementsStatus !== "succeeded" && placementsStatus !== "loading") {
      dispatch(GetAllPlacements());
    }
  }, [dispatch, placementsStatus]);

  const isDisabled = () => {
    try {
      if (ONEJOB?.data?._id) {
        return false;
      } else {
        return true;
      }
    } catch (error) {
      return true;
    }
  };
  const baseUrl = `/tpo/placementdrive/${id}/${jobid}/createjob`;
  const routes = [
    {
      name: "Basic Details",
      path: `${baseUrl}/basicdetails`
    },
    {
      name: "Job Profile details",
      path: `${baseUrl}/profiledetails`
    },
    {
      name: "Interview Process",
      path: `${baseUrl}/interviewprocess`
    },
  ];

  return (
    <>
      <PageHeader
        breadcrumb="Placement Drive"
        title={ONEJOB?.data?.jobTitle ? `Configure ${ONEJOB?.data?.jobTitle}` : "Create Job"}
        subtitle="Manage basic information, profile details and interview rounds"
      />
      <div className={styles.mainContainer}>
        <div className={styles.headerCont}>
          {pathSegments.map((segment, index) => {
            let displayName = segment;

            if (segment === "placementdrive") displayName = "All Companies";
            else if (segment === "createjob")
              displayName = ONEJOB?.data?._id ? "Update Job" : "Create Job";
            else if (segment === "basicdetails") displayName = "Basic Details";
            else if (segment === "profiledetails")
              displayName = "Profile Details";
            else if (segment === "interviewprocess")
              displayName = "Interview Process";

            const matchedPlacement = ALLPLACEMENTS?.data?.find(
              (p) => p?._id === segment
            );
            const matchedJob =
              ONEJOB?.data && ONEJOB?.data._id === segment
                ? ONEJOB?.data
                : null;

            if (matchedPlacement) {
              displayName = matchedPlacement?.companyName || "placement";
            }
            if (matchedJob) {
              displayName = `${matchedJob?.jobTitle}`;
            }
            const isLast = index === pathSegments.length - 1;
            let pathToHere = "/" + pathSegments.slice(0, index + 1).join("/");
            if (pathToHere === "/tpo") {
              pathToHere = "/tpo/dashboard";
            }
            return (
              <span
                key={index}
                className={isLast ? styles.activeCrumb : styles.crumb}
                onClick={() => {
                  if (!isLast && segment !== "job") {
                    router.push(pathToHere);
                  }
                }}
                style={{ display: "inline-flex", alignItems: "center" }}
              >
                {displayName}&nbsp;
                {index < pathSegments.length - 1 && (
                  <FaCaretRight style={{ fontSize: "14px", color: "#64748b", margin: "0 4px" }} />
                )}
              </span>
            );
          })}
        </div>

        <div className={styles.tabsWrapper}>
          <div className={styles.tabsRow}>
            {routes.map((e) => {
              const isActive = path === e?.path;
              const disabled = isDisabled();
              return (
                <div
                  key={e.path}
                  className={`${styles.tabItem} ${isActive ? styles.activeTab : ""} ${disabled ? styles.disabled : ""}`}
                  onClick={() => {
                    if (!disabled) router.push(e?.path);
                  }}
                >
                  <span>{e?.name}</span>
                  {isActive && <div className={styles.activeIndicator} />}
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.bottomCont}>
          <div className={styles.contentCont}>{children}</div>
        </div>
      </div>
    </>
  );
}
