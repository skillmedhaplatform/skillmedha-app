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
 * Template8 — "Modern Colour Block"
 * Inspired by the "Modern" family on Resume-Now: a full-width
 * coloured hero with photo, then a light-tint left sidebar for
 * skills/languages/certifications/links and a white main column
 * for summary/experience/education/projects.
 *
 * All visual rules are inline `style` objects, not Tailwind
 * bracket-value classes — see the note at the top of Template7
 * for why that matters for build-safety.
 */

const COLOR_OPTIONS = [
  { name: "Balanced Blue", value: "#4585DD" },
  { name: "Team Teal", value: "#00A4C1" },
  { name: "Empathic Emerald", value: "#2C806E" },
  { name: "Creative Marigold", value: "#F6911E" },
  { name: "Ambitious Red", value: "#CB454E" },
  { name: "Assertive Asphalt", value: "#34393E" },
];

const tint = (hex, opacity) => {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

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
  },
  swatchRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    borderBottom: "1px solid #eeeeee",
    padding: "8px 32px",
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
  hero: (accent) => ({
    display: "flex",
    alignItems: "center",
    gap: "20px",
    padding: "26px 32px",
    backgroundColor: accent,
    color: "#ffffff",
  }),
  photo: {
    height: "96px",
    width: "96px",
    flexShrink: 0,
    borderRadius: "50%",
    border: "3px solid #ffffff",
    objectFit: "cover",
  },
  name: { margin: 0, fontSize: "27px", fontWeight: 700, lineHeight: 1.2 },
  headline: { margin: "6px 0 0", fontSize: "16px", fontWeight: 500, color: "rgba(255,255,255,0.9)" },
  contactRow: {
    marginTop: "10px",
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "8px 20px",
    fontSize: "13px",
    color: "rgba(255,255,255,0.85)",
  },
  contactLink: { display: "flex", alignItems: "center", gap: "6px", textDecoration: "none", color: "rgba(255,255,255,0.85)" },
  columns: { display: "grid", gridTemplateColumns: "220px 1fr" },
  sidebar: (accent) => ({ backgroundColor: tint(accent, 0.07), padding: "26px 22px", display: "flex", flexDirection: "column", gap: "22px" }),
  main: { padding: "26px 32px" },
  sideLabel: (accent) => ({ margin: "0 0 8px", fontSize: "11.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: accent }),
  sideItem: { fontSize: "13.5px", color: "#333333" },
  mainLabel: (accent) => ({
    margin: "0 0 10px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: accent,
  }),
  labelBar: (accent) => ({ height: "14px", width: "4px", borderRadius: "2px", backgroundColor: accent, display: "inline-block" }),
  section: { marginBottom: "24px" },
  summaryText: { fontSize: "14.5px", lineHeight: 1.6, color: "#333333" },
  entryHeadRow: { display: "flex", flexWrap: "wrap", alignItems: "center", columnGap: "16px" },
  entryTitle: { margin: 0, flex: "1 1 auto", minWidth: 0, fontSize: "15.5px", fontWeight: 700, color: "#1a1a1a" },
  entrySub: { fontWeight: 400, color: "#555555" },
  entryDate: (accent) => ({ flexShrink: 0, marginLeft: "auto", whiteSpace: "nowrap", fontSize: "12.5px", fontWeight: 700, color: accent }),
  entryDesc: { margin: "4px 0 0", fontSize: "14px", lineHeight: 1.55, color: "#333333" },
};

const Template8 = ({ resumeTemplateRef, activeSection, isGeneratingPdf, accent: accentProp, onAccentChange }) => {
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
  const [internalAccent, setInternalAccent] = useState(COLOR_OPTIONS[0].value);
  const accent = accentProp ?? internalAccent;
  const setAccent = onAccentChange ?? setInternalAccent;

  const profileLinks = links.filter((item) => item?.link);
  const linkIcons = [<LinkedinFilled key="li" />, <GithubOutlined key="gh" />, <GlobalOutlined key="gl" />];

  const highlight = (name) =>
    activeSection === name ? { outline: `2px solid ${accent}`, outlineOffset: "4px", borderRadius: "6px" } : {};

  return (
    <div ref={resumeTemplateRef} style={{ ...S.page, maxWidth: isGeneratingPdf ? "800px" : "100%" }}>
      {!isGeneratingPdf && (
        <div style={S.swatchRow} className="print:hidden">
          <span style={S.swatchLabel}>Theme colour</span>
          {COLOR_OPTIONS.map((c) => (
            <button key={c.value} type="button" title={c.name} onClick={() => setAccent(c.value)} style={S.swatchBtn(accent === c.value, c.value)} />
          ))}
        </div>
      )}

      <header id="section-Basic-Details" style={highlight("Basic Details")}>
        <div style={S.hero(accent)}>
          {profileBase64 && <img src={profileBase64} alt="profile" style={S.photo} />}
          <div style={{ minWidth: 0 }}>
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
            </div>
          </div>
        </div>
      </header>

      <div style={S.columns}>
        <aside style={S.sidebar(accent)}>
          {skills.filter(Boolean).length > 0 && (
            <div id="section-Skills" style={highlight("Skills")}>
              <h2 style={S.sideLabel(accent)}>Skills</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {skills.filter(Boolean).map((skill, i) => (
                  <div key={i} style={S.sideItem}>{skill}</div>
                ))}
              </div>
            </div>
          )}

          {languages.filter(Boolean).length > 0 && (
            <div id="section-Languages" style={highlight("Languages")}>
              <h2 style={S.sideLabel(accent)}>Languages</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {languages.filter(Boolean).map((lang, i) => (
                  <div key={i} style={S.sideItem}>{lang}</div>
                ))}
              </div>
            </div>
          )}

          {certificates.filter((c) => c?.name || c?.organization).length > 0 && (
            <div id="section-Certifications" style={highlight("Certifications")}>
              <h2 style={S.sideLabel(accent)}>Certifications</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {certificates.filter((c) => c?.name || c?.organization).map((item, i) => (
                  <div key={i}>
                    <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#1a1a1a" }}>{item?.name}</p>
                    <p style={{ margin: 0, fontSize: "12px", color: "#666666" }}>{item?.organization}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {volunteerings.filter((v) => v?.organization || v?.volunteering).length > 0 && (
            <div id="section-Volunteering" style={highlight("Volunteering")}>
              <h2 style={S.sideLabel(accent)}>Volunteering</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {volunteerings.filter((v) => v?.organization || v?.volunteering).map((item, i) => (
                  <div key={i}>
                    <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#1a1a1a" }}>{item?.volunteering}</p>
                    <p style={{ margin: 0, fontSize: "12px", color: "#666666" }}>{item?.organization}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {profileLinks.length > 0 && (
            <div id="section-Links" style={highlight("Links")}>
              <h2 style={S.sideLabel(accent)}>Links</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {profileLinks.map((item, i) => (
                  <a
                    key={i}
                    href={normalizeExternalLink(item.link)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#333333", textDecoration: "none", wordBreak: "break-all" }}
                  >
                    {linkIcons[i] || <GlobalOutlined />} <span>{item.title || item.link}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </aside>

        <main style={S.main}>
          {basicDetails?.professionalSummary && (
            <section style={S.section}>
              <h2 style={S.mainLabel(accent)}>
                <span style={S.labelBar(accent)} /> Summary
              </h2>
              <div style={S.summaryText} dangerouslySetInnerHTML={{ __html: asHtmlString(basicDetails.professionalSummary) }} />
            </section>
          )}

          {workExperience.length > 0 && (
            <section id="section-Experience" style={{ ...S.section, ...highlight("Experience") }}>
              <h2 style={S.mainLabel(accent)}>
                <span style={S.labelBar(accent)} /> Experience
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {workExperience.map((item, i) => (
                  <div key={i} style={{ position: "relative", borderLeft: `2px solid ${tint(accent, 0.3)}`, paddingLeft: "16px" }}>
                    <span style={{ position: "absolute", left: "-5px", top: "4px", height: "8px", width: "8px", borderRadius: "50%", backgroundColor: accent }} />
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
              <h2 style={S.mainLabel(accent)}>
                <span style={S.labelBar(accent)} /> Internships
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {internshipDetails.map((item, i) => (
                  <div key={i} style={{ position: "relative", borderLeft: `2px solid ${tint(accent, 0.3)}`, paddingLeft: "16px" }}>
                    <span style={{ position: "absolute", left: "-5px", top: "4px", height: "8px", width: "8px", borderRadius: "50%", backgroundColor: accent }} />
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

          {educationDetails.length > 0 && (
            <section id="section-Education" style={{ ...S.section, ...highlight("Education") }}>
              <h2 style={S.mainLabel(accent)}>
                <span style={S.labelBar(accent)} /> Education
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {educationDetails.map((item, i) => (
                  <div key={i} style={S.entryHeadRow}>
                    <h3 style={{ ...S.entryTitle, fontSize: "14.5px" }}>
                      {item?.type} {item?.school ? `— ${item.school}` : ""}
                    </h3>
                    <span style={S.entryDate(accent)}>
                      {item?.startDate} – {item?.endDate}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {projectDetails.filter((p) => p?.project).length > 0 && (
            <section id="section-Projects" style={{ ...S.section, ...highlight("Projects") }}>
              <h2 style={S.mainLabel(accent)}>
                <span style={S.labelBar(accent)} /> Projects
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {projectDetails.filter((p) => p?.project).map((item, i) => (
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
            <section id="section-Accomplishments" style={{ marginBottom: "8px", ...highlight("Accomplishments") }}>
              <h2 style={S.mainLabel(accent)}>
                <span style={S.labelBar(accent)} /> Achievements
              </h2>
              <ul style={{ margin: 0, listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
                {accDetails.filter((a) => a?.accomplishment || a?.description).map((item, i) => (
                  <li key={i} style={{ position: "relative", paddingLeft: "16px", fontSize: "14px", lineHeight: 1.55, color: "#333333" }}>
                    <span style={{ position: "absolute", left: 0, top: "8px", height: "4px", width: "4px", borderRadius: "50%", backgroundColor: accent }} />
                    <span style={{ fontWeight: 700, color: "#1a1a1a" }}>{item?.accomplishment}</span>
                    {item?.description ? ` — ${item.description}` : ""}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default Template8;