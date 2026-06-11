// EditorContainer.jsx
"use client";

import React, { useMemo, useState } from "react";
import CodeEditor from "./CodeEditor";
import Select from "react-select";
import playGroundStyles from "./play.module.scss";
import { languageList } from "./context/PlaygroundContext";
import { Button } from "antd";

const languageOptions = [
  {
    id: 45,
    value: "Assembly (NASM 2.14.02)",
    label: "Assembly (NASM 2.14.02)",
  },
  { id: 46, value: "Bash (5.0.0)", label: "Bash (5.0.0)" },
  { id: 47, value: "Basic (FBC 1.07.1)", label: "Basic (FBC 1.07.1)" },
  { id: 48, value: "C (GCC 9.2.0)", label: "C (GCC 9.2.0)" },
  { id: 54, value: "C++ (GCC 9.2.0)", label: "C++ (GCC 9.2.0)" },
  { id: 86, value: "Clojure (1.10.1)", label: "Clojure (1.10.1)" },
  { id: 51, value: "C# (Mono 6.6.0.161)", label: "C# (Mono 6.6.0.161)" },
  { id: 77, value: "COBOL (GnuCOBOL 2.2)", label: "COBOL (GnuCOBOL 2.2)" },
  {
    id: 55,
    value: "Common Lisp (SBCL 2.0.0)",
    label: "Common Lisp (SBCL 2.0.0)",
  },
  { id: 90, value: "Dart (2.19.2)", label: "Dart (2.19.2)" },
  { id: 56, value: "D (DMD 2.089.1)", label: "D (DMD 2.089.1)" },
  { id: 57, value: "Elixir (1.9.4)", label: "Elixir (1.9.4)" },
  { id: 58, value: "Erlang (OTP 22.2)", label: "Erlang (OTP 22.2)" },
  {
    id: 87,
    value: "F# (.NET Core SDK 3.1.202)",
    label: "F# (.NET Core SDK 3.1.202)",
  },
  {
    id: 59,
    value: "Fortran (GFortran 9.2.0)",
    label: "Fortran (GFortran 9.2.0)",
  },
  { id: 60, value: "Go (1.23.5)", label: "Go (1.23.5)" },
  { id: 88, value: "Groovy (3.0.3)", label: "Groovy (3.0.3)" },
  { id: 61, value: "Haskell (GHC 8.8.1)", label: "Haskell (GHC 8.8.1)" },
  { id: 62, value: "Java (JDK 17.0.6)", label: "Java (JDK 17.0.6)" },
  {
    id: 63,
    value: "JavaScript (Node.js 22.08.0)",
    label: "JavaScript (Node.js 22.08.0)",
  },
  { id: 78, value: "Kotlin (2.1.10)", label: "Kotlin (2.1.10)" },
  { id: 64, value: "Lua (5.3.5)", label: "Lua (5.3.5)" },
  {
    id: 79,
    value: "ObjectiveC (Clang 7.0.1)",
    label: "ObjectiveC (Clang 7.0.1)",
  },
  { id: 65, value: "OCaml (4.09.0)", label: "OCaml (4.09.0)" },
  { id: 66, value: "Octave (5.1.0)", label: "Octave (5.1.0)" },
  { id: 67, value: "Pascal (FPC 3.0.4)", label: "Pascal (FPC 3.0.4)" },
  { id: 85, value: "Perl (5.28.1)", label: "Perl (5.28.1)" },
  { id: 68, value: "PHP (8.3.11)", label: "PHP (8.3.11)" },
  {
    id: 69,
    value: "Prolog (GNU Prolog 1.4.5)",
    label: "Prolog (GNU Prolog 1.4.5)",
  },
  { id: 71, value: "Python (3.8.1)", label: "Python (3.8.1)" },
  { id: 80, value: "R (4.4.1)", label: "R (4.4.1)" },
  { id: 72, value: "Ruby (2.7.0)", label: "Ruby (2.7.0)" },
  { id: 73, value: "Rust (1.85.0)", label: "Rust (1.85.0)" },
  { id: 81, value: "Scala (2.13.2)", label: "Scala (2.13.2)" },
  { id: 82, value: "SQL (SQLite 3.27.2)", label: "SQL (SQLite 3.27.2)" },
  { id: 83, value: "Swift (5.2.3)", label: "Swift (5.2.3)" },
  { id: 74, value: "TypeScript (5.6.2)", label: "TypeScript (5.6.2)" },
  {
    id: 84,
    value: "Visual Basic.Net (vbnc 0.0.0.5943)",
    label: "Visual Basic.Net (vbnc 0.0.0.5943)",
  },
];

export default function EditorContainer({
  currentLanguage, // languageList object e.g., { id, key, defaultCode, ... }
  setCurrentLanguage,
  currentCode,
  setCurrentCode,
  runCode,
  languageId, // initial/fallback id
}) {
  const [currentTheme, setCurrentTheme] = useState({
    value: "githubDark",
    label: "githubDark",
  });

  // Derive the selected option from the current language id (or fallback)
  const selectedOption = useMemo(() => {
    const id = currentLanguage?.id ?? languageId;
    return languageOptions.find((o) => o.id === id) ?? null;
  }, [currentLanguage?.id, languageId]);

  const handleLanguageChange = (opt) => {
    const lang = languageList?.find((e) => e?.id === opt?.id);
    setCurrentLanguage(lang || null);
    setCurrentCode(lang?.defaultCode ?? "");
  };

  return (
    <div className={playGroundStyles.editorContainer}>
      <div className={playGroundStyles.headerCon}>
        <div className={playGroundStyles.headerConLeft}>Code</div>
        <div className={playGroundStyles.headerConRight}>
          <Select
            options={languageOptions}
            value={selectedOption}
            onChange={handleLanguageChange}
            className={playGroundStyles.select}
          />
          <Button onClick={runCode}>Run Code</Button>
        </div>
      </div>

      <div className={playGroundStyles.editorBody}>
        <CodeEditor
          currentLanguage={currentLanguage}
          currentTheme={currentTheme.value}
          currentCode={currentCode}
          setCurrentCode={setCurrentCode}
        />
      </div>
    </div>
  );
}
