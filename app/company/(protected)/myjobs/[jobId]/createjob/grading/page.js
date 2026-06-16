"use client";
import React, { useEffect, useState } from "react";
import gradingStyles from "./styles/page.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import { Button, Radio, message } from "antd";
import {
  getOneJobAssessment,
  updateJobAssessment,
} from "@/redux/slices/company/skillMedhaData";
import TextEditor from "@/utils/universalUtils/editor";

const Page = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useParams();

  const singleJobAssessment = useSelector(
    (s) => s.companySkillMedhaData?.singleJobAssessment
  );

  const ONEJOB = useSelector((state) => state.companyPlacements?.OneJob?.value);
  const aId = ONEJOB?.data?.AssessmentId;

  useEffect(() => {
    if (aId) {
      dispatch(getOneJobAssessment({ id: aId }));
    }
  }, [aId]);

  // State variables - Updated with all three options selected by default
  const [testEndMessage, setTestEndMessage] = useState("");
  const [showResults, setShowResults] = useState("Disable");
  const [totalTestMarks, setTotalTestMarks] = useState(0);

  const [passScore, setPassScore] = useState("");
  const [intervals, setIntervals] = useState([
    {
      scoreFrom: "",
      scoreTo: "",
      grade: "",
      message: "",
      selectedValues: ["%", "Grade", "Score"], // All three selected by default
    },
  ]);
  const [failIntervals, setFailIntervals] = useState({
    selectedValues: ["%", "Grade", "Score"], // All three selected by default
    TestFailMessage: "",
  });

  // Default messages
  const defaultTestEndMessage = `<p><strong style="background-color: transparent;">Thank you for completing the exam.</strong></p><p><span style="background-color: transparent;">We appreciate your effort and participation.</span></p>`;

  const defaultTestFailMessage = `<p><strong style="background-color: transparent;">Thank you for your effort. Unfortunately, you did not pass this exam.</strong></p><p><span style="background-color: transparent;">Don't be</span><strong style="background-color: transparent;"> </strong><span style="background-color: transparent;">discouraged—use this as an opportunity to learn and improve.</span></p>`;

  // Calculate total marks from questions
  useEffect(() => {
    if (singleJobAssessment?.questionsData?.length) {
      const updatedQues = singleJobAssessment.questionsData.reduce(
        (acc, question) => {
          if (question?.questionType?.includes("Comprehension")) {
            return [...acc, ...(question?.questionContentArr || [])];
          } else {
            return [...acc, question];
          }
        },
        []
      );

      const totalMarksEachTests = updatedQues.map((question) => {
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
      setTotalTestMarks(total);
    }
  }, [singleJobAssessment?.questionsData]);

  // Prefill data when assessment loads - Updated
  useEffect(() => {
    if (singleJobAssessment && singleJobAssessment._id) {
      setTestEndMessage(
        singleJobAssessment.grading?.TestEndMessage || defaultTestEndMessage
      );

      setShowResults(singleJobAssessment.grading?.showResults || "Disable");

      setPassScore(
        singleJobAssessment.grading?.gradingCriteria?.passScore || ""
      );

      if (singleJobAssessment.grading?.scoreRange) {
        setIntervals(singleJobAssessment.grading.scoreRange);
      }

      if (singleJobAssessment.grading?.failIntervals) {
        setFailIntervals({
          selectedValues: singleJobAssessment.grading.failIntervals
            .selectedValues || ["%", "Grade", "Score"], // Default to all three
          TestFailMessage:
            singleJobAssessment.grading.failIntervals.TestFailMessage ||
            defaultTestFailMessage,
        });
      }
    }
  }, [singleJobAssessment]);

  // Handle interval changes
  const handleInputChange = (index, field, value) => {
    const newIntervals = intervals.map((interval, i) =>
      i === index ? { ...interval, [field]: value } : interval
    );
    setIntervals(newIntervals);
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
  };

  const handleFailSelectValue = (value) => {
    const newSelectedValues = failIntervals.selectedValues.includes(value)
      ? failIntervals.selectedValues.filter((v) => v !== value)
      : [...failIntervals.selectedValues, value];

    setFailIntervals({
      ...failIntervals,
      selectedValues: newSelectedValues,
    });
  };

  const sendEditorVals = (val, index) => {
    const newIntervals = intervals.map((interval, i) =>
      i === index ? { ...interval, message: val } : interval
    );
    setIntervals(newIntervals);
  };

  const sendFailEditorVals = (val) => {
    setFailIntervals({
      ...failIntervals,
      TestFailMessage: val,
    });
  };

  // Updated handleAddInterval with all three options selected by default
  const handleAddInterval = () => {
    setIntervals([
      ...intervals,
      {
        scoreFrom: "",
        scoreTo: "",
        grade: "",
        message: "",
        selectedValues: ["%", "Grade", "Score"], // All three selected by default
      },
    ]);
  };

  const handleDeleteInterval = (index) => {
    const newIntervals = intervals.filter((_, i) => i !== index);
    setIntervals(newIntervals);
  };

  const handleResultsVal = ({ target: { value } }) => {
    setShowResults(value);
  };

  const handlePassScoreChange = (e) => {
    const value = parseFloat(e.target.value);
    const numericValue = value === "" ? "" : parseFloat(value);

    if (value === "" || (numericValue >= 0 && numericValue <= totalTestMarks)) {
      setPassScore(value);
    } else if (value !== "" && numericValue > totalTestMarks) {
      e.target.value = "";
      message.info("Pass Score cannot exceed Total Test Marks");
    }
  };

  // Updated handleSave to match the exact format you specified
  const handleSave = async () => {
    try {
      const payload = {
        grading: {
          gradingCriteria: {
            maxScore: totalTestMarks,
            ...(passScore !== "" && { passScore: passScore }),
          },
          TestEndMessage: testEndMessage,
          failIntervals: {
            TestFailMessage: failIntervals.TestFailMessage,
            ...(failIntervals.selectedValues &&
              failIntervals.selectedValues.length > 0 && {
                selectedValues: failIntervals.selectedValues,
              }),
          },
          showResults: showResults,
          scoreRange: intervals,
        },
      };

      if (singleJobAssessment && singleJobAssessment._id) {
        await dispatch(updateJobAssessment({ ...payload, aId, dispatch }));
        message.success("Grading configuration saved successfully!");
      } else {
        message.error("No assessment found to update");
      }
    } catch (error) {
      console.error("Error saving grading configuration:", error);
      message.error("Failed to save grading configuration");
    }
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

  return (
    <div className={gradingStyles.container}>
      <div className={gradingStyles.flexComp}>
        <span className={gradingStyles.spans} style={{ color: "#25a3a6" }}>
          {"Test End Message"}
        </span>
        <div className={gradingStyles.editorComp}>
          <TextEditor
            name="TestEndMessage"
            editorFun={(val) => setTestEndMessage(val)}
            initialContent={{
              TestEndMessage: testEndMessage,
            }}
          />
        </div>
      </div>

      <div className={gradingStyles.flexComp2}>
        <span className={gradingStyles.spans} style={{ color: "#25a3a6" }}>
          {"Display Results"}
        </span>
        <div>
          <Radio.Group
            optionType="button"
            buttonStyle="solid"
            options={optionsResults}
            value={showResults}
            onChange={handleResultsVal}
          />
        </div>
      </div>

      {showResults === "Enable" && (
        <>
          <div className={gradingStyles.flexComp2}>
            <span className={gradingStyles.spans} style={{ color: "#25a3a6" }}>
              {"Grading Criteria"}
            </span>
            <div className={gradingStyles.inpsCon}>
              <label>Full Score&nbsp;:</label>
              <input
                type="number"
                placeholder="Max Score"
                value={totalTestMarks}
                readOnly
              />
              <label>Pass Score&nbsp;:</label>
              <input
                type="number"
                placeholder="Pass Score"
                value={passScore}
                onChange={handlePassScoreChange}
              />
            </div>
          </div>

          <div className={gradingStyles.flexComp3}>
            <span className={gradingStyles.spans} style={{ color: "#25a3a6" }}>
              {"Score Range"}
            </span>
            <div className={gradingStyles.flexcomp_main}>
              {intervals.map((interval, index) => (
                <div key={index} className={gradingStyles.flexCon}>
                  <div className={gradingStyles.inpsCon}>
                    <h2>{index + 1}.</h2>
                    <input
                      type="number"
                      placeholder="Max Score"
                      value={interval.scoreFrom}
                      onChange={(e) =>
                        handleInputChange(index, "scoreFrom", e.target.value)
                      }
                    />
                    {"-"}
                    <input
                      type="number"
                      placeholder="Min Score"
                      value={interval.scoreTo}
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
                      value={interval.grade}
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

                  <div className={gradingStyles.editorComp}>
                    <TextEditor
                      name={`ScoreRangeMessage-${index}`}
                      editorFun={(val) => sendEditorVals(val, index)}
                      initialContent={{
                        [`ScoreRangeMessage-${index}`]: interval.message,
                      }}
                    />
                  </div>
                </div>
              ))}
              <Button type="primary" onClick={handleAddInterval}>
                + Add More Intervals
              </Button>
            </div>
          </div>

          <div className={gradingStyles.flexComp3}>
            <span className={gradingStyles.spans} style={{ color: "#25a3a6" }}>
              {"Test Fail Message"}
            </span>
            <div className={gradingStyles.flexcomp_main}>
              <div className={gradingStyles.flexCon}>
                {/* <div className={gradingStyles.inpsCon}>
                  <button
                    className={
                      failIntervals?.selectedValues?.includes("%")
                        ? gradingStyles.selected
                        : gradingStyles.notSelected
                    }
                    onClick={() => handleFailSelectValue("%")}
                  >
                    %
                  </button>
                  <button
                    className={
                      failIntervals?.selectedValues?.includes("Grade")
                        ? gradingStyles.selected
                        : gradingStyles.notSelected
                    }
                    onClick={() => handleFailSelectValue("Grade")}
                  >
                    Grade
                  </button>
                  <button
                    className={
                      failIntervals?.selectedValues?.includes("Score")
                        ? gradingStyles.selected
                        : gradingStyles.notSelected
                    }
                    onClick={() => handleFailSelectValue("Score")}
                  >
                    Score
                  </button>
                </div> */}
                <div className={gradingStyles.editorComp}>
                  <TextEditor
                    name="TestFailMessage"
                    editorFun={(val) => sendFailEditorVals(val)}
                    initialContent={{
                      TestFailMessage: failIntervals.TestFailMessage,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <div className={gradingStyles.save} onClick={handleSave}>
        <Button type="primary">
          {singleJobAssessment?._id ? "Update" : "Save"}
        </Button>
      </div>
    </div>
  );
};

export default Page;
