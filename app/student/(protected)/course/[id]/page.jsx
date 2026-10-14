"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { getOneInternsip, getAllCoursesOnly } from "@/redux/slices/internship";
import { message, Spin, Popover } from "antd";
import BuyNowPopoverContent from "@/universalUtils/LibraryPage/BuyNowPopoverContent";
import {
  Clock,
  PlayCircle,
  BookOpen,
  CheckCircle,
  Tv,
  Download,
  Award,
  FileText,
  ChevronDown,
  ChevronUp,
  BarChart,
  Code,
  ChevronLeft,
  ChevronRight,
  Check
} from "lucide-react";

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState(-1);
  const [showAllCurriculum, setShowAllCurriculum] = useState(false);
  const [showAllDescription, setShowAllDescription] = useState(false);
  const [showAllLearning, setShowAllLearning] = useState(false);
  const [relatedItems, setRelatedItems] = useState([]);
  const toolsRef = useRef(null);

  useEffect(() => {
    if (params?.id) {
      fetchCourseDetails();
      fetchRelatedItems();
    }
  }, [params?.id]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const res = await dispatch(getOneInternsip({ id: params.id }));
      if (res.payload?.data) {
        setCourse(res.payload.data);
      } else if (res.payload && !res.payload.data) {
        setCourse(res.payload);
      }
    } catch (err) {
      console.error(err);
      message.error("Failed to load details");
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedItems = async () => {
    try {
      const res = await dispatch(getAllCoursesOnly({ pageNo: 1, limit: 10 }));
      if (res.payload?.data) {
        setRelatedItems(res.payload.data.filter((c) => c._id !== params.id));
      } else if (res.payload?.courses) {
        setRelatedItems(res.payload.courses.filter((c) => c._id !== params.id));
      } else if (Array.isArray(res.payload)) {
        setRelatedItems(res.payload.filter((c) => c._id !== params.id));
      }
    } catch (e) {}
  };

  const relatedRef = useRef(null);
  const scrollRelated = (dir) => {
    if (relatedRef.current) {
      relatedRef.current.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
    }
  };

  const scrollTools = (dir) => {
    if (toolsRef.current) {
      toolsRef.current.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Spin size="large" tip="Loading course details..." />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-[500px] text-gray-500">
        Course not found.
      </div>
    );
  }

  // Handle HTML rendering safely
  const renderHTML = (html) => {
    return { __html: html || "N/A" };
  };

  const imageUrl =
    course?.media?.coverImage ||
    course?.media?.thumbnailImage ||
    course?.bannerImage ||
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80";

  const handleBuyNow = () => {
    const courseId = course?._id;
    if (!courseId) return;
    const orgId = course?.sourceOrgId;
    router.push(`/student/checkout?courseId=${courseId}${orgId ? `&orgId=${orgId}` : ""}`);
  };

  const visibleSections = showAllCurriculum ? course?.sections : course?.sections?.slice(0, 6);
  const visibleLearning = showAllLearning ? course?.learningPoints : course?.learningPoints?.slice(0, 6);
  const breadcrumb = [course.category || "Course", course.difficulty || "All Levels", course.title].filter(Boolean);

  return (
    <div className="absolute inset-0 bg-[#f8fafc] w-full flex flex-col overflow-hidden">
      {/* 1. Banner Section */}
      <section className="w-full min-h-[110px] lg:min-h-[140px] flex flex-col justify-center px-4 lg:px-8 bg-gradient-to-br from-[#071631] to-[#10254c] text-white shrink-0 relative overflow-hidden py-4 lg:py-5">
        <div className="max-w-[1400px] mx-auto w-full relative z-10 flex flex-col gap-1.5 lg:gap-2">
          
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] lg:text-[12px] text-white/60">
            {breadcrumb.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span>›</span>}
                <span className="font-medium text-white/80">{crumb}</span>
              </span>
            ))}
          </div>

          <div className="text-[20px] lg:text-[26px] font-bold text-white m-0 tracking-tight leading-snug">
            {course.title || "N/A"}
          </div>

          {course.subtitle && (
            <div className="text-white/80 text-[13px] lg:text-[14px] m-0 leading-snug">
              {course.subtitle}
            </div>
          )}

          <div className="flex items-center gap-4 lg:gap-6 text-white/70 text-[12px] lg:text-[13px] font-medium flex-wrap pt-0.5">
            {course.updatedAt && (
              <span>📅 Last updated {new Date(course.updatedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
            )}
            {course.language && (
              <span>🌐 {course.language}</span>
            )}
            {course.duration && (
              <span>⏱️ {course.duration}</span>
            )}
            {course.difficulty && (
              <span>📊 {course.difficulty}</span>
            )}
          </div>

        </div>
      </section>

      {/* Main Content & Sidebar - Scrollable Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden w-full relative">
        <section className="py-10 max-w-[1400px] mx-auto px-4 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row gap-12 relative">
            
            {/* Left Content */}
            <div className="flex-1 min-w-0 flex flex-col">
              
              {/* 1. What You'll Learn (Website design) */}
              {course?.learningPoints?.length > 0 && (
                <div className="border border-slate-200 rounded-lg p-6 lg:p-8 mb-10 shadow-sm relative overflow-hidden">
                  <h2 className="text-xl font-bold text-slate-800 mb-6">What you'll learn</h2>
                  <div className="relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                      {visibleLearning.map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-slate-700 shrink-0 mt-0.5" />
                          <span className="text-[15px] text-slate-600 leading-relaxed">{item}</span>
                        </div>
                      ))}
                    </div>
                    {!showAllLearning && course.learningPoints.length > 4 && (
                      <div className="absolute bottom-0 left-0 right-0 h-[64px] bg-gradient-to-t from-[#f8fafc] via-[#f8fafc]/90 to-transparent flex items-end justify-center pb-0">
                        <button 
                          onClick={() => setShowAllLearning(true)} 
                          className="text-blue-600 font-bold hover:underline text-sm mb-1 bg-[#f8fafc] px-5 py-2 rounded-full shadow-sm border border-slate-200"
                        >
                          Show More
                        </button>
                      </div>
                    )}
                  </div>
                  {showAllLearning && course.learningPoints.length > 4 && (
                    <button 
                      onClick={() => setShowAllLearning(false)} 
                      className="mt-6 text-sm font-bold text-blue-600 hover:underline block w-full text-center"
                    >
                      Show Less
                    </button>
                  )}
                </div>
              )}

              {/* 2. Explore Related Topics (Website design) */}
              {(course?.subcategories?.length > 0 || course?.tags?.length > 0) && (
                <div className="mb-10">
                  <h2 className="text-xl font-bold text-slate-800 mb-4">Explore related topics</h2>
                  <div className="flex flex-wrap gap-2">
                    {[...(course?.subcategories || []), ...(course?.tags || [])].map((topic, i) => (
                      <span
                        key={i}
                        className="rounded border border-slate-200 bg-white px-4 py-2 text-[14px] font-medium text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-colors cursor-default shadow-sm"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Course Includes */}
              <div className="mb-10">
                <h2 className="text-xl font-bold text-slate-800 mb-4">This course includes:</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                  {course?.courseIncludes ? (
                    <>
                      {course.courseIncludes.videoDuration && (
                        <div className="flex items-center gap-3 text-[15px] text-slate-600">
                          <Tv className="h-4 w-4 text-slate-700 shrink-0" />
                          {course.courseIncludes.videoDuration} on-demand video
                        </div>
                      )}
                      {course.courseIncludes.articles > 0 && (
                        <div className="flex items-center gap-3 text-[15px] text-slate-600">
                          <FileText className="h-4 w-4 text-slate-700 shrink-0" />
                          {course.courseIncludes.articles} articles
                        </div>
                      )}
                      {course.courseIncludes.downloadableResources > 0 && (
                        <div className="flex items-center gap-3 text-[15px] text-slate-600">
                          <Download className="h-4 w-4 text-slate-700 shrink-0" />
                          {course.courseIncludes.downloadableResources} downloadable resources
                        </div>
                      )}
                      {course.courseIncludes.codingExercises > 0 && (
                        <div className="flex items-center gap-3 text-[15px] text-slate-600">
                          <Code className="h-4 w-4 text-slate-700 shrink-0" />
                          {course.courseIncludes.codingExercises} coding exercises
                        </div>
                      )}
                      {course.courseIncludes.quizzes > 0 && (
                        <div className="flex items-center gap-3 text-[15px] text-slate-600">
                          <CheckCircle className="h-4 w-4 text-slate-700 shrink-0" />
                          {course.courseIncludes.quizzes} quizzes
                        </div>
                      )}
                      {course.courseIncludes.certificateOfCompletion && (
                        <div className="flex items-center gap-3 text-[15px] text-slate-600">
                          <Award className="h-4 w-4 text-slate-700 shrink-0" />
                          Certificate of completion
                        </div>
                      )}
                      {course.courseIncludes.jobAssistance && (
                        <div className="flex items-center gap-3 text-[15px] text-slate-600">
                          <Award className="h-4 w-4 text-slate-700 shrink-0" />
                          Job Assistance
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-slate-500 italic">N/A</span>
                  )}
                </div>
              </div>

              {/* 4. Course Curriculum */}
              <div className="mb-10">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Course Curriculum</h2>
                {course?.sections?.length > 0 ? (
                  <div className="relative">
                    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                      {visibleSections.map((section, idx) => (
                        <div key={idx} className="border-b border-slate-100 last:border-0">
                          <button
                            onClick={() => setExpandedSection(expandedSection === idx ? -1 : idx)}
                            className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                          >
                            <div className="flex items-center gap-3">
                              {expandedSection === idx ? (
                                <ChevronUp className="h-4 w-4 text-slate-500 shrink-0" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-slate-500 shrink-0" />
                              )}
                              <span className="font-bold text-slate-800 text-[15px]">{section.title}</span>
                            </div>
                            <span className="text-xs text-slate-500 whitespace-nowrap ml-4">
                              {section.topics?.length || 0} topics
                            </span>
                          </button>
                          {expandedSection === idx && (
                            <div className="p-2 bg-white">
                              {section.topics?.length > 0 ? (
                                section.topics.map((topic, tIdx) => (
                                  <div key={tIdx} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                      <PlayCircle className="h-4 w-4 text-slate-400 shrink-0" />
                                      <span className="text-slate-600 text-[14px]">{topic.title}</span>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="p-3 text-slate-400 italic text-[13px]">No topics added yet.</div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {!showAllCurriculum && course.sections.length > 5 && (
                      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent flex items-end justify-center pb-4 rounded-b-lg">
                        <button 
                          onClick={() => setShowAllCurriculum(true)} 
                          className="bg-white border border-slate-200 shadow-sm px-6 py-2.5 rounded-full font-bold text-slate-700 hover:text-blue-600 hover:border-blue-200 transition-all text-sm"
                        >
                          Show More Sections
                        </button>
                      </div>
                    )}
                    {showAllCurriculum && course.sections.length > 5 && (
                      <button 
                        onClick={() => setShowAllCurriculum(false)} 
                        className="mt-4 text-sm font-bold text-blue-600 hover:underline block w-full text-center"
                      >
                        Show Less
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="text-slate-500 italic">N/A</span>
                )}
              </div>

              {/* 5. Prerequisites */}
              {course?.requirements?.length > 0 && (
                <div className="mb-10">
                  <h2 className="text-xl font-bold text-slate-800 mb-4">Requirements</h2>
                  <ul className="space-y-2 pl-1">
                    {course.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2 text-[15px] text-slate-600">
                        <span className="mt-1 shrink-0 text-slate-400">•</span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 6. Skills Covered */}
              {course?.skills?.length > 0 && (
                <div className="mb-10">
                  <h2 className="text-xl font-bold text-slate-800 mb-4">Skills Covered</h2>
                  <div className="flex flex-wrap gap-2">
                    {course.skills.map((skill, idx) => {
                      const skillName = typeof skill === 'object' && skill.name ? skill.name : typeof skill === 'string' ? skill : "Skill";
                      return (
                        <span key={idx} className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-4 py-2 rounded-lg text-sm font-semibold">
                          {skillName}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 7. Tools Covered */}
              {course?.tools?.length > 0 && (
                <div className="mb-10 relative group">
                  <h2 className="text-xl font-bold text-slate-800 mb-4">Tools Covered</h2>
                  <div className="relative">
                    <div 
                      ref={toolsRef}
                      className="flex overflow-x-auto gap-4 snap-x snap-mandatory scrollbar-hide pb-4 pt-2 px-1"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                      {course.tools.map((tool, idx) => {
                        const toolName = typeof tool === 'object' && tool.name ? tool.name : typeof tool === 'string' ? tool : "Tool";
                        const toolImage = typeof tool === 'object' && tool.image ? tool.image : "https://cdn-icons-png.flaticon.com/512/1005/1005141.png";
                        
                        return (
                          <div key={idx} className="flex flex-col items-center justify-center gap-2 bg-white border border-slate-200 p-4 rounded-2xl min-w-[120px] w-[120px] shadow-sm hover:shadow-md transition-shadow snap-start shrink-0">
                            <img src={toolImage} alt={toolName} className="w-full h-12 object-contain mb-1" />
                            <span className="text-[13px] font-bold text-slate-700 text-center leading-tight">{toolName}</span>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Nav Arrows */}
                    {course.tools.length > 5 && (
                      <>
                        <button 
                          onClick={() => scrollTools('left')}
                          className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 bg-white border border-slate-200 shadow-md rounded-full p-1.5 text-slate-600 hover:text-blue-600 hover:border-blue-200 z-10 transition-colors opacity-0 group-hover:opacity-100 hidden md:block"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => scrollTools('right')}
                          className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 bg-white border border-slate-200 shadow-md rounded-full p-1.5 text-slate-600 hover:text-blue-600 hover:border-blue-200 z-10 transition-colors opacity-0 group-hover:opacity-100 hidden md:block"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Description (Admin description) placed after Tools Covered */}
              {course?.description && (
                <div className="mb-10 relative">
                  <h2 className="text-xl font-bold text-slate-800 mb-4">Description</h2>
                  <div className={`relative ${!showAllDescription ? "max-h-[140px] overflow-hidden" : ""}`}>
                    <div 
                      className="prose max-w-none text-slate-600 text-[15px] leading-relaxed [&>p]:mb-4 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>li]:mb-2"
                      dangerouslySetInnerHTML={renderHTML(course.description.replace(/<p><br><\/p>/g, ''))}
                    />
                  </div>
                  {!showAllDescription && (
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#f8fafc] via-[#f8fafc]/90 to-transparent flex items-end justify-center pb-0">
                      <button 
                        onClick={() => setShowAllDescription(true)} 
                        className="text-blue-600 font-bold hover:underline text-sm mb-1 bg-[#f8fafc] px-5 py-2 rounded-full shadow-sm border border-slate-200"
                      >
                        Read More
                      </button>
                    </div>
                  )}
                  {showAllDescription && (
                    <button 
                      onClick={() => setShowAllDescription(false)} 
                      className="mt-4 text-sm font-bold text-blue-600 hover:underline block w-full text-center"
                    >
                      Read Less
                    </button>
                  )}
                </div>
              )}

            </div>

            {/* Right Sidebar (Sticky) */}
            <div className="w-full lg:w-[340px] xl:w-[380px] shrink-0">
              <div className="sticky top-[40px] lg:top-[60px] bg-white rounded-xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden">
                <div className="relative w-full aspect-video bg-slate-50 p-2 border-b border-slate-100">
                  <img
                    src={imageUrl}
                    alt={course.title || "Course Cover"}
                    className="w-full h-full object-cover rounded-lg border-[3px] border-white shadow-sm"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-baseline gap-3 mb-6">
                    <span className="text-3xl font-bold text-slate-900 leading-none">
                      {course?.pricing?.finalPrice ? `₹${course.pricing.finalPrice}` : course?.price ? `₹${course.price}` : "Free"}
                    </span>
                    {course?.pricing?.finalPrice && course?.price && (
                      <span className="text-lg text-slate-400 line-through font-medium leading-none">
                        ₹{course.price}
                      </span>
                    )}
                  </div>
                  
                  <button 
                    onClick={handleBuyNow}
                    className="w-full py-3.5 px-6 bg-[#0056D2] hover:bg-[#004bb8] text-white text-[16px] font-bold rounded-lg transition-colors shadow-sm mb-6"
                  >
                    Buy Course
                  </button>
                  
                  <div className="space-y-4">
                    {course.duration && (
                      <div className="flex items-center justify-between text-[14px]">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Clock className="w-4 h-4" />
                          <span>Duration</span>
                        </div>
                        <span className="font-semibold text-slate-800">{course.duration}</span>
                      </div>
                    )}
                    {course.difficulty && (
                      <div className="flex items-center justify-between text-[14px]">
                        <div className="flex items-center gap-2 text-slate-600">
                          <BarChart className="w-4 h-4" />
                          <span>Difficulty Level</span>
                        </div>
                        <span className="font-semibold text-slate-800">{course.difficulty}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-[14px]">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Tv className="w-4 h-4" />
                        <span>Access</span>
                      </div>
                      <span className="font-semibold text-slate-800">Lifetime Access</span>
                    </div>
                    {course?.courseIncludes?.certificateOfCompletion && (
                      <div className="flex items-center justify-between text-[14px]">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Award className="w-4 h-4" />
                          <span>Certification</span>
                        </div>
                        <span className="font-semibold text-slate-800">Included</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Remaining Courses */}
        {relatedItems.length > 0 && (
          <section className="py-12 bg-transparent border-t border-slate-200">
            <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-8">More courses you might like</h2>
              <div className="relative group">
                <div 
                  ref={relatedRef}
                  className="flex overflow-x-auto gap-6 snap-x snap-mandatory scrollbar-hide pb-4 pt-2 px-1"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {relatedItems.map((item) => {
                    const itemImageUrl = item.media?.coverImage || item.media?.thumbnailImage || item.bannerImage || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80";
                    const itemPrice = item?.pricing?.finalPrice || item?.price;
                    return (
                      <Popover
                        key={item._id}
                        trigger="hover"
                        placement="right"
                        overlayStyle={{ maxWidth: 320 }}
                        styles={{ body: { borderRadius: 16, padding: 0, overflow: "hidden", border: "1px solid #cbd5e1", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" } }}
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
                          className="flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all min-w-[280px] w-[280px] sm:min-w-[300px] sm:w-[300px] snap-start shrink-0"
                        >
                          <div className="aspect-video bg-slate-100 relative w-full">
                            <img src={itemImageUrl} alt={item.title || "Course"} className="w-full h-full object-cover" />
                          </div>
                          <div className="p-5 flex flex-col flex-1">
                            <h3 className="font-bold text-slate-800 line-clamp-2 mb-2 text-[15px] leading-snug">{item.title}</h3>
                            <div className="flex items-center justify-between text-[13px] text-slate-500 mt-auto pt-4">
                              <span className="bg-slate-100 px-2 py-1 rounded text-xs font-semibold">{item.category || "General"}</span>
                              <span className="font-bold text-slate-900 text-base">{itemPrice ? `₹${itemPrice}` : "Free"}</span>
                            </div>
                          </div>
                        </div>
                      </Popover>
                    );
                  })}
                </div>
                {relatedItems.length > 4 && (
                  <>
                    <button 
                      onClick={() => scrollRelated('left')}
                      className="absolute left-0 top-1/2 -translate-y-1/2 -ml-5 bg-white border border-slate-200 shadow-md rounded-full p-2 text-slate-600 hover:text-blue-600 hover:border-blue-200 z-10 transition-colors opacity-0 group-hover:opacity-100 hidden md:block"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button 
                      onClick={() => scrollRelated('right')}
                      className="absolute right-0 top-1/2 -translate-y-1/2 -mr-5 bg-white border border-slate-200 shadow-md rounded-full p-2 text-slate-600 hover:text-blue-600 hover:border-blue-200 z-10 transition-colors opacity-0 group-hover:opacity-100 hidden md:block"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
      
      {/* Hide scrollbar styles globally for the tools container if needed */}
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
      `}} />
    </div>
  );
}
