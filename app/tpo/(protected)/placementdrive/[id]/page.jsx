"use client";
import React, { useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import allStudents from "./allstudents.module.scss";
import Search from "antd/es/input/Search";
import { Button, message, Select } from "antd";

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
import { FaCaretRight } from "react-icons/fa";

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

  // Pagination calculation
  const totalPages = Math.ceil(filteredJobs.length / pageSize);
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <>
      <PageHeader
        breadcrumb="Placement drive"
        title={getName(id) || "Company Details"}
        subtitle="Manage jobs and job description postings for this company"
        actionText="+ Add New Job"
        onActionClick={() =>
          router.push(`/tpo/placementdrive/${id}/${jobid || "job"}/createjob`)
        }
      />
      <div className={allStudents.container}>
        {/* Breadcrumbs Trail */}
        <div className={allStudents.headerCont} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
          <Button type="primary" onClick={() => router.push(`/tpo/placementdrive/${id}/${jobid || "job"}/createjob`)}>
            + Add New Job
          </Button>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "1.5rem",
            marginBottom: "1.5rem",
            gap: "1.5rem",
          }}
        >
          <Select
            value={selectedProfile}
            style={{ width: 415, height: 38, textAlign: "center" }}
            onChange={(value) => setSelectedProfile(value)}
            options={profileOptions}
          />
          <Search
            placeholder="Search by profile or company name"
            style={{ width: 415, height: 38 }}
            allowClear
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
                  <div className={allStudents.companyInfo} style={{ minWidth: '220px' }}>
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
                    <div className={allStudents.metaItem}>
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

        {/* ── Pagination ── */}
        {filteredJobs.length > 0 && (
          <div className={allStudents.paginationRow}>
            <div className={allStudents.paginationLeft}>
              <span className={allStudents.pageSizeLabel}>Items per page:</span>
              <Select
                className={allStudents.pageSizeSelect}
                value={pageSize}
                onChange={handlePageSizeChange}
                options={PAGE_SIZES.map((s) => ({
                  value: s,
                  label: `${s}`,
                }))}
                size="middle"
                style={{ width: 80 }}
              />
              <span className={allStudents.showingText}>
                Showing {(currentPage - 1) * pageSize + 1}–
                {Math.min(currentPage * pageSize, filteredJobs.length)} of{" "}
                {filteredJobs.length} job profiles
              </span>
            </div>

            <div className={allStudents.paginationRight}>
              <button
                className={allStudents.pageBtn}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                ‹
              </button>

              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let page;
                if (totalPages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }
                return (
                  <button
                    key={page}
                    className={`${allStudents.pageBtn} ${currentPage === page ? allStudents.pageBtnActive : ""}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                className={allStudents.pageBtn}
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                ›
              </button>
            </div>
          </div>
        )}
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
