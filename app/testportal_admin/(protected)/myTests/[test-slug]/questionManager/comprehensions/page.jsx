"use client";
import React, { useEffect, useState } from "react";
import {
  message,
  Radio,
  InputNumber,
  Space,
  Checkbox,
  Row,
  Typography,
  Button,
  Popconfirm,
  Skeleton,
  Spin,
  Alert,
} from "antd";
import styles from "./styles/QuestionComponent.module.scss";
import TextEditor from "@/modules/testportal_admin/components/reusable-comps/editor/editor";
import { useParams, usePathname } from "next/navigation";
import { useDispatch } from "react-redux";
import {
  addQuestionComprehension,
  deleteQuestionComprehension,
  getOneComprehensionQuestion,
  saveComprehensionQuestion,
  updateComprehensionQues,
} from "@/redux/slices/testportal_admin/slice/comprehensionQestions";
import { useSelector } from "react-redux";
import {
  getSstorage,
  setSstorage,
  windowObj,
} from "@/utils/universalUtils/windowMW";
import { updateQuestion } from "@/redux/slices/testportal_admin/slice/questions";
import AudioUpload from "../utils/audio";
import VideoUpload from "../utils/video";
import { IoAdd } from "react-icons/io5";
import { Option } from "antd/es/mentions";
import { useRouter } from "next/navigation";
import { FaTrash } from "react-icons/fa";
import QuestionSkeleton from "@/modules/testportal_admin/components/reusable-comps/skeleton/questionSkeleton";

