"use client";
import React, { useState } from "react";
import { Drawer, Card, Divider, Button, Empty, Spin, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import axios from "axios";
import { removeFromCart } from "@/redux/slices/cartSlice";
import { formatINR } from "./helpers";

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
        theme: { color: "#1a56db" },
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
    <Drawer title="Cart" placement="right" width={420} open={open} onClose={onClose}>
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
          <Spin />
        </div>
      ) : !cartItems.length ? (
        <Empty description="Your cart is empty" style={{ marginTop: 60 }} />
      ) : (
        <>
          {cartItems.map((item) => {
            const course = item.courseId || {};
            const price = item.discountedPrice ?? item.price ?? course.discountedPrice ?? course.price ?? 0;
            const courseId = course._id || item._id;

            return (
              <Card key={item._id || courseId} style={{ marginBottom: 12 }} bodyStyle={{ padding: 12 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <img
                    src={course.coverImage}
                    alt={course.title}
                    style={{ width: 80, height: 56, objectFit: "cover", borderRadius: 6, flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {course.title}
                    </div>
                    <div style={{ fontSize: 13, color: "#1a56db", fontWeight: 700, marginTop: 4 }}>
                      {formatINR(price)}
                    </div>
                  </div>
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    loading={removingId === courseId}
                    onClick={() => handleRemove(courseId)}
                  />
                </div>
              </Card>
            );
          })}

          <Divider />

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
            <span>Total</span>
            <span>{formatINR(totalAmount)}</span>
          </div>

          <Button
            type="primary"
            block
            size="large"
            loading={checkingOut}
            onClick={handleCheckout}
          >
            Proceed To Checkout
          </Button>
        </>
      )}
    </Drawer>
  );
};

export default CartDrawer;
