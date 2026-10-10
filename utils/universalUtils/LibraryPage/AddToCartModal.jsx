import React, { useMemo, useState } from "react";
import { Modal, Button } from "antd";
import { CheckCircleFilled, CloseOutlined, DeleteOutlined } from "@ant-design/icons";
import { formatINR } from "./helpers";

const AddToCartModal = ({
  open,
  onClose,
  addedItems = [],
  relatedItems = [],
  cartIdSet,
  onAddToCart,
  onAddAllToCart,
  onGoToCart,
  onRemoveFromCart,
}) => {
  const [addingAll, setAddingAll] = useState(false);

  // Exclude already added items
  const displayRelated = useMemo(() => {
    return relatedItems.filter(item => !cartIdSet.has(item._id)).slice(0, 2);
  }, [relatedItems, cartIdSet]);

  const totalRelatedPrice = useMemo(() => {
    return displayRelated.reduce((sum, item) => {
      const price = Number(item?.pricing?.finalPrice) || Number(item?.pricing?.currentPrice) || Number(item?.price) || 0;
      return sum + price;
    }, 0);
  }, [displayRelated]);

  const totalRelatedOriginalPrice = useMemo(() => {
    return displayRelated.reduce((sum, item) => {
      const orig = Number(item?.pricing?.originalPrice) || Number(item?.price) || 0;
      return sum + orig;
    }, 0);
  }, [displayRelated]);

  if (!addedItems || addedItems.length === 0) return null;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={720}
      centered
      closable={false}
      styles={{
        mask: { backdropFilter: "blur(6px)", backgroundColor: "rgba(15, 23, 42, 0.4)" },
        body: { padding: 0, borderRadius: 16, overflow: "hidden" }
      }}
    >
      <div className="bg-white flex flex-col relative w-full h-full p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-2">
          <h2 className="text-lg font-bold text-slate-800 m-0">Added to cart</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <CloseOutlined className="text-lg" />
          </button>
        </div>

        {/* Added Items List */}
        <div className="max-h-[40vh] overflow-y-auto custom-scrollbar p-5 pt-0 bg-white">
          {addedItems.map((addedItem, index) => {
            const addedImageUrl = addedItem?.media?.thumbnailImage || addedItem?.media?.coverImage || addedItem?.bannerImage || addedItem?.image || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80";
            const addedOriginalPrice = Number(addedItem?.pricing?.originalPrice) || Number(addedItem?.price) || 0;
            const addedPrice = Number(addedItem?.pricing?.finalPrice) || Number(addedItem?.pricing?.currentPrice) || addedOriginalPrice;
            const addedDiscount = addedOriginalPrice > addedPrice ? Math.round(((addedOriginalPrice - addedPrice) / addedOriginalPrice) * 100) : 0;
            const addedRating = addedItem?.rating || (4 + Math.random() * 0.9).toFixed(1);
            const addedStudents = addedItem?.students || Math.floor(Math.random() * 15000 + 1000);
            const addedReviews = addedItem?.reviews || Math.floor(Math.random() * 5000 + 500);
            const addedLevelColor = addedItem?.difficulty === "Advanced" ? "#ef4444" : addedItem?.difficulty === "Intermediate" ? "#f59e0b" : "#22c55e";

            return (
              <div key={addedItem._id} className="p-5 flex gap-4 items-center bg-white border border-slate-200 rounded-[14px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] mb-4">
                <div className="flex flex-col gap-3 items-center shrink-0">
                  <CheckCircleFilled className="text-emerald-500 text-[26px]" />
                  <button onClick={() => onRemoveFromCart(addedItem)} className="text-slate-300 hover:text-red-500 transition-colors" title="Remove from cart">
                    <DeleteOutlined className="text-base" />
                  </button>
                </div>
                <div className="w-[140px] h-[90px] rounded-[10px] bg-white overflow-hidden shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-slate-200">
                  <img src={addedImageUrl} alt="Added Item" className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 flex flex-col justify-center min-w-0 py-1">
                  <h4 className="text-[15px] font-bold text-[#0F172A] line-clamp-2 leading-snug mb-2">{addedItem.title}</h4>
                  
                  <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
                    <span style={{ background: addedLevelColor }} className="text-white px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase">{addedItem.difficulty || "Beginner"}</span>
                    <span className="bg-slate-200/60 text-slate-600 px-2 py-0.5 rounded-md text-[10.5px] font-bold">📚 {addedItem?.sections?.length || 0} Modules</span>
                    {addedItem?.courseIncludes?.videoDuration && (
                      <span className="bg-slate-200/60 text-slate-600 px-2 py-0.5 rounded-md text-[10.5px] font-bold">⏱ {addedItem.courseIncludes.videoDuration}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap text-[11.5px]">
                    <span className="text-amber-500 font-bold">⭐ {addedRating}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500 font-medium">{addedReviews.toLocaleString()} ratings</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500 font-medium">{addedStudents.toLocaleString()} students</span>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between self-stretch shrink-0 min-w-[100px] py-1">
                  <div className="flex flex-col items-end leading-none gap-1.5">
                    <span className="text-[18px] font-extrabold text-[#0F172A]">{formatINR(addedPrice)}</span>
                    {addedDiscount > 0 && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[12px] text-slate-400 line-through font-medium">{formatINR(addedOriginalPrice)}</span>
                        <span className="text-[#16A34A] font-bold text-[10.5px] bg-[#DCFCE7] px-1.5 py-0.5 rounded">{addedDiscount}% OFF</span>
                      </div>
                    )}
                  </div>
                  <Button 
                    type="primary" 
                    onClick={() => { onClose(); onGoToCart(); }} 
                    className="shrink-0 font-semibold bg-[#1a56db] hover:bg-[#1e4eb8] border-none rounded-lg h-[32px] px-5 shadow-md"
                  >
                    Go to cart
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Related Items Section */}
        {displayRelated.length > 0 && (
          <div className="p-6 bg-white">
            <h3 className="text-[15px] font-bold text-slate-800 mb-5">Frequently Bought Together</h3>
            
            <div className="flex flex-col gap-0">
              {displayRelated.map((item, index) => {
                const imageUrl = item?.media?.thumbnailImage || item?.media?.coverImage || item?.bannerImage || item?.image || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80";
                const originalPrice = Number(item?.pricing?.originalPrice) || Number(item?.price) || 0;
                const price = Number(item?.pricing?.finalPrice) || Number(item?.pricing?.currentPrice) || originalPrice;
                const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
                const rating = item?.rating || (4 + Math.random() * 0.9).toFixed(1);
                const students = item?.students || Math.floor(Math.random() * 15000 + 1000);
                const reviews = item?.reviews || Math.floor(Math.random() * 5000 + 500);
                const levelColor = item?.difficulty === "Advanced" ? "#ef4444" : item?.difficulty === "Intermediate" ? "#f59e0b" : "#22c55e";

                return (
                  <React.Fragment key={item._id}>
                    {index > 0 && (
                      <div className="flex justify-center -my-3.5 relative z-10 pointer-events-none">
                        <div className="bg-white border border-slate-200 rounded-full w-[28px] h-[28px] flex items-center justify-center text-slate-500 font-medium text-lg shadow-sm">
                          +
                        </div>
                      </div>
                    )}
                    <div className="border border-slate-200 rounded-[14px] p-3.5 flex gap-5 items-center bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-[#1a56db]/30 transition-all">
                      <div className="w-[140px] h-[90px] rounded-[10px] overflow-hidden shrink-0 relative bg-slate-100 border border-slate-100">
                        <img src={imageUrl} alt={item.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/5"></div>
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-center min-w-0 py-1">
                        <h4 className="text-[15px] font-bold text-[#0F172A] line-clamp-2 leading-snug mb-2">{item.title}</h4>
                        
                        <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
                          <span style={{ background: levelColor }} className="text-white px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase">{item.difficulty || "Beginner"}</span>
                          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[10.5px] font-bold">📚 {item?.sections?.length || 0} Modules</span>
                          {item?.courseIncludes?.videoDuration && (
                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[10.5px] font-bold">⏱ {item.courseIncludes.videoDuration}</span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap text-[11.5px]">
                          <span className="text-amber-500 font-bold">⭐ {rating}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500 font-medium">{reviews.toLocaleString()} ratings</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500 font-medium">{students.toLocaleString()} students</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-between self-stretch shrink-0 min-w-[100px] py-1">
                        <div className="flex flex-col items-end leading-none gap-1.5">
                          <span className="text-[18px] font-extrabold text-[#0F172A]">{formatINR(price)}</span>
                          {discount > 0 && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[12px] text-slate-400 line-through font-medium">{formatINR(originalPrice)}</span>
                              <span className="text-[#16A34A] font-bold text-[10.5px] bg-[#DCFCE7] px-1.5 py-0.5 rounded">{discount}% OFF</span>
                            </div>
                          )}
                        </div>
                        <Button 
                          size="small"
                          className="rounded-lg text-[#1a56db] border-[#1a56db] font-semibold text-[13px] h-[32px] px-4 hover:bg-[#eff6ff]" 
                          onClick={() => onAddToCart(item)}
                        >
                          Add to cart
                        </Button>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            {/* Total Footer */}
            <div className="mt-6 pt-5 flex items-center justify-end gap-5 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-[14px] text-slate-500 font-medium">Total:</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-[18px] font-extrabold text-slate-800">{formatINR(totalRelatedPrice)}</span>
                  {totalRelatedOriginalPrice > totalRelatedPrice && (
                    <span className="text-[13px] text-slate-400 line-through font-medium">{formatINR(totalRelatedOriginalPrice)}</span>
                  )}
                </div>
              </div>
              <Button 
                type="primary" 
                loading={addingAll}
                className="bg-[#1a56db] hover:bg-[#1e4eb8] border-none font-semibold rounded-lg h-10 px-6 shadow-md"
                onClick={async () => {
                  setAddingAll(true);
                  await onAddAllToCart(displayRelated);
                  setAddingAll(false);
                }}
              >
                Add all to cart
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AddToCartModal;
