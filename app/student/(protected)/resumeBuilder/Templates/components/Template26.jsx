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
 * Template26 — "Angled Sidebar"
 * The diagonal-cut color block popular on mainstream resume-builder
 * sites (Resume-Now/Zety style "Chicago"/"Denver" family): a colored
 * sidebar with a clipped diagonal edge carrying the photo, contact,
 * skills and languages, beside a white main column for the chronological
 * content. Inline `style` objects throughout for build-safety.
 */

const COLOR_OPTIONS = [
  { name: "Cobalt", value: "#1d4ed8" },
  { name: "Emerald", value: "#047857" },
  { name: "Garnet", value: "#9f1239" },
  { name: "Plum", value: "#6d28d9" },
  { name: "Charcoal", value: "#27272a" },
];

const withAlpha = (hex, alpha) => {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const S = {
  page: { width: "100%", maxWidth: "100%", margin: "0 auto", height: "100%", overflowY: "auto", backgroundColor: "#ffffff", fontFamily: "'Inter', Arial, sans-serif", color: "#27272a", boxSizing: "border-box", display: "flex", alignItems: "stretch" },
  swatchRow: { display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderBottom: "1px solid #eeeeee" },
  swatchLabel: { fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#8a8a8a" },
  swatchBtn: (active, color) => ({ height: "18px", width: "18px", borderRadius: "50%", backgroundColor: color, border: "1px solid rgba(0,0,0,0.1)", outline: active ? `2px solid ${color}` : "none", outlineOffset: "2px", cursor: "pointer", padding: 0 }),
  sidebar: (accent) => ({ width: "36%", minWidth: "230px", flexShrink: 0, position: "relative", backgroundColor: accent, color: "#ffffff", padding: "34px 24px 28px", boxSizing: "border-box" }),
  diagonal: (accent) => ({ position: "absolute", right: "-1px", top: 0, bottom: 0, width: "40px", backgroundColor: "#ffffff", clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }),
  photo: { height: "104px", width: "104px", borderRadius: "50%", border: "4px solid rgba(255,255,255,0.35)", objectFit: "cover", display: "block", margin: "0 auto 18px" },
  monogram: (accent) => ({ height: "104px", width: "104px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.16)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "34px", fontWeight: 700, margin: "0 auto 18px" }),
  name: { margin: 0, fontSize: "20px", fontWeight: 800, lineHeight: 1.25, textAlign: "center" },
  headline: { margin: "5px 0 0", fontSize: "12.5px", fontWeight: 500, color: "rgba(255,255,255,0.82)", textAlign: "center" },
  sideDivider: { height: "1px", backgroundColor: "rgba(255,255,255,0.25)", margin: "22px 0", border: "none" },
  sideLabel: { margin: "0 0 12px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.92)" },
  sideBlock: { marginBottom: "24px" },
  contactItem: { display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12px", color: "rgba(255,255,255,0.9)", textDecoration: "none", marginBottom: "9px", wordBreak: "break-word" },
  sideSkillPill: (accent) => ({ display: "inline-block", fontSize: "11.5px", fontWeight: 600, color: "#ffffff", backgroundColor: "rgba(255,255,255,0.16)", padding: "4px 10px", borderRadius: "999px", margin: "0 6px 6px 0" }),
  sideSmall: { margin: "0 0 8px", fontSize: "11.5px", color: "rgba(255,255,255,0.85)", lineHeight: 1.5 },
  sideSmallTitle: { fontWeight: 700, color: "#ffffff" },
  main: { flex: 1, padding: "36px 34px", minWidth: 0 },
  sectionLabel: (accent) => ({ margin: "0 0 12px", fontSize: "13.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: accent, paddingBottom: "6px", borderBottom: `2px solid ${accent}` }),
  section: { marginBottom: "26px" },
  summaryText: { fontSize: "14.5px", lineHeight: 1.65, color: "#333333" },
  entryList: { display: "flex", flexDirection: "column", gap: "16px" },
  entryHeadRow: { display: "flex", flexWrap: "wrap", alignItems: "baseline", justifyContent: "space-between", columnGap: "16px" },
  entryTitle: { margin: 0, fontSize: "15.5px", fontWeight: 700, color: "#1a1a1a" },
  entrySub: { fontWeight: 400, color: "#555555" },
  entryDate: (accent) => ({ whiteSpace: "nowrap", fontSize: "12px", fontWeight: 700, color: accent, backgroundColor: withAlpha(accent, 0.1), padding: "3px 10px", borderRadius: "999px" }),
  entryDesc: { margin: "4px 0 0", fontSize: "14px", lineHeight: 1.55, color: "#333333" },
};

const getInitials = (first, last) => `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase();

const Template26 = ({ resumeTemplateRef, activeSection, isGeneratingPdf }) => {
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
        <aside id="section-Basic-Details" style={{ ...S.sidebar(accent), ...highlight("Basic Details") }}>
          <div style={S.diagonal(accent)} />
          {profileBase64 ? (
            <img src={profileBase64} alt="profile" style={S.photo} />
          ) : (
            <div style={S.monogram(accent)}>{getInitials(basicDetails?.firstName, basicDetails?.lastName)}</div>
          )}
          <h1 style={S.name}>{basicDetails?.firstName} {basicDetails?.middleName} {basicDetails?.lastName}</h1>
          {workExperience?.[0]?.role && <p style={S.headline}>{workExperience[0].role}</p>}

          <hr style={S.sideDivider} />

          <div style={S.sideBlock}>
            <h2 style={S.sideLabel}>Contact</h2>
            {basicDetails?.email && <a href={`mailto:${basicDetails.email}`} style={S.contactItem}><MailOutlined /> <span>{basicDetails.email}</span></a>}
            {basicDetails?.phone && <a href={`tel:${basicDetails.phone}`} style={S.contactItem}><PhoneFilled /> <span>{basicDetails.phone}</span></a>}
            {profileLinks.slice(0, 3).map((item, i) => (
              <a key={i} href={normalizeExternalLink(item.link)} target="_blank" rel="noopener noreferrer" style={S.contactItem}>
                {linkIcons[i] || <GlobalOutlined />} <span>{item.title || item.link}</span>
              </a>
            ))}
          </div>

          {skills.filter(Boolean).length > 0 && (
            <div id="section-Skills" style={{ ...S.sideBlock, ...highlight("Skills") }}>
              <h2 style={S.sideLabel}>Skills</h2>
              <div>{skills.filter(Boolean).map((skill, i) => <span key={i} style={S.sideSkillPill(accent)}>{skill}</span>)}</div>
            </div>
          )}

          {hasLanguages && (
            <div id="section-Languages" style={{ ...S.sideBlock, ...highlight("Languages") }}>
              <h2 style={S.sideLabel}>Languages</h2>
              <p style={S.sideSmall}>{languages.filter(Boolean).map((l) => (typeof l === "object" && l !== null ? l.name : l)).join(", ")}</p>
            </div>
          )}

          {hasCerts && (
            <div id="section-Certifications" style={{ ...S.sideBlock, ...highlight("Certifications") }}>
              <h2 style={S.sideLabel}>Certifications</h2>
              {certificates.filter((c) => c?.name || c?.organization).map((item, i) => (
                <p key={i} style={S.sideSmall}><span style={S.sideSmallTitle}>{item?.name}</span>{item?.organization ? ` — ${item.organization}` : ""}</p>
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

export default Template26;
