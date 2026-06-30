"use client";
import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import {
  getAllCourses,
  getAllInternships,
  getOneInternsip,
  getAllCoursesOnly,
  getAllInternshipsOnly,
} from "@/redux/slices/internship";
import { GetAllNotifiocations } from "@/redux/slices/jobopenings";
import {
  Button,
  Divider,
  Popover,
  Progress,
  Pagination,
  Spin,
  message,
  Table,
  Modal,
} from "antd";
import { FaArrowRight } from "react-icons/fa";
import { BsX, BsPlus, BsStar } from "react-icons/bs";
import { HiOutlineArrowsExpand, HiOutlineBookOpen, HiOutlineBriefcase, HiOutlineClipboardList } from "react-icons/hi";
import { calculateProfileCompletion } from "@/universalUtils/getprofilecompleteion";
import { useAppRouter } from "@/helpers/useAppRouter";
import Image from "next/image";
import { ReadOutlined, LaptopOutlined } from "@ant-design/icons";
import CardsList from "@/modules/student/components/cardsList";
import MobileDashboard from "@/mobile_views/dashboard/MobileDashboard";
import useResponsive from "@/hooks/useResponsive";

const DashboardStats = ({ stats, router }) => (
  <div className="flex flex-row w-full gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden">
    {stats.map((stat, idx) => (
      <div
        key={idx}
        className="bg-white rounded-[12px] p-4 flex-1 min-w-[200px] flex flex-row items-center gap-4 border border-[rgba(81,81,81,0.2)] hover:border-gray-400 cursor-pointer transition-all duration-200"
        onClick={() => stat.link && router.push(stat.link)}
      >
        <div
          className="w-[48px] h-[48px] rounded-[10px] flex items-center justify-center shrink-0"
          style={stat.iconBgStyle || { backgroundColor: '#f8fafc' }}
        >
          {stat.icon}
        </div>
        <div className="flex flex-col">
          <span className="text-[13px] text-[#8ea2b5] font-extrabold leading-none mb-1">{stat.title}</span>
          <span className="text-[22px] font-extrabold text-[#1e293b] leading-none">{stat.value}</span>
        </div>
      </div>
    ))}
  </div>
);

