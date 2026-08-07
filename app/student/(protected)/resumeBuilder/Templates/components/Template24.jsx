"use client";

import React from "react";
import { parseIfJson } from "@/app/student/(protected)/jobAssessments/reusable_comp/jsonparse";
import {
  asHtmlString,
  normalizeExternalLink,
  useResumeTemplateData,
} from "./resumeTemplateData";

/**
 * Template24 — "Executive Classic"
 * The conservative single-column format used across consulting, finance,
 * and law resumes: black text on white, a centered name with a thin rule,
 * small-caps section labels, right-aligned dates, no color, no icons, no
 * sidebar. Deliberately plain so it reads cleanly both on screen, in
 * print, and through an ATS parser.
 */

const Template24 = ({ resumeTemplateRef, activeSection, isGeneratingPdf }) => {
  const {
    basicDetails,
    educationDetails,
    workExperience,
    internshipDetails,
    projectDetails,
    accDetails,
    certificates,
    skills,
    languages,
    links,
    volunteerings,
  } = useResumeTemplateData();

  const sectionState = (sectionName) =>
    activeSection === sectionName ? "bg-[#f4f4f4] rounded-md" : "";

  const SectionTitle = ({ children }) => (
    <h2 className="m-0 mb-2.5 text-[0.8rem] font-bold uppercase tracking-[0.14em] text-black border-b border-black pb-1">
      {children}
    </h2>
  );

  const dateRange = (item) =>
    `${item?.start || item?.startDate || ""} – ${item?.end || item?.endDate || "Present"}`;

  const combinedExperience = [...workExperience, ...internshipDetails];

  const contactLine = [
    basicDetails?.city,
    basicDetails?.phone,
    basicDetails?.email,
    ...links.filter((item) => item?.link).slice(0, 2).map((item) => item.title || item.link),
  ].filter(Boolean);

  return (
    <div
      ref={resumeTemplateRef}
      className={`${isGeneratingPdf ? "w-[50rem] max-w-[50rem]" : "w-full max-w-full"} mx-auto overflow-y-scroll bg-white font-['Georgia','Times New Roman',serif] text-black [&::-webkit-scrollbar]:w-[1px] [&::-webkit-scrollbar-thumb]:bg-transparent [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_li]:font-['Inter',sans-serif] [&_li]:text-[0.85rem] [&_li]:leading-6`}
    >
      <div className="max-w-2xl mx-auto px-10 py-10">
        <header
          id="section-Basic-Details"
          className={`text-center pb-4 mb-5 p-3 -m-3 scroll-mt-8 border-b-2 border-black ${sectionState("Basic Details")}`}
        >
          <h1 className="m-0 text-[1.7rem] font-bold uppercase tracking-[0.06em]">
            {basicDetails?.firstName} {basicDetails?.middleName} {basicDetails?.lastName}
          </h1>
          <p className="mt-2 mb-0 text-[0.82rem] font-['Inter',sans-serif] text-[#333333]">
            {contactLine.join("  |  ")}
          </p>
        </header>

        <div className="space-y-5">
          {basicDetails?.professionalSummary && (
            <section>
              <SectionTitle>Professional Summary</SectionTitle>
              <div
                className="text-[0.85rem] leading-6 font-['Inter',sans-serif] text-[#1a1a1a]"
                dangerouslySetInnerHTML={{ __html: asHtmlString(basicDetails.professionalSummary) }}
              />
            </section>
          )}

          {combinedExperience.length > 0 && (
            <section id="section-Experience" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Experience")}`}>
              <SectionTitle>Professional Experience</SectionTitle>
              <div className="space-y-3.5">
                {combinedExperience.map((item, index) => (
                  <div key={index}>
                    <div className="flex flex-wrap items-center gap-x-4">
                      <h3 className="flex-1 min-w-0 m-0 text-[0.92rem] font-bold font-['Inter',sans-serif]">
                        {item?.company}
                        {item?.role ? <span className="font-normal italic"> — {item.role}</span> : ""}
                      </h3>
                      <span className="text-[0.78rem] font-['Inter',sans-serif] whitespace-nowrap text-[#333333]">
                        {dateRange(item)}
                      </span>
                    </div>
                    {item?.description && (
                      <div
                        className="mt-1 text-[0.83rem] leading-6 font-['Inter',sans-serif] text-[#1a1a1a]"
                        dangerouslySetInnerHTML={{ __html: asHtmlString(item.description) }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {educationDetails.length > 0 && (
            <section id="section-Education" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Education")}`}>
              <SectionTitle>Education</SectionTitle>
              <div className="space-y-2">
                {educationDetails.map((item, index) => (
                  <div key={index} className="flex flex-wrap items-center gap-x-4">
                    <h3 className="flex-1 min-w-0 m-0 text-[0.88rem] font-bold font-['Inter',sans-serif]">
                      {item?.school || item?.board}
                      {item?.type ? <span className="font-normal italic"> — {item.type}</span> : ""}
                      {item?.grade ? `, ${item.grade}${item?.gradeType === "percentage" ? "%" : item?.gradeType ? "/10" : ""}` : ""}
                    </h3>
                    <span className="text-[0.78rem] font-['Inter',sans-serif] whitespace-nowrap text-[#333333]">
                      {item?.startDate} – {item?.endDate}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {projectDetails.filter((p) => p?.project).length > 0 && (
            <section id="section-Projects" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Projects")}`}>
              <SectionTitle>Projects</SectionTitle>
              <div className="space-y-3">
                {projectDetails.filter((p) => p?.project).map((item, index) => (
                  <div key={index}>
                    <div className="flex flex-wrap items-center gap-x-4">
                      <h3 className="flex-1 min-w-0 m-0 text-[0.88rem] font-bold font-['Inter',sans-serif]">
                        {item.project}{item?.company ? <span className="font-normal italic"> — {item.company}</span> : ""}
                      </h3>
                      <span className="text-[0.78rem] font-['Inter',sans-serif] whitespace-nowrap text-[#333333]">
                        {item?.startDate} {item?.endDate ? `– ${item.endDate}` : ""}
                      </span>
                    </div>
                    <div
                      className="mt-1 text-[0.83rem] leading-6 font-['Inter',sans-serif] text-[#1a1a1a]"
                      dangerouslySetInnerHTML={{ __html: parseIfJson(item?.description) }}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {accDetails.filter((a) => a?.accomplishment || a?.description).length > 0 && (
            <section id="section-Accomplishments" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Accomplishments")}`}>
              <SectionTitle>Achievements</SectionTitle>
              <ul className="pl-5 list-disc space-y-1 font-['Inter',sans-serif]">
                {accDetails.filter((a) => a?.accomplishment || a?.description).map((item, index) => (
                  <li key={index} className="text-[0.85rem] leading-6 text-[#1a1a1a]">
                    <span className="font-semibold">{item?.accomplishment}</span>
                    {item?.description ? ` — ${item.description}` : ""}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {certificates.filter((c) => c?.name || c?.organization).length > 0 && (
            <section id="section-Certifications" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Certifications")}`}>
              <SectionTitle>Certifications</SectionTitle>
              <div className="space-y-1.5 font-['Inter',sans-serif]">
                {certificates.filter((c) => c?.name || c?.organization).map((item, index) => (
                  <p key={index} className="m-0 text-[0.83rem] text-[#1a1a1a]">
                    <span className="font-semibold">{item?.name}</span>
                    {item?.organization ? ` — ${item.organization}` : ""}
                  </p>
                ))}
              </div>
            </section>
          )}

          {volunteerings.filter((item) => item?.organization || item?.volunteering).length > 0 && (
            <section id="section-Volunteering" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Volunteering")}`}>
              <SectionTitle>Volunteering</SectionTitle>
              <div className="space-y-2 font-['Inter',sans-serif]">
                {volunteerings.filter((item) => item?.organization || item?.volunteering).map((item, index) => (
                  <p key={index} className="m-0 text-[0.83rem] text-[#1a1a1a]">
                    <span className="font-semibold">{item?.volunteering}</span>
                    {item?.organization ? ` — ${item.organization}` : ""}
                  </p>
                ))}
              </div>
            </section>
          )}

          {(skills.filter(Boolean).length > 0 || languages.filter(Boolean).length > 0) && (
            <section id="section-Skills" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Skills")}`}>
              <SectionTitle>Skills &amp; Languages</SectionTitle>
              <div className="space-y-1 font-['Inter',sans-serif]">
                {skills.filter(Boolean).length > 0 && (
                  <p className="m-0 text-[0.85rem] leading-6 text-[#1a1a1a]">
                    <span className="font-semibold">Skills: </span>
                    {skills.filter(Boolean).join(", ")}
                  </p>
                )}
                {languages.filter(Boolean).length > 0 && (
                  <p id="section-Languages" className="m-0 text-[0.85rem] leading-6 text-[#1a1a1a] scroll-mt-8">
                    <span className="font-semibold">Languages: </span>
                    {languages.filter(Boolean).map((l) => (typeof l === "object" && l !== null ? l.name : l)).join(", ")}
                  </p>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default Template24;