const { Text } = Typography;
const ComprehensionQuestions = () => {
  const router = useRouter();
  function isValidObjectId(id) {
    return /^[a-f\d]{24}$/i.test(id);
  }

  const comprehensionQuestion = useSelector(
    (state) => state.comprehension.comprehensionQuestion
  );
  const ComprehensionQueStatus = useSelector(
    (state) => state.comprehension.ComprehensionQueStatus.status
  );

  const params = useParams();
  const selectedId = params["test-slug"]?.split("_id-")[1];
  const dispatch = useDispatch();

  const [isReadingComprehensionSaved, setIsReadingComprehensionSaved] =
    useState(false);
  const [isAudioComprehensionSaved, setIsAudioComprehensionSaved] =
    useState(false);
  const [isVideoComprehensionSaved, setIsVideoComprehensionSaved] =
    useState(false);

  const [comprehensionType, setComprehensionType] = useState(
    "Reading Comprehension"
  );
  const [comprehensionText, setComprehensionText] = useState("");

  const [questions, setQuestions] = useState([
    {
      _id: Date.now(),
      questionType: "Multiple Choice",
      questionContent: {
        question: "",
        "option 1": "",
        "option 2": "",
      },
      answer: {
        multipleChoice: { "option 1": false, "option 2": false },
        singleChoice: {},
        truefalse: false,
        explanation: "",
      },
      scoreSettings: {
        scoreType: "fullScore",
      },
    },
  ]);

  const [compId, setCompId] = useState("");
  const windowObj = () => {
    if (typeof window !== "undefined") {
      return window;
    }
  };
  useEffect(() => {
    if (
      !comprehensionQuestion?._id &&
      windowObj().location.href?.split("?qid=")[1]?.length
    ) {
      dispatch(
        getOneComprehensionQuestion({
          id: windowObj().location.href?.split("?qid=")[1],
        })
      );
    }
  }, [windowObj().location.href?.split("?qid=")[1]?.length]);

  useEffect(() => {
    if (comprehensionQuestion?._id) {
      setCompId(comprehensionQuestion?._id);
      setComprehensionText(comprehensionQuestion?.comprehensionText);
      setComprehensionType(comprehensionQuestion?.questionType);
      setQuestions(comprehensionQuestion?.questionContentArr);
    } else {
      setCompId("");
      setComprehensionText("");
      setComprehensionType("Reading Comprehension");
      setQuestions([
        {
          _id: Date.now(),
          questionType: "Multiple Choice",
          questionContent: {
            question: "",
            "option 1": "",
            "option 2": "",
          },
          answer: {
            multipleChoice: { "option 1": false, "option 2": false },
            singleChoice: {},
            truefalse: false,
            explanation: "",
          },
          scoreSettings: {
            scoreType: "fullScore",
          },
        },
      ]);
    }
  }, [
    comprehensionQuestion?._id,
    windowObj().location.href?.split("?qid=")[1],
  ]);

  const handleAddQuestion = () => {
    const newQuestion = {
      _id: Date.now(),
      questionType: "Multiple Choice",
      questionContent: {
        question: "",
        "option 1": "",
        "option 2": "",
      },
      answer: {
        multipleChoice: { "option 1": false, "option 2": false },
        singleChoice: {},
        truefalse: false,
        explanation: "",
      },
      scoreSettings: {
        scoreType: "fullScore",
      },
    };

    setQuestions([...questions, newQuestion]);
  };

  const handleDeleteQuestion = (id) => {
    if (isValidObjectId(id))
      dispatch(deleteQuestionComprehension({ compId: compId, questionId: id }));

    if (questions.length === 1) {
      message.warning("At least one question must remain.");
      return;
    }
    setQuestions(questions.filter((question) => question._id !== id));
  };

  const handleQuestionTypeChange = (id, value) => {
    setQuestions(
      questions.map((question) =>
        question._id === id
          ? {
              ...question,
              questionType: value,
              answer: initializeAnswer(value),
              questionContent: initializeOptions(value),
            }
          : question
      )
    );
  };

  const initializeAnswer = (questionType) => {
    const answer = { explanation: "" };
    switch (questionType) {
      case "Multiple Choice":
        answer.multipleChoice = {};
        break;
      case "Single Choice":
        answer.singleChoice = {};
        break;
      case "True - False":
        answer.truefalse = false;
        break;
      default:
        break;
    }
    return answer;
  };

  const initializeOptions = (questionType) => {
    if (
      questionType === "Multiple Choice" ||
      questionType === "Single Choice"
    ) {
      return {
        question: "",
        "option 1": "",
        "option 2": "",
      };
    } else if (questionType === "True - False") {
      return {
        question: "",
        "option 1": "True",
        "option 2": "False",
      };
    }
    return { question: "" };
  };

  const handleTextChange = (text) => {
    setComprehensionText(text);
  };

  const handleQuestionTextChange = (id, text) => {
    setQuestions(
      questions.map((question) =>
        question._id === id
          ? {
              ...question,
              questionContent: {
                ...question.questionContent,
                question: text,
              },
            }
          : question
      )
    );
  };

  const updateQuestionComp = (id) => {
    if (compId) {
      const questionToSave = questions.find((question) => question._id === id);

      if (!questionToSave) {
        message.error("Question not found.");
        return;
      }

      let cleanedAnswer = {};
      let cleanedQuestionContent = {
        question: questionToSave.questionContent.question,
      };

      if (questionToSave.questionType === "Multiple Choice") {
        cleanedAnswer = {
          multipleChoice: questionToSave.answer.multipleChoice,
          explanation: questionToSave.answer.explanation,
        };
        cleanedQuestionContent = {
          ...questionToSave.questionContent,
        };
      } else if (questionToSave.questionType === "Single Choice") {
        cleanedAnswer = {
          singleChoice: questionToSave.answer.singleChoice,
          explanation: questionToSave.answer.explanation,
        };
        cleanedQuestionContent = {
          ...questionToSave.questionContent,
        };
      } else if (questionToSave.questionType === "True - False") {
        cleanedAnswer = {
          truefalse: questionToSave.answer.truefalse,
          explanation: questionToSave.answer.explanation,
        };
      }

      const { _id, ...questionWithoutId } = questionToSave;

      const data = {
        compId: compId,
        ...questionWithoutId,
        questionContent: cleanedQuestionContent,
        answer: cleanedAnswer,
      };

      dispatch(
        updateQuestion({
          ...data,
          questionId: id,
          testId: selectedId,
          dispatch,
        })
      );
    } else {
      message.error("First you should add comprehension file to add questions");
    }
  };

  const handleAddOption = (id) => {
    setQuestions(
      questions.map((question) => {
        if (question._id === id) {
          const numOptions = Object.keys(question.questionContent).filter(
            (key) => key.startsWith("option")
          ).length;
          const newOptionKey = `option ${numOptions + 1}`;

          return {
            ...question,
            questionContent: {
              ...question.questionContent,
              [newOptionKey]: "",
            },
            answer: {
              ...question.answer,
              multipleChoice: {
                ...question.answer.multipleChoice,
                [newOptionKey]: false,
              },
            },
          };
        }
        return question;
      })
    );
  };

  const handleDeleteOption = (id, optionKey) => {
    setQuestions(
      questions.map((question) => {
        if (question._id === id) {
          const { [optionKey]: _, ...remainingOptions } =
            question.questionContent;
          const { [optionKey]: __, ...remainingAnswers } =
            question.answer.multipleChoice;

          if (Object.keys(remainingOptions).length === 0) {
            message.warning("At least one option must remain.");
            return question;
          }

          return {
            ...question,
            questionContent: remainingOptions,
            answer: {
              ...question.answer,
              multipleChoice: remainingAnswers,
            },
          };
        }
        return question;
      })
    );
  };

  const handleOptionChange = (id, optionKey, text) => {
    setQuestions(
      questions.map((question) => {
        if (question._id === id) {
          return {
            ...question,
            questionContent: {
              ...question.questionContent,
              [optionKey]: text,
            },
          };
        }
        return question;
      })
    );
  };

  const handleSelectAnswer = (id, optionKey, checked) => {
    setQuestions(
      questions.map((question) => {
        if (question._id === id) {
          let updatedAnswer = {};

          if (question.questionType === "Multiple Choice") {
            updatedAnswer = {
              ...question.answer,
              multipleChoice: {
                ...question.answer.multipleChoice,
                [optionKey]: checked,
              },
            };
          } else if (question.questionType === "Single Choice") {
            updatedAnswer = {
              ...question.answer,
              singleChoice: {
                [optionKey]: checked,
              },
            };
          } else if (question.questionType === "True - False") {
            updatedAnswer = {
              ...question.answer,
              truefalse: optionKey === "True",
            };
          }

          return {
            ...question,
            answer: updatedAnswer,
          };
        }
        return question;
      })
    );
  };

  const [audioUrl, setAudioUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [savedQuestions, setSavedQuestions] = useState("");

  const handleSaveQuestion = (id) => {
    if (compId) {
      if (savedQuestions.includes(id)) {
        message.info("This question has already been saved.");
        return;
      }

      const questionToSave = questions.find((question) => question._id === id);

      if (!questionToSave) {
        message.error("Question not found.");
        return;
      }

      if (!questionToSave.questionContent?.question) {
        message.error("Question content is required.");
        return;
      }
      if (!questionToSave.answer) {
        message.error("Answer must be provided.");
        return;
      }
      if (questionToSave.questionType === "Single Choice") {
        const { singleChoice } = questionToSave.answer;
        if (
          !singleChoice ||
          Object.values(singleChoice).every((val) => val !== true)
        ) {
          message.error("Please provide an answer for Single Choice.");
          return;
        }
      }
      if (questionToSave.questionType === "Multiple Choice") {
        const { multipleChoice } = questionToSave.answer;
        if (
          !multipleChoice ||
          Object.values(multipleChoice).every((val) => val !== true)
        ) {
          message.error("Please provide an answer for Multiple Choice.");
          return;
        }
      }
      if (questionToSave.scoreSettings?.scoreType === "fullScore") {
        if (!questionToSave.scoreSettings?.pointsForCorrectAns) {
          message.error("Points for the correct answer are required.");
          return;
        }
      } else if (questionToSave.scoreSettings?.scoreType === "partialScore") {
        if (!questionToSave.scoreSettings?.PointsForEachCorrectAnswer) {
          message.error("Points for each correct answer are required.");
          return;
        }
      } else {
        message.error("Invalid score type or missing score settings.");
        return;
      }

      if (
        questionToSave.questionType === "Multiple Choice" &&
        !questionToSave.answer?.multipleChoice
      ) {
        message.error("Multiple choice answers are required.");
        return;
      }

      if (
        questionToSave.questionType === "Single Choice" &&
        !questionToSave.answer?.singleChoice
      ) {
        message.error("Single choice answer is required.");
        return;
      }

      if (
        questionToSave.questionType === "True - False" &&
        questionToSave.answer?.truefalse === undefined
      ) {
        message.error("True/False answer is required.");
        return;
      }

      let cleanedAnswer = {};
      let cleanedQuestionContent = {
        question: questionToSave.questionContent.question,
      };

      if (questionToSave.questionType === "Multiple Choice") {
        cleanedAnswer = {
          multipleChoice: questionToSave.answer.multipleChoice,
          explanation: questionToSave.answer.explanation,
        };
        cleanedQuestionContent = {
          ...questionToSave.questionContent,
        };
      } else if (questionToSave.questionType === "Single Choice") {
        cleanedAnswer = {
          singleChoice: questionToSave.answer.singleChoice,
          explanation: questionToSave.answer.explanation,
        };
        cleanedQuestionContent = {
          ...questionToSave.questionContent,
        };
      } else if (questionToSave.questionType === "True - False") {
        cleanedAnswer = {
          truefalse: questionToSave.answer.truefalse,
          explanation: questionToSave.answer.explanation,
        };
      }

      const { _id, ...questionWithoutId } = questionToSave;

      const data = {
        compId: compId,
        ...questionWithoutId,
        questionContent: cleanedQuestionContent,
        answer: cleanedAnswer,
      };

      dispatch(addQuestionComprehension(data));
      setSavedQuestions((prev) => [...prev, id]);
    } else {
      message.error(
        "First you should add a comprehension file to add questions"
      );
    }
  };

  const handleSave = () => {
    if (comprehensionType === "Reading Comprehension") {
      if (isReadingComprehensionSaved) {
        message.info("Reading Comprehension is already saved.");
        return;
      }

      if (comprehensionText === "") {
        message.info("Reading Comprehension text is required.");
        return;
      }

      const data = {
        comprehensionText,
        questionType: comprehensionType,
      };

      dispatch(
        saveComprehensionQuestion({ ...data, testId: selectedId })
      )?.then((resp) => {
        if (resp?.payload?.id) {
          setSstorage("createdComprehensionId", resp?.payload?.id);
          setCompId(resp?.payload?.id);
          message.success("Comprehension Question Created Successfully");
          setIsReadingComprehensionSaved(true);
          router.push(`?qid=${resp?.payload?.id}`);
        }
      });
    }

    if (comprehensionType === "Audio Comprehension") {
      if (isAudioComprehensionSaved) {
        message.info("Audio Comprehension is already saved.");
        return;
      }
      if (audioUrl === "") {
        message.info("Audio URL is required.");
        return;
      }

      const data = {
        questionType: comprehensionType,
        resources: {
          url: audioUrl,
        },
      };

      dispatch(
        saveComprehensionQuestion({ ...data, testId: selectedId })
      )?.then((resp) => {
        if (resp?.payload?.id) {
          setSstorage("createdComprehensionId", resp?.payload?.id);
          setCompId(resp?.payload?.id);
          message.success("Comprehension Question Created Successfully");
          setIsAudioComprehensionSaved(true);
        }
      });
    }

    if (comprehensionType === "Video Comprehension") {
      if (isVideoComprehensionSaved) {
        message.info("Video Comprehension is already saved.");
        return;
      }

      if (videoUrl === "") {
        message.info("Video URL is required.");
        return;
      }

      const data = {
        questionType: comprehensionType,
        resources: {
          url: videoUrl,
        },
      };

      dispatch(
        saveComprehensionQuestion({ ...data, testId: selectedId })
      )?.then((resp) => {
        if (resp?.payload?.id) {
          setSstorage("createdComprehensionId", resp?.payload?.id);
          setCompId(resp?.payload?.id);
          message.success("Comprehension Question Created Successfully");
          setIsVideoComprehensionSaved(true);
        }
      });
    }
  };

  const handleScoreSettingsChange = (id, key, value) => {
    setQuestions(
      questions.map((question) => {
        if (question._id === id) {
          return {
            ...question,
            scoreSettings: {
              ...question.scoreSettings,
              [key]: value,
            },
          };
        }
        return question;
      })
    );
  };

  const updateQuestionComprehension = () => {
    if (comprehensionType == "Reading Comprehension") {
      const data = {
        comprehensionText,
        questionType: comprehensionType,
      };

      dispatch(updateComprehensionQues({ body: data, compId: compId }));
    }
    if (comprehensionType == "Audio Comprehension") {
      const data = {
        questionType: comprehensionType,
        resources: {
          url: audioUrl,
        },
      };

      dispatch(updateComprehensionQues({ body: data, compId: compId }));
    }
    if (comprehensionType == "Video Comprehension") {
      const data = {
        questionType: comprehensionType,
        resources: {
          url: videoUrl,
        },
      };
      dispatch(updateComprehensionQues({ body: data, compId: compId }));
    }
  };

  if (ComprehensionQueStatus == "pending") {
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
        {/* <Spin tip="Loading...">
          <Alert
            message="Alert message title"
            description="Further details about the context of this alert."
            type="info"
          />
        </Spin> */}
      </>
    );
  } else
    return (
      <div className={styles.questionComponent}>
        <div className={styles.comprehensionType}>
          <label>Comprehension Type:</label>
          <select
            value={comprehensionType}
            onChange={(e) => setComprehensionType(e.target.value)}
            className={styles.select}
          >
            <option value="Reading Comprehension">Reading Comprehension</option>
            <option value="Audio Comprehension">Audio Comprehension</option>
            <option value="Video Comprehension">Video Comprehension</option>
          </select>
        </div>

        <div className={styles.comprehensionInput}>
          <label>{comprehensionType}:</label>

          <div className={styles.editor_save_btn_cont}>
            {comprehensionType === "Reading Comprehension" ? (
              <TextEditor
                placeholder="Enter comprehension text"
                value={comprehensionText}
                editorFun={(e) => handleTextChange(e)}
                name="comprehensionText"
                initialContent={{ comprehensionText: comprehensionText }}
                className={styles.textarea}
              />
            ) : comprehensionType === "Audio Comprehension" ? (
              <AudioUpload audioUrl={audioUrl} setAudioUrl={setAudioUrl} />
            ) : (
              <VideoUpload videoUrl={videoUrl} setVideoUrl={setVideoUrl} />
            )}
            <button
              onClick={() => {
                if (isValidObjectId(comprehensionQuestion?._id)) {
                  updateQuestionComprehension();
                } else {
                  handleSave();
                }
              }}
              className={styles.saveButton1}
            >
              {isValidObjectId(comprehensionQuestion?._id)
                ? "Update Comprehension"
                : "Save Comprehension"}
            </button>
          </div>
        </div>

        {questions?.map((question) => (
          <div key={question._id} className={styles.question}>
            <div className={styles.questionType}>
              <label>Question Type:</label>
              <select
                value={question.questionType}
                onChange={(e) =>
                  handleQuestionTypeChange(question._id, e.target.value)
                }
                className={styles.select}
              >
                <option value="Multiple Choice">Multiple Choice</option>
                <option value="Single Choice">Single Choice</option>
                <option value="True - False">True/False</option>
              </select>
            </div>

            <div className={styles.question_cont}>
              <label htmlFor="">Question*</label>
              <div className={styles.questionInput_cont}>
                <TextEditor
                  placeholder="Question"
                  value={question.questionContent.question}
                  editorFun={(e) => handleQuestionTextChange(question._id, e)}
                  name="question"
                  initialContent={{
                    question: question?.questionContent?.question,
                  }}
                  className={styles.questionInput}
                />
              </div>
            </div>

            {question.questionType != "True - False" &&
              Object.keys(question.questionContent || {})
                .filter((key) => key.startsWith("option"))
                .map((optionKey, index) => (
                  <div key={optionKey} className={styles.option}>
                    <div className={styles.option_delete_cont}>
                      {question.questionType === "Single Choice" ? (
                        <Radio
                          type="radio"
                          name={`singleChoice-${question._id}`}
                          checked={
                            question?.answer?.singleChoice[optionKey] || false
                          }
                          onChange={(e) =>
                            handleSelectAnswer(
                              question._id,
                              optionKey,
                              e.target.checked
                            )
                          }
                          className={styles.radio}
                        />
                      ) : (
                        <Checkbox
                          type="checkbox"
                          checked={
                            question?.answer?.multipleChoice?.[optionKey] ||
                            false
                          }
                          onChange={(e) =>
                            handleSelectAnswer(
                              question._id,
                              optionKey,
                              e.target.checked
                            )
                          }
                          className={styles.checkbox}
                        />
                      )}

                      <FaTrash
                        onClick={() =>
                          handleDeleteOption(question._id, optionKey)
                        }
                        className={styles.deleteOptionBtn}
                        size={16}
                        color="red"
                        style={{ cursor: "pointer" }}
                      />
                      <span>Option {index + 1}</span>
                    </div>

                    <div className={styles.editor_div_cont}>
                      <TextEditor
                        type="text"
                        placeholder="Enter option text"
                        value={question.questionContent[optionKey] || ""}
                        editorFun={(text) =>
                          handleOptionChange(question._id, optionKey, text)
                        }
                        name={optionKey}
                        style={{ width: "100%" }}
                        initialContent={{
                          [optionKey]:
                            question.questionContent[optionKey] || "",
                        }}
                        className={styles.optionInput}
                      />
                    </div>
                  </div>
                ))}

            {(question.questionType === "Multiple Choice" ||
              question.questionType === "Single Choice") && (
              <Button
                onClick={() => handleAddOption(question._id)}
                className={styles.addOptionBtn}
              >
                <IoAdd /> Add Option
              </Button>
            )}

            {question.questionType === "True - False" && (
              <div className={styles.trueFalseContainer}>
                <label>
                  <Radio
                    type="radio"
                    name={`trueFalse-${question._id}`}
                    checked={question.answer.truefalse === true}
                    onChange={() =>
                      handleSelectAnswer(question._id, "True", true)
                    }
                  />
                  True
                </label>
                <label>
                  <Radio
                    type="radio"
                    name={`trueFalse-${question._id}`}
                    checked={question.answer.truefalse === false}
                    onChange={() =>
                      handleSelectAnswer(question._id, "False", false)
                    }
                  />
                  False
                </label>
              </div>
            )}

            <h3 className={styles.score_settings_h3}>Score Settings</h3>
            <Space
              direction="vertical"
              size="middle"
              style={{ display: "flex" }}
            >
              <Radio.Group
                value={question?.scoreSettings?.scoreType || "fullScore"}
                onChange={(e) =>
                  handleScoreSettingsChange(
                    question._id,
                    "scoreType",
                    e.target.value
                  )
                }
                className={styles.radio_cont}
              >
                <div className={styles.scoreSettings_cont}>
                  <span className={styles.fullscore_span}>
                    <Radio value="fullScore" className={styles.radio_text}>
                      Full Score
                    </Radio>
                  </span>
                  <div className={styles.radio_inputs_div}>
                    <div className={styles.single_inp}>
                      <InputNumber
                        controls={false}
                        disabled={
                          question?.scoreSettings?.scoreType === "partialScore"
                        }
                        className={styles.numberInp}
                        changeOnWheel={false}
                        placeholder="Points for Correct Answer (>0)"
                        min={0.01}
                        value={question?.scoreSettings?.pointsForCorrectAns}
                        onChange={(val) =>
                          handleScoreSettingsChange(
                            question._id,
                            "pointsForCorrectAns",
                            val
                          )
                        }
                        step={0.01}
                        parser={(value) => value.replace(/[^\d.]/g, "")}
                      />
                    </div>
                    <Text type="info">* Points for Correct Answer {">0"}</Text>
                    <div className={styles.single_inp}>
                      <InputNumber
                        controls={false}
                        disabled={
                          question?.scoreSettings?.scoreType === "partialScore"
                        }
                        className={styles.numberInp}
                        changeOnWheel={false}
                        placeholder="Points for Incorrect Answer (<=0)"
                        max={0}
                        value={question?.scoreSettings?.pointsForIncorrectAns}
                        onChange={(val) => {
                          if (val > 0)
                            message.warning(
                              "Negative marks should be less than 0"
                            );
                          else
                            handleScoreSettingsChange(
                              question._id,
                              "pointsForIncorrectAns",
                              val
                            );
                        }}
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
                        step={0.01}
                      />
                    </div>
                    <Text type="info">
                      * Points for Incorrect Answer {"<=0"}
                    </Text>
                  </div>
                </div>

                <div className={styles.scoreSettings_cont}>
                  <span className={styles.fullscore_span}>
                    <Radio
                      disabled={question.questionType !== "Multiple Choice"}
                      value="partialScore"
                      className={styles.radio_text}
                    >
                      Partial Score
                    </Radio>
                  </span>
                  <div className={styles.radio_inputs_div}>
                    <div className={styles.single_inp}>
                      <InputNumber
                        controls={false}
                        disabled={
                          question?.scoreSettings?.scoreType === "fullScore" ||
                          question?.questionType !== "Multiple Choice"
                        }
                        className={styles.numberInp}
                        changeOnWheel={false}
                        placeholder="Points for Each Correct Answer"
                        min={0}
                        value={
                          question?.scoreSettings?.PointsForEachCorrectAnswer
                        }
                        onChange={(val) =>
                          handleScoreSettingsChange(
                            question._id,
                            "PointsForEachCorrectAnswer",
                            val
                          )
                        }
                        step={0.01}
                        parser={(value) => value.replace(/[^\d.]/g, "")}
                      />
                    </div>
                    <Text type="info">
                      * Points for Each Correct/Partial Answer
                    </Text>
                    <div className={styles.single_inp}>
                      <InputNumber
                        controls={false}
                        disabled={
                          question?.scoreSettings?.scoreType === "fullScore" ||
                          question?.questionType !== "Multiple Choice"
                        }
                        className={styles.numberInp}
                        changeOnWheel={false}
                        placeholder="Bonus Points for All Correct Answers"
                        min={0}
                        value={
                          question?.scoreSettings?.bonusPointsForAllCorrect
                        }
                        onChange={(val) =>
                          handleScoreSettingsChange(
                            question._id,
                            "bonusPointsForAllCorrect",
                            val
                          )
                        }
                        step={0.01}
                        parser={(value) => value.replace(/[^\d.]/g, "")}
                      />
                    </div>
                    <Text type="info">
                      * Bonus Points are added if the student answers all
                      partial answers correctly.
                    </Text>
                    <Row>
                      <Radio.Group
                        value={
                          question?.scoreSettings?.negativePartialType ||
                          "fullNegative"
                        }
                        onChange={(e) =>
                          handleScoreSettingsChange(
                            question._id,
                            "negativePartialType",
                            e.target.value
                          )
                        }
                        disabled={
                          question?.scoreSettings?.scoreType === "fullScore" ||
                          question?.questionType !== "Multiple Choice"
                        }
                        className={styles.bonus_div}
                      >
                        <div className={styles.nagative_div}>
                          <Radio value="fullNegative">Full Negative</Radio>
                          <Row>
                            <div>
                              <div>
                                <InputNumber
                                  controls={false}
                                  disabled={
                                    question?.scoreSettings?.scoreType ===
                                      "fullScore" ||
                                    question?.scoreSettings
                                      ?.negativePartialType ===
                                      "partialNegative" ||
                                    question.questionType !== "Multiple Choice"
                                  }
                                  className={styles.numberInp}
                                  changeOnWheel={false}
                                  placeholder="Points for Incorrect Answer (<=0)"
                                  max={0}
                                  value={
                                    question?.scoreSettings
                                      ?.pointsForEachIncorrectAns
                                  }
                                  onChange={(val) => {
                                    if (val > 0)
                                      message.warning(
                                        "Negative marks should be less than 0"
                                      );
                                    else
                                      handleScoreSettingsChange(
                                        question._id,
                                        "pointsForEachIncorrectAns",
                                        val
                                      );
                                  }}
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
                                  step={0.01}
                                />
                              </div>
                              <Text type="info">
                                * Points for Incorrect Answer {"<=0"}
                              </Text>
                            </div>
                          </Row>
                        </div>
                      </Radio.Group>
                    </Row>
                  </div>
                </div>
              </Radio.Group>
            </Space>
            <div className={styles.delete_save_btn_cont}>
              <Popconfirm
                title="Delete the Question"
                description="Are you sure to delete this question?"
                okText="yes"
                cancelText="No"
                onConfirm={() => handleDeleteQuestion(question._id)}
              >
                <button className={styles.deleteQuestionBtn}>
                  Delete Question
                </button>
              </Popconfirm>

              <button
                onClick={() => {
                  if (isValidObjectId(question._id)) {
                    updateQuestionComp(question._id);
                  } else {
                    handleSaveQuestion(question._id);
                  }
                }}
                className={styles.saveButton}
              >
                {isValidObjectId(question._id)
                  ? "Update Question"
                  : "Save Question"}
              </button>
            </div>
          </div>
        ))}

        <button onClick={handleAddQuestion} className={styles.addQuestionBtn}>
          + Add New Question
        </button>
      </div>
    );
};

export default ComprehensionQuestions;
