import { uploadUrl } from "@/config/urls";
import React, { useState, useEffect } from "react";
import { Button, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { updateTopic } from "@/redux/slices/admin/cms/internship";
import { getLstorage } from "@/utils/windowMW";

const ALLOWED_EXTS = ["pdf", "doc", "docx"];
const ALLOWED_MIME = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export default function Resources() {
  const [resources, setResources] = useState([]);
  const [updating, setUpdating] = useState(false);

  const {
    createInternship: internshipId,
    section: sectionId,
    topics: topicId,
  } = useParams();

  const dispatch = useDispatch();
  const singleTopic = useSelector((s) => s.adminInternship.singleTopic);

  useEffect(() => {
    if (singleTopic && singleTopic._id) {
      const makeFileList = (urls = []) =>
        urls.map((url, i) => ({
          uid: `resource-${i}`,
          name: decodeURIComponent(url.split("/").pop() || `resource-${i}`),
          status: "done",
          url,
        }));
      setResources(makeFileList(singleTopic.pdf || []));
    }
  }, [singleTopic]);

  const isAllowedType = (file) => {
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    const typeOk = ALLOWED_MIME.includes(file.type);
    const extOk = ALLOWED_EXTS.includes(ext);
    return typeOk || extOk;
  };

  const beforeUpload = (file) => {
    const isLt200 = file.size / 1024 / 1024 < 200;
    if (!isAllowedType(file)) {
      message.error(`${file.name} is not a PDF/DOC/DOCX`);
      return Upload.LIST_IGNORE;
    }
    if (!isLt200) {
      message.error(`${file.name} is larger than 200MB`);
      return Upload.LIST_IGNORE;
    }
    return false; // manual upload flow
  };

  const handleResourcesChange = ({ fileList }) => {
    setResources(fileList.slice(-1));
  };

  const handlePreview = async (file) => {
    const name = file.name || "";
    const ext = (name.split(".").pop() || "").toLowerCase();

    // PDFs can be previewed from blob or URL
    if (ext === "pdf") {
      let src = file.url;
      if (!src && file.originFileObj) {
        src = URL.createObjectURL(file.originFileObj);
      }
      if (src) {
        window.open(src, "_blank", "noopener,noreferrer");
        if (!file.url && src.startsWith("blob:")) {
          setTimeout(() => URL.revokeObjectURL(src), 5000);
        }
      }
      return;
    }

    // DOC/DOCX requires a public URL (Google Docs Viewer can't read blob:)
    if (file.url) {
      const viewerUrl =
        "https://docs.google.com/gview?embedded=1&url=" +
        encodeURIComponent(file.url);
      window.open(viewerUrl, "_blank", "noopener,noreferrer");
    } else {
      message.info(
        "Preview for DOC/DOCX is available after update (needs public URL)."
      );
    }
  };

  const handleUpdate = async () => {
    try {
      setUpdating(true);

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

      const existingResources = resources
        .filter((f) => f.url)
        .map((f) => f.url);

      const newResourceFiles = resources.filter((f) => f.originFileObj);

      const uploadedResources =
        newResourceFiles.length > 0
          ? await uploadAll(newResourceFiles, "skillmedha-resources")
          : [];

      const resourcesUrls = [...existingResources, ...uploadedResources];

      const payload = { pdf: resourcesUrls };

      await dispatch(
        updateTopic({
          id: internshipId,
          sid: sectionId,
          tid: topicId,
          data: payload,
        })
      ).unwrap();

      message.success("Resources updated successfully");
    } catch (err) {
      console.error(err);
      message.error(
        err?.response?.data?.message ||
          err.message ||
          "Failed to update resources"
      );
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
          PDF/DOC:
        </label>
        <Upload
          accept=".pdf,.doc,.docx"
          multiple={false}
          maxCount={1}
          beforeUpload={beforeUpload}
          fileList={resources}
          onPreview={handlePreview}
          onChange={handleResourcesChange}
          showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
          disabled={updating}
        >
          <Button icon={<UploadOutlined />} disabled={updating}>
            Upload (PDF/DOC)
          </Button>
        </Upload>
      </div>

      <Button type="primary" onClick={handleUpdate} loading={updating}>
        Update PDF
      </Button>

      {resources[0]?.url && (
        <div style={{ marginTop: 12 }}>
          <a
            href={
              (resources[0].name || "").toLowerCase().endsWith(".pdf")
                ? resources[0].url
                : `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(
                    resources[0].url
                  )}`
            }
            target="_blank"
            rel="noreferrer"
          >
            View uploaded resource
          </a>
        </div>
      )}
    </div>
  );
}
