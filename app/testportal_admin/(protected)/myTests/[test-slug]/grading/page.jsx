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
import { 
  MessageOutlined, 
  EyeOutlined, 
  StarOutlined, 
  BarChartOutlined, 
  CloseCircleOutlined, 
  DeleteOutlined, 
  PlusOutlined,
  InfoCircleOutlined 
} from "@ant-design/icons";
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

  const router = useRouter();

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
          {/* Card 1: Test End Message */}
          <div className={gradingStyles.cardSection}>
            <div className={gradingStyles.sectionHeader}>
              <div className={gradingStyles.headerLeft}>
                <MessageOutlined className={gradingStyles.sectionIcon} />
                <h3>Test End Message</h3>
              </div>
            </div>
            <p className={gradingStyles.description}>
              This message is shown to candidates after they submit the test.
            </p>
            <div className={gradingStyles.editorWrapper}>
              <TextEditor
                name="TestEndMessage"
                editorFun={(val) => sendTestEndMessage(val, "TestEndMessage")}
                initialContent={
                  {
                    TestEndMessage:
                      SingleTest?.grading?.TestEndMessage ||
                      defaultTestEndMessage,
                  } || {}
                }
              />
            </div>
          </div>

          {/* Card 2: Display Results */}
          <div className={gradingStyles.cardSection}>
            <div className={gradingStyles.sectionHeader}>
              <div className={gradingStyles.headerLeft}>
                <EyeOutlined className={gradingStyles.sectionIcon} />
                <h3>Display Results</h3>
              </div>
              <div className={gradingStyles.headerRight}>
                <div className={gradingStyles.toggleGroup}>
                  <button
                    className={handleResults === "Disable" ? gradingStyles.active : ""}
                    onClick={() => handleResultsVal({ target: { value: "Disable" } })}
                  >
                    Disable
                  </button>
                  <button
                    className={handleResults === "Enable" ? gradingStyles.active : ""}
                    onClick={() => handleResultsVal({ target: { value: "Enable" } })}
                  >
                    Enable
                  </button>
                </div>
              </div>
            </div>
            <p className={gradingStyles.description}>
              When enabled, candidates can see their score and correct answers immediately after submission.
            </p>
          </div>

          {handleResults === "Enable" && (
            <>
              {/* Card 3: Grading Criteria */}
              <div className={gradingStyles.cardSection}>
                <div className={gradingStyles.sectionHeader}>
                  <div className={gradingStyles.headerLeft}>
                    <StarOutlined className={gradingStyles.sectionIcon} />
                    <h3>Grading Criteria</h3>
                  </div>
                </div>
                <div className={gradingStyles.criteriaRow}>
                  <div className={gradingStyles.inputGroup}>
                    <label>Full Score</label>
                    <input
                      type="number"
                      placeholder="Max Score"
                      value={TotalTestMarks}
                      disabled
                    />
                  </div>
                  <div className={gradingStyles.inputGroup}>
                    <label>Pass Score</label>
                    <input
                      type="number"
                      placeholder="Enter pass score..."
                      defaultValue={
                        SingleTest?.grading?.gradingCriteria?.passScore
                      }
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        const numericValue = value === "" ? "" : parseFloat(value);

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
                        } else if (value !== "" && numericValue > TotalTestMarks) {
                          e.target.value = "";
                          message.info("Pass Score cannot exceed Total Test Marks");
                        }
                      }}
                    />
                  </div>
                </div>
                <div className={gradingStyles.hintRow}>
                  <InfoCircleOutlined />
                  <span>Set the minimum score required to pass. Leave empty if no pass threshold applies.</span>
                </div>
              </div>

              {/* Card 4: Score Range */}
              <div className={gradingStyles.cardSection}>
                <div className={gradingStyles.sectionHeader}>
                  <div className={gradingStyles.headerLeft}>
                    <BarChartOutlined className={gradingStyles.sectionIcon} />
                    <h3>Score Range</h3>
                  </div>
                </div>

                {intervals.map((interval, index) => (
                  <div key={index} className={gradingStyles.intervalItem}>
                    <div className={gradingStyles.intervalHeader}>
                      <div className={gradingStyles.intervalInputs}>
                        <div className={gradingStyles.badge}>{index + 1}</div>
                        <input
                          type="number"
                          placeholder="Max"
                          value={interval.scoreFrom ?? ""}
                          onChange={(e) =>
                            handleInputChange(index, "scoreFrom", e.target.value)
                          }
                        />
                        <span className={gradingStyles.dash}>—</span>
                        <input
                          type="number"
                          placeholder="Min"
                          value={interval.scoreTo ?? ""}
                          onChange={(e) =>
                            handleInputChange(index, "scoreTo", e.target.value)
                          }
                        />
                        <span className={gradingStyles.dash}>→</span>
                        <input
                          type="text"
                          placeholder="Grade label (e.g. A, Excellent)"
                          value={interval.grade ?? ""}
                          className={gradingStyles.gradeInput}
                          onChange={(e) =>
                            handleInputChange(index, "grade", e.target.value)
                          }
                        />
                      </div>
                      <DeleteOutlined
                        className={gradingStyles.deleteBtn}
                        onClick={() => handleDeleteInterval(index)}
                      />
                    </div>

                    <div className={gradingStyles.includeOptions}>
                      <span>Include in the Message:</span>
                      <button
                        className={`${gradingStyles.pillBtn} ${interval?.selectedValues?.includes("%") ? gradingStyles.activePill : ""}`}
                        onClick={() => handleSelectValue(index, "%")}
                      >
                        % Score
                      </button>
                      <button
                        className={`${gradingStyles.pillBtn} ${interval?.selectedValues?.includes("Grade") ? gradingStyles.activePill : ""}`}
                        onClick={() => handleSelectValue(index, "Grade")}
                      >
                        Grade
                      </button>
                      <button
                        className={`${gradingStyles.pillBtn} ${interval?.selectedValues?.includes("Score") ? gradingStyles.activePill : ""}`}
                        onClick={() => handleSelectValue(index, "Score")}
                      >
                        Score
                      </button>
                    </div>

                    <p className={gradingStyles.description} style={{ margin: "0.5rem 0 0 0" }}>
                      Message shown for this score range:
                    </p>
                    <div className={gradingStyles.editorWrapper}>
                      <TextEditor
                        name={`ScoreRangeMessage-${index}`}
                        editorFun={(val) =>
                          sendEditorVals(val, "ScoreRangeMessage", index)
                        }
                        initialContent={
                          {
                            [`ScoreRangeMessage-${index}`]:
                              SingleTest?.grading?.scoreRange?.[index]?.message,
                          } || {}
                        }
                      />
                    </div>
                  </div>
                ))}

                <button className={gradingStyles.addBtn} onClick={handleAddInterval}>
                  <PlusOutlined /> Add More Intervals
                </button>
              </div>

              {/* Card 5: Test Fail Message */}
              <div className={gradingStyles.cardSection}>
                <div className={gradingStyles.sectionHeader}>
                  <div className={gradingStyles.headerLeft}>
                    <CloseCircleOutlined className={gradingStyles.sectionIcon} style={{ color: "#ef4444" }} />
                    <h3>Test Fail Message</h3>
                  </div>
                  <div className={gradingStyles.headerRight}>
                    <div className={gradingStyles.includeOptions} style={{ margin: 0 }}>
                      <button
                        className={`${gradingStyles.pillBtn} ${Failintervals?.selectedValues?.includes("%") ? gradingStyles.activePill : ""}`}
                        onClick={() => handleFailSelectValue("%")}
                      >
                        % Score
                      </button>
                      <button
                        className={`${gradingStyles.pillBtn} ${Failintervals?.selectedValues?.includes("Grade") ? gradingStyles.activePill : ""}`}
                        onClick={() => handleFailSelectValue("Grade")}
                      >
                        Grade
                      </button>
                      <button
                        className={`${gradingStyles.pillBtn} ${Failintervals?.selectedValues?.includes("Score") ? gradingStyles.activePill : ""}`}
                        onClick={() => handleFailSelectValue("Score")}
                      >
                        Score
                      </button>
                    </div>
                  </div>
                </div>

                <div className={gradingStyles.editorWrapper}>
                  <TextEditor
                    name="TestFailMessage"
                    editorFun={(val) =>
                      sendFailEditorVals(val, "TestFailMessage")
                    }
                    initialContent={
                      {
                        TestFailMessage:
                          SingleTest?.grading?.failIntervals?.TestFailMessage ||
                          '"<p><strong style=\\"background-color: transparent;\\">Thank you for your effort. Unfortunately, you did not pass this exam.</strong></p><p><span style=\\"background-color: transparent;\\">Don’t be</span><strong style=\\"background-color: transparent;\\"> </strong><span style=\\"background-color: transparent;\\">discouraged—use this as an opportunity to learn and improve.</span></p>"',
                      } || {}
                    }
                  />
                </div>
              </div>
            </>
          )}

          {/* Form Actions */}
          <div className={gradingStyles.formActions}>
            <button
              className={gradingStyles.saveBtn}
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
                dispatch(updateTest({ id: selectedId, updates: updateVals })).then((res) => {
                  if (res?.payload) {
                    message.success("Grading settings updated successfully");
                  }
                });
              }}
            >
              Update
            </button>
            <button className={gradingStyles.discardBtn} onClick={() => router.push("/testportal_admin/myTests")}>
              Discard
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Page;
