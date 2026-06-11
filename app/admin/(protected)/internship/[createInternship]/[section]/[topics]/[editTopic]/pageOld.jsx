import { uploadUrl } from "@/config/urls";
"use client";
import React, { useEffect, useState } from "react";
import topicEditorStyles from "./page.module.scss";
import "./ediStyles.css";
import { useParams, useRouter } from "next/navigation";
import { DatePicker, TimePicker, Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import TextEditor from "@/modules/admin/utils/editor";
import axios from "axios";
import {
  getOneInternship,
  getOneSection,
  getOneTopic,
  updateTopic,
  createTopic,
  getTopicsFromSection,
} from "@/redux/slices/admin/cms/internship";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import { createZoomMeeting } from "@/redux/slices/admin/cms/zoomSlice";

const { Dragger } = Upload;

export default function Page() {
  const {
    createInternship: internshipId,
    section: sectionId,
    topics: topicId,
  } = useParams();
  const nav = useRouter();
  const dispatch = useDispatch();

  const singleInternship = useSelector((s) => s.adminInternship.singleInternship);
  const singleSection = useSelector((s) => s.adminInternship.singleSection);
  const singleTopic = useSelector((s) => s.adminInternship.singleTopic);

  const userCreds = useSelector((state) => state.user?.singleUser);

  // form state
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [about, setAbout] = useState("");
  const [resources, setResources] = useState([]);
  const [sourceCode, setSourceCode] = useState([]);

  // 1) on mount: fetch internship/section/topic
  useEffect(() => {
    if (internshipId && internshipId !== "newInternship") {
      dispatch(getOneInternship({ id: internshipId, orgId: userCreds?.orgId }));
    }
    if (sectionId) {
      dispatch(getOneSection({ id: sectionId }));
    }
    // only fetch topic when updating
    if (topicId && topicId !== "newTopic") {
      dispatch(getOneTopic({ id: topicId }));
    }
  }, [dispatch, internshipId, sectionId, topicId]);

  // 2) when topic arrives, prefill about & files
  useEffect(() => {
    if (singleTopic && singleTopic._id) {
      setAbout(singleTopic.about || "");
      // turn URL arrays into AntD Upload fileList format:
      const makeFileList = (urls = []) =>
        urls.map((url, i) => ({
          uid: `prefill-${i}`,
          name: decodeURIComponent(url.split("/").pop()),
          status: "done",
          url,
        }));

      const dt = dayjs(singleTopic.timestamp);

      setDate(dayjs(singleTopic.timestamp));
      setTime(dayjs(dt));
      setResources(makeFileList(singleTopic.resources));
      setSourceCode(makeFileList(singleTopic.sourceCode));
    }
  }, [singleTopic]);

  const beforeUpload = (file) => {
    const isLt200 = file.size / 1024 / 1024 < 200;
    if (!isLt200) {
      message.error(`${file.name} is larger than 200MB`);
    }
    return false;
  };

  const handleResourcesChange = ({ fileList }) => setResources(fileList);
  const handleSourceCodeChange = ({ fileList }) => setSourceCode(fileList);

  const handleSave = async () => {
    // build timestamp
    let timestamp = null;
    if (date && time) {
      if (typeof date.clone === "function") {
        const dt = date
          .clone()
          .set({ hour: time.hour(), minute: time.minute(), second: 0 });
        timestamp = new Date(dt.toISOString()).getTime();
      } else {
        const dt = new Date(date);
        dt.setHours(time.hour(), time.minute(), 0);
        timestamp = dt.getTime();
      }
    }

    // helper to upload only new files
    const uploadAll = async (files, bucketName) => {
      const promises = files.map((f) => {
        const fd = new FormData();
        fd.append("file", f.originFileObj);
        return axios.post(
          `${uploadUrl}?bucketName=${bucketName}`,
          fd,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${getLstorage("token")}`,
            },
          }
        );
      });
      const results = await Promise.all(promises);
      return results.map((r) => r.data.file);
    };

    try {
      // --- RESOURCES ---
      // 1) keep URLs for files the user didn't remove
      const existingResources = resources
        .filter((f) => f.url)
        .map((f) => f.url);

      // 2) pick out the new files to upload
      const newResourceFiles = resources.filter((f) => f.originFileObj);

      // 3) upload them, if any
      const uploadedResources = newResourceFiles.length
        ? await uploadAll(newResourceFiles, "skillmedha-resources")
        : [];

      // 4) final array = remaining old URLs + newly uploaded URLs
      const resourcesUrls = [...existingResources, ...uploadedResources];

      // --- SOURCE CODE (same pattern) ---
      const existingCode = sourceCode.filter((f) => f.url).map((f) => f.url);
      const newCodeFiles = sourceCode.filter((f) => f.originFileObj);
      const uploadedCode = newCodeFiles.length
        ? await uploadAll(newCodeFiles, "skillmedha-sourcecode")
        : [];
      const sourceCodeUrls = [...existingCode, ...uploadedCode];

      // --- DISPATCH ---
      const payload = {
        timestamp,
        about,
        resources: resourcesUrls,
        sourceCode: sourceCodeUrls,
      };

      await dispatch(
        updateTopic({
          id: internshipId,
          sid: sectionId,
          tid: topicId,
          data: payload,
        })
      ).unwrap();

      if (!singleTopic?.meetingId && timestamp) {
        const createMeetingPayload = {
          hostName: userCreds?.userName,
          hostId: userCreds?._id,
          topic: singleTopic?.title,
          topicId: singleTopic?._id,
          section: sectionId,
          internship: internshipId,
          type: "course",
        };
        dispatch(createZoomMeeting({ data: createMeetingPayload, dispatch }));
      }

      message.success("Topic updated successfully");
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || err.message || "Failed");
    } finally {
      dispatch(
        getTopicsFromSection({
          id: internshipId,
          sid: sectionId,
        })
      );
    }
  };

  const recreateMeeting = () => {
    try {
      const createMeetingPayload = {
        hostName: userCreds?.userName,
        hostId: userCreds?._id,
        topic: singleTopic?.title,
        topicId: singleTopic?._id,
        section: sectionId,
        internship: internshipId,
        type: "course",
      };
      dispatch(createZoomMeeting({ data: createMeetingPayload, dispatch }));
    } catch (error) {
      console.log(error);
      message.error(
        error?.response?.data?.msg || error?.msg || "Failed to recreate meeting"
      );
    }
  };
  return (
    <div className={topicEditorStyles.container}>
      <div className={topicEditorStyles.header}>
        <span
          onClick={() => nav.push(`/admin/internship/${internshipId}`)}
          style={{ cursor: "pointer" }}
        >
          {singleInternship?.title}
          <img
            src="https://res.cloudinary.com/dug3awue8/image/upload/v1746083643/icon_sgq3vj.svg"
            alt=">"
          />
        </span>
        <span
          onClick={() => nav.push(`/admin/internship/${internshipId}/${sectionId}`)}
          style={{ cursor: "pointer" }}
        >
          {singleSection?.title}
          <img
            src="https://res.cloudinary.com/dug3awue8/image/upload/v1746083643/icon_sgq3vj.svg"
            alt=">"
          />
        </span>
        <strong
          onClick={() =>
            nav.push(`/admin/internship/${internshipId}/${sectionId}/${topicId}`)
          }
          style={{ cursor: "pointer" }}
        >
          {singleTopic?.title || "New Topic"}
        </strong>
      </div>

      <div className={topicEditorStyles.formRow}>
        <label className={topicEditorStyles.label}>Schedule Live:</label>
        <div className={topicEditorStyles.scheduleInputs}>
          <DatePicker value={date} onChange={setDate} />
          <TimePicker
            value={time}
            onChange={setTime}
            showSecond={false}
            format="HH:mm"
          />
        </div>
      </div>
      <br />

      <div className={topicEditorStyles.formRow}>
        <label className={topicEditorStyles.label}>About:</label>
        <TextEditor
          name="about"
          editorFun={(e) => setAbout(e)}
          initialContent={{ about }}
        />
      </div>

      <br />
      <div className={topicEditorStyles.formRow}>
        <label className={topicEditorStyles.label}>Resources:</label>
        <Upload
          multiple
          beforeUpload={beforeUpload}
          fileList={resources}
          onChange={handleResourcesChange}
          className={topicEditorStyles.upload}
        >
          <Button icon={<UploadOutlined />}>Upload</Button>
        </Upload>
      </div>
      <br />

      <div className={topicEditorStyles.formRow}>
        <label className={topicEditorStyles.label}>Source Code:</label>
        <Upload
          multiple
          beforeUpload={beforeUpload}
          fileList={sourceCode}
          onChange={handleSourceCodeChange}
          className={topicEditorStyles.upload}
        >
          <Button icon={<UploadOutlined />}>Upload</Button>
        </Upload>
      </div>
      <br />

      <div
        className={topicEditorStyles.buttonRow}
        style={{
          gap: "5rem",
        }}
      >
        <Button type="primary" onClick={handleSave}>
          {singleTopic?._id ? "Update Topic" : "Create Topic"}
        </Button>
        {/* <Button type="primary" onClick={recreateMeeting}>
            {"Re-create Meeting" }
          </Button> */}
      </div>
    </div>
  );
}
