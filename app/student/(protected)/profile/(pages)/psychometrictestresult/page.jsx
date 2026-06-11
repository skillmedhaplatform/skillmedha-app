"use client";
import React, { useEffect, useRef, useState } from "react";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";
import { useSelector } from "react-redux";
import { restUrl } from "@/config/urls";
import axios from "axios";
import { Button } from "antd";
import { useSearchParams } from "next/navigation";
import { getLstorage } from "@/universalUtils/windowMW";

export default function PsychometricTestResultPage({ id, isDownload }) {
  // const params = useSearchParams();
  const studentDetails = useSelector((state) => state.student.student?.data);
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
    <div className="p-8">
      <StudentPageHeader section="Profile" title="Psychometric Test Result" />
      <Button
        type="primary"
        onClick={downloadPDF}
        className=""
        style={{ marginBottom: "2rem" }}
      >
        Download as PDF
      </Button>

      <div ref={printRef}>
        {resultMeta && (
          <div className="bg-white p-4 rounded-lg mb-6 shadow-[0_2px_6px_rgba(0,0,0,0.1)] [&>p]:my-1 [&>p]:text-[18px]">
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
            <div key={idx} className="mb-6 p-6 border border-solid border-[#ccc] rounded-lg bg-white">
              <div
                className="text-[1.25rem] font-medium mb-4"
                dangerouslySetInnerHTML={{ __html: question }}
              />
              <div className="flex flex-col gap-3">
                {options.map((option) => {
                  const isSelected = selected?.id === option.id;
                  return (
                    <div
                      key={option.id}
                      className={`py-3 px-4 border border-solid border-[#ddd] rounded bg-[#f9f9f9] cursor-pointer ${
                        isSelected ? "bg-[rgba(5,163,5,0.91)] border-green-500 text-white" : ""
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
