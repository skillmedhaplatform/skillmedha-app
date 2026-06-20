"use client";
import React, { useRef } from "react";
import resultStyles from "./results.module.scss";
import { useSearchParams } from "next/navigation";
import { Tooltip } from "antd";
import { FlagFilled } from "@ant-design/icons";
import { getSstorage } from "@/universalUtils/windowMW";
import { parseIfJson } from "../../reusable_comp/jsonparse";

export default function QuesComp({
  e,
  i,
  currentTestRes,
  testRes,
  questionNo,
  flagged,
}) {
  const shortAns = useRef({});
  const searchQuery = useSearchParams();
  const sstestId = getSstorage("selectedTest");
  const sqTestId = searchQuery.get("testId");
  const testId = sqTestId || sstestId;

  const options = Object.keys(e?.questionContent || {})
    .filter((qe) => qe?.includes("option"))
    .map((op) => ({ [op]: e?.questionContent[op] }))
    .sort((a, b) => Object.keys(a)[0].slice(-1) - Object.keys(b)[0].slice(-1));

  const correctAnswers = () => {
    if (Object.keys(e?.answer || {})[0] === "truefalse") {
      return [e?.answer?.truefalse?.toString()];
    }
    if (Object.keys(e?.answer || {})[0] === "shortpara") {
      return [e?.answer?.shortpara?.toString()];
    }
    if (Object.keys(e?.answer || {})[0] == "multipleChoice") {
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
      return answer ? [answer] : [];
    }
  };

  const studentAnswers = currentTestRes?.[e?._id]?.answers;
  const quesTime = currentTestRes?.[e?._id]?.timeTaken;
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
  const singleQuestion = testRes?.value[testId]?.response[e?._id];

  const getLanguageName = (languageId) => {
    const languageMap = {
      63: "javascript",
      71: "python",
      54: "cpp",
      62: "java",
      51: "csharp",
    };
    return languageMap[languageId] || "javascript";
  };

  const cleanHtmlFromTestCase = (htmlString) => {
    if (!htmlString) return "";
    const cleaned = htmlString
      .replace(/^"|"$/g, "")
      .replace(/<[^>]*>/g, "")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .trim();
    return cleaned;
  };

  let totalScoreGained = 0;
  if (singleQuestion && singleQuestion?.status !== "notanswered") {
    if (
      singleQuestion?.correctScore == 0 &&
      singleQuestion?.negativeScore == 0 &&
      !singleQuestion?.answers?.length
    ) {
      totalScoreGained = 0;
    } else if (singleQuestion?.status === "correct") {
      totalScoreGained = Number(singleQuestion?.correctScore || 0) + Number(singleQuestion?.bonusScore || 0);
    } else if (singleQuestion?.status === "incorrect") {
      totalScoreGained = Number(singleQuestion?.correctScore || 0) + Number(singleQuestion?.negativeScore || 0);
    }
  }

  return (
    <div key={e?._id} className={resultStyles.qBlock}>
      <div className={resultStyles.qBlockHeader}>
        <div className={resultStyles.qBlockNum} id={`question_${questionNo}`}>
          <i className="ti ti-help" /> Question {questionNo}
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
        </div>
        <div className={resultStyles.qBlockType}>{e?.questionType}</div>
        <div className={resultStyles.qBlockScores}>
          {(correctScore || partialScore) ? (
            <div className={`${resultStyles.scoreChip} ${resultStyles.due}`}>
              Score Due: {correctScore ? correctScore : partialScore}
            </div>
          ) : null}
          {bonusScore ? (
            <div className={`${resultStyles.scoreChip} ${resultStyles.due}`}>
              Bonus: {bonusScore}
            </div>
          ) : null}
          {negativeScore ? (
            <div className={`${resultStyles.scoreChip} ${resultStyles.neg}`}>
              Penalty: -{negativeScore}
            </div>
          ) : null}
        </div>
      </div>
      
      <div
        className={resultStyles.qBlockText}
        dangerouslySetInnerHTML={{
          __html: parseIfJson(e?.questionContent?.question),
        }}
      ></div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {(e?.questionType == "Single Choice" ||
          e?.questionType == "Audio Question" ||
          e?.questionType == "Video Question" ||
          e?.questionType == "Multiple Choice") &&
          options.map((opt, idx) => {
            const key = Object.keys(opt)[0];
            const isCorrect = correctAnswers()?.includes(key.toLowerCase());

            const isSelected =
              Array.isArray(studentAnswers) &&
              studentAnswers
                .map((stAns) => stAns?.toLowerCase())
                .includes(key.toLowerCase());

            let optClass = "";
            let iconClass = "";
            
            if (isCorrect && isSelected) {
              optClass = resultStyles.correct;
              iconClass = "ti ti-circle-check";
            } else if (!isCorrect && isSelected) {
              optClass = resultStyles.wrongSelected;
              iconClass = "ti ti-circle-x";
            } else if (isCorrect && !isSelected) {
              optClass = resultStyles.correctNotSelected;
              iconClass = "ti ti-circle-check";
            }

            return (
              <div key={idx} className={`${resultStyles.akOption} ${optClass}`}>
                <div className={resultStyles.akOptLetter}>{String.fromCharCode(65 + idx)}</div>
                <div className={resultStyles.akOptText} dangerouslySetInnerHTML={{ __html: parseIfJson(opt[key]) }}></div>
                {iconClass && <i className={`${iconClass} ${resultStyles.akOptIcon}`} />}
                
                {e?.scoreSettings?.scoreType == "partialScore" && (
                  <span style={{ fontSize: '11px', fontWeight: 600, marginLeft: '10px', color: 'rgba(0,0,0,0.5)' }}>
                    {isSelected && isCorrect
                      ? `(+${+partialScore})`
                      : isSelected && !isCorrect
                      ? `(${e?.scoreSettings?.pointsForEachIncorrectAns || 0})`
                      : ""}
                  </span>
                )}
              </div>
            );
          })}

        {e?.questionType == "True - False" &&
          ["True", "False"]?.map((op, idx) => {
            const isCorrect = correctAnswers()?.includes(op.toLowerCase());
            const isSelected =
              Array.isArray(studentAnswers) &&
              studentAnswers[0]?.toLowerCase()?.includes(op.toLowerCase());

            let optClass = "";
            let iconClass = "";
            
            if (isCorrect && isSelected) {
              optClass = resultStyles.correct;
              iconClass = "ti ti-circle-check";
            } else if (!isCorrect && isSelected) {
              optClass = resultStyles.wrongSelected;
              iconClass = "ti ti-circle-x";
            } else if (isCorrect && !isSelected) {
              optClass = resultStyles.correctNotSelected;
              iconClass = "ti ti-circle-check";
            }

            return (
              <div key={idx} className={`${resultStyles.akOption} ${optClass}`}>
                <div className={resultStyles.akOptLetter}>{String.fromCharCode(65 + idx)}</div>
                <div className={resultStyles.akOptText}>{op}</div>
                {iconClass && <i className={`${iconClass} ${resultStyles.akOptIcon}`} />}
              </div>
            );
          })}

        {e?.questionType == "Short Paragraph" && (
          <div style={{ marginTop: '10px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text3)', marginBottom: '4px' }}>Student Answer</div>
            <div className={`${resultStyles.akOption} ${totalScoreGained > 0 ? resultStyles.correct : (totalScoreGained < 0 ? resultStyles.wrongSelected : '')}`} style={{ padding: '12px 14px' }}>
              <div className={resultStyles.akOptText}>{currentTestRes?.[e?._id]?.answers || "Not Answered"}</div>
            </div>
            
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text3)', marginTop: '10px', marginBottom: '4px' }}>Actual Answer</div>
            {e?.answer?.shortpara && (
              <div className={resultStyles.akOption} style={{ padding: '12px 14px', background: 'var(--bg-success)' }}>
                <div className={resultStyles.akOptText} dangerouslySetInnerHTML={{ __html: parseIfJson(e?.answer?.shortpara) }} />
              </div>
            )}
          </div>
        )}

        {e?.questionType == "Coding Question" && (
          <div style={{ marginTop: '10px' }}>
            {/* Kept minimal formatting for coding questions since they require complex nested elements. We use standard nested divs but styled with the new theme colors */}
            <div style={{ background: 'var(--bg2)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--blue2)', marginBottom: '8px' }}>
                Student's Solution {studentAnswers?.languageKey && <span style={{ background: 'var(--bg-info)', padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>{studentAnswers.languageKey.key.toUpperCase()}</span>}
              </h3>
              
              {studentAnswers?.code ? (
                <>
                  <pre style={{ background: 'var(--navy2)', color: '#fff', padding: '12px', borderRadius: '6px', overflowX: 'auto', fontSize: '12px', fontFamily: 'monospace', marginBottom: '10px' }}>
                    <code>{studentAnswers.code}</code>
                  </pre>
                  
                  {studentAnswers?.aisuggestion && studentAnswers.aisuggestion.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '6px' }}>Test Case Results:</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {studentAnswers.aisuggestion.map((result, index) => {
                          const testCaseKey = Object.keys(result)[0];
                          const status = result[testCaseKey];
                          const isPass = status.toLowerCase() === "pass";
                          return (
                            <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: isPass ? 'var(--bg-success)' : 'var(--bg-danger)', borderRadius: '4px', border: `1px solid ${isPass ? 'var(--green)' : 'var(--red)'}`, fontSize: '11px', fontWeight: 600 }}>
                              <span>Test Case {index + 1}</span>
                              <span style={{ color: isPass ? 'var(--green-txt)' : 'var(--red-txt)' }}>{status.toUpperCase()}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ fontSize: '12px', color: 'var(--text3)', fontStyle: 'italic' }}>No code was submitted.</div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className={resultStyles.scoreDetailsBox}>
        <div className={resultStyles.scoreDetailsRow}>
          <div className={`${resultStyles.scoreDetailChip} ${resultStyles.cs}`}>
            Correct Score: {singleQuestion?.correctScore || 0}
          </div>
          <div className={`${resultStyles.scoreDetailChip} ${resultStyles.ns}`}>
            Negative Score: {singleQuestion?.negativeScore || 0}
          </div>
          {singleQuestion?.bonusScore > 0 && (
            <div className={`${resultStyles.scoreDetailChip} ${resultStyles.cs}`} style={{ background: '#e8eaf6', color: '#3f51b5' }}>
              Bonus Score: {singleQuestion?.bonusScore}
            </div>
          )}
          <div className={`${resultStyles.scoreDetailChip} ${totalScoreGained >= 0 ? resultStyles.gainedPos : resultStyles.gainedNeg}`}>
            Score Gained: {totalScoreGained}
          </div>
          {singleQuestion?.status === "notanswered" && (
            <div className={`${resultStyles.scoreDetailChip}`} style={{ background: '#f5f5f5', color: '#757575' }}>
              Not Answered
            </div>
          )}
        </div>
      </div>

      {e?.answer?.explanation && (
        <div className={resultStyles.explanationBox}>
          <b>Explanation:</b> <span dangerouslySetInnerHTML={{ __html: parseIfJson(e?.answer?.explanation) }} />
        </div>
      )}
    </div>
  );
}
