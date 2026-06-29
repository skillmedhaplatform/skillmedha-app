"use client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import SocketComp from "./socket";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";

import FormPage from "./utils/formPage";
import { v4 as uuid } from "uuid";
import { Button, Checkbox, Skeleton, App } from "antd";
import axios from "axios";
import CaptureModal from "./components/CaptureModal";
import PopupBlockedModal from "./components/PopupBlockedModal";
import { validateForm } from "./utils/validation";
import { getSingleTest } from "@/redux/slices/assessmentsSlice/testSlice";
import { encryptObject } from "../utils/encrytionMiddleware";
import { IoMdArrowRoundBack } from "react-icons/io";
import { Wifi, Clock, Monitor, Battery, VolumeX, User, BookOpen, Eye, RefreshCw, ArrowRight, Calendar, CheckCircle, AlertTriangle, Phone, Check, Info, Home, PenTool, Star, ShieldAlert } from "lucide-react";
import {
  setSstorage,
  getLstorage,
  getSstorage,
  setLstorage,
} from "@/universalUtils/windowMW";
import { parseIfJson } from "../reusable_comp/jsonparse";
import {
  assessment_proctoring_url,
  restUrl,
  skillmedhaTestPortal,
} from "@/config/urls";
import { getStudent } from "@/redux/slices/student";
import useResponsive from "@/hooks/useResponsive";
import MobileTestPage from "@/mobile_views/assessments/MobileTestPage";

const b64toBlob = async (b64Data) => {
  const base64Response = await fetch(`${b64Data}`);
  return base64Response.blob();
};

