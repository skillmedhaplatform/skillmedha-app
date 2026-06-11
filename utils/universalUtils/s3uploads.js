"use client";
import axios from "axios";
import { message } from "antd";
import { GetToken } from "./token";
import { getLstorage } from "./windowMW";
import { restUrl } from "./urls";

export const handleS3Upload = async ({
  file,
  restUrl,
  bucketName = "skillmedha-utils",
  onUploaded = () => {},
  onSuccess = () => {},
  onError = () => {},
}) => {
  const hideLoading = message.loading("Uploading to S3...");
  const formData = new FormData();
  formData.append("file", file, file.name);

  try {
    const token = GetToken();
    const res = await axios.post(
      `${restUrl}/uploadtos3?bucketName=${bucketName}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${getLstorage("token") || token}`,
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

export const uploadToS3 = (fileList, bucketName = "skillmedha-utils", messageText) => {
  return new Promise((resolve, reject) => {
    const fileObj = fileList[0]?.originFileObj || fileList[0];
    handleS3Upload({
      file: fileObj,
      restUrl: restUrl,
      bucketName: bucketName,
      onSuccess: (data) => resolve(data),
      onError: (err) => reject(err),
    });
  });
};

