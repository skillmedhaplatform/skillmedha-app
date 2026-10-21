"use client";

import React from "react";
import { Page, Rich, period, useTemplateKit } from "./templateKit";

/**
 * Template46 — "Fresh Graduate"
 * Built for students and freshers: education and projects come first,
 * skills sit in an easy-to-scan grid, and experience follows. Fresh green
 * accents on a single, ATS-friendly column.
 */
const GREEN = "#15803d";

const Heading = ({ children }) => (
  <h2 className="m-0 mb-3 flex items-center gap-2 text-[0.9rem] font-extrabold uppercase tracking-[0.12em] text-slate-900">
    <span className="h-4 w-1.5 rounded-full" style={{ background: GREEN }} />
    {children}
  </h2>
);

const Entry = ({ item, head, sub }) => (
  <div className="break-inside-avoid">
    <div className="flex items-baseline justify-between gap-3">
      <h3 className="m-0 text-[0.92rem] font-bold text-slate-900">{head}</h3>
      <span className="shrink-0 text-[0.76rem] text-slate-500">{period(item)}</span>
    </div>
    {sub && <p className="m-0 text-[0.82rem] font-semibold" style={{ color: GREEN }}>{sub}</p>}
    <Rich html={item?.description} className="mt-1 text-[0.82rem] leading-6 text-slate-700" />
  </div>
);

const Template46 = ({ resumeTemplateRef, activeSection, isGeneratingPdf }) => {
  const k = useTemplateKit(activeSection, "bg-green-50 rounded-md");

  return (
    <Page resumeTemplateRef={resumeTemplateRef} isGeneratingPdf={isGeneratingPdf} className="bg-white font-['Inter',sans-serif] text-slate-800">
      <div className="space-y-6 px-11 py-9">
        <header id="section-Basic-Details" className={`scroll-mt-8 border-b-2 pb-5 p-2 -m-2 ${k.highlight("Basic Details")}`} style={{ borderColor: GREEN }}>
          <h1 className="m-0 text-[2.2rem] font-extrabold leading-tight text-slate-900">{k.name}</h1>
          {k.title && <p className="m-0 mt-1 text-[0.95rem] font-semibold" style={{ color: GREEN }}>{k.title}</p>}
          <p className="m-0 mt-2 text-[0.8rem] text-slate-600">
            {[...k.contact, ...k.links.slice(0, 2).map((l) => l.title || l.link)].join("   •   ")}
          </p>
        </header>

        {k.basic?.professionalSummary && (
          <section>
            <Heading>Career Objective</Heading>
            <Rich html={k.basic.professionalSummary} className="text-[0.86rem] leading-6 text-slate-700" />
          </section>
        )}

        {k.education.length > 0 && (
          <section id="section-Education" className={`scroll-mt-8 p-3 -m-3 ${k.highlight("Education")}`}>
            <Heading>Education</Heading>
            <div className="space-y-3">
              {k.education.map((e, i) => (
                <div key={i} className="rounded-lg bg-green-50/60 px-4 py-3">
                  <Entry item={e} head={e.type} sub={e.school || e.board} />
                </div>
              ))}
            </div>
          </section>
        )}

        {k.projects.length > 0 && (
          <section id="section-Projects" className={`scroll-mt-8 p-3 -m-3 ${k.highlight("Projects")}`}>
            <Heading>Academic &amp; Personal Projects</Heading>
            <div className="space-y-4">{k.projects.map((p, i) => <Entry key={i} item={p} head={p.project} sub={p.company} />)}</div>
          </section>
        )}

        {k.skills.length > 0 && (
          <section id="section-Skills" className={`scroll-mt-8 p-3 -m-3 ${k.highlight("Skills")}`}>
            <Heading>Skills</Heading>
            <div className="grid grid-cols-3 gap-x-4 gap-y-1.5">
              {k.skills.map((s) => (
                <span key={s} className="flex items-center gap-2 text-[0.82rem]">
                  <span className="text-[0.7rem]" style={{ color: GREEN }}>✔</span>
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}

        {k.internships.length > 0 && (
          <section id="section-Internships" className={`scroll-mt-8 p-3 -m-3 ${k.highlight("Internships")}`}>
            <Heading>Internships</Heading>
            <div className="space-y-4">{k.internships.map((e, i) => <Entry key={i} item={e} head={e.role} sub={e.company} />)}</div>
          </section>
        )}

        {k.experience.length > 0 && (
          <section id="section-Experience" className={`scroll-mt-8 p-3 -m-3 ${k.highlight("Experience")}`}>
            <Heading>Experience</Heading>
            <div className="space-y-4">{k.experience.map((e, i) => <Entry key={i} item={e} head={e.role} sub={e.company} />)}</div>
          </section>
        )}

        {k.certificates.length > 0 && (
          <section id="section-Certifications" className={`scroll-mt-8 p-3 -m-3 ${k.highlight("Certifications")}`}>
            <Heading>Certifications &amp; Courses</Heading>
            <ul className="m-0 text-[0.82rem] leading-6">
              {k.certificates.map((c, i) => <li key={i}><b>{c.name}</b>{c.organization ? ` — ${c.organization}` : ""}</li>)}
            </ul>
          </section>
        )}

        {k.achievements.length > 0 && (
          <section id="section-Accomplishments" className={`scroll-mt-8 p-3 -m-3 ${k.highlight("Accomplishments")}`}>
            <Heading>Achievements</Heading>
            <ul className="m-0 text-[0.82rem] leading-6">
              {k.achievements.map((a, i) => <li key={i}><b>{a.title}</b>{a.description ? ` — ${a.description}` : ""}</li>)}
            </ul>
          </section>
        )}

        <div className="grid grid-cols-2 gap-6">
          {k.volunteering.length > 0 && (
            <section id="section-Volunteering" className={`scroll-mt-8 p-3 -m-3 ${k.highlight("Volunteering")}`}>
              <Heading>Extracurricular</Heading>
              <div className="space-y-2">
                {k.volunteering.map((v, i) => (
                  <p key={i} className="m-0 text-[0.82rem]"><b>{v.volunteering}</b>{v.organization ? `, ${v.organization}` : ""}</p>
                ))}
              </div>
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

export default Template46;
