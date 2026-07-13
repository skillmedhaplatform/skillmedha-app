"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "../../practiceStyles.module.scss";
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
  fetchTopicsBySubject,
  createTopic,
  updateTopic,
  deleteTopic,
  fetchSubjectsByType,
} from "@/redux/slices/admin/cms/practiceSlice";
import PracticeBreadcrumbs from "@/app/admin/(protected)/practice/Practice_utils/practiceBreadcrumbs";
import { usePermissions, PERMISSION_VALUES } from "@/hooks/usepermission";

// Avatar color palette
const AVATAR_COLORS = [
  "#593cc1", "#25a667", "#1E69DA", "#c5782b",
  "#e53e3e", "#0ea5e9", "#8b5cf6", "#d946ef",
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

const TopicManager = () => {
  const nav = useRouter();
  const params = useParams();
  const { subject_slug } = params;
  const dispatch = useDispatch();
  const { canAccess, getPermissionMessage } = usePermissions();

  // Redux state
  const { topics, subjects, status, error } = useSelector((state) => state.adminPractice);
  const loading = status === "loading";

  // Local states
  const [editingId, setEditingId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [tempTopics, setTempTopics] = useState([]); // For new topics being added
  const [editingValues, setEditingValues] = useState({}); // For editing existing topics

  // Find the current subject title
  const currentSubject = subjects.find((s) => s._id === subject_slug);
  const subjectTitle = currentSubject ? currentSubject.title : "Topics";

  // Fetch topics for this subject on component mount
  useEffect(() => {
    if (subject_slug) {
      dispatch(fetchTopicsBySubject(subject_slug));
    }
  }, [dispatch, subject_slug]);

  // Ensure subjects are loaded (for the title)
  useEffect(() => {
    if (subjects.length === 0) {
      dispatch(fetchSubjectsByType("nontechnical"));
    }
  }, [dispatch, subjects.length]);

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
      subject: subject_slug,
    };

    setTempTopics((prev) => [...prev, newTopic]);
    setEditingId(tempId);

    // Calculate the new total number of topics and set the page to the last page
    const totalTopics = topics.length + tempTopics.length + 1;
    const totalPages = Math.ceil(totalTopics / pageSize);
    setCurrentPage(totalPages); // Move to the last page to show the new row
  };

  const handleSave = async (id) => {
    try {
      const isNewTopic = id.startsWith("temp-");
      let topic;
      let titleValue;

      // Ensure permissions before saving
      if (isNewTopic && !canAccess(PERMISSION_VALUES.CREATE)) {
        message.info(getPermissionMessage(PERMISSION_VALUES.CREATE));
        return;
      }
      if (!isNewTopic && !canAccess(PERMISSION_VALUES.EDIT)) {
        message.info(getPermissionMessage(PERMISSION_VALUES.EDIT));
        return;
      }

      if (isNewTopic) {
        topic = tempTopics.find((t) => t._id === id);
        titleValue = topic?.title;
      } else {
        titleValue = editingValues[id] || topics.find((t) => t._id === id)?.title;
      }

      if (!titleValue?.trim()) {
        message.error("Please enter a topic title");
        return;
      }

      if (isNewTopic) {
        const topicData = {
          title: titleValue.trim(),
          subjectId: subject_slug,
        };

        await dispatch(createTopic(topicData)).unwrap();
        message.success("Topic created successfully");

        // Remove from temp array after successful creation
        setTempTopics((prev) => prev.filter((t) => t._id !== id));
      } else {
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

        // Clear editing values for this id
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

      // Handle pagination adjust if deleting last item on current page
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
    // Prevent opening if it's a temporary or untitled topic
    if (!topic.title?.trim()) {
      message.warning("Please save the topic first");
      return;
    }

    if (topic._id.startsWith("temp-")) {
      message.warning("Please save the topic first");
      return;
    }

    nav.push(`/admin/practice/nontechnical/${subject_slug}/${topic._id}`);
  };

  const isEditing = (record) => record._id === editingId;

  const edit = (record) => {
    setEditingId(record._id);

    // Initialize editing value with current title if it's not a temp topic
    if (!record._id.startsWith("temp-")) {
      setEditingValues((prev) => ({
        ...prev,
        [record._id]: record.title,
      }));
    }
  };

  const cancel = () => {
    if (editingId?.startsWith("temp-")) {
      // Remove temp topic if cancelled
      setTempTopics((prev) => prev.filter((t) => t._id !== editingId));
    } else {
      // Clear editing values for this id if cancelled
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
      setTempTopics((prev) =>
        prev.map((t) => (t._id === id ? { ...t, [field]: value } : t))
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

  // Combine topics from Redux and temporary topics
  const allTopics = [...topics, ...tempTopics];
  const displayTopics = allTopics.filter(
    (topic) => topic && topic._id && topic.title !== undefined
  );

  // Pagination calculations
  const totalPages = Math.ceil(displayTopics.length / pageSize);
  const paginatedTopics = displayTopics.slice(
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
              + Create Topic
            </Button>
          </span>
        </Tooltip>
      </div>

      <Divider style={{ margin: "0.75rem 0" }} />

      {/* Card List */}
      {paginatedTopics.length > 0 ? (
        <div className={styles.cardsList}>
          {paginatedTopics.map((record, index) => {
            const editing = isEditing(record);
            const displayValue = getDisplayValue(record);
            const isTemp = record._id.startsWith("temp-");
            const topicNumber = (currentPage - 1) * pageSize + index + 1;

            return (
              <div
                key={record._id}
                className={`${styles.itemCard} ${editing ? styles.editing : ""}`}
                onClick={() => !editing && handleOpenTopic(record)}
              >
                {/* Avatar */}
                <div
                  className={styles.itemAvatar}
                  style={{ backgroundColor: getAvatarColor(displayValue) }}
                >
                  {getInitials(displayValue || `T${topicNumber}`)}
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
                      placeholder="Enter topic title…"
                      autoFocus
                      disabled={loading}
                      className={styles.inlineEditInput}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <>
                      <span className={styles.itemTitle}>
                        {displayValue || "Untitled Topic"}
                      </span>
                      <span className={styles.itemSubtitle}>
                        Topic {topicNumber}
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
                        onClick={() => handleOpenTopic(record)}
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
          <span className={styles.cardEmptyText}>No Topics Found</span>
          <span className={styles.cardEmptySub}>
            Start by adding your first topic for this subject
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
                + Add Topic
              </Button>
            </span>
          </Tooltip>
        </div>
      )}

      {/* Pagination */}
      {displayTopics.length > 0 && (
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
              {Math.min((currentPage - 1) * pageSize + 1, displayTopics.length)}-
              {Math.min(currentPage * pageSize, displayTopics.length)} of{" "}
              {displayTopics.length} topics
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

export default TopicManager;
