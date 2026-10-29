"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchCourseCatalog } from "@/services/courseAccessApi";

// Shared helpers for admin-configured course access on the student side.
// The server is the source of truth (it strips lesson content of locked
// courses); this only drives badges, buttons and the bundles strip.

export const formatPrice = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

export const courseBundleCheckoutUrl = (bundleId) => `/student/course-bundles/checkout?bundleId=${bundleId}`;

export const accessValidity = (expiresAt) =>
  expiresAt
    ? `Access until ${new Date(expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
    : "Lifetime access";

const DAY = 24 * 60 * 60 * 1000;
export const MY_PURCHASES_PATH = "/student/my-purchases";

/** Days of access left when it ends within `withinDays`, otherwise null. */
export const expiringIn = (expiresAt, withinDays = 7) => {
  if (!expiresAt) return null;
  const left = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / DAY);
  return left > 0 && left <= withinDays ? left : null;
};

export const expiryText = (days) => (days === 1 ? "Access ends tomorrow" : `Access ends in ${days} days`);

/**
 * One plain sentence telling the student how they get this course.
 * tone: green (can learn), amber (pay), violet (bundle), slate (other).
 */
export const accessLabel = (info) => {
  if (!info) return null;
  const e = info.entitlement || {};
  if (e.unlocked) {
    if (e.reason === "assigned") return { text: "Assigned by your college", tone: "green" };
    if (e.reason === "free") return { text: "Free", tone: "green" };
    if (e.reason === "bundle") return { text: e.bundleTitle ? `Via ${e.bundleTitle}` : "Via bundle", tone: "green" };
    return { text: "Purchased", tone: "green" };
  }
  if (info.access === "bundle") {
    const b = info.bundles?.[0];
    return { text: b ? `In ${b.title} · ${formatPrice(b.price)}` : "Bundle only", tone: "violet" };
  }
  if (info.access === "free") return { text: "Free", tone: "green" };
  return { text: info.price > 0 ? formatPrice(info.price) : "Paid", tone: "amber" };
};

/** Library filter chips for courses. */
export const ACCESS_FILTERS = [
  { value: "all", label: "All" },
  { value: "free", label: "Free" },
  { value: "paid", label: "Paid" },
  { value: "bundle", label: "Bundle only" },
  { value: "unlocked", label: "Unlocked" },
];

export const matchesAccessFilter = (info, filter) => {
  if (!filter || filter === "all") return true;
  if (!info) return false;
  const unlocked = !!info.entitlement?.unlocked;
  if (filter === "unlocked") return unlocked;
  if (filter === "free") return info.access === "free";
  if (filter === "paid") return info.access === "premium" && !unlocked;
  if (filter === "bundle") return info.access === "bundle" && !unlocked;
  return true;
};

/**
 * How a course card should present itself.
 * kind: owned | free | bundle | premium | null (no access info yet)
 */
export const courseCardState = (info) => {
  if (!info) return { kind: null };
  if (info.entitlement?.unlocked) {
    return { kind: info.entitlement.reason === "free" ? "free" : "owned", reason: info.entitlement.reason };
  }
  if (info.access === "bundle") return { kind: "bundle", bundles: info.bundles || [] };
  if (info.access === "free") return { kind: "free" };
  return { kind: "premium", price: info.price, mrp: info.mrp };
};

/** Loads the student's course access catalogue once. */
export const useCourseAccess = (enabled = true) => {
  const [catalog, setCatalog] = useState(null);
  const [loading, setLoading] = useState(enabled);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      setCatalog(await fetchCourseCatalog());
    } catch (err) {
      // Without access info the library behaves exactly as before.
      console.error("course-catalog:", err.message);
      setCatalog(null);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const byId = useMemo(
    () => new Map((catalog?.courses || []).map((c) => [String(c.courseId), c])),
    [catalog]
  );

  return { loading, byId, bundles: catalog?.bundles || [], refresh, ready: !!catalog };
};
