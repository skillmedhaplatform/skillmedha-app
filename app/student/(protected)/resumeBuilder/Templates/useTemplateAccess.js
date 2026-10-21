"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { authorizeResumeTemplate, fetchResumeCatalog } from "@/services/resumeTemplatesApi";

const FREE = { unlocked: true, reason: "free", expiresAt: null };

/**
 * The student's view of the admin-configured template catalogue.
 * - `options(list)` keeps the templates the student may see (hidden ones are
 *   dropped), applies the admin's names, and sorts by the admin's order.
 * - `accessOf(key)` says whether a template is usable right now.
 * - `ensureAllowed(key)` asks the server — call it before switching to a
 *   template or generating a PDF, since the UI alone can't be trusted.
 * Templates the admin hasn't configured are free, exactly as before.
 */
export default function useTemplateAccess() {
  const [catalog, setCatalog] = useState(null);
  const [status, setStatus] = useState("loading");

  const reload = useCallback(async () => {
    setStatus("loading");
    try {
      setCatalog(await fetchResumeCatalog());
      setStatus("ready");
    } catch {
      // The server still enforces access at download time, so the builder
      // keeps working with default (free) labels if the catalogue can't load.
      setStatus("failed");
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const metaByKey = useMemo(
    () => new Map((catalog?.templates || []).map((t) => [t.templateKey, t])),
    [catalog]
  );
  const hiddenKeys = useMemo(() => new Set(catalog?.hiddenKeys || []), [catalog]);

  const metaOf = useCallback((key) => metaByKey.get(key) || null, [metaByKey]);

  const accessOf = useCallback(
    (key) => {
      if (hiddenKeys.has(key)) return { unlocked: false, reason: "hidden", expiresAt: null };
      return metaByKey.get(key)?.entitlement || FREE;
    },
    [metaByKey, hiddenKeys]
  );

  const isLocked = useCallback((key) => !accessOf(key).unlocked, [accessOf]);

  const options = useCallback(
    (list) =>
      list
        .map((o, index) => ({ o, index, meta: metaByKey.get(o.id) }))
        .filter(({ o }) => !hiddenKeys.has(o.id))
        // Unconfigured templates keep their position (template7 → 7).
        .sort((a, b) => (a.meta?.order ?? a.index + 1) - (b.meta?.order ?? b.index + 1))
        .map(({ o, meta }) => ({ ...o, label: meta?.name || o.label, meta })),
    [metaByKey, hiddenKeys]
  );

  const ensureAllowed = useCallback(async (key) => {
    try {
      return await authorizeResumeTemplate(key);
    } catch {
      return { allowed: false, code: "ERROR", message: "Couldn't check access to this template. Please try again." };
    }
  }, []);

  return {
    status,
    reload,
    bundles: catalog?.bundles || [],
    metaOf,
    accessOf,
    isLocked,
    options,
    ensureAllowed,
  };
}
