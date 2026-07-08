"use client";
import React, { useEffect, useState } from "react";
import { BsX, BsPlus, BsStar } from "react-icons/bs";
import { FaShieldAlt, FaEye } from "react-icons/fa";
import { FaCrown } from "react-icons/fa6";
import { useSelector } from "react-redux";
import { usePathname } from "next/navigation";

const AdminBanner = () => {
  const [mounted, setMounted] = useState(false);
  const { value } = useSelector((s) => s.adminAuth?.user || {});
  const userDetails = value?.user;
  const userName = userDetails?.fullname || userDetails?.username || "";
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const role = userDetails?.role?.toLowerCase() || "admin";
  const roleConfig = {
    admin: <FaCrown className="text-[1.2em] text-[#FFD700]" />,
    moderator: <FaShieldAlt className="text-[1.2em] text-green-500" />,
    viewer: <FaEye className="text-[1.2em] text-gray-400" />,
  };
  const roleIcon = roleConfig[role] || roleConfig.admin;

  const isDashboard = !pathname || pathname.includes("/dashboard");

  const getSectionContent = () => {
    if (isDashboard) {
      return {
        greeting: mounted && userName ? `Hi ${userName.charAt(0).toUpperCase() + userName.slice(1)},` : "Hi,",
        title: `${mounted ? getGreetingTime() : "Welcome"}! Let's manage SkillMedha today.`,
      };
    }
    if (pathname.includes("/course")) return { title: "Course Management" };
    if (pathname.includes("/users")) return { title: "User Management" };
    if (pathname.includes("/internship")) return { title: "Internships" };
    if (pathname.includes("/colleges")) return { title: "Colleges" };
    if (pathname.includes("/companies")) return { title: "Companies" };
    if (pathname.includes("/practice")) return { title: "Practice Module" };
    if (pathname.includes("/questionManager")) return { title: "Question Manager" };
    if (pathname.includes("/liveLect")) return { title: "Live Lectures" };
    if (pathname.includes("/payment")) return { title: "Payments" };
    if (pathname.includes("/workshops")) return { title: "Workshops" };
    if (pathname.includes("/website-newsflash")) return { title: "Newsflash" };
    if (pathname.includes("/organisationDetails")) return { title: "Organisation" };

    return { title: "Admin Panel" };
  };

  const { greeting, title } = getSectionContent();

  const coursesData = useSelector((state) => state.adminInternship?.allCourses?.data);
  const internshipsData = useSelector((state) => state.adminInternship?.allInternShips?.data);
  const workshopsData = useSelector((state) => state.adminInternship?.allWorkshops?.data);

  const getSectionStats = () => {
    if (!pathname) return null;
    if (pathname.includes("/course")) return { count: coursesData?.length || 0, label: "COURSES" };
    if (pathname.includes("/internship")) return { count: internshipsData?.length || 0, label: "INTERNSHIPS" };
    if (pathname.includes("/workshops")) return { count: workshopsData?.length || 0, label: "WORKSHOPS" };
    return null;
  };
  
  const stats = getSectionStats();

  return (
    <div className="w-full h-auto min-h-[140px] flex justify-between items-center p-4 lg:px-8 lg:py-6 border-b-[1px] border-white/10 shadow-sm rounded-2xl lg:rounded-none bg-gradient-to-br from-[#071631] to-[#10254c] text-white shrink-0 relative overflow-hidden z-[2]">
      {/* Decorative Icons */}
      <div className="absolute inset-0 pointer-events-none z-[1]">
        <BsX className="absolute top-[20%] right-[10%] text-[#1E69DA] opacity-60 text-[1.2rem]" />
        <BsPlus className="absolute bottom-[20%] right-[30%] text-[#1E69DA] opacity-50 text-[1.5rem]" />
        <BsStar className="absolute top-[40%] right-[50%] text-[#1E69DA] opacity-50 text-[1.1rem]" />
        <BsX className="absolute bottom-[30%] right-[5%] text-[#1E69DA] opacity-60 text-[1.3rem]" />
      </div>

      {/* Left Column (Greeting) */}
      <div className="flex flex-col justify-center items-start gap-2 relative z-[2]">
        {isDashboard && (
          <p className="text-[18px] lg:text-[24px] font-bold text-white m-0">
            {greeting}
          </p>
        )}
        <p className="text-[18px] lg:text-[28px] font-bold text-white m-0 tracking-tight flex items-center">
          {title}
        </p>
      </div>

      {/* Right Column (Date + Role Card) */}
      {isDashboard && (
        <div className="flex flex-col justify-center items-end gap-3 relative z-[2]">
          <div className="text-[11px] lg:text-[13px] font-bold tracking-[0.5px] uppercase text-[#cbd5e1] mb-1">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>

          {/* Role Badge */}
          <div className="flex items-center gap-3">
            <div className="text-[18px] lg:text-[28px] flex items-center justify-center">
              {roleIcon}
            </div>
            <span className="text-[18px] lg:text-[28px] font-bold uppercase text-white tracking-[0.05em] m-0">
              {userDetails?.role || "ADMIN"}
            </span>
          </div>
        </div>
      )}

      {/* Right Column (Stats) */}
      {stats && (
        <div className="flex items-center text-white mr-2 lg:mr-8 relative z-[2]">
          <div className="flex flex-col items-center">
            <span className="text-[28px] lg:text-[32px] font-bold leading-none text-white">{stats.count}</span>
            <span className="text-[10px] text-white/70 tracking-widest uppercase mt-1">TOTAL {stats.label}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBanner;
