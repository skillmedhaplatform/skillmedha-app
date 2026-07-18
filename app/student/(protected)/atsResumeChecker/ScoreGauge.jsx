"use client";
import React from "react";

const polarToCartesian = (cx, cy, r, angleDeg) => {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
};

const describeArc = (cx, cy, r, startAngle, endAngle) => {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
};

const scoreToAngle = (score) => -135 + (score / 100) * 270;

const getScoreColor = (score) => {
  if (score >= 80) return "#1E69DA";
  if (score >= 65) return "#0e85c7";
  if (score >= 50) return "#d97706";
  if (score >= 35) return "#e67e22";
  return "#e8447a";
};

const ScoreGauge = ({ score = 0, size = 200 }) => {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.42;
  const innerR = size * 0.32;
  const strokeWidth = outerR - innerR;
  const trackR = (outerR + innerR) / 2;
  const color = getScoreColor(score);

  const startAngle = -135;
  const endAngle = 135;
  const fillAngle = scoreToAngle(score);

  const trackPath = describeArc(cx, cy, trackR, startAngle, endAngle);
  const fillPath = score > 0
    ? describeArc(cx, cy, trackR, startAngle, fillAngle)
    : null;

  const ticks = [0, 25, 50, 75, 100].map((val) => {
    const angle = scoreToAngle(val);
    const inner = polarToCartesian(cx, cy, trackR - strokeWidth / 2 - 4, angle);
    const outer = polarToCartesian(cx, cy, trackR + strokeWidth / 2 + 4, angle);
    return { val, inner, outer, angle };
  });

  const tickLabels = [0, 50, 100].map((val) => {
    const angle = scoreToAngle(val);
    const pos = polarToCartesian(cx, cy, trackR + strokeWidth / 2 + 14, angle);
    return { val, pos };
  });

  return (
    <div
      className="relative flex flex-col items-center justify-center"
      style={{ width: size, height: size * 0.75 }}
    >
      <svg
        width={size}
        height={size * 0.85}
        viewBox={`0 0 ${size} ${size * 0.85}`}
        aria-label={`ATS Score: ${score} out of 100`}
        role="img"
        style={{ overflow: "visible" }}
      >
        <path
          d={trackPath}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {fillPath && (
          <path
            d={fillPath}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            style={{ transition: "all 1s ease" }}
          />
        )}

        {ticks.map(({ val, inner, outer }) => (
          <line
            key={val}
            x1={inner.x}
            y1={inner.y}
            x2={outer.x}
            y2={outer.y}
            stroke="#cbd5e1"
            strokeWidth={1.5}
          />
        ))}

        {tickLabels.map(({ val, pos }) => (
          <text
            key={val}
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={size * 0.07}
            fill="#64748b"
            fontWeight="600"
          >
            {val}
          </text>
        ))}

        <circle cx={cx} cy={cy} r={size * 0.035} fill={color} />

        {(() => {
          const needleAngle = fillAngle;
          const tip = polarToCartesian(cx, cy, trackR, needleAngle);
          return (
            <line
              x1={cx}
              y1={cy}
              x2={tip.x}
              y2={tip.y}
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              style={{ transition: "all 1s ease" }}
            />
          );
        })()}
      </svg>

      <div className="absolute bottom-[10px] text-center">
        <div className="text-[2.2rem] font-black leading-none" style={{ color }}>
          {score}
        </div>
        <div className="text-[11px] text-[#64748b] font-semibold uppercase tracking-wide">
          / 100
        </div>
      </div>
    </div>
  );
};

export default ScoreGauge;
