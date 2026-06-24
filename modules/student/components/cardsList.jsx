"use client";
import React, { useState } from "react";
import Slider from "react-slick";
import { Collapse } from "antd";

import { useSelector } from "react-redux";
import { Image } from "antd";

export default function CardsList({ type }) {
  const allInternships = useSelector(
    (state) => state.internship.allInternships?.data
  );
  const allCourses = useSelector((state) => state.internship.allCourses?.data);
  const {
    value: AllNotifications,
    stats,
    error,
  } = useSelector((state) => state.jonOpenings.allNotices);

  const settings = {
    infinite: false,
    speed: type == "courses" ? 800 : 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    initialSlide: 0,
  };

  const [activeKey, setActiveKey] = useState(null);

  const handleChange = (key) => {
    setActiveKey(key);
  };

  // Helper function to convert URLs to anchor tags
  const linkifyText = (text) => {
    const urlRegex =
      /\b((?:https?|ftp|file):\/\/[-a-zA-Z0-9+&@#\/%?=~_|!:,.;]*[-a-zA-Z0-9+&@#\/%=~_|])/gi;
    return text.replace(urlRegex, (url) => {
      return `<a href="${url}" style="text-decoration: none; color: #1890ff;" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });
  };

  // Helper to render attachment preview based on type
  const renderAttachment = (attachment) => {
    const fileType = attachment.type;
    const fileUrl = attachment.url; // You'll add this

    if (fileType.startsWith("image/")) {
      return (
        <Image
          width={100}
          height={100}
          src={fileUrl}
          preview={{
            src: fileUrl,
          }}
          style={{ objectFit: "cover", cursor: "pointer", borderRadius: "4px" }}
        />
      );
    } else if (
      fileType === "application/pdf" ||
      fileType.includes("document")
    ) {
      return (
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            padding: "8px 12px",
            border: "1px solid #d9d9d9",
            borderRadius: "4px",
            textDecoration: "none",
            color: "#1890ff",
          }}
        >
          📄 {attachment.name}
        </a>
      );
    } else {
      return (
        <a href={fileUrl} download style={{ color: "#1890ff" }}>
          📎 {attachment.name}
        </a>
      );
    }
  };

  let data = [];
  switch (type) {
    case "courses":
      // data = [
      //   {
      //     title: "JavaScript",
      //     img: "https://res.cloudinary.com/queezyv1/image/upload/v1745218162/20190605163315-sale-19736-primary-image-wide_kcplb0.webp",
      //     instructorName: "Prasanna Kumar",
      //     topicsLeft: 20,
      //     completed: "80%",
      //   },
      // ];
      data = allCourses;
      break;
    case "internships":
      data = allInternships;
      break;
    case "notifications":
      data = AllNotifications;
      break;
    case "certificates":
      data = [
        "https://res.cloudinary.com/queezyv1/image/upload/v1745581791/Training-Certificate-of-Completion_mjiz3w.jpg",
        "https://res.cloudinary.com/queezyv1/image/upload/v1745581831/ispring-blog-image-1710417350_jb8xfk.png",
        "https://res.cloudinary.com/queezyv1/image/upload/v1745581773/Certificateofcompletion-2-e1542503069490_equj9z.jpg",
        "https://res.cloudinary.com/queezyv1/image/upload/v1745581724/1600w-_asVJz8YgJE_dyj2gl.webp",
      ];
      break;
    default:
      console.warn(`Unknown card type: ${type}`);
      return null;
  }
  if (type === "notifications") {
    return (
      <div className="flex flex-col gap-3">
        {
        // data?.filter((d) => d?.status !== "pending")        
        data?.filter((d) => d?.status === "active")
          .map((e, i) => {
            return (
              <Collapse
                className={`bg-white border-0 border-l-[3px] border-l-[#24A058] rounded-none w-full ${activeKey == i ? "bg-white rounded-none" : ""
                  }`}
                size="medium"
                activeKey={activeKey}
                onChange={handleChange}
                accordion={true}
                expandIcon={<div>icon</div>}
                items={[
                  {
                    key: i,
                    label: (
                      <div className="flex flex-row items-start justify-between">
                        <div>
                          <p className="text-[16px] font-bold w-[95%] overflow-hidden text-ellipsis whitespace-nowrap m-0">{e?.title}</p>
                          <div className="flex flex-row items-center justify-between gap-[0.3rem] text-[12px]">
                            <p>{e?.startDate}</p>
                          </div>
                        </div>
                        <p
                          style={{
                            color:
                              e?.status === "active"
                                ? "green"
                                : e?.status === "expired"
                                  ? "red"
                                  : "inherit",
                          }}
                        >
                          {e?.status}
                        </p>
                      </div>
                    ),
                    children: (
                      <div
                        className={`p-2 text-[16px] font-medium ${activeKey == i ? "active" : ""
                          }`}
                      >
                        {/* Message with clickable URLs */}
                        <p
                          dangerouslySetInnerHTML={{
                            __html: linkifyText(e?.message || ""),
                          }}
                          style={{ marginBottom: "16px" }}
                        />

                        {/* Attachments Section */}
                        {e?.attachments && e.attachments.length > 0 && (
                          <div style={{ marginTop: "12px" }}>
                            <h4
                              style={{
                                marginBottom: "8px",
                                fontSize: "14px",
                                fontWeight: 600,
                              }}
                            >
                              Attachments:
                            </h4>
                            <div
                              style={{
                                display: "flex",
                                gap: "12px",
                                flexWrap: "wrap",
                              }}
                            >
                              <Image.PreviewGroup>
                                {e.attachments.map((attachment, idx) => (
                                  <div key={idx}>
                                    {renderAttachment(attachment)}
                                  </div>
                                ))}
                              </Image.PreviewGroup>
                            </div>
                          </div>
                        )}
                      </div>
                    ),
                  },
                ]}
              />
            );
          })}
      </div>
    );
  }
}
