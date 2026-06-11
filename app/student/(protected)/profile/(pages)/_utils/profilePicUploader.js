"use client";
import React, { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import { useDropzone } from "react-dropzone";
import { Modal, message } from "antd";
import { FaCamera } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { update } from "@/redux/slices/resumeBuilder/personalDetails";
import {
  setSstorage,
  getSstorage,
  getLstorage,
} from "@/universalUtils/windowMW";
import { restUrl } from "@/config/urls";
import axios from "axios";
import { updateStudent } from "@/redux/slices/student";
import { useSelector } from "react-redux";

const dummyImage = "/default-avatar.jpg"; // Place your default image in public/

const getCroppedBlob = async (imageSrc, crop) => {
  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => resolve(image);
      image.onerror = (error) => reject(error);
      image.src = url;
    });

  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext("2d");

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas is empty"));
    }, "image/jpeg");
  });
};

export default function MainProfileUploader() {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const dispatch = useDispatch();

  const studentCreds = useSelector((state) => state.student.student?.data);

  useEffect(() => {
    const storedImage = getSstorage("img");
    if (storedImage) {
      setCroppedImage(storedImage);
    }
  }, []);

  const onDrop = useCallback((acceptedFiles) => {
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result);
      setModalVisible(true);
    };
    reader.readAsDataURL(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const token = getLstorage("token");
  const handleCropSave = async () => {
    try {
      const blob = await getCroppedBlob(imageSrc, croppedAreaPixels);
      const file = new File([blob], "profile.jpg", { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("file", file, file.name);
      const uploadUrl = `${restUrl}/uploadtos3?bucketName=skillmedha-profiles`;
      const res = await axios.post(uploadUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ` + token,
        },
      });

      const { file: fileUrl } = res.data;
      setCroppedImage(fileUrl);
      dispatch(updateStudent({ aboutDetails: { profile: fileUrl } }));
      // message.success("Profile image uploaded successfully");
      setModalVisible(false);
    } catch (err) {
      console.error("Crop and upload failed", err);
      message.error("Failed to upload cropped image.");
    }
  };

  const handleDeleteImage = () => {
    setCroppedImage(null);
    setSstorage("img", "");
    dispatch(update({ key: "profile", value: "" }));
    message.success("Image removed");
    setModalVisible(false);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <div
        onClick={() => setModalVisible(true)}
        style={{
          position: "relative",
          width: "80px",
          height: "80px",
          margin: "0 auto",
          borderRadius: "50%",
          overflow: "hidden",
          border: "2px solid #ccc",
          cursor: "pointer",
          transition: "all 0.3s ease-in-out",
        }}
        onMouseEnter={(e) => {
          const overlay = e.currentTarget.querySelector(".overlay");
          if (overlay) overlay.style.opacity = "1";
        }}
        onMouseLeave={(e) => {
          const overlay = e.currentTarget.querySelector(".overlay");
          if (overlay) overlay.style.opacity = "0";
        }}
      >
        <img
          src={studentCreds?.profile || croppedImage}
          alt="Profile"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "center",
            display: "block",
          }}
        />
        <div
          className="overlay"
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            height: "30%",
            background: "rgba(0, 0, 0, 0.5)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0,
            transition: "opacity 0.3s ease",
          }}
        >
          <FaCamera size={20} />
        </div>
      </div>

      <Modal
        title="Update Profile Image"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        {!imageSrc && (
          <div
            {...getRootProps()}
            style={{
              border: "2px dashed #ccc",
              padding: "1rem",
              textAlign: "center",
              cursor: "pointer",
              borderRadius: "8px",
            }}
          >
            <input {...getInputProps()} />
            <p>Click or drag an image to upload</p>
          </div>
        )}

        {imageSrc && (
          <div style={{ position: "relative", width: "100%", height: "300px" }}>
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
        )}

        {imageSrc && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "10px",
            }}
          >
            <button
              onClick={handleCropSave}
              style={{
                padding: "8px 16px",
                backgroundColor: "#0070f3",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Save
            </button>
            <button
              onClick={() => {
                setImageSrc(null);
                setModalVisible(false);
              }}
              style={{
                padding: "8px 16px",
                backgroundColor: "#ccc",
                border: "none",
                borderRadius: "4px",
              }}
            >
              Cancel
            </button>
          </div>
        )}

        {croppedImage && !imageSrc && (
          <div style={{ marginTop: "1rem", textAlign: "center" }}>
            <button
              onClick={handleDeleteImage}
              style={{
                padding: "6px 14px",
                backgroundColor: "red",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
              }}
            >
              Delete Image
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
