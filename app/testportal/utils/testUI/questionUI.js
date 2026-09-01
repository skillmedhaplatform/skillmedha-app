"use client";

import React, { useEffect, useRef, useState } from "react";
import { Editor } from "@monaco-editor/react";

import queStyles from "./question.module.scss";
import testStyles from "./testUI.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { startTimer } from "./timer";
import { save_response } from "@/app/testportal/redux/slices/testSlice";
import TextEditor from "@/app/testportal/editor/editor";
import _ from "lodash";
import { getSstorage } from "../storageMiddleware";
import { PauseCircleOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { parseIfJson } from "./jsonparse";
import { Input, message } from "antd";
import CodingQuestion from "../monaco_code_editor";
import CodingPage from "../Playground/page";

export default function QuestionUI({
  questionData,
  setAnswers,
  answers,
  currentIndex,
  displayNumber,
  categoryName,
  totalInCategory,
  clearRespFun,
  flagCheck,
  isFlagged,
}) {
  const dispatch = useDispatch();
  const [edval, setEdval] = useState({});
  const [edValText, setEdvalText] = useState("");
  const [fillBlankAnswer, setFillBlankAnswer] = useState("");

  // Code Editor States
  const [code, setCode] = useState(
    "// Write your solution here\nfunction solution() {\n    // Your code here\n    return false;\n}"
  );
  const [language, setLanguage] = useState("javascript");
  const [isLoading, setIsLoading] = useState(false);
  const codeEditorRef = useRef(null);

  const languages = [
    { name: "JavaScript", value: "javascript" },
    { name: "Python", value: "python" },
    { name: "C++", value: "cpp" },
    { name: "Java", value: "java" },
  ];

  const currResponses = useSelector((state) => state.Test.responses.value);
  const currResponse = currResponses[questionData?._id]?.answers;

  let ans = answers;
  if (currResponse) ans = currResponse;

  // Handle Coding Question submission
  const handleCodingQuestionSubmit = (codingData) => {
    if (isFlagged) {
      message.warning("This question is flagged. Please clear the flag to answer.");
      return;
    }
    setAnswers([codingData]);
    dispatch(
      save_response({
        questionId: questionData._id,
        response: [codingData],
        questionScore:
          codingData.score || questionData?.scoreSettings?.pointsForCorrectAns,
        questionType: questionData?.questionType,
      })
    );
  };

  // Code Editor Handler Functions (for simple editor)
  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    const defaultCodes = {
      javascript:
        "// Write your solution here\nfunction solution() {\n    // Your code here\n    return false;\n}",
      python:
        "# Write your solution here\ndef solution():\n    # Your code here\n    return False",
      cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}",
      java: "public class Solution {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}",
    };
    setCode(defaultCodes[newLanguage] || defaultCodes.javascript);
  };

  const handleCodeSubmit = () => {
    const codeResponse = { code, language };
    setAnswers([codeResponse]);
    dispatch(
      save_response({
        questionId: questionData._id,
        response: [codeResponse],
        questionScore: questionData?.scoreSettings?.pointsForCorrectAns,
        questionType: questionData?.questionType,
      })
    );
  };

  const handleEditorDidMount = (editor, monaco) => {
    codeEditorRef.current = editor;
    editor.focus();
  };

  const selectAns = (e, value) => {
    if (isFlagged) {
      message.warning("This question is flagged. Please clear the flag to answer.");
      return;
    }
    if (!e) {
      if (questionData?.questionType !== "Multiple Choice") {
        setAnswers([value]);
        dispatch(
          save_response({
            questionId: questionData._id,
            response: [value],
            questionScore: questionData?.scoreSettings?.pointsForCorrectAns,
            questionType: questionData?.questionType,
          })
        );
      } else {
        if (!currResponse) ans = [];
        setAnswers([...ans, value]);
        dispatch(
          save_response({
            questionId: questionData?._id,
            response: [...ans, value],
            questionScore: questionData?.questionScore,
            questionType: questionData?.questionType,
          })
        );
      }
    } else {
      setAnswers(ans?.filter((answer) => answer !== value));
      dispatch(
        save_response({
          questionId: questionData._id,
          response: ans?.filter((answer) => answer !== value),
          questionType: questionData?.questionType,
        })
      );
    }
    if (questionData?.questionType == "Short Paragraph") {
      setAnswers(value);
      dispatch(
        save_response({
          questionId: questionData?._id,
          response: [value],
          questionScore: questionData?.scoreSettings?.pointsForCorrectAns,
          questionType: questionData?.questionType,
        })
      );
    }
  };

  // Handle fill in the blank input change
  const handleFillBlankChange = (e) => {
    if (isFlagged) {
      message.warning("This question is flagged. Please clear the flag to answer.");
      return;
    }
    const value = e.target.value;
    setFillBlankAnswer(value);
    setAnswers([value]);
    dispatch(
      save_response({
        questionId: questionData?._id,
        response: [value],
        questionScore: questionData?.scoreSettings?.pointsForCorrectAns,
        questionType: questionData?.questionType,
      })
    );
  };

  const contentInnerRef = useRef();

  const sendEditorVals = (val) => {
    if (isFlagged) {
      message.warning("This question is flagged. Please clear the flag to answer.");
      return;
    }
    setEdval(val);
    selectAns("checked", val[questionData?._id]);
  };

  const flaggedArr = [
    " Spam",
    "Rude or abusive",
    "Should be closed",
    "A duplicate",
    "In need of moderator intervention",
  ];
  const currentQues = getSstorage("currQues");

  useEffect(() => {
    startTimer();
  }, [currentQues]);

  // Initialize fill in the blank answer from current response
  useEffect(() => {
    if (questionData?.questionType === "Fill in the Blanks") {
      if (currResponse && currResponse[0]) {
        setFillBlankAnswer(currResponse[0]);
      } else {
        setFillBlankAnswer("");
      }
    }
  }, [questionData, currResponse]);

  // Initialize code editor from saved response
  useEffect(() => {
    if (
      questionData?.questionType === "Coding Question" &&
      currResponse &&
      currResponse[0]
    ) {
      const savedCode = currResponse[0];
      if (savedCode.code) setCode(savedCode.code);
      if (savedCode.language) setLanguage(savedCode.language);
    }
  }, [questionData, currResponse]);


  // If it's a Coding Question, render the full CodingQuestion component
  if (questionData?.questionType === "Coding Question") {
    return (
      <div className={queStyles.container}>
        <div className={queStyles.bodyCon}>
          {/* Render the full CodingQuestion component */}
          {/* <CodingQuestion
            questionData={questionData}
            onSubmit={handleCodingQuestionSubmit}
          /> */}
          <CodingPage
            questionData={questionData}
            onSubmit={handleCodingQuestionSubmit}
          />
        </div>
      </div>
    );
  }

  // Original QuestionUI for other question types
  return (
    <div className={testStyles.questionCard}>
      {/* Comprehension / resource block */}
      {questionData?.compText && (
        <div className={queStyles.comprehension_div}>
          <div
            className={queStyles.questionText}
            dangerouslySetInnerHTML={{
              __html: parseIfJson(questionData?.compText),
            }}
          ></div>
        </div>
      )}
      {questionData?.resource?.url && (
        <div className={queStyles.comprehension_div}>
          <video
            className={queStyles.video_cont}
            src={questionData?.resource?.url}
            controls
          />
        </div>
      )}

      {/* Flag icon (if any) */}
      <div className={queStyles.flagImg} style={{ position: 'absolute', top: 10, right: 10 }}>
        {isFlagged ? (
          <img
            src="https://res.cloudinary.com/cliqtick/image/upload/v1721625379/sysnper/a59ab59c0357c4d72adbea66b7496401_yzsdgy.png"
            width="10px"
          />
        ) : null}
      </div>

      <div className={testStyles.qNumRow}>
        <div className={testStyles.qNum} id="qNum">{displayNumber || (currentIndex + 1)}</div>
        <div
          className={testStyles.qText}
          id="qText"
          dangerouslySetInnerHTML={{
            __html: parseIfJson(
              questionData?.questionContent?.question
            ),
          }}
        ></div>
      </div>

      {questionData?.resources?.type === "video" && (
        <video
          src={questionData.resources.file}
          controls
          className={queStyles.videoElement}
          controlsList="noplaybackrate nodownload nofullscreen"
          disablePictureInPicture={true}
        />
      )}

      {questionData?.resources?.type === "audio" && (
        <audio
          src={questionData.resources.file}
          controls
          className={queStyles.player}
          controlsList="noplaybackrate nodownload nofullscreen"
        />
      )}

      <div className={testStyles.options} id="optionsList">
        {questionData?.questionContent?.options?.map((opt, i) => {
          const key = _.capitalize(Object.keys(opt)[0]);

          let cls = "";

          if (
            ans?.find((e) => e == key) &&
            currResponse?.find((e) => e == key)
          )
            cls = "selected";
            
          const isMultiSelect = questionData?.questionType === "Multiple Choice";
            
          return (
            <div
              key={i}
              onClick={(e) => selectAns(cls == "selected", key)}
              className={`${testStyles.option} ${cls === "selected" ? testStyles.selected : ""}`}
            >
              <div className={isMultiSelect ? testStyles.optCheckbox : testStyles.optRadio}></div>
              <div className={testStyles.optLetter}>{String.fromCharCode(65 + i)}</div>
              <div
                dangerouslySetInnerHTML={{
                  __html: parseIfJson(opt[_.lowerFirst(key)]),
                }}
                className={testStyles.optText}
              ></div>
            </div>
          );
        })}

        {(questionData?.questionType == "True - False" ||
          questionData?.questionType == "True/False") &&
          ["True", "False"]?.map((op, i) => {
            const key = op;

            let cls = "";

            if (
              ans?.find((e) => e == key) &&
              currResponse?.find((e) => e == key)
            )
              cls = "selected";
            return (
              <div
                key={i}
                onClick={(e) => selectAns(cls == "selected", key)}
                className={`${testStyles.option} ${cls === "selected" ? testStyles.selected : ""}`}
              >
                <div className={testStyles.optRadio}></div>
                <div className={testStyles.optLetter}>{String.fromCharCode(65 + i)}</div>
                <div className={testStyles.optText}>{op}</div>
              </div>
            );
          })}

          {/* Fill in the Blank Input */}
          {questionData?.questionType === "Fill in the Blanks" && (
            <div className={queStyles.fillBlankContainer}>
              <label className={queStyles.fillBlankLabel}>Your Answer:</label>
              <Input
                type="text"
                value={fillBlankAnswer}
                onChange={handleFillBlankChange}
                placeholder="Enter your answer here..."
              />
            </div>
          )}

          {(questionData?.questionType == "Short Paragraph" ||
            questionData?.questionType == "Text") && (
              <span className={`${queStyles.para_optionsInput}`}>
                <legend className={queStyles.legend}>
                  <p>Add Answer</p>
                  <TextEditor
                    name={questionData?._id}
                    editorFun={(name, val) => sendEditorVals(name, val)}
                    initialContent={{
                      [questionData?._id]:
                        currResponses[questionData?._id]?.answers,
                    }}
                  />
                </legend>
              </span>
            )}
      </div>
    </div>
  );
}
