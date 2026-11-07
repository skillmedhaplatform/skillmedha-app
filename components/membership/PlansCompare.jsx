"use client";

import { useState } from "react";
import { Button, Collapse, Segmented, Tag } from "antd";
import { FiCheck, FiCreditCard, FiMinus, FiMousePointer, FiUnlock } from "react-icons/fi";
import { durationLabel, formatPrice } from "./plans";

const STEPS = [
  { icon: FiMousePointer, title: "Choose a plan", text: "See exactly which courses and practice sets it opens." },
  { icon: FiCreditCard, title: "Pay once", text: "One payment. It never renews by itself." },
  { icon: FiUnlock, title: "Start learning", text: "Everything in your plan opens straight away." },
];

const FAQS = [
  {
    key: "ends",
    label: "What happens when my plan ends?",
    children: "Plan courses and practice sets lock again until you renew. Your progress stays saved.",
  },
  {
    key: "bought",
    label: "What about courses I already bought?",
    children: "They stay yours. Anything you bought separately or your college assigned isn't affected by a plan.",
  },
  {
    key: "upgrade",
    label: "Can I upgrade later?",
    children: "Yes. When you upgrade, the unused part of your current plan is taken off the price.",
  },
  {
    key: "renew",
    label: "Will I be charged again automatically?",
    children: "No. You choose when to renew. Renewing early adds the new time after your current plan ends.",
  },
];

const perMonth = (price, days) => Math.round((Number(price) / Number(days)) * 30);
const savePercent = ({ mrp, price }) => (mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0);
const countText = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;
// "2 courses and 1 practice set", leaving out whichever is zero.
const itemsText = ({ courses = [], practiceSets = [] }) =>
  [
    courses.length && countText(courses.length, "course"),
    practiceSets.length && countText(practiceSets.length, "practice set"),
  ]
    .filter(Boolean)
    .join(" and ");

function PlanCard({ plan, days, current, paying, onBuy }) {
  const isFree = plan.key === "free";
  const isCurrent = current?.planKey === plan.key;
  // A plan not sold for the chosen duration shows its longest one instead.
  const option = plan.options.find((o) => o.days === days) || plan.options[plan.options.length - 1];
  const itemCount = (plan.courses?.length || 0) + (plan.practiceSets?.length || 0);
  const save = option ? savePercent(option) : 0;

  return (
    <div
      className={`relative flex flex-col rounded-2xl border bg-white p-6 ${
        plan.highlighted ? "border-2 border-blue-600 shadow-md" : "border-slate-200"
      }`}
    >
      {plan.highlighted && !isCurrent && (
        <span className="absolute -top-3 left-6 rounded-full bg-blue-600 px-3 py-0.5 text-[12px] font-semibold text-white">
          Most popular
        </span>
      )}
      <div className="flex items-center justify-between gap-2">
        <h2 className="m-0 text-[20px] font-bold text-slate-900">{plan.name}</h2>
        {(isCurrent || (isFree && !current)) && (
          <Tag color="green" className="!m-0">
            Your plan
          </Tag>
        )}
      </div>
      {plan.description && <p className="mb-0 mt-1 min-h-[42px] text-[14px] text-slate-500">{plan.description}</p>}

      <div className="mt-4 min-h-[92px]">
        {isFree || !option ? (
          <>
            <div className="text-[32px] font-bold leading-tight text-slate-900">₹0</div>
            <div className="text-[13px] text-slate-500">Free forever</div>
          </>
        ) : (
          <>
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-[32px] font-bold leading-tight text-slate-900">{formatPrice(option.payable)}</span>
              {option.mrp > option.payable && (
                <span className="text-[15px] text-slate-400 line-through">{formatPrice(option.mrp)}</span>
              )}
              {save > 0 && <span className="text-[13px] font-semibold text-emerald-600">Save {save}%</span>}
            </div>
            <div className="text-[13px] text-slate-500">
              for {durationLabel(option.days)} · about {formatPrice(perMonth(option.payable, option.days))} a month
            </div>
            {option.credit > 0 && (
              <div className="mt-1 text-[13px] font-medium text-emerald-600">
                Includes {formatPrice(option.credit)} credit from your current plan
              </div>
            )}
          </>
        )}
      </div>

      <div className="mt-4">
        {isFree ? (
          <Button size="large" block disabled>
            {current ? "Included in your plan" : "Your current plan"}
          </Button>
        ) : plan.blocked ? (
          <Button size="large" block disabled>
            Included in your plan
          </Button>
        ) : (
          <Button
            type={plan.highlighted ? "primary" : "default"}
            size="large"
            block
            loading={paying === plan.key}
            disabled={!!paying}
            onClick={() => onBuy(plan, option)}
            className="!font-semibold"
          >
            {isCurrent ? `Renew ${plan.name}` : current ? `Upgrade to ${plan.name}` : `Get ${plan.name}`}
          </Button>
        )}
      </div>

      <ul className="mb-0 mt-5 flex list-none flex-col gap-2.5 border-t border-slate-100 p-0 pt-5 text-[14px] text-slate-600">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <FiCheck className="mt-[3px] shrink-0 text-blue-600" aria-hidden="true" /> {feature}
          </li>
        ))}
        {itemCount > 0 && (
          <li className="flex items-start gap-2 font-semibold text-slate-800">
            <FiCheck className="mt-[3px] shrink-0 text-blue-600" aria-hidden="true" />
            Adds {itemsText(plan)}
          </li>
        )}
      </ul>
    </div>
  );
}

