"use client";

import React from "react";
import {
  PhoneFilled,
  MailOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  LinkedinFilled,
} from "@ant-design/icons";
import { parseIfJson } from "@/app/student/(protected)/jobAssessments/reusable_comp/jsonparse";
import {
  asHtmlString,
  normalizeExternalLink,
  useProfileImage,
  useResumeTemplateData,
} from "./resumeTemplateData";

/**
 * Template19 — "Woven Teal"
 * Dark charcoal-teal sidebar with a woven-texture header block (photo if
 * present, a decorative weave otherwise), circular-icon contact list,
 * Education / Certifications / Skills stacked below. Wide white right
 * column carries the teal serif name, Professional Summary, Experience
 * (role, company, location, dates), and a Languages section rendered as
 * proficiency bars.
 *
 * "Certifications" has no dedicated field in the data model, so — same
 * approach as Template16's Achievements section — it's sourced from
 * Projects (project -> certification title, company -> issuing body)
 * rather than fabricating data. Swap the source if you'd rather point
 * it elsewhere.
 */

const LEVEL_TO_PERCENT = {
  native: 100,
  "first language": 100,
  fluent: 95,
  c2: 95,
  advanced: 85,
  c1: 85,
  "upper intermediate": 70,
  b2: 70,
  intermediate: 55,
  b1: 55,
  "elementary": 35,
  a2: 35,
  beginner: 20,
  a1: 20,
};

const levelToPercent = (level) => {
  if (!level) return 60;
  const pct = LEVEL_TO_PERCENT[String(level).trim().toLowerCase()];
  return pct ?? 60;
};

