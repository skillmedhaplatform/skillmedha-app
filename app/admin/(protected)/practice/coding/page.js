"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "../practiceStyles.module.scss";
import {
  DeleteOutlined,
  EditOutlined,
  FolderOpenOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
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
  fetchSubjectsByType,
  createSubject,
  updateSubject,
  deleteSubject,
} from "@/redux/slices/admin/cms/practiceSlice";
import PracticeBreadcrumbs from "../Practice_utils/practiceBreadcrumbs";
import { usePermissions, PERMISSION_VALUES } from "@/hooks/usepermission";

// Avatar color palette
const AVATAR_COLORS = [
  "#1E69DA", "#0ea5e9", "#593cc1", "#25a667", "#c5782b",
  "#e53e3e", "#8b5cf6", "#d946ef",
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

const CodingSubjectManager = () => {
  const nav = useRouter();
  const dispatch = useDispatch();
  const { canAccess, getPermissionMessage, PERMISSION_VALUES } =
    usePermissions();

  // Redux state
  const { subjects, status, error } = useSelector((state) => state.adminPractice);
  const loading = status === "loading";

  // Local states
  const [editingId, setEditingId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [tempSubjects, setTempSubjects] = useState([]); // For new subjects being added
  const [editingValues, setEditingValues] = useState({}); // For editing existing subjects

  // Permission checks
  const canCreate = canAccess(PERMISSION_VALUES.CREATE);
  const canEdit = canAccess(PERMISSION_VALUES.EDIT);
  const canDelete = canAccess(PERMISSION_VALUES.DELETE);

  // Fetch coding subjects on component mount
  useEffect(() => {
    dispatch(fetchSubjectsByType("coding"));
  }, [dispatch]);

  // Handle errors
  useEffect(() => {
    if (status === "failed" && error) {
      message.error(error);
    }
  }, [status, error]);

  const handleAdd = () => {
    if (!canCreate) {
      message.info(getPermissionMessage(PERMISSION_VALUES.CREATE));
      return;
    }
    const tempId = `temp-${Date.now()}`;
    const newSubject = {
      _id: tempId,
      title: "",
      type: "coding",
    };

    setTempSubjects((prev) => [...prev, newSubject]);
    setEditingId(tempId);

    // Calculate the new total number of subjects and set the page to the last page
    const totalSubjects = subjects.length + tempSubjects.length + 1;
    const totalPages = Math.ceil(totalSubjects / pageSize);
    setCurrentPage(totalPages); // Move to the last page to show the new row
  };

  const handleSave = async (id) => {
    try {
      const isNewSubject = id.startsWith("temp-");
      let subject;
      let titleValue;

      // Ensure permissions before saving
      if (isNewSubject && !canCreate) {
        message.info(getPermissionMessage(PERMISSION_VALUES.CREATE));
        return;
      }
      if (!isNewSubject && !canEdit) {
        message.info(getPermissionMessage(PERMISSION_VALUES.EDIT));
        return;
      }

      if (isNewSubject) {
        subject = tempSubjects.find((s) => s._id === id);
        titleValue = subject?.title;
      } else {
        titleValue =
          editingValues[id] || subjects.find((s) => s._id === id)?.title;
      }

      if (!titleValue?.trim()) {
        message.error("Please enter a subject title");
        return;
      }

      if (isNewSubject) {
        const subjectData = {
          title: titleValue.trim(),
          type: "coding",
        };

        await dispatch(createSubject(subjectData)).unwrap();
        message.success("Subject created successfully");

        // Remove from temp array after successful creation
        setTempSubjects((prev) => prev.filter((s) => s._id !== id));
      } else {
        const updateData = {
          title: titleValue.trim(),
        };

        await dispatch(
          updateSubject({
            subjectId: id,
            data: updateData,
          })
        ).unwrap();
        message.success("Subject updated successfully");

        // Clear editing values for this id
        setEditingValues((prev) => {
          const newValues = { ...prev };
          delete newValues[id];
          return newValues;
        });
      }

      setEditingId("");
    } catch (error) {
      message.error("Failed to save subject");
      console.error("Save error:", error);
    }
  };

  const handleDelete = async (subject) => {
    if (!canDelete) {
      message.info(getPermissionMessage(PERMISSION_VALUES.DELETE));
      return;
    }
    try {
      await dispatch(deleteSubject(subject._id)).unwrap();
      message.success("Subject deleted successfully");

      // Handle pagination adjust if deleting last item on current page
      const totalPages = Math.ceil((subjects.length - 1) / pageSize);
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      }
    } catch (error) {
      message.error("Failed to delete subject");
      console.error("Delete error:", error);
    }
  };

  const handleOpenSubject = (subject) => {
    // Prevent opening if it's a temporary or untitled subject
    if (!subject.title?.trim()) {
      message.warning("Please save the subject first");
      return;
    }

    if (subject._id.startsWith("temp-")) {
      message.warning("Please save the subject first");
      return;
    }

    // Pass type parameter to help identify subject type
    nav.push(`/admin/practice/coding/${subject._id}`);
  };

  const isEditing = (record) => record._id === editingId;

  const edit = (record) => {
    setEditingId(record._id);

    // Initialize editing value with current title if it's not a temp subject
    if (!record._id.startsWith("temp-")) {
      setEditingValues((prev) => ({
        ...prev,
        [record._id]: record.title,
      }));
    }
  };

  const cancel = () => {
    if (editingId?.startsWith("temp-")) {
      // Remove temp subject if cancelled
      setTempSubjects((prev) => prev.filter((s) => s._id !== editingId));
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
      setTempSubjects((prev) =>
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

  // Combine subjects from Redux and temporary subjects
  const allSubjects = [...subjects, ...tempSubjects];
  const displaySubjects = allSubjects.filter(
    (subject) => subject && subject._id && subject.title !== undefined
  );

  // Pagination calculations
  const totalPages = Math.ceil(displaySubjects.length / pageSize);
  const paginatedSubjects = displaySubjects.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <PracticeBreadcrumbs />
        <Tooltip
          title={
            !canCreate ? getPermissionMessage(PERMISSION_VALUES.CREATE) : ""
          }
        >
          <span>
            <Button
              type="primary"
              onClick={handleAdd}
              style={{ width: "10rem" }}
              disabled={loading || !canCreate}
            >
              + Add New Subject
            </Button>
          </span>
        </Tooltip>
      </div>

      <Divider style={{ margin: "0.75rem 0" }} />

      {/* Card List */}
      {paginatedSubjects.length > 0 ? (
        <div className={styles.cardsList}>
          {paginatedSubjects.map((record, index) => {
            const editing = isEditing(record);
            const displayValue = getDisplayValue(record);
            const isTemp = record._id.startsWith("temp-");
            const subjectNumber = (currentPage - 1) * pageSize + index + 1;

            return (
              <div
                key={record._id}
                className={`${styles.itemCard} ${editing ? styles.editing : ""}`}
                onClick={() => !editing && handleOpenSubject(record)}
              >
                {/* Avatar */}
                <div
                  className={styles.itemAvatar}
                  style={{ backgroundColor: getAvatarColor(displayValue) }}
                >
                  {getInitials(displayValue || `S${subjectNumber}`)}
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
                      placeholder="Enter subject title…"
                      autoFocus
                      disabled={loading}
                      className={styles.inlineEditInput}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <>
                      <span className={styles.itemTitle}>
                        {displayValue || "Untitled Subject"}
                      </span>
                      <span className={styles.itemSubtitle}>
                        Subject {subjectNumber}
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
                            ? !canCreate
                              ? getPermissionMessage(PERMISSION_VALUES.CREATE)
                              : ""
                            : !canEdit
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
                              (isTemp ? !canCreate : !canEdit)
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
                        onClick={() => handleOpenSubject(record)}
                        disabled={!record.title?.trim() || loading || isTemp}
                        icon={<FolderOpenOutlined />}
                      >
                        Open
                      </Button>
                      <Tooltip
                        title={
                          !canEdit
                            ? getPermissionMessage(PERMISSION_VALUES.EDIT)
                            : ""
                        }
                      >
                        <span>
                          <Button
                            size="small"
                            onClick={() => edit(record)}
                            icon={<EditOutlined />}
                            disabled={loading || !canEdit}
                          >
                            Edit
                          </Button>
                        </span>
                      </Tooltip>
                      {isTemp ? (
                        <Button
                          size="small"
                          onClick={() => {
                            setTempSubjects((prev) =>
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
                            !canDelete
                              ? getPermissionMessage(PERMISSION_VALUES.DELETE)
                              : ""
                          }
                        >
                          <span>
                            <Popconfirm
                              title="Are you sure you want to delete this subject?"
                              description="This action cannot be undone."
                              okText="Delete"
                              cancelText="Cancel"
                              okButtonProps={{ danger: true, loading: loading }}
                              onConfirm={() => handleDelete(record)}
                              disabled={loading || !canDelete}
                            >
                              <Button
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                                disabled={loading || !canDelete}
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
          <span className={styles.cardEmptyText}>No Subjects Found</span>
          <span className={styles.cardEmptySub}>
            Start by adding your first subject
          </span>
          <Tooltip
            title={
              !canCreate ? getPermissionMessage(PERMISSION_VALUES.CREATE) : ""
            }
          >
            <span>
              <Button
                type="primary"
                onClick={handleAdd}
                disabled={!canCreate}
              >
                + Add Subject
              </Button>
            </span>
          </Tooltip>
        </div>
      )}

      {/* Pagination */}
      {displaySubjects.length > 0 && (
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
              {Math.min((currentPage - 1) * pageSize + 1, displaySubjects.length)}-
              {Math.min(currentPage * pageSize, displaySubjects.length)} of{" "}
              {displaySubjects.length} subjects
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

export default CodingSubjectManager;
