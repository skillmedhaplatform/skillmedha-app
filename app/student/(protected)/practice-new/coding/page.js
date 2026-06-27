"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";
import {
  fetchSubjectsByType,
  getStudentPracResults,
} from "@/redux/slices/practiceSlice";
import PracticeFilters from "@/modules/student/components/PracticeFilters";
import PracticeCard from "@/modules/student/components/PracticeCard";
import PracticeBannerTabs from "../components/PracticeBannerTabs";
import { Divider, Result, Spin, Tooltip, message } from "antd";
import useResponsive from "@/hooks/useResponsive";
import styles from "@/mobile_views/practice/mobilePracticeLayout.module.scss";

export default function CodingPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const currPath = usePathname();
  const searchParams = useSearchParams();
  const subjects = useSelector((s) => s.practice.subjects);
  const studentCreds = useSelector((state) => state.student.student?.data);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSort, setActiveSort] = useState("Default");
  const isMobile = useResponsive();

  const categoryTabs = [
    { name: "Technical", path: "/student/practice-new/technical" },
    { name: "Non-Technical", path: "/student/practice-new/nontechnical" },
    { name: "Coding", path: "/student/practice-new/coding" },
  ];

  useEffect(() => {
    setLoading(true);
    dispatch(fetchSubjectsByType("coding")).finally(() => {
      setLoading(false);
    });
    if (studentCreds?._id) {
      dispatch(getStudentPracResults(studentCreds._id));
    }
  }, [dispatch, studentCreds?._id]);

  if (loading) {
    return (
      <div>
        <h2>Coding Practice Page</h2>
        <Divider />
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Spin size="large" />
          <p style={{ marginTop: "10px" }}>Loading subjects...</p>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className={styles.container}>
        <div className={styles.categoryTabs}>
          {categoryTabs.map((tab) => {
            const isActive = tab.path === "/student/practice-new/coding";
            return (
              <button
                key={tab.path}
                onClick={() => router.push(tab.path)}
                className={`${styles.tabBtn} ${isActive ? styles.activeTab : ""}`}
              >
                {tab.name}
              </button>
            );
          })}
        </div>
        <div className={styles.contentArea}>
          {subjects && subjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 py-6">
              {subjects.map((subject, index) => (
                <PracticeCard 
                  key={subject._id || index}
                  title={subject.title || subject.key}
                  category="CODING"
                  totalQuestions={subject.totalQuestions || 0}
                  onStart={() => {
                    router.push(`/student/practice-new/coding/codingtest?sub=${subject._id}`);
                  }}
                />
              ))}
            </div>
          ) : (
            <Result
              status="404"
              title="No Practice Data Found"
              subTitle="Sorry, there is no practice data available right now."
            />
          )}
        </div>
      </div>
    );
  }

  const dynamicSubtitle = subjects?.map(s => s.title).join(" • ") || "Master your programming skills with our coding challenges.";
  const totalTopics = subjects?.length || 0;
  const totalQuestions = subjects?.reduce((acc, curr) => acc + (curr.totalQuestions || 0), 0) || 0;

  const RightStats = (
    <div className="flex items-center gap-6 lg:gap-10 text-white mr-2 lg:mr-8">
      <div className="flex flex-col items-center">
        <span className="text-[24px] lg:text-[28px] font-bold leading-none">{totalTopics}</span>
        <span className="text-[10px] text-white/70 tracking-widest uppercase mt-1">TOPICS</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-[24px] lg:text-[28px] font-bold leading-none">{totalQuestions}</span>
        <span className="text-[10px] text-white/70 tracking-widest uppercase mt-1">QUESTIONS</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-[24px] lg:text-[28px] font-bold leading-none bg-gradient-to-br from-[#1E69DA] to-[#5694F0] bg-clip-text text-transparent">0%</span>
        <span className="text-[10px] text-white/70 tracking-widest uppercase mt-1">DONE</span>
      </div>
    </div>
  );

  const dynamicCategories = ["All", ...(subjects?.map(s => s.title || s.key) || [])];
  
  let filteredSubjects = activeCategory === "All" 
    ? [...(subjects || [])] 
    : (subjects || []).filter(subject => (subject.title || subject.key) === activeCategory);

  if (activeSort === "Name") {
    filteredSubjects.sort((a, b) => (a.title || a.key || "").localeCompare(b.title || b.key || ""));
  } else if (activeSort === "Recent") {
    filteredSubjects.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (timeA !== timeB) return timeB - timeA;
      if (a._id && b._id) return a._id > b._id ? -1 : 1;
      return 0;
    });
  }

  return (
      <div className="flex flex-col h-full overflow-hidden bg-[#EFF5FB]">
        <div className="flex-shrink-0 bg-[#EFF5FB] shadow-sm">
          <StudentPageHeader 
            title="Practice" 
            subtitleSlot={<PracticeBannerTabs />}
            rightSlot={RightStats}
          />
          
          <PracticeFilters 
            categories={dynamicCategories} 
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            activeSort={activeSort}
            onSortChange={setActiveSort}
          />
        </div>

        {filteredSubjects && filteredSubjects.length > 0 ? (
        <div className={`bg-gray-50/30 px-4 lg:px-8 pt-6 pb-6 flex-1 ${activeCategory === "All" ? "overflow-y-auto" : "overflow-hidden"}`}>
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeCategory}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {filteredSubjects.map((subject, index) => (
                <PracticeCard 
                  key={subject._id || index}
                  title={subject.title || subject.key}
                  category="CODING"
                  totalQuestions={subject.totalQuestions || 0}
                  onStart={() => {
                    router.push(`/student/practice-new/coding/codingtest?sub=${subject._id}`);
                  }}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
        ) : (
          <Result
            status="404"
            title="No Subjects Found"
            subTitle="Sorry, there are no subjects available for this topic right now."
          />
        )}
      </div>
    
  );
}
