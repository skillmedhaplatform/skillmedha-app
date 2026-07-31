"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "antd";

export default function MobileAchievements({ progressById, combinedLearningData, studentCreds }) {
  const [streak, setStreak] = useState(1);
  const [claimedAchievements, setClaimedAchievements] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState("Technical"); // Technical or Non-Technical

  // Notification states
  const [unseenBadges, setUnseenBadges] = useState([]);
  const [selectedBadgeDetail, setSelectedBadgeDetail] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setStreak(parseInt(localStorage.getItem("loginStreak") || "1", 10));
      
      const loadClaimed = () => {
        let stored = studentCreds?.claimedAchievements || [];
        if (typeof window !== "undefined") {
          const userId = studentCreds?._id || "";
          const local = JSON.parse(localStorage.getItem(`claimedAchievements_${userId}`) || "[]");
          stored = [...stored, ...local];
        }
        
        setClaimedAchievements(Array.from(new Set(stored)));
        
        if (typeof window !== "undefined") {
          const userId = studentCreds?._id || "";
          setUnseenBadges(JSON.parse(localStorage.getItem(`unseenPracticeBadges_${userId}`) || "[]"));
        }
        
        // Auto-open modal if redirected from test result page
        const autoOpen = localStorage.getItem("autoOpenBadgeModal");
        if (autoOpen) {
          setTimeout(() => {
            setModalType(autoOpen);
            setIsModalVisible(true);
            setSelectedBadgeDetail(null);
            
            // Auto clear unseen for this type
            const userId = studentCreds?._id || "";
            const unseenKey = `unseenPracticeBadges_${userId}`;
            const remaining = JSON.parse(localStorage.getItem(unseenKey) || "[]").filter(id => !id.includes(autoOpen));
            setUnseenBadges(remaining);
            localStorage.setItem(unseenKey, JSON.stringify(remaining));
            localStorage.removeItem("autoOpenBadgeModal");
          }, 300);
        }
      };
      
      loadClaimed();
      window.addEventListener("achievementClaimed", loadClaimed);
      
      const handleHashChange = () => {
        if (window.location.hash.startsWith('#openBadges_')) {
          const type = window.location.hash.split('_')[1];
          if (type === 'Technical' || type === 'Non-Technical') {
            setModalType(type);
            setIsModalVisible(true);
            setSelectedBadgeDetail(null);
            
            const userId = studentCreds?._id || "";
            const unseenKey = `unseenPracticeBadges_${userId}`;
            const remaining = JSON.parse(localStorage.getItem(unseenKey) || "[]").filter(id => !id.includes(type));
            setUnseenBadges(remaining);
            localStorage.setItem(unseenKey, JSON.stringify(remaining));
            
            history.pushState("", document.title, window.location.pathname + window.location.search);
          }
        }
      };
      window.addEventListener("hashchange", handleHashChange);
      handleHashChange();

      return () => {
        window.removeEventListener("achievementClaimed", loadClaimed);
        window.removeEventListener("hashchange", handleHashChange);
      };
    }
  }, [studentCreds?._id, studentCreds?.claimedAchievements]);

  let streakCoins = 5;
  if (streak === 1) streakCoins = 10;
  else if (streak > 0 && streak % 10 === 0) streakCoins = streak;

  const achievementsList = [
    { emoji: "🔥", title: `${streak} Day Streak`, desc: `+${streakCoins} coins earned`, status: "Earned" }
  ];

  if (streak >= 30) {
    achievementsList.push({ emoji: "🏆", title: "1 Month Streak", desc: "Maintained badge", status: "Earned" });
  }

  if (claimedAchievements.includes("welcome_aboard")) {
    achievementsList.push({ emoji: "🚀", title: "Welcome Aboard", desc: "Joined the platform", status: "Earned" });
  }
  
  if (claimedAchievements.includes("profile_complete")) {
    achievementsList.push({ emoji: "👤", title: "Profile Complete", desc: "Profile setup finished", status: "Earned" });
  }
  
  if (claimedAchievements.includes("perfect_scorer")) {
    achievementsList.push({ emoji: "🎯", title: "Perfect Scorer", desc: "100% on a practice test", status: "Earned" });
  }

  if (progressById && combinedLearningData) {
    Object.keys(progressById).forEach(id => {
      const achievementId = `complete_${id}`;
      if (claimedAchievements.includes(achievementId)) {
        const course = combinedLearningData.find((c) => c._id === id);
        if (course) {
          const categoryText = course.category ? course.category : (course.type || "Course");
          const shortCategoryText = categoryText.charAt(0).toUpperCase() + categoryText.slice(1);
          const courseTitle = course.title || course.courseTitle || course.name || `${shortCategoryText} Course`;
          achievementsList.push({
            emoji: "🥇",
            title: `${courseTitle} Complete`,
            desc: "+50 coins earned",
            status: "Earned"
          });
        }
      }
    });
  }

  // Parse Practice Badges
  // Format: practice_badge|{section}|{topic}|{subtopic}|{type}|{level}
  // We can just add a timestamp locally or reverse the array since newer badges are claimed later.
  const practiceBadges = claimedAchievements
    .filter(id => id.startsWith("practice_badge|"))
    .map(id => {
      const parts = id.split("|");
      return {
        id,
        section: parts[1],
        topic: parts[2],
        subtopic: parts[3],
        type: parts[4],
        level: parts[5]
      };
    })
    .reverse(); // Show most recent first

  const technicalBadges = practiceBadges.filter(b => b.section === "Technical");
  const nonTechnicalBadges = practiceBadges.filter(b => b.section === "Non-Technical");

  const hasUnseenTech = technicalBadges.some(b => unseenBadges.includes(b.id));
  const hasUnseenNonTech = nonTechnicalBadges.some(b => unseenBadges.includes(b.id));

  const openModal = (type) => {
    setModalType(type);
    setIsModalVisible(true);
    setSelectedBadgeDetail(null);
    
    // Clear unseen badges for this type
    const remainingUnseen = unseenBadges.filter(id => {
      const badge = practiceBadges.find(b => b.id === id);
      return badge && badge.section !== type;
    });
    const userId = studentCreds?._id || "";
    const unseenKey = `unseenPracticeBadges_${userId}`;
    setUnseenBadges(remainingUnseen);
    localStorage.setItem(unseenKey, JSON.stringify(remainingUnseen));
  };

  const renderBadgeList = (badges) => {
    if (selectedBadgeDetail) {
      const b = selectedBadgeDetail;
      return (
        <div className="flex flex-col animate-[smoothFadeIn_0.3s_ease-out_forwards]">
          <div className="flex justify-start mb-2">
            <button 
              onClick={() => setSelectedBadgeDetail(null)}
              className="text-[#3b82f6] font-semibold flex items-center gap-2 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Back to Badges
            </button>
          </div>
          
          <div className="bg-[#f0f9ff] p-6 rounded-2xl text-center border border-[#e2e8f0]">
            <div className="inline-block relative mb-6">
              <div className="bg-[#3b82f6] rounded-full w-[100px] h-[100px] flex items-center justify-center shadow-lg">
                <span className="text-[50px] drop-shadow-md">{b.type === 'Flawless' ? '🏆' : '🏅'}</span>
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#2563eb] text-white px-3 py-1 rounded-full font-bold text-[11px] tracking-wide shadow-md whitespace-nowrap">
                {b.type.toUpperCase()}
              </div>
            </div>
            
            <h2 className="text-[20px] font-extrabold text-[#1e293b] mb-2">{b.type} Master Lvl {b.level}</h2>
            <p className="text-[#475569] text-[13px] leading-relaxed mb-6">
              You've proven your expertise in <strong className="text-[#0f172a]">{b.topic} • {b.subtopic}</strong>!
            </p>
            
              <div className="flex-1 border-t border-[#e2e8f0] pt-4 mt-2">
                <strong className="block text-[#1e293b] text-[14px] mb-1">{b.type} Badge Unlocked</strong>
                <span className="text-[#64748b] text-[13px] leading-relaxed block">
                  {b.type === 'Flawless' 
                    ? "Awarded for getting every question right in one attempt. Your flawless execution proves true mastery." 
                    : "Awarded for scoring 100% on a topic 24 hours after mastering it. You've proven exceptional memory and recall."}
                </span>
              </div>
              <div className="text-[24px] mt-4">
                {b.type === 'Flawless' ? '🏆' : '🏅'}
              </div>
          </div>
        </div>
      );
    }

    if (badges.length === 0) {
      return <div className="text-center py-6 text-gray-500 font-medium">No badges earned yet. Keep practicing!</div>;
    }
    
    return (
      <div className="flex flex-col gap-3 animate-[smoothFadeIn_0.3s_ease-out_forwards]">
        {badges.map((b, idx) => {
          const isNew = unseenBadges.includes(b.id);
          return (
            <div 
              key={idx} 
              className={`flex items-center justify-between p-4 rounded-xl border ${isNew ? 'border-[#3b82f6] bg-[#eff6ff]' : 'border-[#e2e8f0] bg-white'} overflow-hidden cursor-pointer transition-all hover:shadow-md hover:border-[#cbd5e1] group`}
              onClick={() => setSelectedBadgeDetail(b)}
            >
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  {isNew && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white shadow-sm z-10 animate-pulse" />}
                  <div className="text-[32px] drop-shadow-sm transition-transform">{b.type === 'Flawless' ? '🏆' : '🏅'}</div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-[#0f172a] text-[14px]">{b.type} Master Lvl {b.level}</span>
                  <span className="text-[#64748b] text-[12px]">{b.topic} • {b.subtopic}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-[#24A058] text-[12px] font-bold">Earned</span>
                {isNew && <span className="text-[10px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-full uppercase tracking-wider">New</span>}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Determine tile order based on unseen badges
  const renderTiles = () => {
    const techTile = (
      <div 
        key="tech"
        onClick={() => openModal("Technical")}
        className={`flex items-center justify-between p-3.5 rounded-2xl border ${hasUnseenTech ? 'border-[#3b82f6] shadow-sm' : 'border-[#e2e8f0]'} bg-white cursor-pointer hover:shadow-md transition-shadow relative`}
      >
        {hasUnseenTech && <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-[#3b82f6] rounded-full border-[1.5px] border-white shadow-sm z-10 animate-pulse" />}
        <div className="flex items-center gap-3">
          <div className="text-[26px]">💻</div>
          <div className="flex flex-col">
            <span className="font-bold text-[#0f172a] text-[14px]">Tech Badges</span>
            <span className="text-[#64748b] text-[12px]">View your technical practice badges</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-white bg-[#5694F0] px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap">{technicalBadges.length} Earned</span>
          {hasUnseenTech && <span className="text-[9px] font-bold text-[#3b82f6] uppercase tracking-wider">New</span>}
        </div>
      </div>
    );

    const nonTechTile = (
      <div 
        key="non-tech"
        onClick={() => openModal("Non-Technical")}
        className={`flex items-center justify-between p-3.5 rounded-2xl border ${hasUnseenNonTech ? 'border-[#8b5cf6] shadow-sm' : 'border-[#e2e8f0]'} bg-white cursor-pointer hover:shadow-md transition-shadow relative`}
      >
        {hasUnseenNonTech && <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-[#8b5cf6] rounded-full border-[1.5px] border-white shadow-sm z-10 animate-pulse" />}
        <div className="flex items-center gap-3">
          <div className="text-[26px]">🧠</div>
          <div className="flex flex-col">
            <span className="font-bold text-[#0f172a] text-[14px]">Non-Tech Badges</span>
            <span className="text-[#64748b] text-[12px]">View your aptitude & reasoning badges</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-white bg-[#5694F0] px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap">{nonTechnicalBadges.length} Earned</span>
          {hasUnseenNonTech && <span className="text-[9px] font-bold text-[#8b5cf6] uppercase tracking-wider">New</span>}
        </div>
      </div>
    );

    if (hasUnseenNonTech && !hasUnseenTech) {
      return [nonTechTile, techTile];
    }
    return [techTile, nonTechTile];
  };

  return (
    <div className="w-full flex flex-col gap-3 py-2 px-1">
      {/* Practice Badge Tiles */}
      {renderTiles()}

      <Modal
        title={<span className="font-bold text-[18px] flex items-center gap-2">{modalType === "Technical" ? '💻' : '🧠'} {modalType} Practice Badges</span>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
        centered
        bodyStyle={{ maxHeight: '70vh', overflowY: 'auto', padding: '24px 16px' }}
        closeIcon={<span className="text-gray-400 hover:text-gray-600 text-xl">✕</span>}
      >
        {renderBadgeList(modalType === "Technical" ? technicalBadges : nonTechnicalBadges)}
      </Modal>

      <div className="w-full h-[1px] bg-gray-100 my-1"></div>

      {achievementsList.map((item, idx) => (
        <div key={idx} className="flex items-center justify-between p-3.5 rounded-2xl border border-[#e2e8f0] bg-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="text-[26px]">{item.emoji}</div>
            <div className="flex flex-col">
              <span className="font-bold text-[#0f172a] text-[14px]">{item.title}</span>
              <span className="text-[#64748b] text-[12px]">{item.desc}</span>
            </div>
          </div>
          <span className="text-white bg-[#5694F0] px-2.5 py-1 rounded-full text-[11px] font-bold">{item.status}</span>
        </div>
      ))}
    </div>
  );
}
