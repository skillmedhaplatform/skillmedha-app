"use client";
import React, { useEffect, useState } from "react";
import qStyles from "./questionCard.module.scss";
import { HiDotsVertical } from "react-icons/hi"; // vertical three dots icon
import { FaTrash, FaCopy, FaSearch } from "react-icons/fa";
import {
  Dropdown,
  Space,
  Button,
  Select,
  Popover,
  Pagination,
  message,
  Upload,
  Progress,
  Table,
  Alert,
  Tag,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  setQuestionManagerComp,
  setQuestionVals,
} from "@/redux/slices/testportal_admin/slice/stepform";

import {
  UploadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CaretRightOutlined,
  DatabaseOutlined,
  CodeOutlined,
  OrderedListOutlined,
  FileTextOutlined,
  StarOutlined,
  TagOutlined,
  SettingOutlined,
  DeleteOutlined,
  EditOutlined,
  CopyOutlined,
  EyeOutlined,
  StarFilled,
  PlusOutlined
} from "@ant-design/icons";
import { Collapse, theme, Modal } from "antd";
import {
  allQues,
  bulkUploadQuestionstobank,
  clearsearchQuestions,
  deleteQuestion,
  getQuestionsLength,
  searchQuestions,
  searchQuestionsForBank,
  selectQuestion,
} from "@/redux/slices/testportal_admin/slice/questions";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  addQuestionToTest,
  getOneTests,
  getTests,
} from "@/redux/slices/testportal_admin/slice/test";
import { convert } from "html-to-text";
import { LoadingOutlined } from "@ant-design/icons";
import QuestionSkeleton from "../skeleton/questionSkeleton";
import { parseIfJson } from "@/utils/windowMW";
const { Option } = Select;

const stripHtml = (html) =>
  typeof html === "string" ? html.replace(/<[^>]*>/g, "") : "";

const items = [
  {
    label: "Edit",
    key: "0",
  },
  {
    label: "Delete",
    key: "1",
  },
  {
    label: "Copy",
    key: "2",
  },
];

const menuItems = [
  {
    key: "1",
    label: <span>Manual Upload</span>,
    code: "qbmu",
  },
  {
    key: "2",
    label: <span>Bulk Upload Questions</span>,
    code: "bulk",
  },
];

