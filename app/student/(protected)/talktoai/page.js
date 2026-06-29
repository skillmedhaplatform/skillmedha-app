"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button, Input, Card, Badge, Progress } from "antd";
import {
  ClockCircleOutlined,
  VideoCameraOutlined,
  AudioOutlined,
  PlayCircleOutlined,
  StopOutlined,
  SendOutlined,
  ReloadOutlined,
  QuestionCircleOutlined,
  EditOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  BulbOutlined,
  StarOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useUserMedia } from "@/helpers/useUserMedia";
import { formatTime } from "@/helpers/formatVideoTime";
import axios from "axios";
import { getLstorage } from "@/universalUtils/windowMW";
import { aiUrl, restUrl } from "@/config/urls";
import { BsX, BsPlus, BsStar } from "react-icons/bs";
import { HiOutlineChatBubbleLeftRight } from "react-icons/hi2";
import MobileTalkToAi from "@/mobile_views/talktoai/MobileTalkToAi";
import useResponsive from "@/hooks/useResponsive";

// ─── Azure Blob Storage Config ────────────────────────────────────────────────
const AZURE_ACCOUNT_NAME = process.env.AZURE_ACCOUNT_NAME;
const AZURE_ACCOUNT_KEY = process.env.AZURE_ACCOUNT_KEY;
const AZURE_CONTAINER_NAME = process.env.AZURE_CONTAINER_NAME;

/**
 * Sign an Azure Blob Storage request using Shared Key auth (Web Crypto API).
 * Works in the browser — no Node.js crypto needed.
 */
const buildAzureAuthHeader = async (method, blobName, contentType, contentLength, dateStr) => {
  const canonicalizedHeaders =
    `x-ms-blob-type:BlockBlob\n` +
    `x-ms-date:${dateStr}\n` +
    `x-ms-version:2020-04-08\n`;

  const canonicalizedResource = `/${AZURE_ACCOUNT_NAME}/${AZURE_CONTAINER_NAME}/${blobName}`;

  const stringToSign = [
    method,        // VERB
    "",            // Content-Encoding
    "",            // Content-Language
    contentLength, // Content-Length (must be a string)
    "",            // Content-MD5
    contentType,   // Content-Type
    "",            // Date (use x-ms-date instead)
    "",            // If-Modified-Since
    "",            // If-Match
    "",            // If-None-Match
    "",            // If-Unmodified-Since
    "",            // Range
    canonicalizedHeaders,
    canonicalizedResource,
  ].join("\n");

  // Decode the base64 account key and import it for HMAC-SHA256
  const keyBytes = Uint8Array.from(atob(AZURE_ACCOUNT_KEY), (c) => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const encoder   = new TextEncoder();
  const sigBytes  = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(stringToSign));
  const signature = btoa(String.fromCharCode(...new Uint8Array(sigBytes)));

  return `SharedKey ${AZURE_ACCOUNT_NAME}:${signature}`;
};

/**
 * Upload a Blob to Azure Blob Storage using Shared Key authentication.
 * Returns the public URL of the uploaded blob.
 *
 * @param {Blob}   blob      - The media blob to upload
 * @param {string} blobName  - Filename suffix (e.g. "audio.webm")
 * @returns {Promise<string>} - Public blob URL
 */
const uploadToAzureBlob = async (blob, blobName) => {
  const uniqueName  = `${Date.now()}-${blobName}`;
  const contentType = blob.type || "application/octet-stream";
  const contentLen  = String(blob.size);
  const dateStr     = new Date().toUTCString();

  const authHeader = await buildAzureAuthHeader(
    "PUT",
    uniqueName,
    contentType,
    contentLen,
    dateStr
  );

  const url = `https://${AZURE_ACCOUNT_NAME}.blob.core.windows.net/${AZURE_CONTAINER_NAME}/${uniqueName}`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Authorization":   authHeader,
      "x-ms-blob-type":  "BlockBlob",
      "x-ms-date":       dateStr,
      "x-ms-version":    "2020-04-08",
      "Content-Type":    contentType,
      "Content-Length":  contentLen,
    },
    body: blob,
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => response.statusText);
    throw new Error(`Azure upload failed (${response.status}): ${errText}`);
  }

  return url;
};

