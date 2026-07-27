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
 * Template31 — "Centered Classic"
 * Photo and name centered at the top with a thin color rule beneath,
 * single column below. The symmetric "default template" look most
 * resume builders lead with — safe, balanced, works for any industry.
 */

const COLOR_OPTIONS = [
  { name: "Cobalt", value: "#1d4ed8" },
  { name: "Teal", value: "#0d9488" },
  { name: "Rose", value: "#be123c" },
  { name: "Amber", value: "#b45309" },
  { name: "Slate", value: "#334155" },
];

const withAlpha = (hex, alpha) => {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const S = {
  page: { width: "100%", maxWidth: "100%", margin: "0 auto", height: "100%", overflowY: "auto", backgroundColor: "#ffffff", fontFamily: "'Inter', Arial, sans-serif", color: "#27272a", boxSizing: "border-box", padding: "40px 44px" },
  swatchRow: { display: "flex", alignItems: "center", gap: "8px", padding: "0 0 16px" },
  swatchLabel: { fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#8a8a8a" },
  swatchBtn: (active, color) => ({ height: "18px", width: "18px", borderRadius: "50%", backgroundColor: color, border: "1px solid rgba(0,0,0,0.1)", outline: active ? `2px solid ${color}` : "none", outlineOffset: "2px", cursor: "pointer", padding: 0 }),
  photo: { height: "88px", width: "88px", borderRadius: "50%", objectFit: "cover", margin: "0 auto 14px", display: "block" },
  monogram: (accent) => ({ height: "88px", width: "88px", borderRadius: "50%", backgroundColor: withAlpha(accent, 0.12), color: accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", fontWeight: 700, margin: "0 auto 14px" }),
  name: { margin: 0, fontSize: "26px", fontWeight: 800, textAlign: "center", color: "#111827" },
  headline: (accent) => ({ margin: "4px 0 0", fontSize: "14px", fontWeight: 600, textAlign: "center", color: accent }),
  contactRow: { marginTop: "12px", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "6px 18px", fontSize: "12.5px", color: "#4b5563" },
  contactLink: { display: "flex", alignItems: "center", gap: "6px", textDecoration: "none", color: "#4b5563" },
  rule: (accent) => ({ height: "2px", width: "64px", backgroundColor: accent, margin: "18px auto 0" }),
  sectionLabel: (accent) => ({ margin: "0 0 12px", fontSize: "13.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: accent, textAlign: "center" }),
  section: { marginTop: "26px" },
  summaryText: { fontSize: "14.5px", lineHeight: 1.65, color: "#333333", textAlign: "center", maxWidth: "620px", margin: "0 auto" },
  skillsRow: { display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px" },
  skillPill: (accent) => ({ fontSize: "12.5px", fontWeight: 600, color: accent, backgroundColor: withAlpha(accent, 0.1), padding: "5px 14px", borderRadius: "999px" }),
  entryList: { display: "flex", flexDirection: "column", gap: "16px" },
  entryHeadRow: { display: "flex", flexWrap: "wrap", alignItems: "center", columnGap: "16px" },
  entryTitle: { margin: 0, flex: "1 1 auto", minWidth: 0, fontSize: "15px", fontWeight: 700, color: "#1a1a1a" },
  entrySub: { fontWeight: 400, color: "#666666" },
  entryDate: (accent) => ({ flexShrink: 0, marginLeft: "auto", whiteSpace: "nowrap", fontSize: "12px", fontWeight: 700, color: accent }),
  entryDesc: { margin: "4px 0 0", fontSize: "14px", lineHeight: 1.6, color: "#333333" },
  gridTwo: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" },
};

const getInitials = (first, last) => `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase();

const Template31 = ({ resumeTemplateRef, activeSection, isGeneratingPdf, accent: accentProp, onAccentChange }) => {
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

  const hasFooterCol =
    certificates.filter((c) => c?.name || c?.organization).length > 0 ||
    languages.filter(Boolean).length > 0 ||
    volunteerings.filter((v) => v?.organization || v?.volunteering).length > 0;

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
        <header id="section-Basic-Details" style={highlight("Basic Details")}>
          {profileBase64 ? (
            <img src={profileBase64} alt="profile" style={S.photo} />
          ) : (
            <div style={S.monogram(accent)}>{getInitials(basicDetails?.firstName, basicDetails?.lastName)}</div>
          )}
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
          <div style={S.rule(accent)} />
        </header>

        {basicDetails?.professionalSummary && (
          <section style={S.section}>
            <h2 style={S.sectionLabel(accent)}>Summary</h2>
            <div style={S.summaryText} dangerouslySetInnerHTML={{ __html: asHtmlString(basicDetails.professionalSummary) }} />
          </section>
        )}

        {skills.filter(Boolean).length > 0 && (
          <section id="section-Skills" style={{ ...S.section, ...highlight("Skills") }}>
            <h2 style={S.sectionLabel(accent)}>Skills</h2>
            <div style={S.skillsRow}>{skills.filter(Boolean).map((skill, i) => <span key={i} style={S.skillPill(accent)}>{skill}</span>)}</div>
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
            <ul style={{ margin: 0, listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
              {accDetails.filter((a) => a?.accomplishment || a?.description).map((item, i) => (
                <li key={i} style={{ position: "relative", paddingLeft: "16px", fontSize: "14px", lineHeight: 1.55, color: "#3a3a3a" }}>
                  <span style={{ position: "absolute", left: 0, top: "8px", height: "5px", width: "5px", borderRadius: "50%", backgroundColor: accent }} />
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
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {educationDetails.map((item, i) => (
                <div key={i} style={S.entryHeadRow}>
                  <h3 style={{ ...S.entryTitle, fontSize: "14.5px" }}>{item?.type} {item?.school ? `— ${item.school}` : ""}</h3>
                  <span style={S.entryDate(accent)}>{item?.startDate} – {item?.endDate}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {hasFooterCol && (
          <div style={{ ...S.gridTwo, ...S.section }}>
            {certificates.filter((c) => c?.name || c?.organization).length > 0 && (
              <section id="section-Certifications" style={highlight("Certifications")}>
                <h2 style={{ ...S.sectionLabel(accent), textAlign: "left" }}>Certifications</h2>
                {certificates.filter((c) => c?.name || c?.organization).map((item, i) => (
                  <p key={i} style={{ margin: "0 0 8px", fontSize: "13px", color: "#555555" }}><span style={{ fontWeight: 700, color: "#1a1a1a" }}>{item?.name}</span>{item?.organization ? ` — ${item.organization}` : ""}</p>
                ))}
              </section>
            )}

            {volunteerings.filter((v) => v?.organization || v?.volunteering).length > 0 && (
              <section id="section-Volunteering" style={highlight("Volunteering")}>
                <h2 style={{ ...S.sectionLabel(accent), textAlign: "left" }}>Volunteering</h2>
                {volunteerings.filter((v) => v?.organization || v?.volunteering).map((item, i) => (
                  <p key={i} style={{ margin: "0 0 8px", fontSize: "13px", color: "#555555" }}><span style={{ fontWeight: 700, color: "#1a1a1a" }}>{item?.volunteering}</span>{item?.organization ? ` — ${item.organization}` : ""}</p>
                ))}
              </section>
            )}

            {languages.filter(Boolean).length > 0 && (
              <section id="section-Languages" style={highlight("Languages")}>
                <h2 style={{ ...S.sectionLabel(accent), textAlign: "left" }}>Languages</h2>
                <p style={{ margin: 0, fontSize: "13.5px", color: "#3a3a3a" }}>{languages.filter(Boolean).map((l) => (typeof l === "object" && l !== null ? l.name : l)).join(", ")}</p>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Template31;
