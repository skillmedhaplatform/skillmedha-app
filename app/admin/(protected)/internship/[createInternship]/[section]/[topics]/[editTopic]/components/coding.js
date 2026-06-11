"use client";
import React, { useState, useEffect } from "react";
import {
  Button,
  Divider,
  Modal,
  message,
  InputNumber,
  Space,
  Popconfirm,
  Collapse,
  Card,
  Typography,
  Tag,
  Row,
  Col,
  Tooltip,
} from "antd";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { getOneTopic, updateTopic } from "@/redux/slices/admin/cms/internship";
import TextEditor from "@/modules/admin/utils/editor";
import QuestionStyles from "../[question]/styles.module.scss";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CaretRightOutlined,
  CodeOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { parseIfJson } from "@/utils/windowMW";

const { Panel } = Collapse;
const { Text, Title } = Typography;

const CODING_TYPE = "Coding Question";
const MAX_CODING_QUESTIONS = 5; // Maximum allowed coding questions

export default function Coding() {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [question, setQuestion] = useState("");
  const [explanation, setExplanation] = useState("");
  const [scorePoints, setScorePoints] = useState(1);
  const [testCases, setTestCases] = useState([
    { _id: Date.now(), input: "", expectedOutput: "", explanation: "" },
  ]);

  const singleTopic = useSelector((s) => s.adminInternship.singleTopic);
  const {
    createInternship: internshipId,
    section: sectionId,
    topics: topicId,
    editTopic,
  } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getOneTopic({ id: topicId }));
  }, []);

  const codingQuestions = singleTopic?.coding || [];
  const isMaxQuestionsReached = codingQuestions.length >= MAX_CODING_QUESTIONS;

  const handleAdd = async () => {
    // Check if maximum questions limit is reached
    if (isMaxQuestionsReached) {
      message.warning(
        `Maximum ${MAX_CODING_QUESTIONS} coding questions allowed`
      );
      return;
    }

    try {
      if (!Array.isArray(singleTopic?.coding)) {
        await dispatch(
          updateTopic({
            id: internshipId,
            sid: sectionId,
            tid: topicId,
            data: { coding: [] },
          })
        ).unwrap();
      }
      setEditingQuestion(null);
      resetForm();
      setOpen(true);
    } catch (error) {
      message.error("Failed to initialize coding questions");
    }
  };

  const handleEdit = (questionData) => {
    setEditingQuestion(questionData);
    setQuestion(questionData.questionContent?.question || "");
    setExplanation(questionData.answer?.explanation || "");
    setScorePoints(questionData.scoreSettings?.pointsForCorrectAns || 1);
    setTestCases(
      questionData.questionContent?.testCases || [
        { _id: Date.now(), input: "", expectedOutput: "", explanation: "" },
      ]
    );
    setOpen(true);
  };

  const handleDelete = async (questionId) => {
    try {
      const currentCoding = singleTopic?.coding || [];
      const updatedCoding = currentCoding.filter((q) => q._id !== questionId);

      await dispatch(
        updateTopic({
          id: internshipId,
          sid: sectionId,
          tid: topicId,
          data: { coding: updatedCoding },
        })
      ).unwrap();

      message.success("Question deleted successfully");
    } catch (error) {
      message.error("Failed to delete question");
    }
  };

  const onCancel = () => {
    setOpen(false);
    resetForm();
    setEditingQuestion(null);
  };

  const resetForm = () => {
    setQuestion("");
    setExplanation("");
    setScorePoints(1);
    setTestCases([
      { _id: Date.now(), input: "", expectedOutput: "", explanation: "" },
    ]);
  };

  const validate = () => {
    if (!String(question || "").trim())
      return { ok: false, msg: "Please enter a question" };
    if (!String(explanation || "").trim())
      return { ok: false, msg: "Please enter an answer explanation" };
    if (!scorePoints || scorePoints <= 0)
      return { ok: false, msg: "Please enter a valid score (greater than 0)" };
    if (!testCases.length)
      return { ok: false, msg: "Please add at least one test case" };

    // Validate test cases
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

  const buildPayload = () => {
    const questionContent = {
      question: String(question || "").trim(),
      testCases: testCases.map((tc) => ({
        _id: tc._id,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        explanation: tc.explanation,
      })),
    };

    const answer = {
      explanation: String(explanation || "").trim(),
    };

    const questionData = {
      _id:
        editingQuestion?._id ||
        `coding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      questionContent,
      answer,
      questionType: CODING_TYPE,
      resources: {},
      scoreSettings: {
        scoreType: "fullScore",
        pointsForCorrectAns: scorePoints,
      },
      type: "skill",
      createdAt: editingQuestion?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return questionData;
  };

  const onSave = async () => {
    const v = validate();
    if (!v.ok) {
      message.error(v.msg || "Please fix the validation errors");
      return;
    }

    try {
      setSaving(true);
      const payload = buildPayload();
      const currentCoding = singleTopic?.coding || [];

      let updatedCoding;
      if (editingQuestion) {
        // Update existing question
        updatedCoding = currentCoding.map((q) =>
          q._id === editingQuestion._id ? payload : q
        );
        message.success("Question updated successfully");
      } else {
        // Check limit before adding new question
        if (currentCoding.length >= MAX_CODING_QUESTIONS) {
          message.warning(
            `Maximum ${MAX_CODING_QUESTIONS} coding questions allowed`
          );
          setSaving(false);
          return;
        }

        // Add new question
        updatedCoding = [...currentCoding, payload];
        message.success("Question added successfully");
      }

      await dispatch(
        updateTopic({
          id: internshipId,
          sid: sectionId,
          tid: topicId,
          data: { coding: updatedCoding },
        })
      ).unwrap();

      setOpen(false);
      resetForm();
      setEditingQuestion(null);
    } catch (error) {
      message.error("Failed to save question, try again");
    } finally {
      setSaving(false);
    }
  };

  const addTestCase = () => {
    setTestCases((prev) => [
      ...prev,
      { _id: Date.now(), input: "", expectedOutput: "", explanation: "" },
    ]);
  };

  const removeTestCase = (id) => {
    setTestCases((prev) =>
      prev.length > 1 ? prev.filter((tc) => tc._id !== id) : prev
    );
  };

  const sendTestCaseEditorVals = (val, id, field) => {
    setTestCases((prev) =>
      prev.map((tc) => (tc._id === id ? { ...tc, [field]: val } : tc))
    );
  };

  // Generate collapse items
  const generateCollapseItems = () => {
    return codingQuestions.map((questionData, index) => ({
      key: questionData._id,
      label: (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <CodeOutlined style={{ marginRight: 8, color: "#1890ff" }} />
            <Text strong>Question {index + 1}</Text>
            <Tag color="blue" style={{ marginLeft: 12 }}>
              {questionData.scoreSettings?.pointsForCorrectAns || 0} pts
            </Tag>
            <Tag color="green" style={{ marginLeft: 8 }}>
              {questionData.questionContent?.testCases?.length || 0} test cases
            </Tag>
          </div>
          <Space size="small" onClick={(e) => e.stopPropagation()}>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(questionData);
              }}
              size="small"
              style={{ color: "#1890ff" }}
            >
              Edit
            </Button>
            <Popconfirm
              title="Delete Question"
              description="Are you sure you want to delete this question?"
              onConfirm={() => handleDelete(questionData._id)}
              okText="Yes"
              cancelText="No"
              okType="danger"
            >
              <Button
                type="text"
                icon={<DeleteOutlined />}
                size="small"
                style={{ color: "#ff4d4f" }}
                onClick={(e) => e.stopPropagation()}
              >
                Delete
              </Button>
            </Popconfirm>
          </Space>
        </div>
      ),
      children: (
        <div style={{ padding: "16px 0" }}>
          {/* Question Content */}
          <Card
            size="small"
            title={
              <Space>
                <InfoCircleOutlined style={{ color: "#1890ff" }} />
                <Text strong>Question</Text>
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            <div
              dangerouslySetInnerHTML={{
                __html:
                  parseIfJson(questionData.questionContent?.question) ||
                  "No question content",
              }}
              style={{
                minHeight: "40px",
                padding: "8px",
                backgroundColor: "#fafafa",
                borderRadius: "4px",
                border: "1px solid #f0f0f0",
              }}
            />
          </Card>

          {/* Test Cases */}
          <Card
            size="small"
            title={
              <Space>
                <CheckCircleOutlined style={{ color: "#52c41a" }} />
                <Text strong>
                  Test Cases (
                  {questionData.questionContent?.testCases?.length || 0})
                </Text>
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            <Row gutter={[16, 16]}>
              {(questionData.questionContent?.testCases || []).map(
                (testCase, tcIndex) => (
                  <Col xs={24} lg={12} key={testCase._id || tcIndex}>
                    <Card
                      size="small"
                      title={`Test Case ${tcIndex + 1}`}
                      style={{ height: "100%" }}
                    >
                      <div style={{ marginBottom: 12 }}>
                        <Text strong style={{ color: "#1890ff" }}>
                          Input:
                        </Text>
                        <div
                          style={{
                            marginTop: 4,
                            padding: "8px",
                            backgroundColor: "#f6f8fa",
                            borderRadius: "4px",
                            border: "1px solid #e1e8ed",
                            fontFamily: "monospace",
                            fontSize: "12px",
                            whiteSpace: "pre-wrap",
                            minHeight: "32px",
                          }}
                          dangerouslySetInnerHTML={{
                            __html: parseIfJson(testCase.input) || "No input",
                          }}
                        />
                      </div>

                      <div style={{ marginBottom: 12 }}>
                        <Text strong style={{ color: "#52c41a" }}>
                          Expected Output:
                        </Text>
                        <div
                          style={{
                            marginTop: 4,
                            padding: "8px",
                            backgroundColor: "#f6ffed",
                            borderRadius: "4px",
                            border: "1px solid #b7eb8f",
                            fontFamily: "monospace",
                            fontSize: "12px",
                            whiteSpace: "pre-wrap",
                            minHeight: "32px",
                          }}
                          dangerouslySetInnerHTML={{
                            __html:
                              parseIfJson(testCase.expectedOutput) ||
                              "No expected output",
                          }}
                        />
                      </div>

                      {testCase.explanation && (
                        <div>
                          <Text strong style={{ color: "#fadb14" }}>
                            Explanation:
                          </Text>
                          <div
                            style={{
                              marginTop: 4,
                              padding: "8px",
                              backgroundColor: "#fffbe6",
                              borderRadius: "4px",
                              border: "1px solid #ffe58f",
                              fontSize: "12px",
                              minHeight: "32px",
                            }}
                            dangerouslySetInnerHTML={{
                              __html:
                                parseIfJson(testCase.explanation) ||
                                "No explanation",
                            }}
                          />
                        </div>
                      )}
                    </Card>
                  </Col>
                )
              )}
            </Row>
          </Card>

          {/* Answer Explanation */}
          <Card
            size="small"
            title={
              <Space>
                <InfoCircleOutlined style={{ color: "#722ed1" }} />
                <Text strong>Answer Explanation</Text>
              </Space>
            }
          >
            <div
              dangerouslySetInnerHTML={{
                __html:
                  parseIfJson(questionData.answer?.explanation) ||
                  "No explanation provided",
              }}
              style={{
                minHeight: "40px",
                padding: "8px",
                backgroundColor: "#f9f0ff",
                borderRadius: "4px",
                border: "1px solid #efdbff",
              }}
            />
          </Card>
        </div>
      ),
    }));
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          width: "100%",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <div>
          <strong style={{ fontSize: "20px" }}>
            Coding Questions ({codingQuestions.length}/{MAX_CODING_QUESTIONS})
          </strong>
          {isMaxQuestionsReached && (
            <Tag color="orange" style={{ marginLeft: 12 }}>
              <LockOutlined style={{ marginRight: 4 }} />
              Maximum Limit Reached
            </Tag>
          )}
        </div>

        {/* Add Question Button with Tooltip */}
        <Tooltip
          title={
            isMaxQuestionsReached
              ? `Maximum ${MAX_CODING_QUESTIONS} coding questions allowed`
              : "Add a new coding question"
          }
        >
          <Button
            type="primary"
            onClick={handleAdd}
            disabled={isMaxQuestionsReached}
            icon={isMaxQuestionsReached ? <LockOutlined /> : undefined}
          >
            {isMaxQuestionsReached ? "Maximum Reached" : "Add Coding Question"}
          </Button>
        </Tooltip>
      </div>

      <Divider style={{ margin: "10px 0" }} />

      {codingQuestions.length > 0 ? (
        <>
          <Collapse
            items={generateCollapseItems()}
            expandIcon={({ isActive }) => (
              <CaretRightOutlined rotate={isActive ? 90 : 0} />
            )}
            style={{
              backgroundColor: "#fff",
              border: "1px solid #f0f0f0",
            }}
            expandIconPosition="start"
          />
        </>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            backgroundColor: "#fafafa",
            borderRadius: "8px",
            border: "2px dashed #d9d9d9",
          }}
        >
          <CodeOutlined
            style={{ fontSize: "48px", color: "#d9d9d9", marginBottom: "16px" }}
          />
          <div style={{ color: "#999", fontSize: "16px", marginBottom: "8px" }}>
            No coding questions added yet
          </div>
          <div style={{ color: "#999", fontSize: "14px" }}>
            Click "Add Coding Question" to create your first question
          </div>
        </div>
      )}

      <Modal
        title={
          editingQuestion ? "Edit Coding Question" : "Create Coding Question"
        }
        open={open}
        onCancel={onCancel}
        footer={[
          <Button key="cancel" type="dashed" onClick={onCancel} danger>
            Cancel
          </Button>,
          <Button key="save" type="primary" loading={saving} onClick={onSave}>
            {editingQuestion ? "Update Question" : "Save Question"}
          </Button>,
        ]}
        destroyOnHidden
        closable={false}
        mask={{ closable: false }}
        width={"90%"}
        centered={true}
      >
        <div className={QuestionStyles.QuestionContainer}>
          <div
            className={QuestionStyles.QuestionBody}
            style={{ paddingBottom: "5rem" }}
          >
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
              </div>
            </div>

            {/* Test Cases */}
            <div className={QuestionStyles.QuestionBodyFlex}>
              <div className={`${QuestionStyles.title}`}>Test Cases*</div>
              <div className={`${QuestionStyles.rightBody}`}>
                {testCases.map((tc, index) => (
                  <div
                    key={tc._id}
                    style={{
                      border: "1px solid #eee",
                      padding: 12,
                      borderRadius: 8,
                      marginBottom: 12,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <div className={QuestionStyles.OptionText}>
                        Test Case {index + 1}
                      </div>
                      {testCases.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTestCase(tc._id)}
                          style={{
                            border: 0,
                            background: "transparent",
                            color: "#ff4d4f",
                            cursor: "pointer",
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </div>

                    <div style={{ marginBottom: 12 }}>
                      <div style={{ marginBottom: 6 }}>Input:</div>
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

                    <div style={{ marginBottom: 12 }}>
                      <div style={{ marginBottom: 6 }}>Expected Output:</div>
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
                      <div style={{ marginBottom: 6 }}>Explanation:</div>
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
                  <div className={`${QuestionStyles.rightBody}`}>
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
              <div className={`${QuestionStyles.title}`}>
                Answer Explanation*
              </div>
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
      </Modal>
    </div>
  );
}
