"use client";
import React, { useEffect, useState } from "react";
import { Upload, Button, message, Tooltip } from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import videoStyles from "./video.module.scss";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
// import { questionResource } from "@/redux/slices/admin/cms/questionSlice";
// import { awsUrl } from "@/config/urls";

const VideoUpload = ({ videoUrl, setVideoUrl }) => {
  // const SingleQuestion = useSelector((state) => state.questions.question);
  // const comprehensionQuestion = useSelector(
  //   (state) => state.comprehension.comprehensionQuestion
  // );

  const extractFileName = (url) => {
    const parts = url?.split("/");
    const fileNameWithParams = parts[parts.length - 1];
    const fileName = fileNameWithParams.split("?")[0];
    return decodeURIComponent(fileName)?.split("-")[1];
  };

  // const values = useSelector((state) => state.questions.questionVals);

  // const newVal = { ...SingleQuestion };

  const dispatch = useDispatch();

  const [fileList, setFileList] = useState([]);
  const [videoSrc, setVideoSrc] = useState(null);

  const handleChange = ({ fileList }) => {
    setFileList(fileList);
  };

  const handleDelete = () => {
    setFileList([]);
    setVideoSrc(null);
    // dispatch(questionResource({ type: "video", file: "" }));
  };

  useEffect(() => {
    const currentVideoUrl = "";
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
  }, []);

  // useEffect(() => {
  //   if (SingleQuestion?.resources?.file) {
  //     const initialFile = {
  //       uid: "-1",
  //       name: extractFileName(SingleQuestion?.resources?.file),
  //       status: "done",
  //       url: SingleQuestion?.resources?.file,
  //     };
  //     setFileList([initialFile]);
  //     setVideoSrc(SingleQuestion?.resources?.file);
  //   }
  // }, [SingleQuestion?.resources?.file, setVideoUrl]);

  // useEffect(()=>{
  //   if(SingleQuestion?.resources?.file ){
  //        setFileList([{file : SingleQuestion?.resources?.file , name : extractFileName(SingleQuestion?.resources?.file )}])
  //        setVideoSrc(SingleQuestion?.resources?.file )
  //        setVideoUrl(SingleQuestion?.resources?.file)
  //       }
  // },[SingleQuestion?.resources?.file ])

  const handleUpload = async (e) => {
    e.preventDefault();
    if (fileList.length === 0) {
      message.error("Please select a video to upload.");
      return;
    }
    message.loading("Uploading Video");
    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append("file", file.originFileObj);
    });

    // try {
    //   const { data } = await axios.post(awsUrl, formData);

    //   if (data.file) {
    //     message.success("Video uploaded successfully!");

    //     if (setVideoUrl) {
    //       setVideoUrl(data?.file);
    //     } else {
    //       dispatch(
    //         questionResource({
    //           type: "video",
    //           file: data?.file,
    //         })
    //       );
    //     }
    //     setVideoSrc(data.file);
    //   } else {
    //     message.error("Failed to upload video.");
    //   }
    // } catch (error) {
    //   message.error("Failed to upload video.");
    // }
  };

  const beforeUpload = (file) => {
    const isValidSize = file.size / 1024 / 1024 < 200;
    if (!isValidSize) {
      message.error("Video must be smaller than 200 MB!");
      return Upload.LIST_IGNORE;
    }
    if (fileList.length >= 1) {
      message.warning("Only one video can be uploaded.");
      return Upload.LIST_IGNORE;
    }
    return true;
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
            <source src={videoSrc || videoUrl} type="video/mp4" />
            Your browser does not support the video element.
          </video>
          <Tooltip title="Delete Video">
            <img
              className={videoStyles.delete_btn}
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

export default VideoUpload;
