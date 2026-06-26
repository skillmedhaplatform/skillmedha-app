"use client";
import React, { useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import allStudents from "./allstudents.module.scss";
import Search from "antd/es/input/Search";
import { Button, message, Table, Select } from "antd";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  GetAllJobs,
  GetAllPlacements,
  GetOneJob,
} from "@/redux/slices/company/placementsSlice";
import JobDetailsModal from "./jobDetailsModal";
import { FaCaretRight } from "react-icons/fa";

const PlacementDetails = () => {
  const { id, jobid } = useParams();
  const router = useRouter();
  const path = usePathname();
  const dispatch = useDispatch();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProfile, setSelectedProfile] = useState("All");

  const { value: ALLJOBS } = useSelector((state) => state.placement.AllJobs);
  const { value: ALLPLACEMENTS } = useSelector(
    (state) => state.placement.AllPlacements
  );

  useEffect(() => {
    dispatch(GetAllJobs({ limit: 10, profileId: id }));
    dispatch(GetAllPlacements());
  }, []);

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

  const columns = [
    // {
    //   title: "Company",
    //   dataIndex: "companyName",
    //   key: "companyName",
    // },
    {
      title: "Job Title",
      dataIndex: "jobTitle",
      key: "jobTitle",
    },
    {
      title: "Interview Rounds",
      dataIndex: "interviewRounds",
      key: "interviewRounds",
      render: (rounds) =>
        Array.isArray(rounds) && rounds.length > 0
          ? `${rounds.length} Round${rounds.length > 1 ? "s" : ""}`
          : "0 Rounds",
    },
    {
      title: "Applicants",
      dataIndex: "applicants",
      key: "applicants",
      render: (applicants) =>
        Array.isArray(applicants) && applicants.length > 0
          ? `${applicants.length} Applicant${applicants.length > 1 ? "s" : ""}`
          : "0 Applicants",
    },
    {
      title: "Application Deadline",
      key: "applicationDeadline",
      render: (_, record) => {
        const date = new Date(record.endDate);
        return isNaN(date) ? "Invalid Date" : date.toLocaleDateString();
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div style={{ minWidth: "8rem" }}>
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
      ),
    },
  ];

  const baseUrl = `/placementdrive/${id}`;

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

  return (
    <>
      <div className={allStudents.container}>
        <div style={{ display: "flex", gap: "1rem" }}>
          <p
            className={allStudents.head}
            onClick={() => router.push(`/placementdrive`)}
            style={{ cursor: "pointer" }}
          >
            All Companies
          </p>
          <p className={allStudents.head}>
            {<FaCaretRight style={{ fontSize: "24px" }} />}
          </p>
          <p className={allStudents.head} style={{ fontWeight: "bold" }}>
            {getName(id)}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "1rem",
          }}
        >
          <Select
            value={selectedProfile}
            style={{ width: 415, textAlign: "center" }}
            onChange={(value) => setSelectedProfile(value)}
            options={profileOptions}
          />
          <Search
            placeholder="Search by profile or company name"
            style={{ width: 415 }}
            allowClear
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            style={{
              backgroundColor: "#25A3A6",
              border: "none",
              color: "white",
              fontWeight: "bold",
              width: 415,
              borderRadius: "0.2rem",
              cursor: "pointer",
            }}
            onClick={() =>
              router.push(`/placementdrive/${id}/${jobid || "job"}/createjob`)
            }
          >
            + Add New Job
          </button>
        </div>

        <Table
          scroll={{ y: 600 }}
          columns={columns}
          dataSource={filteredJobs}
          // dataSource={ALLJOBS?.data}
          pagination={false}
          className={allStudents.custom_table}
          onRow={(record) => ({
            onClick: () => handleClick(record),
            style: { cursor: "pointer" },
          })}
        />
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
