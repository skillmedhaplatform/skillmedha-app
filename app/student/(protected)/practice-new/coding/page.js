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
import CodingPracticeCard from "@/modules/student/components/CodingPracticeCard";
import PracticeBannerTabs from "../components/PracticeBannerTabs";
import { Divider, Result, Spin, Tooltip, message, Select, Dropdown, Modal } from "antd";
import { ListFilter, MonitorSmartphone } from "lucide-react";
import styles from "@/mobile_views/practice/mobilePracticeLayout.module.scss";

// --- GitHub-style Contribution Graph Component (Blue Light Theme) ---
const CodingContributionGraph = () => {
  const [heatmapData, setHeatmapData] = useState([]);
  const [monthLabels, setMonthLabels] = useState([]);
  const [streakStats, setStreakStats] = useState({ currentStreak: 0, maxStreak: 0, activeDays: 0 });
  const [totalSimulated, setTotalSimulated] = useState(0);
  const [rightColWidth, setRightColWidth] = useState(320);

  useEffect(() => {
    const updateLayout = () => {
      const width = window.innerWidth;
      if (width >= 1920) setRightColWidth(400);
      else if (width >= 1600) setRightColWidth(360);
      else if (width >= 1400) setRightColWidth(320);
      else setRightColWidth(290);
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, []);

  useEffect(() => {
    // 1. Fetch solved history dynamically from localStorage
    let history = [];
    try {
      history = JSON.parse(localStorage.getItem("solvedHistory") || "[]");
    } catch(e) {}
    
    const countsMap = {};
    history.forEach(item => {
      if (item.date) {
        const dateStr = item.date.split('T')[0];
        countsMap[dateStr] = (countsMap[dateStr] || 0) + 1;
      }
    });

    // Calculate Streaks
    let currentStreak = 0;
    let maxStreak = 0;
    
    const sortedDates = Object.keys(countsMap).sort();
    if (sortedDates.length > 0) {
      let tempStreak = 1;
      maxStreak = 1;
      for (let i = 1; i < sortedDates.length; i++) {
        const d1 = new Date(sortedDates[i-1]);
        const d2 = new Date(sortedDates[i]);
        const diffTime = Math.abs(d2 - d1);
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
          if (tempStreak > maxStreak) maxStreak = tempStreak;
        } else {
          tempStreak = 1;
        }
      }
      
      const today = new Date();
      today.setHours(0,0,0,0);
      
      let checkDate = new Date(today);
      let todayStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth()+1).padStart(2,'0')}-${String(checkDate.getDate()).padStart(2,'0')}`;
      
      if (!countsMap[todayStr]) {
        checkDate.setDate(checkDate.getDate() - 1);
        todayStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth()+1).padStart(2,'0')}-${String(checkDate.getDate()).padStart(2,'0')}`;
      }
      
      if (countsMap[todayStr]) {
        currentStreak = 1;
        while(true) {
          checkDate.setDate(checkDate.getDate() - 1);
          let prevStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth()+1).padStart(2,'0')}-${String(checkDate.getDate()).padStart(2,'0')}`;
          if (countsMap[prevStr]) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }

    // 2. Generate exactly current year (Jan 1 to Dec 31)
    const currentYear = new Date().getFullYear();
    const jan1 = new Date(currentYear, 0, 1);
    
    // Find the Sunday before or equal to Jan 1
    const startDate = new Date(jan1);
    startDate.setDate(jan1.getDate() - jan1.getDay());

    // Find the Saturday after or equal to Dec 31
    const dec31 = new Date(currentYear, 11, 31);
    const endDate = new Date(dec31);
    endDate.setDate(dec31.getDate() + (6 - dec31.getDay()));

    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const weeks = Math.ceil(diffDays / 7);
    const daysPerWeek = 7;

    const generatedData = [];
    let total = 0;
    let activeDaysCount = 0;
    
    const monthColumns = [];
    let currentMonthStr = "";

    for (let w = 0; w < weeks; w++) {
      const week = [];
      let weekAddedToMonth = false;
      for (let d = 0; d < daysPerWeek; d++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + (w * 7) + d);
        
        const isCurrentYear = currentDate.getFullYear() === currentYear;
        
        // Month label logic
        if (isCurrentYear) {
          const mStr = currentDate.toLocaleString('default', { month: 'short' });
          if (mStr !== currentMonthStr) {
            currentMonthStr = mStr;
            if (!weekAddedToMonth) {
              monthColumns.push({ month: mStr, colIndex: w });
              weekAddedToMonth = true;
            }
          }
        }
        
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        const count = isCurrentYear ? (countsMap[dateStr] || 0) : 0;
        week.push({ date: dateStr, count, isCurrentYear });
        
        if (isCurrentYear) {
          total += count;
          if (count > 0) activeDaysCount++;
        }
      }
      generatedData.push(week);
    }
    
    setHeatmapData(generatedData);
    setTotalSimulated(total);
    setMonthLabels(monthColumns);
    setStreakStats({ currentStreak, maxStreak, activeDays: activeDaysCount });
  }, []);
  
  // Dynamic color scaling as requested
  const getColor = (count) => {
    if (count === 0) return 'bg-[#ebedf0] border-[rgba(27,31,35,0.06)]'; // 1st box
    if (count <= 2) return 'bg-[#93c5fd] border-[rgba(27,31,35,0.06)]'; // 2nd box (1-2)
    if (count === 3) return 'bg-[#60a5fa] border-[rgba(27,31,35,0.06)]'; // 3rd box (3)
    if (count === 4) return 'bg-[#3b82f6] border-[rgba(27,31,35,0.06)]'; // 4th box (4)
    return 'bg-[#1d4ed8] border-[rgba(27,31,35,0.06)]'; // 5th box (5+)
  };

  return (
    <div className="w-full text-[#24292F] px-6 py-4 font-sans border-b border-[#e2e8f0]">
      <div className="w-full mx-auto">
        <div className="flex flex-col xl:flex-row gap-6 items-stretch w-full">
          
          {/* Left Side: Contribution Graph */}
          <div className="border border-[#d0d7de] rounded-md px-4 py-3 lg:px-5 lg:py-4 bg-white w-full xl:w-auto xl:flex-1 overflow-hidden shadow-sm flex flex-col">
            <h2 className="text-[16px] lg:text-[18px] font-semibold m-0 mb-2 text-gray-800">{totalSimulated} contributions in {new Date().getFullYear()}</h2>
          
          <div className="flex w-full overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            <div className="flex min-w-max mx-auto">
              {/* Day Labels */}
              <div className="flex flex-col gap-[4px] text-[12px] text-[#57606A] pr-3 pt-[20px]">
                <div className="h-[14px]"></div>
                <div className="h-[14px] leading-[14px]">Mon</div>
                <div className="h-[14px]"></div>
                <div className="h-[14px] leading-[14px]">Wed</div>
                <div className="h-[14px]"></div>
                <div className="h-[14px] leading-[14px]">Fri</div>
                <div className="h-[14px]"></div>
              </div>
              
              <div className="flex flex-col relative">
              {/* Month Labels aligned exactly to the columns */}
              <div className="relative h-[20px] text-[13px] text-[#57606A] mb-2 pl-1">
                {monthLabels.map((item, i) => (
                  <div 
                    key={i} 
                    className="absolute font-medium"
                    style={{ left: `${item.colIndex * 18}px` }}
                  >
                    {item.month}
                  </div>
                ))}
              </div>
              
              {/* Grid */}
              <div className="flex gap-[4px]">
                {heatmapData.map((week, wIndex) => (
                  <div key={wIndex} className="flex flex-col gap-[4px]">
                    {week.map((dayData, dIndex) => {
                      if (!dayData.isCurrentYear) {
                        return <div key={dIndex} className="w-[14px] h-[14px] rounded-[2px] border border-transparent bg-transparent" />;
                      }
                      return (
                        <div 
                          key={dIndex} 
                          className={`w-[14px] h-[14px] rounded-[2px] border ${getColor(dayData.count)} hover:ring-1 hover:ring-black transition-all cursor-pointer`}
                          title={`${dayData.count} submissions on ${dayData.date}`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-auto pt-2 border-t border-gray-100 text-[12px] text-[#57606A] gap-3">
            <div className="flex flex-col max-w-lg">
              <span className="font-semibold text-gray-700 text-[14px] mb-1">How it works</span>
              <span className="leading-relaxed">Darker boxes indicate more coding problems solved on that day. Keep practicing to build your streak!</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-medium">Less</span>
              <div className="flex gap-[4px] mx-1">
                <div className="w-[14px] h-[14px] rounded-[2px] border border-[rgba(27,31,35,0.06)] bg-[#ebedf0]"></div>
                <div className="w-[14px] h-[14px] rounded-[2px] border border-[rgba(27,31,35,0.06)] bg-[#93c5fd]"></div>
                <div className="w-[14px] h-[14px] rounded-[2px] border border-[rgba(27,31,35,0.06)] bg-[#60a5fa]"></div>
                <div className="w-[14px] h-[14px] rounded-[2px] border border-[rgba(27,31,35,0.06)] bg-[#3b82f6]"></div>
                <div className="w-[14px] h-[14px] rounded-[2px] border border-[rgba(27,31,35,0.06)] bg-[#1d4ed8]"></div>
              </div>
              <span className="font-medium">More</span>
            </div>
          </div>
          </div>
          
          {/* Right Side: Consistency & Streak Board */}
          <div 
            className="w-full hidden xl:flex flex-col shrink-0"
            style={{ width: `${rightColWidth}px` }}
          >
            <div className="bg-white rounded-md border border-[#d0d7de] p-4 shadow-sm h-full flex flex-col">
              <h3 className="text-[16px] font-bold text-gray-800 mb-3 flex items-center gap-2 shrink-0">
                <span className="text-xl">🏆</span> Consistency Board
              </h3>
              
              <div className="flex flex-col gap-3 flex-1 justify-center">
                {/* Current Streak */}
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-orange-50 border border-orange-100 transition-all hover:shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 text-lg">
                      🔥
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[12px] font-semibold text-orange-600/80 uppercase tracking-wide">Current Streak</span>
                      <span className="text-[16px] font-bold text-gray-800">{streakStats.currentStreak} Days</span>
                    </div>
                  </div>
                </div>

                {/* Longest Streak */}
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-blue-50 border border-blue-100 transition-all hover:shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 text-lg">
                      🚀
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[12px] font-semibold text-blue-600/80 uppercase tracking-wide">Longest Streak</span>
                      <span className="text-[16px] font-bold text-gray-800">{streakStats.maxStreak} Days</span>
                    </div>
                  </div>
                </div>

                {/* Total Active Days */}
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-100 transition-all hover:shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500 text-lg">
                      📅
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[12px] font-semibold text-emerald-600/80 uppercase tracking-wide">Active Days ({new Date().getFullYear()})</span>
                      <span className="text-[16px] font-bold text-gray-800">{streakStats.activeDays} Days</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};


export default function CodingPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const currPath = usePathname();
  const searchParams = useSearchParams();
  const subjects = useSelector((s) => s.practice.subjects);
  const studentCreds = useSelector((state) => state.student.student?.data);
  const [loading, setLoading] = useState(false);
  const [activeSort, setActiveSort] = useState("Default");
  const [searchTerm, setSearchTerm] = useState("");
  const [solvedPerSubject, setSolvedPerSubject] = useState({});
  const [mobileBlockModal, setMobileBlockModal] = useState({ visible: false });
  const [columns, setColumns] = useState(3);

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width >= 1920) setColumns(6);
      else if (width >= 1600) setColumns(5);
      else if (width >= 1024) setColumns(4);
      else if (width >= 768) setColumns(2);
      else setColumns(1);
    };
    
    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  const categoryTabs = [
    { name: "Non-Technical", path: "/student/practice-new/nontechnical" },
    { name: "Technical", path: "/student/practice-new/technical" },
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
    
    // Load local dynamic solved count per subject
    if (typeof window !== "undefined") {
      const stored = JSON.parse(localStorage.getItem("solvedPerSubject") || "{}");
      setSolvedPerSubject(stored);
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


  const dynamicSubtitle = subjects?.map(s => s.title).join(" • ") || "Master your programming skills with our coding challenges.";
  const totalTopics = subjects?.length || 0;
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

  let filteredSubjects = (subjects || []).filter(subject => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const title = (subject.title || subject.key || "").toLowerCase();
    return title.includes(term);
  });

  if (activeSort === "A-Z") {
    filteredSubjects.sort((a, b) => (a.title || a.key || "").localeCompare(b.title || b.key || ""));
  } else if (activeSort === "a-z") {
    filteredSubjects.sort((a, b) => (b.title || b.key || "").localeCompare(a.title || a.key || ""));
  }

  return (
    <>
      <div className="flex flex-col h-full overflow-hidden bg-[#EFF5FB]">
        <div className="flex-shrink-0 bg-[#EFF5FB] shadow-sm">
          <StudentPageHeader 
            title={
              <div className="flex items-center gap-3">
                <span>Practice</span>
                <div className="sm:hidden -mt-1">
                  <PracticeBannerTabs />
                </div>
              </div>
            }
            subtitleSlot={<div className="hidden sm:block"><PracticeBannerTabs /></div>}
            rightSlot={RightStats}
          />
          <div className="w-full relative z-[45]">
          
            {/* Dynamic Search Bar & Filter Section */}
            <div className="px-4 lg:px-8 py-3 bg-white border-b border-[#e2e8f0]">
              <div className="flex flex-row justify-between items-center gap-2 sm:gap-4">
                <div className="relative flex-1 sm:max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E69DA] focus:border-[#1E69DA] sm:text-sm transition-all shadow-sm"
                    placeholder="Search coding subjects dynamically..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-center w-auto shrink-0 bg-transparent px-0 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:border sm:border-gray-200 shadow-none">
                  <Dropdown 
                    menu={{ 
                      items: [
                        { key: 'Default', label: 'Default' },
                        { key: 'A-Z', label: 'A-Z' },
                        { key: 'a-z', label: 'a-z' }
                      ],
                      onClick: (e) => setActiveSort(e.key) 
                    }} 
                    trigger={['click']}
                  >
                    <div className="sm:hidden flex items-center justify-center cursor-pointer p-2 bg-white border border-gray-300 rounded-lg shadow-sm">
                      <ListFilter className="w-5 h-5 text-gray-600" />
                    </div>
                  </Dropdown>
                  
                  <div className="hidden sm:flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-gray-500 whitespace-nowrap">Sort by:</span>
                    <Select
                      value={activeSort}
                      onChange={(value) => setActiveSort(value)}
                      bordered={false}
                      className="!text-[14px] !font-bold"
                      style={{ minWidth: 100 }}
                      options={[
                        { value: 'Default', label: 'Default' },
                        { value: 'A-Z', label: 'A-Z' },
                        { value: 'a-z', label: 'a-z' }
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`bg-[#EFF5FB] flex-1 overflow-y-auto`}>
          <div className="hidden sm:block">
            <CodingContributionGraph />
          </div>
          {filteredSubjects && filteredSubjects.length > 0 ? (
          <div className="px-4 lg:px-8 pt-4 pb-6">
            <AnimatePresence mode="wait">
              <motion.div 
                key={searchTerm}
              className="grid gap-4 md:gap-6"
              style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {filteredSubjects.map((subject, index) => (
                <CodingPracticeCard 
                  key={subject._id || index}
                  title={subject.title || subject.key}
                  category="CODING"
                  totalQuestions={subject.totalQuestions || 0}
                  solvedCount={solvedPerSubject[subject._id] || 0}
                  onStart={() => {
                    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
                    const isMobileAgent = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
                    
                    if (isMobileAgent) {
                      setMobileBlockModal({ visible: true });
                    } else {
                      router.push(`/student/practice-new/coding/problems?subjectId=${subject._id}&title=${subject.title || subject.key}`);
                    }
                  }}
                  onSolveNow={() => {
                    router.push(`/student/practice-new/coding/workspace?subjectId=${subject._id}&title=${encodeURIComponent(subject.title || subject.key)}`);
                  }}
                />
              ))}
            </motion.div>
          </AnimatePresence>
          </div>
          ) : (
            <div className="py-10">
              <Result
                status="404"
                title="No Subjects Found"
                subTitle="Sorry, there are no subjects available for this topic right now."
              />
            </div>
          )}
        </div>
      </div>
      
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-800">
            <MonitorSmartphone className="text-blue-500" size={20} />
            <span>Desktop View Required</span>
          </div>
        }
        open={mobileBlockModal.visible}
        onCancel={() => setMobileBlockModal({ visible: false })}
        footer={null}
        centered
        width={400}
      >
        <div className="text-slate-600 mt-4 leading-relaxed">
          <p className="mb-4">
            You can view the coding problems on this mobile device by switching your browser to <strong>"Desktop Site"</strong> or <strong>"Desktop Mode"</strong>.
          </p>
          <p className="mb-4">
            However, please note that you <strong>cannot attempt or write code</strong> on a mobile or tablet device.
          </p>
          <p>
            To fully attempt the problems, you must log in from a physical desktop or laptop computer.
          </p>
          <button 
            className="w-full mt-6 py-2.5 bg-blue-50 text-blue-600 font-bold rounded-lg hover:bg-blue-100 transition-colors"
            onClick={() => setMobileBlockModal({ visible: false })}
          >
            Got it
          </button>
        </div>
      </Modal>
    </>
  );
}
