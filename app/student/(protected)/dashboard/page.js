"use client";
import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import {
  getAllCourses,
  getAllInternships,
  getOneInternsip,
  getAllCoursesOnly,
  getAllInternshipsOnly,
} from "@/redux/slices/internship";
import { updateStudent } from "@/redux/slices/student";
import { GetAllNotifiocations } from "@/redux/slices/jobopenings";
import {
  Button,
  Divider,
  Popover,
  Progress,
  Pagination,
  Spin,
  message,
  Table,
  Modal,
} from "antd";
import { FaArrowRight } from "react-icons/fa";
import { BsX, BsPlus, BsStar } from "react-icons/bs";
import { HiOutlineArrowsExpand, HiOutlineBookOpen, HiOutlineBriefcase, HiOutlineClipboardList } from "react-icons/hi";
import { calculateProfileCompletion } from "@/universalUtils/getprofilecompleteion";
import { useAppRouter } from "@/helpers/useAppRouter";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import CodingBadge from "@/modules/student/components/CodingBadge";
import { ReadOutlined, LaptopOutlined } from "@ant-design/icons";
import CardsList from "@/modules/student/components/cardsList";
import MobileDashboard from "@/mobile_views/dashboard/MobileDashboard";
import useResponsive from "@/hooks/useResponsive";

const DashboardStats = ({ stats, router }) => (
  <div className="flex flex-row w-full gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden">
    {stats.map((stat, idx) => (
      <div
        key={idx}
        className="bg-white rounded-[12px] p-4 flex-1 min-w-[200px] flex flex-row items-center gap-4 border border-[rgba(81,81,81,0.2)] hover:border-gray-400 cursor-pointer transition-all duration-200"
        onClick={() => stat.link && router.push(stat.link)}
      >
        <div
          className="w-[48px] h-[48px] rounded-[10px] flex items-center justify-center shrink-0"
          style={stat.iconBgStyle || { backgroundColor: '#f8fafc' }}
        >
          {stat.icon}
        </div>
        <div className="flex flex-col">
          <span className="text-[13px] text-[#8ea2b5] font-extrabold leading-none mb-1">{stat.title}</span>
          <span className="text-[22px] font-extrabold text-[#1e293b] leading-none">{stat.value}</span>
        </div>
      </div>
    ))}
  </div>
);

const RecommendedCard = ({ item, total, currentIndex, onDotClick, onNextClick, onPrevClick, onCardClick }) => {
  function stripHtml(html) {
  if (typeof html !== 'string') return '';
  let text = html
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#34;/g, '"');
  return text.replace(/<[^>]*>/g, '');
}
  function formatUpdatedDate(dateInput) {
    if (!dateInput) return "";
    const d = new Date(dateInput);
    return isNaN(d.getTime())
      ? ""
      : d.toLocaleString("en-IN", { month: "short", year: "numeric" });
  }

  return (
    <div
      className="w-full h-[460px] bg-white text-black border border-[rgba(81,81,81,0.3)] rounded-[14px] overflow-hidden cursor-pointer transition-all duration-200 hover:border-gray-400 group shrink-0"
      role="button"
      tabIndex={0}
      onClick={() => onCardClick?.(item)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick?.(item);
      }}
    >
      <div
        key={item?._id}
        className="flex flex-col w-full h-full p-2 animate-[smoothFadeIn_0.5s_ease-out_forwards]"
      >
        <div className="relative w-full h-[220px] shrink-0 bg-white overflow-hidden rounded-xl">
          {(item?.coverImage || item?.media?.coverImage) ? (
            <img
              src={item?.coverImage || item?.media?.coverImage}
              alt={item?.title || "Course cover"}
              className="w-full h-full object-cover block transition-transform duration-200 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-[#EFF5FB] block transition-transform duration-200 group-hover:scale-105" />
          )}
          {item?.difficulty ? (
            <span className="absolute left-2 top-2 z-10 text-[12px] leading-none px-2 py-1.5 rounded-full text-[#0f1115] bg-gradient-to-r from-[#ffd66b] to-[#ffb347] font-semibold">{item?.difficulty}</span>
          ) : null}
        </div>

        <div className="flex flex-col gap-2 px-3 pt-3 pb-2 flex-1">
          <div className="flex items-center justify-between min-h-[52px]">
            <div className="text-[#1E69DA] text-[18px] font-bold leading-tight line-clamp-2">{item?.title}</div>
          </div>

          <div className="flex flex-wrap gap-1.5 h-[26px] overflow-hidden shrink-0">
            {item?.sections?.length ? (
              <span className="text-[12px] text-black bg-white border border-[rgba(159,176,195,0.22)] px-2 py-1 rounded-full">
                {item?.sections?.length} Modules
              </span>
            ) : null}

            {item?.preRequisites?.slice(0, 2)?.map((p, i) => (
              <span key={`${p}-${i}`} className="text-[12px] text-black bg-white border border-[rgba(159,176,195,0.22)] px-2 py-1 rounded-full">
                {p}
              </span>
            ))}
          </div>

          <p
            className="text-[#b9c7d6] text-[14px] leading-[1.5] my-0.5 line-clamp-2"
            title={stripHtml?.(item?.description) || ""}
          >
            {(() => {
              const t = stripHtml?.(item?.description) || "";
              return t.slice(0, 140) + (t.length > 140 ? "…" : "");
            })()}
          </p>

          <div className="mt-auto flex flex-col justify-end pt-2">
            <div className="flex items-center justify-between gap-2 h-[20px]">
              {item?.lastAssignmentUpdate || item?.updatedAt ? (
                <div className="text-[#8ea2b5] text-[12px]" aria-label="Last updated">
                  Updated{" "}
                  {formatUpdatedDate?.(
                    item?.lastAssignmentUpdate || item?.updatedAt
                  )}
                </div>
              ) : null}
            </div>

            {total > 0 && (
            <div className="flex justify-center items-center gap-3 mt-2" onClick={(e) => e.stopPropagation()}>
              {total > 1 && (
                <button
                  className="text-[#9ca3af] hover:text-[#1E69DA] transition-colors p-1"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onPrevClick?.();
                  }}
                  aria-label="Previous"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
              )}
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(3, total) }).map((_, idx) => {
                  const displayTotal = Math.min(3, total);
                  const isActive = idx === (currentIndex % displayTotal);
                  return (
                    <button
                      key={idx}
                      className={`rounded-full transition-all duration-300 ${isActive
                        ? 'w-[14px] h-[14px] bg-gradient-to-br from-[#1E69DA] to-[#5694F0] border-none'
                        : 'w-[10px] h-[10px] bg-transparent border-[2px] border-[#9ca3af]'
                        }`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDotClick?.(idx);
                      }}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  );
                })}
              </div>
              {total > 1 && (
                <button
                  className="text-[#9ca3af] hover:text-[#1E69DA] transition-colors p-1"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onNextClick?.();
                  }}
                  aria-label="Next"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              )}
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileSection = ({ profileValues, router, studentCreds }) => (
  <div className="w-full flex flex-col items-start pb-2">
    <h3 className="m-0 font-extrabold text-[#0f172a] text-[16px] xl:text-[18px] mb-3 shrink-0">Overall Performance</h3>

    <div className="w-full bg-white rounded-[16px] py-2 px-3 flex items-center gap-3 border border-[#e2e8f0] shrink-0 mb-3">
      <div className="shrink-0 relative">
        <Progress
          type="circle"
          percent={profileValues?.percentage ?? 0}
          size={46}
          strokeWidth={8}
          strokeColor="#3b82f6"
          railColor="#e2e8f0"
          format={(percent) => (
            <span className="text-[13px] font-black text-[#0f172a] leading-none">{percent}%</span>
          )}
        />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="font-extrabold text-[#334155] text-[13px] leading-tight">Profile completion rate</span>
        <span className="text-[#64748b] text-[11px] leading-tight">Complete your profile to unlock a better experience</span>
      </div>
    </div>

    <div className="w-full shrink-0">
      <Button
        className="w-full h-[38px] flex items-center justify-between px-2 transition-all hover:opacity-90 !text-white !bg-[#3b82f6] !border-none"
        style={{ borderRadius: '8px' }}
        onClick={() => router.push("/student/profile/basic-details")}
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <span className="text-[12px]">⚡</span>
          </div>
          <span className="font-semibold text-[13px]">Complete your profile</span>
        </div>
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14"></path>
            <path d="M12 5l7 7-7 7"></path>
          </svg>
        </div>
      </Button>
    </div>
  </div>
);

