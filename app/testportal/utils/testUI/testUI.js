"use client";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState, useMemo } from "react";
import { decryptObject } from "../encryptionMiddleware";
import { useDispatch, useSelector } from "react-redux";
import { Button, Modal, Progress, Spin, ConfigProvider, Dropdown } from "antd";
import { Maximize, Minimize, Send, Shield, Monitor } from 'lucide-react';
import {
  clear_all_responses,
  getSingleJobTest,
  getSingleTest,
  mark_for_review,
  unmark_for_review,
  clear_response,
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
import { saveTestResults } from "@/app/testportal/redux/slices/studentSlice";
import {
  persistPortalResult,
  getPersistedPortalResult,
} from "../resultPersistence";

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
  const rawTestData = useSelector((state) => {
    return state.Test.testData.value;
  });
  const testDataStatus = useSelector((state) => state.Test.testData.status);
  const studentCreds = useSelector((state) => state.Student.studentVals?.data);

  const testData = useMemo(() => {
    if (!rawTestData?.questions?.length) return rawTestData;

    // Create a deterministic seed based on student ID and test ID
    const studentId = studentCreds?._id || "anonymous";
    const testId = rawTestData._id || "test";
    const seedStr = studentId + testId;
    let seed = 0;
    for (let i = 0; i < seedStr.length; i++) {
      seed = (seed << 5) - seed + seedStr.charCodeAt(i);
      seed |= 0;
    }

    // Simple LCG random function
    const random = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    const cloned = JSON.parse(JSON.stringify(rawTestData));

    // 1. Group questions by category
    const byCategory = {};
    cloned.questions.forEach(q => {
      const cat = q.questionCategory?.[0]?.name || "Uncategorized";
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(q);
    });

    // 2. Shuffle questions inside each category, AND shuffle their options
    let shuffledQuestions = [];
    for (const cat in byCategory) {
      const catQues = byCategory[cat];

      for (let i = catQues.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [catQues[i], catQues[j]] = [catQues[j], catQues[i]];
      }

      // Shuffle options for each question
      catQues.forEach(q => {
        if (q.questionContent?.options?.length > 1) {
          const opts = q.questionContent.options;
          for (let i = opts.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [opts[i], opts[j]] = [opts[j], opts[i]];
          }
        }
      });

      shuffledQuestions.push(...catQues);
    }

    cloned.questions = shuffledQuestions;
    return cloned;
  }, [rawTestData, studentCreds?._id]);
  let tabSwitchCount = parseInt(getSstorage("tabChangeCount"));
  let blockMsg = getSstorage("blockMsg");
  const [flagCheck, setFlagCheck] = useState([]);
  const [tempFlagSelection, setTempFlagSelection] = useState([]);
  const [testStarted, setTestStarted] = useState(
    getSstorage("testStarted") === "true"
  );
  const testStartedRef = useRef(getSstorage("testStarted") === "true");
  const [activeCategory, setActiveCategory] = useState(
    getSstorage("activeCategory") || null
  );
  const categoryTabsRef = useRef({});
  const categoryScrollRef = useRef(null);
  const [showCatLeft, setShowCatLeft] = useState(false);
  const [showCatRight, setShowCatRight] = useState(true);

  const checkCatScroll = () => {
    if (categoryScrollRef.current) {
      const { scrollLeft } = categoryScrollRef.current;
      setShowCatLeft(scrollLeft > 0);
      // Ensure right arrow remains visible by default as requested
      setShowCatRight(true);
    }
  };

  const handleCatScroll = (dir) => {
    if (categoryScrollRef.current) {
      // Find the approximate width of a single card + gap
      const firstChild = categoryScrollRef.current.children[0];
      const scrollAmount = firstChild ? firstChild.offsetWidth + 12 : 250;
      categoryScrollRef.current.scrollBy({ left: dir === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const timer = setInterval(checkCatScroll, 500); // Check repeatedly to catch any layout shifts
    window.addEventListener('resize', checkCatScroll);
    return () => {
      clearInterval(timer);
      window.removeEventListener('resize', checkCatScroll);
    };
  }, [testData, currentQues]);

  useEffect(() => {
    if (testData?.questions?.length > 0 && currentQues >= testData.questions.length) {
      setCurrentQues(0);
      setSstorage("currQues", 0);
    }
  }, [testData, currentQues]);

  const timeoutRef = useRef(null);
  const testIdEnc = searchParams.get("st_d");
  const studentEnc = searchParams.get("st_t");
  const { testId, attemptId } = decryptObject(testIdEnc, "studentTestIDValue") || {};
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

  // Disable Developer Tools during the test
  useEffect(() => {
    const disableDevTools = (e) => {
      // Prevent F12
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
      }
      // Prevent Ctrl+Shift+I / J / C and Ctrl+U
      if (e.ctrlKey || e.metaKey) {
        const key = e.key ? e.key.toLowerCase() : '';
        if (e.shiftKey && (key === 'i' || key === 'j' || key === 'c' || e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
          e.preventDefault();
        }
        if (key === 'u' || e.keyCode === 85) {
          e.preventDefault();
        }
      }
    };
    const disableContextMenu = (e) => {
      e.preventDefault();
    };

    if (testStarted) {
      document.addEventListener('keydown', disableDevTools);
      document.addEventListener('contextmenu', disableContextMenu);
    }
    return () => {
      document.removeEventListener('keydown', disableDevTools);
      document.removeEventListener('contextmenu', disableContextMenu);
    };
  }, [testStarted]);

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
  // Clear stale session storage if loading a new test attempt
  useEffect(() => {
    if (attemptId && attemptId !== getSstorage("lastAttemptId")) {
      clearSstorageVals("flagged");
      clearSstorageVals("marked");
      clearSstorageVals("value");
      clearSstorageVals("currQues");
      clearSstorageVals("activeCategory");
      setSstorage("lastAttemptId", attemptId);
      setSstorage("activeTestId", testId);
      setFlagCheck([]);
      dispatch(clear_all_responses());
    } else if (!flagCheck?.length && getSstorage("flagged")) {
      setFlagCheck(parseIfJson(getSstorage("flagged")));
    } else {
      setSstorage("flagged", JSON.stringify(flagCheck));
    }
  }, [attemptId, testId, dispatch]);

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
    const submissionPayload = {
      userId: getSstorage("userId"),
      ...userData,
      flagged: flagCheck,
      marked: questionsAddedMark,
      response: finalResponses,
      studentData: {
        ...userData.studentData,
        tabswitchCount: tabSwitchCount || 0,
        blockMessage: blockMsg,
      },
      createdAt: new Date().toLocaleString(),
      testId,
      testTitle: testData?.title,
      testStartedAt: +getSstorage("testStartedAt"),
      testEndedAt: new Date().getTime(),
    };

    if (proctoringActive) {
      console.log("🛑 Stopping proctoring before test submission");
      stopProctoring();
    }
    if (socket) {
      if (testType === "jobtest") {
        const jobPayload = {
          ...submissionPayload,
          response: {
            ...responses.value,
          },
          jobId: testData?.jobId,
          assessmentId: testData?._id,
          proctoringData: {
            sessionId: proctoringSessionData?.sessionId,
            connectionStatus: connectionStatus,
          },
        };
        socket.emit("jobAssessmentEnded", jobPayload);
      } else {
        socket.emit("testEnded", submissionPayload);
      }
    }
    setOpen(false);
    setOpenTime(false);

    const persistSubmissionResult = (payload = null) => {
      const payloadToPersist = payload || submissionPayload;
      const persistedResult = persistPortalResult({
        ...payloadToPersist,
        testId,
        scoreData: payloadToPersist?.scoreData || null,
      });
      if (persistedResult) {
        dispatch(
          saveTestResults({
            userId: persistedResult?.userId,
            testId: persistedResult?.testId || testId,
            response: persistedResult?.response || finalResponses,
            studentData: persistedResult?.studentData,
            flagged: persistedResult?.flagged,
            marked: persistedResult?.marked,
            scoreData: persistedResult?.scoreData,
          }),
        );
      }
    };

    let redirected = false;
    const handleRedirect = (payload) => {
      if (redirected) return;
      redirected = true;
      persistSubmissionResult(payload);
      if (typeof window !== "undefined") {
        if (window.opener) {
          window.close();
        } else {
          const isJobAssessment = window.location.pathname.includes('/jobAssessments');
          const source = isJobAssessment ? 'job' : 'test';
          const submittedProgressId = payload?.progressId || payload?.progData?.toString() || payload?._id;
          const progressQuery = submittedProgressId ? `&progressId=${submittedProgressId}` : '';
          const studentSiteUrl = `/student/tests/${testData?.title}/result?testId=${testId}&from=${source}${progressQuery}`;
          window.location.href = studentSiteUrl;
        }
      }
    };

    if (socket) {
      socket.once("testEndedtestportal", handleRedirect);
      // Fallback in case socket event is missed
      setTimeout(() => handleRedirect(getPersistedPortalResult(testId)), 2500);
    } else {
      persistSubmissionResult();
      setTimeout(() => handleRedirect(), 2500);
    }
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

  // Keep activeCategory synced with currentQues at all times
  useEffect(() => {
    if (testData?.questions?.length > 0) {
      const currentCatName = testData.questions[currentQues]?.questionCategory?.[0]?.name || "Uncategorized";
      if (activeCategory !== currentCatName) {
        setActiveCategory(currentCatName);
      }
    }
  }, [testData, currentQues]);

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

  const showModalTime = (val) => {
    setOpenTime(val);
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
            responses?.value[testData?.questions[currentQues]?._id]?.answers || [],
          questionType: testData?.questions[currentQues]?.questionType,
        }),
      );
    }

    setAnswers(responses[testData?.questions[currentQues]?._id] || []);
    if (currentQues == testData.questions.length - 1) {
      setOpen(true);
      return;
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
    const qid = testData?.questions[currentQues]?._id;
    if (testData?.questions[currentQues]?.questionType == "Short Paragraph") {
      dispatch(
        save_response({
          questionId: qid,
          response: [""],
          questionType: testData?.questions[currentQues]?.questionType,
        }),
      );
    }
    dispatch(
      clear_response({
        questionId: qid,
      }),
    );
    setAnswers([]);

    // Clear Mark for Review
    if (questionsAddedMark?.includes(qid)) {
      dispatch(unmark_for_review({ questionId: qid }));
    }

    // Clear Flag
    if (flagCheck?.some((f) => f.id === qid)) {
      const newFlags = flagCheck.filter((f) => f.id !== qid);
      setFlagCheck(newFlags);
      setSstorage("flagged", JSON.stringify(newFlags));
    }
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

  const handleStartTest = () => {
    requestFullScreen();
    setTestStarted(true);
    testStartedRef.current = true;
    try {
      const currentTestId = testData?._id || testId;
      if (currentTestId) {
        const generation = testData?.attemptGeneration || 0;
        const attemptKey = `${currentTestId}_${generation}`;
        const attempts = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("localAttempts") || "{}") : {};
        attempts[attemptKey] = (attempts[attemptKey] || 0) + 1;
        localStorage.setItem("localAttempts", JSON.stringify(attempts));
      }
    } catch (e) { console.error("Error updating localAttempts", e); }

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
  };

  useEffect(() => {
    if (testStartedRef.current) {
      if (testType === "jobtest") {
        socket.emit("jobAssessmentStarted", {
          userId: stId,
        });
      } else {
        socket.emit("testStarted", {
          userId: stId,
        });
      }
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
          <ConfigProvider theme={{ token: { colorPrimary: '#2563eb' } }}>
            <Spin size="large" tip="" />
          </ConfigProvider>
          <h2 style={{ marginTop: "1.5rem", color: "#2563eb", fontWeight: 700, fontSize: "1.2rem" }}>
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

                <button className={testStyles.gateBtn} onClick={handleStartTest}>
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
              <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] max-w-[480px] w-full p-10 flex flex-col items-center text-center">

                {/* Icon */}
                <div className="w-24 h-24 rounded-full border-[2px] border-dashed border-[#ff3939] flex items-center justify-center mb-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#fff1f1] to-white rounded-full"></div>
                  <div className="relative z-10 w-16 h-16 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,57,57,0.2)]">
                    <Monitor className="w-8 h-8 text-[#ff3939]" />
                  </div>
                </div>

                <h2 className="text-[22px] font-extrabold text-[#ff3939] mb-4 leading-tight flex items-center gap-2 justify-center">
                  <span className="text-[#ffb800] text-2xl">⚠️</span> You Have Exited Fullscreen
                </h2>

                <p className="text-[15px] text-[#64748b] leading-relaxed mb-8 px-4 font-medium">
                  The exam timer is still running. Please return to fullscreen mode immediately to continue your exam.
                </p>

                <div className="w-full border-t border-gray-200/60 pt-8 mt-2">
                  <Button
                    type="primary"
                    size="large"
                    onClick={requestFullScreen}
                    className="w-full !bg-[#ff3939] hover:!bg-[#cc2e2e] !text-white !border-none h-14 rounded-xl font-bold text-[16px] flex items-center justify-center gap-2 transition-all shadow-none"
                  >
                    <Maximize className="w-5 h-5" /> Return to Fullscreen
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className={testStyles.playerApp}>
              {/* Top bar */}
              <div className={testStyles.topbar}>
                {testData?.image || testData?.logo ? (
                  <img
                    src={testData?.image || testData?.logo}
                    alt="Test Logo"
                    className={testStyles.testLogo}
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div className={testStyles.testLogo}>
                    {(testData?.testName || testData?.title || testData?.jobTitle || "ST").substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div className={testStyles.testName} style={{ fontSize: '24px', fontWeight: '800' }}>
                  {testData?.testName || testData?.title || testData?.jobTitle || "SkillMedha Test"}
                </div>

                {/* Restored topbarMid */}
                {testData?.questions?.length && (() => {
                  const currentQuestion = testData?.questions[currentQues];
                  const currentCatName = currentQuestion?.questionCategory?.[0]?.name || "Uncategorized";

                  // Group all questions by category to count them
                  const allCategories = [];
                  const catMap = {};
                  testData?.questions.forEach(q => {
                    const cat = q.questionCategory?.[0]?.name || "Uncategorized";
                    if (!catMap[cat]) {
                      catMap[cat] = { name: cat, total: 0, questions: [], startIndex: -1 };
                      allCategories.push(catMap[cat]);
                    }
                    if (catMap[cat].startIndex === -1) {
                      catMap[cat].startIndex = testData.questions.indexOf(q);
                    }
                    catMap[cat].total++;
                    catMap[cat].questions.push(q);
                  });

                  const sameCategory = catMap[currentCatName]?.questions || [];
                  const categoryLocalIndex = sameCategory.findIndex((q) => q._id === currentQuestion?._id);
                  const displayNumber = categoryLocalIndex + 1;
                  const totalInCategory = sameCategory.length;
                  const pct = (displayNumber / totalInCategory) * 100;

                  return (
                    <div className="flex flex-1 items-center" style={{ marginLeft: '12px', minWidth: 0 }}>
                      <button
                        onClick={() => handleCatScroll('left')}
                        className="flex-shrink-0 transition-opacity hover:opacity-70"
                        style={{
                          marginRight: '8px',
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'transparent',
                          border: 'none',
                          padding: 0,
                          zIndex: 50,
                          opacity: showCatLeft ? 1 : 0,
                          pointerEvents: showCatLeft ? 'auto' : 'none'
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="#1E69DA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15 18l-6-6 6-6" />
                        </svg>
                      </button>

                      <div
                        ref={categoryScrollRef}
                        onScroll={checkCatScroll}
                        className="flex-1 flex items-center gap-3 overflow-x-auto hide-scrollbar py-1"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', scrollBehavior: 'smooth', minWidth: 0 }}
                      >
                        {allCategories.map((cat, idx) => (
                          <div
                            key={cat.startIndex}
                            onClick={() => {
                              setCurrentQues(cat.startIndex);
                              setActiveCategory(cat.name);
                            }}
                            className={`flex items-center gap-2 font-bold text-[14px] cursor-pointer transition-all whitespace-nowrap border-[1.5px] select-none flex-shrink-0 ${currentCatName === cat.name ? 'bg-[#f0f5ff] text-[#1E69DA] border-[#1E69DA]' : 'bg-white text-gray-600 border-[#e2e8f0] hover:border-gray-300 hover:bg-gray-50'}`}
                            style={{ padding: '8px 24px', borderRadius: '30px' }}
                          >
                            <span>{cat.name}</span>
                            <span className={`text-[13px] opacity-80 ${currentCatName === cat.name ? 'text-[#1E69DA]' : 'text-gray-500'}`}>
                              {cat.total} Qs
                            </span>
                          </div>
                        ))}
                      </div>

                      {showCatRight && (
                        <button
                          onClick={() => handleCatScroll('right')}
                          className="flex-shrink-0 transition-opacity hover:opacity-70"
                          style={{
                            marginLeft: '8px',
                            marginRight: '4px',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'transparent',
                            border: 'none',
                            padding: 0,
                            zIndex: 50
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="#1E69DA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 18l6-6-6-6" />
                          </svg>
                        </button>
                      )}
                    </div>
                  )
                })()}                <div className={testStyles.topbarRight} style={{ width: '234px', justifyContent: 'flex-end' }}>
                  <div className={testStyles.scoreInfo}>
                    <div className={testStyles.scoreLbl}>Duration</div>
                    <div className={testStyles.scoreVal}>
                      {hours ? String(hours).padStart(2, "0") : "00"} : {minutes ? String(minutes).padStart(2, "0") : "00"} : {seconds ? String(seconds).padStart(2, "0") : "00"}
                    </div>
                  </div>
                  <button className={testStyles.submitBtn} style={{ marginLeft: '20px' }} onClick={() => setOpen(true)}>
                    <i className="ti ti-send" style={{ fontSize: "13px" }}></i> Submit
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
                        <div className={`${testStyles.sectionName} font-bold text-[22px]`}><i className="ti ti-folder"></i> {currentCatName}</div>
                        <div className={`${testStyles.qCounter} font-bold`}>—&nbsp; Question <span>{currentQues + 1}</span> of {testData?.questions?.length}</div>
                        <div className={`${testStyles.qTypeBadge} font-bold border-[1.5px] border-[#cbd5e1] rounded-md px-2 py-0.5`}><i className="ti ti-list-check" style={{ fontSize: "12px" }}></i> {qType}</div>
                      </div>
                    )
                  })()}

                  <div className={testStyles.qScroll}>
                    {/* The original QuestionUI goes here */}
                    {testData?.questions?.length && (() => {
                      const currentQuestion = testData?.questions?.[currentQues];
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
                          answers={currentQuestion ? responses[currentQuestion._id] : undefined}
                          questionData={currentQuestion}
                          currentIndex={currentQues}
                          displayNumber={displayNumber}
                          categoryName={currentCatName}
                          totalInCategory={totalInCategory}
                          clearRespFun={clearRespFun}
                          flagCheck={flagCheck}
                          isFlagged={flagCheck?.some(f => f.id === currentQuestion?._id && f.flag?.length > 0)}
                        />
                      );
                    })()}
                  </div>

                  {/* Action Bar */}
                  <div className={testStyles.actionBar}>
                    <div className={testStyles.actionLeft}>
                      <button className={`${testStyles.actBtn} ${testStyles.actBtnReview}`} onClick={() => {
                        const qid = testData?.questions[currentQues]?._id;
                        if (flagCheck?.some(f => f.id === qid && f.flag?.length > 0)) {
                          message.warning("Please clear the flag first before marking for review.");
                          return;
                        }
                        const isMarked = questionsAddedMark?.includes(qid);
                        if (isMarked) {
                          message.success("Mark for review removed.");
                        } else {
                          message.success("Question marked for review.");
                        }
                        dispatch(mark_for_review({ questionId: qid }));
                      }}>
                        <i className="ti ti-bookmark" style={{ fontSize: "14px" }}></i> Mark for Review
                      </button>
                      <button className={`${testStyles.actBtn} ${testStyles.actBtnClear}`} onClick={clearRespFun}>
                        <i className="ti ti-eraser" style={{ fontSize: "14px" }}></i> Clear Response
                      </button>
                    </div>
                    <div className={testStyles.actionRight}>
                      <button className={`${testStyles.actBtn} ${testStyles.actBtnFlag}`} onClick={() => {
                        const qid = testData?.questions[currentQues]?._id;

                        if (questionsAddedMark?.includes(qid)) {
                          message.warning("Please clear the mark for review first before flagging.");
                          return;
                        }

                        const existing = flagCheck?.find(e => e.id === qid);
                        setTempFlagSelection(existing ? [...existing.flag] : []);
                        setIsFlaggedOn(true);
                        setOpenFlag(true);
                      }}>
                        <i className="ti ti-flag" style={{ fontSize: "14px" }}></i> Flag Question
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
                          <i className="ti ti-chevron-left" style={{ fontSize: "14px" }}></i> Previous
                        </button>
                      ) : null}

                      {(() => {
                        const qId = testData?.questions[currentQues]?._id;
                        const hasAnswer = (Object.keys(responses?.value || {}).includes(qId) && responses?.value[qId]?.answers?.length > 0) || testData?.questions[currentQues]?.status === "answered";
                        const isLast = currentQues === (testData?.questions?.length || 0) - 1;
                        const isLastInCategory = testData?.questions[currentQues]?.questionCategory?.[0]?.name !== testData?.questions[currentQues + 1]?.questionCategory?.[0]?.name;
                        const isCurrentlyFlagged = flagCheck?.some(f => f.id === qId && f.flag?.length > 0);
                        const isCurrentlyMarked = questionsAddedMark?.includes(qId);
                        const btnLabel = isLast ? "Finish" : (hasAnswer || isLastInCategory || isCurrentlyFlagged || isCurrentlyMarked) ? "Next" : "Skip";
                        return (
                          <button className={`${testStyles.actBtn} ${testStyles.actBtnNext} ${!hasAnswer && !isLast ? testStyles.actBtnSkip : ''}`} onClick={handleSaveQuestion}>
                            {btnLabel} <i className="ti ti-chevron-right" style={{ fontSize: "14px" }}></i>
                          </button>
                        );
                      })()}
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
                        <div className={testStyles.timerVal} style={{ color: (hours * 3600 + minutes * 60 + seconds) < 300 ? '#c62828' : (hours * 3600 + minutes * 60 + seconds) < 600 ? '#e65100' : '#0d47a1' }}>
                          {minutes ? String(minutes).padStart(2, "0") : "00"}:{seconds ? String(seconds).padStart(2, "0") : "00"}
                        </div>
                        <div className={testStyles.timerLbl}>Remaining</div>
                      </div>
                    </div>
                  </div>

                  {/* Webcam */}
                  <div className={testStyles.webcamBox}>
                    <video ref={videoFaceRef} autoPlay={true} muted={true} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px', transform: 'scaleX(-1)' }} />
                    <div className={testStyles.recBadge}><div className={testStyles.recDot}></div> REC</div>
                  </div>

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
                        <div className={testStyles.qgridLabel}>Question Navigator</div>
                        <div className={testStyles.qgrid}>
                          {filteredQuestions?.map((e, localIndex) => {
                            const ind = e.globalIndex;
                            let cName = testStyles.qnumBtn;

                            let statusBase = "";
                            const isAnswered = e.status === "answered" || (Object.keys(responses?.value || {}).includes(e._id) && responses?.value[e._id]?.answers?.length > 0);
                            const isFlagged = flagCheck?.find((f) => f.id == e._id && f.flag.length > 0);

                            const isSkipped = responses?.value?.[e._id]?.answers !== undefined && responses?.value?.[e._id]?.answers?.length === 0;

                            if (isFlagged) {
                              statusBase = "flagged";
                            } else if (questionsAddedMark?.includes(e._id) && isAnswered) {
                              statusBase = "markedAnswered";
                            } else if (questionsAddedMark?.includes(e._id)) {
                              statusBase = "marked";
                            } else if (isAnswered) {
                              statusBase = "answered";
                            } else if (isSkipped) {
                              statusBase = "skipped";
                            } else if (e.status === "not answered") {
                              statusBase = "notAnswered";
                            }

                            if (statusBase) {
                              if (ind === currentQues) {
                                cName += ` ${testStyles[statusBase + '_current'] || testStyles.current}`;
                              } else {
                                cName += ` ${testStyles[statusBase]}`;
                              }
                            } else if (ind === currentQues) {
                              cName += ` ${testStyles.current}`;
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

                  {/* Status Legend */}
                  {(() => {
                    const questions = testData?.questions || [];
                    const responseKeys = Object.keys(responses?.value || {});
                    const markedIds = questionsAddedMark || [];

                    let answeredCount = 0;
                    let notAnsweredCount = 0;
                    let markedCount = 0;
                    let markedAndAnsweredCount = 0;
                    let skippedCount = 0;
                    let flaggedCount = 0;

                    questions.forEach((q) => {
                      const hasResponse = responseKeys.includes(q._id) && responses?.value[q._id]?.answers?.length > 0;
                      const isMarked = markedIds.includes(q._id);
                      const isFlagged = flagCheck?.some(f => f.id === q._id && f.flag?.length > 0);

                      if (isFlagged) flaggedCount++;
                      else if (isMarked && hasResponse) markedAndAnsweredCount++;
                      else if (isMarked) markedCount++;
                      else if (q.status === "answered" || hasResponse) answeredCount++;
                      else if (q.status === "not answered") notAnsweredCount++;
                      else skippedCount++;
                    });

                    return (
                      <div className={`${testStyles.statusLegend} ${testStyles.rpSection}`}>
                        <div className={testStyles.legendTitle}>Question Status</div>
                        <div className={testStyles.legendGrid}>
                          <div className={testStyles.legendItem}>
                            <div className={`${testStyles.legendDot} ${testStyles.answered}`}>{answeredCount}</div> Answered
                          </div>
                          <div className={testStyles.legendItem}>
                            <div className={`${testStyles.legendDot} ${testStyles.notAnswered}`}>{notAnsweredCount}</div> Not Answered
                          </div>
                          <div className={testStyles.legendItem}>
                            <div className={`${testStyles.legendDot} ${testStyles.marked}`}>{markedCount}</div> Marked
                          </div>
                          <div className={testStyles.legendItem}>
                            <div className={`${testStyles.legendDot} ${testStyles.markedAnswered}`}>{markedAndAnsweredCount}</div> Marked & Answered
                          </div>
                          <div className={testStyles.legendItem}>
                            <div className={`${testStyles.legendDot} ${testStyles.skipped}`}>{skippedCount}</div> Skipped
                          </div>
                          <div className={testStyles.legendItem}>
                            <div className={`${testStyles.legendDot} ${testStyles.flagged}`}>{flaggedCount}</div> Flagged
                          </div>
                        </div>
                      </div>
                    )
                  })()}

                </div>
              </div>



              {/* ALL YOUR EXISTING MODALS */}
              <>
                {(open || openTime) && (() => {
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
                        <div className={testStyles.modalIcon}><i className={openTime ? "ti ti-clock" : "ti ti-alert-triangle"}></i></div>
                        <div className={testStyles.modalTitle}>{openTime ? "Time is Up!" : "Are you sure you want to end this test?"}</div>
                        <div className={testStyles.modalSub}>
                          You still have <strong>{testData?.questions?.length - Object.keys(responses?.value || {}).length}</strong> unanswered question(s).
                          Once submitted, you cannot change your answers. This action cannot be undone.
                        </div>
                        <div className={testStyles.modalStatsRow}>
                          <div className={testStyles.modalStat} style={{ background: 'var(--green-bg)', color: 'var(--green-txt)' }}>
                            <div className={testStyles.statNum}>{answeredCount}</div>
                            <div className={testStyles.statLbl}>Answered</div>
                          </div>
                          <div className={testStyles.modalStat} style={{ background: 'var(--red-bg)', color: 'var(--red-txt)' }}>
                            <div className={testStyles.statNum}>{notAnsweredCount + unattemptedCount}</div>
                            <div className={testStyles.statLbl}>Unanswered</div>
                          </div>
                          <div className={testStyles.modalStat} style={{ background: 'var(--orange-bg)', color: 'var(--orange)' }}>
                            <div className={testStyles.statNum}>{markedCount + markedAndAnsweredCount}</div>
                            <div className={testStyles.statLbl}>Marked</div>
                          </div>
                        </div>
                        <div className={testStyles.modalBtns}>
                          {!openTime && (
                            <button type="button" className={testStyles.modalCancel} onClick={handleCancel}>
                              <i className="ti ti-x" style={{ fontSize: "13px", marginRight: "4px" }}></i> No, Go Back
                            </button>
                          )}
                          <button type="button" className={testStyles.modalConfirm} onClick={submitTest}>
                            <i className="ti ti-check" style={{ fontSize: "13px", marginRight: "4px" }}></i> {openTime ? "Submit Answers" : "Yes, End Test"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}
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
                    <div className="flex flex-col gap-4 py-2 px-2">
                      {flaggedArr?.map((flagopt, i) => {
                        const isSelected = tempFlagSelection?.includes(flagopt);
                        return (
                          <div
                            key={i}
                            onClick={() => {
                              if (isSelected) {
                                setTempFlagSelection(tempFlagSelection.filter(f => f !== flagopt));
                              } else {
                                setTempFlagSelection([...tempFlagSelection, flagopt]);
                              }
                            }}
                            className={`flex items-center gap-3 cursor-pointer transition-colors select-none ${isSelected ? 'text-[#7b1fa2] font-bold' : 'text-gray-600 hover:text-[#7b1fa2]'}`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              readOnly
                              className="w-[18px] h-[18px] rounded-[4px] border-2 border-gray-300 accent-[#7b1fa2] cursor-pointer"
                            />
                            <span className="text-[15px]">{flagopt}</span>
                          </div>
                        );
                      })}

                      <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
                        <button
                          className="font-bold text-[14px] cursor-pointer transition-all border-[1.5px] select-none text-white bg-[#7b1fa2] hover:bg-[#6a1b9a] border-[#7b1fa2]"
                          style={{ padding: '8px 24px', borderRadius: '30px' }}
                          onClick={() => {
                            const qid = testData?.questions[currentQues]?._id;
                            let newFlags = [...flagCheck];

                            if (tempFlagSelection.length === 0) {
                              newFlags = newFlags.filter(e => e.id !== qid);
                            } else {
                              const index = newFlags.findIndex(e => e.id === qid);
                              if (index !== -1) {
                                newFlags[index].flag = tempFlagSelection;
                              } else {
                                newFlags.push({ id: qid, flag: tempFlagSelection });
                              }
                            }

                            setFlagCheck(newFlags);
                            setSstorage("flagged", JSON.stringify(newFlags));

                            setIsFlaggedOn(false);
                            setOpenFlag(false);
                            message.success(<strong>Question flagged successfully</strong>);
                          }}
                        >
                          Submit Flag
                        </button>
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
