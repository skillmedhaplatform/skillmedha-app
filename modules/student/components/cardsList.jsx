"use client";
import React, { useState } from "react";
import Slider from "react-slick";
import { Collapse, ConfigProvider, Button, Image } from "antd";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

export default function CardsList({ type, isModal = false, progressById, combinedLearningData }) {
  const allInternships = useSelector((state) => state.internship.allInternships?.data);
  const allCourses = useSelector((state) => state.internship.allCourses?.data);
  const router = useRouter();
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
      data = allCourses;
      break;
    case "internships":
      data = allInternships;
      break;
    case "notifications":
      const completedCoursesNotices = [];
      if (progressById && combinedLearningData) {
        Object.keys(progressById).forEach((id) => {
          if (progressById[id]?.totalProgress === 100) {
            const course = combinedLearningData.find((c) => c._id === id);
            if (course) {
              const storageKey = `courseCompletionDate_${id}`;
              let completionTimestamp = localStorage.getItem(storageKey);
              if (!completionTimestamp) {
                completionTimestamp = Date.now().toString();
                localStorage.setItem(storageKey, completionTimestamp);
              }
              
              const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
              const isExpired = (Date.now() - parseInt(completionTimestamp, 10)) > threeDaysInMs;
              
              if (!isExpired) {
                const categoryText = course.category ? course.category : (course.type || "Course");
                const shortCategoryText = categoryText.charAt(0).toUpperCase() + categoryText.slice(1);
                
                completedCoursesNotices.push({
                  title: isModal ? `🎉 You completed ${course.title}!` : `🎉 ${shortCategoryText} Completed`,
                  startDate: new Date(parseInt(completionTimestamp, 10)).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
                  status: "active",
                  source: "system",
                  message: `Congratulations! You have completed the ${course.type || "course"} "<b>${course.title}</b>" and you earned a gold badge and 50 coins! Check it out in the achievements section.`,
                });
              }
            }
          }
        });
      }
      
      const mockNewCourse = {
        title: isModal ? "🚀 New Course Released: Advanced React Patterns!" : "🚀 New Web Dev Course Released",
        startDate: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
        status: "active",
        message: `
          <div style="margin-bottom: 8px;">
            <b>Category:</b> Web Development<br/>
            <b>Duration:</b> 4 Weeks<br/>
            <b>What you'll learn:</b> Dive deep into advanced React patterns, custom hooks, performance optimization, and scalable architectures.
          </div>
        `,
        actionUrl: "/student/course", 
        actionText: "Explore Courses"
      };
      
      const newReleasesNotices = [];
      const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
      
      if (allCourses && Array.isArray(allCourses)) {
        allCourses.forEach(course => {
           if (course.createdAt && (Date.now() - new Date(course.createdAt).getTime() <= threeDaysInMs)) {
             const categoryText = course.category ? course.category : "Course";
             newReleasesNotices.push({
               title: isModal ? `🚀 New Course Released: ${course.title}!` : `🚀 New ${categoryText} Released`,
               startDate: new Date(course.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
               status: "active",
               source: "system",
               message: `
                 <div style="margin-bottom: 8px;">
                   <b>Category:</b> ${categoryText}<br/>
                   <b>Duration:</b> ${course.duration || 'Flexible'}<br/>
                   <b>About:</b> ${course.description || `Dive deep into this exciting new ${categoryText.toLowerCase()} and upgrade your skills.`}
                 </div>
               `,
               actionUrl: "/student/course",
               actionText: "Explore Courses"
             });
           }
        });
      }

      if (allInternships && Array.isArray(allInternships)) {
        allInternships.forEach(intern => {
           if (intern.createdAt && (Date.now() - new Date(intern.createdAt).getTime() <= threeDaysInMs)) {
             const categoryText = intern.category ? intern.category : "Internship";
             newReleasesNotices.push({
               title: isModal ? `🚀 New Internship Released: ${intern.title}!` : `🚀 New ${categoryText} Released`,
               startDate: new Date(intern.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
               status: "active",
               source: "system",
               message: `
                 <div style="margin-bottom: 8px;">
                   <b>Category:</b> ${categoryText}<br/>
                   <b>Duration:</b> ${intern.duration || 'Flexible'}<br/>
                   <b>About:</b> ${intern.description || `Gain practical experience with this newly released internship.`}
                 </div>
               `,
               actionUrl: "/student/internshipLibrary",
               actionText: "Explore Internships"
             });
           }
        });
      }
      
      const streakBrokenNotices = [];
      if (typeof window !== "undefined" && localStorage.getItem("streakBrokenNotify") === "true") {
        streakBrokenNotices.push({
          title: "💔 Login Streak Broken!",
          startDate: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
          status: "active",
          source: "system",
          message: "Oh no! Your login streak was reset to 0 because you missed a day. Make sure to log in every day to keep your streak alive and earn more coins!",
          actionUrl: null
        });
      }

      data = [...streakBrokenNotices, ...newReleasesNotices, ...completedCoursesNotices, ...(AllNotifications || [])];
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
      <div className={`flex flex-col gap-3 [&::-webkit-scrollbar]:hidden pb-2 px-1 ${isModal ? 'h-full overflow-y-auto' : 'w-full'}`}>
        {
        // data?.filter((d) => d?.status !== "pending")        
        data?.filter((d) => d?.status === "active")
          .map((e, i) => {
            return (
              <ConfigProvider
                key={i}
                theme={{
                  components: {
                    Collapse: {
                      headerBg: '#FAFAFA',
                      contentBg: '#ffffff',
                    },
                  },
                }}
              >
                <Collapse
                  className={`border-0 border-l-[3px] border-l-[#24A058] rounded-none w-full ${activeKey == i ? "rounded-none" : ""
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
                      <div className="flex flex-row items-start justify-between gap-2 w-full">
                        <div className="flex-1 min-w-0">
                          <p className={`text-[15px] font-bold m-0 leading-snug ${isModal ? 'break-words whitespace-normal' : 'truncate'}`}>{e?.title}</p>
                          <div className="flex flex-row items-center justify-start gap-[0.3rem] text-[12px] mt-1">
                            <p className="m-0 text-gray-500">{e?.startDate}</p>
                          </div>
                        </div>
                        {(!isModal && e?.source === "system") ? null : (
                          <p
                            className="m-0 shrink-0"
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
                        )}
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
                        {e?.actionUrl && isModal && (
                          <div style={{ marginBottom: "16px" }}>
                            <Button 
                              type="primary" 
                              onClick={() => router.push(e.actionUrl)}
                              className="!bg-gradient-to-br !from-[#1E69DA] !to-[#5694F0] !border-none !text-white hover:opacity-90"
                            >
                              {e.actionText || 'View Details'}
                            </Button>
                          </div>
                        )}

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
              </ConfigProvider>
            );
          })}
      </div>
    );
  }
}
