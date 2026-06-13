"use client";
import React from "react";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";
import { useSelector } from "react-redux";
import formStyles from "../../form.module.scss";

const Page = () => {
  const studentDetails = useSelector((state) => state.student.student?.data);

  const getFileType = (fileUrl) => {
    if (!fileUrl || typeof fileUrl !== "string") return "unknown";
    const extension = fileUrl?.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(extension)) {
      return "image";
    }
    if (["pdf", "docx", "doc"].includes(extension)) {
      return "pdf";
    }
    return "unknown";
  };

  const hasEducationDocs = studentDetails?.educationDetails?.some(e => e?.fileUrl);
  
  const workExperiences = studentDetails?.experiences?.filter((e) => e?.type?.toLowerCase() === "work") || [];
  const hasWorkDocs = workExperiences.some(
    (e) => e?.joiningFiles?.[0]?.url || e?.relievingFiles?.[0]?.url || e?.customDocs?.some(d => d.files?.[0]?.url)
  );

  const internships = studentDetails?.experiences?.filter((e) => e?.type?.toLowerCase() === "internship") || [];
  const hasInternshipDocs = internships.some(
    (e) => e?.certificate?.[0]?.url || e?.customDocs?.some(d => d.files?.[0]?.url)
  );

  const projects = studentDetails?.projects || [];
  const hasProjectDocs = projects.some(p => p.customDocs?.some(d => d.files?.[0]?.url));

  const responsibilities = studentDetails?.responsibilities || [];
  const hasResponsibilityDocs = responsibilities.some(r => r.customDocs?.some(d => d.files?.[0]?.url));

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header Card matching TPO */}
      <div className={formStyles.formContainer} style={{ padding: "1.5rem 2rem", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <div className={formStyles.headerLeft}>
          <h1 className={formStyles.formTitle}>Certifications & Documents</h1>
          <p className={formStyles.formSubtitle}>View all your uploaded academic, professional, and project documents below</p>
        </div>
      </div>

      {/* Education Certificates */}
      {hasEducationDocs && (
        <div className={formStyles.formContainer}>
          <h2 className="text-lg font-extrabold text-[#0f172a] border-b border-slate-100 pb-3 mb-4 w-full flex items-center justify-between">
            <span>Education Certificates</span>
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", width: "100%" }}>
            {studentDetails?.educationDetails?.map((eachEducationDetail, index) => {
              const fileUrl = eachEducationDetail?.fileUrl || "";
              if (!fileUrl) return null;
              const fileType = getFileType(fileUrl);
              return (
                <div
                  key={index}
                  className="border border-solid border-slate-200 rounded-xl p-4 bg-white shadow-sm flex flex-col gap-3"
                >
                  <div className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-2 mb-1 text-center">
                    {eachEducationDetail?.type || "Education Document"}
                  </div>

                  <div className="flex justify-center items-center overflow-hidden rounded-lg bg-slate-50" style={{ height: "400px" }}>
                    {fileType === "image" ? (
                      <img
                        src={fileUrl}
                        alt="Certificate"
                        className="w-full h-full object-contain"
                      />
                    ) : fileType === "pdf" ? (
                      <iframe
                        src={`https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`}
                        width="100%"
                        height="100%"
                        style={{ border: "none", borderRadius: "8px", overflow: "hidden" }}
                        title={`PDF Certificate ${index}`}
                      />
                    ) : (
                      <p className="text-slate-400 text-sm">Unsupported format</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Work Experience Certificates */}
      {hasWorkDocs && (
        <div className={formStyles.formContainer}>
          <h2 className="text-lg font-extrabold text-[#0f172a] border-b border-slate-100 pb-3 mb-4 w-full flex items-center justify-between">
            <span>Work Experience Certificates</span>
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem", width: "100%" }}>
            {workExperiences.map((eachExp, expIndex) => {
              const customDocsArr = eachExp?.customDocs?.map((e) => ({
                title: e?.title || "Custom Doc",
                url: e?.files?.[0]?.url || "",
              })) || [];

              const experienceDocs = [
                {
                  title: "Joining Letter",
                  url: eachExp?.joiningFiles?.[0]?.url || "",
                },
                {
                  title: "Relieving Letter",
                  url: eachExp?.relievingFiles?.[0]?.url || "",
                },
                ...customDocsArr,
              ].filter(doc => doc.url);

              if (experienceDocs.length === 0) return null;

              return (
                <div key={expIndex} style={{ width: "100%" }}>
                  <div className="text-sm font-extrabold text-slate-700 mb-3 bg-[#eef5fb] py-2 px-3 rounded-lg w-fit">
                    Company: {eachExp?.company?.toUpperCase() || "N/A"}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", width: "100%" }}>
                    {experienceDocs.map((eachExpDoc, index) => {
                      const fileUrl = eachExpDoc.url;
                      const fileType = getFileType(fileUrl);
                      return (
                        <div
                          key={index}
                          className="border border-solid border-slate-200 rounded-xl p-4 bg-white shadow-sm flex flex-col gap-3"
                        >
                          <div className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-2 mb-1 text-center">
                            {eachExpDoc.title}
                          </div>

                          <div className="flex justify-center items-center overflow-hidden rounded-lg bg-slate-50" style={{ height: "400px" }}>
                            {fileType === "image" ? (
                              <img
                                src={fileUrl}
                                alt="Certificate"
                                className="w-full h-full object-contain"
                              />
                            ) : fileType === "pdf" ? (
                              <iframe
                                src={`https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`}
                                width="100%"
                                height="100%"
                                style={{ border: "none", borderRadius: "8px", overflow: "hidden" }}
                                title={`PDF Work Doc ${index}`}
                              />
                            ) : (
                              <p className="text-slate-400 text-sm">Unsupported format</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Internship Certificates */}
      {hasInternshipDocs && (
        <div className={formStyles.formContainer}>
          <h2 className="text-lg font-extrabold text-[#0f172a] border-b border-slate-100 pb-3 mb-4 w-full flex items-center justify-between">
            <span>Internship Certificates</span>
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem", width: "100%" }}>
            {internships.map((eachExp, intIndex) => {
              const customDocsArr = eachExp?.customDocs?.map((e) => ({
                title: e?.title || "Custom Doc",
                url: e?.files?.[0]?.url || "",
              })) || [];

              const experienceDocs = [
                {
                  title: "Internship Certificate",
                  url: eachExp?.certificate?.[0]?.url || "",
                },
                ...customDocsArr,
              ].filter(doc => doc.url);

              if (experienceDocs.length === 0) return null;

              return (
                <div key={intIndex} style={{ width: "100%" }}>
                  <div className="text-sm font-extrabold text-slate-700 mb-3 bg-[#eef5fb] py-2 px-3 rounded-lg w-fit">
                    Company: {eachExp?.company?.toUpperCase() || "N/A"}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", width: "100%" }}>
                    {experienceDocs.map((eachExpDoc, index) => {
                      const fileUrl = eachExpDoc.url;
                      const fileType = getFileType(fileUrl);
                      return (
                        <div
                          key={index}
                          className="border border-solid border-slate-200 rounded-xl p-4 bg-white shadow-sm flex flex-col gap-3"
                        >
                          <div className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-2 mb-1 text-center">
                            {eachExpDoc.title}
                          </div>

                          <div className="flex justify-center items-center overflow-hidden rounded-lg bg-slate-50" style={{ height: "400px" }}>
                            {fileType === "image" ? (
                              <img
                                src={fileUrl}
                                alt="Certificate"
                                className="w-full h-full object-contain"
                              />
                            ) : fileType === "pdf" ? (
                              <iframe
                                src={`https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`}
                                width="100%"
                                height="100%"
                                style={{ border: "none", borderRadius: "8px", overflow: "hidden" }}
                                title={`PDF Internship Doc ${index}`}
                              />
                            ) : (
                              <p className="text-slate-400 text-sm">Unsupported format</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Project Documents */}
      {hasProjectDocs && (
        <div className={formStyles.formContainer}>
          <h2 className="text-lg font-extrabold text-[#0f172a] border-b border-slate-100 pb-3 mb-4 w-full flex items-center justify-between">
            <span>Project Documents</span>
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem", width: "100%" }}>
            {projects.map((eachProj, projIndex) => {
              const projectDocs = eachProj?.customDocs?.map((e) => ({
                title: e?.title || "Custom Doc",
                url: e?.files?.[0]?.url || "",
              })).filter(doc => doc.url) || [];

              if (projectDocs.length === 0) return null;

              return (
                <div key={projIndex} style={{ width: "100%" }}>
                  <div className="text-sm font-extrabold text-slate-700 mb-3 bg-[#eef5fb] py-2 px-3 rounded-lg w-fit">
                    Project: {eachProj?.project?.toUpperCase() || "N/A"}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", width: "100%" }}>
                    {projectDocs.map((eachProjDoc, index) => {
                      const fileUrl = eachProjDoc.url;
                      const fileType = getFileType(fileUrl);
                      return (
                        <div
                          key={index}
                          className="border border-solid border-slate-200 rounded-xl p-4 bg-white shadow-sm flex flex-col gap-3"
                        >
                          <div className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-2 mb-1 text-center">
                            {eachProjDoc.title}
                          </div>

                          <div className="flex justify-center items-center overflow-hidden rounded-lg bg-slate-50" style={{ height: "400px" }}>
                            {fileType === "image" ? (
                              <img
                                src={fileUrl}
                                alt="Certificate"
                                className="w-full h-full object-contain"
                              />
                            ) : fileType === "pdf" ? (
                              <iframe
                                src={`https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`}
                                width="100%"
                                height="100%"
                                style={{ border: "none", borderRadius: "8px", overflow: "hidden" }}
                                title={`PDF Project Doc ${index}`}
                              />
                            ) : (
                              <p className="text-slate-400 text-sm">Unsupported format</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Responsibility Documents */}
      {hasResponsibilityDocs && (
        <div className={formStyles.formContainer}>
          <h2 className="text-lg font-extrabold text-[#0f172a] border-b border-slate-100 pb-3 mb-4 w-full flex items-center justify-between">
            <span>Responsibilities Documents</span>
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem", width: "100%" }}>
            {responsibilities.map((eachResp, respIndex) => {
              const respDocs = eachResp?.customDocs?.map((e) => ({
                title: e?.title || "Custom Doc",
                url: e?.files?.[0]?.url || "",
              })).filter(doc => doc.url) || [];

              if (respDocs.length === 0) return null;

              return (
                <div key={respIndex} style={{ width: "100%" }}>
                  <div className="text-sm font-extrabold text-slate-700 mb-3 bg-[#eef5fb] py-2 px-3 rounded-lg w-fit">
                    Position: {eachResp?.responsibility?.toUpperCase() || "N/A"}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", width: "100%" }}>
                    {respDocs.map((eachRespDoc, index) => {
                      const fileUrl = eachRespDoc.url;
                      const fileType = getFileType(fileUrl);
                      return (
                        <div
                          key={index}
                          className="border border-solid border-slate-200 rounded-xl p-4 bg-white shadow-sm flex flex-col gap-3"
                        >
                          <div className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-2 mb-1 text-center">
                            {eachRespDoc.title}
                          </div>

                          <div className="flex justify-center items-center overflow-hidden rounded-lg bg-slate-50" style={{ height: "400px" }}>
                            {fileType === "image" ? (
                              <img
                                src={fileUrl}
                                alt="Certificate"
                                className="w-full h-full object-contain"
                              />
                            ) : fileType === "pdf" ? (
                              <iframe
                                src={`https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`}
                                width="100%"
                                height="100%"
                                style={{ border: "none", borderRadius: "8px", overflow: "hidden" }}
                                title={`PDF Responsibility Doc ${index}`}
                              />
                            ) : (
                              <p className="text-slate-400 text-sm">Unsupported format</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!hasEducationDocs && !hasWorkDocs && !hasInternshipDocs && !hasProjectDocs && !hasResponsibilityDocs && (
        <div className={formStyles.formContainer} style={{ padding: "3rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p className="text-slate-400 text-base font-semibold">No certifications or documents uploaded yet.</p>
        </div>
      )}
    </div>
  );
};

export default Page;

