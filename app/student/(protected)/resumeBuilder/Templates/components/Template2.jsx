"use client";
import React, { useEffect, useRef, useState } from "react";
import { MailOutlined, PhoneFilled } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { parseIfJson } from "@/app/student/(protected)/jobAssessments/reusable_comp/jsonparse";

const Template2 = ({ downloadImage, setDownloadImage, resumeTemplateRef }) => {
  const resumeRef = useRef(null);
  const [profileBase64, setProfileBase64] = useState(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const basicDetails =
    useSelector((state) => state.student.student?.data) || {};
  const educationDetails =
    useSelector((state) => state.student.student?.data?.educationDetails) || [];
  const experienceDetails =
    useSelector((state) => state.student.student?.data?.experiences) || [];
  const projectDetails =
    useSelector((state) => state.student.student?.data?.projects) || [];
  const accDetails =
    useSelector((state) => state.student.student?.data?.accomplishments) || [];
  const skillss =
    useSelector((state) => state.student.student?.data?.technical) || [];
  const lang =
    useSelector((state) => state.student.student?.data?.languages) || [];
  const linkList =
    useSelector((state) => state.student.student?.data?.links) || [];
  const volunteeringList =
    useSelector((state) => state.student.student?.data?.volunteerings) || [];
  const certificatesList =
    useSelector((state) => state.student.student?.data?.certificates) || [];

  // Convert image to base64 using canvas method
  const convertImageToBase64 = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();

      // Set crossOrigin before setting src
      img.crossOrigin = "anonymous";

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);

          const base64String = canvas.toDataURL("image/jpeg", 0.95);
          resolve(base64String);
        } catch (error) {
          console.error("Canvas conversion error:", error);
          reject(error);
        }
      };

      img.onerror = (error) => {
        console.error("Image load error:", error);
        // Fallback: try fetch method
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

      // Add timestamp to bypass cache
      img.src =
        url + (url.includes("?") ? "&" : "?") + "t=" + new Date().getTime();
    });
  };

  // Load base64 image on component mount
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
        .catch((error) => {
          console.error("Failed to convert image:", error);
          // Use original URL as fallback
          setProfileBase64(basicDetails.profile);
          setIsImageLoaded(true);
        });
    }
  }, [basicDetails?.profile]);

  const asHtml = (val) => {
    if (!val) return "";
    return typeof val === "string"
      ? filterQuotes(val)
      : filterQuotes(String(val));
  };

