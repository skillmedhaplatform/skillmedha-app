import React, { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Pagination, Tooltip, Button, Select, Input, Modal, Tag, Row, Col, message, Badge, Popover } from "antd";
import { SearchOutlined, InfoCircleOutlined, CheckCircleOutlined, HeartOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { BsBookmark, BsBookmarkFill, BsCheckCircleFill, BsCodeSlash, BsBarChartFill, BsCpuFill, BsBook, BsClock, BsJournalBookmark, BsBriefcase } from "react-icons/bs";
import { HiOutlineBuildingOffice2, HiOutlineBookOpen } from "react-icons/hi2";
import { useSearchParams, usePathname } from "next/navigation";
import { useAppRouter } from "@/helpers/useAppRouter";
import CourseCardSkeleton from "@/universalUtils/CourseCardSkeleton/CourseCardSkeleton";
import useResponsive from "@/hooks/useResponsive";
import MobileLibraryPage from "@/mobile_views/library/MobileLibraryPage";
import { getOneInternsip } from "@/redux/slices/internship";
import { getWishlist, addToWishlist, removeFromWishlist } from "@/redux/slices/wishlistSlice";
import { getCart, addToCart } from "@/redux/slices/cartSlice";
import WishlistDrawer from "./WishlistDrawer";
import CartDrawer from "./CartDrawer";
import BuyNowPopoverContent from "./BuyNowPopoverContent";
import PriceChip from "./PriceChip";

// --- Helpers ---
const stripHtml = (html) =>
  typeof html === "string" ? html.replace(/<[^>]*>/g, "") : "";

const getCardTheme = (category, index) => {
  const themes = [
    { bg: "linear-gradient(135deg, #0e1e3e, #1a3673)", icon: <BsCodeSlash size={32} color="white" /> },
    { bg: "linear-gradient(135deg, #2a0a4a, #4a158a)", icon: <BsBarChartFill size={32} color="white" /> },
    { bg: "linear-gradient(135deg, #0a3a2a, #156a4a)", icon: <BsCpuFill size={32} color="white" /> },
    { bg: "linear-gradient(135deg, #4a2a0a, #8a4a15)", icon: <BsBook size={32} color="white" /> },
  ];
  return themes[index % themes.length];
};

const formatUpdatedDate = (dateInput) => {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  return isNaN(d.getTime())
    ? ""
    : d.toLocaleString("en-IN", { month: "short", year: "numeric" });
};

// --- Info Popover content ---
const InfoContent = ({ item }) => {
  const ci = item?.courseIncludes || {};
  const difficultyColorMap = {
    Beginner: "green",
    Intermediate: "blue",
    Advanced: "orange",
    Expert: "red",
  };

  const boxStyle = {
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "20px",
    marginBottom: "8px",
    backgroundColor: "#ffffff",
    boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, overflowX: "hidden" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, paddingBottom: 16, borderBottom: "1px solid #f0f0f0" }}>
        {item?.category && <Tag color="geekblue" style={{ fontSize: 14, padding: "2px 8px" }}>{item.category}</Tag>}
        {item?.difficulty && <Tag color={difficultyColorMap[item.difficulty] || "default"} style={{ fontSize: 14, padding: "2px 8px" }}>{item.difficulty}</Tag>}
        {item?.language && <Tag color="default" style={{ fontSize: 14, padding: "2px 8px" }}>🌐 {item.language}</Tag>}
        {item?.duration && <Tag color="cyan" style={{ fontSize: 14, padding: "2px 8px" }}>⏱ {item.duration}</Tag>}
        {item?.sections?.length ? <Tag color="purple" style={{ fontSize: 14, padding: "2px 8px" }}>📚 {item.sections.length} Modules</Tag> : null}
        {ci.videoDuration && <Tag color="cyan" style={{ fontSize: 14, padding: "2px 8px" }}>🎥 {ci.videoDuration}</Tag>}
        {item?.featured && <Tag color="gold" style={{ fontSize: 14, padding: "2px 8px" }}>⭐ Featured</Tag>}
        {item?.trending && <Tag color="red" style={{ fontSize: 14, padding: "2px 8px" }}>🔥 Trending</Tag>}
      </div>

      <Row gutter={[24, 12]} style={{ margin: 0 }}>
        <Col xs={24} md={14} style={{ paddingLeft: 0 }}>
          {item?.learningPoints?.length > 0 && (
            <div style={boxStyle}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#1f2937", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                What you'll learn
              </div>
              <Row gutter={[16, 16]}>
                {item.learningPoints.slice(0, 8).map((point, i) => (
                  <Col span={12} key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <CheckCircleOutlined style={{ color: "#24A058", marginTop: 5, fontSize: 16 }} />
                    <span style={{ fontSize: 15, color: "#4b5563", lineHeight: 1.6 }}>{point}</span>
                  </Col>
                ))}
              </Row>
            </div>
          )}

          {(ci.certificateOfCompletion || ci.lifetimeAccess || ci.articles || ci.codingExercises || ci.quizzes || ci.downloadableResources) && (
            <div style={boxStyle}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#1f2937", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                This Course Includes
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {ci.certificateOfCompletion && <Tag color="green" style={{ fontSize: 14, padding: "2px 8px" }}>🏅 Certificate</Tag>}
                {ci.lifetimeAccess && <Tag color="green" style={{ fontSize: 14, padding: "2px 8px" }}>♾ Lifetime Access</Tag>}
                {ci.jobAssistance && <Tag color="green" style={{ fontSize: 14, padding: "2px 8px" }}>💼 Job Assistance</Tag>}
                {ci.articles && <Tag style={{ fontSize: 14, padding: "2px 8px" }}>{ci.articles} Articles</Tag>}
                {ci.quizzes && <Tag style={{ fontSize: 14, padding: "2px 8px" }}>{ci.quizzes} Quizzes</Tag>}
                {ci.codingExercises && <Tag style={{ fontSize: 14, padding: "2px 8px" }}>{ci.codingExercises} Exercises</Tag>}
                {ci.downloadableResources && <Tag style={{ fontSize: 14, padding: "2px 8px" }}>{ci.downloadableResources} Resources</Tag>}
              </div>
            </div>
          )}
        </Col>

        <Col xs={24} md={10} style={{ paddingRight: 0 }}>
          {item?.toolsWithIcons?.length > 0 && (
            <div style={boxStyle}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#1f2937", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Tools & Technologies
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
                {item.toolsWithIcons.slice(0, 8).map((tool, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, backgroundColor: "#f3f4f6", padding: "6px 12px", borderRadius: "6px" }}>
                    {tool.icon && <img src={tool.icon} alt={tool.name} style={{ width: 18, height: 18, objectFit: "contain" }} />}
                    <span style={{ color: "#374151", fontWeight: 500 }}>{tool.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {item?.preRequisites?.length > 0 && (
            <div style={boxStyle}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#1f2937", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Prerequisites
              </div>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 15, color: "#4b5563", lineHeight: 1.6 }}>
                {item.preRequisites.map((req, i) => <li key={i} style={{ marginBottom: 6 }}>{req}</li>)}
              </ul>
            </div>
          )}

          {item?.targetAudience?.length > 0 && (
            <div style={boxStyle}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#1f2937", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Who is this for
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {item.targetAudience.map((a, i) => (
                  <Tag key={i} style={{ fontSize: 14, color: "#4b5563", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "2px 8px" }}>
                    {a}
                  </Tag>
                ))}
              </div>
            </div>
          )}
        </Col>
      </Row>

      {item?.updatedAt && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #f0f0f0", fontSize: 13, color: "#9ca3af" }}>
          Last updated: {formatUpdatedDate(item.updatedAt)}
        </div>
      )}
    </div>
  );
};

