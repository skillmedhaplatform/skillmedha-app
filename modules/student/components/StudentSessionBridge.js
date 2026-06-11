"use client";
import { useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";

/**
 * Syncs session tokens passed from the Unified Login portal.
 */
export default function StudentSessionBridge({ children }) {
    const searchParams = useSearchParams();
    const pathname = usePathname();

    useEffect(() => {
        const token = searchParams.get("token");
        const sId = searchParams.get("sId");

        if (token) {
            // 1. Save to localStorage (Student portal uses 'token' and 'sId')
            localStorage.setItem("token", token);
            if (sId) localStorage.setItem("sId", sId);
            
            // 2. Save to Cookie for server-side / middleware access
            Cookies.set("token", token, { expires: 7, path: "/" });

            // 3. Clean up the URL
            const newParams = new URLSearchParams(searchParams.toString());
            newParams.delete("token");
            newParams.delete("sId");
            const newQuery = newParams.toString();
            const newUrl = pathname + (newQuery ? `?${newQuery}` : "");
            
            window.history.replaceState({}, "", newUrl);
            
            console.log("[session-bridge] Student tokens synchronized successfully.");
        }
    }, [searchParams, pathname]);

    return <>{children}</>;
}
