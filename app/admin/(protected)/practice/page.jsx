"use client";
import React from "react";
import { FaBook, FaCode, FaCog } from "react-icons/fa";
import styles from "./PracticeCard.module.scss";
import { PracticeCategory } from "./Practice_utils/paths";
import { useRouter } from "next/navigation";

// Practice categories data with unique IDs

// Individual card component
function PracticeCard({ category, onClick }) {
  const getIcon = (name) => {
    switch (name) {
      case "Non - Technical":
        return <FaBook className={styles.icon} />;
      case "Coding":
        return <FaCode className={styles.icon} />;
      case "Technical":
        return <FaCog className={styles.icon} />;
      default:
        return <FaBook className={styles.icon} />;
    }
  };

  const getIconContainerClass = (name) => {
    const baseClass = styles.iconContainer;
    if (!category.active) return `${baseClass} ${styles.inactive}`;

    switch (name) {
      case "Non - Technical":
        return `${baseClass} ${styles.nonTechnical}`;
      case "Coding":
        return `${baseClass} ${styles.coding}`;
      case "Technical":
        return `${baseClass} ${styles.technical}`;
      default:
        return baseClass;
    }
  };

  return (
    <div
      className={`${styles.card} ${
        category.active ? styles.active : styles.inactive
      }`}
      onClick={() => category.active && onClick(category)}
    >
      <div className={getIconContainerClass(category.name)}>
        {getIcon(category.name)}
      </div>

      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{category.name}</h3>

        <div
          className={`${styles.statusBadge} ${
            category.active ? styles.available : styles.comingSoon
          }`}
        >
          <span
            className={`${styles.statusDot} ${
              category.active ? styles.available : styles.comingSoon
            }`}
          ></span>
          {category.active ? "Available" : "Coming Soon"}
        </div>
      </div>
    </div>
  );
}

// Main page component
export default function PracticePage() {
  const router = useRouter();
  const handleCardClick = (category) => {
    router.push(category?.path);
  };

  return (
    <div>
      <h1 className={styles.pageTitle}>Practice</h1>

      <div className={styles.cardContainer}>
        {PracticeCategory.map((category) => (
          <PracticeCard
            key={category.id}
            category={category}
            onClick={handleCardClick}
          />
        ))}
      </div>
    </div>
  );
}
