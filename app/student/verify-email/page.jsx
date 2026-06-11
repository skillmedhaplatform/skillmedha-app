"use client";

import React, { useState } from "react";
import { Button, Result, message, Divider } from "antd";
import { MailOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { resendVerifyEmail } from "@/redux/slices/student";
import Cookies from "js-cookie";
import { useAppRouter } from "@/helpers/useAppRouter";
import { refreshSessionAndRedirect } from "./actions";

export default function VerifyEmailPage() {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const nav = useAppRouter();

  const handleResend = async () => {
    setLoading(true);
    try {
      await dispatch(resendVerifyEmail()).unwrap();
      message.success("Verification email sent successfully!");
    } catch (err) {
      message.error("Failed to send verification email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    localStorage.clear();
    sessionStorage.clear();

    try {
      await fetch("/api/auth/session", { method: "DELETE" });
    } catch (e) {
      console.error(e);
    }

    Cookies.remove("token");
    nav.replace("/login");
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#f0f2f5",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          maxWidth: "500px",
          width: "100%",
        }}
      >
        <Result
          icon={<MailOutlined style={{ color: "#52c41a" }} />}
          title="Verify Your Email Address"
          subTitle="We noticed your email address has not been verified yet. Please check your inbox and click the verification link to access the platform."
          extra={[
            <Button
              type="primary"
              key="resend"
              loading={loading}
              onClick={handleResend}
            >
              Resend Verification Email
            </Button>,
            <Button
              key="login"
              onClick={handleLogout}
              style={{ marginLeft: "8px" }}
            >
              Back to Login
            </Button>,
          ]}
        />

        <Divider style={{ margin: "8px 0 24px" }} />

        {/*
          Server Action form — runs entirely on the server.
          This is the correct Next.js App Router approach:
          - cookies() works properly server-side so Set-Cookie takes effect
          - Fresh ev value is read from the real student API (not hardcoded)
          - redirect() from next/navigation triggers a proper server redirect
          - No window.location, no client-side cookie tricks
        */}
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#6a6f73", marginBottom: "12px", fontSize: "14px" }}>
            Already clicked the verification link?
          </p>
          <form action={refreshSessionAndRedirect}>
            <button
              type="submit"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                border: "1px solid #52c41a",
                background: "transparent",
                color: "#52c41a",
                borderRadius: "6px",
                padding: "7px 16px",
                fontSize: "14px",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              <CheckCircleOutlined />
              I&apos;ve Verified — Continue to Dashboard
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
