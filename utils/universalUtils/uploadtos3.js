"use client";
import axios from "axios";
import { message } from "antd";
import { getLstorage } from "./windowMW";

export const uploadFileToS3 = async ({
  file,
  restUrl,
  bucketName = "skillmedha-resources",
  onUploaded = () => {},
  onSuccess = () => {},
  onError = () => {},
}) => {
  const hide = message.loading("Uploading file to S3...");
  const formData = new FormData();
  formData.append("file", file, file.name);

  try {
    const token = getLstorage("token");
    const res = await axios.post(
      `${restUrl}/uploadtos3?bucketName=${bucketName}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const url = res?.data?.file;
    hide();
    message.success("File uploaded successfully");
    onUploaded(url);
    onSuccess(res.data);
    return url;
  } catch (err) {
    hide();
    message.error("Failed to upload file");
    onError(err);
    throw err;
  }
};
