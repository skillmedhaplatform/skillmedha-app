"use client";
import React, { useEffect } from "react";
import StudentData from "../page";
import details from "./details.module.scss";
import { useParams, usePathname } from "next/navigation";
import { Select } from "antd";
import { Button } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { FaRegCheckCircle } from "react-icons/fa";

const Basic = () => {
  const dispatch = useDispatch();
  const params = useParams();

  const selectedStudent = useSelector(
    (state) => state.user.singleStudent?.value?.data?.student
  );

  return (
    <StudentData>
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
                  selectedStudent?.aboutVerificationType === "approved"
                    ? "green"
                    : selectedStudent?.aboutVerificationType === "resubmission"
                    ? "orange"
                    : "gray",
                fontWeight: "bold",
              }}
            >
              {selectedStudent?.aboutVerificationType === "approved"
                ? "Verified"
                : selectedStudent?.aboutVerificationType === "resubmission"
                ? "Asked for Resubmission"
                : "Pending"}
            </p>
          </div>
        </div>
        <div className={details.aboutsidedata}>
          <div className={details.leftSection}>
            <div className={details.detailRow}>
              <p className={details.label}>First Name :</p>
              <p className={details.value}>
                {selectedStudent?.firstName || "N/A"}
              </p>
            </div>
            <div className={details.detailRow}>
              <p className={details.label}>Last Name(surname) :</p>
              <p className={details.value}>
                {selectedStudent?.lastName || "N/A"}
              </p>
            </div>
            <div className={details.detailRow}>
              <p className={details.label}>Gender :</p>
              <strong>{details?.gender || "N/A"}</strong>
            </div>
            <div className={details.detailRow}>
              <p className={details.label}>Alternative Phone :</p>
              <p className={details.value}>
                {selectedStudent?.alternatePhone || "N/A"}
              </p>
            </div>
          </div>

          <div className={details.rightSection}>
            <div className={details.detailRow}>
              <p className={details.label}>Middle Name :</p>
              <p className={details.value}>
                {selectedStudent?.middleName || "N/A"}
              </p>
            </div>
            <div className={details.detailRow}>
              <p className={details.label}>Date of Birth :</p>
              <p className={details.value}>{selectedStudent?.DOB || "N/A"}</p>
            </div>
            <div className={details.detailRow}>
              <p className={details.label}>Phone :</p>
              <p className={details.value}>
                +91 {selectedStudent?.phone || "N/A"}
              </p>
            </div>
            <div className={details.detailRow}>
              <p className={details.label}>Email :</p>
              <p className={details.value}>{selectedStudent?.email || "N/A"}</p>
            </div>
          </div>
        </div>

        <div className={details.collegeRow}>
          <p className={details.collegeLabel}>Current/Latest College :</p>
          <strong>{details?.collegeName ?? "N/A"}</strong>
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
                  selectedStudent?.summaryVerificationType === "approved"
                    ? "green"
                    : selectedStudent?.summaryVerificationType ===
                      "resubmission"
                    ? "orange"
                    : "gray",
                fontWeight: "bold",
              }}
            >
              {selectedStudent?.summaryVerificationType === "approved"
                ? "Verified"
                : selectedStudent?.summaryVerificationType === "resubmission"
                ? "Asked for Resubmission"
                : "Pending"}
            </p>
          </div>
        </div>
        <p className={details.summaryText}>
          {selectedStudent?.professionalSummary || "N/A"}
        </p>

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
                  selectedStudent?.addresses?.verificationType === "approved"
                    ? "green"
                    : selectedStudent?.addresses?.verificationType ===
                      "resubmission"
                    ? "orange"
                    : "gray",
                fontWeight: "bold",
              }}
            >
              {selectedStudent?.addresses?.verificationType === "approved"
                ? "Verified"
                : selectedStudent?.addresses?.verificationType ===
                  "resubmission"
                ? "Asked for Resubmission"
                : "Pending"}
            </p>
          </div>
        </div>

        <p className={details.addressTitle}>Current Address</p>
        <div className={details.aboutsidedata}>
          <div className={details.leftSection}>
            <div className={details.detailRow}>
              <p className={details.label}>Door No :</p>
              <p className={details.value}>
                {selectedStudent?.addresses?.currentAddress?.doorNo || "N/A"}
              </p>
            </div>
            <div className={details.detailRow}>
              <p className={details.label}>Landmark :</p>
              <p className={details.value}>
                {selectedStudent?.addresses?.currentAddress?.landMark || "N/A"}
              </p>
            </div>
            <div className={details.detailRow}>
              <p className={details.label}>Pincode :</p>
              <p className={details.value}>
                {selectedStudent?.addresses?.currentAddress?.pincode || "N/A"}
              </p>
            </div>
            <div className={details.detailRow}>
              <p className={details.label}>District :</p>
              <strong>{details?.districtName || "N/A"}</strong>
            </div>
          </div>

          <div className={details.rightSection}>
            <div className={details.detailRow}>
              <p className={details.label}>Street :</p>
              <p className={details.value}>
                {selectedStudent?.addresses?.currentAddress?.streetName ||
                  "N/A"}
              </p>
            </div>
            <div className={details.detailRow}>
              <p className={details.label}>Area :</p>
              <p className={details.value}>
                {selectedStudent?.addresses?.currentAddress?.areaName || "N/A"}
              </p>
            </div>
            <div className={details.detailRow}>
              <p className={details.label}>City :</p>
              <strong>{selectedStudent?.cityName || "N/A"}</strong>
            </div>
            <div className={details.detailRow}>
              <p className={details.label}>State :</p>
              <strong>{selectedStudent?.stateName || "N/A"}</strong>
            </div>
          </div>
        </div>

        <p className={details.addressTitle}>Permanent Address</p>
        <div className={details.aboutsidedata}>
          <div className={details.leftSection}>
            <div className={details.detailRow}>
              <p className={details.label}>Door No :</p>
              <p className={details.value}>
                {selectedStudent?.addresses?.permanentAddress?.doorNo || "N/A"}
              </p>
            </div>
            <div className={details.detailRow}>
              <p className={details.label}>Landmark :</p>
              <p className={details.value}>
                {selectedStudent?.addresses?.permanentAddress?.landMark ||
                  "N/A"}
              </p>
            </div>
            <div className={details.detailRow}>
              <p className={details.label}>Pincode :</p>
              <p className={details.value}>
                {selectedStudent?.addresses?.permanentAddress?.pincode || "N/A"}
              </p>
            </div>
            <div className={details.detailRow}>
              <p className={details.label}>District :</p>
              <strong>{details?.districtName || "N/A"}</strong>
            </div>
          </div>

          <div className={details.rightSection}>
            <div className={details.detailRow}>
              <p className={details.label}>Street :</p>
              <p className={details.value}>
                {selectedStudent?.addresses?.permanentAddress?.streetName ||
                  "N/A"}
              </p>
            </div>
            <div className={details.detailRow}>
              <p className={details.label}>Area :</p>
              <p className={details.value}>
                {selectedStudent?.addresses?.permanentAddress?.areaName ||
                  "N/A"}
              </p>
            </div>
            <div className={details.detailRow}>
              <p className={details.label}>City :</p>
              <strong>{details?.cityName || "N/A"}</strong>
            </div>
            <div className={details.detailRow}>
              <p className={details.label}>State :</p>
              <strong>{details?.stateName || "N/A"}</strong>
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
                  selectedStudent?.linksVerificationType === "approved"
                    ? "green"
                    : selectedStudent?.linksVerificationType === "resubmission"
                    ? "orange"
                    : "gray",
                fontWeight: "bold",
              }}
            >
              {selectedStudent?.linksVerificationType === "approved"
                ? "Verified"
                : selectedStudent?.linksVerificationType === "resubmission"
                ? "Asked for Resubmission"
                : "Pending"}
            </p>
          </div>
        </div>

        <div className={details.aboutsidedata}>
          {selectedStudent?.links?.length > 0 ? (
            selectedStudent?.links?.map((item, index) => (
              <React.Fragment key={index}>
                <div className={details.leftSection}>
                  <div className={details.detailRow}>
                    <p className={details.label}>Platform :</p>
                    <p className={details.value}>{item?.platform || "N/A"}</p>
                  </div>
                </div>
                <div className={details.rightSection}>
                  <div className={details.detailRow}>
                    <p className={details.label}>Url :</p>
                    <p className={details.value}>{item?.value || "N/A"}</p>
                  </div>
                </div>
              </React.Fragment>
            ))
          ) : (
            <p style={{ color: "red", fontWeight: "bold" }}>
              No data available!
            </p>
          )}
        </div>
      </div>
    </StudentData>
  );
};

export default Basic;
