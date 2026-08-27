import React from "react";
import Link from "next/link";
import { Clock, FileText } from "lucide-react";

export default function CompanyTestCard({ 
  companyData 
}) {
  const {
    id,
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

  return (
    <div className="bg-white rounded-3xl p-6 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col h-full transition-transform hover:-translate-y-1 hover:shadow-lg">
      {/* Top Section */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex gap-4 items-center">
          {/* Logo Squircle */}
          <div 
            className="w-[56px] h-[56px] shrink-0 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-sm"
            style={{ backgroundColor: color }}
          >
            {initials}
          </div>
          
          <div className="flex flex-col justify-center gap-2">
            <h3 className="font-bold text-gray-900 text-[20px] leading-none m-0 capitalize">{name}</h3>
            {hiringType && (
              <span className="text-[10px] font-bold text-amber-600 bg-[#FFF6E5] px-2.5 py-1 rounded-md uppercase tracking-wider w-fit leading-none">
                {hiringType}
              </span>
            )}
          </div>
        </div>
        
        {/* Optional Drive Tag */}
        {driveDate && (
          <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
            {driveDate}
          </div>
        )}
      </div>

      {/* Middle Section: Stats & Tags */}
      <div className="flex gap-5 items-center mb-8">
        <div className="flex flex-col justify-center gap-2.5 shrink-0 bg-[#F8F9FA] p-3 rounded-2xl border border-gray-100 min-w-[75px]">
          <div className="flex items-center gap-2 text-[12px] font-bold text-gray-700 leading-none">
            <Clock size={14} className="text-blue-500" />
            {timeLimit}m
          </div>
          <div className="flex items-center gap-2 text-[12px] font-bold text-gray-700 leading-none">
            <FileText size={14} className="text-purple-500" />
            {questionCount}Q
          </div>
        </div>
        
        <div className="flex flex-col gap-2 overflow-hidden">
          <p className="text-[13px] font-medium text-gray-500 m-0 truncate">Test pattern · {patternName}</p>
          <div className="flex flex-wrap gap-2">
            {sections.map((sec, idx) => (
              <span key={idx} className="bg-[#F8F9FA] text-gray-600 px-3 py-1 rounded-lg text-[12px] font-medium border border-gray-200/80">
                {sec}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-100 w-full mb-5"></div>

      {/* Bottom Section */}
      <div className="mt-auto flex items-center justify-between">
        <span className="text-[13px] font-medium text-gray-400">Pattern updated {updatedAt || "May 2026"}</span>
        <Link href={`/student/practice-new/company-wise/${id}`}>
          <button className="bg-[#3b82f6] hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl text-[14px] font-semibold transition-colors">
            Start mock test
          </button>
        </Link>
      </div>
    </div>
  );
}
