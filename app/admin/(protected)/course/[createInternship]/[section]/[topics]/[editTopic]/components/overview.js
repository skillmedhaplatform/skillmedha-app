import { uploadUrl } from "@/config/urls";
import React, { useEffect, useState } from "react";
import { DatePicker, TimePicker, Upload, Button, message, Divider } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import axios from "axios";
import TextEditor from "@/modules/admin/utils/editor";
import overviewStyles from "../page.module.scss";
import { updateTopic, createTopic } from "@/redux/slices/admin/cms/internship";
import { createZoomMeeting, updateMeeting } from "@/redux/slices/admin/cms/zoomSlice";
import { getLstorage } from "@/utils/windowMW";

export default function Overview() {
  const {
    createInternship: internshipId,
    section: sectionId,
    topics: topicId,
  } = useParams();
  const dispatch = useDispatch();

  const singleTopic = useSelector((s) => s.adminInternship.singleTopic);
  const userCreds = useSelector((state) => state.user?.singleUser);

  // form state
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [about, setAbout] = useState("");
  const [sourceCode, setSourceCode] = useState([]);
  const [resources, setResources] = useState([]); // NEW

  // helper: convert URL arrays into AntD Upload fileList format
  const toFileList = (urls = []) =>
    (urls || []).map((url, i) => ({
      uid: `prefill-${i}`,
      name: decodeURIComponent(url.split("/").pop()),
      status: "done",
      url,
    }));

  // When topic arrives, prefill form data
  useEffect(() => {
    if (singleTopic && singleTopic._id) {
      setAbout(singleTopic.about || "");

      const dt = dayjs(singleTopic.timestamp);
      setDate(dayjs(singleTopic.timestamp));
      setTime(dayjs(dt));

      setSourceCode(toFileList(singleTopic.sourceCode));
      setResources(toFileList(singleTopic.resources)); // NEW
    }
  }, [singleTopic]);

  const beforeUpload = (file) => {
    const isLt200 = file.size / 1024 / 1024 < 200;
    if (!isLt200) {
      message.error(`${file.name} is larger than 200MB`);
    }
    return false; // prevent auto upload; keep in fileList
  };

  const handleSourceCodeChange = ({ fileList }) => setSourceCode(fileList);
  const handleResourcesChange = ({ fileList }) => setResources(fileList); // NEW

  const handleSave = async () => {
    // Build timestamp
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

    // Helper to upload only new files
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
      // --- SOURCE CODE ---
      const existingCode = sourceCode.filter((f) => f.url).map((f) => f.url);
      const newCodeFiles = sourceCode.filter((f) => f.originFileObj);
      const uploadedCode = newCodeFiles.length
        ? await uploadAll(newCodeFiles, "skillmedha-sourcecode")
        : [];
      const sourceCodeUrls = [...existingCode, ...uploadedCode];

      // --- RESOURCES (NEW) ---
      const existingResources = resources
        .filter((f) => f.url)
        .map((f) => f.url);
      const newResourceFiles = resources.filter((f) => f.originFileObj);
      const uploadedResources = newResourceFiles.length
        ? await uploadAll(newResourceFiles, "skillmedha-resources")
        : [];
      const resourceUrls = [...existingResources, ...uploadedResources];

      // --- DISPATCH ---
      const payload = {
        timestamp,
        about,
        sourceCode: sourceCodeUrls,
        resources: resourceUrls, // NEW
      };

      await dispatch(
        updateTopic({
          id: internshipId,
          sid: sectionId,
          tid: topicId,
          data: payload,
        })
      ).unwrap();

      // Optionally refresh local lists so new URLs are visible immediately
      setSourceCode(toFileList(sourceCodeUrls));
      setResources(toFileList(resourceUrls));

      // Create Zoom meeting if needed
      // Create or Update Zoom meeting if needed
      if (timestamp) {
        const hasTimeChanged =
          singleTopic?.timestamp &&
          dayjs(singleTopic.timestamp).valueOf() !== timestamp;
        const hasMeeting = !!singleTopic?.meetingId;

        // If time changed and we have a meeting, close the old one
        if (hasTimeChanged && hasMeeting) {
          await dispatch(updateMeeting({ id: singleTopic.meetingId }));
        }

        // Create new meeting if valid timestamp AND (no meeting OR time changed)
        if (!hasMeeting || hasTimeChanged) {
          const createMeetingPayload = {
            hostName: userCreds?.userName,
            hostId: userCreds?._id,
            topic: singleTopic?.title, // This uses the topic title (unchanged here)
            topicId: singleTopic?._id,
            section: sectionId,
            internship: internshipId,
            type: "internship",
            // Note: Backend likely uses 'timestamp' from the topic data we just updated
          };
          dispatch(createZoomMeeting({ data: createMeetingPayload, dispatch }));
        }
      }

      message.success("Topic updated successfully");
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || err.message || "Failed");
    }
  };

  return (
    <div className={overviewStyles.overviewContainer}>
      {/* Schedule Live Section */}
      <div className={overviewStyles.overviewFormRow}>
        <label className={overviewStyles.overviewLabel}>Schedule Live</label>
        <div className={overviewStyles.overviewScheduleInputs}>
          <DatePicker value={date} onChange={setDate} />
          <TimePicker
            value={time}
            onChange={setTime}
            showSecond={false}
            format="HH:mm"
          />
        </div>
      </div>
      {/* About Section */}
      <div className={overviewStyles.overviewFormRow}>
        <label className={overviewStyles.overviewLabel}>About</label>
        <div className={overviewStyles.overviewTextEditor}>
          <TextEditor
            name="about"
            editorFun={(e) => setAbout(e)}
            initialContent={{ about }}
          />
        </div>
      </div>
      {/* Source Code Upload Section */}
      <div className={overviewStyles.overviewFormRow}>
        <label className={overviewStyles.overviewLabel}>Source Code</label>
        <Upload
          multiple
          beforeUpload={beforeUpload}
          fileList={sourceCode}
          onChange={handleSourceCodeChange}
          className={overviewStyles.overviewUpload}
        >
          <Button icon={<UploadOutlined />}>Upload Files</Button>
        </Upload>
      </div>
      {/* Resources Upload Section (NEW) */}
      <div className={overviewStyles.overviewFormRow}>
        <label className={overviewStyles.overviewLabel}>
          Resources (PDF/DOC)
        </label>
        <Upload
          multiple
          accept=".pdf,.doc,.docx"
          beforeUpload={beforeUpload}
          fileList={resources}
          onChange={handleResourcesChange}
          className={overviewStyles.overviewUpload}
        >
          <Button icon={<UploadOutlined />}>Upload Resources</Button>
        </Upload>
      </div>
      {/* Save Button */}
      <div className={overviewStyles.overviewButtonRow}>
        <Button type="primary" onClick={handleSave}>
          {singleTopic?._id ? "Update Topic" : "Create Topic"}
        </Button>
      </div>
      <Divider />
      {/* Bottom Resources List (NEW) */}
      <div className={overviewStyles.overviewFormRow}>
        <label className={overviewStyles.overviewLabel}>Resources</label>
        <div className={overviewStyles.overviewResourcesList}>
          {resources.filter((f) => f.url).length === 0 ? (
            <span>No resources yet</span>
          ) : (
            resources
              .filter((f) => f.url)
              .map((f) => (
                <div
                  key={f.uid}
                  className={overviewStyles.overviewResourceItem}
                >
                  <a href={f.url} target="_blank" rel="noreferrer">
                    {f.name || "Resource"}
                  </a>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
