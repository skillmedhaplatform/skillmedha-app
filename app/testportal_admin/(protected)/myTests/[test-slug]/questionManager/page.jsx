"use client";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import QuestionStyles from "../styles/questions.module.scss";

import AddQuestionForm from "../components/childs/addQuestionForm";
import DraggableQuestionList from "../changeOrder/page";
import {
  allQues,
  bulkUploadQuestions,
  clearSelectQuestions,
  createQuestion,
  deleteQuestion,
  filteredQues,
  resetQuestion,
  searchQuestions,
  selectQuestion,
} from "@/redux/slices/testportal_admin/slice/questions";
import { setQuestionManagerComp } from "@/redux/slices/testportal_admin/slice/stepform";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  addQuestionToTest,
  getOneTests,
  removeQuestionFromTest,
} from "@/redux/slices/testportal_admin/slice/test";
import {
  Dropdown,
  Modal,
  Button,
  message,
  Radio,
  Menu,
  Select,
  Collapse,
  theme,
  Popover,
  Space,
  Upload,
  Progress,
  Table,
  Alert,
  Tag,
} from "antd";

import { convert } from "html-to-text";
import _ from "lodash";
import {
  CaretRightOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  UploadOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { HiDotsVertical, HiTrash, HiDuplicate, HiSearch, HiX } from "react-icons/hi";
import QuestionSkeleton from "@/modules/testportal_admin/components/reusable-comps/skeleton/questionSkeleton";
import TextEditor from "@/modules/testportal_admin/components/reusable-comps/editor/editor";
import {
  cancelAiQues,
  clearGeneratedQuestions,
  deleteQuestionFromGenerated,
  generateQuestions,
  setOriginalQuestions,
  updateQuestionContent,
} from "@/redux/slices/testportal_admin/slice/aigenerated";
import { getOneComprehensionQuestion } from "@/redux/slices/testportal_admin/slice/comprehensionQestions";

const items = [
  {
    key: "1",
    label: <span>Manual Upload</span>,
    code: "qbmu",
  },
  {
    key: "2",
    label: <span>From Question Bank</span>,
    code: "qbfqb",
  },
  {
    key: "3",
    label: <span>Generate using AI</span>,
    code: "qbgai",
  },
  {
    key: "4",
    label: <span>Comprehension Questions</span>,
    code: "qbbu",
  },
  {
    key: "5",
    label: <span>Add Coding Question</span>,
    code: "coding",
  },
  {
    key: "6",
    label: <span>Bulk upload Question</span>,
    code: "bulk",
  },
];
const QuestionManager = () => {
  const currentComp = useSelector((state) => state.steps.questionManagerComp);
  const selectedQuestions = useSelector((state) => state.questions.bulkEdit);
  const allQuestionsStatus = useSelector(
    (state) => state.questions.allQuestions?.status
  );
  const filteredQuestions = useSelector(
    (state) => state.questions.filteredQuestions
  );

  const dispatch = useDispatch();

  const textparaRef = useRef(null);

  const allTests = useSelector((state) => state.tests.value);
  const allQuesTionsFromBank = useSelector((state) => state.questions.value);

  const questions = useSelector((state) => state.questions.filteredQuestions);

  const singleTest = useSelector((state) => state.tests.test);
  const [draggable, setDraggable] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deleteSelect, setDeleteSelect] = useState(1);
  const [confirmDeleteLoading, setConfirmDeleteLoading] = useState(false);

  const params = useParams();

  const selectedId = params["test-slug"]?.split("_id-")[1];
  const pathName = usePathname();
  const nav = useRouter();
  // ---------------------------------------------------------------------------- Question BankModal
  const [selectedQtypeFilterBank, setQtypeFilterBank] = useState("");
  const [selectedQCategoryFilterBank, setQCategoryFilterBank] = useState("");
  const [searchBarInputValueBank, setSearchBarInputValueBank] = useState("");
  const [questionBankModal, setQuestionBankModal] = useState(false);
  const [activePanel, setActivePanel] = useState([]);
  const { uploadResult, uploadStatus } = useSelector(
    (state) => state.questions
  );
  const [fileList, setFileList] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [bulkuploadModal, setBulkUploadModal] = useState(false);
  const [progressModal, setProgressModal] = useState(false);
  const handleCloseProgressModal = () => {
    setProgressModal(false);
    setFileList([]);
    dispatch({ type: "questions/resetUploadStatus" }); // Reset upload state
  };
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

    setIsUploading(true);
    setBulkUploadModal(false);
    setProgressModal(true);

    const formData = new FormData();
    formData.append("file", fileList[0]);

    dispatch(
      bulkUploadQuestions({
        file: formData,
        testId: selectedId,
      })
    )
      .unwrap()
      .then(() => {
        setFileList([]);
      })
      .catch((error) => { })
      .finally(() => {
        setFileList([]);
        setIsUploading(false);
        dispatch(getOneTests({ _id: selectedId }));
      });
  };

  // Trigger refetch on mount to ensure fresh data after navigation
  useEffect(() => {
    if (selectedId) {
      dispatch(getOneTests({ _id: selectedId }));
    }
  }, [selectedId, dispatch]);

  useEffect(() => {
    if (
      !selectedQtypeFilterBank?.length &&
      !selectedQCategoryFilterBank?.length &&
      !searchBarInputValueBank?.length
    )
      dispatch(clearSelectQuestions());
  }, [
    selectedQtypeFilterBank,
    selectedQCategoryFilterBank,
    searchBarInputValueBank,
  ]);

  const filteredQuestionsFromBank = allQuesTionsFromBank?.filter((question) => {
    const matchesStatus = selectedQtypeFilterBank
      ? question?.questionType?.toLowerCase() ===
      selectedQtypeFilterBank?.toLowerCase()
      : true;

    const matchesCategory = selectedQCategoryFilterBank
      ? question?.questionCategory?.some(
        (category) =>
          category.name?.toLowerCase() ===
          selectedQCategoryFilterBank?.toLowerCase()
      )
      : true;

    const matchesSearch = convert(
      parseIfJson(question?.questionContent?.question || "")
    )
      ?.toLowerCase()
      ?.includes(searchBarInputValueBank?.toLowerCase());

    if (searchBarInputValueBank) {
      return matchesSearch && matchesStatus && matchesCategory;
    } else {
      return matchesStatus && matchesCategory;
    }
  });

  const bankCategories = [
    ...new Set(
      allQuesTionsFromBank
        ?.flatMap((eachQuestion) =>
          eachQuestion?.questionCategory?.map((category) => category?.name)
        )
        .filter((name) => name !== null && name !== undefined) || []
    ),
  ];

  const bankUniqueQuestionTypes = Array.from(
    new Set(
      allQuesTionsFromBank?.map(
        (eachQuestion) =>
          eachQuestion?.questionType && eachQuestion?.questionType
      )
    )
  );

  useEffect(() => {
    dispatch(clearSelectQuestions());
  }, []);

  function parseIfJson(text) {
    try {
      const trimmedText = text.trim();
      if (/^[{\[][\s\S]*[}\]]$/.test(trimmedText)) {
        return JSON.parse(trimmedText);
      }
      return trimmedText.replace(/^"(.*)"$/, "$1");
    } catch (e) {
      return text.replace(/^"(.*)"$/, "$1");
    }
  }
  const getItems = (panelStyle) => {
    if (!Array.isArray(allQuesTionsFromBank)) return [];
    return filteredQuestionsFromBank.map((question, index) => {
      return {
        key: question._id,
        label: (
          <div>
            <div className={QuestionStyles.header}>
              <div>
                <CaretRightOutlined
                  className={`${QuestionStyles.accordianArrow} ${activePanel.find((e) => e == question._id) &&
                    QuestionStyles.activeAccordianArrow
                    }`}
                />
                <input
                  type="checkbox"
                  className={QuestionStyles.checkbox}
                  checked={selectedQuestions[question?._id] ? true : false}
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
                <span>{`Question ${index + 1}`}</span>
              </div>
              <div className={QuestionStyles.buttons}>
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
              </div>
            </div>
            <div className={QuestionStyles.question}>
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
          <div className={QuestionStyles.question}>
            {question?.questionType == "Single Choice" &&
              question?.questionContent &&
              typeof question?.questionContent == "object" &&
              Object.keys(question?.questionContent)
                ?.filter((ques) => {
                  return ques.includes("option");
                })
                .map((e, indexes) => {
                  return (
                    <div className={QuestionStyles.ansCard} key={indexes}>
                      {String.fromCharCode(97 + indexes).toUpperCase() + "."}{" "}
                      <span
                        className={QuestionStyles.optionContent}
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
                  let parsedContent = "";
                  try {
                    parsedContent = parseIfJson(question?.questionContent[e]);
                  } catch (error) {
                    console.error("Failed to parse JSON:", error);
                  }
                  return (
                    <div className={QuestionStyles.ansCard} key={indexes}>
                      {String.fromCharCode(97 + indexes).toUpperCase() + "."}{" "}
                      <span
                        className={QuestionStyles.optionContent}
                        dangerouslySetInnerHTML={{
                          __html: parsedContent,
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
        ),
        style: panelStyle,
        showArrow: false,
      };
    });
  };

  const { token } = theme.useToken();
  const panelStyle = {
    marginBottom: 24,
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    border: "none",
  };

  // ---------------------------------------------------------------------------- Question BankModal

  useEffect(() => {
    if (
      singleTest &&
      singleTest.questions &&
      singleTest.questions.length == 0
    ) {
      dispatch(setQuestionManagerComp("addquestion"));
      // nav.replace(pathName + "/new-question");
    }
  }, [singleTest?._id]);

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

  const handleDelete = () => {
    setConfirmDeleteLoading(true);
    if (deleteSelect == 1) {
      dispatch(
        removeQuestionFromTest({
          selectedQuestions,
          setConfirmDeleteLoading,
          setOpenDeleteModal,
          testId: selectedId,
          dispatch,
        })
      ).then((resp) => {
        dispatch(clearSelectQuestions());
        if (resp.payload) {
          dispatch(getOneTests({ _id: selectedId }));
          message.success("Question(s) removed successfully");
        }
      });
    }
    if (deleteSelect == 2) {
      dispatch(
        deleteQuestion({
          selectedQuestions,
          setConfirmDeleteLoading,
          setOpenDeleteModal,
          dispatch,
        })
      ).then((resp) => {
        dispatch(clearSelectQuestions());
        if (resp.payload) {
          dispatch(getOneTests({ _id: selectedId }));
          message.success("Question(s) deleted successfully");
        }
      });
    }
  };

  const [selectedQtypeFilter, setQtypeFilter] = useState("");
  const [openCopyModal, setOpenCopyModal] = useState(false);
  const [selectedTests, setSelectedTests] = useState([]);
  const [selectedQCategoryFilter, setQCategoryFilter] = useState("");

  /* search Functionality */

  const [searchBarInputValue, setSearchBarInputValue] = useState("");

  const handleSearch = () => {
    if (searchBarInputValue.trim()) {
      dispatch(searchQuestions({ text: searchBarInputValue }));
    }
  };
  const handleEnter = (event) => {
    if (event.key === "Enter") {
      if (searchBarInputValue.length < 3) {
        message.info(<strong>More than 3 characters</strong>);
      } else {
        handleSearch();
      }
    }
  };

  /* search Functionality */

  useEffect(() => {
    if (!selectedQtypeFilter?.length && !selectedQCategoryFilter?.length)
      dispatch(clearSelectQuestions());
  }, [selectedQtypeFilter, selectedQCategoryFilter]);

  const handleCopy = () => {
    dispatch(
      addQuestionToTest({ testId: selectedTests, selectedQuestions })
    ).then((res) => {
      dispatch(clearSelectQuestions());
      if (res.payload) {
        dispatch(getOneTests({ _id: selectedId }));
        message.success("Question(s) copied successfully");
      }
    });

    setOpenCopyModal(false);
  };

  useEffect(() => {
    dispatch(filteredQues(singleTest?.questions || []));
  }, [singleTest]);

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

  useEffect(() => {
    if (selectedQtypeFilter || selectedQCategoryFilter) {
      const filteredQuestions = singleTest?.questions?.filter((question) => {
        const matchesType = selectedQtypeFilter
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
        return matchesType && matchesCategory;
      });
      dispatch(filteredQues(filteredQuestions));
    } else {
      dispatch(filteredQues(singleTest?.questions || []));
    }
  }, [selectedQtypeFilter, selectedQCategoryFilter, singleTest, dispatch]);

  const categories = [
    ...new Set(
      singleTest?.questions
        ?.flatMap((eachQuestion) =>
          eachQuestion?.questionCategory?.map((category) => category.name)
        )
        .filter((name) => name !== null && name !== undefined) || []
    ),
  ];

  const uniqueQuestionTypes = Array.from(
    new Set(
      singleTest?.questions
        ?.map((eachQuestion) => eachQuestion?.questionType)
        .filter((type) => type !== null && type !== undefined)
    )
  );

  // //////////////////////////////////////////////////////////////////     Generate Questions using Ai ////////////////////////////////////////////////////////

  const generatedQuestions = useSelector(
    (state) => state.ai.generatedQuestions?.questions
  );
  console.log(generatedQuestions);

  const [isGenerated, setIsGenerated] = useState(false);

  useEffect(() => {
    if (isGenerated == false) setIsGenerated(true);
  }, [generateQuestions?.length]);

  const [generateAiQuestion, setGenerateQuestions] = useState(false);

  const [editQues, setEditQues] = useState(false);

  useEffect(() => {
    dispatch(setOriginalQuestions(generatedQuestions));
  }, [editQues, isGenerated]);

  const handleSave = () => {
    setIsGenerated(true);

    setEditQues(false);
  };

  const handleDeleteQues = (index) => {
    setIsGenerated(true);

    dispatch(deleteQuestionFromGenerated(index));
  };

  const handleCancel = () => {
    setEditQues(false);
    dispatch(cancelAiQues());
  };

  const handleInputChange = (index, key, newValue) => {
    setIsGenerated(true);

    dispatch(updateQuestionContent({ index, key, newValue }));
  };

  const convertToJson = (data) => {
    return data?.map((question) => ({
      ...question,

      questionContent: {
        ...question.questionContent,
        question: JSON.stringify(question.questionContent.question),
        ...Object.keys(question.questionContent)
          .filter((key) => key.includes("option"))
          .reduce((acc, key) => {
            acc[key] = JSON.stringify(question.questionContent[key]);
            return acc;
          }, {}),
      },
      answer: {
        ...question.answer,
        explanation: JSON.stringify(question.answer?.explanation),
      },
    }));
  };

  const uploadToTest = async () => {
    const promises = convertToJson(generatedQuestions)?.map((e) => {
      dispatch(
        createQuestion({
          ...e,
          questionType: e?.questionType || generateVals?.questionType,
          testId: selectedId,
        })
      );
      setGenerateQuestions(true);
      setModalProps({
        maskClosable: false,
        closable: false,
        keyboard: false,
      });
    });

    try {
      await Promise.all(promises);
      message.success("Questions updated successfully");
      setModalProps({
        maskClosable: true,
        closable: true,
        keyboard: true,
      });
      setTimeout(() => {
        nav.refresh("questionManager");
        setEditQues(false);
        setGenerateQuestions(false);
      }, 1000);
    } catch (error) {
      console.error("Error uploading questions:", error);
    }
  };

  const [generateVals, setGenerateVals] = useState({
    textPara: "",
    noOfQuestion: "",
  });

  const questionItems = generatedQuestions?.map((e, i) => {
    const newObject = {
      key: i,
      label: (
        <div className={QuestionStyles.questionPar}>
          <div className={QuestionStyles.questionTop}>
            <h4>
              Question {i + 1} <br />
            </h4>
            <div className={QuestionStyles.questionScoring}>
              <button>
                <strong>Score:</strong>&nbsp;&nbsp;
                {parseInt(
                  e?.scoreSettings?.pointsForCorrectAns ||
                  e?.scoreSettings?.PointsForEachCorrectAnswer
                )}
              </button>
              <button className={QuestionStyles.tag_button}>
                <strong>Tag: </strong>&nbsp;&nbsp;
                {e?.questionType ? e?.questionType : generateVals?.questionType}
              </button>

              <button
                className={QuestionStyles.deleteButton}
                onClick={() => handleDeleteQues(i)}
              >
                <DeleteOutlined />
              </button>
            </div>
          </div>
          {!editQues ? (
            <span>{e?.questionContent?.question}</span>
          ) : (
            <input
              className={QuestionStyles.input}
              value={e?.questionContent?.question}
              onChange={(event) =>
                handleInputChange(i, "question", event.target.value)
              }
            />
          )}
        </div>
      ),
      children:
        typeof e?.questionContent === "object" &&
        Object.keys(e?.questionContent)
          ?.filter((ques) => ques.includes("option"))
          ?.map((quest, indexes) => {
            return (
              <div className={QuestionStyles.ansCard} key={indexes}>
                <strong>
                  {String.fromCharCode(97 + indexes).toUpperCase() + "."}{" "}
                </strong>
                {!editQues ? (
                  <span
                    className={QuestionStyles.optionContent}
                    dangerouslySetInnerHTML={{
                      __html: e?.questionContent[quest],
                    }}
                  ></span>
                ) : (
                  <input
                    className={QuestionStyles.input}
                    value={e?.questionContent[quest]}
                    onChange={(event) =>
                      handleInputChange(i, quest, event.target.value)
                    }
                  />
                )}
              </div>
            );
          }),
    };

    return newObject;
  });
  const [modalProps, setModalProps] = useState({
    maskClosable: true,
    closable: true,
  });

  const handleClear = () => {
    setGenerateVals({
      textPara: "",
    });
  };

  const generateQues = () => {
    const textParaValue = textparaRef.current?.value;
    if (generateVals?.noOfQuestion > 100) {
      message.warning("Currently, you can generate 100 questions per request");
    } else {
      setGenerateQuestions(true);
      setModalProps({
        maskClosable: false,
        closable: false,
        keyboard: false,
      });

      dispatch(generateQuestions({ ...generateVals, textPara: textParaValue }))
        .unwrap()
        .then(() => {
          setModalProps({
            maskClosable: true,
            closable: true,
            keyboard: true,
          });
        })
        .catch(() => {
          setModalProps({
            maskClosable: true,
            closable: true,
            keyboard: true,
          });
        });
    }
  };

  return (
    <div className={QuestionStyles.container}>
        <div>
          <div className={QuestionStyles.optsCon}>
            <div className={QuestionStyles.selectAllCon}>
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

            <Button
              // className={QuestionStyles.selectAllCon}
              onClick={() => {
                if (
                  !Object.keys(selectedQuestions).filter(
                    (e) => selectedQuestions[e]
                  ).length
                )
                  return message.info("Please Select questions to delete");
                setOpenDeleteModal(true);
              }}
              icon={
                <HiTrash
                  className={
                    !Object.keys(selectedQuestions).filter(
                      (e) => selectedQuestions[e]
                    ).length
                      ? QuestionStyles.inactive
                      : QuestionStyles.activeIcon
                  }
                  style={{ fontSize: "15px" }}
                />
              }
              type="text"
              disabled={!Object.values(selectedQuestions).filter(Boolean).length}
            >
              <span>Delete</span>
            </Button>
            {/* DELETE MODAL */}
            <Modal
              title="Delete/Remove Question"
              open={openDeleteModal}
              onOk={handleDelete}
              confirmLoading={confirmDeleteLoading}
              onCancel={() => setOpenDeleteModal(false)}
            >
              <Radio.Group
                onChange={(e) => setDeleteSelect(e.target.value)}
                value={deleteSelect}
              >
                <Radio value={1}>Remove Question From Current Test</Radio>
                <Radio value={2}>
                  Delete Question From Question Bank{" "}
                  {`<The Question(s) will be permanentaly deleted>`}
                </Radio>
              </Radio.Group>
            </Modal>
            {/* DELETE MODAL */}
            <Button
              // className={QuestionStyles.selectAllCon}
              onClick={() => {
                if (
                  !Object.keys(selectedQuestions).filter(
                    (e) => selectedQuestions[e]
                  ).length
                )
                  return message.info("Please Select questions to copy");
                setOpenCopyModal(true);
              }}
              icon={
                <HiDuplicate
                  className={
                    !Object.keys(selectedQuestions).filter(
                      (e) => selectedQuestions[e]
                    ).length
                      ? QuestionStyles.inactive
                      : QuestionStyles.activeIcon
                  }
                  style={{ fontSize: "20px" }}
                />
              }
              type="text"
              disabled={!Object.values(selectedQuestions).filter(Boolean).length}
            >
              <span>Copy</span>
            </Button>

            <div className={QuestionStyles.searchCon}>
              <HiSearch size={20} />

              <input
                placeholder="Search Questions"
                onChange={(e) => {
                  if (e.target.value.length == 0) {
                    dispatch(filteredQues(singleTest?.questions || []));
                  }
                  setSearchBarInputValue(e.target.value);
                }}
                onKeyDown={handleEnter}
              />
            </div>

            <div className={QuestionStyles.filterings}>
              <Select
                // style={{ width: 200, textAlign: "center" }}
                className={QuestionStyles.Select_tag}
                placeholder="Filter by category"
                value={selectedQCategoryFilter || "Filter by category"}
                onChange={(value) => {
                  setQCategoryFilter(value === "remove-filter" ? null : value);
                }}
                suffixIcon={null}
              >
                <Select.Option value="remove-filter">
                  Remove Filter
                </Select.Option>
                {categories.map((categoryName, index) => (
                  <Select.Option key={index} value={categoryName}>
                    {categoryName}
                  </Select.Option>
                ))}
              </Select>
            </div>

            <div className={QuestionStyles.filterings}>
              <Select
                className={QuestionStyles.Select_tag}
                placeholder="Filter by questiontype"
                value={selectedQtypeFilter || "Filter by questiontype"}
                onChange={(value) => {
                  setQtypeFilter(value === "remove-filter" ? null : value);
                }}
                suffixIcon={null}
              >
                <Select.Option value="remove-filter">
                  Remove Filter
                </Select.Option>
                {uniqueQuestionTypes.map((eachQuestion, index) => (
                  <Select.Option key={index} value={eachQuestion}>
                    {eachQuestion}
                  </Select.Option>
                ))}
              </Select>
            </div>

            <Dropdown
              menu={{
                items,
                onClick: (e) => {
                  dispatch(setQuestionManagerComp("addquestion"));
                  dispatch(resetQuestion());
                  if (e.key == "1") nav.replace(pathName + "/new-question");
                  if (e.key == "2") {
                    dispatch(allQues({ limit: 1000 }));
                    setQuestionBankModal(true);
                  }
                  if (e.key == "3") {
                    dispatch(clearGeneratedQuestions());
                    setGenerateQuestions(true);
                  }
                  if (e.key == "4") {
                    dispatch(getOneComprehensionQuestion({}));
                    nav.replace(pathName + "/new-comprehension-question");
                  }
                  if (e.key == "5") {
                    nav.push(pathName + "/new-coding-question");
                  }
                  if (e.key == "6") {
                    setBulkUploadModal(true);
                  }
                },
              }}
            >
              <button>Add Question</button>
            </Dropdown>
          </div>
        </div>
        <div className={QuestionStyles.Questions_container}>
          <DraggableQuestionList
            // allQuestions={filteredQuestions}
            draggable={draggable}
            testTitle={singleTest?.title}
            testId={singleTest?._id}
          />
        </div>

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

        <Modal
          title="Question Bank"
          open={questionBankModal}
          onCancel={() => setQuestionBankModal(false)}
          width={1000}
          closeIcon={
            <img
              width={"20rem"}
              src="https://res.cloudinary.com/cliqtick/image/upload/v1722511937/sysnper/53da26962c207566fc273c8904009a36_o2mxsj.png"
              alt="close"
            />
          }
          footer={null}
        >
          <section className={QuestionStyles.modal_maincont}>
            <div className={QuestionStyles.modal_header}>
              <div className={QuestionStyles.searchCon}>
                <HiSearch size={20} />

                <input
                  placeholder="Search Questions"
                  onClick={(e) => setSearchBarInputValueBank(e.target.value)}
                />
              </div>
              <div className={QuestionStyles.filterings}>
                <Select
                  className={QuestionStyles.Select_tag}
                  placeholder="Filter by category"
                  value={selectedQCategoryFilterBank ?? null}
                  onChange={(value) =>
                    setQCategoryFilterBank(
                      value === "remove-filter" ? null : value ?? null
                    )
                  }
                  suffixIcon={null}
                  allowClear
                >
                  <Select.Option value="remove-filter">
                    Remove Filter
                  </Select.Option>
                  {bankCategories.map((categoryName, index) => (
                    <Select.Option key={index} value={categoryName}>
                      {categoryName}
                    </Select.Option>
                  ))}
                </Select>
              </div>

              <div className={QuestionStyles.filterings}>
                <Select
                  className={QuestionStyles.Select_tag}
                  placeholder="by questiontype"
                  value={selectedQtypeFilterBank ?? null}
                  onChange={(value) =>
                    setQtypeFilterBank(
                      value === "remove-filter" ? null : value ?? null
                    )
                  }
                  suffixIcon={null}
                  allowClear
                >
                  <Select.Option value="remove-filter">
                    Remove Filter
                  </Select.Option>
                  {bankUniqueQuestionTypes.map((eachQuestion, index) => (
                    <Select.Option key={index} value={eachQuestion}>
                      {eachQuestion}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            </div>
            {allQuestionsStatus === "pending" ? (
              <div className={QuestionStyles.skeleton_bank}>
                <QuestionSkeleton />
                <br />
                <QuestionSkeleton />
                <br />
                <QuestionSkeleton />
              </div>
            ) : (
              <div className={QuestionStyles.questions_cont}>
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
              </div>
            )}

            <div className={QuestionStyles.btn_div}>
              <Button
                type="primary"
                disabled={!Object.values(selectedQuestions).filter(Boolean).length}
                onClick={() => {
                  dispatch(
                    addQuestionToTest({
                      testId: singleTest?._id,
                      selectedQuestions,
                      dispatch,
                    })
                  );
                  setQuestionBankModal(false);
                  dispatch(clearSelectQuestions());
                }}
              >
                Add
              </Button>
            </div>
          </section>
        </Modal>

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
          open={generateAiQuestion}
          onCancel={() => {
            setGenerateQuestions(false);
            setIsGenerated(true);
          }}
          width="70%"
          centered={true}
          mask={{ closable: modalProps.maskClosable }}
          keyboard={modalProps.keyboard}
          closable={modalProps.closable}
          destroyOnHidden={true}
          title="Generate using AI"
          footer={null}
          closeIcon={
            <img
              width={"20rem"}
              src="https://res.cloudinary.com/cliqtick/image/upload/v1722511937/sysnper/53da26962c207566fc273c8904009a36_o2mxsj.png"
              alt="close"
            />
          }
        >
          {generatedQuestions?.length > 0 && isGenerated ? (
            <div className={QuestionStyles.generatedQuestions}>
              <Collapse accordion items={questionItems} bordered={false} />
              <div className={QuestionStyles.flexButtons}>
                <Button onClick={uploadToTest}>Add To Question Manager</Button>
                <div>
                  <Button
                    onClick={() => {
                      handleSave();
                      setEditQues(!editQues);
                    }}
                  >
                    {editQues ? "Save" : "Edit"}{" "}
                  </Button>
                  {editQues ? (
                    <Button onClick={handleCancel}> Cancel </Button>
                  ) : null}
                </div>
              </div>
            </div>
          ) : (
            <div className={QuestionStyles.generateAiContainer}>
              {/* <div className={QuestionStyles.headButtons}>
                  <button>Paste Text</button>

                  <button>Upload File</button>
                </div> */}

              <p>Questions will be generated based on the text pasted below.</p>

              <div className={QuestionStyles.editorStyles}>
                <textarea
                  ref={textparaRef}
                  placeholder="Enter your text here to generate questions"
                />
              </div>

              <div className={QuestionStyles.bottomFlex}>
                <div className={QuestionStyles.bottomFlexLeft}>
                  <Select
                    className={QuestionStyles.selectOption}
                    suffixIcon={null}
                    defaultValue={"Select an Option"}
                    options={[
                      {
                        label: "Multiple Choice",
                        value: "Multiple Choice",
                      },

                      {
                        label: "Single Choice",
                        value: "Single Choice",
                      },
                      {
                        label: "True - False",
                        value: "True - False",
                      },
                    ]}
                    onChange={(e) =>
                      setGenerateVals({ ...generateVals, questionType: e })
                    }
                  />
                  <input
                    type="number"
                    placeholder="Number of questions"
                    value={generateVals.noOfQuestion}
                    onChange={(e) =>
                      setGenerateVals({
                        ...generateVals,
                        noOfQuestion: e.target.value,
                      })
                    }
                  />
                </div>

                <button onClick={handleClear}>Clear Text</button>
              </div>

              <Button
                className={QuestionStyles.generateButton}
                onClick={generateQues}
              >
                Generate
              </Button>
            </div>
          )}
        </Modal>
      </div>
  );
};

export default QuestionManager;
