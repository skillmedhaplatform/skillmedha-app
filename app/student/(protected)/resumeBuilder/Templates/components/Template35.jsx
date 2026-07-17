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
 * Template35 — "Skill Meters"
 * Dark sidebar renders skills and languages as horizontal proficiency
 * bars rather than plain text or pills — a common "gauge"-style motif on
 * design-forward resume builders — beside a white main column with the
 * usual chronological sections.
 */

const COLOR_OPTIONS = [
  { name: "Cyan", value: "#0891b2" },
  { name: "Lime", value: "#4d7c0f" },
  { name: "Magenta", value: "#a21caf" },
  { name: "Coral", value: "#c2410c" },
  { name: "Navy", value: "#1e3a5f" },
];

const withAlpha = (hex, alpha) => {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const LEVEL_TO_PERCENT = {
  native: 100, "first language": 100, fluent: 95, c2: 95, advanced: 85, c1: 85,
  "upper intermediate": 70, b2: 70, intermediate: 55, b1: 55, elementary: 35, a2: 35, beginner: 20, a1: 20,
};
const levelToPercent = (level) => {
  if (!level) return 75;
  return LEVEL_TO_PERCENT[String(level).trim().toLowerCase()] ?? 75;
};

const S = {
  page: { width: "100%", maxWidth: "100%", margin: "0 auto", height: "100%", overflowY: "auto", backgroundColor: "#ffffff", fontFamily: "'Inter', Arial, sans-serif", color: "#27272a", boxSizing: "border-box", display: "flex", alignItems: "stretch" },
  swatchRow: { display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderBottom: "1px solid #eeeeee" },
  swatchLabel: { fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#8a8a8a" },
  swatchBtn: (active, color) => ({ height: "18px", width: "18px", borderRadius: "50%", backgroundColor: color, border: "1px solid rgba(0,0,0,0.1)", outline: active ? `2px solid ${color}` : "none", outlineOffset: "2px", cursor: "pointer", padding: 0 }),
  sidebar: (accent) => ({ width: "34%", minWidth: "220px", flexShrink: 0, backgroundColor: "#1c1917", color: "#ffffff", padding: "30px 24px", boxSizing: "border-box" }),
  photo: { height: "92px", width: "92px", borderRadius: "50%", border: `3px solid ${withAlpha("#ffffff", 0.3)}`, objectFit: "cover", display: "block", margin: "0 auto 14px" },
  monogram: (accent) => ({ height: "92px", width: "92px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px", fontWeight: 700, margin: "0 auto 14px" }),
  name: { margin: 0, fontSize: "19px", fontWeight: 800, lineHeight: 1.25, textAlign: "center" },
  headline: (accent) => ({ margin: "4px 0 0", fontSize: "12px", fontWeight: 600, color: accent, textAlign: "center" }),
  sideDivider: { height: "1px", backgroundColor: "rgba(255,255,255,0.15)", margin: "20px 0", border: "none" },
  sideLabel: (accent) => ({ margin: "0 0 12px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", color: accent }),
  sideBlock: { marginBottom: "24px" },
  contactItem: { display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "11.5px", color: "rgba(255,255,255,0.85)", textDecoration: "none", marginBottom: "9px", wordBreak: "break-word" },
  meterRow: { marginBottom: "10px" },
  meterLabel: { display: "flex", justifyContent: "space-between", fontSize: "12px", color: "rgba(255,255,255,0.9)", marginBottom: "5px" },
  meterTrack: { height: "5px", width: "100%", borderRadius: "999px", backgroundColor: "rgba(255,255,255,0.14)" },
  meterFill: (accent, pct) => ({ height: "5px", width: `${pct}%`, borderRadius: "999px", backgroundColor: accent }),
  main: { flex: 1, padding: "34px 32px", minWidth: 0 },
  sectionLabel: (accent) => ({ margin: "0 0 12px", fontSize: "13.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: accent, paddingBottom: "6px", borderBottom: `2px solid ${accent}` }),
  section: { marginBottom: "26px" },
  summaryText: { fontSize: "14.5px", lineHeight: 1.65, color: "#333333" },
  entryList: { display: "flex", flexDirection: "column", gap: "16px" },
  entryHeadRow: { display: "flex", flexWrap: "wrap", alignItems: "baseline", justifyContent: "space-between", columnGap: "16px" },
  entryTitle: { margin: 0, fontSize: "15.5px", fontWeight: 700, color: "#1a1a1a" },
  entrySub: { fontWeight: 400, color: "#555555" },
  entryDate: (accent) => ({ whiteSpace: "nowrap", fontSize: "12px", fontWeight: 700, color: accent }),
  entryDesc: { margin: "4px 0 0", fontSize: "14px", lineHeight: 1.55, color: "#333333" },
};

const getInitials = (first, last) => `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase();

const Template35 = ({ resumeTemplateRef, activeSection, isGeneratingPdf }) => {
  const {
    basicDetails, educationDetails, workExperience, internshipDetails, projectDetails,
    accDetails, certificates, skills, languages, links, volunteerings,
  } = useResumeTemplateData();
  const profileBase64 = useProfileImage(basicDetails?.profile);
  const [accent, setAccent] = useState(COLOR_OPTIONS[0].value);

  const profileLinks = links.filter((item) => item?.link);
  const linkIcons = [<LinkedinFilled key="li" />, <GithubOutlined key="gh" />, <GlobalOutlined key="gl" />];

  const highlight = (name) => (activeSection === name ? { outline: `2px solid ${accent}`, outlineOffset: "4px", borderRadius: "6px" } : {});
  const dateRange = (item) => `${item?.start || item?.startDate || ""} – ${item?.end || item?.endDate || "Present"}`;
  const combinedExperience = [...workExperience, ...internshipDetails];

  const hasCerts = certificates.filter((c) => c?.name || c?.organization).length > 0;

  return (
    <div style={{ width: "100%", maxWidth: isGeneratingPdf ? "800px" : "100%", margin: "0 auto" }}>
      {!isGeneratingPdf && (
        <div style={S.swatchRow} className="print:hidden">
          <span style={S.swatchLabel}>Theme colour</span>
          {COLOR_OPTIONS.map((c) => (
            <button key={c.value} type="button" title={c.name} onClick={() => setAccent(c.value)} style={S.swatchBtn(accent === c.value, c.value)} />
          ))}
        </div>
      )}

      <div ref={resumeTemplateRef} style={S.page}>
        <aside id="section-Basic-Details" style={{ ...S.sidebar(accent), ...highlight("Basic Details") }}>
          {profileBase64 ? (
            <img src={profileBase64} alt="profile" style={S.photo} />
          ) : (
            <div style={S.monogram(accent)}>{getInitials(basicDetails?.firstName, basicDetails?.lastName)}</div>
          )}
          <h1 style={S.name}>{basicDetails?.firstName} {basicDetails?.middleName} {basicDetails?.lastName}</h1>
          {workExperience?.[0]?.role && <p style={S.headline(accent)}>{workExperience[0].role}</p>}

          <hr style={S.sideDivider} />

          <div style={S.sideBlock}>
            <h2 style={S.sideLabel(accent)}>Contact</h2>
            {basicDetails?.email && <a href={`mailto:${basicDetails.email}`} style={S.contactItem}><MailOutlined /> <span>{basicDetails.email}</span></a>}
            {basicDetails?.phone && <a href={`tel:${basicDetails.phone}`} style={S.contactItem}><PhoneFilled /> <span>{basicDetails.phone}</span></a>}
            {basicDetails?.city && <span style={S.contactItem}><EnvironmentOutlined /> <span>{basicDetails.city}</span></span>}
            {profileLinks.slice(0, 2).map((item, i) => (
              <a key={i} href={normalizeExternalLink(item.link)} target="_blank" rel="noopener noreferrer" style={S.contactItem}>
                {linkIcons[i] || <GlobalOutlined />} <span>{item.title || item.link}</span>
              </a>
            ))}
          </div>

          {skills.filter(Boolean).length > 0 && (
            <div id="section-Skills" style={{ ...S.sideBlock, ...highlight("Skills") }}>
              <h2 style={S.sideLabel(accent)}>Skills</h2>
              {skills.filter(Boolean).map((skill, i) => (
                <div key={i} style={S.meterRow}>
                  <div style={S.meterLabel}><span>{skill}</span></div>
                  <div style={S.meterTrack}><div style={S.meterFill(accent, 70 + ((i * 7) % 30))} /></div>
                </div>
              ))}
            </div>
          )}

          {languages.filter(Boolean).length > 0 && (
            <div id="section-Languages" style={{ ...S.sideBlock, ...highlight("Languages") }}>
              <h2 style={S.sideLabel(accent)}>Languages</h2>
              {languages.filter(Boolean).map((l, i) => {
                const name = typeof l === "object" && l !== null ? l.name : l;
                const level = typeof l === "object" && l !== null ? l.level : null;
                return (
                  <div key={i} style={S.meterRow}>
                    <div style={S.meterLabel}><span>{name}</span>{level && <span>{level}</span>}</div>
                    <div style={S.meterTrack}><div style={S.meterFill(accent, levelToPercent(level))} /></div>
                  </div>
                );
              })}
            </div>
          )}

          {hasCerts && (
            <div id="section-Certifications" style={{ ...S.sideBlock, ...highlight("Certifications") }}>
              <h2 style={S.sideLabel(accent)}>Certifications</h2>
              {certificates.filter((c) => c?.name || c?.organization).map((item, i) => (
                <p key={i} style={{ margin: "0 0 8px", fontSize: "11.5px", color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>
                  <span style={{ fontWeight: 700, color: "#ffffff" }}>{item?.name}</span>{item?.organization ? ` — ${item.organization}` : ""}
                </p>
              ))}
            </div>
          )}
        </aside>

        <main style={S.main}>
          {basicDetails?.professionalSummary && (
            <section style={S.section}>
              <h2 style={S.sectionLabel(accent)}>Profile summary</h2>
              <div style={S.summaryText} dangerouslySetInnerHTML={{ __html: asHtmlString(basicDetails.professionalSummary) }} />
            </section>
          )}

          {combinedExperience.length > 0 && (
            <section id="section-Experience" style={{ ...S.section, ...highlight("Experience") }}>
              <h2 style={S.sectionLabel(accent)}>Work experience</h2>
              <div style={S.entryList}>
                {combinedExperience.map((item, i) => (
                  <div key={i}>
                    <div style={S.entryHeadRow}>
                      <h3 style={S.entryTitle}>{item?.role}{item?.company && <span style={S.entrySub}>, {item.company}</span>}</h3>
                      <span style={S.entryDate(accent)}>{dateRange(item)}</span>
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
                {projectDetails.filter((p) => p?.project).map((item, i) => (
                  <div key={i}>
                    <div style={S.entryHeadRow}>
                      <h3 style={S.entryTitle}>{item.project}{item?.company && <span style={S.entrySub}> — {item.company}</span>}</h3>
                      <span style={S.entryDate(accent)}>{item?.startDate} {item?.endDate ? `– ${item.endDate}` : ""}</span>
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

          {educationDetails.length > 0 && (
            <section id="section-Education" style={{ ...S.section, ...highlight("Education") }}>
              <h2 style={S.sectionLabel(accent)}>Education</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {educationDetails.map((item, i) => (
                  <div key={i} style={S.entryHeadRow}>
                    <h3 style={{ ...S.entryTitle, fontSize: "14.5px" }}>{item?.type} {item?.school ? `— ${item.school}` : ""}</h3>
                    <span style={S.entryDate(accent)}>{item?.startDate} – {item?.endDate}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {volunteerings.filter((v) => v?.organization || v?.volunteering).length > 0 && (
            <section id="section-Volunteering" style={{ ...S.section, ...highlight("Volunteering") }}>
              <h2 style={S.sectionLabel(accent)}>Volunteering</h2>
              <div style={S.entryList}>
                {volunteerings.filter((v) => v?.organization || v?.volunteering).map((item, i) => (
                  <div key={i}>
                    <h3 style={S.entryTitle}>{item?.volunteering}{item?.organization && <span style={S.entrySub}>, {item.organization}</span>}</h3>
                    {item?.description && <div style={S.entryDesc} dangerouslySetInnerHTML={{ __html: asHtmlString(item.description) }} />}
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

export default Template35;
