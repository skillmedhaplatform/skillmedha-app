"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Modal,
  Button,
  Checkbox,
  Select,
  Collapse,
  Empty,
  Pagination,
  Spin,
  message,
} from "antd";
import { debounce } from "lodash";
import { GetAllQuestions } from "@/redux/slices/company/test";
import styles from "../list.module.scss";

const { Panel } = Collapse;

const DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
  { value: "expert", label: "Expert" },
];

const QUESTION_TYPE_OPTIONS = [
  { value: "Single Choice", label: "Single Choice" },
  { value: "Multiple Choice", label: "Multiple Choice" },
  { value: "True/False", label: "True / false" },
  // { value: "Fill in the Blanks", label: "Fill in the Blanks" },
  { value: "Audio", label: "Audio" },
  { value: "Video", label: "Video" },
  { value: "Text", label: "Text" },
];

export default function SkillLibraryModal({
  open,
  onClose,
  onAddQuestions,
  preSelectedQuestions = [], // Add this prop for already selected question IDs
}) {
  const dispatch = useDispatch();

  // Redux state
  const { allQuestions } = useSelector((state) => state?.tests || {});
  const {
    data: modalQuestions = [],
    pagination: modalPagination,
    status: modalStatus = "idle",
    error: modalError,
  } = allQuestions || {};

  // Modal state management
  const [modalSelectedQuestions, setModalSelectedQuestions] = useState([]);
  const [modalCurrentPage, setModalCurrentPage] = useState(1);
  const [modalPageSize, setModalPageSize] = useState(10);
  const [modalFilters, setModalFilters] = useState({
    difficulty: null,
    tags: [],
    questionType: null,
    type: null,
  });
  const [modalSelectAll, setModalSelectAll] = useState(false);

  // Get unique tags/skills from modalQuestions for filter options
  const getUniqueSkills = useCallback(() => {
    if (!modalQuestions?.length) return [];

    const allTags =
      modalQuestions?.reduce((acc, question) => {
        const tags = question?.tags || [];
        return [...acc, ...tags];
      }, []) || [];

    // Remove duplicates and filter out empty values
    return [...new Set(allTags)].filter(Boolean).map((tag) => ({
      value: tag,
      label: tag,
    }));
  }, [modalQuestions]);

  // Debounced API call function
  const debouncedFetchQuestions = useCallback(
    debounce((page, size, filterObj) => {
      dispatch(
        GetAllQuestions({
          pageNo: page,
          limit: size,
          filters: filterObj,
        })
      );
    }, 300),
    [dispatch]
  );

  // Handle API errors
  useEffect(() => {
    if (modalStatus === "failed" && modalError) {
      message.error(`Failed to load questions: ${modalError}`);
    }
  }, [modalStatus, modalError]);

  // Reset modal state when opened and initialize with pre-selected questions
  useEffect(() => {
    if (open) {
      // Initialize with pre-selected questions
      setModalSelectedQuestions(preSelectedQuestions || []);
      setModalCurrentPage(1);
      setModalFilters({
        difficulty: null,
        tags: [],
        questionType: null,
        type: null,
      });
      setModalSelectAll(false);

      // Fetch initial data
      debouncedFetchQuestions(1, modalPageSize, {
        difficulty: null,
        tags: [],
        questionType: null,
        type: null,
      });
    }
  }, [open, modalPageSize, debouncedFetchQuestions, preSelectedQuestions]);

  // Update select all state based on current questions and selections
  useEffect(() => {
    if (modalQuestions?.length > 0) {
      const currentPageQuestionIds = modalQuestions.map((q) => q._id);
      const selectedOnCurrentPage = currentPageQuestionIds.filter((id) =>
        modalSelectedQuestions.includes(id)
      );

      setModalSelectAll(
        selectedOnCurrentPage.length === currentPageQuestionIds.length &&
          currentPageQuestionIds.length > 0
      );
    }
  }, [modalQuestions, modalSelectedQuestions]);

  const parseIfJson = (string) => {
    try {
      return JSON.parse(string);
    } catch (error) {
      return string;
    }
  };

  const handleQuestionSelect = (questionId) => {
    setModalSelectedQuestions((prev) => {
      if (prev?.includes(questionId)) {
        return prev?.filter((id) => id !== questionId) || [];
      } else {
        return [...(prev || []), questionId];
      }
    });
  };

  const handleSelectAll = (e) => {
    const checked = e?.target?.checked;
    const currentPageQuestionIds =
      modalQuestions?.map((q) => q?._id)?.filter(Boolean) || [];

    setModalSelectedQuestions((prev) => {
      if (checked) {
        // Add all current page questions to selection (avoiding duplicates)
        const newSelections = [
          ...new Set([...(prev || []), ...currentPageQuestionIds]),
        ];
        return newSelections;
      } else {
        // Remove all current page questions from selection
        return (prev || []).filter(
          (id) => !currentPageQuestionIds.includes(id)
        );
      }
    });
  };

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...modalFilters, [filterType]: value };
    setModalFilters(newFilters);
    setModalCurrentPage(1);
    // Don't reset selected questions when filtering - keep existing selections

    // Fetch filtered questions
    debouncedFetchQuestions(1, modalPageSize, newFilters);
  };

  const handlePageChange = (page, size) => {
    setModalCurrentPage(page);
    if (size !== modalPageSize) {
      setModalPageSize(size);
    }

    // Fetch questions for the new page
    debouncedFetchQuestions(page, size, modalFilters);
  };

  const handleAddSelectedQuestions = () => {
    const selectedQuestionObjects =
      modalQuestions?.filter((q) => modalSelectedQuestions?.includes(q?._id)) ||
      [];

    if (selectedQuestionObjects?.length === 0) {
      message.warning("Please select questions to add!");
      return;
    }

    onAddQuestions(selectedQuestionObjects);
    onClose();
  };

  // Render question options
  const renderOptions = (questionContent, answer) => {
    if (!questionContent) return null;

    const optionKeys =
      Object.keys(questionContent || {})
        ?.filter((key) => key?.toLowerCase()?.includes("option"))
        ?.sort() || [];

    if (optionKeys?.length === 0) return null;

    return (
      <div className={styles.options}>
        {optionKeys?.map((optionKey, index) => {
          const value = questionContent?.[optionKey];
          const isCorrect =
            answer?.singleChoice?.[optionKey] === true ||
            answer?.correctAnswer === optionKey;

          return (
            <div
              key={optionKey}
              className={`${styles.option} ${
                isCorrect ? styles.correctOption : ""
              }`}
            >
              {String.fromCharCode(97 + index).toUpperCase() + "."}{" "}
              <div
                dangerouslySetInnerHTML={{ __html: parseIfJson(value || "") }}
              />
              {isCorrect && <span className={styles.correctIndicator}> ✓</span>}
            </div>
          );
        })}
      </div>
    );
  };

  const EmptyState = ({ message: emptyMessage }) => (
    <div className={styles.emptyState}>
      <Empty
        description={emptyMessage || "No questions found"}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    </div>
  );

  const ModalQuestionList = () => {
    if (modalStatus === "loading") {
      return (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <Spin size="large" />
        </div>
      );
    }

    if (!modalQuestions?.length) {
      return <EmptyState message="No questions found in skill library" />;
    }

    return (
      <>
        {modalQuestions?.map((q, i) => {
          const questionNumber = (modalCurrentPage - 1) * modalPageSize + i + 1;
          const isSelected = modalSelectedQuestions?.includes(q?._id);
          const isPreSelected = preSelectedQuestions?.includes(q?._id);

          return (
            <div key={q?._id} className={styles.questionItem}>
              <Collapse bordered={false} ghost>
                <Panel
                  header={
                    <div>
                      <div className={styles.questionItemHeader}>
                        <div className={styles.questionItemHeaderLeft}>
                          <Checkbox
                            checked={isSelected}
                            onChange={(e) => {
                              e?.stopPropagation();
                              handleQuestionSelect(q?._id);
                            }}
                          />
                          <span className={styles.questionText}>
                            {`Question ${questionNumber}`}
                            {isPreSelected && (
                              <span
                                style={{
                                  marginLeft: "8px",
                                  color: "#52c41a",
                                  fontSize: "12px",
                                }}
                              >
                                (Previously Selected)
                              </span>
                            )}
                          </span>
                        </div>

                        <div className={styles.questionItemHeaderRight}>
                          {q?.questionType && (
                            <div className={styles.questionType}>
                              {q?.questionType?.toUpperCase()}
                            </div>
                          )}
                          {q?.difficulty && (
                            <div className={styles.difficulty}>
                              {q?.difficulty?.toUpperCase()}
                            </div>
                          )}
                          {q?.tags?.[0] && (
                            <div className={styles.skill}>
                              {q?.tags?.[0]?.toUpperCase()}
                            </div>
                          )}
                          <div className={styles.score}>
                            Score: {+q?.scoreSettings?.pointsForCorrectAns || 0}
                          </div>
                        </div>
                      </div>

                      <div
                        dangerouslySetInnerHTML={{
                          __html: parseIfJson(
                            q?.questionContent?.question || q?.question || ""
                          ),
                        }}
                        className={styles.question}
                      />
                      {q?.resources && q?.resources?.type === "audio" && (
                        <audio
                          className={styles.media}
                          controls
                          preload="none"
                          src={q?.resources?.url}
                        >
                          Your browser does not support the audio element.
                        </audio>
                      )}
                      {q?.resources && q?.resources?.type === "video" && (
                        <video
                          className={styles.media}
                          controls
                          preload="metadata"
                          playsInline
                          src={q?.resources?.url}
                        >
                          Your browser does not support the video tag.
                        </video>
                      )}
                    </div>
                  }
                  key={q?._id}
                >
                  {(() => {
                    const hasOptions =
                      q?.questionContent &&
                      Object.keys(q.questionContent).some((key) =>
                        key.startsWith("option")
                      );

                    if (hasOptions) {
                      return renderOptions(q?.questionContent, q?.answer);
                    } else {
                      return (
                        <div>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: parseIfJson(q?.answer?.explanation || ""),
                            }}
                          />
                        </div>
                      );
                    }
                  })()}
                </Panel>
              </Collapse>
            </div>
          );
        })}
      </>
    );
  };

  const uniqueSkills = getUniqueSkills();

  // Calculate current page question selections for select all
  const currentPageQuestionIds = modalQuestions?.map((q) => q._id) || [];
  const selectedOnCurrentPage = currentPageQuestionIds.filter((id) =>
    modalSelectedQuestions.includes(id)
  );

  return (
    <Modal
      title="Add Questions from Skill Library"
      open={open}
      onCancel={onClose}
      centered={true}
      width={1100}
      footer={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Pagination in footer */}
          <div>
            {modalPagination &&
              (modalPagination?.totalQuestions || 0) > modalPageSize && (
                <Pagination
                  current={modalCurrentPage}
                  total={modalPagination?.totalQuestions || 0}
                  pageSize={modalPageSize}
                  onChange={handlePageChange}
                  onShowSizeChange={(current, size) =>
                    handlePageChange(current, size)
                  }
                  showTotal={(total, range) =>
                    `${range?.[0] || 0}-${range?.[1] || 0} of ${
                      total || 0
                    } questions`
                  }
                  pageSizeOptions={["5", "10", "20", "50"]}
                  showSizeChanger
                  size="small"
                />
              )}
          </div>

          <div style={{ fontSize: "16px", color: "#25a3a6" }}>
            Total Selected: {modalSelectedQuestions?.length || 0}
          </div>
          {/* Action buttons */}
          <div style={{ display: "flex", gap: "8px" }}>
            <Button key="cancel" onClick={onClose}>
              Cancel
            </Button>
            <Button
              key="add"
              type="primary"
              onClick={handleAddSelectedQuestions}
              disabled={
                (modalSelectedQuestions?.length || 0) === 0 ||
                modalStatus === "loading"
              }
            >
              Add Selected Questions ({modalSelectedQuestions?.length || 0})
            </Button>
          </div>
        </div>
      }
    >
      {/* Modal Header with filters */}
      <div className={styles.header} style={{ marginBottom: "16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <Checkbox
            checked={modalSelectAll}
            onChange={handleSelectAll}
            indeterminate={
              selectedOnCurrentPage.length > 0 &&
              selectedOnCurrentPage.length < currentPageQuestionIds.length
            }
            disabled={modalStatus === "loading"}
          >
            Select All on Page ({selectedOnCurrentPage.length} of{" "}
            {currentPageQuestionIds.length} selected)
          </Checkbox>

          <Select
            showSearch
            placeholder="Filter by Difficulty"
            optionFilterProp="label"
            style={{ minWidth: "10rem" }}
            allowClear
            value={modalFilters?.difficulty}
            onChange={(value) => handleFilterChange("difficulty", value)}
            disabled={modalStatus === "loading"}
            options={DIFFICULTY_OPTIONS}
          />

          <Select
            showSearch
            placeholder="Filter by Question Type"
            optionFilterProp="label"
            style={{ minWidth: "10rem" }}
            allowClear
            value={modalFilters?.questionType}
            onChange={(value) => handleFilterChange("questionType", value)}
            disabled={modalStatus === "loading"}
            options={QUESTION_TYPE_OPTIONS}
          />

          <Select
            mode="multiple"
            showSearch
            placeholder="Filter by Skills"
            optionFilterProp="label"
            style={{ minWidth: "12rem" }}
            allowClear
            value={modalFilters?.tags}
            onChange={(value) => handleFilterChange("tags", value)}
            disabled={modalStatus === "loading"}
            options={uniqueSkills}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          />
        </div>
      </div>

      {/* Modal Question List */}
      <div
        className={styles.questionListCont}
        style={{ minHeight: "600px", maxHeight: "600px", overflowY: "auto" }}
      >
        <ModalQuestionList />
      </div>
    </Modal>
  );
}
