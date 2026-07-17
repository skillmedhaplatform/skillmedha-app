"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export const normalizeExternalLink = (value) => {
  if (!value) return "";
  return value.startsWith("http") ? value : `https://${value}`;
};

export const stripWrappingQuotes = (text) => {
  if (typeof text !== "string") return text || "";
  if (text[0] === '"' && text[text.length - 1] === '"') {
    return text.slice(1, -1);
  }
  return text;
};

export const asHtmlString = (value) => {
  if (!value) return "";
  return stripWrappingQuotes(typeof value === "string" ? value : String(value));
};

export const useResumeTemplateData = () => {
  const studentData = useSelector((state) => state.student.student?.data) || {};
  const experienceDetails = studentData?.experiences || [];

  return {
    basicDetails: studentData,
    educationDetails: studentData?.educationDetails || [],
    workExperience: experienceDetails.filter(
      (item) => item?.type?.toLowerCase() === "work"
    ),
    internshipDetails: experienceDetails.filter(
      (item) => item?.type?.toLowerCase() !== "work"
    ),
    projectDetails: studentData?.projects || [],
    accDetails: studentData?.accomplishments || [],
    skills: studentData?.technical || [],
    languages: studentData?.languages || [],
    links: studentData?.links || [],
    volunteerings: studentData?.volunteerings || [],
    certificates: studentData?.certificates || [],
  };
};

export const useProfileImage = (profileUrl) => {
  const [profileBase64, setProfileBase64] = useState(null);

  useEffect(() => {
    if (!profileUrl) {
      setProfileBase64(null);
      return;
    }

    let isMounted = true;

    // Student profile photos are typically served from a storage bucket
    // that doesn't send CORS headers. A plain <img>/background-image
    // renders such a URL fine, but reading it back out of a canvas (which
    // is what both this conversion and html2canvas's PDF capture do) is
    // blocked by the browser as a cross-origin taint. The direct
    // `crossOrigin="anonymous"` attempt below still gets tried first
    // (cheap, and works whenever the host does allow CORS), but if it
    // fails we fall back to this app's own same-origin `/api/proxy-image`
    // route instead of the broken source URL — fetching cross-origin
    // bytes server-side has no CORS restriction, so it reliably succeeds
    // where the browser-side attempt can't.
    const toDataUrlViaCanvas = (url) =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";

        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth || img.width;
            canvas.height = img.naturalHeight || img.height;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);

            resolve(canvas.toDataURL("image/jpeg", 0.95));
          } catch (error) {
            reject(error);
          }
        };

        img.onerror = () => reject(new Error("Image failed to load"));
        img.src = `${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`;
      });

    const toDataUrlViaProxy = (url) =>
      fetch(`/api/proxy-image?url=${encodeURIComponent(url)}`)
        .then((response) => {
          if (!response.ok) throw new Error("Proxy fetch failed");
          return response.blob();
        })
        .then(
          (blob) =>
            new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            })
        );

    const convertImageToBase64 = (url) =>
      toDataUrlViaCanvas(url).catch(() => toDataUrlViaProxy(url));

    convertImageToBase64(profileUrl)
      .then((value) => {
        if (isMounted) {
          setProfileBase64(value || null);
        }
      })
      .catch(() => {
        if (isMounted) {
          setProfileBase64(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [profileUrl]);

  return profileBase64;
};