"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { App, Button, Result, Spin } from "antd";
import { FiArrowLeft, FiBookOpen, FiCheck, FiClock, FiLock, FiShield, FiTarget, FiLayers } from "react-icons/fi";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";
import { restUrl } from "@/config/urls";
import { getLstorage } from "@/universalUtils/windowMW";
import { fetchPracticeCatalog } from "@/redux/slices/practiceSlice";
import { PracticeSetCard } from "@/components/practiceSets/PracticeSetCard";
import {
  categoryLabel,
  difficultyLabel,
  formatDuration,
  formatPrice,
  levelLabel,
} from "@/components/practiceSets/constants";
import { PRACTICE_SETS_PATH, formatDate, testUrl } from "@/components/practiceSets/studentAccess";
import { loadRazorpayScript } from "@/utils/loadRazorpay";

const ITEM_TYPES = { set: "practiceSet", bundle: "practiceBundle" };

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${getLstorage("token")}` },
});

const validityLabel = (days) =>
  Number(days) > 0 ? `${days} days access from today` : "Lifetime access";

function Perk({ icon, children }) {
  return (
    <li className="flex items-start gap-2.5 text-sm text-slate-600">
      <span className="mt-0.5 text-blue-600">{icon}</span>
      <span>{children}</span>
    </li>
  );
}

export default function PracticeCheckoutPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { message } = App.useApp();
  const type = searchParams.get("type");
  const id = searchParams.get("id");
  const isBundle = type === "bundle";

  const studentCreds = useSelector((state) => state.student.student?.data);
  const { catalog, catalogStatus, catalogError } = useSelector((state) => state.practice);
  const [paying, setPaying] = useState(false);
  const [purchase, setPurchase] = useState(null); // { expiresAt } once paid

  useEffect(() => {
    dispatch(fetchPracticeCatalog());
  }, [dispatch]);

  const item = (isBundle ? catalog?.bundles : catalog?.sets)?.find((x) => x._id === id);
  const goBack = () => router.push(PRACTICE_SETS_PATH);

  const handlePay = async () => {
    if (!item || paying) return;
    setPaying(true);
    try {
      const { data: order } = await axios.post(
        `${restUrl}/payment/practice/createOrder`,
        { itemType: ITEM_TYPES[type], itemId: item._id },
        authHeaders()
      );

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
        description: order.title || item.title,
        prefill: {
          ...(fullName ? { name: fullName } : {}),
          ...(studentCreds?.email ? { email: studentCreds.email } : {}),
        },
        theme: { color: "#1E69DA" },
        handler: async (response) => {
          try {
            const { data } = await axios.post(
              `${restUrl}/payment/practice/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              authHeaders()
            );
            setPurchase({ expiresAt: data?.expiresAt || null });
            message.success("Payment successful!");
            dispatch(fetchPracticeCatalog());
          } catch (err) {
            message.error(
              err?.response?.data?.error ||
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
      message.error(err?.response?.data?.error || "Couldn't start the payment. Please try again.");
      setPaying(false);
    }
  };

  const header = (
    <StudentPageHeader
      section="practice"
      title="Checkout"
      subtitle={isBundle ? "Unlock every practice set in this bundle" : "Unlock this practice set"}
      leftSlot={
        <button
          type="button"
          onClick={goBack}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          aria-label="Back to Practice Sets"
        >
          <FiArrowLeft />
        </button>
      }
    />
  );

  const wrap = (content) => (
    <div className="flex h-full flex-col overflow-y-auto bg-[#EFF5FB]">
      {header}
      <div className="mx-auto w-full max-w-[1100px] flex-1 px-4 py-8 lg:px-8">{content}</div>
    </div>
  );

  if (!ITEM_TYPES[type] || !id) {
    return wrap(
      <Result
        status="warning"
        title="Invalid checkout link"
        extra={<Button type="primary" onClick={goBack}>Browse Practice Sets</Button>}
      />
    );
  }

  if (!item && (catalogStatus === "loading" || catalogStatus === "idle")) {
    return wrap(
      <div className="flex justify-center py-24">
        <Spin size="large" />
      </div>
    );
  }

  if (!item) {
    return wrap(
      <Result
        status={catalogStatus === "failed" ? "warning" : "404"}
        title={catalogStatus === "failed" ? "Couldn't load this item" : "This item is no longer available"}
        subTitle={catalogStatus === "failed" ? catalogError : undefined}
        extra={<Button type="primary" onClick={goBack}>Browse Practice Sets</Button>}
      />
    );
  }

  // Paid just now, or opened checkout for something already owned / free.
  const alreadyUnlocked = item.access?.unlocked;
  if (purchase || alreadyUnlocked) {
    const isFreeSet = !isBundle && item.access?.reason === "free";
    const expiresAt = purchase ? purchase.expiresAt : item.access?.expiresAt;
    return wrap(
      <Result
        status="success"
        title={
          purchase
            ? `${item.title} is unlocked!`
            : isFreeSet
              ? "This practice set is free"
              : "You already have access"
        }
        subTitle={
          isFreeSet ? "No payment needed — start practising right away." : expiresAt ? `Access till ${formatDate(expiresAt)}` : "Lifetime access"
        }
        extra={[
          isBundle ? (
            <Button key="go" type="primary" size="large" onClick={goBack}>
              View My Practice Sets
            </Button>
          ) : (
            <Button key="go" type="primary" size="large" onClick={() => router.push(testUrl(item))}>
              Start Practicing
            </Button>
          ),
          <Button key="back" size="large" onClick={goBack}>
            Back to Practice Sets
          </Button>,
        ]}
      />
    );
  }

  const mrp = Number(item.mrp) || 0;
  const price = Number(item.price) || 0;
  const discount = mrp > price ? mrp - price : 0;
  const questions = isBundle ? item.summary?.totalQuestions : item.questionCount;
  const minutes = isBundle ? item.summary?.totalMinutes : item.timeMinutes;

  return wrap(
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="flex flex-col gap-5">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">Order summary</div>
          <div className="flex flex-col gap-5 sm:flex-row">
            <div className="w-full shrink-0 sm:w-[240px]">
              <PracticeSetCard item={item} isBundle={isBundle} />
            </div>
            <div className="flex-1">
              <div className="text-lg font-bold text-slate-900">{item.title}</div>
              {item.description && <p className="mt-1 text-sm text-slate-500">{item.description}</p>}
              <ul className="mt-4 flex flex-col gap-2.5">
                <Perk icon={<FiBookOpen />}>
                  {questions} questions{isBundle ? " across all sets" : " per attempt"}
                </Perk>
                <Perk icon={<FiClock />}>
                  {formatDuration(minutes)}
                  {isBundle ? " of timed practice" : " time limit"}
                </Perk>
                {!isBundle && (
                  <Perk icon={<FiTarget />}>
                    {levelLabel(item.level)} level · {difficultyLabel(item.difficulty)} difficulty ·{" "}
                    {categoryLabel(item.category)}
                  </Perk>
                )}
                <Perk icon={<FiCheck />}>New random questions on every attempt</Perk>
                <Perk icon={<FiShield />}>{validityLabel(item.validityDays)}</Perk>
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          {isBundle ? (
            <>
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <FiLayers className="text-amber-500" /> {item.sets?.length || 0} practice sets included
              </div>
              <ul className="divide-y divide-slate-100">
                {(item.sets || []).map((s) => (
                  <li key={s._id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <div className="min-w-0">
                      <div className="truncate font-medium text-slate-800">{s.title}</div>
                      <div className="text-xs text-slate-500">
                        {levelLabel(s.level)} · {s.questionCount} Qs · {formatDuration(s.timeMinutes)}
                      </div>
                    </div>
                    <span className="shrink-0 text-xs text-slate-400">
                      {s.plan === "premium" ? formatPrice(s.price) : "Free"}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <div className="mb-3 text-sm font-semibold text-slate-800">Topics covered</div>
              <div className="flex flex-wrap gap-2">
                {(item.topics || []).map((t) => (
                  <span key={t.topicId} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                    {t.topicTitle}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
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
          {isBundle && item.summary?.savings > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>vs. buying separately</span>
              <span>Save {formatPrice(item.summary.savings)}</span>
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
