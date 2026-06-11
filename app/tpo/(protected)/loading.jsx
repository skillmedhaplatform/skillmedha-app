"use client";
import React from "react";
import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";
export default function Loading() {
    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: "1rem",
            }}
        >
            <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
            <h1>Loading Your Page</h1>
        </div>
    );
}
