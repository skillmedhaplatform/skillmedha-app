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
} from "antd";
import { useDispatch, useSelector } from "react-redux";
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
import {
  addQuestionToTest,
  getOneTests,
  removeQuestionFromTest,
} from "@/redux/slices/testportal_admin/slice/test";
import QuestionSkeleton from "@/modules/testportal_admin/components/reusable-comps/skeleton/questionSkeleton";
import {
  deleteComprehensionQues,
  deleteQuestionComprehension,
  getOneComprehensionQuestion,
} from "@/redux/slices/testportal_admin/slice/comprehensionQestions";
import { parseIfJson } from "@/utils/windowMW";
import {
  CaretRightOutlined,
  CheckCircleOutlined,
  StarOutlined,
  TagOutlined,
  SettingOutlined,
  PlusOutlined
} from "@ant-design/icons";

const stripHtml = (html) =>
  typeof html === "string" ? html.replace(/&nbsp;/g, " ").replace(/<[^>]*>/g, "") : "";

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
  const selectedQuestion = useSelector((state) => state.questions.bulkEdit) || {};
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
  const pathName = usePathname();
  const nav = useRouter();

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [confirmDeleteLoading, setConfirmDeleteLoading] = useState(false);
  const [comprehensionDeleteModal, setComprehensionDeleteModal] = useState(false);
  const [compQuestions, setcompQuestions] = useState(false);
  const [comprehensionQuestionDetails, setComprehensionQuestionDetails] = useState({});
  const [deleteSelect, setDeleteSelect] = useState(1);
  const [selectedTests, setSelectedTests] = useState([]);
  const [openCopyModal, setOpenCopyModal] = useState(false);

  const [isExpanded, setIsExpanded] = useState(false);

  const questionTypes = {
    "Single Choice": "single",
    "Multiple Choice": "multiple",
    "Short Paragraph": "para",
    "True - False": "tf",
  };

  const dropdownFunction = (e) => {
    if (e.key === "0") {
      dispatch(setQuestionManagerComp("addquestion"));
      dispatch(setQuestionVals({ questionType: "Multiple Choice" }));
      if (question?.questionType === "Coding Question") {
        nav.replace(pathName + `/coding__${question?._id}`);
      } else {
        nav.replace(pathName + "/" + question?._id);
      }
    }
    if (e.key === "1") {
      setOpenDeleteModal(true);
    }
    if (e.key === "2") {
      setOpenCopyModal(true);
    }
  };

  const handleDelete = () => {
    setConfirmDeleteLoading(true);
    if (deleteSelect === 1) {
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
    if (deleteSelect === 2) {
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

  const isCorrectAnswer = (q, optionKey) => {
    if (q?.questionType === "Single Choice") {
      return q?.answer?.singleChoice?.[optionKey] === true;
    }
    if (q?.questionType === "Multiple Choice") {
      return q?.answer?.multipleChoice?.[optionKey] === true;
    }
    if (q?.questionType === "True - False" || q?.questionType === "True/False") {
      if (q?.answer?.trueFalse !== undefined) {
        const ansVal = q?.answer?.trueFalse;
        if (optionKey === "option1" && (ansVal === true || ansVal === "true")) return true;
        if (optionKey === "option2" && (ansVal === false || ansVal === "false")) return true;
      }
    }
    return false;
  };

  if (singleTestStatus === "pending") {
    return (
      <div className={qStyles.cardRow}>
        <QuestionSkeleton />
      </div>
    );
  }

  if (!question) {
    return (
      <div className={qStyles.No_Questions_container}>
        No Questions added yet!
      </div>
    );
  }

  // Handle Comprehension Question type specifically
  if (question?.questionType?.includes("Comprehension")) {
    return (
      <div className={`${qStyles.cardRow} ${isExpanded ? qStyles.expanded : ""}`}>
        <div className={qStyles.collapsedHeader} onClick={() => setIsExpanded(!isExpanded)}>
          <div className={qStyles.leftPart}>
            <button
              className={`${qStyles.toggleBtn} ${isExpanded ? qStyles.active : ""}`}
              onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
            >
              <CaretRightOutlined />
            </button>
            <input
              type="checkbox"
              className={qStyles.checkbox}
              checked={!!selectedQuestion[question?._id]}
              onChange={(e) =>
                dispatch(
                  selectQuestion({
                    questionId: question?._id,
                    status: e.target.checked,
                  })
                )
              }
              onClick={(e) => e.stopPropagation()}
            />
            <div className={qStyles.numberBadge}>{index + 1}</div>
            <div className={qStyles.descriptionText}>
              [Comprehension] {stripHtml(parseIfJson(question?.questionContent?.question || ""))}
            </div>
          </div>
          <div className={qStyles.rightPart}>
            <div className={qStyles.tagsRow}>
              <span className={qStyles.tagCategory}>Comprehension</span>
              <span className={qStyles.tagScore}>
                <StarOutlined /> {parseInt(question?.questionContentArr?.reduce((total, q) => total + parseInt(q?.scoreSettings?.pointsForCorrectAns || q?.scoreSettings?.PointsForEachCorrectAnswer || 0), 0) || 0)} pts
              </span>
              <span className={qStyles.tagType}>{question?.questionType}</span>
            </div>
            <div className={qStyles.menuButtonWrapper} onClick={(e) => e.stopPropagation()}>
              <Dropdown
                menu={{
                  items,
                  onClick: (e) => {
                    if (e.key === "0") {
                      dispatch(setQuestionManagerComp("addquestion"));
                      dispatch(setQuestionVals({ questionType: "Multiple Choice" }));
                      dispatch(getOneComprehensionQuestion({ id: question?._id }));
                      nav.replace(pathName + "/new-comprehension-question?qid=" + question?._id);
                    }
                    if (e.key === "1") {
                      setComprehensionDeleteModal(true);
                      setComprehensionQuestionDetails({ compId: question?._id });
                    }
                    if (e.key === "2") {
                      setOpenCopyModal(true);
                    }
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

        {isExpanded && (
          <div className={qStyles.expandedContent}>
            <div
              className={qStyles.expandedTitle}
              dangerouslySetInnerHTML={{ __html: parseIfJson(question?.questionContent?.question || "") }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {question?.questionContentArr?.map((eachEle, eleIndex) => {
                const subOptionKeys = Object.keys(eachEle?.questionContent || {})
                  .filter((k) => k.includes("option"))
                  .sort((a, b) => parseInt(a.replace("option", ""), 10) - parseInt(b.replace("option", ""), 10));

                return (
                  <div key={eachEle?._id || eleIndex} style={{ borderLeft: "3px solid #1e69da", paddingLeft: "1rem", margin: "0.5rem 0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                      <span style={{ fontWeight: 700, color: "#1e293b" }}>{`Sub-Question ${eleIndex + 1}`}</span>
                      <div className={qStyles.tagsRow} style={{ scale: "0.9" }}>
                        <span className={qStyles.tagScore}><StarOutlined /> {parseInt(eachEle?.scoreSettings?.pointsForCorrectAns || eachEle?.scoreSettings?.PointsForEachCorrectAnswer || 0)} pts</span>
                        <span className={qStyles.tagType}>{eachEle?.questionType}</span>
                        <div onClick={(e) => e.stopPropagation()}>
                          <Dropdown
                            menu={{
                              items,
                              onClick: (e) => {
                                if (e.key === "0") {
                                  dispatch(setQuestionManagerComp("addquestion"));
                                  dispatch(setQuestionVals({ questionType: "Multiple Choice" }));
                                  nav.replace(pathName + "/" + eachEle?._id);
                                }
                                if (e.key === "1") {
                                  setcompQuestions(true);
                                  setValsToDel({
                                    compId: question?._id,
                                    questionId: eachEle?._id,
                                    testId: selectedId,
                                  });
                                }
                                if (e.key === "2") {
                                  setOpenCopyModal(true);
                                }
                              },
                            }}
                            trigger={["click"]}
                            placement="bottomRight"
                          >
                            <button className={qStyles.menuBtn} style={{ height: "24px", width: "24px" }}>
                              <HiDotsVertical size={12} />
                            </button>
                          </Dropdown>
                        </div>
                      </div>
                    </div>
                    <div
                      style={{ fontSize: "14px", fontWeight: 600, color: "#334155", marginBottom: "0.5rem" }}
                      dangerouslySetInnerHTML={{ __html: parseIfJson(eachEle?.questionContent?.question || "") }}
                    />
                    <div className={qStyles.optionsList}>
                      {subOptionKeys.map((key, optIdx) => {
                        const isCorrect = isCorrectAnswer(eachEle, key);
                        return (
                          <div key={key} className={`${qStyles.optionRow} ${isCorrect ? qStyles.correct : ""}`}>
                            <div className={qStyles.optionLeft}>
                              <div className={`${qStyles.letterBadge} ${isCorrect ? qStyles.correct : ""}`}>
                                {String.fromCharCode(65 + optIdx)}
                              </div>
                              <span
                                className={qStyles.optionContentText}
                                dangerouslySetInnerHTML={{ __html: parseIfJson(eachEle?.questionContent[key]) }}
                              />
                            </div>
                            {isCorrect && <span className={qStyles.checkIcon}><CheckCircleOutlined /></span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <Modal
          title="Select Tests to copy this question"
          open={openCopyModal}
          onCancel={() => setOpenCopyModal(false)}
          footer={[
            <Button key="cancel" onClick={() => setOpenCopyModal(false)}>Cancel</Button>,
            <Button key="submit" type="primary" onClick={handleCopy}>Submit</Button>,
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
              <Select.Option key={test._id} value={test._id}>{test.title}</Select.Option>
            ))}
          </Select>
        </Modal>

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
            <span className={qStyles.Comprehension_delete_btn}>delete</span> this Comprehension Question{" "}
          </strong>
        </Modal>

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
          <strong>
            Are you sure you want to{" "}
            <span className={qStyles.Comprehension_delete_btn}>delete</span> this Question From The Comprehension{" "}
          </strong>
        </Modal>
      </div>
    );
  }

  // Standard Question rendering (Single Choice, Multiple Choice, Coding, Short Paragraph, True/False)
  const optionKeys = Object.keys(question?.questionContent || {})
    .filter((k) => k.includes("option"))
    .sort((a, b) => parseInt(a.replace("option", ""), 10) - parseInt(b.replace("option", ""), 10));

  const score = parseInt(
    question?.scoreSettings?.pointsForCorrectAns ||
    question?.scoreSettings?.PointsForEachCorrectAnswer ||
    question?.questionScore ||
    0
  );
  const category = question?.questionCategory?.[0]?.name || "General";
  const difficulty = score > 5 ? "Hard" : score > 2 ? "Medium" : "Easy";

  return (
    <div className={`${qStyles.cardRow} ${isExpanded ? qStyles.expanded : ""}`}>
      <div className={qStyles.collapsedHeader} onClick={() => setIsExpanded(!isExpanded)}>
        <div className={qStyles.leftPart}>
          <button
            className={`${qStyles.toggleBtn} ${isExpanded ? qStyles.active : ""}`}
            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
          >
            <CaretRightOutlined />
          </button>
          <input
            type="checkbox"
            className={qStyles.checkbox}
            checked={!!selectedQuestion[question?._id]}
            onChange={(e) =>
              dispatch(
                selectQuestion({
                  questionId: question?._id,
                  status: e.target.checked,
                })
              )
            }
            onClick={(e) => e.stopPropagation()}
          />
          <div className={qStyles.numberBadge}>{index + 1}</div>
          <div className={qStyles.descriptionText}>
            {stripHtml(parseIfJson(question?.questionContent?.question || ""))}
          </div>
        </div>

        <div className={qStyles.rightPart}>
          <div className={qStyles.tagsRow}>
            <span className={qStyles.tagCategory}>{category}</span>
            <span className={qStyles.tagScore}>
              <StarOutlined /> {score} pts
            </span>
            <span className={qStyles.tagType}>{question?.questionType}</span>
            <span className={`${qStyles.tagDifficulty} ${score > 5 ? qStyles.hard : score > 2 ? qStyles.medium : qStyles.easy}`}>
              {difficulty}
            </span>
          </div>

          <div className={qStyles.menuButtonWrapper} onClick={(e) => e.stopPropagation()}>
            <Dropdown
              menu={{
                items,
                onClick: (e) => dropdownFunction(e),
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

      {isExpanded && (
        <div className={qStyles.expandedContent}>
          <div
            className={qStyles.expandedTitle}
            dangerouslySetInnerHTML={{ __html: parseIfJson(question?.questionContent?.question || "") }}
          />

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

          {optionKeys.length > 0 && (
            <div className={qStyles.optionsList}>
              {optionKeys.map((key, optIdx) => {
                const isCorrect = isCorrectAnswer(question, key);
                return (
                  <div key={key} className={`${qStyles.optionRow} ${isCorrect ? qStyles.correct : ""}`}>
                    <div className={qStyles.optionLeft}>
                      <div className={`${qStyles.letterBadge} ${isCorrect ? qStyles.correct : ""}`}>
                        {String.fromCharCode(65 + optIdx)}
                      </div>
                      <span
                        className={qStyles.optionContentText}
                        dangerouslySetInnerHTML={{ __html: parseIfJson(question?.questionContent[key]) }}
                      />
                    </div>
                    {isCorrect && <span className={qStyles.checkIcon}><CheckCircleOutlined /></span>}
                  </div>
                );
              })}
            </div>
          )}

          <div className={qStyles.expandedMetadata}>
            <span className={qStyles.metaItem}>
              <StarOutlined /> Score: {score} pts
            </span>
            <span className={qStyles.metaItem}>
              <TagOutlined /> Category: {category}
            </span>
            <span className={qStyles.metaItem}>
              <SettingOutlined /> Difficulty: {difficulty}
            </span>
          </div>
        </div>
      )}

      <Modal
        title="Select Tests to copy this question"
        open={openCopyModal}
        onCancel={() => setOpenCopyModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setOpenCopyModal(false)}>Cancel</Button>,
          <Button key="submit" type="primary" onClick={handleCopy}>Submit</Button>,
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
            <Select.Option key={test._id} value={test._id}>{test.title}</Select.Option>
          ))}
        </Select>
      </Modal>

      <Modal
        title="Delete/Remove Question"
        open={openDeleteModal}
        onOk={handleDelete}
        confirmLoading={confirmDeleteLoading}
        onCancel={() => setOpenDeleteModal(false)}
      >
        <Radio.Group onChange={(e) => setDeleteSelect(e.target.value)} value={deleteSelect}>
          <Radio value={1}>Remove Question From Current Test</Radio>
          <Radio value={2}>
            Delete Question From Question Bank {`<The Question(s) will be permanentaly deleted>`}
          </Radio>
        </Radio.Group>
      </Modal>
    </div>
  );
};

export default QuestionCard;
