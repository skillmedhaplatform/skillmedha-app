"use client";
import React, { useState } from "react";
import ScoreSettingsStyles from "./styles/score.module.scss";
import { useDispatch, useSelector } from "react-redux";
import BTag from "../../../utils/button";
import { createQuestion, updateQuestion,setQuestionVals } from "@/redux/slices/testportal_admin/slice/questions";
import { message } from "antd";
import { useParams } from "next/navigation";

const ScoreSettings = () => {
  const [selectedOptions, setSelectedOptions] = useState([]);

  const values = useSelector((state) => state.questions.questionVals);
  const selectedTest = useSelector(state => state.tests.test)

  const { question: questionId, ["test-slug"]: testId } = useParams();

  const dispatch = useDispatch();

  const handleChange = (event) => {
    const { value, checked, name } = event.target;
    setSelectedOptions([...selectedOptions, value]);
    dispatch(
      setQuestionVals({
        ...values,
        scoreSettings: { ...values.scoreSettings, [name]: checked },
      })
    );
  };

  const [radioOpts, setRadioOpts] = useState("");
  const RadioSel = (event) => {
    // setRadioOpts(event.target.value);
    dispatch(
      setQuestionVals({
        ...values,
        scoreSettings: {
          scoreType: event.target.value,
        },
      })
    );
  };

  const SubmitButton = () => {
    if(questionId == "new-question") {
      dispatch(createQuestion({ ...values, testId: testId.split("_id-")[1],testTitle: selectedTest.title }));
    } else {
      dispatch(updateQuestion({...values,questionId:values._id ,testId: testId.split("_id-")[1],testTitle: selectedTest.title}))
    }
  };
  return (
    <div className={ScoreSettingsStyles.container}>
      <div className={ScoreSettingsStyles.radioButtons}>
        <label>
          <input
            type="checkbox"
            name="displayMaxScore"
            value="displayMaxScore"
            checked={selectedOptions.displayMaxScore || values && values.scoreSettings && values.scoreSettings.displayMaxScore}
            onChange={handleChange}
          />
          <span></span>
          Display maximum possible score for this question.
        </label>
        <br />
        <label>
          <input
            type="checkbox"
            name="requiredQuestion"
            value="requiredQuestion"
            checked={selectedOptions.requiredQuestion || values && values.scoreSettings && values.scoreSettings.requiredQuestion}
            onChange={handleChange}

          />
          <span></span>
          Force respondent to answer this question when displayed the first
          time.
        </label>
      </div>
      <div className={ScoreSettingsStyles.scoreTitle}>SCORE SETTINGS</div>

      <div className={ScoreSettingsStyles.scoreContent}>
        <label>
           <input
            type="radio"
            value="fullScore"
            checked={ values&& values.scoreSettings && values.scoreSettings.scoreType == "fullScore"}
            onChange={RadioSel}
            name="options"
          />
          <span></span>

          <div className={ScoreSettingsStyles.leftP}>Full Score</div>
          <input
            disabled={values&& values.scoreSettings && values.scoreSettings.scoreType !== "fullScore"}
            type="number"
            step="0.01"
            placeholder="Number of points for correct answer ( > 0 )"
            onChange={(e) =>
            {

              // if(e.target.value < 0) {
              //   return message.info("Values should be more than 0")
              // }
              dispatch(
                setQuestionVals({
                  ...values,
                  scoreSettings: {
                    ...values.scoreSettings,
                    pointsForCorrectAns: e.target.value,
                  },
                })
              )
            }
            }
            value={values&& values.scoreSettings && values.scoreSettings.pointsForCorrectAns || 0}
            min={0.01}
          />

          <input
            disabled={values&& values.scoreSettings && values.scoreSettings.scoreType !== "fullScore"}
            type="number"
            step="0.01"
            placeholder="Number of points for incorrect answer ( <= 0 )"
            onChange={(e) =>{
              // if(e.target.value > 0) {
              //   return message.info("Values should be less than 0")
              // }
              let val = e.target.value;
              if (val > 0) val = -val;
              dispatch(
                setQuestionVals({
                  ...values,
                  scoreSettings: {
                    ...values.scoreSettings,
                    pointsForIncorrectAns: val,
                  },
                })
              )}
            }
            defaultValue={values&& values.scoreSettings && values.scoreSettings.pointsForIncorrectAns || 0}
            max={0}
          />
        </label>
        <br />
        <label>
          <input
            type="radio"
            value="partialScore"
            checked={ values&& values.scoreSettings && values.scoreSettings.scoreType == "partialScore"}
            onChange={RadioSel}
            name="options"
          />
          <span></span>

          <div className={ScoreSettingsStyles.leftP}>Partial Score</div>

          <div className={ScoreSettingsStyles.rightP}>
            <input
              disabled={values&& values.scoreSettings && values.scoreSettings.scoreType !== "partialScore"}
              type="number"
              step="0.01"
              placeholder="Number of points for Each correct answer"
              min={0}
              onChange={(e) =>
              {
                // if(e.target.value < 0) {
                //   return message.info("Values should be more than 0")
                // }
                dispatch(
                  setQuestionVals({
                    ...values,
                    scoreSettings: {
                      ...values.scoreSettings,
                      PointsForEachCorrectAnswer: e.target.value,
                    },
                  })
                )
              }
              }
              defaultValue={values && values.scoreSettings && values.scoreSettings.PointsForEachCorrectAnswer}
            />
            <div className={ScoreSettingsStyles.noteDivs}>
              *Points for each correct answer
            </div>

            <input
              disabled={values&& values.scoreSettings && values.scoreSettings.scoreType !== "partialScore"}
              type="number"
              step="0.01"
              placeholder="Number of bonus points if all correct"
              min={0}
              onChange={(e) =>
              {
                // if(e.target.value < 0) {
                //   return message.info("Values should be more than 0")
                // }
                dispatch(
                  setQuestionVals({
                    ...values,
                    scoreSettings: {
                      ...values.scoreSettings,
                      bonusPointsForAllCorrect: e.target.value,
                    },
                  })
                )
              }
              }
              defaultValue={values && values.scoreSettings && values.scoreSettings.bonusPointsForAllCorrect}
            />
            <div className={ScoreSettingsStyles.noteDivs}>
              *Bonus Points are added on top of the regular score , if the
              student answers all the partial answers correct.{" "}
            </div>

            <label className={ScoreSettingsStyles.rightPIn}>
              <input
                disabled={values&& values.scoreSettings && values.scoreSettings.scoreType !== "partialScore"}
                type="checkbox"
                value="pointsForEachIncorrectAns"
                name="pointsForEachIncorrectAns"
                checked={ values&& values.scoreSettings && values.scoreSettings.pointsForEachIncorrectAns}
                onChange={handleChange}
              />
              <span></span>

              <input
                disabled={values&& values.scoreSettings && values.scoreSettings.scoreType !== "partialScore" || !values?.scoreSettings?.pointsForEachIncorrectAns}
                placeholder="Number of Points for Incorrect answer (<=0)"
                type="number"
                step="0.01"
                onChange={(e) =>
                {
                  // if(e.target.value > 0) {
                  //   return message.info("Values should be less than 0")
                  // }
                   let val = e.target.value;
                   if (val > 0) val = -val;
                  dispatch(
                    setQuestionVals({
                      ...values,
                      scoreSettings: {
                        ...values.scoreSettings,
                        pointsForEachIncorrectAns: val,
                      },
                    })
                  )
                }
                }
                defaultValue={values&& values.scoreSettings && values.scoreSettings.pointsForEachIncorrectAns}
                max={0}
              />
            </label>

            <label className={ScoreSettingsStyles.rightPIn}>
              <input
                disabled={values&& values.scoreSettings && values.scoreSettings.scoreType !== "partialScore"}
                type="checkbox"
                value="partialPointsForEachInCorrectAns"
                name="partialPointsForEachInCorrectAns"
                checked={values&& values.scoreSettings && values.scoreSettings.partialPointsForEachInCorrectAns}
                onChange={handleChange}
              />
              <span></span>

              <input
                disabled={values&& values.scoreSettings && values.scoreSettings.scoreType !== "partialScore" || !values?.scoreSettings?.partialPointsForEachInCorrectAns}
                placeholder="Number of Points for Each Incorrect partial answer (<=0)"
                type="number"
                step="0.01"
                onChange={(e) => {
                  // if(e.target.value > 0) {
                  //   return message.info("Values should be less than 0")
                  // }
                  let val = e.target.value;
                  if (val > 0) val = -val;
                  dispatch(
                    setQuestionVals({
                      ...values,
                      scoreSettings: {
                        ...values.scoreSettings,
                        partialPointsForEachInCorrectAns: val,
                      },
                    })
                  )
                }
                }
                defaultValue={values&& values.scoreSettings && values.scoreSettings.partialPointsForEachInCorrectAns}
                max={0}
              />
            </label>
            <div className={ScoreSettingsStyles.noteDivs1}>
              *Points can be deducted for each incorrect answer.{" "}
            </div>

          </div>
        </label>
      </div>

      <div onClick={SubmitButton} style={{ width: "fit-content" }}>
        <BTag>{questionId !== "new-question" ? "Update Question" : "Save and next"}</BTag>
      </div>
    </div>
  );
};

export default ScoreSettings;