"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { App, Button, Result, Spin } from "antd";
import {
  FiArrowLeft,
  FiBookOpen,
  FiCheck,
  FiClock,
  FiLock,
  FiShield,
  FiTarget,
  FiLayers,
} from "react-icons/fi";
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
import {
  PRACTICE_SETS_PATH,
  accessTag,
  checkoutUrl,
  formatDate,
  isOwned,
  testUrl,
} from "@/components/practiceSets/studentAccess";

const ITEM_TYPES = { set: "practiceSet", bundle: "practiceBundle" };

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${getLstorage("token")}` },
});

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

  const contentScrollRef = useRef(null);
  const studentCreds = useSelector((state) => state.student.student?.data);
  const { catalog, catalogStatus, catalogError } = useSelector((state) => state.practice);
  const [paying, setPaying] = useState(false);
  const [purchase, setPurchase] = useState(null); // { expiresAt } once paid

  useEffect(() => {
    dispatch(fetchPracticeCatalog());
  }, [dispatch]);

  const item = (isBundle ? catalog?.bundles : catalog?.sets)?.find((x) => x._id === id);
  const goBack = () => router.push(PRACTICE_SETS_PATH);

  const remainingCards = useMemo(() => {
    const list = [];
    (catalog?.sets || []).forEach((s) => {
      if (s._id !== id) {
        list.push({ item: s, isBundle: false });
      }
    });
    (catalog?.bundles || []).forEach((b) => {
      if (b._id !== id) {
        list.push({ item: b, isBundle: true });
      }
    });
    return list;
  }, [catalog, id]);

  const handleCardClick = (cardItem, cardIsBundle) => {
    if (cardIsBundle) {
      if (cardItem.access?.unlocked) {
        router.push(PRACTICE_SETS_PATH);
      } else {
        router.push(checkoutUrl("bundle", cardItem._id));
      }
      return;
    }
    if (cardItem.access?.unlocked) {
      router.push(testUrl(cardItem));
    } else {
      router.push(checkoutUrl("set", cardItem._id));
    }
  };

  const handleTopWheel = (e) => {
    if (contentScrollRef.current) {
      contentScrollRef.current.scrollTop += e.deltaY;
    }
  };

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

  const wrap = (content) => (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-[#F6F8FB]">
      {/* Pinned Top Container: Banner + White Bar (remains fixed on scroll) */}
      <div
        className="shrink-0 z-20 shadow-[0_4px_16px_-4px_rgba(15,23,42,0.04)]"
        onWheel={handleTopWheel}
      >
        {/* Banner */}
        <StudentPageHeader
          title="Checkout"
          subtitle={isBundle ? "Unlock every practice set in this bundle" : "Unlock this practice set"}
        />

        {/* White Section Directly Below Banner */}
        <div className="border-b border-slate-200/80 bg-white/95 backdrop-blur">
          <div className="mx-auto flex w-full max-w-[1400px] items-center gap-3 px-4 py-2.5 lg:px-8">
            <button
              type="button"
              onClick={goBack}
              className="flex items-center justify-center text-slate-600 hover:text-[#1D6AE5] transition-colors cursor-pointer p-1"
              aria-label="Back to Practice Sets"
            >
              <FiArrowLeft className="text-lg" />
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goBack}
                className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-500 hover:text-[#1D6AE5] transition-colors cursor-pointer"
              >
                Practice
              </button>
              <span className="text-slate-300 text-xs">/</span>
              <span className="text-xs font-semibold text-slate-700">
                Checkout
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Main Page Content and Practice Cards */}
      <div ref={contentScrollRef} className="flex-1 overflow-y-auto min-h-0">
        <div className="mx-auto w-full max-w-[1400px] px-4 py-8 lg:px-8">
          {content}
        </div>
      </div>
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
    <div>
      {/* Main Checkout Section: Order Summary & Price Details */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Order Summary with Full Details & Card Preview Restored */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 sm:p-6 shadow-sm">
          <div className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">
            Order summary
          </div>
          <div className="flex flex-col gap-6 sm:flex-row items-start">
            {/* Left side: Practice Card */}
            <div className="w-full shrink-0 sm:w-[240px]">
              <PracticeSetCard item={item} isBundle={isBundle} />
            </div>

            {/* Right side: Details & Perks */}
            <div className="flex-1">
              <div className="text-lg font-bold text-slate-900">{item.title}</div>
              {item.description && (
                <p className="mt-1 text-sm text-slate-500">{item.description}</p>
              )}
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

          {/* Topics Covered: Cleanly aligned directly below inside the Order Summary card */}
          {!isBundle && (
            <div className="mt-6 border-t border-slate-100 pt-5">
              <div className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                Topics covered
              </div>
              <div className="flex flex-wrap gap-2">
                {(item.topics || []).length > 0 ? (
                  item.topics.map((t) => (
                    <span
                      key={t.topicId || t._id || t.topicTitle}
                      className="rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-semibold text-blue-700"
                    >
                      {t.topicTitle}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">No specific topics listed</span>
                )}
              </div>
            </div>
          )}

          {/* For bundles: practice sets included */}
          {isBundle && (item.sets || []).length > 0 && (
            <div className="mt-5 border-t border-slate-100 pt-4">
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
            </div>
          )}
        </div>

        {/* Price Details */}
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

      {/* Remaining Practice Cards displayed below Order Summary */}
      {remainingCards.length > 0 && (
        <div className="mt-10 pt-8 border-t border-slate-200/80">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3
                className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 !border-none !border-b-0 !pb-0 !mb-0"
                style={{ border: "none", borderBottom: "none", paddingBottom: 0, marginBottom: 0 }}
              >
                Remaining Practice Sets
              </h3>
              <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
                Explore more practice sets to test and improve your skills
              </p>
            </div>
            <Button
              onClick={() => router.push(PRACTICE_SETS_PATH)}
              className="!text-xs !font-semibold text-blue-600 hover:!text-blue-700 !rounded-lg"
            >
              View all practice sets
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {remainingCards.map(({ item: cardItem, isBundle: cardIsBundle }) => (
              <div key={`${cardIsBundle ? "b" : "s"}-${cardItem._id}`} className="h-full">
                <PracticeSetCard
                  item={cardItem}
                  isBundle={cardIsBundle}
                  owned={cardIsBundle ? !!cardItem.access?.unlocked : isOwned(cardItem.access)}
                  accessTag={
                    cardIsBundle
                      ? cardItem.access?.unlocked
                        ? "Purchased"
                        : null
                      : accessTag(cardItem.access)
                  }
                  onClick={() => handleCardClick(cardItem, cardIsBundle)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
