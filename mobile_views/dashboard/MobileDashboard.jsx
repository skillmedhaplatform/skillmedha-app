"use client";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import styles from "./mobileDashboard.module.scss";
import { Progress, Button, Modal, Pagination, Spin } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { LaptopOutlined, ReadOutlined } from "@ant-design/icons";
import { 
  FiTrendingUp, 
  FiAward, 
  FiBookOpen, 
  FiChevronRight,
  FiBriefcase,
  FiClipboard
} from "react-icons/fi";
import { GoMegaphone } from "react-icons/go";
import CardsList from "@/modules/student/components/cardsList";
import ProfileSection from "./MobileProfileSection";
import MobileAchievements from "./MobileAchievements";
const RecommendedCard = ({ item, total, currentIndex, onDotClick, onNextClick, onPrevClick, onCardClick }) => {
  function stripHtml(html) {
    if (typeof html !== 'string') return '';
    let text = html
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#34;/g, '"');
    return text.replace(/<[^>]*>/g, '');
  }
  function formatUpdatedDate(dateInput) {
    if (!dateInput) return "";
    const d = new Date(dateInput);
    return isNaN(d.getTime())
      ? ""
      : d.toLocaleString("en-IN", { month: "short", year: "numeric" });
  }

  return (
    <div
      className="w-full h-[460px] bg-white text-black border border-[rgba(81,81,81,0.3)] rounded-[14px] overflow-hidden cursor-pointer transition-all duration-200 hover:border-gray-400 group shrink-0"
      role="button"
      tabIndex={0}
      onClick={() => onCardClick?.(item)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onCardClick?.(item);
      }}
    >
      <div
        key={item?._id}
        className="flex flex-col w-full h-full p-2 animate-[smoothFadeIn_0.5s_ease-out_forwards]"
      >
        <div className="relative w-full h-[220px] shrink-0 bg-white overflow-hidden rounded-xl">
          {(item?.coverImage || item?.media?.coverImage) ? (
            <img
              src={item?.coverImage || item?.media?.coverImage}
              alt={item?.title || "Course cover"}
              className="w-full h-full object-cover block transition-transform duration-200 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-[#EFF5FB] block transition-transform duration-200 group-hover:scale-105" />
          )}
          {item?.difficulty ? (
            <span className="absolute left-2 top-2 z-10 text-[12px] leading-none px-2 py-1.5 rounded-full text-[#0f1115] bg-gradient-to-r from-[#ffd66b] to-[#ffb347] font-semibold">{item?.difficulty}</span>
          ) : null}
        </div>

        <div className="flex flex-col gap-2 px-3 pt-3 pb-2 flex-1">
          <div className="flex items-center justify-between min-h-[52px]">
            <div className="text-[#1E69DA] text-[18px] font-bold leading-tight line-clamp-2">{item?.title}</div>
          </div>

          <div className="flex flex-wrap gap-1.5 h-[26px] overflow-hidden shrink-0">
            {item?.sections?.length ? (
              <span className="text-[12px] text-black bg-white border border-[rgba(159,176,195,0.22)] px-2 py-1 rounded-full">
                {item?.sections?.length} Modules
              </span>
            ) : null}

            {item?.preRequisites?.slice(0, 2)?.map((p, i) => (
              <span key={`${p}-${i}`} className="text-[12px] text-black bg-white border border-[rgba(159,176,195,0.22)] px-2 py-1 rounded-full">
                {p}
              </span>
            ))}
          </div>

          <p
            className="text-[#b9c7d6] text-[14px] leading-[1.5] my-0.5 line-clamp-2"
            title={stripHtml?.(item?.description) || ""}
          >
            {(() => {
              const t = stripHtml?.(item?.description) || "";
              return t.slice(0, 140) + (t.length > 140 ? "…" : "");
            })()}
          </p>

          <div className="mt-auto flex flex-col justify-end pt-2">
            <div className="flex items-center justify-between gap-2 h-[20px]">
              {item?.lastAssignmentUpdate || item?.updatedAt ? (
                <div className="text-[#8ea2b5] text-[12px]" aria-label="Last updated">
                  Updated{" "}
                  {formatUpdatedDate?.(
                    item?.lastAssignmentUpdate || item?.updatedAt
                  )}
                </div>
              ) : null}
            </div>

            {total > 0 && (
            <div className="flex justify-center items-center gap-3 mt-2" onClick={(e) => e.stopPropagation()}>
              {total > 1 && (
                <button
                  className="text-[#9ca3af] hover:text-[#1E69DA] transition-colors p-1"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onPrevClick?.();
                  }}
                  aria-label="Previous"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
              )}
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(3, total) }).map((_, idx) => {
                  const displayTotal = Math.min(3, total);
                  const isActive = idx === (currentIndex % displayTotal);
                  return (
                    <button
                      key={idx}
                      className={`rounded-full transition-all duration-300 ${isActive
                        ? 'w-[14px] h-[14px] bg-gradient-to-br from-[#1E69DA] to-[#5694F0] border-none'
                        : 'w-[10px] h-[10px] bg-transparent border-[2px] border-[#9ca3af]'
                        }`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDotClick?.(idx);
                      }}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  );
                })}
              </div>
              {total > 1 && (
                <button
                  className="text-[#9ca3af] hover:text-[#1E69DA] transition-colors p-1"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onNextClick?.();
                  }}
                  aria-label="Next"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              )}
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function MobileDashboard({
  studentCreds,
  greeting,
  dashboardStats,
  combinedLearningData,
  profileValues,
  allCourses,
  allInternships,
  router,
  progressById,
  loading
}) {
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const [isPerformanceOpen, setIsPerformanceOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 3;

  useEffect(() => {
    const handleOpenAchievements = () => setIsAchievementsOpen(true);
    const handleOpenNotices = () => setIsNoticeOpen(true);

    const handleHash = () => {
      if (window.location.hash.startsWith('#openBadges')) {
        setIsAchievementsOpen(true);
      } else if (window.location.hash === '#openNotices') {
        setIsNoticeOpen(true);
      }
    };

    window.addEventListener('open-achievements', handleOpenAchievements);
    window.addEventListener('open-notices', handleOpenNotices);
    window.addEventListener('hashchange', handleHash);
    
    // Check hash on mount
    if (window.location.hash) {
      setTimeout(handleHash, 500); // slight delay to ensure render is ready
    }

    return () => {
      window.removeEventListener('open-achievements', handleOpenAchievements);
      window.removeEventListener('open-notices', handleOpenNotices);
      window.removeEventListener('hashchange', handleHash);
    };
  }, []);

  const [recCourseIndex, setRecCourseIndex] = useState(0);
  const [recInternIndex, setRecInternIndex] = useState(0);

  const allCoursesOnly = useSelector((state) => state.internship?.allCoursesOnly);
  const allInternshipsOnly = useSelector((state) => state.internship?.allInternshipsOnly);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const paginatedLearningData = combinedLearningData?.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  ) || [];

  // Dynamically select notices count from Redux state
  const allNotices = useSelector((state) => state.jonOpenings?.allNotices?.value || state.jobOpenings?.allNotices?.value || []);
  const activeNoticesCount = allNotices?.filter(d => d?.status !== "pending").length || 0;

  const handleNavigate = (item) => {
    if (!item) return;
    const hasLastAccessed = item.lastAccessedSection !== undefined && item.lastAccessedSection !== null;
    const basePath = item.type === "internship" ? "/student/learning-internship" : "/student/learning-course";
    let url = `${basePath}?title=${item.title?.split(" ")?.join("")}&id=${item._id}&orgId=${item.sourceOrgId}`;
    if (hasLastAccessed) {
      url += `&section=${item.lastAccessedSection}`;
      if (item.lastAccessedTopic !== undefined && item.lastAccessedTopic !== null) url += `&topic=${item.lastAccessedTopic}`;
    }
    router.push(url);
  };

  // Filter recommendations separately
  const recommendedCourses = (allCourses?.data || []).map(c => ({ ...c, type: 'course' }));
  const recommendedInternships = (allInternships?.data || []).map(i => ({ ...i, type: 'internship' }));

  return (
    <div className={styles.container}>
      
      {/* 1. Welcome Card */}
      <div className={styles.welcomeCard}>
        <div className={styles.welcomeHeader}>
          <h2 suppressHydrationWarning>
            Hi {studentCreds?.userName
              ? studentCreds.userName.charAt(0).toUpperCase() + studentCreds.userName.slice(1)
              : "Student"},
          </h2>
          <span className={styles.date} suppressHydrationWarning>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric"
            }).toUpperCase()}
          </span>
        </div>
        <p>{greeting}</p>
      </div>

      <div className={styles.contentWrapper}>
        {/* 2. Enrolled Stats Tiles */}
        <div className="flex flex-row w-full gap-2 md:gap-4 py-1">
          {dashboardStats?.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-[12px] p-2 md:p-4 flex-1 min-w-0 flex flex-col md:flex-row items-center justify-center md:justify-start gap-2 md:gap-4 border border-[rgba(81,81,81,0.2)] hover:border-gray-400 cursor-pointer transition-all duration-200 shadow-sm"
              onClick={() => stat.link && router.push(stat.link)}
            >
              <div
                className="w-[36px] h-[36px] md:w-[48px] md:h-[48px] rounded-[8px] md:rounded-[10px] flex items-center justify-center shrink-0"
                style={stat.iconBgStyle || { backgroundColor: '#f8fafc' }}
              >
                {/* Clone the icon to make it slightly smaller on mobile, if it accepts size prop */}
                <div className="scale-75 md:scale-100 flex items-center justify-center">
                  {stat.icon}
                </div>
              </div>
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <span className="text-[10px] md:text-[13px] text-[#8ea2b5] font-extrabold leading-tight md:leading-none mb-1 md:mb-1">{stat.title}</span>
                <span className="text-[16px] md:text-[22px] font-extrabold text-[#1e293b] leading-none">{stat.value}</span>
              </div>
            </div>
          ))}
        </div>

      {/* 4. Continue Learning Section with Pagination */}
      <div className="w-full rounded-2xl bg-white py-4 px-4 lg:px-6 shadow-sm border border-[#e2e8f0]">
        <div className="flex flex-wrap items-center justify-between gap-y-2 mb-4">
          <div className="text-[16px] md:text-[18px] lg:text-[22px] font-extrabold flex items-center flex-wrap">
            <span>Continue Learning</span>
            {combinedLearningData.length > pageSize && (
              <span className="text-[12px] md:text-[14px] text-[#666] ml-2 md:ml-4 font-normal whitespace-nowrap">
                ({combinedLearningData.length} items)
              </span>
            )}
          </div>
          {combinedLearningData.length > pageSize && (
            <Pagination
              current={currentPage}
              total={combinedLearningData.length}
              pageSize={pageSize}
              onChange={handlePageChange}
              showSizeChanger={false}
              showQuickJumper={false}
              size="small"
            />
          )}
        </div>

        {loading ? (
          <div className="text-center p-8">
            <Spin size="large" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentPage}
              className="flex flex-col gap-3 w-full"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {paginatedLearningData.length === 0 ? (
                <div className="flex items-center justify-center h-[100px] text-[#64748b] text-[14px]">
                  No active courses or internships found.
                </div>
              ) : (
                paginatedLearningData.map((item) => {
                const hasLastAccessed = item?.lastAccessedSection !== undefined && item?.lastAccessedSection !== null;
                const handleNavigateDesktop = () => {
                  const basePath = item?.type === "internship" ? "/student/learning-internship" : "/student/learning-course";
                  let url = `${basePath}?title=${item?.title?.split(" ")?.join("")}&id=${item?._id}&orgId=${item?.sourceOrgId}`;
                  if (hasLastAccessed) {
                    url += `&section=${item.lastAccessedSection}`;
                    if (item.lastAccessedTopic !== undefined && item.lastAccessedTopic !== null) url += `&topic=${item.lastAccessedTopic}`;
                  }
                  router.push(url);
                };

                const fetchedProgress = progressById ? progressById[item._id] : null;
                const progressVal = fetchedProgress?.totalProgress ?? 0;
                const isProgressLoading = fetchedProgress?.loading;
                const isCompleted = progressVal >= 100;

                let lastAccessedInfo = "Not started";
                if (isCompleted) {
                  lastAccessedInfo = "Completed";
                } else if (hasLastAccessed || progressVal > 0) {
                  lastAccessedInfo = "In progress";
                }

                let buttonText = "Start";
                if (isCompleted) {
                  buttonText = "Review";
                } else if (hasLastAccessed || progressVal > 0) {
                  buttonText = "Continue";
                }

                const isInternship = item?.type === "internship";

                return (
                  <div key={item._id} className={`flex flex-col md:flex-row md:items-center justify-between p-3 lg:p-4 bg-white border border-[#e2e8f0] rounded-[12px] hover:shadow-md transition-shadow border-l-[4px] ${isInternship ? 'border-l-[#0284c7]' : 'border-l-[#24A058]'}`}>
                    {/* Top/Left: Icon & Info */}
                    <div className="flex items-start md:items-center gap-3 md:gap-4 w-full md:w-auto">
                      <div className={`w-[40px] h-[40px] md:w-[50px] md:h-[50px] rounded-xl flex items-center justify-center shrink-0 overflow-hidden ${isInternship ? 'bg-[#e1f5fe]' : 'bg-[#e8f5e9]'}`}>
                        {isInternship ? (
                          <LaptopOutlined className="text-[20px] md:text-[24px] text-[#0284c7]" />
                        ) : (
                          <ReadOutlined className="text-[20px] md:text-[24px] text-[#24A058]" />
                        )}
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="font-bold text-[#1e293b] text-[14px] md:text-[15px] leading-tight md:leading-normal mb-1 md:mb-0 line-clamp-2 md:line-clamp-1">{item?.title}</span>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className={`text-[10px] md:text-[11px] font-semibold px-2 py-[2px] rounded-md ${isInternship ? 'bg-[#e1f5fe] text-[#0284c7]' : 'bg-[#e8f5e9] text-[#24A058]'}`}>
                            {isInternship ? 'Internship' : 'Course'}
                          </span>
                          <span className="text-[11px] md:text-[12px] text-[#64748b]">
                            {isProgressLoading ? "Loading…" : lastAccessedInfo} · Added {new Date(item?.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom/Right: Progress & Button */}
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center w-full md:w-auto mt-4 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#f1f5f9]">
                      <div className="flex items-center gap-2 w-auto md:w-[180px] justify-start md:justify-end flex-1 md:flex-none mr-2 md:mr-0">
                        <Progress 
                          percent={progressVal} 
                          size="small" 
                          showInfo={false} 
                          strokeColor={isCompleted ? '#10b981' : (hasLastAccessed || progressVal > 0 ? '#4f46e5' : '#24A058')} 
                          railColor="#f1f5f9"
                          className="m-0 w-full md:w-[120px]"
                        />
                        <span className="text-[11px] md:text-[12px] text-[#64748b] font-medium min-w-[30px] text-right">{progressVal}%</span>
                      </div>
                      <Button
                        onClick={handleNavigateDesktop}
                        className={`!border-none !text-white hover:opacity-90 shrink-0 ${isCompleted ? '!bg-emerald-600' : '!bg-gradient-to-br !from-[#1E69DA] !to-[#5694F0]'}`}
                        style={{
                          fontWeight: '600',
                          borderRadius: '8px',
                          padding: '4px 12px',
                          height: '28px',
                          fontSize: '12px'
                        }}
                      >
                        {buttonText}
                      </Button>
                    </div>
                  </div>
                );
              }))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* 5. Grouped Recommended Section (Vertical on Mobile, Horizontal on Tablet) */}
      {(allCoursesOnly?.length > 0 || allInternshipsOnly?.length > 0) && (
        <div className="w-full rounded-2xl bg-white p-4 lg:p-6 shadow-sm border border-[#e2e8f0] flex flex-col items-center">
          <div className="w-full flex flex-col md:flex-row gap-6 md:gap-0 items-stretch">
            {allCoursesOnly?.length > 0 && (
              <div className="flex-1 flex flex-col items-center border-b md:border-b-0 pb-6 md:pb-0 md:pr-6 md:border-r border-[#e2e8f0]">
                <div className="w-full text-left mb-3 pl-4">
                  <span className="text-[16px] lg:text-[18px] font-extrabold text-[#1e293b]">Recommended Course</span>
                </div>
                <div className="w-full h-full flex flex-col justify-between overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={recCourseIndex}
                      initial={{ opacity: 0, scale: 0.96, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96, y: -10 }}
                      transition={{ duration: 0.35, ease: "easeInOut" }}
                      className="w-full h-full"
                    >
                      <RecommendedCard
                        item={allCoursesOnly[recCourseIndex % allCoursesOnly.length]}
                        total={allCoursesOnly.length}
                        currentIndex={recCourseIndex}
                        onDotClick={setRecCourseIndex}
                        onPrevClick={() => setRecCourseIndex(prev => prev === 0 ? allCoursesOnly.length - 1 : prev - 1)}
                        onNextClick={() => setRecCourseIndex(prev => prev + 1)}
                        onCardClick={(item) => {
                          router.push(
                            `/student/learning-course?title=${item.title?.split(" ")?.join("")}&id=${item._id}&orgId=${item.sourceOrgId}`
                          );
                        }}
                      />
                    </motion.div>
                  </AnimatePresence>
                  <div className="w-full h-[4px] bg-[#f1f5f9] mt-4 rounded-full relative overflow-hidden shrink-0">
                    <div
                      key={`course-${recCourseIndex}`}
                      className="absolute top-0 right-0 h-full bg-gradient-to-br from-[#1E69DA] to-[#5694F0]"
                      style={{ animation: 'fillRightToLeft 10s linear forwards' }}
                    />
                  </div>
                </div>
              </div>
            )}
            {allInternshipsOnly?.length > 0 && (
              <div className="flex-1 flex flex-col items-center pt-6 md:pt-0 md:pl-6">
                <div className="w-full text-left mb-3 pl-4">
                  <span className="text-[16px] lg:text-[18px] font-extrabold text-[#1e293b]">Recommended Internship</span>
                </div>
                <div className="w-full h-full flex flex-col justify-between overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={recInternIndex}
                      initial={{ opacity: 0, scale: 0.96, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96, y: -10 }}
                      transition={{ duration: 0.35, ease: "easeInOut" }}
                      className="w-full h-full"
                    >
                      <RecommendedCard
                        item={allInternshipsOnly[recInternIndex % allInternshipsOnly.length]}
                        total={allInternshipsOnly.length}
                        currentIndex={recInternIndex}
                        onDotClick={setRecInternIndex}
                        onPrevClick={() => setRecInternIndex(prev => prev === 0 ? allInternshipsOnly.length - 1 : prev - 1)}
                        onNextClick={() => setRecInternIndex(prev => prev + 1)}
                        onCardClick={(item) => {
                          router.push(
                            `/student/learning-internship?title=${item.title?.split(" ")?.join("")}&id=${item._id}&orgId=${item.sourceOrgId}`
                          );
                        }}
                      />
                    </motion.div>
                  </AnimatePresence>
                  <div className="w-full h-[4px] bg-[#f1f5f9] mt-4 rounded-full relative overflow-hidden shrink-0">
                    <div
                      key={`intern-${recInternIndex}`}
                      className="absolute top-0 right-0 h-full bg-gradient-to-br from-[#1E69DA] to-[#5694F0]"
                      style={{ animation: 'fillRightToLeft 10s linear forwards' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      </div>

      {/* Modals for summary card popup overlays */}
      <Modal
        title="Notice Board"
        open={isNoticeOpen}
        onCancel={() => setIsNoticeOpen(false)}
        footer={null}
        width="100%"
        className={styles.responsiveModal}
      >
        <div style={{ maxHeight: "70vh", overflowY: "auto", padding: "8px 0" }}>
          {activeNoticesCount > 0 ? (
            <CardsList type="notifications" isModal={true} />
          ) : (
            <div style={{ textAlign: "center", padding: "24px 0", color: "#64748b" }}>
              <GoMegaphone style={{ fontSize: "36px", marginBottom: "8px", color: "#cbd5e1" }} />
              <p style={{ margin: 0, fontSize: "14px", fontWeight: 500 }}>No notices available at this time.</p>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        title="Profile Completion"
        open={isPerformanceOpen}
        onCancel={() => setIsPerformanceOpen(false)}
        footer={null}
        width="100%"
        className={styles.responsiveModal}
      >
        <ProfileSection 
          profileValues={profileValues} 
          router={router} 
          studentCreds={studentCreds} 
          onClose={() => setIsPerformanceOpen(false)}
        />
      </Modal>

      <Modal
        title="Achievements"
        open={isAchievementsOpen}
        onCancel={() => setIsAchievementsOpen(false)}
        footer={null}
        width="100%"
        className={styles.responsiveModal}
      >
        <MobileAchievements progressById={progressById} combinedLearningData={combinedLearningData} studentCreds={studentCreds} />
      </Modal>
    </div>
  );
}
