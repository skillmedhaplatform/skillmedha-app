"use client";

import React from "react";
import { Drawer, Spin, Tooltip, message } from "antd";
import { useDispatch } from "react-redux";
import { removeFromWishlist, addToWishlist } from "@/redux/slices/wishlistSlice";
import { addToCart } from "@/redux/slices/cartSlice";
import { FiHeart, FiShoppingCart, FiTrash2, FiX, FiCheckCircle } from "react-icons/fi";

/**
 * Props:
 *  open          {boolean}
 *  onClose       {fn}
 *  items         {array}   — wishlist items from Redux state
 *  loading       {boolean}
 *  cartIds       {Set}     — Set of courseId strings already in cart
 */
const WishlistDrawer = ({ open, onClose, items = [], loading, cartIds = new Set(), enrolledIds = new Set() }) => {
  const dispatch = useDispatch();

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
      placement="right"
      styles={{
        wrapper: { width: 440 },
        body: { padding: "24px 24px", display: "flex", flexDirection: "column" },
        header: { borderBottom: "none", padding: "24px 24px 8px" },
      }}
      closeIcon={
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors">
          <FiX className="text-lg text-slate-600" />
        </div>
      }
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
            <FiHeart className="text-xl fill-current" />
          </div>
          <span className="text-xl font-bold text-slate-800">Your Wishlist</span>
          <span className="bg-slate-100 text-slate-600 text-[13px] font-bold px-2.5 py-0.5 rounded-full ml-auto">
            {items.length} {items.length === 1 ? "Item" : "Items"}
          </span>
        </div>
      }
      open={open}
      onClose={onClose}
    >
      {loading ? (
        <div className="flex-1 flex justify-center items-center">
          <Spin size="large" />
        </div>
      ) : !items.length ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-80 mt-[-50px]">
          <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mb-4">
            <FiHeart className="text-4xl text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">Your wishlist is empty</h3>
          <p className="text-slate-500 text-[14px]">Save courses you want to learn later here.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-1 pb-4">
          {items.map((item) => {
            // courseId is a populated object from the backend
            const course = item?.courseId;
            const courseId = course?._id;
            const title = course?.title || "Untitled";
            const coverImage = course?.coverImage || "";
            const category = course?.category || "";
            // Parse price safely
            const price = Number(course?.price ?? 0);
            const discountedPrice = Number(course?.discountedPrice ?? price);
            const hasDiscount = discountedPrice > 0 && discountedPrice < price;
            const inCart = cartIds.has(courseId);
            const isEnrolled = enrolledIds?.has(courseId);

            return (
              <div
                key={item?._id}
                className="group flex flex-col gap-3 p-4 mb-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-red-200 hover:bg-red-50/30 transition-all duration-300"
              >
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="relative w-24 h-16 flex-shrink-0 rounded-xl overflow-hidden shadow-sm border border-slate-100">
                    {coverImage ? (
                      <img
                        src={coverImage}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300 text-2xl">
                        📚
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Tooltip title={title} placement="topLeft">
                      <div className="text-[14px] font-[700] text-slate-800 leading-tight mb-1 line-clamp-2">
                        {title}
                      </div>
                    </Tooltip>

                    {category && (
                      <div className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-500 text-[11px] font-medium rounded-md">
                        {category}
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center gap-2 mt-2">
                      {discountedPrice > 0 ? (
                        <>
                          <span className="text-[15px] font-[800] text-[#1E69DA]">
                            ₹{discountedPrice.toLocaleString("en-IN")}
                          </span>
                          {hasDiscount && (
                            <span className="text-[12px] font-medium text-slate-400 line-through">
                              ₹{price.toLocaleString("en-IN")}
                            </span>
                          )}
                        </>
                      ) : price > 0 ? (
                        <span className="text-[15px] font-[800] text-[#1E69DA]">
                          ₹{price.toLocaleString("en-IN")}
                        </span>
                      ) : (
                        <span className="text-[14px] font-[800] text-emerald-500">FREE</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions Row */}
                <div className="flex items-center gap-2 mt-1">
                  {isEnrolled ? (
                    <div className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl text-[13px] font-bold">
                      <FiCheckCircle className="text-[15px]" />
                      Enrolled
                    </div>
                  ) : (
                    <button
                      onClick={() => handleMoveToCart(courseId)}
                      disabled={inCart}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-[13px] font-semibold transition-all ${
                        inCart
                          ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                          : "bg-[#1E69DA] text-white hover:bg-blue-700 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                      }`}
                    >
                      <FiShoppingCart className="text-[15px]" />
                      {inCart ? "In Cart" : "Move to Cart"}
                    </button>
                  )}
                  <button
                    onClick={() => handleRemove(courseId)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors shrink-0"
                    title="Remove from Wishlist"
                  >
                    <FiTrash2 className="text-[16px]" />
                  </button>
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