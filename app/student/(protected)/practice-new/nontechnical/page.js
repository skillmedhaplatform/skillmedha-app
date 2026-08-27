"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";
import { FiArrowLeft, FiTarget, FiLayers, FiCode } from "react-icons/fi";
import {
  fetchSubjectsByType,
  getStudentPracResults,
} from "@/redux/slices/practiceSlice";
import PracticeFilters from "@/modules/student/components/PracticeFilters";
import PracticeSubjectRow from "@/modules/student/components/PracticeSubjectRow";
import { Divider, Result, Spin, Tooltip, message, Skeleton } from "antd";
import styles from "@/mobile_views/practice/mobilePracticeLayout.module.scss";

export default function NontechnicalPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const currPath = usePathname();
  const searchParams = useSearchParams();
  const subjects = useSelector((s) => s.practice.subjects);
  const studentCreds = useSelector((state) => state.student.student?.data);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSort, setActiveSort] = useState("Default");
  const [isTopicModalOpen, setTopicModalOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("selectCategory") === "true") {
      setTopicModalOpen(true);
    }
  }, [searchParams]);

  const categoryTabs = [
    { name: "Non-Technical", path: "/student/practice-new/nontechnical" },
    { name: "Technical", path: "/student/practice-new/technical" },
    { name: "Coding", path: "/student/practice-new/coding" },
    { name: "Company-wise", path: "/student/practice-new/company-wise" },
  ];

  useEffect(() => {
    setLoading(true);
    dispatch(fetchSubjectsByType("nontechnical")).finally(() => {
      setLoading(false);
    });
    if (studentCreds?._id) {
      dispatch(getStudentPracResults(studentCreds._id));
    }
  }, [dispatch, studentCreds?._id]);

  if (loading) {
    return (
      <div className="flex flex-col h-full overflow-hidden bg-[#EFF5FB]">
        <div className="flex-shrink-0 bg-[#EFF5FB] shadow-sm">
          {/* Skeleton Header */}
          <div className="w-full h-[140px] min-h-[140px] flex flex-col justify-center items-start gap-2 p-4 lg:px-8 shadow-sm rounded-none bg-gradient-to-br from-[#071631] to-[#10254c] shrink-0 relative overflow-hidden z-[2]">
            <div className="flex items-center justify-between w-full relative z-[2]">
              <div className="flex items-center gap-4 relative z-10">
                <Skeleton.Avatar active shape="square" size={56} style={{ borderRadius: '12px', background: 'rgba(255,255,255,0.1)' }} />
                <div className="flex flex-col justify-center items-start gap-1.5">
                  <Skeleton.Input active size="small" style={{ width: 100, height: 14 }} />
                  <Skeleton.Input active size="large" style={{ width: 250, height: 28 }} />
                  <Skeleton.Input active size="small" style={{ width: 200, height: 14 }} />
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-6 lg:gap-10 mr-2 lg:mr-8">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <Skeleton.Avatar active shape="square" size={28} style={{ background: 'rgba(255,255,255,0.1)' }} />
                    <Skeleton.Input active size="small" style={{ width: 50, height: 10, background: 'rgba(255,255,255,0.1)' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Filters Skeleton */}
          <div className="px-4 lg:px-8 py-3 bg-white border-b border-gray-100 flex items-center justify-between">
            <div className="flex gap-2">
              <Skeleton.Button active shape="round" size="default" style={{ width: 100 }} />
              <Skeleton.Button active shape="round" size="default" style={{ width: 120 }} />
              <Skeleton.Button active shape="round" size="default" style={{ width: 90 }} />
            </div>
            <Skeleton.Input active size="default" style={{ width: 150 }} />
          </div>
        </div>
        
        {/* List Skeleton */}
        <div className="bg-[#EFF5FB] px-4 lg:px-8 pt-6 pb-6 flex-1 overflow-hidden">
          <div className="w-full pb-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm mb-5 p-4 lg:p-6 border border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                  <Skeleton.Avatar active shape="circle" size={48} />
                  <div>
                    <Skeleton.Input active size="small" style={{ width: 200, marginBottom: 8, display: 'block' }} />
                    <Skeleton.Input active size="small" style={{ width: 300 }} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                  {[1, 2, 3, 4].map(j => (
                    <Skeleton.Button active key={j} style={{ width: '100%', height: 80, borderRadius: '12px' }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }


  const dynamicSubtitle = subjects?.map(s => s.title).join(" • ") || "Improve your aptitude, reasoning, and verbal abilities.";
  
  const totalTopics = subjects?.length || 0;
  // Since we don't have subtopics directly anymore, we will estimate or just show 0 or loading
  const totalQuestions = subjects?.reduce((acc, curr) => acc + (curr.totalQuestions || 0), 0) || 0;

  const RightStats = (
    <div className="hidden sm:flex items-center gap-6 lg:gap-10 text-white mr-2 lg:mr-8">
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

  const dynamicCategories = ["All", ...(subjects?.map(s => s.title) || [])];
  
  let filteredSubjects = activeCategory === "All" 
    ? [...(subjects || [])] 
    : (subjects || []).filter(subject => subject.title === activeCategory);

  if (activeSort === "Name") {
    filteredSubjects.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
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
            title={
              <div className="flex items-center gap-4">
                <span>Non-Technical Practice</span>
                <button 
                  onClick={() => setTopicModalOpen(true)}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-full text-sm font-medium transition-colors backdrop-blur-sm border border-white/20"
                >
                  <FiLayers /> Switch Category
                </button>
              </div>
            }
            subtitleSlot={null}
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
        <div className={`bg-[#EFF5FB] px-4 lg:px-8 pt-0 pb-6 flex-1 ${activeCategory === "All" ? "overflow-y-auto" : "overflow-hidden"}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="w-full pb-5"
            >
              {filteredSubjects.map((subject, index) => (
                <PracticeSubjectRow 
                  key={subject._id || index} 
                  subject={subject} 
                  pageSizeOverride={activeCategory === "All" ? 4 : 8}
                  activeSort={activeSort}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
        ) : (
          <Result
            status="404"
            title="No Subjects Found"
            subTitle="Sorry, there are no subjects available right now."
          />
        )}

      {/* Blur Overlay Modal */}
      {isTopicModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/40 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-4xl p-8 lg:p-12 relative shadow-2xl animate-in zoom-in-95 duration-300">
            {/* Back Button */}
            <button 
              onClick={() => router.push("/student/practice-new")}
              className="absolute top-6 left-6 text-slate-400 hover:text-slate-800 hover:bg-slate-100 p-3 rounded-full transition-colors flex items-center gap-2 font-semibold"
            >
              <FiArrowLeft className="text-2xl" />
              <span className="hidden sm:inline">Back</span>
            </button>

            <div className="text-center mb-12 mt-6">
              <div className="text-3xl lg:text-4xl font-bold text-slate-800 tracking-tight mb-3">
                Select Topic Category
              </div>
              <p className="text-slate-500 text-lg">
                Choose the type of topics you'd like to practice
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <button 
                onClick={() => {
                  setTopicModalOpen(false);
                  router.replace("/student/practice-new/nontechnical");
                }}
                className="group bg-[#EFF5FB] hover:bg-[#E5F0FF] p-8 rounded-2xl flex flex-col items-center text-center transition-all duration-300 border border-transparent hover:border-[#1E69DA]/30 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="w-16 h-16 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-[0_4px_14px_rgba(59,130,246,0.4)] mb-6 group-hover:scale-110 transition-transform">
                  <FiTarget className="text-3xl" />
                </div>
                <div className="text-xl font-bold text-slate-800 mb-2">Non-Technical</div>
                <p className="text-sm text-slate-500">Aptitude, Reasoning & English</p>
              </button>

              <button 
                onClick={() => router.push("/student/practice-new/technical")}
                className="group bg-[#EFF5FB] hover:bg-indigo-50 p-8 rounded-2xl flex flex-col items-center text-center transition-all duration-300 border border-transparent hover:border-indigo-500/30 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="w-16 h-16 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-[0_4px_14px_rgba(99,102,241,0.4)] mb-6 group-hover:scale-110 transition-transform">
                  <FiLayers className="text-3xl" />
                </div>
                <div className="text-xl font-bold text-slate-800 mb-2">Technical</div>
                <p className="text-sm text-slate-500">Core CS subjects & theory</p>
              </button>

              <button 
                onClick={() => router.push("/student/practice-new/coding")}
                className="group bg-[#EFF5FB] hover:bg-emerald-50 p-8 rounded-2xl flex flex-col items-center text-center transition-all duration-300 border border-transparent hover:border-emerald-500/30 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-[0_4px_14px_rgba(16,185,129,0.4)] mb-6 group-hover:scale-110 transition-transform">
                  <FiCode className="text-3xl" />
                </div>
                <div className="text-xl font-bold text-slate-800 mb-2">Coding</div>
                <p className="text-sm text-slate-500">Programming challenges</p>
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
  );
}
