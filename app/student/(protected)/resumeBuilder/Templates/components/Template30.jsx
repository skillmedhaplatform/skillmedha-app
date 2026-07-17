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
 * Template30 — "Two-Tone Header"
 * A header split into a dark half and a light half with the photo
 * sitting on the seam, contact row underneath in two tone-matched
 * columns — the "Boston"-style split-header pattern seen across
 * mainstream resume builders. Single column body below with circular
 * color markers in front of each section title.
 */

const COLOR_OPTIONS = [
  { name: "Steel", value: "#1e3a5f" },
  { name: "Pine", value: "#14532d" },
  { name: "Wine", value: "#7f1d1d" },
  { name: "Umber", value: "#78350f" },
  { name: "Indigo", value: "#312e81" },
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
  header: (accent) => ({ position: "relative", display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "stretch" }),
  headerDark: (accent) => ({ backgroundColor: accent, color: "#ffffff", padding: "30px 26px", display: "flex", flexDirection: "column", justifyContent: "center" }),
  headerLight: (accent) => ({ backgroundColor: withAlpha(accent, 0.06), padding: "30px 26px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "6px" }),
  photo: { position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", height: "92px", width: "92px", borderRadius: "50%", border: "4px solid #ffffff", objectFit: "cover", boxShadow: "0 2px 8px rgba(0,0,0,0.18)" },
  monogram: (accent) => ({ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", height: "92px", width: "92px", borderRadius: "50%", backgroundColor: "#ffffff", color: accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", fontWeight: 700, border: `4px solid ${withAlpha(accent, 0.25)}`, boxShadow: "0 2px 8px rgba(0,0,0,0.14)" }),
  name: { margin: 0, fontSize: "24px", fontWeight: 800, lineHeight: 1.2 },
  headline: { margin: "4px 0 0", fontSize: "13.5px", fontWeight: 500, color: "rgba(255,255,255,0.86)" },
  contactItem: { display: "flex", alignItems: "center", gap: "7px", fontSize: "12.5px", textDecoration: "none" },
  body: { padding: "30px 30px 34px" },
  sectionLabel: (accent) => ({ display: "flex", alignItems: "center", gap: "10px", margin: "0 0 12px", fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#1a1a1a" }),
  labelDot: (accent) => ({ height: "10px", width: "10px", borderRadius: "50%", backgroundColor: accent, flexShrink: 0 }),
  section: { marginBottom: "24px" },
  summaryText: { fontSize: "14.5px", lineHeight: 1.65, color: "#333333" },
  skillsRow: { display: "flex", flexWrap: "wrap", gap: "8px" },
  skillPill: (accent) => ({ fontSize: "12.5px", fontWeight: 600, color: accent, backgroundColor: withAlpha(accent, 0.1), padding: "5px 12px", borderRadius: "6px" }),
  entryList: { display: "flex", flexDirection: "column", gap: "16px" },
  entryHeadRow: { display: "flex", flexWrap: "wrap", alignItems: "baseline", justifyContent: "space-between", columnGap: "16px" },
  entryTitle: { margin: 0, fontSize: "15px", fontWeight: 700, color: "#1a1a1a" },
  entrySub: { fontWeight: 400, color: "#666666" },
  entryDate: (accent) => ({ whiteSpace: "nowrap", fontSize: "12px", fontWeight: 700, color: accent }),
  entryDesc: { margin: "4px 0 0", fontSize: "14px", lineHeight: 1.6, color: "#333333" },
  gridTwo: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" },
};

const getInitials = (first, last) => `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase();

const Template30 = ({ resumeTemplateRef, activeSection, isGeneratingPdf }) => {
  const {
    basicDetails, educationDetails, workExperience, internshipDetails, projectDetails,
    accDetails, certificates, skills, languages, links, volunteerings,
  } = useResumeTemplateData();
  const profileBase64 = useProfileImage(basicDetails?.profile);
  const [accent, setAccent] = useState(COLOR_OPTIONS[0].value);

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
        <header id="section-Basic-Details" style={{ ...S.header(accent), ...highlight("Basic Details") }}>
          <div style={S.headerDark(accent)}>
            <h1 style={S.name}>{basicDetails?.firstName} {basicDetails?.middleName} {basicDetails?.lastName}</h1>
            {workExperience?.[0]?.role && <p style={S.headline}>{workExperience[0].role}</p>}
          </div>
          <div style={S.headerLight(accent)}>
            {basicDetails?.email && <a href={`mailto:${basicDetails.email}`} style={{ ...S.contactItem, color: "#333333" }}><MailOutlined /> <span>{basicDetails.email}</span></a>}
            {basicDetails?.phone && <a href={`tel:${basicDetails.phone}`} style={{ ...S.contactItem, color: "#333333" }}><PhoneFilled /> <span>{basicDetails.phone}</span></a>}
            {basicDetails?.city && <span style={{ ...S.contactItem, color: "#333333" }}><EnvironmentOutlined /> <span>{basicDetails.city}</span></span>}
            {profileLinks.slice(0, 2).map((item, i) => (
              <a key={i} href={normalizeExternalLink(item.link)} target="_blank" rel="noopener noreferrer" style={{ ...S.contactItem, color: accent }}>
                {linkIcons[i] || <GlobalOutlined />} <span>{item.title || item.link}</span>
              </a>
            ))}
          </div>
          {profileBase64 ? (
            <img src={profileBase64} alt="profile" style={S.photo} />
          ) : (
            <div style={S.monogram(accent)}>{getInitials(basicDetails?.firstName, basicDetails?.lastName)}</div>
          )}
        </header>

        <div style={S.body}>
          {basicDetails?.professionalSummary && (
            <section style={S.section}>
              <h2 style={S.sectionLabel(accent)}><span style={S.labelDot(accent)} /> Summary</h2>
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
                  <p style={{ margin: 0, fontSize: "13.5px", color: "#3a3a3a" }}>{languages.filter(Boolean).map((l) => (typeof l === "object" && l !== null ? l.name : l)).join(", ")}</p>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Template30;
