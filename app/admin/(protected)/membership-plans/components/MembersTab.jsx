"use client";
import React, { useCallback, useEffect, useState } from "react";
import { App, Button, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, Tag } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { adminExtendMembership, adminFetchMembers, adminRevokeMembership } from "@/services/membershipApi";
import { PLAN_TAG_COLOR, formatDate, formatPrice } from "@/components/membership/plans";

const STATUS_FILTERS = [
  { value: "active", label: "Active" },
  { value: "ended", label: "Ended" },
  { value: "all", label: "All" },
];

const statusOf = (row) => {
  if (row.status === "revoked") return { text: "Removed", color: "red" };
  if (row.status === "upgraded") return { text: "Upgraded", color: "blue" };
  if (new Date(row.expiresAt).getTime() <= Date.now()) return { text: "Ended", color: "default" };
  if (new Date(row.startsAt).getTime() > Date.now()) return { text: "Starts later", color: "cyan" };
  return { text: "Active", color: "green" };
};

// Students who bought a plan. Plans are only ever bought by students; the admin
// can see them here, and extend or end one if a student needs support.
export default function MembersTab({ plans, onChanged }) {
  const { message } = App.useApp();
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("active");
  const [plan, setPlan] = useState(undefined);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [extending, setExtending] = useState(null);
  const [saving, setSaving] = useState(false);
  const [extendForm] = Form.useForm();

  const nameOf = (key) => plans.find((p) => p.key === key)?.name || key;
  const paidPlans = plans.filter((p) => p.key !== "free").map((p) => ({ value: p.key, label: p.name }));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetchMembers({ status, plan, search: query, page, limit: 20 });
      setRows(res.data);
      setTotal(res.total);
    } catch (err) {
      message.error(err.message || "Failed to load members");
    } finally {
      setLoading(false);
    }
  }, [status, plan, query, page, message]);

  useEffect(() => {
    load();
  }, [load]);

  const afterChange = () => {
    load();
    onChanged();
  };

  const extend = async ({ days }) => {
    setSaving(true);
    try {
      await adminExtendMembership(extending._id, days);
      message.success("Membership extended");
      setExtending(null);
      extendForm.resetFields();
      afterChange();
    } catch (err) {
      message.error(err.message || "Couldn't extend this membership");
    } finally {
      setSaving(false);
    }
  };

  const revoke = async (row) => {
    try {
      await adminRevokeMembership(row._id);
      message.success("Plan removed");
      afterChange();
    } catch (err) {
      message.error(err.message || "Couldn't remove this plan");
    }
  };

  const columns = [
    {
      title: "Student",
      key: "student",
      render: (_, row) => (
        <div>
          <div className="font-medium text-slate-800">{row.name || "—"}</div>
          <div className="text-[12px] text-slate-400">{row.email}</div>
        </div>
      ),
    },
    {
      title: "Plan",
      dataIndex: "planKey",
      width: 110,
      render: (key) => <Tag color={PLAN_TAG_COLOR[key]} className="!m-0">{nameOf(key)}</Tag>,
    },
    { title: "Paid", dataIndex: "amountCharged", width: 100, render: formatPrice },
    { title: "Starts", dataIndex: "startsAt", width: 120, render: formatDate },
    { title: "Ends", dataIndex: "expiresAt", width: 120, render: formatDate },
    {
      title: "Status",
      key: "status",
      width: 110,
      render: (_, row) => {
        const s = statusOf(row);
        return <Tag color={s.color} className="!m-0">{s.text}</Tag>;
      },
    },
    {
      title: "",
      key: "actions",
      width: 170,
      render: (_, row) =>
        row.status === "active" && (
          <Space size={4}>
            <Button size="small" onClick={() => setExtending(row)}>
              Extend
            </Button>
            <Popconfirm
              title="Remove this plan now?"
              description="The student loses plan access right away, including any queued renewal. No money is refunded."
              okText="Remove"
              okButtonProps={{ danger: true }}
              onConfirm={() => revoke(row)}
            >
              <Button size="small" danger>
                Remove
              </Button>
            </Popconfirm>
          </Space>
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <Input.Search
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Search name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSearch={(value) => {
            setPage(1);
            setQuery(value);
          }}
          className="!w-[260px]"
        />
        <Select
          value={status}
          options={STATUS_FILTERS}
          className="w-[120px]"
          aria-label="Filter by status"
          onChange={(value) => {
            setPage(1);
            setStatus(value);
          }}
        />
        <Select
          allowClear
          placeholder="Any plan"
          value={plan}
          options={paidPlans}
          className="w-[130px]"
          aria-label="Filter by plan"
          onChange={(value) => {
            setPage(1);
            setPlan(value);
          }}
        />
      </div>

      <Table
        rowKey="_id"
        loading={loading}
        columns={columns}
        dataSource={rows}
        size="middle"
        scroll={{ x: 900 }}
        locale={{ emptyText: "No students have bought a plan yet" }}
        pagination={{ current: page, pageSize: 20, total, showSizeChanger: false, onChange: setPage }}
      />

      <Modal
        open={!!extending}
        title={`Extend ${extending?.name || extending?.email || "membership"}`}
        okText="Extend"
        confirmLoading={saving}
        onOk={() => extendForm.submit()}
        onCancel={() => setExtending(null)}
      >
        <Form form={extendForm} layout="vertical" onFinish={extend} initialValues={{ days: 30 }}>
          <Form.Item name="days" label="Days to add" rules={[{ required: true, message: "Enter days" }]}>
            <InputNumber min={1} max={3650} className="!w-full" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
