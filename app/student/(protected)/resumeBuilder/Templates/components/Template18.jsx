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
 * Template18 — "Burgundy Grid"
 * Full-width header band (photo/initials, name, contact row) followed by
 * a symmetric two-column grid — unlike Template9's narrow/wide split with
 * a vertical rule, both columns here carry chronological content: left
 * runs Summary → Experience → Internships, right runs Education →
 * Projects → Skills/Languages → Volunteering. This file used to be a
 * byte-for-byte copy of Template9.jsx ("Bold Condensed"); the layout and
 * accent color below are deliberately different so the two are no longer
 * indistinguishable in the template picker.
 */

const ACCENT = "#9f1239";
const INK = "#1c1917";
const SUBTLE = "#78716c";

const getInitials = (first, last) => `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase();

const Template18 = ({ resumeTemplateRef, activeSection, isGeneratingPdf }) => {
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
    activeSection === sectionName ? "bg-[#fdf2f4] rounded-md" : "";

  const SectionTitle = ({ children }) => (
    <div className="flex items-center gap-2 mb-3">
      <span className="w-2 h-2" style={{ backgroundColor: ACCENT }} />
      <h2 className="m-0 text-[0.82rem] font-bold uppercase tracking-[0.1em]" style={{ color: INK }}>{children}</h2>
    </div>
  );

  const dateRange = (item) =>
    `${item?.start || item?.startDate || ""} – ${item?.end || item?.endDate || "Present"}`;

  return (
    <div
      ref={resumeTemplateRef}
      className={`${isGeneratingPdf ? "w-[50rem] max-w-[50rem]" : "w-full max-w-full"} mx-auto overflow-y-scroll bg-white font-['Inter',sans-serif] text-[#292524] [&::-webkit-scrollbar]:w-[1px] [&::-webkit-scrollbar-thumb]:bg-transparent [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_li]:text-[0.85rem] [&_li]:leading-6`}
    >
      <header
        id="section-Basic-Details"
        className={`flex flex-wrap items-center gap-5 px-10 py-8 scroll-mt-8 ${sectionState("Basic Details")}`}
        style={{ borderBottom: `4px solid ${ACCENT}` }}
      >
        <div className="w-[68px] h-[68px] rounded-lg overflow-hidden shrink-0 flex items-center justify-center text-xl font-bold text-white" style={{ backgroundColor: ACCENT }}>
          {profileBase64 ? (
            <img src={profileBase64} alt="profile" className="w-full h-full object-cover" />
          ) : (
            getInitials(basicDetails?.firstName, basicDetails?.lastName)
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="m-0 text-[1.7rem] font-black tracking-tight" style={{ color: INK }}>
            {basicDetails?.firstName} {basicDetails?.middleName} {basicDetails?.lastName}
          </h1>
          {workExperience?.[0]?.role && (
            <p className="m-0 mt-0.5 text-[0.9rem] font-semibold" style={{ color: ACCENT }}>{workExperience[0].role}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5 text-[0.8rem] items-start sm:items-end" style={{ color: SUBTLE }}>
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
      </header>

      {basicDetails?.professionalSummary && (
        <section className="px-10 pt-6">
          <div className="text-[0.88rem] leading-6" dangerouslySetInnerHTML={{ __html: asHtmlString(basicDetails.professionalSummary) }} />
        </section>
      )}

      <div className="px-10 py-8 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
        {/* Left column */}
        <div className="space-y-7">
          {workExperience.length > 0 && (
            <section id="section-Experience" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Experience")}`}>
              <SectionTitle>Experience</SectionTitle>
              <div className="space-y-4">
                {workExperience.map((item, index) => (
                  <div key={index}>
                    <div className="flex flex-wrap items-center gap-x-3">
                      <h3 className="flex-1 min-w-0 m-0 text-[0.9rem] font-bold" style={{ color: INK }}>
                        {item?.role}{item?.company ? <span className="font-normal" style={{ color: SUBTLE }}>, {item.company}</span> : ""}
                      </h3>
                      <span className="text-[0.76rem] font-semibold whitespace-nowrap" style={{ color: ACCENT }}>{dateRange(item)}</span>
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
              <SectionTitle>Internships</SectionTitle>
              <div className="space-y-4">
                {internshipDetails.map((item, index) => (
                  <div key={index}>
                    <div className="flex flex-wrap items-center gap-x-3">
                      <h3 className="flex-1 min-w-0 m-0 text-[0.9rem] font-bold" style={{ color: INK }}>
                        {item?.role}{item?.company ? <span className="font-normal" style={{ color: SUBTLE }}>, {item.company}</span> : ""}
                      </h3>
                      <span className="text-[0.76rem] font-semibold whitespace-nowrap" style={{ color: ACCENT }}>{dateRange(item)}</span>
                    </div>
                    {item?.description && (
                      <div className="mt-1 text-[0.83rem] leading-6" dangerouslySetInnerHTML={{ __html: asHtmlString(item.description) }} />
                    )}
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
        </div>

        {/* Right column */}
        <div className="space-y-7">
          {educationDetails.length > 0 && (
            <section id="section-Education" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Education")}`}>
              <SectionTitle>Education</SectionTitle>
              <div className="space-y-2">
                {educationDetails.map((item, index) => (
                  <div key={index}>
                    <h3 className="m-0 text-[0.88rem] font-bold" style={{ color: INK }}>{item?.type}</h3>
                    <p className="m-0 text-[0.8rem]" style={{ color: SUBTLE }}>{item?.school || item?.board}</p>
                    <p className="m-0 text-[0.76rem]" style={{ color: ACCENT }}>{item?.startDate} – {item?.endDate}</p>
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
                    <div className="flex flex-wrap items-center gap-x-3">
                      <h3 className="flex-1 min-w-0 m-0 text-[0.88rem] font-bold" style={{ color: INK }}>{item.project}</h3>
                      <span className="text-[0.76rem] whitespace-nowrap" style={{ color: ACCENT }}>
                        {item?.startDate} {item?.endDate ? `– ${item.endDate}` : ""}
                      </span>
                    </div>
                    {item?.company && <p className="m-0 text-[0.8rem]" style={{ color: SUBTLE }}>{item.company}</p>}
                    <div className="mt-1 text-[0.83rem] leading-6" dangerouslySetInnerHTML={{ __html: parseIfJson(item?.description) }} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {certificates.filter((c) => c?.name || c?.organization).length > 0 && (
            <section id="section-Certifications" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Certifications")}`}>
              <SectionTitle>Certifications</SectionTitle>
              <div className="space-y-2">
                {certificates.filter((c) => c?.name || c?.organization).map((item, index) => (
                  <div key={index}>
                    <p className="m-0 text-[0.82rem] font-semibold" style={{ color: INK }}>{item?.name}</p>
                    <p className="m-0 text-[0.76rem]" style={{ color: SUBTLE }}>{item?.organization}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {skills.filter(Boolean).length > 0 && (
            <section id="section-Skills" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Skills")}`}>
              <SectionTitle>Skills</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {skills.filter(Boolean).map((skill, index) => (
                  <span key={index} className="text-[0.76rem] font-medium rounded px-2.5 py-1" style={{ color: ACCENT, backgroundColor: "#fdf2f4" }}>
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {languages.filter(Boolean).length > 0 && (
            <section id="section-Languages" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Languages")}`}>
              <SectionTitle>Languages</SectionTitle>
              <p className="m-0 text-[0.82rem]" style={{ color: "#3f3a35" }}>
                {languages.filter(Boolean).map((l) => (typeof l === "object" && l !== null ? l.name : l)).join(", ")}
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default Template18;