const MobileLibraryPageWrapper = ({ title, items, ...props }) => {
  return <MobileLibraryPage title={title} items={items} {...props} />;
};

const LibraryPage = ({
  title,
  fetchAction,          // my courses thunk (getAllCourses)
  getAllCoursesOnly,    // all courses thunk (getAllCoursesOnly) — optional
  dataSelector,         // selector for my courses data array
  paginationSelector,   // selector for my courses pagination
  allCoursesSelector,   // selector for all courses array — optional
  allPaginationSelector,
  getItemUrl,
  viewLabel = "View",
  searchPlaceholder = "Search…",
  idPrefix = "lib",
  renderMetaChips,
  showWishlist = false,  // NEW: toggle to enable/disable wishlist (favorites) feature
  showBuyNow = false,    // NEW: toggle to enable/disable Cart / Buy Now feature
}) => {
  const nav = useAppRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const dispatch = useDispatch();
const userId=sessionStorage?.studentId || '68875578d529f1c0ecf687e1'
  // My courses data (from getAllCourses / getAllInternships)
  const items = useSelector(dataSelector);

  // All courses data (from getAllCoursesOnly) — safe fallback if selector not provided
  const allItems = useSelector(allCoursesSelector || (() => []));

  const paginationData = useSelector(paginationSelector);

  // --- Wishlist (favorites) state ---
  const wishlistItems = useSelector((state) => state.wishlist?.items ?? []);
  const wishlistLoading = useSelector((state) => state.wishlist?.loading ?? false);
  const wishlistPendingIds = useSelector((state) => state.wishlist?.pendingIds ?? []);
  const [wishlistOpen, setWishlistOpen] = useState(false);

  const wishlistIdSet = useMemo(
    () => new Set(wishlistItems.map((i) => i.courseId?._id || i.courseId)),
    [wishlistItems]
  );

  useEffect(() => {
    if (showWishlist) {
      dispatch(getWishlist());
    }
  }, [dispatch, showWishlist]);

  const handleWishlistToggle = async (item, e) => {
    e?.stopPropagation?.();
    const courseId = item?._id;
    if (!courseId) return;

    try {
      if (wishlistIdSet.has(courseId)) {
        await dispatch(removeFromWishlist(courseId)).unwrap();
        message.success("Removed from wishlist");
      } else {
        await dispatch(addToWishlist(courseId)).unwrap();
        message.success("Added to wishlist");
      }
    } catch (err) {
      message.error(err || "Something went wrong");
    }
  };

  // --- Cart / Buy Now state ---
  const cartItems = useSelector((state) => state.cart?.items ?? []);
  const cartTotalAmount = useSelector((state) => state.cart?.totalAmount ?? 0);
  const cartLoading = useSelector((state) => state.cart?.loading ?? false);
  const cartPendingIds = useSelector((state) => state.cart?.pendingIds ?? []);
  const [cartOpen, setCartOpen] = useState(false);

  const cartIdSet = useMemo(
    () => new Set(cartItems.map((i) => i.courseId?._id || i.courseId)),
    [cartItems]
  );

  useEffect(() => {
    if (showBuyNow) {
      dispatch(getCart());
    }
  }, [dispatch, showBuyNow]);

  // Add to cart; if item already in cart, just open the drawer instead of re-adding
  const handleAddToCart = async (item, e) => {
    e?.stopPropagation?.();
    const courseId = item?._id;
    if (!courseId) return;

    if (cartIdSet.has(courseId)) {
      setCartOpen(true);
      return;
    }

    try {
      await dispatch(addToCart(courseId)).unwrap();
      message.success("Added to cart");
      setCartOpen(true);
    } catch (err) {
      message.error(err || "Failed to add to cart");
    }
  };

  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("limit") || "6", 10);
  const urlSearch = searchParams.get("search") || "";
  const urlCategory = searchParams.get("category") || "";
  const urlDifficulty = searchParams.get("difficulty") || "";

  const [searchInput, setSearchInput] = useState(urlSearch);
  const debounceRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);

  // NEW: per-course progress map, keyed by course id.
  // Shape per entry: { completedCount, totalCount, totalProgress, loading }
  const [progressById, setProgressById] = useState({});
  // Tracks which course ids we've already requested (or are requesting) so we
  // don't re-fire the same call every render / tab switch / pagination change.
  const requestedIdsRef = useRef(new Set());

  useEffect(() => {
    setSearchInput(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    setLoading(true);

    const calls = [
      dispatch(fetchAction({
        page: currentPage,
        limit: pageSize,
        searchTerm: urlSearch,
        category: urlCategory,
        difficulty: urlDifficulty,
      })),
    ];

    // Only dispatch getAllCoursesOnly if it was passed as a prop
    if (getAllCoursesOnly) {
      calls.push(
        dispatch(getAllCoursesOnly({
          page: currentPage,
          limit: 1000,
          searchTerm: urlSearch,
          category: urlCategory,
          difficulty: urlDifficulty,
        }))
      );
    }

    Promise.all(calls).finally(() => setLoading(false));
  }, [dispatch, fetchAction, getAllCoursesOnly, currentPage, pageSize, urlSearch, urlCategory, urlDifficulty]);

  const pushParams = useCallback(
    (updates) => {
      const params = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([k, v]) => {
        if (v) params.set(k, v);
        else params.delete(k);
      });
      if (Object.keys(updates).some((k) => k !== "page" && k !== "limit")) {
        params.set("page", "1");
      }
      nav.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, nav]
  );

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      pushParams({ search: val });
    }, 400);
  };

  const handleDifficultyChange = (val) => pushParams({ difficulty: val });

  const handleClearAll = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("search");
    params.delete("category");
    params.delete("difficulty");
    params.set("page", "1");
    setSearchInput("");
    nav.push(`${pathname}?${params.toString()}`);
  };

  const handleCategoryChange = (val) => pushParams({ category: val || "" });

  const removeFilter = (key) => {
    if (key === "search") setSearchInput("");
    pushParams({ [key]: "" });
  };

  const handlePageChange = (page, size) => {
    pushParams({ page: page.toString(), limit: size.toString() });
  };

  // safeItems = my courses (enrolled)
  const safeItems = Array.isArray(items) ? items : [];

  // safeAllItems = all courses from getAllCoursesOnly API: response is { data: [...], hasNext: bool }
  // allItems in redux is already payload.data (array) after slice handles it
  const safeAllItems = Array.isArray(allItems) ? allItems : [];

  // Tab filtering:
  // "all"       → show all courses from getAllCoursesOnly API
  // "my"        → show my enrolled courses from getAllCourses API
  // "recent"    → filter all courses created in last 6 months
  // "wishlist"  → show only courses that are in the wishlist
  const filteredTabItems = (() => {
    if (activeTab === "all") {
      return safeAllItems;
    }

    if (activeTab === "my") {
      return safeItems;
    }

    if (activeTab === "recent") {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      return safeAllItems.filter((item) => {
        if (!item.createdAt) return false;
        return new Date(item.createdAt) >= sixMonthsAgo;
      });
    }

    if (activeTab === "wishlist") {
      const pool = safeAllItems.length ? safeAllItems : safeItems;
      return pool.filter((item) => wishlistIdSet.has(item._id));
    }

    return [];
  })();

  // NEW: helper to resolve the org id for a given course item.
  // "My courses" payloads carry sourceOrgId; "all courses" payloads only have
  // assignedOrgs. Try both so this works regardless of which API produced the card.
  const resolveOrgId = (item) => item?.sourceOrgId || item?.assignedOrgs?.[0] || null;

  // NEW: fetch per-course progress for every item currently visible on this tab.
  // Fires one getOneInternsip call per course (in parallel), skipping ids we've
  // already requested so tab switches / re-renders don't re-trigger duplicate calls.
  useEffect(() => {
    if (!userId) return;

    const itemsNeedingProgress = filteredTabItems.filter((item) => {
      const courseId = item?._id;
      if (!courseId) return false;
      if (requestedIdsRef.current.has(courseId)) return false;
      const orgId = resolveOrgId(item);
      if (!orgId) return false;
      return true;
    });

    if (itemsNeedingProgress.length === 0) return;

    itemsNeedingProgress.forEach((item) => {
      const courseId = item._id;
      const orgId = resolveOrgId(item);

      requestedIdsRef.current.add(courseId);
      setProgressById((prev) => ({
        ...prev,
        [courseId]: { ...(prev[courseId] || {}), loading: true },
      }));

      dispatch(getOneInternsip({ id: courseId, orgId, userId }))
        .then((res) => {
          // Adjust this unwrap to match your thunk's actual return shape
          // (e.g. res.payload vs res for non-RTK dispatchers).
          const payload = res?.payload ?? res;
          setProgressById((prev) => ({
            ...prev,
            [courseId]: {
              completedCount: payload?.completedCount ?? 0,
              totalCount: payload?.totalCount ?? 0,
              totalProgress: payload?.totalProgress ?? 0,
              loading: false,
            },
          }));
        })
        .catch(() => {
          setProgressById((prev) => ({
            ...prev,
            [courseId]: { ...(prev[courseId] || {}), loading: false, error: true },
          }));
        });
    });
    // filteredTabItems is intentionally not a stable reference across renders,
    // so we depend on the tab + underlying source arrays instead to avoid
    // re-running this effect every render.
  }, [activeTab, safeItems, safeAllItems, userId, dispatch]);

  // Categories from current tab items for pill bar
  const categoryOptions = useMemo(() => {
    const source = activeTab === "my" ? safeItems : safeAllItems;
    return [...new Set(source.map((item) => item.category).filter(Boolean))].map((cat) => ({
      label: cat,
      value: cat,
    }));
  }, [safeItems, safeAllItems, activeTab]);

  const difficultyOptions = [
    { label: "Beginner", value: "Beginner" },
    { label: "Intermediate", value: "Intermediate" },
    { label: "Advanced", value: "Advanced" },
  ];

  const activeFilters = [
    urlSearch && { key: "search", label: `Search: "${urlSearch}"` },
    urlCategory && { key: "category", label: `Category: ${urlCategory}` },
    urlDifficulty && { key: "difficulty", label: `Difficulty: ${urlDifficulty}` },
  ].filter(Boolean);

  const hasActiveFilters = activeFilters.length > 0;

  // Stats for banner
  const totalAvailable = safeAllItems.length || paginationData?.totalLength || 0;
  // NEW: "enrolled" + "progress" now read from the fetched progressById map,
  // falling back to the old item-shape checks for items we haven't fetched yet.
  const enrolledItems = safeItems.filter((item) => {
    const fetched = progressById[item._id];
    if (fetched) return fetched.totalCount > 0;
    return item.progress !== undefined || item.lastAccessedSection !== undefined || item.enrolled;
  });
  const totalEnrolled = enrolledItems.length;
  const avgProgress =
    totalEnrolled > 0
      ? Math.round(
          enrolledItems.reduce((acc, curr) => {
            const fetched = progressById[curr._id];
            const val = fetched ? fetched.totalProgress : curr.progress || 0;
            return acc + val;
          }, 0) / totalEnrolled
        )
      : 0;

  const isCourse = title ? title.toLowerCase().includes("course") : false;
  const moduleName = isCourse ? "courses" : "internships";

  const isMobile = useResponsive();

  if (isMobile) {
    return (
      <MobileLibraryPageWrapper
        title={title}
        viewLabel={viewLabel}
        searchPlaceholder={searchPlaceholder}
        idPrefix={idPrefix}
        renderMetaChips={renderMetaChips}
        getItemUrl={getItemUrl}
        items={filteredTabItems}
        loading={loading}
        paginationData={paginationData}
        searchInput={searchInput}
        handleSearchChange={handleSearchChange}
        urlCategory={urlCategory}
        urlDifficulty={urlDifficulty}
        categoryOptions={categoryOptions}
        difficultyOptions={difficultyOptions}
        activeFilters={activeFilters}
        hasActiveFilters={hasActiveFilters}
        handleCategoryChange={handleCategoryChange}
        handleDifficultyChange={handleDifficultyChange}
        handleClearAll={handleClearAll}
        removeFilter={removeFilter}
        pushParams={pushParams}
        currentPage={currentPage}
        pageSize={pageSize}
        handlePageChange={handlePageChange}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        nav={nav}
        progressById={progressById}
        showWishlist={showWishlist}
        wishlistIdSet={wishlistIdSet}
        wishlistPendingIds={wishlistPendingIds}
        onWishlistToggle={handleWishlistToggle}
        showBuyNow={showBuyNow}
        cartIdSet={cartIdSet}
        cartPendingIds={cartPendingIds}
        onAddToCart={handleAddToCart}
      />
    );
  }

  return (
    <div className="flex flex-col gap-0 relative bg-[#EFF5FB] min-h-screen">
      {/* Banner */}
      <div className="w-full h-[140px] min-h-[140px] flex flex-col justify-between p-4 lg:px-8 pt-6 shadow-sm rounded-2xl lg:rounded-none bg-gradient-to-br from-[#071631] to-[#10254c] text-white shrink-0 relative overflow-hidden z-[2]">
        <div className="absolute inset-0 pointer-events-none z-[1]">
          <div className="absolute top-[20%] right-[10%] text-[#1E69DA] opacity-60 text-[1.2rem]">✕</div>
          <div className="absolute bottom-[20%] right-[30%] text-[#1E69DA] opacity-50 text-[1.5rem]">+</div>
          <div className="absolute top-[40%] right-[50%] text-[#1E69DA] opacity-50 text-[1.1rem]">★</div>
          <div className="absolute bottom-[30%] right-[5%] text-[#1E69DA] opacity-60 text-[1.3rem]">✕</div>
        </div>

        <div className="flex items-center justify-between w-full relative z-[2]">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-[56px] h-[56px] bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10 shrink-0">
              {moduleName.toLowerCase().includes("internship") ? (
                <HiOutlineBuildingOffice2 className="text-white text-3xl" />
              ) : (
                <HiOutlineBookOpen className="text-white text-3xl" />
              )}
            </div>
            <div className="flex flex-col justify-center gap-1">
              <h1 className="text-[24px] lg:text-[28px] font-bold text-white m-0 tracking-tight leading-none flex items-center gap-3 pb-0" style={{ border: "none", marginBottom: 0 }}>
                {title}
              </h1>
              <p className="text-white/90 text-[14px] lg:text-[15px] m-0 leading-tight" style={{ marginTop: 0 }}>
                Explore all available {moduleName.toLowerCase()} and{" "}
                {moduleName.toLowerCase().includes("internship") ? "kickstart your career" : "start learning"} today.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 lg:gap-10">
            {showWishlist && (
              <Badge count={wishlistItems.length} size="small" offset={[-4, 4]}>
                <button
                  onClick={() => setWishlistOpen(true)}
                  className="flex flex-col items-center justify-center bg-transparent border-none cursor-pointer group"
                >
                  <HeartOutlined className="text-white text-[22px] group-hover:text-[#f87171] transition-colors" />
                  <span className="text-[10px] text-[#94a3b8] font-bold tracking-wider uppercase mt-1.5">Wishlist</span>
                </button>
              </Badge>
            )}
            {showBuyNow && (
              <Badge count={cartItems.length} size="small" offset={[-4, 4]}>
                <button
                  onClick={() => setCartOpen(true)}
                  className="flex flex-col items-center justify-center bg-transparent border-none cursor-pointer group"
                >
                  <ShoppingCartOutlined className="text-white text-[22px] group-hover:text-[#5694F0] transition-colors" />
                  <span className="text-[10px] text-[#94a3b8] font-bold tracking-wider uppercase mt-1.5">Cart</span>
                </button>
              </Badge>
            )}
            <div className="flex flex-col items-center justify-center">
              <span className="text-[24px] lg:text-[28px] font-bold text-white leading-none">{totalEnrolled}</span>
              <span className="text-[10px] text-[#94a3b8] font-bold tracking-wider uppercase mt-1.5">Enrolled</span>
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-[24px] lg:text-[28px] font-bold text-white leading-none">{totalAvailable}</span>
              <span className="text-[10px] text-[#94a3b8] font-bold tracking-wider uppercase mt-1.5">Available</span>
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-[24px] lg:text-[28px] font-bold leading-none bg-gradient-to-br from-[#1E69DA] to-[#5694F0] bg-clip-text text-transparent">{avgProgress}%</span>
              <span className="text-[10px] text-[#94a3b8] font-bold tracking-wider uppercase mt-1.5">Avg. Done</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="w-full bg-[#f1f5f9] border-b border-[#e2e8f0] px-4 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between shadow-sm gap-2 md:gap-0">
        <div className="flex items-center gap-8">
          {[
            { id: "all", label: `All ${moduleName.toLowerCase().includes("internship") ? "internships" : "courses"}` },
            { id: "my", label: `My ${moduleName.toLowerCase().includes("internship") ? "internships" : "courses"}` },
            { id: "recent", label: "Recently added" },
            ...(showWishlist ? [{ id: "wishlist", label: `Wishlist (${wishlistItems.length})` }] : []),
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-1 text-[15px] font-bold transition-all relative border-none bg-transparent cursor-pointer ${
                activeTab === tab.id ? "text-[#1E69DA]" : "text-[#64748b] hover:text-[#334155]"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1E69DA] rounded-t-md"></div>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 py-2 md:py-0">
          <Input
            id={`${idPrefix}-search`}
            prefix={<SearchOutlined style={{ color: "#1E69DA" }} />}
            placeholder={searchPlaceholder}
            value={searchInput}
            onChange={handleSearchChange}
            allowClear
            onClear={() => pushParams({ search: "" })}
            className="w-[160px] rounded-[20px] shadow-sm border-[#e2e8f0] [&>input]:text-[#64748b] [&>input]:font-medium [&>input::placeholder]:text-[#94a3b8]"
            style={{ color: "#64748b" }}
          />
          <Select
            id={`${idPrefix}-difficulty`}
            placeholder="All Levels"
            value={urlDifficulty || undefined}
            onChange={handleDifficultyChange}
            allowClear
            options={difficultyOptions}
            className="w-[130px] shadow-sm rounded-[20px] [&_.ant-select-selection-item]:text-[#64748b] [&_.ant-select-selection-item]:font-medium [&_.ant-select-selection-placeholder]:text-[#94a3b8]"
            popupMatchSelectWidth={false}
          />
          {hasActiveFilters && (
            <Button type="text" danger size="middle" onClick={handleClearAll} className="font-medium hover:bg-red-50 rounded-lg px-2">
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Categories Pill Bar */}
      <div className="w-full px-4 lg:px-8 py-3 bg-white border-b border-[#e2e8f0] flex items-center gap-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => pushParams({ category: "" })}
          className={`shrink-0 flex items-center gap-2 px-4 py-1.5 rounded-md text-[14px] font-medium transition-all duration-300 cursor-pointer ${
            !urlCategory
              ? "bg-[#3b82f6] border border-transparent text-white shadow-sm hover:bg-[#2563eb]"
              : "bg-white border border-[#3b82f6] text-[#3b82f6] hover:bg-[#eff6ff]"
          }`}
        >
          <span className={!urlCategory ? "text-white" : "text-[#3b82f6]"}>☷</span> All categories
        </button>
        {categoryOptions.map((cat) => {
          const isActive = urlCategory === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => pushParams({ category: cat.value })}
              className={`shrink-0 flex items-center gap-2 px-4 py-1.5 rounded-md text-[14px] font-medium transition-all duration-300 cursor-pointer ${
                isActive
                  ? "bg-[#3b82f6] border border-transparent text-white shadow-sm hover:bg-[#2563eb]"
                  : "bg-white border border-[#3b82f6] text-[#3b82f6] hover:bg-[#eff6ff]"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Cards Grid */}
      <div className="w-full flex-1 mb-8 pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 lg:gap-x-16 gap-y-8 p-2 px-4 lg:px-6 max-w-[1500px] mx-auto w-full">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <CourseCardSkeleton key={i} />)
          ) : !filteredTabItems?.length ? (
            <div className="col-span-full flex flex-col items-center justify-center gap-2 py-20 px-4 text-[#8ea2b5] text-base text-center w-full">
              <span style={{ fontSize: "2.5rem" }}>{activeTab === "wishlist" ? "❤️" : "🔍"}</span>
              <span>
                {activeTab === "wishlist"
                  ? "Your wishlist is empty."
                  : `No ${title ? title.toLowerCase() : ""} found${hasActiveFilters ? " matching your filters" : ""}.`}
              </span>
              {hasActiveFilters && activeTab !== "wishlist" && (
                <button
                  style={{ marginTop: "0.5rem", background: "none", border: "none", color: "#1a56db", cursor: "pointer", textDecoration: "underline", fontSize: "0.95rem" }}
                  onClick={handleClearAll}
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            filteredTabItems.map((item, index) => {
              // NEW: prefer fetched per-course progress; fall back to old item-shape checks.
              const fetchedProgress = progressById[item._id];
              const isProgressLoading = fetchedProgress?.loading;

              const isEnrolled = fetchedProgress
                ? fetchedProgress.totalCount > 0
                : item.progress !== undefined || item.lastAccessedSection !== undefined || item.enrolled;

              const progressVal = fetchedProgress
                ? fetchedProgress.totalProgress ?? 0
                : item.progress || 0;

              const duration = item?.duration || item?.courseIncludes?.videoDuration;
              const modulesCount = item?.sections?.length || 0;
              const createdAtDate = item?.createdAt ? formatUpdatedDate(item.createdAt) : "";

              const inWishlist = wishlistIdSet.has(item?._id);
              const isWishlistLoading = wishlistPendingIds.includes(item?._id);
              const inCart = cartIdSet.has(item?._id);
              const isCartLoading = cartPendingIds.includes(item?._id);

              let statusText = "Not started";
              let buttonText = "Start";
              let statusColor = "text-[#94a3b8]";

              if (isProgressLoading) {
                statusText = "Loading…";
              } else if (isEnrolled) {
                if (progressVal > 0) {
                  statusText = `${progressVal}% complete`;
                  buttonText = "Continue";
                  statusColor = "text-[#10b981]";
                }
              }

              const imageUrl =
                item?.media?.thumbnailImage ||
                item?.media?.coverImage ||
                item?.thumbnail ||
                item?.image ||
                item?.bannerImage ||
                item?.coverImage ||
                item?.companyLogo ||
                "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80";

              const cardNode = (
                <div
                  key={item?._id}
                  onClick={(e) => { e.stopPropagation(); nav.push(getItemUrl(item)); }}
                  className="group flex flex-col bg-white text-black border-[1px] border-[#e2e8f0] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg shadow-sm"
                  role="button"
                  tabIndex={0}
                >
                  {/* Card Image */}
                  <div className="relative w-full h-[170px] flex flex-col items-center justify-center overflow-hidden bg-[#071631]">
                    <img src={imageUrl} alt={item.title || "Thumbnail"} className="w-full h-full object-cover" />

                    {isEnrolled && (
                      <div className="absolute top-3 left-3 bg-[#022c22] backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1.5 border-[0.5px] border-[#047857]">
                        <BsCheckCircleFill className="text-[#10b981] text-[10px]" />
                        <span className="text-[#10b981] text-[11px] font-medium tracking-wide">Enrolled</span>
                      </div>
                    )}
                    {showWishlist && (
                      <button
                        onClick={(e) => handleWishlistToggle(item, e)}
                        disabled={isWishlistLoading}
                        aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                        className="absolute top-3 right-3 bg-black/30 backdrop-blur-sm p-1.5 rounded-lg border-[0.5px] border-white/10 cursor-pointer hover:bg-black/50 transition-colors disabled:opacity-60"
                      >
                        {inWishlist ? (
                          <BsBookmarkFill className="text-[#facc15] text-[14px]" />
                        ) : (
                          <BsBookmark className="text-white text-[14px]" />
                        )}
                      </button>
                    )}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-0.5">
                      <BsCodeSlash className="text-white/80 text-[12px]" />
                      <span className="text-white/90 text-[11px] font-medium">{item.category || "General"}</span>
                    </div>
                    {item.difficulty && (
                      <div className={`absolute bottom-3 right-3 px-2.5 py-0.5 rounded-sm text-[10px] font-bold tracking-wider uppercase ${
                        item.difficulty?.toLowerCase() === "beginner" ? "bg-[#047857] text-white" :
                        item.difficulty?.toLowerCase() === "intermediate" ? "bg-[#d97706] text-white" :
                        "bg-[#dc2626] text-white"
                      }`}>
                        {item.difficulty}
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="flex flex-col p-3 flex-1">
                    <Tooltip title={item?.title} placement="topLeft" mouseEnterDelay={0.5}>
                      <h3 className="text-[15px] font-bold text-[#1e293b] leading-tight mb-2 line-clamp-2 min-h-[36px]">
                        {item?.title}
                      </h3>
                    </Tooltip>

                    <p className="text-[#64748b] text-[12px] font-medium leading-snug mb-3 line-clamp-2 min-h-[34px]">
                      {stripHtml(item?.description)}
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full flex items-center gap-3 mb-4">
                      <div className="flex-1 h-[8px] bg-[#f1f5f9] rounded-full overflow-hidden">
                        {isEnrolled && (
                          <div
                            className="h-full bg-gradient-to-br from-[#1E69DA] to-[#5694F0] rounded-full transition-all duration-500"
                            style={{ width: `${progressVal}%` }}
                          />
                        )}
                      </div>
                      <span className="text-[13px] font-bold text-[#64748b] min-w-[32px] text-right">
                        {isEnrolled ? `${progressVal}%` : "0%"}
                      </span>
                    </div>

                    {/* Meta Row */}
                    <div className="flex items-center gap-2 text-[11px] text-[#94a3b8] font-bold mb-4">
                      {duration && <span className="flex items-center gap-1"><BsClock /> {duration}</span>}
                      {duration && modulesCount > 0 && <span>•</span>}
                      {modulesCount > 0 && <span className="flex items-center gap-1"><BsJournalBookmark /> {modulesCount} modules</span>}
                      {createdAtDate && (duration || modulesCount > 0) && <span>•</span>}
                      {createdAtDate && <span>{createdAtDate}</span>}
                    </div>

                    {showBuyNow && !isEnrolled && (
                      <div className="mb-3">
                        <PriceChip item={item} />
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#f1f5f9]">
                      <span className={`text-[12px] font-bold flex items-center gap-1 ${statusColor}`}>
                        {statusText}
                      </span>
                      <button
                        className="bg-gradient-to-br from-[#1E69DA] to-[#5694F0] hover:opacity-90 text-white text-[13px] font-medium py-1.5 px-5 rounded-[20px] border-none cursor-pointer transition-opacity flex items-center gap-1.5 shadow-sm"
                        onClick={(e) => { e.stopPropagation(); nav.push(getItemUrl(item)); }}
                      >
                        {buttonText === "Start" ? "+ Start" : `▷ ${buttonText}`}
                      </button>
                    </div>
                  </div>
                </div>
              );

              if (!showBuyNow) {
                return cardNode;
              }

              return (
                <Popover
                  key={item?._id}
                  trigger="hover"
                  placement="right"
                  overlayStyle={{ maxWidth: 380 }}
                  overlayInnerStyle={{ borderRadius: 16, padding: 0, overflow: "hidden" }}
                  content={
                    <BuyNowPopoverContent
                      item={item}
                      onAddToWishlist={(it) => handleWishlistToggle(it)}
                      onAddToCart={(it) => handleAddToCart(it)}
                      isInCart={inCart}
                      isInWishlist={inWishlist}
                      cartLoading={isCartLoading}
                      wishlistLoading={isWishlistLoading}
                    />
                  }
                >
                  {cardNode}
                </Popover>
              );
            })
          )}
        </div>
      </div>

      {/* Info Modal */}
      <Modal
        open={!!selectedItem}
        onCancel={() => setSelectedItem(null)}
        title={
          <div style={{ paddingRight: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.3 }}>{selectedItem?.title}</div>
            {selectedItem?.subtitle && (
              <div style={{ fontWeight: 400, fontSize: 12, color: "#888", marginTop: 4, fontStyle: "italic" }}>
                {selectedItem.subtitle}
              </div>
            )}
          </div>
        }
        footer={[
          <Button key="close" onClick={() => setSelectedItem(null)}>Close</Button>,
          <Button key="view" type="primary" onClick={() => { nav.push(getItemUrl(selectedItem)); setSelectedItem(null); }}>
            {viewLabel}
          </Button>,
        ]}
        width={1100}
        centered={true}
        styles={{ body: { padding: 0 } }}
      >
        <div
          className="[&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#d0d0d0] hover:[&::-webkit-scrollbar-thumb]:bg-[#aaa] [&::-webkit-scrollbar-thumb]:rounded-full"
          style={{ maxHeight: "75vh", overflowY: "auto", overflowX: "hidden", padding: "24px" }}
        >
          {selectedItem && <InfoContent item={selectedItem} />}
        </div>
      </Modal>

      {/* Wishlist Drawer */}
      {showWishlist && (
        <WishlistDrawer
          open={wishlistOpen}
          onClose={() => setWishlistOpen(false)}
          items={wishlistItems}
          loading={wishlistLoading}
          cartIds={cartIdSet}
        />
      )}

      {/* Cart Drawer */}
      {showBuyNow && (
        <CartDrawer
          open={cartOpen}
          onClose={() => setCartOpen(false)}
          cartItems={cartItems}
          totalAmount={cartTotalAmount}
          loading={cartLoading}
          nav={nav}
        />
      )}

      {/* Pagination — only show for my courses tab which has server pagination */}
      {activeTab === "my" && paginationData && paginationData.totalLength > 0 && !loading && (
        <div className="mt-auto w-full bg-white z-10 py-4 px-4 lg:px-8 flex justify-center border-t border-[#f1f5f9]">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={paginationData.totalLength}
            onChange={handlePageChange}
            showSizeChanger={false}
            pageSizeOptions={["6"]}
          />
        </div>
      )}
    </div>
  );
};

export default LibraryPage;