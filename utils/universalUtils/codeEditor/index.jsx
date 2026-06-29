// Playground / index.jsx
"use client";
import "./play.css";
import React, { useEffect, useState } from "react";
import EditorContainer from "./EditorContainer";
import playGroundStyles from "./page.module.scss";
import axios from "axios";
import { message, Spin } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { languageList } from "./context/PlaygroundContext";
import { aiUrl } from "../urls";
import {
  addOutput,
  aiSuggestions as AIsuggestion,
} from "@/redux/slices/codeEditor";
import { getLstorage, getSstorage, setSstorage } from "../windowMW";

// ─── API Keys ─────────────────────────────────────────────────────────────────
const apis = {
  ks: "7aeb8e5c51msh18112baa8b7c300p18ab0ajsn09826bf33308",
  te: "10781cb80bmsh46e2798d6a46332p19663ejsn5557d9fa34d1",
  vs: "77c854fb76mshe24f3243106be66p11a6bajsn7c9921a96d7e",
  mi: "0384295621msheb61f4751e1b41ap10acc0jsn96fa40b5dc6d",
};

const BASE_URL = "https://judge0-ce.p.rapidapi.com";

// ─── Session Storage ──────────────────────────────────────────────────────────
const storeCodingQuestion = (rawData) => {
  try {
    const stored = getSstorage("codingQuestions");
    const existing = stored ? JSON.parse(stored) : [];
    const index = existing.findIndex((q) => q.questionId === rawData.questionId);
    if (index !== -1) existing[index] = { ...existing[index], ...rawData };
    else existing.push(rawData);
    setSstorage("codingQuestions", JSON.stringify(existing));
  } catch { /* ignore */ }
};

const loadEntry = (qid) => {
  try {
    const raw = getSstorage("codingQuestions");
    return (raw ? JSON.parse(raw) : []).find((e) => e.questionId === qid) || null;
  } catch { return null; }
};

// ─── FIX: native atob/btoa (Buffer polyfill silently fails in Next.js) ────────
const encode = (str) => {
  if (!str) return "";
  try {
    return btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
        String.fromCharCode(parseInt(p1, 16))
      )
    );
  } catch {
    return btoa(unescape(encodeURIComponent(str)));
  }
};

const decode = (str) => {
  if (!str) return "";
  try {
    return decodeURIComponent(
      atob(str).split("").map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0")).join("")
    );
  } catch {
    try { return atob(str); } catch { return str; }
  }
};

// ─── Judge0 helpers ───────────────────────────────────────────────────────────
const postSubmission = async (language_id, source_code, stdin) => {
  const res = await axios.request({
    method: "POST",
    url: `${BASE_URL}/submissions/`,
    params: { base64_encoded: "true", fields: "*" },
    headers: {
      "Content-Type": "application/json",
      "X-Auth-Token": "e05dac791e06052efacb1f9132323070",
      "X-RapidAPI-Key": apis.mi,
      "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
    },
    data: { language_id, source_code, stdin },
  });
  return res.data.token;
};

const pollResult = async (token) => {
  const opts = {
    method: "GET",
    url: `${BASE_URL}/submissions/${token}`,
    params: { base64_encoded: "true", fields: "*" },
    headers: {
      "X-Auth-Token": "e05dac791e06052efacb1f9132323070",
      "X-RapidAPI-Key": apis.mi,
      "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
    },
  };
  for (let i = 0; i < 15; i++) {
    const res = await axios.request(opts);
    const sid = res.data?.status?.id ?? res.data?.status_id;
    if (sid > 2) return res.data;
    await new Promise((r) => setTimeout(r, 1000));
  }
  return { status: { id: -1, description: "Timed out" }, stdout: "", stderr: "Execution timed out.", compile_output: "" };
};

