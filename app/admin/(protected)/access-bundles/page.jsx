"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, App, Tabs } from "antd";
import { adminFetchCourseBundles, adminFetchCourseConfigs, adminFetchCourseStats } from "@/services/courseAccessApi";
import CoursesTab from "./components/CoursesTab";
import CourseBundlesTab from "./components/CourseBundlesTab";

const formatPrice = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

// Admin → Course Access & Bundles. Every course (not internships) is listed.
// A course never configured here keeps its old behaviour: Premium at its
// price, or Free when that price is ₹0. Prices edited here are written to the
// course itself, so the course editor and checkout always agree. Courses a college assigned to
// its students always stay unlocked for those students.
export default function CourseAccessAdminPage() {
  const { message } = App.useApp();
  const [courses, setCourses] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("courses");

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [c, b, s] = await Promise.all([adminFetchCourseConfigs(), adminFetchCourseBundles(), adminFetchCourseStats()]);
      setCourses(c);
      setBundles(b);
      setStats(s);
    } catch (err) {
      message.error(err.message || "Failed to load course access");
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    reload();
  }, [reload]);

  const summary = useMemo(() => {
    const count = (fn) => courses.filter(fn).length;
    return [
      { label: "Free", value: count((c) => c.access === "free" && c.visibility === "published"), tone: "text-emerald-600" },
      { label: "Premium", value: count((c) => c.access === "premium" && c.visibility === "published"), tone: "text-amber-600" },
      { label: "Bundle only", value: count((c) => c.access === "bundle" && c.visibility === "published"), tone: "text-violet-600" },
      { label: "Hidden", value: count((c) => c.visibility === "hidden"), tone: "text-slate-500" },
      { label: "Live bundles", value: stats?.bundles?.active ?? 0, tone: "text-blue-600" },
      {
        label: "Bundle sales",
        value: `${stats?.sales?.bundles?.orders ?? 0} · ${formatPrice(stats?.sales?.bundles?.revenue)}`,
        tone: "text-slate-800",
      },
    ];
  }, [courses, stats]);

  // The API adds basePrice to every row; without it the server is running
  // older code and would ignore price changes.
  const apiOutdated = !loading && courses.length > 0 && courses.every((c) => c.basePrice === undefined);

  return (
    <div className="flex w-full flex-col gap-4 px-4 py-5 lg:px-6">
      {apiOutdated && (
        <Alert
          type="warning"
          showIcon
          message="The API server is running older code — price changes won't be saved."
          description="Restart the API (npm start in the API folder), then refresh this page."
        />
      )}
      <div>
        <div className="text-[20px] font-bold text-slate-900">Course Access & Bundles</div>
        <div className="text-[13px] text-slate-500">
          Set each course&apos;s price and whether it is free, paid or sold only in bundles, hide courses from students,
          and create course bundles. Prices saved here update the course editor too; college-assigned courses always
          stay unlocked.
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {summary.map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
            <div className="text-[12px] font-semibold uppercase tracking-wide text-slate-400">{s.label}</div>
            <div className={`mt-1 text-[20px] font-bold ${s.tone}`}>{loading ? "–" : s.value}</div>
          </div>
        ))}
      </div>

      <Tabs
        activeKey={tab}
        onChange={setTab}
        items={[
          {
            key: "courses",
            label: `Courses (${courses.length})`,
            children: <CoursesTab courses={courses} loading={loading} onChanged={reload} setCourses={setCourses} />,
          },
          {
            key: "bundles",
            label: `Bundles (${bundles.length})`,
            children: <CourseBundlesTab bundles={bundles} courses={courses} loading={loading} onChanged={reload} />,
          },
        ]}
      />
    </div>
  );
}
