"use client";
import React from "react";
import styles from "./styles/studentPageHeader.module.scss";
import { BsX, BsPlus, BsStar } from "react-icons/bs";

export default function StudentPageHeader({ section, title, rightSlot, style }) {
  return (
    <div className={styles.headerSection} style={style}>
      {/* Decorative background icons matching Dashboard banner */}
      <div className={styles.decorations}>
        <BsX className={styles.decX1} />
        <BsPlus className={styles.decPlus} />
        <BsStar className={styles.decStar} />
        <BsX className={styles.decX2} />
      </div>

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
