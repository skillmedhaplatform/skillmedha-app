"use client";
import React, { useEffect, useRef, useState } from "react";
import { MailOutlined, PhoneFilled, LinkOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { parseIfJson } from "@/app/student/(protected)/jobAssessments/reusable_comp/jsonparse";

/**
 * Template6 — "Modern Minimalist"
 * Clean two-column layout with minimal styling, professional typography,
 * left sidebar for quick info, right main content area.
 */
const Template6 = ({ downloadImage, setDownloadImage, resumeTemplateRef, activeSection, isGeneratingPdf }) => {
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
      activeSection === name ? "border-l-4 border-[#1e40af] bg-[#f0f4ff]" : "border-l-4 border-transparent"
    }`;

  return (
    <div
      className={`${(downloadImage || isGeneratingPdf) ? "w-[794px] max-w-[794px] min-h-[1123px]" : "w-full max-w-full"} h-auto mx-auto overflow-visible bg-white shadow-xl font-['Segoe UI',sans-serif] text-[#2c3e50] grid grid-cols-[12rem_1fr] [&::-webkit-scrollbar]:w-[1px] [&::-webkit-scrollbar-track]:bg-white [&::-webkit-scrollbar-thumb]:bg-[#e0e0e0]`}
      ref={downloadImage ? resumeRef : resumeTemplateRef}
    >
      {/* Left Sidebar */}
      <div className="bg-[#f8f9fa] p-5 border-r border-[#e0e0e0] flex flex-col gap-5">
        <div id="section-Basic-Details" className="text-center">
          {profileBase64 && (
            <img
              width="100"
              height="100"
              src={profileBase64}
              alt="profile"
              className="w-24 h-24 rounded-lg object-cover mx-auto mb-3 border border-[#d0d0d0]"
            />
          )}
          <h1 className="text-[1.1rem] font-bold text-[#1e3a8a] m-0 leading-tight">
            {basicDetails?.firstName} {basicDetails?.lastName}
          </h1>
          <p className="text-[0.75rem] text-[#666] m-0 mt-0.5">{basicDetails?.middleName}</p>
        </div>

        <div className="border-t border-[#e0e0e0] pt-3">
          <h3 className="text-[0.7rem] font-bold uppercase tracking-widest text-[#1e40af] mb-2">Contact</h3>
          <div className="flex flex-col gap-1.5 text-[0.75rem]">
            <a href={`mailto:${basicDetails?.email || ""}`} className="text-[#0066cc] no-underline break-all hover:underline">
              {basicDetails?.email}
            </a>
            <a href={`tel:${basicDetails?.phone || ""}`} className="text-[#0066cc] no-underline break-all hover:underline">
              {basicDetails?.phone}
            </a>
          </div>
        </div>

        {skillss?.length > 0 && (
          <div id="section-Skills" className="border-t border-[#e0e0e0] pt-3">
            <h3 className="text-[0.7rem] font-bold uppercase tracking-widest text-[#1e40af] mb-2">Skills</h3>
            <ul className="flex flex-col gap-1 list-none p-0 m-0">
              {skillss.map((skill, i) => (
                <li key={i} className="text-[0.75rem] text-[#444]">• {skill}</li>
              ))}
            </ul>
          </div>
        )}

        {lang?.length > 0 && (
          <div id="section-Languages" className="border-t border-[#e0e0e0] pt-3">
            <h3 className="text-[0.7rem] font-bold uppercase tracking-widest text-[#1e40af] mb-2">Languages</h3>
            <p className="text-[0.75rem] text-[#444] m-0">{lang.join(", ")}</p>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="p-6 [&_section]:mb-4 [&_section_h2]:text-[0.95rem] [&_section_h2]:font-bold [&_section_h2]:uppercase [&_section_h2]:tracking-widest [&_section_h2]:border-b-2 [&_section_h2]:border-[#1e40af] [&_section_h2]:pb-2 [&_section_h2]:mb-3 [&_section_h2]:text-[#1e3a8a] [&_section_p]:text-[0.85rem] [&_section_p]:leading-relaxed">
        {basicDetails?.professionalSummary && (
          <section id="section-Summary" className={sectionCls("Summary")}>
            <h2>Professional Summary</h2>
            <div className="text-[0.85rem] leading-relaxed">
              <div dangerouslySetInnerHTML={{ __html: filterQuotes(basicDetails?.professionalSummary) }} />
            </div>
          </section>
        )}

        {experienceDetails?.filter((e) => e?.type?.toLowerCase() == "work")?.filter((e) => e?.company)?.length > 0 && (
          <section id="section-Experience" className={sectionCls("Experience")}>
            <h2>Work Experience</h2>
            {experienceDetails?.filter((e) => e?.type == "work").map((job, i) => (
              <div className="mb-3" key={i}>
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="font-bold text-[0.9rem] text-[#1e3a8a]">{job?.role}</span>
                  <span className="text-[0.75rem] text-[#666]">
                    {job?.start || job?.startDate} – {job?.end || job?.endDate}
                  </span>
                </div>
                <p className="text-[0.8rem] text-[#555] m-0 italic">{job?.company}</p>
                <p className="text-[0.8rem] leading-relaxed m-0 mt-0.5">{job?.description}</p>
              </div>
            ))}
          </section>
        )}

        {educationDetails?.length > 0 && (
          <section id="section-Education" className={sectionCls("Education")}>
            <h2>Education</h2>
            {educationDetails?.map((edu, i) => (
              <div className="mb-2.5" key={i}>
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="font-bold text-[0.9rem] text-[#1e3a8a]">{edu?.type}</span>
                  <span className="text-[0.75rem] text-[#666]">{edu?.startDate} – {edu?.endDate}</span>
                </div>
                <p className="text-[0.8rem] m-0">{edu?.school} | {edu?.grade}{edu?.gradeType ? (edu?.gradeType == "percentage" ? "%" : "/10") : ""}</p>
              </div>
            ))}
          </section>
        )}

        {projectDetails?.filter((e) => e?.project)?.length > 0 && (
          <section id="section-Projects" className={sectionCls("Projects")}>
            <h2>Projects</h2>
            {projectDetails?.map((proj, i) => (
              <div className="mb-2.5" key={i}>
                <span className="font-bold text-[0.9rem] text-[#1e3a8a]">{proj?.project}</span>
                {proj?.company && <p className="text-[0.8rem] text-[#666] m-0 italic">{proj?.company}</p>}
                <div className="text-[0.8rem] leading-relaxed mt-1" dangerouslySetInnerHTML={{ __html: parseIfJson(proj?.description) }} />
              </div>
            ))}
          </section>
        )}

        {certificatesList?.some((c) => c?.name || c?.organization) && (
          <section id="section-Certifications" className={sectionCls("Certifications")}>
            <h2>Certifications</h2>
            {certificatesList.map((cert, i) => (
              <div key={i} className="mb-1.5">
                <p className="text-[0.85rem] font-semibold text-[#1e3a8a] m-0">{cert?.name}</p>
                <p className="text-[0.75rem] text-[#666] m-0">{cert?.organization}</p>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
};

export default Template6;
