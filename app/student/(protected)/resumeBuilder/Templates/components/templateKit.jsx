"use client";

import React from "react";
import { parseIfJson } from "@/app/student/(protected)/jobAssessments/reusable_comp/jsonparse";
import { asHtmlString, useProfileImage, useResumeTemplateData } from "./resumeTemplateData";

// Shared building blocks for templates 41–50: the data every template needs,
// cleaned up once, plus small helpers for rich text and the editor's
// "active section" highlight. Each template supplies its own layout/styling.

export const fullNameOf = (b) => [b?.firstName, b?.middleName, b?.lastName].filter(Boolean).join(" ");

export const initialsOf = (b) =>
  [b?.firstName, b?.lastName]
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

export const period = (item) => {
  const start = item?.start || item?.startDate || "";
  const end = item?.end || item?.endDate || "";
  if (start && end) return `${start} – ${end}`;
  return start || end || "";
};

const labelOf = (value) => (typeof value === "object" && value !== null ? value.name : value);

/**
 * Everything a template renders, with empty entries removed.
 * `highlight(name)` returns classes for the section the student is editing.
 */
export const useTemplateKit = (activeSection, highlightClass = "bg-slate-100/70 rounded-md") => {
  const data = useResumeTemplateData();
  const { basicDetails } = data;
  const photo = useProfileImage(basicDetails?.profile);

  const experience = (data.workExperience || []).filter((e) => e?.role || e?.company);
  const internships = (data.internshipDetails || []).filter((e) => e?.role || e?.company);
  const projects = (data.projectDetails || []).filter((p) => p?.project);
  const achievements = (data.accDetails || [])
    .map((a) => ({ title: a?.accomplishment || a?.title || "", description: a?.description || "", by: a?.company || "" }))
    .filter((a) => a.title || a.description);
  const certificates = (data.certificates || []).filter((c) => c?.name || c?.organization);
  const volunteering = (data.volunteerings || []).filter((v) => v?.organization || v?.volunteering);
  const skills = (data.skills || []).map(labelOf).filter(Boolean);
  const languages = (data.languages || []).map(labelOf).filter(Boolean);
  const links = (data.links || []).filter((l) => l?.link);

  return {
    ...data,
    basic: basicDetails || {},
    name: fullNameOf(basicDetails),
    initials: initialsOf(basicDetails),
    // There is no separate headline field, so the latest role doubles as one.
    title: basicDetails?.designation || experience[0]?.role || internships[0]?.role || "",
    photo,
    experience,
    internships,
    allExperience: [...experience, ...internships],
    projects,
    achievements,
    certificates,
    volunteering,
    skills,
    languages,
    links,
    education: data.educationDetails || [],
    contact: [basicDetails?.email, basicDetails?.phone, basicDetails?.city].filter(Boolean),
    highlight: (section) => (activeSection === section ? highlightClass : ""),
  };
};

/** Saved rich text (HTML / JSON-wrapped strings) rendered safely sized. */
export const Rich = ({ html, className = "" }) =>
  html ? <div className={className} dangerouslySetInnerHTML={{ __html: asHtmlString(parseIfJson(html)) }} /> : null;

/** Outer wrapper every template uses so PDF export gets a fixed page width. */
export const Page = ({ resumeTemplateRef, isGeneratingPdf, className = "", children }) => (
  <div
    ref={resumeTemplateRef}
    className={`${isGeneratingPdf ? "w-[50rem] max-w-[50rem]" : "w-full max-w-full"} mx-auto overflow-y-scroll [&::-webkit-scrollbar]:w-[1px] [&::-webkit-scrollbar-thumb]:bg-transparent [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-0.5 [&_ol]:list-decimal [&_ol]:pl-5 ${className}`}
  >
    {children}
  </div>
);

/** Profile photo, or the student's initials when there is none. */
export const Avatar = ({ photo, initials, className = "", fallbackClassName = "" }) =>
  photo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={photo} alt="profile" className={`object-cover ${className}`} />
  ) : (
    <span className={`flex items-center justify-center font-bold ${className} ${fallbackClassName}`}>{initials || "?"}</span>
  );
