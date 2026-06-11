'use client';
import React from "react";
import { Button, Collapse } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

const AccomplishmentDetails = ({ accDetails, updateAccomplishment, addAccomplishment, removeAccomplishment }) => {

  const handleAdd = () => addAccomplishment();

  const handleRemove = (index) => removeAccomplishment(index);

  return (
    <div className="border border-solid border-[#ccc] flex flex-col justify-center items-center p-4 bg-white">
      <div className="my-3 text-2xl font-bold">Accomplishments</div>
      <div className="flex flex-col gap-3.5 w-[98%] [&_input]:w-[95%] [&_input]:text-[0.9rem] [&_input]:p-2 [&_input]:m-2 [&_input]:rounded-[0.3rem] [&_input]:outline-none [&_input]:border [&_input]:border-solid [&_input]:border-[#ccc] [&_textarea]:p-2 [&_textarea]:w-full [&_textarea]:m-2 [&_textarea]:rounded-[0.3rem] [&_textarea]:outline-none [&_textarea]:border [&_textarea]:border-solid [&_textarea]:border-[#ccc] [&_textarea]:h-32 [&_textarea]:resize-none">
        {accDetails.map((item, index) => (
          <Collapse
            key={item.id || index}
            collapsible="header"
            items={[
              {
                key: item.id || index,
                label: (
                  <div className="w-full flex items-center justify-between">
                    <div>
                      {item.company || item.accomplishment
                        ? `${item.company} - ${item.accomplishment}`
                        : `Accomplishment ${index + 1}`}
                    </div>
                    {accDetails.length > 1 && (
                      <DeleteOutlined
                        className="text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(index);
                        }}
                      />
                    )}
                  </div>
                ),
                children: (
                  <div>
                    <input
                      name="company"
                      placeholder="Enter Company Name"
                      value={item.company}
                      onChange={(e) =>
                        updateAccomplishment(index, "company", e.target.value)
                      }
                    />
                    <input
                      name="accomplishment"
                      placeholder="Enter Your Accomplishment"
                      value={item.accomplishment}
                      onChange={(e) =>
                        updateAccomplishment(index, "accomplishment", e.target.value)
                      }
                    />
                    <input
                      name="startDate"
                      placeholder="Enter Start Date"
                      value={item.startDate}
                      onChange={(e) =>
                        updateAccomplishment(index, "startDate", e.target.value)
                      }
                    />
                    <input
                      name="endDate"
                      placeholder="Enter End Date"
                      value={item.endDate}
                      onChange={(e) =>
                        updateAccomplishment(index, "endDate", e.target.value)
                      }
                    />
                    <input
                      name="city"
                      placeholder="Enter City"
                      value={item.city}
                      onChange={(e) =>
                        updateAccomplishment(index, "city", e.target.value)
                      }
                    />
                    <textarea
                      name="description"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) =>
                        updateAccomplishment(index, "description", e.target.value)
                      }
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

export default AccomplishmentDetails;
