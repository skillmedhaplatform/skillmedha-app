"use client";

import ChipInput from "@/utils/universalUtils/chipInput/chip";
import {
  Alert,
  Button,
  Checkbox,
  Col,
  Flex,
  Input,
  message,
  Radio,
  Row,
  Tooltip,
  Typography,
} from "antd";

import React, { useEffect, useRef, useState } from "react";
import { Select } from "antd";
import AddQuestions from "./addQuestions";
import Dropzone from "@/modules/testportal_admin/components/reusable-comps/dropzone/dropzone";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { getOneTests } from "@/redux/slices/testportal_admin/slice/test";
import {
  addCompQuestion,
  addQuestionCompQuestion,
  addQuestionToQuestionComs,
  addtemplateQues,
  deleteCompQues,
  deleteQuesCompQuestion,
  getCompQuestion,
  getOneQues,
  resetQuestion,
  saveCompQuestion,
  setQuestionVals,
  updateCompQuestion,
} from "@/redux/slices/testportal_admin/slice/questions";
const { Text } = Typography;
import { v4 as uuid } from "uuid";

import newQuestionFormStyles from "./addQuestion.module.scss";
import TextEditor from "@/modules/testportal_admin/components/reusable-comps/editor/editor";
import { createQuestion, updateQuestion } from "@/redux/slices/testportal_admin/slice/questions";
import VideoUpload from "../utils/video";

