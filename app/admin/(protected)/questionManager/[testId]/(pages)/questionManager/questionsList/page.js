"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import styles from "./list.module.scss";
import { RiDeleteBinLine } from "react-icons/ri";
import {
  Button,
  Checkbox,
  Select,
  Collapse,
  Dropdown,
  Empty,
  Pagination,
  Skeleton,
  Tooltip,
  message,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteQuestion,
  getOneSKill,
  getSKillQuestions,
} from "@/redux/slices/admin/cms/skillsSlice";
import Image from "next/image";
import { HiDotsVertical } from "react-icons/hi";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";

import { usePermissions, PERMISSION_VALUES } from "@/hooks/usepermission";

const { Panel } = Collapse;

export default function QuestionList() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { canAccess, getPermissionMessage } = usePermissions();

  // Get pagination values from URL search params
  const currentPageFromUrl = parseInt(searchParams.get("page")) || 1;
  const pageSizeFromUrl = parseInt(searchParams.get("limit")) || 15;

  const ReduxState = useSelector((state) => ({
    allQuestions: state.skill.skillQuestions.value?.questions,
    questionsLoading: state.skill.skillQuestions.status,
    pagination: state.skill.skillQuestions.value?.pagination,
  }));

  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(currentPageFromUrl);
  const [pageSize, setPageSize] = useState(pageSizeFromUrl);
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Update URL without difficulty
  const updateURL = (page, limit) => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", page.toString());
    if (limit !== 15) params.set("limit", limit.toString());
    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : window.location.pathname;
    router.replace(newUrl, { scroll: false });
  };

  // Sync state with URL params (no difficulty)
  useEffect(() => {
    setCurrentPage(currentPageFromUrl);
    setPageSize(pageSizeFromUrl);
  }, [currentPageFromUrl, pageSizeFromUrl]);

  // Fetch questions with pagination only
  useEffect(() => {
    if (params?.testId) {
      dispatch(
        getSKillQuestions({
          skillId: params.testId,
          page: currentPage,
          limit: pageSize,
        })
      );
    }
  }, [dispatch, params?.testId, currentPage, pageSize]);

  const isNewSkill = params?.testId === "newSkill";
  useEffect(() => {
    if (!isNewSkill && params?.testId) {
      dispatch(getOneSKill({ skillId: params?.testId }));
    }
  }, [isNewSkill]);

  // Filter by difficulty on frontend only
  useEffect(() => {
    if (ReduxState.allQuestions) {
      const filteredQuestions = difficultyFilter
        ? ReduxState.allQuestions.filter(
            (q) => q.difficulty === difficultyFilter
          )
        : ReduxState.allQuestions;
      setQuestions(filteredQuestions);
    }
  }, [ReduxState.allQuestions, difficultyFilter]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedQuestions(questions.map((q) => q._id));
    } else {
      setSelectedQuestions([]);
    }
  };

  const handleQuestionSelect = (id) => {
    setSelectedQuestions((prev) =>
      prev.includes(id) ? prev.filter((qid) => qid !== id) : [...prev, id]
    );
  };

  // Multiple questions delete
  const handleDelete = async () => {
    if (!canAccess(PERMISSION_VALUES.DELETE)) {
      message.info(getPermissionMessage(PERMISSION_VALUES.DELETE));
      return;
    }
    if (selectedQuestions.length === 0) {
      alert("Please select questions to delete");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete ${selectedQuestions.length} question(s)? This action cannot be undone.`
      )
    ) {
      return;
    }

    setIsDeleting(true);

    try {
      let successCount = 0;
      let failCount = 0;
      const deletedIds = [];

      for (const questionId of selectedQuestions) {
        try {
          const result = await dispatch(deleteQuestion(questionId));
          if (deleteQuestion.fulfilled.match(result)) {
            successCount++;
            deletedIds.push(questionId);
          } else {
            failCount++;
            console.error(
              `Failed to delete question ${questionId}:`,
              result.payload
            );
          }
        } catch (error) {
          failCount++;
          console.error(`Error deleting question ${questionId}:`, error);
        }
      }

      // Update local state by removing successfully deleted questions
      if (deletedIds.length > 0) {
        setQuestions((prev) => prev.filter((q) => !deletedIds.includes(q._id)));
        setSelectedQuestions([]);
      }

      // Show appropriate message
      if (failCount === 0) {
        alert(`${successCount} question(s) deleted successfully!`);
      } else if (successCount === 0) {
        alert(`Failed to delete ${failCount} question(s). Please try again.`);
      } else {
        alert(
          `${successCount} question(s) deleted successfully, ${failCount} failed to delete.`
        );
      }
    } catch (error) {
      console.error("Delete operation failed:", error);
      alert("Error occurred while deleting questions. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Single question delete
  const handleDeleteSingleQuestion = async (questionId, e) => {
    e.stopPropagation();

    if (!canAccess(PERMISSION_VALUES.DELETE)) {
      message.info(getPermissionMessage(PERMISSION_VALUES.DELETE));
      return;
    }

    if (
      !confirm(
        "Are you sure you want to delete this question? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const result = await dispatch(deleteQuestion(questionId));

      if (deleteQuestion.fulfilled.match(result)) {
        // Update local state by removing the deleted question
        setQuestions(questions.filter((q) => q._id !== questionId));
        setSelectedQuestions((prev) => prev.filter((id) => id !== questionId));
        alert("Question deleted successfully!");
      } else {
        const errorMessage = result.payload || "Failed to delete question";
        alert(`Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Error occurred while deleting the question. Please try again.");
    }
  };

  const onDifficultyFilterChange = (value) => {
    setDifficultyFilter(value || "");
  };

  const onAddQuestionChange = (value) => {
    if (value === "manual") {
      handleAddQuestion();
    }
  };

  const handleAddQuestion = () => {
    if (!canAccess(PERMISSION_VALUES.CREATE)) {
      message.info(getPermissionMessage(PERMISSION_VALUES.CREATE));
      return;
    }
    const baseUrl = `/admin/questionManager/${params?.testId}/questionManager`;
    const newQuestionUrl = `${baseUrl}/newQuestion`;
    router.push(newQuestionUrl);
  };

  const onSearch = (value) => {
    // For future search usage.
  };

  // Handle pagination change
  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
    setSelectedQuestions([]);
    updateURL(page, size);
  };

  const handleEditQuestion = (questionId, e) => {
    e.stopPropagation();
    if (!canAccess(PERMISSION_VALUES.EDIT)) {
      message.info(getPermissionMessage(PERMISSION_VALUES.EDIT));
      return;
    }
    router.push(
      `/admin/questionManager/${params?.testId}/questionManager/${questionId}`
    );
  };

  const getDropdownItems = (questionId) => [
    {
      key: "edit",
      label: (
        <span onClick={(e) => handleEditQuestion(questionId, e)}>
          <EditOutlined /> Edit
        </span>
      ),
    },
    {
      key: "delete",
      label: (
        <span
          onClick={(e) => handleDeleteSingleQuestion(questionId, e)}
          style={{ color: "#ff4d4f" }}
        >
          <DeleteOutlined /> Delete
        </span>
      ),
    },
  ];

  const EmptyState = () => (
    <div className={styles.emptyState}>
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <div>
            <h3>No Questions Added</h3>
            <p>
              Start building your question bank by adding your first question
            </p>
          </div>
        }
      >
        <Tooltip
          title={
            !canAccess(PERMISSION_VALUES.CREATE)
              ? getPermissionMessage(PERMISSION_VALUES.CREATE)
              : ""
          }
        >
          <span>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddQuestion}
              disabled={
                params?.testId === "newSkill" ||
                !canAccess(PERMISSION_VALUES.CREATE)
              }
            >
              Add Your First Question
            </Button>
          </span>
        </Tooltip>
      </Empty>
    </div>
  );

  const parseIfJson = (string) => {
    try {
      return JSON.parse(string);
    } catch (error) {
      return string;
    }
  };

  // Updated MediaRenderer to handle resources instead of media
  const MediaRenderer = ({ resources }) => {
    if (!resources || !resources.type || !resources.url) return null;

    switch (resources.type) {
      case "audio":
        return (
          <audio controls style={{ marginTop: "1rem" }}>
            <source src={resources.url} />
            Your browser does not support the audio element.
          </audio>
        );
      case "video":
        return (
          <video
            controls
            width="480"
            style={{ marginTop: "1rem", maxWidth: "100%" }}
            src={resources.url}
          />
        );
      default:
        return null;
    }
  };

  // Function to render options from the new schema structure
  const renderOptions = (questionContent, answer) => {
    if (!questionContent) return null;

    // Get all option keys
    const optionKeys = Object.keys(questionContent)
      .filter((key) => key.startsWith("option"))
      .sort();

    if (optionKeys.length === 0) return null;

    return (
      <div className={styles.options}>
        {optionKeys.map((optionKey, index) => {
          const value = questionContent[optionKey];

          // Check if this option is correct
          let isCorrect = false;
          if (answer?.singleChoice && answer.singleChoice[optionKey]) {
            isCorrect = true;
          } else if (
            answer?.multipleChoice &&
            answer.multipleChoice[optionKey]
          ) {
            isCorrect = true;
          }

          return (
            <div
              key={optionKey}
              className={`${styles.option} ${
                isCorrect ? styles.correctOption : ""
              }`}
            >
              {String.fromCharCode(97 + index).toUpperCase() + "."}{" "}
              <div
                dangerouslySetInnerHTML={{
                  __html: parseIfJson(value),
                }}
              />
              {isCorrect && <span className={styles.correctIndicator}> ✓</span>}
            </div>
          );
        })}
      </div>
    );
  };

  if (ReduxState.questionsLoading === "loading") {
    return (
      <Skeleton
        avatar
        paragraph={{
          rows: 2,
        }}
        active={true}
      />
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Checkbox
          onChange={handleSelectAll}
          checked={
            selectedQuestions.length === questions.length &&
            questions.length > 0
          }
          indeterminate={
            selectedQuestions.length > 0 &&
            selectedQuestions.length < questions.length
          }
          disabled={questions.length === 0}
        >
          Select All Questions
        </Checkbox>

        <Tooltip
          title={
            !canAccess(PERMISSION_VALUES.DELETE)
              ? getPermissionMessage(PERMISSION_VALUES.DELETE)
              : ""
          }
        >
          <span>
            <Button
              type="primary"
              icon={<RiDeleteBinLine />}
              disabled={
                selectedQuestions.length === 0 ||
                isDeleting ||
                !canAccess(PERMISSION_VALUES.DELETE)
              }
              loading={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </span>
        </Tooltip>

        <Select
          showSearch
          placeholder="Filter by Difficulty"
          optionFilterProp="label"
          onChange={onDifficultyFilterChange}
          onSearch={onSearch}
          style={{ minWidth: "12rem" }}
          allowClear
          disabled={ReduxState.allQuestions?.length === 0}
          value={difficultyFilter || undefined}
          options={[
            { value: "easy", label: "Easy" },
            { value: "medium", label: "Medium" },
            { value: "hard", label: "Hard" },
            { value: "expert", label: "Expert" },
          ]}
        />

        <Tooltip
          title={
            !canAccess(PERMISSION_VALUES.CREATE)
              ? getPermissionMessage(PERMISSION_VALUES.CREATE)
              : ""
          }
        >
          <span>
            <Select
              showSearch
              placeholder="Add Questions"
              optionFilterProp="label"
              allowClear
              onChange={onAddQuestionChange}
              onSearch={onSearch}
              style={{ minWidth: "12rem" }}
              value={undefined}
              options={[
                {
                  value: "manual",
                  label: "Add Manually",
                },
              ]}
              disabled={
                params?.testId === "newSkill" ||
                !canAccess(PERMISSION_VALUES.CREATE)
              }
            />
          </span>
        </Tooltip>
      </div>

      <div className={styles.questionListCont}>
        {!questions || questions.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {questions.map((q, i) => {
              // Calculate the actual question number based on pagination
              const questionNumber = (currentPage - 1) * pageSize + i + 1;
              return (
                <div key={q._id} className={styles.questionItem}>
                  <Collapse bordered={false} ghost>
                    <Panel
                      header={
                        <div>
                          <div className={styles.questionItemHeader}>
                            <div className={styles.questionItemHeaderLeft}>
                              <Checkbox
                                checked={selectedQuestions.includes(q._id)}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleQuestionSelect(q._id);
                                }}
                              />
                              <span className={styles.questionText}>
                                {`Question ${questionNumber}`}
                              </span>
                            </div>

                            <div className={styles.questionItemHeaderRight}>
                              <div>{q.questionType?.toUpperCase()}</div>
                              <div>{q.difficulty?.toUpperCase()}</div>
                              <Dropdown
                                menu={{ items: getDropdownItems(q._id) }}
                                trigger={["click"]}
                                placement="bottomRight"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button
                                  type="text"
                                  icon={<HiDotsVertical />}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </Dropdown>
                            </div>
                          </div>

                          {/* Updated to use questionContent.question */}
                          <div
                            dangerouslySetInnerHTML={{
                              __html: parseIfJson(
                                q.questionContent?.question || q.question || ""
                              ),
                            }}
                            className={styles.question}
                          />

                          {/* Updated to use resources instead of media */}
                          <MediaRenderer resources={q?.resources} />

                          {/* Show explanation if available */}
                          {/* {q.answer?.explanation && (
                            <div className={styles.explanation}>
                              <strong>Explanation:</strong>
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: parseIfJson(q.answer.explanation),
                                }}
                              />
                            </div>
                          )} */}
                        </div>
                      }
                      key={q._id}
                    >
                      {/* Updated options rendering for new schema */}
                      {renderOptions(q.questionContent, q.answer)}
                    </Panel>
                  </Collapse>
                </div>
              );
            })}

            {/* Pagination Component */}
            {ReduxState.pagination && ReduxState.pagination.total > 0 && (
              <div className={styles.paginationContainer}>
                <Pagination
                  current={currentPage}
                  total={ReduxState.pagination.total}
                  pageSize={pageSize}
                  onChange={handlePageChange}
                  onShowSizeChange={handlePageChange}
                  showTotal={(total, range) =>
                    `${range[0]}-${range} of ${total} questions`
                  }
                  pageSizeOptions={["10", "20", "50", "100"]}
                  size="default"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
