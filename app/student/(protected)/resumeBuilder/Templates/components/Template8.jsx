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
 * Template12 — "Metro Professional"
 * Bold sans-serif name, thin indigo accent rule, structured section grid
 * with small square markers, right-aligned dates. Clean corporate feel
 * without a sidebar or color blocks — closest to a "safe default" pick.
 */
const Template12 = ({ resumeTemplateRef, activeSection, isGeneratingPdf }) => {
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
    activeSection === sectionName ? "bg-[#eef2ff] rounded-md" : "";

  const SectionTitle = ({ children }) => (
    <div className="flex items-center gap-2 mb-3">
      <span className="w-2.5 h-2.5 bg-[#4338ca]" />
      <h2 className="m-0 text-[0.9rem] font-bold uppercase tracking-[0.08em] text-[#1e1b4b]">{children}</h2>
    </div>
  );

  return (
    <div
      ref={resumeTemplateRef}
      className={`${isGeneratingPdf ? "w-[50rem] max-w-[50rem]" : "w-full max-w-full"} mx-auto overflow-y-scroll bg-white px-10 py-10 font-['Inter',sans-serif] text-[#1f2937] [&::-webkit-scrollbar]:w-[1px] [&::-webkit-scrollbar-thumb]:bg-transparent [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_li]:text-[0.88rem] [&_li]:leading-6`}
    >
      <header
        id="section-Basic-Details"
        className={`pb-6 p-4 -m-4 scroll-mt-8 ${sectionState("Basic Details")}`}
      >
        <h1 className="m-0 text-[2.3rem] font-extrabold tracking-tight text-[#1e1b4b]">
          {basicDetails?.firstName} {basicDetails?.middleName} {basicDetails?.lastName}
        </h1>
        {basicDetails?.designation && (
          <p className="m-0 mt-1 text-[0.95rem] font-semibold text-[#4338ca] uppercase tracking-[0.06em]">
            {basicDetails.designation}
          </p>
        )}
        <div className="mt-3 h-[3px] w-full bg-gradient-to-r from-[#4338ca] to-transparent" />
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1.5 text-[0.85rem] text-[#4b5563]">
          {basicDetails?.phone && (
            <a href={`tel:${basicDetails.phone}`} className="flex items-center gap-1.5 no-underline text-[#4b5563]">
              <PhoneFilled className="text-[#4338ca]" /> <span>{basicDetails.phone}</span>
            </a>
          )}
          {basicDetails?.email && (
            <a href={`mailto:${basicDetails.email}`} className="flex items-center gap-1.5 no-underline text-[#4b5563]">
              <MailOutlined className="text-[#4338ca]" /> <span>{basicDetails.email}</span>
            </a>
          )}
          {basicDetails?.city && (
            <span className="flex items-center gap-1.5">
              <EnvironmentOutlined className="text-[#4338ca]" /> <span>{basicDetails.city}</span>
            </span>
          )}
          {links.filter((item) => item?.link).slice(0, 2).map((item, index) => (
            <a
              key={index}
              href={normalizeExternalLink(item.link)}
              target="_blank"
              rel="noopener noreferrer"
              className="no-underline text-[#4338ca] break-all font-medium"
            >
              {item.title || item.link}
            </a>
          ))}
        </div>
      </header>

      <div className="space-y-6">
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
                <div key={index} className="pl-4 border-l-2 border-[#e0e7ff]">
                  <div className="flex flex-wrap justify-between gap-x-4">
                    <h3 className="m-0 text-[0.95rem] font-bold text-[#1e1b4b]">{item?.role} · {item?.company}</h3>
                    <p className="m-0 text-[0.8rem] font-semibold text-[#4338ca] whitespace-nowrap">
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
                <div key={index} className="pl-4 border-l-2 border-[#e0e7ff]">
                  <div className="flex flex-wrap justify-between gap-x-4">
                    <h3 className="m-0 text-[0.95rem] font-bold text-[#1e1b4b]">{item?.role} · {item?.company}</h3>
                    <p className="m-0 text-[0.8rem] font-semibold text-[#4338ca] whitespace-nowrap">
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
                  <div key={index} className="pl-4 border-l-2 border-[#e0e7ff]">
                    <h3 className="m-0 text-[0.9rem] font-bold text-[#1e1b4b]">{item?.type}</h3>
                    <p className="m-0 text-[0.83rem] text-[#4b5563]">{item?.school || item?.board}</p>
                    <p className="m-0 text-[0.78rem] text-[#818cf8]">{item?.startDate} – {item?.endDate}</p>
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
                  <div key={index} className="pl-4 border-l-2 border-[#e0e7ff]">
                    <h3 className="m-0 text-[0.9rem] font-bold text-[#1e1b4b]">{item.project}</h3>
                    {item?.company && <p className="m-0 text-[0.83rem] text-[#4b5563]">{item.company}</p>}
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
                <div key={index} className="pl-4 border-l-2 border-[#e0e7ff]">
                  <h3 className="m-0 text-[0.92rem] font-bold text-[#1e1b4b]">
                    {item?.volunteering}{item?.organization ? ` · ${item.organization}` : ""}
                  </h3>
                  <div className="mt-1" dangerouslySetInnerHTML={{ __html: asHtmlString(item?.description) }} />
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {skills.filter(Boolean).length > 0 && (
            <section id="section-Skills" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Skills")}`}>
              <SectionTitle>Skills</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {skills.filter(Boolean).map((skill, index) => (
                  <span key={index} className="text-[0.8rem] font-medium px-2.5 py-1 bg-[#eef2ff] text-[#4338ca] rounded">
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
                    <span key={index} className="text-[0.8rem] font-medium px-2.5 py-1 bg-[#f5f3ff] text-[#6d28d9] rounded">
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

export default Template12;