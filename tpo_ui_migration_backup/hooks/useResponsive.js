"use client";
import { useState, useEffect } from "react";

/**
 * Unified responsive breakpoint hook.
 *
 * Returns true when the viewport is narrower
 * than 1024px (or custom breakpoint).
 * Initializes from window.innerWidth immediately
 * on client to prevent layout flash.
 */
export default function useResponsive(breakpoint = 1024) {
  const [isResponsive, setIsResponsive] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < breakpoint;
  });

  useEffect(() => {
    const check = () =>
      setIsResponsive(window.innerWidth < breakpoint);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);

  return isResponsive;
}
