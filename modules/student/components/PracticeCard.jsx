import React from "react";
import { 
  BookOpen, Calculator, Code, Database, Globe, 
  MessageSquare, BrainCircuit, Activity, CheckCircle, ArrowRight, 
  Binary, Puzzle, FileText, Volume2,
  Box, Layers, Compass, Target, Zap, Star, Shield, Diamond, Bookmark, Hexagon, Triangle, Hash, Percent, Clock
} from "lucide-react";
import { Tooltip } from "antd";
import { InfoOutlined } from "@ant-design/icons";

export default function PracticeCard({
  title,
  category,
  attempts,
  easyPassCount,
  mediumPassCount,
  hardPassCount,
  easyAttempts = 0,
  mediumAttempts = 0,
  hardAttempts = 0,
  onStart,
  loading = false,
  subjectTitle = "",
  actualTotalQuestions = 0,
  id,
  disableStart = false
}) {
  const [hasResumeState, setHasResumeState] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && id) {
      const saved = localStorage.getItem(`practice_resume_${id}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.userResponse && parsed.userResponse.length > 0) {
            setHasResumeState(true);
          }
        } catch (e) {}
      }
    }
  }, [id]);

  const getMasteryLevelName = () => {
    const minMultiplier = Math.min(easyPassCount, mediumPassCount, hardPassCount);
    if (minMultiplier >= 5) return "Grandmaster";
    if (minMultiplier === 4) return "Master";
    if (minMultiplier === 3) return "Expert";
    if (minMultiplier === 2) return "Advanced";
    if (minMultiplier === 1) return "Intermediate";
    return "Novice";
  };

  const masteryLevel = getMasteryLevelName();

  // Determine color theme based on subject/title
  const getTheme = () => {
    const text = (subjectTitle + title).toLowerCase();
    
    // Hardcoded unique mapping (NO BLUE, CYAN, OR INDIGO SHADES)
    if (text.includes("english") || text.includes("verbal")) return { border: "#8E44AD", boxBg: "#F8F0FC", text: "#8E44AD" }; // Purple
    if (text.includes("quant")) return { border: "#24A058", boxBg: "#E6F5EC", text: "#24A058" }; // Green
    if (text.includes("math")) return { border: "#E91E63", boxBg: "#FCE4EC", text: "#E91E63" }; // Magenta
    if (text.includes("reasoning") || text.includes("logic")) return { border: "#F2994A", boxBg: "#FDF1E6", text: "#F2994A" }; // Orange
    if (text.includes("python")) return { border: "#FF9800", boxBg: "#FFF3E0", text: "#FF9800" }; // Bright Orange
    if (text.includes("java") && !text.includes("script")) return { border: "#E74C3C", boxBg: "#FDEAE8", text: "#E74C3C" }; // Red
    if (text.includes("script") || text.includes("js")) return { border: "#E91E63", boxBg: "#FCE4EC", text: "#E91E63" }; // Matches Math's color
    if (text.includes("c++") || text.includes("cpp")) return { border: "#673AB7", boxBg: "#F3E5F5", text: "#673AB7" }; // Violet
    if (text.includes("c#") || text.includes("csharp")) return { border: "#D81B60", boxBg: "#FCE4EC", text: "#D81B60" }; // Pink
    if (text.includes("c program") || text === "c") return { border: "#009688", boxBg: "#E0F2F1", text: "#009688" }; // Teal
    if (text.includes("data") || text.includes("sql") || text.includes("dbms") || text.includes("database")) return { border: "#5D4037", boxBg: "#D7CCC8", text: "#5D4037" }; // Dark Brown
    if (text.includes("system") || text.includes("operating") || text.includes("os ")) return { border: "#455A64", boxBg: "#CFD8DC", text: "#455A64" }; // Blue Grey
    
    // Hash-based palette for any other subjects to ensure distinct colors (NO BLUE SHADES)
    const colors = [
      { border: "#D35400", boxBg: "#FBEEE6", text: "#D35400" }, // Dark Orange
      { border: "#8D6E63", boxBg: "#EFEBE9", text: "#8D6E63" }, // Light Brown
      { border: "#9E9D24", boxBg: "#F9FBE7", text: "#9E9D24" }, // Yellow Green
      { border: "#43A047", boxBg: "#E8F5E9", text: "#43A047" }, // Green Dark
      { border: "#AFB42B", boxBg: "#F9FBE7", text: "#AFB42B" }, // Lime
      { border: "#5E35B1", boxBg: "#EDE7F6", text: "#5E35B1" }, // Deep Purple
      { border: "#E53935", boxBg: "#FFEBEE", text: "#E53935" }, // Red Dark
      { border: "#827717", boxBg: "#F0F4C3", text: "#827717" }, // Olive
      { border: "#F4511E", boxBg: "#FBE9E7", text: "#F4511E" }, // Deep Orange
      { border: "#AD1457", boxBg: "#FCE4EC", text: "#AD1457" }, // Deep Pink
    ];
    
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const theme = getTheme();

  const getIcon = () => {
    const subject = (subjectTitle || category || title).toLowerCase();
    
    // 1. Hardcoded specific icons for known main subjects
    if (subject.includes("english") || subject.includes("verbal") || subject.includes("gramm")) return <BookOpen size={20} color={theme.text} />;
    if (subject.includes("quant") || subject.includes("math") || subject.includes("aptitude")) return <Calculator size={20} color={theme.text} />;
    if (subject.includes("reasoning") || subject.includes("logic")) return <BrainCircuit size={20} color={theme.text} />;
    
    if (subject.includes("python") || subject.includes("java") || subject.includes("c++") || subject.includes("code")) return <Code size={20} color={theme.text} />;
    if (subject.includes("data") || subject.includes("sql") || subject.includes("dbms")) return <Database size={20} color={theme.text} />;
    if (subject.includes("web") || subject.includes("html") || subject.includes("script")) return <Globe size={20} color={theme.text} />;
    if (subject.includes("system") || subject.includes("os") || subject.includes("network") || subject.includes("binary")) return <Binary size={20} color={theme.text} />;

    // 2. Dynamic Hash-based assignment for ANY NEW section added by admin
    const genericIcons = [
      <Box size={20} color={theme.text} />, 
      <Layers size={20} color={theme.text} />, 
      <Compass size={20} color={theme.text} />, 
      <Target size={20} color={theme.text} />, 
      <Zap size={20} color={theme.text} />, 
      <Star size={20} color={theme.text} />, 
      <Shield size={20} color={theme.text} />, 
      <Diamond size={20} color={theme.text} />, 
      <Bookmark size={20} color={theme.text} />, 
      <Hexagon size={20} color={theme.text} />, 
      <Triangle size={20} color={theme.text} />,
      <Hash size={20} color={theme.text} />,
      <Percent size={20} color={theme.text} />,
      <Clock size={20} color={theme.text} />
    ];

    let hash = 0;
    for (let i = 0; i < subject.length; i++) {
      hash = subject.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % genericIcons.length;
    return genericIcons[index];
  };

  return (
    <div 
      className={`group bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-slate-200 hover:-translate-y-1 relative overflow-hidden ${!loading ? 'cursor-pointer' : 'cursor-wait opacity-80'} min-h-[260px]`}
    >
      {/* Decorative ambient background glow */}
      <div 
        className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-[50px] opacity-[0.15] transition-all duration-500 group-hover:opacity-[0.4] group-hover:scale-110 pointer-events-none z-0"
        style={{ backgroundColor: theme.text }}
      ></div>

      {/* Top Section */}
      <div className="p-5 xl:p-6 pb-2 flex items-start gap-4 relative z-10">
        {/* Icon Box */}
        <div 
          className="w-[48px] h-[48px] rounded-[14px] flex items-center justify-center shrink-0"
          style={{ backgroundColor: theme.boxBg }}
        >
          {React.cloneElement(getIcon(), { size: 24, strokeWidth: 1.5 })}
        </div>
        
        <div className="flex-1 overflow-hidden mt-1">
          <Tooltip title={title} placement="top">
            <h3 className="text-[17px] font-[800] text-slate-800 m-0 leading-[22px] mb-1.5 line-clamp-2 group-hover:text-slate-900 transition-colors">{title}</h3>
          </Tooltip>
          <p className="text-[10px] font-bold text-slate-400 m-0 uppercase tracking-widest truncate">{subjectTitle} • {category}</p>
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="relative z-10 grid grid-cols-3 divide-x divide-slate-100 border border-slate-100 rounded-[16px] mx-5 my-3 bg-slate-50/50 group-hover:bg-white group-hover:shadow-[0_4px_15px_rgba(0,0,0,0.02)] group-hover:border-slate-200 transition-all duration-300 py-3">
        <div className="flex flex-col items-center justify-center">
          <span className="text-[16px] font-[900] text-[#10b981] leading-none mb-1">{easyAttempts}</span>
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest text-center leading-tight">EASY<br/>ATTEMPTS</span>
        </div>
        <div className="flex flex-col items-center justify-center">
          <span className="text-[16px] font-[900] text-[#eab308] leading-none mb-1">{mediumAttempts}</span>
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest text-center leading-tight">MEDIUM<br/>ATTEMPTS</span>
        </div>
        <div className="flex flex-col items-center justify-center">
          <span className="text-[16px] font-[900] text-[#ef4444] leading-none mb-1">{hardAttempts}</span>
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest text-center leading-tight">HARD<br/>ATTEMPTS</span>
        </div>
      </div>
      
      {/* Progress Section (Stars) */}
      <div className="px-5 xl:px-6 pb-4 relative z-10">
        <div className="flex justify-between items-center gap-4">
          <div className="flex gap-2">
            <Tooltip title={`Easy Mode: ${easyPassCount} Passes`}>
              <div className="flex items-center">
                <Star 
                  size={18} 
                  fill={easyPassCount > 0 ? "#10b981" : "transparent"} 
                  color={easyPassCount > 0 ? "#10b981" : "#cbd5e1"} 
                  className={easyPassCount > 0 ? "drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" : ""} 
                />
                {easyPassCount > 0 && <span className="text-[10px] ml-1 font-bold text-[#10b981]">×{easyPassCount}</span>}
              </div>
            </Tooltip>
            <Tooltip title={`Medium Mode: ${mediumPassCount} Passes`}>
              <div className="flex items-center">
                <Star 
                  size={18} 
                  fill={mediumPassCount > 0 ? "#eab308" : "transparent"} 
                  color={mediumPassCount > 0 ? "#eab308" : "#cbd5e1"} 
                  className={mediumPassCount > 0 ? "drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" : ""} 
                />
                {mediumPassCount > 0 && <span className="text-[10px] ml-1 font-bold text-[#eab308]">×{mediumPassCount}</span>}
              </div>
            </Tooltip>
            <Tooltip title={`Hard Mode: ${hardPassCount} Passes`}>
              <div className="flex items-center">
                <Star 
                  size={18} 
                  fill={hardPassCount > 0 ? "#ef4444" : "transparent"} 
                  color={hardPassCount > 0 ? "#ef4444" : "#cbd5e1"} 
                  className={hardPassCount > 0 ? "drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" : ""} 
                />
                {hardPassCount > 0 && <span className="text-[10px] ml-1 font-bold text-[#ef4444]">×{hardPassCount}</span>}
              </div>
            </Tooltip>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right leading-tight">Mastery</span>
            <span className="text-[11px] font-black text-indigo-600 uppercase tracking-wider">{masteryLevel}</span>
          </div>
        </div>
      </div>
      
      {/* Footer Section */}
      <div className="px-5 xl:px-6 py-4 border-t border-slate-100/80 bg-slate-50/30 flex items-center justify-between mt-auto relative z-10 group-hover:bg-slate-50/80 transition-colors">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#10b981]"></div>
          <span className="text-[12px] font-bold text-[#0f172a]">Active</span>
        </div>
        
        {disableStart ? (
          <Tooltip title="Insufficient questions for all difficulties. Admin needs to upload more questions.">
            <button 
              disabled
              className="bg-slate-200 text-slate-400 px-4 py-2 rounded-[10px] text-[13px] font-bold border-none cursor-not-allowed flex items-center gap-1.5"
            >
              Start <ArrowRight size={14} />
            </button>
          </Tooltip>
        ) : (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (!loading) onStart();
            }}
            disabled={loading}
            style={{ backgroundColor: theme.text }}
            className="hover:brightness-110 text-white px-5 py-2.5 rounded-xl text-[13px] font-[800] border-none cursor-pointer transition-all flex items-center gap-1.5 shadow-sm shadow-black/5 hover:shadow-md hover:-translate-y-0.5 group/btn"
          >
            {loading ? "..." : (hasResumeState ? "Resume" : "Start")} <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-0.5" />
          </button>
        )}
      </div>
    </div>
  );
}
