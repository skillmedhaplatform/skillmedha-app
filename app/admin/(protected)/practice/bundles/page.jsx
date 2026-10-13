"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Button, Input, Select, Table, Tag, Popconfirm, Tooltip, Space, App } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { FiLayers } from "react-icons/fi";
import styles from "../practiceStyles.module.scss";
import PracticeBreadcrumbs from "../Practice_utils/practiceBreadcrumbs";
import { usePermissions, PERMISSION_VALUES } from "@/hooks/usepermission";
import { fetchPracticeBundles, deletePracticeBundle } from "@/redux/slices/admin/cms/practiceSetsSlice";
import { STATUS_OPTIONS, formatDuration, formatPrice } from "@/components/practiceSets/constants";

export default function PracticeBundlesPage() {
  const { message } = App.useApp();
  const router = useRouter();
  const dispatch = useDispatch();
  const { canAccess, getPermissionMessage } = usePermissions();
  const { bundles, status } = useSelector((state) => state.adminPracticeSets);

  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchPracticeBundles(filters))
      .unwrap()
      .catch((err) => message.error(err || "Failed to load bundles"));
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
      await dispatch(deletePracticeBundle(record._id)).unwrap();
      message.success("Bundle deleted");
    } catch (err) {
      message.error(err || "Failed to delete bundle");
    }
  };

  const columns = [
    {
      title: "Bundle",
      key: "title",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="flex h-[40px] w-[70px] shrink-0 items-center justify-center overflow-hidden rounded-md bg-amber-50">
            {record.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={record.thumbnail} alt="" className="h-full w-full object-cover" />
            ) : (
              <FiLayers className="text-lg text-amber-500" />
            )}
          </div>
          <div className="min-w-0">
            <div className="truncate font-semibold text-slate-800">{record.title}</div>
            <div className="truncate text-xs text-slate-500">
              {record.sets?.map((s) => s.title).join(", ") || "No sets"}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Sets",
      key: "sets",
      render: (_, record) => record.sets?.length || 0,
    },
    {
      title: "Questions",
      key: "questions",
      render: (_, record) => record.summary?.totalQuestions || 0,
    },
    {
      title: "Time",
      key: "time",
      render: (_, record) => formatDuration(record.summary?.totalMinutes),
    },
    {
      title: "Price",
      key: "price",
      render: (_, record) => (
        <span className="whitespace-nowrap">
          {record.mrp > record.price && (
            <span className="mr-1 text-xs text-slate-400 line-through">{formatPrice(record.mrp)}</span>
          )}
          <span className="font-semibold text-blue-600">{formatPrice(record.price)}</span>
        </span>
      ),
    },
    {
      title: "Student saves",
      key: "savings",
      render: (_, record) =>
        record.summary?.savings > 0 ? (
          <Tooltip title={`Individual total ${formatPrice(record.summary.individualTotal)}`}>
            <span className="font-semibold text-emerald-600">{formatPrice(record.summary.savings)}</span>
          </Tooltip>
        ) : (
          <span className="text-slate-400">—</span>
        ),
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
              guard(PERMISSION_VALUES.EDIT, () => router.push(`/admin/practice/bundles/${record._id}`))
            }
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete this bundle?"
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
          onClick={() => guard(PERMISSION_VALUES.CREATE, () => router.push("/admin/practice/bundles/new"))}
        >
          Create Bundle
        </Button>
      </div>

      <div className="mt-4 flex w-full flex-wrap gap-3">
        <Input.Search
          placeholder="Search bundles…"
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
          dataSource={bundles}
          loading={status === "loading"}
          scroll={{ x: 900 }}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          locale={{ emptyText: "No bundles yet — create practice sets first, then group them here" }}
        />
      </div>
    </div>
  );
}
