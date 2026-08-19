"use client";
import { useState, useEffect } from "react";

// Track globally if the app has hydrated to avoid SSR mismatch on first load,
// while preventing layout flashes on subsequent client-side navigations.
let globalMounted = false;

/**
 * Unified responsive breakpoint hook.
 *
 * Returns `true` when the viewport is narrower than 1024px,
 * meaning the mobile / tablet responsive layout should be used.
 *
 * Desktop layout activates at 1024px and above.
 */
export default function useResponsive(breakpoint = 1024) {
  const [isResponsive, setIsResponsive] = useState(() => {
    // Only return the actual width if we have already hydrated.
    // This prevents hydration mismatch on the first load,
    // but ensures immediate correct layout on client-side navigations.
    if (globalMounted && typeof window !== "undefined") {
      return window.innerWidth < breakpoint;
    }
    return false;
  });

  useEffect(() => {
    globalMounted = true;
    const check = () => setIsResponsive(window.innerWidth < breakpoint);
    check(); 
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);

  return isResponsive;
}
