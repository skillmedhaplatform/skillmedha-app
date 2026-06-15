"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import btn from "@/public/tpo/btn.svg";
import right from "@/public/tpo/markdone.svg";
import wrong from "@/public/tpo/marknot.svg";
import Link from "next/link";
import educationStyles from "./intern.module.scss";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { getAllDetails } from "@/redux/slices/tpo/getAllDetailsSlice";
import { updateStudent } from "@/redux/slices/tpo/getAllStudentsSlice";
import {
  setResubmissionFlag,
  setApprovalFlag,
} from "@/redux/slices/tpo/resubmissionSlice";
import { Button } from "antd";
import { FaRegCheckCircle } from "react-icons/fa";
import { IoMdCloseCircleOutline } from "react-icons/io";

const Basic = () => {
  const dispatch = useDispatch();
  const params = useParams();
  const { studentId } = params;
  const [localExperiences, setLocalExperiences] = useState([]);
  const selectedStudent = useSelector(
    (state) => state.singleStudentDetails.singleStudent.value
  );

  // 1️⃣ Fetch the student on mount / id change
  useEffect(() => {
    if (params.studentId && !selectedStudent?.data) {
      dispatch(getAllDetails(params.studentId));
    }
  }, [params.studentId, dispatch, selectedStudent?.data]);

  // 2️⃣ Grab student data and seed local state

  useEffect(() => {
    if (Array.isArray(selectedStudent?.data?.experiences)) {
      setLocalExperiences(selectedStudent.data.experiences);
    }
  }, [selectedStudent?.data?.experiences]);

  // 3️⃣ Helpers
  // Map a string into a flag‐key
  const mapSectionKey = (txt = "") =>
    txt
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

  // Immutable update by index
  const produceUpdatedExperiences = (idx, status) =>
    localExperiences.map((item, i) =>
      i === idx ? { ...item, verificationType: status } : item
    );

  // 4️⃣ Handlers
  const handleApprove = (idx) => {
    const updated = produceUpdatedExperiences(idx, "approved");
    setLocalExperiences(updated);
    dispatch(
      updateStudent({
        aboutDetails: { _id: studentId, experiences: updated },
      })
    ).then(() => {
      dispatch(getAllDetails(studentId));
      const section = mapSectionKey(
        localExperiences[idx]?.company || `exp-${idx}`
      );
      dispatch(
        setApprovalFlag({ type: "internshipWorkEx", section, value: true })
      );
      dispatch(
        setResubmissionFlag({ type: "internshipWorkEx", section, value: false })
      );
    });
  };

  const handleResubmit = (idx) => {
    const updated = produceUpdatedExperiences(idx, "resubmission");
    setLocalExperiences(updated);
    dispatch(
      updateStudent({
        aboutDetails: { _id: studentId, experiences: updated },
      })
    ).then(() => {
      dispatch(getAllDetails(studentId));
      const section = mapSectionKey(
        localExperiences[idx]?.company || `exp-${idx}`
      );
      dispatch(
        setResubmissionFlag({ type: "internshipWorkEx", section, value: true })
      );
      dispatch(
        setApprovalFlag({ type: "internshipWorkEx", section, value: false })
      );
    });
  };

  // 5️⃣ Render
  return (
    <>

      <div className={educationStyles.container}>
        {localExperiences.length > 0 ? (
          localExperiences.map((item, idx) => {
            const section = mapSectionKey(item.company || `exp-${idx}`);
            return (
              <div
                key={idx}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "10px",
                  padding: "1.7rem",
                  marginTop: "1rem",
                  boxShadow: "1px 4px 8px rgba(0,0,0,0.1)",
                }}
              >
                {/* Header */}
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
                      {item?.role || "N/A"}
                    </p>
                    <p
                      style={{
                        color:
                          item?.verificationType === "approved"
                            ? "#6BA8ED"
                            : item?.verificationType === "resubmission"
                              ? "orange"
                              : "gray",
                        fontWeight: "bold",
                      }}
                    >
                      {item?.role === "No education found"
                        ? "Pending"
                        : item?.verificationType === "approved"
                          ? "Verified"
                          : item?.verificationType === "resubmission"
                            ? "Asked for Resubmission"
                            : "Pending"}
                    </p>
                  </div>
                  <div className={educationStyles.mark}>
                    <Button
                      type="text"
                      style={{ color: "#6BA8ED" }}
                      onClick={() => handleApprove(idx)}
                      icon={<FaRegCheckCircle />}
                    >
                      Mark as Verified
                    </Button>
                    <Button
                      type="text"
                      style={{ color: "red" }}
                      onClick={() => handleResubmit(idx)}
                      icon={<IoMdCloseCircleOutline />}
                    >
                      Ask for Re-Submission
                    </Button>
                  </div>
                </div>

                {/* Meta */}
                <p
                  className={educationStyles.head}
                  style={{ marginBottom: "0.5rem" }}
                >
                  {item.company || "N/A"} <strong>|</strong>{" "}
                  {item.start || "N/A"} to {item.end || "N/A"}{" "}
                  <strong>|</strong> Location: {item.city || "N/A"}
                </p>
                <hr />

                {/* Description */}
                <div className={educationStyles.aboutsidedata}>
                  {item.description ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: item.description }}
                    />
                  ) : (
                    <p>No Description Provided</p>
                  )}
                </div>

                {/* Documents link (if any) */}
                {/* <Link
                  href={
                    item.joiningFiles?.length || item.relievingFiles?.length
                      ? "#"
                      : "#"
                  }
                >
                  <p style={{ textAlign: "center", fontSize: "14px" }}>
                    {item.joiningFiles?.length || item.relievingFiles?.length
                      ? "View Documents"
                      : "No Documents Available"}
                  </p>
                </Link> */}
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
            );
          })
        ) : (
          /* fallback card */
          <div
            style={{
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "1.7rem",
              marginTop: "1rem",
              boxShadow: "1px 4px 8px rgba(0,0,0,0.1)",
            }}
          >
            <div className={educationStyles.about}>
              <p
                className={educationStyles.head}
                style={{ color: "red", fontSize: "24px" }}
              >
                No Data Available!
              </p>
              {/* <div className={educationStyles.mark}>
                  <Image
                    src={right}
                    className={educationStyles.ticks}
                    alt="approved"
                    onClick={() => handleApprove(0)}
                  />
                  <Image
                    src={wrong}
                    className={educationStyles.ticks}
                    alt="rejected"
                    onClick={() => handleResubmit(0)}
                  />
                </div> */}
            </div>

            {/* <p
                className={educationStyles.head}
                style={{ marginBottom: '0.5rem' }}
              >
                N/A | N/A to N/A | Location: N/A
              </p>
              <hr />
              <div className={educationStyles.aboutsidedata}>
                <p>N/A</p>
              </div>
              <p style={{ textAlign: 'center', fontSize: '14px' }}>
                No Documents Available
              </p> */}
          </div>
        )}
      </div>
    </>

  );
};

export default Basic;
