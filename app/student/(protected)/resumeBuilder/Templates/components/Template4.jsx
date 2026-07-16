"use client";

import React, { useState } from "react";
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
 * Template8 — "Sidebar Slate"
 * Two-column layout: a dark accent sidebar (photo, contact, skills,
 * languages, certifications) alongside a light main column carrying
 * the chronological content (summary, experience, education,
 * projects, accomplishments, volunteering).
 *
 * IMPORTANT: every visual rule is written as an inline `style` object
 * rather than a Tailwind bracket-value class, so this template renders
 * correctly regardless of whether Tailwind's JIT has scanned this file.
 */

const COLOR_OPTIONS = [
  { name: "Loyal Blue", value: "#144181" },
  { name: "Assertive Asphalt", value: "#34393E" },
  { name: "Team Teal", value: "#00879E" },
  { name: "Ambitious Red", value: "#9A2B34" },
  { name: "Trusted Taupe", value: "#8C7A6B" },
  { name: "Mint Leaf", value: "#1C8A63" },
];

const S = {
  page: {
    width: "100%",
    maxWidth: "100%",
    margin: "0 auto",
    height: "100%",
    overflowY: "auto",
    backgroundColor: "#ffffff",
    fontFamily: "'Inter', Arial, sans-serif",
    color: "#2b2b2b",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "flex-start",
  },
  swatchRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    borderBottom: "1px solid #eeeeee",
    padding: "8px 20px",
  },
  swatchLabel: {
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#8a8a8a",
  },
  swatchBtn: (active, color) => ({
    height: "18px",
    width: "18px",
    borderRadius: "50%",
    backgroundColor: color,
    border: "1px solid rgba(0,0,0,0.1)",
    outline: active ? `2px solid ${color}` : "none",
    outlineOffset: "2px",
    cursor: "pointer",
    padding: 0,
  }),
  sidebar: (accent) => ({
    width: "34%",
    minWidth: "220px",
    flexShrink: 0,
    backgroundColor: accent,
    color: "#ffffff",
    padding: "28px 22px",
    boxSizing: "border-box",
    minHeight: "100%",
  }),
  photo: {
    height: "96px",
    width: "96px",
    borderRadius: "50%",
    border: "3px solid rgba(255,255,255,0.6)",
    objectFit: "cover",
    display: "block",
    margin: "0 auto 16px",
  },
  name: {
    margin: 0,
    fontSize: "22px",
    fontWeight: 700,
    lineHeight: 1.25,
    textAlign: "center",
  },
  headline: {
    margin: "4px 0 0",
    fontSize: "13px",
    fontWeight: 500,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },
  sideDivider: {
    height: "1px",
    backgroundColor: "rgba(255,255,255,0.25)",
    margin: "20px 0",
    border: "none",
  },
  sideLabel: {
    margin: "0 0 10px",
    fontSize: "11.5px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.09em",
    color: "rgba(255,255,255,0.9)",
  },
  sideBlock: { marginBottom: "22px" },
  contactItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    fontSize: "12.5px",
    color: "rgba(255,255,255,0.9)",
    textDecoration: "none",
    marginBottom: "9px",
    wordBreak: "break-word",
  },
  sideSkillItem: {
    fontSize: "12.5px",
    color: "rgba(255,255,255,0.92)",
    padding: "5px 0",
    borderBottom: "1px solid rgba(255,255,255,0.15)",
  },
  sideSmall: { margin: "0 0 8px", fontSize: "12px", color: "rgba(255,255,255,0.85)", lineHeight: 1.5 },
  sideSmallTitle: { fontWeight: 700, color: "#ffffff" },
  main: { flex: 1, padding: "28px 32px", minWidth: 0 },
  sectionLabel: (accent) => ({
    margin: "0 0 10px",
    fontSize: "14px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: accent,
    paddingBottom: "6px",
    borderBottom: `2px solid ${accent}`,
  }),
  section: { marginBottom: "26px" },
  summaryText: { fontSize: "14.5px", lineHeight: 1.65, color: "#333333" },
  entryList: { display: "flex", flexDirection: "column", gap: "16px" },
  entryHeadRow: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "baseline",
    justifyContent: "space-between",
    columnGap: "16px",
  },
  entryTitle: { margin: 0, fontSize: "15.5px", fontWeight: 700, color: "#1a1a1a" },
  entrySub: { fontWeight: 400, color: "#555555" },
  entryDate: (accent) => ({
    whiteSpace: "nowrap",
    fontSize: "12.5px",
    fontWeight: 700,
    color: accent,
  }),
  entryDesc: { margin: "4px 0 0", fontSize: "14px", lineHeight: 1.55, color: "#333333" },
};

