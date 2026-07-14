"use client";
import React, { useCallback, useEffect, useRef, useState, memo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import SocketComp from "./socket";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";
import FormPage from "./utils/formPage";
import { v4 as uuid } from "uuid";
import { Button, Checkbox, message, Modal, notification, Skeleton } from "antd";
import axios from "axios";
import Image from "next/image";
import { validateForm } from "./utils/validation";
import { getSingleTest } from "@/redux/slices/assessmentsSlice/testSlice";
import {
  setSstorage,
  getLstorage,
  getSstorage,
  setLstorage,
} from "@/universalUtils/windowMW";
import {
  assessment_proctoring_url,
  restUrl,
  skillmedhaTestPortal,
} from "@/config/urls";
import { getStudent } from "@/redux/slices/student";
import { fetchOneAssessment } from "@/redux/slices/jobassessmentsSlice";
import { encryptObject } from "../../tests/utils/encrytionMiddleware";
import { parseIfJson } from "../reusable_comp/jsonparse";
import { IoMdArrowRoundBack } from "react-icons/io";
import { Wifi, Clock, Monitor, Battery, VolumeX, User, BookOpen, Eye, RefreshCw, ArrowRight, Calendar, CheckCircle, AlertTriangle, Phone, Check, Info, Home, PenTool, Star, ShieldAlert } from "lucide-react";

// Presentational modal for camera capture + preview
const CaptureModal = memo(function CaptureModal(props) {
  const {
    open,
    onCancel,
    onCapture,
    onContinue,
    onRetake,
    verifying,
    previewing,
    uploadedImageUrl,
    timer,
    formatTime,
    videoRef,
    canvasRef,
    styles,
    isCameraAvailable,
    cameraError,
  } = props;

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={900}
      closeIcon={
        <img
          width={"20rem"}
          src="https://res.cloudinary.com/cliqtick/image/upload/v1722511937/sysnper/53da26962c207566fc273c8904009a36_o2mxsj.png"
          alt="close"
        />
      }
      destroyOnHidden={true}
      centered={true}
    >
      <div className="w-full flex flex-col justify-center items-center gap-4 p-4">
        <h2>{previewing ? "Image Captured Successfully" : "Capture Image"}</h2>

        {previewing ? (
          <img
            width={"50rem"}
            src="https://res.cloudinary.com/cliqtick/image/upload/v1724415311/download_jxlts0.png"
            alt="Success Logo"
          />
        ) : (
          <>
            <ul>
              <li>
                Please click on the <strong>'Capture Snapshot'</strong> button
                to take your photo, then click{" "}
                <strong>'Continue to Test'</strong> if the preview looks clear.
              </li>
              <li>
                Click <strong>'Retake'</strong> to capture a new image if
                needed.
              </li>
              <li>
                If no camera preview is visible, allow camera access in the
                browser site settings.
              </li>
            </ul>

            {cameraError && (
              <div
                style={{
                  color: "#ff4d4f",
                  marginTop: "10px",
                  fontWeight: "bold",
                  padding: "10px",
                  backgroundColor: "#fff2f0",
                  borderRadius: "4px",
                  border: "1px solid #ffccc7",
                }}
              >
                ⚠️ {cameraError}
              </div>
            )}
          </>
        )}

        <div className="w-full h-[20rem] flex items-center justify-center">
          <span className="flex items-center justify-center w-[35rem] object-cover [&_img]:w-full [&_img]:h-full [&_img]:-scale-x-100">
            {uploadedImageUrl?.length ? (
              <img src={uploadedImageUrl} alt="captured Image" />
            ) : (
              <>
                <video
                  ref={videoRef}
                  className="rounded-2xl w-full h-full mx-auto object-cover aspect-video -scale-x-100"
                  autoPlay
                  muted
                  playsInline
                />
                <canvas
                  ref={canvasRef}
                  width="300"
                  height="169"
                  style={{ display: "none" }}
                />
              </>
            )}
          </span>
        </div>

        <div className="w-full flex justify-evenly items-center">
          {previewing ? (
            <div className="w-fit py-2 px-3 rounded-lg bg-[#fdfdfd] shadow-[3px_3px_4px_0_rgba(0,0,0,0.5)] flex cursor-pointer gap-2 [&_p]:font-bold [&_.timer]:text-[1rem] [&_.timer]:font-bold [&_.timer]:text-red-500">
              <p>Opening Test Window in </p>
              <p className="timer text-[1rem] font-bold text-red-500">{formatTime(timer)}</p>
            </div>
          ) : (
            <>
              <button
                className="border-0 w-fit py-2 px-3 rounded-lg bg-[#fdfdfd] shadow-[3px_3px_4px_0_rgba(0,0,0,0.5)] cursor-pointer font-bold disabled:opacity-50"
                onClick={onCapture}
                disabled={!isCameraAvailable || verifying}
              >
                {verifying
                  ? "Verifying..."
                  : !isCameraAvailable
                    ? "Camera Unavailable"
                    : "Capture Snapshot"}
              </button>
              {uploadedImageUrl?.length ? (
                <button className="border-0 w-fit py-2 px-3 rounded-lg bg-[#fdfdfd] shadow-[3px_3px_4px_0_rgba(0,0,0,0.5)] cursor-pointer font-bold" onClick={onContinue}>Continue to Start Test</button>
              ) : null}
              <button className="border-0 w-fit py-2 px-3 rounded-lg bg-[#fdfdfd] shadow-[3px_3px_4px_0_rgba(0,0,0,0.5)] cursor-pointer font-bold disabled:opacity-50" onClick={onRetake} disabled={!isCameraAvailable}>
                Retake
              </button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
});

// Presentational modal to instruct users to allow popups
const PopupBlockedModal = memo(function PopupBlockedModal(props) {
  const { open, onOk, styles } = props;

  return (
    <Modal
      open={open}
      title="Popup was Blocked"
      mask={{ closable: false }}
      keyboard={false}
      closable={false}
      footer={[
        <Button key="ok" type="primary" onClick={onOk}>
          OK
        </Button>,
      ]}
      width={800}
      centered={true}
    >
      <div className="w-full h-[70vh] flex flex-col justify-between overflow-y-scroll [&::-webkit-scrollbar]:w-[10px] [&::-webkit-scrollbar-track]:bg-white [&::-webkit-scrollbar-thumb]:bg-[#fdfdfd] [&::-webkit-scrollbar-thumb]:rounded-[20px] [&::-webkit-scrollbar-thumb]:border-[3px] [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-[#ffffff80] [&::-webkit-scrollbar-thumb]:cursor-auto">
        <div className="w-full p-4 flex justify-between items-center">
          <div className="relative aspect-video w-1/2 rounded-[10px] overflow-hidden">
            <Image
              src="https://res.cloudinary.com/cliqtick/image/upload/v1726215056/sysnper/Screenshot_2024-09-13_133438_ivkkzb.png"
              alt="Instructions"
              fill
              objectFit="cover"
            />
          </div>
          <div className="w-1/2 h-full px-2 [&_p]:w-full [&_p]:h-full [&_p]:text-[1rem] [&_p]:font-medium">
            <p>
              It looks like the browser blocked a pop-up window; click the
              pop-up block icon in the address bar to allow it.
            </p>
          </div>
        </div>

        <div className="w-full p-4 flex justify-between items-center">
          <div className="relative aspect-video w-1/2 rounded-[10px] overflow-hidden">
            <Image
              src="https://res.cloudinary.com/cliqtick/image/upload/v1726215056/sysnper/Screenshot_2024-09-13_133512_sxzhxz.png"
              alt="Instructions"
              fill
              objectFit="cover"
            />
          </div>
          <div className="w-1/2 h-full px-2 [&_p]:w-full [&_p]:h-full [&_p]:text-[1rem] [&_p]:font-medium">
            <p>Select "Always allow pop-ups and redirects."</p>
          </div>
        </div>

        <div className="w-full p-4 flex justify-between items-center">
          <div className="relative aspect-video w-1/2 rounded-[10px] overflow-hidden">
            <Image
              src="https://res.cloudinary.com/cliqtick/image/upload/v1726215056/sysnper/Screenshot_2024-09-13_133542_t7dmxf.png"
              alt="Instructions"
              fill
              objectFit="cover"
            />
          </div>
          <div className="w-1/2 h-full px-2 [&_p]:w-full [&_p]:h-full [&_p]:text-[1rem] [&_p]:font-medium">
            <p>Click Done, then start the test again.</p>
          </div>
        </div>
      </div>
    </Modal>
  );
});

export default function Page() {
  // Redux state
  const testData = useSelector(
    (state) => state.jobassessments.singleAssessment.value
  );
  const studentCreds = useSelector((state) => state.student.student?.data);
  const studentData = useSelector((state) => state.userForm.value);

  // Navigation and params
  const nav = useRouter();
  const searchParams = useSearchParams();
  const testId = searchParams.get("testId");

  // UI & flow state
  const [captureModal, setCaptureModal] = useState(false);
  const [popupBlocked, setPopupBlocked] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [isOpenCamera, setIsOpenCamera] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [timer, setTimer] = useState(5);
  const [checkbox, setCheckBox] = useState(false);

  // Camera availability state
  const [isCameraAvailable, setIsCameraAvailable] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  // Camera refs
  const videoRef = useRef(null);
  const cameraRef = useRef(null);
  const canvasRef = useRef(null);

  // Persisted/session
  const dispatch = useDispatch();
  const token = getLstorage("token");
  const studentId = getLstorage("sId");

  // Countdown cleanup
  const countdownRef = useRef(null);

  // Util: blob from dataURL
  const b64toBlob = useCallback(async (b64Data, contentType = "png") => {
    const base64Response = await fetch(`${b64Data}`);
    const blob = await base64Response.blob();
    return blob;
  }, []);

  // Upload to S3 helper
  const uploadImageToS3 = useCallback(
    async (imageDataUrl) => {
      const OnLoad = message.loading("Uploading...");
      try {
        const formData = new FormData();
        formData.append(
          "file",
          await b64toBlob(imageDataUrl, "png"),
          "face.png"
        );

        const { data } = await axios.post(
          `${restUrl}/uploadtos3?bucketName=skillmedha-student-docs`,
          formData,
          { headers: { Authorization: `Bearer ${getLstorage("token")}` } }
        );

        OnLoad();
        if (data?.file) {
          setSstorage("captured_Img", data?.file);
          message.success("Uploaded Successfully");
          return data.file;
        } else {
          message.error("Failed to upload image to S3");
          return null;
        }
      } catch (error) {
        message.error("An error occurred while uploading the image.");
        return null;
      }
    },
    [b64toBlob, token]
  );

  // Stop camera tracks safely
  const stopCamera = useCallback(() => {
    const stream = cameraRef.current;
    if (stream) {
      try {
        stream.getTracks().forEach((t) => t.stop());
      } catch (e) {
        console.log(e);
      }
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraAvailable(false);
  }, []);

  // Start camera with robust checks and fallbacks
  const startCamera = useCallback(async () => {
    // Security and API checks
    if (typeof window !== "undefined" && !window.isSecureContext) {
      setCameraError("Camera requires HTTPS or localhost");
      setIsCameraAvailable(false);
      message.error("Camera requires HTTPS or localhost (insecure context).");
      return;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError("Camera API not available in this browser");
      setIsCameraAvailable(false);
      message.error("Camera API is not available in this browser.");
      return;
    }

    // Always stop any existing stream first
    stopCamera();

    // Preferred constraints: front camera
    const preferred = {
      video: { facingMode: { ideal: "user" } },
      audio: false,
    };
    const fallback = { video: true, audio: false };

    const attachAndPlay = async (stream) => {
      const video = videoRef.current;
      if (!video) return;
      // iOS/Safari-friendly flags
      try {
        video.muted = true;
        video.playsInline = true;
        video.setAttribute("playsinline", "true");
        video.setAttribute("webkit-playsinline", "true");
        video.setAttribute("autoplay", "true");
      } catch { }
      video.srcObject = stream;
      cameraRef.current = stream;

      // Set camera as available
      setIsCameraAvailable(true);
      setCameraError(null);

      try {
        await video.play();
      } catch {
        // If autoplay still blocked, rely on "Capture" button
      }
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(preferred);
      await attachAndPlay(stream);
    } catch (err) {
      // Granular error messaging + fallback
      const name = err && err.name ? err.name : "Error";
      if (name === "OverconstrainedError") {
        message.info("Retrying camera without device-specific constraints...");
        try {
          const stream = await navigator.mediaDevices.getUserMedia(fallback);
          await attachAndPlay(stream);
          return;
        } catch (e2) {
          err = e2;
        }
      }

      // Set camera unavailable
      setIsCameraAvailable(false);

      if (name === "NotAllowedError") {
        setCameraError(
          "Camera access denied. Please allow camera permissions."
        );
        message.info(
          "Camera access was blocked. Please allow camera permissions."
        );
      } else if (name === "NotFoundError") {
        setCameraError("No camera device found");
        message.error("No camera device found. Please connect a camera.");
      } else if (name === "NotReadableError") {
        setCameraError("Camera already in use by another application");
        message.error(
          "Camera is already in use by another app. Close it and try again."
        );
      } else if (name === "SecurityError") {
        setCameraError("Camera blocked due to insecure context");
        message.error(
          "Camera blocked due to insecure context. Use HTTPS or localhost."
        );
      } else if (name === "AbortError") {
        setCameraError("Camera initialization interrupted");
        message.error("Camera initialization was interrupted. Try again.");
      } else {
        setCameraError("Unable to access camera");
        message.info("An error occurred while accessing the camera.");
      }
      stopCamera();
    }
  }, [stopCamera]);

  // Toggle camera when modal state changes
  useEffect(() => {
    if (isOpenCamera) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpenCamera, startCamera, stopCamera]);

  // Fetch test and student if needed
  useEffect(() => {
    if (!testId) {
      nav.replace("student/jobAssessments");
      return;
    }
    if (testId !== testData?._id) {
      dispatch(fetchOneAssessment(testId));
      dispatch(getStudent({ id: getSstorage("studentId") }));
    }
  }, [dispatch, nav, testData?._id, testId]);

  // Cleanup countdown on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  // Format MM:SS
  const formatTime = useCallback((seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  }, []);

  // Capture > Canvas > Data URL
  const capturePhoto = useCallback(async () => {
    setVerifying(true);

    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) {
      message.error("Camera not ready");
      setVerifying(false);
      return;
    }

    // Ensure canvas matches actual video frame to avoid black frames
    const vw = video.videoWidth || 300;
    const vh = video.videoHeight || 169;
    canvas.width = vw;
    canvas.height = vh;

    const context = canvas.getContext("2d");
    if (!context) {
      message.error("Canvas not supported");
      setVerifying(false);
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL("image/png");

    if (
      testData?.snapShotTechnology === "Enable" &&
      testData?.facialRecognitionTechnology === "Enable"
    ) {
      message.info("Please wait while we verify your image", 1.5);

      if (!studentCreds?.faceData) {
        message.destroy();
        message.error("Please complete the KYC and reattempt the test", 3);
        stopCamera();
        nav.replace("/student/tests");
        return;
      }

      try {
        const { data: detectData } = await axios.post(
          assessment_proctoring_url + "/detectlabels",
          { img: imageData },
          { headers: { Authorization: `Bearer ${getLstorage("token")}` } }
        );

        if (detectData.numPersons > 1) {
          setVerifying(false);
          return message.error(
            "Please ensure that no one is present while you are Verifying"
          );
        }
        if (detectData.numPersons === 0) {
          setVerifying(false);
          return message.error("Face could not be detected");
        }
        if (detectData.checkDevices?.phone) {
          setVerifying(false);
          return message.error("Mobile phone detected");
        }

        const { data: cmpData } = await axios.post(
          assessment_proctoring_url + "/comparefaces",
          {
            img: imageData,
            studentId: studentCreds?._id,
            bucket_name: "synsper-test-series",
          },
          { headers: { Authorization: `Bearer ${getLstorage("token")}` } }
        );

        if (cmpData?.FaceMatches) {
          const confidence = Array.isArray(cmpData.FaceMatches)
            ? cmpData.FaceMatches?.Confidence
            : undefined;
          if (confidence && confidence < 90) {
            setVerifying(false);
            return message.error("Face does not match");
          }
        }
      } catch (e) {
        setVerifying(false);
        return message.error(
          "Verification service unavailable. Please try again."
        );
      }
    }

    const url = await uploadImageToS3(imageData);
    if (url) {
      setUploadedImageUrl(url);
    }
    setVerifying(false);
  }, [
    assessment_proctoring_url,
    nav,
    studentCreds?._id,
    studentCreds?.faceData,
    stopCamera,
    testData?.facialRecognitionTechnology,
    testData?.snapShotTechnology,
    uploadImageToS3,
  ]);

  // On preview success, countdown and auto-start
  const showPreviewAndCountdown = useCallback(() => {
    setIsOpenCamera(false);
    stopCamera();
    setPreviewing(true);

    let countdown = 5;
    setTimer(countdown);

    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      countdown -= 1;
      setTimer(countdown);
      if (countdown <= 0) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
        handleStartTest();
      }
    }, 1000);
  }, [stopCamera]);

  // Retake resets state and opens camera
  const retakePhoto = useCallback(() => {
    setVerifying(false);
    setUploadedImageUrl(null);
    setPreviewing(false);
    setIsOpenCamera(true);
  }, []);

  // Validate form + consent, then open capture modal
  const startCapture = useCallback(() => {
    const requiredFields =
      testData?.startPage?.formRequirements
        ?.filter((field) => field.requires)
        ?.map((field) => field.label) || [];

    const validationResponse = validateForm(studentData, requiredFields);

    if (!validationResponse.isValid) {
      notification.info({
        description: <strong>{validationResponse.message}</strong>,
        showProgress: true,
        placement: "top",
      });
      return;
    }

    if (testData?.startPage?.consetForm && !checkbox) {
      notification.info({
        message: "Notification",
        description: "Please agree to terms and conditions.",
        showProgress: true,
        placement: "top",
      });
      return;
    }

    setCaptureModal(true);
    setIsOpenCamera(true);
  }, [
    checkbox,
    studentData,
    testData?.startPage?.consetForm,
    testData?.startPage?.formRequirements,
  ]);

  // Construct encrypted URL and open in new tab
  const handleStartTest = useCallback(() => {
    setCaptureModal(false);

    if (getSstorage("idFromSocket") === getSstorage("studentId")) {
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
        "&st_i=U2FsdGVkX19ZjNfgxb2iAs6vjWWcEMckFlwBrqYfr7+9dCv7UBby4yUR+rhcsGbv" +
        "&st_t=" +
        testToken +
        "&st_n=U2FsdGVkX1/pRYDqgzyZX9xPBsHMuRwGeBwng/KqIWOHTWaYiSO6DwetS/+86ohEwI6H8Q+eWwcl9ph8ZD5pHg==" +
        "&st_d=" +
        testIdEnc +
        "&st=" +
        getLstorage("token") +
        "&testtype=jobtest";

      // const newWindow = window.open(url, "_blank");
      // if (
      //   !newWindow ||
      //   newWindow.closed ||
      //   typeof newWindow.closed === "undefined"
      // ) {
      //   setPopupBlocked(true);
      // } else {
      //   setLstorage("isStarted", testId);
      //   nav.replace("student/jobAssessments");
      // }
      sessionStorage.removeItem("testStarted");
    sessionStorage.removeItem("value");
    sessionStorage.removeItem("marked");
    sessionStorage.removeItem("codingQuestions");
    sessionStorage.removeItem("time");
    sessionStorage.removeItem("currQues");
      window.location.href = url;
      setLstorage("isStarted", testId);
    } else {
      if (getLstorage("sId")) {
        window.location.reload();
      } else {
        localStorage.clear();
        sessionStorage.clear();
        message.error("User LoggedOut");
        nav.replace("/login");
      }
    }
  }, [nav, studentCreds?._id, studentData, testId, uploadedImageUrl]);

  // Start click handler
  const handleStartClick = useCallback(() => {
    const examId = getSstorage("userIdInProgress");

    if (examId === studentId) {
      message.error(
        <strong>The test you're trying to access is already Started </strong>
      );
      return;
    }

    if (testData?.snapShotTechnology === "Enable") {
      setVerifying(false);
      startCapture();
    } else {
      handleStartTest();
    }
  }, [handleStartTest, startCapture, studentId, testData?.snapShotTechnology]);

  // Popup modal OK handler
  const handlePopupOk = useCallback(() => {
    setPopupBlocked(false);
    setUploadedImageUrl(null);
    setIsOpenCamera(false);
    stopCamera();
    setVerifying(false);
    setPreviewing(false);
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, [stopCamera]);

  // Ensure iOS inline playback attributes at mount
  useEffect(() => {
    const v = videoRef.current;
    if (v) {
      try {
        v.setAttribute("playsinline", "true");
        v.setAttribute("webkit-playsinline", "true");
      } catch { }
    }
  }, []);

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

  const getHeaderIcon = (title) => {
    const t = title.toLowerCase();
    if (t.includes("general")) return <Info className="w-[18px] h-[18px] text-gray-400" />;
    if (t.includes("technical")) return <Monitor className="w-[18px] h-[18px] text-gray-400" />;
    if (t.includes("environment")) return <Home className="w-[18px] h-[18px] text-gray-400" />;
    if (t.includes("answering")) return <PenTool className="w-[18px] h-[18px] text-gray-400" />;
    if (t.includes("scoring")) return <Star className="w-[18px] h-[18px] text-gray-400" />;
    return <Info className="w-[18px] h-[18px] text-gray-400" />;
  };

  return (
    <div className="bg-[#EFF5FB] h-screen overflow-hidden flex flex-col">
      <StudentPageHeader title="Job Assessment" />
      <div className="bg-white px-6 py-4 flex items-center justify-start gap-4 z-10 sticky top-0 shadow-sm border-b border-gray-100">
        <Button
          icon={<IoMdArrowRoundBack />}
          type="text"
          onClick={() => nav.push("/student/jobAssessments")}
        />
        <div className="text-gray-800 font-bold text-2xl m-0">{testData?.jobTitle || testData?.title}</div>
      </div>
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-[10px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#e2e8f0] [&::-webkit-scrollbar-thumb]:rounded-[20px] [&::-webkit-scrollbar-thumb]:border-[3px] [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent">
        <div className="relative p-6 max-w-[1400px] mx-auto pb-12">
          <SocketComp />

          <div className="flex gap-6 flex-col lg:flex-row">
            {!testData ? (
              <Skeleton avatar paragraph={{ rows: 10 }} />
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
          open={captureModal}
          onCancel={() => {
            stopCamera();
            setCaptureModal(false);
            setUploadedImageUrl(null);
            setIsOpenCamera(false);
            if (countdownRef.current) {
              clearInterval(countdownRef.current);
              countdownRef.current = null;
            }
          }}
          onCapture={capturePhoto}
          onContinue={showPreviewAndCountdown}
          onRetake={retakePhoto}
          verifying={verifying}
          previewing={previewing}
          uploadedImageUrl={uploadedImageUrl}
          timer={timer}
          formatTime={formatTime}
          videoRef={videoRef}
          canvasRef={canvasRef}
          isCameraAvailable={isCameraAvailable}
          cameraError={cameraError}
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