const Mark = ({ on }) =>
  on ? (
    <FiCheck className="mx-auto text-[18px] text-blue-600" aria-label="Included" />
  ) : (
    <FiMinus className="mx-auto text-[16px] text-slate-300" aria-label="Not included" />
  );

// Row by row: which plan opens what. A plan opens its own items and those of
// every plan below it.
function CompareTable({ plans, onOpenCourse }) {
  const paid = plans.filter((p) => p.key !== "free");
  const rowsOf = (field) =>
    paid.flatMap((owner) => (owner[field] || []).map((item) => ({ ...item, rank: owner.rank })));
  const sections = [
    { title: "Courses", rows: rowsOf("courses"), open: onOpenCourse },
    { title: "Practice sets", rows: rowsOf("practiceSets") },
  ].filter((s) => s.rows.length);
  if (!sections.length) return null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
      <h2 className="m-0 text-[18px] font-bold text-slate-900">What each plan opens</h2>
      <p className="mb-4 mt-1 text-[14px] text-slate-500">Each plan also includes everything in the plans before it.</p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[14px]">
          <thead>
            <tr className="border-b border-slate-200 text-slate-800">
              <th className="py-2.5 pr-3 text-left font-semibold">What you get</th>
              {plans.map((p) => (
                <th key={p.key} className="w-[48px] px-1 py-2.5 text-center text-[13px] font-semibold sm:w-[76px] sm:text-[14px]">
                  {p.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="py-2.5 pr-3 text-slate-700">All free courses and practice sets</td>
              {plans.map((p) => (
                <td key={p.key} className="py-2.5 text-center">
                  <Mark on />
                </td>
              ))}
            </tr>
            {sections.map((section) => (
              <SectionRows key={section.title} section={section} plans={plans} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SectionRows({ section, plans }) {
  return (
    <>
      <tr>
        <td colSpan={plans.length + 1} className="pb-1 pt-4 text-[12px] font-bold uppercase tracking-wide text-slate-400">
          {section.title}
        </td>
      </tr>
      {section.rows.map((row) => (
        <tr key={row._id} className="border-b border-slate-100">
          <td className="py-2.5 pr-3 text-slate-700">
            {section.open ? (
              <button
                type="button"
                onClick={() => section.open(row._id)}
                className="cursor-pointer border-none bg-transparent p-0 text-left text-[14px] text-slate-700 hover:text-blue-600 hover:underline"
              >
                {row.title}
              </button>
            ) : (
              row.title
            )}
          </td>
          {plans.map((p) => (
            <td key={p.key} className="py-2.5 text-center">
              <Mark on={p.rank >= row.rank} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// The student's plan comparison. Holds no data of its own: the page loads the
// plans and handles payment.
export default function PlansCompare({ plans, current, paying, onBuy, onOpenCourse }) {
  const durations = [...new Set(plans.flatMap((p) => (p.options || []).map((o) => o.days)))].sort((a, b) => a - b);
  const [days, setDays] = useState(durations[durations.length - 1]);

  return (
    <div className="flex flex-col gap-8">
      {durations.length > 1 && (
        <div className="flex flex-col items-center gap-2">
          <span className="text-[14px] font-medium text-slate-600">How long do you need it?</span>
          <Segmented
            size="large"
            value={days}
            onChange={setDays}
            options={durations.map((d) => ({ value: d, label: durationLabel(d) }))}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard key={plan.key} plan={plan} days={days} current={current} paying={paying} onBuy={onBuy} />
        ))}
      </div>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {STEPS.map(({ icon: Icon, title, text }, i) => (
          <div key={title} className="flex items-start gap-3 rounded-xl bg-white/70 p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <Icon aria-hidden="true" />
            </span>
            <div>
              <div className="text-[14px] font-semibold text-slate-800">
                {i + 1}. {title}
              </div>
              <div className="text-[13px] text-slate-500">{text}</div>
            </div>
          </div>
        ))}
      </section>

      <CompareTable plans={plans} onOpenCourse={onOpenCourse} />

      <section>
        <h2 className="mb-3 mt-0 text-[18px] font-bold text-slate-900">Common questions</h2>
        <Collapse items={FAQS} bordered={false} className="!bg-white" />
      </section>
    </div>
  );
}
