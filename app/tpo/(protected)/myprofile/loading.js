"use client";

import React from "react";
import { Skeleton, Space } from "antd";

export default function Loading() {
  const skeletonHeight = 45;

  return (
    <div
      style={{
        padding: "2rem",
        width: "100%",
        maxWidth: "600px",
        marginTop: "1rem",
      }}
    >
      <Skeleton
        active
        title={{ width: "100%", height: 45 }}
        paragraph={false}
      />

      <Space
        direction="vertical"
        size="middle"
        style={{ width: "100%", marginTop: "2rem" }}
      >
        {[1, 2, 3, 4].map((i) => (
          <Skeleton.Input
            key={i}
            active
            block
            style={{ height: skeletonHeight }}
          />
        ))}

        <Skeleton.Button active block style={{ height: skeletonHeight }} />
      </Space>
    </div>
  );
}
