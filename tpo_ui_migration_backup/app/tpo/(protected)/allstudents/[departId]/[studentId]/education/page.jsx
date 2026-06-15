"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import btn from "@/public/tpo/btn.svg";
import right from "@/public/tpo/markdone.svg";
import wrong from "@/public/tpo/marknot.svg";
import Link from "next/link";
import educationStyles from "./education.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { getAllDetails } from "@/redux/slices/tpo/getAllDetailsSlice";
import { updateStudent } from "@/redux/slices/tpo/getAllStudentsSlice";
import { useParams } from "next/navigation";
import {
  setResubmissionFlag,
  setApprovalFlag,
} from "@/redux/slices/tpo/resubmissionSlice";
import { Button } from "antd";
import { FaRegCheckCircle } from "react-icons/fa";
import { IoMdCloseCircleOutline } from "react-icons/io";
import PageHeader from "@/modules/tpo/components/PageHeader";

const Educational = () => {
  const dispatch = useDispatch();
  const params = useParams();
  const { studentId } = params;
  // Local state to keep cumulative updates in the UI
  const [localEdDetails, setLocalEdDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check if we have real data or not
  const hasRealData = localEdDetails.length > 0;
  // Pull the student object from the store
  const selectedStudent = useSelector(
    (state) => state.singleStudentDetails.singleStudent.value,
  );

  // Fetch student details on mount / when studentId changes
  useEffect(() => {
    if (params.studentId && !selectedStudent?.data) {
      dispatch(getAllDetails(params.studentId));
    }
  }, [params.studentId, dispatch, selectedStudent?.data]);

  // When the store's educationDetails array arrives or changes, seed our local state
  useEffect(() => {
    if (selectedStudent?.data?.educationDetails) {
      setLocalEdDetails(selectedStudent.data.educationDetails);
    }
  }, [selectedStudent?.data?.educationDetails]);

  // Utility to immutably update one item's verificationType by matching on its `type` field
  const produceUpdatedEducation = (arr, targetType, status) =>
    arr.map((item) =>
      item?.type === targetType ? { ...item, verificationType: status } : item,
    );

  // Handlers that update local state, POST to server, then re-fetch + dispatch flags
  const handleResubmit = (type, sectionKey) => {
    if (!type) return;
    const updated = produceUpdatedEducation(
      localEdDetails,
      type,
      "resubmission",
    );
    setLocalEdDetails(updated);
    dispatch(
      updateStudent({
        aboutDetails: { _id: studentId, educationDetails: updated },
      }),
    ).then(() => {
      dispatch(getAllDetails(studentId));
      dispatch(
        setResubmissionFlag({
          type: "educationalDetails",
          section: sectionKey,
          value: true,
        }),
      );
      dispatch(
        setApprovalFlag({
          type: "educationalDetails",
          section: sectionKey,
          value: false,
        }),
      );
    });
  };

  const handleApprove = (type, sectionKey) => {
    console.log(type, sectionKey);

    if (!type) return;
    const updated = produceUpdatedEducation(localEdDetails, type, "approved");
    setLocalEdDetails(updated);
    console.log(studentId);

    dispatch(
      updateStudent({
        aboutDetails: { _id: studentId, educationDetails: updated },
      }),
    ).then(() => {
      dispatch(getAllDetails(studentId));
      dispatch(
        setApprovalFlag({
          type: "educationalDetails",
          section: sectionKey,
          value: true,
        }),
      );
      dispatch(
        setResubmissionFlag({
          type: "educationalDetails",
          section: sectionKey,
          value: false,
        }),
      );
    });
  };

  // Map the education `type` into your resubmission/approval-flag keys
  const mapSectionKey = (type) => {
    if (!type) return "";
    switch (type.toLowerCase()) {
      case "class x":
      case "10th":
      case "ssc":
      case "10th / secondary education":
        return "class-X";
      case "class xii":
      case "12th":
      case "hsc":
      case "senior secondary / diploma / iti":
        return "class-XII";
      case "diploma":
        return "diploma";
      case "undergraduate":
        return "ug";
      case "postgraduate":
        return "pg";
      default:
        return type.toLowerCase().replace(/\s+/g, "-");
    }
  };

  return (
    <>
      <PageHeader title="Education" />
      <div className={educationStyles.container}>
        {/* Default card when no data available */}
        {!hasRealData && (
          <div
            style={{
              border: "1px solid grey",
              borderRadius: "10px",
              padding: "1.7rem",
              marginTop: "1rem",
              boxShadow: "1px 4px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div className={educationStyles.about}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <p
                  className={educationStyles.head}
                  style={{ color: "red", fontSize: "24px" }}
                >
                  No Data Available!
                </p>
                {/* <p
                    style={{
                      color:
                        getFallbackStatus() === "Approved"
                          ? "green"
                          : getFallbackStatus() === "Asked for Resubmission"
                          ? "orange"
                          : "gray",
                      fontWeight: "bold",
                    }}
                  >
                    Status: {getFallbackStatus()}
                  </p> */}
              </div>
              {/* <div className={educationStyles.mark}>
                  <Image
                    src={right}
                    className={educationStyles.ticks}
                    alt="approved"
                    onClick={() => handleApprove("default", "default")}
                  />
                  <Image
                    src={wrong}
                    className={educationStyles.ticks}
                    alt="rejected"
                    onClick={() => handleResubmit("default", "default")}
                  />
                </div> */}
            </div>
          </div>
        )}
        {/* Render actual data if available */}
        {hasRealData &&
          localEdDetails.map((item, idx) => {
            const sectionKey = mapSectionKey(item?.type);
            console.log(sectionKey);

            return (
              <div
                key={idx}
                style={{
                  border: "1px solid grey",
                  borderRadius: "10px",
                  padding: "1.7rem",
                  marginTop: "1rem",
                  boxShadow: "1px 4px 8px rgba(0, 0, 0, 0.1)",
                }}
              >
                {/* Header with approve/resubmit */}
                <div className={educationStyles.about}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "start",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    <p className={educationStyles.head}>
                      {item?.type || "N/A"}
                    </p>
                    <p
                      style={{
                        color:
                          item?.verificationType === "approved"
                            ? "green"
                            : item?.verificationType === "resubmission"
                              ? "orange"
                              : "gray",
                        fontWeight: "bold",
                      }}
                    >
                      {item?.verificationType === "approved"
                        ? "Verified"
                        : item?.verificationType === "resubmission"
                          ? "Asked for Resubmission"
                          : "Pending"}
                    </p>
                  </div>
                  <div className={educationStyles.mark}>
                    <Button
                      type="text"
                      style={{ color: "#24A058" }}
                      onClick={() =>
                        item && handleApprove(item.type, sectionKey)
                      }
                      icon={<FaRegCheckCircle />}
                    >
                      Mark as Verified
                    </Button>
                    <Button
                      type="text"
                      style={{ color: "red" }}
                      onClick={() =>
                        item && handleResubmit(item.type, sectionKey)
                      }
                      icon={<IoMdCloseCircleOutline />}
                    >
                      Ask for Re-Submission
                    </Button>
                  </div>
                </div>

                {/* Details grid */}
                <div className={educationStyles.aboutsidedata}>
                  <div className={educationStyles.leftSection}>
                    <div className={educationStyles.detailRow}>
                      <p className={educationStyles.label}>
                        Board of Education :
                      </p>
                      <p className={educationStyles.value}>
                        {item?.board || "N/A"}
                      </p>
                    </div>
                    <div className={educationStyles.detailRow}>
                      <p className={educationStyles.label}>School :</p>
                      <p className={educationStyles.value}>
                        {item?.school || "N/A"}
                      </p>
                    </div>
                    <div className={educationStyles.detailRow}>
                      <p className={educationStyles.label}>Start Year :</p>
                      <p className={educationStyles.value}>
                        {item?.startDate || "N/A"}
                      </p>
                    </div>
                    <div className={educationStyles.detailRow}>
                      <p className={educationStyles.label}>End Year :</p>
                      <p className={educationStyles.value}>
                        {item?.endDate || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className={educationStyles.rightSection}>
                    <div className={educationStyles.detailRow}>
                      <p className={educationStyles.label}>Grading Type :</p>
                      <p className={educationStyles.value}>
                        {item?.gradingSystem || "N/A"}
                      </p>
                    </div>
                    <div className={educationStyles.detailRow}>
                      <p className={educationStyles.label}>Grade Obtained :</p>
                      <p className={educationStyles.value}>
                        {item?.grade || "N/A"}
                      </p>
                    </div>
                    <div className={educationStyles.detailRow}>
                      <p className={educationStyles.label}>Location :</p>
                      <p className={educationStyles.value}>
                        {item?.city || "N/A"}
                      </p>
                    </div>
                    {item?.fileUrl && (
                      <div className={educationStyles.detailRow}>
                        <p className={educationStyles.label}>Marksheet :</p>
                        <a
                          className={educationStyles.value}
                          style={{ color: "#56D2D4" }}
                          href={item?.fileUrl}
                          target="_blank"
                        >
                          Download
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Remarks & Description */}

                {/* View docs link */}
                {/* <Link href={item ? "#" : "#"}>
                  <p
                    style={{
                      textAlign: "center",
                      fontSize: "14px",
                      marginTop: "1rem",
                    }}
                  >
                    {item ? "View Documents" : "No Documents Available"}
                  </p>
                </Link> */}
              </div>
            );
          })}
      </div>
    </>
  );
};

export default Educational;
