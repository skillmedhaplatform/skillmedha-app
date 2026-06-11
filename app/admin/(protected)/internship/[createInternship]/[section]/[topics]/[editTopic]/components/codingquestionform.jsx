// QuestionEditorCodingOnly.jsx
"use client";
import React, { useState, forwardRef, useImperativeHandle } from "react";
import { InputNumber } from "antd";
import TextEditor from "@/modules/admin/utils/editor";
import QuestionStyles from "../[question]/styles.module.scss";

const CODING_TYPE = "Coding Question";

const QuestionEditorCodingOnly = forwardRef(function QuestionEditorCodingOnly(
  { showHeader = true },
  ref
) {
  const [question, setQuestion] = useState("");
  const [explanation, setExplanation] = useState("");
  const [scorePoints, setScorePoints] = useState(1);
  const [testCases, setTestCases] = useState([
    { _id: Date.now(), input: "", expectedOutput: "", explanation: "" },
  ]);

  const addTestCase = () => {
    setTestCases((prev) => [
      ...prev,
      { _id: Date.now(), input: "", expectedOutput: "", explanation: "" },
    ]);
  };

  const removeTestCase = (id) => {
    setTestCases((prev) =>
      prev.length > 1 ? prev.filter((tc) => tc._id !== id) : prev
    );
  };

  const sendTestCaseEditorVals = (val, id, field) => {
    setTestCases((prev) =>
      prev.map((tc) => (tc._id === id ? { ...tc, [field]: val } : tc))
    );
  };

  const validate = () => {
    if (!String(question || "").trim())
      return { ok: false, msg: "Please enter a question" };
    if (!String(explanation || "").trim())
      return { ok: false, msg: "Please enter an answer explanation" };
    if (!scorePoints || scorePoints <= 0)
      return { ok: false, msg: "Please enter a valid score (greater than 0)" };
    if (!testCases.length)
      return { ok: false, msg: "Please add at least one test case" };
    return { ok: true };
  };

  const buildPayload = () => {
    const questionContent = {
      question: String(question || "").trim(),
      testCases: testCases.map((tc) => ({
        _id: tc._id,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        explanation: tc.explanation,
      })),
    };

    const answer = {
      explanation: String(explanation || "").trim(),
    };

    const questionData = {
      questionContent,
      answer,
      questionType: CODING_TYPE,
      resources: {},
      scoreSettings: {
        scoreType: "fullScore",
        pointsForCorrectAns: scorePoints,
      },
      type: "skill",
    };
    return questionData;
  };

  useImperativeHandle(ref, () => ({
    validateAndBuild: () => {
      const v = validate();
      if (!v.ok) return { valid: false, error: v.msg };
      return { valid: true, payload: buildPayload() };
    },
    reset: () => {
      setQuestion("");
      setExplanation("");
      setScorePoints(1);
      setTestCases([
        { _id: Date.now(), input: "", expectedOutput: "", explanation: "" },
      ]);
    },
  }));

  return (
    <div className={QuestionStyles.QuestionContainer}>
      {showHeader && (
        <div className={QuestionStyles.QuestionHeader}>
          <div>Create New Question</div>
          {/* When embedded in Modal, header actions are controlled by parent */}
        </div>
      )}

      <div
        className={QuestionStyles.QuestionBody}
        style={{ paddingBottom: "5rem" }}
      >
        {/* Score */}
        <div className={QuestionStyles.QuestionBodyFlex}>
          <div className={`${QuestionStyles.title}`}>Score*</div>
          <div className={`${QuestionStyles.rightBody}`}>
            <InputNumber
              min={1}
              max={100}
              placeholder="Points for Correct (>0)"
              style={{ width: "40%" }}
              value={scorePoints}
              onChange={(v) => setScorePoints(Number(v || 1))}
            />
          </div>
        </div>

        {/* Question */}
        <div className={QuestionStyles.QuestionBodyFlex}>
          <div className={`${QuestionStyles.title}`}>Question*</div>
          <div className={`${QuestionStyles.rightBody}`}>
            <TextEditor
              name="question"
              editorFun={(v) => setQuestion(v)}
              initialContent={{ question }}
            />
          </div>
        </div>

        {/* Test Cases */}
        <div className={QuestionStyles.QuestionBodyFlex}>
          <div className={`${QuestionStyles.title}`}>Test Cases*</div>
          <div className={`${QuestionStyles.rightBody}`}>
            {testCases.map((tc, index) => (
              <div
                key={tc._id}
                style={{
                  border: "1px solid #eee",
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <div className={QuestionStyles.OptionText}>
                    Test Case {index + 1}
                  </div>
                  {testCases.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTestCase(tc._id)}
                      style={{
                        border: 0,
                        background: "transparent",
                        color: "#ff4d4f",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ marginBottom: 6 }}>Input:</div>
                  <TextEditor
                    name={`testcase-input-${tc._id}`}
                    editorFun={(val) =>
                      sendTestCaseEditorVals(val, tc._id, "input")
                    }
                    initialContent={{
                      [`testcase-input-${tc._id}`]: tc.input,
                    }}
                  />
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ marginBottom: 6 }}>Expected Output:</div>
                  <TextEditor
                    name={`testcase-output-${tc._id}`}
                    editorFun={(val) =>
                      sendTestCaseEditorVals(val, tc._id, "expectedOutput")
                    }
                    initialContent={{
                      [`testcase-output-${tc._id}`]: tc.expectedOutput,
                    }}
                  />
                </div>

                <div>
                  <div style={{ marginBottom: 6 }}>Explanation:</div>
                  <TextEditor
                    name={`testcase-explanation-${tc._id}`}
                    editorFun={(val) =>
                      sendTestCaseEditorVals(val, tc._id, "explanation")
                    }
                    initialContent={{
                      [`testcase-explanation-${tc._id}`]: tc.explanation,
                    }}
                  />
                </div>
              </div>
            ))}

            <div className={QuestionStyles.QuestionBodyFlex}>
              <div className={`${QuestionStyles.rightBody}`}>
                <button
                  className={QuestionStyles.addBtn}
                  type="button"
                  onClick={addTestCase}
                >
                  Add Test Case
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Answer Explanation */}
        <div className={QuestionStyles.QuestionBodyFlex}>
          <div className={`${QuestionStyles.title}`}>Answer Explanation*</div>
          <div className={`${QuestionStyles.rightBody}`}>
            <TextEditor
              name="explanation"
              editorFun={(v) => setExplanation(v)}
              initialContent={{ explanation }}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

export default QuestionEditorCodingOnly;
