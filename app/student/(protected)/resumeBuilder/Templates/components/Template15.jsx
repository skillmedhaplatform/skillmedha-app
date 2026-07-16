"use client";
import React, { useEffect, useRef, useState } from "react";
import { MailOutlined, PhoneFilled } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { parseIfJson } from "@/app/student/(protected)/jobAssessments/reusable_comp/jsonparse";

/**
 * Template3 — "Executive Sidebar"
 * Dark navy left rail (photo, contact, skills, languages, links),
 * main content on the right (summary, experience, education, projects...).
 */
const Template3 = ({ downloadImage, setDownloadImage, resumeTemplateRef, activeSection, isGeneratingPdf }) => {
  const resumeRef = useRef(null);
  const [profileBase64, setProfileBase64] = useState(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const basicDetails = useSelector((state) => state.student.student?.data) || {};
  const educationDetails = useSelector((state) => state.student.student?.data?.educationDetails) || [];
  const experienceDetails = useSelector((state) => state.student.student?.data?.experiences) || [];
  const projectDetails = useSelector((state) => state.student.student?.data?.projects) || [];
  const skillss = useSelector((state) => state.student.student?.data?.technical) || [];
  const lang = useSelector((state) => state.student.student?.data?.languages) || [];
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
      activeSection === name ? "border-2 border-[#0d9488] bg-[#f0fdfa] shadow-sm" : "border-2 border-transparent"
    }`;

  const sideSectionCls = (name) =>
    `transition-all duration-300 rounded-lg p-2 -m-2 mb-2 scroll-mt-8 ${
      activeSection === name ? "border-2 border-[#2dd4bf] bg-[rgba(255,255,255,0.1)] shadow-sm" : "border-2 border-transparent"
    }`;

  return (
    <div
      className={`${(downloadImage || isGeneratingPdf) ? "w-[794px] max-w-[794px] min-h-[1123px]" : "w-full max-w-full"} h-auto mx-auto overflow-visible bg-white shadow-xl font-['Inter',sans-serif] text-[#334155] grid grid-cols-[16rem_1fr] [&::-webkit-scrollbar]:w-[1px] [&::-webkit-scrollbar-track]:bg-white [&::-webkit-scrollbar-thumb]:bg-white`}
      ref={downloadImage ? resumeRef : resumeTemplateRef}
    >
      {/* Sidebar */}
      <div className="bg-[#0b1526] text-white p-6 flex flex-col gap-6">
        <div id="section-Basic-Details" className={sideSectionCls("Basic Details")}>
          <div className="flex justify-center mb-4">
            {profileBase64 && (
              <img
                width="120"
                height="120"
                src={profileBase64}
                alt="profile"
                className="rounded-full object-cover border-4 border-[#2dd4bf]"
              />
            )}
          </div>
          <h1 className="text-[1.3rem] font-bold text-center text-white m-0 leading-tight">
            {basicDetails?.firstName} {basicDetails?.middleName} {basicDetails?.lastName}
          </h1>

          <div className="flex flex-col gap-2 mt-4 text-[0.82rem] [&_a]:text-[#cbd5e1] [&_a]:no-underline [&_a]:flex [&_a]:items-start [&_a]:gap-2 [&_a]:break-all">
            <a href={`mailto:${basicDetails?.email || ""}`}>
              <MailOutlined className="mt-0.5 text-[#2dd4bf]" /> <span>{basicDetails?.email}</span>
            </a>
            <a href={`tel:${basicDetails?.phone || ""}`}>
              <PhoneFilled className="mt-0.5 text-[#2dd4bf]" /> <span>{basicDetails?.phone}</span>
            </a>
          </div>
        </div>

        {linkList?.length > 0 && (
          <div className={sideSectionCls("Links")}>
            <h2 className="text-[0.78rem] font-bold tracking-[0.15em] uppercase text-[#2dd4bf] mb-2 border-b border-[rgba(255,255,255,0.15)] pb-1.5">Links</h2>
            <div className="flex flex-col gap-1.5">
              {linkList.map((link, i) => (
                <a
                  key={i}
                  href={link?.link ? (link.link.startsWith("http") ? link.link : `https://${link.link}`) : "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[0.82rem] text-[#cbd5e1] no-underline break-all"
                >
                  {link?.title || link?.link}
                </a>
              ))}
            </div>
          </div>
        )}

        {skillss?.length > 0 && (
          <div id="section-Skills" className={sideSectionCls("Skills")}>
            <h2 className="text-[0.78rem] font-bold tracking-[0.15em] uppercase text-[#2dd4bf] mb-2 border-b border-[rgba(255,255,255,0.15)] pb-1.5">Skills</h2>
            <ul className="flex flex-col gap-1.5">
              {skillss.map((skill, i) => (
                <li key={i} className="text-[0.85rem] text-[#e2e8f0] list-none">{skill}</li>
              ))}
            </ul>
          </div>
        )}

        {lang?.length > 0 && (
          <div id="section-Languages" className={sideSectionCls("Languages")}>
            <h2 className="text-[0.78rem] font-bold tracking-[0.15em] uppercase text-[#2dd4bf] mb-2 border-b border-[rgba(255,255,255,0.15)] pb-1.5">Languages</h2>
            <p className="text-[0.85rem] text-[#e2e8f0] m-0">{lang.join(", ")}</p>
          </div>
        )}

        {certificatesList?.some((c) => c?.name || c?.organization) && (
          <div id="section-Certifications" className={sideSectionCls("Certifications")}>
            <h2 className="text-[0.78rem] font-bold tracking-[0.15em] uppercase text-[#2dd4bf] mb-2 border-b border-[rgba(255,255,255,0.15)] pb-1.5">Certificates</h2>
            <div className="flex flex-col gap-2">
              {certificatesList.map((cert, i) => (
                <div key={i}>
                  <p className="text-[0.82rem] font-semibold text-white m-0">{cert?.name}</p>
                  <p className="text-[0.78rem] text-[#94a3b8] m-0">{cert?.organization}{cert?.issueDate ? ` · ${cert.issueDate}` : ""}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="p-8 [&_section]:mb-5 [&_section_h2]:text-[1rem] [&_section_h2]:font-bold [&_section_h2]:tracking-wide [&_section_h2]:uppercase [&_section_h2]:border-b-2 [&_section_h2]:border-solid [&_section_h2]:border-[#0d9488] [&_section_h2]:pb-2 [&_section_h2]:mb-3 [&_section_h2]:text-[#0b1526] [&_section_p]:text-[0.92rem] [&_section_p]:leading-relaxed">
        <section id="section-Summary" className="!mb-5">
          <h2>Summary</h2>
          <div className="text-[0.92rem] leading-relaxed">
            <div dangerouslySetInnerHTML={{ __html: filterQuotes(basicDetails?.professionalSummary) }} />
          </div>
        </section>

        {experienceDetails?.filter((e) => e?.type?.toLowerCase() == "work")?.filter((e) => e?.company)?.length > 0 && (
          <section id="section-Experience" className={sectionCls("Experience")}>
            <h2>Experience</h2>
            {experienceDetails?.filter((e) => e?.type == "work").map((job, i) => (
              <div className="mb-3" key={i}>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-bold text-[0.95rem]">{job?.role}, {job?.company}</span>
                  <span className="text-[0.82rem] italic text-[#64748b] whitespace-nowrap ml-4">
                    {job?.start || job?.startDate} – {job?.end || job?.endDate}
                  </span>
                </div>
                <p className="text-[0.9rem] leading-relaxed m-0">{job?.description}</p>
              </div>
            ))}
          </section>
        )}

        {experienceDetails?.filter((e) => e?.type?.toLowerCase() !== "work")?.filter((e) => e?.company)?.length > 0 && (
          <section id="section-Internships" className={sectionCls("Internships")}>
            <h2>Internships</h2>
            {experienceDetails?.filter((e) => e?.type !== "work").map((job, i) => (
              <div className="mb-3" key={i}>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-bold text-[0.95rem]">{job?.role}, {job?.company}</span>
                  <span className="text-[0.82rem] italic text-[#64748b] whitespace-nowrap ml-4">
                    {job?.start || job?.startDate} – {job?.end || job?.endDate}
                  </span>
                </div>
                <p className="text-[0.9rem] leading-relaxed m-0">{job?.description}</p>
              </div>
            ))}
          </section>
        )}

        {educationDetails?.length > 0 && (
          <section id="section-Education" className={sectionCls("Education")}>
            <h2>Education</h2>
            {educationDetails?.map((edu, i) => (
              <div className="mb-3" key={i}>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-bold text-[0.95rem]">
                    {edu?.type} - {edu?.school} | {edu?.grade}{edu?.gradeType ? (edu?.gradeType == "percentage" ? "%" : "/10") : null}
                  </span>
                  <span className="text-[0.82rem] italic text-[#64748b] whitespace-nowrap ml-4">
                    {edu?.startDate} – {edu?.endDate}
                  </span>
                </div>
                <p className="text-[0.9rem] leading-relaxed m-0">{edu?.description}</p>
              </div>
            ))}
          </section>
        )}

        {projectDetails?.filter((e) => e?.project)?.length > 0 && (
          <section id="section-Projects" className={sectionCls("Projects")}>
            <h2>Projects</h2>
            {projectDetails?.map((proj, i) => (
              <div className="mb-3" key={i}>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-bold text-[0.95rem]">
                    {proj?.project} {proj?.company ? `(${proj.company})` : ""}
                  </span>
                  <span className="text-[0.82rem] italic text-[#64748b] whitespace-nowrap ml-4">
                    {proj?.startDate} – {proj?.endDate}
                  </span>
                </div>
                <div className="text-[0.9rem] leading-relaxed" dangerouslySetInnerHTML={{ __html: parseIfJson(proj?.description) }} />
              </div>
            ))}
          </section>
        )}

        {volunteeringList?.some((v) => v?.organization || v?.volunteering) && (
          <section id="section-Volunteering" className={sectionCls("Volunteering")}>
            <h2>Volunteering</h2>
            {volunteeringList.map((v, i) => (
              <div className="mb-3" key={i}>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-bold text-[0.95rem]">{v?.volunteering}{v?.organization ? `, ${v.organization}` : ""}</span>
                  <span className="text-[0.82rem] italic text-[#64748b] whitespace-nowrap ml-4">{v?.start} – {v?.end}</span>
                </div>
                <div className="text-[0.9rem] leading-relaxed" dangerouslySetInnerHTML={{ __html: asHtml(v?.description) }} />
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
};

export default Template3;