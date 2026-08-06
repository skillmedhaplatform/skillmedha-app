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
 * Template19 — "Diagonal Banner"
 * Common Canva-style pattern: a diagonal color block behind the header
 * (via clip-path) with the photo sitting on it, clean single column below.
 */
const Template19 = ({ resumeTemplateRef, activeSection, isGeneratingPdf }) => {
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
    activeSection === sectionName ? "bg-[#fdf2f8] rounded-md" : "";

  const SectionTitle = ({ children }) => (
    <div className="flex items-center gap-2 mb-3">
      <span className="w-1.5 h-5 bg-[#db2777] rounded-sm" />
      <h2 className="m-0 text-[0.95rem] font-bold uppercase tracking-[0.08em] text-[#500724]">{children}</h2>
    </div>
  );

  return (
    <div
      ref={resumeTemplateRef}
      className={`${isGeneratingPdf ? "w-[50rem] max-w-[50rem]" : "w-full max-w-full"} mx-auto overflow-y-scroll bg-white font-['Inter',sans-serif] text-[#3f3f46] [&::-webkit-scrollbar]:w-[1px] [&::-webkit-scrollbar-thumb]:bg-transparent [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_li]:text-[0.87rem] [&_li]:leading-6`}
    >
      <header
        id="section-Basic-Details"
        className={`relative overflow-hidden px-10 pt-10 pb-14 scroll-mt-8 ${activeSection === "Basic Details" ? "ring-2 ring-inset ring-[#db2777]" : ""}`}
      >
        <div
          className="absolute inset-0 -z-10"
          style={{
            background: "linear-gradient(135deg, #831843 0%, #be185d 45%, #db2777 100%)",
            clipPath: "polygon(0 0, 100% 0, 100% 65%, 0 100%)",
          }}
        />
        <div className="flex items-center gap-6">
          {profileBase64 && (
            <img
              src={profileBase64}
              alt="profile"
              width="96"
              height="96"
              className="rounded-full object-cover border-4 border-white shrink-0"
            />
          )}
          <div>
            <h1 className="m-0 text-[2.1rem] font-extrabold text-white">
              {basicDetails?.firstName} {basicDetails?.middleName} {basicDetails?.lastName}
            </h1>
            {basicDetails?.designation && (
              <p className="m-0 mt-1 text-[0.95rem] font-medium text-[#fce7f3] uppercase tracking-[0.06em]">
                {basicDetails.designation}
              </p>
            )}
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-1.5 text-[0.85rem] text-[rgba(255,255,255,0.9)]">
          {basicDetails?.phone && (
            <a href={`tel:${basicDetails.phone}`} className="flex items-center gap-1.5 no-underline text-[rgba(255,255,255,0.9)]">
              <PhoneFilled /> <span>{basicDetails.phone}</span>
            </a>
          )}
          {basicDetails?.email && (
            <a href={`mailto:${basicDetails.email}`} className="flex items-center gap-1.5 no-underline text-[rgba(255,255,255,0.9)]">
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
              className="no-underline text-white break-all underline decoration-[#fbcfe8]"
            >
              {item.title || item.link}
            </a>
          ))}
        </div>
      </header>

      <div className="px-10 pb-9 pt-2 space-y-6">
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
            <div className="space-y-4">
              {workExperience.map((item, index) => (
                <div key={index}>
                  <div className="flex flex-wrap items-center gap-x-4">
                    <h3 className="m-0 text-[0.95rem] font-bold text-[#500724]">{item?.role}, {item?.company}</h3>
                    <p className="m-0 text-[0.8rem] font-semibold text-[#db2777] whitespace-nowrap">
                      {item?.start || item?.startDate} – {item?.end || item?.endDate || "Present"}
                    </p>
                  </div>
                  {item?.description && (
                    <div className="mt-1" dangerouslySetInnerHTML={{ __html: asHtmlString(item.description) }} />
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
                    <h3 className="m-0 text-[0.95rem] font-bold text-[#500724]">{item?.role}, {item?.company}</h3>
                    <p className="m-0 text-[0.8rem] font-semibold text-[#db2777] whitespace-nowrap">
                      {item?.start || item?.startDate} – {item?.end || item?.endDate || "Present"}
                    </p>
                  </div>
                  {item?.description && (
                    <div className="mt-1" dangerouslySetInnerHTML={{ __html: asHtmlString(item.description) }} />
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {educationDetails.length > 0 && (
            <section id="section-Education" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Education")}`}>
              <SectionTitle>Education</SectionTitle>
              <div className="space-y-3">
                {educationDetails.map((item, index) => (
                  <div key={index}>
                    <h3 className="m-0 text-[0.9rem] font-bold text-[#500724]">{item?.type}</h3>
                    <p className="m-0 text-[0.83rem] text-[#57534e]">{item?.school || item?.board}</p>
                    <p className="m-0 text-[0.78rem] text-[#db2777]">{item?.startDate} – {item?.endDate}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {projectDetails.filter((item) => item?.project).length > 0 && (
            <section id="section-Projects" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Projects")}`}>
              <SectionTitle>Projects</SectionTitle>
              <div className="space-y-3">
                {projectDetails.filter((item) => item?.project).map((item, index) => (
                  <div key={index}>
                    <h3 className="m-0 text-[0.9rem] font-bold text-[#500724]">{item.project}</h3>
                    {item?.company && <p className="m-0 text-[0.83rem] text-[#57534e]">{item.company}</p>}
                    <div className="mt-1 text-[0.85rem]" dangerouslySetInnerHTML={{ __html: parseIfJson(item?.description) }} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {volunteerings.filter((item) => item?.organization || item?.volunteering).length > 0 && (
          <section id="section-Volunteering" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Volunteering")}`}>
            <SectionTitle>Volunteering</SectionTitle>
            <div className="space-y-4">
              {volunteerings.filter((item) => item?.organization || item?.volunteering).map((item, index) => (
                <div key={index}>
                  <h3 className="m-0 text-[0.92rem] font-bold text-[#500724]">
                    {item?.volunteering}{item?.organization ? `, ${item.organization}` : ""}
                  </h3>
                  <div className="mt-1" dangerouslySetInnerHTML={{ __html: asHtmlString(item?.description) }} />
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
                <span key={index} className="text-[0.8rem] font-medium px-3 py-1 rounded-full bg-[#fdf2f8] text-[#be185d]">
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
                  <span key={index} className="text-[0.8rem] font-medium px-3 py-1 rounded-full bg-[#fff1f2] text-[#9f1239]">
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

export default Template19;