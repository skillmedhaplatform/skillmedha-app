"use client";

import React, { useEffect, useState } from "react";
import AtStyles from "./styles/ts.module.scss";
import { useSelector, useDispatch } from "react-redux";
import {
  getAllAppliedStudentsWithAssesmentResults,
  updateStudentAndJobStatus,
} from "@/redux/slices/company/skillMedhaData";
import { Dropdown, Modal, Table, Tag } from "antd";
import { EllipsisOutlined } from "@ant-design/icons";
import { GetOneJob } from "@/redux/slices/company/placementsSlice";
import { useParams, useRouter } from "next/navigation";

const AssessmentTaken = () => {
  const { value: { data: oneJobData } = {}, status } = useSelector(
    (state) => state.companyPlacements?.OneJob || {}
  );
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useParams();
  const appliedStudentsWithAssesmentResults = useSelector(
    (s) => s.companySkillMedhaData?.appliedStudentsWithAssesmentResults
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
        console.log();

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

  return (
    <div className={AtStyles.container}>
      <div className={AtStyles.headContainer}>
        <div className={AtStyles.title}>{oneJobData?.jobTitle}</div>
      </div>

      <div className={AtStyles.cardsGrid}>
        {/* Card 1 */}
        <div className={AtStyles.card}>
          <h2 className={AtStyles.cardTitle}>Active Applicants</h2>
          <p className={AtStyles.cardNumber}>
            {appliedStudentsWithAssesmentResults?.length}
          </p>
        </div>

        {/* Card 2 */}
        <div className={AtStyles.card}>
          <h2 className={AtStyles.cardTitle}>Applicants Processed</h2>
          <p className={AtStyles.cardNumber}>
            {appliedStudentsWithAssesmentResults?.reduce(
              (count, s) => (s?.jobProgress?._id ? count + 1 : count),
              0
            )}
          </p>
        </div>

        {/* Card 3 */}
        <div className={AtStyles.card}>
          <h2 className={AtStyles.cardTitle}>Live Proctoring</h2>
          <p
            className={AtStyles.viewBtn}
            onClick={() => {
              router.push(
                `/company/jobassessments/${params?.jobDetails}/live_proctoring`
              );
            }}
          >
            View
          </p>
        </div>
      </div>

      <div className={AtStyles.tableContainer}>
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          className={AtStyles.table}
          loading={status === "loading"}
        />
      </div>

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
