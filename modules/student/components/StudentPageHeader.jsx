"use client";
import React from "react";
import styles from "./styles/studentPageHeader.module.scss";

export default function StudentPageHeader({ section, title, rightSlot }) {
  return (
    <div className={styles.headerSection}>
      {section && (
        <p className={styles.sectionLabel}>{section}</p>
      )}
      <p className={styles.title}>{title}</p>
      {rightSlot && (
        <div className={styles.rightSlot}>{rightSlot}</div>
      )}
    </div>
  );
}
