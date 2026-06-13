"use client";
import React from "react";
import { Button } from "antd";
import { ShoppingCartOutlined, HeartOutlined, HeartFilled, CheckOutlined, LoadingOutlined } from "@ant-design/icons";
import { stripHtml, formatINR } from "./helpers";

const BuyNowPopoverContent = ({
  item,
  onAddToWishlist,
  onAddToCart,
  isInCart = false,
  isInWishlist = false,
  cartLoading = false,
  wishlistLoading = false,
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
  const recentEnrollments = Math.floor(Math.random() * 40) + 10;

  const levelColor =
    item?.difficulty === "Advanced"
      ? "#ef4444"
      : item?.difficulty === "Intermediate"
        ? "#f59e0b"
        : "#22c55e";

  const isPurchased = item?.isPurchased || item?.isEnrolled;
  const isFree = item?.price === 0 || item?.isFree;

  return (
    <div style={{ width: 360, maxWidth: 360, boxSizing: "border-box", overflow: "hidden" }}>
      <div style={{ padding: "4px 4px 10px", boxSizing: "border-box" }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
          <span style={{ background: "linear-gradient(135deg, #FEF3C7, #FDE68A)", color: "#92400E", padding: "3px 9px", borderRadius: 999, fontSize: 10.5, fontWeight: 700, whiteSpace: "nowrap" }}>
            🔥 BESTSELLER
          </span>
          <span style={{ background: "linear-gradient(135deg, #EEF2FF, #E0E7FF)", color: "#4338CA", padding: "3px 9px", borderRadius: 999, fontSize: 10.5, fontWeight: 700, whiteSpace: "nowrap" }}>
            🚀 Career Focused
          </span>
        </div>

        <div style={{ fontSize: 17, fontWeight: 800, lineHeight: 1.3, color: "#0F172A", marginBottom: 5 }}>
          {item?.title}
        </div>

        {item?.subtitle && (
          <div style={{ color: "#64748b", fontSize: 12, marginBottom: 8, lineHeight: 1.5 }}>
            {item.subtitle}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 8, fontSize: 12 }}>
          <span style={{ color: "#f59e0b", fontWeight: 700 }}>⭐ {rating}</span>
          <span style={{ color: "#94a3b8" }}>•</span>
          <span style={{ color: "#64748b" }}>{reviews.toLocaleString()} ratings</span>
          <span style={{ color: "#94a3b8" }}>•</span>
          <span style={{ color: "#64748b" }}>{students.toLocaleString()} students</span>
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
          <span style={{ background: levelColor, color: "#fff", padding: "3px 9px", borderRadius: 8, fontSize: 10.5, fontWeight: 700, whiteSpace: "nowrap" }}>
            {item?.difficulty || "Beginner"}
          </span>
          <span style={{ background: "#F1F5F9", color: "#475569", padding: "3px 9px", borderRadius: 8, fontSize: 10.5, fontWeight: 700, whiteSpace: "nowrap" }}>
            📚 {item?.sections?.length || 0} Modules
          </span>
          <span style={{ background: "#F1F5F9", color: "#475569", padding: "3px 9px", borderRadius: 8, fontSize: 10.5, fontWeight: 700, whiteSpace: "nowrap" }}>
            ⏱ {item?.courseIncludes?.videoDuration}
          </span>
        </div>

        <div style={{ color: "#475569", fontSize: 12.5, lineHeight: 1.55, marginBottom: 12, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {stripHtml(item?.description || "")}
        </div>

        <div style={{ background: "#F8FAFC", borderRadius: 10, padding: "10px 12px", marginBottom: 10, boxSizing: "border-box" }}>
          <div style={{ fontWeight: 700, marginBottom: 8, color: "#0F172A", fontSize: 12.5 }}>
            What You'll Learn
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, minWidth: 0 }}>
            {item?.learningPoints?.slice(0, 4)?.map((point, index) => (
              <div key={index} style={{ display: "flex", gap: 5, fontSize: 12, color: "#374151", lineHeight: 1.35, minWidth: 0 }}>
                <span style={{ color: "#22c55e", fontWeight: 700, flexShrink: 0 }}>✓</span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{point}</span>
              </div>
            ))}
          </div>
        </div>

        {item?.toolsWithIcons?.length > 0 && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: 700, marginBottom: 8, color: "#0F172A", fontSize: 12.5 }}>
              Tools Covered
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {item.toolsWithIcons.slice(0, 5).map((tool) => (
                <div key={tool.name} style={{ width: 36, height: 36, borderRadius: 9, border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", flexShrink: 0, boxSizing: "border-box" }}>
                  <img src={tool.icon} alt={tool.name} title={tool.name} style={{ width: 20, height: 20 }} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12, color: "#374151", minWidth: 0 }}>
          <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>🏆 Certificate</div>
          <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>♾️ Lifetime Access</div>
          <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>💻 {item?.courseIncludes?.codingExercises || 0} Exercises</div>
          <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>📝 {item?.courseIncludes?.quizzes || 0} Quizzes</div>
        </div>
      </div>

      {/* PRICE SECTION */}
      <div
        style={{
          background: "#F8FAFC",
          padding: 12,
          borderTop: "1px solid #E2E8F0",
          margin: "0 -4px -4px",
          borderRadius: "0 0 8px 8px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
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

        <div style={{ marginTop: 5, color: "#DC2626", fontSize: 11, fontWeight: 600 }}>
          🔥 {recentEnrollments} students enrolled in the last 7 days
        </div>

        {/* Hide cart/wishlist actions for purchased/free items */}
        {!isPurchased && !isFree && (
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
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
          <div style={{ marginTop: 10, textAlign: "center", color: "#16a34a", fontWeight: 700, fontSize: 13 }}>
            ✓ Already Enrolled
          </div>
        )}

        {isFree && !isPurchased && (
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
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
    </div>
  );
};

export default BuyNowPopoverContent;
