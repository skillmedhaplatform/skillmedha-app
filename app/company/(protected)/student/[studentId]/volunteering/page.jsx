"use client";
import React from "react";
import StudentData from "../page";
import education from "./intern.module.scss";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";

const Volunteering = () => {
  const params = useParams();
  const { studentId } = params;

  const selectedStudent = useSelector(
    (state) => state.user.singleStudent?.value?.data?.student
  );

  return (
    <StudentData>
      <div className={education.container}>
        {selectedStudent?.volunteerings?.length > 0 ? (
          selectedStudent.volunteerings.map((item, idx) => {
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
                    <p style={{ fontWeight: "800", fontSize: "18px" }}>
                      {item.volunteering}
                    </p>
                    <p
                      style={{
                        color:
                          item.verificationType === "approved"
                            ? "green"
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
                  <p>{item.description}</p>
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
    </StudentData>
  );
};

export default Volunteering;
