"use client";
import React, { useState, useEffect } from "react";
import {
  Button,
  Divider,
  Modal,
  message,
  InputNumber,
  Select,
  Space,
  Popconfirm,
  Collapse,
  Card,
  Typography,
  Tag,
  Row,
  Col,
  Tooltip,
  Dropdown
} from "antd";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import TextEditor from "@/modules/admin/utils/editor";
import QuestionStyles from "../../Practice_utils/questionstyles.module.scss";
import styles from "./page.module.scss";
import {
  CodeOutlined,
  CloudUploadOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  DatabaseOutlined,
  CaretRightOutlined,
  SettingOutlined,
  TagOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { HiDotsVertical } from "react-icons/hi";
import qStyles from "@/modules/testportal_admin/components/reusable-comps/questionBank/questionCard.module.scss";
import listStyles from "@/app/admin/(protected)/practice/Practice_utils/listStyles.module.scss";
import PracticeBreadcrumbs from "@/app/admin/(protected)/practice/Practice_utils/practiceBreadcrumbs";
import BulkUploadModal from "../../Practice_utils/BulkUploadModal";
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
  const [activePanel, setActivePanel] = useState([]);
  const [filterDifficulty, setFilterDifficulty] = useState("All");

  const togglePanel = (id) => {
    if (activePanel.includes(id)) {
      setActivePanel(activePanel.filter(x => x !== id));
    } else {
      setActivePanel([...activePanel, id]);
    }
  };
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [explanation, setExplanation] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [testCases, setTestCases] = useState([
    { _id: Date.now(), input: "", expectedOutput: "", explanation: "" },
  ]);

  const singleTopic = useSelector((s) => s.adminPractice.questions);
  const { subject_slug } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchSubjectsByType("coding"));
    dispatch(fetchQuestions({ subjectId: subject_slug }));
  }, []);

  const codingQuestions = singleTopic || [];
  const filteredCodingQuestions = codingQuestions.filter(q => 
    filterDifficulty === "All" || q.difficulty === filterDifficulty
  );

  const handleAdd = () => {
    setEditingQuestion(null);
    resetForm();
    setOpen(true);
  };
  const { canAccess, accessAll, getPermissionMessage } = usePermissions();
  const handleEdit = (questionData) => {
    setEditingQuestion(questionData);
    setQuestion(questionData.questionContent?.question || "");
    setDescription(questionData.questionContent?.description || "");
    setExplanation(questionData.answer?.explanation || "");
    setDifficulty(questionData.difficulty || "Easy");
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
    setDescription("");
    setExplanation("");
    setDifficulty("Easy");
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

  const buildPayload = () => {
    return {
      questionContent: {
        question: String(question || "").trim(),
        description: String(description || "").trim(),
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
      difficulty: difficulty,
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

  const renderQuestions = () =>
    filteredCodingQuestions.map((questionData, index) => {
      const isExpanded = activePanel.includes(questionData._id);
      const score = questionData.scoreSettings?.pointsForCorrectAns || 0;
      return (
        <div key={questionData._id}>
          <div className={listStyles.questionRow}>
            <div className={listStyles.rowLeft}>
              <CaretRightOutlined 
                className={`${listStyles.expandIcon} ${isExpanded ? listStyles.expanded : ""}`}
                onClick={(e) => { e.stopPropagation(); togglePanel(questionData._id); }}
              />
              <span className={listStyles.qNumber}>{index + 1}</span>
              <span className={listStyles.qText}>
                {String(parseIfJson(parseIfJson(questionData.questionContent?.question)))
                  ?.replace(/<[^>]*>?/gm, '')
                  ?.replace(/&nbsp;/g, ' ')
                  ?.replace(/&amp;/g, '&')
                  ?.replace(/&lt;/g, '<')
                  ?.replace(/&gt;/g, '>')
                  ?.replace(/&quot;/g, '"')
                  ?.replace(/&#39;/g, "'")
                  ?.substring(0, 50)}...
              </span>
            </div>
            
            <div className={listStyles.rowRight}>
              <div className={listStyles.badges}>
                <span className={`${listStyles.badge} ${listStyles.type}`}>Coding</span>
                <span className={`${listStyles.badge} ${listStyles.difficulty}`}>{questionData.difficulty || "Medium"}</span>
              </div>
              
              <div className={listStyles.actionIcons}>
                <Tooltip title={!canAccess(PERMISSION_VALUES.EDIT) ? getPermissionMessage(PERMISSION_VALUES.EDIT) : ""}>
                  <button className={listStyles.edit} disabled={!canAccess(PERMISSION_VALUES.EDIT)} onClick={() => handleEdit(questionData)}>
                    <EditOutlined />
                  </button>
                </Tooltip>
                <Tooltip title="Copy (Coming soon)">
                  <button className={listStyles.copy}><CopyOutlined /></button>
                </Tooltip>
                <Tooltip title={!canAccess(PERMISSION_VALUES.DELETE) ? getPermissionMessage(PERMISSION_VALUES.DELETE) : ""}>
                  <Popconfirm title="Delete?" onConfirm={() => handleDelete(questionData._id)} disabled={!canAccess(PERMISSION_VALUES.DELETE)}>
                    <button className={listStyles.delete} disabled={!canAccess(PERMISSION_VALUES.DELETE)}>
                      <DeleteOutlined />
                    </button>
                  </Popconfirm>
                </Tooltip>
              </div>
            </div>
          </div>
          
          {isExpanded && (
            <div style={{ padding: '16px 40px', background: '#fff', border: '1px solid #E2E8F0', borderTop: 'none', borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }}>
              <div dangerouslySetInnerHTML={{ __html: parseIfJson(questionData.questionContent?.question) }} style={{ marginBottom: 16, fontWeight: 'bold' }} />
              {questionData.questionContent?.description && (
                <div dangerouslySetInnerHTML={{ __html: parseIfJson(questionData.questionContent?.description) }} style={{ marginBottom: 16 }} />
              )}
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {questionData.questionContent?.testCases?.map((testCase, i) => (
                  <div key={testCase._id} style={{ background: '#F8FAFC', padding: 12, borderRadius: 6, border: '1px solid #E2E8F0' }}>
                    <div style={{ fontWeight: 600, marginBottom: 8, color: '#475569' }}>Test Case {i + 1}</div>
                    <div style={{ fontSize: '0.9rem', color: '#334155' }}>
                      <div style={{ marginBottom: 4 }}><strong>Input:</strong> {parseIfJson(testCase.input)}</div>
                      <div><strong>Output:</strong> {parseIfJson(testCase.expectedOutput)}</div>
                    </div>
                  </div>
                ))}
              </div>

              {questionData.answer?.explanation && (
                <div style={{ marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                  <strong>Explanation:</strong>
                  <div dangerouslySetInnerHTML={{ __html: parseIfJson(questionData.answer?.explanation) }} />
                </div>
              )}
            </div>
          )}
        </div>
      );
    });

  return (
    <div className={listStyles.pageContainer} style={{ padding: '24px' }}>
      <div className={listStyles.topActionRow}>
        <div className={listStyles.actionsLeft} style={{ display: 'flex', alignItems: 'center' }}>
          <PracticeBreadcrumbs />
          <Select
            value={filterDifficulty}
            onChange={(val) => setFilterDifficulty(val)}
            style={{ width: 150, marginLeft: '1rem' }}
            options={[
              { value: 'All', label: 'All Difficulties' },
              { value: 'Easy', label: 'Easy' },
              { value: 'Medium', label: 'Medium' },
              { value: 'Hard', label: 'Hard' },
            ]}
          />
        </div>
        <div className={listStyles.actionsRight}>
          <Tooltip title={!canAccess(PERMISSION_VALUES.CREATE) ? getPermissionMessage(PERMISSION_VALUES.CREATE) : ""}>
            <button
              className={listStyles.btnPrimary}
              onClick={() => {
                if (canAccess(PERMISSION_VALUES?.CREATE)) handleAdd();
                else message.error("You don't have permission to create");
              }}
            >
              + Create Question
            </button>
          </Tooltip>

          <Tooltip title={!canAccess(PERMISSION_VALUES.CREATE) ? getPermissionMessage(PERMISSION_VALUES.CREATE) : ""}>
            <button
              className={listStyles.btnSecondary}
              onClick={() => {
                if (canAccess(PERMISSION_VALUES?.CREATE)) setBulkModalOpen(true);
                else message.error("You don't have permission to create");
              }}
            >
              <CloudUploadOutlined /> Bulk Upload
            </button>
          </Tooltip>
        </div>
      </div>



      <BulkUploadModal
        open={bulkModalOpen}
        onCancel={() => setBulkModalOpen(false)}
        subjectId={subject_slug}
        allowedType={CODING_TYPE}
      />

      <div style={{ marginTop: "1rem" }}>
        {filteredCodingQuestions.length > 0 ? (
          <div className={listStyles.questionList}>
            {renderQuestions()}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: 8, border: '1px solid #E2E8F0' }}>
            <CodeOutlined style={{ fontSize: '2rem', marginBottom: '1rem', color: '#cbd5e1' }} />
            <p style={{ color: '#64748B' }}>No coding questions added yet</p>
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
          <div style={{ marginBottom: '16px' }}>
            <PracticeBreadcrumbs />
          </div>
          <div className={`${QuestionStyles.QuestionBody} ${styles.pb5rem}`}>
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
                  ]}
                />
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
      </Modal>
    </div>
  );
}
