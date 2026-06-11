"use client";
import React from "react";
import { Empty, Button } from "antd";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div
      style={{ display: "flex", justifyContent: "center", marginTop: "80px" }}
    >
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={<span>Page Not Found (404)</span>}
      >
        <Button type="primary" onClick={() => router.push("/")}>
          Back Home
        </Button>
      </Empty>
    </div>
  );
}
