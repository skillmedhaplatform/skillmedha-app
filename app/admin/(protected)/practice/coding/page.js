"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "../practiceStyles.module.scss";
import {
  DeleteOutlined,
  EditOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
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
  fetchSubjectsByType,
  createSubject,
  updateSubject,
  deleteSubject,
} from "@/redux/slices/admin/cms/practiceSlice";
import PracticeBreadcrumbs from "../Practice_utils/practiceBreadcrumbs";
import { usePermissions, PERMISSION_VALUES } from "@/hooks/usepermission";

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
    const tempId = `temp-${Date.now()}`;
    const newSubject = {
      _id: tempId,
      title: "",
      type: "coding",
    };

    // Add to temporary subjects array
    setTempSubjects((prev) => [...prev, newSubject]);
    setEditingId(tempId);

    // Navigate to last page to show the new subject
    const totalSubjects = subjects.length + tempSubjects.length + 1;
    const totalPages = Math.ceil(totalSubjects / pageSize);
    setCurrentPage(totalPages);
  };

  const handleSave = async (id) => {
    try {
      const isNewSubject = id.startsWith("temp-");
      let subject;
      let titleValue;

      if (isNewSubject) {
        // Find subject in temporary subjects
        subject = tempSubjects.find((s) => s._id === id);
        titleValue = subject?.title;
      } else {
        // For existing subjects, get the edited value or original value
        titleValue =
          editingValues[id] || subjects.find((s) => s._id === id)?.title;
      }

      if (!titleValue?.trim()) {
        message.error("Please enter a subject title");
        return;
      }

      if (isNewSubject) {
        // Create new subject
        const subjectData = {
          title: titleValue.trim(),
          type: "coding",
        };

        await dispatch(createSubject(subjectData)).unwrap();
        message.success("Coding subject created successfully");

        // Remove from temporary subjects
        setTempSubjects((prev) => prev.filter((s) => s._id !== id));
      } else {
        // Update existing subject
        const updateData = {
          title: titleValue.trim(),
        };

        await dispatch(
          updateSubject({
            subjectId: id,
            data: updateData,
          })
        ).unwrap();
        message.success("Coding subject updated successfully");

        // Clear editing value
        setEditingValues((prev) => {
          const newValues = { ...prev };
          delete newValues[id];
          return newValues;
        });
      }

      setEditingId("");
    } catch (error) {
      message.error("Failed to save coding subject");
      console.error("Save error:", error);
    }
  };

  const handleDelete = async (subject) => {
    try {
      await dispatch(deleteSubject(subject._id)).unwrap();
      message.success("Coding subject deleted successfully");

      // Adjust pagination if needed
      const totalPages = Math.ceil((subjects.length - 1) / pageSize);
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      }
    } catch (error) {
      message.error("Failed to delete coding subject");
      console.error("Delete error:", error);
    }
  };

  const handleOpenSubject = (subject) => {
    if (!subject.title?.trim()) {
      message.warning("Please save the subject first");
      return;
    }

    // Don't allow opening temp subjects
    if (subject._id.startsWith("temp-")) {
      message.warning("Please save the subject first");
      return;
    }
    nav.push(`/admin/practice/coding/${subject._id}`);
  };

  const isEditing = (record) => record._id === editingId;

  const edit = (record) => {
    setEditingId(record._id);

    // For existing subjects, initialize the editing value
    if (!record._id.startsWith("temp-")) {
      setEditingValues((prev) => ({
        ...prev,
        [record._id]: record.title,
      }));
    }
  };

  const cancel = () => {
    // If it's a temporary subject being edited, remove it from temp subjects
    if (editingId?.startsWith("temp-")) {
      setTempSubjects((prev) => prev.filter((s) => s._id !== editingId));
    } else {
      // For existing subjects, clear editing value
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
      // Update temporary subject
      setTempSubjects((prev) =>
        prev.map((s) => (s._id === id ? { ...s, [field]: value } : s))
      );
    } else {
      // Update editing values for existing subjects
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

  // Get the display value for a subject (either editing value or original value)
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

  const columns = [
    {
      title: "Subject #",
      dataIndex: "index",
      width: 100,
      render: (_, __, index) => {
        const subjectNumber = (currentPage - 1) * pageSize + index + 1;
        return `Subject ${subjectNumber}`;
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
            placeholder="Enter subject title…"
            autoFocus
            disabled={loading}
            style={{ width: "100%" }}
          />
        ) : (
          <span>{displayValue || "Untitled Subject"}</span>
        );
      },
    },
    {
      title: "Open Subject",
      width: 140,
      render: (_, record) => (
        <Button
          size="small"
          type="primary"
          onClick={() => handleOpenSubject(record)}
          disabled={
            !record.title?.trim() || loading || record._id.startsWith("temp-")
          }
          icon={<FolderOpenOutlined />}
        >
          Open Subject
        </Button>
      ),
    },
    {
      title: "Quick Edit",
      width: 160,
      render: (_, record) => {
        const editing = isEditing(record);
        const displayValue = getDisplayValue(record);

        return editing ? (
          <Space>
            <Button
              type="primary"
              size="small"
              onClick={() => handleSave(record._id)}
              loading={loading}
              disabled={!displayValue?.trim()}
            >
              Save
            </Button>
            <Button size="small" onClick={cancel} disabled={loading}>
              Cancel
            </Button>
          </Space>
        ) : (
          <Tooltip
            title={!canEdit ? getPermissionMessage(PERMISSION_VALUES.EDIT) : ""}
          >
            <span>
              <Button
                size="small"
                onClick={() => edit(record)}
                icon={<EditOutlined />}
                disabled={!canEdit || loading}
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
          // For temporary subjects, just show a cancel button
          return (
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
          );
        }

        return (
          <Tooltip
            title={
              !canDelete ? getPermissionMessage(PERMISSION_VALUES.DELETE) : ""
            }
          >
            <span>
              <Popconfirm
                title="Are you sure you want to delete this coding subject?"
                description="This action cannot be undone."
                okText="Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true, loading: loading }}
                onConfirm={() => handleDelete(record)}
                disabled={!canDelete || loading}
              >
                <Button
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  disabled={!canDelete || loading}
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
    total: displaySubjects.length,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} subjects`,
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
            !canCreate ? getPermissionMessage(PERMISSION_VALUES.CREATE) : ""
          }
        >
          <span>
            <Button
              type="primary"
              onClick={handleAdd}
              style={{ width: "12rem" }}
              disabled={loading || !canCreate}
            >
              + Add Coding Subject
            </Button>
          </span>
        </Tooltip>
      </div>
      <Divider style={{ margin: "1rem 0" }} />
      <Table
        columns={columns}
        dataSource={displaySubjects}
        rowKey="_id"
        pagination={paginationConfig}
        size="middle"
        bordered
        className={styles.subjectsTable}
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
              <h3>No Coding Subjects Found</h3>
              <p style={{ color: "#888" }}>
                Start by adding your first coding subject
              </p>
              <Button type="primary" onClick={handleAdd} disabled={!canCreate}>
                + Add Coding Subject
              </Button>
            </div>
          ),
        }}
      />
    </div>
  );
};

export default CodingSubjectManager;
