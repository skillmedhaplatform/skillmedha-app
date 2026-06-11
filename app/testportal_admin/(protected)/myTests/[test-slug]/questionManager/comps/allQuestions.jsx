"use client";
import React, { useEffect, useRef, useState } from "react";
import qStyles from "./styles/questionCard.module.scss";
import { HiDotsVertical } from "react-icons/hi";
import {
  Popconfirm,
  Dropdown,
  Space,
  Modal,
  Radio,
  Select,
  Button,
  message,
  Popover,
  Collapse,
  ConfigProvider,
} from "antd";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import {
  clearSelectQuestions,
  deleteQuestion,
  selectQuestion,
} from "@/redux/slices/testportal_admin/slice/questions";
import {
  setQuestionManagerComp,
  setQuestionVals,
} from "@/redux/slices/testportal_admin/slice/stepform";
import { useParams, usePathname, useRouter } from "next/navigation";
import { setSstorage } from "@/utils/universalUtils/windowMW";
import {
  addQuestionToTest,
  getOneTests,
  getTests,
  removeQuestionFromTest,
} from "@/redux/slices/testportal_admin/slice/test";
import QuestionSkeleton from "@/modules/testportal_admin/components/reusable-comps/skeleton/questionSkeleton";
import {
  deleteComprehensionQues,
  deleteQuestionComprehension,
  getOneComprehensionQuestion,
} from "@/redux/slices/testportal_admin/slice/comprehensionQestions";
import { parseIfJson } from "@/utils/windowMW";

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
const QuestionCard = ({ question, index }) => {
  const [options, setOptions] = useState();
  const dispatch = useDispatch();
  const selectedQuestion = useSelector((state) => state.questions.bulkEdit);
  const allTests = useSelector((state) => state.tests.value);

  const singleTestStatus = useSelector(
    (state) => state.tests.singleTestStatus.status
  );

  const [valsTodel, setValsToDel] = useState({
    compId: "",
    questionId: "",
  });

  const params = useParams();
  const selectedId = params["test-slug"]?.split("_id-")[1];

  // useEffect(() => {
  //   if (!allTests?.length) {
  //     console.log(allTests?.length);
  //     // dispatch(getOneTests({_id: selectedId}))
  //     // dispatch(getTests({ limit: 10, cursor: null }));
  //   }
  // }, [allTests?.length]);

  const questionTypes = {
    "Single Choice": "single",
    "Multiple Choice": "multiple",
    "Short Paragraph": "para",
    "True - False": "tf",
  };
  const pathName = usePathname();
  const nav = useRouter();

  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const [confirmDeleteLoading, setConfirmDeleteLoading] = useState(false);

  const [comprehensionDeleteModal, setComprehensionDeleteModal] =
    useState(false);

  const [comprehensionQuestionDetails, setComprehensionQuestionDetails] =
    useState({});
  const [deleteSelect, setDeleteSelect] = useState(1);

  const [openCopyModal, setOpenCopyModal] = useState(false);
  const [selectedTests, setSelectedTests] = useState([]);
  const [compQuestions, setcompQuestions] = useState(false);

  const mediaRefs = useRef([]);

  // const handlePlay = (id) => {
  //   Object.keys(mediaRefs.current).forEach((key) => {
  //     if (key !== id && mediaRefs.current[key]) {
  //       mediaRefs.current[key].pause();
  //     }
  //   });
  // };
  const dropdownFunction = (e) => {
    if (e.key == "0") {
      dispatch(setQuestionManagerComp("addquestion"));
      dispatch(setQuestionVals({ questionType: "Multiple Choice" }));
      console.log(question?.questionType);
      if (question?.questionType === "Coding Question") {
        nav.replace(pathName + `/coding__${question?._id}`);
      } else {
        nav.replace(pathName + "/" + question?._id);
      }
    }
    if (e.key == "1") {
      setOpenDeleteModal(true);
    }
    if (e.key == "2") {
      setOpenCopyModal(true);
    }
  };

  const handleDelete = () => {
    setConfirmDeleteLoading(true);
    if (deleteSelect == 1) {
      dispatch(
        removeQuestionFromTest({
          selectedQuestions: { [question?._id]: true },
          setConfirmDeleteLoading,
          setOpenDeleteModal,
          testId: selectedId,
          dispatch,
        })
      ).then((resp) => {
        dispatch(clearSelectQuestions());
        if (resp.payload) {
          window.location.reload();
        }
      });
    }
    if (deleteSelect == 2) {
      dispatch(
        deleteQuestion({
          selectedQuestions: { [question?._id]: true },
          setConfirmDeleteLoading,
          setOpenDeleteModal,
          dispatch,
        })
      ).then((resp) => {
        dispatch(clearSelectQuestions());
        if (resp.payload) {
          window.location.reload();
        }
      });
    }
  };

  const handleCopy = () => {
    dispatch(
      addQuestionToTest({
        testId: selectedTests,
        selectedQuestions: { [question?._id]: true },
      })
    ).then((res) => {
      dispatch(clearSelectQuestions());
      if (res.payload) {
        window.location.reload();
      }
    });

    setOpenCopyModal(false);
  };

  return (
    <>
      {singleTestStatus === "pending" ? (
        <div className={qStyles.questionCard}>
          <QuestionSkeleton />
        </div>
      ) : !question ? (
        <div className={qStyles.noQuestionsMessage}>
          No Questions added yet!
        </div>
      ) : question?.questionType?.includes("Comprehension") ? (
        <div className={qStyles.questionCardComp}>
          {[question]?.map((eachCompQuestion, compIndex) => {
            return (
              <Collapse
                bordered={false}
                items={[
                  {
                    key: compIndex,
                    label: (
                      <div>
                        <div className={qStyles.header}>
                          <div>
                            <input
                              type="checkbox"
                              className={qStyles.checkbox}
                              checked={
                                selectedQuestion[question?._id] ? true : false
                              }
                              onChange={(e) =>
                                dispatch(
                                  selectQuestion({
                                    questionId: question?._id,
                                    status: e.target.checked,
                                  })
                                )
                              }
                            />
                            <span>{`Comprehension ${index + 1}`}</span>
                          </div>

                          <div></div>
                          <div className={qStyles.buttons}>
                            <button>
                              <strong>Score:</strong>{" "}
                              {parseInt(
                                eachCompQuestion?.questionContentArr?.reduce(
                                  (total, question) =>
                                    total +
                                    parseInt(
                                      question?.scoreSettings
                                        ?.pointsForCorrectAns ||
                                        question?.scoreSettings
                                          ?.PointsForEachCorrectAnswer ||
                                        0
                                    ),
                                  0
                                ) || 0
                              )}
                            </button>

                            {eachCompQuestion?.questionCategory?.length > 0 &&
                              (eachCompQuestion?.questionCategory.length > 1 ? (
                                <Popover
                                  content={eachCompQuestion?.questionCategory.map(
                                    (e) => (
                                      <p
                                        style={{
                                          fontSize: ".8rem",
                                          fontWeight: "700",
                                        }}
                                      >
                                        {e.name}
                                      </p>
                                    )
                                  )}
                                  title={
                                    <h4 style={{ textDecoration: "underline" }}>
                                      Tags
                                    </h4>
                                  }
                                  trigger="hover"
                                  placement="bottom"
                                >
                                  <button>
                                    <strong>Tag : </strong>{" "}
                                    {
                                      eachCompQuestion?.questionCategory[0]
                                        ?.name
                                    }
                                    &nbsp;&nbsp;&nbsp;
                                    {`+${
                                      eachCompQuestion?.questionCategory
                                        .length - 1
                                    }`}
                                  </button>
                                </Popover>
                              ) : (
                                <button>
                                  <strong>Tag : </strong>{" "}
                                  {eachCompQuestion?.questionCategory[0]?.name}
                                </button>
                              ))}

                            <button>
                              <strong>Type :</strong>{" "}
                              {eachCompQuestion?.questionType}
                            </button>
                            <Dropdown
                              menu={{
                                items,
                                onClick: (e) => {
                                  if (e.key == "0") {
                                    dispatch(
                                      setQuestionManagerComp("addquestion")
                                    );
                                    dispatch(
                                      setQuestionVals({
                                        questionType: "Multiple Choice",
                                      })
                                    );

                                    dispatch(
                                      getOneComprehensionQuestion({
                                        id: eachCompQuestion?._id,
                                      })
                                    );
                                    nav.replace(
                                      pathName +
                                        "/new-comprehension-question?qid=" +
                                        eachCompQuestion?._id
                                    );
                                  }
                                  if (e.key == "1") {
                                    setComprehensionDeleteModal(true);
                                    setComprehensionQuestionDetails(
                                      (preVal) => ({
                                        ...preVal,
                                        compId: eachCompQuestion?._id,
                                      })
                                    );
                                  }
                                  if (e.key == "2") {
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
                        {eachCompQuestion?.questionType ===
                        "Reading Comprehension" ? (
                          <div
                            dangerouslySetInnerHTML={{
                              __html: parseIfJson(
                                eachCompQuestion?.comprehensionText
                              ),
                            }}
                            className={qStyles.comprehension_text}
                          ></div>
                        ) : (
                          eachCompQuestion?.resources != undefined &&
                          eachCompQuestion?.resources != "" &&
                          (eachCompQuestion?.questionType !==
                            "Reading Comprehension" &&
                          eachCompQuestion?.questionType ===
                            "Video Comprehension"
                            ? eachCompQuestion?.resources?.url !== "" && (
                                <video
                                  key={eachCompQuestion?.resources?.url}
                                  src={eachCompQuestion?.resources?.url}
                                  controls
                                />
                              )
                            : eachCompQuestion?.resources?.url !== "" && (
                                <audio
                                  // ref={(el) =>
                                  //   (mediaRefs.current[eachCompQuestion?._id] =
                                  //     el)
                                  // }
                                  // onPlay={() =>
                                  //   handlePlay(eachCompQuestion?._id)
                                  // }
                                  src={eachCompQuestion?.resources?.url}
                                  controls
                                />
                              ))
                        )}
                      </div>
                    ),
                    children: eachCompQuestion?.questionContentArr?.map(
                      (eachEle, eleIndex) => {
                        return (
                          <>
                            {eachEle?._id ? (
                              <Collapse
                                bordered={false}
                                items={[
                                  {
                                    key: eleIndex,
                                    label: (
                                      <div>
                                        <div className={qStyles.header}>
                                          <div>
                                            {/* <input
                                              type="checkbox"
                                              className={qStyles.checkbox}
                                              checked={
                                                selectedQuestion[question?._id]
                                                  ? true
                                                  : false
                                              }
                                              onChange={(e) =>
                                                dispatch(
                                                  selectQuestion({
                                                    questionId: question?._id,
                                                    status: e.target.checked,
                                                  })
                                                )
                                              }
                                            /> */}
                                            <span>{`Question ${
                                              eleIndex + 1
                                            }`}</span>
                                          </div>

                                          <div></div>
                                          <div className={qStyles.buttons}>
                                            <button>
                                              <strong>Score:</strong>{" "}
                                              {parseInt(
                                                eachEle?.scoreSettings
                                                  ?.pointsForCorrectAns ||
                                                  eachEle?.scoreSettings
                                                    ?.PointsForEachCorrectAnswer
                                              )}
                                            </button>

                                            {eachEle?.questionCategory?.length >
                                              0 &&
                                              (eachEle?.questionCategory
                                                .length > 1 ? (
                                                <Popover
                                                  content={eachEle?.questionCategory.map(
                                                    (e) => (
                                                      <p
                                                        style={{
                                                          fontSize: ".8rem",
                                                          fontWeight: "700",
                                                        }}
                                                      >
                                                        {e.name}
                                                      </p>
                                                    )
                                                  )}
                                                  title={
                                                    <h4
                                                      style={{
                                                        textDecoration:
                                                          "underline",
                                                      }}
                                                    >
                                                      Tags
                                                    </h4>
                                                  }
                                                  trigger="hover"
                                                  placement="bottom"
                                                >
                                                  <button>
                                                    <strong>Tag : </strong>{" "}
                                                    {
                                                      eachEle
                                                        ?.questionCategory[0]
                                                        ?.name
                                                    }
                                                    &nbsp;&nbsp;&nbsp;
                                                    {`+${
                                                      eachEle?.questionCategory
                                                        .length - 1
                                                    }`}
                                                  </button>
                                                </Popover>
                                              ) : (
                                                <button>
                                                  <strong>Tag : </strong>{" "}
                                                  {
                                                    eachEle?.questionCategory[0]
                                                      ?.name
                                                  }
                                                </button>
                                              ))}

                                            <button>
                                              <strong>Type :</strong>{" "}
                                              {eachEle?.questionType}
                                            </button>
                                            <Dropdown
                                              menu={{
                                                items,
                                                onClick: (e) => {
                                                  if (e.key == "0") {
                                                    dispatch(
                                                      setQuestionManagerComp(
                                                        "addquestion"
                                                      )
                                                    );
                                                    dispatch(
                                                      setQuestionVals({
                                                        questionType:
                                                          "Multiple Choice",
                                                      })
                                                    );

                                                    nav.replace(
                                                      pathName +
                                                        "/" +
                                                        eachEle?._id
                                                    );
                                                  }
                                                  if (e.key == "1") {
                                                    setcompQuestions(true);
                                                    setValsToDel({
                                                      compId:
                                                        eachCompQuestion?._id,
                                                      questionId: eachEle?._id,
                                                      testId: selectedId,
                                                    });
                                                  }
                                                  if (e.key == "2") {
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
                                        <div
                                          dangerouslySetInnerHTML={{
                                            __html: parseIfJson(
                                              eachEle?.questionContent?.question
                                            ),
                                          }}
                                          className={qStyles.comprehension_text}
                                        ></div>
                                      </div>
                                    ),
                                    children: Object.keys(
                                      eachEle?.questionContent
                                    )
                                      ?.filter((ques) => {
                                        return ques.includes("option");
                                      })
                                      .map((e, indexes) => {
                                        let parsedContent = "";
                                        try {
                                          parsedContent = parseIfJson(
                                            eachEle?.questionContent[e]
                                          );
                                        } catch (error) {
                                          console.error(
                                            "Failed to parse JSON:",
                                            error
                                          );
                                        }
                                        return (
                                          <div
                                            className={qStyles.ansCard}
                                            key={indexes}
                                          >
                                            {String.fromCharCode(
                                              97 + indexes
                                            ).toUpperCase() + "."}{" "}
                                            <span
                                              className={qStyles.optionContent}
                                              dangerouslySetInnerHTML={{
                                                __html: parsedContent,
                                              }}
                                            ></span>
                                          </div>
                                        );
                                      }),
                                  },
                                ]}
                              />
                            ) : null}
                          </>
                        );
                      }
                    ),
                  },
                ]}
              />
            );
          })}
        </div>
      ) : (
        <>
          <div
            className={qStyles.questionCard}
            key={index}
            onClick={() => {
              dispatch(
                setQuestionVals({
                  question,
                  questionType: questionTypes[question?.questionType],
                  answer: {},
                })
              );
            }}
          >
            <div className={qStyles.header}>
              <div>
                <input
                  type="checkbox"
                  className={qStyles.checkbox}
                  checked={selectedQuestion[question?._id] ? true : false}
                  onChange={(e) =>
                    dispatch(
                      selectQuestion({
                        questionId: question?._id,
                        status: e.target.checked,
                      })
                    )
                  }
                />
                <span>{`Question ${index + 1}`}</span>
              </div>

              <div></div>
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
                        {question?.questionCategory[0]?.name}``
                        &nbsp;&nbsp;&nbsp;
                        {`+${question?.questionCategory.length - 1}`}``
                      </button>
                    </Popover>
                  ) : (
                    <button>
                      <strong>Tag : </strong>{" "}
                      {question?.questionCategory[0]?.name}
                    </button>
                  ))}

                <button>
                  <strong>Type :</strong> {question?.questionType}
                </button>
                <Dropdown
                  menu={{
                    items,
                    onClick: (e) => {
                      dropdownFunction(e);
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
              {(question?.questionType === "Video Question" ||
                question?.questionType === "Audio Question") &&
                question?.questionContent &&
                typeof question?.questionContent === "object" &&
                question?.resources &&
                Object.keys(question?.resources).length > 0 && (
                  <div className={qStyles.video_div}>
                    {question?.resources.type === "video" ? (
                      <video
                        key={question?.resources?.file}
                        src={question?.resources?.file}
                        controls
                      />
                    ) : question?.resources.type === "audio" ? (
                      <audio
                        src={question?.resources?.file}
                        controls
                        // ref={(el) => (mediaRefs.current[0] = el)}
                        // onPlay={() => handlePlay(0)}
                      />
                    ) : null}{" "}
                  </div>
                )}
              {question?.questionType == "Single Choice" &&
                question?.questionContent &&
                typeof question?.questionContent == "object" &&
                Object.keys(question?.questionContent)
                  ?.filter((ques) => {
                    return ques.includes("option");
                  })
                  .map((e, indexes) => {
                    const parsedContent = parseIfJson(
                      question?.questionContent[e]
                    );

                    const shouldRenderAsHtml =
                      typeof parsedContent === "string" &&
                      /<[a-z][\s\S]*>/i.test(parsedContent) &&
                      !/^".*"$/.test(parsedContent);

                    return (
                      <div className={qStyles.ansCard} key={indexes}>
                        {String.fromCharCode(97 + indexes).toUpperCase() + "."}{" "}
                        {/* {!shouldRenderAsHtml ? (
                          <span
                            className={qStyles.optionContent}
                            dangerouslySetInnerHTML={{ __html: parsedContent }}
                          />
                        ) : (
                          <span className={qStyles.optionContent}>
                            {parsedContent}
                          </span>
                        )} */}
                        <span
                          className={qStyles.optionContent}
                          dangerouslySetInnerHTML={{
                            __html: parseIfJson(question?.questionContent[e]),
                          }}
                        />
                      </div>
                    );
                  })}
              {question?.questionType == "Audio Question" &&
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
              {question?.questionType == "Video Question" &&
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
          </div>
        </>
      )}
      <>
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
      </>
      <>
        <Modal
          open={comprehensionDeleteModal}
          onCancel={() => setComprehensionDeleteModal(false)}
          okText="Yes"
          cancelText="No"
          onOk={() => {
            dispatch(
              deleteComprehensionQues({
                compId: comprehensionQuestionDetails?.compId,
                testId: selectedId,
                dispatch,
              })
            );
            setComprehensionDeleteModal(false);
          }}
        >
          <strong>
            Are you sure you want to{" "}
            <span className={qStyles.Comprehension_delete_btn}>delete</span>{" "}
            this Comprehension Question{" "}
          </strong>
        </Modal>
      </>
      <>
        <Modal
          open={compQuestions}
          onCancel={() => setcompQuestions(false)}
          width={600}
          onOk={() => {
            dispatch(
              deleteQuestionComprehension({
                ...valsTodel,
                dispatch,
              })
            );
            setcompQuestions(false);
          }}
        >
          {" "}
          <strong>
            Are you sure you want to{" "}
            <span className={qStyles.Comprehension_delete_btn}>delete</span>{" "}
            this Question From The Comprehension{" "}
          </strong>
        </Modal>
      </>
    </>
  );
};

export default QuestionCard;
