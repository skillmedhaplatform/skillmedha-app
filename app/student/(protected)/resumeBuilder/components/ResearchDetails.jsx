"use client"

import React from 'react'
import { useDispatch, useSelector } from "react-redux";
import { Button, Collapse } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { addResearchDetails } from "../../Redux/slices/ResearchDetailsSlice";

function ResearchDetails() {
  const dispatch = useDispatch();
  const researchDetails = useSelector(
    (state) => state.researchDetails.student?.data?.researchDetails
  );

  const handleAddExperience = () => {
    const newExperience = {
      id: new Date().getTime(),
      organization: "",
      type: "",
      startDate: "",
      endDate: "",
      title: "",
      description: "",
    };
    dispatch(addResearchDetails([...researchDetails, newExperience]));
  };

  const handleRemoveExperience = (index) => {
    if (researchDetails.length === 1) return;
    const updated = researchDetails.filter((_, i) => i !== index);
    dispatch(addResearchDetails(updated));
  };

  const handleInputChange = (index, name, value) => {
    const updated = [...researchDetails];
    updated[index] = { ...updated[index], [name]: value };
    dispatch(addResearchDetails(updated));
  };

  return (
    <div className="border border-solid border-[#ccc] flex flex-col justify-center items-center p-4 bg-white">
      <div className="my-3 text-2xl font-bold">Research Details</div>

      <div className="flex flex-col gap-3.5 w-[98%] [&_input]:w-[95%] [&_input]:text-[0.9rem] [&_input]:p-2 [&_input]:m-2 [&_input]:rounded-[0.3rem] [&_input]:outline-none [&_input]:border [&_input]:border-solid [&_input]:border-[#ccc] [&_textarea]:p-2 [&_textarea]:w-full [&_textarea]:m-2 [&_textarea]:rounded-[0.3rem] [&_textarea]:outline-none [&_textarea]:border [&_textarea]:border-solid [&_textarea]:border-[#ccc] [&_textarea]:h-32 [&_textarea]:resize-none">
        {researchDetails.map((item, index) => (
          <Collapse
            key={item.id}
            collapsible="header"
            items={[
              {
                key: item.id,
                label: (
                  <div className="w-full flex items-center justify-between">
                    <div>
                      {item.organization || item.type
                        ? `${item.organization} - ${item.type}`
                        : `Research ${index + 1}`}
                    </div>
                    {/* {researchDetails.length > 1 && ( */}
                    <DeleteOutlined
                      className="text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveExperience(index);
                      }}
                    />
                    {/* )} */}
                  </div>
                ),
                children: (
                  <div>
                    <input
                      name="organization"
                      placeholder="Enter Organization Name"
                      value={item.organization}
                      onChange={(e) =>
                        handleInputChange(index, "organization", e.target.value)
                      }
                    />
                    <input
                      name="type"
                      placeholder="Enter Your type"
                      value={item.type}
                      onChange={(e) =>
                        handleInputChange(index, "type", e.target.value)
                      }
                    />
                    <input
                      name="startDate"
                      placeholder="Enter Start Date"
                      value={item.startDate}
                      onChange={(e) =>
                        handleInputChange(index, "startDate", e.target.value)
                      }
                    />
                    <input
                      name="endDate"
                      placeholder="Enter End Date"
                      value={item.endDate}
                      onChange={(e) =>
                        handleInputChange(index, "endDate", e.target.value)
                      }
                    />
                    <input
                      name="title"
                      placeholder="Enter title"
                      value={item.title}
                      onChange={(e) =>
                        handleInputChange(index, "title", e.target.value)
                      }
                    />
                    <textarea
                      name="description"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) =>
                        handleInputChange(index, "description", e.target.value)
                      }
                    />
                  </div>
                ),
              },
            ]}
          />
        ))}

        <Button className="text-[#4096ff] border-[#4096ff]" onClick={handleAddExperience}>
          Add More
        </Button>
      </div>
    </div>
  );

}

export default ResearchDetails
