"use client";

import React from "react";
import {
  PhoneFilled,
  MailOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { parseIfJson } from "@/app/student/(protected)/jobAssessments/reusable_comp/jsonparse";
import {
  asHtmlString,
  normalizeExternalLink,
  useResumeTemplateData,
} from "./resumeTemplateData";

/**
 * Template22 — "Minimal Ivory"
 * Single-column, ATS-friendly layout: no photo, no colour blocks, just a
 * centered name/contact header, thin rule dividers between sections, and
 * plain serif typography. Aimed at recruiters/parsers that prefer a
 * strictly linear, print-safe document over a designed two-column resume.
 */

const Template22 = ({ resumeTemplateRef, activeSection, isGeneratingPdf }) => {
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
    activeSection === sectionName ? "bg-[#f4f1ea] rounded-md" : "";

  const SectionTitle = ({ children }) => (
    <h2 className="m-0 mb-3 text-[0.82rem] font-bold uppercase tracking-[0.18em] text-[#1f1b16] border-b border-[#d8d0c2] pb-1.5">
      {children}
    </h2>
  );

  const dateRange = (item) =>
    `${item?.start || item?.startDate || ""} – ${item?.end || item?.endDate || "Present"}`;

  const combinedExperience = [...workExperience, ...internshipDetails];

  return (
    <div
      ref={resumeTemplateRef}
      className={`${isGeneratingPdf ? "w-[50rem] max-w-[50rem]" : "w-full max-w-full"} mx-auto overflow-y-scroll bg-[#fffdf9] font-serif text-[#2a2620] p-10 [&::-webkit-scrollbar]:w-[1px] [&::-webkit-scrollbar-thumb]:bg-transparent [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_li]:text-[0.85rem] [&_li]:leading-6`}
    >
      {/* Header */}
      <div id="section-Basic-Details" className={`p-2 -m-2 scroll-mt-8 text-center border-b-2 border-[#1f1b16] pb-5 mb-6 ${sectionState("Basic Details")}`}>
        <h1 className="m-0 text-[2rem] font-bold tracking-[0.04em] text-[#1f1b16]">
          {basicDetails?.firstName} {basicDetails?.middleName} {basicDetails?.lastName}
        </h1>
        {workExperience?.[0]?.role && (
          <p className="mt-1 mb-0 text-[0.9rem] italic text-[#5c5647]">{workExperience[0].role}</p>
        )}
        <div className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-[0.78rem] text-[#5c5647]">
          {basicDetails?.email && (
            <a href={`mailto:${basicDetails.email}`} className="flex items-center gap-1.5 no-underline text-[#5c5647]">
              <MailOutlined /> <span>{basicDetails.email}</span>
            </a>
          )}
          {basicDetails?.phone && (
            <a href={`tel:${basicDetails.phone}`} className="flex items-center gap-1.5 no-underline text-[#5c5647]">
              <PhoneFilled /> <span>{basicDetails.phone}</span>
            </a>
          )}
          {basicDetails?.city && (
            <span className="flex items-center gap-1.5">
              <EnvironmentOutlined /> <span>{basicDetails.city}</span>
            </span>
          )}
          {links.filter((item) => item?.link).slice(0, 3).map((item, index) => (
            <a
              key={index}
              href={normalizeExternalLink(item.link)}
              target="_blank"
              rel="noopener noreferrer"
              className="no-underline text-[#5c5647]"
            >
              {item.title || item.link}
            </a>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {basicDetails?.professionalSummary && (
          <section>
            <SectionTitle>Summary</SectionTitle>
            <div
              className="text-[0.85rem] leading-6 text-[#3a3527]"
              dangerouslySetInnerHTML={{ __html: asHtmlString(basicDetails.professionalSummary) }}
            />
          </section>
        )}

        {skills.filter(Boolean).length > 0 && (
          <section id="section-Skills" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Skills")}`}>
            <SectionTitle>Skills</SectionTitle>
            <p className="m-0 text-[0.85rem] leading-6 text-[#3a3527]">
              {skills.filter(Boolean).join("  •  ")}
            </p>
          </section>
        )}

        {combinedExperience.length > 0 && (
          <section id="section-Experience" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Experience")}`}>
            <SectionTitle>Experience</SectionTitle>
            <div className="space-y-4">
              {combinedExperience.map((item, index) => (
                <div key={index}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <h3 className="m-0 text-[0.95rem] font-bold text-[#1f1b16]">
                      {item?.role}{item?.company ? `, ${item.company}` : ""}
                    </h3>
                    <span className="text-[0.78rem] italic text-[#5c5647] whitespace-nowrap">{dateRange(item)}</span>
                  </div>
                  {item?.description && (
                    <div
                      className="mt-1 text-[0.83rem] leading-6 text-[#3a3527]"
                      dangerouslySetInnerHTML={{ __html: asHtmlString(item.description) }}
                    />
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {internshipDetails.length > 0 && workExperience.length === 0 && (
          <section id="section-Internships" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Internships")}`} />
        )}

        {projectDetails.filter((item) => item?.project).length > 0 && (
          <section id="section-Projects" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Projects")}`}>
            <SectionTitle>Projects</SectionTitle>
            <div className="space-y-4">
              {projectDetails.filter((item) => item?.project).map((item, index) => (
                <div key={index}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <h3 className="m-0 text-[0.95rem] font-bold text-[#1f1b16]">
                      {item.project}{item?.company ? ` — ${item.company}` : ""}
                    </h3>
                    <span className="text-[0.78rem] italic text-[#5c5647] whitespace-nowrap">
                      {item?.startDate} {item?.endDate ? `– ${item.endDate}` : ""}
                    </span>
                  </div>
                  {item?.description && (
                    <div
                      className="mt-1 text-[0.83rem] leading-6 text-[#3a3527]"
                      dangerouslySetInnerHTML={{ __html: parseIfJson(item.description) }}
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
                <div key={index} className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <h3 className="m-0 text-[0.9rem] font-bold text-[#1f1b16]">
                    {item?.type}{item?.school ? `, ${item.school}` : ""}
                    {item?.grade ? ` — ${item.grade}${item?.gradeType === "percentage" ? "%" : item?.gradeType ? "/10" : ""}` : ""}
                  </h3>
                  <span className="text-[0.78rem] italic text-[#5c5647] whitespace-nowrap">
                    {item?.startDate} – {item?.endDate}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {accDetails.filter((a) => a?.accomplishment || a?.description).length > 0 && (
          <section id="section-Accomplishments" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Accomplishments")}`}>
            <SectionTitle>Achievements</SectionTitle>
            <ul className="pl-4 space-y-1">
              {accDetails.filter((a) => a?.accomplishment || a?.description).map((item, index) => (
                <li key={index} className="text-[0.83rem] leading-6 text-[#3a3527]">
                  <span className="font-bold text-[#1f1b16]">{item?.accomplishment}</span>
                  {item?.description ? ` — ${item.description}` : ""}
                </li>
              ))}
            </ul>
          </section>
        )}

        {certificates.filter((c) => c?.name || c?.organization).length > 0 && (
          <section id="section-Certifications" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Certifications")}`}>
            <SectionTitle>Certifications</SectionTitle>
            <div className="space-y-1.5">
              {certificates.filter((c) => c?.name || c?.organization).map((item, index) => (
                <p key={index} className="m-0 text-[0.83rem] text-[#3a3527]">
                  <span className="font-bold text-[#1f1b16]">{item?.name}</span>
                  {item?.organization ? ` — ${item.organization}` : ""}
                </p>
              ))}
            </div>
          </section>
        )}

        {volunteerings.filter((item) => item?.organization || item?.volunteering).length > 0 && (
          <section id="section-Volunteering" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Volunteering")}`}>
            <SectionTitle>Volunteering</SectionTitle>
            <div className="space-y-2">
              {volunteerings.filter((item) => item?.organization || item?.volunteering).map((item, index) => (
                <p key={index} className="m-0 text-[0.83rem] text-[#3a3527]">
                  <span className="font-bold text-[#1f1b16]">{item?.volunteering}</span>
                  {item?.organization ? ` — ${item.organization}` : ""}
                </p>
              ))}
            </div>
          </section>
        )}

        {languages.filter(Boolean).length > 0 && (
          <section id="section-Languages" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Languages")}`}>
            <SectionTitle>Languages</SectionTitle>
            <p className="m-0 text-[0.85rem] leading-6 text-[#3a3527]">
              {languages
                .filter(Boolean)
                .map((l) => (typeof l === "object" && l !== null ? l.name : l))
                .join("  •  ")}
            </p>
          </section>
        )}
      </div>
    </div>
  );
};

export default Template22;
