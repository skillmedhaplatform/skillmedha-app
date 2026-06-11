"use client";
import React from "react";
import { Progress, Button } from "antd";

export default function MobileProfileSection({ profileValues, router, onClose }) {
  return (
    <div className="w-full flex flex-col items-center py-4 px-2">
      <div className="text-center mb-6">
        <span className="text-[14px] text-[#64748b] font-bold block mb-1">Profile completion rate</span>
        <p className="text-sm text-gray-500 max-w-xs">Complete your basic details to unlock all placement drives and assessments.</p>
      </div>
      
      <div className="relative flex justify-center mb-6">
        <Progress
          type="dashboard"
          percent={profileValues?.percentage || 12}
          size={140}
          strokeWidth={10}
          strokeColor="#1E69DA"
          railColor="#f1f5f9"
          format={(percent) => (
            <div className="flex flex-col items-center justify-center -mt-2">
              <span className="text-[30px] font-black text-[#0f172a] tracking-tighter leading-none">{percent}%</span>
              <span className="text-[9px] font-bold text-[#1E69DA] tracking-wider mt-1">COMPLETED</span>
            </div>
          )}
        />
      </div>
      
      <Button
        className="w-full h-11 border-none font-bold text-[14px] flex items-center justify-center gap-2 transition-all hover:opacity-90 text-white"
        style={{ backgroundColor: '#1E69DA', borderRadius: '12px' }}
        onClick={() => {
          onClose();
          router.push("/student/profile/basic-details");
        }}
      >
        ⚡ Complete your profile
      </Button>
    </div>
  );
}
