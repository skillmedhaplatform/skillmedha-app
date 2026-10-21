"use client";

import React from "react";
import { Avatar, Page, Rich, period, useTemplateKit } from "./templateKit";

/**
 * Template47 — "Timeline Pro"
 * Career told as a story: one continuous vertical timeline runs through
 * experience, internships and education, with dates in a left gutter.
 * Cyan accents, photo in the header, skills in a compact strip.
 */
const CYAN = "#0e7490";

const Heading = ({ children }) => (
  <h2 className="m-0 mb-4 text-[0.82rem] font-bold uppercase tracking-[0.2em]" style={{ color: CYAN }}>{children}</h2>
);

// One stop on the timeline: date gutter, dot on the line, content.
const Stop = ({ item, head, sub }) => (
  <div className="relative flex break-inside-avoid gap-5 pb-5">
    <div className="w-[88px] shrink-0 pt-0.5 text-right text-[0.72rem] font-semibold leading-5 text-slate-500">{period(item)}</div>
    <div className="relative flex-1 border-l-2 border-cyan-100 pb-1 pl-5">
      <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full border-2 border-white bg-cyan-600 shadow" />
      <h3 className="m-0 text-[0.92rem] font-bold text-slate-900">{head}</h3>
      {sub && <p className="m-0 text-[0.8rem] font-semibold" style={{ color: CYAN }}>{sub}</p>}
      <Rich html={item?.description} className="mt-1 text-[0.82rem] leading-6 text-slate-700" />
    </div>
  </div>
);

const Template47 = ({ resumeTemplateRef, activeSection, isGeneratingPdf }) => {
  const k = useTemplateKit(activeSection, "bg-cyan-50 rounded-md");

  return (
    <Page resumeTemplateRef={resumeTemplateRef} isGeneratingPdf={isGeneratingPdf} className="bg-white font-['Inter',sans-serif] text-slate-800">
      <div className="space-y-7 px-10 py-9">
        <header id="section-Basic-Details" className={`scroll-mt-8 flex items-center gap-6 p-2 -m-2 ${k.highlight("Basic Details")}`}>
          <Avatar
            photo={k.photo}
            initials={k.initials}
            className="h-20 w-20 shrink-0 rounded-full ring-4 ring-cyan-100"
            fallbackClassName="bg-cyan-700 text-2xl text-white"
          />
          <div className="min-w-0 flex-1">
            <h1 className="m-0 text-[2rem] font-extrabold leading-tight text-slate-900">{k.name}</h1>
            {k.title && <p className="m-0 text-[0.95rem] font-semibold" style={{ color: CYAN }}>{k.title}</p>}
          </div>
          <div className="shrink-0 text-right text-[0.76rem] leading-6 text-slate-600">
            {k.contact.map((c) => <div key={c}>{c}</div>)}
          </div>
        </header>

        {k.basic?.professionalSummary && (
          <section className="rounded-xl bg-cyan-50/70 px-5 py-4">
            <Rich html={k.basic.professionalSummary} className="text-[0.86rem] leading-6 text-slate-700" />
          </section>
        )}

        {k.skills.length > 0 && (
          <section id="section-Skills" className={`scroll-mt-8 p-3 -m-3 ${k.highlight("Skills")}`}>
            <Heading>Skills</Heading>
            <p className="m-0 text-[0.84rem] leading-7 text-slate-700">{k.skills.join("  ·  ")}</p>
          </section>
        )}

        {k.experience.length > 0 && (
          <section id="section-Experience" className={`scroll-mt-8 p-3 -m-3 ${k.highlight("Experience")}`}>
            <Heading>Experience</Heading>
            {k.experience.map((e, i) => <Stop key={i} item={e} head={e.role} sub={e.company} />)}
          </section>
        )}
        {k.internships.length > 0 && (
          <section id="section-Internships" className={`scroll-mt-8 p-3 -m-3 ${k.highlight("Internships")}`}>
            <Heading>Internships</Heading>
            {k.internships.map((e, i) => <Stop key={i} item={e} head={e.role} sub={e.company} />)}
          </section>
        )}
        {k.education.length > 0 && (
          <section id="section-Education" className={`scroll-mt-8 p-3 -m-3 ${k.highlight("Education")}`}>
            <Heading>Education</Heading>
            {k.education.map((e, i) => <Stop key={i} item={e} head={e.type} sub={e.school || e.board} />)}
          </section>
        )}
        {k.projects.length > 0 && (
          <section id="section-Projects" className={`scroll-mt-8 p-3 -m-3 ${k.highlight("Projects")}`}>
            <Heading>Projects</Heading>
            {k.projects.map((p, i) => <Stop key={i} item={p} head={p.project} sub={p.company} />)}
          </section>
        )}

        <div className="grid grid-cols-3 gap-6">
          {k.certificates.length > 0 && (
            <section id="section-Certifications" className={`scroll-mt-8 p-3 -m-3 ${k.highlight("Certifications")}`}>
              <Heading>Certifications</Heading>
              {k.certificates.map((c, i) => (
                <p key={i} className="m-0 mb-1 text-[0.8rem] leading-5"><b>{c.name}</b>{c.organization ? ` · ${c.organization}` : ""}</p>
              ))}
            </section>
          )}
          {k.achievements.length > 0 && (
            <section id="section-Accomplishments" className={`scroll-mt-8 p-3 -m-3 ${k.highlight("Accomplishments")}`}>
              <Heading>Achievements</Heading>
              {k.achievements.map((a, i) => (
                <p key={i} className="m-0 mb-1 text-[0.8rem] leading-5"><b>{a.title}</b>{a.description ? ` — ${a.description}` : ""}</p>
              ))}
            </section>
          )}
          {(k.languages.length > 0 || k.volunteering.length > 0) && (
            <div className="space-y-5">
              {k.languages.length > 0 && (
                <section id="section-Languages" className={`scroll-mt-8 p-3 -m-3 ${k.highlight("Languages")}`}>
                  <Heading>Languages</Heading>
                  <p className="m-0 text-[0.8rem]">{k.languages.join(", ")}</p>
                </section>
              )}
              {k.volunteering.length > 0 && (
                <section id="section-Volunteering" className={`scroll-mt-8 p-3 -m-3 ${k.highlight("Volunteering")}`}>
                  <Heading>Volunteering</Heading>
                  {k.volunteering.map((v, i) => (
                    <p key={i} className="m-0 mb-1 text-[0.8rem]"><b>{v.volunteering}</b>{v.organization ? `, ${v.organization}` : ""}</p>
                  ))}
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </Page>
  );
};

export default Template47;
