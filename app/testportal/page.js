"use client";
import { io } from "socket.io-client";

import StoreProvider from "./redux/storeProvider";
import TestUI from "./utils/testUI/testUI";
import { Suspense, useEffect, useState } from "react";
import { message, Modal } from "antd";
import handleTabVisibility from "./utils/tabCHange";
import { useSearchParams } from "next/navigation";
import SearchParamsComp from "./utils/searchParams";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { awsUrl, gqlUrl, socketUrl } from "./utils/urls";
import { getOneTest } from "./graphQl/testQuery";
import { decryptObject } from "./utils/encryptionMiddleware";
import {
  getLstorage,
  setLstorage,
  setSstorage,
} from "./utils/storageMiddleware";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const searchParams = useSearchParams();
  const testIdEnc = searchParams.get("st_d");
  const [testData, setTestData] = useState({});
  const token = searchParams.get("st");
  const testType = searchParams.get("testtype");
  const { testId } = decryptObject(testIdEnc, "studentTestIDValue");
  // const [sessionData, setSessionData] = useState(null);

  const fetchTestData = async () => {
    try {
      const { data } = await axios.post(
        gqlUrl,
        {
          query: getOneTest,
          variables: { testId },
        },
        {
          headers: {
            Authorization: `Bearer ${getLstorage("token")}`,
          },
        },
      );

      setTestData(data.data.test);
      // const td = data.data.test;
      // if (td.liveProctoring == "enabled" || true) {
      //   const sessionResponse = await axios.post(
      //     `${agoraUrl}/agora/create-exam-session/${td._id}`,
      //     {
      //       studentIds: [], // Current student
      //       proctorIds: [], // Empty - proctors will join later
      //       maxStudents: 1, // Just this student
      //       maxProctors: 5, // Allow multiple proctors to join
      //     },
      //     {
      //       headers: { Authorization: `Bearer ${getLstorage("token")}` },
      //     }
      //   );

      //   setSessionData({
      //     sessionId: sessionResponse.data.sessionId,
      //     channelName: sessionResponse.data.channelName,
      //     appId: sessionResponse.data.appId,
      //   });
      // }
    } catch (error) {
      console.error("Failed to fetch test data:", error);
      message.error("Error fetching test data");
    }
  };
  const fetchJobTestData = async () => {
    try {
      const { data } = await axios.get(
        `${awsUrl}/getoneassessmentfromstudent/${testId}`,
        {
          headers: {
            Authorization: `Bearer ${getLstorage("token")}`,
          },
        },
      );
      setTestData(data.data.test);
    } catch (error) {
      console.error("Failed to fetch test data:", error);
      message.error("Error fetching test data");
    }
  };

  useEffect(() => {
    if (testType === "jobtest") {
      fetchJobTestData();
    } else {
      fetchTestData();
    }

    if (testId) {
      setLstorage(
        "activity",
        JSON.stringify([{ event: { name: "testStarted" }, time: new Date() }]),
      );
    }
  }, [testId]);
  useEffect(() => {
    if (token) {
      setLstorage("token", token);
    }
  }, []);

  const disabledKeys = ["c", "C", "x", "J", "u", "I"];

  useEffect(() => {
    if (typeof window !== "undefined")
      document.onkeydown = function (e) {
        if (event.keyCode === 123) {
          message.warning(
            "You cant use console or developer pannel until you completed test ",
          );
          return false;
        }
        if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
          return false;
        }
        if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
          return false;
        }
        if (e.ctrlKey && e.keyCode === 85) {
          return false;
        }
      };

    window.oncontextmenu = function () {
      return false;
    };

    console.disable = function () { };
    console.log = function () { };
    console.table = function () { };
    console.info = function () { };
    console.warn = function () { };
    console.error = function () { };
  }, []);

  useEffect(() => {
    if (testData?.honestRespondent?.type !== "Disable") {
      const honestRespondentVal =
        testData?.honestRespondent?.type === "Enable Warnings and test block"
          ? testData?.honestRespondent?.maxAttempts
          : testData?.honestRespondent?.type === "Enable Warnings Only"
            ? "Enable Warnings Only"
            : "";

      if (testData?.honestRespondent && testData?.honestResponden !== null) {
        const cleanup = handleTabVisibility(
          honestRespondentVal,
          setIsModalOpen,
        );
        return () => {
          cleanup();
        };
      }
      return;
    }
  }, [testData?.honestRespondent?.type]);

  // const socket = io("http://localhost:2222", {
  const socket = io(socketUrl, {
    transports: ["websocket"], // Force WebSocket only
    upgrade: false,
    timeout: 60000,
    forceNew: true,
    autoConnect: true,
    auth: {
      token,
    },
  });

  return (
    <div style={{ height: "100%" }}>
      <SearchParamsComp />
      <TestUI
        socket={socket}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      // sessionData={sessionData || {}}
      />
    </div>
  );
}
