"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Select, InputNumber } from "antd";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { setFormValues } from "@/redux/slices/company/stepform";
import { imgUrls } from "@/utils/universalUtils/images";
import TextEditor from "@/utils/universalUtils/editor";
import QuestionStyles from "./styles.module.scss";
import { RiDeleteBinLine } from "react-icons/ri";
import {
  addQuestions,
  clearAddQuestionsState,
  getSingleQuestion,
  updateQuestions,
  clearUpdateQuestionsState,
  clearSingleQuestionState,
} from "@/redux/slices/admin/cms/skillsSlice";
import { restUrl } from "@/utils/universalUtils/urls";
import VideoUpload from "../utils/video";
import AudioUpload from "../utils/audio";
import { updateJobAssessment } from "@/redux/slices/company/skillMedhaData";

const QUESTION_TYPES = {
  TEXT: "Text",
  SINGLE_CHOICE: "Single Choice",
  MULTIPLE_CHOICE: "Multiple Choice",
  TRUE_FALSE: "True/False",
  FILL_IN_THE_BLANKS: "Fill in the Blanks",
  AUDIO: "Audio",
  VIDEO: "Video",
};

const DIFFICULTY_LEVELS = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
  { value: "expert", label: "Expert" },
];

const labelOptions = [
  { name: QUESTION_TYPES.TEXT, icon: imgUrls.SingleChoiceIcon },
  { name: QUESTION_TYPES.SINGLE_CHOICE, icon: imgUrls.SingleChoiceIcon },
  { name: QUESTION_TYPES.MULTIPLE_CHOICE, icon: imgUrls.MultipleChoiceIcon },
  { name: QUESTION_TYPES.TRUE_FALSE, icon: imgUrls.SingleChoiceIcon },
  // { name: QUESTION_TYPES.FILL_IN_THE_BLANKS, icon: imgUrls.SingleChoiceIcon },
  { name: QUESTION_TYPES.AUDIO, icon: imgUrls.AudioIcon },
  { name: QUESTION_TYPES.VIDEO, icon: imgUrls.VideoIcon },
];

