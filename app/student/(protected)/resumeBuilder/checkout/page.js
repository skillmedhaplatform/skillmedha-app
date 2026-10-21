"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import { App, Button, Result, Spin } from "antd";
import { FiArrowLeft, FiCheck, FiLock, FiShield, FiLayers, FiFileText } from "react-icons/fi";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";
import TemplateThumb from "@/components/resumeTemplates/TemplateThumb";
import {
  RESUME_BUILDER_PATH,
  accessValidity,
  formatPrice,
  resumeCheckoutUrl,
} from "@/components/resumeTemplates/access";
import { TEMPLATE_OPTIONS } from "@/app/student/(protected)/resumeBuilder/Templates/registry";
import { createResumeOrder, fetchResumeCatalog, verifyResumePayment } from "@/services/resumeTemplatesApi";
import { loadRazorpayScript } from "@/utils/loadRazorpay";

const ITEM_TYPES = { template: "resumeTemplate", bundle: "resumeBundle" };

const validityLabel = (days) => (Number(days) > 0 ? `${days} days access from today` : "Lifetime access");
const defaultName = (key) => TEMPLATE_OPTIONS.find((t) => t.id === key)?.label || key;

// Open the builder's template gallery with this template remembered, so the
// student lands right where they can use what they bought.
const openBuilderWith = (templateKey) => {
  if (typeof window !== "undefined") {
    if (templateKey) localStorage.setItem("resumeBuilder_lastTemplate", templateKey);
    sessionStorage.setItem("resumeBuilderStep", "templates_initial");
  }
};

