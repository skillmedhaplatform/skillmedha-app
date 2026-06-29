"use client";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import styles from "./mobileDashboard.module.scss";
import { Progress, Button, Modal } from "antd";
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

export default function MobileDashboard({
  studentCreds,
  greeting,
  dashboardStats,
  combinedLearningData,
  profileValues,
  allCourses,
  allInternships,
  router
}) {
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const [isPerformanceOpen, setIsPerformanceOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);

  // Dynamically select notices count from Redux state
  const allNotices = useSelector((state) => state.jonOpenings?.allNotices?.value || []);
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
          <span className={styles.date}>
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

      {/* 2. Enrolled Stats Tiles */}
      <div className={styles.statsGrid}>
        {/* Enrolled Courses Tile */}
        <div 
          className={`${styles.statCard} ${styles.coursesCard}`}
          onClick={() => router.push("/student/course")}
        >
          <div className={styles.iconWrapper}>
            <FiBookOpen />
          </div>
          <span className={styles.tileLabel}>Enrolled Courses</span>
          <span className={styles.tileValue}>{allCourses?.summary?.totalAvailableCourses || 0}</span>
        </div>

        {/* Enrolled Internships Tile */}
        <div 
          className={`${styles.statCard} ${styles.internshipsCard}`}
          onClick={() => router.push("/student/internshipLibrary")}
        >
          <div className={styles.iconWrapper}>
            <FiBriefcase />
          </div>
          <span className={styles.tileLabel}>Enrolled Internships</span>
          <span className={styles.tileValue}>{allInternships?.summary?.totalAvailableInternships || 0}</span>
        </div>

        {/* Practice Questions Tile */}
        <div 
          className={`${styles.statCard} ${styles.practiceCard}`}
          onClick={() => router.push("/student/practice-new/nontechnical")}
        >
          <div className={styles.iconWrapper}>
            <FiClipboard />
          </div>
          <span className={styles.tileLabel}>Practice Questions</span>
          <span className={styles.tileValue}>100+</span>
        </div>
      </div>

      {/* 3. Small Summary Tiles */}
      <div className={styles.summaryGrid}>
        {/* Performance Card */}
        <div 
          className={`${styles.summaryCard} ${styles.perfCard}`}
          onClick={() => setIsPerformanceOpen(true)}
        >
          <div className={styles.iconWrapper}>
            <FiTrendingUp />
          </div>
          <span className={styles.tileLabel}>Overall Performance</span>
          <span className={styles.tileValue}>{profileValues?.percentage || 0}%</span>
        </div>

        {/* Notices Card */}
        <div 
          className={`${styles.summaryCard} ${styles.noticeCard}`}
          onClick={() => setIsNoticeOpen(true)}
        >
          <div className={styles.iconWrapper}>
            <GoMegaphone />
          </div>
          <span className={styles.tileLabel}>Notices</span>
          <span className={styles.tileValue}>{activeNoticesCount}</span>
        </div>

        {/* Achievements Card */}
        <div 
          className={`${styles.summaryCard} ${styles.achCard}`}
          onClick={() => setIsAchievementsOpen(true)}
        >
          <div className={styles.iconWrapper}>
            <FiAward />
          </div>
          <span className={styles.tileLabel}>Achievements</span>
          <span className={styles.tileValue}>4</span>
        </div>
      </div>

      {/* 4. Continue Learning Section */}
      <div className={styles.sectionHeader}>
        <h3>Continue Learning</h3>
        <p>Pick up where you left off</p>
      </div>
      
      {combinedLearningData && combinedLearningData.length > 0 ? (
        <div className={styles.learningList}>
          {combinedLearningData.slice(0, 3).map((item) => {
            const hasLastAccessed = item.lastAccessedSection !== undefined && item.lastAccessedSection !== null;
            let lastAccessedInfo = "Not started";
            if (hasLastAccessed) {
              lastAccessedInfo = "In progress";
            }
            const isInternship = item.type === "internship" || item.isInternship;
            const coverImage = item.coverImage || item.media?.coverImage || "https://skillmedha-profiles.s3.ap-south-1.amazonaws.com/1757941527624-profile.jpg";

            return (
              <div 
                key={item._id}
                className={styles.learningCard}
                onClick={() => handleNavigate(item)}
              >
                <div className={styles.learningContent}>
                  <div className={styles.courseIconWrapper}>
                    <img src={coverImage} alt="cover" />
                  </div>
                  <div className={styles.learningInfo}>
                    <h4>{item.title}</h4>
                    <div className={styles.learningMeta}>
                      <span className={`${styles.learningTypeTag} ${isInternship ? styles.tagInternship : styles.tagCourse}`}>
                        {isInternship ? 'Internship' : 'Course'}
                      </span>
                      <span className={styles.dot}>•</span>
                      <span className={styles.statusText}>
                        {lastAccessedInfo}
                      </span>
                      <span className={styles.dot}>•</span>
                      <span className={styles.addedText}>
                        Added {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'recently'}
                      </span>
                    </div>
                    <div className={styles.progressContainer}>
                      <Progress 
                        percent={item.progress || 0} 
                        showInfo={false}
                        strokeColor={hasLastAccessed ? "#4f46e5" : "#24A058"}
                        railColor="#f1f5f9"
                        size={["100%", 4]}
                        className={styles.progressBar}
                      />
                      <span className={styles.progressText}>
                        {item.progress || 0}%
                      </span>
                    </div>
                  </div>
                  <FiChevronRight className={styles.chevron} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.emptyStateCard}>
          <p>No active courses or internships found. Go to Library to start learning!</p>
          <Button type="primary" onClick={() => router.push("/student/course")}>Browse Courses</Button>
        </div>
      )}

      {/* 5. Recommended Courses Section (Horizontal Scroll) */}
      {recommendedCourses.length > 0 && (
        <div className={styles.recommendationsSection}>
          <div className={styles.sectionHeader}>
            <h3>Recommended Courses</h3>
            <p>Based on your interests</p>
          </div>
          <div className={styles.recommendationsScroll}>
            {recommendedCourses.map((item) => {
              const handleRecClick = () => {
                const url = `/student/learning-course?title=${item.title?.split(" ")?.join("")}&id=${item._id}&orgId=${item.sourceOrgId}`;
                router.push(url);
              };

              const coverImage = item.media?.coverImage || item.coverImage || "/fallback.jpg";

              return (
                <div 
                  key={item._id} 
                  className={styles.recScrollCard}
                  onClick={handleRecClick}
                >
                  <div className={styles.recImageContainer}>
                    <img src={coverImage} alt={item.title} />
                    {item.difficulty && (
                      <span className={styles.difficultyTag}>{item.difficulty}</span>
                    )}
                  </div>
                  <div className={styles.recCardBody}>
                    <div className={styles.recCardMetaRow}>
                      <span className={`${styles.recTypeTag} ${styles.tagCourse}`}>
                        Course
                      </span>
                      {item.difficulty && (
                        <span className={styles.recDifficulty}>{item.difficulty}</span>
                      )}
                    </div>
                    <h4>{item.title}</h4>
                    <div className={styles.recRatingRow}>
                      <span className={styles.ratingValue}>{item.rating || "4.6"}</span>
                      <span className={styles.star}>★</span>
                      <span className={styles.ratingCount}>({item.ratingCount || "1200+"})</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. Recommended Internships Section (Horizontal Scroll) */}
      {recommendedInternships.length > 0 && (
        <div className={styles.recommendationsSection}>
          <div className={styles.sectionHeader}>
            <h3>Recommended Internships</h3>
            <p>Based on your interests</p>
          </div>
          <div className={styles.recommendationsScroll}>
            {recommendedInternships.map((item) => {
              const handleRecClick = () => {
                const url = `/student/learning-internship?title=${item.title?.split(" ")?.join("")}&id=${item._id}&orgId=${item.sourceOrgId}`;
                router.push(url);
              };

              const coverImage = item.media?.coverImage || item.coverImage || "/fallback.jpg";

              return (
                <div 
                  key={item._id} 
                  className={styles.recScrollCard}
                  onClick={handleRecClick}
                >
                  <div className={styles.recImageContainer}>
                    <img src={coverImage} alt={item.title} />
                    {item.difficulty && (
                      <span className={styles.difficultyTag}>{item.difficulty}</span>
                    )}
                  </div>
                  <div className={styles.recCardBody}>
                    <div className={styles.recCardMetaRow}>
                      <span className={`${styles.recTypeTag} ${styles.tagInternship}`}>
                        Internship
                      </span>
                      {item.difficulty && (
                        <span className={styles.recDifficulty}>{item.difficulty}</span>
                      )}
                    </div>
                    <h4>{item.title}</h4>
                    <div className={styles.recRatingRow}>
                      <span className={styles.ratingValue}>{item.rating || "4.8"}</span>
                      <span className={styles.star}>★</span>
                      <span className={styles.ratingCount}>({item.ratingCount || "250+"})</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
        <MobileAchievements />
      </Modal>
    </div>
  );
}
