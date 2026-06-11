"use client";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getCurrentUser } from "@/redux/slices/admin/adminAuthSlice";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";

export default function UserDataLayer({ children }) {
    const dispatch = useDispatch();
    // const searchParams = useSearchParams();
    // const router = useRouter();
    // const pathname = usePathname();

    useEffect(() => {
        // let token = searchParams.get("token");
        // const jwtToken = searchParams.get("jwtToken");

        // if (token) {
        //     // Restore '+' characters if they were converted to spaces by searchParams.get
        //     token = token.replace(/ /g, "+");

        //     // Save to localStorage
        //     localStorage.setItem("token", token);
        //     if (jwtToken) localStorage.setItem("jwtToken", jwtToken);

        //     // Save to Cookie for server-side / middleware access
        //     Cookies.set("token", token, { expires: 7, path: "/" });

        //     // Clean up the URL to remove sensitive tokens
        //     const newParams = new URLSearchParams(searchParams.toString());
        //     newParams.delete("token");
        //     newParams.delete("jwtToken");
        //     const newQuery = newParams.toString();
        //     const newUrl = pathname + (newQuery ? `?${newQuery}` : "");

        //     // Replace URL without tokens
        //     window.history.replaceState({}, "", newUrl);
        // }

        // Fetch user data once tokens are in place
        dispatch(getCurrentUser());
    }, [dispatch]);

    return <>{children}</>;
}
