"use client";

import React from "react";
import { parseIfJson } from "@/app/student/(protected)/jobAssessments/reusable_comp/jsonparse";
import {
  asHtmlString,
  normalizeExternalLink,
  useResumeTemplateData,
} from "./resumeTemplateData";

/**
 * Template38 — "Editorial"
 * A newspaper-masthead treatment: a large serif name under a thick
 * double rule, byline-style contact line, then experience/education
 * rendered like editorial copy with small-caps section labels. No
 * color, no photo — text-forward and print-like.
 */

const Template38 = ({ resumeTemplateRef, activeSection, isGeneratingPdf }) => {
  const {
    basicDetails, educationDetails, workExperience, internshipDetails, projectDetails,
    accDetails, certificates, skills, languages, links, volunteerings,
  } = useResumeTemplateData();

  const sectionState = (sectionName) =>
    activeSection === sectionName ? "bg-[#f7f5f0] rounded-md" : "";

  const SectionTitle = ({ children }) => (
    <h2 className="m-0 mb-3 text-[0.78rem] font-bold uppercase tracking-[0.22em] text-[#1c1917] text-center">
      {children}
    </h2>
  );

  const dateRange = (item) =>
    `${item?.start || item?.startDate || ""} – ${item?.end || item?.endDate || "Present"}`;

  const combinedExperience = [...workExperience, ...internshipDetails];

  const bylineParts = [
    basicDetails?.city,
    basicDetails?.phone,
    basicDetails?.email,
    ...links.filter((item) => item?.link).slice(0, 2).map((item) => item.title || item.link),
  ].filter(Boolean);

  return (
    <div
      ref={resumeTemplateRef}
      className={`${isGeneratingPdf ? "w-[50rem] max-w-[50rem]" : "w-full max-w-full"} mx-auto overflow-y-scroll bg-[#fdfcf9] font-['Georgia','Times New Roman',serif] text-[#1c1917] [&::-webkit-scrollbar]:w-[1px] [&::-webkit-scrollbar-thumb]:bg-transparent [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_li]:font-['Inter',sans-serif] [&_li]:text-[0.85rem] [&_li]:leading-6`}
    >
      <div className="max-w-2xl mx-auto px-10 py-9">
        <header id="section-Basic-Details" className={`text-center pb-4 p-3 -m-3 scroll-mt-8 border-t-4 border-b-4 border-double border-[#1c1917] ${sectionState("Basic Details")}`}>
          <h1 className="m-0 pt-3 text-[2.4rem] font-bold tracking-tight">
            {basicDetails?.firstName} {basicDetails?.middleName} {basicDetails?.lastName}
          </h1>
          <p className="m-0 mt-1 text-[0.8rem] font-['Inter',sans-serif] uppercase tracking-[0.15em] text-[#57534e]">
            {bylineParts.join("  ·  ")}
          </p>
        </header>

        <div className="mt-6 space-y-6">
          {basicDetails?.professionalSummary && (
            <section>
              <SectionTitle>Profile</SectionTitle>
              <div
                className="text-[0.9rem] leading-7 font-['Inter',sans-serif] text-[#292524] text-center max-w-xl mx-auto"
                dangerouslySetInnerHTML={{ __html: asHtmlString(basicDetails.professionalSummary) }}
              />
            </section>
          )}

          {combinedExperience.length > 0 && (
            <section id="section-Experience" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Experience")}`}>
              <SectionTitle>Experience</SectionTitle>
              <div className="space-y-4 columns-1 md:columns-2 gap-8 [&>div]:break-inside-avoid">
                {combinedExperience.map((item, index) => (
                  <div key={index} className="mb-4">
                    <div className="flex flex-wrap items-center gap-x-3 font-['Inter',sans-serif]">
                      <h3 className="m-0 text-[0.9rem] font-bold">{item?.role}</h3>
                      <p className="m-0 text-[0.76rem] italic text-[#78716c] whitespace-nowrap">{dateRange(item)}</p>
                    </div>
                    {item?.company && <p className="m-0 text-[0.82rem] italic font-['Inter',sans-serif] text-[#57534e]">{item.company}</p>}
                    {item?.description && (
                      <div className="mt-1 text-[0.82rem] leading-6 font-['Inter',sans-serif]" dangerouslySetInnerHTML={{ __html: asHtmlString(item.description) }} />
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {projectDetails.filter((item) => item?.project).length > 0 && (
            <section id="section-Projects" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Projects")}`}>
              <SectionTitle>Projects</SectionTitle>
              <div className="space-y-3">
                {projectDetails.filter((item) => item?.project).map((item, index) => (
                  <div key={index}>
                    <div className="flex flex-wrap items-center gap-x-3 font-['Inter',sans-serif]">
                      <h3 className="m-0 text-[0.9rem] font-bold">{item.project}{item?.company ? ` — ${item.company}` : ""}</h3>
                      <p className="m-0 text-[0.76rem] italic text-[#78716c] whitespace-nowrap">
                        {item?.startDate} {item?.endDate ? `– ${item.endDate}` : ""}
                      </p>
                    </div>
                    <div className="mt-1 text-[0.82rem] leading-6 font-['Inter',sans-serif]" dangerouslySetInnerHTML={{ __html: parseIfJson(item?.description) }} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {accDetails.filter((a) => a?.accomplishment || a?.description).length > 0 && (
            <section id="section-Accomplishments" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Accomplishments")}`}>
              <SectionTitle>Achievements</SectionTitle>
              <ul className="pl-5 list-disc space-y-1 max-w-xl mx-auto">
                {accDetails.filter((a) => a?.accomplishment || a?.description).map((item, index) => (
                  <li key={index} className="text-[0.85rem]">
                    <span className="font-semibold">{item?.accomplishment}</span>
                    {item?.description ? ` — ${item.description}` : ""}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {educationDetails.length > 0 && (
            <section id="section-Education" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Education")}`}>
              <SectionTitle>Education</SectionTitle>
              <div className="space-y-2 font-['Inter',sans-serif]">
                {educationDetails.map((item, index) => (
                  <div key={index} className="flex flex-wrap items-center gap-x-3">
                    <h3 className="m-0 text-[0.85rem] font-bold">{item?.type}{item?.school ? `, ${item.school}` : ""}</h3>
                    <p className="m-0 text-[0.76rem] italic text-[#78716c] whitespace-nowrap">{item?.startDate} – {item?.endDate}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {volunteerings.filter((item) => item?.organization || item?.volunteering).length > 0 && (
            <section id="section-Volunteering" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Volunteering")}`}>
              <SectionTitle>Volunteering</SectionTitle>
              <div className="space-y-2 font-['Inter',sans-serif]">
                {volunteerings.filter((item) => item?.organization || item?.volunteering).map((item, index) => (
                  <p key={index} className="m-0 text-[0.85rem]"><span className="font-semibold">{item?.volunteering}</span>{item?.organization ? `, ${item.organization}` : ""}</p>
                ))}
              </div>
            </section>
          )}

          {certificates.filter((c) => c?.name || c?.organization).length > 0 && (
            <section id="section-Certifications" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Certifications")}`}>
              <SectionTitle>Certifications</SectionTitle>
              <p className="m-0 text-[0.85rem] font-['Inter',sans-serif] text-center">
                {certificates.filter((c) => c?.name || c?.organization).map((c) => `${c.name}${c.organization ? ` (${c.organization})` : ""}`).join("  ·  ")}
              </p>
            </section>
          )}

          {(skills.filter(Boolean).length > 0 || languages.filter(Boolean).length > 0) && (
            <section id="section-Skills" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Skills")}`}>
              <SectionTitle>Skills &amp; Languages</SectionTitle>
              <div className="font-['Inter',sans-serif] text-center space-y-1">
                {skills.filter(Boolean).length > 0 && <p className="m-0 text-[0.85rem]">{skills.filter(Boolean).join(", ")}</p>}
                {languages.filter(Boolean).length > 0 && (
                  <p id="section-Languages" className="m-0 text-[0.85rem] text-[#57534e] scroll-mt-8">
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

export default Template38;
