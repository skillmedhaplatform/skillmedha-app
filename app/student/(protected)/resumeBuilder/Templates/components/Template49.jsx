"use client";

import React from "react";
import { Avatar, Page, Rich, period, useTemplateKit } from "./templateKit";

/**
 * Template49 — "Corporate Banner"
 * A navy banner with name, headline and photo, a light contact strip
 * underneath, then a single readable column. Key skills sit in a
 * three-column checklist; certifications and achievements share a row.
 */
const NAVY = "#1e3a8a";

const Heading = ({ children }) => (
  <h2 className="m-0 mb-3 border-b-2 border-blue-100 pb-1 text-[0.86rem] font-extrabold uppercase tracking-[0.14em]" style={{ color: NAVY }}>
    {children}
  </h2>
);

const Entry = ({ item, head, sub }) => (
  <div className="break-inside-avoid">
    <div className="flex items-baseline justify-between gap-3">
      <h3 className="m-0 text-[0.94rem] font-bold text-slate-900">{head}</h3>
      <span className="shrink-0 rounded bg-blue-50 px-2 py-0.5 text-[0.72rem] font-semibold" style={{ color: NAVY }}>{period(item)}</span>
    </div>
    {sub && <p className="m-0 text-[0.84rem] font-semibold text-slate-600">{sub}</p>}
    <Rich html={item?.description} className="mt-1 text-[0.83rem] leading-6 text-slate-700" />
  </div>
);

const Template49 = ({ resumeTemplateRef, activeSection, isGeneratingPdf }) => {
  const k = useTemplateKit(activeSection, "bg-blue-50 rounded-md");

  return (
    <Page resumeTemplateRef={resumeTemplateRef} isGeneratingPdf={isGeneratingPdf} className="bg-white font-['Inter',sans-serif] text-slate-800">
      <header
        id="section-Basic-Details"
        className={`scroll-mt-8 flex items-center justify-between gap-6 px-10 py-8 text-white ${activeSection === "Basic Details" ? "ring-4 ring-inset ring-white/40" : ""}`}
        style={{ background: `linear-gradient(120deg, ${NAVY}, #1d4ed8)` }}
      >
        <div className="min-w-0">
          <h1 className="m-0 text-[2.2rem] font-extrabold leading-tight">{k.name}</h1>
          {k.title && <p className="m-0 mt-1 text-[1rem] font-medium text-blue-100">{k.title}</p>}
        </div>
        <Avatar
          photo={k.photo}
          initials={k.initials}
          className="h-24 w-24 shrink-0 rounded-full border-4 border-white/50"
          fallbackClassName="bg-white/15 text-3xl text-white"
        />
      </header>
      <div className="grid grid-cols-3 gap-2 bg-slate-100 px-10 py-3 text-[0.78rem] text-slate-700">
        {[...k.contact, ...k.links.slice(0, 3).map((l) => l.title || l.link)].slice(0, 6).map((c) => (
          <span key={c} className="truncate">• {c}</span>
        ))}
      </div>

      <div className="space-y-6 px-10 py-8">
        {k.basic?.professionalSummary && (
          <section>
            <Heading>Professional Summary</Heading>
            <Rich html={k.basic.professionalSummary} className="text-[0.86rem] leading-6 text-slate-700" />
          </section>
        )}
        {k.skills.length > 0 && (
          <section id="section-Skills" className={`scroll-mt-8 p-3 -m-3 ${k.highlight("Skills")}`}>
            <Heading>Key Skills</Heading>
            <div className="grid grid-cols-3 gap-x-4 gap-y-1.5">
              {k.skills.map((s) => (
                <span key={s} className="flex items-center gap-2 text-[0.82rem]">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[0.6rem]" style={{ color: NAVY }}>✓</span>
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}
        {k.experience.length > 0 && (
          <section id="section-Experience" className={`scroll-mt-8 p-3 -m-3 ${k.highlight("Experience")}`}>
            <Heading>Work Experience</Heading>
            <div className="space-y-5">{k.experience.map((e, i) => <Entry key={i} item={e} head={e.role} sub={e.company} />)}</div>
          </section>
        )}
        {k.internships.length > 0 && (
          <section id="section-Internships" className={`scroll-mt-8 p-3 -m-3 ${k.highlight("Internships")}`}>
            <Heading>Internships</Heading>
            <div className="space-y-5">{k.internships.map((e, i) => <Entry key={i} item={e} head={e.role} sub={e.company} />)}</div>
          </section>
        )}
        {k.projects.length > 0 && (
          <section id="section-Projects" className={`scroll-mt-8 p-3 -m-3 ${k.highlight("Projects")}`}>
            <Heading>Projects</Heading>
            <div className="space-y-5">{k.projects.map((p, i) => <Entry key={i} item={p} head={p.project} sub={p.company} />)}</div>
          </section>
        )}
        {k.education.length > 0 && (
          <section id="section-Education" className={`scroll-mt-8 p-3 -m-3 ${k.highlight("Education")}`}>
            <Heading>Education</Heading>
            <div className="space-y-4">{k.education.map((e, i) => <Entry key={i} item={e} head={e.type} sub={e.school || e.board} />)}</div>
          </section>
        )}
        <div className="grid grid-cols-2 gap-8">
          {k.certificates.length > 0 && (
            <section id="section-Certifications" className={`scroll-mt-8 p-3 -m-3 ${k.highlight("Certifications")}`}>
              <Heading>Certifications</Heading>
              {k.certificates.map((c, i) => (
                <p key={i} className="m-0 mb-1.5 text-[0.82rem] leading-5"><b>{c.name}</b>{c.organization ? ` — ${c.organization}` : ""}</p>
              ))}
            </section>
          )}
          {k.achievements.length > 0 && (
            <section id="section-Accomplishments" className={`scroll-mt-8 p-3 -m-3 ${k.highlight("Accomplishments")}`}>
              <Heading>Achievements</Heading>
              {k.achievements.map((a, i) => (
                <p key={i} className="m-0 mb-1.5 text-[0.82rem] leading-5"><b>{a.title}</b>{a.description ? ` — ${a.description}` : ""}</p>
              ))}
            </section>
          )}
          {k.volunteering.length > 0 && (
            <section id="section-Volunteering" className={`scroll-mt-8 p-3 -m-3 ${k.highlight("Volunteering")}`}>
              <Heading>Volunteering</Heading>
              {k.volunteering.map((v, i) => (
                <p key={i} className="m-0 mb-1.5 text-[0.82rem]"><b>{v.volunteering}</b>{v.organization ? `, ${v.organization}` : ""}</p>
              ))}
            </section>
          )}
          {k.languages.length > 0 && (
            <section id="section-Languages" className={`scroll-mt-8 p-3 -m-3 ${k.highlight("Languages")}`}>
              <Heading>Languages</Heading>
              <p className="m-0 text-[0.82rem]">{k.languages.join(", ")}</p>
            </section>
          )}
        </div>
      </div>
    </Page>
  );
};

export default Template49;
