"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Select, message, Tooltip } from "antd";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { usePermissions, PERMISSION_VALUES } from "@/hooks/usepermission";
import { setFormValues } from "@/redux/slices/admin/cms/stepform";
import TextEditor from "@/modules/admin/utils/editor";
import AudioUpload from "../../../../utils/audio";
import VideoUpload from "../../../../utils/video";
import QuestionStyles from "./styles.module.scss";
import { RiDeleteBinLine } from "react-icons/ri";
import {
  addQuestions,
  clearAddQuestionsState,
  getSingleQuestion,
  updateQuestions,
  clearUpdateQuestionsState,
  clearSingleQuestionState,
  getOneSKill,
} from "@/redux/slices/admin/cms/skillsSlice";
import { restUrl } from "@/config/urls";
import {
  FileTextOutlined, // For TEXT
  CheckCircleOutlined, // For SINGLE_CHOICE
  CheckSquareOutlined, // For MULTIPLE_CHOICE
  AudioOutlined, // For AUDIO
  VideoCameraOutlined, // For VIDEO
} from "@ant-design/icons";

const QUESTION_TYPES = {
  TEXT: "Text",
  SINGLE_CHOICE: "Single Choice",
  MULTIPLE_CHOICE: "Multiple Choice",
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
  { name: QUESTION_TYPES.TEXT, icon: <FileTextOutlined /> },
  { name: QUESTION_TYPES.SINGLE_CHOICE, icon: <CheckCircleOutlined /> },
  { name: QUESTION_TYPES.MULTIPLE_CHOICE, icon: <CheckSquareOutlined /> },
  { name: QUESTION_TYPES.AUDIO, icon: <AudioOutlined /> },
  { name: QUESTION_TYPES.VIDEO, icon: <VideoCameraOutlined /> },
];