export default function ResumeCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { message } = App.useApp();
  const type = searchParams.get("type");
  const id = searchParams.get("id");
  const isBundle = type === "bundle";
  const studentCreds = useSelector((state) => state.student.student?.data);

  const [catalog, setCatalog] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [paying, setPaying] = useState(false);
  const [purchase, setPurchase] = useState(null); // { expiresAt } once paid

  const load = useCallback(async () => {
    setLoadError("");
    try {
      setCatalog(await fetchResumeCatalog());
    } catch (err) {
      setLoadError(err.message || "Couldn't load this item");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const goBack = () => {
    openBuilderWith(null);
    router.push(RESUME_BUILDER_PATH);
  };

  const item = isBundle
    ? catalog?.bundles?.find((b) => b._id === id)
    : catalog?.templates?.find((t) => t.templateKey === id);

  const handlePay = async () => {
    if (!item || paying) return;
    setPaying(true);
    try {
      const order = await createResumeOrder({ itemType: ITEM_TYPES[type], itemId: id });

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
            const result = await verifyResumePayment(response);
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
        subtitle={isBundle ? "Unlock every template in this bundle" : "Unlock this resume template"}
        leftSlot={
          <button
            type="button"
            onClick={goBack}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Back to Resume Builder"
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
      Back to Templates
    </Button>
  );

  if (!ITEM_TYPES[type] || !id) {
    return wrap(<Result status="warning" title="Invalid checkout link" extra={backButton} />);
  }
  if (loadError) {
    return wrap(
      <Result
        status="warning"
        title="Couldn't load this item"
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
  if (!item) {
    // A template the admin never configured is free for everyone.
    const freeByDefault = !isBundle && TEMPLATE_OPTIONS.some((t) => t.id === id) && !catalog.hiddenKeys?.includes(id);
    return wrap(
      <Result
        status={freeByDefault ? "success" : "404"}
        title={freeByDefault ? "This template is free" : "This item is no longer available"}
        extra={[
          freeByDefault && (
            <Button
              key="use"
              type="primary"
              size="large"
              onClick={() => {
                openBuilderWith(id);
                router.push(RESUME_BUILDER_PATH);
              }}
            >
              Use this template
            </Button>
          ),
          backButton,
        ].filter(Boolean)}
      />
    );
  }

  const unlocked = item.entitlement?.unlocked;
  const name = isBundle ? item.title : item.name || defaultName(item.templateKey);

  // Just paid, or opened checkout for something already owned / free.
  if (purchase || unlocked) {
    const expiresAt = purchase ? purchase.expiresAt : item.entitlement?.expiresAt;
    const isFree = !isBundle && item.entitlement?.reason === "free";
    return wrap(
      <Result
        status="success"
        title={purchase ? `${name} is unlocked!` : isFree ? "This template is free" : "You already have access"}
        subTitle={isFree ? "No payment needed." : accessValidity(expiresAt)}
        extra={[
          <Button
            key="go"
            type="primary"
            size="large"
            onClick={() => {
              openBuilderWith(isBundle ? item.templateKeys?.[0] : item.templateKey);
              router.push(RESUME_BUILDER_PATH);
            }}
          >
            {isBundle ? "Browse my templates" : "Use this template"}
          </Button>,
          backButton,
        ]}
      />
    );
  }

  // Bundle-only templates can't be bought on their own.
  if (!isBundle && item.access === "bundle") {
    return wrap(
      <Result
        status="info"
        title={`${name} is available only in a bundle`}
        extra={[
          ...(item.bundles || []).map((b) => (
            <Button key={b._id} type="primary" size="large" onClick={() => router.push(resumeCheckoutUrl("bundle", b._id))}>
              {b.title} · {formatPrice(b.price)}
            </Button>
          )),
          backButton,
        ]}
      />
    );
  }

  // Owning every template in the bundle would make the purchase pointless.
  if (isBundle && item.newKeys?.length === 0) {
    return wrap(
      <Result status="success" title="You already have every template in this bundle" extra={backButton} />
    );
  }

  const mrp = Number(item.mrp) || 0;
  const price = Number(item.price) || 0;
  const discount = mrp > price ? mrp - price : 0;
  const ownedKeys = new Set(item.ownedKeys || []);

  return wrap(
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">Order summary</div>
        <div className="text-lg font-bold text-slate-900">{name}</div>
        {item.description && <p className="mt-1 text-sm text-slate-500">{item.description}</p>}

        {isBundle ? (
          <>
            <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
              <FiLayers className="text-amber-500" /> {item.templateKeys.length} templates included
            </div>
            {ownedKeys.size > 0 && (
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-800">
                You already own {ownedKeys.size} of these templates. The bundle price stays the same — you&apos;ll
                get the other {item.newKeys.length}.
              </div>
            )}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {item.templates.map((t) => (
                <div key={t.templateKey} className="overflow-hidden rounded-lg border border-slate-200">
                  <TemplateThumb templateKey={t.templateKey} height={150} scale={0.2} />
                  <div className="flex items-center justify-between gap-1 border-t border-slate-100 px-2 py-1.5">
                    <span className="truncate text-[12px] font-medium text-slate-700">
                      {t.name || defaultName(t.templateKey)}
                    </span>
                    {ownedKeys.has(t.templateKey) && (
                      <span className="shrink-0 rounded bg-emerald-50 px-1.5 text-[10px] font-bold text-emerald-700">
                        Owned
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="mt-4 flex flex-col gap-5 sm:flex-row">
            <div className="w-full shrink-0 overflow-hidden rounded-lg border border-slate-200 sm:w-[240px]">
              <TemplateThumb templateKey={item.templateKey} previewImage={item.previewImage} height={320} scale={0.3} />
            </div>
            <ul className="flex flex-col gap-2.5 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <FiFileText className="text-blue-600" /> {item.category || "Resume"} template
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-blue-600" /> Use it for every resume you create
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-blue-600" /> Unlimited edits and PDF downloads
              </li>
              {(item.bestFor || []).length > 0 && (
                <li className="flex items-center gap-2">
                  <FiCheck className="text-blue-600" /> Best for {item.bestFor.join(", ")}
                </li>
              )}
            </ul>
          </div>
        )}
        <div className="mt-5 flex items-center gap-2 text-sm text-slate-600">
          <FiShield className="text-blue-600" /> {validityLabel(item.validityDays)}
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
