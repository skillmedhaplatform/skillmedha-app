"use client";
import React from "react";

export default function MobileAchievements({ progressById, combinedLearningData }) {
  const [streak, setStreak] = React.useState(1);
  const [claimedAchievements, setClaimedAchievements] = React.useState([]);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setStreak(parseInt(localStorage.getItem("loginStreak") || "1", 10));
      
      const loadClaimed = () => {
        const stored = JSON.parse(localStorage.getItem("claimedAchievements") || "[]");
        setClaimedAchievements(stored);
      };
      
      loadClaimed();
      window.addEventListener("achievementClaimed", loadClaimed);
      return () => window.removeEventListener("achievementClaimed", loadClaimed);
    }
  }, []);

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
          achievementsList.push({
            emoji: "🥇",
            title: `${shortCategoryText} Complete`,
            desc: "+50 coins earned",
            status: "Earned"
          });
        }
      }
    });
  }

  return (
    <div className="w-full flex flex-col gap-3 py-2 px-1">
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
