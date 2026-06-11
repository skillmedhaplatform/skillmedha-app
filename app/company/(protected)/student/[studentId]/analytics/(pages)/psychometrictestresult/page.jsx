"use client";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import styles from "./page.module.scss";
import axios from "axios";
import { Button } from "antd";
import { useSearchParams } from "next/navigation";
import { restUrl } from "@/utils/universalUtils/urls";


export default function PsychometricTestResultPage({ id, isDownload }) {
  // const params = useSearchParams();
  const studentDetails = useSelector(
    (state) => state.user.singleStudent.value?.data
  );
  const [testResult, setTestResult] = useState([]);
  const [resultMeta, setResultMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const printRef = useRef(null);

  const fetchResult = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${restUrl}/getPsychometricTestResults/${id}`,
        {
          headers: {
            Authorization: `Bearer ` + getLstorage("token"),
          },
        }
      );
      setTestResult(data.data?.attemptedData || []);
      setResultMeta(data.data);
    } catch (err) {
      console.error("Error fetching result:", err);
      setError("Failed to fetch result.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!id) return;
    fetchResult();
  }, [studentDetails]);

  const downloadPDF = async () => {
    if (typeof window === "undefined" || !printRef.current) return;

    const html2pdf = (await import("html2pdf.js")).default;

    html2pdf()
      .from(printRef.current)
      .set({
        margin: 0.5,
        filename: "Psychometric_Test_Result.pdf",
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      })
      .save();
  };

  useEffect(() => {
    downloadPDF();
  }, [isDownload]);

  if (loading) return <p>Loading test results...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className={styles.container}>
      <Button
        type="primary"
        onClick={downloadPDF}
        className={styles.downloadBtn}
        style={{ marginBottom: "2rem" }}
      >
        Download as PDF
      </Button>

      <div ref={printRef}>
        {resultMeta && (
          <div className={styles.summaryCard}>
            <p>
              <strong>Answered:</strong> {resultMeta.answeredCount}
            </p>
            <p>
              <strong>Unattempted:</strong> {resultMeta.unattemptedCount}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(resultMeta.createdAt).toLocaleDateString()}
            </p>

            <p>
              <strong>Summary :</strong>
              <div
                dangerouslySetInnerHTML={{ __html: resultMeta?.summary }}
              ></div>
            </p>
          </div>
        )}

        {testResult.map((item, idx) => {
          const { question, options, selected } = item;
          return (
            <div key={idx} className={styles.card}>
              <div
                className={styles.question}
                dangerouslySetInnerHTML={{ __html: question }}
              />
              <div className={styles.optionsList}>
                {options.map((option) => {
                  const isSelected = selected?.id === option.id;
                  return (
                    <div
                      key={option.id}
                      className={`${styles.option} ${
                        isSelected ? styles.selected : ""
                      }`}
                      dangerouslySetInnerHTML={{ __html: option.text }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
