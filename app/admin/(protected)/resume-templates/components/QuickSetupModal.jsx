"use client";
import React, { useMemo, useState } from "react";
import { App, Checkbox, InputNumber, Modal, Radio } from "antd";
import { CATEGORY_SUGGESTIONS, formatPrice } from "@/components/resumeTemplates/access";
import { adminSaveTemplateConfigsBulk } from "@/services/resumeTemplatesApi";
import { PRICE_PRESETS } from "./PricePicker";
import { configPayload } from "./configPayload";

// One-step setup for all templates: pick which categories stay free and one
// price for everything else. Re-runnable at any time; fine-tune afterwards.
export default function QuickSetupModal({ templates, onClose, onSaved }) {
  const { message } = App.useApp();
  const categories = useMemo(
    () => [...new Set([...CATEGORY_SUGGESTIONS, ...templates.map((t) => t.category).filter(Boolean)])],
    [templates]
  );
  const [freeCategories, setFreeCategories] = useState(["Simple", "ATS-Friendly"]);
  const [paidAccess, setPaidAccess] = useState("premium");
  const [price, setPrice] = useState(99);
  const [mrp, setMrp] = useState(199);
  const [publishAll, setPublishAll] = useState(true);
  const [saving, setSaving] = useState(false);

  const freeCount = templates.filter((t) => freeCategories.includes(t.category)).length;
  const paidCount = templates.length - freeCount;
  const priceInvalid = paidAccess === "premium" && paidCount > 0 && (!price || price <= 0 || (mrp && mrp < price));

  const apply = async () => {
    setSaving(true);
    try {
      const payload = templates.map((t) => {
        const isFree = freeCategories.includes(t.category);
        return {
          templateKey: t.key,
          ...configPayload(t, {
            access: isFree ? "free" : paidAccess,
            price: !isFree && paidAccess === "premium" ? price : 0,
            mrp: !isFree && paidAccess === "premium" ? mrp || price : 0,
            ...(publishAll ? { visibility: "published" } : {}),
          }),
        };
      });
      await adminSaveTemplateConfigsBulk(payload);
      message.success(`Done — ${freeCount} free, ${paidCount} ${paidAccess === "premium" ? `premium at ${formatPrice(price)}` : "bundle-only"}`);
      await onSaved();
    } catch (err) {
      message.error(err.message || "Quick setup failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      title="Quick setup"
      okText={`Apply to all ${templates.length} templates`}
      onOk={apply}
      confirmLoading={saving}
      okButtonProps={{ disabled: priceInvalid }}
      onCancel={onClose}
      width={560}
    >
      <div className="flex flex-col gap-5 py-2">
        <div>
          <div className="mb-2 font-semibold text-slate-800">1. Which categories stay free?</div>
          <Checkbox.Group
            value={freeCategories}
            onChange={setFreeCategories}
            options={categories.map((c) => ({
              value: c,
              label: `${c} (${templates.filter((t) => t.category === c).length})`,
            }))}
          />
        </div>

        <div>
          <div className="mb-2 font-semibold text-slate-800">2. How do students get the other {paidCount} templates?</div>
          <Radio.Group value={paidAccess} onChange={(e) => setPaidAccess(e.target.value)}>
            <Radio value="premium">Buy each one</Radio>
            <Radio value="bundle">Only through bundles</Radio>
          </Radio.Group>
          {paidAccess === "premium" && (
            <div className="mt-3 flex flex-col gap-2">
              <div className="flex flex-wrap gap-1.5">
                {PRICE_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPrice(p)}
                    className={`rounded-full border px-3 py-1 text-[12px] font-semibold ${
                      price === p ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 text-slate-600"
                    }`}
                  >
                    ₹{p}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <InputNumber addonBefore="Price ₹" min={1} precision={0} value={price} onChange={setPrice} />
                <InputNumber addonBefore="Original ₹" min={1} precision={0} value={mrp} onChange={setMrp} />
              </div>
              {mrp && mrp < price && <div className="text-[12px] text-red-500">Original price must be at least the price.</div>}
            </div>
          )}
          {paidAccess === "bundle" && (
            <div className="mt-2 text-[12px] text-amber-700">Remember to add them to a bundle in the Bundles tab.</div>
          )}
        </div>

        <Checkbox checked={publishAll} onChange={(e) => setPublishAll(e.target.checked)}>
          Publish every template (show them all to students)
        </Checkbox>

        <div className="rounded-lg bg-slate-50 px-3 py-2 text-[13px] text-slate-600">
          Result: <b>{freeCount}</b> free ·{" "}
          <b>{paidCount}</b> {paidAccess === "premium" ? `premium at ${formatPrice(price || 0)}` : "bundle-only"}. Names,
          descriptions and order are kept. Students who already bought templates keep them.
        </div>
      </div>
    </Modal>
  );
}
