"use client";
import React, { useEffect, useState } from "react";
import qStyles from "./questionCard.module.scss";
import { HiDotsVertical } from "react-icons/hi";
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
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import {
  setQuestionManagerComp,
  setQuestionVals,
} from "@/redux/slices/testportal_admin/slice/stepform";

import {
  UploadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CaretRightOutlined,
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
  const itemsPerPage = 5;
  const dispatch = useDispatch();
  const selectedQuestions = useSelector((state) => state.questions.bulkEdit);
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
  );

  const [selectedQtypeFilter, setQtypeFilter] = useState("");
  const [selectedQCategoryFilter, setQCategoryFilter] = useState("");
  const [searchBarInputValue, setSearchBarInputValue] = useState("");
  let questionsToDisplay;
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

  const filteredQuestions = questions?.filter((question) => {
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
      questions
        ?.flatMap((eachQuestion) =>
          eachQuestion?.questionCategory?.map((category) => category?.name)
        )
        .filter((name) => name !== null && name !== undefined) || []
    ),
  ];

  const uniqueQuestionTypes = Array.from(
    new Set(questions?.map((eachQuestion) => eachQuestion?.questionType))
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
  const getItems = (panelStyle) => {
    if (!Array.isArray(questions)) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    questionsToDisplay = filteredQuestionsRedux.length
      ? filteredQuestionsRedux
      : filteredQuestions;
    const paginatedQuestions = questionsToDisplay.slice(startIndex, endIndex);

    return paginatedQuestions.map((question, index) => {
      const questionNumber = startIndex + index + 1;
      const originalIndex = filteredQuestions.findIndex(
        (q) => q._id === question._id
      );
      return {
        key: question._id,
        label: (
          <div>
            <div className={qStyles.header}>
              <div>
                <CaretRightOutlined
                  className={`${qStyles.accordianArrow} ${
                    activePanel.find((e) => e == question._id) &&
                    qStyles.activeAccordianArrow
                  }`}
                />
                <input
                  type="checkbox"
                  className={qStyles.checkbox}
                  checked={selectedQuestions[question?._id]}
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
                <span>{`Question ${originalIndex + 1}`}</span>
              </div>
              <div className={qStyles.buttons}>
                <button>
                  <strong>Score:</strong>{" "}
                  {parseInt(
                    question?.scoreSettings?.pointsForCorrectAns ||
                      question?.scoreSettings?.PointsForEachCorrectAnswer
                  )}
                </button>

                {question?.questionCategory?.length > 0 &&
                  (question?.questionCategory.length > 1 ? (
                    <Popover
                      content={question?.questionCategory.map((e) => (
                        <p style={{ fontSize: ".8rem", fontWeight: "700" }}>
                          {e.name}
                        </p>
                      ))}
                      title={
                        <h4 style={{ textDecoration: "underline" }}>Tags</h4>
                      }
                      trigger="hover"
                      placement="bottom"
                    >
                      <button>
                        <strong>Tag : </strong>{" "}
                        {question?.questionCategory[0]?.name}
                        &nbsp;&nbsp;&nbsp;
                        {`+${question?.questionCategory.length - 1}`}
                      </button>
                    </Popover>
                  ) : (
                    <button>
                      <strong>Tag : </strong>{" "}
                      {question?.questionCategory[0]?.name}
                    </button>
                  ))}
                {question?.questionType && (
                  <button>
                    <strong>Type :</strong> {question?.questionType}
                  </button>
                )}
                <Dropdown
                  onClick={(e) => e.stopPropagation()}
                  menu={{
                    items,
                    onClick: (e) => {
                      if (e.key == "0") {
                        dispatch(setQuestionManagerComp("addquestion"));
                        dispatch(
                          setQuestionVals({
                            question,
                            questionType: questionTypes[question?.questionType],
                            answer: {},
                          })
                        );
                        nav.replace(
                          pathName + "/" + question?._id + `?type=bank`
                        );
                      }
                      if (e.key == "1") {
                        dispatch(
                          selectQuestion({
                            questionId: question?._id,
                            status: true,
                          })
                        );
                        setOpenDeleteModal(true);
                      }
                      if (e.key == "2") {
                        dispatch(
                          selectQuestion({
                            questionId: question?._id,
                            status: true,
                          })
                        );
                        setOpenCopyModal(true);
                      }
                    },
                  }}
                  trigger={["click"]}
                  placement="bottom"
                >
                  <Space>
                    <HiDotsVertical
                      onClick={() => {
                        setOptions(question?._id);
                      }}
                    />
                  </Space>
                </Dropdown>
              </div>
            </div>
            <div className={qStyles.question}>
              {question?.questionContent?.question && (
                <div
                  dangerouslySetInnerHTML={{
                    __html: parseIfJson(question?.questionContent?.question),
                  }}
                ></div>
              )}
            </div>
          </div>
        ),
        children: (
          <>
            <div>
              {(question?.questionType === "Video Question" ||
                question?.questionType === "Audio Question") &&
                question?.questionContent &&
                typeof question?.questionContent === "object" &&
                question?.resources &&
                Object.keys(question?.resources).length > 0 && (
                  <div className={qStyles.video_div}>
                    {question?.resources.type === "video" ? (
                      <video src={question?.resources?.file} controls />
                    ) : question?.resources.type === "audio" ? (
                      <audio src={question?.resources?.file} controls />
                    ) : null}{" "}
                  </div>
                )}
            </div>
            <div className={qStyles.question}>
              {question?.questionType == "Single Choice" &&
                question?.questionContent &&
                typeof question?.questionContent == "object" &&
                Object.keys(question?.questionContent)
                  ?.filter((ques) => {
                    return ques.includes("option");
                  })
                  .map((e, indexes) => {
                    return (
                      <div className={qStyles.ansCard} key={indexes}>
                        {String.fromCharCode(97 + indexes).toUpperCase() + "."}{" "}
                        <span
                          className={qStyles.optionContent}
                          dangerouslySetInnerHTML={{
                            __html: parseIfJson(question?.questionContent[e]),
                          }}
                        ></span>
                      </div>
                    );
                  })}
              {(question?.questionType == "Audio Question" ||
                question?.questionType === "Video Question") &&
                question?.questionContent &&
                typeof question?.questionContent == "object" &&
                Object.keys(question?.questionContent)
                  ?.filter((ques) => {
                    return ques.includes("option");
                  })
                  .map((e, indexes) => {
                    return (
                      <div className={qStyles.ansCard} key={indexes}>
                        {String.fromCharCode(97 + indexes).toUpperCase() + "."}{" "}
                        <span
                          className={qStyles.optionContent}
                          dangerouslySetInnerHTML={{
                            __html: parseIfJson(question?.questionContent[e]),
                          }}
                        ></span>
                      </div>
                    );
                  })}
              {question?.questionType == "Multiple Choice" &&
                question?.questionContent &&
                typeof question?.questionContent == "object" &&
                Object.keys(question?.questionContent)
                  ?.filter((ques) => {
                    return ques.includes("option");
                  })
                  .map((e, indexes) => {
                    return (
                      <div className={qStyles.ansCard} key={indexes}>
                        {String.fromCharCode(97 + indexes).toUpperCase() + "."}{" "}
                        <span
                          className={qStyles.optionContent}
                          dangerouslySetInnerHTML={{
                            __html: parseIfJson(question?.questionContent[e]),
                          }}
                        ></span>
                      </div>
                    );
                  })}

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
            </div>
          </>
        ),
        style: panelStyle,
        showArrow: false,
      };
    });
  };
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const { token = {} } = theme?.useToken();
  const panelStyle = {
    marginBottom: 24,
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    border: "none",
  };
  useEffect(() => {
    dispatch(selectQuestion({}));
    dispatch(getQuestionsLength());
  }, []);
  const handleChange = (event) => {
    if (questions?.length == 0) return;
    else {
      let checkFlag = 0;
      if (Object.keys(selectedQuestions).length == questions.length) {
        Object.keys(selectedQuestions).forEach((e) => {
          if (selectedQuestions[e]) checkFlag++;
        });
      } else {
        Object.keys(selectedQuestions).forEach((e) => {
          if (selectedQuestions[e]) checkFlag++;
        });
      }
      if (checkFlag == questions.length) {
        questions.forEach((e) => {
          dispatch(selectQuestion({ questionId: e._id, status: false }));
        });
        event.target.checked = false;
      } else {
        questions.forEach((e) => {
          dispatch(selectQuestion({ questionId: e._id, status: true }));
        });
        event.target.checked = true;
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

  const [deleteSelect, setDeleteSelect] = useState(1);

  const [openCopyModal, setOpenCopyModal] = useState(false);
  const [selectedTests, setSelectedTests] = useState([]);

  const handleCopy = () => {
    dispatch(addQuestionToTest({ testId: selectedTests, selectedQuestions }));

    setOpenCopyModal(false);
  };

  if (!Array.isArray(questions))
    return (
      <div>
        <p>No Questions Added yet</p>
      </div>
    );

  return (
    <div className={qStyles.questionCard} key={index}>
      <div className={qStyles.header_div}>
        <h2 className={qStyles.heading}>
          Question Bank : <strong>{`(${QuestionsLength})` || 0} </strong>
        </h2>
      </div>
      <div>
        <div className={qStyles.optsCon}>
          <div className={qStyles.selectAllCon}>
            <input
              type="checkbox"
              checked={(() => {
                let checkFlag = 0;
                Object.keys(selectedQuestions).forEach((e) => {
                  if (selectedQuestions[e]) checkFlag++;
                });

                return checkFlag == questions?.length;
              })()}
              onChange={handleChange}
            />
            <span>Select All Questions</span>
          </div>

          <div
            className={qStyles.selectAllCon}
            onClick={() => {
              if (
                !Object.keys(selectedQuestions).filter(
                  (e) => selectedQuestions[e]
                ).length
              )
                return message.info("Please Select questions to delete");
              setOpenDeleteModal(true);
            }}
          >
            <FaTrash
              size={15}
              className={
                !Object.keys(selectedQuestions).filter(
                  (e) => selectedQuestions[e]
                ).length
                  ? qStyles.inactive
                  : qStyles.activeIcon
              }
            />

            <span>Delete</span>
          </div>
          {/* Delete Question Modal */}
          <Modal
            title="Confirm Delete Question(s)"
            open={openDeleteModal}
            onOk={handleDeleteQuestion}
            confirmLoading={ConfirmDeleteLoading}
            onCancel={() => setOpenDeleteModal(false)}
          >
            <p>Are you sure you want to delete the question(s)</p>
          </Modal>
          {/* Delete Question Modal */}
          <div
            className={qStyles.selectAllCon}
            onClick={() => setOpenCopyModal(true)}
          >
            <FaCopy
              size={20}
              className={
                !Object.keys(selectedQuestions).filter(
                  (e) => selectedQuestions[e]
                ).length
                  ? qStyles.inactive
                  : qStyles.activeIcon
              }
            />

            <span>Copy</span>
          </div>

          <div className={qStyles.searchCon}>
            <FaSearch size={20} color="#ccc" />

            <input
              placeholder="Search Questions"
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
              value={selectedQCategoryFilter || "Filter by category"}
              onChange={(value) => {
                setQCategoryFilter(value === "remove-filter" ? null : value);
              }}
              suffixIcon={null}
            >
              <Option value="remove-filter">Remove Filter</Option>
              {categories &&
                categories?.map((categoryName, index) => {
                  return (
                    <Option key={categoryName} value={categoryName}>
                      {categoryName}
                    </Option>
                  );
                })}
            </Select>
          </div>

          <div className={qStyles.filterings}>
            <Select
              className={qStyles.Select_tag}
              placeholder="Filter by questionType"
              value={selectedQtypeFilter || "Filter by questionType"}
              onChange={(value) => {
                setQtypeFilter(value === "remove-filter" ? null : value);
              }}
              suffixIcon={null}
            >
              <Option value="remove-filter">Remove Filter</Option>
              {uniqueQuestionTypes.map((eachQuestion, index) => {
                return (
                  <Option key={index} value={eachQuestion}>
                    {eachQuestion}
                  </Option>
                );
              })}
            </Select>
          </div>
          {/* {draggable ? (
            <button onClick={() => setDraggable(!draggable)}>
              Save Question Order
            </button>
          ) : (
            <button onClick={() => setDraggable(!draggable)}>
              Change Question Order
            </button>
          )} */}

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
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
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

              <a
                href="/question_sample_schema.xlsx"
                download
                style={{ width: "100%" }}
              >
                <Button type="primary" block disabled={isUploading}>
                  📩 Download Sample File
                </Button>
              </a>
            </div>
          </Modal>

          <Modal
            title={
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
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
                <Button
                  key="close"
                  type="primary"
                  onClick={handleCloseProgressModal}
                >
                  Close
                </Button>,
              ]
            }
            width={800}
            closable={!isUploading}
            mask={{ closable: false }}
            destroyOnHidden
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              {/* Progress Section */}
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
                  <p
                    style={{
                      marginTop: "16px",
                      fontSize: "14px",
                      color: "#666",
                    }}
                  >
                    Processing your questions... Please don't close this window.
                  </p>
                </div>
              )}

              {/* Success Summary */}
              {uploadStatus === "success" && uploadResult && (
                <>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "16px",
                    }}
                  >
                    <div
                      style={{
                        padding: "16px",
                        background: "#f0f9ff",
                        borderRadius: "8px",
                        textAlign: "center",
                        border: "1px solid #bae7ff",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "24px",
                          fontWeight: "bold",
                          color: "#1890ff",
                        }}
                      >
                        {uploadResult.totalRows || 0}
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#666",
                          marginTop: "4px",
                        }}
                      >
                        Total Rows
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "16px",
                        background: "#f6ffed",
                        borderRadius: "8px",
                        textAlign: "center",
                        border: "1px solid #b7eb8f",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "24px",
                          fontWeight: "bold",
                          color: "#52c41a",
                        }}
                      >
                        {uploadResult.insertedCount || 0}
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#666",
                          marginTop: "4px",
                        }}
                      >
                        Successfully Added
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "16px",
                        background: "#fff1f0",
                        borderRadius: "8px",
                        textAlign: "center",
                        border: "1px solid #ffccc7",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "24px",
                          fontWeight: "bold",
                          color: "#ff4d4f",
                        }}
                      >
                        {uploadResult.skippedCount || 0}
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#666",
                          marginTop: "4px",
                        }}
                      >
                        Failed/Skipped
                      </div>
                    </div>
                  </div>

                  {/* Success Message */}
                  {uploadResult.insertedCount > 0 && (
                    <Alert
                      message="Questions Added Successfully"
                      description={`${uploadResult.insertedCount} question(s) have been added to the question bank.`}
                      type="success"
                      showIcon
                    />
                  )}

                  {/* Failed Questions Table */}
                  {uploadResult.skippedCount > 0 &&
                    uploadResult.skippedQuestions && (
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
                            showTotal: (total) =>
                              `Total ${total} failed questions`,
                          }}
                          scroll={{ x: 600 }}
                          size="small"
                        />
                      </div>
                    )}
                </>
              )}

              {/* Error State */}
              {uploadStatus === "error" && (
                <Alert
                  message="Upload Failed"
                  description={
                    uploadResult?.error ||
                    "An unexpected error occurred during upload. Please try again."
                  }
                  type="error"
                  showIcon
                />
              )}
            </div>
          </Modal>

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
          >
            <button>Add Question</button>
          </Dropdown>
        </div>
      </div>
      {allQuestionsStatus === "pending" ? (
        <div className={qStyles.questionCard}>
          <QuestionSkeleton />
          <br />
          <QuestionSkeleton />
          <br />
          <QuestionSkeleton />
          <br />
          <QuestionSkeleton />
          <br />
          <QuestionSkeleton />
        </div>
      ) : (
        <div className={qStyles.questions_cont}>
          {filteredQuestions.length > 0 ? (
            <>
              <Collapse
                bordered={false}
                expandIcon={({ isActive }) => (
                  <CaretRightOutlined rotate={isActive ? 90 : 0} />
                )}
                style={{
                  background: token.colorBgContainer,
                }}
                items={getItems(panelStyle)}
                accordion={false}
                onChange={(e) => setActivePanel(e)}
              />

              <Pagination
                current={currentPage}
                pageSize={itemsPerPage}
                total={questionsToDisplay.length}
                onChange={handlePageChange}
                showSizeChanger={false}
                style={{ marginTop: "16px", textAlign: "center" }}
              />
            </>
          ) : (
            <div className={qStyles.No_Questions_container}>
              No Questions added yet!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
