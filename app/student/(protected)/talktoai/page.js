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

const Dictaphone = () => {
  const { stream, error, isLoading } = useUserMedia({
    video: true,
    audio: true,
  });
  const videoRef = useRef(null);
  const videoReplayRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioRecorderRef = useRef(null);
  const timerRef = useRef(null);

  const [isReplaying, setIsReplaying] = useState(false);
  const [triggerReplay, setTriggerReplay] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [listening, setListening] = useState(false);
  const [recordingStarted, setRecordingStarted] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [videoBlob, setVideoBlob] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);

  const [uploadResults, setUploadResults] = useState({
    video: null,
    audio: null,
  });

  const [waitSubmit, setWaitSubmit] = useState(false);
  const baseurl = aiUrl;
  const resturl = restUrl;

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

  const [quesNo, setQuesNo] = useState(
    Math.floor(Math.random() * questions.length)
  );
  const [addQuesFlag, setAddQuesFlag] = useState(false);
  const [addQues, setAddQues] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const [aiSuggestions, setAiSuggestions] = useState({
    grammarAndSpellingCheck: null,
    clarityAndStyleSuggestions: null,
    positiveFeedback: null,
    reviewedText: null,
    report: null,
    relevance: null,
  });

  useEffect(() => {
    if (!isReplaying && stream) {
      setTimeout(() => {
        const videoEl = videoRef.current;
        if (videoEl) {
          videoEl.srcObject = stream;
          videoEl.onloadedmetadata = () => {
            videoEl
              .play()
              .catch((err) => console.warn("Live video play failed:", err));
          };
        }
      }, 0);
    }
  }, [stream, isReplaying]);

  useEffect(() => {
    if (triggerReplay && isReplaying && videoReplayRef.current) {
      const replayEl = videoReplayRef.current;
      const videoURL = uploadResults?.video?.file;

      if (!videoURL) {
        console.warn("No uploaded video file found.");
        return;
      }

      replayEl.pause();
      replayEl.srcObject = null;
      replayEl.removeAttribute("src");
      replayEl.src = videoURL;

      replayEl.onloadeddata = () => {
        replayEl
          .play()
          .then(() => console.log("Replay started"))
          .catch((err) => console.error("Replay failed:", err));
      };

      setTriggerReplay(false);
    }
  }, [triggerReplay, isReplaying, uploadResults]);

  const token = getLstorage("token");

  const uploadBlobToS3 = async (blob, isAudioOnly) => {
    try {
      if (isAudioOnly) {
        setIsProcessingAudio(true);
      }

      const formData = new FormData();
      formData.append("file", blob, isAudioOnly ? "audio.webm" : "video.webm");
      //console.log("File size:", blob.size / 1024 / 1024, "MB");
      const uploadUrl = isAudioOnly
        ? `${resturl}/uploadtos3?bucketName=skillmedha-speech&task=transcribe`
        : `${resturl}/uploadtos3?bucketName=skillmedha-speech`;

      const response = await axios.post(uploadUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ` + token,
        },
      });

      const resultKey = isAudioOnly ? "audio" : "video";
      setUploadResults((prev) => ({
        ...prev,
        [resultKey]: response.data,
      }));

      if (isAudioOnly) {
        setTranscript(response?.data?.transcription?.text || "");
        setIsProcessingAudio(false);
      }
    } catch (err) {
      console.error(`Upload ${isAudioOnly ? "audio" : "video"} failed`, err);
      if (isAudioOnly) {
        setIsProcessingAudio(false);
      }
    }
  };

  const handleStartRec = () => {
    setIsReplaying(false);

    if (videoReplayRef.current) {
      videoReplayRef.current.pause();
      videoReplayRef.current.srcObject = null;
      videoReplayRef.current.removeAttribute("src");
    }

    setTranscript("");
    setActiveTab(0);
    setCurrentTime(0);
    setRecordingStarted(true);
    setListening(true);
    setHasRecorded(false);
    setIsProcessingAudio(false);
    setAiSuggestions({
      grammarAndSpellingCheck: null,
      clarityAndStyleSuggestions: null,
      positiveFeedback: null,
      reviewedText: null,
      report: null,
      relevance: null,
    });
    setUploadResults({ video: null, audio: null });
    setVideoBlob(null);
    setAudioBlob(null);

    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.currentTime = 0;
      videoRef.current
        .play()
        .catch((err) =>
          console.warn("Live video play failed after reset:", err)
        );
    }

    timerRef.current = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= 60) {
          handleStopRec();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    const mediaRecorder = new MediaRecorder(stream);
    const videoChunks = [];
    mediaRecorder.ondataavailable = (e) => videoChunks.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(videoChunks, { type: "video/webm" });
      setVideoBlob(blob);
      uploadBlobToS3(blob, false);
    };
    mediaRecorder.start();
    mediaRecorderRef.current = mediaRecorder;

    const audioStream = new MediaStream(stream.getAudioTracks());
    const audioRecorder = new MediaRecorder(audioStream);
    const audioChunks = [];
    audioRecorder.ondataavailable = (e) => audioChunks.push(e.data);
    audioRecorder.onstop = () => {
      const blob = new Blob(audioChunks, { type: "audio/webm" });
      setAudioBlob(blob);
      uploadBlobToS3(blob, true);
    };
    audioRecorder.start();
    audioRecorderRef.current = audioRecorder;
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

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    if (
      audioRecorderRef.current &&
      audioRecorderRef.current.state !== "inactive"
    ) {
      audioRecorderRef.current.stop();
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleSubmitRec = async () => {
    try {
      setWaitSubmit(true);
      const { data } = await axios.post(
        `${baseurl}/checkEnglishText`,
        {
          text: transcript,
          question: addQues || questions[quesNo],
          userType: "student",
        },
        { headers: { Authorization: `Bearer ${getLstorage("token")}` } }
      );
      if (data.report) {
        setActiveTab(1);
      }
      setAiSuggestions(data);
    } catch (error) {
      console.log(error);
    } finally {
      setWaitSubmit(false);
    }
  };

  const handleReplayRec = () => {
    setIsReplaying(true);
    setTriggerReplay(true);
  };

  const getRecordingStatus = () => {
    if (listening) return { text: "Recording", color: "red", pulse: true };
    if (isProcessingAudio)
      return { text: "Processing", color: "orange", pulse: true };
    if (uploadResults.video && transcript)
      return { text: "Completed", color: "green" };
    if (hasRecorded) return { text: "Processing Audio", color: "orange" };
    if (currentTime > 0) return { text: "Stopped", color: "orange" };
    return { text: "Ready", color: "blue" };
  };

  const recordingStatus = getRecordingStatus();
  const progressPercent = (currentTime / 60) * 100;

  // Enhanced button disable logic
  const isSubmitDisabled = () => {
    return (
      !hasRecorded || // No recording has been made
      listening || // Currently recording
      isProcessingAudio || // Audio is being processed
      !transcript.trim() || // No transcript available
      waitSubmit // Already submitting
    );
  };

  const isResponsive = useResponsive(); // < 1024px → mobile layout

  if (isResponsive) {
    return (
      <MobileTalkToAi
        isLoading={isLoading}
        isReplaying={isReplaying}
        currentTime={currentTime}
        listening={listening}
        recordingStarted={recordingStarted}
        transcript={transcript}
        videoBlob={videoBlob}
        audioBlob={audioBlob}
        isProcessingAudio={isProcessingAudio}
        hasRecorded={hasRecorded}
        uploadResults={uploadResults}
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
        videoRef={videoRef}
        videoReplayRef={videoReplayRef}
        handleStartRec={handleStartRec}
        handleStopRec={handleStopRec}
        handleReplayRec={handleReplayRec}
        handleSubmitRec={handleSubmitRec}
      />
    );
  }

  return (
    <section className="w-full h-full flex flex-col items-stretch lg:pt-0 bg-[#EFF5FB]">
      {/* Banner Section - Top Full Width */}
      <div className="w-full h-[140px] min-h-[140px] flex flex-col justify-center items-start gap-2 p-4 lg:px-8 shadow-sm rounded-2xl lg:rounded-none bg-gradient-to-br from-[#071631] to-[#10254c] text-white shrink-0 relative overflow-hidden z-[2]">
        {/* Decorative Icons matching TPO Portal */}
        <div className="absolute inset-0 pointer-events-none z-[1]">
          <BsX className="absolute top-[20%] right-[10%] text-[#1E69DA] opacity-60 text-[1.2rem]" />
          <BsPlus className="absolute bottom-[20%] right-[30%] text-[#1E69DA] opacity-50 text-[1.5rem]" />
          <BsStar className="absolute top-[40%] right-[50%] text-[#1E69DA] opacity-50 text-[1.1rem]" />
          <BsX className="absolute bottom-[30%] right-[5%] text-[#1E69DA] opacity-60 text-[1.3rem]" />
        </div>

        <div className="flex items-center justify-between w-full relative z-[2]">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-[56px] h-[56px] bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10 shrink-0">
              <HiOutlineChatBubbleLeftRight className="text-white text-3xl" />
            </div>
            <div className="flex flex-col justify-center gap-1">
              <h1 className="text-[24px] lg:text-[28px] font-bold text-white m-0 tracking-tight leading-none flex items-center gap-3 pb-0" style={{ border: 'none', marginBottom: 0 }}>
                Talk to AI
              </h1>
              <p className="text-white/90 text-[14px] lg:text-[15px] m-0 leading-tight" style={{ marginTop: 0 }}>
                Your personal AI Interview Assistant to help you prepare and succeed.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full flex-1 flex flex-col items-stretch overflow-hidden relative">
        <div className="w-full h-full overflow-hidden p-4 lg:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-[1.5rem] lg:gap-6 max-w-[1400px] mx-auto h-full">
            {/* Left Panel - Video Recording */}
            <Card
          className="bg-white rounded-2xl shadow-md border border-[#e2e8f0] overflow-hidden [&_.ant-card-body]:p-6 [&_.ant-card-body]:flex-1 [&_.ant-card-body]:flex [&_.ant-card-body]:flex-col [&_.ant-card-body]:min-h-0 flex flex-col h-full"
          variant="borderless"
        >
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
          </div>

          <div className="relative w-full flex-1 min-h-0 bg-[#1e293b] rounded-xl overflow-hidden mb-4 flex items-center justify-center">
            {isLoading ? (
              <div className="flex flex-col items-center gap-4 text-white">
                <VideoCameraOutlined className="text-5xl opacity-70" />
                <p className="m-0 text-[1.1rem]">Initializing Camera...</p>
              </div>
            ) : isReplaying ? (
              <video
                ref={videoReplayRef}
                controls={true}
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
                <div className="flex flex-col items-center gap-2 h-full text-white justify-center">
                  <AudioOutlined className="animate-spin text-4xl" />
                  <p>Processing Audio...</p>
                </div>
              </div>
            )}
          </div>

          <Progress
            percent={progressPercent}
            strokeColor="#ff4d4f"
            showInfo={false}
            className="mb-6 [&_.ant-progress-bg]:transition-all [&_.ant-progress-bg]:duration-300"
          />

          <div className="grid grid-cols-3 gap-4 [&_.ant-btn]:h-[48px] [&_.ant-btn]:rounded-lg [&_.ant-btn]:font-semibold [&_.ant-btn]:flex [&_.ant-btn]:items-center [&_.ant-btn]:justify-center [&_.ant-btn]:gap-2 [&_.ant-btn]:shadow-sm hover:[&_.ant-btn]:-translate-y-[2px] hover:[&_.ant-btn]:shadow-md [&_.ant-btn]:transition-all">
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={handleStartRec}
              disabled={listening || isProcessingAudio}
              size="large"
              className="!bg-gradient-to-br !from-[#1E69DA] !to-[#5694F0] !border-none"
            >
              Start Recording
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
              disabled={!uploadResults?.video}
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
              {isProcessingAudio ? "Processing..." : "Get AI Feedback"}
            </Button>
          </div>
        </Card>

        {/* Right Panel - Question and Results */}
        <div className="flex flex-col gap-4 h-full min-h-0">
          {/* Question Card */}
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

            <div className="">
              {addQuesFlag ? (
                <div className="flex gap-3 items-start [&_.ant-input]:rounded-lg [&_.ant-input]:border-2 [&_.ant-input]:border-[#e2e8f0] focus:[&_.ant-input]:border-[#1E69DA]">
                  <Input
                    placeholder="Enter your custom question..."
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
                    className="!bg-white !text-[#1E69DA] !border !border-[#1E69DA] hover:!bg-gradient-to-br hover:!from-[#1E69DA] hover:!to-[#5694F0] hover:!text-white hover:!border-transparent focus:!bg-gradient-to-br focus:!from-[#1E69DA] focus:!to-[#5694F0] focus:!text-white focus:!border-transparent transition-all"
                  >
                    New Question
                  </Button>
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => setAddQuesFlag(true)}
                    className="!bg-white !text-[#1E69DA] !border !border-[#1E69DA] hover:!bg-gradient-to-br hover:!from-[#1E69DA] hover:!to-[#5694F0] hover:!text-white hover:!border-transparent focus:!bg-gradient-to-br focus:!from-[#1E69DA] focus:!to-[#5694F0] focus:!text-white focus:!border-transparent transition-all"
                  >
                    Custom Question
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Results Card */}
          <Card
            className="bg-white rounded-2xl shadow-md border border-[#e2e8f0] flex-1 flex flex-col min-h-0 [&_.ant-card-body]:p-0 [&_.ant-card-body]:flex-1 [&_.ant-card-body]:flex [&_.ant-card-body]:flex-col [&_.ant-card-body]:min-h-0"
          variant="borderless"
          >
            <div className="flex border-b border-[#f0f0f0] overflow-x-auto [&::-webkit-scrollbar]:hidden">
              <div
                className={`flex-1 p-4 flex items-center justify-center gap-2 cursor-pointer font-semibold text-[#64748b] bg-[#f8fafc] transition-all duration-300 border-b-[3px] border-transparent whitespace-nowrap flex-nowrap shrink-0 min-w-fit [&_.anticon]:text-[1.1rem] hover:bg-[#f1f5f9] hover:text-[#1E69DA] ${
                  activeTab === 0 ? "!bg-white !text-[#1E69DA] !border-[#1E69DA]" : ""
                }`}
                onClick={() => setActiveTab(0)}
              >
                <FileTextOutlined />
                <span>Your Answer</span>
              </div>
              <div
                className={`flex-1 p-4 flex items-center justify-center gap-2 cursor-pointer font-semibold text-[#64748b] bg-[#f8fafc] transition-all duration-300 border-b-[3px] border-transparent whitespace-nowrap flex-nowrap shrink-0 min-w-fit [&_.anticon]:text-[1.1rem] hover:bg-[#f1f5f9] hover:text-[#1E69DA] ${
                  activeTab === 1 ? "!bg-white !text-[#1E69DA] !border-[#1E69DA]" : ""
                } ${!aiSuggestions.report ? "opacity-50 cursor-not-allowed hover:!bg-[#f8fafc] hover:!text-[#64748b]" : ""}`}
                onClick={() => aiSuggestions.report && setActiveTab(1)}
              >
                <StarOutlined />
                <span>AI Report</span>
              </div>
              <div
                className={`flex-1 p-4 flex items-center justify-center gap-2 cursor-pointer font-semibold text-[#64748b] bg-[#f8fafc] transition-all duration-300 border-b-[3px] border-transparent whitespace-nowrap flex-nowrap shrink-0 min-w-fit [&_.anticon]:text-[1.1rem] hover:bg-[#f1f5f9] hover:text-[#1E69DA] ${
                  activeTab === 2 ? "!bg-white !text-[#1E69DA] !border-[#1E69DA]" : ""
                } ${!aiSuggestions.report ? "opacity-50 cursor-not-allowed hover:!bg-[#f8fafc] hover:!text-[#64748b]" : ""}`}
                onClick={() => aiSuggestions.report && setActiveTab(2)}
              >
                <BulbOutlined />
                <span>Suggestions</span>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-6 [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-[#f1f1f1] [&::-webkit-scrollbar-track]:rounded-[3px] [&::-webkit-scrollbar-thumb]:bg-[#c1c1c1] [&::-webkit-scrollbar-thumb]:rounded-[3px] hover:[&::-webkit-scrollbar-thumb]:bg-[#a8a8a8]">
              {activeTab === 0 && (
                <div className="[&_p]:text-[1rem] [&_p]:leading-[1.7] [&_p]:text-[#334155] [&_p]:m-0">
                  {isProcessingAudio ? (
                    <div className="flex flex-col items-center justify-center gap-2 h-[200px] text-[#475569]">
                      <AudioOutlined className="animate-spin text-4xl" />
                      <p>Transcribing your audio...</p>
                    </div>
                  ) : transcript ? (
                    <p>{transcript}</p>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-4 h-[200px] text-[#94a3b8] text-center [&_.anticon]:text-5xl [&_.anticon]:opacity-50 [&_p]:m-0 [&_p]:text-[1rem]">
                      <AudioOutlined />
                      <p>Start recording to see your transcribed answer here</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 1 && (
                <div
                  className="text-[1rem] leading-[1.6] text-[#334155] [&_h1]:text-[#1E69DA] [&_h1]:mt-6 [&_h1]:mb-3 [&_h2]:text-[#1E69DA] [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-[#1E69DA] [&_h3]:mt-6 [&_h3]:mb-3 [&_h4]:text-[#1E69DA] [&_h4]:mt-6 [&_h4]:mb-3 [&_h5]:text-[#1E69DA] [&_h5]:mt-6 [&_h5]:mb-3 [&_h6]:text-[#1E69DA] [&_h6]:mt-6 [&_h6]:mb-3 [&_ul]:pl-6 [&_ol]:pl-6 [&_li]:mb-2"
                  dangerouslySetInnerHTML={{
                    __html:
                      aiSuggestions.report ||
                      "<p>Complete your recording and submit for AI analysis</p>",
                  }}
                />
              )}

              {activeTab === 2 && (
                <div className="">
                  {aiSuggestions.relevance && (
                    <div className="mb-8 p-4 bg-[#f8fafc] rounded-lg border-l-4 border-[#1E69DA] [&_h4]:m-0 [&_h4]:mb-3 [&_h4]:text-[#1e293b] [&_h4]:text-[1.1rem] [&_h4]:font-semibold [&_div]:text-[#475569] [&_div]:leading-[1.6]">
                      <h4>📊 Relevance Analysis</h4>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: aiSuggestions.relevance,
                        }}
                      />
                    </div>
                  )}

                  {aiSuggestions.grammarAndSpellingCheck && (
                    <div className="mb-8 p-4 bg-[#f8fafc] rounded-lg border-l-4 border-[#1E69DA] [&_h4]:m-0 [&_h4]:mb-3 [&_h4]:text-[#1e293b] [&_h4]:text-[1.1rem] [&_h4]:font-semibold [&_div]:text-[#475569] [&_div]:leading-[1.6]">
                      <h4>✏️ Grammar & Language</h4>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: aiSuggestions.grammarAndSpellingCheck,
                        }}
                      />
                    </div>
                  )}

                  {aiSuggestions.clarityAndStyleSuggestions && (
                    <div className="mb-8 p-4 bg-[#f8fafc] rounded-lg border-l-4 border-[#1E69DA] [&_h4]:m-0 [&_h4]:mb-3 [&_h4]:text-[#1e293b] [&_h4]:text-[1.1rem] [&_h4]:font-semibold [&_div]:text-[#475569] [&_div]:leading-[1.6]">
                      <h4>💡 Clarity & Style</h4>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: aiSuggestions.clarityAndStyleSuggestions,
                        }}
                      />
                    </div>
                  )}

                  {aiSuggestions.positiveFeedback && (
                    <div className="mb-8 p-4 bg-[#f8fafc] rounded-lg border-l-4 border-[#1E69DA] [&_h4]:m-0 [&_h4]:mb-3 [&_h4]:text-[#1e293b] [&_h4]:text-[1.1rem] [&_h4]:font-semibold [&_div]:text-[#475569] [&_div]:leading-[1.6]">
                      <h4>⭐ Positive Highlights</h4>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: aiSuggestions.positiveFeedback,
                        }}
                      />
                    </div>
                  )}

                  {!aiSuggestions.report && (
                    <div className="flex flex-col items-center justify-center gap-4 h-[200px] text-[#94a3b8] text-center [&_.anticon]:text-5xl [&_.anticon]:opacity-50 [&_p]:m-0 [&_p]:text-[1rem]">
                      <BulbOutlined />
                      <p>AI suggestions will appear here after analysis</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
        </div>
      </div>
      </div>
    </section>
  );
};

export default Dictaphone;
