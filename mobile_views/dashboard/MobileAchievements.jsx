"use client";
import React from "react";

export default function MobileAchievements() {
  const achievementsList = [
    { emoji: "⭐", title: "First Enroll", desc: "+50 XP earned", status: "Earned" },
    { emoji: "🔥", title: "7-Day Streak", desc: "+100 XP earned", status: "Earned" },
    { emoji: "🎓", title: "Course Complete", desc: "+200 XP earned", status: "Earned" },
    { emoji: "🎉", title: "Certified Dev", desc: "+500 XP earned", status: "Earned" }
  ];

  return (
    <div className="w-full flex flex-col gap-3 py-2 px-1">
      {achievementsList.map((item, idx) => (
        <div key={idx} className="flex items-center justify-between p-3.5 rounded-2xl border border-[#e2e8f0] bg-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="text-[26px]">{item.emoji}</div>
            <div className="flex flex-col">
              <span className="font-bold text-[#0f172a] text-[14px]">{item.title}</span>
              <span className="text-[#64748b] text-[12px]">{item.desc}</span>
            </div>
          </div>
          <span className="text-white bg-[#5694F0] px-2.5 py-1 rounded-full text-[11px] font-bold">{item.status}</span>
        </div>
      ))}
    </div>
  );
}
