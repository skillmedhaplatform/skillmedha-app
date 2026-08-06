"use client";

import React from "react";
import { MailOutlined, PhoneFilled, EnvironmentOutlined, PlusOutlined } from "@ant-design/icons";
import { parseIfJson } from "@/app/student/(protected)/jobAssessments/reusable_comp/jsonparse";
import {
  asHtmlString,
  normalizeExternalLink,
  useResumeTemplateData,
} from "./resumeTemplateData";

/**
 * Template13 — "Bold Condensed" (Roman Arkell style)
 * Extra-bold uppercase condensed name, thick black divider under the
 * header, two columns split by a vertical rule: narrow left (About /
 * Education / Volunteering), wide right (Experience / Skills).
 *
 * Font note: for a pixel-exact match, load a condensed grotesk like
 * "Oswald" or "Barlow Condensed" from next/font or Google Fonts and swap
 * it into the name's font-family below — falls back to system sans until then.
 */
const Template9 = ({ resumeTemplateRef, activeSection, isGeneratingPdf }) => {
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
    activeSection === sectionName ? "bg-[#f4f4f5] rounded-md" : "";

  const SectionTitle = ({ children }) => (
    <div className="flex items-center gap-2 mb-3">
      <PlusOutlined className="text-[0.7rem] text-[#18181b]" />
      <h2 className="m-0 text-[0.85rem] font-bold uppercase tracking-[0.08em] text-[#18181b]">{children}</h2>
    </div>
  );

  return (
    <div
      ref={resumeTemplateRef}
      className={`${isGeneratingPdf ? "w-[50rem] max-w-[50rem]" : "w-full max-w-full"} mx-auto overflow-y-scroll bg-white font-['Inter',sans-serif] text-[#27272a] [&::-webkit-scrollbar]:w-[1px] [&::-webkit-scrollbar-thumb]:bg-transparent [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_li]:text-[0.86rem] [&_li]:leading-6`}
    >
      <header
        id="section-Basic-Details"
        className={`px-10 pt-9 pb-5 scroll-mt-8 ${activeSection === "Basic Details" ? "bg-[#f4f4f5]" : ""}`}
      >
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <h1
              className="m-0 text-[2.1rem] font-black uppercase leading-[0.95] tracking-tight text-[#18181b]"
              style={{ fontFamily: "'Oswald', 'Arial Narrow', sans-serif" }}
            >
              {basicDetails?.firstName}<br />{basicDetails?.middleName} {basicDetails?.lastName}
            </h1>
            {basicDetails?.designation && (
              <p className="m-0 mt-1.5 text-[0.95rem] text-[#52525b]">{basicDetails.designation}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5 text-[0.85rem] text-[#3f3f46] items-start sm:items-end">
            {basicDetails?.city && (
              <span className="flex items-center gap-2"><EnvironmentOutlined /> <span>{basicDetails.city}</span></span>
            )}
            {basicDetails?.phone && (
              <a href={`tel:${basicDetails.phone}`} className="flex items-center gap-2 no-underline text-[#3f3f46]">
                <PhoneFilled /> <span>{basicDetails.phone}</span>
              </a>
            )}
            {basicDetails?.email && (
              <a href={`mailto:${basicDetails.email}`} className="flex items-center gap-2 no-underline text-[#3f3f46]">
                <MailOutlined /> <span>{basicDetails.email}</span>
              </a>
            )}
            {links.filter((item) => item?.link).slice(0, 2).map((item, index) => (
              <a
                key={index}
                href={normalizeExternalLink(item.link)}
                target="_blank"
                rel="noopener noreferrer"
                className="no-underline text-[#3f3f46] break-all"
              >
                {item.title || item.link}
              </a>
            ))}
          </div>
        </div>
      </header>

      <div className="h-[6px] bg-[#18181b] mx-10 mb-8" />

      <div className="px-10 pb-9 grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 divide-x-0 md:divide-x md:divide-[#e4e4e7]">
        {/* Left narrow column */}
        <div className="space-y-6 md:pr-8">
          {basicDetails?.professionalSummary && (
            <section className={`p-3 -m-3 ${sectionState("Basic Details")}`}>
              <SectionTitle>About Me</SectionTitle>
              <div
                className="text-[0.85rem] leading-6 text-[#3f3f46]"
                dangerouslySetInnerHTML={{ __html: asHtmlString(basicDetails.professionalSummary) }}
              />
            </section>
          )}

          {educationDetails.length > 0 && (
            <section id="section-Education" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Education")}`}>
              <SectionTitle>Education</SectionTitle>
              <div className="space-y-3">
                {educationDetails.map((item, index) => (
                  <div key={index}>
                    <p className="m-0 text-[0.85rem] font-semibold text-[#18181b]">{item?.school || item?.board}</p>
                    <p className="m-0 text-[0.8rem] text-[#71717a]">{item?.city}</p>
                    <p className="m-0 text-[0.8rem] text-[#71717a]">{item?.endDate || item?.startDate}</p>
                    <p className="m-0 text-[0.82rem] font-bold text-[#18181b]">{item?.type}</p>
                    {item?.description && <p className="mt-1.5 mb-0 text-[0.82rem] leading-5 text-[#3f3f46]">{item.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {volunteerings.filter((item) => item?.organization || item?.volunteering).length > 0 && (
            <section id="section-Volunteering" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Volunteering")}`}>
              <SectionTitle>Additional Activities</SectionTitle>
              <div className="space-y-3">
                {volunteerings.filter((item) => item?.organization || item?.volunteering).map((item, index) => (
                  <div key={index}>
                    <p className="m-0 text-[0.82rem] font-bold uppercase text-[#18181b]">
                      {item?.volunteering}{item?.organization ? `, ${item.organization}` : ""}
                    </p>
                    <div
                      className="mt-1 text-[0.82rem] leading-5 text-[#3f3f46]"
                      dangerouslySetInnerHTML={{ __html: asHtmlString(item?.description) }}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {languages.filter(Boolean).length > 0 && (
            <section id="section-Languages" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Languages")}`}>
              <SectionTitle>Languages</SectionTitle>
              <p className="m-0 text-[0.85rem] text-[#3f3f46]">
                {languages.filter(Boolean).map((l) => (typeof l === "object" && l !== null ? `${l.name}${l.level ? ` (${l.level})` : ""}` : l)).join(", ")}
              </p>
            </section>
          )}
        </div>

        {/* Right wide column */}
        <div className="space-y-6 md:pl-8">
          {workExperience.length > 0 && (
            <section id="section-Experience" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Experience")}`}>
              <SectionTitle>Work Experience</SectionTitle>
              <div className="space-y-5">
                {workExperience.map((item, index) => (
                  <div key={index}>
                    <div className="flex flex-wrap items-center gap-x-4">
                      <p className="m-0 text-[0.85rem] font-semibold text-[#18181b]">{item?.company}</p>
                      <p className="m-0 text-[0.8rem] font-medium text-[#71717a] whitespace-nowrap">
                        {item?.start || item?.startDate} – {item?.end || item?.endDate || "Present"}
                      </p>
                    </div>
                    <p className="m-0 text-[0.88rem] font-bold uppercase text-[#18181b]">{item?.role}</p>
                    {item?.description && (
                      <div className="mt-1.5" dangerouslySetInnerHTML={{ __html: asHtmlString(item.description) }} />
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {internshipDetails.length > 0 && (
            <section id="section-Internships" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Internships")}`}>
              <SectionTitle>Internships</SectionTitle>
              <div className="space-y-5">
                {internshipDetails.map((item, index) => (
                  <div key={index}>
                    <div className="flex flex-wrap items-center gap-x-4">
                      <p className="m-0 text-[0.85rem] font-semibold text-[#18181b]">{item?.company}</p>
                      <p className="m-0 text-[0.8rem] font-medium text-[#71717a] whitespace-nowrap">
                        {item?.start || item?.startDate} – {item?.end || item?.endDate || "Present"}
                      </p>
                    </div>
                    <p className="m-0 text-[0.88rem] font-bold uppercase text-[#18181b]">{item?.role}</p>
                    {item?.description && (
                      <div className="mt-1.5" dangerouslySetInnerHTML={{ __html: asHtmlString(item.description) }} />
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {projectDetails.filter((item) => item?.project).length > 0 && (
            <section id="section-Projects" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Projects")}`}>
              <SectionTitle>Projects</SectionTitle>
              <div className="space-y-5">
                {projectDetails.filter((item) => item?.project).map((item, index) => (
                  <div key={index}>
                    <div className="flex flex-wrap items-center gap-x-4">
                      <p className="m-0 text-[0.88rem] font-bold uppercase text-[#18181b]">{item.project}</p>
                      <p className="m-0 text-[0.8rem] font-medium text-[#71717a] whitespace-nowrap">
                        {item?.startDate} {item?.endDate ? `– ${item.endDate}` : ""}
                      </p>
                    </div>
                    {item?.company && <p className="m-0 text-[0.85rem] text-[#52525b]">{item.company}</p>}
                    <div className="mt-1.5" dangerouslySetInnerHTML={{ __html: parseIfJson(item?.description) }} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {skills.filter(Boolean).length > 0 && (
            <section id="section-Skills" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Skills")}`}>
              <SectionTitle>Skills</SectionTitle>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                {skills.filter(Boolean).map((skill, index) => (
                  <p key={index} className="m-0 pb-1 text-[0.85rem] text-[#3f3f46] border-b border-[#e4e4e7]">
                    {skill}
                  </p>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default Template9;