"use client";

import React, { useEffect, useRef, useState } from "react";

const CountdownTimer = ({ jobEndDate, onDeadlineOver }) => {
  const intervalRef = useRef(null);
  const hasNotifiedRef = useRef(null); // Keeps track of last notified value
  const [timeLeft, setTimeLeft] = useState({});
  const [isDeadlineOver, setIsDeadlineOver] = useState(false);
  const [isValidDate, setIsValidDate] = useState(true);

  useEffect(() => {
    const endTime = new Date(jobEndDate).getTime();

    if (!jobEndDate || isNaN(endTime)) {
      setIsValidDate(false);
      return;
    }

    setIsValidDate(true);

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = endTime - now;

      if (distance <= 0) {
        clearInterval(intervalRef.current);
        setIsDeadlineOver(true);

        if (hasNotifiedRef.current !== true) {
          onDeadlineOver?.(true); // Notify parent ONCE
          hasNotifiedRef.current = true;
        }

        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
      setIsDeadlineOver(false);

      if (hasNotifiedRef.current !== false) {
        onDeadlineOver?.(false); // Notify parent ONCE
        hasNotifiedRef.current = false;
      }
    };

    updateCountdown();
    intervalRef.current = setInterval(updateCountdown, 1000);

    return () => clearInterval(intervalRef.current);
  }, [jobEndDate, onDeadlineOver]);

  if (!isValidDate) {
    return (
      <p style={{ color: "#999", textAlign: "center", width: "100%" }}>
        No deadline
      </p>
    );
  }

  if (isDeadlineOver) {
    return <p style={{ color: "#FF8540" }}>Deadline Closed</p>;
  }

  const { days = 0, hours = 0, minutes = 0, seconds = 0 } = timeLeft;

  let displayText = "";
  if (days > 0) {
    displayText = `${days} day${days > 1 ? "s" : ""}`;
  } else if (hours > 0) {
    displayText = `${hours} hour${hours > 1 ? "s" : ""}`;
  } else if (minutes > 0) {
    displayText = `${minutes} minute${minutes > 1 ? "s" : ""}`;
  } else {
    displayText = `${seconds} second${seconds > 1 ? "s" : ""}`;
  }

  return <strong style={{ color: "#FF8540" }}>{displayText}</strong>;
};

export default CountdownTimer;
