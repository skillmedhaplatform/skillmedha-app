"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Button, Input, Select, Table, Tag, Popconfirm, Tooltip, Space, App } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { FiBookOpen } from "react-icons/fi";
import styles from "../practiceStyles.module.scss";
import PracticeBreadcrumbs from "../Practice_utils/practiceBreadcrumbs";
import { usePermissions, PERMISSION_VALUES } from "@/hooks/usepermission";
import { fetchPracticeSets, deletePracticeSet } from "@/redux/slices/admin/cms/practiceSetsSlice";
import {
  CATEGORY_OPTIONS,
  DIFFICULTY_OPTIONS,
  LEVEL_OPTIONS,
  PLAN_OPTIONS,
  STATUS_OPTIONS,
  categoryLabel,
  difficultyLabel,
  formatDuration,
  formatPrice,
  levelLabel,
} from "@/components/practiceSets/constants";

export default function PracticeSetsPage() {
  const { message } = App.useApp();
  const router = useRouter();
  const dispatch = useDispatch();
  const { canAccess, getPermissionMessage } = usePermissions();
  const { sets, status } = useSelector((state) => state.adminPracticeSets);

  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchPracticeSets(filters))
      .unwrap()
      .catch((err) => message.error(err || "Failed to load practice sets"));
  }, [dispatch, filters, message]);

  const updateFilter = (key, value) =>
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      if (!value) delete next[key];
      return next;
    });

  const guard = (permission, action) => {
    if (!canAccess(permission)) {
      message.info(getPermissionMessage(permission));
      return;
    }
    action();
  };

  const handleDelete = async (record) => {
    try {
      await dispatch(deletePracticeSet(record._id)).unwrap();
      message.success("Practice set deleted");
    } catch (err) {
      message.error(err || "Failed to delete practice set");
    }
  };

  const columns = [
    {
      title: "Practice Set",
      key: "title",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="flex h-[40px] w-[70px] shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-100">
            {record.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={record.thumbnail} alt="" className="h-full w-full object-cover" />
            ) : (
              <FiBookOpen className="text-lg text-slate-400" />
            )}
          </div>
          <div className="min-w-0">
            <div className="truncate font-semibold text-slate-800">{record.title}</div>
            <div className="truncate text-xs text-slate-500">
              {record.topics?.length || 0} topic{record.topics?.length === 1 ? "" : "s"}
              {record.topics?.length
                ? ` · ${[...new Set(record.topics.map((t) => t.subjectTitle))].join(", ")}`
                : ""}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      render: (value) => categoryLabel(value),
    },
    {
      title: "Level",
      dataIndex: "level",
      render: (value) => levelLabel(value),
    },
    {
      title: "Plan",
      dataIndex: "plan",
      render: (value) =>
        value === "premium" ? <Tag color="blue">PREMIUM</Tag> : <Tag color="green">FREE</Tag>,
    },
    {
      title: "Questions",
      key: "questions",
      render: (_, record) => (
        <Tooltip title={`${record.availableQuestions ?? "?"} questions available in the selected topics`}>
          <span>{record.questionCount}</span>
        </Tooltip>
      ),
    },
    {
      title: "Time",
      dataIndex: "timeMinutes",
      render: (value) => formatDuration(value),
    },
    {
      title: "Price",
      key: "price",
      render: (_, record) =>
        record.plan === "premium" ? (
          <span className="whitespace-nowrap">
            {record.mrp > record.price && (
              <span className="mr-1 text-xs text-slate-400 line-through">{formatPrice(record.mrp)}</span>
            )}
            <span className="font-semibold text-blue-600">{formatPrice(record.price)}</span>
          </span>
        ) : (
          <span className="font-semibold text-blue-600">FREE</span>
        ),
    },
    {
      title: "Difficulty",
      dataIndex: "difficulty",
      render: (value) => {
        const color = { easy: "green", medium: "orange", hard: "red" }[value] || "purple";
        return <Tag color={color}>{difficultyLabel(value)}</Tag>;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (value) =>
        value === "published" ? <Tag color="success">Published</Tag> : <Tag>Draft</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() =>
              guard(PERMISSION_VALUES.EDIT, () => router.push(`/admin/practice/practice-sets/${record._id}`))
            }
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete this practice set?"
            description="Students will no longer see it."
            okText="Delete"
            okButtonProps={{ danger: true }}
            disabled={!canAccess(PERMISSION_VALUES.DELETE)}
            onConfirm={() => handleDelete(record)}
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() =>
                !canAccess(PERMISSION_VALUES.DELETE) &&
                message.info(getPermissionMessage(PERMISSION_VALUES.DELETE))
              }
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <PracticeBreadcrumbs />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className={styles.createButton}
          onClick={() =>
            guard(PERMISSION_VALUES.CREATE, () => router.push("/admin/practice/practice-sets/new"))
          }
        >
          Create Practice Set
        </Button>
      </div>

      <div className="mt-4 flex w-full flex-wrap gap-3">
        <Input.Search
          placeholder="Search practice sets…"
          allowClear
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!e.target.value) updateFilter("search", "");
          }}
          onSearch={(value) => updateFilter("search", value.trim())}
          style={{ maxWidth: 280 }}
        />
        <Select
          placeholder="Category"
          allowClear
          options={CATEGORY_OPTIONS}
          onChange={(value) => updateFilter("category", value)}
          style={{ minWidth: 150 }}
        />
        <Select
          placeholder="Plan"
          allowClear
          options={PLAN_OPTIONS}
          onChange={(value) => updateFilter("plan", value)}
          style={{ minWidth: 120 }}
        />
        <Select
          placeholder="Level"
          allowClear
          options={LEVEL_OPTIONS}
          onChange={(value) => updateFilter("level", value)}
          style={{ minWidth: 140 }}
        />
        <Select
          placeholder="Difficulty"
          allowClear
          options={DIFFICULTY_OPTIONS}
          onChange={(value) => updateFilter("difficulty", value)}
          style={{ minWidth: 200 }}
        />
        <Select
          placeholder="Status"
          allowClear
          options={STATUS_OPTIONS}
          onChange={(value) => updateFilter("status", value)}
          style={{ minWidth: 130 }}
        />
      </div>

      <div className="mt-4 w-full overflow-hidden rounded-xl border border-slate-100 bg-white">
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={sets}
          loading={status === "loading"}
          scroll={{ x: 1000 }}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          locale={{ emptyText: "No practice sets yet — create your first one" }}
        />
      </div>
    </div>
  );
}
