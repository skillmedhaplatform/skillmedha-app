"use client";

import React from "react";
import {
  PhoneFilled,
  MailOutlined,
  GlobalOutlined,
  LinkedinFilled,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { parseIfJson } from "@/app/student/(protected)/jobAssessments/reusable_comp/jsonparse";
import {
  asHtmlString,
  normalizeExternalLink,
  useResumeTemplateData,
} from "./resumeTemplateData";

/**
 * Template18 — "Simple Professional"
 * A quiet, centered single column with no color blocks, badges, or photo —
 * just disciplined type and spacing. Built for the "just show me the
 * facts, cleanly" reader: a plain-text ATS-friendly layout that still
 * looks considered. One accent color is used sparingly, only for section
 * rules, links and skill/language chips. Works equally well for a first
 * resume or a seasoned one.
 */
const ACCENT = "#2c6187";

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
    activeSection === sectionName ? "bg-[#f4f8fa] rounded-md" : "";

  const SectionLabel = ({ children }) => (
    <div className="flex items-center gap-3 mb-4">
      <h2 className="m-0 text-[0.78rem] font-semibold uppercase tracking-[0.25em] text-[#334155] whitespace-nowrap">
        {children}
      </h2>
      <div className="h-px flex-1" style={{ backgroundColor: "#e2e8f0" }} />
    </div>
  );

  const dateRange = (item) =>
    `${item?.start || item?.startDate || ""} – ${item?.end || item?.endDate || "Present"}`;

  const contactItems = [
    basicDetails?.phone && { icon: <PhoneFilled />, value: basicDetails.phone },
    basicDetails?.email && { icon: <MailOutlined />, value: basicDetails.email },
    basicDetails?.city && { icon: <EnvironmentOutlined />, value: basicDetails.city },
  ].filter(Boolean);

  const combinedExperience = [...workExperience, ...internshipDetails];

  return (
    <div
      ref={resumeTemplateRef}
      className={`${isGeneratingPdf ? "w-[50rem] max-w-[50rem]" : "w-full max-w-full"} mx-auto overflow-y-scroll bg-white font-['Inter',sans-serif] text-[#475569] [&::-webkit-scrollbar]:w-[1px] [&::-webkit-scrollbar-thumb]:bg-transparent [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_li]:text-[0.85rem] [&_li]:leading-6`}
    >
      <div className="max-w-2xl mx-auto px-10 py-10 space-y-8">
        {/* Header */}
        <div
          id="section-Basic-Details"
          className={`text-center p-3 -m-3 pb-6 scroll-mt-8 border-b border-[#e2e8f0] ${sectionState("Basic Details")}`}
        >
          <h1 className="m-0 text-[2rem] font-light tracking-[0.06em] text-[#1e293b] uppercase">
            {basicDetails?.firstName}{" "}
            <span className="font-semibold">
              {basicDetails?.middleName} {basicDetails?.lastName}
            </span>
          </h1>
          {workExperience?.[0]?.role && (
            <p className="mt-1.5 mb-0 text-[0.85rem] font-medium tracking-wide" style={{ color: ACCENT }}>
              {workExperience[0].role}
            </p>
          )}

          <div className="mt-4 flex flex-wrap justify-center items-center gap-x-5 gap-y-1.5 text-[0.78rem] text-[#64748b]">
            {contactItems.map((item, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <span style={{ color: ACCENT }}>{item.icon}</span>
                {item.value}
              </span>
            ))}
            {links.filter((item) => item?.link).slice(0, 2).map((item, index) => (
              <a
                key={`link-${index}`}
                href={normalizeExternalLink(item.link)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 no-underline"
                style={{ color: ACCENT }}
              >
                {index === 0 ? <GlobalOutlined /> : <LinkedinFilled />}
                {item.title || item.link}
              </a>
            ))}
          </div>
        </div>

        {basicDetails?.professionalSummary && (
          <section className="p-3 -m-3 text-center">
            <div
              className="text-[0.85rem] leading-6 text-[#475569] max-w-xl mx-auto"
              dangerouslySetInnerHTML={{ __html: asHtmlString(basicDetails.professionalSummary) }}
            />
          </section>
        )}

        {combinedExperience.length > 0 && (
          <section id="section-Experience" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Experience")}`}>
            <SectionLabel>Experience</SectionLabel>
            <div className="space-y-5">
              {combinedExperience.map((item, index) => (
                <div key={index}>
                  <div className="flex flex-wrap justify-between gap-x-4">
                    <h3 className="m-0 text-[0.9rem] font-semibold text-[#1e293b]">
                      {item?.role}
                      {item?.company ? <span className="font-normal text-[#64748b]"> · {item.company}</span> : ""}
                    </h3>
                    <p className="m-0 text-[0.78rem] text-[#94a3b8] whitespace-nowrap">{dateRange(item)}</p>
                  </div>
                  {item?.description && (
                    <div
                      className="mt-1.5 text-[0.83rem]"
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
            <SectionLabel>Education</SectionLabel>
            <div className="space-y-3">
              {educationDetails.map((item, index) => (
                <div key={index} className="flex flex-wrap justify-between gap-x-4">
                  <div>
                    <h3 className="m-0 text-[0.87rem] font-semibold text-[#1e293b]">{item?.type}</h3>
                    <p className="m-0 text-[0.8rem] text-[#64748b]">{item?.school || item?.board}</p>
                  </div>
                  <p className="m-0 text-[0.78rem] text-[#94a3b8] whitespace-nowrap">
                    {item?.startDate} – {item?.endDate}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {skills.filter(Boolean).length > 0 && (
          <section id="section-Skills" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Skills")}`}>
            <SectionLabel>Skills</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {skills.filter(Boolean).map((skill, index) => (
                <span
                  key={index}
                  className="text-[0.78rem] font-medium rounded-full px-3 py-1"
                  style={{ color: ACCENT, backgroundColor: "rgba(44,97,135,0.08)" }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {projectDetails.filter((item) => item?.project).length > 0 && (
          <section id="section-Projects" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Projects")}`}>
            <SectionLabel>Projects</SectionLabel>
            <ul className="pl-5 list-disc space-y-1.5">
              {projectDetails.filter((item) => item?.project).map((item, index) => (
                <li key={index} className="text-[0.85rem]">
                  <span className="font-semibold text-[#1e293b]">{item.project}</span>
                  {item?.company ? ` — ${item.company}` : ""}
                  <div className="mt-1" dangerouslySetInnerHTML={{ __html: parseIfJson(item?.description) }} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {volunteerings.filter((item) => item?.organization || item?.volunteering).length > 0 && (
          <section id="section-Volunteering" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Volunteering")}`}>
            <SectionLabel>Volunteering</SectionLabel>
            <div className="space-y-3">
              {volunteerings.filter((item) => item?.organization || item?.volunteering).map((item, index) => (
                <div key={index}>
                  <p className="m-0 text-[0.85rem] font-semibold text-[#1e293b]">
                    {item?.volunteering}{item?.organization ? `, ${item.organization}` : ""}
                  </p>
                  <div className="mt-1 text-[0.82rem]" dangerouslySetInnerHTML={{ __html: asHtmlString(item?.description) }} />
                </div>
              ))}
            </div>
          </section>
        )}

        {languages.filter(Boolean).length > 0 && (
          <section id="section-Languages" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Languages")}`}>
            <SectionLabel>Languages</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {languages.filter(Boolean).map((l, index) => {
                const name = typeof l === "object" && l !== null ? l.name : l;
                const level = typeof l === "object" && l !== null ? l.level : null;
                return (
                  <span
                    key={index}
                    className="text-[0.78rem] font-medium rounded-full px-3 py-1"
                    style={{ color: ACCENT, backgroundColor: "rgba(44,97,135,0.08)" }}
                  >
                    {name}{level ? ` · ${level}` : ""}
                  </span>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Template18;
