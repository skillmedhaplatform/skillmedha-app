"use client";
import React, { useEffect, useState } from "react";
import { App, Button, Checkbox, Empty, Select, Spin, Tag } from "antd";
import { DownOutlined, RightOutlined } from "@ant-design/icons";
import {
  getSubjectsByType,
  getSubtopicsByTopic,
  getTopicsBySubject,
} from "@/redux/slices/admin/cms/practiceSetsSlice";

// Controlled antd Form field. `value` is the list of question sources:
//   { subjectId, scope: "subject" }                         whole subject
//   { subjectId, topicId, scope: "topic" }                  a topic (incl. its subtopics)
//   { subjectId, topicId, subTopicId, scope: "subtopic" }   a single subtopic
// each with display titles. Subjects without topics (e.g. coding) can only be
// picked whole; topics without subtopics simply have nothing to expand.
// Counts shown follow `difficulty`.

const scopeOf = (sel) => sel.scope || (sel.subTopicId ? "subtopic" : sel.topicId ? "topic" : "subject");

// Questions without a difficulty count as medium (as the editor shows them),
// matching the server's count for the set.
const countFor = (item, difficulty) => {
  const total = item?.totalQuestions || 0;
  if (difficulty === "mixed" || item?.easyQuestions === undefined) return total;
  if (difficulty === "medium") {
    return Math.max(0, total - (item.easyQuestions || 0) - (item.hardQuestions || 0));
  }
  return item[`${difficulty}Questions`] || 0;
};

const selectionLabel = (sel) => {
  const scope = scopeOf(sel);
  if (scope === "subject") return `${sel.subjectTitle} (whole subject)`;
  if (scope === "topic") return `${sel.subjectTitle} › ${sel.topicTitle}`;
  return `${sel.subjectTitle} › ${sel.parentTopicTitle || "Topic"} › ${sel.topicTitle}`;
};

