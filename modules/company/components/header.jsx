"use client";
import React, { useEffect, useState } from "react";
import headerStyles from "./styles/header.module.scss";
import bannerBase from "@/components/shared/styles/bannerBase.module.scss";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { message } from "antd";
import Image from "next/image";
import { getLstorage, setLstorage } from "@/utils/universalUtils/windowMW";
import { imgUrls } from "@/utils/universalUtils/images";
import { useDispatch } from "react-redux";
import { getOneUser } from "@/redux/slices/company/user";
const Header = () => {
  const userCreds = useSelector((state) => state.user.singleUser);
  const path = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();

  const [greeting, setGreeting] = useState("Good Evening");
  const [currentDate, setCurrentDate] = useState("");

  const nav = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = new Date().toLocaleDateString('en-US', options).toUpperCase();
    setCurrentDate(dateStr);

    // First try localStorage, then fall back to URL param (handles Edge Tracking Prevention)
    let token = getLstorage("token");

    if (!token) {
      // SessionBridge may not have run yet, or storage was blocked — read directly from URL
      const urlToken = searchParams.get("token");
      if (urlToken) {
        token = urlToken;
        // Attempt to persist for subsequent navigations
        try { setLstorage("token", urlToken); } catch (_) { }
      }
    }

    if (!token) {
      const loginUrl = process.env.NEXT_PUBLIC_LOGIN_APP_URL || "http://localhost:2025";
      window.location.href = `${loginUrl}?portal=company`;
    } else {
      dispatch(getOneUser());
    }
  }, []);

  return (
    <div className={headerStyles.dashboardBanner}>
      <div className={headerStyles.leftContent}>
        <span className={headerStyles.avatar}>
          {userCreds?.companyLogo ? (
            <img
              src={userCreds?.companyLogo}
              alt="logo"
              className={headerStyles?.profileImage}
            />
          ) : (
            (userCreds?.companyName || userCreds?.userName || "A")
              .charAt(0)
              .toUpperCase()
          )}
        </span>
        <div className={headerStyles.textContent}>
          <div className={headerStyles.dashboardTitle}>COMPANY DASHBOARD</div>
          <div className={headerStyles.greeting}>
            Hi {userCreds?.companyName || userCreds?.userName || "Alphabet"}, {greeting} — here's what's happening with your jobs!
          </div>
        </div>
      </div>

      <div className={headerStyles.rightContent}>
        <div className={headerStyles.dateText}>{currentDate}</div>
        <button className={headerStyles.upgradeButton}>
          <span className={headerStyles.starsIcon}>✨</span> Upgrade Plan
        </button>
        <div className={headerStyles.notificationIconWrapper}>
          <Image
            src={imgUrls.BellIcon}
            alt="Notification Icon"
            className={headerStyles.notificationIcon}
          />
          <span className={headerStyles.notificationDot}></span>
        </div>
      </div>
    </div>
  );
};

export default Header;
