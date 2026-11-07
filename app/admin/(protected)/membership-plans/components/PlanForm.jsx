"use client";
import React, { useMemo, useState } from "react";
import { Button, Checkbox, Empty, Form, Input, InputNumber, Select, Switch, Tabs, Tag } from "antd";
import { DeleteOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { durationLabel, formatPrice } from "@/components/membership/plans";

const DURATIONS = [30, 90, 180, 365];
const DEFAULT_OPTIONS = [{ days: 90 }, { days: 180 }, { days: 365 }];

// Items already free can't be sold in a plan; hidden ones stay listed only if
// they're already in this plan, so they can be taken out.
const pickableRows = (rows, plan) => rows.filter((row) => row.access !== "free" && (row.visible || row.minPlan === plan.key));

export const selectedIds = (rows, plan) => rows.filter((row) => row.minPlan === plan.key).map((row) => row.itemId);

// A searchable checklist; works as a Form.Item control (value / onChange).
function ItemPicker({ rows, plans, plan, emptyText, value = [], onChange }) {
  const [search, setSearch] = useState("");
  const shown = useMemo(() => {
    const query = search.trim().toLowerCase();
    return rows.filter((row) => !query || String(row.title || "").toLowerCase().includes(query));
  }, [rows, search]);
  const selected = new Set(value);
  const planName = (key) => plans.find((p) => p.key === key)?.name;

  const toggle = (id, on) => onChange(on ? [...value, id] : value.filter((v) => v !== id));
  const allShownOn = shown.length > 0 && shown.every((row) => selected.has(row.itemId));
  const toggleShown = (on) => {
    const ids = shown.map((row) => row.itemId);
    onChange(on ? [...new Set([...value, ...ids])] : value.filter((v) => !ids.includes(v)));
  };

  if (!rows.length) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyText} />;

  return (
    <div className="rounded-lg border border-slate-200">
      <div className="flex items-center gap-3 border-b border-slate-100 p-2.5">
        <Input
          allowClear
          size="small"
          prefix={<SearchOutlined />}
          placeholder="Search by title"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Checkbox checked={allShownOn} onChange={(e) => toggleShown(e.target.checked)} className="shrink-0">
          All
        </Checkbox>
      </div>
      <ul className="m-0 max-h-[280px] list-none divide-y divide-slate-100 overflow-y-auto p-0">
        {shown.map((row) => {
          const elsewhere = row.minPlan && row.minPlan !== plan.key ? planName(row.minPlan) : null;
          return (
            <li key={row.itemId}>
              <label className="flex cursor-pointer items-center gap-2.5 px-3 py-2 hover:bg-slate-50">
                <Checkbox checked={selected.has(row.itemId)} onChange={(e) => toggle(row.itemId, e.target.checked)} />
                <span className="min-w-0 flex-1 truncate text-[13px] text-slate-700">{row.title || "Untitled"}</span>
                {elsewhere && !selected.has(row.itemId) && <Tag className="!m-0">In {elsewhere}</Tag>}
                {row.price > 0 && <span className="shrink-0 text-[12px] text-slate-400">{formatPrice(row.price)}</span>}
              </label>
            </li>
          );
        })}
        {!shown.length && <li className="px-3 py-4 text-center text-[13px] text-slate-400">Nothing matches your search</li>}
      </ul>
    </div>
  );
}

// "About ₹333 a month · 33% off", updating as the admin types.
function PriceHint({ name }) {
  const form = Form.useFormInstance();
  const row = Form.useWatch(["options", name], form);
  const price = Number(row?.price);
  if (!(price > 0) || !(row?.days > 0)) return null;
  const off = row.mrp > price ? Math.round(((row.mrp - price) / row.mrp) * 100) : 0;
  return (
    <div className="mb-3 text-[12px] text-slate-500">
      About {formatPrice(Math.round((price / row.days) * 30))} a month{off > 0 && ` · ${off}% off`}
    </div>
  );
}

