"use client";
import { Editor } from "@monaco-editor/react";
import { useState, useRef, useEffect } from "react";
import styles from "./editor.module.scss";
import { Button } from "antd";

const CodingQuestion = ({ onSubmit }) => {
  // const questionData = {
  //   testTitle: "Palindrome Validator Challenge",
  //   questionType: "Coding Question",
  //   questionScore: 10,
  //   questionCategory: [
  //     { _id: "1", name: "strings" },
  //     { _id: "2", name: "palindrome" },
  //     { _id: "3", name: "algorithms" },
  //   ],
  //   questionContent: {
  //     question: `<p><strong>Problem Statement:</strong></p>
  //       <p>A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.</p>
  //       <p>Given a string <code>s</code>, return <code>true</code> if it is a palindrome, or <code>false</code> otherwise.</p>
  //       <p><strong>Example:</strong></p>
  //       <ul>
  //         <li>Input: "A man, a plan, a canal: Panama" → Output: true</li>
  //         <li>Input: "race a car" → Output: false</li>
  //       </ul>`,
  //   },
  //   testCases: [
  //     {
  //       _id: "test1",
  //       input: 's = "A man, a plan, a canal: Panama"',
  //       expectedOutput: "true",
  //       explanation:
  //         "After cleaning: 'amanaplanacanalpanama' reads same forwards and backwards",
  //     },
  //     {
  //       _id: "test2",
  //       input: 's = "race a car"',
  //       expectedOutput: "false",
  //       explanation:
  //         "After cleaning: 'raceacar' does not read same forwards and backwards",
  //     },
  //     {
  //       _id: "test3",
  //       input: 's = " "',
  //       expectedOutput: "true",
  //       explanation: "After cleaning: empty string is considered a palindrome",
  //     },
  //   ],
  //   scoreSettings: {
  //     scoreType: "fullScore",
  //     pointsForCorrectAns: 10,
  //     pointsForIncorrectAns: -2,
  //   },
  //   answer: {
  //     explanation: `<p><strong>Solution Approach:</strong></p>
  //       <p>1. <strong>Clean the string:</strong> Remove non-alphanumeric characters and convert to lowercase</p>
  //       <p>2. <strong>Two-pointer technique:</strong> Use pointers from start and end, moving inward</p>
  //       <p>3. <strong>Compare characters:</strong> If characters don't match, return false</p>
  //       <p>4. <strong>Time Complexity:</strong> O(n) where n is length of string</p>
  //       <p>5. <strong>Space Complexity:</strong> O(1) if done in-place</p>`,
  //   },
  // };
  const questionData = {
    testTitle: "Sum of Two Numbers",
    questionType: "Coding Question",
    questionScore: 5,
    questionCategory: [
      { _id: "1", name: "math" },
      { _id: "2", name: "basics" },
    ],
    questionContent: {
      question: `<p><strong>Problem Statement:</strong></p>
      <p>Write a function that takes two integers <code>a</code> and <code>b</code>, and returns their sum.</p>
      <p><strong>Example:</strong></p>
      <ul>
        <li>Input: a = 5, b = 3 → Output: 8</li>
        <li>Input: a = -2, b = 7 → Output: 5</li>
      </ul>`,
    },
    testCases: [
      { _id: "t1", input: "a = 5, b = 3", expectedOutput: "8" },
      { _id: "t2", input: "a = -2, b = 7", expectedOutput: "5" },
      { _id: "t3", input: "a = 0, b = 0", expectedOutput: "0" },
    ],
    scoreSettings: {
      scoreType: "fullScore",
      pointsForCorrectAns: 5,
      pointsForIncorrectAns: -1,
    },
    answer: {
      explanation: `<p><strong>Solution Approach:</strong></p>
      <p>1. Take two input numbers <code>a</code> and <code>b</code>.</p>
      <p>2. Return their sum using the <code>+</code> operator.</p>
      <p><strong>Time Complexity:</strong> O(1) (constant time)</p>
      <p><strong>Space Complexity:</strong> O(1)</p>`,
    },
  };
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [testResults, setTestResults] = useState([]);
  const [userScore, setUserScore] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const editorRef = useRef(null);

  const languages = [
    {
      id: 63,
      name: "JavaScript",
      value: "javascript",
      defaultCode:
        "// Write your solution here\nfunction isPalindrome(s) {\n    // Your code here\n    return false;\n}",
    },
    {
      id: 71,
      name: "Python",
      value: "python",
      defaultCode:
        "# Write your solution here\ndef is_palindrome(s):\n    # Your code here\n    return False",
    },
    {
      id: 54,
      name: "C++",
      value: "cpp",
      defaultCode:
        "#include <iostream>\n#include <string>\nusing namespace std;\n\n// Write your solution here\nbool isPalindrome(string s) {\n    // Your code here\n    return false;\n}\n\nint main() {\n    // Test your solution\n    return 0;\n}",
    },
    {
      id: 62,
      name: "Java",
      value: "java",
      defaultCode:
        "public class Solution {\n    // Write your solution here\n    public boolean isPalindrome(String s) {\n        // Your code here\n        return false;\n    }\n}",
    },
  ];

  useEffect(() => {
    const langData = languages.find((lang) => lang.value === language);
    setCode(langData?.defaultCode || "");
  }, [language]);

  // Clean HTML content for display
  const cleanHtmlContent = (htmlString) => {
    if (!htmlString) return "";
    const cleaned = htmlString.replace(/^"|"$/g, "").replace(/\\"/g, '"');
    return cleaned;
  };

  // Extract plain text from HTML for execution
  const extractPlainText = (htmlString) => {
    if (!htmlString) return "";
    const cleaned = cleanHtmlContent(htmlString);
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = cleaned;
    return tempDiv.textContent || tempDiv.innerText || "";
  };

  const handleLanguageChange = (newLanguage) => {
    const langData = languages.find((lang) => lang.value === newLanguage);
    setLanguage(newLanguage);
    setCode(langData?.defaultCode || "");
    setTestResults([]);
    setUserScore(0);
    setIsSubmitted(false);
  };

  const runTestCases = async () => {
    if (!questionData.testCases || questionData.testCases.length === 0) return;

    setIsLoading(true);
    setActiveTab("results");
    const results = [];
    let correctCount = 0;

    for (let i = 0; i < questionData.testCases.length; i++) {
      const testCase = questionData.testCases[i];
      const input = extractPlainText(testCase.input);
      const expectedOutput = extractPlainText(testCase.expectedOutput);

      try {
        let executableCode = code;

        if (language === "javascript") {
          executableCode = `
${code}
// Test execution
const testInput = ${JSON.stringify(
            input.replace("s = ", "").replace(/"/g, "")
          )};
const result = isPalindrome(testInput);
console.log(result);
          `;
        } else if (language === "python") {
          const pythonInput = input.replace("s = ", "").replace(/"/g, "");
          executableCode = `
${code}
# Test execution
test_input = "${pythonInput}"
result = is_palindrome(test_input)
print(str(result).lower())
          `;
        }

        const response = await fetch("/api/execute", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: executableCode,
            language,
            input: "",
          }),
        });

        const result = await response.json();

        if (result.success) {
          const actualOutput = result.output.trim().toLowerCase();
          const expected = expectedOutput.toLowerCase().trim(); 
          const passed = actualOutput === expected;

          if (passed) correctCount++;

          results.push({
            id: testCase._id,
            input: input,
            expectedOutput: expectedOutput,
            actualOutput: result.output.trim(),
            explanation: cleanHtmlContent(testCase.explanation),
            status: passed ? "passed" : "failed",
            executionTime: result.executionTime,
            memory: result.memory,
          });
        } else {
          results.push({
            id: testCase._id,
            input: input,
            expectedOutput: expectedOutput,
            actualOutput: `Error: ${result.error}`,
            explanation: cleanHtmlContent(testCase.explanation),
            status: "error",
          });
        }
      } catch (error) {
        results.push({
          id: testCase._id,
          input: input,
          expectedOutput: expectedOutput,
          actualOutput: `Network Error: ${error.message}`,
          explanation: cleanHtmlContent(testCase.explanation),
          status: "error",
        });
      }
    }

    const totalTests = questionData.testCases.length;
    let finalScore = 0;

    if (questionData.scoreSettings.scoreType === "fullScore") {
      finalScore =
        correctCount === totalTests
          ? questionData.scoreSettings.pointsForCorrectAns
          : questionData.scoreSettings.pointsForIncorrectAns;
    } else {
      finalScore =
        (correctCount / totalTests) *
        questionData.scoreSettings.pointsForCorrectAns;
    }

    setTestResults(results);
    setUserScore(finalScore);
    setIsLoading(false);

    // Call the parent's onSubmit function
    if (onSubmit) {
      onSubmit({
        code,
        language,
        testResults: results,
        score: finalScore,
        isSubmitted: true,
      });
    }
  };

  const submitSolution = async () => {
    await runTestCases();
    setIsSubmitted(true);
    setShowExplanation(true);
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    editor.focus();
  };

  if (!questionData) {
    return <div className={styles.loading}>Loading question...</div>;
  }

  return (
    <div className={styles.codingQuestion}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <div className={styles.meta}>
            <span className={styles.type}>{questionData.questionType}</span>
            <span className={styles.score}>
              Score: {questionData.questionScore} points
            </span>
          </div>
        </div>

        <div className={styles.controls}>
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className={styles.languageSelect}
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.name}
              </option>
            ))}
          </select>

          <Button
            onClick={runTestCases}
            disabled={isLoading || !code.trim()}
            type="primary"
            // className={`${styles.btn} ${styles.primary}`}
          >
            {isLoading ? "Running..." : "Run Tests"}
          </Button>

          <Button
            onClick={submitSolution}
            disabled={isLoading || !code.trim()}
            type="primary"
            // className={`${styles.btn} ${styles.success}`}
          >
            Submit Solution
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className={styles.content}>
        {/* Left Panel */}
        <div className={styles.leftPanel}>
          {/* Tabs */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${
                activeTab === "description" ? styles.active : ""
              }`}
              onClick={() => setActiveTab("description")}
            >
              Description
            </button>
            <button
              className={`${styles.tab} ${
                activeTab === "results" ? styles.active : ""
              }`}
              onClick={() => setActiveTab("results")}
            >
              Test Results ({testResults.length})
            </button>
            {showExplanation && (
              <button
                className={`${styles.tab} ${
                  activeTab === "explanation" ? styles.active : ""
                }`}
                onClick={() => setActiveTab("explanation")}
              >
                Explanation
              </button>
            )}
          </div>

          {/* Tab Content */}
          <div className={styles.tabContent}>
            {/* Description Tab */}
            {activeTab === "description" && (
              <div className={styles.description}>
                <div className={styles.categories}>
                  {questionData.questionCategory.map((category) => (
                    <span key={category._id} className={styles.categoryTag}>
                      {category.name}
                    </span>
                  ))}
                </div>

                <div
                  className={styles.questionContent}
                  dangerouslySetInnerHTML={{
                    __html: cleanHtmlContent(
                      questionData.questionContent.question
                    ),
                  }}
                />

                {/* Sample Test Cases */}
                <div className={styles.sampleTests}>
                  <h3>Sample Test Cases:</h3>
                  {questionData.testCases?.map((testCase, index) => (
                    <div key={testCase._id} className={styles.sampleTest}>
                      <h4>Example {index + 1}:</h4>
                      <div className={styles.testCase}>
                        <div className={styles.testInput}>
                          <strong>Input:</strong>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: cleanHtmlContent(testCase.input),
                            }}
                          />
                        </div>
                        <div className={styles.testOutput}>
                          <strong>Output:</strong>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: cleanHtmlContent(testCase.expectedOutput),
                            }}
                          />
                        </div>
                        {testCase.explanation && (
                          <div className={styles.testExplanation}>
                            <strong>Explanation:</strong>
                            <div
                              dangerouslySetInnerHTML={{
                                __html: cleanHtmlContent(testCase.explanation),
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Test Results Tab */}
            {activeTab === "results" && (
              <div className={styles.results}>
                {isSubmitted && (
                  <div className={styles.scoreDisplay}>
                    <h3>
                      Your Score: {userScore} / {questionData.questionScore}
                    </h3>
                    <div
                      className={`${styles.scoreBadge} ${
                        userScore > 0 ? styles.success : styles.failure
                      }`}
                    >
                      {userScore > 0 ? "PASSED" : "FAILED"}
                    </div>
                  </div>
                )}

                {testResults.length > 0 ? (
                  <div className={styles.testResults}>
                    {testResults.map((result, index) => (
                      <div
                        key={result.id}
                        className={`${styles.testResult} ${
                          styles[result.status]
                        }`}
                      >
                        <div className={styles.testResultHeader}>
                          <span>Test Case {index + 1}</span>
                          <span
                            className={`${styles.testStatus} ${
                              styles[result.status]
                            }`}
                          >
                            {result.status.toUpperCase()}
                          </span>
                        </div>

                        <div className={styles.testResultContent}>
                          <div>
                            <strong>Input:</strong> {result.input}
                          </div>
                          <div>
                            <strong>Expected:</strong> {result.expectedOutput}
                          </div>
                          <div>
                            <strong>Actual:</strong> {result.actualOutput}
                          </div>

                          {result.explanation && (
                            <div>
                              <strong>Explanation:</strong> {result.explanation}
                            </div>
                          )}

                          {result.executionTime && (
                            <div className={styles.testStats}>
                              Time: {result.executionTime}s | Memory:{" "}
                              {result.memory}KB
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.noResults}>
                    Run tests to see results here...
                  </div>
                )}
              </div>
            )}

            {/* Explanation Tab */}
            {activeTab === "explanation" && showExplanation && (
              <div className={styles.explanation}>
                <h3>Solution Explanation</h3>
                <div
                  className={styles.explanationContent}
                  dangerouslySetInnerHTML={{
                    __html: cleanHtmlContent(questionData.answer.explanation),
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div className={styles.rightPanel}>
          <div className={styles.editorHeader}>
            <span>Code Editor ({language})</span>
          </div>

          <div className={styles.editorContainer}>
            <Editor
              height="100%"
              language={language === "csharp" ? "csharp" : language}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || "")}
              onMount={handleEditorDidMount}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: "on",
                lineNumbers: "on",
                folding: true,
                bracketMatching: "always",
                autoIndent: "full",
              }}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.scoringInfo}>
          Scoring: {questionData.scoreSettings.pointsForCorrectAns} points for
          correct answer,
          {questionData.scoreSettings.pointsForIncorrectAns} points for
          incorrect answer
        </div>
      </div>
    </div>
  );
};

export default CodingQuestion;
