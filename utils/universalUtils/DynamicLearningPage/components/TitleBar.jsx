"use client";
import React, { memo, useEffect } from "react";
import { Progress, Popover, Button, Modal } from "antd";
import { TrophyOutlined, DownOutlined, LogoutOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import interPageStyles from "../page.module.scss";

/**
 * TitleBar
 * Displays the progress circle, course heading, and progress popover.
 */
const TitleBar = memo(({
  displayProgress,
  isNavigating,
  courseHeading,
  displayCompletedCount,
  displayTotalCount,
}) => {
  const router = useRouter();

  useEffect(() => {
    // Prevent swipe-to-go-back gesture
    const originalOverscroll = document.body.style.overscrollBehaviorX;
    document.body.style.overscrollBehaviorX = "none";

    return () => {
      document.body.style.overscrollBehaviorX = originalOverscroll;
    };
  }, []);

  const handleExit = () => {
    Modal.confirm({
      title: "Exit Learning Page?",
      content: "Are you sure you want to leave this page? Your progress has been saved.",
      okText: "Exit",
      okType: "danger",
      cancelText: "Stay",
      onOk: () => {
        router.back();
      },
    });
  };

  return (
    <div className={interPageStyles.titlesBar}>
      <div className={interPageStyles.headingWrap} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <Progress
          type="circle"
          percent={displayProgress}
          size={45}
          // Subtle spin animation during page transition
          strokeColor={isNavigating ? "#faad14" : undefined}
        />
        <div className={interPageStyles.courseHeading}>
          {courseHeading}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingRight: "1.25rem" }}>
        <Popover
          trigger="click"
          placement="bottomRight"
          content={
            <div className={interPageStyles.progressPopover}>
              <div className={interPageStyles.progressValue}>
                {displayCompletedCount} of {displayTotalCount} complete
              </div>
              <div className={interPageStyles.progressNote}>
                Finish course to get your certificate
              </div>
            </div>
          }
        >
          <button type="button" className={interPageStyles.progressButton} style={{ marginRight: 0 }}>
            <span className={interPageStyles.progressIconWrap}>
              <TrophyOutlined />
            </span>
            <span className={interPageStyles.progressLabel}>Your progress</span>
            <DownOutlined className={interPageStyles.progressChevron} />
          </button>
        </Popover>

        <Button
          type="default"
          danger
          icon={<LogoutOutlined />}
          onClick={handleExit}
          style={{ borderRadius: "999px", padding: "0.45rem 1rem", height: "auto", fontWeight: 600 }}
        >
          Exit
        </Button>
      </div>
    </div>
  );
});

TitleBar.displayName = "TitleBar";
export default TitleBar;
