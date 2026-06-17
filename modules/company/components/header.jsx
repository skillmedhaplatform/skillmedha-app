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
import { getOneUser } from "@/redux/slices/admin/cms/user";
const Header = () => {
  const userCreds = useSelector((state) => state.user.singleUser);
  const path = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();

  const [userName, setUserName] = useState("Teja Karri");
  const nav = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
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
      window.location.href = "/login?portal=company";
    } else {
      dispatch(getOneUser());
    }
  }, []);
  // function devtoolIsOpening() {
  //   console.clear();
  //   let before = new Date().getTime();
  //   debugger;
  //   let after = new Date().getTime();
  //   if (after - before > 200 && window !== undefined) {
  //     // document.write(" Dont open Developer Tools.");
  //     window.location.replace(WebsiteURL);
  //   }
  //   setTimeout(devtoolIsOpening, 100);
  // }
  // devtoolIsOpening();

  return (
    <div className={`${bannerBase.bannerBase} ${headerStyles.headerContainer}`}>
      <div className={headerStyles.icon}>
        <img
          src="https://res.cloudinary.com/dug3awue8/image/upload/v1744626297/icon_dtclq9.svg"
          alt="Synsper Logo"
          onClick={() => nav.replace("/")}
        />
        <div className={headerStyles.logoText} onClick={() => nav.replace("/")}>
          S K I L L <span> M E D H A</span>
        </div>
      </div>

      <div className={headerStyles.credsCon}>
        <button className={headerStyles.upgradeButton}>Upgrade Plan</button>
        <Image
          src={imgUrls.BellIcon}
          alt="Notification Icon"
          className={headerStyles.notificationIcon}
        />

        <p>
          {userCreds?.companyName?.toUpperCase() ||
            userCreds?.userName?.toUpperCase()}
        </p>

        <span className={headerStyles.avatar}>
          {userCreds?.companyLogo ? (
            <img
              src={userCreds?.companyLogo}
              alt="logo"
              className={headerStyles?.profileImage}
            />
          ) : (
            userCreds?.userName
              ?.split(" ")
              ?.map((word, i) => (i < 2 ? word[0].toUpperCase() : ""))
              ?.join(" ")
          )}
        </span>
      </div>
    </div>
  );
};

export default Header;
