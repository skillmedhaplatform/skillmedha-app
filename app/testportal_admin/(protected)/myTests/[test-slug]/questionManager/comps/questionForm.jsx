"use client";
import React, { useEffect, useState } from "react";
import MultipleStyles from "./styles/multiple.module.scss";
// import { setQuestionVals } from "@/redux/slices/testportal_admin/slice/stepform";
import { useSelector, useDispatch } from "react-redux";
import TextEditor from "@/modules/testportal_admin/components/reusable-comps/editor/editor";
import ScoreSettings from "../../components/childs/scoreSettings";
import { Radio } from "antd";
import { setQuestionVals } from "@/redux/slices/testportal_admin/slice/questions";
const QuestionForm = () => {
  const type = useSelector(
    (state) => state.questions.questionVals?.questionType
  );
  const questionData = useSelector((state) => state.questions.questionVals);

  const dispatch = useDispatch();
  const values = useSelector((state) => state.steps.value);

  const [inputs, setInputs] = useState([]);

  useEffect(() => {
    if (questionData) {
      if (questionData.questionContent) {
        const keys = Object.keys(questionData.questionContent);
        let newInputs = keys.filter((e) => e.includes("option"));
        setInputs((prev) => {
          if (newInputs.length) return newInputs;
          return [""];
        });
      }
    }
  }, [questionData]);
  const addInput = () => {
    setInputs([...inputs, ""]);
  };

  const removeInput = (index) => {
    const newInputs = [...inputs];
    newInputs.splice(index, 1);
    setInputs(newInputs);

    let newVals = { ...values.questionContent };
    delete newVals[`Option ${index + 1}`];

    const newOpts = {};
    let i = 1;
    for (let key in newVals) {
      newOpts[key.split(" ")[0] + " " + i] = newVals[key];

      i++;
    }
    dispatchEvent(setQuestionVals({ ...values, questionContent: newOpts }));
  };

  const [answers, setAnswers] = useState([]);

  const sendEditorVals = (val, name) => {
    if (name == "answer") {
      dispatch(
        setQuestionVals({ ...questionData, answer: { ["shortpara"]: val } })
      );
    } else if (name === "explanation") {
      dispatch(setQuestionVals({ ...questionData, [name]: val }));
    } else {
      dispatch(
        setQuestionVals({
          ...questionData,
          questionContent: {
            ...questionData.questionContent,
            [name]: val,
          },
        })
      );
    }
  };
  const [selectedans, setSelectedans] = useState({});

  useEffect(() => {
    setSelectedans({});
  }, [type]);
  const handleAnswerUpdate = (e, type) => {
    let newAns = { ...selectedans };
    if (type == "multiple") {
      if (selectedans[e.target.name]) {
        newAns[e.target.name] = false;
      } else {
        newAns[e.target.name] = true;
      }
      dispatch(
        setQuestionVals({ ...questionData, answer: { multipleChoice: newAns } })
      );
    } else {
      newAns[e.target.name] = e.target.value;
      dispatch(setQuestionVals({ ...questionData, answer: newAns }));
    }
    setSelectedans(newAns);
  };
  return (
    <div className={MultipleStyles.container}>
      <div className={MultipleStyles.flexComp}>
        <span className={MultipleStyles.span}>Question</span>

        <div className={MultipleStyles.editorComp}>
          <TextEditor
            name="question"
            editorFun={(val) => sendEditorVals(val, "question")}
            initialContent={{
              question:
                questionData &&
                questionData.questionContent &&
                questionData.questionContent.question,
            }}
          />
        </div>

        <button className={MultipleStyles.removeButton}></button>
      </div>

      {(type == "Multiple Choice" || type == "Single Choice") && (
        <>
          {inputs.map((input, index) => {
            return (
              <div key={index} className={MultipleStyles.flexComp}>
                <span className={MultipleStyles.span}>
                  {`Option ${index + 1}`}
                </span>

                <div className={MultipleStyles.editorComp}>
                  <TextEditor
                    name={`option ${index + 1}`}
                    answers={answers}
                    editorFun={(val) =>
                      sendEditorVals(val, `option ${index + 1}`)
                    }
                    initialContent={{
                      [`option ${index + 1}`]:
                        questionData &&
                        questionData.questionContent &&
                        questionData.questionContent[`option ${index + 1}`],
                    }}
                  />
                </div>

                <button
                  onClick={() => removeInput(index)}
                  className={MultipleStyles.removeButton}
                >
                  <img
                    src="https://res.cloudinary.com/cliqtick/image/upload/v1718799083/sysnper/f29853d87e22f70d1cc10a3fcd7959c4_phnqgw.png"
                    width="20px"
                  />
                </button>
              </div>
            );
          })}
          <button onClick={addInput} className={MultipleStyles.AddNew}>
            + Add Option
          </button>
        </>
      )}
      {type == "Multiple Choice" && (
        <div className={MultipleStyles.AnswerBox}>
          <span className={MultipleStyles.answerHead}>Answer</span>
          <div>
            {inputs.map((e, i) => (
              <Radio
                key={i}
                name={"Option " + (i + 1)}
                onClick={(e) => handleAnswerUpdate(e, "multiple")}
                checked={
                  (questionData &&
                    questionData.answer &&
                    questionData.answer.multiplechoice &&
                    questionData.answer.multiplechoice.find(
                      (e) => e == "Option " + (i + 1)
                    )) ||
                  selectedans["Option " + (i + 1)]
                }
              >
                <p className={MultipleStyles.answerValue}>
                  {"Option " + (i + 1)}
                </p>
              </Radio>
            ))}
          </div>
        </div>
      )}
      {type == "Single Choice" && (
        <div className={MultipleStyles.AnswerBox}>
          <span className={MultipleStyles.answerHead}>Answer</span>
          <div>
            <Radio.Group
              onChange={(e) => handleAnswerUpdate(e, "single")}
              value={
                (questionData &&
                  questionData.answer &&
                  questionData.answer.singleChoice) ||
                selectedans.singleChoice
              }
              name="singleChoice"
            >
              {inputs.map((e, i) => (
                <Radio value={"Option " + (i + 1)} key={i}>
                  <p className={MultipleStyles.answerValue}>
                    {"Option " + (i + 1)}
                  </p>
                </Radio>
              ))}
            </Radio.Group>
          </div>
        </div>
      )}
      {type == "True - False" && (
        <div className={MultipleStyles.AnswerBox}>
          <span className={MultipleStyles.answerHead}>Answer</span>
          <div>
            <Radio.Group
              onChange={(e) => handleAnswerUpdate(e, "truefalse")}
              value={
                (questionData &&
                  questionData.answer &&
                  questionData.answer.truefalse) ||
                selectedans.truefalse
              }
              name="truefalse"
            >
              <div className={MultipleStyles.answerContainer}>
                <Radio value={true}>
                  <p className={MultipleStyles.answerValue}>{"True"}</p>
                </Radio>
              </div>
              <div className={MultipleStyles.answerContainer}>
                <Radio value={false}>
                  <p className={MultipleStyles.answerValue}>{"False"}</p>
                </Radio>
              </div>
            </Radio.Group>
          </div>
        </div>
      )}
      {type == "Short Paragraph" && (
        <div className={MultipleStyles.flexComp}>
          <span className={MultipleStyles.span}>Answer</span>

          <div className={MultipleStyles.editorComp}>
            <TextEditor
              name="answer"
              editorFun={(val) => sendEditorVals(val, "answer")}
              initialContent={{
                answer:
                  questionData &&
                  questionData.answer &&
                  questionData.answer.shortpara,
              }}
            />
          </div>

          <button className={MultipleStyles.removeButton}></button>
        </div>
      )}
      <div className={MultipleStyles.flexComp}>
        <span className={MultipleStyles.span}>Explanation</span>

        <div className={MultipleStyles.editorComp}>
          <TextEditor
            name="explanation"
            editorFun={(val) => sendEditorVals(val, "explanation")}
            initialContent={{
              explanation: questionData && questionData.explanation,
            }}
          />
        </div>

        <button className={MultipleStyles.removeButton}></button>
      </div>

      <div className={MultipleStyles.scoreSet}>
        <ScoreSettings />
      </div>
    </div>
  );
};

export default QuestionForm;
