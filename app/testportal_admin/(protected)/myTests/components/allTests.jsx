"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import CourseStyles from "./testsCar.module.scss";
import DownloadTestStyles from "./download.module.scss";
import AllTestsStyles from "../styles/alltests.module.scss";
import { useParams, useRouter } from "next/navigation";
import { DeleteTest, getOneTests, getTests } from "@/redux/slices/testportal_admin/slice/test";
import { setFormValues } from "@/redux/slices/testportal_admin/slice/stepform";
import { Button, Checkbox, Collapse, message, Modal, Popconfirm, Tooltip, Pagination } from "antd";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import { 
  QuestionCircleOutlined, 
  ClockCircleOutlined, 
  StarOutlined, 
  FileTextOutlined,
  EyeOutlined,
  SyncOutlined,
  LineChartOutlined
} from "@ant-design/icons";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import { parseIfJson } from "@/utils/windowMW";
import QuesComp from "@/app/testportal_admin/(protected)/results-database/components/quesComp";
import DownloadTest from "./downloadtest";

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
];

const LocalCardSkeleton = () => (
  <div className={CourseStyles.skeletonCard}>
    <div className={CourseStyles.skeletonImage} />
    <div className={CourseStyles.skeletonContent}>
      <div className={CourseStyles.skeletonTitle} />
      <div className={CourseStyles.skeletonTags}>
        <div className={CourseStyles.skeletonTag} style={{ width: "60px" }} />
        <div className={CourseStyles.skeletonTag} style={{ width: "80px" }} />
      </div>
      <div className={CourseStyles.skeletonStats}>
        <div className={CourseStyles.skeletonStat} />
        <div className={CourseStyles.skeletonStat} />
        <div className={CourseStyles.skeletonStat} />
      </div>
      <div className={CourseStyles.skeletonDesc1} />
      <div className={CourseStyles.skeletonDesc2} />
    </div>
  </div>
);

