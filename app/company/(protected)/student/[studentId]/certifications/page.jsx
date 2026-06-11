"use client";
import React from "react";
import certificationStyles from "./page.module.scss";
import { useSelector } from "react-redux";
import { useParams } from "next/navigation";
import StudentData from "../page";

const Page = () => {
  const studentDetails = useSelector(
    (state) => state.user.singleStudent?.value?.data?.student
  );
  const params = useParams();
  const { studentId } = params;

  const getFileType = (fileUrl) => {
    const extension = fileUrl?.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(extension)) {
      return "image";
    }
    if (["pdf", "docx", "doc"].includes(extension)) {
      return "pdf";
    }
    return "unknown";
  };

  return (
    <StudentData>
      <div className={certificationStyles.container}>
        {/* Education Certificates */}
        {studentDetails?.educationDetails?.length > 0 && (
          <div className={certificationStyles.eachCard}>
            <div className={certificationStyles.headTitle}>
              Education Certificates
            </div>
            <div className={certificationStyles.cardsGrid}>
              {studentDetails?.educationDetails?.map(
                (eachEducationDetail, index) => {
                  const fileUrl = eachEducationDetail?.fileUrl;
                  const fileType = getFileType(fileUrl);
                  return (
                    <div
                      key={index}
                      className={certificationStyles.eachCertification}
                    >
                      <div className={certificationStyles.certficateTitle}>
                        {eachEducationDetail?.type}
                      </div>
                      <div className={certificationStyles.fileContainer}>
                        {fileUrl ? (
                          fileType === "image" ? (
                            <img
                              src={fileUrl}
                              alt="Certificate"
                              className={certificationStyles.filePreview}
                            />
                          ) : fileType === "pdf" ? (
                            <iframe
                              src={`https://docs.google.com/gview?url=${encodeURIComponent(
                                fileUrl
                              )}&embedded=true`}
                              width="100%"
                              height="400px"
                              className={certificationStyles.filePreview}
                              style={{ border: "none" }}
                              title={`PDF Certificate ${index}`}
                            />
                          ) : (
                            <p>Unsupported file format</p>
                          )
                        ) : (
                          <p>No file available</p>
                        )}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        )}

        {/* Work Experience */}
        {studentDetails?.experiences?.length > 0 && (
          <div className={certificationStyles.eachCard}>
            <div className={certificationStyles.headTitle}>
              Work Experiences
            </div>
            {studentDetails?.experiences
              ?.filter((e) => e.type?.toLowerCase() === "work")
              ?.map((eachExp, idx) => {
                const customDocsArr = (eachExp?.customDocs || []).map((e) => ({
                  title: e?.title,
                  url: e?.files?.[0]?.url || "",
                }));

                const experienceDocs = [
                  {
                    title: "Joining Files",
                    url: eachExp?.joiningFiles?.[0]?.url || "",
                  },
                  {
                    title: "Relieving Files",
                    url: eachExp?.relievingFiles?.[0]?.url || "",
                  },
                  ...customDocsArr,
                ];

                return (
                  <div key={idx} className={certificationStyles.eachCard}>
                    <div className={certificationStyles.headTitle1}>
                      Company : {eachExp?.company?.toUpperCase()}
                    </div>

                    <div className={certificationStyles.cardsGrid}>
                      {experienceDocs?.map((eachExpDoc, index) => {
                        const fileUrl = eachExpDoc?.url;
                        const fileType = getFileType(fileUrl);
                        return (
                          <div
                            key={index}
                            className={certificationStyles.eachCertification}
                          >
                            <div
                              className={certificationStyles.certficateTitle}
                            >
                              {eachExpDoc?.title}
                            </div>
                            <div className={certificationStyles.fileContainer}>
                              {fileUrl ? (
                                fileType === "image" ? (
                                  <img
                                    src={fileUrl}
                                    alt="Certificate"
                                    className={certificationStyles.filePreview}
                                  />
                                ) : fileType === "pdf" ? (
                                  <iframe
                                    src={`https://docs.google.com/gview?url=${encodeURIComponent(
                                      fileUrl
                                    )}&embedded=true`}
                                    width="100%"
                                    height="400px"
                                    className={certificationStyles.filePreview}
                                    style={{ border: "none" }}
                                    title={`PDF Certificate ${index}`}
                                  />
                                ) : (
                                  <p>Unsupported file format</p>
                                )
                              ) : (
                                <p>No file available</p>
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
        )}

        {/* Internships */}
        {studentDetails?.experiences?.length > 0 && (
          <div className={certificationStyles.eachCard}>
            <div className={certificationStyles.headTitle}>Internships</div>
            {studentDetails?.experiences
              ?.filter((e) => e.type?.toLowerCase() !== "work")
              ?.map((eachExp, idx) => {
                const customDocsArr = (eachExp?.customDocs || []).map((e) => ({
                  title: e?.title,
                  url: e?.files?.[0]?.url || "",
                }));

                const experienceDocs = [
                  {
                    title: "Certificate",
                    url: eachExp?.certificate?.[0]?.url || "",
                  },
                  ...customDocsArr,
                ];

                return (
                  <div key={idx} className={certificationStyles.eachCard}>
                    <div className={certificationStyles.headTitle1}>
                      Company : {eachExp?.company?.toUpperCase()}
                    </div>

                    <div className={certificationStyles.cardsGrid}>
                      {experienceDocs?.map((eachExpDoc, index) => {
                        const fileUrl = eachExpDoc?.url;
                        const fileType = getFileType(fileUrl);
                        return (
                          <div
                            key={index}
                            className={certificationStyles.eachCertification}
                          >
                            <div
                              className={certificationStyles.certficateTitle}
                            >
                              {eachExpDoc?.title}
                            </div>
                            <div className={certificationStyles.fileContainer}>
                              {fileUrl ? (
                                fileType === "image" ? (
                                  <img
                                    src={fileUrl}
                                    alt="Certificate"
                                    className={certificationStyles.filePreview}
                                  />
                                ) : fileType === "pdf" ? (
                                  <iframe
                                    src={`https://docs.google.com/gview?url=${encodeURIComponent(
                                      fileUrl
                                    )}&embedded=true`}
                                    width="100%"
                                    height="400px"
                                    className={certificationStyles.filePreview}
                                    style={{ border: "none" }}
                                    title={`PDF Certificate ${index}`}
                                  />
                                ) : (
                                  <p>Unsupported file format</p>
                                )
                              ) : (
                                <p>No file available</p>
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
        )}

        {/* Projects */}
        {studentDetails?.projects?.length > 0 && (
          <div className={certificationStyles.eachCard}>
            <div className={certificationStyles.headTitle}>Projects</div>
            {studentDetails?.projects?.map((eachProj, idx) => {
              const customDocsArr = (eachProj?.customDocs || []).map((e) => ({
                title: e?.title,
                url: e?.files?.[0]?.url || "",
              }));

              const projectDocs = [...customDocsArr];

              return (
                <div key={idx} className={certificationStyles.eachCard}>
                  <div className={certificationStyles.headTitle1}>
                    Company : {eachProj?.company?.toUpperCase()}
                  </div>

                  <div className={certificationStyles.cardsGrid}>
                    {projectDocs?.map((eachProjDoc, index) => {
                      const fileUrl = eachProjDoc?.url;
                      const fileType = getFileType(fileUrl);
                      return (
                        <div
                          key={index}
                          className={certificationStyles.eachCertification}
                        >
                          <div className={certificationStyles.certficateTitle}>
                            {eachProjDoc?.title}
                          </div>
                          <div className={certificationStyles.fileContainer}>
                            {fileUrl ? (
                              fileType === "image" ? (
                                <img
                                  src={fileUrl}
                                  alt="Certificate"
                                  className={certificationStyles.filePreview}
                                />
                              ) : fileType === "pdf" ? (
                                <iframe
                                  src={`https://docs.google.com/gview?url=${encodeURIComponent(
                                    fileUrl
                                  )}&embedded=true`}
                                  width="100%"
                                  height="400px"
                                  className={certificationStyles.filePreview}
                                  style={{ border: "none" }}
                                  title={`PDF Certificate ${index}`}
                                />
                              ) : (
                                <p>Unsupported file format</p>
                              )
                            ) : (
                              <p>No file available</p>
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
        )}

        {/* Responsibilities */}
        {studentDetails?.responsibilities?.length > 0 && (
          <div className={certificationStyles.eachCard}>
            <div className={certificationStyles.headTitle}>
              Responsibilities
            </div>
            {studentDetails?.responsibilities?.map((eachResp, idx) => {
              const customDocsArr = (eachResp?.customDocs || []).map((e) => ({
                title: e?.title,
                url: e?.files?.[0]?.url || "",
              }));

              const respDocs = [...customDocsArr];

              return (
                <div key={idx} className={certificationStyles.eachCard}>
                  <div className={certificationStyles.headTitle1}>
                    Company : {eachResp?.company?.toUpperCase()}
                  </div>

                  <div className={certificationStyles.cardsGrid}>
                    {respDocs?.map((eachRespDoc, index) => {
                      const fileUrl = eachRespDoc?.url;
                      const fileType = getFileType(fileUrl);
                      return (
                        <div
                          key={index}
                          className={certificationStyles.eachCertification}
                        >
                          <div className={certificationStyles.certficateTitle}>
                            {eachRespDoc?.title}
                          </div>
                          <div className={certificationStyles.fileContainer}>
                            {fileUrl ? (
                              fileType === "image" ? (
                                <img
                                  src={fileUrl}
                                  alt="Certificate"
                                  className={certificationStyles.filePreview}
                                />
                              ) : fileType === "pdf" ? (
                                <iframe
                                  src={`https://docs.google.com/gview?url=${encodeURIComponent(
                                    fileUrl
                                  )}&embedded=true`}
                                  width="100%"
                                  height="400px"
                                  className={certificationStyles.filePreview}
                                  style={{ border: "none" }}
                                  title={`PDF Certificate ${index}`}
                                />
                              ) : (
                                <p>Unsupported file format</p>
                              )
                            ) : (
                              <p>No file available</p>
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
        )}
      </div>
    </StudentData>
  );
};

export default Page;
