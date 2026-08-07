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
 * Template37 — "Creative Accent"
 * A playful header with soft overlapping color shapes behind the photo,
 * aimed at design/creative-industry candidates who want a resume with
 * some personality without sacrificing readability — single column,
 * generous whitespace, rounded skill tags.
 */

const COLOR_OPTIONS = [
  { name: "Coral", value: "#f43f5e" },
  { name: "Turquoise", value: "#0d9488" },
  { name: "Violet", value: "#8b5cf6" },
  { name: "Marigold", value: "#f59e0b" },
  { name: "Sky", value: "#0ea5e9" },
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
  swatchRow: { display: "flex", alignItems: "center", gap: "8px", padding: "10px 30px 0" },
  swatchLabel: { fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#8a8a8a" },
  swatchBtn: (active, color) => ({ height: "18px", width: "18px", borderRadius: "50%", backgroundColor: color, border: "1px solid rgba(0,0,0,0.1)", outline: active ? `2px solid ${color}` : "none", outlineOffset: "2px", cursor: "pointer", padding: 0 }),
  headerWrap: { position: "relative", padding: "34px 30px 22px", overflow: "hidden" },
  shapeOne: (accent) => ({ position: "absolute", top: "-30px", right: "40px", height: "110px", width: "110px", borderRadius: "50%", backgroundColor: withAlpha(accent, 0.12) }),
  shapeTwo: (accent) => ({ position: "absolute", top: "40px", right: "-20px", height: "70px", width: "70px", borderRadius: "16px", backgroundColor: withAlpha(accent, 0.09), transform: "rotate(18deg)" }),
  headerContent: { position: "relative", display: "flex", alignItems: "center", gap: "18px" },
  photo: { height: "88px", width: "88px", borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "4px solid #ffffff", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" },
  monogram: (accent) => ({ height: "88px", width: "88px", borderRadius: "50%", backgroundColor: accent, color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", fontWeight: 700, flexShrink: 0 }),
  name: { margin: 0, fontSize: "25px", fontWeight: 800, color: "#111827" },
  headline: (accent) => ({ margin: "3px 0 0", fontSize: "14px", fontWeight: 600, color: accent }),
  contactRow: { marginTop: "8px", display: "flex", flexWrap: "wrap", gap: "6px 16px", fontSize: "12.5px", color: "#4b5563" },
  contactLink: { display: "flex", alignItems: "center", gap: "6px", textDecoration: "none", color: "#4b5563" },
  body: { padding: "0 30px 30px" },
  sectionLabel: (accent) => ({ display: "inline-flex", alignItems: "center", gap: "8px", margin: "0 0 12px", fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#1a1a1a" }),
  labelDot: (accent) => ({ height: "9px", width: "9px", borderRadius: "50%", backgroundColor: accent, flexShrink: 0 }),
  section: { marginBottom: "24px" },
  summaryText: { fontSize: "14.5px", lineHeight: 1.65, color: "#333333" },
  skillsRow: { display: "flex", flexWrap: "wrap", gap: "8px" },
  skillPill: (accent) => ({ fontSize: "12.5px", fontWeight: 600, color: accent, backgroundColor: withAlpha(accent, 0.1), padding: "6px 14px", borderRadius: "999px" }),
  entryList: { display: "flex", flexDirection: "column", gap: "16px" },
  entryHeadRow: { display: "flex", flexWrap: "wrap", alignItems: "center", columnGap: "16px" },
  entryTitle: { margin: 0, flex: "1 1 auto", minWidth: 0, fontSize: "15px", fontWeight: 700, color: "#1a1a1a" },
  entrySub: { fontWeight: 400, color: "#666666" },
  entryDate: (accent) => ({ flexShrink: 0, marginLeft: "auto", whiteSpace: "nowrap", fontSize: "12px", fontWeight: 700, color: accent, backgroundColor: withAlpha(accent, 0.1), padding: "3px 10px", borderRadius: "999px" }),
  entryDesc: { margin: "4px 0 0", fontSize: "14px", lineHeight: 1.6, color: "#333333" },
  gridTwo: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" },
};

const getInitials = (first, last) => `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase();

const Template37 = ({ resumeTemplateRef, activeSection, isGeneratingPdf, accent: accentProp, onAccentChange }) => {
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
        <div id="section-Basic-Details" style={{ ...S.headerWrap, ...highlight("Basic Details") }}>
          <div style={S.shapeOne(accent)} />
          <div style={S.shapeTwo(accent)} />
          <div style={S.headerContent}>
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
          </div>
        </div>

        <div style={S.body}>
          {basicDetails?.professionalSummary && (
            <section style={S.section}>
              <h2 style={S.sectionLabel(accent)}><span style={S.labelDot(accent)} /> About</h2>
              <div style={S.summaryText} dangerouslySetInnerHTML={{ __html: asHtmlString(basicDetails.professionalSummary) }} />
            </section>
          )}

          {skills.filter(Boolean).length > 0 && (
            <section id="section-Skills" style={{ ...S.section, ...highlight("Skills") }}>
              <h2 style={S.sectionLabel(accent)}><span style={S.labelDot(accent)} /> Skills</h2>
              <div style={S.skillsRow}>{skills.filter(Boolean).map((skill, i) => <span key={i} style={S.skillPill(accent)}>{skill}</span>)}</div>
            </section>
          )}

          {combinedExperience.length > 0 && (
            <section id="section-Experience" style={{ ...S.section, ...highlight("Experience") }}>
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
            <section id="section-Projects" style={{ ...S.section, ...highlight("Projects") }}>
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
            <section id="section-Accomplishments" style={{ ...S.section, ...highlight("Accomplishments") }}>
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
            <section id="section-Education" style={{ ...S.section, ...highlight("Education") }}>
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
            <div style={S.gridTwo}>
              {certificates.filter((c) => c?.name || c?.organization).length > 0 && (
                <section id="section-Certifications" style={highlight("Certifications")}>
                  <h2 style={S.sectionLabel(accent)}><span style={S.labelDot(accent)} /> Certifications</h2>
                  {certificates.filter((c) => c?.name || c?.organization).map((item, i) => (
                    <p key={i} style={{ margin: "0 0 8px", fontSize: "13px", color: "#555555" }}><span style={{ fontWeight: 700, color: "#1a1a1a" }}>{item?.name}</span>{item?.organization ? ` — ${item.organization}` : ""}</p>
                  ))}
                </section>
              )}

              {volunteerings.filter((v) => v?.organization || v?.volunteering).length > 0 && (
                <section id="section-Volunteering" style={highlight("Volunteering")}>
                  <h2 style={S.sectionLabel(accent)}><span style={S.labelDot(accent)} /> Volunteering</h2>
                  {volunteerings.filter((v) => v?.organization || v?.volunteering).map((item, i) => (
                    <p key={i} style={{ margin: "0 0 8px", fontSize: "13px", color: "#555555" }}><span style={{ fontWeight: 700, color: "#1a1a1a" }}>{item?.volunteering}</span>{item?.organization ? ` — ${item.organization}` : ""}</p>
                  ))}
                </section>
              )}

              {languages.filter(Boolean).length > 0 && (
                <section id="section-Languages" style={highlight("Languages")}>
                  <h2 style={S.sectionLabel(accent)}><span style={S.labelDot(accent)} /> Languages</h2>
                  <div style={S.skillsRow}>{languages.filter(Boolean).map((l, i) => <span key={i} style={S.skillPill(accent)}>{typeof l === "object" && l !== null ? l.name : l}</span>)}</div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Template37;
