"use client";
import React from "react";
import { formatINR } from "./helpers";

const PriceChip = ({ item }) => {
  const isPurchased = item?.isPurchased || item?.isEnrolled;
  const isFree = item?.price === 0 || item?.isFree;

  if (isPurchased) {
    return (
      <span style={{ fontSize: 11, color: "#15803d", background: "#dcfce7", border: "1px solid #bbf7d0", padding: "3px 8px", borderRadius: 999, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
        ✓ Enrolled
      </span>
    );
  }

  if (isFree) {
    return (
      <span style={{ fontSize: 11, color: "#166534", background: "#dcfce7", border: "1px solid #86efac", padding: "3px 8px", borderRadius: 999, fontWeight: 700 }}>
        FREE
      </span>
    );
  }

  const originalPrice = item?.originalPrice || item?.price;
  const discountedPrice = item?.discountedPrice || item?.salePrice;

  if (!originalPrice && originalPrice !== 0) return null;

  const hasDiscount = discountedPrice && discountedPrice < originalPrice;
  const discountPct = hasDiscount
    ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
    : 0;

  return (
    <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
      {hasDiscount && (
        <span style={{ fontSize: 11, color: "#6b7280", textDecoration: "line-through" }}>
          {formatINR(originalPrice)}
        </span>
      )}
      <span style={{ fontSize: 12, color: "#1a56db", fontWeight: 700 }}>
        {formatINR(discountedPrice || originalPrice)}
      </span>
      {hasDiscount && discountPct > 0 && (
        <span style={{ fontSize: 10, color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca", padding: "1px 5px", borderRadius: 999, fontWeight: 600 }}>
          {discountPct}% off
        </span>
      )}
    </span>
  );
};

export default PriceChip;