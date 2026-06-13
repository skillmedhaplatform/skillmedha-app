"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Pagination, Tooltip, Button, Select, Input, Modal, Popover, Badge, message } from "antd";
import { SearchOutlined, InfoCircleOutlined, ShoppingCartOutlined, HeartOutlined } from "@ant-design/icons";
import { useSearchParams, usePathname } from "next/navigation";
import { useAppRouter } from "@/helpers/useAppRouter";
import CourseCardSkeleton from "@/universalUtils/CourseCardSkeleton/CourseCardSkeleton";
import useResponsive from "@/hooks/useResponsive";
import MobileLibraryPage from "@/mobile_views/library/MobileLibraryPage";

import { getCart, addToCart } from "@/redux/slices/cartSlice";
import { getWishlist, addToWishlist, removeFromWishlist } from "@/redux/slices/wishlistSlice";
import { stripHtml, formatUpdatedDate, formatINR, DIFFICULTY_OPTIONS } from "./helpers";
import InfoContent from "./InfoContent";
import PriceChip from "./PriceChip";
import BuyNowPopoverContent from "./BuyNowPopoverContent";
import CartDrawer from "./CartDrawer";
import WishlistDrawer from "./WishlistDrawer";

/**
 * Unified library page for Courses and Internships.
 *
 * Props:
 *  - title              {string}
 *  - fetchAction        {thunk}
 *  - dataSelector       {fn}
 *  - paginationSelector {fn}
 *  - getItemUrl         {fn}       (item) => URL string
 *  - viewLabel          {string}
 *  - searchPlaceholder  {string}
 *  - idPrefix           {string}
 *  - renderMetaChips    {fn}       Optional extra chips
 *  - showBuyNow         {boolean}  Default true. Set false to disable Cart/Wishlist for this page (e.g. Internships)
 */
