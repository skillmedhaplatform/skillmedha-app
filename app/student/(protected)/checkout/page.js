"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";
import { Button, Spin, message } from "antd";
import {
  LockOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  MobileOutlined,
  CustomerServiceOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { BsX, BsPlus, BsStar, BsCodeSlash, BsBarChartFill, BsCpuFill, BsBook } from "react-icons/bs";
import axios from "axios";
import { useAppRouter } from "@/helpers/useAppRouter";
import { restUrl, internShipUrl } from "@/config/urls";
import { getLstorage } from "@/universalUtils/windowMW";
import { formatINR } from "@/universalUtils/LibraryPage/helpers";

const selectStudentCreds = (state) => state.student.student?.data;

// Same gradient/icon fallback set used on the course cards in LibraryPage —
// courses without a cover image get a themed placeholder instead of an
// empty gray box, keyed off the title so it's stable across reloads.
const FALLBACK_THEMES = [
  { bg: "linear-gradient(135deg, #0e1e3e, #1a3673)", icon: <BsCodeSlash size={28} color="white" /> },
  { bg: "linear-gradient(135deg, #2a0a4a, #4a158a)", icon: <BsBarChartFill size={28} color="white" /> },
  { bg: "linear-gradient(135deg, #0a3a2a, #156a4a)", icon: <BsCpuFill size={28} color="white" /> },
  { bg: "linear-gradient(135deg, #4a2a0a, #8a4a15)", icon: <BsBook size={28} color="white" /> },
];
const getFallbackTheme = (title = "") => {
  const hash = Array.from(title || "").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return FALLBACK_THEMES[hash % FALLBACK_THEMES.length];
};

// A dedicated page rather than a modal: gives the student a clear order
// summary and a single, unambiguous "pay" moment, separate from whatever
// else they were doing on the library page. Bypasses the cart entirely —
// this is a checkout for exactly the one course they clicked Buy Now on.

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

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${getLstorage("token")}` },
});

export default function CheckoutPage() {
  const nav = useAppRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const orgId = searchParams.get("orgId");
  const studentCreds = useSelector(selectStudentCreds);

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!courseId) {
      setLoadError("No course selected.");
      setLoading(false);
      return;
    }
    if (!studentCreds?._id) return;

    let cancelled = false;
    setLoading(true);
    setLoadError("");

    axios
      .get(
        `${internShipUrl}/getOneInternshipAuth/${courseId}?userId=${studentCreds._id}`,
        authHeaders()
      )
      .then(({ data }) => {
        if (cancelled) return;
        const details = data?.data || data;
        if (!details?._id) {
          setLoadError("Course not found.");
          return;
        }
        setCourse(details);
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(
          err?.response?.data?.error ||
            err?.response?.data?.message ||
            "Failed to load course details."
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [courseId, studentCreds?._id]);

  const originalPrice = Number(course?.pricing?.originalPrice) || Number(course?.price) || 0;
  const finalPrice =
    Number(course?.pricing?.finalPrice) || Number(course?.pricing?.currentPrice) || originalPrice;
  const discount =
    originalPrice > finalPrice
      ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
      : 0;

  const handlePay = async () => {
    if (!course?._id || paying) return;
    setPaying(true);

    try {
      const { data: order } = await axios.post(
        `${restUrl}/payment/buyNow/createOrder`,
        { courseId: course._id },
        authHeaders()
      );

      // Free course — backend enrolls directly, no Razorpay needed.
      if (order?.enrolled) {
        message.success("Enrollment successful!");
        nav.push("/my-learning");
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        message.error("Unable to load payment gateway. Please try again.");
        setPaying(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: "SkillMedha",
        description: order.courseName || course.title,
        theme: { color: "#1E69DA" },
        handler: async (response) => {
          try {
            await axios.post(
              `${restUrl}/payment/buyNow/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              authHeaders()
            );
            message.success("Payment successful! You're enrolled.");
            nav.push("/my-learning");
          } catch (err) {
            message.error(
              err?.response?.data?.error || "Payment verification failed. Please contact support."
            );
          } finally {
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => {
            message.info("Payment cancelled");
            setPaying(false);
          },
        },
      });

      rzp.on("payment.failed", () => {
        message.error("Payment failed. Please try again.");
        setPaying(false);
      });

      rzp.open();
    } catch (err) {
      message.error(
        err?.response?.data?.error || "Failed to start checkout. Please try again."
      );
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full min-h-[70vh] flex items-center justify-center bg-[#EFF5FB]">
        <Spin size="large" />
      </div>
    );
  }

  if (loadError || !course) {
    return (
      <div className="w-full h-full min-h-[70vh] flex flex-col items-center justify-center gap-3 text-center px-6 bg-[#EFF5FB]">
        <p className="text-slate-600 text-[15px]">{loadError || "Course not found."}</p>
        <Button onClick={() => { window.location.href = "/student/course"; }}>Back to Courses</Button>
      </div>
    );
  }

  const perks = [
    { icon: <ClockCircleOutlined />, label: "Lifetime access" },
    { icon: <MobileOutlined />, label: "Learn on any device" },
    { icon: <SafetyCertificateOutlined />, label: "Certificate on completion" },
    { icon: <CustomerServiceOutlined />, label: "Dedicated support" },
  ];

  return (
    <section className="w-full h-full flex flex-col items-stretch bg-[#EFF5FB]">
      {/* Banner — same gradient + decorative-icon language used elsewhere in the app */}
      <div className="w-full h-[140px] min-h-[140px] flex flex-col justify-center items-start gap-2 p-4 lg:px-8 shadow-sm rounded-2xl lg:rounded-none bg-gradient-to-br from-[#071631] to-[#10254c] text-white shrink-0 relative overflow-hidden z-[2]">
        <div className="absolute inset-0 pointer-events-none z-[1]">
          <BsX className="absolute top-[20%] right-[10%] text-[#1E69DA] opacity-60 text-[1.2rem]" />
          <BsPlus className="absolute bottom-[20%] right-[30%] text-[#1E69DA] opacity-50 text-[1.5rem]" />
          <BsStar className="absolute top-[40%] right-[50%] text-[#1E69DA] opacity-50 text-[1.1rem]" />
          <BsX className="absolute bottom-[30%] right-[5%] text-[#1E69DA] opacity-60 text-[1.3rem]" />
        </div>

        <button
          onClick={() => { window.location.href = "/student/course"; }}
          className="absolute top-4 left-4 lg:left-8 flex items-center gap-1.5 text-white/80 hover:text-white text-[13px] font-medium transition-colors z-10"
        >
          <ArrowLeftOutlined /> Back to Courses
        </button>

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-[56px] h-[56px] bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10 shrink-0">
            <LockOutlined className="text-white text-2xl" />
          </div>
          <div className="flex flex-col justify-center gap-1">
            <h1 className="text-[28px] lg:text-[34px] font-bold text-white m-0 tracking-tight leading-none">
              Secure Checkout
            </h1>
            <p className="text-white/90 text-[13px] lg:text-[14px] m-0 leading-tight">
              You're one step away from starting this course.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full p-4 lg:p-8 flex flex-col items-center">
        {/* Step indicator — same pattern real checkout flows (Stripe, Udemy,
            Amazon) use to orient the buyer in a short, linear process */}
        <div className="w-full max-w-[900px] flex items-center gap-3 mb-6 px-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#1E69DA] text-white text-[13px] font-bold flex items-center justify-center">
              1
            </div>
            <span className="text-slate-800 text-[13.5px] font-semibold">Review Order</span>
          </div>
          <div className="flex-1 h-[2px] bg-slate-200 max-w-[80px]" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#1E69DA] text-white text-[13px] font-bold flex items-center justify-center">
              2
            </div>
            <span className="text-slate-800 text-[13.5px] font-semibold">Payment</span>
          </div>
          <div className="flex-1 h-[2px] bg-slate-200 max-w-[80px]" />
          <div className="flex items-center gap-2 opacity-50">
            <div className="w-7 h-7 rounded-full bg-slate-300 text-white text-[13px] font-bold flex items-center justify-center">
              3
            </div>
            <span className="text-slate-500 text-[13.5px] font-semibold">Access Course</span>
          </div>
        </div>

        <div className="w-full max-w-[900px] grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
          {/* Left: course + what's included */}
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-md border border-[#e2e8f0] overflow-hidden">
              <div className="flex gap-4 p-6">
                <div className="w-32 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                  {course.coverImage ? (
                    <img
                      src={course.coverImage}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ background: getFallbackTheme(course.title).bg }}
                    >
                      {getFallbackTheme(course.title).icon}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-[17px] font-bold text-slate-800 mb-2 leading-snug line-clamp-2">
                    {course.title}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {course.difficulty && (
                      <span className="inline-block text-[11px] font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-[#1E69DA]">
                        {course.difficulty}
                      </span>
                    )}
                    {course.category && (
                      <span className="inline-block text-[11px] font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600">
                        {course.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-[#e2e8f0] p-6">
              <h3 className="text-[14px] font-bold text-slate-800 mb-4 uppercase tracking-wide">
                What you'll get
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {perks.map((perk) => (
                  <div key={perk.label} className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1E69DA] flex items-center justify-center text-[15px] shrink-0">
                      {perk.icon}
                    </div>
                    <span className="text-slate-600 text-[13.5px] font-medium">{perk.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: sticky price summary */}
          <div className="lg:sticky lg:top-6 bg-white rounded-2xl shadow-md border border-[#e2e8f0] overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-[15px] font-bold text-slate-800 mb-4">Order Summary</h3>

              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-600 text-[14px]">Course price</span>
                <span className="text-slate-800 font-semibold text-[14px]">
                  {formatINR(originalPrice)}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-600 text-[14px]">Discount ({discount}%)</span>
                  <span className="text-green-600 font-semibold text-[14px]">
                    -{formatINR(originalPrice - finalPrice)}
                  </span>
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <span className="text-slate-800 font-bold text-[16px]">Total Payable</span>
                <span className="text-[#1E69DA] font-extrabold text-[26px]">
                  {formatINR(finalPrice)}
                </span>
              </div>

              <Button
                onClick={handlePay}
                loading={paying}
                type="primary"
                size="large"
                icon={!paying ? <ThunderboltOutlined /> : undefined}
                className="!w-full !h-[52px] !rounded-xl !font-semibold !text-[15px] !bg-gradient-to-r !from-[#1E69DA] !to-[#5694F0] hover:!opacity-90 !border-none !shadow-[0_8px_20px_rgba(30,105,218,0.3)]"
              >
                {paying
                  ? "Processing..."
                  : finalPrice === 0
                    ? "Enroll for Free"
                    : `Pay ${formatINR(finalPrice)}`}
              </Button>

              <Button
                onClick={() => { window.location.href = "/student/course"; }}
                disabled={paying}
                block
                className="!mt-2.5 !h-[40px] !rounded-xl !font-medium !text-[13.5px] !border-none !text-slate-500 hover:!text-slate-700 !bg-transparent hover:!bg-slate-50 !shadow-none"
              >
                Cancel
              </Button>

              <div className="flex items-center justify-center gap-1.5 mt-3 text-slate-400 text-[12px]">
                <SafetyCertificateOutlined className="text-green-500" />
                100% secure payment powered by Razorpay
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
