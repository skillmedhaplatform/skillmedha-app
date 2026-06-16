import React, { useState } from "react";
import { Select } from "antd";

export default function PracticeFilters({
  categories = ["All", "English", "Quant", "Maths", "Reasoning"],
  activeCategory = "All",
  onCategoryChange,
}) {
  const [activeTab, setActiveTab] = useState("All topics");
  
  const tabs = ["All topics", "Recent", "Saved", "My scores"];

  // Mock progress data for the 'Category progress' section
  const categoryProgress = [
    { name: "English", progress: 40, color: "#1E69DA" },
    { name: "Quant", progress: 0, color: "#24A058" },
    { name: "Maths", progress: 0, color: "#5694F0" },
    { name: "Reasoning", progress: 0, color: "#F2994A" },
  ];

  return (
    <div className="w-full flex flex-col bg-white">
      {/* Top Navigation Tabs */}
      <div className="w-full bg-[#F1F5F9] px-4 lg:px-8 py-0 flex items-center gap-8 border-b border-[#e2e8f0] flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-1 py-4 text-[15px] font-bold border-b-[3px] transition-colors cursor-pointer bg-transparent m-0 ${
              activeTab === tab
                ? "border-[#1E69DA] text-[#1E69DA]"
                : "border-transparent text-[#64748b] hover:text-[#334155]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="px-4 lg:px-8 py-6">
        {/* Category Progress Row */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8 mb-8">
          <span className="text-[14px] font-bold text-gray-800 whitespace-nowrap">
            Category progress
          </span>
          <div className="flex items-center gap-6 lg:gap-12 flex-wrap flex-1 pb-2 lg:pb-0">
            {categoryProgress.map((cat, i) => (
              <div key={i} className="flex items-center gap-3 min-w-[120px]">
                <span 
                  className="text-[12px] font-bold"
                  style={{ color: cat.color }}
                >
                  {cat.name}
                </span>
                <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
                  <div 
                    className="h-full rounded-full" 
                    style={{ width: `${cat.progress}%`, backgroundColor: cat.color }}
                  ></div>
                </div>
                <span className="text-[12px] font-bold text-gray-800">{cat.progress}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pill Filters & Sort By */}
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
          <div className="flex items-center gap-3 flex-wrap pb-2 lg:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onCategoryChange && onCategoryChange(cat)}
                className={`px-4 py-1.5 rounded-full text-[13px] font-bold whitespace-nowrap transition-colors cursor-pointer border-none ${
                  activeCategory === cat
                    ? "bg-[#EAF0F6] text-[#1E69DA]"
                    : "bg-transparent text-gray-600 hover:bg-gray-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[13px] font-medium text-gray-500">Sort by</span>
            <Select 
              defaultValue="Default" 
              bordered={false} 
              style={{ width: 100, fontWeight: "bold" }}
              options={[
                { value: 'Default', label: 'Default' },
                { value: 'Name', label: 'Name' },
                { value: 'Recent', label: 'Recent' }
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
