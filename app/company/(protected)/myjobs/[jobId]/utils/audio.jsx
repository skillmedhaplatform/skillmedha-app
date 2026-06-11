"use client";
import React, { useEffect, useState } from "react";
import { Upload, Button, message, Tooltip } from "antd";
import { DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import AudioStyles from "./audio.module.scss";
import { useDispatch } from "react-redux";
import { uploadFileToS3 } from "@/utils/universalUtils/uploadtos3";

const AudioUpload = ({ audioUrl, setAudioUrl, restUrl }) => {
  const extractFileName = (url) => {
    const parts = url?.split("/");
    const fileNameWithParams = parts[parts.length - 1];
    const fileName = fileNameWithParams.split("?")[0];
    return decodeURIComponent(fileName)?.split("-");
  };

  const [fileList, setFileList] = useState([]);
  const currentAudioUrl = audioUrl || "";
  const [audioSrc, setAudioSrc] = useState(currentAudioUrl);

  const dispatch = useDispatch();

  const handleChange = ({ fileList }) => {
    setFileList(fileList);
  };

  const handleDelete = () => {
    setFileList([]);
    setAudioSrc("");
    if (setAudioUrl) setAudioUrl("");
  };

  useEffect(() => {
    setAudioSrc(currentAudioUrl);

    if (currentAudioUrl) {
      setFileList([
        {
          uid: "-1",
          name: extractFileName(currentAudioUrl),
          status: "done",
          url: currentAudioUrl,
        },
      ]);
    } else {
      setFileList([]);
    }
  }, [currentAudioUrl]);

  const beforeUpload = (file) => {
    const isValidSize = file.size / 1024 / 1024 < 50;
    if (!isValidSize) {
      message.error("Audio file must be smaller than 50 MB!");
      return Upload.LIST_IGNORE;
    }
    if (fileList.length >= 1) {
      message.warning("Only one audio file can be uploaded.");
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (fileList.length === 0) {
      message.error("Please select an audio file to upload.");
      return;
    }
    try {
      await uploadFileToS3({
        file: fileList[0].originFileObj,
        restUrl: restUrl,
        onUploaded: (fileUrl) => {
          setAudioSrc(fileUrl);
          if (setAudioUrl) {
            setAudioUrl(fileUrl);
          }
        },
        onError: (error) => {
          console.error("Audio upload failed:", error);
        },
      });
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  return (
    <div className={AudioStyles.container}>
      <Upload
        accept="audio/*"
        fileList={fileList}
        onChange={handleChange}
        beforeUpload={beforeUpload}
        multiple={false}
        showUploadList={true}
      >
        <Button icon={<UploadOutlined />}>Select Audio</Button>
      </Upload>
      <Button
        type="primary"
        onClick={handleUpload}
        className={AudioStyles.uploadButton}
      >
        Upload Audio
      </Button>

      {audioSrc && (
        <div className={AudioStyles.player_cont}>
          <audio controls className={AudioStyles.player}>
            <source src={audioSrc} />
            Your browser does not support the audio element.
          </audio>

          <Tooltip title="Delete Audio">
            <img
              className={AudioStyles.delete_btn}
              onClick={handleDelete}
              src="https://res.cloudinary.com/cliqtick/image/upload/v1723023488/sysnper/19546bd4c2ce0b1f03ea6693cb0e2f6b_qobhd1.png"
              alt="delete"
            />
          </Tooltip>
        </div>
      )}
    </div>
  );
};

export default AudioUpload;
