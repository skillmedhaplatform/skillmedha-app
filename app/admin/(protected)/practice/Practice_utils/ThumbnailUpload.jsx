"use client";
import React, { useState } from "react";
import { Upload, Button, App } from "antd";
import { UploadOutlined, DeleteOutlined, LoadingOutlined } from "@ant-design/icons";
import axios from "axios";
import { uploadUrl } from "@/config/urls";
import { getLstorage } from "@/utils/windowMW";

const MAX_SIZE_MB = 2;

// Uploads a card image to blob storage and hands back its public URL.
// Works as a controlled antd Form field (value / onChange).
export default function ThumbnailUpload({ value, onChange }) {
  const { message } = App.useApp();
  const [uploading, setUploading] = useState(false);

  const beforeUpload = (file) => {
    if (!file.type.startsWith("image/")) {
      message.error("Please upload an image file (JPG, PNG or WebP)");
      return Upload.LIST_IGNORE;
    }
    if (file.size / 1024 / 1024 > MAX_SIZE_MB) {
      message.error(`Image must be smaller than ${MAX_SIZE_MB} MB`);
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const customRequest = async ({ file, onSuccess, onError }) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await axios.post(`${uploadUrl}?bucketName=skillmedha-utils`, fd, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${getLstorage("jwtToken") || getLstorage("token")}`,
        },
      });
      if (!data?.file) throw new Error("Upload failed");
      onChange?.(data.file);
      onSuccess?.(data);
    } catch (error) {
      message.error("Image upload failed, please try again");
      onError?.(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex h-[84px] w-[150px] shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="Card image" className="h-full w-full object-cover" />
        ) : (
          <span className="px-2 text-center text-xs text-slate-400">No image (a coloured placeholder is shown)</span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Upload
          accept="image/*"
          showUploadList={false}
          beforeUpload={beforeUpload}
          customRequest={customRequest}
        >
          <Button icon={uploading ? <LoadingOutlined /> : <UploadOutlined />} disabled={uploading}>
            {value ? "Change image" : "Upload image"}
          </Button>
        </Upload>
        {value && (
          <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => onChange?.("")}>
            Remove
          </Button>
        )}
        <span className="text-xs text-slate-400">Recommended 600 × 340 px, max {MAX_SIZE_MB} MB</span>
      </div>
    </div>
  );
}
