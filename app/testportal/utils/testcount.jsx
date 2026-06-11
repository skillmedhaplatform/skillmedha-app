import React, { useEffect, useRef } from 'react';

const CountdownTimer = () => {
  const moRef = useRef();
  const dRef = useRef();
  const hRef = useRef();
  const miRef = useRef();
  const sRef = useRef();
  const msRef = useRef();

  useEffect(() => {
    const grad = new Date(2015, 3, 16, 17, 0, 0, 0, 0);

    const monthDays = {
      cache: {},
      getTotalDaysInMonth: function (year, month) {
        if (!this.cache[year]) {
          this.cache[year] = {};
        }
        if (!this.cache[year][month]) {
          this.cache[year][month] = new Date(year, month + 1, 0).getDate();
        }
        return this.cache[year][month];
      }
    };

    function clear(ctx) { ctx.clearRect(0, 0, 80, 80); }

    function setTrack(ctx) {
      ctx.strokeStyle = 'hsla(2, 8%, 46%, 0.45)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(36, 36, 27, 0, Math.PI * 2);
      ctx.stroke();
    }

    function setTime(ctx, until, now, total) {
      ctx.strokeStyle = 'hsl(2, 8%, 46%)';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(
        36,
        36,
        27,
        Math.PI / -2,
        (Math.PI * 2) * ((until - now % total) / total) + (Math.PI / -2),
        false
      );
      ctx.stroke();
    }

    function set() {
      const today = new Date();
      const daysThisMonth = monthDays.getTotalDaysInMonth(today.getFullYear(), today.getMonth());

      if (
        today.getFullYear() === grad.getFullYear() &&
        today.getMonth() === grad.getMonth() &&
        today.getDate() === grad.getDate() &&
        today.getHours() === grad.getHours() &&
        today.getMinutes() === grad.getMinutes() &&
        today.getSeconds() === grad.getSeconds() &&
        today.getMilliseconds() === grad.getMilliseconds()
      ) {
        return;
      }

      clear(moRef.current);
      setTrack(moRef.current);
      setTime(moRef.current, grad.getMonth(), today.getMonth(), 12);

      clear(dRef.current);
      setTrack(dRef.current);
      setTime(dRef.current, grad.getDate(), today.getDate(), daysThisMonth);

      clear(hRef.current);
      setTrack(hRef.current);
      setTime(hRef.current, grad.getHours(), today.getHours(), 24);

      clear(miRef.current);
      setTrack(miRef.current);
      setTime(miRef.current, grad.getMinutes(), today.getMinutes(), 60);

      clear(sRef.current);
      setTrack(sRef.current);
      setTime(sRef.current, grad.getSeconds(), today.getSeconds(), 60);

      clear(msRef.current);
      setTrack(msRef.current);
      setTime(msRef.current, grad.getMilliseconds(), today.getMilliseconds(), 1000);

      requestAnimationFrame(set);
    }

    requestAnimationFrame(set);
  }, []);

  return (
    <time style={{ height: "2rem", width: "2rem", border: "2px solid red" }}>
      <canvas id="months" ref={moRef} width="80" height="80"></canvas>
      <canvas id="days" ref={dRef} width="80" height="80"></canvas>
      <canvas id="hours" ref={hRef} width="80" height="80"></canvas>
      <canvas id="minutes" ref={miRef} width="80" height="80"></canvas>
      <canvas id="seconds" ref={sRef} width="80" height="80"></canvas>
      <canvas id="milliseconds" ref={msRef} width="80" height="80"></canvas>
    </time>
  );
};

export default CountdownTimer;
