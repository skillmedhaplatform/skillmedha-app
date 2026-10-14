"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import { Button, Form, Input, InputNumber, Segmented, Select, Spin, Table, Tag, App } from "antd";
import styles from "../../practiceStyles.module.scss";
import PracticeBreadcrumbs from "../../Practice_utils/practiceBreadcrumbs";
import ThumbnailUpload from "../../Practice_utils/ThumbnailUpload";
import { PracticeSetCard, PracticeSetDetails } from "@/components/practiceSets/PracticeSetCard";
import {
  CATEGORY_OPTIONS,
  LEVEL_OPTIONS,
  STATUS_OPTIONS,
  categoryLabel,
  formatDuration,
  formatPrice,
  levelLabel,
  difficultyLabel,
} from "@/components/practiceSets/constants";
import {
  createPracticeBundle,
  fetchPracticeBundle,
  fetchPracticeSets,
  updatePracticeBundle,
} from "@/redux/slices/admin/cms/practiceSetsSlice";

const DEFAULT_VALUES = {
  title: "",
  description: "",
  thumbnail: "",
  topicsText: "",
  setIds: [],
  mrp: null,
  price: null,
  validityDays: 365,
  status: "draft",
};

// Mirrors the server's bundle summary so the preview matches what students
// will see before the bundle is even saved.
const summarise = (selectedSets, price) => {
  const topicTitles = [
    ...new Set(selectedSets.flatMap((s) => (s.topics || []).map((t) => t.topicTitle))),
  ];
  const individualTotal = selectedSets.reduce((sum, s) => sum + (s.price || 0), 0);
  return {
    totalQuestions: selectedSets.reduce((sum, s) => sum + (s.questionCount || 0), 0),
    totalMinutes: selectedSets.reduce((sum, s) => sum + (s.timeMinutes || 0), 0),
    levels: LEVEL_OPTIONS.map((l) => l.value).filter((l) => selectedSets.some((s) => s.level === l)),
    categories: CATEGORY_OPTIONS.map((c) => c.value).filter((c) =>
      selectedSets.some((s) => s.category === c)
    ),
    topicCount: topicTitles.length,
    topicTitles,
    individualTotal,
    savings: Math.max(0, individualTotal - (price || 0)),
  };
};

// Controlled antd Form field: value is the array of selected set ids.
function SetPicker({ value = [], onChange, sets, loading }) {
  const [category, setCategory] = useState();
  const [search, setSearch] = useState("");

  const visible = sets.filter(
    (s) =>
      (!category || s.category === category) &&
      (!search || s.title.toLowerCase().includes(search.toLowerCase()))
  );

  const columns = [
    {
      title: "Practice Set",
      dataIndex: "title",
      render: (title, record) => (
        <div>
          <div className="font-medium text-slate-800">{title}</div>
          <div className="text-xs text-slate-500">
            {(record.topics || []).map((t) => t.topicTitle).join(", ")}
          </div>
        </div>
      ),
    },
    { title: "Category", dataIndex: "category", render: categoryLabel },
    { title: "Level", dataIndex: "level", render: levelLabel },
    { title: "Difficulty", dataIndex: "difficulty", render: difficultyLabel },
    { title: "Qs", dataIndex: "questionCount" },
    { title: "Time", dataIndex: "timeMinutes", render: formatDuration },
    {
      title: "Price",
      key: "price",
      render: (_, r) => (r.plan === "premium" ? formatPrice(r.price) : <Tag color="green">FREE</Tag>),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (v) => (v === "published" ? <Tag color="success">Published</Tag> : <Tag>Draft</Tag>),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        <Input.Search
          placeholder="Search practice sets…"
          allowClear
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 260 }}
        />
        <Select
          placeholder="All categories"
          allowClear
          options={CATEGORY_OPTIONS}
          onChange={setCategory}
          style={{ width: 180 }}
        />
        <span className="self-center text-xs text-slate-500">{value.length} selected</span>
      </div>
      <Table
        rowKey="_id"
        size="small"
        columns={columns}
        dataSource={visible}
        loading={loading}
        scroll={{ x: 700, y: 320 }}
        pagination={false}
        rowSelection={{
          selectedRowKeys: value,
          preserveSelectedRowKeys: true,
          onChange: (keys) => onChange?.(keys),
        }}
        locale={{ emptyText: "No practice sets found — create practice sets first" }}
      />
    </div>
  );
}

