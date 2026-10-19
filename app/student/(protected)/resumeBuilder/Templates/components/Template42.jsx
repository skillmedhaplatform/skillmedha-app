"use client";

import React from "react";
import { Page, Rich, period, useTemplateKit } from "./templateKit";

/**
 * Template42 — "Harvard Classic"
 * The career-office format: centred serif name, one contact line, ruled
 * uppercase headings, education first, organisation/dates on one line and
 * the role in italics below. Black and white, no graphics — ATS-safe.
 */

const Heading = ({ children }) => (
  <h2 className="m-0 mb-2 border-b border-black pb-0.5 text-[0.86rem] font-bold uppercase tracking-[0.08em]">{children}</h2>
);

const Entry = ({ item, org, role, place }) => (
  <div className="break-inside-avoid">
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-[0.9rem] font-bold">{org}</span>
      <span className="shrink-0 text-[0.82rem]">{place}</span>
    </div>
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-[0.86rem] italic">{role}</span>
      <span className="shrink-0 text-[0.82rem] italic">{period(item)}</span>
    </div>
    <Rich html={item?.description} className="mt-0.5 text-[0.84rem] leading-[1.45]" />
  </div>
);

const Template42 = ({ resumeTemplateRef, activeSection, isGeneratingPdf }) => {
  const k = useTemplateKit(activeSection, "bg-neutral-100 rounded");
  const contactLine = [...k.contact, ...k.links.slice(0, 2).map((l) => l.title || l.link)];

  return (
    <Page resumeTemplateRef={resumeTemplateRef} isGeneratingPdf={isGeneratingPdf} className="bg-white font-['Times_New_Roman','Georgia',serif] text-black">
      <div className="mx-auto max-w-3xl space-y-4 px-12 py-10">
        <header id="section-Basic-Details" className={`scroll-mt-8 p-2 -m-2 text-center ${k.highlight("Basic Details")}`}>
          <h1 className="m-0 text-[1.9rem] font-bold uppercase tracking-[0.06em]">{k.name}</h1>
          <p className="m-0 mt-1 text-[0.84rem]">{contactLine.join("  |  ")}</p>
        </header>

        {k.basic?.professionalSummary && (
          <section>
            <Heading>Summary</Heading>
            <Rich html={k.basic.professionalSummary} className="text-[0.86rem] leading-[1.5]" />
          </section>
        )}

        {k.education.length > 0 && (
          <section id="section-Education" className={`scroll-mt-8 p-2 -m-2 ${k.highlight("Education")}`}>
            <Heading>Education</Heading>
            <div className="space-y-2">
              {k.education.map((e, i) => (
                <Entry key={i} item={e} org={e.school || e.board} role={e.type} place={e.city || ""} />
              ))}
            </div>
          </section>
        )}

        {k.experience.length > 0 && (
          <section id="section-Experience" className={`scroll-mt-8 p-2 -m-2 ${k.highlight("Experience")}`}>
            <Heading>Experience</Heading>
            <div className="space-y-3">
              {k.experience.map((e, i) => <Entry key={i} item={e} org={e.company} role={e.role} place={e.location || ""} />)}
            </div>
          </section>
        )}

        {k.internships.length > 0 && (
          <section id="section-Internships" className={`scroll-mt-8 p-2 -m-2 ${k.highlight("Internships")}`}>
            <Heading>Internships</Heading>
            <div className="space-y-3">
              {k.internships.map((e, i) => <Entry key={i} item={e} org={e.company} role={e.role} place={e.location || ""} />)}
            </div>
          </section>
        )}

        {k.projects.length > 0 && (
          <section id="section-Projects" className={`scroll-mt-8 p-2 -m-2 ${k.highlight("Projects")}`}>
            <Heading>Projects</Heading>
            <div className="space-y-3">
              {k.projects.map((p, i) => <Entry key={i} item={p} org={p.project} role={p.company} place="" />)}
            </div>
          </section>
        )}

        {(k.skills.length > 0 || k.languages.length > 0 || k.certificates.length > 0) && (
          <section id="section-Skills" className={`scroll-mt-8 p-2 -m-2 ${k.highlight("Skills")}`}>
            <Heading>Skills &amp; Additional</Heading>
            <div className="space-y-0.5 text-[0.86rem] leading-[1.5]">
              {k.skills.length > 0 && <p className="m-0"><b>Skills:</b> {k.skills.join(", ")}</p>}
              {k.languages.length > 0 && (
                <p id="section-Languages" className="m-0 scroll-mt-8"><b>Languages:</b> {k.languages.join(", ")}</p>
              )}
              {k.certificates.length > 0 && (
                <p id="section-Certifications" className="m-0 scroll-mt-8">
                  <b>Certifications:</b>{" "}
                  {k.certificates.map((c) => `${c.name}${c.organization ? ` (${c.organization})` : ""}`).join("; ")}
                </p>
              )}
            </div>
          </section>
        )}

        {k.achievements.length > 0 && (
          <section id="section-Accomplishments" className={`scroll-mt-8 p-2 -m-2 ${k.highlight("Accomplishments")}`}>
            <Heading>Honours &amp; Achievements</Heading>
            <ul className="m-0 text-[0.86rem] leading-[1.5]">
              {k.achievements.map((a, i) => (
                <li key={i}><b>{a.title}</b>{a.description ? ` — ${a.description}` : ""}</li>
              ))}
            </ul>
          </section>
        )}

        {k.volunteering.length > 0 && (
          <section id="section-Volunteering" className={`scroll-mt-8 p-2 -m-2 ${k.highlight("Volunteering")}`}>
            <Heading>Leadership &amp; Volunteering</Heading>
            <div className="space-y-3">
              {k.volunteering.map((v, i) => <Entry key={i} item={v} org={v.organization} role={v.volunteering} place="" />)}
            </div>
          </section>
        )}
      </div>
    </Page>
  );
};

export default Template42;
