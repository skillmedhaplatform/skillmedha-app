"use client";

import React from "react";
import { Page, Rich, period, useTemplateKit } from "./templateKit";

/**
 * Template45 — "Tech Terminal"
 * A developer resume styled like a code editor: a dark terminal header with
 * a prompt line, "// section" comments as headings, skills as tags, and
 * monospace accents in emerald.
 */
const MONO = "font-['JetBrains_Mono','Fira_Code','Consolas',monospace]";

const Heading = ({ children }) => (
  <h2 className={`m-0 mb-3 text-[0.85rem] font-bold text-emerald-700 ${MONO}`}>
    <span className="text-slate-400">{"// "}</span>
    {children}
  </h2>
);

const Entry = ({ item, head, sub }) => (
  <div className="break-inside-avoid rounded-lg border border-slate-200 bg-white p-3">
    <div className="flex items-baseline justify-between gap-3">
      <h3 className="m-0 text-[0.92rem] font-bold text-slate-900">
        {head}
        {sub && <span className="font-medium text-emerald-700"> @ {sub}</span>}
      </h3>
      <span className={`shrink-0 text-[0.72rem] text-slate-500 ${MONO}`}>{period(item)}</span>
    </div>
    <Rich html={item?.description} className="mt-1 text-[0.82rem] leading-6 text-slate-700" />
  </div>
);

const Template45 = ({ resumeTemplateRef, activeSection, isGeneratingPdf }) => {
  const k = useTemplateKit(activeSection, "bg-emerald-50 rounded-lg");
  const handle = (k.basic?.firstName || "dev").toLowerCase();

  return (
    <Page resumeTemplateRef={resumeTemplateRef} isGeneratingPdf={isGeneratingPdf} className="bg-slate-50 font-['Inter',sans-serif] text-slate-800">
      <header
        id="section-Basic-Details"
        className={`scroll-mt-8 bg-[#0f172a] px-10 pb-7 pt-5 text-slate-100 ${activeSection === "Basic Details" ? "ring-4 ring-inset ring-emerald-400/40" : ""}`}
      >
        <div className="mb-5 flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <p className={`m-0 text-[0.8rem] text-emerald-400 ${MONO}`}>~/{handle} $ whoami</p>
        <h1 className="m-0 mt-1 text-[2.1rem] font-extrabold leading-tight text-white">{k.name}</h1>
        {k.title && <p className={`m-0 mt-1 text-[0.95rem] text-sky-300 ${MONO}`}>{k.title}</p>}
        <div className={`mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[0.75rem] text-slate-400 ${MONO}`}>
          {k.contact.map((c) => <span key={c}>{c}</span>)}
          {k.links.slice(0, 3).map((l) => <span key={l.link} className="text-emerald-400">{l.title || l.link}</span>)}
        </div>
      </header>

      <div className="space-y-7 px-10 py-8">
        {k.basic?.professionalSummary && (
          <section>
            <Heading>about</Heading>
            <Rich html={k.basic.professionalSummary} className="text-[0.86rem] leading-6 text-slate-700" />
          </section>
        )}

        {k.skills.length > 0 && (
          <section id="section-Skills" className={`scroll-mt-8 p-3 -m-3 ${k.highlight("Skills")}`}>
            <Heading>tech_stack</Heading>
            <div className="flex flex-wrap gap-2">
              {k.skills.map((s) => (
                <span key={s} className={`rounded-md bg-[#0f172a] px-2.5 py-1 text-[0.72rem] text-emerald-300 ${MONO}`}>
                  {"<"}{s}{" />"}
                </span>
              ))}
            </div>
          </section>
        )}

        {k.experience.length > 0 && (
          <section id="section-Experience" className={`scroll-mt-8 p-3 -m-3 ${k.highlight("Experience")}`}>
            <Heading>experience</Heading>
            <div className="space-y-3">{k.experience.map((e, i) => <Entry key={i} item={e} head={e.role} sub={e.company} />)}</div>
          </section>
        )}
        {k.internships.length > 0 && (
          <section id="section-Internships" className={`scroll-mt-8 p-3 -m-3 ${k.highlight("Internships")}`}>
            <Heading>internships</Heading>
            <div className="space-y-3">{k.internships.map((e, i) => <Entry key={i} item={e} head={e.role} sub={e.company} />)}</div>
          </section>
        )}
        {k.projects.length > 0 && (
          <section id="section-Projects" className={`scroll-mt-8 p-3 -m-3 ${k.highlight("Projects")}`}>
            <Heading>projects</Heading>
            <div className="grid grid-cols-2 gap-3">{k.projects.map((p, i) => <Entry key={i} item={p} head={p.project} sub={p.company} />)}</div>
          </section>
        )}

        <div className="grid grid-cols-2 gap-7">
          {k.education.length > 0 && (
            <section id="section-Education" className={`scroll-mt-8 p-3 -m-3 ${k.highlight("Education")}`}>
              <Heading>education</Heading>
              {k.education.map((e, i) => (
                <div key={i} className="mb-2">
                  <p className="m-0 text-[0.86rem] font-bold">{e.type}</p>
                  <p className="m-0 text-[0.78rem] text-slate-600">{e.school || e.board}</p>
                  <p className={`m-0 text-[0.7rem] text-slate-500 ${MONO}`}>{period(e)}</p>
                </div>
              ))}
            </section>
          )}
          <div className="space-y-6">
            {k.certificates.length > 0 && (
              <section id="section-Certifications" className={`scroll-mt-8 p-3 -m-3 ${k.highlight("Certifications")}`}>
                <Heading>certifications</Heading>
                {k.certificates.map((c, i) => (
                  <p key={i} className="m-0 mb-1 text-[0.8rem]">✓ <b>{c.name}</b>{c.organization ? ` · ${c.organization}` : ""}</p>
                ))}
              </section>
            )}
            {k.languages.length > 0 && (
              <section id="section-Languages" className={`scroll-mt-8 p-3 -m-3 ${k.highlight("Languages")}`}>
                <Heading>languages</Heading>
                <p className="m-0 text-[0.82rem]">{k.languages.join(", ")}</p>
              </section>
            )}
          </div>
        </div>

        {k.achievements.length > 0 && (
          <section id="section-Accomplishments" className={`scroll-mt-8 p-3 -m-3 ${k.highlight("Accomplishments")}`}>
            <Heading>achievements</Heading>
            <ul className="m-0 text-[0.82rem] leading-6">
              {k.achievements.map((a, i) => <li key={i}><b>{a.title}</b>{a.description ? ` — ${a.description}` : ""}</li>)}
            </ul>
          </section>
        )}
        {k.volunteering.length > 0 && (
          <section id="section-Volunteering" className={`scroll-mt-8 p-3 -m-3 ${k.highlight("Volunteering")}`}>
            <Heading>open_source_and_community</Heading>
            <div className="space-y-3">{k.volunteering.map((v, i) => <Entry key={i} item={v} head={v.volunteering} sub={v.organization} />)}</div>
          </section>
        )}
      </div>
    </Page>
  );
};

export default Template45;
