// QuestionEditorUI.jsx
"use client";
import React, { useEffect, useState } from "react";
import { Button, InputNumber, message } from "antd";
import Image from "next/image";
import { RiDeleteBinLine } from "react-icons/ri";
import QuestionStyles from "./styles.module.scss";
import { v4 as uuidv4 } from "uuid";
// External UI building blocks from the original setup
import TextEditor from "@/modules/admin/utils/editor";
import AudioUpload from "../utils/audio";
import VideoUpload from "../utils/video";
import { restUrl } from "@/config/urls";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { getOneTopic, updateTopic } from "@/redux/slices/admin/cms/internship";
import {
  MdTextFields, // Text icon
  MdRadioButtonChecked, // Single choice icon
  MdCheckBox, // Multiple choice icon
  MdAudiotrack, // Audio icon
  MdVideoLibrary, // Video icon
} from "react-icons/md";

const QUESTION_TYPES = {
  TEXT: "Text",
  SINGLE_CHOICE: "Single Choice",
  MULTIPLE_CHOICE: "Multiple Choice",
  TRUE_FALSE: "True/False",
  // FILL_IN_THE_BLANKS: "Fill in the Blanks",
  AUDIO: "Audio",
  VIDEO: "Video",
};

const labelOptions = [
  { name: QUESTION_TYPES.TEXT, icon: MdTextFields },
  { name: QUESTION_TYPES.SINGLE_CHOICE, icon: MdRadioButtonChecked },
  { name: QUESTION_TYPES.MULTIPLE_CHOICE, icon: MdCheckBox },
  { name: QUESTION_TYPES.TRUE_FALSE, icon: MdRadioButtonChecked },
  { name: QUESTION_TYPES.AUDIO, icon: MdAudiotrack },
  { name: QUESTION_TYPES.VIDEO, icon: MdVideoLibrary },
];

