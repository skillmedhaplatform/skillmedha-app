"use client";
export const dynamic = "force-dynamic";
import React, { useState } from "react";
import { Collapse } from "antd";
import updatedStyles from "./page.module.scss";
import { restUrl } from "@/utils/universalUtils/urls";
import { getLstorage } from "@/utils/universalUtils/windowMW";

const { Panel } = Collapse;
const Page = () => {
  const [file, setFile] = useState(null);
  const [uploadResult, setUploadResult] = useState([]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(
        `${restUrl}/bulkUploadPracQuestions`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${getLstorage("token")}`,
          },
        }
      );

      const data = await res.json();

      setUploadResult(data?.internships);
      console.log("Uploaded Data:", data);
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  return (
    <div className={updatedStyles.container}>
        <h2 className="text-xl font-bold mb-4">Bulk Upload Internships</h2>
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
          className="mb-4"
        />
        <button
          onClick={handleUpload}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Upload Excel
        </button>

        {/* {uploadResult && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Uploaded Data:</h3>
            <pre className="bg-gray-100 p-2 rounded mt-2 overflow-auto max-h-96">
              {JSON.stringify(uploadResult, null, 2)}
            </pre>
          </div>
        )} */}

        {uploadResult
          ?.filter((e) => !e.flagged)
          .map((eachQuestion, questionIndex) => {
            return (
              <div
                key={eachQuestion._id}
                className={updatedStyles.questionCard}
              >
                <Collapse
                  expandIcon={null}
                  style={{ backgroundColor: "#EFEEFC" }}
                >
                  <Panel
                    key={questionIndex}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    header={
                      <div
                        className={updatedStyles.eachQuestionHeader}
                        style={{
                          backgroundColor: "#EFEEFC",
                          color: "#9087E5",
                        }}
                      >
                        {/* <input
                          type="checkbox"
                          checked={selectedQuestions.some(
                            (q) => q._id === eachQuestion._id
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectQuestion(eachQuestion);
                          }}
                        /> */}

                        <div>
                          Question {questionIndex + 1}{" "}
                          {/* {eachQuestion.flagged
                                  ? "🚩"
                                  : eachQuestion?.verified
                                  ? "✅"
                                  : "🟡"} */}
                        </div>

                        {/* <span onClick={(e) => e.stopPropagation()}>
                                <Dropdown
                                  menu={{ items: menuItems }}
                                  trigger={["click"]}
                                >
                                  <EllipsisOutlined
                                    style={{
                                      fontSize: "24px",
                                      cursor: "pointer",
                                      rotate: "90deg",
                                    }}
                                  />
                                </Dropdown>
                              </span> */}
                      </div>
                    }
                  >
                    {eachQuestion.questionTranslations?.map(
                      (eachTranslation, translationIndex) => (
                        <div
                          key={translationIndex}
                          className={updatedStyles.eachTranslationCard}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* <h2>
                                Language:{" "}
                                {allLanguages.find(
                                  (lang) =>
                                    lang.key === eachTranslation.language
                                )?.value || "Unknown"}
                              </h2> */}
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            {/* <h2>
                              Language:{" "}
                              {allLanguages.find(
                                (lang) => lang.key === eachTranslation.language
                              )?.value || "Unknown"}
                            </h2> */}

                            <p
                              style={
                                eachTranslation?.flagged
                                  ? {
                                      border: "1px solid",
                                      padding: "0rem 2rem",
                                      borderRadius: ".5rem",
                                      backgroundColor: "red",
                                      color: "white",
                                    }
                                  : eachTranslation?.verified
                                  ? {
                                      border: "1px solid",
                                      padding: "0rem 2rem",
                                      borderRadius: ".5rem",
                                      backgroundColor: "green",
                                    }
                                  : {
                                      border: "1px solid",
                                      padding: "0rem 2rem",
                                      borderRadius: ".5rem",
                                      backgroundColor: "yellow",
                                    }
                              }
                            >
                              {eachTranslation?.flagged
                                ? "Flagged"
                                : eachTranslation?.verified
                                ? "Verified"
                                : "Not Verified"}
                            </p>
                          </div>

                          {eachTranslation?.question?.comp && (
                            <div>
                              <h2>Comprehension :</h2>
                              <div
                                className={updatedStyles.eachQuestion}
                                dangerouslySetInnerHTML={{
                                  __html: _.unescape(
                                    eachTranslation?.question?.comp
                                  ),
                                }}
                              ></div>
                            </div>
                          )}
                          <br />
                          <h2>Question :</h2>
                          <div
                            className={updatedStyles.eachQuestion}
                            dangerouslySetInnerHTML={{
                              __html: _.unescape(
                                eachTranslation?.question?.value
                              ),
                            }}
                          ></div>

                          {eachTranslation?.question?.options?.map(
                            (eachOption, index) => (
                              <div
                                key={index}
                                className={updatedStyles.optionContainer}
                              >
                                <span>
                                  {String.fromCharCode(
                                    97 + index
                                  ).toUpperCase()}
                                  .
                                </span>
                                <div
                                  className={updatedStyles.eachOption}
                                  dangerouslySetInnerHTML={{
                                    __html: _.unescape(eachOption.value),
                                  }}
                                ></div>
                              </div>
                            )
                          )}
                          <div
                            className={updatedStyles.right}
                            style={{ marginTop: "2rem" }}
                          >
                            <h2>Answer :</h2>
                            <div
                              className={updatedStyles.eachQuestion}
                              dangerouslySetInnerHTML={{
                                __html: _.unescape(
                                  eachQuestion?.answer?.answerTranslations?.value?.value
                                ),
                              }}
                            ></div>
                          </div>
                        </div>
                      )
                    )}
                  </Panel>
                </Collapse>
              </div>
            );
          })}
          <div style={{height:"5rem"}}></div>
      </div>
  );
};

export default Page;
