// "use client";
// import ChipInput from "@/app/utils/chipInput_old/chip";
// import {
//   Button,
//   Col,
//   InputNumber,
//   message,
//   Radio,
//   Row,
//   Space,
//   Typography,
// } from "antd";

// import React, { useEffect, useState } from "react";
// import { Select } from "antd";
// import { useDispatch } from "react-redux";
// import { useSelector } from "react-redux";
// import { useParams, usePathname, useRouter } from "next/navigation";
// import {
//   getOneQues,
//   resetQuestion,
//   setQuestionVals,
// } from "@/redux/slices/testportal_admin/slice/questions";
// const { Text } = Typography;

// import addQuestionStyles from "./codingStyles.module.scss";
// import TextEditor from "@/modules/testportal_admin/components/reusable-comps/editor/editor";
// import { createQuestion, updateQuestion } from "@/redux/slices/testportal_admin/slice/questions";
// import { IoAdd } from "react-icons/io5";
// import { singleQuestion } from "@/modules/testportal_admin/graphql_quries/questions";

// export default function CodingQuestionForm() {
//   const dispatch = useDispatch();
//   const SingleQuestion = useSelector((state) => state.questions.question);
//   const question = useSelector((state) => state.questions.questionVals);
//   const resources = useSelector((state) => state.questions.resources);
//   console.log(singleQuestion);

//   let values = question;
//   const { question: questionId, ["test-slug"]: testId } = useParams();
//   const selectedTest = useSelector((state) => state.tests.test);

//   // State for test cases
//   const [testCases, setTestCases] = useState([
//     { _id: Date.now(), input: "", expectedOutput: "", explanation: "" },
//   ]);

//   const nav = useRouter();
//   const pathname = usePathname();

//   useEffect(() => {
//     if (questionId !== "new-coding-question") {
//       dispatch(getOneQues({ _id: questionId }));
//     } else {
//       dispatch(resetQuestion());
//       // Initialize coding question
//       dispatch(
//         setQuestionVals({
//           questionType: "Coding Question",
//           testCases: [
//             { _id: Date.now(), input: "", expectedOutput: "", explanation: "" },
//           ],
//           answer: { explanation: "" }, // Initialize answer object
//         })
//       );
//     }
//   }, []);

//   useEffect(() => {
//     if (values?.testCases) {
//       setTestCases(values.testCases);
//     }
//   }, [values?.testCases]);

//   const SubmitButton = async () => {
//     try {
//       let result;
//       if (questionId === "new-coding-question") {
//         result = await dispatch(
//           createQuestion({
//             ...values,
//             questionType: "Coding Question",
//             testId: testId.split("_id-")[1],
//             testTitle: selectedTest.title,
//             resources: values?.resources || resources,
//             testCases: testCases,
//           })
//         ).unwrap();
//       } else {
//         result = await dispatch(
//           updateQuestion({
//             ...values,
//             questionId: values._id,
//             testId: testId.split("_id-")[1],
//             testTitle: selectedTest.title,
//             resources: values?.resources || resources,
//             testCases: testCases,
//             dispatch,
//           })
//         ).unwrap();
//       }
//       setTimeout(() => {
//         nav.replace(pathname.split("/questionManager")[0] + `/questionManager`);
//       }, 2000);
//     } catch (error) {
//       message.error(error.message || "An unexpected error occurred.");
//     }
//   };

//   const sendEditorVals = (val, name) => {
//     if (name === "question") {
//       dispatch(
//         setQuestionVals({
//           ...values,
//           questionContent: {
//             ...values.questionContent,
//             [name]: val,
//           },
//         })
//       );
//     } else if (name === "explanation") {
//       dispatch(
//         setQuestionVals({
//           ...values,
//           answer: {
//             ...values.answer,
//             explanation: val,
//           },
//         })
//       );
//     }
//   };

