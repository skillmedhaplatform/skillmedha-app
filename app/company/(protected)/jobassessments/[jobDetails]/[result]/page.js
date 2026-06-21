"use client";
import Home from "@/app/page";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./page.module.scss";
import Image from "next/image";
import { FaDownload } from "react-icons/fa6";
import { FaShareAlt } from "react-icons/fa";
import { HiDotsVertical } from "react-icons/hi";
import html2pdf from "html2pdf.js";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  Button,
  Row,
  Col,
  Collapse,
  message,
  Dropdown,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  DownOutlined,
} from "@ant-design/icons";
const { Option } = Select;
import {
  getJobAssessmentResultsForStudent,
  GetOneJob,
} from "@/redux/slices/company/placementsSlice";
import axios from "axios";
import { restUrl } from "@/utils/universalUtils/urls";
import { getLstorage } from "@/utils/universalUtils/windowMW";
import { updateStudentAndJobStatus } from "@/redux/slices/company/skillMedhaData";

const { Panel } = Collapse;

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const mainRef = useRef(null);

  const { value: { data: oneJobData } = {}, status } = useSelector(
    (state) => state.placement.OneJob || {}
  );

  const AssessmentResults = useSelector(
    (state) => state.placement.results?.JobAssessments?.assessmentResults || []
  );
  const Questions = useSelector(
    (state) => state.placement.results?.JobAssessments?.questionData || []
  );
  const StudentDetails = useSelector(
    (state) => state.placement.results?.JobAssessments?.studentDetails || {}
  );
  const StErrro = useSelector((state) => state.placement?.resultsError || {});

  // Fetch job details as soon as params are available
  useEffect(() => {
    if (params?.jobDetails) {
      dispatch(GetOneJob({ jobid: params.jobDetails }));
    }
  }, []);

  // Once job details (oneJobData) are loaded, fetch assessment results
  useEffect(() => {
    if (oneJobData?.AssessmentId && params?.result) {
      dispatch(
        getJobAssessmentResultsForStudent({
          assessmentId: oneJobData.AssessmentId,
          studentId: params.result,
          router,
          params,
        })
      );
    }
  }, [oneJobData?.AssessmentId, params?.result]);

  // Download handler using html2pdf.js
  const handleDownload = () => {
    const element = mainRef.current;

    if (!element) {
      console.error("Element not found for PDF generation");
      return;
    }

    const opt = {
      margin: 0.5,
      filename: `${
        StudentDetails?.userName || "candidate"
      }_assessment_results.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      },
      jsPDF: {
        unit: "in",
        format: "a4",
        orientation: "portrait",
      },
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <Home>
      <div className={styles.mainCont} ref={mainRef}>
        <Header
          candidate={StudentDetails}
          jobData={oneJobData}
          onDownload={handleDownload}
          AssessmentResults={AssessmentResults[0]}
        />
        <About candidate={StudentDetails} />
        <TestSummaryCard AssessmentResults={AssessmentResults[0]} />
        {/* <ProctoringCard /> */}
        <ReportCard
          AssessmentResults={AssessmentResults[0]}
          Questions={Questions}
        />
        {/* <ReviewInputCard /> */}
      </div>
    </Home>
  );
}

const ReportCard = ({ AssessmentResults, Questions }) => {
  const MediaRenderer = ({ resources }) => {
    if (!resources || !resources.type || !resources.url) return null;

    switch (resources.type) {
      case "audio":
        return (
          <audio controls style={{ marginTop: "1rem" }}>
            <source src={resources.url} />
            Your browser does not support the audio element.
          </audio>
        );
      case "video":
        return (
          <video
            controls
            width="480"
            style={{ marginTop: "1rem", maxWidth: "100%" }}
            src={resources.url}
          />
        );
      default:
        return null;
    }
  };

  const parseIfJson = (string) => {
    try {
      return JSON.parse(string);
    } catch (error) {
      return string;
    }
  };

  // Updated function to handle True/False and Fill in the Blanks
  const renderAnswerSection = (question, answer, selectedAns, questionType) => {
    if (!answer) return null;

    // Handle True/False Questions
    if (questionType === "True/False") {
      const correctAnswer = answer.trueFalse ? "True" : "False";
      const userAnswer = selectedAns || "Not Answered";
      const isCorrect = userAnswer === correctAnswer;

      return (
        <div className={styles.trueFalseSection}>
          <div className={styles.answerItem}>
            <div className={styles.answerLabel}>Your Answer:</div>
            <div
              className={styles.answerValue}
              style={{
                color: isCorrect ? "green" : "red",
                fontWeight: "bold",
              }}
            >
              {userAnswer}
            </div>
          </div>
          <div className={styles.answerItem}>
            <div className={styles.answerLabel}>Correct Answer:</div>
            <div
              className={styles.answerValue}
              style={{
                color: "green",
                fontWeight: "bold",
              }}
            >
              {correctAnswer} ✓
            </div>
          </div>
          <div className={styles.resultIndicator}>
            <span
              style={{
                color: isCorrect ? "green" : "red",
                fontWeight: "bold",
              }}
            >
              {isCorrect ? "✓ Correct" : "✗ Incorrect"}
            </span>
          </div>
        </div>
      );
    }

    // Handle Fill in the Blanks Questions
    if (questionType === "Fill in the Blanks") {
      const stripHtml = (html = "") => {
        const doc = new DOMParser().parseFromString(html, "text/html");
        return doc.body.textContent || "";
      };

      const correctAnswer = answer.fillBlanks?.[0]
        ? stripHtml(parseIfJson(answer.fillBlanks?.[0]))
        : "No correct answer provided";

      const userAnswer = stripHtml(selectedAns) || "Not Answered";
      // Simple comparison - you might want to make this more sophisticated
      const isCorrect =
        userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();

      return (
        <div className={styles.fillBlanksSection}>
          <div className={styles.answerItem}>
            <div className={styles.answerLabel}>Your Answer:</div>
            <div
              className={styles.answerValue}
              style={{
                color: isCorrect ? "green" : "red",
                fontWeight: "bold",
                backgroundColor: "#f5f5f5",
                padding: "8px",
                borderRadius: "4px",
                border: `2px solid ${isCorrect ? "green" : "red"}`,
              }}
            >
              {userAnswer}
            </div>
          </div>
          <div className={styles.answerItem}>
            <div className={styles.answerLabel}>Correct Answer:</div>
            <div
              className={styles.answerValue}
              style={{
                color: "green",
                fontWeight: "bold",
                backgroundColor: "#e8f5e8",
                padding: "8px",
                borderRadius: "4px",
                border: "2px solid green",
              }}
              dangerouslySetInnerHTML={{ __html: correctAnswer }}
            />
          </div>
          <div className={styles.resultIndicator}>
            <span
              style={{
                color: isCorrect ? "green" : "red",
                fontWeight: "bold",
              }}
            >
              {isCorrect ? "✓ Correct" : "✗ Incorrect"}
            </span>
          </div>
        </div>
      );
    }

    // Handle Multiple Choice and Single Choice (existing logic)
    return renderOptions(question, answer, selectedAns, questionType);
  };

  const renderOptions = (
    questionContent,
    answer,
    selectedAns,
    questionType
  ) => {
    if (!questionContent) return null;

    // Get all option keys
    const optionKeys = Object.keys(questionContent)
      .filter((key) => key.startsWith("option"))
      .sort();

    if (optionKeys.length === 0) return null;

    return (
      <div className={styles.options}>
        {optionKeys.map((optionKey, index) => {
          const value = questionContent[optionKey];

          // ✅ Is this option correct?
          let isCorrect = false;
          if (answer?.singleChoice && answer.singleChoice[optionKey]) {
            isCorrect = true;
          } else if (
            answer?.multipleChoice &&
            answer.multipleChoice[optionKey]
          ) {
            isCorrect = true;
          }

          // 🟢🔴 Did user select this option?
          let isSelected = false;
          if (Array.isArray(selectedAns)) {
            isSelected = selectedAns.some(
              (ans) => ans?.toLowerCase() === optionKey.toLowerCase()
            );
          } else {
            isSelected = selectedAns?.toLowerCase() === optionKey.toLowerCase();
          }

          // 🎨 Decide background color based only on userResponse
          let backgroundStyle = {};
          if (isSelected) {
            backgroundStyle = isCorrect
              ? { backgroundColor: "green" } // user selected & correct
              : { backgroundColor: "red" }; // user selected & wrong
          }

          return (
            <div
              key={optionKey}
              className={styles.option}
              style={backgroundStyle}
            >
              {String.fromCharCode(97 + index).toUpperCase() + ". "}
              <div
                dangerouslySetInnerHTML={{
                  __html: parseIfJson(value),
                }}
              />
              {isCorrect && <span className={styles.correctIndicator}> ✓</span>}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={styles.questionListCont}>
      <h2 style={{ color: "#25A3A6" }}>Detailed Submission report</h2>
      {Questions?.map((q, i) => {
        const renderCurrQues = AssessmentResults?.response?.[q?._id];
        const selectedAns = renderCurrQues?.answers?.[0];

        return (
          <div key={q._id} className={styles.questionItem}>
            <Collapse
              bordered={false}
              ghost
              defaultActiveKey={Questions.map((q) => q._id)}
            >
              <Panel
                header={
                  <div>
                    <div className={styles.questionItemHeader}>
                      <div className={styles.questionItemHeaderLeft}>
                        <span className={styles.questionText}>
                          {`Question ${i + 1}`}
                        </span>
                      </div>
                      <div className={styles.questionItemHeaderRight}>
                        <div>{q.questionType?.toUpperCase()}</div>
                        <div>{q.difficulty?.toUpperCase()}</div>
                      </div>
                    </div>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: parseIfJson(
                          q.questionContent?.question || q.question || ""
                        ),
                      }}
                      className={styles.question}
                    />

                    <MediaRenderer resources={q?.resources} />
                  </div>
                }
                key={q._id}
              >
                {renderAnswerSection(
                  q.questionContent,
                  q.answer,
                  selectedAns,
                  q.questionType
                )}
              </Panel>
            </Collapse>
          </div>
        );
      })}
    </div>
  );
};

const Header = ({ candidate, jobData, onDownload, AssessmentResults }) => {
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const params = useParams();
  const dispatch = useDispatch();
  const router = useRouter();

  const { value: { data: oneJobData } = {}, status } = useSelector(
    (state) => state.placement.OneJob || {}
  );
  const StudentDetails = useSelector(
    (state) => state.placement.results?.JobAssessments?.studentDetails || {}
  );

  const handleScheduleInterview = async (interviewDetails) => {
    const hide = message.loading("Please wait while scheduling interview", 0);
    try {
      const { data } = await axios.post(
        restUrl + "/scheduleInterview",
        {
          studentId: params.result,
          jobId: params.jobDetails,
          interviewDetails: interviewDetails,
        },
        {
          headers: {
            Authorization: `Bearer ${getLstorage("token")}`,
          },
        }
      );
      if (data) {
        message.success("Interview scheduled successfully");

        dispatch(
          getJobAssessmentResultsForStudent({
            assessmentId: oneJobData?.AssessmentId,
            studentId: candidate?._id,
            router: null,
            params,
          })
        );
      }
    } catch (error) {
      message.error("Failed to schedule interview");
    } finally {
      hide();
    }
  };

  const items = [
    {
      key: "schedule",
      label: "Schedule Interview",
      onClick: () => setShowInterviewModal(true),
    },
    {
      key: "approve",
      label: "Short List",
      onClick: () => {
        dispatch(
          updateStudentAndJobStatus({
            jobId: params.jobDetails,
            studentId: candidate?._id,
            status: "approved",
          })
        )?.then((resp) => {
          if (resp?.payload)
            dispatch(
              getJobAssessmentResultsForStudent({
                assessmentId: oneJobData?.AssessmentId,
                studentId: params.result,
                router: null,
                params,
              })
            );
        });
      },
    },
    {
      key: "reject",
      label: "Reject",
      onClick: () => {
        dispatch(
          updateStudentAndJobStatus({
            jobId: params.jobDetails,
            studentId: candidate?._id,
            status: "rejected",
          })
        )?.then((resp) => {
          if (resp?.payload)
            dispatch(
              getJobAssessmentResultsForStudent({
                assessmentId: oneJobData?.AssessmentId,
                studentId: candidate?._id,
                router: null,
                params,
              })
            );
        });
      },
    },
  ];

  const currJobStatus = StudentDetails?.appliedJobs?.find(
    (e) => e.id == params.jobDetails
  );

  return (
    <div className={styles.header}>
      <div className={styles.left}>
        <div className={styles.imgCont}>
          <img
            src={candidate?.profile}
            alt="Candidate profile"
            width="100%"
            height={"100%"}
          />
        </div>
        <p style={{ color: "#25a3a6", fontSize: "1.2rem", fontWeight: "800" }}>
          {candidate?.userName || ""}
        </p>
        <p>{currJobStatus?.status?.toUpperCase() || "Pending"}</p>
      </div>
      <div className={styles.right}>
        <Button type="text" onClick={onDownload}>
          <FaDownload style={{ color: "#25a3a6" }} /> Download
        </Button>

        <Dropdown menu={{ items }} trigger={["click"]} placement="bottomLeft">
          <Button
            type="primary"
            style={{ backgroundColor: "#25A3A6", borderColor: "#25A3A6" }}
          >
            Actions <DownOutlined />
          </Button>
        </Dropdown>
      </div>
      <ScheduleInterviewModal
        visible={showInterviewModal}
        onCancel={() => setShowInterviewModal(false)}
        onSubmit={handleScheduleInterview}
        candidate={candidate}
        assessmentResults={AssessmentResults}
      />
    </div>
  );
};

const About = ({ candidate }) => {
  return (
    <div className={styles.AboutCard}>
      <div className={styles.aboutHeader}>
        <p style={{ color: "#25a3a6", fontSize: "1.2rem", fontWeight: "800" }}>
          About {candidate?.userName}
        </p>
      </div>
      <div className={styles.content}>
        <div className={styles.infoItem}>
          <p className={styles.aboutLabel}>Name</p>
          <strong className={styles.aboutvalue}>{candidate?.userName}</strong>
        </div>

        <div className={styles.infoItem}>
          <p className={styles.aboutLabel}>Languages</p>
          <strong className={styles.aboutvalue}>
            {candidate?.technical?.join(", ") || "N/A"}
          </strong>
        </div>
        <div className={styles.infoItem}>
          <p className={styles.aboutLabel}>Email</p>
          <strong className={styles.aboutvalue}>{candidate?.email}</strong>
        </div>
        <div className={styles.infoItem}>
          <p className={styles.aboutLabel}>Education</p>
          <strong className={styles.aboutvalue}>{candidate?.email}</strong>
        </div>
        <div className={styles.infoItem}>
          <p className={styles.aboutLabel}>Location</p>
          <strong className={styles.aboutvalue}>
            {candidate?.addresses?.currentAddress?.districtName || "N/A"}
          </strong>
        </div>
        <div className={styles.infoItem}>
          <p className={styles.aboutLabel}>About Experience</p>
          <strong className={styles.aboutvalue}>
            {candidate?.experience || "Fresher"}
          </strong>
        </div>
        <div className={styles.infoItem}>
          <p className={styles.aboutLabel}>Contact Number</p>
          <strong className={styles.aboutvalue}>{candidate?.phone}</strong>
        </div>
      </div>
    </div>
  );
};

const TestSummaryCard = ({ AssessmentResults }) => {
  function formatDuration(ms) {
    if (!ms || ms < 0) return "0 Sec";

    let totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${hours > 0 ? hours + " Hr " : ""}${
      minutes > 0 ? minutes + " Min " : ""
    }${seconds > 0 ? seconds + " Sec" : ""}`;
  }

  const results = {
    totalScore: AssessmentResults?.scoreData?.finalScore,
    maxScore: AssessmentResults?.assessmentData?.questionIds?.length * 2,
    testRank: 99,
    maxRank: 100,
    attempted:
      +AssessmentResults?.assessmentData?.questionIds?.length -
      +AssessmentResults?.scoreData?.notAnswered,
    totalQuestions: +AssessmentResults?.assessmentData?.questionIds?.length,
    testStart:
      new Date(+AssessmentResults?.testStartedAt)?.toLocaleString() || "",
    testEnd: new Date(+AssessmentResults?.testEndedAt)?.toLocaleString() || "",
    testDuration:
      AssessmentResults?.testStartedAt && AssessmentResults?.testEndedAt
        ? formatDuration(
            +AssessmentResults?.testEndedAt - +AssessmentResults?.testStartedAt
          )
        : "",
  };

  return (
    <div className={styles.card}>
      <div className={styles.leftSection}>
        <div className={styles.scoreBlock}>
          <div className={styles.label}>Total Score</div>
          <div className={styles.value}>
            {results.totalScore}
            <span className={styles.slash}>/{results.maxScore}</span>
          </div>
        </div>
        <div className={styles.attemptedBlock}>
          <span className={styles.attemptedLabel}>Attempted</span>
          <span className={styles.attemptedValue}>
            &nbsp;{results.attempted} Of {results.totalQuestions} Questions
          </span>
        </div>
      </div>
      <div className={styles.rightSection}>
        <div className={styles.timeTitle}>Test Time Analysis</div>
        <div className={styles.time}>
          <div className={styles.timeRow}>
            <span className={styles.timeLabel}>Test Start Time</span>
            <span className={styles.timeValue}>
              {results.testStart || "N/A"}
            </span>
          </div>
          <div className={styles.timeRow}>
            <span className={styles.timeLabel}>Test End Time</span>
            <span className={styles.timeValue}>{results.testEnd}</span>
          </div>
          <div className={styles.timeRow}>
            <span className={styles.timeLabel}>Test Duration</span>
            <span className={styles.timeValue}>{results.testDuration}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const proctoringData = {
  tabSwitches: 5,
  audioViolations: 0,
  videoViolations: 3,
};

const ProctoringCard = () => (
  <div className={styles.proctoringCard}>
    <div className={styles.proctoringheader}>
      <h3 className={styles.title}>Proctoring</h3>
    </div>
    <div className={styles.metricsContainer}>
      <div className={styles.metricItem}>
        <span className={styles.metricValue}>{proctoringData.tabSwitches}</span>
        <span className={styles.metricLabel}>Tab Switches</span>
      </div>
      <div className={styles.metricItem}>
        <span className={styles.metricValue}>
          {proctoringData.audioViolations}
        </span>
        <span className={styles.metricLabel}>Audio Violations</span>
      </div>
      <div className={styles.metricItem}>
        <span className={styles.metricValue}>
          {proctoringData.videoViolations}
        </span>
        <span className={styles.metricLabel}>Video Violations</span>
      </div>
    </div>
  </div>
);

const ReviewInputCard = () => {
  return (
    <div className={styles.reviewCard}>
      <div className={styles.header}>
        <span className={styles.title}>Review (0)</span>
      </div>
      <textarea
        className={styles.textInput}
        placeholder="Start Discussion..."
        rows={2}
      />
      <div className={styles.actions}>
        <Button type="text">Cancel</Button>
        <Button type="primary">Post</Button>
      </div>
    </div>
  );
};

const ScheduleInterviewModal = ({
  visible,
  onCancel,
  onSubmit,
  candidate = {},
  assessmentResults = {},
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Initialize form with prefilled candidate data
  const initialValues = {
    candidateName:
      candidate.userName ||
      `${candidate.firstName || ""} ${candidate.lastName || ""}`.trim(),
    candidateEmail: candidate.email || "",
    candidatePhone: candidate.phone || "",
    totalScore: assessmentResults?.scoreData?.finalScore || "",
    gainedScore: assessmentResults?.scoreData?.finalScore || "",
    type: "video", // default to video interview
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const interviewDetails = {
        date: values.date?.format("YYYY-MM-DD") || "",
        time: values.time?.format("HH:mm") || "",
        candidateDetails: {
          _id: candidate._id || "",
          name: values.candidateName || "",
          phone: values.candidatePhone || "",
          email: values.candidateEmail || "",
          totalScore: values.totalScore || "",
          gainedScore: values.gainedScore || "",
        },
        type: values.type || "",
        interviewer: {
          name: values.interviewerName || "",
          phone: values.interviewerPhone || "",
          email: values.interviewerEmail || "",
          designation: values.interviewerDesignation || "",
        },
      };

      await onSubmit(interviewDetails);

      form.resetFields();
      onCancel();
    } catch (error) {
      console.error("Error scheduling interview:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Schedule Interview"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
      height="80vh"
      keyboard={false}
      maskClosable={false}
      destroyOnHidden
      style={{ marginTop: "-5rem", height: "80vh" }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={initialValues}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Interview Date"
              name="date"
              rules={[
                { required: true, message: "Please select interview date" },
              ]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="YYYY-MM-DD"
                placeholder="Select date"
                prefix={<CalendarOutlined />}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Interview Time"
              name="time"
              rules={[
                { required: true, message: "Please select interview time" },
              ]}
            >
              <TimePicker
                style={{ width: "100%" }}
                format="HH:mm"
                placeholder="Select time"
                prefix={<ClockCircleOutlined />}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Interview Type"
          name="type"
          rules={[{ required: true, message: "Please select interview type" }]}
        >
          <Select placeholder="Select interview type">
            <Option value="online">Online</Option>
            <Option value="offline">Offline</Option>
            <Option value="call">Phone Call</Option>
            <Option value="video">Video Call</Option>
          </Select>
        </Form.Item>

        <div style={{ marginBottom: "24px" }}>
          <h4 style={{ color: "#25A3A6", marginBottom: "16px" }}>
            Candidate Details
          </h4>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Candidate Name"
                name="candidateName"
                rules={[
                  { required: true, message: "Please enter candidate name" },
                ]}
              >
                <Input placeholder="Enter candidate name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Candidate Email"
                name="candidateEmail"
                rules={[
                  { required: true, message: "Please enter candidate email" },
                  { type: "email", message: "Please enter valid email" },
                ]}
              >
                <Input placeholder="Enter candidate email" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Phone Number"
                name="candidatePhone"
                rules={[
                  { required: true, message: "Please enter phone number" },
                ]}
              >
                <Input placeholder="Enter phone number" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Total Score" name="totalScore">
                <Input placeholder="Total score" disabled />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Gained Score" name="gainedScore">
                <Input placeholder="Gained score" disabled />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <h4 style={{ color: "#25A3A6", marginBottom: "16px" }}>
            Interviewer Details
          </h4>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Interviewer Name"
                name="interviewerName"
                rules={[
                  { required: true, message: "Please enter interviewer name" },
                ]}
              >
                <Input placeholder="Enter interviewer name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Interviewer Email"
                name="interviewerEmail"
                rules={[
                  { required: true, message: "Please enter interviewer email" },
                  { type: "email", message: "Please enter valid email" },
                ]}
              >
                <Input placeholder="Enter interviewer email" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Designation"
                name="interviewerDesignation"
                rules={[
                  { required: true, message: "Please enter designation" },
                ]}
              >
                <Input placeholder="Enter designation" />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
          <Button onClick={onCancel} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={{ backgroundColor: "#25A3A6", borderColor: "#25A3A6" }}
          >
            Schedule Interview
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};
