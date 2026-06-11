import { Spin } from "antd";
import React from "react";

export default function loading() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: ".1rem",
      }}
    >
      <Spin size="large" />
      <h2>Loading ...</h2>
    </div>
  );
}