// Returns { output, statusId, statusName, success }
const executeCode = async (language_id, code, stdin) => {
  const token = await postSubmission(language_id, encode(code), encode(stdin));
  if (!token) throw new Error("No submission token returned");
  const res = await pollResult(token);
  const statusId = res?.status?.id ?? res?.status_id;
  const statusName = res?.status?.description || "Unknown";
  const stdout = decode(res.stdout || "");
  const compileOut = decode(res.compile_output || "");
  const stderr = decode(res.stderr || "");
  let output = "";
  if (statusId === 3) output = stdout || "(no output)";
  else if (statusId === 6) output = compileOut || "Compilation error";
  else if (statusId === 5) output = "Time Limit Exceeded";
  else output = stderr || compileOut || stdout || "Unknown error";
  return { output, statusId, statusName, success: statusId === 3 };
};

// ─── Component ────────────────────────────────────────────────────────────────
const Playground = ({ questionData, onTestResults }) => {
  const dispatch = useDispatch();
  const aiSuggestions = useSelector((state) => state.codeEditor.aiSuggestions) || [];

  const defaultLanguage = languageList?.find((e) => e?.id === 63); // JavaScript default

  const [languageKey, setLanguageKey] = useState(() => defaultLanguage);
  const [currentCode, setCurrentCode] = useState(() => defaultLanguage?.defaultCode ?? "");
  const [currentInput, setCurrentInput] = useState("");
  const [currentOutput, setCurrentOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [drawerTab, setDrawerTab] = useState("output");
  const [testCaseResults, setTestCaseResults] = useState([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const questionStr = JSON.stringify(questionData?.questionContent?.testCases);

  // ── AI suggestions ────────────────────────────────────────────────────────
  const getAiSugg = async () => {
    try {
      const { data } = await axios.post(
        aiUrl + "/testCases",
        { code: currentCode, question: questionStr, userType: "student" },
        { headers: { Authorization: `Bearer ${getLstorage("token")}` } }
      );
      dispatch(AIsuggestion(data));
      return data;
    } catch {
      return aiSuggestions;
    }
  };

  // ── Run single (Output tab) ───────────────────────────────────────────────
  const runCode = async () => {
    setDrawerTab("output");
    setCurrentOutput("");
    setIsLoading(true);
    const hide = message.loading("Running your code...", 0);
    try {
      const language_id = languageKey?.id;
      if (!language_id) throw new Error("No language selected");

      const [result, aiData] = await Promise.all([
        executeCode(language_id, currentCode, currentInput),
        getAiSugg(),
      ]);

      setCurrentOutput(`Status: ${result.statusName}\n\n${result.output}`);
      result.success
        ? message.success("Code executed successfully!", 2)
        : message.error(`Execution failed: ${result.statusName}`, 3);

      storeCodingQuestion({
        questionId: questionData?._id,
        aisuggestion: aiData || aiSuggestions,
        language_id,
        languageKey,
        code: currentCode,
      });
    } catch (err) {
      const msg = err.message || "Something went wrong";
      message.error(msg);
      setCurrentOutput(`Error: ${msg}`);
    } finally {
      hide();
      setIsLoading(false);
    }
  };

  // ── Run all test cases (Test Results tab) ────────────────────────────────
  const runTestCases = async () => {
    const tcs = questionData?.questionContent?.testCases || [];
    if (!tcs.length) { message.warning("No test cases found"); return; }
    const language_id = languageKey?.id;
    if (!language_id) { message.error("No language selected"); return; }

    setDrawerTab("results");
    setIsRunningTests(true);
    setIsLoading(true);

    const initial = tcs.map((tc, i) => ({
      index: i,
      input: tc.input || "",
      expectedOutput: tc.expectedOutput || "",
      actualOutput: "",
      status: "running",
    }));
    setTestCaseResults(initial);
    // Notify parent: all running
    onTestResults?.(initial.map((r) => ({ index: r.index, status: "running" })));

    const hide = message.loading("Running test cases...", 0);
    let passed = 0;
    const finalResults = [...initial];

    try {
      for (let i = 0; i < tcs.length; i++) {
        const tc = tcs[i];
        try {
          const result = await executeCode(language_id, currentCode, tc.input || "");
          const actual = result.output.trim();
          const expected = (tc.expectedOutput || "").trim();
          const ok = result.success && actual === expected;
          if (ok) passed++;

          const status = result.success ? (ok ? "passed" : "failed") : "error";
          finalResults[i] = { ...finalResults[i], actualOutput: result.output, status };

          setTestCaseResults((prev) =>
            prev.map((r) => r.index === i ? { ...r, actualOutput: result.output, status } : r)
          );
          // Update parent question panel status per test case
          onTestResults?.(finalResults.map((r) => ({ index: r.index, status: r.status })));
        } catch (err) {
          finalResults[i] = { ...finalResults[i], actualOutput: `Error: ${err.message}`, status: "error" };
          setTestCaseResults((prev) =>
            prev.map((r) => r.index === i ? { ...r, actualOutput: `Error: ${err.message}`, status: "error" } : r)
          );
          onTestResults?.(finalResults.map((r) => ({ index: r.index, status: r.status })));
        }
      }

      passed === tcs.length
        ? message.success(`All ${passed} test cases passed! 🎉`, 3)
        : message.warning(`${passed}/${tcs.length} test cases passed`, 3);
    } finally {
      hide();
      setIsRunningTests(false);
      setIsLoading(false);
    }
  };

  // ── Hydrate when question changes ─────────────────────────────────────────
  useEffect(() => {
    const entry = loadEntry(questionData?._id);
    if (entry) {
      if (entry.code != null) setCurrentCode(entry.code);
      if (entry.languageKey) setLanguageKey(entry.languageKey);
      if (entry.aisuggestion) dispatch(AIsuggestion(entry.aisuggestion));
    } else {
      setCurrentCode(defaultLanguage?.defaultCode ?? "");
      setLanguageKey(defaultLanguage);
      dispatch(AIsuggestion([]));
    }
    setCurrentInput("");
    setCurrentOutput("");
    setTestCaseResults([]);
  }, [questionData?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync output to Redux ──────────────────────────────────────────────────
  useEffect(() => {
    if (currentOutput) dispatch(addOutput(currentOutput));
  }, [currentOutput, dispatch]);

  const handleReset = () => {
    setCurrentCode(languageKey?.defaultCode ?? "");
    setCurrentOutput("");
    setTestCaseResults([]);
    dispatch(AIsuggestion([]));
  };

  const handleLanguageChange = (langObj) => {
    setLanguageKey(langObj);
    setCurrentCode(langObj?.defaultCode ?? "");
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className={playGroundStyles.editorPanel}>
      <EditorContainer
        currentLanguage={languageKey}
        setCurrentLanguage={handleLanguageChange}
        currentCode={currentCode}
        setCurrentCode={setCurrentCode}
        runCode={runCode}
        languageId={languageKey?.id}
        onReset={handleReset}
      />

      <div className={playGroundStyles.outputPanel}>
        {/* Tabs row */}
        <div className={playGroundStyles.outputTabs}>
          {[
            { key: "output", label: "Output" },
            {
              key: "results",
              label: (
                <>
                  Test Results
                  {testCaseResults.length > 0 && (
                    <span
                      style={{
                        marginLeft: 6,
                        fontSize: 10,
                        background: testCaseResults.every((r) => r.status === "passed") ? "#1a4731" : "#4a1f1f",
                        color: testCaseResults.every((r) => r.status === "passed") ? "#3fb950" : "#f85149",
                        borderRadius: 8,
                        padding: "1px 6px",
                        fontWeight: 700,
                      }}
                    >
                      {testCaseResults.filter((r) => r.status === "passed").length}/{testCaseResults.length}
                    </span>
                  )}
                </>
              ),
            },
            { key: "console", label: "Console" },
          ].map(({ key, label }) => (
            <div
              key={key}
              className={`${playGroundStyles.outTab} ${drawerTab === key ? playGroundStyles.outTabActive : ""}`}
              onClick={() => setDrawerTab(key)}
            >
              {label}
            </div>
          ))}

          {/* Run Tests button */}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", paddingRight: 12 }}>
            <button
              onClick={runTestCases}
              disabled={isRunningTests || isLoading}
              style={{
                fontSize: 11,
                padding: "3px 10px",
                background: isRunningTests ? "#21262d" : "#1f6feb",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                cursor: isRunningTests ? "not-allowed" : "pointer",
                fontWeight: 600,
                opacity: isRunningTests ? 0.6 : 1,
              }}
            >
              {isRunningTests ? "Running..." : "▶ Run Tests"}
            </button>
          </div>
        </div>

        {/* Body */}
        <div className={playGroundStyles.outputBody}>
          {isLoading && drawerTab !== "results" ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", flexDirection: "column", color: "#8b949e" }}>
              <Spin size="large" />
              <div style={{ marginTop: 14, fontWeight: 500, fontSize: 13 }}>Running your code...</div>
            </div>
          ) : (
            <>
              {/* OUTPUT */}
              {drawerTab === "output" && (
                <pre
                  className={`${playGroundStyles.outLine} ${
                    currentOutput.startsWith("Error") || currentOutput.includes("failed")
                      ? playGroundStyles.outLineError
                      : currentOutput.startsWith("Status: Accepted")
                      ? playGroundStyles.outLineSuccess
                      : ""
                  }`}
                >
                  {currentOutput || "Run code to see output..."}
                </pre>
              )}

              {/* TEST RESULTS */}
              {drawerTab === "results" && (
                <div>
                  {isRunningTests && (
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12, color: "#8b949e", fontSize: 12 }}>
                      <Spin size="small" /> Running test cases...
                    </div>
                  )}
                  {testCaseResults.length === 0 && !isRunningTests && (
                    <div className={playGroundStyles.outPlaceholder}>
                      <i>ℹ️</i> Click &quot;▶ Run Tests&quot; to evaluate all test cases.
                    </div>
                  )}
                  <div className={playGroundStyles.tcDetail}>
                    {testCaseResults.map((tc, i) => {
                      const isPassed = tc.status === "passed";
                      const isFailed = tc.status === "failed";
                      const isError = tc.status === "error";
                      const isRunning = tc.status === "running";
                      return (
                        <div
                          key={i}
                          className={`${playGroundStyles.tcDetailItem} ${
                            isPassed ? playGroundStyles.tcDetailItemPass
                            : (isFailed || isError) ? playGroundStyles.tcDetailItemFail
                            : ""
                          }`}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: "#c9d1d9" }}>
                              {isRunning ? "⏳" : isPassed ? "✅" : isError ? "⚠️" : "❌"} Test Case {i + 1}
                            </span>
                            <span style={{ fontSize: 10, fontWeight: 700, color: isPassed ? "#3fb950" : isRunning ? "#8b949e" : "#f85149" }}>
                              {isRunning ? "Running..." : isPassed ? "PASSED" : isError ? "ERROR" : isFailed ? "FAILED" : "PENDING"}
                            </span>
                          </div>
                          {tc.input && (
                            <div style={{ marginBottom: 4 }}>
                              <span style={{ fontSize: 10, color: "#8b949e", fontWeight: 600 }}>INPUT: </span>
                              <code style={{ fontSize: 11, color: "#c9d1d9" }}>{tc.input}</code>
                            </div>
                          )}
                          {tc.expectedOutput && (
                            <div style={{ marginBottom: 4 }}>
                              <span style={{ fontSize: 10, color: "#8b949e", fontWeight: 600 }}>EXPECTED: </span>
                              <code style={{ fontSize: 11, color: "#3fb950" }}>{tc.expectedOutput}</code>
                            </div>
                          )}
                          {tc.actualOutput && (
                            <div>
                              <span style={{ fontSize: 10, color: "#8b949e", fontWeight: 600 }}>GOT: </span>
                              <code style={{ fontSize: 11, color: isPassed ? "#3fb950" : "#f85149" }}>{tc.actualOutput}</code>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CONSOLE */}
              {drawerTab === "console" && (
                <pre className={playGroundStyles.outLine}>
                  {currentOutput || "Console is empty."}
                </pre>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Playground;