"use client";
import React, { useEffect, useRef, useState } from "react";
import { MailOutlined, PhoneFilled } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { parseIfJson } from "@/app/student/(protected)/jobAssessments/reusable_comp/jsonparse";

/**
 * Template5 — "Bold Creative"
 * Diagonal-accented color header band, pill-style skill tags, vivid accent
 * (violet/orange) used for section markers and dates.
 */
const Template5 = ({ downloadImage, setDownloadImage, resumeTemplateRef, activeSection, isGeneratingPdf }) => {
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
    return new Promise((resolve, reject) => {
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
      img.onerror = () => {
        fetch(url)
          .then((response) => response.blob())
          .then((blob) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          })
          .catch(reject);
      };
      img.src = url + (url.includes("?") ? "&" : "?") + "t=" + new Date().getTime();
    });
  };

  useEffect(() => {
    if (basicDetails?.profile) {
      setIsImageLoaded(false);
      convertImageToBase64(basicDetails.profile)
        .then((base64) => {
          if (base64) {
            setProfileBase64(base64);
            setIsImageLoaded(true);
          }
        })
        .catch(() => {
          setProfileBase64(basicDetails.profile);
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
    `transition-all duration-300 rounded-xl p-3 -m-3 mb-3 scroll-mt-8 ${
      activeSection === name ? "border-2 border-[#7c3aed] bg-[#faf5ff] shadow-sm" : "border-2 border-transparent"
    }`;

  return (
    <div
      className={`${(downloadImage || isGeneratingPdf) ? "w-[794px] max-w-[794px] min-h-[1123px]" : "w-full max-w-full"} h-auto mx-auto overflow-visible bg-white shadow-xl font-['Inter',sans-serif] text-[#334155] [&_section]:mb-6 [&_section_h2]:text-[1rem] [&_section_h2]:font-bold [&_section_h2]:tracking-wide [&_section_h2]:uppercase [&_section_h2]:mb-4 [&_section_h2]:text-[#7c3aed] [&_section_h2]:flex [&_section_h2]:items-center [&_section_h2]:gap-2 [&_section_p]:text-[0.92rem] [&_section_p]:leading-relaxed [&::-webkit-scrollbar]:w-[1px] [&::-webkit-scrollbar-track]:bg-white [&::-webkit-scrollbar-thumb]:bg-white`}
      ref={downloadImage ? resumeRef : resumeTemplateRef}
    >
      <div id="section-Basic-Details" className={sectionCls("Basic Details")}>
        <header
          className="relative overflow-hidden px-10 py-9 mb-2 grid grid-cols-[1fr_8rem] items-center"
          style={{ background: "linear-gradient(120deg, #7c3aed 0%, #a855f7 55%, #f97316 100%)" }}
        >
          <div className="relative z-[1]">
            <h1 className="text-[2.4rem] font-black tracking-tight text-white m-0">
              {basicDetails?.firstName} {basicDetails?.middleName} {basicDetails?.lastName}
            </h1>
            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-[0.9rem]">
              <a href={`mailto:${basicDetails?.email || ""}`} className="flex items-center gap-1.5 no-underline text-white/90">
                <MailOutlined /> {basicDetails?.email}
              </a>
              <a href={`tel:${basicDetails?.phone || ""}`} className="flex items-center gap-1.5 no-underline text-white/90">
                <PhoneFilled /> {basicDetails?.phone}
              </a>
            </div>
            {linkList?.length > 0 && (
              <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2">
                {linkList.map((link, i) => (
                  <a
                    key={i}
                    href={link?.link ? (link.link.startsWith("http") ? link.link : `https://${link.link}`) : "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[0.85rem] text-white/90 no-underline"
                  >
                    {link?.title || link.link}
                  </a>
                ))}
              </div>
            )}
          </div>
          <div className="relative z-[1] flex justify-center items-center">
            {profileBase64 && (
              <img
                width="100"
                height="100"
                src={profileBase64}
                alt="profile"
                className="rounded-full object-cover border-4 border-white/80"
              />
            )}
          </div>
        </header>

        <section className="px-10 !mb-0">
          <h2><span className="w-2 h-2 rounded-full bg-[#7c3aed] inline-block" />Summary</h2>
          <div className="text-[0.92rem] leading-relaxed">
            <div dangerouslySetInnerHTML={{ __html: filterQuotes(basicDetails?.professionalSummary) }} />
          </div>
        </section>
      </div>

      <div className="px-10">
        {experienceDetails?.filter((e) => e?.type?.toLowerCase() == "work")?.filter((e) => e?.company)?.length > 0 && (
          <section id="section-Experience" className={sectionCls("Experience")}>
            <h2><span className="w-2 h-2 rounded-full bg-[#7c3aed] inline-block" />Experience</h2>
            {experienceDetails?.filter((e) => e?.type == "work").map((job, i) => (
              <div className="mb-4 pl-4 border-l-2 border-[#e9d5ff]" key={i}>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-bold text-[0.98rem] text-[#1e1b4b]">{job?.role}, {job?.company}</span>
                  <span className="text-[0.8rem] font-medium text-[#f97316] whitespace-nowrap ml-4">
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
            <h2><span className="w-2 h-2 rounded-full bg-[#7c3aed] inline-block" />Internships</h2>
            {experienceDetails?.filter((e) => e?.type !== "work").map((job, i) => (
              <div className="mb-4 pl-4 border-l-2 border-[#e9d5ff]" key={i}>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-bold text-[0.98rem] text-[#1e1b4b]">{job?.role}, {job?.company}</span>
                  <span className="text-[0.8rem] font-medium text-[#f97316] whitespace-nowrap ml-4">
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
            <h2><span className="w-2 h-2 rounded-full bg-[#7c3aed] inline-block" />Education</h2>
            {educationDetails?.map((edu, i) => (
              <div className="mb-4 pl-4 border-l-2 border-[#e9d5ff]" key={i}>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-bold text-[0.98rem] text-[#1e1b4b]">
                    {edu?.type} - {edu?.school} | {edu?.grade}{edu?.gradeType ? (edu?.gradeType == "percentage" ? "%" : "/10") : null}
                  </span>
                  <span className="text-[0.8rem] font-medium text-[#f97316] whitespace-nowrap ml-4">{edu?.startDate} – {edu?.endDate}</span>
                </div>
                <p className="text-[0.9rem] leading-relaxed m-0">{edu?.description}</p>
              </div>
            ))}
          </section>
        )}

        {projectDetails?.filter((e) => e?.project)?.length > 0 && (
          <section id="section-Projects" className={sectionCls("Projects")}>
            <h2><span className="w-2 h-2 rounded-full bg-[#7c3aed] inline-block" />Projects</h2>
            {projectDetails?.map((proj, i) => (
              <div className="mb-4 pl-4 border-l-2 border-[#e9d5ff]" key={i}>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-bold text-[0.98rem] text-[#1e1b4b]">
                    {proj?.project} {proj?.company ? `(${proj.company})` : ""}
                  </span>
                  <span className="text-[0.8rem] font-medium text-[#f97316] whitespace-nowrap ml-4">{proj?.startDate} – {proj?.endDate}</span>
                </div>
                <div className="text-[0.9rem] leading-relaxed" dangerouslySetInnerHTML={{ __html: parseIfJson(proj?.description) }} />
              </div>
            ))}
          </section>
        )}

        {certificatesList?.some((c) => c?.name || c?.organization) && (
          <section id="section-Certifications" className={sectionCls("Certifications")}>
            <h2><span className="w-2 h-2 rounded-full bg-[#7c3aed] inline-block" />Certificates</h2>
            {certificatesList.map((cert, i) => (
              <div className="mb-2.5 pl-4 border-l-2 border-[#e9d5ff]" key={i}>
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-[0.95rem] text-[#1e1b4b]">{cert?.name}{cert?.organization ? `, ${cert.organization}` : ""}</span>
                  <span className="text-[0.8rem] font-medium text-[#f97316] whitespace-nowrap ml-4">
                    {cert?.issueDate}{cert?.expiryDate ? ` – ${cert.expiryDate}` : ""}
                  </span>
                </div>
              </div>
            ))}
          </section>
        )}

        {volunteeringList?.some((v) => v?.organization || v?.volunteering) && (
          <section id="section-Volunteering" className={sectionCls("Volunteering")}>
            <h2><span className="w-2 h-2 rounded-full bg-[#7c3aed] inline-block" />Volunteering</h2>
            {volunteeringList.map((v, i) => (
              <div className="mb-4 pl-4 border-l-2 border-[#e9d5ff]" key={i}>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-bold text-[0.95rem] text-[#1e1b4b]">{v?.volunteering}{v?.organization ? `, ${v.organization}` : ""}</span>
                  <span className="text-[0.8rem] font-medium text-[#f97316] whitespace-nowrap ml-4">{v?.start} – {v?.end}</span>
                </div>
                <div className="text-[0.9rem] leading-relaxed" dangerouslySetInnerHTML={{ __html: asHtml(v?.description) }} />
              </div>
            ))}
          </section>
        )}

        {skillss?.length > 0 && (
          <section id="section-Skills" className={sectionCls("Skills")}>
            <h2><span className="w-2 h-2 rounded-full bg-[#7c3aed] inline-block" />Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skillss.map((skill, i) => (
                <span
                  key={i}
                  className="text-[0.82rem] font-medium px-3 py-1 rounded-full bg-[#f3e8ff] text-[#7c3aed]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {lang?.length > 0 && (
          <section id="section-Languages" className={sectionCls("Languages")}>
            <h2><span className="w-2 h-2 rounded-full bg-[#7c3aed] inline-block" />Languages</h2>
            <div className="flex flex-wrap gap-2">
              {lang.map((l, i) => (
                <span key={i} className="text-[0.82rem] font-medium px-3 py-1 rounded-full bg-[#fff7ed] text-[#f97316]">
                  {l}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Template5;