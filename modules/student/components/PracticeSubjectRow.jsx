import React, { useState, useEffect } from "react";
import { Pagination, Spin } from "antd";
import PracticeCard from "./PracticeCard";
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

export default function PracticeSubjectRow({ subject }) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentPage, setCurrentPage] = useState(1);
  const [subtopics, setSubtopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const pageSize = 3; // 1 row of 3

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
    
    router.push(`${basePath}?subT=${subtopic._id}&t=${subtopic.topicId}&sub=${subject._id}`);
  };

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentSubtopics.map((subtopic) => (
          <PracticeCard
            key={subtopic._id}
            title={subtopic.title}
            category={subtopic.topicTitle || subject.title}
            totalQuestions={subtopic.totalQuestions || 0}
            attempts={0}
            onStart={() => handleStart(subtopic)}
            subjectTitle={subject.title}
          />
        ))}
      </div>
      
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
    </div>
  );
}
