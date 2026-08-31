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
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [activePanel, setActivePanel] = useState([]);
  const [filterDifficulty, setFilterDifficulty] = useState("All");
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  const togglePanel = (id) => {
    if (activePanel.includes(id)) {
      setActivePanel(activePanel.filter(x => x !== id));
    } else {
      setActivePanel([...activePanel, id]);
    }
  };

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

  useEffect(() => {
    setSelectedQuestions([]);
  }, [filterDifficulty]);

  const handleAdd = () => {
    router.push(`/admin/practice/coding/${subject_slug}/new-question`);
  };
  const { canAccess, accessAll, getPermissionMessage } = usePermissions();
  const handleEdit = (questionData) => {
    router.push(`/admin/practice/coding/${subject_slug}/${questionData._id}`);
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

  const handleSelect = (id, checked) => {
    setSelectedQuestions(prev => 
      checked ? [...prev, id] : prev.filter(qId => qId !== id)
    );
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedQuestions(filteredCodingQuestions.map(q => q._id));
    } else {
      setSelectedQuestions([]);
    }
  };

  const handleBulkDelete = async () => {
    if (!canAccess(PERMISSION_VALUES.DELETE)) {
      message.info(getPermissionMessage(PERMISSION_VALUES.DELETE));
      return;
    }
    const promises = selectedQuestions.map(id => dispatch(deleteQuestion(id)).unwrap());
    try {
      await Promise.all(promises);
      message.success(`${selectedQuestions.length} questions deleted successfully.`);
      setSelectedQuestions([]);
      dispatch(fetchQuestions({ subjectId: subject_slug }));
    } catch (err) {
      message.error("Failed to delete some questions.");
    }
  };

  const renderQuestions = () =>
    filteredCodingQuestions.map((questionData, index) => {
      const isExpanded = activePanel.includes(questionData._id);
      const score = questionData.scoreSettings?.pointsForCorrectAns || 0;
      return (
        <div key={questionData._id}>
          <div className={listStyles.questionRow}>
            <div className={listStyles.rowLeft}>
              <Checkbox
                checked={selectedQuestions?.includes(questionData._id)}
                onChange={(e) => handleSelect(questionData._id, e.target.checked)}
                style={{ marginRight: 8 }}
                onClick={(e) => e.stopPropagation()}
              />
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
            <div className={listStyles.expandedContent}>
              <div dangerouslySetInnerHTML={{ __html: parseIfJson(questionData.questionContent?.question) }} style={{ marginBottom: 16, fontWeight: 'bold' }} />
              
              <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {questionData.difficulty && <Tag color="blue" style={{ textTransform: 'capitalize' }}>Difficulty: {questionData.difficulty}</Tag>}
                {questionData.concept && <Tag color="purple">Concept: {questionData.concept}</Tag>}
                {questionData.companyTags && questionData.companyTags.length > 0 && (() => {
                  const companies = questionData.companyTags.map(t => t.companyName).filter(Boolean).join(', ');
                  const exams = questionData.companyTags.map(t => t.examName).filter(Boolean).join(', ');
                  const years = questionData.companyTags.map(t => t.year).filter(Boolean).join(', ');
                  const sections = questionData.companyTags.map(t => t.sectionName).filter(Boolean).join(', ');
                  
                  return (
                    <React.Fragment>
                      {companies && <Tag color="orange">Companies: {companies}</Tag>}
                      {exams && <Tag color="gold">Exams: {exams}</Tag>}
                      {years && <Tag color="cyan">Years: {years}</Tag>}
                      {sections && <Tag color="geekblue">Sections: {sections}</Tag>}
                    </React.Fragment>
                  );
                })()}
              </div>

              {questionData.questionContent?.description && (
                <div dangerouslySetInnerHTML={{ __html: parseIfJson(questionData.questionContent?.description) }} style={{ marginBottom: 16 }} />
              )}
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {questionData.questionContent?.testCases?.map((testCase, i) => (
                  <div key={testCase._id || i} style={{ background: '#F8FAFC', padding: 16, borderRadius: 8, border: '1px solid #E2E8F0' }}>
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
    <div className={listStyles.pageContainer}>
      <div className={listStyles.topActionRow}>
        <div className={listStyles.actionsLeft}>
          <PracticeBreadcrumbs />
          <Select
            value={filterDifficulty}
            onChange={(val) => setFilterDifficulty(val)}
            style={{ width: 150 }}
            options={[
              { value: 'All', label: 'All Difficulties' },
              { value: 'Easy', label: 'Easy' },
              { value: 'Medium', label: 'Medium' },
              { value: 'Hard', label: 'Hard' },
              { value: 'Expert', label: 'Expert' },
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

      <div style={{ marginTop: "1rem", marginBottom: "0.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {filteredCodingQuestions.length > 0 && (
          <Checkbox
            checked={selectedQuestions.length > 0 && selectedQuestions.length === filteredCodingQuestions.length}
            indeterminate={selectedQuestions.length > 0 && selectedQuestions.length < filteredCodingQuestions.length}
            onChange={(e) => handleSelectAll(e.target.checked)}
          >
            Select All
          </Checkbox>
        )}
        {selectedQuestions.length > 0 && (
          <Popconfirm title={`Delete ${selectedQuestions.length} questions?`} onConfirm={handleBulkDelete}>
            <Button danger icon={<DeleteOutlined />} disabled={!canAccess(PERMISSION_VALUES.DELETE)}>
              Delete Selected
            </Button>
          </Popconfirm>
        )}
      </div>

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
    </div>
  );
}
