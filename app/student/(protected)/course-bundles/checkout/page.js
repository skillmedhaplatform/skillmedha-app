"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import { App, Button, Result, Spin } from "antd";
import { FiArrowLeft, FiCheck, FiLock, FiShield, FiLayers, FiBookOpen } from "react-icons/fi";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";
import { accessValidity, formatPrice } from "@/components/courseAccess/access";
import { createCourseBundleOrder, fetchCourseCatalog, verifyCourseBundlePayment } from "@/services/courseAccessApi";
import { loadRazorpayScript } from "@/utils/loadRazorpay";

const COURSE_LIBRARY_PATH = "/student/course";
const validityLabel = (days) => (Number(days) > 0 ? `${days} days access from today` : "Lifetime access");

export default function CourseBundleCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { message } = App.useApp();
  const bundleId = searchParams.get("bundleId");
  const studentCreds = useSelector((state) => state.student.student?.data);

  const [catalog, setCatalog] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [paying, setPaying] = useState(false);
  const [purchase, setPurchase] = useState(null); // { expiresAt } once paid

  const load = useCallback(async () => {
    setLoadError("");
    try {
      setCatalog(await fetchCourseCatalog());
    } catch (err) {
      setLoadError(err.message || "Couldn't load this bundle");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const goBack = () => router.push(COURSE_LIBRARY_PATH);
  const bundle = catalog?.bundles?.find((b) => String(b._id) === String(bundleId));

  const handlePay = async () => {
    if (!bundle || paying) return;
    setPaying(true);
    try {
      const order = await createCourseBundleOrder(bundle._id);

      if (!(await loadRazorpayScript())) {
        message.error("Unable to load the payment gateway. Please check your connection and try again.");
        setPaying(false);
        return;
      }

      const fullName = [studentCreds?.firstName, studentCreds?.lastName].filter(Boolean).join(" ");
      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: "SkillMedha",
        description: order.title,
        prefill: {
          ...(fullName ? { name: fullName } : {}),
          ...(studentCreds?.email ? { email: studentCreds.email } : {}),
        },
        theme: { color: "#1E69DA" },
        handler: async (response) => {
          try {
            const result = await verifyCourseBundlePayment(response);
            setPurchase({ expiresAt: result?.expiresAt || null });
            message.success("Payment successful!");
            load();
          } catch (err) {
            message.error(
              err.message ||
                "We received your payment but couldn't confirm it. Please contact support with your payment ID."
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
      rzp.on("payment.failed", (resp) => {
        message.error(resp?.error?.description || "Payment failed. Please try again.");
        setPaying(false);
      });
      rzp.open();
    } catch (err) {
      message.error(err.message || "Couldn't start the payment. Please try again.");
      setPaying(false);
    }
  };

  const wrap = (content) => (
    <div className="flex h-full flex-col overflow-y-auto bg-[#EFF5FB]">
      <StudentPageHeader
        title="Checkout"
        subtitle="Unlock every course in this bundle"
        leftSlot={
          <button
            type="button"
            onClick={goBack}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Back to Course Library"
          >
            <FiArrowLeft />
          </button>
        }
      />
      <div className="mx-auto w-full max-w-[1100px] flex-1 px-4 py-8 lg:px-8">{content}</div>
    </div>
  );

  const backButton = (
    <Button key="back" size="large" onClick={goBack}>
      Back to Courses
    </Button>
  );
  const myCoursesButton = (
    <Button key="go" type="primary" size="large" onClick={goBack}>
      Start learning
    </Button>
  );

  if (!bundleId) return wrap(<Result status="warning" title="Invalid checkout link" extra={backButton} />);
  if (loadError) {
    return wrap(
      <Result
        status="warning"
        title="Couldn't load this bundle"
        subTitle={loadError}
        extra={[
          <Button key="retry" type="primary" onClick={load}>
            Try again
          </Button>,
          backButton,
        ]}
      />
    );
  }
  if (!catalog) {
    return wrap(
      <div className="flex justify-center py-24">
        <Spin size="large" />
      </div>
    );
  }
  if (!bundle) return wrap(<Result status="404" title="This bundle is no longer available" extra={backButton} />);

  if (purchase || bundle.entitlement?.unlocked) {
    return wrap(
      <Result
        status="success"
        title={purchase ? `${bundle.title} is unlocked!` : "You already have this bundle"}
        subTitle={accessValidity(purchase ? purchase.expiresAt : bundle.entitlement?.expiresAt)}
        extra={[myCoursesButton, backButton]}
      />
    );
  }
  if (!bundle.newIds?.length) {
    return wrap(<Result status="success" title="You already have every course in this bundle" extra={[myCoursesButton, backButton]} />);
  }

  const mrp = Number(bundle.mrp) || 0;
  const price = Number(bundle.price) || 0;
  const discount = mrp > price ? mrp - price : 0;
  const ownedIds = new Set(bundle.ownedIds || []);

  return wrap(
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">Order summary</div>
        <div className="text-lg font-bold text-slate-900">{bundle.title}</div>
        {bundle.description && <p className="mt-1 text-sm text-slate-500">{bundle.description}</p>}

        <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
          <FiLayers className="text-violet-600" /> {bundle.courses.length} courses included
        </div>
        {ownedIds.size > 0 && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-800">
            You already have {ownedIds.size} of these courses. The bundle price stays the same — you&apos;ll get the
            other {bundle.newIds.length}.
          </div>
        )}
        <ul className="mt-4 flex flex-col divide-y divide-slate-100 rounded-xl border border-slate-100">
          {bundle.courses.map((c) => (
            <li key={c.courseId} className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="flex min-w-0 items-center gap-2.5 text-sm font-medium text-slate-700">
                <FiBookOpen className="shrink-0 text-blue-600" />
                <span className="truncate">{c.title || "Course"}</span>
              </span>
              {ownedIds.has(c.courseId) ? (
                <span className="shrink-0 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                  Owned
                </span>
              ) : (
                c.price > 0 && <span className="shrink-0 text-[13px] text-slate-400 line-through">{formatPrice(c.price)}</span>
              )}
            </li>
          ))}
        </ul>
        <ul className="mt-5 flex flex-col gap-2 text-sm text-slate-600">
          <li className="flex items-center gap-2">
            <FiCheck className="text-blue-600" /> Every lesson, resource and quiz in each course
          </li>
          <li className="flex items-center gap-2">
            <FiShield className="text-blue-600" /> {validityLabel(bundle.validityDays)}
          </li>
        </ul>
      </div>

      <div className="h-fit rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:sticky lg:top-6">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Price details</div>
        <div className="mt-4 flex flex-col gap-2.5 text-sm">
          {mrp > price && (
            <div className="flex justify-between text-slate-600">
              <span>Price</span>
              <span className="line-through">{formatPrice(mrp)}</span>
            </div>
          )}
          {discount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Discount</span>
              <span>− {formatPrice(discount)}</span>
            </div>
          )}
          <div className="mt-2 flex justify-between border-t border-slate-100 pt-3 text-base font-bold text-slate-900">
            <span>Total</span>
            <span>{formatPrice(price)}</span>
          </div>
        </div>
        <Button
          type="primary"
          size="large"
          block
          loading={paying}
          onClick={handlePay}
          icon={<FiLock />}
          className="!mt-6 !h-[50px] !rounded-xl !font-semibold"
        >
          Pay {formatPrice(price)}
        </Button>
        <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <FiShield /> Secure payment via Razorpay
        </div>
      </div>
    </div>
  );
}
