"use client";
import { useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { setLstorage } from "@/utils/universalUtils/windowMW";

/**
 * SessionBridge — reads the `token` query param injected by the Unified Login
 * portal on redirect, persists it to localStorage, then strips it from the URL
 * so the auth guard in Header sees a valid session instead of redirecting back.
 */
export default function SessionBridge() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      // Persist the token so all other components can find it via getLstorage("token")
      setLstorage("token", token);

      // Clean the token out of the URL (replace so no back-button weirdness)
      const params = new URLSearchParams(searchParams.toString());
      params.delete("token");
      const newUrl = pathname + (params.toString() ? `?${params.toString()}` : "");
      router.replace(newUrl);
    }
  }, [searchParams, pathname, router]);

  return null; // renders nothing, purely side-effect
}
