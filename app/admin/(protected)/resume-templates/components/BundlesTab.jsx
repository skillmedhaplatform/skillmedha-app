"use client";
import React, { useState } from "react";
import { App, Button, Empty, Popconfirm, Skeleton, Space, Table, Tag, Tooltip } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined, StarFilled } from "@ant-design/icons";
import TemplateThumb from "@/components/resumeTemplates/TemplateThumb";
import { formatPrice } from "@/components/resumeTemplates/access";
import { adminDeleteBundle } from "@/services/resumeTemplatesApi";
import { usePermissions, PERMISSION_VALUES } from "@/hooks/usepermission";
import BundleDrawer from "./BundleDrawer";

export default function BundlesTab({ templates, bundles, loading, onSaved }) {
  const { message } = App.useApp();
  const { canAccess, getPermissionMessage } = usePermissions();
  const canEdit = canAccess(PERMISSION_VALUES.EDIT);
  const canDelete = canAccess(PERMISSION_VALUES.DELETE);
  const [editing, setEditing] = useState(null); // bundle, or {} for a new one

  const nameOf = (key) => templates.find((t) => t.key === key)?.name || key;

  const handleDelete = async (bundle) => {
    try {
      await adminDeleteBundle(bundle._id);
      message.success("Bundle deleted");
      await onSaved();
    } catch (err) {
      message.error(err.message || "Failed to delete bundle");
    }
  };

  const columns = [
    {
      title: "Bundle",
      key: "title",
      render: (_, b) => (
        <div className="flex items-center gap-3">
          <div className="flex shrink-0 gap-1">
            {(b.templateKeys || []).slice(0, 3).map((key) => (
              <div key={key} className="w-[44px] overflow-hidden rounded border border-slate-200">
                <TemplateThumb templateKey={key} height={58} scale={0.06} />
              </div>
            ))}
          </div>
          <div className="min-w-0">
            <div className="truncate font-semibold text-slate-800">
              {b.featured && <StarFilled className="mr-1 text-amber-400" />}
              {b.title}
            </div>
            <Tooltip title={(b.templateKeys || []).map(nameOf).join(", ")}>
              <div className="text-xs text-slate-500">{(b.templateKeys || []).length} templates</div>
            </Tooltip>
          </div>
        </div>
      ),
    },
    {
      title: "Price",
      key: "price",
      render: (_, b) => (
        <span className="whitespace-nowrap">
          {b.mrp > b.price && <span className="mr-1 text-xs text-slate-400 line-through">{formatPrice(b.mrp)}</span>}
          <span className="font-semibold text-blue-600">{formatPrice(b.price)}</span>
        </span>
      ),
    },
    {
      title: "Validity",
      dataIndex: "validityDays",
      render: (d) => (d > 0 ? `${d} days` : "Lifetime"),
    },
    { title: "Order", dataIndex: "order", sorter: (a, b) => a.order - b.order },
    {
      title: "Status",
      dataIndex: "status",
      render: (s) => (s === "published" ? <Tag color="success">Published</Tag> : <Tag>Draft</Tag>),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, b) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => setEditing(b)}>
            {canEdit ? "Edit" : "View"}
          </Button>
          <Popconfirm
            title="Delete this bundle?"
            description="Students who bought it keep its templates."
            okText="Delete"
            okButtonProps={{ danger: true }}
            disabled={!canDelete}
            onConfirm={() => handleDelete(b)}
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => !canDelete && message.info(getPermissionMessage(PERMISSION_VALUES.DELETE))}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="text-[13px] text-slate-500">
          Group any templates into a bundle and sell them together. A template can be in many bundles.
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() =>
            canEdit ? setEditing({}) : message.info(getPermissionMessage(PERMISSION_VALUES.CREATE))
          }
        >
          Create bundle
        </Button>
      </div>

      {loading && !bundles.length ? (
        <Skeleton active paragraph={{ rows: 5 }} />
      ) : bundles.length ? (
        <Table rowKey="_id" columns={columns} dataSource={bundles} pagination={{ pageSize: 10 }} scroll={{ x: 800 }} />
      ) : (
        <Empty description="No bundles yet">
          {canEdit && (
            <Button type="primary" onClick={() => setEditing({})}>
              Create your first bundle
            </Button>
          )}
        </Empty>
      )}

      {editing && (
        <BundleDrawer
          bundle={editing}
          templates={templates}
          canEdit={canEdit}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await onSaved();
          }}
        />
      )}
    </div>
  );
}
