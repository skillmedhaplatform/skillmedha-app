"use client";

import React from "react";
import { MailOutlined, PhoneFilled, EnvironmentOutlined, GlobalOutlined, LinkedinFilled } from "@ant-design/icons";
import { parseIfJson } from "@/app/student/(protected)/jobAssessments/reusable_comp/jsonparse";
import {
  asHtmlString,
  normalizeExternalLink,
  useProfileImage,
  useResumeTemplateData,
} from "./resumeTemplateData";

/**
 * Template6 — "Modern Minimalist"
 * Two-column layout: a quiet charcoal sidebar (photo, contact, links,
 * skills, languages, certifications) beside a white main column carrying
 * every chronological section (summary, experience, internships,
 * education, projects, volunteering). Rebuilt on the shared
 * `useResumeTemplateData`/`useProfileImage` hooks so it gets full field
 * coverage and the same reliable photo handling as the rest of the set —
 * the previous version read straight from `useSelector` and silently
 * dropped internships, volunteering, and profile links.
 */

const ACCENT = "#0f766e";
const INK = "#111827";
const SUBTLE = "#6b7280";

const getInitials = (first, last) => `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase();

const Template6 = ({ resumeTemplateRef, activeSection, isGeneratingPdf }) => {
  const {
    basicDetails,
    educationDetails,
    workExperience,
    internshipDetails,
    projectDetails,
    certificates,
    skills,
    languages,
    links,
    volunteerings,
  } = useResumeTemplateData();
  const profileBase64 = useProfileImage(basicDetails?.profile);

  const profileLinks = links.filter((item) => item?.link);
  const linkIcons = [<LinkedinFilled key="li" />, <GlobalOutlined key="gl" />];

  const sectionState = (sectionName) =>
    activeSection === sectionName ? "bg-[#f0fdfa] rounded-md" : "";

  const SideTitle = ({ children }) => (
    <h2 className="m-0 mb-2 text-[0.72rem] font-bold uppercase tracking-[0.16em] text-[#5eead4] border-b border-[rgba(255,255,255,0.15)] pb-1.5">
      {children}
    </h2>
  );

  const MainTitle = ({ children }) => (
    <h2 className="m-0 mb-3 text-[0.92rem] font-bold uppercase tracking-[0.08em] text-[#111827] border-b-2 pb-1.5" style={{ borderColor: ACCENT }}>
      {children}
    </h2>
  );

  const dateRange = (item) =>
    `${item?.start || item?.startDate || ""} – ${item?.end || item?.endDate || "Present"}`;

  return (
    <div
      ref={resumeTemplateRef}
      className={`${isGeneratingPdf ? "w-[50rem] max-w-[50rem]" : "w-full max-w-full"} mx-auto overflow-y-scroll bg-white font-['Inter',sans-serif] text-[#374151] grid grid-cols-1 md:grid-cols-[14rem_1fr] [&::-webkit-scrollbar]:w-[1px] [&::-webkit-scrollbar-thumb]:bg-transparent [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_li]:text-[0.85rem] [&_li]:leading-6`}
    >
      {/* Sidebar */}
      <div className="bg-[#1f2937] p-6 flex flex-col gap-6">
        <div id="section-Basic-Details" className={`p-2 -m-2 scroll-mt-8 flex flex-col items-center text-center gap-3 ${sectionState("Basic Details")}`}>
          <div className="w-20 h-20 rounded-full overflow-hidden bg-[rgba(255,255,255,0.1)] flex items-center justify-center text-xl font-bold text-white shrink-0 border-2 border-[rgba(255,255,255,0.15)]">
            {profileBase64 ? (
              <img src={profileBase64} alt="profile" className="w-full h-full object-cover" />
            ) : (
              getInitials(basicDetails?.firstName, basicDetails?.lastName)
            )}
          </div>
          <h1 className="m-0 text-[1.1rem] font-bold text-white leading-tight">
            {basicDetails?.firstName} {basicDetails?.middleName} {basicDetails?.lastName}
          </h1>
          {workExperience?.[0]?.role && (
            <p className="m-0 text-[0.75rem] font-medium text-[#5eead4]">{workExperience[0].role}</p>
          )}
        </div>

        <div>
          <SideTitle>Contact</SideTitle>
          <div className="flex flex-col gap-2.5">
            {basicDetails?.email && (
              <a href={`mailto:${basicDetails.email}`} className="flex items-center gap-2 no-underline text-[0.78rem] text-[#e5e7eb] break-all">
                <MailOutlined className="text-[#5eead4]" /> <span>{basicDetails.email}</span>
              </a>
            )}
            {basicDetails?.phone && (
              <a href={`tel:${basicDetails.phone}`} className="flex items-center gap-2 no-underline text-[0.78rem] text-[#e5e7eb]">
                <PhoneFilled className="text-[#5eead4]" /> <span>{basicDetails.phone}</span>
              </a>
            )}
            {basicDetails?.city && (
              <span className="flex items-center gap-2 text-[0.78rem] text-[#e5e7eb]">
                <EnvironmentOutlined className="text-[#5eead4]" /> <span>{basicDetails.city}</span>
              </span>
            )}
            {profileLinks.slice(0, 2).map((item, index) => (
              <a
                key={index}
                href={normalizeExternalLink(item.link)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 no-underline text-[0.78rem] text-[#e5e7eb] break-all"
              >
                {linkIcons[index] || <GlobalOutlined className="text-[#5eead4]" />} <span>{item.title || item.link}</span>
              </a>
            ))}
          </div>
        </div>

        {skills.filter(Boolean).length > 0 && (
          <div id="section-Skills" className={`p-2 -m-2 scroll-mt-8 ${sectionState("Skills")}`}>
            <SideTitle>Skills</SideTitle>
            <div className="flex flex-wrap gap-1.5">
              {skills.filter(Boolean).map((skill, index) => (
                <span key={index} className="text-[0.72rem] font-medium text-white bg-[rgba(255,255,255,0.1)] rounded-full px-2.5 py-1">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {languages.filter(Boolean).length > 0 && (
          <div id="section-Languages" className={`p-2 -m-2 scroll-mt-8 ${sectionState("Languages")}`}>
            <SideTitle>Languages</SideTitle>
            <p className="m-0 text-[0.78rem] text-[#e5e7eb] leading-6">
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
                  <p className="m-0 text-[0.78rem] font-semibold text-white">{item?.name}</p>
                  <p className="m-0 text-[0.72rem] text-[#9ca3af]">{item?.organization}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main column */}
      <div className="p-8 space-y-6">
        {basicDetails?.professionalSummary && (
          <section>
            <MainTitle>Summary</MainTitle>
            <div
              className="text-[0.85rem] leading-6 text-[#374151]"
              dangerouslySetInnerHTML={{ __html: asHtmlString(basicDetails.professionalSummary) }}
            />
          </section>
        )}

        {workExperience.length > 0 && (
          <section id="section-Experience" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Experience")}`}>
            <MainTitle>Experience</MainTitle>
            <div className="space-y-4">
              {workExperience.map((item, index) => (
                <div key={index}>
                  <div className="flex flex-wrap items-center gap-x-3">
                    <h3 className="flex-1 min-w-0 m-0 text-[0.92rem] font-bold" style={{ color: INK }}>
                      {item?.role}
                      {item?.company && <span className="font-normal" style={{ color: SUBTLE }}>, {item.company}</span>}
                    </h3>
                    <span className="text-[0.78rem] font-semibold whitespace-nowrap" style={{ color: ACCENT }}>{dateRange(item)}</span>
                  </div>
                  {item?.description && (
                    <div className="mt-1 text-[0.83rem] leading-6" dangerouslySetInnerHTML={{ __html: asHtmlString(item.description) }} />
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {internshipDetails.length > 0 && (
          <section id="section-Internships" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Internships")}`}>
            <MainTitle>Internships</MainTitle>
            <div className="space-y-4">
              {internshipDetails.map((item, index) => (
                <div key={index}>
                  <div className="flex flex-wrap items-center gap-x-3">
                    <h3 className="flex-1 min-w-0 m-0 text-[0.92rem] font-bold" style={{ color: INK }}>
                      {item?.role}
                      {item?.company && <span className="font-normal" style={{ color: SUBTLE }}>, {item.company}</span>}
                    </h3>
                    <span className="text-[0.78rem] font-semibold whitespace-nowrap" style={{ color: ACCENT }}>{dateRange(item)}</span>
                  </div>
                  {item?.description && (
                    <div className="mt-1 text-[0.83rem] leading-6" dangerouslySetInnerHTML={{ __html: asHtmlString(item.description) }} />
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
                    <h3 className="flex-1 min-w-0 m-0 text-[0.92rem] font-bold" style={{ color: INK }}>
                      {item.project}
                      {item?.company && <span className="font-normal" style={{ color: SUBTLE }}> — {item.company}</span>}
                    </h3>
                    <span className="text-[0.78rem] font-semibold whitespace-nowrap" style={{ color: ACCENT }}>
                      {item?.startDate} {item?.endDate ? `– ${item.endDate}` : ""}
                    </span>
                  </div>
                  <div className="mt-1 text-[0.83rem] leading-6" dangerouslySetInnerHTML={{ __html: parseIfJson(item?.description) }} />
                </div>
              ))}
            </div>
          </section>
        )}

        {educationDetails.length > 0 && (
          <section id="section-Education" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Education")}`}>
            <MainTitle>Education</MainTitle>
            <div className="space-y-2">
              {educationDetails.map((item, index) => (
                <div key={index} className="flex flex-wrap items-center gap-x-3">
                  <h3 className="flex-1 min-w-0 m-0 text-[0.88rem] font-bold" style={{ color: INK }}>
                    {item?.type}{item?.school ? `, ${item.school}` : ""}
                  </h3>
                  <span className="text-[0.78rem] font-semibold whitespace-nowrap" style={{ color: ACCENT }}>
                    {item?.startDate} – {item?.endDate}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {volunteerings.filter((v) => v?.organization || v?.volunteering).length > 0 && (
          <section id="section-Volunteering" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Volunteering")}`}>
            <MainTitle>Volunteering</MainTitle>
            <div className="space-y-3">
              {volunteerings.filter((v) => v?.organization || v?.volunteering).map((item, index) => (
                <div key={index}>
                  <p className="m-0 text-[0.85rem] font-semibold" style={{ color: INK }}>
                    {item?.volunteering}{item?.organization ? `, ${item.organization}` : ""}
                  </p>
                  <div className="mt-1 text-[0.82rem] leading-6" style={{ color: SUBTLE }} dangerouslySetInnerHTML={{ __html: asHtmlString(item?.description) }} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Template6;
