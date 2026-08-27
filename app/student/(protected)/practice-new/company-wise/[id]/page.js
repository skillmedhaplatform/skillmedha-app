"use client";
import React, { useState, useEffect } from "react";
import { Button, Radio, Typography, Divider, Modal, Space, Checkbox, Spin, Avatar, Select } from "antd";
import { ClockCircleOutlined, LeftOutlined, RightOutlined, ExclamationCircleOutlined, CodeOutlined, SendOutlined, BookOutlined, DeleteOutlined, FlagOutlined, UpOutlined, InfoCircleOutlined, AimOutlined, PlayCircleOutlined } from "@ant-design/icons";
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

export default function StudentMockTestPage() {
  const router = useRouter();
  const { id } = useParams();
  const dispatch = useDispatch();
  const [modal, contextHolder] = Modal.useModal();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [visited, setVisited] = useState({ 0: true });
  const [editorLanguages, setEditorLanguages] = useState({});
  const [codeValues, setCodeValues] = useState({});
  const [timeLeft, setTimeLeft] = useState(3600);
  
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
      setLoading(true);
      dispatch(fetchPracQuestions({ refId: id, type: "subjectId", userId: studentCreds?._id, limit: 500 }))
        .then((res) => {
          console.log("FETCHED RAW RES:", res);
          console.log("FETCHED RES.PAYLOAD:", res.payload);
          const apiResponse = res.payload?.data || {};
          const fetchedData = apiResponse.questionsData || [];
          const actualArray = Array.isArray(fetchedData) ? fetchedData : [];
          
          console.log("ACTUAL ARRAY LENGTH:", actualArray.length);
          
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

            let desc = "";
            let questionText = content.question || q.questionText || "Question text not provided";

            if (mappedType === "Coding") {
              desc = q.problemStatement || content.problemStatement || questionText || "";
              if (q.constraints) desc += `\n\n**Constraints:**\n${q.constraints}`;
              if (q.sampleInput) desc += `\n\n**Sample Input:**\n${q.sampleInput}`;
              if (q.sampleOutput) desc += `\n\n**Sample Output:**\n${q.sampleOutput}`;
              // Make sure question string itself is not empty if it wasn't problem statement
              if (!questionText || questionText === "Question text not provided") {
                questionText = desc;
              }
            }

            let rawSection = q.sectionName || q.subjectName || "General";
            let mainCategory = rawSection.split(" - ")[0].trim();
            
            return {
              id: q._id || `q${idx}`,
              type: mappedType,
              question: questionText,
              options: options,
              section: mainCategory,
              description: desc,
              raw: q // keep raw data for submission later if needed
            };
          });

          // Group questions by section so they appear contiguously (and sequentially in the sidebar)
          const sectionMap = {};
          mappedQuestions.forEach(q => {
            if (!sectionMap[q.section]) sectionMap[q.section] = [];
            sectionMap[q.section].push(q);
          });

          const groupedQuestions = [];
          Object.values(sectionMap).forEach(secArr => {
            groupedQuestions.push(...secArr);
          });
          
          setQuestions(groupedQuestions);
          if (groupedQuestions.length > 0) {
            setActiveSection(groupedQuestions[0].section);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id, dispatch, companyTests.length]);

  const sections = Array.from(new Set(questions.map(q => q.section)));
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    if (questions[currentIdx] && !activeSection) {
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
      setTimeLeft(companyTest.timeLimit * 60);
    }
  }, [companyTest]);

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
    modal.confirm({
      title: 'Submit Assessment?',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to submit? You will not be able to change your answers.',
      okText: 'Yes, Submit',
      cancelText: 'Cancel',
      okButtonProps: { className: 'bg-blue-600' },
      onOk() {
        console.log("Submitting:", answers, codeValues);
        router.push('/student/practice-new/company-wise');
      }
    });
  };

  const currentQ = questions[currentIdx] || {};

  const renderSidebar = (isCoding) => (
    <div className={isCoding ? "flex flex-col h-full bg-white" : "w-[340px] bg-white border-l border-gray-100 flex flex-col shrink-0 overflow-hidden z-10"}>
      <div className="flex-[2] overflow-y-auto p-6 pb-4 border-b border-gray-100 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <Title level={5} className="!mb-0 !font-bold !text-slate-800">Category Selection</Title>
          <UpOutlined className="text-gray-400 cursor-pointer hover:text-gray-600" />
        </div>
        <div className="flex flex-wrap gap-2">
          {sections.map(section => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-all border ${
                activeSection === section 
                  ? 'bg-blue-500 text-white border-blue-500 shadow-sm' 
                  : 'bg-white text-slate-600 border-gray-200 hover:border-blue-200 hover:bg-blue-50'
              }`}
            >
              {section}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-[3] overflow-y-auto p-6 flex flex-col">
        <div className="grid grid-cols-5 gap-3.5 content-start">
        {questions.map((q, idx) => {
          if (q.section !== activeSection) return null;
          let styleClass = "border border-gray-200 bg-white text-gray-700";
          if (currentIdx === idx) {
            styleClass = "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200/50";
          } else if (answers[idx] || codeValues[idx]) {
            styleClass = "bg-green-500 text-white border-green-500";
          } else if (markedForReview[idx]) {
            styleClass = "bg-purple-500 text-white border-purple-500";
          } else if (visited[idx]) {
            styleClass = "bg-red-500 text-white border-red-500";
          }
          return (
            <button
              key={idx}
              onClick={() => handleNavigate(idx)}
              className={`h-11 rounded-lg font-bold text-[13px] flex items-center justify-center transition-all hover:-translate-y-0.5 ${styleClass}`}
            >
              {idx + 1}
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
                <div className="flex justify-between items-start mb-8">
                  <div className="flex flex-col gap-3">
                    <Text className="font-bold text-blue-600 text-[15px]">Question {currentIdx + 1} of {questions.length}</Text>
                    <div className="flex gap-1">
                      <div className="h-1.5 w-12 bg-blue-600 rounded-full"></div>
                      <div className="h-1.5 w-12 bg-gray-200 rounded-full"></div>
                      <div className="h-1.5 w-12 bg-gray-200 rounded-full"></div>
                    </div>
                  </div>
                  <div className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border border-blue-100">
                    <AimOutlined /> {currentQ.type === "Multiple Choice" ? "Multiple Correct" : "Single Correct"}
                  </div>
                </div>
                <Title level={3} className="!mb-10 !leading-snug !text-slate-800">
                  {currentQ.question}
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
                        className={`flex items-center gap-5 p-4 rounded-xl cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-2 border-blue-500 bg-white shadow-sm' 
                            : 'border-2 border-gray-100 bg-white hover:border-blue-200 shadow-sm'
                        }`}
                      >
                        <div className={`w-9 h-9 shrink-0 flex items-center justify-center text-[15px] font-bold transition-colors ${
                          isMultipleChoice ? 'rounded-md' : 'rounded-full'
                        } ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-blue-50 text-blue-600'
                        }`}>
                          {String.fromCharCode(65 + i)}
                        </div>
                        <div className="text-[16px] font-medium text-slate-700 flex-1">
                          {opt}
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex shrink-0 items-center justify-center ${
                          isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
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
          let constraints = "";
          let sampleInput = "";
          let sampleOutput = "";
          if (currentQ.description.includes("**Constraints:**")) {
            const parts = currentQ.description.split("**Constraints:**");
            mainText = parts[0].trim();
            if (parts[1].includes("**Sample Input:**")) {
              const subParts = parts[1].split("**Sample Input:**");
              constraints = subParts[0].trim();
              if (subParts[1].includes("**Sample Output:**")) {
                const outParts = subParts[1].split("**Sample Output:**");
                sampleInput = outParts[0].trim();
                sampleOutput = outParts[1].trim();
              }
            }
          }
          return (
            <div className="flex-1 flex flex-col bg-white overflow-hidden z-10 border-t border-gray-200">
              <PanelGroup direction="horizontal" orientation="horizontal" className="flex-1 w-full h-full">
                <Panel defaultSize={40} minSize={20} className="bg-white flex flex-col overflow-hidden">
                  <div className="px-10 py-10 md:px-16 overflow-y-auto flex-1">
                    <div className="flex justify-between items-start mb-8">
                      <div className="flex flex-col gap-3">
                        <Text className="font-bold text-blue-600 text-[15px]">Question {currentIdx + 1} of {questions.length}</Text>
                        <div className="flex gap-1">
                          <div className="h-1.5 w-12 bg-blue-600 rounded-full"></div>
                          <div className="h-1.5 w-12 bg-gray-200 rounded-full"></div>
                          <div className="h-1.5 w-12 bg-gray-200 rounded-full"></div>
                        </div>
                      </div>
                      <div className="bg-purple-50 text-purple-600 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border border-purple-100">
                        <CodeOutlined /> Coding
                      </div>
                    </div>
                    <Title level={3} className="!mb-6 !text-slate-800">{currentQ.question}</Title>
                    <div className="text-[15px] text-slate-600 mb-8 leading-relaxed">
                    {mainText}
                  </div>
                  {constraints && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 font-bold text-slate-800 mb-3">
                        <div className="bg-purple-100 text-purple-600 p-1 rounded"><CodeOutlined className="text-xs" /></div>
                        Constraints
                      </div>
                      <div className="bg-purple-50/50 p-4 rounded-xl text-[14px] text-slate-700 font-mono">
                        {constraints.split('\n').map((line, i) => <div key={i}>{line}</div>)}
                      </div>
                    </div>
                  )}
                  {sampleInput && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 font-bold text-slate-800 mb-3">
                        <div className="bg-green-100 text-green-600 p-1 rounded"><UpOutlined className="text-xs rotate-90" /></div>
                        Sample Input
                      </div>
                      <div className="bg-green-50/50 p-4 rounded-xl text-[14px] text-slate-700 font-mono whitespace-pre-wrap">
                        {sampleInput}
                      </div>
                    </div>
                  )}
                  {sampleOutput && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 font-bold text-slate-800 mb-3">
                        <div className="bg-blue-100 text-blue-600 p-1 rounded"><LeftOutlined className="text-xs -rotate-90" /></div>
                        Sample Output
                      </div>
                      <div className="bg-blue-50/50 p-4 rounded-xl text-[14px] text-slate-700 font-mono whitespace-pre-wrap">
                        {sampleOutput}
                      </div>
                    </div>
                  )}
                </div>
              </Panel>
              <PanelResizeHandle className="w-[6px] cursor-col-resize hover:bg-blue-400/50 bg-gray-200 transition-colors z-10 flex flex-col items-center justify-center border-l border-r border-gray-100">
                <div className="w-0.5 h-8 bg-gray-400 rounded-full" />
              </PanelResizeHandle>
              <Panel defaultSize={60} minSize={30} className="flex flex-col bg-[#141414] overflow-hidden">
                <div className="h-14 bg-white flex items-center px-4 justify-between border-b border-gray-200 shrink-0">
                  <div className="flex items-center gap-4">
                    <div className="text-slate-600 text-sm font-bold flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100"><CodeOutlined /> main</div>
                    <Select 
                      value={editorLanguages[currentIdx] || "javascript"} 
                      onChange={(val) => setEditorLanguages(prev => ({ ...prev, [currentIdx]: val }))}
                      size="middle"
                      className="w-32 font-mono text-[13px]"
                      variant="borderless"
                      dropdownStyle={{ fontFamily: 'monospace' }}
                    >
                      <Option value="javascript">JavaScript</Option>
                      <Option value="python">Python</Option>
                      <Option value="java">Java</Option>
                      <Option value="cpp">C++</Option>
                    </Select>
                  </div>
                  <Button type="primary" className="bg-blue-600 font-bold rounded-lg px-5 shadow-sm shadow-blue-200">
                    <PlayCircleOutlined /> Run Code
                  </Button>
                </div>
                <div className="flex-1 py-4">
                  <Editor
                    height="100%"
                    language={editorLanguages[currentIdx] || "javascript"}
                    theme="vs-dark"
                    value={codeValues[currentIdx] || "// Write your code here...\n"}
                    onChange={(val) => setCodeValues(prev => ({ ...prev, [currentIdx]: val }))}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 15,
                      padding: { top: 8 },
                      scrollBeyondLastLine: false,
                    }}
                  />
                </div>
                <div className="h-48 bg-[#1e1e1e] border-t border-gray-800 p-4 font-mono text-sm text-gray-300 overflow-y-auto shrink-0 flex flex-col">
                  <div className="text-gray-400 mb-3 flex items-center gap-2 font-bold text-xs uppercase tracking-wide">
                    <CodeOutlined /> Console Output
                  </div>
                  <div className="flex-1">Ready...</div>
                </div>
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
          <Button size="large" icon={<InfoCircleOutlined />} className="border-gray-200 font-semibold text-gray-600 rounded-lg h-10 hover:border-gray-300 hover:text-gray-800">Report Question</Button>
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
    </div>
  );
}
