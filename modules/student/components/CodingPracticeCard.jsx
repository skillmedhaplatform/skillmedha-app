import React, { useState, useEffect } from "react";
import { Code2, ArrowRight, Clock, Trophy, Target, Activity } from "lucide-react";
import { Progress, Tooltip, Modal } from "antd";
import CodingBadge from "./CodingBadge";

export default function CodingPracticeCard({
  title,
  totalQuestions = 40,
  solvedCount = 0,
  onStart,
  onSolveNow,
  loading = false,
}) {
  const solved = solvedCount;
  const easyCount = Math.floor(totalQuestions * 0.5);
  const medCount = Math.floor(totalQuestions * 0.3);
  const hardCount = totalQuestions - easyCount - medCount;
  
  const completionPercent = totalQuestions > 0 ? Math.round((solved / totalQuestions) * 100) : 0;

  // RPG Title Generator
  const getRPGTitle = (percent) => {
    if (percent < 20) return "Novice";
    if (percent < 40) return "Adept";
    if (percent < 60) return "Expert";
    if (percent < 80) return "Master";
    return "Grandmaster";
  };
  const rpgTitle = `${(title || 'Coding').split(' ')[0]} ${getRPGTitle(completionPercent)}`;
  
  // Dynamic Badge Generator
  const getDynamicBadge = (percent) => {
    if (percent < 10) return { t: "Bronze", l: 1 };
    if (percent < 25) return { t: "Bronze", l: 2 };
    if (percent < 40) return { t: "Silver", l: 1 };
    if (percent < 60) return { t: "Silver", l: 2 };
    if (percent < 80) return { t: "Gold", l: 1 };
    return { t: "Diamond", l: 1 };
  };
  const currentBadge = getDynamicBadge(completionPercent);

  // Dynamic Up Next Generator
  const getNextTopic = (subjectTitle) => {
    const t = (subjectTitle || "").toLowerCase();
    if (t.includes("python")) return "List Comprehensions";
    if (t.includes("java") && !t.includes("script")) return "OOP Concepts";
    if (t.includes("c++") || t.includes("cpp")) return "STL Vectors";
    if (t.includes("c ") || t === "c" || t.includes("programming")) return "Pointers & Arrays";
    if (t.includes("sql")) return "Complex Joins";
    if (t.includes("javascript") || t.includes("js")) return "Async / Await";
    if (t.includes("react")) return "Hooks & State";
    if (t.includes("data structure") || t.includes("dsa")) return "Linked Lists";
    return "Variables & Data Types"; // Fallback
  };
  const dynamicNextTopic = getNextTopic(title);

  return (
    <div 
      className={`bg-white rounded-xl border border-slate-200 flex flex-col transition-all hover:border-blue-400 hover:shadow-lg relative overflow-hidden group ${!loading ? '' : 'opacity-80'}`}
    >
      {/* Sleek top accent line */}
      <div className="h-1 w-full bg-blue-500 absolute top-0 left-0 transition-transform origin-left transform scale-x-0 group-hover:scale-x-100" />
      
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm border border-blue-100">
              {(() => {
                const t = (title || "").toLowerCase();
                if (t.includes("python")) return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" width={26} height={26} alt="Python"/>;
                if (t.includes("java") && !t.includes("script")) return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" width={26} height={26} alt="Java"/>;
                if (t.includes("c++") || t.includes("cpp")) return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg" width={26} height={26} alt="C++"/>;
                if (t.includes("c ") || t === "c" || t.includes("programming")) return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg" width={26} height={26} alt="C"/>;
                if (t.includes("sql") || t.includes("database")) return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" width={26} height={26} alt="SQL"/>;
                if (t.includes("javascript") || t.includes("js")) return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" width={26} height={26} alt="JS"/>;
                if (t.includes("react")) return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width={26} height={26} alt="React"/>;
                if (t.includes("data structure") || t.includes("dsa")) return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg" width={26} height={26} alt="DSA"/>;
                return <Code2 size={24} strokeWidth={2.5} />;
              })()}
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-slate-800 tracking-tight leading-tight">{title}</h3>
              <div className="flex items-center gap-2 mt-1.5">
                <Tooltip title={`Based on your ${completionPercent}% completion rate`}>
                  <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md flex items-center gap-1.5 shadow-sm cursor-help transition-colors hover:bg-indigo-100">
                    <span className="text-[12px]">⚔️</span> {rpgTitle}
                  </span>
                </Tooltip>
              </div>
            </div>
          </div>
          
          <Tooltip title={`${solved} out of ${totalQuestions} solved`}>
            <div className="relative flex items-center justify-center">
               <Progress 
                 type="circle" 
                 percent={completionPercent} 
                 size={46} 
                 strokeWidth={10}
                 strokeColor={{ '0%': '#10b981', '100%': '#34d399' }}
                 trailColor="#f1f5f9"
                 format={() => <span className="text-[11px] font-bold text-slate-700">{completionPercent}%</span>}
               />
            </div>
          </Tooltip>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-2">
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex flex-col justify-center">
             <div className="flex items-center gap-1.5 mb-1 text-slate-500">
                <Target size={14} className="text-slate-400" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Up Next</span>
             </div>
             <div className="text-[13px] font-bold text-slate-800 line-clamp-1 mb-2" title={dynamicNextTopic}>{dynamicNextTopic}</div>
             <button 
               className="text-[11px] font-bold text-white bg-gradient-to-br from-[#1E69DA] to-[#5694F0] hover:opacity-90 py-1.5 rounded-md transition-all duration-300 w-full flex items-center justify-center gap-1 shadow-sm mt-auto"
               onClick={(e) => { e.stopPropagation(); if(onSolveNow) onSolveNow(); else if (onStart) onStart(); }}
             >
               Solve Now <ArrowRight size={12} />
             </button>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex flex-col justify-center relative">
             <div className="flex items-center justify-between mb-1 text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Trophy size={14} className="text-slate-400" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Current Badge</span>
                </div>
             </div>
             
             <div className="flex items-center gap-3 mt-1">
               <div className="mt-1">
                 <CodingBadge tier={currentBadge.t} level={currentBadge.l} size={40} />
               </div>
               <div>
                 <div className="text-[14px] font-bold text-slate-800 leading-none">{currentBadge.t} {currentBadge.l}</div>
               </div>
             </div>
          </div>
        </div>
      </div>

      <div 
        className="mt-auto border-t border-slate-100 px-6 py-3.5 flex items-center justify-between bg-white hover:bg-[#F8FAFC] transition-colors cursor-pointer group/footer"
        onClick={(e) => { e.stopPropagation(); onStart && onStart(); }}
      >
        <span className="text-[13px] font-bold text-slate-600 group-hover/footer:text-blue-600 transition-colors">
          View Problems
        </span>
        <ArrowRight 
          size={16} 
          className="text-slate-400 group-hover/footer:text-blue-600 transform group-hover/footer:translate-x-1 transition-all" 
        />
      </div>
    </div>
  );
}
