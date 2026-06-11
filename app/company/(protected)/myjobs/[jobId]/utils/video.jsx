"use client";
import React, { useEffect, useState } from "react";
import { Upload, Button, message, Tooltip } from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import videoStyles from "./video.module.scss";
import { useDispatch } from "react-redux";
import { uploadFileToS3 } from "@/utils/universalUtils/uploadtos3";

const VideoUpload = ({ videoUrl, setVideoUrl, restUrl }) => {
  const dispatch = useDispatch();

  const extractFileName = (url) => {
    const parts = url?.split("/");
    const fileNameWithParams = parts?.[parts.length - 1] || "";
    const fileName = fileNameWithParams.split("?");
    // Try to strip any leading ID like "1234-someVideo.mp4" -> "someVideo.mp4"
    const maybeSplit = decodeURIComponent(fileName)?.split("-");
    return maybeSplit?.length > 1
      ? maybeSplit.slice(1).join("-")
      : decodeURIComponent(fileName);
  };

  const [fileList, setFileList] = useState([]);
  const currentVideoUrl = videoUrl || "";
  const [videoSrc, setVideoSrc] = useState(currentVideoUrl);

  const handleChange = ({ fileList }) => {
    setFileList(fileList);
  };

  const handleDelete = () => {
    setFileList([]);
    setVideoSrc("");
    if (setVideoUrl) setVideoUrl("");
  };

  useEffect(() => {
    setVideoSrc(currentVideoUrl);
    if (currentVideoUrl) {
      setFileList([
        {
          uid: "-1",
          name: extractFileName(currentVideoUrl),
          status: "done",
          url: currentVideoUrl,
        },
      ]);
    } else {
      setFileList([]);
    }
  }, [currentVideoUrl]);

  const MAX_MB = 200;

  const beforeUpload = (file) => {
    const isVideo = file.type && file.type.startsWith("video/");
    if (!isVideo) {
      message.error("Only video files are allowed.");
      return Upload.LIST_IGNORE;
    }
    const isValidSize = file.size / 1024 / 1024 < MAX_MB;
    if (!isValidSize) {
      message.error(`Video must be smaller than ${MAX_MB} MB!`);
      return Upload.LIST_IGNORE;
    }
    if (fileList.length >= 1) {
      message.warning("Only one video can be uploaded.");
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (fileList.length === 0) {
      message.error("Please select a video to upload.");
      return;
    }
    try {
      await uploadFileToS3({
        file: fileList.originFileObj, // raw File from antd Upload
        restUrl, // backend endpoint that returns presigned data
        onUploaded: (fileUrl) => {
          setVideoSrc(fileUrl);
          if (setVideoUrl) setVideoUrl(fileUrl);
          message.success("Video uploaded successfully!");
        },
        onError: (error) => {
          console.error("Video upload failed:", error);
          message.error("Failed to upload video.");
        },
      });
    } catch (error) {
      console.error("Upload error:", error);
      message.error("Failed to upload video.");
    }
  };

  return (
    <div className={videoStyles.container}>
      <Upload
        accept="video/*"
        fileList={fileList}
        onChange={handleChange}
        beforeUpload={beforeUpload}
        multiple={false}
        showUploadList={true}
      >
        <Button icon={<UploadOutlined />}>Select Video</Button>
      </Upload>

      <Button type="primary" onClick={handleUpload}>
        Upload Video
      </Button>

      {videoSrc && (
        <div className={videoStyles.player_cont}>
          <video controls className={videoStyles.player}>
            <source src={videoSrc} type="video/mp4" />
            Your browser does not support the video element.
          </video>
          <Tooltip title="Delete Video">
            <Button
              type="text"
              icon={<DeleteOutlined />}
              onClick={handleDelete}
              className={videoStyles.delete_btn}
            />
          </Tooltip>
        </div>
      )}
    </div>
  );
};

export default VideoUpload;