//   const sendTestCaseEditorVals = (val, id, field) => {
//     const newTestCases = testCases.map((tc) =>
//       tc._id === id ? { ...tc, [field]: val } : tc
//     );
//     setTestCases(newTestCases);
//     dispatch(setQuestionVals({ ...values, testCases: newTestCases }));
//   };

//   const addTestCase = () => {
//     const newTestCase = {
//       _id: Date.now(),
//       input: "",
//       expectedOutput: "",
//       explanation: "",
//     };
//     const newTestCases = [...testCases, newTestCase];
//     setTestCases(newTestCases);
//     dispatch(setQuestionVals({ ...values, testCases: newTestCases }));
//   };

//   const removeTestCase = (id) => {
//     if (testCases.length === 1) {
//       message.warning("At least one test case must remain.");
//       return;
//     }
//     const newTestCases = testCases.filter((tc) => tc._id !== id);
//     setTestCases(newTestCases);
//     dispatch(setQuestionVals({ ...values, testCases: newTestCases }));
//   };

//   return (
//     <div className={addQuestionStyles.container}>
//       <Space direction="vertical" size="middle" style={{ display: "flex" }}>
//         {/* Question Tags */}
//         <Row>
//           <Col span={4}>Question Tags</Col>
//           <Col span={8}>
//             <ChipInput
//               type="question"
//               name="questionCategory"
//               phVal="Enter tags (arrays, sorting, etc.) and press enter"
//               onChange={(name, chips) =>
//                 dispatch(
//                   setQuestionVals({ ...values, questionCategory: chips })
//                 )
//               }
//               initialChips={
//                 (SingleQuestion && SingleQuestion.questionCategory) || []
//               }
//             />
//           </Col>
//         </Row>

//         {/* Question Type */}
//         <Row>
//           <Col span={4}>
//             <span>Question Type*</span>
//           </Col>
//           <Col span={8}>
//             <Select
//               suffixIcon={null}
//               value="coding"
//               disabled
//               options={[{ value: "coding", label: "Coding Question" }]}
//             />
//           </Col>
//         </Row>

//         {/* Question Content */}
//         <Row>
//           <Col span={4}>
//             <span className={addQuestionStyles.heading_span}>Question*</span>
//           </Col>
//           <Col span={20}>
//             <TextEditor
//               editorFun={(val) => sendEditorVals(val, "question")}
//               name="question"
//               initialContent={{
//                 question:
//                   SingleQuestion?.questionContent?.question ||
//                   values?.questionContent?.question,
//               }}
//             />
//           </Col>
//         </Row>

//         {/* Test Cases Section */}
//         <div className={addQuestionStyles.testCasesContainer}>
//           <Row>
//             <Col span={4}>
//               <span className={addQuestionStyles.heading_span}>
//                 Test Cases*
//               </span>
//             </Col>
//             <Col span={20}>
//               {testCases.map((testCase, index) => (
//                 <div
//                   key={testCase._id}
//                   className={addQuestionStyles.testCaseItem}
//                 >
//                   <div className={addQuestionStyles.testCaseHeader}>
//                     <Text strong>Test Case {index + 1}</Text>
//                     {testCases.length > 1 && (
//                       <img
//                         onClick={() => removeTestCase(testCase._id)}
//                         className={addQuestionStyles.deleteIcon}
//                         src="https://res.cloudinary.com/cliqtick/image/upload/v1723023488/sysnper/19546bd4c2ce0b1f03ea6693cb0e2f6b_qobhd1.png"
//                         alt="Remove"
//                       />
//                     )}
//                   </div>

//                   {/* Input */}
//                   <Row style={{ marginBottom: "16px" }}>
//                     <Col span={4}>
//                       <span>Input:</span>
//                     </Col>
//                     <Col span={20}>
//                       <TextEditor
//                         name={`testcase-input-${testCase._id}`}
//                         editorFun={(val) =>
//                           sendTestCaseEditorVals(val, testCase._id, "input")
//                         }
//                         initialContent={{
//                           [`testcase-input-${testCase._id}`]: testCase.input,
//                         }}
//                       />
//                     </Col>
//                   </Row>