const AchievementDetailsModal = ({ isOpen, onClose, achievement }) => {
  if (!achievement) return null;

  const renderContent = () => {
    switch (achievement.type) {
      case 'course':
      case 'internship':
        const course = achievement.courseData;
        return (
          <div className="bg-[#f8fafc] rounded-xl p-4 mt-4 border border-[#e2e8f0] text-left w-full">
            <h4 className="font-bold text-[#1e293b] text-[15px] mb-2">{achievement.type === 'course' ? 'Course Details' : 'Internship Details'}</h4>
            <div className="flex items-center gap-2 mb-3 text-[13px] text-[#64748b]">
              <span className="shrink-0">⏱️</span> 
              <span>{course.duration ? `Duration: ${course.duration}` : "Completed"}</span>
            </div>
            
            <h5 className="font-bold text-[#334155] text-[13px] mb-2">What you learned</h5>
            <div className="flex flex-col gap-2">
              {course.skillsToMaster?.length > 0 ? (
                course.skillsToMaster.slice(0, 4).map((skill, i) => (
                  <div key={i} className="flex items-center gap-2 text-[13px] text-[#475569]">
                    <span className="text-[#10b981]">✅</span> <span>{skill}</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-center gap-2 text-[13px] text-[#475569]"><span className="text-[#10b981]">✅</span> <span>Core Fundamentals</span></div>
                  <div className="flex items-center gap-2 text-[13px] text-[#475569]"><span className="text-[#10b981]">✅</span> <span>Advanced Techniques</span></div>
                  <div className="flex items-center gap-2 text-[13px] text-[#475569]"><span className="text-[#10b981]">✅</span> <span>Best Practices</span></div>
                </>
              )}
            </div>
          </div>
        );
      case 'practice':
        return (
          <div className="bg-[#f8fafc] rounded-xl p-4 mt-4 border border-[#e2e8f0] text-left w-full">
            <h4 className="font-bold text-[#1e293b] text-[15px] mb-2">Test Performance</h4>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#64748b] text-[13px]">Accuracy</span>
              <span className="font-bold text-[#10b981] text-[14px]">100%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#64748b] text-[13px]">Questions Answered</span>
              <span className="font-bold text-[#1e293b] text-[14px]">All</span>
            </div>
          </div>
        );
      case 'streak':
        return (
          <div className="bg-[#f8fafc] rounded-xl p-4 mt-4 border border-[#e2e8f0] text-left w-full">
            <h4 className="font-bold text-[#1e293b] text-[15px] mb-2">Consistency is Key!</h4>
            <p className="text-[13px] text-[#64748b] leading-relaxed">
              You've logged in for {achievement.streak || 30} consecutive days. Keep up the great work and continue building your skills every day!
            </p>
          </div>
        );
      default:
        return (
          <div className="bg-[#f8fafc] rounded-xl p-4 mt-4 border border-[#e2e8f0] text-left w-full">
            <h4 className="font-bold text-[#1e293b] text-[15px] mb-2">Achievement Unlocked</h4>
            <p className="text-[13px] text-[#64748b] leading-relaxed">
              {achievement.desc}. Keep exploring the platform to earn more badges!
            </p>
          </div>
        );
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      centered
      width={400}
      className="achievement-modal"
      closeIcon={<span className="text-gray-400 hover:text-gray-600 text-lg">✕</span>}
      bodyStyle={{ padding: 0 }}
    >
      <div className="flex flex-col items-center justify-center p-6 pt-10 relative overflow-hidden bg-white/60 backdrop-blur-md rounded-2xl border border-white/50">
        <div className="absolute top-[-50px] w-[200px] h-[200px] bg-[#f59e0b] rounded-full blur-[80px] opacity-20"></div>
        
        <div className="text-[80px] leading-none mb-4 drop-shadow-xl relative z-10 animate-bounce-slight" style={{ filter: 'drop-shadow(0px 10px 15px rgba(245, 158, 11, 0.4))' }}>
          {achievement.emoji}
        </div>
        
        <h2 className="text-[24px] font-extrabold text-[#0f172a] text-center mb-1 relative z-10 w-full px-2" style={{ wordBreak: 'break-word', lineHeight: '1.2' }}>
          {achievement.title}
        </h2>
        
        <div className="flex items-center gap-2 text-[13px] text-[#64748b] font-medium mb-2 relative z-10">
          <span>Earned Recently</span>
          <span>•</span>
          <span className="flex items-center gap-1 text-[#f59e0b] font-bold">
            💰 {achievement.desc.includes('coins earned') ? achievement.desc : '+50 coins'}
          </span>
        </div>
        
        <div className="w-full relative z-10 flex flex-col items-center">
          {renderContent()}
        </div>
        
        <Button 
          className="w-full mt-6 h-[44px] rounded-xl font-bold text-[15px] border-none text-white shadow-md shadow-[#3b82f6]/30 transition-all hover:opacity-90 hover:scale-[1.02]"
          style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' }}
          onClick={onClose}
        >
          Awesome!
        </Button>
      </div>
    </Modal>
  );
};

const Achievements = ({ progressById, combinedLearningData, studentCreds }) => {
  const [streak, setStreak] = React.useState(1);
  const [claimedAchievements, setClaimedAchievements] = React.useState([]);
  const [selectedAchievement, setSelectedAchievement] = React.useState(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isPracticeModalOpen, setIsPracticeModalOpen] = React.useState(false);
  const [practiceModalType, setPracticeModalType] = React.useState("Technical");
  
  // Notification states
  const [unseenBadges, setUnseenBadges] = React.useState([]);
  const [selectedBadgeDetail, setSelectedBadgeDetail] = React.useState(null);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setStreak(parseInt(localStorage.getItem("loginStreak") || "1", 10));
      
      const loadClaimed = () => {
        let stored = studentCreds?.claimedAchievements || [];
        if (typeof window !== "undefined") {
          const userId = studentCreds?._id || "";
          const scopedKey = `claimedAchievements_${userId}`;
          
          // Temporary Migration to restore lost badges
          const oldLocal = JSON.parse(localStorage.getItem("claimedAchievements") || "[]");
          let currentScoped = JSON.parse(localStorage.getItem(scopedKey) || "[]");
          
          if (oldLocal.length > 0 && currentScoped.length === 0) {
             const practiceBadges = oldLocal.filter(id => typeof id === 'string' && id.startsWith('practice_badge'));
             if (practiceBadges.length > 0) {
                 localStorage.setItem(scopedKey, JSON.stringify(practiceBadges));
                 currentScoped = practiceBadges;
             }
          }
          
          stored = [...stored, ...currentScoped];
        }
        
        setClaimedAchievements(Array.from(new Set(stored)));
        
        if (typeof window !== "undefined") {
          const userId = studentCreds?._id || "";
          setUnseenBadges(JSON.parse(localStorage.getItem(`unseenPracticeBadges_${userId}`) || "[]"));
        }
        
        // Auto-open modal if redirected from test result page
        const autoOpen = localStorage.getItem("autoOpenBadgeModal");
        if (autoOpen) {
          setTimeout(() => {
            setPracticeModalType(autoOpen);
            setIsPracticeModalOpen(true);
            setSelectedBadgeDetail(null);
            
            // Auto clear unseen for this type
            const userId = studentCreds?._id || "";
            const unseenKey = `unseenPracticeBadges_${userId}`;
            const remaining = JSON.parse(localStorage.getItem(unseenKey) || "[]").filter(id => !id.includes(autoOpen));
            setUnseenBadges(remaining);
            localStorage.setItem(unseenKey, JSON.stringify(remaining));
            localStorage.removeItem("autoOpenBadgeModal");
          }, 300);
        }
      };
      
      loadClaimed();
      window.addEventListener("achievementClaimed", loadClaimed);
      
      // Listen for notice board action URL hash clicks
      const handleHashChange = () => {
        if (window.location.hash.startsWith('#openBadges_')) {
          const type = window.location.hash.split('_')[1];
          if (type === 'Technical' || type === 'Non-Technical') {
            setPracticeModalType(type);
            setIsPracticeModalOpen(true);
            setSelectedBadgeDetail(null);
            
            const userId = studentCreds?._id || "";
            const unseenKey = `unseenPracticeBadges_${userId}`;
            const remaining = JSON.parse(localStorage.getItem(unseenKey) || "[]").filter(id => !id.includes(type));
            setUnseenBadges(remaining);
            localStorage.setItem(unseenKey, JSON.stringify(remaining));
            
            // Clean up hash without reloading
            history.pushState("", document.title, window.location.pathname + window.location.search);
          }
        }
      };
      window.addEventListener("hashchange", handleHashChange);
      // Check on initial load too
      handleHashChange();

      const handleCloseNoticeBoard = () => setIsNoticeModalOpen(false);
      window.addEventListener("closeNoticeBoard", handleCloseNoticeBoard);

      return () => {
        window.removeEventListener("achievementClaimed", loadClaimed);
        window.removeEventListener("hashchange", handleHashChange);
        window.removeEventListener("closeNoticeBoard", handleCloseNoticeBoard);
      };
    }
  }, [studentCreds?.claimedAchievements]);

  const practiceBadges = Array.from(new Set([
    ...(claimedAchievements || [])
  ]))
    .filter(id => typeof id === 'string' && (id.startsWith("practice_badge|") || id.startsWith("practice_badge_")))
    .filter(id => id !== "practice_badge_Coding_Programming_C_Silver_1") // Remove mock
    .map(id => {
      // Handle both formats: '|' delimiter and '_' delimiter (for mock)
      const delimiter = id.includes('|') ? '|' : '_';
      const parts = id.split(delimiter);
      const offset = delimiter === '_' ? 1 : 0; // if '_', 'badge' is parts[1]
      
      let section = parts[1 + offset];
      if (section && section.toLowerCase() === 'nontechnical') section = 'Non-Technical';
      if (section && section.toLowerCase() === 'technical') {
        if (parts[2 + offset] === 'General Aptitude') {
          section = 'Non-Technical';
        } else {
          section = 'Technical';
        }
      }
      if (section && section.toLowerCase() === 'coding') section = 'Coding';

      return {
        id,
        section, 
        topic: parts[2 + offset],
        subtopic: parts[3 + offset],
        type: parts[4 + offset],
        level: parts[5 + offset]
      };
    })
    .reverse();

  const technicalBadges = practiceBadges.filter(b => b.section === "Technical");
  const nonTechnicalBadges = practiceBadges.filter(b => b.section === "Non-Technical");
  const codingBadges = practiceBadges.filter(b => b.section === "Coding");

  const hasUnseenTech = technicalBadges.some(b => unseenBadges.includes(b.id));
  const hasUnseenNonTech = nonTechnicalBadges.some(b => unseenBadges.includes(b.id));
  const hasUnseenCoding = codingBadges.some(b => unseenBadges.includes(b.id));

  const openPracticeModal = (type) => {
    setPracticeModalType(type);
    setIsPracticeModalOpen(true);
    setSelectedBadgeDetail(null);
    
    // Clear unseen badges for this type
    const userId = studentCreds?._id || "";
    const unseenKey = `unseenPracticeBadges_${userId}`;
    const remainingUnseen = unseenBadges.filter(id => {
      const badge = practiceBadges.find(b => b.id === id);
      return badge && badge.section !== type;
    });
    setUnseenBadges(remainingUnseen);
    localStorage.setItem(unseenKey, JSON.stringify(remainingUnseen));
  };

  const renderBadgeList = (badges) => {
    // If a badge is selected, show the detailed drill-down view
    if (selectedBadgeDetail) {
      const b = selectedBadgeDetail;
      const isCoding = b.section === "Coding";
      let hexColor = "#CD7F32";
      if (b.type === "Silver") hexColor = "#C0C0C0";
      if (b.type === "Gold") hexColor = "#FFD700";
      if (b.type === "Platinum") hexColor = "#E5E4E2";
      if (b.type === "Diamond") hexColor = "#B9F2FF";

      return (
        <div className="flex flex-col animate-[smoothFadeIn_0.3s_ease-out_forwards]">
          <div className="flex justify-start mb-2">
            <button 
              onClick={() => setSelectedBadgeDetail(null)}
              className="text-[#3b82f6] font-semibold flex items-center gap-2 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Back to Badges
            </button>
          </div>
          
          <div className="bg-[#f0f9ff] p-6 rounded-2xl text-center border border-[#e2e8f0]">
            <div className="inline-block relative mb-6">
              {isCoding ? (
                <div className="mx-auto">
                  <CodingBadge tier={b.type} level={b.level} size={135} />
                </div>
              ) : (
                <div className="bg-[#3b82f6] rounded-full w-[120px] h-[120px] flex items-center justify-center shadow-[0_10px_25px_-5px_rgba(59,130,246,0.5)]">
                  <span className="text-[60px] drop-shadow-md">{b.type === 'Flawless' ? '🏆' : '🏅'}</span>
                </div>
              )}
              {!isCoding && (
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#2563eb] text-white px-4 py-1 rounded-full font-bold text-[12px] tracking-wide shadow-md whitespace-nowrap">
                  {b.type.toUpperCase()}
                </div>
              )}
            </div>
            
            <h2 className="text-[22px] font-extrabold text-[#1e293b] mb-2">
              {isCoding ? `${b.type} ${b.level} Badge` : `${b.type} Master Lvl ${b.level}`}
            </h2>
            <p className="text-[#475569] text-[14px] leading-relaxed mb-6">
              You've proven your expertise in <strong className="text-[#0f172a]">{b.topic} • {b.subtopic}</strong>!
            </p>
            
              <div className="flex-1 border-t border-[#e2e8f0] pt-4 mt-2">
                <strong className="block text-[#1e293b] text-[15px] mb-1">{b.type} Badge Unlocked</strong>
                <span className="text-[#64748b] text-[14px] leading-relaxed block">
                  {isCoding 
                    ? `Awarded for earning points in Coding Practice. You have reached the ${b.type} ${b.level} milestone!`
                    : b.type === 'Flawless' 
                      ? "Awarded for getting every question right in one attempt. Your flawless execution proves true mastery of this topic." 
                      : "Awarded for scoring 100% on a topic 24 hours after mastering it. You've proven exceptional memory and recall."}
                </span>
              </div>
              <div className="text-[28px] mt-4">
                {isCoding ? '💻' : (b.type === 'Flawless' ? '🏆' : '🏅')}
              </div>
          </div>
        </div>
      );
    }

    if (badges.length === 0) {
      return <div className="text-center py-8 text-gray-500 font-medium">No badges earned yet. Keep practicing!</div>;
    }
    
    return (
      <div className="flex flex-col gap-4 animate-[smoothFadeIn_0.3s_ease-out_forwards]">
        {badges.map((b, idx) => {
          const isNew = unseenBadges.includes(b.id);
          const isCoding = b.section === "Coding";
          
          let hexColor = "#CD7F32";
          if (b.type === "Silver") hexColor = "#C0C0C0";
          if (b.type === "Gold") hexColor = "#FFD700";
          if (b.type === "Platinum") hexColor = "#E5E4E2";
          if (b.type === "Diamond") hexColor = "#B9F2FF";
          
          return (
            <div 
              key={idx} 
              className={`flex items-center justify-between p-4 rounded-xl border ${isNew ? 'border-[#3b82f6] bg-[#eff6ff]' : 'border-[#e2e8f0] bg-white'} overflow-hidden cursor-pointer transition-all hover:shadow-md hover:border-[#cbd5e1] group`}
              onClick={() => setSelectedBadgeDetail(b)}
            >
              <div className="flex items-center gap-4">
                <div className="relative shrink-0 flex items-center justify-center min-w-[54px] min-h-[54px]">
                  {isNew && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white shadow-sm z-10 animate-pulse" />}
                  {isCoding ? (
                    <div className="group-hover:scale-110 transition-transform flex">
                      <CodingBadge tier={b.type} level={b.level} size={56} />
                    </div>
                  ) : (
                    <div className="text-[36px] drop-shadow-sm group-hover:scale-110 transition-transform">{b.type === 'Flawless' ? '🏆' : '🏅'}</div>
                  )}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-[#0f172a] text-[15px]">
                    {isCoding ? `${b.type} ${b.level} Badge` : `${b.type} Master Lvl ${b.level}`}
                  </span>
                  <span className="text-[#64748b] text-[13px]">{b.topic} • {b.subtopic}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-[#24A058] text-[13px] font-bold">Earned</span>
                {isNew && <span className="text-[10px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-full uppercase tracking-wider">New</span>}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  let streakCoins = 5;
  if (streak === 1) streakCoins = 10;
  else if (streak > 0 && streak % 10 === 0) streakCoins = streak;

  const achievementsList = [
    { type: 'streak', id: 'streak_current', emoji: "🔥", title: `${streak} Day Streak`, desc: `+${streakCoins} coins earned`, status: "Earned", streakCoins, streak }
  ];

  if (streak >= 30) {
    achievementsList.push({ type: 'streak', id: 'streak_month', emoji: "🏆", title: "1 Month Streak", desc: "Maintained badge", status: "Earned", streak: 30 });
  }

  if (claimedAchievements.includes("welcome_aboard")) {
    achievementsList.push({ type: 'onboarding', id: 'welcome_aboard', emoji: "🚀", title: "Welcome Aboard", desc: "Joined the platform", status: "Earned" });
  }
  
  if (claimedAchievements.includes("profile_complete")) {
    achievementsList.push({ type: 'onboarding', id: 'profile_complete', emoji: "👤", title: "Profile Complete", desc: "Profile setup finished", status: "Earned" });
  }
  
  if (claimedAchievements.includes("perfect_scorer")) {
    achievementsList.push({ type: 'practice', id: 'perfect_scorer', emoji: "🎯", title: "Perfect Scorer", desc: "100% on a practice test", status: "Earned" });
  }

  if (progressById && combinedLearningData) {
    Object.keys(progressById).forEach(id => {
      const achievementId = `complete_${id}`;
      if (claimedAchievements.includes(achievementId)) {
        const course = combinedLearningData.find((c) => c._id === id);
        if (course) {
          const categoryText = course.category ? course.category : (course.type || "Course");
          const shortCategoryText = categoryText.charAt(0).toUpperCase() + categoryText.slice(1);
          const courseTitle = course.title || course.courseTitle || course.name || `${shortCategoryText} Course`;
          achievementsList.push({
            type: course.type === 'internships' ? 'internship' : 'course',
            id: achievementId,
            courseData: course,
            emoji: "🥇",
            title: `${courseTitle} Complete`,
            desc: "+50 coins earned",
            status: "Earned"
          });
        }
      }
    });
  }

  const renderAllAchievements = () => {
    const rawClaimed = Array.from(new Set([
      ...(studentCreds?.claimedAchievements || [])
    ]));

    // Helper to get score (0 = newest, 9999 = oldest/unknown)
    const getScore = (id) => {
      const idx = rawClaimed.indexOf(id);
      return idx !== -1 ? (rawClaimed.length - idx) : 9999;
    };

    const combinedList = [];

    achievementsList.forEach((item, idx) => {
      let score = getScore(item.id);
      if (item.type === 'streak') score = 9998; // keep streak right below recently earned

      combinedList.push({
        score,
        el: (
          <div 
            key={`ach_${idx}`} 
            className="flex items-center justify-between p-3 rounded-xl border border-[#e2e8f0] bg-[#EFF5FB] h-[72px] shrink-0 cursor-pointer hover:shadow-sm hover:border-[#cbd5e1] transition-all group"
            onClick={() => {
              setSelectedAchievement(item);
              setIsModalOpen(true);
            }}
          >
            <div className="flex items-center gap-3 overflow-hidden mr-2">
              <div className="text-[24px] shrink-0 group-hover:scale-110 transition-transform">{item.emoji}</div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-[#0f172a] text-[14px] truncate group-hover:text-[#3b82f6] transition-colors">{item.title}</span>
                <span className="text-[#64748b] text-[12px] truncate">{item.desc}</span>
              </div>
            </div>
            <span className="text-white bg-gradient-to-br from-[#1E69DA] to-[#5694F0] px-2 py-1 rounded-full text-[11px] font-bold shrink-0 min-w-[70px] text-center flex justify-center">{item.status}</span>
          </div>
        )
      });
    });

    const hasUnseenCoding = unseenBadges.some(id => practiceBadges.find(b => b.id === id)?.section === 'Coding');
    const hasUnseenTech = unseenBadges.some(id => practiceBadges.find(b => b.id === id)?.section === 'Technical');
    const hasUnseenNonTech = unseenBadges.some(id => practiceBadges.find(b => b.id === id)?.section === 'Non-Technical');

    const getSectionScore = (section) => {
      const idx = practiceBadges.findIndex(b => b.section === section);
      if (idx !== -1) return getScore(practiceBadges[idx].id);
      return 9999;
    };

    combinedList.push({
      score: getSectionScore('Technical'),
      el: (
        <div 
          key="tech"
          onClick={() => openPracticeModal("Technical")}
          className={`flex items-center justify-between p-3 rounded-xl border ${hasUnseenTech ? 'border-[#3b82f6] shadow-sm' : 'border-[#e2e8f0]'} bg-[#EFF5FB] h-[72px] shrink-0 cursor-pointer hover:shadow-sm hover:border-[#cbd5e1] transition-all group relative`}
        >
          {hasUnseenTech && <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-[#3b82f6] rounded-full border-[1.5px] border-white shadow-sm z-10 animate-pulse" />}
          <div className="flex items-center gap-3 overflow-hidden mr-2">
            <div className="text-[24px] shrink-0 group-hover:scale-110 transition-transform">💻</div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-[#0f172a] text-[14px] truncate group-hover:text-[#3b82f6] transition-colors">Tech Badges</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-white bg-gradient-to-br from-[#1E69DA] to-[#5694F0] px-2 py-1 rounded-full text-[11px] font-bold shrink-0 min-w-[70px] text-center flex justify-center">{technicalBadges.length} Earned</span>
            {hasUnseenTech && <span className="text-[9px] font-bold text-[#3b82f6] uppercase tracking-wider">New</span>}
          </div>
        </div>
      )
    });

    combinedList.push({
      score: getSectionScore('Non-Technical'),
      el: (
        <div 
          key="non-tech"
          onClick={() => openPracticeModal("Non-Technical")}
          className={`flex items-center justify-between p-3 rounded-xl border ${hasUnseenNonTech ? 'border-[#8b5cf6] shadow-sm' : 'border-[#e2e8f0]'} bg-[#EFF5FB] h-[72px] shrink-0 cursor-pointer hover:shadow-sm hover:border-[#cbd5e1] transition-all group relative`}
        >
          {hasUnseenNonTech && <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-[#8b5cf6] rounded-full border-[1.5px] border-white shadow-sm z-10 animate-pulse" />}
          <div className="flex items-center gap-3 overflow-hidden mr-2">
            <div className="text-[24px] shrink-0 group-hover:scale-110 transition-transform">🧠</div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-[#0f172a] text-[14px] truncate group-hover:text-[#3b82f6] transition-colors">Non-Tech Badges</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-white bg-gradient-to-br from-[#1E69DA] to-[#5694F0] px-2 py-1 rounded-full text-[11px] font-bold shrink-0 min-w-[70px] text-center flex justify-center">{nonTechnicalBadges.length} Earned</span>
            {hasUnseenNonTech && <span className="text-[9px] font-bold text-[#8b5cf6] uppercase tracking-wider">New</span>}
          </div>
        </div>
      )
    });

    combinedList.push({
      score: getSectionScore('Coding'),
      el: (
        <div 
          key="coding"
          onClick={() => openPracticeModal("Coding")}
          className={`flex items-center justify-between p-3 rounded-xl border ${hasUnseenCoding ? 'border-[#f59e0b] shadow-sm' : 'border-[#e2e8f0]'} bg-[#EFF5FB] h-[72px] shrink-0 cursor-pointer hover:shadow-sm hover:border-[#cbd5e1] transition-all group relative`}
        >
          {hasUnseenCoding && <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-[#f59e0b] rounded-full border-[1.5px] border-white shadow-sm z-10 animate-pulse" />}
          <div className="flex items-center gap-3 overflow-hidden mr-2">
            <div className="text-[24px] shrink-0 group-hover:scale-110 transition-transform">⌨️</div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-[#0f172a] text-[14px] truncate group-hover:text-[#3b82f6] transition-colors">Coding Badges</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-white bg-gradient-to-br from-[#1E69DA] to-[#5694F0] px-2 py-1 rounded-full text-[11px] font-bold shrink-0 min-w-[70px] text-center flex justify-center">{codingBadges.length} Earned</span>
            {hasUnseenCoding && <span className="text-[9px] font-bold text-[#f59e0b] uppercase tracking-wider">New</span>}
          </div>
        </div>
      )
    });

    combinedList.sort((a, b) => a.score - b.score);
    return combinedList.map(t => t.el);
  };

  return (
    <div className="w-full h-full flex flex-col min-h-0">
      <h3 className="m-0 font-extrabold text-[#0f172a] text-[18px] mb-2 sticky top-0 bg-white z-10 pt-1 shrink-0">Achievements</h3>

      <div className="flex flex-col gap-3 overflow-y-auto scroll-smooth [&::-webkit-scrollbar]:hidden flex-1 pb-2 px-1.5 pt-1.5">
        {renderAllAchievements()}
      </div>
      <AchievementDetailsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        achievement={selectedAchievement} 
      />
      
      <Modal
        title={<span className="font-bold text-[18px] flex items-center gap-2">{practiceModalType === "Technical" ? '💻' : '🧠'} {practiceModalType} Practice Badges</span>}
        open={isPracticeModalOpen}
        onCancel={() => setIsPracticeModalOpen(false)}
        footer={null}
        width={600}
        centered
        bodyStyle={{ maxHeight: '70vh', overflowY: 'auto', padding: '24px 16px' }}
        closeIcon={<span className="text-gray-400 hover:text-gray-600 text-xl">✕</span>}
      >
        {renderBadgeList(practiceModalType === "Technical" ? technicalBadges : practiceModalType === "Coding" ? codingBadges : nonTechnicalBadges)}
      </Modal>
    </div>
  );
};

// Resolve current user id: prefer studentCreds._id, fall back to sessionStorage
// (studentCreds may not be hydrated yet on first paint).
const resolveUserId = (studentCreds) => {
  if (studentCreds?._id) return studentCreds._id;
  if (typeof window === "undefined") return null; // SSR guard
  try {
    return sessionStorage.getItem("studentId") || null;
  } catch {
    return null;
  }
};

export default function DashboardPage() {
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [activeNoticeIndex, setActiveNoticeIndex] = useState(null);
  
  const searchParams = useSearchParams();
  const studentCreds = useSelector((state) => state.student.student?.data);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleOpenNoticeBoard = (e) => {
      if (e.detail?.index !== undefined) {
        setActiveNoticeIndex(e.detail.index);
      }
      setIsNoticeModalOpen(true);
    };
    window.addEventListener("openNoticeBoard", handleOpenNoticeBoard);
    return () => window.removeEventListener("openNoticeBoard", handleOpenNoticeBoard);
  }, [studentCreds?._id]);

  const isMobile = useResponsive(); // < 1024px → mobile layout

  // Inject keyframes for the timer bar
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes fillRightToLeft {
        0% { width: 0%; right: 0; }
        100% { width: 100%; right: 0; }
      }
      @keyframes fillLeftToRight {
        0% { width: 0%; left: 0; }
        100% { width: 100%; left: 0; }
      }
      @keyframes smoothFadeIn {
        from { opacity: 0.3; transform: scale(0.98); }
        to { opacity: 1; transform: scale(1); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const [greeting, setGreeting] = useState("Welcome to SkillMedha!");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning, ready to learn something new?");
    else if (hour < 18) setGreeting("Good Afternoon, let's keep the momentum going!");
    else setGreeting("Good Evening, perfect time for some upskilling!");
  }, []);

  const allInternships = useSelector(
    (state) => state.internship.allInternships
  );
  const allCourses = useSelector((state) => state.internship.allCourses);
  const allCoursesOnly = useSelector((state) => state.internship.allCoursesOnly);
  const allInternshipsOnly = useSelector((state) => state.internship.allInternshipsOnly);
  const router = useAppRouter();
  const dispatch = useDispatch();

  // Removed learningColumns as we will render cards directly

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(4); // Items per page
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [recCourseIndex, setRecCourseIndex] = useState(0);
  const [recInternshipIndex, setRecInternshipIndex] = useState(0);

  // Per-course/internship progress, keyed by item id.
  // Shape per entry: { completedCount, totalCount, totalProgress, loading, error }
  const [progressById, setProgressById] = useState({});
  // Ids already requested (or in flight) — prevents re-firing the same call
  // every render / pagination change.
  const requestedIdsRef = useRef(new Set());

  const userId = resolveUserId(studentCreds);

  useEffect(() => {
    const timer = setInterval(() => {
      setRecCourseIndex(prev => prev + 1);
      setRecInternshipIndex(prev => prev + 1);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Fetch data with error handling
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        dispatch(getAllInternships({ cursor: null, limit: 20 })),
        dispatch(getAllCourses({ limit: 20, cursor: null, type: "course" })),
        dispatch(getAllCoursesOnly({ limit: 20, cursor: null, type: "course" })),
        dispatch(getAllInternshipsOnly({ limit: 20, cursor: null })),
        dispatch(GetAllNotifiocations()),
      ]);
    } catch (error) {
      console.error("Error fetching resources:", error);
      setError("Failed to load data. Please try again.");
      message.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Streak management
  useEffect(() => {
    if (typeof window !== "undefined") {
      const today = new Date().toDateString();
      let lastLogin = studentCreds?.lastLoginDate || localStorage.getItem("lastLoginDate");
      let currentStreak = studentCreds?.loginStreak || parseInt(localStorage.getItem("loginStreak") || "0", 10);
      
      if (isNaN(currentStreak)) currentStreak = 1;

      let streakChanged = false;
      
      if (lastLogin) {
        if (lastLogin !== today) {
          const lastLoginDate = new Date(lastLogin);
          const todayDate = new Date(today);
          const diffTime = todayDate.getTime() - lastLoginDate.getTime();
          const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)); // Use Math.round to handle DST shifts
          
          if (diffDays === 1) {
            currentStreak += 1;
            localStorage.removeItem("streakBrokenNotify");
          } else if (diffDays > 1) {
            currentStreak = 1;
            localStorage.setItem("streakBrokenNotify", "true");
          }
          streakChanged = true;
        } else if (currentStreak === 0) {
          currentStreak = 1;
          streakChanged = true;
        }
      } else {
        currentStreak = 1;
        streakChanged = true;
        localStorage.removeItem("streakBrokenNotify");
      }

      if (streakChanged) {
        localStorage.setItem("lastLoginDate", today);
        localStorage.setItem("loginStreak", currentStreak.toString());
        
        if (studentCreds?._id) {
          dispatch(updateStudent({
            aboutDetails: {
              _id: studentCreds._id,
              email: studentCreds.email,
              loginStreak: currentStreak,
              lastLoginDate: today
            },
            dispatch
          }));
        }
      }
    }
  }, [studentCreds, dispatch]);

  // Memoized profile values
  const profileValues = useMemo(() => {
    return calculateProfileCompletion(studentCreds || {});
  }, [studentCreds]);

  // Memoized dashboard statistics
  const dashboardStats = useMemo(() => {
    const totalCoursesVal = allCourses?.summary?.totalAvailableCourses || 0;
    const totalInternshipsVal = allInternships?.summary?.totalAvailableInternships || 0;

    return [
      {
        title: "Enrolled courses",
        value: totalCoursesVal,
        icon: <HiOutlineBookOpen size={24} color="#24A058" />,
        iconBgStyle: { backgroundColor: '#e8f5e9' },
        link: "/student/course"
      },
      {
        title: "Enrolled internships",
        value: totalInternshipsVal,
        icon: <HiOutlineBriefcase size={24} color="#2980b9" />,
        iconBgStyle: { backgroundColor: '#e1f5fe' },
        link: "/student/internshipLibrary"
      },
      {
        title: "Practice questions",
        value: "100+",
        icon: <HiOutlineClipboardList size={24} color="#d35400" />,
        iconBgStyle: { backgroundColor: '#fff3e0' },
        link: "/student/practice-new/nontechnical"
      }
    ];
  }, [allCourses?.summary?.totalAvailableCourses, allInternships?.summary?.totalAvailableInternships]);

  // Combined and paginated learning data
  const combinedLearningData = useMemo(() => {
    return [...(allCourses?.data || []), ...(allInternships?.data || [])];
  }, [allCourses?.data, allInternships?.data]);

  // Paginated learning items
  const paginatedLearningData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return combinedLearningData.slice(startIndex, endIndex);
  }, [combinedLearningData, currentPage, pageSize]);

  // Fetch real per-item progress for whatever's visible on the current page.
  // getOneInternsip only needs { id, userId } — it doesn't use orgId at all.
  useEffect(() => {
    if (!userId) return;

    const itemsNeedingProgress = paginatedLearningData.filter((item) => {
      const itemId = item?._id;
      if (!itemId) return false;
      return !requestedIdsRef.current.has(itemId);
    });

    if (itemsNeedingProgress.length === 0) return;

    itemsNeedingProgress.forEach((item) => {
      const itemId = item._id;
      requestedIdsRef.current.add(itemId);

      setProgressById((prev) => ({
        ...prev,
        [itemId]: { ...(prev[itemId] || {}), loading: true },
      }));

      dispatch(getOneInternsip({ id: itemId, userId }))
        .then((res) => {
          // getOneInternsip uses thunkAPI.rejectWithValue on failure, which
          // makes the dispatched promise resolve (not reject) with an
          // action whose type ends in "/rejected". Handle that explicitly
          // instead of relying on .catch().
          if (res?.type?.endsWith("/rejected")) {
            setProgressById((prev) => ({
              ...prev,
              [itemId]: { ...(prev[itemId] || {}), loading: false, error: true },
            }));
            return;
          }

          const payload = res?.payload;
          setProgressById((prev) => ({
            ...prev,
            [itemId]: {
              completedCount: payload?.completedCount ?? 0,
              totalCount: payload?.totalCount ?? 0,
              totalProgress: payload?.totalProgress ?? 0,
              updatedAt: payload?.lastAccessed?.progressUpdatedAt || payload?.lastAccessed?.createdAt || Date.now(),
              loading: false,
            },
          }));
        })
        .catch((err) => {
          console.error("getOneInternsip failed for", itemId, err);
          setProgressById((prev) => ({
            ...prev,
            [itemId]: { ...(prev[itemId] || {}), loading: false, error: true },
          }));
        });
    });
  }, [paginatedLearningData, userId, dispatch]);

  // Handle pagination change
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  // Retry handler
  const handleRetry = useCallback(() => {
    fetchAllData();
  }, [fetchAllData]);

  if (error) {
    return (
      <div className="text-center p-8">
        <p>Error loading dashboard: {error}</p>
        <Button onClick={handleRetry} type="primary">
          Retry
        </Button>
      </div>
    );
  }

  if (isMobile) {
    return (
      <MobileDashboard
        studentCreds={studentCreds}
        greeting={greeting}
        dashboardStats={dashboardStats}
        combinedLearningData={combinedLearningData}
        profileValues={profileValues}
        allCourses={allCourses}
        allInternships={allInternships}
        recIndex={recCourseIndex}
        setRecIndex={setRecCourseIndex}
        isNoticeModalOpen={isNoticeModalOpen}
        setIsNoticeModalOpen={setIsNoticeModalOpen}
        loading={loading}
        router={router}
        dispatch={dispatch}
        progressById={progressById}
      />
    );
  }

  return (
    <section className="w-full h-full flex flex-col items-stretch lg:pt-0 bg-[#EFF5FB]">
      {/* Welcome Section - Top Full Width */}
      <div className="w-full h-[140px] min-h-[140px] flex flex-col justify-center items-start gap-2 p-4 lg:px-8 lg:py-6 border-b-[1px] border-white/10 shadow-sm rounded-2xl lg:rounded-none bg-gradient-to-br from-[#071631] to-[#10254c] text-white shrink-0 relative overflow-hidden z-[2]">
        {/* Decorative Icons matching TPO Portal */}
        <div className="absolute inset-0 pointer-events-none z-[1]">
          <BsX className="absolute top-[20%] right-[10%] text-[#1E69DA] opacity-60 text-[1.2rem]" />
          <BsPlus className="absolute bottom-[20%] right-[30%] text-[#1E69DA] opacity-50 text-[1.5rem]" />
          <BsStar className="absolute top-[40%] right-[50%] text-[#1E69DA] opacity-50 text-[1.1rem]" />
          <BsX className="absolute bottom-[30%] right-[5%] text-[#1E69DA] opacity-60 text-[1.3rem]" />
        </div>

        <div className="w-full flex items-center justify-between relative z-[2]">
          <p className="text-[18px] lg:text-[24px] font-bold text-white m-0">
            {mounted && studentCreds?.userName
              ? `Hi ${studentCreds.userName.charAt(0).toUpperCase() + studentCreds.userName.slice(1)},`
              : "Hi,"}
          </p>
          <div className="text-[11px] lg:text-[13px] font-bold tracking-[0.5px] uppercase text-[#cbd5e1]">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
        <p className="text-[18px] lg:text-[32px] font-bold text-white m-0 tracking-tight relative z-[2]">{greeting}</p>
      </div>

      <div className="w-full flex-1 flex flex-col lg:flex-row items-stretch overflow-hidden relative">
        <div className="w-full lg:flex-1 h-full flex flex-col items-center lg:items-start gap-6 overflow-y-auto [&::-webkit-scrollbar]:hidden px-2 lg:px-8 py-4 lg:py-6">

          {/* Dashboard Statistics Card */}
          <div className="w-full flex justify-start">
            <DashboardStats stats={dashboardStats} router={router} />
          </div>

          {/* Continue Learning Section with Pagination */}
          <div className="w-full rounded-2xl bg-white py-4 px-4 lg:px-6 shadow-sm border border-[#e2e8f0]">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[18px] lg:text-[22px] font-extrabold">
                <span>Continue Learning</span>
                {combinedLearningData.length > pageSize && (
                  <span className="text-[14px] text-[#666] ml-4 font-normal">
                    ({combinedLearningData.length} total items)
                  </span>
                )}
              </div>
              {combinedLearningData.length > pageSize && (
                <Pagination
                  current={currentPage}
                  total={combinedLearningData.length}
                  pageSize={pageSize}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  showQuickJumper={false}
                  size="small"
                />
              )}
            </div>

            {loading ? (
              <div className="text-center p-8">
                <Spin size="large" />
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div 
                  key={currentPage}
                  className="flex flex-col gap-3 w-full"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {paginatedLearningData.length === 0 ? (
                    <div className="flex items-center justify-center h-[100px] text-[#64748b] text-[14px]">
                      No active courses or internships found.
                    </div>
                  ) : (
                    paginatedLearningData.map((item) => {
                    const hasLastAccessed = item?.lastAccessedSection !== undefined && item?.lastAccessedSection !== null;
                    const handleNavigate = () => {
                      const basePath = item?.type === "internship" ? "/student/learning-internship" : "/student/learning-course";
                      let url = `${basePath}?title=${item?.title?.split(" ")?.join("")}&id=${item?._id}&orgId=${item?.sourceOrgId}`;
                      if (hasLastAccessed) {
                        url += `&section=${item.lastAccessedSection}`;
                        if (item.lastAccessedTopic !== undefined && item.lastAccessedTopic !== null) url += `&topic=${item.lastAccessedTopic}`;
                      }
                      router.push(url);
                    };

                    let lastAccessedInfo = "Not started";
                    if (hasLastAccessed) {
                      lastAccessedInfo = "In progress";
                    }

                    const isInternship = item?.type === "internship";

                    // Real progress from getOneInternsip, falling back to 0
                    // while the per-item fetch is still in flight or hasn't
                    // started (item.progress never actually exists on these
                    // payloads, so that old fallback never did anything).
                    const fetchedProgress = progressById[item._id];
                    const progressVal = fetchedProgress?.totalProgress ?? 0;
                    const isProgressLoading = fetchedProgress?.loading;

                    return (
                      <div key={item._id} className={`flex flex-col md:flex-row items-center justify-between p-3 bg-white border border-[#e2e8f0] rounded-[12px] hover:shadow-md transition-shadow border-l-[4px] ${isInternship ? 'border-l-[#0284c7]' : 'border-l-[#24A058]'}`}>
                        {/* Left Side: Icon & Info */}
                        <div className="flex items-center gap-4 w-full md:w-auto">
                          <div className={`w-[50px] h-[50px] rounded-xl flex items-center justify-center shrink-0 overflow-hidden ${isInternship ? 'bg-[#e1f5fe]' : 'bg-[#e8f5e9]'}`}>
                            {isInternship ? (
                              <LaptopOutlined style={{ fontSize: '24px', color: '#0284c7' }} />
                            ) : (
                              <ReadOutlined style={{ fontSize: '24px', color: '#24A058' }} />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-[#1e293b] text-[15px]">{item?.title}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[11px] font-semibold px-2 py-[2px] rounded-md ${isInternship ? 'bg-[#e1f5fe] text-[#0284c7]' : 'bg-[#e8f5e9] text-[#24A058]'}`}>
                                {isInternship ? 'Internship' : 'Course'}
                              </span>
                              <span className="text-[12px] text-[#64748b]">
                                {isProgressLoading ? "Loading…" : lastAccessedInfo} · Added {new Date(item?.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right Side: Progress & Button */}
                        <div className="flex flex-col items-end gap-1 w-full md:w-auto mt-4 md:mt-0">
                          <div className="flex items-center gap-2 w-[180px] justify-end">
                            <Progress 
                              percent={progressVal} 
                              size="small" 
                              showInfo={false} 
                              strokeColor={hasLastAccessed ? '#4f46e5' : '#24A058'} 
                              railColor="#f1f5f9"
                              className="m-0 w-[120px]"
                            />
                            <span className="text-[12px] text-[#64748b] font-medium min-w-[30px] text-right">{progressVal}%</span>
                          </div>
                          <Button
                            onClick={handleNavigate}
                            className="!bg-gradient-to-br !from-[#1E69DA] !to-[#5694F0] !border-none !text-white hover:opacity-90"
                            style={{
                              fontWeight: '600',
                              borderRadius: '8px',
                              padding: '4px 16px',
                              height: '32px'
                            }}
                          >
                            {hasLastAccessed ? "Continue" : "Start Learning"}
                          </Button>
                        </div>
                      </div>
                  );
                }))}
              </motion.div>
              </AnimatePresence>
            )}
          </div>
          {/* Grouped Recommended Section */}
          {(allCoursesOnly?.length > 0 || allInternshipsOnly?.length > 0) && (
            <div className="w-full rounded-2xl bg-white p-4 lg:p-6 mt-4 flex flex-col items-center">
              <div className="w-full flex flex-col md:flex-row gap-6 md:gap-0 items-stretch">
                {allCoursesOnly?.length > 0 && (
                  <div className="flex-1 flex flex-col items-center border-b md:border-b-0 pb-6 md:pb-0 md:pr-6 md:border-r border-[#e2e8f0]">
                    <div className="w-full text-left mb-3 pl-4">
                      <span className="text-[16px] lg:text-[18px] font-extrabold text-[#1e293b]">Recommended Course</span>
                    </div>
                    <div className="w-full h-full flex flex-col justify-between overflow-hidden">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={recCourseIndex}
                          initial={{ opacity: 0, scale: 0.96, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.96, y: -10 }}
                          transition={{ duration: 0.35, ease: "easeInOut" }}
                          className="w-full h-full"
                        >
                          <RecommendedCard
                            item={allCoursesOnly[recCourseIndex % allCoursesOnly.length]}
                            total={allCoursesOnly.length}
                            currentIndex={recCourseIndex}
                            onDotClick={setRecCourseIndex}
                            onPrevClick={() => setRecCourseIndex(prev => prev === 0 ? allCoursesOnly.length - 1 : prev - 1)}
                            onNextClick={() => setRecCourseIndex(prev => prev + 1)}
                            onCardClick={(item) => {
                              router.push(
                                `/student/course`
                              );
                            }}
                          />
                        </motion.div>
                      </AnimatePresence>
                      <div className="w-full h-[4px] bg-[#f1f5f9] mt-4 rounded-full relative overflow-hidden shrink-0">
                        <div
                          key={`course-${recCourseIndex}`}
                          className="absolute top-0 right-0 h-full bg-gradient-to-br from-[#1E69DA] to-[#5694F0]"
                          style={{ animation: 'fillRightToLeft 10s linear forwards' }}
                        />
                      </div>
                    </div>
                  </div>
                )}
                {allInternshipsOnly?.length > 0 && (
                  <div className="flex-1 flex flex-col items-center pt-6 md:pt-0 md:pl-6">
                    <div className="w-full text-left mb-3 pl-4">
                      <span className="text-[16px] lg:text-[18px] font-extrabold text-[#1e293b]">Recommended Internship</span>
                    </div>
                    <div className="w-full h-full flex flex-col justify-between overflow-hidden">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={recInternshipIndex}
                          initial={{ opacity: 0, scale: 0.96, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.96, y: -10 }}
                          transition={{ duration: 0.35, ease: "easeInOut" }}
                          className="w-full h-full"
                        >
                          <RecommendedCard
                            item={allInternshipsOnly[recInternshipIndex % allInternshipsOnly.length]}
                            total={allInternshipsOnly.length}
                            currentIndex={recInternshipIndex}
                            onDotClick={setRecInternshipIndex}
                            onPrevClick={() => setRecInternshipIndex(prev => prev === 0 ? allInternshipsOnly.length - 1 : prev - 1)}
                            onNextClick={() => setRecInternshipIndex(prev => prev + 1)}
                            onCardClick={(item) => {
                              router.push(
                                `/student/internshipLibrary`                          
                              );
                            }}
                          />
                        </motion.div>
                      </AnimatePresence>
                      <div className="w-full h-[4px] bg-[#f1f5f9] mt-4 rounded-full relative overflow-hidden shrink-0">
                        <div
                          key={`internship-${recInternshipIndex}`}
                          className="absolute top-0 left-0 h-full bg-gradient-to-br from-[#1E69DA] to-[#5694F0]"
                          style={{ animation: 'fillLeftToRight 10s linear forwards' }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="hidden lg:flex w-[280px] xl:w-[320px] h-full flex-col overflow-hidden bg-white border-l-[1px] border-[#e2e8f0] px-4 pt-0 pb-2 shrink-0 z-10 shadow-sm relative">
          <div className="w-full flex flex-col flex-1 h-full min-h-0">
            {/* Section 1: Overall Performance */}
            <div className="w-full shrink-0 pt-0 pb-3">
              <ProfileSection
                profileValues={profileValues}
                router={router}
                studentCreds={studentCreds}
              />
            </div>
            
            {/* Section 2: Notice Board */}
            <div className="w-full flex flex-col relative border-t border-[#f1f5f9] pt-2 min-h-0 flex-1">
              <div className="w-full flex items-center justify-between mb-3 sticky top-0 bg-white z-10 shrink-0">
                <h3 className="m-0 font-extrabold text-[#0f172a] text-[18px]">Notice Board</h3>
                <svg width="0" height="0" className="absolute">
                  <linearGradient id="expandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop stopColor="#1E69DA" offset="0%" />
                    <stop stopColor="#5694F0" offset="100%" />
                  </linearGradient>
                </svg>
                <HiOutlineArrowsExpand
                  className="text-[1.2rem] cursor-pointer transition-transform duration-200 hover:scale-125"
                  style={{ stroke: "url(#expandGradient)" }}
                  onClick={() => setIsNoticeModalOpen(true)}
                />
              </div>
              <div className="w-full overflow-y-auto [&::-webkit-scrollbar]:hidden flex-1 pb-2">
                <CardsList type="notifications" progressById={progressById} combinedLearningData={combinedLearningData} />
              </div>
            </div>
            
            {/* Section 3: Achievements */}
            <div className="w-full flex flex-col relative border-t border-[#f1f5f9] pt-2 min-h-0 flex-1">
              <Achievements progressById={progressById} combinedLearningData={combinedLearningData} studentCreds={studentCreds} />
            </div>
          </div>
        </div>

          <Modal
            title="Notice Board"
            open={isNoticeModalOpen}
            onCancel={() => setIsNoticeModalOpen(false)}
            footer={null}
            width={1000}
          >
          <div style={{ height: "70vh", overflowY: "auto" }}>
            <CardsList 
              type="notifications" 
              isModal={true} 
              progressById={progressById} 
              combinedLearningData={combinedLearningData}
              activeNoticeIndex={activeNoticeIndex}
            />
          </div>
          </Modal>
        </div>
    </section>
  );
}