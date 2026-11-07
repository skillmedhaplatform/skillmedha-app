"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { App, Button, Empty, Modal, Result, Spin } from "antd";
import { FiLock, FiShield } from "react-icons/fi";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";
import PlansCompare from "@/components/membership/PlansCompare";
import { createMembershipOrder, fetchMembership, verifyMembershipPayment } from "@/services/membershipApi";
import { durationLabel, formatDate, formatPrice } from "@/components/membership/plans";
import { expiringIn, expiryText } from "@/components/courseAccess/access";
import { loadRazorpayScript } from "@/utils/loadRazorpay";

const DAY = 24 * 60 * 60 * 1000;

// Renewing adds time after the current plan; anything else starts today.
const planEndDate = (plan, option, current) => {
  const from = current?.planKey === plan.key ? new Date(current.expiresAt).getTime() : Date.now();
  return new Date(from + option.days * DAY);
};

// Student → Plans: compare Free / Prime / Pro, pay, and see the current plan.
export default function StudentPlansPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const studentCreds = useSelector((state) => state.student.student?.data);
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [paying, setPaying] = useState(null);
  const [confirming, setConfirming] = useState(null); // { plan, option } before paying
  const [purchased, setPurchased] = useState(null); // { name, expiresAt } once paid

  const load = useCallback(async () => {
    setLoadError("");
    try {
      setData(await fetchMembership());
    } catch (err) {
      setLoadError(err.message || "Couldn't load plans");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handlePay = async ({ plan, option }) => {
    if (paying) return;
    setConfirming(null);
    setPaying(plan.key);
    try {
      const order = await createMembershipOrder(plan.key, option.days);

      if (!(await loadRazorpayScript())) {
        message.error("Unable to load the payment gateway. Please check your connection and try again.");
        setPaying(null);
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
            const result = await verifyMembershipPayment(response);
            setPurchased({ name: plan.name, expiresAt: result?.expiresAt });
            await load();
          } catch (err) {
            message.error(
              err.message ||
                "We received your payment but couldn't confirm it. Please contact support with your payment ID."
            );
          } finally {
            setPaying(null);
          }
        },
        modal: {
          ondismiss: () => {
            message.info("Payment cancelled");
            setPaying(null);
          },
        },
      });
      rzp.on("payment.failed", (resp) => {
        message.error(resp?.error?.description || "Payment failed. Please try again.");
        setPaying(null);
      });
      rzp.open();
    } catch (err) {
      message.error(err.message || "Couldn't start the payment. Please try again.");
      setPaying(null);
    }
  };

  const wrap = (content) => (
    <div className="flex h-full flex-col overflow-y-auto bg-[#EFF5FB]">
      <StudentPageHeader title="Plans" subtitle="One plan opens many courses and practice sets" />
      <div className="mx-auto w-full max-w-[1100px] flex-1 px-4 py-8 lg:px-8">{content}</div>
    </div>
  );

  if (loadError) {
    return wrap(
      <Result
        status="warning"
        title="Couldn't load plans"
        subTitle={loadError}
        extra={
          <Button type="primary" onClick={load}>
            Try again
          </Button>
        }
      />
    );
  }
  if (!data) {
    return wrap(
      <div className="flex justify-center py-24">
        <Spin size="large" />
      </div>
    );
  }
  if (purchased) {
    return wrap(
      <Result
        status="success"
        title={`${purchased.name} is active`}
        subTitle={
          purchased.expiresAt
            ? `Everything in your plan is open until ${formatDate(purchased.expiresAt)}.`
            : "Everything in your plan is open now."
        }
        extra={[
          <Button key="courses" type="primary" size="large" onClick={() => router.push("/student/course")}>
            Go to courses
          </Button>,
          <Button key="practice" size="large" onClick={() => router.push("/student/practice-new")}>
            Go to practice
          </Button>,
          <Button key="plans" size="large" onClick={() => setPurchased(null)}>
            Back to plans
          </Button>,
        ]}
      />
    );
  }
  if (!data.enabled && !data.current) {
    return wrap(<Empty description="Plans aren't available yet. Please check back soon." />);
  }

  const daysLeft = expiringIn(data.current?.expiresAt);
  const plan = confirming?.plan;
  const option = confirming?.option;

  return wrap(
    <div className="flex flex-col gap-8">
      {data.current && (
        <div
          className={`rounded-xl border px-4 py-3 text-[14px] ${
            daysLeft ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          <span className="font-semibold">You&apos;re on {data.current.name}.</span>{" "}
          {daysLeft
            ? `${expiryText(daysLeft)}. Renew to keep your plan courses and practice open.`
            : `Everything in your plan is open until ${formatDate(data.current.expiresAt)}.`}
        </div>
      )}

      <PlansCompare
        plans={data.plans}
        current={data.current}
        paying={paying}
        onBuy={(p, o) => setConfirming({ plan: p, option: o })}
        onOpenCourse={(id) => router.push(`/student/course/${id}`)}
      />

      {data.history.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 mt-0 text-[18px] font-bold text-slate-900">Your plan history</h2>
          <ul className="m-0 flex list-none flex-col divide-y divide-slate-100 p-0">
            {data.history.map((h) => (
              <li key={h._id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-[14px]">
                <span className="font-medium text-slate-700">
                  {h.planName} · {durationLabel(h.days)}
                </span>
                <span className="text-slate-500">
                  {formatDate(h.startsAt)} – {formatDate(h.expiresAt)} · {formatPrice(h.amountCharged)}
                  {h.status === "upgraded" && " · Upgraded"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Modal
        open={!!confirming}
        title={plan ? `Confirm ${plan.name} plan` : ""}
        onCancel={() => setConfirming(null)}
        footer={null}
      >
        {plan && option && (
          <div className="flex flex-col gap-3 text-[14px]">
            <div className="flex justify-between text-slate-600">
              <span>Duration</span>
              <span className="font-medium text-slate-800">{durationLabel(option.days)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Access until</span>
              <span className="font-medium text-slate-800">{formatDate(planEndDate(plan, option, data.current))}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Price</span>
              <span>{formatPrice(option.price)}</span>
            </div>
            {option.credit > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Credit from your current plan</span>
                <span>− {formatPrice(option.credit)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-100 pt-3 text-[16px] font-bold text-slate-900">
              <span>Total</span>
              <span>{formatPrice(option.payable)}</span>
            </div>
            <Button type="primary" size="large" block icon={<FiLock />} onClick={() => handlePay(confirming)} className="!font-semibold">
              Pay {formatPrice(option.payable)}
            </Button>
            <div className="flex items-center justify-center gap-1.5 text-[12px] text-slate-500">
              <FiShield aria-hidden="true" /> Secure payment via Razorpay. It won&apos;t renew by itself.
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
