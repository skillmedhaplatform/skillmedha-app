"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Upload,
  message,
  Popconfirm,
  Space,
  Switch,
  Tooltip,
  DatePicker,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
  LinkOutlined,
  EditOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import styles from "./newsflash.module.scss";
import {
  fetchMarqueeNotices,
  createMarqueeNotice,
  deleteMarqueeNotice,
  updateMarqueeNotice,
  updateMarqueeSettings,
} from "@/redux/slices/admin/cms/marqueeSlice";

const { TextArea } = Input;

export default function NewsFlashPage() {
  const dispatch = useDispatch();
  const { notices, loading, globalEnabled } = useSelector((state) => state.marquee) || {};
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    dispatch(fetchMarqueeNotices());
  }, [dispatch]);

  const handleSubmit = async (values) => {
    if (editMode) {
      // Update Logic
      const updates = {
        title: values.title,
        description: values.description,
        url: values.url,
        hasForm: values.hasForm || false,
        expiryDate: values.expiryDate.toISOString(),
      };

      const result = await dispatch(updateMarqueeNotice({ id: editingId, updates }));

      if (updateMarqueeNotice.fulfilled.match(result)) {
        message.success("Updated successfully");
        closeModal();
        dispatch(fetchMarqueeNotices());
      } else {
        message.error(result.payload?.error || "Update failed");
      }

    } else {


      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("url", values.url || "");
      formData.append("hasForm", values.hasForm || false);
      formData.append("expiryDate", values.expiryDate.toISOString());
      formData.append("bucketName", "skillmedha-utils"); // Default bucket
      if (fileList.length > 0) {
        formData.append("thumbnail", fileList[0].originFileObj);
      }

      const result = await dispatch(createMarqueeNotice(formData));

      if (createMarqueeNotice.fulfilled.match(result)) {
        message.success("NewsFlash created successfully");
        closeModal();
        dispatch(fetchMarqueeNotices()); // Refresh list
      } else {
        message.error(result.payload?.error || "Failed to create notice");
      }
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.error("Form validation failed:", errorInfo);
    message.error("Please fill all required fields correctly.");
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditMode(false);
    setEditingId(null);
    form.resetFields();
    setFileList([]);
  };

  const handleEdit = (record) => {
    setEditMode(true);
    setEditingId(record._id);
    form.setFieldsValue({
      title: record.title,
      description: record.description,
      url: record.url,
      hasForm: record.hasForm,
      expiryDate: record.expiryDate ? dayjs(record.expiryDate) : null,
    });
    setFileList([]);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const result = await dispatch(deleteMarqueeNotice(id));
    if (deleteMarqueeNotice.fulfilled.match(result)) {
      message.success("Deleted successfully");
    } else {
      message.error(result.payload?.error || "Delete failed");
    }
  };

  const handleGlobalToggle = async (checked) => {
    const result = await dispatch(updateMarqueeSettings(checked));
    if (updateMarqueeSettings.fulfilled.match(result)) {
      message.success(`Global FlashNews ${checked ? 'Enabled' : 'Disabled'}`);
    } else {
      message.error("Failed to update global settings");
    }
  };

  const handleToggleActive = async (checked, record) => {
    const result = await dispatch(updateMarqueeNotice({
      id: record._id,
      updates: { active: checked }
    }));
    if (updateMarqueeNotice.fulfilled.match(result)) {
      message.success(`Notice ${checked ? 'activated' : 'deactivated'}`);
    } else {
      message.error("Failed to update status");
    }
  };

  const handleToggleHasForm = async (checked, record) => {
    const result = await dispatch(updateMarqueeNotice({
      id: record._id,
      updates: { hasForm: checked }
    }));
    if (updateMarqueeNotice.fulfilled.match(result)) {
      message.success(`Form ${checked ? 'enabled' : 'disabled'}`);
    } else {
      message.error("Failed to update form status");
    }
  };

  const columns = [
    {
      title: "Thumbnail",
      dataIndex: "thumbnail",
      key: "thumbnail",
      render: (url) => (
        <img
          src={url || "/placeholder.svg"}
          alt="Thumbnail"
          style={{ width: 80, height: 45, objectFit: "cover", borderRadius: 4 }}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/placeholder.svg";
          }}
        />
      ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      width: "20%",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "URL",
      dataIndex: "url",
      key: "url",
      render: (url) =>
        url ? (
          <a href={url} target="_blank" rel="noopener noreferrer">
            <LinkOutlined /> Link
          </a>
        ) : (
          "-"
        ),
    },
    {
      title: "Expiry Date",
      dataIndex: "expiryDate",
      key: "expiryDate",
      render: (date) => (date ? dayjs(date).format("YYYY-MM-DD") : "-"),
    },
    {
      title: "Has Form",
      dataIndex: "hasForm",
      key: "hasForm",
      render: (hasForm, record) => (
        <Switch
          checked={hasForm}
          onChange={(checked) => handleToggleHasForm(checked, record)}
        />
      ),
    },
    {
      title: "Active",
      dataIndex: "active",
      key: "active",
      render: (active, record) => {
        const isExpired = record.expiryDate && dayjs().isAfter(dayjs(record.expiryDate));

        if (isExpired) {
          return (
            <Tooltip title="This news has expired. Please update the Expiry Date to enable it again.">
              <Switch checked={false} disabled />
            </Tooltip>
          );
        }

        return (
          <Switch
            checked={active}
            onChange={(checked) => handleToggleActive(checked, record)}
          />
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              style={{ color: '#1890ff' }}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this notice?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const uploadProps = {
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("You can only upload image files!");
      }
      return false; // Prevent auto upload
    },
    onChange: ({ fileList: newFileList }) => {
      setFileList(newFileList.slice(-1)); // Keep only last file
    },
    fileList,
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Website NewsFlash</h1>
        <Space align="center" size="large">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#fffbe6", padding: "8px 16px", border: "1px solid #ffe58f", borderRadius: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "14px", fontWeight: "600", color: "#d48806" }}>Global Visibility</span>
              <Tooltip title="Turn off to hide the entire FlashNews component from the public website, regardless of individual active statuses.">
                <InfoCircleOutlined style={{ color: "#d48806", cursor: "pointer" }} />
              </Tooltip>
            </div>
            <Switch
              checked={globalEnabled}
              onChange={handleGlobalToggle}
              checkedChildren="Enabled"
              unCheckedChildren="Disabled"
            />
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              closeModal(); // Ensure reset
              setIsModalOpen(true);
            }}
            style={{ height: "100%", padding: "12px 16px" }}
          >
            Create NewsFlash
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={notices}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editMode ? "Edit NewsFlash" : "Create New NewsFlash"}
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onFinishFailed={onFinishFailed}
          initialValues={{ bucketName: "skillmedha-utils" }}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Please enter title" }]}
          >
            <Input placeholder="Enter title" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <TextArea rows={4} placeholder="Enter description" />
          </Form.Item>

          <Form.Item
            name="url"
            label="URL"
            rules={[
              { type: "url", message: "Please enter a valid URL (e.g., https://example.com)" }
            ]}
          >
            <Input placeholder="https://example.com" />
          </Form.Item>

          <Form.Item
            name="hasForm"
            label="Has Form"
            valuePropName="checked"
          >
            <Switch checkedChildren="Yes" unCheckedChildren="No" />
          </Form.Item>

          <Form.Item
            name="expiryDate"
            label="Expiry Date"
            rules={[{ required: true, message: "Please select an Expiry Date" }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          {!editMode && (
            <Form.Item label="Thumbnail Image">
              <Upload {...uploadProps} listType="picture">
                <Button icon={<UploadOutlined />}>Select Image</Button>
              </Upload>
            </Form.Item>
          )}

          <Form.Item>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={closeModal}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editMode ? "Update" : "Create"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
