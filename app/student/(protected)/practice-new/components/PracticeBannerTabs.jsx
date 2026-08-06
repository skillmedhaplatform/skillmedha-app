"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Dropdown } from "antd";
import { ChevronDown } from "lucide-react";

export default function PracticeBannerTabs() {
  const router = useRouter();
  const currPath = usePathname();

  const categoryTabs = [
    { name: "Non-Technical", path: "/student/practice-new/nontechnical" },
    { name: "Technical", path: "/student/practice-new/technical" },
    { name: "Coding", path: "/student/practice-new/coding" },
  ];

  const activeTab = categoryTabs.find(t => currPath === t.path) || categoryTabs[0];

  const dropdownItems = categoryTabs.map(tab => ({
    key: tab.path,
    label: tab.name,
  }));

  const handleMenuClick = (e) => {
    router.push(e.key);
  };

  return (
    <>
      {/* Mobile Dropdown View */}
      <div className="sm:hidden mt-0 sm:mt-2">
        <Dropdown 
          menu={{ 
            items: dropdownItems,
            onClick: handleMenuClick,
            selectedKeys: [activeTab.path]
          }} 
          trigger={['click']}
          placement="bottomRight"
        >
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-medium bg-white/10 backdrop-blur-md border border-white/40 text-white shadow-sm hover:bg-white/20 transition-all">
            {activeTab.name}
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </Dropdown>
      </div>

      {/* Desktop Tabs View */}
      <div className="hidden sm:flex gap-3 mt-1 items-start">
        {categoryTabs.map((tab) => {
          const isActive = currPath === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => router.push(tab.path)}
              className={`px-5 py-1.5 rounded-lg text-[14px] font-medium transition-all duration-300 border cursor-pointer ${
                isActive
                  ? "bg-white/5 backdrop-blur-md border-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_4px_10px_rgba(0,0,0,0.1)] text-white"
                  : "bg-transparent text-white/90 border-white/40 hover:bg-white/10"
              }`}
            >
              {tab.name}
            </button>
          );
        })}
      </div>
    </>
  );
}
