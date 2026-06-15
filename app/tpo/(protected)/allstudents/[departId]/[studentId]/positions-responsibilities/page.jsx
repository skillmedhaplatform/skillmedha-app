"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import btn from "@/public/tpo/btn.svg";
import right from "@/public/tpo/markdone.svg";
import wrong from "@/public/tpo/marknot.svg";
import Link from "next/link";
import styles from "./intern.module.scss";
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
import { parseIfJson } from "@/utils/universalUtils/windowMW";

const PositionsAndResponsibilities = () => {
  const dispatch = useDispatch();
  const params = useParams();
  const { studentId } = params;
  const [localResponsibilities, setLocalResponsibilities] = useState([]);

  // 2️⃣ Pull from store and seed local state
  const selectedStudent = useSelector(
    (state) => state.singleStudentDetails.singleStudent.value
  );

  // 1️⃣ Fetch student details
  useEffect(() => {
    if (params.studentId && !selectedStudent?.data) {
      dispatch(getAllDetails(params.studentId));
    }
  }, [params.studentId, dispatch, selectedStudent?.data]);


  useEffect(() => {
    if (Array.isArray(selectedStudent?.data?.responsibilities)) {
      setLocalResponsibilities(selectedStudent.data.responsibilities);
    }
  }, [selectedStudent?.data?.responsibilities]);

  // 3️⃣ Helpers
  const mapSectionKey = (title = "") =>
    title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

  const updateByResponsibility = (target, status) =>
    localResponsibilities.map((item) =>
      item.responsibility === target
        ? { ...item, verificationType: status }
        : item
    );

  // 4️⃣ Handlers
  const handleApprove = (responsibility) => {
    const updated = updateByResponsibility(responsibility, "approved");
    setLocalResponsibilities(updated);

    dispatch(
      updateStudent({
        aboutDetails: { _id: studentId, responsibilities: updated },
      })
    ).then(() => {
      dispatch(getAllDetails(studentId));
      const section = mapSectionKey(responsibility);
      dispatch(
        setApprovalFlag({
          type: "positionOfResponsibilities",
          section,
          value: true,
        })
      );
      dispatch(
        setResubmissionFlag({
          type: "positionOfResponsibilities",
          section,
          value: false,
        })
      );
    });
  };

  const handleResubmit = (responsibility) => {
    const updated = updateByResponsibility(responsibility, "resubmission");
    setLocalResponsibilities(updated);

    dispatch(
      updateStudent({
        aboutDetails: { _id: studentId, responsibilities: updated },
      })
    ).then(() => {
      dispatch(getAllDetails(studentId));
      const section = mapSectionKey(responsibility);
      dispatch(
        setResubmissionFlag({
          type: "positionOfResponsibilities",
          section,
          value: true,
        })
      );
      dispatch(
        setApprovalFlag({
          type: "positionOfResponsibilities",
          section,
          value: false,
        })
      );
    });
  };

  // 5️⃣ Render
  return (
    <>

      <div className={styles.container}>
        {localResponsibilities.length > 0 ? (
          localResponsibilities.map((item, idx) => {
            const section = mapSectionKey(item.responsibility);
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
                <div className={styles.about}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "start",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    <p className={styles.head}>
                      {item.responsibility || "N/A"}
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
                      {item?.type === "No education found"
                        ? "Pending"
                        : item?.verificationType === "approved"
                          ? "Verified"
                          : item?.verificationType === "resubmission"
                            ? "Asked for Resubmission"
                            : "Pending"}
                    </p>
                  </div>
                  <div className={styles.mark}>
                    <Button
                      type="text"
                      style={{ color: "#6BA8ED" }}
                      onClick={() => handleApprove(item.responsibility)}
                      icon={<FaRegCheckCircle />}
                    >
                      Mark as Verified
                    </Button>
                    <Button
                      type="text"
                      style={{ color: "red" }}
                      onClick={() => handleResubmit(item.responsibility)}
                      icon={<IoMdCloseCircleOutline />}
                    >
                      Ask for Re-Submission
                    </Button>
                  </div>
                </div>

                <p className={styles.head} style={{ marginBottom: "0.5rem" }}>
                  {item.company || "N/A"} <strong>|</strong>{" "}
                  {item.start || "N/A"} to {item.end || "N/A"}{" "}
                  <strong>|</strong> Location: {item.city || "N/A"}
                </p>
                <hr />

                <div className={styles.aboutsidedata}>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: parseIfJson(item?.description),
                    }}
                  />
                </div>
                {item?.fileUrl && (
                  <div className={styles.detailRow}>
                    <p className={styles.label}>Marksheet :</p>
                    <a
                      className={styles.value}
                      style={{ color: "#56D2D4" }}
                      href={item?.fileUrl}
                      target="_blank"
                    >
                      Download
                    </a>
                  </div>
                )}
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
              </div>
            );
          })
        ) : (
          <div
            style={{
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "1.7rem",
              marginTop: "1rem",
              boxShadow: "1px 4px 8px rgba(0,0,0,0.1)",
            }}
          >
            <div className={styles.about}>
              <p
                className={styles.head}
                style={{ color: "red", fontSize: "24px" }}
              >
                No Data Available!
              </p>
              {/* <div className={styles.mark}>
                <Image
                  src={right}
                  className={styles.ticks}
                  alt="approved"
                  onClick={() => handleApprove('nodata')}
                />
                <Image
                  src={wrong}
                  className={styles.ticks}
                  alt="rejected"
                  onClick={() => handleResubmit('nodata')}
                />
              </div> */}
            </div>
            {/* <p
              className={styles.head}
              style={{ marginBottom: '0.5rem' }}
            >
              N/A | N/A to N/A | Location: N/A
            </p>
            <hr />
            <div className={styles.aboutsidedata}>
              <p>N/A</p>
            </div>
            <Link href="#">
              <p style={{ textAlign: 'center', fontSize: '14px' }}>
                No Documents Available
              </p>
            </Link> */}
          </div>
        )}
      </div>
    </>

  );
};

export default PositionsAndResponsibilities;
