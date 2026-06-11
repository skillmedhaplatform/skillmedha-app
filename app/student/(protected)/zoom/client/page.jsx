"use client";
import React, { useState, useEffect, useRef } from "react";
import "./page.css";
import { restUrl } from "@/config/urls";
import { message } from "antd";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { currentMeeting, updateVideoProgress } from "@/redux/slices/internship";
import _ from "lodash";
import { getLstorage } from "@/universalUtils/windowMW";

export default function ZoomClient({ meetingId, orgId }) {
  const studentCreds = useSelector((state) => state.student.student?.data);

  const currentMeetingDetails = useSelector(
    (state) => state.internship.currentMeeting
  );

  useEffect(() => {
    dispatch(currentMeeting({ id: meetingId, orgId }))?.then(({ payload }) => {
      setMeetingData({
        ...meetingData,
        meetingNumber: Number(payload?.meetingDetails?.id),
        passWord: payload?.meetingDetails?.password,
      });
    });
  }, [meetingId]);

  const [joined, setJoined] = useState(false);
  const [ready, setReady] = useState(true);
  const zoomMtgRef = useRef(null);

  const dispatch = useDispatch();

  const [meetingData, setMeetingData] = useState({
    authEndpoint: `${restUrl}/signature`,
    meetingNumber: 0,
    passWord: "",
    role: 0,
    userName: studentCreds?.userName || "client",
    leaveUrl: process.env.NEXT_PUBLIC_APP_URL,
    registrantToken: "",
    zakToken: "",
    userEmail: studentCreds?.email || "",
  });

  const videoRef = useRef(null);

  const updateProgressDebounced = useRef(
    _.debounce((currentTime) => {
      if (meetingId && studentCreds?._id) {
        dispatch(
          updateVideoProgress({
            userId: studentCreds._id,
            meetingId,
            progress: currentTime,
            totalDuration: videoRef.current?.duration,
            orgId,
          })
        );
      }
    }, 5000)
  ).current;

  useEffect(() => {
    if (
      currentMeetingDetails?.progress &&
      videoRef.current &&
      videoRef.current.currentTime === 0
    ) {
      videoRef.current.currentTime = currentMeetingDetails.progress;
    }
  }, [currentMeetingDetails]);

  useEffect(() => {
    if (meetingId) {
      dispatch(currentMeeting({ id: meetingId, orgId }))?.then(
        ({ payload }) => {
          setMeetingData({
            ...meetingData,
            meetingNumber: Number(payload?.meetingDetails?.id),
            passWord: payload?.meetingDetails?.password,
          });
        }
      );
      import("@zoom/meetingsdk")
        .then((mod) => {
          const { ZoomMtg } = mod;
          // ZoomMtg.preLoadWasm();
          // ZoomMtg.prepareWebSDK();
          zoomMtgRef.current = ZoomMtg;
          setReady(true);
        })
        .catch((err) => {
          console.error("Failed to load Zoom SDK:", err);
          message.error("Could not load Zoom SDK");
        });
    }
  }, [meetingId]);

  const getSignature = async () => {
    if (!zoomMtgRef.current) {
      return message.error("Zoom SDK not loaded yet—please wait");
    }
    try {
      const token = getLstorage("token");
      const res = await fetch(meetingData?.authEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          meetingNumber: meetingData?.meetingNumber,
          role: meetingData?.role,
        }),
      });
      const { signature, sdkKey } = await res.json();
      startMeeting(signature, sdkKey);
    } catch (err) {
      console.error(err);
      message.error("Failed to fetch signature");
    }
  };

  function startMeeting(signature, sdkKey) {
    const ZoomMtg = zoomMtgRef.current;
    ZoomMtg.init({
      leaveUrl: meetingData?.leaveUrl,
      patchJsMedia: true,
      leaveOnPageUnload: true,
      disablePreview: true,
      success: () => {
        ZoomMtg.join({
          signature,
          sdkKey,
          meetingNumber: meetingData?.meetingNumber,
          passWord: meetingData?.passWord,
          userName: meetingData?.userName,
          userEmail: meetingData?.userEmail,
          tk: meetingData?.registrantToken,
          zak: meetingData?.zakToken,
          success: () => setJoined(true),
          error: (err) => {
            console.error(err);
            message.error(err.errorMessage || "Join failed");
          },
        });
      },
      error: (err) => {
        console.error("Zoom init error:", err);
        message.error("Zoom init failed");
      },
    });
  }

  return (
    <div className="h-full w-full">
      {currentMeetingDetails?.recordedUrl ? (
        <div className="flex justify-center items-center h-full w-full z-[100] border-none outline-none">
          <video
            ref={videoRef}
            onTimeUpdate={(e) => updateProgressDebounced(e.target.currentTime)}
            className="w-full h-full"
            src={currentMeetingDetails?.recordedUrl}
            controls={true}
          />
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col justify-center items-center">
          {!meetingId && (
            <div className="text-[1.2rem] font-bold text-white">
              Meeting Not Started Yet
            </div>
          )}
          {!joined && meetingId && (
            <button
              onClick={() => {
                if (currentMeetingDetails?._id) {
                  getSignature();
                } else {
                  message.warning("Please wait while fetching meeting details");
                }
              }}
              disabled={!ready}
              className="text-[1.2rem] font-bold relative z-[100] cursor-pointer bg-[#1e69da] text-white px-6 py-3 rounded-lg border-none outline-none hover:bg-blue-600 transition-colors"
            >
              {ready ? "Join Meeting" : "Loading Zoom…"}
            </button>
          )}
        </div>
      )}

      <div id="zmmtg-root"></div>
    </div>
  );
}
