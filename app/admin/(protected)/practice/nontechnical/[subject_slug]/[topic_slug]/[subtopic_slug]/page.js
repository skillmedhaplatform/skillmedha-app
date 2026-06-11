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
} from "@ant-design/icons";
import BulkUploadModal from "@/app/admin/(protected)/practice/Practice_utils/BulkUploadModal";
import styles from "../../../../practiceStyles.module.scss";
import PracticeBreadcrumbs from "@/app/admin/(protected)/practice/Practice_utils/practiceBreadcrumbs";
import {
  deleteQuestion,
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
              {/* <div className={styles.optionsHeader}>
                <CheckCircleOutlined className={styles.headerIcon} />
                <Text className={styles.optionsTitle}>
                  Select the correct option:
                </Text>
              </div> */}
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
                        className={`${styles.optionItem} ${
                          isCorrect
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
                        className={`${styles.optionItem} ${
                          isCorrect
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

// Memoized QuestionList component to prevent unnecessary re-renders
const QuestionList = React.memo(({ questions, onEdit, onDelete }) => {
  const { canAccess, getPermissionMessage } = usePermissions();
  // Memoize collapse items to avoid recreation on each render
  const collapseItems = useMemo(
    () =>
      questions.map((q, index) => {
        const {
          _id,
          questionContent,
          answer,
          questionType,
          scoreSettings,
          resources,
        } = q;

        return {
          key: _id,
          label: (
            <div className={styles.questionHeader}>
              <div className={styles.questionTitleSection}>
                <span className={styles.questionNumber}>Q{index + 1}.</span>
                <div className={styles.questionText}>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: parseIfJson(questionContent?.question),
                    }}
                  />
                  {/* Resources */}
                  {questionType == "Audio" && (
                    <div className={styles.resourceSection}>
                      <div className={styles.sectionHeader}>
                        <SoundOutlined className={styles.sectionIcon} />
                        <Text className={styles.sectionTitle}>
                          Audio Resource
                        </Text>
                      </div>
                      <audio
                        controls
                        src={resources?.url}
                        preload="none"
                        className={styles.audioPlayer}
                      />
                    </div>
                  )}

                  {questionType == "Video" && (
                    <div className={styles.resourceSection}>
                      <div className={styles.sectionHeader}>
                        <VideoCameraOutlined className={styles.sectionIcon} />
                        <Text className={styles.sectionTitle}>
                          Video Resource
                        </Text>
                      </div>
                      <video
                        controls
                        src={resources?.url}
                        preload="none"
                        className={styles.videoPlayer}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.questionMeta}>
                <div className={styles.metaTags}>
                  <Tag className={styles.scoreTag} color="blue">
                    {scoreSettings?.pointsForCorrectAns || 0} pts
                  </Tag>
                  <Tag className={styles.typeTag} color="green">
                    {questionType}
                  </Tag>
                </div>
                <Space className={styles.actionButtons} size="small">
                  {/* Edit button with permission tooltip */}
                  <Tooltip
                    title={
                      !canAccess(PERMISSION_VALUES.EDIT)
                        ? getPermissionMessage(PERMISSION_VALUES.EDIT)
                        : ""
                    }
                  >
                    <span>
                      <Button
                        size="small"
                        icon={<EditOutlined />}
                        className={styles.editBtn}
                        type="text"
                        disabled={!canAccess(PERMISSION_VALUES.EDIT)}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!canAccess(PERMISSION_VALUES.EDIT)) {
                            message.info(
                              getPermissionMessage(PERMISSION_VALUES.EDIT)
                            );
                            return;
                          }
                          onEdit(_id);
                        }}
                      />
                    </span>
                  </Tooltip>

                  {/* Delete with Popconfirm + permission tooltip */}
                  <Tooltip
                    title={
                      !canAccess(PERMISSION_VALUES.DELETE)
                        ? getPermissionMessage(PERMISSION_VALUES.DELETE)
                        : ""
                    }
                  >
                    <span>
                      <Popconfirm
                        title="Are you sure you want to delete this item?"
                        okText="Yes"
                        cancelText="No"
                        onConfirm={(e) => {
                          e?.stopPropagation();
                          if (!canAccess(PERMISSION_VALUES.DELETE)) {
                            message.info(
                              getPermissionMessage(PERMISSION_VALUES.DELETE)
                            );
                            return;
                          }
                          onDelete(_id);
                        }}
                        onCancel={(e) => {
                          e?.stopPropagation();
                        }}
                      >
                        <Button
                          size="small"
                          icon={<DeleteOutlined />}
                          className={styles.deleteBtn}
                          type="text"
                          danger
                          disabled={!canAccess(PERMISSION_VALUES.DELETE)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </Popconfirm>
                    </span>
                  </Tooltip>
                </Space>
              </div>
            </div>
          ),
          children: (
            <div className={styles.questionBody}>
              {/* Display Options */}
              <QuestionOptions
                questionContent={questionContent}
                answer={answer}
                questionType={questionType}
              />

              {/* Explanation */}
              {answer?.explanation && (
                <div className={styles.explanationSection}>
                  <div className={styles.sectionHeader}>
                    <FileTextOutlined className={styles.sectionIcon} />
                    <Text className={styles.sectionTitle}>Explanation</Text>
                  </div>
                  <div className={styles.explanationContent}>
                    <span
                      dangerouslySetInnerHTML={{
                        __html: parseIfJson(answer.explanation),
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ),
        };
      }),
    [questions, onEdit, onDelete]
  );

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

  return (
    <div className={styles.questionsWrapper}>
      <Collapse
        accordion
        className={styles.questionsCollapse}
        items={collapseItems}
        ghost={false}
        expandIcon={({ isActive }) => (
          <div
            className={`${styles.expandIcon} ${isActive ? styles.active : ""}`}
          >
            ▼
          </div>
        )}
      />
    </div>
  );
});

QuestionList.displayName = "QuestionList";

export default function QuestionsPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [bulkModalOpen, setBulkModalOpen] = React.useState(false);
  const params = useParams();
  const currentPath = usePathname();

  const { canAccess, getPermissionMessage } = usePermissions();

  // Destructure params with defaults
  const {
    subject_slug = "",
    topic_slug = "",
    subtopic_slug = "",
  } = params || {};

  // Use selector with shallow equality check
  const questions = useSelector((state) => state.adminPractice.questions);
  const loading = useSelector((state) => state.adminPractice.loading);

  // Memoized callback functions to prevent unnecessary re-renders
  const handleEdit = useCallback(
    (questionId) => {
      if (!canAccess(PERMISSION_VALUES.EDIT)) {
        message.info(getPermissionMessage(PERMISSION_VALUES.EDIT));
        return;
      }
      router.push(`${currentPath}/${questionId}`);
    },
    [router, currentPath, canAccess, getPermissionMessage]
  );

  const handleDelete = useCallback(
    (questionId) => {
      if (!canAccess(PERMISSION_VALUES.DELETE)) {
        message.info(getPermissionMessage(PERMISSION_VALUES.DELETE));
        return;
      }
      console.log("Delete question:", questionId);
      dispatch(deleteQuestion(questionId));
    },
    [dispatch, canAccess, getPermissionMessage]
  );

  const handleAdd = useCallback(() => {
    if (!canAccess(PERMISSION_VALUES.CREATE)) {
      message.info(getPermissionMessage(PERMISSION_VALUES.CREATE));
      return;
    }
    router.push(`${currentPath}/new-question`);
  }, [router, currentPath, canAccess, getPermissionMessage]);

  // Optimize data fetching with error handling and loading states
  useEffect(() => {
    if (!topic_slug || !subject_slug || !subtopic_slug) {
      console.warn("Missing required URL parameters");
      return;
    }

    let isCancelled = false;

    const fetchData = async () => {
      try {
        const promises = [
          dispatch(fetchSubtopicsByTopic(topic_slug)).unwrap(),
          dispatch(fetchTopicsBySubject(subject_slug)).unwrap(),
          dispatch(fetchSubjectsByType("nontechnical")).unwrap(),
          dispatch(fetchQuestions({ subtopicId: subtopic_slug })).unwrap(),
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
          <Text>Loading questions...</Text>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <PracticeBreadcrumbs />
        <Tooltip
          title={
            !canAccess(PERMISSION_VALUES.CREATE)
              ? getPermissionMessage(PERMISSION_VALUES.CREATE)
              : ""
          }
        >
          <>
            <Button
              type="primary"
              onClick={handleAdd}
              className={styles.createButton}
              disabled={loading || !canAccess(PERMISSION_VALUES.CREATE)}
            >
              + Create Question
            </Button>
          </>
        </Tooltip>


        <Tooltip
          title={
            !canAccess(PERMISSION_VALUES.CREATE)
              ? getPermissionMessage(PERMISSION_VALUES.CREATE)
              : ""
          }
        >
          <span>
            <Button
              type="default"
              icon={<CloudUploadOutlined />}
              onClick={() => setBulkModalOpen(true)}
              className={styles.createButton}
              style={{ marginLeft: "1rem" }}
              disabled={loading || !canAccess(PERMISSION_VALUES.CREATE)}
            >
              Bulk Upload
            </Button>
          </span>
        </Tooltip>
      </div>

      <BulkUploadModal 
        open={bulkModalOpen}
        onCancel={() => setBulkModalOpen(false)}
        subjectId={subject_slug}
        topicId={topic_slug}
        subTopicId={subtopic_slug}
        excludedTypes={["Coding Question"]}
      />
      
      <Divider style={{ margin: "1rem 0" }} />
      <div style={{ height: "60vh", overflowY: "auto", width: "100%" }}>
        <QuestionList
          questions={questions || []}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
