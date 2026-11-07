"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchMembership } from "@/services/membershipApi";
import { expiringIn, expiryText } from "@/components/courseAccess/access";
import { PLANS_PATH, formatDate } from "./plans";

// The student's current plan and when it ends. Shows nothing when they have no
// plan, or when plans can't be loaded.
export default function MyPlanNotice() {
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    fetchMembership()
      .then((data) => setCurrent(data?.current || null))
      .catch(() => setCurrent(null));
  }, []);

  if (!current) return null;
  const daysLeft = expiringIn(current.expiresAt);

  return (
    <div
      className={`mb-5 flex flex-wrap items-center justify-between gap-2 rounded-xl border px-4 py-3 text-sm ${
        daysLeft ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-800"
      }`}
    >
      <span>
        <span className="font-semibold">{current.name} plan</span> ·{" "}
        {daysLeft ? expiryText(daysLeft) : `Access until ${formatDate(current.expiresAt)}`}
      </span>
      <Link href={PLANS_PATH} className="font-semibold underline">
        {daysLeft ? "Renew" : "Manage plan"}
      </Link>
    </div>
  );
}
