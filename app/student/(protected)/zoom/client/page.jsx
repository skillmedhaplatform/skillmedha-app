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

export default function ZoomClient({ meetingId, orgId, currentTopic }) {
  const dispatch = useDispatch();
  const studentCreds = useSelector((state) => state.student.student?.data);

  const currentMeetingDetails = useSelector(
    (state) => state.internship.currentMeeting
  );

  const [joined, setJoined] = useState(false);
  const [ready, setReady] = useState(true);
  const zoomMtgRef = useRef(null);

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

  useEffect(() => {
    if (meetingId) {
      dispatch(currentMeeting({ id: meetingId, orgId }))?.then(({ payload }) => {
        setMeetingData((prev) => ({
          ...prev,
          meetingNumber: Number(payload?.meetingDetails?.id),
          passWord: payload?.meetingDetails?.password,
        }));
      });
    }
  }, [meetingId, orgId, dispatch]);

  const updateProgressDebouncedRef = useRef(null);

  useEffect(() => {
    updateProgressDebouncedRef.current = _.debounce((currentTime) => {
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
    }, 5000);
    return () => {
      updateProgressDebouncedRef.current?.cancel();
    };
  }, [meetingId, studentCreds?._id, orgId, dispatch]);

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
          setMeetingData((prev) => ({
            ...prev,
            meetingNumber: Number(payload?.meetingDetails?.id),
            passWord: payload?.meetingDetails?.password,
          }));
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
  }, [meetingId, orgId, dispatch]);

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
    <div className="h-full w-full relative">
      {currentMeetingDetails?.recordedUrl ? (
        <div className="flex justify-center items-center h-full w-full z-[100] border-none outline-none">
          <video
            ref={videoRef}
            onTimeUpdate={(e) => updateProgressDebouncedRef.current?.(e.target.currentTime)}
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
            <div className="flex flex-col items-center justify-center text-center gap-6 relative z-[100] px-4 w-full">
              {/* Circular Avatar Placeholder */}
              <div className="w-24 h-24 rounded-full border-2 border-slate-700 bg-slate-800/40 flex items-center justify-center text-slate-400 shadow-inner">
                <svg className="w-12 h-12 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>

              {/* Title & Info */}
              <div className="flex flex-col gap-1.5">
                <div className="text-white text-xl font-bold tracking-tight">
                  {currentTopic?.title || "Live Lecture"}
                </div>
                <div className="text-slate-400 text-sm font-semibold tracking-wider uppercase flex items-center justify-center gap-2">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
                  Live Session
                </div>
              </div>

              {/* Join Meeting Button */}
              <button
                onClick={() => {
                  if (currentMeetingDetails?._id) {
                    getSignature();
                  } else {
                    message.warning("Please wait while fetching meeting details");
                  }
                }}
                disabled={!ready}
                className="join-meeting-btn"
              >
                {ready ? "Join Meeting" : "Loading Zoom…"}
              </button>
            </div>
          )}
        </div>
      )}

      <div id="zmmtg-root"></div>
    </div>
  );
}
