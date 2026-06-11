"use client";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { decryptObject } from "../encryptionMiddleware";
import { useDispatch, useSelector } from "react-redux";
import { Button, Modal, Progress, Spin } from "antd";
import {
  clear_response,
  getSingleJobTest,
  getSingleTest,
  mark_for_review,
  save_response,
  updateTimeTaken,
} from "@/app/testportal/redux/slices/testSlice";
import useCountdown from "../useCountdown";
import QuestionUI from "./questionUI";
import { Suspense } from "react";
import testStyles from "./testUI.module.scss";
import { stopTimer } from "./timer";
import { message } from "antd";
import {
  clearLstorageVals,
  clearSstorageVals,
  getLstorage,
  getSstorage,
  setLstorage,
  setSstorage,
} from "../storageMiddleware";
import _ from "lodash";
import {
  getBlockedStudents,
  getPublicStudent,
  getStudent,
} from "@/app/testportal/redux/slices/studentSlice";
import axios from "axios";
import { awsUrl, proctoringUrl, studentSiteUrl } from "../urls";
import { TimerColors } from "@/app/testportal/styles/colors";
import { parseIfJson } from "./jsonparse";
import useStudentProctoring from "../liveProctoring/proctoringClient";

export default function TestUI({
  socket,
  isModalOpen,
  setIsModalOpen,
  sessionData,
}) {
  const videoRef = useRef(null);
  const [timer, setTimer] = useState(5);
  const searchParams = useSearchParams();
  const [currentQues, setCurrentQues] = useState(
    parseInt(getSstorage("currQues")) || 0,
  );
  const testData = useSelector((state) => {
    return state.Test.testData.value;
  });
  const testDataStatus = useSelector((state) => state.Test.testData.status);
  const studentCreds = useSelector((state) => state.Student.studentVals?.data);
  let tabSwitchCount = parseInt(getSstorage("tabChangeCount"));
  let blockMsg = getSstorage("blockMsg");
  const [flagCheck, setFlagCheck] = useState([]);
  const [testStarted, setTestStarted] = useState(
    getSstorage("testStarted") === "true"
  );
  const testStartedRef = useRef(getSstorage("testStarted") === "true");
  const [activeCategory, setActiveCategory] = useState(
    getSstorage("activeCategory") || null
  );
  const categoryTabsRef = useRef({});


  const timeoutRef = useRef(null);
  const testIdEnc = searchParams.get("st_d");
  const studentEnc = searchParams.get("st_t");
  const { testId, attemptId } = decryptObject(testIdEnc, "studentTestIDValue");
  const token = searchParams.get("st");
  const testType = searchParams.get("testtype");
  const attemptIdFromSstorage = getSstorage("attemptId");
  const stId = searchParams.get("sId");
  const dispatch = useDispatch();
  const nav = useRouter();
  // Initialize proctoring hook
  const {
    connectionStatus,
    proctoringActive,
    sessionData: proctoringSessionData,
    startProctoring,
    stopProctoring,
    tracksPublished,
    proctorMessages,
    latestMessage,
    clearLatestMessage,
    setProctoringMessages,
    setLatestMessage,
  } = useStudentProctoring({
    testId: testData?._id,
    token: token,
    socketInstance: socket,
    proctoringServerUrl: awsUrl,
    companyOrg: testData?.companyOrgId,
    onViolation: (violation) => {
      console.log("🚨 Proctoring violation:", violation);
      message.warning({
        content: `⚠️ ${violation.message || "Please maintain exam integrity"}`,
        duration: 5,
        style: { marginTop: "20vh", fontSize: "16px", zIndex: 9999 },
      });

      const studentActivity = JSON.parse(getLstorage("activity") || "[]");
      studentActivity.push({
        event: {
          name: "Proctoring Violation",
          value: violation.message || "Violation detected",
        },
        time: new Date(),
      });
      setLstorage("activity", JSON.stringify(studentActivity));
    },
    onProctorMessage: null,
  });

  // Debug logging
  useEffect(() => {
    console.log("DEBUG - Message state:", {
      proctorMessagesCount: proctorMessages?.length || 0,
      latestMessage: !!latestMessage,
      latestMessageContent: latestMessage?.message,
      connectionStatus,
      functions: {
        setProctoringMessages: typeof setProctoringMessages,
        setLatestMessage: typeof setLatestMessage,
        clearLatestMessage: typeof clearLatestMessage,
      },
    });
  }, [proctorMessages, latestMessage, connectionStatus]);

  // Auto-clear latest message after 10 seconds
  useEffect(() => {
    if (latestMessage) {
      const timer = setTimeout(() => {
        clearLatestMessage();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [latestMessage, clearLatestMessage]);

  // Start proctoring when conditions are met
  useEffect(() => {
    if (
      testData?._id &&
      token &&
      socket?.connected &&
      !proctoringActive &&
      connectionStatus !== "connected"
    ) {
      console.log("🎥 Auto-starting proctoring...");
      startProctoring();
    }
  }, [
    testData?._id,
    token,
    socket?.connected,
    proctoringActive,
    connectionStatus,
    startProctoring,
  ]);

  // Helper function for time ago
  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  };

  // Latest message display component
  const ProctorMessageDisplay = () => {
    if (!latestMessage) return null;

    return (
      <div
        style={{
          position: "fixed",
          top: "60px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          padding: "20px 24px",
          borderRadius: "12px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          zIndex: 10000,
          maxWidth: "450px",
          border: "2px solid #fff",
          animation: "messageSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "16px",
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span style={{ fontSize: "18px" }}>👨‍💼</span>
                <span>Proctor Message</span>
              </div>
              <span
                style={{
                  fontSize: "12px",
                  opacity: 0.9,
                  background: "rgba(255,255,255,0.2)",
                  padding: "4px 8px",
                  borderRadius: "12px",
                }}
              >
                {latestMessage.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            <div
              style={{
                fontSize: "16px",
                lineHeight: "1.5",
                marginBottom: "8px",
                fontWeight: "500",
              }}
            >
              {latestMessage.message}
            </div>

            <div
              style={{
                fontSize: "11px",
                opacity: 0.8,
                fontStyle: "italic",
              }}
            >
              This message will auto-dismiss in 3 seconds
            </div>
          </div>

          <button
            onClick={clearLatestMessage}
            style={{
              background: "rgba(255,255,255,0.25)",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "white",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              cursor: "pointer",
              fontSize: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255,255,255,0.35)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255,255,255,0.25)";
            }}
          >
            ×
          </button>
        </div>
      </div>
    );
  };

  // Add CSS animations
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes messageSlideIn {
        from {
          transform: translateX(-50%) translateY(-20px);
          opacity: 0;
        }
        to {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  // ALL YOUR EXISTING CODE FROM HERE
  useEffect(() => {
    if (!flagCheck?.length && getSstorage("flagged")) {
      setFlagCheck(parseIfJson(getSstorage("flagged")));
    } else {
      setSstorage("flagged", JSON.stringify(flagCheck));
    }
  }, []);

  useEffect(() => {
    if (token) {
      setLstorage("token", token);
    }
  }, []);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then((mediaStream) => {
        videoRef.current.srcObject = mediaStream;
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  useEffect(() => {
    dispatch(getStudent());
  }, []);
  const duration = {
    val1: +testData?.time?.testDuration?.testDuration?.duration?.val1,
    val2: +testData?.time?.testDuration?.testDuration?.duration?.val2,
  };

  const [countDownTiming, setCountDownTiming] = useState(+getSstorage("time"));

  const { hours, minutes, seconds } = useCountdown(
    countDownTiming ? countDownTiming : getDurationInMilliseconds(duration),
    testDataStatus == "fulfilled" && testStarted ? false : true,
  );

  const totalTimeInMilliseconds = getDurationInMilliseconds(duration);
  const remainingTimeInMilliseconds =
    (hours * 3600 + minutes * 60 + seconds) * 1000;
  const percentageRemaining =
    (remainingTimeInMilliseconds / totalTimeInMilliseconds) * 100;
  const percentage = 100 - percentageRemaining;

  function getDurationInMilliseconds(duration, seconds = 0) {
    const hours = Number(duration?.val1);
    const minutes = Number(duration?.val2);
    const totalMilliseconds = (hours * 3600 + minutes * 60 + seconds) * 1000;
    return totalMilliseconds;
  }

  const responses = useSelector((state) => state.Test.responses);
  const questionsAddedMark = useSelector((state) => state.Test?.review?.value);
  const userData = decryptObject(studentEnc, testId);
  const [answers, setAnswers] = useState([]);
  const currResponses = useSelector((state) => state.Test.responses.value);

  // ALL YOUR EXISTING FUNCTIONS REMAIN THE SAME
  useEffect(() => {
    if (testType === "jobtest") {
      dispatch(getSingleJobTest({ testId }));
    } else {
      if (!testData?._id) {
        dispatch(getSingleTest({ _id: testId })).then((res) => {
          if (res?.payload?._id) {
            loadResp();
          }
        });
      } else {
        loadResp();
      }
    }
  }, [testData?._id, dispatch, testId]);

  // Only change the useEffect that starts proctoring
  useEffect(() => {
    // More specific conditions to prevent multiple starts
    // console.log("====================================");
    // console.log(
    //   testData,
    //   token,
    //   socket?.connected,
    //   connectionStatus === "socket-connected",
    //   !proctoringActive,
    //   !sessionData,
    //   connectionStatus !== "connected",
    //   connectionStatus !== "connecting"
    // );
    // console.log("====================================");
    if (
      testData?._id &&
      token &&
      socket?.connected &&
      connectionStatus === "socket-connected" &&
      !proctoringActive &&
      !sessionData &&
      connectionStatus !== "connected" &&
      connectionStatus !== "connecting"
    ) {
      // console.log("🎥 Starting proctoring for the first time...", {
      //   testId: testData._id,
      //   connectionStatus,
      //   proctoringActive,
      //   hasSessionData: !!sessionData,
      // });

      // Add a small delay to prevent race conditions
      const timeoutId = setTimeout(() => {
        startProctoring();
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [
    testData?._id,
    token,
    socket?.connected,
    connectionStatus,
    proctoringActive,
    sessionData,
    startProctoring,
  ]);

  // Add cleanup on unmount
  useEffect(() => {
    return () => {
      if (proctoringActive || sessionData) {
        console.log("🧹 Component unmounting, cleaning up proctoring...");
        stopProctoring();
      }
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setFullScreen(false);
        // Don't stop the test — just warn the student
        if (testStartedRef.current) {
          message.warning("You have exited fullscreen. Please return to fullscreen mode.");
        }
      } else {
        setFullScreen(true);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange,
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange,
      );
    };
  }, []);

  const loadResp = () => {
    setCountDownTiming(+getSstorage("time"));

    if (!Object.keys(currResponses)?.length && getSstorage("value")?.length) {
      const savedResponse = JSON.parse(getSstorage("value"));
      const mappedArray = Object.keys(savedResponse)?.map((e) => {
        const obj = { questionId: e };
        if (savedResponse[e]?.answers) {
          obj.response = savedResponse[e]?.answers;
        }
        if (savedResponse[e]?.timeTaken) {
          obj.timeTaken = savedResponse[e]?.timeTaken;
        }
        return obj;
      });

      const uniqueArray = _.uniqWith(mappedArray, "questionId");
      uniqueArray.forEach((obj) => {
        dispatch(save_response(obj));
        if (
          !questionsAddedMark?.length &&
          getSstorage("marked") &&
          JSON.parse(getSstorage("marked"))?.length
        ) {
          JSON.parse(getSstorage("marked"))?.forEach((e) => {
            dispatch(mark_for_review({ questionId: e }));
          });
        }
      });
    }
  };
  const mergeCodingIntoResponses = (baseResponsesObj = {}) => {
    const raw = getSstorage("codingQuestions");

    let codingArr = [];
    try {
      codingArr = raw ? JSON.parse(raw) : [];
    } catch {
      codingArr = [];
    }

    const merged = { ...baseResponsesObj };

    codingArr.forEach((q) => {
      if (merged[q?.questionId]) {
        merged[q.questionId] = {
          ...merged[q.questionId],
          answers: { ...q },
          type: "coding",
        };
      }
    });

    return merged;
  };

  const submitTest = () => {
    const finalResponses = mergeCodingIntoResponses(responses.value);

    if (proctoringActive) {
      console.log("🛑 Stopping proctoring before test submission");
      stopProctoring();
    }
    if (socket) {
      if (testType === "jobtest") {
        socket.emit("jobAssessmentEnded", {
          userId: getSstorage("userId"),
          ...userData,
          flagged: flagCheck,
          response: {
            ...responses.value,
          },
          studentData: {
            ...userData.studentData,
            tabswitchCount: tabSwitchCount || 0,
            blockMessage: blockMsg,
          },
          jobId: testData?.jobId,
          assessmentId: testData?._id,
          testStartedAt: +getSstorage("testStartedAt"),
          testEndedAt: new Date().getTime(),
          createdAt: new Date().toLocaleString(),
          proctoringData: {
            sessionId: proctoringSessionData?.sessionId,
            connectionStatus: connectionStatus,
          },
        });
      } else {
        socket.emit("testEnded", {
          userId: getSstorage("userId"),
          ...userData,
          flagged: flagCheck,
          response: finalResponses,
          studentData: {
            ...userData.studentData,
            tabswitchCount: tabSwitchCount || 0,
            blockMessage: blockMsg,
          },
          createdAt: new Date().toLocaleString(),
        });
      }
    }
    setOpen(false);
    setOpenTime(false);
    if (typeof window !== "undefined") window.close();
  };
  // ALL YOUR OTHER EXISTING STATE AND FUNCTIONS
  const [open, setOpen] = useState(false);
  const [openTime, setOpenTime] = useState(false);
  const [openFlag, setOpenFlag] = useState(false);
  const [totalScor, setTotalScore] = useState("");
  const [ques, setQues] = useState([]);
  const [fullScreen, setFullScreen] = useState(false);
  const [isFlaggedOn, setIsFlaggedOn] = useState(false);
  const timerRef = useRef(null);
  const [randomTimer, setRandomTimer] = useState(0);
  const videoFaceRef = useRef();
  const canvasRef = useRef();

  // ALL YOUR EXISTING EFFECTS AND FUNCTIONS REMAIN THE SAME
  useEffect(() => {
    setSstorage("currQues", currentQues);
  }, [currentQues]);

  // Persist testStarted to sessionStorage
  useEffect(() => {
    setSstorage("testStarted", testStarted.toString());
    testStartedRef.current = testStarted;
  }, [testStarted]);

  // Persist activeCategory to sessionStorage and handle scroll
  useEffect(() => {
    if (activeCategory) {
      setSstorage("activeCategory", activeCategory);
      // Auto-scroll the active category tab into view
      setTimeout(() => {
        const el = categoryTabsRef.current[activeCategory];
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
        }
      }, 300); // Small delay to ensure tabs are rendered
    }
  }, [activeCategory]);

  // Set initial activeCategory on mount if not in storage
  useEffect(() => {
    if (testData?.questions?.length > 0 && !activeCategory) {
      const initialCat = testData.questions[currentQues]?.questionCategory?.[0]?.name || "Uncategorized";
      setActiveCategory(initialCat);
    }
  }, [testData, currentQues, activeCategory]);

  // Keyboard shortcuts: ← → arrow keys for navigation + block reload keys
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!testStarted) return;

      // Block reload & close shortcuts during exam
      if (
        e.key === "F5" ||
        (e.ctrlKey && e.key === "r") ||
        (e.ctrlKey && e.shiftKey && e.key === "R") ||
        (e.ctrlKey && e.key === "w") ||
        (e.ctrlKey && e.shiftKey && e.key === "W")
      ) {
        e.preventDefault();
        e.stopPropagation();
        message.warning("Reloading is not allowed during the exam.");
        return;
      }

      // Don't intercept arrow keys when typing in inputs/textareas
      const tag = e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || e.target.isContentEditable) return;

      if (e.key === "ArrowRight" && currentQues < testData?.questions?.length - 1) {
        const nextIndex = currentQues + 1;
        setCurrentQues(nextIndex);
        const nextCat = testData?.questions?.[nextIndex]?.questionCategory?.[0]?.name || "Uncategorized";
        const currCat = testData?.questions?.[currentQues]?.questionCategory?.[0]?.name || "Uncategorized";
        if (nextCat !== currCat) setActiveCategory(nextCat);
      } else if (e.key === "ArrowLeft" && currentQues > 0) {
        const prevIndex = currentQues - 1;
        setCurrentQues(prevIndex);
        const prevCat = testData?.questions?.[prevIndex]?.questionCategory?.[0]?.name || "Uncategorized";
        const currCat = testData?.questions?.[currentQues]?.questionCategory?.[0]?.name || "Uncategorized";
        if (prevCat !== currCat) setActiveCategory(prevCat);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentQues, testStarted, testData]);

  const showModalTime = () => {
    setOpenTime(true);
  };

  useEffect(() => {
    if (hours == 0 && minutes == 5 && seconds == 0) {
      message.warning("5 minutes remaining to complete the test");
    }

    const validateValue = (value, defaultValue) => {
      return isNaN(value) || value === null ? defaultValue : value;
    };

    const timerInterval = setInterval(() => {
      if (hours == 0 && minutes == 0 && seconds == 0) {
        showModalTime(true);
        timeoutRef.current = setTimeout(() => {
          submitTest();
          showModalTime(false);
        }, 5000);
        clearInterval(timerInterval);
      }

      const storedTime = +getSstorage("time") || 0;
      if (
        storedTime == 0 ||
        storedTime >
        getDurationInMilliseconds({ val1: hours, val2: minutes }, seconds)
      ) {
        setSstorage(
          "time",
          getDurationInMilliseconds({ val1: hours, val2: minutes }, seconds),
        );
      }
    }, 100);

    if (
      testStarted &&
      testData?.questions &&
      testData?.questions[currentQues] &&
      testData?.questions[currentQues]._id
    ) {
      dispatch(
        updateTimeTaken({ questionId: testData?.questions[currentQues]._id }),
      );
    }

    return () => {
      clearInterval(timerInterval);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [hours, minutes, seconds]);

  // ALL YOUR OTHER EXISTING FUNCTIONS...
  // Helper: get category name for a question at given global index
  const getCategoryForQuestion = (index) => {
    const q = testData?.questions?.[index];
    return q?.questionCategory?.[0]?.name || "Uncategorized";
  };

  const handleSaveQuestion = () => {
    const totalTimeTaken = stopTimer();

    if (event.target.innerText == "Finish") return setOpen(true);

    if (
      !Object.keys(responses?.value)?.includes(
        testData?.questions[currentQues]?._id,
      )
    ) {
      dispatch(
        save_response({
          questionId: testData?.questions[currentQues]._id,
          response: answers,
          questionType: testData?.questions[currentQues]?.questionType,
        }),
      );
    } else {
      dispatch(
        save_response({
          questionId: testData?.questions[currentQues]._id,
          response:
            responses?.value[testData?.questions[currentQues]?._id]?.answers,
          questionType: testData?.questions[currentQues]?.questionType,
        }),
      );
    }

    setAnswers(responses[testData?.questions[currentQues]?._id] || []);
    if (currentQues == testData.questions.length - 1) {
      submitTest();
    }
    const nextIndex = currentQues + 1;
    setCurrentQues(nextIndex);
    // Auto-switch category tab if next question is in a different category
    if (nextIndex < testData?.questions?.length) {
      const nextCat = getCategoryForQuestion(nextIndex);
      const currentCat = getCategoryForQuestion(currentQues);
      if (nextCat !== currentCat) {
        setActiveCategory(nextCat);
      }
    }
  };

  function requestFullScreen() {
    const element = document.body;

    if (fullScreen) {
      document
        .exitFullscreen()
        .then(() => {
          setFullScreen(false);
          // Test continues even after exiting fullscreen
        })
        .catch((err) => console.error(err));
    } else {
      var requestMethod =
        element.requestFullScreen ||
        element.webkitRequestFullScreen ||
        element.mozRequestFullScreen ||
        element.msRequestFullScreen;

      if (requestMethod) {
        requestMethod.call(element);
        setFullScreen(true);
        if (!testStartedRef.current) {
          setTestStarted(true);
          testStartedRef.current = true;
        }
      }
    }
  }

  const flaggedArr = [
    " Spam",
    "Rude or abusive",
    "Should be closed",
    "A duplicate",
    "In need of moderator intervention",
  ];

  const toggleFlagCheck = (id, string) => {
    const index = flagCheck.findIndex((item) => item.id === id);

    if (index !== -1) {
      const flagSet = new Set(flagCheck[index].flag);

      if (flagSet.has(string)) {
        flagSet.delete(string);

        if (flagSet.size === 0) {
          setFlagCheck((prevState) =>
            prevState.filter((item) => item.id !== id),
          );
        } else {
          setFlagCheck((prevState) => {
            const updatedState = [...prevState];
            updatedState[index].flag = [...flagSet];

            setSstorage("flagged", JSON.stringify(updatedState));

            return updatedState;
          });
        }
      } else {
        flagSet.add(string);
        setFlagCheck((prevState) => {
          const updatedState = [...prevState];
          updatedState[index].flag = [...flagSet];

          setSstorage("flagged", JSON.stringify(updatedState));
          return updatedState;
        });
      }
    } else {
      setSstorage(
        "flagged",
        JSON.stringify((prevState) => [...prevState, { id, flag: [string] }]),
      );

      setFlagCheck((prevState) => [...prevState, { id, flag: [string] }]);
    }
  };

  const clearRespFun = () => {
    if (testData?.questions[currentQues]?.questionType == "Short Paragraph") {
      dispatch(
        save_response({
          questionId: testData?.questions[currentQues]._id,
          response: [""],
          questionType: testData?.questions[currentQues]?.questionType,
        }),
      );
    }
    dispatch(
      clear_response({
        questionId: testData?.questions[currentQues]._id,
      }),
    );
  };

  const showModal = () => {
    setOpen(true);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  useEffect(() => {
    const updatedQues = testData?.questions?.reduce((acc, Currques) => {
      if (Currques.questionType.includes("Comprehension")) {
        return [...acc, ...(Currques?.questionContentArr || [])];
      }
      return [...acc, Currques];
    }, []);
    setQues(updatedQues);
    const totalMarksEachTests = updatedQues?.map((question, ind) => {
      const {
        pointsForCorrectAns,
        PointsForEachCorrectAnswer,
        bonusPointsForAllCorrect,
      } = question?.scoreSettings || {};

      let score =
        Number(pointsForCorrectAns) || Number(PointsForEachCorrectAnswer) || 0;

      if (PointsForEachCorrectAnswer && question?.answer?.multipleChoice) {
        const correctOptionsCount = Object.values(
          question?.answer?.multipleChoice,
        ).filter(Boolean).length;
        score = correctOptionsCount * PointsForEachCorrectAnswer;
      }

      const bonusPoints = Number(bonusPointsForAllCorrect) || 0;

      return score + bonusPoints;
    });

    const total = totalMarksEachTests?.reduce((acc, curr) => acc + curr, 0);
    setTotalScore(total);
  }, [testData?._id, testData?.questions?.length]);

  const setUnattempted = (index) => {
    setAnswers({
      ...answers,
      [testData?.questions[index]?._id]: { answers: [] },
    });
    dispatch(
      save_response({
        questionId: testData?.questions[index]?._id,
        timeTaken: 0,
        questionType: testData?.questions[currentQues]?.questionType,
      }),
    );
  };

  useEffect(() => {
    if (testType === "jobtest") {
      socket.emit("jobAssessmentStarted", {
        userId: stId,
      });
      setSstorage("testStartedAt", new Date().getTime());
    } else {
      socket.emit("testStarted", {
        userId: stId,
      });
    }
  }, []);

  const currentQuestionRef = useRef();

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds,
    ).padStart(2, "0")}`;
  };
  const formatTimer = (value) => (value < 10 ? `0${value}` : value);

  useEffect(() => {
    if (isModalOpen) {
      let countdown = 5;
      setTimer(countdown);

      const countdownInterval = setInterval(() => {
        countdown -= 1;
        setTimer(countdown);

        if (countdown <= 0) {
          if (
            testData?.honestRespondent?.type ===
            "Enable Warnings and test block"
          ) {
            dispatch(
              getBlockedStudents({
                studentId: studentCreds?._id,
                testId: testId,
              }),
            ).then((res) => {
              if (res.payload) {
                submitTest();
                setSstorage("blockMsg", "");
              }
            });
            clearInterval(countdownInterval);
          }
        }
      }, 1000);
      return () => clearInterval(countdownInterval);
    }
  }, [isModalOpen, testData?.honestRespondent?.type, studentCreds?._id]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoFaceRef.current.srcObject = stream;
      videoFaceRef.current.play();
    } catch (err) {
      console.error("Error accessing camera:", err);
      if (err.name === "NotAllowedError") {
        message.info(
          "Camera access was blocked. Please allow camera access in your browser settings.",
        );
      } else {
        message.info("An error occurred while accessing the camera.", 15);
      }
    }
  };

  useEffect(() => {
    if (videoFaceRef.current) startCamera();
  }, [videoFaceRef.current]);

  useEffect(() => {
    const randomTime = Math.floor(Math.random() * (60 - 15 + 1)) + 15;
    if (
      studentCreds?._id &&
      testData?.facialRecognitionTechnology == "Enable"
    ) {
      setTimeout(() => {
        setRandomTimer(randomTime);
        verifyFace();
      }, randomTime * 1000);
    }
  }, [randomTimer, studentCreds?._id, testData?.facialRecognitionTechnology]);

  const verifyFace = async () => {
    const context = canvasRef.current.getContext("2d");
    context.drawImage(
      videoFaceRef.current,
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height,
    );
    const studentActivity = JSON.parse(getLstorage("activity"));

    const imageData = canvasRef.current.toDataURL("image/png");
    const { data } = await axios.post(proctoringUrl + "/detectlabels", {
      img: imageData,
    });
    if (data.numPersons > 1) {
      studentActivity.push({
        event: {
          name: "Facial Recognition",
          value: "Please ensure that no one is present while you are Verifying",
        },
        time: new Date(),
      });
      setLstorage("activity", JSON.stringify(studentActivity));
      return message.error(
        "Please ensure that no one is present while you are Verifying",
      );
    }
    if (data.numPersons == 0) {
      studentActivity.push({
        event: {
          name: "Facial Recognition",
          value: "Face could not be detected",
        },
        time: new Date(),
      });
      setLstorage("activity", JSON.stringify(studentActivity));
      return message.error("Face could not be detected");
    }
    if (data.checkDevices.phone) {
      studentActivity.push({
        event: {
          name: "Facial Recognition",
          value: "Mobile phone detected",
        },
        time: new Date(),
      });
      setLstorage("activity", JSON.stringify(studentActivity));
      return message.error("Mobile phone detected");
    } else {
      const { data } = await axios.post(proctoringUrl + "/comparefaces", {
        img: imageData,
        studentId: studentCreds?._id,
        bucket_name: "synsper-test-series",
      });
      if (data) {
        if (data?.FaceMatches) {
          const FaceMatchesVal = data?.FaceMatches[0]?.Confidence;
          if (FaceMatchesVal) {
            if (FaceMatchesVal < 90) {
              studentActivity.push({
                event: {
                  name: "Facial Recognition",
                  value: "Face does not match",
                },
                time: new Date(),
              });
              setLstorage("activity", JSON.stringify(studentActivity));
              return message.error("Face does not match");
            }
          }
        }
      }
    }
    setLstorage("activity", JSON.stringify(studentActivity));
  };

  // const submitTest = () => {
  //   let studentActivity = JSON.parse(getLstorage("activity"));
  //   setSstorage("attemptId", attemptId);
  //   studentActivity.push({ event: { name: "testEnded" }, time: new Date() });
  //   socket.emit("testEnded", {
  //     userId: sessionStorage.getItem("userId"),
  //     ...userData,
  //     flagged: flagCheck,

  //     response: {
  //       ...responses.value,
  //     },
  //     studentData: {
  //       ...userData.studentData,
  //       tabswitchCount: tabSwitchCount || 0,
  //       blockMessage: blockMsg,
  //     },
  //     studentActivity,
  //     createdAt: new Date().toLocaleString(),
  //   });

  //   setOpen(false);
  //   setOpenTime(false);

  //   const studentSiteUrl = `${studentServerUrl}/${testData?.title}/result?testId=${testId}`;
  //   if (studentCreds?.ranStu) {
  //     clearLstorageVals();
  //     clearSstorageVals("attemptId");
  //     nav.replace(`/resultsPage?t_Id=${testId}&s_Id=${stId}`);
  //   } else {
  //     clearLstorageVals();
  //     window.close();
  //     window.location.href = studentSiteUrl;
  //   }
  // };
  // console.log(testData?.questions?.[currentQues]);

  if (attemptIdFromSstorage) {
    const attempted = getSstorage("attemptId");
    if (attempted === attemptIdFromSstorage) {
      return (
        <div className={testStyles.message_div}>
          <div>
            <h1>Exam Finished</h1>
          </div>
        </div>
      );
    }
  }

  // --- Guard: no test ID in URL ---
  if (!testId) {
    return (
      <div className={testStyles.message_div}>
        <div>
          <h1 style={{ color: "#e53e3e" }}>⚠️ Test Not Found</h1>
          <p style={{ marginTop: "0.75rem", fontSize: "1rem", color: "#555" }}>
            No test ID was provided. Please use the link sent to you or contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  // --- Guard: test data still loading ---
  if (testDataStatus === "pending") {
    return (
      <div className={testStyles.message_div}>
        <div style={{ textAlign: "center", padding: "2.5rem 3rem" }}>
          <Spin size="large" tip="" />
          <h2 style={{ marginTop: "1.5rem", color: "#1da469", fontWeight: 700, fontSize: "1.2rem" }}>
            Preparing Your Test
          </h2>
          <p style={{ marginTop: "0.5rem", color: "#555", fontSize: "0.95rem" }}>
            Loading questions and settings, please wait…
          </p>
          <p style={{ marginTop: "0.4rem", color: "#999", fontSize: "0.8rem" }}>
            Do not refresh or close this tab.
          </p>
        </div>
      </div>
    );
  }

  // --- Guard: fetch failed ---
  if (testDataStatus === "rejected") {
    return (
      <div className={testStyles.message_div}>
        <div>
          <h1 style={{ color: "#e53e3e" }}>❌ Failed to Load Test</h1>
          <p style={{ marginTop: "0.75rem", fontSize: "1rem", color: "#555" }}>
            We could not load the test data. Please check your internet connection and try again,
            or contact your administrator if the problem persists.
          </p>
        </div>
      </div>
    );
  }

  // --- Guard: fetch succeeded but returned no data ---
  if (testDataStatus === "fulfilled" && !testData) {
    return (
      <div className={testStyles.message_div}>
        <div>
          <h1 style={{ color: "#e53e3e" }}>⚠️ Test Not Available</h1>
          <p style={{ marginTop: "0.75rem", fontSize: "1rem", color: "#555" }}>
            This test could not be found or may have been removed. Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Suspense>
      {/* Add proctoring status indicator */}
      <ProctorMessageDisplay />
      <Modal />
      {testData && (
        <div className={testStyles.container}>
          {/* YOUR EXISTING HEADER - UNCHANGED */}
          <div className={testStyles.header}>
            <div className={testStyles.logo_div}>
              <img
                src={
                  testData?.logo ||
                  "https://res.cloudinary.com/cliqtick/image/upload/v1719655704/sysnper/0453fc71095e542039bc12d663b51f15_ob8vur.png"
                }
                alt="user logo"
                className={testStyles.user_logo}
              />
              <h2 className={testStyles.name}>
                {testData?.title || testData?.jobTitle}
              </h2>
            </div>
            <div className={testStyles.header2Btns}>
              <Button type="default" onClick={requestFullScreen}>
                {fullScreen ? "Exit" : "Enter"} Full Screen
              </Button>
              <Button type="primary" onClick={showModal}>
                Submit
              </Button>
            </div>

          </div>

          {/* HEADER2 — only shown after student enters fullscreen */}
          {testStarted && fullScreen && (
            <div className={testStyles.header2}>
              <div className={testStyles.fullScreenBtn}>
                {/* Sections (category) tabs — moved here from right panel */}
                {testData?.questions?.length > 0 && (() => {
                  const cats = [];
                  testData.questions.forEach((q) => {
                    const name = q.questionCategory?.[0]?.name || "Uncategorized";
                    if (!cats.includes(name)) cats.push(name);
                  });

                  const selected = activeCategory || cats[0] || "Uncategorized";
                  return cats.length >= 1 ? (
                    <div className={testStyles.headerCategoryTabs}>
                      {cats.map((cat) => {
                        const firstIndex = testData.questions.findIndex(
                          (q) => (q.questionCategory?.[0]?.name || "Uncategorized") === cat
                        );
                        const catQs = testData.questions.filter(
                          (q) => (q.questionCategory?.[0]?.name || "Uncategorized") === cat
                        );
                        const answered = catQs.filter((q) => {
                          const hasResp = responses?.value?.[q._id]?.answers?.length > 0;
                          return q.status === "answered" || hasResp;
                        }).length;
                        return (
                          <Button
                            key={cat}
                            ref={(el) => (categoryTabsRef.current[cat] = el)}
                            id={`category-tab-${cat.replace(/\s+/g, '-')}`}
                            onClick={() => {
                              setActiveCategory(cat);
                              if (firstIndex !== -1) setCurrentQues(firstIndex);
                            }}
                            type={activeCategory === cat ? "primary" : "default"}
                          >
                            <span className={testStyles.categoryTabName}>{cat}&nbsp;: &nbsp;</span>
                            <span className={testStyles.categoryTabProgress}>{answered}/{catQs.length}</span>
                          </Button>
                        );
                      })}
                    </div>
                  ) : null;
                })()}
                <div className={testStyles.headerRight}>
                  <p className={testStyles.maxScore}>
                    Maximum Score : <span>{totalScor}</span>
                  </p>
                  <p>
                    Total Test Duration :&nbsp;
                    <strong>
                      {duration?.val1 && !isNaN(duration.val1)
                        ? `${String(duration.val1).padStart(2, "00")}H : ${String(
                          isNaN(duration.val2) ? "00" : duration.val2,
                        ).padStart(2, "00")}M`
                        : `00 : ${String(
                          isNaN(duration.val2) ? "00" : duration.val2,
                        ).padStart(2, "00")}M`}
                    </strong>
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* Three states: initial prompt → fullscreen warning → exam body */}
          {!testStarted ? (
            // STATE 1: Before first fullscreen — show start prompt
            <div className={testStyles.fullscreenPrompt}>
              <div className={testStyles.fullscreenIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1da469" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                </svg>
              </div>
              <h2>Fullscreen Required to Start the Exam</h2>
              <p className={testStyles.fullscreenDesc}>
                For exam integrity, you must enter fullscreen mode before the test begins.
                The timer will only start once you are in fullscreen.
              </p>
              <Button
                type="primary"
                size="large"
                onClick={requestFullScreen}
                style={{
                  background: 'linear-gradient(135deg, #1da469, #17875a)',
                  border: 'none',
                  borderRadius: '2rem',
                  padding: '0.6rem 2.5rem',
                  height: 'auto',
                  fontSize: '1rem',
                  fontWeight: 600,
                  boxShadow: '0 4px 15px rgba(29, 164, 105, 0.35)',
                }}
              >
                🖥️ Enter Full Screen & Start Test
              </Button>
            </div>
          ) : !fullScreen ? (
            // STATE 2: Test started but exited fullscreen — warning, timer keeps running
            <div className={testStyles.fullscreenPrompt}>
              <div className={testStyles.fullscreenIcon} style={{ background: 'linear-gradient(135deg, rgba(255, 57, 57, 0.15), rgba(255, 57, 57, 0.08))' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ff3939" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h2 style={{ color: '#ff3939' }}>⚠️ You Have Exited Fullscreen</h2>
              <p className={testStyles.fullscreenDesc}>
                The exam timer is still running. Please return to fullscreen mode immediately to continue your exam.
              </p>
              <Button
                type="primary"
                size="large"
                onClick={requestFullScreen}
                style={{
                  background: 'linear-gradient(135deg, #ff3939, #cc2e2e)',
                  border: 'none',
                  borderRadius: '2rem',
                  padding: '0.6rem 2.5rem',
                  height: 'auto',
                  fontSize: '1rem',
                  fontWeight: 600,
                  boxShadow: '0 4px 15px rgba(255, 57, 57, 0.35)',
                }}
              >
                🖥️ Return to Fullscreen
              </Button>
            </div>
          ) : (
            <div className={testStyles.body}>
              {/* LEFT SIDE - YOUR EXISTING QUESTION CONTAINER */}
              <div className={testStyles.questionContainer}>
                {testData?.questions?.length && (() => {
                  // Compute per-category display number
                  const currentQuestion = testData?.questions[currentQues];
                  const currentCatName = currentQuestion?.questionCategory?.[0]?.name || "Uncategorized";
                  const sameCategory = testData?.questions?.filter(
                    (q) => (q.questionCategory?.[0]?.name || "Uncategorized") === currentCatName
                  );
                  const categoryLocalIndex = sameCategory.findIndex((q) => q._id === currentQuestion?._id);
                  const displayNumber = categoryLocalIndex + 1;
                  const totalInCategory = sameCategory.length;

                  return (
                    <QuestionUI
                      setAnswers={setAnswers}
                      answers={responses[testData?.questions[currentQues]._id]}
                      questionData={testData?.questions[currentQues]}
                      currentIndex={currentQues}
                      displayNumber={displayNumber}
                      categoryName={currentCatName}
                      totalInCategory={totalInCategory}
                      clearRespFun={clearRespFun}
                      flagCheck={flagCheck}
                    />
                  );
                })()}

                {/* YOUR EXISTING QUESTION FOOTER */}
                <div className={testStyles.questionFooter}>
                  <div className={testStyles.questionFooterLeft}>
                    <Button
                      type="primary"
                      // className={testStyles.questionFooterBtn}
                      onClick={() =>
                        dispatch(
                          mark_for_review({
                            questionId: testData?.questions[currentQues]?._id,
                          }),
                        )
                      }
                    >
                      Mark for Review
                    </Button>
                    <Button
                      type="primary"
                      // className={testStyles.questionFooterBtn}
                      onClick={clearRespFun}
                    >
                      Clear Response
                    </Button>
                  </div>

                  <div className={testStyles.questionFooterRight}>
                    <Button
                      type="primary"
                      icon={
                        <img
                          src="https://res.cloudinary.com/cliqtick/image/upload/v1721625379/sysnper/a59ab59c0357c4d72adbea66b7496401_yzsdgy.png"
                          width={"20px"}
                          height={"20px"}
                        />
                      }
                      // className={testStyles.flagQues}
                      onClick={() => {
                        setIsFlaggedOn(true);
                        setOpenFlag(true);
                      }}
                    >
                      Flag The Question
                    </Button>

                    {currentQues > 0 ? (
                      <div className={testStyles.questionFooterRight}>
                        <Button
                          type="primary"
                          // className={testStyles.questionFooterBtn}
                          onClick={() => {
                            const totalTimeTaken = stopTimer();

                            if (
                              !Object.keys(responses?.value)?.includes(
                                testData?.questions[currentQues]?._id,
                              )
                            ) {
                              dispatch(
                                save_response({
                                  questionId:
                                    testData?.questions[currentQues]._id,
                                  response: answers,
                                  questionType:
                                    testData?.questions[currentQues]
                                      ?.questionType,
                                }),
                              );
                            } else {
                              dispatch(
                                save_response({
                                  questionId:
                                    testData?.questions[currentQues]._id,
                                  response:
                                    responses?.value[
                                      testData?.questions[currentQues]?._id
                                    ]?.answers,
                                  questionType:
                                    testData?.questions[currentQues]
                                      ?.questionType,
                                }),
                              );
                            }

                            setCurrentQues(currentQues - 1);
                            // Auto-switch category tab if previous question is in a different category
                            const prevCat = getCategoryForQuestion(currentQues - 1);
                            const currCat = getCategoryForQuestion(currentQues);
                            if (prevCat !== currCat) {
                              setActiveCategory(prevCat);
                            }
                          }}
                        >
                          Previous Question
                        </Button>
                        <Button
                          type="primary"
                          // className={testStyles.questionFooterBtn}
                          onClick={handleSaveQuestion}
                        >
                          {currentQues == testData?.questions?.length - 1
                            ? "Finish"
                            : "Next"}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="primary"
                        // className={testStyles.questionFooterBtn}
                        onClick={handleSaveQuestion}
                      >
                        {currentQues == testData?.questions?.length - 1
                          ? "Finish"
                          : "Next"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE - YOUR EXISTING REVIEW CONTAINER WITH ENHANCED VIDEO */}
              <div className={testStyles.reviewTestContainer}>
                {/* YOUR EXISTING STUDENT NAME */}
                <div className={testStyles.studentName}>
                  <img
                    src="https://res.cloudinary.com/cliqtick/image/upload/v1719655704/sysnper/0453fc71095e542039bc12d663b51f15_ob8vur.png"
                    alt={userData.studentData.firstName}
                    className={testStyles.userImg}
                  />
                  <p>
                    {userData.studentData.firstName}
                    {studentCreds?.userName?.substring(0, 10) ||
                      " Student Name "}
                    {userData.studentData.lastName}
                  </p>
                </div>

                {/* YOUR EXISTING COUNTDOWN */}
                <div className={testStyles.countdownContainer}>
                  <Progress
                    type="circle"
                    percent={100 - percentage}
                    size={100}
                    strokeColor={{
                      "0%": TimerColors["0%"],
                      "30%": TimerColors["30%"],
                      "50%": TimerColors["50%"],
                      "70%": TimerColors["70%"],
                      "100%": TimerColors["100%"],
                    }}
                    format={() => (
                      <div className={testStyles.timer_div}>
                        <span className={testStyles.timer}>
                          {hours ? String(hours).padStart(2, "0") : "00"}
                        </span>
                        :
                        <span className={testStyles.timer}>
                          {minutes ? String(minutes).padStart(2, "0") : "00"}
                        </span>
                        :
                        <span className={testStyles.timer}>
                          {seconds ? String(seconds).padStart(2, "0") : "00"}
                        </span>
                      </div>
                    )}
                  />
                </div>

                {/* YOUR EXISTING CAMERA STREAM */}
                <div
                  className={testStyles.cameraStreamContainer}
                  id="local-video-container"
                >
                  <video ref={videoFaceRef} autoPlay={true} />
                </div>

                {/* ALL YOUR EXISTING RIGHT SIDE CONTENT */}
                {(() => {
                  const questions = testData?.questions || [];
                  const responseKeys = Object.keys(responses?.value || {});
                  const markedIds = questionsAddedMark || [];

                  let answeredCount = 0;
                  let notAnsweredCount = 0;
                  let markedCount = 0;
                  let markedAndAnsweredCount = 0;
                  let unattemptedCount = 0;

                  questions.forEach((q) => {
                    const hasResponse = responseKeys.includes(q._id) && responses?.value[q._id]?.answers?.length > 0;
                    const isMarked = markedIds.includes(q._id);

                    if (isMarked && hasResponse) markedAndAnsweredCount++;
                    else if (isMarked) markedCount++;
                    else if (q.status === "answered" || hasResponse) answeredCount++;
                    else if (q.status === "not answered") notAnsweredCount++;
                    else unattemptedCount++;
                  });

                  return (
                    <div className={testStyles.testStatusContainer}>
                      <section>
                        <div>
                          <span className={testStyles.answered}>{answeredCount}</span>
                          <p>Answered</p>
                        </div>
                        <div>
                          <span className={testStyles.notAnswered}>{notAnsweredCount}</span>
                          <p>Not Answered</p>
                        </div>
                      </section>
                      <section>
                        <div>
                          <span className={testStyles.marked}>{markedCount}</span>
                          <p>Marked</p>
                        </div>
                        <div>
                          <span className={testStyles.markedAndAnswered}>
                            {markedAndAnsweredCount}
                          </span>
                          <p>Marked & Answered</p>
                        </div>
                      </section>
                      <div>
                        <span className={testStyles.unattempted}>{unattemptedCount}</span>
                        <p>Unattempted</p>
                      </div>
                    </div>
                  );
                })()}

                {/* Category Tabs */}
                {(() => {
                  // Derive unique categories preserving order from questions
                  const categories = [];
                  testData?.questions?.forEach((q) => {
                    const catName = q.questionCategory?.[0]?.name || "Uncategorized";
                    if (!categories.includes(catName)) categories.push(catName);
                  });

                  // Auto-select first category if none selected
                  const selectedCategory = activeCategory || categories[0] || "Uncategorized";

                  // Filter questions by selected category
                  const filteredQuestions = testData?.questions
                    ?.map((q, globalIndex) => ({ ...q, globalIndex }))
                    ?.filter((q) => {
                      const catName = q.questionCategory?.[0]?.name || "Uncategorized";
                      return catName === selectedCategory;
                    });

                  return (
                    <>
                      {/* Question number grid - numbered 1,2,3... per category */}
                      <div className={testStyles.questionMap}>
                        {filteredQuestions?.map((e, localIndex) => {
                          const ind = e.globalIndex;
                          let cName = "unattempted";
                          switch (e.status) {
                            case "answered":
                              cName = "answered";
                              break;
                            case "not answered":
                              cName = "notAnswered";
                              break;
                            case "marked":
                              cName = "marked";
                              break;
                            case "markedAndAnswered":
                              cName = "markedAndAnswered";
                              break;
                            default:
                              cName = "unattempted";
                          }

                          if (
                            questionsAddedMark?.includes(e._id) &&
                            e.status == "answered"
                          )
                            cName = "markedAndAnswered";

                          const displayNum = localIndex + 1;
                          const isActive = ind === currentQues;
                          return (
                            <span
                              key={ind}
                              className={`${testStyles[cName]} ${isActive ? `${testStyles.bgSelected}` : ""}`}
                              onClick={() => {
                                setCurrentQues(ind);
                              }}
                              ref={(el) => {
                                // Auto-scroll active question into view
                                if (isActive && el) {
                                  el.scrollIntoView({ behavior: "smooth", block: "nearest" });
                                }
                              }}
                            >
                              {displayNum < 10 ? "0" + displayNum : displayNum}
                            </span>
                          );
                        })}
                      </div>
                    </>
                  );
                })()}

                {/* <div className={testStyles.honestResponse}>
                    <img
                      src="https://res.cloudinary.com/cliqtick/image/upload/v1719659846/sysnper/da347a56e3f1327b71bb2b55070e042f_fxuzyu.png"
                      alt="honest respondent technology"
                      className={testStyles.honestResImg}
                    />
                    <p>Test is protected by Honest Respondent Technology</p>
                  </div> */}

                {/* ALL YOUR EXISTING MODALS */}
                <>
                  <Modal
                    title="Are you Sure You Want to End this Test"
                    open={open}
                    onOk={submitTest}
                    onCancel={handleCancel}
                    okText="Yes"
                    cancelText="No"
                  ></Modal>
                  <Modal
                    title="Time is Up"
                    open={openTime}
                    onOk={submitTest}
                    keyboard={false}
                    maskClosable={false}
                    footer={[
                      <Button key="ok" type="primary" onClick={submitTest}>
                        OK
                      </Button>,
                    ]}
                    closable={false}
                  ></Modal>
                  <Modal
                    title={
                      <p className={testStyles.modal_title}>
                        I am flagging to report this question as
                      </p>
                    }
                    open={openFlag}
                    onOk={() => {
                      setIsFlaggedOn(false);
                      setOpenFlag(false);
                      message.success(
                        <strong>You are flagged success Fully</strong>,
                      );
                    }}
                    footer={null}
                    onCancel={() => setOpenFlag(false)}
                    okText="Submit"
                    width={600}
                  >
                    {isFlaggedOn && (
                      <div className={testStyles.popUpContainer}>
                        <div className={testStyles.popUpTop}>
                          <div className={testStyles.checkBoxCon}>
                            {flaggedArr?.map((flagopt, i) => {
                              let cls = "unchecnked";
                              if (
                                flagCheck?.find(
                                  (e) =>
                                    e.id ==
                                    testData?.questions[currentQues]?._id &&
                                    e.flag.includes(flagopt),
                                )
                              )
                                cls = "checked";
                              return (
                                <label
                                  key={i}
                                  onClick={(e) =>
                                    toggleFlagCheck(
                                      testData?.questions[currentQues]?._id,
                                      flagopt,
                                    )
                                  }
                                  className={testStyles.optionLable}
                                >
                                  <span
                                    className={`${testStyles.optionsInput} ${testStyles[cls]}`}
                                  />

                                  {flagopt}
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </Modal>
                </>
              </div>
            </div>
          )}
        </div>
      )}

      {/* YOUR EXISTING MODAL FOR TAB SWITCHING */}
      <>
        <Modal
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          maskClosable={false}
          footer={null}
          centered={true}
          closable={false}
          title={<strong>Attention: Test Window Activity Detected</strong>}
          keyboard={false}
        >
          <div>
            <p>
              Your test will be blocked in{" "}
              <strong>{formatTime(timer)}</strong> because you have switched
              the test window more than allowed. This action is monitored to
              ensure the integrity and focus of the test-taking process.
            </p>
          </div>
        </Modal>
      </>
    </Suspense>
  );
}
