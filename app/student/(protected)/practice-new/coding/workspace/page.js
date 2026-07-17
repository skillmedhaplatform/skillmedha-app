"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Group as PanelGroup, Panel, Separator as PanelResizeHandle } from "react-resizable-panels";
import Editor from "@monaco-editor/react";
import { Dropdown, message, Spin, Empty, Tooltip } from "antd";
import { TbChevronLeft, TbChevronRight, TbPlayerPlay, TbCheck, TbX, TbCode, TbCpu, TbRefresh, TbClock, TbTags, TbBuilding, TbLock, TbBulb, TbMaximize, TbSun, TbMoon, TbChevronDown, TbChevronUp, TbMinimize, TbTerminal2, TbFileDescription, TbHistory, TbUserCircle, TbInfoCircle } from "react-icons/tb";
import axios from "axios";
import { useSelector } from "react-redux";
import { restUrl } from "@/config/urls";
import { getLstorage } from "@/utils/universalUtils/windowMW";
import { executeCode } from "@/utils/judge0";
import styles from "./page.module.scss";

const wrapCodeForJudge = (lang, rawCode) => {
  if (lang === "javascript") {
    const match = rawCode.match(/function\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*\(/);
    const funcName = match ? match[1] : null;
    if (!funcName) return rawCode;

    return `
${rawCode}

// --- SYSTEM AUTO-WRAPPER ---
const fs = require('fs');
try {
  const __input = fs.readFileSync('/dev/stdin', 'utf-8').trim();
  const __lines = __input.split('\\n').filter(l => l.trim().length > 0);
  const __args = __lines.map(line => {
      try { return JSON.parse(line); } 
      catch(e) { return !isNaN(line) ? Number(line) : line; }
  });

  const __result = ${funcName}(...__args);
  
  if (typeof __result === 'object') console.log(JSON.stringify(__result));
  else if (__result !== undefined) console.log(__result);
} catch (e) {
  console.log(e.toString());
}
`;
  }
  
  if (lang === "python") {
    const match = rawCode.match(/def\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*\(/);
    const funcName = match ? match[1] : null;
    if (!funcName) return rawCode;

    return `
${rawCode}

# --- SYSTEM AUTO-WRAPPER ---
import sys, json
try:
    __input = sys.stdin.read().strip()
    __lines = [l for l in __input.split('\\n') if l.strip()]
    __args = []
    for line in __lines:
        try: __args.append(json.loads(line))
        except: __args.append(int(line) if line.isdigit() else line)
    
    if 'Solution' in globals() and hasattr(Solution, '${funcName}'):
        __inst = Solution()
        __func = getattr(__inst, '${funcName}')
        __result = __func(*__args)
    elif '${funcName}' in globals():
        __func = globals()['${funcName}']
        __result = __func(*__args)
    else:
        raise Exception("Function '${funcName}' not found.")
        
    if isinstance(__result, (list, dict)): print(json.dumps(__result).replace(" ", ""))
    elif __result is not None: print(__result)
except Exception as e:
    print(e)
`;
  }
  
  return rawCode;
};

const LANGUAGE_OPTIONS = [
  { id: 45, value: "Assembly (NASM 2.14.02)", label: "Assembly (NASM 2.14.02)", editorLang: "assembly" },
  { id: 46, value: "Bash (5.0.0)", label: "Bash (5.0.0)", editorLang: "shell" },
  { id: 48, value: "C (GCC 9.2.0)", label: "C (GCC 9.2.0)", editorLang: "c" },
  { id: 54, value: "C++ (GCC 9.2.0)", label: "C++ (GCC 9.2.0)", editorLang: "cpp" },
  { id: 51, value: "C# (Mono 6.6.0.161)", label: "C#", editorLang: "csharp" },
  { id: 60, value: "Go (1.23.5)", label: "Go (1.23.5)", editorLang: "go" },
  { id: 62, value: "Java (JDK 17.0.6)", label: "Java (JDK 17.0.6)", editorLang: "java" },
  { id: 63, value: "JavaScript (Node.js 22.08.0)", label: "JavaScript", editorLang: "javascript" },
  { id: 68, value: "PHP (8.3.11)", label: "PHP (8.3.11)", editorLang: "php" },
  { id: 71, value: "Python (3.8.1)", label: "Python 3", editorLang: "python" },
  { id: 72, value: "Ruby (2.7.0)", label: "Ruby", editorLang: "ruby" },
  { id: 73, value: "Rust (1.85.0)", label: "Rust", editorLang: "rust" },
  { id: 82, value: "SQL (SQLite 3.27.2)", label: "SQL", editorLang: "sql" },
  { id: 83, value: "Swift (5.2.3)", label: "Swift", editorLang: "swift" },
  { id: 74, value: "TypeScript (5.6.2)", label: "TypeScript", editorLang: "typescript" },
];

const parseIfJson = (text) => {
  if (typeof text !== "string") return String(text || "");
  try {
    const parsed = JSON.parse(text);
    return typeof parsed === "object" ? JSON.stringify(parsed) : String(parsed);
  } catch {
    return text;
  }
};

const getTextFromHtml = (html) => {
  if (typeof window === "undefined" || typeof html !== "string") return "";
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return (tmp.textContent || tmp.innerText || "").replace(/\s+/g, " ").replace(/\|/g, "").trim();
};

const getFormattedInput = (tc) => {
  if (tc.input !== undefined) return getTextFromHtml(String(tc.input));
  if (Array.isArray(tc.inputs)) {
    return tc.inputs.map((inp) => typeof inp === "object" ? getTextFromHtml(inp.value) : getTextFromHtml(String(inp))).join(", ");
  }
  const { expectedOutput, ...rest } = tc;
  return getTextFromHtml(JSON.stringify(rest));
};

const getStarterCode = (langId) => {
  switch (langId) {
    case 48: return '#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Read from standard input\n    // int input;\n    // if (scanf("%d", &input) == 1) {\n    //     printf("%d\\n", input);\n    // }\n    return 0;\n}';
    case 54: return '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Read from standard input\n    // int input;\n    // if (cin >> input) {\n    //     cout << input << endl;\n    // }\n    return 0;\n}';
    case 51: return 'using System;\n\npublic class Program {\n    public static void Main() {\n        // string input = Console.ReadLine();\n        // Console.WriteLine(input);\n    }\n}';
    case 62: return 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        // if (scanner.hasNextInt()) {\n        //     int input = scanner.nextInt();\n        //     System.out.println(input);\n        // }\n    }\n}';
    case 63: return '/**\n * @param {any} input\n * @return {any}\n */\nvar solution = function(input) {\n    \n};';
    case 71: return 'class Solution:\n    def solution(self, input):\n        pass';
    case 60: return 'package main\nimport "fmt"\n\nfunc main() {\n    // var input int\n    // fmt.Scan(&input)\n    // fmt.Println(input)\n}';
    case 73: return 'use std::io;\n\nfn main() {\n    // let mut input = String::new();\n    // io::stdin().read_line(&mut input).unwrap();\n    // println!("{}", input.trim());\n}';
    case 74: return 'function solution(input: any): any {\n    \n};';
    case 68: return '<?php\n// $input = trim(fgets(STDIN));\n// echo $input . "\\n";\n?>';
    case 72: return '# input = gets.chomp\n# puts input\n';
    case 82: return '# Write your MySQL query statement below\n';
    case 83: return 'import Foundation\n\n// let input = readLine()\n// print(input ?? "")\n';
    case 45: return '; Write your assembly code here\n';
    case 46: return '#!/bin/bash\n\n# read input\n# echo $input\n';
    default: return '// Write your code here\n';
  }
};


export default function Workspace() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get student credentials for profile pic and name
  const studentCreds = useSelector((state) => state.student?.student?.data);

  const qId = searchParams.get("qId");
  const subjectId = searchParams.get("subjectId");
  const title = searchParams.get("title");

  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);

  const titleStr = decodeURIComponent(title || "").toLowerCase().replace(/\|/g, "");

  let defaultLang = LANGUAGE_OPTIONS.find(l => l.editorLang === "javascript") || LANGUAGE_OPTIONS[0]; // JS default
  if (titleStr.includes(" c ") || titleStr.startsWith("c ") || titleStr.startsWith("c,")) defaultLang = LANGUAGE_OPTIONS.find(l => l.editorLang === "c") || defaultLang;
  else if (titleStr.includes("python")) defaultLang = LANGUAGE_OPTIONS.find(l => l.editorLang === "python") || defaultLang;
  else if (titleStr.includes("java") && !titleStr.includes("javascript")) defaultLang = LANGUAGE_OPTIONS.find(l => l.editorLang === "java") || defaultLang;
  else if (titleStr.includes("c++") || titleStr.includes("cpp")) defaultLang = LANGUAGE_OPTIONS.find(l => l.editorLang === "cpp") || defaultLang;

  const [language, setLanguage] = useState(defaultLang);
  const [code, setCode] = useState("");

  // Sync language and code when question changes or on load
  useEffect(() => {
    if (!qId) return;
    let initialLang = defaultLang;
    const lastLangId = localStorage.getItem(`last_lang_${qId}`);
    if (lastLangId) {
      const found = LANGUAGE_OPTIONS.find(l => String(l.id) === lastLangId);
      if (found) initialLang = found;
    }
    setLanguage(initialLang);
    const saved = localStorage.getItem(`saved_code_${qId}_${initialLang.id}`);
    setCode(saved || getStarterCode(initialLang.id));
  }, [qId, defaultLang]);
  const [editorTheme, setEditorTheme] = useState("light");
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  // Auto-save code on change
  useEffect(() => {
    if (qId && language && code) {
      localStorage.setItem(`saved_code_${qId}_${language.id}`, code);
    }
  }, [code, qId, language]);

  // Problem State
  const [activeProblemTab, setActiveProblemTab] = useState("description");
  const [isProblemCollapsed, setIsProblemCollapsed] = useState(false);

  // Console State
  const [activeConsoleTab, setActiveConsoleTab] = useState("testcases");
  const [isConsoleCollapsed, setIsConsoleCollapsed] = useState(false);
  const [isEditorCollapsed, setIsEditorCollapsed] = useState(false);
  
  // Fullscreen State (null | 'problem' | 'editor' | 'console')
  const [maximizedPanel, setMaximizedPanel] = useState(null);
  const [activeTestCaseIdx, setActiveTestCaseIdx] = useState(0);
  
  // Execution State
  // Submissions State
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);

  useEffect(() => {
    if (qId) {
      const stored = JSON.parse(localStorage.getItem("submissions_" + qId) || "[]");
      setSubmissions(stored);
    }
  }, [qId]);

  const formatTimeAgo = (dateStr) => {
    // eslint-disable-next-line react-hooks/purity
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} minutes ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hours ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };

  const [isRunning, setIsRunning] = useState(false);
  const [executionResults, setExecutionResults] = useState(null);
  const [allQuestions, setAllQuestions] = useState([]);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isSuccess) setIsSuccess(false);
  }, [code, qId]);

  useEffect(() => {
    if (!qId && !subjectId) return;
    const fetchQuestion = async () => {
      try {
        const query = subjectId ? `?subjectId=${subjectId}` : ``;
        const res = await axios.get(`${restUrl}/getpracquestions${query}`, {
          headers: { Authorization: `Bearer ${getLstorage("token")}` }
        });
        const fetchedQuestions = res.data?.data || [];
        setAllQuestions(fetchedQuestions);
        
        let found;
        if (qId) {
          found = fetchedQuestions.find((q) => q._id === qId);
        } else {
          // Pick the first unsolved question (or the very first one if all are solved)
          const solved = JSON.parse(localStorage.getItem("solvedProblems") || "[]");
          found = fetchedQuestions.find((q) => !solved.includes(q._id)) || fetchedQuestions[0];
          
          // Update the URL to include this qId gracefully without page reload
          if (found && typeof window !== "undefined") {
            const url = new URL(window.location);
            url.searchParams.set("qId", found._id);
            window.history.replaceState({}, '', url);
          }
        }
        
        if (found) setQuestion(found);
        else message.error("Question not found.");
      } catch (err) {
        message.error("Failed to load question details.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuestion();
  }, [qId, subjectId]);

  const testCases = question?.questionContent?.testCases || [];

  const handleRunCode = async () => {
    if (testCases.length === 0) {
      message.warning("No test cases available for this question.");
      return;
    }
    
    setIsRunning(true);
    setActiveConsoleTab("results");
    
    try {
      const results = [];
      for (let i = 0; i < testCases.length; i++) {
        const currentTest = testCases[i];
        
        // Determine stdin for judge0
        let stdin = "";
        if (currentTest.input !== undefined) {
          stdin = String(currentTest.input).replace(/<\/?[^>]+(>|$)/g, "").replace(/^"|"$/g, '');
        } else if (Array.isArray(currentTest.inputs)) {
          stdin = currentTest.inputs.map(inp => typeof inp === 'object' ? (inp.value || "") : String(inp)).join("\n").replace(/<\/?[^>]+(>|$)/g, "").replace(/^"|"$/g, '');
        } else {
          const { expectedOutput, ...rest } = currentTest;
          stdin = JSON.stringify(rest).replace(/<\/?[^>]+(>|$)/g, "").replace(/^"|"$/g, '');
        }
        
        const wrappedCode = wrapCodeForJudge(language.editorLang, code);
        const result = await executeCode(language.id, wrappedCode, stdin);
        
        // Compare output with expected
        const actualOut = (result.output || "").trim();
        const expectedOut = getTextFromHtml(currentTest.expectedOutput || "").trim().replace(/^"|"$/g, '');
        const passed = result.success && actualOut === expectedOut;
        
        results.push({
          ...result,
          passed,
          actualOut,
          expectedOut,
          stdin
        });
      }
      
      setExecutionResults(results);
      const firstFailedIdx = results.findIndex(r => !r.passed);
      setActiveTestCaseIdx(firstFailedIdx !== -1 ? firstFailedIdx : 0);
      
    } catch (error) {
      message.error(error.message || "Failed to execute code.");
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (testCases.length === 0) {
      message.warning("No test cases available for this question.");
      return;
    }
    
    setIsRunning(true);
    setActiveConsoleTab("results");
    
    try {
      let allPassed = true;
      let failedAt = null;
      let allRunResults = [];

      // Run against all test cases
      for (let i = 0; i < testCases.length; i++) {
        const currentTest = testCases[i];
        
        let stdin = "";
        if (currentTest.input !== undefined) {
          stdin = String(currentTest.input).replace(/<\/?[^>]+(>|$)/g, "").replace(/^"|"$/g, '');
        } else if (Array.isArray(currentTest.inputs)) {
          stdin = currentTest.inputs.map(inp => typeof inp === 'object' ? (inp.value || "") : String(inp)).join("\n").replace(/<\/?[^>]+(>|$)/g, "").replace(/^"|"$/g, '');
        } else {
          const { expectedOutput, ...rest } = currentTest;
          stdin = JSON.stringify(rest).replace(/<\/?[^>]+(>|$)/g, "").replace(/^"|"$/g, '');
        }
        
        const wrappedCode = wrapCodeForJudge(language.editorLang, code);
        const result = await executeCode(language.id, wrappedCode, stdin);
        allRunResults.push(result);
        const actualOut = (result.output || "").trim();
        const expectedOut = getTextFromHtml(currentTest.expectedOutput || "").trim().replace(/^"|"$/g, '');
        const passed = result.success && actualOut === expectedOut;

        if (!passed) {
          allPassed = false;
          failedAt = { i, result, actualOut, expectedOut, stdin };
          break; // Stop at first failure
        }
      }

      if (allPassed) {
        const solved = JSON.parse(localStorage.getItem("solvedProblems") || "[]");
        const previouslySolved = solved.includes(qId);
        
        if (language.id !== defaultLang.id) {
          message.success(`All test cases passed! (Points and progress are only awarded when solved in ${defaultLang.label})`, 5);
        } else if (!previouslySolved) {
          message.success("All test cases passed! Question Solved! You earned 10 SkillCoins! 🎉", 5);
          solved.push(qId);
          localStorage.setItem("solvedProblems", JSON.stringify(solved));
          
          // Save to solvedHistory for Contribution Graph
          const history = JSON.parse(localStorage.getItem("solvedHistory") || "[]");
          const localDateStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local
          history.push({ qId, date: localDateStr });
          localStorage.setItem("solvedHistory", JSON.stringify(history));
          
          // Save to solvedPerSubject for dynamic Progress Ring on subject cards
          if (subjectId) {
            const solvedPerSub = JSON.parse(localStorage.getItem("solvedPerSubject") || "{}");
            solvedPerSub[subjectId] = (solvedPerSub[subjectId] || 0) + 1;
            localStorage.setItem("solvedPerSubject", JSON.stringify(solvedPerSub));
          }
        } else {
          message.success("All test cases passed! (Already solved, no new coins earned)", 3);
        }

        setExecutionResults([{
          passed: true,
          time: "0.012", // Mock fast time for now
          memory: "41.2",
          stdin: "All test cases passed",
          expectedOut: "Success",
          actualOut: "Success"
        }]);
        setIsSuccess(true);
      } else {
        message.error(`Failed at Test Case ${failedAt.i + 1}`, 3);
        setActiveTestCaseIdx(failedAt.i);
        
        const results = [];
        for (let j = 0; j < failedAt.i; j++) results.push({ passed: true });
        results.push({
          ...failedAt.result,
          passed: false,
          actualOut: failedAt.actualOut,
          expectedOut: failedAt.expectedOut,
          stdin: failedAt.stdin
        });
        setExecutionResults(results);
      }
      
      const sumTime = failedAt ? (failedAt.result.time || 0) : allRunResults.reduce((acc, curr) => acc + (parseFloat(curr.time) || 0.004), 0);
      const maxMem = failedAt ? (failedAt.result.memory || 0) : Math.max(...allRunResults.map(curr => parseFloat(curr.memory) || 55900));

      const newSub = {
         id: Date.now(),
         status: allPassed ? "Accepted" : "Wrong Answer",
         language: language.label,
         runtime: `${Math.round(sumTime * 1000)} ms`,
         memory: `${(maxMem / 1024).toFixed(1)} MB`,
         testCasesPassed: allPassed ? `${testCases.length} / ${testCases.length}` : `${failedAt.i} / ${testCases.length}`,
         code: code,
         timestamp: new Date().toISOString(),
      };
      
      const updatedSubs = [newSub, ...submissions];
      setSubmissions(updatedSubs);
      localStorage.setItem("submissions_" + qId, JSON.stringify(updatedSubs));
      
      setActiveProblemTab("submissions");
      setSelectedSubmissionId(null);
      
    } catch (error) {
      message.error(error.message || "Failed to execute code.");
    } finally {
      setIsRunning(false);
    }
  };

  const getDifficultyColor = (diff) => {
    const d = diff?.toLowerCase();
    if (d === "easy") return { bg: "#dcfce7", color: "#166534" };
    if (d === "hard") return { bg: "#fee2e2", color: "#991b1b" };
    return { bg: "#fef3c7", color: "#92400e" };
  };

  if (loading) {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}><Spin size="large" /></div>;
  }

  const diffStyle = getDifficultyColor(question?.difficulty || "Medium");

  const renderEditorHeader = (isCollapsed) => (
    <div className={styles.editorPanelHeader}>
      <div className={styles.headerLeft}>
        <div className={styles.panelTitle}><TbCode color="#4ADE80" size={16} /> Code</div>
        
        {!isCollapsed && (
          <Dropdown 
            open={langDropdownOpen}
            onOpenChange={setLangDropdownOpen}
            dropdownRender={() => (
              <div className={styles.megaMenu}>
                {Array.from({ length: Math.ceil(LANGUAGE_OPTIONS.length / 5) }, (_, i) => LANGUAGE_OPTIONS.slice(i * 5, i * 5 + 5)).map((col, idx) => (
                  <div key={idx} className={styles.megaMenuColumn}>
                    {col.map(l => (
                      <div 
                        key={l.id} 
                        className={`${styles.megaMenuItem} ${language.id === l.id ? styles.active : ''}`}
                        onClick={() => {
                          setLanguage(l);
                          if (qId) localStorage.setItem(`last_lang_${qId}`, String(l.id));
                          const saved = localStorage.getItem(`saved_code_${qId}_${l.id}`);
                          setCode(saved || getStarterCode(l.id));
                          setLangDropdownOpen(false);
                        }}
                      >
                        {l.label}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
            trigger={['click']}
            placement="bottomLeft"
          >
            <div className={styles.langSelectBtn}>
              {language.label} <TbChevronDown size={14} />
            </div>
          </Dropdown>
        )}
        {language.id !== defaultLang.id && (
          <Tooltip title={`Points are only awarded if you solve this problem in ${defaultLang.label}.`}>
            <div style={{ marginLeft: 16, display: 'flex', alignItems: 'center', color: '#F59E0B', cursor: 'help' }}>
              <TbInfoCircle size={16} style={{ marginRight: 4 }} />
              <span style={{ fontSize: 12, fontWeight: 600 }}>No Points Mode</span>
            </div>
          </Tooltip>
        )}
      </div>

      <div className={styles.headerActions}>
        {!isCollapsed && (
          <>
            <button className={styles.iconBtn} onClick={() => setEditorTheme(prev => prev === "light" ? "vs-dark" : "light")}>
              {editorTheme === "light" ? <TbMoon size={18} /> : <TbSun size={18} />}
            </button>
            <button className={styles.iconBtn} onClick={() => setMaximizedPanel(maximizedPanel === 'editor' ? null : 'editor')}>
              {maximizedPanel === 'editor' ? <TbMinimize size={18} /> : <TbMaximize size={18} />}
            </button>
          </>
        )}
        <button className={styles.iconBtn} onClick={() => { setIsEditorCollapsed(!isEditorCollapsed); if (maximizedPanel) setMaximizedPanel(null); }}>
          {isCollapsed ? <TbChevronDown size={18} /> : <TbChevronUp size={18} />}
        </button>
      </div>
    </div>
  );

  const renderConsoleHeader = (isCollapsed) => (
    <div className={styles.consoleHeader}>
      <div className={styles.consoleHeaderLeft}>
        <div 
          className={`${styles.consoleTab} ${activeConsoleTab === "testcases" ? styles.active : ""}`}
          onClick={() => setActiveConsoleTab("testcases")}
        >
          <TbCheck size={16} style={{ marginRight: 6 }} /> Testcase
        </div>
        <div 
          className={`${styles.consoleTab} ${activeConsoleTab === "results" ? styles.active : ""}`}
          onClick={() => setActiveConsoleTab("results")}
        >
          <TbTerminal2 size={16} style={{ marginRight: 6 }} /> Test Result
        </div>
      </div>
      <div className={styles.headerActions}>
        {!isCollapsed && (
          <button className={styles.iconBtn} onClick={() => setMaximizedPanel(maximizedPanel === 'console' ? null : 'console')}>
            {maximizedPanel === 'console' ? <TbMinimize size={18} /> : <TbMaximize size={18} />}
          </button>
        )}
        <button className={styles.iconBtn} onClick={() => { setIsConsoleCollapsed(!isConsoleCollapsed); if (maximizedPanel) setMaximizedPanel(null); }}>
          {isCollapsed ? <TbChevronUp size={18} /> : <TbChevronDown size={18} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className={styles.workspaceContainer}>
      
      {/* Top Navbar */}
      <div className={styles.topNavbar}>
        <div className={styles.navLeft}>
          <button className={styles.backBtn} onClick={() => router.push(`/student/practice-new/coding/problems?subjectId=${subjectId}&title=${title}`)}>
            <TbChevronLeft size={18} /> Problem List
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div style={{ flex: 1, padding: "6px", display: "flex", flexDirection: "column", height: "calc(100vh - 50px)" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "row", gap: "6px", minHeight: 0 }}>
          
          {isProblemCollapsed && maximizedPanel !== 'editor' && maximizedPanel !== 'console' && (
            <div className={styles.collapsedProblemPane}>
              <div className={styles.collapsedProblemTabs}>
                <div 
                  className={`${styles.collapsedProblemTab} ${activeProblemTab === "description" ? styles.active : ""}`}
                  onClick={() => {
                    setActiveProblemTab("description");
                    setIsProblemCollapsed(false);
                  }}
                >
                  <TbFileDescription size={16} />
                  <span className={styles.verticalText}>Description</span>
                </div>
                <div 
                  className={`${styles.collapsedProblemTab} ${activeProblemTab === "submissions" ? styles.active : ""}`}
                  onClick={() => {
                    setActiveProblemTab("submissions");
                    setIsProblemCollapsed(false);
                  }}
                >
                  <TbHistory size={16} />
                  <span className={styles.verticalText}>Submissions</span>
                </div>
              </div>
              <button className={styles.expandProblemBtn} onClick={() => setIsProblemCollapsed(false)}>
                <TbChevronRight size={18} />
              </button>
            </div>
          )}

          <PanelGroup direction="horizontal" orientation="horizontal" style={{ flex: 1 }}>
            
            {!isProblemCollapsed && maximizedPanel !== 'editor' && maximizedPanel !== 'console' && (
              <>
              {/* LEFT PANE: Description */}
              <Panel defaultSize={40} minSize={25} className={styles.panel}>
                <div className={styles.consoleHeader}>
                  <div className={styles.consoleHeaderLeft}>
                    <div 
                      className={`${styles.consoleTab} ${activeProblemTab === "description" ? styles.active : ""}`}
                      onClick={() => setActiveProblemTab("description")}
                    >
                      <TbFileDescription size={16} style={{ marginRight: 6 }} /> Description
                    </div>
                    <div 
                      className={`${styles.consoleTab} ${activeProblemTab === "submissions" ? styles.active : ""}`}
                      onClick={() => setActiveProblemTab("submissions")}
                    >
                      <TbHistory size={16} style={{ marginRight: 6 }} /> Submissions
                    </div>
                  </div>
                  <div className={styles.headerActions}>
                    <button className={styles.iconBtn} onClick={() => setMaximizedPanel(maximizedPanel === 'problem' ? null : 'problem')}>
                      {maximizedPanel === 'problem' ? <TbMinimize size={18} /> : <TbMaximize size={18} />}
                    </button>
                    <button className={styles.iconBtn} onClick={() => setIsProblemCollapsed(true)}>
                      <TbChevronLeft size={18} />
                    </button>
                  </div>
                </div>

                <div className={styles.problemBody}>
                  {activeProblemTab === "description" && (
                    <>
                      <div style={{ marginBottom: 16 }}>
                        <h1 className={styles.problemTitle} style={{ marginTop: 0, fontSize: "24px", fontWeight: "800", color: "#1E293B", lineHeight: 1.3 }}>
                          {getTextFromHtml(question?.questionContent?.question || "Coding Problem")}
                        </h1>
                        
                        <div className={styles.tagsRow} style={{ marginTop: 12 }}>
                          <div 
                            className={styles.difficultyBadge} 
                            style={{ backgroundColor: diffStyle.bg, color: diffStyle.color, padding: "4px 12px", borderRadius: "20px", fontWeight: 700, fontSize: "13px" }}
                          >
                            {(question?.difficulty || "Medium").charAt(0).toUpperCase() + (question?.difficulty || "Medium").slice(1).toLowerCase()}
                          </div>
                          
                          <Tooltip title="This is a future feature!" color="#3B82F6">
                            <div className={styles.tagPill} style={{ cursor: "pointer", padding: "4px 12px", borderRadius: "20px" }}>
                              <TbBulb size={16} /> Hint
                            </div>
                          </Tooltip>
                        </div>
                      </div>

                      <div 
                        className={styles.problemText}
                        dangerouslySetInnerHTML={{
                          __html: parseIfJson(question?.questionContent?.question || "<p>No description provided.</p>")
                        }}
                      />

                      {testCases?.length > 0 && (
                        <div className={styles.examplesSection}>
                          {testCases.slice(0, 3).map((tc, idx) => (
                            <div key={idx} className={styles.exampleBlockWrapper}>
                              <p className={styles.exampleTitle}><strong>Example {idx + 1}:</strong></p>
                              <div className={styles.exampleBlock}>
                                <span className={styles.exampleLabel}>Input:</span> <span className={styles.exampleCode}>{getFormattedInput(tc)}</span><br />
                                <span className={styles.exampleLabel}>Output:</span> <span className={styles.exampleCode}>{getTextFromHtml(tc.expectedOutput)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {activeProblemTab === "submissions" && (
                    <div className={styles.submissionsContainer}>
                      {!selectedSubmissionId ? (
                        <div className={styles.submissionsList}>
                          <div className={styles.submissionHeaderRow}>
                            <div style={{ flex: 1.5 }}>Status</div>
                            <div style={{ flex: 1 }}>Language</div>
                            <div style={{ flex: 1 }}>Runtime</div>
                            <div style={{ flex: 1 }}>Memory</div>
                          </div>
                          {submissions.map(sub => (
                            <div key={sub.id} className={styles.submissionRow} onClick={() => setSelectedSubmissionId(sub.id)}>
                              <div style={{ flex: 1.5 }}>
                                <div className={sub.status === "Accepted" ? styles.successText : styles.errorText}>{sub.status}</div>
                                <div className={styles.subTime}>{formatTimeAgo(sub.timestamp)}</div>
                              </div>
                              <div style={{ flex: 1 }}>
                                <span className={styles.langPill}>{sub.language.split(' ')[0]}</span>
                              </div>
                              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '4px', color: '#475569' }}>
                                <TbClock size={16} /> <span>{sub.runtime}</span>
                              </div>
                              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '4px', color: '#475569' }}>
                                <TbCpu size={16} /> <span>{sub.memory}</span>
                              </div>
                            </div>
                          ))}
                          {submissions.length === 0 && <Empty description="No submissions yet" style={{ marginTop: 40 }} />}
                        </div>
                      ) : (
                        (() => {
                          const sub = submissions.find(s => s.id === selectedSubmissionId);
                          if (!sub) return null;
                          return (
                            <div className={styles.submissionDetails}>
                              <button className={styles.backBtn} onClick={() => setSelectedSubmissionId(null)} style={{ marginBottom: 16 }}>
                                <TbChevronLeft size={16} /> All Submissions
                              </button>
                              
                              <div className={styles.subDetailHeader}>
                                <div className={styles.subDetailTitleRow}>
                                  <h2 className={sub.status === "Accepted" ? styles.successText : styles.errorText} style={{ margin: 0, fontSize: 24, borderBottom: 'none' }}>
                                    {sub.status} 
                                  </h2>
                                  <span className={styles.testCasesPassed}>{sub.testCasesPassed || "3 / 3"} testcases passed</span>
                                </div>
                                <div className={styles.subAuthor}>
                                  {studentCreds?.profile ? (
                                    <img src={studentCreds.profile} alt="profile" style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }} />
                                  ) : (
                                    <TbUserCircle size={20} />
                                  )}
                                  <span style={{ fontWeight: 500, color: '#334155' }}>{studentCreds?.firstName || studentCreds?.userName || "You"}</span> 
                                  <span style={{ color: '#64748B' }}>
                                    submitted at {(() => {
                                      const d = new Date(sub.timestamp);
                                      const pad = (n) => n.toString().padStart(2, '0');
                                      return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
                                    })()}
                                  </span>
                                </div>
                              </div>

                              <div className={styles.statsGraphBox}>
                                <div className={styles.statCardsRow}>
                                  <div className={styles.statCard}>
                                    <div className={styles.statCardTitle}><TbClock size={16} /> Runtime</div>
                                    <div className={styles.statCardValue}>
                                      {sub.runtime} 
                                      <span className={styles.beatsText}>
                                        Beats 53.20%
                                        <Tooltip title="This 'Beats %' is currently a mocked placeholder in the UI. Historical data across all users is not yet tracked.">
                                          <TbInfoCircle size={14} style={{ marginLeft: 4, cursor: 'help', color: '#94A3B8' }} />
                                        </Tooltip>
                                      </span>
                                    </div>
                                  </div>
                                  <div className={styles.statCard}>
                                    <div className={styles.statCardTitle}><TbCpu size={16} /> Memory</div>
                                    <div className={styles.statCardValue}>
                                      {sub.memory} 
                                      <span className={styles.beatsText}>
                                        Beats 20.02%
                                        <Tooltip title="This 'Beats %' is currently a mocked placeholder in the UI. Historical data across all users is not yet tracked.">
                                          <TbInfoCircle size={14} style={{ marginLeft: 4, cursor: 'help', color: '#94A3B8' }} />
                                        </Tooltip>
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className={styles.mockGraphContainer} style={{ position: 'relative' }}>
                                  <Tooltip title="This distribution graph is currently a visual mock. Real bell curves require historical submission data from thousands of users which is not yet available.">
                                    <TbInfoCircle size={16} style={{ position: 'absolute', top: -8, right: 0, cursor: 'help', color: '#94A3B8', zIndex: 10 }} />
                                  </Tooltip>
                                  <div className={styles.graphAxis}>
                                    <span>60%</span>
                                    <span>40%</span>
                                    <span>20%</span>
                                    <span>0%</span>
                                  </div>
                                  <div className={styles.graphBarsArea}>
                                    {/* Create 50 mock bars representing the distribution */}
                                    {Array.from({ length: 50 }).map((_, i) => {
                                      // Mock realistic-looking bell curve distribution
                                      let height = Math.max(2, 50 * Math.exp(-Math.pow(i - 15, 2) / 30) + (Math.random() * 5));
                                      if (i === 1) height = 70; // Big spike at the beginning like in image
                                      
                                      const isUserScore = i === 4; // Mock user's position
                                      
                                      return (
                                        <div key={i} className={`${styles.graphBar} ${isUserScore ? styles.userBar : ''}`} style={{ height: `${height}px` }}>
                                          {isUserScore && (
                                            <div className={styles.userAvatarIndicator}>
                                              {studentCreds?.profile ? (
                                                <img src={studentCreds.profile} alt="profile" style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }} />
                                              ) : (
                                                <TbUserCircle size={20} color="#3B82F6" />
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                  <div className={styles.graphXAxis}>
                                    <span>12ms</span>
                                    <span>24ms</span>
                                    <span>36ms</span>
                                    <span>48ms</span>
                                    <span>60ms</span>
                                    <span>72ms</span>
                                    <span>84ms</span>
                                  </div>
                                </div>
                              </div>

                              <div className={styles.subCodeSection}>
                                <div className={styles.subCodeHeader}>Code | {sub.language.split(' ')[0]}</div>
                                <div className={styles.subCodeWrapper} style={{ paddingTop: 16 }}>
                                  <Editor
                                    language={sub.language.toLowerCase().includes('java') ? (sub.language.toLowerCase().includes('javascript') ? 'javascript' : 'java') : sub.language.toLowerCase().includes('python') ? 'python' : 'javascript'}
                                    theme={editorTheme}
                                    value={sub.code}
                                    options={{ readOnly: true, minimap: { enabled: false }, fontSize: 14 }}
                                    height="300px"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })()
                      )}
                    </div>
                  )}
                </div>
              </Panel>

              <PanelResizeHandle className={styles.resizeHandle}>
                <div className={styles.resizeHandleVertical} />
              </PanelResizeHandle>
            </>
          )}

          {/* RIGHT PANES */}
          {maximizedPanel !== 'problem' && (
            <Panel defaultSize={60} minSize={30} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            
            {isEditorCollapsed && maximizedPanel !== 'console' && (
              <div className={styles.panel} style={{ flexShrink: 0, marginBottom: 8, height: 'max-content' }}>
                {renderEditorHeader(true)}
              </div>
            )}

            <PanelGroup direction="vertical" orientation="vertical" style={{ flex: 1 }}>
              
              {!isEditorCollapsed && maximizedPanel !== 'console' && (
                <>
                  {/* TOP RIGHT: Editor */}
                  <Panel defaultSize={isConsoleCollapsed ? 100 : 60} minSize={20} className={styles.panel}>
                    <div className={styles.innerPanel}>
                      {renderEditorHeader(false)}
                      <div className={styles.editorBody}>
                        <Editor
                          language={language.editorLang}
                          theme={editorTheme}
                          value={code}
                          onChange={(val) => setCode(val)}
                          options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            lineHeight: 24,
                            padding: { top: 16 },
                            scrollBeyondLastLine: false,
                          }}
                        />
                      </div>
                    </div>
                  </Panel>

                  {!isConsoleCollapsed && maximizedPanel !== 'editor' && (
                    <PanelResizeHandle className={styles.resizeHandle}>
                      <div className={styles.resizeHandleHorizontal} />
                    </PanelResizeHandle>
                  )}
                </>
              )}

              {/* BOTTOM RIGHT: Console */}
              {!isConsoleCollapsed && maximizedPanel !== 'editor' && (
                <Panel 
                  defaultSize={isEditorCollapsed ? 100 : 40} 
                  minSize={20} 
                  className={styles.panel}
                >
                  {renderConsoleHeader(false)}

                  <div className={styles.consoleBody}>
                  {activeConsoleTab === "testcases" && (
                    <div>
                      <div className={styles.testCasePills}>
                        {testCases.map((tc, idx) => (
                          <div 
                            key={idx}
                            className={`${styles.testCasePill} ${activeTestCaseIdx === idx ? styles.active : ""}`}
                            onClick={() => setActiveTestCaseIdx(idx)}
                          >
                            Case {idx + 1}
                          </div>
                        ))}
                      </div>
                      
                      {testCases[activeTestCaseIdx] && (
                        <div>
                          <div className={styles.testCaseLabel}>Inputs:</div>
                          <div className={styles.testCaseInputBlock}>
                            <div className={styles.testCaseValue}>{getFormattedInput(testCases[activeTestCaseIdx])}</div>
                          </div>
                          
                          <div className={styles.testCaseLabel}>Expected Output:</div>
                          <div className={styles.testCaseInputBlock}>
                            <div className={styles.testCaseValue}>{getTextFromHtml(testCases[activeTestCaseIdx].expectedOutput)}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeConsoleTab === "results" && (
                    <div>
                      {isRunning ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100px", color: "#64748B" }}>
                          <Spin size="large" />
                          <div style={{ marginTop: 12 }}>Running code...</div>
                        </div>
                      ) : executionResults && executionResults.length > 0 ? (
                        <div>
                          <div style={{ display: "flex", alignItems: "baseline", gap: "16px", marginBottom: "16px" }}>
                            <h2 className={`${styles.resultHeader} ${executionResults.every(r => r.passed) ? styles.success : styles.error}`} style={{ margin: 0 }}>
                              {executionResults.every(r => r.passed) ? "Accepted" : "Wrong Answer"}
                            </h2>
                            {executionResults[activeTestCaseIdx] && (
                              <div style={{ color: "#64748B", fontSize: "13px", display: "flex", gap: "16px" }}>
                                <span>Runtime: {executionResults[activeTestCaseIdx].time || "0"} s</span>
                                <span>Memory: {executionResults[activeTestCaseIdx].memory || "0"} KB</span>
                              </div>
                            )}
                          </div>

                          {executionResults.length > 0 && (
                            <div className={styles.testCaseBlocks} style={{ marginBottom: 16 }}>
                              {executionResults.map((res, idx) => (
                                <div 
                                  key={idx}
                                  className={`${styles.testCaseBlock} ${activeTestCaseIdx === idx ? styles.active : ""}`}
                                  onClick={() => setActiveTestCaseIdx(idx)}
                                >
                                  {res.passed ? <TbCheck color="#22C55E" size={16} /> : <TbX color="#EF4444" size={16} />}
                                  <div className={styles.caseText}>Case {idx + 1}</div>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {executionResults[activeTestCaseIdx] && (
                            <>
                              <div className={styles.testCaseLabel}>Input:</div>
                              <div className={styles.testCaseInputBlock}>
                                <div className={styles.testCaseValue}>{executionResults[activeTestCaseIdx].stdin}</div>
                              </div>
                              
                              <div className={styles.testCaseLabel}>Expected Output:</div>
                              <div className={styles.testCaseInputBlock}>
                                <div className={styles.testCaseValue}>{executionResults[activeTestCaseIdx].expectedOut}</div>
                              </div>
                              
                              <div className={styles.testCaseLabel}>Your Output:</div>
                              <div className={styles.testCaseInputBlock}>
                                <div className={`${styles.testCaseValue} ${!executionResults[activeTestCaseIdx].passed ? styles.errorText : ""}`}>
                                  {executionResults[activeTestCaseIdx].actualOut || "null"}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <div style={{ color: "#94A3B8", textAlign: "center", marginTop: 40 }}>
                          Run your code to see results here.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className={styles.actionBar}>
                  <div></div>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <button className={styles.runBtn} onClick={handleRunCode} disabled={isRunning}>
                      <TbPlayerPlay size={18} /> Run Code
                    </button>
                    {!isSuccess ? (
                      <button className={styles.submitBtn} disabled={isRunning} onClick={handleSubmit}>
                        <TbCode size={18} /> Submit
                      </button>
                    ) : (
                      <button 
                        className={styles.submitBtn} 
                        style={{ backgroundColor: '#10B981', color: '#fff', borderColor: '#10B981' }}
                        disabled={isRunning} 
                        onClick={() => {
                          const currentIdx = allQuestions.findIndex(q => q._id === qId);
                          if (currentIdx !== -1 && currentIdx < allQuestions.length - 1) {
                            const nextQ = allQuestions[currentIdx + 1];
                            const url = new URL(window.location);
                            url.searchParams.set("qId", nextQ._id);
                            url.searchParams.set("title", nextQ.questionContent?.title || "");
                            router.push(url.pathname + url.search);
                          } else {
                            message.success("You have completed all questions in this set!");
                            router.push('/student/practice-new/coding');
                          }
                        }}
                      >
                        Next <TbChevronRight size={18} />
                      </button>
                    )}
                  </div>
                </div>
                </Panel>
              )}
            </PanelGroup>
          </Panel>
          )}
        </PanelGroup>
        </div>

        {isConsoleCollapsed && maximizedPanel !== 'editor' && (
          <div className={styles.panel} style={{ flexShrink: 0, marginTop: 8, height: 'max-content' }}>
            {renderConsoleHeader(true)}
          </div>
        )}
      </div>

    </div>
  );
}
