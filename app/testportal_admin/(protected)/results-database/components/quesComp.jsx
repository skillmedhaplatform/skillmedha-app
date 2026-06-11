"use client";
import React, { useRef } from "react";
import resultStyles from "../styles/results.module.scss";
import { FlagFilled } from "@ant-design/icons";
import { Tooltip } from "antd";
import { parseIfJson } from "@/utils/windowMW";

export default function QuesComp({
  e,
  i,
  currentTestRes,
  testRes,
  questionNo,
  flagged,
}) {
  const shortAns = useRef({});

  const options = Object.keys(e?.questionContent)
    .filter((qe) => qe?.includes("option"))
    .map((op) => ({ [op]: e?.questionContent[op] }))
    .sort((a, b) => Object.keys(a)[0].slice(-1) - Object.keys(b)[0].slice(-1));

  const toLowerFun = (arr) =>
    arr?.map((item) => {
      if (item) return item;
      else return;
    });

  const correctAnswers = () => {
    if (Object.keys(e?.answer)[0] === "truefalse") {
      return [e?.answer?.truefalse?.toString()];
    }
    if (Object.keys(e?.answer)[0] === "shortpara") {
      return [e?.answer?.shortpara?.toString()];
    }
    if (Object.keys(e?.answer)[0] == "multipleChoice") {
      return Object.entries(e?.answer[Object.keys(e?.answer)[0]])
        .filter(([key, value]) => value === true)
        .map(([key]) => key.toLowerCase());
    } else {
      const singleChoice = e?.answer?.singleChoice;

      let answer;

      if (typeof singleChoice === "string") {
        answer = singleChoice?.toLowerCase();
      } else if (typeof singleChoice === "object") {
        const key = Object.keys(singleChoice).find(
          (k) => singleChoice[k] === true
        );
        answer = key?.toLowerCase();
      }
      return answer;
    }
  };

  const studentAnswers = currentTestRes[e?._id]?.answers;
  const quesTime = currentTestRes[e?._id]?.timeTaken;
  let correctScore = 0,
    partialScore = 0,
    negativeScore = 0,
    questionScore = e?.questionScore,
    bonusScore = 0,
    partialNegativeScore = 0;

  if (e?.scoreSettings?.scoreType == "fullScore") {
    if (e?.scoreSettings?.pointsForIncorrectAns)
      negativeScore = e?.scoreSettings?.pointsForIncorrectAns;
    if (e?.scoreSettings?.pointsForCorrectAns)
      correctScore = e?.scoreSettings?.pointsForCorrectAns;
  }
  if (e?.scoreSettings?.scoreType == "partialScore") {
    if (e?.scoreSettings?.PointsForEachCorrectAnswer)
      partialScore = e?.scoreSettings?.PointsForEachCorrectAnswer;
    if (e?.scoreSettings?.bonusPointsForAllCorrect)
      bonusScore = e?.scoreSettings?.bonusPointsForAllCorrect;
    if (e?.scoreSettings?.partialPointsForEachInCorrectAns)
      partialNegativeScore = e?.scoreSettings?.partialPointsForEachInCorrectAns;
    if (e?.scoreSettings?.pointsForEachInCorrectAns)
      negativeScore = e?.scoreSettings?.pointsForEachInCorrectAns;
  }
  const singleQuestion = testRes?.response[e?._id];

  // Helper function to get programming language from language_id
  const getLanguageName = (languageId) => {
    const languageMap = {
      63: "javascript",
      71: "python",
      54: "cpp",
      62: "java",
      51: "csharp",
      // Add more mappings as needed
    };
    return languageMap[languageId] || "javascript";
  };

  // Helper function to clean HTML from test case strings
  const cleanHtmlFromTestCase = (htmlString) => {
    if (!htmlString) return "";
    // Remove quotes and HTML tags, then decode HTML entities
    const cleaned = htmlString
      .replace(/^"|"$/g, "") // Remove surrounding quotes
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .trim();
    return cleaned;
  };

  return (
    <div key={e?._id} className={resultStyles.questionContainer}>
      {/* <p>Time Taken : {quesTime}</p> */}
      <div className={resultStyles.questionHeader}>
        <p className={resultStyles.sno} id={`question_${questionNo}`}>
          Question {questionNo}
          {flagged && (
            <Tooltip
              placement="top"
              title={flagged?.flag?.map((e) => (
                <p>{e}</p>
              ))}
            >
              <FlagFilled className={resultStyles.flaggedIcon} />
            </Tooltip>
          )}
        </p>
        <div className={resultStyles.typeContainer}>
          <p className={resultStyles.type}>
            <strong>{""}</strong>
            {e?.questionType}
          </p>
          {e?.questionCategory && e?.questionCategory?.length > 0 && e?.questionCategory[0]?.name ? (
            <span className={resultStyles.categoryBadge}>
              {e.questionCategory[0].name}
            </span>
          ) : null}
        </div>
        <div className={resultStyles.scoreContainer}>
          {correctScore ? (
            <span className={resultStyles.queScore}>
              Que Score: {+questionScore || +correctScore}
            </span>
          ) : (
            ""
          )}
          &nbsp;&nbsp;
          {partialScore ? (
            <span className={resultStyles.partialScore}>
              Partial Score: {+partialScore}
            </span>
          ) : (
            ""
          )}
          &nbsp;&nbsp;
          {bonusScore ? (
            <span className={resultStyles.bonusScore}>
              Bonus Points: {+bonusScore}
            </span>
          ) : (
            ""
          )}
          &nbsp;&nbsp;
          {negativeScore ? (
            <span className={resultStyles.negScore}>
              Negative Score: {+negativeScore}
            </span>
          ) : (
            ""
          )}
          {partialNegativeScore ? (
            <span className={resultStyles.negScore}>
              Partial Negative Score: {+partialNegativeScore}
            </span>
          ) : (
            ""
          )}
        </div>
      </div>
      <div
        className={resultStyles.questionText}
        dangerouslySetInnerHTML={{
          __html: parseIfJson(e?.questionContent?.question),
        }}
      ></div>
      <div className={resultStyles.optionsContainer}>
        {(e?.questionType == "Single Choice" ||
          e?.questionType == "Audio Question" ||
          e?.questionType == "Video Question" ||
          e?.questionType == "Multiple Choice") &&
          options.map((opt, i) => {
            const key = Object.keys(opt)[0];
            const isCorrect = correctAnswers()?.includes(key.toLowerCase());

            const isSelected =
              Array.isArray(studentAnswers) &&
              studentAnswers
                .map((stAns) => stAns?.toLowerCase())
                .includes(key.toLowerCase());
            let clsName = "";
            if (isCorrect && isSelected) {
              clsName = "correct_selected";
            } else if (
              isCorrect &&
              Array.isArray(studentAnswers) &&
              !studentAnswers.length &&
              quesTime &&
              currentTestRes[e?._id]?.status == "notanswered"
            ) {
              clsName = "correct";
            } else if (!isCorrect && isSelected) {
              clsName = "incorrect";
            } else if (
              Array.isArray(studentAnswers) &&
              !studentAnswers.length &&
              quesTime
            ) {
              clsName = "notanswered";
            } else if (!Array.isArray(studentAnswers) && !quesTime) {
              clsName = "unattempted";
            }
            if (currentTestRes[e?._id]?.status == "notanswered")
              clsName = "notanswered";
            return (
              <label
                key={i}
                className={`${resultStyles.optionLable} ${resultStyles[clsName]}`}
              >
                <div className={resultStyles.options_div}>
                  <span>
                    <span className={resultStyles.optionsOrderChar}>
                      {String.fromCharCode(65 + i)}{" "}
                    </span>
                  </span>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: parseIfJson(opt[key]),
                    }}
                    className={resultStyles.optionsOrderChar}
                  ></span>
                </div>
                {e?.scoreSettings?.scoreType == "partialScore" && (
                  <span className={resultStyles.points_span}>
                    {e?.scoreSettings?.scoreType == "partialScore" &&
                      isSelected &&
                      isCorrect
                      ? `Points : +${+partialScore}`
                      : `Points : ${isSelected && !isCorrect
                        ? testRes?.response[e?._id]?.negativeScore
                        : 0
                      }`}
                  </span>
                )}
              </label>
            );
          })}

        {e?.questionType == "True - False" &&
          ["True", "False"]?.map((op, i) => {
            const key = op;

            const isCorrect = correctAnswers()?.includes(key.toLowerCase());
            const isSelected =
              Array.isArray(studentAnswers) &&
              studentAnswers[0]?.toLowerCase()?.includes(key.toLowerCase());
            let clsName = "";

            if (isCorrect && isSelected) {
              clsName = "correct_selected";
            } else if (
              isCorrect &&
              currentTestRes[e?._id]?.status == "notanswered" &&
              !Array.isArray(studentAnswers) &&
              !quesTime
            ) {
              clsName = "correct";
            } else if (!isCorrect && isSelected) {
              clsName = "incorrect";
            } else if (!Array.isArray(studentAnswers) && !quesTime) {
              clsName = "unattempted";
            }
            if (currentTestRes[e?._id]?.status == "notanswered")
              clsName = "notanswered";
            return (
              <label
                key={i}
                className={`${resultStyles.optionLable} ${resultStyles[clsName]}`}
              >
                <span className={resultStyles.optionValue}>{" " + op}</span>
              </label>
            );
          })}

        {e?.questionType == "Short Paragraph" && (
          <div className={resultStyles.paraanswers_div}>
            <h3
              className={`${resultStyles.shortParaAnsLabel} ${testRes?.response[e?._id]?.status == "notanswered" &&
                testRes?.response[e?._id]?.correctScore == 0 &&
                testRes?.response[e?._id]?.negativeScore == 0 &&
                !testRes?.response[e?._id]?.answers?.length
                ? resultStyles.notanswered
                  ? resultStyles.unattempted
                    ? resultStyles.incorrect
                    : resultStyles.correct
                  : resultStyles.notanswered
                : ""
                }`}
            >
              Student Answer
            </h3>

            <div
              className={`${resultStyles.shortParaAns} ${testRes?.response[e?._id]?.correctScore == 0 &&
                testRes?.response[e?._id]?.negativeScore == 0 &&
                !testRes?.response[e?._id]?.answers?.length &&
                testRes?.response[e?._id]?.status == "notanswered"
                ? resultStyles.notanswered
                  ? resultStyles.unattempted
                    ? resultStyles.incorrect
                    : resultStyles.correct
                  : resultStyles.unattempted
                : ""
                }`}
            >
              {currentTestRes[e?._id]?.answers}
            </div>
            <h3>Actual Answer</h3>
            {e?.answer?.shortpara && (
              <span
                dangerouslySetInnerHTML={{
                  __html: parseIfJson(e?.answer?.shortpara),
                }}
                ref={(elem) => (shortAns.current[e?._id] = elem)}
              ></span>
            )}
          </div>
        )}

        {/* NEW: Coding Question Section */}
        {e?.questionType == "Coding Question" && (
          <div className={resultStyles.codingQuestionContainer}>
            {/* Test Cases Display */}
            {e?.questionContent?.testCases &&
              e.questionContent.testCases.length > 0 && (
                <div className={resultStyles.testCasesSection}>
                  <h3 className={resultStyles.testCasesTitle}>Test Cases:</h3>
                  {e.questionContent.testCases.map((testCase, index) => (
                    <div
                      key={testCase._id || index}
                      className={resultStyles.testCaseItem}
                    >
                      <h4 className={resultStyles.testCaseHeader}>
                        Test Case {index + 1}:
                      </h4>

                      <div className={resultStyles.testCaseContent}>
                        <div className={resultStyles.inputSection}>
                          <strong>Input:</strong>
                          <pre className={resultStyles.codeBlock}>
                            <code>{cleanHtmlFromTestCase(testCase.input)}</code>
                          </pre>
                        </div>

                        <div className={resultStyles.outputSection}>
                          <strong>Expected Output:</strong>
                          <pre className={resultStyles.codeBlock}>
                            <code>
                              {cleanHtmlFromTestCase(testCase.expectedOutput)}
                            </code>
                          </pre>
                        </div>

                        {testCase.explanation && (
                          <div className={resultStyles.explanationSection}>
                            <strong>Explanation:</strong>
                            <div
                              className={resultStyles.explanationText}
                              dangerouslySetInnerHTML={{
                                __html: parseIfJson(testCase.explanation),
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

            {/* Student's Code Submission */}
            <div className={resultStyles.studentCodeSection}>
              <h3 className={resultStyles.studentCodeTitle}>
                Student's Solution:
                {studentAnswers?.languageKey && (
                  <span className={resultStyles.languageBadge}>
                    {studentAnswers.languageKey.key.toUpperCase()}
                  </span>
                )}
              </h3>

              {studentAnswers?.code ? (
                <div className={resultStyles.codeSubmissionContainer}>
                  <pre className={resultStyles.studentCodeBlock}>
                    <code
                      className={`language-${getLanguageName(
                        studentAnswers?.language_id
                      )}`}
                    >
                      {studentAnswers.code}
                    </code>
                  </pre>

                  {/* AI Suggestions/Test Results */}
                  {studentAnswers?.aisuggestion &&
                    studentAnswers.aisuggestion.length > 0 && (
                      <div className={resultStyles.testResultsSection}>
                        <h4 className={resultStyles.testResultsTitle}>
                          Test Case Results:
                        </h4>
                        <div className={resultStyles.testResultsList}>
                          {studentAnswers.aisuggestion.map((result, index) => {
                            const testCaseKey = Object.keys(result)[0];
                            const status = result[testCaseKey];
                            const statusClass =
                              status.toLowerCase() === "pass" ? "pass" : "fail";

                            return (
                              <div
                                key={index}
                                className={`${resultStyles.testResult} ${resultStyles[statusClass]}`}
                              >
                                <span className={resultStyles.testCaseNumber}>
                                  Test Case {index + 1}:
                                </span>
                                <span
                                  className={`${resultStyles.testStatus} ${resultStyles[statusClass]}`}
                                >
                                  {status.toUpperCase()}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                </div>
              ) : (
                <div className={resultStyles.noCodeSubmitted}>
                  <p>No code was submitted for this question.</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className={resultStyles.scoreContainer}>
          Scores Details :
          {testRes?.response[e?._id]?.status == "notanswered" ? (
            <span className={resultStyles.notanswered}>Not Answered</span>
          ) : (
            <>
              {testRes?.response[e?._id] ? (
                <>
                  {testRes?.response[e?._id]?.correctScore == 0 &&
                    testRes?.response[e?._id]?.negativeScore == 0 &&
                    !testRes?.response[e?._id]?.answers?.length ? (
                    <span className={resultStyles.notanswered}>
                      Not answered
                    </span>
                  ) : (
                    <>
                      <span className={resultStyles.queScore}>
                        Correct Score :{" "}
                        {testRes?.response[e?._id]?.correctScore}
                      </span>
                      <span className={resultStyles.negScore}>
                        Negative Score :{" "}
                        {testRes?.response[e?._id]?.negativeScore}
                      </span>
                      {testRes?.response[e?._id]?.bonusScore > 0 && (
                        <span className={resultStyles.bonusScore}>
                          Bonus Score: {testRes?.response[e?._id]?.bonusScore}
                        </span>
                      )}
                    </>
                  )}
                </>
              ) : (
                <span className={resultStyles.unattempted}>Unattempted</span>
              )}
            </>
          )}
        </div>
        <div className={resultStyles.scoreContainer}>
          <strong>Score Gained : </strong>
          <strong>
            {singleQuestion?.status === "notanswered"
              ? "0"
              : singleQuestion
                ? singleQuestion?.correctScore == 0 &&
                  singleQuestion?.negativeScore == 0 &&
                  !singleQuestion?.answers?.length
                  ? "0"
                  : singleQuestion?.status === "correct"
                    ? Number(singleQuestion?.correctScore || 0) +
                    Number(singleQuestion?.bonusScore || 0)
                    : singleQuestion?.status === "incorrect"
                      ? Number(singleQuestion?.correctScore || 0) +
                      Number(singleQuestion?.negativeScore || 0)
                      : "0"
                : "0"}
          </strong>
        </div>
        {e?.answer?.explanation && (
          <div className={resultStyles.explainContainer}>
            <strong>Explanation : </strong>
            <div
              className={resultStyles.questionText}
              dangerouslySetInnerHTML={{
                __html: e?.answer?.explanation,
              }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
}
