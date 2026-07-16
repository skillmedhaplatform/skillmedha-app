"use client";

import React from "react";
import {
  GithubOutlined,
  GlobalOutlined,
  LinkedinFilled,
  MailOutlined,
  PhoneFilled,
} from "@ant-design/icons";
import { parseIfJson } from "@/app/student/(protected)/jobAssessments/reusable_comp/jsonparse";
import {
  asHtmlString,
  normalizeExternalLink,
  useProfileImage,
  useResumeTemplateData,
} from "./resumeTemplateData";

/**
 * Template6 — "Executive Timeline"
 * Built for senior / experienced professionals (10-20+ yrs).
 * Single column, editorial serif header, bronze accent rules,
 * a connecting timeline through the career history, bulleted
 * achievement lines per role, and a "Key Achievements" band.
 *
 * All visual rules are inline `style` objects, not Tailwind
 * bracket-value classes — see the note at the top of Template7
 * for why that matters for build-safety.
 */

const ACCENT = "#9a5b13";
const INK = "#1c1917";
const SUBTLE = "#6b6259";
const RULE = "#e7e0d6";

const Bulleted = ({ text }) => {
  if (!text) return null;
  const parts = String(text)
    .split(/\r?\n|(?<=[.;])\s*•\s*|^\s*[•\-]\s*/gm)
    .map((line) => line.trim())
    .filter(Boolean);

  if (parts.length <= 1) {
    return <p style={{ margin: "6px 0 0", fontSize: "14.5px", lineHeight: 1.55, color: "#3f3a35" }}>{text}</p>;
  }

  return (
    <ul style={{ margin: "6px 0 0", listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
      {parts.map((line, i) => (
        <li key={i} style={{ position: "relative", paddingLeft: "16px", fontSize: "14.5px", lineHeight: 1.5, color: "#3f3a35" }}>
          <span style={{ position: "absolute", left: 0, top: "8px", height: "3px", width: "3px", borderRadius: "50%", backgroundColor: ACCENT }} />
          {line}
        </li>
      ))}
    </ul>
  );
};

const SectionLabel = ({ children }) => (
  <h2 style={{ margin: "0 0 16px", display: "flex", alignItems: "center", gap: "12px", fontSize: "12.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: INK }}>
    {children}
    <span style={{ height: "1px", flex: 1, backgroundColor: RULE }} />
  </h2>
);

const S = {
  page: {
    width: "100%",
    maxWidth: "100%",
    margin: "0 auto",
    height: "100%",
    overflowY: "auto",
    backgroundColor: "#fdfcfa",
    padding: "44px 48px",
    fontFamily: "Georgia, 'Times New Roman', serif",
    color: "#3f3a35",
    boxSizing: "border-box",
  },
  name: { margin: 0, fontSize: "38px", fontWeight: 700, lineHeight: 1.05, color: INK },
  headline: { margin: "8px 0 0", fontFamily: "Arial, sans-serif", fontSize: "16px", fontWeight: 600, color: ACCENT },
  photo: { height: "96px", width: "96px", flexShrink: 0, borderRadius: "6px", border: `1px solid ${RULE}`, objectFit: "cover" },
  contactRow: { marginTop: "16px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px 20px", fontFamily: "Arial, sans-serif", fontSize: "13.5px", color: SUBTLE },
  contactLink: { display: "flex", alignItems: "center", gap: "6px", textDecoration: "none", color: SUBTLE },
  summary: { marginTop: "16px", maxWidth: "680px", fontSize: "15.5px", lineHeight: 1.6 },
  section: { marginBottom: "28px" },
  entryTitle: { margin: 0, fontSize: "17px", fontWeight: 700, color: INK },
  entrySub: { fontWeight: 400, fontStyle: "italic", color: SUBTLE },
  entryDate: { margin: 0, whiteSpace: "nowrap", fontFamily: "Arial, sans-serif", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: ACCENT },
  entryHeadRow: { display: "flex", flexWrap: "wrap", alignItems: "baseline", justifyContent: "space-between", columnGap: "16px" },
};

const Template6 = ({ resumeTemplateRef, activeSection, isGeneratingPdf }) => {
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

  const profileLinks = links.filter((item) => item?.link);
  const linkIcons = [<LinkedinFilled key="li" />, <GithubOutlined key="gh" />, <GlobalOutlined key="gl" />];

  const highlight = (name) =>
    activeSection === name ? { outline: `2px solid ${ACCENT}`, outlineOffset: "6px", borderRadius: "6px" } : {};

  const headline = workExperience?.[0]?.role
    ? `${workExperience[0].role}${workExperience[0]?.company ? ` · ${workExperience[0].company}` : ""}`
    : null;

  const totalYears = (() => {
    const starts = workExperience
      .map((w) => parseInt(String(w?.start || w?.startDate || "").match(/\d{4}/)?.[0], 10))
      .filter(Boolean);
    if (!starts.length) return null;
    const span = new Date().getFullYear() - Math.min(...starts);
    return span > 0 ? span : null;
  })();

  const achievements = accDetails.filter((item) => item?.accomplishment || item?.description);
  const hasFooterCol =
    certificates.filter((c) => c?.name || c?.organization).length > 0 ||
    languages.filter(Boolean).length > 0 ||
    volunteerings.filter((v) => v?.organization || v?.volunteering).length > 0;

  return (
    <div ref={resumeTemplateRef} style={{ ...S.page, maxWidth: isGeneratingPdf ? "800px" : "100%" }}>
      <header id="section-Basic-Details" style={highlight("Basic Details")}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "24px" }}>
          <div style={{ minWidth: 0 }}>
            <h1 style={S.name}>
              {basicDetails?.firstName} {basicDetails?.middleName} {basicDetails?.lastName}
            </h1>
            {(headline || totalYears) && (
              <p style={S.headline}>
                {headline}
                {headline && totalYears ? "  ·  " : ""}
                {totalYears ? `${totalYears}+ years of experience` : ""}
              </p>
            )}
          </div>
          {profileBase64 && <img src={profileBase64} alt="profile" style={S.photo} />}
        </div>

        <div style={S.contactRow}>
          {basicDetails?.email && (
            <a href={`mailto:${basicDetails.email}`} style={S.contactLink}>
              <MailOutlined /> <span>{basicDetails.email}</span>
            </a>
          )}
          {basicDetails?.phone && (
            <a href={`tel:${basicDetails.phone}`} style={S.contactLink}>
              <PhoneFilled /> <span>{basicDetails.phone}</span>
            </a>
          )}
          {profileLinks.slice(0, 3).map((item, i) => (
            <a key={i} href={normalizeExternalLink(item.link)} target="_blank" rel="noopener noreferrer" style={S.contactLink}>
              {linkIcons[i] || <GlobalOutlined />} <span>{item.title || item.link}</span>
            </a>
          ))}
        </div>

        <div style={{ marginTop: "20px", height: "3px", width: "56px", borderRadius: "2px", backgroundColor: ACCENT }} />

        {basicDetails?.professionalSummary && (
          <div style={S.summary} dangerouslySetInnerHTML={{ __html: asHtmlString(basicDetails.professionalSummary) }} />
        )}
      </header>

      {skills.filter(Boolean).length > 0 && (
        <section id="section-Skills" style={{ ...S.section, marginTop: "28px", ...highlight("Skills") }}>
          <SectionLabel>Core competencies</SectionLabel>
          <p style={{ margin: 0, fontFamily: "Arial, sans-serif", fontSize: "14.5px", lineHeight: 1.7, color: "#4b453f" }}>
            {skills.filter(Boolean).map((skill, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span style={{ color: ACCENT }}> &nbsp;•&nbsp; </span>}
                <span style={{ fontWeight: 700 }}>{skill}</span>
              </React.Fragment>
            ))}
          </p>
        </section>
      )}

      {achievements.length > 0 && (
        <section id="section-Accomplishments" style={{ ...S.section, ...highlight("Accomplishments") }}>
          <SectionLabel>Key achievements</SectionLabel>
          <div style={{ borderRadius: "8px", padding: "20px", backgroundColor: "#fbf5ea", border: "1px solid #f0e4cc" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px" }}>
              {achievements.map((item, index) => (
                <div key={index} style={{ display: "flex", gap: "10px" }}>
                  <span style={{ marginTop: "4px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", height: "16px", width: "16px", borderRadius: "50%", fontSize: "10px", fontWeight: 700, color: "#ffffff", backgroundColor: ACCENT }}>
                    ✓
                  </span>
                  <div>
                    <p style={{ margin: 0, fontFamily: "Arial, sans-serif", fontSize: "14px", fontWeight: 700, lineHeight: 1.35, color: INK }}>
                      {item?.accomplishment || item?.company}
                    </p>
                    {item?.description && (
                      <p style={{ margin: "2px 0 0", fontFamily: "Arial, sans-serif", fontSize: "13px", lineHeight: 1.4, color: SUBTLE }}>{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {workExperience.length > 0 && (
        <section id="section-Experience" style={{ ...S.section, ...highlight("Experience") }}>
          <SectionLabel>Professional experience</SectionLabel>
          <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "24px", paddingLeft: "4px" }}>
            <div style={{ position: "absolute", bottom: "4px", left: "5px", top: "4px", width: "1px", backgroundColor: RULE }} />
            {workExperience.map((item, index) => (
              <div key={index} style={{ position: "relative", paddingLeft: "28px" }}>
                <span style={{ position: "absolute", left: 0, top: "6px", height: "11px", width: "11px", borderRadius: "50%", backgroundColor: ACCENT, boxShadow: "0 0 0 4px #fdfcfa" }} />
                <div style={S.entryHeadRow}>
                  <h3 style={S.entryTitle}>
                    {item?.role}
                    {item?.company && <span style={S.entrySub}> — {item.company}</span>}
                  </h3>
                  <p style={S.entryDate}>
                    {item?.start || item?.startDate}
                    {(item?.end || item?.endDate) ? ` – ${item?.end || item?.endDate}` : " – Present"}
                  </p>
                </div>
                {item?.city && <p style={{ margin: "2px 0 0", fontFamily: "Arial, sans-serif", fontSize: "13px", color: SUBTLE }}>{item.city}</p>}
                {item?.description && <Bulleted text={item.description} />}
              </div>
            ))}
          </div>
        </section>
      )}

      {projectDetails.filter((item) => item?.project).length > 0 && (
        <section id="section-Projects" style={{ ...S.section, ...highlight("Projects") }}>
          <SectionLabel>Notable projects &amp; initiatives</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {projectDetails.filter((item) => item?.project).map((item, index) => (
              <div key={index}>
                <div style={S.entryHeadRow}>
                  <h3 style={{ ...S.entryTitle, fontSize: "15.5px" }}>
                    {item.project}
                    {item?.company && <span style={S.entrySub}> — {item.company}</span>}
                  </h3>
                  <p style={S.entryDate}>
                    {item?.startDate} {item?.endDate ? `– ${item.endDate}` : ""}
                  </p>
                </div>
                <div style={{ marginTop: "6px", fontSize: "14.5px", lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: parseIfJson(item?.description) }} />
              </div>
            ))}
          </div>
        </section>
      )}

      {internshipDetails.length > 0 && (
        <section id="section-Internships" style={{ ...S.section, ...highlight("Internships") }}>
          <SectionLabel>Earlier career</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {internshipDetails.map((item, index) => (
              <div key={index} style={S.entryHeadRow}>
                <p style={{ margin: 0, fontSize: "14.5px", color: "#3f3a35" }}>
                  <span style={{ fontWeight: 700, color: INK }}>{item?.role}</span>
                  {item?.company && <span style={{ color: SUBTLE }}> — {item.company}</span>}
                </p>
                <p style={{ margin: 0, whiteSpace: "nowrap", fontFamily: "Arial, sans-serif", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", color: SUBTLE }}>
                  {item?.start || item?.startDate} {(item?.end || item?.endDate) ? `– ${item?.end || item?.endDate}` : ""}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {educationDetails.length > 0 && (
        <section id="section-Education" style={{ ...S.section, ...highlight("Education") }}>
          <SectionLabel>Education</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
            {educationDetails.map((item, index) => (
              <div key={index}>
                <h3 style={{ margin: 0, fontSize: "15.5px", fontWeight: 700, color: INK }}>{item?.type || "Course"}</h3>
                <p style={{ margin: 0, fontSize: "14px", color: SUBTLE }}>{item?.school || item?.board}</p>
                <p style={{ margin: "2px 0 0", fontFamily: "Arial, sans-serif", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", color: ACCENT }}>
                  {item?.startDate} {item?.endDate ? `– ${item.endDate}` : ""}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {hasFooterCol && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "24px", paddingTop: "4px" }}>
          {certificates.filter((c) => c?.name || c?.organization).length > 0 && (
            <section id="section-Certifications" style={highlight("Certifications")}>
              <SectionLabel>Certifications</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {certificates.filter((c) => c?.name || c?.organization).map((item, index) => (
                  <div key={index}>
                    <p style={{ margin: 0, fontSize: "13.5px", fontWeight: 700, color: INK }}>{item?.name}</p>
                    <p style={{ margin: 0, fontSize: "12.5px", color: SUBTLE }}>{item?.organization}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {volunteerings.filter((v) => v?.organization || v?.volunteering).length > 0 && (
            <section id="section-Volunteering" style={highlight("Volunteering")}>
              <SectionLabel>Volunteering</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {volunteerings.filter((v) => v?.organization || v?.volunteering).map((item, index) => (
                  <div key={index}>
                    <p style={{ margin: 0, fontSize: "13.5px", fontWeight: 700, color: INK }}>{item?.volunteering}</p>
                    <p style={{ margin: 0, fontSize: "12.5px", color: SUBTLE }}>{item?.organization}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {languages.filter(Boolean).length > 0 && (
            <section id="section-Languages" style={highlight("Languages")}>
              <SectionLabel>Languages</SectionLabel>
              <p style={{ margin: 0, fontSize: "13.5px", color: "#3f3a35" }}>{languages.filter(Boolean).join(", ")}</p>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default Template6;