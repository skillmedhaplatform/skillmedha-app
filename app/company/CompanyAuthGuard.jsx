"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { getLstorage } from "@/utils/universalUtils/windowMW";

export default function CompanyAuthGuard({ children }) {
  const nav = useRouter();
  const currPath = usePathname();

  useEffect(() => {
    const token = getLstorage("token");
    if (!token) nav.replace("/company/login");
    if (currPath === "/company") nav.replace("/company/profile");
  }, []);

  return <>{children}</>;
}
