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

    const newWindow = window.open(url, "_blank");

    if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
      setPopupBlocked(true);
    } else {
      setLstorage("isStarted", testId);
    }
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
    <>
      <StudentPageHeader section="Assessment" title="Test" />
      <div className="relative p-4">
        <SocketComp />
        <div className="flex items-center justify-start gap-4 mb-4">
          <Button
            icon={<IoMdArrowRoundBack />}
            type="text"
            onClick={() => nav.push("/student/tests")}
          />

          <div className="text-gray-800 font-bold text-2xl m-0">{testData?.title}</div>
        </div>
        <div className="flex gap-4 flex-col lg:flex-row">
          {!hasTestDataLoaded ? (
            <Skeleton
              avatar
              paragraph={{ rows: 10 }}
            />
          ) : instructionsHtml ? (
            <div
              dangerouslySetInnerHTML={{ __html: instructionsHtml }}
              className="bg-[#f8fafc] p-6 rounded-[10px] shadow-[rgba(9,30,66,0.25)_0_4px_8px_-2px,rgba(9,30,66,0.08)_0_0_0_1px] [&_p]:text-[0.9rem] [&_p]:flex [&_p]:items-start [&_p]:justify-start [&_h3]:text-[1.2rem] [&_h3]:mt-4 [&_h4]:text-[1rem] [&_h4]:mt-4 [&_p]:ml-3 w-full lg:w-1/2"
            />
          ) : null}

          <div className="h-max rounded-lg w-full lg:w-1/2 flex flex-col justify-between gap-4">
            <div className="bg-[#f8fafc] w-full p-6 rounded-lg shadow-[rgba(9,30,66,0.25)_0_4px_8px_-2px,rgba(9,30,66,0.08)_0_0_0_1px]">
              <p className="text-[1.2rem] font-bold mt-4 text-[#24A058]">Honest Respondent Technology</p>
              <p className="text-[1rem] font-semibold my-4 text-[#24A058]">Focus on your test only!</p>
              <p className="mb-[0.7rem]">
                The test is secured with Honest Respondent Technology.
                Don&apos;t click outside the test tab area. Every browser tab
                movement is recorded.
              </p>
              <p className="mb-[0.7rem]">
                We recommend disabling background programs, chats and system
                notifications before the test, as they can trigger a test block.
              </p>
            </div>

            {testData?.startPage?.formRequirements && (
              <div className="bg-[#f8fafc] w-full p-6 rounded-lg shadow-[rgba(9,30,66,0.25)_0_4px_8px_-2px,rgba(9,30,66,0.08)_0_0_0_1px]">
                <p className="text-[1.2rem] font-bold mt-4 text-[#24A058]">Test Start Form</p>
                <FormPage initialData={testData.startPage.formRequirements} />
              </div>
            )}

            {testData?.startPage?.consetForm && (
              <div className="w-full shadow-[rgba(9,30,66,0.25)_0_4px_8px_-2px,rgba(9,30,66,0.08)_0_0_0_1px] rounded-lg p-2 flex items-start justify-start gap-2 bg-[#f8fafc] [&_.conset_check]:flex [&_.conset_check]:items-start [&_.conset_check]:justify-start">
                <Checkbox
                  checked={checkbox}
                  onChange={() => setCheckBox(!checkbox)}
                />
                <span
                  dangerouslySetInnerHTML={{
                    __html:
                      typeof testData.startPage.consetForm === "string"
                        ? parseIfJson(testData.startPage.consetForm)
                        : testData.startPage.consetForm,
                  }}
                  className="text-[0.9rem]"
                />
              </div>
            )}

            <div className="flex justify-end">
              <Button type="primary" onClick={handleStartClick}>
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
    </>
  );
}
