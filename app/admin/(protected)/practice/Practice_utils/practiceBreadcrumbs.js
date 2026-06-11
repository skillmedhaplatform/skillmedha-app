"use client";
import { useParams, usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import "../practice.css";
import { Breadcrumb } from "antd";
import {
  HomeOutlined,
  BookOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  CaretRightOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import styles from "./breadcrumbstyles.module.scss";

export default function PracticeBreadcrumbs() {
  const params = useParams();
  const router = useRouter();
  const currPath = usePathname();

  // Get data from Redux to show proper names instead of IDs
  const { subjects, topics, subtopics } = useSelector(
    (state) => state.adminPractice || {}
  );

  const [breadcrumbItems, setBreadcrumbItems] = useState([]);

  // Helper function to get subject name by ID
  const getSubjectName = (subjectId) => {
    const subject = subjects?.find((s) => s._id === subjectId);
    return subject?.title || subjectId;
  };

  // Helper function to get topic name by ID
  const getTopicName = (topicId) => {
    const topic = topics?.find((t) => t._id === topicId);
    return topic?.title || topicId;
  };

  // Helper function to get subtopic name by ID
  const getSubtopicName = (subtopicId) => {
    const subtopic = subtopics?.find((st) => st._id === subtopicId);
    return subtopic?.title || subtopicId;
  };

  // Helper function to format category name for display
  const formatCategoryName = (category) => {
    if (!category) return "";
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  // Generate breadcrumb items based on current path
  useEffect(() => {
    const generateBreadcrumbs = () => {
      const items = [];

      // Always add home/practice root
      items.push({
        title: (
          <span
            onClick={() => router.push("/admin/practice")}
            className={styles.breadcrumbLink}
          >
            <HomeOutlined /> Practice
          </span>
        ),
        key: "practice",
      });

      // Check if we're in practice section
      if (currPath.includes("/admin/practice")) {
        // Split pathname and extract segments
        const pathSegments = currPath.split("/").filter(Boolean);
        // pathSegments = ["practice", "technical" or "nontechnical", "subject_slug", ...]

        // Extract category from second segment (index 1)
        const category = pathSegments[1]; // "technical" or "nontechnical"

        // Add category level if it exists
        if (
          category &&
          (category === "technical" ||
            category === "nontechnical" ||
            category === "coding")
        ) {
          items.push({
            title: (
              <span
                onClick={() => router.push(`/admin/practice/${category}`)}
                className={styles.breadcrumbLink}
              >
                <BookOutlined /> {formatCategoryName(category)} Subjects
              </span>
            ),
            key: `category-${category}`,
          });

          // Add subject level if subject_slug exists
          if (params.subject_slug) {
            const subjectName = getSubjectName(params.subject_slug);

            items.push({
              title: (
                <span
                  onClick={() =>
                    router.push(`/admin/practice/${category}/${params.subject_slug}`)
                  }
                  className={styles.breadcrumbLink}
                >
                  <FileTextOutlined /> {subjectName}
                </span>
              ),
              key: `subject-${params.subject_slug}`,
            });
          }

          // Add topic level if topic_slug exists
          if (params.topic_slug) {
            const topicName = getTopicName(params.topic_slug);

            items.push({
              title: (
                <span
                  onClick={() =>
                    router.push(
                      `/admin/practice/${category}/${params.subject_slug}/${params.topic_slug}`
                    )
                  }
                  className={styles.breadcrumbLink}
                >
                  <AppstoreOutlined /> {topicName}
                </span>
              ),
              key: `topic-${params.topic_slug}`,
            });
          }

          // Add subtopic level if subtopic_slug exists
          if (params.subtopic_slug) {
            const subtopicName = getSubtopicName(params.subtopic_slug);

            items.push({
              title: (
                <span className={styles.breadcrumbCurrent}>{subtopicName}</span>
              ),
              key: `subtopic-${params.subtopic_slug}`,
            });
          }

          // Handle specific category pages without subject (end pages like /practice/technical)
          if (pathSegments.length === 2 && !params.subject_slug) {
            // This means we're on /practice/technical or /practice/nontechnical page
            // The category item added above will be the current/last item
            // Mark it as current by updating the last item
            const lastItemIndex = items.length - 1;
            if (lastItemIndex >= 0) {
              items[lastItemIndex] = {
                title: (
                  <span className={styles.breadcrumbCurrent}>
                    <BookOutlined /> {formatCategoryName(category)} Subjects
                  </span>
                ),
                key: `category-${category}`,
              };
            }
          }
        }
      }

      return items;
    };

    setBreadcrumbItems(generateBreadcrumbs());
  }, [currPath, params, subjects, topics, subtopics, router]);

  // Don't render if no items or only one item
  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <div className={styles.breadcrumbContainer}>
      <Breadcrumb
        items={breadcrumbItems}
        separator={
          <span className={styles.separatorWrapper}>
            <CaretRightOutlined style={{ fontSize: "1.2rem" }} />
          </span>
        }
        className={styles.breadcrumb}
      />
    </div>
  );
}
