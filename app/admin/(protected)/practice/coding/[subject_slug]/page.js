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
import TextEditor from "@/modules/admin/utils/editor";
import QuestionStyles from "../../Practice_utils/questionstyles.module.scss";
import styles from "./page.module.scss";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CaretRightOutlined,
  CodeOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  CloudUploadOutlined,
} from "@ant-design/icons";
import BulkUploadModal from "../../Practice_utils/BulkUploadModal";
import PracticeBreadcrumbs from "../../Practice_utils/practiceBreadcrumbs";
import {
  createQuestion,
  fetchQuestions,
  fetchSubjectsByType,
  updateQuestion,
  deleteQuestion,
} from "@/redux/slices/admin/cms/practiceSlice";
import { parseIfJson } from "@/utils/windowMW";
import { PERMISSION_VALUES, usePermissions } from "@/hooks/usepermission";

const { Text } = Typography;

const CODING_TYPE = "Coding Question";

export default function Coding() {
  const [open, setOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [question, setQuestion] = useState("");
  const [explanation, setExplanation] = useState("");
  const [scorePoints, setScorePoints] = useState(1);
  const [testCases, setTestCases] = useState([
    { _id: Date.now(), input: "", expectedOutput: "", explanation: "" },
  ]);

  const singleTopic = useSelector((s) => s.practice.questions);
  const { subject_slug } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchSubjectsByType("coding"));
    dispatch(fetchQuestions({ subjectId: subject_slug }));
  }, []);

  const codingQuestions = singleTopic || [];

  const handleAdd = () => {
    setEditingQuestion(null);
    resetForm();
    setOpen(true);
  };
  const { canAccess, accessAll, getPermissionMessage } = usePermissions();
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
      await dispatch(deleteQuestion(questionId)).unwrap();
      dispatch(fetchQuestions({ subjectId: subject_slug }));
      message.success("Question deleted successfully");
    } catch (error) {
      message.error(error?.message || "Failed to delete question");
    }
  };

  const resetForm = () => {
    setQuestion("");
    setExplanation("");
    setScorePoints(1);
    setTestCases([
      { _id: Date.now(), input: "", expectedOutput: "", explanation: "" },
    ]);
  };

  const onCancel = () => {
    setOpen(false);
    resetForm();
    setEditingQuestion(null);
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
    return {
      questionContent: {
        question: String(question || "").trim(),
        testCases: testCases.map((tc) => ({
          _id: tc._id,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          explanation: tc.explanation,
        })),
      },
      answer: { explanation: String(explanation || "").trim() },
      questionType: CODING_TYPE,
      resources: {},
      scoreSettings: {
        scoreType: "fullScore",
        pointsForCorrectAns: scorePoints,
      },
      type: "practice",
      subjectId: subject_slug,
    };
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
      const { subjectId, ...finalPayload } = payload;
      if (editingQuestion) {
        await dispatch(
          updateQuestion({
            questionId: editingQuestion._id,
            data: finalPayload,
          })
        ).unwrap();
        message.success("Question updated successfully");
      } else {
        await dispatch(createQuestion(payload)).unwrap();
        message.success("Question created successfully");
      }
      dispatch(fetchQuestions({ subjectId: subject_slug }));
      setOpen(false);
      resetForm();
      setEditingQuestion(null);
    } catch (error) {
      message.error(
        error?.message ||
          `Failed to ${editingQuestion ? "update" : "save"} question`
      );
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

  const generateCollapseItems = () =>
    codingQuestions.map((questionData, index) => ({
      key: questionData._id,
      label: (
        <div className={styles.collapseHeader}>
          <div className={styles.collapseHeaderLeft}>
            <CodeOutlined className={styles.iconBlue} />
            <Text strong>Question {index + 1}</Text>
            <Tag color="blue" className={styles.ml12}>
              {questionData.scoreSettings?.pointsForCorrectAns || 0} pts
            </Tag>
            <Tag color="green" className={styles.ml8}>
              {questionData.questionContent?.testCases?.length || 0} test cases
            </Tag>
          </div>
          <Space size="small" onClick={(e) => e.stopPropagation()}>
            <Tooltip
              title={
                !canAccess(PERMISSION_VALUES.EDIT)
                  ? getPermissionMessage(PERMISSION_VALUES.EDIT)
                  : ""
              }
            >
              <>
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  size="small"
                  className={styles.btnEdit}
                  onClick={() => handleEdit(questionData)}
                  disabled={!canAccess(PERMISSION_VALUES?.EDIT)}
                >
                  Edit
                </Button>
              </>
            </Tooltip>
            <Tooltip
              title={
                !canAccess(PERMISSION_VALUES.DELETE)
                  ? getPermissionMessage(PERMISSION_VALUES.DELETE)
                  : ""
              }
            >
              <span>
                <Popconfirm
                  title="Delete Question"
                  description="Are you sure you want to delete this question?"
                  onConfirm={() => handleDelete(questionData._id)}
                  okText="Yes"
                  cancelText="No"
                  okType="danger"
                  disabled={!canAccess(PERMISSION_VALUES.DELETE)}
                >
                  <Button
                    type="text"
                    icon={<DeleteOutlined />}
                    size="small"
                    className={styles.btnDelete}
                    disabled={!canAccess(PERMISSION_VALUES.DELETE)}
                  >
                    Delete
                  </Button>
                </Popconfirm>
              </span>
            </Tooltip>
          </Space>
        </div>
      ),
      children: (
        <div className={styles.collapseContent}>
          <Card size="small" title="Question" className={styles.mb16}>
            <div
              className={styles.contentBox}
              dangerouslySetInnerHTML={{
                __html:
                  parseIfJson(questionData.questionContent?.question) ||
                  "No question content",
              }}
            />
          </Card>

          <Card size="small" title="Test Cases" className={styles.mb16}>
            <Row gutter={[16, 16]}>
              {(questionData.questionContent?.testCases || []).map(
                (testCase, tcIndex) => (
                  <Col xs={24} lg={12} key={testCase._id || tcIndex}>
                    <Card
                      size="small"
                      title={`Test Case ${tcIndex + 1}`}
                      className={styles.h100}
                    >
                      <div className={styles.mb12}>
                        <Text strong className={styles.textBlue}>
                          Input:
                        </Text>
                        <div
                          className={styles.inputBox}
                          dangerouslySetInnerHTML={{
                            __html: parseIfJson(testCase.input) || "No input",
                          }}
                        />
                      </div>

                      <div className={styles.mb12}>
                        <Text strong className={styles.textGreen}>
                          Expected Output:
                        </Text>
                        <div
                          className={styles.outputBox}
                          dangerouslySetInnerHTML={{
                            __html:
                              parseIfJson(testCase.expectedOutput) ||
                              "No expected output",
                          }}
                        />
                      </div>

                      {testCase.explanation && (
                        <div>
                          <Text strong className={styles.textYellow}>
                            Explanation:
                          </Text>
                          <div
                            className={styles.explanationBox}
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

          <Card size="small" title="Answer Explanation" className={styles.mb16}>
            <div
              className={styles.answerBox}
              dangerouslySetInnerHTML={{
                __html:
                  parseIfJson(questionData.answer?.explanation) ||
                  "No explanation provided",
              }}
            />
          </Card>
        </div>
      ),
    }));

  return (
    <div>
      <div className={styles.headerBar}>
        <PracticeBreadcrumbs />
        <Tooltip
          title={
            !canAccess(PERMISSION_VALUES?.CREATE)
              ? "You don't have permission to create"
              : ""
          }
        >
          <>
            <Button
              type="primary"
              onClick={handleAdd}
              style={{ width: "12rem" }}
              disabled={!canAccess(PERMISSION_VALUES?.CREATE)}
            >
              + Add Coding Question
            </Button>
          </>
        </Tooltip>
        
        <Tooltip
          title={
            !canAccess(PERMISSION_VALUES?.CREATE)
              ? "You don't have permission to create"
              : ""
          }
        >
          <Button
            type="default"
            icon={<CloudUploadOutlined />}
            onClick={() => setBulkModalOpen(true)}
            style={{ marginLeft: "1rem" }}
            disabled={!canAccess(PERMISSION_VALUES?.CREATE)}
          >
            Bulk Upload
          </Button>
        </Tooltip>
      </div>

      <BulkUploadModal 
        open={bulkModalOpen}
        onCancel={() => setBulkModalOpen(false)}
        subjectId={subject_slug}
        allowedType={CODING_TYPE}
      />

      <Divider className={styles.divider} />
      <div className={styles.scrollContainer}>
        {codingQuestions.length > 0 ? (
          <Collapse
            items={generateCollapseItems()}
            expandIcon={({ isActive }) => (
              <CaretRightOutlined rotate={isActive ? 90 : 0} />
            )}
            className={styles.collapseRoot}
            expandIconPosition="start"
          />
        ) : (
          <div className={styles.emptyBox}>
            <CodeOutlined className={styles.emptyIcon} />
            <div className={styles.emptyTitle}>
              No coding questions added yet
            </div>
            <div className={styles.emptySubtitle}>
              Click "Add Coding Question" to create your first question
            </div>
          </div>
        )}
      </div>

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
        centered
      >
        <div className={QuestionStyles.QuestionContainer}>
          <div className={`${QuestionStyles.QuestionBody} ${styles.pb5rem}`}>
            {/* Score */}
            <div className={QuestionStyles.QuestionBodyFlex}>
              <div className={QuestionStyles.title}>Score*</div>
              <div className={QuestionStyles.rightBody}>
                <InputNumber
                  min={1}
                  max={100}
                  placeholder="Points for Correct (>0)"
                  className={styles.inputScore}
                  value={scorePoints}
                  onChange={(v) => setScorePoints(Number(v || 1))}
                />
              </div>
            </div>

            {/* Question */}
            <div className={QuestionStyles.QuestionBodyFlex}>
              <div className={QuestionStyles.title}>Question*</div>
              <div className={QuestionStyles.rightBody}>
                <TextEditor
                  name="question"
                  editorFun={(v) => setQuestion(v)}
                  initialContent={{ question }}
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
      </Modal>
    </div>
  );
}
