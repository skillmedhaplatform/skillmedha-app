"use client";
import { useEffect } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { setLstorage } from "@/utils/universalUtils/windowMW";

/**
 * TpoSessionBridge
 *
 * Reads `token` and `userId` from the URL query string that the Unified Login
 * portal appends on redirect, persists them to localStorage, then cleans the URL.
 *
 * Must be rendered high in the tree (root layout) BEFORE any component that
 * calls getLstorage("token") / getLstorage("userId").
 */
export default function TpoSessionBridge({ children }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    const token = searchParams.get("token");
    const userId = searchParams.get("userId");

    if (token) {
      // Persist to localStorage so layout auth check passes
      setLstorage("token", token);
      if (userId) setLstorage("userId", userId);

      // Also set a cookie so any future middleware / SSR reads work
      document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax`;

      // Strip the sensitive params from the URL without a navigation
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete("token");
      newParams.delete("userId");
      const newQuery = newParams.toString();
      const newUrl = pathname + (newQuery ? `?${newQuery}` : "");
      window.history.replaceState({}, "", newUrl);

      console.log("[tpo-session-bridge] TPO tokens synchronized successfully.");
    }
  }, [searchParams, pathname]);

  return <>{children}</>;
}
