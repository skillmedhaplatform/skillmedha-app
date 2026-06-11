"use client";
import React, { useState } from "react";
import { Collapse, Spin } from "antd";
import { BookOutlined, FileTextOutlined, LoadingOutlined } from "@ant-design/icons";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import styles from "./mobilePracticeLayout.module.scss";

export default function MobilePracticeLayout({
  children,
  subjects = [],
  topics = [],
  loadingTopics = {},
  onOpenSubject = () => {},
  onSelectTopic = () => {},
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSubjectId = searchParams.get("sub");
  const currentTopicId = searchParams.get("top");

  // Main navigation tabs list
  const categoryTabs = [
    { name: "Technical", path: "/student/practice-new/technical" },
    { name: "Non-Technical", path: "/student/practice-new/nontechnical" },
    { name: "Coding", path: "/student/practice-new/coding" },
  ];

  const currentActiveTab = categoryTabs.find(tab => pathname.includes(tab.path)) || categoryTabs[0];

  const handleTabClick = (tab) => {
    router.push(tab.path);
  };

  const handleTopicClick = (subjectId, topicId) => {
    onSelectTopic(subjectId, topicId);
  };

  return (
    <div className={styles.container}>
      {/* 1. Main Category Navigation Tabs */}
      <div className={styles.categoryTabs}>
        {categoryTabs.map((tab) => {
          const isActive = pathname.includes(tab.path);
          return (
            <button
              key={tab.path}
              onClick={() => handleTabClick(tab)}
              className={`${styles.tabBtn} ${isActive ? styles.activeTab : ""}`}
            >
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* 2. Subject and Topic Selector Accordion (only for technical/nontechnical) */}
      {!pathname.includes("/coding") && (
        <div className={styles.accordionContainer}>
          <Collapse
            accordion
            activeKey={currentSubjectId ? [currentSubjectId] : []}
            onChange={(activeKey) => {
              if (activeKey) {
                const keysArray = Array.isArray(activeKey) ? activeKey : [activeKey];
                onOpenSubject(keysArray);
              } else {
                onOpenSubject([]);
              }
            }}
            className={styles.collapseWrapper}
          >
            {subjects.map((subject) => {
              const subjectTopics = topics.filter((t) => t.subjectId === subject._id);
              const isLoading = loadingTopics[subject._id];

              return (
                <Collapse.Panel
                  header={
                    <span className={styles.subjectHeader}>
                      <BookOutlined /> {subject.title}
                    </span>
                  }
                  key={subject._id}
                >
                  {isLoading ? (
                    <div className={styles.loadingSpinner}>
                      <Spin indicator={<LoadingOutlined style={{ fontSize: 16 }} spin />} />
                      <span>Loading topics...</span>
                    </div>
                  ) : subjectTopics.length > 0 ? (
                    <div className={styles.topicsGrid}>
                      {subjectTopics.map((topic) => {
                        const isSelected = currentTopicId === topic._id;
                        return (
                          <button
                            key={topic._id}
                            onClick={() => handleTopicClick(subject._id, topic._id)}
                            className={`${styles.topicChip} ${isSelected ? styles.activeTopicChip : ""}`}
                          >
                            <FileTextOutlined /> {topic.title}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className={styles.emptyTopics}>No topics available</p>
                  )}
                </Collapse.Panel>
              );
            })}
          </Collapse>
        </div>
      )}

      {/* 3. Render Subtopics or Question Cards */}
      <div className={styles.contentArea}>
        {children}
      </div>
    </div>
  );
}
