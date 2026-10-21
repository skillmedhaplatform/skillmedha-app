"use client";
import React, { useState } from "react";
import { Button, InputNumber } from "antd";

export const PRICE_PRESETS = [49, 99, 149, 199, 299];

// Pick a price with one click (presets) or type one; optional original price.
export default function PricePicker({ initialPrice = 99, onApply, applyLabel = "Apply", busy = false }) {
  const [price, setPrice] = useState(initialPrice);
  const [mrp, setMrp] = useState(null);
  const invalid = !price || price <= 0 || (mrp && mrp < price);

  return (
    <div className="flex w-[280px] flex-col gap-3">
      <div>
        <div className="mb-1.5 text-xs font-semibold text-slate-600">Price</div>
        <div className="flex flex-wrap gap-1.5">
          {PRICE_PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPrice(p)}
              className={`rounded-full border px-3 py-1 text-[12px] font-semibold transition-colors ${
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
        {mrp && mrp < price && <div className="mt-1 text-[11px] text-red-500">Must be at least the price</div>}
      </div>
      <Button type="primary" disabled={invalid} loading={busy} onClick={() => onApply({ price, mrp: mrp || price })}>
        {applyLabel}
      </Button>
    </div>
  );
}
