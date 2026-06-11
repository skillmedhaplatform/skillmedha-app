"use client";
import React, { useEffect, useState } from "react";
import topicStyles from "./page.module.scss";
import { useParams, useRouter } from "next/navigation";
import {
  DeleteOutlined,
  EditOutlined,
  SettingOutlined,
  PlayCircleOutlined,
  FilePdfOutlined,
  ReadOutlined,
  FormOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  getOneInternship,
  getOneSection,
  createTopic,
  updateTopic,
  getTopicsFromSection,
  DeleteTopicThunk,
} from "@/redux/slices/admin/cms/internship";
import { getOneMeeting } from "@/redux/slices/admin/cms/zoomSlice";
import {
  Button,
  Table,
  Input,
  Space,
  message,
  Segmented,
  Tag,
  Select,
  Popconfirm,
  Tooltip,
} from "antd";
import { usePermissions } from "@/hooks/usepermission";

export default function TopicManagerPage() {
  const { createInternship: internshipId, section: sectionId } = useParams();
  const nav = useRouter();
  const dispatch = useDispatch();
  const { canAccess } = usePermissions();
  const singleInternship = useSelector(
    (state) => state.adminInternship.singleInternship
  );
  const singleSection = useSelector((state) => state.adminInternship.singleSection);
  const allTopics = useSelector((state) => state.adminInternship.allTopics);
  const userCreds = useSelector((state) => state.user?.singleUser);

  const [topics, setTopics] = useState([]);
  const [editingKey, setEditingKey] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    if (internshipId && internshipId !== "newInternship") {
      dispatch(getOneInternship({ id: internshipId, orgId: userCreds?.orgId }));
    }
    if (sectionId) {
      dispatch(getOneSection({ id: sectionId }));
    }
  }, [dispatch, internshipId, sectionId]);

  useEffect(() => {
    if (!internshipId || !sectionId) return;
    // reset local state so old topics don’t flash
    setTopics([]);
    setEditingKey("");
    setCurrentPage(1);

    dispatch(getTopicsFromSection({ id: internshipId, sid: sectionId }));
  }, [dispatch, internshipId, sectionId]);

  useEffect(() => {
    if (!allTopics) {
      setTopics([]);
      return;
    }
    setTopics(
      allTopics.map((t, index) => ({
        ...t,
        key: t._id || `new-${index}`,
        _id: t._id,
        title: t.title,
        type: t.type || "topic", // ensure a default type
      }))
    );
  }, [allTopics]);

  const handleAdd = () => {
    const newTopic = {
      key: `new-${Date.now()}`,
      _id: null,
      title: "",
      type: "topic", // default type for inline edit
    };
    setTopics((prev) => {
      const next = [...prev, newTopic];
      const totalPages = Math.ceil(next.length / pageSize);
      setCurrentPage(totalPages);
      return next;
    });
    setEditingKey(newTopic.key);
  };

  const handleSave = async (key) => {
    const topic = topics.find((t) => t.key === key);
    if (!topic?.title?.trim()) {
      message.error("Please enter a title");
      return;
    }

    if (topic._id) {
      await dispatch(
        updateTopic({
          id: internshipId,
          sid: sectionId,
          tid: topic._id,
          data: { title: topic.title, type: topic.type },
        })
      );
    } else {
      await dispatch(
        createTopic({
          id: internshipId,
          sid: sectionId,
          data: { title: topic.title, type: topic.type },
        })
      );
    }
    setEditingKey("");
    // Optionally re-fetch to get fresh IDs for newly created topics:
    // dispatch(getTopicsFromSection({ id: internshipId, sid: sectionId }));
  };

  const handleDelete = (topic) => {
    if (topic._id) {
      dispatch(
        DeleteTopicThunk({
          internshipId,
          sectionId,
          topicId: topic._id,
        })
      );
    }

    const newTopics = topics.filter((t) => t.key !== topic.key);
    setTopics(newTopics);

    const totalPages = Math.ceil(newTopics.length / pageSize);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  };

  const startLiveButton = (topic) => {
    dispatch(getOneMeeting({ id: topic?.meetingId?._id }))?.then((resp) => {
      if (resp?.payload?._id) {
        nav.push("/admin/liveLect/" + resp?.payload?._id);
      }
    });
  };

  const isEditing = (record) => record.key === editingKey;
  const edit = (record) => setEditingKey(record.key);
  const cancel = () => setEditingKey("");
  const handleTitleChange = (key, value) => {
    setTopics((prev) =>
      prev.map((t) => (t.key === key ? { ...t, title: value } : t))
    );
  };
  const handleTypeChange = (key, value) => {
    setTopics((prev) =>
      prev.map((t) => (t.key === key ? { ...t, type: value } : t))
    );
  };

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };
  const typeColor = { topic: "blue", pdf: "volcano", quiz: "purple" };
  const typeOptions = [
    { label: "Topic", value: "topic" },
    { label: "PDF", value: "pdf" },
    { label: "Quiz", value: "quiz" },
    { label: "Coding", value: "coding" },
    { label: "Video", value: "video" },
  ];

  const columns = [
    {
      title: "Topic #",
      dataIndex: "index",
      key: "index",
      width: 80,
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 180,
      render: (type, record) => {
        const editing = isEditing(record);
        return editing ? (
          <Select
            value={record.type}
            onChange={(v) => handleTypeChange(record.key, v)}
            options={typeOptions}
            style={{ minWidth: 140 }}
            placeholder="Select type"
          />
        ) : (
          <Tag color={typeColor[type] || "default"}>
            {(type || "topic").toUpperCase()}
          </Tag>
        );
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
            placeholder="Enter title…"
            autoFocus
          />
        ) : (
          <span>{text || "Untitled Topic"}</span>
        );
      },
    },
    {
      title: "Meeting Status",
      key: "meetingStatus",
      render: (_, record) => {
        if (record?.meetingId?._id) {
          return record?.meetingId?.isCompleted ? (
            <span style={{ color: "#ff4d4f" }}>Class Ended</span>
          ) : (
            <span style={{ color: "#52c41a" }}>Ready to Start</span>
          );
        }
        return <span style={{ color: "#faad14" }}>Meeting Not Created</span>;
      },
    },
    {
      title: "Live Class",
      key: "liveActions",
      width: 140,
      render: (_, record) => {
        // Show only if type === "topic"
        if (record?.type !== "topic" || !record?.type) return null;

        return record?.meetingId?._id ? (
          <Button
            size="small"
            type="primary"
            onClick={() => startLiveButton(record)}
            disabled={record?.meetingId?.isCompleted || false}
            icon={<PlayCircleOutlined />}
          >
            {record?.meetingId?.isCompleted ? "Class Ended" : "Start Live"}
          </Button>
        ) : (
          <Button size="small" disabled icon={<PlayCircleOutlined />}>
            No Meeting
          </Button>
        );
      },
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
      title: "Topic Settings",
      key: "topicSettings",
      width: 160,
      render: (_, record) => (
        <Button
          size="small"
          // onClick={() =>
          //   nav.push(
          //     `/admin/internship/${internshipId}/${sectionId}/${record?._id}/editTopic`
          //   )
          // }
          onClick={() =>
            nav.push(
              `/admin/course/${internshipId}/${sectionId}/${record?._id}/${
                record?.type || "topic"
              }`
            )
          }
          disabled={!record._id}
          icon={<SettingOutlined />}
        >
          Manage Topic
        </Button>
      ),
    },
    {
      title: "Remove",
      key: "delete",
      width: 110,
      render: (_, record) => (
        <Tooltip
          title={
            !canAccess("delete")
              ? "You don't have permission to delete this topic"
              : ""
          }
        >
          <>
            <Popconfirm
              title="Are you sure you want to delete this topic?"
              description="This action cannot be undone."
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
              onConfirm={() => handleDelete(record)}
            >
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                disabled={!canAccess("delete")}
              >
                Delete
              </Button>
            </Popconfirm>
          </>
        </Tooltip>
      ),
    },
  ];

  const paginationConfig = {
    current: currentPage,
    pageSize,
    total: topics.length,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} topics`,
    pageSizeOptions: ["5", "10", "20", "50", "100"],
    onShowSizeChange: (_, size) => {
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
    <div className={topicStyles.container}>
      <div className={topicStyles.header}>
        <span onClick={() => nav.push(`/admin/course/${internshipId}`)}>
          {singleInternship?.title || "..."}
          <img
            src="https://res.cloudinary.com/dug3awue8/image/upload/v1746083643/icon_sgq3vj.svg"
            alt=">"
          />
        </span>
        <strong
          onClick={() => nav.push(`/admin/course/${internshipId}/${sectionId}`)}
        >
          {singleSection?.title || "..."}
        </strong>
      </div>

      <Table
        columns={columns}
        dataSource={topics}
        pagination={paginationConfig}
        size="middle"
        bordered
        className={topicStyles.topicsTable}
        scroll={{ x: 800 }}
        onChange={handleTableChange}
      />

      <div className={topicStyles.actions} style={{ marginTop: 16 }}>
        <Button type="primary" onClick={handleAdd}>
          + Add New Topic
        </Button>
      </div>
    </div>
  );
}