const Template1 = ({ resumeTemplateRef, activeSection, isGeneratingPdf }) => {
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
  const profileBase64 = useProfileImage(basicDetails?.profile);

  const sectionState = (sectionName) =>
    activeSection === sectionName ? "bg-[rgba(255,255,255,0.1)] rounded-md" : "";

  const SideTitle = ({ children }) => (
    <div className="mb-3">
      <h2 className="m-0 text-[0.78rem] font-bold uppercase tracking-[0.2em] text-white">{children}</h2>
      <div className="mt-1.5 h-[2px] w-8 bg-[#4fa896]" />
    </div>
  );

  const MainTitle = ({ children }) => (
    <div className="mb-4">
      <h2 className="m-0 text-[0.95rem] font-bold uppercase tracking-[0.15em] text-[#1e5449]">{children}</h2>
      <div className="mt-1.5 h-[2px] w-10 bg-[#4fa896]" />
    </div>
  );

  const dateRange = (item) =>
    `${item?.start || item?.startDate || ""} – ${item?.end || item?.endDate || "Present"}`;

  return (
    <div
      ref={resumeTemplateRef}
      className={`${isGeneratingPdf ? "w-[50rem] max-w-[50rem]" : "w-full max-w-full"} mx-auto overflow-y-scroll bg-white font-['Inter',sans-serif] text-[#3f3f46] grid grid-cols-1 md:grid-cols-[15rem_1fr] [&::-webkit-scrollbar]:w-[1px] [&::-webkit-scrollbar-thumb]:bg-transparent [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_li]:text-[0.85rem] [&_li]:leading-6`}
    >
      {/* Left column */}
      <div className="bg-[#1c3833] flex flex-col">
        {/* Woven texture header / photo block */}
        <div
          className="h-40 w-full shrink-0"
          style={
            profileBase64
              ? {
                  backgroundImage: `url(${profileBase64})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : {
                  backgroundColor: "#245149",
                  backgroundImage:
                    "repeating-linear-gradient(135deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 2px, transparent 2px, transparent 10px), repeating-linear-gradient(45deg, rgba(0,0,0,0.12) 0px, rgba(0,0,0,0.12) 2px, transparent 2px, transparent 10px)",
                }
          }
        />

        <div className="p-6 flex flex-col gap-6">
          <div>
            <SideTitle>Contact</SideTitle>
            <div className="flex flex-col gap-3">
              {basicDetails?.city && (
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[rgba(255,255,255,0.1)] flex items-center justify-center text-[0.75rem] text-white shrink-0">
                    <EnvironmentOutlined />
                  </span>
                  <span className="text-[0.78rem] text-[#dbe7e4]">{basicDetails.city}</span>
                </div>
              )}
              {basicDetails?.phone && (
                <a href={`tel:${basicDetails.phone}`} className="flex items-center gap-3 no-underline">
                  <span className="w-6 h-6 rounded-full bg-[rgba(255,255,255,0.1)] flex items-center justify-center text-[0.75rem] text-white shrink-0">
                    <PhoneFilled />
                  </span>
                  <span className="text-[0.78rem] text-[#dbe7e4]">{basicDetails.phone}</span>
                </a>
              )}
              {basicDetails?.email && (
                <a href={`mailto:${basicDetails.email}`} className="flex items-center gap-3 no-underline">
                  <span className="w-6 h-6 rounded-full bg-[rgba(255,255,255,0.1)] flex items-center justify-center text-[0.75rem] text-white shrink-0">
                    <MailOutlined />
                  </span>
                  <span className="text-[0.78rem] text-[#dbe7e4] break-all">{basicDetails.email}</span>
                </a>
              )}
              {links.filter((item) => item?.link).slice(0, 2).map((item, index) => (
                <a
                  key={index}
                  href={normalizeExternalLink(item.link)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 no-underline"
                >
                  <span className="w-6 h-6 rounded-full bg-[rgba(255,255,255,0.1)] flex items-center justify-center text-[0.75rem] text-white shrink-0">
                    {index === 0 ? <GlobalOutlined /> : <LinkedinFilled />}
                  </span>
                  <span className="text-[0.78rem] text-[#dbe7e4] break-all">{item.title || item.link}</span>
                </a>
              ))}
            </div>
          </div>

          {educationDetails.length > 0 && (
            <div id="section-Education" className={`p-2 -m-2 scroll-mt-8 ${sectionState("Education")}`}>
              <SideTitle>Education</SideTitle>
              <div className="flex flex-col gap-3">
                {educationDetails.map((item, index) => (
                  <div key={index}>
                    <p className="m-0 text-[0.8rem] font-semibold text-white">{item?.type}</p>
                    <p className="m-0 text-[0.75rem] text-[#a9c2bd]">{item?.school || item?.board}</p>
                    <p className="m-0 text-[0.72rem] text-[#7fa39a]">
                      {item?.startDate} – {item?.endDate}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {projectDetails.filter((item) => item?.project).length > 0 && (
            <div id="section-Projects" className={`p-2 -m-2 scroll-mt-8 ${sectionState("Projects")}`}>
              <SideTitle>Certifications</SideTitle>
              <ul className="pl-4 space-y-2 text-[#dbe7e4] marker:text-[#4fa896]">
                {projectDetails.filter((item) => item?.project).map((item, index) => (
                  <li key={index} className="text-[0.78rem] leading-5">
                    <span className="font-semibold text-white">{item.project}</span>
                    {item?.company ? `, ${item.company}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {skills.filter(Boolean).length > 0 && (
            <div id="section-Skills" className={`p-2 -m-2 scroll-mt-8 ${sectionState("Skills")}`}>
              <SideTitle>Skills</SideTitle>
              <ul className="pl-4 space-y-1.5 text-[#dbe7e4] marker:text-[#4fa896]">
                {skills.filter(Boolean).map((skill, index) => (
                  <li key={index} className="text-[0.78rem]">{skill}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Right column */}
      <div className="p-8 space-y-7">
        <div id="section-Basic-Details" className={`p-2 -m-2 scroll-mt-8 ${sectionState("Basic Details")}`}>
          <h1 className="m-0 font-serif text-[2.1rem] font-semibold text-[#1e5449] leading-tight">
            {basicDetails?.firstName} {basicDetails?.middleName} {basicDetails?.lastName}
          </h1>
        </div>

        {basicDetails?.professionalSummary && (
          <section>
            <MainTitle>Professional Summary</MainTitle>
            <div
              className="text-[0.85rem] leading-6 text-[#52525b]"
              dangerouslySetInnerHTML={{ __html: asHtmlString(basicDetails.professionalSummary) }}
            />
          </section>
        )}

        {(workExperience.length > 0 || internshipDetails.length > 0) && (
          <section id="section-Experience" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Experience")}`}>
            <MainTitle>Experience</MainTitle>
            <div className="space-y-5">
              {[...workExperience, ...internshipDetails].map((item, index) => (
                <div key={index}>
                  <p className="m-0 text-[0.78rem] font-semibold text-[#4fa896]">{dateRange(item)}</p>
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <h3 className="m-0 text-[0.92rem] font-bold text-[#1e293b]">{item?.role}</h3>
                    {item?.company && (
                      <span className="text-[0.83rem] text-[#64748b]">
                        {item.company}
                        {basicDetails?.city ? ` | ${basicDetails.city}` : ""}
                      </span>
                    )}
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

        {volunteerings.filter((item) => item?.organization || item?.volunteering).length > 0 && (
          <section id="section-Volunteering" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Volunteering")}`}>
            <MainTitle>Volunteering</MainTitle>
            <div className="space-y-3">
              {volunteerings.filter((item) => item?.organization || item?.volunteering).map((item, index) => (
                <div key={index}>
                  <p className="m-0 text-[0.85rem] font-semibold text-[#1e293b]">
                    {item?.volunteering}{item?.organization ? `, ${item.organization}` : ""}
                  </p>
                  <div className="mt-1 text-[0.82rem] text-[#52525b]" dangerouslySetInnerHTML={{ __html: asHtmlString(item?.description) }} />
                </div>
              ))}
            </div>
          </section>
        )}

        {languages.filter(Boolean).length > 0 && (
          <section id="section-Languages" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Languages")}`}>
            <MainTitle>Languages</MainTitle>
            <div className="space-y-3 max-w-sm">
              {languages.filter(Boolean).map((l, index) => {
                const name = typeof l === "object" && l !== null ? l.name : l;
                const level = typeof l === "object" && l !== null ? l.level : null;
                return (
                  <div key={index}>
                    <div className="flex items-center text-[0.8rem] mb-1">
                      <span className="text-[#1e293b] font-medium">{name}</span>
                      {level && <span className="text-[#64748b]">{level}</span>}
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[#e2e8f0]">
                      <div
                        className="h-1.5 rounded-full bg-[#4fa896]"
                        style={{ width: `${levelToPercent(level)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Template1;