"use client";

import React, { useState } from "react";
import {
  GithubOutlined,
  GlobalOutlined,
  LinkedinFilled,
  MailOutlined,
  PhoneFilled,
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
 * Template23 — "Gradient Executive"
 * Full-width gradient header band (photo/initials, name, contact row)
 * followed by a two-column body: a wide main column for summary,
 * experience, projects and achievements, plus a narrow right sidebar for
 * skills, education, certifications and languages. Every rule is an
 * inline `style` object (same approach as Template20) so it renders
 * correctly independent of Tailwind's JIT scan.
 */

const COLOR_OPTIONS = [
  { name: "Sunset Coral", from: "#ff6b6b", to: "#f06595", accent: "#e8447a" },
  { name: "Ocean Blue", from: "#1E69DA", to: "#5694F0", accent: "#1754B4" },
  { name: "Forest Green", from: "#1C8A63", to: "#3fb886", accent: "#146c4b" },
  { name: "Royal Violet", from: "#6d3fc0", to: "#9c6ade", accent: "#5a2fa8" },
  { name: "Slate Steel", from: "#34393E", to: "#5c646c", accent: "#22262a" },
];

const withAlpha = (hex, alpha) => {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const S = {
  page: {
    width: "100%",
    maxWidth: "100%",
    margin: "0 auto",
    height: "100%",
    overflowY: "auto",
    backgroundColor: "#f5f6f8",
    fontFamily: "'Inter', Arial, sans-serif",
    color: "#2b2b2b",
    boxSizing: "border-box",
  },
  swatchRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "14px 24px 0",
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
  header: (from, to) => ({
    background: `linear-gradient(135deg, ${from}, ${to})`,
    padding: "32px 28px",
    display: "flex",
    alignItems: "center",
    gap: "22px",
    flexWrap: "wrap",
    color: "#ffffff",
  }),
  avatar: {
    height: "84px",
    width: "84px",
    flexShrink: 0,
    borderRadius: "50%",
    backgroundColor: "rgba(255,255,255,0.2)",
    border: "3px solid rgba(255,255,255,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    fontWeight: 700,
    color: "#ffffff",
    overflow: "hidden",
  },
  photo: { height: "100%", width: "100%", objectFit: "cover" },
  name: { margin: 0, fontSize: "27px", fontWeight: 800, lineHeight: 1.2 },
  headline: { margin: "4px 0 0", fontSize: "14.5px", fontWeight: 500, opacity: 0.92 },
  contactRow: { display: "flex", flexWrap: "wrap", gap: "8px 18px", marginTop: "10px", fontSize: "12.5px" },
  contactLink: { display: "flex", alignItems: "center", gap: "6px", textDecoration: "none", color: "#ffffff" },
  body: { display: "grid", gridTemplateColumns: "1fr 300px", gap: "0", alignItems: "start" },
  main: { padding: "26px 28px", display: "flex", flexDirection: "column", gap: "24px" },
  sidebar: { padding: "26px 24px", display: "flex", flexDirection: "column", gap: "24px", backgroundColor: "#ffffff", borderLeft: "1px solid #e7e9ee" },
  sectionLabel: (accent) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    margin: "0 0 12px",
    fontSize: "13px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "#1a1a1a",
  }),
  labelBar: (accent) => ({ height: "14px", width: "4px", borderRadius: "2px", backgroundColor: accent, flexShrink: 0 }),
  summaryText: { fontSize: "14.5px", lineHeight: 1.65, color: "#3a3a3a", margin: 0 },
  entryList: { display: "flex", flexDirection: "column", gap: "18px" },
  entryHeadRow: { display: "flex", flexWrap: "wrap", alignItems: "baseline", justifyContent: "space-between", columnGap: "16px" },
  entryTitle: { margin: 0, fontSize: "15px", fontWeight: 700, color: "#1a1a1a" },
  entrySub: { fontWeight: 500, color: "#666666" },
  entryDate: (accent) => ({
    whiteSpace: "nowrap",
    fontSize: "12px",
    fontWeight: 700,
    color: accent,
    backgroundColor: withAlpha(accent, 0.1),
    padding: "3px 10px",
    borderRadius: "999px",
  }),
  entryDesc: { margin: "6px 0 0", fontSize: "14px", lineHeight: 1.6, color: "#3a3a3a" },
  skillsRow: { display: "flex", flexWrap: "wrap", gap: "7px" },
  skillPill: (accent) => ({
    fontSize: "12px",
    fontWeight: 600,
    color: accent,
    backgroundColor: withAlpha(accent, 0.1),
    padding: "5px 12px",
    borderRadius: "999px",
  }),
  sideEntry: { marginBottom: "10px" },
  sideTitle: { margin: 0, fontSize: "13px", fontWeight: 700, color: "#1a1a1a" },
  sideSub: { margin: "1px 0 0", fontSize: "12px", color: "#666666" },
  sideMeta: { margin: "1px 0 0", fontSize: "11.5px", color: "#94a3b8" },
};

