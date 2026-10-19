"use client";

import React from "react";
import { Avatar, Page, Rich, period, useTemplateKit } from "./templateKit";

/**
 * Template43 — "Gradient Hero"
 * A violet-to-pink gradient hero with photo and contact pills, then a
 * two-column body: experience/projects on the left, a soft-tinted aside
 * with skills, education and languages on the right.
 */

const Heading = ({ children }) => (
  <h2 className="m-0 mb-3 text-[0.95rem] font-extrabold text-[#6d28d9]">
    <span className="bg-gradient-to-r from-[#7c3aed] to-[#db2777] bg-clip-text text-transparent">{children}</span>
  </h2>
);

const Entry = ({ item, head, sub }) => (
  <div className="relative break-inside-avoid border-l-2 border-violet-200 pl-4">
    <span className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-gradient-to-br from-violet-600 to-pink-500" />
    <div className="flex items-baseline justify-between gap-3">
      <h3 className="m-0 text-[0.92rem] font-bold text-slate-900">{head}</h3>
      <span className="shrink-0 rounded-full bg-violet-50 px-2 py-0.5 text-[0.7rem] font-semibold text-violet-700">{period(item)}</span>
    </div>
    {sub && <p className="m-0 text-[0.8rem] font-semibold text-pink-600">{sub}</p>}
    <Rich html={item?.description} className="mt-1 text-[0.82rem] leading-6 text-slate-700" />
  </div>
);

const Template43 = ({ resumeTemplateRef, activeSection, isGeneratingPdf }) => {
  const k = useTemplateKit(activeSection, "bg-violet-50 rounded-lg");

  return (
    <Page resumeTemplateRef={resumeTemplateRef} isGeneratingPdf={isGeneratingPdf} className="bg-white font-['Inter',sans-serif] text-slate-800">
      <header
        id="section-Basic-Details"
        className={`scroll-mt-8 bg-gradient-to-r from-[#6d28d9] via-[#a21caf] to-[#db2777] px-10 py-9 text-white ${activeSection === "Basic Details" ? "ring-4 ring-inset ring-white/40" : ""}`}
      >
        <div className="flex items-center gap-6">
          <Avatar
            photo={k.photo}
            initials={k.initials}
            className="h-24 w-24 shrink-0 rounded-2xl border-4 border-white/40 shadow-lg"
            fallbackClassName="bg-white/20 text-3xl text-white"
          />
          <div className="min-w-0">
            <h1 className="m-0 text-[2.1rem] font-extrabold leading-tight">{k.name}</h1>
            {k.title && <p className="m-0 mt-1 text-[1rem] font-medium text-white/85">{k.title}</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              {[...k.contact, ...k.links.slice(0, 2).map((l) => l.title || l.link)].map((c) => (
                <span key={c} className="rounded-full bg-white/15 px-3 py-0.5 text-[0.74rem] font-medium">{c}</span>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="flex gap-8 px-10 py-8">
        <main className="min-w-0 flex-1 space-y-7">
          {k.basic?.professionalSummary && (
            <section>
              <Heading>About me</Heading>
              <Rich html={k.basic.professionalSummary} className="text-[0.86rem] leading-6 text-slate-700" />
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
          {k.volunteering.length > 0 && (
            <section id="section-Volunteering" className={`scroll-mt-8 p-3 -m-3 ${k.highlight("Volunteering")}`}>
              <Heading>Volunteering</Heading>
              <div className="space-y-4">{k.volunteering.map((v, i) => <Entry key={i} item={v} head={v.volunteering} sub={v.organization} />)}</div>
            </section>
          )}
        </main>

        <aside className="w-[34%] shrink-0 space-y-6 rounded-2xl bg-gradient-to-b from-violet-50 to-pink-50 p-5">
          {k.skills.length > 0 && (
            <section id="section-Skills" className={`scroll-mt-8 p-2 -m-2 ${k.highlight("Skills")}`}>
              <Heading>Skills</Heading>
              <div className="flex flex-wrap gap-1.5">
                {k.skills.map((s) => (
                  <span key={s} className="rounded-md bg-white px-2 py-0.5 text-[0.74rem] font-semibold text-violet-700 shadow-sm">{s}</span>
                ))}
              </div>
            </section>
          )}
          {k.education.length > 0 && (
            <section id="section-Education" className={`scroll-mt-8 p-2 -m-2 ${k.highlight("Education")}`}>
              <Heading>Education</Heading>
              <div className="space-y-3">
                {k.education.map((e, i) => (
                  <div key={i}>
                    <p className="m-0 text-[0.84rem] font-bold text-slate-900">{e.type}</p>
                    <p className="m-0 text-[0.78rem] text-slate-600">{e.school || e.board}</p>
                    <p className="m-0 text-[0.72rem] font-semibold text-pink-600">{period(e)}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
          {k.certificates.length > 0 && (
            <section id="section-Certifications" className={`scroll-mt-8 p-2 -m-2 ${k.highlight("Certifications")}`}>
              <Heading>Certifications</Heading>
              {k.certificates.map((c, i) => (
                <p key={i} className="m-0 mb-1 text-[0.8rem]"><b>{c.name}</b>{c.organization ? <span className="text-slate-500"> · {c.organization}</span> : null}</p>
              ))}
            </section>
          )}
          {k.achievements.length > 0 && (
            <section id="section-Accomplishments" className={`scroll-mt-8 p-2 -m-2 ${k.highlight("Accomplishments")}`}>
              <Heading>Achievements</Heading>
              {k.achievements.map((a, i) => (
                <p key={i} className="m-0 mb-1.5 text-[0.8rem] leading-5"><b>{a.title}</b>{a.description ? ` — ${a.description}` : ""}</p>
              ))}
            </section>
          )}
          {k.languages.length > 0 && (
            <section id="section-Languages" className={`scroll-mt-8 p-2 -m-2 ${k.highlight("Languages")}`}>
              <Heading>Languages</Heading>
              <p className="m-0 text-[0.82rem]">{k.languages.join(" · ")}</p>
            </section>
          )}
        </aside>
      </div>
    </Page>
  );
};

export default Template43;
