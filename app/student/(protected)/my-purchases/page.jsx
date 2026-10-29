"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Empty, Result, Segmented, Spin } from "antd";
import { FiArrowLeft, FiBookOpen, FiLayers, FiClock, FiPlayCircle } from "react-icons/fi";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";
import { accessValidity, expiringIn, expiryText, formatPrice } from "@/components/courseAccess/access";
import { fetchMyCoursePurchases } from "@/services/courseAccessApi";

const COURSE_LIBRARY_PATH = "/student/course";
const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";
const learnUrl = (courseId, title) =>
  `/student/learning-course?title=${encodeURIComponent(String(title || "").split(" ").join(""))}&id=${courseId}`;

const Status = ({ item }) => {
  if (item.expired) {
    return <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-500">Expired</span>;
  }
  const days = expiringIn(item.expiresAt);
  if (days) {
    return (
      <span className="flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-bold text-red-600">
        <FiClock /> {expiryText(days)}
      </span>
    );
  }
  return <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">Active</span>;
};

// Student → My Purchases: every course and course bundle they bought, with
// the amount paid, when, and how long access lasts.
export default function MyPurchasesPage() {
  const router = useRouter();
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [view, setView] = useState("all");

  const load = useCallback(async () => {
    setError("");
    try {
      setItems(await fetchMyCoursePurchases());
    } catch (err) {
      setError(err.message || "Couldn't load your purchases");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const shown = useMemo(() => {
    const list = items || [];
    if (view === "active") return list.filter((i) => !i.expired);
    if (view === "expired") return list.filter((i) => i.expired);
    return list;
  }, [items, view]);

  const totalSpent = (items || []).reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  const wrap = (content) => (
    <div className="flex h-full flex-col overflow-y-auto bg-[#EFF5FB]">
      <StudentPageHeader
        title="My Purchases"
        subtitle="Courses and bundles you have bought"
        leftSlot={
          <button
            type="button"
            onClick={() => router.push(COURSE_LIBRARY_PATH)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Back to Course Library"
          >
            <FiArrowLeft />
          </button>
        }
      />
      <div className="mx-auto w-full max-w-[1000px] flex-1 px-4 py-8 lg:px-8">{content}</div>
    </div>
  );

  if (error) {
    return wrap(
      <Result
        status="warning"
        title="Couldn't load your purchases"
        subTitle={error}
        extra={
          <Button type="primary" onClick={load}>
            Try again
          </Button>
        }
      />
    );
  }
  if (!items) {
    return wrap(
      <div className="flex justify-center py-24">
        <Spin size="large" />
      </div>
    );
  }
  if (!items.length) {
    return wrap(
      <Empty description="You haven't bought any courses yet">
        <Button type="primary" onClick={() => router.push(COURSE_LIBRARY_PATH)}>
          Browse courses
        </Button>
      </Empty>
    );
  }

  return wrap(
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-3">
          <div className="rounded-xl border border-slate-100 bg-white px-4 py-2.5 shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Purchases</div>
            <div className="text-[18px] font-bold text-slate-900">{items.length}</div>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white px-4 py-2.5 shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Total paid</div>
            <div className="text-[18px] font-bold text-slate-900">{formatPrice(totalSpent)}</div>
          </div>
        </div>
        <Segmented
          value={view}
          onChange={setView}
          options={[
            { value: "all", label: "All" },
            { value: "active", label: "Active" },
            { value: "expired", label: "Expired" },
          ]}
        />
      </div>

      {!shown.length ? (
        <Empty description="Nothing here" />
      ) : (
        shown.map((item) => (
          <div key={`${item.kind}-${item.id}`} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-[48px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
                  {item.kind === "course" && item.thumbnail ? (
                    <img src={item.thumbnail} alt="" className="h-full w-full object-cover" />
                  ) : item.kind === "bundle" ? (
                    <FiLayers className="text-[20px] text-violet-500" />
                  ) : (
                    <FiBookOpen className="text-[20px] text-blue-500" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-[15px] font-bold text-slate-800">{item.title}</span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                        item.kind === "bundle" ? "bg-violet-50 text-violet-700" : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {item.kind === "bundle" ? `Bundle · ${item.courses?.length || 0} courses` : "Course"}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[12px] text-slate-500">
                    Bought {formatDate(item.purchasedAt)}
                    {item.amount !== null && item.amount !== undefined ? ` · Paid ${formatPrice(item.amount)}` : ""}
                    {" · "}
                    {item.expired ? `Ended ${formatDate(item.expiresAt)}` : accessValidity(item.expiresAt)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Status item={item} />
                {item.kind === "course" && !item.expired && (
                  <Button type="primary" icon={<FiPlayCircle />} onClick={() => router.push(learnUrl(item.id, item.title))}>
                    Continue
                  </Button>
                )}
                {item.expired && (
                  <Button onClick={() => router.push(item.kind === "course" ? `/student/course/${item.id}` : COURSE_LIBRARY_PATH)}>
                    Renew
                  </Button>
                )}
              </div>
            </div>

            {item.kind === "bundle" && item.courses?.length > 0 && (
              <ul className="mt-4 flex flex-col divide-y divide-slate-100 rounded-xl border border-slate-100 p-0">
                {item.courses.map((c) => (
                  <li key={c.courseId} className="flex list-none items-center justify-between gap-3 px-4 py-2.5">
                    <span className="flex min-w-0 items-center gap-2 text-[13px] font-medium text-slate-700">
                      <FiBookOpen className="shrink-0 text-blue-600" />
                      <span className="truncate">{c.title}</span>
                    </span>
                    {!item.expired && (
                      <Button size="small" type="link" onClick={() => router.push(learnUrl(c.courseId, c.title))}>
                        Continue
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))
      )}
    </div>
  );
}
