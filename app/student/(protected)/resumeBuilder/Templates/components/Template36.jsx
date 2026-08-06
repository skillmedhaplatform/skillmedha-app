"use client";

import React from "react";
import { parseIfJson } from "@/app/student/(protected)/jobAssessments/reusable_comp/jsonparse";
import {
  asHtmlString,
  normalizeExternalLink,
  useResumeTemplateData,
} from "./resumeTemplateData";

/**
 * Template36 — "Dense Professional"
 * Compact typography and tight line-height built for candidates with a
 * long career history who need to fit more onto one page — smaller type
 * scale, minimal vertical rhythm, no photo or color blocks, just dense
 * well-organized single-column content.
 */

const ACCENT = "#1e3a5f";

const Template36 = ({ resumeTemplateRef, activeSection, isGeneratingPdf }) => {
  const {
    basicDetails, educationDetails, workExperience, internshipDetails, projectDetails,
    accDetails, certificates, skills, languages, links, volunteerings,
  } = useResumeTemplateData();

  const sectionState = (sectionName) =>
    activeSection === sectionName ? "bg-[#eff4fa] rounded" : "";

  const SectionTitle = ({ children }) => (
    <h2 className="m-0 mb-1.5 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[#1e3a5f] border-b border-[#cbd5e1] pb-1">
      {children}
    </h2>
  );

  const dateRange = (item) =>
    `${item?.start || item?.startDate || ""} – ${item?.end || item?.endDate || "Present"}`;

  const combinedExperience = [...workExperience, ...internshipDetails];

  const contactLine = [
    basicDetails?.phone,
    basicDetails?.email,
    basicDetails?.city,
    ...links.filter((item) => item?.link).slice(0, 2).map((item) => item.title || item.link),
  ].filter(Boolean);

  return (
    <div
      ref={resumeTemplateRef}
      className={`${isGeneratingPdf ? "w-[50rem] max-w-[50rem]" : "w-full max-w-full"} mx-auto overflow-y-scroll bg-white font-['Inter',Arial,sans-serif] text-[#1f2937] [&::-webkit-scrollbar]:w-[1px] [&::-webkit-scrollbar-thumb]:bg-transparent [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-0.5 [&_li]:text-[0.76rem] [&_li]:leading-[1.35]`}
    >
      <div className="px-9 py-7 space-y-3">
        <header id="section-Basic-Details" className={`p-2 -m-2 scroll-mt-8 ${sectionState("Basic Details")}`}>
          <h1 className="m-0 text-[1.35rem] font-bold text-[#111827] leading-tight">
            {basicDetails?.firstName} {basicDetails?.middleName} {basicDetails?.lastName}
          </h1>
          <p className="m-0 mt-0.5 text-[0.76rem] text-[#4b5563]">{contactLine.join("  |  ")}</p>
        </header>

        {basicDetails?.professionalSummary && (
          <section>
            <SectionTitle>Summary</SectionTitle>
            <div className="text-[0.78rem] leading-[1.4] text-[#1f2937]" dangerouslySetInnerHTML={{ __html: asHtmlString(basicDetails.professionalSummary) }} />
          </section>
        )}

        {combinedExperience.length > 0 && (
          <section id="section-Experience" className={`p-2 -m-2 scroll-mt-8 ${sectionState("Experience")}`}>
            <SectionTitle>Experience</SectionTitle>
            <div className="space-y-2">
              {combinedExperience.map((item, index) => (
                <div key={index}>
                  <div className="flex flex-wrap items-center gap-x-3">
                    <h3 className="m-0 text-[0.82rem] font-bold text-[#111827]">
                      {item?.role}{item?.company ? <span className="font-normal text-[#4b5563]"> · {item.company}</span> : ""}
                    </h3>
                    <p className="m-0 text-[0.74rem] text-[#6b7280] whitespace-nowrap">{dateRange(item)}</p>
                  </div>
                  {item?.description && (
                    <div className="text-[0.76rem] leading-[1.35] text-[#1f2937]" dangerouslySetInnerHTML={{ __html: asHtmlString(item.description) }} />
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {projectDetails.filter((item) => item?.project).length > 0 && (
          <section id="section-Projects" className={`p-2 -m-2 scroll-mt-8 ${sectionState("Projects")}`}>
            <SectionTitle>Projects</SectionTitle>
            <div className="space-y-2">
              {projectDetails.filter((item) => item?.project).map((item, index) => (
                <div key={index}>
                  <div className="flex flex-wrap items-center gap-x-3">
                    <h3 className="m-0 text-[0.82rem] font-bold text-[#111827]">
                      {item.project}{item?.company ? <span className="font-normal text-[#4b5563]"> — {item.company}</span> : ""}
                    </h3>
                    <p className="m-0 text-[0.74rem] text-[#6b7280] whitespace-nowrap">
                      {item?.startDate} {item?.endDate ? `– ${item.endDate}` : ""}
                    </p>
                  </div>
                  <div className="text-[0.76rem] leading-[1.35] text-[#1f2937]" dangerouslySetInnerHTML={{ __html: parseIfJson(item?.description) }} />
                </div>
              ))}
            </div>
          </section>
        )}

        {accDetails.filter((a) => a?.accomplishment || a?.description).length > 0 && (
          <section id="section-Accomplishments" className={`p-2 -m-2 scroll-mt-8 ${sectionState("Accomplishments")}`}>
            <SectionTitle>Achievements</SectionTitle>
            <ul className="pl-4 list-disc space-y-0.5">
              {accDetails.filter((a) => a?.accomplishment || a?.description).map((item, index) => (
                <li key={index} className="text-[0.76rem] leading-[1.35] text-[#1f2937]">
                  <span className="font-semibold text-[#111827]">{item?.accomplishment}</span>
                  {item?.description ? ` — ${item.description}` : ""}
                </li>
              ))}
            </ul>
          </section>
        )}

        {educationDetails.length > 0 && (
          <section id="section-Education" className={`p-2 -m-2 scroll-mt-8 ${sectionState("Education")}`}>
            <SectionTitle>Education</SectionTitle>
            <div className="space-y-1">
              {educationDetails.map((item, index) => (
                <div key={index} className="flex flex-wrap items-center gap-x-3">
                  <h3 className="m-0 text-[0.8rem] font-bold text-[#111827]">
                    {item?.type}{item?.school ? `, ${item.school}` : ""}
                  </h3>
                  <p className="m-0 text-[0.74rem] text-[#6b7280] whitespace-nowrap">{item?.startDate} – {item?.endDate}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {volunteerings.filter((item) => item?.organization || item?.volunteering).length > 0 && (
          <section id="section-Volunteering" className={`p-2 -m-2 scroll-mt-8 ${sectionState("Volunteering")}`}>
            <SectionTitle>Volunteering</SectionTitle>
            <div className="space-y-1">
              {volunteerings.filter((item) => item?.organization || item?.volunteering).map((item, index) => (
                <p key={index} className="m-0 text-[0.78rem] text-[#1f2937]">
                  <span className="font-semibold text-[#111827]">{item?.volunteering}</span>
                  {item?.organization ? `, ${item.organization}` : ""}
                </p>
              ))}
            </div>
          </section>
        )}

        {certificates.filter((c) => c?.name || c?.organization).length > 0 && (
          <section id="section-Certifications" className={`p-2 -m-2 scroll-mt-8 ${sectionState("Certifications")}`}>
            <SectionTitle>Certifications</SectionTitle>
            <p className="m-0 text-[0.78rem] leading-[1.4] text-[#1f2937]">
              {certificates.filter((c) => c?.name || c?.organization).map((c) => `${c.name}${c.organization ? ` (${c.organization})` : ""}`).join("  ·  ")}
            </p>
          </section>
        )}

        {(skills.filter(Boolean).length > 0 || languages.filter(Boolean).length > 0) && (
          <section id="section-Skills" className={`p-2 -m-2 scroll-mt-8 ${sectionState("Skills")}`}>
            <SectionTitle>Skills &amp; Languages</SectionTitle>
            {skills.filter(Boolean).length > 0 && (
              <p className="m-0 text-[0.78rem] leading-[1.4] text-[#1f2937]"><span className="font-semibold">Skills: </span>{skills.filter(Boolean).join(", ")}</p>
            )}
            {languages.filter(Boolean).length > 0 && (
              <p id="section-Languages" className="m-0 text-[0.78rem] leading-[1.4] text-[#1f2937] scroll-mt-8">
                <span className="font-semibold">Languages: </span>
                {languages.filter(Boolean).map((l) => (typeof l === "object" && l !== null ? l.name : l)).join(", ")}
              </p>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default Template36;
