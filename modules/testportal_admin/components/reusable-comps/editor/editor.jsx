// "use client";
// import dynamic from "next/dynamic";
// import Delta from 'quill-delta';
// const ReactQuill = dynamic(
//   () => {
//     return import("react-quill");
//   },
//   { ssr: false }
// );
// import { useEffect, useRef, useState } from "react";
// import "react-quill/dist/quill.snow.css";

// const katex = dynamic(
//   () => {
//     return import("katex");
//   },
//   { ssr: false }
// );
// // import katex from "katex";

// import "katex/dist/katex.min.css";
// import { parseIfJson } from "@/utils/universalUtils/urls";

// const modules = {
//   toolbar: [
//     ["bold", "italic", "underline", "strike"],
//     ["blockquote", "code-block"],

//     [{ list: "ordered" }, { list: "bullet" }],
//     [{ script: "sub" }, { script: "super" }],
//     [{ header: [1, 2, 3, false] }],

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

// export default function TextEditor({ editorFun, name, initialContent }) {
//   // const quillRef = useRef();

//   const [content, setContent] = useState({});

//   const changeEdVal = (e) => {
//     if (e == initialContent[name]) return;
//     setContent({ [name]: e });

//     editorFun(JSON.stringify(e));
//   };

//   useEffect(() => {
//     if (initialContent)
//       if (initialContent[name]) {
//         setContent({ [name]: parseIfJson(initialContent[name]) });
//       }
//   }, [initialContent[name], name]);

//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       window.katex = katex;
//     }
//   }, []);

//   return (
//     <ReactQuill
//       // ref={quillRef}
//       onChange={(e) => changeEdVal(e)}
//       modules={modules}
//       className={name}
//       value={content[name]}
//     />
//   );
// }

"use client";
import dynamic from "next/dynamic";
import Delta from "quill-delta";
import { useEffect, useRef, useState } from "react";
import "react-quill-new/dist/quill.snow.css";
import { parseIfJson } from "@/utils/windowMW";

const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill-new");

    // Import Quill and image resize module
    const { default: Quill } = await import("quill");
    const ImageResize = (await import("quill-image-resize-module-react"))
      .default;

    // Register the image resize module
    Quill.register("modules/imageResize", ImageResize);

    return RQ;
  },
  { ssr: false }
);

const katex = dynamic(
  () => {
    return import("katex");
  },
  { ssr: false }
);

import "katex/dist/katex.min.css";

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
  imageResize: {
    parchment:
      typeof window !== "undefined"
        ? (require("quill").default || require("quill")).import("parchment")
        : null,
    modules: ["Resize", "DisplaySize", "Toolbar"],
  },
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

export default function TextEditor({ editorFun, name, initialContent }) {
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
      onChange={(e) => changeEdVal(e)}
      modules={modules}
      className={name}
      value={content[name]}
    />
  );
}
