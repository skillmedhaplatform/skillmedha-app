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

const katex = dynamic(
  () => {
    return import("katex");
  },
  { ssr: false }
);
// import katex from "katex";

import "katex/dist/katex.min.css";

const parseIfJson = (content) => {
  try {
    return JSON.parse(content);
  } catch (error) {
    return content;
  }
};

// const modules = {
//   toolbar: [
//     ["bold", "italic", "underline", "strike"],
//     ["blockquote", "code-block"],

//     [{ list: "ordered" }, { list: "bullet" }],
//     [{ script: "sub" }, { script: "super" }],
//     [{ header: [1, 2, 3, false] }],
//     [{ size: ["small", false, "large", "huge"] }],
//     ["link", "image", "formula"],

//     [{ color: [] }, { background: [] }],
//     [{ align: [] }],

//     ["clean"],
//   ],
//   clipboard: {
//     matchVisual: false,
//     matchers: [
//       [
//         "h1",
//         (node, delta) =>
//           delta.compose(new Delta().retain(delta.length(), { header: false })),
//       ],
//       [
//         "h2",
//         (node, delta) =>
//           delta.compose(new Delta().retain(delta.length(), { header: false })),
//       ],
//       [
//         "h3",
//         (node, delta) =>
//           delta.compose(new Delta().retain(delta.length(), { header: false })),
//       ],
//       [
//         "h4",
//         (node, delta) =>
//           delta.compose(new Delta().retain(delta.length(), { header: false })),
//       ],
//       [
//         "h5",
//         (node, delta) =>
//           delta.compose(new Delta().retain(delta.length(), { header: false })),
//       ],
//       [
//         "h6",
//         (node, delta) =>
//           delta.compose(new Delta().retain(delta.length(), { header: false })),
//       ],
//     ],
//   },
// };
const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }], // Move headers to top for better UX
    ["bold", "italic", "underline", "strike"],
    ["blockquote", "code-block"],

    [{ list: "ordered" }, { list: "bullet" }],
    [{ script: "sub" }, { script: "super" }],
    [{ size: ["small", false, "large", "huge"] }],
    ["link", "image", "formula"],

    [{ color: [] }, { background: [] }],
    [{ align: [] }],

    ["clean"],
  ],
  clipboard: {
    matchVisual: false,
    matchers: [
      // Preserve heading structure but normalize levels
      [
        "h1",
        (node, delta) =>
          delta.compose(new Delta().retain(delta.length(), { header: 1 })),
      ],
      [
        "h2",
        (node, delta) =>
          delta.compose(new Delta().retain(delta.length(), { header: 2 })),
      ],
      [
        "h3",
        (node, delta) =>
          delta.compose(new Delta().retain(delta.length(), { header: 3 })),
      ],
      [
        "h4",
        (node, delta) =>
          delta.compose(new Delta().retain(delta.length(), { header: 3 })), // Map h4 to h3
      ],
      [
        "h5",
        (node, delta) =>
          delta.compose(new Delta().retain(delta.length(), { header: 3 })), // Map h5 to h3
      ],
      [
        "h6",
        (node, delta) =>
          delta.compose(new Delta().retain(delta.length(), { header: 3 })), // Map h6 to h3
      ],
    ],
  },
};

export default function TextEditor({ editorFun, name, initialContent }) {
  // const quillRef = useRef();

  const [content, setContent] = useState({});

  const changeEdVal = (e) => {
    if (e == initialContent[name]) return;
    setContent({ [name]: e });

    editorFun(JSON.stringify(e));
  };

  useEffect(() => {
    if (initialContent)
      if (initialContent[name]) {
        setContent({ [name]: parseIfJson(initialContent[name]) });
      }
  }, [initialContent[name], name]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.katex = katex;
    }
  }, []);

  return (
    <ReactQuill
      // ref={quillRef}
      onChange={(e) => changeEdVal(e)}
      modules={modules}
      className={name}
      value={content[name]}
    />
  );
}
