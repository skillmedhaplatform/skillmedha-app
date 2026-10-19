"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button, Modal } from "antd";
import { LockOutlined, ShoppingCartOutlined, AppstoreOutlined } from "@ant-design/icons";
import TemplateThumb from "./TemplateThumb";
import { formatPrice, resumeCheckoutUrl } from "./access";

/**
 * Shown when a student picks (or tries to download with) a template they
 * don't have. Offers the individual purchase for premium templates and every
 * published bundle that contains the template.
 */
export default function TemplateLockModal({ templateKey, meta, label, bundles = [], onClose }) {
  const router = useRouter();
  if (!templateKey) return null;

  const containing = bundles.filter(
    (b) => !b.entitlement?.unlocked && (b.templateKeys || []).includes(templateKey)
  );
  const canBuyAlone = meta?.access === "premium";
  const name = meta?.name || label || templateKey;

  return (
    <Modal open onCancel={onClose} footer={null} width={460} centered destroyOnHidden title={null}>
      <div className="flex flex-col gap-4 pt-2">
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <TemplateThumb templateKey={templateKey} previewImage={meta?.previewImage} height={200} scale={0.3} />
        </div>
        <div>
          <div className="flex items-center gap-2 text-[17px] font-bold text-slate-900">
            <LockOutlined className="text-amber-500" /> {name} is locked
          </div>
          <p className="mt-1 text-[13px] text-slate-500">
            {canBuyAlone
              ? "Buy this template to edit and download your resume with it."
              : "This template is available as part of a bundle."}
          </p>
        </div>

        {canBuyAlone && (
          <Button
            type="primary"
            size="large"
            icon={<ShoppingCartOutlined />}
            onClick={() => router.push(resumeCheckoutUrl("template", templateKey))}
            className="!h-11 !rounded-lg !font-semibold"
          >
            Buy template · {formatPrice(meta.price)}
          </Button>
        )}

        {containing.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {canBuyAlone ? "Or get it in a bundle" : "Bundles with this template"}
            </div>
            {containing.map((b) => (
              <button
                key={b._id}
                type="button"
                onClick={() => router.push(resumeCheckoutUrl("bundle", b._id))}
                className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-left transition-colors hover:bg-amber-100"
              >
                <span className="flex items-center gap-2 text-[13px] font-semibold text-slate-800">
                  <AppstoreOutlined className="text-amber-500" /> {b.title}
                  <span className="font-normal text-slate-500">· {(b.templateKeys || []).length} templates</span>
                </span>
                <span className="text-[13px] font-bold text-amber-700">{formatPrice(b.price)}</span>
              </button>
            ))}
          </div>
        )}

        {!canBuyAlone && containing.length === 0 && (
          <div className="rounded-lg bg-slate-50 px-3 py-2 text-[13px] text-slate-500">
            No bundle with this template is on sale right now. Please choose another template.
          </div>
        )}

        <Button onClick={onClose} className="!h-10 !rounded-lg">
          Choose another template
        </Button>
      </div>
    </Modal>
  );
}
