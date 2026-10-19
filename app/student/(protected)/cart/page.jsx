"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Spin, message, Button, Input } from "antd";
import { FiTrash2 } from "react-icons/fi";
import { getCart, removeFromCart, addToCart } from "@/redux/slices/cartSlice";
import { getAllInternshipsOnly, getAllInternships, getAllCoursesOnly, getAllCourses } from "@/redux/slices/internship";
import { formatINR, stripHtml, formatUpdatedDate } from "@/utils/universalUtils/LibraryPage/helpers";
import { useAppRouter } from "@/helpers/useAppRouter";
import { useSearchParams } from "next/navigation";
import { Popover, Tooltip } from "antd";
import BuyNowPopoverContent from "@/utils/universalUtils/LibraryPage/BuyNowPopoverContent";
import { BsCheckCircleFill, BsBookmarkFill, BsBookmark, BsCodeSlash, BsClock, BsJournalBookmark, BsChevronRight, BsChevronLeft } from "react-icons/bs";
import StudentPageHeader from "@/modules/student/components/StudentPageHeader";
import axios from "axios";
import { restUrl } from "@/config/urls";
import { getLstorage } from "@/universalUtils/windowMW";

// Checkout APIs
const authHeaders = () => ({
  headers: { Authorization: `Bearer ${getLstorage("token")}` },
});
const createOrderApi = () => axios.post(`${restUrl}/payment/cart/createOrder`, {}, authHeaders());
const verifyPaymentApi = (payload) => axios.post(`${restUrl}/payment/cart/verify`, payload, authHeaders());

