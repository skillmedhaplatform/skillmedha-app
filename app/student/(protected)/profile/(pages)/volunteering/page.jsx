"use client";
import React, { useState, useEffect } from "react";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";
import formStyles from "../../form.module.scss";
import { Button, Input, DatePicker, Row, Col, message, Popconfirm } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
// REPLACED moment with dayjs
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

import { updateStudent } from "@/redux/slices/student";
import { useDispatch, useSelector } from "react-redux";

// Month format for storage and parsing
const monthFormat = "MM/YYYY";

const initialVolunteering = {
  organization: "",
  volunteering: "",
  start: null,
  end: null,
  city: "",
  description: "",
  status: "warning",
  editing: true,
};

export default function WorkAndVolunteeringPage() {
  const dispatch = useDispatch();
  const studentDetails = useSelector((state) => state.student.student?.data);
  const [volunteerings, setVolunteerings] = useState([]);

  // Load existing or default
  useEffect(() => {
    if (Array.isArray(studentDetails?.volunteerings) && studentDetails.volunteerings.length > 0) {
      setVolunteerings(
        studentDetails.volunteerings.map((item) => ({
          ...initialVolunteering,
          ...item,
          editing: false,
          status: "success",
        }))
      );
    } else {
      setVolunteerings([{ ...initialVolunteering }]);
    }
  }, [studentDetails]);

  // Disable months after the current month (reference style)
  const disabledFutureMonth = (current) =>
    current && current.isAfter(dayjs(), "month");

  const updateField = (idx, field, value) =>
    setVolunteerings((prev) => {
      const arr = [...prev];
      arr[idx] = { ...arr[idx], [field]: value };
      return arr;
    });

  const addVolunteering = () =>
    setVolunteerings((prev) => [...prev, { ...initialVolunteering }]);

  const saveVolunteering = (idx) => {
    const item = volunteerings[idx];
    if (!item.organization || !item.volunteering || !item.start || !item.end) {
      message.error(
        "Please fill Organization, Volunteering, Start Date, and End Date before saving"
      );
      return;
    }
    if (item.end && item.end <= item.start) {
      message.error(
        "Please fill Organization, Volunteering, Start Date, and End Date before saving"
      );
      return false;
    }
    const updatedVolunteerings = volunteerings.map((v, i) => {
      if (i === idx) {
        return { ...v, editing: false, status: "pending" };
      }
      return v;
    });

    setVolunteerings(updatedVolunteerings);
    dispatch(
      updateStudent({
        dispatch,
        aboutDetails: { volunteerings: updatedVolunteerings },
      })
    );
  };

  const deleteVoluntering = (idx) => {
    setVolunteerings((prev) => {
      const updated = prev.filter((_, i) => i !== idx);

      dispatch(
        updateStudent({
          dispatch,
          aboutDetails: { volunteerings: updated },
        })
      );

      return updated;
    });
  };

  const getSafeDescription = (desc = "", maxLength = 400) => {
    if (!desc) return "";
    return desc.length > maxLength
      ? desc.substring(0, maxLength) + "..."
      : desc;
  };

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header Card matching TPO */}
      <div className={formStyles.formContainer} style={{ padding: "1.5rem 2rem", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <div className={formStyles.headerLeft}>
          <h1 className={formStyles.formTitle}>Volunteering</h1>
          <p className={formStyles.formSubtitle}>Update your voluntary experience and community work below</p>
        </div>
      </div>

      {volunteerings.map((item, idx) => (
        <div key={idx} className={formStyles.formContainer} style={{ marginBottom: "1.5rem" }}>
          {/* Header */}
          <div className={formStyles.headertitleCont} style={{ borderBottom: "none", marginBottom: "1rem" }}>
            <div className={formStyles.headerLeft}>
              <h3 className={formStyles.formTitle} style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <span>{item.volunteering || "New Volunteering"}</span>
                {item?.verificationType === "approved" ? (
                  <span className="text-sm font-semibold text-green-500">Verified</span>
                ) : item?.verificationType === "resubmission" ? (
                  <span className="text-sm font-semibold text-red-500">Re-Submit</span>
                ) : (
                  <span className="text-sm font-semibold text-[#ffc400]">Not Verified</span>
                )}
              </h3>
            </div>
            <div className={formStyles.editButtonContainer} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {!item.editing && (
                <Button
                  onClick={() => updateField(idx, "editing", true)}
                  className="!bg-gradient-to-br !from-[#1E69DA] !to-[#5694F0] !border-none !text-white hover:opacity-90"
                  style={{ fontWeight: "600", borderRadius: "8px" }}
                >
                  Edit
                </Button>
              )}
              {volunteerings.length > 1 && (
                <Popconfirm
                  title="Delete this Volunteering?"
                  description="This action cannot be undone."
                  okText="Delete"
                  cancelText="Cancel"
                  okButtonProps={{ danger: true }}
                  placement="left"
                  onConfirm={() => deleteVoluntering(idx)}
                >
                  <Button danger style={{ borderRadius: "8px", fontWeight: "600" }}>
                    Delete
                  </Button>
                </Popconfirm>
              )}
            </div>
          </div>

          {/* Form or Display */}
          {item.editing ? (
            <div className={formStyles.dynamicFormContainer} style={{ paddingTop: 0 }}>
              {/* Organization */}
              <div className={formStyles.formField}>
                <label>Organization Name*</label>
                <input
                  type="text"
                  className={formStyles.inputField}
                  value={item.organization}
                  placeholder="Organization name"
                  onChange={(e) => updateField(idx, "organization", e.target.value)}
                />
              </div>

              {/* Volunteering Role */}
              <div className={formStyles.formField}>
                <label>Volunteering Role*</label>
                <input
                  type="text"
                  className={formStyles.inputField}
                  value={item.volunteering}
                  placeholder="Describe your role"
                  onChange={(e) => updateField(idx, "volunteering", e.target.value)}
                />
              </div>

              {/* Start Date */}
              <div className={formStyles.formField}>
                <label>Start Date*</label>
                <DatePicker
                  className={formStyles.selectField}
                  picker="month"
                  format={monthFormat}
                  value={item.start ? dayjs(item.start, monthFormat) : null}
                  onChange={(date) =>
                    updateField(idx, "start", date ? date.format(monthFormat) : null)
                  }
                  disabledDate={disabledFutureMonth}
                  style={{ width: "100%" }}
                />
              </div>

              {/* End Date */}
              <div className={formStyles.formField}>
                <label>End Date*</label>
                <DatePicker
                  className={formStyles.selectField}
                  picker="month"
                  format={monthFormat}
                  value={item.end ? dayjs(item.end, monthFormat) : null}
                  onChange={(date) =>
                    updateField(idx, "end", date ? date.format(monthFormat) : null)
                  }
                  disabledDate={disabledFutureMonth}
                  style={{ width: "100%" }}
                />
              </div>

              {/* City */}
              <div className={formStyles.formField}>
                <label>City</label>
                <input
                  type="text"
                  className={formStyles.inputField}
                  value={item.city}
                  placeholder="City"
                  onChange={(e) => updateField(idx, "city", e.target.value)}
                />
              </div>

              {/* Description */}
              <div className={formStyles.fullWidthField}>
                <div className={formStyles.formField}>
                  <label>Description</label>
                  <textarea
                    className={formStyles.inputField}
                    style={{ minHeight: "100px", resize: "vertical" }}
                    value={item.description}
                    placeholder="Describe the volunteering in detail"
                    onChange={(e) => updateField(idx, "description", e.target.value)}
                  />
                </div>
              </div>

              <div className={formStyles.fullWidthField} style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem", borderTop: "1px solid #e2e8f0", paddingTop: "1rem" }}>
                <Button
                  type="primary"
                  onClick={() => saveVolunteering(idx)}
                  className="!bg-gradient-to-br !from-[#1E69DA] !to-[#5694F0] !border-none !text-white hover:opacity-90"
                  style={{ fontWeight: "600", borderRadius: "8px", padding: "6px 20px" }}
                >
                  Save volunteering
                </Button>
              </div>
            </div>
          ) : (
            <div className={formStyles.dynamicFormContainer} style={{ padding: 0 }}>
              <div className={formStyles.formField}>
                <label>Organization</label>
                <div className={formStyles.inputField} style={{ background: "#eef5fb", color: "#334155", fontWeight: 500, minHeight: "42px", display: "flex", alignItems: "center", border: "none", opacity: 0.8 }}>
                  {item.organization || "—"}
                </div>
              </div>
              <div className={formStyles.formField}>
                <label>Volunteering Role</label>
                <div className={formStyles.inputField} style={{ background: "#eef5fb", color: "#334155", fontWeight: 500, minHeight: "42px", display: "flex", alignItems: "center", border: "none", opacity: 0.8 }}>
                  {item.volunteering || "—"}
                </div>
              </div>
              <div className={formStyles.formField}>
                <label>Duration</label>
                <div className={formStyles.inputField} style={{ background: "#eef5fb", color: "#334155", fontWeight: 500, minHeight: "42px", display: "flex", alignItems: "center", border: "none", opacity: 0.8 }}>
                  {item.start || "—"} to {item.end || "—"}
                </div>
              </div>
              <div className={formStyles.formField}>
                <label>City</label>
                <div className={formStyles.inputField} style={{ background: "#eef5fb", color: "#334155", fontWeight: 500, minHeight: "42px", display: "flex", alignItems: "center", border: "none", opacity: 0.8 }}>
                  {item.city || "—"}
                </div>
              </div>

              {item.description && (
                <div className={formStyles.fullWidthField}>
                  <div className={formStyles.formField}>
                    <label>Description</label>
                    <div className={formStyles.inputField} style={{ background: "#eef5fb", color: "#334155", fontWeight: 500, minHeight: "42px", display: "flex", alignItems: "center", border: "none", opacity: 0.8, height: "auto", padding: "10px 12px" }}>
                      <div dangerouslySetInnerHTML={{ __html: getSafeDescription(item.description) }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      <div style={{ width: "100%" }}>
        <Button
          onClick={addVolunteering}
          className={formStyles.addNewBtn}
          style={{ fontWeight: "600", borderRadius: "8px", padding: "10px 24px", height: "auto", width: "100%", marginBottom: "2rem" }}
        >
          + Add Volunteering
        </Button>
      </div>
    </div>
  );
}

