import React, { useState, useRef } from "react";
import { Select, Dropdown } from "antd";
import { useSelector } from "react-redux";
import { ListFilter } from "lucide-react";

export default function PracticeFilters({
  categories = ["All", "English", "Quant", "Maths", "Reasoning"],
  activeCategory = "All",
  onCategoryChange,
  activeSort = "Default",
  onSortChange,
  hideCategoryProgress = false,
}) {
  const [activeTab, setActiveTab] = useState("All topics");
  const categoryProgressData = useSelector((state) => state.practice.categoryProgress || {});

  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };
  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const tabs = ["All topics", "Recent", "Saved", "My scores"];

  return (
    <div className="w-full flex flex-col bg-white">
      {/* Category Progress Row - Moved to top to replace tabs */}
      <div className="w-full bg-white px-4 lg:px-8 py-2 border-b border-[#e2e8f0]">
        <div className="flex flex-row justify-between items-center gap-2 md:gap-4 w-full">
          <div 
            ref={scrollRef}
            className="flex items-center gap-2 md:gap-3 overflow-x-auto pb-1 flex-1 cursor-grab active:cursor-grabbing select-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onCategoryChange && onCategoryChange(cat)}
                className={`px-3 md:px-4 py-1.5 rounded-lg text-[12px] md:text-[13px] font-bold whitespace-nowrap transition-all duration-300 cursor-pointer border shrink-0 ${activeCategory === cat
                    ? "bg-gradient-to-br from-[#1E69DA] to-[#5694F0] text-white border-transparent shadow-[0_2px_10px_rgba(30,105,218,0.3)]"
                    : "bg-transparent text-gray-600 border-transparent hover:border-[#1E69DA] hover:text-[#1E69DA] hover:bg-[#F8FAFC]"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 md:gap-2 shrink-0 bg-white md:bg-transparent px-2 md:px-0 py-1 md:py-0 rounded-lg border md:border-transparent border-gray-200 shadow-sm md:shadow-none">
            <Dropdown 
              menu={{ 
                items: [
                  { key: 'Default', label: 'Default' },
                  { key: 'Name', label: 'Name' },
                  { key: 'Recent', label: 'Recent' }
                ],
                onClick: (e) => onSortChange && onSortChange(e.key) 
              }} 
              trigger={['click']}
            >
              <div className="lg:hidden flex items-center justify-center cursor-pointer p-1">
                <ListFilter className="w-5 h-5 text-gray-600" />
              </div>
            </Dropdown>
            
            <div className="hidden lg:flex items-center">
              <span className="text-[13px] font-medium text-gray-500">Sort by</span>
              <Select
                value={activeSort}
                onChange={(value) => onSortChange && onSortChange(value)}
                variant="borderless"
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

    </div>
  );
}
