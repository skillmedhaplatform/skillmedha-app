"use client";
// Removed Home import
import React, { useEffect } from "react";
import styles from "./styles/layout.module.scss";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { GetOneJob, resetOneJob } from "@/redux/slices/company/placementsSlice";
import { FaCaretRight } from "react-icons/fa";
import {
  getOneJobAssessment,
  resetSingleJobAssessment,
} from "@/redux/slices/company/skillMedhaData";
import { Button, Tooltip } from "antd";
import PageHeader from "@/modules/tpo/components/PageHeader";
export default function FormLayout({ children }) {
  const { jobId: jobid } = useParams();
  const path = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const pathSegments = path?.split("/").filter((e) => e);

  const ONEJOB = useSelector((state) => state.placement.OneJob?.value);

  useEffect(() => {
    if (jobid && jobid !== "Newjob") {
      dispatch(resetSingleJobAssessment());
      dispatch(GetOneJob({ jobid }));
    } else if (jobid === "Newjob") {
      dispatch(resetSingleJobAssessment());
      dispatch(resetOneJob());
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

  const pageTitle = ONEJOB?.data?._id ? (ONEJOB?.data?.jobTitle || "Update Job") : "Create Job";
  const pageSubtitle = ONEJOB?.data?._id ? "Manage your job details and interview process" : "Set up a new job posting";

  return (
    <>
      <PageHeader
        breadcrumb="My Jobs"
        title={pageTitle}
        subtitle={pageSubtitle}
      />
      
      {/* Tabs */}
      <div className={styles.tabsWrapper}>
        <div className={styles.tabsRow}>
          {routes.map((e, index) => {
            const isActive = path === e?.path;
            const disabled = isDisabled() || e?.disabled;

            return (
              <Tooltip
                key={e.path}
                title={disabled ? "Complete previous steps first" : ""}
                placement="bottom"
              >
                <div
                  className={`${styles.tabItem} ${isActive ? styles.activeTab : ""}`}
                  onClick={() => {
                    if (!disabled) router.replace(e?.path);
                  }}
                  style={{
                    opacity: disabled ? 0.5 : 1,
                    cursor: disabled ? "not-allowed" : "pointer"
                  }}
                >
                  <span>{e?.name}</span>
                  {isActive && <span className={styles.activeIndicator} />}
                </div>
              </Tooltip>
            );
          })}
        </div>
      </div>

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

      {/* Content */}
      <div className={styles.bottomCont} style={{ width: "100%" }}>
        <div className={styles.contentCont} style={{ width: "100%", padding: 0 }}>{children}</div>
      </div>
      </div>
    </>
  );
}
