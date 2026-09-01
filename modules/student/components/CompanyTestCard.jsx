import React from "react";
import { Clock, FileText, ArrowRight, ChevronRight, Play } from "lucide-react";

export default function CompanyTestCard({ 
  companyData,
  onStartTest
}) {
  const {
    name,
    initials,
    color,
    hiringType,
    driveDate,
    patternName,
    sections,
    updatedAt,
    timeLimit,
    questionCount
  } = companyData;

  // Derive a lighter version of the color for the background glow
  const glowColor = color || "#3b82f6";

  return (
    <div className="group bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-slate-100 hover:border-slate-200 flex flex-col h-full transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
      
      {/* Decorative ambient background glow */}
      <div 
        className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-[50px] opacity-[0.25] transition-all duration-500 group-hover:opacity-[0.6] group-hover:scale-110"
        style={{ backgroundColor: glowColor }}
      ></div>

      {/* Top Section */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex gap-4 items-center">
          {/* Logo Squircle with inner shadow and glow */}
          <div 
            className="w-[56px] h-[56px] shrink-0 rounded-[18px] flex items-center justify-center text-white font-black text-xl shadow-inner relative overflow-hidden"
            style={{ backgroundColor: color || '#3b82f6' }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
            <span className="relative z-10 tracking-wider">{initials}</span>
          </div>
          
          <div className="flex flex-col justify-center gap-1.5">
            <h3 className="font-extrabold text-slate-800 text-[20px] leading-tight m-0 capitalize tracking-tight group-hover:text-indigo-600 transition-colors">{name}</h3>
            {hiringType && (
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md uppercase tracking-widest w-fit leading-none shadow-sm">
                {hiringType}
              </span>
            )}
          </div>
        </div>
        
        {/* Optional Drive Tag */}
        {driveDate && (
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            {driveDate}
          </div>
        )}
      </div>

      {/* Middle Section: Stats & Tags */}
      <div className="flex gap-4 items-stretch mb-6 relative z-10">
        <div className="flex flex-col justify-center gap-3 shrink-0 bg-slate-50/80 p-3 rounded-2xl border border-slate-100 min-w-[75px] shadow-sm">
          <div className="flex items-center gap-2 text-[12px] font-extrabold text-slate-600 leading-none">
            <Clock size={14} className="text-indigo-500 stroke-[2.5]" />
            {timeLimit}m
          </div>
          <div className="flex items-center gap-2 text-[12px] font-extrabold text-slate-600 leading-none">
            <FileText size={14} className="text-blue-500 stroke-[2.5]" />
            {questionCount}Q
          </div>
        </div>
        
        <div className="flex flex-col gap-2 overflow-hidden py-1">
          <div className="flex items-center gap-1.5">
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pattern</span>
             <span className="text-[12px] font-bold text-slate-700 truncate">{patternName}</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {sections.map((sec, idx) => {
              const secName = sec.split(" - ")[0].trim();
              return (
                <span key={idx} className="bg-white text-slate-600 px-2.5 py-1 rounded-lg text-[11px] font-bold border border-slate-200 shadow-sm hover:border-indigo-300 hover:text-indigo-600 transition-colors cursor-default truncate max-w-full">
                  {secName}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent w-full mb-5"></div>

      {/* Bottom Section */}
      <div className="mt-auto flex items-center justify-between relative z-10">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Updated {updatedAt || "May 2026"}</span>
        <button 
          onClick={(e) => { e.stopPropagation(); if (onStartTest) onStartTest(); }}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all shadow-md hover:shadow-lg cursor-pointer group-hover:pr-4"
        >
          Start Test
          <ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 stroke-[3]" />
        </button>
      </div>
    </div>
  );
}