//                   {/* Expected Output */}
//                   <Row style={{ marginBottom: "16px" }}>
//                     <Col span={4}>
//                       <span>Expected Output:</span>
//                     </Col>
//                     <Col span={20}>
//                       <TextEditor
//                         name={`testcase-output-${testCase._id}`}
//                         editorFun={(val) =>
//                           sendTestCaseEditorVals(
//                             val,
//                             testCase._id,
//                             "expectedOutput"
//                           )
//                         }
//                         initialContent={{
//                           [`testcase-output-${testCase._id}`]:
//                             testCase.expectedOutput,
//                         }}
//                       />
//                     </Col>
//                   </Row>

//                   {/* Explanation */}
//                   <Row>
//                     <Col span={4}>
//                       <span>Explanation:</span>
//                     </Col>
//                     <Col span={20}>
//                       <TextEditor
//                         name={`testcase-explanation-${testCase._id}`}
//                         editorFun={(val) =>
//                           sendTestCaseEditorVals(
//                             val,
//                             testCase._id,
//                             "explanation"
//                           )
//                         }
//                         initialContent={{
//                           [`testcase-explanation-${testCase._id}`]:
//                             testCase.explanation,
//                         }}
//                       />
//                     </Col>
//                   </Row>
//                 </div>
//               ))}

//               <div className={addQuestionStyles.addoption_div}>
//                 <div className={addQuestionStyles.empty_div}></div>
//                 <Button onClick={addTestCase} className={addQuestionStyles.btn}>
//                   <IoAdd /> Add Test Case
//                 </Button>
//               </div>
//             </Col>
//           </Row>
//         </div>

//         {/* Solution Explanation */}
//         <div className={addQuestionStyles.explanation}>
//           <Row>
//             <Col span={4}>
//               <span className={addQuestionStyles.heading_span}>
//                 Solution Explanation
//               </span>
//             </Col>
//             <Col span={20}>
//               <TextEditor
//                 editorFun={(val) => sendEditorVals(val, "explanation")}
//                 name="explanation"
//                 initialContent={{
//                   explanation:
//                     SingleQuestion?.answer?.explanation ||
//                     values?.answer?.explanation,
//                 }}
//               />
//             </Col>
//           </Row>
//         </div>

//         {/* Score Settings */}
//         <Row>
//           <Col span={4}>
//             <span>Score Settings*</span>
//           </Col>
//           <Col span={20}>
//             <Space
//               direction="vertical"
//               size="middle"
//               style={{ display: "flex" }}
//             >
//               <Radio.Group
//                 value={values?.scoreSettings?.scoreType || "fullScore"}
//                 onChange={(e) => {
//                   dispatch(
//                     setQuestionVals({
//                       ...values,
//                       ...resources,
//                       scoreSettings: {
//                         ...values?.scoreSettings,
//                         scoreType: e.target.value,
//                       },
//                     })
//                   );
//                 }}
//               >
//                 <Row>
//                   <Col span={24}>
//                     <Radio value="fullScore">Full Score</Radio>
//                   </Col>
//                 </Row>

//                 <Row style={{ marginTop: "16px" }}>
//                   <Col span={12}>
//                     <InputNumber
//                       controls={false}
//                       disabled={
//                         values?.scoreSettings?.scoreType == "partialScore"
//                       }
//                       changeOnWheel={false}
//                       placeholder="Points for Correct answer (>0)"
//                       min={1}
//                       value={values?.scoreSettings?.pointsForCorrectAns}
//                       onChange={(val) => {
//                         const newvals = JSON.parse(JSON.stringify(values));
//                         delete newvals?.scoreSettings
//                           ?.PointsForEachCorrectAnswer;
//                         delete newvals?.scoreSettings?.bonusPointsForAllCorrect;
//                         delete newvals?.scoreSettings?.negativePartialType;
//                         delete newvals?.scoreSettings
//                           ?.pointsForEachIncorrectAns;
//                         delete newvals?.scoreSettings
//                           ?.partialPointsForEachInCorrectAns;

