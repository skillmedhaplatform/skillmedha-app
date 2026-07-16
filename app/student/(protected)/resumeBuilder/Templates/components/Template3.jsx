"use client";

import React from "react";
import {
  PhoneFilled,
  MailOutlined,
  GlobalOutlined,
  LinkedinFilled,
  EnvironmentOutlined,
  BankOutlined,
  SolutionOutlined,
  ToolOutlined,
  TrophyOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import { parseIfJson } from "@/app/student/(protected)/jobAssessments/reusable_comp/jsonparse";
import {
  asHtmlString,
  normalizeExternalLink,
  useProfileImage,
  useResumeTemplateData,
} from "./resumeTemplateData";

/**
 * Template16 — "Badge Icon Two-Column" (Anna Smith style)
 * Narrow left column: name, photo (or initials monogram), profile summary,
 * contact with circular icons — floated as a soft card on a light page
 * background. Wide right column: circular teal badges in front of each
 * section title (Education, Experience, Skills, Achievements, Hobbies).
 *
 * The photo now goes through `useProfileImage`, which resolves the URL to
 * a base64 data-uri client-side. Rendering `basicDetails.profile` directly
 * as an <img src> works fine on screen but frequently comes back blank in
 * the downloaded PDF, because html2canvas can't reliably rasterize a
 * cross-origin image it hasn't already got as a data-uri.
 *
 * "Indicative Achievements" and "Hobbies" in the reference don't map to a
 * field in your data model — they're filled from Projects and Volunteering
 * respectively so nothing is fabricated. Swap the source arrays below if
 * you'd rather point them elsewhere.
 */
const ACCENT = "#0f6f66";

const getInitials = (first, last) => `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase();

const Template16 = ({ resumeTemplateRef, activeSection, isGeneratingPdf }) => {
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
    activeSection === sectionName ? "bg-[#eafaf7] rounded-md" : "";

  const BadgeTitle = ({ icon: Icon, children }) => (
    <div className="flex items-center gap-3 mb-4">
      <span
        className="w-9 h-9 rounded-full text-white flex items-center justify-center text-[1rem] shrink-0 shadow-sm"
        style={{ backgroundColor: ACCENT }}
      >
        <Icon />
      </span>
      <h2 className="m-0 text-[1.05rem] font-bold uppercase tracking-wide text-[#1e2a3a]">{children}</h2>
    </div>
  );

  const SideTitle = ({ children }) => (
    <div className="mb-3">
      <h2 className="m-0 text-[0.78rem] font-bold uppercase tracking-[0.2em] text-[#1e2a3a]">{children}</h2>
      <div className="mt-1.5 h-[2px] w-8" style={{ backgroundColor: ACCENT }} />
    </div>
  );

  return (
    <div
      ref={resumeTemplateRef}
      className={`${isGeneratingPdf ? "w-[50rem] max-w-[50rem]" : "w-full max-w-full"} mx-auto overflow-y-scroll bg-[#f4f6f5] font-['Inter',sans-serif] text-[#3f3f46] p-5 [&::-webkit-scrollbar]:w-[1px] [&::-webkit-scrollbar-thumb]:bg-transparent [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_li]:text-[0.85rem] [&_li]:leading-6`}
    >
      <div className="grid grid-cols-1 md:grid-cols-[15.5rem_1fr] bg-white rounded-2xl shadow-sm overflow-hidden border border-[#e4e9e8]">
        {/* Left column */}
        <div className="bg-[#0e1f1c] p-6 flex flex-col gap-6">
          <div id="section-Basic-Details" className={`p-2 -m-2 scroll-mt-8 flex flex-col items-center text-center gap-4 ${sectionState("Basic Details")}`}>
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-[rgba(255,255,255,0.1)] shrink-0 flex items-center justify-center text-3xl font-bold text-white bg-[rgba(255,255,255,0.1)]">
              {profileBase64 ? (
                <img src={profileBase64} alt="profile" className="w-full h-full object-cover" />
              ) : (
                getInitials(basicDetails?.firstName, basicDetails?.lastName)
              )}
            </div>
            <div>
              <h1 className="m-0 text-[1.35rem] font-light tracking-wide text-[#9fb8b3] uppercase leading-tight">
                {basicDetails?.firstName}
              </h1>
              <h1 className="m-0 text-[1.35rem] font-black tracking-wide text-white uppercase leading-tight">
                {basicDetails?.middleName} {basicDetails?.lastName}
              </h1>
            </div>
          </div>

          {basicDetails?.professionalSummary && (
            <div>
              <SideTitle>Profile</SideTitle>
              <div
                className="text-[0.8rem] leading-6 text-[#c8d6d3]"
                dangerouslySetInnerHTML={{ __html: asHtmlString(basicDetails.professionalSummary) }}
              />
            </div>
          )}

          <div>
            <SideTitle>Contact</SideTitle>
            <div className="flex flex-col gap-3">
              {basicDetails?.phone && (
                <a href={`tel:${basicDetails.phone}`} className="flex items-center gap-3 no-underline text-[#e4ece9]">
                  <span className="w-7 h-7 rounded-full bg-[rgba(255,255,255,0.1)] flex items-center justify-center text-[0.8rem] text-white shrink-0">
                    <PhoneFilled />
                  </span>
                  <span className="text-[0.8rem]">{basicDetails.phone}</span>
                </a>
              )}
              {basicDetails?.email && (
                <a href={`mailto:${basicDetails.email}`} className="flex items-center gap-3 no-underline text-[#e4ece9]">
                  <span className="w-7 h-7 rounded-full bg-[rgba(255,255,255,0.1)] flex items-center justify-center text-[0.8rem] text-white shrink-0">
                    <MailOutlined />
                  </span>
                  <span className="text-[0.8rem] break-all">{basicDetails.email}</span>
                </a>
              )}
              {links.filter((item) => item?.link).slice(0, 2).map((item, index) => (
                <a
                  key={index}
                  href={normalizeExternalLink(item.link)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 no-underline text-[#e4ece9]"
                >
                  <span className="w-7 h-7 rounded-full bg-[rgba(255,255,255,0.1)] flex items-center justify-center text-[0.8rem] text-white shrink-0">
                    {index === 0 ? <GlobalOutlined /> : <LinkedinFilled />}
                  </span>
                  <span className="text-[0.8rem] break-all">{item.title || item.link}</span>
                </a>
              ))}
              {basicDetails?.city && (
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-[rgba(255,255,255,0.1)] flex items-center justify-center text-[0.8rem] text-white shrink-0">
                    <EnvironmentOutlined />
                  </span>
                  <span className="text-[0.8rem] text-[#e4ece9]">{basicDetails.city}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="p-8 space-y-8">
          {educationDetails.length > 0 && (
            <section id="section-Education" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Education")}`}>
              <BadgeTitle icon={BankOutlined}>My Education</BadgeTitle>
              <div className="space-y-4 pl-[3.1rem]">
                {educationDetails.map((item, index) => (
                  <div key={index}>
                    <div className="flex flex-wrap justify-between gap-x-4">
                      <h3 className="m-0 text-[0.9rem] font-bold uppercase text-[#1e2a3a]">{item?.type}</h3>
                      <p className="m-0 text-[0.8rem] font-semibold whitespace-nowrap" style={{ color: ACCENT }}>
                        {item?.startDate} – {item?.endDate}
                      </p>
                    </div>
                    <p className="m-0 text-[0.83rem] text-[#71717a]">{item?.school || item?.board}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {workExperience.length > 0 && (
            <section id="section-Experience" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Experience")}`}>
              <BadgeTitle icon={SolutionOutlined}>Work Experience</BadgeTitle>
              <div className="space-y-4 pl-[3.1rem]">
                {workExperience.map((item, index) => (
                  <div key={index}>
                    <div className="flex flex-wrap justify-between gap-x-4">
                      <h3 className="m-0 text-[0.9rem] font-bold uppercase text-[#1e2a3a]">{item?.role}</h3>
                      <p className="m-0 text-[0.8rem] font-semibold whitespace-nowrap" style={{ color: ACCENT }}>
                        {item?.start || item?.startDate} – {item?.end || item?.endDate || "Present"}
                      </p>
                    </div>
                    <p className="m-0 text-[0.83rem] text-[#71717a]">{item?.company}</p>
                    {item?.description && (
                      <div className="mt-1 text-[0.83rem]" dangerouslySetInnerHTML={{ __html: asHtmlString(item.description) }} />
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {internshipDetails.length > 0 && (
            <section id="section-Internships" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Internships")}`}>
              <BadgeTitle icon={SolutionOutlined}>Internships</BadgeTitle>
              <div className="space-y-4 pl-[3.1rem]">
                {internshipDetails.map((item, index) => (
                  <div key={index}>
                    <div className="flex flex-wrap justify-between gap-x-4">
                      <h3 className="m-0 text-[0.9rem] font-bold uppercase text-[#1e2a3a]">{item?.role}</h3>
                      <p className="m-0 text-[0.8rem] font-semibold whitespace-nowrap" style={{ color: ACCENT }}>
                        {item?.start || item?.startDate} – {item?.end || item?.endDate || "Present"}
                      </p>
                    </div>
                    <p className="m-0 text-[0.83rem] text-[#71717a]">{item?.company}</p>
                    {item?.description && (
                      <div className="mt-1 text-[0.83rem]" dangerouslySetInnerHTML={{ __html: asHtmlString(item.description) }} />
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {skills.filter(Boolean).length > 0 && (
            <section id="section-Skills" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Skills")}`}>
              <BadgeTitle icon={ToolOutlined}>Professional Skills</BadgeTitle>
              <div className="flex flex-wrap gap-2 pl-[3.1rem]">
                {skills.filter(Boolean).map((skill, index) => (
                  <span
                    key={index}
                    className="text-[0.78rem] font-medium rounded-full px-3 py-1"
                    style={{ color: ACCENT, backgroundColor: "rgba(15,111,102,0.1)" }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {projectDetails.filter((item) => item?.project).length > 0 && (
            <section id="section-Projects" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Projects")}`}>
              <BadgeTitle icon={TrophyOutlined}>Indicative Achievements</BadgeTitle>
              <ul className="pl-[3.1rem] list-disc space-y-1">
                {projectDetails.filter((item) => item?.project).map((item, index) => (
                  <li key={index} className="text-[0.85rem]">
                    <span className="font-semibold text-[#1e2a3a]">{item.project}</span>
                    {item?.company ? ` — ${item.company}` : ""}
                    <div className="mt-1" dangerouslySetInnerHTML={{ __html: parseIfJson(item?.description) }} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {volunteerings.filter((item) => item?.organization || item?.volunteering).length > 0 && (
            <section id="section-Volunteering" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Volunteering")}`}>
              <BadgeTitle icon={SmileOutlined}>Hobbies &amp; Volunteering</BadgeTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 pl-[3.1rem]">
                {volunteerings.filter((item) => item?.organization || item?.volunteering).map((item, index) => (
                  <div key={index}>
                    <p className="m-0 text-[0.85rem] font-semibold text-[#1e2a3a]">
                      {item?.volunteering}{item?.organization ? `, ${item.organization}` : ""}
                    </p>
                    <div className="mt-1 text-[0.82rem]" dangerouslySetInnerHTML={{ __html: asHtmlString(item?.description) }} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {languages.filter(Boolean).length > 0 && (
            <section id="section-Languages" className={`p-3 -m-3 scroll-mt-8 ${sectionState("Languages")}`}>
              <BadgeTitle icon={GlobalOutlined}>Languages</BadgeTitle>
              <p className="m-0 pl-[3.1rem] text-[0.85rem] text-[#3f3f46]">
                {languages.filter(Boolean).map((l) => (typeof l === "object" && l !== null ? `${l.name}${l.level ? ` (${l.level})` : ""}` : l)).join(", ")}
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default Template16;
