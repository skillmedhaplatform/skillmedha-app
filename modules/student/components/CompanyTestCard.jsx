"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { Popover } from "antd";
import { restUrl } from "@/config/urls";
import { PracticeSetCard, PracticeSetDetails } from "@/components/practiceSets/PracticeSetCard";
import CompanyAssessmentModal from "@/modules/student/components/CompanyAssessmentModal";

export default function CompanyTestCard({ 
  companyData = {},
  onStartTest,
  onViewResults
}) {
  const router = useRouter();
  const studentCreds = useSelector((state) => state.student?.student?.data);
  const [open, setOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasCompletedTest, setHasCompletedTest] = useState(Boolean(companyData.hasCompletedTest));

  const title = companyData.name || companyData.title || "Company Test";
  const initials = companyData.initials || (title ? title.slice(0, 2).toUpperCase() : "CO");
  const color = companyData.color || "#6D28D9";
  const hiringType = companyData.hiringType || companyData.level || "Mass Recruiter";
  const sections = companyData.sections || [];
  const timeLimit = companyData.timeLimit || companyData.timeMinutes || 0;
  const questionCount = companyData.questionCount || 0;
  const plan = companyData.plan || "free";
  const price = companyData.price || 0;
  const mrp = companyData.mrp || 0;
  const isFree = plan === "free";
  const owned = isFree || Boolean(companyData.access?.unlocked);

  const item = {
    _id: companyData.id || companyData._id,
    title,
    thumbnail: companyData.thumbnail,
    category: "company",
    plan,
    price,
    mrp,
    level: hiringType,
    difficulty: companyData.difficulty || "mixed",
    questionCount,
    timeMinutes: timeLimit,
    companyBrand: {
      title,
      initials,
      color,
    },
    topics: sections.map((sec) => ({
      topicTitle: typeof sec === "string" ? sec.split(" - ")[0].trim() : sec.topicTitle || sec.name || "",
    })),
    description: companyData.patternName ? `Test Pattern: ${companyData.patternName}` : companyData.description || "",
    access: companyData.access || { unlocked: true, reason: isFree ? "free" : "purchased" },
  };

  const handleActionClick = () => {
    if (onStartTest) {
      onStartTest();
    }
  };

  useEffect(() => {
    if (companyData.hasCompletedTest !== undefined) {
      setHasCompletedTest(Boolean(companyData.hasCompletedTest));
      return;
    }
    const testId = companyData.id || companyData._id;
    if (testId && open) {
      const token = typeof window !== "undefined" ? (localStorage.getItem("token") || sessionStorage.getItem("token") || "") : "";
      if (token) {
        fetch(`${restUrl}/practice/top-scores/${testId}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` }
        })
          .then((res) => res.json())
          .then((data) => {
            if (data && data.data && data.data.length > 0) {
              setHasCompletedTest(true);
            }
          })
          .catch(() => {});
      }
    }
  }, [companyData.hasCompletedTest, companyData.id, companyData._id, open]);

  const handleViewResults = () => {
    if (onViewResults) {
      onViewResults(companyData);
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <Popover
        trigger="hover"
        placement="rightTop"
        mouseEnterDelay={0.12}
        mouseLeaveDelay={0.15}
        arrow={false}
        destroyOnHidden
        open={open}
        onOpenChange={setOpen}
        styles={{
          container: {
            padding: 0,
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: "0 22px 50px -12px rgba(15, 23, 42, 0.35)",
          },
        }}
        content={
          <div className="w-[268px] max-w-[85vw]">
            <PracticeSetDetails
              item={item}
              isBundle={false}
              plain
              actionLabel="Start Test"
              onAction={handleActionClick}
              hasCompletedTest={hasCompletedTest}
              onViewResults={handleViewResults}
            />
          </div>
        }
      >
        <div className="h-full">
          <PracticeSetCard
            item={item}
            isBundle={false}
            owned={owned}
            active={open}
            onClick={handleActionClick}
          />
        </div>
      </Popover>

      {!onViewResults && (
        <CompanyAssessmentModal
          open={isModalOpen}
          test={companyData}
          onClose={() => setIsModalOpen(false)}
          studentCreds={studentCreds}
          router={router}
          initialState="RESULTS"
        />
      )}
    </>
  );
}
