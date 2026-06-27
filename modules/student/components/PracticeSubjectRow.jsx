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

export default function PracticeSubjectRow({ subject, pageSizeOverride }) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentPage, setCurrentPage] = useState(1);
  const [subtopics, setSubtopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const pageSize = pageSizeOverride || 4; // default 1 row of 4
  const studentPracResults = useSelector((state) => state.practice.studentPracResults || []);
  const dispatch = useDispatch();

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
    if (sessions.length === 0) return { progress: 0, attempts: 0 };

    const totalQuestions = Math.min(subtopic.totalQuestions || 20, 20);
    const uniqueCorrectIds = new Set();
    
    sessions.forEach((s) => {
      if (Array.isArray(s.correctQuestionIds)) {
        s.correctQuestionIds.forEach((id) => uniqueCorrectIds.add(id));
      }
    });

    const correctCount = uniqueCorrectIds.size;
    let progress = Math.round((correctCount / totalQuestions) * 100);
    if (progress > 100) progress = 100;

    // Only count sessions that have been submitted (e.g. have correctQuestionIds or score)
    const completedSessions = sessions.filter(s => s.correctQuestionIds !== undefined || s.score !== undefined);

    return { progress, attempts: completedSessions.length };
  };

  useEffect(() => {
    if (subtopics.length > 0) {
      const totalProgress = subtopics.reduce((acc, st) => acc + getSubtopicStats(st).progress, 0);
      const avgProgress = Math.round(totalProgress / subtopics.length);
      dispatch(setCategoryProgress({ category: subject.title, progress: avgProgress }));
    }
  }, [subtopics, studentPracResults, subject.title, dispatch]);

  if (loading) {
    return <div className="py-8 flex justify-center"><Spin /></div>;
  }

  if (!subtopics || subtopics.length === 0) {
    return null;
  }

  const startIndex = (currentPage - 1) * pageSize;
  const currentSubtopics = subtopics.slice(startIndex, startIndex + pageSize);

  const handleStart = (subtopic) => {
    // Navigate to test page with subtopic ID
    const isCoding = pathname.includes("/coding");
    const basePath = isCoding ? "/student/practice-new/coding/codingtest" : "/student/practice-new/test";
    
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
          className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6"
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
                title={subtopic.title}
                category={subtopic.topicTitle || subject.title}
                totalQuestions={Math.min(subtopic.totalQuestions || 20, 20)}
                attempts={stats.attempts}
                progress={stats.progress}
                onStart={() => handleStart(subtopic)}
                subjectTitle={subject.title}
              />
            );
          })}
        </motion.div>
      </AnimatePresence>
      
      {/* Pagination on bottom for mobile */}
      <div className="flex justify-end mt-6 lg:hidden">
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
    </motion.div>
  );
}
