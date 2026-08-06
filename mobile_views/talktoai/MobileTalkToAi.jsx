"use client";

import React from "react";
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
  CheckOutlined,
  FileTextOutlined,
  BulbOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { BsX, BsPlus, BsStar } from "react-icons/bs";
import { HiOutlineChatBubbleLeftRight } from "react-icons/hi2";
import { formatTime } from "@/helpers/formatVideoTime";
import styles from "./mobileTalkToAi.module.scss";

export default function MobileTalkToAi({
  isLoading,
  isReplaying,
  currentTime,
  listening,
  transcript,
  isProcessingAudio,
  uploadResults,
  waitSubmit,
  questions,
  quesNo,
  setQuesNo,
  addQuesFlag,
  setAddQuesFlag,
  addQues,
  setAddQues,
  activeTab,
  setActiveTab,
  aiSuggestions,
  recordingStatus,
  progressPercent,
  isSubmitDisabled,
  videoRef,
  videoReplayRef,
  handleStartRec,
  handleStopRec,
  handleReplayRec,
  handleSubmitRec,
}) {
  return (
    <div className={styles.container}>
      {/* Banner Section - Matches Desktop */}
      <div className="w-[calc(100%+32px)] md:w-[calc(100%+48px)] -mx-4 md:-mx-6 h-[120px] min-h-[120px] flex flex-col justify-center items-start gap-2 p-4 md:px-6 shadow-sm rounded-none bg-gradient-to-br from-[#071631] to-[#10254c] text-white shrink-0 relative overflow-hidden z-[50] mb-6 md:mb-8 sticky top-0">
        <div className="absolute inset-0 pointer-events-none z-[1]">
          <BsX className="absolute top-[20%] right-[10%] text-[#1E69DA] opacity-60 text-[1.2rem]" />
          <BsPlus className="absolute bottom-[20%] right-[30%] text-[#1E69DA] opacity-50 text-[1.5rem]" />
          <BsStar className="absolute top-[40%] right-[50%] text-[#1E69DA] opacity-50 text-[1.1rem]" />
          <BsX className="absolute bottom-[30%] right-[5%] text-[#1E69DA] opacity-60 text-[1.3rem]" />
        </div>

        <div className="flex items-center justify-between w-full relative z-[2]">
          <div className="flex items-center gap-3 relative z-10 w-full">
            <div className="w-[48px] h-[48px] bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10 shrink-0">
              <HiOutlineChatBubbleLeftRight className="text-white text-2xl" />
            </div>
            <div className="flex flex-col justify-center gap-1 flex-1">
              <h1 className="text-[24px] font-bold text-white m-0 tracking-tight leading-none pb-0" style={{ border: 'none', marginBottom: 0 }}>
                Talk to AI
              </h1>
              <p className="text-white/90 text-[12px] m-0 leading-tight">
                Your personal AI Interview Assistant to help you prepare and succeed.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.layoutGrid}>
        {/* 1. Interview Question Card */}
        <div className={styles.questionCardContainer}>
          <Card
            title={
              <div className="flex items-center gap-2 text-[1.1rem] font-semibold text-[#1E69DA] [&_.anticon]:text-[1.2rem]">
                <QuestionCircleOutlined />
                <span>Interview Question</span>
              </div>
            }
            className="bg-white rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.1)] border-none [&_.ant-card-head]:border-b [&_.ant-card-head]:border-[#f0f0f0] [&_.ant-card-head]:py-4 [&_.ant-card-head]:px-6"
            bordered={false}
          >
            <div className="text-[1.1rem] leading-[1.6] text-[#1e293b] mb-4 p-4 bg-[#f8fafc] rounded-lg border-l-4 border-[#1E69DA] overflow-y-auto flex-1 min-h-[60px]">
              {addQues || questions[quesNo]}
            </div>

            <div className="shrink-0 mt-auto">
              {addQuesFlag ? (
                <div className="flex gap-3 items-start [&_.ant-input]:rounded-lg [&_.ant-input]:border-2 [&_.ant-input]:border-[#e2e8f0] focus:[&_.ant-input]:border-[#24A058]">
                  <Input
                    placeholder="Enter your custom question..."
                    value={addQues}
                    onChange={(e) => setAddQues(e.target.value)}
                    onPressEnter={() => setAddQuesFlag(false)}
                    className="flex-1 h-[40px]"
                  />
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={() => setAddQuesFlag(false)}
                    className="h-[40px] w-[40px] shrink-0 bg-[#24A058] hover:bg-[#1e8a4a] border-none flex items-center justify-center p-0"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 [&_.ant-btn]:rounded-lg [&_.ant-btn]:h-[40px] [&_.ant-btn]:font-medium w-full">
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
        </div>

        {/* 2. Video Card */}
        <div className={styles.videoCardContainer}>
          <Card
            className="bg-white rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.1)] overflow-hidden border-none [&_.ant-card-body]:p-6"
            bordered={false}
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

            <div className={styles.videoViewport}>
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
                  className="w-full h-full object-cover"
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

            <div className={styles.controlsGrid}>
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={handleStartRec}
                disabled={listening || isProcessingAudio}
                size="large"
                className={`${styles.startBtn} !bg-[#3b82f6] hover:!bg-[#2563eb] !border-none !text-white`}
              >
                Start Recording
              </Button>

              <Button
                icon={<StopOutlined />}
                onClick={handleStopRec}
                disabled={!listening}
                size="large"
                className={`${styles.stopBtn} !bg-[#f1f5f9] !text-[#64748b] !border-2 !border-solid !border-[#cbd5e1] font-bold disabled:!opacity-50 disabled:!bg-[#f1f5f9] disabled:!text-[#94a3b8] disabled:!border-[#e2e8f0]`}
              >
                Stop
              </Button>

              <Button
                icon={<ReloadOutlined />}
                onClick={handleReplayRec}
                disabled={!uploadResults?.video}
                size="large"
                className={`${styles.replayBtn} !bg-[#f1f5f9] !text-[#64748b] !border-2 !border-solid !border-[#cbd5e1] font-bold disabled:!opacity-50 disabled:!bg-[#f1f5f9] disabled:!text-[#94a3b8] disabled:!border-[#e2e8f0]`}
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
                className={`${styles.submitBtn} !bg-gradient-to-br !from-[#1E69DA] !to-[#5694F0] !border-none !text-white`}
              >
                {isProcessingAudio ? "Processing..." : "Get AI Feedback"}
              </Button>
            </div>
          </Card>
        </div>

        {/* 3. Results / Tabs Card */}
        <div className={styles.resultsCardContainer}>
          <Card
            className="bg-white rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.1)] border-none [&_.ant-card-body]:p-0"
            bordered={false}
          >
            <div className={styles.tabsHeader}>
              <div
                className={`${styles.tabItem} ${activeTab === 0 ? styles.activeTab : ""}`}
                onClick={() => setActiveTab(0)}
              >
                <FileTextOutlined />
                <span>Your Answer</span>
              </div>
              <div
                className={`${styles.tabItem} ${activeTab === 1 ? styles.activeTab : ""} ${
                  !aiSuggestions.report ? styles.disabledTab : ""
                }`}
                onClick={() => aiSuggestions.report && setActiveTab(1)}
              >
                <StarOutlined />
                <span>AI Report</span>
              </div>
              <div
                className={`${styles.tabItem} ${activeTab === 2 ? styles.activeTab : ""} ${
                  !aiSuggestions.report ? styles.disabledTab : ""
                }`}
                onClick={() => aiSuggestions.report && setActiveTab(2)}
              >
                <BulbOutlined />
                <span>Suggestions</span>
              </div>
            </div>

            <div className={styles.tabContentPanel}>
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
                    <div className="flex flex-col items-center justify-center gap-4 h-full min-h-[120px] text-[#94a3b8] text-center [&_.anticon]:text-5xl [&_.anticon]:opacity-50 [&_p]:m-0 [&_p]:text-[1rem]">
                      <AudioOutlined />
                      <p>Start recording to see your transcribed answer here</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 1 && (
                <div
                  className="text-[1rem] leading-[1.6] text-[#334155] [&_h1]:text-[#24A058] [&_h1]:mt-6 [&_h1]:mb-3 [&_h2]:text-[#24A058] [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-[#24A058] [&_h3]:mt-6 [&_h3]:mb-3 [&_h4]:text-[#24A058] [&_h4]:mt-6 [&_h4]:mb-3 [&_h5]:text-[#24A058] [&_h5]:mt-6 [&_h5]:mb-3 [&_h6]:text-[#24A058] [&_h6]:mt-6 [&_h6]:mb-3 [&_ul]:pl-6 [&_ol]:pl-6 [&_li]:mb-2"
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
                    <div className="mb-8 p-4 bg-[#f8fafc] rounded-lg border-l-4 border-[#24A058] [&_h4]:m-0 [&_h4]:mb-3 [&_h4]:text-[#1e293b] [&_h4]:text-[1.1rem] [&_h4]:font-semibold [&_div]:text-[#475569] [&_div]:leading-[1.6]">
                      <h4>📊 Relevance Analysis</h4>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: aiSuggestions.relevance,
                        }}
                      />
                    </div>
                  )}

                  {aiSuggestions.grammarAndSpellingCheck && (
                    <div className="mb-8 p-4 bg-[#f8fafc] rounded-lg border-l-4 border-[#24A058] [&_h4]:m-0 [&_h4]:mb-3 [&_h4]:text-[#1e293b] [&_h4]:text-[1.1rem] [&_h4]:font-semibold [&_div]:text-[#475569] [&_div]:leading-[1.6]">
                      <h4>✏️ Grammar & Language</h4>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: aiSuggestions.grammarAndSpellingCheck,
                        }}
                      />
                    </div>
                  )}

                  {aiSuggestions.clarityAndStyleSuggestions && (
                    <div className="mb-8 p-4 bg-[#f8fafc] rounded-lg border-l-4 border-[#24A058] [&_h4]:m-0 [&_h4]:mb-3 [&_h4]:text-[#1e293b] [&_h4]:text-[1.1rem] [&_h4]:font-semibold [&_div]:text-[#475569] [&_div]:leading-[1.6]">
                      <h4>💡 Clarity & Style</h4>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: aiSuggestions.clarityAndStyleSuggestions,
                        }}
                      />
                    </div>
                  )}

                  {aiSuggestions.positiveFeedback && (
                    <div className="mb-8 p-4 bg-[#f8fafc] rounded-lg border-l-4 border-[#24A058] [&_h4]:m-0 [&_h4]:mb-3 [&_h4]:text-[#1e293b] [&_h4]:text-[1.1rem] [&_h4]:font-semibold [&_div]:text-[#475569] [&_div]:leading-[1.6]">
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
  );
}
