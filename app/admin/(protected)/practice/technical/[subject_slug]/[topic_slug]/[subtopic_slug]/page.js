"use client";
import React, { useEffect, useMemo, useCallback } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Divider,
  Collapse,
  Space,
  Typography,
  Tag,
  Radio,
  Checkbox,
  Popconfirm,
  Tooltip,
  message,
  Input,
  Select,
  Skeleton,
  Pagination,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  SoundOutlined,
  VideoCameraOutlined,
  CheckCircleOutlined,
  CloudUploadOutlined,
  CopyOutlined,
  SearchOutlined,
  CaretRightOutlined,
} from "@ant-design/icons";
import BulkUploadModal from "@/app/admin/(protected)/practice/Practice_utils/BulkUploadModal";
import styles from "../../../../practiceStyles.module.scss";
import listStyles from "@/app/admin/(protected)/practice/Practice_utils/listStyles.module.scss";
import PracticeBreadcrumbs from "@/app/admin/(protected)/practice/Practice_utils/practiceBreadcrumbs";
import {
  deleteQuestion,
  bulkDeletePracQuestions,
  fetchQuestions,
  fetchSubjectsByType,
  fetchSubtopicsByTopic,
  fetchTopicsBySubject,
} from "@/redux/slices/admin/cms/practiceSlice";
import { parseIfJson } from "@/utils/windowMW";
import { usePermissions, PERMISSION_VALUES } from "@/hooks/usepermission";

const { Text, Title } = Typography;

