"use client";

import React from "react";
import { Avatar, Page, Rich, period, useTemplateKit } from "./templateKit";

/**
 * Template50 — "Impact Wave"
 * A warm orange header that ends in a soft wave, a row of real headline
 * numbers (roles, projects, skills, certifications) taken from the
 * student's own data, achievements as highlight cards, then the details.
 */
const ORANGE = "#ea580c";

const Heading = ({ children }) => (
  <h2 className="m-0 mb-3 text-[1rem] font-extrabold text-slate-900">
    {children}
    <span className="ml-2 inline-block h-2 w-2 rounded-full align-middle" style={{ background: ORANGE }} />
  </h2>
);

const Entry = ({ item, head, sub }) => (
  <div className="break-inside-avoid">
    <div className="flex items-baseline justify-between gap-3">
      <h3 className="m-0 text-[0.92rem] font-bold text-slate-900">{head}</h3>
      <span className="shrink-0 text-[0.74rem] font-semibold text-orange-600">{period(item)}</span>
    </div>
    {sub && <p className="m-0 text-[0.82rem] font-medium text-slate-500">{sub}</p>}
    <Rich html={item?.description} className="mt-1 text-[0.82rem] leading-6 text-slate-700" />
  </div>
);

const Template50 = ({ resumeTemplateRef, activeSection, isGeneratingPdf }) => {
  const k = useTemplateKit(activeSection, "bg-orange-50 rounded-lg");

  // Only numbers the student actually has — nothing invented.
  const stats = [
    { value: k.allExperience.length, label: k.allExperience.length === 1 ? "Role" : "Roles" },
    { value: k.projects.length, label: k.projects.length === 1 ? "Project" : "Projects" },
    { value: k.skills.length, label: "Skills" },
    { value: k.certificates.length, label: k.certificates.length === 1 ? "Certification" : "Certifications" },
  ].filter((s) => s.value > 0);

  return (
    <Page resumeTemplateRef={resumeTemplateRef} isGeneratingPdf={isGeneratingPdf} className="bg-white font-['Inter',sans-serif] text-slate-800">
      <header
        id="section-Basic-Details"
        className={`relative scroll-mt-8 bg-gradient-to-br from-[#f97316] to-[#c2410c] px-10 pb-16 pt-9 text-white ${activeSection === "Basic Details" ? "ring-4 ring-inset ring-white/40" : ""}`}
      >
        <div className="flex items-center gap-6">
          <Avatar
            photo={k.photo}
            initials={k.initials}
            className="h-24 w-24 shrink-0 rounded-full border-4 border-white/60 shadow-lg"
            fallbackClassName="bg-white/20 text-3xl text-white"
          />
          <div className="min-w-0">
            <h1 className="m-0 text-[2.2rem] font-extrabold leading-tight">{k.name}</h1>
            {k.title && <p className="m-0 mt-1 text-[1rem] font-medium text-orange-100">{k.title}</p>}
            <p className="m-0 mt-2 text-[0.78rem] text-orange-50">
              {[...k.contact, ...k.links.slice(0, 2).map((l) => l.title || l.link)].join("  •  ")}
            </p>
          </div>
        </div>
        <svg className="absolute bottom-0 left-0 h-10 w-full" viewBox="0 0 800 40" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,24 C160,48 320,0 480,18 C620,34 720,10 800,20 L800,40 L0,40 Z" fill="#ffffff" />
        </svg>
      </header>

      <div className="space-y-7 px-10 pb-9">
        {stats.length > 0 && (
          <div className="-mt-2 grid gap-3" style={{ gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))` }}>
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl border border-orange-100 bg-orange-50/60 px-4 py-3 text-center">
                <div className="text-[1.6rem] font-extrabold leading-none" style={{ color: ORANGE }}>{s.value}</div>
                <div className="mt-1 text-[0.72rem] font-semibold uppercase tracking-wide text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {k.basic?.professionalSummary && (
          <section>
            <Heading>Summary</Heading>
            <Rich html={k.basic.professionalSummary} className="text-[0.86rem] leading-6 text-slate-700" />
          </section>
        )}

        {k.achievements.length > 0 && (
          <section id="section-Accomplishments" className={`scroll-mt-8 p-3 -m-3 ${k.highlight("Accomplishments")}`}>
            <Heading>Highlights</Heading>
            <div className="grid grid-cols-2 gap-3">
              {k.achievements.map((a, i) => (
                <div key={i} className="rounded-xl border-l-4 bg-orange-50/60 px-4 py-3" style={{ borderColor: ORANGE }}>
                  <p className="m-0 text-[0.86rem] font-bold text-slate-900">{a.title}</p>
                  {a.description && <p className="m-0 mt-0.5 text-[0.78rem] leading-5 text-slate-600">{a.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {k.experience.length > 0 && (
          <section id="section-Experience" className={`scroll-mt-8 p-3 -m-3 ${k.highlight("Experience")}`}>
            <Heading>Experience</Heading>
            <div className="space-y-4">{k.experience.map((e, i) => <Entry key={i} item={e} head={e.role} sub={e.company} />)}</div>
          </section>
        )}
        {k.internships.length > 0 && (
          <section id="section-Internships" className={`scroll-mt-8 p-3 -m-3 ${k.highlight("Internships")}`}>
            <Heading>Internships</Heading>
            <div className="space-y-4">{k.internships.map((e, i) => <Entry key={i} item={e} head={e.role} sub={e.company} />)}</div>
          </section>
        )}
        {k.projects.length > 0 && (
          <section id="section-Projects" className={`scroll-mt-8 p-3 -m-3 ${k.highlight("Projects")}`}>
            <Heading>Projects</Heading>
            <div className="space-y-4">{k.projects.map((p, i) => <Entry key={i} item={p} head={p.project} sub={p.company} />)}</div>
          </section>
        )}

        <div className="grid grid-cols-2 gap-8">
          {k.education.length > 0 && (
            <section id="section-Education" className={`scroll-mt-8 p-3 -m-3 ${k.highlight("Education")}`}>
              <Heading>Education</Heading>
              <div className="space-y-3">{k.education.map((e, i) => <Entry key={i} item={e} head={e.type} sub={e.school || e.board} />)}</div>
            </section>
          )}
          {k.skills.length > 0 && (
            <section id="section-Skills" className={`scroll-mt-8 p-3 -m-3 ${k.highlight("Skills")}`}>
              <Heading>Skills</Heading>
              <div className="flex flex-wrap gap-1.5">
                {k.skills.map((s) => (
                  <span key={s} className="rounded-full bg-orange-100 px-2.5 py-0.5 text-[0.74rem] font-semibold text-orange-800">{s}</span>
                ))}
              </div>
            </section>
          )}
          {k.certificates.length > 0 && (
            <section id="section-Certifications" className={`scroll-mt-8 p-3 -m-3 ${k.highlight("Certifications")}`}>
              <Heading>Certifications</Heading>
              {k.certificates.map((c, i) => (
                <p key={i} className="m-0 mb-1 text-[0.8rem]"><b>{c.name}</b>{c.organization ? ` · ${c.organization}` : ""}</p>
              ))}
            </section>
          )}
          {k.languages.length > 0 && (
            <section id="section-Languages" className={`scroll-mt-8 p-3 -m-3 ${k.highlight("Languages")}`}>
              <Heading>Languages</Heading>
              <p className="m-0 text-[0.82rem]">{k.languages.join(", ")}</p>
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
      </div>
    </Page>
  );
};

export default Template50;
