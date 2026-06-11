"use client";
import React, { useState, useEffect } from "react";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";
import { Button, Input, DatePicker, Row, Col, message } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { updateStudent } from "@/redux/slices/student";
import { useDispatch, useSelector } from "react-redux";

// Simplified initial accomplishment structure
const initialAccomplishment = {
  company: "",
  accomplishment: "",
  start: null,
  end: null,
  city: "",
  description: "",
  status: "warning",
  editing: true,
};

export default function WorkAndAccomplishmentsPage() {
  const dispatch = useDispatch();
  const studentDetails = useSelector((state) => state.student.student?.data);
  const [accomplishments, setAccomplishments] = useState([]);

  // Initialize from studentDetails.accomplishments or default one
  useEffect(() => {
    if (Array.isArray(studentDetails?.accomplishments)) {
      setAccomplishments(
        studentDetails.accomplishments.map((item) => ({
          ...initialAccomplishment,
          ...item,
          editing: false,
          status: "success",
        }))
      );
    } else {
      setAccomplishments([{ ...initialAccomplishment }]);
    }
  }, [studentDetails]);

  const disabledFutureMonth = (current) =>
    current && current.year() > moment().year();

  const updateField = (idx, field, value) =>
    setAccomplishments((prev) => {
      const arr = [...prev];
      arr[idx] = { ...arr[idx], [field]: value };
      return arr;
    });

  const addAccomplishment = () =>
    setAccomplishments((prev) => [...prev, { ...initialAccomplishment }]);

  const saveAccomplishment = (idx) => {
    const item = accomplishments[idx];
    if (!item.company || !item.accomplishment || !item.start || !item.end) {
      message.error(
        "Please fill Company, Accomplishment, Start Date, and End Date before saving"
      );
      return;
    }
    setAccomplishments((prev) => {
      const arr = [...prev];
      arr[idx].editing = false;
      arr[idx].status = "pending";
      return arr;
    });
    dispatch(
      updateStudent({
        dispatch,
        aboutDetails: { accomplishments },
      })
    );
  };

  return (
    <div className="max-w-full mx-auto">
      <StudentPageHeader section="Profile" title="Accomplishments" />
      {accomplishments.map((item, idx) => (
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
                {item.accomplishment}
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
              {accomplishments.length > 1 && (
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={() =>
                    setAccomplishments((prev) =>
                      prev.filter((_, i) => i !== idx)
                    )
                  }
                />
              )}
            </div>
          </div>

          {/* Form View */}
          {item.editing ? (
            <div className="mt-4">
              <Row gutter={[16, 16]}>
                {/* Company */}
                <Col span={24}>
                  <div className="flex items-center mb-4">
                    <label className="flex-none w-[200px] m-0 text-[#555] font-medium">Company</label>
                    <Input
                      className="flex-auto bg-[#eafaf1] border-none outline-none"
                      value={item.company}
                      placeholder="Company / organisation name"
                      onChange={(e) =>
                        updateField(idx, "company", e.target.value)
                      }
                    />
                  </div>
                </Col>

                {/* Accomplishment */}
                <Col span={24}>
                  <div className="flex items-center mb-4">
                    <label className="flex-none w-[200px] m-0 text-[#555] font-medium">Accomplishment</label>
                    <Input
                      className="flex-auto bg-[#eafaf1] border-none outline-none"
                      value={item.accomplishment}
                      placeholder="Describe your accomplishment"
                      onChange={(e) =>
                        updateField(idx, "accomplishment", e.target.value)
                      }
                    />
                  </div>
                </Col>

                {/* Dates */}
                <Col span={12}>
                  <div className="flex items-center mb-4">
                    <label className="flex-none w-[200px] m-0 text-[#555] font-medium">Start Date</label>
                    <DatePicker
                      className="flex-auto bg-[#eafaf1] border-none outline-none"
                      picker="month"
                      format="MM/YYYY"
                      value={item.start ? moment(item.start, "MM/YYYY") : null}
                      onChange={(date, dateString) =>
                        updateField(idx, "start", dateString)
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
                      format="MM/YYYY"
                      value={item.end ? moment(item.end, "MM/YYYY") : null}
                      onChange={(date, dateString) =>
                        updateField(idx, "end", dateString)
                      }
                      disabledDate={disabledFutureMonth}
                      style={{ width: "100%" }}
                    />
                  </div>
                </Col>

                {/* City */}
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

                {/* Description */}
                <Col span={24}>
                  <div className="flex items-center mb-4">
                    <label className="flex-none w-[200px] m-0 text-[#555] font-medium">Description</label>
                    <textarea
                      className="max-w-full w-full overflow-y-auto resize-none min-h-[8rem] h-auto rounded-[5px] p-4 text-[16px] bg-[#eafaf1] border-none outline-none"
                      value={item.description}
                      placeholder="Describe the accomplishment in detail"
                      onChange={(e) =>
                        updateField(idx, "description", e.target.value)
                      }
                    />
                  </div>
                </Col>
              </Row>

              <div className="flex justify-between mt-6">
                <Button type="primary" onClick={() => saveAccomplishment(idx)}>
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full">
              <div className="w-full flex items-center justify-start gap-2">
                <span>{item.company}</span>
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
        onClick={addAccomplishment}
        className="w-full text-center"
      >
        Add More Accomplishments
      </Button>
    </div>
  );
}
