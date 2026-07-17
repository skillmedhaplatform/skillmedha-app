import React from 'react';

export default function CodingBadge({ tier, level, size = 64, showTier = false }) {
  let clipPath = "";
  let background = "";
  let innerBackground = "";
  let textColor = "white";
  
  switch (tier.toLowerCase()) {
    case "bronze":
      clipPath = "polygon(0 0, 100% 0, 100% 70%, 50% 100%, 0 70%)";
      background = "linear-gradient(135deg, #F3A183, #B85F32)";
      innerBackground = "linear-gradient(135deg, #D9794C, #8F401A)";
      break;
    case "silver":
      clipPath = "polygon(0 0, 100% 0, 100% 70%, 50% 100%, 0 70%)";
      background = "linear-gradient(135deg, #F1F5F9, #94A3B8)";
      innerBackground = "linear-gradient(135deg, #CBD5E1, #64748B)";
      break;
    case "gold":
      clipPath = "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)";
      background = "linear-gradient(135deg, #FDE047, #CA8A04)";
      innerBackground = "linear-gradient(135deg, #EAB308, #854D0E)";
      break;
    case "platinum":
      clipPath = "polygon(50% 0%, 100% 30%, 100% 100%, 0% 100%, 0% 30%)";
      background = "linear-gradient(135deg, #99F6E4, #0D9488)";
      innerBackground = "linear-gradient(135deg, #2DD4BF, #0F766E)";
      break;
    case "diamond":
      clipPath = "polygon(50% 0%, 100% 30%, 80% 100%, 20% 100%, 0% 30%)";
      background = "linear-gradient(135deg, #C7D2FE, #4F46E5)";
      innerBackground = "linear-gradient(135deg, #818CF8, #3730A3)";
      break;
    default:
      clipPath = "polygon(0 0, 100% 0, 100% 70%, 50% 100%, 0 70%)";
      background = "linear-gradient(135deg, #F3A183, #B85F32)";
      innerBackground = "linear-gradient(135deg, #D9794C, #8F401A)";
  }

  // Calculate inner size for the border effect
  const innerSizeStr = `calc(100% - ${Math.max(4, size * 0.08)}px)`;

  return (
    <div className="relative inline-flex flex-col items-center group">
      {/* Outer Border with metallic gradient */}
      <div 
        className="relative flex items-center justify-center drop-shadow-xl"
        style={{ 
          width: size, 
          height: size, 
          clipPath, 
          background,
          transition: "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
        }}
      >
        {/* Inner fill */}
        <div 
          className="absolute flex flex-col items-center justify-center shadow-inner"
          style={{ 
            width: innerSizeStr, 
            height: innerSizeStr, 
            clipPath, 
            background: innerBackground 
          }}
        >
          {/* Level Number in the middle */}
          <span 
            className="font-black drop-shadow-md opacity-90"
            style={{ 
              color: textColor,
              fontSize: size * 0.45,
              transform: tier.toLowerCase() === "platinum" || tier.toLowerCase() === "diamond" ? "translateY(10%)" : "translateY(-10%)" 
            }}
          >
            {level}
          </span>
        </div>
      </div>
      
      {/* Tier Label Below */}
      {showTier && (
        <div 
          className="font-bold text-slate-500 uppercase tracking-widest mt-2"
          style={{ fontSize: Math.max(10, size * 0.15) }}
        >
          {tier}
        </div>
      )}
    </div>
  );
}
