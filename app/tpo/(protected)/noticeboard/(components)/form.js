"use client";
import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Select,
  Upload,
  DatePicker,
  Radio,
  Button,
  Space,
  message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { FormFields } from "./formschema";
import styles from "../notice.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { CreateNotice, UpdateNotice } from "@/redux/slices/tpo/noticewboardSlice";
import { handleS3Upload } from "@/utils/universalUtils/s3uploads";
import { restUrl } from "@/utils/universalUtils/urls";

const { Option } = Select;

const STU_ALL = "STU_ALL";
const STU_BATCH = "STU_BATCH";
const STU_DEPT = "STU_DEPT";
const STU_BATCH_DEPT = "STU_BATCH_DEPT";

export default function NoticeForm({
  initialValues = {},
  onFinish,
  currentTab,
}) {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [targetGroupCode, setTargetGroupCode] = useState("");
  const { value: departMent } = useSelector(
    (state) => state.department.getAllDepartments
  );

  const departments = (departMent?.data || []).map((dept) => ({
    label: dept?.title,
    value: dept?._id,
    emoji: "🏫",
    desc: dept?.hodName || "Department",
  }));

  const isEditMode = initialValues && Object.keys(initialValues).length > 0;

  useEffect(() => {
    if (isEditMode) {
      const updates = {
        ...initialValues,
        startDate: initialValues.startDate
          ? dayjs(initialValues.startDate)
          : null,
        endDate: initialValues.endDate ? dayjs(initialValues.endDate) : null,
        batchYear: initialValues.batchYear
          ? dayjs(initialValues.batchYear, "YYYY")
          : null,
        targetGroupCode: initialValues.targetGroup?.code || "",
      };
      for (let key in initialValues.targetGroup) {
        let val = initialValues.targetGroup[key];
        if (key?.includes("batch")) {
          val = dayjs(val, "YYYY");
        }
        updates[key] = val;
      }
      form.setFieldsValue({ ...updates });
      setTargetGroupCode(initialValues.targetGroup?.code || "");
    } else {
      form.resetFields();
      setTargetGroupCode("");
    }
  }, [initialValues, isEditMode]);

  const formatFormDates = (values) => {
    return Object.fromEntries(
      Object.entries(values).map(([key, val]) => {
        if (dayjs.isDayjs(val)) {
          if (key === "batchYear") {
            return [key, val.format("YYYY")];
          }
          if (["startDate", "endDate"].includes(key)) {
            return [key, val.format("DD-MMMM-YYYY HH:mm:ss")];
          }
        }
        return [key, val];
      })
    );
  };

  // const handleSubmit = (values) => {
  //   const formattedValues = {
  //     ...formatFormDates(values),
  //     status: "active",
  //   };

  //   if (isEditMode) {
  //     dispatch(
  //       UpdateNotice({
  //         updatedpayload: { ...formattedValues, status: currentTab },
  //         noticeId: initialValues?._id,
  //       })
  //     );
  //     console.log(formattedValues);
  //   } else {
  //     console.log(formattedValues);
  //     dispatch(CreateNotice({ dispatch, payload: formattedValues }));
  //   }
  //   onFinish && onFinish();
  // };

  const handleSubmit = (values) => {
    const formattedValues = {
      ...formatFormDates(values),
      status: "active",
    };

    if (isEditMode) {
      let targetGroup = { code: formattedValues.targetGroupCode };
      if (
        targetGroup.code === STU_BATCH ||
        targetGroup.code === STU_BATCH_DEPT
      ) {
        if (formattedValues.batchYear) {
          targetGroup.batchYear = formattedValues.batchYear;
        }
      }
      if (
        targetGroup.code === STU_DEPT ||
        targetGroup.code === STU_BATCH_DEPT
      ) {
        if (formattedValues.deptId) {
          targetGroup.deptId = formattedValues.deptId;
        }
      }
      delete formattedValues.targetGroupCode;
      delete formattedValues.batchYear;
      delete formattedValues.deptId;

      formattedValues.targetGroup = targetGroup;
      // console.log(formattedValues);

      dispatch(
        UpdateNotice({
          updatedpayload: { ...formattedValues, status: currentTab },
          noticeId: initialValues?._id,
        })
      );
    } else {
      // console.log(formattedValues);
      dispatch(CreateNotice({ dispatch, payload: formattedValues }));
    }
    onFinish && onFinish();
  };

  const handleDraft = async () => {
    try {
      const values = await form.validateFields();
      const formattedValues = {
        ...formatFormDates(values),
        status: "pending",
      };
      dispatch(CreateNotice({ dispatch, payload: formattedValues }));
      onFinish && onFinish();
    } catch {
      message.error("Please fill required fields before saving as draft");
    }
  };

  const RenderTargetGroup = () => {
    switch (targetGroupCode) {
      case STU_BATCH:
        return (
          <Form.Item
            label="Passing Year"
            name="batchYear"
            rules={[{ required: true, message: "Passing Year is required" }]}
          >
            <DatePicker
              picker="year"
              style={{ width: "100%" }}
              placeholder="Select Year"
            />
          </Form.Item>
        );
      case STU_DEPT:
        return (
          <Form.Item
            label="Departments"
            name="deptId"
            rules={[
              { required: true, message: "Select at least one department" },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Select department(s)"
              optionRender={(option) => (
                <Space>
                  <span role="img" aria-label={option.data.label}>
                    {option.data.emoji}
                  </span>
                  {option.data.label}
                </Space>
              )}
              options={departments}
            />
          </Form.Item>
        );
      case STU_BATCH_DEPT:
        return (
          <>
            <Form.Item
              label="Passing Year"
              name="batchYear"
              rules={[{ required: true, message: "Passing Year is required" }]}
            >
              <DatePicker
                picker="year"
                style={{ width: "100%" }}
                placeholder="Select Year"
              />
            </Form.Item>
            <Form.Item
              label="Departments"
              name="deptId"
              rules={[
                { required: true, message: "Select at least one department" },
              ]}
            >
              <Select
                mode="multiple"
                placeholder="Select department(s)"
                optionRender={(option) => (
                  <Space>
                    <span role="img" aria-label={option.data.label}>
                      {option.data.emoji}
                    </span>
                    {option.data.label}
                  </Space>
                )}
                options={departments}
              />
            </Form.Item>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Form
      layout="vertical"
      form={form}
      onFinish={handleSubmit}
      className={styles.formCont}
    >
      {FormFields.map((field) => {
        const commonProps = {
          label: field.label,
          name: field.name,
          rules: field.required
            ? [{ required: true, message: `${field.label} is required` }]
            : [],
        };
        switch (field.type) {
          case "text":
            return (
              <Form.Item key={field.name} {...commonProps}>
                <Input />
              </Form.Item>
            );
          case "textarea":
            return (
              <Form.Item key={field.name} {...commonProps}>
                <Input.TextArea rows={10} />
              </Form.Item>
            );
          case "select":
            return (
              <React.Fragment key={field.name}>
                <Form.Item {...commonProps}>
                  <Select
                    placeholder={`Select ${field.label}`}
                    onChange={(value) => {
                      if (field.name === "targetGroupCode") {
                        setTargetGroupCode(value);
                      }
                    }}
                  >
                    {(field.options || []).map((opt) => (
                      <Option key={opt.value ?? opt} value={opt.value ?? opt}>
                        {opt.label ?? opt}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                {field.name === "targetGroupCode" && RenderTargetGroup()}
              </React.Fragment>
            );
          case "upload":
            return (
              <Form.Item
                key={field.name}
                {...commonProps}
                valuePropName="fileList"
                getValueFromEvent={(e) => {
                  if (Array.isArray(e)) {
                    return e;
                  }
                  return e?.fileList;
                }}
              >
                <Upload
                  customRequest={({ file, onSuccess, onError }) =>
                    handleS3Upload({
                      file,
                      restUrl,
                      onUploaded: (uploadedUrl) => {
                        // Get current form value (array of URLs or undefined)
                        const currentUrls =
                          form.getFieldValue(field.name) || [];

                        // Add new URL to array
                        const updatedUrls = Array.isArray(currentUrls)
                          ? [...currentUrls, uploadedUrl]
                          : [uploadedUrl];

                        // Store as a custom property on the file object
                        file.url = uploadedUrl;

                        // Call onSuccess with the file
                        onSuccess({ url: uploadedUrl }, file);
                      },
                      onSuccess,
                      onError,
                    })
                  }
                  multiple
                  onChange={(info) => {
                    // Optional: Handle upload status changes
                    if (info.file.status === "done") {
                      message.success(
                        `${info.file.name} uploaded successfully`
                      );
                    } else if (info.file.status === "error") {
                      message.error(`${info.file.name} upload failed`);
                    }
                  }}
                >
                  <Button icon={<UploadOutlined />}>Click to Upload</Button>
                </Upload>
              </Form.Item>
            );
          case "date":
            return (
              <Form.Item key={field.name} {...commonProps}>
                <DatePicker
                  showTime
                  style={{ width: "100%" }}
                  disabledDate={(current) =>
                    field.name === "startDate"
                      ? current && current < dayjs().startOf("day")
                      : false
                  }
                />
              </Form.Item>
            );
          case "radio":
            return (
              <Form.Item key={field.name} {...commonProps}>
                <Radio.Group>
                  <Radio value={true}>Yes</Radio>
                  <Radio value={false}>No</Radio>
                </Radio.Group>
              </Form.Item>
            );
          default:
            return null;
        }
      })}
      <Form.Item>
        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
            {isEditMode ? "Update Notice" : "Publish Notice"}
          </Button>
          {!isEditMode && (
            <Button onClick={handleDraft} style={{ width: "100%" }}>
              Save as Draft
            </Button>
          )}
        </Space>
      </Form.Item>
    </Form>
  );
}
