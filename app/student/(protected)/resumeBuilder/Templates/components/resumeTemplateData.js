"use client";

import React, { useEffect, useState, createContext, useContext } from "react";
import { useSelector } from "react-redux";
import dayjs from "dayjs";

export const PreviewContext = createContext(false);
export const ResumeEditorContext = createContext(null);

const dummyStudentData = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane.doe@example.com",
  phone: "+1 (555) 123-4567",
  city: "San Francisco, CA",
  profile: "/sample_profile.png",
  professionalSummary: "Results-driven Software Engineer with 4+ years of experience in developing scalable web applications. Adept in React, Node.js, and cloud technologies. Proven ability to deliver high-quality software on time and collaborate effectively in fast-paced environments.",
  educationDetails: [
    { type: "B.Tech in Computer Science", school: "University of Technology", board: "", startDate: "2018", endDate: "2022" }
  ],
  experiences: [
    { type: "work", role: "Senior Frontend Engineer", company: "Tech Innovations Inc.", description: "Led a team of 4 engineers to rebuild the core customer portal. Increased page load speeds by 40% and improved user retention.", startDate: "2022", endDate: "Present" },
    { type: "work", role: "Software Developer", company: "Creative Solutions", description: "Developed responsive web interfaces using React and Redux. Collaborated with designers to implement intuitive UI/UX.", startDate: "2020", endDate: "2022" }
  ],
  projects: [
    { project: "AWS Certified Developer", company: "Amazon Web Services", description: "Professional certification." }
  ],
  accomplishments: [
    { title: "Employee of the Month", description: "Awarded for exceptional performance during the Q3 product launch." }
  ],
  technical: ["JavaScript", "React", "Node.js", "TypeScript", "Tailwind CSS", "GraphQL"],
  languages: ["English", "Spanish"],
  links: [{ title: "LinkedIn", link: "linkedin.com/in/janedoe" }, { title: "GitHub", link: "github.com/janedoe" }]
};

export const normalizeExternalLink = (value) => {
  if (!value) return "";
  return value.startsWith("http") ? value : `https://${value}`;
};

export const stripWrappingQuotes = (text) => {
  if (typeof text !== "string") return text || "";
  let t = text.trim();
  let prev = "";
  while (t !== prev) {
    prev = t;
    try {
      let parsed = JSON.parse(t);
      if (typeof parsed === "string") {
        t = parsed.trim();
      } else {
        break;
      }
    } catch (e) {
      break;
    }
  }
  while (t.length >= 2 && ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'")))) {
    t = t.slice(1, -1);
  }
  return t;
};

export const asHtmlString = (value) => {
  if (!value) return "";
  const cleaned = stripWrappingQuotes(typeof value === "string" ? value : String(value));
  return `<div style="overflow-wrap: break-word; word-wrap: break-word;">${cleaned}</div>`;
};

export const useResumeTemplateData = () => {
  const isPreview = useContext(PreviewContext);
  const editorData = useContext(ResumeEditorContext);
  const reduxData = useSelector((state) => state.student.student?.data) || {};
  
  const formatDate = (dateStr) => {
    if (!dateStr) return dateStr;
    if (typeof dateStr === "string" && (dateStr.toLowerCase() === "present" || dateStr.toLowerCase() === "current")) return dateStr;
    const d = dayjs(dateStr);
    return d.isValid() ? d.format("MMM YYYY") : dateStr;
  };

  const formatDates = (items) => items?.map(item => ({
    ...item,
    startDate: item.startDate ? formatDate(item.startDate) : item.startDate,
    endDate: item.endDate ? formatDate(item.endDate) : item.endDate
  })) || [];

  if (editorData) {
    const isNotEmpty = (item, keys) => keys.some((k) => item[k] && typeof item[k] === "string" && item[k].trim() !== "" && item[k] !== "<p><br></p>" && item[k] !== '"<p><br></p>"');
    
    const filterEducation = (items) => items?.filter(e => isNotEmpty(e, ["school", "board", "type", "description"])) || [];
    const filterExperience = (items) => items?.filter(e => isNotEmpty(e, ["company", "role", "description"])) || [];
    const filterProjects = (items) => items?.filter(e => isNotEmpty(e, ["project", "description"])) || [];
    const filterVolunteerings = (items) => items?.filter(e => isNotEmpty(e, ["organization", "volunteering", "description"])) || [];
    const filterCertificates = (items) => items?.filter(e => isNotEmpty(e, ["name", "organization", "description"])) || [];

    return {
      ...editorData,
      educationDetails: formatDates(filterEducation(editorData.educationDetails)),
      workExperience: formatDates(filterExperience(editorData.workExperience)),
      internshipDetails: formatDates(filterExperience(editorData.internshipDetails)),
      projectDetails: formatDates(filterProjects(editorData.projectDetails)),
      volunteerings: formatDates(filterVolunteerings(editorData.volunteerings)),
      certificates: formatDates(filterCertificates(editorData.certificates)),
      skills: Array.isArray(editorData.skills) ? editorData.skills.map((s) => (typeof s === "object" ? (s?.name + (s?.level ? ` - ${s.level}` : "")) : s)).filter(Boolean) : [],
      languages: Array.isArray(editorData.languages) ? editorData.languages.map((l) => (typeof l === "object" ? (l?.name + (l?.level ? ` - ${l.level}` : "")) : l)).filter(Boolean) : [],
    };
  }

  const studentData = isPreview ? dummyStudentData : reduxData;
  const experienceDetails = formatDates(studentData?.experiences || []);

  return {
    basicDetails: studentData,
    educationDetails: formatDates(studentData?.educationDetails || []),
    workExperience: experienceDetails.filter(
      (item) => item?.type?.toLowerCase() === "work"
    ),
    internshipDetails: experienceDetails.filter(
      (item) => item?.type?.toLowerCase() !== "work"
    ),
    projectDetails: formatDates(studentData?.projects || []),
    accDetails: studentData?.accomplishments || [],
    skills: Array.isArray(studentData?.technical) ? studentData.technical.map(s => typeof s === 'object' ? s.name + (s.level ? ` - ${s.level}` : '') : s).filter(Boolean) : [],
    languages: Array.isArray(studentData?.languages) ? studentData.languages.map(l => typeof l === 'object' ? l.name + (l.level ? ` - ${l.level}` : '') : l).filter(Boolean) : [],
    links: studentData?.links || [],
    volunteerings: formatDates(studentData?.volunteerings || []),
    certificates: formatDates(studentData?.certificates || []),
  };
};

export const useProfileImage = (profileUrl) => {
  const [profileBase64, setProfileBase64] = useState(null);

  useEffect(() => {
    if (!profileUrl) {
      setProfileBase64(null);
      return;
    }

    if (profileUrl.startsWith("data:")) {
      setProfileBase64(profileUrl);
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

  return profileUrl?.startsWith?.("data:") ? profileUrl : profileBase64;
};
export const dateRange = (item) =>
    item?.startDate && item?.endDate
      ? `${item.startDate} - ${item.endDate}`
      : item?.startDate || item?.endDate || "";
