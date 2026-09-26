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
  setTestCaseResults as setReduxTestCaseResults,
  resetTestCaseResults,
  clearRunTestsRequest,
} from "@/redux/slices/codeEditor";
import { getLstorage, getSstorage, setSstorage, cleanTestCaseText } from "../windowMW";
import { executeCode } from "@/utils/judge0";


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

  const triggerRunTests = useSelector((state) => state.codeEditor.triggerRunTests);

  // Sync testCaseResults to Redux
  useEffect(() => {
    if (typeof setReduxTestCaseResults === "function") {
      dispatch(setReduxTestCaseResults(testCaseResults));
    }
  }, [testCaseResults, dispatch]);

  // Run tests on trigger
  useEffect(() => {
    if (triggerRunTests) {
      runTestCases();
      dispatch(clearRunTestsRequest());
    }
  }, [triggerRunTests, dispatch]);

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
  async function runTestCases() {
    const tcs = questionData?.questionContent?.testCases || [];
    if (!tcs.length) { message.warning("No test cases found"); return; }
    const language_id = languageKey?.id;
    if (!language_id) { message.error("No language selected"); return; }

    setDrawerTab("results");
    setIsRunningTests(true);
    setIsLoading(true);

    const initial = tcs.map((tc, i) => ({
      index: i,
      input: cleanTestCaseText(tc.input || ""),
      expectedOutput: cleanTestCaseText(tc.expectedOutput || ""),
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
          const rawInput = cleanTestCaseText(tc.input || "");
          const rawExpected = cleanTestCaseText(tc.expectedOutput || "");
          const result = await executeCode(language_id, currentCode, rawInput);
          const actual = result.output.trim();
          const expected = rawExpected.trim();
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

      storeCodingQuestion({
        questionId: questionData?._id,
        language_id,
        languageKey,
        code: currentCode,
        testCaseResults: finalResults,
      });
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
      if (entry.testCaseResults) {
        setTestCaseResults(entry.testCaseResults);
      } else {
        setTestCaseResults([]);
      }
    } else {
      setCurrentCode(defaultLanguage?.defaultCode ?? "");
      setLanguageKey(defaultLanguage);
      dispatch(AIsuggestion([]));
      setTestCaseResults([]);
    }
    setCurrentInput("");
    setCurrentOutput("");
    dispatch(resetTestCaseResults());
  }, [questionData?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync output to Redux ──────────────────────────────────────────────────
  useEffect(() => {
    if (currentOutput) dispatch(addOutput(currentOutput));
  }, [currentOutput, dispatch]);

  const handleReset = () => {
    setCurrentCode(languageKey?.defaultCode ?? "");
    setCurrentOutput("");
    setTestCaseResults([]);
    dispatch(resetTestCaseResults());
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
                              <code style={{ fontSize: 11, color: "#c9d1d9" }}>{cleanTestCaseText(tc.input)}</code>
                            </div>
                          )}
                          {tc.expectedOutput && (
                            <div style={{ marginBottom: 4 }}>
                              <span style={{ fontSize: 10, color: "#8b949e", fontWeight: 600 }}>EXPECTED: </span>
                              <code style={{ fontSize: 11, color: "#3fb950" }}>{cleanTestCaseText(tc.expectedOutput)}</code>
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