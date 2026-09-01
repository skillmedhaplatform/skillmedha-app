"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchCompanyTests } from "@/redux/slices/admin/cms/practiceSlice";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";
import PracticeFilters from "@/modules/student/components/PracticeFilters";
import CompanyTestCard from "@/modules/student/components/CompanyTestCard";
import { Skeleton, Modal, Input, Button, Dropdown } from "antd";
import { PlayCircleOutlined, LineChartOutlined, ArrowLeftOutlined, ClockCircleOutlined, QuestionCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, DownOutlined, InfoCircleOutlined } from "@ant-design/icons";

export default function CompanyWisePage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const { companyTests = [], status } = useSelector((state) => state.adminPractice);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [modalState, setModalState] = useState("INITIAL"); // INITIAL, FORM, RESULTS
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [pastAttempts, setPastAttempts] = useState([]);
  const [fullScreenResultIdx, setFullScreenResultIdx] = useState(null);
  const [selectedSectionFilter, setSelectedSectionFilter] = useState("All");
  const handleCardClick = async (test) => {
    setSelectedTest(test);
    setModalState("INITIAL");
    setPastAttempts([]);
    setIsModalOpen(true);

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token") || "";
      const restUrl = process.env.NEXT_PUBLIC_REST_API_URL;
      const res = await fetch(`${restUrl}/student/practice/top-scores/${test.id}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data && data.data) {
        setPastAttempts(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleStartTestClick = () => {
    setModalState("FORM");
  };

  const handleViewResultClick = () => {
    setModalState("RESULTS");
  };

  const handleFormSubmit = () => {
    setNameError("");
    setEmailError("");
    let isValid = true;
    
    if (!name || name.trim().length <= 3) {
      setNameError("Name must be more than 3 characters long.");
      isValid = false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setEmailError("Please enter a valid email address.");
      isValid = false;
    }

    if (isValid) {
      sessionStorage.setItem('current_mock_user', JSON.stringify({ name, email }));
      sessionStorage.removeItem(`active_test_${selectedTest.id}`);
      router.push(`/student/practice-new/company-wise/${selectedTest.id}`);
    }
  };

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
    <div className="flex flex-col bg-[#EFF5FB]">
      <div className="flex-shrink-0 bg-[#EFF5FB] shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative z-10">
        <StudentPageHeader
          title="Train for the company that's hiring you"
          subtitle="Pattern, sections and question mix match the real drive"
        />
        <PracticeFilters
          categories={filterCategories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          leftSlot={
            <button 
              onClick={() => router.push('/student/practice-new')}
              className="group flex items-center gap-2 px-3 py-1.5 bg-transparent rounded-lg text-[13px] font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all duration-300 cursor-pointer"
            >
              <ArrowLeftOutlined className="transition-transform duration-300 group-hover:-translate-x-0.5" />
              Back
            </button>
          }
        />
      </div>

      <div className="flex-1 px-4 lg:px-8 py-8">
        <div className="max-w-[1400px] mx-auto">

          {status === 'loading' ? (
            <div className="text-center py-10 text-gray-500">Loading company tests...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTests.map((test) => (
                <div key={test.id} className="h-full">
                  <CompanyTestCard
                    companyData={test}
                    onStartTest={() => handleCardClick(test)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>


      <Modal
        open={isModalOpen}
        onCancel={() => { setIsModalOpen(false); setModalState("INITIAL"); }}
        footer={null}
        closable={modalState === "INITIAL"}
        width={modalState === "RESULTS" ? 800 : (modalState === "FORM" ? 850 : 650)}
        wrapClassName="backdrop-blur-sm"
        centered
        destroyOnClose
      >
        {modalState === "INITIAL" && selectedTest && (
          <div className="flex flex-col gap-6 py-4 px-2">
            <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">{selectedTest.name} Assessment</h2>
            <div className="grid grid-cols-2 gap-6">
              
              {/* Start Test Card */}
              <div className="flex flex-col rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-gray-100 bg-white">
                <div className="bg-[#EAB308] p-6">
                  <h3 className="text-white font-bold text-xl m-0">Start Test</h3>
                </div>
                <div className="p-6 flex flex-col gap-5 flex-1">
                  <p className="text-slate-600 font-medium text-sm m-0 leading-relaxed min-h-[40px]">
                    Begin your mock assessment to evaluate your skills with our curated test pattern.
                  </p>
                  <div className="flex flex-col gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 border border-slate-100">
                        <QuestionCircleOutlined className="text-xs" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{selectedTest.questionCount || 0} Questions</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 border border-slate-100">
                        <ClockCircleOutlined className="text-xs" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{selectedTest.timeLimit || 0} Minutes</span>
                    </div>
                  </div>
                  <button 
                    onClick={handleStartTestClick}
                    className="mt-auto w-full py-3 bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold rounded-xl transition-colors cursor-pointer border-none"
                  >
                    Start Test
                  </button>
                </div>
              </div>

              {/* View Result Card */}
              <div className="flex flex-col rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-gray-100 bg-white">
                <div className="bg-[#EF4444] p-6">
                  <h3 className="text-white font-bold text-xl m-0">View Results</h3>
                </div>
                <div className="p-6 flex flex-col gap-5 flex-1 relative">
                  <p className="text-slate-600 font-medium text-sm m-0 leading-relaxed min-h-[40px]">
                    Review your past performance and check detailed explanations for your answers.
                  </p>
                  <div className="flex flex-col gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 border border-slate-100">
                        <CheckCircleOutlined className="text-xs" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{pastAttempts.length} Attempts</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => pastAttempts.length > 0 ? handleViewResultClick() : null}
                    disabled={pastAttempts.length === 0}
                    className="mt-auto w-full py-3 bg-[#0F172A] hover:bg-[#1E293B] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors cursor-pointer border-none"
                  >
                    {pastAttempts.length > 0 ? "View Results" : "No Attempts Yet"}
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {modalState === "FORM" && (
          <div className="flex flex-col md:flex-row min-h-[480px] -mx-6 -my-6 bg-white">
            
            {/* Left Sidebar - Visual/Branding */}
            <div className="hidden md:flex md:w-[320px] bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 p-8 flex-col justify-between relative overflow-hidden text-white shrink-0">
              {/* Decorative Background Elements */}
              <div className="absolute -top-16 -left-16 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-10 -right-10 w-40 h-40 bg-pink-500/20 rounded-full blur-2xl"></div>
              <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-blue-400/20 rounded-full blur-xl"></div>
              
              <div className="relative z-10 flex flex-col items-start">
                <button 
                  onClick={() => setModalState("INITIAL")}
                  className="mb-8 w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/20 text-white cursor-pointer transition-colors backdrop-blur-sm"
                >
                  <ArrowLeftOutlined />
                </button>
                <div className="bg-white/20 px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase mb-4 backdrop-blur-md border border-white/10">
                  Ready to start
                </div>
                <h2 className="text-3xl font-bold m-0 leading-tight !border-none !pb-0 no-underline decoration-transparent">Prepare for Success.</h2>
                <p className="text-white/80 text-sm mt-4 leading-relaxed">
                  Enter your details to generate your personalized test session. Your progress will be saved automatically.
                </p>
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 text-white/60 text-xs font-semibold uppercase tracking-wider">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                  System Ready
                </div>
              </div>
            </div>

            {/* Right Side - Form Container */}
            <div className="flex-1 p-8 sm:p-10 flex flex-col justify-center relative">
              <div className="md:hidden mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
                <button 
                  onClick={() => setModalState("INITIAL")}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 cursor-pointer transition-colors"
                >
                  <ArrowLeftOutlined />
                </button>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 m-0">Student Details</h2>
                  <p className="text-sm text-slate-500 m-0">Enter details to begin</p>
                </div>
              </div>

              <div className="hidden md:block mb-8">
                <h2 className="text-2xl font-bold text-slate-800 m-0 mb-1">Student Details</h2>
                <p className="text-slate-500 text-sm m-0">We just need a couple details to configure your exam.</p>
              </div>
              
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-[12px] text-slate-500 uppercase tracking-widest">
                    Full Name
                  </label>
                  <Input 
                    size="large" 
                    placeholder="e.g. John Doe" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    status={nameError ? "error" : ""}
                    className="rounded-xl px-4 py-3.5 bg-slate-50 border-slate-200 hover:border-indigo-400 focus:border-indigo-500 focus:bg-white transition-all text-[15px] font-medium shadow-sm"
                    suffix={
                      name.length > 0 ? (
                        name.trim().length > 3 
                          ? <CheckCircleOutlined style={{ color: '#22c55e', fontSize: '18px' }} /> 
                          : <CloseCircleOutlined style={{ color: '#ef4444', fontSize: '18px' }} />
                      ) : <span style={{ display: 'inline-block', width: '18px' }} />
                    }
                  />
                  {nameError && <span className="text-red-500 text-xs font-medium">{nameError}</span>}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-bold text-[12px] text-slate-500 uppercase tracking-widest">
                    Email Address
                  </label>
                  <Input 
                    size="large" 
                    placeholder="e.g. john@example.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    status={emailError ? "error" : ""}
                    className="rounded-xl px-4 py-3.5 bg-slate-50 border-slate-200 hover:border-indigo-400 focus:border-indigo-500 focus:bg-white transition-all text-[15px] font-medium shadow-sm"
                    suffix={
                      email.length > 0 ? (
                        /^\S+@\S+\.\S+$/.test(email)
                          ? <CheckCircleOutlined style={{ color: '#22c55e', fontSize: '18px' }} /> 
                          : <CloseCircleOutlined style={{ color: '#ef4444', fontSize: '18px' }} />
                      ) : <span style={{ display: 'inline-block', width: '18px' }} />
                    }
                  />
                  {emailError && <span className="text-red-500 text-xs font-medium">{emailError}</span>}
                </div>

                <button 
                  onClick={handleFormSubmit}
                  className="mt-6 w-full py-4 bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold rounded-xl transition-all shadow-[0_4px_14px_rgba(15,23,42,0.25)] hover:shadow-[0_6px_20px_rgba(15,23,42,0.4)] hover:-translate-y-0.5 border-none cursor-pointer text-[15px]"
                >
                  Begin Assessment
                </button>
              </div>
            </div>
          </div>
        )}

        {modalState === "RESULTS" && (
          <div className="flex flex-col py-4 h-[600px] overflow-hidden">
            <div className="flex items-center gap-3 mb-6 shrink-0">
              <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => setModalState("INITIAL")} />
              <h2 className="text-xl font-bold text-slate-800 m-0">Past Results</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-6">
              {pastAttempts.length > 0 && (
                <>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-[-8px]">Top 3 Attempts</div>
                  {pastAttempts.slice(0, 3).map((attempt, arrIdx) => {
                    const originalIdx = arrIdx;
                    const totalQuestions = attempt.qaPairs.length;
                    const correctCount = attempt.qaPairs.filter(qa => qa.isCorrect).length;
                    const percentage = Math.round((correctCount / totalQuestions) * 100) || 0;
                    
                    return (
                      <div key={attempt.id || arrIdx} className="shrink-0 bg-white border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 shadow-sm hover:border-indigo-400 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                        <div 
                          className="px-5 py-5 cursor-pointer flex items-center justify-between transition-colors bg-white hover:bg-indigo-50/30"
                          onClick={() => {
                            setIsModalOpen(false);
                            setFullScreenResultIdx(originalIdx);
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg shadow-inner">
                              {originalIdx + 1}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 text-lg">Attempt {originalIdx + 1}</div>
                              <div className="text-sm text-slate-500 font-medium">{new Date(attempt.timestamp).toLocaleString()}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <div className="text-2xl font-black text-slate-800 tracking-tight">{correctCount} <span className="text-sm text-slate-400 font-semibold">/ {totalQuestions}</span></div>
                              <div className={`text-xs font-bold uppercase tracking-wider mt-0.5 ${percentage >= 70 ? 'text-emerald-500' : percentage >= 40 ? 'text-amber-500' : 'text-red-500'}`}>
                                {percentage}% Score
                              </div>
                            </div>
                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-50 text-indigo-600 transition-transform duration-300 group-hover:translate-x-1">
                              <ArrowLeftOutlined className="text-[16px] rotate-180" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {pastAttempts.length > 3 && (
                    <>
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-2 mt-4 mb-[-8px]">Other Attempts</div>
                      {pastAttempts.slice(3).map((attempt, arrIdx) => {
                        const originalIdx = arrIdx + 3;
                        const totalQuestions = attempt.qaPairs.length;
                        const correctCount = attempt.qaPairs.filter(qa => qa.isCorrect).length;
                        const percentage = Math.round((correctCount / totalQuestions) * 100) || 0;
                        
                        return (
                          <div key={attempt.id || arrIdx} className="shrink-0 bg-white border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 shadow-sm hover:border-slate-400 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                            <div 
                              className="px-5 py-5 cursor-pointer flex items-center justify-between transition-colors bg-white hover:bg-slate-50"
                              onClick={() => {
                                setIsModalOpen(false);
                                setFullScreenResultIdx(originalIdx);
                              }}
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-lg shadow-inner">
                                  {originalIdx + 1}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-800 text-lg">Attempt {originalIdx + 1}</div>
                                  <div className="text-sm text-slate-500 font-medium">{new Date(attempt.timestamp).toLocaleString()}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-6">
                                <div className="text-right">
                                  <div className="text-2xl font-black text-slate-800 tracking-tight">{correctCount} <span className="text-sm text-slate-400 font-semibold">/ {totalQuestions}</span></div>
                                  <div className={`text-xs font-bold uppercase tracking-wider mt-0.5 ${percentage >= 70 ? 'text-emerald-500' : percentage >= 40 ? 'text-amber-500' : 'text-red-500'}`}>
                                    {percentage}% Score
                                  </div>
                                </div>
                                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 text-slate-500 transition-transform duration-300 group-hover:translate-x-1">
                                  <ArrowLeftOutlined className="text-[16px] rotate-180" />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Full Screen Results Overlay */}
      {fullScreenResultIdx !== null && pastAttempts[fullScreenResultIdx] && (() => {
        const attempt = pastAttempts[fullScreenResultIdx];
        const totalQuestions = attempt.qaPairs.length;
        const correctCount = attempt.qaPairs.filter(qa => qa.isCorrect).length;
        const percentage = Math.round((correctCount / totalQuestions) * 100) || 0;

        const sectionStats = attempt.qaPairs.reduce((acc, qa) => {
          let sectionName = qa.section;
          if (!sectionName && qa.raw) {
            const rawStr = qa.raw.sectionName || qa.raw.subjectName || "General";
            sectionName = rawStr.split(" - ")[0].trim();
          }
          sectionName = sectionName || "General";

          if (!acc[sectionName]) acc[sectionName] = { total: 0, correct: 0, wrong: 0, unanswered: 0, qaList: [] };
          
          acc[sectionName].total += 1;
          acc[sectionName].qaList.push(qa);
          
          const studentAnsText = typeof qa.studentAnswer === 'object' && qa.studentAnswer !== null ? JSON.stringify(qa.studentAnswer) : (qa.studentAnswer || "Not Answered");
          const isUnanswered = studentAnsText === "Not Answered" || !qa.studentAnswer;
          
          if (qa.isCorrect) acc[sectionName].correct += 1;
          else if (isUnanswered) acc[sectionName].unanswered += 1;
          else acc[sectionName].wrong += 1;
          
          return acc;
        }, {});

        const allSections = Object.keys(sectionStats);
        
        const overallStats = {
          total: totalQuestions,
          correct: correctCount,
          wrong: attempt.qaPairs.filter(qa => {
            const studentAnsText = typeof qa.studentAnswer === 'object' && qa.studentAnswer !== null ? JSON.stringify(qa.studentAnswer) : (qa.studentAnswer || "Not Answered");
            return !qa.isCorrect && studentAnsText !== "Not Answered" && qa.studentAnswer;
          }).length,
          unanswered: attempt.qaPairs.filter(qa => {
            const studentAnsText = typeof qa.studentAnswer === 'object' && qa.studentAnswer !== null ? JSON.stringify(qa.studentAnswer) : (qa.studentAnswer || "Not Answered");
            return studentAnsText === "Not Answered" || !qa.studentAnswer;
          }).length,
          qaList: attempt.qaPairs
        };

        const displayStats = selectedSectionFilter === "All" ? overallStats : sectionStats[selectedSectionFilter];

        return (
          <div className="fixed inset-0 z-[2000] bg-slate-50 flex flex-col overflow-hidden">
            {/* Unified Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-3 flex flex-col xl:flex-row xl:items-center justify-between gap-4 shadow-sm shrink-0 z-20 relative">
              {/* Left: Title & Back */}
              <div className="flex items-center gap-4 shrink-0">
                <Button 
                  type="text" 
                  icon={<ArrowLeftOutlined />} 
                  onClick={() => {
                    setFullScreenResultIdx(null);
                    setIsModalOpen(true);
                    setModalState("RESULTS");
                    setSelectedSectionFilter("All");
                  }} 
                  className="flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-full w-10 h-10 border-none shadow-inner shrink-0"
                />
                <div>
                  <h1 className="text-xl font-black text-slate-800 m-0 tracking-tight flex items-center gap-2 border-none pb-0">
                    {selectedTest?.title || selectedTest?.companyName || "Exam"}
                  </h1>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest m-0 mt-0.5 whitespace-nowrap">Attempt {fullScreenResultIdx + 1} &bull; {new Date(attempt.timestamp).toLocaleString()}</p>
                </div>
              </div>
              
              {/* Center: Tabs & Category Stats */}
              <div className="flex flex-col xl:flex-row items-center gap-4 xl:gap-8 flex-1 justify-center px-4 w-full xl:w-auto">
                {/* Interactive Category Filter Dropdown */}
                <div className="flex items-center gap-2 shrink-0">
                  <Dropdown 
                    menu={{ 
                      items: [
                        { key: "All", label: "All Sections" },
                        ...allSections.map(sec => ({ key: sec, label: sec }))
                      ], 
                      onClick: (e) => setSelectedSectionFilter(e.key) 
                    }} 
                    trigger={['hover']} 
                    placement="bottom"
                  >
                    <button className="px-5 py-2 rounded-full font-bold text-[13px] bg-indigo-600 text-white flex items-center gap-2 shadow-sm transition-all hover:bg-indigo-700 cursor-pointer border-none outline-none whitespace-nowrap">
                      {selectedSectionFilter === "All" ? "All Sections" : selectedSectionFilter} <DownOutlined className="text-[10px]" />
                    </button>
                  </Dropdown>
                </div>

                <div className="hidden xl:block w-px h-8 bg-slate-200 shrink-0"></div>

                {/* Display Stats for selected category */}
                <div className="flex items-center gap-5 shrink-0">
                  <div className="flex flex-col min-w-fit items-center">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 whitespace-nowrap">Total Questions</div>
                    <div className="text-[20px] font-black text-slate-800 leading-none">{displayStats.total}</div>
                  </div>
                  <div className="w-px h-6 bg-slate-200 shrink-0"></div>
                  <div className="flex flex-col min-w-fit items-center">
                    <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-0.5 whitespace-nowrap">Correct Answers</div>
                    <div className="text-[20px] font-black text-emerald-600 leading-none">{displayStats.correct}</div>
                  </div>
                  <div className="w-px h-6 bg-slate-200 shrink-0"></div>
                  <div className="flex flex-col min-w-fit items-center">
                    <div className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-0.5 whitespace-nowrap">Wrong Answers</div>
                    <div className="text-[20px] font-black text-rose-600 leading-none">{displayStats.wrong}</div>
                  </div>
                  <div className="w-px h-6 bg-slate-200 shrink-0"></div>
                  <div className="flex flex-col min-w-fit items-center">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 whitespace-nowrap">Unanswered</div>
                    <div className="text-[20px] font-black text-slate-600 leading-none">{displayStats.unanswered}</div>
                  </div>
                </div>
              </div>

              {/* Right: Candidate & Score */}
              <div className="flex items-center gap-6 shrink-0 justify-end xl:w-auto w-full">
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Candidate</div>
                      <div className="text-[15px] font-bold text-slate-800">{attempt.user?.name || "Student"}</div>
                    </div>
                  </div>
                  <div className="h-10 w-px bg-gray-200 hidden sm:block"></div>
                  <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 px-5 py-2 rounded-xl shadow-inner">
                    <div className="text-right">
                      <div className="text-2xl font-black text-slate-800 tracking-tight">{correctCount} <span className="text-sm text-slate-400 font-semibold">/ {totalQuestions}</span></div>
                    </div>
                    <div className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${percentage >= 70 ? 'bg-emerald-100 text-emerald-700' : percentage >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                      {percentage}% Score
                    </div>
                  </div>
                </div>
              </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 w-full relative bg-slate-50">
              <div className="max-w-[90rem] mx-auto flex flex-col gap-8 pb-20">
                {(() => {
                  return (
                    <>
                      {/* Section Questions */}
                      <div className="flex flex-col gap-8">
                        {displayStats.qaList.map((qa, qIdx) => {
                  let parsedActualAnswer = qa.actualAnswer;
                  if (typeof parsedActualAnswer === 'string' && parsedActualAnswer.startsWith('{')) {
                    try {
                      parsedActualAnswer = JSON.parse(parsedActualAnswer);
                    } catch (e) {}
                  }

                  let actualAnsText = typeof qa.actualAnswer === 'object' && qa.actualAnswer !== null ? JSON.stringify(qa.actualAnswer) : (qa.actualAnswer || "N/A");
                  let actualExplanation = qa.explanation;

                  if (typeof parsedActualAnswer === 'object' && parsedActualAnswer !== null) {
                    if (parsedActualAnswer.multipleChoice) {
                       actualAnsText = Object.keys(parsedActualAnswer.multipleChoice).filter(k => parsedActualAnswer.multipleChoice[k]).join(", ");
                    } else if (parsedActualAnswer.singleChoice) {
                       if (typeof parsedActualAnswer.singleChoice === 'object') {
                          actualAnsText = Object.keys(parsedActualAnswer.singleChoice).filter(k => parsedActualAnswer.singleChoice[k]).join(", ");
                       } else {
                          actualAnsText = parsedActualAnswer.singleChoice;
                       }
                    } else if (parsedActualAnswer.answer) {
                       actualAnsText = parsedActualAnswer.answer;
                    }
                    if (typeof actualExplanation === 'string' && actualExplanation.trim() === '') actualExplanation = null;
                    if (!actualExplanation && parsedActualAnswer.explanation) {
                       actualExplanation = parsedActualAnswer.explanation;
                    }
                  }

                  const studentAnsText = typeof qa.studentAnswer === 'object' && qa.studentAnswer !== null ? JSON.stringify(qa.studentAnswer) : (qa.studentAnswer || "Not Answered");
                  const isUnanswered = studentAnsText === "Not Answered" || !qa.studentAnswer;

                  return (
                  <div key={qIdx} className="relative flex flex-col gap-4 bg-white p-8 rounded-2xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${isUnanswered ? 'bg-slate-300' : qa.isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                    
                    <div className="flex items-start gap-6">
                      <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center font-bold text-lg shadow-sm ${isUnanswered ? 'bg-slate-100 text-slate-500 border border-slate-200' : qa.isCorrect ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 'bg-rose-100 text-rose-600 border border-rose-200'}`}>
                        {qIdx + 1}
                      </div>
                      <div className="flex-1 w-full overflow-hidden">
                        <div className="font-semibold text-lg text-slate-800 leading-relaxed mb-6 pt-1">
                          <span dangerouslySetInnerHTML={{ __html: typeof qa.question === 'string' ? qa.question : (qa.question?.text || JSON.stringify(qa.question)) }} />
                        </div>
                        
                        {(() => {
                          let derivedOptions = qa.options || [];
                          if (!derivedOptions || derivedOptions.length === 0) {
                            if (qa.raw?.options && qa.raw.options.length > 0) derivedOptions = qa.raw.options;
                            else if (qa.raw?.content?.options && qa.raw.content.options.length > 0) derivedOptions = qa.raw.content.options;
                            else if (qa.question?.options && qa.question.options.length > 0) derivedOptions = qa.question.options;
                            
                            if (!derivedOptions || derivedOptions.length === 0) {
                              try {
                                const sessionData = JSON.parse(sessionStorage.getItem(`active_test_${selectedTest?.id}`) || "{}");
                                if (sessionData && sessionData.questions) {
                                  const originalQ = sessionData.questions.find(q => q.id === qa.id);
                                  if (originalQ && originalQ.options && originalQ.options.length > 0) {
                                    derivedOptions = originalQ.options;
                                  }
                                }
                              } catch(e) {}
                            }
                          }
                          if ((!derivedOptions || derivedOptions.length === 0) && typeof parsedActualAnswer === 'object' && parsedActualAnswer !== null) {
                            if (parsedActualAnswer.multipleChoice) {
                              derivedOptions = Object.keys(parsedActualAnswer.multipleChoice);
                            } else if (parsedActualAnswer.singleChoice && typeof parsedActualAnswer.singleChoice === 'object') {
                              derivedOptions = Object.keys(parsedActualAnswer.singleChoice);
                            }
                          }

                          return derivedOptions && derivedOptions.length > 0 && (
                          <div className="flex flex-col gap-3 mb-6">
                            {derivedOptions.map((opt, oIdx) => (
                              <div key={oIdx} className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-md flex items-center justify-center font-bold text-sm bg-slate-100 text-slate-500 shrink-0">
                                  {String.fromCharCode(65 + oIdx)}
                                </div>
                                <span className="font-medium text-[16px] text-slate-700 pt-1">{opt}</span>
                              </div>
                            ))}
                          </div>
                          );
                        })()}
                        
                        <div className="flex flex-col sm:flex-row gap-5">
                          <div className="flex-1 bg-slate-50 p-6 rounded-xl border border-slate-200/60 relative overflow-hidden shadow-sm">
                            <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Your Answer</span>
                            <span className={`font-semibold text-lg block ${isUnanswered ? 'text-slate-500 italic' : qa.isCorrect ? 'text-emerald-600' : 'text-rose-500'}`}>
                              {studentAnsText}
                            </span>
                          </div>
                          <div className="flex-1 bg-indigo-50/50 p-6 rounded-xl border border-indigo-100/60 relative overflow-hidden shadow-sm">
                            <span className="text-[12px] font-bold text-indigo-400 uppercase tracking-widest block mb-3">Correct Answer</span>
                            <span className="font-semibold text-indigo-700 text-lg block">{actualAnsText}</span>
                          </div>
                        </div>
                        
                        {actualExplanation && (
                          <div className="mt-8 bg-amber-50/50 p-6 rounded-xl border border-amber-100/60 text-amber-900 text-[15px] shadow-sm">
                            <span className="font-bold block mb-3 text-amber-700 flex items-center gap-2 uppercase tracking-widest text-[12px]">
                              <InfoCircleOutlined className="text-[16px]" /> Explanation
                            </span>
                            <span dangerouslySetInnerHTML={{ __html: typeof actualExplanation === 'string' ? actualExplanation : (actualExplanation?.explanation || JSON.stringify(actualExplanation)) }} className="leading-relaxed block text-amber-800/90" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  );
                })}
                        </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
