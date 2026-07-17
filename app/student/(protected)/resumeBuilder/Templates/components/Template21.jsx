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
 * Template21 — "Plum Slate"
 * Dark plum sidebar (photo/initials, contact, skills, languages) beside a
 * white main column that renders experience/education/projects as a
 * left-rule timeline. Tailwind classes throughout, following the same
 * two-column pattern as Template1/Template19 but with a distinct accent
 * palette and timeline treatment for entries.
 */

const getInitials = (first, last) => `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase();

const Template21 = ({ resumeTemplateRef, activeSection, isGeneratingPdf }) => {
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
  const profileBase64 = useProfileImage(basicDetails?.profile);

  const sectionState = (sectionName) =>
    activeSection === sectionName ? "bg-[rgba(255,255,255,0.1)] rounded-md" : "";

  const SideTitle = ({ children }) => (
    <div className="mb-3">
      <h2 className="m-0 text-[0.78rem] font-bold uppercase tracking-[0.2em] text-white">{children}</h2>
      <div className="mt-1.5 h-[2px] w-8 bg-[#c98bb9]" />
    </div>
  );

  const MainTitle = ({ children }) => (
    <div className="mb-4">
      <h2 className="m-0 text-[0.95rem] font-bold uppercase tracking-[0.15em] text-[#4a1942]">{children}</h2>
      <div className="mt-1.5 h-[2px] w-10 bg-[#a3336f]" />
    </div>
  );

  const dateRange = (item) =>
    `${item?.start || item?.startDate || ""} – ${item?.end || item?.endDate || "Present"}`;

  const TimelineEntry = ({ title, subtitle, meta, children }) => (
    <div className="relative pl-5 border-l-2 border-[#eadaf0] pb-5 last:pb-0">
      <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-[#a3336f]" />
      <p className="m-0 text-[0.78rem] font-semibold text-[#a3336f]">{meta}</p>
      <div className="flex flex-wrap items-baseline gap-x-2">
        <h3 className="m-0 text-[0.92rem] font-bold text-[#28131f]">{title}</h3>
        {subtitle && <span className="text-[0.83rem] text-[#71586b]">{subtitle}</span>}
      </div>
      {children}
    </div>
  );

  return (
    <div
      ref={resumeTemplateRef}
      className={`${isGeneratingPdf ? "w-[50rem] max-w-[50rem]" : "w-full max-w-full"} mx-auto overflow-y-scroll bg-white font-['Inter',sans-serif] text-[#3f3f46] grid grid-cols-1 md:grid-cols-[15rem_1fr] [&::-webkit-scrollbar]:w-[1px] [&::-webkit-scrollbar-thumb]:bg-transparent [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_li]:text-[0.85rem] [&_li]:leading-6`}
    >
      {/* Left column */}
      <div className="bg-[#4a1942] flex flex-col">
        <div className="flex flex-col items-center pt-8 pb-6 px-6">
          <div className="h-24 w-24 rounded-full overflow-hidden bg-[rgba(255,255,255,0.1)] flex items-center justify-center text-2xl font-bold text-white shrink-0 border-2 border-[rgba(255,255,255,0.2)]">
            {profileBase64 ? (
              <img src={profileBase64} alt="profile" className="h-full w-full object-cover" />
            ) : (
              getInitials(basicDetails?.firstName, basicDetails?.lastName)
            )}
          </div>
          <h1 className="mt-4 m-0 text-center text-[1.15rem] font-bold text-white leading-tight">
            {basicDetails?.firstName} {basicDetails?.middleName} {basicDetails?.lastName}
          </h1>
          {workExperience?.[0]?.role && (
            <p className="mt-1 m-0 text-center text-[0.78rem] font-medium text-[#e6b8d8]">{workExperience[0].role}</p>
          )}
        </div>

        <div className="px-6 pb-6 flex flex-col gap-6">
          <div>
            <SideTitle>Contact</SideTitle>
            <div className="flex flex-col gap-3">
              {basicDetails?.city && (
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[rgba(255,255,255,0.1)] flex items-center justify-center text-[0.75rem] text-white shrink-0">
                    <EnvironmentOutlined />
                  </span>
                  <span className="text-[0.78rem] text-[#e6d5e2]">{basicDetails.city}</span>
                </div>
              )}
              {basicDetails?.phone && (
                <a href={`tel:${basicDetails.phone}`} className="flex items-center gap-3 no-underline">
                  <span className="w-6 h-6 rounded-full bg-[rgba(255,255,255,0.1)] flex items-center justify-center text-[0.75rem] text-white shrink-0">
                    <PhoneFilled />
                  </span>
                  <span className="text-[0.78rem] text-[#e6d5e2]">{basicDetails.phone}</span>
                </a>
              )}
              {basicDetails?.email && (
                <a href={`mailto:${basicDetails.email}`} className="flex items-center gap-3 no-underline">
                  <span className="w-6 h-6 rounded-full bg-[rgba(255,255,255,0.1)] flex items-center justify-center text-[0.75rem] text-white shrink-0">
                    <MailOutlined />
                  </span>
                  <span className="text-[0.78rem] text-[#e6d5e2] break-all">{basicDetails.email}</span>
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
                  <span className="text-[0.78rem] text-[#e6d5e2] break-all">{item.title || item.link}</span>
                </a>
              ))}
            </div>
          </div>

          {skills.filter(Boolean).length > 0 && (
            <div id="section-Skills" className={`p-2 -m-2 scroll-mt-8 ${sectionState("Skills")}`}>
              <SideTitle>Skills</SideTitle>
              <div className="flex flex-wrap gap-2">
                {skills.filter(Boolean).map((skill, index) => (
                  <span
                    key={index}
                    className="text-[0.72rem] font-medium text-white bg-[rgba(255,255,255,0.1)] rounded-full px-3 py-1"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {languages.filter(Boolean).length > 0 && (
            <div id="section-Languages" className={`p-2 -m-2 scroll-mt-8 ${sectionState("Languages")}`}>
              <SideTitle>Languages</SideTitle>
              <ul className="pl-4 space-y-1.5 text-[#e6d5e2] marker:text-[#c98bb9]">
                {languages.filter(Boolean).map((l, index) => {
                  const name = typeof l === "object" && l !== null ? l.name : l;
                  return (
                    <li key={index} className="text-[0.78rem]">{name}</li>
                  );
                })}
              </ul>
            </div>
          )}

          {certificates.filter((c) => c?.name || c?.organization).length > 0 && (
            <div id="section-Certifications" className={`p-2 -m-2 scroll-mt-8 ${sectionState("Certifications")}`}>
              <SideTitle>Certifications</SideTitle>
              <div className="flex flex-col gap-2.5">
                {certificates.filter((c) => c?.name || c?.organization).map((item, index) => (
                  <div key={index}>
                    <p className="m-0 text-[0.78rem] font-semibold text-white">{item?.name}</p>
                    <p className="m-0 text-[0.72rem] text-[#c8a6c0]">{item?.organization}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right column */}
      <div className="p-8 space-y-7">
        <div id="section-Basic-Details" className={`p-2 -m-2 scroll-mt-8 ${sectionState("Basic Details")}`} />

        {basicDetails?.professionalSummary && (
          <section>
            <MainTitle>Professional Summary</MainTitle>
            <div
              className="text-[0.85rem] leading-6 text-[#52525b]"
              dangerouslySetInnerHTML={{ __html: asHtmlString(basicDetails.professionalSummary) }}
            />
          </section>
        )}

        {workExperience.length > 0 && (
          <section id="section-Experience" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Experience")}`}>
            <MainTitle>Experience</MainTitle>
            <div className="flex flex-col">
              {workExperience.map((item, index) => (
                <TimelineEntry
                  key={index}
                  title={item?.role}
                  subtitle={item?.company}
                  meta={dateRange(item)}
                >
                  {item?.description && (
                    <div
                      className="mt-1.5 text-[0.83rem]"
                      dangerouslySetInnerHTML={{ __html: asHtmlString(item.description) }}
                    />
                  )}
                </TimelineEntry>
              ))}
            </div>
          </section>
        )}

        {internshipDetails.length > 0 && (
          <section id="section-Internships" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Internships")}`}>
            <MainTitle>Internships</MainTitle>
            <div className="flex flex-col">
              {internshipDetails.map((item, index) => (
                <TimelineEntry
                  key={index}
                  title={item?.role}
                  subtitle={item?.company}
                  meta={dateRange(item)}
                >
                  {item?.description && (
                    <div
                      className="mt-1.5 text-[0.83rem]"
                      dangerouslySetInnerHTML={{ __html: asHtmlString(item.description) }}
                    />
                  )}
                </TimelineEntry>
              ))}
            </div>
          </section>
        )}

        {projectDetails.filter((item) => item?.project).length > 0 && (
          <section id="section-Projects" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Projects")}`}>
            <MainTitle>Projects</MainTitle>
            <div className="flex flex-col">
              {projectDetails.filter((item) => item?.project).map((item, index) => (
                <TimelineEntry
                  key={index}
                  title={item.project}
                  subtitle={item?.company}
                  meta={`${item?.startDate || ""}${item?.endDate ? ` – ${item.endDate}` : ""}`}
                >
                  {item?.description && (
                    <div
                      className="mt-1.5 text-[0.83rem]"
                      dangerouslySetInnerHTML={{ __html: parseIfJson(item.description) }}
                    />
                  )}
                </TimelineEntry>
              ))}
            </div>
          </section>
        )}

        {accDetails.filter((a) => a?.accomplishment || a?.description).length > 0 && (
          <section id="section-Accomplishments" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Accomplishments")}`}>
            <MainTitle>Achievements</MainTitle>
            <ul className="pl-4 space-y-1.5 marker:text-[#a3336f]">
              {accDetails.filter((a) => a?.accomplishment || a?.description).map((item, index) => (
                <li key={index} className="text-[0.83rem] text-[#3f3f46]">
                  <span className="font-semibold text-[#28131f]">{item?.accomplishment}</span>
                  {item?.description ? ` — ${item.description}` : ""}
                </li>
              ))}
            </ul>
          </section>
        )}

        {educationDetails.length > 0 && (
          <section id="section-Education" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Education")}`}>
            <MainTitle>Education</MainTitle>
            <div className="flex flex-col">
              {educationDetails.map((item, index) => (
                <TimelineEntry
                  key={index}
                  title={item?.type}
                  subtitle={item?.school || item?.board}
                  meta={`${item?.startDate || ""} – ${item?.endDate || ""}`}
                />
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
                  <p className="m-0 text-[0.85rem] font-semibold text-[#28131f]">
                    {item?.volunteering}{item?.organization ? `, ${item.organization}` : ""}
                  </p>
                  <div className="mt-1 text-[0.82rem] text-[#52525b]" dangerouslySetInnerHTML={{ __html: asHtmlString(item?.description) }} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Template21;