const AllTestsComp = (props) => {
  const SingleTest = useSelector((state) => state.tests.test);
  const [openPopupIndex, setOpenPopupIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const fullContentRef = useRef();

  const showModal = (test) => {
    setSelectedTest(test);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedTest(null);
  };

  const togglePopup = (index) => {
    setOpenPopupIndex(openPopupIndex === index ? null : index);
  };

  const params = useParams();
  const selectedId = params["test-slug"]?.split("_id-")[1];
  const dispatch = useDispatch();

  useEffect(() => {
    if (selectedId) {
      dispatch(getOneTests({ _id: selectedId }));
      if (SingleTest?._id) dispatch(setFormValues(SingleTest));
    }
  }, [!SingleTest?._id]);

  const reduxAllTests = useSelector((state) => state.tests.value) || [];
  const allTests = props.displayTests !== undefined ? props.displayTests : reduxAllTests;

  const allTestsStatus = useSelector(
    (state) => state.tests.getAllTestStatus.status
  );
  const loading = props.loading !== undefined ? props.loading : (allTestsStatus === "pending");

  const [cursor, setCursor] = useState(null);
  const [showLoadmore, setShowLoadmore] = useState(false);
  const containerRef = useRef(null);
  const nav = useRouter();
  const [countdowns, setCountdowns] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(4); // default 4

  // Reset to page 1 on test list count changes
  useEffect(() => {
    setCurrentPage(1);
  }, [allTests?.length]);

  const paginatedTests = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return allTests.slice(startIndex, startIndex + pageSize);
  }, [allTests, currentPage, pageSize]);

  // Helper to generate initials from test title
  const getInitials = (title = "") => {
    if (!title) return "T";
    const words = title.trim().split(/\s+/);
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + (words[1][0] || "")).toUpperCase();
  };

  // Helper to generate elegant gradient style for department/test fallback logo
  const getGradientStyle = (title = "") => {
    const hash = Array.from(title).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const gradients = [
        "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)", // Blue
        "linear-gradient(135deg, #ea580c 0%, #f97316 100%)", // Orange/ST theme
        "linear-gradient(135deg, #eab308 0%, #ca8a04 100%)", // Yellow/JS theme
        "linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)", // Teal
        "linear-gradient(135deg, #312e81 0%, #6366f1 100%)", // Indigo
    ];
    return gradients[hash % gradients.length];
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      const updatedCountdowns = {};

      allTests.forEach((test, index) => {
        const expiryDate =
          test?.time?.expiryDates?.accessClosingDate ||
          test?.time?.expiryDates?.testExpirationData;

        if (test?.time?.expiryDates?.expiry && expiryDate) {
          const targetDate = new Date(expiryDate);
          const today = new Date();
          const timeDifference = targetDate - today;

          if (timeDifference > 0) {
            let days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
            let hours = Math.floor(
              (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            );
            let minutes = Math.floor(
              (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
            );
            let seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

            hours = String(hours).padStart(2, "0");
            minutes = String(minutes).padStart(2, "0");
            seconds = String(seconds).padStart(2, "0");

            if (days > 0) {
              days = String(days).padStart(2, "0");
              updatedCountdowns[
                index
              ] = `${days}:${hours}:${minutes}:${seconds}`;
            } else {
              updatedCountdowns[index] = `${hours}:${minutes}:${seconds}`;
            }
          } else {
            updatedCountdowns[index] = "Expired";
          }
        } else {
          updatedCountdowns[index] = "No expiry set";
        }
      });

      setCountdowns(updatedCountdowns);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [allTests]);

  const onTestClick = (test) => {
    dispatch(getOneTests(test)).then((resp) => {
      if (resp?.payload?._id) {
        nav.replace(
          "/testportal_admin/myTests/" + test?.title?.split(" ").join("-") + `_id-${test?._id}`
        );
      }
    });
  };

  const handleDownload = () => {
    const loadingMessage = message.loading({ content: 'Downloading test...', key: 'download', duration: 0 });

    const input = fullContentRef.current;
    const questionSections = Array.from(input.querySelectorAll(".question-class"));

    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 190;
    const pageHeight = pdf.internal.pageSize.height;
    let currentPageHeight = 0;
    const questionGap = 10;

    const canvasPromises = questionSections.map((question) => {
      return html2canvas(question, {
        scale: 2,
        useCORS: true,
        scrollX: 0,
        scrollY: 0,
      }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        return { imgData, imgHeight };
      });
    });

    Promise.all(canvasPromises).then((canvases) => {
      canvases.forEach(({ imgData, imgHeight }, index) => {
        if (currentPageHeight + imgHeight + questionGap > pageHeight) {
          pdf.addPage();
          currentPageHeight = 10;
        }
        pdf.addImage(imgData, "PNG", 10, currentPageHeight, imgWidth, imgHeight, '', 'FAST');
        currentPageHeight += imgHeight + questionGap;
      });

      pdf.save(`${selectedTest?.title}.pdf`);
      message.success({ content: 'Test downloaded successfully!', key: 'download', duration: 2 });

    }).catch((error) => {
      console.error("Error generating PDF:", error);
      message.error({ content: 'Download failed!', key: 'download', duration: 2 });
    });
  };

  const hasAudioOrVideoQuestions = () => {
    if (selectedTest && selectedTest.questions) {
      return selectedTest.questions.some((question) => {
        return (
          question.resources?.url?.includes("video") ||
          question.resources?.url?.includes("audio")
        );
      });
    }
    return false;
  };

  const handleDownloadPDF = async (test) => {
    setIsModalOpen(true);
    setSelectedTest(test);
    setOpenPopupIndex(null);
  };

  const deleteTest = (test) => {
    dispatch(DeleteTest({ test, dispatch }));
    setOpenPopupIndex(null);
  };

  const fetchMore = () => {
    dispatch(
      getTests({ cursor: allTests[allTests?.length - 1]?._id, limit: 6 })
    ).finally(() => {
      setShowLoadmore(false);
    });
  };

  useEffect(() => {
    containerRef.current?.addEventListener("scroll", handleScroll);
    return () =>
      containerRef.current?.removeEventListener("scroll", handleScroll);
  }, [allTests?.length]);

  const handleScroll = () => {
    const element = containerRef.current;
    if (
      Math.abs(
        element.scrollHeight - element.scrollTop - element.clientHeight
      ) <= 1
    ) {
      setShowLoadmore(true);
    }
  };

  const [totalTestMarks, setTotalMarks] = useState([]);

  useEffect(() => {
    if (allTests?.length) {
      const calculatedScores = allTests.map((test) => {
        if (test?.questions?.length) {
          const updatedQues = [];

          for (let i = 0; i < test.questions.length; i++) {
            const question = test?.questions[i];
            if (question?.questionType?.includes("Comprehension")) {
              updatedQues.push(...(question?.questionContentArr || []));
            } else {
              updatedQues.push(question);
            }
          }

          const totalMarksEachTest = updatedQues.map((question) => {
            let score =
              Number(question?.scoreSettings?.pointsForCorrectAns) ||
              Number(question?.scoreSettings?.PointsForEachCorrectAnswer) ||
              0;

            if (
              question?.scoreSettings?.PointsForEachCorrectAnswer &&
              question?.answer?.multipleChoice
            ) {
              const correctOptionsCount = Object.values(
                question.answer.multipleChoice
              ).filter((isCorrect) => isCorrect === true).length;

              score =
                correctOptionsCount *
                question.scoreSettings.PointsForEachCorrectAnswer;
            }

            const bonusPoints = question?.scoreSettings
              ?.bonusPointsForAllCorrect
              ? Number(question?.scoreSettings?.bonusPointsForAllCorrect)
              : 0;

            return score + bonusPoints;
          });

          const total = totalMarksEachTest.reduce((acc, curr) => acc + curr, 0);
          return { id: test._id, score: total };
        } else {
          return { id: test._id, score: 0 };
        }
      });

      setTotalMarks(calculatedScores);
    }
  }, [allTests?.length]);

  return (
    <div className={CourseStyles.con} ref={containerRef}>
      <div className={CourseStyles.cardsContainer}>
        {loading ? (
          <>
            <LocalCardSkeleton />
            <LocalCardSkeleton />
            <LocalCardSkeleton />
            <LocalCardSkeleton />
          </>
        ) : paginatedTests?.length > 0 ? (
          paginatedTests.map((test, index) => {
            const actualIndex = (currentPage - 1) * pageSize + index;
            let questionNo = 1;
            const testScore =
              totalTestMarks.find((mark) => mark.id === test._id)?.score || 0;
            const hasThumbnail = test?.thumbnail && !test.thumbnail.includes("20190605163315-sale-19736");

            return (
              <React.Fragment key={test?._id || actualIndex}>
                <div
                  className={CourseStyles.card_cont}
                  onClick={() => onTestClick(test)}
                >
                  {/* Card Image */}
                  <div className={CourseStyles.imageWrapper}>
                    <div className={CourseStyles.imageInner}>
                      {hasThumbnail ? (
                        <img
                          src={test?.thumbnail}
                          className={CourseStyles.cardImage}
                          alt={test?.title}
                        />
                      ) : (
                        <div 
                          className={CourseStyles.fallbackLogo}
                          style={{ background: getGradientStyle(test?.title) }}
                        >
                          {getInitials(test?.title)}
                        </div>
                      )}
                      
                      {/* Checkbox */}
                      <div className={CourseStyles.checkboxWrapper} onClick={(e) => e.stopPropagation()}>
                        <Checkbox className={CourseStyles.checkbox} />
                      </div>

                      {/* Status Badge */}
                      {countdowns[actualIndex] === "Expired" ? (
                        <div className={`${CourseStyles.statusBadge} ${CourseStyles.expired}`}>
                          <span className={CourseStyles.statusDot} /> Expired
                        </div>
                      ) : (
                        <div className={`${CourseStyles.statusBadge} ${CourseStyles.active}`}>
                          <span className={CourseStyles.statusDot} /> Active
                        </div>
                      )}

                      {/* Category Pill */}
                      {test?.category && test.category.length > 0 && (
                        <div className={CourseStyles.categoryPill}>
                          <span>{test.category[0]?.name}</span>
                        </div>
                      )}

                      {/* Access Pill */}
                      {test?.access?.type && (
                        <div className={`${CourseStyles.accessPill} ${test?.access?.type === "private" ? CourseStyles.private : CourseStyles.public}`}>
                          {test?.access?.type === "private" ? "Restricted" : "Public"}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className={CourseStyles.contentWrapper}>
                    <div className={CourseStyles.topSection}>
                      <div className={CourseStyles.titleRow}>
                        <Tooltip title={test?.title} placement="topLeft" mouseEnterDelay={0.5}>
                          <h3 className={CourseStyles.title}>
                            {test?.title}
                          </h3>
                        </Tooltip>
                        
                        {/* Action Menu */}
                        <div className={CourseStyles.menuButtonWrapper} onClick={(e) => e.stopPropagation()}>
                          <button
                            className={CourseStyles.menuBtn}
                            onClick={(e) => { e.stopPropagation(); togglePopup(actualIndex); }}
                          >
                            <PiDotsThreeOutlineVerticalFill size={16} />
                          </button>
                          
                          {openPopupIndex === actualIndex && (
                            <div className={CourseStyles.popupBox}>
                              <button
                                className={CourseStyles.popupBtn}
                                onClick={(e) => { e.stopPropagation(); togglePopup(actualIndex); onTestClick(test); }}
                              >
                                Edit
                              </button>
                              <Popconfirm
                                title="Delete the Test"
                                description="Are you sure to delete this Test?"
                                okText="Yes"
                                cancelText="No"
                                onConfirm={(e) => { e.stopPropagation(); deleteTest(test); }}
                                onCancel={(e) => e.stopPropagation()}
                              >
                                <button
                                  className={`${CourseStyles.popupBtn} ${CourseStyles.delete}`}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Delete
                                </button>
                              </Popconfirm>
                              <button
                                className={CourseStyles.popupBtn}
                                onClick={(e) => { e.stopPropagation(); handleDownloadPDF(test); }}
                              >
                                Download
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Tags Row */}
                      <div className={CourseStyles.tagsRow}>
                        {test?.category && test.category.length > 0 && (
                          <span className={CourseStyles.tag}>
                            {test.category[0]?.name}
                          </span>
                        )}
                        {test?.category && test.category.length > 1 && (
                          <span className={CourseStyles.tag}>
                            +{test.category.length - 1}
                          </span>
                        )}
                        {test?.access?.type && (
                          <span className={CourseStyles.tag}>
                            {test?.access?.type === "private" ? "Restricted" : "All Levels"}
                          </span>
                        )}
                      </div>

                      {/* Stats Row */}
                      <div className={CourseStyles.statsRow}>
                        <div className={CourseStyles.statItem}>
                          <QuestionCircleOutlined />
                          <span>{test?.questions?.length || 0} Q</span>
                        </div>
                        <span className={CourseStyles.divider}>•</span>
                        <div className={CourseStyles.statItem}>
                          <ClockCircleOutlined />
                          <span>
                            {test?.time?.testDuration?.testDuration?.duration?.val1 && test?.time?.testDuration?.testDuration?.duration?.val2
                              ? `${String(test.time.testDuration.testDuration.duration.val1).padStart(2, '0')}H:${String(test.time.testDuration.testDuration.duration.val2).padStart(2, '0')}M`
                              : "00H:30M"}
                          </span>
                        </div>
                        <span className={CourseStyles.divider}>•</span>
                        <div className={CourseStyles.statItem}>
                          <StarOutlined />
                          <span>{testScore} Marks</span>
                        </div>
                      </div>

                      {/* Description */}
                      <div className={CourseStyles.description}>
                        <span
                          dangerouslySetInnerHTML={{
                            __html: (() => {
                              try {
                                const shortDesc = JSON.parse(test?.shortDescription || "");
                                return stripHtml(shortDesc);
                              } catch (error) {
                                return stripHtml(test?.shortDescription || "");
                              }
                            })(),
                          }}
                        />
                      </div>
                    </div>

                    {/* Footer Row */}
                    <div className={CourseStyles.footerRow}>
                      <span className={`${CourseStyles.statusText} ${countdowns[actualIndex] === "Expired" ? CourseStyles.expired : ""}`}>
                        {countdowns[actualIndex] === "Expired" ? "Expired" : "Active"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* PDF Download Modal - placed outside card_cont to prevent click bubbling */}
                <Modal
                    open={isModalOpen}
                    onCancel={handleCancel}
                    footer={null}
                    width={1200}
                    centered={true}
                    className={DownloadTestStyles.modal_container}
                  >
                    <Button onClick={handleDownload} disabled={hasAudioOrVideoQuestions()} type="primary">
                      Download PDF
                    </Button>

                    {selectedTest && (
                      <div ref={fullContentRef} className={DownloadTestStyles.download_container}>
                        <div className={`question-class ${DownloadTestStyles.header_container}`} >
                          <div className={DownloadTestStyles.logo}>
                            {selectedTest?.logo && (
                              <img src={selectedTest?.logo} alt="logo" style={{ maxWidth: '100px', marginBottom: '20px' }} />
                            )}
                          </div>
                          <div className={DownloadTestStyles.title}> {selectedTest?.title || 'N/A'}</div>
                          <div className={DownloadTestStyles.time_marks_cont}>
                            <div>
                              Time: {selectedTest?.time?.testDuration?.testDuration?.duration?.val1 &&
                                selectedTest?.time?.testDuration?.testDuration?.duration?.val2
                                ? `${selectedTest?.time?.testDuration?.testDuration?.duration?.val1}H : ${selectedTest?.time?.testDuration?.testDuration?.duration?.val2}M`
                                : "00"}
                            </div>
                            <div>Marks : {totalTestMarks.find((mark) => mark.id === selectedTest._id)?.score || 0}</div>
                          </div>
                        </div>

                        <div className={DownloadTestStyles.full_content}>
                          {selectedTest?.questions?.length > 0 &&
                            selectedTest?.questions?.map((e, i) => {
                              if (e?.questionType?.includes("Comprehension")) {
                                return (
                                  <div className={DownloadTestStyles.comprehension_main_cont} key={i}>
                                    <div className={DownloadTestStyles.header}>
                                      <div className={DownloadTestStyles.questiontype_title}>
                                        <span>{e?.questionType}</span>
                                      </div>
                                    </div>
                                    {e?.questionType?.includes("Reading") ? (
                                      <div
                                        dangerouslySetInnerHTML={{
                                          __html: parseIfJson(e?.comprehensionText),
                                        }}
                                        className={DownloadTestStyles.comprehension_text}
                                      ></div>
                                    ) : (
                                      e?.resources &&
                                      e?.resources !== "" &&
                                      (e?.questionType === "Video Comprehension" ? (
                                        e?.resources?.url !== "" && <video src={e?.resources?.url} controls />
                                      ) : (
                                        e?.resources?.url !== "" && <audio src={e?.resources?.url} controls />
                                      ))
                                    )}

                                    {e?.questionContentArr?.map((ques, index) => (
                                      <div className="question-class" key={index}>
                                        <DownloadTest e={ques} i={index} questionNo={questionNo++} />
                                      </div>
                                    ))}
                                  </div>
                                );
                              } else {
                                return (
                                  <div className="question-class" key={i}>
                                    <DownloadTest e={e} i={i} questionNo={questionNo++} />
                                  </div>
                                );
                              }
                            })}
                        </div>
                      </div>
                    )}
                  </Modal>
              </React.Fragment>
            );
          })
        ) : (
          <div className={AllTestsStyles.emptyState} style={{ gridColumn: "1 / -1" }}>
            <span className={AllTestsStyles.emptyIcon}>
              <FileTextOutlined />
            </span>
            <h3 className={AllTestsStyles.emptyTitle}>No Tests Added</h3>
            <p className={AllTestsStyles.emptyDesc}>
              Get started by creating your first test assessment.
            </p>
            <button className={AllTestsStyles.emptyBtn} onClick={props.onAddNewTest}>
              Create New Test
            </button>
          </div>
        )}
      </div>

      {allTests.length > 0 && (
        <div className={CourseStyles.paginationRow}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={allTests.length}
            onChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
            pageSizeOptions={["4", "8", "12", "20", "50"]}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} tests`}
          />
        </div>
      )}
    </div>
  );
};

export default AllTestsComp;
