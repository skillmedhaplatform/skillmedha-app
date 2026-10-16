"use client";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import { Button, Form, Input, InputNumber, Segmented, Select, Spin, App } from "antd";
import styles from "../../practiceStyles.module.scss";
import PracticeBreadcrumbs from "../../Practice_utils/practiceBreadcrumbs";
import ThumbnailUpload from "../../Practice_utils/ThumbnailUpload";
import TopicPicker from "../../Practice_utils/TopicPicker";
import CompanyPicker from "../../Practice_utils/CompanyPicker";
import { PracticeSetCard, PracticeSetDetails } from "@/components/practiceSets/PracticeSetCard";
import {
  CATEGORY_OPTIONS,
  DIFFICULTY_OPTIONS,
  LEVEL_OPTIONS,
  PLAN_OPTIONS,
  STATUS_OPTIONS,
} from "@/components/practiceSets/constants";
import {
  createPracticeSet,
  fetchPracticeSet,
  getQuestionCount,
  updatePracticeSet,
} from "@/redux/slices/admin/cms/practiceSetsSlice";

const DEFAULT_VALUES = {
  title: "",
  description: "",
  thumbnail: "",
  plan: "free",
  level: "beginner",
  difficulty: "mixed",
  category: "nontechnical",
  topics: [],
  questionCount: 20,
  timeMinutes: 30,
  mrp: null,
  price: null,
  validityDays: 365,
  status: "draft",
};

