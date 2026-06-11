"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import kycStyles from "./kyc.module.scss";
import { Button, Image, message } from "antd";
import axios from "axios";
import { awsUrl, proctoringUrl, studentUrl } from "../utils/urls";
import { decryptObject } from "../utils/encryptionMiddleware";
import { getLstorage } from "../utils/storageMiddleware";
export default function KYC() {
  const searchParams = useSearchParams();
  const studentToken = searchParams.get("s_tk");
  const studentTokenKey = searchParams.get("s_t");
  const token = searchParams.get("st");
  const navigation = useRouter();

  const studentData = decryptObject(studentToken, studentTokenKey) || {};

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      videoRef.current.srcObject = stream;

      cameraRef.current = stream;
      videoRef.current.play();
    } catch (err) {
      console.error("Error accessing camera:", err);
      if (err.name === "NotAllowedError") {
        message.info(
          "Camera access was blocked. Please allow camera access in your browser settings.",
        );
      } else {
        message.destroy();
        message.info("An error occurred while accessing the camera.", 15);
      }
    }
  };

  const stopCamera = () => {
    const stream = cameraRef.current;

    if (stream) {
      try {
        const tracks = stream.getVideoTracks();

        tracks.forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      } catch (error) {
        console.log(error);
      }
    }
  };

  //   if (!studentData?.studentId) navigation.replace("/login");

  const [verifying, setVerifying] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [previewing, setPreviewing] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  useEffect(() => {
    // if (!studentData?.studentId) {
    //   const studentId = getLstorage("sId");
    //   if (!studentId) navigation.replace("/");
    //   else studentData.studentId = studentId;
    // }
    if (!previewing) startCamera();
  }, [previewing]);
  const capturePhoto = async () => {
    setVerifying(true);
    const context = canvasRef.current.getContext("2d");
    context.drawImage(
      videoRef.current,
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height,
    );

    const imageData = canvasRef.current.toDataURL("image/png");
    // if (!studentData?.studentId) {
    //   const studentId = getLstorage("sId");
    //   if (!studentId) navigation.replace("/");
    //   else studentData.studentId = studentId;
    // }

    const { data } = await axios.post(
      proctoringUrl + "/detectlabels",
      {
        img: imageData,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (data.numPersons > 1)
      return message.error(
        "Please ensure that no one is present while you are Verifying",
      );
    if (data.numPersons == 0)
      return message.error("Face could not be detected");
    if (data.checkDevices.phone) {
      return message.error("Mobile phone detected");
    } else {
      setUploadedImageUrl(imageData);
      setPreviewing(true);
    }
  };
  const retakePhoto = () => {
    startCamera();
    setVerifying(false);
    setUploadedImageUrl(null);
    setPreviewing(false);
  };

  const b64toBlob = async (b64Data, contentType = "", sliceSize = 512) => {
    const base64Response = await fetch(`${b64Data}`);
    const blob = await base64Response.blob();
    return blob;
  };
  const uploadImageToS3 = async (img) => {
    const formdata = new FormData();
    formdata.append("file", await b64toBlob(img, "png"), "face.png");
    const { data } = await axios.post(
      awsUrl + "/uploadToS3?bucketName=skillmedha-utils",
      formdata,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return data;
  };
  const handleSave = async () => {
    stopCamera();
    try {
      //   if (!studentData?.studentId) {
      //     const studentId = getLstorage("sId");
      //     if (!studentId) navigation.replace("/");
      //     else studentData.studentId = studentId;
      //   }
      const uploadedImage = await uploadImageToS3(uploadedImageUrl);
      const { data } = await axios.post(
        studentUrl + `/updateStudentwithId/${studentData?.studentId}`,
        {
          faceData: uploadedImage,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (data?.modifiedCount) {
        message.success("Photo Uploaded Successfully");

        if (typeof window !== "undefined") {
          window.location.replace("https://student.skillmedha.com");
          message.success("Open Student Portal");
        }
      }
      stopCamera();
      setPreviewing(false);
    } catch (error) {
      console.log(error);
      stopCamera();
      setPreviewing(false);
    }
  };
  return (
    <div className={kycStyles.container}>
      <div className={kycStyles.innerContiner}>
        <ul>
          <li>
            Please click on the <strong>&apos;Verify Photo&apos;</strong> button
            to take your photo. If the captured photo is clear and neat, click
            on the <strong>&apos;Continue to Test&apos;</strong> button to begin
            your test.
          </li>
          <li>
            If you need to try again, click on{" "}
            <strong>&apos;Retake&apos;</strong> to capture a new image.
          </li>
          <li>
            If you cannot see your photo in the camera box, it means your
            browser does not have permission to access your camera. Please check
            your browser settings to <strong>allow camera access.</strong>
          </li>
        </ul>
        <div className={kycStyles.image_div}>
          <span className={kycStyles.img_span}>
            {uploadedImageUrl?.length ? (
              <Image
                src={uploadedImageUrl}
                alt="captured Image"
                width={300}
                height={300}
                className={kycStyles.capture_img}
              />
            ) : (
              <>
                <video ref={videoRef} className={kycStyles.capture_img} />
                <canvas
                  ref={canvasRef}
                  width="300"
                  height="300"
                  style={{ display: "none" }}
                ></canvas>
              </>
            )}
          </span>
        </div>
        <div className={kycStyles.btns_div}>
          <Button type="primary" onClick={capturePhoto} disabled={verifying}>
            Verify Photo
          </Button>
          {uploadedImageUrl?.length ? (
            <Button type="primary" onClick={handleSave}>
              Save
            </Button>
          ) : (
            ""
          )}
          <Button type="primary" onClick={retakePhoto}>
            Retake
          </Button>
        </div>
      </div>
    </div>
  );
}
