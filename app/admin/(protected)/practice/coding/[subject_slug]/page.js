"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  Dropdown,
  Checkbox,
  Skeleton,
  Pagination,
} from "antd";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
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
import listStyles from "@/app/admin/(protected)/practice/Practice_utils/listStyles.module.scss";
import PracticeBreadcrumbs from "@/app/admin/(protected)/practice/Practice_utils/practiceBreadcrumbs";
import BulkUploadModal from "../../Practice_utils/BulkUploadModal";
import {
  createQuestion,
  fetchQuestions,
  fetchSubjectsByType,
  updateQuestion,
  deleteQuestion,
  bulkDeletePracQuestions,
} from "@/redux/slices/admin/cms/practiceSlice";
import { parseIfJson } from "@/utils/windowMW";
import { PERMISSION_VALUES, usePermissions } from "@/hooks/usepermission";

const { Text, Title } = Typography;

const CODING_TYPE = "Coding Question";

const QuestionRow = React.memo(({ q, index, isSelected, onSelect, onEdit, onDelete }) => {
  const { canAccess, getPermissionMessage } = usePermissions();
  const [isExpanded, setIsExpanded] = useState(false);
  const { _id, questionContent, answer, difficulty, companyTags } = q;
  const score = q.scoreSettings?.pointsForCorrectAns || 0;

  return (
    <div>
      <div className={listStyles.questionRow}>
        <div className={listStyles.rowLeft}>
          <Checkbox
            checked={isSelected}
            onChange={(e) => onSelect && onSelect(_id, e.target.checked)}
            style={{ marginRight: 8 }}
            onClick={(e) => e.stopPropagation()}
          />
          <CaretRightOutlined 
            className={`${listStyles.expandIcon} ${isExpanded ? listStyles.expanded : ""}`}
            onClick={(e) => { e.stopPropagation(); setIsExpanded(prev => !prev); }}
          />
          <span className={listStyles.qNumber}>{index + 1}</span>
          <span className={listStyles.qText}>
            {String(parseIfJson(parseIfJson(questionContent?.question)))
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
            <span className={`${listStyles.badge} ${listStyles.difficulty}`}>{difficulty || "Medium"}</span>
          </div>
          
          <div className={listStyles.actionIcons}>
            <Tooltip title={!canAccess(PERMISSION_VALUES.EDIT) ? getPermissionMessage(PERMISSION_VALUES.EDIT) : ""}>
              <button className={listStyles.edit} disabled={!canAccess(PERMISSION_VALUES.EDIT)} onClick={() => onEdit(q)}>
                <EditOutlined />
              </button>
            </Tooltip>
            <Tooltip title="Copy (Coming soon)">
              <button className={listStyles.copy}><CopyOutlined /></button>
            </Tooltip>
            <Tooltip title={!canAccess(PERMISSION_VALUES.DELETE) ? getPermissionMessage(PERMISSION_VALUES.DELETE) : ""}>
              <Popconfirm title="Delete?" onConfirm={() => onDelete(_id)} disabled={!canAccess(PERMISSION_VALUES.DELETE)}>
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
          <div dangerouslySetInnerHTML={{ __html: parseIfJson(questionContent?.question) }} style={{ marginBottom: 16, fontWeight: 'bold' }} />
          
          <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {difficulty && <Tag color="blue" style={{ textTransform: 'capitalize' }}>Difficulty: {difficulty}</Tag>}
            {q.concept && <Tag color="purple">Concept: {q.concept}</Tag>}
            {companyTags && companyTags.length > 0 && (() => {
              const companies = companyTags.map(t => t.companyName).filter(Boolean).join(', ');
              const exams = companyTags.map(t => t.examName).filter(Boolean).join(', ');
              const years = companyTags.map(t => t.year).filter(Boolean).join(', ');
              const sections = companyTags.map(t => t.sectionName).filter(Boolean).join(', ');
              
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

          {questionContent?.description && (
            <div dangerouslySetInnerHTML={{ __html: parseIfJson(questionContent?.description) }} style={{ marginBottom: 16 }} />
          )}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {questionContent?.testCases?.map((testCase, i) => (
              <div key={testCase._id || i} style={{ background: '#F8FAFC', padding: 16, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                <div style={{ fontWeight: 600, marginBottom: 8, color: '#475569' }}>Test Case {i + 1}</div>
                <div style={{ fontSize: '0.9rem', color: '#334155' }}>
                  <div style={{ marginBottom: 4 }}><strong>Input:</strong> {parseIfJson(testCase.input)}</div>
                  <div><strong>Output:</strong> {parseIfJson(testCase.expectedOutput)}</div>
                </div>
              </div>
            ))}
          </div>

          {answer?.explanation && (
            <div style={{ marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <strong>Explanation:</strong>
              <div dangerouslySetInnerHTML={{ __html: parseIfJson(answer?.explanation) }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
});
QuestionRow.displayName = "QuestionRow";

const QuestionList = React.memo(({ questions, onEdit, onDelete, selectedSet = new Set(), onSelect }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  useEffect(() => {
    setCurrentPage(1);
  }, [questions.length]);

  if (!questions.length) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: 8, border: '1px solid #E2E8F0' }}>
        <CodeOutlined style={{ fontSize: '2rem', marginBottom: '1rem', color: '#cbd5e1' }} />
        <p style={{ color: '#64748B' }}>No coding questions added yet</p>
      </div>
    );
  }

  const paginatedQuestions = questions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className={listStyles.questionList}>
      {paginatedQuestions.map((q, index) => {
        const absoluteIndex = (currentPage - 1) * pageSize + index;
        return (
          <QuestionRow
            key={q._id}
            q={q}
            index={absoluteIndex}
            isSelected={selectedSet.has(q._id)}
            onSelect={onSelect}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        );
      })}

      {questions.length > pageSize && (
        <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={questions.length}
            onChange={(p, ps) => {
              setCurrentPage(p);
              setPageSize(ps);
            }}
            showSizeChanger
            pageSizeOptions={["20", "50", "100", "200", "500"]}
            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} questions`}
          />
        </div>
      )}
    </div>
  );
});
QuestionList.displayName = "QuestionList";

export default function Coding() {
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [filterDifficulty, setFilterDifficulty] = useState("All");
  const [selectedSet, setSelectedSet] = useState(new Set());
  const selectedQuestions = useMemo(() => Array.from(selectedSet), [selectedSet]);

  const singleTopic = useSelector((s) => s.adminPractice.questions);
  const loading = useSelector((s) => s.adminPractice.status === "loading");
  const { subject_slug } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { canAccess, getPermissionMessage } = usePermissions();

  useEffect(() => {
    dispatch(fetchSubjectsByType("coding"));
    dispatch(fetchQuestions({ subjectId: subject_slug }));
  }, [dispatch, subject_slug]);

  const codingQuestions = singleTopic || [];
  const filteredCodingQuestions = useMemo(() => {
    return codingQuestions.filter(q => 
      filterDifficulty === "All" || q.difficulty === filterDifficulty
    );
  }, [codingQuestions, filterDifficulty]);

  useEffect(() => {
    setSelectedSet(new Set());
  }, [filterDifficulty, codingQuestions]);

  const handleAdd = useCallback(() => {
    router.push(`/admin/practice/coding/${subject_slug}/new-question`);
  }, [router, subject_slug]);

  const handleEdit = useCallback((questionData) => {
    router.push(`/admin/practice/coding/${subject_slug}/${questionData._id}`);
  }, [router, subject_slug]);

  const handleDelete = useCallback(async (questionId) => {
    try {
      await dispatch(deleteQuestion(questionId)).unwrap();
      dispatch(fetchQuestions({ subjectId: subject_slug }));
      message.success("Question deleted successfully");
    } catch (error) {
      message.error(error?.message || "Failed to delete question");
    }
  }, [dispatch, subject_slug]);

  const handleSelect = useCallback((id, checked) => {
    setSelectedSet((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback((checked) => {
    if (checked) {
      setSelectedSet(new Set(filteredCodingQuestions.map((q) => q._id)));
    } else {
      setSelectedSet(new Set());
    }
  }, [filteredCodingQuestions]);

  const handleBulkDelete = useCallback(async () => {
    if (!canAccess(PERMISSION_VALUES.DELETE)) {
      message.info(getPermissionMessage(PERMISSION_VALUES.DELETE));
      return;
    }
    const hide = message.loading(`Deleting ${selectedQuestions.length} questions...`, 0);
    try {
      const deletedIds = await dispatch(bulkDeletePracQuestions(selectedQuestions)).unwrap();
      hide();
      message.success(`${deletedIds.length} questions deleted successfully.`);
      setSelectedSet(new Set());
      dispatch(fetchQuestions({ subjectId: subject_slug }));
    } catch (err) {
      hide();
      console.error(err);
      message.error("Failed to delete some questions.");
    }
  }, [selectedQuestions, dispatch, subject_slug, canAccess, getPermissionMessage]);

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
            checked={selectedSet.size > 0 && selectedSet.size === filteredCodingQuestions.length}
            indeterminate={selectedSet.size > 0 && selectedSet.size < filteredCodingQuestions.length}
            onChange={(e) => handleSelectAll(e.target.checked)}
          >
            Select All
          </Checkbox>
        )}
        {selectedSet.size > 0 && (
          <Popconfirm title={`Delete ${selectedSet.size} questions?`} onConfirm={handleBulkDelete}>
            <Button danger icon={<DeleteOutlined />} disabled={!canAccess(PERMISSION_VALUES.DELETE)}>
              Delete Selected
            </Button>
          </Popconfirm>
        )}
      </div>

      <div style={{ marginTop: "1rem" }}>
        {loading ? (
          <div style={{ padding: "2rem" }}>
            <Skeleton active paragraph={{ rows: 6 }} />
          </div>
        ) : (
          <QuestionList
            questions={filteredCodingQuestions}
            onEdit={handleEdit}
            onDelete={handleDelete}
            selectedSet={selectedSet}
            onSelect={handleSelect}
          />
        )}
      </div>
    </div>
  );
}

