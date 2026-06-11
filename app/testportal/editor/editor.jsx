"use client";
import editorStyles from "./editorStyles.module.scss";
import { useEffect, useRef, useState } from "react";

export default function TextEditor({ editorFun, name, initialContent }) {
  const inputRef = useRef();

  const [content, setContent] = useState({});

  const changeEdVal = (e) => {
    const newValue = e.target.value;

    setContent((prev) => {
      const updatedContent = { ...prev, [name]: newValue };

      return updatedContent;
    });
    editorFun({ [name]: newValue });
  };

  useEffect(() => {
    if (initialContent && initialContent[name] && initialContent[name][0]) {
      const newContent = { ...content, [name]: initialContent[name][0] };

      setContent(newContent);
    }
  }, [name]);

  useEffect(() => {
    if (initialContent[name] && initialContent[name][0]) {
      const newContent = { ...content, [name]: initialContent[name][0] };

      setContent(newContent);
    }
  }, [initialContent[name] && initialContent[name][0]]);

  useEffect(() => {
    if (!initialContent || initialContent[name] == undefined) {
      setContent((prev) => ({ ...prev, [name]: "" }));
    }
  }, [initialContent]);

  return (
    <textarea
      placeholder="..."
      rows={15}
      columns={20}
      className={editorStyles.input}
      ref={inputRef}
      onChange={changeEdVal}
      value={content[name] || ""}
    />
  );
}
