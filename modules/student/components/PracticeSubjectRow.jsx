import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pagination, Spin } from "antd";
import PracticeCard from "./PracticeCard";
import { useSelector, useDispatch } from "react-redux";
import { setCategoryProgress } from "@/redux/slices/practiceSlice";
import { useRouter, usePathname } from "next/navigation";
import { getLstorage } from "@/universalUtils/windowMW";
import axios from "axios";
import { restUrl } from "@/config/urls";

const api = axios.create({
  baseURL: restUrl,
});

const getAuthHeaders = () => ({
  Authorization: `Bearer ${getLstorage("token")}`,
});

export default function PracticeSubjectRow({ subject, pageSizeOverride, activeSort }) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentPage, setCurrentPage] = useState(1);
  const [subtopics, setSubtopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [columns, setColumns] = useState(4); // Default to 4 columns
  const studentPracResults = useSelector((state) => state.practice.studentPracResults || []);
  const studentData = useSelector((state) => state.student.student?.data);
  const dispatch = useDispatch();

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width >= 1920) setColumns(6);      // Extremely large monitors
      else if (width >= 1600) setColumns(5); // Large monitors
      else if (width >= 1024) setColumns(4); // Laptops/Desktops
      else if (width >= 768) setColumns(2);  // Tablets
      else setColumns(1);                    // Mobile
    };
    
    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  // If activeCategory === 'All', pageSizeOverride is 4 (1 row). Otherwise 8 (2 rows).
  const rows = pageSizeOverride === 8 ? 2 : 1;
  const pageSize = columns * rows;

  useEffect(() => {
    let isMounted = true;
    const fetchSubtopics = async () => {
      try {
        setLoading(true);
        // Fetch topics for this subject
        const topicsRes = await api.get(`/topics/subject/${subject._id}`, {
          headers: getAuthHeaders(),
        });
        const topics = topicsRes.data?.data || [];

        // Fetch subtopics for all topics
        const allSubtopics = [];
        for (const topic of topics) {
          const subRes = await api.get(`/subtopics/topic/${topic._id}`, {
            headers: getAuthHeaders(),
          });
          const subs = subRes.data?.data || [];
          
          for (const s of subs) {
            allSubtopics.push({
               ...s,
               topicTitle: topic.title,
               totalQuestions: s.totalQuestions || 20 // Fallback since frontend-only doesn't have counts
            });
          }
        }
        
        if (isMounted) {
          setSubtopics(allSubtopics);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching subtopics for subject", subject.title, error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSubtopics();
    return () => { isMounted = false; };
  }, [subject._id, subject.title]);
  
  const getSubtopicStats = (subtopic) => {
    const sessions = studentPracResults.filter(
      (session) => session.refId === subtopic._id
    );
    if (sessions.length === 0) return { progress: 0, attempts: 0, flawlessLevel: 0, recallLevel: 0, seenCount: 0, dbTotalQuestions: subtopic.totalQuestions || 0 };

    sessions.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

    const totalQuestionsLimit = Math.min(subtopic.totalQuestions || 20, 20);
    const dbTotalQuestions = subtopic.totalQuestions || 0;
    
    let maxCorrect = 0;
    let globalSeen = new Set();
    let flawlessLevel = 0;
    let recallLevel = 0;
    
    const completedSessions = sessions.filter(s => s.correctQuestionIds !== undefined || s.score !== undefined);

    completedSessions.forEach((s) => {
      const correctCount = Array.isArray(s.correctQuestionIds) ? s.correctQuestionIds.length : (s.score || 0);
      if (correctCount > maxCorrect) {
        maxCorrect = correctCount;
      }
      
      let containedNewQuestions = false;
      if (Array.isArray(s.questionsData)) {
        s.questionsData.forEach(q => {
          if (q && q._id && !globalSeen.has(q._id.toString())) {
            containedNewQuestions = true;
            globalSeen.add(q._id.toString());
          }
        });
      }
      
      const presentedCount = Array.isArray(s.questionsData) ? s.questionsData.length : totalQuestionsLimit;
      if (presentedCount > 0 && correctCount === presentedCount) {
        if (containedNewQuestions) {
          flawlessLevel += 1;
        } else {
          recallLevel += 1;
        }
      }
    });

    let progress = Math.round((maxCorrect / totalQuestionsLimit) * 100);
    if (progress > 100) progress = 100;

    return { 
      progress, 
      attempts: completedSessions.length, 
      flawlessLevel, 
      recallLevel, 
      seenCount: globalSeen.size, 
      dbTotalQuestions 
    };
  };

  useEffect(() => {
    if (typeof window !== "undefined" && subtopics.length > 0) {
      const path = window.location.pathname;
      const isCoding = path.includes('/coding');
      const isNonTech = path.includes('/nontechnical');
      const sectionType = isCoding ? "Coding" : isNonTech ? "Non-Technical" : "Technical";

      const userId = studentData?._id || "";
      const noticeKey = `pendingPracticeNotices_${userId}`;
      const claimedKey = `claimedAchievements_${userId}`;
      const unseenKey = `unseenPracticeBadges_${userId}`;

      let pendingNotices = JSON.parse(localStorage.getItem(noticeKey) || "[]");
      let claimedBadges = JSON.parse(localStorage.getItem(claimedKey) || "[]");
      let hasUpdates = false;

      const totalProgress = subtopics.reduce((acc, st) => {
        const stats = getSubtopicStats(st);
        
        // 1. Check for New Questions Notice
        if (stats.seenCount > 0 && stats.dbTotalQuestions > stats.seenCount) {
          const noticeId = `new_questions_${st._id}_${stats.dbTotalQuestions}`;
          const existingNotice = pendingNotices.find(n => n.id === noticeId);
          if (!existingNotice && !claimedBadges.includes(noticeId)) {
            pendingNotices.push({
              id: noticeId,
              type: 'new_questions',
              title: `New Questions Added!`,
              message: `New questions have been added to ${st.title}! Take a practice test to earn a Flawless Master badge.`,
              isClaimed: false
            });
            hasUpdates = true;
          }
        }

        // 2. Check for Master Badges
        if (stats.flawlessLevel > 0 || stats.recallLevel > 0) {
          for (let i = 1; i <= stats.flawlessLevel; i++) {
            const badgeId = `practice_badge|${sectionType}|${st.topicTitle || subject.title}|${st.title}|Flawless|${i}`;
            if (!claimedBadges.includes(badgeId)) {
              claimedBadges.push(badgeId);
              localStorage.setItem(claimedKey, JSON.stringify(claimedBadges));
              
              const unseen = JSON.parse(localStorage.getItem(unseenKey) || "[]");
              if (!unseen.includes(badgeId)) {
                unseen.push(badgeId);
                localStorage.setItem(unseenKey, JSON.stringify(unseen));
              }

              if (!pendingNotices.find(n => n.id.includes(badgeId))) {
                pendingNotices.push({
                  id: `notice_${Date.now()}_${badgeId}`,
                  type: 'badge',
                  title: `🏆 Flawless Master: ${st.topicTitle || subject.title} - ${st.title}`,
                  message: `You scored 100% on new questions in ${st.title}! Claim your Flawless Master badge.`,
                  actionUrl: `#openBadges_${sectionType === 'Technical' ? 'Technical' : 'Non-Technical'}`,
                  actionText: 'Checkout',
                  isClaimed: false
                });
                hasUpdates = true;
              }
            }
          }
          
          for (let i = 1; i <= stats.recallLevel; i++) {
            const badgeId = `practice_badge|${sectionType}|${st.topicTitle || subject.title}|${st.title}|Recall|${i}`;
            if (!claimedBadges.includes(badgeId)) {
              claimedBadges.push(badgeId);
              localStorage.setItem(claimedKey, JSON.stringify(claimedBadges));
              
              const unseen = JSON.parse(localStorage.getItem(unseenKey) || "[]");
              if (!unseen.includes(badgeId)) {
                unseen.push(badgeId);
                localStorage.setItem(unseenKey, JSON.stringify(unseen));
              }

              if (!pendingNotices.find(n => n.id.includes(badgeId))) {
                pendingNotices.push({
                  id: `notice_${Date.now()}_${badgeId}`,
                  type: 'badge',
                  title: `🏅 Recall Master: ${st.topicTitle || subject.title} - ${st.title}`,
                  message: `You scored 100% on practiced questions in ${st.title}! Claim your Recall Master badge.`,
                  actionUrl: `#openBadges_${sectionType === 'Technical' ? 'Technical' : 'Non-Technical'}`,
                  actionText: 'Checkout',
                  isClaimed: false
                });
                hasUpdates = true;
              }
            }
          }
        }

        return acc + stats.progress;
      }, 0);
      
      if (hasUpdates) {
        localStorage.setItem("pendingPracticeNotices", JSON.stringify(pendingNotices));
      }

      const avgProgress = Math.round(totalProgress / subtopics.length);
      dispatch(setCategoryProgress({ category: subject.title, progress: avgProgress }));
    }
  }, [subtopics, studentPracResults, subject, dispatch]);

  if (loading) {
    return <div className="py-8 flex justify-center"><Spin /></div>;
  }

  if (!subtopics || subtopics.length === 0) {
    return null;
  }

  const startIndex = (currentPage - 1) * pageSize;
  
  const sortedSubtopics = [...subtopics];
  if (activeSort === "Name") {
    sortedSubtopics.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  } else if (activeSort === "Recent") {
    sortedSubtopics.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (timeA !== timeB) return timeB - timeA;
      if (a._id && b._id) return a._id > b._id ? -1 : 1;
      return 0;
    });
  }

  const currentSubtopics = sortedSubtopics.slice(startIndex, startIndex + pageSize);

  const handleStart = (subtopic) => {
    // Navigate to test page with subtopic ID
    const isCoding = pathname.includes("/coding");
    const basePath = isCoding ? "/student/practice-new/coding/problems" : "/student/practice-new/test";
    
    router.push(`${basePath}?subT=${subtopic._id}&t=${subtopic.topicId}&sub=${subject._id}&title=${encodeURIComponent(subtopic.title)}&subjectTitle=${encodeURIComponent(subject.title)}&type=${encodeURIComponent(subject.type || "Technical")}`);
  };



  // Variants for scroll-in animation
  const rowVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  // Variants for pagination changes
  const cardVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      x: 20,
      transition: { duration: 0.2, ease: "easeIn" }
    }
  };

  return (
    <motion.div 
      className="mb-2 last:mb-6 mt-1"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={rowVariants}
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-[20px] font-bold text-[#071631] m-0">{subject.title}</h2>
        {subtopics.length > pageSize && (
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={subtopics.length}
            onChange={setCurrentPage}
            size="small"
            showSizeChanger={false}
          />
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={currentPage}
          className="grid gap-4 md:gap-6"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={cardVariants}
        >
          {currentSubtopics.map((subtopic) => {
            const stats = getSubtopicStats(subtopic);
            return (
              <PracticeCard 
                key={subtopic._id}
                id={subtopic._id}
                title={subtopic.title}
                category={subtopic.topicTitle || subject.title}
                totalQuestions={Math.min(subtopic.totalQuestions || 20, 20)}
                actualTotalQuestions={subtopic.totalQuestions || 0}
                attempts={stats.attempts}
                progress={stats.progress}
                onStart={() => handleStart(subtopic)}
                subjectTitle={subject.title}
              />
            );
          })}
        </motion.div>
      </AnimatePresence>
      
    </motion.div>
  );
}
