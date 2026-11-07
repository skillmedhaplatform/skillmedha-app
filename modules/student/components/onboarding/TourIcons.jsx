"use client";
import React from "react";

export const TourWelcomeIcon = ({ className = "w-24 h-24" }) => {
  return (
    <div className={`relative flex items-center justify-center rounded-3xl bg-blue-50/80 border border-blue-100 shadow-inner ${className}`}>
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-[#2563EB]"
      >
        {/* Laptop Screen Frame */}
        <rect
          x="12"
          y="15"
          width="40"
          height="26"
          rx="3"
          stroke="#2563EB"
          strokeWidth="2.5"
          fill="#EFF6FF"
        />
        {/* Open Book on Screen */}
        <path
          d="M32 23V34M32 24C30 22.5 26.5 22.5 23 23.5V33.5C26.5 32.5 30 32.5 32 34M32 24C34 22.5 37.5 22.5 41 23.5V33.5C37.5 32.5 34 32.5 32 34"
          stroke="#2563EB"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Laptop Base */}
        <path
          d="M8 43C8 41.8954 8.89543 41 10 41H54C55.1046 41 56 41.8954 56 43V45C56 46.1046 55.1046 47 54 47H10C8.89543 47 8 46.1046 8 45V43Z"
          fill="#2563EB"
        />
        {/* Laptop Trackpad Notch */}
        <path
          d="M27 41H37"
          stroke="#93C5FD"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export const TourCompleteIcon = ({ className = "w-24 h-24" }) => {
  return (
    <div className={`relative flex items-center justify-center rounded-3xl bg-blue-50/80 border border-blue-100 shadow-inner ${className}`}>
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-[#2563EB]"
      >
        {/* Laptop Screen Frame */}
        <rect
          x="12"
          y="15"
          width="40"
          height="26"
          rx="3"
          stroke="#2563EB"
          strokeWidth="2.5"
          fill="#EFF6FF"
        />
        {/* Checkmark Circle on Screen */}
        <circle cx="32" cy="28" r="8" fill="#2563EB" />
        <path
          d="M28.5 28L31 30.5L35.5 25.5"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Laptop Base */}
        <path
          d="M8 43C8 41.8954 8.89543 41 10 41H54C55.1046 41 56 41.8954 56 43V45C56 46.1046 55.1046 47 54 47H10C8.89543 47 8 46.1046 8 45V43Z"
          fill="#2563EB"
        />
        {/* Laptop Trackpad Notch */}
        <path
          d="M27 41H37"
          stroke="#93C5FD"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

