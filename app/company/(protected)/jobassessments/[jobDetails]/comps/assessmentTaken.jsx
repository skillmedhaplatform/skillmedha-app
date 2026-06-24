"use client";
import React, { useEffect, useState } from "react";
import AtStyles from "./styles/ts.module.scss";
import { useSelector, useDispatch } from "react-redux";
import {
  getAllAppliedStudentsWithAssesmentResults,
  updateStudentAndJobStatus,
} from "@/redux/slices/company/skillMedhaData";
import { Dropdown, Modal, Table, Tag, Pagination } from "antd";
import { EllipsisOutlined } from "@ant-design/icons";
import { GetOneJob } from "@/redux/slices/company/placementsSlice";
import { useParams, useRouter } from "next/navigation";
import JobStyles from "../../../myjobs/components/myJobsStyles.module.scss";
import {
  HiOutlineUser,
  HiOutlineCheckCircle,
  HiOutlineVideoCamera,
} from "react-icons/hi2";

const AssessmentTaken = () => {
  const { value: { data: oneJobData } = {}, status } = useSelector(
    (state) => state.placement.OneJob || {}
  );
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useParams();
  const appliedStudentsWithAssesmentResults = useSelector(
    (s) => s.skillmedha.appliedStudentsWithAssesmentResults
  );

  useEffect(() => {
    if (oneJobData?.applicants?.length) {
      dispatch(
        getAllAppliedStudentsWithAssesmentResults({
          studentIds: oneJobData?.applicants?.map((e) => e?._id),
          jobId: oneJobData?._id,
          assessmentId: oneJobData?.AssessmentId,
        })
      );
    }
  }, [oneJobData?.applicants?.length]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resume, setResume] = useState("");

  const showModal = (res) => {
    setResume(res);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setResume("");
  };

  const handleMenuClick = (e, sId) => {
    if (e.key === "1") {
      // ✅ View Details → Do nothing
      router.push(`/company/jobassessments/${params?.jobDetails}/${sId}`);
      return;
    }

    let newStatus = null;

    if (e.key === "2") {
      newStatus = "approved";
    } else if (e.key === "3") {
      newStatus = "rejected";
    }

    if (!newStatus) return;

    // 🔥 Optimistic update
    const updated = appliedStudentsWithAssesmentResults.map((s) => {
      if (s._id === sId) {
        return {
          ...s,
          jobStatus: newStatus === "approved" ? "Shortlisted" : "Rejected",
        };
      }
      return s;
    });

    // Overwrite local Redux slice temporarily
    dispatch({
      type: "skillmedha/setAppliedStudentsWithAssesmentResults",
      payload: updated,
    });

    // API call to persist
    dispatch(
      updateStudentAndJobStatus({
        jobId: oneJobData?._id,
        studentId: sId,
        status: newStatus,
      })
    )?.then((resp) => {
      if (resp) {
        dispatch(
          GetOneJob({
            jobId: oneJobData?._id,
          })
        );
      }
    });
  };

  const menuItems = [
    { key: "1", label: "View Details" },
    { key: "2", label: "ShortList" },
    { key: "3", label: "Reject" },
  ];

  // Table Columns
  const columns = [
    {
      title: "",
      dataIndex: "check",
      key: "check",
      render: () => <input type="checkbox" />,
      width: 50,
    },
    {
      title: "Candidate Name",
      dataIndex: "result",
      key: "result",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) =>
        status === "Completed" ? (
          <Tag color="green">Completed</Tag>
        ) : (
          <Tag color="blue">{status}</Tag>
        ),
    },
    {
      title: "Job Status",
      dataIndex: "jobStatus",
      key: "jobStatus",
      render: (status) => {
        if (status === "shortlisted" || status == "approved") {
          return <Tag color="green">Shortlisted</Tag>;
        } else if (status === "rejected") {
          return <Tag color="red">Rejected</Tag>;
        }
        return <Tag color="blue">{status}</Tag>;
      },
    },
    {
      title: "OverAll Score",
      dataIndex: "overAllScore",
      key: "overAllScore",
      render: (overAllScore) => <div>{overAllScore || 0}</div>,
    },
    {
      title: "Test Duration",
      dataIndex: "overAllTime",
      key: "overAllTime",
      render: (overAllTime) => <div>{overAllTime || 0}</div>,
    },
    {
      title: "Resume",
      dataIndex: "resume",
      key: "resume",
      render: (res) =>
        res ? (
          <a className={AtStyles.viewLink} onClick={() => showModal(res)}>
            View
          </a>
        ) : (
          <span style={{ color: "#999" }}>No Resume</span>
        ),
    },
    {
      title: "Actions",
      dataIndex: "student",
      key: "more",
      align: "center",
      render: (record) => (
        <Dropdown
          menu={{
            items: menuItems,
            onClick: (e) => handleMenuClick(e, record._id),
          }}
          placement="bottomRight"
          arrow
        >
          <EllipsisOutlined className={AtStyles.moreIcon} />
        </Dropdown>
      ),
      width: 60,
    },
  ];
  const approvedStudents = oneJobData?.approvedStudents || [];
  const rejectedCandidates = oneJobData?.rejectedCandidates || [];

  const dataSource = appliedStudentsWithAssesmentResults?.map(
    (student, index) => {
      let jobStatus = "Pending";

      if (approvedStudents.includes(student?._id)) {
        jobStatus = "Shortlisted";
      } else if (rejectedCandidates.includes(student?._id)) {
        jobStatus = "Rejected";
      }
      return {
        key: index,
        result: student?.firstName + " " + student?.lastName,
        overAllScore: student?.jobProgress?.scoreData?.finalScore,
        overAllTime: student?.jobProgress?.scoreData?.totalTimeTaken,
        status: student?.jobProgress?._id ? "Completed" : "Pending",
        resume: student?.resumeDoc,
        student: student,
        jobStatus: student?.appliedJobs?.find((e) => e.id == oneJobData?._id)
          ?.status,
      };
    }
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(4);

  const onPageChange = (page, newPageSize) => {
    setCurrentPage(page);
    setPageSize(newPageSize);
  };

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentDataSource = dataSource?.slice(startIndex, endIndex) || [];

  return (
    <div className={AtStyles.container}>
      <div className={JobStyles.statsGrid} style={{ padding: "1rem" }}>
        {/* Card 1 */}
        <div className={JobStyles.statCard}>
          <div className={JobStyles.statIcon} style={{ backgroundColor: "rgba(107, 168, 237, 0.1)", color: "#6BA8ED" }}>
            <HiOutlineUser size={22} />
          </div>
          <div className={JobStyles.statTextCont}>
            <span className={JobStyles.statValue}>{appliedStudentsWithAssesmentResults?.length || 0}</span>
            <span className={JobStyles.statLabel}>Active Applicants</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className={JobStyles.statCard}>
          <div className={JobStyles.statIcon} style={{ backgroundColor: "rgba(34, 197, 94, 0.1)", color: "#22c55e" }}>
            <HiOutlineCheckCircle size={22} />
          </div>
          <div className={JobStyles.statTextCont}>
            <span className={JobStyles.statValue}>
              {appliedStudentsWithAssesmentResults?.reduce(
                (count, s) => (s?.jobProgress?._id ? count + 1 : count),
                0
              ) || 0}
            </span>
            <span className={JobStyles.statLabel}>Applicants Processed</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className={JobStyles.statCard} style={{ cursor: "pointer" }} onClick={() => {
              router.push(
                `/company/jobassessments/${params?.jobDetails}/live_proctoring`
              );
            }}>
          <div className={JobStyles.statIcon} style={{ backgroundColor: "rgba(249, 115, 22, 0.1)", color: "#f97316" }}>
            <HiOutlineVideoCamera size={22} />
          </div>
          <div className={JobStyles.statTextCont}>
            <span className={JobStyles.statValue} style={{ fontSize: "1rem", color: "#f97316" }}>View</span>
            <span className={JobStyles.statLabel}>Live Proctoring</span>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 1rem", marginTop: "1rem" }}>
        {dataSource?.length > 0 ? (
          <div className={JobStyles.cardsList}>
            {currentDataSource.map((item) => (
              <div
                key={item.key}
                className={JobStyles.jobCard}
              >
                {/* Checkbox and Candidate Name */}
                <div style={{ flex: 1, minWidth: "220px", display: "flex", alignItems: "center", gap: "1rem" }}>
                  <input type="checkbox" />
                  <span style={{ fontWeight: "600", color: "#1e293b", fontSize: "0.95rem" }}>{item.result}</span>
                </div>

                {/* Meta information */}
                <div className={JobStyles.cardMeta}>
                  <div className={JobStyles.metaItem}>
                    <span className={JobStyles.metaLabel}>Status</span>
                    <span className={JobStyles.metaValue}>
                      {item.status === "Completed" ? (
                        <Tag color="green">Completed</Tag>
                      ) : (
                        <Tag color="blue">{item.status}</Tag>
                      )}
                    </span>
                  </div>
                  <div className={JobStyles.metaItem}>
                    <span className={JobStyles.metaLabel}>Job Status</span>
                    <span className={JobStyles.metaValue}>
                      {item.jobStatus === "Shortlisted" || item.jobStatus === "approved" ? (
                        <Tag color="green">Shortlisted</Tag>
                      ) : item.jobStatus === "Rejected" || item.jobStatus === "rejected" ? (
                        <Tag color="red">Rejected</Tag>
                      ) : (
                        <Tag color="blue">{item.jobStatus || "Pending"}</Tag>
                      )}
                    </span>
                  </div>
                  <div className={JobStyles.metaItem}>
                    <span className={JobStyles.metaLabel}>Score</span>
                    <span className={JobStyles.metaValue}>{item.overAllScore || 0}</span>
                  </div>
                  <div className={JobStyles.metaItem}>
                    <span className={JobStyles.metaLabel}>Duration</span>
                    <span className={JobStyles.metaValue}>{item.overAllTime || 0}</span>
                  </div>
                  <div className={JobStyles.metaItem}>
                    <span className={JobStyles.metaLabel}>Resume</span>
                    <span className={JobStyles.metaValue}>
                      {item.resume ? (
                        <a className={AtStyles.viewLink} onClick={() => showModal(item.resume)}>
                          View
                        </a>
                      ) : (
                        <span style={{ color: "#999", fontSize: "0.8rem" }}>No Resume</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <div className={JobStyles.cardActions}>
                  <Dropdown
                    menu={{
                      items: menuItems,
                      onClick: (e) => handleMenuClick(e, item.student._id),
                    }}
                    placement="bottomRight"
                    arrow
                  >
                    <EllipsisOutlined className={AtStyles.moreIcon} style={{ cursor: "pointer", fontSize: "1.5rem", color: "#64748b" }} />
                  </Dropdown>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>No candidates found</div>
        )}
      </div>

      {dataSource?.length > 0 && (
        <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end", paddingRight: "1rem" }}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={dataSource.length}
            onChange={onPageChange}
            showSizeChanger
            pageSizeOptions={['4', '10', '20', '50']}
          />
        </div>
      )}

      <Modal
        title="PDF Viewer"
        open={isModalOpen}
        onCancel={handleClose}
        footer={null}
        width="60%"
        style={{
          height: "80vh",
          maxWidth: "90vw",
          marginTop: "-5rem",
        }}
        bodyStyle={{
          height: "80vh",
          padding: 0,
          overflow: "hidden",
        }}
        modalRender={(modal) => <div style={{ height: "80vh" }}>{modal}</div>}
      >
        <div style={{ height: "100%", width: "100%" }}>
          {resume ? (
            <iframe
              src={resume}
              width="100%"
              height="100%"
              style={{
                border: "none",
                minHeight: "70vh",
              }}
              title="PDF Viewer"
            />
          ) : (
            <p style={{ textAlign: "center", padding: "2rem" }}>
              {" "}
              Resume not available
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default AssessmentTaken;
