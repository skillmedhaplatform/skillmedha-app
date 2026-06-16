// AIQuestionModal.jsx
"use client";
import React, { useState } from "react";
import {
  Modal,
  Button,
  Form,
  Input,
  Select,
  InputNumber,
  Spin,
  message,
  Collapse,
} from "antd";
import { useDispatch } from "react-redux";
import {
  generateAiQuestion,
  updateJobAssessment,
} from "@/redux/slices/company/skillMedhaData";
import { addQuestions } from "@/redux/slices/admin/cms/skillsSlice";
import { useSelector } from "react-redux";

const { TextArea } = Input;
const { Panel } = Collapse;

const AI_QUESTION_TYPE_OPTIONS = [
  { value: "Single Choice", label: "Single Choice" },
  { value: "Multiple Choice", label: "Multiple Choice" },
  { value: "Text", label: "Text" },
];

// Render options for a questionContent + answer shape
function RenderOptions({ questionContent, answer }) {
  if (!questionContent) return null;
  const optionKeys = Object.keys(questionContent)
    .filter((k) => k.toLowerCase().startsWith("option"))
    .sort((a, b) => {
      const ai = parseInt(a.replace(/\D/g, ""), 10);
      const bi = parseInt(b.replace(/\D/g, ""), 10);
      return (ai || 0) - (bi || 0);
    });

  const multiple = answer?.multipleChoice || {};
  const single = answer?.singleChoice || {};

  return (
    <div style={{ marginTop: 8 }}>
      {optionKeys.map((k) => {
        const text = questionContent[k];
        const isCorrect = !!multiple[k] || !!single[k];
        return (
          <div
            key={k}
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              padding: "2px 0",
            }}
          >
            <span style={{ fontWeight: 600 }}>{k}:</span>
            <span
              style={{
                color: isCorrect ? "#3f8600" : "inherit",
                fontWeight: isCorrect ? 600 : 400,
              }}
            >
              {text}
            </span>
            {isCorrect && <span style={{ color: "#3f8600" }}>(Correct)</span>}
          </div>
        );
      })}
      {answer?.explanation && (
        <div style={{ marginTop: 8, fontStyle: "italic", color: "#666" }}>
          Explanation: {answer.explanation}
        </div>
      )}
    </div>
  );
}

