"use client";
import React, { useMemo, useState } from "react";
import { App, Button, Checkbox, Drawer, Form, Input, InputNumber, Segmented, Switch, Tag } from "antd";
import TemplateThumb from "@/components/resumeTemplates/TemplateThumb";
import ThumbnailUpload from "@/app/admin/(protected)/practice/Practice_utils/ThumbnailUpload";
import { accessLabel, formatPrice } from "@/components/resumeTemplates/access";
import { adminCreateBundle, adminUpdateBundle } from "@/services/resumeTemplatesApi";

const DEFAULTS = {
  title: "",
  description: "",
  thumbnail: "",
  templateKeys: [],
  price: null,
  mrp: null,
  validityDays: 0,
  order: 1,
  featured: false,
  status: "draft",
};

// Controlled field: pick any templates by ticking their previews.
function TemplatePicker({ value = [], onChange, templates, disabled }) {
  const [search, setSearch] = useState("");
  const selected = new Set(value);
  const shown = templates.filter((t) => {
    const q = search.trim().toLowerCase();
    return !q || t.name.toLowerCase().includes(q) || t.key.includes(q);
  });
  const toggle = (key) =>
    onChange?.(selected.has(key) ? value.filter((k) => k !== key) : [...value, key]);

  return (
    <div className="flex flex-col gap-2">
      <Input.Search allowClear placeholder="Search templates…" onChange={(e) => setSearch(e.target.value)} />
      <div className="grid max-h-[360px] grid-cols-3 gap-2 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-2">
        {shown.map((t) => {
          const isOn = selected.has(t.key);
          return (
            <div
              key={t.key}
              role="button"
              tabIndex={disabled ? -1 : 0}
              onClick={() => {
                if (!disabled) toggle(t.key);
              }}
              onKeyDown={(e) => {
                if (!disabled && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  toggle(t.key);
                }
              }}
              className={`overflow-hidden rounded-md border bg-white text-left transition-all ${
                disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
              } ${
                isOn ? "border-blue-500 ring-2 ring-blue-500/30" : "border-slate-200 hover:border-blue-300"
              }`}
            >
              <TemplateThumb templateKey={t.key} previewImage={t.previewImage} height={110} scale={0.15} />
              <div className="flex items-center gap-1.5 border-t border-slate-100 px-1.5 py-1">
                <Checkbox checked={isOn} disabled={disabled} />
                <span className="truncate text-[11px] font-medium text-slate-700">{t.name}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function BundleDrawer({ bundle, templates, canEdit, onClose, onSaved }) {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const isNew = !bundle?._id;
  const watchedKeys = Form.useWatch("templateKeys", form);
  const keys = useMemo(() => watchedKeys || bundle?.templateKeys || [], [watchedKeys, bundle]);
  const price = Form.useWatch("price", form);

  const chosen = useMemo(() => templates.filter((t) => keys.includes(t.key)), [templates, keys]);
  const separateTotal = chosen.reduce((sum, t) => sum + (t.access === "premium" ? t.price : 0), 0);
  const hiddenChosen = chosen.filter((t) => t.visibility === "hidden");
  const freeChosen = chosen.filter((t) => t.access === "free");

  const handleFinish = async (values) => {
    setSaving(true);
    try {
      if (isNew) await adminCreateBundle(values);
      else await adminUpdateBundle(bundle._id, values);
      message.success(isNew ? "Bundle created" : "Bundle saved");
      await onSaved();
    } catch (err) {
      message.error(err.message || "Failed to save bundle");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      open
      size={640}
      onClose={onClose}
      title={isNew ? "Create bundle" : `Edit · ${bundle.title}`}
      destroyOnHidden
      extra={
        canEdit && (
          <Button type="primary" loading={saving} onClick={() => form.submit()}>
            {isNew ? "Create" : "Save"}
          </Button>
        )
      }
    >
      <Form
        form={form}
        layout="vertical"
        disabled={!canEdit}
        requiredMark="optional"
        initialValues={{ ...DEFAULTS, ...bundle }}
        onFinish={handleFinish}
        onFinishFailed={() => message.error("Please fix the highlighted fields")}
      >
        <Form.Item name="title" label="Bundle name" rules={[{ required: true, whitespace: true, message: "Enter a name" }]}>
          <Input maxLength={80} showCount placeholder="e.g. Professional Bundle" />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={2} maxLength={300} showCount />
        </Form.Item>
        <Form.Item name="thumbnail" label="Bundle image">
          <ThumbnailUpload />
        </Form.Item>

        <Form.Item
          name="templateKeys"
          label={`Templates in this bundle (${keys.length})`}
          rules={[{ type: "array", min: 1, message: "Select at least one template" }]}
        >
          <TemplatePicker templates={templates} disabled={!canEdit} />
        </Form.Item>
        {chosen.length > 0 && (
          <div className="-mt-2 mb-4 flex flex-wrap gap-1">
            {chosen.map((t) => (
              <Tag key={t.key} className="!m-0">
                {t.name} · {accessLabel(t.access)}
              </Tag>
            ))}
          </div>
        )}
        {(hiddenChosen.length > 0 || freeChosen.length > 0) && (
          <div className="mb-4 rounded-lg bg-slate-50 px-3 py-2 text-[12px] text-slate-600">
            {hiddenChosen.length > 0 && (
              <div>
                {hiddenChosen.length} hidden template(s) will be unlocked for buyers but aren&apos;t shown in the gallery.
              </div>
            )}
            {freeChosen.length > 0 && <div>{freeChosen.length} template(s) are already free for everyone.</div>}
          </div>
        )}

        <div className="grid grid-cols-3 gap-x-4">
          <Form.Item name="price" label="Bundle price (₹)" rules={[{ required: true, message: "Enter a price" }]}>
            <InputNumber min={1} precision={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="mrp"
            label="Original price (₹)"
            dependencies={["price"]}
            rules={[
              ({ getFieldValue }) => ({
                validator: (_, value) =>
                  value && value < getFieldValue("price")
                    ? Promise.reject(new Error("Can't be lower than the price"))
                    : Promise.resolve(),
              }),
            ]}
          >
            <InputNumber min={1} precision={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="validityDays" label="Validity (days)" tooltip="0 means lifetime access">
            <InputNumber min={0} precision={0} style={{ width: "100%" }} />
          </Form.Item>
        </div>
        {separateTotal > 0 && price > 0 && (
          <div
            className={`mb-4 rounded-lg px-3 py-2 text-[13px] ${
              separateTotal > price ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"
            }`}
          >
            Premium templates bought separately: {formatPrice(separateTotal)}.{" "}
            {separateTotal > price
              ? `Students save ${formatPrice(separateTotal - price)}.`
              : "The bundle isn't cheaper than buying them separately."}
          </div>
        )}

        <div className="grid grid-cols-3 gap-x-4">
          <Form.Item name="order" label="Display order" tooltip="Lower numbers are shown first">
            <InputNumber min={0} precision={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="featured" label="Featured" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="status" label="Status">
            <Segmented
              options={[
                { value: "draft", label: "Draft" },
                { value: "published", label: "Published" },
              ]}
            />
          </Form.Item>
        </div>
        {!isNew && (
          <div className="text-[12px] text-slate-500">
            Students who already bought this bundle keep the templates it had when they paid.
          </div>
        )}
      </Form>
    </Drawer>
  );
}
