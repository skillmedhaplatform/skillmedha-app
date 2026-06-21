"use client";
import { getScheduledInterviewsForJob, updateStudentAndJobStatus } from "@/redux/slices/company/skillMedhaData";
import { useParams } from "next/navigation";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Table, Button, Dropdown } from "antd";
// import { ChevronRight } from "lucide-react";
import styles from "./styles/int.module.scss";
import { GetOneJob } from "@/redux/slices/company/placementsSlice";
import { EllipsisOutlined } from "@ant-design/icons";

const Interviews = () => {
  const params = useParams();
  const jobId = params?.jobDetails;
  const dispatch = useDispatch();

  const scheduledInterviewsForJob = useSelector(
    (state) => state.skillmedha.scheduledInterviewsForJob
  );

  useEffect(() => {
    if (jobId) {
      dispatch(getScheduledInterviewsForJob({ jobId }));
    }
  }, [jobId, dispatch]);

const students =
  scheduledInterviewsForJob?.filter((e) => {
    // Find the applied job for this jobId
    const appliedJob = e?.studentDetails?.appliedJobs?.find(
      (applied) => applied?.id === jobId
    );

    // Keep only if the appliedJob exists and status is not approved/rejected/shortlisted
    return (
      appliedJob &&
      !["approved", "rejected", "shortlisted"].includes(
        appliedJob?.status?.toLowerCase()
      )
    );
  }) || [];


  // Map API data into AntD table format
  const dataSource = students.map((s, index) => {
    const d = s.interviewDetails;    
    return {
      key: d?.interviewId || index,
      candidate: d?.candidateDetails,
       date :{val :  d?.date , time : d?.time},
       interviewer : d?.interviewer,
      join: "Join",
    };
  });


    const menuItems = [
    { key: "1", label: "ShortList" },
    { key: "2", label: "Reject" },
  ];
const handleMenuClick = (e, studentId) => {
  let newStatus = null;

  if (e.key === "1") {
    newStatus = "approved";
  } else if (e.key === "2") {
    newStatus = "rejected";
  }

  if (!newStatus) return;

  // 🔥 Optimistic update
  const updated = students?.map((s) => {
    if (s.studentId === studentId) {
      return {
        ...s,
        interviewDetails: {
          ...s.interviewDetails,
          status: newStatus,
        },
      };
    }
    return s;
  });

  dispatch({
    type: "skillmedha/setScheduledInterviewsForJob",
    payload: {
      ...students,
      students: updated,
    },
  });

  // API call to persist
  dispatch(
    updateStudentAndJobStatus({
      jobId: jobId,
      studentId,
      status: newStatus,
    })
  )?.then((resp) => {
    if (resp) {
      // Refresh latest from backend
      dispatch(
        getScheduledInterviewsForJob({
          jobId: jobId,
        })
      );
    }
  });
};


  const columns = [
     {
    title: "Candidate Info",
    dataIndex: "candidate",
    key: "candidate",
    render: (_, record) => (
      <div>
        <div className={styles.nameLink}><strong>Name :</strong> {record.candidate?.name}</div>
        <div className={styles.email}><strong>Email :</strong> {record.candidate?.email}</div>
        <div className={styles.phone}><strong>Phone :</strong> {record.candidate?.phone}</div>
      </div>
    ),
  },
        {
      title: "Score",
      dataIndex: "candidate",
      key: "candidate",
      render: (_,record) => (
       <div>
        <strong className={styles.nameLink}> {record.candidate?.gainedScore} / {record.candidate?.totalScore}</strong>
      </div>
      ),
    },
     {
      title: "Interview Date",
      dataIndex: "date",
      key: "date",
      render: (_,record) => {
        return(
        <strong className={styles.nameLink}>
         ScheduledAt : {record?.date?.val},{record?.date?.time}
        </strong>
      )},
    },
    {
      title: "Interview By" ,
      dataIndex: "interviewer",
      key: "interviewer",
      render: (_,{interviewer}) => {
        return(
        <div>
        <div className={styles.nameLink}><strong>Name :</strong> {interviewer.name}</div>
        <div className={styles.email}><strong>Email :</strong> {interviewer.email}</div>
        <div className={styles.phone}><strong>Phone :</strong> {interviewer.designation}</div>
      </div>
      )},
    },
    {
      title: "Action",
      dataIndex: "join",
      key: "join",
       render: (_,record) => (
        <Dropdown menu={{ items: menuItems , onClick: (e) => handleMenuClick(e, record?.candidate?._id), }}  placement="bottomRight" arrow>
          <EllipsisOutlined className={styles.moreIcon} />
        </Dropdown>
      ),
    },
    
  ];

 

  return (
    <div className={styles.wrapper}>
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        className={styles.customTable}
      />
    </div>
  );
};

export default Interviews;
