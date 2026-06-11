"use client";
import React, { useState, useEffect } from "react";
import { message, Tooltip } from "antd";
// import { Tooltip } from "@mui/material";
import ChipStyles from "./chip.module.scss";

export default function ChipInput({ initialValue = [], onChipsChange }) {
  const [chips, setChips] = useState(initialValue);

  // if parent ever gives a new initialValue, sync once
  useEffect(() => {
    setChips(initialValue);
  }, [initialValue]);

  // whenever chips change, inform parent
  useEffect(() => {
    onChipsChange?.(chips);
  }, [chips, onChipsChange]);

  const handleAdd = (e) => {
    if (e.code !== "Enter") return;
    const text = e.target.value.trim();
    if (!text) return message.warning("Value shouldn't be empty");
    if (text.length > 15)
      return message.warning("Value shouldn't exceed 15 characters");
    if (chips.includes(text)) return message.warning("Already added");
    setChips((prev) => [...prev, text]);
    e.target.value = "";
  };

  const handleDelete = (name) => {
    setChips((prev) => prev.filter((c) => c !== name));
  };

  return (
    <div className={ChipStyles.container}>
      <Tooltip
        title={<p style={{ fontSize: ".8rem" }}>Press Enter to save</p>}
        placement="top"
      >
        <input
          className={ChipStyles.input}
          placeholder="Enter to save"
          onKeyDown={handleAdd}
        />
      </Tooltip>
      <div className={ChipStyles.chipContainer}>
        {chips.map((name) => (
          <div key={name} className={ChipStyles.chipData}>
            <p>{name}</p>
            <img
              src="https://res.cloudinary.com/cliqtick/image/upload/v1722511937/sysnper/53da26962c207566fc273c8904009a36_o2mxsj.png"
              onClick={() => handleDelete(name)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
