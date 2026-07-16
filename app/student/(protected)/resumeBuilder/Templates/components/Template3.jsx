"use client";

import React, { useState } from "react";
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
  useProfileImage,
  useResumeTemplateData,
} from "./resumeTemplateData";

/**
 * Template16 — "Bento Grid"
 * Every section renders as its own card in a modern dashboard-style
 * grid instead of a linear stack or fixed sidebar — Summary and
 * Experience take wide cards, everything else tiles into whatever
 * space is left (`auto-fit` grid, so the layout reflows cleanly
 * whichever optional sections are present). A structurally different
 * paradigm from the sidebar-plus-column templates in the rest of the set.
 */

const COLOR_OPTIONS = [
  { name: "Cobalt", value: "#1d4ed8" },
  { name: "Emerald", value: "#047857" },
  { name: "Magenta", value: "#a21caf" },
  { name: "Amber", value: "#b45309" },
  { name: "Graphite", value: "#334155" },
];

const withAlpha = (hex, alpha) => {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const getInitials = (first, last) => `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase();

const Card = ({ id, wide, activeSection, accent, children, className = "" }) => (
  <div
    id={id ? `section-${id}` : undefined}
    className={`bg-white rounded-2xl border border-[#e4e8ee] p-5 scroll-mt-8 ${wide ? "md:col-span-2" : ""} ${className}`}
    style={
      id && activeSection === id
        ? { outline: `2px solid ${accent}`, outlineOffset: "2px" }
        : undefined
    }
  >
    {children}
  </div>
);

const Template16 = ({ resumeTemplateRef, activeSection, isGeneratingPdf }) => {
  const {
    basicDetails,
    educationDetails,
    workExperience,
    internshipDetails,
    projectDetails,
    accDetails,
    certificates,
    volunteerings,
    skills,
    languages,
    links,
  } = useResumeTemplateData();
  const profileBase64 = useProfileImage(basicDetails?.profile);
  const [accent, setAccent] = useState(COLOR_OPTIONS[0].value);

  const CardTitle = ({ children }) => (
    <h2 className="m-0 mb-3 text-[0.76rem] font-bold uppercase tracking-[0.1em]" style={{ color: accent }}>
      {children}
    </h2>
  );

  const dateRange = (item) =>
    `${item?.start || item?.startDate || ""} – ${item?.end || item?.endDate || "Present"}`;

  const combinedExperience = [...workExperience, ...internshipDetails];
  const profileLinks = links.filter((item) => item?.link);
  const linkIcons = [<GlobalOutlined key="gl" />, <LinkedinFilled key="li" />];

  return (
    <div
      ref={resumeTemplateRef}
      className={`${isGeneratingPdf ? "w-[50rem] max-w-[50rem]" : "w-full max-w-full"} mx-auto overflow-y-scroll bg-[#f3f5f8] font-['Inter',sans-serif] text-[#1e293b] p-6 [&::-webkit-scrollbar]:w-[1px] [&::-webkit-scrollbar-thumb]:bg-transparent [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1 [&_li]:text-[0.82rem] [&_li]:leading-6`}
    >
      {!isGeneratingPdf && (
        <div className="flex items-center gap-2 pb-3 print:hidden">
          <span className="text-[11px] font-bold uppercase tracking-wide text-[#8a8a8a]">Theme colour</span>
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c.value}
              type="button"
              title={c.name}
              onClick={() => setAccent(c.value)}
              className="h-[18px] w-[18px] rounded-full border border-[rgba(0,0,0,0.1)] cursor-pointer p-0"
              style={{ backgroundColor: c.value, outline: accent === c.value ? `2px solid ${c.value}` : "none", outlineOffset: "2px" }}
            />
          ))}
        </div>
      )}

      {/* Header card — full width */}
      <div
        id="section-Basic-Details"
        className="bg-white rounded-2xl border border-[#e4e8ee] p-6 mb-4 flex flex-wrap items-center gap-5 scroll-mt-8"
        style={activeSection === "Basic Details" ? { outline: `2px solid ${accent}`, outlineOffset: "2px" } : undefined}
      >
        <div
          className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center text-2xl font-bold text-white shrink-0"
          style={{ backgroundColor: accent }}
        >
          {profileBase64 ? (
            <img src={profileBase64} alt="profile" className="w-full h-full object-cover" />
          ) : (
            getInitials(basicDetails?.firstName, basicDetails?.lastName)
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="m-0 text-[1.7rem] font-bold text-[#0f172a]">
            {basicDetails?.firstName} {basicDetails?.middleName} {basicDetails?.lastName}
          </h1>
          {workExperience?.[0]?.role && (
            <p className="m-0 mt-0.5 text-[0.92rem] font-semibold" style={{ color: accent }}>{workExperience[0].role}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[0.8rem] text-[#64748b]">
            {basicDetails?.email && (
              <a href={`mailto:${basicDetails.email}`} className="flex items-center gap-1.5 no-underline text-[#64748b]">
                <MailOutlined /> <span>{basicDetails.email}</span>
              </a>
            )}
            {basicDetails?.phone && (
              <a href={`tel:${basicDetails.phone}`} className="flex items-center gap-1.5 no-underline text-[#64748b]">
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
                className="flex items-center gap-1.5 no-underline"
                style={{ color: accent }}
              >
                {linkIcons[index] || <GlobalOutlined />} <span>{item.title || item.link}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {basicDetails?.professionalSummary && (
          <Card wide>
            <CardTitle>Summary</CardTitle>
            <div
              className="text-[0.85rem] leading-6 text-[#334155]"
              dangerouslySetInnerHTML={{ __html: asHtmlString(basicDetails.professionalSummary) }}
            />
          </Card>
        )}

        {combinedExperience.length > 0 && (
          <Card id="Experience" wide activeSection={activeSection} accent={accent}>
            <CardTitle>Experience</CardTitle>
            <div className="space-y-4">
              {combinedExperience.map((item, index) => (
                <div key={index}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <h3 className="m-0 text-[0.9rem] font-bold text-[#0f172a]">
                      {item?.role}{item?.company && <span className="font-normal text-[#64748b]">, {item.company}</span>}
                    </h3>
                    <span
                      className="text-[0.72rem] font-bold whitespace-nowrap px-2 py-0.5 rounded-full"
                      style={{ color: accent, backgroundColor: withAlpha(accent, 0.1) }}
                    >
                      {dateRange(item)}
                    </span>
                  </div>
                  {item?.description && (
                    <div className="mt-1 text-[0.82rem] leading-6 text-[#334155]" dangerouslySetInnerHTML={{ __html: asHtmlString(item.description) }} />
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {educationDetails.length > 0 && (
          <Card id="Education" activeSection={activeSection} accent={accent}>
            <CardTitle>Education</CardTitle>
            <div className="space-y-3">
              {educationDetails.map((item, index) => (
                <div key={index}>
                  <h3 className="m-0 text-[0.85rem] font-bold text-[#0f172a]">{item?.type}</h3>
                  <p className="m-0 text-[0.78rem] text-[#64748b]">{item?.school || item?.board}</p>
                  <p className="m-0 text-[0.74rem]" style={{ color: accent }}>{item?.startDate} – {item?.endDate}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {skills.filter(Boolean).length > 0 && (
          <Card id="Skills" activeSection={activeSection} accent={accent}>
            <CardTitle>Skills</CardTitle>
            <div className="flex flex-wrap gap-1.5">
              {skills.filter(Boolean).map((skill, index) => (
                <span
                  key={index}
                  className="text-[0.75rem] font-medium rounded-md px-2.5 py-1"
                  style={{ color: accent, backgroundColor: withAlpha(accent, 0.1) }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </Card>
        )}

        {projectDetails.filter((item) => item?.project).length > 0 && (
          <Card id="Projects" wide activeSection={activeSection} accent={accent}>
            <CardTitle>Projects</CardTitle>
            <div className="space-y-3">
              {projectDetails.filter((item) => item?.project).map((item, index) => (
                <div key={index}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <h3 className="m-0 text-[0.87rem] font-bold text-[#0f172a]">
                      {item.project}{item?.company ? <span className="font-normal text-[#64748b]"> — {item.company}</span> : ""}
                    </h3>
                    <span className="text-[0.74rem] whitespace-nowrap text-[#64748b]">
                      {item?.startDate} {item?.endDate ? `– ${item.endDate}` : ""}
                    </span>
                  </div>
                  <div className="mt-1 text-[0.82rem] leading-6 text-[#334155]" dangerouslySetInnerHTML={{ __html: parseIfJson(item?.description) }} />
                </div>
              ))}
            </div>
          </Card>
        )}

        {accDetails.filter((a) => a?.accomplishment || a?.description).length > 0 && (
          <Card id="Accomplishments" activeSection={activeSection} accent={accent}>
            <CardTitle>Achievements</CardTitle>
            <ul className="pl-4 space-y-1">
              {accDetails.filter((a) => a?.accomplishment || a?.description).map((item, index) => (
                <li key={index} className="text-[0.8rem] text-[#334155]">
                  <span className="font-semibold text-[#0f172a]">{item?.accomplishment}</span>
                  {item?.description ? ` — ${item.description}` : ""}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {certificates.filter((c) => c?.name || c?.organization).length > 0 && (
          <Card id="Certifications" activeSection={activeSection} accent={accent}>
            <CardTitle>Certifications</CardTitle>
            <div className="space-y-2">
              {certificates.filter((c) => c?.name || c?.organization).map((item, index) => (
                <div key={index}>
                  <p className="m-0 text-[0.8rem] font-semibold text-[#0f172a]">{item?.name}</p>
                  <p className="m-0 text-[0.74rem] text-[#64748b]">{item?.organization}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {volunteerings.filter((item) => item?.organization || item?.volunteering).length > 0 && (
          <Card id="Volunteering" activeSection={activeSection} accent={accent}>
            <CardTitle>Volunteering</CardTitle>
            <div className="space-y-2">
              {volunteerings.filter((item) => item?.organization || item?.volunteering).map((item, index) => (
                <div key={index}>
                  <p className="m-0 text-[0.8rem] font-semibold text-[#0f172a]">
                    {item?.volunteering}{item?.organization ? `, ${item.organization}` : ""}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {languages.filter(Boolean).length > 0 && (
          <Card id="Languages" activeSection={activeSection} accent={accent}>
            <CardTitle>Languages</CardTitle>
            <div className="flex flex-wrap gap-1.5">
              {languages.filter(Boolean).map((l, index) => {
                const name = typeof l === "object" && l !== null ? l.name : l;
                return (
                  <span
                    key={index}
                    className="text-[0.75rem] font-medium rounded-md px-2.5 py-1"
                    style={{ color: accent, backgroundColor: withAlpha(accent, 0.1) }}
                  >
                    {name}
                  </span>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Template16;
