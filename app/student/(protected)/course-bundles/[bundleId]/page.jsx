"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { getAllCoursesOnly, getAllCourses } from "@/redux/slices/internship";
import { getStudentCreds } from "@/redux/slices/student";
import { message, Spin, Popover } from "antd";
import {
  Clock,
  PlayCircle,
  CheckCircle,
  Tv,
  Award,
  Layers,
  Shield,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  ArrowRight,
  Sparkles,
  Share2,
} from "lucide-react";
import { BsStack, BsArrowLeft, BsPercent } from "react-icons/bs";
import BuyNowPopoverContent from "@/universalUtils/LibraryPage/BuyNowPopoverContent";
import ShareModal from "@/components/shared/ShareModal";
import { StudentBundleCard } from "@/components/courseAccess/CourseBundlesStrip";
import { formatPrice } from "@/components/courseAccess/access";
import {
  createCourseBundleOrder,
  fetchCourseCatalog,
  verifyCourseBundlePayment,
} from "@/services/courseAccessApi";
import { loadRazorpayScript } from "@/utils/loadRazorpay";

export default function CourseBundleDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const bundleId = params?.bundleId;
  const student = useSelector((state) => state.student?.student?.data || state.student?.student);
  const studentCreds = useSelector((state) => state.student?.student?.data || state.student?.student);
  const allCoursesList = useSelector(
    (state) =>
      state.internship?.allCoursesOnly?.data ||
      state.internship?.allCourses?.data ||
      state.internship?.allCourses ||
      []
  );

  const [catalog, setCatalog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [relatedCourses, setRelatedCourses] = useState([]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const relatedCoursesRef = useRef(null);
  const relatedBundlesRef = useRef(null);

  const scrollContainer = (ref, dir) => {
    if (ref.current) {
      ref.current.scrollBy({ left: dir === "left" ? -340 : 340, behavior: "smooth" });
    }
  };

  const loadBundleData = useCallback(async () => {
    try {
      setLoading(true);
      const cat = await fetchCourseCatalog();
      setCatalog(cat);
    } catch (err) {
      console.error("fetchCourseCatalog error:", err);
      message.error("Failed to load course bundle");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBundleData();
    if (!student?._id) {
      dispatch(getStudentCreds());
    }
    dispatch(getAllCourses());
    dispatch(getAllCoursesOnly({ pageNo: 1, limit: 12 })).then((res) => {
      const data = res.payload?.data || res.payload?.courses || (Array.isArray(res.payload) ? res.payload : []);
      setRelatedCourses(data);
    });
  }, [dispatch, loadBundleData, student?._id]);

  const bundle = catalog?.bundles?.find((b) => String(b._id) === String(bundleId));

  const isEnrolled = !!bundle?.entitlement?.unlocked;
  const mrp = Number(bundle?.mrp) || 0;
  const price = Number(bundle?.price) || 0;
  const bundleCourses = bundle?.courses || [];
  const courseCount = bundle?.courseIds?.length || bundleCourses.length || 0;
  const separateTotal = bundleCourses.reduce((sum, c) => sum + (Number(c.price) || 0), 0);
  const baseline = mrp || separateTotal;
  const savingsPercent = baseline > price ? Math.round(((baseline - price) / baseline) * 100) : 0;
  const validity =
    bundle?.validityDays > 0 ? `${bundle.validityDays} Days access` : "Lifetime access";

  // Build a lookup map of courseId -> enriched course object from redux
  const coursesByIdMap = React.useMemo(() => {
    const map = new Map();
    (allCoursesList || []).forEach((c) => {
      if (c._id) map.set(String(c._id), c);
    });
    return map;
  }, [allCoursesList]);

  // Other bundles in the catalog for related bundles section
  const otherBundles = React.useMemo(() => {
    return (catalog?.bundles || []).filter((b) => String(b._id) !== String(bundleId));
  }, [catalog, bundleId]);

  const handleStartLearning = () => {
    if (bundleCourses.length > 0) {
      const firstCourse = bundleCourses[0];
      const enriched = coursesByIdMap.get(String(firstCourse.courseId));
      const targetId = firstCourse.courseId;
      const title = (enriched?.title || firstCourse.title || "Course").split(" ").join("");
      const orgId = enriched?.sourceOrgId || enriched?.assignedOrgs?.[0] || "";
      router.push(`/student/learning-course?title=${title}&id=${targetId}&orgId=${orgId}`);
    } else {
      router.push("/student/course");
    }
  };

  const handleBuyBundle = async () => {
    if (!bundle || paying) return;
    setPaying(true);
    try {
      const order = await createCourseBundleOrder(bundle._id);

      if (!(await loadRazorpayScript())) {
        message.error("Unable to load the payment gateway. Please check your connection and try again.");
        setPaying(false);
        return;
      }

      const fullName = [studentCreds?.firstName, studentCreds?.lastName].filter(Boolean).join(" ");
      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: "SkillMedha",
        description: order.title,
        prefill: {
          ...(fullName ? { name: fullName } : {}),
          ...(studentCreds?.email ? { email: studentCreds.email } : {}),
        },
        theme: { color: "#1E69DA" },
        handler: async (response) => {
          try {
            await verifyCourseBundlePayment(response);
            message.success("Payment successful! Course bundle unlocked.");
            await loadBundleData();
          } catch (err) {
            message.error(
              err.message ||
                "Payment was received but verification failed. Please contact support."
            );
          } finally {
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => {
            message.info("Payment cancelled");
            setPaying(false);
          },
        },
      });

      rzp.on("payment.failed", (resp) => {
        message.error(resp?.error?.description || "Payment failed. Please try again.");
        setPaying(false);
      });
      rzp.open();
    } catch (err) {
      message.error(err.message || "Couldn't initiate payment. Please try again.");
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center bg-[#EFF5FB]">
        <Spin size="large" tip="Loading bundle details..." />
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center gap-4 bg-[#EFF5FB] text-slate-500">
        <BsStack className="text-5xl text-slate-300" />
        <h2 className="text-xl font-bold text-slate-700">Course Bundle not found</h2>
        <p className="text-sm text-slate-500">This bundle might have been removed or is no longer available.</p>
        <button
          onClick={() => router.push("/student/course")}
          className="rounded-xl bg-[#1E69DA] px-6 py-2.5 font-bold text-white shadow-sm hover:bg-blue-700 cursor-pointer"
        >
          Back to Course Library
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#EFF5FB] pb-16">
      {/* Top Hero Banner - Exact height and styling matching Course Library banner */}
      <div className="w-full h-[110px] lg:h-[140px] min-h-[110px] lg:min-h-[140px] flex flex-col justify-center p-4 lg:px-8 shadow-sm rounded-none bg-gradient-to-br from-[#071631] to-[#10254c] text-white shrink-0 relative overflow-hidden z-[2]">
        {/* Background ambient accents */}
        <div className="absolute inset-0 pointer-events-none z-[1]">
          <div className="absolute top-[20%] right-[10%] text-[#1E69DA] opacity-60 text-[1.2rem]">✕</div>
          <div className="absolute bottom-[20%] right-[30%] text-[#1E69DA] opacity-50 text-[1.5rem]">+</div>
          <div className="absolute top-[40%] right-[50%] text-[#1E69DA] opacity-50 text-[1.1rem]">★</div>
          <div className="absolute bottom-[30%] right-[5%] text-[#1E69DA] opacity-60 text-[1.3rem]">✕</div>
        </div>

        <div className="flex items-center justify-between w-full relative z-[2] max-w-[1400px] mx-auto">
          <div className="flex items-center gap-4 relative z-10 min-w-0">
            <div className="w-[56px] h-[56px] bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10 shrink-0">
              <BsStack className="text-white text-3xl" />
            </div>
            <div className="flex flex-col justify-center gap-1 min-w-0">
              <div className="flex items-center gap-2 text-xs text-blue-200/80 leading-none">
                <button
                  onClick={() => router.push("/student/course")}
                  className="hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 text-xs font-semibold text-white/80"
                >
                  Course Library
                </button>
                <span>›</span>
                <span className="text-white/60">Bundles</span>
                <span>›</span>
                <span className="font-bold text-white truncate max-w-[180px] sm:max-w-[280px]">{bundle.title}</span>
              </div>
              <h1 className="text-[22px] lg:text-[26px] font-bold text-white m-0 tracking-tight leading-none flex items-center gap-2.5 truncate" style={{ border: "none", marginBottom: 0 }}>
                <span className="truncate">{bundle.title}</span>
                {bundle.featured && (
                  <span className="shrink-0 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-extrabold text-amber-950">
                    Popular
                  </span>
                )}
              </h1>
              {bundle.description && (
                <p className="hidden lg:block text-white/90 text-[14px] lg:text-[15px] m-0 leading-tight truncate max-w-[700px]" style={{ marginTop: 0 }}>
                  {bundle.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 lg:gap-8 shrink-0">
            <div className="hidden sm:flex flex-col items-center justify-center w-[80px]">
              <span className="text-[22px] lg:text-[26px] font-bold text-white leading-none">
                {courseCount}
              </span>
              <span className="text-[12px] text-[#94a3b8] font-bold tracking-wider uppercase mt-1.5 text-center">Courses</span>
            </div>

            <button
              onClick={() => router.push("/student/course")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 px-3.5 py-2 text-xs font-bold text-white backdrop-blur-md border border-white/10 transition-colors cursor-pointer"
            >
              <BsArrowLeft className="text-sm" /> All Courses
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-[1400px] px-4 py-8 lg:px-8">
        <div className="flex flex-col-reverse gap-8 lg:flex-row lg:items-start">
          {/* Left Column: Bundle Details & Courses */}
          <div className="min-w-0 flex-1">
            {/* Overview Section */}
            <div className="mb-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm lg:p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" /> Bundle Overview
              </h2>
              <div className="text-[15px] leading-relaxed text-slate-600 space-y-3">
                <p>
                  {bundle.description ||
                    "This comprehensive bundle is carefully curated by industry practitioners to guide you from foundational knowledge to advanced mastery. By enrolling in this bundle, you gain immediate, structured access to all included courses and their complete curriculum."}
                </p>
                <p>
                  Each course inside contains full video lessons, hands-on assignments, interactive quizzes,
                  and a verified completion certificate to showcase on your profile and resume.
                </p>
              </div>

              {/* Bundle Highlights Grid */}
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 pt-6 border-t border-slate-100">
                <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                  <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 m-0">All Included Courses</h4>
                    <p className="text-xs text-slate-500 m-0 mt-0.5">Unlocks all {courseCount} courses instantly</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                  <Award className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 m-0">Course Certificates</h4>
                    <p className="text-xs text-slate-500 m-0 mt-0.5">Earn a recognized certificate for each course completed</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                  <Tv className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 m-0">{validity}</h4>
                    <p className="text-xs text-slate-500 m-0 mt-0.5">Learn at your own pace anytime, anywhere</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                  <Sparkles className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 m-0">Assignments & Quizzes</h4>
                    <p className="text-xs text-slate-500 m-0 mt-0.5">Hands-on practical tests and learning resources</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Courses Included Section */}
            <div className="mb-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm lg:p-8">
              <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 m-0 flex items-center gap-2">
                    <Layers className="h-5 w-5 text-blue-600" />
                    Courses in this Bundle ({courseCount})
                  </h2>
                  <span className="text-xs text-slate-500">
                    Complete curriculum and hands-on modules for each course
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {bundleCourses.map((c, idx) => {
                  const courseId = c.courseId;
                  const enriched = coursesByIdMap.get(String(courseId));
                  const courseTitle = enriched?.title || c.title || "Course";
                  const courseImg =
                    enriched?.media?.thumbnailImage ||
                    enriched?.media?.coverImage ||
                    enriched?.thumbnail ||
                    enriched?.bannerImage ||
                    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80";
                  const courseCategory = enriched?.category || "Technology";
                  const courseDifficulty = enriched?.difficulty;
                  const courseDuration = enriched?.duration || enriched?.courseIncludes?.videoDuration;
                  const modulesCount = enriched?.sections?.length || 0;
                  const isCourseOwned = (bundle.ownedIds || []).includes(courseId);

                  return (
                    <div
                      key={courseId || idx}
                      className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition-all hover:bg-white hover:border-blue-200 hover:shadow-md"
                    >
                      {/* Course Thumbnail */}
                      <div className="relative aspect-video w-full sm:w-[150px] shrink-0 overflow-hidden rounded-lg bg-slate-900">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={courseImg}
                          alt={courseTitle}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute top-2 left-2 z-10 flex items-center justify-center h-6 w-6 rounded-full bg-black/60 text-white text-[11px] font-bold backdrop-blur-md">
                          {idx + 1}
                        </div>
                      </div>

                      {/* Course Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="rounded bg-blue-100 text-blue-700 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider">
                            {courseCategory}
                          </span>
                          {courseDifficulty && (
                            <span className="rounded bg-slate-200 text-slate-700 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider">
                              {courseDifficulty}
                            </span>
                          )}
                          {isCourseOwned && (
                            <span className="rounded bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[10.5px] font-bold">
                              ✓ Already Owned
                            </span>
                          )}
                        </div>

                        <h3
                          onClick={() => router.push(`/student/course/${courseId}`)}
                          className="cursor-pointer text-base font-bold text-slate-900 transition-colors hover:text-blue-600 line-clamp-1 m-0"
                          title={courseTitle}
                        >
                          {courseTitle}
                        </h3>

                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          {courseDuration && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-slate-400" /> {courseDuration}
                            </span>
                          )}
                          {modulesCount > 0 && (
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3.5 w-3.5 text-slate-400" /> {modulesCount} modules
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Award className="h-3.5 w-3.5 text-slate-400" /> Certificate
                          </span>
                        </div>
                      </div>

                      {/* Action */}
                      <div className="flex items-center justify-end w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                        <button
                          type="button"
                          onClick={() => router.push(`/student/course/${courseId}`)}
                          className="rounded-lg bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5"
                        >
                          View Course <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Value & Savings Section */}
            {savingsPercent > 0 && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shrink-0 shadow-sm">
                    <BsPercent className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-emerald-950 m-0">
                      Save {savingsPercent}% with this bundle package
                    </h3>
                    <p className="mt-1 text-sm text-emerald-800 leading-relaxed m-0">
                      Buying these {courseCount} courses individually would cost {formatPrice(baseline)}. By
                      purchasing this bundle today, you get complete access for just {formatPrice(price)} and save{" "}
                      {formatPrice(baseline - price)}.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Sidebar Card (Matching Course Details Page) */}
          <div className="w-full lg:w-[340px] xl:w-[380px] shrink-0">
            <div className="sticky top-[40px] lg:top-[60px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
              {/* Card Banner Artwork */}
              <div className="relative aspect-video w-full bg-slate-900 border-b border-slate-100 overflow-hidden">
                {bundle.thumbnail ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={bundle.thumbnail}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 h-full w-full object-cover blur-md opacity-40 scale-110 pointer-events-none"
                    />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={bundle.thumbnail}
                      alt={bundle.title}
                      className="relative z-[1] h-full w-full object-cover"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent z-[2]" />
                  </>
                ) : (
                  <div className="relative h-full w-full bg-gradient-to-br from-slate-900 via-[#132238] to-[#0d1829] flex items-center justify-center">
                    <BsStack className="text-5xl text-blue-300" />
                  </div>
                )}
                <div className="absolute top-3 left-3 z-10">
                  {isEnrolled ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-md">
                      <CheckCircle className="h-3.5 w-3.5" /> Purchased
                    </span>
                  ) : bundle.featured ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-0.5 text-xs font-extrabold text-amber-950 shadow-sm backdrop-blur-md">
                      ★ Popular
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                {/* Pricing / Enrolled Status */}
                {isEnrolled ? (
                  <div className="mb-6 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1.5 text-[13px] font-bold text-emerald-800">
                      <CheckCircle className="h-4 w-4 text-emerald-600" /> You own this bundle
                    </span>
                  </div>
                ) : (
                  <div className="mb-6 flex items-baseline gap-3">
                    <span className="text-3xl font-bold leading-none text-slate-900">
                      {formatPrice(price)}
                    </span>
                    {baseline > price && (
                      <span className="text-lg font-medium leading-none text-slate-400 line-through">
                        {formatPrice(baseline)}
                      </span>
                    )}
                    {savingsPercent > 0 && (
                      <span className="text-sm font-semibold leading-none text-emerald-600">
                        {savingsPercent}% off
                      </span>
                    )}
                  </div>
                )}

                {/* Buy Button */}
                <button
                  onClick={isEnrolled ? handleStartLearning : handleBuyBundle}
                  disabled={paying}
                  className={`mb-6 flex w-full items-center justify-center gap-2 rounded-lg py-3.5 px-6 text-[16px] font-bold text-white shadow-sm transition-colors cursor-pointer ${
                    isEnrolled
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-[#0056D2] hover:bg-[#004bb8]"
                  } disabled:opacity-70`}
                >
                  {isEnrolled ? (
                    <>
                      <PlayCircle className="h-5 w-5" /> Start Learning
                    </>
                  ) : paying ? (
                    <>
                      <Spin size="small" /> Processing Payment...
                    </>
                  ) : (
                    "Buy Course Bundle"
                  )}
                </button>

                {/* Bundle Specs List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[14px]">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Layers className="h-4 w-4" />
                      <span>Included Courses</span>
                    </div>
                    <span className="font-semibold text-slate-800">{courseCount} Courses</span>
                  </div>

                  <div className="flex items-center justify-between text-[14px]">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Tv className="h-4 w-4" />
                      <span>Access Validity</span>
                    </div>
                    <span className="font-semibold text-slate-800">{validity}</span>
                  </div>

                  <div className="flex items-center justify-between text-[14px]">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Award className="h-4 w-4" />
                      <span>Certificates</span>
                    </div>
                    <span className="font-semibold text-slate-800">Included for each course</span>
                  </div>

                  <div className="flex items-center justify-between text-[14px]">
                    <div className="flex items-center gap-2 text-slate-600">
                      <BookOpen className="h-4 w-4" />
                      <span>Curriculum Access</span>
                    </div>
                    <span className="font-semibold text-slate-800">All Lessons & Quizzes</span>
                  </div>
                </div>

                {/* Footer Area with Share and Trust */}
                <div className="mt-5 border-t border-slate-200 pt-3.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setIsShareModalOpen(true)}
                      className="cursor-pointer text-[#0056D2] hover:underline inline-flex items-center gap-1"
                    >
                      <Share2 className="h-3.5 w-3.5" /> Share
                    </button>
                    <span className="text-slate-400 font-normal inline-flex items-center gap-1">
                      <Shield className="h-3.5 w-3.5 text-blue-600" /> Secure payment via Razorpay
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section 1: Related Bundles */}
        {otherBundles.length > 0 && (
          <section className="mt-14 border-t border-slate-200 pt-10">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 m-0">Related Bundles</h2>
                <span className="text-sm text-slate-500">More course bundle packages you might be interested in</span>
              </div>
              {otherBundles.length > 3 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => scrollContainer(relatedBundlesRef, "left")}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:border-blue-300 hover:text-blue-600 cursor-pointer"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => scrollContainer(relatedBundlesRef, "right")}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:border-blue-300 hover:text-blue-600 cursor-pointer"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>

            <div
              ref={relatedBundlesRef}
              className="no-scrollbar flex gap-6 overflow-x-auto pb-4 pt-2"
            >
              {otherBundles.map((b) => (
                <StudentBundleCard
                  key={b._id}
                  bundle={b}
                  onOpen={(url) => router.push(url)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Bottom Section 2: Related Courses */}
        {relatedCourses.length > 0 && (
          <section className="mt-12 border-t border-slate-200 pt-10">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 m-0">Related Courses</h2>
                <span className="text-sm text-slate-500">Individual courses you might like</span>
              </div>
              {relatedCourses.length > 4 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => scrollContainer(relatedCoursesRef, "left")}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:border-blue-300 hover:text-blue-600 cursor-pointer"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => scrollContainer(relatedCoursesRef, "right")}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:border-blue-300 hover:text-blue-600 cursor-pointer"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>

            <div
              ref={relatedCoursesRef}
              className="no-scrollbar flex gap-6 overflow-x-auto pb-4 pt-2"
            >
              {relatedCourses.map((item) => {
                const itemImageUrl =
                  item.media?.coverImage ||
                  item.media?.thumbnailImage ||
                  item.bannerImage ||
                  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80";
                const itemPrice = item?.pricing?.finalPrice || item?.price;

                return (
                  <Popover
                    key={item._id}
                    trigger="hover"
                    placement="right"
                    overlayStyle={{ maxWidth: 320 }}
                    styles={{
                      body: {
                        borderRadius: 16,
                        padding: 0,
                        overflow: "hidden",
                        border: "1px solid #cbd5e1",
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                      },
                    }}
                    content={
                      <BuyNowPopoverContent
                        item={item}
                        onAddToWishlist={() => {}}
                        onAddToCart={() => {}}
                        onBuyNow={() => router.push(`/student/course/${item._id}`)}
                      />
                    }
                  >
                    <div
                      onClick={() => router.push(`/student/course/${item._id}`)}
                      className="flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all min-w-[280px] w-[280px] sm:min-w-[300px] sm:w-[300px] shrink-0"
                    >
                      <div className="aspect-video bg-slate-100 relative w-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={itemImageUrl}
                          alt={item.title || "Course"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="font-bold text-slate-800 line-clamp-2 mb-2 text-[15px] leading-snug m-0">
                          {item.title}
                        </h3>
                        <div className="flex items-center justify-between text-[13px] text-slate-500 mt-auto pt-4">
                          <span className="bg-slate-100 px-2 py-1 rounded text-xs font-semibold">
                            {item.category || "General"}
                          </span>
                          <span className="font-bold text-slate-900 text-base">
                            {itemPrice ? `₹${Number(itemPrice).toLocaleString("en-IN")}` : "Free"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Popover>
                );
              })}
            </div>
          </section>
        )}
      </div>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={bundle?.title}
        courseId={bundle?._id}
        slug={bundle?._id}
        type="bundle"
      />
    </div>
  );
}