const QuestionCard = ({ questions, index }) => {
  const [options, setOptions] = useState();
  const [activePanel, setActivePanel] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [ConfirmDeleteLoading, setConfirmDeleteLoading] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState(null);

  const [itemsPerPage, setItemsPerPage] = useState(5);
  const dispatch = useDispatch();
  const selectedQuestions = useSelector((state) => state.questions.bulkEdit) || {};
  const { uploadResult, uploadStatus } = useSelector(
    (state) => state.questions
  );
  const { msg: QuestionsLength } = useSelector(
    (state) => state.questions.QuestionsLength.value
  );

  const allTests = useSelector((state) => state.tests.value);
  const allQuestionsStatus = useSelector(
    (state) => state.questions.allQuestions?.status
  );
  const filteredQuestionsRedux = useSelector(
    (state) => state.questions.searchquestions.value
  ) || [];

  const [selectedQtypeFilter, setQtypeFilter] = useState("");
  const [selectedQCategoryFilter, setQCategoryFilter] = useState("");
  const [searchBarInputValue, setSearchBarInputValue] = useState("");

  const handleSearch = () => {
    if (searchBarInputValue.trim()) {
      dispatch(searchQuestionsForBank({ text: searchBarInputValue }));
    }
  };
  const handleEnter = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const filteredQuestions = (questions || []).filter((question) => {
    const matchesStatus = selectedQtypeFilter
      ? question?.questionType?.toLowerCase() ===
        selectedQtypeFilter?.toLowerCase()
      : true;

    const matchesCategory = selectedQCategoryFilter
      ? question?.questionCategory?.some(
          (category) =>
            category.name?.toLowerCase() ===
            selectedQCategoryFilter?.toLowerCase()
        )
      : true;

    return matchesStatus && matchesCategory;
  });

  const handleCloseProgressModal = () => {
    setProgressModal(false);
    setFileList([]);
    dispatch({ type: "questions/resetUploadStatus" }); // Reset upload state
  };
  const [fileList, setFileList] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [bulkuploadModal, setBulkUploadModal] = useState(false);
  const [progressModal, setProgressModal] = useState(false);

  const skippedColumns = [
    {
      title: "Row",
      dataIndex: "row",
      key: "row",
      width: 80,
      render: (row) => <Tag color="red">Row {row}</Tag>,
    },
    {
      title: "Question",
      dataIndex: ["data", "question"],
      key: "question",
      ellipsis: true,
      render: (text) => text || <span style={{ color: "#999" }}>N/A</span>,
    },
    {
      title: "Errors",
      dataIndex: "errors",
      key: "errors",
      render: (errors) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {errors.map((error, index) => (
            <Alert
              key={index}
              message={error}
              type="error"
              showIcon
              style={{ fontSize: "12px", padding: "4px 8px" }}
            />
          ))}
        </div>
      ),
    },
  ];

  const handleUpload = () => {
    if (fileList.length === 0) {
      message.error("Please select a file before uploading!");
      return;
    }

    setIsUploading(true);
    setBulkUploadModal(false);
    setProgressModal(true);

    const formData = new FormData();
    formData.append("file", fileList[0]);

    dispatch(
      bulkUploadQuestionstobank({
        file: formData,
      })
    )
      .unwrap()
      .then(() => {
        setFileList([]);
      })
      .catch((error) => {
        console.error("Upload error:", error);
      })
      .finally(() => {
        setIsUploading(false);
        dispatch(allQues({ limit: 1000 }));
      });
  };
  const uploadProps = {
    accept: ".xlsx,.csv",
    beforeUpload: (file) => {
      setFileList([file]);
      return false;
    },
    onRemove: () => setFileList([]),
    fileList,
    maxCount: 1,
  };

  const categories = [
    ...new Set(
      (questions || [])
        ?.flatMap((eachQuestion) =>
          eachQuestion?.questionCategory?.map((category) => category?.name)
        )
        .filter((name) => name !== null && name !== undefined) || []
    ),
  ];

  const uniqueQuestionTypes = Array.from(
    new Set((questions || [])?.map((eachQuestion) => eachQuestion?.questionType))
  );

  useEffect(() => {
    if (!allTests?.length) dispatch(getTests({ limit: 10, cursor: null }));
  }, [allTests?.length]);

  const questionTypes = {
    "Single Choice": "single",
    "Multiple Choice": "multiple",
    "Short Paragraph": "para",
    "True - False": "tf",
  };
  const pathName = usePathname();
  const nav = useRouter();

  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    if (pageSize && pageSize !== itemsPerPage) {
      setItemsPerPage(pageSize);
      setCurrentPage(1);
    }
  };
  const { token = {} } = theme?.useToken();

  useEffect(() => {
    dispatch(selectQuestion({}));
    dispatch(getQuestionsLength());
  }, []);

  const handleChange = (event) => {
    if ((questions || []).length === 0) return;
    else {
      let checkFlag = 0;
      Object.keys(selectedQuestions).forEach((e) => {
        if (selectedQuestions[e]) checkFlag++;
      });

      if (checkFlag === (questions || []).length) {
        (questions || []).forEach((e) => {
          dispatch(selectQuestion({ questionId: e._id, status: false }));
        });
      } else {
        (questions || []).forEach((e) => {
          dispatch(selectQuestion({ questionId: e._id, status: true }));
        });
      }
    }
  };

  const handleDeleteQuestion = () => {
    dispatch(
      deleteQuestion({
        selectedQuestions,
        setConfirmDeleteLoading,
        setOpenDeleteModal,
        dispatch,
      })
    );
  };

  const [openCopyModal, setOpenCopyModal] = useState(false);
  const [selectedTests, setSelectedTests] = useState([]);

  const handleCopy = () => {
    dispatch(addQuestionToTest({ testId: selectedTests, selectedQuestions }));
    setOpenCopyModal(false);
  };

  // Helper to check correct answer
  const isCorrectAnswer = (question, optionKey) => {
    if (question?.questionType === "Single Choice") {
      return question?.answer?.singleChoice?.[optionKey] === true;
    }
    if (question?.questionType === "Multiple Choice") {
      return question?.answer?.multipleChoice?.[optionKey] === true;
    }
    if (question?.questionType === "True - False" || question?.questionType === "True/False") {
      if (question?.answer?.trueFalse !== undefined) {
        const ansVal = question?.answer?.trueFalse;
        if (optionKey === "option1" && (ansVal === true || ansVal === "true")) return true;
        if (optionKey === "option2" && (ansVal === false || ansVal === "false")) return true;
      }
    }
    return false;
  };

  if (!Array.isArray(questions))
    return (
      <div className={qStyles.No_Questions_container}>
        <p>No Questions Added yet</p>
      </div>
    );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const questionsToDisplay = filteredQuestionsRedux.length
    ? filteredQuestionsRedux
    : filteredQuestions;
  const paginatedQuestions = questionsToDisplay.slice(startIndex, endIndex);

  // Dynamic calculations for Metric Cards (Image 2)
  const totalCount = questions.length;
  const singleChoiceCount = questions.filter(q => q.questionType === "Single Choice").length;
  const multipleChoiceCount = questions.filter(q => q.questionType === "Multiple Choice").length;
  const codingCount = questions.filter(q => 
    q.questionType === "Coding" || 
    q.questionType?.toLowerCase()?.includes("code") || 
    q.questionType?.toLowerCase()?.includes("coding")
  ).length;

  const togglePanel = (id) => {
    if (activePanel.includes(id)) {
      setActivePanel(activePanel.filter(x => x !== id));
    } else {
      setActivePanel([...activePanel, id]);
    }
  };

  const handleEditClick = (question) => {
    dispatch(setQuestionManagerComp("addquestion"));
    dispatch(
      setQuestionVals({
        question,
        questionType: questionTypes[question?.questionType],
        answer: {},
      })
    );
    nav.replace(pathName + "/" + question?._id + `?type=bank`);
  };

  const handleDeleteClick = (question) => {
    dispatch(
      selectQuestion({
        questionId: question?._id,
        status: true,
      })
    );
    setOpenDeleteModal(true);
  };

  const handleDuplicateClick = (question) => {
    dispatch(
      selectQuestion({
        questionId: question?._id,
        status: true,
      })
    );
    setOpenCopyModal(true);
  };

  const handlePreviewClick = (question) => {
    setPreviewQuestion(question);
    setIsPreviewModalOpen(true);
  };

  const selectedCount = Object.values(selectedQuestions).filter(Boolean).length;

  return (
    <div className={qStyles.questionCard} key={index}>
      {/* Title Row with Metric/Count Badge */}
      <div className={qStyles.header_div}>
        <div className={qStyles.headerLeft}>
          <span className={qStyles.titleIcon}>
            <DatabaseOutlined />
          </span>
          <h2 className={qStyles.heading}>
            Question Bank
            <span className={qStyles.countBadge}>{QuestionsLength || 0} Questions</span>
          </h2>
        </div>
        <Dropdown
          menu={{
            items: menuItems,
            onClick: (e) => {
              dispatch(setQuestionManagerComp("addquestion"));
              if (e.key == "1")
                nav.replace(pathName + "/new-question?type=bank");
              if (e.key == "2") setBulkUploadModal(true);
            },
          }}
          placement="bottomRight"
        >
          <button className={qStyles.addBtn}><PlusOutlined /> Add Question</button>
        </Dropdown>
      </div>

      {/* Metrics Grid (Image 2) */}
      <div className={qStyles.metricGrid}>
        <div className={qStyles.metricCard}>
          <div className={`${qStyles.iconWrapper} ${qStyles.total}`}>
            <DatabaseOutlined />
          </div>
          <div className={qStyles.textWrapper}>
            <span className={qStyles.number}>{totalCount}</span>
            <span className={qStyles.label}>Total Questions</span>
          </div>
        </div>
        <div className={qStyles.metricCard}>
          <div className={`${qStyles.iconWrapper} ${qStyles.single}`}>
            <CheckCircleOutlined />
          </div>
          <div className={qStyles.textWrapper}>
            <span className={qStyles.number}>{singleChoiceCount}</span>
            <span className={qStyles.label}>Single Choice</span>
          </div>
        </div>
        <div className={qStyles.metricCard}>
          <div className={`${qStyles.iconWrapper} ${qStyles.multiple}`}>
            <OrderedListOutlined />
          </div>
          <div className={qStyles.textWrapper}>
            <span className={qStyles.number}>{multipleChoiceCount}</span>
            <span className={qStyles.label}>Multiple Choice</span>
          </div>
        </div>
        <div className={qStyles.metricCard}>
          <div className={`${qStyles.iconWrapper} ${qStyles.coding}`}>
            <CodeOutlined />
          </div>
          <div className={qStyles.textWrapper}>
            <span className={qStyles.number}>{codingCount}</span>
            <span className={qStyles.label}>Coding</span>
          </div>
        </div>
      </div>

      {/* Redesigned Filter/Options Row */}
      <div className={qStyles.optsCon}>
        <div className={qStyles.selectAllCon} onClick={handleChange}>
          <input
            type="checkbox"
            checked={(() => {
              let checkFlag = 0;
              Object.keys(selectedQuestions).forEach((e) => {
                if (selectedQuestions[e]) checkFlag++;
              });
              return checkFlag === questions?.length && questions?.length > 0;
            })()}
            onChange={handleChange}
            onClick={(e) => e.stopPropagation()}
          />
          <span>Select All</span>
        </div>

        {/* Bulk Delete and Bulk Copy Buttons */}
        <button
          className={`${qStyles.bulkActionBtn} ${qStyles.delete} ${selectedCount === 0 ? qStyles.disabled : ""}`}
          onClick={() => {
            if (selectedCount === 0) return message.info("Please Select questions to delete");
            setOpenDeleteModal(true);
          }}
        >
          <DeleteOutlined /> Delete {selectedCount > 0 ? `(${selectedCount})` : ""}
        </button>
        <button
          className={`${qStyles.bulkActionBtn} ${selectedCount === 0 ? qStyles.disabled : ""}`}
          onClick={() => {
            if (selectedCount === 0) return message.info("Please Select questions to copy");
            setOpenCopyModal(true);
          }}
        >
          <CopyOutlined /> Copy {selectedCount > 0 ? `(${selectedCount})` : ""}
        </button>

        <div className={qStyles.searchCon}>
          <FaSearch className={qStyles.searchIcon} />
          <input
            placeholder="Search questions..."
            value={searchBarInputValue}
            onChange={(e) => {
              if (e.target.value.length == 0)
                dispatch(clearsearchQuestions([]));
              setSearchBarInputValue(e.target.value);
            }}
            onKeyDown={handleEnter}
          />
        </div>

        <div className={qStyles.filterings}>
          <Select
            placeholder="Filter by category"
            className={qStyles.Select_tag}
            value={selectedQCategoryFilter || undefined}
            onChange={(value) => {
              setQCategoryFilter(value === "remove-filter" ? null : value);
            }}
            allowClear
          >
            <Option value="remove-filter">All Categories</Option>
            {categories.map((categoryName) => (
              <Option key={categoryName} value={categoryName}>
                {categoryName}
              </Option>
            ))}
          </Select>
        </div>

        <div className={qStyles.filterings}>
          <Select
            className={qStyles.Select_tag}
            placeholder="Filter by type"
            value={selectedQtypeFilter || undefined}
            onChange={(value) => {
              setQtypeFilter(value === "remove-filter" ? null : value);
            }}
            allowClear
          >
            <Option value="remove-filter">All Types</Option>
            {uniqueQuestionTypes.map((eachQuestion, index) => (
              <Option key={index} value={eachQuestion}>
                {eachQuestion}
              </Option>
            ))}
          </Select>
        </div>
      </div>

      {/* Questions list container */}
      {allQuestionsStatus === "pending" ? (
        <div className={qStyles.questions_cont}>
          <QuestionSkeleton />
          <br />
          <QuestionSkeleton />
          <br />
          <QuestionSkeleton />
        </div>
      ) : (
        <div className={qStyles.questions_cont}>
          {paginatedQuestions.length > 0 ? (
            <>
              {paginatedQuestions.map((question, index) => {
                const questionNumber = startIndex + index + 1;
                const isExpanded = activePanel.includes(question._id);
                const score = parseInt(
                  question?.scoreSettings?.pointsForCorrectAns ||
                  question?.scoreSettings?.PointsForEachCorrectAnswer || 
                  question?.questionScore || 
                  0
                );
                const category = question?.questionCategory?.[0]?.name || "General";
                
                // Get options keys sorted
                const optionKeys = Object.keys(question?.questionContent || {})
                  .filter((key) => key.includes("option"))
                  .sort((a, b) => {
                    const numA = parseInt(a.replace("option", ""), 10);
                    const numB = parseInt(b.replace("option", ""), 10);
                    return numA - numB;
                  });

                return (
                  <div 
                    key={question._id} 
                    className={`${qStyles.cardRow} ${isExpanded ? qStyles.expanded : ""}`}
                  >
                    {/* Collapsed Header (Image 2) */}
                    <div className={qStyles.collapsedHeader} onClick={() => togglePanel(question._id)}>
                      <div className={qStyles.leftPart}>
                        <button 
                          className={`${qStyles.toggleBtn} ${isExpanded ? qStyles.active : ""}`}
                          onClick={(e) => { e.stopPropagation(); togglePanel(question._id); }}
                        >
                          <CaretRightOutlined />
                        </button>
                        <input
                          type="checkbox"
                          className={qStyles.checkbox}
                          checked={!!selectedQuestions[question?._id]}
                          onChange={(e) =>
                            dispatch(
                              selectQuestion({
                                questionId: question._id,
                                status: e.target.checked,
                              })
                            )
                          }
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className={qStyles.numberBadge}>
                          {questionNumber}
                        </div>
                        <div className={qStyles.descriptionText}>
                          {stripHtml(parseIfJson(question?.questionContent?.question))}
                        </div>
                      </div>

                      <div className={qStyles.rightPart}>
                        {/* Tags Row */}
                        <div className={qStyles.tagsRow}>
                          <span className={qStyles.tagCategory}>
                            {category}
                          </span>
                          <span className={qStyles.tagScore}>
                            <StarOutlined /> {score} pts
                          </span>
                          <span className={qStyles.tagType}>
                            {question?.questionType}
                          </span>
                          <span className={`${qStyles.tagDifficulty} ${score > 5 ? qStyles.hard : score > 2 ? qStyles.medium : qStyles.easy}`}>
                            {score > 5 ? "Hard" : score > 2 ? "Medium" : "Easy"}
                          </span>
                        </div>

                        {/* Dropdown Menu */}
                        <div className={qStyles.menuButtonWrapper} onClick={(e) => e.stopPropagation()}>
                          <Dropdown
                            menu={{
                              items,
                              onClick: (e) => {
                                if (e.key === "0") handleEditClick(question);
                                if (e.key === "1") handleDeleteClick(question);
                                if (e.key === "2") handleDuplicateClick(question);
                              },
                            }}
                            trigger={["click"]}
                            placement="bottomRight"
                          >
                            <button className={qStyles.menuBtn}>
                              <HiDotsVertical size={16} />
                            </button>
                          </Dropdown>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Detail view (Image 3) */}
                    {isExpanded && (
                      <div className={qStyles.expandedContent}>
                        {/* Question Text */}
                        <div 
                          className={qStyles.expandedTitle}
                          dangerouslySetInnerHTML={{
                            __html: parseIfJson(question?.questionContent?.question),
                          }}
                        />

                        {/* Optional Video/Audio resource */}
                        {(question?.questionType === "Video Question" ||
                          question?.questionType === "Audio Question") &&
                          question?.resources?.file && (
                            <div className={qStyles.video_div}>
                              {question?.resources.type === "video" ? (
                                <video src={question?.resources?.file} controls />
                              ) : question?.resources.type === "audio" ? (
                                <audio src={question?.resources?.file} controls />
                              ) : null}
                            </div>
                          )}

                        {/* Option List with correctness highlight */}
                        <div className={qStyles.optionsList}>
                          {optionKeys.map((optionKey, optIndex) => {
                            const isCorrect = isCorrectAnswer(question, optionKey);
                            return (
                              <div 
                                key={optionKey} 
                                className={`${qStyles.optionRow} ${isCorrect ? qStyles.correct : ""}`}
                              >
                                <div className={qStyles.optionLeft}>
                                  <div className={`${qStyles.letterBadge} ${isCorrect ? qStyles.correct : ""}`}>
                                    {String.fromCharCode(65 + optIndex)}
                                  </div>
                                  <span
                                    className={qStyles.optionContentText}
                                    dangerouslySetInnerHTML={{
                                      __html: parseIfJson(question?.questionContent[optionKey]),
                                    }}
                                  />
                                </div>
                                {isCorrect && (
                                  <span className={qStyles.checkIcon}>
                                    <CheckCircleOutlined />
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Metadata row */}
                        <div className={qStyles.expandedMetadata}>
                          <span className={qStyles.metaItem}>
                            <StarOutlined /> Score: {score} pts
                          </span>
                          <span className={qStyles.metaItem}>
                            <OrderedListOutlined /> Type: {question?.questionType}
                          </span>
                          <span className={qStyles.metaItem}>
                            <TagOutlined /> Category: {category}
                          </span>
                          <span className={qStyles.metaItem}>
                            <SettingOutlined /> Difficulty: {score > 5 ? "Hard" : score > 2 ? "Medium" : "Easy"}
                          </span>
                        </div>

                        {/* Expanded View Bottom Buttons */}
                        <div className={qStyles.expandedActions}>
                          <button 
                            className={`${qStyles.actionBtn} ${qStyles.edit}`}
                            onClick={() => handleEditClick(question)}
                          >
                            <EditOutlined /> Edit
                          </button>
                          <button 
                            className={`${qStyles.actionBtn} ${qStyles.duplicate}`}
                            onClick={() => handleDuplicateClick(question)}
                          >
                            <CopyOutlined /> Duplicate
                          </button>
                          <button 
                            className={`${qStyles.actionBtn} ${qStyles.preview}`}
                            onClick={() => handlePreviewClick(question)}
                          >
                            <EyeOutlined /> Preview
                          </button>
                          <button 
                            className={`${qStyles.actionBtn} ${qStyles.delete}`}
                            onClick={() => handleDeleteClick(question)}
                          >
                            <DeleteOutlined /> Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              <Pagination
                current={currentPage}
                pageSize={itemsPerPage}
                total={questionsToDisplay.length}
                onChange={handlePageChange}
                showSizeChanger={true}
                pageSizeOptions={["5", "10", "20", "50"]}
                style={{ marginTop: "24px", textAlign: "center" }}
              />
            </>
          ) : (
            <div className={qStyles.No_Questions_container}>
              No Questions added yet!
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        title="Confirm Delete Question(s)"
        open={openDeleteModal}
        onOk={handleDeleteQuestion}
        confirmLoading={ConfirmDeleteLoading}
        onCancel={() => setOpenDeleteModal(false)}
      >
        <p>Are you sure you want to delete the selected question(s)?</p>
      </Modal>

      {/* Copy / Duplicate to Tests Modal */}
      <Modal
        title="Select Tests to copy this question"
        open={openCopyModal}
        onCancel={() => setOpenCopyModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setOpenCopyModal(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleCopy}>
            Submit
          </Button>,
        ]}
      >
        <Select
          mode="multiple"
          allowClear
          style={{ width: "100%" }}
          placeholder="Please select tests"
          onChange={(value) => setSelectedTests(value)}
        >
          {allTests?.map((test) => (
            <Select.Option key={test._id} value={test._id}>
              {test.title}
            </Select.Option>
          ))}
        </Select>
      </Modal>

      {/* Bulk Upload Modal */}
      <Modal
        title="Bulk Upload Questions"
        open={bulkuploadModal}
        onCancel={() => {
          if (!isUploading) {
            setBulkUploadModal(false);
            setFileList([]);
          }
        }}
        width={500}
        okText={isUploading ? "Uploading..." : "Upload"}
        onOk={handleUpload}
        okButtonProps={{
          disabled: fileList.length === 0 || isUploading,
          loading: isUploading,
        }}
        cancelButtonProps={{
          disabled: isUploading,
        }}
        closable={!isUploading}
        mask={{ closable: false }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <Alert
            message="Upload Instructions"
            description="First, download the sample file, modify it with your data, and then re-upload the updated file here."
            type="info"
            showIcon
            style={{ fontSize: "13px" }}
          />

          <Upload {...uploadProps}>
            <Button
              icon={<UploadOutlined />}
              disabled={isUploading}
              style={{ width: "100%" }}
            >
              Select .xlsx or .csv File
            </Button>
          </Upload>

          <a href="/question_sample_schema.xlsx" download style={{ width: "100%" }}>
            <Button type="primary" block disabled={isUploading}>
              📩 Download Sample File
            </Button>
          </a>
        </div>
      </Modal>

      {/* Upload Progress Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {uploadStatus === "uploading" && "⏳ Uploading Questions..."}
            {uploadStatus === "success" && (
              <>
                <CheckCircleOutlined style={{ color: "#52c41a" }} />
                Upload Complete
              </>
            )}
            {uploadStatus === "error" && (
              <>
                <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
                Upload Failed
              </>
            )}
          </div>
        }
        open={progressModal}
        onCancel={!isUploading ? handleCloseProgressModal : undefined}
        footer={
          !isUploading && [
            <Button key="close" type="primary" onClick={handleCloseProgressModal}>
              Close
            </Button>,
          ]
        }
        width={800}
        closable={!isUploading}
        mask={{ closable: false }}
        destroyOnHidden
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {uploadStatus === "uploading" && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <Progress
                type="circle"
                percent={100}
                status="active"
                strokeColor={{
                  "0%": "#108ee9",
                  "100%": "#87d068",
                }}
              />
              <p style={{ marginTop: "16px", fontSize: "14px", color: "#666" }}>
                Processing your questions... Please don't close this window.
              </p>
            </div>
          )}

          {uploadStatus === "success" && uploadResult && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                <div style={{ padding: "16px", background: "#f0f9ff", borderRadius: "8px", textAlign: "center", border: "1px solid #bae7ff" }}>
                  <div style={{ fontSize: "24px", fontWeight: "bold", color: "#1890ff" }}>
                    {uploadResult.totalRows || 0}
                  </div>
                  <div style={{ fontSize: "13px", color: "#666", marginTop: "4px" }}>
                    Total Rows
                  </div>
                </div>
                <div style={{ padding: "16px", background: "#f6ffed", borderRadius: "8px", textAlign: "center", border: "1px solid #b7eb8f" }}>
                  <div style={{ fontSize: "24px", fontWeight: "bold", color: "#52c41a" }}>
                    {uploadResult.insertedCount || 0}
                  </div>
                  <div style={{ fontSize: "13px", color: "#666", marginTop: "4px" }}>
                    Successfully Added
                  </div>
                </div>
                <div style={{ padding: "16px", background: "#fff1f0", borderRadius: "8px", textAlign: "center", border: "1px solid #ffccc7" }}>
                  <div style={{ fontSize: "24px", fontWeight: "bold", color: "#ff4d4f" }}>
                    {uploadResult.skippedCount || 0}
                  </div>
                  <div style={{ fontSize: "13px", color: "#666", marginTop: "4px" }}>
                    Failed/Skipped
                  </div>
                </div>
              </div>

              {uploadResult.insertedCount > 0 && (
                <Alert
                  message="Questions Added Successfully"
                  description={`${uploadResult.insertedCount} question(s) have been added to the question bank.`}
                  type="success"
                  showIcon
                />
              )}

              {uploadResult.skippedCount > 0 && uploadResult.skippedQuestions && (
                <div>
                  <Alert
                    message={`${uploadResult.skippedCount} Question(s) Failed`}
                    description="The following questions could not be uploaded due to validation errors:"
                    type="warning"
                    showIcon
                    style={{ marginBottom: "12px" }}
                  />
                  <Table
                    columns={skippedColumns}
                    dataSource={uploadResult.skippedQuestions}
                    rowKey="row"
                    pagination={{
                      pageSize: 5,
                      showSizeChanger: false,
                      showTotal: (total) => `Total ${total} failed questions`,
                    }}
                    scroll={{ x: 600 }}
                    size="small"
                  />
                </div>
              )}
            </>
          )}

          {uploadStatus === "error" && (
            <Alert
              message="Upload Failed"
              description={uploadResult?.error || "An unexpected error occurred during upload. Please try again."}
              type="error"
              showIcon
            />
          )}
        </div>
      </Modal>

      {/* Read-only Preview Modal */}
      <Modal
        title="Question Preview"
        open={isPreviewModalOpen}
        onCancel={() => setIsPreviewModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsPreviewModalOpen(false)}>
            Close
          </Button>
        ]}
        width={700}
        centered
      >
        {previewQuestion && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
            <div 
              style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a" }}
              dangerouslySetInnerHTML={{ __html: parseIfJson(previewQuestion?.questionContent?.question) }}
            />
            
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {Object.keys(previewQuestion?.questionContent || {})
                .filter((key) => key.includes("option"))
                .sort((a, b) => {
                  const numA = parseInt(a.replace("option", ""), 10);
                  const numB = parseInt(b.replace("option", ""), 10);
                  return numA - numB;
                })
                .map((optionKey, optIdx) => {
                  const isCorrect = isCorrectAnswer(previewQuestion, optionKey);
                  return (
                    <div 
                      key={optionKey} 
                      style={{
                        padding: "10px 16px",
                        border: isCorrect ? "1px solid #22c55e" : "1px solid #e2e8f0",
                        borderRadius: "8px",
                        backgroundColor: isCorrect ? "#f0fdf4" : "#f8fafc",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          backgroundColor: isCorrect ? "#22c55e" : "#eff6ff",
                          color: isCorrect ? "#ffffff" : "#1e69da",
                          fontSize: "12px",
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}>
                          {String.fromCharCode(65 + optIdx)}
                        </div>
                        <span dangerouslySetInnerHTML={{ __html: parseIfJson(previewQuestion?.questionContent[optionKey]) }} />
                      </div>
                      {isCorrect && <CheckCircleOutlined style={{ color: "#22c55e" }} />}
                    </div>
                  );
                })
              }
            </div>

            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1.5rem",
              fontSize: "13px",
              fontWeight: 600,
              color: "#64748b",
              borderTop: "1px solid #f1f5f9",
              paddingTop: "0.75rem",
              marginTop: "0.5rem"
            }}>
              <span>Score: {parseInt(previewQuestion?.scoreSettings?.pointsForCorrectAns || previewQuestion?.scoreSettings?.PointsForEachCorrectAnswer || previewQuestion?.questionScore || 0)} pts</span>
              <span>Type: {previewQuestion?.questionType}</span>
              <span>Category: {previewQuestion?.questionCategory?.[0]?.name || "General"}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default QuestionCard;
