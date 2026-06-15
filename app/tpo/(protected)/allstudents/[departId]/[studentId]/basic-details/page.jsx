"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import btn from "@/public/tpo/btn.svg";
import details from "./details.module.scss";
import { useParams, usePathname } from "next/navigation";
import right from "@/public/tpo/markdone.svg";
import wrong from "@/public/tpo/marknot.svg";
import { Select } from "antd";
import { Button } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { getAllDetails } from "@/redux/slices/tpo/getAllDetailsSlice";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { updateStudent } from "@/redux/slices/tpo/getAllStudentsSlice";
import { FaRegCheckCircle } from "react-icons/fa";
import { parseIfJson } from "@/utils/universalUtils/windowMW";


const Basic = () => {
  const dispatch = useDispatch();
  const params = useParams();
  const { Option } = Select;
  const { studentId } = params;
  const { value: selectedStudent } = useSelector(
    (state) => state.singleStudentDetails.singleStudent
  );
  useEffect(() => {
    if (params.studentId && !selectedStudent?.data) {
      dispatch(getAllDetails(params.studentId));
    }
  }, [params.studentId, dispatch, selectedStudent?.data]);

  const requestResubmission = (type) => {
    let aboutDetails = { _id: studentId };

    switch (type) {
      case "addresses":
        aboutDetails.addresses = {
          ...selectedStudent?.data?.addresses,
          verificationType: "resubmission",
        };
        break;

      case "summary":
        aboutDetails.summaryVerificationType = "resubmission";
        break;

      case "about":
        aboutDetails.aboutVerificationType = "resubmission";
        break;

      case "links":
        aboutDetails.linksVerificationType = "resubmission";
        break;

      default:
        console.warn(`Unknown resubmission type: ${type}`);
        return;
    }
    dispatch(updateStudent({ dispatch, aboutDetails }));
  };

  // On clicking approve
  const approveSection = (type) => {
    let aboutDetails = { _id: studentId };

    switch (type) {
      case "addresses":
        aboutDetails.addresses = {
          ...selectedStudent?.data?.addresses,
          verificationType: "approved",
        };
        break;

      case "summary":
        aboutDetails.summaryVerificationType = "approved";
        break;

      case "about":
        aboutDetails.aboutVerificationType = "approved";
        break;

      case "links":
        aboutDetails.linksVerificationType = "approved";
        break;

      default:
        console.warn(`Unknown approved type: ${type}`);
        return;
    }

    dispatch(updateStudent({ dispatch, aboutDetails }));
  };

  return (
    <>

      <div className={details.container}>
        {/* About Section */}
        <div className={details.about}>
          <div
            style={{
              display: "flex",
              justifyContent: "start",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <p className={details.head}>About</p>
            <div
              style={{
                backgroundColor: selectedStudent?.data?.aboutVerificationType === "approved" ? "#e6f4ea" : selectedStudent?.data?.aboutVerificationType === "resubmission" ? "#fef0db" : "#f3f4f6",
                color: selectedStudent?.data?.aboutVerificationType === "approved" ? "#1e8e3e" : selectedStudent?.data?.aboutVerificationType === "resubmission" ? "#e67c00" : "#6b7280",
                padding: "4px 12px",
                borderRadius: "16px",
                fontSize: "12px",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              {selectedStudent?.data?.aboutVerificationType === "approved" && <FaRegCheckCircle />}
              {selectedStudent?.data?.aboutVerificationType === "approved"
                ? "Verified"
                : selectedStudent?.data?.aboutVerificationType === "resubmission"
                ? "Asked for Resubmission"
                : "Pending"}
            </div>
          </div>
          <div className={details.mark}>
            <Button
              type="default"
              style={{
                backgroundColor: "#f4f8fb",
                borderColor: "#6BA8ED",
                color: "#6BA8ED",
                fontWeight: 600,
                borderRadius: "8px",
                boxShadow: "none"
              }}
              onClick={() => approveSection("about")}
              icon={<FaRegCheckCircle />}
            >
              Mark as Verified
            </Button>
            <Button
              type="default"
              style={{
                backgroundColor: "#feeceb",
                borderColor: "#fcb6b6",
                color: "#e53e3e",
                fontWeight: 600,
                borderRadius: "8px",
                boxShadow: "none"
              }}
              onClick={() => requestResubmission("about")}
              icon={<IoMdCloseCircleOutline />}
            >
              Ask for Re-Submission
            </Button>
          </div>
        </div>

        <div className={details.aboutsidedata}>
          <div className={details.leftSection}>
            <div className={details.detailRow}>
              <p className={details.label}>First Name :</p>
              <p className={details.value}>
                {selectedStudent?.data?.firstName || "N/A"}
              </p>
            </div>
            <div className={details.detailRow}>
              <p className={details.label}>Last Name(surname) :</p>
              <p className={details.value}>
                {selectedStudent?.data?.lastName || "N/A"}
              </p>
            </div>
            <div className={details.detailRow}>
              <p className={details.label}>Gender :</p>
              <p className={details.value}>{selectedStudent?.data?.details?.gender || "N/A"}</p>
            </div>
            <div className={details.detailRow}>
              <p className={details.label}>Alternative Phone :</p>
              <p className={details.value}>
                {selectedStudent?.data?.alternatePhone || "N/A"}
              </p>
            </div>
          </div>

          <div className={details.rightSection}>
            <div className={details.detailRow}>
              <p className={details.label}>Middle Name :</p>
              <p className={details.value}>
                {selectedStudent?.data?.middleName || "N/A"}
              </p>
            </div>
            <div className={details.detailRow}>
              <p className={details.label}>Date of Birth :</p>
              <p className={details.value}>
                {selectedStudent?.data?.DOB || "N/A"}
              </p>
            </div>
            <div className={details.detailRow}>
              <p className={details.label}>Phone :</p>
              <p className={details.value}>
                +91 {selectedStudent?.data?.phone || "N/A"}
              </p>
            </div>
            <div className={details.detailRow}>
              <p className={details.label}>Email :</p>
              <p className={details.value}>
                {selectedStudent?.data?.email || "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className={details.collegeRow}>
          <p className={details.collegeLabel}>Current/Latest College :</p>
          <p className={details.value}>{selectedStudent?.data?.details?.collegeName ?? "N/A"}</p>
        </div>

        <div className={details.regNumberRow}>
          <p className={details.regLabel}>Registration Number :</p>
          <p className={details.regValue}>HGFXDCVBJHU</p>
        </div>

        {/* Summary Section */}
        <div className={details.about}>
          <div
            style={{
              display: "flex",
              justifyContent: "start",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <p className={details.head}>Summary</p>
            <div
              style={{
                backgroundColor: selectedStudent?.data?.summaryVerificationType === "approved" ? "#e6f4ea" : selectedStudent?.data?.summaryVerificationType === "resubmission" ? "#fef0db" : "#f3f4f6",
                color: selectedStudent?.data?.summaryVerificationType === "approved" ? "#1e8e3e" : selectedStudent?.data?.summaryVerificationType === "resubmission" ? "#e67c00" : "#6b7280",
                padding: "4px 12px",
                borderRadius: "16px",
                fontSize: "12px",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              {selectedStudent?.data?.summaryVerificationType === "approved" && <FaRegCheckCircle />}
              {selectedStudent?.data?.summaryVerificationType === "approved"
                ? "Verified"
                : selectedStudent?.data?.summaryVerificationType === "resubmission"
                ? "Asked for Resubmission"
                : "Pending"}
            </div>
          </div>
          <div className={details.mark}>
            <Button
              type="default"
              style={{
                backgroundColor: "#f4f8fb",
                borderColor: "#6BA8ED",
                color: "#6BA8ED",
                fontWeight: 600,
                borderRadius: "8px",
                boxShadow: "none"
              }}
              onClick={() => approveSection("summary")}
              icon={<FaRegCheckCircle />}
            >
              Mark as Verified
            </Button>
            <Button
              type="default"
              style={{
                backgroundColor: "#feeceb",
                borderColor: "#fcb6b6",
                color: "#e53e3e",
                fontWeight: 600,
                borderRadius: "8px",
                boxShadow: "none"
              }}
              onClick={() => requestResubmission("summary")}
              icon={<IoMdCloseCircleOutline />}
            >
              Ask for Re-Submission
            </Button>
          </div>
        </div>
        <div
          className={details.summaryText}
          dangerouslySetInnerHTML={{
            __html: parseIfJson(selectedStudent?.data?.professionalSummary),
          }}
        />

        {/* Address Section */}
        <div className={details.about}>
          <div
            style={{
              display: "flex",
              justifyContent: "start",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <p className={details.head}>Address</p>
            <div
              style={{
                backgroundColor: selectedStudent?.data?.linksVerificationType === "approved" ? "#e6f4ea" : selectedStudent?.data?.linksVerificationType === "resubmission" ? "#fef0db" : "#f3f4f6",
                color: selectedStudent?.data?.linksVerificationType === "approved" ? "#1e8e3e" : selectedStudent?.data?.linksVerificationType === "resubmission" ? "#e67c00" : "#6b7280",
                padding: "4px 12px",
                borderRadius: "16px",
                fontSize: "12px",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              {selectedStudent?.data?.linksVerificationType === "approved" && <FaRegCheckCircle />}
              {selectedStudent?.data?.linksVerificationType === "approved"
                ? "Verified"
                : selectedStudent?.data?.linksVerificationType === "resubmission"
                ? "Asked for Resubmission"
                : "Pending"}
            </div>
          </div>
          <div className={details.mark}>
            <Button
              type="default"
              style={{
                backgroundColor: "#f4f8fb",
                borderColor: "#6BA8ED",
                color: "#6BA8ED",
                fontWeight: 600,
                borderRadius: "8px",
                boxShadow: "none"
              }}
              onClick={() => approveSection("links")}
              icon={<FaRegCheckCircle />}
            >
              Mark as Verified
            </Button>
            <Button
              type="default"
              style={{
                backgroundColor: "#feeceb",
                borderColor: "#fcb6b6",
                color: "#e53e3e",
                fontWeight: 600,
                borderRadius: "8px",
                boxShadow: "none"
              }}
              onClick={() => requestResubmission("links")}
              icon={<IoMdCloseCircleOutline />}
            >
              Ask for Re-Submission
            </Button>
          </div>
        </div>

        <div
          className={details.aboutsidedata}
          style={{ flexDirection: "column" }}
        >
          {selectedStudent?.data?.links?.length > 0 ? (
            selectedStudent?.data?.links?.map((item, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <div className={details.leftSection}>
                  <div className={details.detailRow}>
                    <p className={details.label}>Platform :</p>
                    <p className={details.value}>{item?.title || "N/A"}</p>
                  </div>
                </div>
                <div className={details.rightSection}>
                  <div className={details.detailRow}>
                    <p className={details.label}>Url :</p>
                    <a
                      className={details.value}
                      href={item?.link || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item?.link || "N/A"}
                    </a>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: "red", fontWeight: "bold" }}>
              No data available!
            </p>
          )}
        </div>
      </div>
    </>

  );
};

export default Basic;
