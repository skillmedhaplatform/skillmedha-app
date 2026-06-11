"use client";
import { uploadUrl } from "@/config/urls";
// "use client";
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { Button, Upload, message } from "antd";
// import { VideoCameraOutlined } from "@ant-design/icons";
// import { useParams } from "next/navigation";
// import { useDispatch, useSelector } from "react-redux";
// import axios from "axios";
// import { updateTopic } from "@/redux/slices/admin/cms/internship";
// import { getLstorage } from "@/utils/windowMW";

// export default function Video() {
//   const [videos, setVideos] = useState([]);
//   const originalUrlsRef = useRef([]); // baseline for change detection

//   const {
//     createInternship: internshipId,
//     section: sectionId,
//     topics: topicId,
//   } = useParams();
//   const dispatch = useDispatch();
//   const singleTopic = useSelector((s) => s.adminInternship.singleTopic);

//   const makeFileList = (urls = []) =>
//     urls.map((url, i) => ({
//       uid: `video-${i}`,
//       name: decodeURIComponent(url.split("/").pop()),
//       status: "done",
//       url,
//     }));

//   // Load existing videos + snapshot baseline
//   useEffect(() => {
//     if (singleTopic && singleTopic._id) {
//       const urls = singleTopic.resources || [];
//       originalUrlsRef.current = urls;
//       setVideos(makeFileList(urls));
//     }
//   }, [singleTopic]);

//   const beforeUpload = (file) => {
//     const isVideo = file.type?.startsWith("video/");
//     const allowedTypes = [
//       "video/mp4",
//       "video/avi",
//       "video/mov",
//       "video/wmv",
//       "video/flv",
//       "video/webm",
//       "video/mkv",
//     ];

//     if (!isVideo || !allowedTypes.includes(file.type)) {
//       message.error(`${file.name} is not a supported video format.`);
//       return Upload.LIST_IGNORE; // do not add to list
//     }
//     if (file.size / 1024 / 1024 > 500) {
//       message.error(`${file.name} is larger than 500MB`);
//       return Upload.LIST_IGNORE; // do not add to list
//     }
//     return false; // valid: prevent auto-upload, keep in list
//   };

//   const handleVideosChange = ({ file, fileList }) => {
//     // file.status may be 'removed' when clicking the remove icon
//     setVideos(fileList);
//   };

//   // Optional: custom render to show a simple video preview for existing URLs
//   const itemRender = (originNode, file, _fileList, actions) => {
//     const canPreview = !!file.url;
//     return (
//       <div
//         style={{
//           display: "flex",
//           gap: 12,
//           alignItems: "center",
//           padding: 8,
//           border: "1px solid #f0f0f0",
//           borderRadius: 6,
//         }}
//       >
//         <div style={{ flex: 1, minWidth: 0 }}>
//           {canPreview ? (
//             <video
//               src={file.url}
//               controls
//               style={{ maxWidth: "100%", maxHeight: 160, borderRadius: 4 }}
//             />
//           ) : (
//             <div style={{ color: "#666" }}>{file.name}</div>
//           )}
//         </div>
//         <Button size="small" danger onClick={actions.remove}>
//           Remove
//         </Button>
//       </div>
//     );
//   };

//   // Compute dirty state: set difference on URLs OR presence of new files
//   const isDirty = useMemo(() => {
//     const currentUrls = videos.filter((f) => f.url).map((f) => f.url);
//     const original = originalUrlsRef.current || [];
//     const hasNewFiles = videos.some((f) => f.originFileObj);

//     if (hasNewFiles) return true;
//     if (currentUrls.length !== original.length) return true;

//     const setA = new Set(currentUrls);
//     for (const u of original) {
//       if (!setA.has(u)) return true;
//     }
//     return false;
//   }, [videos]);

//   const handleUpdate = async () => {
//     try {
//       const uploadAll = async (files, bucketName) => {
//         const results = await Promise.all(
//           files.map((f) => {
//             const fd = new FormData();
//             fd.append("file", f.originFileObj);
//             return axios.post(
//               `${uploadUrl}?bucketName=${bucketName}`,
//               fd,
//               {
//                 headers: {
//                   "Content-Type": "multipart/form-data",
//                   Authorization: `Bearer ${getLstorage("token")}`,
//                 },
//               }
//             );
//           })
//         );
//         return results.map((r) => r.data.file);
//       };

//       const existingUrls = videos.filter((f) => f.url).map((f) => f.url);
//       const newFiles = videos.filter((f) => f.originFileObj);
//       const uploaded = newFiles.length
//         ? await uploadAll(newFiles, "skillmedha-resources")
//         : [];
//       const finalUrls = [...existingUrls, ...uploaded];

//       await dispatch(
//         updateTopic({
//           id: internshipId,
//           sid: sectionId,
//           tid: topicId,
//           data: { resources: finalUrls },
//         })
//       ).unwrap();

//       // Reset baseline and controlled list
//       originalUrlsRef.current = finalUrls;
//       setVideos(makeFileList(finalUrls));
//       message.success("Videos updated successfully");
//     } catch (err) {
//       console.error(err);
//       message.error(
//         err.response?.data?.message || err.message || "Failed to update videos"
//       );
//     }
//   };

//   return (
//     <div>
//       <div style={{ marginBottom: 20 }}>
//         <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
//           Videos
//         </label>

