"use client";
import React from "react";
import { Button, Collapse, DatePicker, Input } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import TextEditor from "@/universalUtils/editor";

const VolunteeringDetails = ({
  volunteerings,
  updateVolunteering,
  addVolunteering,
  removeVolunteering,
}) => {
  const handleAdd = () => addVolunteering();

  const handleRemove = (index) => removeVolunteering(index);

  const disabledFutureMonth = (current) =>
    current && current > dayjs().endOf("month");

  return (
    <div className="border border-solid border-[#ccc] flex flex-col justify-center items-center p-4 bg-white">
      <div className="my-3 text-2xl font-bold">Volunteering</div>
      <div className="flex flex-col gap-3.5 w-[98%] [&_input]:w-[95%] [&_input]:text-[0.9rem] [&_input]:p-2 [&_input]:m-2 [&_input]:rounded-[0.3rem] [&_input]:outline-none [&_input]:border [&_input]:border-solid [&_input]:border-[#ccc] [&_textarea]:p-2 [&_textarea]:w-full [&_textarea]:m-2 [&_textarea]:rounded-[0.3rem] [&_textarea]:outline-none [&_textarea]:border [&_textarea]:border-solid [&_textarea]:border-[#ccc] [&_textarea]:h-32 [&_textarea]:resize-none">
        {volunteerings?.map((item, index) => (
          <Collapse
            key={item.id || index}
            collapsible="header"
            items={[
              {
                key: item.id || index,
                label: (
                  <div className="w-full flex items-center justify-between">
                    <div>
                      {item.organization || item.volunteering
                        ? `${item.organization || ""}${
                            item.organization && item.volunteering ? " - " : ""
                          }${item.volunteering || ""}`
                        : `Volunteering ${index + 1}`}
                    </div>
                    <DeleteOutlined
                      className="text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(index);
                      }}
                    />
                  </div>
                ),
                children: (
                  <div>
                    <Input
                      name="organization"
                      placeholder="Organization"
                      value={item.organization || ""}
                      onChange={(e) =>
                        updateVolunteering(
                          index,
                          "organization",
                          e.target.value
                        )
                      }
                    />

                    <Input
                      name="volunteering"
                      placeholder="Role / Volunteering Title"
                      value={item.volunteering || ""}
                      onChange={(e) =>
                        updateVolunteering(
                          index,
                          "volunteering",
                          e.target.value
                        )
                      }
                      style={{ marginTop: "0.75rem" }}
                    />

                    <DatePicker
                      picker="month"
                      format="MM/YYYY"
                      onChange={(_, dateString) =>
                        updateVolunteering(index, "start", dateString)
                      }
                      value={item?.start ? dayjs(item.start, "MM/YYYY") : null}
                      style={{
                        border: "none",
                        width: "100%",
                        padding: "0rem",
                        outline: "none",
                        marginTop: "0.75rem",
                      }}
                      disabledDate={disabledFutureMonth}
                    />

                    <DatePicker
                      picker="month"
                      format="MM/YYYY"
                      onChange={(_, dateString) =>
                        updateVolunteering(index, "end", dateString)
                      }
                      value={item?.end ? dayjs(item.end, "MM/YYYY") : null}
                      style={{
                        border: "none",
                        width: "100%",
                        padding: "0rem",
                        outline: "none",
                        marginTop: "0.75rem",
                      }}
                      disabledDate={(current) => {
                        if (!item?.start) return disabledFutureMonth(current);
                        const afterStart =
                          current &&
                          current <
                            dayjs(item.start, "MM/YYYY").startOf("month");
                        return disabledFutureMonth(current) || afterStart;
                      }}
                    />

                    <Input
                      name="city"
                      placeholder="City"
                      value={item.city || ""}
                      onChange={(e) =>
                        updateVolunteering(index, "city", e.target.value)
                      }
                      style={{ marginTop: "0.75rem" }}
                    />

                    <TextEditor
                      initialContent={{ description: item.description } || ""}
                      editorFun={(val) =>
                        updateVolunteering(index, "description", val)
                      }
                      name="description"
                    />

                    {/* Optional verification type display (if present) */}
                    {typeof item?.verificationType !== "undefined" && (
                      <div className="flex gap-2 items-center mt-2 text-sm text-gray-700">
                        <span className="font-semibold">Status:</span>
                        <span className="text-gray-900">
                          {item?.verificationType === "approved"
                            ? "Verified"
                            : item?.verificationType === "resubmission"
                            ? "Re-Submit"
                            : "Not Verified"}
                        </span>
                      </div>
                    )}
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

export default VolunteeringDetails;
