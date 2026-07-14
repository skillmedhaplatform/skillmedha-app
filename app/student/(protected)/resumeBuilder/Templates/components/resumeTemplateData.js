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

    const convertImageToBase64 = (url) =>
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

        img.onerror = () => {
          fetch(url)
            .then((response) => response.blob())
            .then(
              (blob) =>
                new Promise((resolveBlob, rejectBlob) => {
                  const reader = new FileReader();
                  reader.onloadend = () => resolveBlob(reader.result);
                  reader.onerror = rejectBlob;
                  reader.readAsDataURL(blob);
                })
            )
            .then(resolve)
            .catch(reject);
        };

        img.src = `${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`;
      });

    convertImageToBase64(profileUrl)
      .then((value) => {
        if (isMounted) {
          setProfileBase64(value || profileUrl);
        }
      })
      .catch(() => {
        if (isMounted) {
          setProfileBase64(profileUrl);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [profileUrl]);

  return profileBase64;
};