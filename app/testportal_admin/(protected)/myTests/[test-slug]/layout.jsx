"use client";
import React, { useEffect, useState } from "react";
import pageTitleStyles from "./form.module.scss";
import { useSelector, useDispatch } from "react-redux";
import { useParams, usePathname, useRouter } from "next/navigation";
import { FaCaretRight } from "react-icons/fa";
import { Button, Modal, Tooltip } from "antd";
import { 
  InfoCircleOutlined, 
  QuestionCircleOutlined, 
  LockOutlined, 
  PlayCircleOutlined, 
  HistoryOutlined, 
  ClockCircleOutlined 
} from "@ant-design/icons";

import { getOneTests, updateTest } from "@/redux/slices/testportal_admin/slice/test";
import { setFormValues } from "@/redux/slices/testportal_admin/slice/stepform";
import {
  getAllStudentsAgg,
  getBatches,
  getDepartments,
} from "@/redux/slices/testportal_admin/slice/studentSlice";

const TestSlugLayout = ({ children }) => {
  const SingleTest = useSelector((state) => state.tests.test);
  const params = useParams();
  const router = useRouter();
  const currPath = usePathname();
  const dispatch = useDispatch();
  const [openPublishModal, setOpenPublishModal] = useState(false);

  const selectedId = params["test-slug"]?.split("_id-")[1];
  const gradingPage = currPath.split("/").slice(-1)[0] === "time";

  useEffect(() => {
    if (selectedId) dispatch(getOneTests({ _id: selectedId }));
  }, [selectedId, dispatch]);

  useEffect(() => {
    if (SingleTest?._id) dispatch(setFormValues(SingleTest));
  }, [SingleTest, dispatch]);

  useEffect(() => {
    dispatch(getDepartments());
    dispatch(getBatches({}));
    dispatch(getAllStudentsAgg({}));
  }, [dispatch]);

  const tabNamesMap = {
    about: "About",
    questionManager: "Question Manager",
    access: "Pricing & Access",
    startPage: "Start Page",
    grading: "Grading & Summary",
    time: "Time",
  };

  const activeTabKey = Object.keys(tabNamesMap).find(key => currPath.includes(key)) || "";
  const activeTabName = tabNamesMap[activeTabKey] || "";

  const restrictionsPublishTest = () => {
    if (!SingleTest?._id) {
      return {
        isRestricted: true,
        message: "Test ID is missing. Please create a test first.",
      };
    } else if (!SingleTest?.startPage) {
      return {
        isRestricted: true,
        message: "start Page is missing. Please provide.",
      };
    } else if (!SingleTest?.grading) {
      return {
        isRestricted: true,
        message: "Grading and Summary is missing. Please provide.",
      };
    } else if (SingleTest?.grading?.gradingCriteria?.passScore <= 0) {
      return {
        isRestricted: true,
        message: "Pass score must be greater than 0.",
      };
    } else if (!SingleTest?.time?.testDuration?.testDuration) {
      return {
        isRestricted: true,
        message: "Test duration is missing. Please provide a test duration.",
      };
    } else if (
      SingleTest?.time?.testDuration?.testDuration?.duration?.val1 === "00" &&
      SingleTest?.time?.testDuration?.testDuration?.duration?.val2 === "00"
    ) {
      return {
        isRestricted: true,
        message: "Test duration cannot be 00:00. Please provide a valid duration.",
      };
    } else if (!SingleTest?.questions || SingleTest?.questions?.length < 1) {
      return {
        isRestricted: true,
        message: "This test currently has no questions assigned.",
      };
    }
    return {
      isRestricted: false,
      message: "",
    };
  };

  const handlePublish = () => {
    dispatch(
      updateTest({ id: selectedId, updates: { status: "active" } })
    );
    setOpenPublishModal(false);
  };

  const tabItems = [
    { key: "about", name: "About", icon: <InfoCircleOutlined /> },
    { key: "questionManager", name: "Question Manager", icon: <QuestionCircleOutlined /> },
    { key: "access", name: "Pricing & Access", icon: <LockOutlined /> },
    { key: "startPage", name: "Start Page", icon: <PlayCircleOutlined /> },
    { key: "grading", name: "Grading & Summary", icon: <HistoryOutlined /> },
    { key: "time", name: "Time", icon: <ClockCircleOutlined /> },
  ];

  return (
    <React.Fragment>
      <div className={pageTitleStyles.container}>
        {/* TPO Style Tab Row */}
        <div className={pageTitleStyles.tabsContainer}>
          {tabItems.map((tab) => {
            const isActive = activeTabKey === tab.key;
            return (
              <div
                key={tab.key}
                className={`${pageTitleStyles.tabItem} ${isActive ? pageTitleStyles.activeTab : ""}`}
                onClick={() => router.replace(`/testportal_admin/myTests/${params["test-slug"]}/${tab.key}`)}
              >
                {tab.icon}
                <span>{tab.name}</span>
                {isActive && <div className={pageTitleStyles.activeIndicator} />}
              </div>
            );
          })}
        </div>

        {/* Breadcrumb Path Bar */}
        <div className={pageTitleStyles.breadcrumb}>
          <div className={pageTitleStyles.leftPath}>
            <p onClick={() => router.push("/testportal_admin/myTests")}>My Tests</p>
            <span><FaCaretRight /></span>
            <p onClick={() => router.push(`/testportal_admin/myTests/${params["test-slug"]}/about`)}>
              {SingleTest?.title || "Test Details"}
            </p>
            {activeTabName && (
              <>
                <span><FaCaretRight /></span>
                <p className={pageTitleStyles.current}>{activeTabName}</p>
              </>
            )}
          </div>

          {/* Publish Button for Time Tab */}
          {gradingPage && (
            <Tooltip
              placement="bottomRight"
              title={restrictionsPublishTest().isRestricted ? restrictionsPublishTest().message : ""}
            >
              <div>
                <Button
                  disabled={restrictionsPublishTest().isRestricted}
                  type="primary"
                  onClick={() => setOpenPublishModal(true)}
                  style={{
                    background: restrictionsPublishTest().isRestricted
                      ? "#e2e8f0"
                      : "linear-gradient(135deg, #1e69da 0%, #1150b3 100%)",
                    border: "none",
                    height: "38px",
                    borderRadius: "8px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 1.25rem",
                    boxShadow: restrictionsPublishTest().isRestricted ? "none" : "0 2px 4px rgba(30, 105, 218, 0.15)"
                  }}
                >
                  <span
                    style={{
                      color: restrictionsPublishTest().isRestricted ? "#8c8c8c" : "#ffffff",
                      fontWeight: "700",
                      fontSize: "14px"
                    }}
                  >
                    Publish Test
                  </span>
                </Button>
              </div>
            </Tooltip>
          )}
        </div>

        <div className={pageTitleStyles.contentForm}>{children}</div>

        <Modal
          title="Live this Test"
          onCancel={() => setOpenPublishModal(false)}
          okText="Yes"
          cancelText="No"
          open={openPublishModal}
          onOk={handlePublish}
        >
          <p>Are you sure you want to publish this test? It will become active and visible to candidates.</p>
        </Modal>
      </div>
    </React.Fragment>
  );
};

export default TestSlugLayout;
