"use client";
import React, { useState } from "react";
import Slider from "react-slick";
import { Collapse, ConfigProvider, Button, Image } from "antd";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { updateStudent } from "@/redux/slices/student";
import { calculateProfileCompletion } from "@/universalUtils/getprofilecompleteion";

export default function CardsList({ type, isModal = false, progressById, combinedLearningData, activeNoticeIndex }) {
  const allInternships = useSelector((state) => state.internship.allInternships?.data);
  const allCourses = useSelector((state) => state.internship.allCourses?.data);
  const router = useRouter();
  const {
    value: AllNotifications,
    stats,
    error,
  } = useSelector((state) => state.jonOpenings.allNotices);
  
  const studentData = useSelector((state) => state.student.student?.data);
  const allTests = useSelector((state) => state.tests?.allTests || []);
  const allJobAssessments = useSelector((state) => state.jobassessments?.assessments?.value?.data || []);

  const [claimedAchievements, setClaimedAchievements] = useState([]);
  
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const loadClaimed = () => {
        let stored = studentData?.claimedAchievements || [];
        if (typeof window !== "undefined") {
          const userId = studentData?._id || "";
          const local = JSON.parse(localStorage.getItem(`claimedAchievements_${userId}`) || "[]");
          // Merge avoiding duplicates
          stored = Array.from(new Set([...stored, ...local]));
        }
        setClaimedAchievements(stored);
      };
      
      loadClaimed();
      window.addEventListener("achievementClaimed", loadClaimed);
      return () => window.removeEventListener("achievementClaimed", loadClaimed);
    }
  }, [studentData?.claimedAchievements]);

  const dispatch = useDispatch();

  React.useEffect(() => {
    if (activeNoticeIndex !== undefined && activeNoticeIndex !== null) {
      setActiveKey(activeNoticeIndex);
    }
  }, [activeNoticeIndex]);

  const handleEarnAchievement = (e, achievementId) => {
    e.stopPropagation();
    const newClaimed = [...claimedAchievements, achievementId];
    setClaimedAchievements(newClaimed);
    const userId = studentData?._id || "";
    localStorage.setItem(`claimedAchievements_${userId}`, JSON.stringify(newClaimed));
    
    if (studentData) {
      dispatch(updateStudent({
        aboutDetails: {
          _id: studentData._id,
          email: studentData.email,
          claimedAchievements: newClaimed
        },
        dispatch
      }));
    }
    window.dispatchEvent(new Event("achievementClaimed"));
    window.dispatchEvent(new Event("achievementClaimed"));
  };

  const settings = {
    infinite: false,
    speed: type == "courses" ? 800 : 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    initialSlide: 0,
  };

  const [activeKey, setActiveKey] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");

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
      const achievementNotices = [];
      
      // Welcome Aboard
      const isWelcomeClaimed = claimedAchievements.includes("welcome_aboard");
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
      // If we don't have createdAt, assume new user for safety. Otherwise check if within 7 days.
      const isNewUser = studentData?.createdAt ? (Date.now() - new Date(studentData.createdAt).getTime() <= sevenDaysInMs) : true;
      
      if (isNewUser || isWelcomeClaimed) {
        achievementNotices.push({
          title: "🚀 Welcome Aboard!",
          startDate: studentData?.createdAt ? new Date(studentData.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
          status: "active",
          source: "system",
          message: "You've successfully joined the platform. Claim your first badge now!",
          isAchievement: true,
          achievementId: "welcome_aboard",
          isClaimed: isWelcomeClaimed
        });
      }
      
      // Profile Complete
      const completionPercent = calculateProfileCompletion(studentData || {}).percentage;
      if (completionPercent === 100) {
        achievementNotices.push({
          title: "👤 Profile Complete",
          startDate: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
          status: "active",
          source: "system",
          message: "You've successfully filled out your basic details. Claim your profile badge!",
          isAchievement: true,
          achievementId: "profile_complete",
          isClaimed: claimedAchievements.includes("profile_complete")
        });
      }
      
      
      // Perfect Scorer
      if (typeof window !== "undefined" && localStorage.getItem("showLevelUpPopup") === "true") {
        achievementNotices.push({
          title: "🎯 Perfect Scorer!",
          startDate: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
          status: "active",
          source: "system",
          message: "You scored 100% on a practice test! Claim your Perfect Scorer badge.",
          isAchievement: true,
          achievementId: "perfect_scorer",
          isClaimed: claimedAchievements.includes("perfect_scorer")
        });
      }

      if (progressById && combinedLearningData) {
        Object.keys(progressById).forEach((id) => {
          if (progressById[id]?.totalProgress === 100) {
            const course = combinedLearningData.find((c) => c._id === id);
            if (course) {
              const updatedAt = progressById[id]?.updatedAt || Date.now();
              const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
              // Expire course completion notices after 7 days
              if (Date.now() - new Date(updatedAt).getTime() <= sevenDaysMs) {
                const achievementId = `complete_${id}`;
                const categoryText = course.category ? course.category : (course.type || "Course");
                const shortCategoryText = categoryText.charAt(0).toUpperCase() + categoryText.slice(1);
                
                achievementNotices.push({
                  title: isModal ? `🎉 You completed ${course.title}!` : `🎉 ${shortCategoryText} Completed`,
                  startDate: new Date(updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
                  status: "active",
                  source: "system",
                  message: `Congratulations! You have completed the ${course.type || "course"} "<b>${course.title}</b>". Claim your gold badge and 50 coins!`,
                  isAchievement: true,
                  achievementId: achievementId,
                  isClaimed: claimedAchievements.includes(achievementId)
                });
              }
            }
          }
        });
      }

      if (typeof window !== "undefined") {
        const userId = studentData?._id || "";
        const pendingPracticeNoticesRaw = JSON.parse(localStorage.getItem(`pendingPracticeNotices_${userId}`) || "[]");
        
        // Filter out notices older than 7 days (7 * 24 * 60 * 60 * 1000 ms) and corrupted generic ones
        const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
        const seenTitles = new Set();
        const validNotices = [];
        // Traverse backwards to keep the most recent if there are duplicates
        for (let i = pendingPracticeNoticesRaw.length - 1; i >= 0; i--) {
          const notice = pendingPracticeNoticesRaw[i];
          if (notice.title === '🏆 New Badge Earned!') continue;
          
          let timestamp = parseInt(notice.id.split('_').pop());
          if (notice.id.startsWith('notice_')) {
             timestamp = parseInt(notice.id.split('_')[1]);
          }
          
          if (!isNaN(timestamp) && (Date.now() - timestamp) <= sevenDaysMs) {
            if (!seenTitles.has(notice.title)) {
              seenTitles.add(notice.title);
              notice.timestamp = timestamp;
              validNotices.unshift(notice);
            }
          }
          const noticeKey = `pendingPracticeNotices_${userId}`;
          const currentNotices = JSON.parse(localStorage.getItem(noticeKey) || "[]");
          const updatedNotices = currentNotices.filter(n => n.id !== notice.id);
          localStorage.setItem(noticeKey, JSON.stringify(updatedNotices));
        }
        const pendingPracticeNotices = validNotices;
        
        if (pendingPracticeNotices.length !== pendingPracticeNoticesRaw.length) {
          localStorage.setItem(`pendingPracticeNotices_${userId}`, JSON.stringify(pendingPracticeNotices));
        }
        

        
        pendingPracticeNotices.forEach(notice => {
          if (!claimedAchievements.includes(notice.id)) {
            if (notice.type === 'badge') {
              let displayTitle = notice.title;
              if (displayTitle === '🏆 New Badge Earned!' || displayTitle === '🏆 You earned a Flawless badge!') {
                const parts = notice.id.split('|');
                if (parts.length >= 5) {
                  const subject = parts[2];
                  const topic = parts[3];
                  const type = parts[4];
                  displayTitle = `🏆 ${type} Badge: ${subject} - ${topic}`;
                }
              }

              achievementNotices.push({
                title: displayTitle,
                startDate: notice.timestamp ? new Date(notice.timestamp).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
                status: "active",
                source: "system",
                message: notice.message,
                actionUrl: notice.actionUrl,
                actionText: notice.actionText,
                isAchievement: true,
                achievementId: notice.id,
                isClaimed: false
              });
            } else if (notice.type === 'new_questions') {
              achievementNotices.push({
                title: notice.title,
                startDate: notice.timestamp ? new Date(notice.timestamp).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
                status: "active",
                source: "system",
                message: notice.message,
                actionUrl: "/student/practice-new/technical",
                actionText: "Practice Now"
              });
            }
          }
        });
      }
      

      const newReleasesNotices = [];
      const sevenDaysInMsForNotices = 7 * 24 * 60 * 60 * 1000;
      
      if (allCourses && Array.isArray(allCourses)) {
        allCourses.forEach(course => {
           if (course.createdAt && (Date.now() - new Date(course.createdAt).getTime() <= sevenDaysInMsForNotices)) {
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
           if (intern.createdAt && (Date.now() - new Date(intern.createdAt).getTime() <= sevenDaysInMsForNotices)) {
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

      const testNotices = [];
      
      if (Array.isArray(allTests)) {
        allTests.forEach(test => {
          const expiryDate = test?.time?.expiryDates?.accessClosingDate || test?.time?.expiryDates?.testExpirationData;
          const isExpired = (test?.time?.expiryDates?.expiry && expiryDate) ? (new Date(expiryDate).getTime() - Date.now() <= 0) : false;

          if (!isExpired && test?.createdAt && (Date.now() - new Date(test.createdAt).getTime() <= sevenDaysInMsForNotices)) {
            const marks = test?.totalMarks || test?.testDuration?.totalMarks || test?.scoreSettings?.totalScore || 100;
            const duration = test?.time?.testDuration?.testDuration?.duration || test?.duration || 60;
            testNotices.push({
              title: `📝 New Test Available: ${test.title || 'Assessment'}`,
              startDate: new Date(test.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
              status: "active",
              source: "system",
              message: `
                <div style="margin-bottom: 8px;">
                  <b>Total Marks:</b> ${marks}<br/>
                  <b>Duration:</b> ${duration} mins<br/>
                  <b>About:</b> A new test has been assigned to you. Complete it before the deadline to earn points!
                </div>
              `,
              actionUrl: "/student/tests",
              actionText: "Go to Tests"
            });
          }
        });
      }

      const jobAssessmentNotices = [];
      if (Array.isArray(allJobAssessments)) {
        allJobAssessments.forEach(assessment => {
          const expiryDate = assessment?.time?.expiryDates?.accessClosingDate || assessment?.time?.expiryDates?.testExpirationData;
          const isExpired = (assessment?.time?.expiryDates?.expiry && expiryDate) ? (new Date(expiryDate).getTime() - Date.now() <= 0) : false;

          if (!isExpired && assessment?.createdAt && (Date.now() - new Date(assessment.createdAt).getTime() <= sevenDaysInMsForNotices)) {
            const marks = assessment?.totalMarks || 100;
            const duration = assessment?.duration || 60;
            jobAssessmentNotices.push({
              title: `💼 New Job Assessment: ${assessment.title || 'Role'}`,
              startDate: new Date(assessment.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
              status: "active",
              source: "system",
              message: `
                <div style="margin-bottom: 8px;">
                  <b>Total Marks:</b> ${marks}<br/>
                  <b>Duration:</b> ${duration} mins<br/>
                  <b>About:</b> You have a new Job Assessment available. Good luck!
                </div>
              `,
              actionUrl: "/student/jobAssessments",
              actionText: "Start Assessment"
            });
          }
        });
      }

      data = [...testNotices, ...jobAssessmentNotices, ...newReleasesNotices, ...streakBrokenNotices, ...achievementNotices, ...(AllNotifications || [])];
      
      // Sort so claimed achievements are at the bottom
      data.sort((a, b) => {
        if (a.isClaimed && !b.isClaimed) return 1;
        if (!a.isClaimed && b.isClaimed) return -1;
        return 0;
      });
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
    const getCategory = (e) => {
      const title = e?.title || "";
      if (e?.isAchievement || e?.type === 'badge' || title.includes('Badge') || title.includes('🏆') || title.includes('🎉') || title.includes('🏅')) return "Achievements";
      if (title.includes('Test') || title.includes('Assessment') || title.includes('Questions') || title.includes('Module') || e?.actionUrl === '/student/tests' || e?.type === 'new_questions') return "Learning";
      if (title.includes('Internship') || title.includes('Job') || e?.actionUrl === '/student/jobAssessments') return "Company";
      return "TPO Updates"; 
    };

    const filters = ["All", "Achievements", "Learning", "TPO Updates", "Company"];
    const activeData = data?.filter((d) => d?.status === "active") || [];
    const filteredData = activeFilter === "All" ? activeData : activeData.filter(d => getCategory(d) === activeFilter);

    return (
      <div className="flex flex-col gap-3 pb-6 px-1 w-full">
        {isModal && (
          <div 
            className="sticky top-0 bg-white z-10 flex flex-nowrap overflow-x-auto gap-2 py-2 mb-1 w-full touch-pan-x border-b border-[#f1f5f9]" 
            style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <style jsx>{`div::-webkit-scrollbar { display: none; }`}</style>
            {filters.map(f => (
              <button
                key={f}
                onClick={() => {
                  setActiveFilter(f);
                  setActiveKey(null);
                }}
                className={`px-3 py-1.5 rounded-md text-[13px] font-bold whitespace-nowrap shrink-0 transition-colors ${activeFilter === f ? 'bg-[#3b82f6] text-white shadow-sm' : 'bg-[#e2e8f0] text-[#475569] hover:bg-[#cbd5e1]'}`}
              >
                {f === "Achievements" ? "🏆 " : f === "Learning" ? "📚 " : f === "TPO Updates" ? "📢 " : f === "Company" ? "🏢 " : ""}{f}
              </button>
            ))}
          </div>
        )}
        {filteredData.length > 0 ? filteredData.map((e, i) => {
            const category = getCategory(e);
            let borderClass = 'border-l-[#24A058]'; // Default Learning Green
            if (category === 'Achievements') borderClass = 'border-l-[#eab308]'; // Yellow/Gold
            else if (category === 'Company') borderClass = 'border-l-[#3b82f6]'; // Blue
            else if (category === 'TPO Updates') borderClass = 'border-l-[#ef4444]'; // Red

            return (
              <ConfigProvider
                key={i}
                theme={{
                  components: {
                    Collapse: {
                      headerBg: '#EFF5FB',
                      contentBg: '#ffffff',
                    },
                  },
                }}
              >
                <Collapse
                  className={`border border-[#e2e8f0] border-l-[4px] ${borderClass} rounded-xl overflow-hidden w-full`}
                size="medium"
                activeKey={activeKey}
                onChange={handleChange}
                accordion={true}
                items={[
                  {
                    key: i,
                    label: (
                      <div className="flex flex-col flex-1 min-w-0 w-full gap-1">
                        {/* Top Row: Title and Status */}
                        <div className="flex flex-row items-start justify-between gap-2 w-full">
                          <p className={`text-[15px] font-bold m-0 leading-snug break-words ${isModal ? 'whitespace-normal' : 'truncate'}`}>
                            {(() => {
                              if (isModal || !e?.title) return e?.title;
                              if (e.isAchievement && (e.title.includes('🏆') || e.title.includes('🏅')) && e.title.includes(' - ')) {
                                const parts = e.title.split(' - ');
                                const subtopic = parts[parts.length - 1];
                                const emoji = e.title.includes('🏆') ? '🏆' : '🏅';
                                return `${emoji} ${subtopic} Badge Earned`;
                              }
                              return e?.title;
                            })()}
                          </p>
                          {(!isModal && e?.source === "system") ? null : (
                            <p
                              className="m-0 shrink-0 text-[14px] capitalize pt-[2px]"
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
                        
                        {/* Bottom Row: Date and Checkout */}
                        <div className="flex flex-row items-center justify-between gap-2 text-[12px] w-full mt-1">
                          <p className="m-0 text-gray-500 whitespace-nowrap">
                            {(e?.startDate || e?.createdAt) && !isNaN(new Date(e.startDate || e.createdAt).getTime()) 
                              ? new Date(e.startDate || e.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) 
                              : (e?.startDate || e?.createdAt || "")}
                          </p>
                          {!isModal && (
                            <span 
                              onClick={(ev) => {
                                ev.stopPropagation();
                                window.dispatchEvent(new CustomEvent("openNoticeBoard", { detail: { index: i } }));
                              }}
                              className="text-[#1890ff] cursor-pointer hover:underline flex items-center gap-1 font-medium whitespace-nowrap text-[12px]"
                            >
                              Checkout ➔
                            </span>
                          )}
                        </div>
                      </div>
                    ),
                    children: (
                      <div
                        className={`p-2 text-[15px] font-medium leading-relaxed break-words whitespace-pre-wrap ${activeKey == i ? "active" : ""
                          }`}
                      >
                        {/* Message with clickable URLs */}
                        <div
                          dangerouslySetInnerHTML={{
                            __html: linkifyText(e?.message || ""),
                          }}
                          className="mb-4 break-words"
                        />
                        {(e.actionUrl || e.isAchievement) && (
                          <div style={{ marginBottom: "16px" }}>
                            {e.actionUrl ? (
                              <Button 
                                type="primary"
                                onClick={(ev) => {
                                  ev.stopPropagation();
                                  if (e.actionUrl.startsWith("#")) {
                                    window.location.hash = e.actionUrl;
                                    // Trigger hashchange manually just in case
                                    window.dispatchEvent(new Event("hashchange"));
                                  } else {
                                    router.push(e.actionUrl);
                                  }
                                  if (isModal) {
                                    window.dispatchEvent(new Event("closeNoticeBoard"));
                                  }
                                }}
                                className="!bg-[#1E69DA] !border-none !text-white font-bold h-8 px-4 rounded-md mt-1 w-fit"
                              >
                                {e.actionText || "Explore"}
                              </Button>
                            ) : e.isAchievement ? (
                              <Button 
                                type="primary"
                                disabled={e.isClaimed}
                                onClick={(ev) => {
                                  if (!e.isClaimed) handleEarnAchievement(ev, e.achievementId);
                                }}
                                className={`!border-none !text-white font-bold h-8 px-4 rounded-md mt-1 w-fit ${e.isClaimed ? '!bg-gray-400' : '!bg-[#F59E0B] hover:!bg-[#D97706]'}`}
                              >
                                {e.isClaimed ? "Earned" : "Earn Badge"}
                              </Button>
                            ) : null}
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
          }) : (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] text-[#64748b] font-medium text-[15px]">
              No updates found in this category.
            </div>
          )}
      </div>
    );
  }
}
