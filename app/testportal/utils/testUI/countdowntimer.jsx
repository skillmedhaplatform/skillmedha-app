// CountdownTimer.jsx
"use client";
import React, { useState, useEffect, memo } from "react";
import { Progress } from "antd";

const CountdownTimer = memo(function CountdownTimer({
  initialTime,
  onTimeUp,
  TimerColors,
  testStyles,
}) {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp?.();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;
  const percentage = (timeLeft / initialTime) * 100;

  return (
    <div className={testStyles.countdownContainer}>
      <Progress
        type="circle"
        percent={100 - percentage}
        size={100}
        strokeColor={{
          "0%": TimerColors["0%"],
          "30%": TimerColors["30%"],
          "50%": TimerColors["50%"],
          "70%": TimerColors["70%"],
          "100%": TimerColors["100%"],
        }}
        format={() => (
          <div className={testStyles.timer_div}>
            <span className={testStyles.timer}>
              {String(hours).padStart(2, "0")}
            </span>
            :
            <span className={testStyles.timer}>
              {String(minutes).padStart(2, "0")}
            </span>
            :
            <span className={testStyles.timer}>
              {String(seconds).padStart(2, "0")}
            </span>
          </div>
        )}
      />
    </div>
  );
});
