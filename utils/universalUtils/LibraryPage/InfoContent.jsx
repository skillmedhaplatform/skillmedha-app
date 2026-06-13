"use client";
import React from "react";
import { Row, Col, Tag } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import { stripHtml, formatUpdatedDate } from "./helpers";

const difficultyColorMap = {
  Beginner: "green",
  Intermediate: "blue",
  Advanced: "orange",
  Expert: "red",
};

const boxStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: "10px",
  padding: "20px",
  marginBottom: "8px",
  backgroundColor: "#ffffff",
  boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
};

const InfoContent = ({ item }) => {
  const ci = item?.courseIncludes || {};

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, overflowX: "hidden" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, paddingBottom: 16, borderBottom: "1px solid #f0f0f0" }}>
        {item?.category && <Tag color="geekblue" style={{ fontSize: 14, padding: "2px 8px" }}>{item.category}</Tag>}
        {item?.difficulty && <Tag color={difficultyColorMap[item.difficulty] || "default"} style={{ fontSize: 14, padding: "2px 8px" }}>{item.difficulty}</Tag>}
        {item?.language && <Tag color="default" style={{ fontSize: 14, padding: "2px 8px" }}>🌐 {item.language}</Tag>}
        {item?.duration && <Tag color="cyan" style={{ fontSize: 14, padding: "2px 8px" }}>⏱ {item.duration}</Tag>}
        {item?.sections?.length ? <Tag color="purple" style={{ fontSize: 14, padding: "2px 8px" }}>📚 {item.sections.length} Modules</Tag> : null}
        {ci.videoDuration && <Tag color="cyan" style={{ fontSize: 14, padding: "2px 8px" }}>🎥 {ci.videoDuration}</Tag>}
        {item?.featured && <Tag color="gold" style={{ fontSize: 14, padding: "2px 8px" }}>⭐ Featured</Tag>}
        {item?.trending && <Tag color="red" style={{ fontSize: 14, padding: "2px 8px" }}>🔥 Trending</Tag>}
      </div>

      <Row gutter={[24, 12]} style={{ margin: 0 }}>
        <Col xs={24} md={14} style={{ paddingLeft: 0 }}>
          {item?.learningPoints?.length > 0 && (
            <div style={boxStyle}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#1f2937", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                What you'll learn
              </div>
              <Row gutter={[16, 16]}>
                {item.learningPoints.slice(0, 8).map((point, i) => (
                  <Col span={12} key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <CheckCircleOutlined style={{ color: "#24A058", marginTop: 5, fontSize: 16 }} />
                    <span style={{ fontSize: 15, color: "#4b5563", lineHeight: 1.6 }}>{point}</span>
                  </Col>
                ))}
              </Row>
            </div>
          )}

          {(ci.certificateOfCompletion || ci.lifetimeAccess || ci.articles || ci.codingExercises || ci.quizzes || ci.downloadableResources) && (
            <div style={boxStyle}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#1f2937", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                This Course Includes
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {ci.certificateOfCompletion && <Tag color="green" style={{ fontSize: 14, padding: "2px 8px" }}>🏅 Certificate</Tag>}
                {ci.lifetimeAccess && <Tag color="green" style={{ fontSize: 14, padding: "2px 8px" }}>♾ Lifetime Access</Tag>}
                {ci.jobAssistance && <Tag color="green" style={{ fontSize: 14, padding: "2px 8px" }}>💼 Job Assistance</Tag>}
                {ci.articles && <Tag style={{ fontSize: 14, padding: "2px 8px" }}>{ci.articles} Articles</Tag>}
                {ci.quizzes && <Tag style={{ fontSize: 14, padding: "2px 8px" }}>{ci.quizzes} Quizzes</Tag>}
                {ci.codingExercises && <Tag style={{ fontSize: 14, padding: "2px 8px" }}>{ci.codingExercises} Exercises</Tag>}
                {ci.downloadableResources && <Tag style={{ fontSize: 14, padding: "2px 8px" }}>{ci.downloadableResources} Resources</Tag>}
              </div>
            </div>
          )}
        </Col>

        <Col xs={24} md={10} style={{ paddingRight: 0 }}>
          {item?.toolsWithIcons?.length > 0 && (
            <div style={boxStyle}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#1f2937", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Tools & Technologies
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
                {item.toolsWithIcons.slice(0, 8).map((tool, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, backgroundColor: "#f3f4f6", padding: "6px 12px", borderRadius: "6px" }}>
                    {tool.icon && <img src={tool.icon} alt={tool.name} style={{ width: 18, height: 18, objectFit: "contain" }} />}
                    <span style={{ color: "#374151", fontWeight: 500 }}>{tool.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {item?.preRequisites?.length > 0 && (
            <div style={boxStyle}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#1f2937", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Prerequisites
              </div>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 15, color: "#4b5563", lineHeight: 1.6 }}>
                {item.preRequisites.map((req, i) => <li key={i} style={{ marginBottom: 6 }}>{req}</li>)}
              </ul>
            </div>
          )}

          {item?.targetAudience?.length > 0 && (
            <div style={boxStyle}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#1f2937", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Who is this for
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {item.targetAudience.map((a, i) => (
                  <Tag key={i} style={{ fontSize: 14, color: "#4b5563", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "2px 8px" }}>
                    {a}
                  </Tag>
                ))}
              </div>
            </div>
          )}
        </Col>
      </Row>

      {item?.updatedAt && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #f0f0f0", fontSize: 13, color: "#9ca3af" }}>
          Last updated: {formatUpdatedDate(item.updatedAt)}
        </div>
      )}
    </div>
  );
};

export default InfoContent;