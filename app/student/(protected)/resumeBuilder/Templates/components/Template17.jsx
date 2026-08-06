"use client";

import React from "react";
import { GithubOutlined, GlobalOutlined, LinkedinFilled, MailOutlined, PhoneFilled } from "@ant-design/icons";
import {
  asHtmlString,
  normalizeExternalLink,
  useProfileImage,
  useResumeTemplateData,
} from "./resumeTemplateData";

const sectionClass =
  "transition-all duration-300 rounded-lg p-3 -m-3 mb-3 scroll-mt-8";

const Template1 = ({ downloadImage, resumeTemplateRef, activeSection, isGeneratingPdf }) => {
  const {
    basicDetails,
    educationDetails,
    workExperience,
    internshipDetails,
    projectDetails,
    skills,
    languages,
    links,
  } = useResumeTemplateData();
  const profileBase64 = useProfileImage(basicDetails?.profile);

  const profileLinks = links.filter((item) => item?.link);

  return (
    <div
        className={`${(downloadImage || isGeneratingPdf) ? "w-[794px] max-w-[794px] min-h-[1123px]" : "w-full max-w-full"} h-auto mx-auto overflow-visible p-12 bg-white shadow-xl font-['Georgia',serif] text-[#1e293b] [&_section]:mb-5 [&_section_h2]:text-[1rem] [&_section_h2]:font-bold [&_section_h2]:tracking-[0.15em] [&_section_h2]:uppercase [&_section_h2]:border-b [&_section_h2]:border-solid [&_section_h2]:border-[#1e293b] [&_section_h2]:pb-1.5 [&_section_h2]:mb-3 [&_section_h2]:text-[#1e293b] [&_section_p]:text-[0.92rem] [&_section_p]:leading-relaxed [&::-webkit-scrollbar]:w-[1px] [&::-webkit-scrollbar-track]:bg-white [&::-webkit-scrollbar-thumb]:bg-white`}
      ref={resumeTemplateRef}
    >
      <div
        id="section-Basic-Details"
        className={`${sectionClass} ${activeSection === "Basic Details" || activeSection === "Links" ? "border border-[#d1d5db] bg-[#f9fafb]" : "border border-transparent"}`}
      >
        <header className="grid gap-6 border-b border-[#d1d5db] pb-6 md:grid-cols-[1fr_8rem]">
          <div>
            {/* <p className="text-[0.8rem] uppercase tracking-[0.35rem] text-[#6b7280] mb-2">
              Resume Template For Students And Experienced Candidates
            </p> */}
            <h1 className="text-[2.5rem] leading-none font-semibold mb-3 text-[#111827]">
              {basicDetails?.firstName} {basicDetails?.middleName} {basicDetails?.lastName}
            </h1>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-[0.95rem] text-[#4b5563]">
              {basicDetails?.email && (
                <a href={`mailto:${basicDetails.email}`} className="flex items-center gap-2 text-inherit no-underline">
                  <MailOutlined /> <span>{basicDetails.email}</span>
                </a>
              )}
              {basicDetails?.phone && (
                <a href={`tel:${basicDetails.phone}`} className="flex items-center gap-2 text-inherit no-underline">
                  <PhoneFilled /> <span>{basicDetails.phone}</span>
                </a>
              )}
              {profileLinks.slice(0, 3).map((item, index) => {
                const icons = [<LinkedinFilled key="linkedin" />, <GithubOutlined key="github" />, <GlobalOutlined key="globe" />];
                return (
                  <a
                    key={`${item.title}-${index}`}
                    href={normalizeExternalLink(item.link)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-inherit no-underline"
                  >
                    {icons[index] || <GlobalOutlined />} {item.title || item.link}
                  </a>
                );
              })}
            </div>
          </div>
          {profileBase64 && (
            <div className="flex items-start justify-center">
              <img
                src={profileBase64}
                alt="profile"
                className="h-28 w-28 rounded-lg object-cover border border-[#d1d5db]"
              />
            </div>
          )}
        </header>

        <section className="mt-6">
          <h2 className="text-[0.85rem] uppercase tracking-[0.3rem] text-[#374151] mb-3">Professional Summary</h2>
          <div className="text-[1rem] leading-7 text-[#374151]" dangerouslySetInnerHTML={{ __html: asHtmlString(basicDetails?.professionalSummary) }} />
        </section>
      </div>

      {educationDetails.length > 0 && (
        <section
          id="section-Education"
          className={`${sectionClass} ${activeSection === "Education" ? "border border-[#d1d5db] bg-[#f9fafb]" : "border border-transparent"}`}
        >
          <h2 className="text-[0.85rem] uppercase tracking-[0.3rem] text-[#374151] mb-3">Education</h2>
          <div className="space-y-4">
            {educationDetails.map((item, index) => (
              <div key={index} className="border-l-2 border-[#d1d5db] pl-4">
                <div className="flex flex-wrap items-center gap-2">
                  <div>
                    <h3 className="m-0 text-[1.05rem] font-semibold">{item?.type || "Course"}</h3>
                    <p className="m-0 text-[0.95rem] text-[#4b5563]">{item?.school || item?.board}</p>
                  </div>
                  <p className="m-0 text-[0.85rem] uppercase tracking-[0.18rem] text-[#6b7280]">
                    {item?.startDate} {item?.endDate ? `- ${item.endDate}` : ""}
                  </p>
                </div>
                {item?.description && <p className="mt-2 mb-0 text-[0.95rem] leading-6">{item.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {workExperience.length > 0 && (
        <section
          id="section-Experience"
          className={`${sectionClass} ${activeSection === "Experience" ? "border border-[#d1d5db] bg-[#f9fafb]" : "border border-transparent"}`}
        >
          <h2 className="text-[0.85rem] uppercase tracking-[0.3rem] text-[#374151] mb-3">Experience</h2>
          <div className="space-y-4">
            {workExperience.map((item, index) => (
              <div key={index}>
                <div className="flex flex-wrap items-center gap-2">
                  <div>
                    <h3 className="m-0 text-[1.05rem] font-semibold">{item?.role}</h3>
                    <p className="m-0 text-[0.95rem] text-[#4b5563]">{item?.company}</p>
                  </div>
                  <p className="m-0 text-[0.85rem] uppercase tracking-[0.18rem] text-[#6b7280]">
                    {item?.start || item?.startDate} {item?.end || item?.endDate ? `- ${item?.end || item?.endDate}` : ""}
                  </p>
                </div>
                {item?.description && <p className="mt-2 mb-0 text-[0.95rem] leading-6">{item.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {internshipDetails.length > 0 && (
        <section
          id="section-Internships"
          className={`${sectionClass} ${activeSection === "Internships" ? "border border-[#d1d5db] bg-[#f9fafb]" : "border border-transparent"}`}
        >
          <h2 className="text-[0.85rem] uppercase tracking-[0.3rem] text-[#374151] mb-3">Internships</h2>
          <div className="space-y-4">
            {internshipDetails.map((item, index) => (
              <div key={index}>
                <div className="flex flex-wrap items-center gap-2">
                  <div>
                    <h3 className="m-0 text-[1.05rem] font-semibold">{item?.role}</h3>
                    <p className="m-0 text-[0.95rem] text-[#4b5563]">{item?.company}</p>
                  </div>
                  <p className="m-0 text-[0.85rem] uppercase tracking-[0.18rem] text-[#6b7280]">
                    {item?.start || item?.startDate} {item?.end || item?.endDate ? `- ${item?.end || item?.endDate}` : ""}
                  </p>
                </div>
                {item?.description && <p className="mt-2 mb-0 text-[0.95rem] leading-6">{item.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {projectDetails.length > 0 && (
        <section
          id="section-Projects"
          className={`${sectionClass} ${activeSection === "Projects" ? "border border-[#d1d5db] bg-[#f9fafb]" : "border border-transparent"}`}
        >
          <h2 className="text-[0.85rem] uppercase tracking-[0.3rem] text-[#374151] mb-3">Projects</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {projectDetails.filter((item) => item?.project).map((item, index) => (
              <div key={index} className="rounded-lg border border-[#e5e7eb] bg-white p-4">
                <h3 className="m-0 text-[1rem] font-semibold">{item.project}</h3>
                {item?.company && <p className="mt-1 mb-2 text-[0.9rem] text-[#6b7280]">{item.company}</p>}
                <div className="text-[0.92rem] leading-6" dangerouslySetInnerHTML={{ __html: asHtmlString(item?.description) }} />
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {skills.length > 0 && (
          <section
            id="section-Skills"
            className={`${sectionClass} ${activeSection === "Skills" ? "border border-[#d1d5db] bg-[#f9fafb]" : "border border-transparent"}`}
          >
            <h2 className="text-[0.85rem] uppercase tracking-[0.3rem] text-[#374151] mb-3">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skills.filter(Boolean).map((item, index) => (
                <span key={index} className="rounded-full border border-[#d1d5db] px-3 py-1 text-[0.9rem] bg-white">
                  {item}
                </span>
              ))}
            </div>
          </section>
        )}

        {languages.length > 0 && (
          <section
            id="section-Languages"
            className={`${sectionClass} ${activeSection === "Languages" ? "border border-[#d1d5db] bg-[#f9fafb]" : "border border-transparent"}`}
          >
            <h2 className="text-[0.85rem] uppercase tracking-[0.3rem] text-[#374151] mb-3">Languages</h2>
            <p className="m-0 text-[0.95rem] leading-6">{languages.filter(Boolean).join(", ")}</p>
          </section>
        )}
      </div>
    </div>
  );
};

export default Template1;