// The fields of one plan, in three short tabs. All tabs stay mounted so a save
// always includes every field.
export default function PlanForm({ form, plan, plans, content, onFinish }) {
  const isFree = plan.key === "free";
  const courses = content ? pickableRows(content.courses, plan) : [];
  const sets = content ? pickableRows(content.practiceSets, plan) : [];
  const courseIds = Form.useWatch("courseIds", form) || [];
  const setIds = Form.useWatch("practiceSetIds", form) || [];

  const durationChoices = useMemo(() => {
    const days = new Set([...DURATIONS, ...(plan.options || []).map((o) => o.days)]);
    return [...days].sort((a, b) => a - b).map((d) => ({ value: d, label: durationLabel(d) }));
  }, [plan.options]);

  const details = (
    <>
      <Form.Item name="name" label="Plan name" rules={[{ required: true, message: "Enter a name" }]}>
        <Input maxLength={40} />
      </Form.Item>
      <Form.Item name="description" label="Short description">
        <Input.TextArea rows={2} maxLength={300} />
      </Form.Item>
      <Form.Item name="features" label="Points shown to students" extra="One point per line, up to 12.">
        <Input.TextArea rows={4} placeholder={"Everything in Prime\nCourses marked Pro"} />
      </Form.Item>
      {!isFree && (
        <Form.Item name="highlighted" label="Show a Most popular label" valuePropName="checked">
          <Switch />
        </Form.Item>
      )}
    </>
  );

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        name: plan.name,
        description: plan.description,
        features: (plan.features || []).join("\n"),
        highlighted: plan.highlighted,
        options: plan.options?.length ? plan.options : DEFAULT_OPTIONS,
        courseIds: content ? selectedIds(content.courses, plan) : [],
        practiceSetIds: content ? selectedIds(content.practiceSets, plan) : [],
      }}
    >
      {isFree ? (
        details
      ) : (
        <Tabs
          items={[
            {
              key: "content",
              forceRender: true,
              label: `What it opens (${courseIds.length + setIds.length})`,
              children: (
                <>
                  <p className="mb-3 mt-0 text-[13px] text-slate-500">
                    Tick what this plan opens. Higher plans include it automatically, and buying it separately still
                    works. Free items aren&apos;t listed because they&apos;re already open to everyone.
                  </p>
                  <Form.Item name="courseIds" label={`Courses (${courseIds.length} selected)`}>
                    <ItemPicker rows={courses} plans={plans} plan={plan} emptyText="No paid courses to choose" />
                  </Form.Item>
                  <Form.Item name="practiceSetIds" label={`Practice sets (${setIds.length} selected)`}>
                    <ItemPicker rows={sets} plans={plans} plan={plan} emptyText="No paid practice sets to choose" />
                  </Form.Item>
                </>
              ),
            },
            {
              key: "prices",
              forceRender: true,
              label: "Prices",
              children: (
                <Form.List name="options">
                  {(fields, { add, remove }) => (
                    <>
                      <p className="mb-3 mt-0 text-[13px] text-slate-500">
                        Add a price for each duration students can choose. MRP is optional and shows crossed out.
                      </p>
                      {fields.map(({ key, name }) => (
                        <div key={key}>
                          <div className="mb-1 flex items-start gap-2">
                            <Form.Item
                              name={[name, "days"]}
                              label={name === 0 ? "Duration" : undefined}
                              className="!mb-0 flex-1"
                              rules={[{ required: true, message: "Choose" }]}
                            >
                              <Select options={durationChoices} placeholder="Duration" aria-label="Duration" />
                            </Form.Item>
                            <Form.Item
                              name={[name, "price"]}
                              label={name === 0 ? "Price" : undefined}
                              className="!mb-0 flex-1"
                              rules={[{ required: true, message: "Enter price" }]}
                            >
                              <InputNumber min={1} prefix="₹" className="!w-full" aria-label="Price" />
                            </Form.Item>
                            <Form.Item
                              name={[name, "mrp"]}
                              label={name === 0 ? "MRP" : undefined}
                              className="!mb-0 flex-1"
                            >
                              <InputNumber min={1} prefix="₹" className="!w-full" aria-label="Original price" />
                            </Form.Item>
                            <Button
                              type="text"
                              danger
                              aria-label="Remove this price"
                              icon={<DeleteOutlined />}
                              onClick={() => remove(name)}
                              className={name === 0 ? "!mt-[30px]" : ""}
                            />
                          </div>
                          <PriceHint name={name} />
                        </div>
                      ))}
                      <Button type="dashed" block icon={<PlusOutlined />} onClick={() => add()}>
                        Add another duration
                      </Button>
                    </>
                  )}
                </Form.List>
              ),
            },
            { key: "details", forceRender: true, label: "Name and points", children: details },
          ]}
        />
      )}
    </Form>
  );
}