const RecommendedCard = ({ item, total, currentIndex, onDotClick, onNextClick, onPrevClick, onCardClick }) => {
  function stripHtml(html) {
    return typeof html === "string" ? html.replace(/<[^>]*>/g, "") : "";
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
        if (e.key === "Enter" || e.key === " ") onClick?.(item);
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
              <div className="flex justify-center items-center gap-3 mt-2 h-[24px]" onClick={(e) => e.stopPropagation()}>
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


const ProfileSection = ({ profileValues, router, studentCreds }) => (
  <div className="w-full flex flex-col items-start pb-2">
    <h3 className="m-0 font-extrabold text-[#0f172a] text-[16px] xl:text-[18px] mb-3 shrink-0">Overall Performance</h3>

    <div className="w-full bg-[#FAFAFA] rounded-[16px] py-2 px-3 flex items-center gap-3 border border-[#e2e8f0] shrink-0 mb-3">
      <div className="shrink-0 relative">
        <Progress
          type="circle"
          percent={profileValues?.percentage ?? 0}
          size={46}
          strokeWidth={8}
          strokeColor="#3b82f6"
          trailColor="#e2e8f0"
          format={(percent) => (
            <span className="text-[13px] font-black text-[#0f172a] leading-none">{percent}%</span>
          )}
        />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="font-extrabold text-[#334155] text-[13px] leading-tight">Profile completion rate</span>
        <span className="text-[#64748b] text-[11px] leading-tight">Complete your profile to unlock a better experience</span>
      </div>
    </div>

    <div className="w-full shrink-0">
      <Button
        className="w-full h-[38px] flex items-center justify-between px-2 transition-all hover:opacity-90 !text-white !bg-gradient-to-br !from-[#1E69DA] !to-[#5694F0] !border-none"
        style={{ borderRadius: '8px' }}
        onClick={() => router.push("/student/profile/basic-details")}
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <span className="text-[12px]">⚡</span>
          </div>
          <span className="font-semibold text-[13px]">Complete your profile</span>
        </div>
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14"></path>
            <path d="M12 5l7 7-7 7"></path>
          </svg>
        </div>
      </Button>
    </div>
  </div>
);

const Achievements = () => (
  <div className="w-full flex flex-col">
    <h3 className="m-0 font-extrabold text-[#0f172a] text-[18px] mb-2 sticky top-0 bg-white z-10 pt-1 shrink-0">Achievements</h3>
    <div className="flex flex-col gap-3 overflow-y-auto [&::-webkit-scrollbar]:hidden max-h-[250px] pb-2">
      <div className="flex items-center justify-between p-3 rounded-xl border border-[#e2e8f0] bg-[#FAFAFA]">
        <div className="flex items-center gap-3">
          <div className="text-[24px]">⭐</div>
          <div className="flex flex-col">
            <span className="font-bold text-[#0f172a] text-[14px]">First Enroll</span>
            <span className="text-[#64748b] text-[12px]">+50 XP earned</span>
          </div>
        </div>
        <span className="text-white bg-gradient-to-br from-[#1E69DA] to-[#5694F0] px-2 py-1 rounded-full text-[11px] font-bold">Earned</span>
      </div>
      <div className="flex items-center justify-between p-3 rounded-xl border border-[#e2e8f0] bg-[#FAFAFA]">
        <div className="flex items-center gap-3">
          <div className="text-[24px]">🔥</div>
          <div className="flex flex-col">
            <span className="font-bold text-[#0f172a] text-[14px]">{localStorage.getItem("loginStreak") || 7} Day Streak</span>
            <span className="text-[#64748b] text-[12px]">+100 XP earned</span>
          </div>
        </div>
        <span className="text-white bg-gradient-to-br from-[#1E69DA] to-[#5694F0] px-2 py-1 rounded-full text-[11px] font-bold">Earned</span>
      </div>
      <div className="flex items-center justify-between p-3 rounded-xl border border-[#e2e8f0] bg-[#FAFAFA]">
        <div className="flex items-center gap-3">
          <div className="text-[24px]">🎓</div>
          <div className="flex flex-col">
            <span className="font-bold text-[#0f172a] text-[14px]">Course Complete</span>
            <span className="text-[#64748b] text-[12px]">+200 XP earned</span>
          </div>
        </div>
        <span className="text-white bg-gradient-to-br from-[#1E69DA] to-[#5694F0] px-2 py-1 rounded-full text-[11px] font-bold">Earned</span>
      </div>
      <div className="flex items-center justify-between p-3 rounded-xl border border-[#e2e8f0] bg-[#FAFAFA]">
        <div className="flex items-center gap-3">
          <div className="text-[24px]">🎉</div>
          <div className="flex flex-col">
            <span className="font-bold text-[#0f172a] text-[14px]">Certified Dev</span>
            <span className="text-[#64748b] text-[12px]">+500 XP earned</span>
          </div>
        </div>
        <span className="text-white bg-gradient-to-br from-[#1E69DA] to-[#5694F0] px-2 py-1 rounded-full text-[11px] font-bold">Earned</span>
      </div>
    </div>
  </div>
);

// Resolve current user id: prefer studentCreds._id, fall back to sessionStorage
// (studentCreds may not be hydrated yet on first paint).
const resolveUserId = (studentCreds) => {
  if (studentCreds?._id) return studentCreds._id;
  if (typeof window === "undefined") return null; // SSR guard
  try {
    return sessionStorage.getItem("studentId") || null;
  } catch {
    return null;
  }
};

export default function DashboardPage() {
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const studentCreds = useSelector((state) => state.student.student?.data);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isMobile = useResponsive(); // < 1024px → mobile layout

  // Inject keyframes for the timer bar
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes fillRightToLeft {
        0% { width: 0%; right: 0; }
        100% { width: 100%; right: 0; }
      }
      @keyframes fillLeftToRight {
        0% { width: 0%; left: 0; }
        100% { width: 100%; left: 0; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Inject keyframes for the timer bar
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes fillRightToLeft {
        0% { width: 0%; right: 0; }
        100% { width: 100%; right: 0; }
      }
      @keyframes fillLeftToRight {
        0% { width: 0%; left: 0; }
        100% { width: 100%; left: 0; }
      }
      @keyframes smoothFadeIn {
        from { opacity: 0.3; transform: scale(0.98); }
        to { opacity: 1; transform: scale(1); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const [greeting, setGreeting] = useState("Welcome to SkillMedha!");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning, ready to learn something new?");
    else if (hour < 18) setGreeting("Good Afternoon, let's keep the momentum going!");
    else setGreeting("Good Evening, perfect time for some upskilling!");
  }, []);

  const allInternships = useSelector(
    (state) => state.internship.allInternships
  );
  const allCourses = useSelector((state) => state.internship.allCourses);
  const allCoursesOnly = useSelector((state) => state.internship.allCoursesOnly);
  const allInternshipsOnly = useSelector((state) => state.internship.allInternshipsOnly);
  const router = useAppRouter();
  const dispatch = useDispatch();

  // Removed learningColumns as we will render cards directly

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(4); // Items per page
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [recCourseIndex, setRecCourseIndex] = useState(0);
  const [recInternshipIndex, setRecInternshipIndex] = useState(0);

  // Per-course/internship progress, keyed by item id.
  // Shape per entry: { completedCount, totalCount, totalProgress, loading, error }
  const [progressById, setProgressById] = useState({});
  // Ids already requested (or in flight) — prevents re-firing the same call
  // every render / pagination change.
  const requestedIdsRef = useRef(new Set());

  const userId = resolveUserId(studentCreds);

  useEffect(() => {
    const timer = setInterval(() => {
      setRecCourseIndex(prev => prev + 1);
      setRecInternshipIndex(prev => prev + 1);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Fetch data with error handling
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        dispatch(getAllInternships({ cursor: null, limit: 20 })),
        dispatch(getAllCourses({ limit: 20, cursor: null, type: "course" })),
        dispatch(getAllCoursesOnly({ limit: 20, cursor: null, type: "course" })),
        dispatch(getAllInternshipsOnly({ limit: 20, cursor: null })),
        dispatch(GetAllNotifiocations()),
      ]);
    } catch (error) {
      console.error("Error fetching resources:", error);
      setError("Failed to load data. Please try again.");
      message.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Memoized profile values
  const profileValues = useMemo(() => {
    return calculateProfileCompletion(studentCreds || {});
  }, [studentCreds]);

  // Memoized dashboard statistics
  const dashboardStats = useMemo(() => {
    const totalCoursesVal = allCourses?.summary?.totalAvailableCourses || 0;
    const totalInternshipsVal = allInternships?.summary?.totalAvailableInternships || 0;

    return [
      {
        title: "Enrolled courses",
        value: totalCoursesVal,
        icon: <HiOutlineBookOpen size={24} color="#24A058" />,
        iconBgStyle: { backgroundColor: '#e8f5e9' },
        link: "/student/course"
      },
      {
        title: "Enrolled internships",
        value: totalInternshipsVal,
        icon: <HiOutlineBriefcase size={24} color="#2980b9" />,
        iconBgStyle: { backgroundColor: '#e1f5fe' },
        link: "/student/internshipLibrary"
      },
      {
        title: "Practice questions",
        value: "100+",
        icon: <HiOutlineClipboardList size={24} color="#d35400" />,
        iconBgStyle: { backgroundColor: '#fff3e0' },
        link: "/student/practice-new/nontechnical"
      }
    ];
  }, [allCourses?.summary?.totalAvailableCourses, allInternships?.summary?.totalAvailableInternships]);

  // Combined and paginated learning data
  const combinedLearningData = useMemo(() => {
    return [...(allCourses?.data || []), ...(allInternships?.data || [])];
  }, [allCourses?.data, allInternships?.data]);

  // Paginated learning items
  const paginatedLearningData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return combinedLearningData.slice(startIndex, endIndex);
  }, [combinedLearningData, currentPage, pageSize]);

  // Fetch real per-item progress for whatever's visible on the current page.
  // getOneInternsip only needs { id, userId } — it doesn't use orgId at all.
  useEffect(() => {
    if (!userId) return;

    const itemsNeedingProgress = paginatedLearningData.filter((item) => {
      const itemId = item?._id;
      if (!itemId) return false;
      return !requestedIdsRef.current.has(itemId);
    });

    if (itemsNeedingProgress.length === 0) return;

    itemsNeedingProgress.forEach((item) => {
      const itemId = item._id;
      requestedIdsRef.current.add(itemId);

      setProgressById((prev) => ({
        ...prev,
        [itemId]: { ...(prev[itemId] || {}), loading: true },
      }));

      dispatch(getOneInternsip({ id: itemId, userId }))
        .then((res) => {
          // getOneInternsip uses thunkAPI.rejectWithValue on failure, which
          // makes the dispatched promise resolve (not reject) with an
          // action whose type ends in "/rejected". Handle that explicitly
          // instead of relying on .catch().
          if (res?.type?.endsWith("/rejected")) {
            setProgressById((prev) => ({
              ...prev,
              [itemId]: { ...(prev[itemId] || {}), loading: false, error: true },
            }));
            return;
          }

          const payload = res?.payload;
          setProgressById((prev) => ({
            ...prev,
            [itemId]: {
              completedCount: payload?.completedCount ?? 0,
              totalCount: payload?.totalCount ?? 0,
              totalProgress: payload?.totalProgress ?? 0,
              loading: false,
            },
          }));
        })
        .catch((err) => {
          console.error("getOneInternsip failed for", itemId, err);
          setProgressById((prev) => ({
            ...prev,
            [itemId]: { ...(prev[itemId] || {}), loading: false, error: true },
          }));
        });
    });
  }, [paginatedLearningData, userId, dispatch]);

  // Handle pagination change
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  // Retry handler
  const handleRetry = useCallback(() => {
    fetchAllData();
  }, [fetchAllData]);

  if (error) {
    return (
      <div className="text-center p-8">
        <p>Error loading dashboard: {error}</p>
        <Button onClick={handleRetry} type="primary">
          Retry
        </Button>
      </div>
    );
  }

  if (isMobile) {
    return (
      <MobileDashboard
        studentCreds={studentCreds}
        greeting={greeting}
        dashboardStats={dashboardStats}
        combinedLearningData={combinedLearningData}
        profileValues={profileValues}
        allCourses={allCourses}
        allInternships={allInternships}
        recIndex={recCourseIndex}
        setRecIndex={setRecCourseIndex}
        isNoticeModalOpen={isNoticeModalOpen}
        setIsNoticeModalOpen={setIsNoticeModalOpen}
        loading={loading}
        router={router}
        dispatch={dispatch}
        progressById={progressById}
      />
    );
  }

  return (
    <section className="w-full h-full flex flex-col items-stretch lg:pt-0 bg-[#EFF5FB]">
      {/* Welcome Section - Top Full Width */}
      <div className="w-full h-[140px] min-h-[140px] flex flex-col justify-center items-start gap-2 p-4 lg:px-8 lg:py-6 border-b-[1px] border-white/10 shadow-sm rounded-2xl lg:rounded-none bg-gradient-to-br from-[#071631] to-[#10254c] text-white shrink-0 relative overflow-hidden z-[2]">
        {/* Decorative Icons matching TPO Portal */}
        <div className="absolute inset-0 pointer-events-none z-[1]">
          <BsX className="absolute top-[20%] right-[10%] text-[#1E69DA] opacity-60 text-[1.2rem]" />
          <BsPlus className="absolute bottom-[20%] right-[30%] text-[#1E69DA] opacity-50 text-[1.5rem]" />
          <BsStar className="absolute top-[40%] right-[50%] text-[#1E69DA] opacity-50 text-[1.1rem]" />
          <BsX className="absolute bottom-[30%] right-[5%] text-[#1E69DA] opacity-60 text-[1.3rem]" />
        </div>

        <div className="w-full flex items-center justify-between relative z-[2]">
          <p className="text-[18px] lg:text-[24px] font-bold text-white m-0">
            {mounted && studentCreds?.userName
              ? `Hi ${studentCreds.userName.charAt(0).toUpperCase() + studentCreds.userName.slice(1)},`
              : "Hi,"}
          </p>
          <div className="text-[11px] lg:text-[13px] font-bold tracking-[0.5px] uppercase text-[#cbd5e1]">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
        <p className="text-[18px] lg:text-[32px] font-bold text-white m-0 tracking-tight relative z-[2]">{greeting}</p>
      </div>

      <div className="w-full flex-1 flex flex-col lg:flex-row items-stretch overflow-hidden relative">
        <div className="w-full lg:flex-1 h-full flex flex-col items-center lg:items-start gap-6 overflow-y-auto [&::-webkit-scrollbar]:hidden px-2 lg:px-8 py-4 lg:py-6">

          {/* Dashboard Statistics Card */}
          <div className="w-full flex justify-start">
            <DashboardStats stats={dashboardStats} router={router} />
          </div>

          {/* Continue Learning Section with Pagination */}
          <div className="w-full rounded-2xl bg-white py-4 px-4 lg:px-6 shadow-sm border border-[#e2e8f0]">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[18px] lg:text-[22px] font-extrabold">
                <span>Continue Learning</span>
                {combinedLearningData.length > pageSize && (
                  <span className="text-[14px] text-[#666] ml-4 font-normal">
                    ({combinedLearningData.length} total items)
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
                  {paginatedLearningData.map((item) => {
                    const hasLastAccessed = item?.lastAccessedSection !== undefined && item?.lastAccessedSection !== null;
                    const handleNavigate = () => {
                      const basePath = item?.type === "internship" ? "/student/learning-internship" : "/student/learning-course";
                      let url = `${basePath}?title=${item?.title?.split(" ")?.join("")}&id=${item?._id}&orgId=${item?.sourceOrgId}`;
                      if (hasLastAccessed) {
                        url += `&section=${item.lastAccessedSection}`;
                        if (item.lastAccessedTopic !== undefined && item.lastAccessedTopic !== null) url += `&topic=${item.lastAccessedTopic}`;
                      }
                      router.push(url);
                    };

                    let lastAccessedInfo = "Not started";
                    if (hasLastAccessed) {
                      lastAccessedInfo = "In progress";
                    }

                    const isInternship = item?.type === "internship";

                    // Real progress from getOneInternsip, falling back to 0
                    // while the per-item fetch is still in flight or hasn't
                    // started (item.progress never actually exists on these
                    // payloads, so that old fallback never did anything).
                    const fetchedProgress = progressById[item._id];
                    const progressVal = fetchedProgress?.totalProgress ?? 0;
                    const isProgressLoading = fetchedProgress?.loading;

                    return (
                      <div key={item._id} className={`flex flex-col md:flex-row items-center justify-between p-3 bg-white border border-[#e2e8f0] rounded-[12px] hover:shadow-md transition-shadow border-l-[4px] ${isInternship ? 'border-l-[#0284c7]' : 'border-l-[#24A058]'}`}>
                        {/* Left Side: Icon & Info */}
                        <div className="flex items-center gap-4 w-full md:w-auto">
                          <div className={`w-[50px] h-[50px] rounded-xl flex items-center justify-center shrink-0 overflow-hidden ${isInternship ? 'bg-[#e1f5fe]' : 'bg-[#e8f5e9]'}`}>
                            {isInternship ? (
                              <LaptopOutlined style={{ fontSize: '24px', color: '#0284c7' }} />
                            ) : (
                              <ReadOutlined style={{ fontSize: '24px', color: '#24A058' }} />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-[#1e293b] text-[15px]">{item?.title}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[11px] font-semibold px-2 py-[2px] rounded-md ${isInternship ? 'bg-[#e1f5fe] text-[#0284c7]' : 'bg-[#e8f5e9] text-[#24A058]'}`}>
                                {isInternship ? 'Internship' : 'Course'}
                              </span>
                              <span className="text-[12px] text-[#64748b]">
                                {isProgressLoading ? "Loading…" : lastAccessedInfo} · Added {new Date(item?.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right Side: Progress & Button */}
                        <div className="flex flex-col items-end gap-1 w-full md:w-auto mt-4 md:mt-0">
                          <div className="flex items-center gap-2 w-[180px] justify-end">
                            <Progress 
                              percent={progressVal} 
                              size="small" 
                              showInfo={false} 
                              strokeColor={hasLastAccessed ? '#4f46e5' : '#24A058'} 
                              trailColor="#f1f5f9"
                              className="m-0 w-[120px]"
                            />
                            <span className="text-[12px] text-[#64748b] font-medium min-w-[30px] text-right">{progressVal}%</span>
                          </div>
                          <Button
                            onClick={handleNavigate}
                            className="!bg-gradient-to-br !from-[#1E69DA] !to-[#5694F0] !border-none !text-white hover:opacity-90"
                            style={{
                              fontWeight: '600',
                              borderRadius: '8px',
                              padding: '4px 16px',
                              height: '32px'
                            }}
                          >
                            {hasLastAccessed ? "Continue" : "Start Learning"}
                          </Button>
                        </div>
                      </div>
                  );
                })}
              </motion.div>
              </AnimatePresence>
            )}
          </div>
          {/* Grouped Recommended Section */}
          {(allCoursesOnly?.length > 0 || allInternshipsOnly?.length > 0) && (
            <div className="w-full rounded-2xl bg-white p-4 lg:p-6 mt-4 flex flex-col items-center">
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
                                `/student/course`
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
                          key={recInternshipIndex}
                          initial={{ opacity: 0, scale: 0.96, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.96, y: -10 }}
                          transition={{ duration: 0.35, ease: "easeInOut" }}
                          className="w-full h-full"
                        >
                          <RecommendedCard
                            item={allInternshipsOnly[recInternshipIndex % allInternshipsOnly.length]}
                            total={allInternshipsOnly.length}
                            currentIndex={recInternshipIndex}
                            onDotClick={setRecInternshipIndex}
                            onPrevClick={() => setRecInternshipIndex(prev => prev === 0 ? allInternshipsOnly.length - 1 : prev - 1)}
                            onNextClick={() => setRecInternshipIndex(prev => prev + 1)}
                            onCardClick={(item) => {
                              router.push(
                                `/student/internshipLibrary`                          
                              );
                            }}
                          />
                        </motion.div>
                      </AnimatePresence>
                      <div className="w-full h-[4px] bg-[#f1f5f9] mt-4 rounded-full relative overflow-hidden shrink-0">
                        <div
                          key={`internship-${recInternshipIndex}`}
                          className="absolute top-0 left-0 h-full bg-gradient-to-br from-[#1E69DA] to-[#5694F0]"
                          style={{ animation: 'fillLeftToRight 10s linear forwards' }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="hidden lg:flex w-[280px] xl:w-[320px] h-full flex-col overflow-hidden bg-white border-l-[1px] border-[#e2e8f0] px-4 pt-0 pb-2 shrink-0 z-10 shadow-sm relative">
          <div className="w-full flex flex-col overflow-y-auto [&::-webkit-scrollbar]:hidden flex-1 h-full">
            {/* Section 1: Overall Performance */}
            <div className="w-full shrink-0 pt-0 pb-3">
              <ProfileSection
                profileValues={profileValues}
                router={router}
                studentCreds={studentCreds}
              />
            </div>
            
            {/* Section 2: Notice Board */}
            <div className="w-full flex flex-col relative border-t border-[#f1f5f9] pt-2 min-h-0 flex-1">
              <div className="w-full flex items-center justify-between mb-3 sticky top-0 bg-white z-10 shrink-0">
                <h3 className="m-0 font-extrabold text-[#0f172a] text-[18px]">Notice Board</h3>
                <svg width="0" height="0" className="absolute">
                  <linearGradient id="expandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop stopColor="#1E69DA" offset="0%" />
                    <stop stopColor="#5694F0" offset="100%" />
                  </linearGradient>
                </svg>
                <HiOutlineArrowsExpand
                  className="text-[1.2rem] cursor-pointer transition-transform duration-200 hover:scale-125"
                  style={{ stroke: "url(#expandGradient)" }}
                  onClick={() => setIsNoticeModalOpen(true)}
                />
              </div>
              <div className="w-full shrink-0 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden pb-1">
                <CardsList type="notifications" />
              </div>
            </div>
            
            {/* Section 3: Achievements */}
            <div className="w-full relative border-t border-[#f1f5f9] pt-2 min-h-0 flex-1">
              <Achievements />
            </div>
          </div>
        </div>

          <Modal
            title="Notice Board"
            open={isNoticeModalOpen}
            onCancel={() => setIsNoticeModalOpen(false)}
            footer={null}
            width={1000}
          >
            <div style={{ height: "70vh", overflowY: "auto" }}>
              <CardsList type="notifications" isModal={true} />
            </div>
          </Modal>
        </div>
    </section>
  );
}