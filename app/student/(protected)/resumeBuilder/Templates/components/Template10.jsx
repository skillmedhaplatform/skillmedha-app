"use client";

import React from "react";
import { MailOutlined, PhoneFilled, EnvironmentOutlined } from "@ant-design/icons";
import { parseIfJson } from "@/app/student/(protected)/jobAssessments/reusable_comp/jsonparse";
import {
  asHtmlString,
  normalizeExternalLink,
  useProfileImage,
  useResumeTemplateData,
} from "./resumeTemplateData";

/**
 * Template17 — "Timeline Modern"
 * One of the most common resume-builder patterns (Novoresume/Zety style):
 * a single connected vertical line with dot markers running through
 * Experience and Education, chip-style Skills/Languages at the bottom.
 */
const Template17 = ({ resumeTemplateRef, activeSection, isGeneratingPdf }) => {
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
    activeSection === sectionName ? "bg-[#eff6ff] rounded-md" : "";

  const SectionTitle = ({ children }) => (
    <h2 className="m-0 mb-4 text-[0.95rem] font-bold uppercase tracking-[0.1em] text-[#1d4ed8]">
      {children}
    </h2>
  );

  const TimelineItem = ({ title, subtitle, date, description, isProject }) => (
    <div className="relative pl-8 pb-6 last:pb-0 border-l-2 border-[#dbeafe] last:border-transparent">
      <span className="absolute -left-[7px] top-0.5 w-3 h-3 rounded-full bg-[#1d4ed8] ring-4 ring-[#dbeafe]" />
      <div className="flex flex-wrap items-center gap-x-4">
        <h3 className="m-0 text-[0.95rem] font-bold text-[#0f172a]">{title}</h3>
        <p className="m-0 text-[0.8rem] font-semibold text-[#1d4ed8] whitespace-nowrap">{date}</p>
      </div>
      {subtitle && <p className="m-0 text-[0.85rem] text-[#475569]">{subtitle}</p>}
      {description && (
        isProject ? (
          <div className="mt-1" dangerouslySetInnerHTML={{ __html: description }} />
        ) : (
          <div className="mt-1" dangerouslySetInnerHTML={{ __html: description }} />
        )
      )}
    </div>
  );

  return (
    <div
      ref={resumeTemplateRef}
      className={`${isGeneratingPdf ? "w-[50rem] max-w-[50rem]" : "w-full max-w-full"} mx-auto overflow-y-scroll bg-white px-10 py-10 font-['Inter',sans-serif] text-[#334155] [&::-webkit-scrollbar]:w-[1px] [&::-webkit-scrollbar-thumb]:bg-transparent [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_li]:text-[0.88rem] [&_li]:leading-6`}
    >
      <header
        id="section-Basic-Details"
        className={`flex flex-wrap items-center gap-4 pb-6 p-4 -m-4 scroll-mt-8 ${sectionState("Basic Details")}`}
      >
        <div>
          <h1 className="m-0 text-[2.1rem] font-bold text-[#0f172a]">
            {basicDetails?.firstName} {basicDetails?.middleName} {basicDetails?.lastName}
          </h1>
          {basicDetails?.designation && (
            <p className="m-0 mt-1 text-[0.95rem] font-medium text-[#1d4ed8]">{basicDetails.designation}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[0.85rem] text-[#64748b]">
            {basicDetails?.phone && (
              <a href={`tel:${basicDetails.phone}`} className="flex items-center gap-1.5 no-underline text-[#64748b]">
                <PhoneFilled /> <span>{basicDetails.phone}</span>
              </a>
            )}
            {basicDetails?.email && (
              <a href={`mailto:${basicDetails.email}`} className="flex items-center gap-1.5 no-underline text-[#64748b]">
                <MailOutlined /> <span>{basicDetails.email}</span>
              </a>
            )}
            {basicDetails?.city && (
              <span className="flex items-center gap-1.5">
                <EnvironmentOutlined /> <span>{basicDetails.city}</span>
              </span>
            )}
            {links.filter((item) => item?.link).slice(0, 2).map((item, index) => (
              <a
                key={index}
                href={normalizeExternalLink(item.link)}
                target="_blank"
                rel="noopener noreferrer"
                className="no-underline text-[#1d4ed8] break-all"
              >
                {item.title || item.link}
              </a>
            ))}
          </div>
        </div>
        {profileBase64 && (
          <img
            src={profileBase64}
            alt="profile"
            width="88"
            height="88"
            className="rounded-full object-cover border-4 border-[#dbeafe]"
          />
        )}
      </header>

      <div className="space-y-7">
        {basicDetails?.professionalSummary && (
          <section>
            <SectionTitle>Summary</SectionTitle>
            <div
              className="text-[0.9rem] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: asHtmlString(basicDetails.professionalSummary) }}
            />
          </section>
        )}

        {workExperience.length > 0 && (
          <section id="section-Experience" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Experience")}`}>
            <SectionTitle>Experience</SectionTitle>
            <div>
              {workExperience.map((item, index) => (
                <TimelineItem
                  key={index}
                  title={item?.role}
                  subtitle={item?.company}
                  date={`${item?.start || item?.startDate || ""} – ${item?.end || item?.endDate || "Present"}`}
                  description={item?.description ? asHtmlString(item.description) : null}
                />
              ))}
            </div>
          </section>
        )}

        {internshipDetails.length > 0 && (
          <section id="section-Internships" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Internships")}`}>
            <SectionTitle>Internships</SectionTitle>
            <div>
              {internshipDetails.map((item, index) => (
                <TimelineItem
                  key={index}
                  title={item?.role}
                  subtitle={item?.company}
                  date={`${item?.start || item?.startDate || ""} – ${item?.end || item?.endDate || "Present"}`}
                  description={item?.description ? asHtmlString(item.description) : null}
                />
              ))}
            </div>
          </section>
        )}

        {educationDetails.length > 0 && (
          <section id="section-Education" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Education")}`}>
            <SectionTitle>Education</SectionTitle>
            <div>
              {educationDetails.map((item, index) => (
                <TimelineItem
                  key={index}
                  title={item?.type}
                  subtitle={item?.school || item?.board}
                  date={`${item?.startDate || ""} – ${item?.endDate || ""}`}
                  description={item?.description ? `<p class="m-0 text-[0.88rem] leading-6">${item.description}</p>` : null}
                />
              ))}
            </div>
          </section>
        )}

        {projectDetails.filter((item) => item?.project).length > 0 && (
          <section id="section-Projects" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Projects")}`}>
            <SectionTitle>Projects</SectionTitle>
            <div>
              {projectDetails.filter((item) => item?.project).map((item, index) => (
                <TimelineItem
                  key={index}
                  title={item.project}
                  subtitle={item?.company}
                  date={`${item?.startDate || ""} ${item?.endDate ? `– ${item.endDate}` : ""}`}
                  description={parseIfJson(item?.description)}
                  isProject
                />
              ))}
            </div>
          </section>
        )}

        {volunteerings.filter((item) => item?.organization || item?.volunteering).length > 0 && (
          <section id="section-Volunteering" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Volunteering")}`}>
            <SectionTitle>Volunteering</SectionTitle>
            <div>
              {volunteerings.filter((item) => item?.organization || item?.volunteering).map((item, index) => (
                <TimelineItem
                  key={index}
                  title={item?.volunteering}
                  subtitle={item?.organization}
                  date={`${item?.start || ""} – ${item?.end || ""}`}
                  description={item?.description ? asHtmlString(item.description) : null}
                />
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
          {skills.filter(Boolean).length > 0 && (
            <section id="section-Skills" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Skills")}`}>
              <SectionTitle>Skills</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {skills.filter(Boolean).map((skill, index) => (
                  <span key={index} className="text-[0.8rem] font-medium px-3 py-1 rounded-full bg-[#eff6ff] text-[#1d4ed8]">
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {languages.filter(Boolean).length > 0 && (
            <section id="section-Languages" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Languages")}`}>
              <SectionTitle>Languages</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {languages.filter(Boolean).map((language, index) => {
                  const isObject = typeof language === "object" && language !== null;
                  const name = isObject ? language.name : language;
                  const level = isObject ? language.level : null;
                  return (
                    <span key={index} className="text-[0.8rem] font-medium px-3 py-1 rounded-full bg-[#f0f9ff] text-[#0369a1]">
                      {name}{level ? ` · ${level}` : ""}
                    </span>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default Template17;