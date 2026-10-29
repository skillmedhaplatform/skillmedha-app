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
