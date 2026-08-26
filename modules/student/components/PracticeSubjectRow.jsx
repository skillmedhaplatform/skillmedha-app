import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pagination, Spin, Modal as AntModal, Button } from "antd";
import PracticeCard from "./PracticeCard";
import DifficultyModal from "./DifficultyModal";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { getLstorage } from "@/universalUtils/windowMW";
import axios from "axios";
import { restUrl } from "@/config/urls";
import RulesModal from "./RulesModal";
import { HelpCircle } from "lucide-react";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [levelUpData, setLevelUpData] = useState(null); // { oldLevel, newLevel }
  const [selectedSubtopic, setSelectedSubtopic] = useState(null);
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
          
          if (subs.length === 0) {
             // If there are no subtopics, the topic itself should act as the playable level
             allSubtopics.push({
                 _id: null,
                 topicId: topic._id,
                 title: topic.title,
                 topicTitle: topic.title,
                 totalQuestions: typeof topic.totalQuestions === "number" ? topic.totalQuestions : 20
             });
          } else {
            for (const s of subs) {
              allSubtopics.push({
                 ...s,
                 topicTitle: topic.title,
                 totalQuestions: typeof s.totalQuestions === "number" ? s.totalQuestions : 20
              });
            }
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
      (session) => session.refId === subtopic._id || (subtopic._id === null && session.refId === subtopic.topicId)
    );
    if (sessions.length === 0) return { easyPassCount: 0, mediumPassCount: 0, hardPassCount: 0, easyAttempts: 0, mediumAttempts: 0, hardAttempts: 0, dbTotalQuestions: subtopic.totalQuestions || 0, attempts: 0 };

    let easyPassCount = 0;
    let mediumPassCount = 0;
    let hardPassCount = 0;
    
    let easyAttempts = 0;
    let mediumAttempts = 0;
    let hardAttempts = 0;
    
    sessions.forEach(s => {
      const diff = s.difficulty?.toLowerCase();
      const isCompleted = s.score !== undefined;

      if (isCompleted) {
        if (diff === 'easy') easyAttempts++;
        if (diff === 'medium') mediumAttempts++;
        if (diff === 'hard') hardAttempts++;
      }

      const scoreRatio = Array.isArray(s.questionsData) && s.questionsData.length > 0
        ? (s.correctQuestionIds?.length || s.score || 0) / s.questionsData.length
        : 0;

      if (isCompleted && scoreRatio >= 0.7) {
        if (diff === 'easy') easyPassCount++;
        if (diff === 'medium') mediumPassCount++;
        if (diff === 'hard') hardPassCount++;
      }
    });

    return { 
      easyPassCount,
      mediumPassCount,
      hardPassCount,
      easyAttempts,
      mediumAttempts,
      hardAttempts,
      dbTotalQuestions: subtopic.totalQuestions || 0,
      attempts: sessions.length
    };
  };

  const getMasteryLevelName = (minMultiplier) => {
    if (minMultiplier >= 5) return "Grandmaster";
    if (minMultiplier === 4) return "Master";
    if (minMultiplier === 3) return "Expert";
    if (minMultiplier === 2) return "Advanced";
    if (minMultiplier === 1) return "Intermediate";
    return "Novice";
  };

  useEffect(() => {
    if (subtopics && subtopics.length > 0 && studentPracResults && subject) {
      const userId = studentData?._id || "";
      const storageKey = `mastery_levels_${userId}`;
      const savedLevels = JSON.parse(localStorage.getItem(storageKey) || "{}");
      let hasUpdates = false;

      subtopics.forEach(st => {
        const stats = getSubtopicStats(st);
        const minMultiplier = Math.min(stats.easyPassCount, stats.mediumPassCount, stats.hardPassCount);
        const currentLevel = getMasteryLevelName(minMultiplier);
        
        const prevLevel = savedLevels[st._id || st.topicId] || "Novice";
        
        // If level changed and it's an upgrade (not a fresh load where they already have it)
        // Actually, to prevent spam on reload, we only show modal if it just updated in this session
        // For simplicity, we just save the highest achieved level. 
        if (currentLevel !== prevLevel && minMultiplier > 0) {
          // Check if this is an actual new rank up during this session
          const rankValues = { "Novice": 0, "Intermediate": 1, "Advanced": 2, "Expert": 3, "Master": 4, "Grandmaster": 5 };
          if (rankValues[currentLevel] > rankValues[prevLevel]) {
            // Trigger celebration
            setLevelUpData({ subtopicTitle: st.title || st.topicTitle, newLevel: currentLevel, prevLevel });
          }
          savedLevels[st._id || st.topicId] = currentLevel;
          hasUpdates = true;
        }
      });

      if (hasUpdates) {
        localStorage.setItem(storageKey, JSON.stringify(savedLevels));
      }
    }
  }, [subtopics, studentPracResults, subject, studentData]);

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

  const handleStartClick = (subtopic) => {
    setSelectedSubtopic(subtopic);
    setIsModalOpen(true);
  };

  const handleStartTest = (difficulty) => {
    setIsModalOpen(false);
    if (!selectedSubtopic) return;

    const isCoding = pathname.includes("/coding");
    const basePath = isCoding ? "/student/practice-new/coding/problems" : "/student/practice-new/test";
    
    router.push(`${basePath}?subT=${selectedSubtopic._id || ""}&t=${selectedSubtopic.topicId}&sub=${subject._id}&title=${encodeURIComponent(selectedSubtopic.title)}&subjectTitle=${encodeURIComponent(subject.title)}&type=${encodeURIComponent(subject.type || "Technical")}&diff=${difficulty}`);
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
        <h2 className="text-[20px] font-bold text-[#071631] m-0">
          {subject.title}
        </h2>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsRulesModalOpen(true)}
            className="flex items-center gap-1.5 text-[12px] text-slate-500 font-semibold px-3 py-1.5 rounded-full hover:bg-slate-200 hover:text-slate-800 transition-colors border border-slate-200 shadow-sm bg-white"
          >
            <HelpCircle size={14} />
            <span className="hidden sm:inline">Mastery Guide</span>
          </button>
          
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
      </div>

      <DifficultyModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStart={handleStartTest}
        refId={selectedSubtopic?._id || selectedSubtopic?.topicId}
        type={selectedSubtopic?._id ? "subTopicId" : "topicId"}
        subjectId={subject._id}
      />

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
          {currentSubtopics.map((sub) => {
            const stats = getSubtopicStats(sub);
            return (
              <PracticeCard
                key={sub._id || sub.topicId}
                id={sub._id}
                title={sub.title}
                category={sub.topicTitle || subject.title}
                attempts={stats.attempts}
                easyPassCount={stats.easyPassCount}
                mediumPassCount={stats.mediumPassCount}
                hardPassCount={stats.hardPassCount}
                easyAttempts={stats.easyAttempts}
                mediumAttempts={stats.mediumAttempts}
                hardAttempts={stats.hardAttempts}
                subjectTitle={subject.title}
                actualTotalQuestions={sub.totalQuestions}
                onStart={() => handleStartClick(sub)}
                loading={false}
                disableStart={sub.totalQuestions < 15}
              />
            );
          })}
        </motion.div>
      </AnimatePresence>

      <RulesModal 
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />

      <AntModal
        open={!!levelUpData}
        onCancel={() => setLevelUpData(null)}
        footer={null}
        centered
        className="celebration-modal"
        width={400}
      >
        <div className="text-center py-6">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Level Up!</h2>
          <p className="text-slate-600 mb-4">
            Congratulations! You have balanced your practice perfectly in <strong>{levelUpData?.subtopicTitle}</strong>.
          </p>
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6">
            <p className="text-indigo-900 font-medium">Rank Achieved:</p>
            <p className="text-xl font-black text-indigo-600 uppercase tracking-widest">{levelUpData?.newLevel}</p>
          </div>
          <Button 
            type="primary" 
            size="large" 
            className="w-full bg-indigo-600 font-bold"
            onClick={() => setLevelUpData(null)}
          >
            Awesome!
          </Button>
        </div>
      </AntModal>
    </motion.div>
  );
}
