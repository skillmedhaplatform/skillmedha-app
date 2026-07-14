"use client";
import React, { useEffect, useRef, useState } from "react";
import { MailOutlined, PhoneFilled } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { parseIfJson } from "@/app/student/(protected)/jobAssessments/reusable_comp/jsonparse";

/**
 * Template7 — "Creative Accent"
 * Modern layout with colored accent elements, clean typography,
 * colored section headers and skill badges.
 */
const Template7 = ({ downloadImage, setDownloadImage, resumeTemplateRef, activeSection, isGeneratingPdf }) => {
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
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).jsPDF;

      let canvas;
      try {
        canvas = await html2canvas(resumeRef.current, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: "#ffffff",
        });
      } catch (canvasErr) {
        console.error("html2canvas failed:", canvasErr);
        throw canvasErr;
      }

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "in",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
      const pdfBlob = pdf.output("blob");

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
    `transition-all duration-300 rounded-lg p-3 -m-3 mb-4 scroll-mt-8 ${
      activeSection === name ? "border-l-4 border-[#d97706] bg-[#fffbeb]" : "border-l-4 border-transparent"
    }`;

  return (
    <div
      className={`${(downloadImage || isGeneratingPdf) ? "w-[794px] max-w-[794px] min-h-[1123px]" : "w-full max-w-full"} h-auto mx-auto overflow-visible bg-white shadow-xl font-['Poppins',sans-serif] text-[#3a4a5c] [&::-webkit-scrollbar]:w-[1px] [&::-webkit-scrollbar-track]:bg-white [&::-webkit-scrollbar-thumb]:bg-[#e5e7eb]`}
      ref={downloadImage ? resumeRef : resumeTemplateRef}
    >
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-[#2563eb] to-[#7c3aed] text-white p-8 mb-2">
        <div className="flex items-start gap-6 mb-4">
          {profileBase64 && (
            <img
              width="90"
              height="90"
              src={profileBase64}
              alt="profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-white/30"
            />
          )}
          <div id="section-Basic-Details" className="flex-1">
            <h1 className="text-[2rem] font-bold m-0 leading-tight">
              {basicDetails?.firstName} {basicDetails?.lastName}
            </h1>
            <p className="text-[0.95rem] text-white/80 m-0 mt-1">{basicDetails?.middleName}</p>
            <div className="flex flex-wrap gap-4 mt-3">
              <a href={`mailto:${basicDetails?.email || ""}`} className="flex items-center gap-1.5 text-white/90 no-underline text-[0.9rem]">
                <MailOutlined /> {basicDetails?.email}
              </a>
              <a href={`tel:${basicDetails?.phone || ""}`} className="flex items-center gap-1.5 text-white/90 no-underline text-[0.9rem]">
                <PhoneFilled /> {basicDetails?.phone}
              </a>
            </div>
          </div>
        </div>

        {linkList?.length > 0 && (
          <div className="flex flex-wrap gap-4">
            {linkList.map((link, i) => (
              <a
                key={i}
                href={link?.link ? (link.link.startsWith("http") ? link.link : `https://${link.link}`) : "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 no-underline text-[0.85rem] hover:text-white"
              >
                {link?.title || link?.link}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="px-8 pb-8">
        {basicDetails?.professionalSummary && (
          <section id="section-Summary" className={sectionCls("Summary")}>
            <h2 className="text-[1.1rem] font-bold text-[#2563eb] uppercase tracking-wide border-b-2 border-[#dbeafe] pb-2 mb-3">Summary</h2>
            <div className="text-[0.9rem] leading-relaxed text-[#555]">
              <div dangerouslySetInnerHTML={{ __html: filterQuotes(basicDetails?.professionalSummary) }} />
            </div>
          </section>
        )}

        {experienceDetails?.filter((e) => e?.type?.toLowerCase() == "work")?.filter((e) => e?.company)?.length > 0 && (
          <section id="section-Experience" className={sectionCls("Experience")}>
            <h2 className="text-[1.1rem] font-bold text-[#d97706] uppercase tracking-wide border-b-2 border-[#fef3c7] pb-2 mb-3">Work Experience</h2>
            {experienceDetails?.filter((e) => e?.type == "work").map((job, i) => (
              <div className="mb-4" key={i}>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-bold text-[0.95rem] text-[#1f2937]">{job?.role}</span>
                  <span className="text-[0.8rem] text-[#9ca3af] font-medium">
                    {job?.start || job?.startDate} – {job?.end || job?.endDate}
                  </span>
                </div>
                <p className="text-[0.85rem] text-[#666] m-0 mb-1 italic">{job?.company}</p>
                <p className="text-[0.9rem] leading-relaxed m-0 text-[#555]">{job?.description}</p>
              </div>
            ))}
          </section>
        )}

        {educationDetails?.length > 0 && (
          <section id="section-Education" className={sectionCls("Education")}>
            <h2 className="text-[1.1rem] font-bold text-[#10b981] uppercase tracking-wide border-b-2 border-[#d1fae5] pb-2 mb-3">Education</h2>
            {educationDetails?.map((edu, i) => (
              <div className="mb-3" key={i}>
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="font-bold text-[0.95rem] text-[#1f2937]">{edu?.type}</span>
                  <span className="text-[0.8rem] text-[#9ca3af] font-medium">{edu?.startDate} – {edu?.endDate}</span>
                </div>
                <p className="text-[0.9rem] m-0 text-[#555]">{edu?.school} • {edu?.grade}{edu?.gradeType ? (edu?.gradeType == "percentage" ? "%" : "/10") : ""}</p>
              </div>
            ))}
          </section>
        )}

        {skillss?.length > 0 && (
          <section id="section-Skills" className={sectionCls("Skills")}>
            <h2 className="text-[1.1rem] font-bold text-[#f59e0b] uppercase tracking-wide border-b-2 border-[#fef3c7] pb-2 mb-3">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skillss.map((skill, i) => (
                <span
                  key={i}
                  className="text-[0.85rem] font-medium px-3 py-1.5 rounded-full bg-gradient-to-r from-[#dbeafe] to-[#ede9fe] text-[#1e40af]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {projectDetails?.filter((e) => e?.project)?.length > 0 && (
          <section id="section-Projects" className={sectionCls("Projects")}>
            <h2 className="text-[1.1rem] font-bold text-[#8b5cf6] uppercase tracking-wide border-b-2 border-[#ede9fe] pb-2 mb-3">Projects</h2>
            {projectDetails?.map((proj, i) => (
              <div className="mb-3" key={i}>
                <span className="font-bold text-[0.95rem] text-[#1f2937]">{proj?.project}</span>
                {proj?.company && <p className="text-[0.85rem] text-[#666] m-0 italic">{proj?.company}</p>}
                <div className="text-[0.9rem] leading-relaxed mt-1 text-[#555]" dangerouslySetInnerHTML={{ __html: parseIfJson(proj?.description) }} />
              </div>
            ))}
          </section>
        )}

        {lang?.length > 0 && (
          <section id="section-Languages" className={sectionCls("Languages")}>
            <h2 className="text-[1.1rem] font-bold text-[#06b6d4] uppercase tracking-wide border-b-2 border-[#cffafe] pb-2 mb-3">Languages</h2>
            <p className="text-[0.9rem] text-[#555] m-0">{lang.join(" • ")}</p>
          </section>
        )}

        {certificatesList?.some((c) => c?.name || c?.organization) && (
          <section id="section-Certifications" className={sectionCls("Certifications")}>
            <h2 className="text-[1.1rem] font-bold text-[#ec4899] uppercase tracking-wide border-b-2 border-[#fce7f3] pb-2 mb-3">Certifications</h2>
            {certificatesList.map((cert, i) => (
              <div key={i} className="mb-2">
                <p className="text-[0.95rem] font-semibold text-[#1f2937] m-0">{cert?.name}</p>
                <p className="text-[0.85rem] text-[#666] m-0">{cert?.organization}</p>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
};

export default Template7;
