"use client";
import React, { useState, useEffect } from "react";
import { Button, Radio, Typography, Divider, Modal, Space, Checkbox, Spin, Avatar, Select, Dropdown } from "antd";
import { ClockCircleOutlined, LeftOutlined, RightOutlined, ExclamationCircleOutlined, CodeOutlined, SendOutlined, BookOutlined, DeleteOutlined, FlagOutlined, UpOutlined, InfoCircleOutlined, AimOutlined, PlayCircleOutlined, DownOutlined, CheckOutlined, CheckCircleOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import Editor from "@monaco-editor/react";
import { useRouter, useParams } from "next/navigation";
import { useSelector } from "react-redux";
import * as ReactResizablePanels from "react-resizable-panels";

const PanelGroup = ReactResizablePanels?.PanelGroup || ReactResizablePanels?.Group || ReactResizablePanels?.default?.Group || ReactResizablePanels?.default?.PanelGroup || ReactResizablePanels;
const Panel = ReactResizablePanels?.Panel || ReactResizablePanels?.default?.Panel || ReactResizablePanels;
const PanelResizeHandle = ReactResizablePanels?.PanelResizeHandle || ReactResizablePanels?.Separator || ReactResizablePanels?.default?.Separator || ReactResizablePanels?.default?.PanelResizeHandle || ReactResizablePanels;

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
import { useDispatch } from "react-redux";
import { fetchPracQuestions } from "@/redux/slices/practiceSlice";
import { fetchCompanyTests } from "@/redux/slices/admin/cms/practiceSlice";
import { restUrl } from "@/config/urls";

export default function StudentMockTestPage() {
  const router = useRouter();
  const { id } = useParams();
  const dispatch = useDispatch();
  const [modal, contextHolder] = Modal.useModal();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [activeSection, setActiveSection] = useState("");
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [visited, setVisited] = useState({ 0: true });
  const [editorLanguages, setEditorLanguages] = useState({});
  const [codeValues, setCodeValues] = useState({});
  const [timeLeft, setTimeLeft] = useState(3600);
  const [activeBottomTab, setActiveBottomTab] = useState("testcase"); // "testcase" | "result"
  const [activeTestCaseIdx, setActiveTestCaseIdx] = useState(0);
  const [isCompiling, setIsCompiling] = useState(false);
  const [executionResults, setExecutionResults] = useState({}); // { [questionIdx]: resultData }
  
  const [showResultView, setShowResultView] = useState(false);
  const [currentAttempt, setCurrentAttempt] = useState(null);
  const [selectedSectionFilter, setSelectedSectionFilter] = useState("All");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showSubmitSuccess, setShowSubmitSuccess] = useState(false);
  const [pendingAttempt, setPendingAttempt] = useState(null);
  
  const [showIncompleteWarning, setShowIncompleteWarning] = useState(false);
  const [showNoResultPopup, setShowNoResultPopup] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationRank, setCelebrationRank] = useState(null); // 1, 2, or 3

  const handleEndTestWithoutResult = () => {
    sessionStorage.removeItem(`active_test_${id}`);
    setShowIncompleteWarning(false);
    setShowNoResultPopup(true);
  };

  const languageGroups = [
    [
      { label: 'C++', value: 'cpp' },
      { label: 'Java', value: 'java' },
      { label: 'Python3', value: 'python3' },
      { label: 'Python', value: 'python' },
      { label: 'JavaScript', value: 'javascript' },
      { label: 'TypeScript', value: 'typescript' },
      { label: 'C#', value: 'csharp' },
      { label: 'C', value: 'c' }
    ],
    [
      { label: 'Go', value: 'go' },
      { label: 'Kotlin', value: 'kotlin' },
      { label: 'Swift', value: 'swift' },
      { label: 'Rust', value: 'rust' },
      { label: 'Ruby', value: 'ruby' },
      { label: 'PHP', value: 'php' },
      { label: 'Dart', value: 'dart' },
      { label: 'Scala', value: 'scala' }
    ],
    [
      { label: 'Elixir', value: 'elixir' },
      { label: 'Erlang', value: 'erlang' },
      { label: 'Racket', value: 'racket' }
    ]
  ];

  const BOILERPLATES = {
    javascript: "function main() {\n  // Write your code here\n  // You can read from standard input and write to standard output\n}\n\nmain();",
    python: "import sys\n\ndef main():\n    # Write your code here\n    # Read from sys.stdin and write to sys.stdout\n    pass\n\nif __name__ == '__main__':\n    main()",
    java: "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Write your code here\n        // Read from System.in and write to System.out\n    }\n}",
    cpp: "#include <iostream>\n\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}",
    c: "#include <stdio.h>\n\nint main() {\n    // Write your code here\n    return 0;\n}"
  };

  const [canSubmitHidden, setCanSubmitHidden] = useState({}); // Tracks if public cases passed

  const { companyTests = [] } = useSelector((state) => state.adminPractice);
  const companyTest = companyTests.find(t => t._id === id);
  const testTitle = companyTest ? companyTest.companyName || companyTest.title : "Mock";

  const studentCreds = useSelector((state) => state.student.student?.data);

  useEffect(() => {
    if (companyTests.length === 0) {
      dispatch(fetchCompanyTests());
    }
  }, [companyTests.length, dispatch]);

  useEffect(() => {
    if (id) {
      // Check if we have an active session for this test in sessionStorage
      const sessionKey = `active_test_${id}`;
      const cachedSessionStr = sessionStorage.getItem(sessionKey);

      if (cachedSessionStr) {
        try {
          const parsed = JSON.parse(cachedSessionStr);
          if (parsed.questions && parsed.questions.length > 0) {
            setQuestions(parsed.questions);
            setAnswers(parsed.answers || {});
            setVisited(parsed.visited || {});
            setMarkedForReview(parsed.markedForReview || {});
            if (parsed.currentIdx !== undefined) setCurrentIdx(parsed.currentIdx);
            if (parsed.activeSection) setActiveSection(parsed.activeSection);
            else setActiveSection(parsed.questions[0].section);

            if (parsed.codeValues) setCodeValues(parsed.codeValues);
            if (parsed.editorLanguages) setEditorLanguages(parsed.editorLanguages);
            if (parsed.canSubmitHidden) setCanSubmitHidden(parsed.canSubmitHidden);
            if (parsed.executionResults) setExecutionResults(parsed.executionResults);
            if (parsed.timeLeft !== undefined) setTimeLeft(parsed.timeLeft);

            setLoading(false);
            return; // Skip fetching new questions
          }
        } catch (e) { }
      }

      setLoading(true);
      dispatch(fetchPracQuestions({ refId: id, type: "subjectId", userId: studentCreds?._id, limit: 500 }))
        .then((res) => {
          const apiResponse = res.payload?.data || {};
          const fetchedData = apiResponse.questionsData || [];
          const actualArray = Array.isArray(fetchedData) ? fetchedData : [];

          // Map backend structure to UI structure
          const mappedQuestions = actualArray.map((q, idx) => {
            const qType = q.questionType?.toLowerCase() || "";
            let mappedType = "Single Choice";
            if (qType.includes("coding")) mappedType = "Coding";
            else if (qType.includes("multiple")) mappedType = "Multiple Choice";
            else if (qType.includes("true")) mappedType = "True/False";

            const content = q.questionContent || {};

            const options = [];
            if (content["option 1"]) options.push(content["option 1"]);
            if (content["option 2"]) options.push(content["option 2"]);
            if (content["option 3"]) options.push(content["option 3"]);
            if (content["option 4"]) options.push(content["option 4"]);
            
            // Shuffle options
            for (let i = options.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [options[i], options[j]] = [options[j], options[i]];
            }

            let desc = "";
            let questionText = content.question || q.questionText || "Question text not provided";

            let constraintsData = "";
            let sampleIn = "";
            let sampleOut = "";

            if (mappedType === "Coding") {
              desc = q.problemStatement || content.problemStatement || questionText || "";
              constraintsData = q.constraints || content.constraints || "";
              sampleIn = q.sampleInput || content.sampleInput || "";
              sampleOut = q.sampleOutput || content.sampleOutput || "";
              if (!questionText || questionText === "Question text not provided") {
                questionText = desc;
              }
            }

            let rawSection = q.sectionName || q.subjectName || "General";
            let mainCategory = rawSection.split(" - ")[0].trim();

            let extractedCorrectAnswer = "";
            let rawAnswer = content.correctAnswer || content.answer || q.correctAnswer || q.answer;
            if (rawAnswer) {
              if (typeof rawAnswer === 'object' && !Array.isArray(rawAnswer)) {
                if (rawAnswer.singleChoice) {
                  const selectedKey = Object.keys(rawAnswer.singleChoice).find(k => rawAnswer.singleChoice[k] === true);
                  extractedCorrectAnswer = selectedKey ? (content[selectedKey] || selectedKey) : "";
                } else if (rawAnswer.multipleChoice) {
                  extractedCorrectAnswer = Object.keys(rawAnswer.multipleChoice)
                    .filter(k => rawAnswer.multipleChoice[k] === true)
                    .map(k => content[k] || k);
                } else {
                  extractedCorrectAnswer = JSON.stringify(rawAnswer);
                }
              } else {
                extractedCorrectAnswer = rawAnswer;
              }
            }

            return {
              id: q._id || `q${idx}`,
              type: mappedType,
              question: questionText,
              options: options,
              section: mainCategory,
              description: content.description || desc,
              constraints: constraintsData,
              sampleInput: sampleIn,
              sampleOutput: sampleOut,
              testCases: content.testCases || [],
              correctAnswer: extractedCorrectAnswer,
              explanation: content.explanation || q.explanation || "",
              raw: q
            };
          });

          const sectionMap = {};
          mappedQuestions.forEach(q => {
            if (!sectionMap[q.section]) sectionMap[q.section] = [];
            sectionMap[q.section].push(q);
          });

          const groupedQuestions = [];

          const allSections = Object.keys(sectionMap);
          const nonCodingSections = allSections.filter(s => s.toLowerCase() !== "coding");
          const codingSections = allSections.filter(s => s.toLowerCase() === "coding");

          [...nonCodingSections, ...codingSections].forEach(sec => {
            sectionMap[sec].forEach((q, i) => {
              q.categoryDisplayIdx = i + 1;
            });
            groupedQuestions.push(...sectionMap[sec]);
          });

          setQuestions(groupedQuestions);
          if (groupedQuestions.length > 0) {
            setActiveSection(groupedQuestions[0].section);
          }

          const initialActiveSection = groupedQuestions.length > 0 ? groupedQuestions[0].section : "";
          const calculatedTimeLeft = companyTest?.timeLimit ? companyTest.timeLimit * 60 : 7200;
          setTimeLeft(calculatedTimeLeft);
          
          sessionStorage.setItem(`active_test_${id}`, JSON.stringify({
            questions: groupedQuestions,
            answers: {},
            visited: { 0: true },
            markedForReview: {},
            currentIdx: 0,
            activeSection: initialActiveSection,
            codeValues: {},
            editorLanguages: {},
            canSubmitHidden: {},
            executionResults: {}
          }));
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id, dispatch, companyTests.length]);

  useEffect(() => {
    if (questions.length > 0) {
      sessionStorage.setItem(`active_test_${id}`, JSON.stringify({
        questions,
        answers,
        visited,
        markedForReview,
        currentIdx,
        activeSection,
        codeValues,
        editorLanguages,
        canSubmitHidden,
        executionResults,
        timeLeft
      }));
    }
  }, [questions, answers, visited, markedForReview, currentIdx, activeSection, codeValues, editorLanguages, canSubmitHidden, executionResults, timeLeft, id]);

  const sections = Array.from(new Set(questions.map(q => q.section)));

  useEffect(() => {
    if (questions[currentIdx] && questions[currentIdx].section !== activeSection) {
      setActiveSection(questions[currentIdx].section);
    }
  }, [currentIdx, questions, activeSection]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    if (companyTest && companyTest.timeLimit) {
      const sessionKey = `active_test_${id}`;
      const cachedSessionStr = sessionStorage.getItem(sessionKey);
      if (cachedSessionStr) {
        try {
          const parsed = JSON.parse(cachedSessionStr);
          if (parsed.timeLeft !== undefined) {
             return; // Let the state restore handle it
          }
        } catch (e) {}
      }
      setTimeLeft(companyTest.timeLimit * 60);
    }
  }, [companyTest, id]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleNavigate = (idx) => {
    setVisited(prev => ({ ...prev, [idx]: true }));
    setCurrentIdx(idx);
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      handleNavigate(currentIdx + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIdx > 0) {
      handleNavigate(currentIdx - 1);
    }
  };

  const toggleMarkForReview = () => {
    setMarkedForReview(prev => ({
      ...prev,
      [currentIdx]: !prev[currentIdx]
    }));
  };

  const handleClear = () => {
    setAnswers(prev => {
      const copy = { ...prev };
      delete copy[currentIdx];
      return copy;
    });
  };

  const handleSubmit = () => {
    let allAttempted = true;
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (q.type === "Coding") continue;
      
      const ans = answers[i];
      if (q.type === "Multiple Choice") {
        if (!ans || !Array.isArray(ans) || ans.length === 0) allAttempted = false;
      } else {
        if (ans === undefined || ans === null || String(ans).trim() === "") allAttempted = false;
      }
    }
    
    if (!allAttempted) {
      setShowIncompleteWarning(true);
    } else {
      setShowSubmitConfirm(true);
    }
  };

  const handleFinalSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    // Generate Result Payload
    const nonCodingQuestions = questions.filter(q => q.type !== "Coding");
    const qaPairs = nonCodingQuestions.map(q => {
      const originalIdx = questions.indexOf(q);
      const studentAnswer = q.type === "Multiple Choice" ? (answers[originalIdx] || []).join(', ') : answers[originalIdx];
      const actualAnsStr = Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer;
      
      let isCorrect = false;
      if (q.type === "Multiple Choice") {
         const sAnsArr = [...(answers[originalIdx] || [])].sort();
         const aAnsArr = (Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer]).sort();
         isCorrect = JSON.stringify(sAnsArr) === JSON.stringify(aAnsArr);
      } else {
         isCorrect = studentAnswer === actualAnsStr;
      }

      return {
        question: typeof q.question === 'string' ? q.question : (q.question?.text || JSON.stringify(q.question)),
        studentAnswer,
        actualAnswer: actualAnsStr,
        isCorrect,
        explanation: typeof q.explanation === 'string' ? q.explanation : (q.explanation?.explanation || JSON.stringify(q.explanation)),
        options: q.options || (q.content && q.content.options) || [],
        section: q.section || "General"
      };
    });

    const userInfo = JSON.parse(sessionStorage.getItem('current_mock_user') || '{"name":"Guest","email":"guest@example.com"}');
    
    const attempt = {
      id: "atmpt_" + Date.now(),
      timestamp: Date.now(),
      user: userInfo,
      qaPairs
    };

    let maxPossibleScore = 0;
    let earnedScore = 0;
    
    attempt.qaPairs.forEach((qa, i) => {
      const originalQ = nonCodingQuestions[i];
      // Use dynamic score from DB if available, default to 1
      const qScore = Number(originalQ.raw?.questionScore) || 1;
      maxPossibleScore += qScore;
      
      if (qa.isCorrect) {
        earnedScore += qScore;
      }
    });

    // Score is calculated as a percentage based on dynamic weights
    const newScorePercentage = maxPossibleScore > 0 ? Math.round((earnedScore / maxPossibleScore) * 100) : 0;
    attempt.score = newScorePercentage;
    attempt.earnedMarks = earnedScore;
    attempt.maxMarks = maxPossibleScore;

    let finalTop3 = [];
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token") || "";
      const res = await fetch(`${restUrl}/student/practice/top-scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ testId: id, attempt })
      });
      const data = await res.json();
      if (data && data.data) {
        finalTop3 = data.data;
        // Check if new attempt is in top 3
        const rank = finalTop3.findIndex(a => a.id === attempt.id);
        if (rank !== -1) {
          setCelebrationRank(rank + 1);
          setShowCelebration(true);
        }
      }
    } catch (e) {
      console.error("Error saving top score", e);
    }

    sessionStorage.removeItem(`active_test_${id}`);
    
    setPendingAttempt(attempt);
    setShowSubmitConfirm(false);
    setShowIncompleteWarning(false);
    setShowSubmitSuccess(true);
    setIsSubmitting(false);
  };

  const handleReportQuestion = () => {
    modal.success({
      title: 'Question Reported',
      content: 'This question has been successfully reported. The admin will check it out.',
      okText: 'Close',
      okButtonProps: { className: 'bg-blue-600' }
    });
  };

  const handleRunCode = async (isSubmit = false) => {
    if (!currentQ.testCases || currentQ.testCases.length === 0) {
      Modal.error({ title: "No Test Cases", content: "This question doesn't have any test cases to run." });
      return;
    }
    
    setIsCompiling(true);
    setActiveBottomTab("result");
    
    const code = codeValues[currentIdx] !== undefined ? codeValues[currentIdx] : (BOILERPLATES[editorLanguages[currentIdx] || "javascript"] || "");
    const language = editorLanguages[currentIdx] || "javascript";
    
    let testCasesToRun = isSubmit ? currentQ.testCases : currentQ.testCases.filter(tc => !tc.isHidden);
    
    if (testCasesToRun.length === 0 && currentQ.sampleInput && currentQ.sampleOutput) {
      testCasesToRun = [{ input: currentQ.sampleInput, output: currentQ.sampleOutput, expectedOutput: currentQ.sampleOutput, isHidden: false }];
    }

    if (testCasesToRun.length === 0) {
      setIsCompiling(false);
      Modal.error({ title: "No Test Cases", content: "This question doesn't have any test cases to run." });
      return;
    }

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_REST_URL}/compiler/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          code,
          language,
          testCases: testCasesToRun
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setExecutionResults(prev => ({
          ...prev,
          [currentIdx]: { ...data, isSubmit }
        }));
        
        const firstFailIdx = data.cases.findIndex(c => !c.passed);
        setActiveTestCaseIdx(firstFailIdx >= 0 ? firstFailIdx : 0);

        if (isSubmit) {
          if (data.status === 'Accepted') {
            Modal.success({
              title: "Success!",
              content: "All hidden test cases passed. Moving to next question...",
              onOk: () => {
                if (currentIdx < questions.length - 1) {
                  setCurrentIdx(prev => prev + 1);
                }
              }
            });
          }
        } else {
          if (data.status === 'Accepted') {
            setCanSubmitHidden(prev => ({ ...prev, [currentIdx]: true }));
          }
        }
      } else {
        Modal.error({ title: "Execution Error", content: data.err || "Failed to execute code." });
      }
    } catch (err) {
      console.error(err);
      Modal.error({ title: "Network Error", content: "Failed to connect to the compiler service." });
    } finally {
      setIsCompiling(false);
    }
  };

  const currentQ = questions[currentIdx] || {};
  const currentQDisplayIdx = questions.filter(q => q.section === currentQ.section).findIndex(q => q === currentQ) + 1;

  const renderSidebar = (isCoding) => (
    <div className={isCoding ? "flex flex-col h-full bg-white" : "w-[340px] bg-white border-l border-gray-100 flex flex-col shrink-0 overflow-hidden z-10"}>
      <div className="flex-[2] overflow-y-auto p-6 pb-4 border-b border-gray-100 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Title level={5} className="!mb-0 !font-bold !text-slate-800">Category Selection</Title>
          <UpOutlined className="text-gray-400 cursor-pointer hover:text-gray-600" />
        </div>
        <div className="flex flex-wrap gap-3">
          {sections.map(section => (
            <button
              key={section}
              onClick={() => {
                setActiveSection(section);
                const firstQuestionIdx = questions.findIndex(q => q.section === section);
                if (firstQuestionIdx !== -1) {
                  handleNavigate(firstQuestionIdx);
                }
              }}
              className={`px-5 py-2.5 rounded-lg text-[13px] font-bold transition-all border flex-1 text-center min-w-[45%] ${activeSection === section
                  ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                  : 'bg-white text-slate-600 border-gray-200 hover:border-blue-200 hover:bg-blue-50'
                }`}
            >
              {section}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-[3] overflow-y-auto p-6 flex flex-col gap-5">
        <Title level={5} className="!mb-0 !font-bold !text-slate-800">Question Navigator</Title>
        <div className="grid grid-cols-5 gap-4 content-start">
          {questions.filter(q => q.section === activeSection).map((q, localIdx) => {
            const idx = questions.indexOf(q);
            let styleClass = "border border-gray-200 bg-white text-gray-700";
            if (currentIdx === idx) {
              styleClass = "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200/50";
            } else if (markedForReview[idx]) {
              styleClass = "bg-purple-500 text-white border-purple-500";
            } else if (answers[idx] || codeValues[idx]) {
              styleClass = "bg-green-500 text-white border-green-500";
            } else if (visited[idx]) {
              styleClass = "bg-red-500 text-white border-red-500";
            }
            return (
              <button
                key={idx}
                onClick={() => handleNavigate(idx)}
                className={`h-11 rounded-lg font-bold text-[13px] flex items-center justify-center transition-all hover:-translate-y-0.5 ${styleClass}`}
              >
                {localIdx + 1}
              </button>
            );
          })}
        </div>
      </div>
      <div className="p-6 border-t border-gray-100 bg-white flex flex-col gap-3 text-[13px] font-medium text-slate-600 shrink-0">
        <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-full bg-green-500"></div> Answered</div>
        <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-full bg-red-500"></div> Not Answered</div>
        <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-full bg-gray-300"></div> Not Visited</div>
        <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-full bg-purple-500"></div> Marked for Review</div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Spin size="large" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50 gap-4">
        <Title level={4}>No questions found for this test.</Title>
        <Button type="primary" onClick={() => router.push('/student/practice-new/company-wise')}>Go Back</Button>
      </div>
    );
  }

  if (showResultView && currentAttempt) {
    const totalQuestions = currentAttempt.qaPairs.length;
    const correctCount = currentAttempt.qaPairs.filter(qa => qa.isCorrect).length;

    const sectionStats = currentAttempt.qaPairs.reduce((acc, qa) => {
      const sectionName = qa.section || "General";
      if (!acc[sectionName]) acc[sectionName] = { total: 0, correct: 0, wrong: 0, unanswered: 0, qaList: [] };
      
      acc[sectionName].total += 1;
      acc[sectionName].qaList.push(qa);
      
      const studentAnsText = typeof qa.studentAnswer === 'object' && qa.studentAnswer !== null ? JSON.stringify(qa.studentAnswer) : (qa.studentAnswer || "Not Answered");
      const isUnanswered = studentAnsText === "Not Answered" || !qa.studentAnswer;
      
      if (qa.isCorrect) acc[sectionName].correct += 1;
      else if (isUnanswered) acc[sectionName].unanswered += 1;
      else acc[sectionName].wrong += 1;
      
      return acc;
    }, {});

    const allSections = Object.keys(sectionStats);
    
    const overallStats = {
      total: currentAttempt.qaPairs.length,
      correct: allSections.reduce((sum, sec) => sum + sectionStats[sec].correct, 0),
      wrong: allSections.reduce((sum, sec) => sum + sectionStats[sec].wrong, 0),
      unanswered: allSections.reduce((sum, sec) => sum + sectionStats[sec].unanswered, 0),
      qaList: currentAttempt.qaPairs
    };

    const displayStats = selectedSectionFilter === "All" ? overallStats : sectionStats[selectedSectionFilter];

    return (
      <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-sans fixed inset-0 z-[2000]">
        {/* Unified Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex flex-col xl:flex-row xl:items-center justify-between gap-4 shadow-sm shrink-0 z-20 relative">
          {/* Left: Title & Back */}
          <div className="flex items-center gap-4 shrink-0">
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />} 
              onClick={() => router.push('/student/practice-new/company-wise')} 
              className="flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-full w-10 h-10 border-none shadow-inner shrink-0"
            />
            <div>
              <h1 className="text-xl font-black text-slate-800 m-0 tracking-tight flex items-center gap-2 border-none pb-0">
                {testTitle}
              </h1>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest m-0 mt-0.5 whitespace-nowrap">Submitted on {new Date(currentAttempt.timestamp).toLocaleString()}</p>
            </div>
          </div>
          
          {/* Center: Tabs & Category Stats */}
          <div className="flex flex-col xl:flex-row items-center gap-4 xl:gap-8 flex-1 justify-center px-4 w-full xl:w-auto">
            {/* Interactive Category Filter Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <Dropdown 
                menu={{ 
                  items: [
                    { key: "All", label: "All Sections" },
                    ...allSections.map(sec => ({ key: sec, label: sec }))
                  ], 
                  onClick: (e) => setSelectedSectionFilter(e.key) 
                }} 
                trigger={['hover']} 
                placement="bottom"
              >
                <button className="px-5 py-2 rounded-full font-bold text-[13px] bg-indigo-600 text-white flex items-center gap-2 shadow-sm transition-all hover:bg-indigo-700 cursor-pointer border-none outline-none whitespace-nowrap">
                  {selectedSectionFilter === "All" ? "All Sections" : selectedSectionFilter} <DownOutlined className="text-[10px]" />
                </button>
              </Dropdown>
            </div>

            <div className="hidden xl:block w-px h-8 bg-slate-200 shrink-0"></div>

            {/* Display Stats for selected category */}
            <div className="flex items-center gap-5 shrink-0">
              <div className="flex flex-col min-w-fit items-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 whitespace-nowrap">Total Questions</div>
                <div className="text-[20px] font-black text-slate-800 leading-none">{displayStats.total}</div>
              </div>
              <div className="w-px h-6 bg-slate-200 shrink-0"></div>
              <div className="flex flex-col min-w-fit items-center">
                <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-0.5 whitespace-nowrap">Correct Answers</div>
                <div className="text-[20px] font-black text-emerald-600 leading-none">{displayStats.correct}</div>
              </div>
              <div className="w-px h-6 bg-slate-200 shrink-0"></div>
              <div className="flex flex-col min-w-fit items-center">
                <div className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-0.5 whitespace-nowrap">Wrong Answers</div>
                <div className="text-[20px] font-black text-rose-600 leading-none">{displayStats.wrong}</div>
              </div>
              <div className="w-px h-6 bg-slate-200 shrink-0"></div>
              <div className="flex flex-col min-w-fit items-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 whitespace-nowrap">Unanswered</div>
                <div className="text-[20px] font-black text-slate-600 leading-none">{displayStats.unanswered}</div>
              </div>
            </div>
          </div>

          {/* Right: Candidate & Score */}
            <div className="flex items-center gap-6 shrink-0 justify-end xl:w-auto w-full">
              <div className="text-right hidden sm:block">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Candidate</div>
                <div className="text-[15px] font-bold text-slate-800">{currentAttempt.user?.name || "Student"}</div>
              </div>
            <div className="h-10 w-px bg-gray-200 hidden sm:block"></div>
            <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 px-5 py-2 rounded-xl shadow-inner">
              <div className="text-right">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Marks</div>
                <div className="text-2xl font-black text-slate-800 tracking-tight">{currentAttempt.earnedMarks ?? correctCount} <span className="text-sm text-slate-400 font-semibold">/ {currentAttempt.maxMarks ?? totalQuestions}</span></div>
              </div>
              <div className="h-8 w-px bg-slate-300"></div>
              <div className="text-right">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Score</div>
                <div className="text-2xl font-black text-blue-600 tracking-tight">{currentAttempt.score ?? 0}%</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-10 py-8 bg-[#EFF5FB]">
          <div className="max-w-[90rem] mx-auto flex flex-col gap-6 pb-20">
            {(() => {
                  return (
                    <>
                      {/* Section Questions */}
                      <div className="flex flex-col gap-8">
                        {displayStats.qaList.map((qa, qIdx) => {
                            let parsedActualAnswer = qa.actualAnswer;
                            if (typeof parsedActualAnswer === 'string' && parsedActualAnswer.startsWith('{')) {
                              try {
                                parsedActualAnswer = JSON.parse(parsedActualAnswer);
                              } catch (e) {}
                            }

                            let actualAnsText = typeof qa.actualAnswer === 'object' && qa.actualAnswer !== null ? JSON.stringify(qa.actualAnswer) : (qa.actualAnswer || "N/A");
                            let actualExplanation = qa.explanation;

                            if (typeof parsedActualAnswer === 'object' && parsedActualAnswer !== null) {
                              if (parsedActualAnswer.multipleChoice) {
                                 actualAnsText = Object.keys(parsedActualAnswer.multipleChoice).filter(k => parsedActualAnswer.multipleChoice[k]).join(", ");
                              } else if (parsedActualAnswer.singleChoice) {
                                 if (typeof parsedActualAnswer.singleChoice === 'object') {
                                    actualAnsText = Object.keys(parsedActualAnswer.singleChoice).filter(k => parsedActualAnswer.singleChoice[k]).join(", ");
                                 } else {
                                    actualAnsText = parsedActualAnswer.singleChoice;
                                 }
                              } else if (parsedActualAnswer.answer) {
                                 actualAnsText = parsedActualAnswer.answer;
                              }
                              if (typeof actualExplanation === 'string' && actualExplanation.trim() === '') actualExplanation = null;
                              if (!actualExplanation && parsedActualAnswer.explanation) {
                                 actualExplanation = parsedActualAnswer.explanation;
                              }
                            }

                            const studentAnsText = typeof qa.studentAnswer === 'object' && qa.studentAnswer !== null ? JSON.stringify(qa.studentAnswer) : (qa.studentAnswer || "Not Answered");
                            const isUnanswered = studentAnsText === "Not Answered" || !qa.studentAnswer;

                            return (
                            <div key={qIdx} className="relative flex flex-col gap-4 bg-white p-8 rounded-2xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                              <div className={`absolute top-0 left-0 w-1.5 h-full ${isUnanswered ? 'bg-slate-300' : qa.isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                              
                              <div className="flex items-start gap-6">
                                <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center font-bold text-lg shadow-sm ${isUnanswered ? 'bg-slate-100 text-slate-500 border border-slate-200' : qa.isCorrect ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 'bg-rose-100 text-rose-600 border border-rose-200'}`}>
                                  {qIdx + 1}
                                </div>
                                <div className="flex-1 w-full overflow-hidden">
                                  <div className="font-semibold text-lg text-slate-800 leading-relaxed mb-6 pt-1">
                                    <span dangerouslySetInnerHTML={{ __html: typeof qa.question === 'string' ? qa.question : (qa.question?.text || JSON.stringify(qa.question)) }} />
                                  </div>
                                  
                                  {(() => {
                                    let derivedOptions = qa.options || [];
                                    if (!derivedOptions || derivedOptions.length === 0) {
                                      if (qa.raw?.options && qa.raw.options.length > 0) derivedOptions = qa.raw.options;
                                      else if (qa.raw?.content?.options && qa.raw.content.options.length > 0) derivedOptions = qa.raw.content.options;
                                      else if (qa.question?.options && qa.question.options.length > 0) derivedOptions = qa.question.options;
                                      
                                      // One final fallback using the original questions array if this is a newly taken test viewing report immediately
                                      if (!derivedOptions || derivedOptions.length === 0) {
                                        const originalQ = questions.find(q => q.id === qa.id);
                                        if (originalQ && originalQ.options && originalQ.options.length > 0) {
                                          derivedOptions = originalQ.options;
                                        }
                                      }
                                    }
                                    
                                    if ((!derivedOptions || derivedOptions.length === 0) && typeof parsedActualAnswer === 'object' && parsedActualAnswer !== null) {
                                      if (parsedActualAnswer.multipleChoice) {
                                        derivedOptions = Object.keys(parsedActualAnswer.multipleChoice);
                                      } else if (parsedActualAnswer.singleChoice && typeof parsedActualAnswer.singleChoice === 'object') {
                                        derivedOptions = Object.keys(parsedActualAnswer.singleChoice);
                                      }
                                    }

                                    return derivedOptions && derivedOptions.length > 0 && (
                                    <div className="flex flex-col gap-3 mb-6">
                                      {derivedOptions.map((opt, oIdx) => (
                                        <div key={oIdx} className="flex items-start gap-4">
                                          <div className="w-8 h-8 rounded-md flex items-center justify-center font-bold text-sm bg-slate-100 text-slate-500 shrink-0">
                                            {String.fromCharCode(65 + oIdx)}
                                          </div>
                                          <span className="font-medium text-[16px] text-slate-700 pt-1">{opt}</span>
                                        </div>
                                      ))}
                                    </div>
                                    );
                                  })()}
                                  
                                  <div className="flex flex-col sm:flex-row gap-5">
                                    <div className="flex-1 bg-slate-50 p-6 rounded-xl border border-slate-200/60 relative overflow-hidden shadow-sm">
                                      <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Your Answer</span>
                                      <span className={`font-semibold text-lg block ${isUnanswered ? 'text-slate-500 italic' : qa.isCorrect ? 'text-emerald-600' : 'text-rose-500'}`}>
                                        {studentAnsText}
                                      </span>
                                    </div>
                                    <div className="flex-1 bg-indigo-50/50 p-6 rounded-xl border border-indigo-100/60 relative overflow-hidden shadow-sm">
                                      <span className="text-[12px] font-bold text-indigo-400 uppercase tracking-widest block mb-3">Correct Answer</span>
                                      <span className="font-semibold text-indigo-700 text-lg block">{actualAnsText}</span>
                                    </div>
                                  </div>
                    
                                  {actualExplanation && (
                                    <div className="mt-8 bg-amber-50/50 p-6 rounded-xl border border-amber-100/60 text-amber-900 text-[15px] shadow-sm">
                                      <span className="font-bold block mb-3 text-amber-700 flex items-center gap-2 uppercase tracking-widest text-[12px]">
                                        <InfoCircleOutlined className="text-[16px]" /> Explanation
                                      </span>
                                      <span dangerouslySetInnerHTML={{ __html: typeof actualExplanation === 'string' ? actualExplanation : (actualExplanation?.explanation || JSON.stringify(actualExplanation)) }} className="leading-relaxed block text-amber-800/90" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            );
                          })}
                        </div>
                    </>
                  );
                })()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden font-sans fixed inset-0 z-[1000]">
      {contextHolder}
      {/* HEADER */}
      <div className="h-16 bg-white border-b flex items-center justify-between px-6 shrink-0 shadow-sm relative z-20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-200">
            <CodeOutlined className="text-white text-xl" />
          </div>
          <div>
            <Title level={4} className="!mb-0 !font-bold text-gray-800">{testTitle} Assessment Test</Title>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <ClockCircleOutlined className="text-lg" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Time Remaining</span>
              <span className={`text-lg font-mono font-bold leading-tight ${timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-slate-800'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
          <Button type="primary" onClick={handleSubmit} className="bg-red-500 hover:bg-red-600 border-none font-bold px-6 h-10 rounded-lg shadow-sm shadow-red-200" icon={<SendOutlined />}>
            Submit Test
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden bg-gray-50">
        {/* MAIN CONTENT AREA */}
        {currentQ.type !== "Coding" ? (
          <div className="flex-1 flex flex-col bg-white overflow-y-auto shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
            {/* MCQ UI */}
            <div className="flex-1 w-full px-10 py-10 md:px-16 flex flex-col min-h-full">
              <div className="flex flex-col gap-4 mb-8">
                <div className="flex justify-between items-center">
                  <Text className="font-bold text-blue-600 text-[15px]">Question {currentIdx + 1} of {questions.length}</Text>
                  <div className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border border-blue-100">
                    <AimOutlined /> {currentQ.type}
                  </div>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full transition-all duration-300" style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}></div>
                </div>
              </div>
              <Title level={3} className="!mb-10 !leading-snug !text-slate-800">
                {currentQDisplayIdx}. {currentQ.question}
              </Title>
              <div className="flex flex-col gap-4 mb-12">
                {currentQ.options.map((opt, i) => {
                  const isMultipleChoice = currentQ.type === "Multiple Choice";
                  const isSelected = isMultipleChoice
                    ? (answers[currentIdx] || []).includes(opt)
                    : answers[currentIdx] === opt;
                  const handleSelect = () => {
                    if (isMultipleChoice) {
                      setAnswers((prev) => {
                        const prevSelected = prev[currentIdx] || [];
                        if (prevSelected.includes(opt)) {
                          return { ...prev, [currentIdx]: prevSelected.filter(o => o !== opt) };
                        } else {
                          return { ...prev, [currentIdx]: [...prevSelected, opt] };
                        }
                      });
                    } else {
                      setAnswers((prev) => ({ ...prev, [currentIdx]: opt }));
                    }
                  };
                  return (
                    <div
                      key={i}
                      onClick={handleSelect}
                      className={`flex items-center gap-5 p-4 rounded-xl cursor-pointer transition-all ${isSelected
                          ? 'border-2 border-blue-500 bg-white shadow-sm'
                          : 'border-2 border-gray-100 bg-white hover:border-blue-200 shadow-sm'
                        }`}
                    >
                      <div className={`w-9 h-9 shrink-0 flex items-center justify-center text-[15px] font-bold transition-colors ${isMultipleChoice ? 'rounded-md' : 'rounded-full'
                        } ${isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-50 text-blue-600'
                        }`}>
                        {String.fromCharCode(65 + i)}
                      </div>
                      <div className="text-[16px] font-medium text-slate-700 flex-1">
                        {opt}
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex shrink-0 items-center justify-center ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                        }`}>
                        {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (() => {
          // CODING UI
          let mainText = currentQ.description;
          let constraints = currentQ.constraints || "";
          let sampleInput = currentQ.sampleInput || "";
          let sampleOutput = currentQ.sampleOutput || "";

          return (
            <div className="flex-1 flex flex-col bg-gray-100 overflow-hidden z-10 border-t border-gray-200">
              <PanelGroup direction="horizontal" className="flex-1 w-full h-full overflow-hidden">
                <Panel defaultSize={45} minSize={20} className="bg-white flex flex-col overflow-hidden">
                  <div className="px-10 py-8 md:px-16 overflow-y-auto flex-1">
                    <div className="flex flex-col gap-4 mb-8">
                      <div className="flex justify-between items-center">
                        <Text className="font-bold text-blue-600 text-[15px]">Question {currentIdx + 1} of {questions.length}</Text>
                        <div className="bg-purple-50 text-purple-600 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border border-purple-100">
                          <CodeOutlined /> {currentQ.type}
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full transition-all duration-300" style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}></div>
                      </div>
                    </div>
                    <div className="text-[15px] text-slate-800 mb-8 leading-relaxed">
                      <div className="font-bold text-lg mb-3 text-slate-900">{currentQDisplayIdx}. Problem Statement</div>
                      <div dangerouslySetInnerHTML={{ __html: mainText }} className="coding-desc" />
                    </div>

                    {currentQ.testCases && currentQ.testCases.filter(tc => !tc.isHidden).length > 0 ? (
                      currentQ.testCases.filter(tc => !tc.isHidden).map((tc, idx) => (
                        <div key={idx} className="mb-8">
                          <div className="font-bold text-slate-800 mb-3 text-[15px]">Example {idx + 1}:</div>
                          <div className="border-l-2 border-gray-300 pl-4 py-3 bg-[#f7f8fa] text-[14px] font-mono text-slate-700 rounded-r-lg whitespace-pre-wrap">
                            <span className="font-bold text-slate-800">Input: </span>{tc.input}
                            <br />
                            <span className="font-bold text-slate-800">Output: </span>{tc.expectedOutput || tc.output || ""}
                            {tc.explanation && (
                              <>
                                <br />
                                <span className="font-bold text-slate-800">Explanation: </span>{tc.explanation}
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      sampleInput && sampleOutput && (
                        <div className="mb-8">
                          <div className="font-bold text-slate-800 mb-3 text-[15px]">Example 1:</div>
                          <div className="border-l-2 border-gray-300 pl-4 py-3 bg-[#f7f8fa] text-[14px] font-mono text-slate-700 rounded-r-lg whitespace-pre-wrap">
                            <span className="font-bold text-slate-800">Input: </span>{sampleInput}
                            <br />
                            <span className="font-bold text-slate-800">Output: </span>{sampleOutput}
                          </div>
                        </div>
                      )
                    )}

                    {constraints && (
                      <div className="mb-8">
                        <div className="font-bold text-slate-800 mb-3 text-[15px]">Constraints:</div>
                        <ul className="list-disc pl-5 text-[14px] font-mono space-y-2">
                          {constraints.split('\n').filter(line => line.trim() !== '').map((line, i) => (
                            <li key={i}><span className="bg-[#f7f8fa] text-slate-700 px-2 py-1 rounded text-[13px]">{line.replace(/^-\s*/, '').trim()}</span></li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </Panel>
                <PanelResizeHandle className="w-[6px] cursor-col-resize hover:bg-blue-400/50 bg-gray-200 transition-colors z-10 flex flex-col items-center justify-center border-l border-r border-gray-100">
                  <div className="w-0.5 h-8 bg-gray-400 rounded-full" />
                </PanelResizeHandle>
                <Panel defaultSize={55} minSize={30} className="flex flex-col bg-[#141414] overflow-hidden">
                  <div className="h-14 bg-white flex items-center px-4 justify-between border-b border-gray-200 shrink-0">
                    <div className="flex items-center gap-4">
                      <div className="text-slate-600 text-sm font-bold flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100"><CodeOutlined /> main</div>

                      <Dropdown
                        trigger={['click']}
                        dropdownRender={() => (
                          <div className="bg-[#2d2d2d] rounded-lg shadow-xl border border-[#3e3e42] p-2 flex gap-4 min-w-max text-[13px] font-mono">
                            {languageGroups.map((group, colIdx) => (
                              <div key={colIdx} className={`flex flex-col gap-1 ${colIdx < languageGroups.length - 1 ? 'border-r border-[#3e3e42] pr-4' : ''}`}>
                                {group.map((lang) => {
                                  const isSelected = (editorLanguages[currentIdx] || "javascript") === lang.value;
                                  return (
                                    <div
                                      key={lang.value}
                                      onClick={() => setEditorLanguages(prev => ({ ...prev, [currentIdx]: lang.value }))}
                                      className={`px-3 py-1.5 rounded cursor-pointer flex items-center gap-2 hover:bg-[#3e3e42] transition-colors ${isSelected ? 'text-white font-bold' : 'text-gray-300 hover:text-white'}`}
                                    >
                                      <span className="w-3 inline-block">{isSelected ? <CheckOutlined className="text-[10px]" /> : null}</span>
                                      {lang.label}
                                    </div>
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        )}
                      >
                        <div className="flex items-center gap-2 text-slate-700 hover:bg-gray-100 px-3 py-1.5 rounded-lg cursor-pointer transition-colors font-mono text-[13px] font-bold">
                          {languageGroups.flat().find(l => l.value === (editorLanguages[currentIdx] || "javascript"))?.label || "JavaScript"}
                          <DownOutlined className="text-[10px] text-slate-500" />
                        </div>
                      </Dropdown>

                      <div className="text-gray-500 font-mono text-[13px] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                        Auto
                      </div>
                    </div>
                    {canSubmitHidden[currentIdx] ? (
                    <Button type="primary" onClick={() => handleRunCode(true)} loading={isCompiling} className="bg-green-600 hover:bg-green-500 border-none font-bold rounded-lg px-5 shadow-sm shadow-green-200">
                      <SendOutlined /> Submit
                    </Button>
                  ) : (
                    <Button type="primary" onClick={() => handleRunCode(false)} loading={isCompiling} className="bg-blue-600 hover:bg-blue-500 border-none font-bold rounded-lg px-5 shadow-sm shadow-blue-200">
                      <PlayCircleOutlined /> Run Code
                    </Button>
                  )}
                  </div>
                  <PanelGroup direction="vertical" orientation="vertical" style={{ flexDirection: 'column' }} className="flex-1 flex w-full">
                    <Panel defaultSize={70} minSize={30} className="py-4">
                    <Editor
                      height="100%"
                      language={editorLanguages[currentIdx] || "javascript"}
                      theme="vs-dark"
                      value={codeValues[currentIdx] !== undefined ? codeValues[currentIdx] : (BOILERPLATES[editorLanguages[currentIdx] || "javascript"] || "// Write your code here...\n")}
                      onChange={(val) => {
                        setCodeValues(prev => ({ ...prev, [currentIdx]: val }));
                        if (canSubmitHidden[currentIdx]) {
                           setCanSubmitHidden(prev => ({ ...prev, [currentIdx]: false }));
                           setExecutionResults(prev => ({ ...prev, [currentIdx]: null }));
                        }
                      }}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 15,
                        padding: { top: 8 },
                        scrollBeyondLastLine: false,
                      }}
                    />
                  </Panel>
                  <PanelResizeHandle className="h-[6px] cursor-row-resize hover:bg-blue-400/50 bg-[#2d2d2d] transition-colors z-10 flex flex-row items-center justify-center border-t border-b border-[#3e3e42]">
                    <div className="h-0.5 w-8 bg-gray-500 rounded-full" />
                  </PanelResizeHandle>
                  <Panel defaultSize={30} minSize={10} className="bg-[#262626] flex flex-col font-mono text-[13px] text-gray-300">
                    {/* Tabs */}
                    <div className="flex items-center bg-[#2d2d2d] px-4 pt-2 gap-4 border-b border-[#3e3e42]">
                      <div
                        onClick={() => setActiveBottomTab("testcase")}
                        className={`pb-2 px-1 cursor-pointer transition-colors flex items-center gap-2 ${activeBottomTab === "testcase" ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
                      >
                        <CheckOutlined className="text-[14px] text-green-500" /> Testcase
                      </div>
                      <div
                        onClick={() => setActiveBottomTab("result")}
                        className={`pb-2 px-1 cursor-pointer transition-colors flex items-center gap-2 ${activeBottomTab === "result" ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
                      >
                        <CodeOutlined className="text-[14px]" /> Test Result
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-hidden p-4 bg-[#1e1e1e]">
                      {activeBottomTab === "testcase" && currentQ.testCases && (
                        <div className="flex flex-col h-full">
                          <div className="flex items-center gap-2 mb-4">
                            {currentQ.testCases.filter(tc => !tc.isHidden).map((tc, idx) => (
                              <div
                                key={idx}
                                onClick={() => setActiveTestCaseIdx(idx)}
                                className={`px-4 py-1.5 rounded-lg cursor-pointer transition-colors font-bold ${activeTestCaseIdx === idx ? 'bg-[#3e3e42] text-white' : 'bg-[#2d2d2d] text-gray-400 hover:bg-[#3e3e42]'}`}
                              >
                                Case {idx + 1}
                              </div>
                            ))}
                          </div>
                          {currentQ.testCases.filter(tc => !tc.isHidden)[activeTestCaseIdx] && (
                            <div className="flex flex-col gap-4">
                              <div className="flex flex-col gap-2">
                                <span className="text-gray-400 text-xs font-bold">Input:</span>
                                <div className="bg-[#2d2d2d] px-4 py-3 rounded-lg text-white font-mono break-all whitespace-pre-wrap border border-[#3e3e42]">
                                  {currentQ.testCases.filter(tc => !tc.isHidden)[activeTestCaseIdx].input}
                                </div>
                              </div>
                              <div className="flex flex-col gap-2">
                                <span className="text-gray-400 text-xs font-bold">Expected Output:</span>
                                <div className="bg-[#2d2d2d] px-4 py-3 rounded-lg text-gray-300 font-mono break-all whitespace-pre-wrap border border-[#3e3e42]">
                                  {currentQ.testCases.filter(tc => !tc.isHidden)[activeTestCaseIdx].output || currentQ.testCases.filter(tc => !tc.isHidden)[activeTestCaseIdx].expectedOutput}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      {activeBottomTab === "result" && (
                        <div className="flex flex-col h-full">
                          {isCompiling ? (
                            <div className="flex items-center justify-center h-full text-blue-400 gap-3">
                              <Spin size="small" /> Running Code...
                            </div>
                          ) : executionResults[currentIdx] ? (
                            <div className="flex flex-col gap-4">
                              <div className={`text-lg font-bold ${executionResults[currentIdx].status === 'Accepted' ? 'text-green-500' : 'text-red-500'}`}>
                                {executionResults[currentIdx].status}
                              </div>
                              <div className="flex flex-col gap-4 mb-4">
                                {executionResults[currentIdx].cases?.some(c => !c.isHidden) && (
                                  <div>
                                    {executionResults[currentIdx].isSubmit && <div className="text-gray-400 text-xs font-bold mb-2">Public Test Cases:</div>}
                                    <div className="flex items-center gap-2 flex-wrap">
                                      {executionResults[currentIdx].cases?.map((res, idx) => {
                                        if (res.isHidden) return null;
                                        return (
                                          <div 
                                            key={idx}
                                            onClick={() => !executionResults[currentIdx].isSubmit && setActiveTestCaseIdx(idx)}
                                            className={`px-4 py-1.5 rounded-lg font-bold ${!executionResults[currentIdx].isSubmit ? 'cursor-pointer transition-colors' : ''} ${
                                              (!executionResults[currentIdx].isSubmit && activeTestCaseIdx === idx) 
                                                ? (res.passed ? 'bg-green-600 text-white' : 'bg-red-600 text-white') 
                                                : (res.passed ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30')
                                            }`}
                                          >
                                            Case {idx + 1}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                                
                                {executionResults[currentIdx].isSubmit && executionResults[currentIdx].cases?.some(c => c.isHidden) && (
                                  <div>
                                    <div className="text-gray-400 text-xs font-bold mb-2">Hidden Test Cases:</div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      {executionResults[currentIdx].cases?.map((res, idx) => {
                                        if (!res.isHidden) return null;
                                        return (
                                          <div 
                                            key={idx}
                                            className={`px-4 py-1.5 rounded-lg font-bold ${
                                              res.passed ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                                            }`}
                                          >
                                            Case {idx + 1}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              {!executionResults[currentIdx].isSubmit && executionResults[currentIdx].cases?.[activeTestCaseIdx] && !executionResults[currentIdx].cases[activeTestCaseIdx].isHidden && (
                                <div className="flex flex-col gap-3 pb-4">
                                  <div className="flex flex-col gap-1">
                                    <span className="text-gray-400 text-xs font-bold">Input:</span>
                                    <div className="bg-[#2d2d2d] px-3 py-2 rounded-lg text-white font-mono break-all whitespace-pre-wrap border border-[#3e3e42]">
                                      {executionResults[currentIdx].cases[activeTestCaseIdx].input}
                                    </div>
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <span className="text-gray-400 text-xs font-bold">Output:</span>
                                    <div className={`px-3 py-2 rounded-lg font-mono break-all whitespace-pre-wrap border border-[#3e3e42] ${executionResults[currentIdx].cases[activeTestCaseIdx].passed ? 'bg-[#2d2d2d] text-gray-300' : 'bg-[#3a2020] text-red-400'}`}>
                                      {executionResults[currentIdx].cases[activeTestCaseIdx].output || 'No Output'}
                                    </div>
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <span className="text-gray-400 text-xs font-bold">Expected:</span>
                                    <div className="bg-[#2d2d2d] px-3 py-2 rounded-lg text-gray-300 font-mono break-all whitespace-pre-wrap border border-[#3e3e42]">
                                      {executionResults[currentIdx].cases[activeTestCaseIdx].expected}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                              Run code to see test results.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </Panel>
                </PanelGroup>
              </Panel>
            </PanelGroup>
            </div>
          );
        })()}

        {renderSidebar(false)}
      </div>

      {/* FOOTER ACTIONS */}
      <div className="h-20 bg-white border-t flex items-center justify-between px-8 shrink-0 shadow-[0_-4px_15px_rgba(0,0,0,0.03)] z-20 relative">
        <Space size="large">
          <Button size="large" icon={<InfoCircleOutlined />} onClick={handleReportQuestion} className="border-gray-200 font-semibold text-gray-600 rounded-lg h-10 hover:border-gray-300 hover:text-gray-800">Report Question</Button>
          <div className="w-px h-8 bg-gray-200 mx-1"></div>
          <Button size="large" icon={<DeleteOutlined />} onClick={handleClear} disabled={currentQ.type === 'Coding'} className="border-gray-200 font-semibold text-gray-600 rounded-lg h-10 hover:border-gray-300 hover:text-gray-800">Clear Response</Button>
          <Button size="large" icon={<FlagOutlined />} onClick={toggleMarkForReview} className={`font-semibold rounded-lg h-10 ${markedForReview[currentIdx] ? "border-purple-500 text-purple-600 bg-purple-50" : "border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-800"}`}>
            {markedForReview[currentIdx] ? "Unmark Review" : "Mark for Review"}
          </Button>
        </Space>
        <Space size="middle">
          <Button size="large" icon={<LeftOutlined />} onClick={handlePrevious} disabled={currentIdx === 0} className="rounded-lg h-10 px-6 text-blue-600 border-blue-200 font-semibold hover:bg-blue-50">
            Previous
          </Button>
          <Button size="large" type="primary" className="bg-blue-600 font-bold rounded-lg h-10 px-8 shadow-sm shadow-blue-200" onClick={handleNext} disabled={currentIdx === questions.length - 1}>
            Save & Next <RightOutlined />
          </Button>
        </Space>
      </div>
      {/* CUSTOM MODALS */}
      {showIncompleteWarning && (
        <div className="fixed inset-0 z-[5000] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-6">
              <ExclamationCircleOutlined style={{ color: '#ef4444', fontSize: '40px' }} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Incomplete Assessment</h3>
            <p className="text-slate-500 mb-4 leading-relaxed px-4">
              You have unanswered questions. Unanswered questions will receive 0 marks. Are you sure you want to submit?
            </p>
            <div className="flex w-full gap-3 mt-6 flex-col sm:flex-row">
              <button 
                onClick={() => setShowIncompleteWarning(false)}
                className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors cursor-pointer"
              >
                Continue Test
              </button>
              <button 
                onClick={() => {
                  setShowIncompleteWarning(false);
                  handleFinalSubmit();
                }}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Yes, Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showNoResultPopup && (
        <div className="fixed inset-0 z-[6000] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative bg-white w-full max-w-sm rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col items-center text-center overflow-hidden border border-slate-100">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-orange-400 to-red-500 opacity-10 pointer-events-none"></div>
            
            <div className="z-10 w-24 h-24 mt-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-orange-200 animate-[pulse_2s_infinite]">
              <span className="text-5xl text-white pb-2">⚠️</span>
            </div>
            
            <div className="z-10 px-8 pb-8 flex flex-col items-center w-full">
              <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Test Ended</h3>
              <p className="text-slate-500 font-medium mb-12 leading-relaxed">
                You have ended the test without attempting all questions, so there will be <strong className="text-red-500">no result</strong> recorded for this attempt.
              </p>
              <button 
                onClick={() => {
                  setShowNoResultPopup(false);
                  router.push('/student/practice-new/company-wise');
                }}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {showCelebration && (
        <div className="fixed inset-0 z-[6000] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative bg-gradient-to-b from-indigo-500 to-purple-700 w-full max-w-lg rounded-3xl shadow-2xl p-10 flex flex-col items-center text-center overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
                <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-300 rounded-full blur-2xl animate-bounce"></div>
                <div className="absolute bottom-10 right-10 w-32 h-32 bg-pink-400 rounded-full blur-3xl animate-pulse"></div>
            </div>
            <div className="z-10 bg-white/20 p-4 rounded-full backdrop-blur-md mb-6 border border-white/30 shadow-[0_0_40px_rgba(255,255,255,0.4)] animate-[bounce_1s_ease-in-out_infinite]">
               <span className="text-6xl">🏆</span>
            </div>
            <h2 className="z-10 text-4xl font-extrabold text-white mb-2 tracking-tight drop-shadow-md">
              Amazing Work!
            </h2>
            <p className="z-10 text-purple-100 text-lg mb-8 max-w-sm">
              You just achieved the <strong className="text-yellow-300 text-xl mx-1">{celebrationRank === 1 ? "Highest" : celebrationRank === 2 ? "2nd Highest" : "3rd Highest"} Score</strong> in this test!
            </p>
            <button 
              onClick={() => setShowCelebration(false)}
              className="z-10 px-8 py-4 bg-white text-purple-700 hover:bg-purple-50 font-bold rounded-full transition-transform hover:scale-105 shadow-xl cursor-pointer"
            >
              Awesome!
            </button>
          </div>
        </div>
      )}

      {showSubmitConfirm && (
        <div className="fixed inset-0 z-[5000] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
              <ExclamationCircleOutlined style={{ color: '#0F172A', fontSize: '40px' }} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Submit Assessment?</h3>
            <p className="text-slate-500 mb-4 leading-relaxed px-4">
              Are you sure you want to submit? You will not be able to change your answers once submitted.
            </p>
            <div className="flex w-full gap-4 mt-8">
              <button 
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer border-none"
              >
                Cancel
              </button>
              <button 
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="flex-1 py-3.5 bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold rounded-xl transition-shadow shadow-[0_4px_14px_rgba(15,23,42,0.25)] hover:shadow-[0_6px_20px_rgba(15,23,42,0.3)] cursor-pointer border-none disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Yes, Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSubmitSuccess && pendingAttempt && (
        <div className="fixed inset-0 z-[5000] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center mb-6 relative">
              <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
              <CheckCircleOutlined className="text-[48px] text-green-500 relative z-10" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Test Submitted!</h3>
            <p className="text-slate-500 mb-4 leading-relaxed px-4">
              Your answers have been securely recorded. You can now review your performance.
            </p>
            <div className="flex flex-col w-full gap-3 mt-8">
              <button 
                onClick={() => {
                  setShowSubmitSuccess(false);
                  setCurrentAttempt(pendingAttempt);
                  setShowResultView(true);
                }}
                className="w-full py-4 bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold rounded-xl transition-shadow shadow-[0_4px_14px_rgba(15,23,42,0.25)] hover:shadow-[0_6px_20px_rgba(15,23,42,0.3)] cursor-pointer border-none"
              >
                View Results
              </button>
              <button 
                onClick={() => router.push('/student/practice-new/company-wise')}
                className="w-full py-3.5 bg-transparent hover:bg-slate-50 text-slate-500 font-semibold rounded-xl transition-colors cursor-pointer border-2 border-transparent hover:border-slate-200"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
