"use client";
import React from "react";
import resultStyles from "./results.module.scss";
import { useSearchParams } from "next/navigation";
import { Tooltip } from "antd";
import { FlagFilled } from "@ant-design/icons";
import { getSstorage } from "../utils/storageMiddleware";
import { parseIfJson } from "../utils/testUI/jsonparse";

export default function QuesComp({
  e,
  i,
  currentTestRes,
  testRes,
  questionNo,
  flagged,
}) {
  const searchParams = useSearchParams();

  const testId = searchParams.get("t_Id");
  const studentId = searchParams.get("s_Id");

  const options = e?.questionContent?.options;
  // .filter((qe) => qe?.includes("option"))
  // .map((op) => ({ [op]: e?.questionContent[op] }))
  // .sort((a, b) => Object.keys(a)[0].slice(-1) - Object.keys(b)[0].slice(-1));
  //   console.log(e?.questionContent);

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
    if (e?.scoreSettings?.pointsForEachIncorrectAns)
      negativeScore = e?.scoreSettings?.pointsForEachIncorrectAns;
  }
  const singleQuestion = testRes[testId]?.response[e?._id];

  return (
    <>
      <div key={e?._id} className={resultStyles.questionContainer}>
        <div className={resultStyles.questionHeader}>
          <p className={resultStyles.sno} id={`question_${questionNo}`}>
            Question {questionNo}
            {flagged && (
              <Tooltip
                placement="top"
                title={flagged?.flag?.map((e, I) => (
                  <p key={I}>{e}</p>
                ))}
              >
                <FlagFilled className={resultStyles.flaggedIcon} />
              </Tooltip>
            )}
          </p>
          <p className={resultStyles.type}>{e?.questionType}</p>
          <div className={resultStyles.scoreContainer}>
            {correctScore ? (
              <span className={resultStyles.queScore}>
                Que Score: {+correctScore}
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
              //   console.log(options);

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
                !studentAnswers?.length &&
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
                        : `Points : ${
                            isSelected && !isCorrect
                              ? e?.scoreSettings?.pointsForEachIncorrectAns !=
                                undefined
                                ? e?.scoreSettings?.pointsForEachIncorrectAns
                                : 0
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
                  <span></span>
                  <span className={resultStyles.optionValue}>{" " + op}</span>
                </label>
              );
            })}

          {e?.questionType == "Short Paragraph" && (
            <div className={resultStyles.paraanswers_div}>
              <h3
                className={`${resultStyles.shortParaAnsLabel} ${
                  singleQuestion?.status == "notanswered" &&
                  singleQuestion?.correctScore == 0 &&
                  singleQuestion?.negativeScore == 0 &&
                  !singleQuestion?.answers?.length
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
                className={`${resultStyles.shortParaAns} ${
                  singleQuestion?.correctScore == 0 &&
                  singleQuestion?.negativeScore == 0 &&
                  !singleQuestion?.answers?.length &&
                  singleQuestion?.status == "notanswered"
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
          <div className={resultStyles.scoreContainer}>
            Scores Details :
            {singleQuestion?.status == "notanswered" ? (
              <span className={resultStyles.notanswered}>Not Answered</span>
            ) : (
              <>
                {singleQuestion ? (
                  <>
                    {singleQuestion?.correctScore == 0 &&
                    singleQuestion?.negativeScore == 0 &&
                    !singleQuestion?.answers?.length ? (
                      <span className={resultStyles.notanswered}>
                        Not answered
                      </span>
                    ) : (
                      <>
                        <span className={resultStyles.queScore}>
                          Correct Score : {singleQuestion?.correctScore}
                        </span>
                        <span className={resultStyles.negScore}>
                          Negative Score : {singleQuestion?.negativeScore}
                        </span>
                        {singleQuestion?.bonusScore > 0 && (
                          <span className={resultStyles.bonusScore}>
                            Bonus Score: {singleQuestion?.bonusScore}
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
          <div
            className={resultStyles.questionText}
            dangerouslySetInnerHTML={{
              __html: e?.answer?.explanation,
            }}
          ></div>
        </div>
      </div>
    </>
  );
}
