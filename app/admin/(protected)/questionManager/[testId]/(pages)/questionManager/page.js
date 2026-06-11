"use client";
import { getOneSKill } from "@/redux/slices/admin/cms/skillsSlice";
import { Spin } from "antd";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

export default function AssessmentsPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        router.push(
          `/admin/questionManager/${params?.testId}/questionManager/questionsList`
        );
      } catch (error) {
        console.error("Error:", error);
        setIsLoading(false);
      }
    };

    if (params?.testId) {
      handleRedirect();
    }
  }, [params?.testId, router]);

  if (isLoading) {
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

  return <div>Redirecting...</div>;
}
