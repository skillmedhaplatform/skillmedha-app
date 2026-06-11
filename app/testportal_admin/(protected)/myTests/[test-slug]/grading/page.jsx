"use client";
import React, { useEffect, useState } from "react";

import gradingStyles from "./styles/page.module.scss";
import EditorComp from "@/modules/testportal_admin/components/reusable-comps/editor/editor";
import BTag from "../../utils/button";
import { useDispatch, useSelector } from "react-redux";
import { setFormValues, updatingVals } from "@/redux/slices/testportal_admin/slice/stepform";
import { message, Radio, Skeleton, Switch } from "antd";
import {
  getOneTests,
  updateTest,
  updateTestValues,
} from "@/redux/slices/testportal_admin/slice/test";
import TextEditor from "@/modules/testportal_admin/components/reusable-comps/editor/editor";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { stringify } from "uuid";
import QuestionSkeleton from "@/modules/testportal_admin/components/reusable-comps/skeleton/questionSkeleton";

const Page = () => {
  const dispatch = useDispatch();
  const updatesVal = useSelector((state) => state.steps.updatingVals);
  const values = useSelector((state) => state.steps.value);
  const SingleTest = useSelector((state) => state.tests.test);
  const singletestStatus = useSelector(
    (state) => state.tests.singleTestStatus.status
  );

  const CurrTestQuestions = SingleTest?.questions;
  const params = useParams();

  const selectedId = params["test-slug"]?.split("_id-")[1];

  const [TotalTestMarks, setTotalMarks] = useState(0);
  const [handleResults, setHandleResults] = useState("Disable");

  useEffect(() => {
    if (SingleTest?.grading?.showResults) {
      setHandleResults(SingleTest?.grading?.showResults);
    }
  }, [SingleTest?._id, SingleTest?.grading?.showResults]);

  useEffect(() => {
    if (SingleTest?.questions?.length) {
      const updatedQues = SingleTest.questions.reduce((acc, question) => {
        if (question?.questionType?.includes("Comprehension")) {
          return [...acc, ...(question?.questionContentArr || [])];
        } else {
          return [...acc, question];
        }
      }, []);

      const totalMarksEachTests = updatedQues.map((question, ind) => {
        const {
          pointsForCorrectAns,
          PointsForEachCorrectAnswer,
          bonusPointsForAllCorrect,
        } = question?.scoreSettings || {};

        let score =
          Number(pointsForCorrectAns) ||
          Number(PointsForEachCorrectAnswer) ||
          0;

        if (PointsForEachCorrectAnswer && question?.answer?.multipleChoice) {
          const correctOptionsCount = Object.values(
            question.answer.multipleChoice
          ).filter(Boolean).length;
          score = correctOptionsCount * PointsForEachCorrectAnswer;
        }

        const bonusPoints = Number(bonusPointsForAllCorrect) || 0;

        return score + bonusPoints;
      });

      const total = totalMarksEachTests.reduce((acc, curr) => acc + curr, 0);
      setTotalMarks(total);
    }
  }, [SingleTest?._id, SingleTest?.questions?.length]);

  const nav = useRouter();

  const [intervals, setIntervals] = useState(
    SingleTest?.grading?.scoreRange || [
      {
        scoreFrom: "",
        scoreTo: "",
        grade: "",
        message: "",
        selectedValues: ["%"],
      },
    ]
  );
  const [Failintervals, setFailIntervals] = useState(
    SingleTest?.grading?.failIntervals || { selectedValues: ["%"] }
  );

  const handleAddInterval = () => {
    setIntervals([
      ...intervals,
      {
        scoreFrom: "",
        scoreTo: "",
        grade: "",
        message: "",
        selectedValues: ["%"],
      },
    ]);
  };

  useEffect(() => {
    // if (!SingleTest?._id) {
    //   dispatch(getOneTests({ _id: selectedId }));
    // }
    if (SingleTest?._id) {
      if (SingleTest?.grading?.scoreRange)
        setIntervals(SingleTest?.grading?.scoreRange);
      if (SingleTest?.grading?.failIntervals)
        setFailIntervals(SingleTest?.grading?.failIntervals);
    } else if (
      values?._id &&
      values?.grading?.scoreRange &&
      values?.grading?.failIntervals
    ) {
      if (values?.grading?.scoreRange)
        setIntervals(SingleTest?.grading?.scoreRange);
      if (values?.grading?.failIntervals)
        setFailIntervals(SingleTest?.grading?.failIntervals);
    }
  }, [SingleTest?._id, values?._id, singletestStatus?.grading]);

  const handleInputChange = (index, field, value) => {
    const newIntervals = intervals.map((interval, i) =>
      i === index ? { ...interval, [field]: value } : interval
    );
    setIntervals(newIntervals);
    dispatch(
      updatingVals({
        ...updatesVal,
        grading: {
          ...updatesVal.grading,
          scoreRange: newIntervals,
        },
      })
    );
    dispatch(
      updateTestValues({
        grading: {
          ...SingleTest.grading,
          scoreRange: newIntervals,
        },
      })
    );
  };

  const handleSelectValue = (index, value) => {
    const newIntervals = intervals.map((interval, i) => {
      if (i === index) {
        const newSelectedValues = interval.selectedValues.includes(value)
          ? interval.selectedValues.filter((v) => v !== value)
          : [...interval.selectedValues, value];
        return { ...interval, selectedValues: newSelectedValues };
      }
      return interval;
    });
    setIntervals(newIntervals);
    dispatch(
      updatingVals({
        ...updatesVal,
        grading: {
          ...updatesVal.grading,
          scoreRange: newIntervals,
        },
      })
    );
    dispatch(
      updateTestValues({
        grading: {
          ...SingleTest.grading,
          scoreRange: newIntervals,
        },
      })
    );
  };

  const handleFailSelectValue = (value) => {
    const newSelectedValues = Failintervals.selectedValues.includes(value)
      ? Failintervals.selectedValues.filter((v) => v !== value)
      : [...Failintervals.selectedValues, value];

    setFailIntervals({ selectedValues: newSelectedValues });

    dispatch(
      updatingVals({
        ...updatesVal,
        grading: {
          ...updatesVal.grading,
          failIntervals: {
            ...updatesVal.grading?.failIntervals,
            selectedValues: newSelectedValues,
          },
        },
      })
    );

    dispatch(
      updateTestValues({
        grading: {
          ...SingleTest.grading,
          failIntervals: {
            ...SingleTest.grading.failIntervals,
            selectedValues: newSelectedValues,
          },
        },
      })
    );
  };

  const sendEditorVals = (val, name, index) => {
    const newIntervals = intervals.map((interval, i) =>
      i === index ? { ...interval, message: val } : interval
    );
    setIntervals(newIntervals);
    dispatch(
      updatingVals({
        ...updatesVal,
        grading: {
          ...updatesVal.grading,
          scoreRange: newIntervals,
        },
      })
    );
    dispatch(
      updateTestValues({
        grading: {
          ...SingleTest.grading,
          scoreRange: newIntervals,
        },
      })
    );
  };

  const sendFailEditorVals = (val, name) => {
    dispatch(
      updatingVals({
        ...updatesVal,
        grading: {
          ...updatesVal.grading,
          [name]: val,
        },
      })
    );
    dispatch(
      updateTestValues({
        grading: {
          ...SingleTest.grading,
          failIntervals: {
            ...SingleTest.grading?.failIntervals,
            [name]: val,
          },
        },
      })
    );
  };

  const handleDeleteInterval = (index) => {
    const newIntervals = intervals.filter((_, i) => i !== index);
    setIntervals(newIntervals);
    dispatch(
      updateTestValues({
        grading: {
          ...SingleTest.grading,
          scoreRange: newIntervals,
        },
      })
    );
    dispatch(
      updatingVals({
        ...updatesVal,
        grading: {
          ...updatesVal.grading,
          scoreRange: newIntervals,
        },
      })
    );
  };

  const sendTestEndMessage = (val) => {
    dispatch(
      updateTestValues({
        grading: {
          ...SingleTest.grading,
          TestEndMessage: val,
        },
      })
    );
    dispatch(
      updatingVals({
        ...updatesVal,
        grading: {
          TestEndMessage: val,
        },
      })
    );
  };
  const handleResultsVal = ({ target: { value } }) => {
    console.log(value);
    setHandleResults(value);
    dispatch(
      updateTestValues({
        ...updatesVal,
        grading: {
          ...SingleTest.grading,
          showResults: value,
        },
      })
    );
  };
  const optionsResults = [
    {
      label: "Disable",
      value: "Disable",
    },
    {
      label: "Enable",
      value: "Enable",
    },
  ];

  const grading = updatesVal.grading;
  const updateTestsAccess = () => {
    if (SingleTest?._id) {
      const gradingValues = {
        grading,
      };
      dispatch(updateTest({ id: selectedId, updates: gradingValues }));
    } else {
      dispatch(updateTest({ id: selectedId, updates: gradingValues }));
    }
  };
  const defaultTestEndMessage = `<p><strong style="background-color: transparent;">Thank you for completing the exam.</strong></p>
  <p><span style="background-color: transparent;">We appreciate your effort and participation.</span></p>`;
  return (
    <>
      {singletestStatus === "pending" ? (
        <QuestionSkeleton />
      ) : (
        <div className={gradingStyles.container}>
          <div className={gradingStyles.flexComp}>
            <span className={gradingStyles.spans}>{"Test End Message"}</span>
            <div className={gradingStyles.editorComp}>
              <TextEditor
                name="TestEndMessage"
                editorFun={(val) => sendTestEndMessage(val, "TestEndMessage")}
                initialContent={
                  {
                    TestEndMessage:
                      SingleTest?.grading?.TestEndMessage ||
                      '"<p><strong style=\\"background-color: transparent;\\">Thank you for completing the exam.</strong></p><p><span style=\\"background-color: transparent;\\">We appreciate your effort and participation.</span></p>"',
                  } || {}
                }
              />
            </div>
          </div>
          <div className={gradingStyles.flexComp2}>
            <span className={gradingStyles.spans}>{"Display Results"}</span>
            <div>
              <Radio.Group
                optionType="button"
                buttonStyle="solid"
                options={optionsResults}
                value={handleResults}
                onChange={handleResultsVal}
              />
            </div>
          </div>
          {handleResults == "Enable" && (
            <>
              <div className={gradingStyles.flexComp2}>
                <span className={gradingStyles.spans}>
                  {"Grading Criteria"}
                </span>
                <div className={gradingStyles.inpsCon}>
                  <label>Full Score&nbsp;:</label>
                  <input
                    type="number"
                    placeholder="Max Score"
                    value={TotalTestMarks}
                    onChange={(e) => {
                      dispatch(
                        updatingVals({
                          ...updatesVal,
                          grading: {
                            ...updatesVal.grading,
                            gradingCriteria: {
                              ...updatesVal.grading?.gradingCriteria,
                              maxScore: TotalTestMarks,
                            },
                          },
                        })
                      );
                      dispatch(
                        updateTestValues({
                          grading: {
                            ...SingleTest.grading,
                            gradingCriteria: {
                              ...SingleTest.grading?.gradingCriteria,
                              maxScore: TotalTestMarks,
                            },
                          },
                        })
                      );
                    }}
                  />
                  <label>Pass Score&nbsp;:</label>
                  <input
                    type="number"
                    placeholder="Pass Score"
                    defaultValue={
                      SingleTest &&
                      SingleTest.grading &&
                      SingleTest.grading.gradingCriteria &&
                      SingleTest.grading.gradingCriteria.passScore
                    }
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      const numericValue =
                        value === "" ? "" : parseFloat(value);

                      if (
                        value === "" ||
                        (numericValue >= 0 && numericValue <= TotalTestMarks)
                      ) {
                        dispatch(
                          updatingVals({
                            ...updatesVal,
                            grading: {
                              ...updatesVal.grading,
                              gradingCriteria: {
                                ...updatesVal.grading?.gradingCriteria,
                                passScore: value,
                              },
                            },
                          })
                        );
                        dispatch(
                          updateTestValues({
                            grading: {
                              ...SingleTest.grading,
                              gradingCriteria: {
                                ...SingleTest.grading?.gradingCriteria,
                                passScore: value,
                              },
                            },
                          })
                        );
                      } else if (
                        value !== "" &&
                        numericValue > TotalTestMarks
                      ) {
                        e.target.value = "";
                        message.info(
                          "Pass Score cannot exceed Total Test Marks"
                        );
                        message.instance = true;
                      }
                    }}
                  />
                </div>
              </div>

              <div className={gradingStyles.flexComp3}>
                <span className={gradingStyles.spans}>{"Score Range"}</span>
                <div className={gradingStyles.flexcomp_main}>
                  {intervals.map((interval, index) => (
                    <div key={index} className={gradingStyles.flexCon}>
                      <div className={gradingStyles.inpsCon}>
                        <h2>{index + 1}.</h2>
                        <input
                          type="number"
                          placeholder="Max Score"
                          value={interval.scoreFrom ?? ""}
                          onChange={(e) =>
                            handleInputChange(
                              index,
                              "scoreFrom",
                              e.target.value
                            )
                          }
                        />
                        {"-"}
                        <input
                          type="number"
                          placeholder="Min Score"
                          value={interval.scoreTo ?? ""}
                          onChange={(e) =>
                            handleInputChange(index, "scoreTo", e.target.value)
                          }
                        />
                        <img
                          src="https://res.cloudinary.com/cliqtick/image/upload/a_hflip/c_crop,w_600,h_300/v1722338593/free-black-arrow-left-icon-11375-thumb_fc3aba.png"
                          width="24px"
                        />
                        <input
                          type="text"
                          placeholder="Grade"
                          value={interval.grade ?? ""}
                          onChange={(e) =>
                            handleInputChange(index, "grade", e.target.value)
                          }
                        />
                        <img
                          className={gradingStyles.deleteButton}
                          onClick={() => handleDeleteInterval(index)}
                          src="https://res.cloudinary.com/cliqtick/image/upload/v1718799083/sysnper/f29853d87e22f70d1cc10a3fcd7959c4_phnqgw.png"
                          alt="delete"
                        />
                      </div>

                      <div className={gradingStyles.inpsCon}>
                        <h4>To be Included in the Message</h4>
                        <button
                          className={
                            interval?.selectedValues?.includes("%")
                              ? gradingStyles.selected
                              : gradingStyles.notSelected
                          }
                          onClick={() => handleSelectValue(index, "%")}
                        >
                          %
                        </button>
                        <button
                          className={
                            interval?.selectedValues?.includes("Grade")
                              ? gradingStyles.selected
                              : gradingStyles.notSelected
                          }
                          onClick={() => handleSelectValue(index, "Grade")}
                        >
                          Grade
                        </button>
                        <button
                          className={
                            interval?.selectedValues?.includes("Score")
                              ? gradingStyles.selected
                              : gradingStyles.notSelected
                          }
                          onClick={() => handleSelectValue(index, "Score")}
                        >
                          Score
                        </button>
                      </div>
                      <div className={gradingStyles.editorComp}>
                        <TextEditor
                          name={`ScoreRangeMessage-${index}`}
                          editorFun={(val) =>
                            sendEditorVals(val, "ScoreRangeMessage", index)
                          }
                          initialContent={
                            {
                              [`ScoreRangeMessage-${index}`]:
                                SingleTest?.grading?.scoreRange?.[index]
                                  ?.message,
                            } || {}
                          }
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    className={gradingStyles.Add_more_intervals_btn}
                    onClick={handleAddInterval}
                  >
                    + Add More Intervals
                  </button>
                </div>
              </div>

              <div className={gradingStyles.flexComp3}>
                <span className={gradingStyles.spans}>
                  {"Test Fail Message"}
                </span>
                <div className={gradingStyles.flexcomp_main}>
                  <div className={gradingStyles.flexCon}>
                    <div className={gradingStyles.inpsCon}>
                      <button
                        className={
                          Failintervals?.selectedValues?.includes("%")
                            ? gradingStyles.selected
                            : gradingStyles.notSelected
                        }
                        onClick={() => handleFailSelectValue("%")}
                      >
                        %
                      </button>
                      <button
                        className={
                          Failintervals?.selectedValues?.includes("Grade")
                            ? gradingStyles.selected
                            : gradingStyles.notSelected
                        }
                        onClick={() => handleFailSelectValue("Grade")}
                      >
                        Grade
                      </button>
                      <button
                        className={
                          Failintervals?.selectedValues?.includes("Score")
                            ? gradingStyles.selected
                            : gradingStyles.notSelected
                        }
                        onClick={() => handleFailSelectValue("Score")}
                      >
                        Score
                      </button>
                    </div>
                    <div className={gradingStyles.editorComp}>
                      <TextEditor
                        name="TestFailMessage"
                        editorFun={(val) =>
                          sendFailEditorVals(val, "TestFailMessage")
                        }
                        initialContent={
                          {
                            TestFailMessage:
                              SingleTest?.grading?.failIntervals
                                ?.TestFailMessage ||
                              '"<p><strong style=\\"background-color: transparent;\\">Thank you for your effort. Unfortunately, you did not pass this exam.</strong></p><p><span style=\\"background-color: transparent;\\">Don’t be</span><strong style=\\"background-color: transparent;\\"> </strong><span style=\\"background-color: transparent;\\">discouraged—use this as an opportunity to learn and improve.</span></p>"',
                          } || {}
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          <div
            className={gradingStyles.save}
            onClick={() => {
              const updates = { ...SingleTest };
              delete updates._id;
              const updateVals = {
                grading: {
                  ...updates?.grading,
                  gradingCriteria: {
                    ...updates.grading?.gradingCriteria,
                    maxScore:
                      updates.grading?.gradingCriteria?.maxScore ??
                      TotalTestMarks,
                  },
                  TestEndMessage:
                    SingleTest?.grading?.TestEndMessage ||
                    defaultTestEndMessage,

                  failIntervals: {
                    ...updates?.grading?.failIntervals,
                    TestFailMessage:
                      SingleTest?.grading?.failIntervals?.TestFailMessage ||
                      '"<p><strong style=\\"background-color: transparent;\\">Thank you for your effort. Unfortunately, you did not pass this exam.</strong></p><p><span style=\\"background-color: transparent;\\">Don’t be</span><strong style=\\"background-color: transparent;\\"> </strong><span style=\\"background-color: transparent;\\">discouraged—use this as an opportunity to learn and improve.</span></p>"',
                  },
                },
              };
              dispatch(updateTest({ id: selectedId, updates: updateVals }));
            }}
          >
            <BTag>{SingleTest?._id ? "Update" : "Save"}</BTag>
          </div>
        </div>
      )}
    </>
  );
};

export default Page;
