"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./jobDetails.module.scss";
import { GetAllPlacements, GetOneJob } from "@/redux/slices/tpo/placementsSlice";
import Image from "next/image";
import JobDetails from "@/modules/tpo/components/jobDetailsComp";
import { FaCaretRight } from "react-icons/fa";
import { Input, Button } from "antd";
import ApplicantsTable from "@/modules/tpo/components/applicantsTable";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "@bprogress/next/app";
import PageHeader from "@/modules/tpo/components/PageHeader";
import {
  HiOutlineUser,
  HiOutlineBriefcase,
  HiOutlineCalendarDays,
  HiOutlineUsers,
  HiOutlineClock
} from "react-icons/hi2";

export default function JobPreviewPage() {
  const { id, jobid } = useParams();
  const path = usePathname();
  const query = useSearchParams();
  const applicantsVal = query.get("applicants");

  const dispatch = useDispatch();
  const router = useRouter();
  const pathSegments = path?.split("/").filter((e) => e) || [];

  // Set the default tab key based on search params
  const [activeTab, setActiveTab] = useState(
    applicantsVal ? "applicants" : "basic"
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewFileUrl, setPreviewFileUrl] = useState(null);
  const [previewFileType, setPreviewFileType] = useState(null);
  const [searchText, setSearchText] = useState("");

  const { value: ONEJOB } = useSelector(
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

  const resolveName = (segment, index) => {
    if (segment === "placementdrive") return "Placement Drives";

    if (index > 0 && pathSegments[index - 1] === "placementdrive") {
      const placement = ALLPLACEMENTS?.data?.find((p) => p._id === segment);
      return placement?.companyName || "Placement";
    }

    if (index > 1 && pathSegments[index - 2] === "placementdrive") {
      const profile = ONEJOB?.data?.jobTitle;
      return profile ? `${profile}` : "Job";
    }

    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  const JOBPROFILE = ONEJOB?.data;

  // Determine active status of the job profile
  const isDriveActive = () => {
    if (!JOBPROFILE?.endDate) return true;
    try {
      const deadline = new Date(JOBPROFILE.endDate);
      return deadline >= new Date();
    } catch {
      return true;
    }
  };

  const filteredApplicants =
    JOBPROFILE?.applicants?.filter((applicant) => {
      const search = searchText.toLowerCase();
      const userName = applicant?.userName?.toLowerCase() || "";
      const enrollementId = applicant?.enrollementId?.toLowerCase() || "";
      return userName.includes(search) || enrollementId.includes(search);
    }) || [];

  const tabList = [
    { key: "basic", label: "Basic Details", icon: <HiOutlineUser /> },
    { key: "jobProfile", label: "Job Profile Details", icon: <HiOutlineBriefcase /> },
    { key: "interview", label: "Interview Process", icon: <HiOutlineCalendarDays /> },
    { key: "applicants", label: "Applicants", icon: <HiOutlineUsers /> }
  ];

  const handleTabChange = (key) => {
    setActiveTab(key);
    if (key === "applicants") {
      router.push(`${jobid}?applicants=true`);
    } else {
      router.push(`${jobid}`);
    }
  };

  return (
    <>
      <PageHeader
        breadcrumb="Placement drive"
        title={JOBPROFILE?.jobTitle || "Job Details"}
        subtitle={`${JOBPROFILE?.companyName || "Company"} - ${JOBPROFILE?.city || "City not specified"}, ${JOBPROFILE?.country || "Country not specified"}`}
        actionText="Edit"
        onActionClick={() => router.replace(`/tpo/placementdrive/${id}/${jobid}/createjob/basicdetails`)}
      />

      <div className={styles.container}>
        {/* Breadcrumbs Trail moved directly below the banner */}
        <div className={styles.headerCont} style={{ padding: "0.25rem 0", borderBottom: "none", marginBottom: "0.5rem", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {pathSegments.map((segment, index) => {
              const displayName = resolveName(segment, index);
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
                    if (!isLast) router.push(pathToHere);
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
          <Button type="primary" onClick={() => router.replace(`/tpo/placementdrive/${id}/${jobid}/createjob/basicdetails`)}>
            Edit
          </Button>
        </div>

        {/* Horizontal Tabs row */}
        <div className={styles.tabsContainer}>
          <div className={styles.tabsRow}>
            {tabList.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <div
                  key={tab.key}
                  className={`${styles.tabItem} ${isActive ? styles.activeTab : ""}`}
                  onClick={() => handleTabChange(tab.key)}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Content view */}
        {activeTab === "applicants" ? (
          <div className={styles.card} style={{ padding: "1.25rem" }}>
            <ApplicantsTable
              filteredApplicants={filteredApplicants}
              isModalOpen={isModalOpen}
              setIsModalOpen={setIsModalOpen}
              previewFileType={previewFileType}
              previewFileUrl={previewFileUrl}
              setSearchText={setSearchText}
            />
          </div>
        ) : (
          <JobDetails
            JOBPROFILE={JOBPROFILE}
            ALLPLACEMENTS={ALLPLACEMENTS}
            activeTab={activeTab}
          />
        )}
      </div>
    </>
  );
}
