"use client";
import React, { useEffect, useState } from "react";
import SecStyles from "./page.module.scss";
import {
  DeleteOutlined,
  EditOutlined,
  FolderOpenOutlined,
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
import { Button, Table, Input, Space, message, Popconfirm } from "antd";

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

  return (
    <div className={SecStyles.container}>
      <div className={SecStyles.header}>
        <strong onClick={() => nav.push(`/admin/internship/${internshipId}`)}>
          {singleInternship?.title || "Internship Management"}
        </strong>
      </div>

      <Table
        columns={columns}
        dataSource={sections}
        pagination={paginationConfig}
        size="middle"
        bordered
        className={SecStyles.sectionsTable}
        scroll={{ x: 700 }}
        onChange={handleTableChange}
      />

      <div className={SecStyles.actions} style={{ marginTop: 16 }}>
        <Button type="primary" onClick={handleAdd} style={{ width: "10rem" }}>
          + Add New Section
        </Button>
      </div>
    </div>
  );
};

export default SectionManager;
