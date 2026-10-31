"use client";
import React, { useState } from "react";
import { Button, InputNumber } from "antd";

const PRICE_PRESETS = [199, 299, 499, 799, 999, 1499];
const formatPrice = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

// Price editor for a course. Saves to the course itself (same fields as the
// course editor). A coupon set in the course editor still applies on top.
export default function CoursePricePicker({ initialPrice, initialMrp, couponCode, couponDiscount = 0, onApply, applyLabel = "Save price", busy = false }) {
  // Start from the course's current price; empty when it has none yet.
  const [price, setPrice] = useState(initialPrice > 0 ? initialPrice : null);
  const [mrp, setMrp] = useState(initialMrp > 0 ? initialMrp : null);
  const studentPays = Math.max(0, (Number(price) || 0) - (Number(couponDiscount) || 0));
  const couponTooBig = couponDiscount > 0 && price > 0 && couponDiscount >= price;
  const invalid = !price || price <= 0 || (mrp && mrp < price) || couponTooBig;

  return (
    <div className="flex w-[290px] flex-col gap-3">
      <div>
        <div className="mb-1.5 text-xs font-semibold text-slate-600">Price</div>
        <div className="flex flex-wrap gap-1.5">
          {PRICE_PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPrice(p)}
              className={`cursor-pointer rounded-full border px-3 py-1 text-[12px] font-semibold transition-colors ${
                price === p
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
              }`}
            >
              ₹{p}
            </button>
          ))}
        </div>
        <InputNumber
          className="!mt-2"
          style={{ width: "100%" }}
          min={1}
          precision={0}
          prefix="₹"
          value={price}
          onChange={setPrice}
          placeholder="Custom price"
        />
      </div>
      <div>
        <div className="mb-1.5 text-xs font-semibold text-slate-600">Original price (optional, shown struck through)</div>
        <InputNumber style={{ width: "100%" }} min={1} precision={0} prefix="₹" value={mrp} onChange={setMrp} />
        {mrp && mrp < price ? <div className="mt-1 text-[11px] text-red-500">Must be at least the price</div> : null}
      </div>
      {couponDiscount > 0 && (
        <div className={`rounded-md px-2.5 py-2 text-[12px] ${couponTooBig ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-600"}`}>
          {couponTooBig
            ? `Price must be more than the ${couponCode || "coupon"} discount (${formatPrice(couponDiscount)}).`
            : (
              <>
                Coupon {couponCode ? <b>{couponCode}</b> : null} takes off {formatPrice(couponDiscount)} — students pay{" "}
                <b>{formatPrice(studentPays)}</b>.
              </>
            )}
        </div>
      )}
      <Button type="primary" disabled={invalid} loading={busy} onClick={() => onApply({ price, mrp: mrp || price })}>
        {applyLabel}
      </Button>
    </div>
  );
}
