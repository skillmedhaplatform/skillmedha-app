"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function TourSpotlight({ targetRect, padding = 2, borderRadius = 12 }) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  if (!targetRect || dimensions.width === 0) return null;

  // Resolve padding (can be a number or an object { top, right, bottom, left })
  const pad =
    typeof padding === "number"
      ? { top: padding, right: padding, bottom: padding, left: padding }
      : { top: 0, right: 0, bottom: 0, left: 0, ...padding };

  const cutoutX = Math.max(0, targetRect.x - pad.left);
  const cutoutY = Math.max(0, targetRect.y - pad.top);
  const cutoutW = targetRect.width + pad.left + pad.right;
  const cutoutH = targetRect.height + pad.top + pad.bottom;
  const r = borderRadius !== undefined ? borderRadius : 12;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9990] overflow-hidden">
      {/* SVG Mask for Dimmed Backdrop with Cutout */}
      <svg
        className="fixed inset-0 w-full h-full pointer-events-none"
        style={{ width: "100vw", height: "100vh" }}
      >
        <defs>
          <mask id="spotlight-mask">
            {/* White covers entire screen (dimmed area) */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Black cutout creates the transparent hole */}
            <motion.rect
              animate={{
                x: cutoutX,
                y: cutoutY,
                width: cutoutW,
                height: cutoutH,
              }}
              transition={{ type: "spring", stiffness: 350, damping: 32 }}
              rx={r}
              fill="black"
            />
          </mask>
        </defs>

        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(15, 23, 42, 0.72)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Glowing Highlight Ring strictly around target */}
      <motion.div
        animate={{
          x: cutoutX,
          y: cutoutY,
          width: cutoutW,
          height: cutoutH,
        }}
        transition={{ type: "spring", stiffness: 350, damping: 32 }}
        className="fixed top-0 left-0 pointer-events-none"
        style={{
          borderRadius: `${r}px`,
          border: r === 0 ? "2px solid rgba(255, 255, 255, 0.95)" : "2px solid rgba(255, 255, 255, 0.95)",
          boxShadow: "0 0 0 1px rgba(37, 99, 235, 0.4), 0 0 25px rgba(37, 99, 235, 0.4)",
          zIndex: 9992,
        }}
      />
    </div>
  );
}
