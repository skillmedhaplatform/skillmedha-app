"use client";
import React, { useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import allStudents from "./allstudents.module.scss";
import Search from "antd/es/input/Search";
import { Button, message, Select, Dropdown } from "antd";

const PAGE_SIZES = [10, 25, 50, 100];
import { useRouter } from "@bprogress/next/app";
import { useDispatch, useSelector } from "react-redux";
import PageHeader from "@/modules/tpo/components/PageHeader";
import {
  GetAllJobs,
  GetAllPlacements,
  GetOneJob,
} from "@/redux/slices/tpo/placementsSlice";
import JobDetailsModal from "./jobDetailsModal";
import { FaCaretRight, FaFilter } from "react-icons/fa";

const PlacementDetails = () => {
  const { id, jobid } = useParams();
  const router = useRouter();
  const path = usePathname();
  const dispatch = useDispatch();
  const pathSegments = path?.split("/").filter((e) => e) || [];

  const resolveName = (segment, index) => {
    if (segment === "placementdrive") return "Placement Drives";
    if (index > 0 && pathSegments[index - 1] === "placementdrive") {
      return getName(id) || "Company Details";
    }
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProfile, setSelectedProfile] = useState("All");
  
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const { value: ALLJOBS } = useSelector((state) => state.placement.AllJobs);
  const { value: ALLPLACEMENTS, status: placementsStatus } = useSelector(
    (state) => state.placement.AllPlacements
  );

  useEffect(() => {
    dispatch(GetAllJobs({ limit: 1000, profileId: id }));
  }, [dispatch, id]);

  useEffect(() => {
    if (placementsStatus !== "succeeded" && placementsStatus !== "loading") {
      dispatch(GetAllPlacements());
    }
  }, [dispatch, placementsStatus]);

  const handleAction = async (jobId) => {
    setIsLoading(true);
    setSelectedJobId(jobId);
    const hide = message.loading("Fetching job details...", 0);

    try {
      await dispatch(GetOneJob({ jobid: jobId })).unwrap();
      setIsModalOpen(true);
      hide();
      message.success("Job details loaded successfully.");
    } catch (error) {
      hide();
      console.error("Fetch failed", error);
      message.error("Failed to fetch job details.");
    } finally {
      hide();
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedJobId(null);
  };



  const baseUrl = `/tpo/placementdrive/${id}`;

  const handleClick = async (record) => {
    await dispatch(GetOneJob({ jobid: record?._id }));
    router.push(`${baseUrl}/${record?._id}`);
  };

  const getName = (id) => {
    const DriveName = ALLPLACEMENTS?.data?.find(
      (e) => e?._id == id
    )?.companyName;
    return DriveName;
  };

  const profileOptions = [
    { value: "All", label: "All Profiles" },
    ...(ALLJOBS?.data || [])
      .map((job) => job?.jobTitle)
      .filter((name, index, self) => name && self.indexOf(name) === index)
      .map((name) => ({ value: name, label: name })),
  ];

  const filterMenuItems = profileOptions.map((opt) => ({
    key: opt.value,
    label: opt.label,
    onClick: () => setSelectedProfile(opt.value)
  }));

  const filteredJobs =
    (ALLJOBS?.data || []).filter((job) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = job?.jobTitle?.toLowerCase().includes(search);

      const matchesProfile =
        selectedProfile === "All" || job?.jobTitle === selectedProfile;

      return matchesSearch && matchesProfile;
    }) || [];

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedProfile]);

  const handlePageSizeChange = (val) => {
    setPageSize(val);
    setCurrentPage(1);
  };

  // Display all job profiles on a single page
  const paginatedJobs = filteredJobs;

  return (
    <>
      <div className={allStudents.stickyHeaderWrapper}>
        <PageHeader
          title={getName(id) || "Company Details"}
          subtitle="Manage jobs and job description postings for this company"
        />

        <div className={allStudents.topSectionWrapper}>
          <div className={allStudents.leftControls}>
            <div className={allStudents.desktopSelect}>
              <Select
                value={selectedProfile}
                style={{ width: "100%", maxWidth: 300, minWidth: 120, height: 38, textAlign: "center" }}
                onChange={(value) => setSelectedProfile(value)}
                options={profileOptions}
              />
            </div>
            <div className={allStudents.mobileFilter}>
              <Dropdown menu={{ items: filterMenuItems }} placement="bottomLeft" trigger={['click']}>
                <button className={allStudents.filterBtn}>
                  <FaFilter size={16} />
                </button>
              </Dropdown>
            </div>
            <Search
              placeholder="Search by profile or company name"
              style={{ width: "100%", maxWidth: 300, minWidth: 120, height: 38 }}
              allowClear
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className={allStudents.rightControls}>
            <Button
              type="primary"
              className={allStudents.addJobBtn}
              onClick={() => {
                if (typeof window !== "undefined" && window.innerWidth <= 1024) {
                  message.warning(
                    "This action cannot be performed on a tablet/mobile screen. Please try on a laptop or larger screen."
                  );
                  return;
                }
                router.push(`/tpo/placementdrive/${id}/${jobid || "job"}/createjob`);
              }}
            >
              <span className={allStudents.addJobText}>+ Add New Job</span>
              <span className={allStudents.addJobIcon}>+</span>
            </Button>
          </div>
        </div>
      </div>

      <div className={allStudents.container}>
        {/* Breadcrumbs Trail */}
        <div className={allStudents.headerCont} style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
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
                  className={isLast ? allStudents.activeCrumb : allStudents.crumb}
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
        </div>

        <div className={allStudents.cardsList}>
          {paginatedJobs && paginatedJobs.length > 0 ? (
            paginatedJobs.map((record) => {
              const dateStart = new Date(record.startDate);
              const dateEnd = new Date(record.endDate);

              return (
                <div
                  key={record._id}
                  className={allStudents.companyCard}
                  onClick={() => handleClick(record)}
                >
                  <div className={allStudents.companyInfo}>
                    <span className={allStudents.companyName} style={{ fontSize: '1rem' }}>
                      {record.jobTitle || "Unnamed Role"}
                    </span>
                    <span className={allStudents.companyContact}>
                      {Array.isArray(record.interviewRounds) && record.interviewRounds.length > 0
                        ? `${record.interviewRounds.length} Round${record.interviewRounds.length > 1 ? "s" : ""}`
                        : "0 Rounds"}
                    </span>
                  </div>

                  <div className={allStudents.cardMeta}>
                    <div className={allStudents.metaItem}>
                      <span className={allStudents.metaLabel}>Applicants</span>
                      <span className={allStudents.metaValue}>
                        {Array.isArray(record.applicants) && record.applicants.length > 0
                          ? `${record.applicants.length} Applicant${record.applicants.length > 1 ? "s" : ""}`
                          : "0 Applicants"}
                      </span>
                    </div>
                    <div className={`${allStudents.metaItem} ${allStudents.hideOnTablet}`}>
                      <span className={allStudents.metaLabel}>Application Start</span>
                      <span className={allStudents.metaValue}>
                        {isNaN(dateStart) ? record.startDate : dateStart.toLocaleDateString()}
                      </span>
                    </div>
                    <div className={allStudents.metaItem}>
                      <span className={allStudents.metaLabel}>Application Deadline</span>
                      <span className={allStudents.metaValue}>
                        {isNaN(dateEnd) ? record.endDate : dateEnd.toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div
                    className={allStudents.cardActions}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      loading={isLoading && selectedJobId === record._id}
                      type="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction(record._id);
                      }}
                    >
                      Download
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className={allStudents.emptyState}>
              <div className={allStudents.emptyIcon}>📋</div>
              <span className={allStudents.emptyText}>No jobs found</span>
              <span className={allStudents.emptySub}>
                Try adjusting your search filters or add a new job
              </span>
            </div>
          )}
        </div>
      </div>

      <JobDetailsModal
        open={isModalOpen}
        loading={isLoading}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default PlacementDetails;
