"use client";
import React, { useEffect, useMemo, useState } from "react";
import { App, Button, Drawer, Form, Input, InputNumber, Popconfirm, Segmented, Select, Switch, Tooltip } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined, StarFilled } from "@ant-design/icons";
import { FiBookOpen, FiClock, FiPercent } from "react-icons/fi";
import { BsStack, BsCheckCircleFill } from "react-icons/bs";
import ThumbnailUpload from "@/app/admin/(protected)/practice/Practice_utils/ThumbnailUpload";
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
      size={560}
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
        <Form.Item name="thumbnail" label="Card image">
          <ThumbnailUpload />
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

function BundleCard({ bundle: b, byId, onEdit, onDelete }) {
  const [imgError, setImgError] = useState(false);

  const courseIds = b.courseIds || [];
  const separateTotal = courseIds.reduce((sum, id) => sum + (Number(byId.get(id)?.price) || 0), 0);
  const baseline = b.mrp || separateTotal;
  const savingsPercent = baseline > b.price ? Math.round(((baseline - b.price) / baseline) * 100) : 0;

  const resolvedCourses = courseIds.map((id) => {
    const course = byId.get(id);
    return {
      courseId: id,
      title: course?.title || "Removed course",
      price: Number(course?.price) || 0,
    };
  });

  const shownCourses = resolvedCourses.slice(0, 3);
  const remainingCourses = resolvedCourses.slice(3);
  const hiddenCount = remainingCourses.length;

  const hasThumbnail = b.thumbnail && !imgError;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-[0_16px_36px_-12px_rgba(15,23,42,0.14)]">
      {/* Header Banner / Artwork */}
      <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-slate-900 flex items-center justify-center">
        {hasThumbnail ? (
          <>
            {/* Ambient blurred backdrop for seamless fill */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={b.thumbnail}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover blur-md opacity-40 scale-110 pointer-events-none"
            />
            {/* Main uploaded image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={b.thumbnail}
              alt={b.title}
              onError={() => setImgError(true)}
              className="relative z-[1] h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Overlay gradient */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-slate-950/35 z-[2]" />
          </>
        ) : (
          <div className="relative h-full w-full bg-gradient-to-br from-slate-900 via-[#132238] to-[#0d1829] flex items-center justify-center">
            {/* Decorative subtle mesh */}
            <div
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage: "radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)",
                backgroundSize: "16px 16px",
              }}
            />
            {/* Soft glowing ambient lights */}
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-blue-500/20 blur-2xl pointer-events-none" />
            <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />
            {/* Decorative watermark */}
            <BsStack className="absolute -bottom-3 -right-3 text-[92px] text-white/[0.04] pointer-events-none rotate-12" />

            {/* Center icon badge */}
            <div className="relative z-[1] flex flex-col items-center gap-1.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-md border border-white/15 shadow-inner transition-transform duration-500 group-hover:scale-110">
                <BsStack className="text-xl text-blue-300" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">Course Bundle</span>
            </div>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5">
          {b.status === "published" ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-2.5 py-0.5 text-[10.5px] font-bold text-white shadow-sm backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              Published
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800/85 px-2.5 py-0.5 text-[10.5px] font-semibold text-slate-200 shadow-sm backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
              Draft
            </span>
          )}
        </div>

        <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5">
          {b.featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/95 px-2.5 py-0.5 text-[10.5px] font-extrabold text-amber-950 shadow-sm backdrop-blur-md">
              <StarFilled className="text-[10px]" /> Popular
            </span>
          )}
        </div>

        {/* Bottom Bar Badges on Banner */}
        <div className="absolute bottom-2.5 left-3 right-3 z-10 flex items-center justify-between text-white text-[11px] font-semibold">
          <span className="inline-flex items-center gap-1 rounded-md bg-black/60 px-2 py-0.5 backdrop-blur-md border border-white/10">
            <FiBookOpen className="text-blue-400 text-xs" />
            {courseIds.length} {courseIds.length === 1 ? "Course" : "Courses"}
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-black/60 px-2 py-0.5 backdrop-blur-md border border-white/10">
            <FiClock className="text-amber-400 text-xs" />
            {b.validityDays > 0 ? `${b.validityDays} Days` : "Lifetime"}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Title & Description */}
        <div className="mb-2.5">
          <button
            type="button"
            onClick={onEdit}
            className="text-left w-full cursor-pointer border-none bg-transparent p-0 text-[16px] font-bold text-slate-800 transition-colors group-hover:text-blue-600 line-clamp-1"
            title={b.title}
          >
            {b.title}
          </button>
          {b.description ? (
            <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-slate-500 min-h-[36px] m-0">
              {b.description}
            </p>
          ) : (
            <p className="mt-1 text-[12.5px] italic text-slate-400 min-h-[36px] m-0">
              No description provided
            </p>
          )}
        </div>

        {/* Included Courses Section */}
        <div className="mb-3 rounded-xl bg-slate-50 p-2.5 border border-slate-100 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
            <span>Included Courses</span>
            <span>{courseIds.length} Total</span>
          </div>
          <ul className="m-0 p-0 list-none flex flex-col gap-1">
            {shownCourses.map((c) => (
              <li key={c.courseId} className="flex items-center justify-between gap-2 text-[12px] text-slate-700">
                <span className="flex items-center gap-1.5 min-w-0">
                  <BsCheckCircleFill className="text-blue-500 text-[10px] shrink-0" />
                  <span className="truncate font-medium">{c.title}</span>
                </span>
                <span className="shrink-0 text-[11px] font-semibold text-slate-500">
                  {c.price > 0 ? formatPrice(c.price) : "Free"}
                </span>
              </li>
            ))}
          </ul>
          {hiddenCount > 0 && (
            <Tooltip
              title={
                <div className="flex flex-col gap-0.5 text-xs py-1">
                  {remainingCourses.map((c) => (
                    <div key={c.courseId}>• {c.title}</div>
                  ))}
                </div>
              }
            >
              <span className="inline-block pt-0.5 text-[11px] font-semibold text-blue-600 hover:text-blue-700 cursor-pointer">
                +{hiddenCount} more courses
              </span>
            </Tooltip>
          )}
        </div>

        {/* Savings banner (if any) */}
        {savingsPercent > 0 && (
          <div className="mb-3 flex items-center justify-between rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[11.5px] font-semibold text-emerald-800 border border-emerald-100">
            <span className="flex items-center gap-1">
              <FiPercent className="text-emerald-600" /> Save {savingsPercent}%
            </span>
            <span className="text-[11px] font-normal text-emerald-700">
              Separately: <span className="line-through">{formatPrice(separateTotal)}</span>
            </span>
          </div>
        )}

        {/* Card Footer: Pricing & Actions */}
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[19px] font-extrabold text-slate-900 tracking-tight">
                {formatPrice(b.price)}
              </span>
              {b.mrp > b.price && (
                <span className="text-[12px] text-slate-400 line-through">
                  {formatPrice(b.mrp)}
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400">
              Display order: #{b.order ?? 100}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Tooltip title="Edit bundle">
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={onEdit}
                className="!flex !items-center !justify-center !h-8 !w-8 !rounded-lg !border-slate-200 hover:!border-blue-400 hover:!text-blue-600 hover:!bg-blue-50/50"
              />
            </Tooltip>
            <Popconfirm
              title="Delete this bundle?"
              description="Students who bought it keep their courses."
              okText="Delete"
              okButtonProps={{ danger: true }}
              onConfirm={onDelete}
            >
              <Tooltip title="Delete bundle">
                <Button
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  className="!flex !items-center !justify-center !h-8 !w-8 !rounded-lg !border-slate-200 hover:!border-red-400 hover:!bg-red-50/50"
                />
              </Tooltip>
            </Popconfirm>
          </div>
        </div>
      </div>
    </div>
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
      <div className="flex items-center justify-between">
        <div className="text-[13px] text-slate-500">
          Showing <span className="font-semibold text-slate-800">{bundles.length}</span> course {bundles.length === 1 ? "bundle" : "bundles"}
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setEditing({})}>
          New bundle
        </Button>
      </div>

      {!loading && !bundles.length ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4 shadow-sm">
            <BsStack className="text-3xl" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">No course bundles yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mb-6">
            Group multiple courses together into attractive bundles with discounted pricing to boost student enrollments.
          </p>
          <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => setEditing({})}>
            Create the first bundle
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {bundles.map((b) => (
            <BundleCard
              key={b._id}
              bundle={b}
              byId={byId}
              onEdit={() => setEditing(b)}
              onDelete={() => remove(b)}
            />
          ))}
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
