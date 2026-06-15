"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import btn from "@/public/tpo/btn.svg";
import right from "@/public/tpo/markdone.svg";
import wrong from "@/public/tpo/marknot.svg";
import Link from "next/link";
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
import { FaRegCheckCircle } from "react-icons/fa";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { parseIfJson } from "@/utils/universalUtils/windowMW";

const Projects = () => {
  const dispatch = useDispatch();
  const params = useParams();
  const [localProjects, setLocalProjects] = useState([]);
  const { studentId } = params;

  // Seed local state from store
  const selectedStudent = useSelector(
    (state) => state.singleStudentDetails.singleStudent.value
  );

  // Fetch on mount / studentId change
  useEffect(() => {
    if (params.studentId && !selectedStudent?.data) {
      dispatch(getAllDetails(params.studentId));
    }
  }, [params.studentId, dispatch, selectedStudent?.data]);

  useEffect(() => {
    if (Array.isArray(selectedStudent?.data?.projects)) {
      setLocalProjects(selectedStudent.data.projects);
    }
  }, [selectedStudent?.data?.projects]);

  // Helpers
  const mapSectionKey = (title = "") =>
    title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

  const produceUpdatedProjects = (target, status) =>
    localProjects.map((item) =>
      item.project === target ? { ...item, verificationType: status } : item
    );

  // Approve handler
  const handleApprove = (projectName) => {
    const updated = produceUpdatedProjects(projectName, "approved");
    setLocalProjects(updated);
    console.log(updated);
    dispatch(
      updateStudent({
        aboutDetails: { _id: studentId, projects: updated },
      })
    ).then(() => {
      dispatch(getAllDetails(studentId));
      const section = mapSectionKey(projectName);
      dispatch(
        setApprovalFlag({
          type: "projects",
          section,
          value: true,
        })
      );
      dispatch(
        setResubmissionFlag({
          type: "projects",
          section,
          value: false,
        })
      );
    });
  };

  // Resubmit handler
  const handleResubmit = (projectName) => {
    const updated = produceUpdatedProjects(projectName, "resubmission");
    setLocalProjects(updated);
    dispatch(
      updateStudent({
        aboutDetails: { _id: studentId, projects: updated },
      })
    ).then(() => {
      dispatch(getAllDetails(studentId));
      const section = mapSectionKey(projectName);
      dispatch(
        setResubmissionFlag({
          type: "projects",
          section,
          value: true,
        })
      );
      dispatch(
        setApprovalFlag({
          type: "projects",
          section,
          value: false,
        })
      );
    });
  };

  return (
    <>

      <div className={education.container}>
        {localProjects.length > 0 ? (
          localProjects.map((item, idx) => {
            const projectName = item?.project;
            const status = item?.verificationType;
            const section = mapSectionKey(projectName);

            return (
              <div
                key={idx}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "10px",
                  padding: "1.7rem",
                  marginTop: "1rem",
                  boxShadow: "1px 4px 8px rgba(0, 0, 0, 0.1)",
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
                    <p className={education.head}>{projectName}</p>
                    <p
                      style={{
                        color:
                          status === "approved"
                            ? "#6BA8ED"
                            : status === "resubmission"
                              ? "orange"
                              : "gray",
                        fontWeight: "bold",
                      }}
                    >
                      {status === "approved"
                        ? "Verified"
                        : status === "resubmission"
                          ? "Asked for Resubmission"
                          : "Pending"}
                    </p>
                  </div>
                  <div className={education.mark}>
                    <Button
                      type="text"
                      style={{ color: "#6BA8ED" }}
                      onClick={() => projectName && handleApprove(projectName)}
                      icon={<FaRegCheckCircle />}
                    >
                      Mark as Verified
                    </Button>
                    <Button
                      type="text"
                      style={{ color: "red" }}
                      onClick={() => projectName && handleResubmit(projectName)}
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
                  {item?.company && `${item.company} | `}
                  {item?.start && `${item.start}`} to{" "}
                  {item?.end && `${item.end}`}
                  {item?.city && ` | Location: ${item.city}`}
                </p>
                <hr />

                <div className={education.aboutsidedata}>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: parseIfJson(item?.description),
                    }}
                  />
                </div>

                {/* <Link href={item?.documents?.length ? "#" : "#"}>
                  <p style={{ textAlign: "center", fontSize: "14px" }}>
                    {item?.documents?.length
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

export default Projects;
