"use client";

import React from "react";
import { Drawer, Button, Empty, Spin, Tooltip } from "antd";
import { HeartOutlined, ShoppingCartOutlined, DeleteOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { removeFromWishlist, addToWishlist } from "@/redux/slices/wishlistSlice";
import { addToCart } from "@/redux/slices/cartSlice";
import { message } from "antd";

/**
 * Props:
 *  open          {boolean}
 *  onClose       {fn}
 *  items         {array}   — wishlist items from Redux state
 *  loading       {boolean}
 *  cartIds       {Set}     — Set of courseId strings already in cart
 */
const WishlistDrawer = ({ open, onClose, items = [], loading, cartIds = new Set() }) => {
  const dispatch = useDispatch();
console.log(items)
  const handleRemove = async (courseId) => {
    try {
      await dispatch(removeFromWishlist(courseId)).unwrap();
      message.success("Removed from wishlist");
    } catch (err) {
      message.error(err || "Failed to remove");
    }
  };

  const handleMoveToCart = async (courseId) => {
    try {
      if (cartIds.has(courseId)) {
        message.info("Already in cart");
        return;
      }
      await dispatch(addToCart(courseId)).unwrap();
      await dispatch(removeFromWishlist(courseId)).unwrap();
      message.success("Moved to cart");
    } catch (err) {
      message.error(err || "Failed to move to cart");
    }
  };

  return (
    <Drawer
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <HeartOutlined style={{ color: "#dc2626" }} />
          <span style={{ fontWeight: 700 }}>Wishlist</span>
          <span style={{ fontSize: 13, color: "#888", fontWeight: 400 }}>
            ({items.length} {items.length === 1 ? "item" : "items"})
          </span>
        </div>
      }
      placement="right"
      onClose={onClose}
      open={open}
      width={420}
      styles={{ body: { padding: 0, display: "flex", flexDirection: "column" } }}
    >
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300 }}>
          <Spin size="large" />
        </div>
      ) : !items.length ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, gap: 12 }}>
          <Empty
            image={<HeartOutlined style={{ fontSize: 48, color: "#d1d5db" }} />}
            imageStyle={{ height: 60 }}
            description={<span style={{ color: "#9ca3af", fontSize: 14 }}>Your wishlist is empty</span>}
          />
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((item) => {
            // courseId is a populated object from the backend
            const course = item?.courseId;
            const courseId = course?._id;
            const title = course?.title || "Untitled";
            const coverImage = course?.coverImage || "";
            const category = course?.category || "";
            // Parse price safely — backend may return string or number
            const price = Number(course?.price ?? 0);
            const discountedPrice = Number(course?.discountedPrice ?? price);
            const hasDiscount = discountedPrice > 0 && discountedPrice < price;
            const inCart = cartIds.has(courseId);

            return (
              <div
                key={item?._id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "88px 1fr",
                  gap: 12,
                  padding: 12,
                  border: "1px solid #f0f0f0",
                  borderRadius: 12,
                  background: "#fff",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                }}
              >
                {/* Thumbnail */}
                <div
                  style={{
                    width: 88,
                    height: 68,
                    borderRadius: 8,
                    overflow: "hidden",
                    background: "#f5f5f5",
                    flexShrink: 0,
                  }}
                >
                  {coverImage ? (
                    <img
                      src={coverImage}
                      alt={title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#d1d5db",
                        fontSize: 20,
                      }}
                    >
                      📚
                    </div>
                  )}
                </div>

                {/* Info */}
                <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                  <Tooltip title={title} placement="topLeft">
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 13,
                        lineHeight: 1.3,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        color: "#111",
                      }}
                    >
                      {title}
                    </div>
                  </Tooltip>

                  {category && (
                    <span style={{ fontSize: 11, color: "#6b7280", background: "#f3f4f6", borderRadius: 4, padding: "1px 6px", width: "fit-content" }}>
                      {category}
                    </span>
                  )}

                  {/* Price */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                    {discountedPrice > 0 ? (
                      <>
                        <span style={{ fontWeight: 700, fontSize: 14, color: "#16a34a" }}>
                          ₹{discountedPrice.toLocaleString("en-IN")}
                        </span>
                        {hasDiscount && (
                          <span style={{ fontSize: 12, color: "#9ca3af", textDecoration: "line-through" }}>
                            ₹{price.toLocaleString("en-IN")}
                          </span>
                        )}
                      </>
                    ) : price > 0 ? (
                      <span style={{ fontWeight: 700, fontSize: 14, color: "#16a34a" }}>
                        ₹{price.toLocaleString("en-IN")}
                      </span>
                    ) : (
                      <span style={{ fontWeight: 700, fontSize: 13, color: "#16a34a" }}>FREE</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                    <Button
                      size="small"
                      type={inCart ? "default" : "primary"}
                      icon={<ShoppingCartOutlined />}
                      onClick={() => handleMoveToCart(courseId)}
                      style={{ fontSize: 12, flex: 1 }}
                      disabled={inCart}
                    >
                      {inCart ? "In Cart" : "Move to Cart"}
                    </Button>
                    <Button
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemove(courseId)}
                      style={{ fontSize: 12 }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Drawer>
  );
};

export default WishlistDrawer;