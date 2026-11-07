"use client";
import React, { useEffect, useState } from "react";
import { Alert, App, Button, Drawer, Form, Skeleton, Spin, Switch } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { adminFetchPlanContent, adminSavePlan, adminSavePlanContent } from "@/services/membershipApi";
import { formatPrice } from "@/components/membership/plans";
import PlanForm, { selectedIds } from "./PlanForm";

function PlanDrawer({ plan, plans, onClose, onSaved }) {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState(null);
  const isFree = plan.key === "free";

  useEffect(() => {
    if (isFree) return;
    adminFetchPlanContent()
      .then(setContent)
      .catch((err) => message.error(err.message || "Couldn't load courses and practice sets"));
  }, [isFree, message]);

  // Sends only what changed, so items in other plans aren't touched.
  const saveItems = async (itemType, rows, ids) => {
    const before = selectedIds(rows, plan);
    const added = ids.filter((id) => !before.includes(id)).map((itemId) => ({ itemType, itemId }));
    const removed = before.filter((id) => !ids.includes(id)).map((itemId) => ({ itemType, itemId }));
    if (added.length) await adminSavePlanContent(added, plan.key);
    if (removed.length) await adminSavePlanContent(removed, null);
  };

  const submit = async ({ courseIds, practiceSetIds, ...values }) => {
    setSaving(true);
    try {
      await adminSavePlan(plan.key, {
        ...values,
        features: String(values.features || "").split("\n"),
        status: isFree ? "published" : plan.status,
      });
      if (content) {
        await saveItems("course", content.courses, courseIds || []);
        await saveItems("practiceSet", content.practiceSets, practiceSetIds || []);
      }
      message.success(`${values.name} plan saved`);
      onSaved();
    } catch (err) {
      message.error(err.message || "Couldn't save this plan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      open
      size="large"
      title={`Edit ${plan.name} plan`}
      onClose={onClose}
      extra={
        <Button type="primary" loading={saving} disabled={!isFree && !content} onClick={() => form.submit()}>
          Save
        </Button>
      }
    >
      {isFree || content ? (
        <PlanForm form={form} plan={plan} plans={plans} content={content} onFinish={submit} />
      ) : (
        <div className="flex justify-center py-10">
          <Spin />
        </div>
      )}
    </Drawer>
  );
}

// What still stops students buying this plan, or null when it's ready.
export const setupWarning = (plan) => {
  if (plan.key === "free") return null;
  const items = (plan.courses || 0) + (plan.practiceSets || 0);
  if (plan.status !== "published") {
    return items ? "Turn this plan on so students can see and buy it." : "Add courses, then turn this plan on.";
  }
  return items ? null : "Students can buy this plan, but it opens nothing yet. Add courses.";
};

const Count = ({ value, label }) => (
  <div className="flex-1 rounded-lg bg-slate-50 px-2 py-2 text-center">
    <div className="text-[18px] font-bold text-slate-900">{value || 0}</div>
    <div className="text-[12px] text-slate-500">{label}</div>
  </div>
);

export function AdminPlanCard({ plan, switching, onToggle, onEdit }) {
  const isFree = plan.key === "free";
  const isOn = plan.status === "published";
  const prices = (plan.options || []).map((o) => o.price);
  const warning = setupWarning(plan);

  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[18px] font-bold text-slate-900">{plan.name}</div>
          <div className={`text-[13px] font-medium ${isOn ? "text-emerald-600" : "text-slate-500"}`}>
            {isFree ? "Every student has this" : isOn ? "On: students can buy it" : "Off: hidden from students"}
          </div>
        </div>
        {!isFree && (
          <Switch
            checked={isOn}
            checkedChildren="On"
            unCheckedChildren="Off"
            loading={switching}
            onChange={onToggle}
            aria-label={`Turn ${plan.name} on or off`}
          />
        )}
      </div>

      {isFree ? (
        <p className="mb-4 mt-4 flex-1 text-[13px] text-slate-500">
          Courses and practice sets set as Free stay open to everyone. Nothing to set up here.
        </p>
      ) : (
        <>
          <div className="mt-4 text-[14px] text-slate-600">
            {prices.length ? (
              <>
                From <span className="text-[20px] font-bold text-slate-900">{formatPrice(Math.min(...prices))}</span>
                <span className="text-[13px] text-slate-500">
                  {" "}
                  · {prices.length} duration{prices.length === 1 ? "" : "s"}
                </span>
              </>
            ) : (
              <span className="font-medium text-amber-700">No prices yet</span>
            )}
          </div>
          <div className="mb-4 mt-3 flex flex-1 items-start gap-2">
            <Count value={plan.courses} label="Courses" />
            <Count value={plan.practiceSets} label="Practice" />
            <Count value={plan.members} label="Members" />
          </div>
        </>
      )}

      {warning && (
        <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-800">{warning}</div>
      )}

      <Button block type={isFree ? "default" : "primary"} ghost={!isFree} icon={<EditOutlined />} onClick={onEdit}>
        {isFree ? "Edit wording" : "Edit courses and prices"}
      </Button>
    </div>
  );
}

export default function PlansTab({ plans, loading, onChanged }) {
  const { message } = App.useApp();
  const [editing, setEditing] = useState(null);
  const [switching, setSwitching] = useState(null);

  const toggle = async (plan, on) => {
    setSwitching(plan.key);
    try {
      await adminSavePlan(plan.key, { ...plan, status: on ? "published" : "draft" });
      message.success(`${plan.name} is ${on ? "on" : "off"}`);
      onChanged();
    } catch (err) {
      message.error(err.message || "Couldn't change this plan");
    } finally {
      setSwitching(null);
    }
  };

  if (loading && !plans.length) return <Skeleton active />;

  return (
    <div className="flex flex-col gap-4">
      <Alert
        type="info"
        showIcon
        message="Choose courses and prices for a plan, then turn it on. Students can then see and buy it on their Plans page."
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <AdminPlanCard
            key={plan.key}
            plan={plan}
            switching={switching === plan.key}
            onToggle={(on) => toggle(plan, on)}
            onEdit={() => setEditing(plan)}
          />
        ))}
      </div>
      {editing && (
        <PlanDrawer
          key={editing.key}
          plan={editing}
          plans={plans}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            onChanged();
          }}
        />
      )}
    </div>
  );
}
