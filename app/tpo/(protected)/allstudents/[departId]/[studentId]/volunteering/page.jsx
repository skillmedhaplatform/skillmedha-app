"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import btn from "@/public/tpo/btn.svg";
import right from "@/public/tpo/markdone.svg";
import wrong from "@/public/tpo/marknot.svg";
import education from "./intern.module.scss";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { getAllDetails } from "@/redux/slices/tpo/getAllDetailsSlice";
import { updateStudent } from "@/redux/slices/tpo/getAllStudentsSlice";
import {
  setResubmissionFlag,
  setApprovalFlag,
} from "@/redux/slices/tpo/resubmissionSlice";
import { Button } from "antd";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { FaRegCheckCircle } from "react-icons/fa";
import { parseIfJson } from "@/utils/universalUtils/windowMW";

const Volunteering = () => {
  const dispatch = useDispatch();
  const params = useParams();
  const { studentId } = params;
  const [localVolunteerings, setLocalVolunteerings] = useState([]);

  // Pull from store and seed local state
  const selectedStudent = useSelector(
    (state) => state.singleStudentDetails.singleStudent.value
  );

  // Fetch student on mount / id change
  useEffect(() => {
    if (params.studentId && !selectedStudent?.data) {
      dispatch(getAllDetails(params.studentId));
    }
  }, [params.studentId, dispatch, selectedStudent?.data]);


  useEffect(() => {
    if (Array.isArray(selectedStudent?.data?.volunteerings)) {
      setLocalVolunteerings(selectedStudent.data.volunteerings);
    }
  }, [selectedStudent?.data?.volunteerings]);

  // Map title to kebab-case key
  const mapSectionKey = (text) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

  // Immutable update for one item
  const produceUpdatedVolunteerings = (target, status) =>
    localVolunteerings.map((item) =>
      item.volunteering === target
        ? { ...item, verificationType: status }
        : item
    );

  // Approve handler
  const handleApprove = (volunteering) => {
    const updated = produceUpdatedVolunteerings(volunteering, "approved");
    setLocalVolunteerings(updated);
    dispatch(
      updateStudent({
        aboutDetails: { _id: studentId, volunteerings: updated },
      })
    ).then(() => {
      dispatch(getAllDetails(studentId));
      const section = mapSectionKey(volunteering);
      dispatch(
        setApprovalFlag({
          type: "volunteering",
          section,
          value: true,
        })
      );
      dispatch(
        setResubmissionFlag({
          type: "volunteering",
          section,
          value: false,
        })
      );
    });
  };

  // Resubmit handler
  const handleResubmit = (volunteering) => {
    const updated = produceUpdatedVolunteerings(volunteering, "resubmission");
    setLocalVolunteerings(updated);
    dispatch(
      updateStudent({
        aboutDetails: { _id: studentId, volunteerings: updated },
      })
    ).then(() => {
      dispatch(getAllDetails(studentId));
      const section = mapSectionKey(volunteering);
      dispatch(
        setResubmissionFlag({
          type: "volunteering",
          section,
          value: true,
        })
      );
      dispatch(
        setApprovalFlag({
          type: "volunteering",
          section,
          value: false,
        })
      );
    });
  };

  return (
    <>

      <div className={education.container}>
        {localVolunteerings.length > 0 ? (
          localVolunteerings.map((item, idx) => {
            const sectionKey = mapSectionKey(item.volunteering);
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
                <div className={education.about}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "start",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    <p className={education.head}>{item.volunteering}</p>
                    <p
                      style={{
                        color:
                          item.verificationType === "approved"
                            ? "#6BA8ED"
                            : item.verificationType === "resubmission"
                              ? "orange"
                              : "gray",
                        fontWeight: "bold",
                      }}
                    >
                      {item.verificationType === "approved"
                        ? "Verified"
                        : item.verificationType === "resubmission"
                          ? "Asked for Resubmission"
                          : "Pending"}
                    </p>
                  </div>
                  <div className={education.mark}>
                    <Button
                      type="text"
                      style={{ color: "#6BA8ED" }}
                      onClick={() => handleApprove(item.volunteering)}
                      icon={<FaRegCheckCircle />}
                    >
                      Mark as Verified
                    </Button>
                    <Button
                      type="text"
                      style={{ color: "red" }}
                      onClick={() => handleResubmit(item.volunteering)}
                      icon={<IoMdCloseCircleOutline />}
                    >
                      Ask for Re-Submission
                    </Button>
                  </div>
                </div>

                <p
                  className={education.head}
                  style={{ marginBottom: "0.5rem" }}
                >
                  {item.organization && `${item.organization} | `}
                  {item.start} to {item.end}
                  {item.city && ` | Location: ${item.city}`}
                </p>
                <hr />

                <div className={education.aboutsidedata}>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: parseIfJson(item?.description),
                    }}
                  />
                </div>
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
              boxShadow: "1px 4px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <p style={{ fontWeight: "bold", fontSize: "24px", color: "red" }}>
              No Data Available!
            </p>
          </div>
        )}
      </div>
    </>

  );
};

export default Volunteering;
