"use client";
import React, { useEffect, useState } from "react";
import { Upload, Button, message, Tooltip } from "antd";
import { DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import AudioStyles from "./audio.module.scss";
import axios from "@/modules/testportal_admin/utils/axiosInstance";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { questionResource, setQuestionVals } from "@/redux/slices/testportal_admin/slice/questions";
import { uploadToS3 } from "@/utils/universalUtils/s3uploads";

const AudioUpload = ({ audioUrl, setAudioUrl }) => {
  const SingleQuestion = useSelector((state) => state.questions.question);
  const comprehensionQuestion = useSelector(
    (state) => state.comprehension.comprehensionQuestion
  );
  const extractFileName = (url) => {
    const parts = url?.split("/");
    const fileNameWithParams = parts[parts.length - 1];
    const fileName = fileNameWithParams.split("?")[0];
    return decodeURIComponent(fileName)?.split("-")[1];
  };

  const [fileList, setFileList] = useState([]);
  const currentAudioUrl = comprehensionQuestion?.resources?.url || "";

  const values = useSelector((state) => state.questions.questionVals);

  const [audioSrc, setAudioSrc] = useState(currentAudioUrl);

  const newVal = { ...SingleQuestion };

  const dispatch = useDispatch();

  const handleChange = ({ fileList }) => {
    setFileList(fileList);
  };

  const handleDelete = () => {
    setFileList([]);
    setAudioSrc("");
    dispatch(questionResource({ type: "audio", file: "" }));
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

  useEffect(() => {
    if (audioUrl) {
      setAudioSrc(audioUrl);
    }
    if (SingleQuestion?.resources?.file) {
      setFileList([
        {
          file: SingleQuestion?.resources?.file,
          name: extractFileName(SingleQuestion?.resources?.file),
        },
      ]);
      setAudioSrc(SingleQuestion?.resources?.file);
    }
  }, [SingleQuestion?.resources?.file, audioUrl]);

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

    const data = await uploadToS3(fileList, "skillmedha-utils", "Uploading Audio");

    if (data?.file) {
      if (setAudioUrl) {
        setAudioUrl(data?.file);
      } else {
        dispatch(
          questionResource({
            type: "audio",
            file: data?.file,
          })
        );
      }
      setAudioSrc(data?.file);
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
