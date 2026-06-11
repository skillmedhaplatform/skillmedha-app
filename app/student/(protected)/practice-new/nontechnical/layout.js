"use client";

import {
  clearTopicsAndSubtopics,
  fetchSubjectsByType,
  fetchSubtopicsByTopic,
  fetchTopicsBySubject,
} from "@/redux/slices/practiceSlice";
import { Divider, Menu, Spin, Typography } from "antd";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  LoadingOutlined,
  BookOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import useResponsive from "@/hooks/useResponsive";
import MobilePracticeLayout from "@/mobile_views/practice/MobilePracticeLayout";

const { Text } = Typography;

export default function PracticeLayout({ children }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const currPath = usePathname();
  const searchParams = useSearchParams();
  const subjects = useSelector((s) => s.practice.subjects);
  const topics = useSelector((s) => s.practice.topics);

  const [openKeys, setOpenKeys] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState({});

  // Get current subject and topic from URL params
  const currentSubjectId = searchParams.get("sub");
  const currentTopicId = searchParams.get("top");
  const currentSubTopicId = searchParams.get("subT");

  // Fetch all subjects initially
  useEffect(() => {
    dispatch(fetchSubjectsByType("nontechnical"));
  }, [dispatch]);

  // Initialize menu state from URL parameters
  useEffect(() => {
    if (currentSubjectId) {
      setOpenKeys([currentSubjectId]);

      // Fetch topics for the current subject if not already loaded
      const subjectTopics = topics?.filter(
        (topic) => topic.subjectId === currentSubjectId
      );

      if (subjectTopics.length === 0) {
        setLoadingTopics((prev) => ({ ...prev, [currentSubjectId]: true }));
        dispatch(fetchTopicsBySubject({ subjectId: currentSubjectId })).finally(
          () => {
            setLoadingTopics((prev) => {
              const newState = { ...prev };
              delete newState[currentSubjectId];
              return newState;
            });
          }
        );
      }
    }
    if (currentTopicId) {
      dispatch(fetchSubtopicsByTopic(currentTopicId));
    }

    if (currentTopicId && currentSubjectId) {
      setSelectedKeys([`${currentSubjectId}-${currentTopicId}`]);
    } else {
      setSelectedKeys([]);
    }
  }, [currentSubjectId, currentTopicId, dispatch, topics]);

  const handleOpenChange = async (keys) => {
    // dispatch(clearTopicsAndSubtopics());
    if (keys.length === 0) {
      setOpenKeys([]);
      return;
    }

    const latestKey = keys[keys.length - 1];

    if (openKeys.includes(latestKey)) {
      setOpenKeys([]);
      router.push(currPath);
      return;
    }

    setOpenKeys([latestKey]);

    router.push(`${currPath}?sub=${latestKey}`);

    setLoadingTopics((prev) => ({ ...prev, [latestKey]: true }));
    try {
      await dispatch(fetchTopicsBySubject({ subjectId: latestKey }));
    } catch (error) {
      console.error("Error fetching topics:", error);
    } finally {
      setLoadingTopics((prev) => {
        const newState = { ...prev };
        delete newState[latestKey];
        return newState;
      });
    }
  };

  const handleMenuClick = (e) => {
    const { key } = e;
    if (
      key.includes("-") &&
      !key.includes("loading") &&
      !key.includes("empty")
    ) {
      const [subjectId, topicId] = key.split("-");
      setSelectedKeys([key]);
      router.push(`${currPath}?sub=${subjectId}&top=${topicId}`);
    }
  };

  // Build menu items
  const createMenuItems = () => {
    return (
      subjects?.map((subject) => {
        const subjectTopics =
          topics?.filter((topic) => topic.subjectId === subject._id) || [];
        const isLoading = loadingTopics[subject._id];

        const menuItem = {
          key: subject._id,
          icon: <BookOutlined />,
          label: (
            <p className="text-[16px] font-medium m-0">
              {subject.title}
            </p>
          ),
          children: [],
        };

        if (isLoading) {
          menuItem.children = [
            {
              key: `${subject._id}-loading`,
              label: (
                <div className="flex items-center gap-2">
                  <Spin
                    indicator={
                      <LoadingOutlined style={{ fontSize: 12 }} spin />
                    }
                  />
                  <Text type="secondary">Loading topics...</Text>
                </div>
              ),
              disabled: true,
            },
          ];
        } else if (subjectTopics.length > 0) {
          menuItem.children = subjectTopics.map((topic) => ({
            key: `${subject._id}-${topic._id}`,
            icon: <FileTextOutlined />,
            label: (
              <p className="text-[14px] font-normal m-0">
                {topic?.title}
              </p>
            ),
          }));
        } else {
          menuItem.children = [
            {
              key: `${subject._id}-empty`,
              label: <Text type="secondary">No topics available</Text>,
              disabled: true,
            },
          ];
        }

        return menuItem;
      }) || []
    );
  };

  const menuItems = createMenuItems();
  const isMobile = useResponsive();

  if (isMobile) {
    return (
      <MobilePracticeLayout
        subjects={subjects}
        topics={topics}
        loadingTopics={loadingTopics}
        onOpenSubject={handleOpenChange}
        onSelectTopic={(subjectId, topicId) => handleMenuClick({ key: `${subjectId}-${topicId}` })}
      >
        {children}
      </MobilePracticeLayout>
    );
  }

  return (
    <div className="w-full h-full flex">
      {/* Sidebar */}
      <div className="w-[18%] min-w-[12%] flex items-start justify-center p-2">
        <Menu
          mode="inline"
          items={menuItems}
          openKeys={openKeys}
          selectedKeys={selectedKeys}
          onOpenChange={handleOpenChange}
          onClick={handleMenuClick}
          className="!border-r-0 !bg-white !w-full"
          theme="light"
        />
      </div>

      <Divider
        orientation="vertical"
        variant="solid"
        className="!h-full !m-0"
      />

      {/* Content */}
      <div className="flex-1 p-4">{children}</div>
    </div>
  );
}
