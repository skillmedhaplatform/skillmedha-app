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
 * Template9 — "Minimal Rule"
 * A quiet, editorial single-column layout: a serif display name, thin
 * hairline rules instead of colour blocks, and a left-hand date column
 * that reads like a timeline for experience/education entries. Colour
 * is used sparingly — only for the name, rule accents, and dates — so
 * the page stays print-friendly and understated.
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
    padding: "36px 40px",
  },
  swatchRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    borderBottom: "1px solid #eeeeee",
    padding: "8px 40px",
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
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    paddingBottom: "18px",
  },
  name: (accent) => ({
    margin: 0,
    fontSize: "34px",
    fontWeight: 700,
    fontFamily: "'Georgia', 'Times New Roman', serif",
    letterSpacing: "-0.01em",
    color: accent,
    lineHeight: 1.15,
  }),
  headline: {
    margin: "6px 0 0",
    fontSize: "15px",
    fontWeight: 400,
    fontStyle: "italic",
    color: "#666666",
  },
  photo: {
    height: "72px",
    width: "72px",
    flexShrink: 0,
    borderRadius: "50%",
    objectFit: "cover",
    border: "1px solid #e2e2e2",
  },
  hr: (accent) => ({
    height: "2px",
    border: "none",
    backgroundColor: accent,
    margin: 0,
  }),
  contactRow: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "8px 22px",
    padding: "12px 0 20px",
    fontSize: "12.5px",
    color: "#4a4a4a",
    borderBottom: "1px solid #eaeaea",
  },
  contactLink: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    textDecoration: "none",
    color: "#4a4a4a",
  },
  section: { padding: "22px 0", borderBottom: "1px solid #eaeaea" },
  sectionLabel: (accent) => ({
    margin: "0 0 12px",
    fontSize: "11.5px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.14em",
    color: accent,
  }),
  summaryText: { fontSize: "14.5px", lineHeight: 1.65, color: "#333333" },
  skillsRow: { display: "flex", flexWrap: "wrap", gap: "8px 10px" },
  skillPill: {
    fontSize: "12.5px",
    color: "#333333",
    padding: "3px 0",
    borderBottom: "1px dotted #b6b6b6",
  },
  timelineEntry: {
    display: "grid",
    gridTemplateColumns: "110px 1fr",
    columnGap: "20px",
    marginBottom: "18px",
  },
  timelineDate: (accent) => ({
    fontSize: "12px",
    fontWeight: 700,
    color: accent,
    whiteSpace: "nowrap",
    paddingTop: "2px",
  }),
  entryTitle: { margin: 0, fontSize: "15px", fontWeight: 700, color: "#1a1a1a" },
  entrySub: { fontWeight: 400, fontStyle: "italic", color: "#666666" },
  entryDesc: { margin: "4px 0 0", fontSize: "13.5px", lineHeight: 1.6, color: "#333333" },
  footerGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "22px",
  },
  smallSub: { margin: "0 0 6px", fontSize: "12.5px", color: "#555555", lineHeight: 1.5 },
  smallTitle: { fontWeight: 700, color: "#1a1a1a" },
};

