"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Button, Drawer, Input, InputNumber, Switch, Tag } from "antd";
import { GiftOutlined, LockOutlined, AppstoreOutlined } from "@ant-design/icons";

const PRICE_PRESETS = [199, 299, 499, 799, 999, 1499];
const formatPrice = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const ACCESS_CARDS = [
  { value: "free", icon: <GiftOutlined />, title: "Free", text: "Every student can open all lessons." },
  { value: "premium", icon: <LockOutlined />, title: "Premium", text: "Students buy it at the price below, or in a bundle." },
  { value: "bundle", icon: <AppstoreOutlined />, title: "Bundle only", text: "Can't be bought alone — only inside a bundle." },
];

const Section = ({ title, hint, children }) => (
  <div className="rounded-xl border border-slate-100 bg-white p-4">
    <div className="text-[13px] font-bold text-slate-800">{title}</div>
    {hint && <div className="mb-3 text-[12px] text-slate-400">{hint}</div>}
    {!hint && <div className="mb-3" />}
    {children}
  </div>
);

const priceFrom = (course) =>
  course?.basePrice || (course?.price > 0 ? course.price + (course.couponDiscount || 0) : null);

// Everything about one course in one place, saved together with one button.
// Prices and coupon are written to the course itself (same fields as the
// course editor), so checkout, course cards and the editor always agree.
export default function CourseEditDrawer({ course, open, saving, onClose, onSave }) {
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (!open || !course) return;
    setForm({
      access: course.access,
      visibility: course.visibility,
      featured: !!course.featured,
      order: course.order ?? 100,
      price: priceFrom(course),
      mrp: course.mrp > 0 ? course.mrp : null,
      couponCode: course.couponCode || "",
      couponDiscount: course.couponDiscount || 0,
    });
  }, [open, course]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const check = useMemo(() => {
    if (!form) return { errors: {} };
    const price = Number(form.price) || 0;
    const mrp = Number(form.mrp) || 0;
    const discount = Number(form.couponDiscount) || 0;
    const errors = {};
    const needsPrice = form.access !== "free";
    if (needsPrice && price <= 0) errors.price = "Set a price for a paid course";
    if (mrp && mrp < price) errors.mrp = "Must be at least the price";
    if (discount > 0 && !String(form.couponCode).trim()) errors.coupon = "Give the coupon a code";
    if (discount > 0 && price > 0 && discount >= price) errors.coupon = "Discount must be less than the price";
    const pays = form.access === "free" ? 0 : Math.max(0, price - discount);
    const strike = Math.max(mrp, price);
    const off = strike > pays && strike > 0 ? Math.round(((strike - pays) / strike) * 100) : 0;
    return { errors, pays, strike, off };
  }, [form]);

  if (!course || !form) return null;
  const hasErrors = Object.keys(check.errors).length > 0;

  const save = () => {
    const body = {
      access: form.access,
      visibility: form.visibility,
      featured: form.featured,
      order: Number(form.order) || 0,
    };
    // Price fields are only sent when there is a price (free courses may have none).
    if (Number(form.price) > 0) {
      body.price = Number(form.price);
      body.mrp = Number(form.mrp) || Number(form.price);
      body.couponDiscount = Number(form.couponDiscount) || 0;
      body.couponCode = String(form.couponCode || "").trim().toUpperCase();
    }
    onSave(course, body);
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={520}
      destroyOnHidden
      title={
        <div className="flex items-center gap-3">
          <div className="h-[36px] w-[54px] shrink-0 overflow-hidden rounded-md border border-slate-100 bg-slate-50">
            {course.thumbnail && <img src={course.thumbnail} alt="" className="h-full w-full object-cover" />}
          </div>
          <div className="min-w-0">
            <div className="truncate text-[15px] font-bold">{course.title}</div>
            <div className="text-[12px] font-normal text-slate-400">{[course.category, course.difficulty].filter(Boolean).join(" · ")}</div>
          </div>
        </div>
      }
      styles={{ body: { background: "#f8fafc", display: "flex", flexDirection: "column", gap: 12 } }}
      footer={
        <div className="flex items-center justify-between gap-3">
          <div className="text-[13px] text-slate-500">
            Students pay{" "}
            <b className="text-[16px] text-slate-900">{form.access === "free" ? "Free" : formatPrice(check.pays)}</b>
            {form.access !== "free" && check.off > 0 && (
              <>
                {" "}
                <span className="text-slate-400 line-through">{formatPrice(check.strike)}</span>{" "}
                <span className="font-semibold text-emerald-600">{check.off}% off</span>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" loading={saving} disabled={hasErrors} onClick={save}>
              Save
            </Button>
          </div>
        </div>
      }
    >
      <Section title="Who can learn it">
        <div className="grid grid-cols-3 gap-2">
          {ACCESS_CARDS.map((card) => {
            const active = form.access === card.value;
            return (
              <button
                key={card.value}
                type="button"
                onClick={() => set({ access: card.value })}
                className={`flex cursor-pointer flex-col items-start gap-1 rounded-lg border p-2.5 text-left transition-colors ${
                  active ? "border-blue-600 bg-blue-50" : "border-slate-200 bg-white hover:border-blue-300"
                }`}
              >
                <span className={`text-[15px] ${active ? "text-blue-600" : "text-slate-400"}`}>{card.icon}</span>
                <span className="text-[13px] font-bold text-slate-800">{card.title}</span>
                <span className="text-[11px] leading-snug text-slate-500">{card.text}</span>
              </button>
            );
          })}
        </div>
        {form.access === "bundle" && !course.bundles?.some((b) => b.status === "published") && (
          <div className="mt-2 rounded-md bg-amber-50 px-2.5 py-1.5 text-[12px] text-amber-700">
            This course isn&apos;t in a published bundle yet — add it to one in the Bundles tab, or students can&apos;t get it.
          </div>
        )}
      </Section>

      <Section
        title="Price"
        hint={
          form.access === "free"
            ? "Not charged while the course is Free. Kept for when you make it paid again."
            : form.access === "bundle"
              ? "Shown as the course's value inside bundles."
              : "What students pay before any coupon."
        }
      >
        <div className="mb-2 flex flex-wrap gap-1.5">
          {PRICE_PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => set({ price: p })}
              className={`cursor-pointer rounded-full border px-3 py-1 text-[12px] font-semibold transition-colors ${
                Number(form.price) === p
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
              }`}
            >
              ₹{p}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="mb-1 text-[12px] font-semibold text-slate-600">Price</div>
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              precision={0}
              prefix="₹"
              value={form.price}
              onChange={(price) => set({ price })}
              status={check.errors.price ? "error" : ""}
            />
            {check.errors.price && <div className="mt-1 text-[11px] text-red-500">{check.errors.price}</div>}
          </div>
          <div>
            <div className="mb-1 text-[12px] font-semibold text-slate-600">Original price (struck through)</div>
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              precision={0}
              prefix="₹"
              value={form.mrp}
              onChange={(mrp) => set({ mrp })}
              status={check.errors.mrp ? "error" : ""}
            />
            {check.errors.mrp && <div className="mt-1 text-[11px] text-red-500">{check.errors.mrp}</div>}
          </div>
        </div>
      </Section>

      <Section title="Coupon" hint="Optional. Taken off the price at checkout. Set the discount to 0 to remove it.">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="mb-1 text-[12px] font-semibold text-slate-600">Code</div>
            <Input
              value={form.couponCode}
              onChange={(e) => set({ couponCode: e.target.value.toUpperCase() })}
              placeholder="e.g. SAVE100"
              maxLength={30}
              status={check.errors.coupon ? "error" : ""}
            />
          </div>
          <div>
            <div className="mb-1 text-[12px] font-semibold text-slate-600">Discount</div>
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              precision={0}
              prefix="₹"
              value={form.couponDiscount}
              onChange={(couponDiscount) => set({ couponDiscount })}
              status={check.errors.coupon ? "error" : ""}
            />
          </div>
        </div>
        {check.errors.coupon && <div className="mt-1 text-[11px] text-red-500">{check.errors.coupon}</div>}
      </Section>

      <Section title="In the student Course Library">
        <div className="flex flex-col gap-3">
          <label className="flex cursor-pointer items-center justify-between gap-3">
            <span>
              <div className="text-[13px] font-semibold text-slate-700">Visible to students</div>
              <div className="text-[12px] text-slate-400">Hidden courses are left out. Students who own them keep access.</div>
            </span>
            <Switch
              checked={form.visibility === "published"}
              onChange={(on) => set({ visibility: on ? "published" : "hidden" })}
            />
          </label>
          <label className="flex cursor-pointer items-center justify-between gap-3">
            <span>
              <div className="text-[13px] font-semibold text-slate-700">Featured</div>
              <div className="text-[12px] text-slate-400">Shows a ★ Featured tag and lists the course first.</div>
            </span>
            <Switch checked={form.featured} onChange={(featured) => set({ featured })} />
          </label>
          <div className="flex items-center justify-between gap-3">
            <span>
              <div className="text-[13px] font-semibold text-slate-700">Position</div>
              <div className="text-[12px] text-slate-400">Lower numbers show first (after featured courses).</div>
            </span>
            <InputNumber min={0} precision={0} value={form.order} onChange={(order) => set({ order })} style={{ width: 90 }} />
          </div>
        </div>
      </Section>

      {course.bundles?.length > 0 && (
        <Section title="Included in bundles">
          <div className="flex flex-wrap gap-1.5">
            {course.bundles.map((b) => (
              <Tag key={b._id} color={b.status === "published" ? "purple" : "default"}>
                {b.title}
                {b.status !== "published" ? " (draft)" : ""}
              </Tag>
            ))}
          </div>
        </Section>
      )}
    </Drawer>
  );
}
