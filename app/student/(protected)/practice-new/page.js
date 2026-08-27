"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";
import { App } from "antd";
import { FiBookOpen, FiBriefcase, FiFileText, FiChevronRight } from "react-icons/fi";

export default function PracticeNewRedirect() {
  const router = useRouter();
  const { message } = App.useApp();

  const cards = [
    {
      id: "topic",
      title: "Topic Wise",
      description: "Practice specific topics and strengthen your concepts",
      icon: <FiBookOpen className="text-4xl text-white" />,
      iconBg: "bg-[#2563EB]", // Exact blue from the image
      iconShadow: "shadow-blue-200",
      buttonColor: "border-blue-500 text-blue-600 hover:bg-blue-50",
      titleColor: "text-[#2563EB]",
      onClick: () => router.push("/student/practice-new/nontechnical?selectCategory=true"),
    },
    {
      id: "company",
      title: "Company Wise",
      description: "Practice questions asked by top companies",
      icon: <FiBriefcase className="text-4xl text-white" />,
      iconBg: "bg-[#22C55E]", // Exact green from the image
      iconShadow: "shadow-green-200",
      buttonColor: "border-green-500 text-green-600 hover:bg-green-50",
      titleColor: "text-[#22C55E]",
      onClick: () => router.push("/student/practice-new/company-wise"),
    },
    {
      id: "mock",
      title: "Mock Test",
      description: "Take full-length tests and analyze your performance",
      icon: <FiFileText className="text-4xl text-white" />,
      iconBg: "bg-[#9333EA]", // Exact purple from the image
      iconShadow: "shadow-purple-200",
      buttonColor: "border-purple-500 text-purple-600 hover:bg-purple-50",
      titleColor: "text-[#9333EA]",
      onClick: () => message.info("Mock Tests are coming soon!"),
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[#EFF5FB] overflow-y-auto">
      <div className="flex-shrink-0">
        <StudentPageHeader
          title={
            <div className="flex items-center gap-3">
              <span>Practice</span>
            </div>
          }
          subtitle="Explore and manage your learning journey."
        />
      </div>

      <div className="flex-1 flex flex-col items-center py-16 px-4 max-w-6xl mx-auto w-full">
        {/* Header Text */}
        <div className="text-center mb-16">
          <div className="text-4xl lg:text-5xl font-bold text-slate-800 mb-5 tracking-tight no-underline border-none shadow-none pb-0">
            Choose your practice mode
          </div>
          <p className="text-slate-500 text-lg lg:text-xl">
            Select how you want to practice and improve your skills
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-[1100px]">
          {cards.map((card) => (
            <div
              key={card.id}
              className="bg-white rounded-3xl p-10 flex flex-col items-center text-center shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100/60 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden"
            >
              {/* Subtle background blob */}
              <div className={`absolute top-10 w-40 h-40 rounded-full ${card.iconBg} opacity-[0.03] blur-3xl`} />

              {/* Icon Container */}
              <div className="relative mb-8 mt-2">
                <div className={`w-[100px] h-[100px] rounded-3xl ${card.iconBg} flex items-center justify-center shadow-[0_10px_25px_rgba(0,0,0,0.12)] relative z-10 group-hover:scale-105 transition-transform duration-300`}>
                  {card.icon}
                </div>
              </div>

              <div className={`text-2xl font-bold mb-4 no-underline border-none shadow-none pb-0 ${card.titleColor}`}>
                {card.title}
              </div>

              <p className="text-slate-500 mb-10 flex-1 leading-relaxed px-2 text-base">
                {card.description}
              </p>

              <button
                onClick={card.onClick}
                className={`w-full mt-6 py-3.5 px-6 rounded-xl font-semibold border-[1.5px] transition-all flex items-center justify-center gap-2 group-hover:gap-3 text-[15px]
                  ${card.buttonColor}
                `}
              >
                Start Practicing
                <FiChevronRight className="text-xl" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
