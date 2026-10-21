"use client";

import React from "react";
import { Avatar, Page, Rich, period, useTemplateKit } from "./templateKit";

/**
 * Template41 — "Metro Split"
 * A pale teal sidebar (photo, contact, skills as chips, languages, links)
 * beside a roomy white main column with teal section rules.
 */
const ACCENT = "#0f766e";

const Heading = ({ children }) => (
  <h2 className="m-0 mb-3 flex items-center gap-3 text-[0.8rem] font-bold uppercase tracking-[0.18em]" style={{ color: ACCENT }}>
    {children}
    <span className="h-px flex-1 bg-teal-200" />
  </h2>
);

const SideHeading = ({ children }) => (
  <h3 className="m-0 mb-2 text-[0.72rem] font-bold uppercase tracking-[0.2em] text-teal-800">{children}</h3>
);

const Entry = ({ item, head, sub }) => (
  <div className="break-inside-avoid">
    <div className="flex items-baseline justify-between gap-3">
      <h3 className="m-0 text-[0.92rem] font-bold text-slate-900">{head}</h3>
      <span className="shrink-0 text-[0.75rem] font-medium text-slate-500">{period(item)}</span>
    </div>
    {sub && <p className="m-0 text-[0.82rem] font-medium" style={{ color: ACCENT }}>{sub}</p>}
    <Rich html={item?.description} className="mt-1 text-[0.82rem] leading-6 text-slate-700" />
  </div>
);

const Template41 = ({ resumeTemplateRef, activeSection, isGeneratingPdf }) => {
  const k = useTemplateKit(activeSection, "bg-teal-50 rounded-md");

  return (
    <Page resumeTemplateRef={resumeTemplateRef} isGeneratingPdf={isGeneratingPdf} className="bg-white font-['Inter',sans-serif] text-slate-800">
      <div className="flex min-h-[1100px]">
        <aside className="w-[32%] shrink-0 space-y-6 bg-[#ecfdf9] px-6 py-8">
          <div id="section-Basic-Details" className={`scroll-mt-8 p-2 -m-2 text-center ${k.highlight("Basic Details")}`}>
            <Avatar
              photo={k.photo}
              initials={k.initials}
              className="mx-auto h-28 w-28 rounded-full border-4 border-white shadow-md"
              fallbackClassName="bg-teal-700 text-3xl text-white"
            />
            <h1 className="m-0 mt-4 text-[1.5rem] font-extrabold leading-tight text-slate-900">{k.name}</h1>
            {k.title && <p className="m-0 mt-1 text-[0.85rem] font-semibold" style={{ color: ACCENT }}>{k.title}</p>}
          </div>

          {k.contact.length > 0 && (
            <div>
              <SideHeading>Contact</SideHeading>
              {k.contact.map((c) => (
                <p key={c} className="m-0 break-all text-[0.78rem] leading-6 text-slate-700">{c}</p>
              ))}
            </div>
          )}

          {k.skills.length > 0 && (
            <div id="section-Skills" className={`scroll-mt-8 p-2 -m-2 ${k.highlight("Skills")}`}>
              <SideHeading>Skills</SideHeading>
              <div className="flex flex-wrap gap-1.5">
                {k.skills.map((s) => (
                  <span key={s} className="rounded-full bg-white px-2.5 py-0.5 text-[0.72rem] font-medium text-teal-800 ring-1 ring-teal-200">{s}</span>
                ))}
              </div>
            </div>
          )}

          {k.languages.length > 0 && (
            <div id="section-Languages" className={`scroll-mt-8 p-2 -m-2 ${k.highlight("Languages")}`}>
              <SideHeading>Languages</SideHeading>
              {k.languages.map((l) => (
                <p key={l} className="m-0 text-[0.8rem] leading-6">{l}</p>
              ))}
            </div>
          )}

          {k.links.length > 0 && (
            <div id="section-Links" className={`scroll-mt-8 p-2 -m-2 ${k.highlight("Links")}`}>
              <SideHeading>Links</SideHeading>
              {k.links.map((l) => (
                <p key={l.link} className="m-0 break-all text-[0.78rem] leading-6 text-teal-800">{l.title || l.link}</p>
              ))}
            </div>
          )}
        </aside>

        <main className="flex-1 space-y-6 px-8 py-8">
          {k.basic?.professionalSummary && (
            <section>
              <Heading>Profile</Heading>
              <Rich html={k.basic.professionalSummary} className="text-[0.85rem] leading-6 text-slate-700" />
            </section>
          )}

          {k.experience.length > 0 && (
            <section id="section-Experience" className={`scroll-mt-8 p-3 -m-3 ${k.highlight("Experience")}`}>
              <Heading>Experience</Heading>
              <div className="space-y-4">
                {k.experience.map((e, i) => <Entry key={i} item={e} head={e.role} sub={e.company} />)}
              </div>
            </section>
          )}

          {k.internships.length > 0 && (
            <section id="section-Internships" className={`scroll-mt-8 p-3 -m-3 ${k.highlight("Internships")}`}>
              <Heading>Internships</Heading>
              <div className="space-y-4">
                {k.internships.map((e, i) => <Entry key={i} item={e} head={e.role} sub={e.company} />)}
              </div>
            </section>
          )}

          {k.projects.length > 0 && (
            <section id="section-Projects" className={`scroll-mt-8 p-3 -m-3 ${k.highlight("Projects")}`}>
              <Heading>Projects</Heading>
              <div className="space-y-4">
                {k.projects.map((p, i) => <Entry key={i} item={p} head={p.project} sub={p.company} />)}
              </div>
            </section>
          )}

          {k.education.length > 0 && (
            <section id="section-Education" className={`scroll-mt-8 p-3 -m-3 ${k.highlight("Education")}`}>
              <Heading>Education</Heading>
              <div className="space-y-3">
                {k.education.map((e, i) => <Entry key={i} item={e} head={e.type} sub={e.school || e.board} />)}
              </div>
            </section>
          )}

          {k.certificates.length > 0 && (
            <section id="section-Certifications" className={`scroll-mt-8 p-3 -m-3 ${k.highlight("Certifications")}`}>
              <Heading>Certifications</Heading>
              <ul className="m-0 text-[0.82rem] leading-6">
                {k.certificates.map((c, i) => (
                  <li key={i}><span className="font-semibold">{c.name}</span>{c.organization ? ` — ${c.organization}` : ""}</li>
                ))}
              </ul>
            </section>
          )}

          {k.achievements.length > 0 && (
            <section id="section-Accomplishments" className={`scroll-mt-8 p-3 -m-3 ${k.highlight("Accomplishments")}`}>
              <Heading>Achievements</Heading>
              <ul className="m-0 text-[0.82rem] leading-6">
                {k.achievements.map((a, i) => (
                  <li key={i}><span className="font-semibold">{a.title}</span>{a.description ? ` — ${a.description}` : ""}</li>
                ))}
              </ul>
            </section>
          )}

          {k.volunteering.length > 0 && (
            <section id="section-Volunteering" className={`scroll-mt-8 p-3 -m-3 ${k.highlight("Volunteering")}`}>
              <Heading>Volunteering</Heading>
              <div className="space-y-3">
                {k.volunteering.map((v, i) => <Entry key={i} item={v} head={v.volunteering} sub={v.organization} />)}
              </div>
            </section>
          )}
        </main>
      </div>
    </Page>
  );
};

export default Template41;
