"use client";
import { useState, useEffect } from "react";
const useCountdown = (targetDate, stop) => {
  const [countDown, setCountDown] = useState(targetDate);
  useEffect(() => {
    let interval = setInterval(() => {}, 1000);
    if (!isNaN(targetDate))
      if (!stop) {
        interval = setInterval(() => {
          let timeLeft = countDown - 1000; 
          if (isNaN(timeLeft)) timeLeft = targetDate - 1000;
          if (timeLeft <= 0) {
            clearInterval(interval);
            setCountDown(0);
          } else {
            setCountDown(timeLeft);
          }
        }, 1000);
      }
    if (stop) clearInterval(interval);

    return () => clearInterval(interval);
  }, [targetDate, stop, countDown]);

  if (isNaN(countDown)) {
    return {
      days: null,
      hours: null,
      minutes: null,
      seconds: null,
      completed: null,
    };
  }

  return getReturnValues(countDown);
};

const getReturnValues = (countDown) => {
  // Calculate time left
  const days = Math.floor(countDown / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (countDown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((countDown % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((countDown % (1000 * 60)) / 1000);

  return {
    days,
    hours,
    minutes,
    seconds,
    completed: countDown < 0,
  };
};

export default useCountdown;
