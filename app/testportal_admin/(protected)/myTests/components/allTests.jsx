
"use client";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef } from "react";
import CourseStyles from "./testsCar.module.scss";
import DownloadTestStyles from "./download.module.scss";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DeleteTest, getOneTests, getTests } from "@/redux/slices/testportal_admin/slice/test";
import { setFormValues } from "@/redux/slices/testportal_admin/slice/stepform";
import { Button, Checkbox, Collapse, message, Modal, Popconfirm } from "antd";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import CardSkeleton from "@/modules/testportal_admin/components/reusable-comps/skeleton/cardSkeleton";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import { parseIfJson } from "@/utils/windowMW";
import QuesComp from "@/app/testportal_admin/(protected)/results-database/components/quesComp";
import DownloadTest from "./downloadtest";

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

const AllTestsComp = () => {
  const SingleTest = useSelector((state) => state.tests.test);
  const [openPopupIndex, setOpenPopupIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const fullContentRef = useRef();

  const showModal = () => {
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

  useEffect(() => {
    if (selectedId) {
      dispatch(getOneTests({ _id: selectedId }));
      if (SingleTest?._id) dispatch(setFormValues(SingleTest));
    }
  }, [!SingleTest?._id]);

  const allTests = useSelector((state) => state.tests.value);

  const allTestsSatus = useSelector(
    (state) => state.tests.getAllTestStatus.status
  );

  const [cursor, setCursor] = useState(null);
  const dispatch = useDispatch();
  const [showLoadmore, setShowLoadmore] = useState(false);

  const containerRef = useRef(null);

  const nav = useRouter();

  const [daysRemaining, setDaysRemaining] = useState(null);

  const [countdowns, setCountdowns] = useState({});
  const singleProgress = useSelector(
    (state) => state.resultsDatabase?.singleProgress
  );

  // const testRes = singleProgress;
  // const currentTestRes = testRes && testId && testRes?.response;

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
  const scroll = (direction) => {
    const container = containerRef.current;
    const scrollAmount = container.offsetWidth;
    container.scrollLeft += direction * scrollAmount;
  };

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
          pdf.addImage(imgData, "PNG", 10, currentPageHeight, imgWidth, imgHeight,'','FAST');
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
        {allTests?.map((test, index) => {
  let questionNo = 1;

          const testScore =
            totalTestMarks.find((mark) => mark.id === test._id)?.score || 0;
          return (                      
            <React.Fragment key={test?._id || index}>
              {allTestsSatus === "pending" ? (
                <CardSkeleton key={index} />
              ) : (
                <section key={index} className={CourseStyles.card_cont}>
                  <div className={CourseStyles.content_div}>
                    <div className={CourseStyles.check_div}>
                      <Checkbox />
                      <PiDotsThreeOutlineVerticalFill
                        onClick={() => togglePopup(index)}
                      />
                      {openPopupIndex === index && (
                        <div className={CourseStyles.popup_box}>
                          <Popconfirm
                            title="Delete the Test"
                            description="Are you sure to delete this Test?"
                            okText="Yes"
                            cancelText="No"
                            onConfirm={() => deleteTest(test)}
                          >
                            <button className={CourseStyles.popup_btn}>
                              Delete
                            </button>
                          </Popconfirm>
                          <button
                            className={CourseStyles.popup_btn}
                            onClick={() => handleDownloadPDF(test)}
                          >
                            Download
                          </button>
                        </div>
                      )}
                    </div>
                    <div
                      className={CourseStyles.title_div}
                      onClick={() => onTestClick(test)}
                    >
                      <p className={CourseStyles.testName}>
                        {test?.title?.length > 40
                          ? test?.title?.substring(0, 42) + "..."
                          : test.title}
                      </p>
                    </div>

                    <div className={CourseStyles.statusss_div}>
                      {test?.category && test.category.length > 0 ? (
                        <div className={CourseStyles.cate}>
                          <p>
                            {test.category.length === 1
                              ? `${test.category[0]?.name}`
                              : `${test.category[0]?.name} +${
                                  test.category.length - 1
                                }`}
                          </p>
                        </div>
                      ) : (
                        <div className={CourseStyles.empty_cate}>empty</div>
                      )}

                      {test?.access?.type && (
                        <div
                          className={`${CourseStyles.status_cont} ${
                            test?.access?.type === "private"
                              ? CourseStyles.statusPrivate
                              : test?.access?.type === "public"
                              ? CourseStyles.statusPublic
                              : CourseStyles.statusDefault
                          }`}
                        >
                          <p>
                            {test?.access?.type &&
                              test?.access?.type.charAt(0).toUpperCase() +
                                test?.access?.type.slice(1)}
                          </p>
                        </div>
                      )}
                    </div>
                    <div
                      className={CourseStyles.questions_div}
                      onClick={() => onTestClick(test)}
                    >
                      <div>
                        <p>Questions : </p>
                        &nbsp;<strong>{test?.questions?.length}</strong>
                      </div>
                      <div className={CourseStyles.line} />
                      <div>
                        <p>Dur: </p>
                        &nbsp;
                        <strong>
                          {test?.time?.testDuration?.testDuration?.duration
                            ?.val1 &&
                          test?.time?.testDuration?.testDuration?.duration?.val2
                            ? `${test.time.testDuration.testDuration.duration.val1}H : ${test.time.testDuration.testDuration.duration.val2}M`
                            : "NA"}{" "}
                        </strong>
                      </div>
                      {/* <div>
                        <p>Attempts : </p>
                        &nbsp;
                        <strong>
                          {test?.access?.attemptsPerRespondent === "unlimited"
                            ? "UN"
                            : test?.access?.attemptsPerRespondent ||
                              test?.access?.maxBreach ||
                              "NA"}
                        </strong>
                      </div> */}
                      <div className={CourseStyles.line} />
                      <div>
                        <p>Marks : </p>
                        &nbsp;
                        <strong>{testScore}</strong>
                      </div>
                    </div>
                    <div
                      className={CourseStyles.thumbnail_div}
                      onClick={() => onTestClick(test)}
                    >
                      <img
                        src={test?.thumbnail}
                        // onClick={() => navigateToTest(testData)}
                      />
                    </div>
                    <div
                      className={CourseStyles.desc_div}
                      onClick={() => onTestClick(test)}
                    >
                      <span
                        className={CourseStyles.desc}
                        // dangerouslySetInnerHTML={{
                        //   __html:
                        //     JSON.parse(test?.shortDescription)?.substring(0, 260) +
                        //     "...",
                        // }}
                        dangerouslySetInnerHTML={{
                          __html: (() => {
                            try {
                              const shortDesc = JSON.parse(
                                test?.shortDescription || ""
                              );
                              return shortDesc.length > 260
                                ? shortDesc.substring(0, 260) + "..."
                                : shortDesc;
                            } catch (error) {
                              return "";
                            }
                          })(),
                        }}
                      ></span>
                    </div>
                    <div
                      className={CourseStyles.status_div}
                      onClick={() => onTestClick(test)}
                    >
                      {countdowns[index] === "Expired" ? (
                        <button className={CourseStyles.expired_btn}>
                          Expired
                        </button>
                      ) : (
                        <>
                          {test?.time?.expiryDates?.expiry && (
                            <button className={CourseStyles.countdown_btn}>
                              {countdowns[index]}
                            </button>
                          )}

                          <button
                            className={`${
                              test?.status?.toLowerCase() !== "active"
                                ? CourseStyles.statusInactive
                                : ""
                            }`}
                          >
                            {test?.status?.charAt(0).toUpperCase() +
                              test?.status?.slice(1)}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
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
        <div  ref={fullContentRef} className={DownloadTestStyles.download_container}>
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
</div>          <div >Marks : {totalTestMarks.find((mark) => mark.id === selectedTest._id)?.score || 0}</div>
        </div>
        </div>

          <div  className={DownloadTestStyles.full_content}>

      {selectedTest?.questions?.length > 0 &&
  selectedTest?.questions?.map((e, i) => {

    if (e?.questionType?.includes("Comprehension")) {
      
      return (
        <div  className={DownloadTestStyles.comprehension_main_cont} key={i}>
          <div className={DownloadTestStyles.header}>
             <div className={DownloadTestStyles.questiontype_title}>
              {/* <span>question{i+1}</span> */}
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
            <div className="question-class"  key={index}>
              <DownloadTest e={ques} i={index} questionNo={questionNo++} />
            </div>
          ))}
        </div>
      );
    } else {  
      return (
        <div className="question-class"  key={i}>
          <DownloadTest e={e} i={i} questionNo={questionNo++} />
        </div>
      );
    }
  })}
  </div>
        </div>
      )}
      {/* <div className={DownloadTestStyles.answer_key_contianer}>
        <h3>Answer key</h3>
        {selectedTest && (
  <div className={DownloadTestStyles.answer_key}>
    {selectedTest?.questions?.length > 0 ? (
      selectedTest?.questions?.map((question, index) => (
        <div key={index} className={DownloadTestStyles.options_Container}>
          <span className={DownloadTestStyles.question_index}>{index + 1})</span>
          
           
          <div className={DownloadTestStyles.option_ans}>
            {(() => {
              let correctAnswers = [];

              if (question?.questionType === "Single Choice") {
                if (question?.answer?.singleChoice) {
                  correctAnswers = Object.keys(question.answer.singleChoice)
                    .filter(optionKey => question.answer.singleChoice[optionKey] === true);
                }
              }
              else if (question?.questionType === "Reading Comprehension") {
                if (question?.questionContentArr?.length > 0) {
                  question?.questionContentArr.forEach(q => {
                    if (q?.answer) {
                      const singleChoiceAnswers = Object.entries(q.answer).flatMap(([key, value]) => {
                        if (key === "singleChoice") {
                          return Object.keys(value).filter(optionKey => value[optionKey] === true);
                        }
                        return [];
                      });
              
                      const multipleChoiceAnswers = Object.entries(q.answer).flatMap(([key, value]) => {
                        if (key === "multipleChoice") {
                          return Object.keys(value).filter(optionKey => value[optionKey] === true);
                        }
                        return [];
                      });
              
                      const trueFalseAnswers = Object.entries(q.answer).flatMap(([key, value]) => {
                        if (key === "truefalse") {
                          if (typeof value === "boolean") {
                            return value ? ["True"] : ["False"];
                          } else {
                            return ["No Answer"];
                          }
                        }
                        return [];
                      });
                                    correctAnswers.push(...singleChoiceAnswers, ...multipleChoiceAnswers, ...trueFalseAnswers);
                    }
                  });
                }
              }
                
              else if (question?.questionType === "Video Comprehension") {
                if (question?.questionContentArr?.length > 0) {
                  question?.questionContentArr.forEach(q => {
                    if (q?.answer) {
                      const singleChoiceAnswers = Object.entries(q.answer).flatMap(([key, value]) => {
                        if (key === "singleChoice") {
                          return Object.keys(value).filter(optionKey => value[optionKey] === true);
                        }
                        return [];
                      });
              
                      const multipleChoiceAnswers = Object.entries(q.answer).flatMap(([key, value]) => {
                        if (key === "multipleChoice") {
                          return Object.keys(value).filter(optionKey => value[optionKey] === true);
                        }
                        return [];
                      });
              
                      const trueFalseAnswers = Object.entries(q.answer).flatMap(([key, value]) => {
                        if (key === "truefalse") {
                          if (typeof value === "boolean") {
                            return value ? ["True"] : ["False"];
                          } else {
                            return ["No Answer"];
                          }
                        }
                        return [];
                      });
                                    correctAnswers.push(...singleChoiceAnswers, ...multipleChoiceAnswers, ...trueFalseAnswers);
                    }
                  });
                }
              }
              else if (question?.questionType === "Audio Comprehension") {
                if (question?.questionContentArr?.length > 0) {
                  question?.questionContentArr.forEach(q => {
                    if (q?.answer) {
                      const singleChoiceAnswers = Object.entries(q.answer).flatMap(([key, value]) => {
                        if (key === "singleChoice") {
                          return Object.keys(value).filter(optionKey => value[optionKey] === true);
                        }
                        return [];
                      });
              
                      const multipleChoiceAnswers = Object.entries(q.answer).flatMap(([key, value]) => {
                        if (key === "multipleChoice") {
                          return Object.keys(value).filter(optionKey => value[optionKey] === true);
                        }
                        return [];
                      });
                      const trueFalseAnswers = Object.entries(q.answer).flatMap(([key, value]) => {
                        if (key === "truefalse") {
                          if (typeof value === "boolean") {
                            return value ? ["True"] : ["False"];
                          } else {
                            return ["No Answer"];
                          }
                        }
                        return [];
                      });

                      correctAnswers.push(...singleChoiceAnswers, ...multipleChoiceAnswers, ...trueFalseAnswers);
                    }
                  });
                }
              }
            

              else if (question?.questionType === "True/False") {
                if (question?.answer?.truefalse !== undefined) {
                  correctAnswers = question.answer.truefalse ? ["True"] : ["False"];
                }
              }

              else if (question?.questionType === "Multiple Choice") {
                if (question?.answer?.multipleChoice) {
                  correctAnswers = Object.keys(question.answer.multipleChoice)
                    .filter(optionKey => question.answer.multipleChoice[optionKey] === true);
                }
              }

              const optionLabels = ["A", "B", "C", "D", "E"];
              const formattedAnswers = correctAnswers.map(optionKey => {
                const optionIndex = parseInt(optionKey.split("option ")[1], 10) - 1;
                return optionLabels[optionIndex]; 
              });

              if (correctAnswers.length === 0 && question?.answer?.truefalse !== undefined) {
                return question.answer.truefalse ? "True" : "False";
              }

              return formattedAnswers.length > 0 ? 
              
                <div>{formattedAnswers.join(", ")}</div> : 
                <div>0</div>;
            })()}
          </div>
        </div>
      ))
    ) : (
      <div>No questions found.</div>
    )}
  </div>
)}

      </div> */}

        </Modal>

                </section>
              )}
            </React.Fragment>
          );
        })}
      </div>
 
      {showLoadmore && (
        <div className={CourseStyles.loadmore_btn}>
          <Button onClick={fetchMore}>Load More</Button>
        </div>
      )}
    </div>
  );
};
 
export default AllTestsComp;
