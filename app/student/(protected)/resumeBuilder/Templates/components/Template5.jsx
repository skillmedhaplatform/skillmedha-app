"use client";
import React, { useEffect, useRef, useState } from "react";
import { MailOutlined, PhoneFilled } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { parseIfJson } from "@/app/student/(protected)/jobAssessments/reusable_comp/jsonparse";

/**
 * Template1 — "Classic ATS"
 * Single column, no color sidebar, minimal decoration. Built for maximum
 * ATS-parsing safety: plain headings, no tables, no icons-as-content.
 */
const Template1 = ({ downloadImage, setDownloadImage, resumeTemplateRef, activeSection, isGeneratingPdf }) => {
  const resumeRef = useRef(null);
  const [profileBase64, setProfileBase64] = useState(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const basicDetails = useSelector((state) => state.student.student?.data) || {};
  const educationDetails = useSelector((state) => state.student.student?.data?.educationDetails) || [];
  const experienceDetails = useSelector((state) => state.student.student?.data?.experiences) || [];
  const projectDetails = useSelector((state) => state.student.student?.data?.projects) || [];
  const rawSkills = useSelector((state) => state.student.student?.data?.technical) || [];
  const skillss = rawSkills.map(s => typeof s === 'object' && s !== null ? s.name + (s.level ? ` - ${s.level}` : '') : s).filter(Boolean);
  const rawLang = useSelector((state) => state.student.student?.data?.languages) || [];
  const lang = rawLang.map(l => typeof l === 'object' && l !== null ? l.name + (l.level ? ` - ${l.level}` : '') : l).filter(Boolean);
  const linkList = useSelector((state) => state.student.student?.data?.links) || [];
  const volunteeringList = useSelector((state) => state.student.student?.data?.volunteerings) || [];
  const certificatesList = useSelector((state) => state.student.student?.data?.certificates) || [];

  const convertImageToBase64 = (url) => {
    const viaCanvas = () =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth || img.width;
            canvas.height = img.naturalHeight || img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/jpeg", 0.95));
          } catch (error) {
            reject(error);
          }
        };
        img.onerror = () => reject(new Error("Image failed to load"));
        img.src = url + (url.includes("?") ? "&" : "?") + "t=" + new Date().getTime();
      });

    // The source URL is typically a storage bucket without CORS headers, so
    // the direct canvas read above gets tainted and rejects. Fall back to
    // this app's own same-origin proxy route instead of the raw URL —
    // fetching the bytes server-side has no CORS restriction, so it
    // reliably succeeds where the browser-side attempt can't (html2canvas
    // hits this exact same restriction when generating the downloaded PDF).
    const viaProxy = () =>
      fetch(`/api/proxy-image?url=${encodeURIComponent(url)}`)
        .then((response) => {
          if (!response.ok) throw new Error("Proxy fetch failed");
          return response.blob();
        })
        .then(
          (blob) =>
            new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            })
        );

    return viaCanvas().catch(() => viaProxy());
  };

  useEffect(() => {
    if (basicDetails?.profile) {
      setIsImageLoaded(false);
      convertImageToBase64(basicDetails.profile)
        .then((base64) => {
          setProfileBase64(base64 || null);
          setIsImageLoaded(true);
        })
        .catch(() => {
          setProfileBase64(null);
          setIsImageLoaded(true);
        });
    }
  }, [basicDetails?.profile]);

  const filterQuotes = (text) => {
    try {
      if (text[0] == '"') return text?.slice(1, -1);
      return text;
    } catch (error) {
      return text;
    }
  };

  const asHtml = (val) => {
    if (!val) return "";
    return typeof val === "string" ? filterQuotes(val) : filterQuotes(String(val));
  };

  const handleDownloadPdf = async () => {
    if (!resumeRef.current) return;
    try {
      if (!isImageLoaded) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      const html2pdf = (await import("html2pdf.js")).default;
      const opt = {
        margin: 0,
        filename: "resume.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, allowTaint: true, logging: false, backgroundColor: "#ffffff" },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      };
      const pdfBlob = await html2pdf().set(opt).from(resumeRef.current).output("blob");
      const downloadUrl = URL.createObjectURL(pdfBlob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = "resume.pdf";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setDownloadImage(false);
    }
  };

  useEffect(() => {
    if (downloadImage && isImageLoaded) {
      handleDownloadPdf();
    }
  }, [downloadImage, isImageLoaded]);

  const sectionCls = (name) =>
    `transition-all duration-300 rounded-lg p-3 -m-3 mb-2 scroll-mt-8 ${
      activeSection === name ? "border-2 border-[#1E293B] bg-[#f8fafc] shadow-sm" : "border-2 border-transparent"
    }`;

  return (
    <div
      className={`${(downloadImage || isGeneratingPdf) ? "w-[794px] max-w-[794px] min-h-[1123px]" : "w-full max-w-full"} h-auto mx-auto overflow-visible p-12 bg-white shadow-xl font-['Georgia',serif] text-[#1e293b] [&_section]:mb-5 [&_section_h2]:text-[1rem] [&_section_h2]:font-bold [&_section_h2]:tracking-[0.15em] [&_section_h2]:uppercase [&_section_h2]:border-b [&_section_h2]:border-solid [&_section_h2]:border-[#1e293b] [&_section_h2]:pb-1.5 [&_section_h2]:mb-3 [&_section_h2]:text-[#1e293b] [&_section_p]:text-[0.92rem] [&_section_p]:leading-relaxed [&::-webkit-scrollbar]:w-[1px] [&::-webkit-scrollbar-track]:bg-white [&::-webkit-scrollbar-thumb]:bg-white`}
      ref={downloadImage ? resumeRef : resumeTemplateRef}
    >
      <div id="section-Basic-Details" className={sectionCls("Basic Details")}>
        <header className="text-center mb-6 border-b-2 border-[#1e293b] pb-5">
          <h1 className="text-[2.2rem] font-bold tracking-tight text-[#1e293b] m-0">
            {basicDetails?.firstName} {basicDetails?.middleName} {basicDetails?.lastName}
          </h1>
          <div className="flex justify-center flex-wrap gap-x-5 gap-y-1 mt-3 text-[0.9rem] text-[#475569]">
            <a href={`mailto:${basicDetails?.email || ""}`} className="flex items-center gap-1.5 no-underline text-[#475569]">
              <MailOutlined /> <span>{basicDetails?.email}</span>
            </a>
            <a href={`tel:${basicDetails?.phone || ""}`} className="flex items-center gap-1.5 no-underline text-[#475569]">
              <PhoneFilled /> <span>{basicDetails?.phone}</span>
            </a>
            {linkList?.map((link, i) => (
              link?.link ? (
                <a
                  key={i}
                  href={link.link.startsWith("http") ? link.link : `https://${link.link}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#475569] no-underline"
                >
                  {link?.title || link.link}
                </a>
              ) : null
            ))}
          </div>
        </header>

        <section className="!mb-0">
          <h2>Summary</h2>
          <div className="text-[0.92rem] leading-relaxed">
            <div dangerouslySetInnerHTML={{ __html: filterQuotes(basicDetails?.professionalSummary) }} />
          </div>
        </section>
      </div>

      {experienceDetails?.filter((e) => e?.type?.toLowerCase() == "work")?.filter((e) => e?.company)?.length > 0 && (
        <section id="section-Experience" className={sectionCls("Experience")}>
          <h2>Experience</h2>
          {experienceDetails?.filter((e) => e?.type == "work").map((job, i) => (
            <div className="mb-3" key={i}>
              <div className="flex items-center mb-1">
                <span className="font-bold text-[0.98rem]">{job?.role}, {job?.company}</span>
                <span className="text-[0.85rem] italic text-[#475569] whitespace-nowrap ml-4">
                  {job?.start || job?.startDate} – {job?.end || job?.endDate}
                </span>
              </div>
              <p className="text-[0.92rem] leading-relaxed m-0">{job?.description}</p>
            </div>
          ))}
        </section>
      )}

      {experienceDetails?.filter((e) => e?.type?.toLowerCase() !== "work")?.filter((e) => e?.company)?.length > 0 && (
        <section id="section-Internships" className={sectionCls("Internships")}>
          <h2>Internships</h2>
          {experienceDetails?.filter((e) => e?.type !== "work").map((job, i) => (
            <div className="mb-3" key={i}>
              <div className="flex items-center mb-1">
                <span className="font-bold text-[0.98rem]">{job?.role}, {job?.company}</span>
                <span className="text-[0.85rem] italic text-[#475569] whitespace-nowrap ml-4">
                  {job?.start || job?.startDate} – {job?.end || job?.endDate}
                </span>
              </div>
              <p className="text-[0.92rem] leading-relaxed m-0">{job?.description}</p>
            </div>
          ))}
        </section>
      )}

      {educationDetails?.length > 0 && (
        <section id="section-Education" className={sectionCls("Education")}>
          <h2>Education</h2>
          {educationDetails?.map((edu, i) => (
            <div className="mb-3" key={i}>
              <div className="flex items-center mb-1">
                <span className="font-bold text-[0.98rem]">
                  {edu?.type} - {edu?.school} | {edu?.grade}{edu?.gradeType ? (edu?.gradeType == "percentage" ? "%" : "/10") : null}
                </span>
                <span className="text-[0.85rem] italic text-[#475569] whitespace-nowrap ml-4">
                  {edu?.startDate} – {edu?.endDate}
                </span>
              </div>
              <p className="text-[0.92rem] leading-relaxed m-0">{edu?.description}</p>
            </div>
          ))}
        </section>
      )}

      {projectDetails?.filter((e) => e?.project)?.length > 0 && (
        <section id="section-Projects" className={sectionCls("Projects")}>
          <h2>Projects</h2>
          {projectDetails?.map((proj, i) => (
            <div className="mb-3" key={i}>
              <div className="flex items-center mb-1">
                <span className="font-bold text-[0.98rem]">
                  {proj?.project} {proj?.company ? `(${proj.company})` : ""}
                </span>
                <span className="text-[0.85rem] italic text-[#475569] whitespace-nowrap ml-4">
                  {proj?.startDate} – {proj?.endDate}
                </span>
              </div>
              <div className="text-[0.92rem] leading-relaxed" dangerouslySetInnerHTML={{ __html: parseIfJson(proj?.description) }} />
            </div>
          ))}
        </section>
      )}

      {certificatesList?.some((c) => c?.name || c?.organization) && (
        <section id="section-Certifications" className={sectionCls("Certifications")}>
          <h2>Certificates</h2>
          {certificatesList.map((cert, i) => (
            <div className="mb-2.5" key={i}>
              <div className="flex items-center">
                <span className="font-bold text-[0.95rem]">{cert?.name}{cert?.organization ? `, ${cert.organization}` : ""}</span>
                <span className="text-[0.85rem] italic text-[#475569] whitespace-nowrap ml-4">
                  {cert?.issueDate}{cert?.expiryDate ? ` – ${cert.expiryDate}` : ""}
                </span>
              </div>
              {(cert?.credentialId || cert?.credentialUrl) && (
                <p className="text-[0.85rem] m-0">
                  {cert?.credentialId && `ID: ${cert.credentialId} `}
                  {cert?.credentialUrl && (
                    <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer">{cert.credentialUrl}</a>
                  )}
                </p>
              )}
            </div>
          ))}
        </section>
      )}

      {volunteeringList?.some((v) => v?.organization || v?.volunteering) && (
        <section id="section-Volunteering" className={sectionCls("Volunteering")}>
          <h2>Volunteering</h2>
          {volunteeringList.map((v, i) => (
            <div className="mb-3" key={i}>
              <div className="flex items-center mb-1">
                <span className="font-bold text-[0.95rem]">{v?.volunteering}{v?.organization ? `, ${v.organization}` : ""}</span>
                <span className="text-[0.85rem] italic text-[#475569] whitespace-nowrap ml-4">{v?.start} – {v?.end}</span>
              </div>
              <div className="text-[0.92rem] leading-relaxed" dangerouslySetInnerHTML={{ __html: asHtml(v?.description) }} />
            </div>
          ))}
        </section>
      )}

      {skillss?.length > 0 && (
        <section id="section-Skills" className={sectionCls("Skills")}>
          <h2>Skills</h2>
          <p className="text-[0.92rem]">{skillss.join("  •  ")}</p>
        </section>
      )}

      {lang?.length > 0 && (
        <section id="section-Languages" className={sectionCls("Languages")}>
          <h2>Languages</h2>
          <p className="text-[0.92rem]">{lang.join(", ")}</p>
        </section>
      )}
    </div>
  );
};

export default Template1;