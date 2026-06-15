"use client";
import { useState, useEffect } from "react";

/**
 * Unified responsive breakpoint hook.
 *
 * Returns `true` when the viewport is narrower than 1024px,
 * meaning the mobile / tablet responsive layout should be used.
 *
 * Desktop layout activates at 1024px and above.
 *
 * Usage:
 *   const isMobile = useResponsive();         // default: < 1024
 *   const isSmall  = useResponsive(600);       // custom: < 600
 */
export default function useResponsive(breakpoint = 1024) {
  const [isResponsive, setIsResponsive] = useState(false);

  useEffect(() => {
    const check = () => setIsResponsive(window.innerWidth < breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);

  return isResponsive;
}
