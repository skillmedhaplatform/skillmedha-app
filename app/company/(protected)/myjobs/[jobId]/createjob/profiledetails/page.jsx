"use client";
import React, { useEffect, useState } from "react";
import styles from "./profiledetails.module.scss";
import { FiPlusCircle } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import { UpdateJob } from "@/redux/slices/company/placementsSlice";
import { getLstorage, getSstorage } from "@/utils/universalUtils/windowMW";
import { message } from "antd";

export default function ProfileDetailsPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { jobId: jobid } = useParams();
  const [suplementalArray, setIsSuplementalArray] = useState([
    "Quarterly bonus",
    "Shift allowance",
    "Cell phone reimbursement",
    "Joining bonus",
    "Flexible schedule",
    "Yearly bonus",
    "Commission pay",
    "Overtime pay",
    "Health insurance",
    "Provident Fund",
    "Performance bonus",
    "Internet reimbursement",
    "Work from home",
    "Commuter assistance",
    "Paid sick time",
    "Paid time off",
    "Food provided",
    "Life insurance",
    "Leave encashment",
  ]);
  const [newSupplemental, setNewSupplemental] = useState("");
  const [profileDetails, setprofileDetails] = useState({});
  const SessionJobid = getSstorage("jobid");
  const baseUrl = `/company/myjobs/${jobid}/createjob/interviewprocess`;

  const { value: ONEJOB, status } = useSelector(
    (state) => state.placement.OneJob
  );
  useEffect(() => {
    if (ONEJOB?.data) {
      setprofileDetails({
        ...ONEJOB?.data,
      });
    } else {
      setprofileDetails({});
    }
  }, [ONEJOB?.data]);

  const handleInputChange = (key, value) => {
    setprofileDetails((prev) => ({ ...prev, [key]: value }));
  };

  function handleAddSuplemental() {
    const trimmed = newSupplemental.trim();
    if (trimmed && !suplementalArray.includes(trimmed)) {
      setIsSuplementalArray([...suplementalArray, trimmed]);
      setNewSupplemental("");
    }
  }

  const handleToggleSupplemental = (item) => {
    setprofileDetails((prev) => {
      const current = prev?.supplementalPay || [];
      const isSelected = current.includes(item);
      return {
        ...prev,
        supplementalPay: isSelected
          ? current.filter((i) => i !== item)
          : [...current, item],
      };
    });
  };

  function getUpdatedFields(original, updated) {
    const changes = {};
    for (const key in updated) {
      if (
        typeof updated[key] === "object" &&
        Array.isArray(updated[key]) &&
        JSON.stringify(original[key] || []) !== JSON.stringify(updated[key])
      ) {
        changes[key] = updated[key];
      } else if (updated[key] !== original[key]) {
        changes[key] = updated[key];
      }
    }
    return changes;
  }

  async function handleSave() {
    const updatedFields = getUpdatedFields(ONEJOB?.data || {}, profileDetails);

    if (Object.keys(updatedFields).length === 0) {
      message.info("No changes to update.");
      router.push(baseUrl);
      return;
    }
    await dispatch(
      UpdateJob({
        dispatch,
        payload: updatedFields,
        jobid,
      })
    );
    router.push(baseUrl);
  }
  return (
    <div className={styles.mainCont}>
      <div className={styles.fieldCont}>
        <label>Job Type</label>
        <input
          type="text"
          placeholder="On site"
          value={profileDetails.jobType || ""}
          onChange={(e) => handleInputChange("jobType", e.target.value)}
        />
      </div>
      <div className={styles.fieldCont}>
        <label>Job Location</label>
        <div className={styles.inpuCont}>
          {/* <input
            type="text"
            placeholder="Country"
            value={profileDetails.country || ""}
            onChange={(e) => handleInputChange("country", e.target.value)}
          /> */}
          <input
            type="text"
            placeholder="City"
            value={profileDetails.city || ""}
            onChange={(e) => handleInputChange("city", e.target.value)}
          />
          {/* <input
            type="number"
            placeholder="Zip Code"
            value={profileDetails.zip || ""}
            onChange={(e) => handleInputChange("zip", e.target.value)}
          /> */}
          {/* <input
            type="text"
            placeholder="Area"
            value={profileDetails.area || ""}
            onChange={(e) => handleInputChange("area", e.target.value)}
          /> */}
        </div>
      </div>
      <div className={styles.fieldCont}>
        <label>Street Address</label>
        <input
          type="text"
          placeholder="Street address"
          value={profileDetails.street || ""}
          onChange={(e) => handleInputChange("street", e.target.value)}
        />
      </div>
      <div className={styles.fieldCont}>
        <label>Sector</label>
        <input
          type="text"
          placeholder="E-Commerce"
          value={profileDetails.sector || ""}
          onChange={(e) => handleInputChange("sector", e.target.value)}
        />
      </div>
      <div className={styles.fieldCont}>
        <label>CTC</label>
        <div className={styles.inpuCont}>
          <input
            type="number"
            min="0"
            max="999"
            placeholder="12"
            style={{ width: "30%", flex: 2 }}
            value={profileDetails.ctc || ""}
            maxLength={4}
            onChange={(e) => {
              let val = e.target.value;
              if (parseInt(val) > 999) val = 999;
              handleInputChange("ctc", val);
            }}
          />
          <p>In lakhs / annum</p>
        </div>
      </div>
      <div className={styles.fieldCont}>
        <label>Job Descriptions</label>
        <textarea
          className={styles.textarea}
          value={profileDetails.jobDescription || ""}
          onChange={(e) => handleInputChange("jobDescription", e.target.value)}
        />
      </div>
      <div className={styles.fieldCont}>
        <label>Supplemental Pay</label>
        <div className={styles.inpuContbtn}>
          <div className={styles.btnsCont}>
            {suplementalArray?.map((e, index) => {
              const isSelected = profileDetails?.supplementalPay?.includes(e);
              return (
                <button
                  key={index}
                  className={`${styles.button} ${
                    isSelected ? styles.selected : ""
                  }`}
                  onClick={() => handleToggleSupplemental(e)}
                >
                  {e}
                  <FiPlusCircle
                    style={{
                      fontSize: "18px",
                      color: isSelected ? "#fff" : "#25a3a6",
                      transform: isSelected ? "rotate(45deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                      marginLeft: "8px",
                    }}
                  />
                </button>
              );
            })}
          </div>
          <input
            type="text"
            placeholder="Others"
            value={newSupplemental}
            onChange={(e) => setNewSupplemental(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddSuplemental();
              }
            }}
          />
        </div>
      </div>

      <button
        className={styles.saveBtn}
        onClick={handleSave}
        disabled={status == "loading"}
      >
        {ONEJOB?.data?._id ? "Update" : "Save"}
      </button>
    </div>
  );
}
