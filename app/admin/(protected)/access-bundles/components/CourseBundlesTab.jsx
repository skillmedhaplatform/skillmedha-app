"use client";
import React, { useEffect, useMemo, useState } from "react";
import { App, Button, Drawer, Empty, Form, Input, InputNumber, Popconfirm, Segmented, Select, Switch, Tag } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined, StarFilled } from "@ant-design/icons";
import { adminCreateCourseBundle, adminDeleteCourseBundle, adminUpdateCourseBundle } from "@/services/courseAccessApi";

const formatPrice = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;
const EMPTY = { title: "", description: "", thumbnail: "", courseIds: [], price: null, mrp: null, validityDays: 0, order: 100, featured: false, status: "draft" };

function BundleDrawer({ open, bundle, courses, onClose, onSaved }) {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const courseIds = Form.useWatch("courseIds", form) || [];
  const price = Form.useWatch("price", form);

  useEffect(() => {
    if (open) form.setFieldsValue(bundle ? { ...EMPTY, ...bundle } : EMPTY);
  }, [open, bundle, form]);

  const byId = useMemo(() => new Map(courses.map((c) => [c.courseId, c])), [courses]);
  const separateTotal = courseIds.reduce((sum, id) => sum + (Number(byId.get(id)?.price) || 0), 0);
  const savings = separateTotal > 0 && price > 0 && price < separateTotal ? Math.round(((separateTotal - price) / separateTotal) * 100) : 0;

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const body = { ...values, mrp: values.mrp || separateTotal || values.price };
      if (bundle?._id) await adminUpdateCourseBundle(bundle._id, body);
      else await adminCreateCourseBundle(body);
      message.success(bundle?._id ? "Bundle updated" : "Bundle created");
      onSaved();
    } catch (err) {
      message.error(err.message || "Couldn't save the bundle");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      title={bundle?._id ? "Edit course bundle" : "New course bundle"}
      open={open}
      onClose={onClose}
      width={560}
      destroyOnHidden
      extra={
        <Button type="primary" loading={saving} onClick={submit}>
          Save
        </Button>
      }
    >
      <Form form={form} layout="vertical" requiredMark="optional">
        <Form.Item name="title" label="Bundle name" rules={[{ required: true, message: "Give the bundle a name" }]}>
          <Input maxLength={80} placeholder="e.g. Data Analyst Career Pack" />
        </Form.Item>
        <Form.Item name="description" label="Short description">
          <Input.TextArea maxLength={300} rows={2} placeholder="What students get from this bundle" />
        </Form.Item>
        <Form.Item
          name="courseIds"
          label="Courses"
          rules={[{ validator: (_, v) => (v?.length >= 2 ? Promise.resolve() : Promise.reject(new Error("Pick at least 2 courses"))) }]}
        >
          <Select
            mode="multiple"
            placeholder="Pick the courses in this bundle"
            optionFilterProp="label"
            options={courses.map((c) => ({
              value: c.courseId,
              label: `${c.title}${c.price > 0 ? ` · ${formatPrice(c.price)}` : " · Free"}${c.visibility === "hidden" ? " (hidden)" : ""}`,
            }))}
          />
        </Form.Item>
        {courseIds.length > 0 && (
          <div className="-mt-2 mb-4 rounded-lg bg-slate-50 px-3 py-2 text-[13px] text-slate-600">
            Bought separately: <b>{formatPrice(separateTotal)}</b>
            {savings > 0 && <span className="ml-2 font-semibold text-emerald-600">Students save {savings}%</span>}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Form.Item name="price" label="Bundle price (₹)" rules={[{ required: true, message: "Set a price" }]}>
            <InputNumber min={1} className="!w-full" placeholder="599" />
          </Form.Item>
          <Form.Item name="mrp" label="Original price (₹)" tooltip="Shown struck through. Leave empty to use the separate total.">
            <InputNumber min={0} className="!w-full" placeholder={separateTotal ? String(separateTotal) : ""} />
          </Form.Item>
          <Form.Item name="validityDays" label="Access validity (days)" tooltip="0 means lifetime access">
            <InputNumber min={0} className="!w-full" />
          </Form.Item>
          <Form.Item name="order" label="Display order" tooltip="Lower numbers show first">
            <InputNumber min={0} className="!w-full" />
          </Form.Item>
        </div>
        <Form.Item name="thumbnail" label="Image URL (optional)">
          <Input placeholder="https://…" />
        </Form.Item>
        <div className="flex items-center gap-8">
          <Form.Item name="status" label="Status">
            <Segmented
              options={[
                { value: "draft", label: "Draft" },
                { value: "published", label: "Published" },
              ]}
            />
          </Form.Item>
          <Form.Item name="featured" label="Mark as popular" valuePropName="checked">
            <Switch />
          </Form.Item>
        </div>
        <div className="text-[12px] text-slate-400">
          Students who already bought this bundle keep the courses it had when they paid, so editing is safe.
        </div>
      </Form>
    </Drawer>
  );
}

export default function CourseBundlesTab({ bundles, courses, loading, onChanged }) {
  const { message } = App.useApp();
  const [editing, setEditing] = useState(null); // null = closed, {} = new, bundle = edit
  const byId = useMemo(() => new Map(courses.map((c) => [c.courseId, c])), [courses]);

  const remove = async (bundle) => {
    try {
      await adminDeleteCourseBundle(bundle._id);
      message.success("Bundle deleted");
      onChanged();
    } catch (err) {
      message.error(err.message || "Couldn't delete");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setEditing({})}>
          New bundle
        </Button>
      </div>

      {!loading && !bundles.length ? (
        <Empty description="No course bundles yet">
          <Button type="primary" onClick={() => setEditing({})}>
            Create the first bundle
          </Button>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {bundles.map((b) => {
            const total = (b.courseIds || []).reduce((s, id) => s + (Number(byId.get(id)?.price) || 0), 0);
            return (
              <div key={b._id} className="flex flex-col rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="mb-1 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[15px] font-bold text-slate-800">
                    {b.featured && <StarFilled className="text-amber-400" />}
                    {b.title}
                  </div>
                  <Tag color={b.status === "published" ? "green" : "default"}>{b.status === "published" ? "Published" : "Draft"}</Tag>
                </div>
                {b.description && <div className="mb-2 line-clamp-2 text-[13px] text-slate-500">{b.description}</div>}
                <ul className="mb-3 flex flex-col gap-1 pl-0">
                  {(b.courseIds || []).map((id) => (
                    <li key={id} className="list-none truncate text-[13px] text-slate-600">
                      • {byId.get(id)?.title || "Removed course"}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex items-end justify-between border-t border-slate-100 pt-3">
                  <div>
                    <span className="text-[18px] font-bold text-slate-900">{formatPrice(b.price)}</span>
                    {b.mrp > b.price && <span className="ml-2 text-[13px] text-slate-400 line-through">{formatPrice(b.mrp)}</span>}
                    <div className="text-[12px] text-slate-400">
                      Separately {formatPrice(total)} · {b.validityDays > 0 ? `${b.validityDays} days` : "Lifetime"}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="small" icon={<EditOutlined />} onClick={() => setEditing(b)} />
                    <Popconfirm
                      title="Delete this bundle?"
                      description="Students who bought it keep their courses."
                      okText="Delete"
                      okButtonProps={{ danger: true }}
                      onConfirm={() => remove(b)}
                    >
                      <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <BundleDrawer
        open={!!editing}
        bundle={editing?._id ? editing : null}
        courses={courses}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          onChanged();
        }}
      />
    </div>
  );
}
