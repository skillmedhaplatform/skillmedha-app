"use client";
import {
  saveTestResults,
  updateTestStatus,
} from "@/redux/slices/assessmentsSlice/studentSlice";
import { fetchTestData } from "@/redux/slices/assessmentsSlice/testSlice";
import { assessment_socket_url } from "@/config/urls";
import {
  deleteSstorageVal,
  deleteLstorageVal,
  getLstorage,
  getSstorage,
  setLstorage,
  setSstorage,
} from "@/universalUtils/windowMW";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
export default function SocketComp() {
  const testData = useSelector((state) => state.tests.testData.value);
  const showResults = testData?.grading?.showResults;
  const studentCreds = useSelector((state) => state.student.student?.data);
  setSstorage("showResults", showResults);
  const [socket, setSocket] = useState(null);
  const dispatch = useDispatch();
  const nav = useRouter();
  const params = useParams();
  const searchQuery = useSearchParams();

  const userId = getLstorage("sId");
  useEffect(() => {
    const newSocket = io(assessment_socket_url, {
      auth: {
        token: getLstorage("token"),
      },
    });
    // const newSocket = io("http://localhost:2222", {
    //   auth: {
    //     token: getLstorage("token"),
    //   },
    // });
    setSocket(newSocket);

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  const [sendToSocket, setSendToSocket] = useState({});
  useEffect(() => {
    if (socket) {
      socket.emit("newUser", getSstorage("studentId"));
      socket.on("conn", (data) => {
        // console.log(data);
      });

      socket.on("userUpdates", (data) => {
        setSstorage("idFromSocket", data?.id);
        setSstorage("idSocket", data.socketId);
      });
      socket.on("testStartedStudent", (data) => {
        setSstorage("userIdInProgress", data?.userId);
      });

      socket.on("evaluatingTest", (data) => {
        dispatch(updateTestStatus("evaluatingTest"));
      });

      socket.on("testEndedtestportal", (data) => {
        deleteSstorageVal("userIdInProgress");
        dispatch(updateTestStatus(""));

        data.msgFlag = data?.testId == searchQuery?.get("testId");

        // dispatch(saveProgress({ ...data,  })).then((res) => {
        //   if (res?.payload?.msg) {
        dispatch(
          saveTestResults({
            userId: userId,
            testId: data.testId,
            response: data.response,
            studentData: data.studentData,
            flagged: data.flagged,
            scoreData: data.scoreData,
          })
        );

        setSendToSocket(data);

        dispatch(fetchTestData({ testId: searchQuery.get("testId") }));

        if (data.msgFlag) {
          deleteLstorageVal("isStarted");
          deleteSstorageVal("userIdInProgress");
          nav.replace(
            "/student/tests/" +
            params["test-slug"] +
            "/result?testId=" +
            searchQuery.get("testId")
          );
        } else {
          deleteLstorageVal("isStarted");
          deleteSstorageVal("userIdInProgress");
          nav.replace("/");
        }
        //   }
        // });
      });
    }
  }, [socket, getLstorage("sId")]);

  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");

  useEffect(() => {
    if (!socket) return;
    if (socket?.connected) {
      onConnect();
    }
    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  return <></>;
}
