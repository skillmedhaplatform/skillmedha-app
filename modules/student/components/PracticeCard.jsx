import React from "react";
import { 
  BookOpen, Calculator, Code, Database, Globe, 
  MessageSquare, BrainCircuit, Activity, CheckCircle, ChevronRight, Binary, Puzzle, FileText, Volume2
} from "lucide-react";

export default function PracticeCard({
  title,
  category,
  totalQuestions,
  attempts = 0,
  onStart,
  loading = false,
  subjectTitle = ""
}) {
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
    if (text.includes("data") || text.includes("sql")) return { border: "#5D4037", boxBg: "#D7CCC8", text: "#5D4037" }; // Dark Brown
    
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
    const text = (title + category + subjectTitle).toLowerCase();
    if (text.includes("part")) return <Puzzle size={20} color={theme.text} />;
    if (text.includes("article")) return <FileText size={20} color={theme.text} />;
    if (text.includes("voice")) return <Volume2 size={20} color={theme.text} />;
    if (text.includes("gramm") || text.includes("vocab") || text.includes("english")) return <BookOpen size={20} color={theme.text} />;
    if (text.includes("quant") || text.includes("math") || text.includes("calc")) return <Calculator size={20} color={theme.text} />;
    if (text.includes("reasoning") || text.includes("logic")) return <BrainCircuit size={20} color={theme.text} />;
    
    // Coding specific icons
    if (text.includes("data") || text.includes("sql")) return <Database size={20} color={theme.text} />;
    if (text.includes("web") || text.includes("html") || text.includes("script")) return <Globe size={20} color={theme.text} />;
    if (text.includes("system") || text.includes("os")) return <Binary size={20} color={theme.text} />;
    
    if (text.includes("code") || text.includes("program") || text.includes("array") || text.includes("python") || text.includes("java") || text.includes("c++") || text.includes("script")) return <Code size={20} color={theme.text} />;

    return <Activity size={20} color={theme.text} />;
  };

  const progress = 0; // Simulated progress as 0 for now

  return (
    <div 
      className={`bg-white rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.06)] border border-gray-200 flex flex-col transition-all hover:shadow-[0_4px_15px_rgba(0,0,0,0.1)] relative overflow-hidden ${!loading ? 'cursor-pointer' : 'cursor-wait opacity-80'}`}
    >
      {/* Left Colored Border */}
      <div 
        className="absolute top-0 bottom-0 left-0 w-[4px]" 
        style={{ backgroundColor: theme.border }}
      />
      
      {/* Top Section */}
      <div className="p-6 pb-4 flex items-start gap-4">
        {/* Icon Box */}
        <div 
          className="w-[42px] h-[42px] rounded-lg flex items-center justify-center shrink-0 shadow-sm"
          style={{ backgroundColor: theme.boxBg }}
        >
          {getIcon()}
        </div>
        
        <div className="flex-1 mt-0.5">
          <h3 className="text-[15px] font-bold text-gray-900 m-0 leading-tight mb-1.5">{title}</h3>
          <p className="text-[10px] font-bold text-gray-500 m-0 uppercase tracking-widest">{subjectTitle} • {category}</p>
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="flex px-6 py-2">
        <div className="flex flex-col items-center justify-center flex-1">
          <span className="text-[16px] font-bold text-gray-800 leading-none mb-1.5">{totalQuestions}</span>
          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">QUESTIONS</span>
        </div>
        <div className="w-[1px] bg-gray-100" />
        <div className="flex flex-col items-center justify-center flex-1">
          <span className="text-[16px] font-bold text-gray-800 leading-none mb-1.5">{attempts}</span>
          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">ATTEMPTS</span>
        </div>
      </div>
      
      {/* Progress Section */}
      <div className="px-6 pt-4 pb-5">
        <div className="flex justify-between items-center gap-3">
          <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500" 
              style={{ width: `${progress}%`, backgroundColor: theme.border }}
            ></div>
          </div>
          <span className="text-[11px] font-bold text-gray-900 min-w-[20px] text-right">{progress}%</span>
        </div>
      </div>
      
      {/* Footer Section */}
      <div className="px-6 pb-6 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#24A058]"></div>
          <span className="text-[11px] font-bold text-[#24A058]">Active</span>
        </div>
        
        {progress === 0 && (
          <button 
            onClick={!loading ? onStart : undefined}
            disabled={loading}
            className="bg-gradient-to-br from-[#1E69DA] to-[#5694F0] hover:opacity-90 text-white px-5 py-1.5 rounded text-[13px] font-bold border-none cursor-pointer transition-opacity"
          >
            {loading ? "..." : "Start"}
          </button>
        )}
        {progress > 0 && progress < 100 && (
          <button 
            onClick={!loading ? onStart : undefined}
            disabled={loading}
            className="bg-transparent text-[#1E69DA] p-0 text-[13px] font-bold border-none cursor-pointer hover:underline"
          >
            {loading ? "..." : "Resume"}
          </button>
        )}
        {progress === 100 && (
          <span className="text-[#24A058] text-[13px] font-bold">
            Completed
          </span>
        )}
      </div>
    </div>
  );
}
