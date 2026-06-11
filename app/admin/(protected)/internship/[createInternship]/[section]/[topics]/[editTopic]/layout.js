"use client";
import React, { useEffect, useMemo } from "react";
import { Divider, Tabs, Tooltip } from "antd";
import { useParams, useRouter, usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  getOneInternship,
  getOneSection,
  getOneTopic,
} from "@/redux/slices/admin/cms/internship";
import layoutStyles from "./page.module.scss";
import { IoCaretForwardOutline } from "react-icons/io5";

// Custom Breadcrumb Item Component
const BreadcrumbItem = ({ title, onClick, isLast }) => {
  const truncatedTitle =
    title && title.length > 25 ? `${title.substring(0, 25)}...` : title;

  return (
    <>
      <Tooltip title={title && title.length > 25 ? title : null}>
        <span
          onClick={onClick}
          className={layoutStyles.breadcrumbLink}
          style={{ maxWidth: "200px" }}
        >
          {truncatedTitle}
        </span>
      </Tooltip>
      {!isLast && (
        <IoCaretForwardOutline
          style={{
            fontSize: "16px",
            margin: "0 8px",
            color: "#8c8c8c",
            flexShrink: 0,
          }}
        />
      )}
    </>
  );
};

export default function TopicLayout({ children }) {
  const {
    createInternship: internshipId,
    section: sectionId,
    topics: topicId,
    editTopic,
    question,
  } = useParams();
  const nav = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();

  const singleInternship = useSelector((s) => s.adminInternship.singleInternship);
  const singleSection = useSelector((s) => s.adminInternship.singleSection);
  const singleTopic = useSelector((s) => s.adminInternship.singleTopic);
  const userCreds = useSelector((state) => state.user?.singleUser);

  useEffect(() => {
    if (internshipId && internshipId !== "newCourse") {
      dispatch(getOneInternship({ id: internshipId, orgId: userCreds?.orgId }));
    }
    if (sectionId) {
      dispatch(getOneSection({ id: sectionId }));
    }
    if (topicId && topicId !== "newTopic") {
      dispatch(getOneTopic({ id: topicId }));
    }
  }, [dispatch, internshipId, sectionId, topicId]);

  // Define navigation routes
  const baseUrl = `/admin/internship/${internshipId}/${sectionId}/${topicId}`;

  const type = editTopic?.split("__")[1];

  const routes = useMemo(() => {
    const baseRoutes = [];

    if (type === "topic") {
      baseRoutes.push({
        key: "overview",
        label: "Live Session",
        path: `${baseUrl}/overview`,
      });
    }
    if (type === "pdf") {
      baseRoutes.push({
        key: "resources",
        label: "Material (PDF)",
        path: `${baseUrl}/resources`,
      });
    }
    if (type === "coding") {
      baseRoutes.push({
        key: "coding",
        label: "Coding",
        path: `${baseUrl}/coding`,
        disabled: !singleTopic?._id,
      });
    }
    if (type === "quiz") {
      baseRoutes.push({
        key: "quiz",
        label: "Practice quiz",
        path: `${baseUrl}/quiz`,
        disabled: !singleTopic?._id,
      });
    }

    if (type === "video") {
      baseRoutes.push({
        key: "video",
        label: "Video recording",
        path: `${baseUrl}/video`,
      });
    }

    if (question) {
      baseRoutes.push({
        key: "question",
        label: "Add Question",
        path: `${baseUrl}/${editTopic}/${question}`,
        disabled: !singleTopic?._id,
      });
    }

    return baseRoutes;
  }, [baseUrl, singleTopic, question]);

  // Get current active tab based on pathname
  const getActiveTab = () => {
    const currentRoute = routes.find((route) => pathname === route.path);
    return currentRoute?.key || routes[0]?.key;
  };

  // Handle tab change
  const handleTabChange = (activeKey) => {
    const selectedRoute = routes.find((route) => route.key === activeKey);
    if (selectedRoute && !selectedRoute.disabled) {
      nav.push(selectedRoute.path);
    }
  };

  // Create breadcrumb items array
  const breadcrumbItems = [
    {
      title: singleInternship?.title || "Course",
      onClick: () => nav.push(`/admin/internship/${internshipId}`),
    },
  ];

  if (sectionId) {
    breadcrumbItems.push({
      title: singleSection?.title || "Section",
      onClick: () => nav.push(`/admin/internship/${internshipId}/${sectionId}`),
    });
  }

  if (topicId) {
    breadcrumbItems.push({
      title: singleTopic?.title || "Topic",
      onClick: () =>
        nav.push(`/admin/internship/${internshipId}/${sectionId}/${topicId}`),
    });
  }

  return (
    <div className={layoutStyles.container}>
      <div className={layoutStyles.header}>
        {/* Custom Breadcrumb */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: "16px",
            marginBottom: "16px",
          }}
        >
          {breadcrumbItems.map((item, index) => (
            <BreadcrumbItem
              key={index}
              title={item.title}
              onClick={item.onClick}
              isLast={index === breadcrumbItems.length - 1}
            />
          ))}
        </div>
      </div>
      <div className={layoutStyles.content}>{children}</div>
    </div>
  );
}
