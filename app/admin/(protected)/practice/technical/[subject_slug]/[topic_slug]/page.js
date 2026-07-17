"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "../../../practiceStyles.module.scss";
import {
  DeleteOutlined,
  EditOutlined,
  FolderOpenOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { useRouter, useParams } from "next/navigation";
import {
  Button,
  Input,
  Space,
  message,
  Popconfirm,
  Divider,
  Tooltip,
  Select,
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

// Avatar color palette
const AVATAR_COLORS = [
  "#d946ef", "#0ea5e9", "#8b5cf6", "#25a667",
  "#1E69DA", "#593cc1", "#c5782b", "#e53e3e",
];

const getAvatarColor = (name) => {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const SubtopicManager = () => {
  const nav = useRouter();
  const params = useParams();
  const { subject_slug, topic_slug } = params;
  const dispatch = useDispatch();
  const { canAccess, getPermissionMessage } = usePermissions();

  // Redux state
  const { subtopics, topics, subjects, status, error } = useSelector((state) => state.adminPractice);
  const loading = status === "loading";

  // Local states
  const [editingId, setEditingId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [tempSubtopics, setTempSubtopics] = useState([]);
  const [editingValues, setEditingValues] = useState({});

  // Get current breadcrumb context
  const currentSubject = subjects.find((s) => s._id === subject_slug);
  const subjectTitle = currentSubject ? currentSubject.title : "Subjects";
  const currentTopic = topics.find((t) => t._id === topic_slug);
  const topicTitle = currentTopic ? currentTopic.title : "Topics";

  // Fetch subtopics for this topic on component mount
  useEffect(() => {
    if (topic_slug) {
      dispatch(fetchSubtopicsByTopic(topic_slug));
    }
  }, [dispatch, topic_slug]);

  // Ensure subjects and topics are loaded for breadcrumbs
  useEffect(() => {
    if (subjects.length === 0) {
      dispatch(fetchSubjectsByType("technical"));
    }
    if (topics.length === 0 && subject_slug) {
      dispatch(fetchTopicsBySubject(subject_slug));
    }
  }, [dispatch, subjects.length, topics.length, subject_slug]);

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
      topic: topic_slug,
    };

    setTempSubtopics((prev) => [...prev, newSubtopic]);
    setEditingId(tempId);

    const totalSubtopics = subtopics.length + tempSubtopics.length + 1;
    const totalPages = Math.ceil(totalSubtopics / pageSize);
    setCurrentPage(totalPages);
  };

  const handleSave = async (id) => {
    try {
      const isNewSubtopic = id.startsWith("temp-");
      let subtopic;
      let titleValue;

      if (isNewSubtopic && !canAccess(PERMISSION_VALUES.CREATE)) {
        message.info(getPermissionMessage(PERMISSION_VALUES.CREATE));
        return;
      }
      if (!isNewSubtopic && !canAccess(PERMISSION_VALUES.EDIT)) {
        message.info(getPermissionMessage(PERMISSION_VALUES.EDIT));
        return;
      }

      if (isNewSubtopic) {
        subtopic = tempSubtopics.find((s) => s._id === id);
        titleValue = subtopic?.title;
      } else {
        titleValue = editingValues[id] || subtopics.find((s) => s._id === id)?.title;
      }

      if (!titleValue?.trim()) {
        message.error("Please enter a subtopic title");
        return;
      }

      if (isNewSubtopic) {
        const subtopicData = {
          title: titleValue.trim(),
          topicId: topic_slug,
        };

        await dispatch(createSubtopic(subtopicData)).unwrap();
        message.success("Subtopic created successfully");

        setTempSubtopics((prev) => prev.filter((s) => s._id !== id));
      } else {
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

    if (subtopic._id.startsWith("temp-")) {
      message.warning("Please save the subtopic first");
      return;
    }

    nav.push(`/admin/practice/technical/${subject_slug}/${topic_slug}/${subtopic._id}`);
  };

  const isEditing = (record) => record._id === editingId;

  const edit = (record) => {
    setEditingId(record._id);
    if (!record._id.startsWith("temp-")) {
      setEditingValues((prev) => ({
        ...prev,
        [record._id]: record.title,
      }));
    }
  };

  const cancel = () => {
    if (editingId?.startsWith("temp-")) {
      setTempSubtopics((prev) => prev.filter((s) => s._id !== editingId));
    } else {
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
      setTempSubtopics((prev) =>
        prev.map((s) => (s._id === id ? { ...s, [field]: value } : s))
      );
    } else {
      setEditingValues((prev) => ({
        ...prev,
        [id]: value,
      }));
    }
  };

  const getDisplayValue = (record) => {
    if (record._id.startsWith("temp-")) {
      return record.title || "";
    }
    return editingValues[record._id] !== undefined
      ? editingValues[record._id]
      : record.title;
  };

  const allSubtopics = [...subtopics, ...tempSubtopics];
  const displaySubtopics = allSubtopics.filter(
    (subtopic) => subtopic && subtopic._id && subtopic.title !== undefined
  );

  const totalPages = Math.ceil(displaySubtopics.length / pageSize);
  const paginatedSubtopics = displaySubtopics.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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
              + Create Subtopic
            </Button>
          </span>
        </Tooltip>
      </div>

      <Divider style={{ margin: "0.75rem 0" }} />

      {paginatedSubtopics.length > 0 ? (
        <div className={styles.cardsList}>
          {paginatedSubtopics.map((record, index) => {
            const editing = isEditing(record);
            const displayValue = getDisplayValue(record);
            const isTemp = record._id.startsWith("temp-");
            const subtopicNumber = (currentPage - 1) * pageSize + index + 1;

            return (
              <div
                key={record._id}
                className={`${styles.itemCard} ${editing ? styles.editing : ""}`}
                onClick={() => !editing && handleOpenSubtopic(record)}
              >
                {/* Avatar */}
                <div
                  className={styles.itemAvatar}
                  style={{ backgroundColor: getAvatarColor(displayValue) }}
                >
                  {getInitials(displayValue || `ST${subtopicNumber}`)}
                </div>

                {/* Info */}
                <div className={styles.itemInfo}>
                  {editing ? (
                    <Input
                      value={displayValue}
                      onChange={(e) =>
                        handleFieldChange(record._id, "title", e.target.value)
                      }
                      onPressEnter={() => handleSave(record._id)}
                      placeholder="Enter subtopic title…"
                      autoFocus
                      disabled={loading}
                      className={styles.inlineEditInput}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <>
                      <span className={styles.itemTitle}>
                        {displayValue || "Untitled Subtopic"}
                      </span>
                      <span className={styles.itemSubtitle}>
                        Subtopic {subtopicNumber}
                      </span>
                    </>
                  )}
                </div>

                {/* Meta */}
                <div className={styles.itemMeta}>
                  {!editing && (
                    <span className={styles.statusBadgeCard}>
                      <span className={styles.statusDotCard}></span>
                      Active
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div
                  className={styles.itemActions}
                  onClick={(e) => e.stopPropagation()}
                >
                  {editing ? (
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
                    <Space>
                      <Button
                        size="small"
                        type="primary"
                        onClick={() => handleOpenSubtopic(record)}
                        disabled={!record.title?.trim() || loading || isTemp}
                        icon={<FolderOpenOutlined />}
                      >
                        Open
                      </Button>
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
                      {isTemp ? (
                        <Button
                          size="small"
                          onClick={() => {
                            setTempSubtopics((prev) =>
                              prev.filter((s) => s._id !== record._id)
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
                      ) : (
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
                      )}
                    </Space>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.cardEmptyState}>
          <InboxOutlined className={styles.cardEmptyIcon} />
          <span className={styles.cardEmptyText}>No Subtopics Found</span>
          <span className={styles.cardEmptySub}>
            Start by adding your first subtopic
          </span>
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
      )}

      {/* Pagination */}
      {displaySubtopics.length > 0 && (
        <div className={styles.paginationRow}>
          <div className={styles.paginationLeft}>
            <span className={styles.pageSizeLabel}>Items per page</span>
            <Select
              value={pageSize}
              onChange={(value) => {
                setPageSize(value);
                setCurrentPage(1);
              }}
              options={[
                { value: 5, label: "5" },
                { value: 10, label: "10" },
                { value: 20, label: "20" },
                { value: 50, label: "50" },
              ]}
              size="small"
              style={{ minWidth: 70 }}
            />
            <span className={styles.showingText}>
              {Math.min((currentPage - 1) * pageSize + 1, displaySubtopics.length)}-
              {Math.min(currentPage * pageSize, displaySubtopics.length)} of{" "}
              {displaySubtopics.length} subtopics
            </span>
          </div>
          <div className={styles.paginationRight}>
            <button
              className={styles.pageBtn}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`${styles.pageBtn} ${
                  currentPage === page ? styles.pageBtnActive : ""
                }`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              className={styles.pageBtn}
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubtopicManager;