const QuestionEditor = () => {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { canAccess, getPermissionMessage } = usePermissions();

  const singleTest = useSelector((state) => state.steps.value);
  const addQuestionsState = useSelector((state) => state.skill.addQuestions);
  const updateQuestionsState = useSelector(
    (state) => state.skill.updateQuestions
  );
  const singleQuestion = useSelector(
    (state) => state.skill.singleQuestion.value?.data
  );
  const singleQuestionStatus = useSelector(
    (state) => state.skill.singleQuestion.status
  );
  const Skill = useSelector((state) => state.skill.skill?.value?.data);

  const [questionType, setQuestionType] = useState(QUESTION_TYPES.TEXT);
  const [options, setOptions] = useState([{ text: "", isAnswer: false }]);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const isUpdateMode = params?.question && params.question !== "newQuestion";

  // Fetch question when component loads (if editing)
  useEffect(() => {
    if (isUpdateMode) {
      dispatch(getSingleQuestion(params.question));
    } else {
      resetFormValues();
    }
  }, [params?.question, dispatch, isUpdateMode]);

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
        })
      );

      // Handle media from resources
      if (singleQuestion.resources?.type === "audio") {
        setAudioUrl(singleQuestion.resources.url);
      }
      if (singleQuestion.resources?.type === "video") {
        setVideoUrl(singleQuestion.resources.url);
      }

      // Handle options and answers for choice questions
      if (singleQuestion.questionContent && singleQuestion.answer) {
        const questionContent = singleQuestion.questionContent;
        const answer = singleQuestion.answer;

        // Extract options (all keys starting with "option")
        const optionKeys = Object.keys(questionContent)
          .filter((key) => key.startsWith("option"))
          .sort(); // Sort to maintain order

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

  const isNewSkill = params?.testId === "newSkill";
  useEffect(() => {
    if (!isNewSkill && params?.testId) {
      dispatch(getOneSKill({ skillId: params?.testId }));
    }
  }, [isNewSkill]);

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

  const handleSubmit = async () => {
    // Permission guard
    if (isUpdateMode) {
      if (!canAccess(PERMISSION_VALUES.EDIT)) {
        message.info(getPermissionMessage(PERMISSION_VALUES.EDIT));
        return;
      }
    } else {
      if (!canAccess(PERMISSION_VALUES.CREATE)) {
        message.info(getPermissionMessage(PERMISSION_VALUES.CREATE));
        return;
      }
    }
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

    let answerStructure = {
      explanation: singleTest.explanation.trim(),
    };
    let questionContent = {
      question: singleTest.question.trim(),
    };

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
      ...(singleTest?.forcedToAnswer && {
        forcedToAnswer: singleTest.forcedToAnswer,
      }),
      ...(singleTest?.fullScore && { fullScore: +singleTest.fullScore }),
      type: "skill",
      refId: params?.testId,
      tags: [Skill?.title],
    };

    try {
      if (isUpdateMode) {
        // Update existing question
        const res = await dispatch(
          updateQuestions({
            id: params.question,
            ...questionData,
          })
        );
        if (updateQuestions.fulfilled.match(res)) {
          alert("Question updated successfully!");
          resetFormValues();
          router.push(
            `/admin/questionManager/${params?.testId}/questionManager/questionsList`
          );
        } else {
          alert(res.payload || "Failed to update question");
        }
      } else {
        // Create new question
        const res = await dispatch(addQuestions(questionData));
        if (addQuestions.fulfilled.match(res)) {
          alert("Question created successfully!");
          resetFormValues();
          router.push(
            `/admin/questionManager/${params?.testId}/questionManager/questionsList`
          );
        } else {
          alert(res.payload || "Failed to create question");
        }
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
    setAudioUrl("");
    setVideoUrl("");
  };

  const handleCancel = () => {
    resetFormValues();
    router.push(
      `/admin/questionManager/${params?.testId}/questionManager/questionsList`
    );
  };

  const isChoiceType =
    questionType === QUESTION_TYPES.SINGLE_CHOICE ||
    questionType === QUESTION_TYPES.MULTIPLE_CHOICE;

  const currentState = isUpdateMode ? updateQuestionsState : addQuestionsState;

  if (isLoading || singleQuestionStatus === "pending") {
    return <div>Loading question data...</div>;
  }

  return (
    <div className={QuestionStyles.QuestionContainer}>
      <div className={QuestionStyles.QuestionHeader}>
        <div>{isUpdateMode ? "Update Question" : "Create New Question"}</div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Button type="dashed" onClick={handleCancel}>
            Cancel
          </Button>
          <Tooltip
            title={
              !isUpdateMode
                ? !canAccess(PERMISSION_VALUES.CREATE)
                  ? getPermissionMessage(PERMISSION_VALUES.CREATE)
                  : ""
                : !canAccess(PERMISSION_VALUES.EDIT)
                ? getPermissionMessage(PERMISSION_VALUES.EDIT)
                : ""
            }
          >
            <span>
              <Button
                type="primary"
                onClick={handleSubmit}
                loading={currentState?.status === "pending"}
                disabled={
                  currentState?.status === "pending" ||
                  (isUpdateMode
                    ? !canAccess(PERMISSION_VALUES.EDIT)
                    : !canAccess(PERMISSION_VALUES.CREATE))
                }
              >
                {isUpdateMode ? "Update Question" : "Save Question"}
              </Button>
            </span>
          </Tooltip>
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
                icon={o.icon}
              >
                {/* <Image src={o.icon} alt={`${o.name} Icon`} /> */}
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
                restUrl={process.env.NEXT_PUBLIC_API_URL}
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

        <div className={QuestionStyles.QuestionBodyFlex}>
          <div className={`${QuestionStyles.title}`}>Question*</div>
          <div className={`${QuestionStyles.rightBody}`}>
            <TextEditor
              name="question"
              editorFun={(v) => updateFormField("question", v)}
              initialContent={{ question: singleTest?.question }}
            />
          </div>
        </div>

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
  );
};

export default QuestionEditor;