export default function AddQuestionForm() {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const TYPE = searchParams.get("type");

  const SingleQuestion = useSelector((state) => state.questions.question);
  const question = useSelector((state) => state.questions.questionVals);
  const resources = useSelector((state) => state.questions.resources);
  const newCompQuestion = useSelector(
    (state) => state.questions.getCompQuestionVal.value
  );
  const compQuestionValues = useSelector(
    (state) => state.questions.compQuestions
  );
  let [value, setFormValues] = useState({});

  let values = question;
  const { question: questionId, ["test-slug"]: testId } = useParams();
  const selectedTest = useSelector((state) => state.tests.test);
  const comprehensionArr = [
    "Reading Comprehension",
    "Audio Comprehension",
    "Video Comprehension",
  ];
  const questionTypes = {
    singleChoice: "Single Choice",
    multipleChoice: "Multiple Choice",
    trueFalse: "True - False",
    shortPara: "Short Paragraph",
    audio: "Audio Question",
    video: "Video Question",
    // readingComprehension: "Reading Comprehension",
    // audioComprehension: "Audio Comprehension",
    // videoComprehension: "Video Comprehension",
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
    // {
    //   value: "readingComprehension",
    //   label: "Reading Comprehension",
    // },
    // {
    //   value: "audioComprehension",
    //   label: "Audio Comprehension",
    //   // disabled: true,
    // },
    // {
    //   value: "videoComprehension",
    //   label: "Video Comprehension",
    //   // disabled: true,
    // },
  ];

  const newvalue =
    options1?.filter((el) => {
      return (
        el.label.split(" ").join("").toLowerCase() ===
        SingleQuestion?.questionType?.split(" ")?.join("")?.toLowerCase()
      );
    })[0]?.value && SingleQuestion?.questionType
      ? options1?.filter((el) => {
        return (
          el.label.split(" ").join("").toLowerCase() ===
          SingleQuestion?.questionType?.split(" ")?.join("")?.toLowerCase()
        );
      })[0]?.value
      : "singleChoice";

  const [selectedType, setSelectedType] = useState(newvalue);

  useEffect(() => {
    if (questionId !== "new-question") {
      dispatch(getOneQues({ _id: questionId }));
    } else {
      dispatch(resetQuestion());
    }
  }, []);

  // useEffect(() => {
  //   resetInputs();
  // }, [compQuestionValues.updateNo]);

  useEffect(() => {
    if (values?._id) {
      if (values?.questionType)
        setSelectedType(
          Object.keys(questionTypes).find(
            (e) => questionTypes[e] == values?.questionType
          )
        );
      // setSelectedType("singleChoice");
    } else {
      setSelectedType("singleChoice");
    }
  }, [values?._id]);

  const nav = useRouter();
  const pathname = usePathname();

  // const validateFields = (values) => {
  //   const errorMessages = [];
  //   const { questionType, questionContent, questionScore, scoreSettings, answer } = values;

  //   // General validations
  //   if (!questionContent?.question) {
  //     errorMessages.push("The question content is missing.");
  //   }

  //   if (!questionScore) {
  //     errorMessages.push("The question score is missing.");
  //   }

  //   if (!scoreSettings) {
  //     errorMessages.push("Score settings are missing.");
  //   }

  //   // Specific validations based on questionType
  //   switch (questionType) {
  //     case "Single Choice":
  //       if (!answer?.singleChoice) {
  //         errorMessages.push("The single choice answers are missing.");
  //       } else if (Object.keys(answer.singleChoice).length === 0) {
  //         errorMessages.push("At least one option must be selected.");
  //       }
  //       if (Object.keys(questionContent).length < 2) {
  //         errorMessages.push("At least two options are required for Single Choice.");
  //       }
  //       break;

  //     case "Multiple Choice":
  //       if (!answer?.multipleChoice) {
  //         errorMessages.push("The multiple choice answers are missing.");
  //       } else if (Object.keys(answer.multipleChoice).length === 0) {
  //         errorMessages.push("At least one option must be selected.");
  //       }
  //       if (Object.keys(questionContent).length < 2) {
  //         errorMessages.push("At least two options are required for Multiple Choice.");
  //       }
  //       break;

  //     case "True - False":
  //       if (!answer?.truefalse) {
  //         errorMessages.push("The True/False answer is missing.");
  //       }
  //       break;

  //     case "Short Paragraph":
  //       if (!answer?.shortPara) {
  //         errorMessages.push("The short paragraph answer is missing.");
  //       }
  //       break;

  //     default:
  //       errorMessages.push("Unknown question type.");
  //   }

  //   return errorMessages;
  // };

  const SubmitButton = async () => {
    //   // const errors = validateFields(values);

    //   // if (errors.length > 0) {
    //   //   setErrorMessages(errors);
    //   //   return;
    //   // }

    try {
      let result;
      if (questionId === "new-question") {
        result = await dispatch(
          createQuestion({
            ...values,
            questionType: values?.questionType || "Single Choice",
            testId: testId?.split("_id-")[1],
            testTitle: selectedTest.title,
            resources: values?.resources || resources,
            type: TYPE || "",
          })
        ).unwrap();
      } else {
        result = await dispatch(
          updateQuestion({
            ...values,
            questionId: values._id,
            testId: testId?.split("_id-")[1],
            testTitle: selectedTest.title,
            resources: values?.resources || resources,
            dispatch,
          })
        ).unwrap();
      }
      // Trigger a refresh of the test data (including questions)
      dispatch(getOneTests({ _id: testId?.split("_id-")[1] }));

      setTimeout(() => {
        if (TYPE === "bank") {
          nav.replace("/testportal_admin/question-bank");
        } else {
          nav.replace(
            pathname.split("/questionManager")[0] + `/questionManager`
          );
        }
      }, 1000);
    } catch (error) {
      message.error(error.message || "An unexpected error occurred.");
    }
  };

  const handleValueUpdate = ({ key, value }) => {
    if (comprehensionArr.includes(questionTypes[value])) {
      values = compQuestionValues;
      dispatch(addCompQuestion({ ...values, [key]: questionTypes[value] }));
    } else
      dispatch(setQuestionVals({ ...values, [key]: questionTypes[value] }));
  };

  const handleSaveQuestion = (args) => {
    if (newCompQuestion?._id) {
      const data = { ...compQuestionValues };
      delete data.questionContentArr;
      delete data._id;
      dispatch(updateCompQuestion({ quesId: newCompQuestion?._id, ...data }));
      if (!args._id.includes("newques")) {
        const data = { ...args };
        const { _id: questionId } = args;
        delete data._id;
        dispatch(
          updateQuestion({
            ...data,
            questionId,
            dispatch,
          })
        );
      } else {
        const questionDataVal = { ...args };
        const { _id: oldQuesId } = args;
        delete questionDataVal._id;
        const compQuesId = newCompQuestion?._id;
        dispatch(
          addQuestionCompQuestion({ questionDataVal, compQuesId, oldQuesId })
        ).then(() => {
          dispatch(
            getCompQuestion({ comprehensionQuestionId: newCompQuestion?._id })
          );
        });
      }
    } else {
      const data = { ...compQuestionValues };
      delete data.questionContentArr;
      delete data._id;
      dispatch(saveCompQuestion(data)).then((resp) => {
        dispatch(
          getCompQuestion({ comprehensionQuestionId: resp.payload.id })
        ).then((res) => {
          const questionDataVal = { ...args };
          const { _id: oldQuesId } = args;
          delete questionDataVal._id;
          const quesId = resp.payload.id;
          if (args._id.includes("newques")) {
            dispatch(
              addQuestionCompQuestion({ questionDataVal, quesId, oldQuesId })
            ).then(() => {
              dispatch(
                getCompQuestion({ comprehensionQuestionId: resp.payload.id })
              );
            });
          }
        });
      });
    }
  };
  return (
    <div className={newQuestionFormStyles.questionFormContainer}>
      <h3 className={newQuestionFormStyles.sectionTitle}>Question Specifications</h3>
      
      <Row style={{ marginBottom: "1.5rem", width: "100%" }} align="top">
        <Col span={4}>
          <span style={{ fontWeight: 600, color: "#475569" }}>Question Tags</span>
        </Col>
        <Col span={20}>
          <ChipInput
            type="question"
            name="questionCategory"
            phVal="Enter category value and press enter"
            onChange={(name, chips) =>
              setFormValues({ ...values, [name]: chips })
            }
            initialChips={
              (SingleQuestion && SingleQuestion.questionCategory) || []
            }
          />
        </Col>
      </Row>
      
      <Row style={{ marginBottom: "1.5rem", width: "100%" }} align="middle">
        <Col span={4}>
          <span style={{ fontWeight: 600, color: "#475569" }}>Question Type*</span>
        </Col>
        <Col span={20}>
          <Select
            style={{ width: "220px" }}
            value={selectedType}
            onChange={(value) => {
              setSelectedType(value);
              handleValueUpdate({ key: "questionType", value });
            }}
            options={options1}
          />
        </Col>
      </Row>

      <div className={newQuestionFormStyles.divider} />

      <h3 className={newQuestionFormStyles.sectionTitle}>Question Content & Options</h3>

      {selectedType == "readingComprehension" ||
        selectedType == "audioComprehension" ||
        selectedType == "videoComprehension" ? (
        <div>
          <Row>
            <Col span={4}>
              <span>
                {selectedType == "readingComprehension"
                  ? "Comprehension"
                  : "Upload Media File"}
              </span>
            </Col>
            <Col span={20}>
              {selectedType == "readingComprehension" ? (
                <TextEditor
                  editorFun={(value) => {
                    dispatch(
                      addCompQuestion({
                        ...compQuestionValues,
                        resources: value,
                      })
                    );
                  }}
                  name="readingComprehension"
                  initialContent={{ readingComprehension: "" }}
                />
              ) : (
                <Dropzone />
              )}
            </Col>
          </Row>
          {compQuestionValues.questionContentArr.map((e) => {
            return (
              <div key={e._id}>
                <AddQuestions
                  type={selectedType}
                  questionContent={e?.questionContent}
                  values={
                    compQuestionValues?.questionContentArr?.find(
                      (ques) => ques._id == e._id
                    ) || {}
                  }
                />
                <div className={newQuestionFormStyles.footer}>
                  <Row justify="space-between">
                    <Button onClick={() => dispatch(addtemplateQues())}>
                      Add More
                    </Button>
                    <Button onClick={() => handleSaveQuestion(e)}>
                      Save Question
                    </Button>
                    <Button
                      onClick={() => {
                        if (compQuestionValues.questionContentArr.length == 1)
                          return message.info(
                            "Atlest one question should be added"
                          );
                        if (newCompQuestion?._id) {
                          dispatch(
                            deleteQuesCompQuestion({
                              questionId: e._id,
                              compQuesId: newCompQuestion?._id,
                            })
                          );
                        }
                        dispatch(deleteCompQues({ questionId: e._id }));
                      }}
                    >
                      Delete Question
                    </Button>
                  </Row>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <>
          <AddQuestions
            type={selectedType}
            questionContent={SingleQuestion?.questionContent}
            questionContentNew={question?.questionContent}
            values={values}
          />
          <div className={newQuestionFormStyles.footer}>
            <Row justify="space-between" gutter={{ md: 5 }}>
              <button
                className={newQuestionFormStyles.save_btn}
                onClick={SubmitButton}
              >
                {question?._id ? "Update Question" : "Save Question"}
              </button>
            </Row>
          </div>
        </>
      )}
    </div>
  );
}
