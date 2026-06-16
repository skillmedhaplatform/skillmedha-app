"use client";
import React from "react";
import certificationStyles from "./page.module.scss";
import { useSelector } from "react-redux";
import { useParams } from "next/navigation";
import PageHeader from "@/modules/tpo/components/PageHeader";
const Page = () => {
  const studentDetails = useSelector(
    (state) => state.singleStudentDetails.singleStudent.value?.data
  );
  const params = useParams();
  const { studentId } = params;
  const getFileType = (fileUrl) => {
    const extension = fileUrl?.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(extension)) {
      return "image";
    }
    if (extension === "pdf" || extension === "docx" || extension === "doc") {
      return "pdf";
    }
    return "unknown";
  };

  return (
    <>
      <PageHeader title="Certifications" />

      <div className={certificationStyles.container}>
        <div className={certificationStyles.eachCard}>
          {studentDetails?.educationDetails?.length > 0 && (
            <div className={certificationStyles.headTitle}>
              Education Certificates
            </div>
          )}

          {studentDetails?.educationDetails?.length > 0 && (
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
          )}
        </div>

        {/* Work Experience */}
        {studentDetails?.experiences?.length > 0 && (
          <div className={certificationStyles.eachCard}>
            <div className={certificationStyles.headTitle}>
              Work Experiences
            </div>
            {studentDetails?.experiences
              ?.filter((e) => e.type?.toLowerCase() == "work")
              ?.map((eachExp) => {
                const customDocsArr = eachExp?.customDocs?.map((e) => {
                  return {
                    title: e.title,
                    url: e?.files?.[0]?.url || "",
                  };
                });
                const experienceDocs = [
                  {
                    title: "Joining Files",
                    url: eachExp?.joiningFiles?.[0]?.url,
                  },
                  {
                    title: "Relieving Files",
                    url: eachExp?.relievingFiles?.[0]?.url,
                  },
                  ...customDocsArr,
                ];

                return (
                  <div className={certificationStyles.eachCard}>
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
              ?.map((eachExp) => {
                const customDocsArr = eachExp?.customDocs?.map((e) => {
                  return {
                    title: e.title,
                    url: e?.files?.[0]?.url || "",
                  };
                });
                const experienceDocs = [
                  {
                    title: "Certificate",
                    url: eachExp?.certificate?.[0]?.url,
                  },

                  ...customDocsArr,
                ];

                return (
                  <div className={certificationStyles.eachCard}>
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
            {studentDetails?.projects?.map((eachProj) => {
              const customDocsArr = eachProj?.customDocs?.map((e) => {
                return {
                  title: e.title,
                  url: e?.files?.[0]?.url || "",
                };
              });
              const projectDocs = [...customDocsArr];

              return (
                <div className={certificationStyles.eachCard}>
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
            {studentDetails?.responsibilities?.map((eachProj) => {
              const customDocsArr = eachProj?.customDocs?.map((e) => {
                return {
                  title: e.title,
                  url: e?.files?.[0]?.url || "",
                };
              });
              const projectDocs = [...customDocsArr];

              return (
                <div className={certificationStyles.eachCard}>
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
    </>

  );
};

export default Page;
