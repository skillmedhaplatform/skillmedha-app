"use client";
import React from "react";
import Lottie from "lottie-react";
import loadingData from "@/public/app_json/main-loading.json";

export default function Loading() {
    return (
        <div
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "#ffffff",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9999,
                flexDirection: "column",
                transition: "all 0.3s ease",
                borderRadius: "inherit"
            }}
        >
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "10px",
                }}
            >
                <div style={{ width: "220px", height: "220px" }}>
                    <Lottie
                        animationData={loadingData}
                        loop={true}
                        autoplay={true}
                    />
                </div>
                <p style={{
                    margin: 0,
                    color: "#24A058",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                    opacity: 0.8
                }}>
                    Preparing your experience...
                </p>
            </div>
        </div>
    );
}
