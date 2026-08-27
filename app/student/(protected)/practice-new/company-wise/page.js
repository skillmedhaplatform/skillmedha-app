"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchCompanyTests } from "@/redux/slices/admin/cms/practiceSlice";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";
import PracticeFilters from "@/modules/student/components/PracticeFilters";
import CompanyTestCard from "@/modules/student/components/CompanyTestCard";
import { Skeleton } from "antd";

export default function CompanyWisePage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const { companyTests = [], status } = useSelector((state) => state.adminPractice);

  useEffect(() => {
    dispatch(fetchCompanyTests());
  }, [dispatch]);

  const categoryTabs = [
    { name: "Non-Technical", path: "/student/practice-new/nontechnical" },
    { name: "Technical", path: "/student/practice-new/technical" },
    { name: "Coding", path: "/student/practice-new/coding" },
    { name: "Company-wise", path: "/student/practice-new/company-wise" },
  ];

  const renderCompanyTests = () => {
    return companyTests.map((t) => {
      // Extract main categories (e.g. "Technical" from "Technical - Java") and deduplicate
      const uniqueMainCategories = [...new Set(
        (t.sections || []).map(sec => sec.split(" - ")[0].trim())
      )];

      return {
        id: t._id,
        name: t.title,
        initials: t.initials,
        color: t.color,
        hiringType: t.hiringType,
        patternName: t.patternName,
        sections: uniqueMainCategories,
        timeLimit: t.timeLimit || 0,
        questionCount: t.questionCount || 0,
      };
    });
  };

  const displayedTests = renderCompanyTests();
  const companyNames = [...new Set(displayedTests.map(t => t.name))];
  const filterCategories = ["All", ...companyNames];

  const filteredTests = displayedTests.filter(test => {
    if (activeCategory === "All") return true;
    if (test.hiringType && test.hiringType.toLowerCase() === activeCategory.toLowerCase()) return true;
    if (test.name === activeCategory) return true;
    return false;
  });

  return (
    <div className="flex flex-col h-full bg-[#EFF5FB]">
      <div className="flex-shrink-0 bg-[#EFF5FB] shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative z-10">
        <StudentPageHeader
          title="Train for the company that's hiring you"
          subtitle="Pattern, sections and question mix match the real drive"
          categoryTabs={categoryTabs}
        />
        <PracticeFilters
          categories={filterCategories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-8">
        <div className="max-w-[1400px] mx-auto">
            
          {status === 'loading' ? (
            <div className="text-center py-10 text-gray-500">Loading company tests...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTests.map((test) => (
                <div key={test.id} onClick={() => router.push(`/student/practice-new/company-wise/${test.id}`)} className="cursor-pointer h-full">
                  <CompanyTestCard
                    companyData={test}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
