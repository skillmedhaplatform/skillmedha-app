"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "../../../practiceStyles.module.scss";
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
  fetchSubtopicsByTopic,
  createSubtopic,
  updateSubtopic,
  deleteSubtopic,
  fetchTopicsBySubject,
  fetchSubjectsByType,
} from "@/redux/slices/admin/cms/practiceSlice";
import PracticeBreadcrumbs from "@/app/admin/(protected)/practice/Practice_utils/practiceBreadcrumbs";
import { usePermissions, PERMISSION_VALUES } from "@/hooks/usepermission";

const SubtopicManager = () => {
  const nav = useRouter();
  const params = useParams();
  const { subject_slug, topic_slug } = params;
  const dispatch = useDispatch();
  const { canAccess, getPermissionMessage } = usePermissions();

  // Redux state
  const { subtopics, status, error } = useSelector((state) => state.adminPractice);
  const loading = status === "loading";

  // Local states
  const [editingId, setEditingId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [tempSubtopics, setTempSubtopics] = useState([]); // For new subtopics being added
  const [editingValues, setEditingValues] = useState({}); // For editing existing subtopics

  // Fetch subtopics for this topic on component mount
  useEffect(() => {
    if (topic_slug) {
      const fetchData = async () => {
        try {
          await Promise.all([
            dispatch(fetchSubtopicsByTopic(topic_slug)).unwrap(),
            dispatch(fetchTopicsBySubject(subject_slug)).unwrap(),
            dispatch(fetchSubjectsByType("nontechnical")).unwrap(),
          ]);
        } catch (error) {
          console.error("Failed to fetch data:", error);
        }
      };

      fetchData();
    }
  }, [dispatch, topic_slug, subject_slug]);

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
    const newSubtopic = {
      _id: tempId,
      title: "",
      subjectId: subject_slug,
      topicId: topic_slug,
    };

    // Add to temporary subtopics array
    setTempSubtopics((prev) => [...prev, newSubtopic]);
    setEditingId(tempId);

    // Navigate to last page to show the new subtopic
    const totalSubtopics = subtopics.length + tempSubtopics.length + 1;
    const totalPages = Math.ceil(totalSubtopics / pageSize);
    setCurrentPage(totalPages);
  };

  const handleSave = async (id) => {
    const isNewSubtopic = id.startsWith("temp-");
    if (isNewSubtopic) {
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
      let subtopic;
      let titleValue;

      if (isNewSubtopic) {
        // Find subtopic in temporary subtopics
        subtopic = tempSubtopics.find((st) => st._id === id);
        titleValue = subtopic?.title;
      } else {
        // For existing subtopics, get the edited value or original value
        titleValue =
          editingValues[id] || subtopics.find((st) => st._id === id)?.title;
      }

      if (!titleValue?.trim()) {
        message.error("Please enter a subtopic title");
        return;
      }

      if (isNewSubtopic) {
        // Create new subtopic
        const subtopicData = {
          title: titleValue.trim(),
          subjectId: subject_slug,
          topicId: topic_slug,
        };

        await dispatch(createSubtopic(subtopicData)).unwrap();
        message.success("Subtopic created successfully");

        // Remove from temporary subtopics
        setTempSubtopics((prev) => prev.filter((st) => st._id !== id));
      } else {
        // Update existing subtopic
        const updateData = {
          title: titleValue.trim(),
        };

        await dispatch(
          updateSubtopic({
            subtopicId: id,
            data: updateData,
          })
        ).unwrap();
        message.success("Subtopic updated successfully");

        // Clear editing value
        setEditingValues((prev) => {
          const newValues = { ...prev };
          delete newValues[id];
          return newValues;
        });
      }

      setEditingId("");
    } catch (error) {
      message.error("Failed to save subtopic");
      console.error("Save error:", error);
    }
  };

  const handleDelete = async (subtopic) => {
    if (!canAccess(PERMISSION_VALUES.DELETE)) {
      message.info(getPermissionMessage(PERMISSION_VALUES.DELETE));
      return;
    }
    try {
      await dispatch(deleteSubtopic(subtopic._id)).unwrap();
      message.success("Subtopic deleted successfully");

      // Adjust pagination if needed
      const totalPages = Math.ceil((subtopics.length - 1) / pageSize);
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      }
    } catch (error) {
      message.error("Failed to delete subtopic");
      console.error("Delete error:", error);
    }
  };

  const handleOpenSubtopic = (subtopic) => {
    if (!subtopic.title?.trim()) {
      message.warning("Please save the subtopic first");
      return;
    }

    // Don't allow opening temp subtopics
    if (subtopic._id.startsWith("temp-")) {
      message.warning("Please save the subtopic first");
      return;
    }
    nav.push(
      `/admin/practice/technical/${subject_slug}/${topic_slug}/${subtopic._id}`
    );
  };

  const isEditing = (record) => record._id === editingId;

  const edit = (record) => {
    setEditingId(record._id);

    // For existing subtopics, initialize the editing value
    if (!record._id.startsWith("temp-")) {
      setEditingValues((prev) => ({
        ...prev,
        [record._id]: record.title,
      }));
    }
  };

  const cancel = () => {
    // If it's a temporary subtopic being edited, remove it from temp subtopics
    if (editingId?.startsWith("temp-")) {
      setTempSubtopics((prev) => prev.filter((st) => st._id !== editingId));
    } else {
      // For existing subtopics, clear editing value
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
      // Update temporary subtopic
      setTempSubtopics((prev) =>
        prev.map((st) => (st._id === id ? { ...st, [field]: value } : st))
      );
    } else {
      // Update editing values for existing subtopics
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

  // Get the display value for a subtopic (either editing value or original value)
  const getDisplayValue = (record) => {
    if (record._id.startsWith("temp-")) {
      return record.title || "";
    }
    return editingValues[record._id] !== undefined
      ? editingValues[record._id]
      : record.title;
  };

  // Combine subtopics from Redux and temporary subtopics
  const allSubtopics = [...subtopics, ...tempSubtopics];
  const displaySubtopics = allSubtopics.filter(
    (subtopic) => subtopic && subtopic._id && subtopic.title !== undefined
  );

  const columns = [
    {
      title: "Subtopic #",
      dataIndex: "index",
      width: 120,
      render: (_, __, index) => {
        const subtopicNumber = (currentPage - 1) * pageSize + index + 1;
        return `Subtopic ${subtopicNumber}`;
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
            placeholder="Enter subtopic title…"
            autoFocus
            disabled={loading}
            style={{ width: "100%" }}
          />
        ) : (
          <span>{displayValue || "Untitled Subtopic"}</span>
        );
      },
    },
    {
      title: "Open Subtopic",
      width: 160,
      render: (_, record) => (
        <Button
          size="small"
          type="primary"
          onClick={() => handleOpenSubtopic(record)}
          disabled={
            !record.title?.trim() || loading || record._id.startsWith("temp-")
          }
          icon={<FolderOpenOutlined />}
        >
          Open Subtopic
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
          // For temporary subtopics, just show a cancel button
          return (
            <Button
              size="small"
              onClick={() => {
                setTempSubtopics((prev) =>
                  prev.filter((st) => st._id !== record._id)
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

        // For existing subtopics, show confirm dialog wrapped with permission tooltip
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
                title="Are you sure you want to delete this subtopic?"
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
    total: displaySubtopics.length,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) =>
      `${range[0]}-${range[1]} of ${total} subtopics`,
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
              style={{ width: "12rem" }}
              disabled={loading || !canAccess(PERMISSION_VALUES.CREATE)}
            >
              + Create Subtopic
            </Button>
          </span>
        </Tooltip>
      </div>

      <Divider style={{ margin: "1rem 0" }} />

      <Table
        columns={columns}
        dataSource={displaySubtopics}
        rowKey="_id"
        pagination={paginationConfig}
        size="middle"
        bordered
        className={styles.subtopicsTable}
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
              <h3>No Subtopics Found</h3>
              <p style={{ color: "#888" }}>
                Start by adding your first subtopic for this topic
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
                    + Add Subtopic
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

export default SubtopicManager;
