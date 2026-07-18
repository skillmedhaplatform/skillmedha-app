"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { getSstorage } from "@/universalUtils/windowMW";
import { submitATSFeedback, resetFeedbackStatus } from "@/redux/atsSlice";

const RATINGS = [
  { value: 1, emoji: "😞", label: "Very Poor" },
  { value: 2, emoji: "😕", label: "Poor" },
  { value: 3, emoji: "😐", label: "Average" },
  { value: 4, emoji: "😊", label: "Good" },
  { value: 5, emoji: "🤩", label: "Excellent" },
];

const FEEDBACK_SECTIONS = [
  {
    key: "accuracy",
    label: "How accurate were the suggestions?",
    options: [
      "All suggestions were relevant",
      "Most suggestions were relevant",
      "Some suggestions were off-target",
      "Suggestions didn't match my resume",
      "Score seemed too high",
      "Score seemed too low",
    ],
  },
  {
    key: "helpfulness",
    label: "What did you find most helpful?",
    options: [
      "Score breakdown by category",
      "Before/After suggestion preview",
      "Reason explanation for each change",
      "Keep/Abort decision per suggestion",
      "Updated resume download",
      "History of past analyses",
    ],
  },
  {
    key: "improvements",
    label: "What should we improve?",
    options: [
      "More specific keyword suggestions",
      "Industry-specific analysis",
      "Better formatting recommendations",
      "Job description matching",
      "Faster analysis time",
      "More detailed explanations",
      "Mobile-friendly interface",
      "Export to Word format",
    ],
  },
];

const FeedbackModal = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { feedbackStatus, currentAnalysis, error } = useSelector((s) => s.ats || {});

  const [rating, setRating] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({
    accuracy: [],
    helpfulness: [],
    improvements: [],
  });
  const [additionalComment, setAdditionalComment] = useState("");

  useEffect(() => {
    if (open) {
      setRating(null);
      setAdditionalComment("");
      setSelectedOptions({ accuracy: [], helpfulness: [], improvements: [] });
      dispatch(resetFeedbackStatus());
    }
  }, [open, dispatch]);

  const toggleOption = (section, option) => {
    setSelectedOptions((prev) => {
      const current = prev[section] || [];
      return {
        ...prev,
        [section]: current.includes(option)
          ? current.filter((o) => o !== option)
          : [...current, option],
      };
    });
  };

  const handleSubmit = () => {
    if (!rating) return;

    dispatch(
      submitATSFeedback({
        analysisId: currentAnalysis?.analysisId,
        studentId: getSstorage("studentId") || "anonymous",
        rating,
        selectedOptions,
        additionalComment,
      })
    );
  };

  const isSubmitting = feedbackStatus === "submitting";
  const isSubmitted = feedbackStatus === "submitted";
  const isFailed = feedbackStatus === "failed";

  return (
    <Modal
      title="Rate Your ATS Checker Experience"
      open={open}
      onCancel={onClose}
      footer={null}
      width={560}
      destroyOnClose
    >
      {isSubmitted ? (
        <div className="text-center py-8 px-4">
          <div className="text-[3rem] mb-3">🎉</div>
          <h3 className="text-[16px] font-bold text-[#071631] mb-1.5">
            Thank you for your feedback!
          </h3>
          <p className="text-[13px] text-[#64748b]">
            Your feedback has been recorded successfully.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div>
            <div className="text-[14px] font-semibold text-[#071631] mb-2">
              How would you rate your overall experience?
            </div>

            <div className="flex gap-2 flex-wrap">
              {RATINGS.map(({ value, emoji }) => (
                <button
                  key={value}
                  className={`px-4 py-2 rounded-md border-[1.5px] bg-white text-[19px] cursor-pointer transition-all ${
                    rating === value
                      ? "border-[#1E69DA] bg-[#dbeafe] shadow-[0_0_0_2px_rgba(30,105,218,0.2)]"
                      : "border-[#e2e8f0] hover:border-[#1E69DA] hover:bg-[#eff6ff]"
                  }`}
                  onClick={() => setRating(value)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {FEEDBACK_SECTIONS.map((section) => (
            <div key={section.key}>
              <div className="text-[14px] font-semibold text-[#071631] mb-2">
                {section.label}
              </div>

              <div className="flex flex-wrap gap-2">
                {section.options.map((opt) => (
                  <button
                    key={opt}
                    className={`px-3.5 py-1.5 rounded-full border-[1.5px] bg-white text-[12px] cursor-pointer transition-all ${
                      selectedOptions[section.key]?.includes(opt)
                        ? "border-[#1E69DA] bg-[#dbeafe] text-[#1358b0] font-semibold"
                        : "border-[#e2e8f0] text-[#64748b] hover:border-[#1E69DA] hover:text-[#1E69DA]"
                    }`}
                    onClick={() => toggleOption(section.key, opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div>
            <div className="text-[14px] font-semibold text-[#071631] mb-2">
              Additional comments
            </div>

            <textarea
              value={additionalComment}
              onChange={(e) => setAdditionalComment(e.target.value)}
              maxLength={500}
              className="w-full border-[1.5px] border-[#e2e8f0] rounded-lg px-3.5 py-2.5 text-[13px] min-h-[80px] resize-y text-[#071631] focus:outline-none focus:border-[#1E69DA] transition-colors"
            />

            <div className="text-[11px] text-[#94a3b8] mt-1">
              {additionalComment.length}/500
            </div>
          </div>

          {isFailed && (
            <div className="bg-[#fdecea] border border-[#f5c6cb] rounded-lg px-4 py-3 text-[13px] text-[#c0392b]">
              ⚠️ {error || "Failed to submit feedback. Please try again."}
            </div>
          )}

          <button
            className="w-full bg-gradient-to-br from-[#1E69DA] to-[#5694F0] text-white border-none py-3 rounded-lg text-[14px] font-bold cursor-pointer hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            onClick={handleSubmit}
            disabled={!rating || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </button>
        </div>
      )}
    </Modal>
  );
};

export default FeedbackModal;
