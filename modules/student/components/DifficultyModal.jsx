import React, { useEffect, useState } from "react";
import { Modal, Spin, message } from "antd";
import { motion } from "framer-motion";
import axios from "axios";
import { restUrl } from "@/config/urls";
import { getLstorage } from "@/universalUtils/windowMW";

const api = axios.create({ baseURL: restUrl });
const getAuthHeaders = () => ({ Authorization: `Bearer ${getLstorage("token")}` });

export default function DifficultyModal({ isOpen, onClose, onStart, refId, type, subjectId }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ easy: 0, medium: 0, hard: 0 });

  useEffect(() => {
    if (isOpen && refId && type) {
      setLoading(true);
      api.get(`/difficultyStats`, {
        headers: getAuthHeaders(),
        params: { refId, type, subjectId }
      })
      .then(res => {
        setStats(res.data);
      })
      .catch(err => {
        console.error("Failed to fetch difficulty stats", err);
        message.error("Failed to load difficulty stats");
      })
      .finally(() => {
        setLoading(false);
      });
    }
  }, [isOpen, refId, type, subjectId]);

  const difficulties = [
    {
      level: "Easy",
      countReq: 25,
      time: 30,
      color: "from-green-400 to-green-600",
      shadow: "shadow-green-500/30",
      desc: "Perfect for warming up and reviewing fundamentals.",
      available: stats.easy >= 25
    },
    {
      level: "Medium",
      countReq: 20,
      time: 30,
      color: "from-yellow-400 to-yellow-600",
      shadow: "shadow-yellow-500/30",
      desc: "Test your core understanding with intermediate concepts.",
      available: stats.medium >= 20
    },
    {
      level: "Hard",
      countReq: 15,
      time: 30,
      color: "from-red-400 to-red-600",
      shadow: "shadow-red-500/30",
      desc: "Challenge yourself with complex, advanced problems.",
      available: stats.hard >= 15
    }
  ];

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      centered
      width={800}
      className="difficulty-modal"
      classNames={{
        mask: 'backdrop-blur-md bg-slate-900/60',
        content: 'bg-white rounded-3xl p-6 lg:p-10 shadow-2xl overflow-hidden relative'
      }}
      closeIcon={
        <div className="bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L13 13M1 13L13 1" stroke="#334155" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      }
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2">Select Difficulty</h2>
        <p className="text-slate-500">Choose your challenge level to begin the practice test.</p>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <Spin size="large" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {difficulties.map((diff, index) => (
            <motion.div
              key={diff.level}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div 
                className={`
                  relative overflow-hidden rounded-2xl border-2 transition-all duration-300 h-full flex flex-col
                  ${diff.available 
                    ? 'border-transparent bg-white shadow-xl hover:-translate-y-1 cursor-pointer hover:shadow-2xl' 
                    : 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'}
                `}
                onClick={() => diff.available && onStart(diff.level.toLowerCase())}
              >
                {/* Header background */}
                <div className={`h-24 bg-gradient-to-br ${diff.color} p-5 text-white flex flex-col justify-end`}>
                  <h3 className="text-2xl font-bold">{diff.level}</h3>
                </div>
                
                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <p className="text-slate-600 text-sm mb-4 min-h-[40px] leading-relaxed">
                    {diff.desc}
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm font-medium text-slate-700">
                      <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center mr-3 text-slate-500">
                        Q
                      </span>
                      {diff.countReq} Questions
                    </div>
                    <div className="flex items-center text-sm font-medium text-slate-700">
                      <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center mr-3 text-slate-500">
                        ⏱
                      </span>
                      {diff.time} Minutes
                    </div>
                  </div>

                  <button 
                    disabled={!diff.available}
                    className={`
                      mt-auto w-full py-3 rounded-xl font-bold transition-all
                      ${diff.available 
                        ? `bg-slate-900 text-white hover:bg-slate-800 shadow-md ${diff.shadow}` 
                        : 'bg-slate-200 text-slate-400'}
                    `}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (diff.available) onStart(diff.level.toLowerCase());
                    }}
                  >
                    {diff.available ? "Start Test" : "Insufficient Questions"}
                  </button>
                  
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Modal>
  );
}
