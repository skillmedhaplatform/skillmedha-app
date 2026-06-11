"use client";
import React from "react";
import { Button, Collapse, DatePicker } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import TextEditor from "@/universalUtils/editor";
import dayjs from "dayjs";

const ProjectDetails = ({
  projects,
  updateProject,
  addProject,
  removeProject,
}) => {
  const handleAdd = () => addProject();

  const handleRemove = (index) => removeProject(index);

  return (
    <div className="border border-solid border-[#ccc] flex flex-col justify-center items-center p-4 bg-white">
      <div className="my-3 text-2xl font-bold">Project Details</div>
      <div className="flex flex-col gap-3.5 w-[98%] [&_input]:w-[95%] [&_input]:text-[0.9rem] [&_input]:p-2 [&_input]:m-2 [&_input]:rounded-[0.3rem] [&_input]:outline-none [&_input]:border [&_input]:border-solid [&_input]:border-[#ccc] [&_textarea]:p-2 [&_textarea]:w-full [&_textarea]:m-2 [&_textarea]:rounded-[0.3rem] [&_textarea]:outline-none [&_textarea]:border [&_textarea]:border-solid [&_textarea]:border-[#ccc] [&_textarea]:h-32 [&_textarea]:resize-none">
        {projects.map((item, index) => (
          <Collapse
            key={item.id || index}
            collapsible="header"
            items={[
              {
                key: item.id || index,
                label: (
                  <div className="w-full flex items-center justify-between">
                    <div>
                      {item.company || item.project
                        ? `${item.company} - ${item.project}`
                        : `Projects ${index + 1}`}
                    </div>
                    {/* {projects.length > 1 && ( */}
                    <DeleteOutlined
                      className="text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(index);
                      }}
                    />
                    {/* )} */}
                  </div>
                ),
                children: (
                  <div>
                    <input
                      name="company"
                      placeholder="Enter Company Name"
                      value={item.company}
                      onChange={(e) =>
                        updateProject(index, "company", e.target.value)
                      }
                    />
                    <input
                      name="project"
                      placeholder="Enter Your Project"
                      value={item.project}
                      onChange={(e) =>
                        updateProject(index, "project", e.target.value)
                      }
                    />
                    {/* <input
                      name="startDate"
                      placeholder="Enter Start Date"
                      value={item.startDate}
                      onChange={(e) =>
                        updateProject(index, "startDate", e.target.value)
                      }
                    />
                    <input
                      name="endDate"
                      placeholder="Enter End Date"
                      value={item.endDate}
                      onChange={(e) =>
                        updateProject(index, "endDate", e.target.value)
                      }
                    /> */}
                    <DatePicker
                      onChange={(_, date) =>
                        updateProject(index, "startDate", date)
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
                        updateProject(index, "endDate", date)
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
                    <input
                      name="city"
                      placeholder="Enter City"
                      value={item.city}
                      onChange={(e) =>
                        updateProject(index, "city", e.target.value)
                      }
                    />
                    {/* <textarea
                      name="description"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateProject(index, "description", e.target.value)}
                    /> */}

                    <TextEditor
                      initialContent={{ description: item.description } || ""}
                      editorFun={(e) => updateProject(index, "description", e)}
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

export default ProjectDetails;
