"use client";

import React from "react";
import { MailOutlined, PhoneFilled, EnvironmentOutlined } from "@ant-design/icons";
import { parseIfJson } from "@/app/student/(protected)/jobAssessments/reusable_comp/jsonparse";
import {
  asHtmlString,
  normalizeExternalLink,
  useResumeTemplateData,
} from "./resumeTemplateData";

/**
 * Template18 — "Monogram Compact"
 * Common Rezi/Kickresume-style pattern: circular initials monogram next to
 * the name, single column, tight ATS-safe structure, thin rules between
 * sections instead of boxes or sidebars.
 */
const Template18 = ({ resumeTemplateRef, activeSection, isGeneratingPdf }) => {
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
    activeSection === sectionName ? "bg-[#f5f3ff] rounded-md" : "";

  const initials = `${basicDetails?.firstName?.[0] || ""}${basicDetails?.lastName?.[0] || ""}`.toUpperCase();

  const SectionTitle = ({ children }) => (
    <h2 className="m-0 mb-3 text-[0.85rem] font-bold uppercase tracking-[0.14em] text-[#5b21b6] pb-1.5 border-b border-[#ede9fe]">
      {children}
    </h2>
  );

  return (
    <div
      ref={resumeTemplateRef}
      className={`${isGeneratingPdf ? "w-[50rem] max-w-[50rem]" : "w-full max-w-full"} mx-auto overflow-y-scroll bg-white px-10 py-10 font-['Inter',sans-serif] text-[#27272a] [&::-webkit-scrollbar]:w-[1px] [&::-webkit-scrollbar-thumb]:bg-transparent [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-0.5 [&_li]:text-[0.86rem] [&_li]:leading-6`}
    >
      <header
        id="section-Basic-Details"
        className={`flex items-center gap-4 pb-6 p-4 -m-4 scroll-mt-8 ${sectionState("Basic Details")}`}
      >
        <span className="w-14 h-14 rounded-full bg-[#5b21b6] text-white flex items-center justify-center text-[1.1rem] font-bold shrink-0">
          {initials || "?"}
        </span>
        <div>
          <h1 className="m-0 text-[1.7rem] font-bold text-[#18181b]">
            {basicDetails?.firstName} {basicDetails?.middleName} {basicDetails?.lastName}
          </h1>
          {basicDetails?.designation && (
            <p className="m-0 mt-0.5 text-[0.9rem] font-medium text-[#5b21b6]">{basicDetails.designation}</p>
          )}
        </div>
      </header>

      <div className="flex flex-wrap gap-x-5 gap-y-1.5 mb-6 text-[0.83rem] text-[#52525b]">
        {basicDetails?.phone && (
          <a href={`tel:${basicDetails.phone}`} className="flex items-center gap-1.5 no-underline text-[#52525b]">
            <PhoneFilled /> <span>{basicDetails.phone}</span>
          </a>
        )}
        {basicDetails?.email && (
          <a href={`mailto:${basicDetails.email}`} className="flex items-center gap-1.5 no-underline text-[#52525b]">
            <MailOutlined /> <span>{basicDetails.email}</span>
          </a>
        )}
        {basicDetails?.city && (
          <span className="flex items-center gap-1.5">
            <EnvironmentOutlined /> <span>{basicDetails.city}</span>
          </span>
        )}
        {links.filter((item) => item?.link).map((item, index) => (
          <a
            key={index}
            href={normalizeExternalLink(item.link)}
            target="_blank"
            rel="noopener noreferrer"
            className="no-underline text-[#5b21b6] break-all"
          >
            {item.title || item.link}
          </a>
        ))}
      </div>

      <div className="space-y-5">
        {basicDetails?.professionalSummary && (
          <section>
            <SectionTitle>Summary</SectionTitle>
            <div
              className="text-[0.88rem] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: asHtmlString(basicDetails.professionalSummary) }}
            />
          </section>
        )}

        {workExperience.length > 0 && (
          <section id="section-Experience" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Experience")}`}>
            <SectionTitle>Experience</SectionTitle>
            <div className="space-y-3.5">
              {workExperience.map((item, index) => (
                <div key={index}>
                  <div className="flex flex-wrap justify-between gap-x-4">
                    <h3 className="m-0 text-[0.92rem] font-bold text-[#18181b]">{item?.role} — {item?.company}</h3>
                    <p className="m-0 text-[0.78rem] text-[#71717a] whitespace-nowrap">
                      {item?.start || item?.startDate} – {item?.end || item?.endDate || "Present"}
                    </p>
                  </div>
                  {item?.description && (
                    <div className="mt-1 text-[0.85rem]" dangerouslySetInnerHTML={{ __html: asHtmlString(item.description) }} />
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {internshipDetails.length > 0 && (
          <section id="section-Internships" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Internships")}`}>
            <SectionTitle>Internships</SectionTitle>
            <div className="space-y-3.5">
              {internshipDetails.map((item, index) => (
                <div key={index}>
                  <div className="flex flex-wrap justify-between gap-x-4">
                    <h3 className="m-0 text-[0.92rem] font-bold text-[#18181b]">{item?.role} — {item?.company}</h3>
                    <p className="m-0 text-[0.78rem] text-[#71717a] whitespace-nowrap">
                      {item?.start || item?.startDate} – {item?.end || item?.endDate || "Present"}
                    </p>
                  </div>
                  {item?.description && (
                    <div className="mt-1 text-[0.85rem]" dangerouslySetInnerHTML={{ __html: asHtmlString(item.description) }} />
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {projectDetails.filter((item) => item?.project).length > 0 && (
          <section id="section-Projects" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Projects")}`}>
            <SectionTitle>Projects</SectionTitle>
            <div className="space-y-3.5">
              {projectDetails.filter((item) => item?.project).map((item, index) => (
                <div key={index}>
                  <div className="flex flex-wrap justify-between gap-x-4">
                    <h3 className="m-0 text-[0.92rem] font-bold text-[#18181b]">
                      {item.project} {item?.company ? `— ${item.company}` : ""}
                    </h3>
                    <p className="m-0 text-[0.78rem] text-[#71717a] whitespace-nowrap">
                      {item?.startDate} {item?.endDate ? `– ${item.endDate}` : ""}
                    </p>
                  </div>
                  <div className="mt-1 text-[0.85rem]" dangerouslySetInnerHTML={{ __html: parseIfJson(item?.description) }} />
                </div>
              ))}
            </div>
          </section>
        )}

        {educationDetails.length > 0 && (
          <section id="section-Education" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Education")}`}>
            <SectionTitle>Education</SectionTitle>
            <div className="space-y-2.5">
              {educationDetails.map((item, index) => (
                <div key={index} className="flex flex-wrap justify-between gap-x-4">
                  <div>
                    <h3 className="m-0 text-[0.9rem] font-bold text-[#18181b]">{item?.type}</h3>
                    <p className="m-0 text-[0.83rem] text-[#52525b]">{item?.school || item?.board}</p>
                  </div>
                  <p className="m-0 text-[0.78rem] text-[#71717a] whitespace-nowrap">{item?.startDate} – {item?.endDate}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {volunteerings.filter((item) => item?.organization || item?.volunteering).length > 0 && (
          <section id="section-Volunteering" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Volunteering")}`}>
            <SectionTitle>Volunteering</SectionTitle>
            <div className="space-y-3">
              {volunteerings.filter((item) => item?.organization || item?.volunteering).map((item, index) => (
                <div key={index}>
                  <h3 className="m-0 text-[0.88rem] font-bold text-[#18181b]">
                    {item?.volunteering}{item?.organization ? `, ${item.organization}` : ""}
                  </h3>
                  <div className="mt-1 text-[0.85rem]" dangerouslySetInnerHTML={{ __html: asHtmlString(item?.description) }} />
                </div>
              ))}
            </div>
          </section>
        )}

        {skills.filter(Boolean).length > 0 && (
          <section id="section-Skills" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Skills")}`}>
            <SectionTitle>Skills</SectionTitle>
            <p className="m-0 text-[0.86rem] text-[#3f3f46]">{skills.filter(Boolean).join(" · ")}</p>
          </section>
        )}

        {languages.filter(Boolean).length > 0 && (
          <section id="section-Languages" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Languages")}`}>
            <SectionTitle>Languages</SectionTitle>
            <p className="m-0 text-[0.86rem] text-[#3f3f46]">
              {languages.filter(Boolean).map((l) => (typeof l === "object" && l !== null ? `${l.name}${l.level ? ` (${l.level})` : ""}` : l)).join(", ")}
            </p>
          </section>
        )}
      </div>
    </div>
  );
};

export default Template18;