export default function AIQuestionModal({ open, onClose, aId }) {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState([]);
  const [showForm, setShowForm] = useState(true);
  const [addLoading, setAddLoading] = useState(false);
  const singleJobAssessment = useSelector(
    (s) => s.companySkillMedhaData?.singleJobAssessment
  );
  // Unified busy flag to lock UI and modal closing while async work is running
  const busy = loading || addLoading;

  const handleGenerate = async (values) => {
    setLoading(true);
    try {
      const res = await dispatch(
        generateAiQuestion({
          noOfQuestion: values.noOfQuestion,
          questionType: values.questionType,
          textPara: values.textPara,
        })
      ).unwrap(); // returns payload or throws on error
      const apiQuestions = res?.data?.questions || [];
      setGenerated(apiQuestions);
      setShowForm(false);
      message.success(`Generated ${apiQuestions.length} questions`);
    } catch (err) {
      console.error(err);
      message.error("Failed to generate questions");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (idx) => {
    setGenerated((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAdd = async () => {
    if (!generated?.length) return;

    setAddLoading(true);
    try {
      // Ensure every payload includes type: "skill"
      const createPromises = generated.map((q) =>
        dispatch(addQuestions({ ...q, type: "skill" })).unwrap()
      );

      const results = await Promise.allSettled(createPromises);

      const successes = results
        .filter((r) => r.status === "fulfilled")
        .map((r) => r.value);
      const failures = results
        .filter((r) => r.status === "rejected")
        .map((r) => r.reason);

      console.log("Created questions (fulfilled):", successes);
      console.log("Create failures (rejected):", failures);

      const createdIds = successes
        .map((payload) => payload?.data?._id)
        .filter(Boolean);

      if (createdIds.length && aId) {
        // Use Set to remove duplicates
        const uniqueQuestionIds = [
          ...new Set([
            ...createdIds,
            ...(singleJobAssessment?.questionIds || []),
          ]),
        ];

        await dispatch(
          updateJobAssessment({
            questionIds: uniqueQuestionIds,
            aId,
          })
        ).unwrap();
      }

      if (successes.length) {
        message.success(
          `Added ${successes.length} of ${generated.length} questions`
        );
      }
      if (failures.length) {
        message.warning(`${failures.length} failed to add`);
      }

      // Reset and close
      setGenerated([]);
      setShowForm(true);
      form.resetFields();
      onClose();
    } catch (err) {
      console.error(err);
      message.error("Failed to add questions");
    } finally {
      setAddLoading(false);
    }
  };

  const handleCancel = () => {
    // Block cancel when busy
    if (busy) {
      message.info(
        "An operation is in progress. Please wait for it to finish."
      );
      return;
    }
    setGenerated([]);
    setShowForm(true);
    form.resetFields();
    onClose();
  };

  const handleGenerateAgain = () => {
    if (busy) {
      message.info(
        "An operation is in progress. Please wait for it to finish."
      );
      return;
    }
    // Bring form back for another generation
    setGenerated([]);
    setShowForm(true);
  };

  return (
    <Modal
      title="Generate Questions using AI"
      open={open}
      onCancel={handleCancel}
      centered
      width={800}
      footer={null} // custom content controls actions
      destroyOnHidden={true}
      mask={{ closable: !busy }}
      closable={!busy} // disable close (X) while busy
      keyboard={!busy} // disable ESC close while busy
    >
      {showForm && (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleGenerate}
          initialValues={{
            noOfQuestion: 3,
            questionType: "Multiple Choice",
            textPara:
              "Next.js is a React framework that enables server-side rendering and static site generation. It is widely used for building SEO-friendly and scalable web applications.",
          }}
        >
          <Form.Item
            name="textPara"
            label="Text Paragraph"
            rules={[
              { required: true, message: "Please enter the text paragraph" },
              { min: 10, message: "Must be at least 10 characters" },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Enter source text for question generation"
              disabled={busy}
            />
          </Form.Item>

          <Form.Item
            name="questionType"
            label="Question Type"
            rules={[{ required: true, message: "Please select question type" }]}
          >
            <Select
              options={AI_QUESTION_TYPE_OPTIONS}
              disabled={busy}
            />
          </Form.Item>

          <Form.Item
            name="noOfQuestion"
            label="Number of Questions"
            rules={[
              { required: true, message: "Please enter number of questions" },
              {
                type: "number",
                min: 1,
                max: 12, // enforce <= 12
                message: "Must be between 1-12",
              },
            ]}
          >
            <InputNumber
              min={1}
              max={12} // enforce <= 12 in the control
              style={{ width: "100%" }}
              disabled={busy}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Button
              onClick={handleCancel}
              style={{ marginRight: 8 }}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              disabled={busy}
            >
              {loading ? "Generating..." : "Generate"}
            </Button>
          </Form.Item>
        </Form>
      )}

      {loading && (
        <div style={{ textAlign: "center", padding: 16 }}>
          <Spin size="large" />
          <p style={{ marginTop: 8, color: "#666" }}>
            AI is generating questions...
          </p>
        </div>
      )}

      {!loading && !showForm && (
        <div style={{ marginTop: 8 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <strong>Preview ({generated.length})</strong>
            <div style={{ display: "flex", gap: 8 }}>
              <Button onClick={handleGenerateAgain} disabled={busy}>
                Generate Again
              </Button>
              <Button
                type="primary"
                onClick={handleAdd}
                loading={addLoading}
                disabled={busy || generated.length === 0}
              >
                {addLoading ? "Adding..." : "Add Questions"}
              </Button>
            </div>
          </div>

          {generated.length === 0 ? (
            <div style={{ padding: 16, textAlign: "center", color: "#666" }}>
              No questions to show. Click Generate Again to create more or
              Cancel to close.
            </div>
          ) : (
            <Collapse bordered={false} ghost>
              {generated.map((q, idx) => (
                <Panel
                  key={`ai_${idx}`}
                  header={
                    <div
                      style={{ display: "flex", gap: 12, alignItems: "center" }}
                    >
                      <span style={{ fontWeight: 600 }}>{`Question ${
                        idx + 1
                      }`}</span>
                      {q?.questionType && (
                        <span style={{ opacity: 0.8 }}>
                          {q.questionType.toUpperCase()}
                        </span>
                      )}
                      {q?.difficulty && (
                        <span style={{ opacity: 0.6 }}>
                          {q.difficulty.toUpperCase()}
                        </span>
                      )}
                      {q?.scoreSettings?.PointsForEachCorrectAnswer != null && (
                        <span style={{ marginLeft: "auto" }}>
                          Score: {q.scoreSettings.PointsForEachCorrectAnswer}
                        </span>
                      )}
                    </div>
                  }
                  extra={
                    <Button
                      danger
                      size="small"
                      disabled={busy}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(idx);
                      }}
                    >
                      Delete
                    </Button>
                  }
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html: q?.questionContent?.question || "",
                    }}
                  />
                  <RenderOptions
                    questionContent={q?.questionContent}
                    answer={q?.answer}
                  />
                </Panel>
              ))}
            </Collapse>
          )}

          {/* Optional bottom action bar (kept commented) */}
          {/* <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
            <Button onClick={handleGenerateAgain} disabled={busy}>Generate Again</Button>
            <Button type="primary" onClick={handleAdd} disabled={busy || generated.length === 0}>
              Add Questions
            </Button>
          </div> */}
        </div>
      )}
    </Modal>
  );
}
