"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "../../practiceStyles.module.scss";
import {
  DeleteOutlined,
  EditOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons";
import { useRouter, useParams } from "next/navigation";
import {
  Button,
  Table,
  Input,
  Space,
  message,
  Popconfirm,
  Divider,
  Tooltip,
} from "antd";
import {
  fetchTopicsBySubject,
  createTopic,
  updateTopic,
  deleteTopic,
  fetchSubjectsByType,
} from "@/redux/slices/admin/cms/practiceSlice";
import PracticeBreadcrumbs from "../../Practice_utils/practiceBreadcrumbs";
import { usePermissions, PERMISSION_VALUES } from "@/hooks/usepermission";

const TopicManager = () => {
  const nav = useRouter();
  const params = useParams();
  const { subject_slug } = params;
  const dispatch = useDispatch();
  const { canAccess, getPermissionMessage } = usePermissions();

  // Redux state
  const { topics, status, error } = useSelector((state) => state.adminPractice);
  const loading = status === "loading";

  // Local states
  const [editingId, setEditingId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [tempTopics, setTempTopics] = useState([]); // For new topics being added
  const [editingValues, setEditingValues] = useState({}); // For editing existing topics

  // Fetch topics for this subject on component mount
  useEffect(() => {
    if (subject_slug) {
      dispatch(fetchTopicsBySubject(subject_slug));
      dispatch(fetchSubjectsByType("technical"));
    }
  }, [dispatch, subject_slug]);

  // Handle errors
  useEffect(() => {
    if (status === "failed" && error) {
      message.error(error);
    }
  }, [status, error]);

  const handleAdd = () => {
    if (!canAccess(PERMISSION_VALUES.CREATE)) {
      message.info(getPermissionMessage(PERMISSION_VALUES.CREATE));
      return;
    }
    const tempId = `temp-${Date.now()}`;
    const newTopic = {
      _id: tempId,
      title: "",
      subjectId: subject_slug,
    };

    // Add to temporary topics array
    setTempTopics((prev) => [...prev, newTopic]);
    setEditingId(tempId);

    // Navigate to last page to show the new topic
    const totalTopics = topics.length + tempTopics.length + 1;
    const totalPages = Math.ceil(totalTopics / pageSize);
    setCurrentPage(totalPages);
  };

  const handleSave = async (id) => {
    const isNewTopic = id.startsWith("temp-");
    if (isNewTopic) {
      if (!canAccess(PERMISSION_VALUES.CREATE)) {
        message.info(getPermissionMessage(PERMISSION_VALUES.CREATE));
        return;
      }
    } else {
      if (!canAccess(PERMISSION_VALUES.EDIT)) {
        message.info(getPermissionMessage(PERMISSION_VALUES.EDIT));
        return;
      }
    }
    try {
      let topic;
      let titleValue;

      if (isNewTopic) {
        // Find topic in temporary topics
        topic = tempTopics.find((t) => t._id === id);
        titleValue = topic?.title;
      } else {
        // For existing topics, get the edited value or original value
        titleValue =
          editingValues[id] || topics.find((t) => t._id === id)?.title;
      }

      if (!titleValue?.trim()) {
        message.error("Please enter a topic title");
        return;
      }

      if (isNewTopic) {
        // Create new topic
        const topicData = {
          title: titleValue.trim(),
          subjectId: subject_slug,
        };

        await dispatch(createTopic(topicData)).unwrap();
        message.success("Topic created successfully");

        // Remove from temporary topics
        setTempTopics((prev) => prev.filter((t) => t._id !== id));
      } else {
        // Update existing topic
        const updateData = {
          title: titleValue.trim(),
        };

        await dispatch(
          updateTopic({
            topicId: id,
            data: updateData,
          })
        ).unwrap();
        message.success("Topic updated successfully");

        // Clear editing value
        setEditingValues((prev) => {
          const newValues = { ...prev };
          delete newValues[id];
          return newValues;
        });
      }

      setEditingId("");
    } catch (error) {
      message.error("Failed to save topic");
      console.error("Save error:", error);
    }
  };

  const handleDelete = async (topic) => {
    if (!canAccess(PERMISSION_VALUES.DELETE)) {
      message.info(getPermissionMessage(PERMISSION_VALUES.DELETE));
      return;
    }
    try {
      await dispatch(deleteTopic(topic._id)).unwrap();
      message.success("Topic deleted successfully");

      // Adjust pagination if needed
      const totalPages = Math.ceil((topics.length - 1) / pageSize);
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      }
    } catch (error) {
      message.error("Failed to delete topic");
      console.error("Delete error:", error);
    }
  };

  const handleOpenTopic = (topic) => {
    if (!topic.title?.trim()) {
      message.warning("Please save the topic first");
      return;
    }

    // Don't allow opening temp topics
    if (topic._id.startsWith("temp-")) {
      message.warning("Please save the topic first");
      return;
    }
    nav.push(`/admin/practice/technical/${subject_slug}/${topic._id}`);
  };

  const isEditing = (record) => record._id === editingId;

  const edit = (record) => {
    setEditingId(record._id);

    // For existing topics, initialize the editing value
    if (!record._id.startsWith("temp-")) {
      setEditingValues((prev) => ({
        ...prev,
        [record._id]: record.title,
      }));
    }
  };

  const cancel = () => {
    // If it's a temporary topic being edited, remove it from temp topics
    if (editingId?.startsWith("temp-")) {
      setTempTopics((prev) => prev.filter((t) => t._id !== editingId));
    } else {
      // For existing topics, clear editing value
      setEditingValues((prev) => {
        const newValues = { ...prev };
        delete newValues[editingId];
        return newValues;
      });
    }
    setEditingId("");
  };

  const handleFieldChange = (id, field, value) => {
    const isTemp = id.startsWith("temp-");

    if (isTemp) {
      // Update temporary topic
      setTempTopics((prev) =>
        prev.map((t) => (t._id === id ? { ...t, [field]: value } : t))
      );
    } else {
      // Update editing values for existing topics
      setEditingValues((prev) => ({
        ...prev,
        [id]: value,
      }));
    }
  };

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  // Get the display value for a topic (either editing value or original value)
  const getDisplayValue = (record) => {
    if (record._id.startsWith("temp-")) {
      return record.title || "";
    }
    return editingValues[record._id] !== undefined
      ? editingValues[record._id]
      : record.title;
  };

  // Combine topics from Redux and temporary topics
  const allTopics = [...topics, ...tempTopics];
  const displayTopics = allTopics.filter(
    (topic) => topic && topic._id && topic.title !== undefined
  );

  const columns = [
    {
      title: "Topic #",
      dataIndex: "index",
      width: 100,
      render: (_, __, index) => {
        const topicNumber = (currentPage - 1) * pageSize + index + 1;
        return `Topic ${topicNumber}`;
      },
    },
    {
      title: "Title",
      dataIndex: "title",
      render: (text, record) => {
        const editing = isEditing(record);
        const displayValue = getDisplayValue(record);

        return editing ? (
          <Input
            value={displayValue}
            onChange={(e) =>
              handleFieldChange(record._id, "title", e.target.value)
            }
            onPressEnter={() => handleSave(record._id)}
            placeholder="Enter topic title…"
            autoFocus
            disabled={loading}
            style={{ width: "100%" }}
          />
        ) : (
          <span>{displayValue || "Untitled Topic"}</span>
        );
      },
    },
    {
      title: "Open Topic",
      width: 140,
      render: (_, record) => (
        <Button
          size="small"
          type="primary"
          onClick={() => handleOpenTopic(record)}
          disabled={
            !record.title?.trim() || loading || record._id.startsWith("temp-")
          }
          icon={<FolderOpenOutlined />}
        >
          Open Topic
        </Button>
      ),
    },
    {
      title: "Quick Edit",
      width: 160,
      render: (_, record) => {
        const editing = isEditing(record);
        const displayValue = getDisplayValue(record);
        const isTemp = record._id.startsWith("temp-");

        return editing ? (
          <Space>
            <Tooltip
              title={
                isTemp
                  ? !canAccess(PERMISSION_VALUES.CREATE)
                    ? getPermissionMessage(PERMISSION_VALUES.CREATE)
                    : ""
                  : !canAccess(PERMISSION_VALUES.EDIT)
                  ? getPermissionMessage(PERMISSION_VALUES.EDIT)
                  : ""
              }
            >
              <span>
                <Button
                  type="primary"
                  size="small"
                  onClick={() => handleSave(record._id)}
                  loading={loading}
                  disabled={
                    !displayValue?.trim() ||
                    loading ||
                    (isTemp
                      ? !canAccess(PERMISSION_VALUES.CREATE)
                      : !canAccess(PERMISSION_VALUES.EDIT))
                  }
                >
                  Save
                </Button>
              </span>
            </Tooltip>
            <Button size="small" onClick={cancel} disabled={loading}>
              Cancel
            </Button>
          </Space>
        ) : (
          <Tooltip
            title={
              !canAccess(PERMISSION_VALUES.EDIT)
                ? getPermissionMessage(PERMISSION_VALUES.EDIT)
                : ""
            }
          >
            <span>
              <Button
                size="small"
                onClick={() => edit(record)}
                icon={<EditOutlined />}
                disabled={loading || !canAccess(PERMISSION_VALUES.EDIT)}
              >
                Edit
              </Button>
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: "Remove",
      width: 100,
      render: (_, record) => {
        const isTemp = record._id.startsWith("temp-");

        if (isTemp) {
          // For temporary topics, just show a cancel button
          return (
            <Button
              size="small"
              onClick={() => {
                setTempTopics((prev) =>
                  prev.filter((t) => t._id !== record._id)
                );
                if (editingId === record._id) {
                  setEditingId("");
                }
              }}
              icon={<DeleteOutlined />}
              disabled={loading}
            >
              Cancel
            </Button>
          );
        }

        // For existing topics, show confirm dialog wrapped with permission tooltip
        return (
          <Tooltip
            title={
              !canAccess(PERMISSION_VALUES.DELETE)
                ? getPermissionMessage(PERMISSION_VALUES.DELETE)
                : ""
            }
          >
            <span>
              <Popconfirm
                title="Are you sure you want to delete this topic?"
                description="This action cannot be undone."
                okText="Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true, loading: loading }}
                onConfirm={() => handleDelete(record)}
                disabled={loading || !canAccess(PERMISSION_VALUES.DELETE)}
              >
                <Button
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  disabled={loading || !canAccess(PERMISSION_VALUES.DELETE)}
                >
                  Delete
                </Button>
              </Popconfirm>
            </span>
          </Tooltip>
        );
      },
    },
  ];

  const paginationConfig = {
    current: currentPage,
    pageSize: pageSize,
    total: displayTopics.length,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} topics`,
    pageSizeOptions: ["5", "10", "20", "50"],
    onShowSizeChange: (current, size) => {
      setPageSize(size);
      setCurrentPage(1);
    },
    onChange: (page, size) => {
      setCurrentPage(page);
      setPageSize(size);
    },
    placement: ["bottomCenter"],
    showLessItems: true,
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <PracticeBreadcrumbs />
        <Tooltip
          title={
            !canAccess(PERMISSION_VALUES.CREATE)
              ? getPermissionMessage(PERMISSION_VALUES.CREATE)
              : ""
          }
        >
          <span>
            <Button
              type="primary"
              onClick={handleAdd}
              style={{ width: "10rem" }}
              disabled={loading || !canAccess(PERMISSION_VALUES.CREATE)}
            >
              + Create Topic
            </Button>
          </span>
        </Tooltip>
      </div>

      <Divider style={{ margin: "1rem 0" }} />

      <Table
        columns={columns}
        dataSource={displayTopics}
        rowKey="_id"
        pagination={paginationConfig}
        size="middle"
        bordered
        className={styles.topicsTable}
        scroll={{ x: 800 }}
        onChange={handleTableChange}
        loading={loading}
        style={{ width: "100%" }}
        locale={{
          emptyText: (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <img
                src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
                alt="no data"
                style={{ width: 60, marginBottom: 10 }}
              />
              <h3>No Topics Found</h3>
              <p style={{ color: "#888" }}>
                Start by adding your first topic for this subject
              </p>
              <Tooltip
                title={
                  !canAccess(PERMISSION_VALUES.CREATE)
                    ? getPermissionMessage(PERMISSION_VALUES.CREATE)
                    : ""
                }
              >
                <span>
                  <Button
                    type="primary"
                    onClick={handleAdd}
                    disabled={!canAccess(PERMISSION_VALUES.CREATE)}
                  >
                    + Add Topic
                  </Button>
                </span>
              </Tooltip>
            </div>
          ),
        }}
      />
    </div>
  );
};

export default TopicManager;
