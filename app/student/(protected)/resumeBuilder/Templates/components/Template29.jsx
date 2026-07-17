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
 * Template29 — "Rounded Banner"
 * A friendly, modern single-column layout: a rounded color banner card
 * holding name/photo/contact, then chronological sections below with
 * rounded pill tags for skills and languages throughout. No sidebar —
 * the soft, approachable "product" look rather than a corporate block.
 */

const COLOR_OPTIONS = [
  { name: "Sky", value: "#0284c7" },
  { name: "Mint", value: "#0d9488" },
  { name: "Coral", value: "#e11d48" },
  { name: "Sunflower", value: "#ca8a04" },
  { name: "Grape", value: "#7e22ce" },
];

const withAlpha = (hex, alpha) => {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const S = {
  page: { width: "100%", maxWidth: "100%", margin: "0 auto", height: "100%", overflowY: "auto", backgroundColor: "#f8fafc", fontFamily: "'Inter', Arial, sans-serif", color: "#27272a", boxSizing: "border-box", padding: "24px" },
  swatchRow: { display: "flex", alignItems: "center", gap: "8px", padding: "0 4px 16px" },
  swatchLabel: { fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#8a8a8a" },
  swatchBtn: (active, color) => ({ height: "18px", width: "18px", borderRadius: "50%", backgroundColor: color, border: "1px solid rgba(0,0,0,0.1)", outline: active ? `2px solid ${color}` : "none", outlineOffset: "2px", cursor: "pointer", padding: 0 }),
  banner: (accent) => ({ borderRadius: "18px", backgroundColor: accent, color: "#ffffff", padding: "26px 28px", display: "flex", alignItems: "center", gap: "18px", marginBottom: "18px" }),
  photo: { height: "84px", width: "84px", borderRadius: "50%", border: "3px solid rgba(255,255,255,0.5)", objectFit: "cover", flexShrink: 0 },
  monogram: { height: "84px", width: "84px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", fontWeight: 700, flexShrink: 0 },
  name: { margin: 0, fontSize: "24px", fontWeight: 800, lineHeight: 1.2 },
  headline: { margin: "3px 0 0", fontSize: "13.5px", fontWeight: 500, color: "rgba(255,255,255,0.88)" },
  contactRow: { marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "6px 16px", fontSize: "12.5px" },
  contactLink: { display: "flex", alignItems: "center", gap: "6px", textDecoration: "none", color: "rgba(255,255,255,0.92)" },
  card: { backgroundColor: "#ffffff", borderRadius: "14px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", padding: "22px 24px", marginBottom: "16px" },
  sectionLabel: (accent) => ({ display: "inline-flex", alignItems: "center", gap: "8px", margin: "0 0 12px", fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#1a1a1a" }),
  labelDot: (accent) => ({ height: "8px", width: "8px", borderRadius: "50%", backgroundColor: accent, flexShrink: 0 }),
  summaryText: { fontSize: "14.5px", lineHeight: 1.65, color: "#3a3a3a" },
  skillsRow: { display: "flex", flexWrap: "wrap", gap: "8px" },
  skillPill: (accent) => ({ fontSize: "12.5px", fontWeight: 600, color: accent, backgroundColor: withAlpha(accent, 0.1), padding: "6px 14px", borderRadius: "999px" }),
  entryList: { display: "flex", flexDirection: "column", gap: "18px" },
  entryHeadRow: { display: "flex", flexWrap: "wrap", alignItems: "baseline", justifyContent: "space-between", columnGap: "16px" },
  entryTitle: { margin: 0, fontSize: "15.5px", fontWeight: 700, color: "#1a1a1a" },
  entrySub: { fontWeight: 500, color: "#666666" },
  entryDate: (accent) => ({ whiteSpace: "nowrap", fontSize: "12px", fontWeight: 700, color: accent, backgroundColor: withAlpha(accent, 0.1), padding: "3px 10px", borderRadius: "999px" }),
  entryDesc: { margin: "6px 0 0", fontSize: "14px", lineHeight: 1.6, color: "#3a3a3a" },
};

const getInitials = (first, last) => `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase();

const Template29 = ({ resumeTemplateRef, activeSection, isGeneratingPdf }) => {
  const {
    basicDetails, educationDetails, workExperience, internshipDetails, projectDetails,
    accDetails, certificates, skills, languages, links, volunteerings,
  } = useResumeTemplateData();
  const profileBase64 = useProfileImage(basicDetails?.profile);
  const [accent, setAccent] = useState(COLOR_OPTIONS[0].value);

  const profileLinks = links.filter((item) => item?.link);
  const linkIcons = [<LinkedinFilled key="li" />, <GithubOutlined key="gh" />, <GlobalOutlined key="gl" />];

  const highlight = (name) => (activeSection === name ? { outline: `2px solid ${accent}`, outlineOffset: "4px", borderRadius: "14px" } : {});
  const dateRange = (item) => `${item?.start || item?.startDate || ""} – ${item?.end || item?.endDate || "Present"}`;
  const combinedExperience = [...workExperience, ...internshipDetails];

  const hasFooterCol =
    certificates.filter((c) => c?.name || c?.organization).length > 0 ||
    languages.filter(Boolean).length > 0 ||
    volunteerings.filter((v) => v?.organization || v?.volunteering).length > 0;

  return (
    <div
      ref={resumeTemplateRef}
      style={{ ...S.page, maxWidth: isGeneratingPdf ? "800px" : "100%", backgroundColor: isGeneratingPdf ? "#ffffff" : S.page.backgroundColor }}
    >
      {!isGeneratingPdf && (
        <div style={S.swatchRow} className="print:hidden">
          <span style={S.swatchLabel}>Theme colour</span>
          {COLOR_OPTIONS.map((c) => (
            <button key={c.value} type="button" title={c.name} onClick={() => setAccent(c.value)} style={S.swatchBtn(accent === c.value, c.value)} />
          ))}
        </div>
      )}

      <header id="section-Basic-Details" style={{ ...S.banner(accent), ...highlight("Basic Details") }}>
        {profileBase64 ? (
          <img src={profileBase64} alt="profile" style={S.photo} />
        ) : (
          <div style={S.monogram}>{getInitials(basicDetails?.firstName, basicDetails?.lastName)}</div>
        )}
        <div style={{ minWidth: 0 }}>
          <h1 style={S.name}>{basicDetails?.firstName} {basicDetails?.middleName} {basicDetails?.lastName}</h1>
          {workExperience?.[0]?.role && <p style={S.headline}>{workExperience[0].role}</p>}
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

      {basicDetails?.professionalSummary && (
        <section style={S.card}>
          <h2 style={S.sectionLabel(accent)}><span style={S.labelDot(accent)} /> Summary</h2>
          <div style={S.summaryText} dangerouslySetInnerHTML={{ __html: asHtmlString(basicDetails.professionalSummary) }} />
        </section>
      )}

      {skills.filter(Boolean).length > 0 && (
        <section id="section-Skills" style={{ ...S.card, ...highlight("Skills") }}>
          <h2 style={S.sectionLabel(accent)}><span style={S.labelDot(accent)} /> Skills</h2>
          <div style={S.skillsRow}>{skills.filter(Boolean).map((skill, i) => <span key={i} style={S.skillPill(accent)}>{skill}</span>)}</div>
        </section>
      )}

      {combinedExperience.length > 0 && (
        <section id="section-Experience" style={{ ...S.card, ...highlight("Experience") }}>
          <h2 style={S.sectionLabel(accent)}><span style={S.labelDot(accent)} /> Experience</h2>
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
        <section id="section-Projects" style={{ ...S.card, ...highlight("Projects") }}>
          <h2 style={S.sectionLabel(accent)}><span style={S.labelDot(accent)} /> Projects</h2>
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
        <section id="section-Accomplishments" style={{ ...S.card, ...highlight("Accomplishments") }}>
          <h2 style={S.sectionLabel(accent)}><span style={S.labelDot(accent)} /> Achievements</h2>
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
        <section id="section-Education" style={{ ...S.card, ...highlight("Education") }}>
          <h2 style={S.sectionLabel(accent)}><span style={S.labelDot(accent)} /> Education</h2>
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
          {certificates.filter((c) => c?.name || c?.organization).length > 0 && (
            <section id="section-Certifications" style={{ ...S.card, ...highlight("Certifications") }}>
              <h2 style={S.sectionLabel(accent)}><span style={S.labelDot(accent)} /> Certifications</h2>
              {certificates.filter((c) => c?.name || c?.organization).map((item, i) => (
                <p key={i} style={{ margin: "0 0 8px", fontSize: "13px", color: "#555555" }}><span style={{ fontWeight: 700, color: "#1a1a1a" }}>{item?.name}</span>{item?.organization ? ` — ${item.organization}` : ""}</p>
              ))}
            </section>
          )}

          {volunteerings.filter((v) => v?.organization || v?.volunteering).length > 0 && (
            <section id="section-Volunteering" style={{ ...S.card, ...highlight("Volunteering") }}>
              <h2 style={S.sectionLabel(accent)}><span style={S.labelDot(accent)} /> Volunteering</h2>
              {volunteerings.filter((v) => v?.organization || v?.volunteering).map((item, i) => (
                <p key={i} style={{ margin: "0 0 8px", fontSize: "13px", color: "#555555" }}><span style={{ fontWeight: 700, color: "#1a1a1a" }}>{item?.volunteering}</span>{item?.organization ? ` — ${item.organization}` : ""}</p>
              ))}
            </section>
          )}

          {languages.filter(Boolean).length > 0 && (
            <section id="section-Languages" style={{ ...S.card, ...highlight("Languages") }}>
              <h2 style={S.sectionLabel(accent)}><span style={S.labelDot(accent)} /> Languages</h2>
              <div style={S.skillsRow}>{languages.filter(Boolean).map((l, i) => <span key={i} style={S.skillPill(accent)}>{typeof l === "object" && l !== null ? l.name : l}</span>)}</div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default Template29;
