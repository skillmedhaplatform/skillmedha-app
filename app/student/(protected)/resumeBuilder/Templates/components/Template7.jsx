"use client";

import React from "react";
import { parseIfJson } from "@/app/student/(protected)/jobAssessments/reusable_comp/jsonparse";
import {
  asHtmlString,
  normalizeExternalLink,
  useResumeTemplateData,
} from "./resumeTemplateData";

/**
 * Template15 — "Classic Green Serif" (Richard Williams style)
 * Centered bold serif name in a deep green, italic professional summary,
 * green uppercase section headers with a thin rule, right-aligned
 * company/location and role/dates rows.
 *
 * Font note: for the exact look, load "PT Serif" or "Merriweather" for
 * the name/headings — falls back to Georgia otherwise.
 */
const Template15 = ({ resumeTemplateRef, activeSection, isGeneratingPdf }) => {
  const {
    basicDetails,
    educationDetails,
    workExperience,
    internshipDetails,
    projectDetails,
    volunteerings,
    skills,
    languages,
    links,
  } = useResumeTemplateData();

  const sectionState = (sectionName) =>
    activeSection === sectionName ? "bg-[#f0fdf4] rounded-md" : "";

  const SectionTitle = ({ children }) => (
    <div className="mb-3">
      <h2 className="m-0 text-[0.92rem] font-bold uppercase tracking-[0.08em] text-[#166534]">{children}</h2>
      <div className="mt-1 h-px w-full bg-[#166534]" />
    </div>
  );

  return (
    <div
      ref={resumeTemplateRef}
      className={`${isGeneratingPdf ? "w-[50rem] max-w-[50rem]" : "w-full max-w-full"} mx-auto overflow-y-scroll bg-white px-12 py-10 font-['Georgia',serif] text-[#1c1917] [&::-webkit-scrollbar]:w-[1px] [&::-webkit-scrollbar-thumb]:bg-transparent [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_li]:font-['Inter',sans-serif] [&_li]:text-[0.87rem] [&_li]:leading-6`}
    >
      <header
        id="section-Basic-Details"
        className={`text-center pb-5 p-4 -m-4 scroll-mt-8 ${sectionState("Basic Details")}`}
      >
        <h1 className="m-0 text-[1.9rem] font-bold text-[#166534]">
          {basicDetails?.firstName} {basicDetails?.middleName} {basicDetails?.lastName}
        </h1>
        <div className="mt-2 h-px w-full bg-[#166534]" />
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[0.85rem] font-['Inter',sans-serif] text-[#44403c]">
          {basicDetails?.city && <span>{basicDetails.city}</span>}
          {basicDetails?.phone && (
            <>
              <span>·</span>
              <a href={`tel:${basicDetails.phone}`} className="no-underline text-[#44403c]">{basicDetails.phone}</a>
            </>
          )}
          {basicDetails?.email && (
            <>
              <span>·</span>
              <a href={`mailto:${basicDetails.email}`} className="no-underline text-[#44403c]">{basicDetails.email}</a>
            </>
          )}
          {links.filter((item) => item?.link).slice(0, 2).map((item, index) => (
            <React.Fragment key={index}>
              <span>·</span>
              <a
                href={normalizeExternalLink(item.link)}
                target="_blank"
                rel="noopener noreferrer"
                className="no-underline text-[#44403c] break-all"
              >
                {item.title || item.link}
              </a>
            </React.Fragment>
          ))}
        </div>
        {basicDetails?.professionalSummary && (
          <div
            className="mt-3 text-[0.88rem] italic leading-6 font-['Inter',sans-serif] text-[#3f3f46]"
            dangerouslySetInnerHTML={{ __html: asHtmlString(basicDetails.professionalSummary) }}
          />
        )}
      </header>

      <div className="space-y-6">
        {workExperience.length > 0 && (
          <section id="section-Experience" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Experience")}`}>
            <SectionTitle>Professional Experience</SectionTitle>
            <div className="space-y-4">
              {workExperience.map((item, index) => (
                <div key={index}>
                  <div className="flex flex-wrap items-center gap-x-4">
                    <h3 className="m-0 text-[0.95rem] font-bold uppercase text-[#1c1917]">{item?.company}</h3>
                    {item?.city && <p className="m-0 text-[0.85rem] font-bold text-[#1c1917]">{item.city}</p>}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4">
                    <p className="m-0 text-[0.85rem] italic font-['Inter',sans-serif] text-[#57534e]">{item?.role}</p>
                    <p className="m-0 text-[0.82rem] italic font-['Inter',sans-serif] text-[#57534e] whitespace-nowrap">
                      {item?.start || item?.startDate} – {item?.end || item?.endDate || "Present"}
                    </p>
                  </div>
                  {item?.description && (
                    <div className="mt-1.5 font-['Inter',sans-serif]" dangerouslySetInnerHTML={{ __html: asHtmlString(item.description) }} />
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {internshipDetails.length > 0 && (
          <section id="section-Internships" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Internships")}`}>
            <SectionTitle>Internships</SectionTitle>
            <div className="space-y-4">
              {internshipDetails.map((item, index) => (
                <div key={index}>
                  <div className="flex flex-wrap items-center gap-x-4">
                    <h3 className="m-0 text-[0.95rem] font-bold uppercase text-[#1c1917]">{item?.company}</h3>
                    {item?.city && <p className="m-0 text-[0.85rem] font-bold text-[#1c1917]">{item.city}</p>}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4">
                    <p className="m-0 text-[0.85rem] italic font-['Inter',sans-serif] text-[#57534e]">{item?.role}</p>
                    <p className="m-0 text-[0.82rem] italic font-['Inter',sans-serif] text-[#57534e] whitespace-nowrap">
                      {item?.start || item?.startDate} – {item?.end || item?.endDate || "Present"}
                    </p>
                  </div>
                  {item?.description && (
                    <div className="mt-1.5 font-['Inter',sans-serif]" dangerouslySetInnerHTML={{ __html: asHtmlString(item.description) }} />
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {projectDetails.filter((item) => item?.project).length > 0 && (
          <section id="section-Projects" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Projects")}`}>
            <SectionTitle>Projects</SectionTitle>
            <div className="space-y-4">
              {projectDetails.filter((item) => item?.project).map((item, index) => (
                <div key={index}>
                  <div className="flex flex-wrap items-center gap-x-4">
                    <h3 className="m-0 text-[0.95rem] font-bold uppercase text-[#1c1917]">{item.project}</h3>
                    <p className="m-0 text-[0.82rem] italic font-['Inter',sans-serif] text-[#57534e] whitespace-nowrap">
                      {item?.startDate} {item?.endDate ? `– ${item.endDate}` : ""}
                    </p>
                  </div>
                  {item?.company && <p className="m-0 text-[0.85rem] italic font-['Inter',sans-serif] text-[#57534e]">{item.company}</p>}
                  <div className="mt-1.5 font-['Inter',sans-serif]" dangerouslySetInnerHTML={{ __html: parseIfJson(item?.description) }} />
                </div>
              ))}
            </div>
          </section>
        )}

        {educationDetails.length > 0 && (
          <section id="section-Education" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Education")}`}>
            <SectionTitle>Education</SectionTitle>
            <div className="space-y-3">
              {educationDetails.map((item, index) => (
                <div key={index}>
                  <div className="flex flex-wrap items-center gap-x-4">
                    <h3 className="m-0 text-[0.95rem] font-bold uppercase text-[#1c1917]">{item?.school || item?.board}</h3>
                    {item?.city && <p className="m-0 text-[0.85rem] font-bold text-[#1c1917]">{item.city}</p>}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4">
                    <p className="m-0 text-[0.85rem] italic font-['Inter',sans-serif] text-[#57534e]">{item?.type}</p>
                    <p className="m-0 text-[0.82rem] italic font-['Inter',sans-serif] text-[#57534e] whitespace-nowrap">
                      {item?.endDate || item?.startDate}
                    </p>
                  </div>
                  {item?.description && <p className="mt-1.5 mb-0 text-[0.85rem] leading-6 font-['Inter',sans-serif] text-[#3f3f46]">{item.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {volunteerings.filter((item) => item?.organization || item?.volunteering).length > 0 && (
          <section id="section-Volunteering" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Volunteering")}`}>
            <SectionTitle>Volunteering</SectionTitle>
            <div className="space-y-4">
              {volunteerings.filter((item) => item?.organization || item?.volunteering).map((item, index) => (
                <div key={index}>
                  <h3 className="m-0 text-[0.9rem] font-bold uppercase text-[#1c1917]">
                    {item?.volunteering}{item?.organization ? `, ${item.organization}` : ""}
                  </h3>
                  <div className="mt-1 font-['Inter',sans-serif]" dangerouslySetInnerHTML={{ __html: asHtmlString(item?.description) }} />
                </div>
              ))}
            </div>
          </section>
        )}

        {(skills.filter(Boolean).length > 0 || languages.filter(Boolean).length > 0) && (
          <section id="section-Skills" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Skills")}`}>
            <SectionTitle>Additional Skills</SectionTitle>
            <ul className="list-disc pl-5 space-y-1">
              {skills.filter(Boolean).length > 0 && (
                <li className="font-['Inter',sans-serif] text-[0.87rem] leading-6">
                  Proficient in {skills.filter(Boolean).join(", ")}
                </li>
              )}
              {languages.filter(Boolean).length > 0 && (
                <li id="section-Languages" className="font-['Inter',sans-serif] text-[0.87rem] leading-6 scroll-mt-8">
                  Fluent in {languages.filter(Boolean).map((l) => (typeof l === "object" && l !== null ? l.name : l)).join(", ")}
                </li>
              )}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
};

export default Template15;