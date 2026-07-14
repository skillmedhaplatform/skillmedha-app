"use client";
import React, { useEffect, useState } from "react";
import SecStyles from "./page.module.scss";
import {
  DeleteOutlined,
  EditOutlined,
  FolderOpenOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  createSection,
  updateSection,
  getInternshipSections,
  getOneInternship,
  getOneSection,
  DeleteSectionThunk,
} from "@/redux/slices/admin/cms/internship";
import { Button, Input, Space, message, Popconfirm, Breadcrumb, Pagination, Tooltip } from "antd";
import { FaCaretRight } from "react-icons/fa6";

const SectionManager = () => {
  const { createInternship: internshipId } = useParams();
  const nav = useRouter();
  const dispatch = useDispatch();

  const singleInternship = useSelector(
    (state) => state.adminInternship.singleInternship
  );
  const allFromBackend = useSelector((s) => s.adminInternship.allSections) || [];
  const userCreds = useSelector((state) => state.user?.singleUser);

  const [sections, setSections] = useState([]);
  const [editingKey, setEditingKey] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    if (allFromBackend.length) {
      setSections(
        allFromBackend.map((sec, index) => ({
          key: sec._id || `new-${index}`,
          _id: sec._id,
          title: sec.title,
        }))
      );
    }
  }, [allFromBackend]);

  const handleAdd = () => {
    const newSection = {
      key: `new-${Date.now()}`,
      _id: null,
      title: "",
    };
    setSections((prev) => [...prev, newSection]);
    setEditingKey(newSection.key);

    const totalPages = Math.ceil((sections.length + 1) / pageSize);
    setCurrentPage(totalPages);
  };

  const handleSave = async (key) => {
    const section = sections.find((s) => s.key === key);
    if (!section?.title?.trim()) {
      message.error("Please enter a section title");
      return;
    }

    if (section._id) {
      await dispatch(
        updateSection({
          id: internshipId,
          sid: section._id,
          data: { title: section.title },
        })
      );
    } else {
      await dispatch(
        createSection({
          id: internshipId,
          data: { title: section.title },
        })
      );
    }
    setEditingKey("");
    // Optionally re-fetch to ensure fresh IDs after create:
    // dispatch(getInternshipSections({ id: internshipId }));
  };

  const handleDelete = (section) => {
    if (section._id) {
      dispatch(DeleteSectionThunk({ internshipId, sectionId: section._id }));
    }

    const newSections = sections.filter((s) => s.key !== section.key);
    setSections(newSections);

    const totalPages = Math.ceil(newSections.length / pageSize);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  };

  const handleOpenSection = (section) => {
    dispatch(getOneSection({ id: section._id }));
    nav.push(`/admin/internship/${internshipId}/${section._id}/topicDetails`);
  };

  const isEditing = (record) => record.key === editingKey;

  const edit = (record) => {
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey("");
  };

  const handleTitleChange = (key, value) => {
    setSections((prev) =>
      prev.map((s) => (s.key === key ? { ...s, title: value } : s))
    );
  };

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  useEffect(() => {
    if (internshipId?.split("/")?.join("") !== "newInternship") {
      dispatch(
        getOneInternship({
          id: internshipId,
          orgId: userCreds?.orgId,
        })
      );
    }
    dispatch(getInternshipSections({ id: internshipId }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns = [
    {
      title: "Section #",
      dataIndex: "index",
      key: "index",
      width: 100,
      render: (_, __, index) => {
        const sectionNumber = (currentPage - 1) * pageSize + index + 1;
        return `Section ${sectionNumber}`;
      },
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text, record) => {
        const editing = isEditing(record);
        return editing ? (
          <Input
            value={record.title}
            onChange={(e) => handleTitleChange(record.key, e.target.value)}
            onPressEnter={() => handleSave(record.key)}
            placeholder="Enter section titleâ€¦"
            autoFocus
          />
        ) : (
          <span>{text || "Untitled Section"}</span>
        );
      },
    },
    {
      title: "Status",
      key: "status",
      width: 120,
      render: (_, record) => {
        return record._id ? (
          <span style={{ color: "#52c41a" }}>Saved</span>
        ) : (
          <span style={{ color: "#faad14" }}>Draft</span>
        );
      },
    },
    {
      title: "Open Section",
      key: "openSection",
      width: 140,
      render: (_, record) => (
        <Button
          size="small"
          type="primary"
          onClick={() => handleOpenSection(record)}
          disabled={!record._id}
          icon={<FolderOpenOutlined />}
        >
          Open Section
        </Button>
      ),
    },
    {
      title: "Quick Edit",
      key: "quickEdit",
      width: 160,
      render: (_, record) => {
        const editing = isEditing(record);
        return editing ? (
          <Space>
            <Button
              type="primary"
              size="small"
              onClick={() => handleSave(record.key)}
            >
              {record._id ? "Update" : "Save"}
            </Button>
            <Button size="small" onClick={cancel}>
              Cancel
            </Button>
          </Space>
        ) : (
          <Button
            size="small"
            onClick={() => edit(record)}
            icon={<EditOutlined />}
          >
            Edit Title
          </Button>
        );
      },
    },
    {
      title: "Remove",
      key: "delete",
      width: 100,
      render: (_, record) => (
        <Popconfirm
          title="Are you sure you want to delete this section?"
          description="This action cannot be undone."
          okText="Delete"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
          onConfirm={() => handleDelete(record)}
        >
          <Button size="small" danger icon={<DeleteOutlined />}>
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const paginationConfig = {
    current: currentPage,
    pageSize: pageSize,
    total: sections.length,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} sections`,
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

  const breadcrumbItems = [
    {
      title: (
        <span
          onClick={() => nav.push("/admin/internship")}
          className={SecStyles.breadcrumbLink}
        >
          Internship Library
        </span>
      ),
      key: "library",
    },
    {
      title: (
        <span
          onClick={() => nav.push(`/admin/internship/${internshipId}`)}
          className={SecStyles.breadcrumbLink}
        >
          {singleInternship?.title || "Edit Internship"}
        </span>
      ),
      key: "details",
    },
    {
      title: (
        <span className={SecStyles.breadcrumbCurrent}>
          Curriculum
        </span>
      ),
      key: "current",
    },
  ];

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedSections = sections.slice(startIndex, startIndex + pageSize);

  return (
    <div className={SecStyles.container}>
      <div className={SecStyles.titleContainer}>
        <div className={SecStyles.breadcrumbContainer}>
          <Breadcrumb
            items={breadcrumbItems}
            separator={
              <FaCaretRight style={{ fontSize: "14px", color: "#64748b", margin: "0 4px" }} />
            }
            className={SecStyles.breadcrumb}
          />
        </div>
      </div>

      <div className={SecStyles.sectionsTable}>
        <div className={SecStyles.questionList}>
          {paginatedSections.map((record, index) => {
            const editing = isEditing(record);
            const absoluteIndex = startIndex + index + 1;

            return (
              <div key={record.key} className={SecStyles.questionRow}>
                <div className={SecStyles.rowLeft}>
                  <span className={SecStyles.qNumber}>Section {absoluteIndex}</span>
                  {editing ? (
                    <Input
                      value={record.title}
                      onChange={(e) => handleTitleChange(record.key, e.target.value)}
                      onPressEnter={() => handleSave(record.key)}
                      placeholder="Enter section title..."
                      autoFocus
                      className={SecStyles.editInput}
                    />
                  ) : (
                    <span className={SecStyles.qText}>
                      {record.title || "Untitled Section"}
                    </span>
                  )}
                </div>

                <div className={SecStyles.rowRight}>
                  <div className={SecStyles.badges}>
                    {record._id ? (
                      <span className={`${SecStyles.badge} ${SecStyles.saved}`}>Saved</span>
                    ) : (
                      <span className={`${SecStyles.badge} ${SecStyles.draft}`}>Draft</span>
                    )}
                  </div>

                  <div className={SecStyles.actionIcons}>
                    <Tooltip title="Open Section">
                      <button
                        className={SecStyles.openSec}
                        disabled={!record._id}
                        onClick={() => handleOpenSection(record)}
                      >
                        <FolderOpenOutlined />
                      </button>
                    </Tooltip>

                    {editing ? (
                      <>
                        <Tooltip title="Save">
                          <button
                            className={SecStyles.save}
                            onClick={() => handleSave(record.key)}
                          >
                            <CheckOutlined />
                          </button>
                        </Tooltip>
                        <Tooltip title="Cancel">
                          <button
                            className={SecStyles.cancel}
                            onClick={cancel}
                          >
                            <CloseOutlined />
                          </button>
                        </Tooltip>
                      </>
                    ) : (
                      <Tooltip title="Edit Title">
                        <button
                          className={SecStyles.edit}
                          onClick={() => edit(record)}
                        >
                          <EditOutlined />
                        </button>
                      </Tooltip>
                    )}

                    <Tooltip title="Delete">
                      <Popconfirm
                        title="Are you sure you want to delete this section?"
                        description="This action cannot be undone."
                        okText="Delete"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true }}
                        onConfirm={() => handleDelete(record)}
                      >
                        <button className={SecStyles.delete}>
                          <DeleteOutlined />
                        </button>
                      </Popconfirm>
                    </Tooltip>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={SecStyles.paginationContainer}>
        <Pagination {...paginationConfig} />
      </div>

      <div className={SecStyles.actions} style={{ marginTop: 16 }}>
        <Button type="primary" onClick={handleAdd} style={{ width: "10rem" }}>
          + Add New Section
        </Button>
      </div>
    </div>
  );
};

export default SectionManager;
