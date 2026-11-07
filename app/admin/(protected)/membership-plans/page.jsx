"use client";
import React, { useCallback, useEffect, useState } from "react";
import { App, Tabs } from "antd";
import { adminFetchMembershipStats, adminFetchPlans } from "@/services/membershipApi";
import { formatPrice } from "@/components/membership/plans";
import PlansTab from "./components/PlansTab";
import MembersTab from "./components/MembersTab";

// Admin → Plans & Membership. Separate from Course Access & Bundles and practice
// set pricing: those keep working exactly as before. A plan only opens the items
// tagged for it, and students see nothing until a plan is turned on.
export default function MembershipPlansAdminPage() {
  const { message } = App.useApp();
  const [plans, setPlans] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("plans");

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [p, s] = await Promise.all([adminFetchPlans(), adminFetchMembershipStats()]);
      setPlans(p);
      setStats(s);
    } catch (err) {
      message.error(err.message || "Failed to load plans");
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    reload();
  }, [reload]);

  const totals = stats?.plans || [];
  const sum = (field) => totals.reduce((n, p) => n + (p[field] || 0), 0);
  const summary = [
    { label: "Active members", value: sum("active") },
    { label: "Plan sales", value: formatPrice(sum("revenue")) },
    { label: "Plans ending in 7 days", value: stats?.endingSoon ?? 0 },
  ];

  return (
    <div className="flex w-full flex-col gap-4 px-4 py-5 lg:px-6">
      <div>
        <div className="text-[20px] font-bold text-slate-900">Plans & Membership</div>
        <div className="text-[13px] text-slate-500">
          Sell one payment passes that open many courses and practice sets for a set time. Course prices and bundles
          keep working as they do today.
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {summary.map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <div className="text-[13px] text-slate-500">{s.label}</div>
            <div className="mt-1 text-[20px] font-bold text-slate-900">{loading ? "–" : s.value}</div>
          </div>
        ))}
      </div>

      <Tabs
        activeKey={tab}
        onChange={setTab}
        items={[
          { key: "plans", label: "Plans", children: <PlansTab plans={plans} loading={loading} onChanged={reload} /> },
          { key: "members", label: "Members", children: <MembersTab plans={plans} onChanged={reload} /> },
        ]}
      />
    </div>
  );
}