//                         dispatch(
//                           setQuestionVals({
//                             ...newvals,
//                             scoreSettings: {
//                               scoreType: "fullScore",
//                               ...newvals.scoreSettings,
//                               pointsForCorrectAns: val,
//                             },
//                           })
//                         );
//                       }}
//                       style={{ width: "100%" }}
//                     />
//                   </Col>
//                   <Col span={12} style={{ paddingLeft: "16px" }}>
//                     <Text type="secondary">
//                       *Number of Points for Correct answer {`(>0)`}
//                     </Text>
//                   </Col>
//                 </Row>

//                 <Row style={{ marginTop: "16px" }}>
//                   <Col span={12}>
//                     <InputNumber
//                       controls={false}
//                       disabled={
//                         values?.scoreSettings?.scoreType == "partialScore"
//                       }
//                       changeOnWheel={false}
//                       placeholder="Points for Incorrect answer (<=0)"
//                       max={0}
//                       value={
//                         values &&
//                         values.scoreSettings &&
//                         values.scoreSettings.pointsForIncorrectAns
//                       }
//                       onChange={(val) => {
//                         const newvals = JSON.parse(JSON.stringify(values));
//                         delete newvals?.scoreSettings
//                           ?.PointsForEachCorrectAnswer;
//                         delete newvals?.scoreSettings?.bonusPointsForAllCorrect;
//                         delete newvals?.scoreSettings?.negativePartialType;
//                         delete newvals?.scoreSettings
//                           ?.pointsForEachIncorrectAns;
//                         delete newvals?.scoreSettings
//                           ?.partialPointsForEachInCorrectAns;

//                         dispatch(
//                           setQuestionVals({
//                             ...newvals,
//                             scoreSettings: {
//                               scoreType: "fullScore",
//                               ...newvals.scoreSettings,
//                               pointsForIncorrectAns: val,
//                             },
//                           })
//                         );
//                       }}
//                       parser={(value) => {
//                         let parsedValue = parseFloat(
//                           value.replace(/[^-?\d]/g, "")
//                         );
//                         return parsedValue > 0 ? -parsedValue : parsedValue;
//                       }}
//                       formatter={(value) => {
//                         return value === 0 ? "0" : value;
//                       }}
//                       style={{ width: "100%" }}
//                     />
//                   </Col>
//                   <Col span={12} style={{ paddingLeft: "16px" }}>
//                     <Text type="secondary">
//                       *Number of Points for Incorrect answer {`(<=0)`}
//                     </Text>
//                   </Col>
//                 </Row>
//               </Radio.Group>
//             </Space>
//           </Col>
//         </Row>

//         {/* Submit Button */}
//         <div className={addQuestionStyles.footer}>
//           <Row justify="space-between" gutter={{ md: 5 }}>
//             <Button type="primary" onClick={SubmitButton}>
//               {question?._id ? "Update Question" : "Save Question"}
//             </Button>
//           </Row>
//         </div>
//       </Space>
//     </div>
//   );
// }

"use client";
import ChipInput from "@/utils/universalUtils/chipInput/chip";
import {
  Button,
  Col,
  InputNumber,
  message,
  Radio,
  Row,
  Space,
  Typography,
} from "antd";

import React, { useEffect, useState } from "react";
import { Select } from "antd";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  getOneQues,
  resetQuestion,
  setQuestionVals,
} from "@/redux/slices/testportal_admin/slice/questions";
const { Text } = Typography;

import addQuestionStyles from "./codingStyles.module.scss";
import TextEditor from "@/modules/testportal_admin/components/reusable-comps/editor/editor";
import { createQuestion, updateQuestion } from "@/redux/slices/testportal_admin/slice/questions";
import { IoAdd } from "react-icons/io5";

