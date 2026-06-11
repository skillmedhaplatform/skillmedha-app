"use client";
import { getOneSKill, getSKillQuestions } from "@/redux/slices/admin/cms/skillsSlice"; // Fixed import
import { Spin, Result, Button } from "antd";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

export default function AssessmentsPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if it's a new skill
        const isNewSkill = params?.testId === "newSkill";

        if (isNewSkill) {
          // For new skill, directly navigate to details page without API calls
          router.push(`/admin/questionManager/${params?.testId}/details`);
          return;
        }

        // For existing skills, fetch data from API
        const [skillResult, questionsResult] = await Promise.all([
          dispatch(getOneSKill({ skillId: params?.testId })),
          dispatch(getSKillQuestions({ skillId: params?.testId })),
        ]);

        const skillSuccess = getOneSKill.fulfilled.match(skillResult);
        const questionsSuccess =
          getSKillQuestions.fulfilled.match(questionsResult);

        if (skillSuccess && questionsSuccess) {
          router.push(`/admin/questionManager/${params?.testId}/details`);
        } else {
          const skillError = skillSuccess ? null : skillResult.error?.message;
          const questionsError = questionsSuccess
            ? null
            : questionsResult.error?.message;

          const errorMessage =
            [skillError, questionsError].filter(Boolean).join(", ") ||
            "Failed to load data";

          setError(errorMessage);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error:", error);
        setError("An unexpected error occurred");
        setIsLoading(false);
      }
    };

    if (params?.testId) {
      handleRedirect();
    } else {
      setError("Invalid test ID");
      setIsLoading(false);
    }
  }, [params?.testId, dispatch, router]);

  const handleRetry = async () => {
    try {
      setError(null);
      setIsLoading(true);

      // Check if it's a new skill
      const isNewSkill = params?.testId === "newSkill";

      if (isNewSkill) {
        // For new skill, directly navigate to details page without API calls
        router.push(`/admin/questionManager/${params?.testId}/details`);
        return;
      }

      // For existing skills, retry API calls
      const [skillResult, questionsResult] = await Promise.all([
        dispatch(getOneSKill({ skillId: params?.testId })),
        dispatch(getSKillQuestions({ skillId: params?.testId })),
      ]);

      const skillSuccess = getOneSKill.fulfilled.match(skillResult);
      const questionsSuccess =
        getSKillQuestions.fulfilled.match(questionsResult);

      if (skillSuccess && questionsSuccess) {
        router.push(`/admin/questionManager/${params?.testId}/details`);
      } else {
        const skillError = skillSuccess ? null : skillResult.error?.message;
        const questionsError = questionsSuccess
          ? null
          : questionsResult.error?.message;

        const errorMessage =
          [skillError, questionsError].filter(Boolean).join(", ") ||
          "Failed to load data";

        setError(errorMessage);
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Retry error:", err);
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div
        style={{
          width: "100%",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <Spin size="large" />
        <h2>Loading skill data...</h2>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        style={{
          width: "100%",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Result
          status="error"
          title="Failed to Load Skill Data"
          subTitle={error}
          extra={[
            <Button type="primary" key="retry" onClick={handleRetry}>
              Try Again
            </Button>,
            <Button
              key="back"
              onClick={() => router.replace("/admin/questionManager")}
            >
              Go Back
            </Button>,
          ]}
        />
      </div>
    );
  }

  // This should rarely be reached due to navigation
  return <div>Redirecting...</div>;
}
