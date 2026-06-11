"use client";

import {
  Alert,
  Button,
  Checkbox,
  Col,
  Flex,
  Input,
  InputNumber,
  message,
  Row,
  Skeleton,
  Spin,
  Typography,
} from "antd";
import React, { useEffect, useState } from "react";
import { Select, Radio, Space } from "antd";
import { v4 as uuid } from "uuid";

import addQuestionStyles from "./addQuestion.module.scss";
import { IoAdd } from "react-icons/io5";
import { FaTrash } from "react-icons/fa";
import TextEditor from "@/modules/testportal_admin/components/reusable-comps/editor/editor";
import { useDispatch } from "react-redux";
import { setQuestionVals } from "@/redux/slices/testportal_admin/slice/questions";
import { useSelector } from "react-redux";
import axios from "@/modules/testportal_admin/utils/axiosInstance";
import VideoUpload from "../utils/video";
import AudioUpload from "../utils/audio";
import QuestionSkeleton from "@/modules/testportal_admin/components/reusable-comps/skeleton/questionSkeleton";
import { aiUrl } from "@/utils/universalUtils/urls";

const { Text } = Typography;
export default function AddQuestions({
  type,
  questionContent = {},
  questionContentNew = {},
}) {
  const [selectedType, setSelectedType] = useState("");
  const values = useSelector((state) => state.questions.questionVals);
  const resources = useSelector((state) => state.questions.resources);
  const editStatus = useSelector(
    (state) => state.questions.questionVals.status
  );

  const dispatch = useDispatch();
  const [inputs, setInputs] = useState([]);
  const comprehensionArr = [
    "readingComprehension",
    "audioComprehension",
    "videoComprehension",
  ];

  useEffect(() => {
    if (!selectedType) setSelectedType("singleChoice");
  }, []);

  useEffect(() => {
    // if(
    // Object.keys(questionContent).length,
    // Object.keys(questionContentNew).length)
    //{

    resetInputs();
    // }
  }, [questionContent?.question]);

  const resetInputs = () => {
    if (Object.keys(questionContent).length) {
      let qc = { ...questionContent };
      if (
        Object.keys(questionContent).length !=
        Object.keys(questionContentNew).length
      )
        qc = questionContentNew;
      const options = Object.keys(qc)
        .filter((e) => e.includes("option"))
        .map((e) => ({ uuid: e }));
      setInputs(options);
    } else {
      setInputs([{ uuid: "option 1" }]);
    }
  };
  const [value, setValue] = useState(1);
  const onChange = (e) => {
    console.log("radio checked", e.target.value);
    setValue(e.target.value);
  };

  const returnCurrentType = () => {
    if (
      ["audio"].includes(type) ||
      (comprehensionArr.includes(type) && ["audio"].includes(selectedType))
    )
      return "audio";

    if (
      ["video"].includes(type) ||
      (comprehensionArr.includes(type) && ["video"].includes(selectedType))
    )
      return "video";

    if (
      ["singleChoice"].includes(type) ||
      (comprehensionArr.includes(type) &&
        ["singleChoice"].includes(selectedType))
    )
      return "mcq";
    if (
      ["multipleChoice"].includes(type) ||
      (comprehensionArr.includes(type) &&
        ["multipleChoice"].includes(selectedType))
    )
      return "msq";
    if (
      (comprehensionArr.includes(type) && selectedType == "shortPara") ||
      type == "shortPara"
    )
      return "shortPara";
    if (
      (comprehensionArr.includes(type) && selectedType == "trueFalse") ||
      type == "trueFalse"
    )
      return "trueFalse";
  };
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

  const options1 = [
    {
      value: "singleChoice",
      label: "Single Choice",
    },
    {
      value: "multipleChoice",
      label: "Multiple Choice",
    },
    {
      value: "trueFalse",
      label: "True - False",
    },
    {
      value: "shortPara",
      label: "Short Paragraph",
    },
    {
      value: "audio",
      label: "Audio Question",
    },
    {
      value: "video",
      label: "Video Question",
    },
  ];

  const [aiGeneratedText, setAiGeneratedText] = useState("");

  const generateExplanation = async () => {
    message.loading("Generating explanation");

    const sendingBody = {
      question: values?.questionContent?.question,
      answer: {},
    };

    if (values.answer.multipleChoice) {
      const multipleChoiceOptions = [];
      Object.keys(values.answer.multipleChoice).forEach((option) => {
        if (values.answer.multipleChoice[option]) {
          multipleChoiceOptions.push(values.questionContent[option]);
        }
      });
      sendingBody.answer = multipleChoiceOptions.join(" and ");
    } else if (values.answer.singleChoice) {
      const singleChoiceOption = Object.keys(values.answer.singleChoice).find(
        (option) => values.answer.singleChoice[option]
      );
      sendingBody.answer = values.questionContent[singleChoiceOption];
    }

    const { data } = await axios.post(
      aiUrl + "/generateExplanation",
      sendingBody
    );

    if (data?.msg) {
      setAiGeneratedText(data?.msg);
      message.success("Explanation generated successfully");
    }
  };

  // useEffect(() => {
  //   if (!values?.questionContent) return;
  //   const reIndexedQuestionContent = {};

  //   inputs.forEach((inp, idx) => {
  //     // const oldKey = `option ${
  //     //   inputs.findIndex((input) => input.uuid === inp.uuid) + 1
  //     // }`;
  //     // console.log(newKey,oldKey);
  //     // console.log(inp,idx);

  //     // if (values?.questionContent[oldKey]) {
  //     // console.log(values?.questionContent[inp.uuid]);
  //     const newKey = `option ${idx + 1}`;

  //       reIndexedQuestionContent[newKey] = values?.questionContent[inp.uuid];
  //     // }
  //   });
  //   // console.log(reIndexedQuestionContent);
  //   // console.log(inputs);

  //   const savedQues = values?.questionContent?.question;

  //   dispatch(
  //     setQuestionVals({
  //       ...values,

  //       questionContent: {
  //         question: savedQues,
  //         ...reIndexedQuestionContent,
  //       },
  //     })
  //   );
  // }, [inputs]);
  const [warned, setWarned] = useState(false);
  const handleDelete = (inp) => {
    // if (!values?.questionContent) return;
    const reIndexedQuestionContent = {};
    const reIndexedAnswers = {};
    if (inputs.length == 1) {
      if (!warned) {
        setWarned(true);
        return message.info("Cant delete last option");
      }

      return;
    }
    const typeOfQuestion =
      returnCurrentType() == "mcq"
        ? "singleChoice"
        : returnCurrentType() == "video"
        ? "singleChoice"
        : returnCurrentType() == "audio"
        ? "singleChoice"
        : returnCurrentType() == "msq"
        ? "multipleChoice"
        : null;
    const newInps = inputs.filter((e) => inp.uuid !== e.uuid);
    setInputs(newInps);
    newInps.forEach((inp, idx) => {
      const newKey = `option ${idx + 1}`;

      reIndexedQuestionContent[newKey] = values?.questionContent[inp.uuid];
      reIndexedAnswers[newKey] = values?.answer?.[typeOfQuestion][inp.uuid];
    });

    const savedQues = values?.questionContent?.question;

    dispatch(
      setQuestionVals({
        ...values,

        questionContent: {
          question: savedQues,
          ...reIndexedQuestionContent,
        },
        answer: {
          [typeOfQuestion]: {
            ...reIndexedAnswers,
          },
        },
      })
    );
  };
  if (editStatus === "pending") {
    return (
      <>
        <Skeleton
          paragraph={{
            rows: 2,
          }}
          active={true}
        />
        <br />
        <Skeleton
          paragraph={{
            rows: 2,
          }}
          active={true}
        />
        <br />
        <Skeleton
          paragraph={{
            rows: 2,
          }}
          active={true}
        />
        <br />
        <Skeleton
          paragraph={{
            rows: 2,
          }}
          active={true}
        />
        <br />
        <br />
      </>
    );
  }
  return (
    <div className={addQuestionStyles.container}>
      <Space orientation="vertical" size="middle" style={{ display: "flex" }}>
        {comprehensionArr.includes(type) ? (
          <>
            <Row>
              <Col span={4}>
                <span>Question Type*</span>
              </Col>
              <Col span={8}>
                <Select
                  suffixIcon={null}
                  value={"singleChoice"}
                  onChange={(value) => {
                    setSelectedType(value);
                    resetInputs();
                  }}
                  defaultValue={"multipleChoice"}
                  options={options1}
                />
              </Col>
            </Row>
          </>
        ) : (
          ""
        )}

        {(type == "video" || type == "audio") && (
          <Row>
            <Col span={4}>
              <span>
                {type == "video" ? "Upload Video File" : "Upload Audio File"}
              </span>
            </Col>
            <Col span={20}>
              {type == "video" ? <VideoUpload /> : <AudioUpload />}
            </Col>
          </Row>
        )}

        <Row style={{ marginBottom: "1.5rem", width: "100%" }}>
          <Col span={4}>
            <span style={{ fontWeight: 500 }}>Question*</span>
          </Col>
          <Col span={20}>
            <TextEditor
              editorFun={(val) => {
                dispatch(
                  setQuestionVals({
                    ...values,
                    questionContent: {
                      ...values.questionContent,
                      question: val,
                    },
                  })
                );
              }}
              name="question"
              initialContent={{ question: values?.questionContent?.question }}
            />
          </Col>
        </Row>
        {(returnCurrentType() == "mcq" ||
          returnCurrentType() == "msq" ||
          returnCurrentType() == "video" ||
          returnCurrentType() == "audio") && (
          <div className={addQuestionStyles.optionsContainer}>
            {inputs.map((e, index) => {
              if (returnCurrentType() == "msq")
                return (
                  <Row
                    key={`option ${index + 1}`}
                    style={{ marginBottom: "1.5rem", width: "100%" }}
                  >
                    <Col span={4}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginTop: "5px" }}>
                        <Checkbox
                          onChange={(val) => {
                            dispatch(
                              setQuestionVals({
                                ...values,
                                answer: {
                                  multipleChoice: {
                                    ...values?.answer?.multipleChoice,
                                    [e.uuid]: val.target.checked,
                                  },
                                },
                              })
                            );
                          }}
                          checked={
                            values?.answer?.multipleChoice &&
                            (values?.answer?.multipleChoice[e.uuid] ||
                              values?.answer?.multipleChoice[e.uuid])
                          }
                        />
                        <FaTrash
                          onClick={() => {
                            handleDelete(e);
                          }}
                          className={addQuestionStyles.deleteIcon}
                          size={16}
                          color="red"
                          style={{ cursor: "pointer", marginTop: "4px" }}
                        />
                        <span style={{ whiteSpace: "nowrap", fontWeight: 500 }}>Option {index + 1}</span>
                      </div>
                    </Col>
                    <Col span={20}>
                      <TextEditor
                        editorFun={(val) => {
                          dispatch(
                            setQuestionVals({
                              ...values,
                              questionContent: {
                                ...values.questionContent,
                                [`option ${index + 1}`]: val,
                              },
                            })
                          );
                        }}
                        name={`option ${index + 1}`}
                        initialContent={{
                          [`option ${index + 1}`]:
                            values &&
                            values.questionContent &&
                            values.questionContent[`option ${index + 1}`],
                        }}
                      />
                    </Col>
                      </Row>
                );
              if (
                returnCurrentType() == "mcq" ||
                returnCurrentType() == "video" ||
                returnCurrentType() == "audio"
              ) {
                const currentVal =
                  (values &&
                    values.answer &&
                    values.answer.singleChoice &&
                    Object.keys(values.answer.singleChoice)[0]) ||
                  "";
                return (
                  <div
                    key={"Option " + (index + 1)}
                    style={{ width: "100%", marginBottom: "1.5rem" }}
                  >
                    <Radio.Group
                      value={currentVal}
                      style={{ width: "100%" }}
                    >
                      <Row key={e.uuid} style={{ width: "100%" }}>
                        <Col span={4}>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginTop: "5px" }}>
                            <Radio
                              value={`option ${index + 1}`}
                              onChange={(e) => {
                                const typeOfQuestion =
                                  returnCurrentType() == "mcq"
                                    ? "singleChoice"
                                    : returnCurrentType() == "video"
                                    ? "singleChoice"
                                    : returnCurrentType() == "audio"
                                    ? "singleChoice"
                                    : null;
                                if (typeOfQuestion) {
                                  dispatch(
                                    setQuestionVals({
                                      ...values,
                                      answer: {
                                        [typeOfQuestion]: {
                                          [`option ${index + 1}`]:
                                            e.target.checked,
                                        },
                                      },
                                    })
                                  );
                                }
                              }}
                            />
                            <FaTrash
                              onClick={() => {
                                handleDelete(e);
                              }}
                              className={addQuestionStyles.deleteIcon}
                              size={16}
                              color="red"
                              style={{ cursor: "pointer", marginTop: "4px" }}
                            />
                            <span style={{ whiteSpace: "nowrap", fontWeight: 500 }}>Option {index + 1}</span>
                          </div>
                        </Col>
                        <Col span={20}>
                          <TextEditor
                            editorFun={(val) => {
                              dispatch(
                                setQuestionVals({
                                  ...values,
                                  questionContent: {
                                    ...values.questionContent,
                                    [`option ${index + 1}`]: val,
                                  },
                                })
                              );
                            }}
                            name={`option ${index + 1}`}
                            initialContent={{
                              [`option ${index + 1}`]:
                                values &&
                                values.questionContent &&
                                values.questionContent[`option ${index + 1}`],
                            }}
                          />
                        </Col>
                      </Row>
                    </Radio.Group>
                  </div>
                );
              }
            })}
            <div className={addQuestionStyles.addoption_div}>
              <div className={addQuestionStyles.empty_div}></div>
              <Button
                onClick={() =>
                  setInputs([
                    ...inputs,
                    { uuid: `option ${inputs?.length + 1}` },
                  ])
                }
                className={addQuestionStyles.btn}
              >
                <IoAdd /> Add Option
              </Button>
            </div>
          </div>
        )}
        {returnCurrentType() == "shortPara" && (
          <Row style={{ marginBottom: "1.5rem", width: "100%" }}>
            <Col span={4}>
              <span style={{ fontWeight: 500 }}>Answer</span>
            </Col>
            <Col span={20}>
              <TextEditor
                name="shortPara"
                initialContent={{ shortPara: values?.answer?.shortPara }}
                editorFun={(val) => {
                  dispatch(
                    setQuestionVals({
                      ...values,
                      answer: {
                        ...values.answer,
                        shortPara: val,
                      },
                    })
                  );
                }}
              />
            </Col>
          </Row>
        )}
        {returnCurrentType() == "trueFalse" && (
          <Row>
            <Col span={4}>
              <span>Answer</span>
            </Col>
            <Col span={8}>
              <Radio.Group
                className={addQuestionStyles.true_false_cont}
                onChange={(e) => {
                  dispatch(
                    setQuestionVals({
                      ...values,
                      answer: {
                        ...values?.answer,
                        truefalse: e.target.value,
                      },
                    })
                  );
                }}
                value={values && values.answer && values.answer.truefalse}
              >
                <Radio className={addQuestionStyles.radio_inputs} value={true}>
                  <Row>
                    <Input value="True" />
                  </Row>
                </Radio>
                <Radio className={addQuestionStyles.radio_inputs} value={false}>
                  <Row>
                    <Input value="False" />
                  </Row>
                </Radio>
              </Radio.Group>
            </Col>
          </Row>
        )}

        <div className={addQuestionStyles.explanation}>
          <Row style={{ marginBottom: "1.5rem", width: "100%" }}>
            <Col span={4}>
              <span style={{ fontWeight: 500 }}>
                Explanation
              </span>
            </Col>
            <Col span={20}>
              <TextEditor
                editorFun={(val) => {
                  dispatch(
                    setQuestionVals({
                      ...values,
                      answer: {
                        ...values?.answer,
                        explanation: val,
                      },
                    })
                  );
                }}
                name="explanation"
                initialContent={{
                  explanation: aiGeneratedText
                    ? aiGeneratedText
                    : values?.answer?.explanation,
                }}
              />
            </Col>
          </Row>

          {/* <button
            className={addQuestionStyles.aiButton}
            onClick={generateExplanation}
          >
            Generate an explanation using AI
          </button> */}
        </div>
        <h3 className={addQuestionStyles.score_settings_h3}>Score Settings</h3>
        <Space orientation="vertical" size="middle" style={{ display: "flex" }}>
          {/* <div className={addQuestionStyles.score_radio_div}>
            <Checkbox
              onChange={(e) => {
                dispatch(
                  setQuestionVals({
                    ...values,
                    scoreSettings: {
                      ...values?.scoreSettings,
                      displayMaxScore: e.target.checked,
                    },
                  })
                );
              }}
              checked={values?.scoreSettings?.displayMaxScore}
              className={addQuestionStyles.score_checkbox}
            >
              Display maximum possible score for this question
            </Checkbox>
          </div>
          <div className={addQuestionStyles.score_radio_div}>
            <Checkbox
              onChange={(e) => {
                dispatch(
                  setQuestionVals({
                    ...values,
                    scoreSettings: {
                      ...values?.scoreSettings,
                      requiredQuestion: e.target.checked,
                    },
                  })
                );
              }}
              checked={values?.scoreSettings?.requiredQuestion}
              className={addQuestionStyles.score_checkbox}
            >
              Force respondent to answer this question when displayed the first
              time
            </Checkbox>
          </div> */}
          <Radio.Group
            value={values?.scoreSettings?.scoreType || "fullScore"}
            onChange={(e) => {
              dispatch(
                setQuestionVals({
                  ...values,
                  ...resources,
                  scoreSettings: {
                    ...values?.scoreSettings,
                    scoreType: e.target.value,
                  },
                })
              );
              // dispatch(setQuestionVals({keysArr:["scoreSettings","scoreType"],value:e.target.value}))
            }}
            className={addQuestionStyles.radio_cont}
          >
            <div className={addQuestionStyles.scoreSettings_cont}>
              <span className={addQuestionStyles.fullscore_span}>
                <Radio
                  value="fullScore"
                  className={addQuestionStyles.radio_text}
                >
                  Full Score
                </Radio>
              </span>
              <div className={addQuestionStyles.radio_inputs_div}>
                <div className={addQuestionStyles.single_inp}>
                  <InputNumber
                    controls={false}
                    disabled={
                      values?.scoreSettings?.scoreType == "partialScore"
                    }
                    className={addQuestionStyles.numberInp}
                    changeOnWheel={false}
                    placeholder="Number of Points for Correct answer (>0)"
                    min={0.01}
                    value={values?.scoreSettings?.pointsForCorrectAns}
                    onChange={(val) => {
                      const newvals = JSON.parse(JSON.stringify(values));

                      delete newvals?.scoreSettings?.PointsForEachCorrectAnswer;
                      delete newvals?.scoreSettings?.bonusPointsForAllCorrect;
                      delete newvals?.scoreSettings?.negativePartialType;
                      delete newvals?.scoreSettings?.pointsForEachIncorrectAns;
                      delete newvals?.scoreSettings
                        ?.partialPointsForEachInCorrectAns;

                      dispatch(
                        setQuestionVals({
                          ...newvals,
                          scoreSettings: {
                            scoreType: "fullScore",
                            ...newvals.scoreSettings,
                            pointsForCorrectAns: val,
                          },
                        })
                      );
                    }}
                    step={0.01}
                    parser={(value) => value.replace(/[^\d.]/g, "")}
                  />
                </div>
                <Text type="info">
                  *Number of Points for Correct answer {`(>0)`}
                </Text>
                <div className={addQuestionStyles.single_inp}>
                  <InputNumber
                    controls={false}
                    disabled={
                      values?.scoreSettings?.scoreType == "partialScore"
                    }
                    className={addQuestionStyles.numberInp}
                    changeOnWheel={false}
                    placeholder="Number of Points for Incorrect answer (<=0)"
                    max={0}
                    value={
                      values &&
                      values.scoreSettings &&
                      values.scoreSettings.pointsForIncorrectAns
                    }
                    onChange={(val) => {
                      const newvals = JSON.parse(JSON.stringify(values));
                      delete newvals?.scoreSettings?.PointsForEachCorrectAnswer;
                      delete newvals?.scoreSettings?.bonusPointsForAllCorrect;
                      delete newvals?.scoreSettings?.negativePartialType;
                      delete newvals?.scoreSettings?.pointsForEachIncorrectAns;
                      delete newvals?.scoreSettings
                        ?.partialPointsForEachInCorrectAns;

                      dispatch(
                        setQuestionVals({
                          ...newvals,
                          scoreSettings: {
                            scoreType: "fullScore",
                            ...newvals.scoreSettings,
                            pointsForIncorrectAns: val,
                          },
                        })
                      );
                    }}
                    step={0.01}
                    parser={(value) => {
                      let parsedValue = parseFloat(
                        value.replace(/[^-?\d.]/g, "")
                      );
                      return isNaN(parsedValue)
                        ? ""
                        : parsedValue > 0
                        ? -parsedValue
                        : parsedValue;
                    }}
                    formatter={(value) => {
                      return value === 0 || value === "" ? "" : value;
                    }}
                  />
                </div>
                <Text type="info">
                  *Number of Points for Incorrect answer {`(<=0)`}
                </Text>
              </div>
            </div>
            <div className={addQuestionStyles.scoreSettings_cont}>
              <span className={addQuestionStyles.fullscore_span}>
                <Radio
                  disabled={type !== "multipleChoice"}
                  value="partialScore"
                  className={addQuestionStyles.radio_text}
                >
                  Partial Score
                </Radio>
              </span>
              <div className={addQuestionStyles.radio_inputs_div}>
                <div className={addQuestionStyles.single_inp}>
                  <InputNumber
                    controls={false}
                    disabled={
                      values?.scoreSettings?.scoreType == "fullScore" ||
                      type !== "multipleChoice"
                    }
                    className={addQuestionStyles.numberInp}
                    changeOnWheel={false}
                    placeholder="Number of Points if each correct"
                    min={0}
                    value={values?.scoreSettings?.PointsForEachCorrectAnswer}
                    onChange={(val) => {
                      console.log(val);

                      const newvals = JSON.parse(JSON.stringify(values));

                      delete newvals?.scoreSettings?.pointsForCorrectAns;
                      delete newvals?.scoreSettings?.pointsForIncorrectAns;

                      dispatch(
                        setQuestionVals({
                          ...newvals,
                          scoreSettings: {
                            PointsForEachCorrectAnswer: val,
                            scoreType: "partialScore",
                            ...newvals.scoreSettings,
                          },
                        })
                      );
                    }}
                    step={0.01}
                    parser={(value) => value.replace(/[^\d.]/g, "")}
                  />
                </div>
                <Text type="info">
                  *Number of Points if each correct/partial answer
                </Text>
                <div className={addQuestionStyles.single_inp}>
                  <InputNumber
                    controls={false}
                    disabled={
                      values?.scoreSettings?.scoreType == "fullScore" ||
                      type !== "multipleChoice"
                    }
                    className={addQuestionStyles.numberInp}
                    changeOnWheel={false}
                    placeholder="Number of Bonus Points if all correct"
                    min={0}
                    value={
                      values &&
                      values?.scoreSettings &&
                      values?.scoreSettings?.bonusPointsForAllCorrect
                    }
                    onChange={(val) => {
                      const newvals = JSON.parse(JSON.stringify(values));

                      delete newvals?.scoreSettings?.pointsForCorrectAns;
                      delete newvals?.scoreSettings?.pointsForIncorrectAns;

                      dispatch(
                        setQuestionVals({
                          ...newvals,
                          scoreSettings: {
                            scoreType: "partialScore",
                            ...newvals.scoreSettings,
                            bonusPointsForAllCorrect: val,
                          },
                        })
                      );
                    }}
                    step={0.01}
                    parser={(value) => value.replace(/[^\d.]/g, "")}
                  />
                </div>
                <Text type="info">
                  *Bonus Points are added on top of the regular score , if the
                  student answers all the partial answers correct.
                </Text>
                <Row>
                  <Radio.Group
                    value={
                      values?.scoreSettings?.negativePartialType
                        ? values?.scoreSettings?.negativePartialType
                        : "fullNegative"
                    }
                    onChange={(e) => {
                      const newvals = JSON.parse(JSON.stringify(values));

                      delete newvals?.scoreSettings?.pointsForCorrectAns;
                      delete newvals?.scoreSettings?.pointsForIncorrectAns;

                      dispatch(
                        setQuestionVals({
                          ...newvals,
                          scoreSettings: {
                            scoreType: "partialScore",
                            ...newvals.scoreSettings,
                            negativePartialType: e.target.value,
                          },
                        })
                      );
                    }}
                    disabled={
                      values?.scoreSettings?.scoreType == "fullScore" ||
                      type !== "multipleChoice"
                    }
                    className={addQuestionStyles.bonus_div}
                  >
                    <div className={addQuestionStyles.nagative_div}>
                      <Radio value={"fullNegative"}></Radio>
                      <Row>
                        <div>
                          <div>
                            <InputNumber
                              controls={false}
                              disabled={
                                values?.scoreSettings?.scoreType ==
                                  "fullScore" ||
                                values?.scoreSettings?.negativePartialType ==
                                  "partialNegative" ||
                                type !== "multipleChoice"
                              }
                              className={addQuestionStyles.numberInp}
                              changeOnWheel={false}
                              placeholder="Number of Points for Incorrect answer (<=0)"
                              max={0}
                              value={
                                values &&
                                values.scoreSettings &&
                                values.scoreSettings.pointsForEachIncorrectAns
                              }
                              onChange={(val) => {
                                const newvals = JSON.parse(
                                  JSON.stringify(values)
                                );

                                delete newvals?.scoreSettings
                                  ?.pointsForCorrectAns;
                                delete newvals?.scoreSettings
                                  ?.pointsForIncorrectAns;
                                dispatch(
                                  setQuestionVals({
                                    ...newvals,
                                    scoreSettings: {
                                      scoreType: "partialScore",
                                      ...newvals.scoreSettings,
                                      pointsForEachIncorrectAns: val,
                                    },
                                  })
                                );
                              }}
                              step={0.01}
                              parser={(value) => {
                                let parsedValue = parseFloat(
                                  value.replace(/[^-?\d.]/g, "")
                                );
                                return isNaN(parsedValue)
                                  ? ""
                                  : parsedValue > 0
                                  ? -parsedValue
                                  : parsedValue;
                              }}
                              formatter={(value) => {
                                return value === 0 || value === "" ? "" : value;
                              }}
                            />
                          </div>
                          <Text type="info">
                            *Number of Points for each Incorrect answer{" "}
                            {`(<=0)`}
                          </Text>
                        </div>
                      </Row>
                    </div>
                    {/* <div className={addQuestionStyles.nagative_div}>
                      <Radio value={"partialNegative"}></Radio>
                      <div>
                        <div>
                          <InputNumber
                            controls={false}
                            disabled={
                              values?.scoreSettings?.scoreType == "fullScore" ||
                              values?.scoreSettings?.negativePartialType ==
                                "fullNegative" || !values?.scoreSettings?.negativePartialType || 
                              type !== "multipleChoice"
                            }
                            className={addQuestionStyles.numberInp}
                            changeOnWheel={false}
                            placeholder="Number of Points for Each Incorrect partial answer (<=0)"
                            max={0}
                            value={
                              values &&
                              values.scoreSettings &&
                              values.scoreSettings
                                .partialPointsForEachInCorrectAns
                            }
                            onChange={(val) => {
                                    
                      const newvals = JSON.parse(JSON.stringify(values));

                      delete newvals?.scoreSettings?.pointsForCorrectAns;
                      delete newvals?.scoreSettings?.pointsForIncorrectAns;
                              dispatch(
                                setQuestionVals({
                                  ...newvals,
                                  scoreSettings: {
                                    scoreType : "partialScore",
                                    ...newvals.scoreSettings,
                                    partialPointsForEachInCorrectAns: val,
                                  },
                                })
                              );
                            }}
                          />
                        </div>

                        <Text type="info">
                          *Number of Points for Each Incorrect partial answer
                          {`(<=0)`}
                        </Text>
                      </div>
                    </div> */}
                  </Radio.Group>
                </Row>
              </div>
            </div>
          </Radio.Group>
        </Space>
      </Space>
    </div>
  );
}
