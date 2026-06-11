"use client";
import React from "react";
import { Empty } from "antd";

export default function Error() {
  return (
    <div
      style={{ display: "flex", justifyContent: "center", marginTop: "50px" }}
    >
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE} // default simple image
        description={<span>Something went wrong! Please try again.</span>}
      />
    </div>
  );
}