const LibraryPage = ({
  title,
  fetchAction,
  dataSelector,
  paginationSelector,
  getItemUrl,
  viewLabel = "View",
  searchPlaceholder = "Search…",
  idPrefix = "lib",
  renderMetaChips,
  showBuyNow = true,
}) => {
  const nav = useAppRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const dispatch = useDispatch();

  const items = useSelector(dataSelector);
  const paginationData = useSelector(paginationSelector);

  // --- Cart & Wishlist state ---
  const cartItems = useSelector((state) => state.cart?.items ?? []);
  const totalAmount = useSelector((state) => state.cart?.totalAmount ?? 0);
  const cartLoading = useSelector((state) => state.cart?.loading ?? false);
  const cartPendingIds = useSelector((state) => state.cart?.pendingIds ?? []);

  const wishlistItems = useSelector((state) => state.wishlist?.items ?? []);
const wishlistState = useSelector((state) => state.wishlist);

console.log("FULL WISHLIST STATE", wishlistState);
  const wishlistLoading = useSelector((state) => state.wishlist?.loading ?? false);
  const wishlistPendingIds = useSelector((state) => state.wishlist?.pendingIds ?? []);

  // Fast lookup sets for "is this course in cart/wishlist?"
  const cartIdSet = useMemo(
    () => new Set(cartItems.map((i) => i.courseId?._id || i.courseId)),
    [cartItems]
  );
  const wishlistIdSet = useMemo(
    () => new Set(wishlistItems.map((i) => i.courseId?._id || i.courseId)),
    [wishlistItems]
  );

  // URL-driven filter state
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("limit") || "20", 10);
  const urlSearch = searchParams.get("search") || "";
  const urlCategory = searchParams.get("category") || "";
  const urlDifficulty = searchParams.get("difficulty") || "";

  const [searchInput, setSearchInput] = useState(urlSearch);
  const debounceRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null); // Info modal
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);

  useEffect(() => { setSearchInput(urlSearch); }, [urlSearch]);

  useEffect(() => {
    setLoading(true);
    dispatch(
      fetchAction({ page: currentPage, limit: pageSize, searchTerm: urlSearch, category: urlCategory, difficulty: urlDifficulty })
    ).finally(() => setLoading(false));
  }, [dispatch, fetchAction, currentPage, pageSize, urlSearch, urlCategory, urlDifficulty]);

  // Load cart + wishlist once on mount (only if Buy Now / Cart actions are enabled)
  useEffect(() => {
    if (showBuyNow) {
      dispatch(getCart());
      dispatch(getWishlist());
    }
  }, [dispatch, showBuyNow]);

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
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => pushParams({ search: val }), 500);
  };

  const handleCategoryChange = (val) => pushParams({ category: val || "" });
  const handleDifficultyChange = (val) => pushParams({ difficulty: val || "" });
  const handleClearAll = () => { setSearchInput(""); pushParams({ search: "", category: "", difficulty: "", page: "1" }); };
  const removeFilter = (key) => { if (key === "search") setSearchInput(""); pushParams({ [key]: "" }); };
  const handlePageChange = (page, size) => pushParams({ page: page.toString(), limit: size.toString() });

  // --- Wishlist toggle ---
  const handleWishlistToggle = async (item) => {
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

  // --- Cart: add or open drawer if already in cart ---
  const handleAddToCart = async (item) => {
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

  // Derived
  const categoryOptions = [
    ...new Set((items || []).map((i) => i.category).filter(Boolean)),
  ].map((cat) => ({ label: cat, value: cat }));

  const difficultyOptions = DIFFICULTY_OPTIONS.map((d) => ({ label: d, value: d }));

  const activeFilters = [
    urlSearch && { key: "search", label: `Search: "${urlSearch}"` },
    urlCategory && { key: "category", label: `Category: ${urlCategory}` },
    urlDifficulty && { key: "difficulty", label: `Difficulty: ${urlDifficulty}` },
  ].filter(Boolean);

  const hasActiveFilters = activeFilters.length > 0;
  const isMobile = useResponsive();

  if (isMobile) {
    return (
      <MobileLibraryPage
        title={title}
        viewLabel={viewLabel}
        searchPlaceholder={searchPlaceholder}
        idPrefix={idPrefix}
        renderMetaChips={renderMetaChips}
        getItemUrl={getItemUrl}
        items={items}
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
      />
    );
  }

  return (
    <div className="flex flex-col gap-2 relative">
      {/* Sticky Header */}
      <div className="flex items-center justify-between flex-wrap gap-2.5 sticky top-0 left-0 w-full bg-white z-10 py-2">
        <div className="text-[clamp(1.3rem,2vw,1.5rem)] font-bold text-[#24A058] whitespace-nowrap shrink-0">{title}</div>
        <div className="flex flex-wrap items-center gap-2 flex-1 justify-end">
          <Input
            id={`${idPrefix}-search`}
            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            placeholder={searchPlaceholder}
            value={searchInput}
            onChange={handleSearchChange}
            allowClear
            onClear={() => pushParams({ search: "" })}
            style={{ maxWidth: 240, borderRadius: 8 }}
          />
          <Select
            id={`${idPrefix}-category`}
            placeholder="All Categories"
            value={urlCategory || undefined}
            onChange={handleCategoryChange}
            allowClear
            options={categoryOptions}
            style={{ minWidth: 150 }}
            popupMatchSelectWidth={false}
          />
          <Select
            id={`${idPrefix}-difficulty`}
            placeholder="All Levels"
            value={urlDifficulty || undefined}
            onChange={handleDifficultyChange}
            allowClear
            options={difficultyOptions}
            style={{ minWidth: 130 }}
            popupMatchSelectWidth={false}
          />
          {hasActiveFilters && (
            <Button danger size="middle" onClick={handleClearAll} style={{ borderRadius: 8 }}>
              Clear Filters
            </Button>
          )}

          {showBuyNow && (
            <>
              <Badge count={wishlistItems.length} size="small">
                <Button
                  icon={<HeartOutlined />}
                  onClick={() => setWishlistOpen(true)}
                  style={{ borderRadius: 8 }}
                >
                  Wishlist
                </Button>
              </Badge>
              <Badge count={cartItems.length} size="small">
                <Button
                  icon={<ShoppingCartOutlined />}
                  type="primary"
                  onClick={() => setCartOpen(true)}
                  style={{ borderRadius: 8 }}
                >
                  Cart
                </Button>
              </Badge>
            </>
          )}
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pb-1">
          {activeFilters.map(({ key, label }) => (
            <span key={key} className="inline-flex items-center gap-[6px] bg-[#e8f0fe] text-[#1a56db] border border-[#a4c2f4] rounded-full py-[3px] pr-[10px] pl-[12px] text-[12px] font-medium">
              {label}
              <button
                className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#a4c2f4] border-none cursor-pointer text-[10px] text-[#1a56db] leading-none p-0 hover:bg-[#1a56db] hover:text-white"
                onClick={() => removeFilter(key)}
                aria-label={`Remove ${key} filter`}
              >×</button>
            </span>
          ))}
        </div>
      )}

      {/* Cards */}
      <div className="w-full overflow-hidden">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(18rem,1fr))] self-start gap-4 p-2">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <CourseCardSkeleton key={i} />)
          ) : !items?.length ? (
            <div className="col-span-full flex flex-col items-center justify-center gap-2 py-20 px-4 text-[#8ea2b5] text-base text-center w-full">
              <span style={{ fontSize: "2.5rem" }}>🔍</span>
              <span>No {title.toLowerCase()} found{hasActiveFilters ? " matching your filters" : ""}.</span>
              {hasActiveFilters && (
                <button
                  style={{ marginTop: "0.5rem", background: "none", border: "none", color: "#1a56db", cursor: "pointer", textDecoration: "underline", fontSize: "0.95rem" }}
                  onClick={handleClearAll}
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            items.map((item) => {
              const isPurchased = item?.isPurchased || item?.isEnrolled;
              const isFree = item?.price === 0 || item?.isFree;
              const inCart = cartIdSet.has(item?._id);
              const inWishlist = wishlistIdSet.has(item?._id);
              const itemCartLoading = cartPendingIds.includes(item?._id);
              const itemWishlistLoading = wishlistPendingIds.includes(item?._id);

              return (
                <Popover
                  key={item?._id}
                  trigger="hover"
                  placement="right"
                  overlayStyle={{ maxWidth: 380 }}
                  overlayInnerStyle={{ borderRadius: 16, padding: 0, overflow: "hidden" }}
                  content={
                    showBuyNow ? (
                      <BuyNowPopoverContent
                        item={item}
                        onAddToWishlist={handleWishlistToggle}
                        onAddToCart={handleAddToCart}
                        isInCart={inCart}
                        isInWishlist={inWishlist}
                        cartLoading={itemCartLoading}
                        wishlistLoading={itemWishlistLoading}
                      />
                    ) : null
                  }
                >
                  <div className="group grid grid-rows-[auto_1fr]">
                    {/* Thumbnail */}
                    <div className="relative w-full aspect-video bg-[#f5f5f5] overflow-hidden rounded-xl">
                      <img
                        className="w-full h-full object-cover block scale-[1.001] transition-transform duration-220 group-hover:scale-[1.03]"
                        src={item?.coverImage || item?.media?.coverImage || ""}
                        alt={item?.title || title}
                        loading="lazy"
                      />
                      {isFree && (
                        <div style={{ position: "absolute", top: 10, left: 10, background: "#16a34a", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6, letterSpacing: 0.5 }}>
                          FREE
                        </div>
                      )}
                      {isPurchased && (
                        <div style={{ position: "absolute", top: 10, left: 10, background: "#1a56db", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6, letterSpacing: 0.5, display: "flex", alignItems: "center", gap: 4 }}>
                          ✓ Enrolled
                        </div>
                      )}
                      {showBuyNow && inWishlist && !isPurchased && (
                        <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(255,255,255,0.9)", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <HeartOutlined style={{ color: "#dc2626" }} />
                        </div>
                      )}
                    </div>

                    <div className="grid auto-rows-max gap-2 p-1.5">
                      {/* Title + Info icon */}
                      <div style={{ display: "flex", alignItems: "center", width: "100%", overflow: "hidden", gap: 6 }}>
                        <Tooltip title={item?.title} placement="topLeft" mouseEnterDelay={0.5}>
                          <div className="text-base font-bold leading-[1.2] w-[90%] whitespace-nowrap overflow-hidden text-ellipsis underline">{item?.title}</div>
                        </Tooltip>
                        <InfoCircleOutlined
                          onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }}
                          style={{ fontSize: 15, color: "#8ea2b5", flexShrink: 0, cursor: "pointer", transition: "color 160ms" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#1677ff")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#8ea2b5")}
                        />
                      </div>

                      {/* Meta chips row */}
                      <div className="flex flex-wrap content-start h-[65px] overflow-hidden gap-[6px]">
                        {item?.category && (
                          <span className="text-[12px] text-black bg-white border border-[rgba(159,176,195,0.22)] py-1 px-2 rounded-full">{item.category}</span>
                        )}
                        {renderMetaChips?.(item)}
                        {item?.sections?.length ? (
                          <span className="text-[12px] text-black bg-white border border-[rgba(159,176,195,0.22)] py-1 px-2 rounded-full">{item.sections.length} Modules</span>
                        ) : null}
                        <PriceChip item={item} />
                      </div>

                      {/* Description */}
                      <p
                        className="text-[#b9c7d6] text-[13px] leading-[1.45] my-0.5 mb-1.5 line-clamp-3 overflow-hidden h-[60px]"
                        title={stripHtml(item?.description) || ""}
                      >
                        {(() => {
                          const text = stripHtml(item?.description) || "";
                          return text.slice(0, 120) + (text.length > 120 ? "…" : "");
                        })()}
                      </p>

                      {/* Bottom row */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="text-[#8ea2b5] text-xs">
                          {item?.updatedAt && `Updated ${formatUpdatedDate(item.updatedAt)}`}
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <Button
                            type={isPurchased || isFree ? "primary" : "default"}
                            onClick={(e) => {
                              e.stopPropagation();
                              nav.push(getItemUrl(item));
                            }}
                            style={
                              !isPurchased && !isFree
                                ? { borderColor: "#d1d5db", color: "#374151" }
                                : {}
                            }
                          >
                            {viewLabel}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Popover>
              );
            })
          )}
        </div>

        {/* Info Modal */}
        <Modal
          open={!!selectedItem}
          onCancel={() => setSelectedItem(null)}
          title={
            <div style={{ paddingRight: 24 }}>
              <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.3 }}>{selectedItem?.title}</div>
              {selectedItem?.subtitle && (
                <div style={{ fontWeight: 400, fontSize: 12, color: "#888", marginTop: 4, fontStyle: "italic" }}>{selectedItem.subtitle}</div>
              )}
            </div>
          }
          footer={[
            <Button
              key="view"
              type="primary"
              onClick={() => { nav.push(getItemUrl(selectedItem)); setSelectedItem(null); }}
            >
              {viewLabel}
            </Button>,
          ].filter(Boolean)}
          width={1100}
          centered
          styles={{ body: { padding: 0 } }}
        >
          <div
            className="[&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#d0d0d0] hover:[&::-webkit-scrollbar-thumb]:bg-[#aaa] [&::-webkit-scrollbar-thumb]:rounded-full"
            style={{ maxHeight: "75vh", overflowY: "auto", overflowX: "hidden", padding: "24px" }}
          >
            {selectedItem && <InfoContent item={selectedItem} />}
          </div>
        </Modal>

        {/* Cart Drawer */}
        {showBuyNow && (
          <CartDrawer
            open={cartOpen}
            onClose={() => setCartOpen(false)}
            cartItems={cartItems}
            totalAmount={totalAmount}
            loading={cartLoading}
            nav={nav}
          />
        )}

        {/* Wishlist Drawer */}
        {showBuyNow && (
          <WishlistDrawer
            open={wishlistOpen}
            onClose={() => setWishlistOpen(false)}
            items={wishlistItems}
            loading={wishlistLoading}
            cartIds={cartIdSet}
          />
        )}

        {/* Pagination */}
        {paginationData && paginationData.totalLength > 0 && !loading && (
          <div className="sticky bottom-0 left-0 w-full bg-white z-10 py-2 flex justify-end">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={paginationData.totalLength}
              onChange={handlePageChange}
              showSizeChanger
              pageSizeOptions={["10", "20", "50", "100"]}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryPage;
