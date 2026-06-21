"use client";
import React, { useState, useEffect, useMemo } from "react";
import styles from "./list.module.scss";
import {
  Button,
  Checkbox,
  Collapse,
  Empty,
  Pagination,
  message,
  Dropdown,
  Select,
  Input,
  Popover,
  Tooltip,
} from "antd";
import { PlusOutlined, DownOutlined, SearchOutlined } from "@ant-design/icons";
import AIQuestionModal from "./(components)/aiquestionModal";
import SkillLibraryModal from "./(components)/skilllibraryModal";
import {
  getOneJobAssessment,
  updateJobAssessment,
} from "@/redux/slices/company/skillMedhaData";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { useParams, useRouter } from "next/navigation";

const { Panel } = Collapse;
const { Search } = Input;

export default function QuestionListPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useParams();

  // Get data from Redux
  const singleJobAssessment = useSelector(
    (s) => s.skillmedha.singleJobAssessment
  );
  const ONEJOB = useSelector((state) => state.placement.OneJob?.value);
  const aId = ONEJOB?.data?.AssessmentId;
  const USER_DETAILS = useSelector((state) => state?.user?.singleUser || null);

  // Local state for main component (selected questions to display)
  const [selectedQuestionsForMain, setSelectedQuestionsForMain] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectAll, setSelectAll] = useState(false);
  const [hovered, setHovered] = useState(null);

  // Filtering state
  const [filters, setFilters] = useState({
    difficulty: null,
    questionType: null,
    tags: [],
    category: null,
    searchText: "",
  });

  useEffect(() => {
    if (aId) {
      dispatch(getOneJobAssessment({ id: aId }));
    }
  }, [aId]);

  // Modal states
  const [isSkillLibraryModalOpen, setIsSkillLibraryModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  // Initialize selectedQuestionsForMain when singleJobAssessment changes
  useEffect(() => {
    if (singleJobAssessment?.questionsData) {
      setSelectedQuestionsForMain(singleJobAssessment.questionsData);
    }
  }, [singleJobAssessment]);

  // Get unique filter options from questions
  const getFilterOptions = useMemo(() => {
    if (!selectedQuestionsForMain?.length)
      return { difficulties: [], questionTypes: [], tags: [], categories: [] };

    const difficulties = [
      ...new Set(
        selectedQuestionsForMain.map((q) => q?.difficulty).filter(Boolean)
      ),
    ];
    const questionTypes = [
      ...new Set(
        selectedQuestionsForMain.map((q) => q?.questionType).filter(Boolean)
      ),
    ];
    const tags = [
      ...new Set(
        selectedQuestionsForMain.flatMap((q) => q?.tags || []).filter(Boolean)
      ),
    ];
    const categories = [
      ...new Set(
        selectedQuestionsForMain
          .flatMap((q) => q?.questionCategory?.map((cat) => cat?.name) || [])
          .filter(Boolean)
      ),
    ];

    return {
      difficulties: difficulties.map((d) => ({
        value: d,
        label: d.charAt(0).toUpperCase() + d.slice(1),
      })),
      questionTypes: questionTypes.map((qt) => ({ value: qt, label: qt })),
      tags: tags.map((tag) => ({ value: tag, label: tag })),
      categories: categories.map((cat) => ({ value: cat, label: cat })),
    };
  }, [selectedQuestionsForMain]);

  // Client-side filtered questions
  const filteredQuestions = useMemo(() => {
    if (!selectedQuestionsForMain?.length) return [];

    return selectedQuestionsForMain.filter((question) => {
      // Filter by difficulty
      if (filters.difficulty && question.difficulty !== filters.difficulty) {
        return false;
      }

      // Filter by question type
      if (
        filters.questionType &&
        question.questionType !== filters.questionType
      ) {
        return false;
      }

      // Filter by tags/skills
      if (filters.tags?.length > 0) {
        const questionTags = question.tags || [];
        const hasMatchingTag = filters.tags.some((tag) =>
          questionTags.includes(tag)
        );
        if (!hasMatchingTag) return false;
      }

      // Filter by category
      if (filters.category) {
        const questionCategories =
          question.questionCategory?.map((cat) => cat?.name) || [];
        if (!questionCategories.includes(filters.category)) return false;
      }

      // Filter by search text
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        const questionText = (
          question?.questionContent?.question ||
          question?.question ||
          ""
        ).toLowerCase();
        const questionTags = (question?.tags || []).join(" ").toLowerCase();

        if (
          !questionText.includes(searchLower) &&
          !questionTags.includes(searchLower)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [selectedQuestionsForMain, filters]);

  // Manual pagination logic for filtered questions
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredQuestions?.slice(startIndex, endIndex) || [];
  }, [filteredQuestions, currentPage, pageSize]);

  // Reset pagination when questions or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedQuestionsForMain, filters]);

  // Reset selection when page changes
  useEffect(() => {
    setSelectedQuestions([]);
    setSelectAll(false);
  }, [currentPage, pageSize]);

  const parseIfJson = (string) => {
    try {
      return JSON.parse(string);
    } catch (error) {
      return string;
    }
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
    setCurrentPage(1);
    setSelectedQuestions([]);
    setSelectAll(false);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      difficulty: null,
      questionType: null,
      tags: [],
      category: null,
      searchText: "",
    });
    setCurrentPage(1);
    setSelectedQuestions([]);
    setSelectAll(false);
  };

  // Main component handlers
  const handleQuestionSelect = (questionId) => {
    setSelectedQuestions((prev) => {
      if (prev?.includes(questionId)) {
        return prev?.filter((id) => id !== questionId) || [];
      } else {
        return [...(prev || []), questionId];
      }
    });
  };

  const handleSelectAll = (e) => {
    const checked = e?.target?.checked;
    setSelectAll(checked);
    if (checked) {
      setSelectedQuestions(
        paginatedData?.map((q) => q?._id)?.filter(Boolean) || []
      );
    } else {
      setSelectedQuestions([]);
    }
  };

  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    if (size !== pageSize) {
      setPageSize(size);
      setCurrentPage(1);
    }
  };

  const handleRemoveSelectedQuestions = async () => {
    // Get the remaining questions after removal
    const remainingQuestions =
      selectedQuestionsForMain?.filter(
        (q) => !selectedQuestions?.includes(q?._id)
      ) || [];

    // Get the IDs of remaining questions to send to backend
    const remainingQuestionIds =
      remainingQuestions?.map((q) => q?._id).filter(Boolean) || [];

    const updatedPayload = {
      questionIds: remainingQuestionIds,
    };

    try {
      await dispatch(
        updateJobAssessment({
          ...updatedPayload,
          aId,
          dispatch,
        })
      );

      setSelectedQuestionsForMain(remainingQuestions);
      setSelectedQuestions([]);
      setSelectAll(false);

      message.success(
        `${selectedQuestions?.length || 0} questions removed successfully!`
      );
    } catch (error) {
      console.error("Error removing questions:", error);
      message.error("Failed to remove questions from assessment");
    }
  };

  // Handle adding questions from skill library
  const handleAddQuestionsFromSkillLibrary = async (questions) => {
    const questionIds = questions?.map((q) => q?._id).filter(Boolean) || [];
    if (questionIds.length === 0) {
      message.warning("No questions selected to add");
      return;
    }

    // Use Set to remove duplicates
    const uniqueQuestionIds = [
      ...new Set([...questionIds, ...(singleJobAssessment?.questionIds || [])]),
    ];

    const updatedPayload = {
      questionIds: uniqueQuestionIds,
    };

    try {
      await dispatch(
        updateJobAssessment({
          ...updatedPayload,
          aId,
          dispatch,
        })
      );

      message.success(`${questionIds.length} questions added successfully!`);
    } catch (error) {
      console.error("Error updating assessment:", error);
      message.error("Failed to update assessment with selected questions");
    }
  };

  // Handle manually add (navigate to another page)
  const handleAddManually = () => {
    router.push(`/myjobs/${params?.jobId}/AID_${aId}__NewQuestion`);
  };

  // Dropdown menu items
  const addQuestionMenuItems = [
    {
      key: "skill-library",
      label: "Add from Skill Library",
      onClick: () => setIsSkillLibraryModalOpen(true),
    },
    {
      key: "ai",
      label: "Add using AI",
      onClick: () => setIsAIModalOpen(true),
    },
    {
      key: "manually",
      label: "Add Manually",
      onClick: handleAddManually,
    },
  ];

  // Empty state component
  const EmptyState = ({ message: emptyMessage }) => (
    <div className={styles.emptyState}>
      <Empty
        description={emptyMessage || "No questions found"}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    </div>
  );

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
            answer?.multipleChoice?.[optionKey] === true ||
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

  const currentUserGlobalId =
    USER_DETAILS?.globalId ?? USER_DETAILS?.data?.globalId ?? null;
  const currentUserOrgId =
    USER_DETAILS?.orgId ?? USER_DETAILS?.data?.orgId ?? null;

  // Helper to decide if current user can edit a given question
  const canEditQuestion = (q) =>
    q?.createdBy === currentUserGlobalId && q?.createdOrg === currentUserOrgId;

  // Edit handler
  const onEditQuestion = (question) => {
    router.push(`/myjobs/${params?.jobId}/AID_${aId}__${question?._id}`);
    message.info("Opening editor for this question in console."); // optional UX
  };

  // Calculate total questions and current page info
  const totalQuestions = selectedQuestionsForMain?.length || 0;
  const filteredTotalQuestions = filteredQuestions?.length || 0;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredTotalQuestions);

  // Check if all current page questions are selected
  const currentPageQuestionIds = paginatedData?.map((q) => q?._id) || [];
  const isAllCurrentPageSelected =
    currentPageQuestionIds.length > 0 &&
    currentPageQuestionIds.every((id) => selectedQuestions.includes(id));

  // Check if some questions on current page are selected
  const isSomeCurrentPageSelected = currentPageQuestionIds.some((id) =>
    selectedQuestions.includes(id)
  );

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some((value) =>
    Array.isArray(value) ? value.length > 0 : value
  );

  const parseMediaJSON = (maybeJson) => {
    if (!maybeJson || typeof maybeJson !== "string") return null;
    try {
      const obj = JSON.parse(maybeJson);
      if (
        obj &&
        (obj.type === "audio" || obj.type === "video") &&
        typeof obj.url === "string" &&
        obj.url.trim()
      ) {
        return { type: obj.type, url: obj.url.trim() };
      }
    } catch {}
    return null;
  };

  // Main Question List Component
  const MainQuestionList = () => {
    if (totalQuestions === 0) {
      return (
        <EmptyState message="No questions selected. Use 'Add Questions' to add questions." />
      );
    }

    if (filteredTotalQuestions === 0 && hasActiveFilters) {
      return (
        <EmptyState message="No questions match the current filters. Try adjusting your filters." />
      );
    }

    return (
      <>
        {paginatedData?.map((q, i) => {
          const questionNumber = startIndex + i + 1;

          return (
            <div key={q?._id} className={styles.questionItem}>
              <Collapse bordered={false} ghost>
                <Panel
                  header={
                    <div>
                      <div className={styles.questionItemHeader}>
                        <div className={styles.questionItemHeaderLeft}>
                          <Checkbox
                            checked={selectedQuestions?.includes(q?._id)}
                            onChange={(e) => {
                              e?.stopPropagation();
                              handleQuestionSelect(q?._id);
                            }}
                          />
                          <span className={styles.questionText}>
                            {`Question ${questionNumber}`}
                          </span>
                        </div>

                        <div className={styles.questionItemHeaderRight}>
                          <div className={styles.questionType}>
                            {q?.questionType?.toUpperCase()}
                          </div>
                          {q?.difficulty && (
                            <div className={styles.difficulty}>
                              {q?.difficulty?.toUpperCase()}
                            </div>
                          )}
                          {q?.questionCategory?.[0] && (
                            <div className={styles.category}>
                              {q?.questionCategory?.[0]?.name?.toUpperCase()}
                            </div>
                          )}
                          {q?.tags?.[0] && (
                            <div className={styles.skill}>
                              {q?.tags?.[0]?.toUpperCase()}
                            </div>
                          )}
                          <div className={styles.score}>
                            Score: {q?.scoreSettings?.pointsForCorrectAns || 0}
                          </div>
                          {canEditQuestion(q) && (
                            <Tooltip
                              title={"Uploaded by you"}
                              placement="topLeft"
                              color="#25a3a6"
                            >
                              <Button
                                type="link"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditQuestion(q);
                                }}
                                style={{
                                  padding: 0,
                                  textDecoration:
                                    hovered === q._id ? "underline" : "none",
                                }}
                                onMouseEnter={() => setHovered(q._id)}
                                onMouseLeave={() => setHovered(null)}
                              >
                                Edit
                              </Button>
                            </Tooltip>
                          )}
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
                              __html: parseIfJson(q?.answer?.explanation),
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

        {/* Pagination */}
        {filteredTotalQuestions > pageSize && (
          <div className={styles.paginationContainer}>
            <Pagination
              current={currentPage}
              total={filteredTotalQuestions}
              pageSize={pageSize}
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
              size="default"
            />
          </div>
        )}
      </>
    );
  };

  return (
    <div className={styles.container}>
      {/* Main Header */}
      <div className={styles.header}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <Checkbox
            checked={isAllCurrentPageSelected}
            onChange={handleSelectAll}
            indeterminate={
              isSomeCurrentPageSelected && !isAllCurrentPageSelected
            }
            disabled={filteredTotalQuestions === 0}
          >
            Select All Questions ({selectedQuestions?.length || 0} selected)
          </Checkbox>

          {(selectedQuestions?.length || 0) > 0 && (
            <Button
              danger
              onClick={handleRemoveSelectedQuestions}
              style={{ marginLeft: "1rem" }}
            >
              Remove Selected ({selectedQuestions?.length || 0})
            </Button>
          )}
        </div>

        {/* Add Questions Dropdown */}
        <Dropdown
          menu={{ items: addQuestionMenuItems }}
          placement="bottomRight"
          trigger={["click"]}
        >
          <Button type="primary" icon={<PlusOutlined />}>
            Add Questions <DownOutlined />
          </Button>
        </Dropdown>
      </div>

      {/* Filter Controls */}
      {totalQuestions > 0 && (
        <div
          className={styles.filterSection}
          style={{
            marginBottom: "16px",
            paddingLeft: "10px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
              marginBottom: hasActiveFilters ? "12px" : "0",
            }}
          >
            <Search
              placeholder="Search questions or tags..."
              value={filters.searchText}
              onChange={(e) => handleFilterChange("searchText", e.target.value)}
              style={{ minWidth: "200px", maxWidth: "300px" }}
              allowClear
            />

            <Select
              placeholder="Filter by Difficulty"
              style={{ minWidth: "140px" }}
              allowClear
              value={filters.difficulty}
              onChange={(value) => handleFilterChange("difficulty", value)}
              options={getFilterOptions.difficulties}
            />

            <Select
              placeholder="Filter by Type"
              style={{ minWidth: "140px" }}
              allowClear
              value={filters.questionType}
              onChange={(value) => handleFilterChange("questionType", value)}
              options={getFilterOptions.questionTypes}
            />

            <Select
              mode="multiple"
              placeholder="Filter by Tags"
              style={{ minWidth: "160px" }}
              allowClear
              value={filters.tags}
              onChange={(value) => handleFilterChange("tags", value)}
              options={getFilterOptions.tags}
              maxTagCount={2}
            />

            {hasActiveFilters && (
              <Button onClick={handleClearFilters} size="small">
                Clear Filters
              </Button>
            )}
          </div>

          {hasActiveFilters && (
            <div style={{ fontSize: "12px", color: "#666" }}>
              Showing {filteredTotalQuestions} of {totalQuestions} questions
            </div>
          )}
        </div>
      )}

      {/* Question Summary */}
      {totalQuestions > 0 && (
        <div className={styles.summaryInfo}>
          <span>
            {hasActiveFilters
              ? `Filtered Questions: ${filteredTotalQuestions} of ${totalQuestions}`
              : `Total Questions: ${totalQuestions}`}
          </span>
          {filteredTotalQuestions > pageSize && (
            <span>
              {" | "}
              Showing {startIndex + 1}-{endIndex} of {filteredTotalQuestions}
            </span>
          )}
        </div>
      )}

      {/* Main Question List */}
      <div className={styles.questionListCont} style={{ maxHeight: "50vh" }}>
        <MainQuestionList />
      </div>

      {/* Skill Library Modal */}
      <SkillLibraryModal
        open={isSkillLibraryModalOpen}
        onClose={() => setIsSkillLibraryModalOpen(false)}
        onAddQuestions={handleAddQuestionsFromSkillLibrary}
        preSelectedQuestions={singleJobAssessment?.questionIds
          ?.map((q) => q)
          .filter(Boolean)}
      />

      {/* AI Question Modal */}
      <AIQuestionModal
        open={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        aId={ONEJOB?.data?.AssessmentId}
      />
    </div>
  );
}
