// Playground.jsx
"use client";

import React, { useEffect, useState } from "react";
import EditorContainer from "./EditorContainer";
import OutputConsole from "./OutputConsole";
import playGroundStyles from "./play.module.scss";
import { Buffer } from "buffer";
import axios from "axios";
import { message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { languageList } from "./context/PlaygroundContext";
import {
  addOutput,
  aiSuggestions as AIsuggestion,
} from "@/app/testportal/redux/slices/codeEditor";
import { aiUrl } from "../urls";
import { getSstorage, setSstorage } from "../storageMiddleware";
import { executeCode } from "@/utils/judge0";

// Store per-question data in sessionStorage
const storeCodingQuestion = (rawData) => {
  try {
    const stored = getSstorage("codingQuestions");
    const existing = stored ? JSON.parse(stored) : [];
    const index = existing.findIndex(
      (q) => q.questionId === rawData.questionId
    );
    if (index !== -1) {
      existing[index] = { ...existing[index], ...rawData };
    } else {
      existing.push(rawData);
    }
    setSstorage("codingQuestions", JSON.stringify(existing));
    return existing;
  } catch {
    return [];
  }
};

const loadEntry = (qid) => {
  try {
    const raw = getSstorage("codingQuestions");
    const arr = raw ? JSON.parse(raw) : [];
    return arr.find((e) => e.questionId === qid) || null;
  } catch {
    return null;
  }
};

const Playground = ({ questionData }) => {
  const aiSuggestions =
    useSelector((state) => state.codeEditor.aiSuggestions) || [];

  const question = JSON.stringify(questionData?.questionContent?.testCases);

  // Use full language object as the source of truth
  const defaultLanguage = languageList?.find((e) => e?.id === 63);

  const [languageId, setLanguageId] = useState(() => defaultLanguage?.id);
  const [languageKey, setLanguageKey] = useState(() => defaultLanguage);
  const [currentCode, setCurrentCode] = useState(
    () => defaultLanguage?.defaultCode
  );
  const [currentInput, setCurrentInput] = useState("");
  const [currentOutput, setCurrentOutput] = useState("");

  const dispatch = useDispatch();

  // Get AI suggestions
  const getAiSugg = async () => {
    try {
      const { data } = await axios.post(aiUrl + "/testCases", {
        code: currentCode,
        question,
      });
      dispatch(AIsuggestion(data));
      return data;
    } catch (error) {
      console.error("AI suggestion error:", error);
      return aiSuggestions;
    }
  };

  // Main function to run code with stdin
  const runCode = async () => {
    const hideMessage = message.loading("Running your code...", 0);

    try {
      // Use the id directly from the selected language object
      const language_id = languageKey?.id;
      if (!language_id) throw new Error("Unsupported language selected");

      const aiPromise = getAiSugg();
      const [execResult, aiData] = await Promise.all([
        executeCode(language_id, currentCode, currentInput),
        aiPromise
      ]);

      if (execResult.success) {
        message.success("Code executed successfully!", 2);
      } else {
        message.error(`Execution failed: ${execResult.statusName}`, 3);
      }

      setCurrentOutput(`Status: ${execResult.statusName}\n\n${execResult.output}`);

      storeCodingQuestion({
        questionId: questionData?._id,
        aisuggestion: aiData || aiSuggestions,
        language_id: languageId,
        languageKey,
        code: currentCode,
      });
    } catch (err) {
      console.error("Code execution error:", err);
      message.error(
        err.message || "Something went wrong while running the code."
      );
      setCurrentOutput(
        `Error: ${err.message || "An unexpected error occurred."}`
      );
    } finally {
      hideMessage();
    }
  };

  // Hydrate/reset when question changes
  useEffect(() => {
    const entry = loadEntry(questionData?._id);
    if (entry) {
      if (entry.code != null) setCurrentCode(entry.code);
      if (entry.languageKey) setLanguageKey(entry.languageKey);
      if (entry.language_id) setLanguageId(entry.language_id);
      if (entry.aisuggestion) dispatch(AIsuggestion(entry.aisuggestion));
    } else {
      setCurrentCode(defaultLanguage?.defaultCode ?? "");
      setLanguageKey(defaultLanguage);
      setLanguageId(defaultLanguage?.id);
      dispatch(AIsuggestion([]));
    }
    setCurrentInput("");
    setCurrentOutput("");
  }, [questionData?._id, defaultLanguage, dispatch]);

  // Dispatch output to Redux store
  useEffect(() => {
    if (currentOutput !== "") {
      dispatch(addOutput(currentOutput));
    }
  }, [currentOutput, dispatch]);

  return (
    <div className={playGroundStyles.container}>
      <EditorContainer
        currentLanguage={languageKey}
        setCurrentLanguage={setLanguageKey}
        currentCode={currentCode}
        setCurrentCode={setCurrentCode}
        runCode={runCode}
        languageId={languageId}
      />

      <OutputConsole currentOutput={currentOutput} />
    </div>
  );
};

export default Playground;
