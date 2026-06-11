"use client";

import { useRouter } from "next/navigation";
import { Button, Result } from "antd";
import { HomeOutlined, ArrowLeftOutlined } from "@ant-design/icons";

export default function Unauthorized() {
  const router = useRouter();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "3rem",
          borderRadius: "12px",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
          maxWidth: "600px",
          width: "100%",
        }}
      >
        <Result
          status="403"
          title="Access Denied"
          subTitle="You don't have permission to access this page. Contact your administrator to request access."
          extra={[
            <Button
              key="back"
              icon={<ArrowLeftOutlined />}
              onClick={() => router.back()}
              size="large"
            >
              Go Back
            </Button>,
            <Button
              key="dashboard"
              type="primary"
              icon={<HomeOutlined />}
              onClick={() => router.push("/dashboard")}
              size="large"
            >
              Go to Dashboard
            </Button>,
          ]}
        />
      </div>
    </div>
  );
}
