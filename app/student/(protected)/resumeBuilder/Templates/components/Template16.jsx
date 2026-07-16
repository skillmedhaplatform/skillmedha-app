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
 * Template16 — "Rust Editorial"
 * Single column, no sidebar: a bold name/photo header on a warm rust
 * accent, then chronological sections with thin rust-underlined labels.
 * Rebuilt on the shared `useResumeTemplateData`/`useProfileImage` hooks
 * (the previous version read straight from `useSelector`, which worked
 * but had no accent color anywhere and applied a heavy 0.2rem
 * letter-spacing to every body paragraph — a copy-paste artifact from a
 * heading style that made ordinary description text look stretched out).
 */

const ACCENT = "#b45309";
const INK = "#1c1917";
const SUBTLE = "#78716c";

const getInitials = (first, last) => `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase();

const Template16 = ({ resumeTemplateRef, activeSection, isGeneratingPdf }) => {
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
    activeSection === sectionName ? "bg-[#fef3e8] rounded-md" : "";

  const SectionTitle = ({ children }) => (
    <h2 className="m-0 mb-3 text-[0.85rem] font-bold uppercase tracking-[0.1em] pb-1.5 border-b-2" style={{ color: INK, borderColor: ACCENT }}>
      {children}
    </h2>
  );

  const dateRange = (item) =>
    `${item?.start || item?.startDate || ""} – ${item?.end || item?.endDate || "Present"}`;

  return (
    <div
      ref={resumeTemplateRef}
      className={`${isGeneratingPdf ? "w-[50rem] max-w-[50rem]" : "w-full max-w-full"} mx-auto overflow-y-scroll bg-white font-['Inter',sans-serif] text-[#3f3a35] [&::-webkit-scrollbar]:w-[1px] [&::-webkit-scrollbar-thumb]:bg-transparent [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_li]:text-[0.85rem] [&_li]:leading-6`}
    >
      <header
        id="section-Basic-Details"
        className={`flex items-center gap-5 px-10 py-8 scroll-mt-8 ${activeSection === "Basic Details" ? "bg-[#fef3e8]" : ""}`}
        style={{ backgroundColor: activeSection === "Basic Details" ? undefined : "#fdf8f3" }}
      >
        <div className="w-20 h-20 rounded-full overflow-hidden shrink-0 flex items-center justify-center text-2xl font-bold text-white" style={{ backgroundColor: ACCENT }}>
          {profileBase64 ? (
            <img src={profileBase64} alt="profile" className="w-full h-full object-cover" />
          ) : (
            getInitials(basicDetails?.firstName, basicDetails?.lastName)
          )}
        </div>
        <div className="min-w-0">
          <h1 className="m-0 text-[1.8rem] font-bold" style={{ color: INK }}>
            {basicDetails?.firstName} {basicDetails?.middleName} {basicDetails?.lastName}
          </h1>
          {workExperience?.[0]?.role && (
            <p className="m-0 mt-0.5 text-[0.9rem] font-semibold" style={{ color: ACCENT }}>{workExperience[0].role}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[0.8rem]" style={{ color: SUBTLE }}>
            {basicDetails?.email && (
              <a href={`mailto:${basicDetails.email}`} className="flex items-center gap-1.5 no-underline break-all" style={{ color: SUBTLE }}>
                <MailOutlined /> <span>{basicDetails.email}</span>
              </a>
            )}
            {basicDetails?.phone && (
              <a href={`tel:${basicDetails.phone}`} className="flex items-center gap-1.5 no-underline" style={{ color: SUBTLE }}>
                <PhoneFilled /> <span>{basicDetails.phone}</span>
              </a>
            )}
            {basicDetails?.city && (
              <span className="flex items-center gap-1.5">
                <EnvironmentOutlined /> <span>{basicDetails.city}</span>
              </span>
            )}
            {profileLinks.slice(0, 2).map((item, index) => (
              <a
                key={index}
                href={normalizeExternalLink(item.link)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 no-underline break-all"
                style={{ color: ACCENT }}
              >
                {linkIcons[index] || <GlobalOutlined />} <span>{item.title || item.link}</span>
              </a>
            ))}
          </div>
        </div>
      </header>

      <div className="px-10 pb-10 pt-6 space-y-6">
        {basicDetails?.professionalSummary && (
          <section>
            <SectionTitle>Summary</SectionTitle>
            <div className="text-[0.88rem] leading-6" dangerouslySetInnerHTML={{ __html: asHtmlString(basicDetails.professionalSummary) }} />
          </section>
        )}

        {workExperience.length > 0 && (
          <section id="section-Experience" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Experience")}`}>
            <SectionTitle>Experience</SectionTitle>
            <div className="space-y-4">
              {workExperience.map((item, index) => (
                <div key={index}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <h3 className="m-0 text-[0.92rem] font-bold" style={{ color: INK }}>
                      {item?.role}{item?.company ? <span className="font-normal" style={{ color: SUBTLE }}>, {item.company}</span> : ""}
                    </h3>
                    <span className="text-[0.78rem] font-semibold whitespace-nowrap" style={{ color: ACCENT }}>{dateRange(item)}</span>
                  </div>
                  {item?.description && (
                    <div className="mt-1 text-[0.85rem] leading-6" dangerouslySetInnerHTML={{ __html: asHtmlString(item.description) }} />
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
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <h3 className="m-0 text-[0.92rem] font-bold" style={{ color: INK }}>
                      {item?.role}{item?.company ? <span className="font-normal" style={{ color: SUBTLE }}>, {item.company}</span> : ""}
                    </h3>
                    <span className="text-[0.78rem] font-semibold whitespace-nowrap" style={{ color: ACCENT }}>{dateRange(item)}</span>
                  </div>
                  {item?.description && (
                    <div className="mt-1 text-[0.85rem] leading-6" dangerouslySetInnerHTML={{ __html: asHtmlString(item.description) }} />
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
                  <h3 className="m-0 text-[0.88rem] font-bold" style={{ color: INK }}>
                    {item?.type}{item?.school ? `, ${item.school}` : ""}
                    {item?.grade ? ` — ${item.grade}${item?.gradeType === "percentage" ? "%" : item?.gradeType ? "/10" : ""}` : ""}
                  </h3>
                  <span className="text-[0.78rem] font-semibold whitespace-nowrap" style={{ color: ACCENT }}>
                    {item?.startDate} – {item?.endDate}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {projectDetails.filter((p) => p?.project).length > 0 && (
          <section id="section-Projects" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Projects")}`}>
            <SectionTitle>Projects</SectionTitle>
            <div className="space-y-4">
              {projectDetails.filter((p) => p?.project).map((item, index) => (
                <div key={index}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <h3 className="m-0 text-[0.92rem] font-bold" style={{ color: INK }}>
                      {item.project}{item?.company ? <span className="font-normal" style={{ color: SUBTLE }}> — {item.company}</span> : ""}
                    </h3>
                    <span className="text-[0.78rem] font-semibold whitespace-nowrap" style={{ color: ACCENT }}>
                      {item?.startDate} {item?.endDate ? `– ${item.endDate}` : ""}
                    </span>
                  </div>
                  <div className="mt-1 text-[0.85rem] leading-6" dangerouslySetInnerHTML={{ __html: parseIfJson(item?.description) }} />
                </div>
              ))}
            </div>
          </section>
        )}

        {certificates.filter((c) => c?.name || c?.organization).length > 0 && (
          <section id="section-Certifications" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Certifications")}`}>
            <SectionTitle>Certifications</SectionTitle>
            <div className="space-y-3">
              {certificates.filter((c) => c?.name || c?.organization).map((item, index) => (
                <div key={index} className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <div>
                    <p className="m-0 text-[0.85rem] font-bold" style={{ color: INK }}>
                      {item?.name}{item?.organization ? `, ${item.organization}` : ""}
                    </p>
                    {(item?.credentialId || item?.credentialUrl) && (
                      <p className="m-0 mt-0.5 text-[0.76rem]" style={{ color: SUBTLE }}>
                        {item?.credentialId ? `ID: ${item.credentialId}` : ""}
                        {item?.credentialId && item?.credentialUrl ? " · " : ""}
                        {item?.credentialUrl && (
                          <a href={item.credentialUrl} target="_blank" rel="noopener noreferrer" style={{ color: ACCENT }}>
                            {item.credentialUrl}
                          </a>
                        )}
                      </p>
                    )}
                  </div>
                  <span className="text-[0.76rem] whitespace-nowrap" style={{ color: SUBTLE }}>
                    {item?.issueDate}{item?.expiryDate ? ` – ${item.expiryDate}` : ""}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {volunteerings.filter((v) => v?.organization || v?.volunteering).length > 0 && (
          <section id="section-Volunteering" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Volunteering")}`}>
            <SectionTitle>Volunteering</SectionTitle>
            <div className="space-y-3">
              {volunteerings.filter((v) => v?.organization || v?.volunteering).map((item, index) => (
                <div key={index}>
                  <p className="m-0 text-[0.85rem] font-bold" style={{ color: INK }}>
                    {item?.volunteering}{item?.organization ? `, ${item.organization}` : ""}
                  </p>
                  <div className="mt-1 text-[0.82rem] leading-6" style={{ color: SUBTLE }} dangerouslySetInnerHTML={{ __html: asHtmlString(item?.description) }} />
                </div>
              ))}
            </div>
          </section>
        )}

        {(skills.filter(Boolean).length > 0 || languages.filter(Boolean).length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {skills.filter(Boolean).length > 0 && (
              <section id="section-Skills" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Skills")}`}>
                <SectionTitle>Skills</SectionTitle>
                <div className="flex flex-wrap gap-2">
                  {skills.filter(Boolean).map((skill, index) => (
                    <span key={index} className="text-[0.78rem] font-medium rounded-full px-3 py-1" style={{ color: ACCENT, backgroundColor: "#fef3e8" }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {languages.filter(Boolean).length > 0 && (
              <section id="section-Languages" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Languages")}`}>
                <SectionTitle>Languages</SectionTitle>
                <p className="m-0 text-[0.85rem] leading-6" style={{ color: "#3f3a35" }}>
                  {languages.filter(Boolean).map((l) => (typeof l === "object" && l !== null ? l.name : l)).join(", ")}
                </p>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Template16;