const QuestionEditor = () => {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const singleJobAssessment = useSelector(
    (s) => s.skillmedha.singleJobAssessment
  );
  const AssessmentId = useMemo(
    () => params?.question?.split("__")[0]?.split("_")[1] || null,
    [params?.question]
  );

  const questionId = useMemo(
    () => params?.question?.split("__")[1] || null,
    [params?.question]
  );

  const isUpdateMode = !!(questionId && questionId !== "NewQuestion");

  useEffect(() => {
    if (!AssessmentId || !questionId) {
      router.replace(`/company/myjobs/${params?.jobId}/createjob/questionManager`);
    }
  }, [AssessmentId, questionId, router]);

  const singleTest = useSelector((state) => state.steps?.value ?? {});
  const addQuestionsState = useSelector((state) => state.skill?.addQuestions ?? {});
  const updateQuestionsState = useSelector(
    (state) => state.skill.updateQuestions
  );
  const singleQuestion = useSelector(
    (state) => state.skill.singleQuestion.value?.data
  );
  const singleQuestionStatus = useSelector(
    (state) => state.skill.singleQuestion.status
  );

  const [questionType, setQuestionType] = useState(QUESTION_TYPES.TEXT);
  const [options, setOptions] = useState([{ text: "", isAnswer: false }]);
  const [trueFalseAnswer, setTrueFalseAnswer] = useState(null);
  const [fillBlanksAnswers, setFillBlanksAnswers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  // Fetch question when component loads (if editing)
  useEffect(() => {
    if (isUpdateMode) {
      dispatch(getSingleQuestion(questionId));
    } else {
      resetFormValues();
    }
  }, [dispatch, isUpdateMode]);

  // Populate form when question data is fetched
  useEffect(() => {
    if (singleQuestion && isUpdateMode) {
      setIsLoading(true);

      // Set question type
      setQuestionType(singleQuestion.questionType);

      // Populate form values
      dispatch(
        setFormValues({
          question: singleQuestion.questionContent?.question || "",
          explanation: singleQuestion.answer?.explanation || "",
          difficulty: singleQuestion.difficulty || "",
          tags: singleQuestion.tags || [],
          forcedToAnswer: singleQuestion.forcedToAnswer,
          fullScore: singleQuestion.fullScore,
          // Handle score as object
          score: singleQuestion.score || { points: 1 },
        })
      );

      // Handle media from resources
      if (singleQuestion.resources?.type === "audio") {
        setAudioUrl(singleQuestion.resources.url);
      }
      if (singleQuestion.resources?.type === "video") {
        setVideoUrl(singleQuestion.resources.url);
      }

      // Handle True/False questions
      if (singleQuestion.questionType === QUESTION_TYPES.TRUE_FALSE) {
        if (singleQuestion.answer?.trueFalse !== undefined) {
          setTrueFalseAnswer(singleQuestion.answer.trueFalse);
        }
      }

      // Handle Fill in the Blanks questions
      if (singleQuestion.questionType === QUESTION_TYPES.FILL_IN_THE_BLANKS) {
        if (
          singleQuestion.answer?.fillBlanks &&
          Array.isArray(singleQuestion.answer.fillBlanks)
        ) {
          setFillBlanksAnswers([...singleQuestion.answer.fillBlanks]);
        }
      }

      // Handle options and answers for choice questions
      if (singleQuestion.questionContent && singleQuestion.answer) {
        const questionContent = singleQuestion.questionContent;
        const answer = singleQuestion.answer;

        // Extract options (all keys starting with "option")
        const optionKeys = Object.keys(questionContent)
          .filter((key) => key.startsWith("option"))
          .sort();

        if (optionKeys.length > 0) {
          const opts = optionKeys.map((key) => {
            let isCorrect = false;

            // Check if this option is marked as correct
            if (answer.singleChoice && answer.singleChoice[key]) {
              isCorrect = true;
            } else if (answer.multipleChoice && answer.multipleChoice[key]) {
              isCorrect = true;
            }

            return {
              text: questionContent[key] || "",
              isAnswer: isCorrect,
            };
          });

          setOptions(opts);
        }
      }

      setIsLoading(false);
    }
  }, [singleQuestion, isUpdateMode, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearAddQuestionsState());
      dispatch(clearUpdateQuestionsState());
      dispatch(clearSingleQuestionState());
    };
  }, [dispatch]);

  const addOption = () =>
    setOptions((prev) => [...prev, { text: "", isAnswer: false }]);

  const removeOption = (i) =>
    options.length > 1 &&
    setOptions((prev) => prev.filter((_, idx) => idx !== i));

  const handleOptionChange = (i, v) =>
    setOptions((prev) =>
      prev.map((opt, idx) => (idx === i ? { ...opt, text: v } : opt))
    );

  const handleAnswerSelection = (i) =>
    setOptions((prev) =>
      prev.map((opt, idx) => {
        if (questionType === QUESTION_TYPES.SINGLE_CHOICE)
          return { ...opt, isAnswer: idx === i };
        return idx === i ? { ...opt, isAnswer: !opt.isAnswer } : opt;
      })
    );

  const handleQuestionTypeChange = (t) => {
    setQuestionType(t);
    dispatch(setFormValues({ ...singleTest, questionType: t }));

    // Reset type-specific states
    setTrueFalseAnswer(null);
    setFillBlanksAnswers([]);

    if (
      (t === QUESTION_TYPES.SINGLE_CHOICE ||
        t === QUESTION_TYPES.MULTIPLE_CHOICE) &&
      !options.some((o) => o.text)
    ) {
      setOptions([{ text: "", isAnswer: false }]);
    }
  };

  const updateFormField = (f, v) =>
    dispatch(setFormValues({ ...singleTest, [f]: v }));

  // Handle score object updates
  const updateScoreField = (value) => {
    const newScore = { points: value };
    updateFormField("score", newScore);
  };

  const addFillBlank = () => {
    setFillBlanksAnswers((prev) => [...prev, ""]);
  };

  const removeFillBlank = (index) => {
    if (fillBlanksAnswers.length > 1) {
      setFillBlanksAnswers((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleFillBlankChange = (index, value) => {
    setFillBlanksAnswers((prev) =>
      prev.map((answer, i) => (i === index ? value : answer))
    );
  };

  const handleSubmit = async () => {
    if (!singleTest?.difficulty) {
      alert("Please select a difficulty level");
      return;
    }
    if (!singleTest?.question?.trim()) {
      alert("Please enter a question");
      return;
    }
    if (!singleTest?.explanation?.trim()) {
      alert("Please enter an answer explanation");
      return;
    }

    // Updated score validation for object structure
    const scorePoints = singleTest?.score?.points || 0;
    if (!scorePoints || scorePoints <= 0) {
      alert("Please enter a valid score (greater than 0)");
      return;
    }

    let answerStructure = {
      explanation: singleTest.explanation.trim(),
    };
    let questionContent = {
      question: singleTest.question.trim(),
    };

    // Handle True/False questions
    if (questionType === QUESTION_TYPES.TRUE_FALSE) {
      if (trueFalseAnswer === null) {
        alert("Please select True or False as the correct answer");
        return;
      }
      answerStructure.trueFalse = trueFalseAnswer;
    }

    // Handle Fill in the Blanks questions
    if (questionType === QUESTION_TYPES.FILL_IN_THE_BLANKS) {
      const validBlanks = fillBlanksAnswers.filter((answer) => answer.trim());
      if (validBlanks.length === 0) {
        alert("Please add at least one answer for the blanks");
        return;
      }
      answerStructure.fillBlanks = validBlanks.map((answer) => answer.trim());
    }

    // Handle Single Choice and Multiple Choice
    if (
      questionType === QUESTION_TYPES.SINGLE_CHOICE ||
      questionType === QUESTION_TYPES.MULTIPLE_CHOICE
    ) {
      const validOpts = options.filter((o) => o.text.trim());
      if (validOpts.length < 2) {
        alert("Please add at least 2 options");
        return;
      }
      if (!validOpts.some((o) => o.isAnswer)) {
        alert("Please select at least one correct answer");
        return;
      }

      // Add options to questionContent
      validOpts.forEach((o, i) => {
        questionContent[`option ${i + 1}`] = o.text.trim();
      });

      // Create answer structure
      const selectedAnswers = {};
      validOpts.forEach((o, i) => {
        if (o.isAnswer) {
          selectedAnswers[`option ${i + 1}`] = true;
        }
      });

      if (questionType === QUESTION_TYPES.SINGLE_CHOICE) {
        answerStructure.singleChoice = selectedAnswers;
      } else {
        answerStructure.multipleChoice = selectedAnswers;
      }
    }

    // Build resources object
    let resources = {};
    if (questionType === QUESTION_TYPES.AUDIO && audioUrl) {
      resources = { type: "audio", url: audioUrl };
    } else if (questionType === QUESTION_TYPES.VIDEO && videoUrl) {
      resources = { type: "video", url: videoUrl };
    }

    const questionData = {
      questionContent,
      answer: answerStructure,
      questionType: questionType,
      resources: resources,
      tags: singleTest?.tags || [],
      difficulty: singleTest.difficulty,
      scoreSettings: {
        scoreType: "fullScore",
        pointsForCorrectAns: scorePoints,
      },
      type: "skill",
    };

    try {
      if (isUpdateMode) {
        await dispatch(
          updateQuestions({ id: questionId, ...questionData })
        ).unwrap();

        alert("Question updated successfully!");
        resetFormValues();
        router.replace(`/company/myjobs/${params?.jobId}/createjob/questionManager`);
      } else {
        const created = await dispatch(addQuestions(questionData)).unwrap();

        if (created?.data?._id && AssessmentId) {
          const existing = Array.isArray(singleJobAssessment?.questionIds)
            ? singleJobAssessment.questionIds
            : [];

          // Use Set to remove duplicates
          const uniqueQuestionIds = [
            ...new Set([created.data._id, ...existing]),
          ];

          const payload = {
            questionIds: uniqueQuestionIds,
          };

          await dispatch(
            updateJobAssessment({ ...payload, aId: AssessmentId })
          ).unwrap();
        }

        alert("Question created successfully!");
        resetFormValues();
        router.replace(`/company/myjobs/${params?.jobId}/createjob/questionManager`);
      }
    } catch (e) {
      console.error("Error:", e);
      alert("Error saving question");
    }
  };

  const resetFormValues = () => {
    dispatch(setFormValues({}));
    setQuestionType(QUESTION_TYPES.TEXT);
    setOptions([{ text: "", isAnswer: false }]);
    setTrueFalseAnswer(null);
    setFillBlanksAnswers([]);
    setAudioUrl("");
    setVideoUrl("");
  };

  const handleCancel = () => {
    resetFormValues();
    router.replace(`/company/myjobs/${params?.jobId}/createjob/questionManager`);
  };

  const isChoiceType =
    questionType === QUESTION_TYPES.SINGLE_CHOICE ||
    questionType === QUESTION_TYPES.MULTIPLE_CHOICE;

  const currentState = isUpdateMode ? updateQuestionsState : addQuestionsState;

  if (isLoading || singleQuestionStatus === "pending") {
    return <div>Loading question data...</div>;
  }

  return (
    <>
      <div className={QuestionStyles.QuestionContainer}>
        <div className={QuestionStyles.QuestionHeader}>
          <div>{isUpdateMode ? "Update Question" : "Create New Question"}</div>
          <div style={{ display: "flex", gap: "12px" }}>
            <Button type="dashed" danger onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={currentState?.status === "pending"}
              disabled={currentState?.status === "pending"}
            >
              {isUpdateMode ? "Update Question" : "Save Question"}
            </Button>
          </div>
        </div>

        {currentState?.error && (
          <div
            style={{
              color: "red",
              marginBottom: 16,
              padding: 8,
              background: "#ffe6e6",
              borderRadius: 4,
            }}
          >
            Error: {currentState.error}
          </div>
        )}

        <div
          className={QuestionStyles.QuestionBody}
          style={{ paddingBottom: "5rem" }}
        >
          <div className={QuestionStyles.QuestionBodyFlexHead}>
            <div
              className={`${QuestionStyles.title} ${QuestionStyles.titleAlign}`}
            >
              Question Type*
            </div>
            <div className={`${QuestionStyles.typeContent}`}>
              {labelOptions.map((o) => (
                <Button
                  key={o.name}
                  onClick={() => handleQuestionTypeChange(o.name)}
                  type={questionType === o.name ? "primary" : "default"}
                >
                  <Image src={o.icon} alt={`${o.name} Icon`} />
                  <div>{o.name}</div>
                </Button>
              ))}
            </div>
          </div>

          {questionType === QUESTION_TYPES.AUDIO && (
            <div className={QuestionStyles.QuestionBodyFlex}>
              <div className={`${QuestionStyles.title}`}>Audio*</div>
              <div className={`${QuestionStyles.rightBody}`}>
                <AudioUpload
                  audioUrl={audioUrl}
                  setAudioUrl={(url) => {
                    setAudioUrl(url);
                  }}
                  restUrl={restUrl}
                />
              </div>
            </div>
          )}

          {questionType === QUESTION_TYPES.VIDEO && (
            <div className={QuestionStyles.QuestionBodyFlex}>
              <div className={`${QuestionStyles.title}`}>Video*</div>
              <div className={`${QuestionStyles.rightBody}`}>
                <VideoUpload
                  videoUrl={videoUrl}
                  setVideoUrl={(url) => {
                    setVideoUrl(url);
                  }}
                  restUrl={restUrl}
                />
              </div>
            </div>
          )}

          <div className={QuestionStyles.QuestionBodyFlex}>
            <div className={`${QuestionStyles.title}`}>Difficulty*</div>
            <div className={`${QuestionStyles.rightBody}`}>
              <Select
                placeholder="Select Difficulty"
                allowClear
                style={{ width: "40%" }}
                onChange={(v) => updateFormField("difficulty", v)}
                value={singleTest?.difficulty}
                options={DIFFICULTY_LEVELS}
              />
            </div>
          </div>

          {/* Updated Score Input to handle object structure */}
          <div className={QuestionStyles.QuestionBodyFlex}>
            <div className={`${QuestionStyles.title}`}>Score*</div>
            <div className={`${QuestionStyles.rightBody}`}>
              <InputNumber
                min={1}
                max={100}
                placeholder="Enter score"
                style={{ width: "40%" }}
                value={singleTest?.score?.points || 1}
                onChange={(v) => updateScoreField(v)}
              />
            </div>
          </div>

          {/* Skills (tags) */}
          <div className={QuestionStyles.QuestionBodyFlex}>
            <div className={`${QuestionStyles.title}`}>Skills</div>
            <div className={`${QuestionStyles.rightBody}`}>
              <Select
                mode="tags"
                placeholder="Add skills and press Enter"
                value={singleTest?.tags || []}
                onChange={(vals) => updateFormField("tags", vals)}
                tokenSeparators={[","]}
                allowClear
                maxTagCount="responsive"
                style={{ width: "40%" }}
                maxCount={5}
              />
            </div>
          </div>

          <div className={QuestionStyles.QuestionBodyFlex}>
            <div className={`${QuestionStyles.title}`}>Question*</div>
            <div className={`${QuestionStyles.rightBody}`}>
              <TextEditor
                name="question"
                editorFun={(v) => updateFormField("question", v)}
                initialContent={{ question: singleTest?.question }}
              />
              {questionType === QUESTION_TYPES.FILL_IN_THE_BLANKS && (
                <div
                  style={{ marginTop: "8px", fontSize: "12px", color: "#666" }}
                >
                  <strong>Tip:</strong> Use underscores (___) to represent
                  blanks in your question text.
                </div>
              )}
            </div>
          </div>

          {/* True/False Options */}
          {questionType === QUESTION_TYPES.TRUE_FALSE && (
            <div className={QuestionStyles.QuestionBodyFlex}>
              <div className={`${QuestionStyles.title}`}>Correct Answer*</div>
              <div className={`${QuestionStyles.rightBody}`}>
                <div style={{ display: "flex", gap: "16px" }}>
                  <Button
                    type={trueFalseAnswer === true ? "primary" : "default"}
                    onClick={() => setTrueFalseAnswer(true)}
                  >
                    True
                  </Button>
                  <Button
                    type={trueFalseAnswer === false ? "primary" : "default"}
                    onClick={() => setTrueFalseAnswer(false)}
                  >
                    False
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Fill in the Blanks Answers */}
          {questionType === QUESTION_TYPES.FILL_IN_THE_BLANKS && (
            <div>
              <div className={QuestionStyles.QuestionBodyFlex}>
                <div className={`${QuestionStyles.title}`}>
                  Correct Answers*
                </div>
                <div className={`${QuestionStyles.rightBody}`}>
                  <div
                    style={{
                      marginBottom: "8px",
                      fontSize: "12px",
                      color: "#666",
                    }}
                  >
                    Enter the correct answers for each blank in order of
                    appearance.
                  </div>
                </div>
              </div>

              {fillBlanksAnswers.map((answer, i) => (
                <div key={i} className={QuestionStyles.QuestionBodyFlex}>
                  <div className={`${QuestionStyles.title}`}>
                    <span className={QuestionStyles.OptionText}>
                      Blank {i + 1}
                    </span>
                  </div>
                  <div className={`${QuestionStyles.rightBody1}`}>
                    <TextEditor
                      name={`blank ${i + 1}`}
                      editorFun={(v) => handleFillBlankChange(i, v)}
                      placeholder={`Answer for blank ${i + 1}`}
                      initialContent={{ [`blank ${i + 1}`]: answer }}
                    />
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <Button
                      type="text"
                      onClick={() => removeFillBlank(i)}
                      disabled={fillBlanksAnswers.length === 1}
                      danger
                    >
                      <RiDeleteBinLine style={{ color: "red" }} />
                    </Button>
                  </div>
                </div>
              ))}

              <div className={QuestionStyles.QuestionBodyFlex}>
                <div className={`${QuestionStyles.title}`} />
                <div className={`${QuestionStyles.rightBody}`}>
                  <button
                    className={QuestionStyles.addBtn}
                    type="button"
                    onClick={addFillBlank}
                  >
                    Add Answer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Multiple Choice and Single Choice Options */}
          {isChoiceType && (
            <div>
              {options.map((opt, i) => (
                <div key={i} className={QuestionStyles.QuestionBodyFlex}>
                  <div className={`${QuestionStyles.title}`}>
                    <input
                      type={
                        questionType === QUESTION_TYPES.SINGLE_CHOICE
                          ? "radio"
                          : "checkbox"
                      }
                      checked={opt.isAnswer}
                      onChange={() => handleAnswerSelection(i)}
                      name={
                        questionType === QUESTION_TYPES.SINGLE_CHOICE
                          ? "correctAnswer"
                          : undefined
                      }
                    />
                    <span className={QuestionStyles.OptionText}>{`Option ${
                      i + 1
                    }`}</span>
                  </div>
                  <div className={`${QuestionStyles.rightBody1}`}>
                    <TextEditor
                      name={`option ${i + 1}`}
                      editorFun={(v) => handleOptionChange(i, v)}
                      className={QuestionStyles.correctAns}
                      placeholder={`Enter option ${i + 1}`}
                      initialContent={{ [`option ${i + 1}`]: opt.text }}
                    />
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <Button
                      type="text"
                      onClick={() => removeOption(i)}
                      disabled={options.length === 1}
                      danger
                    >
                      <RiDeleteBinLine style={{ color: "red" }} />
                    </Button>
                  </div>
                </div>
              ))}
              <div className={QuestionStyles.QuestionBodyFlex}>
                <div className={`${QuestionStyles.title}`} />
                <div className={`${QuestionStyles.rightBody}`}>
                  <button
                    className={QuestionStyles.addBtn}
                    type="button"
                    onClick={addOption}
                  >
                    Add Option
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className={QuestionStyles.QuestionBodyFlex}>
            <div className={`${QuestionStyles.title}`}>Answer Explanation*</div>
            <div className={`${QuestionStyles.rightBody}`}>
              <TextEditor
                name="explanation"
                editorFun={(v) => updateFormField("explanation", v)}
                initialContent={{ explanation: singleTest?.explanation }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuestionEditor;
