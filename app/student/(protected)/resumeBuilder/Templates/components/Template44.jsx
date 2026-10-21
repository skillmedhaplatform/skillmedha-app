"use client";

import React from "react";
import { Page, Rich, period, useTemplateKit } from "./templateKit";

/**
 * Template44 — "Executive Gold"
 * Charcoal and gold for senior profiles: a large serif name over a short
 * gold bar, experience in the main column with gold dates, and a narrow
 * right column for core competencies, education and languages.
 */
const GOLD = "#b8892d";

const Heading = ({ children }) => (
  <h2 className="m-0 mb-3 font-['Georgia',serif] text-[1.02rem] font-bold text-[#1f2937]">
    {children}
    <span className="mt-1 block h-[2px] w-10" style={{ background: GOLD }} />
  </h2>
);

const Entry = ({ item, head, sub }) => (
  <div className="break-inside-avoid">
    <div className="flex items-baseline justify-between gap-3">
      <h3 className="m-0 text-[0.94rem] font-bold text-[#111827]">{head}</h3>
      <span className="shrink-0 text-[0.76rem] font-semibold uppercase tracking-wide" style={{ color: GOLD }}>{period(item)}</span>
    </div>
    {sub && <p className="m-0 text-[0.84rem] italic text-[#4b5563]">{sub}</p>}
    <Rich html={item?.description} className="mt-1 text-[0.83rem] leading-6 text-[#374151]" />
  </div>
);

const Template44 = ({ resumeTemplateRef, activeSection, isGeneratingPdf }) => {
  const k = useTemplateKit(activeSection, "bg-amber-50 rounded");

  return (
    <Page resumeTemplateRef={resumeTemplateRef} isGeneratingPdf={isGeneratingPdf} className="bg-white font-['Inter',sans-serif] text-[#1f2937]">
      <div className="h-2 w-full bg-[#1f2937]" />
      <div className="px-11 py-9">
        <header id="section-Basic-Details" className={`scroll-mt-8 flex items-end justify-between gap-6 p-2 -m-2 ${k.highlight("Basic Details")}`}>
          <div>
            <h1 className="m-0 font-['Georgia',serif] text-[2.4rem] font-bold leading-none tracking-tight">{k.name}</h1>
            <div className="mt-3 h-1 w-16" style={{ background: GOLD }} />
            {k.title && <p className="m-0 mt-3 text-[0.9rem] font-semibold uppercase tracking-[0.2em] text-[#6b7280]">{k.title}</p>}
          </div>
          <div className="shrink-0 text-right text-[0.78rem] leading-6 text-[#4b5563]">
            {k.contact.map((c) => <div key={c}>{c}</div>)}
            {k.links.slice(0, 2).map((l) => <div key={l.link} style={{ color: GOLD }}>{l.title || l.link}</div>)}
          </div>
        </header>

        <div className="mt-8 flex gap-9">
          <main className="min-w-0 flex-1 space-y-7">
            {k.basic?.professionalSummary && (
              <section>
                <Heading>Executive Summary</Heading>
                <Rich html={k.basic.professionalSummary} className="text-[0.86rem] leading-6 text-[#374151]" />
              </section>
            )}
            {k.experience.length > 0 && (
              <section id="section-Experience" className={`scroll-mt-8 p-3 -m-3 ${k.highlight("Experience")}`}>
                <Heading>Professional Experience</Heading>
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
                <Heading>Key Projects</Heading>
                <div className="space-y-5">{k.projects.map((p, i) => <Entry key={i} item={p} head={p.project} sub={p.company} />)}</div>
              </section>
            )}
            {k.volunteering.length > 0 && (
              <section id="section-Volunteering" className={`scroll-mt-8 p-3 -m-3 ${k.highlight("Volunteering")}`}>
                <Heading>Board &amp; Volunteer Roles</Heading>
                <div className="space-y-4">{k.volunteering.map((v, i) => <Entry key={i} item={v} head={v.volunteering} sub={v.organization} />)}</div>
              </section>
            )}
          </main>

          <aside className="w-[30%] shrink-0 space-y-7 border-l border-[#e5e7eb] pl-7">
            {k.skills.length > 0 && (
              <section id="section-Skills" className={`scroll-mt-8 p-2 -m-2 ${k.highlight("Skills")}`}>
                <Heading>Core Competencies</Heading>
                <ul className="!list-none !pl-0 m-0 space-y-1.5">
                  {k.skills.map((s) => (
                    <li key={s} className="flex items-center gap-2 text-[0.82rem]">
                      <span className="h-1.5 w-1.5 shrink-0 rotate-45" style={{ background: GOLD }} />
                      {s}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {k.education.length > 0 && (
              <section id="section-Education" className={`scroll-mt-8 p-2 -m-2 ${k.highlight("Education")}`}>
                <Heading>Education</Heading>
                {k.education.map((e, i) => (
                  <div key={i} className="mb-3">
                    <p className="m-0 text-[0.84rem] font-bold">{e.type}</p>
                    <p className="m-0 text-[0.78rem] text-[#4b5563]">{e.school || e.board}</p>
                    <p className="m-0 text-[0.72rem] font-semibold" style={{ color: GOLD }}>{period(e)}</p>
                  </div>
                ))}
              </section>
            )}
            {k.certificates.length > 0 && (
              <section id="section-Certifications" className={`scroll-mt-8 p-2 -m-2 ${k.highlight("Certifications")}`}>
                <Heading>Certifications</Heading>
                {k.certificates.map((c, i) => (
                  <p key={i} className="m-0 mb-1.5 text-[0.8rem] leading-5"><b>{c.name}</b>{c.organization ? <><br /><span className="text-[#6b7280]">{c.organization}</span></> : null}</p>
                ))}
              </section>
            )}
            {k.achievements.length > 0 && (
              <section id="section-Accomplishments" className={`scroll-mt-8 p-2 -m-2 ${k.highlight("Accomplishments")}`}>
                <Heading>Recognition</Heading>
                {k.achievements.map((a, i) => (
                  <p key={i} className="m-0 mb-1.5 text-[0.8rem] leading-5"><b>{a.title}</b>{a.description ? ` — ${a.description}` : ""}</p>
                ))}
              </section>
            )}
            {k.languages.length > 0 && (
              <section id="section-Languages" className={`scroll-mt-8 p-2 -m-2 ${k.highlight("Languages")}`}>
                <Heading>Languages</Heading>
                <p className="m-0 text-[0.82rem] leading-6">{k.languages.join(", ")}</p>
              </section>
            )}
          </aside>
        </div>
      </div>
    </Page>
  );
};

export default Template44;