const QuestionEditorUI = () => {
  const router = useRouter();
  const currentPath = usePathname();
  const dispatch = useDispatch();
  const params = useParams();
  const singleTopic = useSelector((s) => s.adminInternship.singleTopic);

  // Route helpers
  const questionId = params?.question;
  const isNewQuestion = questionId === "new-question";
  const internshipId = params?.createInternship;
  const sectionId = params?.section;
  const topicId = params?.topics;

  // Static initial state (later hydrate from Redux)
  const [questionType, setQuestionType] = useState(QUESTION_TYPES.TEXT);
  const [question, setQuestion] = useState("");
  const [explanation, setExplanation] = useState("");
  const [scorePoints, setScorePoints] = useState(1);

  const [audioUrl, setAudioUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const [options, setOptions] = useState([{ text: "", isAnswer: false }]);
  const [trueFalseAnswer, setTrueFalseAnswer] = useState(null);
  const [fillBlanksAnswers, setFillBlanksAnswers] = useState([]);

  // Local cancel handler
  const onCancel = () => {
    const newPath = currentPath?.split("/").slice(0, -1).join("/");
    router.replace(newPath || "/");
  };

  useEffect(() => {
    dispatch(getOneTopic({ id: params?.topics }));
  }, []);

  const handleQuestionTypeChange = (t) => {
    setQuestionType(t);
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

  const addOption = () =>
    setOptions((prev) => [...prev, { text: "", isAnswer: false }]);

  const removeOption = (i) =>
    setOptions((prev) =>
      prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev
    );

  const handleOptionChange = (i, v) =>
    setOptions((prev) =>
      prev.map((opt, idx) => (idx === i ? { ...opt, text: v } : opt))
    );

  const handleAnswerSelection = (i) =>
    setOptions((prev) =>
      prev.map((opt, idx) => {
        if (questionType === QUESTION_TYPES.SINGLE_CHOICE) {
          return { ...opt, isAnswer: idx === i };
        }
        return idx === i ? { ...opt, isAnswer: !opt.isAnswer } : opt;
      })
    );

  const addFillBlank = () => setFillBlanksAnswers((prev) => [...prev, ""]);
  const removeFillBlank = (index) => {
    setFillBlanksAnswers((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : prev
    );
  };
  const handleFillBlankChange = (index, value) => {
    setFillBlanksAnswers((prev) =>
      prev.map((a, i) => (i === index ? value : a))
    );
  };

  const resetForm = () => {
    setQuestionType(QUESTION_TYPES.TEXT);
    setQuestion("");
    setExplanation("");
    setScorePoints(1);
    setAudioUrl("");
    setVideoUrl("");
    setOptions([{ text: "", isAnswer: false }]);
    setTrueFalseAnswer(null);
    setFillBlanksAnswers([]);
  };

  const validate = () => {
    if (!String(question || "").trim()) {
      alert("Please enter a question");
      return false;
    }
    if (!String(explanation || "").trim()) {
      alert("Please enter an answer explanation");
      return false;
    }
    if (!scorePoints || scorePoints <= 0) {
      alert("Please enter a valid score (greater than 0)");
      return false;
    }
    if (
      questionType === QUESTION_TYPES.SINGLE_CHOICE ||
      questionType === QUESTION_TYPES.MULTIPLE_CHOICE
    ) {
      const validOpts = options.filter((o) => o.text.trim());
      if (validOpts.length < 2) {
        alert("Please add at least 2 options");
        return false;
      }
      if (!validOpts.some((o) => o.isAnswer)) {
        alert("Please select at least one correct answer");
        return false;
      }
    }
    if (
      questionType === QUESTION_TYPES.TRUE_FALSE &&
      trueFalseAnswer === null
    ) {
      alert("Please select True or False as the correct answer");
      return false;
    }
    if (questionType === QUESTION_TYPES.FILL_IN_THE_BLANKS) {
      const valid = fillBlanksAnswers.filter((a) => a.trim());
      if (valid.length === 0) {
        alert("Please add at least one answer for the blanks");
        return false;
      }
    }
    return true;
  };

  // HYDRATE for Update mode
  useEffect(() => {
    if (!singleTopic || isNewQuestion) return;
    const existing =
      singleTopic?.quiz?.find(
        (q) => q?._id === questionId || q?.id === questionId
      ) || null;
    if (!existing) return;

    const qType = existing?.questionType || QUESTION_TYPES.TEXT;
    setQuestionType(qType);
    setQuestion(existing?.questionContent?.question || "");
    setExplanation(existing?.answer?.explanation || "");
    setScorePoints(Number(existing?.scoreSettings?.pointsForCorrectAns || 1));

    // Resources
    const res = existing?.resources || {};
    setAudioUrl(res?.type === "audio" ? res?.url || "" : "");
    setVideoUrl(res?.type === "video" ? res?.url || "" : "");

    // Choice Options
    if (
      qType === QUESTION_TYPES.SINGLE_CHOICE ||
      qType === QUESTION_TYPES.MULTIPLE_CHOICE
    ) {
      const entries = Object.entries(existing?.questionContent || {}).filter(
        ([k]) => k.startsWith("option ")
      );
      entries.sort(
        (a, b) =>
          parseInt(a[0].split(" ")[1], 10) - parseInt(b[0].split(" ")[1], 10)
      );
      const selectionMap =
        existing?.answer?.singleChoice ||
        existing?.answer?.multipleChoice ||
        {};
      const hydrated = entries.map(([k, v]) => ({
        text: String(v || ""),
        isAnswer: !!selectionMap[k],
      }));
      setOptions(hydrated.length ? hydrated : [{ text: "", isAnswer: false }]);
    } else {
      setOptions([{ text: "", isAnswer: false }]);
    }

    // True / False
    setTrueFalseAnswer(
      qType === QUESTION_TYPES.TRUE_FALSE ? !!existing?.answer?.trueFalse : null
    );

    // Fill in the blanks
    setFillBlanksAnswers(
      Array.isArray(existing?.answer?.fillBlanks)
        ? existing.answer.fillBlanks
        : []
    );
  }, [singleTopic, isNewQuestion, questionId]);

  // Local submit handler
  const handleSubmit = async () => {
    if (!validate()) return;

    const questionContent = {
      question: String(question || "").trim(),
    };
    const answer = {
      explanation: String(explanation || "").trim(),
    };

    // Choice types
    if (
      questionType === QUESTION_TYPES.SINGLE_CHOICE ||
      questionType === QUESTION_TYPES.MULTIPLE_CHOICE
    ) {
      const validOpts = options.filter((o) => o.text.trim());
      validOpts.forEach((o, i) => {
        questionContent[`option ${i + 1}`] = o.text.trim();
      });
      const selected = {};
      validOpts.forEach((o, i) => {
        if (o.isAnswer) selected[`option ${i + 1}`] = true;
      });
      if (questionType === QUESTION_TYPES.SINGLE_CHOICE) {
        answer.singleChoice = selected;
      } else {
        answer.multipleChoice = selected;
      }
    }

    // True/False
    if (questionType === QUESTION_TYPES.TRUE_FALSE) {
      answer.trueFalse = !!trueFalseAnswer;
    }

    // Fill in the blanks
    if (questionType === QUESTION_TYPES.FILL_IN_THE_BLANKS) {
      answer.fillBlanks = fillBlanksAnswers
        .filter((a) => a.trim())
        .map((a) => a.trim());
    }

    let resources = {};
    if (questionType === QUESTION_TYPES.AUDIO && audioUrl) {
      resources = { type: "audio", url: audioUrl };
    } else if (questionType === QUESTION_TYPES.VIDEO && videoUrl) {
      resources = { type: "video", url: videoUrl };
    }

    const questionData = {
      questionContent,
      answer,
      questionType,
      resources,
      scoreSettings: {
        scoreType: "fullScore",
        pointsForCorrectAns: scorePoints,
      },
    };

    console.log("Question payload:", questionData);

    // Prepare updated quiz array
    const currentQuiz = Array.isArray(singleTopic?.quiz)
      ? [...singleTopic.quiz]
      : [];

    if (isNewQuestion) {
      const questionWithId = { id: uuidv4(), ...questionData };
      currentQuiz.push(questionWithId);
    } else {
      const idx = currentQuiz.findIndex(
        (q) => q?._id === questionId || q?.id === questionId
      );
      if (idx === -1) {
        alert("Question not found to update");
        return;
      }
      const existing = currentQuiz[idx];
      const nextData = { ...questionData };
      // Preserve identifiers if present
      if (existing?._id) nextData._id = existing._id;
      if (existing?.id) nextData.id = existing.id;
      currentQuiz[idx] = nextData;
    }

    // Dispatch updateTopic with quiz
    const hide = message.loading(
      isNewQuestion ? "Creating question..." : "Updating question...",
      0
    );
    try {
      await dispatch(
        updateTopic({
          id: internshipId,
          sid: sectionId,
          tid: topicId,
          data: { quiz: currentQuiz },
        })
      ).unwrap();
      hide();
      message.success(
        isNewQuestion
          ? "Question created successfully"
          : "Question updated successfully"
      );
      const newPath = currentPath?.split("/").slice(0, -1).join("/");
      router.replace(newPath || "/");
    } catch (err) {
      hide();
      console.error(err);
      message.error("Failed to save question");
    }
  };

  const isChoiceType =
    questionType === QUESTION_TYPES.SINGLE_CHOICE ||
    questionType === QUESTION_TYPES.MULTIPLE_CHOICE;

  return (
    <div className={QuestionStyles.QuestionContainer}>
      <div className={QuestionStyles.QuestionHeader}>
        <div>{!isNewQuestion ? "Update Question" : "Create New Question"}</div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Button type="dashed" danger onClick={onCancel}>
            Cancel
          </Button>
          <Button type="primary" onClick={handleSubmit}>
            {!isNewQuestion ? "Update Question" : "Save Question"}
          </Button>
        </div>
      </div>

      <div
        className={QuestionStyles.QuestionBody}
        style={{ paddingBottom: "5rem" }}
      >
        {/* Type */}
        <div className={QuestionStyles.QuestionBodyFlexHead}>
          <div
            className={`${QuestionStyles.title} ${QuestionStyles.titleAlign}`}
          >
            Question Type*
          </div>
          <div className={`${QuestionStyles.typeContent}`}>
            {labelOptions.map((o) => {
              const IconComponent = o.icon;
              return (
                <Button
                  key={o.name}
                  onClick={() => handleQuestionTypeChange(o.name)}
                  type={questionType === o.name ? "primary" : "default"}
                  icon={<IconComponent />}
                >
                  <div>{o.name}</div>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Audio */}
        {questionType === QUESTION_TYPES.AUDIO && (
          <div className={QuestionStyles.QuestionBodyFlex}>
            <div className={`${QuestionStyles.title}`}>Audio*</div>
            <div className={`${QuestionStyles.rightBody}`}>
              <AudioUpload
                audioUrl={audioUrl}
                setAudioUrl={(url) => setAudioUrl(url)}
                restUrl={restUrl}
              />
            </div>
          </div>
        )}

        {/* Video */}
        {questionType === QUESTION_TYPES.VIDEO && (
          <div className={QuestionStyles.QuestionBodyFlex}>
            <div className={`${QuestionStyles.title}`}>Video*</div>
            <div className={`${QuestionStyles.rightBody}`}>
              <VideoUpload
                videoUrl={videoUrl}
                setVideoUrl={(url) => setVideoUrl(url)}
                restUrl={restUrl}
              />
            </div>
          </div>
        )}

        {/* Score */}
        <div className={QuestionStyles.QuestionBodyFlex}>
          <div className={`${QuestionStyles.title}`}>Score*</div>
          <div className={`${QuestionStyles.rightBody}`}>
            <InputNumber
              min={1}
              max={100}
              placeholder="Points for Correct (>0)"
              style={{ width: "40%" }}
              value={scorePoints}
              onChange={(v) => setScorePoints(Number(v || 1))}
            />
          </div>
        </div>

        {/* Question */}
        <div className={QuestionStyles.QuestionBodyFlex}>
          <div className={`${QuestionStyles.title}`}>Question*</div>
          <div className={`${QuestionStyles.rightBody}`}>
            <TextEditor
              name="question"
              editorFun={(v) => setQuestion(v)}
              initialContent={{ question }}
            />
            {questionType === QUESTION_TYPES.FILL_IN_THE_BLANKS && (
              <div
                style={{ marginTop: "8px", fontSize: "12px", color: "#666" }}
              >
                <strong>Tip:</strong> Use underscores (___) to represent blanks
                in the question text.
              </div>
            )}
          </div>
        </div>

        {/* True / False */}
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

        {/* Fill in the Blanks */}
        {questionType === QUESTION_TYPES.FILL_IN_THE_BLANKS && (
          <div>
            <div className={QuestionStyles.QuestionBodyFlex}>
              <div className={`${QuestionStyles.title}`}>Correct Answers*</div>
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

        {/* Single/Multiple Choice */}
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
                    checked={!!opt.isAnswer}
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

        {/* Answer Explanation */}
        <div className={QuestionStyles.QuestionBodyFlex}>
          <div className={`${QuestionStyles.title}`}>Answer Explanation*</div>
          <div className={`${QuestionStyles.rightBody}`}>
            <TextEditor
              name="explanation"
              editorFun={(v) => setExplanation(v)}
              initialContent={{ explanation }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionEditorUI;