const getInitials = (first, last) => `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase();

const Template23 = ({ resumeTemplateRef, activeSection, isGeneratingPdf }) => {
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
  const [theme, setTheme] = useState(COLOR_OPTIONS[1]);

  const profileLinks = links.filter((item) => item?.link);
  const linkIcons = [<LinkedinFilled key="li" />, <GithubOutlined key="gh" />, <GlobalOutlined key="gl" />];

  const highlight = (name) =>
    activeSection === name
      ? { outline: `2px solid ${theme.accent}`, outlineOffset: "-2px", borderRadius: "10px" }
      : {};

  const dateRange = (item) =>
    `${item?.start || item?.startDate || ""} – ${item?.end || item?.endDate || "Present"}`;

  const combinedExperience = [...workExperience, ...internshipDetails];

  return (
    <div
      ref={resumeTemplateRef}
      style={{ ...S.page, maxWidth: isGeneratingPdf ? "800px" : "100%", backgroundColor: isGeneratingPdf ? "#ffffff" : S.page.backgroundColor }}
    >
      {!isGeneratingPdf && (
        <div style={S.swatchRow} className="print:hidden">
          <span style={S.swatchLabel}>Theme colour</span>
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c.name}
              type="button"
              title={c.name}
              onClick={() => setTheme(c)}
              style={S.swatchBtn(theme.name === c.name, c.accent)}
            />
          ))}
        </div>
      )}

      <header id="section-Basic-Details" style={{ ...S.header(theme.from, theme.to), ...highlight("Basic Details") }}>
        <div style={S.avatar}>
          {profileBase64 ? (
            <img src={profileBase64} alt="profile" style={S.photo} />
          ) : (
            getInitials(basicDetails?.firstName, basicDetails?.lastName)
          )}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <h1 style={S.name}>
            {basicDetails?.firstName} {basicDetails?.middleName} {basicDetails?.lastName}
          </h1>
          {workExperience?.[0]?.role && <p style={S.headline}>{workExperience[0].role}</p>}
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
            {basicDetails?.city && (
              <span style={S.contactLink}>
                <EnvironmentOutlined /> <span>{basicDetails.city}</span>
              </span>
            )}
            {profileLinks.slice(0, 3).map((item, i) => (
              <a
                key={i}
                href={normalizeExternalLink(item.link)}
                target="_blank"
                rel="noopener noreferrer"
                style={S.contactLink}
              >
                {linkIcons[i] || <GlobalOutlined />} <span>{item.title || item.link}</span>
              </a>
            ))}
          </div>
        </div>
      </header>

      <div style={S.body}>
        <div style={S.main}>
          {basicDetails?.professionalSummary && (
            <section>
              <h2 style={S.sectionLabel(theme.accent)}>
                <span style={S.labelBar(theme.accent)} /> Professional Summary
              </h2>
              <div style={S.summaryText} dangerouslySetInnerHTML={{ __html: asHtmlString(basicDetails.professionalSummary) }} />
            </section>
          )}

          {combinedExperience.length > 0 && (
            <section id="section-Experience" style={{ ...highlight("Experience"), padding: "6px" }}>
              <h2 style={S.sectionLabel(theme.accent)}>
                <span style={S.labelBar(theme.accent)} /> Experience
              </h2>
              <div style={S.entryList}>
                {combinedExperience.map((item, i) => (
                  <div key={i}>
                    <div style={S.entryHeadRow}>
                      <h3 style={S.entryTitle}>
                        {item?.role}
                        {item?.company && <span style={S.entrySub}>, {item.company}</span>}
                      </h3>
                      <span style={S.entryDate(theme.accent)}>{dateRange(item)}</span>
                    </div>
                    {item?.description && (
                      <div style={S.entryDesc} dangerouslySetInnerHTML={{ __html: asHtmlString(item.description) }} />
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {projectDetails.filter((p) => p?.project).length > 0 && (
            <section id="section-Projects" style={{ ...highlight("Projects"), padding: "6px" }}>
              <h2 style={S.sectionLabel(theme.accent)}>
                <span style={S.labelBar(theme.accent)} /> Projects
              </h2>
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
                        <span style={S.entryDate(theme.accent)}>
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
            <section id="section-Accomplishments" style={{ ...highlight("Accomplishments"), padding: "6px" }}>
              <h2 style={S.sectionLabel(theme.accent)}>
                <span style={S.labelBar(theme.accent)} /> Achievements
              </h2>
              <ul style={{ margin: 0, listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                {accDetails
                  .filter((a) => a?.accomplishment || a?.description)
                  .map((item, i) => (
                    <li key={i} style={{ position: "relative", paddingLeft: "16px", fontSize: "14px", lineHeight: 1.55, color: "#3a3a3a" }}>
                      <span
                        style={{
                          position: "absolute",
                          left: 0,
                          top: "8px",
                          height: "5px",
                          width: "5px",
                          borderRadius: "50%",
                          backgroundColor: theme.accent,
                        }}
                      />
                      <span style={{ fontWeight: 700, color: "#1a1a1a" }}>{item?.accomplishment}</span>
                      {item?.description ? ` — ${item.description}` : ""}
                    </li>
                  ))}
              </ul>
            </section>
          )}

          {volunteerings.filter((v) => v?.organization || v?.volunteering).length > 0 && (
            <section id="section-Volunteering" style={{ ...highlight("Volunteering"), padding: "6px" }}>
              <h2 style={S.sectionLabel(theme.accent)}>
                <span style={S.labelBar(theme.accent)} /> Volunteering
              </h2>
              <div style={S.entryList}>
                {volunteerings
                  .filter((v) => v?.organization || v?.volunteering)
                  .map((item, i) => (
                    <div key={i}>
                      <h3 style={S.entryTitle}>
                        {item?.volunteering}
                        {item?.organization && <span style={S.entrySub}>, {item.organization}</span>}
                      </h3>
                      {item?.description && (
                        <div style={S.entryDesc} dangerouslySetInnerHTML={{ __html: asHtmlString(item.description) }} />
                      )}
                    </div>
                  ))}
              </div>
            </section>
          )}
        </div>

        <div style={S.sidebar}>
          {skills.filter(Boolean).length > 0 && (
            <section id="section-Skills" style={{ ...highlight("Skills"), padding: "6px" }}>
              <h2 style={S.sectionLabel(theme.accent)}>
                <span style={S.labelBar(theme.accent)} /> Skills
              </h2>
              <div style={S.skillsRow}>
                {skills.filter(Boolean).map((skill, i) => (
                  <span key={i} style={S.skillPill(theme.accent)}>{skill}</span>
                ))}
              </div>
            </section>
          )}

          {educationDetails.length > 0 && (
            <section id="section-Education" style={{ ...highlight("Education"), padding: "6px" }}>
              <h2 style={S.sectionLabel(theme.accent)}>
                <span style={S.labelBar(theme.accent)} /> Education
              </h2>
              {educationDetails.map((item, i) => (
                <div key={i} style={S.sideEntry}>
                  <p style={S.sideTitle}>{item?.type}</p>
                  <p style={S.sideSub}>{item?.school || item?.board}</p>
                  <p style={S.sideMeta}>{item?.startDate} – {item?.endDate}</p>
                </div>
              ))}
            </section>
          )}

          {certificates.filter((c) => c?.name || c?.organization).length > 0 && (
            <section id="section-Certifications" style={{ ...highlight("Certifications"), padding: "6px" }}>
              <h2 style={S.sectionLabel(theme.accent)}>
                <span style={S.labelBar(theme.accent)} /> Certifications
              </h2>
              {certificates
                .filter((c) => c?.name || c?.organization)
                .map((item, i) => (
                  <div key={i} style={S.sideEntry}>
                    <p style={S.sideTitle}>{item?.name}</p>
                    <p style={S.sideSub}>{item?.organization}</p>
                  </div>
                ))}
            </section>
          )}

          {languages.filter(Boolean).length > 0 && (
            <section id="section-Languages" style={{ ...highlight("Languages"), padding: "6px" }}>
              <h2 style={S.sectionLabel(theme.accent)}>
                <span style={S.labelBar(theme.accent)} /> Languages
              </h2>
              {languages.filter(Boolean).map((l, i) => {
                const name = typeof l === "object" && l !== null ? l.name : l;
                const level = typeof l === "object" && l !== null ? l.level : null;
                return (
                  <div key={i} style={S.sideEntry}>
                    <p style={S.sideTitle}>{name}</p>
                    {level && <p style={S.sideSub}>{level}</p>}
                  </div>
                );
              })}
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default Template23;
