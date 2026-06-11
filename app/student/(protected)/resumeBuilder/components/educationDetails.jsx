"use client";
import React, { useState } from "react";
import { Button, Collapse, DatePicker } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import TextEditor from "@/universalUtils/editor";
import { Select, Input, Form } from "antd";
const { Option } = Select;

const EduTitles = [
  "10th / Secondary Education",
  "12th / Diploma",
  "Degree / B.Tech",
];

const EducationDetails = ({
  educationDetails,
  updateEducationDetail,
  addEducation,
  removeEducation,
}) => {
  const handleAdd = () => addEducation();

  const handleRemove = (index) => removeEducation(index);

  const getEducationTitle = (index) =>
    EduTitles[index] || `Education Level ${index + 1}`;
  const [gradeType, setGradeType] = useState("percentage"); // or 'cgpa'

  // Validation function
  const validateGrade = (value, type) => {
    if (!value) return { valid: false, message: "Grade is required" };

    const numValue = parseFloat(value);

    if (isNaN(numValue)) {
      return { valid: false, message: "Please enter a valid number" };
    }

    if (type === "cgpa") {
      if (numValue < 0 || numValue > 10) {
        return { valid: false, message: "CGPA must be between 0 and 10" };
      }
    } else if (type === "percentage") {
      if (numValue < 0 || numValue > 100) {
        return {
          valid: false,
          message: "Percentage must be between 0 and 100",
        };
      }
    }

    return { valid: true, message: "" };
  };
  return (
    <div className="border border-solid border-[#ccc] flex flex-col justify-center items-center p-4 bg-white">
      <div className="my-3 text-2xl font-bold">Education Details</div>
      <div className="flex flex-col gap-3.5 w-[98%] [&_input]:w-[95%] [&_input]:text-[0.9rem] [&_input]:p-2 [&_input]:m-2 [&_input]:rounded-[0.3rem] [&_input]:outline-none [&_input]:border [&_input]:border-solid [&_input]:border-[#ccc] [&_textarea]:p-2 [&_textarea]:w-full [&_textarea]:m-2 [&_textarea]:rounded-[0.3rem] [&_textarea]:outline-none [&_textarea]:border [&_textarea]:border-solid [&_textarea]:border-[#ccc] [&_textarea]:h-32 [&_textarea]:resize-none">
        {educationDetails.map((item, index) => (
          <Collapse
            key={index}
            collapsible="header"
            items={[
              {
                key: index,
                label: (
                  <div className="w-full flex items-center justify-between">
                    <div>
                      {getEducationTitle(index)}
                    </div>
                    {/* {index === educationDetails.length - 1 && educationDetails.length > 1 && ( */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(index);
                      }}
                    >
                      <DeleteOutlined className="text-red-500" />
                    </div>
                    {/* )} */}
                  </div>
                ),
                children: (
                  <div>
                    <input
                      name="type"
                      placeholder="Enter Your Education Type"
                      value={item.type || ""}
                      onChange={(e) =>
                        updateEducationDetail(index, "type", e.target.value)
                      }
                    />
                    <input
                      name="board"
                      placeholder="Enter Your Education Board"
                      value={item.board || ""}
                      onChange={(e) =>
                        updateEducationDetail(index, "board", e.target.value)
                      }
                    />
                    <input
                      name="school"
                      placeholder="Enter Your Educational Institution Name"
                      value={item.school || ""}
                      onChange={(e) =>
                        updateEducationDetail(index, "school", e.target.value)
                      }
                    />
                    <input
                      name="hallticket"
                      placeholder="Enter Your HallTicket"
                      value={item.hallticket || ""}
                      onChange={(e) =>
                        updateEducationDetail(
                          index,
                          "hallticket",
                          e.target.value
                        )
                      }
                    />
                    {/* <input
                      name="startDate"
                      placeholder="Enter Your StartDate"
                      value={item.startDate || ""}
                      onChange={(e) =>
                        updateEducationDetail(index, "startDate", e.target.value)
                      }
                    /> */}

                    <DatePicker
                      onChange={(_, date) =>
                        updateEducationDetail(index, "startDate", date)
                      }
                      value={item?.startDate ? dayjs(item?.startDate) : null}
                      style={{
                        border: "none",
                        width: "100%",
                        padding: "0rem",
                        outline: "none",
                      }}
                    />
                    <DatePicker
                      onChange={(_, date) =>
                        updateEducationDetail(index, "endDate", date)
                      }
                      value={item?.endDate ? dayjs(item?.endDate) : null}
                      style={{
                        border: "none",
                        width: "100%",
                        padding: "0rem",
                        outline: "none",
                      }}
                      disabledDate={(current) => {
                        // Disable dates before the start date
                        if (!item?.startDate) return false;
                        return (
                          current &&
                          current < dayjs(item.startDate).startOf("day")
                        );
                      }}
                    />
                    {/* <input
                      name="endDate"
                      placeholder="Enter Your EndDate"
                      value={item.endDate || ""}
                      onChange={(e) =>
                        updateEducationDetail(index, "endDate", e.target.value)
                      }
                    /> */}
                    <input
                      name="yearofPass"
                      placeholder="Enter Your Year Of Pass"
                      value={dayjs(item?.endDate).year() || ""}
                      // onChange={(e) =>
                      //   updateEducationDetail(
                      //     index,
                      //     "yearofPass",
                      //     e.target.value
                      //   )
                      // }
                      disabled
                    />
                    {/* <input
                      name="grade"
                      placeholder="Enter Your Grade"
                      value={item.grade || ""}
                      onChange={(e) =>
                        updateEducationDetail(index, "grade", e.target.value)
                      }
                    /> */}
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "center",
                      }}
                    >
                      <Select
                        value={item.gradeType || "percentage"}
                        onChange={(value) => {
                          updateEducationDetail(index, "gradeType", value);
                          updateEducationDetail(index, "grade", ""); // Clear grade on type change
                        }}
                        style={{ width: 140 }}
                      >
                        <Option value="percentage">Percentage</Option>
                        <Option value="cgpa">CGPA</Option>
                      </Select>

                      <Input
                        name="grade"
                        placeholder={
                          item.gradeType === "cgpa"
                            ? "Enter CGPA (0-10)"
                            : "Enter Percentage (0-100)"
                        }
                        value={item.grade || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          const validation = validateGrade(
                            value,
                            item.gradeType || "percentage"
                          );
                          updateEducationDetail(index, "grade", value);
                          // Optionally set error state
                          if (!validation.valid && value) {
                            updateEducationDetail(
                              index,
                              "gradeError",
                              validation.message
                            );
                          } else {
                            updateEducationDetail(index, "gradeError", "");
                          }
                        }}
                        status={item.gradeError ? "error" : ""}
                        // suffix={item.gradeType === "cgpa" ? "/10" : "%"}
                        style={{ flex: 1 }}
                      />
                    </div>
                    {item.gradeError && (
                      <div
                        style={{
                          color: "#ff4d4f",
                          fontSize: "12px",
                          marginTop: "4px",
                        }}
                      >
                        {item.gradeError}
                      </div>
                    )}
                    <input
                      name="city"
                      placeholder="Enter Your City"
                      value={item.city || ""}
                      onChange={(e) =>
                        updateEducationDetail(index, "city", e.target.value)
                      }
                    />
                    <input
                      name="stream"
                      placeholder="Enter Your Stream"
                      value={item.stream || ""}
                      onChange={(e) =>
                        updateEducationDetail(index, "stream", e.target.value)
                      }
                    />
                    {/* <textarea
                      name="description"
                      placeholder="Description"
                      value={item.description || ""}
                      onChange={(e) =>
                        updateEducationDetail(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                    /> */}
                    <TextEditor
                      initialContent={{ description: item.description } || ""}
                      editorFun={(e) =>
                        updateEducationDetail(index, "description", e)
                      }
                      name="description"
                    />
                  </div>
                ),
              },
            ]}
          />
        ))}

        <Button className="text-[#4096ff] border-[#4096ff]" onClick={handleAdd}>
          Add More
        </Button>
      </div>
    </div>
  );
};

export default EducationDetails;
