"use client";
import React, { useState, useEffect } from "react";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";
import { Button, Input, DatePicker, Row, Col, message, Popconfirm } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
// REPLACED moment with dayjs
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

import { updateStudent } from "@/redux/slices/student";
import { useDispatch, useSelector } from "react-redux";

// Month format for storage and parsing
const monthFormat = "MM/YYYY";

// Initial structure for volunteering entries
const initialVolunteering = {
  organization: "",
  volunteering: "",
  start: null,
  end: null,
  city: "",
  description: "",
  status: "warning",
  editing: true,
};

export default function WorkAndVolunteeringPage() {
  const dispatch = useDispatch();
  const studentDetails = useSelector((state) => state.student.student?.data);
  const [volunteerings, setVolunteerings] = useState([]);

  // Load existing or default
  useEffect(() => {
    if (Array.isArray(studentDetails?.volunteerings)) {
      setVolunteerings(
        studentDetails.volunteerings.map((item) => ({
          ...initialVolunteering,
          ...item,
          editing: false,
          status: "success",
        }))
      );
    } else {
      setVolunteerings([{ ...initialVolunteering }]);
    }
  }, [studentDetails]);

  // Disable months after the current month (reference style)
  const disabledFutureMonth = (current) =>
    current && current.isAfter(dayjs(), "month");

  const updateField = (idx, field, value) =>
    setVolunteerings((prev) => {
      const arr = [...prev];
      arr[idx] = { ...arr[idx], [field]: value };
      return arr;
    });

  const addVolunteering = () =>
    setVolunteerings((prev) => [...prev, { ...initialVolunteering }]);

  const saveVolunteering = (idx) => {
    const item = volunteerings[idx];
    if (!item.organization || !item.volunteering || !item.start || !item.end) {
      message.error(
        "Please fill Organization, Volunteering, Start Date, and End Date before saving"
      );
      return;
    }
    if (item.end && item.end <= item.start) {
      message.error(
        "Please fill Organization, Volunteering, Start Date, and End Date before saving"
      );
      return false;
    }
    setVolunteerings((prev) => {
      const arr = [...prev];
      arr[idx].editing = false;
      arr[idx].status = "pending";
      return arr;
    });
    dispatch(
      updateStudent({
        dispatch,
        aboutDetails: { volunteerings },
      })
    );
  };
  const deleteVoluntering = (idx) => {
    setVolunteerings((prev) => {
      const updated = prev.filter((_, i) => i !== idx);

      dispatch(
        updateStudent({
          dispatch,
          aboutDetails: { volunteerings: updated },
        })
      );

      return updated;
    });
  };

  return (
    <div className="max-w-full mx-auto">
      <StudentPageHeader section="Profile" title="Volunteering" />
      {volunteerings.map((item, idx) => (
        <div key={idx} className="border border-solid border-[#24A058] rounded-lg p-6 mb-6 relative bg-white">
          {/* Header */}
          <div className="flex justify-between items-center text-[#24A058]">
            <div className="flex gap-2 justify-start items-center">
              {item.status === "success" ? (
                <CheckCircleOutlined />
              ) : (
                <ExclamationCircleOutlined />
              )}
              <div className="text-[1.2rem] font-bold flex gap-2 items-center">
                {item.volunteering || "New Volunteering"}
                <span>-</span>
                {item?.verificationType == "approved" ? (
                  <div className="text-base text-green-500">Verified</div>
                ) : item?.verificationType == "resubmission" ? (
                  <div className="text-base text-red-500">Re-Submit</div>
                ) : (
                  <div className="text-base text-[#ffc400]">Not Verified.</div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {!item.editing && (
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => updateField(idx, "editing", true)}
                />
              )}
              {volunteerings.length > 1 && (
                <Popconfirm
                  title="Delete this Voluteering?"
                  description="This action cannot be undone."
                  okText="Delete"
                  cancelText="Cancel"
                  okButtonProps={{ danger: true }}
                  placement="left"
                  onConfirm={() => deleteVoluntering(idx)}
                >
                  <Button type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              )}
            </div>
          </div>

          {/* Form or Display */}
          {item.editing ? (
            <div className="mt-4">
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <div className="flex items-center mb-4">
                    <label className="flex-none w-[200px] m-0 text-[#555] font-medium">Organization</label>
                    <Input
                      className="flex-auto bg-[#eafaf1] border-none outline-none"
                      value={item.organization}
                      placeholder="Organization name"
                      onChange={(e) =>
                        updateField(idx, "organization", e.target.value)
                      }
                    />
                  </div>
                </Col>

                <Col span={24}>
                  <div className="flex items-center mb-4">
                    <label className="flex-none w-[200px] m-0 text-[#555] font-medium">Volunteering</label>
                    <Input
                      className="flex-auto bg-[#eafaf1] border-none outline-none"
                      value={item.volunteering}
                      placeholder="Describe your volunteering"
                      onChange={(e) =>
                        updateField(idx, "volunteering", e.target.value)
                      }
                    />
                  </div>
                </Col>

                <Col span={12}>
                  <div className="flex items-center mb-4">
                    <label className="flex-none w-[200px] m-0 text-[#555] font-medium">Start Date</label>
                    <DatePicker
                      className="flex-auto bg-[#eafaf1] border-none outline-none"
                      picker="month"
                      format={monthFormat}
                      value={item.start ? dayjs(item.start, monthFormat) : null}
                      onChange={(date) =>
                        updateField(
                          idx,
                          "start",
                          date ? date.format(monthFormat) : null
                        )
                      }
                      disabledDate={disabledFutureMonth}
                      style={{ width: "100%" }}
                    />
                  </div>
                </Col>
                <Col span={12}>
                  <div className="flex items-center mb-4">
                    <label className="flex-none w-[200px] m-0 text-[#555] font-medium">End Date</label>
                    <DatePicker
                      className="flex-auto bg-[#eafaf1] border-none outline-none"
                      picker="month"
                      format={monthFormat}
                      value={item.end ? dayjs(item.end, monthFormat) : null}
                      onChange={(date) =>
                        updateField(
                          idx,
                          "end",
                          date ? date.format(monthFormat) : null
                        )
                      }
                      disabledDate={disabledFutureMonth}
                      style={{ width: "100%" }}
                    />
                  </div>
                </Col>

                <Col span={24}>
                  <div className="flex items-center mb-4">
                    <label className="flex-none w-[200px] m-0 text-[#555] font-medium">City</label>
                    <Input
                      className="flex-auto bg-[#eafaf1] border-none outline-none"
                      value={item.city}
                      placeholder="City"
                      onChange={(e) => updateField(idx, "city", e.target.value)}
                    />
                  </div>
                </Col>

                <Col span={24}>
                  <div className="flex items-center mb-4">
                    <label className="flex-none w-[200px] m-0 text-[#555] font-medium">Description</label>
                    <textarea
                      className="max-w-full w-full overflow-y-auto resize-none min-h-[8rem] h-auto rounded-[5px] p-4 text-[16px] bg-[#eafaf1] border-none outline-none"
                      value={item.description}
                      placeholder="Describe the volunteering in detail"
                      onChange={(e) =>
                        updateField(idx, "description", e.target.value)
                      }
                    />
                  </div>
                </Col>
              </Row>

              <div className="flex justify-between mt-6">
                <Button type="primary" onClick={() => saveVolunteering(idx)}>
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full">
              <div className="w-full flex items-center justify-start gap-2">
                <span>{item.organization}</span>
                <span>
                  {" "}
                  | {item.start} to {item.end}
                </span>
                <span> | {item.city}</span>
              </div>
              <hr />
              <div className="w-full">
                {item.description.length > 300
                  ? item.description.substring(0, 300) + "..."
                  : item.description}
              </div>
            </div>
          )}
        </div>
      ))}

      <Button
        type="dashed"
        icon={<PlusOutlined />}
        onClick={addVolunteering}
        className="w-full text-center"
      >
        Add More Volunteering
      </Button>
    </div>
  );
}