export default function TopicPicker({ value = [], onChange, category, difficulty = "mixed" }) {
  const { message } = App.useApp();
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState();
  const [topics, setTopics] = useState([]);
  const [subtopicsByTopic, setSubtopicsByTopic] = useState({});
  const [expanded, setExpanded] = useState({});
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);

  useEffect(() => {
    if (!category) return;
    let cancelled = false;
    setLoadingSubjects(true);
    setSubjectId(undefined);
    setTopics([]);
    getSubjectsByType(category)
      .then((data) => !cancelled && setSubjects(data))
      .catch(() => message.error("Failed to load subjects"))
      .finally(() => !cancelled && setLoadingSubjects(false));
    return () => {
      cancelled = true;
    };
  }, [category, message]);

  useEffect(() => {
    if (!subjectId) return;
    let cancelled = false;
    setLoadingTopics(true);
    setExpanded({});
    getTopicsBySubject(subjectId)
      .then((data) => !cancelled && setTopics(data))
      .catch(() => message.error("Failed to load topics"))
      .finally(() => !cancelled && setLoadingTopics(false));
    return () => {
      cancelled = true;
    };
  }, [subjectId, message]);

  const subject = subjects.find((s) => s._id === subjectId);
  const subjectTitle = subject?.title || "";

  const isWholeSubject = value.some((v) => scopeOf(v) === "subject" && v.subjectId === subjectId);
  const isTopicSelected = (topicId) => value.some((v) => scopeOf(v) === "topic" && v.topicId === topicId);
  const isSubtopicSelected = (subTopicId) =>
    value.some((v) => scopeOf(v) === "subtopic" && v.subTopicId === subTopicId);

  const toggleSubject = (checked) => {
    // Whole subject replaces any topic / subtopic picks inside it.
    const others = value.filter((v) => v.subjectId !== subjectId);
    onChange?.(
      checked
        ? [...others, { subjectId, scope: "subject", subjectTitle, topicTitle: `All of ${subjectTitle}` }]
        : others
    );
  };

  const toggleTopic = (topic, checked) => {
    // A whole topic replaces its individual subtopic picks.
    const others = value.filter((v) => v.topicId !== topic._id);
    onChange?.(
      checked
        ? [...others, { subjectId, topicId: topic._id, scope: "topic", subjectTitle, topicTitle: topic.title }]
        : others
    );
  };

  const toggleSubtopic = (topic, sub, checked) => {
    const others = value.filter((v) => v.subTopicId !== sub._id);
    onChange?.(
      checked
        ? [
            ...others,
            {
              subjectId,
              topicId: topic._id,
              subTopicId: sub._id,
              scope: "subtopic",
              subjectTitle,
              parentTopicTitle: topic.title,
              topicTitle: sub.title,
            },
          ]
        : others
    );
  };

  const toggleExpand = async (topic) => {
    const open = !expanded[topic._id];
    setExpanded((prev) => ({ ...prev, [topic._id]: open }));
    if (open && !subtopicsByTopic[topic._id]) {
      setSubtopicsByTopic((prev) => ({ ...prev, [topic._id]: "loading" }));
      try {
        const subs = await getSubtopicsByTopic(topic._id);
        setSubtopicsByTopic((prev) => ({ ...prev, [topic._id]: subs }));
      } catch {
        message.error("Failed to load subtopics");
        setSubtopicsByTopic((prev) => ({ ...prev, [topic._id]: undefined }));
      }
    }
  };

  const qs = (item) => (
    <span className="text-xs text-slate-400">
      ({countFor(item, difficulty)}
      {difficulty === "mixed" || item?.easyQuestions === undefined ? "" : ` ${difficulty}`} Qs)
    </span>
  );

  const renderSubtopics = (topic, topicChecked) => {
    const subs = subtopicsByTopic[topic._id];
    if (subs === "loading") {
      return (
        <div className="py-2 pl-7">
          <Spin size="small" />
        </div>
      );
    }
    if (!subs?.length) {
      return <div className="py-1.5 pl-7 text-xs text-slate-400">No subtopics — pick the whole topic</div>;
    }
    return (
      <div className="flex flex-col gap-1 py-1.5 pl-7">
        {subs.map((sub) => (
          <Checkbox
            key={sub._id}
            checked={topicChecked || isSubtopicSelected(sub._id)}
            disabled={topicChecked || (!sub.totalQuestions && !isSubtopicSelected(sub._id))}
            onChange={(e) => toggleSubtopic(topic, sub, e.target.checked)}
          >
            {sub.title} {qs(sub)}
          </Checkbox>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <Select
        placeholder={category ? "Choose a subject" : "Choose a category first"}
        disabled={!category}
        loading={loadingSubjects}
        value={subjectId}
        onChange={setSubjectId}
        options={subjects.map((s) => ({
          value: s._id,
          label: `${s.title}${s.totalQuestions != null ? ` (${s.totalQuestions} Qs)` : ""}`,
        }))}
        notFoundContent={loadingSubjects ? <Spin size="small" /> : "No subjects in this category"}
        showSearch
        optionFilterProp="label"
        style={{ maxWidth: 360 }}
      />

      {subjectId && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          {loadingTopics ? (
            <div className="py-4 text-center">
              <Spin size="small" />
            </div>
          ) : (
            <>
              <Checkbox
                checked={isWholeSubject}
                disabled={!subject?.totalQuestions && !isWholeSubject}
                onChange={(e) => toggleSubject(e.target.checked)}
                className="font-semibold"
              >
                Whole subject — all questions in {subjectTitle} {qs(subject)}
              </Checkbox>

              {topics.length ? (
                <div className="mt-2 border-t border-slate-200 pt-2">
                  <div className="mb-1 text-xs font-semibold text-slate-500">Or pick topics / subtopics</div>
                  <div className="flex flex-col">
                    {topics.map((topic) => {
                      const topicChecked = isWholeSubject || isTopicSelected(topic._id);
                      const pickedSubs = value.filter(
                        (v) => scopeOf(v) === "subtopic" && v.topicId === topic._id
                      ).length;
                      return (
                        <div key={topic._id}>
                          <div className="flex items-center gap-1">
                            <Button
                              type="text"
                              size="small"
                              icon={expanded[topic._id] ? <DownOutlined /> : <RightOutlined />}
                              onClick={() => toggleExpand(topic)}
                              aria-label="Show subtopics"
                            />
                            <Checkbox
                              checked={topicChecked}
                              indeterminate={!topicChecked && pickedSubs > 0}
                              disabled={isWholeSubject || (!topic.totalQuestions && !topicChecked)}
                              onChange={(e) => toggleTopic(topic, e.target.checked)}
                            >
                              {topic.title} {qs(topic)}
                              {pickedSubs > 0 && !topicChecked && (
                                <span className="ml-1 text-xs text-blue-600">· {pickedSubs} subtopic(s)</span>
                              )}
                            </Checkbox>
                          </div>
                          {expanded[topic._id] && renderSubtopics(topic, topicChecked)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-xs text-slate-500">
                  This subject has no topics — its questions are picked from the whole subject.
                </div>
              )}

              {!subject?.totalQuestions && !topics.length && (
                <Empty
                  className="!my-2"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No questions in this subject yet"
                />
              )}
            </>
          )}
        </div>
      )}

      <div>
        <div className="mb-1.5 text-xs font-semibold text-slate-600">Selected ({value.length})</div>
        {value.length ? (
          <div className="flex flex-wrap gap-1.5">
            {value.map((sel) => (
              <Tag
                key={`${sel.subjectId}|${sel.topicId || ""}|${sel.subTopicId || ""}`}
                closable
                color={scopeOf(sel) === "subject" ? "purple" : scopeOf(sel) === "topic" ? "blue" : "cyan"}
                onClose={(e) => {
                  e.preventDefault();
                  onChange?.(value.filter((v) => v !== sel));
                }}
              >
                {selectionLabel(sel)}
              </Tag>
            ))}
          </div>
        ) : (
          <span className="text-xs text-slate-400">Nothing selected yet</span>
        )}
      </div>
    </div>
  );
}
