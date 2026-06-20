"use client";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { decryptObject } from "../encryptionMiddleware";
import { useDispatch, useSelector } from "react-redux";
import { Button, Modal, Progress, Spin } from "antd";
import { Maximize, Minimize, Send, Shield, Monitor } from 'lucide-react';
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
      {testData && (
        <div className={`${testStyles.container} ${(!testStarted || !fullScreen) ? '!bg-[#f4f8fd] !p-0' : ''} flex flex-col min-h-screen`}>
          {/* YOUR EXISTING HEADER - Hidden when test is started and in full screen */}
          {(!testStarted || !fullScreen) && (
            <div className={`${testStyles.header} bg-[#ffffff] px-6 py-[10px] border-b-[0.5px] border-[#ddeaf6] z-50 relative`} style={{ marginBottom: 0 }}>
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
              <div className={testStyles.header2Btns} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Button 
                  type="default" 
                  onClick={requestFullScreen}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f4f8fd', color: '#4a6fa5', border: '1.5px solid #c8ddf5', fontWeight: 600, fontSize: '13px', padding: '7px 16px', borderRadius: '8px', height: 'auto' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#eef3fa'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f4f8fd'}
                >
                  {fullScreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />} 
                  {fullScreen ? "Exit Full Screen" : "Enter Full Screen"}
                </Button>
                <Button 
                  type="primary" 
                  onClick={showModal}
                  className="!bg-gradient-to-br !from-[#1E69DA] !to-[#5694F0] !border-none !text-white hover:opacity-90"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '13px', padding: '8px 18px', borderRadius: '8px', height: 'auto' }}
                >
                  <Send className="w-4 h-4" /> Submit
                </Button>
              </div>
            </div>
          )}

          {/* HEADER2 REMOVED - The new playerApp topbar now handles category tabs and test duration */}
          
          {testData?.messageText && (
            <div
              style={{
                width: "100%",
                background: "black",
                color: "white",
                padding: "2px",
              }}
            >
              {/* <Marquee pauseOnHover={true}>{testData?.messageText}</Marquee> */}
            </div>
          )}

          {/* Three states: initial prompt → fullscreen warning → exam body */}
          {!testStarted ? (
            // STATE 1: Before first fullscreen — show start prompt
            <div className={testStyles.gateWrap}>
              <div className={testStyles.gateCard}>
                <div className={testStyles.gateIconWrap}>
                  <div className={testStyles.pulseRing}></div>
                  <div className={`${testStyles.pulseRing} ${testStyles.pulseRing2}`}></div>
                  <div className={testStyles.gateIconRing}></div>
                  <div className={testStyles.gateIconInner}>
                    <Maximize size={24} color="#43a047" strokeWidth={2.5} />
                  </div>
                </div>

                <div className={testStyles.gateTitle}>
                  Fullscreen Required to<br /><span>Start the Exam</span>
                </div>

                <div className={testStyles.gateDesc}>
                  For exam integrity, you must enter fullscreen mode before the test begins. The timer will only start once you are in fullscreen.
                </div>

                <div className={testStyles.gateSteps}>
                  <div className={testStyles.gateStep}>
                    <div className={testStyles.stepNum}>1</div>
                    <div className={testStyles.stepText}>
                      <b>Click the button below</b> to enter fullscreen mode and begin your exam session.
                    </div>
                  </div>
                  <div className={testStyles.gateStep}>
                    <div className={testStyles.stepNum}>2</div>
                    <div className={testStyles.stepText}>
                      <b>Do not exit fullscreen</b> during the test — this may be flagged by the proctoring system.
                    </div>
                  </div>
                  <div className={testStyles.gateStep}>
                    <div className={testStyles.stepNum}>3</div>
                    <div className={testStyles.stepText}>
                      <b>Timer starts immediately</b> once you enter fullscreen. Manage your time wisely.
                    </div>
                  </div>
                </div>

                <button className={testStyles.gateBtn} onClick={requestFullScreen}>
                  <Monitor size={18} strokeWidth={2.5} />
                  Enter Full Screen &amp; Start Test
                </button>

                <div className={testStyles.securityNote}>
                  <Shield size={14} color="#c8ddf5" strokeWidth={2} />
                  Secured by Honest Respondent Technology
                </div>
              </div>

              {/* User Chip */}
              {studentCreds && (
                <div className={testStyles.userChip}>
                  {(studentCreds?.profile || studentCreds?.profilePic || studentCreds?.profilePicture) ? (
                    <img 
                      src={studentCreds?.profile || studentCreds?.profilePic || studentCreds?.profilePicture} 
                      alt="User Profile" 
                      className={testStyles.userChipAv}
                      style={{ objectFit: 'cover', padding: 0 }}
                    />
                  ) : (
                    <div className={testStyles.userChipAv}>
                      {studentCreds?.userName?.charAt(0)?.toUpperCase() || studentCreds?.FullName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className={testStyles.userChipName}>
                    {studentCreds?.userName || studentCreds?.FullName || 'User'}
                  </div>
                </div>
              )}
            </div>
          ) : !fullScreen ? (
            // STATE 2: Test started but exited fullscreen — warning, timer keeps running
            <div className="flex-1 w-full flex flex-col items-center justify-center p-6">
              <div className="bg-white rounded-3xl shadow-[0_12px_40px_rgb(0,0,0,0.08)] border border-red-50 max-w-md w-full p-12 flex flex-col items-center text-center mt-[-40px]">
                
                {/* Icon */}
                <div className="w-20 h-20 rounded-full border-[2px] border-dashed border-[#ff3939] flex items-center justify-center bg-white mb-6">
                  <div className="w-14 h-14 rounded-full bg-[#fff1f1] flex items-center justify-center">
                    <Monitor className="w-7 h-7 text-[#ff3939]" />
                  </div>
                </div>

                <h2 className="text-[24px] font-extrabold text-[#ff3939] mb-4 leading-tight flex items-center gap-2 justify-center">
                  <span className="text-yellow-400">⚠️</span> You Have Exited Fullscreen
                </h2>
                
                <p className="text-[15px] text-[#64748b] leading-relaxed mb-8 px-2">
                  The exam timer is still running. Please return to fullscreen mode immediately to continue your exam.
                </p>

                <Button
                  type="primary"
                  size="large"
                  onClick={requestFullScreen}
                  className="w-auto px-8 !bg-[#ff3939] hover:!bg-[#cc2e2e] !text-white !border-none h-12 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(255,57,57,0.25)] transition-all"
                >
                  <Maximize className="w-5 h-5" /> Return to Fullscreen
                </Button>
              </div>
            </div>
          ) : (
            <div className={testStyles.playerApp}>
              {/* Top bar */}
              <div className={testStyles.topbar}>
                <div className={testStyles.testLogo}>CS</div>
                <div className={testStyles.testName}>{testData?.testName || "SkillMedha Test"}</div>
                
                {/* Restored topbarMid */}
                {testData?.questions?.length && (() => {
                   const currentQuestion = testData?.questions[currentQues];
                   const currentCatName = currentQuestion?.questionCategory?.[0]?.name || "Uncategorized";
                   const sameCategory = testData?.questions?.filter(
                     (q) => (q.questionCategory?.[0]?.name || "Uncategorized") === currentCatName
                   );
                   const categoryLocalIndex = sameCategory.findIndex((q) => q._id === currentQuestion?._id);
                   const displayNumber = categoryLocalIndex + 1;
                   const totalInCategory = sameCategory.length;
                   const pct = (displayNumber / totalInCategory) * 100;

                   return (
                      <div className={testStyles.topbarMid}>
                        <div className={testStyles.catBadge}>
                          <i className="ti ti-tag" style={{fontSize:"13px"}}></i> {currentCatName} &nbsp;·&nbsp; {displayNumber} / {totalInCategory}
                        </div>
                        <div className={testStyles.progressMini}>
                          <div className={testStyles.progressMiniBar}>
                            <div className={testStyles.progressMiniFill} style={{width: `${pct}%`}}></div>
                          </div>
                          <div className={testStyles.progressMiniLbl}>Question {currentQues + 1} of {testData?.questions?.length}</div>
                        </div>
                      </div>
                   )
                })()}                <div className={testStyles.topbarRight}>
                  <div className={testStyles.scoreInfo}>
                    <div className={testStyles.scoreLbl}>Duration</div>
                    <div className={testStyles.scoreVal}>
                      {hours ? String(hours).padStart(2, "0") : "00"} : {minutes ? String(minutes).padStart(2, "0") : "00"} : {seconds ? String(seconds).padStart(2, "0") : "00"}
                    </div>
                  </div>
                  <button className={testStyles.exitBtn} onClick={requestFullScreen}>
                    <i className="ti ti-arrows-minimize" style={{fontSize:"13px"}}></i> Exit Full Screen
                  </button>
                  <button className={testStyles.submitBtn} onClick={() => setOpen(true)}>
                    <i className="ti ti-send" style={{fontSize:"13px"}}></i> Submit
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className={testStyles.playerBody}>
                {/* Question Area */}
                <div className={testStyles.questionArea}>
                  {/* Category info */}
                  {testData?.questions?.length && (() => {
                     const currentQuestion = testData?.questions[currentQues];
                     const currentCatName = currentQuestion?.questionCategory?.[0]?.name || "Uncategorized";
                     const qScore = testData?.questions[currentQues]?.marks || 0;
                     const qType = testData?.questions[currentQues]?.questionType || "Objective";

                     return (
                        <div className={testStyles.sectionHeader}>
                          <div className={testStyles.sectionName}><i className="ti ti-folder"></i> {currentCatName}</div>
                          <div className={testStyles.qCounter}>—&nbsp; Question <span>{currentQues + 1}</span> of {testData?.questions?.length}</div>
                          <div className={testStyles.qTypeBadge}><i className="ti ti-list-check" style={{fontSize:"12px"}}></i> {qType}</div>
                          <div className={testStyles.qScoreBadge}><i className="ti ti-star"></i> Score: {qScore}</div>
                        </div>
                     )
                  })()}

                  <div className={testStyles.qScroll}>
                    {/* The original QuestionUI goes here */}
                    {testData?.questions?.length && (() => {
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
                  </div>

                  {/* Action Bar */}
                  <div className={testStyles.actionBar}>
                    <div className={testStyles.actionLeft}>
                      <button className={`${testStyles.actBtn} ${testStyles.actBtnReview}`} onClick={() => dispatch(mark_for_review({ questionId: testData?.questions[currentQues]?._id }))}>
                        <i className="ti ti-bookmark" style={{fontSize:"14px"}}></i> Mark for Review
                      </button>
                      <button className={`${testStyles.actBtn} ${testStyles.actBtnClear}`} onClick={clearRespFun}>
                        <i className="ti ti-eraser" style={{fontSize:"14px"}}></i> Clear Response
                      </button>
                    </div>
                    <div className={testStyles.actionRight}>
                      <button className={`${testStyles.actBtn} ${testStyles.actBtnFlag}`} onClick={() => { setIsFlaggedOn(true); setOpenFlag(true); }}>
                        <i className="ti ti-flag" style={{fontSize:"14px"}}></i> Flag Question
                      </button>
                      
                      {currentQues > 0 ? (
                        <button className={`${testStyles.actBtn} ${testStyles.actBtnNav}`} onClick={() => {
                          const totalTimeTaken = stopTimer();

                          if (!Object.keys(responses?.value)?.includes(testData?.questions[currentQues]?._id)) {
                            dispatch(save_response({
                              questionId: testData?.questions[currentQues]._id,
                              response: answers,
                              questionType: testData?.questions[currentQues]?.questionType,
                            }));
                          } else {
                            dispatch(save_response({
                              questionId: testData?.questions[currentQues]._id,
                              response: responses?.value[testData?.questions[currentQues]?._id]?.answers,
                              questionType: testData?.questions[currentQues]?.questionType,
                            }));
                          }

                          setCurrentQues(currentQues - 1);
                          const prevCat = getCategoryForQuestion(currentQues - 1);
                          const currCat = getCategoryForQuestion(currentQues);
                          if (prevCat !== currCat) {
                            setActiveCategory(prevCat);
                          }
                        }}>
                          <i className="ti ti-chevron-left" style={{fontSize:"14px"}}></i> Previous
                        </button>
                      ) : null}

                      <button className={`${testStyles.actBtn} ${testStyles.actBtnNext}`} onClick={handleSaveQuestion}>
                        {currentQues === (testData?.questions?.length || 0) - 1 ? "Finish" : "Next"} <i className="ti ti-chevron-right" style={{fontSize:"14px"}}></i>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Panel */}
                <div className={testStyles.rightPanel}>
                  {/* User */}
                  <div className={`${testStyles.rpUser} ${testStyles.rpSection}`}>
                    {(studentCreds?.profile || studentCreds?.profilePic || studentCreds?.profilePicture) ? (
                      <img 
                        src={studentCreds?.profile || studentCreds?.profilePic || studentCreds?.profilePicture} 
                        alt="User Profile" 
                        className={testStyles.rpAv}
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div className={testStyles.rpAv}>
                        {studentCreds?.userName?.charAt(0)?.toUpperCase() || studentCreds?.FullName?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <div>
                      <div className={testStyles.rpName}>{studentCreds?.userName || studentCreds?.FullName || 'User'}</div>
                      <div className={testStyles.rpRole}>Test Candidate</div>
                    </div>
                  </div>

                  {/* Timer */}
                  <div className={`${testStyles.timerWrap} ${testStyles.rpSection}`}>
                    <div className={testStyles.timerRingOuter}>
                      <svg width="80" height="80" viewBox="0 0 80 80">
                        <circle className={testStyles.timerRingBg} cx="40" cy="40" r="36" />
                        <circle 
                          className={testStyles.timerRingFill} 
                          cx="40" cy="40" r="36" 
                          style={{
                            strokeDashoffset: 226 * (1 - ((hours * 3600 + minutes * 60 + seconds) / (testData?.timeLimit * 60 || 1))),
                            stroke: (hours * 3600 + minutes * 60 + seconds) < 300 ? '#e53935' : (hours * 3600 + minutes * 60 + seconds) < 600 ? '#ffa726' : '#1565c0'
                          }}
                        />
                      </svg>
                      <div className={testStyles.timerCenter}>
                        <div className={testStyles.timerVal} style={{color: (hours * 3600 + minutes * 60 + seconds) < 300 ? '#c62828' : (hours * 3600 + minutes * 60 + seconds) < 600 ? '#e65100' : '#0d47a1'}}>
                          {minutes ? String(minutes).padStart(2, "0") : "00"}:{seconds ? String(seconds).padStart(2, "0") : "00"}
                        </div>
                        <div className={testStyles.timerLbl}>Remaining</div>
                      </div>
                    </div>
                  </div>

                  {/* Webcam */}
                  <div className={testStyles.webcamBox}>
                    <video ref={videoFaceRef} autoPlay={true} muted={true} style={{width:'100%', height:'100%', objectFit:'cover', borderRadius:'10px', transform: 'scaleX(-1)'}} />
                    <div className={testStyles.recBadge}><div className={testStyles.recDot}></div> REC</div>
                  </div>

                  {/* Status Legend */}
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
                      <div className={`${testStyles.statusLegend} ${testStyles.rpSection}`}>
                        <div className={testStyles.legendTitle}>Question Status</div>
                        <div className={testStyles.legendGrid}>
                          <div className={testStyles.legendItem}>
                            <div className={`${testStyles.legendDot} ${testStyles.answered}`}>{answeredCount}</div> Answered
                          </div>
                          <div className={testStyles.legendItem}>
                            <div className={`${testStyles.legendDot} ${testStyles.notAnswered}`} style={{color:"var(--text2)"}}>{unattemptedCount + notAnsweredCount}</div> Not Answered
                          </div>
                          <div className={testStyles.legendItem}>
                            <div className={`${testStyles.legendDot} ${testStyles.marked}`}>{markedCount}</div> Marked
                          </div>
                          <div className={testStyles.legendItem}>
                            <div className={`${testStyles.legendDot} ${testStyles.markedAnswered}`}>{markedAndAnsweredCount}</div> Marked & Answered
                          </div>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Question grid */}
                  {(() => {
                    // Filter questions by selected category or all
                    const selectedCategory = activeCategory || testData?.questions?.[0]?.questionCategory?.[0]?.name || "Uncategorized";
                    const filteredQuestions = testData?.questions
                      ?.map((q, globalIndex) => ({ ...q, globalIndex }))
                      ?.filter((q) => {
                        const catName = q.questionCategory?.[0]?.name || "Uncategorized";
                        return catName === selectedCategory;
                      });

                    return (
                      <div className={testStyles.qgridWrap}>
                        <div className={testStyles.qgridLabel}>Jump to question</div>
                        <div className={testStyles.qgrid}>
                          {filteredQuestions?.map((e, localIndex) => {
                            const ind = e.globalIndex;
                            let cName = testStyles.qnumBtn;
                            
                            if (ind === currentQues) {
                              cName += ` ${testStyles.current}`;
                            } else if (questionsAddedMark?.includes(e._id) && (e.status === "answered" || (Object.keys(responses?.value || {}).includes(e._id) && responses?.value[e._id]?.answers?.length > 0))) {
                              cName += ` ${testStyles.markedAnswered}`;
                            } else if (questionsAddedMark?.includes(e._id)) {
                              cName += ` ${testStyles.marked}`;
                            } else if (e.status === "answered" || (Object.keys(responses?.value || {}).includes(e._id) && responses?.value[e._id]?.answers?.length > 0)) {
                              cName += ` ${testStyles.answered}`;
                            }

                            const displayNum = localIndex + 1;
                            return (
                              <button
                                key={ind}
                                className={cName}
                                onClick={() => setCurrentQues(ind)}
                              >
                                {displayNum < 10 ? "0" + displayNum : displayNum}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                </div>
              </div>



                {/* ALL YOUR EXISTING MODALS */}
                <>
                {open && (() => {
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
                    <div className={`${testStyles.modalOverlay} ${testStyles.show}`}>
                      <div className={testStyles.modalBox}>
                        <div className={testStyles.modalIcon}><i className="ti ti-alert-triangle"></i></div>
                        <div className={testStyles.modalTitle}>Are you sure you want to end this test?</div>
                        <div className={testStyles.modalSub}>
                          You still have <strong>{testData?.questions?.length - Object.keys(responses?.value || {}).length}</strong> unanswered question(s). 
                          Once submitted, you cannot change your answers. This action cannot be undone.
                        </div>
                        <div className={testStyles.modalStatsRow}>
                          <div className={testStyles.modalStat} style={{background: 'var(--green-bg)', color: 'var(--green-txt)'}}>
                            <div className={testStyles.statNum}>{answeredCount}</div>
                            <div className={testStyles.statLbl}>Answered</div>
                          </div>
                          <div className={testStyles.modalStat} style={{background: 'var(--red-bg)', color: 'var(--red-txt)'}}>
                            <div className={testStyles.statNum}>{notAnsweredCount + unattemptedCount}</div>
                            <div className={testStyles.statLbl}>Unanswered</div>
                          </div>
                          <div className={testStyles.modalStat} style={{background: 'var(--orange-bg)', color: 'var(--orange)'}}>
                            <div className={testStyles.statNum}>{markedCount + markedAndAnsweredCount}</div>
                            <div className={testStyles.statLbl}>Marked</div>
                          </div>
                        </div>
                        <div className={testStyles.modalBtns}>
                          <button type="button" className={testStyles.modalCancel} onClick={handleCancel}>
                            <i className="ti ti-x" style={{fontSize: "13px", marginRight: "4px"}}></i> No, Go Back
                          </button>
                          <button type="button" className={testStyles.modalConfirm} onClick={submitTest}>
                            <i className="ti ti-check" style={{fontSize: "13px", marginRight: "4px"}}></i> Yes, End Test
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}
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
