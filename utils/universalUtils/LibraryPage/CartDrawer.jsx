"use client";
import React, { useState } from "react";
import { Drawer, Empty, Spin, message } from "antd";
import { useDispatch } from "react-redux";
import axios from "axios";
import { removeFromCart } from "@/redux/slices/cartSlice";
import { formatINR } from "./helpers";
import { FiTrash2, FiShoppingCart, FiX } from "react-icons/fi";

/**
 * Order / Checkout API (inlined)
 *
 * Backend routes expected:
 *  POST /orders/create-order
 *    body:  { courseIds: string[] }
 *    returns: { orderId, amount, currency, keyId }  (Razorpay order details)
 *
 *  POST /orders/verify
 *    body:  { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseIds }
 *    returns: { success: boolean, enrolledCourses: [...] }
 */
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const createOrderApi = (payload) => axiosInstance.post("/orders/create-order", payload);
const verifyPaymentApi = (payload) => axiosInstance.post("/orders/verify", payload);

/**
 * CartDrawer
 *
 * Props:
 *  - open          {boolean}
 *  - onClose       {fn}
 *  - cartItems     {array}   items from cart slice: [{ _id, courseId, price, discountedPrice }]
 *  - totalAmount   {number}
 *  - loading       {boolean} cart loading state (initial fetch)
 *  - nav           {object}  router (from useAppRouter) — used to redirect after checkout
 */
const CartDrawer = ({ open, onClose, cartItems = [], totalAmount = 0, loading = false, nav }) => {
  const dispatch = useDispatch();
  const [removingId, setRemovingId] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);

  const handleRemove = async (courseId) => {
    setRemovingId(courseId);
    try {
      await dispatch(removeFromCart(courseId)).unwrap();
    } catch (err) {
      message.error(err || "Failed to remove item");
    } finally {
      setRemovingId(null);
    }
  };

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (typeof window !== "undefined" && window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleCheckout = async () => {
    if (!cartItems.length) return;

    setCheckingOut(true);
    try {
      const courseIds = cartItems.map((i) => i.courseId?._id || i.courseId);

      // STEP 1: Create order on backend
      const { data: order } = await createOrderApi({ courseIds });

      // FREE-only cart: backend may skip Razorpay and directly enroll
      if (!order?.orderId) {
        message.success("Enrollment successful!");
        onClose();
        nav?.push("/my-learning");
        return;
      }

      // STEP 2: Load Razorpay checkout script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        message.error("Unable to load payment gateway. Please try again.");
        return;
      }

      // STEP 3: Open Razorpay checkout
      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: "SkillMedha",
        description: "Course Purchase",
        theme: { color: "#1E69DA" },
        handler: async (response) => {
          try {
            await verifyPaymentApi({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              courseIds,
            });
            message.success("Payment successful! You're enrolled.");
            onClose();
            nav?.push("/my-learning");
          } catch (err) {
            message.error(err?.message || "Payment verification failed");
          }
        },
        modal: {
          ondismiss: () => {
            message.info("Payment cancelled");
          },
        },
      });

      rzp.open();
    } catch (err) {
      message.error(err?.message || "Failed to start checkout");
    } finally {
      setCheckingOut(false);
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
      closeIcon={<div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"><FiX className="text-lg text-slate-600" /></div>}
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <FiShoppingCart className="text-xl" />
          </div>
          <span className="text-xl font-bold text-slate-800">Your Cart</span>
          <span className="bg-slate-100 text-slate-600 text-[13px] font-bold px-2.5 py-0.5 rounded-full ml-auto">
            {cartItems.length} {cartItems.length === 1 ? "Item" : "Items"}
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
      ) : !cartItems.length ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-80 mt-[-50px]">
          <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mb-4">
            <FiShoppingCart className="text-4xl text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">Your cart is empty</h3>
          <p className="text-slate-500 text-[14px]">Looks like you haven't added any courses yet.</p>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto pr-1 pb-4">
            {cartItems.map((item) => {
              const course = item.courseId || {};
              const price = item.discountedPrice ?? item.price ?? course.discountedPrice ?? course.price ?? 0;
              const courseId = course._id || item._id;

              return (
                <div
                  key={item._id || courseId}
                  className="group flex items-center gap-4 p-4 mb-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-300"
                >
                  {/* Thumbnail */}
                  <div className="relative w-24 h-16 flex-shrink-0 rounded-xl overflow-hidden shadow-sm border border-slate-100">
                    <img
                      src={course.coverImage}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4
                      className="text-[14px] font-[700] text-slate-800 truncate mb-1"
                      title={course.title}
                    >
                      {course.title}
                    </h4>
                    <div className="text-[15px] font-[800] text-[#1E69DA]">
                      {formatINR(price)}
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(courseId)}
                    disabled={removingId === courseId}
                    className="w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0 disabled:opacity-50"
                  >
                    {removingId === courseId ? (
                      <Spin size="small" />
                    ) : (
                      <FiTrash2 className="text-[18px]" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Checkout Footer */}
          <div className="mt-4 bg-[#EFF5FB]/60 p-5 rounded-[20px] border border-blue-50/50 relative overflow-hidden">
            {/* Decorative background blob */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-100/50 rounded-full blur-2xl z-0"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-600 font-medium text-[15px]">Subtotal</span>
                <span className="text-slate-900 font-[800] text-[22px]">
                  {formatINR(totalAmount)}
                </span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="w-full flex items-center justify-center gap-2 bg-[#1E69DA] hover:bg-[#1556B8] text-white py-3.5 rounded-xl font-[600] text-[15px] transition-all shadow-[0_8px_20px_rgba(30,105,218,0.25)] hover:shadow-[0_8px_25px_rgba(30,105,218,0.35)] hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {checkingOut ? (
                  <Spin size="small" className="text-white" />
                ) : (
                  "Proceed To Checkout"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
};

export default CartDrawer;
