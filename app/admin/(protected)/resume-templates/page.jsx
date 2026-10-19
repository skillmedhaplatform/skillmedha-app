"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { App, Tabs } from "antd";
import { TEMPLATE_OPTIONS } from "@/app/student/(protected)/resumeBuilder/Templates/registry";
import {
  adminFetchBundles,
  adminFetchStats,
  adminFetchTemplateConfigs,
} from "@/services/resumeTemplatesApi";
import OverviewTab from "./components/OverviewTab";
import TemplatesTab from "./components/TemplatesTab";
import BundlesTab from "./components/BundlesTab";
import PurchasesTab from "./components/PurchasesTab";

// Admin → Resume Templates. Every template layout in the app is listed; a
// template the admin hasn't configured yet behaves as Free + Published, which
// is how students saw it before this screen existed.
export default function ResumeTemplatesAdminPage() {
  const { message } = App.useApp();
  const [configs, setConfigs] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [c, b, s] = await Promise.all([adminFetchTemplateConfigs(), adminFetchBundles(), adminFetchStats()]);
      setConfigs(c);
      setBundles(b);
      setStats(s);
    } catch (err) {
      message.error(err.message || "Failed to load resume templates");
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    reload();
  }, [reload]);

  // One row per template in the app, merged with its saved config (if any).
  const templates = useMemo(() => {
    const byKey = new Map(configs.map((c) => [c.templateKey, c]));
    return TEMPLATE_OPTIONS.map((option, index) => {
      const config = byKey.get(option.id);
      return {
        key: option.id,
        position: index + 1,
        defaultName: option.label,
        configured: !!config,
        config: config || null,
        name: config?.name || option.label,
        category: config?.category || option.category || "",
        description: config ? config.description || "" : option.description || "",
        bestFor: config?.bestFor?.length ? config.bestFor : option.bestFor || [],
        features: option.features || [],
        validityDays: config?.validityDays || 0,
        access: config?.access || "free",
        visibility: config?.visibility || "published",
        price: config?.price || 0,
        mrp: config?.mrp || 0,
        order: config?.order ?? index + 1,
        featured: !!config?.featured,
        previewImage: config?.previewImage || "",
        bundles: config?.bundles || [],
      };
    }).sort((a, b) => a.order - b.order);
  }, [configs]);

  return (
    <div className="flex w-full flex-col gap-4 px-4 py-5 lg:px-6">
      <div>
        <div className="text-[20px] font-bold text-slate-900">Resume Templates</div>
        <div className="text-[13px] text-slate-500">
          Control which templates students see, which are free or paid, and sell templates in bundles.
        </div>
      </div>
      <div className="rounded-xl border border-slate-100 bg-white px-4 pb-4 shadow-sm">
        <Tabs
          activeKey={tab}
          onChange={setTab}
          items={[
            {
              key: "overview",
              label: "Overview",
              children: <OverviewTab templates={templates} stats={stats} loading={loading} onNavigate={setTab} />,
            },
            {
              key: "templates",
              label: `Templates (${templates.length})`,
              children: <TemplatesTab templates={templates} bundles={bundles} loading={loading} onSaved={reload} />,
            },
            {
              key: "bundles",
              label: `Bundles (${bundles.length})`,
              children: <BundlesTab templates={templates} bundles={bundles} loading={loading} onSaved={reload} />,
            },
            { key: "purchases", label: "Purchases", children: <PurchasesTab /> },
          ]}
        />
      </div>
    </div>
  );
}
