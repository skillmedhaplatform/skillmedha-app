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
 * Template10 — "Bold Monogram"
 * A card-based layout on a soft neutral canvas: an initials monogram
 * (or photo) sits beside the name, skills render as rounded pills, and
 * every section is its own rounded card with a light shadow. Good fit
 * for candidates who want a friendlier, more modern feel than a strict
 * chronological block layout.
 *
 * IMPORTANT: every visual rule is written as an inline `style` object
 * rather than a Tailwind bracket-value class, so this template renders
 * correctly regardless of whether Tailwind's JIT has scanned this file.
 */

const COLOR_OPTIONS = [
  { name: "Loyal Blue", value: "#144181" },
  { name: "Assertive Asphalt", value: "#34393E" },
  { name: "Team Teal", value: "#00879E" },
  { name: "Ambitious Red", value: "#9A2B34" },
  { name: "Trusted Taupe", value: "#8C7A6B" },
  { name: "Mint Leaf", value: "#1C8A63" },
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
    backgroundColor: "#f7f6f4",
    fontFamily: "'Inter', Arial, sans-serif",
    color: "#2b2b2b",
    boxSizing: "border-box",
    padding: "28px",
  },
  swatchRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 4px 18px",
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
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "14px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
    padding: "22px 24px",
    marginBottom: "16px",
  },
  headerCard: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
  },
  monogramWrap: (accent) => ({
    height: "76px",
    width: "76px",
    flexShrink: 0,
    borderRadius: "20px",
    backgroundColor: accent,
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "26px",
    fontWeight: 700,
    letterSpacing: "0.02em",
    overflow: "hidden",
  }),
  photo: { height: "100%", width: "100%", objectFit: "cover" },
  name: { margin: 0, fontSize: "26px", fontWeight: 800, color: "#1a1a1a", lineHeight: 1.2 },
  headline: (accent) => ({
    margin: "4px 0 0",
    fontSize: "14.5px",
    fontWeight: 600,
    color: accent,
  }),
  contactRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px 18px",
    marginTop: "10px",
    fontSize: "12.5px",
    color: "#555555",
  },
  contactLink: { display: "flex", alignItems: "center", gap: "6px", textDecoration: "none", color: "#555555" },
  sectionLabel: (accent) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    margin: "0 0 14px",
    fontSize: "13px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "#1a1a1a",
  }),
  labelDot: (accent) => ({ height: "8px", width: "8px", borderRadius: "3px", backgroundColor: accent, flexShrink: 0 }),
  summaryText: { fontSize: "14.5px", lineHeight: 1.65, color: "#3a3a3a" },
  skillsRow: { display: "flex", flexWrap: "wrap", gap: "8px" },
  skillPill: (accent) => ({
    fontSize: "12.5px",
    fontWeight: 600,
    color: accent,
    backgroundColor: withAlpha(accent, 0.1),
    padding: "6px 14px",
    borderRadius: "999px",
  }),
  entryList: { display: "flex", flexDirection: "column", gap: "18px" },
  entryHeadRow: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "baseline",
    justifyContent: "space-between",
    columnGap: "16px",
  },
  entryTitle: { margin: 0, fontSize: "15.5px", fontWeight: 700, color: "#1a1a1a" },
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
  gridTwo: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
  },
  smallSub: { margin: "0 0 8px", fontSize: "13px", color: "#555555", lineHeight: 1.5 },
  smallTitle: { fontWeight: 700, color: "#1a1a1a" },
};

