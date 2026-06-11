"use client";
import axios from "axios";
import { App } from "antd";
import { getLstorage } from "./windowMW";

export const handleS3Upload = async ({
  file,
  restUrl,
  bucketName = "skillmedha-utils",
  onUploaded = () => { },
  onSuccess = () => { },
  onError = () => { },
}) => {
  const { message } = App.useApp();
  const hideLoading = message.loading("Uploading to S3...");
  const formData = new FormData();
  formData.append("file", file, file.name);

  try {
    const token = getLstorage("token");
    const res = await axios.post(
      `${restUrl}/uploadToS3?bucketName=${bucketName}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${getLstorage("jwtToken") || token}`,
        },
      }
    );

    const uploadedFile = res?.data?.file;
    hideLoading();
    message.success("Image uploaded to S3");
    onUploaded(uploadedFile);
    onSuccess(res.data);
  } catch (err) {
    console.error(err);
    hideLoading();
    message.error("Failed to upload image to S3");
    onError(err);
  }
};
