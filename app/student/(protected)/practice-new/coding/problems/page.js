"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Breadcrumb, message, Spin, Checkbox, Button, Pagination, Popover } from "antd";
import { TbTarget, TbTrophy, TbBadge, TbChevronRight } from "react-icons/tb";
import { BsStar, BsSearch, BsSortDown, BsFilter, BsExclamationCircle, BsCheckCircleFill } from "react-icons/bs";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { restUrl } from "@/config/urls";
import { getLstorage } from "@/utils/universalUtils/windowMW";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";
import CodingBadge from "@/modules/student/components/CodingBadge";

// Helper to extract text from HTML
const getTextFromHtml = (html) => {
  if (typeof window === "undefined" || typeof html !== "string") return "";
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return (tmp.textContent || tmp.innerText || "").replace(/\s+/g, " ").replace(/\|/g, "").trim();
};

export default function ProblemList() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const subjectId = searchParams.get("subjectId");
  const topicId = searchParams.get("t");
  const title = searchParams.get("title");

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [solvedState, setSolvedState] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showLevelUp, setShowLevelUp] = useState(false);

  // Filter States
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState([]);
  const [selectedPoints, setSelectedPoints] = useState([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    // Load solved problems from localStorage safely
    let solved = [];
    try {
      const parsed = JSON.parse(localStorage.getItem("solvedProblems") || "[]");
      if (Array.isArray(parsed)) solved = parsed;
    } catch (e) {
      console.error("Failed to parse solved problems");
    }
    setSolvedState(solved);

    if (!subjectId && !topicId) return;

    const fetchQuestions = async () => {
      try {
        const query = subjectId ? `?subjectId=${subjectId}` : `?topicId=${topicId}`;
        const res = await axios.get(`${restUrl}/getpracquestions${query}`, {
          headers: { Authorization: `Bearer ${getLstorage("token")}` }
        });

        let codingQs = res.data?.data || [];

        // Sort by difficulty (Easy -> Medium -> Hard -> Expert)
        const difficultyRank = {
          easy: 1,
          medium: 2,
          hard: 3,
          expert: 4
        };

        codingQs.sort((a, b) => {
          const rankA = difficultyRank[a.difficulty?.toLowerCase()] || 2;
          const rankB = difficultyRank[b.difficulty?.toLowerCase()] || 2;
          return rankA - rankB;
        });

        setQuestions(codingQs);
      } catch (error) {
        message.error("Failed to load problems.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [subjectId, topicId]);

  const handleSolve = (question) => {
    router.push(`/student/practice-new/coding/workspace?qId=${question._id}&subjectId=${subjectId || ''}&title=${encodeURIComponent(title || "Topic")}`);
  };

  const toggleFilter = (state, setState, value) => {
    if (state.includes(value)) setState(state.filter(v => v !== value));
    else setState([...state, value]);
    setCurrentPage(1); // Reset to page 1 on filter change
  };

  // ----- Filter Logic -----
  const filteredQuestions = questions.filter((q) => {
    if (selectedStatus.length > 0) {
      const isSolved = Array.isArray(solvedState) && solvedState.includes(q._id);
      const matchesSolved = selectedStatus.includes("Solved") && isSolved;
      const matchesUnsolved = selectedStatus.includes("Unsolved") && !isSolved;
      if (!matchesSolved && !matchesUnsolved) return false;
    }

    if (selectedDifficulty.length > 0) {
      const qDiff = (q.difficulty || "Medium").toLowerCase();
      const diffMatches = selectedDifficulty.some(d => d.toLowerCase() === qDiff);
      if (!diffMatches) return false;
    }

    if (selectedPoints.length > 0) {
      const qDiff = (q.difficulty || "Medium").toLowerCase();
      const pointsMap = { easy: "5", medium: "10", hard: "20", expert: "50" };
      const qPoints = pointsMap[qDiff] || "10";
      const pointsMatches = selectedPoints.includes(qPoints);
      if (!pointsMatches) return false;
    }

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      const qText = (q.questionContent?.question || "").toLowerCase();
      const qTitle = getTextFromHtml(q.questionContent?.question).toLowerCase();
      if (!qText.includes(term) && !qTitle.includes(term)) return false;
    }

    return true;
  });

  // Calculate paginated questions
  const startIndex = (currentPage - 1) * pageSize;
  const currentQuestions = filteredQuestions.slice(startIndex, startIndex + pageSize);

  // ----- MOCK DATA FOR VISUAL BANNER SAMPLE -----
  const totalQ = questions.length;
  const solvedCount = Array.isArray(solvedState) ? solvedState.length : 0;

  const calculateBadge = (points) => {
    if (points < 150) {
      const level = Math.floor(points / 50) + 1;
      return { tier: "Bronze", level, nextThresh: level * 50, color: "#CD7F32", nextLabel: level === 3 ? "Silver 1" : `Bronze ${level + 1}` };
    } else if (points < 400) {
      const level = Math.floor((points - 150) / 50) + 1;
      return { tier: "Silver", level, nextThresh: 150 + (level * 50), color: "#C0C0C0", nextLabel: level === 5 ? "Gold 1" : `Silver ${level + 1}` };
    } else if (points < 750) {
      const level = Math.floor((points - 400) / 50) + 1;
      return { tier: "Gold", level, nextThresh: 400 + (level * 50), color: "#FFD700", nextLabel: level === 7 ? "Platinum 1" : `Gold ${level + 1}` };
    } else if (points < 1200) {
      const level = Math.floor((points - 750) / 50) + 1;
      return { tier: "Platinum", level, nextThresh: 750 + (level * 50), color: "#E5E4E2", nextLabel: level === 9 ? "Diamond 1" : `Platinum ${level + 1}` };
    } else {
      const level = Math.floor((points - 1200) / 50) + 1;
      return { tier: "Diamond", level, nextThresh: 1200 + (level * 50), color: "#B9F2FF", nextLabel: `Diamond ${level + 1}` };
    }
  };

  let totalPoints = 0;
  if (Array.isArray(solvedState)) {
    solvedState.forEach(id => {
      const q = questions.find(x => x._id === id);
      if (q) {
        const d = (q.difficulty || "Medium").toLowerCase();
        if (d === "easy") totalPoints += 5;
        else if (d === "medium") totalPoints += 10;
        else if (d === "hard") totalPoints += 20;
        else if (d === "expert") totalPoints += 50;
      }
    });
  }

  const badgeInfo = calculateBadge(totalPoints);
  const pointsNeeded = badgeInfo.nextThresh - totalPoints;
  const progressPercent = ((totalPoints % 50) / 50) * 100;

  // Use a dash if no rank is available yet, making it dynamic in the future
  const dynamicRank = totalPoints > 0 ? (1500000 - (totalPoints * 13)).toLocaleString() : "-";

  const rightSlotStats = (
    <div className="flex items-center mr-4 font-sans gap-4">
      <div className="flex flex-col w-[340px]">
        <div className="text-white text-[15px] mb-2 font-medium">
          <span className="text-orange-400 font-bold">{pointsNeeded} more points</span> to get {badgeInfo.nextLabel}!
        </div>
        <div className="w-full h-[5px] bg-[#334155] rounded-full mb-3 border border-[#475569]">
          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="flex justify-between items-center text-[#94A3B8] text-[13px] tracking-wide">
          <div>Rank: <span className="text-white font-bold">{dynamicRank}</span> <span className="mx-2 text-[#475569]">|</span> Points: <span className="text-white font-bold">{totalPoints % 50}/50</span></div>
          <Popover
            content={
              <div className="p-2 text-[13px]">
                <div className="font-bold mb-2">Points System</div>
                <div className="flex justify-between w-[120px]"><span>Easy:</span><span className="font-semibold text-emerald-500">5 pts</span></div>
                <div className="flex justify-between w-[120px]"><span>Medium:</span><span className="font-semibold text-yellow-500">10 pts</span></div>
                <div className="flex justify-between w-[120px]"><span>Hard:</span><span className="font-semibold text-orange-500">20 pts</span></div>
                <div className="flex justify-between w-[120px]"><span>Expert:</span><span className="font-semibold text-red-500">50 pts</span></div>
              </div>
            }
            title={null}
            trigger="hover"
            placement="bottomRight"
          >
            <div className="cursor-pointer">
              <BsExclamationCircle size={15} className="hover:text-white transition" />
            </div>
          </Popover>
        </div>
      </div>

      {/* Metallic Coding Badge */}
      <div className="mt-1">
        <CodingBadge tier={badgeInfo.tier} level={badgeInfo.level} size={64} showTier={true} />
      </div>
    </div>
  );

  const subdomains = [
    "Introduction",
    "Conditionals and Loops",
    "Arrays and Strings",
    "Functions",
    "Structs and Enums"
  ];
  const recommendedQuestion = questions.find(q => q.difficulty?.toLowerCase() === "medium" && (!Array.isArray(solvedState) || !solvedState.includes(q._id))) || questions[0];
  let recommendedTitle = "Coding Problem";
  let recIndex = 1;
  if (recommendedQuestion) {
    recIndex = questions.findIndex(q => q._id === recommendedQuestion._id) + 1;
    recommendedTitle = getTextFromHtml(recommendedQuestion.questionContent?.question);
    if (!recommendedTitle || recommendedTitle.length === 0) recommendedTitle = "Practice Coding";
    if (recommendedTitle.length > 60) recommendedTitle = recommendedTitle.substring(0, 60) + "...";
  }

  return (
    <div style={{ backgroundColor: "#F1F5F9", height: "100%", minHeight: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Banner Section - Fixed */}
      <div className="shrink-0 z-[50]">
        <StudentPageHeader
          title={`${decodeURIComponent(title || "Topic").replace(/\|/g, "")} Problems`}
          subtitle="Select a problem from the list below to start coding."
          rightSlot={rightSlotStats}
        />
      </div>

      <div className="flex-1 flex flex-col w-full" style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px", paddingTop: "24px", overflow: "hidden" }}>

        {/* Breadcrumb and Top Stats */}
        <div className="shrink-0 z-[40] flex flex-col lg:flex-row gap-8 items-center" style={{ backgroundColor: "#F1F5F9", paddingBottom: "20px" }}>

          {/* Left alignment (260px width matching sidebar) */}
          <div className="w-full lg:w-[260px] shrink-0">
            <a onClick={() => router.push("/student/practice-new/coding")} style={{ color: "#64748B", fontWeight: 600, fontSize: "16px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "18px" }}>&larr;</span> Practice
            </a>
          </div>

          {/* Right alignment (flex-1 matching problems tiles) */}
          <div className="flex-1 w-full flex justify-between items-center h-[40px]">
            {/* Search */}
            <div className="flex items-center">
              <div className="relative">
                <BsSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  placeholder="Search questions"
                  className="bg-white text-gray-800 placeholder-gray-400 pl-10 pr-4 py-[8px] rounded-full border border-gray-300 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-[240px] text-[14px] shadow-sm"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>

            {/* Solved Progress Circle */}
            <div className="flex items-center gap-2 text-[#64748B] text-[15px] font-bold pr-2 tracking-wide">
              <div className="w-5 h-5 rounded-full border-2 border-gray-400/30 relative flex items-center justify-center overflow-hidden">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-emerald-500"
                  style={{ height: `${(solvedCount / totalQ) * 100}%` }}
                />
              </div>
              {solvedCount}/{totalQ} Solved
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row gap-8 items-start overflow-hidden">

          {/* Left Column - Sidebar Filters */}
          <div className="w-full lg:w-[260px] shrink-0 flex flex-col bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-[0_4px_20px_rgba(0,0,0,0.03)] h-full overflow-y-auto pb-12" style={{ scrollbarWidth: 'none' }}>

            {/* Status Filter */}
            <div className="pb-6 border-b border-[#E2E8F0] mb-6">
              <h4 className="text-[12px] font-bold text-[#64748B] tracking-widest mb-4 uppercase">Status</h4>
              <div className="flex flex-col gap-3">
                <Checkbox
                  className="font-medium text-[14px] text-[#334155]"
                  checked={selectedStatus.includes("Solved")}
                  onChange={() => toggleFilter(selectedStatus, setSelectedStatus, "Solved")}
                >
                  Solved
                </Checkbox>
                <Checkbox
                  className="font-medium text-[14px] text-[#334155]"
                  checked={selectedStatus.includes("Unsolved")}
                  onChange={() => toggleFilter(selectedStatus, setSelectedStatus, "Unsolved")}
                >
                  Unsolved
                </Checkbox>
              </div>
            </div>

            {/* Difficulty Filter */}
            <div className="pb-6 border-b border-[#E2E8F0] mb-6">
              <h4 className="text-[12px] font-bold text-[#64748B] tracking-widest mb-4 uppercase">Difficulty</h4>
              <div className="flex flex-col gap-3">
                {["Easy", "Medium", "Hard", "Expert"].map(diff => (
                  <Checkbox
                    key={diff}
                    className="font-medium text-[14px] text-[#334155]"
                    checked={selectedDifficulty.includes(diff)}
                    onChange={() => toggleFilter(selectedDifficulty, setSelectedDifficulty, diff)}
                  >
                    {diff}
                  </Checkbox>
                ))}
              </div>
            </div>

            {/* Points Filter */}
            <div className="pb-6 border-b border-[#E2E8F0] mb-8">
              <h4 className="text-[12px] font-bold text-[#64748B] tracking-widest mb-4 uppercase">Points</h4>
              <div className="flex flex-col gap-3">
                {["5", "10", "20", "50"].map(pts => (
                  <Checkbox
                    key={pts}
                    className="font-medium text-[14px] text-[#334155]"
                    checked={selectedPoints.includes(pts)}
                    onChange={() => toggleFilter(selectedPoints, setSelectedPoints, pts)}
                  >
                    {pts} Points
                  </Checkbox>
                ))}
              </div>
            </div>

            {/* Recommended For You Widget */}
            {recommendedQuestion && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 mb-1">
                  <BsStar className="text-yellow-500" size={16} />
                  <h4 className="text-[12px] font-bold text-indigo-600 tracking-widest uppercase m-0">Recommended</h4>
                </div>
                <div
                  className="bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl p-4 shadow-sm cursor-pointer transition-transform hover:-translate-y-1"
                  onClick={() => handleSolve(recommendedQuestion)}
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                      {recommendedQuestion.difficulty || "Medium"} Level
                    </div>
                    <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                      PROBLEM {recIndex}
                    </div>
                  </div>
                  <h5 className="text-[#0F172A] text-[14px] font-semibold leading-snug mb-3">
                    {recommendedTitle}
                  </h5>
                  <button className="w-full py-2 rounded-lg bg-white border border-[#E2E8F0] text-[#1E69DA] shadow-sm text-[12px] font-bold hover:bg-gray-50 transition-colors">
                    Solve Now
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Problems */}
          <div className="flex-1 w-full h-full flex flex-col gap-5 overflow-y-auto pr-2 pb-10" style={{ scrollbarWidth: 'none' }}>
            {loading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
                <Spin size="large" />
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
                <h3 style={{ color: "#64748B", margin: 0, fontWeight: 500 }}>No coding questions match your filters.</h3>
                <Button
                  type="link"
                  onClick={() => {
                    setSelectedStatus([]);
                    setSelectedDifficulty([]);
                    setSelectedPoints([]);
                  }}
                  style={{ marginTop: '12px', fontWeight: 600, color: '#000' }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {currentQuestions.map((q, index) => {
                    const isSolved = Array.isArray(solvedState) && solvedState.includes(q._id);
                    const diff = q.difficulty || "Medium";
                    let diffColor = "#F59E0B"; // Default Medium Yellow
                    if (diff.toLowerCase() === "easy") diffColor = "#10B981"; // Green
                    if (diff.toLowerCase() === "hard") diffColor = "#EF4444"; // Red

                    let titlePreview = getTextFromHtml(q.questionContent?.question);
                    if (!titlePreview || titlePreview.length === 0) {
                      titlePreview = `Coding Problem ${startIndex + index + 1}`;
                    } else if (titlePreview.length > 80) {
                      titlePreview = titlePreview.substring(0, 80) + "...";
                    }

                    return (
                      <div
                        key={q._id}
                        className="group flex items-center justify-between p-5 rounded-xl bg-white border border-[#E2E8F0] hover:border-blue-500 hover:shadow-[0_8px_24px_rgba(59,130,246,0.12)] transition-all cursor-pointer"
                        style={{ transform: "translateZ(0)" }}
                        onClick={() => handleSolve(q)}
                        onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                        onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                      >
                        <div>
                          <h3 className="text-[17px] lg:text-[19px] font-bold text-[#0F172A] mb-2 tracking-wide leading-tight">
                            {titlePreview}
                          </h3>
                          <div className="text-[13px] text-[#64748B] font-medium tracking-wide">
                            <span style={{ color: diffColor }}>{diff.charAt(0).toUpperCase() + diff.slice(1)}</span>
                            {`, ${title || "Topic"} (Basic), Success Rate: ${q.successRate ? q.successRate : (() => {
                              let hash = 0;
                              const str = q._id || "";
                              for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
                              let base = 85;
                              if (diff.toLowerCase() === "easy") base = 90;
                              else if (diff.toLowerCase() === "medium") base = 65;
                              else if (diff.toLowerCase() === "hard") base = 40;
                              else if (diff.toLowerCase() === "expert") base = 20;
                              const variance = Math.abs(hash % 1500) / 100; // 0 to 14.99
                              return (base + variance).toFixed(2) + "%";
                            })()}`}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0 pl-4">
                          {isSolved && (
                            <div className="flex items-center gap-1 px-2 py-1.5 rounded-md bg-green-50 border border-green-200">
                              <BsCheckCircleFill className="text-green-500" size={14} />
                              <span className="text-[11px] font-bold text-green-600 uppercase tracking-wider">Solved</span>
                            </div>
                          )}
                          {/* Points Badge */}
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-50 border border-yellow-200">
                            <BsStar className="text-yellow-500" size={14} />
                            <span className="text-[13px] font-bold text-yellow-600">
                              {{ easy: "5", medium: "10", hard: "20", expert: "50" }[diff.toLowerCase()] || "10"} Points
                            </span>
                          </div>

                          <button
                            className={
                              isSolved
                                ? "px-5 py-2 rounded-md text-[14px] font-semibold text-green-600 bg-white border border-green-500 hover:bg-green-50 transition-colors shadow-sm"
                                : "px-5 py-2 rounded-md text-[14px] font-semibold text-white bg-gradient-to-br from-[#1E69DA] to-[#5694F0] hover:opacity-90 transition-opacity shadow-sm border-none"
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSolve(q);
                            }}
                          >
                            {isSolved ? "Solve Again" : "Solve Problem"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {filteredQuestions.length > pageSize && (
                  <div className="flex justify-center mt-6 mb-4">
                    <Pagination
                      current={currentPage}
                      pageSize={pageSize}
                      total={filteredQuestions.length}
                      onChange={(page) => setCurrentPage(page)}
                      showSizeChanger={false}
                    />
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </div>

      {/* Level Up Modal */}
      {showLevelUp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-[400px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="h-[120px] bg-gradient-to-r from-[#4F46E5] via-[#7C3AED] to-[#9333EA] relative flex justify-center pt-8">
              {/* Metallic Coding Badge */}
              <div className="absolute -bottom-[50px] inline-block relative">
                <CodingBadge tier="Silver" level={1} size={110} />
              </div>
            </div>

            <div className="px-8 pt-14 pb-8 text-center flex flex-col items-center">
              <h2 className="text-[24px] font-bold text-[#0F172A] mb-2">Congratulations! 🎉</h2>
              <p className="text-[14px] text-[#64748B] font-medium leading-relaxed mb-6">
                You've reached 150 points and leveled up to <strong className="text-[#0F172A]">Silver 1</strong>! Keep solving problems to reach the next tier.
              </p>

              <div className="w-full h-[6px] bg-[#E2E8F0] rounded-full mb-8 border border-gray-100 overflow-hidden relative">
                <div className="absolute inset-0 bg-[#10B981] w-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
              </div>

              <div className="flex w-full gap-3">
                <button
                  className="flex-1 py-2.5 rounded-lg border border-[#E2E8F0] text-[#64748B] font-bold text-[14px] hover:bg-gray-50 transition"
                  onClick={() => setShowLevelUp(false)}
                >
                  Close
                </button>
                <button
                  className="flex-1 py-2.5 rounded-lg bg-[#4F46E5] text-white font-bold text-[14px] shadow-lg shadow-indigo-200 hover:bg-[#4338CA] hover:-translate-y-0.5 transition-all"
                  onClick={() => {
                    setShowLevelUp(false);
                    message.success("Redirecting to Notice Board...");
                    router.push("/student/dashboard?mockBadgeEarned=silver1");
                  }}
                >
                  Earn Badge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
