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
 * Template34 — "Corner Grid"
 * Name and photo anchored to the top-left corner with a thin rule below,
 * then a symmetric two-column grid (unlike a fixed sidebar, both columns
 * are equal width and both carry chronological content) — left runs
 * Summary/Experience/Projects, right runs Education/Skills/Languages.
 */

const COLOR_OPTIONS = [
  { name: "Cobalt", value: "#1d4ed8" },
  { name: "Pine", value: "#166534" },
  { name: "Berry", value: "#9d174d" },
  { name: "Rust", value: "#9a3412" },
  { name: "Graphite", value: "#3f3f46" },
];

const withAlpha = (hex, alpha) => {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const S = {
  page: { width: "100%", maxWidth: "100%", margin: "0 auto", height: "100%", overflowY: "auto", backgroundColor: "#ffffff", fontFamily: "'Inter', Arial, sans-serif", color: "#27272a", boxSizing: "border-box", padding: "36px 34px" },
  swatchRow: { display: "flex", alignItems: "center", gap: "8px", padding: "0 0 16px" },
  swatchLabel: { fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#8a8a8a" },
  swatchBtn: (active, color) => ({ height: "18px", width: "18px", borderRadius: "50%", backgroundColor: color, border: "1px solid rgba(0,0,0,0.1)", outline: active ? `2px solid ${color}` : "none", outlineOffset: "2px", cursor: "pointer", padding: 0 }),
  header: { display: "flex", alignItems: "center", gap: "16px" },
  photo: { height: "76px", width: "76px", borderRadius: "10px", objectFit: "cover", flexShrink: 0 },
  monogram: (accent) => ({ height: "76px", width: "76px", borderRadius: "10px", backgroundColor: withAlpha(accent, 0.12), color: accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: 700, flexShrink: 0 }),
  name: { margin: 0, fontSize: "23px", fontWeight: 800, color: "#111827" },
  headline: (accent) => ({ margin: "3px 0 0", fontSize: "13.5px", fontWeight: 600, color: accent }),
  contactRow: { marginTop: "6px", display: "flex", flexWrap: "wrap", gap: "5px 14px", fontSize: "12px", color: "#4b5563" },
  contactLink: { display: "flex", alignItems: "center", gap: "5px", textDecoration: "none", color: "#4b5563" },
  rule: (accent) => ({ height: "2px", width: "100%", backgroundColor: accent, margin: "18px 0 22px" }),
  grid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "0 30px" },
  sectionLabel: (accent) => ({ margin: "0 0 10px", fontSize: "12.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: accent }),
  section: { marginBottom: "22px" },
  summaryText: { fontSize: "13.5px", lineHeight: 1.6, color: "#333333" },
  skillsRow: { display: "flex", flexWrap: "wrap", gap: "6px" },
  skillPill: (accent) => ({ fontSize: "12px", fontWeight: 600, color: accent, backgroundColor: withAlpha(accent, 0.1), padding: "4px 10px", borderRadius: "6px" }),
  entryList: { display: "flex", flexDirection: "column", gap: "14px" },
  entryHeadRow: { display: "flex", flexWrap: "wrap", alignItems: "center", columnGap: "12px" },
  entryTitle: { margin: 0, flex: "1 1 auto", minWidth: 0, fontSize: "14px", fontWeight: 700, color: "#1a1a1a" },
  entrySub: { fontWeight: 400, color: "#666666" },
  entryDate: (accent) => ({ flexShrink: 0, marginLeft: "auto", whiteSpace: "nowrap", fontSize: "11.5px", fontWeight: 700, color: accent }),
  entryDesc: { margin: "4px 0 0", fontSize: "13px", lineHeight: 1.55, color: "#333333" },
};

const getInitials = (first, last) => `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase();

const Template34 = ({ resumeTemplateRef, activeSection, isGeneratingPdf, accent: accentProp, onAccentChange }) => {
  const {
    basicDetails, educationDetails, workExperience, internshipDetails, projectDetails,
    accDetails, certificates, skills, languages, links, volunteerings,
  } = useResumeTemplateData();
  const profileBase64 = useProfileImage(basicDetails?.profile);
  const [internalAccent, setInternalAccent] = useState(COLOR_OPTIONS[0].value);
  const accent = accentProp ?? internalAccent;
  const setAccent = onAccentChange ?? setInternalAccent;

  const profileLinks = links.filter((item) => item?.link);
  const linkIcons = [<LinkedinFilled key="li" />, <GithubOutlined key="gh" />, <GlobalOutlined key="gl" />];

  const highlight = (name) => (activeSection === name ? { outline: `2px solid ${accent}`, outlineOffset: "4px", borderRadius: "8px" } : {});
  const dateRange = (item) => `${item?.start || item?.startDate || ""} – ${item?.end || item?.endDate || "Present"}`;
  const combinedExperience = [...workExperience, ...internshipDetails];

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
        <header id="section-Basic-Details" style={{ ...S.header, ...highlight("Basic Details") }}>
          {profileBase64 ? (
            <img src={profileBase64} alt="profile" style={S.photo} />
          ) : (
            <div style={S.monogram(accent)}>{getInitials(basicDetails?.firstName, basicDetails?.lastName)}</div>
          )}
          <div style={{ minWidth: 0 }}>
            <h1 style={S.name}>{basicDetails?.firstName} {basicDetails?.middleName} {basicDetails?.lastName}</h1>
            {workExperience?.[0]?.role && <p style={S.headline(accent)}>{workExperience[0].role}</p>}
            <div style={S.contactRow}>
              {basicDetails?.email && <a href={`mailto:${basicDetails.email}`} style={S.contactLink}><MailOutlined /> <span>{basicDetails.email}</span></a>}
              {basicDetails?.phone && <a href={`tel:${basicDetails.phone}`} style={S.contactLink}><PhoneFilled /> <span>{basicDetails.phone}</span></a>}
              {basicDetails?.city && <span style={S.contactLink}><EnvironmentOutlined /> <span>{basicDetails.city}</span></span>}
              {profileLinks.slice(0, 2).map((item, i) => (
                <a key={i} href={normalizeExternalLink(item.link)} target="_blank" rel="noopener noreferrer" style={S.contactLink}>
                  {linkIcons[i] || <GlobalOutlined />} <span>{item.title || item.link}</span>
                </a>
              ))}
            </div>
          </div>
        </header>

        <div style={S.rule(accent)} />

        <div style={S.grid}>
          <div>
            {basicDetails?.professionalSummary && (
              <section style={S.section}>
                <h2 style={S.sectionLabel(accent)}>Summary</h2>
                <div style={S.summaryText} dangerouslySetInnerHTML={{ __html: asHtmlString(basicDetails.professionalSummary) }} />
              </section>
            )}

            {combinedExperience.length > 0 && (
              <section id="section-Experience" style={{ ...S.section, ...highlight("Experience") }}>
                <h2 style={S.sectionLabel(accent)}>Experience</h2>
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
          </div>

          <div>
            {educationDetails.length > 0 && (
              <section id="section-Education" style={{ ...S.section, ...highlight("Education") }}>
                <h2 style={S.sectionLabel(accent)}>Education</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {educationDetails.map((item, i) => (
                    <div key={i}>
                      <h3 style={S.entryTitle}>{item?.type}</h3>
                      <p style={{ margin: 0, fontSize: "13px", color: "#666666" }}>{item?.school || item?.board}</p>
                      <span style={S.entryDate(accent)}>{item?.startDate} – {item?.endDate}</span>
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
                    <li key={i} style={{ position: "relative", paddingLeft: "14px", fontSize: "13px", lineHeight: 1.5, color: "#3a3a3a" }}>
                      <span style={{ position: "absolute", left: 0, top: "7px", height: "4px", width: "4px", borderRadius: "50%", backgroundColor: accent }} />
                      <span style={{ fontWeight: 700, color: "#1a1a1a" }}>{item?.accomplishment}</span>
                      {item?.description ? ` — ${item.description}` : ""}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {skills.filter(Boolean).length > 0 && (
              <section id="section-Skills" style={{ ...S.section, ...highlight("Skills") }}>
                <h2 style={S.sectionLabel(accent)}>Skills</h2>
                <div style={S.skillsRow}>{skills.filter(Boolean).map((skill, i) => <span key={i} style={S.skillPill(accent)}>{skill}</span>)}</div>
              </section>
            )}

            {certificates.filter((c) => c?.name || c?.organization).length > 0 && (
              <section id="section-Certifications" style={{ ...S.section, ...highlight("Certifications") }}>
                <h2 style={S.sectionLabel(accent)}>Certifications</h2>
                {certificates.filter((c) => c?.name || c?.organization).map((item, i) => (
                  <p key={i} style={{ margin: "0 0 6px", fontSize: "13px", color: "#555555" }}><span style={{ fontWeight: 700, color: "#1a1a1a" }}>{item?.name}</span>{item?.organization ? ` — ${item.organization}` : ""}</p>
                ))}
              </section>
            )}

            {languages.filter(Boolean).length > 0 && (
              <section id="section-Languages" style={{ ...S.section, ...highlight("Languages") }}>
                <h2 style={S.sectionLabel(accent)}>Languages</h2>
                <p style={{ margin: 0, fontSize: "13px", color: "#3a3a3a" }}>{languages.filter(Boolean).map((l) => (typeof l === "object" && l !== null ? l.name : l)).join(", ")}</p>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Template34;
