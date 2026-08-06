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
 * Template28 — "Brand Stripe"
 * A thin full-width color stripe at the very top (like a product's brand
 * bar), dark name beneath it, then a pale accent-tinted left column
 * (contact, skills, languages, certifications) beside a white main
 * column — the light-tint sidebar variant of the resume-builder "product"
 * look, distinct from Template26/27's solid-color treatments.
 */

const COLOR_OPTIONS = [
  { name: "Azure", value: "#2563eb" },
  { name: "Jade", value: "#059669" },
  { name: "Rose", value: "#e11d48" },
  { name: "Marigold", value: "#d97706" },
  { name: "Violet", value: "#7c3aed" },
];

const withAlpha = (hex, alpha) => {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const S = {
  page: { width: "100%", maxWidth: "100%", margin: "0 auto", height: "100%", overflowY: "auto", backgroundColor: "#ffffff", fontFamily: "'Inter', Arial, sans-serif", color: "#27272a", boxSizing: "border-box" },
  swatchRow: { display: "flex", alignItems: "center", gap: "8px", padding: "10px 24px 0" },
  swatchLabel: { fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#8a8a8a" },
  swatchBtn: (active, color) => ({ height: "18px", width: "18px", borderRadius: "50%", backgroundColor: color, border: "1px solid rgba(0,0,0,0.1)", outline: active ? `2px solid ${color}` : "none", outlineOffset: "2px", cursor: "pointer", padding: 0 }),
  stripe: (accent) => ({ height: "9px", width: "100%", backgroundColor: accent }),
  header: { display: "flex", alignItems: "center", gap: "18px", padding: "26px 30px 20px" },
  photo: { height: "78px", width: "78px", borderRadius: "50%", objectFit: "cover", border: "3px solid #f1f5f9", flexShrink: 0 },
  monogram: (accent) => ({ height: "78px", width: "78px", borderRadius: "50%", backgroundColor: withAlpha(accent, 0.12), color: accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", fontWeight: 700, flexShrink: 0 }),
  name: { margin: 0, fontSize: "25px", fontWeight: 800, color: "#111827" },
  headline: (accent) => ({ margin: "3px 0 0", fontSize: "14px", fontWeight: 600, color: accent }),
  body: { display: "grid", gridTemplateColumns: "230px 1fr" },
  sidebar: (accent) => ({ backgroundColor: withAlpha(accent, 0.055), padding: "22px 24px", display: "flex", flexDirection: "column", gap: "22px" }),
  sideLabel: (accent) => ({ margin: "0 0 10px", fontSize: "11.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: accent }),
  contactItem: { display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12.5px", color: "#374151", textDecoration: "none", marginBottom: "8px", wordBreak: "break-word" },
  sideSkillItem: { fontSize: "12.5px", color: "#1f2937", padding: "5px 0", borderBottom: "1px solid rgba(0,0,0,0.06)" },
  sideSmall: { margin: "0 0 8px", fontSize: "12px", color: "#4b5563", lineHeight: 1.5 },
  sideSmallTitle: { fontWeight: 700, color: "#111827" },
  main: { padding: "22px 30px 30px" },
  sectionLabel: (accent) => ({ margin: "0 0 10px", fontSize: "13.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#111827", paddingBottom: "6px", borderBottom: `2px solid ${accent}` }),
  section: { marginBottom: "24px" },
  summaryText: { fontSize: "14.5px", lineHeight: 1.65, color: "#333333" },
  entryList: { display: "flex", flexDirection: "column", gap: "16px" },
  entryHeadRow: { display: "flex", flexWrap: "wrap", alignItems: "center", columnGap: "16px" },
  entryTitle: { margin: 0, flex: "1 1 auto", minWidth: 0, fontSize: "15px", fontWeight: 700, color: "#1a1a1a" },
  entrySub: { fontWeight: 400, color: "#555555" },
  entryDate: (accent) => ({ flexShrink: 0, marginLeft: "auto", whiteSpace: "nowrap", fontSize: "12px", fontWeight: 700, color: accent }),
  entryDesc: { margin: "4px 0 0", fontSize: "14px", lineHeight: 1.55, color: "#333333" },
};

const getInitials = (first, last) => `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase();

const Template28 = ({ resumeTemplateRef, activeSection, isGeneratingPdf, accent: accentProp, onAccentChange }) => {
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

  const highlight = (name) => (activeSection === name ? { outline: `2px solid ${accent}`, outlineOffset: "4px", borderRadius: "6px" } : {});
  const dateRange = (item) => `${item?.start || item?.startDate || ""} – ${item?.end || item?.endDate || "Present"}`;
  const combinedExperience = [...workExperience, ...internshipDetails];

  const hasCerts = certificates.filter((c) => c?.name || c?.organization).length > 0;
  const hasVolunteering = volunteerings.filter((v) => v?.organization || v?.volunteering).length > 0;
  const hasLanguages = languages.filter(Boolean).length > 0;

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
        <div style={S.stripe(accent)} />

        <header id="section-Basic-Details" style={{ ...S.header, ...highlight("Basic Details") }}>
          {profileBase64 ? (
            <img src={profileBase64} alt="profile" style={S.photo} />
          ) : (
            <div style={S.monogram(accent)}>{getInitials(basicDetails?.firstName, basicDetails?.lastName)}</div>
          )}
          <div style={{ minWidth: 0 }}>
            <h1 style={S.name}>{basicDetails?.firstName} {basicDetails?.middleName} {basicDetails?.lastName}</h1>
            {workExperience?.[0]?.role && <p style={S.headline(accent)}>{workExperience[0].role}</p>}
          </div>
        </header>

        <div style={S.body}>
          <aside style={S.sidebar(accent)}>
            <div>
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
              <div id="section-Skills" style={highlight("Skills")}>
                <h2 style={S.sideLabel(accent)}>Skills</h2>
                {skills.filter(Boolean).map((skill, i) => <p key={i} style={S.sideSkillItem}>{skill}</p>)}
              </div>
            )}

            {hasLanguages && (
              <div id="section-Languages" style={highlight("Languages")}>
                <h2 style={S.sideLabel(accent)}>Languages</h2>
                <p style={S.sideSmall}>{languages.filter(Boolean).map((l) => (typeof l === "object" && l !== null ? l.name : l)).join(", ")}</p>
              </div>
            )}

            {hasCerts && (
              <div id="section-Certifications" style={highlight("Certifications")}>
                <h2 style={S.sideLabel(accent)}>Certifications</h2>
                {certificates.filter((c) => c?.name || c?.organization).map((item, i) => (
                  <p key={i} style={S.sideSmall}><span style={S.sideSmallTitle}>{item?.name}</span>{item?.organization ? ` — ${item.organization}` : ""}</p>
                ))}
              </div>
            )}

            {hasVolunteering && (
              <div id="section-Volunteering" style={highlight("Volunteering")}>
                <h2 style={S.sideLabel(accent)}>Volunteering</h2>
                {volunteerings.filter((v) => v?.organization || v?.volunteering).map((item, i) => (
                  <p key={i} style={S.sideSmall}><span style={S.sideSmallTitle}>{item?.volunteering}</span>{item?.organization ? ` — ${item.organization}` : ""}</p>
                ))}
              </div>
            )}
          </aside>

          <main style={S.main}>
            {basicDetails?.professionalSummary && (
              <section style={S.section}>
                <h2 style={S.sectionLabel(accent)}>Profile</h2>
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
          </main>
        </div>
      </div>
    </div>
  );
};

export default Template28;
