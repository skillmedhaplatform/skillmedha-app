"use client";
import React from "react";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";
import { useSelector } from "react-redux";

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

  return (
    <div className="h-[calc(100%-10px)] overflow-y-scroll w-full">
      <StudentPageHeader section="Profile" title="Certifications" />
      {/* Education Certificates */}
      <div className="w-full p-4">
        {studentDetails?.educationDetails?.length > 0 && (
          <div className="text-[1.5rem] font-bold mb-4 text-[#24A058]">
            Education Certificates
          </div>
        )}

        {studentDetails?.educationDetails?.length > 0 && (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(15rem,1fr))] gap-4">
            {studentDetails?.educationDetails?.map(
              (eachEducationDetail, index) => {
                const fileUrl = eachEducationDetail?.fileUrl || "";
                const fileType = getFileType(fileUrl);
                return (
                  <div
                    key={index}
                    className="border border-solid border-[#ddd] rounded-lg p-4 bg-white shadow-[0_2px_6px_rgba(0,0,0,0.1)]"
                  >
                    <div className="font-semibold mb-2 text-center">
                      {eachEducationDetail?.type || "No Title"}
                    </div>

                    <div className="flex justify-center items-center">
                      {fileUrl ? (
                        fileType === "image" ? (
                          <img
                            src={fileUrl}
                            alt="Certificate"
                            className="w-full max-w-full max-h-[400px] object-contain"
                          />
                        ) : fileType === "pdf" ? (
                          <iframe
                            src={`https://docs.google.com/gview?url=${encodeURIComponent(
                              fileUrl
                            )}&embedded=true`}
                            width="100%"
                            height="400px"
                            className="w-full max-w-full max-h-[400px] object-contain"
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
        <div className="w-full p-4">
          <div className="text-[1.5rem] font-bold mb-4 text-[#24A058]">Work Experiences</div>
          {studentDetails?.experiences
            ?.filter((e) => e?.type?.toLowerCase() === "work")
            ?.map((eachExp, expIndex) => {
              const customDocsArr =
                eachExp?.customDocs?.map((e) => ({
                  title: e?.title || "Custom Doc",
                  url: e?.files?.[0]?.url || "",
                })) || [];

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
                <div key={expIndex} className="w-full p-4">
                  <div className="text-[1.2rem] font-bold mb-2">
                    Company : {eachExp?.company?.toUpperCase() || "N/A"}
                  </div>

                  <div className="grid grid-cols-[repeat(auto-fit,minmax(15rem,1fr))] gap-4">
                    {experienceDocs?.map((eachExpDoc, index) => {
                      const fileUrl = eachExpDoc?.url || "";
                      const fileType = getFileType(fileUrl);
                      return (
                        <div
                          key={index}
                          className="border border-solid border-[#ddd] rounded-lg p-4 bg-white shadow-[0_2px_6px_rgba(0,0,0,0.1)]"
                        >
                          <div className="font-semibold mb-2 text-center">
                            {eachExpDoc?.title || "No Title"}
                          </div>

                          <div className="flex justify-center items-center">
                            {fileUrl ? (
                              fileType === "image" ? (
                                <img
                                  src={fileUrl}
                                  alt="Certificate"
                                  className="w-full max-w-full max-h-[400px] object-contain"
                                />
                              ) : fileType === "pdf" ? (
                                <iframe
                                  src={`https://docs.google.com/gview?url=${encodeURIComponent(
                                    fileUrl
                                  )}&embedded=true`}
                                  width="100%"
                                  height="400px"
                                  className="w-full max-w-full max-h-[400px] object-contain"
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
        <div className="w-full p-4">
          <div className="text-[1.5rem] font-bold mb-4 text-[#24A058]">Internships</div>
          {studentDetails?.experiences
            ?.filter((e) => e?.type?.toLowerCase() !== "work")
            ?.map((eachExp, intIndex) => {
              const customDocsArr =
                eachExp?.customDocs?.map((e) => ({
                  title: e?.title || "Custom Doc",
                  url: e?.files?.[0]?.url || "",
                })) || [];

              const experienceDocs = [
                {
                  title: "Certificate",
                  url: eachExp?.certificate?.[0]?.url || "",
                },
                ...customDocsArr,
              ];

              return (
                <div key={intIndex} className="w-full p-4">
                  <div className="text-[1.2rem] font-bold mb-2">
                    Company : {eachExp?.company?.toUpperCase() || "N/A"}
                  </div>

                  <div className="grid grid-cols-[repeat(auto-fit,minmax(15rem,1fr))] gap-4">
                    {experienceDocs?.map((eachExpDoc, index) => {
                      const fileUrl = eachExpDoc?.url || "";
                      const fileType = getFileType(fileUrl);
                      return (
                        <div
                          key={index}
                          className="border border-solid border-[#ddd] rounded-lg p-4 bg-white shadow-[0_2px_6px_rgba(0,0,0,0.1)]"
                        >
                          <div className="font-semibold mb-2 text-center">
                            {eachExpDoc?.title || "No Title"}
                          </div>

                          <div className="flex justify-center items-center">
                            {fileUrl ? (
                              fileType === "image" ? (
                                <img
                                  src={fileUrl}
                                  alt="Certificate"
                                  className="w-full max-w-full max-h-[400px] object-contain"
                                />
                              ) : fileType === "pdf" ? (
                                <iframe
                                  src={`https://docs.google.com/gview?url=${encodeURIComponent(
                                    fileUrl
                                  )}&embedded=true`}
                                  width="100%"
                                  height="400px"
                                  className="w-full max-w-full max-h-[400px] object-contain"
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
        <div className="w-full p-4">
          <div className="text-[1.5rem] font-bold mb-4 text-[#24A058]">Projects</div>
          {studentDetails?.projects?.map((eachProj, projIndex) => {
            const customDocsArr =
              eachProj?.customDocs?.map((e) => ({
                title: e?.title || "Custom Doc",
                url: e?.files?.[0]?.url || "",
              })) || [];
            const projectDocs = [...customDocsArr];

            return (
              <div key={projIndex} className="w-full p-4">
                <div className="text-[1.2rem] font-bold mb-2">
                  Company : {eachProj?.company?.toUpperCase() || "N/A"}
                </div>

                <div className="grid grid-cols-[repeat(auto-fit,minmax(15rem,1fr))] gap-4">
                  {projectDocs?.map((eachProjDoc, index) => {
                    const fileUrl = eachProjDoc?.url || "";
                    const fileType = getFileType(fileUrl);
                    return (
                      <div
                        key={index}
                        className="border border-solid border-[#ddd] rounded-lg p-4 bg-white shadow-[0_2px_6px_rgba(0,0,0,0.1)]"
                      >
                        <div className="font-semibold mb-2 text-center">
                          {eachProjDoc?.title || "No Title"}
                        </div>

                        <div className="flex justify-center items-center">
                          {fileUrl ? (
                            fileType === "image" ? (
                              <img
                                src={fileUrl}
                                alt="Certificate"
                                className="w-full max-w-full max-h-[400px] object-contain"
                              />
                            ) : fileType === "pdf" ? (
                              <iframe
                                src={`https://docs.google.com/gview?url=${encodeURIComponent(
                                  fileUrl
                                )}&embedded=true`}
                                width="100%"
                                height="400px"
                                className="w-full max-w-full max-h-[400px] object-contain"
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
        <div className="w-full p-4">
          <div className="text-[1.5rem] font-bold mb-4 text-[#24A058]">Responsibilities</div>
          {studentDetails?.responsibilities?.map((eachResp, respIndex) => {
            const customDocsArr =
              eachResp?.customDocs?.map((e) => ({
                title: e?.title || "Custom Doc",
                url: e?.files?.[0]?.url || "",
              })) || [];
            const respDocs = [...customDocsArr];

            return (
              <div key={respIndex} className="w-full p-4">
                <div className="text-[1.2rem] font-bold mb-2">
                  Company : {eachResp?.company?.toUpperCase() || "N/A"}
                </div>

                <div className="grid grid-cols-[repeat(auto-fit,minmax(15rem,1fr))] gap-4">
                  {respDocs?.map((eachRespDoc, index) => {
                    const fileUrl = eachRespDoc?.url || "";
                    const fileType = getFileType(fileUrl);
                    return (
                      <div
                        key={index}
                        className="border border-solid border-[#ddd] rounded-lg p-4 bg-white shadow-[0_2px_6px_rgba(0,0,0,0.1)]"
                      >
                        <div className="font-semibold mb-2 text-center">
                          {eachRespDoc?.title || "No Title"}
                        </div>

                        <div className="flex justify-center items-center">
                          {fileUrl ? (
                            fileType === "image" ? (
                              <img
                                src={fileUrl}
                                alt="Certificate"
                                className="w-full max-w-full max-h-[400px] object-contain"
                              />
                            ) : fileType === "pdf" ? (
                              <iframe
                                src={`https://docs.google.com/gview?url=${encodeURIComponent(
                                  fileUrl
                                )}&embedded=true`}
                                width="100%"
                                height="400px"
                                className="w-full max-w-full max-h-[400px] object-contain"
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
  );
};

export default Page;
