"use client";

import React, { useEffect } from "react";
import styles from "./styles/layout.module.scss";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { GetOneJob } from "@/redux/slices/company/placementsSlice";
import { FaCaretRight } from "react-icons/fa";
import {
  getOneJobAssessment,
  resetSingleJobAssessment,
} from "@/redux/slices/company/skillMedhaData";
import { Button, Tooltip } from "antd";

export default function FormLayout({ children }) {
  const { jobId: jobid } = useParams();
  const path = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const pathSegments = path?.split("/").filter((e) => e);

  const ONEJOB = useSelector((state) => state.placement?.OneJob?.value || state.companyPlacements?.OneJob?.value);

  useEffect(() => {
    if (jobid) {
      dispatch(resetSingleJobAssessment());
      dispatch(GetOneJob({ jobid }));
    }
  }, [dispatch, jobid]);
  const isAssessmentId = ONEJOB?.data?.AssessmentId;
  useEffect(() => {
    if (isAssessmentId) {
      dispatch(getOneJobAssessment({ id: isAssessmentId }));
    } else {
      dispatch(resetSingleJobAssessment());
    }
  }, [dispatch, isAssessmentId]);

  const isDisabled = () => {
    try {
      return !ONEJOB?.data?._id;
    } catch (error) {
      return true;
    }
  };

  const baseUrl = `/company/myjobs/${jobid}/createjob`;

  const routes = [
    { name: "Basic Details", path: `${baseUrl}/basicdetails` },
    { name: "Job Profile details", path: `${baseUrl}/profiledetails` },
    { name: "Interview Process", path: `${baseUrl}/interviewprocess` },
    { name: "HRT", path: `${baseUrl}/createassessment` },
    {
      name: "Start Page",
      path: `${baseUrl}/startPage`,
      disabled: !ONEJOB?.data?.AssessmentId,
    },
    {
      name: "Grading Page",
      path: `${baseUrl}/grading`,
      disabled: !ONEJOB?.data?.AssessmentId,
    },
    {
      name: "Time",
      path: `${baseUrl}/time`,
      disabled: !ONEJOB?.data?.AssessmentId,
    },
    {
      name: "Question Manager",
      path: `${baseUrl}/questionManager`,
      disabled: !ONEJOB?.data?.AssessmentId,
    },
  ];

  return (
    <>
      <div className={styles.mainContainer}>
        {/* Breadcrumbs */}
        <div className={styles.headerCont}>
          {pathSegments.map((segment, index) => {
            let displayName = segment;

            if (segment === "createjob")
              displayName = ONEJOB?.data?._id ? "Update Job" : "Create Job";
            else if (segment === "basicdetails") displayName = "Basic Details";
            else if (segment === "profiledetails")
              displayName = "Profile Details";
            else if (segment === "interviewprocess")
              displayName = "Interview Process";

            const matchedJob =
              ONEJOB?.data && ONEJOB?.data?._id === segment
                ? ONEJOB?.data
                : null;

            if (matchedJob) {
              displayName = `${matchedJob?.jobTitle}`;
            }

            const isLast = index === pathSegments.length - 1;
            const pathToHere = "/" + pathSegments.slice(0, index + 1).join("/");

            return (
              <span
                key={index}
                className={isLast ? styles.activeCrumb : styles.crumb}
                onClick={() => {
                  if (isLast) return;

                  if (index === 0 || index === 1) {
                    router.push("/company/myjobs");
                  } else if (segment !== "job") {
                    router.push(pathToHere);
                  }
                }}
              >
                {displayName}&nbsp;
                {index < pathSegments.length - 1 && (
                  <FaCaretRight style={{ fontSize: "24px" }} />
                )}
              </span>
            );
          })}
        </div>

        {/* Sidebar + Content */}
        <div className={styles.bottomCont}>
          <div className={styles.sidebarCont}>
            {routes.map((e) => {
              const isActive = path === e?.path;

              // ✅ global disable + per-route disable
              const disabled = (isDisabled() && e?.name !== "Basic Details") || e?.disabled;

              return (
                <Tooltip
                  key={e.path}
                  title={disabled ? "Complete previous steps first" : ""}
                  placement="right"
                >
                  <Button
                    type={isActive ? "primary" : "text"}
                    disabled={disabled}
                    onClick={() => {
                      if (!disabled) router.replace(e?.path);
                    }}
                    // block
                    style={{ display: "flex", justifyContent: "flex-start" }}
                  >
                    {e?.name}
                  </Button>
                </Tooltip>
              );
            })}
          </div>

          <div className={styles.contentCont}>{children}</div>
        </div>
      </div>
    </>
  );
}
