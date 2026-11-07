"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "antd";
import { HiOutlineSparkles } from "react-icons/hi2";
import { fetchMembership } from "@/services/membershipApi";
import { PLANS_PATH, formatPrice } from "./plans";

// Offer strip on the course and practice pages: the plans a student can still
// buy, from the lowest price. Shows nothing when no plan is on, when the student
// already has the top plan, or when plans can't be loaded.
export default function PlansBanner({ className = "" }) {
  const router = useRouter();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchMembership()
      .then(setData)
      .catch(() => setData(null));
  }, []);

  const buyable = (data?.plans || []).filter(
    (p) => p.options?.length && !p.blocked && p.key !== data?.current?.planKey
  );
  if (!data?.enabled || !buyable.length) return null;

  const fromPrice = Math.min(...buyable.flatMap((p) => p.options.map((o) => o.payable)));
  const names = buyable.map((p) => p.name).join(" and ");

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 ${className}`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <HiOutlineSparkles className="shrink-0 text-[22px] text-violet-600" aria-hidden="true" />
        <div className="min-w-0">
          <div className="text-[14px] font-bold text-violet-900">
            {data.current ? `Upgrade to ${names}` : `Get ${names}`}
          </div>
          <div className="text-[13px] text-violet-800">
            One plan opens many courses and practice sets, from {formatPrice(fromPrice)}.
          </div>
        </div>
      </div>
      <Button type="primary" onClick={() => router.push(PLANS_PATH)}>
        See plans
      </Button>
    </div>
  );
}
