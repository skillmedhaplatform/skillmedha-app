"use client";
import dynamic from "next/dynamic";
import Delta from "quill-delta";
const ReactQuill = dynamic(
  () => {
    return import("react-quill-new");
  },
  { ssr: false }
);
import { useEffect, useRef, useState } from "react";
import "react-quill-new/dist/quill.snow.css";

// Katex will be loaded dynamically on the client
// import katex from "katex";

import "katex/dist/katex.min.css";

const parseIfJson = (content) => {
  try {
    return JSON.parse(content);
  } catch (error) {
    return content;
  }
};

const modules = {
  toolbar: [
    ["bold", "italic", "underline", "strike"],
    ["blockquote", "code-block"],

    [{ list: "ordered" }, { list: "bullet" }],
    [{ script: "sub" }, { script: "super" }],
    [{ header: [1, 2, 3, false] }],

    ["link", "image", "formula"],

    [{ color: [] }, { background: [] }],
    [{ align: [] }],

    ["clean"],
  ],
  clipboard: {
    matchVisual: false,
    matchers: [
      [
        "h1",
        (node, delta) =>
          delta.compose(new Delta().retain(delta.length(), { header: false })),
      ],
      [
        "h2",
        (node, delta) =>
          delta.compose(new Delta().retain(delta.length(), { header: false })),
      ],
      [
        "h3",
        (node, delta) =>
          delta.compose(new Delta().retain(delta.length(), { header: false })),
      ],
      [
        "h4",
        (node, delta) =>
          delta.compose(new Delta().retain(delta.length(), { header: false })),
      ],
      [
        "h5",
        (node, delta) =>
          delta.compose(new Delta().retain(delta.length(), { header: false })),
      ],
      [
        "h6",
        (node, delta) =>
          delta.compose(new Delta().retain(delta.length(), { header: false })),
      ],
    ],
  },
};

export default function TextEditor({
  editorFun,
  name,
  initialContent,
  readOnly = false,
}) {
  // const quillRef = useRef();

  const [content, setContent] = useState({});
  const [katexLoaded, setKatexLoaded] = useState(false);

  const changeEdVal = (e) => {
    if (e == initialContent[name]) return;
    setContent({ [name]: e });

    editorFun(JSON.stringify(e));
  };

  useEffect(() => {
    if (initialContent)
      if (initialContent[name]) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setContent({ [name]: parseIfJson(initialContent[name]) });
      }
  }, [initialContent[name], name]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("katex").then((m) => {
        window.katex = m.default || m;
        setKatexLoaded(true);
      }).catch(err => {
        console.error("Failed to load katex", err);
        setKatexLoaded(true); // render anyway if it fails
      });
    }
  }, []);

  return katexLoaded ? (
    <ReactQuill
      // ref={quillRef}
      onChange={(e) => changeEdVal(e)}
      modules={modules}
      className={name}
      value={content[name]}
      readOnly={readOnly}
    />
  ) : <div style={{ height: "100px" }}>Loading editor...</div>;
}
