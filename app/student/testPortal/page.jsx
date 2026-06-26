// page.jsx
"use client";
import { useState, useEffect } from "react";
import styles from "./page.module.scss";
import { PsychometricQuestions } from "@/universalUtils/psychometricQuestions";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { restUrl } from "@/config/urls";
import { getLstorage, clearLstorageVals } from "@/universalUtils/windowMW";
import { message } from "antd";
import { useSelector } from "react-redux";
import { getStudentCreds } from "@/redux/slices/student";
import { useDispatch } from "react-redux";

export default function Quiz({
  questions = PsychometricQuestions,
  durationMinutes = 30,
  maxScore = 0,
  user = { userName: "User", avatar: null },
}) {
  const params = useSearchParams();
  const studentCreds = useSelector((state) => state.student.student?.data);

  const token = getLstorage("token");

  const dispatch = useDispatch();

  const nav = useRouter();

  useEffect(() => {

    if (!token || token == "null" || token == "undefined" || token == "") {
      clearLstorageVals();
      nav.replace("/login");
    }
  }, [token, studentCreds?._id]);

  const [qs, setQs] = useState(questions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleOptionChange = (opt) => {
    setQs((prev) => {
      const arr = [...prev];
      arr[currentIndex] = {
        ...arr[currentIndex],
        answer: { id: opt.id, text: opt.text },
      };
      return arr;
    });
  };

  const handlePrevious = () => setCurrentIndex((i) => Math.max(i - 1, 0));
  const handleNext = () =>
    setCurrentIndex((i) => Math.min(i + 1, qs.length - 1));
  const handleClear = () => {
    setQs((prev) => {
      const arr = [...prev];
      arr[currentIndex].answer = { id: null, text: "" };
      return arr;
    });
  };
  const handleSubmit = async () => {
    const results = qs.map((q) => ({
      question: q.question,
      options: q.options,
      selected: q.answer,
    }));
    const answeredCount = qs.filter((q) => q.answer.id !== null).length;
    const unattemptedCount = qs.length - answeredCount;

    const hide = message.loading(
      "Please wait while updating your psychometric results",
      0
    );
    try {
      const studentId = studentCreds?._id || getLstorage("sId");
      if (!studentId) {
        throw new Error("Student ID is missing. Please log out and log in again.");
      }
      
      const { data } = await axios.post(
        restUrl + "/addPsychometricTestResults/" + studentId,
        {
          attemptedData: results,
          answeredCount,
          unattemptedCount,
        },
        {
          headers: {
            Authorization: `Bearer ` + token,
          },
        }
      );

      if (data?.success || data?.msg) {
        // Update the permissions cookie: psychometric done + email verified
        await fetch("/api/auth/session", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ verified: true, psychometricDone: true }),
        });
        dispatch(getStudentCreds());
        message.success("Results Updated Successfully");

        // Refresh the router to clear any cached middleware redirects before navigating
        nav.refresh();
        nav.replace("/student/dashboard");
      }
    } catch (error) {
      message.error("Failed to update results");
    } finally {
      hide();
    }
  };

  const isLast = currentIndex === qs.length - 1;

  return (
    <main className={styles.quizContainer}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div className={styles.topLeft}>
          <div className={styles.avatar}>
            {studentCreds?.profile ? (
              <img src={studentCreds?.profile} alt="avatar" />
            ) : (
              <span>{studentCreds?.userName?.charAt(0)}</span>
            )}
          </div>
          <div className={styles.duration}>
            Total Test Duration : {formatTime(durationMinutes * 60)}M
          </div>
        </div>
        <div className={styles.topRight}>
          <div className={styles.maxScore}>Maximum Score : {maxScore}</div>
          <button className={styles.submitBtn} onClick={handleSubmit}>
            Submit
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainArea}>
        {/* Left Panel */}
        <section className={styles.leftPanel}>
          <div className={styles.questionType}>
            Question Type :{" "}
            {qs[currentIndex]?.questionType === "singleChoice"
              ? "Multiple Choice"
              : qs[currentIndex]?.questionType}
          </div>
          <div className={styles.questionHeader}>
            <div className={styles.questionNumber}>
              {qs[currentIndex]?.extraValues?.[0]?.Qno ?? currentIndex + 1}
            </div>
            <div
              className={styles.questionText}
              dangerouslySetInnerHTML={{
                __html: qs[currentIndex]?.question,
              }}
            />
          </div>
          <div className={styles.optionList}>
            {qs[currentIndex]?.options.map((opt, i) => (
              <label key={opt.id} className={styles.optionItem}>
                <input
                  type="radio"
                  name={`q-${qs[currentIndex]._id}`}
                  checked={qs[currentIndex]?.answer.id === opt.id}
                  onChange={() => handleOptionChange(opt)}
                />
                <span className={styles.optionLetter}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span
                  className={styles.optionText}
                  dangerouslySetInnerHTML={{ __html: opt.text }}
                />
              </label>
            ))}
          </div>

          {/* Bottom Actions */}
          <div className={styles.bottomActions}>
            <div className={styles.navActions}>
              <button
                onClick={handlePrevious}
                className={styles.prevBtn}
                disabled={currentIndex === 0}
              >
                Previous
              </button>
              {!isLast ? (
                <button onClick={handleNext} className={styles.nextBtn}>
                  Next
                </button>
              ) : (
                <button onClick={handleSubmit} className={styles.nextBtn}>
                  Submit
                </button>
              )}
            </div>
            <div className={styles.leftActions}>
              <button onClick={handleClear} className={styles.clearBtn}>
                Clear Response
              </button>
            </div>
          </div>
        </section>
        <aside className={styles.rightPanel}>
          <div className={styles.userSection}>
            <div className={styles.avatar}>
              {studentCreds?.profile ? (
                <img src={studentCreds?.profile} alt="avatar" />
              ) : (
                <span>{studentCreds?.userName?.charAt(0)}</span>
              )}
            </div>
            <div className={styles.username}>{studentCreds?.userName}</div>
            <div className={styles.timerCircle}>{formatTime(timeLeft)}</div>
          </div>

          <div className={styles.legend}>
            <div className={styles.legendItem}>
              <span className={styles.boxAnswered} />
              Answered
            </div>
            <div className={styles.legendItem}>
              <span className={styles.boxUnattempted} />
              Not Answered
            </div>

            <div className={styles.legendItem}>
              <span className={styles.boxUnattempted} />
              Unattempted
            </div>
          </div>

          <div className={styles.navGrid}>
            {qs.map((q, idx) => {
              const answered = q.answer.id != null;
              const isCurrent = idx === currentIndex;
              const classes = [
                styles.navButton,
                isCurrent && styles.current,
                answered && styles.answered,
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <button
                  key={q._id}
                  onClick={() => setCurrentIndex(idx)}
                  className={classes}
                >
                  {(q.extraValues?.[0]?.Qno ?? idx + 1)
                    .toString()
                    .padStart(2, "0")}
                </button>
              );
            })}
          </div>
        </aside>
      </div>
    </main>
  );
}
