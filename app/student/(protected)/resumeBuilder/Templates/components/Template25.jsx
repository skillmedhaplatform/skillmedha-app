"use client";

import React from "react";
import { parseIfJson } from "@/app/student/(protected)/jobAssessments/reusable_comp/jsonparse";
import {
  asHtmlString,
  normalizeExternalLink,
  useResumeTemplateData,
} from "./resumeTemplateData";

/**
 * Template25 — "Corporate Grey"
 * A conservative two-column CV format: a light grey left column for
 * contact, education, skills and languages; a white right column for
 * summary, experience and projects. Grayscale and black only — no accent
 * color, no photo, no icons — matching the traditional printed CV format
 * still common in banking, law, and government resumes. Sans-serif
 * throughout so it reads as slightly more modern than Template24's serif
 * "Executive Classic".
 */

const Template25 = ({ resumeTemplateRef, activeSection, isGeneratingPdf }) => {
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
    activeSection === sectionName ? "bg-[#e9e9e9] rounded-md" : "";

  const SideTitle = ({ children }) => (
    <h2 className="m-0 mb-2 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[#1a1a1a] border-b border-[#b3b3b3] pb-1.5">
      {children}
    </h2>
  );

  const MainTitle = ({ children }) => (
    <h2 className="m-0 mb-3 text-[0.85rem] font-bold uppercase tracking-[0.1em] text-black border-b-2 border-black pb-1.5">
      {children}
    </h2>
  );

  const dateRange = (item) =>
    `${item?.start || item?.startDate || ""} – ${item?.end || item?.endDate || "Present"}`;

  const combinedExperience = [...workExperience, ...internshipDetails];

  return (
    <div
      ref={resumeTemplateRef}
      className={`${isGeneratingPdf ? "w-[50rem] max-w-[50rem]" : "w-full max-w-full"} mx-auto overflow-y-scroll bg-white font-['Inter',Arial,sans-serif] text-[#1a1a1a] grid grid-cols-1 md:grid-cols-[15.5rem_1fr] [&::-webkit-scrollbar]:w-[1px] [&::-webkit-scrollbar-thumb]:bg-transparent [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_li]:text-[0.85rem] [&_li]:leading-6`}
    >
      {/* Left column */}
      <div className="bg-[#f2f2f2] p-6 flex flex-col gap-6 border-r border-[#d9d9d9]">
        <div id="section-Basic-Details" className={`p-2 -m-2 scroll-mt-8 ${sectionState("Basic Details")}`}>
          <h1 className="m-0 text-[1.35rem] font-bold text-black leading-tight">
            {basicDetails?.firstName} {basicDetails?.middleName} {basicDetails?.lastName}
          </h1>
          {workExperience?.[0]?.role && (
            <p className="m-0 mt-1 text-[0.8rem] font-medium text-[#4d4d4d]">{workExperience[0].role}</p>
          )}
        </div>

        <div>
          <SideTitle>Contact</SideTitle>
          <div className="flex flex-col gap-1.5 text-[0.8rem] text-[#333333]">
            {basicDetails?.phone && (
              <a href={`tel:${basicDetails.phone}`} className="no-underline text-[#333333]">{basicDetails.phone}</a>
            )}
            {basicDetails?.email && (
              <a href={`mailto:${basicDetails.email}`} className="no-underline text-[#333333] break-all">{basicDetails.email}</a>
            )}
            {basicDetails?.city && <span>{basicDetails.city}</span>}
            {links.filter((item) => item?.link).slice(0, 2).map((item, index) => (
              <a
                key={index}
                href={normalizeExternalLink(item.link)}
                target="_blank"
                rel="noopener noreferrer"
                className="no-underline text-[#333333] break-all"
              >
                {item.title || item.link}
              </a>
            ))}
          </div>
        </div>

        {educationDetails.length > 0 && (
          <div id="section-Education" className={`p-2 -m-2 scroll-mt-8 ${sectionState("Education")}`}>
            <SideTitle>Education</SideTitle>
            <div className="flex flex-col gap-2.5">
              {educationDetails.map((item, index) => (
                <div key={index}>
                  <p className="m-0 text-[0.8rem] font-semibold text-black">{item?.type}</p>
                  <p className="m-0 text-[0.76rem] text-[#4d4d4d]">{item?.school || item?.board}</p>
                  <p className="m-0 text-[0.72rem] text-[#666666]">{item?.startDate} – {item?.endDate}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {skills.filter(Boolean).length > 0 && (
          <div id="section-Skills" className={`p-2 -m-2 scroll-mt-8 ${sectionState("Skills")}`}>
            <SideTitle>Skills</SideTitle>
            <ul className="pl-4 space-y-1 text-[#333333] marker:text-[#999999]">
              {skills.filter(Boolean).map((skill, index) => (
                <li key={index} className="text-[0.78rem]">{skill}</li>
              ))}
            </ul>
          </div>
        )}

        {languages.filter(Boolean).length > 0 && (
          <div id="section-Languages" className={`p-2 -m-2 scroll-mt-8 ${sectionState("Languages")}`}>
            <SideTitle>Languages</SideTitle>
            <p className="m-0 text-[0.78rem] text-[#333333] leading-6">
              {languages.filter(Boolean).map((l) => (typeof l === "object" && l !== null ? l.name : l)).join(", ")}
            </p>
          </div>
        )}

        {certificates.filter((c) => c?.name || c?.organization).length > 0 && (
          <div id="section-Certifications" className={`p-2 -m-2 scroll-mt-8 ${sectionState("Certifications")}`}>
            <SideTitle>Certifications</SideTitle>
            <div className="flex flex-col gap-2">
              {certificates.filter((c) => c?.name || c?.organization).map((item, index) => (
                <div key={index}>
                  <p className="m-0 text-[0.78rem] font-semibold text-black">{item?.name}</p>
                  <p className="m-0 text-[0.72rem] text-[#666666]">{item?.organization}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right column */}
      <div className="p-8 space-y-6">
        {basicDetails?.professionalSummary && (
          <section>
            <MainTitle>Profile</MainTitle>
            <div
              className="text-[0.85rem] leading-6 text-[#1a1a1a]"
              dangerouslySetInnerHTML={{ __html: asHtmlString(basicDetails.professionalSummary) }}
            />
          </section>
        )}

        {combinedExperience.length > 0 && (
          <section id="section-Experience" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Experience")}`}>
            <MainTitle>Experience</MainTitle>
            <div className="space-y-4">
              {combinedExperience.map((item, index) => (
                <div key={index}>
                  <div className="flex flex-wrap items-center gap-x-3">
                    <h3 className="flex-1 min-w-0 m-0 text-[0.9rem] font-bold text-black">
                      {item?.role}
                      {item?.company && <span className="font-normal text-[#4d4d4d]">, {item.company}</span>}
                    </h3>
                    <span className="text-[0.78rem] font-medium text-[#4d4d4d] whitespace-nowrap">{dateRange(item)}</span>
                  </div>
                  {item?.description && (
                    <div className="mt-1 text-[0.83rem] leading-6 text-[#1a1a1a]" dangerouslySetInnerHTML={{ __html: asHtmlString(item.description) }} />
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {projectDetails.filter((p) => p?.project).length > 0 && (
          <section id="section-Projects" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Projects")}`}>
            <MainTitle>Projects</MainTitle>
            <div className="space-y-4">
              {projectDetails.filter((p) => p?.project).map((item, index) => (
                <div key={index}>
                  <div className="flex flex-wrap items-center gap-x-3">
                    <h3 className="flex-1 min-w-0 m-0 text-[0.9rem] font-bold text-black">
                      {item.project}
                      {item?.company && <span className="font-normal text-[#4d4d4d]"> — {item.company}</span>}
                    </h3>
                    <span className="text-[0.78rem] font-medium text-[#4d4d4d] whitespace-nowrap">
                      {item?.startDate} {item?.endDate ? `– ${item.endDate}` : ""}
                    </span>
                  </div>
                  <div className="mt-1 text-[0.83rem] leading-6 text-[#1a1a1a]" dangerouslySetInnerHTML={{ __html: parseIfJson(item?.description) }} />
                </div>
              ))}
            </div>
          </section>
        )}

        {accDetails.filter((a) => a?.accomplishment || a?.description).length > 0 && (
          <section id="section-Accomplishments" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Accomplishments")}`}>
            <MainTitle>Achievements</MainTitle>
            <ul className="pl-4 space-y-1.5 marker:text-[#999999]">
              {accDetails.filter((a) => a?.accomplishment || a?.description).map((item, index) => (
                <li key={index} className="text-[0.83rem] leading-6 text-[#1a1a1a]">
                  <span className="font-semibold text-black">{item?.accomplishment}</span>
                  {item?.description ? ` — ${item.description}` : ""}
                </li>
              ))}
            </ul>
          </section>
        )}

        {volunteerings.filter((item) => item?.organization || item?.volunteering).length > 0 && (
          <section id="section-Volunteering" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Volunteering")}`}>
            <MainTitle>Volunteering</MainTitle>
            <div className="space-y-3">
              {volunteerings.filter((item) => item?.organization || item?.volunteering).map((item, index) => (
                <div key={index}>
                  <p className="m-0 text-[0.85rem] font-semibold text-black">
                    {item?.volunteering}{item?.organization ? `, ${item.organization}` : ""}
                  </p>
                  <div className="mt-1 text-[0.82rem] leading-6 text-[#4d4d4d]" dangerouslySetInnerHTML={{ __html: asHtmlString(item?.description) }} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Template25;
