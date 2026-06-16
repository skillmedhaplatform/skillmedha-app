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
import PageHeader from "@/modules/tpo/components/PageHeader";


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
      <PageHeader title="Basic Details" />

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
            <p
              style={{
                color:
                  selectedStudent?.data?.aboutVerificationType === "approved"
                    ? "green"
                    : selectedStudent?.data?.aboutVerificationType ===
                      "resubmission"
                      ? "orange"
                      : "gray",
                fontWeight: "bold",
              }}
            >
              {selectedStudent?.data?.aboutVerificationType === "approved"
                ? "Verified"
                : selectedStudent?.data?.aboutVerificationType ===
                  "resubmission"
                  ? "Asked for Resubmission"
                  : "Pending"}
            </p>
          </div>
          <div className={details.mark}>
            <Button
              type="text"
              style={{ color: "#24A058" }}
              onClick={() => approveSection("about")}
              icon={<FaRegCheckCircle />}
            >
              Mark as Verified
            </Button>
            <Button
              type="text"
              style={{ color: "red" }}
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
              <strong>{selectedStudent?.data?.details?.gender || "N/A"}</strong>
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
          <strong>{selectedStudent?.data?.details?.collegeName ?? "N/A"}</strong>
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
            <p
              style={{
                color:
                  selectedStudent?.data?.summaryVerificationType === "approved"
                    ? "green"
                    : selectedStudent?.data?.summaryVerificationType ===
                      "resubmission"
                      ? "orange"
                      : "gray",
                fontWeight: "bold",
              }}
            >
              {selectedStudent?.data?.summaryVerificationType === "approved"
                ? "Verified"
                : selectedStudent?.data?.summaryVerificationType ===
                  "resubmission"
                  ? "Asked for Resubmission"
                  : "Pending"}
            </p>
          </div>
          <div className={details.mark}>
            <Button
              type="text"
              style={{ color: "#24A058" }}
              onClick={() => approveSection("summary")}
              icon={<FaRegCheckCircle />}
            >
              Mark as Verified
            </Button>
            <Button
              type="text"
              style={{ color: "red" }}
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
            <p
              style={{
                color:
                  selectedStudent?.data?.addresses?.verificationType ===
                    "approved"
                    ? "green"
                    : selectedStudent?.data?.addresses?.verificationType ===
                      "resubmission"
                      ? "orange"
                      : "gray",
                fontWeight: "bold",
              }}
            >
              {selectedStudent?.data?.addresses?.verificationType === "approved"
                ? "Verified"
                : selectedStudent?.data?.addresses?.verificationType ===
                  "resubmission"
                  ? "Asked for Resubmission"
                  : "Pending"}
            </p>
          </div>
          <div className={details.mark}>
            <Button
              type="text"
              style={{ color: "#24A058" }}
              onClick={() => approveSection("addresses")}
              icon={<FaRegCheckCircle />}
            >
              Mark as Verified
            </Button>
            <Button
              type="text"
              style={{ color: "red" }}
              onClick={() => requestResubmission("addresses")}
              icon={<IoMdCloseCircleOutline />}
            >
              Ask for Re-Submission
            </Button>
          </div>
        </div>

        <p className={details.addressTitle}>Current Address</p>
        <div className={details.aboutsidedata}>
          <div className={details.leftSection}>
            <div className={details.detailRow}>
              <p className={details.label}>Door No :</p>
              <p className={details.value}>
                {selectedStudent?.data?.addresses?.currentAddress?.doorNo ||
                  "N/A"}
              </p>
            </div>
            <div className={details.detailRow}>
              <p className={details.label}>Landmark :</p>
              <p className={details.value}>
                {selectedStudent?.data?.addresses?.currentAddress?.landMark ||
                  "N/A"}
              </p>
            </div>
            <div className={details.detailRow}>
              <p className={details.label}>Pincode :</p>
              <p className={details.value}>
                {selectedStudent?.data?.addresses?.currentAddress?.pincode ||
                  "N/A"}
              </p>
            </div>
            <div className={details.detailRow}>
              <p className={details.label}>District :</p>
              <strong>{selectedStudent?.data?.details?.districtName || "N/A"}</strong>
            </div>
          </div>

          <div className={details.rightSection}>
            <div className={details.detailRow}>
              <p className={details.label}>Street :</p>
              <p className={details.value}>
                {selectedStudent?.data?.addresses?.currentAddress?.streetName ||
                  "N/A"}
              </p>
            </div>
            <div className={details.detailRow}>
              <p className={details.label}>Area :</p>
              <p className={details.value}>
                {selectedStudent?.data?.addresses?.currentAddress?.areaName ||
                  "N/A"}
              </p>
            </div>
            <div className={details.detailRow}>
              <p className={details.label}>City :</p>
              <strong>{selectedStudent?.data?.details?.cityName || "N/A"}</strong>
            </div>
            <div className={details.detailRow}>
              <p className={details.label}>State :</p>
              <strong>{selectedStudent?.data?.details?.stateName || "N/A"}</strong>
            </div>
          </div>
        </div>

        <p className={details.addressTitle}>Permanent Address</p>
        <div className={details.aboutsidedata}>
          <div className={details.leftSection}>
            <div className={details.detailRow}>
              <p className={details.label}>Door No :</p>
              <p className={details.value}>
                {selectedStudent?.data?.addresses?.permanentAddress?.doorNo ||
                  "N/A"}
              </p>
            </div>
            <div className={details.detailRow}>
              <p className={details.label}>Landmark :</p>
              <p className={details.value}>
                {selectedStudent?.data?.addresses?.permanentAddress?.landMark ||
                  "N/A"}
              </p>
            </div>
            <div className={details.detailRow}>
              <p className={details.label}>Pincode :</p>
              <p className={details.value}>
                {selectedStudent?.data?.addresses?.permanentAddress?.pincode ||
                  "N/A"}
              </p>
            </div>
            <div className={details.detailRow}>
              <p className={details.label}>District :</p>
              <strong>{selectedStudent?.data?.details?.districtName || "N/A"}</strong>
            </div>
          </div>

          <div className={details.rightSection}>
            <div className={details.detailRow}>
              <p className={details.label}>Street :</p>
              <p className={details.value}>
                {selectedStudent?.data?.addresses?.permanentAddress
                  ?.streetName || "N/A"}
              </p>
            </div>
            <div className={details.detailRow}>
              <p className={details.label}>Area :</p>
              <p className={details.value}>
                {selectedStudent?.data?.addresses?.permanentAddress?.areaName ||
                  "N/A"}
              </p>
            </div>
            <div className={details.detailRow}>
              <p className={details.label}>City :</p>
              <strong>{selectedStudent?.data?.details?.cityName || "N/A"}</strong>
            </div>
            <div className={details.detailRow}>
              <p className={details.label}>State :</p>
              <strong>{selectedStudent?.data?.details?.stateName || "N/A"}</strong>
            </div>
          </div>
        </div>

        {/* Social Media Section */}
        <div className={details.about}>
          <div
            style={{
              display: "flex",
              justifyContent: "start",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <p className={details.head}>Social Media Profiles</p>
            <p
              style={{
                color:
                  selectedStudent?.data?.linksVerificationType === "approved"
                    ? "green"
                    : selectedStudent?.data?.linksVerificationType ===
                      "resubmission"
                      ? "orange"
                      : "gray",
                fontWeight: "bold",
              }}
            >
              {selectedStudent?.data?.linksVerificationType === "approved"
                ? "Verified"
                : selectedStudent?.data?.linksVerificationType ===
                  "resubmission"
                  ? "Asked for Resubmission"
                  : "Pending"}
            </p>
          </div>
          <div className={details.mark}>
            <Button
              type="text"
              style={{ color: "#24A058" }}
              onClick={() => approveSection("links")}
              icon={<FaRegCheckCircle />}
            >
              Mark as Verified
            </Button>
            <Button
              type="text"
              style={{ color: "red" }}
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
