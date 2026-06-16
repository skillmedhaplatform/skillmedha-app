"use client";
import React from "react";
import { BsX, BsPlus, BsStar } from "react-icons/bs";
import { 
  HiOutlineAcademicCap, 
  HiOutlineClipboardDocumentCheck, 
  HiOutlineUser, 
  HiOutlineQuestionMarkCircle,
  HiOutlineDocumentText,
  HiOutlineSquares2X2
} from "react-icons/hi2";

export default function StudentPageHeader({ section, title, rightSlot, subtitle, breadcrumb }) {
  const getIcon = () => {
    const s = (section || "").toLowerCase();
    const t = (title || "").toLowerCase();
    if (s.includes("practice") || t.includes("practice")) return <HiOutlineAcademicCap className="text-white text-3xl" />;
    if (s.includes("assessment") || t.includes("assessment")) return <HiOutlineClipboardDocumentCheck className="text-white text-3xl" />;
    if (s.includes("profile") || t.includes("profile")) return <HiOutlineUser className="text-white text-3xl" />;
    if (s.includes("help") || t.includes("help")) return <HiOutlineQuestionMarkCircle className="text-white text-3xl" />;
    if (s.includes("resume") || t.includes("resume")) return <HiOutlineDocumentText className="text-white text-3xl" />;
    return <HiOutlineSquares2X2 className="text-white text-3xl" />;
  };

  return (
    <div className="w-full h-[140px] min-h-[140px] flex flex-col justify-center items-start gap-2 p-4 lg:px-8 shadow-sm rounded-2xl lg:rounded-none bg-gradient-to-br from-[#071631] to-[#10254c] text-white shrink-0 relative overflow-hidden z-[2]">
      {/* Decorative Icons */}
      <div className="absolute inset-0 pointer-events-none z-[1]">
        <BsX className="absolute top-[20%] right-[10%] text-[#1E69DA] opacity-60 text-[1.2rem]" />
        <BsPlus className="absolute bottom-[20%] right-[30%] text-[#1E69DA] opacity-50 text-[1.5rem]" />
        <BsStar className="absolute top-[40%] right-[50%] text-[#1E69DA] opacity-50 text-[1.1rem]" />
        <BsX className="absolute bottom-[30%] right-[5%] text-[#1E69DA] opacity-60 text-[1.3rem]" />
      </div>

      <div className="flex items-center justify-between w-full relative z-[2]">
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-[56px] h-[56px] bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10 shrink-0">
            {getIcon()}
          </div>
          <div className="flex flex-col justify-center gap-1">
            {(breadcrumb || section) && (
              <p className="text-[#5694F0] text-[12px] font-bold tracking-wider uppercase mb-1">
                {breadcrumb || section}
              </p>
            )}
            <h1 className="text-[24px] lg:text-[28px] font-bold text-white m-0 tracking-tight leading-none flex items-center gap-3 pb-0" style={{ border: 'none', marginBottom: 0 }}>
              {title}
            </h1>
            <p className="text-white/90 text-[14px] lg:text-[15px] m-0 leading-tight mt-1">
              {subtitle || "Explore and manage your learning journey."}
            </p>
          </div>
        </div>

        {rightSlot && (
          <div className="relative z-10">
            {rightSlot}
          </div>
        )}
      </div>
    </div>
  );
}