function Section({ step, title, hint, children }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <div className="text-[15px] font-semibold text-slate-800">
          <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
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

export default function PracticeSetFormPage() {
  const { message } = App.useApp();
  const { setId } = useParams();
  const isNew = setId === "new";
  const router = useRouter();
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const [initialValues, setInitialValues] = useState(isNew ? DEFAULT_VALUES : null);
  const [saving, setSaving] = useState(false);
  const [available, setAvailable] = useState(null);
  const [counting, setCounting] = useState(false);

  const values = Form.useWatch([], form) || DEFAULT_VALUES;
  const plan = Form.useWatch("plan", form);
  const category = Form.useWatch("category", form);
  const topics = Form.useWatch("topics", form);
  const difficulty = Form.useWatch("difficulty", form) || "mixed";

  useEffect(() => {
    if (isNew) return;
    dispatch(fetchPracticeSet(setId))
      .unwrap()
      .then((data) => setInitialValues({ ...DEFAULT_VALUES, ...data }))
      .catch((err) => {
        message.error(err || "Practice set not found");
        router.replace("/admin/practice/practice-sets");
      });
  }, [dispatch, isNew, router, setId, message]);

  // Only the ids matter to the server: { subjectId, topicId?, subTopicId?, section? }.
  const toSelections = (list) =>
    (list || []).map(({ subjectId, topicId, subTopicId, section }) => ({
      subjectId,
      ...(topicId ? { topicId } : {}),
      ...(subTopicId ? { subTopicId } : {}),
      ...(section ? { section } : {}),
    }));
  const topicKey = JSON.stringify(toSelections(topics));

  // The server is the source of truth for how many questions exist in the
  // selection at the chosen difficulty (questions live in several tenant
  // databases, and coding sets only count coding questions).
  useEffect(() => {
    if (topicKey === "[]") {
      setAvailable(0);
      return;
    }
    let cancelled = false;
    setCounting(true);
    const timer = setTimeout(() => {
      getQuestionCount({ selections: JSON.parse(topicKey), difficulty, category })
        .then((count) => !cancelled && setAvailable(count))
        .catch(() => !cancelled && setAvailable(null))
        .finally(() => !cancelled && setCounting(false));
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [topicKey, difficulty, category]);

  useEffect(() => {
    if (initialValues && available != null && form.isFieldTouched("questionCount")) {
      form.validateFields(["questionCount"]).catch(() => {});
    }
  }, [available, form, initialValues]);

  const handleSubmit = async (formValues) => {
    const payload = {
      ...formValues,
      topics: toSelections(formValues.topics),
    };
    setSaving(true);
    try {
      if (isNew) {
        await dispatch(createPracticeSet(payload)).unwrap();
        message.success("Practice set created");
      } else {
        await dispatch(updatePracticeSet({ id: setId, payload })).unwrap();
        message.success("Practice set updated");
      }
      router.push("/admin/practice/practice-sets");
    } catch (err) {
      message.error(err || "Failed to save practice set");
    } finally {
      setSaving(false);
    }
  };

  const previewItem = { ...DEFAULT_VALUES, ...values, topics: values.topics || [] };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <PracticeBreadcrumbs />
        <div className="flex gap-2">
          <Button onClick={() => router.push("/admin/practice/practice-sets")}>Cancel</Button>
          <Button
            type="primary"
            loading={saving}
            disabled={!initialValues}
            onClick={() => form.submit()}
          >
            {isNew ? "Create Practice Set" : "Save Changes"}
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
            // Sources belong to one category (subjects vs company tests), so
            // switching category starts the selection over.
            onValuesChange={(changed) => {
              if ("category" in changed) form.setFieldValue("topics", []);
            }}
            requiredMark="optional"
            className="flex flex-col gap-4"
          >
            <Section step={1} title="Card details" hint="What the student sees on the card">
              <Form.Item
                name="title"
                label="Title"
                rules={[{ required: true, whitespace: true, message: "Enter a title" }]}
              >
                <Input placeholder="e.g. Reasoning - Beginner Level" maxLength={80} showCount />
              </Form.Item>
              <Form.Item name="description" label="Short description">
                <Input.TextArea rows={2} maxLength={250} showCount placeholder="Optional" />
              </Form.Item>
              <Form.Item name="thumbnail" label="Card image">
                <ThumbnailUpload />
              </Form.Item>
              <Form.Item
                name="category"
                label="Category"
                rules={[{ required: true }]}
                tooltip="Company-wise sets use the company tests from Practice → Company-wise"
              >
                <Segmented options={CATEGORY_OPTIONS} />
              </Form.Item>
              <Form.Item name="level" label="Level" rules={[{ required: true }]} className="md:max-w-[50%]">
                <Select options={LEVEL_OPTIONS} />
              </Form.Item>
            </Section>

            <Section
              step={2}
              title="Questions"
              hint={
                category === "company"
                  ? "Pick a whole company test or individual sections. Students get random questions from them on every attempt."
                  : "Pick a whole subject, topics or individual subtopics from your question bank. Students get random questions from them on every attempt."
              }
            >
              <Form.Item
                name="topics"
                rules={[
                  {
                    type: "array",
                    min: 1,
                    message:
                      category === "company"
                        ? "Select a company test or section"
                        : "Select a subject, topic or subtopic",
                  },
                ]}
              >
                {category === "company" ? (
                  <CompanyPicker difficulty={difficulty} />
                ) : (
                  <TopicPicker category={category} difficulty={difficulty} />
                )}
              </Form.Item>

              <div className="mb-4 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">
                {counting ? (
                  "Counting questions…"
                ) : available == null ? (
                  "Could not count questions right now"
                ) : (
                  <>
                    <b>{available}</b>{" "}
                    {difficulty === "mixed" ? "" : `${DIFFICULTY_OPTIONS.find((d) => d.value === difficulty)?.label} `}
                    {category === "coding" ? "coding " : ""}questions available in your selection
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 gap-x-4 md:grid-cols-3">
                <Form.Item
                  name="difficulty"
                  label="Difficulty"
                  tooltip="Questions are picked only from this difficulty (set on each question in the question editor)"
                  rules={[{ required: true }]}
                >
                  <Select options={DIFFICULTY_OPTIONS} />
                </Form.Item>
                <Form.Item
                  name="questionCount"
                  label="Questions per attempt"
                  dependencies={["topics", "difficulty"]}
                  rules={[
                    { required: true, message: "Enter the number of questions" },
                    {
                      validator: (_, value) =>
                        available != null && value > available
                          ? Promise.reject(new Error(`Only ${available} questions are available`))
                          : Promise.resolve(),
                    },
                  ]}
                >
                  <InputNumber min={1} precision={0} style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item
                  name="timeMinutes"
                  label="Time limit (minutes)"
                  rules={[{ required: true, message: "Enter the time limit" }]}
                >
                  <InputNumber min={1} max={600} precision={0} style={{ width: "100%" }} />
                </Form.Item>
              </div>
            </Section>

            <Section step={3} title="Plan & pricing">
              <Form.Item name="plan" label="Plan" rules={[{ required: true }]}>
                <Segmented options={PLAN_OPTIONS} />
              </Form.Item>
              {plan === "premium" && (
                <div className="grid grid-cols-1 gap-x-4 md:grid-cols-3">
                  <Form.Item
                    name="price"
                    label="Offer price (₹)"
                    rules={[{ required: true, message: "Enter the price" }]}
                  >
                    <InputNumber min={1} precision={0} style={{ width: "100%" }} placeholder="149" />
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
                    <InputNumber min={1} precision={0} style={{ width: "100%" }} placeholder="299" />
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
              )}
              {plan === "free" && (
                <div className="text-xs text-slate-500">
                  Free sets are open to every student, with random questions on each attempt.
                </div>
              )}
            </Section>

            <Section step={4} title="Visibility" hint="Only published sets are shown to students">
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
                <PracticeSetCard item={previewItem} />
              </div>
              <PracticeSetDetails item={previewItem} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