//         <Upload
//           multiple
//           accept="video/*"
//           beforeUpload={beforeUpload}
//           fileList={videos}
//           onChange={handleVideosChange}
//           showUploadList
//           itemRender={itemRender}
//         >
//           <Button icon={<VideoCameraOutlined />}>Add/Upload Video</Button>
//         </Upload>

//         <small
//           style={{
//             color: "#666",
//             fontSize: 12,
//             marginTop: 8,
//             display: "block",
//           }}
//         >
//           Supported: MP4, AVI, MOV, WMV, FLV, WebM, MKV. Max 500MB per video.
//         </small>
//       </div>

//       <Button type="primary" onClick={handleUpdate} disabled={!isDirty}>
//         {originalUrlsRef.current.length ? "Update Videos" : "Upload Videos"}
//       </Button>
//     </div>
//   );
// }

// multiple videos code above ==========================================

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Upload, message } from "antd";
import { VideoCameraOutlined } from "@ant-design/icons";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { updateTopic } from "@/redux/slices/admin/cms/internship";
import { getLstorage } from "@/utils/windowMW";

export default function Video() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const originalUrlsRef = useRef([]);

  const {
    createInternship: internshipId,
    section: sectionId,
    topics: topicId,
  } = useParams();
  const dispatch = useDispatch();
  const singleTopic = useSelector((s) => s.adminInternship.singleTopic);

  const makeFileList = (urls = []) =>
    urls.map((url, i) => ({
      uid: `video-${i}`,
      name: decodeURIComponent(url.split("/").pop()),
      status: "done",
      url,
    }));

  useEffect(() => {
    if (singleTopic && singleTopic._id) {
      const urls = singleTopic.videos || [];
      originalUrlsRef.current = urls;
      setVideos(makeFileList(urls));
    }
  }, [singleTopic]);

  const beforeUpload = (file) => {
    const isVideo = file.type?.startsWith("video/");
    const allowed = [
      "video/mp4",
      "video/avi",
      "video/mov",
      "video/wmv",
      "video/flv",
      "video/webm",
      "video/mkv",
    ];
    if (!isVideo || !allowed.includes(file.type)) {
      message.error(`${file.name} is not a supported video format.`);
      return Upload.LIST_IGNORE;
    }
    if (file.size / 1024 / 1024 > 500) {
      message.error(`${file.name} is larger than 500MB`);
      return Upload.LIST_IGNORE;
    }
    return false; // keep in list, no auto-upload
  };

  const handleVideosChange = ({ fileList }) => {
    // enforce single-item list
    const next = fileList.slice(-1);
    setVideos(next);
  };

  const itemRender = (originNode, file, _fileList, actions) => {
    const canPreview = !!file.url;
    return (
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          padding: 8,
          border: "1px solid #f0f0f0",
          borderRadius: 6,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          {canPreview ? (
            <video
              src={file.url}
              controls
              style={{ maxWidth: "100%", maxHeight: 160, borderRadius: 4 }}
            />
          ) : (
            <div style={{ color: "#666" }}>{file.name}</div>
          )}
        </div>
        <Button size="small" danger onClick={actions.remove}>
          Remove
        </Button>
      </div>
    );
  };

  const isDirty = useMemo(() => {
    const currentUrls = videos.filter((f) => f.url).map((f) => f.url);
    const original = originalUrlsRef.current || [];
    const hasNewFiles = videos.some((f) => f.originFileObj);
    if (hasNewFiles) return true;
    if (currentUrls.length !== original.length) return true;
    const setA = new Set(currentUrls);
    for (const u of original) {
      if (!setA.has(u)) return true;
    }
    return false;
  }, [videos]);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const uploadAll = async (files, bucketName) => {
        const results = await Promise.all(
          files.map((f) => {
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
          })
        );
        return results.map((r) => r.data.file);
      };

      const existingUrls = videos.filter((f) => f.url).map((f) => f.url);
      const newFiles = videos.filter((f) => f.originFileObj);
      const uploaded = newFiles.length
        ? await uploadAll(newFiles, "skillmedha-resources")
        : [];
      const finalUrls = [...existingUrls, ...uploaded];

      await dispatch(
        updateTopic({
          id: internshipId,
          sid: sectionId,
          tid: topicId,
          data: { videos: finalUrls },
        })
      ).unwrap();

      originalUrlsRef.current = finalUrls;
      setVideos(makeFileList(finalUrls));
      message.success("Videos updated successfully");
    } catch (err) {
      console.error(err);
      message.error(
        err.response?.data?.message || err.message || "Failed to update videos"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
          Videos
        </label>

        <Upload
          accept="video/*"
          multiple={false}
          maxCount={1}
          beforeUpload={beforeUpload}
          fileList={videos}
          onChange={handleVideosChange}
          showUploadList
          itemRender={itemRender}
        >
          <Button icon={<VideoCameraOutlined />}>Add/Upload Video</Button>
        </Upload>

        <small
          style={{
            color: "#666",
            fontSize: 12,
            marginTop: 8,
            display: "block",
          }}
        >
          Supported: MP4, AVI, MOV, WMV, FLV, WebM, MKV. Max 500MB per video.
        </small>
      </div>

      <Button
        type="primary"
        onClick={handleUpdate}
        disabled={!isDirty}
        loading={loading}
      >
        {originalUrlsRef.current.length ? "Update Video" : "Upload Video"}
      </Button>
    </div>
  );
}