// Component to render question options based on type
const QuestionOptions = React.memo(
  ({ questionContent, answer, questionType }) => {
    const renderOptions = () => {
      // Extract options from questionContent (excluding the question itself)
      const options = Object.entries(questionContent).filter(([key]) =>
        key.startsWith("option ")
      );

      if (options.length === 0) return null;

      // Get correct answer for display
      const correctAnswer =
        answer?.singleChoice || answer?.multipleChoice || {};

      switch (questionType) {
        case "Single Choice":
          return (
            <div className={styles.questionOptions}>
              <div className={styles.optionsHeader}>
                <CheckCircleOutlined className={styles.headerIcon} />
                <Text className={styles.optionsTitle}>
                  Select the correct option:
                </Text>
              </div>
              <Radio.Group disabled className={styles.optionsGroup}>
                <Space
                  orientation="vertical"
                  size="small"
                  className={styles.optionsContainer}
                >
                  {options.map(([optionKey, optionValue]) => {
                    const isCorrect = correctAnswer[optionKey];
                    return (
                      <div
                        key={optionKey}
                        className={`${styles.optionItem} ${isCorrect
                            ? styles.correctOption
                            : styles.regularOption
                          }`}
                      >
                        <Radio
                          value={optionKey}
                          checked={isCorrect}
                          className={styles.optionRadio}
                        >
                          <span
                            className={styles.optionText}
                            dangerouslySetInnerHTML={{
                              __html: parseIfJson(optionValue),
                            }}
                          />
                        </Radio>
                      </div>
                    );
                  })}
                </Space>
              </Radio.Group>
            </div>
          );

        case "Multiple Choice":
          return (
            <div className={styles.questionOptions}>
              <div className={styles.optionsHeader}>
                <CheckCircleOutlined className={styles.headerIcon} />
                <Text className={styles.optionsTitle}>
                  Select all correct options:
                </Text>
              </div>
              <div className={styles.optionsGroup}>
                <Space
                  orientation="vertical"
                  size="small"
                  className={styles.optionsContainer}
                >
                  {options.map(([optionKey, optionValue]) => {
                    const isCorrect = correctAnswer[optionKey];
                    return (
                      <div
                        key={optionKey}
                        className={`${styles.optionItem} ${isCorrect
                            ? styles.correctOption
                            : styles.regularOption
                          }`}
                      >
                        <Checkbox
                          checked={isCorrect}
                          disabled
                          className={styles.optionCheckbox}
                        >
                          <span
                            className={styles.optionText}
                            dangerouslySetInnerHTML={{
                              __html: parseIfJson(optionValue),
                            }}
                          />
                        </Checkbox>
                      </div>
                    );
                  })}
                </Space>
              </div>
            </div>
          );

        default:
          // For other question types, just display options as list
          return (
            <div className={styles.questionOptions}>
              <div className={styles.optionsHeader}>
                <CheckCircleOutlined className={styles.headerIcon} />
                <Text className={styles.optionsTitle}>Available options:</Text>
              </div>
              <div className={styles.optionsContainer}>
                {options.map(([optionKey, optionValue]) => (
                  <div key={optionKey} className={styles.optionListItem}>
                    <span className={styles.optionLabel}>{optionKey}:</span>
                    <span
                      className={styles.optionText}
                      dangerouslySetInnerHTML={{
                        __html: parseIfJson(optionValue),
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
      }
    };

    return renderOptions();
  }
);

QuestionOptions.displayName = "QuestionOptions";

const QuestionRow = React.memo(({ q, index, isSelected, onSelect, onEdit, onDelete }) => {
  const { canAccess, getPermissionMessage } = usePermissions();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const { _id, questionContent, answer, questionType, scoreSettings } = q;
  const score = scoreSettings?.pointsForCorrectAns || 0;

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
            onClick={() => setIsExpanded(prev => !prev)}
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
            <span className={`${listStyles.badge} ${listStyles.pts}`}>{score} pts</span>
            <span className={`${listStyles.badge} ${listStyles.type}`}>{questionType}</span>
            {q.difficulty && <span className={`${listStyles.badge} ${listStyles.difficulty}`} style={{ textTransform: 'capitalize' }}>{q.difficulty}</span>}
          </div>
          
          <div className={listStyles.actionIcons}>
            <Tooltip title={!canAccess(PERMISSION_VALUES.EDIT) ? getPermissionMessage(PERMISSION_VALUES.EDIT) : ""}>
              <button className={listStyles.edit} disabled={!canAccess(PERMISSION_VALUES.EDIT)} onClick={() => onEdit(_id)}>
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
          <div dangerouslySetInnerHTML={{ __html: parseIfJson(questionContent?.question) }} style={{ marginBottom: 16 }} />
          
          <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {q.difficulty && <Tag color="blue" style={{ textTransform: 'capitalize' }}>Difficulty: {q.difficulty}</Tag>}
            {q.concept && <Tag color="purple">Concept: {q.concept}</Tag>}
            {q.companyTags && q.companyTags.length > 0 && (() => {
              const companies = q.companyTags.map(t => t.companyName).filter(Boolean).join(', ');
              const exams = q.companyTags.map(t => t.examName).filter(Boolean).join(', ');
              const years = q.companyTags.map(t => t.year).filter(Boolean).join(', ');
              const sections = q.companyTags.map(t => t.sectionName).filter(Boolean).join(', ');
              
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

          <QuestionOptions questionContent={questionContent} answer={answer} questionType={questionType} />
        </div>
      )}
    </div>
  );
});
QuestionRow.displayName = "QuestionRow";

const QuestionList = React.memo(({ questions, onEdit, onDelete, selectedSet = new Set(), onSelect }) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(50);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [questions.length]);

  if (!questions.length) {
    return (
      <div className={styles.emptyState}>
        <QuestionCircleOutlined className={styles.emptyIcon} />
        <Title level={4} className={styles.emptyTitle}>
          No questions found
        </Title>
        <Text className={styles.emptyDescription}>
          Create your first question to get started with building assessments.
        </Text>
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

export default function QuestionsPage({ 
  subjectId: propSubjectId, 
  topicId: propTopicId, 
  subTopicId: propSubTopicId,
  isEmbedded = false,
  hideActions = false
}) {
  const router = useRouter();
  const dispatch = useDispatch();
  const [bulkModalOpen, setBulkModalOpen] = React.useState(false);
  const params = useParams();
  const currentPath = usePathname();
  const [filterType, setFilterType] = React.useState("All");
  const [filterPoints, setFilterPoints] = React.useState("All");
  const [selectedSet, setSelectedSet] = React.useState(new Set());
  const selectedQuestions = useMemo(() => Array.from(selectedSet), [selectedSet]);

  const { canAccess, getPermissionMessage } = usePermissions();

  // Destructure params with defaults
  const subject_slug = propSubjectId || params?.subject_slug || "";
  const topic_slug = propTopicId || params?.topic_slug || "";
  const subtopic_slug = propSubTopicId !== undefined ? propSubTopicId : (params?.subtopic_slug || "");

  // Use selector with shallow equality check
  const questions = useSelector((state) => state.adminPractice.questions);
  const loading = useSelector((state) => state.adminPractice.status === "loading");
  const isTopicLevel = isEmbedded || subtopic_slug === "topic-questions";

  const filteredQuestions = useMemo(() => {
    let result = questions || [];
    
    // Filter out subtopic questions if we are at the topic level
    if (isTopicLevel) {
      result = result.filter(q => !q.subTopicId);
    }

    if (filterType !== "All") {
      result = result.filter(q => q.questionType === filterType);
    }
    if (filterPoints !== "All") {
      result = result.filter(q => (q.scoreSettings?.pointsForCorrectAns || 0) === Number(filterPoints));
    }
    return result;
  }, [questions, filterType, filterPoints, isTopicLevel]);

  // Reset selection when filters change or questions change
  useEffect(() => {
    setSelectedSet(new Set());
  }, [filterType, filterPoints, questions]);

  const availablePoints = useMemo(() => {
    const pointsSet = new Set((questions || []).map(q => q.scoreSettings?.pointsForCorrectAns || 0));
    return Array.from(pointsSet).sort((a, b) => a - b);
  }, [questions]);

  // Memoized callback functions to prevent unnecessary re-renders
  const handleEdit = useCallback(
    (questionId) => {
      if (!canAccess(PERMISSION_VALUES.EDIT)) {
        message.info(getPermissionMessage(PERMISSION_VALUES.EDIT));
        return;
      }
      const basePath = isEmbedded ? `${currentPath}/topic-questions` : currentPath;
      router.push(`${basePath}/${questionId}`);
    },
    [router, currentPath, isEmbedded, canAccess, getPermissionMessage]
  );

  const handleDelete = useCallback(
    (questionId) => {
      if (!canAccess(PERMISSION_VALUES.DELETE)) {
        message.info(getPermissionMessage(PERMISSION_VALUES.DELETE));
        return;
      }
      dispatch(deleteQuestion(questionId));
    },
    [dispatch, canAccess, getPermissionMessage]
  );

  const handleSelect = useCallback((id, checked) => {
    setSelectedSet((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(
    (checked) => {
      if (checked) {
        setSelectedSet(new Set(filteredQuestions.map((q) => q._id)));
      } else {
        setSelectedSet(new Set());
      }
    },
    [filteredQuestions]
  );

  const handleBulkDelete = useCallback(() => {
    if (!canAccess(PERMISSION_VALUES.DELETE)) {
      message.info(getPermissionMessage(PERMISSION_VALUES.DELETE));
      return;
    }
    const hide = message.loading(`Deleting ${selectedQuestions.length} questions...`, 0);
    dispatch(bulkDeletePracQuestions(selectedQuestions))
      .unwrap()
      .then((deletedIds) => {
        hide();
        message.success(`${deletedIds.length} questions deleted successfully.`);
        setSelectedSet(new Set());
      })
      .catch((err) => {
        hide();
        console.error(err);
        message.error("Failed to delete some questions.");
      });
  }, [selectedQuestions, dispatch, canAccess, getPermissionMessage]);

  const handleAdd = useCallback(() => {
    if (!canAccess(PERMISSION_VALUES.CREATE)) {
      message.info(getPermissionMessage(PERMISSION_VALUES.CREATE));
      return;
    }
    const basePath = isEmbedded ? `${currentPath}/topic-questions` : currentPath;
    router.push(`${basePath}/new-question`);
  }, [router, currentPath, isEmbedded, canAccess, getPermissionMessage]);

  // Optimize data fetching with error handling and loading states
  useEffect(() => {
    if (!topic_slug || !subject_slug || (!subtopic_slug && !isTopicLevel)) {
      console.warn("Missing required URL parameters");
      return;
    }

    let isCancelled = false;

    const fetchData = async () => {
      try {
        const promises = [
          dispatch(fetchSubtopicsByTopic(topic_slug)).unwrap(),
          dispatch(fetchTopicsBySubject(subject_slug)).unwrap(),
          dispatch(fetchSubjectsByType("technical")).unwrap(),
          dispatch(fetchQuestions({ 
            subtopicId: isTopicLevel ? undefined : subtopic_slug,
            topicId: isTopicLevel ? topic_slug : undefined 
          })).unwrap(),
        ];

        await Promise.all(promises);
      } catch (error) {
        if (!isCancelled) {
          console.error("Failed to fetch data:", error);
        }
      }
    };

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [dispatch, topic_slug, subject_slug, subtopic_slug]);

  // Early return for loading state
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <PracticeBreadcrumbs />
        </div>
        <Divider style={{ margin: "1rem 0" }} />
        <div className={styles.loadingState}>
          <Skeleton active paragraph={{ rows: 6 }} />
        </div>
      </div>
    );
  }

  return (
    <div className={isEmbedded ? "" : listStyles.pageContainer} style={isEmbedded ? { marginTop: '1rem', width: '100%' } : {}}>
      {!hideActions && (
        <div className={listStyles.topActionRow}>
          <div className={listStyles.actionsLeft} style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            {!isEmbedded && <PracticeBreadcrumbs />}
          <Select
            value={filterType}
            onChange={(val) => setFilterType(val)}
            style={{ width: 160 }}
            options={[
              { value: 'All', label: 'All Types' },
              { value: 'Single Choice', label: 'Single Choice' },
              { value: 'Multiple Choice', label: 'Multiple Choice' },
              { value: 'True/False', label: 'True/False' },
              { value: 'Text', label: 'Text' },
              { value: 'Coding Question', label: 'Coding Question' },
            ]}
          />
          <Select
            value={filterPoints}
            onChange={(val) => setFilterPoints(val)}
            style={{ width: 160 }}
            options={[
              { value: 'All', label: 'All Points' },
              ...availablePoints.map(p => ({ value: p, label: `${p} Point${p !== 1 ? 's' : ''}` }))
            ]}
          />
        </div>
        <div className={listStyles.actionsRight}>
          <Tooltip title={!canAccess(PERMISSION_VALUES.CREATE) ? getPermissionMessage(PERMISSION_VALUES.CREATE) : ""}>
            <button
              className={listStyles.btnPrimary}
              onClick={handleAdd}
              disabled={loading || !canAccess(PERMISSION_VALUES.CREATE)}
            >
              + Create Question
            </button>
          </Tooltip>

          <Tooltip title={!canAccess(PERMISSION_VALUES.CREATE) ? getPermissionMessage(PERMISSION_VALUES.CREATE) : ""}>
            <button
              className={listStyles.btnSecondary}
              onClick={() => setBulkModalOpen(true)}
              disabled={loading || !canAccess(PERMISSION_VALUES.CREATE)}
            >
              <CloudUploadOutlined /> Bulk Upload
            </button>
          </Tooltip>
        </div>
      </div>
      )}

      <BulkUploadModal
        open={bulkModalOpen}
        onCancel={() => setBulkModalOpen(false)}
        subjectId={subject_slug}
        topicId={topic_slug}
        subTopicId={isTopicLevel ? undefined : subtopic_slug}
        excludedTypes={["Coding Question"]}
      />

      <div style={{ marginTop: "1rem", marginBottom: "0.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {filteredQuestions.length > 0 && (
          <Checkbox
            checked={selectedSet.size > 0 && selectedSet.size === filteredQuestions.length}
            indeterminate={selectedSet.size > 0 && selectedSet.size < filteredQuestions.length}
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

      <div>
        <QuestionList
          questions={filteredQuestions}
          onEdit={handleEdit}
          onDelete={handleDelete}
          selectedSet={selectedSet}
          onSelect={handleSelect}
        />
      </div>
    </div>
  );
}
