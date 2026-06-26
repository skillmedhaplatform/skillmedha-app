import React, { useState } from "react";
import { Select } from "antd";
import { useSelector } from "react-redux";

export default function PracticeFilters({
  categories = ["All", "English", "Quant", "Maths", "Reasoning"],
  activeCategory = "All",
  onCategoryChange,
}) {
  const [activeTab, setActiveTab] = useState("All topics");
  const categoryProgressData = useSelector((state) => state.practice.categoryProgress || {});

  const tabs = ["All topics", "Recent", "Saved", "My scores"];

  // Dynamic progress data based on categories prop (excluding "All")
  const defaultColors = ["#1E69DA", "#24A058", "#5694F0", "#F2994A", "#9b51e0", "#e63946", "#f4a261", "#2a9d8f"];

  const categoryProgress = categories
    .filter(cat => cat !== "All")
    .map((cat, index) => ({
      name: cat,
      progress: categoryProgressData[cat] || 0,
      color: defaultColors[index % defaultColors.length]
    }));

  return (
    <div className="w-full flex flex-col bg-white">
      {/* Category Progress Row - Moved to top to replace tabs */}
      <div className="w-full bg-white px-4 lg:px-8 py-2 border-b border-[#e2e8f0]">
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
          <div className="flex items-center gap-3 flex-wrap pb-2 lg:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onCategoryChange && onCategoryChange(cat)}
                className={`px-4 py-1.5 rounded-lg text-[13px] font-bold whitespace-nowrap transition-all duration-300 cursor-pointer border ${activeCategory === cat
                    ? "bg-gradient-to-br from-[#1E69DA] to-[#5694F0] text-white border-transparent shadow-[0_2px_10px_rgba(30,105,218,0.3)]"
                    : "bg-transparent text-gray-600 border-transparent hover:border-[#1E69DA] hover:text-[#1E69DA] hover:bg-[#F8FAFC]"
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

      {/* Top Navigation Tabs - Commented out
      <div className="w-full bg-white px-4 lg:px-8 py-0 flex items-center gap-8 border-b border-[#e2e8f0] flex-wrap">
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
      */}

      <div className="px-4 lg:px-8 py-3">
        {/* Category Progress Row */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-5">
          <span className="text-[13px] font-bold text-gray-800 whitespace-nowrap">
            Category progress
          </span>
          <div className="flex items-center gap-2.5 lg:gap-3 flex-wrap flex-1 pb-1 lg:pb-0">
            {categoryProgress.map((cat, i) => (
              <div key={i} className="flex flex-col justify-center min-w-[110px] border border-[#e2e8f0] rounded-lg px-2.5 py-1.5 bg-white shadow-sm">
                <span
                  className="text-[11px] font-bold mb-1"
                  style={{ color: cat.color }}
                >
                  {cat.name}
                </span>
                <div className="flex items-center gap-1.5">
                  <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${cat.progress}%`, backgroundColor: cat.color }}
                    ></div>
                  </div>
                  <span className="text-[11px] font-bold text-gray-800">{cat.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
