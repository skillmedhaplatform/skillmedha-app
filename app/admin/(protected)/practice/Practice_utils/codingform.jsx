"use client";
import React, { useState, useEffect } from "react";
import { Button, Input, Select, InputNumber, Row, Col, message } from "antd";
import { useParams, useRouter, usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import TextEditor from "@/modules/admin/utils/editor";
import QuestionStyles from "./questionstyles.module.scss";
import styles from "../coding/[subject_slug]/page.module.scss";
import PracticeBreadcrumbs from "./practiceBreadcrumbs";
import { RiDeleteBinLine } from "react-icons/ri";
import { createQuestion, updateQuestion } from "@/redux/slices/admin/cms/practiceSlice";

export default function CodingQuestionEditorUI() {
  const router = useRouter();
  const currentPath = usePathname();
  const dispatch = useDispatch();
  const params = useParams();

  const questionId = params?.question;
  const isNewQuestion = questionId === "new-question";
  const { subject_slug } = params;

  const questions = useSelector((state) => state.adminPractice.questions);

  const [saving, setSaving] = useState(false);
  
  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [explanation, setExplanation] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [concept, setConcept] = useState("");
  const [companyTags, setCompanyTags] = useState([]);
  const [testCases, setTestCases] = useState([
    { _id: Date.now(), input: "", expectedOutput: "", explanation: "" },
  ]);

  useEffect(() => {
    if (!isNewQuestion && questionId) {
      const existing = questions.find((q) => q._id === questionId);
      if (existing) {
        setQuestion(existing.questionContent?.question || "");
        setDescription(existing.questionContent?.description || "");
        setExplanation(existing.answer?.explanation || "");
        setDifficulty(existing.difficulty || "Easy");
        setConcept(existing.concept || "");
        setCompanyTags(Array.isArray(existing.companyTags) ? existing.companyTags : []);
        setTestCases(
          existing.questionContent?.testCases?.length 
            ? existing.questionContent.testCases 
            : [{ _id: Date.now(), input: "", expectedOutput: "", explanation: "" }]
        );
      }
    }
  }, [questions, isNewQuestion, questionId]);

  const onCancel = () => {
    const newPath = currentPath?.split("/").slice(0, -1).join("/");
    router.replace(newPath || "/");
  };

  const addTestCase = () => {
    setTestCases([
      ...testCases,
      { _id: Date.now(), input: "", expectedOutput: "", explanation: "" },
    ]);
  };

  const removeTestCase = (id) => {
    setTestCases(testCases.filter((tc) => tc._id !== id));
  };

  const sendTestCaseEditorVals = (val, id, type) => {
    setTestCases((prev) =>
      prev.map((tc) => (tc._id === id ? { ...tc, [type]: val } : tc))
    );
  };

  const validate = () => {
    if (!String(question || "").trim())
      return { ok: false, msg: "Please enter a question" };
    if (!String(explanation || "").trim())
      return { ok: false, msg: "Please enter an answer explanation" };
    if (!difficulty)
      return { ok: false, msg: "Please select a difficulty level" };
    if (!testCases.length)
      return { ok: false, msg: "Please add at least one test case" };

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      if (!String(tc.input || "").trim())
        return { ok: false, msg: `Please enter input for test case ${i + 1}` };
      if (!String(tc.expectedOutput || "").trim())
        return {
          ok: false,
          msg: `Please enter expected output for test case ${i + 1}`,
        };
    }
    return { ok: true };
  };

  const onSave = async () => {
    const validation = validate();
    if (!validation.ok) {
      message.error(validation.msg);
      return;
    }
    setSaving(true);

    const questionData = {
      type: "practice",
      questionType: "Coding Question",
      subjectId: subject_slug,
      difficulty,
      concept,
      companyTags: companyTags.filter(t => t.companyName?.trim()),
      questionContent: {
        question: String(question || "").trim(),
        description: String(description || "").trim(),
        testCases,
      },
      answer: {
        explanation: String(explanation || "").trim(),
      },
    };

    try {
      if (isNewQuestion) {
        await dispatch(createQuestion(questionData)).unwrap();
        message.success("Question saved successfully!");
      } else {
        const { subjectId, ...updatedPayload } = questionData;
        await dispatch(
          updateQuestion({ questionId: questionId, data: updatedPayload })
        ).unwrap();
        message.success("Question updated successfully!");
      }
      onCancel();
    } catch (err) {
      message.error(err?.message || "Failed to save question");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={QuestionStyles.QuestionContainer}>
      <div style={{ marginBottom: '16px' }}>
        <PracticeBreadcrumbs />
      </div>
      <div className={QuestionStyles.QuestionHeader}>
        <div>{isNewQuestion ? "Create Coding Question" : "Edit Coding Question"}</div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Button type="dashed" danger onClick={onCancel}>
            Cancel
          </Button>
          <Button type="primary" loading={saving} onClick={onSave}>
            {isNewQuestion ? "Save Question" : "Update Question"}
          </Button>
        </div>
      </div>

      <div className={QuestionStyles.QuestionBody}>
        <div className={QuestionStyles.sectionTitle}>Question Specifications</div>
        
        {/* Difficulty */}
        <div className={QuestionStyles.QuestionBodyFlex}>
          <div className={QuestionStyles.title}>Difficulty*</div>
          <div className={QuestionStyles.rightBody}>
            <Select
              style={{ width: 120 }}
              value={difficulty}
              onChange={setDifficulty}
              options={[
                { value: "Easy", label: "Easy" },
                { value: "Medium", label: "Medium" },
                { value: "Hard", label: "Hard" },
                { value: "Expert", label: "Expert" },
              ]}
            />
          </div>
        </div>

        {/* Concept */}
        <div className={QuestionStyles.QuestionBodyFlex}>
          <div className={`${QuestionStyles.title}`}>Concept</div>
          <div className={`${QuestionStyles.rightBody}`}>
            <Input
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="e.g. loops, arrays, strings"
              style={{ width: '100%', maxWidth: 400 }}
            />
          </div>
        </div>

        {/* Company Tags */}
        <div className={QuestionStyles.QuestionBodyFlex}>
          <div className={`${QuestionStyles.title}`}>Company Tags</div>
          <div className={`${QuestionStyles.rightBody}`}>
            {companyTags.map((tag, idx) => (
              <div key={idx} style={{ marginBottom: 12, padding: 12, border: '1px solid #d9d9d9', borderRadius: 6, background: '#fafafa' }}>
                <Row gutter={[12, 12]}>
                  <Col span={11}>
                    <Input 
                      placeholder="Company Name (e.g. TCS)" 
                      value={tag.companyName}
                      onChange={(e) => {
                        const newTags = [...companyTags];
                        newTags[idx].companyName = e.target.value;
                        setCompanyTags(newTags);
                      }}
                    />
                  </Col>
                  <Col span={11}>
                    <Input 
                      placeholder="Exam Name (e.g. NQT)" 
                      value={tag.examName}
                      onChange={(e) => {
                        const newTags = [...companyTags];
                        newTags[idx].examName = e.target.value;
                        setCompanyTags(newTags);
                      }}
                    />
                  </Col>
                  <Col span={2}>
                    <Button 
                      danger 
                      icon={<RiDeleteBinLine />} 
                      onClick={() => {
                        setCompanyTags(prev => prev.filter((_, i) => i !== idx));
                      }} 
                    />
                  </Col>
                  <Col span={11}>
                    <InputNumber 
                      placeholder="Exam Year (e.g. 2025)" 
                      value={tag.year}
                      onChange={(v) => {
                        const newTags = [...companyTags];
                        newTags[idx].year = v;
                        setCompanyTags(newTags);
                      }}
                      style={{ width: '100%' }}
                    />
                  </Col>
                  <Col span={11}>
                    <Input 
                      placeholder="Section Name (e.g. coding)" 
                      value={tag.sectionName}
                      onChange={(e) => {
                        const newTags = [...companyTags];
                        newTags[idx].sectionName = e.target.value;
                        setCompanyTags(newTags);
                      }}
                    />
                  </Col>
                </Row>
              </div>
            ))}
            <Button 
              type="dashed" 
              onClick={() => setCompanyTags(prev => [...prev, { companyName: '', examName: '', year: null, sectionName: '' }])}
            >
              + Add Company Tag
            </Button>
          </div>
        </div>

        <div className={QuestionStyles.divider} />
        <div className={QuestionStyles.sectionTitle}>Question Content & Options</div>

        {/* Question */}
        <div className={QuestionStyles.QuestionBodyFlex}>
          <div className={QuestionStyles.title}>Question Title*</div>
          <div className={QuestionStyles.rightBody}>
            <TextEditor
              name="question"
              editorFun={(v) => setQuestion(v)}
              initialContent={{ question }}
            />
          </div>
        </div>

        {/* Description */}
        <div className={QuestionStyles.QuestionBodyFlex}>
          <div className={QuestionStyles.title}>Description</div>
          <div className={QuestionStyles.rightBody}>
            <TextEditor
              name="description"
              editorFun={(v) => setDescription(v)}
              initialContent={{ description }}
            />
          </div>
        </div>

        {/* Test Cases */}
        <div className={QuestionStyles.QuestionBodyFlex}>
          <div className={QuestionStyles.title}>Test Cases*</div>
          <div className={QuestionStyles.rightBody}>
            {testCases.map((tc, index) => (
              <div key={tc._id} className={styles.testCaseBox}>
                <div className={styles.testCaseHeader}>
                  <div className={QuestionStyles.OptionText}>
                    Test Case {index + 1}
                  </div>
                  {testCases.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTestCase(tc._id)}
                      className={styles.btnDeleteInline}
                    >
                      Delete
                    </button>
                  )}
                </div>

                <div className={styles.mb12}>
                  <div className={styles.mb6}>Input:</div>
                  <TextEditor
                    name={`testcase-input-${tc._id}`}
                    editorFun={(val) =>
                      sendTestCaseEditorVals(val, tc._id, "input")
                    }
                    initialContent={{
                      [`testcase-input-${tc._id}`]: tc.input,
                    }}
                  />
                </div>

                <div className={styles.mb12}>
                  <div className={styles.mb6}>Expected Output:</div>
                  <TextEditor
                    name={`testcase-output-${tc._id}`}
                    editorFun={(val) =>
                      sendTestCaseEditorVals(val, tc._id, "expectedOutput")
                    }
                    initialContent={{
                      [`testcase-output-${tc._id}`]: tc.expectedOutput,
                    }}
                  />
                </div>

                <div>
                  <div className={styles.mb6}>Explanation:</div>
                  <TextEditor
                    name={`testcase-explanation-${tc._id}`}
                    editorFun={(val) =>
                      sendTestCaseEditorVals(val, tc._id, "explanation")
                    }
                    initialContent={{
                      [`testcase-explanation-${tc._id}`]: tc.explanation,
                    }}
                  />
                </div>
              </div>
            ))}

            <div className={QuestionStyles.QuestionBodyFlex}>
              <div className={QuestionStyles.rightBody}>
                <button
                  className={QuestionStyles.addBtn}
                  type="button"
                  onClick={addTestCase}
                >
                  Add Test Case
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Answer Explanation */}
        <div className={QuestionStyles.QuestionBodyFlex}>
          <div className={QuestionStyles.title}>Answer Explanation*</div>
          <div className={QuestionStyles.rightBody}>
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
}