export default function Page() {
  const { notification, message } = App.useApp();
  const testData = useSelector((state) => state.tests.testData.value);
  const studentCreds = useSelector((state) => state.student.student?.data);
  const studentData = useSelector((state) => state.userForm.value);

  const [captureModal, setCaptureModal] = useState(false);
  const [popupBlocked, setPopupBlocked] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [isOpenCamera, setIsOpenCamera] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [timer, setTimer] = useState(5);
  const [checkbox, setCheckBox] = useState(false);

  const videoRef = useRef(null);
  const cameraRef = useRef(null);
  const canvasRef = useRef(null);

  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const testId = searchParams.get("testId");
  const nav = useRouter();

  const studentId = getLstorage("sId");
  const token = getLstorage("token");

  // --- Data Fetching ---
  useEffect(() => {
    if (!testId) {
      nav.replace("/");
    } else if (testId !== testData?._id) {
      dispatch(getSingleTest({ _id: testId }));
      dispatch(getStudent({ id: getSstorage("studentId") }));
    }
  }, [testData?._id, testId]);

  // --- Camera Lifecycle ---
  useEffect(() => {
    if (isOpenCamera) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [isOpenCamera]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      cameraRef.current = stream;
      videoRef.current.play();
    } catch (err) {
      console.error("Error accessing camera:", err);
      const msg =
        err.name === "NotAllowedError"
          ? "Camera access was blocked. Please allow camera access in your browser settings."
          : "An error occurred while accessing the camera.";
      message.info(msg, err.name === "NotAllowedError" ? undefined : 15);
    }
  };

  const stopCamera = () => {
    const stream = cameraRef.current;
    if (!stream) return;

    try {
      stream.getVideoTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    } catch (error) {
      console.log(error);
    }
  };

  // --- Image Upload ---
  const uploadImageToS3 = async (imageDataUrl) => {
    const hideLoading = message.loading("Uploading...");
    try {
      const formData = new FormData();
      formData.append("file", await b64toBlob(imageDataUrl), "face.png");

      const { data } = await axios.post(
        `${restUrl}/uploadtos3?bucketName=skillmedha-student-docs`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      hideLoading();

      if (data?.file) {
        setSstorage("captured_Img", data.file);
        message.success("Uploaded Successfully");
        return data.file;
      }

      message.error("Failed to upload image to S3");
      return null;
    } catch (error) {
      console.log(error);
      hideLoading();
      message.error("An error occurred while uploading the image.");
      return null;
    }
  };

  // --- Proctoring Verification ---
  const verifyProctoring = async (imageData) => {
    if (!studentCreds?.faceData) {
      message.destroy();
      message.error("Please complete the KYC and reattempt the test", 3);
      stopCamera();
      setVerifying(false);
      nav.replace("/student/tests");
      return false;
    }

    try {
      const authHeaders = { Authorization: `Bearer ${getLstorage("token")}` };

      const { data: detectData } = await axios.post(
        `${assessment_proctoring_url}/detectlabels`,
        { img: imageData },
        { headers: authHeaders }
      );

      if (detectData.numPersons > 1) {
        message.error("Please ensure that no one is present while you are Verifying");
        return false;
      }
      if (detectData.numPersons === 0) {
        message.error("Face could not be detected");
        return false;
      }
      if (detectData.checkDevices?.phone) {
        message.error("Mobile phone detected");
        return false;
      }

      const { data: compareData } = await axios.post(
        `${assessment_proctoring_url}/comparefaces`,
        {
          img: imageData,
          studentId: studentCreds?._id,
          bucket_name: "synsper-test-series",
        },
        { headers: authHeaders }
      );

      const confidence = compareData?.FaceMatches?.[0]?.Confidence;
      if (confidence !== undefined && confidence < 90) {
        message.error("Face does not match");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Proctoring verification failed:", error);
      message.error("Verification server error. Please check your network and try again.");
      return false;
    }
  };

  // --- Photo Capture ---
  const capturePhoto = async () => {
    setVerifying(true);
    const context = canvasRef.current.getContext("2d");
    context.drawImage(
      videoRef.current, 0, 0,
      canvasRef.current.width, canvasRef.current.height
    );

    const imageData = canvasRef.current.toDataURL("image/png");

    const isSnapshotEnabled = testData?.snapShotTechnology === "Enable";
    const isFacialEnabled = testData?.facialRecognitionTechnology === "Enable";

    if (isSnapshotEnabled && isFacialEnabled) {
      message.info("Please wait while we verify your image", 1.5);
      const verified = await verifyProctoring(imageData);
      if (!verified) {
        setVerifying(false);
        return;
      }
    }

    const url = await uploadImageToS3(imageData);
    if (url) {
      setUploadedImageUrl(url);
    }
    setVerifying(false);
  };

  const ShowPreview = () => {
    setIsOpenCamera(false);
    stopCamera();
    setPreviewing(true);
    let countdown = 5;
    setTimer(countdown);

    const countdownInterval = setInterval(() => {
      countdown -= 1;
      setTimer(countdown);

      if (countdown <= 0) {
        clearInterval(countdownInterval);
        handleStartTest();
      }
    }, 1000);
  };

  const retakePhoto = () => {
    setVerifying(false);
    setUploadedImageUrl(null);
    setPreviewing(false);
    startCamera();
    setIsOpenCamera(true);
  };

  // --- Form Validation ---
  const getRequiredFields = () =>
    testData?.startPage?.formRequirements
      ?.filter((field) => field.requires)
      .map((field) => field.label) || [];

  const validateBeforeStart = () => {
    const requiredFields = getRequiredFields();
    const validationResponse = validateForm(studentData, requiredFields);

    if (!validationResponse.isValid) {
      notification.info({
        description: <strong>{validationResponse.message}</strong>,
        showProgress: true,
        placement: "top",
      });
      return false;
    }

    if (testData?.startPage?.consetForm && !checkbox) {
      notification.info({
        description: <strong>Please agree to terms and conditions.</strong>,
        showProgress: true,
        placement: "top",
      });
      return false;
    }

    return true;
  };

  // --- Start Capture (for snapshot-enabled tests) ---
  const startCapture = () => {
    if (!validateBeforeStart()) return;

    setCaptureModal(true);
    setIsOpenCamera(true);
  };

  // --- Start Test (open portal) ---
  const handleStartTest = () => {
    setCaptureModal(false);

    if (!validateBeforeStart()) return;

    const socketId = getSstorage("idFromSocket");
    const sessionStudentId = getSstorage("studentId");

    if (socketId !== sessionStudentId) {
      if (getLstorage("sId")) {
        message.info("Connecting to server... Please wait a moment and try again.");
      } else {
        localStorage.clear();
        sessionStorage.clear();
        message.error("User LoggedOut");
        nav.replace("/login");
      }
      return;
    }

    const testToken = encryptObject({
      object: {
        studentData: { ...studentData, capturedImage: uploadedImageUrl },
        testId,
      },
      key: testId,
      name: "testToken",
    });

    const testIdEnc = encryptObject({
      object: {
        testId,
        attemptId: uuid().split("-").join(""),
        token: getLstorage("token"),
      },
      key: "studentTestIDValue",
      name: "testId",
    });

    const url =
      skillmedhaTestPortal +
      "?sId=" +
      studentCreds?._id +
      "&st_i=U2FsdGVkX19ZjNfgxb2iAs6vjWWcEMckFlwBrqYfr7+9dCv7UBby4yUR+rhcsGbv&st_t=" +
      testToken +
      "&st_n=U2FsdGVkX1/pRYDqgzyZX9xPBsHMuRwGeBwng/KqIWOHTWaYiSO6DwetS/+86ohEwI6H8Q+eWwcl9ph8ZD5pHg==&st_d=" +
      testIdEnc +
      "&st=" +
      getLstorage("token");

    sessionStorage.removeItem("testStarted");
    sessionStorage.removeItem("value");
    sessionStorage.removeItem("marked");
    sessionStorage.removeItem("codingQuestions");
    sessionStorage.removeItem("time");
    sessionStorage.removeItem("currQues");
    
    window.location.href = url;
    setLstorage("isStarted", testId);
  };

  // --- Handle Start Button Click ---
  const handleStartClick = () => {
    const examId = getSstorage("userIdInProgress");

    if (examId == studentId) {
      message.error(
        <strong>The test you're trying to access is already Started</strong>
      );
      return;
    }

    if (testData?.snapShotTechnology === "Enable") {
      setVerifying(false);
      startCapture();
    } else {
      handleStartTest();
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  // --- Derived state for instructions ---
  const hasTestDataLoaded = !!testData;
  const instructionsHtml = testData?.startPage?.intructions
    ? parseIfJson(testData?.startPage?.intructions)
    : null;

  const [parsedGuidelines, setParsedGuidelines] = useState([]);

  useEffect(() => {
    if (instructionsHtml && typeof document !== "undefined") {
      const div = document.createElement("div");
      div.innerHTML = instructionsHtml;
      const sections = [];
      let currentSection = null;

      Array.from(div.children).forEach((node) => {
        const text = node.textContent.trim();
        if (/^\d+\./.test(text) || node.tagName.match(/^H[1-6]$/i)) {
          if (currentSection) sections.push(currentSection);
          const numMatch = text.match(/^(\d+)\.\s*/);
          const num = numMatch ? numMatch[1] : "";
          const titleText = text.replace(/^\d+\.\s*/, "").replace(/:$/, "");
          currentSection = { number: num, title: titleText, content: [] };
        } else {
          if (!currentSection) currentSection = { number: "", title: "Instructions", content: [] };
          const itemHtml = node.innerHTML.replace(/^-\s*/, "");
          if (itemHtml.trim() !== "") {
            currentSection.content.push(itemHtml);
          }
        }
      });
      if (currentSection) sections.push(currentSection);
      setParsedGuidelines(sections);
    }
  }, [instructionsHtml]);

  const getIconForText = (text) => {
    const t = text.toLowerCase();
    if (t.includes("internet") || t.includes("wifi") || t.includes("connection")) return <Wifi className="w-4 h-4 text-[#1E69DA]" />;
    if (t.includes("time") || t.includes("automatically")) return <Clock className="w-4 h-4 text-[#1E69DA]" />;
    if (t.includes("device") || t.includes("browser")) return <Monitor className="w-4 h-4 text-[#1E69DA]" />;
    if (t.includes("charged") || t.includes("battery")) return <Battery className="w-4 h-4 text-[#1E69DA]" />;
    if (t.includes("quiet") || t.includes("distraction")) return <VolumeX className="w-4 h-4 text-[#1E69DA]" />;
    if (t.includes("alone") || t.includes("individuals")) return <User className="w-4 h-4 text-[#1E69DA]" />;
    if (t.includes("resources") || t.includes("books")) return <BookOpen className="w-4 h-4 text-[#1E69DA]" />;
    if (t.includes("read") || t.includes("carefully")) return <Eye className="w-4 h-4 text-[#1E69DA]" />;
    if (t.includes("submit") || t.includes("return")) return <RefreshCw className="w-4 h-4 text-[#1E69DA]" />;
    if (t.includes("next") || t.includes("previous")) return <ArrowRight className="w-4 h-4 text-[#1E69DA]" />;
    if (t.includes("marks") || t.includes("scoring")) return <Calendar className="w-4 h-4 text-[#1E69DA]" />;
    if (t.includes("reviewed")) return <CheckCircle className="w-4 h-4 text-[#1E69DA]" />;
    if (t.includes("cheating") || t.includes("plagiarism")) return <AlertTriangle className="w-4 h-4 text-[#1E69DA]" />;
    if (t.includes("contact") || t.includes("support")) return <Phone className="w-4 h-4 text-[#1E69DA]" />;
    return <Check className="w-4 h-4 text-[#1E69DA]" />; 
  };

  const getHeaderIcon = (title) => {
    const t = title.toLowerCase();
    if (t.includes("general")) return <Info className="w-[18px] h-[18px] text-gray-400" />;
    if (t.includes("technical")) return <Monitor className="w-[18px] h-[18px] text-gray-400" />;
    if (t.includes("environment")) return <Home className="w-[18px] h-[18px] text-gray-400" />;
    if (t.includes("answering")) return <PenTool className="w-[18px] h-[18px] text-gray-400" />;
    if (t.includes("scoring")) return <Star className="w-[18px] h-[18px] text-gray-400" />;
    return <Info className="w-[18px] h-[18px] text-gray-400" />;
  };

  const isMobile = useResponsive();

  if (isMobile) {
    return (
      <>
        <MobileTestPage
          testData={testData}
          hasTestDataLoaded={hasTestDataLoaded}
          instructionsHtml={instructionsHtml}
          checkbox={checkbox}
          setCheckBox={setCheckBox}
          handleStartClick={handleStartClick}
          nav={nav}
        />
        <CaptureModal
          captureModal={captureModal}
          setCaptureModal={setCaptureModal}
          stopCamera={stopCamera}
          setUploadedImageUrl={setUploadedImageUrl}
          previewing={previewing}
          uploadedImageUrl={uploadedImageUrl}
          videoRef={videoRef}
          canvasRef={canvasRef}
          timer={timer}
          verifying={verifying}
          capturePhoto={capturePhoto}
          ShowPreview={ShowPreview}
          retakePhoto={retakePhoto}
          formatTime={formatTime}
        />

        <PopupBlockedModal
          popupBlocked={popupBlocked}
          setPopupBlocked={setPopupBlocked}
          setUploadedImageUrl={setUploadedImageUrl}
          setIsOpenCamera={setIsOpenCamera}
          stopCamera={stopCamera}
          setVerifying={setVerifying}
          setPreviewing={setPreviewing}
        />
      </>
    );
  }

  return (
    <div className="bg-white h-screen overflow-hidden flex flex-col">
      <StudentPageHeader title="Test" />
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-[10px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#e2e8f0] [&::-webkit-scrollbar-thumb]:rounded-[20px] [&::-webkit-scrollbar-thumb]:border-[3px] [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent">
        <div className="relative p-6 max-w-[1400px] mx-auto pb-12">
          <SocketComp />
        <div className="flex items-center justify-start gap-4 mb-4">
          <Button
            icon={<IoMdArrowRoundBack />}
            type="text"
            onClick={() => nav.push("/student/tests")}
          />

          <div className="text-gray-800 font-bold text-2xl m-0">{testData?.title}</div>
        </div>
        <div className="flex gap-6 flex-col lg:flex-row">
          {!hasTestDataLoaded ? (
            <Skeleton
              avatar
              paragraph={{ rows: 10 }}
            />
          ) : parsedGuidelines.length > 0 ? (
            <div className="w-full lg:w-[55%] xl:w-[60%] flex flex-col gap-4">
              <div className="flex items-center gap-2 text-[#1a3b8b] font-bold text-lg mb-2">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                 Exam Guidelines
              </div>
              
              {parsedGuidelines.map((section, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-[0_2px_10px_rgb(0,0,0,0.03)] transition-all">
                   <div className="bg-[#F9FAFC] px-3 py-2 flex items-center justify-between border-b border-gray-200">
                      <div className="flex items-center gap-3">
                         <div className="w-[26px] h-[26px] rounded-full bg-[#eff4ff] text-[#1E69DA] font-bold flex items-center justify-center text-[13px]">
                            {section.number || (idx + 1)}
                         </div>
                         <h3 className="font-extrabold text-[#1a3b8b] text-[15px]">{section.title}</h3>
                      </div>
                      {getHeaderIcon(section.title)}
                   </div>
                   <div className="px-3 pt-1.5 pb-1 flex flex-col gap-1 bg-white">
                      {section.content.map((item, i) => (
                         <div key={i} className="flex items-start">
                            <div 
                               className="text-[14px] text-gray-700 leading-relaxed"
                               dangerouslySetInnerHTML={{ __html: item }} 
                            />
                         </div>
                      ))}
                   </div>
                </div>
              ))}
            </div>
          ) : null}

          <div className="h-max w-full lg:w-[45%] xl:w-[40%] flex flex-col gap-5 pt-[42px]">
            <div className="bg-[#1e293b] w-full p-6 rounded-xl shadow-[0_4px_12px_rgb(0,0,0,0.08)] relative overflow-hidden">
              <div className="inline-flex items-center gap-1.5 bg-red-500/10 text-red-400 px-3 py-1 rounded-full text-[12px] font-bold mb-4 border border-red-500/20">
                 <ShieldAlert className="w-3.5 h-3.5" /> Secured Test
              </div>
              <p className="text-[1.2rem] font-extrabold text-white">Honest Respondent Technology</p>
              <p className="text-[13px] font-medium mt-1 mb-5 text-gray-400">Focus on your test only!</p>
              
              <div className="flex flex-col gap-4">
                 <div className="flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-[#5694F0] mt-1 flex-shrink-0" />
                    <p className="text-[13.5px] text-gray-300 leading-relaxed">The test is secured with Honest Respondent Technology. Don&apos;t click outside the test tab area.</p>
                 </div>
                 <div className="flex items-start gap-3">
                    <Monitor className="w-4 h-4 text-[#5694F0] mt-1 flex-shrink-0" />
                    <p className="text-[13.5px] text-gray-300 leading-relaxed">Every browser tab movement is recorded and may flag your test session.</p>
                 </div>
                 <div className="flex items-start gap-3">
                    <VolumeX className="w-4 h-4 text-[#5694F0] mt-1 flex-shrink-0" />
                    <p className="text-[13.5px] text-gray-300 leading-relaxed">Disable background programs, chats, and system notifications before starting the test.</p>
                 </div>
              </div>
            </div>

            {testData?.startPage?.formRequirements && (
              <div className="bg-white border border-gray-200 w-full p-6 rounded-xl shadow-[0_2px_10px_rgb(0,0,0,0.03)]">
                <div className="flex items-center gap-2 mb-6">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E69DA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                   <p className="text-[1.1rem] font-bold text-[#1a3b8b]">Test Start Form</p>
                </div>
                <FormPage initialData={testData.startPage.formRequirements} />
              </div>
            )}

            {testData?.startPage?.consetForm && (
              <div className="bg-white border border-gray-200 w-full p-4 rounded-xl shadow-[0_2px_10px_rgb(0,0,0,0.03)] flex items-start justify-start gap-3 [&_.conset_check]:mt-1">
                <Checkbox
                  checked={checkbox}
                  onChange={() => setCheckBox(!checkbox)}
                  className="mt-[2px]"
                />
                <span
                  dangerouslySetInnerHTML={{
                    __html:
                      typeof testData.startPage.consetForm === "string"
                        ? parseIfJson(testData.startPage.consetForm)
                        : testData.startPage.consetForm,
                  }}
                  className="text-[13px] text-gray-600 leading-relaxed"
                />
              </div>
            )}

            <div className="flex justify-end mt-2">
              <Button
                loading={verifying}
                onClick={handleStartClick}
                type="primary"
                size="large"
                className="!bg-gradient-to-br !from-[#1E69DA] !to-[#5694F0] !border-none !text-white font-bold px-10 h-11 w-full lg:w-auto shadow-md"
              >
                Start the Test
              </Button>
            </div>
          </div>
        </div>
      </div>
      <CaptureModal
        captureModal={captureModal}
        setCaptureModal={setCaptureModal}
        stopCamera={stopCamera}
        setUploadedImageUrl={setUploadedImageUrl}
        previewing={previewing}
        uploadedImageUrl={uploadedImageUrl}
        videoRef={videoRef}
        canvasRef={canvasRef}
        timer={timer}
        verifying={verifying}
        capturePhoto={capturePhoto}
        ShowPreview={ShowPreview}
        retakePhoto={retakePhoto}
        formatTime={formatTime}
      />

      <PopupBlockedModal
        popupBlocked={popupBlocked}
        setPopupBlocked={setPopupBlocked}
        setUploadedImageUrl={setUploadedImageUrl}
        setIsOpenCamera={setIsOpenCamera}
        stopCamera={stopCamera}
        setVerifying={setVerifying}
        setPreviewing={setPreviewing}
      />
        </div>
    </div>
  );
}
