"use client";

import React from "react";
import { Result, Button } from "antd";
import { useRouter } from "next/navigation";

export default function Error({ error, reset }) {
    console.error("GLOBAL APP ERROR:", error);
    const router = useRouter();

    const goHome = () => {
        router.replace("/");
    };

    return (
        <div style={{ padding: "2rem", display: "flex", justifyContent: "center" }}>
            <Result
                status="error"
                title="Something Went Wrong"
                subTitle="Sorry, there was an unexpected error while loading the page."
                extra={
                    <Button type="primary" onClick={goHome}>
                        Go to Homepage
                    </Button>
                }
            />
        </div>
    );
}