export default function CodingQuestionForm() {
  const dispatch = useDispatch();
  const SingleQuestion = useSelector((state) => state.questions.question);
  const question = useSelector((state) => state.questions.questionVals);
  const resources = useSelector((state) => state.questions.resources);
  // console.log(SingleQuestion);

  let values = question;
  const { question: questionId, ["test-slug"]: testId } = useParams();
  const selectedTest = useSelector((state) => state.tests.test);

  // State for test cases
  const [testCases, setTestCases] = useState([
    { _id: Date.now(), input: "", expectedOutput: "", explanation: "" },
  ]);

  const nav = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (questionId !== "new-coding-question") {
      dispatch(getOneQues({ _id: questionId }));
    } else {
      dispatch(resetQuestion());
      // Initialize coding question with test cases inside questionContent
      dispatch(
        setQuestionVals({
          questionType: "Coding Question",
          questionContent: {
            testCases: [
              {
                _id: Date.now(),
                input: "",
                expectedOutput: "",
                explanation: "",
              },
            ],
          },
          answer: { explanation: "" }, // Initialize answer object
        })
      );
    }
  }, []);

  useEffect(() => {
    // Get test cases from questionContent instead of top level
    if (values?.questionContent?.testCases) {
      setTestCases(values.questionContent.testCases);
    }
  }, [values?.questionContent?.testCases]);

  const SubmitButton = async () => {
    try {
      let result;
      if (questionId === "new-coding-question") {
        result = await dispatch(
          createQuestion({
            ...values,
            questionType: "Coding Question",
            testId: testId.split("_id-")[1],
            testTitle: selectedTest.title,
            resources: values?.resources || resources,
            questionContent: {
              ...values.questionContent,
              testCases: testCases,
            },
          })
        ).unwrap();
      } else {
        result = await dispatch(
          updateQuestion({
            ...values,
            questionId: values._id,
            testId: testId.split("_id-")[1],
            testTitle: selectedTest.title,
            resources: values?.resources || resources,
            questionContent: {
              ...values.questionContent,
              testCases: testCases,
            },
            dispatch,
          })
        ).unwrap();
      }
      setTimeout(() => {
        nav.replace(pathname.split("/questionManager")[0] + `/questionManager`);
      }, 2000);
    } catch (error) {
      message.error(error.message || "An unexpected error occurred.");
    }
  };

  const sendEditorVals = (val, name) => {
    if (name === "question") {
      dispatch(
        setQuestionVals({
          ...values,
          questionContent: {
            ...values.questionContent,
            [name]: val,
          },
        })
      );
    } else if (name === "explanation") {
      dispatch(
        setQuestionVals({
          ...values,
          answer: {
            ...values.answer,
            explanation: val,
          },
        })
      );
    }
  };

  const sendTestCaseEditorVals = (val, id, field) => {
    const newTestCases = testCases.map((tc) =>
      tc._id === id ? { ...tc, [field]: val } : tc
    );
    setTestCases(newTestCases);
    // Update test cases inside questionContent
    dispatch(
      setQuestionVals({
        ...values,
        questionContent: {
          ...values.questionContent,
          testCases: newTestCases,
        },
      })
    );
  };

  const addTestCase = () => {
    const newTestCase = {
      _id: Date.now(),
      input: "",
      expectedOutput: "",
      explanation: "",
    };
    const newTestCases = [...testCases, newTestCase];
    setTestCases(newTestCases);
    // Update test cases inside questionContent
    dispatch(
      setQuestionVals({
        ...values,
        questionContent: {
          ...values.questionContent,
          testCases: newTestCases,
        },
      })
    );
  };

  const removeTestCase = (id) => {
    if (testCases.length === 1) {
      message.warning("At least one test case must remain.");
      return;
    }
    const newTestCases = testCases.filter((tc) => tc._id !== id);
    setTestCases(newTestCases);
    // Update test cases inside questionContent
    dispatch(
      setQuestionVals({
        ...values,
        questionContent: {
          ...values.questionContent,
          testCases: newTestCases,
        },
      })
    );
  };

  return (
    <div className={addQuestionStyles.container}>
      <Space direction="vertical" size="middle" style={{ display: "flex" }}>
        {/* Question Tags */}
        <Row>
          <Col span={4}>Question Tags</Col>
          <Col span={8}>
            <ChipInput
              type="question"
              name="questionCategory"
              phVal="Enter tags (arrays, sorting, etc.) and press enter"
              onChange={(name, chips) =>
                dispatch(
                  setQuestionVals({ ...values, questionCategory: chips })
                )
              }
              initialChips={
                (SingleQuestion && SingleQuestion.questionCategory) || []
              }
            />
          </Col>
        </Row>

        {/* Question Type */}
        <Row>
          <Col span={4}>
            <span>Question Type*</span>
          </Col>
          <Col span={8}>
            <Select
              suffixIcon={null}
              value="coding"
              disabled
              options={[{ value: "coding", label: "Coding Question" }]}
            />
          </Col>
        </Row>

        {/* Question Content */}
        <Row>
          <Col span={4}>
            <span className={addQuestionStyles.heading_span}>Question*</span>
          </Col>
          <Col span={20}>
            <TextEditor
              editorFun={(val) => sendEditorVals(val, "question")}
              name="question"
              initialContent={{
                question:
                  SingleQuestion?.questionContent?.question ||
                  values?.questionContent?.question,
              }}
            />
          </Col>
        </Row>

        {/* Test Cases Section */}
        <div className={addQuestionStyles.testCasesContainer}>
          <Row>
            <Col span={4}>
              <span className={addQuestionStyles.heading_span}>
                Test Cases*
              </span>
            </Col>
            <Col span={20}>
              {testCases.map((testCase, index) => (
                <div
                  key={testCase._id}
                  className={addQuestionStyles.testCaseItem}
                >
                  <div className={addQuestionStyles.testCaseHeader}>
                    <Text strong>Test Case {index + 1}</Text>
                    {testCases.length > 1 && (
                      <img
                        onClick={() => removeTestCase(testCase._id)}
                        className={addQuestionStyles.deleteIcon}
                        src="https://res.cloudinary.com/cliqtick/image/upload/v1723023488/sysnper/19546bd4c2ce0b1f03ea6693cb0e2f6b_qobhd1.png"
                        alt="Remove"
                      />
                    )}
                  </div>

                  {/* Input */}
                  <Row style={{ marginBottom: "16px" }}>
                    <Col span={4}>
                      <span>Input:</span>
                    </Col>
                    <Col span={20}>
                      <TextEditor
                        name={`testcase-input-${testCase._id}`}
                        editorFun={(val) =>
                          sendTestCaseEditorVals(val, testCase._id, "input")
                        }
                        initialContent={{
                          [`testcase-input-${testCase._id}`]: testCase.input,
                        }}
                      />
                    </Col>
                  </Row>

                  {/* Expected Output */}
                  <Row style={{ marginBottom: "16px" }}>
                    <Col span={4}>
                      <span>Expected Output:</span>
                    </Col>
                    <Col span={20}>
                      <TextEditor
                        name={`testcase-output-${testCase._id}`}
                        editorFun={(val) =>
                          sendTestCaseEditorVals(
                            val,
                            testCase._id,
                            "expectedOutput"
                          )
                        }
                        initialContent={{
                          [`testcase-output-${testCase._id}`]:
                            testCase.expectedOutput,
                        }}
                      />
                    </Col>
                  </Row>

                  {/* Explanation */}
                  <Row>
                    <Col span={4}>
                      <span>Explanation:</span>
                    </Col>
                    <Col span={20}>
                      <TextEditor
                        name={`testcase-explanation-${testCase._id}`}
                        editorFun={(val) =>
                          sendTestCaseEditorVals(
                            val,
                            testCase._id,
                            "explanation"
                          )
                        }
                        initialContent={{
                          [`testcase-explanation-${testCase._id}`]:
                            testCase.explanation,
                        }}
                      />
                    </Col>
                  </Row>
                </div>
              ))}

              <div className={addQuestionStyles.addoption_div}>
                <div className={addQuestionStyles.empty_div}></div>
                <Button onClick={addTestCase} className={addQuestionStyles.btn}>
                  <IoAdd /> Add Test Case
                </Button>
              </div>
            </Col>
          </Row>
        </div>

        {/* Solution Explanation */}
        <div className={addQuestionStyles.explanation}>
          <Row>
            <Col span={4}>
              <span className={addQuestionStyles.heading_span}>
                Solution Explanation
              </span>
            </Col>
            <Col span={20}>
              <TextEditor
                editorFun={(val) => sendEditorVals(val, "explanation")}
                name="explanation"
                initialContent={{
                  explanation:
                    SingleQuestion?.answer?.explanation ||
                    values?.answer?.explanation,
                }}
              />
            </Col>
          </Row>
        </div>

        {/* Score Settings */}
        <Row>
          <Col span={4}>
            <span>Score Settings*</span>
          </Col>
          <Col span={20}>
            <Space
              direction="vertical"
              size="middle"
              style={{ display: "flex" }}
            >
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
                }}
              >
                <Row>
                  <Col span={24}>
                    <Radio value="fullScore">Full Score</Radio>
                  </Col>
                </Row>

                <Row style={{ marginTop: "16px" }}>
                  <Col span={12}>
                    <InputNumber
                      controls={false}
                      disabled={
                        values?.scoreSettings?.scoreType == "partialScore"
                      }
                      changeOnWheel={false}
                      placeholder="Points for Correct answer (>0)"
                      min={0.01}
                      value={values?.scoreSettings?.pointsForCorrectAns}
                      onChange={(val) => {
                        const newvals = JSON.parse(JSON.stringify(values));
                        delete newvals?.scoreSettings
                          ?.PointsForEachCorrectAnswer;
                        delete newvals?.scoreSettings?.bonusPointsForAllCorrect;
                        delete newvals?.scoreSettings?.negativePartialType;
                        delete newvals?.scoreSettings
                          ?.pointsForEachIncorrectAns;
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
                      style={{ width: "100%" }}
                      step={0.01}
                      parser={(value) => value.replace(/[^\d.]/g, "")}
                    />
                  </Col>
                  <Col span={12} style={{ paddingLeft: "16px" }}>
                    <Text type="secondary">
                      *Number of Points for Correct answer {`(>0)`}
                    </Text>
                  </Col>
                </Row>

                <Row style={{ marginTop: "16px" }}>
                  <Col span={12}>
                    <InputNumber
                      controls={false}
                      disabled={
                        values?.scoreSettings?.scoreType == "partialScore"
                      }
                      changeOnWheel={false}
                      placeholder="Points for Incorrect answer (<=0)"
                      max={0}
                      value={
                        values &&
                        values.scoreSettings &&
                        values.scoreSettings.pointsForIncorrectAns
                      }
                      onChange={(val) => {
                        const newvals = JSON.parse(JSON.stringify(values));
                        delete newvals?.scoreSettings
                          ?.PointsForEachCorrectAnswer;
                        delete newvals?.scoreSettings?.bonusPointsForAllCorrect;
                        delete newvals?.scoreSettings?.negativePartialType;
                        delete newvals?.scoreSettings
                          ?.pointsForEachIncorrectAns;
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
                      style={{ width: "100%" }}
                      step={0.01}
                    />
                  </Col>
                  <Col span={12} style={{ paddingLeft: "16px" }}>
                    <Text type="secondary">
                      *Number of Points for Incorrect answer {`(<=0)`}
                    </Text>
                  </Col>
                </Row>
              </Radio.Group>
            </Space>
          </Col>
        </Row>

        {/* Submit Button */}
        <div className={addQuestionStyles.footer}>
          <Row justify="space-between" gutter={{ md: 5 }}>
            <Button type="primary" onClick={SubmitButton}>
              {question?._id ? "Update Question" : "Save Question"}
            </Button>
          </Row>
        </div>
      </Space>
    </div>
  );
}
