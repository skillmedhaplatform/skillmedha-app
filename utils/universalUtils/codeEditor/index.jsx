// Playground.jsx
"use client";
import "./play.css";
import React, { useEffect, useState } from "react";
import EditorContainer from "./EditorContainer";
import OutputConsole from "./OutputConsole";
import playGroundStyles from "./play.module.scss";
import { Buffer } from "buffer";
import axios from "axios";
import { Button, Drawer, message, Spin } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { languageList } from "./context/PlaygroundContext";
import { aiUrl } from "../urls";
import pageStyles from "./page.module.scss";
import {
  addOutput,
  aiSuggestions as AIsuggestion,
} from "@/redux/slices/codeEditor";
import { getLstorage, getSstorage, setSstorage } from "../windowMW";
import { CloseOutlined } from "@ant-design/icons";

const apis = {
  ks: "7aeb8e5c51msh18112baa8b7c300p18ab0ajsn09826bf33308",
  te: "10781cb80bmsh46e2798d6a46332p19663ejsn5557d9fa34d1",
  vs: "77c854fb76mshe24f3243106be66p11a6bajsn7c9921a96d7e",
  mi: "0384295621msheb61f4751e1b41ap10acc0jsn96fa40b5dc6d",
};

const containerStyle = {
  position: "relative",
  height: 200,
  padding: 48,
  overflow: "hidden",
  // background: token.colorFillAlter,
  // border: `1px solid ${token.colorBorderSecondary}`,
  // borderRadius: token.borderRadiusLG,
};

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

const encode = (str) => Buffer.from(str ?? "", "binary").toString("base64");
const decode = (str) => Buffer.from(str ?? "", "base64").toString();

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
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  const baseCompUrl = `https://compiler.skillmedha.com`;
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);

  const onClose = () => {
    setOpen(false);
    // Reset/destroy results on close
    setCurrentOutput("");
    setIsLoading(false);
    dispatch(AIsuggestion([])); // Clear AI suggestions
  };

  // Submit code with stdin to the compilation server
  const postSubmission = async (language_id, source_code, stdin) => {
    const options = {
      method: "POST",
      url: baseCompUrl + `/submissions/`,
      params: { base64_encoded: "true", fields: "*" },
      headers: {
        "X-Auth-Token": "e05dac791e06052efacb1f9132323070",
        "content-type": "application/json",
        "Content-Type": "application/json",
        "X-RapidAPI-Key": apis.mi,
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
      },
      data: JSON.stringify({
        language_id,
        source_code,
        stdin,
      }),
    };

    const res = await axios.request(options);
    return res.data.token;
  };

  // Fetch execution results (poll)
  const getOutput = async (token) => {
    const options = {
      method: "GET",
      url: baseCompUrl + `/submissions/${token}`,
      params: { base64_encoded: "true", fields: "*" },
      headers: {
        "X-Auth-Token": "e05dac791e06052efacb1f9132323070",
        "X-RapidAPI-Key": apis.mi,
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
      },
    };

    try {
      let tries = 0;
      let res;

      while (tries < 15) {
        res = await axios.request(options);

        if (!res.data && res.source_code) {
          res.data = res;
        }

        if (res.data?.status?.id > 2 || res.data?.status_id > 2) {
          return res.data;
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
        tries++;
      }

      return (
        res?.data || {
          status: { id: -1, description: "Execution timed out" },
          stdout: "",
          stderr: "Execution timed out after 15 attempts.",
          compile_output: "",
        }
      );
    } catch (err) {
      return {
        status: { id: -1, description: "Network Error" },
        stdout: "",
        stderr: err.message || "Unknown network error occurred",
        compile_output: "",
      };
    }
  };

  // Get AI suggestions
  const getAiSugg = async () => {
    try {
      const { data } = await axios.post(
        aiUrl + "/testCases",
        {
          code: currentCode,
          question,
          userType: "student",
        },
        { headers: { Authorization: `Bearer ${getLstorage("token")}` } }
      );
      dispatch(AIsuggestion(data));
      return data;
    } catch (error) {
      console.error("AI suggestion error:", error);
      return aiSuggestions;
    }
  };

  // Main function to run code with stdin
  const runCode = async () => {
    // Open drawer immediately
    setOpen(true);
    setIsLoading(true); // Start loading

    const hideMessage = message.loading("Running your code...", 0);

    try {
      // Use the id directly from the selected language object
      const language_id = languageKey?.id;
      if (!language_id) throw new Error("Unsupported language selected");

      const source_code = encode(currentCode);
      const stdin = encode(currentInput);
      const aiPromise = getAiSugg();
      const token = await postSubmission(language_id, source_code, stdin);

      if (!token) throw new Error("Failed to get submission token");

      const [res, aiData] = await Promise.all([getOutput(token), aiPromise]);
      const status_name = res.status?.description || "Unknown Status";
      const decoded_output = decode(res.stdout || "");
      const decoded_compile_output = decode(res.compile_output || "");
      const decoded_error = decode(res.stderr || "");

      let final_output = "";
      if (res.status_id === 3 || res.status?.id === 3) {
        final_output = decoded_output;
        message.success("Code executed successfully!", 2);
      } else {
        final_output =
          decoded_compile_output || decoded_error || "Unknown error occurred";
        message.error(`Execution failed: ${status_name}`, 3);
      }

      setCurrentOutput(`Status: ${status_name}\n\n${final_output}`);
      storeCodingQuestion({
        questionId: questionData?._id,
        aisuggestion: aiData || aiSuggestions,
        language_id,
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
      setIsLoading(false); // Stop loading when done
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
    <div className={`${playGroundStyles.container} ${containerStyle}`}>
      <EditorContainer
        currentLanguage={languageKey}
        setCurrentLanguage={setLanguageKey}
        currentCode={currentCode}
        setCurrentCode={setCurrentCode}
        runCode={runCode}
        languageId={languageId}
      />
      <Drawer
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Result</span>
            <Button type="text" icon={<CloseOutlined />} onClick={onClose} />
          </div>
        }
        placement="right"
        closable={false}
        onClose={onClose}
        open={open}
        getContainer={false}
        width={"69%"}
        destroyOnHidden={true}
        mask={false}
      >
        {isLoading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "200px",
              flexDirection: "column",
            }}
          >
            <Spin size="large" />
            <div style={{ marginTop: "16px" }}>Running your code...</div>
          </div>
        ) : (
          <div className={playGroundStyles.output}>
            <div className={playGroundStyles.outputHeader}>Test Cases</div>
            <div className={playGroundStyles.suggestionCont}>
              {aiSuggestions?.map((item, index) => {
                const key = Object.keys(item)?.[0];
                const value = item?.[key];

                const statusClass =
                  value?.toLowerCase() === "fail" ||
                    value?.toLowerCase().includes("fail")
                    ? playGroundStyles.fail
                    : playGroundStyles.pass;

                return (
                  <div
                    key={index}
                    className={`${playGroundStyles.outputBody} ${statusClass}`}
                  >
                    <p>
                      {key}: {value}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className={playGroundStyles.console}>
              <div className="consoleHeader">Output Console</div>
              <pre>{currentOutput || "No output yet..."}</pre>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Playground;