// ─── Component ────────────────────────────────────────────────────────────────

const Dictaphone = () => {
  const { stream, error, isLoading } = useUserMedia({
    video: true,
    audio: true,
  });

  const videoRef         = useRef(null);
  const videoReplayRef   = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioRecorderRef = useRef(null);
  const timerRef         = useRef(null);
  // Stable ref so recorder setup always reads the latest stream
  // without depending on the React state closure
  const streamRef        = useRef(null);

  // ── Recording state ──────────────────────────────────────────────────────
  const [isReplaying,        setIsReplaying]        = useState(false);
  const [triggerReplay,      setTriggerReplay]       = useState(false);
  const [currentTime,        setCurrentTime]         = useState(0);
  const [listening,          setListening]           = useState(false);
  const [recordingStarted,   setRecordingStarted]    = useState(false);
  const [hasRecorded,        setHasRecorded]         = useState(false);

  // ── Media blobs ──────────────────────────────────────────────────────────
  const [videoBlob,          setVideoBlob]           = useState(null);
  const [audioBlob,          setAudioBlob]           = useState(null);

  // ── Upload / transcription state ─────────────────────────────────────────
  const [transcript,         setTranscript]          = useState("");
  const [isProcessingAudio,  setIsProcessingAudio]   = useState(false);
  const [isUploadingVideo,   setIsUploadingVideo]    = useState(false);
  const [audioUploadError,   setAudioUploadError]    = useState(false);
  const [videoUploadError,   setVideoUploadError]    = useState(false);
  const [uploadedVideoUrl,   setUploadedVideoUrl]    = useState(null);

  // ── AI / submission state ────────────────────────────────────────────────
  const [waitSubmit,         setWaitSubmit]          = useState(false);
  const [aiSuggestions,      setAiSuggestions]       = useState({
    grammarAndSpellingCheck:      null,
    clarityAndStyleSuggestions:   null,
    positiveFeedback:             null,
    reviewedText:                 null,
    report:                       null,
    relevance:                    null,
  });

  // ── Question state ───────────────────────────────────────────────────────
  const questions = [
    "Tell me about yourself.",
    "Why do you want to work at our company?",
    "What are your greatest strengths?",
    "What is your biggest weakness?",
    "Describe a time you faced a conflict at work and how you handled it.",
    "Where do you see yourself in five years?",
    "Why are you leaving your current job?",
    "How do you handle stress and pressure?",
    "What motivates you to perform well?",
    "Do you prefer working independently or in a team?",
  ];

  const [quesNo,       setQuesNo]       = useState(() => Math.floor(Math.random() * questions.length));
  const [addQuesFlag,  setAddQuesFlag]  = useState(false);
  const [addQues,      setAddQues]      = useState("");
  const [activeTab,    setActiveTab]    = useState(0);

  const baseurl  = aiUrl;
  const resturl  = restUrl;
  const token    = getLstorage("token");

  // ── Keep streamRef current ───────────────────────────────────────────────
  useEffect(() => {
    streamRef.current = stream;
  }, [stream]);

  // ── Live preview ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isReplaying && stream) {
      setTimeout(() => {
        const videoEl = videoRef.current;
        if (videoEl) {
          videoEl.srcObject = stream;
          videoEl.onloadedmetadata = () => {
            videoEl.play().catch((err) => console.warn("Live video play failed:", err));
          };
        }
      }, 0);
    }
  }, [stream, isReplaying]);

  // ── Replay trigger ───────────────────────────────────────────────────────
  useEffect(() => {
    if (triggerReplay && isReplaying && videoReplayRef.current) {
      const replayEl = videoReplayRef.current;

      if (!uploadedVideoUrl) {
        console.warn("No uploaded video URL found.");
        return;
      }

      replayEl.pause();
      replayEl.srcObject = null;
      replayEl.removeAttribute("src");
      replayEl.src = uploadedVideoUrl;

      replayEl.onloadeddata = () => {
        replayEl
          .play()
          .then(() => console.log("Replay started"))
          .catch((err) => console.error("Replay failed:", err));
      };

      setTriggerReplay(false);
    }
  }, [triggerReplay, isReplaying, uploadedVideoUrl]);

  // ── Azure upload + transcription ─────────────────────────────────────────
  /**
   * 1. Upload audio blob directly to Azure Blob Storage (Shared Key auth).
   * 2. Also send the blob to the backend /uploadtos3 transcription endpoint
   *    (which handles the actual speech-to-text and returns transcription.text).
   *    We keep both so the backend pipeline is unchanged.
   */
  const uploadAudioAndTranscribe = async (blob) => {
    setIsProcessingAudio(true);
    setAudioUploadError(false);

    try {
      // ── Step 1: Upload to Azure Blob Storage directly ──────────────────
      await uploadToAzureBlob(blob, "audio.webm");

      // ── Step 2: Send blob to backend for transcription ─────────────────
      // Matches the original /uploadtos3 contract exactly
      const formData = new FormData();
      formData.append("file", blob, "audio.webm");

      const { data } = await axios.post(
        `${resturl}/uploadtos3?bucketName=skillmedha-speech&task=transcribe`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTranscript(data?.transcription?.text || data?.text || "");
    } catch (err) {
      console.error("Audio upload/transcription failed:", err);
      setAudioUploadError(true);
    } finally {
      setIsProcessingAudio(false);
    }
  };

  /**
   * Upload video blob directly to Azure Blob Storage for replay.
   * Also mirrors to the backend bucket for consistency.
   */
  const uploadVideo = async (blob) => {
    setIsUploadingVideo(true);
    setVideoUploadError(false);

    try {
      // ── Upload to Azure for replay URL ─────────────────────────────────
      const videoUrl = await uploadToAzureBlob(blob, "video.webm");
      setUploadedVideoUrl(videoUrl);

      // ── Mirror to backend (non-blocking, best-effort) ──────────────────
      const formData = new FormData();
      formData.append("file", blob, "video.webm");
      axios
        .post(`${resturl}/uploadtos3?bucketName=skillmedha-speech`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        })
        .catch((e) => console.warn("Backend video mirror failed (non-critical):", e));
    } catch (err) {
      console.error("Video upload failed:", err);
      setVideoUploadError(true);
    } finally {
      setIsUploadingVideo(false);
    }
  };

  // ── Recording controls ───────────────────────────────────────────────────
  const resetState = () => {
    setTranscript("");
    setActiveTab(0);
    setCurrentTime(0);
    setHasRecorded(false);
    setIsProcessingAudio(false);
    setIsUploadingVideo(false);
    setAudioUploadError(false);
    setVideoUploadError(false);
    setUploadedVideoUrl(null);
    setVideoBlob(null);
    setAudioBlob(null);
    setAiSuggestions({
      grammarAndSpellingCheck:    null,
      clarityAndStyleSuggestions: null,
      positiveFeedback:           null,
      reviewedText:               null,
      report:                     null,
      relevance:                  null,
    });
  };

  const handleStartRec = () => {
    // Always read from the ref — the closure over `stream` may be stale
    const activeStream = streamRef.current;

    if (!activeStream || !(activeStream instanceof MediaStream)) {
      console.warn("handleStartRec: stream not ready yet.");
      return;
    }

    const videoTracks = activeStream.getVideoTracks();
    const audioTracks = activeStream.getAudioTracks();

    if (audioTracks.length === 0) {
      console.warn("handleStartRec: no audio tracks available.");
      return;
    }

    setIsReplaying(false);

    if (videoReplayRef.current) {
      videoReplayRef.current.pause();
      videoReplayRef.current.srcObject = null;
      videoReplayRef.current.removeAttribute("src");
    }

    resetState();
    setRecordingStarted(true);
    setListening(true);

    // Restore live preview
    if (videoRef.current) {
      videoRef.current.srcObject = activeStream;
      videoRef.current.currentTime = 0;
      videoRef.current
        .play()
        .catch((err) => console.warn("Live video play failed after reset:", err));
    }

    // Timer — auto-stop at 60 s
    timerRef.current = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= 60) {
          handleStopRec();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    try {
      // ── Video recorder (audio + video) ──────────────────────────────────
      const videoRecorder = new MediaRecorder(activeStream, {
        mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
          ? "video/webm;codecs=vp9,opus"
          : MediaRecorder.isTypeSupported("video/webm")
          ? "video/webm"
          : "",
      });
      const videoChunks = [];
      videoRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) videoChunks.push(e.data);
      };
      videoRecorder.onstop = () => {
        const blob = new Blob(videoChunks, { type: "video/webm" });
        setVideoBlob(blob);
        uploadVideo(blob);
      };
      videoRecorder.start(250); // collect data every 250 ms
      mediaRecorderRef.current = videoRecorder;

      // ── Audio-only recorder (for transcription) ──────────────────────────
      // Build a new stream from only the audio tracks to avoid MediaRecorder
      // "parameter 1 is not of type MediaStream" on some browsers
      const audioOnlyStream = new MediaStream([...audioTracks]);
      const audioRecorder = new MediaRecorder(audioOnlyStream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "",
      });
      const audioChunks = [];
      audioRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunks.push(e.data);
      };
      audioRecorder.onstop = () => {
        const blob = new Blob(audioChunks, { type: "audio/webm" });
        setAudioBlob(blob);
        uploadAudioAndTranscribe(blob);
      };
      audioRecorder.start(250);
      audioRecorderRef.current = audioRecorder;

    } catch (err) {
      console.error("Failed to start MediaRecorder:", err);
      // Roll back UI state so the user can try again
      clearInterval(timerRef.current);
      timerRef.current = null;
      setListening(false);
      setRecordingStarted(false);
      setHasRecorded(false);
    }
  };

  const handleStopRec = () => {
    setListening(false);
    setRecordingStarted(false);
    setHasRecorded(true);

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
      videoRef.current.removeAttribute("src");
    }

    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (audioRecorderRef.current?.state !== "inactive") {
      audioRecorderRef.current.stop();
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleReplayRec = () => {
    setIsReplaying(true);
    setTriggerReplay(true);
  };

  // ── AI Feedback submission ────────────────────────────────────────────────
  const handleSubmitRec = async () => {
    if (!transcript.trim()) return;

    try {
      setWaitSubmit(true);
      const { data } = await axios.post(
        `${baseurl}/checkEnglishText`,
        {
          text:     transcript,
          question: addQues || questions[quesNo],
          userType: "student",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.report) setActiveTab(1);
      setAiSuggestions(data);
    } catch (err) {
      console.error("AI feedback request failed:", err);
    } finally {
      setWaitSubmit(false);
    }
  };

  // ── Retry helpers ─────────────────────────────────────────────────────────
  const handleRetryAudio = () => {
    if (audioBlob) uploadAudioAndTranscribe(audioBlob);
  };

  const handleRetryVideo = () => {
    if (videoBlob) uploadVideo(videoBlob);
  };

  // ── Derived UI state ──────────────────────────────────────────────────────
  const getRecordingStatus = () => {
    if (listening)          return { text: "Recording",        color: "red",    pulse: true  };
    if (isProcessingAudio)  return { text: "Processing audio", color: "orange", pulse: true  };
    if (isUploadingVideo)   return { text: "Uploading video",  color: "orange", pulse: true  };
    if (audioUploadError)   return { text: "Upload failed",    color: "red",    pulse: false };
    if (uploadedVideoUrl && transcript)
                            return { text: "Ready",            color: "green",  pulse: false };
    if (hasRecorded)        return { text: "Processing…",      color: "orange", pulse: true  };
    return                         { text: "Ready",            color: "blue",   pulse: false };
  };

  const recordingStatus  = getRecordingStatus();
  const progressPercent  = (currentTime / 60) * 100;

  const isSubmitDisabled = () =>
    !hasRecorded    ||
    listening       ||
    isProcessingAudio ||
    !transcript.trim() ||
    waitSubmit;

  const isResponsive = useResponsive();

  // ── Mobile hand-off ───────────────────────────────────────────────────────
  if (isResponsive) {
    return (
      <MobileTalkToAi
        isLoading={isLoading}
        isReplaying={isReplaying}
        currentTime={currentTime}
        listening={listening}
        recordingStarted={recordingStarted}
        transcript={transcript}
        setTranscript={setTranscript}
        videoBlob={videoBlob}
        audioBlob={audioBlob}
        isProcessingAudio={isProcessingAudio}
        hasRecorded={hasRecorded}
        uploadedVideoUrl={uploadedVideoUrl}
        waitSubmit={waitSubmit}
        questions={questions}
        quesNo={quesNo}
        setQuesNo={setQuesNo}
        addQuesFlag={addQuesFlag}
        setAddQuesFlag={setAddQuesFlag}
        addQues={addQues}
        setAddQues={setAddQues}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        aiSuggestions={aiSuggestions}
        recordingStatus={recordingStatus}
        progressPercent={progressPercent}
        isSubmitDisabled={isSubmitDisabled}
        audioUploadError={audioUploadError}
        videoUploadError={videoUploadError}
        videoRef={videoRef}
        videoReplayRef={videoReplayRef}
        handleStartRec={handleStartRec}
        handleStopRec={handleStopRec}
        handleReplayRec={handleReplayRec}
        handleSubmitRec={handleSubmitRec}
        handleRetryAudio={handleRetryAudio}
        handleRetryVideo={handleRetryVideo}
      />
    );
  }

  // ── Desktop layout ────────────────────────────────────────────────────────
  return (
    <section className="w-full h-full flex flex-col items-stretch lg:pt-0">

      {/* ── Banner ─────────────────────────────────────────────────────── */}
      <div className="w-full h-[140px] min-h-[140px] flex flex-col justify-center items-start gap-2 p-4 lg:px-8 shadow-sm rounded-2xl lg:rounded-none bg-gradient-to-br from-[#071631] to-[#10254c] text-white shrink-0 relative overflow-hidden z-[2]">
        <div className="absolute inset-0 pointer-events-none z-[1]">
          <BsX    className="absolute top-[20%] right-[10%] text-[#1E69DA] opacity-60 text-[1.2rem]" />
          <BsPlus className="absolute bottom-[20%] right-[30%] text-[#1E69DA] opacity-50 text-[1.5rem]" />
          <BsStar className="absolute top-[40%] right-[50%] text-[#1E69DA] opacity-50 text-[1.1rem]" />
          <BsX    className="absolute bottom-[30%] right-[5%]  text-[#1E69DA] opacity-60 text-[1.3rem]" />
        </div>

        <div className="flex items-center justify-between w-full relative z-[2]">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-[56px] h-[56px] bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10 shrink-0">
              <HiOutlineChatBubbleLeftRight className="text-white text-3xl" />
            </div>
            <div className="flex flex-col justify-center gap-1">
              <h1 className="text-[24px] lg:text-[28px] font-bold text-white m-0 tracking-tight leading-none flex items-center gap-3 pb-0" style={{ border: "none", marginBottom: 0 }}>
                Talk to AI
              </h1>
              <p className="text-white/90 text-[14px] lg:text-[15px] m-0 leading-tight" style={{ marginTop: 0 }}>
                Your personal AI Interview Assistant to help you prepare and succeed.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main grid ──────────────────────────────────────────────────── */}
      <div className="w-full flex-1 flex flex-col items-stretch overflow-hidden relative">
        <div className="w-full h-full overflow-hidden p-4 lg:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-[1.5rem] lg:gap-6 max-w-[1400px] mx-auto h-full">

            {/* ── Left: Video recorder ──────────────────────────────────── */}
            <Card
              className="bg-white rounded-2xl shadow-md border border-[#e2e8f0] overflow-hidden [&_.ant-card-body]:p-6 [&_.ant-card-body]:flex-1 [&_.ant-card-body]:flex [&_.ant-card-body]:flex-col [&_.ant-card-body]:min-h-0 flex flex-col h-full"
              variant="borderless"
            >
              {/* Status bar */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                  <Badge
                    status={recordingStatus.pulse ? "processing" : "default"}
                    color={recordingStatus.color}
                    text={recordingStatus.text}
                  />
                  <div className="flex items-center gap-2 px-3 py-1 bg-[#f8fafc] rounded-full font-semibold text-[#475569] border border-[#e2e8f0]">
                    <ClockCircleOutlined />
                    <span>{formatTime(currentTime)} / 01:00</span>
                  </div>
                </div>

                {/* Video upload error hint */}
                {videoUploadError && (
                  <Button
                    size="small"
                    danger
                    icon={<ReloadOutlined />}
                    onClick={handleRetryVideo}
                  >
                    Retry video upload
                  </Button>
                )}
              </div>

              {/* Video area */}
              <div className="relative w-full flex-1 min-h-0 bg-[#1e293b] rounded-xl overflow-hidden mb-4 flex items-center justify-center">
                {isLoading ? (
                  <div className="flex flex-col items-center gap-4 text-white">
                    <VideoCameraOutlined className="text-5xl opacity-70" />
                    <p className="m-0 text-[1.1rem]">Initializing Camera…</p>
                  </div>
                ) : isReplaying ? (
                  <video
                    ref={videoReplayRef}
                    controls
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    ref={videoRef}
                    controls={false}
                    className="w-full h-full object-cover scale-x-[-1]"
                    muted
                  />
                )}

                {listening && (
                  <div className="absolute top-4 right-4">
                    <div className="bg-[#ff4d4f] text-white p-2 rounded-full animate-pulse flex items-center justify-center">
                      <AudioOutlined />
                    </div>
                  </div>
                )}

                {isProcessingAudio && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                    <div className="flex flex-col items-center gap-2 text-white justify-center">
                      <AudioOutlined className="animate-spin text-4xl" />
                      <p>Transcribing audio…</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress bar */}
              <Progress
                percent={progressPercent}
                strokeColor="#ff4d4f"
                showInfo={false}
                className="mb-6 [&_.ant-progress-bg]:transition-all [&_.ant-progress-bg]:duration-300"
              />

              {/* Action buttons */}
              <div className="grid grid-cols-3 gap-4 [&_.ant-btn]:h-[48px] [&_.ant-btn]:rounded-lg [&_.ant-btn]:font-semibold [&_.ant-btn]:flex [&_.ant-btn]:items-center [&_.ant-btn]:justify-center [&_.ant-btn]:gap-2 [&_.ant-btn]:shadow-sm hover:[&_.ant-btn]:-translate-y-[2px] hover:[&_.ant-btn]:shadow-md [&_.ant-btn]:transition-all">
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={handleStartRec}
                  disabled={!stream || listening || isProcessingAudio}
                  size="large"
                  className="!bg-gradient-to-br !from-[#1E69DA] !to-[#5694F0] !border-none"
                >
                  {!stream ? "Waiting for camera…" : "Start Recording"}
                </Button>

                <Button
                  danger
                  icon={<StopOutlined />}
                  onClick={handleStopRec}
                  disabled={!listening}
                  size="large"
                >
                  Stop
                </Button>

                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleReplayRec}
                  disabled={!uploadedVideoUrl}
                  size="large"
                >
                  Replay
                </Button>

                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSubmitRec}
                  loading={waitSubmit}
                  disabled={isSubmitDisabled()}
                  size="large"
                  className="col-span-3 !bg-gradient-to-br !from-[#1E69DA] !to-[#5694F0] !border-none !h-[56px] !text-[1.1rem] !text-white"
                >
                  {isProcessingAudio ? "Processing audio…" : "Get AI Feedback"}
                </Button>
              </div>
            </Card>

            {/* ── Right panel ───────────────────────────────────────────── */}
            <div className="flex flex-col gap-4 h-full min-h-0">

              {/* Question card */}
              <Card
                title={
                  <div className="flex items-center gap-2 text-[1.1rem] font-semibold text-[#1E69DA] [&_.anticon]:text-[1.2rem]">
                    <QuestionCircleOutlined />
                    <span>Interview Question</span>
                  </div>
                }
                className="bg-white rounded-2xl shadow-md border border-[#e2e8f0] [&_.ant-card-head]:border-b [&_.ant-card-head]:border-[#f0f0f0] [&_.ant-card-head]:py-4 [&_.ant-card-head]:px-6"
                variant="borderless"
              >
                <div className="text-[1.1rem] leading-[1.6] text-[#1e293b] mb-6 p-4 bg-[#f8fafc] rounded-lg border-l-4 border-[#1E69DA]">
                  {addQues || questions[quesNo]}
                </div>

                <div>
                  {addQuesFlag ? (
                    <div className="flex gap-3 items-start [&_.ant-input]:rounded-lg [&_.ant-input]:border-2 [&_.ant-input]:border-[#e2e8f0] focus:[&_.ant-input]:border-[#1E69DA]">
                      <Input
                        placeholder="Enter your custom question…"
                        value={addQues}
                        onChange={(e) => setAddQues(e.target.value)}
                        onPressEnter={() => setAddQuesFlag(false)}
                      />
                      <Button
                        type="primary"
                        icon={addQues ? <CheckCircleOutlined /> : undefined}
                        onClick={() => setAddQuesFlag(false)}
                      >
                        {addQues ? "Save" : "Cancel"}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-3 [&_.ant-btn]:rounded-lg [&_.ant-btn]:h-[40px] [&_.ant-btn]:font-medium">
                      <Button
                        icon={<ReloadOutlined />}
                        onClick={() => {
                          setAddQues("");
                          setQuesNo(Math.floor(Math.random() * questions.length));
                        }}
                        className="!bg-white !text-[#1E69DA] !border !border-[#1E69DA] hover:!bg-gradient-to-br hover:!from-[#1E69DA] hover:!to-[#5694F0] hover:!text-white hover:!border-transparent transition-all"
                      >
                        New Question
                      </Button>
                      <Button
                        icon={<EditOutlined />}
                        onClick={() => setAddQuesFlag(true)}
                        className="!bg-white !text-[#1E69DA] !border !border-[#1E69DA] hover:!bg-gradient-to-br hover:!from-[#1E69DA] hover:!to-[#5694F0] hover:!text-white hover:!border-transparent transition-all"
                      >
                        Custom Question
                      </Button>
                    </div>
                  )}
                </div>
              </Card>

              {/* Results card */}
              <Card
                className="bg-white rounded-2xl shadow-md border border-[#e2e8f0] flex-1 flex flex-col min-h-0 [&_.ant-card-body]:p-0 [&_.ant-card-body]:flex-1 [&_.ant-card-body]:flex [&_.ant-card-body]:flex-col [&_.ant-card-body]:min-h-0"
                variant="borderless"
              >
                {/* Tabs */}
                <div className="flex border-b border-[#f0f0f0] overflow-x-auto [&::-webkit-scrollbar]:hidden">
                  {[
                    { label: "Your Answer",  icon: <FileTextOutlined />, idx: 0, gated: false },
                    { label: "AI Report",    icon: <StarOutlined />,     idx: 1, gated: !aiSuggestions.report },
                    { label: "Suggestions",  icon: <BulbOutlined />,     idx: 2, gated: !aiSuggestions.report },
                  ].map(({ label, icon, idx, gated }) => (
                    <div
                      key={idx}
                      onClick={() => !gated && setActiveTab(idx)}
                      className={[
                        "flex-1 p-4 flex items-center justify-center gap-2 cursor-pointer font-semibold text-[#64748b] bg-[#f8fafc] transition-all duration-300 border-b-[3px] border-transparent whitespace-nowrap shrink-0 min-w-fit [&_.anticon]:text-[1.1rem] hover:bg-[#f1f5f9] hover:text-[#1E69DA]",
                        activeTab === idx ? "!bg-white !text-[#1E69DA] !border-[#1E69DA]" : "",
                        gated ? "opacity-50 cursor-not-allowed hover:!bg-[#f8fafc] hover:!text-[#64748b]" : "",
                      ].join(" ")}
                    >
                      {icon}
                      <span>{label}</span>
                    </div>
                  ))}
                </div>

                {/* Tab content */}
                <div className="flex-1 min-h-0 overflow-y-auto p-6 [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-[#f1f1f1] [&::-webkit-scrollbar-track]:rounded-[3px] [&::-webkit-scrollbar-thumb]:bg-[#c1c1c1] [&::-webkit-scrollbar-thumb]:rounded-[3px] hover:[&::-webkit-scrollbar-thumb]:bg-[#a8a8a8]">

                  {/* ── Tab 0: Your Answer ── */}
                  {activeTab === 0 && (
                    <div>
                      {isProcessingAudio ? (
                        <div className="flex flex-col items-center justify-center gap-3 h-[200px] text-[#475569]">
                          <AudioOutlined className="animate-spin text-4xl" />
                          <p className="m-0">Transcribing your audio…</p>
                        </div>

                      ) : audioUploadError ? (
                        <div className="flex flex-col items-center justify-center gap-4 h-auto py-8 text-center">
                          <WarningOutlined className="text-4xl text-[#ff4d4f]" />
                          <p className="m-0 text-[#ff4d4f] font-semibold">
                            Audio transcription failed.
                          </p>
                          <p className="m-0 text-[#64748b] text-sm">
                            Check your connection and try again, or type your answer below.
                          </p>
                          <Button
                            icon={<ReloadOutlined />}
                            onClick={handleRetryAudio}
                            type="primary"
                            className="!bg-gradient-to-br !from-[#1E69DA] !to-[#5694F0] !border-none"
                          >
                            Retry transcription
                          </Button>
                          <div className="w-full mt-2">
                            <p className="text-[#94a3b8] text-sm mb-2 text-left">
                              Or type your answer manually:
                            </p>
                            <Input.TextArea
                              rows={5}
                              value={transcript}
                              onChange={(e) => setTranscript(e.target.value)}
                              placeholder="Type your answer here to still get AI feedback…"
                              className="rounded-lg border-[#e2e8f0]"
                            />
                          </div>
                        </div>

                      ) : transcript ? (
                        <p className="text-[1rem] leading-[1.7] text-[#334155] m-0">
                          {transcript}
                        </p>

                      ) : (
                        <div className="flex flex-col items-center justify-center gap-4 h-[200px] text-[#94a3b8] text-center">
                          <AudioOutlined className="text-5xl opacity-50" />
                          <p className="m-0 text-[1rem]">
                            Start recording to see your transcribed answer here
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Tab 1: AI Report ── */}
                  {activeTab === 1 && (
                    <div
                      className="text-[1rem] leading-[1.6] text-[#334155] [&_h1]:text-[#1E69DA] [&_h1]:mt-6 [&_h1]:mb-3 [&_h2]:text-[#1E69DA] [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-[#1E69DA] [&_h3]:mt-6 [&_h3]:mb-3 [&_ul]:pl-6 [&_ol]:pl-6 [&_li]:mb-2"
                      dangerouslySetInnerHTML={{
                        __html: aiSuggestions.report || "<p>Complete your recording and submit for AI analysis</p>",
                      }}
                    />
                  )}

                  {/* ── Tab 2: Suggestions ── */}
                  {activeTab === 2 && (
                    <div>
                      {[
                        { key: "relevance",                  emoji: "📊", title: "Relevance Analysis"   },
                        { key: "grammarAndSpellingCheck",    emoji: "✏️", title: "Grammar & Language"   },
                        { key: "clarityAndStyleSuggestions", emoji: "💡", title: "Clarity & Style"      },
                        { key: "positiveFeedback",           emoji: "⭐", title: "Positive Highlights"  },
                      ].map(({ key, emoji, title }) =>
                        aiSuggestions[key] ? (
                          <div
                            key={key}
                            className="mb-8 p-4 bg-[#f8fafc] rounded-lg border-l-4 border-[#1E69DA]"
                          >
                            <h4 className="m-0 mb-3 text-[#1e293b] text-[1.1rem] font-semibold">
                              {emoji} {title}
                            </h4>
                            <div
                              className="text-[#475569] leading-[1.6]"
                              dangerouslySetInnerHTML={{ __html: aiSuggestions[key] }}
                            />
                          </div>
                        ) : null
                      )}

                      {!aiSuggestions.report && (
                        <div className="flex flex-col items-center justify-center gap-4 h-[200px] text-[#94a3b8] text-center">
                          <BulbOutlined className="text-5xl opacity-50" />
                          <p className="m-0 text-[1rem]">
                            AI suggestions will appear here after analysis
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </Card>
            </div>
            {/* ── End right panel ── */}

          </div>
        </div>
      </div>
    </section>
  );
};

export default Dictaphone;