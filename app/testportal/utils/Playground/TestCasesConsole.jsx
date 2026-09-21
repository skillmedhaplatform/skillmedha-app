import React, { useContext, useEffect, useState } from "react";
import EditorContainer from "./EditorContainer";
import InputConsole from "./InputConsole";
import OutputConsole from "./OutputConsole";
import playGroundStyles from "./play.module.scss";
import { Buffer } from "buffer";
import axios from "axios";
import { message, Button, Card, Input, Space, Tag, Tooltip } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { languageMap, PlaygroundContext } from "./context/PlaygroundContext";
import { addOutput, aiSuggestions } from "@/app/redux/slices/codeEditor";
import { aiUrl } from "../urls";
import {
  PlusOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;

import { executeCode } from "@/utils/judge0";
const TestCasesConsole = ({
  testCases,
  updateTestCase,
  addTestCase,
  deleteTestCase,
  isRunningTests,
}) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case "passed":
        return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
      case "failed":
        return <CloseCircleOutlined style={{ color: "#ff4d4f" }} />;
      case "error":
        return <ExclamationCircleOutlined style={{ color: "#faad14" }} />;
      case "running":
        return <LoadingOutlined style={{ color: "#1890ff" }} />;
      default:
        return <PlayCircleOutlined style={{ color: "#d9d9d9" }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "passed":
        return "success";
      case "failed":
        return "error";
      case "error":
        return "warning";
      case "running":
        return "processing";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "passed":
        return "Passed";
      case "failed":
        return "Failed";
      case "error":
        return "Error";
      case "running":
        return "Running";
      default:
        return "Pending";
    }
  };

  const passedCount = testCases.filter((tc) => tc.status === "passed").length;
  const totalCount = testCases.length;

  return (
    <div
      style={{
        height: "400px",
        display: "flex",
        flexDirection: "column",
        padding: "16px",
        backgroundColor: "#fafafa",
        borderRadius: "8px",
        margin: "8px",
        border: "1px solid #d9d9d9",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
          paddingBottom: "8px",
          borderBottom: "1px solid #d9d9d9",
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: "16px",
              fontWeight: "600",
              color: "#333",
            }}
          >
            Test Cases
          </h3>
          <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
            {passedCount}/{totalCount} passed
          </div>
        </div>
        <Space>
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={addTestCase}
            disabled={isRunningTests}
            size="small"
          >
            Add Test Case
          </Button>
        </Space>
      </div>

      {/* Test Cases List */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          paddingRight: "8px",
        }}
      >
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          {testCases.map((testCase, index) => (
            <Card
              key={testCase.id}
              size="small"
              style={{
                border: `1px solid ${
                  testCase.status === "passed"
                    ? "#52c41a"
                    : testCase.status === "failed"
                    ? "#ff4d4f"
                    : testCase.status === "error"
                    ? "#faad14"
                    : "#d9d9d9"
                }`,
                borderRadius: "6px",
                backgroundColor: "#fff",
              }}
              title={
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Space>
                    {getStatusIcon(testCase.status)}
                    <span style={{ fontSize: "14px", fontWeight: "500" }}>
                      Test Case {index + 1}
                    </span>
                    <Tag color={getStatusColor(testCase.status)} size="small">
                      {getStatusText(testCase.status)}
                    </Tag>
                  </Space>
                  <Tooltip title="Delete test case">
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => deleteTestCase(testCase.id)}
                      disabled={isRunningTests || testCases.length <= 1}
                    />
                  </Tooltip>
                </div>
              }
            >
              <div style={{ display: "grid", gap: "12px" }}>
                {/* Input */}
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "12px",
                      fontWeight: "500",
                      color: "#666",
                    }}
                  >
                    Input:
                  </label>
                  <TextArea
                    value={testCase.input}
                    onChange={(e) =>
                      updateTestCase(testCase.id, "input", e.target.value)
                    }
                    placeholder="Enter input for this test case..."
                    rows={2}
                    disabled={isRunningTests}
                    style={{ fontSize: "12px" }}
                  />
                </div>

                {/* Expected Output */}
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "12px",
                      fontWeight: "500",
                      color: "#666",
                    }}
                  >
                    Expected Output:
                  </label>
                  <TextArea
                    value={testCase.expectedOutput}
                    onChange={(e) =>
                      updateTestCase(
                        testCase.id,
                        "expectedOutput",
                        e.target.value
                      )
                    }
                    placeholder="Enter expected output..."
                    rows={2}
                    disabled={isRunningTests}
                    style={{ fontSize: "12px" }}
                  />
                </div>

                {/* Actual Output (shown only if there's output) */}
                {testCase.actualOutput && (
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "4px",
                        fontSize: "12px",
                        fontWeight: "500",
                        color: "#666",
                      }}
                    >
                      Actual Output:
                    </label>
                    <TextArea
                      value={testCase.actualOutput}
                      readOnly
                      rows={2}
                      style={{
                        fontSize: "12px",
                        backgroundColor:
                          testCase.status === "passed"
                            ? "#f6ffed"
                            : testCase.status === "failed"
                            ? "#fff2f0"
                            : "#fffbe6",
                      }}
                    />
                  </div>
                )}

                {/* Comparison indicator */}
                {testCase.actualOutput && testCase.expectedOutput && (
                  <div style={{ fontSize: "11px", color: "#666" }}>
                    {testCase.status === "passed" && (
                      <span style={{ color: "#52c41a" }}>
                        ✓ Output matches expected result
                      </span>
                    )}
                    {testCase.status === "failed" && (
                      <span style={{ color: "#ff4d4f" }}>
                        {"✗ Output doesn't match expected result"}
                      </span>
                    )}
                    {testCase.status === "error" && (
                      <span style={{ color: "#faad14" }}>
                        ⚠ Execution error occurred
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </Space>
      </div>
    </div>
  );
};

const Playground = ({ questionData }) => {
  // console.log(questionData);

  const { folderId, playgroundId } = {
    folderId: "a43f6755-fe2c-43ae-9f49-3f1c9594f850",
    playgroundId: "ec26690a-6ad9-49b4-9b6b-dfb7ac905842",
  };

  const playgroundContextValue = useContext(PlaygroundContext);
  const question = useSelector((state) => state.codeEditor.question);
  const { folders, savePlayground } = playgroundContextValue;

  const { title, language, code } = {
    title: "Editor",
    language: "Assembly (NASM 2.14.02)",
    code: `
section .data
    hello db 'Hello World!',0

section .text
    global _start

_start:
    ; write hello to stdout
    mov eax, 4 ; sys_write
    mov ebx, 1 ; stdout
    mov ecx, hello
    mov edx, 12 ; length
    int 0x80
    
    ; exit
    mov eax, 1 ; sys_exit
    xor ebx, ebx ; return 0
    int 0x80
`,
  };

  const [currentLanguage, setCurrentLanguage] = useState(language);
  const [currentCode, setCurrentCode] = useState(code);
  const [currentInput, setCurrentInput] = useState(""); // This is your stdin
  const [currentOutput, setCurrentOutput] = useState("");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const baseCompUrl = `https://compiler.skillmedha.com`;
  // New test case states
  const [testCases, setTestCases] = useState([
    {
      id: 1,
      input: "",
      expectedOutput: "",
      actualOutput: "",
      status: "pending",
    },
  ]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testMode, setTestMode] = useState("single"); // "single" or "testcases"

  const dispatch = useDispatch();

  // Save code function
  const saveCode = () => {
    savePlayground(folderId, playgroundId, currentCode, currentLanguage);
  };

  // Get AI suggestions
  const getAiSugg = async () => {
    try {
      const { data } = await axios.post(aiUrl + "/checkCode", {
        code: currentCode,
        question: question,
      });
      dispatch(aiSuggestions(data));
      return data;
    } catch (error) {
      console.error("AI suggestion error:", error);
    }
  };

  // Execute code with specific input
  const executeCodeWithInput = async (input) => {
    const language_id =
      languageMap[currentLanguage?.split(" ")[0]?.toLowerCase()]?.id;

    if (!language_id) {
      throw new Error("Unsupported language selected");
    }

    const { output, statusName, success } = await executeCode(language_id, currentCode, input);

    return {
      output: output,
      status: statusName,
      success,
    };
  };

  // Run all test cases
  async function runTestCases() {
    setIsRunningTests(true);
    const hideMessage = message.loading("Running test cases...", 0);

    getAiSugg();

    try {
      const updatedTestCases = [];
      let passedCount = 0;

      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];

        try {
          // Update status to running
          setTestCases((prev) =>
            prev.map((tc) =>
              tc.id === testCase.id
                ? { ...tc, status: "running", actualOutput: "" }
                : tc
            )
          );

          const result = await executeCodeWithInput(testCase.input);

          const actualOutput = result.output.trim();
          const expectedOutput = testCase.expectedOutput.trim();
          const passed = actualOutput === expectedOutput && result.success;

          if (passed) passedCount++;

          // Update individual test case
          setTestCases((prev) =>
            prev.map((tc) =>
              tc.id === testCase.id
                ? {
                    ...tc,
                    actualOutput: result.output,
                    status: result.success
                      ? passed
                        ? "passed"
                        : "failed"
                      : "error",
                  }
                : tc
            )
          );
        } catch (error) {
          setTestCases((prev) =>
            prev.map((tc) =>
              tc.id === testCase.id
                ? {
                    ...tc,
                    actualOutput: `Error: ${error.message}`,
                    status: "error",
                  }
                : tc
            )
          );
        }
      }

      // Show summary message
      if (passedCount === testCases.length) {
        message.success(`All ${passedCount} test cases passed!`, 3);
      } else {
        message.warning(
          `${passedCount}/${testCases.length} test cases passed`,
          3
        );
      }
    } catch (err) {
      console.error("Test execution error:", err);
      message.error("Failed to run test cases");
    } finally {
      setIsRunningTests(false);
      hideMessage();
    }
  };

  // Main function to run code with stdin (updated)
  const runCode = async () => {
    const hideMessage = message.loading("Running your code...", 0);

    // Get AI suggestions in parallel
    getAiSugg();

    try {
      const result = await executeCodeWithInput(currentInput);

      if (result.success) {
        message.success("Code executed successfully!", 2);
      } else {
        message.error(`Execution failed: ${result.status}`, 3);
      }

      setCurrentOutput(`Status: ${result.status}\n\n${result.output}`);
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

  // Test case management functions
  const addTestCase = () => {
    const newId = Math.max(...testCases.map((tc) => tc.id), 0) + 1;
    setTestCases((prev) => [
      ...prev,
      {
        id: newId,
        input: "",
        expectedOutput: "",
        actualOutput: "",
        status: "pending",
      },
    ]);
  };

  const updateTestCase = (id, field, value) => {
    setTestCases((prev) =>
      prev.map((tc) => (tc.id === id ? { ...tc, [field]: value } : tc))
    );
  };

  const deleteTestCase = (id) => {
    if (testCases.length > 1) {
      setTestCases((prev) => prev.filter((tc) => tc.id !== id));
    } else {
      message.warning("At least one test case is required");
    }
  };

  // File handling functions
  const getFile = (e, setState) => {
    const input = e.target;
    if ("files" in input && input.files.length > 0) {
      placeFileContent(input.files[0], setState);
    }
  };

  const placeFileContent = (file, setState) => {
    readFileContent(file)
      .then((content) => {
        setState(content);
      })
      .catch((error) => console.error("Error reading file:", error));
  };

  function readFileContent(file) {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  }

  // Reset output when question changes
  const questionFromStore = useSelector((state) => state.codeEditor.question);
  useEffect(() => {
    setCurrentOutput("");
  }, [questionFromStore]);

  // Dispatch output to Redux store
  useEffect(() => {
    if (currentOutput !== "") {
      dispatch(addOutput(currentOutput));
    }
  }, [currentOutput, dispatch]);

  return (
    <div className={playGroundStyles.container}>
      <EditorContainer
        currentLanguage={currentLanguage?.split(" ")[0]?.toLowerCase()}
        setCurrentLanguage={setCurrentLanguage}
        currentCode={currentCode}
        setCurrentCode={setCurrentCode}
        folderId={folderId}
        playgroundId={playgroundId}
        saveCode={saveCode}
        runCode={testMode === "single" ? runCode : runTestCases}
        getFile={getFile}
        isFullScreen={isFullScreen}
        setIsFullScreen={setIsFullScreen}
        testMode={testMode}
        setTestMode={setTestMode}
        isRunningTests={isRunningTests}
      />

      {testMode === "single" ? (
        <>
          <InputConsole
            currentInput={currentInput}
            setCurrentInput={setCurrentInput}
            getFile={getFile}
          />
          <OutputConsole currentOutput={currentOutput} />
        </>
      ) : (
        <TestCasesConsole
          testCases={testCases}
          updateTestCase={updateTestCase}
          addTestCase={addTestCase}
          deleteTestCase={deleteTestCase}
          isRunningTests={isRunningTests}
        />
      )}
    </div>
  );
};

export default Playground;
