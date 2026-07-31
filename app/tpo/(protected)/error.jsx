"use client";

import React from "react";
import { Result, Button } from "antd";
import { useRouter } from "next/navigation";

export default function Error({ error, reset }) {
    console.error("GLOBAL APP ERROR:", error);
    const router = useRouter();

    const goHome = () => {
        router.replace("/tpo/dashboard");
    };

    return (
        <div style={{ padding: "2rem", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#EFF5FB" }}>
            <Result
                status="error"
                title="Something Went Wrong"
                subTitle="Sorry, there was an unexpected error while loading the page."
                extra={
                    <div>
                      <Button type="primary" onClick={goHome} style={{ marginBottom: "20px" }}>
                          Go to Dashboard
                      </Button>
                      {error?.message && (
                          <div style={{ padding: "12px", backgroundColor: "#ffebee", color: "#c62828", borderRadius: "8px", maxWidth: "600px", margin: "0 auto", textAlign: "left", fontFamily: "monospace" }}>
                              <strong>Error Details:</strong>
                              <br/>
                              {String(error.message)}
                          </div>
                      )}
                    </div>
                }
            />
        </div>
    );
}