function Section({ step, title, hint, children }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <div className="text-[15px] font-semibold text-slate-800">
          <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-50 text-xs font-bold text-amber-600">
            {step}
          </span>
          {title}
        </div>
        {hint && <div className="ml-8 mt-0.5 text-xs text-slate-500">{hint}</div>}
      </div>
      {children}
    </div>
  );
}

export default function PracticeBundleFormPage() {
  const { message } = App.useApp();
  const { bundleId } = useParams();
  const isNew = bundleId === "new";
  const router = useRouter();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { sets, status } = useSelector((state) => state.adminPracticeSets);

  const [initialValues, setInitialValues] = useState(isNew ? DEFAULT_VALUES : null);
  const [saving, setSaving] = useState(false);

  const values = Form.useWatch([], form) || DEFAULT_VALUES;
  const setIds = Form.useWatch("setIds", form);
  const price = Form.useWatch("price", form);

  useEffect(() => {
    dispatch(fetchPracticeSets({}))
      .unwrap()
      .catch((err) => message.error(err || "Failed to load practice sets"));
  }, [dispatch, message]);

  useEffect(() => {
    if (isNew) return;
    dispatch(fetchPracticeBundle(bundleId))
      .unwrap()
      .then((data) => setInitialValues({ ...DEFAULT_VALUES, ...data }))
      .catch((err) => {
        message.error(err || "Bundle not found");
        router.replace("/admin/practice/bundles");
      });
  }, [dispatch, isNew, router, bundleId, message]);

  const selectedSets = useMemo(
    () => (setIds || []).map((id) => sets.find((s) => s._id === id)).filter(Boolean),
    [setIds, sets]
  );
  const summary = useMemo(() => summarise(selectedSets, price), [selectedSets, price]);

  const handleSubmit = async (formValues) => {
    setSaving(true);
    try {
      if (isNew) {
        await dispatch(createPracticeBundle(formValues)).unwrap();
        message.success("Bundle created");
      } else {
        await dispatch(updatePracticeBundle({ id: bundleId, payload: formValues })).unwrap();
        message.success("Bundle updated");
      }
      router.push("/admin/practice/bundles");
    } catch (err) {
      message.error(err || "Failed to save bundle");
    } finally {
      setSaving(false);
    }
  };

  const previewItem = { ...DEFAULT_VALUES, ...values, summary };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <PracticeBreadcrumbs />
        <div className="flex gap-2">
          <Button onClick={() => router.push("/admin/practice/bundles")}>Cancel</Button>
          <Button
            type="primary"
            loading={saving}
            disabled={!initialValues}
            onClick={() => form.submit()}
          >
            {isNew ? "Create Bundle" : "Save Changes"}
          </Button>
        </div>
      </div>

      {!initialValues ? (
        <div className="flex w-full justify-center py-20">
          <Spin />
        </div>
      ) : (
        <div className="mt-4 grid w-full grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <Form
            form={form}
            layout="vertical"
            initialValues={initialValues}
            onFinish={handleSubmit}
            onFinishFailed={() => message.error("Please fix the highlighted fields")}
            requiredMark="optional"
            className="flex flex-col gap-4"
          >
            <Section step={1} title="Bundle details">
              <Form.Item
                name="title"
                label="Title"
                rules={[{ required: true, whitespace: true, message: "Enter a title" }]}
              >
                <Input placeholder="e.g. Reasoning Complete Masterclass Bundle" maxLength={80} showCount />
              </Form.Item>
              <Form.Item name="description" label="Short description">
                <Input.TextArea rows={2} maxLength={250} showCount placeholder="Optional" />
              </Form.Item>
              <Form.Item name="thumbnail" label="Card image">
                <ThumbnailUpload />
              </Form.Item>
            </Section>

            <Section
              step={2}
              title="Practice sets in this bundle"
              hint="Pick any sets — they can come from different subjects and categories. Buying the bundle unlocks all of them."
            >
              <Form.Item
                name="setIds"
                rules={[{ type: "array", min: 2, message: "Select at least 2 practice sets" }]}
              >
                <SetPicker sets={sets} loading={status === "loading" && !sets.length} />
              </Form.Item>
              <div className="grid grid-cols-2 gap-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 md:grid-cols-4">
                <div>
                  <div className="text-xs text-amber-600">Questions</div>
                  <b>{summary.totalQuestions}</b>
                </div>
                <div>
                  <div className="text-xs text-amber-600">Total time</div>
                  <b>{formatDuration(summary.totalMinutes)}</b>
                </div>
                <div>
                  <div className="text-xs text-amber-600">Topics</div>
                  <b>{summary.topicCount}</b>
                </div>
                <div>
                  <div className="text-xs text-amber-600">Bought separately</div>
                  <b>{formatPrice(summary.individualTotal)}</b>
                </div>
              </div>
              <Form.Item
                name="topicsText"
                label="Topics covered text"
                tooltip="Leave empty to show the topic count automatically"
                className="!mb-0 !mt-4"
              >
                <Input placeholder={summary.topicCount ? `e.g. All ${summary.topicCount}+ Reasoning topics` : "e.g. All 15+ Reasoning topics"} maxLength={80} />
              </Form.Item>
            </Section>

            <Section step={3} title="Pricing">
              <div className="grid grid-cols-1 gap-x-4 md:grid-cols-3">
                <Form.Item
                  name="price"
                  label="Bundle price (₹)"
                  rules={[{ required: true, message: "Enter the bundle price" }]}
                >
                  <InputNumber min={1} precision={0} style={{ width: "100%" }} placeholder="499" />
                </Form.Item>
                <Form.Item
                  name="mrp"
                  label="MRP (₹)"
                    tooltip="Original price, shown struck through on the card"
                  dependencies={["price"]}
                  rules={[
                    ({ getFieldValue }) => ({
                      validator: (_, value) =>
                        value && value < getFieldValue("price")
                          ? Promise.reject(new Error("MRP cannot be lower than the price"))
                          : Promise.resolve(),
                    }),
                  ]}
                >
                  <InputNumber min={1} precision={0} style={{ width: "100%" }} placeholder="1299" />
                </Form.Item>
                <Form.Item
                  name="validityDays"
                  label="Access validity (days)"
                  tooltip="0 means lifetime access"
                  rules={[{ required: true, message: "Enter validity" }]}
                >
                  <InputNumber min={0} precision={0} style={{ width: "100%" }} />
                </Form.Item>
              </div>
              {summary.individualTotal > 0 && price > 0 && (
                <div
                  className={`rounded-lg px-3 py-2 text-sm ${
                    summary.savings > 0 ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"
                  }`}
                >
                  {summary.savings > 0
                    ? `Students save ${formatPrice(summary.savings)} compared to buying these sets separately.`
                    : "The bundle costs the same or more than buying the sets separately — consider lowering the price."}
                </div>
              )}
            </Section>

            <Section step={4} title="Visibility" hint="Only published bundles are shown to students">
              <Form.Item name="status" label="Status" className="!mb-0">
                <Segmented options={STATUS_OPTIONS} />
              </Form.Item>
            </Section>
          </Form>

          <div className="xl:sticky xl:top-4 xl:self-start">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Student preview
            </div>
            <div className="flex flex-col gap-4">
              <div className="max-w-[280px]">
                <PracticeSetCard item={previewItem} isBundle />
              </div>
              <PracticeSetDetails item={previewItem} isBundle />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
