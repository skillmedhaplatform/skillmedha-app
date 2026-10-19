"use client";
import React, { useCallback, useEffect, useState } from "react";
import { App, Input, Table, Tag } from "antd";
import { formatPrice } from "@/components/resumeTemplates/access";
import { adminFetchPurchases } from "@/services/resumeTemplatesApi";

// Student purchase history for resume templates and bundles.
export default function PurchasesTab() {
  const { message } = App.useApp();
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetchPurchases({ page, pageSize: 20, search });
      setRows(res.data || []);
      setTotal(res.pagination?.total || 0);
    } catch (err) {
      message.error(err.message || "Failed to load purchases");
    } finally {
      setLoading(false);
    }
  }, [page, search, message]);

  useEffect(() => {
    load();
  }, [load]);

  const columns = [
    {
      title: "Date",
      dataIndex: "createdAt",
      render: (d) => new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
    },
    { title: "Student", dataIndex: "email" },
    {
      title: "Item",
      key: "item",
      render: (_, r) => (
        <span>
          <Tag color={r.itemType === "resumeBundle" ? "gold" : "blue"}>
            {r.itemType === "resumeBundle" ? "Bundle" : "Template"}
          </Tag>
          {r.itemTitle || r.itemId}
        </span>
      ),
    },
    { title: "Amount", dataIndex: "amountCharged", render: (a) => formatPrice(a) },
    { title: "Order ID", dataIndex: "orderId", render: (id) => <span className="text-xs text-slate-500">{id}</span> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Input.Search
        allowClear
        placeholder="Search by student email, item or order ID…"
        onSearch={(value) => {
          setSearch(value.trim());
          setPage(1);
        }}
        style={{ maxWidth: 360 }}
      />
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={rows}
        loading={loading}
        scroll={{ x: 760 }}
        locale={{ emptyText: "No resume template purchases yet" }}
        pagination={{ current: page, pageSize: 20, total, onChange: setPage, showSizeChanger: false }}
      />
    </div>
  );
}
