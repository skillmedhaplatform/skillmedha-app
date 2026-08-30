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

  const getGlowColor = () => {
    return "#1E69DA"; // Standard platform blue for unified aesthetic
  };
  const glowColor = getGlowColor();

  return (
    <div 
      className={`group bg-white rounded-[24px] border border-slate-100 flex flex-col transition-all duration-300 hover:border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] relative overflow-hidden transform hover:-translate-y-1 ${!loading ? '' : 'opacity-80'}`}
    >
      {/* Decorative ambient background glow */}
      <div 
        className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-[50px] opacity-[0.25] transition-all duration-500 group-hover:opacity-[0.6] group-hover:scale-110 pointer-events-none z-0"
        style={{ backgroundColor: glowColor }}
      ></div>
      
      <div className="p-6 pb-4 flex flex-col flex-1 relative z-10">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-[52px] h-[52px] shrink-0 rounded-[18px] bg-white flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-sm border border-slate-100 relative overflow-hidden">
              <div className="relative z-10 flex items-center justify-center">
                {(() => {
                  const t = (title || "").toLowerCase();
                  if (t.includes("python")) return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" width={28} height={28} alt="Python"/>;
                  if (t.includes("java") && !t.includes("script")) return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" width={28} height={28} alt="Java"/>;
                  if (t.includes("c++") || t.includes("cpp")) return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg" width={28} height={28} alt="C++"/>;
                  if (t.includes("c ") || t === "c" || t.includes("programming")) return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg" width={28} height={28} alt="C"/>;
                  if (t.includes("sql") || t.includes("database")) return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" width={28} height={28} alt="SQL"/>;
                  if (t.includes("javascript") || t.includes("js")) return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" width={28} height={28} alt="JS"/>;
                  if (t.includes("react")) return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width={28} height={28} alt="React"/>;
                  if (t.includes("data structure") || t.includes("dsa")) return <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg" width={28} height={28} alt="DSA"/>;
                  return <Code2 size={26} strokeWidth={2.5} className="text-indigo-500" />;
                })()}
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <h3 className="text-[18px] font-extrabold text-slate-800 tracking-tight leading-[22px] min-h-[44px] line-clamp-2 transition-colors">{title}</h3>
              <div className="flex items-center gap-2 mt-1.5">
                <Tooltip title={`Based on your ${completionPercent}% completion rate`}>
                  <span className="text-[10px] font-black text-indigo-700 bg-indigo-50/80 border border-indigo-100/50 px-2.5 py-0.5 rounded-md flex items-center gap-1.5 shadow-sm cursor-help transition-colors hover:bg-indigo-100 uppercase tracking-widest backdrop-blur-md">
                    <span className="text-[12px] opacity-90">⚔️</span> {rpgTitle}
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
                 railColor="#f1f5f9"
                 format={() => <span className="text-[11px] font-bold text-slate-700">{completionPercent}%</span>}
               />
            </div>
          </Tooltip>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-2 h-full flex-1 relative z-10">
          <div className="bg-slate-50/50 rounded-[16px] p-3 border border-slate-100 flex flex-col justify-start h-full group/box hover:bg-white hover:shadow-[0_4px_15px_rgba(0,0,0,0.03)] hover:border-indigo-100 transition-all duration-300">
             <div className="flex items-center gap-1.5 mb-2 text-slate-400">
                <Target size={14} className="group-hover/box:text-indigo-400 transition-colors" />
                <span className="text-[10px] font-black uppercase tracking-widest">Up Next</span>
             </div>
             <div className="text-[13px] font-bold text-slate-700 line-clamp-2 leading-tight mb-2 min-h-[30px] flex items-center group-hover/box:text-slate-900 transition-colors" title={dynamicNextTopic}>{dynamicNextTopic}</div>
             <button 
               className="text-[11px] font-bold text-slate-700 bg-white border border-slate-200 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/50 py-2 rounded-xl transition-all duration-300 w-full flex items-center justify-center gap-1.5 shadow-sm hover:shadow mt-auto group/btn"
               onClick={(e) => { e.stopPropagation(); if(onSolveNow) onSolveNow(); else if (onStart) onStart(); }}
             >
               Solve Now <ArrowRight size={12} className="transition-transform duration-300 group-hover/btn:translate-x-0.5 stroke-[3]" />
             </button>
          </div>
          <div className="bg-slate-50/50 rounded-[16px] p-3 border border-slate-100 flex flex-col justify-start h-full relative group/box hover:bg-white hover:shadow-[0_4px_15px_rgba(0,0,0,0.03)] hover:border-amber-100 transition-all duration-300">
             <div className="flex items-center justify-between mb-2 text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Trophy size={14} className="group-hover/box:text-amber-400 transition-colors" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Badge</span>
                </div>
             </div>
             
             <div className="flex items-center gap-3 mt-1 group-hover/box:scale-105 transition-transform duration-300 origin-left">
               <div className="mt-1 drop-shadow-sm">
                 <CodingBadge tier={currentBadge.t} level={currentBadge.l} size={40} />
               </div>
               <div>
                 <div className="text-[14px] font-extrabold text-slate-800 leading-none">{currentBadge.t} {currentBadge.l}</div>
               </div>
             </div>
          </div>
        </div>
      </div>

      <div 
        className="mt-auto border-t border-slate-100/80 px-6 py-4 flex items-center justify-between bg-slate-50/50 hover:bg-[#1E69DA] transition-colors duration-300 cursor-pointer group/footer"
        onClick={(e) => { e.stopPropagation(); onStart && onStart(); }}
      >
        <span className="text-[12px] font-extrabold text-slate-500 group-hover/footer:text-white transition-colors uppercase tracking-wider">
          View Problems
        </span>
        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover/footer:border-white/20 group-hover/footer:bg-white/20 shadow-sm transition-all duration-300">
          <ArrowRight 
            size={14} 
            className="text-slate-400 group-hover/footer:text-white transform group-hover/footer:translate-x-0.5 transition-all stroke-[3]" 
          />
        </div>
      </div>
    </div>
  );
}