export default function CartPage() {
  const dispatch = useDispatch();
  const nav = useAppRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type") || "course"; // Default to course if not specified
  
  const allCartItems = useSelector((state) => state.cart?.items ?? []);
  const cartItems = useMemo(() => allCartItems.filter(item => (item.courseId?.type?.toLowerCase() || 'course') === typeParam), [allCartItems, typeParam]);
  const cartLoading = useSelector((state) => state.cart?.loading ?? false);
  
  const totalAmount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.discountedPrice ?? item.price ?? 0), 0);
  }, [cartItems]);
  
  const cartIdSet = useMemo(() => new Set(cartItems.map((i) => i.courseId?._id || i.courseId)), [cartItems]);
  
  const rawInternshipsOnly = useSelector((state) => state.internship?.allInternshipsOnly);
  const rawCoursesOnly = useSelector((state) => state.internship?.allCoursesOnly);
  const recommendedItemsRaw = typeParam === "internship" 
    ? (Array.isArray(rawInternshipsOnly) ? rawInternshipsOnly : (rawInternshipsOnly?.data || rawInternshipsOnly?.internships || []))
    : (Array.isArray(rawCoursesOnly) ? rawCoursesOnly : (rawCoursesOnly?.data || rawCoursesOnly?.courses || []));
    
  const rawEnrolledInternships = useSelector((state) => state.internship?.allInternships);
  const rawEnrolledCourses = useSelector((state) => state.internship?.allCourses);
  const enrolledInternships = Array.isArray(rawEnrolledInternships) ? rawEnrolledInternships : (rawEnrolledInternships?.data || []);
  const enrolledCourses = Array.isArray(rawEnrolledCourses) ? rawEnrolledCourses : (rawEnrolledCourses?.data || []);
  const enrolledIdSet = useMemo(() => new Set([...enrolledInternships, ...enrolledCourses].map(i => i._id)), [enrolledInternships, enrolledCourses]);
  
  const [removingId, setRemovingId] = useState(null);
  const [showCoupon, setShowCoupon] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  
  const scrollContainerRef = React.useRef(null);

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.firstElementChild?.offsetWidth || 300;
      scrollContainerRef.current.scrollBy({ left: cardWidth * 2, behavior: 'smooth' });
    }
  };
  
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.firstElementChild?.offsetWidth || 300;
      scrollContainerRef.current.scrollBy({ left: -(cardWidth * 2), behavior: 'smooth' });
    }
  };

  useEffect(() => {
    dispatch(getCart());
    if (typeParam === "internship") {
      dispatch(getAllInternshipsOnly({ limit: 20 }));
      dispatch(getAllInternships());
    } else {
      dispatch(getAllCoursesOnly({ limit: 20 }));
      dispatch(getAllCourses());
    }
  }, [dispatch, typeParam]);

  const handleAddToCart = async (courseId) => {
    try {
      await dispatch(addToCart(courseId)).unwrap();
      message.success("Added to cart");
    } catch (err) {
      message.error(err || "Failed to add to cart");
    }
  };

  const handleRemove = async (courseId) => {
    setRemovingId(courseId);
    try {
      await dispatch(removeFromCart(courseId)).unwrap();
      message.success("Removed from cart");
    } catch (err) {
      message.error(err || "Failed to remove item");
    } finally {
      setRemovingId(null);
    }
  };

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (typeof window !== "undefined" && window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleCheckout = async () => {
    if (!cartItems.length) return;
    
    setCheckingOut(true);
    try {
      const { data: order } = await createOrderApi();

      if (!order?.orderId) {
        message.success("Enrollment successful!");
        setCheckingOut(false);
        nav.push("/student/my-learning");
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        message.error("Unable to load payment gateway. Please try again.");
        setCheckingOut(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "SkillMedha",
        description: "Cart Checkout",
        order_id: order.orderId,
        handler: async function (response) {
          try {
            message.loading({ content: "Verifying payment...", key: "payment" });
            const { data } = await verifyPaymentApi({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (data?.success) {
              message.success({ content: "Payment verified successfully!", key: "payment" });
              dispatch(getCart());
              nav.push("/student/my-learning");
            } else {
              message.error({ content: "Payment verification failed.", key: "payment" });
            }
          } catch (error) {
            message.error({ content: "Verification error. Contact support.", key: "payment" });
          }
        },
        theme: { color: "#1E69DA" },
      });

      rzp.on("payment.failed", function (response) {
        message.error("Payment failed. Please try again.");
      });

      rzp.open();
    } catch (error) {
      message.error(error?.response?.data?.message || "Failed to initiate checkout");
    } finally {
      setCheckingOut(false);
    }
  };

  const totalOriginalPrice = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const course = item.courseId || {};
      const orig = Number(course?.pricing?.originalPrice) || Number(course?.price) || 0;
      return sum + (orig > 0 ? orig : (item.discountedPrice ?? item.price ?? 0));
    }, 0);
  }, [cartItems]);

  const totalDiscount = totalOriginalPrice > totalAmount 
    ? Math.round(((totalOriginalPrice - totalAmount) / totalOriginalPrice) * 100) 
    : 0;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 w-full relative">
      <div className="sticky top-0 z-50">
        <StudentPageHeader
          title="Shopping Cart"
          section={null}
          subtitle="Review your selected courses and proceed to checkout."
        />
      </div>
      
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <h2 className="text-[22px] font-bold text-slate-800 mb-6">{cartItems.length} {cartItems.length === 1 ? "Course" : "Courses"} in Cart</h2>
        
        {cartLoading ? (
          <div className="flex justify-center items-center py-20"><Spin size="large" /></div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold text-slate-700 mb-2">Your cart is empty.</h3>
            <p className="text-slate-500 mb-6">Keep shopping to find a course!</p>
            <Button type="primary" className="bg-[#1a56db]" onClick={() => nav.push("/student/course")}>Keep Shopping</Button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* Left Side: Cart Items List */}
            <div className="flex-1 w-full flex flex-col gap-4">
              {cartItems.map((item) => {
                const course = item.courseId || {};
                const courseId = course._id || item._id;
                
                const imageUrl = course?.media?.thumbnailImage || course?.media?.coverImage || course?.bannerImage || course?.image || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80";
                const price = item.discountedPrice ?? item.price ?? course?.pricing?.finalPrice ?? course?.pricing?.currentPrice ?? course?.price ?? 0;
                const originalPrice = Number(course?.pricing?.originalPrice) || Number(course?.price) || 0;
                
                const rating = course?.rating || (4 + Math.random() * 0.9).toFixed(1);
                const reviews = course?.reviews || Math.floor(Math.random() * 5000 + 500);
                
                return (
                  <div key={courseId} className="flex flex-col sm:flex-row gap-4 p-5 bg-white rounded-xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] relative">
                    <div className="w-[160px] h-[100px] shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                      <img src={imageUrl} alt={course.title} className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="flex-1 min-w-0 pr-4">
                      <h3 className="text-[17px] font-bold text-slate-800 line-clamp-2 leading-tight mb-1">{course.title}</h3>
                      <p className="text-[13px] text-slate-500 mb-2 truncate font-medium">By SkillMedha Academy</p>
                      
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wide">Bestseller</span>
                        <span className="text-amber-500 font-bold text-[12px]">⭐ {rating}</span>
                        <span className="text-slate-400 text-[12px]">({reviews.toLocaleString()} ratings)</span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 text-slate-500 text-[12px] font-medium">
                        <span>{course?.courseIncludes?.videoDuration || "2.5 total hours"}</span>
                        <span>•</span>
                        <span>{course?.sections?.length || 10} lectures</span>
                        <span>•</span>
                        <span>{course?.difficulty || "All Levels"}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col justify-start items-end sm:items-end gap-3 min-w-[140px] shrink-0">
                      <div className="flex flex-col items-end text-right w-full">
                        <span className="text-[20px] font-extrabold text-[#1a56db] leading-none mb-1">{formatINR(price)}</span>
                        {originalPrice > price && (
                          <span className="text-[13px] text-slate-400 line-through font-medium">{formatINR(originalPrice)}</span>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-1 items-end mt-auto text-[13px]">
                        <button 
                          onClick={() => handleRemove(courseId)}
                          disabled={removingId === courseId}
                          className="text-[#1a56db] hover:text-[#1e4eb8] font-medium bg-transparent border-none cursor-pointer transition-colors"
                        >
                          {removingId === courseId ? "Removing..." : "Remove"}
                        </button>
                        <button className="text-[#1a56db] hover:text-[#1e4eb8] font-medium bg-transparent border-none cursor-pointer transition-colors">Move to Wishlist</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Side: Checkout Summary */}
            <div className="w-full lg:w-[320px] shrink-0">
              <div className="text-slate-500 text-lg font-bold mb-1">Total:</div>
              <div className="text-[36px] font-extrabold text-slate-900 leading-none mb-2">
                {formatINR(totalAmount)}
              </div>
              {totalOriginalPrice > totalAmount && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-slate-400 line-through text-base font-medium">{formatINR(totalOriginalPrice)}</span>
                  <span className="text-slate-500 text-[15px] font-medium">{totalDiscount}% off</span>
                </div>
              )}
              
              <Button 
                type="primary" 
                size="large" 
                className="w-full bg-[#1a56db] hover:bg-[#1e4eb8] text-white font-bold h-12 text-base rounded-[4px] border-none shadow-md mb-3"
                onClick={handleCheckout}
                loading={checkingOut}
              >
                Proceed to Checkout →
              </Button>
              <p className="text-[11px] text-slate-400 mb-6 text-center font-medium">You won't be charged yet</p>
              
              <div className="w-full border-t border-slate-200 pt-6">
                {!showCoupon ? (
                  <Button 
                    type="primary" 
                    size="large" 
                    className="w-full bg-white border border-[#1a56db] text-[#1a56db] hover:bg-[#f0f5ff] hover:text-[#1a56db] hover:border-[#1e4eb8] font-bold h-12 text-base rounded-[4px] shadow-sm mb-3 transition-colors"
                    onClick={() => setShowCoupon(true)}
                  >
                    Apply Coupon
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 mb-3">
                    <Input placeholder="Enter Coupon" className="rounded-[4px] h-12 border-slate-300 font-medium text-base flex-1" />
                    <Button type="primary" size="large" className="bg-[#1a56db] hover:bg-[#1e4eb8] text-white font-bold h-12 px-6 text-base rounded-[4px] border-none shadow-sm">
                      Apply
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Recommended Section */}
        {recommendedItemsRaw.length > 0 && (
          <div className="mt-16 pt-8 border-t border-slate-200 relative">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">You might also like</h3>
            </div>
            
            <div className="relative group/carousel">
              <div 
                ref={scrollContainerRef} 
                className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 px-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <style dangerouslySetInnerHTML={{__html: `
                  .hide-scrollbar::-webkit-scrollbar { display: none; }
                `}} />
                {recommendedItemsRaw
                  .filter(item => !enrolledIdSet.has(item._id))
                  .map((item) => {
                  const imageUrl = item?.media?.thumbnailImage || item?.media?.coverImage || item?.bannerImage || item?.image || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80";
                  const title = item?.title || item?.courseName || item?.internshipTitle || item?.internshipName || "Untitled";
                  const isInCart = cartIdSet.has(item._id);
                  const duration = item?.duration || item?.courseIncludes?.videoDuration;
                  const modulesCount = item?.sections?.length || 0;
                  const createdAtDate = item?.createdAt ? formatUpdatedDate(item.createdAt) : "";

                  return (
                    <div key={item._id} className="min-w-[280px] w-[280px] sm:min-w-[320px] sm:w-[320px] lg:min-w-[300px] lg:w-[300px] xl:min-w-[320px] xl:w-[320px] flex-shrink-0 snap-start hide-scrollbar">
                      <Popover 
                        placement="right" 
                        content={
                          <BuyNowPopoverContent 
                            item={item} 
                            isInCart={isInCart} 
                            cartLoading={cartLoading}
                            onAddToCart={(it) => {
                              if (isInCart) {
                                nav.push("/student/cart?type=" + typeParam);
                              } else {
                                handleAddToCart(it._id);
                              }
                            }}
                          />
                        }
                        overlayInnerStyle={{ padding: 0, borderRadius: 16, overflow: "hidden" }}
                        mouseEnterDelay={0.3}
                        mouseLeaveDelay={0.2}
                      >
                      <div 
                        className="group flex flex-col bg-white border border-slate-100 rounded-[24px] overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] shadow-[0_4px_20px_rgba(0,0,0,0.03)] relative h-full"
                        onClick={() => handleAddToCart(item._id)}
                      >
                        {/* Inner ambient glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-blue-500/10 transition-colors" />

                        {/* Card Image Wrapper */}
                        <div className="relative w-full h-[180px] p-3 pb-0 z-10 shrink-0">
                          <div className="relative w-full h-full rounded-[18px] overflow-hidden bg-white border border-slate-100/50 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                            <img src={imageUrl} alt={title} className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />
                            
                            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 shadow-sm">
                              <BsCodeSlash className="text-blue-300 text-[12px]" />
                              <span className="text-white text-[11px] font-semibold tracking-wide">{item.category || "General"}</span>
                            </div>
                            
                            {item.difficulty && (
                              <div className={`absolute bottom-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase backdrop-blur-md border border-white/10 shadow-sm ${
                                item.difficulty?.toLowerCase() === "beginner" ? "bg-emerald-500/80 text-white" :
                                item.difficulty?.toLowerCase() === "intermediate" ? "bg-orange-500/80 text-white" :
                                "bg-red-500/80 text-white"
                              }`}>
                                {item.difficulty}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="flex flex-col p-5 flex-1 z-10">
                          <Tooltip title={title} placement="topLeft" mouseEnterDelay={0.5}>
                            <h3 className="text-[17px] font-[800] text-slate-800 leading-[22px] mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors min-h-[44px]">
                              {title}
                            </h3>
                          </Tooltip>

                          <p className="text-slate-500 text-[12px] font-medium leading-relaxed mb-4 line-clamp-2 min-h-[36px]">
                            {stripHtml(item?.description)}
                          </p>

                          {/* Meta Row */}
                          <div className="flex flex-wrap items-center gap-2 mb-4">
                            {duration && (
                              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider border border-slate-100">
                                <BsClock className="text-blue-500/70 text-[12px]" /> {duration}
                              </div>
                            )}
                            {modulesCount > 0 && (
                              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider border border-slate-100">
                                <BsJournalBookmark className="text-purple-500/70 text-[12px]" /> {modulesCount} mod
                              </div>
                            )}
                            {createdAtDate && (
                              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider border border-slate-100 ml-auto">
                                {createdAtDate}
                              </div>
                            )}
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                            <span className="text-[12px] font-bold flex items-center gap-1.5 text-slate-400">
                              Not started
                            </span>
                            <button
                              className="group/btn bg-white hover:bg-slate-50 text-slate-700 text-[13px] font-[800] py-2 px-5 rounded-xl border border-slate-200 cursor-pointer transition-all flex items-center gap-2 shadow-sm hover:shadow hover:-translate-y-0.5 hover:text-blue-600 hover:border-blue-200"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isInCart) {
                                  nav.push("/student/cart?type=" + typeParam);
                                } else {
                                  handleAddToCart(item._id);
                                }
                              }}
                            >
                              {cartLoading ? "Adding..." : isInCart ? "Go to Cart" : "Add to Cart"}
                            </button>
                          </div>
                        </div>
                      </div>
                      </Popover>
                    </div>
                  );
                })}
              </div>
              
              {/* Overlay side arrow button right on top of the last visible card edge */}
              <button 
                onClick={scrollRight} 
                className="absolute right-0 top-[50%] -translate-y-[50%] translate-x-[20%] md:translate-x-[40%] w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-blue-600 hover:scale-110 transition-all shadow-lg cursor-pointer bg-white z-20 opacity-0 group-hover/carousel:opacity-100 hidden md:flex"
              >
                <BsChevronRight className="text-xl" />
              </button>
              
              {/* Overlay side arrow button left on top of the first visible card edge */}
              <button 
                onClick={scrollLeft} 
                className="absolute left-0 top-[50%] -translate-y-[50%] -translate-x-[20%] md:-translate-x-[40%] w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-blue-600 hover:scale-110 transition-all shadow-lg cursor-pointer bg-white z-20 opacity-0 group-hover/carousel:opacity-100 hidden md:flex"
              >
                <BsChevronLeft className="text-xl" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
