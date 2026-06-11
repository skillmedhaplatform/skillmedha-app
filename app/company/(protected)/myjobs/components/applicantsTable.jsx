"use client";

import React, { useState } from "react";
import { Select, Table, Input, Button } from "antd";
import {
  FaCaretDown,
  FaChevronDown,
  FaChevronRight,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { IoTimeSharp } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "next/navigation";
import styles from "../[jobId]/job.module.scss";
import { UpdateJob } from "@/redux/slices/company/placementsSlice";
import {
  Box,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";

const { Search } = Input;

export default function ApplicantsTable({ filteredApplicants, setSearchText }) {
  const { jobid } = useParams();
  const dispatch = useDispatch();
  const { value: ONEJOB } = useSelector((state) => state.placement?.OneJob ?? {});
  const JOBPROFILE = ONEJOB?.data;

  const [expandedRowKey, setExpandedRowKey] = useState(null);
  const [selectedRound, setSelectedRound] = useState("");

  const [rowSelection, setRowSelection] = useState({
    selectedRowKeys: [],
    onChange: (newSelectedRowKeys) => {
      setRowSelection((prev) => ({
        ...prev,
        selectedRowKeys: newSelectedRowKeys,
      }));
    },
  });

  const updateInterviewStatus = (studentId, submitType) => {
    const predefinedRounds = JOBPROFILE?.interviewRounds || [];
    const existingStatusList = JOBPROFILE?.interviewStatusByApplicant || [];

    const updatedStatusList = [...existingStatusList];
    const studentIndex = existingStatusList.findIndex(
      (entry) => entry.studentId === studentId
    );
    const isNewStudent = studentIndex === -1;

    if (
      isNewStudent &&
      submitType === "success" &&
      predefinedRounds.length > 0
    ) {
      updatedStatusList.push({
        studentId,
        interviewStatus: [
          {
            roundName: predefinedRounds[0].roundName,
            status: "success",
            date: predefinedRounds[0].date || "",
          },
        ],
      });
    }

    if (!isNewStudent) {
      const entry = existingStatusList[studentIndex];
      const interviewStatus = [...(entry.interviewStatus || [])];
      const currentRoundIndex = interviewStatus.length;

      const lastStatus = interviewStatus[currentRoundIndex - 1]?.status;
      if (lastStatus === "rejected") return;

      if (
        submitType === "rejected" &&
        currentRoundIndex < predefinedRounds.length
      ) {
        interviewStatus.push({
          roundName: predefinedRounds[currentRoundIndex].roundName,
          status: "rejected",
          date: predefinedRounds[currentRoundIndex].date || "",
        });
      }

      if (
        submitType === "success" &&
        currentRoundIndex < predefinedRounds.length
      ) {
        interviewStatus.push({
          roundName: predefinedRounds[currentRoundIndex].roundName,
          status: "success",
          date: predefinedRounds[currentRoundIndex].date || "",
        });
      }

      updatedStatusList[studentIndex] = {
        ...entry,
        interviewStatus,
      };
    }

    dispatch(
      UpdateJob({
        dispatch,
        payload: { interviewStatusByApplicant: updatedStatusList },
        jobid,
      })
    );
  };

  const handleBackRound = (studentId) => {
    const existingStatusList = JOBPROFILE?.interviewStatusByApplicant || [];
    const updatedStatusList = [...existingStatusList];
    const studentIndex = existingStatusList.findIndex(
      (entry) => entry.studentId === studentId
    );

    if (studentIndex !== -1) {
      const entry = existingStatusList[studentIndex];
      const interviewStatus = [...(entry.interviewStatus || [])];

      if (interviewStatus.length > 0) {
        interviewStatus.pop();
        updatedStatusList[studentIndex] = {
          ...entry,
          interviewStatus,
        };

        dispatch(
          UpdateJob({
            dispatch,
            payload: { interviewStatusByApplicant: updatedStatusList },
            jobid,
          })
        );
      }
    }
  };

  const getExpandableConfig = () => ({
    expandedRowRender: (record) => {
      const studentEntry = JOBPROFILE?.interviewStatusByApplicant?.find(
        (s) => s?.studentId === record?._id
      );
      const interviewStatus = studentEntry?.interviewStatus || [];
      const predefinedRounds = JOBPROFILE?.interviewRounds || [];

      const getStepProps = (statusEntry) => {
        if (statusEntry?.status === "success")
          return {
            icon: <FaCheckCircle style={{ color: "#25a3a6", fontSize: 22 }} />,
          };
        if (statusEntry?.status === "rejected")
          return {
            icon: <FaTimesCircle style={{ color: "#fd4848", fontSize: 22 }} />,
          };
        return {
          icon: <IoTimeSharp style={{ color: "#ffa805", fontSize: 26 }} />,
        };
      };

      return (
        <Box sx={{ maxWidth: 800, ml: 5 }}>
          <Stepper orientation="vertical" activeStep={interviewStatus.length}>
            {predefinedRounds.map((step, index) => {
              const statusEntry = interviewStatus[index];
              const { icon } = getStepProps(statusEntry);
              const previousEntry = interviewStatus[index - 1];
              const isRejected = previousEntry?.status === "rejected";

              return (
                <Step key={index}>
                  <StepLabel StepIconComponent={() => icon}>
                    <p
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color:
                          statusEntry?.status === "rejected"
                            ? "#f44336"
                            : "inherit",
                      }}
                    >
                      {step.roundName}
                    </p>
                  </StepLabel>
                  <StepContent>
                    <p>{step.description}</p>
                    <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                      <Button
                        variant="contained"
                        onClick={() =>
                          updateInterviewStatus(record._id, "success")
                        }
                        disabled={Boolean(isRejected)}
                      >
                        Move to Next Round
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() =>
                          updateInterviewStatus(record._id, "rejected")
                        }
                        disabled={Boolean(isRejected)}
                      >
                        Reject
                      </Button>
                      <Button
                        variant="text"
                        onClick={() => handleBackRound(record._id)}
                        disabled={index === 0}
                      >
                        Back
                      </Button>
                    </Box>
                  </StepContent>
                </Step>
              );
            })}
          </Stepper>
        </Box>
      );
    },
    expandedRowKeys: expandedRowKey ? [expandedRowKey] : [],
    onExpand: () => {},
    expandIcon: () => null,
    rowExpandable: () => true,
  });

  const columns = [
    {
      title: "Name",
      dataIndex: "userName",
      key: "userName",
      render: (_, record) => <strong  style={{cursor:"pointer"}}>{record?.userName}</strong>,
    },
    {
      title: "Skillmedha Id",
      // dataIndex: "enrollementId",
      // key: "enrollementId",
      dataIndex: "_id",
      key: "_id",
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => {
        const studentEntry = JOBPROFILE?.interviewStatusByApplicant?.find(
          (s) => s?.studentId === record?._id
        );
        const interviewStatus = studentEntry?.interviewStatus || [];
        const currentIndex = interviewStatus.length;
        const lastStatus = interviewStatus[currentIndex - 1]?.status;

        let statusText = "Applied";
        let className = "pending";

        if (lastStatus === "rejected") {
          statusText = "Rejected";
          className = "rejected";
        } else if (interviewStatus.length === 0) {
          statusText = "Pending";
          className = "pending";
        } else if (lastStatus === "success") {
          statusText = "Completed";
          className = "completed";
        } else {
          statusText = "In Progress";
          className = "pending";
        }

        return (
          <div className={styles.statusCont} style={{cursor:"pointer"}}>
            <span className={`${styles.status} ${styles[className]}`}>
              {statusText} : {currentIndex}
            </span>
          </div>
        );
      },
    },
    {
      title: "Interview Details",
      key: "expand",
      render: (_, record) => {
        const isExpanded = expandedRowKey === record?._id;
        const Icon = isExpanded ? FaChevronDown : FaChevronRight;
        return (
          <Button
           style={{cursor:"pointer"}}
            type={isExpanded ? "primary" : "default"}
            onClick={(e) => {
              e.stopPropagation();
              setExpandedRowKey(isExpanded ? null : record?._id);
            }}
          >
            <Icon />
          </Button>
        );
      },
    },
  ];

  return (
    <div className={`${styles.contentCont} ${styles.applicantsCont}`}>
      <div className={styles.searchCont}>
        <Search
          placeholder="Search by name or roll number"
          allowClear
          onChange={(e) => setSearchText(e.target.value)}
          className={styles.searchInput}
        />
        <div className={styles.filterCont}>
          <Select
            className={styles.select}
            suffixIcon={<FaCaretDown />}
            size="middle"
          />
          <Select
            className={styles.select}
            suffixIcon={<FaCaretDown />}
            size="middle"
            placeholder="Interview Rounds"
            allowClear
            options={JOBPROFILE?.interviewRounds?.map((round, index) => ({
              label: round?.roundName,
              value: round?.roundName,
              key: index,
            }))}
            onChange={(value) => setSelectedRound(value || "")}
          />
        </div>
      </div>

      <div className={styles.tableCont} >
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={filteredApplicants}
          pagination={false}
          scroll={{ y: 600 }}
          onRow={(record) => {
            const departmentId = record?.department || "noDept";
            const studentId = record?._id;
            return {
              onClick: () =>
                window.open(
                  `https://tpo.skillmedha.com/allstudents/${departmentId}/${studentId}/basic-details`,
                  "_blank"
                ),
              style: {
                cursor: "pointer",
              },
            };
          }}
          rowSelection={rowSelection}
          expandable={getExpandableConfig()}
        />
      </div>
    </div>
  );
}
