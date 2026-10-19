"use client";

import React from "react";
import { Page, Rich, period, useTemplateKit } from "./templateKit";

/**
 * Template48 — "Swiss Grid"
 * International-style minimalism: a strict two-column grid with section
 * labels in a narrow left column and content on the right, separated by
 * hairline rules. Black type, generous white space, one red accent.
 */
const RED = "#dc2626";

// One labelled row of the grid.
const Row = ({ id, label, className = "", children }) => (
  <section id={id} className={`grid scroll-mt-8 grid-cols-[150px_1fr] gap-8 border-t border-neutral-200 py-5 ${className}`}>
    <h2 className="m-0 text-[0.72rem] font-bold uppercase tracking-[0.22em] text-neutral-500">{label}</h2>
    <div className="min-w-0">{children}</div>
  </section>
);

const Entry = ({ item, head, sub }) => (
  <div className="mb-4 break-inside-avoid last:mb-0">
    <div className="flex items-baseline justify-between gap-4">
      <h3 className="m-0 text-[0.92rem] font-semibold text-neutral-900">{head}</h3>
      <span className="shrink-0 text-[0.74rem] tabular-nums text-neutral-500">{period(item)}</span>
    </div>
    {sub && <p className="m-0 text-[0.82rem] text-neutral-600">{sub}</p>}
    <Rich html={item?.description} className="mt-1 text-[0.82rem] leading-6 text-neutral-700" />
  </div>
);

const Template48 = ({ resumeTemplateRef, activeSection, isGeneratingPdf }) => {
  const k = useTemplateKit(activeSection, "bg-neutral-50");

  return (
    <Page resumeTemplateRef={resumeTemplateRef} isGeneratingPdf={isGeneratingPdf} className="bg-white font-['Helvetica_Neue','Inter',Arial,sans-serif] text-neutral-900">
      <div className="px-12 py-11">
        <header id="section-Basic-Details" className={`scroll-mt-8 grid grid-cols-[150px_1fr] gap-8 pb-8 ${k.highlight("Basic Details")}`}>
          <div className="h-3 w-3 self-end rounded-full" style={{ background: RED }} />
          <div>
            <h1 className="m-0 text-[2.6rem] font-light leading-none tracking-tight">{k.name}</h1>
            {k.title && <p className="m-0 mt-2 text-[0.95rem] text-neutral-500">{k.title}</p>}
            <p className="m-0 mt-4 text-[0.78rem] text-neutral-600">
              {[...k.contact, ...k.links.slice(0, 2).map((l) => l.title || l.link)].join("   /   ")}
            </p>
          </div>
        </header>

        {k.basic?.professionalSummary && (
          <Row label="Profile">
            <Rich html={k.basic.professionalSummary} className="text-[0.88rem] leading-7 text-neutral-700" />
          </Row>
        )}
        {k.experience.length > 0 && (
          <Row id="section-Experience" label="Experience" className={k.highlight("Experience")}>
            {k.experience.map((e, i) => <Entry key={i} item={e} head={e.role} sub={e.company} />)}
          </Row>
        )}
        {k.internships.length > 0 && (
          <Row id="section-Internships" label="Internships" className={k.highlight("Internships")}>
            {k.internships.map((e, i) => <Entry key={i} item={e} head={e.role} sub={e.company} />)}
          </Row>
        )}
        {k.projects.length > 0 && (
          <Row id="section-Projects" label="Projects" className={k.highlight("Projects")}>
            {k.projects.map((p, i) => <Entry key={i} item={p} head={p.project} sub={p.company} />)}
          </Row>
        )}
        {k.education.length > 0 && (
          <Row id="section-Education" label="Education" className={k.highlight("Education")}>
            {k.education.map((e, i) => <Entry key={i} item={e} head={e.type} sub={e.school || e.board} />)}
          </Row>
        )}
        {k.skills.length > 0 && (
          <Row id="section-Skills" label="Skills" className={k.highlight("Skills")}>
            <p className="m-0 text-[0.86rem] leading-7">{k.skills.join(", ")}</p>
          </Row>
        )}
        {k.certificates.length > 0 && (
          <Row id="section-Certifications" label="Certifications" className={k.highlight("Certifications")}>
            {k.certificates.map((c, i) => (
              <p key={i} className="m-0 text-[0.84rem] leading-6">{c.name}{c.organization ? <span className="text-neutral-500"> — {c.organization}</span> : null}</p>
            ))}
          </Row>
        )}
        {k.achievements.length > 0 && (
          <Row id="section-Accomplishments" label="Awards" className={k.highlight("Accomplishments")}>
            {k.achievements.map((a, i) => (
              <p key={i} className="m-0 text-[0.84rem] leading-6"><b className="font-semibold">{a.title}</b>{a.description ? ` — ${a.description}` : ""}</p>
            ))}
          </Row>
        )}
        {k.volunteering.length > 0 && (
          <Row id="section-Volunteering" label="Volunteering" className={k.highlight("Volunteering")}>
            {k.volunteering.map((v, i) => <Entry key={i} item={v} head={v.volunteering} sub={v.organization} />)}
          </Row>
        )}
        {k.languages.length > 0 && (
          <Row id="section-Languages" label="Languages" className={k.highlight("Languages")}>
            <p className="m-0 text-[0.86rem]">{k.languages.join(", ")}</p>
          </Row>
        )}
      </div>
    </Page>
  );
};

export default Template48;
