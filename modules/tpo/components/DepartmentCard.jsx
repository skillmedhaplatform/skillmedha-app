import React from "react";
import { Button, Dropdown, message, Popconfirm } from "antd";
import styles from "./styles/card.module.scss";
import { HiDotsVertical } from "react-icons/hi";
import { deleteLstorageVal, setSstorage } from "@/utils/universalUtils/windowMW";
import { useDispatch } from "react-redux";
import { FiChevronRight } from "react-icons/fi";

const DepartmentCard = ({ handleClick, item, cardType, studentsList = [] }) => {
  const dispatch = useDispatch();

  const dropdownMenu = {
    items: [
      {
        key: "1",
        label: "Edit",
      },
      {
        key: "2",
        label: "Delete",
      },
      {
        key: "3",
        label: (
          <Popconfirm
            title="Are you sure you want to delete all students?"
            onConfirm={() => {
              handleClick(item?._id, "DELETE_ALL_STUDENTS");
            }}
            onCancel={() => {
              message.info("Deletion canceled");
            }}
            okText="Yes"
            cancelText="No"
          >
            <span style={{ cursor: "pointer", color: "red" }} onClick={(e) => e.stopPropagation()}>
              Delete All Students
            </span>
          </Popconfirm>
        )
      }
    ],
    onClick: (e) => {
      if (e.domEvent) {
        e.domEvent.stopPropagation();
      }
      if (e.key === "1") {
        handleClick(item?._id, "EDIT");
      } else if (e.key === "2") {
        handleClick(item?._id, "DELETE");
      }
    }
  };

  // Helper to get theme color based on department title
  const getTheme = (title = "") => {
    const t = title.toLowerCase();
    if (t.includes("testing mech")) {
      return { border: "#a0522d", initialsBg: "#a0522d" }; // brown/orange
    }
    if (t.includes("testing-2") || t.includes("testing 2")) {
      return { border: "#1d70b8", initialsBg: "#1d70b8" }; // blue
    }
    return { border: "#24a058", initialsBg: "#24a058" }; // default green
  };

  // Helper to generate initials from title
  const getInitials = (title = "") => {
    const clean = title.replace(/[^a-zA-Z0-9\s-]/g, "").trim();
    if (clean.toLowerCase().includes("testing mech")) return "TM";
    if (clean.toLowerCase().includes("testing-2") || clean.toLowerCase().includes("testing 2")) return "T2";
    const parts = clean.split(/[\s-]+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  };

  const theme = getTheme(item?.title);
  const initials = getInitials(item?.title || "Department");

  // Dynamic calculations using passed student list
  const deptStudents = studentsList.filter(s => s.department?.toString() === item?._id?.toString());
  const studentsCount = item?.students?.length || deptStudents.length || 0;
  const placedCount = deptStudents.filter(s => s.placementStatus === "placed").length;

  const spocName = item?.spoc && item.spoc !== "N/A" ? item.spoc : null;

  return (
    <div
      className={styles.cardCont}
      style={{ borderLeft: `4px solid ${theme.border}` }}
      onClick={() => {
        deleteLstorageVal("departmentTitle");
        setSstorage("departmentTitle", item?.title);
        handleClick(item?._id, "GET");
      }}
    >
      {/* Header Row */}
      <div className={styles.headerRow}>
        <div className={styles.headerLeft}>
          <div className={styles.initialsBlock} style={{ backgroundColor: theme.initialsBg }}>
            {initials}
          </div>
          <div className={styles.headerInfo}>
            <h4 className={styles.deptTitle}>{item?.title || "Department"}</h4>
            <span className={styles.spocInfo}>
              {spocName ? `SPOC: ${spocName}` : "No SPOC assigned"}
            </span>
          </div>
        </div>
        {cardType !== "NoDep" && (
          <div className={styles.actionMenu}>
            <Dropdown menu={dropdownMenu} trigger={["click"]}>
              <Button type="text" onClick={(e) => e.stopPropagation()} style={{ padding: 0 }}>
                <HiDotsVertical style={{ fontSize: "1.1rem", color: "#718096" }} />
              </Button>
            </Dropdown>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className={styles.metricsRow}>
        <div className={styles.metricCol}>
          <span className={styles.value}>{studentsCount}</span>
          <span className={styles.label}>Students</span>
        </div>
        <div className={styles.metricCol}>
          <span className={styles.value} style={{ color: "#24a058" }}>{placedCount}</span>
          <span className={styles.label}>Placed</span>
        </div>
      </div>

      {/* Details Section */}
      <div className={styles.detailsSection}>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>HOD</span>
          <span className={styles.infoValue}>{item?.hodName || "Not set"}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Phone</span>
          <span className={styles.infoValue}>{item?.mobile || "N/A"}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Email</span>
          <span className={styles.infoValue}>{item?.email || "N/A"}</span>
        </div>
      </div>

      {/* Footer Row */}
      <div className={styles.cardFooter}>
        <div className={styles.statusTag}>
          <span className={styles.statusDot}></span>
          <span>Active</span>
        </div>
        <div className={styles.viewLink}>
          <span>View details</span>
          <FiChevronRight />
        </div>
      </div>
    </div>
  );
};

export default DepartmentCard;
