"use client";
import React, { useEffect } from "react";
import styles from "./styles/layout.module.scss";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { GetOneJob, resetOneJob } from "@/redux/slices/company/placementsSlice";
import {
  getOneJobAssessment,
  resetSingleJobAssessment,
} from "@/redux/slices/company/skillMedhaData";
import { Tooltip } from "antd";
import PageHeader from "@/modules/tpo/components/PageHeader";

export default function FormLayout({ children }) {
  const { jobId: jobid } = useParams();
  const path = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

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

  const headerTitle = ONEJOB?.data?.jobTitle
    ? `Configure: ${ONEJOB.data.jobTitle}`
    : "Create Job";
  const headerSubtitle =
    "Manage basic details, profile, interview rounds, assessments and more";

  return (
    <>
      {/* Sticky Header Banner + Tabs */}
      <div className={styles.stickyHeader}>
        <PageHeader
          breadcrumb="My Jobs"
          title={headerTitle}
          subtitle={headerSubtitle}
        />

        {/* Tabs - Original horizontal scrollable style */}
        <div className={styles.tabsWrapper}>
          <div className={styles.tabsRow}>
            {routes.map((e) => {
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
                      cursor: disabled ? "not-allowed" : "pointer",
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
      </div>

      <div className={styles.mainContainer}>
        {/* Back Button */}
        <div className={styles.headerCont}>
          <span
            className={styles.backBtn}
            onClick={() => router.push("/company/myjobs")}
          >
            ← Back to My Jobs
          </span>
        </div>

        {/* Content */}
        <div className={styles.bottomCont} style={{ width: "100%" }}>
          <div
            className={styles.contentCont}
            style={{ width: "100%", padding: 0 }}
          >
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
