"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DeprecatedNewsFlashPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/website?section=newsflash");
  }, [router]);

  return null;
}
