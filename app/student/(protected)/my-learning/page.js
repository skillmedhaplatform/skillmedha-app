"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spin } from "antd";

export default function MyLearningRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/student/course");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Spin size="large" tip="Redirecting to your courses..." />
    </div>
  );
}
