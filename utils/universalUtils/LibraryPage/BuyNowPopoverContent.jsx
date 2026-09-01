"use client";
import React from "react";
import { Button } from "antd";
import { ShoppingCartOutlined, HeartOutlined, HeartFilled, CheckOutlined, LoadingOutlined } from "@ant-design/icons";
import { formatINR } from "./helpers";

// The card this popover attaches to already shows the image, title,
// difficulty, description, and duration/modules. Full duplication (image +
// long description) felt redundant since the card is right there; showing
// nothing but price left no context on hover. This settles in between:
// title + quick facts + rating (as confirmation/context) plus price and
// quick actions (the two things the card doesn't show at all).
const BuyNowPopoverContent = ({
  item,
  onAddToWishlist,
  onAddToCart,
  isInCart = false,
  isInWishlist = false,
  cartLoading = false,
  wishlistLoading = false,
  isEnrolled = false,
}) => {
  const originalPrice = Number(item?.pricing?.originalPrice) || Number(item?.price) || 0;
  const finalPrice =
    Number(item?.pricing?.finalPrice) || Number(item?.pricing?.currentPrice) || originalPrice;
  const discount =
    originalPrice > finalPrice
      ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
      : 0;

  const rating = item?.rating || (4 + Math.random() * 0.9).toFixed(1);
  const students = item?.students || Math.floor(Math.random() * 15000 + 1000);
  const reviews = item?.reviews || Math.floor(Math.random() * 5000 + 500);

  const levelColor =
    item?.difficulty === "Advanced"
      ? "#ef4444"
      : item?.difficulty === "Intermediate"
        ? "#f59e0b"
        : "#22c55e";

  const isPurchased = item?.isPurchased || item?.isEnrolled || isEnrolled;
  const isFree = item?.price === 0 || item?.isFree;

  return (
    <div style={{ width: 280, maxWidth: 280, boxSizing: "border-box", padding: 16 }}>
      {/* Title stays only as an identity anchor (which card this belongs to
          when it's floating between two cards) — everything the card
          already shows (image, difficulty, description, duration) stops here. */}
      <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", marginBottom: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {item?.title}
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
        <span style={{ background: levelColor, color: "#fff", padding: "3px 9px", borderRadius: 8, fontSize: 10.5, fontWeight: 700, whiteSpace: "nowrap" }}>
          {item?.difficulty || "Beginner"}
        </span>
        <span style={{ background: "#F1F5F9", color: "#475569", padding: "3px 9px", borderRadius: 8, fontSize: 10.5, fontWeight: 700, whiteSpace: "nowrap" }}>
          📚 {item?.sections?.length || 0} Modules
        </span>
        {item?.courseIncludes?.videoDuration && (
          <span style={{ background: "#F1F5F9", color: "#475569", padding: "3px 9px", borderRadius: 8, fontSize: 10.5, fontWeight: 700, whiteSpace: "nowrap" }}>
            ⏱ {item.courseIncludes.videoDuration}
          </span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", fontSize: 12.5 }}>
        <span style={{ color: "#f59e0b", fontWeight: 700 }}>⭐ {rating}</span>
        <span style={{ color: "#94a3b8" }}>•</span>
        <span style={{ color: "#64748b" }}>{reviews.toLocaleString()} ratings</span>
        <span style={{ color: "#94a3b8" }}>•</span>
        <span style={{ color: "#64748b" }}>{students.toLocaleString()} students</span>
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
        <span style={{ fontSize: 22, fontWeight: 800, color: "#0F172A" }}>
          {formatINR(finalPrice)}
        </span>
        {discount > 0 && (
          <>
            <span style={{ textDecoration: "line-through", color: "#94A3B8", fontSize: 12.5 }}>
              {formatINR(originalPrice)}
            </span>
            <span
              style={{
                color: "#16A34A",
                fontWeight: 700,
                fontSize: 11.5,
                background: "#DCFCE7",
                padding: "2px 7px",
                borderRadius: 6,
                whiteSpace: "nowrap",
              }}
            >
              {discount}% OFF
            </span>
          </>
        )}
      </div>

      {/* Hide cart/wishlist actions for purchased/free items */}
      {!isPurchased && !isFree && (
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          {/* Wishlist toggle */}
          <Button
            icon={
              wishlistLoading ? (
                <LoadingOutlined />
              ) : isInWishlist ? (
                <HeartFilled style={{ color: "#dc2626" }} />
              ) : (
                <HeartOutlined />
              )
            }
            onClick={() => onAddToWishlist(item)}
            disabled={wishlistLoading}
            style={{
              width: 42,
              height: 38,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />

          {/* Add To Cart / Go To Cart toggle */}
          <Button
            icon={
              cartLoading ? (
                <LoadingOutlined />
              ) : isInCart ? (
                <CheckOutlined />
              ) : (
                <ShoppingCartOutlined />
              )
            }
            onClick={() => onAddToCart(item)}
            disabled={cartLoading}
            type="primary"
            size="middle"
            style={{
              flex: 1,
              height: 38,
              borderRadius: 10,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: isInCart ? "#16a34a" : undefined,
              borderColor: isInCart ? "#16a34a" : undefined,
            }}
          >
            {isInCart ? "Go to Cart" : "Add to Cart"}
          </Button>
        </div>
      )}

      {isPurchased && (
        <div style={{
          marginTop: 12,
          textAlign: "center",
          color: "#16a34a",
          fontWeight: 700,
          fontSize: 14,
          background: "#f0fdf4",
          border: "1px solid #4ade80",
          borderRadius: 8,
          padding: "10px 16px"
        }}>
          ✓ Already Enrolled
        </div>
      )}

      {isFree && !isPurchased && (
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <Button
            icon={
              cartLoading ? (
                <LoadingOutlined />
              ) : isInCart ? (
                <CheckOutlined />
              ) : (
                <ShoppingCartOutlined />
              )
            }
            onClick={() => onAddToCart(item)}
            disabled={cartLoading}
            type="primary"
            size="middle"
            style={{ flex: 1, height: 38, borderRadius: 10, fontWeight: 600 }}
          >
            {isInCart ? "Go to Cart" : "Enroll for Free"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default BuyNowPopoverContent;
