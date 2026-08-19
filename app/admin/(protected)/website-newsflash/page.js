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
  Drawer,
  Divider,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
  LinkOutlined,
  EditOutlined,
  InfoCircleOutlined,
  SearchOutlined,
  RightOutlined,
  CalendarOutlined,
  FormOutlined,
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
  const [searchText, setSearchText] = useState("");
  const [previewNotice, setPreviewNotice] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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

  const filteredNotices = (notices || []).filter((notice) =>
    (notice.title || "").toLowerCase().includes(searchText.toLowerCase()) ||
    (notice.description || "").toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "Thumbnail",
      dataIndex: "thumbnail",
      key: "thumbnail",
      width: 85,
      render: (url) => (
        <img
          src={url || "/placeholder.svg"}
          alt="Thumbnail"
          style={{ width: 64, height: 38, objectFit: "cover", borderRadius: 4 }}
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
      width: 180,
      ellipsis: true,
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: 240,
      ellipsis: true,
    },
    {
      title: "URL",
      dataIndex: "url",
      key: "url",
      width: 85,
      render: (url) =>
        url ? (
          <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: "#1E69DA" }}>
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
      width: 110,
      render: (date) => (date ? dayjs(date).format("YYYY-MM-DD") : "-"),
    },
    {
      title: "Has Form",
      dataIndex: "hasForm",
      key: "hasForm",
      width: 90,
      align: "center",
      render: (hasForm, record) => (
        <Switch
          size="small"
          checked={hasForm}
          onChange={(checked) => handleToggleHasForm(checked, record)}
        />
      ),
    },
    {
      title: "Active",
      dataIndex: "active",
      key: "active",
      width: 90,
      align: "center",
      render: (active, record) => {
        const isExpired = record.expiryDate && dayjs().isAfter(dayjs(record.expiryDate));

        if (isExpired) {
          return (
            <Tooltip title="This news has expired. Please update the Expiry Date to enable it again.">
              <Switch size="small" checked={false} disabled />
            </Tooltip>
          );
        }

        return (
          <Switch
            size="small"
            checked={active}
            onChange={(checked) => handleToggleActive(checked, record)}
          />
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 90,
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              style={{ color: '#1E69DA' }}
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
      <div className={styles.titleContainer}>
        <Input
          placeholder="Search newsflash..."
          prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
          className={styles.searchInput}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />
        <div className={styles.headerActions}>
          <div className={styles.visibilityToggle}>
            <InfoCircleOutlined style={{ color: "#64748B" }} />
            <span className={styles.visibilityLabel}>Global Visibility</span>
            {globalEnabled && (
              <span className={styles.enabledBadge}>
                Enabled
              </span>
            )}
            <Switch
              size="small"
              checked={globalEnabled}
              onChange={handleGlobalToggle}
              style={{ background: globalEnabled ? "#22C55E" : undefined }}
            />
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              closeModal(); // Ensure reset
              setIsModalOpen(true);
            }}
            className={styles.createBtn}
          >
            Create NewsFlash
          </Button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className={styles.tableWrapper}>
        <Table
          columns={columns}
          dataSource={filteredNotices}
          rowKey="_id"
          loading={loading}
          scroll={{ x: 960 }}
          pagination={{ pageSize: 10, position: ["bottomRight"] }}
        />
      </div>

      {/* Mobile & Tablet Card List View */}
      <div className={styles.mobileCardList}>
        {filteredNotices.map((notice) => {
          const isExpired = notice.expiryDate && dayjs().isAfter(dayjs(notice.expiryDate));
          return (
            <div
              key={notice._id}
              className={styles.mobileCard}
              onClick={() => {
                setPreviewNotice(notice);
                setIsPreviewOpen(true);
              }}
            >
              <div className={styles.cardMain}>
                <img
                  src={notice.thumbnail || "/placeholder.svg"}
                  alt={notice.title}
                  className={styles.cardThumbnail}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
                <div className={styles.cardInfo}>
                  <h4 className={styles.cardTitle}>{notice.title}</h4>
                  {notice.description && (
                    <p className={styles.cardDescription}>{notice.description}</p>
                  )}
                  <div className={styles.cardMeta}>
                    {notice.expiryDate && (
                      <span className={`${styles.metaBadge} ${isExpired ? styles.expiredBadge : styles.expiryBadge}`}>
                        <CalendarOutlined /> {dayjs(notice.expiryDate).format("DD MMM YYYY")}
                      </span>
                    )}
                    {notice.hasForm && (
                      <span className={`${styles.metaBadge} ${styles.formBadge}`}>
                        <FormOutlined /> Form
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.cardFooter} onClick={(e) => e.stopPropagation()}>
                <div className={styles.statusSwitch}>
                  <span className={styles.statusText}>{notice.active ? "Active" : "Inactive"}</span>
                  <Switch
                    size="small"
                    checked={notice.active}
                    disabled={isExpired}
                    onChange={(checked) => handleToggleActive(checked, notice)}
                  />
                </div>
                <div className={styles.cardActions}>
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(notice)}
                    style={{ color: "#1E69DA" }}
                  />
                  <Popconfirm
                    title="Delete this notice?"
                    onConfirm={() => handleDelete(notice._id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button type="text" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                  <Button
                    type="text"
                    icon={<RightOutlined />}
                    onClick={() => {
                      setPreviewNotice(notice);
                      setIsPreviewOpen(true);
                    }}
                    style={{ color: "#64748B" }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview Bottom Sheet Drawer for Mobile/Tablet */}
      <Drawer
        title={null}
        placement="bottom"
        onClose={() => setIsPreviewOpen(false)}
        open={isPreviewOpen}
        height="auto"
        className={styles.previewDrawer}
        styles={{
          body: {
            padding: "1.25rem 1.25rem 2rem 1.25rem",
            maxHeight: "85vh",
            overflowY: "auto",
            borderTopLeftRadius: "16px",
            borderTopRightRadius: "16px",
          },
          content: {
            borderTopLeftRadius: "16px",
            borderTopRightRadius: "16px",
          }
        }}
      >
        {previewNotice && (
          <div className={styles.drawerDetails}>
            <div className={styles.sheetHandle} />

            {/* Thumbnail Banner */}
            {previewNotice.thumbnail && (
              <div className={styles.previewThumbnailWrap}>
                <img
                  src={previewNotice.thumbnail}
                  alt={previewNotice.title}
                  className={styles.previewThumbnail}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
              </div>
            )}

            {/* Title & Description */}
            <div className={styles.previewHeader}>
              <h3>{previewNotice.title}</h3>
              {previewNotice.description && (
                <p className={styles.previewDesc}>{previewNotice.description}</p>
              )}
            </div>

            <Divider style={{ margin: "14px 0" }} />

            {/* Info Grid */}
            <div className={styles.previewInfoGrid}>
              <div className={styles.previewInfoItem}>
                <span className={styles.label}>Destination URL</span>
                <span className={styles.value}>
                  {previewNotice.url ? (
                    <a href={previewNotice.url} target="_blank" rel="noopener noreferrer" style={{ color: "#1E69DA" }}>
                      <LinkOutlined /> {previewNotice.url}
                    </a>
                  ) : "None"}
                </span>
              </div>
              <div className={styles.previewInfoItem}>
                <span className={styles.label}>Expiry Date</span>
                <span className={styles.value}>
                  {previewNotice.expiryDate ? dayjs(previewNotice.expiryDate).format("DD MMMM YYYY") : "No Expiry"}
                </span>
              </div>
              <div className={styles.previewInfoItem}>
                <span className={styles.label}>Form Attached</span>
                <span className={styles.value}>
                  <Switch
                    size="small"
                    checked={previewNotice.hasForm}
                    onChange={(checked) => handleToggleHasForm(checked, previewNotice)}
                  />
                </span>
              </div>
              <div className={styles.previewInfoItem}>
                <span className={styles.label}>Active Status</span>
                <span className={styles.value}>
                  <Switch
                    size="small"
                    checked={previewNotice.active}
                    disabled={previewNotice.expiryDate && dayjs().isAfter(dayjs(previewNotice.expiryDate))}
                    onChange={(checked) => handleToggleActive(checked, previewNotice)}
                  />
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className={styles.drawerActionButtons}>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => {
                  setIsPreviewOpen(false);
                  handleEdit(previewNotice);
                }}
                style={{ flex: 1, height: "40px", borderRadius: "8px", fontWeight: 600, background: "#1E69DA" }}
              >
                Edit Notice
              </Button>
              <Popconfirm
                title="Delete this notice?"
                onConfirm={() => {
                  setIsPreviewOpen(false);
                  handleDelete(previewNotice._id);
                }}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  style={{ height: "40px", borderRadius: "8px" }}
                >
                  Delete
                </Button>
              </Popconfirm>
            </div>
          </div>
        )}
      </Drawer>

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
