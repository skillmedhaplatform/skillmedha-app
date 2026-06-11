"use client";
import React, { useMemo, useState } from "react";
import {
  Button,
  Divider,
  Collapse,
  Popconfirm,
  Empty,
  message,
  Typography,
  Space,
  Tooltip,
} from "antd";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { updateTopic } from "@/redux/slices/admin/cms/internship";
import { parseIfJson } from "@/utils/windowMW";

const { Text, Paragraph } = Typography;

function stripHtml(html = "") {
  return String(html || "")
    .replace(/<[^>]+>/g, "")
    .trim();
}

export default function Quiz() {
  const {
    createInternship: internshipId,
    section: sectionId,
    topics: topicId,
    editTopic,
  } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const singleTopic = useSelector((s) => s.adminInternship.singleTopic);
  const quiz = useMemo(
    () => (Array.isArray(singleTopic?.quiz) ? singleTopic.quiz : []),
    [singleTopic]
  );

  const [updating, setUpdating] = useState(false);

  const baseUrl = `/admin/internship/${internshipId}/${sectionId}/${topicId}/${editTopic}/new-question`;

  const handleDelete = async (qId) => {
    try {
      setUpdating(true);
      const nextQuiz = quiz.filter((q) => q?._id !== qId && q?.id !== qId);
      await dispatch(
        updateTopic({
          id: internshipId,
          sid: sectionId,
          tid: topicId,
          data: { quiz: nextQuiz },
        })
      ).unwrap();
      message.success("Question deleted");
    } catch (err) {
      console.error(err);
      message.error(
        err?.response?.data?.message || err?.message || "Failed to delete"
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleEdit = (qId) => {
    router.push(
      `/admin/internship/${internshipId}/${sectionId}/${topicId}/${editTopic}/${qId}`
    );
  };

  const handleAdd = async () => {
    try {
      if (!Array.isArray(singleTopic?.quiz)) {
        await dispatch(
          updateTopic({
            id: internshipId,
            sid: sectionId,
            tid: topicId,
            data: { quiz: [] },
          })
        ).unwrap();
      }
      router.push(baseUrl);
    } catch (err) {
      console.error(err);
      message.error("Failed to add new question");
    }
  };

  const isAddDisabled = quiz.length >= 10 || updating;

  return (
    <div>
      {/* Add Question Button */}
      <div
        style={{
          display: "flex",
          width: "100%",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        <Tooltip
          title={quiz.length >= 10 ? "Maximum 10 questions reached" : ""}
          placement="top"
        >
          <Button type="primary" onClick={handleAdd} disabled={isAddDisabled}>
            Add Question
          </Button>
        </Tooltip>
      </div>
      {quiz.length >= 10 && (
        <Text type="warning" style={{ marginLeft: 10 }}>
          Maximum 10 questions reached
        </Text>
      )}

      <Divider style={{ margin: "10px 0" }} />

      {quiz.length === 0 ? (
        <Empty description="No questions yet. Click 'Add Question' to create one." />
      ) : (
        <Collapse accordion>
          {quiz.map((q, i) => {
            const title =
              stripHtml(q?.questionContent?.question) || `Question ${i + 1}`;
            const points = q?.scoreSettings?.pointsForCorrectAns || 0;
            const explanation =
              q?.answer?.explanation || "No explanation provided";
            const questionType = q?.questionType || "Unknown";

            return (
              <Collapse.Panel
                key={i}
                header={
                  <Space orientation="vertical" style={{ width: "100%" }}>
                    {/* First row: question on left, score & type on right */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div style={{ display: "flex" }}>
                        <p>{i + 1}: &nbsp;</p>
                        <span
                          dangerouslySetInnerHTML={{
                            __html:
                              parseIfJson(q?.questionContent?.question) ||
                              title,
                          }}
                        />
                      </div>

                      <div
                        style={{
                          textAlign: "right",
                          whiteSpace: "nowrap",
                          display: "flex",
                          gap: "1rem",
                        }}
                      >
                        <Text type="secondary" style={{ display: "block" }}>
                          Score: {points}
                        </Text>
                        <Text type="secondary" style={{ display: "block" }}>
                          Type: {questionType}
                        </Text>
                      </div>
                    </div>

                    {/* Second row: resources */}
                    {q?.resources?.url && (
                      <div style={{ marginTop: 10 }}>
                        {q.resources.url.endsWith(".mp4") ? (
                          <video
                            controls
                            width="100%"
                            style={{ maxWidth: 400 }}
                          >
                            <source src={q.resources.url} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        ) : q.resources.url.endsWith(".mp3") ? (
                          <audio
                            controls
                            style={{ width: "100%", maxWidth: 400 }}
                          >
                            <source src={q.resources.url} type="audio/mpeg" />
                            Your browser does not support the audio tag.
                          </audio>
                        ) : (
                          <a
                            href={q.resources.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View Resource
                          </a>
                        )}
                      </div>
                    )}
                  </Space>
                }
                extra={
                  <Space>
                    <Button
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(q?.id);
                      }}
                      disabled={updating}
                    >
                      Edit
                    </Button>
                    <Popconfirm
                      title="Delete this question?"
                      okText="Delete"
                      okButtonProps={{ danger: true }}
                      onConfirm={(e) => {
                        e?.stopPropagation?.();
                        handleDelete(q?.id);
                      }}
                    >
                      <Button size="small" danger disabled={updating}>
                        Delete
                      </Button>
                    </Popconfirm>
                  </Space>
                }
              >
                {/* Explanation */}
                <Paragraph>
                  <Text strong>Explanation:</Text>
                  <br />
                  <div
                    dangerouslySetInnerHTML={{
                      __html: parseIfJson(explanation),
                    }}
                  />
                </Paragraph>

                {/* Video/Audio Resource */}
              </Collapse.Panel>
            );
          })}
        </Collapse>
      )}
    </div>
  );
}