const getInitials = (first, last) => `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase();

const Template10 = ({ resumeTemplateRef, activeSection, isGeneratingPdf, accent: accentProp, onAccentChange }) => {
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
    activeSection === name
      ? { outline: `2px solid ${accent}`, outlineOffset: "4px", borderRadius: "14px" }
      : {};

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
            <button
              key={c.value}
              type="button"
              title={c.name}
              onClick={() => setAccent(c.value)}
              style={S.swatchBtn(accent === c.value, c.value)}
            />
          ))}
        </div>
      )}

      <header id="section-Basic-Details" style={{ ...S.card, ...S.headerCard, ...highlight("Basic Details") }}>
        <div style={S.monogramWrap(accent)}>
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
          {workExperience?.[0]?.role && <p style={S.headline(accent)}>{workExperience[0].role}</p>}
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

      {basicDetails?.professionalSummary && (
        <section style={S.card}>
          <h2 style={S.sectionLabel(accent)}>
            <span style={S.labelDot(accent)} /> Professional summary
          </h2>
          <div style={S.summaryText} dangerouslySetInnerHTML={{ __html: asHtmlString(basicDetails.professionalSummary) }} />
        </section>
      )}

      {skills.filter(Boolean).length > 0 && (
        <section id="section-Skills" style={{ ...S.card, ...highlight("Skills") }}>
          <h2 style={S.sectionLabel(accent)}>
            <span style={S.labelDot(accent)} /> Key skills
          </h2>
          <div style={S.skillsRow}>
            {skills.filter(Boolean).map((skill, i) => (
              <span key={i} style={S.skillPill(accent)}>
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {workExperience.length > 0 && (
        <section id="section-Experience" style={{ ...S.card, ...highlight("Experience") }}>
          <h2 style={S.sectionLabel(accent)}>
            <span style={S.labelDot(accent)} /> Work experience
          </h2>
          <div style={S.entryList}>
            {workExperience.map((item, i) => (
              <div key={i}>
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
        <section id="section-Internships" style={{ ...S.card, ...highlight("Internships") }}>
          <h2 style={S.sectionLabel(accent)}>
            <span style={S.labelDot(accent)} /> Internships
          </h2>
          <div style={S.entryList}>
            {internshipDetails.map((item, i) => (
              <div key={i}>
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

      {projectDetails.filter((p) => p?.project).length > 0 && (
        <section id="section-Projects" style={{ ...S.card, ...highlight("Projects") }}>
          <h2 style={S.sectionLabel(accent)}>
            <span style={S.labelDot(accent)} /> Projects
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
        <section id="section-Accomplishments" style={{ ...S.card, ...highlight("Accomplishments") }}>
          <h2 style={S.sectionLabel(accent)}>
            <span style={S.labelDot(accent)} /> Achievements
          </h2>
          <ul style={{ margin: 0, listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
            {accDetails
              .filter((a) => a?.accomplishment || a?.description)
              .map((item, i) => (
                <li
                  key={i}
                  style={{ position: "relative", paddingLeft: "16px", fontSize: "14px", lineHeight: 1.55, color: "#3a3a3a" }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      top: "8px",
                      height: "5px",
                      width: "5px",
                      borderRadius: "50%",
                      backgroundColor: accent,
                    }}
                  />
                  <span style={{ fontWeight: 700, color: "#1a1a1a" }}>{item?.accomplishment}</span>
                  {item?.description ? ` — ${item.description}` : ""}
                </li>
              ))}
          </ul>
        </section>
      )}

      {educationDetails.length > 0 && (
        <section id="section-Education" style={{ ...S.card, ...highlight("Education") }}>
          <h2 style={S.sectionLabel(accent)}>
            <span style={S.labelDot(accent)} /> Education
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {educationDetails.map((item, i) => (
              <div key={i} style={S.entryHeadRow}>
                <h3 style={{ ...S.entryTitle, fontSize: "14.5px" }}>
                  {item?.type} {item?.school ? `— ${item.school}` : ""}
                  {item?.grade ? `, ${item.grade}${item?.gradeType === "percentage" ? "%" : item?.gradeType ? "/10" : ""}` : ""}
                </h3>
                <span style={S.entryDate(accent)}>
                  {item?.startDate} – {item?.endDate}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {hasFooterCol && (
        <div style={S.gridTwo}>
          {certificates.filter((c) => c?.name || c?.organization).length > 0 && (
            <section id="section-Certifications" style={{ ...S.card, ...highlight("Certifications") }}>
              <h2 style={S.sectionLabel(accent)}>
                <span style={S.labelDot(accent)} /> Certifications
              </h2>
              {certificates
                .filter((c) => c?.name || c?.organization)
                .map((item, i) => (
                  <p key={i} style={S.smallSub}>
                    <span style={S.smallTitle}>{item?.name}</span>
                    {item?.organization ? ` — ${item.organization}` : ""}
                  </p>
                ))}
            </section>
          )}

          {volunteerings.filter((v) => v?.organization || v?.volunteering).length > 0 && (
            <section id="section-Volunteering" style={{ ...S.card, ...highlight("Volunteering") }}>
              <h2 style={S.sectionLabel(accent)}>
                <span style={S.labelDot(accent)} /> Volunteering
              </h2>
              {volunteerings
                .filter((v) => v?.organization || v?.volunteering)
                .map((item, i) => (
                  <p key={i} style={S.smallSub}>
                    <span style={S.smallTitle}>{item?.volunteering}</span>
                    {item?.organization ? ` — ${item.organization}` : ""}
                  </p>
                ))}
            </section>
          )}

          {languages.filter(Boolean).length > 0 && (
            <section id="section-Languages" style={{ ...S.card, ...highlight("Languages") }}>
              <h2 style={S.sectionLabel(accent)}>
                <span style={S.labelDot(accent)} /> Languages
              </h2>
              <p style={S.smallSub}>{languages.filter(Boolean).join(", ")}</p>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default Template10;