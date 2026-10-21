"use client";
import React, { useEffect, useState } from "react";
import { App, AutoComplete, Button, Drawer, Form, Input, InputNumber, Segmented, Select, Switch, Timeline } from "antd";
import TemplateThumb from "@/components/resumeTemplates/TemplateThumb";
import ThumbnailUpload from "@/app/admin/(protected)/practice/Practice_utils/ThumbnailUpload";
import { ACCESS_OPTIONS, VISIBILITY_OPTIONS } from "@/components/resumeTemplates/access";
import { adminFetchAuditLog, adminSaveTemplateConfig } from "@/services/resumeTemplatesApi";
import { configPayload } from "./configPayload";
import FullTemplatePreview from "@/components/resumeTemplates/FullTemplatePreview";

const ACCESS_HELP = {
  free: "Every student can use this template.",
  premium: "Students buy this template on its own at the price below (it can also be added to bundles).",
  bundle: "Only students who buy a bundle containing this template can use it.",
};

export default function TemplateConfigDrawer({ template, categories, bundles, canEdit, onClose, onSaved }) {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState([]);
  const [showFull, setShowFull] = useState(false);
  const access = Form.useWatch("access", form) || template.access;
  const previewImage = Form.useWatch("previewImage", form);

  useEffect(() => {
    adminFetchAuditLog(template.key)
      .then(setHistory)
      .catch(() => setHistory([]));
  }, [template.key]);

  const inBundles = bundles.filter((b) => (b.templateKeys || []).includes(template.key));

  const handleFinish = async (values) => {
    setSaving(true);
    try {
      await adminSaveTemplateConfig(template.key, { ...configPayload(template), ...values });
      message.success("Template saved");
      await onSaved();
    } catch (err) {
      message.error(err.message || "Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      open
      width={560}
      onClose={onClose}
      title={`${template.name} · ${template.key}`}
      destroyOnHidden
      extra={
        canEdit && (
          <Button type="primary" loading={saving} onClick={() => form.submit()}>
            Save
          </Button>
        )
      }
    >
      <button
        type="button"
        onClick={() => setShowFull(true)}
        className="group relative mb-2 block w-full cursor-zoom-in overflow-hidden rounded-xl border border-slate-200 p-0"
      >
        <TemplateThumb templateKey={template.key} previewImage={previewImage} height={300} scale={0.36} />
        <span className="absolute inset-0 flex items-center justify-center bg-slate-900/40 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-800 shadow">View full template</span>
        </span>
      </button>
      <Button block className="!mb-5" onClick={() => setShowFull(true)}>
        View full template
      </Button>
      {showFull && (
        <FullTemplatePreview
          templates={[template]}
          index={0}
          onIndexChange={() => {}}
          onClose={() => setShowFull(false)}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        disabled={!canEdit}
        requiredMark="optional"
        initialValues={configPayload(template)}
        onFinish={handleFinish}
        onFinishFailed={() => message.error("Please fix the highlighted fields")}
      >
        <Form.Item name="name" label="Display name" rules={[{ required: true, whitespace: true, message: "Enter a name" }]}>
          <Input maxLength={60} showCount />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={2} maxLength={300} showCount placeholder="Shown in the template preview" />
        </Form.Item>
        <div className="grid grid-cols-2 gap-x-4">
          <Form.Item name="category" label="Category">
            <AutoComplete
              options={categories.map((c) => ({ value: c }))}
              placeholder="e.g. Modern"
              filterOption={(input, option) => option.value.toLowerCase().includes(input.toLowerCase())}
            />
          </Form.Item>
          <Form.Item name="order" label="Display order" tooltip="Lower numbers are shown first">
            <InputNumber min={0} precision={0} style={{ width: "100%" }} />
          </Form.Item>
        </div>
        <Form.Item name="bestFor" label="Best for" tooltip="Roles shown in the preview, e.g. Developers">
          <Select mode="tags" maxCount={8} placeholder="Type and press Enter" />
        </Form.Item>
        <Form.Item
          name="previewImage"
          label="Preview image"
          tooltip="Optional. Without an image, a live preview of the template is shown."
        >
          <ThumbnailUpload />
        </Form.Item>

        <div className="mb-2 mt-2 text-sm font-semibold text-slate-700">Access & pricing</div>
        <Form.Item name="access" label="Access type" extra={ACCESS_HELP[access]}>
          <Segmented options={ACCESS_OPTIONS} />
        </Form.Item>
        {access === "premium" && (
          <div className="grid grid-cols-3 gap-x-4">
            <Form.Item name="price" label="Price (₹)" rules={[{ required: true, message: "Enter a price" }]}>
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
        )}
        {access === "bundle" && (
          <div className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-[13px] text-amber-800">
            {inBundles.length
              ? `In: ${inBundles.map((b) => `${b.title}${b.status === "published" ? "" : " (draft)"}`).join(", ")}`
              : "Not in any bundle yet — add it to a bundle so students can get it."}
          </div>
        )}

        <div className="grid grid-cols-2 gap-x-4">
          <Form.Item name="visibility" label="Status">
            <Segmented options={VISIBILITY_OPTIONS} />
          </Form.Item>
          <Form.Item name="featured" label="Featured" valuePropName="checked">
            <Switch />
          </Form.Item>
        </div>
        <div className="text-[12px] text-slate-500">
          Students who already bought this template keep it, even if you hide it or change its price.
        </div>
      </Form>

      {history.length > 0 && (
        <div className="mt-6">
          <div className="mb-3 text-sm font-semibold text-slate-700">Recent changes</div>
          <Timeline
            items={history.slice(0, 6).map((h) => ({
              children: (
                <div className="text-[12px] text-slate-600">
                  <b className="capitalize">{h.action}</b> by {h.byEmail || "admin"}
                  <div className="text-slate-400">{new Date(h.at).toLocaleString("en-IN")}</div>
                </div>
              ),
            }))}
          />
        </div>
      )}
    </Drawer>
  );
}
