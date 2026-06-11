import React from "react";
import { Card, Skeleton, Avatar, Rate, Tag, Button } from "antd";
import styles from "@/app/admin/(protected)/colleges/College.module.scss";

export default function SkeletonCard() {
  return (
    <div className={styles.collegeCard}>
      <div className={styles.cardHeader}>
        <Skeleton.Avatar
          active
          size={60}
          shape="square"
          style={{ borderRadius: "12px" }}
        />
        <Skeleton.Button active size="small" shape="circle" />
      </div>
      <div className={styles.cardContent}>
        <Skeleton
          active
          paragraph={{ rows: 3, width: ["100%", "80%", "60%"] }}
          title={{ width: "90%" }}
        />
      </div>
    </div>
  );
}
export function CourseSkeleton() {
  return (
    <Card
      hoverable
      style={{
        width: "100%",
        borderRadius: 14,
        overflow: "hidden",
        padding: "0.5rem",
      }}
      bodyStyle={{ padding: 0 }}
    >
      <div style={{ display: "grid", gridTemplateRows: "auto 1fr", gap: 10 }}>
        {/* Thumbnail */}
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "16 / 9",
            background: "#f2f2f2",
            borderRadius: 12,
          }}
        >
          <Skeleton.Image
            style={{ width: "100%", height: "100%", borderRadius: 12 }}
            active
          />
          <Skeleton.Button
            active
            size="small"
            style={{
              position: "absolute",
              left: 8,
              top: 8,
              width: 60,
              height: 20,
              borderRadius: 50,
            }}
          />
        </div>

        {/* Content */}
        <div
          style={{
            display: "grid",
            gridAutoRows: "max-content",
            gap: 8,
            padding: "10px 12px 14px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Skeleton.Input style={{ width: "70%", height: 20 }} active />
            <Skeleton.Button
              active
              size="small"
              style={{ width: 32, height: 24, borderRadius: 6 }}
            />
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            <Skeleton.Button
              active
              size="small"
              style={{ width: 80, height: 24, borderRadius: 50 }}
            />
            <Skeleton.Button
              active
              size="small"
              style={{ width: 80, height: 24, borderRadius: 50 }}
            />
          </div>

          <Skeleton paragraph={{ rows: 2 }} active />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Skeleton.Input active style={{ width: 120, height: 16 }} />
          </div>
        </div>
      </div>
    </Card>
  );
}
