"use client";
import {
  getLstorage,
  getSstorage,
  setLstorage,
  setSstorage,
} from "@/app/testportal/utils/storageMiddleware";
import { notification, Modal } from "antd";

const handleTabVisibility = (honestRespondentVal = 2, setIsModalOpen) => {
  let tabChangeCount = parseInt(getSstorage("tabChangeCount")) || 0;
  const studentActivity = JSON.parse(getLstorage("activity")) || [];

  const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      tabChangeCount += 1;
      studentActivity.push({
        time: new Date(),
        event: {
          name: "tabChange",
          value: tabChangeCount,
        },
      });
      if (honestRespondentVal !== "Enable Warnings Only") {
        const remainingAttempts = honestRespondentVal - tabChangeCount;
        setSstorage("tabChangeCount", tabChangeCount);
        setSstorage("remainingAttempts", remainingAttempts);
        if (remainingAttempts > 0) {
          notification.warning({
            message: <strong>Warning: Window Switching Detected</strong>,
            description: (
              <p>
                You have switched away from the test window. Your test may get
                Blocked.
              </p>
            ),
            showProgress: true,
            duration: 10,
            placement: "top",
            style: {
              width: "500px",
            },
          });
        } else {
          setIsModalOpen(true);
          setSstorage("blockMsg", "blocked");
          studentActivity.push({
            event: { name: "testBlocked" },
            time: new Date(),
          });
        }
      } else {
        setSstorage("tabChangeCount", tabChangeCount);
        notification.warning({
          message: <strong>Warning: Window Switching Detected</strong>,
          showProgress: true,
          description: (
            <p>
              You have switched away from the test window. Your test may get
              Blocked.
            </p>
          ),
          duration: 10,
          placement: "top",
          style: {
            width: "500px",
          },
        });
      }
      setLstorage("activity", JSON.stringify(studentActivity));
    }
  };
  // const handleBeforeUnload = (e) => {
  //   e.preventDefault();
  //   e.returnValue = "";
  // };

  document.addEventListener("visibilitychange", handleVisibilityChange, false);
  // window.addEventListener("beforeunload", handleBeforeUnload, false);

  return () => {
    document.removeEventListener(
      "visibilitychange",
      handleVisibilityChange,
      false
    );
    // window.removeEventListener("beforeunload", handleBeforeUnload, false);
  };
};

export default handleTabVisibility;