const Template9 = ({ resumeTemplateRef, activeSection, isGeneratingPdf }) => {
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
  const [accent, setAccent] = useState(COLOR_OPTIONS[0].value);

  const profileLinks = links.filter((item) => item?.link);
  const linkIcons = [<LinkedinFilled key="li" />, <GithubOutlined key="gh" />, <GlobalOutlined key="gl" />];

  const highlight = (name) =>
    activeSection === name
      ? { outline: `2px solid ${accent}`, outlineOffset: "4px", borderRadius: "6px" }
      : {};

  const hasFooterCol =
    certificates.filter((c) => c?.name || c?.organization).length > 0 ||
    languages.filter(Boolean).length > 0 ||
    volunteerings.filter((v) => v?.organization || v?.volunteering).length > 0;

  return (
    <div ref={resumeTemplateRef} style={{ ...S.page, maxWidth: isGeneratingPdf ? "800px" : "100%", padding: isGeneratingPdf ? "36px 40px" : S.page.padding }}>
      {!isGeneratingPdf && (
        <div style={{ ...S.swatchRow, margin: "-36px -40px 20px", padding: "8px 40px" }} className="print:hidden">
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

      <header id="section-Basic-Details" style={highlight("Basic Details")}>
        <div style={S.headerRow}>
          <div style={{ minWidth: 0 }}>
            <h1 style={S.name(accent)}>
              {basicDetails?.firstName} {basicDetails?.middleName} {basicDetails?.lastName}
            </h1>
            {workExperience?.[0]?.role && <p style={S.headline}>{workExperience[0].role}</p>}
          </div>
          {profileBase64 && <img src={profileBase64} alt="profile" style={S.photo} />}
        </div>
        <hr style={S.hr(accent)} />
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
      </header>

      {basicDetails?.professionalSummary && (
        <section style={S.section}>
          <h2 style={S.sectionLabel(accent)}>Professional summary</h2>
          <div style={S.summaryText} dangerouslySetInnerHTML={{ __html: asHtmlString(basicDetails.professionalSummary) }} />
        </section>
      )}

      {skills.filter(Boolean).length > 0 && (
        <section id="section-Skills" style={{ ...S.section, ...highlight("Skills") }}>
          <h2 style={S.sectionLabel(accent)}>Key skills</h2>
          <div style={S.skillsRow}>
            {skills.filter(Boolean).map((skill, i) => (
              <span key={i} style={S.skillPill}>
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {workExperience.length > 0 && (
        <section id="section-Experience" style={{ ...S.section, ...highlight("Experience") }}>
          <h2 style={S.sectionLabel(accent)}>Work experience</h2>
          {workExperience.map((item, i) => (
            <div key={i} style={S.timelineEntry}>
              <div style={S.timelineDate(accent)}>
                {item?.start || item?.startDate} – {item?.end || item?.endDate || "Present"}
              </div>
              <div>
                <h3 style={S.entryTitle}>
                  {item?.role}
                  {item?.company && <span style={S.entrySub}>, {item.company}</span>}
                </h3>
                {item?.description && <p style={S.entryDesc}>{item.description}</p>}
              </div>
            </div>
          ))}
        </section>
      )}

      {internshipDetails.length > 0 && (
        <section id="section-Internships" style={{ ...S.section, ...highlight("Internships") }}>
          <h2 style={S.sectionLabel(accent)}>Internships</h2>
          {internshipDetails.map((item, i) => (
            <div key={i} style={S.timelineEntry}>
              <div style={S.timelineDate(accent)}>
                {item?.start || item?.startDate} – {item?.end || item?.endDate}
              </div>
              <div>
                <h3 style={S.entryTitle}>
                  {item?.role}
                  {item?.company && <span style={S.entrySub}>, {item.company}</span>}
                </h3>
                {item?.description && <p style={S.entryDesc}>{item.description}</p>}
              </div>
            </div>
          ))}
        </section>
      )}

      {projectDetails.filter((p) => p?.project).length > 0 && (
        <section id="section-Projects" style={{ ...S.section, ...highlight("Projects") }}>
          <h2 style={S.sectionLabel(accent)}>Projects</h2>
          {projectDetails
            .filter((p) => p?.project)
            .map((item, i) => (
              <div key={i} style={S.timelineEntry}>
                <div style={S.timelineDate(accent)}>
                  {item?.startDate} {item?.endDate ? `– ${item.endDate}` : ""}
                </div>
                <div>
                  <h3 style={S.entryTitle}>
                    {item.project}
                    {item?.company && <span style={S.entrySub}> — {item.company}</span>}
                  </h3>
                  <div style={S.entryDesc} dangerouslySetInnerHTML={{ __html: parseIfJson(item?.description) }} />
                </div>
              </div>
            ))}
        </section>
      )}

      {accDetails.filter((a) => a?.accomplishment || a?.description).length > 0 && (
        <section id="section-Accomplishments" style={{ ...S.section, ...highlight("Accomplishments") }}>
          <h2 style={S.sectionLabel(accent)}>Achievements</h2>
          <ul style={{ margin: 0, listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
            {accDetails
              .filter((a) => a?.accomplishment || a?.description)
              .map((item, i) => (
                <li key={i} style={{ fontSize: "13.5px", lineHeight: 1.6, color: "#333333" }}>
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
          {educationDetails.map((item, i) => (
            <div key={i} style={S.timelineEntry}>
              <div style={S.timelineDate(accent)}>
                {item?.startDate} – {item?.endDate}
              </div>
              <h3 style={{ ...S.entryTitle, fontSize: "14.5px" }}>
                {item?.type} {item?.school ? `— ${item.school}` : ""}
                {item?.grade ? `, ${item.grade}${item?.gradeType === "percentage" ? "%" : item?.gradeType ? "/10" : ""}` : ""}
              </h3>
            </div>
          ))}
        </section>
      )}

      {hasFooterCol && (
        <div style={{ ...S.footerGrid, paddingTop: "22px" }}>
          {certificates.filter((c) => c?.name || c?.organization).length > 0 && (
            <section id="section-Certifications" style={highlight("Certifications")}>
              <h2 style={S.sectionLabel(accent)}>Certifications</h2>
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
            <section id="section-Volunteering" style={highlight("Volunteering")}>
              <h2 style={S.sectionLabel(accent)}>Volunteering</h2>
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
            <section id="section-Languages" style={highlight("Languages")}>
              <h2 style={S.sectionLabel(accent)}>Languages</h2>
              <p style={S.smallSub}>{languages.filter(Boolean).join(", ")}</p>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default Template9;