const handleDownloadPdf = async () => {
    if (!resumeRef.current) return;

    try {
      // Wait for image to be loaded and converted
      if (!isImageLoaded) {
        console.log("Waiting for image to load...");
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      const html2pdf = (await import("html2pdf.js")).default;

      const opt = {
        margin: 0,
        filename: "resume.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: "#ffffff",
        },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      };

      await html2pdf().set(opt).from(resumeRef.current).save();
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

  const filterQuotes = (text) => {
    try {
      if (text[0] == '"') return text?.slice(1, -1);
      return text;
    } catch (error) {
      return text;
    }
  };

  return (
    <div
      className="max-w-[50rem] h-full mx-auto overflow-y-scroll p-12 bg-white shadow-[0_0_10px_rgba(0,0,0,0.1)] font-['Source_Sans_Pro',sans-serif] text-[#333] [&_section]:mb-2 [&_section_h2]:text-[1rem] [&_section_h2]:border-b [&_section_h2]:border-solid [&_section_h2]:border-[#ccc] [&_section_h2]:pb-1 [&_section_h2]:mb-1 [&_section_h2]:text-[#222] [&_section_p]:text-[0.9rem] [&::-webkit-scrollbar]:w-[1px] [&::-webkit-scrollbar-track]:bg-white [&::-webkit-scrollbar-thumb]:bg-white [&::-webkit-scrollbar-thumb]:rounded-[20px]"
      ref={downloadImage ? resumeRef : resumeTemplateRef}
    >
      <header className="grid grid-cols-[1fr_10rem] mb-2.5">
        <div className="flex flex-col justify-center items-start text-start [&_p]:text-[0.9rem] [&_p]:my-2">
          <div className="mb-0.5 text-start [&_h1]:text-start [&_h1]:text-[2.2rem] [&_h1]:font-bold [&_h1]:m-0 [&_h2]:font-medium [&_h2]:text-[1.3rem]">
            <h1>
              {basicDetails?.firstName} {basicDetails?.middleName}{" "}
              {basicDetails?.lastName}
            </h1>
          </div>
          <div className="flex flex-wrap mt-2 mb-0.5 [&_a]:text-[0.9rem] [&_a]:mr-4 [&_a]:mb-2 [&_a]:text-[#333] [&_a]:no-underline [&_a]:flex [&_a]:items-center [&_a]:gap-1.5 [&_a:hover]:underline">
            <a href={`mailto:${basicDetails?.email || ""}`}>
              <MailOutlined /> {basicDetails?.email}
            </a>
            <a href={`tel:${basicDetails?.phone || ""}`}>
              <PhoneFilled /> {basicDetails?.phone}
            </a>
          </div>
          {linkList?.length > 0 && (
            <div className="flex flex-col gap-2 [&_p]:text-[0.9rem] [&_p]:m-0 [&_p]:mb-2">
              {linkList.map((link, i) => (
                <div key={i}>
                  <p className="text-[0.9rem] m-0 mb-2">
                    {link?.title || ""} {link?.link ? `- ${link.link}` : ""}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-center items-center">
          {profileBase64 && (
            <img
              width="70%"
              src={profileBase64}
              alt="profile"
              style={{ display: "block" }}
            />
          )}
        </div>
      </header>

      <section>
        <h2>Professional Summary</h2>
        <div className="text-[0.9rem] tracking-[0.2rem] leading-[0.9rem]">
          <div
            dangerouslySetInnerHTML={{
              __html: filterQuotes(basicDetails?.professionalSummary),
            }}
          />
        </div>
      </section>

      {educationDetails?.length > 0 && (
        <section>
          <h2>Education</h2>
          {educationDetails?.length > 0 &&
            educationDetails?.map((edu, i) => (
              <div className="flex flex-col mb-3 justify-center" key={i}>
                <div className="flex justify-between m-0 mb-1.5 [&_span]:font-bold [&_span]:text-[1rem]">
                  <div>
                    <span>
                      {edu?.type} - {edu?.school} | {edu?.grade}{" "}
                      {edu?.gradeType
                        ? edu?.gradeType == "percentage"
                          ? "%"
                          : "/10"
                        : null}
                    </span>
                  </div>
                  <div className="min-w-[10rem] italic text-[0.9rem] font-medium">
                    <p>
                      {edu?.startDate} – {edu?.endDate}
                    </p>
                  </div>
                </div>
                <div className="flex m-0 text-[0.9rem] tracking-[0.2rem] leading-[0.9rem] [&_p]:text-[0.9rem] [&_p]:m-0">
                  <p>{edu?.description}</p>
                </div>
              </div>
            ))}
        </section>
      )}

      {experienceDetails
        ?.filter((e) => e?.type?.toLowerCase() == "work")
        ?.filter((e) => e?.company)?.length > 0 && (
          <section>
            <h2>Experience</h2>
            {experienceDetails?.length > 0 &&
              experienceDetails
                ?.filter((e) => e?.type == "work")
                .map((job, i) => (
                  <div className="flex flex-col mb-3 justify-center" key={i}>
                    <div className="flex justify-between m-0 mb-1.5 [&_span]:font-bold [&_span]:text-[1rem]">
                      <div>
                        <span>
                          {job?.role}, {job?.company}
                        </span>
                        {" -"}
                      </div>
                      <div className="min-w-[10rem] italic text-[0.9rem] font-medium">
                        <p>
                          {job?.start || job?.startDate} –{" "}
                          {job?.end || job?.endDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex m-0 text-[0.9rem] tracking-[0.2rem] leading-[0.9rem] [&_p]:text-[0.9rem] [&_p]:m-0">
                      <p>{job?.description}</p>
                    </div>
                  </div>
                ))}
          </section>
        )}

      {experienceDetails
        ?.filter((e) => e?.type?.toLowerCase() !== "work")
        ?.filter((e) => e?.company)?.length > 0 && (
          <section>
            <h2>Internships</h2>
            {experienceDetails?.length > 0 &&
              experienceDetails
                ?.filter((e) => e?.type !== "work")
                ?.map((job, i) => (
                  <div className="flex flex-col mb-3 justify-center" key={i}>
                    <div className="flex justify-between m-0 mb-1.5 [&_span]:font-bold [&_span]:text-[1rem]">
                      <div>
                        <span>
                          {job?.role}, {job?.company}
                        </span>
                        {" -"}
                      </div>
                      <div className="min-w-[10rem] italic text-[0.9rem] font-medium">
                        <p>
                          {job?.start || job?.startDate} –{" "}
                          {job?.end || job?.endDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex m-0 text-[0.9rem] tracking-[0.2rem] leading-[0.9rem] [&_p]:text-[0.9rem] [&_p]:m-0">
                      <p>{job?.description}</p>
                    </div>
                  </div>
                ))}
          </section>
        )}

      {projectDetails?.length > 0 &&
        projectDetails?.filter((e) => e?.project)?.length > 0 && (
          <section>
            <h2>Projects</h2>
            {projectDetails?.length > 0 &&
              projectDetails?.map((proj, i) => (
                <div className="flex flex-col mb-3 justify-center" key={i}>
                  <div className="flex justify-between m-0 mb-1.5 [&_span]:font-bold [&_span]:text-[1rem]">
                    <div>
                      <span>
                        {proj?.project ? `${proj.project}` : ""}{" "}
                        {proj?.company ? `(${proj.company})` : ""}
                      </span>
                    </div>
                    <div className="min-w-[10rem] italic text-[0.9rem] font-medium">
                      <p>
                        {proj?.startDate} – {proj?.endDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex m-0 text-[0.9rem] tracking-[0.2rem] leading-[0.9rem] [&_p]:text-[0.9rem] [&_p]:m-0">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: parseIfJson(proj?.description),
                      }}
                    />
                  </div>
                </div>
              ))}
          </section>
        )}

      {certificatesList?.length > 0 &&
        certificatesList.some((cert) => cert?.name || cert?.organization) && (
          <section>
            <h2>Certificates</h2>
            {certificatesList.map((cert, i) => (
              <div className="flex flex-col mb-3 justify-center" key={i}>
                <div className="flex justify-between m-0 mb-1.5 [&_span]:font-bold [&_span]:text-[1rem]">
                  <div>
                    <span>
                      {cert?.name}
                      {cert?.organization ? `, ${cert.organization}` : ""}
                    </span>
                  </div>
                  <div className="min-w-[10rem] italic text-[0.9rem] font-medium">
                    <p>
                      {cert?.issueDate}
                      {cert?.expiryDate ? ` – ${cert.expiryDate}` : ""}
                    </p>
                  </div>
                </div>
                {(cert?.credentialId || cert?.credentialUrl) && (
                  <div className="flex m-0 text-[0.9rem] tracking-[0.2rem] leading-[0.9rem] [&_p]:text-[0.9rem] [&_p]:m-0">
                    {cert?.credentialId && <p>ID: {cert.credentialId}</p>}
                    {cert?.credentialUrl && (
                      <p>
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {cert.credentialUrl}
                        </a>
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

      {volunteeringList?.length > 0 &&
        volunteeringList.some((v) => v?.organization || v?.volunteering) && (
          <section>
            <h2>Volunteering</h2>
            {volunteeringList.map((v, i) => (
              <div className="flex flex-col mb-3 justify-center" key={i}>
                <div className="flex justify-between m-0 mb-1.5 [&_span]:font-bold [&_span]:text-[1rem]">
                  <div>
                    <span>
                      {v?.volunteering}
                      {v?.organization ? `, ${v.organization}` : ""}
                    </span>
                    {" -"}
                  </div>
                  <div className="min-w-[10rem] italic text-[0.9rem] font-medium">
                    <p>
                      {v?.start} – {v?.end}
                    </p>
                  </div>
                </div>
                <div className="flex m-0 text-[0.9rem] tracking-[0.2rem] leading-[0.9rem] [&_p]:text-[0.9rem] [&_p]:m-0">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: asHtml(v?.description),
                    }}
                  />
                </div>
              </div>
            ))}
          </section>
        )}

      {skillss?.length > 0 && (
        <section>
          <h2>Skills</h2>
          <ul className="flex flex-wrap gap-16 box-border [&_li]:text-[0.9rem] [&_li]:list-square [&_li]:ml-4">
            {skillss?.length > 0 &&
              skillss.map((skill, i) => <li key={i}>{skill}</li>)}
          </ul>
        </section>
      )}

      {lang?.length > 0 && (
        <section>
          <h2>Languages</h2>
          <p>{lang?.length > 0 ? lang.join(", ") : ""}</p>
        </section>
      )}
    </div>
  );
};

export default Template2;
