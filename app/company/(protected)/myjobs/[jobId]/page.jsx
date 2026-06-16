"use client";

import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./job.module.scss";
import { GetAllPlacements, GetOneJob } from "@/redux/slices/company/placementsSlice";
import Image from "next/image";
import JobDetails from "../components/jobDetailsComp";
import { FaCaretDown, FaCaretRight } from "react-icons/fa";
import { Input } from "antd";
import ApplicantsTable from "../components/applicantsTable";
import { availableSkills } from "@/redux/slices/company/skillMedhaData";

export default function JobPreviewPage() {
  const { jobId: jobid } = useParams();
  const { Search } = Input;
  const path = usePathname();
  const query = useSearchParams();
  const applicantsVal = query.get("applicants");

  const dispatch = useDispatch();
  const router = useRouter();
  const pathSegments = path?.split("/").filter((e) => e);

  const [active, setActive] = useState(
    applicantsVal ? "noofApplicants" : "#basicDetails"
  );
  const [applicants, setApplicants] = useState(applicantsVal || false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewFileUrl, setPreviewFileUrl] = useState(null);
  const [previewFileType, setPreviewFileType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  // Redux data

  const { value: ONEJOB, status } = useSelector(
    (state) => state.companyPlacements?.OneJob || {}
  );
  const ALLPLACEMENTS = useSelector(
    (state) => state.companyPlacements?.AllPlacements?.value || []
  );

  useEffect(() => {
    dispatch(GetOneJob({ jobid }));
    // dispatch(GetAllPlacements());
    dispatch(availableSkills());
  }, []);

  const resolveName = (segment, index) => {
    if (index > 0) {
      const profile = ONEJOB?.data?.jobTitle;
      return profile ? `${profile}` : "Job";
    }

    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  const JOBPROFILE = ONEJOB?.data;

  const getFileType = (fileUrl) => {
    const extension = fileUrl?.split(".").pop().toLowerCase();

    if (["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(extension)) {
      return "image";
    }
    if (extension === "pdf") {
      return "pdf";
    }
    if (["doc", "docx"].includes(extension)) {
      return "doc";
    }
    return "unknown";
  };

  function handleViewDocument(fileUrl) {
    try {
      if (!fileUrl) return;
      const type = getFileType(fileUrl);
      setPreviewFileType(type);
      setPreviewFileUrl(fileUrl);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error viewing document:", error);
    }
  }
  const routes = [
    {
      name: "Number of Applicants",
      path: "noofApplicants",
    },
    {
      name: "Basic Details",
      path: "#basicDetails",
    },
    {
      name: "Job Profile Details",
      path: "#profileDetails",
    },
    {
      name: "Interview Process",
      path: "#interview",
    },
    {
      name: "Create Assessment",
      path: "#createassessment",
    },
  ];

  const filteredApplicants =
    JOBPROFILE?.applicants?.filter((applicant) => {
      const search = searchText.toLowerCase();
      return (
        applicant?.userName?.toLowerCase().includes(search) ||
        applicant?.enrollementId?.toLowerCase().includes(search)
      );
    }) || [];

  return (
    <>
      <div className={styles.mainContainer}>
        <div className={styles.headerCont}>
          {pathSegments.map((segment, index) => {
            const displayName = resolveName(segment, index);
            const isLast = index === pathSegments.length - 1;
            const pathToHere = "/" + pathSegments.slice(0, index + 1).join("/");
            return (
              <span
                key={index}
                className={isLast ? styles.activeCrumb : styles.crumb}
                onClick={() => {
                  if (!isLast) router.push(pathToHere);
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
        <div className={styles.bottomCont}>
          <div className={styles.sidebarCont}>
            {routes.map((e, idx) => {
              const handleClick = (ele) => {
                setActive(ele?.path);
                if (e.path?.startsWith("#")) {
                  const element = document.querySelector(e.path);
                  router.push(`${jobid}`);
                  setApplicants(false);
                  if (element) {
                    element.scrollIntoView({
                      behavior: "smooth",
                      block: "nearest",
                    });
                  }
                } else {
                  router.push(`${jobid}?applicants=true`);
                  setApplicants(true);
                }
              };
              const isActive = active == e?.path;
              return (
                <div
                  key={idx}
                  className={`${styles.routeNames} ${
                    isActive && styles.active
                  }`}
                  onClick={() => handleClick(e)}
                >
                  {e?.name}
                </div>
              );
            })}
          </div>
          <>
            {applicants ? (
              <ApplicantsTable
                filteredApplicants={filteredApplicants}
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                previewFileType={previewFileType}
                previewFileUrl={previewFileUrl}
                setSearchText={setSearchText}
              />
            ) : (
              <JobDetails
                JOBPROFILE={JOBPROFILE}
                ALLPLACEMENTS={ALLPLACEMENTS}
              />
            )}
          </>
        </div>
      </div>
    </>
  );
}