const Template8 = ({ resumeTemplateRef, activeSection, isGeneratingPdf }) => {
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
  const [accent, setAccent] = useState(COLOR_OPTIONS[0].value);

  const profileLinks = links.filter((item) => item?.link);
  const linkIcons = [<LinkedinFilled key="li" />, <GithubOutlined key="gh" />, <GlobalOutlined key="gl" />];

  const highlight = (name) =>
    activeSection === name
      ? { outline: `2px solid ${accent}`, outlineOffset: "4px", borderRadius: "6px" }
      : {};

  const hasCerts = certificates.filter((c) => c?.name || c?.organization).length > 0;
  const hasVolunteering = volunteerings.filter((v) => v?.organization || v?.volunteering).length > 0;
  const hasLanguages = languages.filter(Boolean).length > 0;

  return (
    <div style={{ width: "100%", maxWidth: isGeneratingPdf ? "800px" : "100%", margin: "0 auto" }}>
      {!isGeneratingPdf && (
        <div style={S.swatchRow} className="print:hidden">
          <span style={S.swatchLabel}>Theme colour</span>
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c.value}
              type="button"
              title={c.name}
              onClick={() => setAccent(c.value)}
              style={S.swatchBtn(accent === c.value, c.value)}
            />
          ))}
        </div>
      )}

      <div ref={resumeTemplateRef} style={S.page}>
        <aside id="section-Basic-Details" style={{ ...S.sidebar(accent), ...highlight("Basic Details") }}>
          {profileBase64 && <img src={profileBase64} alt="profile" style={S.photo} />}
          <h1 style={S.name}>
            {basicDetails?.firstName} {basicDetails?.middleName} {basicDetails?.lastName}
          </h1>
          {workExperience?.[0]?.role && <p style={S.headline}>{workExperience[0].role}</p>}

          <hr style={S.sideDivider} />

          <div style={S.sideBlock}>
            <h2 style={S.sideLabel}>Contact</h2>
            {basicDetails?.email && (
              <a href={`mailto:${basicDetails.email}`} style={S.contactItem}>
                <MailOutlined /> <span>{basicDetails.email}</span>
              </a>
            )}
            {basicDetails?.phone && (
              <a href={`tel:${basicDetails.phone}`} style={S.contactItem}>
                <PhoneFilled /> <span>{basicDetails.phone}</span>
              </a>
            )}
            {profileLinks.slice(0, 3).map((item, i) => (
              <a
                key={i}
                href={normalizeExternalLink(item.link)}
                target="_blank"
                rel="noopener noreferrer"
                style={S.contactItem}
              >
                {linkIcons[i] || <GlobalOutlined />} <span>{item.title || item.link}</span>
              </a>
            ))}
          </div>

          {skills.filter(Boolean).length > 0 && (
            <div id="section-Skills" style={{ ...S.sideBlock, ...highlight("Skills") }}>
              <h2 style={S.sideLabel}>Key skills</h2>
              {skills.filter(Boolean).map((skill, i) => (
                <p key={i} style={S.sideSkillItem}>
                  {skill}
                </p>
              ))}
            </div>
          )}

          {hasLanguages && (
            <div id="section-Languages" style={{ ...S.sideBlock, ...highlight("Languages") }}>
              <h2 style={S.sideLabel}>Languages</h2>
              <p style={S.sideSmall}>{languages.filter(Boolean).join(", ")}</p>
            </div>
          )}

          {hasCerts && (
            <div id="section-Certifications" style={{ ...S.sideBlock, ...highlight("Certifications") }}>
              <h2 style={S.sideLabel}>Certifications</h2>
              {certificates
                .filter((c) => c?.name || c?.organization)
                .map((item, i) => (
                  <p key={i} style={S.sideSmall}>
                    <span style={S.sideSmallTitle}>{item?.name}</span>
                    {item?.organization ? ` — ${item.organization}` : ""}
                  </p>
                ))}
            </div>
          )}

          {hasVolunteering && (
            <div id="section-Volunteering" style={{ ...S.sideBlock, ...highlight("Volunteering") }}>
              <h2 style={S.sideLabel}>Volunteering</h2>
              {volunteerings
                .filter((v) => v?.organization || v?.volunteering)
                .map((item, i) => (
                  <p key={i} style={S.sideSmall}>
                    <span style={S.sideSmallTitle}>{item?.volunteering}</span>
                    {item?.organization ? ` — ${item.organization}` : ""}
                  </p>
                ))}
            </div>
          )}
        </aside>

        <main style={S.main}>
          {basicDetails?.professionalSummary && (
            <section style={S.section}>
              <h2 style={S.sectionLabel(accent)}>Professional summary</h2>
              <div
                style={S.summaryText}
                dangerouslySetInnerHTML={{ __html: asHtmlString(basicDetails.professionalSummary) }}
              />
            </section>
          )}

          {workExperience.length > 0 && (
            <section id="section-Experience" style={{ ...S.section, ...highlight("Experience") }}>
              <h2 style={S.sectionLabel(accent)}>Work experience</h2>
              <div style={S.entryList}>
                {workExperience.map((item, i) => (
                  <div key={i}>
                    <div style={S.entryHeadRow}>
                      <h3 style={S.entryTitle}>
                        {item?.role}
                        {item?.company && <span style={S.entrySub}>, {item.company}</span>}
                      </h3>
                      <span style={S.entryDate(accent)}>
                        {item?.start || item?.startDate} – {item?.end || item?.endDate || "Present"}
                      </span>
                    </div>
                    {item?.description && <p style={S.entryDesc}>{item.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {internshipDetails.length > 0 && (
            <section id="section-Internships" style={{ ...S.section, ...highlight("Internships") }}>
              <h2 style={S.sectionLabel(accent)}>Internships</h2>
              <div style={S.entryList}>
                {internshipDetails.map((item, i) => (
                  <div key={i}>
                    <div style={S.entryHeadRow}>
                      <h3 style={S.entryTitle}>
                        {item?.role}
                        {item?.company && <span style={S.entrySub}>, {item.company}</span>}
                      </h3>
                      <span style={S.entryDate(accent)}>
                        {item?.start || item?.startDate} – {item?.end || item?.endDate}
                      </span>
                    </div>
                    {item?.description && <p style={S.entryDesc}>{item.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {projectDetails.filter((p) => p?.project).length > 0 && (
            <section id="section-Projects" style={{ ...S.section, ...highlight("Projects") }}>
              <h2 style={S.sectionLabel(accent)}>Projects</h2>
              <div style={S.entryList}>
                {projectDetails
                  .filter((p) => p?.project)
                  .map((item, i) => (
                    <div key={i}>
                      <div style={S.entryHeadRow}>
                        <h3 style={S.entryTitle}>
                          {item.project}
                          {item?.company && <span style={S.entrySub}> — {item.company}</span>}
                        </h3>
                        <span style={S.entryDate(accent)}>
                          {item?.startDate} {item?.endDate ? `– ${item.endDate}` : ""}
                        </span>
                      </div>
                      <div style={S.entryDesc} dangerouslySetInnerHTML={{ __html: parseIfJson(item?.description) }} />
                    </div>
                  ))}
              </div>
            </section>
          )}

          {accDetails.filter((a) => a?.accomplishment || a?.description).length > 0 && (
            <section id="section-Accomplishments" style={{ ...S.section, ...highlight("Accomplishments") }}>
              <h2 style={S.sectionLabel(accent)}>Achievements</h2>
              <ul style={{ margin: 0, listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
                {accDetails
                  .filter((a) => a?.accomplishment || a?.description)
                  .map((item, i) => (
                    <li
                      key={i}
                      style={{ position: "relative", paddingLeft: "16px", fontSize: "14px", lineHeight: 1.55, color: "#333333" }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          left: 0,
                          top: "8px",
                          height: "4px",
                          width: "4px",
                          borderRadius: "50%",
                          backgroundColor: accent,
                        }}
                      />
                      <span style={{ fontWeight: 700, color: "#1a1a1a" }}>{item?.accomplishment}</span>
                      {item?.description ? ` — ${item.description}` : ""}
                    </li>
                  ))}
              </ul>
            </section>
          )}

          {educationDetails.length > 0 && (
            <section id="section-Education" style={{ ...S.section, ...highlight("Education") }}>
              <h2 style={S.sectionLabel(accent)}>Education</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {educationDetails.map((item, i) => (
                  <div key={i} style={S.entryHeadRow}>
                    <h3 style={{ ...S.entryTitle, fontSize: "14.5px" }}>
                      {item?.type} {item?.school ? `— ${item.school}` : ""}
                      {item?.grade ? `, ${item.grade}${item?.gradeType === "percentage" ? "%" : item?.gradeType ? "/10" : ""}` : ""}
                    </h3>
                    <span style={S.entryDate(accent)}>
                      {item?.startDate} – {item?.endDate}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default Template8;