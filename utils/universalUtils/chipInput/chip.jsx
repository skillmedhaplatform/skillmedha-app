"use client";
import {
  addChip,
  initalizeChips,
  removeChip,
} from "@/redux/slices/chipSlice";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ChipStyles from "./chip.module.scss";
import { message } from "antd";
import { Tooltip } from "@mui/material";

export default function ChipInput({ keyName, initialValue, handleUpdate }) {
  const values = useSelector((state) => state.steps.value);
  const chipsData = useSelector((state) => state?.chipSlice[keyName]);

  const dispatch = useDispatch();
  const handleAddhip = (e) => {
    let type = "";
    switch (keyName) {
      case "testCategory":
        type = "test";
        break;
      case "questionCategory":
        type = "question";
        break;
      case "testLanguage":
        type = "language";
        break;
      case "questionTag":
        type = "questionTag";
        break;
    }
    if (e.code == "Enter" && (type !== null || type !== "")) {
      if (
        e.target.value.trim() == "" ||
        e.target.value == undefined ||
        e.target.value == null
      )
        return message.warning("Value shouldn't be empty");

      if (e.target.value.trim().length > 15) {
        return message.warning("Value shouldn't exceed 10 characters");
      }
      dispatch(
        addChip({
          keyName,
          name: e.target.value,
          type: type,
        })
      );
      e.target.value = "";
    }
  };
  const handleChipDelete = (chip) => {
    dispatch(removeChip({ keyName, chipId: chip._id }));
  };
  useEffect(() => {
    dispatch(initalizeChips({ keyName, initialValue }));
  }, [initialValue]);
  return (
    <div className={ChipStyles.container}>
      <Tooltip
        title={<p style={{ fontSize: ".8rem" }}>Enter to Save</p>}
        placement="top"
      >
        <input
          onKeyDown={(e) => handleAddhip(e)}
          className={ChipStyles.input}
          placeholder="Enter to save"
          style={{
            border: "1px solid #d9d9d9",
            padding: "8px 12px",
            borderRadius: "6px",
            // width: "100%",
            outline: "none",
            fontSize: "14px",
            background: "#fff",
            marginBottom: "8px"
          }}
        />
      </Tooltip>
      <div className={ChipStyles.chipContainer}>
        {chipsData &&
          chipsData.map((e) => {
            return (
              <div key={e._id} className={ChipStyles.chipData}>
                <p>{e.name}</p>
                <img
                  src="https://res.cloudinary.com/cliqtick/image/upload/v1722511937/sysnper/53da26962c207566fc273c8904009a36_o2mxsj.png"
                  onClick={() => handleChipDelete(e)}
                />
              </div>
            );
          })}
      </div>
    </div>
  );
}
